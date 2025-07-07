/**
 * @fileoverview Modelo de asset para el backend del metaverso
 * @module backend/src/models/asset
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Tipos de assets
 */
export enum AssetType {
  MODEL_3D = '3d_model',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  IMAGE = 'image',
  ANIMATION = 'animation',
  VIDEO = 'video'
}

/**
 * Categorías de assets
 */
export enum AssetCategory {
  CHARACTER = 'character',
  BUILDING = 'building',
  VEHICLE = 'vehicle',
  PROP = 'prop',
  ENVIRONMENT = 'environment',
  UI = 'ui',
  AUDIO = 'audio',
  EFFECT = 'effect'
}

/**
 * Estados de asset
 */
export enum AssetStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  MODERATED = 'moderated'
}

/**
 * Interfaz de asset
 */
export interface IAsset extends Document {
  name: string;
  description: string;
  type: AssetType;
  category: AssetCategory;
  status: AssetStatus;
  creator: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  
  // Información del archivo
  file: {
    originalName: string;
    filename: string;
    path: string;
    size: number;
    format: string;
    mimeType: string;
    hash: string;
    checksum: string;
  };
  
  // URLs y almacenamiento
  urls: {
    original: string;
    optimized: string;
    thumbnail: string;
    preview: string;
  };
  
  // Metadatos técnicos
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    fps?: number;
    bitrate?: number;
    channels?: number;
    sampleRate?: number;
    polygons?: number;
    vertices?: number;
    textures?: number;
    animations?: number;
    bones?: number;
    materials?: number;
    customProperties: Record<string, any>;
  };
  
  // Optimización y compresión
  optimization: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    algorithm: string;
    quality: number;
    processedAt: Date;
  };
  
  // Upload y distribución
  upload: {
    platforms: string[];
    primaryPlatform: string;
    urls: Record<string, string>;
    uploadedAt: Date;
    lastSync: Date;
  };
  
  // Tags y categorización
  tags: string[];
  keywords: string[];
  
  // Licencia y derechos
  license: {
    type: string;
    url?: string;
    attribution?: string;
    commercialUse: boolean;
    modification: boolean;
    distribution: boolean;
  };
  
  // Estadísticas
  stats: {
    downloads: number;
    views: number;
    likes: number;
    shares: number;
    rating: number;
    ratingCount: number;
  };
  
  // Moderación
  moderation: {
    isApproved: boolean;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectedAt?: Date;
    rejectionReason?: string;
    flags: number;
    flaggedBy: mongoose.Types.ObjectId[];
  };
  
  // Versiones
  versions: {
    current: number;
    history: Array<{
      version: number;
      changes: string;
      file: {
        filename: string;
        size: number;
        hash: string;
      };
      createdAt: Date;
      createdBy: mongoose.Types.ObjectId;
    }>;
  };
  
  // Relaciones
  dependencies: mongoose.Types.ObjectId[];
  usedBy: mongoose.Types.ObjectId[];
  
  // Configuración de privacidad
  privacy: {
    isPublic: boolean;
    allowDownload: boolean;
    allowModification: boolean;
    allowCommercialUse: boolean;
    visibleTo: 'public' | 'friends' | 'private';
  };
  
  // Información de creación
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/**
 * Esquema de asset
 */
const assetSchema = new Schema<IAsset>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: Object.values(AssetType),
    required: true
  },
  category: {
    type: String,
    enum: Object.values(AssetCategory),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AssetStatus),
    default: AssetStatus.DRAFT
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Información del archivo
  file: {
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    format: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    },
    checksum: {
      type: String,
      required: true
    }
  },
  
  // URLs y almacenamiento
  urls: {
    original: {
      type: String,
      required: true
    },
    optimized: String,
    thumbnail: String,
    preview: String
  },
  
  // Metadatos técnicos
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    fps: Number,
    bitrate: Number,
    channels: Number,
    sampleRate: Number,
    polygons: Number,
    vertices: Number,
    textures: Number,
    animations: Number,
    bones: Number,
    materials: Number,
    customProperties: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Optimización y compresión
  optimization: {
    originalSize: {
      type: Number,
      required: true
    },
    optimizedSize: Number,
    compressionRatio: Number,
    algorithm: String,
    quality: Number,
    processedAt: Date
  },
  
  // Upload y distribución
  upload: {
    platforms: [{
      type: String,
      enum: ['ipfs', 'arweave', 'aws', 'local']
    }],
    primaryPlatform: {
      type: String,
      enum: ['ipfs', 'arweave', 'aws', 'local'],
      required: true
    },
    urls: {
      type: Map,
      of: String,
      default: {}
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    lastSync: {
      type: Date,
      default: Date.now
    }
  },
  
  // Tags y categorización
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  keywords: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  // Licencia y derechos
  license: {
    type: {
      type: String,
      required: true,
      default: 'CC-BY-4.0'
    },
    url: String,
    attribution: String,
    commercialUse: {
      type: Boolean,
      default: true
    },
    modification: {
      type: Boolean,
      default: true
    },
    distribution: {
      type: Boolean,
      default: true
    }
  },
  
  // Estadísticas
  stats: {
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  
  // Moderación
  moderation: {
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String,
    flags: {
      type: Number,
      default: 0
    },
    flaggedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Versiones
  versions: {
    current: {
      type: Number,
      default: 1
    },
    history: [{
      version: {
        type: Number,
        required: true
      },
      changes: {
        type: String,
        required: true
      },
      file: {
        filename: {
          type: String,
          required: true
        },
        size: {
          type: Number,
          required: true
        },
        hash: {
          type: String,
          required: true
        }
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }]
  },
  
  // Relaciones
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  usedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  
  // Configuración de privacidad
  privacy: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowDownload: {
      type: Boolean,
      default: true
    },
    allowModification: {
      type: Boolean,
      default: true
    },
    allowCommercialUse: {
      type: Boolean,
      default: true
    },
    visibleTo: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    }
  },
  
  // Información de creación
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Índices para optimización
 */
assetSchema.index({ name: 'text', description: 'text', tags: 'text' });
assetSchema.index({ type: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ creator: 1 });
assetSchema.index({ owner: 1 });
assetSchema.index({ 'file.hash': 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ 'moderation.isApproved': 1 });
assetSchema.index({ 'privacy.isPublic': 1 });
assetSchema.index({ createdAt: -1 });
assetSchema.index({ 'stats.views': -1 });
assetSchema.index({ 'stats.downloads': -1 });
assetSchema.index({ 'stats.rating': -1 });

/**
 * Middleware pre-save
 */
assetSchema.pre('save', function(next) {
  // Calcular ratio de compresión si hay datos de optimización
  if (this.optimization.originalSize && this.optimization.optimizedSize) {
    this.optimization.compressionRatio = 
      ((this.optimization.originalSize - this.optimization.optimizedSize) / this.optimization.originalSize) * 100;
  }
  
  // Establecer publishedAt si se publica
  if (this.isModified('status') && this.status === AssetStatus.PUBLISHED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

/**
 * Métodos de instancia
 */
assetSchema.methods.incrementViews = async function(): Promise<void> {
  this.stats.views += 1;
  await this.save();
};

assetSchema.methods.incrementDownloads = async function(): Promise<void> {
  this.stats.downloads += 1;
  await this.save();
};

assetSchema.methods.addLike = async function(userId: mongoose.Types.ObjectId): Promise<void> {
  // Implementar lógica de likes
  this.stats.likes += 1;
  await this.save();
};

assetSchema.methods.removeLike = async function(userId: mongoose.Types.ObjectId): Promise<void> {
  // Implementar lógica de likes
  this.stats.likes = Math.max(0, this.stats.likes - 1);
  await this.save();
};

assetSchema.methods.addRating = async function(rating: number, userId: mongoose.Types.ObjectId): Promise<void> {
  // Implementar lógica de ratings
  const totalRating = this.stats.rating * this.stats.ratingCount + rating;
  this.stats.ratingCount += 1;
  this.stats.rating = totalRating / this.stats.ratingCount;
  await this.save();
};

assetSchema.methods.flag = async function(userId: mongoose.Types.ObjectId, reason?: string): Promise<void> {
  if (!this.moderation.flaggedBy.includes(userId)) {
    this.moderation.flags += 1;
    this.moderation.flaggedBy.push(userId);
    await this.save();
  }
};

assetSchema.methods.approve = async function(moderatorId: mongoose.Types.ObjectId): Promise<void> {
  this.moderation.isApproved = true;
  this.moderation.approvedBy = moderatorId;
  this.moderation.approvedAt = new Date();
  this.status = AssetStatus.PUBLISHED;
  await this.save();
};

assetSchema.methods.reject = async function(moderatorId: mongoose.Types.ObjectId, reason: string): Promise<void> {
  this.moderation.isApproved = false;
  this.moderation.rejectedBy = moderatorId;
  this.moderation.rejectedAt = new Date();
  this.moderation.rejectionReason = reason;
  this.status = AssetStatus.MODERATED;
  await this.save();
};

assetSchema.methods.createVersion = async function(
  changes: string,
  file: { filename: string; size: number; hash: string },
  userId: mongoose.Types.ObjectId
): Promise<void> {
  this.versions.current += 1;
  this.versions.history.push({
    version: this.versions.current,
    changes,
    file,
    createdAt: new Date(),
    createdBy: userId
  });
  await this.save();
};

/**
 * Métodos estáticos
 */
assetSchema.statics.findByType = function(type: AssetType) {
  return this.find({ type, status: AssetStatus.PUBLISHED });
};

assetSchema.statics.findByCategory = function(category: AssetCategory) {
  return this.find({ category, status: AssetStatus.PUBLISHED });
};

assetSchema.statics.findByCreator = function(creatorId: mongoose.Types.ObjectId) {
  return this.find({ creator: creatorId });
};

assetSchema.statics.findPublic = function() {
  return this.find({ 
    status: AssetStatus.PUBLISHED,
    'privacy.isPublic': true,
    'moderation.isApproved': true
  });
};

assetSchema.statics.search = function(query: string) {
  return this.find({
    $text: { $search: query },
    status: AssetStatus.PUBLISHED,
    'privacy.isPublic': true,
    'moderation.isApproved': true
  });
};

/**
 * Virtuals
 */
assetSchema.virtual('isPublic').get(function() {
  return this.privacy.isPublic && this.status === AssetStatus.PUBLISHED;
});

assetSchema.virtual('isApproved').get(function() {
  return this.moderation.isApproved;
});

assetSchema.virtual('canDownload').get(function() {
  return this.privacy.allowDownload && this.isPublic;
});

assetSchema.virtual('canModify').get(function() {
  return this.privacy.allowModification && this.isPublic;
});

assetSchema.virtual('canUseCommercially').get(function() {
  return this.privacy.allowCommercialUse && this.license.commercialUse;
});

// Exportar modelo
const Asset = mongoose.model<IAsset>('Asset', assetSchema);

export default Asset; 