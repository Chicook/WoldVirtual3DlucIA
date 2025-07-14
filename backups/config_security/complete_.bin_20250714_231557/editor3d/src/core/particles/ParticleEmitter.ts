import { Particle, ParticleType } from './Particle';
import { Vector3 } from '../scene/math/Vector3';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

/**
 * Tipos de emisores
 */
export enum EmitterType {
  POINT = 'point',
  LINE = 'line',
  PLANE = 'plane',
  SPHERE = 'sphere',
  BOX = 'box',
  CYLINDER = 'cylinder',
  CONE = 'cone',
  CUSTOM = 'custom'
}

/**
 * Patrones de emisión
 */
export enum EmissionPattern {
  CONTINUOUS = 'continuous',
  BURST = 'burst',
  PULSE = 'pulse',
  RANDOM = 'random'
}

/**
 * Configuración de emisión
 */
export interface EmissionConfig {
  rate: number; // Partículas por segundo
  burstCount: number; // Partículas por burst
  burstInterval: number; // Intervalo entre bursts
  pulseDuration: number; // Duración del pulso
  pulseInterval: number; // Intervalo entre pulsos
  randomSeed: number; // Semilla para aleatoriedad
}

/**
 * Configuración de velocidad
 */
export interface VelocityConfig {
  speed: number;
  speedVariation: number;
  direction: Vector3;
  directionVariation: number; // En radianes
  angularSpeed: number;
  angularSpeedVariation: number;
}

/**
 * Configuración de vida
 */
export interface LifeConfig {
  minAge: number;
  maxAge: number;
  ageVariation: number;
}

/**
 * Configuración de tamaño
 */
export interface SizeConfig {
  minSize: number;
  maxSize: number;
  sizeVariation: number;
  sizeOverLife: boolean;
}

/**
 * Configuración de color
 */
export interface ColorConfig {
  startColor: Vector3;
  endColor: Vector3;
  colorVariation: number;
  colorOverLife: boolean;
}

/**
 * Emisor de partículas
 */
export class ParticleEmitter extends EventEmitter {
  private static readonly logger = new Logger('ParticleEmitter');
  
  // Identificación
  public readonly id: string;
  public name: string;
  
  // Configuración básica
  public enabled: boolean = true;
  public emitterType: EmitterType = EmitterType.POINT;
  public emissionPattern: EmissionPattern = EmissionPattern.CONTINUOUS;
  public particleType: ParticleType = ParticleType.BILLBOARD;
  
  // Posición y transformación
  public position: Vector3 = new Vector3(0, 0, 0);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  
  // Configuraciones
  public emission: EmissionConfig = {
    rate: 10,
    burstCount: 5,
    burstInterval: 1.0,
    pulseDuration: 0.5,
    pulseInterval: 2.0,
    randomSeed: 12345
  };
  
  public velocity: VelocityConfig = {
    speed: 1.0,
    speedVariation: 0.2,
    direction: new Vector3(0, 1, 0),
    directionVariation: 0.5,
    angularSpeed: 0.0,
    angularSpeedVariation: 0.0
  };
  
  public life: LifeConfig = {
    minAge: 1.0,
    maxAge: 3.0,
    ageVariation: 0.5
  };
  
  public size: SizeConfig = {
    minSize: 0.1,
    maxSize: 1.0,
    sizeVariation: 0.2,
    sizeOverLife: true
  };
  
  public color: ColorConfig = {
    startColor: new Vector3(1, 1, 1),
    endColor: new Vector3(1, 0, 0),
    colorVariation: 0.1,
    colorOverLife: true
  };
  
  // Estados internos
  private _time: number = 0.0;
  private _lastEmissionTime: number = 0.0;
  private _lastBurstTime: number = 0.0;
  private _lastPulseTime: number = 0.0;
  private _pulseActive: boolean = false;
  private _random: any; // Generador de números aleatorios
  
  // Partículas emitidas
  private _emittedParticles: Particle[] = [];
  private _maxParticles: number = 1000;
  
  constructor(id: string, name: string = '') {
    super();
    this.id = id;
    this.name = name || `emitter_${id}`;
    this.initializeRandom();
  }
  
  /**
   * Inicializa el generador de números aleatorios
   */
  private initializeRandom(): void {
    // Implementación básica de generador aleatorio
    this._random = {
      seed: this.emission.randomSeed,
      next: function() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
      }
    };
  }
  
  /**
   * Actualiza el emisor
   */
  public update(deltaTime: number): void {
    if (!this.enabled) {
      return;
    }
    
    this._time += deltaTime;
    
    // Determinar si debe emitir partículas
    const shouldEmit = this.shouldEmitParticles();
    
    if (shouldEmit) {
      const count = this.getEmissionCount();
      for (let i = 0; i < count; i++) {
        this.emitParticle();
      }
    }
    
    // Actualizar partículas emitidas
    this.updateEmittedParticles(deltaTime);
    
    // Limpiar partículas muertas
    this.cleanupDeadParticles();
  }
  
  /**
   * Determina si debe emitir partículas
   */
  private shouldEmitParticles(): boolean {
    switch (this.emissionPattern) {
      case EmissionPattern.CONTINUOUS:
        return this._time - this._lastEmissionTime >= 1.0 / this.emission.rate;
        
      case EmissionPattern.BURST:
        return this._time - this._lastBurstTime >= this.emission.burstInterval;
        
      case EmissionPattern.PULSE:
        if (this._time - this._lastPulseTime >= this.emission.pulseInterval) {
          this._pulseActive = true;
          this._lastPulseTime = this._time;
        }
        
        if (this._pulseActive) {
          if (this._time - this._lastPulseTime >= this.emission.pulseDuration) {
            this._pulseActive = false;
            return false;
          }
          return this._time - this._lastEmissionTime >= 1.0 / this.emission.rate;
        }
        return false;
        
      case EmissionPattern.RANDOM:
        return this._random.next() < this.emission.rate * 0.01; // Probabilidad basada en rate
        
      default:
        return false;
    }
  }
  
  /**
   * Obtiene el número de partículas a emitir
   */
  private getEmissionCount(): number {
    switch (this.emissionPattern) {
      case EmissionPattern.BURST:
        return this.emission.burstCount;
      case EmissionPattern.CONTINUOUS:
      case EmissionPattern.PULSE:
      case EmissionPattern.RANDOM:
        return 1;
      default:
        return 1;
    }
  }
  
  /**
   * Emite una partícula
   */
  private emitParticle(): void {
    if (this._emittedParticles.length >= this._maxParticles) {
      return;
    }
    
    const particle = new Particle(`${this.id}_particle_${Date.now()}_${Math.random()}`, '');
    particle.particleType = this.particleType;
    
    // Configurar posición inicial
    const spawnPosition = this.getSpawnPosition();
    particle.setPosition(spawnPosition);
    
    // Configurar velocidad inicial
    const velocity = this.getInitialVelocity();
    particle.setVelocity(velocity);
    
    // Configurar vida
    const maxAge = this.getRandomValue(this.life.minAge, this.life.maxAge, this.life.ageVariation);
    particle.setMaxAge(maxAge);
    
    // Configurar tamaño
    const size = this.getRandomValue(this.size.minSize, this.size.maxSize, this.size.sizeVariation);
    particle.setSize(size);
    
    // Configurar color
    const color = this.getInitialColor();
    particle.setColor(color);
    
    // Configurar masa
    particle.setMass(1.0);
    
    // Configurar arrastre
    particle.setDrag(0.1);
    
    // Inicializar partícula
    particle.initialize();
    
    // Agregar a la lista
    this._emittedParticles.push(particle);
    
    // Actualizar tiempo de última emisión
    this._lastEmissionTime = this._time;
    
    this.emit('particleEmitted', { emitter: this, particle });
  }
  
  /**
   * Obtiene la posición de spawn de una partícula
   */
  private getSpawnPosition(): Vector3 {
    const basePosition = this.position.clone();
    
    switch (this.emitterType) {
      case EmitterType.POINT:
        return basePosition;
        
      case EmitterType.LINE:
        const lineLength = this.scale.x;
        const t = this._random.next() * 2 - 1; // -1 a 1
        return basePosition.add(new Vector3(t * lineLength * 0.5, 0, 0));
        
      case EmitterType.PLANE:
        const planeWidth = this.scale.x;
        const planeHeight = this.scale.y;
        const x = (this._random.next() * 2 - 1) * planeWidth * 0.5;
        const y = (this._random.next() * 2 - 1) * planeHeight * 0.5;
        return basePosition.add(new Vector3(x, y, 0));
        
      case EmitterType.SPHERE:
        const sphereRadius = this.scale.x * 0.5;
        const sphereTheta = this._random.next() * Math.PI * 2;
        const spherePhi = Math.acos(2 * this._random.next() - 1);
        const sphereX = sphereRadius * Math.sin(spherePhi) * Math.cos(sphereTheta);
        const sphereY = sphereRadius * Math.sin(spherePhi) * Math.sin(sphereTheta);
        const sphereZ = sphereRadius * Math.cos(spherePhi);
        return basePosition.add(new Vector3(sphereX, sphereY, sphereZ));
        
      case EmitterType.BOX:
        const boxWidth = this.scale.x;
        const boxHeight = this.scale.y;
        const boxDepth = this.scale.z;
        const bx = (this._random.next() * 2 - 1) * boxWidth * 0.5;
        const by = (this._random.next() * 2 - 1) * boxHeight * 0.5;
        const bz = (this._random.next() * 2 - 1) * boxDepth * 0.5;
        return basePosition.add(new Vector3(bx, by, bz));
        
      case EmitterType.CYLINDER:
        const cylinderRadius = this.scale.x * 0.5;
        const cylinderHeight = this.scale.y;
        const angle = this._random.next() * Math.PI * 2;
        const r = cylinderRadius * Math.sqrt(this._random.next());
        const h = (this._random.next() * 2 - 1) * cylinderHeight * 0.5;
        const cx = r * Math.cos(angle);
        const cz = r * Math.sin(angle);
        return basePosition.add(new Vector3(cx, h, cz));
        
      case EmitterType.CONE:
        const coneRadius = this.scale.x * 0.5;
        const coneHeight = this.scale.y;
        const coneAngle = this._random.next() * Math.PI * 2;
        const coneR = coneRadius * Math.sqrt(this._random.next());
        const coneH = this._random.next() * coneHeight;
        const conex = coneR * Math.cos(coneAngle);
        const conez = coneR * Math.sin(coneAngle);
        return basePosition.add(new Vector3(conex, coneH, conez));
        
      default:
        return basePosition;
    }
  }
  
  /**
   * Obtiene la velocidad inicial de una partícula
   */
  private getInitialVelocity(): Vector3 {
    const speed = this.getRandomValue(this.velocity.speed, this.velocity.speed, this.velocity.speedVariation);
    
    // Dirección base
    let direction = this.velocity.direction.clone().normalize();
    
    // Aplicar variación de dirección
    if (this.velocity.directionVariation > 0) {
      const variation = this.velocity.directionVariation;
      const theta = (this._random.next() * 2 - 1) * variation;
      const phi = (this._random.next() * 2 - 1) * variation;
      
      // Rotar la dirección
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      
      const newX = direction.x * cosTheta - direction.y * sinTheta;
      const newY = direction.x * sinTheta + direction.y * cosTheta;
      const newZ = direction.z * cosPhi - newX * sinPhi;
      
      direction.set(newX * cosPhi + newZ * sinPhi, newY, newZ);
    }
    
    return direction.multiplyScalar(speed);
  }
  
  /**
   * Obtiene el color inicial de una partícula
   */
  private getInitialColor(): Vector3 {
    const color = this.color.startColor.clone();
    
    if (this.color.colorVariation > 0) {
      const variation = this.color.colorVariation;
      color.x += (this._random.next() * 2 - 1) * variation;
      color.y += (this._random.next() * 2 - 1) * variation;
      color.z += (this._random.next() * 2 - 1) * variation;
      
      // Clamp a [0, 1]
      color.x = Math.max(0, Math.min(1, color.x));
      color.y = Math.max(0, Math.min(1, color.y));
      color.z = Math.max(0, Math.min(1, color.z));
    }
    
    return color;
  }
  
  /**
   * Obtiene un valor aleatorio con variación
   */
  private getRandomValue(min: number, max: number, variation: number): number {
    const baseValue = min + (max - min) * this._random.next();
    const variationAmount = (this._random.next() * 2 - 1) * variation;
    return baseValue + variationAmount;
  }
  
  /**
   * Actualiza las partículas emitidas
   */
  private updateEmittedParticles(deltaTime: number): void {
    for (const particle of this._emittedParticles) {
      if (particle.isAlive()) {
        particle.update(deltaTime);
      }
    }
  }
  
  /**
   * Limpia las partículas muertas
   */
  private cleanupDeadParticles(): void {
    this._emittedParticles = this._emittedParticles.filter(particle => particle.isAlive());
  }
  
  /**
   * Obtiene todas las partículas vivas
   */
  public getAliveParticles(): Particle[] {
    return this._emittedParticles.filter(particle => particle.isAlive());
  }
  
  /**
   * Obtiene todas las partículas
   */
  public getAllParticles(): Particle[] {
    return [...this._emittedParticles];
  }
  
  /**
   * Establece la posición del emisor
   */
  public setPosition(position: Vector3): this {
    this.position = position.clone();
    this.emit('positionChanged', { emitter: this, position });
    return this;
  }
  
  /**
   * Establece la rotación del emisor
   */
  public setRotation(rotation: Vector3): this {
    this.rotation = rotation.clone();
    this.emit('rotationChanged', { emitter: this, rotation });
    return this;
  }
  
  /**
   * Establece la escala del emisor
   */
  public setScale(scale: Vector3): this {
    this.scale = scale.clone();
    this.emit('scaleChanged', { emitter: this, scale });
    return this;
  }
  
  /**
   * Establece la tasa de emisión
   */
  public setEmissionRate(rate: number): this {
    this.emission.rate = Math.max(0, rate);
    this.emit('emissionRateChanged', { emitter: this, rate });
    return this;
  }
  
  /**
   * Establece el número máximo de partículas
   */
  public setMaxParticles(maxParticles: number): this {
    this._maxParticles = Math.max(1, maxParticles);
    this.emit('maxParticlesChanged', { emitter: this, maxParticles });
    return this;
  }
  
  /**
   * Habilita/deshabilita el emisor
   */
  public setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.emit('enabledChanged', { emitter: this, enabled });
    return this;
  }
  
  /**
   * Limpia todas las partículas
   */
  public clearParticles(): void {
    this._emittedParticles = [];
    this.emit('particlesCleared', { emitter: this });
  }
  
  /**
   * Obtiene estadísticas del emisor
   */
  public getStats(): any {
    const aliveCount = this.getAliveParticles().length;
    const totalCount = this._emittedParticles.length;
    
    return {
      aliveParticles: aliveCount,
      totalParticles: totalCount,
      maxParticles: this._maxParticles,
      emissionRate: this.emission.rate,
      enabled: this.enabled,
      time: this._time
    };
  }
  
  /**
   * Serializa el emisor
   */
  public serialize(): any {
    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      emitterType: this.emitterType,
      emissionPattern: this.emissionPattern,
      particleType: this.particleType,
      position: this.position.serialize(),
      rotation: this.rotation.serialize(),
      scale: this.scale.serialize(),
      emission: { ...this.emission },
      velocity: {
        ...this.velocity,
        direction: this.velocity.direction.serialize()
      },
      life: { ...this.life },
      size: { ...this.size },
      color: {
        ...this.color,
        startColor: this.color.startColor.serialize(),
        endColor: this.color.endColor.serialize()
      },
      maxParticles: this._maxParticles
    };
  }
  
  /**
   * Deserializa el emisor
   */
  public static deserialize(data: any): ParticleEmitter {
    const emitter = new ParticleEmitter(data.id, data.name);
    
    emitter.enabled = data.enabled;
    emitter.emitterType = data.emitterType;
    emitter.emissionPattern = data.emissionPattern;
    emitter.particleType = data.particleType;
    emitter.position = Vector3.deserialize(data.position);
    emitter.rotation = Vector3.deserialize(data.rotation);
    emitter.scale = Vector3.deserialize(data.scale);
    emitter.emission = { ...data.emission };
    emitter.velocity = { ...data.velocity };
    emitter.velocity.direction = Vector3.deserialize(data.velocity.direction);
    emitter.life = { ...data.life };
    emitter.size = { ...data.size };
    emitter.color = { ...data.color };
    emitter.color.startColor = Vector3.deserialize(data.color.startColor);
    emitter.color.endColor = Vector3.deserialize(data.color.endColor);
    emitter._maxParticles = data.maxParticles;
    
    return emitter;
  }
} 