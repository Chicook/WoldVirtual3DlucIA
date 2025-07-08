/**
 * @fileoverview Servidor principal con funcionalidades avanzadas
 * @module backend/src/index
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { AppDataSource } from './database/connection';
import { Logger } from './utils/logger';
import assetRoutes from './routes/assetRoutes';
import { 
  errorHandler, 
  notFoundHandler, 
  jsonErrorHandler, 
  timeoutHandler, 
  rateLimitHandler 
} from './middleware/errorHandler';
import { getCacheStats } from './middleware/cache';

const logger = new Logger('Server');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y optimización
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middlewares de manejo de errores
app.use(jsonErrorHandler);
app.use(timeoutHandler(30000)); // 30 segundos
app.use(rateLimitHandler(100, 60000)); // 100 requests por minuto

// Logging de requests
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Endpoint de información del sistema
app.get('/api/info', (req, res) => {
  res.json({
    name: 'WoldVirtual3D Assets API',
    version: '1.0.0',
    description: 'API avanzada para gestión de assets 3D',
    features: [
      'CRUD completo de assets',
      'Búsqueda avanzada con filtros',
      'Sistema de caché',
      'Métricas y estadísticas',
      'Recomendaciones inteligentes',
      'Sistema de ratings',
      'Manejo robusto de errores'
    ],
    endpoints: {
      assets: '/api/assets',
      health: '/health',
      cache: '/api/cache/stats'
    }
  });
});

// Endpoint de estadísticas de caché
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de caché',
      error: error.message
    });
  }
});

// Rutas de la API
app.use('/api/assets', assetRoutes);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    logger.info('Base de datos conectada exitosamente');
    
    // Sincronizar esquemas en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize();
      logger.info('Esquemas de base de datos sincronizados');
    }
  } catch (error: any) {
    logger.error('Error conectando a la base de datos:', error);
    process.exit(1);
  }
}

// Función para iniciar el servidor
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API Info: http://localhost:${PORT}/api/info`);
      logger.info(`📁 Assets API: http://localhost:${PORT}/api/assets`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error: any) {
    logger.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  await AppDataSource.destroy();
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer(); 