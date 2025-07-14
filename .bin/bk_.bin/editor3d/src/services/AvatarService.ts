export interface AvatarConfig {
  name: string;
  gender: 'male' | 'female';
  appearance: {
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    height: number;
    build: 'slim' | 'athletic' | 'curvy' | 'muscular';
    hairStyle?: string;
    facialFeatures?: string[];
    accessories?: string[];
  };
  personality: {
    traits: string[];
    interests: string[];
    communicationStyle: string;
    mood?: string;
  };
  skills?: {
    [key: string]: number;
  };
}

export interface Avatar {
  id: string;
  config: AvatarConfig;
  interactions: number;
  animationsLearned: number;
  knowledgeLevel: number;
  lastInteraction: number | null;
  createdAt: number;
  updatedAt: number;
}

export class AvatarService {
  private avatars: Map<string, Avatar> = new Map();
  private isInitialized: boolean = false;

  constructor() {}

  async initialize(): Promise<void> {
    try {
      console.log('👤 Inicializando AvatarService...');
      
      // Simular inicialización
      this.isInitialized = true;
      console.log('✅ AvatarService inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar AvatarService:', error);
      throw error;
    }
  }

  async createAvatar(config: AvatarConfig): Promise<Avatar> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatarId = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const avatar: Avatar = {
        id: avatarId,
        config,
        interactions: 0,
        animationsLearned: 0,
        knowledgeLevel: 1,
        lastInteraction: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.avatars.set(avatarId, avatar);
      
      console.log(`👤 Avatar creado: ${config.name} (ID: ${avatarId})`);
      return avatar;
    } catch (error) {
      console.error('❌ Error al crear avatar:', error);
      throw error;
    }
  }

  async getAvatar(avatarId: string): Promise<Avatar | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      return avatar || null;
    } catch (error) {
      console.error('❌ Error al obtener avatar:', error);
      throw error;
    }
  }

  async updateAvatar(avatarId: string, updates: Partial<Avatar>): Promise<Avatar | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      if (!avatar) {
        return null;
      }

      const updatedAvatar: Avatar = {
        ...avatar,
        ...updates,
        updatedAt: Date.now()
      };

      this.avatars.set(avatarId, updatedAvatar);
      
      console.log(`👤 Avatar actualizado: ${avatarId}`);
      return updatedAvatar;
    } catch (error) {
      console.error('❌ Error al actualizar avatar:', error);
      throw error;
    }
  }

  async updateAppearance(avatarId: string, appearance: Partial<AvatarConfig['appearance']>): Promise<Avatar | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      if (!avatar) {
        return null;
      }

      const updatedConfig: AvatarConfig = {
        ...avatar.config,
        appearance: {
          ...avatar.config.appearance,
          ...appearance
        }
      };

      return await this.updateAvatar(avatarId, { config: updatedConfig });
    } catch (error) {
      console.error('❌ Error al actualizar apariencia:', error);
      throw error;
    }
  }

  async updatePersonality(avatarId: string, personality: Partial<AvatarConfig['personality']>): Promise<Avatar | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      if (!avatar) {
        return null;
      }

      const updatedConfig: AvatarConfig = {
        ...avatar.config,
        personality: {
          ...avatar.config.personality,
          ...personality
        }
      };

      return await this.updateAvatar(avatarId, { config: updatedConfig });
    } catch (error) {
      console.error('❌ Error al actualizar personalidad:', error);
      throw error;
    }
  }

  async recordInteraction(avatarId: string, interactionType: string, data?: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      if (!avatar) {
        return;
      }

      const updatedAvatar: Avatar = {
        ...avatar,
        interactions: avatar.interactions + 1,
        lastInteraction: Date.now(),
        updatedAt: Date.now()
      };

      // Aprender de la interacción
      if (interactionType === 'animation_learned') {
        updatedAvatar.animationsLearned += 1;
      } else if (interactionType === 'knowledge_gained') {
        updatedAvatar.knowledgeLevel = Math.min(updatedAvatar.knowledgeLevel + 0.1, 10);
      }

      this.avatars.set(avatarId, updatedAvatar);
      
      console.log(`📊 Interacción registrada para avatar ${avatarId}: ${interactionType}`);
    } catch (error) {
      console.error('❌ Error al registrar interacción:', error);
    }
  }

  async getAvatarStats(avatarId: string): Promise<any | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      if (!avatar) {
        return null;
      }

      const ageInDays = (Date.now() - avatar.createdAt) / (1000 * 60 * 60 * 24);
      const lastInteractionDays = avatar.lastInteraction 
        ? (Date.now() - avatar.lastInteraction) / (1000 * 60 * 60 * 24)
        : null;

      return {
        id: avatar.id,
        name: avatar.config.name,
        age: Math.floor(ageInDays),
        interactions: avatar.interactions,
        animationsLearned: avatar.animationsLearned,
        knowledgeLevel: avatar.knowledgeLevel,
        lastInteraction: lastInteractionDays ? Math.floor(lastInteractionDays) : null,
        personality: avatar.config.personality,
        appearance: avatar.config.appearance,
        createdAt: avatar.createdAt,
        updatedAt: avatar.updatedAt
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas del avatar:', error);
      throw error;
    }
  }

  async getAllAvatars(): Promise<Avatar[]> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      return Array.from(this.avatars.values());
    } catch (error) {
      console.error('❌ Error al obtener todos los avatares:', error);
      throw error;
    }
  }

  async deleteAvatar(avatarId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const deleted = this.avatars.delete(avatarId);
      if (deleted) {
        console.log(`🗑️ Avatar eliminado: ${avatarId}`);
      }
      return deleted;
    } catch (error) {
      console.error('❌ Error al eliminar avatar:', error);
      throw error;
    }
  }

  async exportAvatar(avatarId: string): Promise<any | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const avatar = this.avatars.get(avatarId);
      if (!avatar) {
        return null;
      }

      return {
        avatar,
        exportDate: Date.now(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('❌ Error al exportar avatar:', error);
      throw error;
    }
  }

  async importAvatar(avatarData: any): Promise<Avatar | null> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      if (!avatarData.avatar || !avatarData.avatar.id) {
        throw new Error('Datos de avatar inválidos');
      }

      const avatar = avatarData.avatar;
      
      // Verificar si el avatar ya existe
      if (this.avatars.has(avatar.id)) {
        console.log(`⚠️ Avatar ya existe: ${avatar.id}`);
        return this.avatars.get(avatar.id) || null;
      }

      // Importar avatar
      this.avatars.set(avatar.id, avatar);
      
      console.log(`📥 Avatar importado: ${avatar.config.name} (ID: ${avatar.id})`);
      return avatar;
    } catch (error) {
      console.error('❌ Error al importar avatar:', error);
      throw error;
    }
  }

  async generateRandomAvatar(): Promise<Avatar> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const names = ['Luna', 'Aria', 'Nova', 'Zara', 'Maya', 'Kira', 'Sage', 'Iris'];
      const hairColors = ['#FF69B4', '#8B4513', '#FFD700', '#4169E1', '#32CD32', '#FF6347'];
      const eyeColors = ['#4169E1', '#32CD32', '#FFD700', '#8B4513', '#FF69B4', '#9370DB'];
      const skinTones = ['#FFD700', '#F4A460', '#DEB887', '#CD853F', '#D2691E'];
      const builds = ['slim', 'athletic', 'curvy', 'muscular'];
      const traits = ['intelligent', 'friendly', 'creative', 'curious', 'adventurous', 'wise', 'energetic', 'calm'];
      const interests = ['AI', 'art', 'music', 'technology', 'blockchain', 'nature', 'space', 'history'];

      const randomConfig: AvatarConfig = {
        name: names[Math.floor(Math.random() * names.length)],
        gender: 'female',
        appearance: {
          hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
          eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
          skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
          height: 1.6 + Math.random() * 0.3,
          build: builds[Math.floor(Math.random() * builds.length)] as any
        },
        personality: {
          traits: traits.sort(() => 0.5 - Math.random()).slice(0, 4),
          interests: interests.sort(() => 0.5 - Math.random()).slice(0, 3),
          communicationStyle: 'friendly and engaging'
        }
      };

      return await this.createAvatar(randomConfig);
    } catch (error) {
      console.error('❌ Error al generar avatar aleatorio:', error);
      throw error;
    }
  }

  async getAvatarRecommendations(userId: string, preferences: any): Promise<Avatar[]> {
    if (!this.isInitialized) {
      throw new Error('AvatarService no está inicializado');
    }

    try {
      const allAvatars = Array.from(this.avatars.values());
      
      // Filtrar avatares basado en preferencias
      let filteredAvatars = allAvatars;
      
      if (preferences.gender) {
        filteredAvatars = filteredAvatars.filter(avatar => avatar.config.gender === preferences.gender);
      }
      
      if (preferences.interests) {
        filteredAvatars = filteredAvatars.filter(avatar => 
          avatar.config.personality.interests.some(interest => 
            preferences.interests.includes(interest)
          )
        );
      }
      
      if (preferences.traits) {
        filteredAvatars = filteredAvatars.filter(avatar => 
          avatar.config.personality.traits.some(trait => 
            preferences.traits.includes(trait)
          )
        );
      }
      
      // Ordenar por relevancia
      filteredAvatars.sort((a, b) => {
        const scoreA = a.interactions + a.knowledgeLevel * 10;
        const scoreB = b.interactions + b.knowledgeLevel * 10;
        return scoreB - scoreA;
      });
      
      return filteredAvatars.slice(0, 5); // Retornar top 5
    } catch (error) {
      console.error('❌ Error al obtener recomendaciones de avatar:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getTotalAvatars(): number {
    return this.avatars.size;
  }

  cleanup(): void {
    this.avatars.clear();
    this.isInitialized = false;
  }
}