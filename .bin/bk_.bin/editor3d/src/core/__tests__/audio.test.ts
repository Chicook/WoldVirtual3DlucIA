/**
 * Tests para el Sistema de Audio 3D Enterprise
 */

import { AudioManager, Audio3D, AudioType } from '../audio/AudioManager';
import { AudioEffectFactory, EffectType } from '../audio/AudioEffects';
import { AudioSpatial, SpatialAudioUtils } from '../audio/AudioSpatial';
import { AudioUtils } from '../audio/index';
import { Vector3 } from '../scene/math/Vector3';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

// Mock del contexto de audio
const mockAudioContext = {
  createGain: jest.fn(() => ({
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    disconnect: jest.fn()
  })),
  createPanner: jest.fn(() => ({
    setPosition: jest.fn(),
    setOrientation: jest.fn(),
    setVelocity: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    panningModel: 'HRTF',
    distanceModel: 'inverse',
    maxDistance: 100,
    refDistance: 1,
    rolloffFactor: 1,
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneOuterGain: 0
  })),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    loop: false,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn()
  })),
  createConvolver: jest.fn(() => ({
    buffer: null,
    connect: jest.fn(),
    disconnect: jest.fn()
  })),
  createDelay: jest.fn(() => ({
    delayTime: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    disconnect: jest.fn()
  })),
  createBiquadFilter: jest.fn(() => ({
    type: 'lowpass',
    frequency: { setValueAtTime: jest.fn() },
    Q: { setValueAtTime: jest.fn() },
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    disconnect: jest.fn()
  })),
  createWaveShaper: jest.fn(() => ({
    curve: null,
    oversample: '2x',
    connect: jest.fn(),
    disconnect: jest.fn()
  })),
  createOscillator: jest.fn(() => ({
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn()
  })),
  decodeAudioData: jest.fn(() => Promise.resolve({
    duration: 10,
    sampleRate: 44100,
    numberOfChannels: 2,
    length: 441000
  })),
  listener: {
    setPosition: jest.fn(),
    setOrientation: jest.fn(),
    setVelocity: jest.fn()
  },
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  close: jest.fn()
};

// Mock de fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
  })
) as jest.Mock;

// Mock de AudioContext
global.AudioContext = jest.fn(() => mockAudioContext) as any;
(global as any).webkitAudioContext = global.AudioContext;

describe('Sistema de Audio 3D', () => {
  let audioManager: AudioManager;
  let eventEmitter: EventEmitter<any>;
  let logger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    
    eventEmitter = new EventEmitter();
    logger = new Logger('Test');
    
    audioManager = new AudioManager(eventEmitter, logger);
  });

  afterEach(() => {
    audioManager.dispose();
  });

  describe('AudioManager', () => {
    it('should initialize audio context successfully', () => {
      expect(audioManager.audioContext).toBeDefined();
      expect(audioManager.masterVolume).toBe(1.0);
      expect(audioManager.effectsEnabled).toBe(true);
      expect(audioManager.spatialEnabled).toBe(true);
    });

    it('should create and load audio successfully', async () => {
      const config = {
        id: 'test-audio',
        name: 'Test Audio',
        type: AudioType.SFX,
        source: 'test.mp3'
      };

      const audio = await audioManager.createAudio(config);
      
      expect(audio).toBeInstanceOf(Audio3D);
      expect(audio.id).toBe('test-audio');
      expect(audio.name).toBe('Test Audio');
      expect(audio.type).toBe(AudioType.SFX);
      expect(audio.isLoaded).toBe(true);
    });

    it('should play audio at specific position', async () => {
      const config = {
        id: 'test-audio',
        name: 'Test Audio',
        type: AudioType.SFX,
        source: 'test.mp3'
      };

      const audio = await audioManager.createAudio(config);
      const position = new Vector3(10, 5, 0);
      
      audioManager.playAudio('test-audio', position);
      
      expect(audio.position).toEqual(position);
      expect(audio.isPlaying).toBe(true);
    });

    it('should update listener position', () => {
      const position = new Vector3(5, 10, 15);
      const orientation = new Vector3(0, 0, -1);
      const velocity = new Vector3(1, 0, 0);

      audioManager.updateListener({ position, orientation, velocity });

      expect(audioManager.listener.position).toEqual(position);
      expect(audioManager.listener.orientation).toEqual(orientation);
      expect(audioManager.listener.velocity).toEqual(velocity);
    });

    it('should set master volume', () => {
      const newVolume = 0.5;
      audioManager.setMasterVolume(newVolume);
      
      expect(audioManager.masterVolume).toBe(newVolume);
    });

    it('should create ambient audio', () => {
      const ambientConfig = {
        id: 'ambient-forest',
        name: 'Forest Ambient',
        sources: ['forest1.mp3', 'forest2.mp3'],
        volume: 0.7,
        crossfade: 2.0,
        loop: true,
        spatial: true,
        position: new Vector3(0, 0, 0),
        radius: 50
      };

      const ambient = audioManager.createAmbientAudio(ambientConfig);
      
      expect(ambient.id).toBe('ambient-forest');
      expect(ambient.name).toBe('Forest Ambient');
      expect(ambient.sources).toEqual(['forest1.mp3', 'forest2.mp3']);
      expect(ambient.volume).toBe(0.7);
      expect(ambient.enabled).toBe(false);
    });

    it('should enable/disable ambient audio', () => {
      const ambientConfig = {
        id: 'ambient-forest',
        name: 'Forest Ambient',
        sources: ['forest1.mp3'],
        volume: 0.7,
        crossfade: 2.0,
        loop: true,
        spatial: true,
        position: new Vector3(0, 0, 0),
        radius: 50
      };

      const ambient = audioManager.createAmbientAudio(ambientConfig);
      
      audioManager.setAmbientEnabled('ambient-forest', true);
      expect(ambient.enabled).toBe(true);
      
      audioManager.setAmbientEnabled('ambient-forest', false);
      expect(ambient.enabled).toBe(false);
    });
  });

  describe('Audio3D', () => {
    let audio: Audio3D;

    beforeEach(async () => {
      const config = {
        id: 'test-audio',
        name: 'Test Audio',
        type: AudioType.SFX,
        source: 'test.mp3',
        volume: 0.8,
        loop: true,
        spatial: true,
        maxDistance: 200
      };

      audio = new Audio3D(config);
      await audio.load(mockAudioContext as any);
    });

    it('should create audio with correct properties', () => {
      expect(audio.id).toBe('test-audio');
      expect(audio.name).toBe('Test Audio');
      expect(audio.type).toBe(AudioType.SFX);
      expect(audio.volume).toBe(0.8);
      expect(audio.loop).toBe(true);
      expect(audio.spatial).toBe(true);
      expect(audio.maxDistance).toBe(200);
    });

    it('should play audio successfully', () => {
      const listener = {
        position: new Vector3(0, 0, 0),
        orientation: new Vector3(0, 0, -1),
        velocity: new Vector3(0, 0, 0),
        up: new Vector3(0, 1, 0)
      };

      audio.play(listener);
      
      expect(audio.isPlaying).toBe(true);
      expect(audio.isPaused).toBe(false);
    });

    it('should pause and resume audio', () => {
      const listener = {
        position: new Vector3(0, 0, 0),
        orientation: new Vector3(0, 0, -1),
        velocity: new Vector3(0, 0, 0),
        up: new Vector3(0, 1, 0)
      };

      audio.play(listener);
      expect(audio.isPlaying).toBe(true);

      audio.pause();
      expect(audio.isPlaying).toBe(false);
      expect(audio.isPaused).toBe(true);

      audio.play(listener);
      expect(audio.isPlaying).toBe(true);
      expect(audio.isPaused).toBe(false);
    });

    it('should stop audio', () => {
      const listener = {
        position: new Vector3(0, 0, 0),
        orientation: new Vector3(0, 0, -1),
        velocity: new Vector3(0, 0, 0),
        up: new Vector3(0, 1, 0)
      };

      audio.play(listener);
      expect(audio.isPlaying).toBe(true);

      audio.stop();
      expect(audio.isPlaying).toBe(false);
      expect(audio.isPaused).toBe(false);
    });

    it('should update volume', () => {
      const newVolume = 0.5;
      audio.setVolume(newVolume);
      
      expect(audio.volume).toBe(newVolume);
    });

    it('should update spatial position', () => {
      const listener = {
        position: new Vector3(0, 0, 0),
        orientation: new Vector3(0, 0, -1),
        velocity: new Vector3(0, 0, 0),
        up: new Vector3(0, 1, 0)
      };

      const newPosition = new Vector3(10, 5, 0);
      audio.position.copy(newPosition);
      
      audio.updateSpatialPosition(listener);
      expect(audio.position).toEqual(newPosition);
    });

    it('should add filter', () => {
      const filter = audio.addFilter('lowpass', 1000, 1);
      
      expect(filter).toBeDefined();
      expect(filter.type).toBe('lowpass');
    });

    it('should dispose audio resources', () => {
      audio.dispose();
      
      expect(audio.isLoaded).toBe(false);
      expect(audio.isPlaying).toBe(false);
    });
  });

  describe('AudioEffects', () => {
    it('should create reverb effect', () => {
      const reverb = AudioEffectFactory.createEffect(
        mockAudioContext as any,
        EffectType.REVERB,
        { roomSize: 0.7, dampening: 0.3 }
      );

      expect(reverb).toBeDefined();
      expect(reverb.type).toBe(EffectType.REVERB);
      expect(reverb.name).toBe('Reverb');
    });

    it('should create delay effect', () => {
      const delay = AudioEffectFactory.createEffect(
        mockAudioContext as any,
        EffectType.DELAY,
        { delayTime: 0.5, feedback: 0.4 }
      );

      expect(delay).toBeDefined();
      expect(delay.type).toBe(EffectType.DELAY);
      expect(delay.name).toBe('Delay');
    });

    it('should create filter effect', () => {
      const filter = AudioEffectFactory.createEffect(
        mockAudioContext as any,
        EffectType.FILTER,
        { type: 'highpass', frequency: 500, Q: 2 }
      );

      expect(filter).toBeDefined();
      expect(filter.type).toBe(EffectType.FILTER);
      expect(filter.name).toBe('Filter');
    });

    it('should create distortion effect', () => {
      const distortion = AudioEffectFactory.createEffect(
        mockAudioContext as any,
        EffectType.DISTORTION,
        { amount: 100, oversample: '4x' }
      );

      expect(distortion).toBeDefined();
      expect(distortion.type).toBe(EffectType.DISTORTION);
      expect(distortion.name).toBe('Distortion');
    });

    it('should get all effect types', () => {
      const effectTypes = AudioEffectFactory.getEffectTypes();
      
      expect(effectTypes).toContain(EffectType.REVERB);
      expect(effectTypes).toContain(EffectType.DELAY);
      expect(effectTypes).toContain(EffectType.FILTER);
      expect(effectTypes).toContain(EffectType.DISTORTION);
      expect(effectTypes).toContain(EffectType.CHORUS);
      expect(effectTypes).toContain(EffectType.FLANGER);
      expect(effectTypes).toContain(EffectType.PHASER);
    });

    it('should get default config for effect type', () => {
      const reverbConfig = AudioEffectFactory.getDefaultConfig(EffectType.REVERB);
      
      expect(reverbConfig).toHaveProperty('roomSize');
      expect(reverbConfig).toHaveProperty('dampening');
      expect(reverbConfig).toHaveProperty('wetLevel');
      expect(reverbConfig).toHaveProperty('dryLevel');
    });
  });

  describe('AudioSpatial', () => {
    let spatial: AudioSpatial;

    beforeEach(() => {
      spatial = new AudioSpatial(mockAudioContext as any);
    });

    afterEach(() => {
      spatial.dispose();
    });

    it('should initialize spatial audio system', () => {
      expect(spatial.currentListener).toBeDefined();
      expect(spatial.currentZones).toBeDefined();
      expect(spatial.currentReverbs).toBeDefined();
      expect(spatial.currentPanners).toBeDefined();
    });

    it('should update listener position', () => {
      const position = new Vector3(10, 20, 30);
      const orientation = new Vector3(0, 1, 0);
      const velocity = new Vector3(1, 0, 0);

      spatial.updateListener({ position, orientation, velocity });

      expect(spatial.currentListener.position).toEqual(position);
      expect(spatial.currentListener.orientation).toEqual(orientation);
      expect(spatial.currentListener.velocity).toEqual(velocity);
    });

    it('should create panner node', () => {
      const config = {
        position: new Vector3(5, 10, 15),
        orientation: new Vector3(0, 0, -1),
        velocity: new Vector3(0, 0, 0),
        maxDistance: 150,
        refDistance: 2,
        rolloffFactor: 1.5
      };

      const panner = spatial.createPannerNode('test-audio', config);

      expect(panner).toBeDefined();
      expect(spatial.currentPanners.has('test-audio')).toBe(true);
    });

    it('should update audio position', () => {
      const config = {
        position: new Vector3(0, 0, 0),
        orientation: new Vector3(0, 0, -1),
        velocity: new Vector3(0, 0, 0)
      };

      spatial.createPannerNode('test-audio', config);
      
      const newPosition = new Vector3(10, 5, 0);
      const newVelocity = new Vector3(1, 0, 0);
      
      spatial.updateAudioPosition('test-audio', newPosition, newVelocity);
      
      const panner = spatial.currentPanners.get('test-audio');
      expect(panner).toBeDefined();
    });

    it('should create spatial zone', () => {
      const zoneConfig = {
        name: 'Test Zone',
        position: new Vector3(0, 0, 0),
        radius: 50,
        falloff: 2,
        effects: ['reverb', 'delay'],
        enabled: true
      };

      const zone = spatial.createZone(zoneConfig);

      expect(zone.id).toBeDefined();
      expect(zone.name).toBe('Test Zone');
      expect(zone.position).toEqual(new Vector3(0, 0, 0));
      expect(zone.radius).toBe(50);
      expect(zone.effects).toEqual(['reverb', 'delay']);
      expect(zone.enabled).toBe(true);
    });

    it('should check if point is in zone', () => {
      const zoneConfig = {
        name: 'Test Zone',
        position: new Vector3(0, 0, 0),
        radius: 10,
        falloff: 2,
        effects: ['reverb'],
        enabled: true
      };

      const zone = spatial.createZone(zoneConfig);
      const pointInside = new Vector3(5, 0, 0);
      const pointOutside = new Vector3(15, 0, 0);

      expect(spatial.isPointInZone(pointInside, zone.id)).toBe(true);
      expect(spatial.isPointInZone(pointOutside, zone.id)).toBe(false);
    });

    it('should calculate zone influence', () => {
      const zoneConfig = {
        name: 'Test Zone',
        position: new Vector3(0, 0, 0),
        radius: 10,
        falloff: 2,
        effects: ['reverb'],
        enabled: true
      };

      const zone = spatial.createZone(zoneConfig);
      const pointCenter = new Vector3(0, 0, 0);
      const pointEdge = new Vector3(10, 0, 0);
      const pointOutside = new Vector3(15, 0, 0);

      expect(spatial.getZoneInfluence(pointCenter, zone.id)).toBe(1);
      expect(spatial.getZoneInfluence(pointEdge, zone.id)).toBe(0);
      expect(spatial.getZoneInfluence(pointOutside, zone.id)).toBe(0);
    });

    it('should create spatial reverb', () => {
      const reverbConfig = {
        name: 'Test Reverb',
        position: new Vector3(0, 0, 0),
        dimensions: new Vector3(10, 10, 10),
        roomSize: 0.8,
        dampening: 0.3,
        enabled: true
      };

      const reverb = spatial.createSpatialReverb(reverbConfig);

      expect(reverb.id).toBeDefined();
      expect(reverb.name).toBe('Test Reverb');
      expect(reverb.position).toEqual(new Vector3(0, 0, 0));
      expect(reverb.roomSize).toBe(0.8);
      expect(reverb.enabled).toBe(true);
    });

    it('should calculate spatial reverb', () => {
      const reverbConfig = {
        name: 'Test Reverb',
        position: new Vector3(0, 0, 0),
        dimensions: new Vector3(10, 10, 10),
        roomSize: 0.8,
        dampening: 0.3,
        enabled: true
      };

      spatial.createSpatialReverb(reverbConfig);
      
      const pointInside = new Vector3(5, 5, 5);
      const pointOutside = new Vector3(20, 20, 20);

      const reverbInside = spatial.calculateSpatialReverb(pointInside);
      const reverbOutside = spatial.calculateSpatialReverb(pointOutside);

      expect(reverbInside.roomSize).toBeGreaterThan(0);
      expect(reverbOutside.roomSize).toBe(0.1); // Default value
    });

    it('should calculate distance attenuation', () => {
      const sourcePos = new Vector3(0, 0, 0);
      const listenerPos = new Vector3(10, 0, 0);
      const maxDistance = 20;

      const attenuation = spatial.calculateDistanceAttenuation(sourcePos, listenerPos, maxDistance);

      expect(attenuation).toBeGreaterThan(0);
      expect(attenuation).toBeLessThanOrEqual(1);
    });

    it('should calculate cone attenuation', () => {
      const sourcePos = new Vector3(0, 0, 0);
      const sourceOrientation = new Vector3(0, 0, -1);
      const listenerPos = new Vector3(0, 0, -5);
      const coneInnerAngle = 90;
      const coneOuterAngle = 180;

      const attenuation = spatial.calculateConeAttenuation(
        sourcePos,
        sourceOrientation,
        listenerPos,
        coneInnerAngle,
        coneOuterAngle
      );

      expect(attenuation).toBeGreaterThanOrEqual(0);
      expect(attenuation).toBeLessThanOrEqual(1);
    });

    it('should calculate Doppler effect', () => {
      const sourcePos = new Vector3(0, 0, 0);
      const sourceVelocity = new Vector3(10, 0, 0);
      const listenerPos = new Vector3(10, 0, 0);
      const listenerVelocity = new Vector3(0, 0, 0);

      const doppler = spatial.calculateDopplerEffect(
        sourcePos,
        sourceVelocity,
        listenerPos,
        listenerVelocity
      );

      expect(doppler).toBeGreaterThan(0);
    });

    it('should apply zone effects', () => {
      const zoneConfig = {
        name: 'Test Zone',
        position: new Vector3(0, 0, 0),
        radius: 10,
        falloff: 2,
        effects: ['reverb', 'delay'],
        enabled: true
      };

      spatial.createZone(zoneConfig);
      
      const pointInside = new Vector3(5, 0, 0);
      const pointOutside = new Vector3(15, 0, 0);

      const effectsInside = spatial.applyZoneEffects('test-audio', pointInside);
      const effectsOutside = spatial.applyZoneEffects('test-audio', pointOutside);

      expect(effectsInside).toContain('reverb');
      expect(effectsInside).toContain('delay');
      expect(effectsOutside).toEqual([]);
    });
  });

  describe('SpatialAudioUtils', () => {
    it('should calculate distance between points', () => {
      const point1 = new Vector3(0, 0, 0);
      const point2 = new Vector3(3, 4, 0);

      const distance = SpatialAudioUtils.calculateDistance(point1, point2);

      expect(distance).toBe(5);
    });

    it('should calculate direction between points', () => {
      const from = new Vector3(0, 0, 0);
      const to = new Vector3(1, 0, 0);

      const direction = SpatialAudioUtils.calculateDirection(from, to);

      expect(direction.x).toBe(1);
      expect(direction.y).toBe(0);
      expect(direction.z).toBe(0);
    });

    it('should interpolate between positions', () => {
      const start = new Vector3(0, 0, 0);
      const end = new Vector3(10, 0, 0);
      const factor = 0.5;

      const interpolated = SpatialAudioUtils.interpolatePosition(start, end, factor);

      expect(interpolated.x).toBe(5);
      expect(interpolated.y).toBe(0);
      expect(interpolated.z).toBe(0);
    });

    it('should calculate velocity', () => {
      const previousPos = new Vector3(0, 0, 0);
      const currentPos = new Vector3(10, 0, 0);
      const deltaTime = 1;

      const velocity = SpatialAudioUtils.calculateVelocity(previousPos, currentPos, deltaTime);

      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(0);
      expect(velocity.z).toBe(0);
    });

    it('should smooth position', () => {
      const current = new Vector3(0, 0, 0);
      const target = new Vector3(10, 0, 0);
      const smoothingFactor = 0.5;

      const smoothed = SpatialAudioUtils.smoothPosition(current, target, smoothingFactor);

      expect(smoothed.x).toBe(5);
      expect(smoothed.y).toBe(0);
      expect(smoothed.z).toBe(0);
    });

    it('should calculate volume by distance', () => {
      const distance = 5;
      const maxDistance = 10;
      const minVolume = 0;
      const maxVolume = 1;

      const volume = SpatialAudioUtils.calculateVolumeByDistance(
        distance,
        maxDistance,
        minVolume,
        maxVolume
      );

      expect(volume).toBe(0.5);
    });

    it('should apply frequency response', () => {
      const frequency = 1000;
      const distance = 10;
      const airAbsorption = 0.1;

      const adjustedFrequency = SpatialAudioUtils.applyFrequencyResponse(
        frequency,
        distance,
        airAbsorption
      );

      expect(adjustedFrequency).toBeLessThan(frequency);
    });
  });

  describe('AudioUtils', () => {
    it('should convert db to gain', () => {
      const db = -6;
      const gain = AudioUtils.dbToGain(db);

      expect(gain).toBeCloseTo(0.5, 2);
    });

    it('should convert gain to db', () => {
      const gain = 0.5;
      const db = AudioUtils.gainToDb(gain);

      expect(db).toBeCloseTo(-6, 1);
    });

    it('should normalize values', () => {
      expect(AudioUtils.normalize(1.5)).toBe(1);
      expect(AudioUtils.normalize(-1.5)).toBe(-1);
      expect(AudioUtils.normalize(0.5)).toBe(0.5);
    });

    it('should apply frequency curve', () => {
      const frequency = 1000;
      const curve = [0.5, 0.7, 0.9, 1.0, 0.8, 0.6, 0.4];

      const result = AudioUtils.applyFrequencyCurve(frequency, curve);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should calculate RMS', () => {
      const buffer = new Float32Array([1, -1, 1, -1, 1]);
      const rms = AudioUtils.calculateRMS(buffer);

      expect(rms).toBe(1);
    });

    it('should generate white noise', () => {
      const length = 1000;
      const noise = AudioUtils.generateWhiteNoise(length);

      expect(noise.length).toBe(length);
      expect(noise.every(sample => sample >= -0.5 && sample <= 0.5)).toBe(true);
    });

    it('should generate pink noise', () => {
      const length = 1000;
      const noise = AudioUtils.generatePinkNoise(length);

      expect(noise.length).toBe(length);
    });

    it('should apply low pass filter', () => {
      const input = new Float32Array([1, 0, 1, 0, 1, 0, 1, 0]);
      const cutoffFrequency = 1000;
      const sampleRate = 44100;

      const output = AudioUtils.applyLowPassFilter(input, cutoffFrequency, sampleRate);

      expect(output.length).toBe(input.length);
      expect(output.every(sample => !isNaN(sample))).toBe(true);
    });

    it('should apply high pass filter', () => {
      const input = new Float32Array([1, 0, 1, 0, 1, 0, 1, 0]);
      const cutoffFrequency = 1000;
      const sampleRate = 44100;

      const output = AudioUtils.applyHighPassFilter(input, cutoffFrequency, sampleRate);

      expect(output.length).toBe(input.length);
      expect(output.every(sample => !isNaN(sample))).toBe(true);
    });

    it('should apply compression', () => {
      const input = 0.8;
      const threshold = 0.5;
      const ratio = 4;
      const attack = 0.01;
      const release = 0.1;

      const compressed = AudioUtils.applyCompression(input, threshold, ratio, attack, release);

      expect(compressed).toBeLessThan(input);
      expect(compressed).toBeGreaterThan(threshold);
    });
  });
}); 