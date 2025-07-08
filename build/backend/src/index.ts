#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { Logger } from './utils/Logger';
import { DatabaseManager } from './database/DatabaseManager';
import { CacheManager } from './cache/CacheManager';
import { BuildProgressService } from './services/BuildProgressService';
import { BuildQueueService } from './services/BuildQueueService';
import { NotificationService } from './services/NotificationService';
import { routes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { config } from './config';

// Cargar variables de entorno
dotenv.config();

class BuildBackendServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private logger: Logger;
  private port: number;
  private isProduction: boolean;

  constructor() {
    this.logger = new Logger('BuildBackend');
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.isProduction = process.env.NODE_ENV === 'production';
    
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origins,
        methods: ['GET', 'POST']
      }
    });

    this.initializeMiddleware();
    this.initializeServices();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.logger.info('Inicializando middleware...');

    // Seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compresión
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por ventana
      message: {
        error: 'Demasiadas requests desde esta IP, intenta de nuevo más tarde.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Logging
    if (!this.isProduction) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Autenticación global (excepto para rutas públicas)
    this.app.use('/api/', authMiddleware);

    // Validación global
    this.app.use('/api/', validationMiddleware);

    this.logger.success('Middleware inicializado');
  }

  private async initializeServices(): Promise<void> {
    this.logger.info('Inicializando servicios...');

    try {
      // Inicializar base de datos
      await DatabaseManager.initialize();
      this.logger.success('Base de datos inicializada');

      // Inicializar cache
      await CacheManager.initialize();
      this.logger.success('Cache inicializado');

      // Inicializar servicios de build
      await BuildProgressService.initialize();
      this.logger.success('Servicio de progreso inicializado');

      await BuildQueueService.initialize();
      this.logger.success('Servicio de cola de builds inicializado');

      await NotificationService.initialize();
      this.logger.success('Servicio de notificaciones inicializado');

    } catch (error) {
      this.logger.error(`Error inicializando servicios: ${error}`);
      throw error;
    }
  }

  private initializeRoutes(): void {
    this.logger.info('Inicializando rutas...');

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1', routes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
      });
    });

    this.logger.success('Rutas inicializadas');
  }

  private initializeWebSocket(): void {
    this.logger.info('Inicializando WebSocket...');

    this.io.on('connection', (socket) => {
      this.logger.info(`Cliente conectado: ${socket.id}`);

      // Unirse a sala de progreso
      socket.on('join-progress', (data) => {
        socket.join('build-progress');
        this.logger.info(`Cliente ${socket.id} se unió a la sala de progreso`);
      });

      // Unirse a sala de notificaciones
      socket.on('join-notifications', (data) => {
        socket.join('notifications');
        this.logger.info(`Cliente ${socket.id} se unió a la sala de notificaciones`);
      });

      // Solicitar progreso actual
      socket.on('get-progress', async () => {
        try {
          const progress = await BuildProgressService.getCurrentProgress();
          socket.emit('progress-update', progress);
        } catch (error) {
          socket.emit('error', { message: 'Error obteniendo progreso' });
        }
      });

      // Solicitar estado de cola
      socket.on('get-queue-status', async () => {
        try {
          const queueStatus = await BuildQueueService.getQueueStatus();
          socket.emit('queue-status', queueStatus);
        } catch (error) {
          socket.emit('error', { message: 'Error obteniendo estado de cola' });
        }
      });

      socket.on('disconnect', () => {
        this.logger.info(`Cliente desconectado: ${socket.id}`);
      });
    });

    this.logger.success('WebSocket inicializado');
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
    this.logger.success('Manejo de errores inicializado');
  }

  public async start(): Promise<void> {
    try {
      this.server.listen(this.port, () => {
        this.logger.success(`🚀 Servidor backend iniciado en puerto ${this.port}`);
        this.logger.info(`📊 Health check: http://localhost:${this.port}/health`);
        this.logger.info(`🔌 WebSocket: ws://localhost:${this.port}`);
        this.logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      });

      // Configurar eventos de cierre graceful
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      this.logger.error(`Error iniciando servidor: ${error}`);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.info('Iniciando cierre graceful...');

    try {
      // Cerrar servidor HTTP
      this.server.close(() => {
        this.logger.info('Servidor HTTP cerrado');
      });

      // Cerrar WebSocket
      this.io.close(() => {
        this.logger.info('WebSocket cerrado');
      });

      // Cerrar conexiones de base de datos
      await DatabaseManager.close();
      this.logger.info('Conexiones de base de datos cerradas');

      // Cerrar cache
      await CacheManager.close();
      this.logger.info('Cache cerrado');

      // Cerrar servicios
      await BuildProgressService.close();
      await BuildQueueService.close();
      await NotificationService.close();
      this.logger.info('Servicios cerrados');

      this.logger.success('Cierre graceful completado');
      process.exit(0);

    } catch (error) {
      this.logger.error(`Error en cierre graceful: ${error}`);
      process.exit(1);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Iniciar servidor si es el archivo principal
if (require.main === module) {
  const server = new BuildBackendServer();
  server.start().catch((error) => {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  });
}

export { BuildBackendServer };