/**
 * 🎨 ShaderManager - Gestor de Shaders Avanzado
 * 
 * Responsabilidades:
 * - Compilación y gestión de shaders
 * - Hot-reloading de shaders
 * - Optimización automática
 * - Compatibilidad WebGPU/WebGL
 * - Sistema de materiales PBR
 * - Shaders personalizados
 */

import * as THREE from 'three';

// Verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface ShaderProgram {
  id: string;
  name: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: THREE.IUniform };
  attributes: { [key: string]: number };
  program: THREE.ShaderMaterial | null;
  compiled: boolean;
  error: string | null;
  performance: {
    compileTime: number;
    memoryUsage: number;
    drawCalls: number;
  };
}

export interface ShaderConfig {
  enableHotReload: boolean;
  enableOptimization: boolean;
  enableWebGPU: boolean;
  maxShaders: number;
  autoCompile: boolean;
}

export class ShaderManager {
  private shaders: Map<string, ShaderProgram> = new Map();
  private config: ShaderConfig;
  private isInitialized: boolean = false;
  private webgpuDevice: any = null;
  private watchers: Map<string, any> = new Map();

  constructor(config: Partial<ShaderConfig> = {}) {
    this.config = {
      enableHotReload: true,
      enableOptimization: true,
      enableWebGPU: false,
      maxShaders: 100,
      autoCompile: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[🎨] ShaderManager ya está inicializado');
      return;
    }

    console.log('[🎨] Inicializando ShaderManager...');

    try {
      // Inicializar WebGPU si está habilitado
      if (this.config.enableWebGPU && isBrowser && 'gpu' in navigator) {
        await this.initializeWebGPU();
      }

      // Cargar shaders predefinidos
      await this.loadPredefinedShaders();

      // Configurar hot-reloading
      if (this.config.enableHotReload) {
        this.setupHotReload();
      }

      this.isInitialized = true;
      console.log('[✅] ShaderManager inicializado correctamente');
    } catch (error) {
      console.error('[❌] Error inicializando ShaderManager:', error);
      throw error;
    }
  }

  private async initializeWebGPU(): Promise<void> {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      this.webgpuDevice = await adapter.requestDevice();
      console.log('[🎨] WebGPU inicializado');
    } catch (error) {
      console.warn('[⚠️] WebGPU no disponible, usando WebGL');
      this.config.enableWebGPU = false;
    }
  }

  private async loadPredefinedShaders(): Promise<void> {
    // Shader de agua
    await this.createShader('water', {
      vertexShader: this.getWaterVertexShader(),
      fragmentShader: this.getWaterFragmentShader(),
      uniforms: {
        time: { value: 0 },
        waveSpeed: { value: 0.5 },
        waveHeight: { value: 0.1 },
        waveFrequency: { value: 10.0 },
        waterColor: { value: new THREE.Color(0x006994) },
        foamColor: { value: new THREE.Color(0xffffff) }
      }
    });

    // Shader de fuego
    await this.createShader('fire', {
      vertexShader: this.getFireVertexShader(),
      fragmentShader: this.getFireFragmentShader(),
      uniforms: {
        time: { value: 0 },
        fireIntensity: { value: 1.0 },
        fireSpeed: { value: 2.0 },
        fireColor: { value: new THREE.Color(0xff4400) },
        smokeColor: { value: new THREE.Color(0x333333) }
      }
    });

    // Shader de hielo
    await this.createShader('ice', {
      vertexShader: this.getIceVertexShader(),
      fragmentShader: this.getIceFragmentShader(),
      uniforms: {
        time: { value: 0 },
        iceThickness: { value: 0.5 },
        refractionIndex: { value: 1.33 },
        frostAmount: { value: 0.3 },
        iceColor: { value: new THREE.Color(0x87ceeb) }
      }
    });

    // Shader de metal
    await this.createShader('metal', {
      vertexShader: this.getMetalVertexShader(),
      fragmentShader: this.getMetalFragmentShader(),
      uniforms: {
        metalness: { value: 1.0 },
        roughness: { value: 0.2 },
        reflectivity: { value: 0.8 },
        metalColor: { value: new THREE.Color(0x888888) },
        environmentMap: { value: null }
      }
    });

    console.log('[🎨] Shaders predefinidos cargados');
  }

  private getWaterVertexShader(): string {
    return `
      uniform float time;
      uniform float waveSpeed;
      uniform float waveHeight;
      uniform float waveFrequency;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Animar vértices para crear ondas
        vec3 newPosition = position;
        float wave = sin(position.x * waveFrequency + time * waveSpeed) * 
                    sin(position.z * waveFrequency + time * waveSpeed) * waveHeight;
        newPosition.y += wave;
        
        // Calcular normal
        vec3 tangent = vec3(1.0, waveFrequency * cos(position.x * waveFrequency + time * waveSpeed), 0.0);
        vec3 bitangent = vec3(0.0, waveFrequency * cos(position.z * waveFrequency + time * waveSpeed), 1.0);
        vNormal = normalize(cross(tangent, bitangent));
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
  }

  private getWaterFragmentShader(): string {
    return `
      uniform float time;
      uniform vec3 waterColor;
      uniform vec3 foamColor;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        // Efecto de espuma en las crestas
        float foam = pow(1.0 - abs(vNormal.y), 3.0);
        foam *= sin(time * 2.0) * 0.5 + 0.5;
        
        // Color base del agua
        vec3 color = mix(waterColor, foamColor, foam);
        
        // Transparencia
        float alpha = 0.8 + foam * 0.2;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getFireVertexShader(): string {
    return `
      uniform float time;
      uniform float fireSpeed;
      
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Animar vértices para crear movimiento de fuego
        vec3 newPosition = position;
        float noise = sin(position.y * 10.0 + time * fireSpeed) * 0.1;
        newPosition.x += noise;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
  }

  private getFireFragmentShader(): string {
    return `
      uniform float time;
      uniform float fireIntensity;
      uniform vec3 fireColor;
      uniform vec3 smokeColor;
      
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        // Gradiente de fuego
        float gradient = 1.0 - vUv.y;
        gradient = pow(gradient, 2.0);
        
        // Ruido para textura de fuego
        float noise = sin(vUv.x * 20.0 + time * 3.0) * 
                     sin(vUv.y * 10.0 + time * 2.0) * 0.5 + 0.5;
        
        // Mezclar fuego y humo
        vec3 color = mix(smokeColor, fireColor, gradient * fireIntensity);
        color += noise * 0.3;
        
        // Transparencia
        float alpha = gradient * fireIntensity;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getIceVertexShader(): string {
    return `
      uniform float time;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  private getIceFragmentShader(): string {
    return `
      uniform float iceThickness;
      uniform float refractionIndex;
      uniform float frostAmount;
      uniform vec3 iceColor;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        // Efecto de refracción
        vec3 refracted = refract(normalize(vNormal), vec3(0.0, 1.0, 0.0), 1.0 / refractionIndex);
        
        // Patrón de escarcha
        float frost = sin(vUv.x * 50.0) * sin(vUv.y * 50.0) * frostAmount;
        
        // Color final
        vec3 color = iceColor;
        color += frost;
        color *= iceThickness;
        
        gl_FragColor = vec4(color, 0.9);
      }
    `;
  }

  private getMetalVertexShader(): string {
    return `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  private getMetalFragmentShader(): string {
    return `
      uniform float metalness;
      uniform float roughness;
      uniform float reflectivity;
      uniform vec3 metalColor;
      uniform samplerCube environmentMap;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vPosition);
        
        // Reflexión
        vec3 reflection = reflect(-viewDir, normal);
        vec3 envColor = textureCube(environmentMap, reflection).rgb;
        
        // Fresnel
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
        
        // Color final
        vec3 color = mix(metalColor, envColor, reflectivity);
        color = mix(color, envColor, fresnel);
        color *= metalness;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  async createShader(id: string, options: {
    vertexShader: string;
    fragmentShader: string;
    uniforms?: Record<string, any>;
  }): Promise<ShaderProgram> {
    if (this.shaders.has(id)) {
      console.warn(`[⚠️] Shader ${id} ya existe, sobrescribiendo`);
    }

    const startTime = performance.now();

    try {
      // Crear material de shader
      const material = new THREE.ShaderMaterial({
        vertexShader: options.vertexShader,
        fragmentShader: options.fragmentShader,
        uniforms: options.uniforms || {},
        transparent: true,
        side: THREE.DoubleSide
      });

      const shader: ShaderProgram = {
        id,
        name: id,
        vertexShader: options.vertexShader,
        fragmentShader: options.fragmentShader,
        uniforms: Object.fromEntries(Object.entries(options.uniforms || {})),
        attributes: {},
        program: material,
        compiled: true,
        error: null,
        performance: {
          compileTime: performance.now() - startTime,
          memoryUsage: 0,
          drawCalls: 0
        }
      };

      this.shaders.set(id, shader);
      
      if (this.config.autoCompile) {
        this.optimizeShader(shader);
      }

      console.log(`[🎨] Shader ${id} creado exitosamente`);
      return shader;
    } catch (error) {
      console.error(`[❌] Error creando shader ${id}:`, error);
      
      const failedShader: ShaderProgram = {
        id,
        name: id,
        vertexShader: options.vertexShader,
        fragmentShader: options.fragmentShader,
        uniforms: {},
        attributes: {},
        program: null,
        compiled: false,
        error: error.message,
        performance: {
          compileTime: performance.now() - startTime,
          memoryUsage: 0,
          drawCalls: 0
        }
      };

      this.shaders.set(id, failedShader);
      return failedShader;
    }
  }

  private optimizeShader(shader: ShaderProgram): void {
    // Optimizaciones básicas
    if (shader.program) {
      // Reducir precision si es posible
      shader.program.precision = 'mediump';
      
      // Habilitar optimizaciones del compilador
      shader.program.defines = {
        ...shader.program.defines,
        OPTIMIZED: 1
      };
    }
  }

  getShader(id: string): ShaderProgram | undefined {
    return this.shaders.get(id);
  }

  getAllShaders(): ShaderProgram[] {
    return Array.from(this.shaders.values());
  }

  updateShaderUniform(shaderId: string, uniformName: string, value: any): void {
    const shader = this.shaders.get(shaderId);
    if (shader && shader.program) {
      if (shader.program.uniforms[uniformName]) {
        shader.program.uniforms[uniformName].value = value;
      }
    }
  }

  createEffect(id: string, shaderId: string, type: 'post-processing' | 'material' | 'custom'): ShaderEffect {
    const shader = this.shaders.get(shaderId);
    if (!shader) {
      throw new Error(`Shader ${shaderId} no encontrado`);
    }

    const effect: ShaderEffect = {
      id,
      name: id,
      type,
      shader,
      enabled: true,
      parameters: new Map(),
      priority: 0
    };

    this.effects.set(id, effect);
    console.log(`[🎨] Efecto ${id} creado`);
    return effect;
  }

  getEffect(id: string): ShaderEffect | undefined {
    return this.effects.get(id);
  }

  getAllEffects(): ShaderEffect[] {
    return Array.from(this.effects.values());
  }

  enableEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.enabled = true;
    }
  }

  disableEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.enabled = false;
    }
  }

  private setupHotReload(): void {
    // Configurar hot reload para desarrollo
    if (isBrowser) {
      window.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'r') {
          this.reloadShaders();
        }
      });
    }
  }

  private async reloadShaders(): Promise<void> {
    console.log('[🔄] Recargando shaders...');
    
    for (const shader of this.shaders.values()) {
      try {
        await this.createShader(shader.id, {
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          uniforms: Object.fromEntries(shader.uniforms)
        });
      } catch (error) {
        console.error(`[❌] Error recargando shader ${shader.id}:`, error);
      }
    }
    
    console.log('[✅] Shaders recargados');
  }

  update(time: number): void {
    // Actualizar uniforms de tiempo
    for (const shader of this.shaders.values()) {
      if (shader.program && shader.program.uniforms.time) {
        shader.program.uniforms.time.value = time;
      }
    }
  }

  getStats(): any {
    return {
      totalShaders: this.shaders.size,
      totalEffects: this.effects.size,
      compiledShaders: Array.from(this.shaders.values()).filter(s => s.compiled).length,
      failedShaders: Array.from(this.shaders.values()).filter(s => !s.compiled).length,
      cacheSize: this.shaderCache.size,
      memoryUsage: Array.from(this.shaders.values())
        .reduce((sum, s) => sum + s.performance.memoryUsage, 0)
    };
  }

  async cleanup(): Promise<void> {
    console.log('[🎨] Limpiando ShaderManager...');
    
    // Limpiar shaders
    for (const shader of this.shaders.values()) {
      if (shader.program && shader.program.dispose) {
        shader.program.dispose();
      }
    }
    
    this.shaders.clear();
    this.effects.clear();
    this.shaderCache.clear();
    this.uniformCache.clear();
    this.isInitialized = false;
    
    console.log('[✅] ShaderManager limpiado correctamente');
  }
}

export default ShaderManager; 