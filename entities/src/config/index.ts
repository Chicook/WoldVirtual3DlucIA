/**
 * Configuración del Sistema de Entidades
 */

import { EntitySystemConfig } from '../types';

export const defaultConfig: EntitySystemConfig = {
  uri: {
    schemes: ['http', 'https', 'ws', 'wss', 'metaverso'],
    validation: {
      strict: true,
      allowRelative: false,
      maxLength: 2048
    },
    normalization: {
      enabled: true,
      caseSensitive: false
    }
  },
  blockchain: {
    enabled: true,
    network: 'polygon',
    provider: 'https://polygon-rpc.com',
    gasLimit: 3000000,
    confirmations: 3,
    timeout: 30000
  },
  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 1000,
    strategy: 'lru',
    persistence: false
  },
  sync: {
    enabled: true,
    interval: 5000,
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 1000
  },
  security: {
    validation: {
      enabled: true,
      strict: true
    },
    sanitization: {
      enabled: true,
      level: 'medium'
    },
    accessControl: {
      enabled: true,
      defaultPolicy: 'deny'
    }
  },
  performance: {
    maxEntities: 10000,
    maxMetadataSize: 1024 * 1024, // 1MB
    compression: true,
    lazyLoading: true,
    backgroundSync: true
  }
}; 