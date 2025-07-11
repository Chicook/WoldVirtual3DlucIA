/**
 * 🎬 SceneManager - Gestor de Escenas Avanzado
 * 
 * Responsabilidades:
 * - Gestión de escenas y jerarquías
 * - Optimización de renderizado
 * - Sistema de culling avanzado
 * - Gestión de LOD (Level of Detail)
 * - Organización de objetos
 * - Optimización de memoria
 */

import * as THREE from 'three';

export interface SceneNode {
  id: string;
  name: string;
  object: THREE.Object3D;
  parent: string | null;
  children: string[];
  visible: boolean;
  selectable: boolean;
  layer: number;
  metadata: Map<string, any>;
  bounds: THREE.Box3;
  lod: LODLevel[];
  performance: {
    drawCalls: number;
    triangles: number;
    memoryUsage: number;
  };
}

export interface LODLevel {
  distance: number;
  object: THREE.Object3D;
  complexity: number;
}

export interface SceneConfig {
  maxObjects: number;
  enableCulling: boolean;
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  maxDrawCalls: number;
  optimization: boolean;
}

export class SceneManager {
  private nodes: Map<string, SceneNode> = new Map();
  private rootNodes: Set<string> = new Set();
  private config: SceneConfig;
  private isInitialized: boolean = false;
  private camera: THREE.Camera | null = null;
  private frustum: THREE.Frustum | null = null;
  private cullingEnabled: boolean = true;
  private octree: any = null;

  constructor(config: Partial<SceneConfig> = {}) {
    this.config = {
      maxObjects: 10000,
      enableCulling: true,
      enableLOD: true,
      enableFrustumCulling: true,
      enableOcclusionCulling: false,
      maxDrawCalls: 1000,
      optimization: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[🎬] SceneManager ya está inicializado');
      return;
    }

    console.log('[🎬] Inicializando SceneManager...');

    try {
      // Inicializar frustum para culling
      this.frustum = new THREE.Frustum();
      
      // Inicializar octree para optimización espacial
      if (this.config.enableCulling) {
        this.initializeOctree();
      }
      
      // Cargar escenas predefinidas
      await this.loadPredefinedScenes();
      
      this.isInitialized = true;
      console.log('[✅] SceneManager inicializado correctamente');
    } catch (error) {
      console.error('[❌] Error inicializando SceneManager:', error);
      throw error;
    }
  }

  private initializeOctree(): void {
    // Implementación simplificada de octree
    this.octree = {
      bounds: new THREE.Box3(
        new THREE.Vector3(-1000, -1000, -1000),
        new THREE.Vector3(1000, 1000, 1000)
      ),
      children: [],
      objects: [],
      maxObjects: 8,
      maxDepth: 8
    };
  }

  private async loadPredefinedScenes(): Promise<void> {
    // Escena de prueba
    await this.createScene('test-scene', {
      name: 'Test Scene',
      description: 'Escena de prueba para desarrollo'
    });

    // Escena de metaverso
    await this.createScene('metaverse-scene', {
      name: 'Metaverse Scene',
      description: 'Escena principal del metaverso'
    });

    console.log('[🎬] Escenas predefinidas cargadas');
  }

  async createScene(id: string, options: { name: string; description?: string }): Promise<void> {
    const sceneNode: SceneNode = {
      id,
      name: options.name,
      object: new THREE.Scene(),
      parent: null,
      children: [],
      visible: true,
      selectable: true,
      layer: 0,
      metadata: new Map([
        ['description', options.description || ''],
        ['created', new Date()],
        ['version', '1.0.0']
      ]),
      bounds: new THREE.Box3(),
      lod: [],
      performance: {
        drawCalls: 0,
        triangles: 0,
        memoryUsage: 0
      }
    };

    this.nodes.set(id, sceneNode);
    this.rootNodes.add(id);
    
    console.log(`[🎬] Escena ${id} creada`);
  }

  addObject(sceneId: string, object: THREE.Object3D, options: Partial<SceneNode> = {}): string {
    const scene = this.nodes.get(sceneId);
    if (!scene) {
      throw new Error(`Escena ${sceneId} no encontrada`);
    }

    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const node: SceneNode = {
      id: nodeId,
      name: object.name || nodeId,
      object,
      parent: sceneId,
      children: [],
      visible: true,
      selectable: true,
      layer: 0,
      metadata: new Map(),
      bounds: new THREE.Box3(),
      lod: [],
      performance: {
        drawCalls: 0,
        triangles: 0,
        memoryUsage: 0
      },
      ...options
    };

    // Calcular bounds
    this.calculateBounds(node);
    
    // Configurar LOD si está habilitado
    if (this.config.enableLOD) {
      this.setupLOD(node);
    }

    // Agregar a la escena
    if ('add' in scene.object) {
      (scene.object as any).add(object);
    }
    scene.children.push(nodeId);
    this.nodes.set(nodeId, node);

    // Agregar al octree si está habilitado
    if (this.config.enableCulling && this.octree) {
      this.addToOctree(node);
    }

    console.log(`[🎬] Objeto ${nodeId} agregado a escena ${sceneId}`);
    return nodeId;
  }

  private calculateBounds(node: SceneNode): void {
    const box = new THREE.Box3();
    box.setFromObject(node.object);
    node.bounds = box;
  }

  private setupLOD(node: SceneNode): void {
    // Configurar LOD automáticamente para objetos complejos
    if (node.object instanceof THREE.Mesh) {
      const geometry = node.object.geometry;
      const triangleCount = geometry.attributes.position.count / 3;
      
      if (triangleCount > 1000) {
        // Crear niveles de LOD
        const highDetail = node.object.clone();
        const mediumDetail = this.createLODLevel(node.object, 0.5);
        const lowDetail = this.createLODLevel(node.object, 0.2);
        
        node.lod = [
          { distance: 0, object: highDetail, complexity: 1.0 },
          { distance: 50, object: mediumDetail, complexity: 0.5 },
          { distance: 100, object: lowDetail, complexity: 0.2 }
        ];
      }
    }
  }

  private createLODLevel(original: THREE.Object3D, reduction: number): THREE.Object3D {
    if (original instanceof THREE.Mesh) {
      const geometry = original.geometry;
      const simplifiedGeometry = geometry.clone();
      
      // Simplificar geometría (implementación básica)
      // En un entorno real, usaría THREE.SimplifyModifier
      
      const simplifiedMesh = new THREE.Mesh(
        simplifiedGeometry,
        original.material
      );
      
      return simplifiedMesh;
    }
    
    return original.clone();
  }

  private addToOctree(node: SceneNode): void {
    // Implementación simplificada de inserción en octree
    if (this.octree) {
      this.octree.objects.push(node);
    }
  }

  removeObject(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remover de la escena padre
    if (node.parent) {
      const parent = this.nodes.get(node.parent);
      if (parent && 'remove' in parent.object) {
        (parent.object as any).remove(node.object);
        parent.children = parent.children.filter(id => id !== nodeId);
      }
    }

    // Remover del octree
    if (this.config.enableCulling && this.octree) {
      this.removeFromOctree(node);
    }

    // Remover nodo
    this.nodes.delete(nodeId);
    
    console.log(`[🎬] Objeto ${nodeId} removido`);
  }

  private removeFromOctree(node: SceneNode): void {
    if (this.octree) {
      const index = this.octree.objects.indexOf(node);
      if (index > -1) {
        this.octree.objects.splice(index, 1);
      }
    }
  }

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.updateFrustum();
  }

  private updateFrustum(): void {
    if (this.camera && this.frustum) {
      this.frustum.setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(
          this.camera.projectionMatrix,
          this.camera.matrixWorldInverse
        )
      );
    }
  }

  getVisibleObjects(): SceneNode[] {
    if (!this.config.enableCulling) {
      return Array.from(this.nodes.values()).filter(node => node.visible);
    }

    const visibleNodes: SceneNode[] = [];
    
    for (const node of this.nodes.values()) {
      if (!node.visible) continue;
      
      // Frustum culling
      if (this.config.enableFrustumCulling && this.frustum) {
        if (!this.frustum.intersectsBox(node.bounds)) {
          continue;
        }
      }
      
      // LOD selection
      if (this.config.enableLOD && node.lod.length > 0) {
        this.selectLODLevel(node);
      }
      
      visibleNodes.push(node);
    }
    
    return visibleNodes;
  }

  private selectLODLevel(node: SceneNode): void {
    if (!this.camera || node.lod.length === 0) return;

    // Verificar que el objeto tiene posición
    if (!('position' in node.object)) {
      return;
    }

    const distance = this.camera.position.distanceTo((node.object as any).position);
    
    // Seleccionar nivel de LOD apropiado
    let selectedLOD = node.lod[0];
    for (const lod of node.lod) {
      if (distance >= lod.distance) {
        selectedLOD = lod;
      }
    }
    
    // Reemplazar objeto en la escena
    if (node.parent) {
      const parent = this.nodes.get(node.parent);
      if (parent && 'remove' in parent.object && 'add' in parent.object) {
        (parent.object as any).remove(node.object);
        (parent.object as any).add(selectedLOD.object);
        node.object = selectedLOD.object;
      }
    }
  }

  getObject(nodeId: string): SceneNode | undefined {
    return this.nodes.get(nodeId);
  }

  getAllObjects(): SceneNode[] {
    return Array.from(this.nodes.values());
  }

  getSceneObjects(sceneId: string): SceneNode[] {
    const scene = this.nodes.get(sceneId);
    if (!scene) return [];

    return scene.children.map(childId => this.nodes.get(childId)).filter(Boolean) as SceneNode[];
  }

  setObjectVisibility(nodeId: string, visible: boolean): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.visible = visible;
      if ('visible' in node.object) {
        (node.object as any).visible = visible;
      }
    }
  }

  setObjectLayer(nodeId: string, layer: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.layer = layer;
      if ('layers' in node.object) {
        (node.object as any).layers.set(layer);
      }
    }
  }

  moveObject(nodeId: string, newParentId: string): void {
    const node = this.nodes.get(nodeId);
    const newParent = this.nodes.get(newParentId);
    
    if (!node || !newParent) return;

    // Remover del padre actual
    if (node.parent) {
      const currentParent = this.nodes.get(node.parent);
      if (currentParent && 'remove' in currentParent.object) {
        (currentParent.object as any).remove(node.object);
        currentParent.children = currentParent.children.filter(id => id !== nodeId);
      }
    }

    // Agregar al nuevo padre
    if ('add' in newParent.object) {
      (newParent.object as any).add(node.object);
    }
    newParent.children.push(nodeId);
    node.parent = newParentId;
  }

  update(deltaTime: number): void {
    if (!this.isInitialized) return;

    // Actualizar frustum si la cámara cambió
    if (this.camera) {
      this.updateFrustum();
    }

    // Actualizar estadísticas de rendimiento
    this.updatePerformanceStats();

    // Optimización automática
    if (this.config.optimization) {
      this.performOptimization();
    }
  }

  private updatePerformanceStats(): void {
    for (const node of this.nodes.values()) {
      if (node.object instanceof THREE.Mesh) {
        const geometry = node.object.geometry;
        node.performance.triangles = geometry.attributes.position.count / 3;
        node.performance.drawCalls = 1;
        node.performance.memoryUsage = this.estimateMemoryUsage(node.object);
      }
    }
  }

  private estimateMemoryUsage(object: THREE.Object3D): number {
    let memory = 0;
    
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      const material = object.material;
      
      // Estimación de memoria de geometría
      if (geometry.attributes.position) {
        memory += geometry.attributes.position.count * 12; // 3 floats * 4 bytes
      }
      if (geometry.attributes.normal) {
        memory += geometry.attributes.normal.count * 12;
      }
      if (geometry.attributes.uv) {
        memory += geometry.attributes.uv.count * 8; // 2 floats * 4 bytes
      }
      
      // Estimación de memoria de material
      memory += 1024; // Estimación básica
    }
    
    return memory;
  }

  private performOptimization(): void {
    const totalDrawCalls = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.performance.drawCalls, 0);
    
    if (totalDrawCalls > this.config.maxDrawCalls) {
      console.warn(`[⚠️] Demasiados draw calls (${totalDrawCalls}), aplicando optimizaciones`);
      this.mergeObjects();
    }
  }

  private mergeObjects(): void {
    // Implementación básica de merge de objetos
    // En un entorno real, usaría THREE.BufferGeometryUtils.mergeBufferGeometries
    
    console.log('[🎬] Aplicando optimizaciones de merge...');
  }

  getStats(): any {
    const totalObjects = this.nodes.size;
    const visibleObjects = this.getVisibleObjects().length;
    const totalTriangles = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.performance.triangles, 0);
    const totalMemory = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.performance.memoryUsage, 0);

    return {
      totalObjects,
      visibleObjects,
      totalTriangles,
      totalMemory,
      scenes: this.rootNodes.size,
      cullingEnabled: this.config.enableCulling,
      lodEnabled: this.config.enableLOD,
      performance: {
        drawCalls: Array.from(this.nodes.values())
          .reduce((sum, node) => sum + node.performance.drawCalls, 0),
        averageTriangles: totalTriangles / totalObjects || 0,
        memoryUsageMB: totalMemory / (1024 * 1024)
      }
    };
  }

  async cleanup(): Promise<void> {
    console.log('[🎬] Limpiando SceneManager...');
    
    // Limpiar todos los objetos
    for (const node of this.nodes.values()) {
      if ('dispose' in node.object) {
        (node.object as any).dispose();
      }
    }
    
    this.nodes.clear();
    this.rootNodes.clear();
    this.octree = null;
    this.frustum = null;
    this.camera = null;
    this.isInitialized = false;
    
    console.log('[✅] SceneManager limpiado correctamente');
  }
}

export default SceneManager; 