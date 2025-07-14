/**
 * @fileoverview Manager avanzado para compressores con análisis inteligente y selección automática
 */

import { ICompressor, CompressionOptions, CompressionResult } from '../interfaces/ICompressor';
import { Logger } from '../utils/logger';

export interface CompressorConfig {
  name: string;
  priority: number;
  maxFileSize: number;
  supportedFormats: string[];
  memoryLimit: number;
  timeout: number;
}

export interface CompressionMetrics {
  totalCompressions: number;
  successfulCompressions: number;
  failedCompressions: number;
  averageCompressionTime: number;
  totalDataProcessed: number;
  averageCompressionRatio: number;
  algorithmUsage: Record<string, number>;
  errors: Record<string, number>;
}

export class CompressorManager {
  private compressors: Map<string, ICompressor> = new Map();
  private configs: Map<string, CompressorConfig> = new Map();
  private metrics: Map<string, CompressionMetrics> = new Map();
  private logger: Logger;
  private algorithmCache: Map<string, string> = new Map();

  constructor() {
    this.logger = new Logger('CompressorManager');
  }

  registerCompressor(name: string, compressor: ICompressor, config: CompressorConfig): void {
    this.compressors.set(name, compressor);
    this.configs.set(name, config);
    this.metrics.set(name, {
      totalCompressions: 0,
      successfulCompressions: 0,
      failedCompressions: 0,
      averageCompressionTime: 0,
      totalDataProcessed: 0,
      averageCompressionRatio: 0,
      algorithmUsage: {},
      errors: {}
    });
    this.logger.info(`🗜️ Compressor registrado: ${name}`);
  }

  async compress(filePath: string, options: CompressionOptions): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      // Seleccionar el mejor compressor para el archivo
      const bestCompressor = await this.selectBestCompressor(filePath, options);
      if (!bestCompressor) {
        throw new Error('No se encontró un compressor adecuado para el archivo');
      }

      const compressor = this.compressors.get(bestCompressor);
      if (!compressor) {
        throw new Error(`Compressor no encontrado: ${bestCompressor}`);
      }

      // Optimizar opciones basado en análisis previo
      const optimizedOptions = await this.optimizeCompressionOptions(filePath, options);

      const result = await compressor.compress(filePath, optimizedOptions);
      
      // Actualizar métricas
      this.updateMetrics(bestCompressor, Date.now() - startTime, true, result);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.updateMetrics('unknown', Date.now() - startTime, false, null, errorMessage);
      throw error;
    }
  }

  private async selectBestCompressor(filePath: string, options: CompressionOptions): Promise<string> {
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    const cacheKey = `${fileExtension}-${options.algorithm}`;
    
    // Verificar caché
    if (this.algorithmCache.has(cacheKey)) {
      return this.algorithmCache.get(cacheKey)!;
    }

    let bestCompressor = '';
    let bestScore = -1;

    for (const [name, compressor] of this.compressors) {
      const config = this.configs.get(name);
      if (!config) continue;

      // Verificar compatibilidad de formato
      if (!config.supportedFormats.includes(fileExtension || '')) {
        continue;
      }

      // Analizar archivo para obtener recomendaciones
      try {
        const analysis = await compressor.analyze(filePath);
        const score = this.calculateCompressorScore(analysis, config, options);
        
        if (score > bestScore) {
          bestScore = score;
          bestCompressor = name;
        }
      } catch (error) {
        this.logger.warn(`⚠️ Error analizando con ${name}: ${error}`);
      }
    }

    // Guardar en caché
    if (bestCompressor) {
      this.algorithmCache.set(cacheKey, bestCompressor);
    }

    return bestCompressor;
  }

  private calculateCompressorScore(
    analysis: any, 
    config: CompressorConfig, 
    options: CompressionOptions
  ): number {
    let score = 0;

    // Factor de ratio de compresión estimado
    score += analysis.estimatedRatio * 10;

    // Factor de tiempo de procesamiento (menor es mejor)
    score += (1000 / (analysis.processingTime + 1)) * 5;

    // Factor de prioridad del compressor
    score += config.priority * 2;

    // Factor de compatibilidad con el algoritmo solicitado
    if (analysis.bestAlgorithm === options.algorithm) {
      score += 20;
    }

    return score;
  }

  private async optimizeCompressionOptions(
    filePath: string, 
    options: CompressionOptions
  ): Promise<CompressionOptions> {
    const optimizedOptions = { ...options };

    // Ajustar nivel de compresión basado en el tamaño del archivo
    const stats = await this.getFileStats(filePath);
    if (stats.size > 10 * 1024 * 1024) { // > 10MB
      optimizedOptions.level = Math.min(options.level + 2, 9);
    } else if (stats.size < 1024 * 1024) { // < 1MB
      optimizedOptions.level = Math.max(options.level - 1, 1);
    }

    // Habilitar compresión paralela para archivos grandes
    if (stats.size > 5 * 1024 * 1024) {
      optimizedOptions.parallelProcessing = true;
    }

    return optimizedOptions;
  }

  private async getFileStats(filePath: string): Promise<{ size: number }> {
    const fs = require('fs-extra');
    const stats = await fs.stat(filePath);
    return { size: stats.size };
  }

  private updateMetrics(
    compressorName: string, 
    duration: number, 
    success: boolean, 
    result: CompressionResult | null, 
    error?: string
  ): void {
    const metrics = this.metrics.get(compressorName);
    if (!metrics) return;

    metrics.totalCompressions++;
    metrics.averageCompressionTime = (metrics.averageCompressionTime + duration) / 2;

    if (success && result) {
      metrics.successfulCompressions++;
      metrics.totalDataProcessed += result.originalSize;
      metrics.averageCompressionRatio = (metrics.averageCompressionRatio + result.compressionRatio) / 2;
      metrics.algorithmUsage[result.algorithm] = (metrics.algorithmUsage[result.algorithm] || 0) + 1;
    } else {
      metrics.failedCompressions++;
      if (error) {
        metrics.errors[error] = (metrics.errors[error] || 0) + 1;
      }
    }
  }

  async benchmark(filePath: string): Promise<Record<string, CompressionResult>> {
    const results: Record<string, CompressionResult> = {};
    
    for (const [name, compressor] of this.compressors) {
      try {
        const benchmarkResults = await compressor.benchmark(filePath);
        results[name] = benchmarkResults;
      } catch (error) {
        this.logger.warn(`⚠️ Error en benchmark de ${name}: ${error}`);
      }
    }
    
    return results;
  }

  getMetrics(compressorName?: string): CompressionMetrics | Record<string, CompressionMetrics> {
    if (compressorName) {
      return this.metrics.get(compressorName) || {} as CompressionMetrics;
    }
    return Object.fromEntries(this.metrics);
  }

  getCompressor(compressorName: string): ICompressor | undefined {
    return this.compressors.get(compressorName);
  }

  listCompressors(): string[] {
    return Array.from(this.compressors.keys());
  }

  clearCache(): void {
    this.algorithmCache.clear();
    this.logger.info('🧹 Caché de algoritmos limpiado');
  }
} 