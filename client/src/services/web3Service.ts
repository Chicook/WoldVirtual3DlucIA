//! # Servicio Web3 Avanzado
//! 
//! Servicio completo para integración con blockchain, manejo de múltiples wallets,
//! contratos inteligentes y transacciones descentralizadas.

import { ethers } from 'ethers'

import { 
  Web3State, 
  Transaction, 
  Contract
} from '@/types/web3'

/// Servicio Web3 principal
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private contracts: Map<string, Contract> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private isInitialized = false

  /// Inicializar servicio Web3
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado')
      }

      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.isInitialized = true

      console.log('Web3Service initialized successfully')
    } catch (error) {
      console.error('Error initializing Web3Service:', error)
      throw error
    }
  }

  /// Obtener el proveedor
  getProvider(): ethers.BrowserProvider | null {
    return this.provider
  }

  /// Obtener el signer
  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer
  }

  /// Conectar wallet
  async connectWallet(): Promise<string> {
    if (!this.provider) {
      await this.initialize()
    }

    if (!this.provider) {
      throw new Error('Provider no disponible')
    }

    try {
      const accounts = await this.provider.send('eth_requestAccounts', [])
      return accounts[0]
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  /// Obtener balance
  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider no disponible')
    }

    try {
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Error getting balance:', error)
      throw error
    }
  }

  /// Obtener red actual
  async getNetwork(): Promise<ethers.Network> {
    if (!this.provider) {
      throw new Error('Provider no disponible')
    }

    try {
      return await this.provider.getNetwork()
    } catch (error) {
      console.error('Error getting network:', error)
      throw error
    }
  }

  /// Enviar transacción
  async sendTransaction(to: string, value: string): Promise<Transaction> {
    if (!this.signer) {
      throw new Error('Signer no disponible')
    }

    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(value)
      })

      const receipt = await tx.wait()

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
        nonce: tx.nonce,
        data: tx.data,
        chainId: Number(tx.chainId) || 0,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        timestamp: Date.now(),
        receipt: receipt || undefined
      }
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }

  /// Firmar mensaje
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer no disponible')
    }

    try {
      return await this.signer.signMessage(message)
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  /// Obtener estado actual
  async getState(): Promise<Partial<Web3State>> {
    if (!this.provider || !this.signer) {
      return {
        isConnected: false,
        isConnecting: false,
        account: null,
        chainId: null,
        balance: null,
        provider: null,
        signer: null
      }
    }

    try {
      const account = await this.signer.getAddress()
      const network = await this.provider.getNetwork()
      const balance = await this.provider.getBalance(account)

      return {
        isConnected: true,
        isConnecting: false,
        account,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        provider: this.provider,
        signer: this.signer
      }
    } catch (error) {
      console.error('Error getting state:', error)
      return {
        isConnected: false,
        isConnecting: false,
        account: null,
        chainId: null,
        balance: null,
        provider: null,
        signer: null
      }
    }
  }

  /// Escuchar eventos de la wallet
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', callback)
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (!window.ethereum) return

    window.ethereum.on('chainChanged', callback)
  }

  /// Remover listeners
  removeListeners(): void {
    if (!window.ethereum) return
    // No existe removeAllListeners, así que no hacemos nada o podríamos remover manualmente si fuera necesario
  }

  /// Desconectar
  disconnect(): void {
    this.provider = null
    this.signer = null
    this.contracts.clear()
    this.isInitialized = false
    this.removeListeners()
  }

  /// Limpiar recursos
  cleanup(): void {
    this.disconnect()
    this.eventListeners.clear()
  }
}

// Instancia singleton
export const web3Service = new Web3Service()

// Hook para usar el servicio
export const useWeb3Service = () => {
  return web3Service
} 