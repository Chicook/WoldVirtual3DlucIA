/**
 * AudioConfig - Configuraciones del Sistema de Audio 3D
 * 
 * Configuraciones predefinidas y constantes para el sistema de audio.
 */

import { AudioType, EffectType } from './AudioManager';

export interface AudioSystemConfig {
  masterVolume: number;
  effectsEnabled: boolean;
  spatialEnabled: boolean;
  ambientEnabled: boolean;
  maxConcurrentAudios: number;
  sampleRate: number;
  bufferSize: number;
  latency: number;
  compression: boolean;
  spatialQuality: 'low' | 'medium' | 'high' | 'ultra';
  reverbQuality: 'low' | 'medium' | 'high';
  effectsQuality: 'low' | 'medium' | 'high';
}

export interface AudioPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<AudioSystemConfig>;
  effects: AudioEffectPreset[];
  ambient: AmbientPreset[];
}

export interface AudioEffectPreset {
  type: EffectType;
  name: string;
  parameters: Record<string, number>;
  enabled: boolean;
}

export interface AmbientPreset {
  id: string;
  name: string;
  sources: string[];
  volume: number;
  crossfade: number;
  loop: boolean;
  spatial: boolean;
  position: { x: number; y: number; z: number };
  radius: number;
}

export interface AudioEnvironment {
  id: string;
  name: string;
  description: string;
  reverb: {
    roomSize: number;
    dampening: number;
    wetLevel: number;
    dryLevel: number;
  };
  ambience: {
    sources: string[];
    volume: number;
    crossfade: number;
  };
  effects: AudioEffectPreset[];
  zones: AudioZone[];
}

export interface AudioZone {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  radius: number;
  falloff: number;
  effects: string[];
  volume: number;
  enabled: boolean;
}

/**
 * Configuraciones predefinidas del sistema
 */
export const DEFAULT_AUDIO_CONFIG: AudioSystemConfig = {
  masterVolume: 1.0,
  effectsEnabled: true,
  spatialEnabled: true,
  ambientEnabled: true,
  maxConcurrentAudios: 32,
  sampleRate: 44100,
  bufferSize: 2048,
  latency: 0.1,
  compression: true,
  spatialQuality: 'high',
  reverbQuality: 'high',
  effectsQuality: 'high'
};

/**
 * Presets de audio predefinidos
 */
export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Configuración por defecto del sistema',
    config: {
      masterVolume: 1.0,
      effectsEnabled: true,
      spatialEnabled: true,
      ambientEnabled: true
    },
    effects: [],
    ambient: []
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Configuración para experiencias cinematográficas',
    config: {
      masterVolume: 0.9,
      effectsEnabled: true,
      spatialEnabled: true,
      ambientEnabled: true,
      spatialQuality: 'ultra',
      reverbQuality: 'high'
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'Cinematic Reverb',
        parameters: {
          roomSize: 0.8,
          dampening: 0.3,
          wetLevel: 0.4,
          dryLevel: 0.6
        },
        enabled: true
      },
      {
        type: EffectType.COMPRESSOR,
        name: 'Dynamic Range',
        parameters: {
          threshold: -20,
          ratio: 4,
          attack: 0.01,
          release: 0.1
        },
        enabled: true
      }
    ],
    ambient: [
      {
        id: 'cinematic-ambient',
        name: 'Cinematic Ambient',
        sources: ['ambient-cinematic.mp3'],
        volume: 0.3,
        crossfade: 3.0,
        loop: true,
        spatial: true,
        position: { x: 0, y: 0, z: 0 },
        radius: 100
      }
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Configuración optimizada para juegos',
    config: {
      masterVolume: 0.8,
      effectsEnabled: true,
      spatialEnabled: true,
      ambientEnabled: true,
      maxConcurrentAudios: 64,
      latency: 0.05,
      spatialQuality: 'high'
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'Game Reverb',
        parameters: {
          roomSize: 0.4,
          dampening: 0.6,
          wetLevel: 0.2,
          dryLevel: 0.8
        },
        enabled: true
      },
      {
        type: EffectType.COMPRESSOR,
        name: 'Game Compression',
        parameters: {
          threshold: -15,
          ratio: 3,
          attack: 0.005,
          release: 0.05
        },
        enabled: true
      }
    ],
    ambient: [
      {
        id: 'game-ambient',
        name: 'Game Ambient',
        sources: ['ambient-game.mp3'],
        volume: 0.2,
        crossfade: 2.0,
        loop: true,
        spatial: true,
        position: { x: 0, y: 0, z: 0 },
        radius: 50
      }
    ]
  },
  {
    id: 'vr',
    name: 'VR',
    description: 'Configuración optimizada para realidad virtual',
    config: {
      masterVolume: 0.7,
      effectsEnabled: true,
      spatialEnabled: true,
      ambientEnabled: true,
      maxConcurrentAudios: 128,
      latency: 0.02,
      spatialQuality: 'ultra',
      reverbQuality: 'high'
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'VR Reverb',
        parameters: {
          roomSize: 0.6,
          dampening: 0.4,
          wetLevel: 0.3,
          dryLevel: 0.7
        },
        enabled: true
      },
      {
        type: EffectType.FILTER,
        name: 'VR Headphones',
        parameters: {
          type: 0, // lowpass
          frequency: 18000,
          Q: 1,
          gain: 0
        },
        enabled: true
      }
    ],
    ambient: [
      {
        id: 'vr-ambient',
        name: 'VR Ambient',
        sources: ['ambient-vr.mp3'],
        volume: 0.15,
        crossfade: 1.5,
        loop: true,
        spatial: true,
        position: { x: 0, y: 0, z: 0 },
        radius: 200
      }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Configuración minimalista sin efectos',
    config: {
      masterVolume: 1.0,
      effectsEnabled: false,
      spatialEnabled: true,
      ambientEnabled: false,
      maxConcurrentAudios: 16,
      spatialQuality: 'medium'
    },
    effects: [],
    ambient: []
  }
];

/**
 * Entornos de audio predefinidos
 */
export const AUDIO_ENVIRONMENTS: AudioEnvironment[] = [
  {
    id: 'outdoor',
    name: 'Outdoor',
    description: 'Ambiente exterior abierto',
    reverb: {
      roomSize: 0.1,
      dampening: 0.8,
      wetLevel: 0.1,
      dryLevel: 0.9
    },
    ambience: {
      sources: ['wind.mp3', 'birds.mp3', 'leaves.mp3'],
      volume: 0.3,
      crossfade: 2.0
    },
    effects: [
      {
        type: EffectType.FILTER,
        name: 'Air Absorption',
        parameters: {
          type: 0, // lowpass
          frequency: 8000,
          Q: 1,
          gain: 0
        },
        enabled: true
      }
    ],
    zones: []
  },
  {
    id: 'indoor-small',
    name: 'Indoor Small',
    description: 'Habitación pequeña interior',
    reverb: {
      roomSize: 0.3,
      dampening: 0.7,
      wetLevel: 0.2,
      dryLevel: 0.8
    },
    ambience: {
      sources: ['room-tone.mp3'],
      volume: 0.1,
      crossfade: 1.0
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'Small Room',
        parameters: {
          roomSize: 0.3,
          dampening: 0.7,
          wetLevel: 0.2,
          dryLevel: 0.8
        },
        enabled: true
      }
    ],
    zones: []
  },
  {
    id: 'indoor-large',
    name: 'Indoor Large',
    description: 'Espacio grande interior',
    reverb: {
      roomSize: 0.7,
      dampening: 0.4,
      wetLevel: 0.4,
      dryLevel: 0.6
    },
    ambience: {
      sources: ['large-room.mp3', 'echo.mp3'],
      volume: 0.2,
      crossfade: 2.5
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'Large Room',
        parameters: {
          roomSize: 0.7,
          dampening: 0.4,
          wetLevel: 0.4,
          dryLevel: 0.6
        },
        enabled: true
      },
      {
        type: EffectType.DELAY,
        name: 'Echo',
        parameters: {
          delayTime: 0.1,
          feedback: 0.3,
          mix: 0.2
        },
        enabled: true
      }
    ],
    zones: []
  },
  {
    id: 'cave',
    name: 'Cave',
    description: 'Cueva o espacio subterráneo',
    reverb: {
      roomSize: 0.9,
      dampening: 0.2,
      wetLevel: 0.6,
      dryLevel: 0.4
    },
    ambience: {
      sources: ['dripping.mp3', 'echo.mp3', 'wind-cave.mp3'],
      volume: 0.4,
      crossfade: 3.0
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'Cave Reverb',
        parameters: {
          roomSize: 0.9,
          dampening: 0.2,
          wetLevel: 0.6,
          dryLevel: 0.4
        },
        enabled: true
      },
      {
        type: EffectType.DELAY,
        name: 'Cave Echo',
        parameters: {
          delayTime: 0.3,
          feedback: 0.5,
          mix: 0.4
        },
        enabled: true
      },
      {
        type: EffectType.FILTER,
        name: 'Cave Filter',
        parameters: {
          type: 0, // lowpass
          frequency: 4000,
          Q: 2,
          gain: -3
        },
        enabled: true
      }
    ],
    zones: []
  },
  {
    id: 'underwater',
    name: 'Underwater',
    description: 'Ambiente submarino',
    reverb: {
      roomSize: 0.8,
      dampening: 0.1,
      wetLevel: 0.7,
      dryLevel: 0.3
    },
    ambience: {
      sources: ['bubbles.mp3', 'water-movement.mp3'],
      volume: 0.5,
      crossfade: 2.0
    },
    effects: [
      {
        type: EffectType.REVERB,
        name: 'Water Reverb',
        parameters: {
          roomSize: 0.8,
          dampening: 0.1,
          wetLevel: 0.7,
          dryLevel: 0.3
        },
        enabled: true
      },
      {
        type: EffectType.FILTER,
        name: 'Water Filter',
        parameters: {
          type: 0, // lowpass
          frequency: 2000,
          Q: 3,
          gain: -6
        },
        enabled: true
      },
      {
        type: EffectType.CHORUS,
        name: 'Water Movement',
        parameters: {
          rate: 0.5,
          depth: 0.003,
          delay: 0.002,
          feedback: 0.1,
          mix: 0.3
        },
        enabled: true
      }
    ],
    zones: []
  }
];

/**
 * Configuraciones de calidad
 */
export const QUALITY_CONFIGS = {
  spatial: {
    low: {
      maxDistance: 50,
      refDistance: 2,
      rolloffFactor: 1,
      panningModel: 'equalpower' as const
    },
    medium: {
      maxDistance: 100,
      refDistance: 1,
      rolloffFactor: 1,
      panningModel: 'HRTF' as const
    },
    high: {
      maxDistance: 200,
      refDistance: 1,
      rolloffFactor: 1,
      panningModel: 'HRTF' as const
    },
    ultra: {
      maxDistance: 500,
      refDistance: 0.5,
      rolloffFactor: 1,
      panningModel: 'HRTF' as const
    }
  },
  reverb: {
    low: {
      roomSize: 0.3,
      dampening: 0.5,
      wetLevel: 0.2,
      dryLevel: 0.8
    },
    medium: {
      roomSize: 0.5,
      dampening: 0.5,
      wetLevel: 0.3,
      dryLevel: 0.7
    },
    high: {
      roomSize: 0.7,
      dampening: 0.4,
      wetLevel: 0.4,
      dryLevel: 0.6
    }
  },
  effects: {
    low: {
      enabled: false
    },
    medium: {
      enabled: true,
      maxEffects: 2
    },
    high: {
      enabled: true,
      maxEffects: 5
    }
  }
};

/**
 * Configuraciones de rendimiento
 */
export const PERFORMANCE_CONFIGS = {
  low: {
    maxConcurrentAudios: 16,
    sampleRate: 22050,
    bufferSize: 4096,
    latency: 0.2,
    spatialQuality: 'low' as const,
    reverbQuality: 'low' as const,
    effectsQuality: 'low' as const
  },
  medium: {
    maxConcurrentAudios: 32,
    sampleRate: 44100,
    bufferSize: 2048,
    latency: 0.1,
    spatialQuality: 'medium' as const,
    reverbQuality: 'medium' as const,
    effectsQuality: 'medium' as const
  },
  high: {
    maxConcurrentAudios: 64,
    sampleRate: 48000,
    bufferSize: 1024,
    latency: 0.05,
    spatialQuality: 'high' as const,
    reverbQuality: 'high' as const,
    effectsQuality: 'high' as const
  },
  ultra: {
    maxConcurrentAudios: 128,
    sampleRate: 96000,
    bufferSize: 512,
    latency: 0.02,
    spatialQuality: 'ultra' as const,
    reverbQuality: 'high' as const,
    effectsQuality: 'high' as const
  }
};

/**
 * Utilidades de configuración
 */
export class AudioConfigUtils {
  /**
   * Obtiene una configuración por nombre
   */
  static getPreset(presetId: string): AudioPreset | null {
    return AUDIO_PRESETS.find(preset => preset.id === presetId) || null;
  }

  /**
   * Obtiene un entorno por nombre
   */
  static getEnvironment(environmentId: string): AudioEnvironment | null {
    return AUDIO_ENVIRONMENTS.find(env => env.id === environmentId) || null;
  }

  /**
   * Obtiene configuración de calidad
   */
  static getQualityConfig(quality: 'low' | 'medium' | 'high' | 'ultra') {
    return {
      spatial: QUALITY_CONFIGS.spatial[quality] || QUALITY_CONFIGS.spatial.medium,
      reverb: QUALITY_CONFIGS.reverb[quality] || QUALITY_CONFIGS.reverb.medium,
      effects: QUALITY_CONFIGS.effects[quality] || QUALITY_CONFIGS.effects.medium
    };
  }

  /**
   * Obtiene configuración de rendimiento
   */
  static getPerformanceConfig(performance: 'low' | 'medium' | 'high' | 'ultra') {
    return PERFORMANCE_CONFIGS[performance] || PERFORMANCE_CONFIGS.medium;
  }

  /**
   * Combina configuraciones
   */
  static mergeConfigs(base: AudioSystemConfig, override: Partial<AudioSystemConfig>): AudioSystemConfig {
    return { ...base, ...override };
  }

  /**
   * Valida una configuración
   */
  static validateConfig(config: AudioSystemConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.masterVolume < 0 || config.masterVolume > 1) {
      errors.push('masterVolume must be between 0 and 1');
    }

    if (config.maxConcurrentAudios < 1 || config.maxConcurrentAudios > 256) {
      errors.push('maxConcurrentAudios must be between 1 and 256');
    }

    if (![22050, 44100, 48000, 96000].includes(config.sampleRate)) {
      errors.push('sampleRate must be 22050, 44100, 48000, or 96000');
    }

    if (![512, 1024, 2048, 4096].includes(config.bufferSize)) {
      errors.push('bufferSize must be 512, 1024, 2048, or 4096');
    }

    if (config.latency < 0.01 || config.latency > 1) {
      errors.push('latency must be between 0.01 and 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Optimiza configuración para el dispositivo
   */
  static optimizeForDevice(): AudioSystemConfig {
    // Detectar capacidades del dispositivo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasWebAudio = typeof AudioContext !== 'undefined';
    const hasWebGL = typeof WebGLRenderingContext !== 'undefined';

    if (isMobile) {
      return PERFORMANCE_CONFIGS.low;
    } else if (hasWebAudio && hasWebGL) {
      return PERFORMANCE_CONFIGS.high;
    } else {
      return PERFORMANCE_CONFIGS.medium;
    }
  }
} 