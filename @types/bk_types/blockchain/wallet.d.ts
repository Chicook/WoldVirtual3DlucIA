/**
 * @fileoverview Tipos para wallets y conexiones blockchain del metaverso
 * @module @types/blockchain/wallet
 */

// ============================================================================
// TIPOS BÁSICOS DE WALLET
// ============================================================================

/**
 * Identificador único de una wallet
 */
export type WalletId = string;

/**
 * Dirección de wallet
 */
export type WalletAddress = string;

/**
 * Tipos de wallets soportadas
 */
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'wallet_connect',
  COINBASE_WALLET = 'coinbase_wallet',
  TRUST_WALLET = 'trust_wallet',
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare',
  BRAVE_WALLET = 'brave_wallet',
  CUSTOM = 'custom'
}

/**
 * Estados de conexión de wallet
 */
export enum WalletConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  CONNECTING_FAILED = 'connecting_failed',
  WRONG_NETWORK = 'wrong_network',
  LOCKED = 'locked'
}

/**
 * Redes blockchain soportadas
 */
export enum BlockchainNetwork {
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  ETHEREUM_GOERLI = 'ethereum_goerli',
  ETHEREUM_SEPOLIA = 'ethereum_sepolia',
  POLYGON_MAINNET = 'polygon_mainnet',
  POLYGON_MUMBAI = 'polygon_mumbai',
  BSC_MAINNET = 'bsc_mainnet',
  BSC_TESTNET = 'bsc_testnet',
  AVALANCHE_MAINNET = 'avalanche_mainnet',
  AVALANCHE_FUJI = 'avalanche_fuji',
  SOLANA_MAINNET = 'solana_mainnet',
  SOLANA_DEVNET = 'solana_devnet',
  ARBITRUM_ONE = 'arbitrum_one',
  ARBITRUM_GOERLI = 'arbitrum_goerli',
  OPTIMISM_MAINNET = 'optimism_mainnet',
  OPTIMISM_GOERLI = 'optimism_goerli'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Wallet del metaverso
 */
export interface Wallet {
  id: WalletId;
  address: WalletAddress;
  type: WalletType;
  network: BlockchainNetwork;
  state: WalletConnectionState;
  
  // Información de la cuenta
  account: WalletAccount;
  
  // Configuración
  config: WalletConfig;
  
  // Métricas
  metrics: WalletMetrics;
  
  // Metadatos
  createdAt: number;
  lastConnected: number;
  lastUsed: number;
}

/**
 * Cuenta de wallet
 */
export interface WalletAccount {
  address: WalletAddress;
  balance: WalletBalance;
  nonce: number;
  isContract: boolean;
  ens?: string;
  avatar?: string;
}

/**
 * Balance de wallet
 */
export interface WalletBalance {
  native: string; // Balance en la criptomoneda nativa (ETH, MATIC, etc.)
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  totalValueUSD: number;
  lastUpdated: number;
}

/**
 * Balance de token
 */
export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  valueUSD: number;
  priceUSD: number;
  logo?: string;
}

/**
 * Balance de NFT
 */
export interface NFTBalance {
  contractAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  balance: string;
  metadata?: NFTMetadata;
  valueUSD?: number;
}

/**
 * Metadatos de NFT
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  attributes?: NFTAttribute[];
  animationUrl?: string;
  background_color?: string;
  traits?: Record<string, any>;
}

/**
 * Atributo de NFT
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
  max_value?: number;
}

/**
 * Configuración de wallet
 */
export interface WalletConfig {
  autoConnect: boolean;
  defaultNetwork: BlockchainNetwork;
  supportedNetworks: BlockchainNetwork[];
  gasEstimation: GasEstimationConfig;
  transactionDefaults: TransactionDefaults;
  security: WalletSecurity;
  ui: WalletUIConfig;
}

/**
 * Configuración de estimación de gas
 */
export interface GasEstimationConfig {
  enabled: boolean;
  maxGasPrice: string;
  maxGasLimit: number;
  priorityFee: string;
  slippageTolerance: number;
}

/**
 * Configuración por defecto de transacciones
 */
export interface TransactionDefaults {
  gasLimit: number;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
}

/**
 * Configuración de seguridad
 */
export interface WalletSecurity {
  requireConfirmation: boolean;
  autoApprove: boolean;
  maxTransactionValue: string;
  whitelistedContracts: string[];
  blacklistedContracts: string[];
  phishingProtection: boolean;
}

/**
 * Configuración de UI
 */
export interface WalletUIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  showBalances: boolean;
  showPrices: boolean;
  notifications: boolean;
}

/**
 * Métricas de wallet
 */
export interface WalletMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: string;
  averageGasUsed: number;
  lastTransactionTime?: number;
  connectionCount: number;
  sessionDuration: number;
}

// ============================================================================
// TIPOS DE CONEXIÓN
// ============================================================================

/**
 * Conexión de wallet
 */
export interface WalletConnection {
  wallet: Wallet;
  provider: WalletProvider;
  signer: WalletSigner;
  events: WalletEventEmitter;
  methods: WalletMethods;
}

/**
 * Proveedor de wallet
 */
export interface WalletProvider {
  type: WalletType;
  name: string;
  version: string;
  isConnected: boolean;
  chainId: number;
  accounts: string[];
  
  // Métodos del proveedor
  request: (args: RequestArguments) => Promise<any>;
  send: (method: string, params: any[]) => Promise<any>;
  sendAsync: (request: any, callback: (error: any, response: any) => void) => void;
  
  // Eventos
  on: (eventName: string, handler: (params: any) => void) => void;
  removeListener: (eventName: string, handler: (params: any) => void) => void;
}

/**
 * Argumentos de request
 */
export interface RequestArguments {
  method: string;
  params?: any[];
}

/**
 * Firmante de wallet
 */
export interface WalletSigner {
  address: WalletAddress;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transaction: TransactionRequest) => Promise<string>;
  signTypedData: (domain: TypedDataDomain, types: Record<string, any[]>, value: any) => Promise<string>;
  connect: (provider: WalletProvider) => Promise<void>;
}

/**
 * Solicitud de transacción
 */
export interface TransactionRequest {
  to?: string;
  from?: string;
  data?: string;
  value?: string;
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  chainId?: number;
}

/**
 * Dominio de datos tipados
 */
export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: string;
  salt?: string;
}

/**
 * Emisor de eventos de wallet
 */
export interface WalletEventEmitter {
  on: (event: WalletEvent, handler: WalletEventHandler) => void;
  off: (event: WalletEvent, handler: WalletEventHandler) => void;
  emit: (event: WalletEvent, data: any) => void;
}

/**
 * Eventos de wallet
 */
export enum WalletEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  TRANSACTION = 'transaction',
  ERROR = 'error'
}

/**
 * Manejador de eventos de wallet
 */
export type WalletEventHandler = (data: any) => void;

/**
 * Métodos de wallet
 */
export interface WalletMethods {
  // Conexión
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: BlockchainNetwork) => Promise<void>;
  
  // Información
  getBalance: () => Promise<WalletBalance>;
  getAccount: () => Promise<WalletAccount>;
  getNetwork: () => Promise<BlockchainNetwork>;
  
  // Transacciones
  sendTransaction: (transaction: TransactionRequest) => Promise<TransactionResponse>;
  estimateGas: (transaction: TransactionRequest) => Promise<number>;
  getGasPrice: () => Promise<string>;
  
  // Firmas
  signMessage: (message: string) => Promise<string>;
  signTypedData: (domain: TypedDataDomain, types: Record<string, any[]>, value: any) => Promise<string>;
  
  // Tokens
  getTokenBalance: (contractAddress: string) => Promise<TokenBalance>;
  approveToken: (contractAddress: string, spender: string, amount: string) => Promise<TransactionResponse>;
  
  // NFTs
  getNFTBalance: (contractAddress: string) => Promise<NFTBalance[]>;
  transferNFT: (contractAddress: string, to: string, tokenId: string) => Promise<TransactionResponse>;
}

// ============================================================================
// TIPOS DE TRANSACCIONES
// ============================================================================

/**
 * Respuesta de transacción
 */
export interface TransactionResponse {
  hash: string;
  from: string;
  to?: string;
  data?: string;
  value: string;
  gasLimit: number;
  gasPrice: string;
  nonce: number;
  chainId: number;
  wait: (confirmations?: number) => Promise<TransactionReceipt>;
}

/**
 * Recibo de transacción
 */
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to?: string;
  contractAddress?: string;
  gasUsed: number;
  effectiveGasPrice: string;
  status: number;
  logs: TransactionLog[];
  events: TransactionEvent[];
}

/**
 * Log de transacción
 */
export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}

/**
 * Evento de transacción
 */
export interface TransactionEvent {
  name: string;
  signature: string;
  args: any[];
  address: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

// ============================================================================
// TIPOS DE RED
// ============================================================================

/**
 * Configuración de red blockchain
 */
export interface NetworkConfig {
  id: BlockchainNetwork;
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: NativeCurrency;
  contracts: NetworkContracts;
  features: NetworkFeatures;
}

/**
 * Moneda nativa
 */
export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

/**
 * Contratos de red
 */
export interface NetworkContracts {
  metaverseCore?: string;
  nftMarketplace?: string;
  tokenFactory?: string;
  governance?: string;
  staking?: string;
}

/**
 * Características de red
 */
export interface NetworkFeatures {
  supportsEIP1559: boolean;
  supportsEIP155: boolean;
  supportsEIP1271: boolean;
  supportsEIP712: boolean;
  supportsENS: boolean;
  supportsDeFi: boolean;
  supportsNFTs: boolean;
}

// ============================================================================
// TIPOS DE ERRORES
// ============================================================================

/**
 * Tipos de errores de wallet
 */
export enum WalletErrorType {
  USER_REJECTED = 'user_rejected',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  INSUFFICIENT_GAS = 'insufficient_gas',
  WRONG_NETWORK = 'wrong_network',
  CONNECTION_FAILED = 'connection_failed',
  SIGNATURE_FAILED = 'signature_failed',
  TRANSACTION_FAILED = 'transaction_failed',
  UNKNOWN = 'unknown'
}

/**
 * Error de wallet
 */
export interface WalletError {
  type: WalletErrorType;
  code: number;
  message: string;
  details?: any;
  timestamp: number;
  transactionHash?: string;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de wallet
 */
export interface WalletUtils {
  /**
   * Valida una dirección de wallet
   */
  isValidAddress: (address: string) => boolean;
  
  /**
   * Formatea una dirección para mostrar
   */
  formatAddress: (address: string, start?: number, end?: number) => string;
  
  /**
   * Convierte wei a ether
   */
  weiToEther: (wei: string) => string;
  
  /**
   * Convierte ether a wei
   */
  etherToWei: (ether: string) => string;
  
  /**
   * Calcula el hash de un mensaje
   */
  hashMessage: (message: string) => string;
  
  /**
   * Recupera la dirección desde una firma
   */
  recoverAddress: (message: string, signature: string) => string;
  
  /**
   * Valida una firma
   */
  verifySignature: (message: string, signature: string, address: string) => boolean;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  WalletId,
  WalletAddress,
  Wallet,
  WalletAccount,
  WalletBalance,
  TokenBalance,
  NFTBalance,
  NFTMetadata,
  NFTAttribute,
  WalletConfig,
  GasEstimationConfig,
  TransactionDefaults,
  WalletSecurity,
  WalletUIConfig,
  WalletMetrics,
  WalletConnection,
  WalletProvider,
  RequestArguments,
  WalletSigner,
  TransactionRequest,
  TypedDataDomain,
  WalletEventEmitter,
  WalletMethods,
  TransactionResponse,
  TransactionReceipt,
  TransactionLog,
  TransactionEvent,
  NetworkConfig,
  NativeCurrency,
  NetworkContracts,
  NetworkFeatures,
  WalletError,
  WalletUtils
};

export {
  WalletType,
  WalletConnectionState,
  BlockchainNetwork,
  WalletEvent,
  WalletErrorType
}; 