/**
 * @fileoverview Utilidad de envío de emails para el backend del metaverso
 * @module backend/src/utils/email
 */

import nodemailer from 'nodemailer';
import fs from 'fs-extra';
import path from 'path';

/**
 * Interfaz para configuración de email
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Interfaz para datos de email
 */
export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Clase para manejo de emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, '../templates/emails');
    
    // Configurar transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  /**
   * Enviar email
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Cargar template
      const html = await this.loadTemplate(data.template, data.data);
      
      // Configurar opciones de email
      const mailOptions = {
        from: `"Metaverso" <${process.env.SMTP_USER}>`,
        to: data.to,
        subject: data.subject,
        html,
        attachments: data.attachments
      };

      // Enviar email
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email enviado:', {
        to: data.to,
        subject: data.subject,
        messageId: result.messageId
      });

      return true;

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  /**
   * Cargar template de email
   */
  private async loadTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');

      // Reemplazar variables en el template
      template = this.replaceVariables(template, data);

      return template;

    } catch (error) {
      console.error(`Error cargando template ${templateName}:`, error);
      
      // Template de fallback
      return this.getFallbackTemplate(templateName, data);
    }
  }

  /**
   * Reemplazar variables en template
   */
  private replaceVariables(template: string, data: Record<string, any>): string {
    let result = template;

    // Reemplazar variables {{variable}}
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    // Reemplazar variables de configuración
    const configVars = {
      '{{APP_NAME}}': 'Metaverso',
      '{{APP_URL}}': process.env.FRONTEND_URL || 'https://metaverso.com',
      '{{SUPPORT_EMAIL}}': process.env.SUPPORT_EMAIL || 'support@metaverso.com',
      '{{CURRENT_YEAR}}': new Date().getFullYear().toString()
    };

    for (const [key, value] of Object.entries(configVars)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }

    return result;
  }

  /**
   * Template de fallback
   */
  private getFallbackTemplate(templateName: string, data: Record<string, any>): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{APP_NAME}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{APP_NAME}}</h1>
          </div>
          <div class="content">
            <h2>${this.getTemplateTitle(templateName)}</h2>
            <p>${this.getTemplateContent(templateName, data)}</p>
          </div>
          <div class="footer">
            <p>&copy; {{CURRENT_YEAR}} {{APP_NAME}}. Todos los derechos reservados.</p>
            <p>Si tienes preguntas, contacta a <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.replaceVariables(baseTemplate, data);
  }

  /**
   * Obtener título del template
   */
  private getTemplateTitle(templateName: string): string {
    const titles: Record<string, string> = {
      'email-verification': 'Verifica tu email',
      'password-reset': 'Reset de contraseña',
      'welcome': '¡Bienvenido al Metaverso!',
      'account-update': 'Actualización de cuenta',
      'security-alert': 'Alerta de seguridad',
      'newsletter': 'Newsletter del Metaverso'
    };

    return titles[templateName] || 'Notificación del Metaverso';
  }

  /**
   * Obtener contenido del template
   */
  private getTemplateContent(templateName: string, data: Record<string, any>): string {
    switch (templateName) {
      case 'email-verification':
        return `
          Hola ${data.firstName || 'Usuario'},<br><br>
          Gracias por registrarte en el Metaverso. Para completar tu registro, 
          por favor verifica tu dirección de email haciendo clic en el siguiente enlace:<br><br>
          <a href="${data.verificationUrl}" class="button">Verificar Email</a><br><br>
          Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:<br>
          ${data.verificationUrl}<br><br>
          Este enlace expirará en 24 horas.
        `;

      case 'password-reset':
        return `
          Hola ${data.firstName || 'Usuario'},<br><br>
          Has solicitado resetear tu contraseña. Haz clic en el siguiente enlace 
          para crear una nueva contraseña:<br><br>
          <a href="${data.resetUrl}" class="button">Resetear Contraseña</a><br><br>
          Si no solicitaste este cambio, puedes ignorar este email.<br><br>
          Este enlace expirará en 1 hora.
        `;

      case 'welcome':
        return `
          ¡Hola ${data.firstName || 'Usuario'}!<br><br>
          ¡Bienvenido al Metaverso! Tu cuenta ha sido creada exitosamente.<br><br>
          Ya puedes comenzar a explorar, crear y compartir contenido en nuestro 
          ecosistema descentralizado.<br><br>
          <a href="${data.dashboardUrl || '#'}" class="button">Ir al Dashboard</a>
        `;

      case 'account-update':
        return `
          Hola ${data.firstName || 'Usuario'},<br><br>
          Tu cuenta ha sido actualizada exitosamente.<br><br>
          Cambios realizados: ${data.changes || 'Información de perfil'}<br><br>
          Si no realizaste estos cambios, contacta inmediatamente a nuestro equipo de soporte.
        `;

      case 'security-alert':
        return `
          Hola ${data.firstName || 'Usuario'},<br><br>
          Hemos detectado actividad inusual en tu cuenta:<br><br>
          <strong>Detalles:</strong><br>
          - Fecha: ${data.date || new Date().toLocaleString()}<br>
          - IP: ${data.ip || 'Desconocida'}<br>
          - Ubicación: ${data.location || 'Desconocida'}<br><br>
          Si no fuiste tú, cambia inmediatamente tu contraseña y contacta a soporte.
        `;

      default:
        return `
          Hola ${data.firstName || 'Usuario'},<br><br>
          Has recibido una notificación del Metaverso.<br><br>
          ${data.message || 'No hay mensaje específico.'}
        `;
    }
  }

  /**
   * Enviar email de verificación
   */
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Verifica tu email - Metaverso',
      template: 'email-verification',
      data: {
        firstName,
        verificationUrl
      }
    });
  }

  /**
   * Enviar email de reset de contraseña
   */
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset de contraseña - Metaverso',
      template: 'password-reset',
      data: {
        firstName,
        resetUrl
      }
    });
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(email: string, firstName: string, dashboardUrl?: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido al Metaverso!',
      template: 'welcome',
      data: {
        firstName,
        dashboardUrl
      }
    });
  }

  /**
   * Enviar alerta de seguridad
   */
  async sendSecurityAlert(email: string, firstName: string, alertData: {
    date: string;
    ip: string;
    location: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Alerta de seguridad - Metaverso',
      template: 'security-alert',
      data: {
        firstName,
        ...alertData
      }
    });
  }

  /**
   * Enviar newsletter
   */
  async sendNewsletter(emails: string[], newsletterData: {
    title: string;
    content: string;
    ctaUrl?: string;
    ctaText?: string;
  }): Promise<boolean> {
    const promises = emails.map(email => 
      this.sendEmail({
        to: email,
        subject: newsletterData.title,
        template: 'newsletter',
        data: {
          title: newsletterData.title,
          content: newsletterData.content,
          ctaUrl: newsletterData.ctaUrl,
          ctaText: newsletterData.ctaText
        }
      })
    );

    const results = await Promise.all(promises);
    return results.every(result => result);
  }

  /**
   * Verificar configuración de email
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Configuración de email verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando configuración de email:', error);
      return false;
    }
  }
}

// Instancia del servicio
export const emailService = new EmailService();

// Función de conveniencia
export const sendEmail = async (data: EmailData): Promise<boolean> => {
  return emailService.sendEmail(data);
};

export default emailService; 