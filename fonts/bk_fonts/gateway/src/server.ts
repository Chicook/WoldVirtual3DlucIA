/**
 * @fileoverview Servidor principal del gateway del metaverso
 * @module @metaverso/gateway/server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { EventEmitter } from 'events';
import {
  GatewayConfig,
  HealthStatus,
  GatewayEvent,
  RequestEvent,
  ResponseEvent,
  ErrorEvent
} from './types';
import { defaultConfig } from './config';
import { Logger } from './utils/logger';
import { Metrics } from './utils/metrics';
import { APIGateway } from './api';
import { GraphQLMesh } from './federation';
import { DIDResolver } from './did';
import { IndexingService } from './indexing';
import { AuthMiddleware, RateLimitMiddleware } from './middleware';

/**
 * Servidor principal del gateway del metaverso
 */
export class GatewayServer extends EventEmitter {
  private app: express.Application;
  private server: any;
  private config: GatewayConfig;
  private logger: Logger;
  private metrics: Metrics;
  private apiGateway: APIGateway;
  private graphQLMesh: GraphQLMesh;
  private didResolver: DIDResolver;
  private indexingService: IndexingService;
  private initialized: boolean = false;
  private started: boolean = false;

  constructor(config?: Partial<GatewayConfig>) {
    super();
    this.config = { ...defaultConfig, ...config };
    this.app = express();
    this.logger = new Logger(this.config.monitoring.logging);
    this.metrics = new Metrics(this.config.monitoring);
  }

  /**
   * Inicializa el servidor del gateway
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.logger.info('Inicializando Gateway Server...');

      // Configurar middleware básico
      this.setupBasicMiddleware();

      // Configurar middleware de seguridad
      this.setupSecurityMiddleware();

      // Configurar middleware de monitoreo
      this.setupMonitoringMiddleware();

      // Inicializar componentes
      await this.initializeComponents();

      // Configurar rutas
      this.setupRoutes();

      // Configurar manejo de errores
      this.setupErrorHandling();

      // Crear servidor HTTP
      this.server = createServer(this.app);

      this.initialized = true;
      this.logger.info('Gateway Server inicializado correctamente');
      this.emit('initialized', { timestamp: Date.now() });

    } catch (error) {
      this.logger.error('Error al inicializar Gateway Server:', error);
      this.emit('error', { error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Inicia el servidor
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.started) {
      return;
    }

    try {
      const { port, host } = this.config.server;

      return new Promise((resolve, reject) => {
        this.server.listen(port, host, () => {
          this.started = true;
          this.logger.info(`Gateway Server iniciado en http://${host}:${port}`);
          this.emit('started', { port, host, timestamp: Date.now() });
          resolve();
        });

        this.server.on('error', (error: Error) => {
          this.logger.error('Error al iniciar servidor:', error);
          this.emit('error', { error, timestamp: Date.now() });
          reject(error);
        });
      });

    } catch (error) {
      this.logger.error('Error al iniciar servidor:', error);
      throw error;
    }
  }

  /**
   * Detiene el servidor
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    try {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.started = false;
          this.logger.info('Gateway Server detenido');
          this.emit('stopped', { timestamp: Date.now() });
          resolve();
        });
      });

    } catch (error) {
      this.logger.error('Error al detener servidor:', error);
      throw error;
    }
  }

  /**
   * Destruye el servidor y libera recursos
   */
  async destroy(): Promise<void> {
    try {
      await this.stop();

      // Destruir componentes
      if (this.apiGateway) {
        await this.apiGateway.destroy();
      }
      if (this.graphQLMesh) {
        await this.graphQLMesh.destroy();
      }
      if (this.didResolver) {
        await this.didResolver.destroy();
      }
      if (this.indexingService) {
        await this.indexingService.destroy();
      }

      this.initialized = false;
      this.removeAllListeners();
      this.logger.info('Gateway Server destruido');

    } catch (error) {
      this.logger.error('Error al destruir servidor:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado de salud del servidor
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = [];

    // Verificar servidor
    checks.push({
      name: 'server',
      status: this.started ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        port: this.config.server.port,
        host: this.config.server.host
      }
    });

    // Verificar componentes
    if (this.apiGateway) {
      const apiHealth = await this.apiGateway.getHealthStatus();
      checks.push(apiHealth);
    }

    if (this.graphQLMesh) {
      const meshHealth = await this.graphQLMesh.getHealthStatus();
      checks.push(meshHealth);
    }

    if (this.didResolver) {
      const didHealth = await this.didResolver.getHealthStatus();
      checks.push(didHealth);
    }

    if (this.indexingService) {
      const indexingHealth = await this.indexingService.getHealthStatus();
      checks.push(indexingHealth);
    }

    const overallStatus = checks.every(check => check.status === 'healthy') 
      ? 'healthy' 
      : checks.some(check => check.status === 'degraded') 
        ? 'degraded' 
        : 'unhealthy';

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Obtiene la aplicación Express
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Obtiene el servidor HTTP
   */
  getServer(): any {
    return this.server;
  }

  /**
   * Verifica si el servidor está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Verifica si el servidor está ejecutándose
   */
  isStarted(): boolean {
    return this.started;
  }

  // Métodos privados

  private setupBasicMiddleware(): void {
    // CORS
    this.app.use(cors(this.config.security.cors));

    // Compresión
    if (this.config.security.compression) {
      this.app.use(compression());
    }

    // Parse JSON
    this.app.use(express.json({ limit: '10mb' }));

    // Parse URL encoded
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy
    if (this.config.server.trustProxy) {
      this.app.set('trust proxy', true);
    }
  }

  private setupSecurityMiddleware(): void {
    // Helmet
    if (this.config.security.helmet) {
      this.app.use(helmet());
    }

    // Rate limiting
    this.app.use(RateLimitMiddleware.create(this.config.security.rateLimit));

    // Request logging
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      const requestEvent: RequestEvent = {
        type: 'request',
        timestamp: startTime,
        source: 'gateway',
        data: {
          method: req.method,
          url: req.url,
          headers: req.headers as Record<string, string>,
          body: req.body,
          ip: req.ip,
          userAgent: req.get('User-Agent') || ''
        }
      };
      
      this.emit('request', requestEvent);
      this.metrics.recordRequest(req.method, req.url);

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        const responseEvent: ResponseEvent = {
          type: 'response',
          timestamp: Date.now(),
          source: 'gateway',
          data: {
            statusCode: res.statusCode,
            responseTime,
            size: parseInt(res.get('Content-Length') || '0')
          }
        };
        
        this.emit('response', responseEvent);
        this.metrics.recordResponse(res.statusCode, responseTime);
      });

      next();
    });
  }

  private setupMonitoringMiddleware(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.getHealthStatus();
        res.json(health);
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Metrics endpoint
    if (this.config.monitoring.prometheus) {
      this.app.get('/metrics', (req, res) => {
        res.set('Content-Type', 'text/plain');
        res.send(this.metrics.getPrometheusMetrics());
      });
    }

    // Info endpoint
    this.app.get('/info', (req, res) => {
      res.json({
        name: '@metaverso/gateway',
        version: '1.0.0',
        status: this.started ? 'running' : 'stopped',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });
  }

  private async initializeComponents(): Promise<void> {
    // Inicializar API Gateway
    this.apiGateway = new APIGateway(this.config);
    await this.apiGateway.initialize();

    // Inicializar GraphQL Mesh si está habilitado
    if (this.config.federation.enabled) {
      this.graphQLMesh = new GraphQLMesh(this.config.federation);
      await this.graphQLMesh.initialize();
    }

    // Inicializar DID Resolver si está habilitado
    if (this.config.did.enabled) {
      this.didResolver = new DIDResolver(this.config.did);
      await this.didResolver.initialize();
    }

    // Inicializar Indexing Service si está habilitado
    if (this.config.indexing.enabled) {
      this.indexingService = new IndexingService(this.config.indexing);
      await this.indexingService.initialize();
    }
  }

  private setupRoutes(): void {
    // API Routes
    this.app.use('/api/v1', this.apiGateway.getRouter());

    // GraphQL endpoint
    if (this.graphQLMesh) {
      this.app.use('/graphql', this.graphQLMesh.getMiddleware());
    }

    // DID resolution endpoint
    if (this.didResolver) {
      this.app.use('/did', this.didResolver.getRouter());
    }

    // Indexing endpoint
    if (this.indexingService) {
      this.app.use('/indexing', this.indexingService.getRouter());
    }

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Metaverso Gateway API',
        version: '1.0.0',
        endpoints: {
          api: '/api/v1',
          graphql: '/graphql',
          did: '/did',
          health: '/health',
          metrics: '/metrics'
        }
      });
    });
  }

  private setupErrorHandling(): void {
    // Error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errorEvent: ErrorEvent = {
        type: 'error',
        timestamp: Date.now(),
        source: 'gateway',
        data: {
          error: error.message,
          stack: error.stack,
          context: {
            method: req.method,
            url: req.url,
            ip: req.ip
          }
        }
      };

      this.emit('error', errorEvent);
      this.logger.error('Error en gateway:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ha ocurrido un error interno',
          timestamp: new Date().toISOString()
        }
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint no encontrado',
          timestamp: new Date().toISOString()
        }
      });
    });
  }
} 