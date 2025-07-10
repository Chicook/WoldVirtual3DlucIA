/**
 * Lighting Helpers - Utilidades de iluminación y efectos visuales para el editor 3D
 * Maneja la creación de luces, sombras, efectos atmosféricos y configuración de iluminación
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class LightingHelpers {
  constructor() {
    this.lights = new Map();
    this.shadowMapEnabled = true;
    this.ambientLight = null;
    this.directionalLight = null;
    this.hemisphereLight = null;
    this.fog = null;
    this.postProcessing = null;
  }

  /**
   * Configura la iluminación básica de la escena
   */
  setupBasicLighting(scene, renderer) {
    // Configurar sombras
    renderer.shadowMap.enabled = this.shadowMapEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;

    // Luz ambiental
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.ambientLight.name = 'AmbientLight';
    scene.add(this.ambientLight);

    // Luz direccional principal
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(10, 10, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.name = 'DirectionalLight';
    scene.add(this.directionalLight);

    // Luz hemisférica para mejor iluminación
    this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x404040, 0.3);
    this.hemisphereLight.position.set(0, 20, 0);
    this.hemisphereLight.name = 'HemisphereLight';
    scene.add(this.hemisphereLight);

    return {
      ambient: this.ambientLight,
      directional: this.directionalLight,
      hemisphere: this.hemisphereLight
    };
  }

  /**
   * Crea una luz puntual
   */
  createPointLight(options = {}) {
    const light = new THREE.PointLight(
      options.color || 0xffffff,
      options.intensity !== undefined ? options.intensity : 1.0,
      options.distance !== undefined ? options.distance : 0,
      options.decay !== undefined ? options.decay : 2
    );

    light.position.copy(options.position || new THREE.Vector3(0, 0, 0));
    light.castShadow = options.castShadow !== undefined ? options.castShadow : true;
    light.name = options.name || `PointLight_${Date.now()}`;

    // Configurar sombras
    if (light.castShadow) {
      light.shadow.mapSize.width = options.shadowMapSize || 512;
      light.shadow.mapSize.height = options.shadowMapSize || 512;
      light.shadow.camera.near = options.shadowNear || 0.1;
      light.shadow.camera.far = options.shadowFar || 100;
    }

    this.lights.set(light.name, light);
    return light;
  }

  /**
   * Crea una luz direccional
   */
  createDirectionalLight(options = {}) {
    const light = new THREE.DirectionalLight(
      options.color || 0xffffff,
      options.intensity !== undefined ? options.intensity : 1.0
    );

    light.position.copy(options.position || new THREE.Vector3(0, 10, 0));
    light.target.position.copy(options.target || new THREE.Vector3(0, 0, 0));
    light.castShadow = options.castShadow !== undefined ? options.castShadow : true;
    light.name = options.name || `DirectionalLight_${Date.now()}`;

    // Configurar sombras
    if (light.castShadow) {
      light.shadow.mapSize.width = options.shadowMapSize || 2048;
      light.shadow.mapSize.height = options.shadowMapSize || 2048;
      light.shadow.camera.near = options.shadowNear || 0.5;
      light.shadow.camera.far = options.shadowFar || 50;
      light.shadow.camera.left = options.shadowLeft || -10;
      light.shadow.camera.right = options.shadowRight || 10;
      light.shadow.camera.top = options.shadowTop || 10;
      light.shadow.camera.bottom = options.shadowBottom || -10;
    }

    this.lights.set(light.name, light);
    return light;
  }

  /**
   * Crea una luz spot
   */
  createSpotLight(options = {}) {
    const light = new THREE.SpotLight(
      options.color || 0xffffff,
      options.intensity !== undefined ? options.intensity : 1.0,
      options.distance !== undefined ? options.distance : 0,
      options.angle !== undefined ? options.angle : Math.PI / 3,
      options.penumbra !== undefined ? options.penumbra : 0,
      options.decay !== undefined ? options.decay : 2
    );

    light.position.copy(options.position || new THREE.Vector3(0, 10, 0));
    light.target.position.copy(options.target || new THREE.Vector3(0, 0, 0));
    light.castShadow = options.castShadow !== undefined ? options.castShadow : true;
    light.name = options.name || `SpotLight_${Date.now()}`;

    // Configurar sombras
    if (light.castShadow) {
      light.shadow.mapSize.width = options.shadowMapSize || 1024;
      light.shadow.mapSize.height = options.shadowMapSize || 1024;
      light.shadow.camera.near = options.shadowNear || 0.1;
      light.shadow.camera.far = options.shadowFar || 100;
    }

    this.lights.set(light.name, light);
    return light;
  }

  /**
   * Crea una luz de área rectangular
   */
  createRectAreaLight(options = {}) {
    const light = new THREE.RectAreaLight(
      options.color || 0xffffff,
      options.intensity !== undefined ? options.intensity : 1.0,
      options.width !== undefined ? options.width : 10,
      options.height !== undefined ? options.height : 10
    );

    light.position.copy(options.position || new THREE.Vector3(0, 10, 0));
    light.lookAt(options.target || new THREE.Vector3(0, 0, 0));
    light.name = options.name || `RectAreaLight_${Date.now()}`;

    this.lights.set(light.name, light);
    return light;
  }

  /**
   * Añade niebla a la escena
   */
  addFog(scene, type = 'linear', options = {}) {
    switch (type) {
      case 'linear':
        this.fog = new THREE.Fog(
          options.color || 0xcccccc,
          options.near !== undefined ? options.near : 1,
          options.far !== undefined ? options.far : 1000
        );
        break;
      case 'exponential':
        this.fog = new THREE.FogExp2(
          options.color || 0xcccccc,
          options.density !== undefined ? options.density : 0.0025
        );
        break;
      default:
        throw new Error(`Tipo de niebla no soportado: ${type}`);
    }

    scene.fog = this.fog;
    return this.fog;
  }

  /**
   * Remueve la niebla de la escena
   */
  removeFog(scene) {
    scene.fog = null;
    this.fog = null;
  }

  /**
   * Configura el renderizado de sombras
   */
  setupShadowRendering(renderer, enabled = true) {
    this.shadowMapEnabled = enabled;
    renderer.shadowMap.enabled = enabled;
    
    if (enabled) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = true;
    }
  }

  /**
   * Habilita sombras para un objeto
   */
  enableShadows(object, castShadow = true, receiveShadow = true) {
    if (object.isMesh) {
      object.castShadow = castShadow;
      object.receiveShadow = receiveShadow;
    } else if (object.isGroup) {
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = castShadow;
          child.receiveShadow = receiveShadow;
        }
      });
    }
  }

  /**
   * Crea un efecto de iluminación de tres puntos
   */
  createThreePointLighting(scene, options = {}) {
    const keyLight = this.createDirectionalLight({
      color: options.keyColor || 0xffffff,
      intensity: options.keyIntensity || 1.0,
      position: options.keyPosition || new THREE.Vector3(10, 10, 5),
      target: options.keyTarget || new THREE.Vector3(0, 0, 0),
      name: 'KeyLight'
    });

    const fillLight = this.createDirectionalLight({
      color: options.fillColor || 0x87ceeb,
      intensity: options.fillIntensity || 0.3,
      position: options.fillPosition || new THREE.Vector3(-10, 5, 5),
      target: options.fillTarget || new THREE.Vector3(0, 0, 0),
      name: 'FillLight'
    });

    const backLight = this.createDirectionalLight({
      color: options.backColor || 0xffffff,
      intensity: options.backIntensity || 0.5,
      position: options.backPosition || new THREE.Vector3(0, 10, -10),
      target: options.backTarget || new THREE.Vector3(0, 0, 0),
      name: 'BackLight'
    });

    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);

    return { keyLight, fillLight, backLight };
  }

  /**
   * Crea un efecto de iluminación de estudio
   */
  createStudioLighting(scene, options = {}) {
    // Luz principal frontal
    const mainLight = this.createDirectionalLight({
      color: options.mainColor || 0xffffff,
      intensity: options.mainIntensity || 1.0,
      position: options.mainPosition || new THREE.Vector3(0, 10, 10),
      target: options.mainTarget || new THREE.Vector3(0, 0, 0),
      name: 'MainLight'
    });

    // Luz de relleno suave
    const fillLight = this.createDirectionalLight({
      color: options.fillColor || 0x87ceeb,
      intensity: options.fillIntensity || 0.4,
      position: options.fillPosition || new THREE.Vector3(-10, 5, 5),
      target: options.fillTarget || new THREE.Vector3(0, 0, 0),
      name: 'FillLight'
    });

    // Luz de contorno
    const rimLight = this.createDirectionalLight({
      color: options.rimColor || 0xffffff,
      intensity: options.rimIntensity || 0.6,
      position: options.rimPosition || new THREE.Vector3(0, 5, -10),
      target: options.rimTarget || new THREE.Vector3(0, 0, 0),
      name: 'RimLight'
    });

    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(
      options.ambientColor || 0x404040,
      options.ambientIntensity || 0.2
    );
    ambientLight.name = 'StudioAmbient';

    scene.add(mainLight);
    scene.add(fillLight);
    scene.add(rimLight);
    scene.add(ambientLight);

    return { mainLight, fillLight, rimLight, ambientLight };
  }

  /**
   * Ajusta la intensidad de todas las luces
   */
  adjustAllLightsIntensity(intensity) {
    this.lights.forEach(light => {
      light.intensity = intensity;
    });

    if (this.ambientLight) this.ambientLight.intensity = intensity * 0.4;
    if (this.directionalLight) this.directionalLight.intensity = intensity * 0.8;
    if (this.hemisphereLight) this.hemisphereLight.intensity = intensity * 0.3;
  }

  /**
   * Cambia el color de todas las luces
   */
  changeAllLightsColor(color) {
    this.lights.forEach(light => {
      if (light.color) {
        light.color.setHex(color);
      }
    });
  }

  /**
   * Obtiene información de todas las luces
   */
  getLightsInfo() {
    const info = {
      totalLights: this.lights.size,
      lights: [],
      ambient: this.ambientLight ? {
        name: this.ambientLight.name,
        intensity: this.ambientLight.intensity,
        color: this.ambientLight.color.getHexString()
      } : null,
      directional: this.directionalLight ? {
        name: this.directionalLight.name,
        intensity: this.directionalLight.intensity,
        color: this.directionalLight.color.getHexString(),
        position: this.directionalLight.position.toArray()
      } : null
    };

    this.lights.forEach((light, name) => {
      info.lights.push({
        name: light.name,
        type: light.type,
        intensity: light.intensity,
        color: light.color ? light.color.getHexString() : null,
        position: light.position ? light.position.toArray() : null,
        castShadow: light.castShadow
      });
    });

    return info;
  }

  /**
   * Limpia todas las luces de la escena
   */
  clearAllLights(scene) {
    this.lights.forEach(light => {
      scene.remove(light);
    });
    this.lights.clear();

    if (this.ambientLight) {
      scene.remove(this.ambientLight);
      this.ambientLight = null;
    }
    if (this.directionalLight) {
      scene.remove(this.directionalLight);
      this.directionalLight = null;
    }
    if (this.hemisphereLight) {
      scene.remove(this.hemisphereLight);
      this.hemisphereLight = null;
    }
  }

  /**
   * Limpia recursos
   */
  dispose() {
    this.lights.clear();
    this.ambientLight = null;
    this.directionalLight = null;
    this.hemisphereLight = null;
    this.fog = null;
    this.postProcessing = null;
  }
}

export { LightingHelpers }; 