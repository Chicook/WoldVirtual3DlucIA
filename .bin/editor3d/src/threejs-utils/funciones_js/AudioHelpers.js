/**
 * Audio Helpers - Utilidades de audio para el editor 3D
 * Maneja gestión de sonidos, música de fondo, efectos de audio y sincronización con la escena 3D
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class AudioHelpers {
  constructor() {
    this.audioContext = null;
    this.listener = null;
    this.sounds = new Map();
    this.music = new Map();
    this.audioLoader = new THREE.AudioLoader();
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.isMuted = false;
    this.currentMusic = null;
    this.audioEnabled = false;
    this.supportedFormats = ['mp3', 'wav', 'ogg', 'm4a'];
  }

  /**
   * Inicializa el sistema de audio
   */
  initialize(camera = null) {
    try {
      // Crear contexto de audio
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear listener para audio 3D
      this.listener = new THREE.AudioListener();
      
      if (camera) {
        camera.add(this.listener);
      }

      this.audioEnabled = true;
      console.log('🎵 Sistema de audio inicializado');
      
      // Precargar sonidos del sistema
      this.preloadSystemSounds();
      
    } catch (error) {
      console.error('❌ Error al inicializar audio:', error);
      this.audioEnabled = false;
    }
  }

  /**
   * Precarga sonidos del sistema
   */
  preloadSystemSounds() {
    const systemSounds = {
      'click': '/sounds/ui/click.wav',
      'hover': '/sounds/ui/hover.wav',
      'error': '/sounds/ui/error.wav',
      'success': '/sounds/ui/success.wav',
      'notification': '/sounds/ui/notification.wav'
    };

    Object.entries(systemSounds).forEach(([name, url]) => {
      this.loadSound(name, url, { preload: true });
    });
  }

  /**
   * Carga un archivo de sonido
   */
  loadSound(name, url, options = {}) {
    if (!this.audioEnabled) {
      console.warn('⚠️ Audio no habilitado');
      return Promise.reject('Audio no habilitado');
    }

    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          const sound = new THREE.Audio(this.listener);
          sound.setBuffer(buffer);
          sound.setVolume(options.volume || this.sfxVolume);
          sound.setLoop(options.loop || false);
          
          this.sounds.set(name, {
            sound: sound,
            buffer: buffer,
            url: url,
            options: options
          });

          console.log(`✅ Sonido cargado: ${name}`);
          resolve(sound);
        },
        (progress) => {
          if (options.onProgress) {
            options.onProgress(progress);
          }
        },
        (error) => {
          console.error(`❌ Error al cargar sonido ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Carga música de fondo
   */
  loadMusic(name, url, options = {}) {
    return this.loadSound(name, url, {
      ...options,
      loop: true,
      volume: options.volume || this.musicVolume
    }).then(sound => {
      this.music.set(name, {
        sound: sound,
        url: url,
        options: options
      });
      return sound;
    });
  }

  /**
   * Reproduce un sonido
   */
  playSound(name, options = {}) {
    const soundData = this.sounds.get(name);
    if (!soundData) {
      console.warn(`⚠️ Sonido no encontrado: ${name}`);
      return false;
    }

    const sound = soundData.sound;
    
    // Aplicar opciones
    if (options.volume !== undefined) {
      sound.setVolume(options.volume * this.sfxVolume * this.masterVolume);
    }
    
    if (options.rate !== undefined) {
      sound.setPlaybackRate(options.rate);
    }

    // Reproducir si no está ya reproduciéndose
    if (!sound.isPlaying) {
      sound.play();
      console.log(`▶️ Reproduciendo sonido: ${name}`);
      return true;
    }

    return false;
  }

  /**
   * Reproduce música de fondo
   */
  playMusic(name, fadeIn = true) {
    // Detener música actual si hay alguna
    if (this.currentMusic) {
      this.stopMusic(fadeIn);
    }

    const musicData = this.music.get(name);
    if (!musicData) {
      console.warn(`⚠️ Música no encontrada: ${name}`);
      return false;
    }

    const music = musicData.sound;
    
    if (fadeIn) {
      music.setVolume(0);
      music.play();
      this.fadeIn(music, this.musicVolume * this.masterVolume, 2000);
    } else {
      music.setVolume(this.musicVolume * this.masterVolume);
      music.play();
    }

    this.currentMusic = name;
    console.log(`🎵 Reproduciendo música: ${name}`);
    return true;
  }

  /**
   * Detiene la música actual
   */
  stopMusic(fadeOut = true) {
    if (!this.currentMusic) return;

    const musicData = this.music.get(this.currentMusic);
    if (!musicData) return;

    const music = musicData.sound;
    
    if (fadeOut) {
      this.fadeOut(music, 2000).then(() => {
        music.stop();
        this.currentMusic = null;
      });
    } else {
      music.stop();
      this.currentMusic = null;
    }

    console.log(`⏹️ Música detenida: ${this.currentMusic}`);
  }

  /**
   * Pausa la música actual
   */
  pauseMusic() {
    if (!this.currentMusic) return;

    const musicData = this.music.get(this.currentMusic);
    if (!musicData) return;

    musicData.sound.pause();
    console.log(`⏸️ Música pausada: ${this.currentMusic}`);
  }

  /**
   * Reanuda la música actual
   */
  resumeMusic() {
    if (!this.currentMusic) return;

    const musicData = this.music.get(this.currentMusic);
    if (!musicData) return;

    musicData.sound.play();
    console.log(`▶️ Música reanudada: ${this.currentMusic}`);
  }

  /**
   * Efecto de fade in
   */
  fadeIn(sound, targetVolume, duration) {
    return new Promise((resolve) => {
      const startVolume = 0;
      const startTime = Date.now();
      
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentVolume = startVolume + (targetVolume - startVolume) * progress;
        sound.setVolume(currentVolume);
        
        if (progress >= 1) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, 16); // ~60 FPS
    });
  }

  /**
   * Efecto de fade out
   */
  fadeOut(sound, duration) {
    return new Promise((resolve) => {
      const startVolume = sound.getVolume();
      const startTime = Date.now();
      
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentVolume = startVolume * (1 - progress);
        sound.setVolume(currentVolume);
        
        if (progress >= 1) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, 16); // ~60 FPS
    });
  }

  /**
   * Establece el volumen maestro
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Actualizar volumen de todos los sonidos
    this.sounds.forEach(soundData => {
      const currentVolume = soundData.options.volume || this.sfxVolume;
      soundData.sound.setVolume(currentVolume * this.masterVolume);
    });

    // Actualizar volumen de la música actual
    if (this.currentMusic) {
      const musicData = this.music.get(this.currentMusic);
      if (musicData) {
        const currentVolume = musicData.options.volume || this.musicVolume;
        musicData.sound.setVolume(currentVolume * this.masterVolume);
      }
    }

    console.log(`🔊 Volumen maestro: ${Math.round(this.masterVolume * 100)}%`);
  }

  /**
   * Establece el volumen de efectos de sonido
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volumen SFX: ${Math.round(this.sfxVolume * 100)}%`);
  }

  /**
   * Establece el volumen de música
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Actualizar música actual
    if (this.currentMusic) {
      const musicData = this.music.get(this.currentMusic);
      if (musicData) {
        const currentVolume = musicData.options.volume || this.musicVolume;
        musicData.sound.setVolume(currentVolume * this.masterVolume);
      }
    }

    console.log(`🎵 Volumen música: ${Math.round(this.musicVolume * 100)}%`);
  }

  /**
   * Silencia/desilencia el audio
   */
  setMuted(muted) {
    this.isMuted = muted;
    
    if (muted) {
      this.setMasterVolume(0);
    } else {
      this.setMasterVolume(this.masterVolume);
    }

    console.log(`🔇 Audio ${muted ? 'silenciado' : 'activado'}`);
  }

  /**
   * Crea un sonido posicional 3D
   */
  createPositionalSound(name, url, position, options = {}) {
    if (!this.audioEnabled) return Promise.reject('Audio no habilitado');

    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          const sound = new THREE.PositionalAudio(this.listener);
          sound.setBuffer(buffer);
          sound.setRefDistance(options.refDistance || 20);
          sound.setRolloffFactor(options.rolloffFactor || 1);
          sound.setDistanceModel(options.distanceModel || 'inverse');
          sound.setVolume(options.volume || this.sfxVolume);
          sound.setLoop(options.loop || false);
          
          // Posicionar el sonido
          sound.position.copy(position);

          this.sounds.set(name, {
            sound: sound,
            buffer: buffer,
            url: url,
            options: { ...options, positional: true }
          });

          console.log(`✅ Sonido posicional creado: ${name}`);
          resolve(sound);
        },
        null,
        (error) => {
          console.error(`❌ Error al crear sonido posicional ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Actualiza la posición de un sonido 3D
   */
  updateSoundPosition(name, position) {
    const soundData = this.sounds.get(name);
    if (soundData && soundData.options.positional) {
      soundData.sound.position.copy(position);
    }
  }

  /**
   * Obtiene información del sistema de audio
   */
  getAudioInfo() {
    return {
      enabled: this.audioEnabled,
      muted: this.isMuted,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      currentMusic: this.currentMusic,
      totalSounds: this.sounds.size,
      totalMusic: this.music.size,
      contextState: this.audioContext ? this.audioContext.state : 'none'
    };
  }

  /**
   * Obtiene la lista de sonidos cargados
   */
  getLoadedSounds() {
    return Array.from(this.sounds.keys());
  }

  /**
   * Obtiene la lista de música cargada
   */
  getLoadedMusic() {
    return Array.from(this.music.keys());
  }

  /**
   * Limpia todos los recursos de audio
   */
  dispose() {
    // Detener y limpiar todos los sonidos
    this.sounds.forEach(soundData => {
      if (soundData.sound.isPlaying) {
        soundData.sound.stop();
      }
      soundData.sound.disconnect();
    });

    // Detener y limpiar toda la música
    this.music.forEach(musicData => {
      if (musicData.sound.isPlaying) {
        musicData.sound.stop();
      }
      musicData.sound.disconnect();
    });

    // Cerrar contexto de audio
    if (this.audioContext) {
      this.audioContext.close();
    }

    this.sounds.clear();
    this.music.clear();
    this.currentMusic = null;
    this.audioEnabled = false;

    console.log('🧹 Audio Helpers limpiado');
  }
}

export { AudioHelpers }; 