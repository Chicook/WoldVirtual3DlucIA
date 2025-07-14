/**
 * Sistema de Audio Avanzado - Three.js
 * Audio 3D espacial y efectos avanzados para el metaverso
 */

class AudioSystem {
    constructor(camera) {
        this.camera = camera;
        this.listener = null;
        this.sounds = new Map();
        this.music = new Map();
        this.ambient = new Map();
        this.effects = new Map();
        this.voice = new Map();
        
        // Configuración de audio
        this.config = {
            masterVolume: 1.0,
            musicVolume: 0.7,
            sfxVolume: 0.8,
            voiceVolume: 0.9,
            ambientVolume: 0.5,
            maxDistance: 1000,
            rolloffFactor: 1,
            refDistance: 1,
            distanceModel: 'inverse',
            dopplerFactor: 1,
            speedOfSound: 343.3
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isMuted: false,
            is3DEnabled: true,
            isVRMode: false
        };
        
        // Métricas
        this.metrics = {
            activeSounds: 0,
            activeMusic: 0,
            activeAmbient: 0,
            activeEffects: 0,
            activeVoice: 0,
            totalMemory: 0,
            cpuUsage: 0
        };
        
        // Contexto de audio
        this.audioContext = null;
        this.analyser = null;
        this.gainNode = null;
        this.compressor = null;
        this.reverb = null;
        this.echo = null;
        this.filter = null;
        
        console.log('🎵 Sistema de Audio inicializado');
    }
    
    /**
     * Inicializar sistema de audio
     */
    async initialize() {
        try {
            // Crear contexto de audio
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear listener 3D
            this.listener = new THREE.AudioListener();
            this.camera.add(this.listener);
            
            // Configurar nodos de audio
            await this.setupAudioNodes();
            
            // Configurar analizador de frecuencia
            this.setupAnalyser();
            
            // Cargar sonidos por defecto
            await this.loadDefaultSounds();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Audio inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de audio:', error);
            throw error;
        }
    }
    
    /**
     * Configurar nodos de audio
     */
    async setupAudioNodes() {
        // Nodo principal de ganancia
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.config.masterVolume;
        this.gainNode.connect(this.audioContext.destination);
        
        // Compresor
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        this.compressor.connect(this.gainNode);
        
        // Reverb
        this.reverb = this.createReverb();
        this.reverb.connect(this.compressor);
        
        // Echo
        this.echo = this.createEcho();
        this.echo.connect(this.compressor);
        
        // Filtro
        this.filter = this.audioContext.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 20000;
        this.filter.Q.value = 1;
        this.filter.connect(this.repressor);
    }
    
    /**
     * Crear reverb
     */
    createReverb() {
        const convolver = this.audioContext.createConvolver();
        
        // Crear impulso de reverb
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 segundos
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }
    
    /**
     * Crear echo
     */
    createEcho() {
        const delay = this.audioContext.createDelay(5.0);
        const feedback = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        
        delay.delayTime.value = 0.3;
        feedback.gain.value = 0.3;
        wetGain.gain.value = 0.3;
        
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wetGain);
        
        return wetGain;
    }
    
    /**
     * Configurar analizador de frecuencia
     */
    setupAnalyser() {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.connect(this.gainNode);
        
        // Crear buffer para datos de frecuencia
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
    }
    
    /**
     * Cargar sonidos por defecto
     */
    async loadDefaultSounds() {
        // Sonidos de ambiente
        await this.loadAmbientSound('forest', 'sounds/ambient/forest.mp3');
        await this.loadAmbientSound('city', 'sounds/ambient/city.mp3');
        await this.loadAmbientSound('ocean', 'sounds/ambient/ocean.mp3');
        await this.loadAmbientSound('wind', 'sounds/ambient/wind.mp3');
        
        // Efectos de sonido
        await this.loadEffect('click', 'sounds/effects/click.mp3');
        await this.loadEffect('hover', 'sounds/effects/hover.mp3');
        await this.loadEffect('success', 'sounds/effects/success.mp3');
        await this.loadEffect('error', 'sounds/effects/error.mp3');
        await this.loadEffect('notification', 'sounds/effects/notification.mp3');
        
        // Música
        await this.loadMusic('background', 'sounds/music/background.mp3');
        await this.loadMusic('menu', 'sounds/music/menu.mp3');
        await this.loadMusic('action', 'sounds/music/action.mp3');
    }
    
    /**
     * Cargar sonido 3D
     */
    async load3DSound(id, url, options = {}) {
        try {
            const {
                volume = 1.0,
                loop = false,
                autoplay = false,
                maxDistance = this.config.maxDistance,
                rolloffFactor = this.config.rolloffFactor,
                refDistance = this.config.refDistance,
                position = { x: 0, y: 0, z: 0 }
            } = options;
            
            const sound = new THREE.Audio(this.listener);
            
            // Cargar archivo de audio
            const audioLoader = new THREE.AudioLoader();
            const buffer = await new Promise((resolve, reject) => {
                audioLoader.load(url, resolve, undefined, reject);
            });
            
            sound.setBuffer(buffer);
            sound.setVolume(volume);
            sound.setLoop(loop);
            sound.setRefDistance(refDistance);
            sound.setRolloffFactor(rolloffFactor);
            sound.setMaxDistance(maxDistance);
            
            // Posicionar sonido en 3D
            const soundObject = new THREE.Object3D();
            soundObject.position.set(position.x, position.y, position.z);
            soundObject.add(sound);
            
            this.sounds.set(id, {
                sound,
                object: soundObject,
                options
            });
            
            if (autoplay) {
                sound.play();
            }
            
            this.metrics.activeSounds++;
            console.log(`✅ Sonido 3D cargado: ${id}`);
            
            return sound;
            
        } catch (error) {
            console.error(`❌ Error cargando sonido 3D ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Cargar música
     */
    async loadMusic(id, url, options = {}) {
        try {
            const {
                volume = this.config.musicVolume,
                loop = true,
                autoplay = false,
                fadeIn = 2.0,
                fadeOut = 2.0
            } = options;
            
            const sound = new THREE.Audio(this.listener);
            
            const audioLoader = new THREE.AudioLoader();
            const buffer = await new Promise((resolve, reject) => {
                audioLoader.load(url, resolve, undefined, reject);
            });
            
            sound.setBuffer(buffer);
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            this.music.set(id, {
                sound,
                options: { ...options, fadeIn, fadeOut }
            });
            
            if (autoplay) {
                sound.play();
            }
            
            this.metrics.activeMusic++;
            console.log(`✅ Música cargada: ${id}`);
            
            return sound;
            
        } catch (error) {
            console.error(`❌ Error cargando música ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Cargar sonido ambiental
     */
    async loadAmbientSound(id, url, options = {}) {
        try {
            const {
                volume = this.config.ambientVolume,
                loop = true,
                autoplay = false,
                fadeIn = 5.0,
                fadeOut = 5.0
            } = options;
            
            const sound = new THREE.Audio(this.listener);
            
            const audioLoader = new THREE.AudioLoader();
            const buffer = await new Promise((resolve, reject) => {
                audioLoader.load(url, resolve, undefined, reject);
            });
            
            sound.setBuffer(buffer);
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            this.ambient.set(id, {
                sound,
                options: { ...options, fadeIn, fadeOut }
            });
            
            if (autoplay) {
                sound.play();
            }
            
            this.metrics.activeAmbient++;
            console.log(`✅ Sonido ambiental cargado: ${id}`);
            
            return sound;
            
        } catch (error) {
            console.error(`❌ Error cargando sonido ambiental ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Cargar efecto de sonido
     */
    async loadEffect(id, url, options = {}) {
        try {
            const {
                volume = this.config.sfxVolume,
                loop = false,
                autoplay = false,
                pitch = 1.0,
                rate = 1.0
            } = options;
            
            const sound = new THREE.Audio(this.listener);
            
            const audioLoader = new THREE.AudioLoader();
            const buffer = await new Promise((resolve, reject) => {
                audioLoader.load(url, resolve, undefined, reject);
            });
            
            sound.setBuffer(buffer);
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            this.effects.set(id, {
                sound,
                options: { ...options, pitch, rate }
            });
            
            if (autoplay) {
                sound.play();
            }
            
            this.metrics.activeEffects++;
            console.log(`✅ Efecto de sonido cargado: ${id}`);
            
            return sound;
            
        } catch (error) {
            console.error(`❌ Error cargando efecto ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Cargar voz
     */
    async loadVoice(id, url, options = {}) {
        try {
            const {
                volume = this.config.voiceVolume,
                loop = false,
                autoplay = false,
                language = 'en',
                gender = 'neutral'
            } = options;
            
            const sound = new THREE.Audio(this.listener);
            
            const audioLoader = new THREE.AudioLoader();
            const buffer = await new Promise((resolve, reject) => {
                audioLoader.load(url, resolve, undefined, reject);
            });
            
            sound.setBuffer(buffer);
            sound.setVolume(volume);
            sound.setLoop(loop);
            
            this.voice.set(id, {
                sound,
                options: { ...options, language, gender }
            });
            
            if (autoplay) {
                sound.play();
            }
            
            this.metrics.activeVoice++;
            console.log(`✅ Voz cargada: ${id}`);
            
            return sound;
            
        } catch (error) {
            console.error(`❌ Error cargando voz ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Reproducir sonido
     */
    playSound(id, options = {}) {
        const soundData = this.sounds.get(id);
        if (soundData && soundData.sound) {
            const { position, volume, pitch } = options;
            
            if (position) {
                soundData.object.position.copy(position);
            }
            
            if (volume !== undefined) {
                soundData.sound.setVolume(volume);
            }
            
            if (pitch !== undefined) {
                soundData.sound.setPlaybackRate(pitch);
            }
            
            soundData.sound.play();
            return soundData.sound;
        }
        return null;
    }
    
    /**
     * Reproducir música
     */
    playMusic(id, fadeIn = true) {
        const musicData = this.music.get(id);
        if (musicData && musicData.sound) {
            if (fadeIn && musicData.options.fadeIn > 0) {
                this.fadeIn(musicData.sound, musicData.options.fadeIn);
            } else {
                musicData.sound.play();
            }
            return musicData.sound;
        }
        return null;
    }
    
    /**
     * Reproducir sonido ambiental
     */
    playAmbient(id, fadeIn = true) {
        const ambientData = this.ambient.get(id);
        if (ambientData && ambientData.sound) {
            if (fadeIn && ambientData.options.fadeIn > 0) {
                this.fadeIn(ambientData.sound, ambientData.options.fadeIn);
            } else {
                ambientData.sound.play();
            }
            return ambientData.sound;
        }
        return null;
    }
    
    /**
     * Reproducir efecto
     */
    playEffect(id, options = {}) {
        const effectData = this.effects.get(id);
        if (effectData && effectData.sound) {
            const { volume, pitch, rate } = options;
            
            if (volume !== undefined) {
                effectData.sound.setVolume(volume);
            }
            
            if (pitch !== undefined) {
                effectData.sound.setPlaybackRate(pitch);
            }
            
            effectData.sound.play();
            return effectData.sound;
        }
        return null;
    }
    
    /**
     * Reproducir voz
     */
    playVoice(id, options = {}) {
        const voiceData = this.voice.get(id);
        if (voiceData && voiceData.sound) {
            const { volume, pitch } = options;
            
            if (volume !== undefined) {
                voiceData.sound.setVolume(volume);
            }
            
            if (pitch !== undefined) {
                voiceData.sound.setPlaybackRate(pitch);
            }
            
            voiceData.sound.play();
            return voiceData.sound;
        }
        return null;
    }
    
    /**
     * Detener sonido
     */
    stopSound(id, fadeOut = false) {
        const soundData = this.sounds.get(id);
        if (soundData && soundData.sound) {
            if (fadeOut) {
                this.fadeOut(soundData.sound, 1.0);
            } else {
                soundData.sound.stop();
            }
        }
    }
    
    /**
     * Detener música
     */
    stopMusic(id, fadeOut = true) {
        const musicData = this.music.get(id);
        if (musicData && musicData.sound) {
            if (fadeOut && musicData.options.fadeOut > 0) {
                this.fadeOut(musicData.sound, musicData.options.fadeOut);
            } else {
                musicData.sound.stop();
            }
        }
    }
    
    /**
     * Detener sonido ambiental
     */
    stopAmbient(id, fadeOut = true) {
        const ambientData = this.ambient.get(id);
        if (ambientData && ambientData.sound) {
            if (fadeOut && ambientData.options.fadeOut > 0) {
                this.fadeOut(ambientData.sound, ambientData.options.fadeOut);
            } else {
                ambientData.sound.stop();
            }
        }
    }
    
    /**
     * Fade in
     */
    fadeIn(sound, duration) {
        sound.setVolume(0);
        sound.play();
        
        const startTime = this.audioContext.currentTime;
        const targetVolume = sound.getVolume();
        
        const fadeInInterval = setInterval(() => {
            const elapsed = this.audioContext.currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            sound.setVolume(targetVolume * progress);
            
            if (progress >= 1) {
                clearInterval(fadeInInterval);
            }
        }, 16);
    }
    
    /**
     * Fade out
     */
    fadeOut(sound, duration) {
        const startVolume = sound.getVolume();
        const startTime = this.audioContext.currentTime;
        
        const fadeOutInterval = setInterval(() => {
            const elapsed = this.audioContext.currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            sound.setVolume(startVolume * (1 - progress));
            
            if (progress >= 1) {
                sound.stop();
                clearInterval(fadeOutInterval);
            }
        }, 16);
    }
    
    /**
     * Configurar volumen maestro
     */
    setMasterVolume(volume) {
        this.config.masterVolume = Math.max(0, Math.min(1, volume));
        this.gainNode.gain.value = this.config.masterVolume;
    }
    
    /**
     * Configurar volumen de música
     */
    setMusicVolume(volume) {
        this.config.musicVolume = Math.max(0, Math.min(1, volume));
        this.music.forEach(musicData => {
            musicData.sound.setVolume(this.config.musicVolume);
        });
    }
    
    /**
     * Configurar volumen de efectos
     */
    setSFXVolume(volume) {
        this.config.sfxVolume = Math.max(0, Math.min(1, volume));
        this.effects.forEach(effectData => {
            effectData.sound.setVolume(this.config.sfxVolume);
        });
    }
    
    /**
     * Configurar volumen de voz
     */
    setVoiceVolume(volume) {
        this.config.voiceVolume = Math.max(0, Math.min(1, volume));
        this.voice.forEach(voiceData => {
            voiceData.sound.setVolume(this.config.voiceVolume);
        });
    }
    
    /**
     * Configurar volumen ambiental
     */
    setAmbientVolume(volume) {
        this.config.ambientVolume = Math.max(0, Math.min(1, volume));
        this.ambient.forEach(ambientData => {
            ambientData.sound.setVolume(this.config.ambientVolume);
        });
    }
    
    /**
     * Mute/Unmute
     */
    setMuted(muted) {
        this.states.isMuted = muted;
        this.gainNode.gain.value = muted ? 0 : this.config.masterVolume;
    }
    
    /**
     * Habilitar/Deshabilitar audio 3D
     */
    set3DEnabled(enabled) {
        this.states.is3DEnabled = enabled;
        // Implementar lógica para habilitar/deshabilitar audio 3D
    }
    
    /**
     * Obtener datos de frecuencia
     */
    getFrequencyData() {
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.frequencyData);
            return this.frequencyData;
        }
        return null;
    }
    
    /**
     * Obtener datos de tiempo
     */
    getTimeData() {
        if (this.analyser) {
            this.analyser.getByteTimeDomainData(this.timeData);
            return this.timeData;
        }
        return null;
    }
    
    /**
     * Crear visualización de audio
     */
    createAudioVisualization(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        const animate = () => {
            const frequencyData = this.getFrequencyData();
            if (frequencyData) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = canvas.width / frequencyData.length;
                
                for (let i = 0; i < frequencyData.length; i++) {
                    const barHeight = (frequencyData[i] / 255) * canvas.height;
                    const x = i * barWidth;
                    const y = canvas.height - barHeight;
                    
                    ctx.fillStyle = `hsl(${i * 360 / frequencyData.length}, 70%, 50%)`;
                    ctx.fillRect(x, y, barWidth - 1, barHeight);
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Actualizar sistema de audio
     */
    update(deltaTime) {
        if (!this.states.isInitialized || !this.states.isEnabled) return;
        
        // Actualizar métricas
        this.updateMetrics();
        
        // Actualizar efectos de audio
        this.updateAudioEffects();
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeSounds = this.sounds.size;
        this.metrics.activeMusic = this.music.size;
        this.metrics.activeAmbient = this.ambient.size;
        this.metrics.activeEffects = this.effects.size;
        this.metrics.activeVoice = this.voice.size;
        this.metrics.totalMemory = this.calculateMemoryUsage();
        this.metrics.cpuUsage = this.calculateCPUUsage();
    }
    
    /**
     * Actualizar efectos de audio
     */
    updateAudioEffects() {
        // Actualizar reverb basado en el entorno
        // Actualizar echo basado en la distancia
        // Actualizar filtros basado en la posición
    }
    
    /**
     * Calcular uso de memoria
     */
    calculateMemoryUsage() {
        let total = 0;
        
        this.sounds.forEach(soundData => {
            if (soundData.sound.buffer) {
                total += soundData.sound.buffer.length * 4; // 4 bytes por muestra
            }
        });
        
        return total;
    }
    
    /**
     * Calcular uso de CPU
     */
    calculateCPUUsage() {
        // Implementar cálculo de uso de CPU
        return 0;
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * Obtener estado
     */
    getState() {
        return this.states;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Detener todos los sonidos
        this.sounds.forEach(soundData => {
            soundData.sound.stop();
        });
        
        this.music.forEach(musicData => {
            musicData.sound.stop();
        });
        
        this.ambient.forEach(ambientData => {
            ambientData.sound.stop();
        });
        
        this.effects.forEach(effectData => {
            effectData.sound.stop();
        });
        
        this.voice.forEach(voiceData => {
            voiceData.sound.stop();
        });
        
        // Cerrar contexto de audio
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🧹 Sistema de Audio limpiado');
    }
}

// Exportar para uso global
window.AudioSystem = AudioSystem; 