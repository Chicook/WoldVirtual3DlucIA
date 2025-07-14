import { useWeb3Context } from '@/contexts/Web3Context'

export const useWeb3 = () => {
  const context = useWeb3Context()
  
  if (!context) {
    throw new Error('useWeb3 debe ser usado dentro de un Web3Provider')
  }
  
  return {
    // Estado de conexión
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    error: context.error,
    
    // Funciones de conexión
    connect: context.connect,
    disconnect: context.disconnect,
    
    // Estado de la wallet
    account: context.account,
    chainId: context.chainId,
    balance: context.balance,
    
    // Funciones de transacción
    sendTransaction: context.sendTransaction,
    signMessage: context.signMessage,
    
    // Estado del proveedor
    provider: context.provider,
    signer: context.signer
  }
} 