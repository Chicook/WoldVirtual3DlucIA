/**
 * @fileoverview Servicio de autenticación para el backend del metaverso
 * @module backend/src/services/auth.service
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user';
import { sendEmail } from '../utils/email';
import { verifyWalletSignature } from '../utils/blockchain';

/**
 * Interfaz para datos de registro
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  wallet?: string;
}

/**
 * Interfaz para datos de login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interfaz para datos de wallet
 */
export interface WalletData {
  wallet: string;
  signature: string;
  message: string;
}

/**
 * Clase de servicio de autenticación
 */
export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'metaverso-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    message: string;
  }> {
    try {
      // Verificar si el email ya existe
      const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
      if (existingEmail) {
        return {
          success: false,
          message: 'El email ya está registrado'
        };
      }

      // Verificar si el username ya existe
      const existingUsername = await User.findOne({ username: data.username.toLowerCase() });
      if (existingUsername) {
        return {
          success: false,
          message: 'El nombre de usuario ya está en uso'
        };
      }

      // Verificar wallet si se proporciona
      if (data.wallet) {
        const existingWallet = await User.findOne({ wallet: data.wallet.toLowerCase() });
        if (existingWallet) {
          return {
            success: false,
            message: 'La wallet ya está registrada'
          };
        }
      }

      // Crear nuevo usuario
      const user = new User({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        password: data.password,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName
        },
        wallet: data.wallet?.toLowerCase(),
        isWalletUser: !!data.wallet
      });

      // Generar token de verificación de email
      const emailToken = user.generateEmailVerificationToken();

      // Guardar usuario
      await user.save();

      // Enviar email de verificación
      await this.sendVerificationEmail(user.email, emailToken, user.profile.firstName);

      // Generar token de autenticación
      const token = user.generateAuthToken();

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          wallet: user.wallet,
          profile: user.profile,
          verification: {
            emailVerified: user.verification.emailVerified,
            walletVerified: user.verification.walletVerified
          }
        },
        token,
        message: 'Usuario registrado exitosamente. Verifica tu email.'
      };

    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Login con email y contraseña
   */
  async login(data: LoginData): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    message: string;
  }> {
    try {
      // Buscar usuario por email
      const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
      
      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Verificar si la cuenta está bloqueada
      if (user.isLocked()) {
        return {
          success: false,
          message: 'Cuenta bloqueada temporalmente. Intenta más tarde.'
        };
      }

      // Verificar contraseña
      const isPasswordValid = await user.comparePassword(data.password);
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Resetear intentos de login
      await user.resetLoginAttempts();

      // Generar token
      const token = user.generateAuthToken();

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          wallet: user.wallet,
          profile: user.profile,
          verification: {
            emailVerified: user.verification.emailVerified,
            walletVerified: user.verification.walletVerified
          },
          stats: user.stats
        },
        token,
        message: 'Login exitoso'
      };

    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Login con wallet
   */
  async loginWithWallet(data: WalletData): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    message: string;
  }> {
    try {
      // Verificar firma de wallet
      const isValidSignature = await verifyWalletSignature(data.wallet, data.signature, data.message);
      
      if (!isValidSignature) {
        return {
          success: false,
          message: 'Firma de wallet inválida'
        };
      }

      // Buscar usuario por wallet
      let user = await User.findOne({ wallet: data.wallet.toLowerCase() });
      
      if (!user) {
        // Crear nuevo usuario con wallet
        user = new User({
          wallet: data.wallet.toLowerCase(),
          email: `${data.wallet}@wallet.local`,
          username: `user_${data.wallet.substring(0, 8)}`,
          profile: {
            firstName: 'Usuario',
            lastName: 'Wallet'
          },
          role: 'user',
          isWalletUser: true,
          verification: {
            walletVerified: true
          }
        });

        await user.save();
      } else {
        // Actualizar verificación de wallet
        user.verification.walletVerified = true;
        await user.resetLoginAttempts();
        await user.save();
      }

      // Generar token
      const token = user.generateAuthToken();

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          wallet: user.wallet,
          profile: user.profile,
          verification: {
            emailVerified: user.verification.emailVerified,
            walletVerified: user.verification.walletVerified
          },
          stats: user.stats
        },
        token,
        message: 'Login con wallet exitoso'
      };

    } catch (error) {
      console.error('Error en login con wallet:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Verificar email
   */
  async verifyEmail(token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const user = await User.findOne({
        'verification.emailVerificationToken': token,
        'verification.emailVerificationExpires': { $gt: new Date() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Token de verificación inválido o expirado'
        };
      }

      user.verification.emailVerified = true;
      user.verification.emailVerificationToken = undefined;
      user.verification.emailVerificationExpires = undefined;

      await user.save();

      return {
        success: true,
        message: 'Email verificado exitosamente'
      };

    } catch (error) {
      console.error('Error verificando email:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return {
          success: true, // No revelar si el email existe
          message: 'Si el email existe, recibirás un enlace para resetear tu contraseña'
        };
      }

      // Generar token de reset
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Enviar email de reset
      await this.sendPasswordResetEmail(user.email, resetToken, user.profile.firstName);

      return {
        success: true,
        message: 'Si el email existe, recibirás un enlace para resetear tu contraseña'
      };

    } catch (error) {
      console.error('Error solicitando reset de contraseña:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Resetear contraseña
   */
  async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const user = await User.findOne({
        'verification.passwordResetToken': token,
        'verification.passwordResetExpires': { $gt: new Date() }
      }).select('+password');

      if (!user) {
        return {
          success: false,
          message: 'Token de reset inválido o expirado'
        };
      }

      // Actualizar contraseña
      user.password = newPassword;
      user.verification.passwordResetToken = undefined;
      user.verification.passwordResetExpires = undefined;
      user.security.lastPasswordChange = new Date();

      await user.save();

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };

    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Contraseña actual incorrecta'
        };
      }

      // Actualizar contraseña
      user.password = newPassword;
      user.security.lastPasswordChange = new Date();

      await user.save();

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Verificar token JWT
   */
  async verifyToken(token: string): Promise<{
    success: boolean;
    user?: any;
    message: string;
  }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          wallet: user.wallet
        },
        message: 'Token válido'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Token inválido'
      };
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken(userId: string): Promise<{
    success: boolean;
    token?: string;
    message: string;
  }> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      const token = user.generateAuthToken();

      return {
        success: true,
        token,
        message: 'Token refrescado exitosamente'
      };

    } catch (error) {
      console.error('Error refrescando token:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Enviar email de verificación
   */
  private async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Verifica tu email - Metaverso',
      template: 'email-verification',
      data: {
        firstName,
        verificationUrl
      }
    });
  }

  /**
   * Enviar email de reset de contraseña
   */
  private async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Reset de contraseña - Metaverso',
      template: 'password-reset',
      data: {
        firstName,
        resetUrl
      }
    });
  }
}

// Instancia del servicio
export const authService = new AuthService();

export default authService; 