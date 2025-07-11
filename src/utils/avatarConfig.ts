import * as THREE from 'three';

// Configuración completa del avatar lucIA
export const luciaConfig = {
  // Características físicas (35 años, morena española, alta y delgada)
  physical: {
    age: 35,
    ethnicity: 'spanish',
    height: 'tall',
    build: 'slim',
    skinTone: new THREE.Color(0xf5d0c5), // Piel clara española
    hairColor: new THREE.Color(0x2c1810), // Moreno oscuro
    eyeColor: new THREE.Color(0x4a4a4a), // Marrón oscuro
    lipColor: new THREE.Color(0xd4a5a5) // Labios naturales
  },

  // Geometría del avatar
  geometry: {
    head: {
      radius: 0.8,
      segments: 32,
      position: [0, 1.7, 0]
    },
    hair: {
      length: 1.2,
      volume: 0.9,
      style: 'long_straight'
    },
    eyes: {
      size: 0.15,
      spacing: 0.4,
      depth: 0.1
    },
    mouth: {
      width: 0.3,
      height: 0.1,
      depth: 0.05
    },
    nose: {
      width: 0.1,
      height: 0.3,
      depth: 0.1
    }
  },

  // Materiales
  materials: {
    skin: {
      color: new THREE.Color(0xf5d0c5),
      roughness: 0.8,
      metalness: 0.1,
      normalScale: new THREE.Vector2(0.5, 0.5)
    },
    hair: {
      color: new THREE.Color(0x2c1810),
      roughness: 0.9,
      metalness: 0.0
    },
    eyes: {
      color: new THREE.Color(0x4a4a4a),
      roughness: 0.2,
      metalness: 0.8
    },
    lips: {
      color: new THREE.Color(0xd4a5a5),
      roughness: 0.7,
      metalness: 0.1
    }
  },

  // Animaciones
  animations: {
    breathing: {
      frequency: 0.5, // Hz
      amplitude: 0.02
    },
    blinking: {
      frequency: 3, // segundos entre parpadeos
      duration: 0.15 // segundos de parpadeo
    },
    speaking: {
      frequency: 8, // Hz para movimiento de boca
      amplitude: 0.1
    }
  },

  // Configuración de voz
  voice: {
    pitch: 220, // Hz - voz femenina
    rate: 0.9, // Velocidad ligeramente más lenta para acento español
    volume: -10, // dB - volumen suave
    vibrato: 0.1, // Ligero vibrato para naturalidad
    attack: 0.1, // Ataque suave
    decay: 0.3, // Decay natural
    sustain: 0.7, // Sustain para mantener la voz
    release: 0.5 // Release suave
  },

  // Expresiones emocionales
  emotions: {
    neutral: {
      eyebrowHeight: 0,
      mouthCurve: 0,
      eyeOpenness: 1
    },
    happy: {
      eyebrowHeight: 0.1,
      mouthCurve: 0.3,
      eyeOpenness: 0.8
    },
    concentrated: {
      eyebrowHeight: -0.1,
      mouthCurve: -0.1,
      eyeOpenness: 0.9
    },
    curious: {
      eyebrowHeight: 0.2,
      mouthCurve: 0.1,
      eyeOpenness: 1.1
    }
  },

  // Gestos y movimientos
  gestures: {
    headNod: {
      frequency: 0.5,
      amplitude: 0.1
    },
    headTilt: {
      frequency: 0.3,
      amplitude: 0.05
    },
    bodySway: {
      frequency: 0.2,
      amplitude: 0.02
    }
  },

  // Configuración de iluminación específica para lucIA
  lighting: {
    keyLight: {
      position: [5, 5, 5],
      intensity: 0.8,
      color: new THREE.Color(0xffffff)
    },
    fillLight: {
      position: [-3, 3, 3],
      intensity: 0.4,
      color: new THREE.Color(0xffffff)
    },
    rimLight: {
      position: [0, 2, -5],
      intensity: 0.3,
      color: new THREE.Color(0x00d4ff)
    }
  },

  // Configuración de cámara
  camera: {
    position: [0, 1.8, 3],
    target: [0, 1.7, 0],
    fov: 60,
    near: 0.1,
    far: 1000
  },

  // Configuración de interacción
  interaction: {
    gazeTracking: true,
    lipSync: true,
    emotionResponse: true,
    gestureResponse: true
  }
};

// Funciones de utilidad para el avatar
export const avatarUtils = {
  // Calcular posición de la cabeza basada en respiración
  getHeadPosition: (time: number): [number, number, number] => {
    const breathing = Math.sin(time * luciaConfig.animations.breathing.frequency) * 
                     luciaConfig.animations.breathing.amplitude;
    return [
      luciaConfig.geometry.head.position[0],
      luciaConfig.geometry.head.position[1] + breathing,
      luciaConfig.geometry.head.position[2]
    ];
  },

  // Calcular apertura de boca para sincronización labial
  getMouthOpenness: (time: number, isSpeaking: boolean): number => {
    if (!isSpeaking) return 0;
    return Math.max(0, Math.sin(time * luciaConfig.animations.speaking.frequency) * 
                   luciaConfig.animations.speaking.amplitude);
  },

  // Calcular estado de parpadeo
  getBlinkState: (time: number): boolean => {
    const blinkCycle = Math.sin(time * (2 * Math.PI / luciaConfig.animations.blinking.frequency));
    return blinkCycle > 0.8;
  },

  // Obtener configuración de emoción
  getEmotionConfig: (emotion: keyof typeof luciaConfig.emotions) => {
    return luciaConfig.emotions[emotion];
  },

  // Crear material de piel
  createSkinMaterial: () => {
    return new THREE.MeshStandardMaterial({
      color: luciaConfig.materials.skin.color,
      roughness: luciaConfig.materials.skin.roughness,
      metalness: luciaConfig.materials.skin.metalness,
      normalScale: luciaConfig.materials.skin.normalScale
    });
  },

  // Crear material de cabello
  createHairMaterial: () => {
    return new THREE.MeshStandardMaterial({
      color: luciaConfig.materials.hair.color,
      roughness: luciaConfig.materials.hair.roughness,
      metalness: luciaConfig.materials.hair.metalness
    });
  },

  // Crear material de ojos
  createEyeMaterial: () => {
    return new THREE.MeshStandardMaterial({
      color: luciaConfig.materials.eyes.color,
      roughness: luciaConfig.materials.eyes.roughness,
      metalness: luciaConfig.materials.eyes.metalness
    });
  },

  // Crear material de labios
  createLipMaterial: () => {
    return new THREE.MeshStandardMaterial({
      color: luciaConfig.materials.lips.color,
      roughness: luciaConfig.materials.lips.roughness,
      metalness: luciaConfig.materials.lips.metalness
    });
  }
}; 