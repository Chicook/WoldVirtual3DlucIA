/**
 * @fileoverview Manager avanzado para validadores con múltiples tipos de validación y análisis de seguridad
 */

import { IValidator, ValidationOptions, ValidationResult } from '../interfaces/IValidator';
import { Logger } from '../utils/logger';

export interface ValidatorConfig {
  name: string;
  priority: number;
  supportedValidations: string[];
  maxFileSize: number;
  timeout: number;
  parallelValidation: boolean;
}

export interface ValidationMetrics {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  averageValidationTime: number;
  totalDataProcessed: number;
  averageSecurityScore: number;
  validationTypeUsage: Record<string, number>;
  errors: Record<string, number>;
}

export class ValidatorManager {
  private validators: Map<string, IValidator> = new Map();
  private configs: Map<string, ValidatorConfig> = new Map();
  private metrics: Map<string, ValidationMetrics> = new Map();
  private logger: Logger;
  private validationCache: Map<string, ValidationResult> = new Map();

  constructor() {
    this.logger = new Logger('ValidatorManager');
  }

  registerValidator(name: string, validator: IValidator, config: ValidatorConfig): void {
    this.validators.set(name, validator);
    this.configs.set(name, config);
    this.metrics.set(name, {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      averageValidationTime: 0,
      totalDataProcessed: 0,
      averageSecurityScore: 0,
      validationTypeUsage: {},
      errors: {}
    });
    this.logger.info(`🔍 Validator registrado: ${name}`);
  }

  async validate(filePath: string, options: ValidationOptions): Promise<ValidationResult> {
    const startTime = Date.now();
    const cacheKey = `${filePath}-${JSON.stringify(options)}`;
    
    // Verificar caché
    if (this.validationCache.has(cacheKey)) {
      this.logger.info(`📋 Usando resultado en caché para: ${filePath}`);
      return this.validationCache.get(cacheKey)!;
    }
    
    try {
      // Obtener información del archivo
      const fileInfo = await this.getFileInfo(filePath);
      
      // Seleccionar validadores apropiados
      const selectedValidators = await this.selectValidators(fileInfo, options);
      
      // Ejecutar validaciones
      const results = await this.executeValidations(filePath, selectedValidators, options);
      
      // Combinar resultados
      const combinedResult = this.combineValidationResults(results);
      
      // Actualizar métricas
      this.updateMetrics(selectedValidators, Date.now() - startTime, true, combinedResult);
      
      // Guardar en caché
      this.validationCache.set(cacheKey, combinedResult);
      
      return combinedResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.updateMetrics([], Date.now() - startTime, false, null, errorMessage);
      throw error;
    }
  }

  private async getFileInfo(filePath: string): Promise<{
    size: number;
    format: string;
    mimeType: string;
    hash: string;
  }> {
    const fs = require('fs-extra');
    const crypto = require('crypto');
    const mimeTypes = require('mime-types');
    
    const stats = await fs.stat(filePath);
    const buffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const mimeType = mimeTypes.lookup(filePath) || 'application/octet-stream';
    const format = filePath.split('.').pop()?.toLowerCase() || 'unknown';
    
    return {
      size: stats.size,
      format,
      mimeType,
      hash
    };
  }

  private async selectValidators(fileInfo: any, options: ValidationOptions): Promise<string[]> {
    const selectedValidators: string[] = [];
    
    for (const [name, validator] of this.validators) {
      const config = this.configs.get(name);
      if (!config) continue;

      // Verificar tamaño máximo
      if (fileInfo.size > config.maxFileSize) {
        continue;
      }

      // Verificar si el validator soporta las validaciones requeridas
      const hasRequiredValidations = config.supportedValidations.some(validation => {
        switch (validation) {
          case 'integrity':
            return options.integrityCheck;
          case 'virus':
            return options.virusScan;
          case 'security':
            return options.securityScan;
          case 'format':
            return options.formatValidation;
          case 'metadata':
            return options.metadataValidation;
          default:
            return true;
        }
      });

      if (hasRequiredValidations) {
        selectedValidators.push(name);
      }
    }

    // Ordenar por prioridad
    selectedValidators.sort((a, b) => {
      const configA = this.configs.get(a);
      const configB = this.configs.get(b);
      return (configB?.priority || 0) - (configA?.priority || 0);
    });

    return selectedValidators;
  }

  private async executeValidations(
    filePath: string, 
    validatorNames: string[], 
    options: ValidationOptions
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    if (validatorNames.length === 0) {
      return results;
    }

    // Ejecutar validaciones en paralelo si está habilitado
    const config = this.configs.get(validatorNames[0]);
    if (config?.parallelValidation && validatorNames.length > 1) {
      const validationPromises = validatorNames.map(name => {
        const validator = this.validators.get(name);
        return validator ? validator.validate(filePath, options) : null;
      });

      const validationResults = await Promise.allSettled(validationPromises);
      
      for (const result of validationResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
    } else {
      // Ejecutar validaciones secuencialmente
      for (const name of validatorNames) {
        try {
          const validator = this.validators.get(name);
          if (validator) {
            const result = await validator.validate(filePath, options);
            results.push(result);
          }
        } catch (error) {
          this.logger.warn(`⚠️ Error en validator ${name}: ${error}`);
        }
      }
    }

    return results;
  }

  private combineValidationResults(results: ValidationResult[]): ValidationResult {
    if (results.length === 0) {
      return {
        valid: false,
        errors: ['No se encontraron validadores apropiados'],
        warnings: [],
        metadata: {},
        securityScore: 0,
        compatibility: {},
        recommendations: []
      };
    }

    const combined: ValidationResult = {
      valid: results.every(r => r.valid),
      errors: [],
      warnings: [],
      metadata: {},
      securityScore: 0,
      compatibility: {},
      recommendations: []
    };

    // Combinar errores y warnings
    results.forEach(result => {
      combined.errors.push(...result.errors);
      combined.warnings.push(...result.warnings);
      combined.recommendations.push(...result.recommendations);
      
      // Combinar metadatos
      Object.assign(combined.metadata, result.metadata);
      Object.assign(combined.compatibility, result.compatibility);
    });

    // Calcular score de seguridad promedio
    const validScores = results.map(r => r.securityScore).filter(score => score > 0);
    combined.securityScore = validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
      : 0;

    return combined;
  }

  private updateMetrics(
    validatorNames: string[], 
    duration: number, 
    success: boolean, 
    result: ValidationResult | null, 
    error?: string
  ): void {
    validatorNames.forEach(name => {
      const metrics = this.metrics.get(name);
      if (!metrics) return;

      metrics.totalValidations++;
      metrics.averageValidationTime = (metrics.averageValidationTime + duration) / 2;

      if (success && result) {
        metrics.successfulValidations++;
        metrics.averageSecurityScore = (metrics.averageSecurityScore + result.securityScore) / 2;
        
        // Actualizar uso de tipos de validación
        Object.keys(result.compatibility).forEach(validationType => {
          metrics.validationTypeUsage[validationType] = (metrics.validationTypeUsage[validationType] || 0) + 1;
        });
      } else {
        metrics.failedValidations++;
        if (error) {
          metrics.errors[error] = (metrics.errors[error] || 0) + 1;
        }
      }
    });
  }

  async validateBatch(filePaths: string[], options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const batchSize = 3; // Validar en lotes de 3

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

      this.logger.progress(`Validando assets`, i + batch.length, filePaths.length);
    }

    return results;
  }

  getMetrics(validatorName?: string): ValidationMetrics | Record<string, ValidationMetrics> {
    if (validatorName) {
      return this.metrics.get(validatorName) || {} as ValidationMetrics;
    }
    return Object.fromEntries(this.metrics);
  }

  getValidator(validatorName: string): IValidator | undefined {
    return this.validators.get(validatorName);
  }

  listValidators(): string[] {
    return Array.from(this.validators.keys());
  }

  clearCache(): void {
    this.validationCache.clear();
    this.logger.info('🧹 Caché de validaciones limpiado');
  }
} 