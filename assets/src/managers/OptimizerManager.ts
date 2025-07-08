/**
 * @fileoverview Manager avanzado para optimizadores con análisis inteligente y optimización adaptativa
 */

import { IOptimizer, OptimizationOptions, OptimizationResult } from '../interfaces/IOptimizer';
import { Logger } from '../utils/logger';

export interface OptimizerConfig {
  name: string;
  priority: number;
  supportedFormats: string[];
  supportedTechniques: string[];
  memoryLimit: number;
  timeout: number;
  qualityRange: [number, number];
}

export interface OptimizationMetrics {
  totalOptimizations: number;
  successfulOptimizations: number;
  failedOptimizations: number;
  averageOptimizationTime: number;
  totalDataProcessed: number;
  averageOptimizationRatio: number;
  techniqueUsage: Record<string, number>;
  formatUsage: Record<string, number>;
  errors: Record<string, number>;
}

export class OptimizerManager {
  private optimizers: Map<string, IOptimizer> = new Map();
  private configs: Map<string, OptimizerConfig> = new Map();
  private metrics: Map<string, OptimizationMetrics> = new Map();
  private logger: Logger;
  private techniqueCache: Map<string, string[]> = new Map();

  constructor() {
    this.logger = new Logger('OptimizerManager');
  }

  registerOptimizer(name: string, optimizer: IOptimizer, config: OptimizerConfig): void {
    this.optimizers.set(name, optimizer);
    this.configs.set(name, config);
    this.metrics.set(name, {
      totalOptimizations: 0,
      successfulOptimizations: 0,
      failedOptimizations: 0,
      averageOptimizationTime: 0,
      totalDataProcessed: 0,
      averageOptimizationRatio: 0,
      techniqueUsage: {},
      formatUsage: {},
      errors: {}
    });
    this.logger.info(`⚡ Optimizer registrado: ${name}`);
  }

  async optimize(filePath: string, options: OptimizationOptions): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    try {
      // Seleccionar el mejor optimizer para el archivo
      const bestOptimizer = await this.selectBestOptimizer(filePath, options);
      if (!bestOptimizer) {
        throw new Error('No se encontró un optimizer adecuado para el archivo');
      }

      const optimizer = this.optimizers.get(bestOptimizer);
      if (!optimizer) {
        throw new Error(`Optimizer no encontrado: ${bestOptimizer}`);
      }

      // Analizar archivo para obtener recomendaciones
      const analysis = await optimizer.analyze(filePath);
      
      // Optimizar opciones basado en análisis
      const optimizedOptions = await this.optimizeOptions(filePath, options, analysis);

      const result = await optimizer.optimize(filePath, optimizedOptions);
      
      // Actualizar métricas
      this.updateMetrics(bestOptimizer, Date.now() - startTime, true, result);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.updateMetrics('unknown', Date.now() - startTime, false, null, errorMessage);
      throw error;
    }
  }

  private async selectBestOptimizer(filePath: string, options: OptimizationOptions): Promise<string> {
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    const cacheKey = `${fileExtension}-${options.format}`;
    
    // Verificar caché
    if (this.techniqueCache.has(cacheKey)) {
      const cachedOptimizer = this.techniqueCache.get(cacheKey)![0];
      if (this.optimizers.has(cachedOptimizer)) {
        return cachedOptimizer;
      }
    }

    let bestOptimizer = '';
    let bestScore = -1;

    for (const [name, optimizer] of this.optimizers) {
      const config = this.configs.get(name);
      if (!config) continue;

      // Verificar compatibilidad de formato
      if (!config.supportedFormats.includes(options.format)) {
        continue;
      }

      // Analizar archivo para obtener recomendaciones
      try {
        const analysis = await optimizer.analyze(filePath);
        const score = this.calculateOptimizerScore(analysis, config, options);
        
        if (score > bestScore) {
          bestScore = score;
          bestOptimizer = name;
        }
      } catch (error) {
        this.logger.warn(`⚠️ Error analizando con ${name}: ${error}`);
      }
    }

    // Guardar en caché
    if (bestOptimizer) {
      this.techniqueCache.set(cacheKey, [bestOptimizer]);
    }

    return bestOptimizer;
  }

  private calculateOptimizerScore(
    analysis: any, 
    config: OptimizerConfig, 
    options: OptimizationOptions
  ): number {
    let score = 0;

    // Factor de ahorro estimado
    score += analysis.estimatedSavings * 10;

    // Factor de compatibilidad
    const compatibilityScore = Object.values(analysis.compatibility)
      .filter(Boolean).length / Object.keys(analysis.compatibility).length;
    score += compatibilityScore * 20;

    // Factor de prioridad del optimizer
    score += config.priority * 2;

    // Factor de calidad dentro del rango soportado
    if (options.quality >= config.qualityRange[0] && options.quality <= config.qualityRange[1]) {
      score += 15;
    }

    return score;
  }

  private async optimizeOptions(
    filePath: string, 
    options: OptimizationOptions, 
    analysis: any
  ): Promise<OptimizationOptions> {
    const optimizedOptions = { ...options };

    // Aplicar recomendaciones del análisis
    if (analysis.bestSettings) {
      Object.assign(optimizedOptions, analysis.bestSettings);
    }

    // Ajustar calidad si está fuera del rango óptimo
    const config = this.configs.get(await this.selectBestOptimizer(filePath, options));
    if (config && (options.quality < config.qualityRange[0] || options.quality > config.qualityRange[1])) {
      optimizedOptions.quality = Math.max(config.qualityRange[0], 
        Math.min(options.quality, config.qualityRange[1]));
    }

    // Habilitar optimización adaptativa para archivos grandes
    const stats = await this.getFileStats(filePath);
    if (stats.size > 5 * 1024 * 1024) { // > 5MB
      optimizedOptions.adaptive = { enabled: true, targetSize: stats.size * 0.7, qualityRange: [60, 90] };
    }

    return optimizedOptions;
  }

  private async getFileStats(filePath: string): Promise<{ size: number }> {
    const fs = require('fs-extra');
    const stats = await fs.stat(filePath);
    return { size: stats.size };
  }

  private updateMetrics(
    optimizerName: string, 
    duration: number, 
    success: boolean, 
    result: OptimizationResult | null, 
    error?: string
  ): void {
    const metrics = this.metrics.get(optimizerName);
    if (!metrics) return;

    metrics.totalOptimizations++;
    metrics.averageOptimizationTime = (metrics.averageOptimizationTime + duration) / 2;

    if (success && result) {
      metrics.successfulOptimizations++;
      metrics.totalDataProcessed += result.originalSize;
      metrics.averageOptimizationRatio = (metrics.averageOptimizationRatio + result.optimizationRatio) / 2;
      
      // Actualizar uso de técnicas
      result.appliedTechniques.forEach(technique => {
        metrics.techniqueUsage[technique] = (metrics.techniqueUsage[technique] || 0) + 1;
      });
      
      // Actualizar uso de formatos
      const format = result.outputPath.split('.').pop() || 'unknown';
      metrics.formatUsage[format] = (metrics.formatUsage[format] || 0) + 1;
    } else {
      metrics.failedOptimizations++;
      if (error) {
        metrics.errors[error] = (metrics.errors[error] || 0) + 1;
      }
    }
  }

  async batchOptimize(filePaths: string[], options: OptimizationOptions): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    const batchSize = 5; // Procesar en lotes de 5

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

      this.logger.progress(`Optimizando assets`, i + batch.length, filePaths.length);
    }

    return results;
  }

  getMetrics(optimizerName?: string): OptimizationMetrics | Record<string, OptimizationMetrics> {
    if (optimizerName) {
      return this.metrics.get(optimizerName) || {} as OptimizationMetrics;
    }
    return Object.fromEntries(this.metrics);
  }

  getOptimizer(optimizerName: string): IOptimizer | undefined {
    return this.optimizers.get(optimizerName);
  }

  listOptimizers(): string[] {
    return Array.from(this.optimizers.keys());
  }

  clearCache(): void {
    this.techniqueCache.clear();
    this.logger.info('🧹 Caché de técnicas limpiado');
  }
} 