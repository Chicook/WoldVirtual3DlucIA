/**
 * @fileoverview Tipos principales del sistema de helpers del metaverso
 * @module @metaverso/helpers/types
 */

import * as THREE from 'three';
import { ColorRepresentation } from 'three';

// ============================================================================
// CONFIGURACIONES PRINCIPALES
// ============================================================================

/**
 * Configuración principal del sistema de helpers
 */
export interface HelpersConfig {
  /** Configuración de helpers de visualización */
  visualization: VisualizationConfig;
  /** Configuración de helpers de desarrollo */
  development: DevelopmentConfig;
  /** Configuración de helpers Web3 */
  web3: Web3Config;
  /** Configuración de helpers de interacción */
  interaction: InteractionConfig;
  /** Configuración de helpers de física */
  physics: PhysicsConfig;
  /** Configuración de helpers de audio */
  audio: AudioConfig;
}

/**
 * Configuración de helpers de visualización
 */
export interface VisualizationConfig {
  /** Habilitar helpers de visualización */
  enabled: boolean;
  /** Mostrar normales de vértices */
  showNormals: boolean;
  /** Mostrar cajas delimitadoras */
  showBoundingBoxes: boolean;
  /** Mostrar wireframes */
  showWireframes: boolean;
  /** Mostrar tangentes */
  showTangents: boolean;
  /** Mostrar helpers de iluminación */
  showLightHelpers: boolean;
  /** Colores personalizados */
  colors: {
    normal: ColorRepresentation;
    tangent: ColorRepresentation;
    boundingBox: ColorRepresentation;
    wireframe: ColorRepresentation;
    light: ColorRepresentation;
  };
  /** Tamaños de helpers */
  sizes: {
    normal: number;
    tangent: number;
    boundingBox: number;
  };
}

/**
 * Configuración de helpers de desarrollo
 */
export interface DevelopmentConfig {
  /** Habilitar helpers de desarrollo */
  enabled: boolean;
  /** Mostrar FPS */
  showFPS: boolean;
  /** Mostrar información de memoria */
  showMemory: boolean;
  /** Habilitar profiling */
  showProfiling: boolean;
  /** Nivel de logging */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** Mostrar panel de debug */
  showDebugPanel: boolean;
  /** Habilitar inspector de escena */
  enableSceneInspector: boolean;
  /** Configuración de profiling */
  profiling: {
    enabled: boolean;
    sampleRate: number;
    maxSamples: number;
  };
}

/**
 * Configuración de helpers Web3
 */
export interface Web3Config {
  /** Habilitar helpers Web3 */
  enabled: boolean;
  /** Red blockchain */
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum' | 'optimism';
  /** URL del RPC */
  rpcUrl: string;
  /** Gateway de IPFS */
  ipfsGateway: string;
  /** Configuración de wallet */
  wallet: {
    autoConnect: boolean;
    supportedWallets: string[];
  };
  /** Configuración de contratos */
  contracts: {
    nftContract: string;
    tokenContract: string;
    marketplaceContract: string;
  };
}

/**
 * Configuración de helpers de interacción
 */
export interface InteractionConfig {
  /** Habilitar helpers de interacción */
  enabled: boolean;
  /** Habilitar VR */
  enableVR: boolean;
  /** Habilitar touch */
  enableTouch: boolean;
  /** Habilitar raycast */
  enableRaycast: boolean;
  /** Configuración de controles de cámara */
  camera: {
    enableOrbit: boolean;
    enablePan: boolean;
    enableZoom: boolean;
    enableDolly: boolean;
  };
  /** Configuración de gestos */
  gestures: {
    enablePinch: boolean;
    enableRotate: boolean;
    enableSwipe: boolean;
  };
}

/**
 * Configuración de helpers de física
 */
export interface PhysicsConfig {
  /** Habilitar helpers de física */
  enabled: boolean;
  /** Motor de física */
  engine: 'rapier' | 'cannon' | 'ammo';
  /** Configuración de gravedad */
  gravity: THREE.Vector3;
  /** Configuración de colisiones */
  collision: {
    enabled: boolean;
    debug: boolean;
    showColliders: boolean;
  };
  /** Configuración de constraints */
  constraints: {
    enabled: boolean;
    debug: boolean;
  };
}

/**
 * Configuración de helpers de audio
 */
export interface AudioConfig {
  /** Habilitar helpers de audio */
  enabled: boolean;
  /** Configuración de audio posicional */
  positional: {
    enabled: boolean;
    maxDistance: number;
    rolloffFactor: number;
  };
  /** Configuración de visualización */
  visualization: {
    enabled: boolean;
    showWaveform: boolean;
    showSpectrum: boolean;
  };
  /** Configuración de efectos */
  effects: {
    reverb: boolean;
    echo: boolean;
    filter: boolean;
  };
}

// ============================================================================
// TIPOS DE HELPERS
// ============================================================================

/**
 * Interfaz base para todos los helpers
 */
export interface IHelper {
  /** Tipo del helper */
  readonly type: string;
  /** Si el helper está habilitado */
  enabled: boolean;
  /** Inicializar el helper */
  init(): void;
  /** Actualizar el helper */
  update(): void;
  /** Limpiar recursos */
  dispose(): void;
  /** Mostrar el helper */
  show(): void;
  /** Ocultar el helper */
  hide(): void;
}

/**
 * Helper de visualización
 */
export interface IVisualizationHelper extends IHelper {
  /** Objeto 3D asociado */
  object: THREE.Object3D;
  /** Color del helper */
  color: ColorRepresentation;
  /** Tamaño del helper */
  size: number;
  /** Material del helper */
  material: THREE.Material;
  /** Geometría del helper */
  geometry: THREE.BufferGeometry;
}

/**
 * Helper de desarrollo
 */
export interface IDevelopmentHelper extends IHelper {
  /** Métricas del helper */
  metrics: Record<string, number>;
  /** Historial de métricas */
  history: Array<Record<string, number>>;
  /** Obtener métricas actuales */
  getMetrics(): Record<string, number>;
  /** Limpiar historial */
  clearHistory(): void;
}

/**
 * Helper Web3
 */
export interface IWeb3Helper extends IHelper {
  /** Configuración de red */
  network: string;
  /** Proveedor Web3 */
  provider: any;
  /** Estado de conexión */
  connected: boolean;
  /** Conectar a la red */
  connect(): Promise<void>;
  /** Desconectar de la red */
  disconnect(): void;
}

/**
 * Helper de interacción
 */
export interface IInteractionHelper extends IHelper {
  /** Elemento DOM asociado */
  domElement: HTMLElement;
  /** Eventos registrados */
  events: Map<string, Function>;
  /** Registrar evento */
  addEventListener(event: string, callback: Function): void;
  /** Remover evento */
  removeEventListener(event: string): void;
  /** Limpiar todos los eventos */
  clearEvents(): void;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de helper
 */
export interface HelperEvent {
  /** Tipo de evento */
  type: string;
  /** Helper que disparó el evento */
  helper: IHelper;
  /** Datos del evento */
  data?: any;
  /** Timestamp del evento */
  timestamp: number;
}

/**
 * Evento de métricas
 */
export interface MetricsEvent extends HelperEvent {
  /** Métricas actuales */
  metrics: Record<string, number>;
  /** Métricas anteriores */
  previousMetrics: Record<string, number>;
  /** Diferencia de métricas */
  delta: Record<string, number>;
}

/**
 * Evento de interacción
 */
export interface InteractionEvent extends HelperEvent {
  /** Posición del mouse/touch */
  position: THREE.Vector2;
  /** Objeto intersectado */
  intersection?: THREE.Intersection;
  /** Botones presionados */
  buttons: number;
  /** Teclas presionadas */
  keys: string[];
}

// ============================================================================
// TIPOS DE MÉTRICAS
// ============================================================================

/**
 * Métricas de rendimiento
 */
export interface PerformanceMetrics {
  /** FPS actual */
  fps: number;
  /** FPS promedio */
  averageFps: number;
  /** Tiempo de frame */
  frameTime: number;
  /** Tiempo de renderizado */
  renderTime: number;
  /** Tiempo de actualización */
  updateTime: number;
  /** Número de objetos renderizados */
  renderedObjects: number;
  /** Número de triángulos */
  triangles: number;
  /** Número de draw calls */
  drawCalls: number;
}

/**
 * Métricas de memoria
 */
export interface MemoryMetrics {
  /** Memoria GPU total */
  gpuMemory: number;
  /** Memoria GPU usada */
  gpuMemoryUsed: number;
  /** Memoria CPU total */
  cpuMemory: number;
  /** Memoria CPU usada */
  cpuMemoryUsed: number;
  /** Número de texturas */
  textures: number;
  /** Número de geometrías */
  geometries: number;
  /** Número de materiales */
  materials: number;
}

/**
 * Métricas de red
 */
export interface NetworkMetrics {
  /** Latencia */
  latency: number;
  /** Ancho de banda */
  bandwidth: number;
  /** Paquetes enviados */
  packetsSent: number;
  /** Paquetes recibidos */
  packetsReceived: number;
  /** Errores de red */
  errors: number;
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN AVANZADA
// ============================================================================

/**
 * Configuración de profiling
 */
export interface ProfilingConfig {
  /** Habilitar profiling */
  enabled: boolean;
  /** Tasa de muestreo */
  sampleRate: number;
  /** Número máximo de muestras */
  maxSamples: number;
  /** Funciones a perfilar */
  functions: string[];
  /** Umbral de tiempo */
  timeThreshold: number;
}

/**
 * Configuración de cache
 */
export interface CacheConfig {
  /** Habilitar cache */
  enabled: boolean;
  /** Tamaño máximo del cache */
  maxSize: number;
  /** Tiempo de expiración */
  ttl: number;
  /** Estrategia de evicción */
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

/**
 * Configuración de seguridad
 */
export interface SecurityConfig {
  /** Habilitar validación */
  validation: boolean;
  /** Habilitar sanitización */
  sanitization: boolean;
  /** Lista blanca de orígenes */
  allowedOrigins: string[];
  /** Lista negra de orígenes */
  blockedOrigins: string[];
  /** Rate limiting */
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

// ============================================================================
// TIPOS DE UTILIDADES
// ============================================================================

/**
 * Opciones de validación
 */
export interface ValidationOptions {
  /** Validar tipos */
  validateTypes: boolean;
  /** Validar rangos */
  validateRanges: boolean;
  /** Validar formatos */
  validateFormats: boolean;
  /** Mensajes de error personalizados */
  errorMessages?: Record<string, string>;
}

/**
 * Opciones de sanitización
 */
export interface SanitizationOptions {
  /** Remover scripts */
  removeScripts: boolean;
  /** Remover eventos */
  removeEvents: boolean;
  /** Remover atributos peligrosos */
  removeDangerousAttributes: boolean;
  /** Lista blanca de atributos */
  allowedAttributes: string[];
  /** Lista blanca de elementos */
  allowedElements: string[];
}

/**
 * Opciones de renderizado
 */
export interface RenderingOptions {
  /** Antialiasing */
  antialias: boolean;
  /** Sombras */
  shadows: boolean;
  /** Post-procesamiento */
  postProcessing: boolean;
  /** LOD */
  levelOfDetail: boolean;
  /** Frustum culling */
  frustumCulling: boolean;
  /** Occlusion culling */
  occlusionCulling: boolean;
}

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

/**
 * Exportaciones del módulo
 */
export type {
  HelpersConfig,
  VisualizationConfig,
  DevelopmentConfig,
  Web3Config,
  InteractionConfig,
  PhysicsConfig,
  AudioConfig,
  IHelper,
  IVisualizationHelper,
  IDevelopmentHelper,
  IWeb3Helper,
  IInteractionHelper,
  HelperEvent,
  MetricsEvent,
  InteractionEvent,
  PerformanceMetrics,
  MemoryMetrics,
  NetworkMetrics,
  ProfilingConfig,
  CacheConfig,
  SecurityConfig,
  ValidationOptions,
  SanitizationOptions,
  RenderingOptions
}; 