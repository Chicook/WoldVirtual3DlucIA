/**
 * Renderer - WebGL2 Enterprise Rendering Engine
 * 
 * High-performance WebGL2 renderer with modern pipeline, PBR materials,
 * and advanced optimizations for 3D scene rendering.
 */

import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { SceneNode } from '../scene/SceneNode';
import { Vector3, Matrix4 } from '../scene/math';
import { BoundingBox, BoundingSphere } from '../scene/geometry';
import { Camera } from './Camera';
import { Material } from './Material';
import { Geometry } from './Geometry';
import { Shader } from './Shader';
import { Texture } from './Texture';
import { Light } from './Light';

// Renderer events
export interface RendererEvents {
  'render:started': { frame: number; timestamp: number };
  'render:completed': { frame: number; timestamp: number; drawCalls: number; triangles: number };
  'error': { error: Error; context: string };
  'shader:compiled': { shader: Shader; type: string };
  'texture:loaded': { texture: Texture; url: string };
  'performance:warning': { message: string; metrics: RenderMetrics };
}

// Render metrics
export interface RenderMetrics {
  frameTime: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  textures: number;
  shaders: number;
  fps: number;
  memoryUsage: number;
}

// Render settings
export interface RenderSettings {
  antialiasing: boolean;
  shadows: boolean;
  postProcessing: boolean;
  maxLights: number;
  maxTextures: number;
  maxDrawCalls: number;
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  enableLOD: boolean;
  enableInstancing: boolean;
}

/**
 * WebGL2 Enterprise Renderer
 */
export class Renderer {
  // WebGL context
  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // Core systems
  public readonly eventEmitter: EventEmitter<RendererEvents>;
  public readonly logger: Logger;

  // Rendering state
  private currentCamera: Camera | null = null;
  private currentMaterial: Material | null = null;
  private currentGeometry: Geometry | null = null;
  private currentShader: Shader | null = null;

  // Scene data
  private sceneNodes: SceneNode[] = [];
  private lights: Light[] = [];
  private cameras: Camera[] = [];
  private materials: Map<string, Material> = new Map();
  private geometries: Map<string, Geometry> = new Map();
  private textures: Map<string, Texture> = new Map();
  private shaders: Map<string, Shader> = new Map();

  // Rendering pipeline
  private renderQueue: RenderItem[] = [];
  private transparentQueue: RenderItem[] = [];
  private shadowQueue: RenderItem[] = [];
  private postProcessQueue: RenderItem[] = [];

  // Performance tracking
  private metrics: RenderMetrics = {
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    vertices: 0,
    textures: 0,
    shaders: 0,
    fps: 0,
    memoryUsage: 0
  };

  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsCounter = 0;
  private fpsTimer = 0;

  // Settings
  private settings: RenderSettings = {
    antialiasing: true,
    shadows: true,
    postProcessing: true,
    maxLights: 8,
    maxTextures: 16,
    maxDrawCalls: 1000,
    enableFrustumCulling: true,
    enableOcclusionCulling: true,
    enableLOD: true,
    enableInstancing: true
  };

  // Culling and optimization
  private frustumCuller: FrustumCuller;
  private occlusionCuller: OcclusionCuller;
  private lodManager: LODManager;
  private instancingManager: InstancingManager;

  // Post-processing
  private postProcessor: PostProcessor | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    eventEmitter?: EventEmitter<RendererEvents>,
    logger?: Logger
  ) {
    this.canvas = canvas;
    this.eventEmitter = eventEmitter || new EventEmitter<RendererEvents>();
    this.logger = logger || new Logger('Renderer');

    // Initialize systems
    this.frustumCuller = new FrustumCuller();
    this.occlusionCuller = new OcclusionCuller();
    this.lodManager = new LODManager();
    this.instancingManager = new InstancingManager();

    this.initializeWebGL();
    this.initializeSystems();
  }

  // ===== INITIALIZATION =====

  /**
   * Initializes WebGL2 context
   */
  private initializeWebGL(): void {
    if (!this.canvas) {
      throw new Error('Canvas element is required');
    }

    this.gl = this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: this.settings.antialiasing,
      depth: true,
      stencil: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });

    if (!this.gl) {
      throw new Error('WebGL2 not supported');
    }

    this.logger.info('WebGL2 context initialized successfully');

    // Set initial state
    this.gl.enable(WebGL2RenderingContext.DEPTH_TEST);
    this.gl.enable(WebGL2RenderingContext.CULL_FACE);
    this.gl.cullFace(WebGL2RenderingContext.BACK);
    this.gl.frontFace(WebGL2RenderingContext.CCW);
    this.gl.enable(WebGL2RenderingContext.BLEND);
    this.gl.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
  }

  /**
   * Initializes rendering systems
   */
  private initializeSystems(): void {
    this.postProcessor = new PostProcessor(this.gl!, this.eventEmitter, this.logger);
    this.logger.info('Rendering systems initialized');
  }

  // ===== SCENE MANAGEMENT =====

  /**
   * Sets the scene nodes to render
   */
  setScene(nodes: SceneNode[]): void {
    this.sceneNodes = nodes;
    this.logger.debug(`Scene set with ${nodes.length} nodes`);
  }

  /**
   * Adds a camera to the renderer
   */
  addCamera(camera: Camera): void {
    this.cameras.push(camera);
    if (!this.currentCamera) {
      this.currentCamera = camera;
    }
    this.logger.debug(`Camera added: ${camera.name}`);
  }

  /**
   * Sets the active camera
   */
  setCamera(camera: Camera): void {
    this.currentCamera = camera;
    this.logger.debug(`Active camera set: ${camera.name}`);
  }

  /**
   * Adds a light to the scene
   */
  addLight(light: Light): void {
    this.lights.push(light);
    this.logger.debug(`Light added: ${light.name}`);
  }

  /**
   * Adds a material to the renderer
   */
  addMaterial(material: Material): void {
    this.materials.set(material.id, material);
    this.logger.debug(`Material added: ${material.name}`);
  }

  /**
   * Adds a geometry to the renderer
   */
  addGeometry(geometry: Geometry): void {
    this.geometries.set(geometry.id, geometry);
    this.logger.debug(`Geometry added: ${geometry.name}`);
  }

  /**
   * Adds a texture to the renderer
   */
  addTexture(texture: Texture): void {
    this.textures.set(texture.id, texture);
    this.logger.debug(`Texture added: ${texture.name}`);
  }

  /**
   * Adds a shader to the renderer
   */
  addShader(shader: Shader): void {
    this.shaders.set(shader.id, shader);
    this.logger.debug(`Shader added: ${shader.name}`);
  }

  // ===== RENDERING PIPELINE =====

  /**
   * Renders the current scene
   */
  render(): void {
    if (!this.gl || !this.currentCamera) {
      return;
    }

    const startTime = performance.now();
    this.frameCount++;

    this.eventEmitter.emit('render:started', {
      frame: this.frameCount,
      timestamp: startTime
    });

    // Reset metrics
    this.metrics.drawCalls = 0;
    this.metrics.triangles = 0;
    this.metrics.vertices = 0;

    // Clear buffers
    this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);

    // Build render queues
    this.buildRenderQueues();

    // Render shadow maps
    if (this.settings.shadows) {
      this.renderShadowMaps();
    }

    // Render main scene
    this.renderMainPass();

    // Render transparent objects
    this.renderTransparentPass();

    // Post-processing
    if (this.settings.postProcessing) {
      this.renderPostProcessing();
    }

    // Update metrics
    const endTime = performance.now();
    this.metrics.frameTime = endTime - startTime;
    this.updateFPS();

    this.eventEmitter.emit('render:completed', {
      frame: this.frameCount,
      timestamp: endTime,
      drawCalls: this.metrics.drawCalls,
      triangles: this.metrics.triangles
    });

    // Performance warnings
    this.checkPerformanceWarnings();
  }

  /**
   * Builds render queues from scene nodes
   */
  private buildRenderQueues(): void {
    this.renderQueue.length = 0;
    this.transparentQueue.length = 0;
    this.shadowQueue.length = 0;

    for (const node of this.sceneNodes) {
      if (!node.visible || node.culled) {
        continue;
      }

      // Frustum culling
      if (this.settings.enableFrustumCulling && this.currentCamera) {
        if (!this.frustumCuller.isVisible(node, this.currentCamera)) {
          continue;
        }
      }

      // Process node components
      for (const component of node.getComponents()) {
        if (component.type === 'Geometry') {
          this.processGeometryNode(node, component as any);
        }
      }
    }

    // Sort queues
    this.sortRenderQueues();
  }

  /**
   * Processes a geometry node for rendering
   */
  private processGeometryNode(node: SceneNode, geometryComponent: any): void {
    const geometry = this.geometries.get(geometryComponent.geometryId);
    const material = this.materials.get(geometryComponent.materialId);

    if (!geometry || !material) {
      return;
    }

    const renderItem: RenderItem = {
      node,
      geometry,
      material,
      worldMatrix: node.worldMatrix,
      distance: this.currentCamera ? 
        node.worldPosition.distanceTo(this.currentCamera.position) : 0
    };

    // Add to appropriate queue
    if (material.transparent) {
      this.transparentQueue.push(renderItem);
    } else {
      this.renderQueue.push(renderItem);
    }

    if (this.settings.shadows && material.castShadows) {
      this.shadowQueue.push(renderItem);
    }
  }

  /**
   * Sorts render queues for optimal rendering
   */
  private sortRenderQueues(): void {
    // Sort opaque queue by material and distance
    this.renderQueue.sort((a, b) => {
      if (a.material.id !== b.material.id) {
        return a.material.id.localeCompare(b.material.id);
      }
      return a.distance - b.distance;
    });

    // Sort transparent queue by distance (back to front)
    this.transparentQueue.sort((a, b) => b.distance - a.distance);

    // Sort shadow queue by distance
    this.shadowQueue.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Renders shadow maps
   */
  private renderShadowMaps(): void {
    if (!this.gl) return;

    for (const light of this.lights) {
      if (light.castShadows && light.shadowMap) {
        light.shadowMap.beginRender();
        
        for (const item of this.shadowQueue) {
          this.renderShadowItem(item, light);
        }

        light.shadowMap.endRender();
      }
    }
  }

  /**
   * Renders a single item for shadow mapping
   */
  private renderShadowItem(item: RenderItem, light: Light): void {
    if (!this.gl) return;

    const shadowShader = this.shaders.get('shadow');
    if (!shadowShader) return;

    this.useShader(shadowShader);
    shadowShader.setMatrix4('modelMatrix', item.worldMatrix);
    shadowShader.setMatrix4('lightViewProjection', light.getShadowMatrix());

    this.renderGeometry(item.geometry);
    this.metrics.drawCalls++;
  }

  /**
   * Renders the main pass
   */
  private renderMainPass(): void {
    if (!this.gl || !this.currentCamera) return;

    for (const item of this.renderQueue) {
      this.renderItem(item);
    }
  }

  /**
   * Renders transparent objects
   */
  private renderTransparentPass(): void {
    if (!this.gl || !this.currentCamera) return;

    // Enable blending for transparent pass
    this.gl.enable(WebGL2RenderingContext.BLEND);
    this.gl.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);

    for (const item of this.transparentQueue) {
      this.renderItem(item);
    }

    // Disable blending
    this.gl.disable(WebGL2RenderingContext.BLEND);
  }

  /**
   * Renders a single render item
   */
  private renderItem(item: RenderItem): void {
    if (!this.gl || !this.currentCamera) return;

    const shader = this.shaders.get(item.material.shaderId);
    if (!shader) return;

    this.useShader(shader);

    // Set camera uniforms
    shader.setMatrix4('viewMatrix', this.currentCamera.viewMatrix);
    shader.setMatrix4('projectionMatrix', this.currentCamera.projectionMatrix);
    shader.setVector3('cameraPosition', this.currentCamera.position);

    // Set model matrix
    shader.setMatrix4('modelMatrix', item.worldMatrix);
    shader.setMatrix3('normalMatrix', item.worldMatrix.getNormalMatrix());

    // Set material uniforms
    this.setMaterialUniforms(shader, item.material);

    // Set light uniforms
    this.setLightUniforms(shader);

    // Render geometry
    this.renderGeometry(item.geometry);
    this.metrics.drawCalls++;
    this.metrics.triangles += item.geometry.triangleCount;
    this.metrics.vertices += item.geometry.vertexCount;
  }

  /**
   * Sets material uniforms on shader
   */
  private setMaterialUniforms(shader: Shader, material: Material): void {
    shader.setVector3('material.albedo', material.albedo);
    shader.setFloat('material.metallic', material.metallic);
    shader.setFloat('material.roughness', material.roughness);
    shader.setVector3('material.emissive', material.emissive);
    shader.setFloat('material.alpha', material.alpha);

    // Set textures
    if (material.albedoMap) {
      shader.setTexture('albedoMap', material.albedoMap, 0);
    }
    if (material.normalMap) {
      shader.setTexture('normalMap', material.normalMap, 1);
    }
    if (material.metallicRoughnessMap) {
      shader.setTexture('metallicRoughnessMap', material.metallicRoughnessMap, 2);
    }
    if (material.emissiveMap) {
      shader.setTexture('emissiveMap', material.emissiveMap, 3);
    }
  }

  /**
   * Sets light uniforms on shader
   */
  private setLightUniforms(shader: Shader): void {
    const activeLights = this.lights.slice(0, this.settings.maxLights);
    
    shader.setInt('lightCount', activeLights.length);

    for (let i = 0; i < activeLights.length; i++) {
      const light = activeLights[i];
      const prefix = `lights[${i}]`;

      shader.setInt(`${prefix}.type`, light.type);
      shader.setVector3(`${prefix}.position`, light.position);
      shader.setVector3(`${prefix}.direction`, light.direction);
      shader.setVector3(`${prefix}.color`, light.color);
      shader.setFloat(`${prefix}.intensity`, light.intensity);
      shader.setFloat(`${prefix}.range`, light.range);
      shader.setFloat(`${prefix}.spotAngle`, light.spotAngle);
      shader.setFloat(`${prefix}.spotBlend`, light.spotBlend);
    }
  }

  /**
   * Renders post-processing effects
   */
  private renderPostProcessing(): void {
    if (this.postProcessor) {
      this.postProcessor.render();
    }
  }

  // ===== SHADER MANAGEMENT =====

  /**
   * Uses a shader program
   */
  private useShader(shader: Shader): void {
    if (this.currentShader === shader) {
      return;
    }

    if (!this.gl) return;

    this.gl.useProgram(shader.program);
    this.currentShader = shader;
  }

  // ===== GEOMETRY RENDERING =====

  /**
   * Renders a geometry
   */
  private renderGeometry(geometry: Geometry): void {
    if (!this.gl) return;

    // Bind vertex array object
    this.gl.bindVertexArray(geometry.vao);

    // Draw geometry
    if (geometry.indexCount > 0) {
      this.gl.drawElements(
        geometry.drawMode,
        geometry.indexCount,
        WebGL2RenderingContext.UNSIGNED_INT,
        0
      );
    } else {
      this.gl.drawArrays(
        geometry.drawMode,
        0,
        geometry.vertexCount
      );
    }

    // Unbind vertex array
    this.gl.bindVertexArray(null);
  }

  // ===== PERFORMANCE MONITORING =====

  /**
   * Updates FPS calculation
   */
  private updateFPS(): void {
    const now = performance.now();
    this.fpsCounter++;

    if (now - this.fpsTimer >= 1000) {
      this.metrics.fps = this.fpsCounter;
      this.fpsCounter = 0;
      this.fpsTimer = now;
    }
  }

  /**
   * Checks for performance warnings
   */
  private checkPerformanceWarnings(): void {
    if (this.metrics.drawCalls > this.settings.maxDrawCalls * 0.8) {
      this.eventEmitter.emit('performance:warning', {
        message: 'High draw call count detected',
        metrics: this.metrics
      });
    }

    if (this.metrics.frameTime > 16.67) { // 60 FPS threshold
      this.eventEmitter.emit('performance:warning', {
        message: 'Frame time exceeds 60 FPS threshold',
        metrics: this.metrics
      });
    }
  }

  // ===== PUBLIC API =====

  /**
   * Gets current render metrics
   */
  getMetrics(): RenderMetrics {
    return { ...this.metrics };
  }

  /**
   * Gets render settings
   */
  getSettings(): RenderSettings {
    return { ...this.settings };
  }

  /**
   * Updates render settings
   */
  updateSettings(settings: Partial<RenderSettings>): void {
    Object.assign(this.settings, settings);
    this.logger.debug('Render settings updated', settings);
  }

  /**
   * Resizes the renderer
   */
  resize(width: number, height: number): void {
    if (!this.canvas || !this.gl) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);

    // Update camera aspect ratios
    for (const camera of this.cameras) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    this.logger.debug(`Renderer resized to ${width}x${height}`);
  }

  /**
   * Disposes the renderer
   */
  dispose(): void {
    if (!this.gl) return;

    // Dispose geometries
    for (const geometry of this.geometries.values()) {
      geometry.dispose();
    }

    // Dispose materials
    for (const material of this.materials.values()) {
      material.dispose();
    }

    // Dispose textures
    for (const texture of this.textures.values()) {
      texture.dispose();
    }

    // Dispose shaders
    for (const shader of this.shaders.values()) {
      shader.dispose();
    }

    // Dispose post-processor
    if (this.postProcessor) {
      this.postProcessor.dispose();
    }

    this.logger.info('Renderer disposed');
  }
}

// ===== SUPPORTING CLASSES =====

/**
 * Render item for queue management
 */
interface RenderItem {
  node: SceneNode;
  geometry: Geometry;
  material: Material;
  worldMatrix: Matrix4;
  distance: number;
}

/**
 * Frustum culling system
 */
class FrustumCuller {
  isVisible(node: SceneNode, camera: Camera): boolean {
    const boundingSphere = node.boundingSphere;
    if (!boundingSphere) return true;

    return camera.frustum.intersectsSphere(boundingSphere);
  }
}

/**
 * Occlusion culling system
 */
class OcclusionCuller {
  isVisible(node: SceneNode, camera: Camera): boolean {
    // Simplified occlusion culling
    // In a real implementation, this would use hardware occlusion queries
    return true;
  }
}

/**
 * Level of Detail manager
 */
class LODManager {
  getLODLevel(node: SceneNode, camera: Camera): number {
    const distance = node.worldPosition.distanceTo(camera.position);
    // Simplified LOD calculation
    return distance < 10 ? 0 : distance < 50 ? 1 : 2;
  }
}

/**
 * Instancing manager
 */
class InstancingManager {
  createInstanceBuffer(instances: Matrix4[]): WebGLBuffer | null {
    // Simplified instancing
    return null;
  }
}

/**
 * Post-processing system
 */
class PostProcessor {
  constructor(
    private gl: WebGL2RenderingContext,
    private eventEmitter: EventEmitter<RendererEvents>,
    private logger: Logger
  ) {}

  render(): void {
    // Post-processing implementation
  }

  dispose(): void {
    // Cleanup
  }
} 