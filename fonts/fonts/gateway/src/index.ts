/**
 * @fileoverview Gateway del Metaverso - Punto de entrada principal
 * @module @metaverso/gateway
 * @version 1.0.0
 * @license MIT
 */

// Exportaciones principales
export { GatewayServer } from './server';
export { APIGateway } from './api';
export { GraphQLMesh } from './federation';
export { DIDResolver } from './did';
export { IndexingService } from './indexing';
export { AuthMiddleware, RateLimitMiddleware, ValidationMiddleware } from './middleware';

// Exportaciones de tipos
export type {
  GatewayConfig,
  APIConfig,
  FederationConfig,
  DIDConfig,
  IndexingConfig,
  SecurityConfig,
  RedisConfig
} from './types';

// Exportaciones de utilidades
export { GatewayUtils } from './utils';
export { Logger } from './utils/logger';
export { Metrics } from './utils/metrics';

// Exportaciones de configuración
export { defaultConfig } from './config';

// Versión del sistema
export const VERSION = '1.0.0';

// Información del sistema
export const SYSTEM_INFO = {
  name: '@metaverso/gateway',
  version: VERSION,
  description: 'API Federation & DID Resolution para Metaverso Web3',
  features: [
    'API Gateway descentralizado',
    'GraphQL Federation',
    'DID Resolution',
    'Indexación inteligente',
    'Cache distribuido',
    'Seguridad avanzada',
    'Monitoreo en tiempo real',
    'Rate limiting inteligente'
  ]
};

/**
 * Inicializa el gateway con configuración personalizada
 * @param config - Configuración del gateway
 * @returns Instancia del servidor gateway
 */
export async function initializeGateway(config?: Partial<GatewayConfig>): Promise<GatewayServer> {
  const gateway = new GatewayServer(config);
  await gateway.initialize();
  return gateway;
}

/**
 * Crea una instancia del gateway con configuración por defecto
 * @returns Instancia del servidor gateway
 */
export async function createDefaultGateway(): Promise<GatewayServer> {
  return initializeGateway();
}

/**
 * Verifica la compatibilidad del sistema
 * @returns Información de compatibilidad
 */
export function checkCompatibility(): {
  supported: boolean;
  features: Record<string, boolean>;
  warnings: string[];
} {
  const features: Record<string, boolean> = {
    node: typeof process !== 'undefined',
    redis: typeof require !== 'undefined' ? !!require('redis') : false,
    graphql: typeof require !== 'undefined' ? !!require('graphql') : false,
    express: typeof require !== 'undefined' ? !!require('express') : false,
    did: typeof require !== 'undefined' ? !!require('did-resolver') : false
  };

  const warnings: string[] = [];
  
  if (!features.redis) {
    warnings.push('Redis no está disponible - algunas funciones de cache pueden no funcionar');
  }
  
  if (!features.graphql) {
    warnings.push('GraphQL no está disponible - la federación puede no funcionar');
  }

  return {
    supported: Object.values(features).some(Boolean),
    features,
    warnings
  };
}

// Exportación por defecto
export default {
  GatewayServer,
  APIGateway,
  GraphQLMesh,
  DIDResolver,
  IndexingService,
  initializeGateway,
  createDefaultGateway,
  checkCompatibility,
  VERSION,
  SYSTEM_INFO
}; 