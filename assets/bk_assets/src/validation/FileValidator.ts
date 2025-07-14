/**
 * @fileoverview Implementación avanzada del validador de archivos
 */

import { IValidator, ValidationOptions, ValidationResult } from '../interfaces/IValidator';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mimeTypes from 'mime-types';

export class FileValidator implements IValidator {
  public readonly name = 'File Validator';
  public readonly version = '1.0.0';
  public readonly supportedValidations = ['integrity', 'format', 'size', 'metadata', 'security'];

  private logger: Logger;
  private maxFileSize: number;
  private allowedFormats: string[];

  constructor() {
    this.logger = new Logger('FileValidator');
    this.maxFileSize = 100 * 1024 * 1024; // 100MB por defecto
    this.allowedFormats = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'webp', 'mp3', 'wav', 'ogg', 'mp4', 'webm'];
  }

  async validate(filePath: string, options: ValidationOptions): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];
      const metadata: Record<string, any> = {};
      const compatibility: Record<string, boolean> = {};
      
      // Obtener información básica del archivo
      const fileInfo = await this.getFileInfo(filePath);
      metadata.fileInfo = fileInfo;
      
      // Validar tamaño
      if (options.maxFileSize && fileInfo.size > options.maxFileSize) {
        errors.push(`Archivo demasiado grande: ${fileInfo.size} bytes (máximo: ${options.maxFileSize} bytes)`);
      }
      
      // Validar formato
      if (options.allowedFormats && options.allowedFormats.length > 0) {
        if (!options.allowedFormats.includes(fileInfo.format)) {
          errors.push(`Formato no permitido: ${fileInfo.format}`);
        }
      }
      
      // Validar integridad
      if (options.integrityCheck) {
        const integrityValid = await this.checkIntegrity(filePath, fileInfo.hash);
        if (!integrityValid) {
          errors.push('Verificación de integridad falló');
        }
        compatibility.integrity = integrityValid;
      }
      
      // Validar formato MIME
      if (options.formatValidation) {
        const mimeValid = this.validateMimeType(filePath, fileInfo.mimeType);
        if (!mimeValid) {
          warnings.push('Tipo MIME no coincide con la extensión del archivo');
        }
        compatibility.mime = mimeValid;
      }
      
      // Validar metadatos
      if (options.metadataValidation) {
        const metadataValid = await this.validateMetadata(filePath);
        if (!metadataValid.valid) {
          warnings.push(`Metadatos incompletos: ${metadataValid.missing.join(', ')}`);
        }
        compatibility.metadata = metadataValid.valid;
        metadata.metadataValidation = metadataValid;
      }
      
      // Análisis de seguridad básico
      if (options.securityScan) {
        const securityResult = await this.performSecurityScan(filePath);
        compatibility.security = securityResult.clean;
        metadata.securityScan = securityResult;
        
        if (!securityResult.clean) {
          errors.push(`Amenazas de seguridad detectadas: ${securityResult.threats.join(', ')}`);
        }
      }
      
      // Generar recomendaciones
      if (fileInfo.size > 10 * 1024 * 1024) { // > 10MB
        recommendations.push('Archivo grande, considerar compresión');
      }
      
      if (fileInfo.format === 'png' && !fileInfo.hasAlpha) {
        recommendations.push('PNG sin transparencia, considerar JPEG para mejor compresión');
      }
      
      // Calcular score de seguridad
      const securityScore = this.calculateSecurityScore(compatibility, errors, warnings);
      
      const result: ValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata,
        securityScore,
        compatibility,
        recommendations
      };

      this.logger.success(`✅ Validación completada: ${result.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en validación: ${errorMessage}`);
      throw new Error(`File validation failed: ${errorMessage}`);
    }
  }

  async validateBatch(filePaths: string[], options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const batchSize = 5; // Validar en lotes de 5

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.validate(filePath, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('❌ Error en batch:', result.reason);
        }
      }

      this.logger.progress(`Validando archivos`, i + batch.length, filePaths.length);
    }

    return results;
  }

  async getFileInfo(filePath: string): Promise<{
    size: number;
    format: string;
    mimeType: string;
    hash: string;
    metadata: Record<string, any>;
  }> {
    const stats = await fs.stat(filePath);
    const buffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const mimeType = mimeTypes.lookup(filePath) || 'application/octet-stream';
    const format = path.extname(filePath).toLowerCase().substring(1);
    
    // Detectar si tiene canal alpha (para imágenes)
    let hasAlpha = undefined;
    if (['png', 'webp'].includes(format)) {
      try {
        // Análisis básico del header para detectar alpha
        hasAlpha = this.detectAlphaChannel(buffer, format);
      } catch (error) {
        this.logger.warn(`⚠️ No se pudo detectar canal alpha: ${error}`);
      }
    }
    
    return {
      size: stats.size,
      format,
      mimeType,
      hash,
      metadata: {
        hasAlpha,
        extension: format,
        filename: path.basename(filePath),
        directory: path.dirname(filePath),
        lastModified: stats.mtime,
        created: stats.birthtime
      }
    };
  }

  async checkIntegrity(filePath: string, expectedHash: string): Promise<boolean> {
    try {
      const actualHash = await this.calculateFileHash(filePath);
      return actualHash === expectedHash;
    } catch (error) {
      this.logger.error(`❌ Error verificando integridad: ${error}`);
      return false;
    }
  }

  async scanForViruses(filePath: string): Promise<{
    clean: boolean;
    threats: string[];
    scanTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Simulación de escaneo de virus (en implementación real usaría ClamAV o similar)
      const buffer = await fs.readFile(filePath);
      const threats: string[] = [];
      
      // Análisis básico de patrones sospechosos
      const suspiciousPatterns = [
        /eval\s*\(/i,
        /document\.write/i,
        /<script/i,
        /javascript:/i
      ];
      
      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          threats.push(`Patrón sospechoso detectado: ${pattern.source}`);
        }
      }
      
      // Verificar tamaño anormal
      if (buffer.length > 50 * 1024 * 1024) { // > 50MB
        threats.push('Archivo anormalmente grande');
      }
      
      return {
        clean: threats.length === 0,
        threats,
        scanTime: Date.now() - startTime
      };
      
    } catch (error) {
      this.logger.error(`❌ Error en escaneo de virus: ${error}`);
      return {
        clean: false,
        threats: ['Error en escaneo'],
        scanTime: Date.now() - startTime
      };
    }
  }

  async validateMetadata(filePath: string): Promise<{
    valid: boolean;
    errors: string[];
    missing: string[];
  }> {
    try {
      const errors: string[] = [];
      const missing: string[] = [];
      
      // Verificar metadatos básicos
      const stats = await fs.stat(filePath);
      const requiredFields = ['name', 'size', 'created', 'modified'];
      
      if (!path.basename(filePath)) missing.push('name');
      if (!stats.size) missing.push('size');
      if (!stats.birthtime) missing.push('created');
      if (!stats.mtime) missing.push('modified');
      
      // Validaciones específicas por formato
      const format = path.extname(filePath).toLowerCase().substring(1);
      
      if (['glb', 'gltf'].includes(format)) {
        // Verificar metadatos específicos de modelos 3D
        const buffer = await fs.readFile(filePath);
        if (!this.validate3DModelMetadata(buffer, format)) {
          errors.push('Metadatos de modelo 3D inválidos');
        }
      }
      
      return {
        valid: errors.length === 0 && missing.length === 0,
        errors,
        missing
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [`Error validando metadatos: ${error}`],
        missing: ['metadata']
      };
    }
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private validateMimeType(filePath: string, mimeType: string): boolean {
    const ext = path.extname(filePath).toLowerCase().substring(1);
    const expectedMime = mimeTypes.lookup(ext);
    
    if (!expectedMime) return true; // No podemos validar
    
    return mimeType === expectedMime;
  }

  private detectAlphaChannel(buffer: Buffer, format: string): boolean {
    if (format === 'png') {
      // Verificar header PNG y tipo de color
      if (buffer.length < 25) return false;
      
      const colorType = buffer[25];
      return (colorType & 4) !== 0; // Bit 2 indica canal alpha
    }
    
    if (format === 'webp') {
      // Verificar header WebP
      if (buffer.length < 12) return false;
      
      const riffHeader = buffer.toString('ascii', 0, 4);
      const webpHeader = buffer.toString('ascii', 8, 12);
      
      if (riffHeader !== 'RIFF' || webpHeader !== 'WEBP') return false;
      
      // Análisis básico del tipo de WebP
      const chunkType = buffer.toString('ascii', 12, 16);
      return chunkType === 'VP8L' || chunkType === 'VP8X'; // Estos tipos pueden tener alpha
    }
    
    return false;
  }

  private validate3DModelMetadata(buffer: Buffer, format: string): boolean {
    if (format === 'glb') {
      // Verificar header GLB
      if (buffer.length < 12) return false;
      
      const magic = buffer.readUInt32LE(0);
      const version = buffer.readUInt32LE(4);
      const length = buffer.readUInt32LE(8);
      
      return magic === 0x46546C67 && version === 2 && length === buffer.length;
    }
    
    if (format === 'gltf') {
      // Verificar que sea JSON válido
      try {
        const content = buffer.toString('utf8');
        const json = JSON.parse(content);
        return json.asset && json.asset.version;
      } catch {
        return false;
      }
    }
    
    return true;
  }

  private async performSecurityScan(filePath: string): Promise<{
    clean: boolean;
    threats: string[];
    scanTime: number;
  }> {
    return await this.scanForViruses(filePath);
  }

  private calculateSecurityScore(
    compatibility: Record<string, boolean>, 
    errors: string[], 
    warnings: string[]
  ): number {
    let score = 100;
    
    // Reducir por errores
    score -= errors.length * 20;
    
    // Reducir por warnings
    score -= warnings.length * 5;
    
    // Reducir por incompatibilidades
    const incompatibilities = Object.values(compatibility).filter(valid => !valid).length;
    score -= incompatibilities * 10;
    
    return Math.max(0, Math.min(100, score));
  }
} 