/**
 * Serialization Helpers - Utilidades de serialización y guardado de escenas para el editor 3D
 * Maneja el guardado/carga de escenas en JSON, exportación a diferentes formatos y gestión de proyectos
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class SerializationHelpers {
  constructor() {
    this.version = '1.0.0';
    this.sceneCache = null;
    this.materialCache = new Map();
    this.animationCache = new Map();
  }

  /**
   * Serializa una escena completa a JSON
   */
  serializeScene(scene) {
    const output = {
      metadata: {
        version: this.version,
        timestamp: new Date().toISOString(),
        name: scene.name || 'Untitled Scene',
        description: scene.userData.description || ''
      },
      scene: {
        background: scene.background ? scene.background.getHexString() : null,
        fog: scene.fog ? this.serializeFog(scene.fog) : null,
        children: []
      },
      materials: [],
      textures: [],
      animations: []
    };

    // Serializar objetos de la escena
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        output.scene.children.push(this.serializeMesh(object));
      } else if (object instanceof THREE.Light) {
        output.scene.children.push(this.serializeLight(object));
      } else if (object instanceof THREE.Camera) {
        output.scene.children.push(this.serializeCamera(object));
      }
    });

    // Serializar materiales únicos
    const materialSet = new Set();
    scene.traverse((object) => {
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => materialSet.add(mat));
        } else {
          materialSet.add(object.material);
        }
      }
    });

    materialSet.forEach(material => {
      output.materials.push(this.serializeMaterial(material));
    });

    return output;
  }

  /**
   * Serializa un mesh con su geometría y material
   */
  serializeMesh(mesh) {
    const geometry = mesh.geometry;
    const material = mesh.material;

    return {
      type: 'mesh',
      name: mesh.name,
      uuid: mesh.uuid,
      position: mesh.position.toArray(),
      rotation: mesh.rotation.toArray(),
      scale: mesh.scale.toArray(),
      geometry: {
        type: geometry.type,
        parameters: geometry.parameters || {},
        attributes: this.serializeGeometryAttributes(geometry)
      },
      material: material ? material.uuid : null,
      userData: mesh.userData,
      visible: mesh.visible,
      castShadow: mesh.castShadow,
      receiveShadow: mesh.receiveShadow
    };
  }

  /**
   * Serializa atributos de geometría
   */
  serializeGeometryAttributes(geometry) {
    const attributes = {};
    
    if (geometry.attributes.position) {
      attributes.position = {
        array: Array.from(geometry.attributes.position.array),
        itemSize: geometry.attributes.position.itemSize,
        normalized: geometry.attributes.position.normalized
      };
    }

    if (geometry.attributes.normal) {
      attributes.normal = {
        array: Array.from(geometry.attributes.normal.array),
        itemSize: geometry.attributes.normal.itemSize,
        normalized: geometry.attributes.normal.normalized
      };
    }

    if (geometry.attributes.uv) {
      attributes.uv = {
        array: Array.from(geometry.attributes.uv.array),
        itemSize: geometry.attributes.uv.itemSize,
        normalized: geometry.attributes.uv.normalized
      };
    }

    return attributes;
  }

  /**
   * Serializa un material
   */
  serializeMaterial(material) {
    const serialized = {
      uuid: material.uuid,
      name: material.name,
      type: material.type,
      color: material.color ? material.color.getHexString() : 0xffffff,
      transparent: material.transparent,
      opacity: material.opacity,
      side: material.side,
      userData: material.userData
    };

    // Propiedades específicas según el tipo de material
    if (material.type === 'MeshStandardMaterial') {
      serialized.roughness = material.roughness;
      serialized.metalness = material.metalness;
      serialized.envMapIntensity = material.envMapIntensity;
    }

    if (material.type === 'MeshPhongMaterial') {
      serialized.shininess = material.shininess;
      serialized.specular = material.specular ? material.specular.getHexString() : 0x111111;
    }

    // Texturas
    if (material.map) {
      serialized.map = this.serializeTexture(material.map);
    }

    if (material.normalMap) {
      serialized.normalMap = this.serializeTexture(material.normalMap);
    }

    return serialized;
  }

  /**
   * Serializa una textura
   */
  serializeTexture(texture) {
    return {
      uuid: texture.uuid,
      name: texture.name,
      image: texture.image ? texture.image.src : null,
      wrapS: texture.wrapS,
      wrapT: texture.wrapT,
      repeat: texture.repeat ? texture.repeat.toArray() : [1, 1],
      offset: texture.offset ? texture.offset.toArray() : [0, 0],
      rotation: texture.rotation,
      center: texture.center ? texture.center.toArray() : [0.5, 0.5]
    };
  }

  /**
   * Serializa una luz
   */
  serializeLight(light) {
    const serialized = {
      type: 'light',
      lightType: light.type,
      name: light.name,
      uuid: light.uuid,
      position: light.position.toArray(),
      color: light.color.getHexString(),
      intensity: light.intensity,
      visible: light.visible,
      castShadow: light.castShadow
    };

    if (light.type === 'DirectionalLight') {
      serialized.target = light.target ? light.target.position.toArray() : [0, 0, 0];
    }

    if (light.type === 'SpotLight') {
      serialized.angle = light.angle;
      serialized.penumbra = light.penumbra;
      serialized.distance = light.distance;
      serialized.target = light.target ? light.target.position.toArray() : [0, 0, 0];
    }

    if (light.type === 'PointLight') {
      serialized.distance = light.distance;
      serialized.decay = light.decay;
    }

    return serialized;
  }

  /**
   * Serializa una cámara
   */
  serializeCamera(camera) {
    const serialized = {
      type: 'camera',
      cameraType: camera.type,
      name: camera.name,
      uuid: camera.uuid,
      position: camera.position.toArray(),
      rotation: camera.rotation.toArray(),
      visible: camera.visible
    };

    if (camera.type === 'PerspectiveCamera') {
      serialized.fov = camera.fov;
      serialized.aspect = camera.aspect;
      serialized.near = camera.near;
      serialized.far = camera.far;
    }

    if (camera.type === 'OrthographicCamera') {
      serialized.left = camera.left;
      serialized.right = camera.right;
      serialized.top = camera.top;
      serialized.bottom = camera.bottom;
      serialized.near = camera.near;
      serialized.far = camera.far;
    }

    return serialized;
  }

  /**
   * Serializa niebla
   */
  serializeFog(fog) {
    return {
      type: fog.type,
      color: fog.color.getHexString(),
      near: fog.near,
      far: fog.far
    };
  }

  /**
   * Deserializa una escena desde JSON
   */
  deserializeScene(data) {
    const scene = new THREE.Scene();
    
    // Aplicar metadatos
    scene.name = data.metadata.name;
    scene.userData.description = data.metadata.description;

    // Aplicar fondo
    if (data.scene.background) {
      scene.background = new THREE.Color(data.scene.background);
    }

    // Aplicar niebla
    if (data.scene.fog) {
      scene.fog = this.deserializeFog(data.scene.fog);
    }

    // Crear materiales
    const materialMap = new Map();
    data.materials.forEach(materialData => {
      const material = this.deserializeMaterial(materialData);
      materialMap.set(materialData.uuid, material);
    });

    // Crear objetos
    data.scene.children.forEach(childData => {
      const object = this.deserializeObject(childData, materialMap);
      if (object) {
        scene.add(object);
      }
    });

    return scene;
  }

  /**
   * Deserializa un objeto
   */
  deserializeObject(data, materialMap) {
    switch (data.type) {
      case 'mesh':
        return this.deserializeMesh(data, materialMap);
      case 'light':
        return this.deserializeLight(data);
      case 'camera':
        return this.deserializeCamera(data);
      default:
        console.warn('Unknown object type:', data.type);
        return null;
    }
  }

  /**
   * Deserializa un mesh
   */
  deserializeMesh(data, materialMap) {
    const geometry = this.deserializeGeometry(data.geometry);
    const material = data.material ? materialMap.get(data.material) : null;
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = data.name;
    mesh.uuid = data.uuid;
    mesh.position.fromArray(data.position);
    mesh.rotation.fromArray(data.rotation);
    mesh.scale.fromArray(data.scale);
    mesh.userData = data.userData;
    mesh.visible = data.visible;
    mesh.castShadow = data.castShadow;
    mesh.receiveShadow = data.receiveShadow;

    return mesh;
  }

  /**
   * Deserializa geometría
   */
  deserializeGeometry(data) {
    let geometry;

    switch (data.type) {
      case 'BoxGeometry':
        geometry = new THREE.BoxGeometry(
          data.parameters.width,
          data.parameters.height,
          data.parameters.depth
        );
        break;
      case 'SphereGeometry':
        geometry = new THREE.SphereGeometry(
          data.parameters.radius,
          data.parameters.widthSegments,
          data.parameters.heightSegments
        );
        break;
      case 'CylinderGeometry':
        geometry = new THREE.CylinderGeometry(
          data.parameters.radiusTop,
          data.parameters.radiusBottom,
          data.parameters.height,
          data.parameters.radialSegments
        );
        break;
      default:
        geometry = new THREE.BufferGeometry();
        break;
    }

    // Aplicar atributos personalizados
    if (data.attributes) {
      Object.keys(data.attributes).forEach(key => {
        const attr = data.attributes[key];
        geometry.setAttribute(key, new THREE.BufferAttribute(
          new Float32Array(attr.array),
          attr.itemSize,
          attr.normalized
        ));
      });
    }

    return geometry;
  }

  /**
   * Deserializa un material
   */
  deserializeMaterial(data) {
    let material;

    switch (data.type) {
      case 'MeshStandardMaterial':
        material = new THREE.MeshStandardMaterial();
        material.roughness = data.roughness;
        material.metalness = data.metalness;
        material.envMapIntensity = data.envMapIntensity;
        break;
      case 'MeshPhongMaterial':
        material = new THREE.MeshPhongMaterial();
        material.shininess = data.shininess;
        material.specular = new THREE.Color(data.specular);
        break;
      default:
        material = new THREE.MeshBasicMaterial();
        break;
    }

    material.uuid = data.uuid;
    material.name = data.name;
    material.color = new THREE.Color(data.color);
    material.transparent = data.transparent;
    material.opacity = data.opacity;
    material.side = data.side;
    material.userData = data.userData;

    return material;
  }

  /**
   * Deserializa una luz
   */
  deserializeLight(data) {
    let light;

    switch (data.lightType) {
      case 'DirectionalLight':
        light = new THREE.DirectionalLight(data.color, data.intensity);
        if (data.target) {
          light.target.position.fromArray(data.target);
        }
        break;
      case 'SpotLight':
        light = new THREE.SpotLight(data.color, data.intensity);
        light.angle = data.angle;
        light.penumbra = data.penumbra;
        light.distance = data.distance;
        if (data.target) {
          light.target.position.fromArray(data.target);
        }
        break;
      case 'PointLight':
        light = new THREE.PointLight(data.color, data.intensity, data.distance);
        light.decay = data.decay;
        break;
      default:
        light = new THREE.AmbientLight(data.color, data.intensity);
        break;
    }

    light.name = data.name;
    light.uuid = data.uuid;
    light.position.fromArray(data.position);
    light.visible = data.visible;
    light.castShadow = data.castShadow;

    return light;
  }

  /**
   * Deserializa una cámara
   */
  deserializeCamera(data) {
    let camera;

    switch (data.cameraType) {
      case 'PerspectiveCamera':
        camera = new THREE.PerspectiveCamera(data.fov, data.aspect, data.near, data.far);
        break;
      case 'OrthographicCamera':
        camera = new THREE.OrthographicCamera(
          data.left, data.right, data.top, data.bottom, data.near, data.far
        );
        break;
      default:
        camera = new THREE.PerspectiveCamera();
        break;
    }

    camera.name = data.name;
    camera.uuid = data.uuid;
    camera.position.fromArray(data.position);
    camera.rotation.fromArray(data.rotation);
    camera.visible = data.visible;

    return camera;
  }

  /**
   * Deserializa niebla
   */
  deserializeFog(data) {
    return new THREE.Fog(data.color, data.near, data.far);
  }

  /**
   * Exporta la escena a un archivo JSON
   */
  exportToJSON(scene, filename = 'scene.json') {
    const data = this.serializeScene(scene);
    const json = JSON.stringify(data, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Importa una escena desde un archivo JSON
   */
  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const scene = this.deserializeScene(data);
          resolve(scene);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

export default SerializationHelpers; 