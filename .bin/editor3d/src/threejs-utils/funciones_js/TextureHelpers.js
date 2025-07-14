/**
 * Texture Helpers - Utilidades de carga y gestión de texturas para el editor 3D
 * Maneja la carga de texturas, aplicación de materiales, gestión de UVs y optimización
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class TextureHelpers {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.textureCache = new Map();
    this.textureQueue = [];
    this.maxTextureSize = 2048;
    this.compressionEnabled = true;
    this.mipmapEnabled = true;
  }

  /**
   * Carga una textura desde URL con cache y optimización
   */
  loadTexture(url, options = {}) {
    if (this.textureCache.has(url)) {
      return Promise.resolve(this.textureCache.get(url));
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.configureTexture(texture, options);
          this.textureCache.set(url, texture);
          resolve(texture);
        },
        (progress) => {
          console.log(`Cargando textura: ${Math.round(progress.loaded / progress.total * 100)}%`);
        },
        (error) => {
          console.error('Error cargando textura:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Configura una textura con opciones de optimización
   */
  configureTexture(texture, options = {}) {
    texture.generateMipmaps = options.generateMipmaps !== false && this.mipmapEnabled;
    texture.minFilter = options.minFilter || THREE.LinearMipmapLinearFilter;
    texture.magFilter = options.magFilter || THREE.LinearFilter;
    texture.wrapS = options.wrapS || THREE.ClampToEdgeWrapping;
    texture.wrapT = options.wrapT || THREE.ClampToEdgeWrapping;
    texture.anisotropy = options.anisotropy || 16;
    texture.flipY = options.flipY !== false;
    
    if (options.encoding) {
      texture.encoding = options.encoding;
    }
  }

  /**
   * Crea una textura procedural (ruido, gradiente, etc.)
   */
  createProceduralTexture(type, options = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = options.size || 256;
    
    canvas.width = size;
    canvas.height = size;

    switch (type) {
      case 'noise':
        this.generateNoiseTexture(ctx, size, options);
        break;
      case 'gradient':
        this.generateGradientTexture(ctx, size, options);
        break;
      case 'checker':
        this.generateCheckerTexture(ctx, size, options);
        break;
      case 'voronoi':
        this.generateVoronoiTexture(ctx, size, options);
        break;
      default:
        throw new Error(`Tipo de textura procedural no soportado: ${type}`);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.configureTexture(texture, options);
    return texture;
  }

  /**
   * Genera textura de ruido
   */
  generateNoiseTexture(ctx, size, options = {}) {
    const scale = options.scale || 1;
    const octaves = options.octaves || 4;
    const persistence = options.persistence || 0.5;
    const lacunarity = options.lacunarity || 2.0;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let amplitude = 1.0;
        let frequency = scale;
        let noise = 0;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
          noise += this.perlinNoise(x * frequency, y * frequency) * amplitude;
          maxValue += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }

        noise = noise / maxValue;
        const value = Math.floor(noise * 255);
        const index = (y * size + x) * 4;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Genera textura de gradiente
   */
  generateGradientTexture(ctx, size, options = {}) {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    const stops = options.stops || [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#ffffff' }
    ];

    stops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  /**
   * Genera textura de tablero de ajedrez
   */
  generateCheckerTexture(ctx, size, options = {}) {
    const tileSize = options.tileSize || size / 8;
    const color1 = options.color1 || '#ffffff';
    const color2 = options.color2 || '#000000';

    for (let y = 0; y < size; y += tileSize) {
      for (let x = 0; x < size; x += tileSize) {
        const isEven = Math.floor(x / tileSize) % 2 === Math.floor(y / tileSize) % 2;
        ctx.fillStyle = isEven ? color1 : color2;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  }

  /**
   * Genera textura Voronoi
   */
  generateVoronoiTexture(ctx, size, options = {}) {
    const points = options.points || 10;
    const pointPositions = [];
    
    // Generar puntos aleatorios
    for (let i = 0; i < points; i++) {
      pointPositions.push({
        x: Math.random() * size,
        y: Math.random() * size,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let minDistance = Infinity;
        let closestPoint = null;

        // Encontrar el punto más cercano
        for (const point of pointPositions) {
          const distance = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }

        // Aplicar color basado en la distancia
        const intensity = Math.max(0, 1 - minDistance / (size / 4));
        const color = this.hexToRgb(closestPoint.color);
        const index = (y * size + x) * 4;
        
        data[index] = color.r * intensity;     // R
        data[index + 1] = color.g * intensity; // G
        data[index + 2] = color.b * intensity; // B
        data[index + 3] = 255;                 // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Implementación básica de ruido Perlin
   */
  perlinNoise(x, y) {
    // Implementación simplificada de Perlin noise
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.p[X] + Y;
    const AA = this.p[A];
    const AB = this.p[A + 1];
    const B = this.p[X + 1] + Y;
    const BA = this.p[B];
    const BB = this.p[B + 1];

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[AA], x, y), this.grad(this.p[BA], x - 1, y)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1), this.grad(this.p[BB], x - 1, y - 1))
    );
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 15;
    const grad1 = 1 + (h & 7);
    return ((h & 8) ? -grad1 : grad1) * x + ((h & 4) ? -grad1 : grad1) * y;
  }

  /**
   * Convierte color hex a RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Aplica UV mapping a una geometría
   */
  applyUVMapping(geometry, mappingType = 'spherical') {
    const positions = geometry.attributes.position;
    const uvs = new Float32Array(positions.count * 2);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      let u, v;

      switch (mappingType) {
        case 'spherical':
          u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
          v = 0.5 + Math.asin(y) / Math.PI;
          break;
        case 'cylindrical':
          u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
          v = 0.5 + y;
          break;
        case 'planar':
          u = 0.5 + x;
          v = 0.5 + y;
          break;
        default:
          u = 0.5 + x;
          v = 0.5 + y;
      }

      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  /**
   * Optimiza texturas para rendimiento
   */
  optimizeTexture(texture, maxSize = this.maxTextureSize) {
    if (texture.image) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = texture.image.width;
      let height = texture.image.height;
      
      // Redimensionar si es muy grande
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(texture.image, 0, 0, width, height);
      
      const optimizedTexture = new THREE.CanvasTexture(canvas);
      this.configureTexture(optimizedTexture);
      
      return optimizedTexture;
    }
    
    return texture;
  }

  /**
   * Limpia el cache de texturas
   */
  clearCache() {
    this.textureCache.forEach(texture => {
      if (texture.dispose) {
        texture.dispose();
      }
    });
    this.textureCache.clear();
  }
}

// Tabla de permutación para Perlin noise
TextureHelpers.prototype.p = new Array(512);
for (let i = 0; i < 256; i++) {
  TextureHelpers.prototype.p[i] = Math.floor(Math.random() * 256);
}
for (let i = 256; i < 512; i++) {
  TextureHelpers.prototype.p[i] = TextureHelpers.prototype.p[i - 256];
}

export { TextureHelpers }; 