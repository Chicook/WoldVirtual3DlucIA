/**
 * @fileoverview Helper de rendimiento para monitorear y optimizar el metaverso
 * @module @metaverso/helpers/development/PerformanceHelper
 */

import * as THREE from 'three';
import { IDevelopmentHelper, PerformanceMetrics } from '../types';

/**
 * Helper de rendimiento para monitorear y optimizar el metaverso
 */
export class PerformanceHelper implements IDevelopmentHelper {
  public readonly type = 'PerformanceHelper';
  public enabled: boolean = true;
  public metrics: Record<string, number> = {};
  public history: Array<Record<string, number>> = [];
  
  private _renderer?: THREE.WebGLRenderer;
  private _scene?: THREE.Scene;
  private _camera?: THREE.Camera;
  
  // Métricas de tiempo
  private _frameStartTime: number = 0;
  private _frameEndTime: number = 0;
  private _renderStartTime: number = 0;
  private _renderEndTime: number = 0;
  private _updateStartTime: number = 0;
  private _updateEndTime: number = 0;
  
  // Historial de FPS
  private _fpsHistory: number[] = [];
  private _frameCount: number = 0;
  private _lastFpsUpdate: number = 0;
  
  // Métricas de memoria
  private _memoryInfo?: {
    geometries: number;
    textures: number;
    materials: number;
    triangles: number;
    drawCalls: number;
  };
  
  // Configuración
  private _config = {
    maxHistorySize: 1000,
    fpsUpdateInterval: 1000, // ms
    enableMemoryTracking: true,
    enableDetailedMetrics: true,
    enableWarnings: true,
    warningThresholds: {
      fps: 30,
      frameTime: 33, // ms
      memoryUsage: 0.8, // 80%
      drawCalls: 1000
    }
  };

  /**
   * Constructor del helper
   * @param renderer - Renderer de Three.js
   * @param scene - Escena de Three.js
   * @param camera - Cámara de Three.js
   */
  constructor(
    renderer?: THREE.WebGLRenderer,
    scene?: THREE.Scene,
    camera?: THREE.Camera
  ) {
    this._renderer = renderer;
    this._scene = scene;
    this._camera = camera;
    
    this.init();
  }

  /**
   * Inicializar el helper
   */
  public init(): void {
    this._frameStartTime = performance.now();
    this._lastFpsUpdate = performance.now();
    
    // Inicializar métricas
    this.metrics = {
      fps: 0,
      averageFps: 0,
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
      renderedObjects: 0,
      triangles: 0,
      drawCalls: 0,
      memoryUsage: 0,
      gpuMemory: 0
    };
    
    // Configurar monitoreo de memoria si está disponible
    if (this._config.enableMemoryTracking && 'memory' in performance) {
      this._startMemoryTracking();
    }
  }

  /**
   * Actualizar el helper
   */
  public update(): void {
    if (!this.enabled) return;

    this._updateFrameMetrics();
    this._updateFPS();
    this._updateMemoryMetrics();
    this._updateDetailedMetrics();
    this._checkWarnings();
    this._updateHistory();
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    this.history = [];
    this._fpsHistory = [];
    this.metrics = {};
  }

  /**
   * Mostrar el helper
   */
  public show(): void {
    this.enabled = true;
  }

  /**
   * Ocultar el helper
   */
  public hide(): void {
    this.enabled = false;
  }

  /**
   * Obtener métricas actuales
   */
  public getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  /**
   * Limpiar historial
   */
  public clearHistory(): void {
    this.history = [];
    this._fpsHistory = [];
  }

  /**
   * Iniciar frame
   */
  public startFrame(): void {
    this._frameStartTime = performance.now();
    this._frameCount++;
  }

  /**
   * Finalizar frame
   */
  public endFrame(): void {
    this._frameEndTime = performance.now();
    this.metrics.frameTime = this._frameEndTime - this._frameStartTime;
  }

  /**
   * Iniciar renderizado
   */
  public startRender(): void {
    this._renderStartTime = performance.now();
  }

  /**
   * Finalizar renderizado
   */
  public endRender(): void {
    this._renderEndTime = performance.now();
    this.metrics.renderTime = this._renderEndTime - this._renderStartTime;
  }

  /**
   * Iniciar actualización
   */
  public startUpdate(): void {
    this._updateStartTime = performance.now();
  }

  /**
   * Finalizar actualización
   */
  public endUpdate(): void {
    this._updateEndTime = performance.now();
    this.metrics.updateTime = this._updateEndTime - this._updateStartTime;
  }

  /**
   * Obtener FPS actual
   */
  public getFPS(): number {
    return this.metrics.fps;
  }

  /**
   * Obtener FPS promedio
   */
  public getAverageFPS(): number {
    return this.metrics.averageFps;
  }

  /**
   * Obtener tiempo de frame
   */
  public getFrameTime(): number {
    return this.metrics.frameTime;
  }

  /**
   * Obtener tiempo de renderizado
   */
  public getRenderTime(): number {
    return this.metrics.renderTime;
  }

  /**
   * Obtener tiempo de actualización
   */
  public getUpdateTime(): number {
    return this.metrics.updateTime;
  }

  /**
   * Obtener información de memoria
   */
  public getMemoryInfo(): Record<string, number> {
    return {
      geometries: this.metrics.geometries || 0,
      textures: this.metrics.textures || 0,
      materials: this.metrics.materials || 0,
      triangles: this.metrics.triangles || 0,
      drawCalls: this.metrics.drawCalls || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      gpuMemory: this.metrics.gpuMemory || 0
    };
  }

  /**
   * Obtener reporte de rendimiento
   */
  public getPerformanceReport(): {
    summary: Record<string, number>;
    history: Array<Record<string, number>>;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Analizar métricas y generar recomendaciones
    if (this.metrics.fps < this._config.warningThresholds.fps) {
      warnings.push(`FPS bajo: ${this.metrics.fps.toFixed(1)}`);
      recommendations.push('Considera reducir la complejidad de la escena o optimizar el renderizado');
    }

    if (this.metrics.frameTime > this._config.warningThresholds.frameTime) {
      warnings.push(`Tiempo de frame alto: ${this.metrics.frameTime.toFixed(1)}ms`);
      recommendations.push('Optimiza las actualizaciones de la lógica del juego');
    }

    if (this.metrics.drawCalls > this._config.warningThresholds.drawCalls) {
      warnings.push(`Muchos draw calls: ${this.metrics.drawCalls}`);
      recommendations.push('Considera usar instancing o combinar geometrías');
    }

    if (this.metrics.memoryUsage > this._config.warningThresholds.memoryUsage) {
      warnings.push(`Alto uso de memoria: ${(this.metrics.memoryUsage * 100).toFixed(1)}%`);
      recommendations.push('Revisa la gestión de memoria y considera liberar recursos no utilizados');
    }

    return {
      summary: this.getMetrics(),
      history: [...this.history],
      warnings,
      recommendations
    };
  }

  /**
   * Configurar el helper
   */
  public setConfig(config: Partial<typeof this._config>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Establecer renderer
   */
  public setRenderer(renderer: THREE.WebGLRenderer): void {
    this._renderer = renderer;
  }

  /**
   * Establecer escena
   */
  public setScene(scene: THREE.Scene): void {
    this._scene = scene;
  }

  /**
   * Establecer cámara
   */
  public setCamera(camera: THREE.Camera): void {
    this._camera = camera;
  }

  /**
   * Actualizar métricas de frame
   */
  private _updateFrameMetrics(): void {
    if (this._frameStartTime && this._frameEndTime) {
      this.metrics.frameTime = this._frameEndTime - this._frameStartTime;
    }
  }

  /**
   * Actualizar FPS
   */
  private _updateFPS(): void {
    const now = performance.now();
    const deltaTime = now - this._lastFpsUpdate;

    if (deltaTime >= this._config.fpsUpdateInterval) {
      const fps = (this._frameCount * 1000) / deltaTime;
      this.metrics.fps = fps;
      
      this._fpsHistory.push(fps);
      if (this._fpsHistory.length > 60) {
        this._fpsHistory.shift();
      }
      
      // Calcular FPS promedio
      const sum = this._fpsHistory.reduce((a, b) => a + b, 0);
      this.metrics.averageFps = sum / this._fpsHistory.length;
      
      this._frameCount = 0;
      this._lastFpsUpdate = now;
    }
  }

  /**
   * Actualizar métricas de memoria
   */
  private _updateMemoryMetrics(): void {
    if (!this._config.enableMemoryTracking) return;

    // Obtener información de memoria del renderer
    if (this._renderer) {
      const info = this._renderer.info;
      this.metrics.geometries = info.memory.geometries;
      this.metrics.textures = info.memory.textures;
      this.metrics.triangles = info.render.triangles;
      this.metrics.drawCalls = info.render.calls;
    }

    // Obtener información de memoria del sistema
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }

    // Obtener información de memoria GPU (si está disponible)
    if (this._renderer && 'getContext' in this._renderer) {
      const gl = this._renderer.getContext();
      if (gl && 'getExtension' in gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          // Intentar obtener información de memoria GPU
          try {
            const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
            if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Intel')) {
              // Estimación básica de memoria GPU
              this.metrics.gpuMemory = this.metrics.triangles * 0.001; // Estimación aproximada
            }
          } catch (e) {
            // Ignorar errores de acceso a información GPU
          }
        }
      }
    }
  }

  /**
   * Actualizar métricas detalladas
   */
  private _updateDetailedMetrics(): void {
    if (!this._config.enableDetailedMetrics) return;

    // Contar objetos renderizados
    if (this._scene) {
      let renderedObjects = 0;
      this._scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.visible) {
          renderedObjects++;
        }
      });
      this.metrics.renderedObjects = renderedObjects;
    }
  }

  /**
   * Verificar advertencias
   */
  private _checkWarnings(): void {
    if (!this._config.enableWarnings) return;

    const thresholds = this._config.warningThresholds;

    if (this.metrics.fps < thresholds.fps) {
      console.warn(`[PerformanceHelper] FPS bajo: ${this.metrics.fps.toFixed(1)}`);
    }

    if (this.metrics.frameTime > thresholds.frameTime) {
      console.warn(`[PerformanceHelper] Tiempo de frame alto: ${this.metrics.frameTime.toFixed(1)}ms`);
    }

    if (this.metrics.drawCalls > thresholds.drawCalls) {
      console.warn(`[PerformanceHelper] Muchos draw calls: ${this.metrics.drawCalls}`);
    }

    if (this.metrics.memoryUsage > thresholds.memoryUsage) {
      console.warn(`[PerformanceHelper] Alto uso de memoria: ${(this.metrics.memoryUsage * 100).toFixed(1)}%`);
    }
  }

  /**
   * Actualizar historial
   */
  private _updateHistory(): void {
    this.history.push({ ...this.metrics });
    
    if (this.history.length > this._config.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Iniciar seguimiento de memoria
   */
  private _startMemoryTracking(): void {
    // Configurar monitoreo periódico de memoria
    setInterval(() => {
      if (this.enabled && 'memory' in performance) {
        this._updateMemoryMetrics();
      }
    }, 5000); // Actualizar cada 5 segundos
  }
} 