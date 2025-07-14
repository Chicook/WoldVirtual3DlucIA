/**
 * BlendTree - Sistema de Blend Trees para Animación Avanzada
 * 
 * Sistema de mezcla de animaciones con árboles de decisión y transiciones suaves
 * para el editor 3D del metaverso.
 */

import { Animation, AnimationConfig, AnimationTrack, Keyframe } from './AnimationManager';
import { Vector3 } from '../scene/math/Vector3';
import { Quaternion } from '../scene/math/Quaternion';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

export interface BlendTreeEvents {
  'blend:started': { blendTree: BlendTree; animations: Animation[] };
  'blend:updated': { blendTree: BlendTree; weights: number[] };
  'blend:completed': { blendTree: BlendTree; result: Animation };
  'transition:started': { blendTree: BlendTree; from: Animation; to: Animation };
  'transition:completed': { blendTree: BlendTree; animation: Animation };
}

export interface BlendTreeConfig {
  id: string;
  name: string;
  type: BlendType;
  animations: BlendNode[];
  parameters: BlendParameter[];
  transitions: BlendTransition[];
  metadata?: BlendTreeMetadata;
}

export interface BlendTreeMetadata {
  category: string;
  tags: string[];
  complexity: 'simple' | 'medium' | 'complex';
  performance: 'low' | 'medium' | 'high';
  description: string;
}

export enum BlendType {
  LINEAR = 'linear',
  ADDITIVE = 'additive',
  OVERRIDE = 'override',
  MASK = 'mask',
  LAYER = 'layer',
  DIRECTIONAL = 'directional',
  PARAMETER = 'parameter'
}

export interface BlendNode {
  id: string;
  animation: Animation;
  weight: number;
  mask?: BoneMask;
  offset?: number;
  scale?: number;
  speed?: number;
  enabled: boolean;
  metadata?: BlendNodeMetadata;
}

export interface BlendNodeMetadata {
  priority: number;
  category: string;
  tags: string[];
  conditions: BlendCondition[];
}

export interface BlendParameter {
  id: string;
  name: string;
  type: ParameterType;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  currentValue: number;
}

export enum ParameterType {
  FLOAT = 'float',
  BOOL = 'bool',
  INT = 'int',
  TRIGGER = 'trigger'
}

export interface BlendTransition {
  id: string;
  name: string;
  fromAnimation: string;
  toAnimation: string;
  duration: number;
  easing: string;
  conditions: BlendCondition[];
  enabled: boolean;
}

export interface BlendCondition {
  parameterId: string;
  operator: ConditionOperator;
  value: any;
  logic: 'and' | 'or';
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  BETWEEN = 'between'
}

export interface BoneMask {
  bones: string[];
  weight: number;
  enabled: boolean;
}

export interface BlendResult {
  animation: Animation;
  weight: number;
  mask?: BoneMask;
}

/**
 * Clase de Blend Tree
 */
export class BlendTree extends EventEmitter<BlendTreeEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly type: BlendType;
  public readonly animations: Map<string, BlendNode>;
  public readonly parameters: Map<string, BlendParameter>;
  public readonly transitions: Map<string, BlendTransition>;
  public readonly metadata: BlendTreeMetadata | null;

  private _currentAnimation: Animation | null = null;
  private _currentWeights: Map<string, number> = new Map();
  private _activeTransitions: Map<string, BlendTransition> = new Map();
  private _transitionProgress: Map<string, number> = new Map();
  private _enabled: boolean = true;

  constructor(config: BlendTreeConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.metadata = config.metadata || null;

    this.animations = new Map();
    config.animations.forEach(node => {
      this.animations.set(node.id, node);
    });

    this.parameters = new Map();
    config.parameters.forEach(param => {
      this.parameters.set(param.id, param);
    });

    this.transitions = new Map();
    config.transitions.forEach(transition => {
      this.transitions.set(transition.id, transition);
    });
  }

  /**
   * Actualiza el blend tree
   */
  update(deltaTime: number): void {
    if (!this._enabled) return;

    // Actualizar transiciones activas
    this._updateTransitions(deltaTime);

    // Calcular pesos basados en el tipo de blend
    this._calculateWeights();

    // Aplicar blend
    this._applyBlend();
  }

  /**
   * Actualiza las transiciones activas
   */
  private _updateTransitions(deltaTime: number): void {
    this._activeTransitions.forEach((transition, transitionId) => {
      const progress = this._transitionProgress.get(transitionId) || 0;
      const newProgress = progress + (deltaTime / transition.duration);

      if (newProgress >= 1.0) {
        // Transición completada
        this._completeTransition(transitionId);
      } else {
        // Actualizar progreso
        this._transitionProgress.set(transitionId, newProgress);
      }
    });
  }

  /**
   * Completa una transición
   */
  private _completeTransition(transitionId: string): void {
    const transition = this._activeTransitions.get(transitionId);
    if (!transition) return;

    const toNode = this.animations.get(transition.toAnimation);
    if (toNode) {
      this._currentAnimation = toNode.animation;
      this.emit('transition:completed', { blendTree: this, animation: toNode.animation });
    }

    this._activeTransitions.delete(transitionId);
    this._transitionProgress.delete(transitionId);
  }

  /**
   * Calcula los pesos de las animaciones
   */
  private _calculateWeights(): void {
    this._currentWeights.clear();

    switch (this.type) {
      case BlendType.LINEAR:
        this._calculateLinearWeights();
        break;
      case BlendType.ADDITIVE:
        this._calculateAdditiveWeights();
        break;
      case BlendType.OVERRIDE:
        this._calculateOverrideWeights();
        break;
      case BlendType.MASK:
        this._calculateMaskWeights();
        break;
      case BlendType.LAYER:
        this._calculateLayerWeights();
        break;
      case BlendType.DIRECTIONAL:
        this._calculateDirectionalWeights();
        break;
      case BlendType.PARAMETER:
        this._calculateParameterWeights();
        break;
    }
  }

  /**
   * Calcula pesos lineales
   */
  private _calculateLinearWeights(): void {
    let totalWeight = 0;

    this.animations.forEach(node => {
      if (node.enabled) {
        totalWeight += node.weight;
      }
    });

    if (totalWeight > 0) {
      this.animations.forEach(node => {
        if (node.enabled) {
          this._currentWeights.set(node.id, node.weight / totalWeight);
        }
      });
    }
  }

  /**
   * Calcula pesos aditivos
   */
  private _calculateAdditiveWeights(): void {
    this.animations.forEach(node => {
      if (node.enabled) {
        this._currentWeights.set(node.id, node.weight);
      }
    });
  }

  /**
   * Calcula pesos de override
   */
  private _calculateOverrideWeights(): void {
    let highestPriority = -1;
    let selectedNode: BlendNode | null = null;

    this.animations.forEach(node => {
      if (node.enabled && node.metadata && node.metadata.priority > highestPriority) {
        highestPriority = node.metadata.priority;
        selectedNode = node;
      }
    });

    if (selectedNode) {
      this._currentWeights.set(selectedNode.id, 1.0);
    }
  }

  /**
   * Calcula pesos con máscaras
   */
  private _calculateMaskWeights(): void {
    this.animations.forEach(node => {
      if (node.enabled) {
        let weight = node.weight;
        
        if (node.mask && node.mask.enabled) {
          weight *= node.mask.weight;
        }

        this._currentWeights.set(node.id, weight);
      }
    });
  }

  /**
   * Calcula pesos por capas
   */
  private _calculateLayerWeights(): void {
    const layers = new Map<string, BlendNode[]>();

    // Agrupar por capas
    this.animations.forEach(node => {
      if (node.enabled && node.metadata) {
        const category = node.metadata.category;
        if (!layers.has(category)) {
          layers.set(category, []);
        }
        layers.get(category)!.push(node);
      }
    });

    // Calcular pesos por capa
    layers.forEach((layerNodes, category) => {
      let totalWeight = 0;
      layerNodes.forEach(node => totalWeight += node.weight);

      layerNodes.forEach(node => {
        const weight = totalWeight > 0 ? node.weight / totalWeight : 0;
        this._currentWeights.set(node.id, weight);
      });
    });
  }

  /**
   * Calcula pesos direccionales
   */
  private _calculateDirectionalWeights(): void {
    // Implementación simplificada - en un sistema real usarías dirección del movimiento
    this._calculateLinearWeights();
  }

  /**
   * Calcula pesos basados en parámetros
   */
  private _calculateParameterWeights(): void {
    this.animations.forEach(node => {
      if (node.enabled && node.metadata) {
        let weight = node.weight;
        let conditionsMet = true;

        node.metadata.conditions.forEach(condition => {
          const parameter = this.parameters.get(condition.parameterId);
          if (parameter) {
            const meetsCondition = this._evaluateCondition(parameter, condition);
            if (condition.logic === 'and') {
              conditionsMet = conditionsMet && meetsCondition;
            } else {
              conditionsMet = conditionsMet || meetsCondition;
            }
          }
        });

        if (conditionsMet) {
          this._currentWeights.set(node.id, weight);
        }
      }
    });
  }

  /**
   * Evalúa una condición
   */
  private _evaluateCondition(parameter: BlendParameter, condition: BlendCondition): boolean {
    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return parameter.currentValue === condition.value;
      case ConditionOperator.NOT_EQUALS:
        return parameter.currentValue !== condition.value;
      case ConditionOperator.GREATER_THAN:
        return parameter.currentValue > condition.value;
      case ConditionOperator.LESS_THAN:
        return parameter.currentValue < condition.value;
      case ConditionOperator.GREATER_EQUAL:
        return parameter.currentValue >= condition.value;
      case ConditionOperator.LESS_EQUAL:
        return parameter.currentValue <= condition.value;
      case ConditionOperator.BETWEEN:
        const [min, max] = condition.value;
        return parameter.currentValue >= min && parameter.currentValue <= max;
      default:
        return false;
    }
  }

  /**
   * Aplica el blend de animaciones
   */
  private _applyBlend(): void {
    if (this._currentWeights.size === 0) return;

    // Crear animación resultante
    const blendedAnimation = this._createBlendedAnimation();
    this._currentAnimation = blendedAnimation;

    this.emit('blend:updated', { 
      blendTree: this, 
      weights: Array.from(this._currentWeights.values()) 
    });
  }

  /**
   * Crea una animación mezclada
   */
  private _createBlendedAnimation(): Animation {
    // Encontrar la animación base (la de mayor peso)
    let baseAnimation: Animation | null = null;
    let maxWeight = 0;

    this._currentWeights.forEach((weight, nodeId) => {
      if (weight > maxWeight) {
        const node = this.animations.get(nodeId);
        if (node) {
          maxWeight = weight;
          baseAnimation = node.animation;
        }
      }
    });

    if (!baseAnimation) {
      throw new Error('No base animation found for blending');
    }

    // Crear nueva animación mezclada
    const blendedTracks = this._blendTracks();
    
    const blendedConfig: AnimationConfig = {
      id: `blended_${this.id}_${Date.now()}`,
      name: `${this.name}_blended`,
      duration: baseAnimation.duration,
      loop: baseAnimation.loop,
      easing: baseAnimation.easing,
      tracks: blendedTracks
    };

    return new Animation(blendedConfig);
  }

  /**
   * Mezcla las pistas de animación
   */
  private _blendTracks(): AnimationTrack[] {
    const blendedTracks = new Map<string, AnimationTrack>();

    this._currentWeights.forEach((weight, nodeId) => {
      const node = this.animations.get(nodeId);
      if (!node || weight <= 0) return;

      node.animation.tracks.forEach(track => {
        const trackKey = `${track.target}.${track.property}`;
        
        if (!blendedTracks.has(trackKey)) {
          blendedTracks.set(trackKey, {
            id: trackKey,
            target: track.target,
            property: track.property,
            keyframes: [],
            interpolation: track.interpolation
          });
        }

        const blendedTrack = blendedTracks.get(trackKey)!;
        this._blendKeyframes(blendedTrack, track, weight, node);
      });
    });

    return Array.from(blendedTracks.values());
  }

  /**
   * Mezcla keyframes de una pista
   */
  private _blendKeyframes(
    blendedTrack: AnimationTrack, 
    sourceTrack: AnimationTrack, 
    weight: number, 
    node: BlendNode
  ): void {
    sourceTrack.keyframes.forEach(sourceKeyframe => {
      // Aplicar offset y escala
      const adjustedTime = (sourceKeyframe.time + (node.offset || 0)) * (node.scale || 1);
      
      // Aplicar peso al valor
      const blendedValue = this._blendValue(sourceKeyframe.value, weight, node.mask);
      
      const blendedKeyframe: Keyframe = {
        time: adjustedTime,
        value: blendedValue,
        easing: sourceKeyframe.easing,
        tension: sourceKeyframe.tension,
        continuity: sourceKeyframe.continuity,
        bias: sourceKeyframe.bias
      };

      blendedTrack.keyframes.push(blendedKeyframe);
    });
  }

  /**
   * Mezcla valores de animación
   */
  private _blendValue(value: any, weight: number, mask?: BoneMask): any {
    if (typeof value === 'number') {
      return value * weight;
    }
    
    if (value instanceof Vector3) {
      return value.clone().multiplyScalar(weight);
    }
    
    if (value instanceof Quaternion) {
      // Para quaterniones, usar slerp con identidad
      const identity = new Quaternion();
      return identity.slerp(value, weight);
    }
    
    return value;
  }

  /**
   * Inicia una transición
   */
  startTransition(transitionId: string): void {
    const transition = this.transitions.get(transitionId);
    if (!transition || !transition.enabled) return;

    // Verificar condiciones
    const conditionsMet = transition.conditions.every(condition => {
      const parameter = this.parameters.get(condition.parameterId);
      return parameter ? this._evaluateCondition(parameter, condition) : false;
    });

    if (!conditionsMet) return;

    this._activeTransitions.set(transitionId, transition);
    this._transitionProgress.set(transitionId, 0);

    const fromNode = this.animations.get(transition.fromAnimation);
    const toNode = this.animations.get(transition.toAnimation);

    if (fromNode && toNode) {
      this.emit('transition:started', { 
        blendTree: this, 
        from: fromNode.animation, 
        to: toNode.animation 
      });
    }
  }

  /**
   * Establece un parámetro
   */
  setParameter(parameterId: string, value: number): void {
    const parameter = this.parameters.get(parameterId);
    if (!parameter) return;

    parameter.currentValue = Math.max(parameter.minValue, Math.min(parameter.maxValue, value));
  }

  /**
   * Obtiene un parámetro
   */
  getParameter(parameterId: string): BlendParameter | null {
    return this.parameters.get(parameterId) || null;
  }

  /**
   * Habilita/deshabilita el blend tree
   */
  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  /**
   * Obtiene la animación actual
   */
  getCurrentAnimation(): Animation | null {
    return this._currentAnimation;
  }

  /**
   * Obtiene los pesos actuales
   */
  getCurrentWeights(): Map<string, number> {
    return new Map(this._currentWeights);
  }

  /**
   * Serializa el blend tree
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      animations: Array.from(this.animations.values()).map(node => ({
        id: node.id,
        animation: node.animation.serialize(),
        weight: node.weight,
        mask: node.mask,
        offset: node.offset,
        scale: node.scale,
        speed: node.speed,
        enabled: node.enabled,
        metadata: node.metadata
      })),
      parameters: Array.from(this.parameters.values()),
      transitions: Array.from(this.transitions.values()),
      metadata: this.metadata
    };
  }

  /**
   * Deserializa un blend tree
   */
  static deserialize(data: any): BlendTree {
    const config: BlendTreeConfig = {
      id: data.id,
      name: data.name,
      type: data.type,
      animations: data.animations.map((nodeData: any) => ({
        id: nodeData.id,
        animation: Animation.deserialize(nodeData.animation),
        weight: nodeData.weight,
        mask: nodeData.mask,
        offset: nodeData.offset,
        scale: nodeData.scale,
        speed: nodeData.speed,
        enabled: nodeData.enabled,
        metadata: nodeData.metadata
      })),
      parameters: data.parameters,
      transitions: data.transitions,
      metadata: data.metadata
    };

    return new BlendTree(config);
  }

  // Getters
  get enabled(): boolean { return this._enabled; }
  get animationCount(): number { return this.animations.size; }
  get parameterCount(): number { return this.parameters.size; }
  get transitionCount(): number { return this.transitions.size; }
  get activeTransitionCount(): number { return this._activeTransitions.size; }
} 