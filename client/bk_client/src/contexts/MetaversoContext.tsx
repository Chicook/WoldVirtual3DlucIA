import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { MetaversoState, MetaversoAction, World, Position, Avatar } from '@/types/metaverso'

// Contexto Metaverso
export const MetaversoContext = createContext<{
  // Estado
  state: MetaversoState
  isInitialized: boolean
  
  // Funciones principales
  initializeMetaverso: () => Promise<void>
  joinWorld: (worldId: string) => Promise<void>
  leaveWorld: () => void
  createWorld: (worldData: any) => Promise<void>
  
  // Funciones de movimiento
  moveToPosition: (position: Position) => void
  teleportTo: (worldId: string, position: Position) => Promise<void>
  
  // Funciones de interacción
  interactWithObject: (objectId: string, action: string) => void
  sendMessage: (message: string, channel: string) => void
  
  // Funciones de avatar
  updateAvatar: (avatarData: Partial<Avatar>) => void
  customizeAvatar: (customizations: any) => void
  
  // Funciones de economía
  purchaseAsset: (assetId: string, price: string) => Promise<void>
  sellAsset: (assetId: string, price: string) => Promise<void>
  
  // Dispatch
  dispatch: React.Dispatch<MetaversoAction>
} | null>(null)

// Estado inicial
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { MetaversoState, MetaversoAction, World, Position, Avatar, InventoryItem, Wallet, ChatMessage } from '@/types/metaverso'

// Tipos avanzados para el contexto
interface MetaversoContextType {
  state: MetaversoState
  dispatch: React.Dispatch<MetaversoAction>
  // Funciones avanzadas
  initializeMetaverso: () => Promise<void>
  updateAvatar: (avatar: Partial<Avatar>) => Promise<void>
  moveToPosition: (position: Position) => Promise<void>
  joinWorld: (worldId: string) => Promise<void>
  addToInventory: (item: InventoryItem) => void
  removeFromInventory: (itemId: string) => void
  sendChatMessage: (message: string) => void
  connectWallet: (wallet: Wallet) => void
  disconnectWallet: () => void
  // Estados computados
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  userAvatar: Avatar | null
  currentWorld: World | null
}

// Estado inicial avanzado
const initialState: MetaversoState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  currentWorld: null,
  userAvatar: {
    id: 'default-avatar',
    name: 'Avatar Predeterminado',
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
  userAvatar: null,
  currentWorld: null,
  worlds: [],
  inventory: [],
  wallet: null,
  chatMessages: [],
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
    language: 'es',
    privacy: 'public',
    theme: 'dark',
    controls: {
      mouseSensitivity: 1,
      invertY: false,
      keyBindings: {},
      gamepadEnabled: false,
      gamepadSensitivity: 1,
      autoRun: false,
      toggleCrouch: false,
      quickAccess: []
    },
    accessibility: {
      colorBlindMode: 'none',
      highContrast: false,
      largeText: false,
      screenReader: false,
      subtitles: false,
      subtitleSize: 'medium',
      audioDescriptions: false,
      motionReduction: false
    },
    performance: {
      targetFPS: 60,
      vsync: true,
      antialiasing: 'fxaa',
      shadowQuality: 'high',
      textureQuality: 'high',
      drawDistance: 1000,
      particleCount: 1000,
      waterQuality: 'high',
      grassDensity: 0.5,
      treeQuality: 'high'
    },
    social: {
      autoAcceptFriendRequests: false,
      showOnlineStatus: true,
      allowWhispers: true,
      allowPartyInvites: true,
      allowGuildInvites: true,
      blockList: [],
      muteList: [],
      chatFilters: [],
      autoReply: ''
    }
  },
  nearbyUsers: [],
  nearbyObjects: [],
  activeQuests: [],
  completedQuests: [],
  achievements: [],
  statistics: {
    combat: {
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      criticalHits: 0,
      dodges: 0,
      blocks: 0,
      bossKills: 0,
      pvpWins: 0,
      pvpLosses: 0
    },
    exploration: {
      worldsVisited: 0,
      areasDiscovered: 0,
      secretsFound: 0,
      distanceTraveled: 0,
      timeExplored: 0,
      portalsUsed: 0,
      treasuresFound: 0
    },
    social: {
      friends: 0,
      guildsJoined: 0,
      partiesJoined: 0,
      tradesCompleted: 0,
      giftsGiven: 0,
      giftsReceived: 0,
      reputationEarned: 0
    },
    crafting: {
      itemsCrafted: 0,
      recipesLearned: 0,
      materialsGathered: 0,
      qualityItems: 0,
      masterpieces: 0,
      timeCrafting: 0
    },
    economy: {
      goldEarned: 0,
      goldSpent: 0,
      itemsSold: 0,
      itemsBought: 0,
      auctionsWon: 0,
      auctionsLost: 0,
      investments: 0
    },
    achievements: {
      totalAchievements: 0,
      achievementPoints: 0,
      rareAchievements: 0,
      completionRate: 0,
      fastestCompletion: 0
    },
    time: {
      totalPlayTime: 0,
      sessionsCount: 0,
      averageSessionTime: 0,
      longestSession: 0,
      lastLogin: new Date(),
      consecutiveDays: 0
    }
  },
  social: {
    friends: [],
    friendRequests: [],
    blockedUsers: [],
    mutedUsers: [],
    recentPlayers: [],
    guildInvites: [],
    partyInvites: []
  },
  notifications: [],
  system: {
    version: '2.0.0',
    build: '2024.1.0',
    uptime: 0,
    performance: {
      fps: 60,
      memoryUsage: 0,
      cpuUsage: 0,
      gpuUsage: 0,
      networkLatency: 0,
      loadTime: 0,
      renderTime: 0
    },
    network: {
      connected: false,
      latency: 0,
      bandwidth: 0,
      packetLoss: 0,
      serverRegion: '',
      connectionType: ''
    },
    storage: {
      used: 0,
      total: 0,
      cacheSize: 0,
      saveDataSize: 0,
      lastBackup: new Date()
    },
    security: {
      authenticated: false,
      sessionValid: false,
      lastSecurityCheck: new Date(),
      suspiciousActivity: false,
      twoFactorEnabled: false
    },
    maintenance: {
      scheduled: false,
      reason: '',
      affectedServices: []
    }
  }
}

// Reducer
const metaversoReducer = (state: MetaversoState, action: MetaversoAction): MetaversoState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'INITIALIZE_METAVERSO':
      return { 
        ...state, 
        isInitialized: true,
// Reducer avanzado con lógica de negocio
const metaversoReducer = (state: MetaversoState, action: MetaversoAction): MetaversoState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'INITIALIZE_METAVERSO':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
        userAvatar: action.payload.userAvatar,
        inventory: action.payload.inventory,
        wallet: action.payload.wallet
      }
    
    case 'SET_CURRENT_WORLD':
      return { ...state, currentWorld: action.payload }
    
    case 'JOIN_WORLD':
      return { 
        ...state, 
        currentWorld: action.payload.world, 
        userPosition: action.payload.position 
      }
    
    case 'LEAVE_WORLD':
      return { ...state, currentWorld: null }
    
    case 'UPDATE_USER_POSITION':
      return { ...state, userPosition: action.payload }
    
    case 'MOVE_TO_POSITION':
      return { ...state, userPosition: action.payload }
    
    case 'SET_NEARBY_USERS':
      return { ...state, nearbyUsers: action.payload }
    
    case 'UPDATE_NEARBY_USERS':
      return { ...state, nearbyUsers: action.payload }
    
    case 'USER_JOINED':
      return { 
        ...state, 
        nearbyUsers: [...state.nearbyUsers, action.payload] 
      }
    
    case 'USER_LEFT':
      return { 
        ...state, 
        nearbyUsers: state.nearbyUsers.filter(user => user.id !== action.payload.userId) 
      }
    
    case 'USER_MOVED':
      return { 
        ...state, 
        nearbyUsers: state.nearbyUsers.map(user =>
          user.id === action.payload.userId ? { ...user, position: action.payload.position } : user
      return {
        ...state,
        currentWorld: action.payload
      }
    
    case 'JOIN_WORLD':
      return {
        ...state,
        currentWorld: action.payload.world
      }
    
    case 'UPDATE_USER_POSITION':
      return {
        ...state,
        userAvatar: state.userAvatar ? {
          ...state.userAvatar,
          position: action.payload
        } : null
      }
    
    case 'MOVE_TO_POSITION':
      return {
        ...state,
        userAvatar: state.userAvatar ? {
          ...state.userAvatar,
          position: action.payload
        } : null
      }
    
    case 'SET_NEARBY_USERS':
      return {
        ...state,
        nearbyUsers: action.payload
      }
    
    case 'UPDATE_NEARBY_USERS':
      return {
        ...state,
        nearbyUsers: action.payload
      }
    
    case 'USER_JOINED':
      return {
        ...state,
        nearbyUsers: [...state.nearbyUsers, action.payload]
      }
    
    case 'USER_LEFT':
      return {
        ...state,
        nearbyUsers: state.nearbyUsers.filter(user => user.id !== action.payload.userId)
      }
    
    case 'USER_MOVED':
      return {
        ...state,
        nearbyUsers: state.nearbyUsers.map(user =>
          user.id === action.payload.userId ? { ...user, avatar: { ...user.avatar, position: action.payload.position } } : user
        )
      }
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        chat: { 
          ...state.chat, 
          global: [...state.chat.global, action.payload] 
        }
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload]
      }
    
    case 'MESSAGE_RECEIVED':
      return {
        ...state,
        chat: {
          ...state.chat,
          global: [...state.chat.global, action.payload]
        }
      }
    
    case 'UPDATE_AVATAR':
      return { 
        ...state, 
        userAvatar: action.payload 
      }
    
    case 'SET_WORLD_OBJECTS':
      return { ...state, nearbyObjects: action.payload }
    
    case 'UPDATE_NEARBY_OBJECTS':
      return { ...state, nearbyObjects: action.payload }
    
    case 'OBJECT_INTERACTION':
      return { ...state, nearbyObjects: state.nearbyObjects }
    
    case 'OBJECT_INTERACTION_RECEIVED':
      return { ...state, nearbyObjects: state.nearbyObjects }
    
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: action.payload }
    
    case 'UPDATE_WALLET':
      return { ...state, wallet: action.payload }
    
    case 'WORLD_CREATED':
      return { ...state }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        chatMessages: [...state.chatMessages, action.payload]
      }
    
    case 'UPDATE_AVATAR':
      return {
        ...state,
        userAvatar: action.payload
      }
    
    case 'SET_WORLD_OBJECTS':
      return {
        ...state,
        nearbyObjects: action.payload
      }
    
    case 'UPDATE_NEARBY_OBJECTS':
      return {
        ...state,
        nearbyObjects: action.payload
      }
    
    case 'OBJECT_INTERACTION':
      return {
        ...state
      }
    
    case 'OBJECT_INTERACTION_RECEIVED':
      return {
        ...state
      }
    
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: action.payload
      }
    
    case 'UPDATE_WALLET':
      return {
        ...state,
        wallet: action.payload
      }
    
    case 'WORLD_CREATED':
      return {
        ...state
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    
    case 'UPDATE_CURRENCY':
      return {
        ...state,
        wallet: state.wallet ? {
          ...state.wallet,
          balance: action.payload
        } : null
      }
      return {
        ...state,
        wallet: state.wallet ? {
          ...state.wallet,
          balance: action.payload
        } : null
      }
      return { ...state }
    
    default:
      return state
  }
}

// Provider
export const MetaversoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(metaversoReducer, initialState)

  // Inicializar metaverso
  const initializeMetaverso = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

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

      dispatch({ type: 'SET_CURRENT_WORLD', payload: defaultWorld })
      dispatch({
        type: 'INITIALIZE_METAVERSO',
        payload: {
          userAvatar: state.userAvatar!,
          inventory: state.inventory,
          wallet: state.wallet
        }
      })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.userAvatar, state.inventory, state.wallet])

  // Unirse a un mundo
  const joinWorld = useCallback(async (worldId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

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
      
      dispatch({
// Contexto exportado correctamente
export const MetaversoContext = createContext<MetaversoContextType | undefined>(undefined)

// Hook personalizado avanzado
export const useMetaverso = (): MetaversoContextType => {
  const context = useContext(MetaversoContext)
  if (!context) {
    throw new Error('useMetaverso debe ser usado dentro de MetaversoProvider')
  }
  return context
}

// Provider avanzado con lógica de negocio
export const MetaversoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(metaversoReducer, initialState)

  // Funciones avanzadas con manejo de errores y async/await
  const initializeMetaverso = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Simulación de inicialización avanzada
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAvatar: Avatar = {
        id: 'avatar-1',
        name: 'Usuario',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        model: 'default-avatar.glb',
        texture: 'default-texture.jpg',
        animations: ['idle', 'walk', 'run'],
        currentAnimation: 'idle',
        health: 100,
        energy: 100,
        level: 1,
        experience: 0,
        skills: [],
        equipment: {},
        customization: {
          skinColor: '#ffdbac',
          hairStyle: 'default',
          hairColor: '#8b4513',
          eyeColor: '#000000',
          facialFeatures: [],
          tattoos: [],
          scars: [],
          accessories: []
        }
      }
      
      // mockWorlds removed - not used in current implementation
      
      const mockInventory: InventoryItem[] = []
      const mockWallet: Wallet = {
        address: '',
        balance: {
          gold: 100,
          silver: 50,
          copper: 25,
          tokens: 10,
          crystals: 5,
          reputation: {}
        },
        assets: [],
        transactions: [],
        connected: false,
        network: 'ethereum',
        gasPrice: 20,
        nonce: 0
      }
      
      dispatch({
        type: 'INITIALIZE_METAVERSO',
        payload: { userAvatar: mockAvatar, inventory: mockInventory, wallet: mockWallet }
      })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }, [])

  const updateAvatar = useCallback(async (avatar: Partial<Avatar>): Promise<void> => {
    try {
      if (!state.userAvatar) return
      
      const updatedAvatar: Avatar = {
        ...state.userAvatar,
        ...avatar
      }
      
      dispatch({
        type: 'UPDATE_AVATAR',
        payload: updatedAvatar
      })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al actualizar avatar'
      })
    }
  }, [state.userAvatar])

  const moveToPosition = useCallback(async (position: Position): Promise<void> => {
    try {
      dispatch({
        type: 'MOVE_TO_POSITION',
        payload: position
      })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al mover avatar'
      })
    }
  }, [])

  const joinWorld = useCallback(async (worldId: string): Promise<void> => {
    try {
      const world = state.worlds.find(w => w.id === worldId)
      if (!world) throw new Error('Mundo no encontrado')
      
      dispatch({
        type: 'JOIN_WORLD',
        payload: { world, position: { x: 0, y: 0, z: 0 } }
      })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Salir del mundo
  const leaveWorld = useCallback(() => {
    dispatch({ type: 'LEAVE_WORLD' })
  }, [])

  // Crear mundo
  const createWorld = useCallback(async (worldData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Simular creación de mundo
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Mundo creado:', worldData)
      
      dispatch({ type: 'WORLD_CREATED', payload: worldData })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Mover a posición
  const moveToPosition = useCallback((position: Position) => {
    dispatch({ type: 'MOVE_TO_POSITION', payload: position })
  }, [])

  // Teletransportarse
  const teleportTo = useCallback(async (worldId: string, position: Position) => {
    try {
      await joinWorld(worldId)
      dispatch({ type: 'UPDATE_USER_POSITION', payload: position })
    } catch (error) {
      console.error('Error teletransportándose:', error)
    }
  }, [joinWorld])

  // Interactuar con objeto
  const interactWithObject = useCallback((objectId: string, action: string) => {
    console.log('Interactuando con objeto:', objectId, 'acción:', action)
    dispatch({
      type: 'OBJECT_INTERACTION',
      payload: { objectId, action, result: { success: true } }
    })
  }, [])

  // Enviar mensaje
  const sendMessage = useCallback((message: string, channel: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: {
        id: 'user',
        username: 'Usuario',
        avatar: '/avatars/default.png'
      },
      timestamp: new Date(),
      roomId: channel,
      type: 'text' as const
    }
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage })
  }, [])

  // Actualizar avatar
  const updateAvatar = useCallback((avatarData: Partial<Avatar>) => {
    if (state.userAvatar) {
      dispatch({ type: 'UPDATE_AVATAR', payload: { ...state.userAvatar, ...avatarData } })
    }
  }, [state.userAvatar])

  // Personalizar avatar
  const customizeAvatar = useCallback((customizations: any) => {
    if (state.userAvatar) {
      dispatch({ 
        type: 'UPDATE_AVATAR', 
        payload: { 
          ...state.userAvatar, 
          customizations: { ...state.userAvatar.customizations, ...customizations } 
        } 
      })
    }
  }, [state.userAvatar])

  // Comprar asset
  const purchaseAsset = useCallback(async (assetId: string, price: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Simular compra
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Asset comprado:', assetId, 'precio:', price)
      
      // Actualizar wallet
      const newBalance = parseFloat(state.wallet.balance) - parseFloat(price)
      dispatch({
        type: 'UPDATE_WALLET',
        payload: {
          ...state.wallet,
          balance: newBalance.toString()
        }
      })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.wallet])

  // Vender asset
  const sellAsset = useCallback(async (assetId: string, price: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Simular venta
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Asset vendido:', assetId, 'precio:', price)
      
      // Actualizar wallet
      const newBalance = parseFloat(state.wallet.balance) + parseFloat(price)
      dispatch({
        type: 'UPDATE_WALLET',
        payload: {
          ...state.wallet,
          balance: newBalance.toString()
        }
      })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.wallet])

  const value = {
    state,
    isInitialized: state.isInitialized,
    initializeMetaverso,
    joinWorld,
    leaveWorld,
    createWorld,
    moveToPosition,
    teleportTo,
    interactWithObject,
    sendMessage,
    updateAvatar,
    customizeAvatar,
    purchaseAsset,
    sellAsset,
    dispatch
  }

  return (
    <MetaversoContext.Provider value={value}>
      {children}
    </MetaversoContext.Provider>
  )
}

// Hook personalizado
export const useMetaverso = () => {
  const context = useContext(MetaversoContext)
  if (!context) {
    throw new Error('useMetaverso debe ser usado dentro de un MetaversoProvider')
  }
  return context
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al unirse al mundo'
      })
    }
  }, [state.worlds])

  const addToInventory = useCallback((item: InventoryItem): void => {
    const currentInventory = [...state.inventory]
    const existingItemIndex = currentInventory.findIndex(invItem => invItem.item.id === item.item.id)
    
    if (existingItemIndex >= 0) {
      currentInventory[existingItemIndex].quantity += item.quantity
    } else {
      currentInventory.push(item)
    }
    
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: currentInventory
    })
  }, [state.inventory])

  const removeFromInventory = useCallback((itemId: string): void => {
    const currentInventory = state.inventory.filter(item => item.item.id !== itemId)
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: currentInventory
    })
  }, [state.inventory])

  const sendChatMessage = useCallback((message: string): void => {
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: message,
      sender: {
        id: 'user',
        username: state.userAvatar?.name || 'Usuario',
        avatar: state.userAvatar?.model || '',
        level: state.userAvatar?.level || 1
      },
      timestamp: new Date(),
      type: 'text',
      channel: 'global',
      mentions: [],
      attachments: [],
      reactions: [],
      edited: false,
      deleted: false
    }
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: chatMessage
    })
  }, [state.userAvatar])

  const connectWallet = useCallback((wallet: Wallet): void => {
    dispatch({
      type: 'UPDATE_WALLET',
      payload: wallet
    })
  }, [])

  const disconnectWallet = useCallback((): void => {
    if (state.wallet) {
      const disconnectedWallet: Wallet = {
        ...state.wallet,
        connected: false
      }
      dispatch({
        type: 'UPDATE_WALLET',
        payload: disconnectedWallet
      })
    }
  }, [state.wallet])

  // Estados computados optimizados
  const contextValue = useMemo((): MetaversoContextType => ({
    state,
    dispatch,
    initializeMetaverso,
    updateAvatar,
    moveToPosition,
    joinWorld,
    addToInventory,
    removeFromInventory,
    sendChatMessage,
    connectWallet,
    disconnectWallet,
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    error: state.error,
    userAvatar: state.userAvatar,
    currentWorld: state.currentWorld
  }), [
    state,
    initializeMetaverso,
    updateAvatar,
    moveToPosition,
    joinWorld,
    addToInventory,
    removeFromInventory,
    sendChatMessage,
    connectWallet,
    disconnectWallet
  ])

  return (
    <MetaversoContext.Provider value={contextValue}>
      {children}
    </MetaversoContext.Provider>
  )
} 