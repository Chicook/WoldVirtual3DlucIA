/**
 * @fileoverview Sistema de logging para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/utils/logger
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

export class Logger {
  private module: string;
  private static logLevel: LogLevel = LogLevel.INFO;
  private static logs: LogEntry[] = [];
  private static maxLogs: number = 1000;

  constructor(module: string) {
    this.module = module;
  }

  /**
   * Establecer nivel de log
   */
  static setLogLevel(level: LogLevel): void {
    Logger.logLevel = level;
  }

  /**
   * Obtener logs
   */
  static getLogs(): LogEntry[] {
    return Logger.logs;
  }

  /**
   * Limpiar logs
   */
  static clearLogs(): void {
    Logger.logs = [];
  }

  /**
   * Log de error
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log de información
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log de debug
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log interno
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level <= Logger.logLevel) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level,
        module: this.module,
        message,
        data
      };

      Logger.logs.push(entry);

      // Limitar número de logs
      if (Logger.logs.length > Logger.maxLogs) {
        Logger.logs = Logger.logs.slice(-Logger.maxLogs);
      }

      // Mostrar en consola
      const timestamp = new Date(entry.timestamp).toISOString();
      const levelStr = LogLevel[level];
      const prefix = `[${timestamp}] [${levelStr}] [${this.module}]`;
      
      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }
}

export default Logger; 