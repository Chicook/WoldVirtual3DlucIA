/**
 * @fileoverview Middleware de seguridad para el backend del metaverso
 * @module backend/src/middleware/security
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

/**
 * Configuración de CORS
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://metaverso.com',
      'https://app.metaverso.com',
      'https://api.metaverso.com'
    ];

    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

/**
 * Configuración de Helmet para seguridad de headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://api.metaverso.com", "wss://api.metaverso.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * Rate limiting para autenticación
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * Rate limiting general para API
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Speed limiting para prevenir spam
 */
export const speedLimit = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // Permitir 50 requests sin delay
  delayMs: 500, // Agregar 500ms de delay por request después del límite
  maxDelayMs: 20000 // Máximo 20 segundos de delay
});

/**
 * Middleware de validación de API Key
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      success: false,
      message: 'API Key requerida'
    });
    return;
  }

  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    res.status(401).json({
      success: false,
      message: 'API Key inválida'
    });
    return;
  }

  next();
};

/**
 * Middleware de validación de Content-Type
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        message: 'Content-Type debe ser application/json'
      });
      return;
    }
  }

  next();
};

/**
 * Middleware de sanitización de entrada
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitizar body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitizar params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
}

/**
 * Sanitizar string
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
}

/**
 * Middleware de validación de tamaño de payload
 */
export const validatePayloadSize = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        success: false,
        message: `Payload demasiado grande. Máximo: ${maxSize}`
      });
      return;
    }

    next();
  };
};

/**
 * Parsear tamaño de string a bytes
 */
function parseSize(sizeStr: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([kmg]?b)$/i);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  const [, value, unit] = match;
  return parseFloat(value) * units[unit.toLowerCase()];
}

/**
 * Middleware de logging de seguridad
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const securityEvents = [
    'authentication_failure',
    'authorization_failure',
    'rate_limit_exceeded',
    'invalid_api_key',
    'payload_too_large',
    'malicious_input'
  ];

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const event = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
      };

      console.warn('🚨 Evento de seguridad:', event);
    }
  });

  next();
};

/**
 * Middleware de prevención de ataques comunes
 */
export const preventCommonAttacks = (req: Request, res: Response, next: NextFunction): void => {
  // Prevenir SQL Injection
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(exec|execute|script|javascript|vbscript)\b)/i,
    /(--|;|'|"|`)/i
  ];

  const userInput = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(userInput)) {
      res.status(400).json({
        success: false,
        message: 'Entrada potencialmente maliciosa detectada'
      });
      return;
    }
  }

  // Prevenir XSS
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(userInput)) {
      res.status(400).json({
        success: false,
        message: 'Contenido XSS detectado'
      });
      return;
    }
  }

  next();
};

/**
 * Middleware de headers de seguridad personalizados
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Headers de seguridad adicionales
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Header personalizado para el metaverso
  res.setHeader('X-Metaverso-Version', '1.0.0');
  res.setHeader('X-Metaverso-Environment', process.env.NODE_ENV || 'development');

  next();
};

/**
 * Middleware de validación de IP
 */
export const validateIP = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP || '')) {
      res.status(403).json({
        success: false,
        message: 'IP no autorizada'
      });
      return;
    }

    next();
  };
};

// Exportaciones
export default {
  corsOptions,
  helmetConfig,
  authRateLimit,
  apiRateLimit,
  speedLimit,
  validateApiKey,
  validateContentType,
  sanitizeInput,
  validatePayloadSize,
  securityLogger,
  preventCommonAttacks,
  customSecurityHeaders,
  validateIP
}; 