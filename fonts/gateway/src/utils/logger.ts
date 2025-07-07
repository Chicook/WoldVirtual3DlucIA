/**
 * @fileoverview Logger para el gateway del metaverso
 * @module @metaverso/gateway/utils/logger
 */

import { LoggingConfig } from '../types';

/**
 * Logger personalizado
 */
export class Logger {
  private config: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.config = config;
  }

  /**
   * Log de información
   */
  info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Log de error
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Log de debug
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.level === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
} 