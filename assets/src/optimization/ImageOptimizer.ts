/**
 * @fileoverview Implementación avanzada del optimizador de imágenes
 */

import { IOptimizer, OptimizationOptions, OptimizationResult } from '../interfaces/IOptimizer';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sharp from 'sharp';

export class ImageOptimizer implements IOptimizer {
  public readonly name = 'Image Optimizer';
  public readonly version = '1.0.0';
  public readonly supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg'];
  public readonly supportedTechniques = ['resize', 'compress', 'format-convert', 'quality-optimize', 'metadata-strip'];

  private logger: Logger;

  constructor() {
    this.logger = new Logger('ImageOptimizer');
  }

  async optimize(filePath: string, options: OptimizationOptions): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    try {
      // Obtener información de la imagen
      const imageInfo = await sharp(filePath).metadata();
      const originalSize = (await fs.stat(filePath)).size;
      
      // Crear pipeline de optimización
      let pipeline = sharp(filePath);
      const appliedTechniques: string[] = [];
      
      // Aplicar redimensionamiento si está habilitado
      if (options.resize?.enabled) {
        const { maxWidth, maxHeight, maintainAspectRatio } = options.resize;
        
        if (imageInfo.width && imageInfo.height) {
          const needsResize = imageInfo.width > maxWidth || imageInfo.height > maxHeight;
          
          if (needsResize) {
            pipeline = pipeline.resize({
              width: maxWidth,
              height: maxHeight,
              fit: maintainAspectRatio ? 'inside' : 'fill',
              withoutEnlargement: true
            });
            appliedTechniques.push('resize');
          }
        }
      }
      
      // Configurar formato de salida
      const outputFormat = options.format || this.determineBestFormat(filePath, options.quality);
      const outputPath = this.generateOutputPath(filePath, outputFormat);
      
      // Aplicar optimizaciones específicas por formato
      pipeline = this.applyFormatOptimizations(pipeline, outputFormat, options);
      
      // Aplicar optimización de calidad
      if (options.quality) {
        pipeline = this.applyQualityOptimization(pipeline, outputFormat, options.quality);
        appliedTechniques.push('quality-optimize');
      }
      
      // Eliminar metadatos si está configurado
      if (options.metadata?.strip && options.metadata.strip.length > 0) {
        pipeline = pipeline.withMetadata(false);
        appliedTechniques.push('metadata-strip');
      }
      
      // Procesar imagen
      await pipeline.toFile(outputPath);
      
      // Obtener tamaño final
      const optimizedSize = (await fs.stat(outputPath)).size;
      const optimizationRatio = ((originalSize - optimizedSize) / originalSize) * 100;
      
      const result: OptimizationResult = {
        outputPath,
        originalSize,
        optimizedSize,
        optimizationRatio,
        quality: options.quality || 85,
        processingTime: Date.now() - startTime,
        appliedTechniques,
        metadata: {
          originalFormat: path.extname(filePath).substring(1),
          optimizedFormat: outputFormat,
          originalDimensions: `${imageInfo.width}x${imageInfo.height}`,
          colorSpace: imageInfo.space,
          channels: imageInfo.channels
        },
        warnings: []
      };

      this.logger.success(`✅ Optimización de imagen exitosa: ${optimizationRatio.toFixed(1)}% reducción`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en optimización de imagen: ${errorMessage}`);
      throw new Error(`Image optimization failed: ${errorMessage}`);
    }
  }

  async analyze(filePath: string): Promise<{
    recommendations: string[];
    estimatedSavings: number;
    bestSettings: OptimizationOptions;
    compatibility: Record<string, boolean>;
  }> {
    try {
      const imageInfo = await sharp(filePath).metadata();
      const originalSize = (await fs.stat(filePath)).size;
      
      const recommendations: string[] = [];
      const compatibility: Record<string, boolean> = {};
      let estimatedSavings = 0;
      
      // Analizar formato actual
      const currentFormat = path.extname(filePath).substring(1).toLowerCase();
      compatibility[currentFormat] = true;
      
      // Recomendaciones basadas en tamaño
      if (imageInfo.width && imageInfo.height) {
        if (imageInfo.width > 2048 || imageInfo.height > 2048) {
          recommendations.push('Imagen muy grande, considerar redimensionamiento a 2048px máximo');
          estimatedSavings += 40;
        }
        
        if (imageInfo.width > 1024 || imageInfo.height > 1024) {
          recommendations.push('Imagen grande, considerar redimensionamiento a 1024px máximo');
          estimatedSavings += 25;
        }
      }
      
      // Recomendaciones basadas en formato
      if (currentFormat === 'png' && !imageInfo.hasAlpha) {
        recommendations.push('PNG sin transparencia, convertir a JPEG para mejor compresión');
        estimatedSavings += 30;
        compatibility['jpg'] = true;
        compatibility['webp'] = true;
      }
      
      if (currentFormat === 'jpg' || currentFormat === 'jpeg') {
        recommendations.push('Considerar WebP para mejor compresión');
        estimatedSavings += 15;
        compatibility['webp'] = true;
        compatibility['avif'] = true;
      }
      
      // Recomendaciones de calidad
      if (originalSize > 1024 * 1024) { // > 1MB
        recommendations.push('Archivo grande, reducir calidad a 80-85%');
        estimatedSavings += 20;
      }
      
      // Configuración óptima
      const bestSettings: OptimizationOptions = {
        quality: 85,
        format: this.determineBestFormat(filePath, 85),
        resize: {
          enabled: (imageInfo.width || 0) > 1024 || (imageInfo.height || 0) > 1024,
          maxWidth: 1024,
          maxHeight: 1024,
          maintainAspectRatio: true
        },
        metadata: {
          preserve: false,
          strip: ['exif', 'icc', 'xmp']
        }
      };
      
      return {
        recommendations,
        estimatedSavings: Math.min(estimatedSavings, 80),
        bestSettings,
        compatibility
      };
      
    } catch (error) {
      this.logger.error(`❌ Error analizando imagen: ${error}`);
      return {
        recommendations: ['Usar calidad 85% para balance óptimo'],
        estimatedSavings: 20,
        bestSettings: { quality: 85, format: 'webp' },
        compatibility: { webp: true, jpg: true, png: true }
      };
    }
  }

  async batchOptimize(filePaths: string[], options: OptimizationOptions): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    const batchSize = 3; // Procesar en lotes de 3

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.optimize(filePath, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('❌ Error en batch:', result.reason);
        }
      }

      this.logger.progress(`Optimizando imágenes`, i + batch.length, filePaths.length);
    }

    return results;
  }

  async validate(filePath: string): Promise<boolean> {
    try {
      await sharp(filePath).metadata();
      return true;
    } catch (error) {
      return false;
    }
  }

  getSupportedFormats(): string[] {
    return this.supportedFormats;
  }

  private determineBestFormat(filePath: string, quality: number): string {
    const ext = path.extname(filePath).toLowerCase().substring(1);
    
    // Si es PNG con transparencia, mantener PNG
    if (ext === 'png') {
      return 'png';
    }
    
    // Para otros formatos, preferir WebP si la calidad es alta
    if (quality >= 80) {
      return 'webp';
    }
    
    // Para calidad media, usar JPEG
    if (quality >= 60) {
      return 'jpg';
    }
    
    // Para calidad baja, mantener formato original
    return ext;
  }

  private generateOutputPath(inputPath: string, format: string): string {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${name}_optimized.${format}`);
  }

  private applyFormatOptimizations(pipeline: sharp.Sharp, format: string, options: OptimizationOptions): sharp.Sharp {
    switch (format) {
      case 'webp':
        return pipeline.webp({ quality: options.quality || 85 });
      case 'avif':
        return pipeline.avif({ quality: options.quality || 85 });
      case 'jpg':
      case 'jpeg':
        return pipeline.jpeg({ quality: options.quality || 85, progressive: true });
      case 'png':
        return pipeline.png({ compressionLevel: 9, progressive: true });
      default:
        return pipeline;
    }
  }

  private applyQualityOptimization(pipeline: sharp.Sharp, format: string, quality: number): sharp.Sharp {
    switch (format) {
      case 'webp':
        return pipeline.webp({ quality });
      case 'avif':
        return pipeline.avif({ quality });
      case 'jpg':
      case 'jpeg':
        return pipeline.jpeg({ quality, progressive: true });
      case 'png':
        return pipeline.png({ compressionLevel: Math.floor((100 - quality) / 10) });
      default:
        return pipeline;
    }
  }
} 