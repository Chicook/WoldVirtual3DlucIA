// Tipos para servicios blockchain
export interface EthereumConfig {
  rpcUrl: string;
  chainId: number;
  privateKey?: string;
  gasLimit: number;
  gasPrice: string;
}

export interface PolygonConfig {
  rpcUrl: string;
  chainId: number;
  privateKey?: string;
  gasLimit: number;
  gasPrice: string;
}

export interface DeFiConfig {
  networks: Record<string, string>;
  privateKeys: Record<string, string>;
  contracts: Record<string, string>;
  gasLimit: number;
}

export interface WalletConfig {
  networks: Record<string, string>;
  wallets: Record<string, WalletInfo>;
  encryptionKey?: string;
}

export interface TransactionStatus {
  PENDING: 'pending';
  CONFIRMED: 'confirmed';
  FAILED: 'failed';
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  gasCost: string;
  estimatedTime: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  externalUrl?: string;
  animationUrl?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity?: number;
}

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  metadata: NFTMetadata;
  owner: string;
  price?: string;
  isForSale: boolean;
  createdAt: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  status: TransactionStatus;
  timestamp: number;
  network: string;
  type: 'transfer' | 'swap' | 'mint' | 'stake' | 'governance';
  error?: string;
  metadata?: TransactionMetadata;
}

export interface TransactionMetadata {
  description?: string;
  tags?: string[];
  category?: string;
  customData?: Record<string, any>;
}

export interface PoolInfo {
  id: string;
  name: string;
  token0: string;
  token1: string;
  liquidity: string;
  volume24h: string;
  apy: string;
  tvl: string;
  network: string;
}

export interface StakingInfo {
  id: string;
  token: string;
  stakedAmount: string;
  rewards: string;
  apy: string;
  lockPeriod: string;
  unlockDate: number;
  network: string;
}

export interface LendingInfo {
  id: string;
  token: string;
  suppliedAmount: string;
  borrowedAmount: string;
  supplyApy: string;
  borrowApy: string;
  collateralRatio: string;
  healthFactor: string;
  network: string;
}

export interface YieldInfo {
  id: string;
  pool: string;
  stakedAmount: string;
  rewards: string;
  apy: string;
  multiplier: string;
  endDate: number;
  network: string;
}

export interface WalletInfo {
  name: string;
  address: string;
  network: string;
  balance: string;
  isEncrypted: boolean;
  createdAt: number;
}

export interface NetworkInfo {
  chainId: bigint;
  name: string;
  currentBlock: number;
  gasPrice: string;
  rpcUrl: string;
}

export interface BlockchainStats {
  totalTransactions: number;
  totalVolume: string;
  activeUsers: number;
  averageGasPrice: string;
  networkLoad: number;
  timestamp: number;
}

export interface SmartContract {
  address: string;
  name: string;
  abi: any[];
  bytecode: string;
  deployedAt: number;
  network: string;
  verified: boolean;
}

export interface ContractCall {
  contractAddress: string;
  method: string;
  params: any[];
  value?: string;
  gasLimit?: number;
  gasPrice?: string;
}

export interface ContractEvent {
  contractAddress: string;
  eventName: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface DeFiPosition {
  id: string;
  type: 'liquidity' | 'staking' | 'lending' | 'yield';
  protocol: string;
  tokens: string[];
  amounts: string[];
  value: string;
  apy: string;
  rewards: string;
  network: string;
  createdAt: number;
  lastUpdated: number;
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
  network: string;
}

export interface GovernanceVote {
  proposalId: string;
  voter: string;
  support: boolean;
  reason?: string;
  weight: string;
  timestamp: number;
}

export interface CrossChainBridge {
  id: string;
  sourceChain: string;
  targetChain: string;
  sourceToken: string;
  targetToken: string;
  amount: string;
  fee: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceTx: string;
  targetTx?: string;
  createdAt: number;
  completedAt?: number;
}

export interface OracleData {
  id: string;
  oracle: string;
  data: any;
  timestamp: number;
  signature: string;
  network: string;
}

export interface InsurancePolicy {
  id: string;
  user: string;
  protocol: string;
  coverage: string;
  premium: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'expired' | 'claimed';
  network: string;
}

export interface SyntheticAsset {
  id: string;
  name: string;
  symbol: string;
  collateral: string;
  collateralRatio: string;
  price: string;
  supply: string;
  network: string;
}

export interface Derivative {
  id: string;
  type: 'future' | 'option' | 'perpetual';
  underlying: string;
  strikePrice: string;
  expiryDate: number;
  size: string;
  leverage: string;
  position: 'long' | 'short';
  pnl: string;
  network: string;
}

export interface BlockchainError {
  code: string;
  message: string;
  details?: any;
  transactionHash?: string;
  blockNumber?: number;
  timestamp: number;
}

export interface BlockchainHealth {
  network: string;
  isHealthy: boolean;
  lastBlock: number;
  blockTime: number;
  gasPrice: string;
  pendingTransactions: number;
  timestamp: number;
}

export interface BlockchainMetrics {
  totalTransactions: number;
  uniqueAddresses: number;
  totalVolume: string;
  averageGasPrice: string;
  blockTime: number;
  networkLoad: number;
  timestamp: number;
} 