/**
 * ✨ ParticleSystem - Sistema de Partículas Avanzado
 * 
 * Responsabilidades:
 * - Sistema de partículas GPU-accelerated
 * - Múltiples emisores y comportamientos
 * - Efectos visuales complejos
 * - Optimización de rendimiento
 * - Integración con shaders
 * - Gestión de memoria eficiente
 */

import * as THREE from 'three';

export interface Particle {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  age: number;
  active: boolean;
  emitterId: string;
  behavior: ParticleBehavior;
}

export interface ParticleEmitter {
  id: string;
  name: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  spread: number;
  rate: number;
  burst: number;
  maxParticles: number;
  particleLife: number;
  particleSize: number;
  particleColor: THREE.Color;
  gravity: THREE.Vector3;
  wind: THREE.Vector3;
  turbulence: number;
  texture?: THREE.Texture;
  enabled: boolean;
  behavior: EmitterBehavior;
}

export interface ParticleBehavior {
  type: 'linear' | 'spiral' | 'explosion' | 'fountain' | 'custom';
  parameters: Map<string, any>;
  update: (particle: Particle, deltaTime: number) => void;
}

export interface EmitterBehavior {
  type: 'continuous' | 'burst' | 'pulse' | 'custom';
  parameters: Map<string, any>;
  update: (emitter: ParticleEmitter, deltaTime: number) => void;
}

export interface ParticleSystemConfig {
  maxParticles: number;
  gpuAcceleration: boolean;
  useInstancing: boolean;
  autoCleanup: boolean;
  optimization: boolean;
  debug: boolean;
}

export class ParticleSystem {
  private particles: Map<string, Particle> = new Map();
  private emitters: Map<string, ParticleEmitter> = new Map();
  private config: ParticleSystemConfig;
  private isInitialized: boolean = false;
  private particlePool: Particle[] = [];
  private nextParticleId: number = 0;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private mesh: THREE.Points | null = null;
  private positions: Float32Array | null = null;
  private colors: Float32Array | null = null;
  private sizes: Float32Array | null = null;

  constructor(config: Partial<ParticleSystemConfig> = {}) {
    this.config = {
      maxParticles: 10000,
      gpuAcceleration: true,
      useInstancing: true,
      autoCleanup: true,
      optimization: true,
      debug: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[✨] ParticleSystem ya está inicializado');
      return;
    }

    console.log('[✨] Inicializando ParticleSystem...');

    try {
      // Inicializar pool de partículas
      this.initializeParticlePool();
      
      // Configurar geometría y material
      await this.setupGeometryAndMaterial();
      
      // Cargar emisores predefinidos
      await this.loadPredefinedEmitters();
      
      this.isInitialized = true;
      console.log('[✅] ParticleSystem inicializado correctamente');
    } catch (error) {
      console.error('[❌] Error inicializando ParticleSystem:', error);
      throw error;
    }
  }

  private initializeParticlePool(): void {
    console.log(`[✨] Inicializando pool de ${this.config.maxParticles} partículas`);
    
    for (let i = 0; i < this.config.maxParticles; i++) {
      const particle: Particle = {
        id: `particle_${i}`,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        acceleration: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 1.0,
        life: 1.0,
        maxLife: 1.0,
        age: 0,
        active: false,
        emitterId: '',
        behavior: this.createDefaultBehavior()
      };
      
      this.particlePool.push(particle);
    }
  }

  private createDefaultBehavior(): ParticleBehavior {
    return {
      type: 'linear',
      parameters: new Map(),
      update: (particle: Particle, deltaTime: number) => {
        // Comportamiento lineal por defecto
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
        particle.velocity.add(particle.acceleration.clone().multiplyScalar(deltaTime));
        particle.age += deltaTime;
        particle.life = 1.0 - (particle.age / particle.maxLife);
      }
    };
  }

  private async setupGeometryAndMaterial(): Promise<void> {
    // Crear geometría de partículas
    this.geometry = new THREE.BufferGeometry();
    
    // Buffers para atributos de partículas
    this.positions = new Float32Array(this.config.maxParticles * 3);
    this.colors = new Float32Array(this.config.maxParticles * 3);
    this.sizes = new Float32Array(this.config.maxParticles);
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    // Crear material de partículas
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.getParticleVertexShader(),
      fragmentShader: this.getParticleFragmentShader(),
      uniforms: {
        time: { value: 0 },
        texture: { value: null }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    
    // Crear mesh de partículas
    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  private getParticleVertexShader(): string {
    return `
      attribute float size;
      attribute vec3 color;
      
      varying vec3 vColor;
      varying float vLife;
      
      uniform float time;
      
      void main() {
        vColor = color;
        vLife = size;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
  }

  private getParticleFragmentShader(): string {
    return `
      varying vec3 vColor;
      varying float vLife;
      
      uniform sampler2D texture;
      
      void main() {
        vec2 uv = gl_PointCoord;
        vec4 texColor = texture2D(texture, uv);
        
        // Efecto de desvanecimiento
        float alpha = texColor.a * vLife;
        
        // Efecto de brillo
        vec3 color = vColor * texColor.rgb;
        color += vColor * 0.5 * (1.0 - vLife);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private async loadPredefinedEmitters(): Promise<void> {
    // Emisor de fuego
    await this.createEmitter('fire', {
      name: 'Fire Emitter',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(0, 1, 0),
      spread: 0.3,
      rate: 100,
      burst: 0,
      maxParticles: 500,
      particleLife: 2.0,
      particleSize: 0.5,
      particleColor: new THREE.Color(0xff4400),
      gravity: new THREE.Vector3(0, 2, 0),
      wind: new THREE.Vector3(0, 0, 0),
      turbulence: 0.1,
      behavior: this.createFireBehavior()
    });

    // Emisor de chispas
    await this.createEmitter('sparks', {
      name: 'Sparks Emitter',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(0, 1, 0),
      spread: 1.0,
      rate: 50,
      burst: 10,
      maxParticles: 200,
      particleLife: 1.0,
      particleSize: 0.1,
      particleColor: new THREE.Color(0xffff00),
      gravity: new THREE.Vector3(0, -9.81, 0),
      wind: new THREE.Vector3(0, 0, 0),
      turbulence: 0.5,
      behavior: this.createSparksBehavior()
    });

    // Emisor de humo
    await this.createEmitter('smoke', {
      name: 'Smoke Emitter',
      position: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(0, 1, 0),
      spread: 0.5,
      rate: 30,
      burst: 0,
      maxParticles: 300,
      particleLife: 3.0,
      particleSize: 1.0,
      particleColor: new THREE.Color(0x666666),
      gravity: new THREE.Vector3(0, 1, 0),
      wind: new THREE.Vector3(0, 0, 0),
      turbulence: 0.2,
      behavior: this.createSmokeBehavior()
    });

    console.log('[✨] Emisores predefinidos cargados');
  }

  private createFireBehavior(): EmitterBehavior {
    return {
      type: 'continuous',
      parameters: new Map([
        ['intensity', 1.0],
        ['flicker', 0.1]
      ]),
      update: (emitter: ParticleEmitter, deltaTime: number) => {
        // Comportamiento de fuego
        const intensity = emitter.behavior.parameters.get('intensity') || 1.0;
        const flicker = emitter.behavior.parameters.get('flicker') || 0.1;
        
        // Variar intensidad del fuego
        const flickerAmount = Math.sin(Date.now() * 0.01) * flicker;
        emitter.rate = 100 * intensity * (1.0 + flickerAmount);
      }
    };
  }

  private createSparksBehavior(): EmitterBehavior {
    return {
      type: 'burst',
      parameters: new Map([
        ['burstInterval', 0.5],
        ['lastBurst', 0]
      ]),
      update: (emitter: ParticleEmitter, deltaTime: number) => {
        // Comportamiento de chispas
        const burstInterval = emitter.behavior.parameters.get('burstInterval') || 0.5;
        let lastBurst = emitter.behavior.parameters.get('lastBurst') || 0;
        
        lastBurst += deltaTime;
        if (lastBurst >= burstInterval) {
          emitter.burst = 10;
          lastBurst = 0;
        } else {
          emitter.burst = 0;
        }
        
        emitter.behavior.parameters.set('lastBurst', lastBurst);
      }
    };
  }

  private createSmokeBehavior(): EmitterBehavior {
    return {
      type: 'continuous',
      parameters: new Map([
        ['density', 1.0],
        ['drift', 0.1]
      ]),
      update: (emitter: ParticleEmitter, deltaTime: number) => {
        // Comportamiento de humo
        const density = emitter.behavior.parameters.get('density') || 1.0;
        const drift = emitter.behavior.parameters.get('drift') || 0.1;
        
        // Variar dirección del viento
        emitter.wind.x = Math.sin(Date.now() * 0.001) * drift;
        emitter.wind.z = Math.cos(Date.now() * 0.001) * drift;
        emitter.rate = 30 * density;
      }
    };
  }

  async createEmitter(id: string, options: Partial<ParticleEmitter>): Promise<ParticleEmitter> {
    const emitter: ParticleEmitter = {
      id,
      name: id,
      position: new THREE.Vector3(),
      direction: new THREE.Vector3(0, 1, 0),
      spread: 0.5,
      rate: 10,
      burst: 0,
      maxParticles: 100,
      particleLife: 1.0,
      particleSize: 1.0,
      particleColor: new THREE.Color(0xffffff),
      gravity: new THREE.Vector3(0, -9.81, 0),
      wind: new THREE.Vector3(0, 0, 0),
      turbulence: 0.0,
      enabled: true,
      behavior: this.createDefaultEmitterBehavior(),
      ...options
    };

    this.emitters.set(id, emitter);
    console.log(`[✨] Emisor ${id} creado`);
    return emitter;
  }

  private createDefaultEmitterBehavior(): EmitterBehavior {
    return {
      type: 'continuous',
      parameters: new Map(),
      update: (emitter: ParticleEmitter, deltaTime: number) => {
        // Comportamiento por defecto
      }
    };
  }

  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.get(id);
  }

  getAllEmitters(): ParticleEmitter[] {
    return Array.from(this.emitters.values());
  }

  enableEmitter(id: string): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.enabled = true;
    }
  }

  disableEmitter(id: string): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.enabled = false;
    }
  }

  update(deltaTime: number): void {
    if (!this.isInitialized) return;

    // Actualizar emisores
    for (const emitter of this.emitters.values()) {
      if (emitter.enabled) {
        this.updateEmitter(emitter, deltaTime);
      }
    }

    // Actualizar partículas
    for (const particle of this.particles.values()) {
      if (particle.active) {
        this.updateParticle(particle, deltaTime);
      }
    }

    // Limpiar partículas muertas
    if (this.config.autoCleanup) {
      this.cleanupDeadParticles();
    }

    // Actualizar buffers de GPU
    this.updateGPUBuffers();
  }

  private updateEmitter(emitter: ParticleEmitter, deltaTime: number): void {
    // Actualizar comportamiento del emisor
    emitter.behavior.update(emitter, deltaTime);

    // Emitir partículas
    const particlesToEmit = Math.floor(emitter.rate * deltaTime) + emitter.burst;
    emitter.burst = 0; // Reset burst

    for (let i = 0; i < particlesToEmit; i++) {
      if (this.getActiveParticleCount() < this.config.maxParticles) {
        this.emitParticle(emitter);
      }
    }
  }

  private emitParticle(emitter: ParticleEmitter): void {
    // Obtener partícula del pool
    const particle = this.getParticleFromPool();
    if (!particle) return;

    // Configurar partícula
    particle.position.copy(emitter.position);
    particle.emitterId = emitter.id;
    particle.maxLife = emitter.particleLife;
    particle.life = 1.0;
    particle.age = 0;
    particle.size = emitter.particleSize;
    particle.color.copy(emitter.particleColor);
    particle.active = true;

    // Calcular velocidad inicial
    const direction = emitter.direction.clone();
    const spread = emitter.spread;
    
    // Aplicar dispersión
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.z += (Math.random() - 0.5) * spread;
    direction.normalize();

    // Velocidad base
    const speed = 1.0 + Math.random() * 2.0;
    particle.velocity.copy(direction.multiplyScalar(speed));

    // Aceleración (gravedad + viento)
    particle.acceleration.copy(emitter.gravity).add(emitter.wind);

    // Agregar turbulencia
    if (emitter.turbulence > 0) {
      particle.acceleration.x += (Math.random() - 0.5) * emitter.turbulence;
      particle.acceleration.y += (Math.random() - 0.5) * emitter.turbulence;
      particle.acceleration.z += (Math.random() - 0.5) * emitter.turbulence;
    }

    // Agregar a la colección activa
    this.particles.set(particle.id, particle);
  }

  private getParticleFromPool(): Particle | null {
    for (const particle of this.particlePool) {
      if (!particle.active) {
        return particle;
      }
    }
    return null;
  }

  private updateParticle(particle: Particle, deltaTime: number): void {
    // Actualizar comportamiento de la partícula
    particle.behavior.update(particle, deltaTime);

    // Verificar si la partícula ha muerto
    if (particle.life <= 0 || particle.age >= particle.maxLife) {
      particle.active = false;
      this.particles.delete(particle.id);
    }
  }

  private cleanupDeadParticles(): void {
    const deadParticles: string[] = [];
    
    for (const [id, particle] of this.particles.entries()) {
      if (!particle.active || particle.life <= 0) {
        deadParticles.push(id);
      }
    }
    
    for (const id of deadParticles) {
      this.particles.delete(id);
    }
  }

  private updateGPUBuffers(): void {
    if (!this.positions || !this.colors || !this.sizes) return;

    let index = 0;
    for (const particle of this.particles.values()) {
      if (particle.active) {
        // Posición
        this.positions[index * 3] = particle.position.x;
        this.positions[index * 3 + 1] = particle.position.y;
        this.positions[index * 3 + 2] = particle.position.z;

        // Color
        this.colors[index * 3] = particle.color.r;
        this.colors[index * 3 + 1] = particle.color.g;
        this.colors[index * 3 + 2] = particle.color.b;

        // Tamaño
        this.sizes[index] = particle.size * particle.life;

        index++;
      }
    }

    // Actualizar atributos de la geometría
    if (this.geometry) {
      const positionAttribute = this.geometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttribute = this.geometry.getAttribute('color') as THREE.BufferAttribute;
      const sizeAttribute = this.geometry.getAttribute('size') as THREE.BufferAttribute;

      positionAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
      sizeAttribute.needsUpdate = true;
    }
  }

  getActiveParticleCount(): number {
    return this.particles.size;
  }

  getTotalParticleCount(): number {
    return this.particlePool.length;
  }

  getMesh(): THREE.Points | null {
    return this.mesh;
  }

  getStats(): any {
    return {
      activeParticles: this.getActiveParticleCount(),
      totalParticles: this.getTotalParticleCount(),
      activeEmitters: Array.from(this.emitters.values()).filter(e => e.enabled).length,
      totalEmitters: this.emitters.size,
      memoryUsage: this.getActiveParticleCount() * 64, // Estimación en bytes
      performance: {
        updateTime: 0,
        renderTime: 0
      }
    };
  }

  async cleanup(): Promise<void> {
    console.log('[✨] Limpiando ParticleSystem...');
    
    this.particles.clear();
    this.emitters.clear();
    this.particlePool = [];
    
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.mesh) {
      this.mesh.removeFromParent();
    }
    
    this.isInitialized = false;
    console.log('[✅] ParticleSystem limpiado correctamente');
  }
}

export default ParticleSystem; 