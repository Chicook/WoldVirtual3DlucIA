/**
 * @fileoverview Tipos para NFTs del metaverso
 * @module @types/blockchain/nft
 */

import { WorldCoordinates, WorldRotation } from '../metaverso/world';

// ============================================================================
// TIPOS BÁSICOS DE NFT
// ============================================================================

/**
 * Identificador único de un NFT
 */
export type NFTId = string;

/**
 * Token ID del NFT
 */
export type TokenId = string;

/**
 * Dirección del contrato NFT
 */
export type NFTContractAddress = string;

/**
 * Tipos de NFTs
 */
export enum NFTType {
  AVATAR = 'avatar',
  LAND = 'land',
  BUILDING = 'building',
  VEHICLE = 'vehicle',
  WEAPON = 'weapon',
  TOOL = 'tool',
  CLOTHING = 'clothing',
  ACCESSORY = 'accessory',
  ART = 'art',
  MUSIC = 'music',
  GAME_ITEM = 'game_item',
  COLLECTIBLE = 'collectible',
  TICKET = 'ticket',
  MEMBERSHIP = 'membership',
  CUSTOM = 'custom'
}

/**
 * Estándares de NFT
 */
export enum NFTStandard {
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
  ERC998 = 'erc998',
  SPL = 'spl',
  CUSTOM = 'custom'
}

/**
 * Estados del NFT
 */
export enum NFTStatus {
  MINTING = 'minting',
  MINTED = 'minted',
  TRANSFERRING = 'transferring',
  TRANSFERRED = 'transferred',
  BURNING = 'burning',
  BURNED = 'burned',
  LOCKED = 'locked',
  STAKED = 'staked'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * NFT del metaverso
 */
export interface NFT {
  id: NFTId;
  tokenId: TokenId;
  contractAddress: NFTContractAddress;
  type: NFTType;
  standard: NFTStandard;
  status: NFTStatus;
  
  // Metadatos
  metadata: NFTMetadata;
  
  // Propiedades del token
  token: NFTToken;
  
  // Propiedades del metaverso
  metaverse: NFTMetaverse;
  
  // Propiedades de mercado
  market: NFTMarket;
  
  // Propiedades de blockchain
  blockchain: NFTBlockchain;
  
  // Metadatos del sistema
  createdAt: number;
  updatedAt: number;
  mintedAt: number;
  lastTransferredAt?: number;
}

/**
 * Metadatos del NFT
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  animationUrl?: string;
  background_color?: string;
  attributes: NFTAttribute[];
  properties: NFTProperties;
  tags: string[];
  category: string;
  rarity: NFTRarity;
  edition?: number;
  totalSupply?: number;
  creator: NFTCreator;
  collection?: NFTCollection;
}

/**
 * Atributo del NFT
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number | boolean;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  max_value?: number;
  rarity_score?: number;
  rarity_percentage?: number;
}

/**
 * Propiedades del NFT
 */
export interface NFTProperties {
  files?: NFTFile[];
  category?: string;
  subcategory?: string;
  version?: string;
  language?: string;
  platform?: string;
  compatibility?: string[];
  requirements?: NFTRequirements;
  custom?: Record<string, any>;
}

/**
 * Archivo del NFT
 */
export interface NFTFile {
  uri: string;
  type: string;
  size?: number;
  name?: string;
  description?: string;
}

/**
 * Requisitos del NFT
 */
export interface NFTRequirements {
  level?: number;
  experience?: number;
  items?: string[];
  permissions?: string[];
  network?: string;
  wallet?: string;
}

/**
 * Rareza del NFT
 */
export interface NFTRarity {
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  score: number;
  percentage: number;
  rank?: number;
  totalSupply: number;
  minted: number;
}

/**
 * Creador del NFT
 */
export interface NFTCreator {
  address: string;
  name?: string;
  avatar?: string;
  verified: boolean;
  royaltyPercentage?: number;
  share?: number;
}

/**
 * Colección del NFT
 */
export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  banner?: string;
  contractAddress: string;
  standard: NFTStandard;
  totalSupply: number;
  floorPrice?: string;
  volume?: string;
  creator: NFTCreator;
  verified: boolean;
  category: string;
  tags: string[];
}

/**
 * Propiedades del token
 */
export interface NFTToken {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  circulatingSupply: string;
  burned: string;
  minted: string;
  transferable: boolean;
  burnable: boolean;
  pausable: boolean;
  upgradeable: boolean;
  royaltyInfo?: RoyaltyInfo;
}

/**
 * Información de regalías
 */
export interface RoyaltyInfo {
  receiver: string;
  royaltyFraction: number;
  percentage: number;
  recipients: RoyaltyRecipient[];
}

/**
 * Receptor de regalías
 */
export interface RoyaltyRecipient {
  address: string;
  percentage: number;
  name?: string;
}

/**
 * Propiedades del metaverso
 */
export interface NFTMetaverse {
  worldId?: string;
  position?: WorldCoordinates;
  rotation?: WorldRotation;
  scale?: WorldCoordinates;
  visible: boolean;
  interactive: boolean;
  physics?: NFTPhysics;
  animation?: NFTAnimation;
  effects?: NFTEffects;
  permissions: NFTPermissions;
  usage: NFTUsage;
}

/**
 * Física del NFT
 */
export interface NFTPhysics {
  enabled: boolean;
  mass: number;
  friction: number;
  restitution: number;
  collisionGroup: number;
  collisionMask: number;
  shape: 'box' | 'sphere' | 'cylinder' | 'mesh';
  size?: WorldCoordinates;
  radius?: number;
}

/**
 * Animación del NFT
 */
export interface NFTAnimation {
  enabled: boolean;
  clips: NFTAnimationClip[];
  currentClip?: string;
  loop: boolean;
  speed: number;
  blendMode: 'additive' | 'normal' | 'override';
}

/**
 * Clip de animación
 */
export interface NFTAnimationClip {
  id: string;
  name: string;
  url: string;
  duration: number;
  loop: boolean;
  events: NFTAnimationEvent[];
}

/**
 * Evento de animación
 */
export interface NFTAnimationEvent {
  time: number;
  type: string;
  data: any;
}

/**
 * Efectos del NFT
 */
export interface NFTEffects {
  particles?: NFTParticleEffect;
  sound?: NFTSoundEffect;
  visual?: NFTVisualEffect;
}

/**
 * Efecto de partículas
 */
export interface NFTParticleEffect {
  enabled: boolean;
  system: string;
  intensity: number;
  color: string;
  size: number;
}

/**
 * Efecto de sonido
 */
export interface NFTSoundEffect {
  enabled: boolean;
  audio: string;
  volume: number;
  loop: boolean;
  spatial: boolean;
}

/**
 * Efecto visual
 */
export interface NFTVisualEffect {
  enabled: boolean;
  type: 'glow' | 'outline' | 'blur' | 'distortion';
  color: string;
  intensity: number;
  duration: number;
}

/**
 * Permisos del NFT
 */
export interface NFTPermissions {
  canUse: boolean;
  canTransfer: boolean;
  canBurn: boolean;
  canModify: boolean;
  canStake: boolean;
  canRent: boolean;
  canTrade: boolean;
  canDisplay: boolean;
  canInteract: boolean;
  canScript: boolean;
}

/**
 * Uso del NFT
 */
export interface NFTUsage {
  useCount: number;
  lastUsed?: number;
  totalTimeUsed: number;
  wearAndTear: number;
  durability: number;
  maxDurability: number;
  maintenanceRequired: boolean;
  lastMaintenance?: number;
}

/**
 * Propiedades de mercado
 */
export interface NFTMarket {
  listed: boolean;
  price?: string;
  currency?: string;
  auction?: NFTAuction;
  offers: NFTOffer[];
  history: NFTTransaction[];
  statistics: NFTStatistics;
  marketplace?: string;
  listingId?: string;
}

/**
 * Subasta del NFT
 */
export interface NFTAuction {
  id: string;
  startPrice: string;
  currentPrice: string;
  reservePrice?: string;
  startTime: number;
  endTime: number;
  minBidIncrement: string;
  bids: NFTAuctionBid[];
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  winner?: string;
}

/**
 * Puja de subasta
 */
export interface NFTAuctionBid {
  bidder: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

/**
 * Oferta del NFT
 */
export interface NFTOffer {
  id: string;
  offerer: string;
  amount: string;
  currency: string;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  timestamp: number;
  transactionHash?: string;
}

/**
 * Transacción del NFT
 */
export interface NFTTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'sale' | 'bid' | 'offer' | 'burn';
  from: string;
  to: string;
  amount?: string;
  currency?: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
}

/**
 * Estadísticas del NFT
 */
export interface NFTStatistics {
  totalSales: number;
  totalVolume: string;
  averagePrice: string;
  highestPrice: string;
  lowestPrice: string;
  lastSalePrice?: string;
  lastSaleTime?: number;
  floorPrice?: string;
  rarityRank?: number;
  popularityScore: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
}

/**
 * Propiedades de blockchain
 */
export interface NFTBlockchain {
  network: string;
  chainId: number;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
  transactionHash: string;
  blockHash: string;
  confirmations: number;
  events: NFTBlockchainEvent[];
  logs: NFTBlockchainLog[];
}

/**
 * Evento de blockchain
 */
export interface NFTBlockchainEvent {
  name: string;
  signature: string;
  args: any[];
  address: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

/**
 * Log de blockchain
 */
export interface NFTBlockchainLog {
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

// ============================================================================
// TIPOS DE MINTING
// ============================================================================

/**
 * Configuración de minting
 */
export interface MintingConfig {
  maxSupply: number;
  mintPrice: string;
  currency: string;
  startTime: number;
  endTime?: number;
  whitelist?: string[];
  maxPerWallet: number;
  maxPerTransaction: number;
  revealTime?: number;
  metadataBaseUri: string;
  contractAddress: string;
  creator: string;
  royaltyPercentage: number;
}

/**
 * Solicitud de minting
 */
export interface MintingRequest {
  to: string;
  tokenId?: TokenId;
  amount?: number;
  metadata?: Partial<NFTMetadata>;
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Respuesta de minting
 */
export interface MintingResponse {
  success: boolean;
  tokenId: TokenId;
  transactionHash: string;
  gasUsed: number;
  gasPrice: string;
  totalCost: string;
  nft?: NFT;
  error?: string;
}

// ============================================================================
// TIPOS DE TRANSFERENCIA
// ============================================================================

/**
 * Solicitud de transferencia
 */
export interface TransferRequest {
  from: string;
  to: string;
  tokenId: TokenId;
  amount?: number;
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Respuesta de transferencia
 */
export interface TransferResponse {
  success: boolean;
  transactionHash: string;
  gasUsed: number;
  gasPrice: string;
  totalCost: string;
  error?: string;
}

// ============================================================================
// TIPOS DE MARKETPLACE
// ============================================================================

/**
 * Marketplace de NFTs
 */
export interface NFTMarketplace {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  banner?: string;
  supportedNetworks: string[];
  supportedStandards: NFTStandard[];
  fees: MarketplaceFees;
  features: MarketplaceFeatures;
  statistics: MarketplaceStatistics;
}

/**
 * Comisiones del marketplace
 */
export interface MarketplaceFees {
  listingFee: number;
  transactionFee: number;
  royaltyFee: number;
  gasFee: boolean;
  currency: string;
}

/**
 * Características del marketplace
 */
export interface MarketplaceFeatures {
  auctions: boolean;
  offers: boolean;
  bundles: boolean;
  lazyMinting: boolean;
  batchMinting: boolean;
  fractionalization: boolean;
  staking: boolean;
  lending: boolean;
  insurance: boolean;
}

/**
 * Estadísticas del marketplace
 */
export interface MarketplaceStatistics {
  totalVolume: string;
  totalSales: number;
  totalUsers: number;
  totalCollections: number;
  averagePrice: string;
  floorPrice: string;
  activeListings: number;
}

/**
 * Listado del marketplace
 */
export interface MarketplaceListing {
  id: string;
  nft: NFT;
  seller: string;
  price: string;
  currency: string;
  auction?: NFTAuction;
  offers: NFTOffer[];
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

// ============================================================================
// TIPOS DE STAKING
// ============================================================================

/**
 * Staking del NFT
 */
export interface NFTStaking {
  id: string;
  nft: NFT;
  staker: string;
  stakedAt: number;
  unlockTime?: number;
  rewards: StakingRewards;
  status: 'staked' | 'unstaking' | 'unstaked';
}

/**
 * Recompensas de staking
 */
export interface StakingRewards {
  earned: string;
  pending: string;
  rate: number;
  lastClaimed: number;
  nextClaim: number;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de NFT
 */
export interface NFTUtils {
  /**
   * Valida metadatos de NFT
   */
  validateMetadata: (metadata: NFTMetadata) => boolean;
  
  /**
   * Calcula rareza del NFT
   */
  calculateRarity: (attributes: NFTAttribute[], collection: NFTCollection) => NFTRarity;
  
  /**
   * Genera URI de metadatos
   */
  generateMetadataUri: (metadata: NFTMetadata, baseUri: string) => string;
  
  /**
   * Parsea URI de metadatos
   */
  parseMetadataUri: (uri: string) => NFTMetadata;
  
  /**
   * Calcula precio en USD
   */
  calculateUSDPrice: (price: string, currency: string) => number;
  
  /**
   * Formatea precio
   */
  formatPrice: (price: string, currency: string) => string;
  
  /**
   * Valida dirección de contrato
   */
  isValidContractAddress: (address: string) => boolean;
  
  /**
   * Obtiene información del contrato
   */
  getContractInfo: (address: string, network: string) => Promise<any>;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  NFTId,
  TokenId,
  NFTContractAddress,
  NFT,
  NFTMetadata,
  NFTAttribute,
  NFTProperties,
  NFTFile,
  NFTRequirements,
  NFTRarity,
  NFTCreator,
  NFTCollection,
  NFTToken,
  RoyaltyInfo,
  RoyaltyRecipient,
  NFTMetaverse,
  NFTPhysics,
  NFTAnimation,
  NFTAnimationClip,
  NFTAnimationEvent,
  NFTEffects,
  NFTParticleEffect,
  NFTSoundEffect,
  NFTVisualEffect,
  NFTPermissions,
  NFTUsage,
  NFTMarket,
  NFTAuction,
  NFTAuctionBid,
  NFTOffer,
  NFTTransaction,
  NFTStatistics,
  NFTBlockchain,
  NFTBlockchainEvent,
  NFTBlockchainLog,
  MintingConfig,
  MintingRequest,
  MintingResponse,
  TransferRequest,
  TransferResponse,
  NFTMarketplace,
  MarketplaceFees,
  MarketplaceFeatures,
  MarketplaceStatistics,
  MarketplaceListing,
  NFTStaking,
  StakingRewards,
  NFTUtils
};

export {
  NFTType,
  NFTStandard,
  NFTStatus
}; 