/**
 * @fileoverview Middleware de autenticación para el backend del metaverso
 * @module backend/src/middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

/**
 * Interfaz para extender Request con información de usuario
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    wallet?: string;
  };
}

/**
 * Middleware de autenticación JWT
 */
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    const secret = process.env.JWT_SECRET || 'metaverso-secret-key';

    const decoded = jwt.verify(token, secret) as any;
    
    // Verificar que el usuario existe en la base de datos
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      wallet: user.wallet
    };

    next();
  } catch (error) {
    console.error('Error en autenticación JWT:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware de autenticación por wallet
 */
export const authenticateWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { wallet, signature, message } = req.body;

    if (!wallet || !signature || !message) {
      res.status(400).json({
        success: false,
        message: 'Wallet, firma y mensaje requeridos'
      });
      return;
    }

    // Verificar la firma del mensaje
    const isValidSignature = await verifyWalletSignature(wallet, signature, message);
    
    if (!isValidSignature) {
      res.status(401).json({
        success: false,
        message: 'Firma de wallet inválida'
      });
      return;
    }

    // Buscar o crear usuario por wallet
    let user = await User.findOne({ wallet });
    
    if (!user) {
      // Crear nuevo usuario con wallet
      user = new User({
        wallet,
        email: `${wallet}@wallet.local`,
        role: 'user',
        isWalletUser: true
      });
      await user.save();
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, wallet },
      process.env.JWT_SECRET || 'metaverso-secret-key',
      { expiresIn: '7d' }
    );

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      wallet: user.wallet
    };

    // Agregar token a la respuesta
    res.locals.token = token;

    next();
  } catch (error) {
    console.error('Error en autenticación por wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error en autenticación por wallet'
    });
  }
};

/**
 * Middleware de autorización por roles
 */
export const authorizeRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado: permisos insuficientes'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware de autorización de propietario
 */
export const authorizeOwner = (resourceField: string = 'userId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
        return;
      }

      const resourceId = req.params.id || req.body[resourceField];
      
      if (!resourceId) {
        res.status(400).json({
          success: false,
          message: 'ID de recurso requerido'
        });
        return;
      }

      // Verificar que el usuario es propietario del recurso
      // Esto debe implementarse según el modelo específico
      const isOwner = await verifyResourceOwnership(req.user.id, resourceId, resourceField);
      
      if (!isOwner && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado: no es propietario del recurso'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en autorización de propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error en autorización'
      });
    }
  };
};

/**
 * Middleware de rate limiting
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const userRequests = requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intente más tarde.'
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

/**
 * Middleware de validación de entrada
 */
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map((detail: any) => detail.message)
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en validación de entrada:', error);
      res.status(500).json({
        success: false,
        message: 'Error en validación'
      });
    }
  };
};

/**
 * Middleware de logging de requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (res.statusCode >= 400) {
      console.error('❌ Request Error:', logData);
    } else {
      console.log('✅ Request:', logData);
    }
  });

  next();
};

/**
 * Middleware de manejo de errores
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🚨 Error no manejado:', error);

  // Error de validación de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
    return;
  }

  // Error de expiración de JWT
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
    return;
  }

  // Error de validación de datos
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: error.message
    });
    return;
  }

  // Error de base de datos
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    res.status(500).json({
      success: false,
      message: 'Error de base de datos'
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};

/**
 * Verificar firma de wallet
 */
async function verifyWalletSignature(wallet: string, signature: string, message: string): Promise<boolean> {
  try {
    // Implementar verificación de firma según la blockchain
    // Por ejemplo, para Ethereum:
    const ethers = require('ethers');
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === wallet.toLowerCase();
  } catch (error) {
    console.error('Error verificando firma de wallet:', error);
    return false;
  }
}

/**
 * Verificar propiedad de recurso
 */
async function verifyResourceOwnership(userId: string, resourceId: string, field: string): Promise<boolean> {
  try {
    // Esta función debe implementarse según el modelo específico
    // Por ejemplo, para verificar propiedad de un asset:
    const Asset = require('../models/asset').default;
    const asset = await Asset.findById(resourceId);
    return asset && asset[field].toString() === userId;
  } catch (error) {
    console.error('Error verificando propiedad de recurso:', error);
    return false;
  }
}

// Exportaciones
export default {
  authenticateJWT,
  authenticateWallet,
  authorizeRole,
  authorizeOwner,
  rateLimit,
  validateInput,
  requestLogger,
  errorHandler
}; 