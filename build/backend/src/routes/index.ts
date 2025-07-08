import { Router } from 'express';
import { buildRoutes } from './build.routes';
import { progressRoutes } from './progress.routes';
import { queueRoutes } from './queue.routes';
import { notificationRoutes } from './notification.routes';
import { systemRoutes } from './system.routes';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger('Routes');

// Middleware de logging para todas las rutas
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });
  next();
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'WoldVirtual Build Backend',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rutas de la API
router.use('/builds', buildRoutes);
router.use('/progress', progressRoutes);
router.use('/queue', queueRoutes);
router.use('/notifications', notificationRoutes);
router.use('/system', systemRoutes);

// Ruta de documentación
router.get('/docs', (req, res) => {
  res.json({
    name: 'WoldVirtual Build API',
    version: '1.0.0',
    description: 'API para el sistema de build de WoldVirtual 3D',
    endpoints: {
      '/health': 'GET - Health check del sistema',
      '/builds': 'Build management endpoints',
      '/progress': 'Progress tracking endpoints',
      '/queue': 'Queue management endpoints',
      '/notifications': 'Notification management endpoints',
      '/system': 'System management endpoints'
    },
    documentation: '/docs/swagger'
  });
});

// Middleware de manejo de errores para rutas
router.use((error: any, req: any, res: any, next: any) => {
  logger.error('Error en ruta', error);
  
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Error interno del servidor',
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  });
});

export { router as routes }; 