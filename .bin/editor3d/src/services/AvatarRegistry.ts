export interface AvatarData {
  id: string;
  name: string;
  description: string;
  type: 'humanoid' | 'creature' | 'robot' | 'abstract';
  category: string;
  tags: string[];
  created: string;
  updated: string;
  version: string;
  author: string;
  thumbnail?: string;
  modelData: {
    geometry: string;
    material: any;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    animations?: string[];
    scripts?: any[];
  };
  metadata: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: 'male' | 'female' | 'neutral';
    personality?: string;
    abilities?: string[];
  };
  exportData?: {
    gltf?: string;
    fbx?: string;
    obj?: string;
  };
}

export interface AvatarCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

class AvatarRegistry {
  private avatars: Map<string, AvatarData> = new Map();
  private categories: Map<string, AvatarCategory> = new Map();
  private storageKey = 'metaverso-avatar-registry';

  constructor() {
    this.initializeDefaultCategories();
    this.loadFromStorage();
  }

  /**
   * Inicializar categorías por defecto
   */
  private initializeDefaultCategories(): void {
    const defaultCategories: AvatarCategory[] = [
      {
        id: 'humanoid',
        name: 'Humanoides',
        description: 'Avatares con forma humana',
        icon: '👤',
        count: 0
      },
      {
        id: 'creature',
        name: 'Criaturas',
        description: 'Animales y criaturas fantásticas',
        icon: '🐉',
        count: 0
      },
      {
        id: 'robot',
        name: 'Robots',
        description: 'Avatares mecánicos y cyborgs',
        icon: '🤖',
        count: 0
      },
      {
        id: 'abstract',
        name: 'Abstractos',
        description: 'Formas abstractas y geométricas',
        icon: '🔷',
        count: 0
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  /**
   * Registrar un nuevo avatar
   */
  registerAvatar(avatarData: Omit<AvatarData, 'id' | 'created' | 'updated'>): string {
    const id = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const avatar: AvatarData = {
      ...avatarData,
      id,
      created: now,
      updated: now
    };

    this.avatars.set(id, avatar);
    this.updateCategoryCount(avatar.type);
    this.saveToStorage();
    
    console.log(`Avatar registrado: ${avatar.name} (${id})`);
    return id;
  }

  /**
   * Actualizar avatar existente
   */
  updateAvatar(id: string, updates: Partial<AvatarData>): boolean {
    const avatar = this.avatars.get(id);
    if (!avatar) return false;

    const updatedAvatar: AvatarData = {
      ...avatar,
      ...updates,
      updated: new Date().toISOString()
    };

    this.avatars.set(id, updatedAvatar);
    this.saveToStorage();
    
    console.log(`Avatar actualizado: ${updatedAvatar.name} (${id})`);
    return true;
  }

  /**
   * Eliminar avatar
   */
  removeAvatar(id: string): boolean {
    const avatar = this.avatars.get(id);
    if (!avatar) return false;

    this.avatars.delete(id);
    this.updateCategoryCount(avatar.type, -1);
    this.saveToStorage();
    
    console.log(`Avatar eliminado: ${avatar.name} (${id})`);
    return true;
  }

  /**
   * Obtener avatar por ID
   */
  getAvatar(id: string): AvatarData | null {
    return this.avatars.get(id) || null;
  }

  /**
   * Obtener todos los avatares
   */
  getAllAvatars(): AvatarData[] {
    return Array.from(this.avatars.values());
  }

  /**
   * Obtener avatares por categoría
   */
  getAvatarsByCategory(categoryId: string): AvatarData[] {
    return Array.from(this.avatars.values()).filter(avatar => avatar.type === categoryId);
  }

  /**
   * Buscar avatares por nombre o tags
   */
  searchAvatars(query: string): AvatarData[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.avatars.values()).filter(avatar => 
      avatar.name.toLowerCase().includes(lowerQuery) ||
      avatar.description.toLowerCase().includes(lowerQuery) ||
      avatar.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Obtener categorías
   */
  getCategories(): AvatarCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Obtener categoría por ID
   */
  getCategory(id: string): AvatarCategory | null {
    return this.categories.get(id) || null;
  }

  /**
   * Actualizar contador de categoría
   */
  private updateCategoryCount(categoryId: string, increment: number = 1): void {
    const category = this.categories.get(categoryId);
    if (category) {
      category.count = Math.max(0, category.count + increment);
      this.categories.set(categoryId, category);
    }
  }

  /**
   * Exportar avatar como GLTF (simulado)
   */
  exportAvatarAsGLTF(avatarId: string): string | null {
    const avatar = this.getAvatar(avatarId);
    if (!avatar) return null;

    // Simulación de exportación GLTF
    const gltfData = {
      asset: {
        version: "2.0",
        generator: "Metaverso Editor"
      },
      scene: 0,
      scenes: [{
        nodes: [0]
      }],
      nodes: [{
        mesh: 0,
        translation: avatar.modelData.position,
        rotation: avatar.modelData.rotation,
        scale: avatar.modelData.scale
      }],
      meshes: [{
        primitives: [{
          geometry: 0,
          material: 0
        }]
      }],
      materials: [{
        pbrMetallicRoughness: {
          baseColorFactor: [1, 1, 1, 1]
        }
      }],
      geometries: [{
        attributes: {
          POSITION: {
            bufferView: 0,
            componentType: 5126,
            count: 24,
            type: "VEC3"
          }
        }
      }]
    };

    return JSON.stringify(gltfData, null, 2);
  }

  /**
   * Importar avatar desde datos externos
   */
  importAvatar(importData: any): string {
    const avatarData: Omit<AvatarData, 'id' | 'created' | 'updated'> = {
      name: importData.name || 'Avatar Importado',
      description: importData.description || 'Avatar importado desde archivo externo',
      type: importData.type || 'humanoid',
      category: importData.category || 'imported',
      tags: importData.tags || ['imported'],
      version: importData.version || '1.0.0',
      author: importData.author || 'Unknown',
      modelData: {
        geometry: importData.geometry || 'BoxGeometry',
        material: importData.material || { color: '#ffffff' },
        position: importData.position || { x: 0, y: 0, z: 0 },
        rotation: importData.rotation || { x: 0, y: 0, z: 0 },
        scale: importData.scale || { x: 1, y: 1, z: 1 },
        animations: importData.animations || [],
        scripts: importData.scripts || []
      },
      metadata: importData.metadata || {},
      exportData: importData.exportData || {}
    };

    return this.registerAvatar(avatarData);
  }

  /**
   * Generar thumbnail del avatar (simulado)
   */
  generateThumbnail(avatarId: string): string | null {
    const avatar = this.getAvatar(avatarId);
    if (!avatar) return null;

    // Simulación de generación de thumbnail
    // En implementación real, renderizaría el avatar en un canvas
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Dibujar un placeholder
      ctx.fillStyle = '#3498db';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(avatar.name, 64, 64);
      
      return canvas.toDataURL();
    }

    return null;
  }

  /**
   * Validar datos de avatar
   */
  validateAvatarData(avatarData: Partial<AvatarData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!avatarData.name || avatarData.name.trim().length === 0) {
      errors.push('Nombre de avatar requerido');
    }

    if (!avatarData.type || !this.categories.has(avatarData.type)) {
      errors.push('Tipo de avatar válido requerido');
    }

    if (!avatarData.modelData) {
      errors.push('Datos del modelo requeridos');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Guardar en localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        avatars: Array.from(this.avatars.entries()),
        categories: Array.from(this.categories.entries()),
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando registro de avatares:', error);
    }
  }

  /**
   * Cargar desde localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.avatars) {
          this.avatars = new Map(data.avatars);
        }
        
        if (data.categories) {
          this.categories = new Map(data.categories);
        }
        
        console.log(`Registro de avatares cargado: ${this.avatars.size} avatares`);
      }
    } catch (error) {
      console.error('Error cargando registro de avatares:', error);
    }
  }

  /**
   * Limpiar todos los datos
   */
  clearAll(): void {
    this.avatars.clear();
    this.categories.clear();
    this.initializeDefaultCategories();
    localStorage.removeItem(this.storageKey);
    console.log('Registro de avatares limpiado');
  }

  /**
   * Obtener estadísticas
   */
  getStats(): {
    totalAvatars: number;
    categories: { [key: string]: number };
    recentAvatars: AvatarData[];
  } {
    const categories: { [key: string]: number } = {};
    this.categories.forEach((category, id) => {
      categories[id] = category.count;
    });

    const recentAvatars = Array.from(this.avatars.values())
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 5);

    return {
      totalAvatars: this.avatars.size,
      categories,
      recentAvatars
    };
  }
}

export const avatarRegistry = new AvatarRegistry(); 