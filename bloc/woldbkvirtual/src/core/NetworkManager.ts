import { ethers } from 'ethers'
import { NetworkConfig } from '../config/NetworkConfig'
import { Logger } from '../utils/Logger'

export interface NetworkInfo {
  id: string
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  contracts: {
    [key: string]: string
  }
}

export interface NetworkStatus {
  isConnected: boolean
  chainId: number
  blockNumber: number
  gasPrice: string
  latency: number
}

export class NetworkManager {
  private networks: Map<string, NetworkInfo> = new Map()
  private providers: Map<string, ethers.Provider> = new Map()
  private signers: Map<string, ethers.Signer> = new Map()
  private currentNetworkId: string | null = null
  private logger: Logger
  private isInitialized: boolean = false

  constructor() {
    this.logger = new Logger('NetworkManager')
  }

  /**
   * Inicializa el Network Manager
   */
  async initialize(networks?: NetworkConfig[]): Promise<void> {
    try {
      this.logger.info('Initializing Network Manager...')
      
      // Add default networks if none provided
      const defaultNetworks = this.getDefaultNetworks()
      const networkConfigs = networks || defaultNetworks
      
      for (const network of networkConfigs) {
        await this.addNetwork(network)
      }
      
      this.isInitialized = true
      this.logger.info(`Network Manager initialized with ${this.networks.size} networks`)
    } catch (error) {
      this.logger.error('Failed to initialize Network Manager:', error)
      throw error
    }
  }

  /**
   * Agrega una red a la lista de redes soportadas
   */
  async addNetwork(network: NetworkConfig): Promise<void> {
    try {
      this.logger.info(`Adding network: ${network.name}`)
      
      const networkInfo: NetworkInfo = {
        id: network.id,
        name: network.name,
        chainId: network.chainId,
        rpcUrl: network.rpcUrl,
        explorerUrl: network.explorerUrl,
        nativeCurrency: network.nativeCurrency,
        contracts: network.contracts || {}
      }
      
      this.networks.set(network.id, networkInfo)
      
      // Create provider for this network
      const provider = new ethers.JsonRpcProvider(network.rpcUrl)
      this.providers.set(network.id, provider)
      
      this.logger.info(`Network ${network.name} added successfully`)
    } catch (error) {
      this.logger.error(`Failed to add network ${network.name}:`, error)
      throw error
    }
  }

  /**
   * Conecta a una red específica
   */
  async connectToNetwork(networkId: string, provider?: ethers.Provider): Promise<void> {
    try {
      this.logger.info(`Connecting to network: ${networkId}`)
      
      const network = this.networks.get(networkId)
      if (!network) {
        throw new Error(`Network ${networkId} not found`)
      }
      
      // Use provided provider or get from map
      const networkProvider = provider || this.providers.get(networkId)
      if (!networkProvider) {
        throw new Error(`Provider for network ${networkId} not found`)
      }
      
      // Test connection
      const blockNumber = await networkProvider.getBlockNumber()
      this.logger.info(`Connected to ${network.name} at block ${blockNumber}`)
      
      this.currentNetworkId = networkId
      
      // Create signer if wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const signer = await networkProvider.getSigner()
        this.signers.set(networkId, signer)
      }
      
      this.logger.info(`Successfully connected to network: ${networkId}`)
    } catch (error) {
      this.logger.error(`Failed to connect to network ${networkId}:`, error)
      throw error
    }
  }

  /**
   * Desconecta de la red actual
   */
  async disconnect(): Promise<void> {
    try {
      this.logger.info('Disconnecting from current network')
      this.currentNetworkId = null
      this.logger.info('Disconnected successfully')
    } catch (error) {
      this.logger.error('Failed to disconnect:', error)
      throw error
    }
  }

  /**
   * Obtiene el proveedor de la red actual
   */
  getCurrentProvider(): ethers.Provider | null {
    if (!this.currentNetworkId) return null
    return this.providers.get(this.currentNetworkId) || null
  }

  /**
   * Obtiene el signer de la red actual
   */
  getCurrentSigner(): ethers.Signer | null {
    if (!this.currentNetworkId) return null
    return this.signers.get(this.currentNetworkId) || null
  }

  /**
   * Obtiene información de la red actual
   */
  async getCurrentNetwork(): Promise<NetworkInfo | null> {
    if (!this.currentNetworkId) return null
    return this.networks.get(this.currentNetworkId) || null
  }

  /**
   * Obtiene el proveedor de una red específica
   */
  getProvider(networkId: string): ethers.Provider | null {
    return this.providers.get(networkId) || null
  }

  /**
   * Obtiene el signer de una red específica
   */
  getSigner(networkId: string): ethers.Signer | null {
    return this.signers.get(networkId) || null
  }

  /**
   * Obtiene información de una red específica
   */
  getNetwork(networkId: string): NetworkInfo | null {
    return this.networks.get(networkId) || null
  }

  /**
   * Obtiene todas las redes disponibles
   */
  getAllNetworks(): NetworkInfo[] {
    return Array.from(this.networks.values())
  }

  /**
   * Verifica si está conectado a una red
   */
  isConnected(): boolean {
    return this.currentNetworkId !== null
  }

  /**
   * Obtiene el estado de una red específica
   */
  async getNetworkStatus(networkId: string): Promise<NetworkStatus> {
    try {
      const provider = this.providers.get(networkId)
      if (!provider) {
        return {
          isConnected: false,
          chainId: 0,
          blockNumber: 0,
          gasPrice: '0',
          latency: 0
        }
      }

      const startTime = Date.now()
      const [blockNumber, gasPrice, network] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
        provider.getNetwork()
      ])
      const latency = Date.now() - startTime

      return {
        isConnected: true,
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        latency
      }
    } catch (error) {
      this.logger.error(`Failed to get status for network ${networkId}:`, error)
      return {
        isConnected: false,
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0',
        latency: 0
      }
    }
  }

  /**
   * Obtiene el estado de todas las redes
   */
  async getAllNetworkStatuses(): Promise<Map<string, NetworkStatus>> {
    const statuses = new Map<string, NetworkStatus>()
    
    for (const networkId of this.networks.keys()) {
      const status = await this.getNetworkStatus(networkId)
      statuses.set(networkId, status)
    }
    
    return statuses
  }

  /**
   * Obtiene estadísticas del Network Manager
   */
  async getStats(): Promise<any> {
    const allStatuses = await this.getAllNetworkStatuses()
    const connectedNetworks = Array.from(allStatuses.values()).filter(status => status.isConnected)
    
    return {
      totalNetworks: this.networks.size,
      connectedNetworks: connectedNetworks.length,
      currentNetwork: this.currentNetworkId,
      averageLatency: connectedNetworks.length > 0 
        ? connectedNetworks.reduce((sum, status) => sum + status.latency, 0) / connectedNetworks.length 
        : 0
    }
  }

  /**
   * Limpia recursos del Network Manager
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Network Manager...')
      
      this.providers.clear()
      this.signers.clear()
      this.currentNetworkId = null
      this.isInitialized = false
      
      this.logger.info('Network Manager cleaned up successfully')
    } catch (error) {
      this.logger.error('Failed to cleanup Network Manager:', error)
      throw error
    }
  }

  /**
   * Obtiene las redes por defecto
   */
  private getDefaultNetworks(): NetworkConfig[] {
    return [
      {
        id: 'ethereum',
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        contracts: {
          metaversoToken: process.env.ETHEREUM_METAVERSO_TOKEN || '0x...',
          metaversoNFT: process.env.ETHEREUM_METAVERSO_NFT || '0x...',
          marketplace: process.env.ETHEREUM_MARKETPLACE || '0x...'
        }
      },
      {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        contracts: {
          metaversoToken: process.env.POLYGON_METAVERSO_TOKEN || '0x...',
          metaversoNFT: process.env.POLYGON_METAVERSO_NFT || '0x...',
          marketplace: process.env.POLYGON_MARKETPLACE || '0x...'
        }
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        contracts: {
          metaversoToken: process.env.ARBITRUM_METAVERSO_TOKEN || '0x...',
          metaversoNFT: process.env.ARBITRUM_METAVERSO_NFT || '0x...',
          marketplace: process.env.ARBITRUM_MARKETPLACE || '0x...'
        }
      },
      {
        id: 'optimism',
        name: 'Optimism',
        chainId: 10,
        rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
        explorerUrl: 'https://optimistic.etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        contracts: {
          metaversoToken: process.env.OPTIMISM_METAVERSO_TOKEN || '0x...',
          metaversoNFT: process.env.OPTIMISM_METAVERSO_NFT || '0x...',
          marketplace: process.env.OPTIMISM_MARKETPLACE || '0x...'
        }
      },
      {
        id: 'bsc',
        name: 'Binance Smart Chain',
        chainId: 56,
        rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
        explorerUrl: 'https://bscscan.com',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        contracts: {
          metaversoToken: process.env.BSC_METAVERSO_TOKEN || '0x...',
          metaversoNFT: process.env.BSC_METAVERSO_NFT || '0x...',
          marketplace: process.env.BSC_MARKETPLACE || '0x...'
        }
      }
    ]
  }
} 