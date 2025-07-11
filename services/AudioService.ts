/**
 * AudioService - Servicio de gestión de audio del metaverso
 * Maneja reproducción, efectos de sonido, música y audio espacial
 */
export class AudioService {
  private isInitialized: boolean = false;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioSource> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private settings: AudioSettings = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    voiceVolume: 0.9,
    spatialAudio: true,
    reverbEnabled: true
  };

  /**
   * Inicializar el servicio de audio
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🎵 Inicializando AudioService...');

    try {
      // Crear contexto de audio
      await this.createAudioContext();
      
      // Configurar nodos principales
      this.setupAudioNodes();
      
      // Cargar audio por defecto
      await this.loadDefaultAudio();
      
      // Configurar event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ AudioService inicializado');
      this.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      console.error('❌ Error inicializando AudioService:', error);
      this.emit('error', { error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Crear contexto de audio
   */
  private async createAudioContext(): Promise<void> {
    try {
      // Crear contexto de audio con configuración optimizada
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100,
        latencyHint: 'interactive'
      });

      // Resumir contexto si está suspendido
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log('🎵 Contexto de audio creado:', this.audioContext.state);
    } catch (error) {
      console.error('❌ Error creando contexto de audio:', error);
      throw error;
    }
  }

  /**
   * Configurar nodos de audio principales
   */
  private setupAudioNodes(): void {
    if (!this.audioContext) return;

    // Nodo maestro de ganancia
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.settings.masterVolume;
    this.masterGain.connect(this.audioContext.destination);

    console.log('🎵 Nodos de audio configurados');
  }

  /**
   * Cargar audio por defecto
   */
  private async loadDefaultAudio(): Promise<void> {
    const defaultAudio = [
      { name: 'ambient', url: '/audio/ambient.mp3' },
      { name: 'click', url: '/audio/click.mp3' },
      { name: 'notification', url: '/audio/notification.mp3' }
    ];

    for (const audio of defaultAudio) {
      try {
        await this.loadAudio(audio.name, audio.url);
      } catch (error) {
        console.warn(`⚠️ No se pudo cargar audio por defecto: ${audio.name}`);
      }
    }
  }

  /**
   * Cargar archivo de audio
   */
  public async loadAudio(name: string, url: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Contexto de audio no inicializado');
    }

    try {
      console.log(`🎵 Cargando audio: ${name}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(name, audioBuffer);
      
      console.log(`✅ Audio cargado: ${name}`);
      this.emit('audioLoaded', { name, url, timestamp: new Date() });
    } catch (error) {
      console.error(`❌ Error cargando audio ${name}:`, error);
      this.emit('audioError', { name, url, error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Reproducir audio
   */
  public playAudio(
    name: string, 
    options: PlayAudioOptions = {}
  ): AudioSource | null {
    if (!this.audioContext || !this.masterGain) {
      console.error('❌ AudioService no inicializado');
      return null;
    }

    const buffer = this.audioBuffers.get(name);
    if (!buffer) {
      console.error(`❌ Audio no encontrado: ${name}`);
      return null;
    }

    try {
      // Crear fuente de audio
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Crear nodo de ganancia para este audio
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume || this.getVolumeForType(options.type || 'sfx');

      // Conectar nodos
      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Configurar opciones espaciales
      if (options.spatial && this.settings.spatialAudio) {
        this.setupSpatialAudio(source, options.position);
      }

      // Configurar loop
      if (options.loop) {
        source.loop = true;
      }

      // Reproducir
      source.start(0, options.offset || 0);
      
      // Crear objeto de control
      const audioSource: AudioSource = {
        id: Date.now().toString(),
        name,
        source,
        gainNode,
        options,
        startTime: Date.now(),
        isPlaying: true
      };

      // Configurar eventos de finalización
      source.onended = () => {
        audioSource.isPlaying = false;
        this.activeSources.delete(audioSource.id);
        this.emit('audioEnded', { audioSource, timestamp: new Date() });
      };

      this.activeSources.set(audioSource.id, audioSource);
      
      console.log(`🎵 Reproduciendo audio: ${name}`);
      this.emit('audioStarted', { audioSource, timestamp: new Date() });
      
      return audioSource;
    } catch (error) {
      console.error(`❌ Error reproduciendo audio ${name}:`, error);
      this.emit('audioError', { name, error, timestamp: new Date() });
      return null;
    }
  }

  /**
   * Detener audio específico
   */
  public stopAudio(audioId: string): boolean {
    const audioSource = this.activeSources.get(audioId);
    if (!audioSource) {
      return false;
    }

    try {
      audioSource.source.stop();
      audioSource.isPlaying = false;
      this.activeSources.delete(audioId);
      
      console.log(`⏹️ Audio detenido: ${audioSource.name}`);
      this.emit('audioStopped', { audioSource, timestamp: new Date() });
      
      return true;
    } catch (error) {
      console.error(`❌ Error deteniendo audio:`, error);
      return false;
    }
  }

  /**
   * Detener todos los audios
   */
  public stopAllAudio(): void {
    const audioIds = Array.from(this.activeSources.keys());
    
    for (const audioId of audioIds) {
      this.stopAudio(audioId);
    }
    
    console.log('⏹️ Todos los audios detenidos');
  }

  /**
   * Configurar audio espacial
   */
  private setupSpatialAudio(source: AudioBufferSourceNode, position?: Position): void {
    if (!this.audioContext || !position) return;

    try {
      const panner = this.audioContext.createPanner();
      panner.setPosition(position.x, position.y, position.z);
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.maxDistance = 1000;
      panner.refDistance = 1;
      panner.rolloffFactor = 1;

      // Reinsertar en la cadena de audio
      source.disconnect();
      source.connect(panner);
      panner.connect(this.masterGain);
      
    } catch (error) {
      console.warn('⚠️ Error configurando audio espacial:', error);
    }
  }

  /**
   * Obtener volumen según tipo de audio
   */
  private getVolumeForType(type: AudioType): number {
    switch (type) {
      case 'music':
        return this.settings.musicVolume;
      case 'voice':
        return this.settings.voiceVolume;
      case 'sfx':
      default:
        return this.settings.sfxVolume;
    }
  }

  /**
   * Configurar volumen maestro
   */
  public setMasterVolume(volume: number): void {
    if (!this.masterGain) return;

    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = this.settings.masterVolume;
    
    console.log(`🔊 Volumen maestro: ${this.settings.masterVolume}`);
    this.emit('volumeChanged', { type: 'master', volume: this.settings.masterVolume, timestamp: new Date() });
  }

  /**
   * Configurar volumen por tipo
   */
  public setVolume(type: AudioType, volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    
    switch (type) {
      case 'music':
        this.settings.musicVolume = normalizedVolume;
        break;
      case 'voice':
        this.settings.voiceVolume = normalizedVolume;
        break;
      case 'sfx':
        this.settings.sfxVolume = normalizedVolume;
        break;
    }
    
    console.log(`🔊 Volumen ${type}: ${normalizedVolume}`);
    this.emit('volumeChanged', { type, volume: normalizedVolume, timestamp: new Date() });
  }

  /**
   * Obtener configuración de audio
   */
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Obtener estadísticas del servicio
   */
  public getStats(): AudioStats {
    return {
      isInitialized: this.isInitialized,
      audioContextState: this.audioContext?.state || 'unknown',
      loadedBuffers: this.audioBuffers.size,
      activeSources: this.activeSources.size,
      masterVolume: this.settings.masterVolume,
      spatialAudioEnabled: this.settings.spatialAudio
    };
  }

  /**
   * Configurar event listeners
   */
  private setupEventListeners(): void {
    // Event listeners específicos del servicio
  }

  /**
   * Agregar event listener
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remover event listener
   */
  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en event listener para ${event}:`, error);
        }
      });
    }
  }

  /**
   * Limpiar recursos
   */
  public async shutdown(): Promise<void> {
    console.log('🔄 Cerrando AudioService...');
    
    // Detener todos los audios
    this.stopAllAudio();
    
    // Cerrar contexto de audio
    if (this.audioContext) {
      await this.audioContext.close();
    }
    
    // Limpiar recursos
    this.audioBuffers.clear();
    this.activeSources.clear();
    this.eventListeners.clear();
    this.isInitialized = false;
    
    console.log('✅ AudioService cerrado');
  }
}

// Tipos de datos
export type AudioType = 'music' | 'sfx' | 'voice' | 'ambient';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface PlayAudioOptions {
  volume?: number;
  loop?: boolean;
  offset?: number;
  spatial?: boolean;
  position?: Position;
  type?: AudioType;
}

export interface AudioSource {
  id: string;
  name: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  options: PlayAudioOptions;
  startTime: number;
  isPlaying: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  spatialAudio: boolean;
  reverbEnabled: boolean;
}

export interface AudioStats {
  isInitialized: boolean;
  audioContextState: string;
  loadedBuffers: number;
  activeSources: number;
  masterVolume: number;
  spatialAudioEnabled: boolean;
} 