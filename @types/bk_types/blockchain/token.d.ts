/**
 * @fileoverview Tipos para tokens y criptomonedas del metaverso
 * @module @types/blockchain/token
 */

// ============================================================================
// TIPOS BÁSICOS DE TOKEN
// ============================================================================

/**
 * Identificador único de un token
 */
export type TokenId = string;

/**
 * Dirección del contrato del token
 */
export type TokenContractAddress = string;

/**
 * Tipos de tokens
 */
export enum TokenType {
  NATIVE = 'native',
  ERC20 = 'erc20',
  ERC1155 = 'erc1155',
  SPL = 'spl',
  BEP20 = 'bep20',
  MATIC = 'matic',
  CUSTOM = 'custom'
}

/**
 * Categorías de tokens
 */
export enum TokenCategory {
  CURRENCY = 'currency',
  UTILITY = 'utility',
  GOVERNANCE = 'governance',
  REWARD = 'reward',
  STAKING = 'staking',
  GAMING = 'gaming',
  DEFI = 'defi',
  NFT = 'nft',
  CUSTOM = 'custom'
}

/**
 * Estados del token
 */
export enum TokenStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  BURNED = 'burned',
  LOCKED = 'locked',
  EXPIRED = 'expired'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Token del metaverso
 */
export interface Token {
  id: TokenId;
  contractAddress: TokenContractAddress;
  type: TokenType;
  category: TokenCategory;
  status: TokenStatus;
  
  // Información básica
  info: TokenInfo;
  
  // Propiedades económicas
  economics: TokenEconomics;
  
  // Propiedades técnicas
  technical: TokenTechnical;
  
  // Propiedades del metaverso
  metaverse: TokenMetaverse;
  
  // Propiedades de mercado
  market: TokenMarket;
  
  // Propiedades de blockchain
  blockchain: TokenBlockchain;
  
  // Metadatos del sistema
  createdAt: number;
  updatedAt: number;
  deployedAt: number;
  lastTransferredAt?: number;
}

/**
 * Información del token
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  description: string;
  logo: string;
  website?: string;
  whitepaper?: string;
  social: TokenSocial;
  tags: string[];
  category: string;
  creator: TokenCreator;
  verified: boolean;
}

/**
 * Redes sociales del token
 */
export interface TokenSocial {
  twitter?: string;
  telegram?: string;
  discord?: string;
  reddit?: string;
  github?: string;
  medium?: string;
  youtube?: string;
  instagram?: string;
}

/**
 * Creador del token
 */
export interface TokenCreator {
  address: string;
  name?: string;
  avatar?: string;
  verified: boolean;
  role: 'creator' | 'team' | 'community';
}

/**
 * Propiedades económicas
 */
export interface TokenEconomics {
  totalSupply: string;
  circulatingSupply: string;
  maxSupply?: string;
  burned: string;
  minted: string;
  locked: string;
  staked: string;
  
  // Distribución
  distribution: TokenDistribution;
  
  // Inflación/Deflación
  inflation: TokenInflation;
  
  // Utilidad
  utility: TokenUtility;
}

/**
 * Distribución del token
 */
export interface TokenDistribution {
  team: number;
  community: number;
  marketing: number;
  development: number;
  liquidity: number;
  staking: number;
  treasury: number;
  other: number;
  holders: TokenHolder[];
}

/**
 * Holder del token
 */
export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
  lastTransferred: number;
  isContract: boolean;
  isExchange: boolean;
}

/**
 * Inflación del token
 */
export interface TokenInflation {
  type: 'fixed' | 'variable' | 'deflationary';
  rate: number;
  annualRate: number;
  mechanism: string;
  halvingPeriod?: number;
  nextHalving?: number;
}

/**
 * Utilidad del token
 */
export interface TokenUtility {
  useCases: string[];
  benefits: string[];
  stakingRewards: boolean;
  governanceRights: boolean;
  feeDiscounts: boolean;
  exclusiveAccess: boolean;
  nftMinting: boolean;
  metaverseFeatures: string[];
}

/**
 * Propiedades técnicas
 */
export interface TokenTechnical {
  decimals: number;
  standard: string;
  network: string;
  chainId: number;
  
  // Funcionalidades
  features: TokenFeatures;
  
  // Seguridad
  security: TokenSecurity;
  
  // Auditoría
  audit: TokenAudit;
  
  // Código
  code: TokenCode;
}

/**
 * Funcionalidades del token
 */
export interface TokenFeatures {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  upgradeable: boolean;
  transferable: boolean;
  blacklist: boolean;
  whitelist: boolean;
  timelock: boolean;
  multisig: boolean;
  governance: boolean;
  staking: boolean;
  farming: boolean;
}

/**
 * Seguridad del token
 */
export interface TokenSecurity {
  verified: boolean;
  audited: boolean;
  insurance: boolean;
  bugBounty: boolean;
  timelock: boolean;
  multisig: boolean;
  emergencyPause: boolean;
  blacklistFunction: boolean;
  maxTransactionLimit: boolean;
  maxWalletLimit: boolean;
}

/**
 * Auditoría del token
 */
export interface TokenAudit {
  audited: boolean;
  auditor?: string;
  auditReport?: string;
  auditDate?: number;
  score?: number;
  findings: AuditFinding[];
  recommendations: string[];
}

/**
 * Hallazgo de auditoría
 */
export interface AuditFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  status: 'open' | 'fixed' | 'acknowledged';
}

/**
 * Código del token
 */
export interface TokenCode {
  openSource: boolean;
  repository?: string;
  license?: string;
  version: string;
  compiler: string;
  optimization: boolean;
  verifiedSource: boolean;
}

/**
 * Propiedades del metaverso
 */
export interface TokenMetaverse {
  // Uso en el metaverso
  usage: MetaverseUsage;
  
  // Integración
  integration: MetaverseIntegration;
  
  // Recompensas
  rewards: MetaverseRewards;
  
  // Permisos
  permissions: MetaversePermissions;
}

/**
 * Uso en el metaverso
 */
export interface MetaverseUsage {
  acceptedAsPayment: boolean;
  stakingRequired: boolean;
  governanceVoting: boolean;
  nftMinting: boolean;
  landPurchase: boolean;
  itemTrading: boolean;
  servicePayment: boolean;
  premiumFeatures: boolean;
}

/**
 * Integración con el metaverso
 */
export interface MetaverseIntegration {
  worldId?: string;
  position?: string;
  visible: boolean;
  interactive: boolean;
  physics?: boolean;
  animation?: boolean;
  effects?: boolean;
  ui?: boolean;
}

/**
 * Recompensas del metaverso
 */
export interface MetaverseRewards {
  dailyRewards: boolean;
  questRewards: boolean;
  achievementRewards: boolean;
  stakingRewards: boolean;
  referralRewards: boolean;
  eventRewards: boolean;
  bonusRewards: boolean;
}

/**
 * Permisos del metaverso
 */
export interface MetaversePermissions {
  canUse: boolean;
  canTransfer: boolean;
  canStake: boolean;
  canGovern: boolean;
  canMint: boolean;
  canBurn: boolean;
  canLock: boolean;
  canUnlock: boolean;
}

/**
 * Propiedades de mercado
 */
export interface TokenMarket {
  // Precios
  price: TokenPrice;
  
  // Volumen
  volume: TokenVolume;
  
  // Liquidez
  liquidity: TokenLiquidity;
  
  // Trading
  trading: TokenTrading;
  
  // Exchanges
  exchanges: TokenExchange[];
  
  // Análisis
  analysis: TokenAnalysis;
}

/**
 * Precio del token
 */
export interface TokenPrice {
  current: string;
  change24h: number;
  change7d: number;
  change30d: number;
  change1y: number;
  high24h: string;
  low24h: string;
  highAllTime: string;
  lowAllTime: string;
  marketCap: string;
  fullyDilutedMarketCap: string;
  priceHistory: PricePoint[];
}

/**
 * Punto de precio
 */
export interface PricePoint {
  timestamp: number;
  price: string;
  volume: string;
  marketCap: string;
}

/**
 * Volumen del token
 */
export interface TokenVolume {
  volume24h: string;
  volume7d: string;
  volume30d: string;
  volume1y: string;
  averageVolume24h: string;
  volumeChange24h: number;
  volumeHistory: VolumePoint[];
}

/**
 * Punto de volumen
 */
export interface VolumePoint {
  timestamp: number;
  volume: string;
  transactions: number;
}

/**
 * Liquidez del token
 */
export interface TokenLiquidity {
  totalLiquidity: string;
  liquidity24h: string;
  liquidityChange24h: number;
  liquidityPairs: LiquidityPair[];
  liquidityProviders: number;
  averageLiquidity: string;
}

/**
 * Par de liquidez
 */
export interface LiquidityPair {
  pair: string;
  exchange: string;
  liquidity: string;
  volume24h: string;
  fee: number;
  apr?: number;
}

/**
 * Trading del token
 */
export interface TokenTrading {
  activeTraders: number;
  totalTrades: number;
  trades24h: number;
  averageTradeSize: string;
  buyPressure: number;
  sellPressure: number;
  orderBook: OrderBook;
}

/**
 * Libro de órdenes
 */
export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: string;
  depth: string;
}

/**
 * Entrada del libro de órdenes
 */
export interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

/**
 * Exchange del token
 */
export interface TokenExchange {
  name: string;
  url: string;
  logo: string;
  volume24h: string;
  price: string;
  change24h: number;
  liquidity: string;
  pairs: string[];
  verified: boolean;
  tradingEnabled: boolean;
}

/**
 * Análisis del token
 */
export interface TokenAnalysis {
  score: number;
  risk: 'low' | 'medium' | 'high';
  volatility: number;
  correlation: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  technicalIndicators: TechnicalIndicator[];
  sentiment: TokenSentiment;
}

/**
 * Indicador técnico
 */
export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
}

/**
 * Sentimiento del token
 */
export interface TokenSentiment {
  score: number;
  positive: number;
  negative: number;
  neutral: number;
  sources: SentimentSource[];
}

/**
 * Fuente de sentimiento
 */
export interface SentimentSource {
  name: string;
  score: number;
  weight: number;
  url?: string;
}

/**
 * Propiedades de blockchain
 */
export interface TokenBlockchain {
  network: string;
  chainId: number;
  blockNumber: number;
  contractCode: string;
  verified: boolean;
  events: TokenBlockchainEvent[];
  transactions: TokenTransaction[];
  holders: number;
  transfers: number;
}

/**
 * Evento de blockchain
 */
export interface TokenBlockchainEvent {
  name: string;
  signature: string;
  args: any[];
  address: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

/**
 * Transacción del token
 */
export interface TokenTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  type: 'transfer' | 'mint' | 'burn' | 'approve' | 'swap';
}

// ============================================================================
// TIPOS DE STAKING
// ============================================================================

/**
 * Staking del token
 */
export interface TokenStaking {
  id: string;
  token: Token;
  staker: string;
  amount: string;
  stakedAt: number;
  unlockTime?: number;
  rewards: StakingRewards;
  status: 'staked' | 'unstaking' | 'unstaked';
  pool?: StakingPool;
}

/**
 * Recompensas de staking
 */
export interface StakingRewards {
  earned: string;
  pending: string;
  rate: number;
  apy: number;
  lastClaimed: number;
  nextClaim: number;
  totalEarned: string;
}

/**
 * Pool de staking
 */
export interface StakingPool {
  id: string;
  name: string;
  token: Token;
  rewardToken: Token;
  totalStaked: string;
  totalRewards: string;
  apy: number;
  lockPeriod: number;
  minStake: string;
  maxStake: string;
  fee: number;
  status: 'active' | 'paused' | 'closed';
}

// ============================================================================
// TIPOS DE FARMING
// ============================================================================

/**
 * Farming del token
 */
export interface TokenFarming {
  id: string;
  name: string;
  token: Token;
  rewardToken: Token;
  lpToken: Token;
  totalStaked: string;
  totalRewards: string;
  apy: number;
  multiplier: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'paused' | 'ended';
  participants: number;
}

// ============================================================================
// TIPOS DE GOVERNANCE
// ============================================================================

/**
 * Governance del token
 */
export interface TokenGovernance {
  id: string;
  token: Token;
  proposals: GovernanceProposal[];
  votes: GovernanceVote[];
  settings: GovernanceSettings;
  statistics: GovernanceStatistics;
}

/**
 * Propuesta de governance
 */
export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  startTime: number;
  endTime: number;
  quorum: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  status: 'pending' | 'active' | 'passed' | 'failed' | 'executed';
  actions: GovernanceAction[];
}

/**
 * Acción de governance
 */
export interface GovernanceAction {
  target: string;
  value: string;
  data: string;
  description: string;
}

/**
 * Voto de governance
 */
export interface GovernanceVote {
  proposalId: string;
  voter: string;
  support: 'for' | 'against' | 'abstain';
  weight: string;
  reason?: string;
  timestamp: number;
}

/**
 * Configuración de governance
 */
export interface GovernanceSettings {
  votingDelay: number;
  votingPeriod: number;
  quorumVotes: string;
  proposalThreshold: string;
  timelockDelay: number;
  guardian: string;
  vetoGuardian: string;
}

/**
 * Estadísticas de governance
 */
export interface GovernanceStatistics {
  totalProposals: number;
  passedProposals: number;
  failedProposals: number;
  totalVotes: number;
  uniqueVoters: number;
  averageParticipation: number;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de token
 */
export interface TokenUtils {
  /**
   * Valida dirección de contrato
   */
  isValidContractAddress: (address: string) => boolean;
  
  /**
   * Formatea cantidad de token
   */
  formatAmount: (amount: string, decimals: number) => string;
  
  /**
   * Parsea cantidad de token
   */
  parseAmount: (amount: string, decimals: number) => string;
  
  /**
   * Calcula precio en USD
   */
  calculateUSDValue: (amount: string, priceUSD: string) => number;
  
  /**
   * Formatea precio
   */
  formatPrice: (price: string, currency: string) => string;
  
  /**
   * Calcula APY
   */
  calculateAPY: (rate: number, compoundFrequency: number) => number;
  
  /**
   * Calcula recompensas de staking
   */
  calculateStakingRewards: (staked: string, rate: number, time: number) => string;
  
  /**
   * Valida metadatos de token
   */
  validateTokenMetadata: (metadata: any) => boolean;
  
  /**
   * Obtiene información del token
   */
  getTokenInfo: (address: string, network: string) => Promise<Token>;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  TokenId,
  TokenContractAddress,
  Token,
  TokenInfo,
  TokenSocial,
  TokenCreator,
  TokenEconomics,
  TokenDistribution,
  TokenHolder,
  TokenInflation,
  TokenUtility,
  TokenTechnical,
  TokenFeatures,
  TokenSecurity,
  TokenAudit,
  AuditFinding,
  TokenCode,
  TokenMetaverse,
  MetaverseUsage,
  MetaverseIntegration,
  MetaverseRewards,
  MetaversePermissions,
  TokenMarket,
  TokenPrice,
  PricePoint,
  TokenVolume,
  VolumePoint,
  TokenLiquidity,
  LiquidityPair,
  TokenTrading,
  OrderBook,
  OrderBookEntry,
  TokenExchange,
  TokenAnalysis,
  TechnicalIndicator,
  TokenSentiment,
  SentimentSource,
  TokenBlockchain,
  TokenBlockchainEvent,
  TokenTransaction,
  TokenStaking,
  StakingRewards,
  StakingPool,
  TokenFarming,
  TokenGovernance,
  GovernanceProposal,
  GovernanceAction,
  GovernanceVote,
  GovernanceSettings,
  GovernanceStatistics,
  TokenUtils
};

export {
  TokenType,
  TokenCategory,
  TokenStatus
}; 