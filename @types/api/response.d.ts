/**
 * @fileoverview Tipos para responses de API del metaverso
 * @module @types/api/response
 */

// ============================================================================
// TIPOS BÁSICOS DE RESPONSE
// ============================================================================

/**
 * Identificador único de un response
 */
export type ResponseId = string;

/**
 * Códigos de estado HTTP
 */
export enum HttpStatus {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // 3xx Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  
  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

/**
 * Tipos de respuesta
 */
export enum ResponseType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  VALIDATION_ERROR = 'validation_error',
  AUTH_ERROR = 'auth_error',
  RATE_LIMIT_ERROR = 'rate_limit_error'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Response de API genérico
 */
export interface APIResponse<T = any> {
  id: ResponseId;
  success: boolean;
  type: ResponseType;
  status: HttpStatus;
  message: string;
  data?: T;
  error?: APIError;
  metadata: ResponseMetadata;
  timestamp: number;
  version: string;
}

/**
 * Error de API
 */
export interface APIError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  requestId?: string;
}

/**
 * Metadatos del response
 */
export interface ResponseMetadata {
  requestId?: string;
  correlationId?: string;
  sessionId?: string;
  userId?: string;
  processingTime: number;
  cacheHit?: boolean;
  rateLimit?: RateLimitInfo;
  pagination?: PaginationInfo;
  custom?: Record<string, any>;
}

/**
 * Información de rate limiting
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Información de paginación
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

// ============================================================================
// TIPOS DE RESPONSE ESPECÍFICOS
// ============================================================================

/**
 * Response de autenticación
 */
export interface AuthResponse {
  success: boolean;
  user: UserData;
  token: AuthToken;
  refreshToken?: string;
  expiresAt: number;
  permissions: string[];
  roles: string[];
}

/**
 * Token de autenticación
 */
export interface AuthToken {
  accessToken: string;
  tokenType: 'Bearer' | 'JWT' | 'API_KEY';
  expiresIn: number;
  scope?: string;
}

/**
 * Datos de usuario
 */
export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  walletAddress?: string;
  status: 'active' | 'inactive' | 'banned' | 'pending';
  createdAt: number;
  lastActive: number;
  preferences: UserPreferences;
  metadata?: Record<string, any>;
}

/**
 * Preferencias de usuario
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

/**
 * Configuración de notificaciones
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  marketing: boolean;
  updates: boolean;
  events: boolean;
}

/**
 * Configuración de privacidad
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowMessages: boolean;
  allowFriendRequests: boolean;
  shareAnalytics: boolean;
}

/**
 * Configuración de accesibilidad
 */
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  colorBlindness: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

/**
 * Response de avatar
 */
export interface AvatarResponse {
  success: boolean;
  avatar: AvatarData;
  stats: AvatarStats;
  inventory: InventoryItem[];
  position: WorldPosition;
  metadata?: Record<string, any>;
}

/**
 * Datos de avatar
 */
export interface AvatarData {
  id: string;
  name: string;
  ownerId: string;
  model: string;
  appearance: AvatarAppearance;
  createdAt: number;
  updatedAt: number;
}

/**
 * Apariencia del avatar
 */
export interface AvatarAppearance {
  height: number;
  weight: number;
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  clothing: Record<string, string>;
  accessories: string[];
  customizations: Record<string, any>;
}

/**
 * Estadísticas del avatar
 */
export interface AvatarStats {
  level: number;
  experience: number;
  health: number;
  mana: number;
  stamina: number;
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  luck: number;
}

/**
 * Item del inventario
 */
export interface InventoryItem {
  id: string;
  type: string;
  name: string;
  description: string;
  quantity: number;
  rarity: string;
  metadata?: Record<string, any>;
}

/**
 * Posición en el mundo
 */
export interface WorldPosition {
  worldId: string;
  x: number;
  y: number;
  z: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Response de mundo
 */
export interface WorldResponse {
  success: boolean;
  world: WorldData;
  players: PlayerInfo[];
  objects: WorldObject[];
  settings: WorldSettings;
  metadata?: Record<string, any>;
}

/**
 * Datos de mundo
 */
export interface WorldData {
  id: string;
  name: string;
  description: string;
  category: string;
  ownerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  maxPlayers: number;
  currentPlayers: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Información del jugador
 */
export interface PlayerInfo {
  id: string;
  username: string;
  avatar: string;
  position: WorldPosition;
  status: 'online' | 'away' | 'busy';
  lastActivity: number;
}

/**
 * Objeto del mundo
 */
export interface WorldObject {
  id: string;
  type: string;
  name: string;
  position: WorldPosition;
  properties: Record<string, any>;
  ownerId?: string;
  createdAt: number;
}

/**
 * Configuración de mundo
 */
export interface WorldSettings {
  physics: PhysicsSettings;
  lighting: LightingSettings;
  audio: AudioSettings;
  permissions: WorldPermissions;
  moderation: ModerationSettings;
}

/**
 * Configuración de física
 */
export interface PhysicsSettings {
  gravity: number;
  airResistance: number;
  collisionEnabled: boolean;
  waterLevel?: number;
}

/**
 * Configuración de iluminación
 */
export interface LightingSettings {
  ambientLight: {
    color: string;
    intensity: number;
  };
  directionalLight: {
    color: string;
    intensity: number;
    position: WorldPosition;
    castShadow: boolean;
  };
}

/**
 * Configuración de audio
 */
export interface AudioSettings {
  ambientSounds: string[];
  backgroundMusic?: string;
  volume: number;
  spatialAudio: boolean;
}

/**
 * Permisos del mundo
 */
export interface WorldPermissions {
  public: boolean;
  allowBuilding: boolean;
  allowScripting: boolean;
  allowTeleport: boolean;
  allowChat: boolean;
  allowVoice: boolean;
  allowTrading: boolean;
}

/**
 * Configuración de moderación
 */
export interface ModerationSettings {
  autoModeration: boolean;
  profanityFilter: boolean;
  spamProtection: boolean;
  reportSystem: boolean;
}

/**
 * Response de NFT
 */
export interface NFTResponse {
  success: boolean;
  nft: NFTData;
  metadata: NFTMetadata;
  ownership: NFTOwnership;
  transaction?: TransactionData;
}

/**
 * Datos de NFT
 */
export interface NFTData {
  id: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  creator: string;
  owner: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Metadatos de NFT
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NFTAttribute[];
  properties?: Record<string, any>;
}

/**
 * Atributo de NFT
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number | boolean;
  display_type?: string;
  max_value?: number;
}

/**
 * Propiedad de NFT
 */
export interface NFTOwnership {
  owner: string;
  balance: number;
  transferCount: number;
  lastTransfer?: number;
  isForSale: boolean;
  price?: string;
  currency?: string;
}

/**
 * Response de transacción
 */
export interface TransactionResponse {
  success: boolean;
  transaction: TransactionData;
  receipt: TransactionReceipt;
  status: TransactionStatus;
  gasUsed: number;
  gasPrice: string;
  totalCost: string;
}

/**
 * Datos de transacción
 */
export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  gasLimit: number;
  gasPrice: string;
  nonce: number;
  chainId: number;
  timestamp: number;
}

/**
 * Recibo de transacción
 */
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: number;
  cumulativeGasUsed: number;
  effectiveGasPrice: string;
  status: number;
  logs: TransactionLog[];
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
 * Estado de transacción
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'reverted';

/**
 * Response de marketplace
 */
export interface MarketplaceResponse {
  success: boolean;
  listing: MarketplaceListing;
  offers: MarketplaceOffer[];
  bids: MarketplaceBid[];
  metadata?: Record<string, any>;
}

/**
 * Listado del marketplace
 */
export interface MarketplaceListing {
  id: string;
  nftId: string;
  sellerId: string;
  price: string;
  currency: string;
  type: 'fixed' | 'auction' | 'offer';
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt?: number;
  auction?: AuctionData;
}

/**
 * Datos de subasta
 */
export interface AuctionData {
  startPrice: string;
  reservePrice?: string;
  startTime: number;
  endTime: number;
  minBidIncrement: string;
  currentBid?: string;
  currentBidder?: string;
  bidCount: number;
}

/**
 * Oferta del marketplace
 */
export interface MarketplaceOffer {
  id: string;
  listingId: string;
  bidderId: string;
  amount: string;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: number;
  expiresAt: number;
}

/**
 * Puja del marketplace
 */
export interface MarketplaceBid {
  id: string;
  listingId: string;
  bidderId: string;
  amount: string;
  currency: string;
  timestamp: number;
}

/**
 * Response de chat
 */
export interface ChatResponse {
  success: boolean;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  metadata?: Record<string, any>;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'voice' | 'emote' | 'system';
  timestamp: number;
  replyTo?: string;
  attachments?: ChatAttachment[];
  metadata?: Record<string, any>;
}

/**
 * Participante del chat
 */
export interface ChatParticipant {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
  role: 'user' | 'moderator' | 'admin';
}

/**
 * Adjunto de chat
 */
export interface ChatAttachment {
  type: 'image' | 'audio' | 'video' | 'file' | 'nft';
  url: string;
  name: string;
  size: number;
  metadata?: Record<string, any>;
}

/**
 * Response de analytics
 */
export interface AnalyticsResponse {
  success: boolean;
  metrics: AnalyticsMetrics;
  events: AnalyticsEvent[];
  reports: AnalyticsReport[];
  metadata?: Record<string, any>;
}

/**
 * Métricas de analytics
 */
export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: string;
  averageSessionTime: number;
  conversionRate: number;
  retentionRate: number;
}

/**
 * Evento de analytics
 */
export interface AnalyticsEvent {
  id: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  properties: Record<string, any>;
}

/**
 * Reporte de analytics
 */
export interface AnalyticsReport {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Response de validación
 */
export interface ValidationResponse {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, any>;
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  constraints?: Record<string, any>;
}

/**
 * Advertencia de validación
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Response de lista paginada
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  metadata?: Record<string, any>;
}

/**
 * Response de búsqueda
 */
export interface SearchResponse<T> {
  success: boolean;
  results: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  pagination: PaginationInfo;
  metadata?: Record<string, any>;
}

/**
 * Response de archivo
 */
export interface FileResponse {
  success: boolean;
  file: FileData;
  url: string;
  metadata?: Record<string, any>;
}

/**
 * Datos de archivo
 */
export interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: number;
  metadata?: Record<string, any>;
}

/**
 * Utilidades de response
 */
export interface ResponseUtils {
  /**
   * Crea response de éxito
   */
  createSuccessResponse: <T>(data: T, message?: string) => APIResponse<T>;
  
  /**
   * Crea response de error
   */
  createErrorResponse: (error: APIError, message?: string) => APIResponse;
  
  /**
   * Valida response
   */
  validateResponse: (response: APIResponse) => boolean;
  
  /**
   * Serializa response
   */
  serializeResponse: (response: APIResponse) => string;
  
  /**
   * Deserializa response
   */
  deserializeResponse: (data: string) => APIResponse;
  
  /**
   * Clona response
   */
  cloneResponse: (response: APIResponse) => APIResponse;
  
  /**
   * Combina responses
   */
  mergeResponses: (responses: APIResponse[]) => APIResponse;
  
  /**
   * Genera ID de response
   */
  generateResponseId: () => ResponseId;
  
  /**
   * Verifica si es response de éxito
   */
  isSuccessResponse: (response: APIResponse) => boolean;
  
  /**
   * Verifica si es response de error
   */
  isErrorResponse: (response: APIResponse) => boolean;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ResponseId,
  APIResponse,
  APIError,
  ResponseMetadata,
  RateLimitInfo,
  PaginationInfo,
  AuthResponse,
  UserData,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  AccessibilitySettings,
  AvatarResponse,
  AvatarData,
  AvatarAppearance,
  InventoryItem,
  WorldPosition,
  WorldResponse,
  WorldData,
  WorldSettings,
  PhysicsSettings,
  LightingSettings,
  AudioSettings,
  WorldPermissions,
  ModerationSettings,
  WorldObject,
  NFTResponse,
  TransactionResponse,
  TransactionData,
  TransactionReceipt,
  TransactionLog,
  MarketplaceResponse,
  MarketplaceListing,
  AuctionData,
  MarketplaceOffer,
  MarketplaceBid,
  ChatResponse,
  ChatMessage,
  ChatParticipant,
  ChatAttachment,
  AnalyticsResponse,
  AnalyticsMetrics,
  AnalyticsEvent,
  AnalyticsReport,
  ValidationResponse,
  ValidationError,
  ValidationWarning,
  PaginatedResponse,
  SearchResponse,
  FileResponse,
  FileData,
  ResponseUtils
};

export {
  HttpStatus,
  ResponseType
}; 