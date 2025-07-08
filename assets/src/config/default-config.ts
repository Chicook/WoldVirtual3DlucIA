/**
 * @fileoverview Configuración por defecto del sistema avanzado de assets
 */

import { SystemConfig } from '../AssetsSystemAdvanced';

export const defaultConfig: SystemConfig = {
  uploaders: {
    ipfs: true,
    arweave: false,
    aws: false,
    local: true
  },
  compressors: {
    gzip: true,
    brotli: false,
    lz4: false
  },
  optimizers: {
    image: true,
    audio: false,
    video: false,
    model3d: false
  },
  validators: {
    file: true,
    virus: false,
    integrity: true
  },
  performance: {
    maxConcurrentUploads: 5,
    maxConcurrentCompressions: 3,
    maxConcurrentOptimizations: 3,
    maxConcurrentValidations: 5,
    batchSize: 5
  }
};

export const productionConfig: SystemConfig = {
  uploaders: {
    ipfs: true,
    arweave: true,
    aws: true,
    local: false
  },
  compressors: {
    gzip: true,
    brotli: true,
    lz4: true
  },
  optimizers: {
    image: true,
    audio: true,
    video: true,
    model3d: true
  },
  validators: {
    file: true,
    virus: true,
    integrity: true
  },
  performance: {
    maxConcurrentUploads: 10,
    maxConcurrentCompressions: 5,
    maxConcurrentOptimizations: 5,
    maxConcurrentValidations: 10,
    batchSize: 10
  }
};

export const developmentConfig: SystemConfig = {
  uploaders: {
    ipfs: false,
    arweave: false,
    aws: false,
    local: true
  },
  compressors: {
    gzip: true,
    brotli: false,
    lz4: false
  },
  optimizers: {
    image: true,
    audio: false,
    video: false,
    model3d: false
  },
  validators: {
    file: true,
    virus: false,
    integrity: true
  },
  performance: {
    maxConcurrentUploads: 2,
    maxConcurrentCompressions: 1,
    maxConcurrentOptimizations: 1,
    maxConcurrentValidations: 2,
    batchSize: 3
  }
};

export function getConfig(environment: 'development' | 'production' | 'default' = 'default'): SystemConfig {
  switch (environment) {
    case 'development':
      return developmentConfig;
    case 'production':
      return productionConfig;
    default:
      return defaultConfig;
  }
} 