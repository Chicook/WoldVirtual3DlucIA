import { Vector3 } from '../scene/math/Vector3';
import { Vector4 } from '../scene/math/Vector4';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

/**
 * Estados de una partícula
 */
export enum ParticleState {
  ALIVE = 'alive',
  DEAD = 'dead',
  SPAWNING = 'spawning',
  DYING = 'dying'
}

/**
 * Tipos de partículas
 */
export enum ParticleType {
  BILLBOARD = 'billboard',
  SPRITE = 'sprite',
  GEOMETRY = 'geometry',
  TRAIL = 'trail',
  RIBBON = 'ribbon'
}

/**
 * Propiedades físicas de una partícula
 */
export interface ParticlePhysics {
  velocity: Vector3;
  acceleration: Vector3;
  angularVelocity: Vector3;
  angularAcceleration: Vector3;
  mass: number;
  drag: number;
  angularDrag: number;
}

/**
 * Propiedades de renderizado de una partícula
 */
export interface ParticleRender {
  color: Vector4;
  size: number;
  rotation: number;
  textureIndex: number;
  blendMode: 'additive' | 'normal' | 'multiply';
  alpha: number;
}

/**
 * Propiedades de vida de una partícula
 */
export interface ParticleLife {
  age: number;
  maxAge: number;
  lifeProgress: number; // 0.0 a 1.0
  isAlive: boolean;
}

/**
 * Clase que representa una partícula individual
 */
export class Particle extends EventEmitter {
  private static readonly logger = new Logger('Particle');
  
  // Identificación
  public readonly id: string;
  public name: string;
  
  // Estado y tipo
  public state: ParticleState = ParticleState.DEAD;
  public type: ParticleType = ParticleType.BILLBOARD;
  
  // Posición y transformación
  public position: Vector3 = new Vector3(0, 0, 0);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  
  // Propiedades físicas
  public physics: ParticlePhysics = {
    velocity: new Vector3(0, 0, 0),
    acceleration: new Vector3(0, 0, 0),
    angularVelocity: new Vector3(0, 0, 0),
    angularAcceleration: new Vector3(0, 0, 0),
    mass: 1.0,
    drag: 0.1,
    angularDrag: 0.1
  };
  
  // Propiedades de renderizado
  public render: ParticleRender = {
    color: new Vector4(1, 1, 1, 1),
    size: 1.0,
    rotation: 0.0,
    textureIndex: 0,
    blendMode: 'normal',
    alpha: 1.0
  };
  
  // Propiedades de vida
  public life: ParticleLife = {
    age: 0.0,
    maxAge: 1.0,
    lifeProgress: 0.0,
    isAlive: false
  };
  
  // Propiedades personalizadas
  public customData: Map<string, number> = new Map();
  
  // Estados internos
  private _dirty: boolean = true;
  private _initialized: boolean = false;
  
  constructor(id: string, name: string = '') {
    super();
    this.id = id;
    this.name = name || `particle_${id}`;
  }
  
  /**
   * Inicializa la partícula con valores por defecto
   */
  public initialize(): void {
    this.state = ParticleState.SPAWNING;
    this.life.age = 0.0;
    this.life.lifeProgress = 0.0;
    this.life.isAlive = true;
    this._initialized = true;
    this._dirty = true;
    
    this.emit('initialized', this);
  }
  
  /**
   * Actualiza la partícula
   */
  public update(deltaTime: number): void {
    if (!this.life.isAlive) {
      return;
    }
    
    // Actualizar edad
    this.life.age += deltaTime;
    this.life.lifeProgress = Math.min(this.life.age / this.life.maxAge, 1.0);
    
    // Verificar si la partícula debe morir
    if (this.life.age >= this.life.maxAge) {
      this.die();
      return;
    }
    
    // Actualizar estado
    if (this.state === ParticleState.SPAWNING && this.life.lifeProgress > 0.1) {
      this.state = ParticleState.ALIVE;
      this.emit('spawned', this);
    }
    
    if (this.life.lifeProgress > 0.8) {
      this.state = ParticleState.DYING;
    }
    
    // Aplicar física
    this.updatePhysics(deltaTime);
    
    // Aplicar efectos de vida
    this.updateLifeEffects();
    
    this._dirty = true;
    this.emit('updated', this);
  }
  
  /**
   * Actualiza la física de la partícula
   */
  private updatePhysics(deltaTime: number): void {
    // Aplicar aceleración
    this.physics.velocity.add(this.physics.acceleration.clone().multiplyScalar(deltaTime));
    
    // Aplicar arrastre
    const dragFactor = 1.0 - this.physics.drag * deltaTime;
    this.physics.velocity.multiplyScalar(Math.max(0, dragFactor));
    
    // Actualizar posición
    this.position.add(this.physics.velocity.clone().multiplyScalar(deltaTime));
    
    // Aplicar aceleración angular
    this.physics.angularVelocity.add(this.physics.angularAcceleration.clone().multiplyScalar(deltaTime));
    
    // Aplicar arrastre angular
    const angularDragFactor = 1.0 - this.physics.angularDrag * deltaTime;
    this.physics.angularVelocity.multiplyScalar(Math.max(0, angularDragFactor));
    
    // Actualizar rotación
    this.rotation.add(this.physics.angularVelocity.clone().multiplyScalar(deltaTime));
  }
  
  /**
   * Actualiza efectos basados en la vida de la partícula
   */
  private updateLifeEffects(): void {
    const progress = this.life.lifeProgress;
    
    // Fade in/out basado en la vida
    if (progress < 0.1) {
      // Fade in
      this.render.alpha = progress / 0.1;
    } else if (progress > 0.8) {
      // Fade out
      this.render.alpha = (1.0 - progress) / 0.2;
    } else {
      this.render.alpha = 1.0;
    }
    
    // Actualizar color basado en la vida
    this.updateColorOverLife(progress);
    
    // Actualizar tamaño basado en la vida
    this.updateSizeOverLife(progress);
  }
  
  /**
   * Actualiza el color basado en la vida de la partícula
   */
  private updateColorOverLife(progress: number): void {
    // Implementación básica - puede ser sobrescrita
    if (this.customData.has('colorCurve')) {
      const curve = this.customData.get('colorCurve')!;
      // Aplicar curva de color personalizada
    }
  }
  
  /**
   * Actualiza el tamaño basado en la vida de la partícula
   */
  private updateSizeOverLife(progress: number): void {
    // Implementación básica - puede ser sobrescrita
    if (this.customData.has('sizeCurve')) {
      const curve = this.customData.get('sizeCurve')!;
      // Aplicar curva de tamaño personalizada
    }
  }
  
  /**
   * Mata la partícula
   */
  public die(): void {
    this.state = ParticleState.DEAD;
    this.life.isAlive = false;
    this._dirty = true;
    
    this.emit('died', this);
  }
  
  /**
   * Revive la partícula
   */
  public revive(): void {
    this.life.age = 0.0;
    this.life.lifeProgress = 0.0;
    this.life.isAlive = true;
    this.state = ParticleState.SPAWNING;
    this._initialized = true;
    this._dirty = true;
    
    this.emit('revived', this);
  }
  
  /**
   * Aplica una fuerza a la partícula
   */
  public applyForce(force: Vector3): void {
    if (!this.life.isAlive) return;
    
    const acceleration = force.clone().divideScalar(this.physics.mass);
    this.physics.acceleration.add(acceleration);
  }
  
  /**
   * Aplica un torque a la partícula
   */
  public applyTorque(torque: Vector3): void {
    if (!this.life.isAlive) return;
    
    const angularAcceleration = torque.clone().divideScalar(this.physics.mass);
    this.physics.angularAcceleration.add(angularAcceleration);
  }
  
  /**
   * Establece la velocidad de la partícula
   */
  public setVelocity(velocity: Vector3): this {
    this.physics.velocity = velocity.clone();
    this._dirty = true;
    return this;
  }
  
  /**
   * Establece la aceleración de la partícula
   */
  public setAcceleration(acceleration: Vector3): this {
    this.physics.acceleration = acceleration.clone();
    this._dirty = true;
    return this;
  }
  
  /**
   * Establece la posición de la partícula
   */
  public setPosition(position: Vector3): this {
    this.position = position.clone();
    this._dirty = true;
    this.emit('positionChanged', { particle: this, position });
    return this;
  }
  
  /**
   * Establece la rotación de la partícula
   */
  public setRotation(rotation: Vector3): this {
    this.rotation = rotation.clone();
    this._dirty = true;
    this.emit('rotationChanged', { particle: this, rotation });
    return this;
  }
  
  /**
   * Establece el color de la partícula
   */
  public setColor(color: Vector4): this {
    this.render.color = color.clone();
    this._dirty = true;
    this.emit('colorChanged', { particle: this, color });
    return this;
  }
  
  /**
   * Establece el tamaño de la partícula
   */
  public setSize(size: number): this {
    this.render.size = Math.max(0, size);
    this._dirty = true;
    this.emit('sizeChanged', { particle: this, size });
    return this;
  }
  
  /**
   * Establece la vida máxima de la partícula
   */
  public setMaxAge(maxAge: number): this {
    this.life.maxAge = Math.max(0.001, maxAge);
    this._dirty = true;
    return this;
  }
  
  /**
   * Establece la masa de la partícula
   */
  public setMass(mass: number): this {
    this.physics.mass = Math.max(0.001, mass);
    this._dirty = true;
    return this;
  }
  
  /**
   * Establece el arrastre de la partícula
   */
  public setDrag(drag: number): this {
    this.physics.drag = Math.max(0, Math.min(1, drag));
    this._dirty = true;
    return this;
  }
  
  /**
   * Establece datos personalizados
   */
  public setCustomData(key: string, value: number): this {
    this.customData.set(key, value);
    this._dirty = true;
    return this;
  }
  
  /**
   * Obtiene datos personalizados
   */
  public getCustomData(key: string): number | undefined {
    return this.customData.get(key);
  }
  
  /**
   * Verifica si la partícula está viva
   */
  public isAlive(): boolean {
    return this.life.isAlive;
  }
  
  /**
   * Verifica si la partícula está sucia (necesita actualización)
   */
  public isDirty(): boolean {
    return this._dirty;
  }
  
  /**
   * Marca la partícula como limpia
   */
  public markClean(): void {
    this._dirty = false;
  }
  
  /**
   * Obtiene los datos de la partícula para el GPU
   */
  public getGPUData(): Float32Array {
    return new Float32Array([
      // Posición (3)
      this.position.x, this.position.y, this.position.z,
      // Rotación (3)
      this.rotation.x, this.rotation.y, this.rotation.z,
      // Escala (3)
      this.scale.x, this.scale.y, this.scale.z,
      // Velocidad (3)
      this.physics.velocity.x, this.physics.velocity.y, this.physics.velocity.z,
      // Aceleración (3)
      this.physics.acceleration.x, this.physics.acceleration.y, this.physics.acceleration.z,
      // Color (4)
      this.render.color.x, this.render.color.y, this.render.color.z, this.render.color.w,
      // Propiedades de renderizado (4)
      this.render.size, this.render.rotation, this.render.textureIndex, this.render.alpha,
      // Propiedades de vida (3)
      this.life.age, this.life.maxAge, this.life.lifeProgress,
      // Propiedades físicas (4)
      this.physics.mass, this.physics.drag, this.physics.angularDrag, this.state === ParticleState.ALIVE ? 1.0 : 0.0
    ]);
  }
  
  /**
   * Establece los datos de la partícula desde el GPU
   */
  public setGPUData(data: Float32Array): void {
    if (data.length < 30) return;
    
    let index = 0;
    
    // Posición
    this.position.set(data[index++], data[index++], data[index++]);
    
    // Rotación
    this.rotation.set(data[index++], data[index++], data[index++]);
    
    // Escala
    this.scale.set(data[index++], data[index++], data[index++]);
    
    // Velocidad
    this.physics.velocity.set(data[index++], data[index++], data[index++]);
    
    // Aceleración
    this.physics.acceleration.set(data[index++], data[index++], data[index++]);
    
    // Color
    this.render.color.set(data[index++], data[index++], data[index++], data[index++]);
    
    // Propiedades de renderizado
    this.render.size = data[index++];
    this.render.rotation = data[index++];
    this.render.textureIndex = data[index++];
    this.render.alpha = data[index++];
    
    // Propiedades de vida
    this.life.age = data[index++];
    this.life.maxAge = data[index++];
    this.life.lifeProgress = data[index++];
    
    // Propiedades físicas
    this.physics.mass = data[index++];
    this.physics.drag = data[index++];
    this.physics.angularDrag = data[index++];
    
    const isAlive = data[index++] > 0.5;
    this.life.isAlive = isAlive;
    this.state = isAlive ? ParticleState.ALIVE : ParticleState.DEAD;
  }
  
  /**
   * Clona la partícula
   */
  public clone(): Particle {
    const cloned = new Particle(this.id, this.name);
    
    cloned.state = this.state;
    cloned.type = this.type;
    cloned.position = this.position.clone();
    cloned.rotation = this.rotation.clone();
    cloned.scale = this.scale.clone();
    cloned.physics = { ...this.physics };
    cloned.physics.velocity = this.physics.velocity.clone();
    cloned.physics.acceleration = this.physics.acceleration.clone();
    cloned.physics.angularVelocity = this.physics.angularVelocity.clone();
    cloned.physics.angularAcceleration = this.physics.angularAcceleration.clone();
    cloned.render = { ...this.render };
    cloned.render.color = this.render.color.clone();
    cloned.life = { ...this.life };
    cloned.customData = new Map(this.customData);
    
    return cloned;
  }
  
  /**
   * Serializa la partícula
   */
  public serialize(): any {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      type: this.type,
      position: this.position.serialize(),
      rotation: this.rotation.serialize(),
      scale: this.scale.serialize(),
      physics: {
        velocity: this.physics.velocity.serialize(),
        acceleration: this.physics.acceleration.serialize(),
        angularVelocity: this.physics.angularVelocity.serialize(),
        angularAcceleration: this.physics.angularAcceleration.serialize(),
        mass: this.physics.mass,
        drag: this.physics.drag,
        angularDrag: this.physics.angularDrag
      },
      render: {
        color: this.render.color.serialize(),
        size: this.render.size,
        rotation: this.render.rotation,
        textureIndex: this.render.textureIndex,
        blendMode: this.render.blendMode,
        alpha: this.render.alpha
      },
      life: {
        age: this.life.age,
        maxAge: this.life.maxAge,
        lifeProgress: this.life.lifeProgress,
        isAlive: this.life.isAlive
      },
      customData: Array.from(this.customData.entries())
    };
  }
  
  /**
   * Deserializa la partícula
   */
  public static deserialize(data: any): Particle {
    const particle = new Particle(data.id, data.name);
    
    particle.state = data.state;
    particle.type = data.type;
    particle.position = Vector3.deserialize(data.position);
    particle.rotation = Vector3.deserialize(data.rotation);
    particle.scale = Vector3.deserialize(data.scale);
    
    particle.physics.velocity = Vector3.deserialize(data.physics.velocity);
    particle.physics.acceleration = Vector3.deserialize(data.physics.acceleration);
    particle.physics.angularVelocity = Vector3.deserialize(data.physics.angularVelocity);
    particle.physics.angularAcceleration = Vector3.deserialize(data.physics.angularAcceleration);
    particle.physics.mass = data.physics.mass;
    particle.physics.drag = data.physics.drag;
    particle.physics.angularDrag = data.physics.angularDrag;
    
    particle.render.color = Vector4.deserialize(data.render.color);
    particle.render.size = data.render.size;
    particle.render.rotation = data.render.rotation;
    particle.render.textureIndex = data.render.textureIndex;
    particle.render.blendMode = data.render.blendMode;
    particle.render.alpha = data.render.alpha;
    
    particle.life.age = data.life.age;
    particle.life.maxAge = data.life.maxAge;
    particle.life.lifeProgress = data.life.lifeProgress;
    particle.life.isAlive = data.life.isAlive;
    
    particle.customData = new Map(data.customData);
    
    return particle;
  }
} 