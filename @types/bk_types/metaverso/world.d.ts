/**
 * @fileoverview Tipos para mundos virtuales del metaverso
 * @module @types/metaverso/world
 */

import { Vector3, Quaternion, Euler } from 'three';
import { Avatar } from './avatar';
import { SceneObject } from './scene';

// ============================================================================
// TIPOS BÁSICOS DEL MUNDO
// ============================================================================

/**
 * Identificador único de un mundo virtual
 */
export type WorldId = string;

/**
 * Coordenadas en el espacio 3D del metaverso
 */
export interface WorldCoordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotación en el espacio 3D
 */
export interface WorldRotation {
  x: number; // pitch
  y: number; // yaw
  z: number; // roll
}

/**
 * Escala de objetos en el mundo
 */
export interface WorldScale {
  x: number;
  y: number;
  z: number;
}

/**
 * Transformación completa en el mundo 3D
 */
export interface WorldTransform {
  position: WorldCoordinates;
  rotation: WorldRotation;
  scale: WorldScale;
}

// ============================================================================
// TIPOS DE MUNDOS VIRTUALES
// ============================================================================

/**
 * Categorías de mundos virtuales
 */
export enum WorldCategory {
  CITY = 'city',
  NATURE = 'nature',
  GAMING = 'gaming',
  SOCIAL = 'social',
  COMMERCIAL = 'commercial',
  EDUCATIONAL = 'educational',
  ARTISTIC = 'artistic',
  PRIVATE = 'private'
}

/**
 * Estados de un mundo virtual
 */
export enum WorldStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  FULL = 'full',
  PRIVATE = 'private',
  DELETED = 'deleted'
}

/**
 * Configuración de física del mundo
 */
export interface WorldPhysics {
  gravity: number;
  airResistance: number;
  collisionEnabled: boolean;
  waterLevel?: number;
  windForce?: Vector3;
}

/**
 * Configuración de iluminación del mundo
 */
export interface WorldLighting {
  ambientLight: {
    color: string;
    intensity: number;
  };
  directionalLight: {
    color: string;
    intensity: number;
    position: WorldCoordinates;
    castShadow: boolean;
  };
  hemisphereLight?: {
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
}

/**
 * Configuración de clima del mundo
 */
export interface WorldWeather {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy';
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: WorldCoordinates;
  precipitation: number;
  visibility: number;
}

/**
 * Configuración de audio del mundo
 */
export interface WorldAudio {
  ambientSounds: string[];
  backgroundMusic?: string;
  volume: number;
  spatialAudio: boolean;
  reverb: {
    enabled: boolean;
    decay: number;
    preDelay: number;
  };
}

/**
 * Límites y restricciones del mundo
 */
export interface WorldBoundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  spawnPoints: WorldCoordinates[];
  restrictedAreas: WorldCoordinates[][];
}

/**
 * Configuración de spawn del mundo
 */
export interface WorldSpawn {
  defaultSpawn: WorldCoordinates;
  spawnPoints: WorldCoordinates[];
  respawnTime: number;
  fallbackSpawn: WorldCoordinates;
}

/**
 * Configuración de teleportación
 */
export interface WorldTeleport {
  enabled: boolean;
  cooldown: number;
  destinations: {
    id: string;
    name: string;
    position: WorldCoordinates;
    worldId?: WorldId;
  }[];
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Mundo virtual completo del metaverso
 */
export interface World {
  // Identificación básica
  id: WorldId;
  name: string;
  description: string;
  category: WorldCategory;
  status: WorldStatus;
  
  // Configuración técnica
  physics: WorldPhysics;
  lighting: WorldLighting;
  weather: WorldWeather;
  audio: WorldAudio;
  boundaries: WorldBoundaries;
  spawn: WorldSpawn;
  teleport: WorldTeleport;
  
  // Contenido del mundo
  objects: SceneObject[];
  avatars: Avatar[];
  
  // Metadatos
  owner: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  
  // Configuración de capacidad
  maxPlayers: number;
  currentPlayers: number;
  
  // Configuración de rendimiento
  lodDistance: number;
  renderDistance: number;
  maxPolygons: number;
  
  // Configuración de red
  syncInterval: number;
  interpolationDelay: number;
  
  // Configuración de seguridad
  permissions: WorldPermissions;
  moderation: WorldModeration;
}

/**
 * Permisos del mundo
 */
export interface WorldPermissions {
  public: boolean;
  allowBuilding: boolean;
  allowScripting: boolean;
  allowTeleport: boolean;
  allowChat: boolean;
  allowVoice: boolean;
  allowTrading: boolean;
  allowedUsers?: string[];
  bannedUsers?: string[];
}

/**
 * Configuración de moderación
 */
export interface WorldModeration {
  autoModeration: boolean;
  profanityFilter: boolean;
  spamProtection: boolean;
  reportSystem: boolean;
  moderators: string[];
  bannedWords: string[];
}

// ============================================================================
// TIPOS DE EVENTOS DEL MUNDO
// ============================================================================

/**
 * Eventos que pueden ocurrir en un mundo
 */
export enum WorldEventType {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  OBJECT_ADDED = 'object_added',
  OBJECT_REMOVED = 'object_removed',
  OBJECT_MODIFIED = 'object_modified',
  WEATHER_CHANGED = 'weather_changed',
  TIME_CHANGED = 'time_changed',
  CHAT_MESSAGE = 'chat_message',
  VOICE_MESSAGE = 'voice_message',
  TRANSACTION = 'transaction',
  NFT_MINTED = 'nft_minted',
  NFT_TRANSFERRED = 'nft_transferred'
}

/**
 * Evento del mundo
 */
export interface WorldEvent {
  id: string;
  type: WorldEventType;
  worldId: WorldId;
  timestamp: number;
  data: any;
  source: string;
}

// ============================================================================
// TIPOS DE TIEMPO Y CICLOS
// ============================================================================

/**
 * Configuración de tiempo del mundo
 */
export interface WorldTime {
  currentTime: number; // Timestamp
  dayLength: number; // Segundos por día
  startTime: number; // Timestamp de inicio
  timeScale: number; // Velocidad del tiempo
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

/**
 * Ciclos del mundo
 */
export interface WorldCycles {
  dayNight: boolean;
  seasons: boolean;
  weather: boolean;
  events: boolean;
}

// ============================================================================
// TIPOS DE RENDIMIENTO
// ============================================================================

/**
 * Métricas de rendimiento del mundo
 */
export interface WorldPerformance {
  fps: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  textures: number;
  memoryUsage: number;
  networkLatency: number;
  loadTime: number;
}

/**
 * Configuración de optimización
 */
export interface WorldOptimization {
  frustumCulling: boolean;
  occlusionCulling: boolean;
  levelOfDetail: boolean;
  textureCompression: boolean;
  geometryInstancing: boolean;
  shadowMapping: boolean;
  postProcessing: boolean;
}

// ============================================================================
// TIPOS DE PERSISTENCIA
// ============================================================================

/**
 * Configuración de persistencia del mundo
 */
export interface WorldPersistence {
  autoSave: boolean;
  saveInterval: number;
  backupEnabled: boolean;
  backupInterval: number;
  versioning: boolean;
  compression: boolean;
}

/**
 * Estado guardado del mundo
 */
export interface WorldSaveState {
  worldId: WorldId;
  timestamp: number;
  version: string;
  data: {
    objects: SceneObject[];
    avatars: Avatar[];
    weather: WorldWeather;
    time: WorldTime;
    events: WorldEvent[];
  };
  checksum: string;
}

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

/**
 * Configuración de exportación del mundo
 */
export interface WorldExport {
  format: 'gltf' | 'fbx' | 'obj' | 'json';
  includeAssets: boolean;
  includeScripts: boolean;
  includeMetadata: boolean;
  compression: boolean;
  optimization: boolean;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

/**
 * Validación de configuración del mundo
 */
export interface WorldValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades para trabajar con mundos
 */
export interface WorldUtils {
  /**
   * Calcula la distancia entre dos puntos en el mundo
   */
  calculateDistance(point1: WorldCoordinates, point2: WorldCoordinates): number;
  
  /**
   * Verifica si un punto está dentro de los límites del mundo
   */
  isWithinBoundaries(point: WorldCoordinates, boundaries: WorldBoundaries): boolean;
  
  /**
   * Encuentra el spawn point más cercano
   */
  findNearestSpawnPoint(position: WorldCoordinates, spawnPoints: WorldCoordinates[]): WorldCoordinates;
  
  /**
   * Convierte coordenadas del mundo a coordenadas de pantalla
   */
  worldToScreen(worldPos: WorldCoordinates, camera: any): { x: number; y: number };
  
  /**
   * Convierte coordenadas de pantalla a coordenadas del mundo
   */
  screenToWorld(screenPos: { x: number; y: number }, camera: any): WorldCoordinates;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  WorldId,
  WorldCoordinates,
  WorldRotation,
  WorldScale,
  WorldTransform,
  WorldPhysics,
  WorldLighting,
  WorldWeather,
  WorldAudio,
  WorldBoundaries,
  WorldSpawn,
  WorldTeleport,
  World,
  WorldPermissions,
  WorldModeration,
  WorldEvent,
  WorldTime,
  WorldCycles,
  WorldPerformance,
  WorldOptimization,
  WorldPersistence,
  WorldSaveState,
  WorldExport,
  WorldValidation,
  WorldUtils
};

export { WorldCategory, WorldStatus, WorldEventType }; 