/**
 * @fileoverview Configuración principal de la aplicación del metaverso
 * @module backend/src/app
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { json, urlencoded } from 'body-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Importaciones locales
import { apiRouter } from './apis';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { healthCheck } from './monitoring/health';
import { Logger } from './monitoring/logger';
import { setupWebSocket } from './utils/websocket';

// Configuración
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = new Logger('App');

/**
 * Crea y configura la aplicación Express
 */
export async function createServer(): Promise<express.Application> {
  const app = express();

  // 1. Configurar middleware de seguridad
  setupSecurityMiddleware(app);

  // 2. Configurar middleware de parsing
  setupParsingMiddleware(app);

  // 3. Configurar middleware de logging
  setupLoggingMiddleware(app);

  // 4. Configurar middleware de rate limiting
  setupRateLimiting(app);

  // 5. Configurar middleware de compresión
  setupCompression(app);

  // 6. Configurar rutas
  setupRoutes(app);

  // 7. Configurar manejo de errores
  setupErrorHandling(app);

  // 8. Configurar WebSocket
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  setupWebSocket(io);

  logger.success('✅ Aplicación configurada correctamente');

  return app;
}

/**
 * Configura middleware de seguridad
 */
function setupSecurityMiddleware(app: express.Application): void {
  logger.info('🛡️ Configurando middleware de seguridad...');

  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS
  const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  };
  app.use(cors(corsOptions));

  // Prevenir clickjacking
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  logger.success('✅ Middleware de seguridad configurado');
}

/**
 * Configura middleware de parsing
 */
function setupParsingMiddleware(app: express.Application): void {
  logger.info('📝 Configurando middleware de parsing...');

  // Parse JSON
  app.use(json({
    limit: process.env.JSON_LIMIT || '10mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // Parse URL encoded
  app.use(urlencoded({
    extended: true,
    limit: process.env.URL_ENCODED_LIMIT || '10mb'
  }));

  // Parse multipart/form-data para archivos
  // app.use(multer().any()); // Configurar según necesidades

  logger.success('✅ Middleware de parsing configurado');
}

/**
 * Configura middleware de logging
 */
function setupLoggingMiddleware(app: express.Application): void {
  logger.info('📊 Configurando middleware de logging...');

  // Morgan para logging de requests
  const morganFormat = NODE_ENV === 'development' ? 'dev' : 'combined';
  app.use(morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));

  // Logging personalizado para requests importantes
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, url, statusCode } = req;
      
      if (statusCode >= 400) {
        logger.warn(`HTTP ${method} ${url} - ${statusCode} (${duration}ms)`);
      } else {
        logger.info(`HTTP ${method} ${url} - ${statusCode} (${duration}ms)`);
      }
    });
    
    next();
  });

  logger.success('✅ Middleware de logging configurado');
}

/**
 * Configura rate limiting
 */
function setupRateLimiting(app: express.Application): void {
  logger.info('🚦 Configurando rate limiting...');

  // Rate limiting general
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // máximo 100 requests por ventana
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Saltar rate limiting para health checks
      return req.path === '/health' || req.path === '/health/ready';
    }
  });

  app.use(generalLimiter);

  // Rate limiting específico para autenticación
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por ventana
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true
  });

  app.use('/api/auth', authLimiter);

  // Rate limiting para APIs de blockchain
  const blockchainLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // máximo 30 requests por minuto
    message: {
      error: 'Too many blockchain requests, please try again later.',
      retryAfter: '1 minute'
    }
  });

  app.use('/api/blockchain', blockchainLimiter);

  logger.success('✅ Rate limiting configurado');
}

/**
 * Configura compresión
 */
function setupCompression(app: express.Application): void {
  logger.info('🗜️ Configurando compresión...');

  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  logger.success('✅ Compresión configurada');
}

/**
 * Configura rutas de la aplicación
 */
function setupRoutes(app: express.Application): void {
  logger.info('🛣️ Configurando rutas...');

  // Health check
  app.get('/health', healthCheck);
  app.get('/health/ready', healthCheck);
  app.get('/health/live', healthCheck);

  // API documentation
  if (NODE_ENV === 'development') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/api/swagger.json',
        explorer: true
      }
    }));
    
    app.get('/api/swagger.json', (req, res) => {
      res.json({
        openapi: '3.0.0',
        info: {
          title: 'Metaverso API',
          version: '1.0.0',
          description: 'API del Metaverso Crypto World Virtual 3D'
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Development server'
          }
        ],
        paths: {
          // Aquí se definirían las rutas de la API
        }
      });
    });
  }

  // API routes
  app.use('/api', apiRouter);

  // Static files (si es necesario)
  if (NODE_ENV === 'production') {
    app.use(express.static('public'));
  }

  // Catch-all para rutas no encontradas
  app.use('*', notFoundHandler);

  logger.success('✅ Rutas configuradas');
}

/**
 * Configura manejo de errores
 */
function setupErrorHandling(app: express.Application): void {
  logger.info('🚨 Configurando manejo de errores...');

  // Error handler global
  app.use(errorHandler);

  // Manejo de errores no capturados
  process.on('uncaughtException', (error) => {
    logger.error('❌ Error no capturado:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Promesa rechazada no manejada:', { reason, promise });
    process.exit(1);
  });

  logger.success('✅ Manejo de errores configurado');
}

/**
 * Configura WebSocket
 */
function setupWebSocket(io: SocketIOServer): void {
  logger.info('🔌 Configurando WebSocket...');

  io.on('connection', (socket) => {
    logger.info(`🔌 Cliente conectado: ${socket.id}`);

    // Unirse a sala del metaverso
    socket.on('join-metaverse', (data) => {
      const { worldId, avatarId } = data;
      socket.join(`world-${worldId}`);
      socket.join(`avatar-${avatarId}`);
      logger.info(`👤 Avatar ${avatarId} se unió al mundo ${worldId}`);
    });

    // Salir de sala del metaverso
    socket.on('leave-metaverse', (data) => {
      const { worldId, avatarId } = data;
      socket.leave(`world-${worldId}`);
      socket.leave(`avatar-${avatarId}`);
      logger.info(`👤 Avatar ${avatarId} salió del mundo ${worldId}`);
    });

    // Movimiento de avatar
    socket.on('avatar-move', (data) => {
      const { worldId, avatarId, position, rotation } = data;
      socket.to(`world-${worldId}`).emit('avatar-moved', {
        avatarId,
        position,
        rotation,
        timestamp: Date.now()
      });
    });

    // Chat en tiempo real
    socket.on('chat-message', (data) => {
      const { worldId, avatarId, message, type } = data;
      io.to(`world-${worldId}`).emit('chat-message', {
        avatarId,
        message,
        type,
        timestamp: Date.now()
      });
    });

    // Interacciones con objetos
    socket.on('interact', (data) => {
      const { worldId, avatarId, objectId, action } = data;
      socket.to(`world-${worldId}`).emit('interaction', {
        avatarId,
        objectId,
        action,
        timestamp: Date.now()
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      logger.info(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  logger.success('✅ WebSocket configurado');
}

/**
 * Configuración de desarrollo
 */
function setupDevelopment(app: express.Application): void {
  if (NODE_ENV === 'development') {
    logger.info('🔧 Configurando entorno de desarrollo...');

    // Hot reload
    if (process.env.HOT_RELOAD === 'true') {
      app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
      });
    }

    // Debug mode
    if (process.env.DEBUG === 'true') {
      app.use((req, res, next) => {
        logger.debug(`🔍 Request: ${req.method} ${req.url}`, {
          headers: req.headers,
          query: req.query,
          body: req.body
        });
        next();
      });
    }

    logger.success('✅ Entorno de desarrollo configurado');
  }
}

// Exportaciones
export { createServer }; 