/**
 * Texture Helpers - Utilidades de carga y gestión de texturas para el editor 3D
 * Maneja la carga de texturas, aplicación de materiales, gestión de UV mapping y optimización
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class TextureHelpers {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.textureCache = new Map();
    this.materialLibrary = new Map();
    this.defaultTextures = this.createDefaultTextures();
    this.textureCounter = 0;
    this.maxTextureSize = 2048;
    this.compressionEnabled = true;
  }

  /**
   * Crea texturas por defecto para el editor
   */
  createDefaultTextures() {
    return {
      checkerboard: this.createCheckerboardTexture(256, 256, 0xffffff, 0xcccccc),
      grid: this.createGridTexture(256, 256, 0xffffff, 0x666666),
      noise: this.createNoiseTexture(256, 256),
      gradient: this.createGradientTexture(256, 256, 0x000000, 0xffffff),
      normal: this.createNormalTexture(256, 256)
    };
  }

  /**
   * Crea una textura de tablero de ajedrez
   */
  createCheckerboardTexture(width, height, color1 = 0xffffff, color2 = 0x000000) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const tileSize = 32;
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isEven ? `#${color1.toString(16).padStart(6, '0')}` : `#${color2.toString(16).padStart(6, '0')}`;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  /**
   * Crea una textura de cuadrícula
   */
  createGridTexture(width, height, lineColor = 0xffffff, bgColor = 0x000000) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fondo
    ctx.fillStyle = `#${bgColor.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, width, height);
    
    // Líneas de la cuadrícula
    ctx.strokeStyle = `#${lineColor.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 1;
    
    const gridSize = 32;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Crea una textura de ruido
   */
  createNoiseTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255;   // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Crea una textura de gradiente
   */
  createGradientTexture(width, height, color1 = 0x000000, color2 = 0xffffff) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `#${color1.toString(16).padStart(6, '0')}`);
    gradient.addColorStop(1, `#${color2.toString(16).padStart(6, '0')}`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Crea una textura normal básica
   */
  createNormalTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128;     // R (X normal)
      data[i + 1] = 128; // G (Y normal)
      data[i + 2] = 255; // B (Z normal)
      data[i + 3] = 255; // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Carga una textura desde URL con cache
   */
  loadTexture(url, options = {}) {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url);
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.applyTextureOptions(texture, options);
          this.textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Aplica opciones a una textura
   */
  applyTextureOptions(texture, options = {}) {
    texture.wrapS = options.wrapS || THREE.RepeatWrapping;
    texture.wrapT = options.wrapT || THREE.RepeatWrapping;
    texture.repeat.set(options.repeatX || 1, options.repeatY || 1);
    texture.offset.set(options.offsetX || 0, options.offsetY || 0);
    texture.rotation = options.rotation || 0;
    texture.flipY = options.flipY !== undefined ? options.flipY : true;
    texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : true;
    
    if (options.anisotropy) {
      texture.anisotropy = options.anisotropy;
    }
  }

  /**
   * Crea un material con textura
   */
  createMaterialWithTexture(texture, materialType = 'standard', options = {}) {
    const materialOptions = {
      map: texture,
      ...options
    };

    let material;
    switch (materialType) {
      case 'basic':
        material = new THREE.MeshBasicMaterial(materialOptions);
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial(materialOptions);
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial(materialOptions);
        break;
      case 'standard':
      default:
        material = new THREE.MeshStandardMaterial(materialOptions);
        break;
    }

    return material;
  }

  /**
   * Optimiza una textura para el rendimiento
   */
  optimizeTexture(texture, maxSize = null) {
    const maxTextureSize = maxSize || this.maxTextureSize;
    
    if (texture.image) {
      const width = texture.image.width;
      const height = texture.image.height;
      
      if (width > maxTextureSize || height > maxTextureSize) {
        const scale = Math.min(maxTextureSize / width, maxTextureSize / height);
        const newWidth = Math.floor(width * scale);
        const newHeight = Math.floor(height * scale);
        
        // Redimensionar usando canvas
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(texture.image, 0, 0, newWidth, newHeight);
        texture.image = canvas;
        texture.needsUpdate = true;
      }
    }
    
    return texture;
  }

  /**
   * Limpia el cache de texturas
   */
  clearTextureCache() {
    this.textureCache.forEach(texture => {
      texture.dispose();
    });
    this.textureCache.clear();
  }

  /**
   * Obtiene información de una textura
   */
  getTextureInfo(texture) {
    if (!texture || !texture.image) {
      return null;
    }

    return {
      width: texture.image.width,
      height: texture.image.height,
      format: texture.format,
      type: texture.type,
      size: texture.image.width * texture.image.height * 4, // bytes aproximados
      mipmaps: texture.generateMipmaps,
      anisotropy: texture.anisotropy
    };
  }
}

export default TextureHelpers;
