/**
 * @metaverso/bloc - Blockchain Infrastructure & DeFi Integration
 * 
 * Este módulo proporciona toda la infraestructura blockchain para el metaverso,
 * incluyendo integración con múltiples redes DeFi, smart contracts, y servicios
 * descentralizados.
 */

// Core exports
export * from './core/BlockchainManager'
export * from './core/NetworkManager'
export * from './core/ContractManager'
export * from './core/TransactionManager'
export * from './core/EventManager'

// DeFi integrations
export * from './defi/DeFiManager'
export * from './defi/protocols/UniswapManager'
export * from './defi/protocols/AaveManager'
export * from './defi/protocols/CompoundManager'
export * from './defi/protocols/CurveManager'
export * from './defi/protocols/BalancerManager'
export * from './defi/protocols/SynthetixManager'
export * from './defi/protocols/YearnManager'

// NFT & Metaverse assets
export * from './nfts/NFTManager'
export * from './nfts/MetaverseAssetManager'
export * from './nfts/MarketplaceManager'

// Governance
export * from './governance/GovernanceManager'
export * from './governance/DAOManager'
export * from './governance/VotingManager'

// Utilities
export * from './utils/ChainlinkOracle'
export * from './utils/PriceFeeds'
export * from './utils/GasOptimizer'
export * from './utils/TransactionBuilder'
export * from './utils/ContractDeployer'

// Types
export * from './types/blockchain'
export * from './types/defi'
export * from './types/nft'
export * from './types/governance'
export * from './types/transactions'

// Constants
export * from './constants/networks'
export * from './constants/contracts'
export * from './constants/addresses'
export * from './constants/abis'

// Services
export * from './services/BlockchainService'
export * from './services/DeFiService'
export * from './services/NFTService'
export * from './services/GovernanceService'

// Middleware
export * from './middleware/TransactionMiddleware'
export * from './middleware/EventMiddleware'
export * from './middleware/ValidationMiddleware'

// Configuration
export * from './config/BlockchainConfig'
export * from './config/NetworkConfig'
export * from './config/ContractConfig'

// Main Blockchain Manager Instance
import { BlockchainManager } from './core/BlockchainManager'
import { NetworkManager } from './core/NetworkManager'
import { DeFiManager } from './defi/DeFiManager'
import { NFTManager } from './nfts/NFTManager'
import { GovernanceManager } from './governance/GovernanceManager'

/**
 * Instancia principal del Blockchain Manager
 * Proporciona acceso centralizado a toda la funcionalidad blockchain
 */
export const blockchainManager = new BlockchainManager()

/**
 * Instancia principal del Network Manager
 * Maneja conexiones a múltiples redes blockchain
 */
export const networkManager = new NetworkManager()

/**
 * Instancia principal del DeFi Manager
 * Integra con protocolos DeFi de múltiples redes
 */
export const defiManager = new DeFiManager()

/**
 * Instancia principal del NFT Manager
 * Maneja assets NFT del metaverso
 */
export const nftManager = new NFTManager()

/**
 * Instancia principal del Governance Manager
 * Maneja gobernanza descentralizada
 */
export const governanceManager = new GovernanceManager()

/**
 * Función de inicialización del módulo blockchain
 * Configura todas las conexiones y servicios
 */
export async function initializeBlockchain(config?: any) {
  try {
    console.log('🚀 Initializing Metaverso Blockchain Infrastructure...')
    
    // Initialize network connections
    await networkManager.initialize(config?.networks)
    
    // Initialize blockchain manager
    await blockchainManager.initialize(config?.blockchain)
    
    // Initialize DeFi protocols
    await defiManager.initialize(config?.defi)
    
    // Initialize NFT management
    await nftManager.initialize(config?.nft)
    
    // Initialize governance
    await governanceManager.initialize(config?.governance)
    
    console.log('✅ Blockchain Infrastructure initialized successfully')
    
    return {
      blockchainManager,
      networkManager,
      defiManager,
      nftManager,
      governanceManager
    }
  } catch (error) {
    console.error('❌ Failed to initialize blockchain infrastructure:', error)
    throw error
  }
}

/**
 * Función de limpieza del módulo blockchain
 * Cierra conexiones y libera recursos
 */
export async function cleanupBlockchain() {
  try {
    console.log('🧹 Cleaning up blockchain infrastructure...')
    
    await networkManager.cleanup()
    await blockchainManager.cleanup()
    await defiManager.cleanup()
    await nftManager.cleanup()
    await governanceManager.cleanup()
    
    console.log('✅ Blockchain infrastructure cleaned up successfully')
  } catch (error) {
    console.error('❌ Error during blockchain cleanup:', error)
    throw error
  }
}

/**
 * Función para obtener el estado de salud de la infraestructura blockchain
 */
export async function getBlockchainHealth() {
  return {
    networks: await networkManager.getHealthStatus(),
    blockchain: await blockchainManager.getHealthStatus(),
    defi: await defiManager.getHealthStatus(),
    nft: await nftManager.getHealthStatus(),
    governance: await governanceManager.getHealthStatus()
  }
}

/**
 * Función para obtener estadísticas de la infraestructura blockchain
 */
export async function getBlockchainStats() {
  return {
    networks: await networkManager.getStats(),
    blockchain: await blockchainManager.getStats(),
    defi: await defiManager.getStats(),
    nft: await nftManager.getStats(),
    governance: await governanceManager.getStats()
  }
}

// Default export
export default {
  blockchainManager,
  networkManager,
  defiManager,
  nftManager,
  governanceManager,
  initializeBlockchain,
  cleanupBlockchain,
  getBlockchainHealth,
  getBlockchainStats
}
