/**
 * @fileoverview Modelos del metaverso para el backend
 * @module backend/src/models/metaverso
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interfaz de mundo virtual
 */
export interface IWorld extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  worldType: 'public' | 'private' | 'guild' | 'event';
  settings: {
    maxPlayers: number;
    physicsEnabled: boolean;
    gravity: number;
    weatherEnabled: boolean;
    timeCycle: boolean;
    permissions: {
      build: boolean;
      interact: boolean;
      trade: boolean;
      chat: boolean;
    };
  };
  geometry: {
    size: [number, number, number];
    spawnPoints: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
    }>;
    boundaries: {
      min: [number, number, number];
      max: [number, number, number];
    };
  };
  assets: Array<{
    assetId: mongoose.Types.ObjectId;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    owner: mongoose.Types.ObjectId;
    permissions: {
      move: boolean;
      interact: boolean;
      destroy: boolean;
    };
  }>;
  activePlayers: Array<{
    userId: mongoose.Types.ObjectId;
    avatarId: mongoose.Types.ObjectId;
    position: [number, number, number];
    lastSeen: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de mundo virtual
 */
const worldSchema = new Schema<IWorld>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worldType: {
    type: String,
    enum: ['public', 'private', 'guild', 'event'],
    default: 'public'
  },
  settings: {
    maxPlayers: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    physicsEnabled: {
      type: Boolean,
      default: true
    },
    gravity: {
      type: Number,
      default: -9.81
    },
    weatherEnabled: {
      type: Boolean,
      default: false
    },
    timeCycle: {
      type: Boolean,
      default: false
    },
    permissions: {
      build: {
        type: Boolean,
        default: true
      },
      interact: {
        type: Boolean,
        default: true
      },
      trade: {
        type: Boolean,
        default: true
      },
      chat: {
        type: Boolean,
        default: true
      }
    }
  },
  geometry: {
    size: {
      type: [Number],
      default: [1000, 1000, 1000],
      validate: {
        validator: function(v: number[]) {
          return v.length === 3 && v.every(n => n > 0);
        },
        message: 'Size debe ser un array de 3 números positivos'
      }
    },
    spawnPoints: [{
      position: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v: number[]) {
            return v.length === 3;
          },
          message: 'Position debe ser un array de 3 números'
        }
      },
      rotation: {
        type: [Number],
        default: [0, 0, 0],
        validate: {
          validator: function(v: number[]) {
            return v.length === 3;
          },
          message: 'Rotation debe ser un array de 3 números'
        }
      }
    }],
    boundaries: {
      min: {
        type: [Number],
        default: [-500, -500, -500],
        validate: {
          validator: function(v: number[]) {
            return v.length === 3;
          },
          message: 'Min boundaries debe ser un array de 3 números'
        }
      },
      max: {
        type: [Number],
        default: [500, 500, 500],
        validate: {
          validator: function(v: number[]) {
            return v.length === 3;
          },
          message: 'Max boundaries debe ser un array de 3 números'
        }
      }
    }
  },
  assets: [{
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },
    position: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 3;
        },
        message: 'Position debe ser un array de 3 números'
      }
    },
    rotation: {
      type: [Number],
      default: [0, 0, 0],
      validate: {
        validator: function(v: number[]) {
          return v.length === 3;
        },
        message: 'Rotation debe ser un array de 3 números'
      }
    },
    scale: {
      type: [Number],
      default: [1, 1, 1],
      validate: {
        validator: function(v: number[]) {
          return v.length === 3 && v.every(n => n > 0);
        },
        message: 'Scale debe ser un array de 3 números positivos'
      }
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permissions: {
      move: {
        type: Boolean,
        default: true
      },
      interact: {
        type: Boolean,
        default: true
      },
      destroy: {
        type: Boolean,
        default: false
      }
    }
  }],
  activePlayers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    avatarId: {
      type: Schema.Types.ObjectId,
      ref: 'Avatar',
      required: true
    },
    position: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 3;
        },
        message: 'Position debe ser un array de 3 números'
      }
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Interfaz de avatar
 */
export interface IAvatar extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  appearance: {
    model: string;
    texture: string;
    animations: string[];
    customizations: {
      skinColor: string;
      hairStyle: string;
      hairColor: string;
      eyeColor: string;
      height: number;
      weight: number;
    };
  };
  equipment: {
    head: mongoose.Types.ObjectId;
    body: mongoose.Types.ObjectId;
    hands: mongoose.Types.ObjectId;
    feet: mongoose.Types.ObjectId;
    accessories: mongoose.Types.ObjectId[];
  };
  stats: {
    health: number;
    stamina: number;
    experience: number;
    level: number;
    skills: {
      [key: string]: number;
    };
  };
  position: {
    worldId: mongoose.Types.ObjectId;
    coordinates: [number, number, number];
    rotation: [number, number, number];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de avatar
 */
const avatarSchema = new Schema<IAvatar>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  appearance: {
    model: {
      type: String,
      required: true
    },
    texture: {
      type: String,
      required: true
    },
    animations: [{
      type: String
    }],
    customizations: {
      skinColor: {
        type: String,
        default: '#fdbcb4'
      },
      hairStyle: {
        type: String,
        default: 'default'
      },
      hairColor: {
        type: String,
        default: '#000000'
      },
      eyeColor: {
        type: String,
        default: '#000000'
      },
      height: {
        type: Number,
        default: 1.7,
        min: 0.5,
        max: 3.0
      },
      weight: {
        type: Number,
        default: 70,
        min: 20,
        max: 200
      }
    }
  },
  equipment: {
    head: {
      type: Schema.Types.ObjectId,
      ref: 'Asset'
    },
    body: {
      type: Schema.Types.ObjectId,
      ref: 'Asset'
    },
    hands: {
      type: Schema.Types.ObjectId,
      ref: 'Asset'
    },
    feet: {
      type: Schema.Types.ObjectId,
      ref: 'Asset'
    },
    accessories: [{
      type: Schema.Types.ObjectId,
      ref: 'Asset'
    }]
  },
  stats: {
    health: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    stamina: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    skills: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  position: {
    worldId: {
      type: Schema.Types.ObjectId,
      ref: 'World',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 3;
        },
        message: 'Coordinates debe ser un array de 3 números'
      }
    },
    rotation: {
      type: [Number],
      default: [0, 0, 0],
      validate: {
        validator: function(v: number[]) {
          return v.length === 3;
        },
        message: 'Rotation debe ser un array de 3 números'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Interfaz de transacción del metaverso
 */
export interface IMetaversoTransaction extends Document {
  type: 'asset_purchase' | 'asset_sale' | 'world_creation' | 'avatar_customization' | 'skill_upgrade';
  userId: mongoose.Types.ObjectId;
  worldId?: mongoose.Types.ObjectId;
  assetId?: mongoose.Types.ObjectId;
  avatarId?: mongoose.Types.ObjectId;
  amount: number;
  currency: 'ETH' | 'MATIC' | 'USDC' | 'MV_TOKEN';
  blockchainTxHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de transacción del metaverso
 */
const metaversoTransactionSchema = new Schema<IMetaversoTransaction>({
  type: {
    type: String,
    enum: ['asset_purchase', 'asset_sale', 'world_creation', 'avatar_customization', 'skill_upgrade'],
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worldId: {
    type: Schema.Types.ObjectId,
    ref: 'World'
  },
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  },
  avatarId: {
    type: Schema.Types.ObjectId,
    ref: 'Avatar'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['ETH', 'MATIC', 'USDC', 'MV_TOKEN'],
    default: 'MV_TOKEN'
  },
  blockchainTxHash: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Hash de transacción blockchain inválido'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

/**
 * Interfaz de evento del mundo
 */
export interface IWorldEvent extends Document {
  worldId: mongoose.Types.ObjectId;
  type: 'player_join' | 'player_leave' | 'asset_placed' | 'asset_removed' | 'chat_message' | 'interaction';
  userId?: mongoose.Types.ObjectId;
  avatarId?: mongoose.Types.ObjectId;
  assetId?: mongoose.Types.ObjectId;
  position?: [number, number, number];
  data: {
    [key: string]: any;
  };
  timestamp: Date;
}

/**
 * Esquema de evento del mundo
 */
const worldEventSchema = new Schema<IWorldEvent>({
  worldId: {
    type: Schema.Types.ObjectId,
    ref: 'World',
    required: true
  },
  type: {
    type: String,
    enum: ['player_join', 'player_leave', 'asset_placed', 'asset_removed', 'chat_message', 'interaction'],
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  avatarId: {
    type: Schema.Types.ObjectId,
    ref: 'Avatar'
  },
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  },
  position: {
    type: [Number],
    validate: {
      validator: function(v: number[]) {
        return v.length === 3;
      },
      message: 'Position debe ser un array de 3 números'
    }
  },
  data: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimización
worldSchema.index({ owner: 1 });
worldSchema.index({ worldType: 1 });
worldSchema.index({ isActive: 1 });
worldSchema.index({ 'activePlayers.userId': 1 });

avatarSchema.index({ userId: 1 });
avatarSchema.index({ isActive: 1 });
avatarSchema.index({ 'position.worldId': 1 });

metaversoTransactionSchema.index({ userId: 1 });
metaversoTransactionSchema.index({ type: 1 });
metaversoTransactionSchema.index({ status: 1 });
metaversoTransactionSchema.index({ blockchainTxHash: 1 });
metaversoTransactionSchema.index({ createdAt: -1 });

worldEventSchema.index({ worldId: 1 });
worldEventSchema.index({ type: 1 });
worldEventSchema.index({ timestamp: -1 });
worldEventSchema.index({ userId: 1 });

// Métodos estáticos
worldSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ owner: ownerId, isActive: true });
};

worldSchema.statics.findPublicWorlds = function() {
  return this.find({ worldType: 'public', isActive: true });
};

avatarSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId, isActive: true });
};

metaversoTransactionSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

worldEventSchema.statics.findByWorld = function(worldId: string, limit = 100) {
  return this.find({ worldId }).sort({ timestamp: -1 }).limit(limit);
};

// Métodos de instancia
worldSchema.methods.addPlayer = function(userId: string, avatarId: string, position: [number, number, number]) {
  const existingPlayer = this.activePlayers.find(p => p.userId.toString() === userId);
  
  if (existingPlayer) {
    existingPlayer.position = position;
    existingPlayer.lastSeen = new Date();
  } else {
    this.activePlayers.push({
      userId: new mongoose.Types.ObjectId(userId),
      avatarId: new mongoose.Types.ObjectId(avatarId),
      position,
      lastSeen: new Date()
    });
  }
  
  return this.save();
};

worldSchema.methods.removePlayer = function(userId: string) {
  this.activePlayers = this.activePlayers.filter(p => p.userId.toString() !== userId);
  return this.save();
};

worldSchema.methods.addAsset = function(assetData: any) {
  this.assets.push(assetData);
  return this.save();
};

worldSchema.methods.removeAsset = function(assetId: string) {
  this.assets = this.assets.filter(a => a.assetId.toString() !== assetId);
  return this.save();
};

avatarSchema.methods.updatePosition = function(worldId: string, coordinates: [number, number, number], rotation: [number, number, number]) {
  this.position = {
    worldId: new mongoose.Types.ObjectId(worldId),
    coordinates,
    rotation
  };
  return this.save();
};

avatarSchema.methods.addExperience = function(amount: number) {
  this.stats.experience += amount;
  
  // Calcular nivel basado en experiencia
  const newLevel = Math.floor(this.stats.experience / 1000) + 1;
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel;
  }
  
  return this.save();
};

// Middleware
worldSchema.pre('save', function(next) {
  // Validar límite de jugadores
  if (this.activePlayers.length > this.settings.maxPlayers) {
    return next(new Error('Mundo lleno'));
  }
  
  // Limpiar jugadores inactivos (más de 5 minutos)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  this.activePlayers = this.activePlayers.filter(p => p.lastSeen > fiveMinutesAgo);
  
  next();
});

avatarSchema.pre('save', function(next) {
  // Validar límites de stats
  if (this.stats.health > 100) this.stats.health = 100;
  if (this.stats.stamina > 100) this.stats.stamina = 100;
  
  next();
});

// Crear y exportar modelos
export const World = mongoose.model<IWorld>('World', worldSchema);
export const Avatar = mongoose.model<IAvatar>('Avatar', avatarSchema);
export const MetaversoTransaction = mongoose.model<IMetaversoTransaction>('MetaversoTransaction', metaversoTransactionSchema);
export const WorldEvent = mongoose.model<IWorldEvent>('WorldEvent', worldEventSchema);

export default {
  World,
  Avatar,
  MetaversoTransaction,
  WorldEvent
}; 