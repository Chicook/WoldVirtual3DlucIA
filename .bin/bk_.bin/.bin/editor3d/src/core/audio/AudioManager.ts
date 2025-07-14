/**
 * AudioManager - Sistema de Audio 3D Enterprise
 * 
 * Gestión centralizada de audio espacial, efectos 3D y música ambiental
 * para el editor 3D del metaverso.
 */

import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3 } from '../scene/math/Vector3';
import { Injectable, Inject } from '../di/decorators';

export interface AudioEvents {
  'audio:loaded': { audio: Audio3D; source: string };
  'audio:play': { audio: Audio3D; position: Vector3 };
  'audio:stop': { audio: Audio3D };
  'audio:volume:changed': { audio: Audio3D; volume: number };
  'audio:position:changed': { audio: Audio3D; position: Vector3 };
  'audio:error': { audio: Audio3D; error: Error };
  'ambient:changed': { ambient: AmbientAudio; enabled: boolean };
  'effects:enabled': { enabled: boolean };
  'master:volume:changed': { volume: number };
}

export interface AudioConfig {
  id: string;
  name: string;
  type: AudioType;
  source: string;
  volume?: number;
  loop?: boolean;
  spatial?: boolean;
  maxDistance?: number;
  rolloffFactor?: number;
  refDistance?: number;
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterGain?: number;
  metadata?: AudioMetadata;
}

export enum AudioType {
  SFX = 'sfx',
  MUSIC = 'music',
  AMBIENT = 'ambient',
  VOICE = 'voice',
  UI = 'ui'
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: string;
  fileSize: number;
  tags: string[];
  description?: string;
}

export interface AmbientAudio {
  id: string;
  name: string;
  sources: string[];
  volume: number;
  crossfade: number;
  loop: boolean;
  spatial: boolean;
  position: Vector3;
  radius: number;
  enabled: boolean;
}

export interface AudioListener {
  position: Vector3;
  orientation: Vector3;
  velocity: Vector3;
  up: Vector3;
}

/**
 * Audio 3D con soporte espacial y efectos
 */
export class Audio3D {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AudioType;
  public readonly source: string;
  
  public volume: number = 1.0;
  public loop: boolean = false;
  public spatial: boolean = true;
  public maxDistance: number = 100;
  public rolloffFactor: number = 1.0;
  public refDistance: number = 1.0;
  public coneInnerAngle: number = 360;
  public coneOuterAngle: number = 360;
  public coneOuterGain: number = 0.0;
  
  public position: Vector3 = new Vector3(0, 0, 0);
  public velocity: Vector3 = new Vector3(0, 0, 0);
  public orientation: Vector3 = new Vector3(0, 0, -1);
  
  public metadata: AudioMetadata | null = null;
  
  private _audioContext: AudioContext | null = null;
  private _audioBuffer: AudioBuffer | null = null;
  private _source: AudioBufferSourceNode | null = null;
  private _gainNode: GainNode | null = null;
  private _pannerNode: PannerNode | null = null;
  private _filters: BiquadFilterNode[] = [];
  private _effects: AudioEffect[] = [];
  
  private _loaded: boolean = false;
  private _playing: boolean = false;
  private _paused: boolean = false;
  private _startTime: number = 0;
  private _pauseTime: number = 0;

  constructor(config: AudioConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.source = config.source;
    
    if (config.volume !== undefined) this.volume = config.volume;
    if (config.loop !== undefined) this.loop = config.loop;
    if (config.spatial !== undefined) this.spatial = config.spatial;
    if (config.maxDistance !== undefined) this.maxDistance = config.maxDistance;
    if (config.rolloffFactor !== undefined) this.rolloffFactor = config.rolloffFactor;
    if (config.refDistance !== undefined) this.refDistance = config.refDistance;
    if (config.coneInnerAngle !== undefined) this.coneInnerAngle = config.coneInnerAngle;
    if (config.coneOuterAngle !== undefined) this.coneOuterAngle = config.coneOuterAngle;
    if (config.coneOuterGain !== undefined) this.coneOuterGain = config.coneOuterGain;
    if (config.metadata) this.metadata = config.metadata;
  }

  /**
   * Carga el audio desde la fuente
   */
  async load(audioContext: AudioContext): Promise<void> {
    try {
      this._audioContext = audioContext;
      
      const response = await fetch(this.source);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      this._audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      this._loaded = true;
      
      // Crear nodos de audio
      this._gainNode = audioContext.createGain();
      this._gainNode.gain.value = this.volume;
      
      if (this.spatial) {
        this._pannerNode = audioContext.createPanner();
        this._pannerNode.panningModel = 'HRTF';
        this._pannerNode.distanceModel = 'inverse';
        this._pannerNode.maxDistance = this.maxDistance;
        this._pannerNode.rolloffFactor = this.rolloffFactor;
        this._pannerNode.refDistance = this.refDistance;
        this._pannerNode.coneInnerAngle = this.coneInnerAngle;
        this._pannerNode.coneOuterAngle = this.coneOuterAngle;
        this._pannerNode.coneOuterGain = this.coneOuterGain;
      }
      
    } catch (error) {
      throw new Error(`Error loading audio ${this.name}: ${error}`);
    }
  }

  /**
   * Reproduce el audio
   */
  play(listener: AudioListener): void {
    if (!this._loaded || !this._audioContext || !this._audioBuffer) {
      throw new Error('Audio not loaded');
    }

    if (this._playing) {
      this.stop();
    }

    this._source = this._audioContext.createBufferSource();
    this._source.buffer = this._audioBuffer;
    this._source.loop = this.loop;

    // Conectar nodos
    if (this.spatial && this._pannerNode) {
      this._source.connect(this._pannerNode);
      this._pannerNode.connect(this._gainNode!);
      this._gainNode!.connect(this._audioContext.destination);
      
      // Actualizar posición espacial
      this.updateSpatialPosition(listener);
    } else {
      this._source.connect(this._gainNode!);
      this._gainNode!.connect(this._audioContext.destination);
    }

    // Aplicar efectos
    this.applyEffects();

    this._source.start(0, this._paused ? this._pauseTime : 0);
    this._playing = true;
    this._paused = false;
    this._startTime = this._audioContext.currentTime - (this._paused ? this._pauseTime : 0);
  }

  /**
   * Pausa el audio
   */
  pause(): void {
    if (!this._playing || !this._source) return;

    this._source.stop();
    this._playing = false;
    this._paused = true;
    this._pauseTime = this._audioContext!.currentTime - this._startTime;
  }

  /**
   * Detiene el audio
   */
  stop(): void {
    if (!this._playing || !this._source) return;

    this._source.stop();
    this._playing = false;
    this._paused = false;
    this._pauseTime = 0;
  }

  /**
   * Actualiza la posición espacial
   */
  updateSpatialPosition(listener: AudioListener): void {
    if (!this.spatial || !this._pannerNode) return;

    this._pannerNode.setPosition(this.position.x, this.position.y, this.position.z);
    this._pannerNode.setVelocity(this.velocity.x, this.velocity.y, this.velocity.z);
    this._pannerNode.setOrientation(this.orientation.x, this.orientation.y, this.orientation.z);
  }

  /**
   * Establece el volumen
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this._gainNode) {
      this._gainNode.gain.setValueAtTime(this.volume, this._audioContext!.currentTime);
    }
  }

  /**
   * Aplica efectos de audio
   */
  private applyEffects(): void {
    if (!this._audioContext || !this._source) return;

    let currentNode: AudioNode = this._source;

    // Aplicar filtros
    for (const filter of this._filters) {
      currentNode.connect(filter);
      currentNode = filter;
    }

    // Aplicar efectos
    for (const effect of this._effects) {
      currentNode.connect(effect.node);
      currentNode = effect.node;
    }

    // Conectar al siguiente nodo (panner o gain)
    if (this.spatial && this._pannerNode) {
      currentNode.connect(this._pannerNode);
    } else {
      currentNode.connect(this._gainNode!);
    }
  }

  /**
   * Agrega un filtro
   */
  addFilter(type: BiquadFilterType, frequency: number, Q: number = 1): BiquadFilterNode {
    if (!this._audioContext) {
      throw new Error('Audio context not initialized');
    }

    const filter = this._audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, this._audioContext.currentTime);
    filter.Q.setValueAtTime(Q, this._audioContext.currentTime);

    this._filters.push(filter);
    return filter;
  }

  /**
   * Agrega un efecto
   */
  addEffect(effect: AudioEffect): void {
    this._effects.push(effect);
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this.stop();
    
    if (this._source) {
      this._source.disconnect();
      this._source = null;
    }
    
    if (this._gainNode) {
      this._gainNode.disconnect();
      this._gainNode = null;
    }
    
    if (this._pannerNode) {
      this._pannerNode.disconnect();
      this._pannerNode = null;
    }

    this._filters.forEach(filter => filter.disconnect());
    this._filters = [];
    
    this._effects.forEach(effect => effect.node.disconnect());
    this._effects = [];

    this._audioBuffer = null;
    this._audioContext = null;
    this._loaded = false;
  }

  // Getters
  get isLoaded(): boolean { return this._loaded; }
  get isPlaying(): boolean { return this._playing; }
  get isPaused(): boolean { return this._paused; }
  get duration(): number { return this._audioBuffer?.duration || 0; }
  get currentTime(): number { 
    if (!this._playing || !this._audioContext) return 0;
    return this._audioContext.currentTime - this._startTime;
  }
}

/**
 * Efecto de audio genérico
 */
export interface AudioEffect {
  name: string;
  node: AudioNode;
  parameters: Record<string, any>;
}

/**
 * Gestor principal de audio 3D
 */
@Injectable('AudioManager')
export class AudioManager extends EventEmitter<AudioEvents> {
  private readonly logger = new Logger('AudioManager');
  
  private _audioContext: AudioContext | null = null;
  private _masterGain: GainNode | null = null;
  private _listener: AudioListener = {
    position: new Vector3(0, 0, 0),
    orientation: new Vector3(0, 0, -1),
    velocity: new Vector3(0, 0, 0),
    up: new Vector3(0, 1, 0)
  };

  private _audios: Map<string, Audio3D> = new Map();
  private _ambientAudios: Map<string, AmbientAudio> = new Map();
  private _audioCache: Map<string, AudioBuffer> = new Map();
  
  private _masterVolume: number = 1.0;
  private _effectsEnabled: boolean = true;
  private _spatialEnabled: boolean = true;
  private _ambientEnabled: boolean = true;

  constructor(
    @Inject('EventEmitter') private eventEmitter: EventEmitter<any>,
    @Inject('Logger') private logger: Logger
  ) {
    super();
    this.initializeAudioContext();
  }

  /**
   * Inicializa el contexto de audio
   */
  private initializeAudioContext(): void {
    try {
      this._audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this._masterGain = this._audioContext.createGain();
      this._masterGain.gain.value = this._masterVolume;
      this._masterGain.connect(this._audioContext.destination);
      
      this.logger.info('Audio context initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize audio context', error);
      throw error;
    }
  }

  /**
   * Crea y carga un audio 3D
   */
  async createAudio(config: AudioConfig): Promise<Audio3D> {
    if (this._audios.has(config.id)) {
      return this._audios.get(config.id)!;
    }

    const audio = new Audio3D(config);
    
    try {
      await audio.load(this._audioContext!);
      this._audios.set(config.id, audio);
      
      this.emit('audio:loaded', { audio, source: config.source });
      this.logger.info('Audio loaded successfully', config.name);
      
      return audio;
    } catch (error) {
      this.logger.error('Failed to load audio', config.name, error);
      this.emit('audio:error', { audio, error: error as Error });
      throw error;
    }
  }

  /**
   * Reproduce un audio en una posición específica
   */
  playAudio(audioId: string, position: Vector3): void {
    const audio = this._audios.get(audioId);
    if (!audio) {
      this.logger.warn('Audio not found', audioId);
      return;
    }

    audio.position.copy(position);
    audio.play(this._listener);
    
    this.emit('audio:play', { audio, position });
  }

  /**
   * Detiene un audio
   */
  stopAudio(audioId: string): void {
    const audio = this._audios.get(audioId);
    if (!audio) return;

    audio.stop();
    this.emit('audio:stop', { audio });
  }

  /**
   * Actualiza la posición del listener
   */
  updateListener(position: Vector3, orientation: Vector3, velocity: Vector3 = new Vector3()): void {
    this._listener.position.copy(position);
    this._listener.orientation.copy(orientation);
    this._listener.velocity.copy(velocity);

    // Actualizar posición del listener en el contexto de audio
    if (this._audioContext && this._spatialEnabled) {
      this._audioContext.listener.setPosition(position.x, position.y, position.z);
      this._audioContext.listener.setOrientation(
        orientation.x, orientation.y, orientation.z,
        this._listener.up.x, this._listener.up.y, this._listener.up.z
      );
      this._audioContext.listener.setVelocity(velocity.x, velocity.y, velocity.z);
    }

    // Actualizar posiciones espaciales de todos los audios
    this._audios.forEach(audio => {
      if (audio.spatial && audio.isPlaying) {
        audio.updateSpatialPosition(this._listener);
      }
    });
  }

  /**
   * Establece el volumen maestro
   */
  setMasterVolume(volume: number): void {
    this._masterVolume = Math.max(0, Math.min(1, volume));
    if (this._masterGain) {
      this._masterGain.gain.setValueAtTime(this._masterVolume, this._audioContext!.currentTime);
    }
    this.emit('master:volume:changed', { volume: this._masterVolume });
  }

  /**
   * Habilita/deshabilita efectos
   */
  setEffectsEnabled(enabled: boolean): void {
    this._effectsEnabled = enabled;
    this.emit('effects:enabled', { enabled });
  }

  /**
   * Habilita/deshabilita audio espacial
   */
  setSpatialEnabled(enabled: boolean): void {
    this._spatialEnabled = enabled;
  }

  /**
   * Crea audio ambiental
   */
  createAmbientAudio(config: Omit<AmbientAudio, 'enabled'>): AmbientAudio {
    const ambient: AmbientAudio = {
      ...config,
      enabled: false
    };

    this._ambientAudios.set(ambient.id, ambient);
    return ambient;
  }

  /**
   * Habilita/deshabilita audio ambiental
   */
  setAmbientEnabled(ambientId: string, enabled: boolean): void {
    const ambient = this._ambientAudios.get(ambientId);
    if (!ambient) return;

    ambient.enabled = enabled;
    this.emit('ambient:changed', { ambient, enabled });
  }

  /**
   * Limpia todos los recursos de audio
   */
  dispose(): void {
    this._audios.forEach(audio => audio.dispose());
    this._audios.clear();
    
    this._ambientAudios.clear();
    this._audioCache.clear();

    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }

    this._masterGain = null;
  }

  // Getters
  get audioContext(): AudioContext | null { return this._audioContext; }
  get masterVolume(): number { return this._masterVolume; }
  get effectsEnabled(): boolean { return this._effectsEnabled; }
  get spatialEnabled(): boolean { return this._spatialEnabled; }
  get ambientEnabled(): boolean { return this._ambientEnabled; }
  get listener(): AudioListener { return this._listener; }
  get audios(): Map<string, Audio3D> { return this._audios; }
  get ambientAudios(): Map<string, AmbientAudio> { return this._ambientAudios; }
} 