import { create } from 'zustand'

import { Avatar, World, Position, Currency, Environment, ChatMessage } from '../types/metaverso'

interface MetaversoStore {
  userAvatar: any;
  currentWorld: any;
  wallet: {
    address: string;
    balance: Currency;
    transactions: any[];
    nfts: any[];
    tokens: any[];
  };
  settings: any;
  isLoading: boolean;
  error: string | null;
  setUserAvatar: (avatar: any) => void;
  setCurrentWorld: (world: any) => void;
  updateAvatarPosition: (position: Position) => void;
  updateAvatarHealth: (health: number) => void;
  updateAvatarEnergy: (energy: number) => void;
  addExperience: (amount: number) => void;
  setWalletAddress: (address: string) => void;
}

const useMetaversoStore = create<MetaversoStore>((set: any, get: any) => ({
  // Estado del usuario
  userAvatar: {
    id: 'user-1',
    name: 'Usuario',

import { MetaversoState, World, Position, Avatar, InventoryItem, ChatMessage } from '@/types/metaverso'

interface MetaversoStore extends MetaversoState {
  // Acciones
  initializeMetaverso: () => Promise<void>
  joinWorld: (worldId: string) => Promise<void>
  leaveWorld: () => void
  moveToPosition: (position: Position) => void
  updateAvatar: (avatarData: Partial<Avatar>) => void
  sendMessage: (message: string, channel: string) => void
  interactWithObject: (objectId: string, action: string) => void
  updateInventory: (inventory: InventoryItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useMetaversoStore = create<MetaversoStore>((set, get) => ({
  // Estado inicial
  isInitialized: false,
  isLoading: false,
  error: null,
  currentWorld: null,
  userAvatar: {
    id: 'default-avatar',
    name: 'Avatar Predeterminado',

import { Avatar, World, Position, Currency, Environment, ChatMessage } from '../types/metaverso'

interface MetaversoStore {
  userAvatar: any;
  currentWorld: any;
  wallet: {
    address: string;
    balance: Currency;
    transactions: any[];
    nfts: any[];
    tokens: any[];
  };
  settings: any;
  isLoading: boolean;
  error: string | null;
  setUserAvatar: (avatar: any) => void;
  setCurrentWorld: (world: any) => void;
  updateAvatarPosition: (position: Position) => void;
  updateAvatarHealth: (health: number) => void;
  updateAvatarEnergy: (energy: number) => void;
  addExperience: (amount: number) => void;
  setWalletAddress: (address: string) => void;
}

const useMetaversoStore = create<MetaversoStore>((set: any, get: any) => ({
  // Estado del usuario
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

    customization: {
      skinColor: '#ffdbac',
      hairColor: '#8b4513',
      eyeColor: '#000000',
      hairStyle: 'short',
      facialHair: 'none',
      clothing: 'casual',
      accessories: []
    },
    skills: [],
    inventory: [],
    equipment: {
      head: null,
      body: null,
      hands: null,
      feet: null,
      weapon: null,
      shield: null
    },

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

    customization: {
      skinColor: '#ffdbac',
      hairColor: '#8b4513',
      eyeColor: '#000000',
      hairStyle: 'short',
      facialHair: 'none',
      clothing: 'casual',
      accessories: []
    },
    skills: [],
    inventory: [],
    equipment: {
      head: null,
      body: null,
      hands: null,
      feet: null,
      weapon: null,
      shield: null
    },

    stats: {
      strength: 10,
      agility: 10,
      intelligence: 10,

      vitality: 10,
      luck: 10
    },
    achievements: [],
    social: {
      friends: [],
      guild: null,
      reputation: 0
    }
  },

  // Estado del mundo
  currentWorld: {
    id: 'world-1',
    name: 'Mundo Principal',
    description: 'Un mundo mágico lleno de aventuras',
    environment: 'forest' as Environment,
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
    npcs: [],
    events: []
  },

  // Estado de la wallet
  wallet: {
    address: '',
    balance: { gold: 0, silver: 0, copper: 0, tokens: 0, crystals: 0, reputation: {} },
    transactions: [],
    nfts: [],
    tokens: []
  },

  // Configuración del usuario
  settings: {
    graphics: {
      quality: 'high',
      resolution: '1920x1080',
      shadows: true,
      antialiasing: true,
      vsync: true
    },
    audio: {
      master: 100,
      music: 80,
      sfx: 90,
      voice: 85
    },
    controls: {
      mouseSensitivity: 1.0,
      invertY: false,
      keyBindings: {},
      gamepadEnabled: false,
      gamepadSensitivity: 1.0,
      autoRun: false,
      toggleCrouch: false,
      quickAccess: []
    },
    interface: {
      language: 'es',
      theme: 'dark',
      fontSize: 'medium',
      showHUD: true,
      showMinimap: true,
      showChat: true
    }
  },

  // Estado de carga y error
  isLoading: false,
  error: null,

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

      charisma: 10
    },
    skinColor: '#FFB6C1',
    clothing: {
      shirt: { color: '#FF0000' },
      pants: { color: '#000080' },
      shoes: { color: '#000000' }
    }
  },
  userPosition: { x: 0, y: 0, z: 0 },
  nearbyUsers: [],
  nearbyObjects: [],
  inventory: [],
  wallet: {
    balance: '0',
    assets: [],
    transactions: []
  },
  chat: {
    global: [],
    local: [],
    private: []
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

  // Acciones
  initializeMetaverso: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // Simular inicialización
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Crear mundo por defecto
      const defaultWorld: World = {
        id: 'default-world',
        name: 'Metaverso Principal',
        description: 'El mundo principal del metaverso',
        owner: 'system',
        maxUsers: 100,
        currentUsers: 1,
        environment: {
          type: 'forest',
          skybox: '/textures/skybox/forest.jpg',
          lighting: {
            ambient: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
            directional: {
              color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
              intensity: 1.0,
              position: { x: 10, y: 10, z: 10 },
              castShadow: true
            },
            shadows: true,
            fog: {
              enabled: true,
              color: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
              near: 1,
              far: 1000
            }
          },
          weather: {
            type: 'clear',
            temperature: 20,
            humidity: 0.5,
            wind: { x: 0, y: 0, z: 0 }
          },
          gravity: 9.81,
          physics: {
            enabled: true,
            gravity: { x: 0, y: -9.81, z: 0 },
            airResistance: 0.1
          }
        },
        spawnPoints: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 10 },
          { x: -10, y: 0, z: -10 }
        ],
        objects: [],
        portals: [],
        boundaries: {
          min: { x: -1000, y: 0, z: -1000 },
          max: { x: 1000, y: 100, z: 1000 }
        },
        rules: {
          allowPvP: false,
          allowBuilding: true,
          allowTrading: true,
          maxGroupSize: 10
        },
        permissions: {
          canBuild: true,
          canDestroy: false,
          canInteract: true,
          canChat: true,
          canInvite: true,
          allowedUsers: [],
          bannedUsers: []
        },
        metadata: {
          tags: [],
          category: 'general',
          rating: 5,
          downloads: 0,
          likes: 0,
          thumbnail: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      set({
        isInitialized: true,
        currentWorld: defaultWorld,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
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

  joinWorld: async (worldId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      // Simular unirse a un mundo
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const world: World = {
        id: worldId,
        name: `Mundo ${worldId}`,
        description: 'Un mundo del metaverso',
        owner: 'system',
        maxUsers: 50,
        currentUsers: 1,
        environment: {
          type: 'forest',
          skybox: '/textures/skybox/forest.jpg',
          lighting: {
            ambient: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
            directional: {
              color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
              intensity: 1.0,
              position: { x: 10, y: 10, z: 10 },
              castShadow: true
            },
            shadows: true,
            fog: {
              enabled: true,
              color: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
              near: 1,
              far: 1000
            }
          },
          weather: {
            type: 'clear',
            temperature: 20,
            humidity: 0.5,
            wind: { x: 0, y: 0, z: 0 }
          },
          gravity: 9.81,
          physics: {
            enabled: true,
            gravity: { x: 0, y: -9.81, z: 0 },
            airResistance: 0.1
          }
        },
        spawnPoints: [{ x: 0, y: 0, z: 0 }],
        objects: [],
        portals: [],
        boundaries: {
          min: { x: -500, y: 0, z: -500 },
          max: { x: 500, y: 100, z: 500 }
        },
        rules: {
          allowPvP: false,
          allowBuilding: true,
          allowTrading: true,
          maxGroupSize: 5
        },
        permissions: {
          canBuild: true,
          canDestroy: false,
          canInteract: true,
          canChat: true,
          canInvite: true,
          allowedUsers: [],
          bannedUsers: []
        },
        metadata: {
          tags: [],
          category: 'general',
          rating: 5,
          downloads: 0,
          likes: 0,
          thumbnail: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      set({
        currentWorld: world,
        userPosition: { x: 0, y: 0, z: 0 },
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      })
    }
  },

  setWalletAddress: (address: string) => {
    set({
      wallet: {
        ...get().wallet,
        address
      }
    })
  },

  updateBalance: (balance: { amount: string; currency: Currency }) => {
    set({
      wallet: {
        ...get().wallet,
        balance
      }
    })
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  // Acciones de chat
  addChatMessage: (message: ChatMessage) => {
    const currentMessages = get().chat?.messages || []
    set({
      chat: {
        messages: [...currentMessages, message],
        channels: get().chat?.channels || [],
        activeChannel: get().chat?.activeChannel || 'global'

  leaveWorld: () => {
    set({ currentWorld: null })
  },

  moveToPosition: (position: Position) => {
    set({ userPosition: position })
  },

  updateAvatar: (avatarData: Partial<Avatar>) => {
    const currentAvatar = get().userAvatar
    if (currentAvatar) {
      set({ userAvatar: { ...currentAvatar, ...avatarData } })
    }
  },

  sendMessage: (message: string, channel: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: {
        id: 'user',
        username: 'Usuario',
        avatar: '/avatars/default.png'
      },
      timestamp: new Date(),
      roomId: channel,
      type: 'text'
    }
    
    const currentChat = get().chat
    set({
      chat: {
        ...currentChat,
        global: [...currentChat.global, newMessage]

      vitality: 10,
      luck: 10
    },
    achievements: [],
    social: {
      friends: [],
      guild: null,
      reputation: 0
    }
  },

  // Estado del mundo
  currentWorld: {
    id: 'world-1',
    name: 'Mundo Principal',
    description: 'Un mundo mágico lleno de aventuras',
    environment: 'forest' as Environment,
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
    npcs: [],
    events: []
  },

  // Estado de la wallet
  wallet: {
    address: '',
    balance: { gold: 0, silver: 0, copper: 0, tokens: 0, crystals: 0, reputation: {} },
    transactions: [],
    nfts: [],
    tokens: []
  },

  // Configuración del usuario
  settings: {
    graphics: {
      quality: 'high',
      resolution: '1920x1080',
      shadows: true,
      antialiasing: true,
      vsync: true
    },
    audio: {
      master: 100,
      music: 80,
      sfx: 90,
      voice: 85
    },
    controls: {
      mouseSensitivity: 1.0,
      invertY: false,
      keyBindings: {},
      gamepadEnabled: false,
      gamepadSensitivity: 1.0,
      autoRun: false,
      toggleCrouch: false,
      quickAccess: []
    },
    interface: {
      language: 'es',
      theme: 'dark',
      fontSize: 'medium',
      showHUD: true,
      showMinimap: true,
      showChat: true
    }
  },

  // Estado de carga y error
  isLoading: false,
  error: null,

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
    set({
      wallet: {
        ...get().wallet,
        address

      }
    })
  },

  clearChat: () => {
    set({
      chat: {
        messages: [],
        channels: get().chat?.channels || [],
        activeChannel: get().chat?.activeChannel || 'global'
      }
    })
  },

  setActiveChatChannel: (channelId: string) => {
    set({
      chat: {
        messages: get().chat?.messages || [],
        channels: get().chat?.channels || [],
        activeChannel: channelId
      }
    })
  }
}))

export default useMetaversoStore 

  interactWithObject: (objectId: string, action: string) => {
    console.log('Interactuando con objeto:', objectId, 'acción:', action)
  },

  updateInventory: (inventory: InventoryItem[]) => {
    set({ inventory })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  }
})) 

  updateBalance: (balance: { amount: string; currency: Currency }) => {
    set({
      wallet: {
        ...get().wallet,
        balance
      }
    })
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  // Acciones de chat
  addChatMessage: (message: ChatMessage) => {
    const currentMessages = get().chat?.messages || []
    set({
      chat: {
        messages: [...currentMessages, message],
        channels: get().chat?.channels || [],
        activeChannel: get().chat?.activeChannel || 'global'
      }
    })
  },

  clearChat: () => {
    set({
      chat: {
        messages: [],
        channels: get().chat?.channels || [],
        activeChannel: get().chat?.activeChannel || 'global'
      }
    })
  },

  setActiveChatChannel: (channelId: string) => {
    set({
      chat: {
        messages: get().chat?.messages || [],
        channels: get().chat?.channels || [],
        activeChannel: channelId
      }
    })
  }
}))

export default useMetaversoStore 

