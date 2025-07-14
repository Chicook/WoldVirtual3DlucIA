/**
 * @fileoverview Configuración por defecto del sistema de fuentes
 * @module @metaverso/fonts/config
 */

import { FontSystemConfig } from '../types';

/**
 * Configuración por defecto del sistema de fuentes
 */
export const defaultConfig: FontSystemConfig = {
  ipfs: {
    enabled: true,
    gateway: 'https://ipfs.io',
    timeout: 30000,
    retries: 3,
    pinning: true
  },
  cache: {
    enabled: true,
    ttl: 3600, // 1 hora
    maxSize: 100, // 100 fuentes en cache
    strategy: 'lru',
    persistence: true
  },
  optimization: {
    enabled: true,
    compression: 'woff2',
    subsetting: true,
    quality: 'high',
    hinting: true,
    kerning: true
  },
  rendering: {
    antialiasing: true,
    hinting: true,
    kerning: true,
    ligatures: true,
    subpixel: true,
    gamma: 2.2
  },
  accessibility: {
    highContrast: false,
    dyslexia: false,
    screenReader: true,
    fontSize: 16,
    lineHeight: 1.5
  },
  security: {
    verification: true,
    integrity: true,
    license: true,
    sandbox: true
  }
};

/**
 * Configuración para desarrollo
 */
export const developmentConfig: Partial<FontSystemConfig> = {
  cache: {
    enabled: false, // Deshabilitar cache en desarrollo
    ttl: 60,
    maxSize: 10,
    strategy: 'lru',
    persistence: false
  },
  optimization: {
    enabled: false, // Deshabilitar optimización en desarrollo
    compression: 'ttf',
    subsetting: false,
    quality: 'low',
    hinting: false,
    kerning: false
  },
  security: {
    verification: false, // Deshabilitar verificación en desarrollo
    integrity: false,
    license: false,
    sandbox: false
  }
};

/**
 * Configuración para producción
 */
export const productionConfig: Partial<FontSystemConfig> = {
  cache: {
    enabled: true,
    ttl: 7200, // 2 horas
    maxSize: 200,
    strategy: 'lru',
    persistence: true
  },
  optimization: {
    enabled: true,
    compression: 'woff2',
    subsetting: true,
    quality: 'high',
    hinting: true,
    kerning: true
  },
  security: {
    verification: true,
    integrity: true,
    license: true,
    sandbox: true
  }
};

/**
 * Configuración para pruebas
 */
export const testConfig: Partial<FontSystemConfig> = {
  ipfs: {
    enabled: false,
    gateway: 'http://localhost:8080',
    timeout: 5000,
    retries: 1,
    pinning: false
  },
  cache: {
    enabled: false,
    ttl: 0,
    maxSize: 0,
    strategy: 'lru',
    persistence: false
  },
  optimization: {
    enabled: false,
    compression: 'ttf',
    subsetting: false,
    quality: 'low',
    hinting: false,
    kerning: false
  },
  security: {
    verification: false,
    integrity: false,
    license: false,
    sandbox: false
  }
};

/**
 * Obtiene la configuración según el entorno
 */
export function getConfig(environment: 'development' | 'production' | 'test' = 'development'): FontSystemConfig {
  switch (environment) {
    case 'production':
      return { ...defaultConfig, ...productionConfig };
    case 'test':
      return { ...defaultConfig, ...testConfig };
    case 'development':
    default:
      return { ...defaultConfig, ...developmentConfig };
  }
}

/**
 * Valida una configuración
 */
export function validateConfig(config: Partial<FontSystemConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar IPFS
  if (config.ipfs?.enabled) {
    if (!config.ipfs.gateway) {
      errors.push('IPFS gateway is required when IPFS is enabled');
    }
    if (config.ipfs.timeout && config.ipfs.timeout < 1000) {
      errors.push('IPFS timeout must be at least 1000ms');
    }
  }

  // Validar cache
  if (config.cache?.enabled) {
    if (config.cache.ttl && config.cache.ttl < 0) {
      errors.push('Cache TTL must be positive');
    }
    if (config.cache.maxSize && config.cache.maxSize < 1) {
      errors.push('Cache max size must be at least 1');
    }
  }

  // Validar optimización
  if (config.optimization?.enabled) {
    const validFormats = ['woff2', 'woff', 'ttf'];
    if (config.optimization.compression && !validFormats.includes(config.optimization.compression)) {
      errors.push(`Invalid compression format. Must be one of: ${validFormats.join(', ')}`);
    }
  }

  // Validar renderizado
  if (config.rendering?.gamma && (config.rendering.gamma < 1 || config.rendering.gamma > 3)) {
    errors.push('Rendering gamma must be between 1 and 3');
  }

  // Validar accesibilidad
  if (config.accessibility?.fontSize && config.accessibility.fontSize < 8) {
    errors.push('Accessibility font size must be at least 8px');
  }
  if (config.accessibility?.lineHeight && config.accessibility.lineHeight < 1) {
    errors.push('Accessibility line height must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Fusiona configuraciones
 */
export function mergeConfig(
  base: FontSystemConfig,
  override: Partial<FontSystemConfig>
): FontSystemConfig {
  return {
    ipfs: { ...base.ipfs, ...override.ipfs },
    cache: { ...base.cache, ...override.cache },
    optimization: { ...base.optimization, ...override.optimization },
    rendering: { ...base.rendering, ...override.rendering },
    accessibility: { ...base.accessibility, ...override.accessibility },
    security: { ...base.security, ...override.security }
  };
} 