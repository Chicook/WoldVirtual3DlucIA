/**
 * @fileoverview Índice principal del sistema modular avanzado de assets
 */

// Sistema principal
export { AssetsSystemAdvanced } from './AssetsSystemAdvanced';
export type { SystemConfig, ProcessingResult } from './AssetsSystemAdvanced';

// Configuraciones
export { defaultConfig, productionConfig, developmentConfig, getConfig } from './config/default-config';

// Managers
export { UploaderManager } from './managers/UploaderManager';
export { CompressorManager } from './managers/CompressorManager';
export { OptimizerManager } from './managers/OptimizerManager';
export { ValidatorManager } from './managers/ValidatorManager';

// Interfaces
export type { 
  IUploader, 
  UploadOptions, 
  UploadResult,
  UploaderConfig 
} from './interfaces/IUploader';

export type { 
  ICompressor, 
  CompressionOptions, 
  CompressionResult,
  CompressorConfig 
} from './interfaces/ICompressor';

export type { 
  IOptimizer, 
  OptimizationOptions, 
  OptimizationResult,
  OptimizerConfig 
} from './interfaces/IOptimizer';

export type { 
  IValidator, 
  ValidationOptions, 
  ValidationResult,
  ValidatorConfig 
} from './interfaces/IValidator';

// Implementaciones de Uploaders
export { IPFSUploader } from './upload/IPFSUploader';

// Implementaciones de Compressors
export { GzipCompressor } from './compression/GzipCompressor';

// Implementaciones de Optimizers
export { ImageOptimizer } from './optimization/ImageOptimizer';

// Implementaciones de Validators
export { FileValidator } from './validation/FileValidator';

// Utilidades
export { Logger } from './utils/logger';

// Versión del sistema
export const VERSION = '2.0.0';
export const BUILD_DATE = '2025-07-01';

// Información del sistema
export const SYSTEM_INFO = {
  name: 'Metaverso Assets System',
  version: VERSION,
  buildDate: BUILD_DATE,
  features: [
    'Modular Architecture',
    'Advanced Managers',
    'Intelligent Optimization',
    'Multi-Platform Upload',
    'Comprehensive Validation',
    'Real-time Metrics',
    'Batch Processing',
    'Adaptive Compression'
  ],
  supportedFormats: {
    models: ['glb', 'gltf', 'fbx', 'obj', 'dae'],
    images: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'svg'],
    audio: ['mp3', 'wav', 'ogg', 'aac'],
    video: ['mp4', 'webm', 'bvh']
  },
  supportedPlatforms: {
    upload: ['ipfs', 'arweave', 'aws', 'local'],
    compression: ['gzip', 'brotli', 'lz4'],
    optimization: ['image', 'audio', 'video', 'model3d']
  }
};

// Función de inicialización rápida
export async function createAssetsSystem(environment: 'development' | 'production' | 'default' = 'default') {
  const { AssetsSystemAdvanced, getConfig } = await import('./AssetsSystemAdvanced');
  const config = getConfig(environment);
  const system = new AssetsSystemAdvanced(config);
  await system.initialize();
  return system;
}

// Función de procesamiento rápida
export async function quickProcess(filePath: string, options: any = {}) {
  const system = await createAssetsSystem();
  const result = await system.processAsset(filePath, options);
  return result;
}

// Función de procesamiento en lote rápido
export async function quickBatchProcess(filePaths: string[], options: any = {}) {
  const system = await createAssetsSystem();
  const results = await system.processBatch(filePaths, options);
  return results;
}

// Exportar todo como namespace para compatibilidad
export default {
  AssetsSystemAdvanced,
  createAssetsSystem,
  quickProcess,
  quickBatchProcess,
  VERSION,
  SYSTEM_INFO,
  // Managers
  UploaderManager,
  CompressorManager,
  OptimizerManager,
  ValidatorManager,
  // Implementaciones
  IPFSUploader,
  GzipCompressor,
  ImageOptimizer,
  FileValidator,
  // Configuraciones
  defaultConfig,
  productionConfig,
  developmentConfig,
  getConfig
}; 