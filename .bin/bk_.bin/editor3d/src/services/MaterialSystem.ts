import * as THREE from 'three';

export interface MaterialProperties {
  id: string;
  name: string;
  type: 'basic' | 'lambert' | 'phong' | 'standard' | 'physical' | 'custom';
  color: string;
  opacity: number;
  transparent: boolean;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  envMap?: string;
  wireframe?: boolean;
  side?: 'front' | 'back' | 'double';
  blending?: 'normal' | 'additive' | 'subtract' | 'multiply';
  shader?: string;
  uniforms?: Record<string, any>;
}

export interface TextureInfo {
  id: string;
  name: string;
  url: string;
  type: 'color' | 'normal' | 'roughness' | 'metalness' | 'ao' | 'emissive';
  loaded: boolean;
  texture?: THREE.Texture;
}

class MaterialSystem {
  private materials: Map<string, MaterialProperties> = new Map();
  private textures: Map<string, TextureInfo> = new Map();
  private textureLoader: THREE.TextureLoader;
  private materialCache: Map<string, THREE.Material> = new Map();

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.initializeDefaultMaterials();
  }

  private initializeDefaultMaterials() {
    const defaultMaterials: MaterialProperties[] = [
      {
        id: 'default-basic',
        name: 'Basic Material',
        type: 'basic',
        color: '#ffffff',
        opacity: 1,
        transparent: false
      },
      {
        id: 'default-lambert',
        name: 'Lambert Material',
        type: 'lambert',
        color: '#ffffff',
        opacity: 1,
        transparent: false
      },
      {
        id: 'default-standard',
        name: 'Standard Material',
        type: 'standard',
        color: '#ffffff',
        opacity: 1,
        transparent: false,
        metalness: 0,
        roughness: 0.5
      },
      {
        id: 'metallic',
        name: 'Metallic',
        type: 'standard',
        color: '#888888',
        opacity: 1,
        transparent: false,
        metalness: 1,
        roughness: 0.1
      },
      {
        id: 'plastic',
        name: 'Plastic',
        type: 'standard',
        color: '#ffffff',
        opacity: 1,
        transparent: false,
        metalness: 0,
        roughness: 0.3
      },
      {
        id: 'glass',
        name: 'Glass',
        type: 'physical',
        color: '#ffffff',
        opacity: 0.3,
        transparent: true,
        metalness: 0,
        roughness: 0
      }
    ];

    defaultMaterials.forEach(material => {
      this.materials.set(material.id, material);
    });
  }

  createMaterial(properties: MaterialProperties): THREE.Material {
    const cacheKey = this.generateCacheKey(properties);
    
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!.clone();
    }

    let material: THREE.Material;

    switch (properties.type) {
      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(properties.color),
          opacity: properties.opacity,
          transparent: properties.transparent,
          wireframe: properties.wireframe || false,
          side: this.getSide(properties.side)
        });
        break;

      case 'lambert':
        material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(properties.color),
          opacity: properties.opacity,
          transparent: properties.transparent,
          emissive: properties.emissive ? new THREE.Color(properties.emissive) : undefined,
          emissiveIntensity: properties.emissiveIntensity || 0,
          wireframe: properties.wireframe || false,
          side: this.getSide(properties.side)
        });
        break;

      case 'phong':
        material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(properties.color),
          opacity: properties.opacity,
          transparent: properties.transparent,
          emissive: properties.emissive ? new THREE.Color(properties.emissive) : undefined,
          emissiveIntensity: properties.emissiveIntensity || 0,
          wireframe: properties.wireframe || false,
          side: this.getSide(properties.side)
        });
        break;

      case 'standard':
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(properties.color),
          opacity: properties.opacity,
          transparent: properties.transparent,
          metalness: properties.metalness || 0,
          roughness: properties.roughness || 0.5,
          emissive: properties.emissive ? new THREE.Color(properties.emissive) : undefined,
          emissiveIntensity: properties.emissiveIntensity || 0,
          wireframe: properties.wireframe || false,
          side: this.getSide(properties.side)
        });
        break;

      case 'physical':
        material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(properties.color),
          opacity: properties.opacity,
          transparent: properties.transparent,
          metalness: properties.metalness || 0,
          roughness: properties.roughness || 0.5,
          emissive: properties.emissive ? new THREE.Color(properties.emissive) : undefined,
          emissiveIntensity: properties.emissiveIntensity || 0,
          wireframe: properties.wireframe || false,
          side: this.getSide(properties.side)
        });
        break;

      case 'custom':
        material = this.createCustomMaterial(properties);
        break;

      default:
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(properties.color),
          opacity: properties.opacity,
          transparent: properties.transparent
        });
    }

    // Aplicar texturas si existen
    this.applyTextures(material, properties);

    // Aplicar blending
    if (properties.blending) {
      material.blending = this.getBlending(properties.blending);
    }

    this.materialCache.set(cacheKey, material.clone());
    return material;
  }

  private createCustomMaterial(properties: MaterialProperties): THREE.Material {
    // Shader básico personalizado
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        float intensity = dot(vNormal, light);
        vec3 finalColor = color * (0.3 + 0.7 * intensity);
        
        // Efecto de ondas
        float wave = sin(vPosition.x * 10.0 + time) * 0.5 + 0.5;
        finalColor += vec3(0.1, 0.1, 0.2) * wave;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const uniforms = {
      color: { value: new THREE.Color(properties.color) },
      time: { value: 0 }
    };

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...uniforms, ...properties.uniforms },
      transparent: properties.transparent,
      opacity: properties.opacity
    });
  }

  private applyTextures(material: THREE.Material, properties: MaterialProperties) {
    if (properties.normalMap) {
      const texture = this.getTexture(properties.normalMap);
      if (texture) {
        (material as any).normalMap = texture;
        (material as any).normalScale = new THREE.Vector2(1, 1);
      }
    }

    if (properties.roughnessMap) {
      const texture = this.getTexture(properties.roughnessMap);
      if (texture) {
        (material as any).roughnessMap = texture;
      }
    }

    if (properties.metalnessMap) {
      const texture = this.getTexture(properties.metalnessMap);
      if (texture) {
        (material as any).metalnessMap = texture;
      }
    }

    if (properties.aoMap) {
      const texture = this.getTexture(properties.aoMap);
      if (texture) {
        (material as any).aoMap = texture;
      }
    }
  }

  addTexture(textureInfo: TextureInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        textureInfo.url,
        (texture) => {
          textureInfo.texture = texture;
          textureInfo.loaded = true;
          this.textures.set(textureInfo.id, textureInfo);
          resolve();
        },
        undefined,
        reject
      );
    });
  }

  getTexture(id: string): THREE.Texture | null {
    const textureInfo = this.textures.get(id);
    return textureInfo?.texture || null;
  }

  getMaterial(id: string): MaterialProperties | null {
    return this.materials.get(id) || null;
  }

  getAllMaterials(): MaterialProperties[] {
    return Array.from(this.materials.values());
  }

  getAllTextures(): TextureInfo[] {
    return Array.from(this.textures.values());
  }

  saveMaterial(properties: MaterialProperties): void {
    this.materials.set(properties.id, properties);
  }

  deleteMaterial(id: string): void {
    this.materials.delete(id);
    // Limpiar cache
    const cacheKeys = Array.from(this.materialCache.keys());
    cacheKeys.forEach(key => {
      if (key.includes(id)) {
        this.materialCache.delete(key);
      }
    });
  }

  private generateCacheKey(properties: MaterialProperties): string {
    return JSON.stringify(properties);
  }

  private getSide(side?: string): THREE.Side {
    switch (side) {
      case 'front': return THREE.FrontSide;
      case 'back': return THREE.BackSide;
      case 'double': return THREE.DoubleSide;
      default: return THREE.FrontSide;
    }
  }

  private getBlending(blending?: string): THREE.Blending {
    switch (blending) {
      case 'additive': return THREE.AdditiveBlending;
      case 'subtract': return THREE.SubtractiveBlending;
      case 'multiply': return THREE.MultiplyBlending;
      default: return THREE.NormalBlending;
    }
  }

  // Actualizar tiempo para shaders personalizados
  updateTime(time: number): void {
    this.materialCache.forEach(material => {
      if (material instanceof THREE.ShaderMaterial && material.uniforms.time) {
        material.uniforms.time.value = time;
      }
    });
  }

  // Limpiar recursos
  dispose(): void {
    this.materialCache.forEach(material => {
      material.dispose();
    });
    this.materialCache.clear();

    this.textures.forEach(textureInfo => {
      if (textureInfo.texture) {
        textureInfo.texture.dispose();
      }
    });
    this.textures.clear();
  }
}

export const materialSystem = new MaterialSystem(); 