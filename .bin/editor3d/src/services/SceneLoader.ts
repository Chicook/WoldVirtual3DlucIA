import * as THREE from 'three';
import { MetaversoScene } from './EditorCommunication';
import { collisionSystem } from './CollisionSystem';

export interface LoadedScene {
  id: string;
  name: string;
  scene: THREE.Scene;
  objects: THREE.Object3D[];
  metadata: any;
}

export interface SceneObject3D {
  id: string;
  name: string;
  type: string;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  userData: any;
}

class SceneLoader {
  private loadedScenes: Map<string, LoadedScene> = new Map();
  private currentScene: LoadedScene | null = null;

  /**
   * Cargar una escena del editor en el metaverso
   */
  async loadScene(sceneData: MetaversoScene, targetScene: THREE.Scene): Promise<LoadedScene> {
    console.log('Cargando escena:', sceneData.name);
    
    // Crear grupo para la escena
    const sceneGroup = new THREE.Group();
    sceneGroup.name = `scene_${sceneData.id}`;
    
    const loadedObjects: THREE.Object3D[] = [];
    const sceneObjects3D: SceneObject3D[] = [];

    // Procesar cada objeto de la escena
    for (const obj of sceneData.objects) {
      try {
        const mesh = await this.createObject3D(obj);
        if (mesh) {
          // Aplicar transformaciones
          mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
          mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
          mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
          
          // Añadir metadatos
          mesh.userData = {
            id: obj.id,
            name: obj.name,
            type: obj.type,
            originalData: obj
          };

          sceneGroup.add(mesh);
          loadedObjects.push(mesh);
          
          // Añadir al sistema de colisión si no es una luz
          if (obj.type.toLowerCase() !== 'light') {
            collisionSystem.addCollisionObject(obj.id, mesh, true);
          }
          
          sceneObjects3D.push({
            id: obj.id,
            name: obj.name,
            type: obj.type,
            mesh,
            position: mesh.position.clone(),
            rotation: mesh.rotation.clone(),
            scale: mesh.scale.clone(),
            userData: mesh.userData
          });
        }
      } catch (error) {
        console.error(`Error cargando objeto ${obj.name}:`, error);
      }
    }

    // Aplicar configuración de la escena
    if (sceneData.settings) {
      this.applySceneSettings(sceneData.settings, targetScene);
    }

    // Añadir la escena al metaverso
    targetScene.add(sceneGroup);

    // Crear objeto de escena cargada
    const loadedScene: LoadedScene = {
      id: sceneData.id || 'unknown',
      name: sceneData.name,
      scene: targetScene,
      objects: loadedObjects,
      metadata: sceneData.metadata
    };

    this.loadedScenes.set(loadedScene.id, loadedScene);
    this.currentScene = loadedScene;

    console.log(`Escena "${sceneData.name}" cargada con ${loadedObjects.length} objetos`);
    return loadedScene;
  }

  /**
   * Crear objeto 3D basado en el tipo
   */
  private async createObject3D(obj: any): Promise<THREE.Object3D | null> {
    switch (obj.type.toLowerCase()) {
      case 'cube':
        return this.createCube(obj);
      case 'sphere':
        return this.createSphere(obj);
      case 'cylinder':
        return this.createCylinder(obj);
      case 'plane':
        return this.createPlane(obj);
      case 'cone':
        return this.createCone(obj);
      case 'torus':
        return this.createTorus(obj);
      case 'light':
        return this.createLight(obj);
      default:
        console.warn(`Tipo de objeto no soportado: ${obj.type}`);
        return this.createCube(obj); // Fallback a cubo
    }
  }

  /**
   * Crear cubo
   */
  private createCube(obj: any): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      obj.geometry?.width || 1,
      obj.geometry?.height || 1,
      obj.geometry?.depth || 1
    );
    const material = this.createMaterial(obj.material);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Crear esfera
   */
  private createSphere(obj: any): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(
      obj.geometry?.radius || 0.5,
      obj.geometry?.segments || 32,
      obj.geometry?.rings || 16
    );
    const material = this.createMaterial(obj.material);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Crear cilindro
   */
  private createCylinder(obj: any): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(
      obj.geometry?.radiusTop || 0.5,
      obj.geometry?.radiusBottom || 0.5,
      obj.geometry?.height || 1,
      obj.geometry?.segments || 32
    );
    const material = this.createMaterial(obj.material);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Crear plano
   */
  private createPlane(obj: any): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      obj.geometry?.width || 1,
      obj.geometry?.height || 1
    );
    const material = this.createMaterial(obj.material);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Crear cono
   */
  private createCone(obj: any): THREE.Mesh {
    const geometry = new THREE.ConeGeometry(
      obj.geometry?.radius || 0.5,
      obj.geometry?.height || 1,
      obj.geometry?.segments || 32
    );
    const material = this.createMaterial(obj.material);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Crear toro
   */
  private createTorus(obj: any): THREE.Mesh {
    const geometry = new THREE.TorusGeometry(
      obj.geometry?.radius || 0.5,
      obj.geometry?.tube || 0.2,
      obj.geometry?.radialSegments || 16,
      obj.geometry?.tubularSegments || 32
    );
    const material = this.createMaterial(obj.material);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Crear luz
   */
  private createLight(obj: any): THREE.Light {
    const lightType = obj.light?.type || 'point';
    const color = new THREE.Color(obj.light?.color || '#ffffff');
    const intensity = obj.light?.intensity || 1;

    switch (lightType.toLowerCase()) {
      case 'point':
        return new THREE.PointLight(color, intensity);
      case 'directional':
        return new THREE.DirectionalLight(color, intensity);
      case 'spot':
        return new THREE.SpotLight(color, intensity);
      case 'ambient':
        return new THREE.AmbientLight(color, intensity);
      default:
        return new THREE.PointLight(color, intensity);
    }
  }

  /**
   * Crear material
   */
  private createMaterial(materialData: any): THREE.Material {
    if (!materialData) {
      return new THREE.MeshStandardMaterial({ color: 0x888888 });
    }

    const color = materialData.color ? new THREE.Color(materialData.color) : new THREE.Color(0x888888);
    const opacity = materialData.opacity !== undefined ? materialData.opacity : 1;
    const transparent = opacity < 1;

    return new THREE.MeshStandardMaterial({
      color,
      opacity,
      transparent,
      roughness: materialData.roughness || 0.5,
      metalness: materialData.metalness || 0.5,
      wireframe: materialData.wireframe || false
    });
  }

  /**
   * Aplicar configuración de la escena
   */
  private applySceneSettings(settings: any, scene: THREE.Scene) {
    // Configurar skybox
    if (settings.skybox) {
      this.setSkybox(settings.skybox, scene);
    }

    // Configurar iluminación
    if (settings.lighting) {
      this.setLighting(settings.lighting, scene);
    }

    // Configurar punto de spawn
    if (settings.spawnPoint) {
      // Esto se usará para posicionar al avatar
      console.log('Punto de spawn configurado:', settings.spawnPoint);
    }
  }

  /**
   * Configurar skybox
   */
  private setSkybox(skyboxType: string, scene: THREE.Scene) {
    switch (skyboxType.toLowerCase()) {
      case 'gradient':
        const gradientTexture = this.createGradientTexture();
        scene.background = gradientTexture;
        break;
      case 'color':
        scene.background = new THREE.Color(0x87ceeb); // Azul cielo
        break;
      default:
        scene.background = new THREE.Color(0x16213e); // Color por defecto
    }
  }

  /**
   * Crear textura de gradiente
   */
  private createGradientTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;

    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#87ceeb'); // Azul cielo
    gradient.addColorStop(0.5, '#98d8e8'); // Azul claro
    gradient.addColorStop(1, '#b0e0e6'); // Azul muy claro

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Configurar iluminación
   */
  private setLighting(lighting: any, scene: THREE.Scene) {
    // Limpiar luces existentes
    const lightsToRemove: THREE.Light[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        lightsToRemove.push(child);
      }
    });
    lightsToRemove.forEach(light => scene.remove(light));

    // Añadir luz ambiental
    if (lighting.ambient) {
      const ambientLight = new THREE.AmbientLight(
        new THREE.Color(lighting.ambient.color),
        lighting.ambient.intensity
      );
      scene.add(ambientLight);
    }

    // Añadir luz direccional
    if (lighting.directional) {
      const dirLight = new THREE.DirectionalLight(
        new THREE.Color(lighting.directional.color),
        lighting.directional.intensity
      );
      if (lighting.directional.position) {
        dirLight.position.set(
          lighting.directional.position.x,
          lighting.directional.position.y,
          lighting.directional.position.z
        );
      }
      dirLight.castShadow = true;
      scene.add(dirLight);
    }
  }

  /**
   * Obtener escena actual
   */
  getCurrentScene(): LoadedScene | null {
    return this.currentScene;
  }

  /**
   * Obtener todas las escenas cargadas
   */
  getLoadedScenes(): LoadedScene[] {
    return Array.from(this.loadedScenes.values());
  }

  /**
   * Eliminar escena
   */
  removeScene(sceneId: string): boolean {
    const scene = this.loadedScenes.get(sceneId);
    if (scene) {
      // Remover objetos de la escena
      scene.objects.forEach(obj => {
        if (obj.parent) {
          obj.parent.remove(obj);
        }
        // Verificar si es un Mesh antes de acceder a geometry y material
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat: THREE.Material) => mat.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });

      this.loadedScenes.delete(sceneId);
      if (this.currentScene?.id === sceneId) {
        this.currentScene = null;
      }
      return true;
    }
    return false;
  }

  /**
   * Limpiar todas las escenas
   */
  clearAllScenes(): void {
    this.loadedScenes.forEach((scene, id) => {
      this.removeScene(id);
    });
    this.currentScene = null;
  }
}

export const sceneLoader = new SceneLoader(); 