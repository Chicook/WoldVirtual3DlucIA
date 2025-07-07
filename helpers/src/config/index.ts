/**
 * @fileoverview Configuración por defecto del sistema de helpers
 * @module @metaverso/helpers/config
 */

import { HelpersConfig } from '../types';

/**
 * Configuración por defecto del sistema de helpers
 */
export const defaultConfig: HelpersConfig = {
  visualization: {
    enabled: true,
    showNormals: false,
    showBoundingBoxes: true,
    showWireframes: false,
    showTangents: false,
    showLightHelpers: true,
    colors: {
      normal: 0xff0000,
      tangent: 0x00ff00,
      boundingBox: 0x0000ff,
      wireframe: 0xffff00,
      light: 0xffffff
    },
    sizes: {
      normal: 0.1,
      tangent: 0.1,
      boundingBox: 1
    }
  },
  development: {
    enabled: true,
    showFPS: true,
    showMemory: true,
    showProfiling: false,
    logLevel: 'info',
    showDebugPanel: false,
    enableSceneInspector: false,
    profiling: {
      enabled: false,
      sampleRate: 60,
      maxSamples: 1000
    }
  },
  web3: {
    enabled: true,
    network: 'ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    ipfsGateway: 'https://ipfs.io',
    wallet: {
      autoConnect: false,
      supportedWallets: ['metamask', 'walletconnect', 'coinbase']
    },
    contracts: {
      nftContract: '',
      tokenContract: '',
      marketplaceContract: ''
    }
  },
  interaction: {
    enabled: true,
    enableVR: true,
    enableTouch: true,
    enableRaycast: true,
    camera: {
      enableOrbit: true,
      enablePan: true,
      enableZoom: true,
      enableDolly: true
    },
    gestures: {
      enablePinch: true,
      enableRotate: true,
      enableSwipe: true
    }
  },
  physics: {
    enabled: true,
    engine: 'rapier',
    gravity: { x: 0, y: -9.81, z: 0 },
    collision: {
      enabled: true,
      debug: false,
      showColliders: false
    },
    constraints: {
      enabled: true,
      debug: false
    }
  },
  audio: {
    enabled: true,
    positional: {
      enabled: true,
      maxDistance: 100,
      rolloffFactor: 1
    },
    visualization: {
      enabled: false,
      showWaveform: false,
      showSpectrum: false
    },
    effects: {
      reverb: false,
      echo: false,
      filter: false
    }
  }
};

/**
 * Configuración de desarrollo
 */
export const developmentConfig: HelpersConfig = {
  ...defaultConfig,
  development: {
    ...defaultConfig.development,
    enabled: true,
    showFPS: true,
    showMemory: true,
    showProfiling: true,
    logLevel: 'debug',
    showDebugPanel: true,
    enableSceneInspector: true,
    profiling: {
      enabled: true,
      sampleRate: 60,
      maxSamples: 1000
    }
  },
  visualization: {
    ...defaultConfig.visualization,
    showNormals: true,
    showBoundingBoxes: true,
    showWireframes: true,
    showTangents: true,
    showLightHelpers: true
  }
};

/**
 * Configuración de producción
 */
export const productionConfig: HelpersConfig = {
  ...defaultConfig,
  development: {
    ...defaultConfig.development,
    enabled: false,
    showFPS: false,
    showMemory: false,
    showProfiling: false,
    logLevel: 'error',
    showDebugPanel: false,
    enableSceneInspector: false,
    profiling: {
      enabled: false,
      sampleRate: 60,
      maxSamples: 1000
    }
  },
  visualization: {
    ...defaultConfig.visualization,
    showNormals: false,
    showBoundingBoxes: false,
    showWireframes: false,
    showTangents: false,
    showLightHelpers: false
  }
};

/**
 * Configuración de pruebas
 */
export const testConfig: HelpersConfig = {
  ...defaultConfig,
  development: {
    ...defaultConfig.development,
    enabled: true,
    showFPS: false,
    showMemory: false,
    showProfiling: false,
    logLevel: 'warn',
    showDebugPanel: false,
    enableSceneInspector: false,
    profiling: {
      enabled: false,
      sampleRate: 60,
      maxSamples: 1000
    }
  },
  web3: {
    ...defaultConfig.web3,
    enabled: false
  },
  physics: {
    ...defaultConfig.physics,
    enabled: false
  },
  audio: {
    ...defaultConfig.audio,
    enabled: false
  }
};

/**
 * Configuraciones predefinidas
 */
export const presets = {
  default: defaultConfig,
  development: developmentConfig,
  production: productionConfig,
  test: testConfig
};

/**
 * Obtener configuración por nombre de preset
 * @param presetName - Nombre del preset
 * @returns Configuración del preset
 */
export function getPreset(presetName: keyof typeof presets): HelpersConfig {
  return presets[presetName];
}

/**
 * Validar configuración
 * @param config - Configuración a validar
 * @returns Si la configuración es válida
 */
export function validateConfig(config: Partial<HelpersConfig>): boolean {
  // Validaciones básicas
  if (config.visualization?.sizes?.normal && config.visualization.sizes.normal < 0) {
    console.warn('Tamaño de normal debe ser positivo');
    return false;
  }
  
  if (config.development?.profiling?.sampleRate && 
      (config.development.profiling.sampleRate < 1 || config.development.profiling.sampleRate > 120)) {
    console.warn('Tasa de muestreo debe estar entre 1 y 120');
    return false;
  }
  
  if (config.web3?.rpcUrl && !config.web3.rpcUrl.startsWith('http')) {
    console.warn('URL de RPC debe ser una URL válida');
    return false;
  }
  
  return true;
}

/**
 * Fusionar configuraciones
 * @param base - Configuración base
 * @param override - Configuración a fusionar
 * @returns Configuración fusionada
 */
export function mergeConfig(
  base: HelpersConfig, 
  override: Partial<HelpersConfig>
): HelpersConfig {
  return {
    visualization: { ...base.visualization, ...override.visualization },
    development: { ...base.development, ...override.development },
    web3: { ...base.web3, ...override.web3 },
    interaction: { ...base.interaction, ...override.interaction },
    physics: { ...base.physics, ...override.physics },
    audio: { ...base.audio, ...override.audio }
  };
}

/**
 * Crear configuración personalizada
 * @param customConfig - Configuración personalizada
 * @param basePreset - Preset base
 * @returns Configuración personalizada
 */
export function createCustomConfig(
  customConfig: Partial<HelpersConfig>,
  basePreset: keyof typeof presets = 'default'
): HelpersConfig {
  const base = getPreset(basePreset);
  const merged = mergeConfig(base, customConfig);
  
  if (!validateConfig(merged)) {
    console.warn('Configuración inválida, usando configuración base');
    return base;
  }
  
  return merged;
}

export default defaultConfig; 