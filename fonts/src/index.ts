/**
 * @fileoverview Sistema de Fuentes del Metaverso - Punto de entrada principal
 * @module @metaverso/fonts
 * @version 1.0.0
 * @license MIT
 */

// Exportaciones principales
export { FontManager } from './font-manager';
export { FontFamily, FontStyle, FontVariant } from './types';
export { FontRenderer3D } from './3d';
export { FontOptimizer } from './optimization';
export { IPFSFontStorage } from './ipfs';
export { FontCache } from './cache';
export { FontVerifier } from './security';
export { FontAccessibility } from './accessibility';

// Exportaciones de tipos
export type {
  FontConfig,
  FontSystemConfig,
  FontLoadOptions,
  FontRenderOptions,
  FontOptimizationOptions,
  IPFSConfig,
  CacheConfig,
  SecurityConfig,
  AccessibilityConfig
} from './types';

// Exportaciones de utilidades
export { FontUtils } from './utils';
export { FontMetrics } from './utils/metrics';
export { FontValidator } from './utils/validator';

// Exportaciones de configuración
export { defaultConfig } from './config';

// Versión del sistema
export const VERSION = '1.0.0';

// Información del sistema
export const SYSTEM_INFO = {
  name: '@metaverso/fonts',
  version: VERSION,
  description: 'Sistema de gestión de fuentes tipográficas descentralizado para el metaverso',
  features: [
    'Gestión descentralizada de fuentes',
    'Optimización automática',
    'Renderizado 3D',
    'Integración IPFS',
    'Cache inteligente',
    'Accesibilidad avanzada',
    'Soporte multiidioma',
    'Verificación de seguridad'
  ]
};

/**
 * Inicializa el sistema de fuentes con configuración personalizada
 * @param config - Configuración del sistema
 * @returns Instancia del gestor de fuentes
 */
export async function initializeFontSystem(config?: Partial<FontSystemConfig>): Promise<FontManager> {
  const fontManager = new FontManager(config);
  await fontManager.initialize();
  return fontManager;
}

/**
 * Crea una instancia del sistema de fuentes con configuración por defecto
 * @returns Instancia del gestor de fuentes
 */
export async function createDefaultFontSystem(): Promise<FontManager> {
  return initializeFontSystem();
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
    canvas: typeof CanvasRenderingContext2D !== 'undefined',
    webgl: typeof WebGLRenderingContext !== 'undefined',
    webgpu: typeof GPUAdapter !== 'undefined',
    ipfs: typeof window !== 'undefined' ? 'ipfs' in window : false,
    crypto: typeof crypto !== 'undefined',
    workers: typeof Worker !== 'undefined'
  };

  const warnings: string[] = [];
  
  if (!features.canvas) {
    warnings.push('Canvas no está disponible - algunas funciones de renderizado pueden no funcionar');
  }
  
  if (!features.webgl && !features.webgpu) {
    warnings.push('WebGL/WebGPU no está disponible - el renderizado 3D puede no funcionar');
  }

  return {
    supported: Object.values(features).some(Boolean),
    features,
    warnings
  };
}

// Exportación por defecto
export default {
  FontManager,
  FontRenderer3D,
  FontOptimizer,
  IPFSFontStorage,
  FontCache,
  FontVerifier,
  FontAccessibility,
  initializeFontSystem,
  createDefaultFontSystem,
  checkCompatibility,
  VERSION,
  SYSTEM_INFO
}; 