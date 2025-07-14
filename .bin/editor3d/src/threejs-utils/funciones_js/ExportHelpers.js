/**
 * Export Helpers - Utilidades de exportación e importación de modelos 3D para el editor
 * Maneja la exportación a diferentes formatos, importación de modelos y gestión de assets
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

class ExportHelpers {
  constructor() {
    this.supportedFormats = {
      export: ['gltf', 'glb', 'obj', 'stl', 'json'],
      import: ['gltf', 'glb', 'obj', 'fbx', 'stl', 'json']
    };
    this.loaders = new Map();
    this.exporters = new Map();
    this.initializeLoaders();
    this.initializeExporters();
  }

  /**
   * Inicializa los loaders disponibles
   */
  initializeLoaders() {
    this.loaders.set('gltf', new GLTFLoader());
    this.loaders.set('glb', new GLTFLoader());
    this.loaders.set('obj', new OBJLoader());
    this.loaders.set('fbx', new FBXLoader());
    this.loaders.set('stl', new STLLoader());
  }

  /**
   * Inicializa los exporters disponibles
   */
  initializeExporters() {
    this.exporters.set('gltf', new GLTFExporter());
    this.exporters.set('glb', new GLTFExporter());
    this.exporters.set('obj', new OBJExporter());
  }

  /**
   * Exporta una escena a formato GLTF/GLB
   */
  async exportToGLTF(scene, options = {}) {
    const exporter = this.exporters.get('gltf');
    if (!exporter) {
      throw new Error('GLTF Exporter no disponible');
    }

    const exportOptions = {
      binary: options.binary || false,
      trs: options.trs || false,
      onlyVisible: options.onlyVisible || true,
      truncateDrawRange: options.truncateDrawRange || true,
      maxTextureSize: options.maxTextureSize || 4096,
      animations: options.animations || [],
      includeCustomExtensions: options.includeCustomExtensions || false,
      ...options
    };

    return new Promise((resolve, reject) => {
      exporter.parse(scene, (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          resolve(JSON.stringify(result, null, 2));
        }
      }, exportOptions);
    });
  }

  /**
   * Exporta una escena a formato OBJ
   */
  async exportToOBJ(scene, options = {}) {
    const exporter = this.exporters.get('obj');
    if (!exporter) {
      throw new Error('OBJ Exporter no disponible');
    }

    const exportOptions = {
      ...options
    };

    const result = exporter.parse(scene, exportOptions);
    return result;
  }

  /**
   * Exporta una escena a formato JSON personalizado
   */
  exportToJSON(scene, options = {}) {
    const exportData = {
      metadata: {
        version: '1.0',
        type: 'WoldVirtual3D Scene',
        generator: 'WoldVirtual3D Editor',
        date: new Date().toISOString()
      },
      scene: this.serializeScene(scene, options),
      options: options
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Serializa una escena completa
   */
  serializeScene(scene, options = {}) {
    const sceneData = {
      name: scene.name || 'Scene',
      background: scene.background ? this.serializeColor(scene.background) : null,
      fog: scene.fog ? this.serializeFog(scene.fog) : null,
      children: []
    };

    scene.traverse((object) => {
      if (object.isMesh || object.isLight || object.isCamera) {
        sceneData.children.push(this.serializeObject(object, options));
      }
    });

    return sceneData;
  }

  /**
   * Serializa un objeto 3D
   */
  serializeObject(object, options = {}) {
    const objectData = {
      type: object.type,
      name: object.name,
      uuid: object.uuid,
      position: this.serializeVector3(object.position),
      rotation: this.serializeEuler(object.rotation),
      scale: this.serializeVector3(object.scale),
      visible: object.visible,
      userData: object.userData
    };

    if (object.isMesh) {
      objectData.geometry = this.serializeGeometry(object.geometry);
      objectData.material = this.serializeMaterial(object.material);
      objectData.castShadow = object.castShadow;
      objectData.receiveShadow = object.receiveShadow;
    } else if (object.isLight) {
      objectData.lightData = this.serializeLight(object);
    } else if (object.isCamera) {
      objectData.cameraData = this.serializeCamera(object);
    }

    return objectData;
  }

  /**
   * Serializa una geometría
   */
  serializeGeometry(geometry) {
    if (!geometry) return null;

    const geoData = {
      type: geometry.type,
      uuid: geometry.uuid,
      name: geometry.name
    };

    if (geometry.attributes) {
      geoData.attributes = {};
      for (const [key, attribute] of Object.entries(geometry.attributes)) {
        geoData.attributes[key] = {
          itemSize: attribute.itemSize,
          count: attribute.count,
          array: Array.from(attribute.array)
        };
      }
    }

    if (geometry.index) {
      geoData.index = Array.from(geometry.index.array);
    }

    return geoData;
  }

  /**
   * Serializa un material
   */
  serializeMaterial(material) {
    if (!material) return null;

    const matData = {
      type: material.type,
      uuid: material.uuid,
      name: material.name,
      color: this.serializeColor(material.color),
      opacity: material.opacity,
      transparent: material.transparent,
      side: material.side
    };

    if (material.map) {
      matData.map = this.serializeTexture(material.map);
    }

    return matData;
  }

  /**
   * Serializa una luz
   */
  serializeLight(light) {
    const lightData = {
      type: light.type,
      color: this.serializeColor(light.color),
      intensity: light.intensity
    };

    if (light.castShadow) {
      lightData.castShadow = true;
      lightData.shadow = {
        mapSize: light.shadow.mapSize,
        camera: {
          near: light.shadow.camera.near,
          far: light.shadow.camera.far
        }
      };
    }

    return lightData;
  }

  /**
   * Serializa una cámara
   */
  serializeCamera(camera) {
    const cameraData = {
      type: camera.type
    };

    if (camera.isPerspectiveCamera) {
      cameraData.fov = camera.fov;
      cameraData.aspect = camera.aspect;
      cameraData.near = camera.near;
      cameraData.far = camera.far;
    } else if (camera.isOrthographicCamera) {
      cameraData.left = camera.left;
      cameraData.right = camera.right;
      cameraData.top = camera.top;
      cameraData.bottom = camera.bottom;
      cameraData.near = camera.near;
      cameraData.far = camera.far;
    }

    return cameraData;
  }

  /**
   * Serializa un Vector3
   */
  serializeVector3(vector) {
    return { x: vector.x, y: vector.y, z: vector.z };
  }

  /**
   * Serializa un Euler
   */
  serializeEuler(euler) {
    return { x: euler.x, y: euler.y, z: euler.z, order: euler.order };
  }

  /**
   * Serializa un Color
   */
  serializeColor(color) {
    return { hex: color.getHexString(), r: color.r, g: color.g, b: color.b };
  }

  /**
   * Serializa una textura
   */
  serializeTexture(texture) {
    return {
      uuid: texture.uuid,
      name: texture.name,
      type: texture.type,
      format: texture.format,
      mapping: texture.mapping,
      wrapS: texture.wrapS,
      wrapT: texture.wrapT,
      magFilter: texture.magFilter,
      minFilter: texture.minFilter
    };
  }

  /**
   * Serializa niebla
   */
  serializeFog(fog) {
    if (fog.isFog) {
      return {
        type: 'Fog',
        color: this.serializeColor(fog.color),
        near: fog.near,
        far: fog.far
      };
    } else if (fog.isFogExp2) {
      return {
        type: 'FogExp2',
        color: this.serializeColor(fog.color),
        density: fog.density
      };
    }
    return null;
  }

  /**
   * Importa un modelo desde archivo
   */
  async importModel(url, format, options = {}) {
    const loader = this.loaders.get(format.toLowerCase());
    if (!loader) {
      throw new Error(`Formato '${format}' no soportado para importación`);
    }

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (result) => {
          try {
            const processedResult = this.processImportedModel(result, options);
            resolve(processedResult);
          } catch (error) {
            reject(error);
          }
        },
        (progress) => {
          if (options.onProgress) {
            options.onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Procesa un modelo importado
   */
  processImportedModel(result, options = {}) {
    let scene, animations;

    if (result.scene) {
      scene = result.scene;
      animations = result.animations || [];
    } else {
      scene = result;
      animations = [];
    }

    // Aplicar opciones de procesamiento
    if (options.scale) {
      scene.scale.setScalar(options.scale);
    }

    if (options.position) {
      scene.position.copy(options.position);
    }

    if (options.rotation) {
      scene.rotation.copy(options.rotation);
    }

    // Procesar materiales si es necesario
    if (options.processMaterials) {
      scene.traverse((object) => {
        if (object.isMesh && object.material) {
          this.processMaterial(object.material, options);
        }
      });
    }

    return { scene, animations };
  }

  /**
   * Procesa un material importado
   */
  processMaterial(material, options = {}) {
    if (options.enableShadows !== undefined) {
      material.needsUpdate = true;
    }

    if (options.alphaTest !== undefined) {
      material.alphaTest = options.alphaTest;
    }

    if (options.transparent !== undefined) {
      material.transparent = options.transparent;
    }

    if (options.side !== undefined) {
      material.side = options.side;
    }
  }

  /**
   * Descarga un archivo
   */
  downloadFile(content, filename, mimeType = 'application/octet-stream') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta y descarga una escena
   */
  async exportAndDownload(scene, format, filename, options = {}) {
    let content, mimeType;

    switch (format.toLowerCase()) {
      case 'gltf':
        content = await this.exportToGLTF(scene, { ...options, binary: false });
        mimeType = 'model/gltf+json';
        break;
      case 'glb':
        content = await this.exportToGLTF(scene, { ...options, binary: true });
        mimeType = 'model/gltf-binary';
        break;
      case 'obj':
        content = this.exportToOBJ(scene, options);
        mimeType = 'text/plain';
        break;
      case 'json':
        content = this.exportToJSON(scene, options);
        mimeType = 'application/json';
        break;
      default:
        throw new Error(`Formato '${format}' no soportado para exportación`);
    }

    this.downloadFile(content, filename, mimeType);
    return content;
  }

  /**
   * Obtiene información de formatos soportados
   */
  getSupportedFormats() {
    return this.supportedFormats;
  }

  /**
   * Verifica si un formato es soportado
   */
  isFormatSupported(format, operation = 'import') {
    return this.supportedFormats[operation].includes(format.toLowerCase());
  }

  /**
   * Limpia recursos
   */
  dispose() {
    this.loaders.clear();
    this.exporters.clear();
  }
}

export { ExportHelpers }; 