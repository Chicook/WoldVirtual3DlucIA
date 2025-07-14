// Configuración simplificada de Ready Player Me SDK
export const READY_PLAYER_ME_CONFIG = {
  // Subdomain de tu aplicación Ready Player Me
  subdomain: process.env.VITE_RPM_SUBDOMAIN || 'metaverso',
  
  // Configuración del SDK
  sdk: {
    // URL base de la API (simulada)
    baseUrl: 'https://api.readyplayer.me',
    
    // Configuración del iframe
    iframe: {
      width: '100%',
      height: '600px',
      border: 'none',
      allow: 'camera; microphone; geolocation'
    },
    
    // Configuración del avatar
    avatar: {
      // Tamaños de avatar disponibles
      sizes: {
        thumbnail: '256x256',
        preview: '512x512',
        full: '1024x1024'
      },
      
      // Formatos soportados
      formats: ['glb', 'gltf', 'vrm'],
      
      // Configuración por defecto
      default: {
        style: 'realistic',
        gender: 'neutral',
        height: 'average',
        build: 'average'
      }
    },
    
    // Configuración de personalización
    customization: {
      // Categorías disponibles
      categories: [
        'body',
        'face',
        'hair',
        'outfit',
        'accessories',
        'animations'
      ],
      
      // Estilos disponibles
      styles: [
        'realistic',
        'cartoon',
        'anime',
        'cyberpunk',
        'fantasy'
      ]
    }
  },
  
  // Configuración de integración con Three.js
  threejs: {
    // Configuración del loader
    loader: {
      draco: true,
      ktx2: true,
      meshopt: true
    },
    
    // Configuración de materiales
    materials: {
      // Usar PBR materials
      pbr: true,
      
      // Configuración de sombras
      shadows: true,
      
      // Configuración de iluminación
      lighting: {
        ambient: true,
        directional: true,
        point: false
      }
    },
    
    // Configuración de animaciones
    animations: {
      // Animaciones por defecto
      default: ['idle', 'walk', 'run', 'jump'],
      
      // Configuración de mezcla
      blending: {
        duration: 0.3,
        mode: 'normal'
      }
    }
  },
  
  // Configuración de caché
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 3600000 // 1 hora
  },
  
  // Configuración de eventos
  events: {
    // Eventos disponibles
    available: [
      'avatar-created',
      'avatar-updated',
      'avatar-deleted',
      'customization-started',
      'customization-completed',
      'avatar-loaded',
      'avatar-error'
    ]
  }
}

// Tipos de configuración
export interface ReadyPlayerMeConfig {
  subdomain: string
  sdk: {
    baseUrl: string
    iframe: {
      width: string
      height: string
      border: string
      allow: string
    }
    avatar: {
      sizes: Record<string, string>
      formats: string[]
      default: {
        style: string
        gender: string
        height: string
        build: string
      }
    }
    customization: {
      categories: string[]
      styles: string[]
    }
  }
  threejs: {
    loader: {
      draco: boolean
      ktx2: boolean
      meshopt: boolean
    }
    materials: {
      pbr: boolean
      shadows: boolean
      lighting: {
        ambient: boolean
        directional: boolean
        point: boolean
      }
    }
    animations: {
      default: string[]
      blending: {
        duration: number
        mode: string
      }
    }
  }
  cache: {
    enabled: boolean
    maxSize: number
    ttl: number
  }
  events: {
    available: string[]
  }
}

// Configuración por defecto
export const DEFAULT_RPM_CONFIG: ReadyPlayerMeConfig = READY_PLAYER_ME_CONFIG 