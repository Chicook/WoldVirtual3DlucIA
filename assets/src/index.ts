THIS SHOULD BE A LINTER ERROR/**
 * @fileoverview Índice principal del sistema modular avanzado de assets
 */

// Sistema principal
import { AssetsSystemAdvanced } from './AssetsSystemAdvanced';
export type { SystemConfig, ProcessingResult } from './AssetsSystemAdvanced';

// Configuraciones
import { defaultConfig, productionConfig, developmentConfig, getConfig } from './config/default-config';

// Managers
import { UploaderManager } from './managers/UploaderManager';
export type { UploaderConfig } from './managers/UploaderManager';
import { CompressorManager } from './managers/CompressorManager';
export type { CompressorConfig } from './managers/CompressorManager';
import { OptimizerManager } from './managers/OptimizerManager';
export type { OptimizerConfig } from './managers/OptimizerManager';
import { ValidatorManager } from './managers/ValidatorManager';
export type { ValidatorConfig } from './managers/ValidatorManager';

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
import { IPFSUploader } from './upload/IPFSUploader';

// Implementaciones de Compressors
import { GzipCompressor } from './compression/GzipCompressor';

// Implementaciones de Optimizers
import { ImageOptimizer } from './optimization/ImageOptimizer';

// Implementaciones de Validators
import { FileValidator } from './validation/FileValidator';

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
import { AssetsSystemAdvanced } from './AssetsSystemAdvanced';
import { UploaderManager } from './managers/UploaderManager';
import { CompressorManager } from './managers/CompressorManager';
import { OptimizerManager } from './managers/OptimizerManager';
import { ValidatorManager } from './managers/ValidatorManager';
import { IPFSUploader } from './upload/IPFSUploader';
import { GzipCompressor } from './compression/GzipCompressor';
import { ImageOptimizer } from './optimization/ImageOptimizer';
import { FileValidator } from './validation/FileValidator';
import { defaultConfig, productionConfig, developmentConfig, getConfig } from './config/default-config';

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