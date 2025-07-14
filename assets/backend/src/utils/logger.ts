/**
 * @fileoverview Sistema de logging para el backend del metaverso
 * @module backend/src/utils/logger
 */

import winston from 'winston';

/**
 * Clase Logger para el sistema
 */
export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'metaverso-backend' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Log de información
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, { context: this.context, ...meta });
  }

  /**
   * Log de éxito
   */
  success(message: string, meta?: any): void {
    this.logger.info(`✅ ${message}`, { context: this.context, ...meta });
  }

  /**
   * Log de advertencia
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(`⚠️ ${message}`, { context: this.context, ...meta });
  }

  /**
   * Log de error
   */
  error(message: string, error?: any): void {
    this.logger.error(`❌ ${message}`, { 
      context: this.context, 
      error: error?.message || error,
      stack: error?.stack 
    });
  }

  /**
   * Log de debug
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(`🔍 ${message}`, { context: this.context, ...meta });
  }
}

// Logger global
export const logger = new Logger('Global'); 