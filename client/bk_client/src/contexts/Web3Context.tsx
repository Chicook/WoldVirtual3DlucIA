import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { Web3State, Web3Action } from '@/types/web3'

// Contexto
export const Web3Context = createContext<{
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  account: string | null
  chainId: number | null
  balance: string | null
  sendTransaction: (to: string, value: string) => Promise<any>
  signMessage: (message: string) => Promise<string>
  provider: ethers.Provider | null
  signer: ethers.Signer | null
} | null>(null)

// Estado inicial
const initialState: Web3State = {
  isConnected: false,
  isConnecting: false,
  error: null,
  account: null,
  chainId: null,
  balance: null,
  provider: null,
  signer: null
}

// Reducer
const web3Reducer = (state: Web3State, action: Web3Action): Web3State => {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload }
    
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        error: null,
        account: action.payload.account,
        chainId: action.payload.chainId,
        provider: action.payload.provider,
        signer: action.payload.signer,
        balance: action.payload.balance
      }
    
    case 'SET_DISCONNECTED':
      return { 
        ...state, 
        isConnected: false, 
        isConnecting: false,
        account: null,
        chainId: null,
        balance: null,
        provider: null,
        signer: null
      }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isConnecting: false }
    
    case 'SET_BALANCE':
      return { ...state, balance: action.payload }
    
    case 'SET_CHAIN_ID':
      return { ...state, chainId: action.payload }
    
    default:
      return state
  }
}

// Provider
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState)

  // Conectar wallet
  const connect = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: '' })

      // Verificar si MetaMask está disponible
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado')
      }

      // Solicitar conexión
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No se seleccionó ninguna cuenta')
      }

      const account = accounts[0]
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(account)

      dispatch({
        type: 'SET_CONNECTED',
        payload: {
          account,
          chainId: Number(network.chainId),
          provider,
          signer,
          balance: ethers.formatEther(balance)
        }
      })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      })
    }
  }, [])

  // Desconectar wallet
  const disconnect = useCallback(() => {
    dispatch({ type: 'SET_DISCONNECTED' })
  }, [])

  // Enviar transacción
  const sendTransaction = useCallback(async (to: string, value: string) => {
    if (!state.signer) {
      throw new Error('No hay signer disponible')
    }

    const tx = await state.signer.sendTransaction({
      to,
      value: ethers.parseEther(value)
    })

    return await tx.wait()
  }, [state.signer])

  // Firmar mensaje
  const signMessage = useCallback(async (message: string) => {
    if (!state.signer) {
      throw new Error('No hay signer disponible')
    }

    return await state.signer.signMessage(message)
  }, [state.signer])

  // Escuchar cambios de cuenta
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        dispatch({ type: 'SET_DISCONNECTED' })
      } else if (state.provider && state.signer) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: {
            account: accounts[0],
            chainId: state.chainId || 1,
            provider: state.provider,
            signer: state.signer,
            balance: state.balance || '0'
          }
        })
      }
    }

    const handleChainChanged = (chainId: string) => {
      dispatch({ type: 'SET_CHAIN_ID', payload: parseInt(chainId, 16) })
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [state.chainId, state.provider, state.signer, state.balance])

  // Actualizar balance periódicamente
  useEffect(() => {
    if (!state.provider || !state.account) return;
    const getBalance = async () => {
      try {
        if (!state.provider || !state.account) return;
        const balance = await state.provider.getBalance(state.account as string)
        const balanceInEth = ethers.formatEther(balance)
        dispatch({
          type: 'SET_BALANCE',
          payload: balanceInEth
        })
      } catch (error) {
        console.error('Error getting balance:', error)
      }
    }

    getBalance()
    const interval = setInterval(getBalance, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [state.provider, state.account])

  const value = {
    // Estado de conexión
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    
    // Funciones de conexión
    connect,
    disconnect,
    
    // Estado de la wallet
    account: state.account,
    chainId: state.chainId,
    balance: state.balance,
    
    // Funciones de transacción
    sendTransaction,
    signMessage,
    
    // Estado del proveedor
    provider: state.provider,
    signer: state.signer
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

// Hook personalizado
export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3Context debe ser usado dentro de un Web3Provider')
  }
  return context
} 