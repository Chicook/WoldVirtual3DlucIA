// Tipos básicos para el sistema blockchain

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  nonce: number;
  data?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  change24h?: number;
}

export interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  owner: string;
  creator: string;
  name: string;
  description: string;
  image: string;
  metadata: any;
  attributes?: NFTAttribute[];
  rarity?: string;
  price?: string;
  lastSoldPrice?: string;
  lastSoldDate?: number;
  mintDate: number;
  transactionHash: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity?: number;
}

export interface SmartContract {
  address: string;
  name: string;
  abi: any[];
  bytecode: string;
  creator: string;
  creationDate: number;
  verified: boolean;
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

export interface WalletInfo {
  address: string;
  balance: string;
  nonce: number;
  chainId: number;
  network: string;
  isConnected: boolean;
  provider: string;
}

export interface BlockchainConfig {
  ethereum: EthereumConfig;
  nft: NFTConfig;
  defi: DeFiConfig;
  governance: GovernanceConfig;
  bridges: BridgeConfig;
}

export interface EthereumConfig {
  rpcUrl: string;
  chainId: number;
  networkName: string;
  blockExplorer: string;
  gasLimit: number;
  gasPrice: string;
  confirmations: number;
}

export interface NFTConfig {
  marketplaceAddress: string;
  royaltyPercentage: number;
  maxSupply: number;
  mintPrice: string;
  metadataBaseURI: string;
}

export interface DeFiConfig {
  protocols: DeFiProtocol[];
  liquidityPools: LiquidityPool[];
  yieldFarming: YieldFarmingConfig;
  staking: StakingConfig;
}

export interface DeFiProtocol {
  name: string;
  address: string;
  type: 'lending' | 'dex' | 'yield' | 'derivatives';
  apy?: number;
  tvl?: number;
  risk: 'low' | 'medium' | 'high';
}

export interface LiquidityPool {
  address: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  fee: number;
  apy: number;
}

export interface YieldFarmingConfig {
  farms: Farm[];
  rewards: Reward[];
  lockPeriod: number;
  minStake: string;
}

export interface Farm {
  id: string;
  name: string;
  stakingToken: string;
  rewardToken: string;
  totalStaked: string;
  rewardRate: string;
  apy: number;
  lockPeriod: number;
}

export interface Reward {
  token: string;
  amount: string;
  rate: string;
  endTime: number;
}

export interface StakingConfig {
  minStake: string;
  lockPeriod: number;
  earlyWithdrawalFee: number;
  rewards: Reward[];
}

export interface GovernanceConfig {
  tokenAddress: string;
  timelockAddress: string;
  governorAddress: string;
  proposalThreshold: string;
  votingPeriod: number;
  quorumVotes: string;
  executionDelay: number;
}

export interface GovernanceProposal {
  id: string;
  proposer: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  startBlock: number;
  endBlock: number;
  description: string;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
  canceled: boolean;
  state: 'pending' | 'active' | 'canceled' | 'defeated' | 'succeeded' | 'queued' | 'expired' | 'executed';
}

export interface BridgeConfig {
  bridges: CrossChainBridge[];
  supportedChains: SupportedChain[];
  fees: BridgeFee[];
}

export interface CrossChainBridge {
  name: string;
  address: string;
  supportedTokens: string[];
  minAmount: string;
  maxAmount: string;
  fee: number;
  estimatedTime: number;
  security: 'low' | 'medium' | 'high';
}

export interface SupportedChain {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface BridgeFee {
  token: string;
  amount: string;
  percentage: number;
}

// Tipos para eventos blockchain
export interface BlockchainEvent {
  type: 'transaction' | 'nft' | 'defi' | 'governance' | 'bridge';
  data: any;
  timestamp: number;
  blockNumber: number;
}

// Tipos para análisis y métricas
export interface BlockchainMetrics {
  totalTransactions: number;
  totalVolume: string;
  activeUsers: number;
  totalNFTs: number;
  totalValueLocked: string;
  averageGasPrice: string;
  blockTime: number;
  networkHashrate?: string;
}

// Tipos para seguridad
export interface SecurityConfig {
  maxSlippage: number;
  maxGasPrice: string;
  whitelistedTokens: string[];
  blacklistedAddresses: string[];
  requireConfirmation: boolean;
  minConfirmations: number;
}

// Tipos para integración con metaverso
export interface MetaverseIntegration {
  virtualLand: VirtualLand;
  avatarAssets: AvatarAsset[];
  virtualCurrency: VirtualCurrency;
  marketplace: Marketplace;
}

export interface VirtualLand {
  tokenId: string;
  coordinates: { x: number; y: number };
  size: { width: number; height: number };
  owner: string;
  price: string;
  features: string[];
  development: DevelopmentStatus;
}

export interface AvatarAsset {
  id: string;
  type: 'clothing' | 'accessory' | 'weapon' | 'vehicle' | 'pet';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: AvatarAttribute[];
  equipped: boolean;
  owner: string;
}

export interface AvatarAttribute {
  name: string;
  value: number;
  maxValue: number;
}

export interface VirtualCurrency {
  symbol: string;
  name: string;
  totalSupply: string;
  circulatingSupply: string;
  price: number;
  marketCap: number;
  inflationRate: number;
}

export interface Marketplace {
  address: string;
  totalSales: number;
  totalVolume: string;
  activeListings: number;
  fees: {
    listing: number;
    transaction: number;
    royalty: number;
  };
}

export interface DevelopmentStatus {
  level: number;
  buildings: Building[];
  resources: Resource[];
  population: number;
  income: string;
}

export interface Building {
  id: string;
  type: string;
  level: number;
  position: { x: number; y: number };
  production: string;
  maintenance: string;
}

export interface Resource {
  type: string;
  amount: string;
  production: string;
  consumption: string;
} 