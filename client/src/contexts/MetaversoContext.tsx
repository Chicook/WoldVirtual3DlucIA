import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// Tipos para el estado del metaverso
interface MetaversoState {
  isConnected: boolean
  currentScene: string
  userAvatar: any
  worldData: any
  isLoading: boolean
  error: string | null
}

// Acciones del reducer
type MetaversoAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_SCENE'; payload: string }
  | { type: 'SET_AVATAR'; payload: any }
  | { type: 'SET_WORLD_DATA'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Estado inicial
const initialState: MetaversoState = {
  isConnected: false,
  currentScene: 'lobby',
  userAvatar: null,
  worldData: null,
  isLoading: false,
  error: null,
}

// Reducer
const metaversoReducer = (state: MetaversoState, action: MetaversoAction): MetaversoState => {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'SET_SCENE':
      return { ...state, currentScene: action.payload }
    case 'SET_AVATAR':
      return { ...state, userAvatar: action.payload }
    case 'SET_WORLD_DATA':
      return { ...state, worldData: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// Contexto
const MetaversoContext = createContext<{
  state: MetaversoState
  dispatch: React.Dispatch<MetaversoAction>
} | undefined>(undefined)

// Provider
export const MetaversoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(metaversoReducer, initialState)

  return (
    <MetaversoContext.Provider value={{ state, dispatch }}>
      {children}
    </MetaversoContext.Provider>
  )
}

// Hook personalizado
export const useMetaverso = () => {
  const context = useContext(MetaversoContext)
  if (context === undefined) {
    throw new Error('useMetaverso must be used within a MetaversoProvider')
  }
  return context
} 