/**
 * @fileoverview Tipos y interfaces para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/types
 */

export interface BlockHeader {
  number: number;
  parentHash: string;
  timestamp: number;
  difficulty: string;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  extraData: string;
  nonce: string;
  hash: string;
}

export interface Block {
  header: BlockHeader;
  transactions: Transaction[];
  hash: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  nonce: number;
  gasLimit: string;
  gasPrice: string;
  timestamp: number;
  signature?: string;
}

export interface Wallet {
  address: string;
  privateKey: string;
  publicKey: string;
  balance: string;
  nonce: number;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: 'MODEL_3D' | 'TEXTURE' | 'ANIMATION' | 'SOUND';
  owner: string;
  metadata: any;
  ipfsHash: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  allowDownload: boolean;
  allowModification: boolean;
  allowCommercialUse: boolean;
  price: string;
  tags: string[];
}

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  reputation: number;
  assets: string[];
  metaverses: string[];
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketplace: boolean;
  social: boolean;
  updates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  assetVisibility: 'public' | 'friends' | 'private';
  showBalance: boolean;
  showActivity: boolean;
}

export interface Metaverse {
  id: string;
  name: string;
  description: string;
  creator: string;
  worldData: any;
  assets: string[];
  users: string[];
  settings: MetaverseSettings;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  maxUsers: number;
  currentUsers: number;
}

export interface MetaverseSettings {
  physics: PhysicsSettings;
  graphics: GraphicsSettings;
  networking: NetworkingSettings;
  economy: EconomySettings;
}

export interface PhysicsSettings {
  gravity: number;
  collisionDetection: boolean;
  particleSystem: boolean;
  fluidSimulation: boolean;
}

export interface GraphicsSettings {
  renderDistance: number;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  antiAliasing: boolean;
  rayTracing: boolean;
}

export interface NetworkingSettings {
  maxLatency: number;
  compression: boolean;
  encryption: boolean;
  peerToPeer: boolean;
}

export interface EconomySettings {
  currency: string;
  inflationRate: number;
  transactionFee: number;
  marketplaceEnabled: boolean;
}

export interface SmartContract {
  address: string;
  name: string;
  abi: any[];
  bytecode: string;
  owner: string;
  balance: string;
  methods: ContractMethod[];
  events: ContractEvent[];
  createdAt: number;
}

export interface ContractMethod {
  name: string;
  inputs: ContractParameter[];
  outputs: ContractParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  payable: boolean;
}

export interface ContractParameter {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractEvent {
  name: string;
  inputs: ContractParameter[];
  anonymous: boolean;
}

export interface ConsensusNode {
  address: string;
  publicKey: string;
  stake: string;
  reputation: number;
  isActive: boolean;
  lastBlock: number;
  uptime: number;
}

export interface NetworkPeer {
  address: string;
  port: number;
  version: string;
  lastSeen: number;
  isConnected: boolean;
  latency: number;
}

export interface ChainState {
  currentBlock: number;
  totalTransactions: number;
  totalAssets: number;
  totalUsers: number;
  totalMetaverses: number;
  totalSupply: string;
  circulatingSupply: string;
  burnedSupply: string;
  averageBlockTime: number;
  networkHashrate: string;
  difficulty: string;
  gasPrice: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
  cumulativeGasUsed: string;
  status: boolean;
  logs: Log[];
  contractAddress?: string;
}

export interface Log {
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

export interface EventFilter {
  fromBlock?: number;
  toBlock?: number;
  address?: string;
  topics?: string[];
}

export interface BlockFilter {
  fromBlock?: number;
  toBlock?: number;
  address?: string;
  topics?: string[];
}

export interface PendingTransactionFilter {
  from?: string;
  to?: string;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface FeeHistory {
  oldestBlock: number;
  baseFeePerGas: string[];
  gasUsedRatio: number[];
  reward: string[][];
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  nonce: number;
  transactionCount: number;
  assets: string[];
  metaverses: string[];
}

export interface AssetTransfer {
  from: string;
  to: string;
  assetId: string;
  amount: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface MetaverseJoin {
  user: string;
  metaverse: string;
  timestamp: number;
  sessionId: string;
  transactionHash: string;
}

export interface UserActivity {
  type: 'asset_created' | 'asset_transferred' | 'metaverse_joined' | 'transaction_sent';
  user: string;
  data: any;
  timestamp: number;
  transactionHash?: string;
}

export interface MarketOrder {
  id: string;
  seller: string;
  assetId: string;
  price: string;
  quantity: string;
  orderType: 'sell' | 'buy';
  status: 'active' | 'filled' | 'cancelled';
  createdAt: number;
  filledAt?: number;
  transactionHash: string;
}

export interface MarketTrade {
  id: string;
  orderId: string;
  buyer: string;
  seller: string;
  assetId: string;
  price: string;
  quantity: string;
  timestamp: number;
  transactionHash: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
  canceled: boolean;
  actions: GovernanceAction[];
  createdAt: number;
}

export interface GovernanceAction {
  target: string;
  value: string;
  data: string;
  description: string;
}

export interface GovernanceVote {
  proposalId: string;
  voter: string;
  support: boolean;
  weight: string;
  reason?: string;
  transactionHash: string;
  timestamp: number;
}

export interface StakingInfo {
  staker: string;
  amount: string;
  startTime: number;
  endTime?: number;
  rewards: string;
  isActive: boolean;
  validatorAddress?: string;
}

export interface ValidatorInfo {
  address: string;
  name: string;
  description: string;
  website?: string;
  commission: number;
  totalStake: string;
  selfStake: string;
  delegatorCount: number;
  isActive: boolean;
  uptime: number;
  lastBlock: number;
}

export interface Delegation {
  delegator: string;
  validator: string;
  amount: string;
  startTime: number;
  endTime?: number;
  rewards: string;
  isActive: boolean;
}

export interface RewardInfo {
  validator: string;
  delegator: string;
  amount: string;
  period: number;
  timestamp: number;
  transactionHash: string;
}

export interface ChainMetrics {
  blocksPerSecond: number;
  transactionsPerSecond: number;
  averageBlockSize: number;
  averageGasUsed: number;
  networkUtilization: number;
  activeValidators: number;
  totalStaked: string;
  inflationRate: number;
  circulatingSupply: string;
  marketCap: string;
}

export interface ErrorInfo {
  code: number;
  message: string;
  data?: any;
}

export interface RpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: any[];
}

export interface RpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: ErrorInfo;
}

export interface SubscriptionMessage {
  jsonrpc: '2.0';
  method: string;
  params: {
    subscription: string;
    result: any;
  };
}

export type EventType = 
  | 'block'
  | 'transaction'
  | 'asset'
  | 'user'
  | 'metaverse'
  | 'market'
  | 'governance'
  | 'staking';

export interface EventSubscription {
  id: string;
  type: EventType;
  filter: any;
  callback: (data: any) => void;
  isActive: boolean;
}

export interface ChainConfig {
  name: string;
  symbol: string;
  chainId: number;
  blockTime: number;
  maxBlockSize: number;
  maxGasLimit: number;
  consensus: 'pos' | 'dpos' | 'pbft';
  validators: string[];
  genesisBlock: Block;
  networkPort: number;
  rpcPort: number;
  wsPort: number;
  maxValidators: number;
  minStake: string;
  blockReward: string;
  transactionFee: string;
  inflationRate: number;
  maxSupply: string;
}

export interface GenesisConfig {
  chainId: number;
  blockTime: number;
  validators: string[];
  initialBalances: { [address: string]: string };
  initialAssets: Asset[];
  initialUsers: User[];
  initialMetaverses: Metaverse[];
  initialContracts: SmartContract[];
}

export interface NodeConfig {
  host: string;
  port: number;
  rpcPort: number;
  wsPort: number;
  dataDir: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxPeers: number;
  syncMode: 'full' | 'light' | 'fast';
  enableMining: boolean;
  enableRpc: boolean;
  enableWs: boolean;
  corsOrigins: string[];
  apiKeys: string[];
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgres' | 'mysql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  subscribers: string[];
}

export interface CacheConfig {
  type: 'memory' | 'redis';
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  ttl: number;
  maxSize: number;
}

export interface SecurityConfig {
  enableEncryption: boolean;
  encryptionKey: string;
  enableRateLimit: boolean;
  rateLimitWindow: number;
  rateLimitMax: number;
  enableCors: boolean;
  corsOrigins: string[];
  enableHttps: boolean;
  sslCert?: string;
  sslKey?: string;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  metricsPort: number;
  enableHealthCheck: boolean;
  healthCheckPort: number;
  enableLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logFile: string;
  enableAlerts: boolean;
  alertEmail?: string;
  alertWebhook?: string;
} 