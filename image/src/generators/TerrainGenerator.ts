/**
 * @fileoverview Generador de terrenos procedurales con erosión y texturas
 * @module @metaverso/image-generator/generators/TerrainGenerator
 */

import * as THREE from 'three';
import { TerrainParams, TerrainResult, TerrainMetadata } from '../types';
import { NoiseGenerator } from '../utils/NoiseGenerator';

/**
 * Generador de terrenos procedurales
 */
export class TerrainGenerator {
  private params: TerrainParams;
  private noiseGenerator: NoiseGenerator;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  /**
   * Constructor del generador
   * @param params - Parámetros de generación
   */
  constructor(params: TerrainParams) {
    this.params = this._validateParams(params);
    this.noiseGenerator = new NoiseGenerator();
    
    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: document.createElement('canvas'),
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.params.width, this.params.height);
    
    // Configurar escena
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  /**
   * Generar terreno
   */
  public async generate(): Promise<TerrainResult> {
    const startTime = performance.now();
    
    // Generar heightmap
    const heightmap = await this._generateHeightmap();
    
    // Aplicar erosión si está habilitada
    let finalHeightmap = heightmap;
    if (this.params.erosion) {
      finalHeightmap = await this._applyErosion(heightmap);
    }
    
    // Generar normal map
    const normalMap = this._generateNormalMap(finalHeightmap);
    
    // Generar roughness map
    const roughnessMap = this._generateRoughnessMap(finalHeightmap);
    
    // Crear geometría del terreno
    const geometry = this._createTerrainGeometry(finalHeightmap);
    
    const generationTime = performance.now() - startTime;
    
    // Crear metadata
    const metadata: TerrainMetadata = {
      dimensions: {
        width: this.params.width,
        height: this.params.height
      },
      maxHeight: this.params.maxHeight,
      minHeight: this.params.minHeight,
      generationTime,
      fileSize: this._calculateFileSize(finalHeightmap),
      imageHash: await this._calculateHash(finalHeightmap),
      generationParams: this.params
    };
    
    return {
      heightmap: finalHeightmap,
      normalMap,
      roughnessMap,
      geometry,
      metadata,
      parameters: this.params
    };
  }

  /**
   * Obtener heightmap
   */
  public getHeightmap(): THREE.Texture {
    return this._generateHeightmap();
  }

  /**
   * Actualizar parámetros
   */
  public updateParams(params: Partial<TerrainParams>): void {
    this.params = { ...this.params, ...params };
  }

  /**
   * Validar parámetros
   */
  private _validateParams(params: TerrainParams): TerrainParams {
    return {
      resolution: Math.max(256, Math.min(8192, params.resolution)),
      quality: params.quality || 'high',
      algorithm: params.algorithm || 'simplex',
      octaves: Math.max(1, Math.min(8, params.octaves || 4)),
      persistence: Math.max(0, Math.min(1, params.persistence || 0.5)),
      lacunarity: Math.max(1, Math.min(4, params.lacunarity || 2)),
      seed: params.seed || Math.random() * 1000000,
      colorPalette: params.colorPalette,
      contrast: Math.max(0, Math.min(2, params.contrast || 1)),
      saturation: Math.max(0, Math.min(2, params.saturation || 1)),
      brightness: Math.max(0, Math.min(2, params.brightness || 1)),
      effects: params.effects || {
        atmosphere: false,
        volumetricClouds: false,
        fog: false,
        rain: false,
        snow: false,
        dust: false,
        smoke: false,
        particles: false,
        postProcessing: true,
        bloom: false,
        ssao: false,
        motionBlur: false
      },
      width: Math.max(256, Math.min(4096, params.width || 1024)),
      height: Math.max(256, Math.min(4096, params.height || 1024)),
      scale: Math.max(0.1, Math.min(10, params.scale || 1)),
      maxHeight: Math.max(0, Math.min(1000, params.maxHeight || 100)),
      minHeight: Math.max(-1000, Math.min(0, params.minHeight || 0)),
      erosion: params.erosion ?? true,
      waterErosion: params.waterErosion ?? true,
      thermalErosion: params.thermalErosion ?? true,
      erosionIntensity: Math.max(0, Math.min(1, params.erosionIntensity || 0.5)),
      erosionIterations: Math.max(1, Math.min(100, params.erosionIterations || 10)),
      heightTexture: params.heightTexture ?? true,
      normalTexture: params.normalTexture ?? true,
      roughnessTexture: params.roughnessTexture ?? true
    };
  }

  /**
   * Generar heightmap
   */
  private async _generateHeightmap(): Promise<THREE.Texture> {
    const canvas = document.createElement('canvas');
    canvas.width = this.params.width;
    canvas.height = this.params.height;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(this.params.width, this.params.height);
    const data = imageData.data;
    
    // Generar ruido fractal
    for (let y = 0; y < this.params.height; y++) {
      for (let x = 0; x < this.params.width; x++) {
        const index = (y * this.params.width + x) * 4;
        
        let height = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        
        // Generar ruido fractal
        for (let i = 0; i < this.params.octaves; i++) {
          const nx = x * frequency * this.params.scale / this.params.width;
          const ny = y * frequency * this.params.scale / this.params.height;
          
          let noiseValue = 0;
          
          switch (this.params.algorithm) {
            case 'perlin':
              noiseValue = this.noiseGenerator.perlin2(nx, ny);
              break;
            case 'simplex':
              noiseValue = this.noiseGenerator.simplex2(nx, ny);
              break;
            case 'worley':
              noiseValue = this.noiseGenerator.worley2(nx, ny);
              break;
            case 'cellular':
              noiseValue = this.noiseGenerator.cellular2(nx, ny);
              break;
            case 'fractal':
              noiseValue = this.noiseGenerator.fractal2(nx, ny, this.params.octaves);
              break;
            default:
              noiseValue = this.noiseGenerator.simplex2(nx, ny);
          }
          
          height += noiseValue * amplitude;
          amplitude *= this.params.persistence;
          frequency *= this.params.lacunarity;
        }
        
        // Normalizar altura
        height = (height + 1) * 0.5; // Convertir de [-1,1] a [0,1]
        height = height * (this.params.maxHeight - this.params.minHeight) + this.params.minHeight;
        height = (height - this.params.minHeight) / (this.params.maxHeight - this.params.minHeight);
        
        // Aplicar efectos de color
        const color = this._heightToColor(height);
        
        data[index] = color.r;     // R
        data[index + 1] = color.g; // G
        data[index + 2] = color.b; // B
        data[index + 3] = 255;     // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Aplicar erosión al heightmap
   */
  private async _applyErosion(heightmap: THREE.Texture): Promise<THREE.Texture> {
    const canvas = document.createElement('canvas');
    canvas.width = this.params.width;
    canvas.height = this.params.height;
    const ctx = canvas.getContext('2d')!;
    
    // Obtener datos del heightmap
    const imageData = ctx.createImageData(this.params.width, this.params.height);
    const data = new Float32Array(this.params.width * this.params.height);
    
    // Convertir a array de alturas
    for (let i = 0; i < data.length; i++) {
      const index = i * 4;
      data[i] = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3 / 255;
    }
    
    // Aplicar erosión térmica
    if (this.params.thermalErosion) {
      data = this._thermalErosion(data);
    }
    
    // Aplicar erosión por agua
    if (this.params.waterErosion) {
      data = this._waterErosion(data);
    }
    
    // Convertir de vuelta a imagen
    for (let i = 0; i < data.length; i++) {
      const index = i * 4;
      const height = data[i];
      const color = this._heightToColor(height);
      
      imageData.data[index] = color.r;     // R
      imageData.data[index + 1] = color.g; // G
      imageData.data[index + 2] = color.b; // B
      imageData.data[index + 3] = 255;     // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Erosión térmica
   */
  private _thermalErosion(heights: Float32Array): Float32Array {
    const width = this.params.width;
    const height = this.params.height;
    const iterations = this.params.erosionIterations;
    const intensity = this.params.erosionIntensity;
    
    const result = new Float32Array(heights);
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const index = y * width + x;
          const currentHeight = result[index];
          
          // Vecinos
          const neighbors = [
            result[(y - 1) * width + x], // arriba
            result[(y + 1) * width + x], // abajo
            result[y * width + x - 1],   // izquierda
            result[y * width + x + 1]    // derecha
          ];
          
          // Encontrar vecino más bajo
          let minHeight = currentHeight;
          let minIndex = -1;
          
          for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i] < minHeight) {
              minHeight = neighbors[i];
              minIndex = i;
            }
          }
          
          // Transferir material si hay diferencia
          if (minIndex !== -1) {
            const difference = currentHeight - minHeight;
            const transfer = difference * intensity * 0.25;
            
            result[index] -= transfer;
            
            // Transferir al vecino más bajo
            const neighborY = y + (minIndex === 0 ? -1 : minIndex === 1 ? 1 : 0);
            const neighborX = x + (minIndex === 2 ? -1 : minIndex === 3 ? 1 : 0);
            const neighborIndex = neighborY * width + neighborX;
            result[neighborIndex] += transfer;
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Erosión por agua
   */
  private _waterErosion(heights: Float32Array): Float32Array {
    const width = this.params.width;
    const height = this.params.height;
    const iterations = this.params.erosionIterations;
    const intensity = this.params.erosionIntensity;
    
    const result = new Float32Array(heights);
    const water = new Float32Array(width * height);
    const sediment = new Float32Array(width * height);
    
    // Inicializar agua en la parte superior
    for (let x = 0; x < width; x++) {
      water[x] = 1.0;
    }
    
    for (let iter = 0; iter < iterations; iter++) {
      // Simular flujo de agua
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          
          if (water[index] > 0) {
            // Calcular gradiente
            const currentHeight = result[index] + water[index];
            let minHeight = currentHeight;
            let minX = x;
            let minY = y;
            
            // Buscar dirección de flujo
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const neighborHeight = result[ny * width + nx] + water[ny * width + nx];
                  if (neighborHeight < minHeight) {
                    minHeight = neighborHeight;
                    minX = nx;
                    minY = ny;
                  }
                }
              }
            }
            
            // Transferir agua y sedimento
            if (minX !== x || minY !== y) {
              const transferAmount = Math.min(water[index], currentHeight - minHeight);
              const sedimentCapacity = transferAmount * 4.0;
              
              // Erosionar
              if (sediment[index] < sedimentCapacity) {
                const erosion = Math.min(result[index], (sedimentCapacity - sediment[index]) * intensity);
                result[index] -= erosion;
                sediment[index] += erosion;
              }
              
              // Depositar
              if (sediment[index] > sedimentCapacity) {
                const deposition = (sediment[index] - sedimentCapacity) * 0.1;
                result[index] += deposition;
                sediment[index] -= deposition;
              }
              
              // Transferir
              water[minY * width + minX] += transferAmount;
              water[index] -= transferAmount;
              sediment[minY * width + minX] += sediment[index] * 0.1;
              sediment[index] *= 0.9;
            }
          }
        }
      }
      
      // Evaporar agua
      for (let i = 0; i < water.length; i++) {
        water[i] *= 0.95;
      }
    }
    
    return result;
  }

  /**
   * Generar normal map
   */
  private _generateNormalMap(heightmap: THREE.Texture): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = this.params.width;
    canvas.height = this.params.height;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(this.params.width, this.params.height);
    const data = imageData.data;
    
    // Obtener datos del heightmap
    const heightData = new Float32Array(this.params.width * this.params.height);
    for (let i = 0; i < heightData.length; i++) {
      const index = i * 4;
      heightData[i] = (data[index] + data[index + 1] + data[index + 2]) / 3 / 255;
    }
    
    // Generar normales
    for (let y = 0; y < this.params.height; y++) {
      for (let x = 0; x < this.params.width; x++) {
        const index = (y * this.params.width + x) * 4;
        
        // Calcular gradientes
        const left = x > 0 ? heightData[y * this.params.width + (x - 1)] : heightData[y * this.params.width + x];
        const right = x < this.params.width - 1 ? heightData[y * this.params.width + (x + 1)] : heightData[y * this.params.width + x];
        const up = y > 0 ? heightData[(y - 1) * this.params.width + x] : heightData[y * this.params.width + x];
        const down = y < this.params.height - 1 ? heightData[(y + 1) * this.params.width + x] : heightData[y * this.params.width + x];
        
        const dx = (right - left) * 2.0;
        const dy = (down - up) * 2.0;
        
        // Normal vector
        const normal = new THREE.Vector3(-dx, -dy, 1.0).normalize();
        
        // Convertir a color
        data[index] = (normal.x + 1) * 0.5 * 255;     // R
        data[index + 1] = (normal.y + 1) * 0.5 * 255; // G
        data[index + 2] = normal.z * 255;             // B
        data[index + 3] = 255;                        // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Generar roughness map
   */
  private _generateRoughnessMap(heightmap: THREE.Texture): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = this.params.width;
    canvas.height = this.params.height;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(this.params.width, this.params.height);
    const data = imageData.data;
    
    // Obtener datos del heightmap
    const heightData = new Float32Array(this.params.width * this.params.height);
    for (let i = 0; i < heightData.length; i++) {
      const index = i * 4;
      heightData[i] = (data[index] + data[index + 1] + data[index + 2]) / 3 / 255;
    }
    
    // Generar roughness basado en variación local
    for (let y = 0; y < this.params.height; y++) {
      for (let x = 0; x < this.params.width; x++) {
        const index = (y * this.params.width + x) * 4;
        
        let variance = 0;
        let count = 0;
        
        // Calcular varianza local
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.params.width && ny >= 0 && ny < this.params.height) {
              const neighborHeight = heightData[ny * this.params.width + nx];
              const currentHeight = heightData[y * this.params.width + x];
              variance += Math.abs(neighborHeight - currentHeight);
              count++;
            }
          }
        }
        
        const roughness = Math.min(1.0, variance / count * 4.0);
        
        data[index] = roughness * 255;     // R
        data[index + 1] = roughness * 255; // G
        data[index + 2] = roughness * 255; // B
        data[index + 3] = 255;             // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Crear geometría del terreno
   */
  private _createTerrainGeometry(heightmap: THREE.Texture): THREE.BufferGeometry {
    const geometry = new THREE.PlaneGeometry(
      this.params.width * this.params.scale,
      this.params.height * this.params.scale,
      this.params.width - 1,
      this.params.height - 1
    );
    
    // Aplicar heightmap a la geometría
    const positions = geometry.attributes.position.array as Float32Array;
    const uvs = geometry.attributes.uv?.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Convertir coordenadas de geometría a coordenadas de textura
      const u = (x / (this.params.width * this.params.scale) + 0.5);
      const v = (z / (this.params.height * this.params.scale) + 0.5);
      
      // Obtener altura del heightmap
      const height = this._getHeightFromTexture(heightmap, u, v);
      positions[i + 1] = height * (this.params.maxHeight - this.params.minHeight) + this.params.minHeight;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }

  /**
   * Obtener altura desde textura
   */
  private _getHeightFromTexture(texture: THREE.Texture, u: number, v: number): number {
    // Implementación simplificada - en realidad necesitarías acceder a los datos de la textura
    return 0.5; // Valor por defecto
  }

  /**
   * Convertir altura a color
   */
  private _heightToColor(height: number): { r: number; g: number; b: number } {
    // Paleta de colores basada en altura
    if (height < 0.2) {
      // Agua profunda
      return { r: 0, g: 0, b: 100 };
    } else if (height < 0.3) {
      // Agua poco profunda
      return { r: 0, g: 100, b: 200 };
    } else if (height < 0.4) {
      // Arena
      return { r: 200, g: 200, b: 100 };
    } else if (height < 0.6) {
      // Hierba
      return { r: 50, g: 150, b: 50 };
    } else if (height < 0.8) {
      // Bosque
      return { r: 30, g: 100, b: 30 };
    } else {
      // Montaña
      return { r: 100, g: 100, b: 100 };
    }
  }

  /**
   * Calcular tamaño del archivo
   */
  private _calculateFileSize(texture: THREE.Texture): number {
    return this.params.width * this.params.height * 4; // 4 bytes por pixel (RGBA)
  }

  /**
   * Calcular hash de la imagen
   */
  private async _calculateHash(texture: THREE.Texture): Promise<string> {
    // Implementación simple de hash
    let hash = 0;
    const width = texture.image?.width || this.params.width;
    const height = texture.image?.height || this.params.height;
    
    // Hash simple basado en dimensiones y parámetros
    hash = ((hash << 5) - hash) + width;
    hash = ((hash << 5) - hash) + height;
    hash = ((hash << 5) - hash) + this.params.seed;
    hash = hash & hash; // Convertir a 32-bit
    
    return hash.toString(16);
  }
} 