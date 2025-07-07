/**
 * @fileoverview Router principal de APIs del metaverso
 * @module backend/src/apis
 */

import { Router } from 'express';
import { authRouter } from './auth';
import { metaversoRouter } from './metaverso';
import { blockchainRouter } from './blockchain';
import { economyRouter } from './economy';
import { socialRouter } from './social';
import { adminRouter } from './admin';
import { Logger } from '../monitoring/logger';

const router = Router();
const logger = new Logger('APIRouter');

/**
 * Configura todas las rutas de la API
 */
export function setupAPIRoutes(): Router {
  logger.info('🛣️ Configurando rutas de API...');

  // Middleware de logging para todas las rutas de API
  router.use((req, res, next) => {
    logger.info(`🌐 API Request: ${req.method} ${req.path}`, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    next();
  });

  // Rutas de autenticación
  router.use('/auth', authRouter);

  // Rutas del metaverso
  router.use('/metaverso', metaversoRouter);

  // Rutas de blockchain
  router.use('/blockchain', blockchainRouter);

  // Rutas de economía
  router.use('/economy', economyRouter);

  // Rutas sociales
  router.use('/social', socialRouter);

  // Rutas administrativas
  router.use('/admin', adminRouter);

  // Ruta de información de la API
  router.get('/', (req, res) => {
    res.json({
      name: 'Metaverso API',
      version: '1.0.0',
      description: 'API del Metaverso Crypto World Virtual 3D',
      endpoints: {
        auth: '/auth',
        metaverso: '/metaverso',
        blockchain: '/blockchain',
        economy: '/economy',
        social: '/social',
        admin: '/admin'
      },
      documentation: '/docs',
      health: '/health'
    });
  });

  // Ruta de versión
  router.get('/version', (req, res) => {
    res.json({
      version: '1.0.0',
      build: process.env.BUILD_ID || 'dev',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Ruta de estado
  router.get('/status', (req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });

  logger.success('✅ Rutas de API configuradas');
  return router;
}

// Router principal exportado
export const apiRouter = setupAPIRoutes();

// Exportaciones de módulos específicos
export * from './auth';
export * from './metaverso';
export * from './blockchain';
export * from './economy';
export * from './social';
export * from './admin'; 