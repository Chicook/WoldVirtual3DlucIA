/**
 * @fileoverview Configuración por defecto del gateway del metaverso
 * @module @metaverso/gateway/config
 */

import { GatewayConfig } from '../types';

/**
 * Configuración por defecto del gateway
 */
export const defaultConfig: GatewayConfig = {
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000', 'https://metaverso.dev'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    },
    compression: true,
    trustProxy: true
  },
  redis: {
    url: 'redis://localhost:6379',
    password: undefined,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keyPrefix: 'metaverso:gateway:'
  },
  federation: {
    enabled: true,
    services: [
      {
        name: 'worlds',
        url: 'http://worlds-service:3001',
        timeout: 5000,
        retries: 3,
        healthCheck: true
      },
      {
        name: 'users',
        url: 'http://users-service:3002',
        timeout: 5000,
        retries: 3,
        healthCheck: true
      },
      {
        name: 'assets',
        url: 'http://assets-service:3003',
        timeout: 5000,
        retries: 3,
        healthCheck: true
      }
    ],
    mesh: {
      cache: true,
      introspection: true,
      playground: true,
      tracing: true,
      cacheControl: true
    },
    cache: true,
    timeout: 10000
  },
  did: {
    enabled: true,
    resolvers: ['ethr', 'web'],
    cache: true,
    timeout: 10000,
    ethereum: {
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      networkId: 1,
      registryAddress: '0xdca7ef03e98e0dc2b855be647c39abe984fc2445',
      gasLimit: 500000
    }
  },
  indexing: {
    enabled: true,
    batchSize: 100,
    interval: 5000,
    cache: true,
    elasticsearch: {
      url: 'http://localhost:9200',
      index: 'metaverso',
      username: undefined,
      password: undefined
    }
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por ventana
      message: 'Demasiadas solicitudes, intente más tarde',
      standardHeaders: true,
      legacyHeaders: false
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      expiresIn: '24h',
      issuer: 'metaverso-gateway',
      audience: 'metaverso-users'
    },
    cors: {
      origin: ['http://localhost:3000', 'https://metaverso.dev'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    },
    helmet: true,
    compression: true
  },
  monitoring: {
    enabled: true,
    prometheus: true,
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: '1.0.0'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      transports: ['console', 'file']
    }
  }
}; 