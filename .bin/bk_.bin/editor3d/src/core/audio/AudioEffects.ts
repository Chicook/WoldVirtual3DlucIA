/**
 * AudioEffects - Sistema de Efectos de Audio 3D
 * 
 * Efectos de audio avanzados para el editor 3D del metaverso.
 */

import { AudioContext, AudioNode, GainNode, BiquadFilterNode, DelayNode, ConvolverNode, OscillatorNode } from 'web-audio-api';

export interface AudioEffectConfig {
  name: string;
  type: EffectType;
  parameters: Record<string, number>;
  enabled: boolean;
}

export enum EffectType {
  REVERB = 'reverb',
  DELAY = 'delay',
  FILTER = 'filter',
  DISTORTION = 'distortion',
  CHORUS = 'chorus',
  FLANGER = 'flanger',
  PHASER = 'phaser',
  COMPRESSOR = 'compressor',
  LIMITER = 'limiter',
  EQUALIZER = 'equalizer'
}

export interface AudioEffect {
  name: string;
  node: AudioNode;
  parameters: Record<string, any>;
  type: EffectType;
  enabled: boolean;
}

/**
 * Efecto de Reverb
 */
export class ReverbEffect implements AudioEffect {
  public name: string;
  public node: ConvolverNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.REVERB;
  public enabled: boolean = true;

  constructor(audioContext: AudioContext, config: Partial<ReverbConfig> = {}) {
    this.name = config.name || 'Reverb';
    this.parameters = {
      roomSize: config.roomSize || 0.5,
      dampening: config.dampening || 0.5,
      wetLevel: config.wetLevel || 0.3,
      dryLevel: config.dryLevel || 0.7
    };

    this.node = audioContext.createConvolver();
    this.createImpulseResponse(audioContext);
  }

  private createImpulseResponse(audioContext: AudioContext): void {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * this.parameters.roomSize;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, this.parameters.dampening);
      }
    }

    this.node.buffer = impulse;
  }

  updateParameters(params: Partial<ReverbConfig>): void {
    Object.assign(this.parameters, params);
    if (this.node.buffer) {
      this.createImpulseResponse(this.node.context);
    }
  }
}

export interface ReverbConfig {
  name?: string;
  roomSize: number;
  dampening: number;
  wetLevel: number;
  dryLevel: number;
}

/**
 * Efecto de Delay
 */
export class DelayEffect implements AudioEffect {
  public name: string;
  public node: DelayNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.DELAY;
  public enabled: boolean = true;

  constructor(audioContext: AudioContext, config: Partial<DelayConfig> = {}) {
    this.name = config.name || 'Delay';
    this.parameters = {
      delayTime: config.delayTime || 0.3,
      feedback: config.feedback || 0.3,
      mix: config.mix || 0.5
    };

    this.node = audioContext.createDelay(2.0); // Máximo 2 segundos
    this.node.delayTime.setValueAtTime(this.parameters.delayTime, audioContext.currentTime);
  }

  updateParameters(params: Partial<DelayConfig>): void {
    Object.assign(this.parameters, params);
    this.node.delayTime.setValueAtTime(this.parameters.delayTime, this.node.context.currentTime);
  }
}

export interface DelayConfig {
  name?: string;
  delayTime: number;
  feedback: number;
  mix: number;
}

/**
 * Efecto de Filtro
 */
export class FilterEffect implements AudioEffect {
  public name: string;
  public node: BiquadFilterNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.FILTER;
  public enabled: boolean = true;

  constructor(audioContext: AudioContext, config: Partial<FilterConfig> = {}) {
    this.name = config.name || 'Filter';
    this.parameters = {
      type: config.type || 'lowpass',
      frequency: config.frequency || 1000,
      Q: config.Q || 1,
      gain: config.gain || 0
    };

    this.node = audioContext.createBiquadFilter();
    this.node.type = this.parameters.type;
    this.node.frequency.setValueAtTime(this.parameters.frequency, audioContext.currentTime);
    this.node.Q.setValueAtTime(this.parameters.Q, audioContext.currentTime);
    this.node.gain.setValueAtTime(this.parameters.gain, audioContext.currentTime);
  }

  updateParameters(params: Partial<FilterConfig>): void {
    Object.assign(this.parameters, params);
    this.node.type = this.parameters.type;
    this.node.frequency.setValueAtTime(this.parameters.frequency, this.node.context.currentTime);
    this.node.Q.setValueAtTime(this.parameters.Q, this.node.context.currentTime);
    this.node.gain.setValueAtTime(this.parameters.gain, this.node.context.currentTime);
  }
}

export interface FilterConfig {
  name?: string;
  type: BiquadFilterType;
  frequency: number;
  Q: number;
  gain: number;
}

/**
 * Efecto de Distorsión
 */
export class DistortionEffect implements AudioEffect {
  public name: string;
  public node: WaveShaperNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.DISTORTION;
  public enabled: boolean = true;

  constructor(audioContext: AudioContext, config: Partial<DistortionConfig> = {}) {
    this.name = config.name || 'Distortion';
    this.parameters = {
      amount: config.amount || 50,
      oversample: config.oversample || '2x'
    };

    this.node = audioContext.createWaveShaper();
    this.node.oversample = this.parameters.oversample;
    this.createDistortionCurve();
  }

  private createDistortionCurve(): void {
    const amount = this.parameters.amount;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    this.node.curve = curve;
  }

  updateParameters(params: Partial<DistortionConfig>): void {
    Object.assign(this.parameters, params);
    this.createDistortionCurve();
  }
}

export interface DistortionConfig {
  name?: string;
  amount: number;
  oversample: OverSampleType;
}

/**
 * Efecto de Chorus
 */
export class ChorusEffect implements AudioEffect {
  public name: string;
  public node: GainNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.CHORUS;
  public enabled: boolean = true;

  private delayNode: DelayNode;
  private oscillator: OscillatorNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(audioContext: AudioContext, config: Partial<ChorusConfig> = {}) {
    this.name = config.name || 'Chorus';
    this.parameters = {
      rate: config.rate || 1.5,
      depth: config.depth || 0.002,
      delay: config.delay || 0.0045,
      feedback: config.feedback || 0.2,
      mix: config.mix || 0.5
    };

    // Crear nodos
    this.node = audioContext.createGain();
    this.delayNode = audioContext.createDelay(0.01);
    this.oscillator = audioContext.createOscillator();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();

    // Configurar oscilador
    this.oscillator.frequency.setValueAtTime(this.parameters.rate, audioContext.currentTime);
    this.oscillator.type = 'sine';

    // Configurar ganancias
    this.wetGain.gain.setValueAtTime(this.parameters.mix, audioContext.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.parameters.mix, audioContext.currentTime);

    // Conectar nodos
    this.oscillator.connect(this.delayNode.delayTime);
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.node);
    this.dryGain.connect(this.node);

    // Iniciar oscilador
    this.oscillator.start();
  }

  updateParameters(params: Partial<ChorusConfig>): void {
    Object.assign(this.parameters, params);
    
    this.oscillator.frequency.setValueAtTime(this.parameters.rate, this.node.context.currentTime);
    this.wetGain.gain.setValueAtTime(this.parameters.mix, this.node.context.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.parameters.mix, this.node.context.currentTime);
  }
}

export interface ChorusConfig {
  name?: string;
  rate: number;
  depth: number;
  delay: number;
  feedback: number;
  mix: number;
}

/**
 * Efecto de Flanger
 */
export class FlangerEffect implements AudioEffect {
  public name: string;
  public node: GainNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.FLANGER;
  public enabled: boolean = true;

  private delayNode: DelayNode;
  private oscillator: OscillatorNode;
  private feedbackGain: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(audioContext: AudioContext, config: Partial<FlangerConfig> = {}) {
    this.name = config.name || 'Flanger';
    this.parameters = {
      rate: config.rate || 0.1,
      depth: config.depth || 0.002,
      delay: config.delay || 0.003,
      feedback: config.feedback || 0.3,
      mix: config.mix || 0.5
    };

    // Crear nodos
    this.node = audioContext.createGain();
    this.delayNode = audioContext.createDelay(0.01);
    this.oscillator = audioContext.createOscillator();
    this.feedbackGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();

    // Configurar oscilador
    this.oscillator.frequency.setValueAtTime(this.parameters.rate, audioContext.currentTime);
    this.oscillator.type = 'sine';

    // Configurar ganancias
    this.feedbackGain.gain.setValueAtTime(this.parameters.feedback, audioContext.currentTime);
    this.wetGain.gain.setValueAtTime(this.parameters.mix, audioContext.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.parameters.mix, audioContext.currentTime);

    // Conectar nodos
    this.oscillator.connect(this.delayNode.delayTime);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.node);
    this.dryGain.connect(this.node);

    // Iniciar oscilador
    this.oscillator.start();
  }

  updateParameters(params: Partial<FlangerConfig>): void {
    Object.assign(this.parameters, params);
    
    this.oscillator.frequency.setValueAtTime(this.parameters.rate, this.node.context.currentTime);
    this.feedbackGain.gain.setValueAtTime(this.parameters.feedback, this.node.context.currentTime);
    this.wetGain.gain.setValueAtTime(this.parameters.mix, this.node.context.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.parameters.mix, this.node.context.currentTime);
  }
}

export interface FlangerConfig {
  name?: string;
  rate: number;
  depth: number;
  delay: number;
  feedback: number;
  mix: number;
}

/**
 * Efecto de Phaser
 */
export class PhaserEffect implements AudioEffect {
  public name: string;
  public node: GainNode;
  public parameters: Record<string, any>;
  public type: EffectType = EffectType.PHASER;
  public enabled: boolean = true;

  private filters: BiquadFilterNode[] = [];
  private oscillator: OscillatorNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(audioContext: AudioContext, config: Partial<PhaserConfig> = {}) {
    this.name = config.name || 'Phaser';
    this.parameters = {
      rate: config.rate || 0.1,
      depth: config.depth || 0.6,
      feedback: config.feedback || 0.2,
      stages: config.stages || 4,
      mix: config.mix || 0.5
    };

    // Crear nodos
    this.node = audioContext.createGain();
    this.oscillator = audioContext.createOscillator();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();

    // Crear filtros
    for (let i = 0; i < this.parameters.stages; i++) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      this.filters.push(filter);
    }

    // Configurar oscilador
    this.oscillator.frequency.setValueAtTime(this.parameters.rate, audioContext.currentTime);
    this.oscillator.type = 'sine';

    // Configurar ganancias
    this.wetGain.gain.setValueAtTime(this.parameters.mix, audioContext.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.parameters.mix, audioContext.currentTime);

    // Conectar filtros
    let currentNode: AudioNode = this.filters[0];
    for (let i = 1; i < this.filters.length; i++) {
      currentNode.connect(this.filters[i]);
      currentNode = this.filters[i];
    }

    // Conectar oscilador a todos los filtros
    this.filters.forEach(filter => {
      this.oscillator.connect(filter.frequency);
    });

    // Conectar nodos finales
    currentNode.connect(this.wetGain);
    this.wetGain.connect(this.node);
    this.dryGain.connect(this.node);

    // Iniciar oscilador
    this.oscillator.start();
  }

  updateParameters(params: Partial<PhaserConfig>): void {
    Object.assign(this.parameters, params);
    
    this.oscillator.frequency.setValueAtTime(this.parameters.rate, this.node.context.currentTime);
    this.wetGain.gain.setValueAtTime(this.parameters.mix, this.node.context.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.parameters.mix, this.node.context.currentTime);
  }
}

export interface PhaserConfig {
  name?: string;
  rate: number;
  depth: number;
  feedback: number;
  stages: number;
  mix: number;
}

/**
 * Factory para crear efectos de audio
 */
export class AudioEffectFactory {
  static createEffect(
    audioContext: AudioContext,
    type: EffectType,
    config: any = {}
  ): AudioEffect {
    switch (type) {
      case EffectType.REVERB:
        return new ReverbEffect(audioContext, config);
      case EffectType.DELAY:
        return new DelayEffect(audioContext, config);
      case EffectType.FILTER:
        return new FilterEffect(audioContext, config);
      case EffectType.DISTORTION:
        return new DistortionEffect(audioContext, config);
      case EffectType.CHORUS:
        return new ChorusEffect(audioContext, config);
      case EffectType.FLANGER:
        return new FlangerEffect(audioContext, config);
      case EffectType.PHASER:
        return new PhaserEffect(audioContext, config);
      default:
        throw new Error(`Unknown effect type: ${type}`);
    }
  }

  static getEffectTypes(): EffectType[] {
    return Object.values(EffectType);
  }

  static getDefaultConfig(type: EffectType): any {
    switch (type) {
      case EffectType.REVERB:
        return {
          roomSize: 0.5,
          dampening: 0.5,
          wetLevel: 0.3,
          dryLevel: 0.7
        };
      case EffectType.DELAY:
        return {
          delayTime: 0.3,
          feedback: 0.3,
          mix: 0.5
        };
      case EffectType.FILTER:
        return {
          type: 'lowpass',
          frequency: 1000,
          Q: 1,
          gain: 0
        };
      case EffectType.DISTORTION:
        return {
          amount: 50,
          oversample: '2x'
        };
      case EffectType.CHORUS:
        return {
          rate: 1.5,
          depth: 0.002,
          delay: 0.0045,
          feedback: 0.2,
          mix: 0.5
        };
      case EffectType.FLANGER:
        return {
          rate: 0.1,
          depth: 0.002,
          delay: 0.003,
          feedback: 0.3,
          mix: 0.5
        };
      case EffectType.PHASER:
        return {
          rate: 0.1,
          depth: 0.6,
          feedback: 0.2,
          stages: 4,
          mix: 0.5
        };
      default:
        return {};
    }
  }
} 