import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

const logger = new Logger('ErrorHandler');

// Interfaces para tipos de error
export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
    path?: string;
    method?: string;
  };
}

// Clase personalizada para errores de la aplicación
export class ApplicationError extends Error implements AppError {
  public status: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos de la aplicación
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'No autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Demasiadas requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class CacheError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 500, 'CACHE_ERROR', details);
    this.name = 'CacheError';
  }
}

export class BuildError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 500, 'BUILD_ERROR', details);
    this.name = 'BuildError';
  }
}

// Mapeo de códigos de error a mensajes amigables
const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Los datos proporcionados son inválidos',
  AUTHENTICATION_ERROR: 'No tienes permisos para acceder a este recurso',
  AUTHORIZATION_ERROR: 'No tienes permisos para realizar esta acción',
  NOT_FOUND_ERROR: 'El recurso solicitado no fue encontrado',
  CONFLICT_ERROR: 'El recurso ya existe o está en conflicto',
  RATE_LIMIT_ERROR: 'Has excedido el límite de requests. Intenta de nuevo más tarde',
  DATABASE_ERROR: 'Error en la base de datos',
  CACHE_ERROR: 'Error en el sistema de cache',
  BUILD_ERROR: 'Error en el sistema de build',
  INTERNAL_ERROR: 'Error interno del servidor'
};

// Función para determinar si un error es operacional
function isOperationalError(error: Error): boolean {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  return false;
}

// Función para crear respuesta de error
function createErrorResponse(
  error: AppError,
  req: Request,
  includeDetails: boolean = false
): ErrorResponse {
  const errorCode = error.code || 'INTERNAL_ERROR';
  const userMessage = errorMessages[errorCode] || error.message;
  
  const response: ErrorResponse = {
    error: {
      message: userMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // Incluir detalles solo en desarrollo o si se solicita explícitamente
  if (includeDetails && error.details) {
    response.error.details = error.details;
  }

  return response;
}

// Middleware principal de manejo de errores
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Determinar el status code
    const status = error.status || 500;
    
    // Determinar si incluir detalles
    const includeDetails = process.env.NODE_ENV === 'development';
    
    // Crear respuesta de error
    const errorResponse = createErrorResponse(error, req, includeDetails);
    
    // Log del error
    if (status >= 500) {
      logger.error('Error del servidor', {
        error: error.message,
        stack: error.stack,
        status,
        code: error.code,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id
      });
    } else {
      logger.warn('Error del cliente', {
        error: error.message,
        status,
        code: error.code,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: (req as any).user?.id
      });
    }
    
    // Enviar respuesta
    res.status(status).json(errorResponse);
    
  } catch (handlerError) {
    // Si hay error en el handler, enviar respuesta genérica
    logger.error('Error en el error handler', handlerError as Error);
    
    res.status(500).json({
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Middleware para manejar errores de async/await
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para manejar errores de 404
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError('Ruta');
  error.details = {
    path: req.path,
    method: req.method
  };
  
  next(error);
};

// Middleware para manejar errores de validación de JSON
export const jsonErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    const validationError = new ValidationError('JSON inválido');
    validationError.details = {
      message: 'El cuerpo de la request debe ser JSON válido'
    };
    
    next(validationError);
  } else {
    next(error);
  }
};

// Función para manejar errores no capturados
export const handleUncaughtErrors = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Excepción no capturada', {
      error: error.message,
      stack: error.stack
    });
    
    // En producción, cerrar el proceso después de un tiempo
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
  
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Promesa rechazada no manejada', {
      reason: reason?.message || reason,
      stack: reason?.stack
    });
    
    // En producción, cerrar el proceso después de un tiempo
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
};

// Función para crear errores personalizados
export const createError = (
  message: string,
  status: number = 500,
  code?: string,
  details?: any
): ApplicationError => {
  return new ApplicationError(message, status, code, details);
};

// Función para validar y transformar errores de base de datos
export const handleDatabaseError = (error: any): ApplicationError => {
  // Errores específicos de Prisma
  if (error.code === 'P2002') {
    return new ConflictError('El recurso ya existe', {
      field: error.meta?.target?.[0]
    });
  }
  
  if (error.code === 'P2025') {
    return new NotFoundError('Registro');
  }
  
  if (error.code === 'P2003') {
    return new ValidationError('Referencia inválida', {
      field: error.meta?.field_name
    });
  }
  
  // Error genérico de base de datos
  return new DatabaseError('Error en la base de datos', {
    code: error.code,
    message: error.message
  });
};

// Función para validar y transformar errores de cache
export const handleCacheError = (error: any): ApplicationError => {
  return new CacheError('Error en el sistema de cache', {
    message: error.message,
    code: error.code
  });
};

// Función para validar y transformar errores de build
export const handleBuildError = (error: any): ApplicationError => {
  return new BuildError('Error en el sistema de build', {
    message: error.message,
    module: error.module,
    step: error.step
  });
}; 