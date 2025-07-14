/**
 * Sistema de Audio 3D Enterprise
 * 
 * Exportaciones principales del sistema de audio para el editor 3D.
 */

// Audio Manager Principal
export { AudioManager, Audio3D } from './AudioManager';
export type { 
  AudioEvents, 
  AudioConfig, 
  AudioType, 
  AudioMetadata, 
  AmbientAudio, 
  AudioListener 
} from './AudioManager';

// Efectos de Audio
export { 
  AudioEffectFactory,
  ReverbEffect,
  DelayEffect,
  FilterEffect,
  DistortionEffect,
  ChorusEffect,
  FlangerEffect,
  PhaserEffect
} from './AudioEffects';
export type { 
  AudioEffectConfig, 
  AudioEffect,
  ReverbConfig,
  DelayConfig,
  FilterConfig,
  DistortionConfig,
  ChorusConfig,
  FlangerConfig,
  PhaserConfig
} from './AudioEffects';
export { EffectType } from './AudioEffects';

// Audio Espacial
export { AudioSpatial, SpatialAudioUtils } from './AudioSpatial';
export type { 
  SpatialAudioConfig, 
  SpatialListener, 
  SpatialZone, 
  SpatialReverb 
} from './AudioSpatial';

// Configuraciones predefinidas
export const DEFAULT_AUDIO_CONFIG = {
  volume: 1.0,
  loop: false,
  spatial: true,
  maxDistance: 100,
  rolloffFactor: 1.0,
  refDistance: 1.0,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0.0
};

export const DEFAULT_SPATIAL_CONFIG = {
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 0, y: 0, z: -1 },
  velocity: { x: 0, y: 0, z: 0 },
  maxDistance: 100,
  refDistance: 1,
  rolloffFactor: 1,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0,
  panningModel: 'HRTF' as const,
  distanceModel: 'inverse' as const
};

export const DEFAULT_EFFECT_CONFIGS = {
  reverb: {
    roomSize: 0.5,
    dampening: 0.5,
    wetLevel: 0.3,
    dryLevel: 0.7
  },
  delay: {
    delayTime: 0.3,
    feedback: 0.3,
    mix: 0.5
  },
  filter: {
    type: 'lowpass' as const,
    frequency: 1000,
    Q: 1,
    gain: 0
  },
  distortion: {
    amount: 50,
    oversample: '2x' as const
  },
  chorus: {
    rate: 1.5,
    depth: 0.002,
    delay: 0.0045,
    feedback: 0.2,
    mix: 0.5
  },
  flanger: {
    rate: 0.1,
    depth: 0.002,
    delay: 0.003,
    feedback: 0.3,
    mix: 0.5
  },
  phaser: {
    rate: 0.1,
    depth: 0.6,
    feedback: 0.2,
    stages: 4,
    mix: 0.5
  }
};

// Utilidades de audio
export class AudioUtils {
  /**
   * Convierte decibelios a ganancia lineal
   */
  static dbToGain(db: number): number {
    return Math.pow(10, db / 20);
  }

  /**
   * Convierte ganancia lineal a decibelios
   */
  static gainToDb(gain: number): number {
    return 20 * Math.log10(gain);
  }

  /**
   * Normaliza un valor de audio
   */
  static normalize(value: number, min: number = -1, max: number = 1): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Aplica curva de respuesta de frecuencia
   */
  static applyFrequencyCurve(frequency: number, curve: number[]): number {
    const index = Math.floor((frequency / 20000) * (curve.length - 1));
    return curve[Math.max(0, Math.min(curve.length - 1, index))];
  }

  /**
   * Calcula el RMS (Root Mean Square) de un buffer de audio
   */
  static calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Detecta el pitch de un buffer de audio
   */
  static detectPitch(buffer: Float32Array, sampleRate: number): number {
    // Implementación básica de detección de pitch
    // En un sistema real, usaría algoritmos más avanzados como YIN o autocorrelación
    
    let maxCorrelation = 0;
    let pitch = 0;

    for (let lag = 50; lag < buffer.length / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < buffer.length - lag; i++) {
        correlation += buffer[i] * buffer[i + lag];
      }
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        pitch = sampleRate / lag;
      }
    }

    return pitch;
  }

  /**
   * Aplica compresión dinámica
   */
  static applyCompression(
    input: number,
    threshold: number,
    ratio: number,
    attack: number,
    release: number
  ): number {
    if (input <= threshold) return input;

    const overThreshold = input - threshold;
    const compressed = threshold + (overThreshold / ratio);
    
    return Math.min(input, compressed);
  }

  /**
   * Genera ruido blanco
   */
  static generateWhiteNoise(length: number): Float32Array {
    const noise = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      noise[i] = (Math.random() * 2 - 1) * 0.5;
    }
    return noise;
  }

  /**
   * Genera ruido rosa
   */
  static generatePinkNoise(length: number): Float32Array {
    const noise = new Float32Array(length);
    const b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < length; i++) {
      const white = (Math.random() * 2 - 1) * 0.5;
      
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      noise[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
    }
    
    return noise;
  }

  /**
   * Aplica filtro de paso bajo
   */
  static applyLowPassFilter(
    input: Float32Array,
    cutoffFrequency: number,
    sampleRate: number
  ): Float32Array {
    const output = new Float32Array(input.length);
    const rc = 1.0 / (cutoffFrequency * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = dt / (rc + dt);
    
    output[0] = input[0];
    for (let i = 1; i < input.length; i++) {
      output[i] = output[i - 1] + alpha * (input[i] - output[i - 1]);
    }
    
    return output;
  }

  /**
   * Aplica filtro de paso alto
   */
  static applyHighPassFilter(
    input: Float32Array,
    cutoffFrequency: number,
    sampleRate: number
  ): Float32Array {
    const output = new Float32Array(input.length);
    const rc = 1.0 / (cutoffFrequency * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = rc / (rc + dt);
    
    output[0] = input[0];
    for (let i = 1; i < input.length; i++) {
      output[i] = alpha * (output[i - 1] + input[i] - input[i - 1]);
    }
    
    return output;
  }
}

// Constantes de audio
export const AUDIO_CONSTANTS = {
  SAMPLE_RATES: {
    CD_QUALITY: 44100,
    DVD_QUALITY: 48000,
    HIGH_QUALITY: 96000,
    ULTRA_QUALITY: 192000
  },
  BIT_DEPTHS: {
    CD_QUALITY: 16,
    DVD_QUALITY: 24,
    HIGH_QUALITY: 32
  },
  CHANNELS: {
    MONO: 1,
    STEREO: 2,
    SURROUND_5_1: 6,
    SURROUND_7_1: 8
  },
  FREQUENCIES: {
    SUB_BASS: 20,
    BASS: 250,
    LOW_MID: 500,
    MID: 2000,
    HIGH_MID: 4000,
    PRESENCE: 6000,
    BRILLIANCE: 20000
  },
  SPEED_OF_SOUND: 343, // m/s en aire a 20°C
  MIN_AUDIBLE_PRESSURE: 2e-5, // Pa
  MAX_AUDIBLE_PRESSURE: 20, // Pa
  REFERENCE_PRESSURE: 2e-5 // Pa
};

// Tipos de exportación
export type AudioSystem = {
  manager: typeof AudioManager;
  spatial: typeof AudioSpatial;
  effects: typeof AudioEffectFactory;
  utils: typeof AudioUtils;
  constants: typeof AUDIO_CONSTANTS;
};

// Exportación principal
export const AudioSystem: AudioSystem = {
  manager: AudioManager,
  spatial: AudioSpatial,
  effects: AudioEffectFactory,
  utils: AudioUtils,
  constants: AUDIO_CONSTANTS
};

export default AudioSystem; 