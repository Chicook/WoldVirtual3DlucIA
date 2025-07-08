/**
 * @fileoverview Middleware de manejo de errores avanzado
 * @module backend/src/middleware/errorHandler
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorHandler');

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
}

/**
 * Clase para errores personalizados de la aplicación
 */
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores específicos de la aplicación
 */
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Límite de velocidad excedido') {
    super(message, 429, 'RATE_LIMIT');
  }
}

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message, code = 'INTERNAL_ERROR', details } = error;

  // Log del error
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
    message,
    code,
    details,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  // Log según el tipo de error
  if (statusCode >= 500) {
    logger.error('Error del servidor:', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Error del cliente:', errorLog);
  } else {
    logger.info('Error informativo:', errorLog);
  }

  // Manejar errores específicos de TypeORM
  if (error.name === 'QueryFailedError') {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    message = 'Error en la base de datos';
  }

  if (error.name === 'EntityNotFoundError') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Recurso no encontrado';
  }

  if (error.name === 'CannotConnectError') {
    statusCode = 503;
    code = 'SERVICE_UNAVAILABLE';
    message = 'Servicio no disponible';
  }

  // Respuesta estructurada
  const response: any = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Agregar detalles en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.error.details = details;
    response.error.stack = error.stack;
  }

  // Agregar información adicional para errores de validación
  if (statusCode === 400 && details) {
    response.error.validationErrors = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Middleware para validar JSON
 */
export const jsonErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    const customError = new ValidationError('JSON inválido en el cuerpo de la petición');
    next(customError);
  } else {
    next(error);
  }
};

/**
 * Middleware para manejar timeouts
 */
export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      const error = new CustomError('Timeout de la petición', 408, 'TIMEOUT');
      next(error);
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Middleware para rate limiting básico
 */
export const rateLimitHandler = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const userRequests = requests.get(ip);
    
    if (!userRequests || userRequests.resetTime < windowStart) {
      requests.set(ip, { count: 1, resetTime: now });
    } else if (userRequests.count >= maxRequests) {
      const error = new RateLimitError(`Máximo ${maxRequests} requests por ${windowMs / 1000} segundos`);
      return next(error);
    } else {
      userRequests.count++;
    }

    next();
  };
};

/**
 * Función para crear errores de validación
 */
export const createValidationError = (field: string, message: string, value?: any): ValidationError => {
  return new ValidationError(`Error de validación en ${field}: ${message}`, {
    field,
    message,
    value
  });
};

/**
 * Función para crear errores de base de datos
 */
export const createDatabaseError = (operation: string, details?: any): CustomError => {
  return new CustomError(
    `Error en operación de base de datos: ${operation}`,
    500,
    'DATABASE_ERROR',
    details
  );
};

export default errorHandler; 