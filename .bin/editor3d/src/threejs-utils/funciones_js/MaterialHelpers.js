/**
 * Material Helpers - Utilidades de materiales y texturas para el editor 3D
 * Maneja la creación, gestión y aplicación de materiales como Blender y Godot
 */

import * as THREE from 'three';

class MaterialHelpers {
  constructor() {
    this.materialLibrary = new Map();
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.defaultMaterials = this.createDefaultMaterials();
    this.materialCounter = 0;
  }

  /**
   * Crea materiales por defecto para el editor
   */
  createDefaultMaterials() {
    return {
      standard: new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.1,
        name: 'Standard'
      }),
      basic: new THREE.MeshBasicMaterial({
        color: 0x808080,
        name: 'Basic'
      }),
      lambert: new THREE.MeshLambertMaterial({
        color: 0x808080,
        name: 'Lambert'
      }),
      phong: new THREE.MeshPhongMaterial({
        color: 0x808080,
        shininess: 30,
        name: 'Phong'
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        name: 'Wireframe'
      }),
      transparent: new THREE.MeshBasicMaterial({
        color: 0x808080,
        transparent: true,
        opacity: 0.5,
        name: 'Transparent'
      })
    };
  }

  /**
   * Crea un material estándar con opciones personalizables
   */
  createStandardMaterial(options = {}) {
    const material = new THREE.MeshStandardMaterial({
      color: options.color || 0x808080,
      roughness: options.roughness !== undefined ? options.roughness : 0.5,
      metalness: options.metalness !== undefined ? options.metalness : 0.1,
      transparent: options.transparent || false,
      opacity: options.opacity !== undefined ? options.opacity : 1.0,
      wireframe: options.wireframe || false,
      side: options.side || THREE.FrontSide,
      name: options.name || `Material_${++this.materialCounter}`
    });

    // Aplicar texturas si se especifican
    if (options.map) material.map = options.map;
    if (options.normalMap) material.normalMap = options.normalMap;
    if (options.roughnessMap) material.roughnessMap = options.roughnessMap;
    if (options.metalnessMap) material.metalnessMap = options.metalnessMap;
    if (options.aoMap) material.aoMap = options.aoMap;
    if (options.emissiveMap) material.emissiveMap = options.emissiveMap;

    // Configurar repetición de texturas
    if (options.repeat) {
      const textures = [material.map, material.normalMap, material.roughnessMap, 
                       material.metalnessMap, material.aoMap, material.emissiveMap];
      textures.forEach(texture => {
        if (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
        }
      });
    }

    return material;
  }

  /**
   * Crea un material básico
   */
  createBasicMaterial(options = {}) {
    return new THREE.MeshBasicMaterial({
      color: options.color || 0x808080,
      transparent: options.transparent || false,
      opacity: options.opacity !== undefined ? options.opacity : 1.0,
      wireframe: options.wireframe || false,
      side: options.side || THREE.FrontSide,
      name: options.name || `Basic_${++this.materialCounter}`
    });
  }

  /**
   * Crea un material Lambert
   */
  createLambertMaterial(options = {}) {
    return new THREE.MeshLambertMaterial({
      color: options.color || 0x808080,
      transparent: options.transparent || false,
      opacity: options.opacity !== undefined ? options.opacity : 1.0,
      wireframe: options.wireframe || false,
      side: options.side || THREE.FrontSide,
      name: options.name || `Lambert_${++this.materialCounter}`
    });
  }

  /**
   * Crea un material Phong
   */
  createPhongMaterial(options = {}) {
    return new THREE.MeshPhongMaterial({
      color: options.color || 0x808080,
      shininess: options.shininess !== undefined ? options.shininess : 30,
      transparent: options.transparent || false,
      opacity: options.opacity !== undefined ? options.opacity : 1.0,
      wireframe: options.wireframe || false,
      side: options.side || THREE.FrontSide,
      name: options.name || `Phong_${++this.materialCounter}`
    });
  }

  /**
   * Crea un material de líneas
   */
  createLineMaterial(options = {}) {
    return new THREE.LineBasicMaterial({
      color: options.color || 0x000000,
      linewidth: options.linewidth || 1,
      transparent: options.transparent || false,
      opacity: options.opacity !== undefined ? options.opacity : 1.0,
      name: options.name || `Line_${++this.materialCounter}`
    });
  }

  /**
   * Carga una textura desde URL
   */
  loadTexture(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // Configurar opciones de textura
          if (options.wrapS) texture.wrapS = options.wrapS;
          if (options.wrapT) texture.wrapT = options.wrapT;
          if (options.repeat) texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
          if (options.offset) texture.offset.set(options.offset.x || 0, options.offset.y || 0);
          if (options.rotation) texture.rotation = options.rotation;
          if (options.center) texture.center.copy(options.center);
          
          texture.name = options.name || `Texture_${Date.now()}`;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Carga múltiples texturas
   */
  loadTextures(textureUrls, options = {}) {
    const promises = textureUrls.map(url => this.loadTexture(url, options));
    return Promise.all(promises);
  }

  /**
   * Crea una textura procedural
   */
  createProceduralTexture(type, options = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = options.width || 256;
    canvas.height = options.height || 256;

    switch (type) {
      case 'checkerboard':
        this.createCheckerboardTexture(ctx, canvas.width, canvas.height, options);
        break;
      case 'noise':
        this.createNoiseTexture(ctx, canvas.width, canvas.height, options);
        break;
      case 'gradient':
        this.createGradientTexture(ctx, canvas.width, canvas.height, options);
        break;
      case 'stripes':
        this.createStripesTexture(ctx, canvas.width, canvas.height, options);
        break;
      default:
        throw new Error(`Tipo de textura procedural no soportado: ${type}`);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.name = options.name || `${type}_${Date.now()}`;
    
    return texture;
  }

  /**
   * Crea textura de tablero de ajedrez
   */
  createCheckerboardTexture(ctx, width, height, options = {}) {
    const tileSize = options.tileSize || 32;
    const color1 = options.color1 || '#ffffff';
    const color2 = options.color2 || '#000000';

    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isEven ? color1 : color2;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  }

  /**
   * Crea textura de ruido
   */
  createNoiseTexture(ctx, width, height, options = {}) {
    const scale = options.scale || 1;
    const intensity = options.intensity || 1;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const noise = Math.random() * intensity;
        const value = Math.floor(noise * 255);
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  /**
   * Crea textura de gradiente
   */
  createGradientTexture(ctx, width, height, options = {}) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const stops = options.stops || [
      { offset: 0, color: '#ffffff' },
      { offset: 1, color: '#000000' }
    ];

    stops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Crea textura de rayas
   */
  createStripesTexture(ctx, width, height, options = {}) {
    const stripeWidth = options.stripeWidth || 32;
    const color1 = options.color1 || '#ffffff';
    const color2 = options.color2 || '#000000';
    const horizontal = options.horizontal !== false;

    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = color2;
    if (horizontal) {
      for (let y = 0; y < height; y += stripeWidth * 2) {
        ctx.fillRect(0, y + stripeWidth, width, stripeWidth);
      }
    } else {
      for (let x = 0; x < width; x += stripeWidth * 2) {
        ctx.fillRect(x + stripeWidth, 0, stripeWidth, height);
      }
    }
  }

  /**
   * Aplica material a un objeto
   */
  applyMaterial(object, material) {
    if (!object || !material) return false;

    if (object.isMesh) {
      object.material = material;
    } else if (object.isGroup) {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
        }
      });
    }

    return true;
  }

  /**
   * Aplica material a múltiples objetos
   */
  applyMaterialToObjects(objects, material) {
    if (!Array.isArray(objects)) return false;

    objects.forEach(obj => {
      this.applyMaterial(obj, material);
    });

    return true;
  }

  /**
   * Clona un material
   */
  cloneMaterial(material) {
    if (!material) return null;

    const cloned = material.clone();
    cloned.name = `${material.name}_copy`;
    
    return cloned;
  }

  /**
   * Guarda un material en la biblioteca
   */
  saveToLibrary(material, name = null) {
    if (!material) return false;

    const materialName = name || material.name || `Material_${Date.now()}`;
    this.materialLibrary.set(materialName, material.clone());
    
    return true;
  }

  /**
   * Obtiene un material de la biblioteca
   */
  getFromLibrary(name) {
    const material = this.materialLibrary.get(name);
    return material ? material.clone() : null;
  }

  /**
   * Lista todos los materiales en la biblioteca
   */
  listLibrary() {
    return Array.from(this.materialLibrary.keys());
  }

  /**
   * Elimina un material de la biblioteca
   */
  removeFromLibrary(name) {
    return this.materialLibrary.delete(name);
  }

  /**
   * Limpia la biblioteca de materiales
   */
  clearLibrary() {
    this.materialLibrary.clear();
  }

  /**
   * Obtiene información de un material
   */
  getMaterialInfo(material) {
    if (!material) return null;

    return {
      name: material.name,
      type: material.type,
      color: material.color ? material.color.getHexString() : null,
      transparent: material.transparent,
      opacity: material.opacity,
      wireframe: material.wireframe,
      side: material.side,
      hasMap: !!material.map,
      hasNormalMap: !!material.normalMap,
      hasRoughnessMap: !!material.roughnessMap,
      hasMetalnessMap: !!material.metalnessMap
    };
  }

  /**
   * Limpia recursos
   */
  dispose() {
    // Limpiar materiales por defecto
    Object.values(this.defaultMaterials).forEach(material => {
      if (material.dispose) material.dispose();
    });

    // Limpiar biblioteca
    this.materialLibrary.forEach(material => {
      if (material.dispose) material.dispose();
    });
    this.materialLibrary.clear();

    // Limpiar loaders
    this.textureLoader = null;
    this.cubeTextureLoader = null;
  }
}

export { MaterialHelpers }; 