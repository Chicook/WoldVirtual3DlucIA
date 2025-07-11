import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// Tipos para el estado de Web3
interface Web3State {
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string
  provider: any
  contract: any
  isLoading: boolean
  error: string | null
}

// Acciones del reducer
type Web3Action =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ACCOUNT'; payload: string | null }
  | { type: 'SET_CHAIN_ID'; payload: number | null }
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_PROVIDER'; payload: any }
  | { type: 'SET_CONTRACT'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Estado inicial
const initialState: Web3State = {
  isConnected: false,
  account: null,
  chainId: null,
  balance: '0',
  provider: null,
  contract: null,
  isLoading: false,
  error: null,
}

// Reducer
const web3Reducer = (state: Web3State, action: Web3Action): Web3State => {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'SET_ACCOUNT':
      return { ...state, account: action.payload }
    case 'SET_CHAIN_ID':
      return { ...state, chainId: action.payload }
    case 'SET_BALANCE':
      return { ...state, balance: action.payload }
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload }
    case 'SET_CONTRACT':
      return { ...state, contract: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// Contexto
const Web3Context = createContext<{
  state: Web3State
  dispatch: React.Dispatch<Web3Action>
} | undefined>(undefined)

// Provider
export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState)

  return (
    <Web3Context.Provider value={{ state, dispatch }}>
      {children}
    </Web3Context.Provider>
  )
}

// Hook personalizado
export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
} 