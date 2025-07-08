import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

const logger = new Logger('ValidationMiddleware');

// Esquemas de validación
const validationSchemas = {
  buildRequest: {
    moduleName: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    priority: {
      type: 'string',
      required: false,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    metadata: {
      type: 'object',
      required: false,
      default: {}
    }
  },
  
  progressUpdate: {
    progress: {
      type: 'number',
      required: true,
      min: 0,
      max: 100
    },
    step: {
      type: 'string',
      required: false,
      maxLength: 200
    },
    metadata: {
      type: 'object',
      required: false
    }
  },
  
  notificationRequest: {
    type: {
      type: 'string',
      required: true,
      enum: ['info', 'success', 'warning', 'error']
    },
    title: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 200
    },
    message: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 1000
    },
    channels: {
      type: 'array',
      required: true,
      items: {
        type: 'string',
        enum: ['email', 'webhook', 'slack', 'websocket', 'database']
      },
      minItems: 1
    },
    priority: {
      type: 'string',
      required: false,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    metadata: {
      type: 'object',
      required: false,
      default: {}
    },
    userId: {
      type: 'string',
      required: false,
      pattern: /^[a-zA-Z0-9_-]+$/
    }
  },
  
  queueJob: {
    moduleName: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    priority: {
      type: 'string',
      required: false,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    metadata: {
      type: 'object',
      required: false,
      default: {}
    }
  },
  
  batchBuilds: {
    builds: {
      type: 'array',
      required: true,
      minItems: 1,
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          moduleName: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100
          },
          priority: {
            type: 'string',
            required: false,
            enum: ['low', 'normal', 'high', 'urgent']
          },
          metadata: {
            type: 'object',
            required: false
          }
        }
      }
    }
  }
};

// Tipos de validación
type ValidationType = 'string' | 'number' | 'boolean' | 'object' | 'array';
type ValidationRule = {
  type: ValidationType;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: string[];
  default?: any;
  items?: ValidationRule;
  properties?: Record<string, ValidationRule>;
  minItems?: number;
  maxItems?: number;
};

// Función principal de validación
export const validationMiddleware = (
  schemaName: keyof typeof validationSchemas
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const schema = validationSchemas[schemaName];
      const data = req.body;
      const errors: string[] = [];

      // Validar cada campo del esquema
      for (const [fieldName, rules] of Object.entries(schema)) {
        const value = data[fieldName];
        const fieldErrors = validateField(fieldName, value, rules);
        errors.push(...fieldErrors);
      }

      if (errors.length > 0) {
        logger.warn('Validación fallida', {
          schema: schemaName,
          errors,
          data: sanitizeData(data)
        });

        res.status(400).json({
          error: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: errors
        });
        return;
      }

      // Aplicar valores por defecto
      const validatedData = applyDefaults(data, schema);
      req.body = validatedData;

      logger.debug('Validación exitosa', {
        schema: schemaName,
        fields: Object.keys(schema)
      });

      next();

    } catch (error) {
      logger.error('Error en middleware de validación', error as Error);

      res.status(500).json({
        error: 'Error interno de validación',
        code: 'VALIDATION_INTERNAL_ERROR'
      });
    }
  };
};

// Validar campo individual
function validateField(
  fieldName: string,
  value: any,
  rules: ValidationRule
): string[] {
  const errors: string[] = [];

  // Verificar si es requerido
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`El campo '${fieldName}' es requerido`);
    return errors;
  }

  // Si no es requerido y no tiene valor, usar valor por defecto
  if (!rules.required && (value === undefined || value === null)) {
    return errors;
  }

  // Validar tipo
  if (!validateType(value, rules.type)) {
    errors.push(`El campo '${fieldName}' debe ser de tipo ${rules.type}`);
    return errors;
  }

  // Validaciones específicas por tipo
  switch (rules.type) {
    case 'string':
      errors.push(...validateString(fieldName, value, rules));
      break;
    case 'number':
      errors.push(...validateNumber(fieldName, value, rules));
      break;
    case 'array':
      errors.push(...validateArray(fieldName, value, rules));
      break;
    case 'object':
      errors.push(...validateObject(fieldName, value, rules));
      break;
  }

  return errors;
}

// Validar tipo de dato
function validateType(value: any, expectedType: ValidationType): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return false;
  }
}

// Validar string
function validateString(
  fieldName: string,
  value: string,
  rules: ValidationRule
): string[] {
  const errors: string[] = [];

  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`El campo '${fieldName}' debe tener al menos ${rules.minLength} caracteres`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`El campo '${fieldName}' debe tener máximo ${rules.maxLength} caracteres`);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(`El campo '${fieldName}' tiene un formato inválido`);
  }

  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`El campo '${fieldName}' debe ser uno de: ${rules.enum.join(', ')}`);
  }

  return errors;
}

// Validar number
function validateNumber(
  fieldName: string,
  value: number,
  rules: ValidationRule
): string[] {
  const errors: string[] = [];

  if (rules.min !== undefined && value < rules.min) {
    errors.push(`El campo '${fieldName}' debe ser mayor o igual a ${rules.min}`);
  }

  if (rules.max !== undefined && value > rules.max) {
    errors.push(`El campo '${fieldName}' debe ser menor o igual a ${rules.max}`);
  }

  return errors;
}

// Validar array
function validateArray(
  fieldName: string,
  value: any[],
  rules: ValidationRule
): string[] {
  const errors: string[] = [];

  if (rules.minItems && value.length < rules.minItems) {
    errors.push(`El campo '${fieldName}' debe tener al menos ${rules.minItems} elementos`);
  }

  if (rules.maxItems && value.length > rules.maxItems) {
    errors.push(`El campo '${fieldName}' debe tener máximo ${rules.maxItems} elementos`);
  }

  if (rules.items) {
    for (let i = 0; i < value.length; i++) {
      const itemErrors = validateField(`${fieldName}[${i}]`, value[i], rules.items!);
      errors.push(...itemErrors);
    }
  }

  return errors;
}

// Validar object
function validateObject(
  fieldName: string,
  value: any,
  rules: ValidationRule
): string[] {
  const errors: string[] = [];

  if (rules.properties) {
    for (const [propName, propRules] of Object.entries(rules.properties)) {
      const propErrors = validateField(`${fieldName}.${propName}`, value[propName], propRules);
      errors.push(...propErrors);
    }
  }

  return errors;
}

// Aplicar valores por defecto
function applyDefaults(data: any, schema: Record<string, ValidationRule>): any {
  const result = { ...data };

  for (const [fieldName, rules] of Object.entries(schema)) {
    if (rules.default !== undefined && (result[fieldName] === undefined || result[fieldName] === null)) {
      result[fieldName] = rules.default;
    }
  }

  return result;
}

// Sanitizar datos para logging (remover información sensible)
function sanitizeData(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// Middleware específico para validar build request
export const validateBuildRequest = validationMiddleware('buildRequest');

// Middleware específico para validar progress update
export const validateProgressUpdate = validationMiddleware('progressUpdate');

// Middleware específico para validar notification request
export const validateNotificationRequest = validationMiddleware('notificationRequest');

// Middleware específico para validar queue job
export const validateQueueJob = validationMiddleware('queueJob');

// Middleware específico para validar batch builds
export const validateBatchBuilds = validationMiddleware('batchBuilds');

// Middleware para validar IDs
export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    logger.warn('ID inválido en parámetros', { id, path: req.path });
    
    res.status(400).json({
      error: 'ID inválido',
      code: 'INVALID_ID'
    });
    return;
  }
  
  next();
};

// Middleware para validar paginación
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit } = req.query;
  
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  
  if (page && (isNaN(pageNum) || pageNum < 1)) {
    res.status(400).json({
      error: 'Número de página inválido',
      code: 'INVALID_PAGE'
    });
    return;
  }
  
  if (limit && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
    res.status(400).json({
      error: 'Límite inválido (debe estar entre 1 y 100)',
      code: 'INVALID_LIMIT'
    });
    return;
  }
  
  next();
}; 