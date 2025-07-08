import { Logger } from '../utils/Logger';
import { cacheManager } from '../cache/CacheManager';
import { databaseManager } from '../database/DatabaseManager';
import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import axios from 'axios';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  moduleName?: string;
  jobId?: string;
  userId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  error?: string;
  metadata: any;
}

export type NotificationChannel = 'email' | 'webhook' | 'slack' | 'websocket' | 'database';

export interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface SlackConfig {
  channel: string;
  text: string;
  attachments?: any[];
  blocks?: any[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  variables: string[];
}

export class NotificationService extends EventEmitter {
  private static instance: NotificationService;
  private logger: Logger;
  private emailTransporter?: nodemailer.Transporter;
  private templates: Map<string, NotificationTemplate> = new Map();
  private notificationQueue: Notification[] = [];

  private constructor() {
    super();
    this.logger = new Logger('NotificationService');
    this.initializeTemplates();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public static async initialize(): Promise<void> {
    const instance = NotificationService.getInstance();
    await instance.setupEmailTransporter();
    instance.startNotificationProcessor();
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'build-started',
        name: 'Build Iniciado',
        type: 'info',
        title: 'Build Iniciado',
        message: 'El build para el módulo {{moduleName}} ha sido iniciado.',
        channels: ['websocket', 'database'],
        priority: 'normal',
        variables: ['moduleName']
      },
      {
        id: 'build-completed',
        name: 'Build Completado',
        type: 'success',
        title: 'Build Completado',
        message: 'El build para el módulo {{moduleName}} se ha completado exitosamente en {{duration}}.',
        channels: ['websocket', 'database', 'email'],
        priority: 'normal',
        variables: ['moduleName', 'duration']
      },
      {
        id: 'build-failed',
        name: 'Build Fallido',
        type: 'error',
        title: 'Build Fallido',
        message: 'El build para el módulo {{moduleName}} ha fallado: {{error}}',
        channels: ['websocket', 'database', 'email', 'slack'],
        priority: 'high',
        variables: ['moduleName', 'error']
      },
      {
        id: 'queue-full',
        name: 'Cola Llena',
        type: 'warning',
        title: 'Cola de Builds Llena',
        message: 'La cola de builds está al {{percentage}}% de su capacidad máxima.',
        channels: ['websocket', 'database', 'slack'],
        priority: 'high',
        variables: ['percentage']
      },
      {
        id: 'system-error',
        name: 'Error del Sistema',
        type: 'error',
        title: 'Error del Sistema',
        message: 'Se ha producido un error en el sistema: {{error}}',
        channels: ['websocket', 'database', 'email', 'slack', 'webhook'],
        priority: 'urgent',
        variables: ['error']
      },
      {
        id: 'progress-update',
        name: 'Actualización de Progreso',
        type: 'info',
        title: 'Progreso Actualizado',
        message: 'El módulo {{moduleName}} ha alcanzado el {{progress}}% de completado.',
        channels: ['websocket'],
        priority: 'low',
        variables: ['moduleName', 'progress']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.logger.info(`Templates de notificación inicializados: ${templates.length} templates`);
  }

  private async setupEmailTransporter(): Promise<void> {
    try {
      if (process.env.EMAIL_ENABLED === 'true' && process.env.EMAIL_HOST) {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        // Verificar conexión
        await this.emailTransporter.verify();
        this.logger.success('Transporter de email configurado exitosamente');
      } else {
        this.logger.info('Email notifications deshabilitadas');
      }
    } catch (error) {
      this.logger.error('Error configurando transporter de email', error as Error);
    }
  }

  public async sendNotification(
    templateId: string,
    variables: Record<string, any>,
    channels?: NotificationChannel[],
    userId?: string
  ): Promise<string> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template de notificación no encontrado: ${templateId}`);
      }

      const notificationId = this.generateNotificationId();
      const title = this.replaceVariables(template.title, variables);
      const message = this.replaceVariables(template.message, variables);

      const notification: Notification = {
        id: notificationId,
        type: template.type,
        title,
        message,
        moduleName: variables.moduleName,
        jobId: variables.jobId,
        userId,
        priority: template.priority,
        channels: channels || template.channels,
        status: 'pending',
        createdAt: new Date(),
        metadata: variables
      };

      // Agregar a la cola
      this.notificationQueue.push(notification);

      // Guardar en base de datos
      await this.saveNotificationToDatabase(notification);

      this.emit('notification-created', { notification });
      this.logger.info(`Notificación creada: ${notificationId} - ${title}`);

      return notificationId;

    } catch (error) {
      this.logger.error(`Error enviando notificación con template: ${templateId}`, error as Error);
      throw error;
    }
  }

  public async sendCustomNotification(
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    channels: NotificationChannel[],
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    metadata: any = {},
    userId?: string
  ): Promise<string> {
    try {
      const notificationId = this.generateNotificationId();

      const notification: Notification = {
        id: notificationId,
        type,
        title,
        message,
        userId,
        priority,
        channels,
        status: 'pending',
        createdAt: new Date(),
        metadata
      };

      // Agregar a la cola
      this.notificationQueue.push(notification);

      // Guardar en base de datos
      await this.saveNotificationToDatabase(notification);

      this.emit('notification-created', { notification });
      this.logger.info(`Notificación personalizada creada: ${notificationId} - ${title}`);

      return notificationId;

    } catch (error) {
      this.logger.error('Error enviando notificación personalizada', error as Error);
      throw error;
    }
  }

  private startNotificationProcessor(): void {
    setInterval(async () => {
      await this.processNotificationQueue();
    }, 1000); // Procesar cada segundo
  }

  private async processNotificationQueue(): Promise<void> {
    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        if (!notification) break;

        await this.sendNotificationToChannels(notification);
      }
    } catch (error) {
      this.logger.error('Error procesando cola de notificaciones', error as Error);
    }
  }

  private async sendNotificationToChannels(notification: Notification): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            if (this.emailTransporter) {
              promises.push(this.sendEmailNotification(notification));
            }
            break;
          case 'webhook':
            promises.push(this.sendWebhookNotification(notification));
            break;
          case 'slack':
            promises.push(this.sendSlackNotification(notification));
            break;
          case 'websocket':
            promises.push(this.sendWebSocketNotification(notification));
            break;
          case 'database':
            // Ya está guardado en la base de datos
            break;
        }
      }

      await Promise.allSettled(promises);

      // Marcar como enviado
      notification.status = 'sent';
      notification.sentAt = new Date();
      await this.updateNotificationInDatabase(notification);

      this.emit('notification-sent', { notification });

    } catch (error) {
      this.logger.error(`Error enviando notificación: ${notification.id}`, error as Error);
      
      notification.status = 'failed';
      notification.error = (error as Error).message;
      await this.updateNotificationInDatabase(notification);

      this.emit('notification-failed', { notification, error });
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter no configurado');
      }

      const emailConfig: EmailConfig = {
        to: process.env.NOTIFICATION_EMAIL_TO || 'admin@woldvirtual.com',
        subject: `[WoldVirtual Build] ${notification.title}`,
        html: this.generateEmailHTML(notification),
        text: notification.message
      };

      await this.emailTransporter.sendMail(emailConfig);
      this.logger.debug(`Email enviado: ${notification.id}`);

    } catch (error) {
      this.logger.error(`Error enviando email: ${notification.id}`, error as Error);
      throw error;
    }
  }

  private async sendWebhookNotification(notification: Notification): Promise<void> {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('Webhook URL no configurada');
      }

      const webhookConfig: WebhookConfig = {
        url: webhookUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Notification-Type': notification.type,
          'X-Notification-Priority': notification.priority
        },
        body: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          moduleName: notification.moduleName,
          jobId: notification.jobId,
          userId: notification.userId,
          priority: notification.priority,
          createdAt: notification.createdAt,
          metadata: notification.metadata
        }
      };

      await axios(webhookConfig);
      this.logger.debug(`Webhook enviado: ${notification.id}`);

    } catch (error) {
      this.logger.error(`Error enviando webhook: ${notification.id}`, error as Error);
      throw error;
    }
  }

  private async sendSlackNotification(notification: Notification): Promise<void> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('Slack webhook URL no configurada');
      }

      const slackConfig: SlackConfig = {
        channel: process.env.SLACK_CHANNEL || '#builds',
        text: `*${notification.title}*\n${notification.message}`,
        attachments: [
          {
            color: this.getSlackColor(notification.type),
            fields: [
              {
                title: 'Módulo',
                value: notification.moduleName || 'N/A',
                short: true
              },
              {
                title: 'Prioridad',
                value: notification.priority,
                short: true
              }
            ],
            footer: 'WoldVirtual Build System',
            ts: Math.floor(notification.createdAt.getTime() / 1000)
          }
        ]
      };

      await axios.post(webhookUrl, slackConfig);
      this.logger.debug(`Slack notification enviada: ${notification.id}`);

    } catch (error) {
      this.logger.error(`Error enviando Slack notification: ${notification.id}`, error as Error);
      throw error;
    }
  }

  private async sendWebSocketNotification(notification: Notification): Promise<void> {
    try {
      // Esta función se implementará cuando se configure el WebSocket
      // Por ahora solo emitimos el evento
      this.emit('websocket-notification', { notification });
      this.logger.debug(`WebSocket notification preparada: ${notification.id}`);

    } catch (error) {
      this.logger.error(`Error enviando WebSocket notification: ${notification.id}`, error as Error);
      throw error;
    }
  }

  private getSlackColor(type: 'info' | 'success' | 'warning' | 'error'): string {
    switch (type) {
      case 'success': return 'good';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return '#36a64f';
    }
  }

  private generateEmailHTML(notification: Notification): string {
    const color = this.getEmailColor(notification.type);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notification.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${color}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">${notification.title}</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
            <p>${notification.message}</p>
            ${notification.moduleName ? `<p><strong>Módulo:</strong> ${notification.moduleName}</p>` : ''}
            ${notification.jobId ? `<p><strong>Job ID:</strong> ${notification.jobId}</p>` : ''}
            <p><strong>Prioridad:</strong> ${notification.priority}</p>
            <p><strong>Fecha:</strong> ${notification.createdAt.toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>WoldVirtual Build System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailColor(type: 'info' | 'success' | 'warning' | 'error'): string {
    switch (type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#17a2b8';
    }
  }

  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveNotificationToDatabase(notification: Notification): Promise<void> {
    try {
      const prisma = databaseManager.getClient();
      await prisma.notification.create({
        data: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          moduleName: notification.moduleName,
          jobId: notification.jobId,
          userId: notification.userId,
          priority: notification.priority,
          channels: notification.channels,
          status: notification.status,
          error: notification.error,
          metadata: notification.metadata,
          createdAt: notification.createdAt,
          sentAt: notification.sentAt
        }
      });
    } catch (error) {
      this.logger.error(`Error guardando notificación en base de datos: ${notification.id}`, error as Error);
    }
  }

  private async updateNotificationInDatabase(notification: Notification): Promise<void> {
    try {
      const prisma = databaseManager.getClient();
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: notification.status,
          error: notification.error,
          sentAt: notification.sentAt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Error actualizando notificación en base de datos: ${notification.id}`, error as Error);
    }
  }

  public async getNotifications(
    userId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      const prisma = databaseManager.getClient();
      const notifications = await prisma.notification.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return notifications.map(notif => ({
        id: notif.id,
        type: notif.type as any,
        title: notif.title,
        message: notif.message,
        moduleName: notif.moduleName,
        jobId: notif.jobId,
        userId: notif.userId,
        priority: notif.priority as any,
        channels: notif.channels as any,
        status: notif.status as any,
        createdAt: notif.createdAt,
        sentAt: notif.sentAt,
        error: notif.error,
        metadata: notif.metadata
      }));

    } catch (error) {
      this.logger.error('Error obteniendo notificaciones', error as Error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    try {
      this.logger.info('Cerrando servicio de notificaciones...');
      
      // Procesar notificaciones pendientes
      await this.processNotificationQueue();
      
      this.logger.success('Servicio de notificaciones cerrado');
      
    } catch (error) {
      this.logger.error('Error cerrando servicio de notificaciones', error as Error);
    }
  }
}

// Exportar instancia singleton
export const notificationService = NotificationService.getInstance(); 