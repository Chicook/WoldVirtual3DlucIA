// Tipos principales para el sistema de blockchain

export interface BlockchainConfig {
  ethereum: EthereumConfig;
  polygon: PolygonConfig;
  nft: NFTConfig;
  defi: DeFiConfig;
  wallet: WalletConfig;
  contracts: ContractAddresses;
  abis: ContractABIs;
  gas: GasConfig;
  security: SecurityConfig;
}

export interface EthereumConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  gasLimit: number;
  gasPrice: string;
  confirmations: number;
}

export interface PolygonConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  gasLimit: number;
  gasPrice: string;
  confirmations: number;
}

export interface NFTConfig {
  marketplaceAddress: string;
  collectionAddress: string;
  royaltyPercentage: number;
  maxSupply: number;
  baseURI: string;
  metadataFormat: 'ipfs' | 'arweave' | 'http';
}

export interface DeFiConfig {
  routerAddress: string;
  factoryAddress: string;
  wethAddress: string;
  slippageTolerance: number;
  deadlineMinutes: number;
  maxGasPrice: string;
}

export interface WalletConfig {
  supportedWallets: string[];
  autoConnect: boolean;
  rememberConnection: boolean;
  defaultNetwork: string;
  rpcUrls: Record<string, string>;
}

export interface ContractAddresses {
  metaverseToken: string;
  nftMarketplace: string;
  defiProtocol: string;
  stakingContract: string;
  governanceContract: string;
  treasuryContract: string;
}

export interface ContractABIs {
  metaverseToken: any[];
  nftMarketplace: any[];
  defiProtocol: any[];
  stakingContract: any[];
  governanceContract: any[];
  treasuryContract: any[];
}

export interface GasConfig {
  defaultGasLimit: number;
  maxGasLimit: number;
  gasPriceStrategy: 'low' | 'medium' | 'high' | 'custom';
  customGasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface SecurityConfig {
  requireConfirmation: boolean;
  maxTransactionValue: string;
  blacklistedAddresses: string[];
  whitelistedTokens: string[];
  rateLimit: {
    maxTransactionsPerMinute: number;
    maxTransactionsPerHour: number;
  };
}

// Tipos de transacciones

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  data: string;
  chainId: number;
  status: TransactionStatus;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  confirmations: number;
  error?: string;
  metadata?: TransactionMetadata;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TransactionMetadata {
  type: 'transfer' | 'swap' | 'mint' | 'stake' | 'governance';
  tokenSymbol?: string;
  nftId?: string;
  swapDetails?: SwapDetails;
  stakeDetails?: StakeDetails;
}

export interface SwapDetails {
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  slippage: number;
  path: string[];
}

export interface StakeDetails {
  token: string;
  amount: string;
  duration: number;
  rewards: string;
}

// Tipos de tokens

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  network: string;
  logo?: string;
  price?: string;
  marketCap?: string;
  volume24h?: string;
  change24h?: string;
  isStablecoin: boolean;
  isWrapped: boolean;
  metadata?: TokenMetadata;
}

export interface TokenMetadata {
  website?: string;
  whitepaper?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
  };
  description?: string;
  tags?: string[];
}

// Tipos de NFTs

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  tokenId: string;
  contractAddress: string;
  owner: string;
  creator: string;
  network: string;
  metadata: NFTMetadata;
  attributes: NFTAttribute[];
  royalties: number;
  price?: string;
  isListed: boolean;
  isStaked: boolean;
  stakingRewards?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  max_value?: number;
}

// Tipos de contratos inteligentes

export interface SmartContract {
  name: string;
  address: string;
  abi: any[];
  network: string;
  version: string;
  verified: boolean;
  creator: string;
  deployedAt: number;
  metadata?: ContractMetadata;
}

export interface ContractMetadata {
  description?: string;
  website?: string;
  documentation?: string;
  github?: string;
  audit?: string;
  functions: ContractFunction[];
  events: ContractEvent[];
}

export interface ContractFunction {
  name: string;
  inputs: ContractParameter[];
  outputs: ContractParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  payable: boolean;
  constant: boolean;
}

export interface ContractEvent {
  name: string;
  inputs: ContractParameter[];
  anonymous: boolean;
}

export interface ContractParameter {
  name: string;
  type: string;
  indexed?: boolean;
  components?: ContractParameter[];
}

// Tipos de wallet

export interface WalletInfo {
  address: string;
  network: string;
  chainId: number;
  balance: string;
  isConnected: boolean;
  provider: string;
  ensName?: string;
  avatar?: string;
  metadata?: WalletMetadata;
}

export interface WalletMetadata {
  name?: string;
  email?: string;
  website?: string;
  description?: string;
  icon?: string;
  supportedNetworks: string[];
  features: string[];
}

// Tipos de DeFi

export interface LiquidityPool {
  address: string;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalSupply: string;
  fee: number;
  apr: string;
  volume24h: string;
  tvl: string;
}

export interface StakingPool {
  address: string;
  token: string;
  totalStaked: string;
  totalRewards: string;
  apr: string;
  lockPeriod: number;
  minStake: string;
  maxStake: string;
  rewardsToken: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  forVotes: string;
  againstVotes: string;
  startTime: number;
  endTime: number;
  executed: boolean;
  canceled: boolean;
  state: ProposalState;
  actions: GovernanceAction[];
}

export enum ProposalState {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  DEFEATED = 'defeated',
  SUCCEEDED = 'succeeded',
  QUEUED = 'queued',
  EXPIRED = 'expired',
  EXECUTED = 'executed'
}

export interface GovernanceAction {
  target: string;
  value: string;
  signature: string;
  data: string;
}

// Tipos de eventos

export interface BlockchainEvent {
  type: string;
  data: any;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface TokenTransferEvent extends BlockchainEvent {
  type: 'TokenTransfer';
  data: {
    from: string;
    to: string;
    value: string;
    token: string;
  };
}

export interface NFTTransferEvent extends BlockchainEvent {
  type: 'NFTTransfer';
  data: {
    from: string;
    to: string;
    tokenId: string;
    contract: string;
  };
}

export interface SwapEvent extends BlockchainEvent {
  type: 'Swap';
  data: {
    sender: string;
    amountIn: string;
    amountOut: string;
    path: string[];
  };
}

// Tipos de configuración de red

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number;
  gasLimit: number;
  gasPrice: string;
}

// Tipos de errores

export interface BlockchainError {
  code: string;
  message: string;
  details?: any;
  transactionHash?: string;
  blockNumber?: number;
}

export enum ErrorCodes {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  USER_REJECTED = 'USER_REJECTED',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  GAS_ESTIMATION_FAILED = 'GAS_ESTIMATION_FAILED',
  SLIPPAGE_TOO_HIGH = 'SLIPPAGE_TOO_HIGH',
  POOL_NOT_FOUND = 'POOL_NOT_FOUND',
  NFT_NOT_FOUND = 'NFT_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

// Tipos de utilidad

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  totalCost: string;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  value: string;
  allowance: string;
}

export interface NFTBalance {
  nft: NFT;
  balance: string;
  value: string;
}

export interface Portfolio {
  address: string;
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  totalValue: string;
  change24h: string;
  lastUpdated: number;
}

// Tipos de configuración de seguridad

export interface SecuritySettings {
  requireConfirmation: boolean;
  maxTransactionValue: string;
  allowedTokens: string[];
  blockedAddresses: string[];
  rateLimit: {
    maxTransactionsPerMinute: number;
    maxTransactionsPerHour: number;
  };
  autoApprove: boolean;
  confirmationsRequired: number;
}

// Tipos de análisis y métricas

export interface TransactionAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: string;
  averageGasUsed: string;
  averageGasPrice: string;
  mostUsedTokens: string[];
  mostActiveHours: number[];
  transactionTypes: Record<string, number>;
}

export interface NetworkAnalytics {
  network: string;
  totalUsers: number;
  totalTransactions: number;
  totalVolume: string;
  averageGasPrice: string;
  blockHeight: number;
  difficulty: string;
  hashRate: string;
  activeAddresses: number;
} 