import { useRef, useEffect, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UseThreeSceneReturn } from '../types';

// ============================================================================
// 🎣 HOOK USE THREE SCENE - Gestión de Escenas 3D
// ============================================================================

/**
 * Hook personalizado para gestión avanzada de escenas Three.js
 * Proporciona funcionalidades de control, optimización y monitoreo
 */
export const useThreeScene = (config?: {
  enableStats?: boolean;
  enableControls?: boolean;
  targetFPS?: number;
  enableOptimization?: boolean;
}): UseThreeSceneReturn => {
  const { scene, camera, gl, controls } = useThree();
  const [isInitialized, setIsInitialized] = useState(false);
  const [performance, setPerformance] = useState({
    fps: 0,
    memory: 0,
    drawCalls: 0,
    triangles: 0
  });

  // Referencias para objetos
  const sceneObjects = useRef<Set<THREE.Object3D>>(new Set());
  const animationCallbacks = useRef<Map<string, () => void>>(new Map());

  // Configuración por defecto
  const {
    enableStats = true,
    enableControls = true,
    targetFPS = 60,
    enableOptimization = true
  } = config || {};

  // Inicialización de la escena
  useEffect(() => {
    if (scene && camera && gl) {
      // Configurar renderer
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      gl.outputColorSpace = THREE.SRGBColorSpace;

      // Configurar cámara
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);

      // Configurar controles si están habilitados
      if (controls && enableControls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI;
      }

      setIsInitialized(true);
    }
  }, [scene, camera, gl, controls, enableControls]);

  // Monitoreo de rendimiento
  useFrame((state, delta) => {
    if (enableStats) {
      const fps = Math.round(1 / delta);
      const memory = gl.info.memory?.geometries || 0;
      const drawCalls = gl.info.render?.calls || 0;
      const triangles = gl.info.render?.triangles || 0;

      setPerformance({
        fps,
        memory,
        drawCalls,
        triangles
      });

      // Optimización automática si está habilitada
      if (enableOptimization && fps < targetFPS) {
        optimizeScene();
      }
    }

    // Ejecutar callbacks de animación
    animationCallbacks.current.forEach(callback => callback());
  });

  // Función para agregar objetos a la escena
  const addObject = useCallback((object: THREE.Object3D) => {
    if (scene && !sceneObjects.current.has(object)) {
      scene.add(object);
      sceneObjects.current.add(object);
    }
  }, [scene]);

  // Función para remover objetos de la escena
  const removeObject = useCallback((object: THREE.Object3D) => {
    if (scene && sceneObjects.current.has(object)) {
      scene.remove(object);
      sceneObjects.current.delete(object);
      
      // Limpiar recursos del objeto
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    }
  }, [scene]);

  // Función para limpiar toda la escena
  const clearScene = useCallback(() => {
    if (scene) {
      sceneObjects.current.forEach(object => {
        scene.remove(object);
      });
      sceneObjects.current.clear();
      animationCallbacks.current.clear();
    }
  }, [scene]);

  // Función para agregar animación
  const addAnimation = useCallback((id: string, callback: () => void) => {
    animationCallbacks.current.set(id, callback);
  }, []);

  // Función para remover animación
  const removeAnimation = useCallback((id: string) => {
    animationCallbacks.current.delete(id);
  }, []);

  // Función para optimizar la escena
  const optimizeScene = useCallback(() => {
    if (!enableOptimization) return;

    // Reducir calidad de sombras
    if (gl.shadowMap) {
      gl.shadowMap.mapSize.width = Math.max(512, gl.shadowMap.mapSize.width / 2);
      gl.shadowMap.mapSize.height = Math.max(512, gl.shadowMap.mapSize.height / 2);
    }

    // Reducir LOD de objetos
    sceneObjects.current.forEach(object => {
      if (object.userData.lod) {
        const lod = object.userData.lod;
        if (lod.currentLevel < lod.maxLevel) {
          lod.currentLevel++;
          // Aplicar LOD más bajo
        }
      }
    });
  }, [gl, enableOptimization]);

  // Función para restaurar calidad
  const restoreQuality = useCallback(() => {
    if (!enableOptimization) return;

    // Restaurar calidad de sombras
    if (gl.shadowMap) {
      gl.shadowMap.mapSize.width = 2048;
      gl.shadowMap.mapSize.height = 2048;
    }

    // Restaurar LOD de objetos
    sceneObjects.current.forEach(object => {
      if (object.userData.lod) {
        const lod = object.userData.lod;
        lod.currentLevel = 0;
        // Aplicar LOD más alto
      }
    });
  }, [gl, enableOptimization]);

  // Función para capturar screenshot
  const captureScreenshot = useCallback((filename?: string) => {
    if (gl) {
      gl.render(scene, camera);
      const dataURL = gl.domElement.toDataURL('image/png');
      
      if (filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.click();
      }
      
      return dataURL;
    }
  }, [gl, scene, camera]);

  // Función para cambiar configuración de renderizado
  const updateRenderSettings = useCallback((settings: {
    antialias?: boolean;
    shadowQuality?: 'low' | 'medium' | 'high';
    pixelRatio?: number;
  }) => {
    if (gl) {
      if (settings.antialias !== undefined) {
        // Nota: antialias no se puede cambiar dinámicamente
        console.warn('Antialiasing cannot be changed dynamically');
      }

      if (settings.shadowQuality) {
        const shadowSizes = {
          low: 512,
          medium: 1024,
          high: 2048
        };
        const size = shadowSizes[settings.shadowQuality];
        gl.shadowMap.mapSize.width = size;
        gl.shadowMap.mapSize.height = size;
      }

      if (settings.pixelRatio !== undefined) {
        gl.setPixelRatio(Math.min(settings.pixelRatio, window.devicePixelRatio));
      }
    }
  }, [gl]);

  // Función para obtener estadísticas de la escena
  const getSceneStats = useCallback(() => {
    let objectCount = 0;
    let meshCount = 0;
    let lightCount = 0;
    let materialCount = 0;

    sceneObjects.current.forEach(object => {
      objectCount++;
      if (object instanceof THREE.Mesh) meshCount++;
      if (object instanceof THREE.Light) lightCount++;
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          materialCount += object.material.length;
        } else {
          materialCount++;
        }
      }
    });

    return {
      objects: objectCount,
      meshes: meshCount,
      lights: lightCount,
      materials: materialCount,
      performance
    };
  }, [performance]);

  return {
    scene,
    camera,
    renderer: gl,
    controls,
    isInitialized,
    performance,
    addObject,
    removeObject,
    clearScene,
    addAnimation,
    removeAnimation,
    optimizeScene,
    restoreQuality,
    captureScreenshot,
    updateRenderSettings,
    getSceneStats,
    animate: () => {
      // La animación se maneja automáticamente en useFrame
    }
  };
};

// ============================================================================
// 🎣 HOOKS ESPECIALIZADOS
// ============================================================================

/**
 * Hook para gestión de cámara
 */
export const useCamera = () => {
  const { camera, controls } = useThree();

  const setCameraPosition = useCallback((position: [number, number, number]) => {
    if (camera) {
      camera.position.set(...position);
    }
  }, [camera]);

  const setCameraTarget = useCallback((target: [number, number, number]) => {
    if (controls) {
      controls.target.set(...target);
      controls.update();
    }
  }, [controls]);

  const resetCamera = useCallback(() => {
    if (camera && controls) {
      camera.position.set(0, 5, 10);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [camera, controls]);

  return {
    camera,
    controls,
    setCameraPosition,
    setCameraTarget,
    resetCamera
  };
};

/**
 * Hook para gestión de iluminación
 */
export const useLighting = () => {
  const { scene } = useThree();
  const [lights, setLights] = useState<THREE.Light[]>([]);

  useEffect(() => {
    if (scene) {
      const sceneLights: THREE.Light[] = [];
      scene.traverse((object) => {
        if (object instanceof THREE.Light) {
          sceneLights.push(object);
        }
      });
      setLights(sceneLights);
    }
  }, [scene]);

  const addLight = useCallback((light: THREE.Light) => {
    if (scene) {
      scene.add(light);
      setLights(prev => [...prev, light]);
    }
  }, [scene]);

  const removeLight = useCallback((light: THREE.Light) => {
    if (scene) {
      scene.remove(light);
      setLights(prev => prev.filter(l => l !== light));
    }
  }, [scene]);

  const updateLightIntensity = useCallback((light: THREE.Light, intensity: number) => {
    light.intensity = intensity;
  }, []);

  return {
    lights,
    addLight,
    removeLight,
    updateLightIntensity
  };
};

/**
 * Hook para gestión de materiales
 */
export const useMaterials = () => {
  const [materials, setMaterials] = useState<THREE.Material[]>([]);

  const createMaterial = useCallback((type: 'standard' | 'basic' | 'phong' | 'lambert', options: any) => {
    let material: THREE.Material;

    switch (type) {
      case 'standard':
        material = new THREE.MeshStandardMaterial(options);
        break;
      case 'basic':
        material = new THREE.MeshBasicMaterial(options);
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial(options);
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial(options);
        break;
      default:
        material = new THREE.MeshStandardMaterial(options);
    }

    setMaterials(prev => [...prev, material]);
    return material;
  }, []);

  const disposeMaterial = useCallback((material: THREE.Material) => {
    material.dispose();
    setMaterials(prev => prev.filter(m => m !== material));
  }, []);

  const disposeAllMaterials = useCallback(() => {
    materials.forEach(material => material.dispose());
    setMaterials([]);
  }, [materials]);

  return {
    materials,
    createMaterial,
    disposeMaterial,
    disposeAllMaterials
  };
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default useThreeScene;
export { useCamera, useLighting, useMaterials }; 