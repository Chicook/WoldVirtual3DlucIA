/**
 * @fileoverview Sistema de Helpers del Metaverso - Punto de entrada principal
 * @module @metaverso/helpers
 * @version 1.0.0
 * @license MIT
 */

// Exportaciones de visualización
export { LightProbeHelper } from './visualization/LightProbeHelper';
export { RectAreaLightHelper } from './visualization/RectAreaLightHelper';
export { VertexNormalsHelper } from './visualization/VertexNormalsHelper';
export { VertexTangentsHelper } from './visualization/VertexTangentsHelper';
export { TextureHelper } from './visualization/TextureHelper';
export { BoundingBoxHelper } from './visualization/BoundingBoxHelper';
export { WireframeHelper } from './visualization/WireframeHelper';

// Exportaciones de desarrollo
export { PerformanceHelper } from './development/PerformanceHelper';
export { MemoryHelper } from './development/MemoryHelper';
export { ProfilerHelper } from './development/ProfilerHelper';
export { DebugPanel } from './development/DebugPanel';
export { SceneInspector } from './development/SceneInspector';
export { OctreeHelper } from './development/OctreeHelper';
export { BVHHelper } from './development/BVHHelper';

// Exportaciones Web3
export { BlockchainHelper } from './web3/BlockchainHelper';
export { NFTVisualizer } from './web3/NFTVisualizer';
export { TransactionHelper } from './web3/TransactionHelper';
export { IPFSHelper } from './web3/IPFSHelper';
export { WalletHelper } from './web3/WalletHelper';
export { SmartContractHelper } from './web3/SmartContractHelper';

// Exportaciones de interacción
export { CameraHelper } from './interaction/CameraHelper';
export { VRHelper } from './interaction/VRHelper';
export { TouchHelper } from './interaction/TouchHelper';
export { RaycastHelper } from './interaction/RaycastHelper';
export { InputHelper } from './interaction/InputHelper';
export { GestureHelper } from './interaction/GestureHelper';

// Exportaciones de física
export { PhysicsHelper } from './physics/PhysicsHelper';
export { RapierHelper } from './physics/RapierHelper';
export { CollisionHelper } from './physics/CollisionHelper';
export { ConstraintHelper } from './physics/ConstraintHelper';

// Exportaciones de audio
export { AudioHelper } from './audio/AudioHelper';
export { PositionalAudioHelper } from './audio/PositionalAudioHelper';
export { AudioVisualizer } from './audio/AudioVisualizer';

// Exportaciones de utilidades
export { ValidationHelper } from './utils/ValidationHelper';
export { SanitizationHelper } from './utils/SanitizationHelper';
export { MathHelper } from './utils/MathHelper';
export { ColorHelper } from './utils/ColorHelper';

// Exportaciones de tipos
export type {
  HelpersConfig,
  VisualizationConfig,
  DevelopmentConfig,
  Web3Config,
  InteractionConfig,
  PhysicsConfig,
  AudioConfig
} from './types';

// Exportaciones de configuración
export { defaultConfig } from './config';

// Versión del sistema
export const VERSION = '1.0.0';

// Información del sistema
export const SYSTEM_INFO = {
  name: '@metaverso/helpers',
  version: VERSION,
  description: 'Sistema completo de helpers y utilidades para el desarrollo del metaverso 3D descentralizado',
  features: [
    'Helpers de visualización avanzados',
    'Debugging y profiling',
    'Integración Web3 y blockchain',
    'Helpers de interacción VR/AR',
    'Sistema de física y colisiones',
    'Audio 3D posicional',
    'Optimización de rendimiento',
    'Herramientas de desarrollo'
  ]
};

/**
 * Inicializa el sistema de helpers con configuración personalizada
 * @param config - Configuración del sistema
 * @returns Configuración inicializada
 */
export function initializeHelpers(config?: Partial<HelpersConfig>): HelpersConfig {
  return { ...defaultConfig, ...config };
}

/**
 * Crea una configuración por defecto del sistema de helpers
 * @returns Configuración por defecto
 */
export function createDefaultConfig(): HelpersConfig {
  return { ...defaultConfig };
}

/**
 * Verifica la compatibilidad del sistema
 * @returns Información de compatibilidad
 */
export function checkCompatibility(): {
  supported: boolean;
  features: Record<string, boolean>;
  warnings: string[];
} {
  const features: Record<string, boolean> = {
    threejs: typeof THREE !== 'undefined',
    webgl: typeof WebGLRenderingContext !== 'undefined',
    webgpu: typeof GPUAdapter !== 'undefined',
    web3: typeof window !== 'undefined' ? 'ethereum' in window : false,
    vr: typeof navigator !== 'undefined' ? 'xr' in navigator : false,
    audio: typeof AudioContext !== 'undefined'
  };

  const warnings: string[] = [];
  
  if (!features.threejs) {
    warnings.push('Three.js no está disponible - algunos helpers pueden no funcionar');
  }
  
  if (!features.webgl && !features.webgpu) {
    warnings.push('WebGL/WebGPU no está disponible - el renderizado puede no funcionar');
  }

  return {
    supported: Object.values(features).some(Boolean),
    features,
    warnings
  };
}

// Exportación por defecto
export default {
  // Visualization
  LightProbeHelper,
  RectAreaLightHelper,
  VertexNormalsHelper,
  VertexTangentsHelper,
  TextureHelper,
  BoundingBoxHelper,
  WireframeHelper,
  
  // Development
  PerformanceHelper,
  MemoryHelper,
  ProfilerHelper,
  DebugPanel,
  SceneInspector,
  OctreeHelper,
  BVHHelper,
  
  // Web3
  BlockchainHelper,
  NFTVisualizer,
  TransactionHelper,
  IPFSHelper,
  WalletHelper,
  SmartContractHelper,
  
  // Interaction
  CameraHelper,
  VRHelper,
  TouchHelper,
  RaycastHelper,
  InputHelper,
  GestureHelper,
  
  // Physics
  PhysicsHelper,
  RapierHelper,
  CollisionHelper,
  ConstraintHelper,
  
  // Audio
  AudioHelper,
  PositionalAudioHelper,
  AudioVisualizer,
  
  // Utils
  ValidationHelper,
  SanitizationHelper,
  MathHelper,
  ColorHelper,
  
  // Functions
  initializeHelpers,
  createDefaultConfig,
  checkCompatibility,
  VERSION,
  SYSTEM_INFO
}; 