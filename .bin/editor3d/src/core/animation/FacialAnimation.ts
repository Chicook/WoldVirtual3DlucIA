/**
 * FacialAnimation - Sistema de Animación Facial
 * 
 * Sistema de animación facial con morph targets, expresiones y sincronización de labios
 * para el editor 3D del metaverso.
 */

import { Vector3 } from '../scene/math/Vector3';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

export interface FacialAnimationEvents {
  'expression:changed': { facial: FacialAnimation; expression: string; weight: number };
  'morph:updated': { facial: FacialAnimation; morphTarget: string; weight: number };
  'lipSync:started': { facial: FacialAnimation; audio: string };
  'lipSync:stopped': { facial: FacialAnimation };
  'blink:triggered': { facial: FacialAnimation; eye: 'left' | 'right' | 'both' };
  'emotion:changed': { facial: FacialAnimation; emotion: Emotion; intensity: number };
}

export interface FacialAnimationConfig {
  id: string;
  name: string;
  morphTargets: MorphTarget[];
  expressions: Expression[];
  emotions: Emotion[];
  lipSync: LipSyncConfig;
  metadata?: FacialMetadata;
}

export interface FacialMetadata {
  category: 'human' | 'animal' | 'fantasy' | 'robot';
  complexity: 'simple' | 'medium' | 'complex';
  morphTargetCount: number;
  expressionCount: number;
  description: string;
}

export interface MorphTarget {
  id: string;
  name: string;
  weight: number;
  category: MorphCategory;
  vertices: MorphVertex[];
  enabled: boolean;
  metadata?: MorphTargetMetadata;
}

export interface MorphTargetMetadata {
  region: 'eyes' | 'mouth' | 'nose' | 'cheeks' | 'brows' | 'jaw' | 'full';
  symmetry: 'left' | 'right' | 'both';
  importance: number;
  tags: string[];
}

export enum MorphCategory {
  EYES = 'eyes',
  MOUTH = 'mouth',
  NOSE = 'nose',
  CHEEKS = 'cheeks',
  BROWS = 'brows',
  JAW = 'jaw',
  FULL = 'full'
}

export interface MorphVertex {
  index: number;
  position: Vector3;
  normal: Vector3;
  weight: number;
}

export interface Expression {
  id: string;
  name: string;
  description: string;
  morphTargets: ExpressionMorph[];
  duration: number;
  easing: string;
  category: ExpressionCategory;
  metadata?: ExpressionMetadata;
}

export interface ExpressionMetadata {
  emotion: string;
  intensity: number;
  tags: string[];
  difficulty: number;
}

export enum ExpressionCategory {
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  SURPRISED = 'surprised',
  FEAR = 'fear',
  DISGUST = 'disgust',
  NEUTRAL = 'neutral',
  CUSTOM = 'custom'
}

export interface ExpressionMorph {
  morphTargetId: string;
  weight: number;
  duration: number;
  easing: string;
}

export interface Emotion {
  id: string;
  name: string;
  description: string;
  baseExpression: string;
  intensity: number;
  duration: number;
  transitions: EmotionTransition[];
  metadata?: EmotionMetadata;
}

export interface EmotionMetadata {
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0 to 1 (calm to excited)
  dominance: number; // 0 to 1 (submissive to dominant)
  tags: string[];
}

export interface EmotionTransition {
  fromEmotion: string;
  toEmotion: string;
  duration: number;
  easing: string;
  conditions: EmotionCondition[];
}

export interface EmotionCondition {
  parameter: string;
  operator: 'equals' | 'greater' | 'less' | 'between';
  value: any;
}

export interface LipSyncConfig {
  enabled: boolean;
  phonemes: Phoneme[];
  visemes: Viseme[];
  mapping: PhonemeVisemeMapping[];
  smoothing: number;
  prediction: boolean;
}

export interface Phoneme {
  id: string;
  name: string;
  symbol: string;
  category: PhonemeCategory;
  duration: number;
  intensity: number;
}

export enum PhonemeCategory {
  VOWEL = 'vowel',
  CONSONANT = 'consonant',
  SEMIVOWEL = 'semivowel',
  SILENCE = 'silence'
}

export interface Viseme {
  id: string;
  name: string;
  morphTargets: VisemeMorph[];
  intensity: number;
}

export interface VisemeMorph {
  morphTargetId: string;
  weight: number;
  offset: number;
}

export interface PhonemeVisemeMapping {
  phonemeId: string;
  visemeId: string;
  weight: number;
}

export interface BlinkConfig {
  enabled: boolean;
  frequency: number;
  duration: number;
  asymmetry: number;
  randomness: number;
}

/**
 * Clase de Animación Facial
 */
export class FacialAnimation extends EventEmitter<FacialAnimationEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly morphTargets: Map<string, MorphTarget>;
  public readonly expressions: Map<string, Expression>;
  public readonly emotions: Map<string, Emotion>;
  public readonly lipSync: LipSyncConfig;
  public readonly metadata: FacialMetadata | null;

  private _currentExpression: string | null = null;
  private _currentEmotion: string | null = null;
  private _morphWeights: Map<string, number> = new Map();
  private _expressionWeights: Map<string, number> = new Map();
  private _emotionIntensities: Map<string, number> = new Map();
  private _lipSyncActive: boolean = false;
  private _currentPhoneme: string | null = null;
  private _blinkConfig: BlinkConfig;
  private _lastBlinkTime: number = 0;
  private _blinkState: 'open' | 'closing' | 'closed' | 'opening' = 'open';
  private _enabled: boolean = true;

  constructor(config: FacialAnimationConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.metadata = config.metadata || null;
    this.lipSync = config.lipSync;

    this.morphTargets = new Map();
    config.morphTargets.forEach(morph => {
      this.morphTargets.set(morph.id, morph);
      this._morphWeights.set(morph.id, morph.weight);
    });

    this.expressions = new Map();
    config.expressions.forEach(expression => {
      this.expressions.set(expression.id, expression);
      this._expressionWeights.set(expression.id, 0);
    });

    this.emotions = new Map();
    config.emotions.forEach(emotion => {
      this.emotions.set(emotion.id, emotion);
      this._emotionIntensities.set(emotion.id, 0);
    });

    this._blinkConfig = {
      enabled: true,
      frequency: 3, // blinks per minute
      duration: 0.15,
      asymmetry: 0.1,
      randomness: 0.3
    };
  }

  /**
   * Actualiza la animación facial
   */
  update(deltaTime: number): void {
    if (!this._enabled) return;

    // Actualizar parpadeo
    this._updateBlink(deltaTime);

    // Actualizar lip sync
    if (this.lipSync.enabled && this._lipSyncActive) {
      this._updateLipSync(deltaTime);
    }

    // Actualizar expresiones
    this._updateExpressions(deltaTime);

    // Actualizar emociones
    this._updateEmotions(deltaTime);

    // Aplicar morph targets
    this._applyMorphTargets();
  }

  /**
   * Actualiza el parpadeo
   */
  private _updateBlink(deltaTime: number): void {
    if (!this._blinkConfig.enabled) return;

    const currentTime = performance.now() / 1000;
    const timeSinceLastBlink = currentTime - this._lastBlinkTime;

    // Determinar si es momento de parpadear
    const baseInterval = 60 / this._blinkConfig.frequency;
    const randomFactor = 1 + (Math.random() - 0.5) * this._blinkConfig.randomness;
    const blinkInterval = baseInterval * randomFactor;

    if (timeSinceLastBlink >= blinkInterval && this._blinkState === 'open') {
      this._startBlink();
    }

    // Actualizar estado del parpadeo
    switch (this._blinkState) {
      case 'closing':
        this._updateBlinkClosing(deltaTime);
        break;
      case 'closed':
        this._updateBlinkClosed(deltaTime);
        break;
      case 'opening':
        this._updateBlinkOpening(deltaTime);
        break;
    }
  }

  /**
   * Inicia un parpadeo
   */
  private _startBlink(): void {
    this._blinkState = 'closing';
    this.emit('blink:triggered', { facial: this, eye: 'both' });
  }

  /**
   * Actualiza el cierre del parpadeo
   */
  private _updateBlinkClosing(deltaTime: number): void {
    const closeDuration = this._blinkConfig.duration * 0.4;
    const progress = deltaTime / closeDuration;

    if (progress >= 1.0) {
      this._blinkState = 'closed';
    } else {
      // Aplicar morph targets de cierre de ojos
      this._applyBlinkMorphs(progress, 'closing');
    }
  }

  /**
   * Actualiza el estado cerrado del parpadeo
   */
  private _updateBlinkClosed(deltaTime: number): void {
    const closedDuration = this._blinkConfig.duration * 0.2;
    const progress = deltaTime / closedDuration;

    if (progress >= 1.0) {
      this._blinkState = 'opening';
    } else {
      // Aplicar morph targets de ojos cerrados
      this._applyBlinkMorphs(1.0, 'closed');
    }
  }

  /**
   * Actualiza la apertura del parpadeo
   */
  private _updateBlinkOpening(deltaTime: number): void {
    const openDuration = this._blinkConfig.duration * 0.4;
    const progress = deltaTime / openDuration;

    if (progress >= 1.0) {
      this._blinkState = 'open';
      this._lastBlinkTime = performance.now() / 1000;
    } else {
      // Aplicar morph targets de apertura de ojos
      this._applyBlinkMorphs(1.0 - progress, 'opening');
    }
  }

  /**
   * Aplica morph targets de parpadeo
   */
  private _applyBlinkMorphs(weight: number, phase: string): void {
    // Buscar morph targets de ojos
    this.morphTargets.forEach(morph => {
      if (morph.category === MorphCategory.EYES && morph.enabled) {
        const currentWeight = this._morphWeights.get(morph.id) || 0;
        const targetWeight = weight;
        const newWeight = currentWeight + (targetWeight - currentWeight) * 0.1;
        
        this._morphWeights.set(morph.id, newWeight);
        this.emit('morph:updated', { facial: this, morphTarget: morph.id, weight: newWeight });
      }
    });
  }

  /**
   * Actualiza lip sync
   */
  private _updateLipSync(deltaTime: number): void {
    // Implementación simplificada - en un sistema real usarías análisis de audio
    if (!this._currentPhoneme) return;

    const viseme = this._getVisemeForPhoneme(this._currentPhoneme);
    if (viseme) {
      this._applyViseme(viseme, 1.0);
    }
  }

  /**
   * Obtiene el visema para un fonema
   */
  private _getVisemeForPhoneme(phonemeId: string): Viseme | null {
    const mapping = this.lipSync.mapping.find(m => m.phonemeId === phonemeId);
    if (!mapping) return null;

    return this.lipSync.visemes.find(v => v.id === mapping.visemeId) || null;
  }

  /**
   * Aplica un visema
   */
  private _applyViseme(viseme: Viseme, intensity: number): void {
    viseme.morphTargets.forEach(morph => {
      const currentWeight = this._morphWeights.get(morph.morphTargetId) || 0;
      const targetWeight = morph.weight * intensity;
      const newWeight = currentWeight + (targetWeight - currentWeight) * 0.1;
      
      this._morphWeights.set(morph.morphTargetId, newWeight);
      this.emit('morph:updated', { 
        facial: this, 
        morphTarget: morph.morphTargetId, 
        weight: newWeight 
      });
    });
  }

  /**
   * Actualiza expresiones
   */
  private _updateExpressions(deltaTime: number): void {
    this._expressionWeights.forEach((weight, expressionId) => {
      if (weight > 0) {
        const expression = this.expressions.get(expressionId);
        if (expression) {
          this._applyExpression(expression, weight);
        }
      }
    });
  }

  /**
   * Aplica una expresión
   */
  private _applyExpression(expression: Expression, weight: number): void {
    expression.morphTargets.forEach(morph => {
      const currentWeight = this._morphWeights.get(morph.morphTargetId) || 0;
      const targetWeight = morph.weight * weight;
      const newWeight = currentWeight + (targetWeight - currentWeight) * 0.1;
      
      this._morphWeights.set(morph.morphTargetId, newWeight);
      this.emit('morph:updated', { 
        facial: this, 
        morphTarget: morph.morphTargetId, 
        weight: newWeight 
      });
    });
  }

  /**
   * Actualiza emociones
   */
  private _updateEmotions(deltaTime: number): void {
    this._emotionIntensities.forEach((intensity, emotionId) => {
      if (intensity > 0) {
        const emotion = this.emotions.get(emotionId);
        if (emotion) {
          this._applyEmotion(emotion, intensity);
        }
      }
    });
  }

  /**
   * Aplica una emoción
   */
  private _applyEmotion(emotion: Emotion, intensity: number): void {
    const baseExpression = this.expressions.get(emotion.baseExpression);
    if (baseExpression) {
      this._applyExpression(baseExpression, intensity);
    }

    this.emit('emotion:changed', { facial: this, emotion, intensity });
  }

  /**
   * Aplica todos los morph targets
   */
  private _applyMorphTargets(): void {
    this._morphWeights.forEach((weight, morphId) => {
      const morph = this.morphTargets.get(morphId);
      if (morph && morph.enabled) {
        morph.weight = weight;
      }
    });
  }

  /**
   * Establece una expresión
   */
  setExpression(expressionId: string, weight: number): void {
    const expression = this.expressions.get(expressionId);
    if (!expression) return;

    this._currentExpression = expressionId;
    this._expressionWeights.set(expressionId, Math.max(0, Math.min(1, weight)));

    this.emit('expression:changed', { facial: this, expression: expressionId, weight });
  }

  /**
   * Establece una emoción
   */
  setEmotion(emotionId: string, intensity: number): void {
    const emotion = this.emotions.get(emotionId);
    if (!emotion) return;

    this._currentEmotion = emotionId;
    this._emotionIntensities.set(emotionId, Math.max(0, Math.min(1, intensity)));

    this.emit('emotion:changed', { facial: this, emotion, intensity });
  }

  /**
   * Establece un morph target
   */
  setMorphTarget(morphId: string, weight: number): void {
    const morph = this.morphTargets.get(morphId);
    if (!morph) return;

    this._morphWeights.set(morphId, Math.max(0, Math.min(1, weight)));
    this.emit('morph:updated', { facial: this, morphTarget: morphId, weight });
  }

  /**
   * Inicia lip sync
   */
  startLipSync(audioId: string): void {
    this._lipSyncActive = true;
    this.emit('lipSync:started', { facial: this, audio: audioId });
  }

  /**
   * Detiene lip sync
   */
  stopLipSync(): void {
    this._lipSyncActive = false;
    this._currentPhoneme = null;
    this.emit('lipSync:stopped', { facial: this });
  }

  /**
   * Establece el fonema actual
   */
  setPhoneme(phonemeId: string): void {
    this._currentPhoneme = phonemeId;
  }

  /**
   * Configura el parpadeo
   */
  setBlinkConfig(config: Partial<BlinkConfig>): void {
    Object.assign(this._blinkConfig, config);
  }

  /**
   * Habilita/deshabilita la animación facial
   */
  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  /**
   * Resetea todos los morph targets
   */
  reset(): void {
    this._morphWeights.forEach((_, morphId) => {
      this._morphWeights.set(morphId, 0);
    });

    this._expressionWeights.forEach((_, expressionId) => {
      this._expressionWeights.set(expressionId, 0);
    });

    this._emotionIntensities.forEach((_, emotionId) => {
      this._emotionIntensities.set(emotionId, 0);
    });

    this._currentExpression = null;
    this._currentEmotion = null;
  }

  /**
   * Obtiene el peso actual de un morph target
   */
  getMorphWeight(morphId: string): number {
    return this._morphWeights.get(morphId) || 0;
  }

  /**
   * Obtiene el peso actual de una expresión
   */
  getExpressionWeight(expressionId: string): number {
    return this._expressionWeights.get(expressionId) || 0;
  }

  /**
   * Obtiene la intensidad actual de una emoción
   */
  getEmotionIntensity(emotionId: string): number {
    return this._emotionIntensities.get(emotionId) || 0;
  }

  /**
   * Serializa la animación facial
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      morphTargets: Array.from(this.morphTargets.values()),
      expressions: Array.from(this.expressions.values()),
      emotions: Array.from(this.emotions.values()),
      lipSync: this.lipSync,
      metadata: this.metadata,
      currentExpression: this._currentExpression,
      currentEmotion: this._currentEmotion,
      morphWeights: Object.fromEntries(this._morphWeights),
      expressionWeights: Object.fromEntries(this._expressionWeights),
      emotionIntensities: Object.fromEntries(this._emotionIntensities)
    };
  }

  /**
   * Deserializa una animación facial
   */
  static deserialize(data: any): FacialAnimation {
    const config: FacialAnimationConfig = {
      id: data.id,
      name: data.name,
      morphTargets: data.morphTargets,
      expressions: data.expressions,
      emotions: data.emotions,
      lipSync: data.lipSync,
      metadata: data.metadata
    };

    const facial = new FacialAnimation(config);

    // Restaurar estado
    if (data.currentExpression) {
      facial.setExpression(data.currentExpression, data.expressionWeights[data.currentExpression] || 0);
    }

    if (data.currentEmotion) {
      facial.setEmotion(data.currentEmotion, data.emotionIntensities[data.currentEmotion] || 0);
    }

    // Restaurar morph weights
    Object.entries(data.morphWeights || {}).forEach(([morphId, weight]) => {
      facial.setMorphTarget(morphId, weight as number);
    });

    return facial;
  }

  // Getters
  get enabled(): boolean { return this._enabled; }
  get morphTargetCount(): number { return this.morphTargets.size; }
  get expressionCount(): number { return this.expressions.size; }
  get emotionCount(): number { return this.emotions.size; }
  get currentExpression(): string | null { return this._currentExpression; }
  get currentEmotion(): string | null { return this._currentEmotion; }
  get lipSyncActive(): boolean { return this._lipSyncActive; }
  get blinkConfig(): BlinkConfig { return this._blinkConfig; }
} 