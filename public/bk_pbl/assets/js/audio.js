/**
 * Metaverso Audio System
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoAudio {
    constructor() {
        this.isInitialized = false;
        this.isMuted = false;
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // Audio settings
        this.settings = {
            masterVolume: 0.5,
            musicVolume: 0.3,
            sfxVolume: 0.7,
            spatialAudio: true,
            reverb: true,
            compression: true
        };
        
        // Audio sources
        this.sources = {
            ambient: new Map(),
            music: new Map(),
            sfx: new Map(),
            spatial: new Map()
        };
        
        // Current playing audio
        this.current = {
            ambient: null,
            music: null,
            sfx: [],
            spatial: []
        };
        
        // Audio buffers
        this.buffers = new Map();
        
        // Spatial audio
        this.listener = null;
        this.spatialSources = new Map();
        
        // Audio generation
        this.generators = {
            oscillators: new Map(),
            filters: new Map(),
            effects: new Map()
        };
        
        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Initialize audio system
     */
    async initialize() {
        try {
            console.log('🎵 Inicializando sistema de audio...');
            
            // Check Web Audio API support
            if (!window.AudioContext && !window.webkitAudioContext) {
                throw new Error('Web Audio API no soportada');
            }
            
            // Create audio context
            this.createAudioContext();
            
            // Setup audio nodes
            this.setupAudioNodes();
            
            // Setup spatial audio
            this.setupSpatialAudio();
            
            // Create audio generators
            this.createAudioGenerators();
            
            // Load audio assets
            await this.loadAudioAssets();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start ambient audio
            this.startAmbientAudio();
            
            this.isInitialized = true;
            console.log('✅ Sistema de audio inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de audio:', error);
            throw error;
        }
    }

    /**
     * Create audio context
     */
    createAudioContext() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContextClass();
        
        // Resume context on user interaction
        document.addEventListener('click', () => {
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
        }, { once: true });
    }

    /**
     * Setup audio nodes
     */
    setupAudioNodes() {
        // Master gain
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.settings.masterVolume;
        this.masterGain.connect(this.context.destination);
        
        // Music gain
        this.musicGain = this.context.createGain();
        this.musicGain.gain.value = this.settings.musicVolume;
        this.musicGain.connect(this.masterGain);
        
        // SFX gain
        this.sfxGain = this.context.createGain();
        this.sfxGain.gain.value = this.settings.sfxVolume;
        this.sfxGain.connect(this.masterGain);
        
        // Add compression
        if (this.settings.compression) {
            this.addCompression();
        }
        
        // Add reverb
        if (this.settings.reverb) {
            this.addReverb();
        }
    }

    /**
     * Add compression
     */
    addCompression() {
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        this.masterGain.disconnect();
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.context.destination);
    }

    /**
     * Add reverb
     */
    addReverb() {
        this.reverb = this.createReverb();
        this.reverb.connect(this.masterGain);
    }

    /**
     * Create reverb effect
     */
    createReverb() {
        const convolver = this.context.createConvolver();
        
        // Create impulse response
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * 2; // 2 seconds
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.1));
            }
        }
        
        convolver.buffer = impulse;
        
        const reverbGain = this.context.createGain();
        reverbGain.gain.value = 0.3;
        
        convolver.connect(reverbGain);
        return reverbGain;
    }

    /**
     * Setup spatial audio
     */
    setupSpatialAudio() {
        if (this.settings.spatialAudio) {
            this.listener = this.context.listener;
            
            // Set listener position
            this.listener.setPosition(0, 0, 0);
            this.listener.setOrientation(0, 0, -1, 0, 1, 0);
        }
    }

    /**
     * Create audio generators
     */
    createAudioGenerators() {
        // Create oscillators for different sounds
        this.createOscillator('ambient', 'sine', 220);
        this.createOscillator('wind', 'noise', 0);
        this.createOscillator('water', 'sine', 440);
        this.createOscillator('fire', 'sawtooth', 110);
        
        // Create filters
        this.createFilter('lowpass', 1000);
        this.createFilter('highpass', 500);
        this.createFilter('bandpass', 800);
        
        // Create effects
        this.createEffect('delay', 0.5);
        this.createEffect('chorus', 0.3);
        this.createEffect('distortion', 0.1);
    }

    /**
     * Create oscillator
     */
    createOscillator(name, type, frequency) {
        const oscillator = this.context.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        const gain = this.context.createGain();
        gain.gain.value = 0;
        
        oscillator.connect(gain);
        gain.connect(this.musicGain);
        
        this.generators.oscillators.set(name, { oscillator, gain });
        oscillator.start();
    }

    /**
     * Create filter
     */
    createFilter(type, frequency) {
        const filter = this.context.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        
        this.generators.filters.set(type, filter);
    }

    /**
     * Create effect
     */
    createEffect(type, intensity) {
        let effect;
        
        switch (type) {
            case 'delay':
                effect = this.context.createDelay(1.0);
                effect.delayTime.value = 0.5;
                break;
            case 'chorus':
                effect = this.context.createBiquadFilter();
                effect.type = 'lowpass';
                effect.frequency.value = 800;
                break;
            case 'distortion':
                effect = this.context.createWaveShaper();
                effect.curve = this.makeDistortionCurve(intensity);
                break;
        }
        
        if (effect) {
            this.generators.effects.set(type, effect);
        }
    }

    /**
     * Make distortion curve
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
     * Load audio assets
     */
    async loadAudioAssets() {
        console.log('📁 Cargando assets de audio...');
        
        const audioFiles = [
            { name: 'ambient_forest', url: 'assets/audio/ambient/forest.mp3' },
            { name: 'ambient_ocean', url: 'assets/audio/ambient/ocean.mp3' },
            { name: 'ambient_mountain', url: 'assets/audio/ambient/mountain.mp3' },
            { name: 'ambient_desert', url: 'assets/audio/ambient/desert.mp3' },
            { name: 'ambient_city', url: 'assets/audio/ambient/city.mp3' },
            { name: 'music_main', url: 'assets/audio/music/main_theme.mp3' },
            { name: 'sfx_click', url: 'assets/audio/sfx/click.mp3' },
            { name: 'sfx_notification', url: 'assets/audio/sfx/notification.mp3' }
        ];
        
        const loadPromises = audioFiles.map(file => this.loadAudioFile(file.name, file.url));
        
        try {
            await Promise.all(loadPromises);
            console.log('✅ Assets de audio cargados');
        } catch (error) {
            console.warn('⚠️ Algunos assets de audio no se pudieron cargar:', error);
        }
    }

    /**
     * Load audio file
     */
    async loadAudioFile(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (error) {
            console.warn(`⚠️ No se pudo cargar ${url}:`, error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Volume controls
        const masterVolume = document.getElementById('master-volume');
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const audioToggle = document.getElementById('audio-toggle');
        
        if (masterVolume) {
            masterVolume.addEventListener('input', (e) => {
                this.setMasterVolume(parseFloat(e.target.value) / 100);
            });
        }
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                this.setMusicVolume(parseFloat(e.target.value) / 100);
            });
        }
        
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                this.setSFXVolume(parseFloat(e.target.value) / 100);
            });
        }
        
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    }

    /**
     * Start ambient audio
     */
    startAmbientAudio() {
        // Start with default ambient sound
        this.playAmbient('ambient_forest');
    }

    /**
     * Play ambient audio
     */
    playAmbient(name, fadeTime = 2.0) {
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`⚠️ Buffer de audio no encontrado: ${name}`);
            return;
        }
        
        // Stop current ambient
        if (this.current.ambient) {
            this.stopAudio(this.current.ambient, fadeTime);
        }
        
        // Create new ambient source
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        
        source.connect(gain);
        gain.connect(this.musicGain);
        
        // Fade in
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(this.settings.musicVolume, this.context.currentTime + fadeTime);
        
        source.start();
        this.current.ambient = { source, gain };
        
        console.log(`🎵 Reproduciendo audio ambiental: ${name}`);
    }

    /**
     * Play music
     */
    playMusic(name, fadeTime = 1.0) {
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`⚠️ Buffer de música no encontrado: ${name}`);
            return;
        }
        
        // Stop current music
        if (this.current.music) {
            this.stopAudio(this.current.music, fadeTime);
        }
        
        // Create new music source
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        
        source.connect(gain);
        gain.connect(this.musicGain);
        
        // Fade in
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(this.settings.musicVolume, this.context.currentTime + fadeTime);
        
        source.start();
        this.current.music = { source, gain };
        
        console.log(`🎵 Reproduciendo música: ${name}`);
    }

    /**
     * Play SFX
     */
    playSFX(name, volume = 1.0) {
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`⚠️ Buffer de SFX no encontrado: ${name}`);
            return;
        }
        
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        
        source.buffer = buffer;
        gain.gain.value = volume * this.settings.sfxVolume;
        
        source.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start();
        
        // Add to current SFX list
        this.current.sfx.push({ source, gain });
        
        // Remove when finished
        source.onended = () => {
            const index = this.current.sfx.indexOf({ source, gain });
            if (index > -1) {
                this.current.sfx.splice(index, 1);
            }
        };
        
        console.log(`🔊 Reproduciendo SFX: ${name}`);
    }

    /**
     * Play spatial audio
     */
    playSpatialAudio(name, position, volume = 1.0) {
        if (!this.settings.spatialAudio) {
            this.playSFX(name, volume);
            return;
        }
        
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`⚠️ Buffer de audio espacial no encontrado: ${name}`);
            return;
        }
        
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        const panner = this.context.createPanner();
        
        source.buffer = buffer;
        gain.gain.value = volume * this.settings.sfxVolume;
        
        panner.setPosition(position.x, position.y, position.z);
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 100;
        panner.rolloffFactor = 1;
        
        source.connect(gain);
        gain.connect(panner);
        panner.connect(this.sfxGain);
        
        source.start();
        
        // Add to spatial sources
        this.spatialSources.set(name, { source, gain, panner, position });
        
        console.log(`🎵 Reproduciendo audio espacial: ${name} en ${JSON.stringify(position)}`);
    }

    /**
     * Generate procedural audio
     */
    generateProceduralAudio(type, parameters = {}) {
        switch (type) {
            case 'ambient':
                return this.generateAmbientAudio(parameters);
            case 'wind':
                return this.generateWindAudio(parameters);
            case 'water':
                return this.generateWaterAudio(parameters);
            case 'fire':
                return this.generateFireAudio(parameters);
            default:
                console.warn(`⚠️ Tipo de audio procedural no soportado: ${type}`);
        }
    }

    /**
     * Generate ambient audio
     */
    generateAmbientAudio(parameters) {
        const { frequency = 220, type = 'sine', volume = 0.1 } = parameters;
        
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gain.gain.value = volume;
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        oscillator.start();
        
        return { oscillator, gain, filter };
    }

    /**
     * Generate wind audio
     */
    generateWindAudio(parameters) {
        const { intensity = 0.5, speed = 1.0 } = parameters;
        
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator.type = 'noise';
        
        gain.gain.value = intensity * 0.3;
        filter.type = 'highpass';
        filter.frequency.value = 200;
        
        // Modulate filter frequency for wind effect
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        
        lfo.frequency.value = speed;
        lfoGain.gain.value = 100;
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        oscillator.start();
        lfo.start();
        
        return { oscillator, gain, filter, lfo, lfoGain };
    }

    /**
     * Generate water audio
     */
    generateWaterAudio(parameters) {
        const { frequency = 440, depth = 0.5 } = parameters;
        
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gain.gain.value = depth * 0.2;
        filter.type = 'bandpass';
        filter.frequency.value = frequency;
        filter.Q.value = 2;
        
        // Add some randomness for water effect
        const noise = this.context.createOscillator();
        const noiseGain = this.context.createGain();
        
        noise.type = 'noise';
        noiseGain.gain.value = 0.1;
        
        noise.connect(noiseGain);
        noiseGain.connect(gain);
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        oscillator.start();
        noise.start();
        
        return { oscillator, gain, filter, noise, noiseGain };
    }

    /**
     * Generate fire audio
     */
    generateFireAudio(parameters) {
        const { intensity = 0.5, crackle = 0.3 } = parameters;
        
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 110;
        
        gain.gain.value = intensity * 0.3;
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        
        // Add crackle effect
        const crackleOsc = this.context.createOscillator();
        const crackleGain = this.context.createGain();
        const crackleFilter = this.context.createBiquadFilter();
        
        crackleOsc.type = 'noise';
        crackleGain.gain.value = crackle * 0.1;
        crackleFilter.type = 'highpass';
        crackleFilter.frequency.value = 1000;
        
        crackleOsc.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(gain);
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        oscillator.start();
        crackleOsc.start();
        
        return { oscillator, gain, filter, crackleOsc, crackleGain, crackleFilter };
    }

    /**
     * Stop audio
     */
    stopAudio(audio, fadeTime = 0.1) {
        if (!audio) return;
        
        const { source, gain } = audio;
        
        if (gain) {
            gain.gain.setValueAtTime(gain.gain.value, this.context.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeTime);
        }
        
        setTimeout(() => {
            if (source && source.stop) {
                source.stop();
            }
        }, fadeTime * 1000);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.settings.masterVolume = volume;
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.settings.musicVolume = volume;
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.settings.sfxVolume = volume;
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.settings.masterVolume;
        }
        
        // Update UI
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            const icon = audioToggle.querySelector('.audio-icon');
            if (icon) {
                icon.textContent = this.isMuted ? '🔇' : '🔊';
            }
            audioToggle.classList.toggle('muted', this.isMuted);
        }
        
        console.log(`🔇 Audio ${this.isMuted ? 'silenciado' : 'activado'}`);
    }

    /**
     * Update spatial audio
     */
    updateSpatialAudio(cameraPosition, cameraOrientation) {
        if (!this.settings.spatialAudio || !this.listener) return;
        
        // Update listener position and orientation
        this.listener.setPosition(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this.listener.setOrientation(
            cameraOrientation.x, cameraOrientation.y, cameraOrientation.z,
            0, 1, 0
        );
        
        // Update spatial sources
        this.spatialSources.forEach((audio, name) => {
            const { panner, position } = audio;
            panner.setPosition(position.x, position.y, position.z);
        });
    }

    /**
     * Change island audio
     */
    changeIslandAudio(islandType) {
        const ambientMap = {
            'forest': 'ambient_forest',
            'ocean': 'ambient_ocean',
            'mountain': 'ambient_mountain',
            'desert': 'ambient_desert',
            'city': 'ambient_city'
        };
        
        const ambientName = ambientMap[islandType];
        if (ambientName) {
            this.playAmbient(ambientName, 3.0);
        }
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    /**
     * Dispose
     */
    dispose() {
        // Stop all audio
        if (this.current.ambient) {
            this.stopAudio(this.current.ambient);
        }
        if (this.current.music) {
            this.stopAudio(this.current.music);
        }
        this.current.sfx.forEach(audio => {
            this.stopAudio(audio);
        });
        
        // Stop oscillators
        this.generators.oscillators.forEach(({ oscillator }) => {
            if (oscillator.stop) {
                oscillator.stop();
            }
        });
        
        // Close audio context
        if (this.context && this.context.state !== 'closed') {
            this.context.close();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoAudio;
} 