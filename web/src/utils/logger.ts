/**
 * @fileoverview Sistema de logging estructurado para WoldVirtual3DlucIA
 * @version 1.0.0
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SUCCESS = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  error?: Error | undefined;
}

export class Logger {
  private module: string;
  private level: LogLevel;
  private enableConsole: boolean;
  private enableStorage: boolean;
  private maxEntries: number;
  private entries: LogEntry[];

  constructor(
    module: string,
    options: {
      level?: LogLevel;
      enableConsole?: boolean;
      enableStorage?: boolean;
      maxEntries?: number;
    } = {}
  ) {
    this.module = module;
    this.level = options.level || LogLevel.INFO;
    this.enableConsole = options.enableConsole !== false;
    this.enableStorage = options.enableStorage || false;
    this.maxEntries = options.maxEntries || 1000;
    this.entries = [];
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (level < this.level) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      module: this.module,
      message,
      data,
      error
    };

    // Agregar a entradas internas
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Log a consola si está habilitado
    if (this.enableConsole) {
      this.logToConsole(entry);
    }

    // Guardar en storage si está habilitado
    if (this.enableStorage) {
      this.logToStorage(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.module}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} 🔍 ${entry.message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ℹ️ ${entry.message}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ⚠️ ${entry.message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ❌ ${entry.message}`, entry.error || entry.data || '');
        break;
      case LogLevel.SUCCESS:
        console.log(`${prefix} ✅ ${entry.message}`, entry.data || '');
        break;
    }
  }

  private logToStorage(entry: LogEntry): void {
    try {
      const storageKey = `woldvirtual_logs_${this.module}`;
      const existingLogs = localStorage.getItem(storageKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      });

      // Mantener solo los últimos 100 logs en storage
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (error) {
      // Silenciar errores de storage
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  success(message: string, data?: any): void {
    this.log(LogLevel.SUCCESS, message, data);
  }

  // Métodos especializados para el módulo de imágenes
  imageProcessed(filename: string, stats: { size: number; reduction: number; time: number }): void {
    this.success(`Imagen procesada: ${filename}`, {
      originalSize: stats.size,
      reduction: `${stats.reduction.toFixed(1)}%`,
      processingTime: `${stats.time}ms`
    });
  }

  imageError(filename: string, error: string): void {
    this.error(`Error procesando imagen: ${filename}`, new Error(error));
  }

  cacheHit(filename: string): void {
    this.info(`Cache hit: ${filename}`);
  }

  cacheMiss(filename: string): void {
    this.info(`Cache miss: ${filename}`);
  }

  // Métodos de utilidad
  getEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.entries.filter(entry => entry.level >= level);
    }
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  getStats(): { total: number; byLevel: Record<LogLevel, number> } {
    const byLevel: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.SUCCESS]: 0
    };

    this.entries.forEach(entry => {
      byLevel[entry.level]++;
    });

    return {
      total: this.entries.length,
      byLevel
    };
  }

  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }
}

// Logger global para el sistema
export const globalLogger = new Logger('WoldVirtual3DlucIA', {
  level: LogLevel.INFO,
  enableConsole: true,
  enableStorage: true
});

// LogEntry ya está exportado como interface, no necesitamos exportarlo de nuevo 