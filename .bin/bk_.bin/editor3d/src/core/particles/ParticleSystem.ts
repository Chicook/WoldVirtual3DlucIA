import { ParticleEmitter } from './ParticleEmitter';
import { Particle, ParticleType } from './Particle';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3 } from '../scene/math/Vector3';

/**
 * Tipos de efectos de partículas predefinidos
 */
export enum ParticleEffectType {
  FIRE = 'fire',
  SMOKE = 'smoke',
  EXPLOSION = 'explosion',
  SPARKLE = 'sparkle',
  MAGIC = 'magic',
  WATER_SPLASH = 'water_splash',
  DUST = 'dust',
  RAIN = 'rain',
  SNOW = 'snow',
  CUSTOM = 'custom'
}

/**
 * Configuración del sistema de partículas
 */
export interface ParticleSystemConfig {
  maxParticles: number;
  maxEmitters: number;
  enableGPU: boolean;
  enableInstancing: boolean;
  enableSorting: boolean;
  enableCulling: boolean;
  updateRate: number; // Hz
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Sistema de partículas enterprise
 */
export class ParticleSystem extends EventEmitter {
  private static readonly logger = new Logger('ParticleSystem');
  
  // Configuración
  public config: ParticleSystemConfig = {
    maxParticles: 10000,
    maxEmitters: 100,
    enableGPU: true,
    enableInstancing: true,
    enableSorting: true,
    enableCulling: true,
    updateRate: 60,
    quality: 'high'
  };
  
  // Emisores
  private emitters: Map<string, ParticleEmitter> = new Map();
  
  // Partículas activas
  private activeParticles: Particle[] = [];
  
  // Estados
  private _enabled: boolean = true;
  private _time: number = 0.0;
  private _deltaTime: number = 0.0;
  private _lastUpdateTime: number = 0.0;
  
  // Estadísticas
  private _stats = {
    totalParticles: 0,
    activeParticles: 0,
    totalEmitters: 0,
    activeEmitters: 0,
    updateTime: 0,
    renderTime: 0
  };
  
  constructor() {
    super();
    this.initialize();
  }
  
  /**
   * Inicializa el sistema de partículas
   */
  private initialize(): void {
    ParticleSystem.logger.info('Sistema de partículas inicializado');
    this.emit('initialized', this);
  }
  
  /**
   * Actualiza el sistema de partículas
   */
  public update(currentTime: number): void {
    if (!this._enabled) {
      return;
    }
    
    // Calcular delta time
    this._deltaTime = currentTime - this._lastUpdateTime;
    this._time = currentTime;
    
    // Limitar delta time para evitar saltos grandes
    const maxDeltaTime = 1.0 / 30.0; // 30 FPS mínimo
    this._deltaTime = Math.min(this._deltaTime, maxDeltaTime);
    
    const startTime = performance.now();
    
    // Actualizar emisores
    this.updateEmitters();
    
    // Actualizar partículas
    this.updateParticles();
    
    // Limpiar partículas muertas
    this.cleanupDeadParticles();
    
    // Actualizar estadísticas
    this.updateStats();
    
    const endTime = performance.now();
    this._stats.updateTime = endTime - startTime;
    
    this.emit('updated', { system: this, deltaTime: this._deltaTime });
  }
  
  /**
   * Actualiza todos los emisores
   */
  private updateEmitters(): void {
    for (const emitter of this.emitters.values()) {
      if (emitter.enabled) {
        emitter.update(this._deltaTime);
        
        // Agregar partículas nuevas a la lista activa
        const newParticles = emitter.getAliveParticles();
        for (const particle of newParticles) {
          if (!this.activeParticles.includes(particle)) {
            this.activeParticles.push(particle);
          }
        }
      }
    }
  }
  
  /**
   * Actualiza todas las partículas activas
   */
  private updateParticles(): void {
    for (const particle of this.activeParticles) {
      if (particle.isAlive()) {
        particle.update(this._deltaTime);
      }
    }
  }
  
  /**
   * Limpia las partículas muertas
   */
  private cleanupDeadParticles(): void {
    this.activeParticles = this.activeParticles.filter(particle => particle.isAlive());
  }
  
  /**
   * Actualiza las estadísticas del sistema
   */
  private updateStats(): void {
    this._stats.totalParticles = this.activeParticles.length;
    this._stats.activeParticles = this.activeParticles.filter(p => p.isAlive()).length;
    this._stats.totalEmitters = this.emitters.size;
    this._stats.activeEmitters = Array.from(this.emitters.values()).filter(e => e.enabled).length;
  }
  
  /**
   * Agrega un emisor al sistema
   */
  public addEmitter(emitter: ParticleEmitter): void {
    if (this.emitters.has(emitter.id)) {
      ParticleSystem.logger.warn('Emisor ya existe:', emitter.id);
      return;
    }
    
    if (this.emitters.size >= this.config.maxEmitters) {
      ParticleSystem.logger.warn('Límite de emisores alcanzado:', this.config.maxEmitters);
      return;
    }
    
    this.emitters.set(emitter.id, emitter);
    
    // Configurar eventos del emisor
    emitter.on('particleEmitted', (data) => {
      this.emit('particleEmitted', data);
    });
    
    ParticleSystem.logger.info('Emisor agregado:', emitter.name);
    this.emit('emitterAdded', { system: this, emitter });
  }
  
  /**
   * Remueve un emisor del sistema
   */
  public removeEmitter(emitterId: string): boolean {
    const emitter = this.emitters.get(emitterId);
    if (!emitter) {
      return false;
    }
    
    this.emitters.delete(emitterId);
    
    // Remover partículas del emisor
    const emitterParticles = emitter.getAllParticles();
    this.activeParticles = this.activeParticles.filter(p => !emitterParticles.includes(p));
    
    ParticleSystem.logger.info('Emisor removido:', emitter.name);
    this.emit('emitterRemoved', { system: this, emitter });
    
    return true;
  }
  
  /**
   * Obtiene un emisor por ID
   */
  public getEmitter(emitterId: string): ParticleEmitter | undefined {
    return this.emitters.get(emitterId);
  }
  
  /**
   * Obtiene todos los emisores
   */
  public getEmitters(): ParticleEmitter[] {
    return Array.from(this.emitters.values());
  }
  
  /**
   * Obtiene todos los emisores activos
   */
  public getActiveEmitters(): ParticleEmitter[] {
    return Array.from(this.emitters.values()).filter(emitter => emitter.enabled);
  }
  
  /**
   * Obtiene todas las partículas activas
   */
  public getActiveParticles(): Particle[] {
    return this.activeParticles.filter(particle => particle.isAlive());
  }
  
  /**
   * Crea un emisor de fuego
   */
  public createFireEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Fire Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'cone';
    emitter.emissionPattern = 'continuous';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de fuego
    emitter.emission.rate = 50;
    emitter.life.minAge = 0.5;
    emitter.life.maxAge = 1.5;
    emitter.velocity.speed = 2.0;
    emitter.velocity.direction = new Vector3(0, 1, 0);
    emitter.velocity.directionVariation = 0.3;
    emitter.size.minSize = 0.1;
    emitter.size.maxSize = 0.5;
    emitter.color.startColor = new Vector3(1, 0.5, 0);
    emitter.color.endColor = new Vector3(1, 0, 0);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor de humo
   */
  public createSmokeEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Smoke Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'sphere';
    emitter.emissionPattern = 'continuous';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de humo
    emitter.emission.rate = 20;
    emitter.life.minAge = 2.0;
    emitter.life.maxAge = 4.0;
    emitter.velocity.speed = 1.0;
    emitter.velocity.direction = new Vector3(0, 1, 0);
    emitter.velocity.directionVariation = 0.2;
    emitter.size.minSize = 0.2;
    emitter.size.maxSize = 1.0;
    emitter.size.sizeOverLife = true;
    emitter.color.startColor = new Vector3(0.3, 0.3, 0.3);
    emitter.color.endColor = new Vector3(0.1, 0.1, 0.1);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor de explosión
   */
  public createExplosionEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Explosion Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'sphere';
    emitter.emissionPattern = 'burst';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de explosión
    emitter.emission.burstCount = 100;
    emitter.emission.burstInterval = 999999; // Una sola explosión
    emitter.life.minAge = 0.5;
    emitter.life.maxAge = 2.0;
    emitter.velocity.speed = 5.0;
    emitter.velocity.direction = new Vector3(0, 0, 0);
    emitter.velocity.directionVariation = Math.PI * 2; // Todas las direcciones
    emitter.size.minSize = 0.05;
    emitter.size.maxSize = 0.2;
    emitter.color.startColor = new Vector3(1, 1, 0);
    emitter.color.endColor = new Vector3(1, 0, 0);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor de chispas
   */
  public createSparkleEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Sparkle Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'point';
    emitter.emissionPattern = 'pulse';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de chispas
    emitter.emission.rate = 10;
    emitter.emission.pulseDuration = 0.1;
    emitter.emission.pulseInterval = 0.5;
    emitter.life.minAge = 1.0;
    emitter.life.maxAge = 2.0;
    emitter.velocity.speed = 1.0;
    emitter.velocity.direction = new Vector3(0, 1, 0);
    emitter.velocity.directionVariation = 0.5;
    emitter.size.minSize = 0.02;
    emitter.size.maxSize = 0.05;
    emitter.color.startColor = new Vector3(1, 1, 1);
    emitter.color.endColor = new Vector3(1, 1, 0);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor de magia
   */
  public createMagicEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Magic Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'sphere';
    emitter.emissionPattern = 'continuous';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de magia
    emitter.emission.rate = 15;
    emitter.life.minAge = 2.0;
    emitter.life.maxAge = 3.0;
    emitter.velocity.speed = 0.5;
    emitter.velocity.direction = new Vector3(0, 0, 0);
    emitter.velocity.directionVariation = Math.PI * 2;
    emitter.size.minSize = 0.1;
    emitter.size.maxSize = 0.3;
    emitter.size.sizeOverLife = true;
    emitter.color.startColor = new Vector3(0.5, 0, 1);
    emitter.color.endColor = new Vector3(1, 0, 1);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor de lluvia
   */
  public createRainEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Rain Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'plane';
    emitter.emissionPattern = 'continuous';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de lluvia
    emitter.emission.rate = 200;
    emitter.life.minAge = 3.0;
    emitter.life.maxAge = 5.0;
    emitter.velocity.speed = 10.0;
    emitter.velocity.direction = new Vector3(0, -1, 0);
    emitter.velocity.directionVariation = 0.1;
    emitter.size.minSize = 0.01;
    emitter.size.maxSize = 0.02;
    emitter.color.startColor = new Vector3(0.5, 0.5, 1);
    emitter.color.endColor = new Vector3(0.3, 0.3, 0.8);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor de nieve
   */
  public createSnowEmitter(id: string, position: Vector3): ParticleEmitter {
    const emitter = new ParticleEmitter(id, 'Snow Emitter');
    
    emitter.setPosition(position);
    emitter.emitterType = 'plane';
    emitter.emissionPattern = 'continuous';
    emitter.particleType = ParticleType.BILLBOARD;
    
    // Configuración de nieve
    emitter.emission.rate = 100;
    emitter.life.minAge = 5.0;
    emitter.life.maxAge = 8.0;
    emitter.velocity.speed = 2.0;
    emitter.velocity.direction = new Vector3(0, -1, 0);
    emitter.velocity.directionVariation = 0.3;
    emitter.size.minSize = 0.02;
    emitter.size.maxSize = 0.05;
    emitter.color.startColor = new Vector3(1, 1, 1);
    emitter.color.endColor = new Vector3(0.9, 0.9, 0.9);
    emitter.color.colorOverLife = true;
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Crea un emisor personalizado
   */
  public createCustomEmitter(id: string, config: any): ParticleEmitter {
    const emitter = new ParticleEmitter(id, config.name || 'Custom Emitter');
    
    // Aplicar configuración personalizada
    if (config.position) emitter.setPosition(config.position);
    if (config.emitterType) emitter.emitterType = config.emitterType;
    if (config.emissionPattern) emitter.emissionPattern = config.emissionPattern;
    if (config.particleType) emitter.particleType = config.particleType;
    if (config.emission) Object.assign(emitter.emission, config.emission);
    if (config.velocity) Object.assign(emitter.velocity, config.velocity);
    if (config.life) Object.assign(emitter.life, config.life);
    if (config.size) Object.assign(emitter.size, config.size);
    if (config.color) Object.assign(emitter.color, config.color);
    
    this.addEmitter(emitter);
    return emitter;
  }
  
  /**
   * Habilita/deshabilita el sistema
   */
  public setEnabled(enabled: boolean): this {
    this._enabled = enabled;
    this.emit('enabledChanged', { system: this, enabled });
    return this;
  }
  
  /**
   * Limpia todas las partículas
   */
  public clearAllParticles(): void {
    this.activeParticles = [];
    for (const emitter of this.emitters.values()) {
      emitter.clearParticles();
    }
    this.emit('particlesCleared', { system: this });
  }
  
  /**
   * Obtiene estadísticas del sistema
   */
  public getStats(): any {
    return {
      ...this._stats,
      time: this._time,
      deltaTime: this._deltaTime,
      enabled: this._enabled,
      config: { ...this.config }
    };
  }
  
  /**
   * Aplica fuerzas globales a todas las partículas
   */
  public applyGlobalForce(force: Vector3): void {
    for (const particle of this.activeParticles) {
      if (particle.isAlive()) {
        particle.applyForce(force);
      }
    }
  }
  
  /**
   * Aplica campos de fuerza a partículas en un área
   */
  public applyForceField(center: Vector3, radius: number, force: Vector3, falloff: number = 1.0): void {
    for (const particle of this.activeParticles) {
      if (particle.isAlive()) {
        const distance = particle.position.distanceTo(center);
        if (distance <= radius) {
          const factor = Math.pow(1.0 - distance / radius, falloff);
          const localForce = force.clone().multiplyScalar(factor);
          particle.applyForce(localForce);
        }
      }
    }
  }
  
  /**
   * Serializa el sistema de partículas
   */
  public serialize(): any {
    return {
      config: { ...this.config },
      enabled: this._enabled,
      time: this._time,
      emitters: Array.from(this.emitters.values()).map(emitter => emitter.serialize()),
      stats: { ...this._stats }
    };
  }
  
  /**
   * Deserializa el sistema de partículas
   */
  public static deserialize(data: any): ParticleSystem {
    const system = new ParticleSystem();
    
    system.config = { ...data.config };
    system._enabled = data.enabled;
    system._time = data.time;
    
    // Deserializar emisores
    for (const emitterData of data.emitters) {
      const emitter = ParticleEmitter.deserialize(emitterData);
      system.addEmitter(emitter);
    }
    
    return system;
  }
} 