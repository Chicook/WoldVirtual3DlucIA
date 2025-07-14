/**
 * AnimationManager - Sistema de Animación Enterprise
 * 
 * Gestión centralizada de animaciones, esqueletos, keyframes y blend trees
 * para el editor 3D del metaverso.
 */

import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3 } from '../scene/math/Vector3';
import { Quaternion } from '../scene/math/Quaternion';
import { Matrix4 } from '../scene/math/Matrix4';
import { Injectable, Inject } from '../di/decorators';

export interface AnimationEvents {
  'animation:created': { animation: Animation; name: string };
  'animation:started': { animation: Animation; target: any };
  'animation:stopped': { animation: Animation; target: any };
  'animation:paused': { animation: Animation; target: any };
  'animation:resumed': { animation: Animation; target: any };
  'animation:completed': { animation: Animation; target: any };
  'keyframe:added': { animation: Animation; keyframe: Keyframe };
  'keyframe:removed': { animation: Animation; keyframe: Keyframe };
  'blend:started': { blendTree: BlendTree; animations: Animation[] };
  'blend:updated': { blendTree: BlendTree; weights: number[] };
  'skeleton:created': { skeleton: Skeleton; name: string };
  'bone:updated': { skeleton: Skeleton; bone: Bone; transform: Transform };
}

export interface AnimationConfig {
  id: string;
  name: string;
  duration: number;
  loop: boolean;
  easing: EasingFunction;
  tracks: AnimationTrack[];
  metadata?: AnimationMetadata;
}

export interface AnimationMetadata {
  author: string;
  version: string;
  description: string;
  tags: string[];
  category: AnimationCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  targetFPS: number;
  optimized: boolean;
}

export enum AnimationCategory {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  JUMP = 'jump',
  ATTACK = 'attack',
  DEFEND = 'defend',
  EMOTE = 'emote',
  FACIAL = 'facial',
  CUSTOM = 'custom'
}

export interface AnimationTrack {
  id: string;
  target: string;
  property: string;
  keyframes: Keyframe[];
  interpolation: InterpolationType;
}

export interface Keyframe {
  time: number;
  value: any;
  easing?: EasingFunction;
  tension?: number;
  continuity?: number;
  bias?: number;
}

export enum InterpolationType {
  LINEAR = 'linear',
  STEP = 'step',
  SMOOTH = 'smooth',
  CUBIC = 'cubic',
  HERMITE = 'hermite'
}

export type EasingFunction = (t: number) => number;

export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

export interface Bone {
  id: string;
  name: string;
  parent: string | null;
  children: string[];
  transform: Transform;
  bindPose: Transform;
  length: number;
  enabled: boolean;
}

export interface Skeleton {
  id: string;
  name: string;
  bones: Map<string, Bone>;
  rootBones: string[];
  bindPose: Map<string, Transform>;
  enabled: boolean;
}

export interface BlendTree {
  id: string;
  name: string;
  type: BlendType;
  animations: BlendNode[];
  weights: number[];
  output: Animation;
}

export enum BlendType {
  LINEAR = 'linear',
  ADDITIVE = 'additive',
  OVERRIDE = 'override',
  MASK = 'mask',
  LAYER = 'layer'
}

export interface BlendNode {
  animation: Animation;
  weight: number;
  mask?: BoneMask;
  offset?: number;
  scale?: number;
}

export interface BoneMask {
  bones: string[];
  weight: number;
}

/**
 * Sistema de Easing Functions
 */
export class Easing {
  static linear(t: number): number { return t; }
  
  static easeInQuad(t: number): number { return t * t; }
  static easeOutQuad(t: number): number { return t * (2 - t); }
  static easeInOutQuad(t: number): number { 
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 
  }
  
  static easeInCubic(t: number): number { return t * t * t; }
  static easeOutCubic(t: number): number { return (--t) * t * t + 1; }
  static easeInOutCubic(t: number): number { 
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; 
  }
  
  static easeInElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }
  
  static easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
  
  static easeInOutElastic(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  }
  
  static easeInBounce(t: number): number { return 1 - Easing.easeOutBounce(1 - t); }
  static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
  static easeInOutBounce(t: number): number {
    return t < 0.5 ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2 : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;
  }
}

/**
 * Clase de Animación
 */
export class Animation extends EventEmitter<AnimationEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly duration: number;
  public readonly loop: boolean;
  public readonly easing: EasingFunction;
  public readonly tracks: Map<string, AnimationTrack>;
  public readonly metadata: AnimationMetadata | null;
  
  private _playing: boolean = false;
  private _paused: boolean = false;
  private _currentTime: number = 0;
  private _startTime: number = 0;
  private _targets: Map<string, any> = new Map();

  constructor(config: AnimationConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.duration = config.duration;
    this.loop = config.loop;
    this.easing = config.easing || Easing.linear;
    this.metadata = config.metadata || null;
    
    this.tracks = new Map();
    config.tracks.forEach(track => {
      this.tracks.set(track.id, track);
    });
  }

  /**
   * Reproduce la animación
   */
  play(targets: Map<string, any>): void {
    this._targets = targets;
    this._playing = true;
    this._paused = false;
    this._startTime = performance.now();
    this._currentTime = 0;
    
    this.emit('animation:started', { animation: this, target: targets });
  }

  /**
   * Pausa la animación
   */
  pause(): void {
    if (!this._playing) return;
    
    this._paused = true;
    this._playing = false;
    this.emit('animation:paused', { animation: this, target: this._targets });
  }

  /**
   * Reanuda la animación
   */
  resume(): void {
    if (!this._paused) return;
    
    this._paused = false;
    this._playing = true;
    this._startTime = performance.now() - this._currentTime;
    this.emit('animation:resumed', { animation: this, target: this._targets });
  }

  /**
   * Detiene la animación
   */
  stop(): void {
    this._playing = false;
    this._paused = false;
    this._currentTime = 0;
    this.emit('animation:stopped', { animation: this, target: this._targets });
  }

  /**
   * Actualiza la animación
   */
  update(deltaTime: number): void {
    if (!this._playing || this._paused) return;

    this._currentTime += deltaTime;
    
    if (this._currentTime >= this.duration) {
      if (this.loop) {
        this._currentTime = this._currentTime % this.duration;
      } else {
        this._currentTime = this.duration;
        this.stop();
        this.emit('animation:completed', { animation: this, target: this._targets });
        return;
      }
    }

    this.updateTracks();
  }

  /**
   * Actualiza todas las pistas de animación
   */
  private updateTracks(): void {
    this.tracks.forEach(track => {
      const target = this._targets.get(track.target);
      if (!target) return;

      const value = this.evaluateTrack(track, this._currentTime);
      this.setTargetProperty(target, track.property, value);
    });
  }

  /**
   * Evalúa una pista de animación en un tiempo específico
   */
  private evaluateTrack(track: AnimationTrack, time: number): any {
    if (track.keyframes.length === 0) return null;
    if (track.keyframes.length === 1) return track.keyframes[0].value;

    // Encontrar keyframes adyacentes
    let prevKeyframe: Keyframe | null = null;
    let nextKeyframe: Keyframe | null = null;

    for (let i = 0; i < track.keyframes.length; i++) {
      const keyframe = track.keyframes[i];
      if (keyframe.time <= time) {
        prevKeyframe = keyframe;
      } else {
        nextKeyframe = keyframe;
        break;
      }
    }

    if (!prevKeyframe) return track.keyframes[0].value;
    if (!nextKeyframe) return prevKeyframe.value;

    // Calcular factor de interpolación
    const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
    const easedT = prevKeyframe.easing ? prevKeyframe.easing(t) : this.easing(t);

    // Interpolar valores
    return this.interpolate(
      prevKeyframe.value,
      nextKeyframe.value,
      easedT,
      track.interpolation,
      prevKeyframe
    );
  }

  /**
   * Interpola entre dos valores
   */
  private interpolate(
    start: any,
    end: any,
    t: number,
    type: InterpolationType,
    keyframe: Keyframe
  ): any {
    switch (type) {
      case InterpolationType.LINEAR:
        return this.linearInterpolate(start, end, t);
      case InterpolationType.STEP:
        return t < 0.5 ? start : end;
      case InterpolationType.SMOOTH:
        return this.smoothInterpolate(start, end, t);
      case InterpolationType.CUBIC:
        return this.cubicInterpolate(start, end, t, keyframe);
      case InterpolationType.HERMITE:
        return this.hermiteInterpolate(start, end, t, keyframe);
      default:
        return this.linearInterpolate(start, end, t);
    }
  }

  /**
   * Interpolación lineal
   */
  private linearInterpolate(start: any, end: any, t: number): any {
    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * t;
    }
    
    if (start instanceof Vector3 && end instanceof Vector3) {
      return start.clone().lerp(end, t);
    }
    
    if (start instanceof Quaternion && end instanceof Quaternion) {
      return start.clone().slerp(end, t);
    }
    
    if (start instanceof Matrix4 && end instanceof Matrix4) {
      // Interpolación de matrices usando descomposición
      const startTransform = this.decomposeMatrix(start);
      const endTransform = this.decomposeMatrix(end);
      
      const interpolatedTransform = {
        position: startTransform.position.clone().lerp(endTransform.position, t),
        rotation: startTransform.rotation.clone().slerp(endTransform.rotation, t),
        scale: startTransform.scale.clone().lerp(endTransform.scale, t)
      };
      
      return this.composeMatrix(interpolatedTransform);
    }
    
    return t < 0.5 ? start : end;
  }

  /**
   * Interpolación suave
   */
  private smoothInterpolate(start: any, end: any, t: number): any {
    const smoothT = t * t * (3 - 2 * t);
    return this.linearInterpolate(start, end, smoothT);
  }

  /**
   * Interpolación cúbica
   */
  private cubicInterpolate(start: any, end: any, t: number, keyframe: Keyframe): any {
    const tension = keyframe.tension || 0;
    const continuity = keyframe.continuity || 0;
    const bias = keyframe.bias || 0;
    
    const t2 = t * t;
    const t3 = t2 * t;
    
    const h1 = 2 * t3 - 3 * t2 + 1;
    const h2 = -2 * t3 + 3 * t2;
    const h3 = t3 - 2 * t2 + t;
    const h4 = t3 - t2;
    
    // Implementación simplificada - en un sistema real necesitarías más keyframes
    return this.linearInterpolate(start, end, t);
  }

  /**
   * Interpolación Hermite
   */
  private hermiteInterpolate(start: any, end: any, t: number, keyframe: Keyframe): any {
    const tension = keyframe.tension || 0;
    const bias = keyframe.bias || 0;
    
    const t2 = t * t;
    const t3 = t2 * t;
    
    const h1 = 2 * t3 - 3 * t2 + 1;
    const h2 = -2 * t3 + 3 * t2;
    const h3 = t3 - 2 * t2 + t;
    const h4 = t3 - t2;
    
    // Implementación simplificada
    return this.linearInterpolate(start, end, t);
  }

  /**
   * Descompone una matriz en transform
   */
  private decomposeMatrix(matrix: Matrix4): Transform {
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    
    // Extraer posición
    position.setFromMatrixPosition(matrix);
    
    // Extraer escala
    scale.setFromMatrixScale(matrix);
    
    // Extraer rotación
    rotation.setFromRotationMatrix(matrix);
    
    return { position, rotation, scale };
  }

  /**
   * Compone una matriz desde transform
   */
  private composeMatrix(transform: Transform): Matrix4 {
    const matrix = new Matrix4();
    matrix.compose(transform.position, transform.rotation, transform.scale);
    return matrix;
  }

  /**
   * Establece una propiedad en el objetivo
   */
  private setTargetProperty(target: any, property: string, value: any): void {
    const parts = property.split('.');
    let current = target;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
      if (!current) return;
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * Agrega un keyframe
   */
  addKeyframe(trackId: string, keyframe: Keyframe): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    track.keyframes.push(keyframe);
    track.keyframes.sort((a, b) => a.time - b.time);
    
    this.emit('keyframe:added', { animation: this, keyframe });
  }

  /**
   * Remueve un keyframe
   */
  removeKeyframe(trackId: string, time: number): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    const index = track.keyframes.findIndex(k => Math.abs(k.time - time) < 0.001);
    if (index !== -1) {
      const keyframe = track.keyframes[index];
      track.keyframes.splice(index, 1);
      this.emit('keyframe:removed', { animation: this, keyframe });
    }
  }

  /**
   * Obtiene el valor actual de una pista
   */
  getTrackValue(trackId: string): any {
    const track = this.tracks.get(trackId);
    if (!track) return null;

    return this.evaluateTrack(track, this._currentTime);
  }

  /**
   * Serializa la animación
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      loop: this.loop,
      tracks: Array.from(this.tracks.values()).map(track => ({
        id: track.id,
        target: track.target,
        property: track.property,
        interpolation: track.interpolation,
        keyframes: track.keyframes
      })),
      metadata: this.metadata
    };
  }

  /**
   * Deserializa una animación
   */
  static deserialize(data: any): Animation {
    return new Animation({
      id: data.id,
      name: data.name,
      duration: data.duration,
      loop: data.loop,
      easing: Easing.linear,
      tracks: data.tracks.map((trackData: any) => ({
        id: trackData.id,
        target: trackData.target,
        property: trackData.property,
        interpolation: trackData.interpolation,
        keyframes: trackData.keyframes
      }))
    });
  }

  // Getters
  get isPlaying(): boolean { return this._playing; }
  get isPaused(): boolean { return this._paused; }
  get currentTime(): number { return this._currentTime; }
  get progress(): number { return this._currentTime / this.duration; }
}

/**
 * Gestor principal de animaciones
 */
@Injectable('AnimationManager')
export class AnimationManager extends EventEmitter<AnimationEvents> {
  private readonly logger = new Logger('AnimationManager');
  
  private _animations: Map<string, Animation> = new Map();
  private _skeletons: Map<string, Skeleton> = new Map();
  private _blendTrees: Map<string, BlendTree> = new Map();
  private _activeAnimations: Map<string, Animation> = new Map();
  
  private _enabled: boolean = true;
  private _globalSpeed: number = 1.0;
  private _lastUpdateTime: number = 0;

  constructor(
    @Inject('EventEmitter') private eventEmitter: EventEmitter<any>,
    @Inject('Logger') private logger: Logger
  ) {
    super();
    this.startUpdateLoop();
  }

  /**
   * Inicia el loop de actualización
   */
  private startUpdateLoop(): void {
    const update = () => {
      if (this._enabled) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this._lastUpdateTime) * this._globalSpeed / 1000;
        this._lastUpdateTime = currentTime;
        
        this.updateAnimations(deltaTime);
      }
      requestAnimationFrame(update);
    };
    
    this._lastUpdateTime = performance.now();
    requestAnimationFrame(update);
  }

  /**
   * Actualiza todas las animaciones activas
   */
  private updateAnimations(deltaTime: number): void {
    this._activeAnimations.forEach(animation => {
      animation.update(deltaTime);
    });
  }

  /**
   * Crea una nueva animación
   */
  createAnimation(config: AnimationConfig): Animation {
    const animation = new Animation(config);
    this._animations.set(animation.id, animation);
    
    this.emit('animation:created', { animation, name: config.name });
    this.logger.info('Animation created', config.name);
    
    return animation;
  }

  /**
   * Reproduce una animación
   */
  playAnimation(animationId: string, targets: Map<string, any>): void {
    const animation = this._animations.get(animationId);
    if (!animation) {
      this.logger.warn('Animation not found', animationId);
      return;
    }

    animation.play(targets);
    this._activeAnimations.set(animationId, animation);
  }

  /**
   * Detiene una animación
   */
  stopAnimation(animationId: string): void {
    const animation = this._activeAnimations.get(animationId);
    if (!animation) return;

    animation.stop();
    this._activeAnimations.delete(animationId);
  }

  /**
   * Pausa una animación
   */
  pauseAnimation(animationId: string): void {
    const animation = this._activeAnimations.get(animationId);
    if (!animation) return;

    animation.pause();
  }

  /**
   * Reanuda una animación
   */
  resumeAnimation(animationId: string): void {
    const animation = this._activeAnimations.get(animationId);
    if (!animation) return;

    animation.resume();
  }

  /**
   * Crea un esqueleto
   */
  createSkeleton(config: Omit<Skeleton, 'id' | 'bones' | 'rootBones' | 'bindPose'>): Skeleton {
    const skeleton: Skeleton = {
      id: `skeleton_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...config,
      bones: new Map(),
      rootBones: [],
      bindPose: new Map(),
      enabled: true
    };

    this._skeletons.set(skeleton.id, skeleton);
    this.emit('skeleton:created', { skeleton, name: config.name });
    
    return skeleton;
  }

  /**
   * Agrega un hueso al esqueleto
   */
  addBone(skeletonId: string, bone: Bone): void {
    const skeleton = this._skeletons.get(skeletonId);
    if (!skeleton) return;

    skeleton.bones.set(bone.id, bone);
    skeleton.bindPose.set(bone.id, { ...bone.transform });
    
    if (!bone.parent) {
      skeleton.rootBones.push(bone.id);
    } else {
      const parentBone = skeleton.bones.get(bone.parent);
      if (parentBone) {
        parentBone.children.push(bone.id);
      }
    }
  }

  /**
   * Actualiza un hueso
   */
  updateBone(skeletonId: string, boneId: string, transform: Transform): void {
    const skeleton = this._skeletons.get(skeletonId);
    if (!skeleton) return;

    const bone = skeleton.bones.get(boneId);
    if (!bone) return;

    bone.transform = transform;
    this.emit('bone:updated', { skeleton, bone, transform });
  }

  /**
   * Crea un blend tree
   */
  createBlendTree(config: Omit<BlendTree, 'id' | 'weights' | 'output'>): BlendTree {
    const blendTree: BlendTree = {
      id: `blend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...config,
      weights: config.animations.map(() => 1.0 / config.animations.length),
      output: this.createBlendedAnimation(config)
    };

    this._blendTrees.set(blendTree.id, blendTree);
    return blendTree;
  }

  /**
   * Crea una animación mezclada
   */
  private createBlendedAnimation(blendTree: Omit<BlendTree, 'id' | 'weights' | 'output'>): Animation {
    // Implementación simplificada - en un sistema real necesitarías mezclar las pistas
    const firstAnimation = blendTree.animations[0]?.animation;
    if (!firstAnimation) {
      throw new Error('Blend tree must have at least one animation');
    }

    return new Animation({
      id: `blended_${Date.now()}`,
      name: `${blendTree.name}_blended`,
      duration: firstAnimation.duration,
      loop: firstAnimation.loop,
      easing: Easing.linear,
      tracks: []
    });
  }

  /**
   * Actualiza los pesos del blend tree
   */
  updateBlendWeights(blendTreeId: string, weights: number[]): void {
    const blendTree = this._blendTrees.get(blendTreeId);
    if (!blendTree) return;

    blendTree.weights = weights;
    this.emit('blend:updated', { blendTree, weights });
  }

  /**
   * Habilita/deshabilita el sistema de animación
   */
  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  /**
   * Establece la velocidad global
   */
  setGlobalSpeed(speed: number): void {
    this._globalSpeed = Math.max(0, speed);
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this._activeAnimations.forEach(animation => animation.stop());
    this._activeAnimations.clear();
    this._animations.clear();
    this._skeletons.clear();
    this._blendTrees.clear();
  }

  // Getters
  get animations(): Map<string, Animation> { return this._animations; }
  get skeletons(): Map<string, Skeleton> { return this._skeletons; }
  get blendTrees(): Map<string, BlendTree> { return this._blendTrees; }
  get activeAnimations(): Map<string, Animation> { return this._activeAnimations; }
  get enabled(): boolean { return this._enabled; }
  get globalSpeed(): number { return this._globalSpeed; }
} 