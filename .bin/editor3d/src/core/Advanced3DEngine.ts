/**
 * 🎮 Advanced3DEngine - Motor 3D Avanzado
 * 
 * Responsabilidades:
 * - Renderizado 3D de alto rendimiento
 * - Física avanzada con WebGPU
 * - Networking P2P en tiempo real
 * - Shaders personalizados
 * - Optimización de memoria y GPU
 * - Sistema de partículas avanzado
 */

import * as THREE from 'three';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { NetworkSync } from './networking/NetworkSync';
import { ShaderManager } from './shaders/ShaderManager';
import { ParticleSystem } from './particles/ParticleSystem';
import { SceneManager } from './scene/SceneManager';

// Verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface EngineConfig {
  renderer: {
    antialias: boolean;
    shadowMap: boolean;
    postProcessing: boolean;
    webgpu: boolean;
  };
  physics: {
    gravity: THREE.Vector3;
    iterations: number;
    broadphase: 'sweep' | 'grid' | 'quadtree';
  };
  networking: {
    p2p: boolean;
    maxPlayers: number;
    syncRate: number;
  };
  performance: {
    targetFPS: number;
    maxDrawCalls: number;
    maxTriangles: number;
    culling: boolean;
  };
}

export interface RenderStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  memory: {
    geometries: number;
    textures: number;
    programs: number;
  };
  gpu: {
    frameTime: number;
    memoryUsage: number;
  };
}

export class Advanced3DEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | any;
  private physicsEngine: PhysicsEngine;
  private networkSync: NetworkSync;
  private shaderManager: ShaderManager;
  private particleSystem: ParticleSystem;
  private sceneManager: SceneManager;
  
  private config: EngineConfig;
  private isInitialized: boolean = false;
  private animationId: number | null = null;
  private stats: RenderStats;
  private lastTime: number = 0;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = this.mergeDefaultConfig(config);
    this.stats = this.initializeStats();
    
    this.scene = new THREE.Scene();
    // Usar valores por defecto para evitar errores de DOM
    const width = isBrowser ? window.innerWidth : 800;
    const height = isBrowser ? window.innerHeight : 600;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    this.physicsEngine = new PhysicsEngine(this.config.physics);
    this.networkSync = new NetworkSync(this.config.networking);
    this.shaderManager = new ShaderManager();
    this.particleSystem = new ParticleSystem();
    this.sceneManager = new SceneManager();
  }

  private mergeDefaultConfig(config: Partial<EngineConfig>): EngineConfig {
    return {
      renderer: {
        antialias: true,
        shadowMap: true,
        postProcessing: true,
        webgpu: false,
        ...config.renderer
      },
      physics: {
        gravity: new THREE.Vector3(0, -9.81, 0),
        iterations: 10,
        broadphase: 'quadtree',
        ...config.physics
      },
      networking: {
        p2p: true,
        maxPlayers: 100,
        syncRate: 60,
        ...config.networking
      },
      performance: {
        targetFPS: 60,
        maxDrawCalls: 1000,
        maxTriangles: 100000,
        culling: true,
        ...config.performance
      }
    };
  }

  private initializeStats(): RenderStats {
    return {
      fps: 0,
      drawCalls: 0,
      triangles: 0,
      memory: {
        geometries: 0,
        textures: 0,
        programs: 0
      },
      gpu: {
        frameTime: 0,
        memoryUsage: 0
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[🎮] Advanced3DEngine ya está inicializado');
      return;
    }

    console.log('[🎮] Inicializando Advanced3DEngine...');

    try {
      // Inicializar renderer
      await this.initializeRenderer();
      
      // Inicializar componentes
      await this.physicsEngine.initialize();
      await this.networkSync.initialize();
      await this.shaderManager.initialize();
      await this.particleSystem.initialize();
      await this.sceneManager.initialize();

      // Configurar escena
      this.setupScene();
      
      // Configurar eventos
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('[✅] Advanced3DEngine inicializado correctamente');
    } catch (error) {
      console.error('[❌] Error inicializando Advanced3DEngine:', error);
      throw error;
    }
  }

  private async initializeRenderer(): Promise<void> {
    if (this.config.renderer.webgpu && isBrowser && 'gpu' in navigator) {
      // Intentar usar WebGPU
      try {
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        
        this.renderer = {
          render: (scene: THREE.Scene, camera: THREE.Camera) => {
            // Implementación WebGPU
            console.log('Rendering with WebGPU');
          },
          setSize: (width: number, height: number) => {
            // Configurar tamaño WebGPU
          },
          domElement: document.createElement('canvas')
        };
        
        console.log('[🎮] WebGPU renderer inicializado');
      } catch (error) {
        console.warn('[⚠️] WebGPU no disponible, usando WebGL');
        this.config.renderer.webgpu = false;
      }
    }

    if (!this.config.renderer.webgpu) {
      // Usar WebGL como fallback
      this.renderer = new THREE.WebGLRenderer({
        antialias: this.config.renderer.antialias,
        alpha: true,
        powerPreference: 'high-performance'
      });
      
      if (isBrowser) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      } else {
        this.renderer.setSize(800, 600);
      }
      
      this.renderer.shadowMap.enabled = this.config.renderer.shadowMap;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      if (this.config.renderer.postProcessing) {
        this.setupPostProcessing();
      }
    }
  }

  private setupPostProcessing(): void {
    if (!isBrowser) return;
    
    // Post-processing básico sin dependencias externas
    console.log('[🎮] Configurando post-processing básico...');
    
    // Por ahora, usar renderizado estándar
    // TODO: Implementar post-processing personalizado
  }

  private setupScene(): void {
    // Configurar iluminación
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Configurar niebla
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // Configurar cámara
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);
  }

  private setupEventListeners(): void {
    if (!isBrowser) return;
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Performance monitoring
    setInterval(() => {
      this.updateStats();
    }, 1000);
  }

  start(): void {
    if (!this.isInitialized) {
      throw new Error('Engine no inicializado');
    }

    console.log('[🎮] Iniciando render loop...');
    this.lastTime = performance.now();
    this.animate();
  }

  stop(): void {
    if (this.animationId && isBrowser) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log('[🎮] Render loop detenido');
    }
  }

  private animate(): void {
    if (isBrowser) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Actualizar física
    this.physicsEngine.update(deltaTime);

    // Actualizar networking
    this.networkSync.update(deltaTime);

    // Actualizar partículas
    this.particleSystem.update(deltaTime);

    // Actualizar escena
    this.sceneManager.update(deltaTime);

    // Renderizar
    this.renderer.render(this.scene, this.camera);

    // Actualizar estadísticas
    this.updateFrameStats(deltaTime);
  }

  private updateFrameStats(deltaTime: number): void {
    this.stats.fps = 1 / deltaTime;
    this.stats.gpu.frameTime = deltaTime * 1000;

    if (this.renderer.info) {
      this.stats.drawCalls = this.renderer.info.render.calls;
      this.stats.triangles = this.renderer.info.render.triangles;
      this.stats.memory.geometries = this.renderer.info.memory.geometries;
      this.stats.memory.textures = this.renderer.info.memory.textures;
      this.stats.memory.programs = this.renderer.info.memory.programs;
    }
  }

  private updateStats(): void {
    // Log de estadísticas cada segundo
    console.log(`[📊] FPS: ${this.stats.fps.toFixed(1)}, Draw Calls: ${this.stats.drawCalls}, Triangles: ${this.stats.triangles}`);
  }

  // Métodos públicos para interacción
  addObject(object: THREE.Object3D): void {
    this.scene.add(object);
    
    // Agregar a física si es necesario
    if (object.userData.hasPhysics) {
      this.physicsEngine.addBody(object);
    }
  }

  removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
    
    // Remover de física
    this.physicsEngine.removeBody(object);
  }

  setCameraPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position);
  }

  setCameraTarget(target: THREE.Vector3): void {
    this.camera.lookAt(target);
  }

  getStats(): RenderStats {
    return { ...this.stats };
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer | any {
    return this.renderer;
  }

  async cleanup(): Promise<void> {
    console.log('[🎮] Limpiando Advanced3DEngine...');

    this.stop();

    await this.physicsEngine.cleanup();
    await this.networkSync.cleanup();
    await this.shaderManager.cleanup();
    await this.particleSystem.cleanup();
    await this.sceneManager.cleanup();

    if (this.renderer.dispose) {
      this.renderer.dispose();
    }

    this.isInitialized = false;
    console.log('[✅] Advanced3DEngine limpiado correctamente');
  }
}

export default Advanced3DEngine; 