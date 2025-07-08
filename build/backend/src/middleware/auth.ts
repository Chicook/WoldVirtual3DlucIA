import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Logger } from '../utils/Logger';

const logger = new Logger('AuthMiddleware');

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      '/health',
      '/docs',
      '/metrics'
    ];

    if (publicRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Intento de acceso sin token de autorización', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      res.status(401).json({
        error: 'Token de autorización requerido',
        code: 'AUTH_TOKEN_MISSING'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Token de autorización vacío', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      res.status(401).json({
        error: 'Token de autorización inválido',
        code: 'AUTH_TOKEN_INVALID'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      // Verificar que el token no haya expirado
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        logger.warn('Token expirado', {
          userId: decoded.id,
          ip: req.ip,
          path: req.path
        });
        
        res.status(401).json({
          error: 'Token expirado',
          code: 'AUTH_TOKEN_EXPIRED'
        });
        return;
      }

      // Asignar usuario a la request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions
      };

      logger.debug('Usuario autenticado', {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
        path: req.path
      });

      next();
      
    } catch (jwtError) {
      logger.warn('Token de autorización inválido', {
        error: (jwtError as Error).message,
        ip: req.ip,
        path: req.path
      });
      
      res.status(401).json({
        error: 'Token de autorización inválido',
        code: 'AUTH_TOKEN_INVALID'
      });
    }
    
  } catch (error) {
    logger.error('Error en middleware de autenticación', error as Error);
    
    res.status(500).json({
      error: 'Error interno de autenticación',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Usuario no autenticado',
          code: 'AUTH_USER_REQUIRED'
        });
        return;
      }

      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!requiredRoles.includes(req.user.role)) {
        logger.warn('Acceso denegado por rol insuficiente', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles,
          path: req.path
        });
        
        res.status(403).json({
          error: 'Acceso denegado: rol insuficiente',
          code: 'AUTH_INSUFFICIENT_ROLE'
        });
        return;
      }

      next();
      
    } catch (error) {
      logger.error('Error en middleware de roles', error as Error);
      
      res.status(500).json({
        error: 'Error interno de autorización',
        code: 'AUTH_INTERNAL_ERROR'
      });
    }
  };
};

export const requirePermission = (permissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Usuario no autenticado',
          code: 'AUTH_USER_REQUIRED'
        });
        return;
      }

      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      
      const hasAllPermissions = requiredPermissions.every(permission =>
        req.user!.permissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        logger.warn('Acceso denegado por permisos insuficientes', {
          userId: req.user.id,
          userPermissions: req.user.permissions,
          requiredPermissions,
          path: req.path
        });
        
        res.status(403).json({
          error: 'Acceso denegado: permisos insuficientes',
          code: 'AUTH_INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      next();
      
    } catch (error) {
      logger.error('Error en middleware de permisos', error as Error);
      
      res.status(500).json({
        error: 'Error interno de autorización',
        code: 'AUTH_INTERNAL_ERROR'
      });
    }
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return next();
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions
      };

      next();
      
    } catch (jwtError) {
      // Si el token es inválido, continuar sin usuario
      next();
    }
    
  } catch (error) {
    logger.error('Error en middleware de autenticación opcional', error as Error);
    next();
  }
};

// Función helper para generar token JWT
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience
  });
};

// Función helper para verificar token JWT
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
}; 