import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  metadata?: any;
  error?: Error;
}

export class Logger {
  private logger: winston.Logger;
  private service: string;

  constructor(service: string) {
    this.service = service;
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, requestId, userId, metadata, error, ...rest }) => {
        const logEntry: LogEntry = {
          timestamp,
          level: level as LogLevel,
          message,
          service,
          requestId,
          userId,
          metadata,
          error
        };

        if (error) {
          logEntry.error = error;
        }

        return JSON.stringify(logEntry, null, 2);
      })
    );

    const transports: winston.transport[] = [];

    // Console transport
    if (!config.server.isProduction) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, service }) => {
              return `${timestamp} [${service}] ${level}: ${message}`;
            })
          )
        })
      );
    }

    // File transport
    if (config.logging.file) {
      transports.push(
        new DailyRotateFile({
          filename: config.logging.file,
          datePattern: 'YYYY-MM-DD',
          maxSize: config.logging.maxSize,
          maxFiles: config.logging.maxFiles,
          format: logFormat
        })
      );
    }

    // Error file transport
    transports.push(
      new DailyRotateFile({
        filename: config.logging.file.replace('.log', '.error.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: config.logging.maxSize,
        maxFiles: config.logging.maxFiles,
        level: 'error',
        format: logFormat
      })
    );

    return winston.createLogger({
      level: config.logging.level,
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  public error(message: string, error?: Error, metadata?: any): void {
    this.logger.error(message, {
      service: this.service,
      error,
      metadata
    });
  }

  public warn(message: string, metadata?: any): void {
    this.logger.warn(message, {
      service: this.service,
      metadata
    });
  }

  public info(message: string, metadata?: any): void {
    this.logger.info(message, {
      service: this.service,
      metadata
    });
  }

  public debug(message: string, metadata?: any): void {
    this.logger.debug(message, {
      service: this.service,
      metadata
    });
  }

  public trace(message: string, metadata?: any): void {
    this.logger.silly(message, {
      service: this.service,
      metadata
    });
  }

  public success(message: string, metadata?: any): void {
    this.logger.info(`✅ ${message}`, {
      service: this.service,
      metadata
    });
  }

  public start(message: string, metadata?: any): void {
    this.logger.info(`🚀 ${message}`, {
      service: this.service,
      metadata
    });
  }

  public complete(message: string, metadata?: any): void {
    this.logger.info(`✅ ${message}`, {
      service: this.service,
      metadata
    });
  }

  public fail(message: string, error?: Error, metadata?: any): void {
    this.logger.error(`❌ ${message}`, {
      service: this.service,
      error,
      metadata
    });
  }

  public request(req: any, res: any, next: any): void {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();
    const userId = req.user?.id;

    // Log request start
    this.info('Request started', {
      requestId,
      userId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding: any) {
      const duration = Date.now() - startTime;
      
      this.info('Request completed', {
        requestId,
        userId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length')
      });

      originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getLogs(level?: LogLevel, service?: string, limit: number = 100): LogEntry[] {
    // Esta función sería implementada para leer logs desde archivos
    // Por ahora retorna un array vacío
    return [];
  }

  public async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
}

// Logger singleton para uso global
export const globalLogger = new Logger('Global');

// Middleware de logging para Express
export const loggingMiddleware = (logger: Logger) => {
  return (req: any, res: any, next: any) => {
    logger.request(req, res, next);
  };
};

// Función helper para crear logger con contexto
export function createLogger(service: string): Logger {
  return new Logger(service);
} 