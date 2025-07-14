/**
 * 🎮 ClientTypes - Tipos e Interfaces del Cliente
 * 
 * Responsabilidades:
 * - Definición de tipos TypeScript para el cliente
 * - Interfaces de configuración y estado
 * - Tipos de avatares y escenas
 * - Estructuras de datos del cliente
 */

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

export interface ClientConfig {
  renderer: RendererConfig;
  scene: SceneConfig;
  camera: CameraConfig;
  controls: ControlsConfig;
  performance: PerformanceConfig;
}

export interface RendererConfig {
  antialias: boolean;
  shadowMap: boolean;
  pixelRatio: number;
  outputEncoding: string;
  toneMapping: string;
  exposure: number;
}

export interface SceneConfig {
  background: string;
  fog: boolean;
  fogColor: string;
  fogDensity: number;
  ambientLight: boolean;
  ambientIntensity: number;
}

export interface CameraConfig {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  position: [number, number, number];
  target: [number, number, number];
}

export interface ControlsConfig {
  enableDamping: boolean;
  dampingFactor: number;
  enableZoom: boolean;
  enablePan: boolean;
  enableRotate: boolean;
  maxDistance: number;
  minDistance: number;
}

export interface PerformanceConfig {
  maxFPS: number;
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  textureQuality: 'low' | 'medium' | 'high';
  shadowQuality: 'low' | 'medium' | 'high';
}

// ============================================================================
// INTERFACES DE ESTADO
// ============================================================================

export interface AvatarState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  animation: string;
  visible: boolean;
  health: number;
  energy: number;
}

export interface SceneState {
  avatars: Map<string, AvatarState>;
  objects: Map<string, any>;
  lights: Map<string, any>;
  effects: Map<string, any>;
  environment: any;
}

export interface ClientStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  avatars: number;
  objects: number;
  lights: number;
  effects: number;
  isInitialized: boolean;
  isRunning: boolean;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type TextureQuality = 'low' | 'medium' | 'high';
export type ShadowQuality = 'low' | 'medium' | 'high';
export type AnimationState = 'idle' | 'walking' | 'running' | 'jumping' | 'flying';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

// ============================================================================
// INTERFACES DE EVENTOS
// ============================================================================

export interface ClientEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface AvatarEvent extends ClientEvent {
  type: 'avatar-added' | 'avatar-removed' | 'avatar-updated' | 'avatar-moved';
  data: {
    avatarId: string;
    avatarState?: AvatarState;
    position?: Vector3;
    rotation?: Quaternion;
  };
}

export interface SceneEvent extends ClientEvent {
  type: 'scene-loaded' | 'scene-unloaded' | 'object-added' | 'object-removed';
  data: {
    sceneId?: string;
    objectId?: string;
    object?: any;
  };
}

export interface PerformanceEvent extends ClientEvent {
  type: 'performance-warning' | 'performance-critical' | 'fps-drop';
  data: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    threshold: number;
  };
} 