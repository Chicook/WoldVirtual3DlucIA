/**
 * @fileoverview Router de autenticación del metaverso
 * @module backend/src/apis/auth
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth/auth.middleware';
import { validateRequest } from '../../middleware/validation/validator.middleware';
import { authSchemas } from './auth.validator';
import { Logger } from '../../monitoring/logger';

const router = Router();
const authController = new AuthController();
const logger = new Logger('AuthRouter');

/**
 * Configura las rutas de autenticación
 */
export function setupAuthRoutes(): Router {
  logger.info('🔐 Configurando rutas de autenticación...');

  // Registro de usuario
  router.post('/register', 
    validateRequest(authSchemas.register),
    authController.register
  );

  // Login tradicional
  router.post('/login',
    validateRequest(authSchemas.login),
    authController.login
  );

  // Login con wallet (Web3)
  router.post('/login/wallet',
    validateRequest(authSchemas.walletLogin),
    authController.walletLogin
  );

  // Verificar token
  router.post('/verify',
    validateRequest(authSchemas.verifyToken),
    authController.verifyToken
  );

  // Refresh token
  router.post('/refresh',
    validateRequest(authSchemas.refreshToken),
    authController.refreshToken
  );

  // Logout
  router.post('/logout',
    authMiddleware,
    authController.logout
  );

  // Cambiar contraseña
  router.put('/password',
    authMiddleware,
    validateRequest(authSchemas.changePassword),
    authController.changePassword
  );

  // Recuperar contraseña
  router.post('/forgot-password',
    validateRequest(authSchemas.forgotPassword),
    authController.forgotPassword
  );

  // Resetear contraseña
  router.post('/reset-password',
    validateRequest(authSchemas.resetPassword),
    authController.resetPassword
  );

  // Verificar email
  router.post('/verify-email',
    validateRequest(authSchemas.verifyEmail),
    authController.verifyEmail
  );

  // Reenviar email de verificación
  router.post('/resend-verification',
    authMiddleware,
    authController.resendVerification
  );

  // Obtener perfil del usuario autenticado
  router.get('/profile',
    authMiddleware,
    authController.getProfile
  );

  // Actualizar perfil
  router.put('/profile',
    authMiddleware,
    validateRequest(authSchemas.updateProfile),
    authController.updateProfile
  );

  // Conectar wallet
  router.post('/connect-wallet',
    authMiddleware,
    validateRequest(authSchemas.connectWallet),
    authController.connectWallet
  );

  // Desconectar wallet
  router.delete('/disconnect-wallet/:walletId',
    authMiddleware,
    authController.disconnectWallet
  );

  // Obtener wallets conectados
  router.get('/wallets',
    authMiddleware,
    authController.getConnectedWallets
  );

  // Autenticación con OAuth
  router.get('/oauth/:provider',
    authController.oauthRedirect
  );

  router.get('/oauth/:provider/callback',
    authController.oauthCallback
  );

  // Middleware de logging para todas las rutas de auth
  router.use((req, res, next) => {
    logger.info(`🔐 Auth Request: ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    next();
  });

  logger.success('✅ Rutas de autenticación configuradas');
  return router;
}

// Router exportado
export const authRouter = setupAuthRoutes();

// Exportaciones
export * from './auth.controller';
export * from './auth.validator'; 