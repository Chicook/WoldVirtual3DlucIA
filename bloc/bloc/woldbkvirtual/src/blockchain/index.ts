/**
 * @fileoverview Blockchain principal de WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/index
 */

export { WoldVirtualChain } from './WoldVirtualChain';
export { ConsensusEngine } from './consensus/ConsensusEngine';
export { StateManager } from './state/StateManager';
export { NetworkManager } from './network/NetworkManager';
export { AssetRegistry } from './contracts/AssetRegistry';
export { UserRegistry } from './contracts/UserRegistry';
export { MetaverseRegistry } from './contracts/MetaverseRegistry';
export { WCVToken } from './contracts/WCVToken';
export { Bridge } from './contracts/Bridge';

// Exportar tipos
export * from './types';

// Exportar logger
export { Logger, LogLevel } from '../utils/logger';

// Configuración por defecto de la blockchain
export const DEFAULT_CHAIN_CONFIG = {
  name: 'WoldVirtual3D',
  symbol: 'WVC',
  chainId: 1337,
  blockTime: 15, // 15 segundos
  maxBlockSize: 1000,
  maxGasLimit: 30000000,
  consensus: 'pos' as const,
  validators: [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0x8ba1f109551bD432803012645Hac136c772c3c7b',
    '0x147B8eb97fD247D06C4006D269c90C1908Fb5D54'
  ],
  networkPort: 8545,
  rpcPort: 8546,
  wsPort: 8547,
  maxValidators: 21,
  minStake: '1000000000000000000000', // 1000 WVC
  blockReward: '10000000000000000000', // 10 WVC
  transactionFee: '1000000000000000000', // 1 WVC
  inflationRate: 0.02, // 2%
  maxSupply: '1000000000000000000000000' // 1M WVC
};

// Bloque génesis por defecto
export const DEFAULT_GENESIS_BLOCK = {
  header: {
    number: 0,
    parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: Date.now(),
    difficulty: '1000000',
    gasLimit: '30000000',
    gasUsed: '0',
    miner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    extraData: 'WoldVirtual3D Genesis Block',
    nonce: '0',
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000'
  },
  transactions: [],
  hash: '0x0000000000000000000000000000000000000000000000000000000000000000'
};

/**
 * Clase principal para crear y gestionar la blockchain
 */
export class WoldVirtualBlockchain {
  private chain: any;
  private isInitialized: boolean = false;

  constructor() {
    // La inicialización se hace de forma lazy
  }

  /**
   * Inicializar la blockchain
   */
  async initialize(config?: any): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Blockchain ya está inicializada');
    }

    const finalConfig = {
      ...DEFAULT_CHAIN_CONFIG,
      ...config,
      genesisBlock: config?.genesisBlock || DEFAULT_GENESIS_BLOCK
    };

    // Importar dinámicamente para evitar problemas de dependencias
    const { WoldVirtualChain } = await import('./WoldVirtualChain');
    
    this.chain = new WoldVirtualChain(finalConfig);
    await this.chain.start();
    
    this.isInitialized = true;
  }

  /**
   * Obtener instancia de la blockchain
   */
  getChain(): any {
    if (!this.isInitialized) {
      throw new Error('Blockchain no está inicializada. Llama a initialize() primero.');
    }
    return this.chain;
  }

  /**
   * Detener la blockchain
   */
  async stop(): Promise<void> {
    if (this.chain) {
      await this.chain.stop();
      this.isInitialized = false;
    }
  }

  /**
   * Verificar si está inicializada
   */
  isChainInitialized(): boolean {
    return this.isInitialized;
  }
}

/**
 * Función de utilidad para crear una blockchain rápidamente
 */
export async function createBlockchain(config?: any): Promise<WoldVirtualBlockchain> {
  const blockchain = new WoldVirtualBlockchain();
  await blockchain.initialize(config);
  return blockchain;
}

/**
 * Función de utilidad para crear una wallet
 */
export function createWallet(): any {
  // Simulación de wallet para desarrollo
  const address = '0x' + Math.random().toString(16).slice(2, 42);
  const privateKey = '0x' + Math.random().toString(16).slice(2, 66);
  
  return {
    address,
    privateKey,
    publicKey: '0x' + Math.random().toString(16).slice(2, 66),
    balance: '0',
    nonce: 0
  };
}

/**
 * Función de utilidad para validar dirección
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Función de utilidad para formatear balance
 */
export function formatBalance(balance: string, decimals: number = 18): string {
  const num = parseFloat(balance) / Math.pow(10, decimals);
  return num.toFixed(4);
}

/**
 * Función de utilidad para parsear balance
 */
export function parseBalance(balance: string, decimals: number = 18): string {
  const num = parseFloat(balance) * Math.pow(10, decimals);
  return num.toString();
}

/**
 * Constantes de la blockchain
 */
export const BLOCKCHAIN_CONSTANTS = {
  GAS_LIMIT: {
    TRANSFER: 21000,
    CONTRACT_CALL: 100000,
    CONTRACT_DEPLOY: 500000
  },
  GAS_PRICE: {
    LOW: '20000000000', // 20 gwei
    MEDIUM: '50000000000', // 50 gwei
    HIGH: '100000000000' // 100 gwei
  },
  BLOCK_TIME: 15, // segundos
  MAX_BLOCK_SIZE: 1000,
  MAX_VALIDATORS: 21,
  MIN_STAKE: '1000000000000000000000', // 1000 WVC
  BLOCK_REWARD: '10000000000000000000' // 10 WVC
};

/**
 * Tipos de transacciones soportadas
 */
export const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  CONTRACT_CALL: 'contract_call',
  CONTRACT_DEPLOY: 'contract_deploy',
  ASSET_REGISTER: 'asset_register',
  ASSET_TRANSFER: 'asset_transfer',
  USER_REGISTER: 'user_register',
  METAVERSE_CREATE: 'metaverse_create',
  METAVERSE_JOIN: 'metaverse_join'
};

/**
 * Estados de la blockchain
 */
export const BLOCKCHAIN_STATES = {
  INITIALIZING: 'initializing',
  RUNNING: 'running',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  ERROR: 'error'
};

/**
 * Eventos de la blockchain
 */
export const BLOCKCHAIN_EVENTS = {
  BLOCK_MINED: 'block_mined',
  TRANSACTION_PENDING: 'transaction_pending',
  TRANSACTION_CONFIRMED: 'transaction_confirmed',
  PEER_CONNECTED: 'peer_connected',
  PEER_DISCONNECTED: 'peer_disconnected',
  CONSENSUS_CHANGED: 'consensus_changed',
  ERROR: 'error'
};

// Servicios
export { default as BSCIntegration } from './services/BSCIntegration';

export default WoldVirtualBlockchain; 