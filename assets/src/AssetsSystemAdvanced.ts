/**
 * @fileoverview Sistema principal avanzado de assets que integra todos los managers
 */

import { Logger } from './utils/logger';
import { UploaderManager } from './managers/UploaderManager';
import { CompressorManager } from './managers/CompressorManager';
import { OptimizerManager } from './managers/OptimizerManager';
import { ValidatorManager } from './managers/ValidatorManager';
import { IPFSUploader } from './upload/IPFSUploader';
import { GzipCompressor } from './compression/GzipCompressor';
import { ImageOptimizer } from './optimization/ImageOptimizer';
import { FileValidator } from './validation/FileValidator';

export interface SystemConfig {
  uploaders: {
    ipfs?: boolean;
    arweave?: boolean;
    aws?: boolean;
    local?: boolean;
  };
  compressors: {
    gzip?: boolean;
    brotli?: boolean;
    lz4?: boolean;
  };
  optimizers: {
    image?: boolean;
    audio?: boolean;
    video?: boolean;
    model3d?: boolean;
  };
  validators: {
    file?: boolean;
    virus?: boolean;
    integrity?: boolean;
  };
  performance: {
    maxConcurrentUploads: number;
    maxConcurrentCompressions: number;
    maxConcurrentOptimizations: number;
    maxConcurrentValidations: number;
    batchSize: number;
  };
}

export interface ProcessingResult {
  success: boolean;
  assetId: string;
  originalPath: string;
  processedPath?: string;
  uploadUrl?: string;
  validation: any;
  optimization?: any;
  compression?: any;
  upload?: any;
  metadata: Record<string, any>;
  stats: {
    totalTime: number;
    validationTime: number;
    optimizationTime: number;
    compressionTime: number;
    uploadTime: number;
    totalSizeReduction: number;
  };
  errors: string[];
  warnings: string[];
}

export class AssetsSystemAdvanced {
  private logger: Logger;
  private uploaderManager: UploaderManager;
  private compressorManager: CompressorManager;
  private optimizerManager: OptimizerManager;
  private validatorManager: ValidatorManager;
  private config: SystemConfig;
  private isInitialized: boolean = false;

  constructor(config: SystemConfig) {
    this.logger = new Logger('AssetsSystemAdvanced');
    this.config = config;
    
    this.uploaderManager = new UploaderManager();
    this.compressorManager = new CompressorManager();
    this.optimizerManager = new OptimizerManager();
    this.validatorManager = new ValidatorManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('⚠️ Sistema ya inicializado');
      return;
    }

    this.logger.info('🚀 Inicializando sistema avanzado de assets...');

    try {
      // Registrar uploaders
      await this.registerUploaders();
      
      // Registrar compressors
      await this.registerCompressors();
      
      // Registrar optimizers
      await this.registerOptimizers();
      
      // Registrar validators
      await this.registerValidators();
      
      this.isInitialized = true;
      this.logger.success('✅ Sistema avanzado de assets inicializado correctamente');
      
    } catch (error) {
      this.logger.error('❌ Error inicializando sistema:', error);
      throw error;
    }
  }

  async processAsset(filePath: string, options: any = {}): Promise<ProcessingResult> {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llama a initialize() primero.');
    }

    const startTime = Date.now();
    const assetId = this.generateAssetId(filePath);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    this.logger.info(`🔄 Procesando asset: ${filePath} (ID: ${assetId})`);

    try {
      // 1. Validación
      const validationStart = Date.now();
      const validationResult = await this.validatorManager.validate(filePath, {
        maxFileSize: options.maxFileSize || 100 * 1024 * 1024,
        allowedFormats: options.allowedFormats || ['glb', 'png', 'jpg', 'mp3', 'mp4'],
        virusScan: options.virusScan || false,
        integrityCheck: options.integrityCheck || true,
        metadataValidation: options.metadataValidation || true,
        securityScan: options.securityScan || false,
        formatValidation: options.formatValidation || true
      });

      if (!validationResult.valid) {
        throw new Error(`Validación falló: ${validationResult.errors.join(', ')}`);
      }

      const validationTime = Date.now() - validationStart;
      warnings.push(...validationResult.warnings);

      // 2. Optimización
      let optimizationResult = null;
      let optimizationTime = 0;
      
      if (options.optimize !== false) {
        const optimizationStart = Date.now();
        optimizationResult = await this.optimizerManager.optimize(filePath, {
          quality: options.quality || 85,
          format: options.format || 'auto',
          resize: options.resize || { enabled: false },
          compression: options.compression || { enabled: false },
          metadata: options.metadata || { preserve: true, strip: [] },
          adaptive: options.adaptive || { enabled: false },
          parallel: options.parallel || false
        });
        optimizationTime = Date.now() - optimizationStart;
      }

      // 3. Compresión
      let compressionResult = null;
      let compressionTime = 0;
      
      if (options.compress !== false) {
        const compressionStart = Date.now();
        compressionResult = await this.compressorManager.compress(
          optimizationResult?.outputPath || filePath,
          {
            algorithm: options.compressionAlgorithm || 'gzip',
            level: options.compressionLevel || 6,
            preserveMetadata: options.preserveMetadata || true,
            adaptiveCompression: options.adaptiveCompression || false,
            parallelProcessing: options.parallelProcessing || false,
            memoryLimit: options.memoryLimit || 100 * 1024 * 1024,
            quality: options.quality || 85
          }
        );
        compressionTime = Date.now() - compressionStart;
      }

      // 4. Upload
      const uploadStart = Date.now();
      const uploadResult = await this.uploaderManager.upload(
        compressionResult?.outputPath || optimizationResult?.outputPath || filePath,
        {
          platform: options.platform || 'ipfs',
          public: options.public !== false,
          tags: options.tags || [],
          metadata: options.uploadMetadata || {},
          encryption: options.encryption || { enabled: false },
          compression: options.uploadCompression || { enabled: false },
          retry: options.retry || { attempts: 3, delay: 1000, backoff: 'exponential' },
          progress: options.progress
        }
      );
      const uploadTime = Date.now() - uploadStart;

      // Calcular estadísticas
      const totalTime = Date.now() - startTime;
      const totalSizeReduction = this.calculateTotalSizeReduction(
        validationResult.metadata.fileInfo.size,
        optimizationResult,
        compressionResult
      );

      const result: ProcessingResult = {
        success: true,
        assetId,
        originalPath: filePath,
        processedPath: compressionResult?.outputPath || optimizationResult?.outputPath,
        uploadUrl: uploadResult.url,
        validation: validationResult,
        optimization: optimizationResult,
        compression: compressionResult,
        upload: uploadResult,
        metadata: {
          assetId,
          originalSize: validationResult.metadata.fileInfo.size,
          processedSize: compressionResult?.compressedSize || optimizationResult?.optimizedSize,
          format: validationResult.metadata.fileInfo.format,
          mimeType: validationResult.metadata.fileInfo.mimeType,
          hash: validationResult.metadata.fileInfo.hash,
          securityScore: validationResult.securityScore,
          uploadedAt: new Date().toISOString()
        },
        stats: {
          totalTime,
          validationTime,
          optimizationTime,
          compressionTime,
          uploadTime,
          totalSizeReduction
        },
        errors,
        warnings
      };

      this.logger.success(`✅ Asset procesado exitosamente: ${totalSizeReduction.toFixed(1)}% reducción total`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      errors.push(errorMessage);
      
      this.logger.error(`❌ Error procesando asset: ${errorMessage}`);
      
      return {
        success: false,
        assetId,
        originalPath: filePath,
        metadata: { assetId, error: errorMessage },
        stats: {
          totalTime: Date.now() - startTime,
          validationTime: 0,
          optimizationTime: 0,
          compressionTime: 0,
          uploadTime: 0,
          totalSizeReduction: 0
        },
        errors,
        warnings
      };
    }
  }

  async processBatch(filePaths: string[], options: any = {}): Promise<ProcessingResult[]> {
    this.logger.info(`🔄 Procesando lote de ${filePaths.length} assets...`);
    
    const results: ProcessingResult[] = [];
    const batchSize = options.batchSize || this.config.performance.batchSize;

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
    this.logger.success(`✅ Lote completado: ${successCount}/${filePaths.length} exitosos`);

    return results;
  }

  getMetrics(): {
    uploaders: any;
    compressors: any;
    optimizers: any;
    validators: any;
  } {
    return {
      uploaders: this.uploaderManager.getMetrics(),
      compressors: this.compressorManager.getMetrics(),
      optimizers: this.optimizerManager.getMetrics(),
      validators: this.validatorManager.getMetrics()
    };
  }

  private async registerUploaders(): Promise<void> {
    if (this.config.uploaders.ipfs) {
      const ipfsUploader = new IPFSUploader();
      this.uploaderManager.registerUploader('ipfs', ipfsUploader, {
        name: 'IPFS',
        priority: 1,
        weight: 1,
        maxConcurrent: this.config.performance.maxConcurrentUploads,
        timeout: 30000,
        retryAttempts: 3,
        fallbackTo: ['local']
      });
    }

    // Aquí se pueden registrar más uploaders (Arweave, AWS, etc.)
  }

  private async registerCompressors(): Promise<void> {
    if (this.config.compressors.gzip) {
      const gzipCompressor = new GzipCompressor();
      this.compressorManager.registerCompressor('gzip', gzipCompressor, {
        name: 'Gzip',
        priority: 1,
        maxFileSize: 100 * 1024 * 1024,
        supportedFormats: gzipCompressor.supportedFormats,
        memoryLimit: 50 * 1024 * 1024,
        timeout: 30000
      });
    }

    // Aquí se pueden registrar más compressors (Brotli, LZ4, etc.)
  }

  private async registerOptimizers(): Promise<void> {
    if (this.config.optimizers.image) {
      const imageOptimizer = new ImageOptimizer();
      this.optimizerManager.registerOptimizer('image', imageOptimizer, {
        name: 'Image Optimizer',
        priority: 1,
        supportedFormats: imageOptimizer.supportedFormats,
        supportedTechniques: imageOptimizer.supportedTechniques,
        memoryLimit: 100 * 1024 * 1024,
        timeout: 60000,
        qualityRange: [10, 100]
      });
    }

    // Aquí se pueden registrar más optimizers (Audio, Video, 3D Models, etc.)
  }

  private async registerValidators(): Promise<void> {
    if (this.config.validators.file) {
      const fileValidator = new FileValidator();
      this.validatorManager.registerValidator('file', fileValidator, {
        name: 'File Validator',
        priority: 1,
        supportedValidations: fileValidator.supportedValidations,
        maxFileSize: 100 * 1024 * 1024,
        timeout: 30000,
        parallelValidation: true
      });
    }

    // Aquí se pueden registrar más validators (Virus, Integrity, etc.)
  }

  private generateAssetId(filePath: string): string {
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const hash = crypto.createHash('sha256')
      .update(filePath + timestamp)
      .digest('hex');
    return hash.substring(0, 16);
  }

  private calculateTotalSizeReduction(
    originalSize: number,
    optimizationResult: any,
    compressionResult: any
  ): number {
    let currentSize = originalSize;
    
    if (optimizationResult) {
      currentSize = optimizationResult.optimizedSize;
    }
    
    if (compressionResult) {
      currentSize = compressionResult.compressedSize;
    }
    
    return ((originalSize - currentSize) / originalSize) * 100;
  }
} 