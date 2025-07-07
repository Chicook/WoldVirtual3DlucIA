/**
 * @fileoverview Sistema principal de gestión de assets del metaverso
 * @module assets/src/index
 */

import { AssetManager } from './manager';
import { AssetOptimizer } from './optimization';
import { AssetValidator } from './validation';
import { AssetCompressor } from './compression';
import { AssetUploader } from './upload';
import { AssetCatalog } from './catalog';
import { AssetMetadata } from './metadata';
import { Logger } from './utils/logger';

/**
 * Clase principal del sistema de assets
 */
export class AssetsSystem {
  private manager: AssetManager;
  private optimizer: AssetOptimizer;
  private validator: AssetValidator;
  private compressor: AssetCompressor;
  private uploader: AssetUploader;
  private catalog: AssetCatalog;
  private metadata: AssetMetadata;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('AssetsSystem');
    this.manager = new AssetManager();
    this.optimizer = new AssetOptimizer();
    this.validator = new AssetValidator();
    this.compressor = new AssetCompressor();
    this.uploader = new AssetUploader();
    this.catalog = new AssetCatalog();
    this.metadata = new AssetMetadata();
  }

  /**
   * Inicializa el sistema de assets
   */
  async initialize(): Promise<void> {
    this.logger.info('🎨 Inicializando sistema de assets...');

    try {
      await this.manager.initialize();
      await this.optimizer.initialize();
      await this.validator.initialize();
      await this.compressor.initialize();
      await this.uploader.initialize();
      await this.catalog.initialize();
      await this.metadata.initialize();

      this.logger.success('✅ Sistema de assets inicializado');
    } catch (error) {
      this.logger.error('❌ Error inicializando sistema de assets:', error);
      throw error;
    }
  }

  /**
   * Procesa un asset completo
   */
  async processAsset(filePath: string, options: AssetProcessOptions = {}): Promise<AssetResult> {
    this.logger.info(`🔄 Procesando asset: ${filePath}`);

    try {
      // 1. Validar asset
      const validation = await this.validator.validate(filePath);
      if (!validation.valid) {
        throw new Error(`Asset inválido: ${validation.errors.join(', ')}`);
      }

      // 2. Optimizar asset
      const optimization = await this.optimizer.optimize(filePath, options.optimization);
      
      // 3. Comprimir asset
      const compression = await this.compressor.compress(optimization.outputPath, options.compression);
      
      // 4. Subir asset
      const upload = await this.uploader.upload(compression.outputPath, options.upload);
      
      // 5. Generar metadatos
      const metadata = await this.metadata.generate(filePath, {
        validation,
        optimization,
        compression,
        upload
      });

      // 6. Registrar en catálogo
      await this.catalog.register(metadata);

      const result: AssetResult = {
        success: true,
        originalPath: filePath,
        processedPath: upload.url,
        metadata,
        stats: {
          originalSize: validation.size,
          optimizedSize: optimization.size,
          compressedSize: compression.size,
          reduction: ((validation.size - compression.size) / validation.size) * 100
        }
      };

      this.logger.success(`✅ Asset procesado: ${result.stats.reduction.toFixed(1)}% reducción`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Error procesando asset '${filePath}':`, error);
      return {
        success: false,
        originalPath: filePath,
        error: error.message
      };
    }
  }

  /**
   * Procesa múltiples assets
   */
  async processAssets(filePaths: string[], options: AssetProcessOptions = {}): Promise<AssetResult[]> {
    this.logger.info(`🔄 Procesando ${filePaths.length} assets...`);

    const results: AssetResult[] = [];
    const batchSize = options.batchSize || 5;

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.processAsset(filePath, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('❌ Error en batch:', result.reason);
        }
      }

      this.logger.progress(`Procesando assets`, i + batch.length, filePaths.length);
    }

    const successCount = results.filter(r => r.success).length;
    this.logger.success(`✅ Procesamiento completado: ${successCount}/${filePaths.length} exitosos`);

    return results;
  }

  /**
   * Obtiene asset por ID
   */
  async getAsset(assetId: string): Promise<AssetInfo | null> {
    return await this.catalog.getAsset(assetId);
  }

  /**
   * Busca assets por criterios
   */
  async searchAssets(criteria: AssetSearchCriteria): Promise<AssetInfo[]> {
    return await this.catalog.search(criteria);
  }

  /**
   * Actualiza metadatos de asset
   */
  async updateAssetMetadata(assetId: string, metadata: Partial<AssetMetadata>): Promise<void> {
    await this.metadata.update(assetId, metadata);
    await this.catalog.updateAsset(assetId, metadata);
  }

  /**
   * Elimina asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    await this.uploader.delete(assetId);
    await this.catalog.removeAsset(assetId);
    await this.metadata.delete(assetId);
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async getStats(): Promise<AssetSystemStats> {
    const catalogStats = await this.catalog.getStats();
    const uploadStats = await this.uploader.getStats();
    const optimizationStats = await this.optimizer.getStats();

    return {
      totalAssets: catalogStats.total,
      totalSize: catalogStats.totalSize,
      averageOptimization: optimizationStats.averageReduction,
      storageUsed: uploadStats.totalSize,
      uploads: uploadStats.totalUploads,
      categories: catalogStats.categories
    };
  }

  /**
   * Limpia assets temporales
   */
  async cleanup(): Promise<void> {
    this.logger.info('🧹 Limpiando assets temporales...');
    
    await this.optimizer.cleanup();
    await this.compressor.cleanup();
    await this.uploader.cleanup();
    
    this.logger.success('✅ Limpieza completada');
  }

  /**
   * Exporta catálogo
   */
  async exportCatalog(format: 'json' | 'csv' = 'json'): Promise<string> {
    return await this.catalog.export(format);
  }

  /**
   * Importa catálogo
   */
  async importCatalog(data: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    await this.catalog.import(data, format);
  }
}

// Tipos de datos
export interface AssetProcessOptions {
  optimization?: OptimizationOptions;
  compression?: CompressionOptions;
  upload?: UploadOptions;
  batchSize?: number;
}

export interface OptimizationOptions {
  quality?: number;
  format?: string;
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressionOptions {
  algorithm?: string;
  level?: number;
  preserveMetadata?: boolean;
}

export interface UploadOptions {
  platform?: 'ipfs' | 'arweave' | 'aws' | 'local';
  public?: boolean;
  tags?: string[];
}

export interface AssetResult {
  success: boolean;
  originalPath: string;
  processedPath?: string;
  metadata?: AssetMetadata;
  stats?: {
    originalSize: number;
    optimizedSize: number;
    compressedSize: number;
    reduction: number;
  };
  error?: string;
}

export interface AssetInfo {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  url: string;
  size: number;
  metadata: AssetMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetSearchCriteria {
  type?: AssetType;
  category?: AssetCategory;
  tags?: string[];
  size?: {
    min?: number;
    max?: number;
  };
  date?: {
    from?: Date;
    to?: Date;
  };
  limit?: number;
  offset?: number;
}

export interface AssetSystemStats {
  totalAssets: number;
  totalSize: number;
  averageOptimization: number;
  storageUsed: number;
  uploads: number;
  categories: Record<string, number>;
}

export enum AssetType {
  MODEL_3D = '3d_model',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  IMAGE = 'image',
  ANIMATION = 'animation',
  VIDEO = 'video'
}

export enum AssetCategory {
  CHARACTER = 'character',
  BUILDING = 'building',
  VEHICLE = 'vehicle',
  PROP = 'prop',
  ENVIRONMENT = 'environment',
  UI = 'ui',
  AUDIO = 'audio',
  EFFECT = 'effect'
}

// Instancia global
export const assetsSystem = new AssetsSystem();

// Exportaciones
export * from './manager';
export * from './optimization';
export * from './validation';
export * from './compression';
export * from './upload';
export * from './catalog';
export * from './metadata';
export * from './utils/logger'; 