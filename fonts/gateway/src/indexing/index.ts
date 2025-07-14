/**
 * @fileoverview Servicio de indexación para el metaverso
 * @module @metaverso/gateway/indexing
 */

import { Router } from 'express';
import { IndexingConfig, HealthStatus } from '../types';
import { Logger } from '../utils/logger';

/**
 * Servicio de indexación
 */
export class IndexingService {
  private router: Router;
  private config: IndexingConfig;
  private logger: Logger;
  private initialized: boolean = false;

  constructor(config: IndexingConfig) {
    this.config = config;
    this.router = Router();
    this.logger = new Logger({ level: 'info', format: 'json', transports: ['console'] });
  }

  /**
   * Inicializa el servicio de indexación
   */
  async initialize(): Promise<void> {
    this.setupRoutes();
    this.initialized = true;
    this.logger.info('Indexing Service inicializado');
  }

  /**
   * Obtiene el router de Express
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Obtiene el estado de salud
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return {
      name: 'indexing-service',
      status: this.initialized ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        enabled: this.config.enabled,
        batchSize: this.config.batchSize
      }
    };
  }

  /**
   * Destruye el servicio de indexación
   */
  async destroy(): Promise<void> {
    this.initialized = false;
    this.logger.info('Indexing Service destruido');
  }

  // Métodos privados

  private setupRoutes(): void {
    this.router.get('/status', (req, res) => {
      res.json({
        status: 'running',
        config: this.config
      });
    });
  }
} 