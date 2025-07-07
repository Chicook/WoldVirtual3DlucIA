// ============================================================================
// 🎮 EXPORTACIONES CORE - Componentes 3D Fundamentales
// ============================================================================

// Componentes principales
export { default as Scene, SimpleScene, PhysicsScene } from './Scene';
export { default as Object3D, Cube, Sphere, Cylinder, Plane } from './Object';
export { default as Lighting, AmbientLight, DirectionalLight, PointLight, SpotLight, HemisphereLight } from './Lighting';
export { default as Camera, FirstPersonCamera, FollowCamera, CinematicCamera } from './Camera';

// Componentes especializados
export { MetallicObject, TranslucentObject, EmissiveObject } from './Object';
export { InteractiveObject, ObjectLoader } from './Object';
export { DayLighting, NightLighting, InteriorLighting, DramaticLighting } from './Lighting';
export { FlickeringLight, PulsingLight, ColorChangingLight, LightingController } from './Lighting';
export { CameraController, SmoothCamera } from './Camera';

// Tipos
export type { SceneProps, Object3DProps, LightingProps, CameraProps } from '../types';

// ============================================================================
// 🎯 CONFIGURACIONES PREDEFINIDAS
// ============================================================================

export const CORE_CONFIGS = {
  // Configuraciones de escena
  scene: {
    basic: {
      background: '#87CEEB',
      fog: { color: '#87CEEB', near: 1, far: 1000 }
    },
    night: {
      background: '#1a1a2e',
      fog: { color: '#1a1a2e', near: 1, far: 500 }
    },
    interior: {
      background: '#2c2c2c',
      fog: { color: '#2c2c2c', near: 0.1, far: 100 }
    }
  },

  // Configuraciones de cámara
  camera: {
    perspective: {
      fov: 75,
      near: 0.1,
      far: 1000
    },
    orthographic: {
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
      near: 0.1,
      far: 1000
    },
    firstPerson: {
      fov: 90,
      near: 0.1,
      far: 1000,
      sensitivity: 1
    }
  },

  // Configuraciones de iluminación
  lighting: {
    day: {
      ambient: { intensity: 0.6, color: '#87CEEB' },
      directional: { intensity: 1, color: '#FFFFFF', castShadow: true }
    },
    night: {
      ambient: { intensity: 0.1, color: '#1a1a2e' },
      point: { intensity: 0.8, color: '#4a90e2', castShadow: true }
    },
    dramatic: {
      ambient: { intensity: 0.1, color: '#000000' },
      spot: { intensity: 2, color: '#ff6b6b', castShadow: true }
    }
  }
} as const;

// ============================================================================
// 🛠️ UTILIDADES CORE
// ============================================================================

/**
 * Crear una escena básica con configuración predeterminada
 */
export const createBasicScene = (config?: Partial<typeof CORE_CONFIGS.scene.basic>) => {
  return {
    ...CORE_CONFIGS.scene.basic,
    ...config
  };
};

/**
 * Crear una cámara con configuración predeterminada
 */
export const createBasicCamera = (type: 'perspective' | 'orthographic' = 'perspective') => {
  return CORE_CONFIGS.camera[type];
};

/**
 * Crear iluminación con configuración predeterminada
 */
export const createBasicLighting = (type: 'day' | 'night' | 'dramatic' = 'day') => {
  return CORE_CONFIGS.lighting[type];
};

// ============================================================================
// 📊 ESTADÍSTICAS DE COMPONENTES CORE
// ============================================================================

export const CORE_STATS = {
  total: 4,
  scene: 1,
  object: 1,
  lighting: 1,
  camera: 1,
  specialized: 15,
  utilities: 3
} as const;

// ============================================================================
// 🎯 VERSIÓN Y METADATOS CORE
// ============================================================================

export const CORE_VERSION = '1.0.0';
export const CORE_DEPENDENCIES = {
  three: '^0.158.0',
  '@react-three/fiber': '^8.15.0',
  '@react-three/drei': '^9.88.0'
} as const; 