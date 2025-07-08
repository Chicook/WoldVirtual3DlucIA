import { ethers } from 'ethers'
import { NetworkManager } from './NetworkManager'
import { ContractManager } from './ContractManager'
import { TransactionManager } from './TransactionManager'
import { EventManager } from './EventManager'
import { BlockchainConfig } from '../config/BlockchainConfig'
import { NetworkConfig } from '../config/NetworkConfig'
import { Logger } from '../utils/Logger'

export interface BlockchainManagerConfig {
  networks?: NetworkConfig[]
  contracts?: any[]
  gasLimit?: number
  gasPrice?: string
  confirmations?: number
  timeout?: number
}

export interface BlockchainStatus {
  isConnected: boolean
  currentNetwork: string
  blockNumber: number
  gasPrice: string
  balance: string
  pendingTransactions: number
}

export class BlockchainManager {
  private networkManager: NetworkManager
  private contractManager: ContractManager
  private transactionManager: TransactionManager
  private eventManager: EventManager
  private logger: Logger
  private config: BlockchainManagerConfig
  private isInitialized: boolean = false

  constructor(config?: BlockchainManagerConfig) {
    this.config = config || {}
    this.logger = new Logger('BlockchainManager')
    this.networkManager = new NetworkManager()
    this.contractManager = new ContractManager()
    this.transactionManager = new TransactionManager()
    this.eventManager = new EventManager()
  }

  /**
   * Inicializa el Blockchain Manager
   */
  async initialize(config?: BlockchainManagerConfig): Promise<void> {
    try {
      this.logger.info('Initializing Blockchain Manager...')
      
      this.config = { ...this.config, ...config }
      
      // Initialize network manager
      await this.networkManager.initialize(this.config.networks)
      
      // Initialize contract manager
      await this.contractManager.initialize(this.config.contracts)
      
      // Initialize transaction manager
      await this.transactionManager.initialize({
        gasLimit: this.config.gasLimit,
        gasPrice: this.config.gasPrice,
        confirmations: this.config.confirmations,
        timeout: this.config.timeout
      })
      
      // Initialize event manager
      await this.eventManager.initialize()
      
      this.isInitialized = true
      this.logger.info('Blockchain Manager initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize Blockchain Manager:', error)
      throw error
    }
  }

  /**
   * Conecta a una red específica
   */
  async connectToNetwork(networkId: string, provider?: ethers.Provider): Promise<void> {
    try {
      this.logger.info(`Connecting to network: ${networkId}`)
      await this.networkManager.connectToNetwork(networkId, provider)
      this.logger.info(`Connected to network: ${networkId}`)
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
      await this.networkManager.disconnect()
      this.logger.info('Disconnected successfully')
    } catch (error) {
      this.logger.error('Failed to disconnect:', error)
      throw error
    }
  }

  /**
   * Obtiene el proveedor actual
   */
  getCurrentProvider(): ethers.Provider | null {
    return this.networkManager.getCurrentProvider()
  }

  /**
   * Obtiene el signer actual
   */
  getCurrentSigner(): ethers.Signer | null {
    return this.networkManager.getCurrentSigner()
  }

  /**
   * Obtiene información de la red actual
   */
  async getCurrentNetwork(): Promise<any> {
    return this.networkManager.getCurrentNetwork()
  }

  /**
   * Obtiene el balance de una dirección
   */
  async getBalance(address: string): Promise<string> {
    try {
      const provider = this.getCurrentProvider()
      if (!provider) {
        throw new Error('No provider connected')
      }
      
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}:`, error)
      throw error
    }
  }

  /**
   * Obtiene el número de bloque actual
   */
  async getCurrentBlockNumber(): Promise<number> {
    try {
      const provider = this.getCurrentProvider()
      if (!provider) {
        throw new Error('No provider connected')
      }
      
      return await provider.getBlockNumber()
    } catch (error) {
      this.logger.error('Failed to get current block number:', error)
      throw error
    }
  }

  /**
   * Obtiene el precio del gas actual
   */
  async getCurrentGasPrice(): Promise<string> {
    try {
      const provider = this.getCurrentProvider()
      if (!provider) {
        throw new Error('No provider connected')
      }
      
      const gasPrice = await provider.getFeeData()
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')
    } catch (error) {
      this.logger.error('Failed to get current gas price:', error)
      throw error
    }
  }

  /**
   * Envía una transacción
   */
  async sendTransaction(transaction: any): Promise<any> {
    try {
      this.logger.info('Sending transaction:', transaction)
      const result = await this.transactionManager.sendTransaction(transaction)
      this.logger.info('Transaction sent successfully:', result.hash)
      return result
    } catch (error) {
      this.logger.error('Failed to send transaction:', error)
      throw error
    }
  }

  /**
   * Espera a que una transacción sea confirmada
   */
  async waitForTransaction(hash: string, confirmations?: number): Promise<any> {
    try {
      this.logger.info(`Waiting for transaction ${hash} to be confirmed...`)
      const result = await this.transactionManager.waitForTransaction(hash, confirmations)
      this.logger.info(`Transaction ${hash} confirmed`)
      return result
    } catch (error) {
      this.logger.error(`Failed to wait for transaction ${hash}:`, error)
      throw error
    }
  }

  /**
   * Obtiene una instancia de contrato
   */
  getContract(address: string, abi: any[]): ethers.Contract {
    try {
      return this.contractManager.getContract(address, abi)
    } catch (error) {
      this.logger.error(`Failed to get contract at ${address}:`, error)
      throw error
    }
  }

  /**
   * Despliega un contrato
   */
  async deployContract(bytecode: string, abi: any[], args: any[] = []): Promise<any> {
    try {
      this.logger.info('Deploying contract...')
      const result = await this.contractManager.deployContract(bytecode, abi, args)
      this.logger.info('Contract deployed successfully:', result.address)
      return result
    } catch (error) {
      this.logger.error('Failed to deploy contract:', error)
      throw error
    }
  }

  /**
   * Escucha eventos de un contrato
   */
  async listenToEvents(contractAddress: string, eventName: string, callback: Function): Promise<void> {
    try {
      this.logger.info(`Listening to event ${eventName} on contract ${contractAddress}`)
      await this.eventManager.listenToEvent(contractAddress, eventName, callback)
    } catch (error) {
      this.logger.error(`Failed to listen to event ${eventName}:`, error)
      throw error
    }
  }

  /**
   * Obtiene eventos de un contrato
   */
  async getEvents(contractAddress: string, eventName: string, fromBlock?: number, toBlock?: number): Promise<any[]> {
    try {
      return await this.eventManager.getEvents(contractAddress, eventName, fromBlock, toBlock)
    } catch (error) {
      this.logger.error(`Failed to get events for ${eventName}:`, error)
      throw error
    }
  }

  /**
   * Obtiene el estado de salud del Blockchain Manager
   */
  async getHealthStatus(): Promise<BlockchainStatus> {
    try {
      const provider = this.getCurrentProvider()
      if (!provider) {
        return {
          isConnected: false,
          currentNetwork: 'disconnected',
          blockNumber: 0,
          gasPrice: '0',
          balance: '0',
          pendingTransactions: 0
        }
      }

      const signer = this.getCurrentSigner()
      const address = signer ? await signer.getAddress() : null
      
      return {
        isConnected: true,
        currentNetwork: (await this.getCurrentNetwork()).name,
        blockNumber: await this.getCurrentBlockNumber(),
        gasPrice: await this.getCurrentGasPrice(),
        balance: address ? await this.getBalance(address) : '0',
        pendingTransactions: this.transactionManager.getPendingTransactions().length
      }
    } catch (error) {
      this.logger.error('Failed to get health status:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas del Blockchain Manager
   */
  async getStats(): Promise<any> {
    try {
      return {
        networks: await this.networkManager.getStats(),
        contracts: await this.contractManager.getStats(),
        transactions: await this.transactionManager.getStats(),
        events: await this.eventManager.getStats()
      }
    } catch (error) {
      this.logger.error('Failed to get stats:', error)
      throw error
    }
  }

  /**
   * Limpia recursos del Blockchain Manager
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Blockchain Manager...')
      
      await this.networkManager.cleanup()
      await this.contractManager.cleanup()
      await this.transactionManager.cleanup()
      await this.eventManager.cleanup()
      
      this.isInitialized = false
      this.logger.info('Blockchain Manager cleaned up successfully')
    } catch (error) {
      this.logger.error('Failed to cleanup Blockchain Manager:', error)
      throw error
    }
  }

  /**
   * Verifica si el Blockchain Manager está inicializado
   */
  isReady(): boolean {
    return this.isInitialized && this.networkManager.isConnected()
  }
}