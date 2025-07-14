/**
 * @fileoverview Helper de audio para audio 3D posicional en el metaverso
 * @module @metaverso/helpers/audio/AudioHelper
 */

import * as THREE from 'three';
import { IHelper } from '../types';

/**
 * Configuración de audio
 */
export interface AudioConfig {
  enablePositional: boolean;
  enableReverb: boolean;
  enableEcho: boolean;
  enableFilter: boolean;
  maxDistance: number;
  rolloffFactor: number;
  refDistance: number;
  maxVolume: number;
  sampleRate: number;
  bufferSize: number;
  numberOfChannels: number;
}

/**
 * Tipo de fuente de audio
 */
export type AudioSourceType = 'ambient' | 'music' | 'sfx' | 'voice' | 'environmental';

/**
 * Información de fuente de audio
 */
export interface AudioSourceInfo {
  id: string;
  type: AudioSourceType;
  position: THREE.Vector3;
  volume: number;
  pitch: number;
  loop: boolean;
  autoplay: boolean;
  maxDistance: number;
  rolloffFactor: number;
  refDistance: number;
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  currentTime: number;
}

/**
 * Información de listener de audio
 */
export interface AudioListenerInfo {
  position: THREE.Vector3;
  orientation: THREE.Vector3;
  up: THREE.Vector3;
  velocity: THREE.Vector3;
  volume: number;
  muted: boolean;
}

/**
 * Helper de audio para audio 3D posicional en el metaverso
 */
export class AudioHelper implements IHelper {
  public readonly type = 'AudioHelper';
  public enabled: boolean = true;
  
  private _config: AudioConfig;
  private _listener: THREE.AudioListener;
  private _sources: Map<string, THREE.Audio | THREE.PositionalAudio> = new Map();
  private _sourceInfos: Map<string, AudioSourceInfo> = new Map();
  private _audioContext?: AudioContext;
  private _masterGain?: GainNode;
  private _reverbNode?: ConvolverNode;
  private _echoNode?: DelayNode;
  private _filterNode?: BiquadFilterNode;
  private _eventListeners: Map<string, Function[]> = new Map();
  private _audioBuffers: Map<string, AudioBuffer> = new Map();
  private _loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();

  /**
   * Constructor del helper
   * @param camera - Cámara para el listener de audio
   * @param config - Configuración de audio
   */
  constructor(
    camera: THREE.Camera,
    config: Partial<AudioConfig> = {}
  ) {
    this._config = {
      enablePositional: true,
      enableReverb: false,
      enableEcho: false,
      enableFilter: false,
      maxDistance: 100,
      rolloffFactor: 1,
      refDistance: 1,
      maxVolume: 1,
      sampleRate: 44100,
      bufferSize: 2048,
      numberOfChannels: 2,
      ...config
    };
    
    // Crear listener de audio
    this._listener = new THREE.AudioListener();
    camera.add(this._listener);
    
    this.init();
  }

  /**
   * Inicializar el helper
   */
  public async init(): Promise<void> {
    try {
      // Crear contexto de audio
      this._audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Crear nodo maestro de ganancia
      this._masterGain = this._audioContext.createGain();
      this._masterGain.gain.value = this._config.maxVolume;
      this._masterGain.connect(this._audioContext.destination);
      
      // Configurar efectos de audio
      if (this._config.enableReverb) {
        this._setupReverb();
      }
      
      if (this._config.enableEcho) {
        this._setupEcho();
      }
      
      if (this._config.enableFilter) {
        this._setupFilter();
      }
      
      console.log('[AudioHelper] Inicializado');
    } catch (error) {
      console.error('[AudioHelper] Error al inicializar:', error);
      throw error;
    }
  }

  /**
   * Actualizar el helper
   */
  public update(): void {
    if (!this.enabled || !this._audioContext) return;

    // Actualizar listener
    this._updateListener();
    
    // Actualizar fuentes de audio
    this._updateAudioSources();
    
    // Procesar eventos de audio
    this._processAudioEvents();
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    // Detener todas las fuentes de audio
    this._sources.forEach(source => {
      if (source.isPlaying) {
        source.stop();
      }
    });
    
    // Limpiar fuentes
    this._sources.clear();
    this._sourceInfos.clear();
    
    // Limpiar buffers
    this._audioBuffers.clear();
    this._loadingPromises.clear();
    
    // Cerrar contexto de audio
    if (this._audioContext) {
      this._audioContext.close();
    }
    
    // Limpiar eventos
    this._eventListeners.clear();
    
    console.log('[AudioHelper] Limpiado');
  }

  /**
   * Mostrar el helper
   */
  public show(): void {
    this.enabled = true;
  }

  /**
   * Ocultar el helper
   */
  public hide(): void {
    this.enabled = false;
  }

  /**
   * Cargar archivo de audio
   */
  public async loadAudio(
    id: string,
    url: string,
    type: AudioSourceType = 'sfx'
  ): Promise<AudioBuffer> {
    // Verificar si ya está cargado
    if (this._audioBuffers.has(id)) {
      return this._audioBuffers.get(id)!;
    }
    
    // Verificar si ya está cargando
    if (this._loadingPromises.has(id)) {
      return this._loadingPromises.get(id)!;
    }
    
    if (!this._audioContext) {
      throw new Error('Contexto de audio no inicializado');
    }

    // Crear promesa de carga
    const loadPromise = this._loadAudioBuffer(url);
    this._loadingPromises.set(id, loadPromise);
    
    try {
      const buffer = await loadPromise;
      this._audioBuffers.set(id, buffer);
      this._loadingPromises.delete(id);
      
      this._emitEvent('audioLoaded', { id, url, type, buffer });
      
      return buffer;
    } catch (error) {
      this._loadingPromises.delete(id);
      throw error;
    }
  }

  /**
   * Crear fuente de audio
   */
  public createAudioSource(
    id: string,
    audioId: string,
    position: THREE.Vector3,
    config: Partial<AudioSourceInfo> = {}
  ): string {
    if (!this._audioContext || !this._audioBuffers.has(audioId)) {
      throw new Error('Audio no cargado');
    }

    const buffer = this._audioBuffers.get(audioId)!;
    
    // Crear fuente de audio
    let source: THREE.Audio | THREE.PositionalAudio;
    
    if (this._config.enablePositional) {
      source = new THREE.PositionalAudio(this._listener);
      source.setRefDistance(this._config.refDistance);
      source.setRolloffFactor(this._config.rolloffFactor);
      source.setMaxDistance(this._config.maxDistance);
    } else {
      source = new THREE.Audio(this._listener);
    }
    
    // Configurar buffer
    source.setBuffer(buffer);
    
    // Configurar propiedades
    const sourceInfo: AudioSourceInfo = {
      id,
      type: config.type || 'sfx',
      position: position.clone(),
      volume: config.volume || 1,
      pitch: config.pitch || 1,
      loop: config.loop || false,
      autoplay: config.autoplay || false,
      maxDistance: config.maxDistance || this._config.maxDistance,
      rolloffFactor: config.rolloffFactor || this._config.rolloffFactor,
      refDistance: config.refDistance || this._config.refDistance,
      isPlaying: false,
      isPaused: false,
      duration: buffer.duration,
      currentTime: 0,
      ...config
    };
    
    // Aplicar configuración
    source.setVolume(sourceInfo.volume);
    source.setLoop(sourceInfo.loop);
    
    if (sourceInfo.autoplay) {
      source.play();
      sourceInfo.isPlaying = true;
    }
    
    // Almacenar referencias
    this._sources.set(id, source);
    this._sourceInfos.set(id, sourceInfo);
    
    this._emitEvent('audioSourceCreated', { id, sourceInfo });
    
    return id;
  }

  /**
   * Remover fuente de audio
   */
  public removeAudioSource(id: string): void {
    const source = this._sources.get(id);
    if (source) {
      if (source.isPlaying) {
        source.stop();
      }
      this._sources.delete(id);
      this._sourceInfos.delete(id);
      
      this._emitEvent('audioSourceRemoved', { id });
    }
  }

  /**
   * Reproducir audio
   */
  public playAudio(id: string): void {
    const source = this._sources.get(id);
    const info = this._sourceInfos.get(id);
    
    if (source && info) {
      source.play();
      info.isPlaying = true;
      info.isPaused = false;
      
      this._emitEvent('audioPlayed', { id, info });
    }
  }

  /**
   * Pausar audio
   */
  public pauseAudio(id: string): void {
    const source = this._sources.get(id);
    const info = this._sourceInfos.get(id);
    
    if (source && info) {
      source.pause();
      info.isPlaying = false;
      info.isPaused = true;
      
      this._emitEvent('audioPaused', { id, info });
    }
  }

  /**
   * Detener audio
   */
  public stopAudio(id: string): void {
    const source = this._sources.get(id);
    const info = this._sourceInfos.get(id);
    
    if (source && info) {
      source.stop();
      info.isPlaying = false;
      info.isPaused = false;
      info.currentTime = 0;
      
      this._emitEvent('audioStopped', { id, info });
    }
  }

  /**
   * Establecer volumen de fuente
   */
  public setSourceVolume(id: string, volume: number): void {
    const source = this._sources.get(id);
    const info = this._sourceInfos.get(id);
    
    if (source && info) {
      source.setVolume(volume);
      info.volume = volume;
      
      this._emitEvent('volumeChanged', { id, volume });
    }
  }

  /**
   * Establecer posición de fuente
   */
  public setSourcePosition(id: string, position: THREE.Vector3): void {
    const source = this._sources.get(id);
    const info = this._sourceInfos.get(id);
    
    if (source && info) {
      source.position.copy(position);
      info.position.copy(position);
      
      this._emitEvent('positionChanged', { id, position });
    }
  }

  /**
   * Obtener información de fuente
   */
  public getSourceInfo(id: string): AudioSourceInfo | null {
    return this._sourceInfos.get(id) || null;
  }

  /**
   * Obtener información del listener
   */
  public getListenerInfo(): AudioListenerInfo {
    return {
      position: this._listener.position.clone(),
      orientation: this._listener.orientation.clone(),
      up: this._listener.up.clone(),
      velocity: this._listener.velocity.clone(),
      volume: this._listener.getMasterVolume(),
      muted: this._listener.getMasterVolume() === 0
    };
  }

  /**
   * Establecer volumen maestro
   */
  public setMasterVolume(volume: number): void {
    if (this._masterGain) {
      this._masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
    
    this._emitEvent('masterVolumeChanged', { volume });
  }

  /**
   * Silenciar/desilenciar audio
   */
  public setMuted(muted: boolean): void {
    const volume = muted ? 0 : this._config.maxVolume;
    this.setMasterVolume(volume);
    
    this._emitEvent('mutedChanged', { muted });
  }

  /**
   * Obtener estadísticas de audio
   */
  public getStats(): {
    sourceCount: number;
    playingCount: number;
    pausedCount: number;
    loadedBuffers: number;
    loadingBuffers: number;
    memoryUsage: number;
  } {
    let playingCount = 0;
    let pausedCount = 0;
    
    this._sourceInfos.forEach(info => {
      if (info.isPlaying) playingCount++;
      if (info.isPaused) pausedCount++;
    });

    return {
      sourceCount: this._sources.size,
      playingCount,
      pausedCount,
      loadedBuffers: this._audioBuffers.size,
      loadingBuffers: this._loadingPromises.size,
      memoryUsage: this._audioBuffers.size * 1024 * 1024 // Estimación aproximada
    };
  }

  /**
   * Cargar buffer de audio
   */
  private async _loadAudioBuffer(url: string): Promise<AudioBuffer> {
    if (!this._audioContext) {
      throw new Error('Contexto de audio no inicializado');
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('[AudioHelper] Error al cargar audio:', error);
      throw error;
    }
  }

  /**
   * Configurar reverb
   */
  private _setupReverb(): void {
    if (!this._audioContext) return;

    this._reverbNode = this._audioContext.createConvolver();
    
    // Crear impulso de reverb simple
    const sampleRate = this._audioContext.sampleRate;
    const length = sampleRate * 2; // 2 segundos
    const impulse = this._audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.1));
      }
    }
    
    this._reverbNode.buffer = impulse;
    this._reverbNode.connect(this._masterGain!);
  }

  /**
   * Configurar echo
   */
  private _setupEcho(): void {
    if (!this._audioContext) return;

    this._echoNode = this._audioContext.createDelay(2.0); // 2 segundos de delay máximo
    this._echoNode.delayTime.value = 0.5; // 500ms de delay
    
    const echoGain = this._audioContext.createGain();
    echoGain.gain.value = 0.3; // 30% de feedback
    
    this._echoNode.connect(echoGain);
    echoGain.connect(this._echoNode);
    this._echoNode.connect(this._masterGain!);
  }

  /**
   * Configurar filtro
   */
  private _setupFilter(): void {
    if (!this._audioContext) return;

    this._filterNode = this._audioContext.createBiquadFilter();
    this._filterNode.type = 'lowpass';
    this._filterNode.frequency.value = 2000; // 2kHz
    this._filterNode.Q.value = 1;
    
    this._filterNode.connect(this._masterGain!);
  }

  /**
   * Actualizar listener
   */
  private _updateListener(): void {
    // El listener se actualiza automáticamente con la cámara
    // Aquí podemos agregar lógica adicional si es necesario
  }

  /**
   * Actualizar fuentes de audio
   */
  private _updateAudioSources(): void {
    this._sourceInfos.forEach((info, id) => {
      const source = this._sources.get(id);
      if (!source) return;

      // Actualizar tiempo actual
      if (info.isPlaying && source.context) {
        info.currentTime = source.context.currentTime - (source as any).startTime;
      }
      
      // Verificar si el audio terminó
      if (info.isPlaying && info.currentTime >= info.duration) {
        if (!info.loop) {
          info.isPlaying = false;
          this._emitEvent('audioEnded', { id, info });
        }
      }
    });
  }

  /**
   * Procesar eventos de audio
   */
  private _processAudioEvents(): void {
    // Procesar eventos pendientes de audio
    // Esto se puede expandir para manejar eventos más complejos
  }

  /**
   * Emitir evento
   */
  private _emitEvent(event: string, data: any): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AudioHelper] Error en evento ${event}:`, error);
        }
      });
    }
  }
} 