import { create } from 'zustand'

// Tipos básicos
interface Position {
  x: number
  y: number
  z: number
}

interface Avatar {
  id: string
  name: string
  level: number
  experience: number
  health: number
  energy: number
  position: Position
  rotation: Position
  scale: Position
  model: string
  animations: string[]
  customizations: {
    skinColor: string
    hairStyle: string
    hairColor: string
    eyeColor: string
    height: number
    weight: number
    features: Record<string, any>
  }
  equipment: Record<string, any>
  inventory: any[]
  stats: {
    strength: number
    agility: number
    intelligence: number
    charisma: number
  }
}

interface World {
  id: string
  name: string
  description: string
  environment: string
  currentPlayers: number
  maxPlayers: number
  weather: {
    type: string
    temperature: number
    humidity: number
    windSpeed: number
  }
  lighting: {
    ambient: { r: number; g: number; b: number; a: number }
    directional: {
      color: { r: number; g: number; b: number; a: number }
      intensity: number
      position: Position
      castShadow: boolean
    }
    shadows: boolean
    fog: {
      color: { r: number; g: number; b: number; a: number }
      near: number
      far: number
    }
  }
  gravity: number
  objects: any[]
  spawnPoints: Position[]
  portals: any[]
  npcs: any[]
}

interface Currency {
  gold: number
  silver: number
  copper: number
  tokens: number
  crystals: number
}

interface ChatMessage {
  id: string
  text: string
  sender: {
    id: string
    username: string
    avatar: string
    level: number
  }
  timestamp: Date
  type: string
  channel: string
  mentions: string[]
  attachments: any[]
  reactions: any[]
  edited: boolean
  deleted: boolean
}

interface MetaversoStore {
  // Estado
  userAvatar: Avatar | null
  currentWorld: World | null
  wallet: {
    address: string
    balance: Currency
    transactions: any[]
    nfts: any[]
    tokens: any[]
  }
  settings: {
    graphics: string
    audio: boolean
    notifications: boolean
    privacy: string
    language: string
    theme: string
    controls: {
      mouseSensitivity: number
      invertY: boolean
      keyBindings: Record<string, string>
    }
  }
  isLoading: boolean
  error: string | null
  chat: {
    global: ChatMessage[]
    local: ChatMessage[]
    private: ChatMessage[]
  }
  inventory: any[]
  nearbyUsers: any[]
  nearbyObjects: any[]

  // Acciones
  setUserAvatar: (avatar: Avatar) => void
  setCurrentWorld: (world: World) => void
  updateAvatarPosition: (position: Position) => void
  updateAvatarHealth: (health: number) => void
  updateAvatarEnergy: (energy: number) => void
  addExperience: (amount: number) => void
  setWalletAddress: (address: string) => void
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void
  setActiveChatChannel: (channelId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const useMetaversoStore = create<MetaversoStore>((set: any, get: any) => ({
  // Estado inicial
  userAvatar: {
    id: 'user-1',
    name: 'Usuario',
    level: 1,
    experience: 0,
    health: 100,
    energy: 100,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    model: 'default-model',
    animations: [],
    customizations: {
      skinColor: '#FFB6C1',
      hairStyle: 'default',
      hairColor: '#8B4513',
      eyeColor: '#000000',
      height: 1.7,
      weight: 70,
      features: {}
    },
    equipment: {},
    inventory: [],
    stats: {
      strength: 10,
      agility: 10,
      intelligence: 10,
      charisma: 10
    }
  },
  currentWorld: {
    id: 'world-1',
    name: 'Mundo Principal',
    description: 'Un mundo mágico lleno de aventuras',
    environment: 'forest',
    currentPlayers: 1,
    maxPlayers: 100,
    weather: {
      type: 'clear',
      temperature: 20,
      humidity: 50,
      windSpeed: 5
    },
    lighting: {
      ambient: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
      directional: {
        color: { r: 1, g: 1, b: 1, a: 1 },
        intensity: 1,
        position: { x: 10, y: 10, z: 5 },
        castShadow: true
      },
      shadows: true,
      fog: {
        color: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
        near: 1,
        far: 100
      }
    },
    gravity: 9.8,
    objects: [],
    spawnPoints: [],
    portals: [],
    npcs: []
  },
  wallet: {
    address: '',
    balance: {
      gold: 100,
      silver: 50,
      copper: 25,
      tokens: 10,
      crystals: 5
    },
    transactions: [],
    nfts: [],
    tokens: []
  },
  settings: {
    graphics: 'high',
    audio: true,
    notifications: true,
    privacy: 'public',
    language: 'es',
    theme: 'dark',
    controls: {
      mouseSensitivity: 1.0,
      invertY: false,
      keyBindings: {}
    }
  },
  isLoading: false,
  error: null,
  chat: {
    global: [],
    local: [],
    private: []
  },
  inventory: [],
  nearbyUsers: [],
  nearbyObjects: [],

  // Acciones
  setUserAvatar: (avatar: Avatar) => set({ userAvatar: avatar }),
  
  setCurrentWorld: (world: World) => set({ currentWorld: world }),
  
  updateAvatarPosition: (position: Position) => {
    const currentAvatar = get().userAvatar
    if (currentAvatar) {
      set({
        userAvatar: {
          ...currentAvatar,
          position
        }
      })
    }
  },
  
  updateAvatarHealth: (health: number) => {
    const currentAvatar = get().userAvatar
    if (currentAvatar) {
      set({
        userAvatar: {
          ...currentAvatar,
          health: Math.max(0, Math.min(100, health))
        }
      })
    }
  },
  
  updateAvatarEnergy: (energy: number) => {
    const currentAvatar = get().userAvatar
    if (currentAvatar) {
      set({
        userAvatar: {
          ...currentAvatar,
          energy: Math.max(0, Math.min(100, energy))
        }
      })
    }
  },
  
  addExperience: (amount: number) => {
    const currentAvatar = get().userAvatar
    if (currentAvatar) {
      const newExperience = currentAvatar.experience + amount
      const newLevel = Math.floor(newExperience / 100) + 1
      
      set({
        userAvatar: {
          ...currentAvatar,
          experience: newExperience,
          level: newLevel
        }
      })
    }
  },
  
  setWalletAddress: (address: string) => {
    set((state: any) => ({
      wallet: {
        ...state.wallet,
        address
      }
    }))
  },
  
  addChatMessage: (message: ChatMessage) => {
    set((state: any) => ({
      chat: {
        ...state.chat,
        global: [...state.chat.global, message]
      }
    }))
  },
  
  clearChat: () => {
    set({
      chat: {
        global: [],
        local: [],
        private: []
      }
    })
  },
  
  setActiveChatChannel: (channelId: string) => {
    // Implementar lógica para cambiar canal de chat
    console.log('Cambiando a canal:', channelId)
  },
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error })
}))

export default useMetaversoStore 

