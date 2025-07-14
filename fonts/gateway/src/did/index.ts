/**
 * @fileoverview Resolución DID para el metaverso
 * @module @metaverso/gateway/did
 */

import { Router } from 'express';
import { DIDConfig, DIDResolutionResult, HealthStatus } from '../types';
import { Logger } from '../utils/logger';

/**
 * Resolutor de DIDs
 */
export class DIDResolver {
  private router: Router;
  private config: DIDConfig;
  private logger: Logger;
  private initialized: boolean = false;

  constructor(config: DIDConfig) {
    this.config = config;
    this.router = Router();
    this.logger = new Logger({ level: 'info', format: 'json', transports: ['console'] });
  }

  /**
   * Inicializa el resolutor DID
   */
  async initialize(): Promise<void> {
    this.setupRoutes();
    this.initialized = true;
    this.logger.info('DID Resolver inicializado');
  }

  /**
   * Obtiene el router de Express
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Resuelve un DID
   */
  async resolve(did: string): Promise<DIDResolutionResult> {
    // Implementación básica de resolución
    return {
      didDocument: null,
      didResolutionMetadata: {
        contentType: 'application/did+ld+json'
      },
      didDocumentMetadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    };
  }

  /**
   * Obtiene el estado de salud
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return {
      name: 'did-resolver',
      status: this.initialized ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        resolvers: this.config.resolvers,
        enabled: this.config.enabled
      }
    };
  }

  /**
   * Destruye el resolutor DID
   */
  async destroy(): Promise<void> {
    this.initialized = false;
    this.logger.info('DID Resolver destruido');
  }

  // Métodos privados

  private setupRoutes(): void {
    this.router.get('/:did', async (req, res) => {
      try {
        const { did } = req.params;
        const result = await this.resolve(did);
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: 'Error al resolver DID',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }
} 