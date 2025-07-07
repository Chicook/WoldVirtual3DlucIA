/**
 * @fileoverview Modelo de usuario para el backend del metaverso
 * @module backend/src/models/user
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Interfaz de usuario
 */
export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  wallet?: string;
  role: 'admin' | 'moderator' | 'user' | 'creator';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      discord?: string;
      github?: string;
      linkedin?: string;
    };
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
      showWallet: boolean;
    };
  };
  stats: {
    assetsCreated: number;
    assetsUploaded: number;
    totalStorage: number;
    lastLogin: Date;
    loginCount: number;
  };
  verification: {
    emailVerified: boolean;
    walletVerified: boolean;
    kycVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
  };
  security: {
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    loginAttempts: number;
    lockUntil?: Date;
    lastPasswordChange: Date;
  };
  isWalletUser: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Métodos
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

/**
 * Esquema de usuario
 */
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_-]+$/, 'Username solo puede contener letras, números, guiones y guiones bajos']
  },
  password: {
    type: String,
    required: function() { return !this.isWalletUser; },
    minlength: 8,
    select: false // No incluir en queries por defecto
  },
  wallet: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v: string) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Dirección de wallet inválida'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'user', 'creator'],
    default: 'user'
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL de avatar inválida'
      }
    },
    bio: {
      type: String,
      maxlength: 500
    },
    location: {
      type: String,
      maxlength: 100
    },
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL de website inválida'
      }
    },
    socialMedia: {
      twitter: String,
      discord: String,
      github: String,
      linkedin: String
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'es',
      enum: ['es', 'en', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']
    },
    theme: {
      type: String,
      default: 'auto',
      enum: ['light', 'dark', 'auto']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        default: 'public',
        enum: ['public', 'private', 'friends']
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showWallet: {
        type: Boolean,
        default: false
      }
    }
  },
  stats: {
    assetsCreated: {
      type: Number,
      default: 0
    },
    assetsUploaded: {
      type: Number,
      default: 0
    },
    totalStorage: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    loginCount: {
      type: Number,
      default: 0
    }
  },
  verification: {
    emailVerified: {
      type: Boolean,
      default: false
    },
    walletVerified: {
      type: Boolean,
      default: false
    },
    kycVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastPasswordChange: {
      type: Date,
      default: Date.now
    }
  },
  isWalletUser: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.verification.emailVerificationToken;
      delete ret.verification.passwordResetToken;
      delete ret.security.twoFactorSecret;
      return ret;
    }
  }
});

/**
 * Índices para optimización
 */
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ wallet: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'verification.emailVerified': 1 });
userSchema.index({ 'verification.walletVerified': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Middleware pre-save para hash de contraseña
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Método para comparar contraseñas
 */
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Método para generar token de autenticación
 */
userSchema.methods.generateAuthToken = function(): string {
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role,
    wallet: this.wallet
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'metaverso-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * Método para generar token de verificación de email
 */
userSchema.methods.generateEmailVerificationToken = function(): string {
  const token = require('crypto').randomBytes(32).toString('hex');
  
  this.verification.emailVerificationToken = token;
  this.verification.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  
  return token;
};

/**
 * Método para generar token de reset de contraseña
 */
userSchema.methods.generatePasswordResetToken = function(): string {
  const token = require('crypto').randomBytes(32).toString('hex');
  
  this.verification.passwordResetToken = token;
  this.verification.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  
  return token;
};

/**
 * Método para incrementar intentos de login
 */
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  this.security.loginAttempts += 1;
  
  if (this.security.loginAttempts >= 5) {
    this.security.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  }
  
  await this.save();
};

/**
 * Método para resetear intentos de login
 */
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.security.loginAttempts = 0;
  this.security.lockUntil = undefined;
  this.stats.lastLogin = new Date();
  this.stats.loginCount += 1;
  
  await this.save();
};

/**
 * Método para verificar si la cuenta está bloqueada
 */
userSchema.methods.isLocked = function(): boolean {
  return !!(this.security.lockUntil && this.security.lockUntil > new Date());
};

/**
 * Métodos estáticos
 */
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByWallet = function(wallet: string) {
  return this.findOne({ wallet: wallet.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username: username.toLowerCase() });
};

/**
 * Métodos de instancia adicionales
 */
userSchema.methods.getFullName = function(): string {
  return `${this.profile.firstName} ${this.profile.lastName}`;
};

userSchema.methods.getDisplayName = function(): string {
  return this.username;
};

userSchema.methods.canCreateAssets = function(): boolean {
  return this.role === 'admin' || this.role === 'creator' || this.role === 'user';
};

userSchema.methods.canModerate = function(): boolean {
  return this.role === 'admin' || this.role === 'moderator';
};

userSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin';
};

/**
 * Virtuals
 */
userSchema.virtual('fullName').get(function() {
  return this.getFullName();
});

userSchema.virtual('isVerified').get(function() {
  return this.verification.emailVerified && this.verification.walletVerified;
});

userSchema.virtual('isLocked').get(function() {
  return this.isLocked();
});

// Exportar modelo
const User = mongoose.model<IUser>('User', userSchema);

export default User; 