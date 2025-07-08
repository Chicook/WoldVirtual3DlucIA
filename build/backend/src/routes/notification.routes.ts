import { Router } from 'express';
import { notificationService } from '../services/NotificationService';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger('NotificationRoutes');

// GET /api/v1/notifications - Obtener notificaciones
router.get('/', async (req, res, next) => {
  try {
    const { userId, type, priority, status, limit = 50, offset = 0 } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });
    
    const total = await prisma.notification.count({ where });
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Math.floor(Number(offset) / Number(limit)) + 1,
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/:id - Obtener notificación específica
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/notifications - Enviar notificación personalizada
router.post('/', async (req, res, next) => {
  try {
    const {
      type,
      title,
      message,
      channels,
      priority = 'normal',
      metadata = {},
      userId
    } = req.body;
    
    if (!type || !title || !message || !channels) {
      return res.status(400).json({
        success: false,
        error: 'type, title, message y channels son requeridos'
      });
    }
    
    logger.info(`Enviando notificación personalizada: ${title}`);
    
    const notificationId = await notificationService.sendCustomNotification(
      type,
      title,
      message,
      channels,
      priority,
      metadata,
      userId
    );
    
    res.status(201).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: {
        notificationId,
        title,
        type,
        priority
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/notifications/template/:templateId - Enviar notificación usando template
router.post('/template/:templateId', async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { variables, channels, userId } = req.body;
    
    if (!variables) {
      return res.status(400).json({
        success: false,
        error: 'variables es requerido'
      });
    }
    
    logger.info(`Enviando notificación con template: ${templateId}`);
    
    const notificationId = await notificationService.sendNotification(
      templateId,
      variables,
      channels,
      userId
    );
    
    res.status(201).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: {
        notificationId,
        templateId,
        variables
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/templates - Obtener templates disponibles
router.get('/templates', async (req, res, next) => {
  try {
    const templates = [
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
    
    res.json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/templates/:id - Obtener template específico
router.get('/templates/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const templates = [
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
    
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/stats - Obtener estadísticas de notificaciones
router.get('/stats', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const [
      totalNotifications,
      sentNotifications,
      failedNotifications,
      pendingNotifications,
      typeStats,
      priorityStats
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'sent' } }),
      prisma.notification.count({ where: { status: 'failed' } }),
      prisma.notification.count({ where: { status: 'pending' } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { id: true }
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        _count: { id: true }
      })
    ]);
    
    const stats = {
      totalNotifications,
      sentNotifications,
      failedNotifications,
      pendingNotifications,
      successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications) * 100 : 0,
      typeDistribution: typeStats.map(stat => ({
        type: stat.type,
        count: stat._count.id
      })),
      priorityDistribution: priorityStats.map(stat => ({
        priority: stat.priority,
        count: stat._count.id
      })),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/notifications/:id - Eliminar notificación
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }
    
    await prisma.notification.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente',
      data: {
        notificationId: id
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/notifications/:id/retry - Reintentar notificación fallida
router.post('/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }
    
    if (notification.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden reintentar notificaciones fallidas'
      });
    }
    
    // Reintentar envío
    await notificationService.sendCustomNotification(
      notification.type as any,
      notification.title,
      notification.message,
      notification.channels as any,
      notification.priority as any,
      notification.metadata,
      notification.userId
    );
    
    res.json({
      success: true,
      message: 'Notificación reintentada exitosamente',
      data: {
        notificationId: id
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/notifications/clear - Limpiar notificaciones antiguas
router.post('/clear', async (req, res, next) => {
  try {
    const { days = 30, status } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));
    
    const where: any = {
      createdAt: {
        lt: cutoffDate
      }
    };
    
    if (status) {
      where.status = status;
    }
    
    const result = await prisma.notification.deleteMany({ where });
    
    res.json({
      success: true,
      message: 'Notificaciones limpiadas exitosamente',
      data: {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/channels - Obtener canales disponibles
router.get('/channels', async (req, res, next) => {
  try {
    const channels = [
      {
        id: 'email',
        name: 'Email',
        description: 'Envío de notificaciones por correo electrónico',
        enabled: process.env.EMAIL_ENABLED === 'true',
        config: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true'
        }
      },
      {
        id: 'webhook',
        name: 'Webhook',
        description: 'Envío de notificaciones a webhook externo',
        enabled: process.env.WEBHOOK_ENABLED === 'true',
        config: {
          url: process.env.WEBHOOK_URL
        }
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Envío de notificaciones a Slack',
        enabled: process.env.SLACK_ENABLED === 'true',
        config: {
          channel: process.env.SLACK_CHANNEL
        }
      },
      {
        id: 'websocket',
        name: 'WebSocket',
        description: 'Notificaciones en tiempo real por WebSocket',
        enabled: true,
        config: {}
      },
      {
        id: 'database',
        name: 'Base de Datos',
        description: 'Almacenamiento de notificaciones en base de datos',
        enabled: true,
        config: {}
      }
    ];
    
    res.json({
      success: true,
      data: channels
    });
    
  } catch (error) {
    next(error);
  }
});

export { router as notificationRoutes }; 