/**
 * Sistema de Audio Avanzado para Metaverso
 * Audio 3D espacial, síntesis de sonido y efectos avanzados
 */

class AdvancedAudioService {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.compressor = null;
        this.reverb = null;
        this.delay = null;
        this.filter = null;
        
        // Configuración avanzada
        this.config = {
            volume: 0.7,
            spatialAudio: true,
            maxDistance: 1000,
            rolloffFactor: 1,
            refDistance: 1,
            distanceModel: 'inverse',
            dopplerFactor: 1,
            speedOfSound: 343.3,
            enableReverb: true,
            enableEcho: true,
            enableFilter: true,
            enableCompression: true,
            sampleRate: 44100,
            bufferSize: 2048
        };
        
        // Gestión de recursos
        this.buffers = new Map();
        this.audioNodes = new Map();
        this.spatialSources = new Map();
        this.ambientSources = new Map();
        this.musicSources = new Map();
        this.effectSources = new Map();
        
        // Métricas y monitoreo
        this.metrics = {
            activeSources: 0,
            totalMemory: 0,
            cpuUsage: 0,
            bufferUnderruns: 0,
            audioLatency: 0
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isMuted: false,
            is3DEnabled: true,
            isVRMode: false,
            isProcessing: false
        };
        
        // Listener 3D
        this.listener = null;
        this.listenerPosition = { x: 0, y: 0, z: 0 };
        this.listenerVelocity = { x: 0, y: 0, z: 0 };
        this.listenerOrientation = { forward: { x: 0, y: 0, z: -1 }, up: { x: 0, y: 1, z: 0 } };
        
        console.log('🎵 Sistema de Audio Avanzado inicializado');
    }

    /**
     * Inicializar sistema de audio
     */
    async initialize() {
        try {
            // Crear contexto de audio
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.config.sampleRate,
                latencyHint: 'interactive'
            });
            
            // Crear listener 3D
            this.listener = new THREE.AudioListener();
            
            // Configurar nodos de audio
            this.setupAudioNodes();
            
            // Cargar recursos de audio
            await this.loadAudioResources();
            
            // Configurar síntesis de audio
            this.setupAudioSynthesis();
            
            // Configurar efectos avanzados
            this.setupAdvancedEffects();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Audio Avanzado inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de audio:', error);
            throw error;
        }
    }

    /**
     * Configurar nodos de audio avanzados
     */
    setupAudioNodes() {
        // Master Gain Node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.config.volume;
        this.masterGain.connect(this.audioContext.destination);

        // Compressor para control de dinámica
        if (this.config.enableCompression) {
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -24;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.25;
            this.compressor.connect(this.masterGain);
        }

        // Filtro paso bajo para efectos
        if (this.config.enableFilter) {
            this.lowpassFilter = this.audioContext.createBiquadFilter();
            this.lowpassFilter.type = 'lowpass';
            this.lowpassFilter.frequency.value = 20000;
            this.lowpassFilter.Q.value = 1;
            this.lowpassFilter.connect(this.compressor || this.masterGain);
        }

        // Reverb (Convolver) avanzado
        if (this.config.enableReverb) {
            this.reverb = this.audioContext.createConvolver();
            this.reverb.buffer = this.createAdvancedReverbBuffer();
            this.reverb.connect(this.lowpassFilter || this.compressor || this.masterGain);
        }

        // Delay para efectos espaciales
        if (this.config.enableEcho) {
            this.delay = this.audioContext.createDelay(2.0);
            this.delay.delayTime.value = 0.1;
            this.delay.connect(this.reverb || this.lowpassFilter || this.compressor || this.masterGain);

            // Feedback para delay
            this.delayGain = this.audioContext.createGain();
            this.delayGain.gain.value = 0.3;
            this.delayGain.connect(this.delay);
            this.delay.connect(this.delayGain);
        }

        console.log('🎛️ Nodos de audio avanzados configurados');
    }

    /**
     * Crear buffer de reverb avanzado
     */
    createAdvancedReverbBuffer() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 segundos
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                // Crear impulso de reverb más realista
                const decay = Math.exp(-i / (sampleRate * 0.5));
                const noise = (Math.random() - 0.5) * 2;
                channelData[i] = noise * decay * 0.1;
            }
        }
        
        return impulse;
    }

    /**
     * Configurar síntesis de audio
     */
    setupAudioSynthesis() {
        // Osciladores para síntesis
        this.oscillators = {
            sine: this.audioContext.createOscillator(),
            square: this.audioContext.createOscillator(),
            sawtooth: this.audioContext.createOscillator(),
            triangle: this.audioContext.createOscillator()
        };
        
        // Configurar osciladores
        Object.values(this.oscillators).forEach(osc => {
            osc.frequency.value = 440;
            osc.type = 'sine';
        });
        
        console.log('🎼 Síntesis de audio configurada');
    }

    /**
     * Configurar efectos avanzados
     */
    setupAdvancedEffects() {
        // Distortion
        this.distortion = this.audioContext.createWaveShaper();
        this.distortion.curve = this.makeDistortionCurve(400);
        
        // Chorus
        this.chorus = this.audioContext.createDelay(0.1);
        this.chorus.delayTime.value = 0.05;
        
        // Flanger
        this.flanger = this.audioContext.createDelay(0.01);
        this.flanger.delayTime.value = 0.005;
        
        console.log('🎭 Efectos avanzados configurados');
    }

    /**
     * Crear curva de distorsión
     */
    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        
        return curve;
    }

    /**
     * Cargar recursos de audio mejorados
     */
    async loadAudioResources() {
        const audioResources = {
            // Audio ambiental por isla con variaciones
            'island-tropical': {
                url: '/assets/audio/ambient/tropical-island.mp3',
                type: 'ambient',
                loop: true,
                volume: 0.3,
                variations: ['morning', 'afternoon', 'evening', 'night']
            },
            'island-snow': {
                url: '/assets/audio/ambient/snow-island.mp3',
                type: 'ambient',
                loop: true,
                volume: 0.3,
                variations: ['calm', 'storm', 'wind']
            },
            'island-desert': {
                url: '/assets/audio/ambient/desert-island.mp3',
                type: 'ambient',
                loop: true,
                volume: 0.3,
                variations: ['hot', 'wind', 'sandstorm']
            },
            'island-forest': {
                url: '/assets/audio/ambient/forest-island.mp3',
                type: 'ambient',
                loop: true,
                volume: 0.3,
                variations: ['birds', 'leaves', 'water']
            },
            'island-volcanic': {
                url: '/assets/audio/ambient/volcanic-island.mp3',
                type: 'ambient',
                loop: true,
                volume: 0.3,
                variations: ['rumble', 'eruption', 'lava']
            },
            
            // Efectos de sonido mejorados
            'footstep-grass': {
                url: '/assets/audio/effects/footstep-grass.mp3',
                type: 'effect',
                loop: false,
                volume: 0.5,
                spatial: true
            },
            'footstep-sand': {
                url: '/assets/audio/effects/footstep-sand.mp3',
                type: 'effect',
                loop: false,
                volume: 0.5,
                spatial: true
            },
            'footstep-snow': {
                url: '/assets/audio/effects/footstep-snow.mp3',
                type: 'effect',
                loop: false,
                volume: 0.5,
                spatial: true
            },
            'water-splash': {
                url: '/assets/audio/effects/water-splash.mp3',
                type: 'effect',
                loop: false,
                volume: 0.6,
                spatial: true
            },
            'wind': {
                url: '/assets/audio/effects/wind.mp3',
                type: 'effect',
                loop: true,
                volume: 0.4,
                spatial: true
            },
            'birds': {
                url: '/assets/audio/effects/birds.mp3',
                type: 'effect',
                loop: true,
                volume: 0.3,
                spatial: true
            },
            
            // Música de fondo con transiciones
            'music-ambient': {
                url: '/assets/audio/music/ambient.mp3',
                type: 'music',
                loop: true,
                volume: 0.2,
                crossfade: true
            },
            'music-action': {
                url: '/assets/audio/music/action.mp3',
                type: 'music',
                loop: true,
                volume: 0.3,
                crossfade: true
            },
            'music-exploration': {
                url: '/assets/audio/music/exploration.mp3',
                type: 'music',
                loop: true,
                volume: 0.25,
                crossfade: true
            }
        };

        console.log('📥 Cargando recursos de audio avanzados...');
        
        for (const [name, resource] of Object.entries(audioResources)) {
            try {
                await this.loadAudioBuffer(name, resource.url);
                this.audioNodes.set(name, resource);
                console.log(`✅ Audio avanzado cargado: ${name}`);
            } catch (error) {
                console.warn(`⚠️ Error cargando audio '${name}':`, error.message);
            }
        }
        
        console.log(`📊 ${this.buffers.size} recursos de audio avanzados cargados`);
    }

    /**
     * Cargar buffer de audio con optimización
     */
    async loadAudioBuffer(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.buffers.set(name, audioBuffer);
            
            // Calcular uso de memoria
            const memoryUsage = audioBuffer.length * audioBuffer.numberOfChannels * 4; // 4 bytes por float32
            this.metrics.totalMemory += memoryUsage;
            
            return audioBuffer;
        } catch (error) {
            console.error(`Error cargando audio buffer ${name}:`, error);
            throw error;
        }
    }

    /**
     * Crear fuente de audio 3D espacial
     */
    createSpatialSource(name, position = { x: 0, y: 0, z: 0 }) {
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`Buffer de audio no encontrado: ${name}`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const panner = this.audioContext.createPanner();

        // Configurar panner 3D
        panner.setPosition(position.x, position.y, position.z);
        panner.setOrientation(0, 0, -1);
        panner.setVelocity(0, 0, 0);
        panner.setRolloffFactor(this.config.rolloffFactor);
        panner.setRefDistance(this.config.refDistance);
        panner.setMaxDistance(this.config.maxDistance);
        panner.setDistanceModel(this.config.distanceModel);
        panner.setDopplerFactor(this.config.dopplerFactor);

        // Conectar nodos
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.reverb || this.lowpassFilter || this.compressor || this.masterGain);

        const spatialSource = {
            source,
            gainNode,
            panner,
            position,
            isPlaying: false,
            startTime: 0
        };

        this.spatialSources.set(name, spatialSource);
        this.metrics.activeSources++;

        return spatialSource;
    }

    /**
     * Reproducir sonido 3D
     */
    playSpatialSound(name, position = { x: 0, y: 0, z: 0 }, options = {}) {
        const spatialSource = this.createSpatialSource(name, position);
        if (!spatialSource) return null;

        const { volume = 1.0, loop = false, autoplay = true } = options;

        spatialSource.gainNode.gain.value = volume;
        spatialSource.source.loop = loop;

        if (autoplay) {
            spatialSource.source.start();
            spatialSource.isPlaying = true;
            spatialSource.startTime = this.audioContext.currentTime;
        }

        return spatialSource;
    }

    /**
     * Reproducir música con crossfade
     */
    playMusic(name, fadeIn = true, crossfade = true) {
        const musicData = this.audioNodes.get(name);
        if (!musicData) return null;

        const buffer = this.buffers.get(name);
        if (!buffer) return null;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.loop = musicData.loop;
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        if (fadeIn) {
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                musicData.volume,
                this.audioContext.currentTime + 2
            );
        } else {
            gainNode.gain.value = musicData.volume;
        }

        source.start();
        this.musicSources.set(name, { source, gainNode, musicData });

        return { source, gainNode };
    }

    /**
     * Detener música con fade out
     */
    stopMusic(name, fadeOut = true) {
        const musicSource = this.musicSources.get(name);
        if (!musicSource) return;

        if (fadeOut) {
            musicSource.gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 2
            );
            setTimeout(() => {
                musicSource.source.stop();
                this.musicSources.delete(name);
            }, 2000);
        } else {
            musicSource.source.stop();
            this.musicSources.delete(name);
        }
    }

    /**
     * Actualizar posición del listener
     */
    updateListenerPosition(position, velocity = { x: 0, y: 0, z: 0 }, orientation = null) {
        this.listenerPosition = position;
        this.listenerVelocity = velocity;
        
        if (orientation) {
            this.listenerOrientation = orientation;
        }

        // Actualizar panner del listener
        if (this.listener) {
            this.listener.setPosition(position.x, position.y, position.z);
            this.listener.setVelocity(velocity.x, velocity.y, velocity.z);
            this.listener.setOrientation(
                orientation?.forward.x || 0,
                orientation?.forward.y || 0,
                orientation?.forward.z || -1,
                orientation?.up.x || 0,
                orientation?.up.y || 1,
                orientation?.up.z || 0
            );
        }
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

        // Actualizar fuentes espaciales
        this.updateSpatialSources();

        // Actualizar música
        this.updateMusic();
    }

    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeSources = this.spatialSources.size + this.musicSources.size;
        this.metrics.cpuUsage = this.audioContext.state === 'running' ? 0.1 : 0;
        this.metrics.audioLatency = this.audioContext.baseLatency || 0;
    }

    /**
     * Actualizar efectos de audio
     */
    updateAudioEffects() {
        // Actualizar reverb basado en el entorno
        if (this.reverb) {
            // Implementar cambios dinámicos de reverb
        }

        // Actualizar delay basado en la distancia
        if (this.delay) {
            // Implementar cambios dinámicos de delay
        }

        // Actualizar filtros basado en la posición
        if (this.lowpassFilter) {
            // Implementar cambios dinámicos de filtros
        }
    }

    /**
     * Actualizar fuentes espaciales
     */
    updateSpatialSources() {
        this.spatialSources.forEach((source, name) => {
            if (source.isPlaying) {
                // Actualizar posición si es necesario
                // Implementar efectos Doppler
                // Implementar occlusión de sonido
            }
        });
    }

    /**
     * Actualizar música
     */
    updateMusic() {
        this.musicSources.forEach((musicSource, name) => {
            // Verificar si la música sigue reproduciéndose
            if (musicSource.source.playbackState === 'finished') {
                this.musicSources.delete(name);
            }
        });
    }

    /**
     * Configurar volumen maestro
     */
    setMasterVolume(volume) {
        this.config.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.config.volume, this.audioContext.currentTime);
        }
    }

    /**
     * Mute/Unmute sistema
     */
    setMuted(muted) {
        this.states.isMuted = muted;
        if (this.masterGain) {
            const targetVolume = muted ? 0 : this.config.volume;
            this.masterGain.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);
        }
    }

    /**
     * Habilitar/Deshabilitar audio 3D
     */
    set3DEnabled(enabled) {
        this.states.is3DEnabled = enabled;
        this.config.spatialAudio = enabled;
    }

    /**
     * Obtener métricas del sistema
     */
    getMetrics() {
        return {
            ...this.metrics,
            states: this.states,
            config: this.config
        };
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        // Detener todas las fuentes
        this.spatialSources.forEach(source => {
            if (source.isPlaying) {
                source.source.stop();
            }
        });

        this.musicSources.forEach(musicSource => {
            musicSource.source.stop();
        });

        // Limpiar buffers
        this.buffers.clear();
        this.audioNodes.clear();
        this.spatialSources.clear();
        this.musicSources.clear();

        // Cerrar contexto de audio
        if (this.audioContext) {
            this.audioContext.close();
        }

        console.log('🧹 Sistema de Audio Avanzado limpiado');
    }
}

// Exportar para uso global
window.AdvancedAudioService = AdvancedAudioService; 