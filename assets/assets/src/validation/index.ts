/**
 * @fileoverview Módulo de validación de assets del metaverso
 * @module assets/src/validation
 */

import { Logger } from '../utils/logger';
import { AssetType, ValidationResult } from '../types';

/**
 * Validador de assets
 */
export class AssetValidator {
  private logger: Logger;
  private config: {
    maxFileSize: number;
    allowedFormats: string[];
    requiredMetadata: string[];
    forbiddenPatterns: string[];
  };

  constructor() {
    this.logger = new Logger('AssetValidator');
    this.config = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFormats: [
        // Modelos 3D
        'glb', 'gltf', 'fbx', 'obj', 'dae', 'ply',
        // Texturas
        'png', 'jpg', 'jpeg', 'webp', 'ktx2', 'basis', 'tga', 'tiff',
        // Audio
        'mp3', 'wav', 'ogg', 'aac', 'flac', 'opus',
        // Imágenes
        'svg', 'ico',
        // Animaciones
        'bvh',
        // Video
        'mp4', 'webm', 'avi', 'mov'
      ],
      requiredMetadata: ['name', 'type', 'category'],
      forbiddenPatterns: [
        /\.exe$/i,
        /\.bat$/i,
        /\.cmd$/i,
        /\.scr$/i,
        /\.pif$/i,
        /\.com$/i
      ]
    };
  }

  /**
   * Inicializa el validador
   */
  async initialize(): Promise<void> {
    this.logger.info('🔍 Inicializando validador de assets...');
    this.logger.success('✅ Validador inicializado');
  }

  /**
   * Valida un asset
   */
  async validate(filePath: string): Promise<ValidationResult> {
    this.logger.startProcess('validation', { filePath });

    try {
      const startTime = Date.now();
      const errors: string[] = [];
      const warnings: string[] = [];

      // 1. Validar existencia del archivo
      if (!await this.fileExists(filePath)) {
        errors.push('Archivo no encontrado');
      }

      // 2. Validar formato
      const format = this.getFileFormat(filePath);
      if (!this.config.allowedFormats.includes(format)) {
        errors.push(`Formato no permitido: ${format}`);
      }

      // 3. Validar tamaño
      const size = await this.getFileSize(filePath);
      if (size > this.config.maxFileSize) {
        errors.push(`Archivo demasiado grande: ${this.formatSize(size)}`);
      }

      // 4. Validar patrones prohibidos
      if (this.hasForbiddenPattern(filePath)) {
        errors.push('Archivo contiene patrones prohibidos');
      }

      // 5. Validar integridad
      const integrityCheck = await this.checkIntegrity(filePath);
      if (!integrityCheck.valid) {
        errors.push('Error de integridad del archivo');
      }

      // 6. Validar metadatos básicos
      const metadata = await this.extractBasicMetadata(filePath);
      const metadataValidation = this.validateMetadata(metadata);
      errors.push(...metadataValidation.errors);
      warnings.push(...metadataValidation.warnings);

      // 7. Validar contenido específico del tipo
      const assetType = this.determineAssetType(filePath);
      const contentValidation = await this.validateContent(filePath, assetType);
      errors.push(...contentValidation.errors);
      warnings.push(...contentValidation.warnings);

      const duration = Date.now() - startTime;
      const valid = errors.length === 0;

      const result: ValidationResult = {
        valid,
        errors,
        warnings,
        size,
        format,
        hash: integrityCheck.hash,
        metadata
      };

      this.logger.endProcess('validation', duration, { valid, errors: errors.length, warnings: warnings.length });
      this.logger.validation(result);

      return result;

    } catch (error) {
      this.logger.error('Error validando asset:', error);
      return {
        valid: false,
        errors: [error.message],
        warnings: [],
        size: 0,
        format: '',
        hash: '',
        metadata: {}
      };
    }
  }

  /**
   * Verifica si el archivo existe
   */
  private async fileExists(filePath: string): Promise<boolean> {
    const fs = require('fs-extra');
    return await fs.pathExists(filePath);
  }

  /**
   * Obtiene el formato del archivo
   */
  private getFileFormat(filePath: string): string {
    return filePath.toLowerCase().split('.').pop() || '';
  }

  /**
   * Obtiene el tamaño del archivo
   */
  private async getFileSize(filePath: string): Promise<number> {
    const fs = require('fs-extra');
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Formatea el tamaño en bytes
   */
  private formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Verifica si tiene patrones prohibidos
   */
  private hasForbiddenPattern(filePath: string): boolean {
    return this.config.forbiddenPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Verifica la integridad del archivo
   */
  private async checkIntegrity(filePath: string): Promise<{ valid: boolean; hash: string }> {
    const crypto = require('crypto');
    const fs = require('fs-extra');

    try {
      const content = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      
      // Verificar que el archivo no esté corrupto
      const valid = content.length > 0;
      
      return { valid, hash };
    } catch (error) {
      return { valid: false, hash: '' };
    }
  }

  /**
   * Extrae metadatos básicos
   */
  private async extractBasicMetadata(filePath: string): Promise<Record<string, any>> {
    const fs = require('fs-extra');
    const path = require('path');

    try {
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      const format = this.getFileFormat(filePath);

      return {
        name: fileName,
        format,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        path: filePath
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Valida metadatos
   */
  private validateMetadata(metadata: Record<string, any>): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const field of this.config.requiredMetadata) {
      if (!metadata[field]) {
        errors.push(`Metadato requerido faltante: ${field}`);
      }
    }

    if (!metadata.name || metadata.name.length < 2) {
      warnings.push('Nombre de archivo muy corto');
    }

    if (metadata.size === 0) {
      errors.push('Archivo vacío');
    }

    return { errors, warnings };
  }

  /**
   * Determina el tipo de asset
   */
  private determineAssetType(filePath: string): AssetType {
    const format = this.getFileFormat(filePath);
    
    const typeMap: Record<string, AssetType> = {
      'glb': AssetType.MODEL_3D,
      'gltf': AssetType.MODEL_3D,
      'fbx': AssetType.MODEL_3D,
      'obj': AssetType.MODEL_3D,
      'png': AssetType.TEXTURE,
      'jpg': AssetType.TEXTURE,
      'jpeg': AssetType.TEXTURE,
      'webp': AssetType.TEXTURE,
      'mp3': AssetType.AUDIO,
      'wav': AssetType.AUDIO,
      'ogg': AssetType.AUDIO,
      'svg': AssetType.IMAGE
    };

    return typeMap[format] || AssetType.IMAGE;
  }

  /**
   * Valida contenido específico del tipo
   */
  private async validateContent(filePath: string, assetType: AssetType): Promise<{
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      switch (assetType) {
        case AssetType.MODEL_3D:
          const modelValidation = await this.validate3DModel(filePath);
          errors.push(...modelValidation.errors);
          warnings.push(...modelValidation.warnings);
          break;

        case AssetType.TEXTURE:
          const textureValidation = await this.validateTexture(filePath);
          errors.push(...textureValidation.errors);
          warnings.push(...textureValidation.warnings);
          break;

        case AssetType.AUDIO:
          const audioValidation = await this.validateAudio(filePath);
          errors.push(...audioValidation.errors);
          warnings.push(...audioValidation.warnings);
          break;

        case AssetType.IMAGE:
          const imageValidation = await this.validateImage(filePath);
          errors.push(...imageValidation.errors);
          warnings.push(...imageValidation.warnings);
          break;
      }
    } catch (error) {
      errors.push(`Error validando contenido: ${error.message}`);
    }

    return { errors, warnings };
  }

  /**
   * Valida modelo 3D
   */
  private async validate3DModel(filePath: string): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Implementar validación específica de modelos 3D
    // Verificar estructura glTF, polígonos, texturas, etc.

    return { errors, warnings };
  }

  /**
   * Valida textura
   */
  private async validateTexture(filePath: string): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Implementar validación específica de texturas
    // Verificar dimensiones, formato, compresión, etc.

    return { errors, warnings };
  }

  /**
   * Valida audio
   */
  private async validateAudio(filePath: string): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Implementar validación específica de audio
    // Verificar formato, duración, calidad, etc.

    return { errors, warnings };
  }

  /**
   * Valida imagen
   */
  private async validateImage(filePath: string): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Implementar validación específica de imágenes
    // Verificar dimensiones, formato, transparencia, etc.

    return { errors, warnings };
  }

  /**
   * Valida múltiples assets
   */
  async validateBatch(filePaths: string[]): Promise<ValidationResult[]> {
    this.logger.info(`🔍 Validando lote de ${filePaths.length} assets...`);

    const results: ValidationResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.validate(filePath));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('Error en validación de lote:', result.reason);
        }
      }

      this.logger.progress('Validando assets', i + batch.length, filePaths.length);
    }

    const validCount = results.filter(r => r.valid).length;
    this.logger.success(`✅ Validación de lote completada: ${validCount}/${filePaths.length} válidos`);

    return results;
  }

  /**
   * Actualiza configuración
   */
  updateConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('⚙️ Configuración de validación actualizada');
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }
} 