// ============================================================================
// ⚡ UTILIDADES DE RENDIMIENTO - Optimización y Monitoreo
// ============================================================================

import * as THREE from 'three';

/**
 * Métricas de rendimiento
 */
export interface PerformanceMetrics {
  fps: number;
  memory: {
    geometries: number;
    textures: number;
    triangles: number;
  };
  render: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  };
  time: {
    frame: number;
    render: number;
    update: number;
  };
}

/**
 * Configuración de optimización
 */
export interface OptimizationConfig {
  targetFPS: number;
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  maxDrawCalls: number;
  maxTriangles: number;
  textureQuality: 'low' | 'medium' | 'high';
  shadowQuality: 'low' | 'medium' | 'high';
}

/**
 * Monitor de rendimiento
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private renderer: THREE.WebGLRenderer;
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      memory: {
        geometries: 0,
        textures: 0,
        triangles: 0
      },
      render: {
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0
      },
      time: {
        frame: 0,
        render: 0,
        update: 0
      }
    };
  }

  /**
   * Actualizar métricas
   */
  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      // Calcular FPS
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);

      // Obtener información de memoria
      if (this.renderer.info.memory) {
        this.metrics.memory.geometries = this.renderer.info.memory.geometries || 0;
        this.metrics.memory.textures = this.renderer.info.memory.textures || 0;
        this.metrics.memory.triangles = this.renderer.info.render?.triangles || 0;
      }

      // Obtener información de renderizado
      if (this.renderer.info.render) {
        this.metrics.render.calls = this.renderer.info.render.calls || 0;
        this.metrics.render.triangles = this.renderer.info.render.triangles || 0;
        this.metrics.render.points = this.renderer.info.render.points || 0;
        this.metrics.render.lines = this.renderer.info.render.lines || 0;
      }

      // Notificar callbacks
      this.callbacks.forEach(callback => callback(this.metrics));

      // Resetear contadores
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Agregar callback de métricas
   */
  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remover callback de métricas
   */
  removeCallback(callback: (metrics: PerformanceMetrics) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

/**
 * Optimizador de escena
 */
export class SceneOptimizer {
  private config: OptimizationConfig;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private monitor: PerformanceMonitor;

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    config: Partial<OptimizationConfig> = {}
  ) {
    this.scene = scene;
    this.renderer = renderer;
    this.config = this.getDefaultConfig();
    Object.assign(this.config, config);
    
    this.monitor = new PerformanceMonitor(renderer);
    this.setupOptimizations();
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      targetFPS: 60,
      enableLOD: true,
      enableFrustumCulling: true,
      enableOcclusionCulling: false,
      maxDrawCalls: 1000,
      maxTriangles: 100000,
      textureQuality: 'medium',
      shadowQuality: 'medium'
    };
  }

  private setupOptimizations(): void {
    // Configurar frustum culling
    if (this.config.enableFrustumCulling) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.frustumCulled = true;
        }
      });
    }

    // Configurar calidad de sombras
    this.setShadowQuality(this.config.shadowQuality);

    // Configurar calidad de texturas
    this.setTextureQuality(this.config.textureQuality);
  }

  /**
   * Optimizar escena basado en rendimiento
   */
  optimize(): void {
    const metrics = this.monitor.getMetrics();

    // Optimizar si FPS es bajo
    if (metrics.fps < this.config.targetFPS) {
      this.reduceQuality();
    }

    // Optimizar si hay demasiados draw calls
    if (metrics.render.calls > this.config.maxDrawCalls) {
      this.reduceDrawCalls();
    }

    // Optimizar si hay demasiados triángulos
    if (metrics.render.triangles > this.config.maxTriangles) {
      this.reduceTriangles();
    }
  }

  /**
   * Reducir calidad general
   */
  private reduceQuality(): void {
    // Reducir resolución de sombras
    this.setShadowQuality('low');

    // Reducir calidad de texturas
    this.setTextureQuality('low');

    // Deshabilitar efectos costosos
    this.renderer.shadowMap.enabled = false;
    this.renderer.antialias = false;
  }

  /**
   * Reducir draw calls
   */
  private reduceDrawCalls(): void {
    // Implementar instancing para objetos similares
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Agrupar materiales similares
        this.mergeSimilarMaterials(object);
      }
    });
  }

  /**
   * Reducir triángulos
   */
  private reduceTriangles(): void {
    // Aplicar LOD más agresivo
    this.scene.traverse((object) => {
      if (object.userData.lod) {
        const lod = object.userData.lod;
        if (lod.currentLevel < lod.maxLevel) {
          lod.currentLevel++;
          this.applyLOD(object, lod.currentLevel);
        }
      }
    });
  }

  /**
   * Configurar calidad de sombras
   */
  private setShadowQuality(quality: 'low' | 'medium' | 'high'): void {
    const shadowSizes = {
      low: 512,
      medium: 1024,
      high: 2048
    };

    const size = shadowSizes[quality];
    this.renderer.shadowMap.mapSize.width = size;
    this.renderer.shadowMap.mapSize.height = size;

    // Ajustar configuración de sombras en luces
    this.scene.traverse((object) => {
      if (object instanceof THREE.Light && object.castShadow) {
        if (object.shadow) {
          object.shadow.mapSize.width = size;
          object.shadow.mapSize.height = size;
          object.shadow.camera.near = 0.5;
          object.shadow.camera.far = 500;
        }
      }
    });
  }

  /**
   * Configurar calidad de texturas
   */
  private setTextureQuality(quality: 'low' | 'medium' | 'high'): void {
    const filterSettings = {
      low: THREE.NearestFilter,
      medium: THREE.LinearFilter,
      high: THREE.LinearMipmapLinearFilter
    };

    const filter = filterSettings[quality];

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat.map) {
              mat.map.minFilter = filter;
              mat.map.magFilter = filter;
              mat.map.needsUpdate = true;
            }
          });
        } else {
          if (object.material.map) {
            object.material.map.minFilter = filter;
            object.material.map.magFilter = filter;
            object.material.map.needsUpdate = true;
          }
        }
      }
    });
  }

  /**
   * Fusionar materiales similares
   */
  private mergeSimilarMaterials(mesh: THREE.Mesh): void {
    // Implementar lógica para fusionar materiales similares
    // Esto requeriría análisis de propiedades de materiales
  }

  /**
   * Aplicar LOD a objeto
   */
  private applyLOD(object: THREE.Object3D, level: number): void {
    if (object instanceof THREE.Mesh && object.geometry) {
      // Simplificar geometría según el nivel
      // Esto requeriría una biblioteca de simplificación
    }
  }

  /**
   * Obtener monitor de rendimiento
   */
  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    Object.assign(this.config, newConfig);
    this.setupOptimizations();
  }
}

/**
 * Gestor de LOD (Level of Detail)
 */
export class LODManager {
  private objects: Map<THREE.Object3D, {
    levels: THREE.Object3D[];
    distances: number[];
    currentLevel: number;
  }> = new Map();

  /**
   * Agregar objeto con LOD
   */
  addLODObject(
    object: THREE.Object3D,
    levels: THREE.Object3D[],
    distances: number[]
  ): void {
    this.objects.set(object, {
      levels,
      distances,
      currentLevel: 0
    });
  }

  /**
   * Actualizar LOD basado en distancia de cámara
   */
  updateLOD(camera: THREE.Camera): void {
    this.objects.forEach((lodData, object) => {
      const distance = camera.position.distanceTo(object.position);
      const newLevel = this.getLODLevel(distance, lodData.distances);
      
      if (newLevel !== lodData.currentLevel) {
        this.switchLODLevel(object, lodData, newLevel);
      }
    });
  }

  /**
   * Obtener nivel de LOD basado en distancia
   */
  private getLODLevel(distance: number, distances: number[]): number {
    for (let i = 0; i < distances.length; i++) {
      if (distance <= distances[i]) {
        return i;
      }
    }
    return distances.length - 1;
  }

  /**
   * Cambiar nivel de LOD
   */
  private switchLODLevel(
    object: THREE.Object3D,
    lodData: { levels: THREE.Object3D[]; distances: number[]; currentLevel: number },
    newLevel: number
  ): void {
    // Ocultar nivel actual
    if (lodData.levels[lodData.currentLevel]) {
      lodData.levels[lodData.currentLevel].visible = false;
    }

    // Mostrar nuevo nivel
    if (lodData.levels[newLevel]) {
      lodData.levels[newLevel].visible = true;
    }

    lodData.currentLevel = newLevel;
  }

  /**
   * Remover objeto del LOD
   */
  removeLODObject(object: THREE.Object3D): void {
    this.objects.delete(object);
  }
}

/**
 * Gestor de culling
 */
export class CullingManager {
  private frustum: THREE.Frustum;
  private camera: THREE.Camera;
  private objects: Set<THREE.Object3D> = new Set();

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.frustum = new THREE.Frustum();
  }

  /**
   * Agregar objeto para culling
   */
  addObject(object: THREE.Object3D): void {
    this.objects.add(object);
  }

  /**
   * Remover objeto del culling
   */
  removeObject(object: THREE.Object3D): void {
    this.objects.delete(object);
  }

  /**
   * Actualizar frustum culling
   */
  updateCulling(): void {
    this.frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        this.camera.projectionMatrix,
        this.camera.matrixWorldInverse
      )
    );

    this.objects.forEach(object => {
      if (object instanceof THREE.Mesh) {
        const boundingBox = new THREE.Box3().setFromObject(object);
        object.visible = this.frustum.intersectsBox(boundingBox);
      }
    });
  }
}

/**
 * Utilidades de memoria
 */
export const memory = {
  /**
   * Limpiar memoria de geometrías
   */
  disposeGeometries(scene: THREE.Scene): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry) {
        object.geometry.dispose();
      }
    });
  },

  /**
   * Limpiar memoria de materiales
   */
  disposeMaterials(scene: THREE.Scene): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  },

  /**
   * Limpiar memoria de texturas
   */
  disposeTextures(scene: THREE.Scene): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat.map) mat.map.dispose();
          });
        } else {
          if (object.material.map) {
            object.material.map.dispose();
          }
        }
      }
    });
  },

  /**
   * Limpiar toda la memoria de la escena
   */
  disposeScene(scene: THREE.Scene): void {
    memory.disposeGeometries(scene);
    memory.disposeMaterials(scene);
    memory.disposeTextures(scene);
  }
};

/**
 * Utilidades de profiling
 */
export const profiling = {
  /**
   * Medir tiempo de ejecución
   */
  measureTime<T>(fn: () => T): { result: T; time: number } {
    const start = performance.now();
    const result = fn();
    const time = performance.now() - start;
    return { result, time };
  },

  /**
   * Crear profiler de funciones
   */
  createProfiler() {
    const times: Map<string, number[]> = new Map();

    return {
      start(label: string): void {
        if (!times.has(label)) {
          times.set(label, []);
        }
        times.get(label)!.push(performance.now());
      },

      end(label: string): number {
        const labelTimes = times.get(label);
        if (!labelTimes || labelTimes.length === 0) {
          throw new Error(`No se inició el profiling para: ${label}`);
        }

        const startTime = labelTimes.pop()!;
        const duration = performance.now() - startTime;
        
        if (!times.has(`${label}_durations`)) {
          times.set(`${label}_durations`, []);
        }
        times.get(`${label}_durations`)!.push(duration);

        return duration;
      },

      getStats(label: string): { avg: number; min: number; max: number; count: number } {
        const durations = times.get(`${label}_durations`) || [];
        if (durations.length === 0) {
          return { avg: 0, min: 0, max: 0, count: 0 };
        }

        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        return { avg, min, max, count: durations.length };
      },

      clear(): void {
        times.clear();
      }
    };
  }
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default {
  PerformanceMonitor,
  SceneOptimizer,
  LODManager,
  CullingManager,
  memory,
  profiling
}; 