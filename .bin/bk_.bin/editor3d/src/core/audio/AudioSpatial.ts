/**
 * AudioSpatial - Sistema de Audio Espacial 3D
 * 
 * Sistema avanzado de audio espacial para el editor 3D del metaverso.
 */

import { Vector3 } from '../scene/math/Vector3';
import { AudioContext, PannerNode, AudioListener } from 'web-audio-api';

export interface SpatialAudioConfig {
  position: Vector3;
  orientation: Vector3;
  velocity: Vector3;
  maxDistance: number;
  refDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
  panningModel: PanningModelType;
  distanceModel: DistanceModelType;
}

export interface SpatialListener {
  position: Vector3;
  orientation: Vector3;
  velocity: Vector3;
  up: Vector3;
}

export interface SpatialZone {
  id: string;
  name: string;
  position: Vector3;
  radius: number;
  falloff: number;
  effects: string[];
  enabled: boolean;
}

export interface SpatialReverb {
  id: string;
  name: string;
  position: Vector3;
  dimensions: Vector3;
  roomSize: number;
  dampening: number;
  enabled: boolean;
}

/**
 * Gestor de Audio Espacial
 */
export class AudioSpatial {
  private audioContext: AudioContext;
  private listener: SpatialListener;
  private zones: Map<string, SpatialZone> = new Map();
  private reverbs: Map<string, SpatialReverb> = new Map();
  private pannerNodes: Map<string, PannerNode> = new Map();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.listener = {
      position: new Vector3(0, 0, 0),
      orientation: new Vector3(0, 0, -1),
      velocity: new Vector3(0, 0, 0),
      up: new Vector3(0, 1, 0)
    };

    this.initializeListener();
  }

  /**
   * Inicializa el listener de audio
   */
  private initializeListener(): void {
    this.audioContext.listener.setPosition(
      this.listener.position.x,
      this.listener.position.y,
      this.listener.position.z
    );

    this.audioContext.listener.setOrientation(
      this.listener.orientation.x,
      this.listener.orientation.y,
      this.listener.orientation.z,
      this.listener.up.x,
      this.listener.up.y,
      this.listener.up.z
    );

    this.audioContext.listener.setVelocity(
      this.listener.velocity.x,
      this.listener.velocity.y,
      this.listener.velocity.z
    );
  }

  /**
   * Actualiza la posición del listener
   */
  updateListener(listener: Partial<SpatialListener>): void {
    Object.assign(this.listener, listener);

    this.audioContext.listener.setPosition(
      this.listener.position.x,
      this.listener.position.y,
      this.listener.position.z
    );

    this.audioContext.listener.setOrientation(
      this.listener.orientation.x,
      this.listener.orientation.y,
      this.listener.orientation.z,
      this.listener.up.x,
      this.listener.up.y,
      this.listener.up.z
    );

    this.audioContext.listener.setVelocity(
      this.listener.velocity.x,
      this.listener.velocity.y,
      this.listener.velocity.z
    );
  }

  /**
   * Crea un nodo panner para audio espacial
   */
  createPannerNode(audioId: string, config: Partial<SpatialAudioConfig> = {}): PannerNode {
    const panner = this.audioContext.createPanner();
    
    // Configuración por defecto
    const defaultConfig: SpatialAudioConfig = {
      position: new Vector3(0, 0, 0),
      orientation: new Vector3(0, 0, -1),
      velocity: new Vector3(0, 0, 0),
      maxDistance: 100,
      refDistance: 1,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0,
      panningModel: 'HRTF',
      distanceModel: 'inverse'
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Configurar panner
    panner.panningModel = finalConfig.panningModel;
    panner.distanceModel = finalConfig.distanceModel;
    panner.maxDistance = finalConfig.maxDistance;
    panner.refDistance = finalConfig.refDistance;
    panner.rolloffFactor = finalConfig.rolloffFactor;
    panner.coneInnerAngle = finalConfig.coneInnerAngle;
    panner.coneOuterAngle = finalConfig.coneOuterAngle;
    panner.coneOuterGain = finalConfig.coneOuterGain;

    // Establecer posición inicial
    panner.setPosition(
      finalConfig.position.x,
      finalConfig.position.y,
      finalConfig.position.z
    );

    panner.setOrientation(
      finalConfig.orientation.x,
      finalConfig.orientation.y,
      finalConfig.orientation.z
    );

    panner.setVelocity(
      finalConfig.velocity.x,
      finalConfig.velocity.y,
      finalConfig.velocity.z
    );

    this.pannerNodes.set(audioId, panner);
    return panner;
  }

  /**
   * Actualiza la posición de un audio espacial
   */
  updateAudioPosition(audioId: string, position: Vector3, velocity: Vector3 = new Vector3()): void {
    const panner = this.pannerNodes.get(audioId);
    if (!panner) return;

    panner.setPosition(position.x, position.y, position.z);
    panner.setVelocity(velocity.x, velocity.y, velocity.z);
  }

  /**
   * Actualiza la orientación de un audio espacial
   */
  updateAudioOrientation(audioId: string, orientation: Vector3): void {
    const panner = this.pannerNodes.get(audioId);
    if (!panner) return;

    panner.setOrientation(orientation.x, orientation.y, orientation.z);
  }

  /**
   * Crea una zona de audio espacial
   */
  createZone(config: Omit<SpatialZone, 'id'>): SpatialZone {
    const zone: SpatialZone = {
      id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...config
    };

    this.zones.set(zone.id, zone);
    return zone;
  }

  /**
   * Verifica si un punto está dentro de una zona
   */
  isPointInZone(point: Vector3, zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone || !zone.enabled) return false;

    const distance = point.distanceTo(zone.position);
    return distance <= zone.radius;
  }

  /**
   * Obtiene el factor de influencia de una zona en un punto
   */
  getZoneInfluence(point: Vector3, zoneId: string): number {
    const zone = this.zones.get(zoneId);
    if (!zone || !zone.enabled) return 0;

    const distance = point.distanceTo(zone.position);
    if (distance > zone.radius) return 0;

    // Calcular factor de influencia basado en la distancia y falloff
    const normalizedDistance = distance / zone.radius;
    return Math.pow(1 - normalizedDistance, zone.falloff);
  }

  /**
   * Crea una reverb espacial
   */
  createSpatialReverb(config: Omit<SpatialReverb, 'id'>): SpatialReverb {
    const reverb: SpatialReverb = {
      id: `reverb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...config
    };

    this.reverbs.set(reverb.id, reverb);
    return reverb;
  }

  /**
   * Calcula la reverb para un punto específico
   */
  calculateSpatialReverb(point: Vector3): { roomSize: number; dampening: number } {
    let totalRoomSize = 0;
    let totalDampening = 0;
    let totalInfluence = 0;

    this.reverbs.forEach(reverb => {
      if (!reverb.enabled) return;

      const distance = point.distanceTo(reverb.position);
      const maxDistance = Math.max(reverb.dimensions.x, reverb.dimensions.y, reverb.dimensions.z);

      if (distance <= maxDistance) {
        const influence = 1 - (distance / maxDistance);
        totalRoomSize += reverb.roomSize * influence;
        totalDampening += reverb.dampening * influence;
        totalInfluence += influence;
      }
    });

    if (totalInfluence === 0) {
      return { roomSize: 0.1, dampening: 0.5 };
    }

    return {
      roomSize: totalRoomSize / totalInfluence,
      dampening: totalDampening / totalInfluence
    };
  }

  /**
   * Calcula la atenuación por distancia
   */
  calculateDistanceAttenuation(sourcePosition: Vector3, listenerPosition: Vector3, maxDistance: number): number {
    const distance = sourcePosition.distanceTo(listenerPosition);
    
    if (distance >= maxDistance) return 0;
    if (distance <= 1) return 1;

    // Modelo de atenuación inversa
    return 1 / distance;
  }

  /**
   * Calcula la atenuación por cono de sonido
   */
  calculateConeAttenuation(
    sourcePosition: Vector3,
    sourceOrientation: Vector3,
    listenerPosition: Vector3,
    coneInnerAngle: number,
    coneOuterAngle: number
  ): number {
    const direction = listenerPosition.clone().sub(sourcePosition).normalize();
    const angle = Math.acos(direction.dot(sourceOrientation)) * (180 / Math.PI);

    if (angle <= coneInnerAngle / 2) {
      return 1;
    } else if (angle >= coneOuterAngle / 2) {
      return 0;
    } else {
      const normalizedAngle = (angle - coneInnerAngle / 2) / (coneOuterAngle / 2 - coneInnerAngle / 2);
      return 1 - normalizedAngle;
    }
  }

  /**
   * Calcula el efecto Doppler
   */
  calculateDopplerEffect(
    sourcePosition: Vector3,
    sourceVelocity: Vector3,
    listenerPosition: Vector3,
    listenerVelocity: Vector3,
    speedOfSound: number = 343
  ): number {
    const direction = listenerPosition.clone().sub(sourcePosition).normalize();
    const relativeVelocity = listenerVelocity.clone().sub(sourceVelocity);
    const relativeSpeed = relativeVelocity.dot(direction);

    return speedOfSound / (speedOfSound + relativeSpeed);
  }

  /**
   * Aplica efectos de zona a un audio
   */
  applyZoneEffects(audioId: string, point: Vector3): string[] {
    const appliedEffects: string[] = [];

    this.zones.forEach(zone => {
      if (this.isPointInZone(point, zone.id)) {
        const influence = this.getZoneInfluence(point, zone.id);
        if (influence > 0.1) { // Umbral mínimo de influencia
          appliedEffects.push(...zone.effects);
        }
      }
    });

    return appliedEffects;
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this.pannerNodes.forEach(panner => {
      panner.disconnect();
    });
    this.pannerNodes.clear();
    this.zones.clear();
    this.reverbs.clear();
  }

  // Getters
  get currentListener(): SpatialListener { return this.listener; }
  get currentZones(): Map<string, SpatialZone> { return this.zones; }
  get currentReverbs(): Map<string, SpatialReverb> { return this.reverbs; }
  get currentPanners(): Map<string, PannerNode> { return this.pannerNodes; }
}

/**
 * Utilidades para audio espacial
 */
export class SpatialAudioUtils {
  /**
   * Convierte coordenadas de pantalla a coordenadas 3D
   */
  static screenToWorld(
    screenX: number,
    screenY: number,
    camera: any,
    canvas: HTMLCanvasElement
  ): Vector3 {
    // Implementación básica - puede ser extendida
    const x = (screenX / canvas.width) * 2 - 1;
    const y = -(screenY / canvas.height) * 2 + 1;
    
    return new Vector3(x * 10, y * 10, 0);
  }

  /**
   * Calcula la distancia entre dos puntos 3D
   */
  static calculateDistance(point1: Vector3, point2: Vector3): number {
    return point1.distanceTo(point2);
  }

  /**
   * Calcula la dirección entre dos puntos
   */
  static calculateDirection(from: Vector3, to: Vector3): Vector3 {
    return to.clone().sub(from).normalize();
  }

  /**
   * Interpola entre dos posiciones
   */
  static interpolatePosition(
    start: Vector3,
    end: Vector3,
    factor: number
  ): Vector3 {
    return start.clone().lerp(end, factor);
  }

  /**
   * Calcula la velocidad basada en posiciones y tiempo
   */
  static calculateVelocity(
    previousPosition: Vector3,
    currentPosition: Vector3,
    deltaTime: number
  ): Vector3 {
    return currentPosition.clone()
      .sub(previousPosition)
      .divideScalar(deltaTime);
  }

  /**
   * Aplica suavizado a una posición
   */
  static smoothPosition(
    current: Vector3,
    target: Vector3,
    smoothingFactor: number
  ): Vector3 {
    return current.clone().lerp(target, smoothingFactor);
  }

  /**
   * Calcula el volumen basado en la distancia
   */
  static calculateVolumeByDistance(
    distance: number,
    maxDistance: number,
    minVolume: number = 0,
    maxVolume: number = 1
  ): number {
    if (distance >= maxDistance) return minVolume;
    if (distance <= 0) return maxVolume;

    const normalizedDistance = distance / maxDistance;
    const volume = 1 - normalizedDistance;
    
    return minVolume + (maxVolume - minVolume) * volume;
  }

  /**
   * Aplica curva de respuesta de frecuencia
   */
  static applyFrequencyResponse(
    frequency: number,
    distance: number,
    airAbsorption: number = 0.1
  ): number {
    // Simulación básica de absorción del aire
    const absorption = Math.exp(-airAbsorption * distance);
    return frequency * absorption;
  }
} 