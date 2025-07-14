/**
 * @fileoverview Sistema de logging para el sistema de assets
 * @module assets/src/utils/logger
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Clase Logger personalizada para el sistema de assets
 */
export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.logger = this.createLogger();
  }

  /**
   * Crea el logger de Winston
   */
  private createLogger(): winston.Logger {
    const logDir = path.join(process.cwd(), 'logs', 'assets');
    fs.ensureDirSync(logDir);

    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
      })
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { context: this.context },
      transports: [
        // Consola
        new winston.transports.Console({
          format: consoleFormat
        }),
        
        // Archivo de errores
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        
        // Archivo de logs generales
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        
        // Archivo de logs de assets
        new winston.transports.File({
          filename: path.join(logDir, 'assets.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 10
        })
      ]
    });
  }

  /**
   * Log de información
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log de éxito
   */
  success(message: string, meta?: any): void {
    this.logger.info(`✅ ${message}`, meta);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(`⚠️ ${message}`, meta);
  }

  /**
   * Log de error
   */
  error(message: string, error?: any): void {
    this.logger.error(`❌ ${message}`, { error: error?.message || error, stack: error?.stack });
  }

  /**
   * Log de debug
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(`🔍 ${message}`, meta);
  }

  /**
   * Log de progreso
   */
  progress(message: string, current: number, total: number): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    this.logger.info(`🔄 ${message} ${progressBar} ${percentage}% (${current}/${total})`);
  }

  /**
   * Log de inicio de proceso
   */
  startProcess(processName: string, meta?: any): void {
    this.logger.info(`🚀 Iniciando ${processName}...`, meta);
  }

  /**
   * Log de fin de proceso
   */
  endProcess(processName: string, duration: number, meta?: any): void {
    this.logger.info(`✅ ${processName} completado en ${duration}ms`, meta);
  }

  /**
   * Log de métricas
   */
  metrics(metrics: Record<string, any>): void {
    this.logger.info('📊 Métricas del sistema', { metrics });
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, meta?: any): void {
    const level = duration > 1000 ? 'warn' : 'info';
    this.logger[level](`⚡ ${operation} completado en ${duration}ms`, meta);
  }

  /**
   * Log de validación
   */
  validation(result: { valid: boolean; errors: string[]; warnings: string[] }): void {
    if (result.valid) {
      this.logger.info('✅ Validación exitosa', { warnings: result.warnings });
    } else {
      this.logger.error('❌ Validación fallida', { errors: result.errors, warnings: result.warnings });
    }
  }

  /**
   * Log de optimización
   */
  optimization(originalSize: number, optimizedSize: number): void {
    const reduction = ((originalSize - optimizedSize) / originalSize) * 100;
    this.logger.info(`🎯 Optimización completada: ${reduction.toFixed(1)}% reducción`, {
      originalSize,
      optimizedSize,
      reduction: `${reduction.toFixed(1)}%`
    });
  }

  /**
   * Log de compresión
   */
  compression(originalSize: number, compressedSize: number): void {
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    this.logger.info(`🗜️ Compresión completada: ${reduction.toFixed(1)}% reducción`, {
      originalSize,
      compressedSize,
      reduction: `${reduction.toFixed(1)}%`
    });
  }

  /**
   * Log de upload
   */
  upload(platform: string, url: string, size: number): void {
    this.logger.info(`📤 Upload completado a ${platform}`, { url, size });
  }

  /**
   * Log de error de upload
   */
  uploadError(platform: string, error: any): void {
    this.logger.error(`📤 Error en upload a ${platform}`, { error: error?.message || error });
  }

  /**
   * Log de catálogo
   */
  catalog(operation: string, assetId: string, meta?: any): void {
    this.logger.info(`📚 Catálogo: ${operation}`, { assetId, ...meta });
  }

  /**
   * Log de metadatos
   */
  metadata(operation: string, assetId: string, meta?: any): void {
    this.logger.info(`📋 Metadatos: ${operation}`, { assetId, ...meta });
  }

  /**
   * Log de limpieza
   */
  cleanup(itemsRemoved: number, spaceFreed: number): void {
    this.logger.info(`🧹 Limpieza completada`, { itemsRemoved, spaceFreed });
  }

  /**
   * Crea una barra de progreso visual
   */
  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `[${filledBar}${emptyBar}]`;
  }

  /**
   * Obtiene estadísticas de logs
   */
  async getStats(): Promise<{
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
  }> {
    // Implementar análisis de logs
    return {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0
    };
  }

  /**
   * Limpia logs antiguos
   */
  async cleanupLogs(daysToKeep: number = 30): Promise<void> {
    const logDir = path.join(process.cwd(), 'logs', 'assets');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const files = await fs.readdir(logDir);
      
      for (const file of files) {
        const filePath = path.join(logDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          this.logger.info(`🗑️ Log eliminado: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Error limpiando logs:', error);
    }
  }

  /**
   * Exporta logs
   */
  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    const logDir = path.join(process.cwd(), 'logs', 'assets');
    const logFile = path.join(logDir, 'assets.log');
    
    try {
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (format === 'json') {
        return JSON.stringify(lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { message: line };
          }
        }), null, 2);
      } else {
        // CSV format
        const csvLines = ['timestamp,level,context,message'];
        lines.forEach(line => {
          try {
            const log = JSON.parse(line);
            csvLines.push(`${log.timestamp},${log.level},${log.context || ''},"${log.message}"`);
          } catch {
            csvLines.push(`"${new Date().toISOString()}",info,,"${line}"`);
          }
        });
        return csvLines.join('\n');
      }
    } catch (error) {
      this.logger.error('Error exportando logs:', error);
      return '';
    }
  }
}

/**
 * Logger global para el sistema de assets
 */
export const globalLogger = new Logger('AssetsSystem');

/**
 * Factory para crear loggers específicos
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Configuración de logging
 */
export interface LogConfig {
  level: string;
  format: 'json' | 'simple';
  transports: string[];
  maxSize: number;
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
  enableRotation: boolean;
} 