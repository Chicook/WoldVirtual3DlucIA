import * as THREE from 'three';

export interface MaterialPreset {
  id: string;
  name: string;
  type: 'basic' | 'standard' | 'phong' | 'toon' | 'custom';
  properties: {
    color?: string;
    opacity?: number;
    transparent?: boolean;
    roughness?: number;
    metalness?: number;
    emissive?: string;
    emissiveIntensity?: number;
    wireframe?: boolean;
    side?: 'front' | 'back' | 'double';
    texture?: string;
    normalMap?: string;
    bumpMap?: string;
    envMap?: string;
  };
}

export interface TextureInfo {
  id: string;
  name: string;
  url: string;
  type: 'diffuse' | 'normal' | 'bump' | 'emissive' | 'roughness' | 'metallic';
}

class AdvancedMaterialSystem {
  private materialPresets: Map<string, MaterialPreset> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader;
  private cubeTextureLoader: THREE.CubeTextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.initializeDefaultPresets();
  }

  /**
   * Inicializar presets por defecto
   */
  private initializeDefaultPresets(): void {
    const defaultPresets: MaterialPreset[] = [
      {
        id: 'default',
        name: 'Default',
        type: 'standard',
        properties: {
          color: '#888888',
          roughness: 0.5,
          metalness: 0.5
        }
      },
      {
        id: 'metal',
        name: 'Metal',
        type: 'standard',
        properties: {
          color: '#cccccc',
          roughness: 0.1,
          metalness: 0.9
        }
      },
      {
        id: 'plastic',
        name: 'Plastic',
        type: 'standard',
        properties: {
          color: '#ffffff',
          roughness: 0.8,
          metalness: 0.1
        }
      },
      {
        id: 'glass',
        name: 'Glass',
        type: 'standard',
        properties: {
          color: '#ffffff',
          opacity: 0.3,
          transparent: true,
          roughness: 0.0,
          metalness: 0.0
        }
      },
      {
        id: 'emissive',
        name: 'Emissive',
        type: 'standard',
        properties: {
          color: '#00ff00',
          emissive: '#00ff00',
          emissiveIntensity: 0.5
        }
      },
      {
        id: 'wireframe',
        name: 'Wireframe',
        type: 'basic',
        properties: {
          color: '#ffffff',
          wireframe: true
        }
      }
    ];

    defaultPresets.forEach(preset => {
      this.materialPresets.set(preset.id, preset);
    });
  }

  /**
   * Crear material desde preset
   */
  createMaterialFromPreset(presetId: string): THREE.Material | null {
    const preset = this.materialPresets.get(presetId);
    if (!preset) return null;

    switch (preset.type) {
      case 'basic':
        return this.createBasicMaterial(preset.properties);
      case 'standard':
        return this.createStandardMaterial(preset.properties);
      case 'phong':
        return this.createPhongMaterial(preset.properties);
      case 'toon':
        return this.createToonMaterial(preset.properties);
      default:
        return this.createStandardMaterial(preset.properties);
    }
  }

  /**
   * Crear material básico
   */
  private createBasicMaterial(properties: MaterialPreset['properties']): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial();

    if (properties.color) {
      material.color.setHex(parseInt(properties.color.replace('#', '0x')));
    }
    if (properties.opacity !== undefined) {
      material.opacity = properties.opacity;
      material.transparent = properties.transparent || properties.opacity < 1;
    }
    if (properties.wireframe !== undefined) {
      material.wireframe = properties.wireframe;
    }
    if (properties.side) {
      material.side = this.getSideFromString(properties.side);
    }

    return material;
  }

  /**
   * Crear material estándar (PBR)
   */
  private createStandardMaterial(properties: MaterialPreset['properties']): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial();

    if (properties.color) {
      material.color.setHex(parseInt(properties.color.replace('#', '0x')));
    }
    if (properties.opacity !== undefined) {
      material.opacity = properties.opacity;
      material.transparent = properties.transparent || properties.opacity < 1;
    }
    if (properties.roughness !== undefined) {
      material.roughness = properties.roughness;
    }
    if (properties.metalness !== undefined) {
      material.metalness = properties.metalness;
    }
    if (properties.emissive) {
      material.emissive.setHex(parseInt(properties.emissive.replace('#', '0x')));
    }
    if (properties.emissiveIntensity !== undefined) {
      material.emissiveIntensity = properties.emissiveIntensity;
    }
    if (properties.wireframe !== undefined) {
      material.wireframe = properties.wireframe;
    }
    if (properties.side) {
      material.side = this.getSideFromString(properties.side);
    }

    return material;
  }

  /**
   * Crear material Phong
   */
  private createPhongMaterial(properties: MaterialPreset['properties']): THREE.MeshPhongMaterial {
    const material = new THREE.MeshPhongMaterial();

    if (properties.color) {
      material.color.setHex(parseInt(properties.color.replace('#', '0x')));
    }
    if (properties.opacity !== undefined) {
      material.opacity = properties.opacity;
      material.transparent = properties.transparent || properties.opacity < 1;
    }
    if (properties.emissive) {
      material.emissive.setHex(parseInt(properties.emissive.replace('#', '0x')));
    }
    if (properties.emissiveIntensity !== undefined) {
      material.emissiveIntensity = properties.emissiveIntensity;
    }
    if (properties.wireframe !== undefined) {
      material.wireframe = properties.wireframe;
    }
    if (properties.side) {
      material.side = this.getSideFromString(properties.side);
    }

    return material;
  }

  /**
   * Crear material Toon (cel-shading)
   */
  private createToonMaterial(properties: MaterialPreset['properties']): THREE.MeshToonMaterial {
    const material = new THREE.MeshToonMaterial();

    if (properties.color) {
      material.color.setHex(parseInt(properties.color.replace('#', '0x')));
    }
    if (properties.opacity !== undefined) {
      material.opacity = properties.opacity;
      material.transparent = properties.transparent || properties.opacity < 1;
    }
    if (properties.emissive) {
      material.emissive.setHex(parseInt(properties.emissive.replace('#', '0x')));
    }
    if (properties.emissiveIntensity !== undefined) {
      material.emissiveIntensity = properties.emissiveIntensity;
    }
    if (properties.wireframe !== undefined) {
      material.wireframe = properties.wireframe;
    }
    if (properties.side) {
      material.side = this.getSideFromString(properties.side);
    }

    return material;
  }

  /**
   * Convertir string de lado a constante THREE
   */
  private getSideFromString(side: string): THREE.Side {
    switch (side) {
      case 'front':
        return THREE.FrontSide;
      case 'back':
        return THREE.BackSide;
      case 'double':
        return THREE.DoubleSide;
      default:
        return THREE.FrontSide;
    }
  }

  /**
   * Cargar textura
   */
  async loadTexture(url: string, type: TextureInfo['type'] = 'diffuse'): Promise<THREE.Texture> {
    const textureId = `${type}_${url}`;
    
    if (this.textures.has(textureId)) {
      return this.textures.get(textureId)!;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          this.textures.set(textureId, texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Aplicar textura a material
   */
  async applyTextureToMaterial(
    material: THREE.Material,
    textureUrl: string,
    type: TextureInfo['type'] = 'diffuse'
  ): Promise<void> {
    try {
      const texture = await this.loadTexture(textureUrl, type);
      
      if (material instanceof THREE.MeshStandardMaterial) {
        switch (type) {
          case 'diffuse':
            material.map = texture;
            break;
          case 'normal':
            material.normalMap = texture;
            break;
          case 'bump':
            material.bumpMap = texture;
            break;
          case 'emissive':
            material.emissiveMap = texture;
            break;
          case 'roughness':
            material.roughnessMap = texture;
            break;
          case 'metallic':
            material.metalnessMap = texture;
            break;
        }
      } else if (material instanceof THREE.MeshBasicMaterial) {
        if (type === 'diffuse') {
          material.map = texture;
        }
      }
    } catch (error) {
      console.error('Error loading texture:', error);
    }
  }

  /**
   * Crear material con múltiples texturas
   */
  async createMaterialWithTextures(
    basePresetId: string,
    textures: { url: string; type: TextureInfo['type'] }[]
  ): Promise<THREE.Material | null> {
    const material = this.createMaterialFromPreset(basePresetId);
    if (!material) return null;

    for (const textureInfo of textures) {
      await this.applyTextureToMaterial(material, textureInfo.url, textureInfo.type);
    }

    return material;
  }

  /**
   * Crear material procedural
   */
  createProceduralMaterial(type: 'noise' | 'gradient' | 'checker' | 'voronoi'): THREE.Material {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;

    switch (type) {
      case 'noise':
        this.generateNoiseTexture(context);
        break;
      case 'gradient':
        this.generateGradientTexture(context);
        break;
      case 'checker':
        this.generateCheckerTexture(context);
        break;
      case 'voronoi':
        this.generateVoronoiTexture(context);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    
    return material;
  }

  /**
   * Generar textura de ruido
   */
  private generateNoiseTexture(context: CanvasRenderingContext2D): void {
    const imageData = context.createImageData(256, 256);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255;   // A
    }

    context.putImageData(imageData, 0, 0);
  }

  /**
   * Generar textura de gradiente
   */
  private generateGradientTexture(context: CanvasRenderingContext2D): void {
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.5, '#00ff00');
    gradient.addColorStop(1, '#0000ff');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }

  /**
   * Generar textura de damero
   */
  private generateCheckerTexture(context: CanvasRenderingContext2D): void {
    const size = 32;
    for (let x = 0; x < 256; x += size) {
      for (let y = 0; y < 256; y += size) {
        const isEven = ((x / size) + (y / size)) % 2 === 0;
        context.fillStyle = isEven ? '#ffffff' : '#000000';
        context.fillRect(x, y, size, size);
      }
    }
  }

  /**
   * Generar textura Voronoi
   */
  private generateVoronoiTexture(context: CanvasRenderingContext2D): void {
    const points: { x: number; y: number; color: string }[] = [];
    
    // Generar puntos aleatorios
    for (let i = 0; i < 10; i++) {
      points.push({
        x: Math.random() * 256,
        y: Math.random() * 256,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }

    // Generar células Voronoi
    for (let x = 0; x < 256; x++) {
      for (let y = 0; y < 256; y++) {
        let minDistance = Infinity;
        let closestPoint = points[0];

        for (const point of points) {
          const distance = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }

        context.fillStyle = closestPoint.color;
        context.fillRect(x, y, 1, 1);
      }
    }
  }

  /**
   * Obtener lista de presets disponibles
   */
  getAvailablePresets(): MaterialPreset[] {
    return Array.from(this.materialPresets.values());
  }

  /**
   * Añadir preset personalizado
   */
  addCustomPreset(preset: MaterialPreset): void {
    this.materialPresets.set(preset.id, preset);
  }

  /**
   * Limpiar texturas cargadas
   */
  clearTextures(): void {
    this.textures.forEach(texture => {
      texture.dispose();
    });
    this.textures.clear();
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { presets: number; textures: number } {
    return {
      presets: this.materialPresets.size,
      textures: this.textures.size
    };
  }
}

export const advancedMaterialSystem = new AdvancedMaterialSystem(); 