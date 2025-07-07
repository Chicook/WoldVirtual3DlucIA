/**
 * @fileoverview Tipos para requests de API del metaverso
 * @module @types/api/request
 */

// ============================================================================
// TIPOS BÁSICOS DE REQUEST
// ============================================================================

/**
 * Identificador único de un request
 */
export type RequestId = string;

/**
 * Métodos HTTP
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

/**
 * Tipos de contenido
 */
export enum ContentType {
  JSON = 'application/json',
  FORM_DATA = 'multipart/form-data',
  FORM_URLENCODED = 'application/x-www-form-urlencoded',
  TEXT = 'text/plain',
  HTML = 'text/html',
  XML = 'application/xml',
  BINARY = 'application/octet-stream'
}

/**
 * Tipos de autenticación
 */
export enum AuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  BEARER = 'bearer',
  BASIC = 'basic',
  OAUTH2 = 'oauth2',
  JWT = 'jwt',
  WALLET = 'wallet'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Request de API
 */
export interface APIRequest<T = any> {
  id: RequestId;
  method: HttpMethod;
  url: string;
  headers: RequestHeaders;
  params: RequestParams;
  body?: T;
  auth: RequestAuth;
  timeout: number;
  retries: number;
  metadata: RequestMetadata;
}

/**
 * Headers del request
 */
export interface RequestHeaders {
  'Content-Type'?: ContentType;
  'Authorization'?: string;
  'User-Agent'?: string;
  'Accept'?: string;
  'Accept-Language'?: string;
  'Accept-Encoding'?: string;
  'Cache-Control'?: string;
  'X-Request-ID'?: string;
  'X-API-Key'?: string;
  'X-Wallet-Address'?: string;
  'X-Signature'?: string;
  'X-Timestamp'?: string;
  [key: string]: string | undefined;
}

/**
 * Parámetros del request
 */
export interface RequestParams {
  query: Record<string, string | number | boolean | string[]>;
  path: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

/**
 * Autenticación del request
 */
export interface RequestAuth {
  type: AuthType;
  credentials: AuthCredentials;
  required: boolean;
  scopes?: string[];
  permissions?: string[];
}

/**
 * Credenciales de autenticación
 */
export interface AuthCredentials {
  apiKey?: string;
  token?: string;
  username?: string;
  password?: string;
  walletAddress?: string;
  signature?: string;
  timestamp?: number;
  nonce?: string;
}

/**
 * Metadatos del request
 */
export interface RequestMetadata {
  timestamp: number;
  source: string;
  version: string;
  correlationId?: string;
  sessionId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  origin?: string;
  custom?: Record<string, any>;
}

// ============================================================================
// TIPOS DE REQUEST ESPECÍFICOS
// ============================================================================

/**
 * Request de autenticación
 */
export interface AuthRequest {
  type: 'login' | 'register' | 'logout' | 'refresh' | 'verify';
  credentials: AuthCredentials;
  rememberMe?: boolean;
  redirectUrl?: string;
}

/**
 * Request de usuario
 */
export interface UserRequest {
  action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'search';
  userId?: string;
  data?: UserData;
  filters?: UserFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de usuario
 */
export interface UserData {
  username?: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

/**
 * Preferencias de usuario
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
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
 * Filtros de usuario
 */
export interface UserFilters {
  username?: string;
  email?: string;
  walletAddress?: string;
  status?: 'active' | 'inactive' | 'banned';
  role?: string[];
  createdAt?: DateRange;
  lastActive?: DateRange;
}

/**
 * Request de avatar
 */
export interface AvatarRequest {
  action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'customize';
  avatarId?: string;
  data?: AvatarData;
  filters?: AvatarFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de avatar
 */
export interface AvatarData {
  name?: string;
  model?: string;
  appearance?: AvatarAppearance;
  inventory?: string[];
  stats?: AvatarStats;
  position?: WorldPosition;
  metadata?: Record<string, any>;
}

/**
 * Apariencia del avatar
 */
export interface AvatarAppearance {
  height?: number;
  weight?: number;
  skinColor?: string;
  hairColor?: string;
  eyeColor?: string;
  clothing?: Record<string, string>;
  accessories?: string[];
  customizations?: Record<string, any>;
}

/**
 * Estadísticas del avatar
 */
export interface AvatarStats {
  level?: number;
  experience?: number;
  health?: number;
  mana?: number;
  stamina?: number;
  strength?: number;
  agility?: number;
  intelligence?: number;
  charisma?: number;
  luck?: number;
}

/**
 * Posición en el mundo
 */
export interface WorldPosition {
  worldId: string;
  x: number;
  y: number;
  z: number;
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Filtros de avatar
 */
export interface AvatarFilters {
  name?: string;
  ownerId?: string;
  worldId?: string;
  level?: NumberRange;
  status?: 'active' | 'inactive' | 'traveling';
  createdAt?: DateRange;
}

/**
 * Request de mundo
 */
export interface WorldRequest {
  action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'join' | 'leave';
  worldId?: string;
  data?: WorldData;
  filters?: WorldFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de mundo
 */
export interface WorldData {
  name?: string;
  description?: string;
  category?: string;
  settings?: WorldSettings;
  objects?: WorldObject[];
  avatars?: string[];
  metadata?: Record<string, any>;
}

/**
 * Configuración de mundo
 */
export interface WorldSettings {
  maxPlayers: number;
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
 * Objeto del mundo
 */
export interface WorldObject {
  id: string;
  type: string;
  position: WorldPosition;
  properties: Record<string, any>;
}

/**
 * Filtros de mundo
 */
export interface WorldFilters {
  name?: string;
  category?: string;
  ownerId?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  maxPlayers?: NumberRange;
  currentPlayers?: NumberRange;
  createdAt?: DateRange;
}

/**
 * Request de NFT
 */
export interface NFTRequest {
  action: 'mint' | 'transfer' | 'burn' | 'read' | 'list' | 'search';
  nftId?: string;
  data?: NFTData;
  filters?: NFTFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de NFT
 */
export interface NFTData {
  name?: string;
  description?: string;
  image?: string;
  attributes?: NFTAttribute[];
  metadata?: Record<string, any>;
  recipient?: string;
  amount?: number;
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
 * Filtros de NFT
 */
export interface NFTFilters {
  name?: string;
  ownerId?: string;
  contractAddress?: string;
  tokenId?: string;
  type?: string;
  rarity?: string;
  price?: NumberRange;
  createdAt?: DateRange;
}

/**
 * Request de transacción
 */
export interface TransactionRequest {
  action: 'send' | 'read' | 'list' | 'estimate';
  transactionId?: string;
  data?: TransactionData;
  filters?: TransactionFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de transacción
 */
export interface TransactionData {
  to?: string;
  value?: string;
  data?: string;
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
}

/**
 * Filtros de transacción
 */
export interface TransactionFilters {
  from?: string;
  to?: string;
  type?: string;
  status?: string;
  value?: NumberRange;
  gasUsed?: NumberRange;
  createdAt?: DateRange;
}

/**
 * Request de marketplace
 */
export interface MarketplaceRequest {
  action: 'list' | 'buy' | 'sell' | 'bid' | 'offer' | 'read' | 'search';
  listingId?: string;
  data?: MarketplaceData;
  filters?: MarketplaceFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de marketplace
 */
export interface MarketplaceData {
  nftId?: string;
  price?: string;
  currency?: string;
  auction?: AuctionData;
  offer?: OfferData;
  metadata?: Record<string, any>;
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
}

/**
 * Datos de oferta
 */
export interface OfferData {
  amount: string;
  currency: string;
  expiresAt: number;
}

/**
 * Filtros de marketplace
 */
export interface MarketplaceFilters {
  nftId?: string;
  sellerId?: string;
  buyerId?: string;
  price?: NumberRange;
  currency?: string;
  status?: string;
  type?: 'fixed' | 'auction' | 'offer';
  createdAt?: DateRange;
}

/**
 * Request de chat
 */
export interface ChatRequest {
  action: 'send' | 'read' | 'list' | 'delete';
  messageId?: string;
  data?: ChatData;
  filters?: ChatFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de chat
 */
export interface ChatData {
  content?: string;
  type?: 'text' | 'voice' | 'emote' | 'system';
  target?: string;
  replyTo?: string;
  attachments?: ChatAttachment[];
  metadata?: Record<string, any>;
}

/**
 * Adjunto de chat
 */
export interface ChatAttachment {
  type: 'image' | 'audio' | 'video' | 'file' | 'nft';
  url: string;
  name?: string;
  size?: number;
  metadata?: Record<string, any>;
}

/**
 * Filtros de chat
 */
export interface ChatFilters {
  senderId?: string;
  receiverId?: string;
  type?: string;
  content?: string;
  createdAt?: DateRange;
}

/**
 * Request de analytics
 */
export interface AnalyticsRequest {
  action: 'track' | 'read' | 'report';
  eventId?: string;
  data?: AnalyticsData;
  filters?: AnalyticsFilters;
  pagination?: PaginationParams;
}

/**
 * Datos de analytics
 */
export interface AnalyticsData {
  event?: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

/**
 * Filtros de analytics
 */
export interface AnalyticsFilters {
  event?: string;
  category?: string;
  userId?: string;
  sessionId?: string;
  dateRange?: DateRange;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Rango de números
 */
export interface NumberRange {
  min?: number;
  max?: number;
  gte?: number;
  lte?: number;
}

/**
 * Rango de fechas
 */
export interface DateRange {
  start?: Date;
  end?: Date;
  gte?: Date;
  lte?: Date;
}

/**
 * Utilidades de request
 */
export interface RequestUtils {
  /**
   * Valida request
   */
  validateRequest: (request: APIRequest) => boolean;
  
  /**
   * Serializa request
   */
  serializeRequest: (request: APIRequest) => string;
  
  /**
   * Deserializa request
   */
  deserializeRequest: (data: string) => APIRequest;
  
  /**
   * Clona request
   */
  cloneRequest: (request: APIRequest) => APIRequest;
  
  /**
   * Combina requests
   */
  mergeRequests: (requests: APIRequest[]) => APIRequest;
  
  /**
   * Genera ID de request
   */
  generateRequestId: () => RequestId;
  
  /**
   * Valida URL
   */
  isValidUrl: (url: string) => boolean;
  
  /**
   * Construye URL con parámetros
   */
  buildUrl: (baseUrl: string, params: Record<string, any>) => string;
  
  /**
   * Parsea parámetros de URL
   */
  parseUrlParams: (url: string) => Record<string, string>;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  RequestId,
  APIRequest,
  RequestHeaders,
  RequestParams,
  RequestAuth,
  AuthCredentials,
  RequestMetadata,
  AuthRequest,
  UserRequest,
  UserData,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  AccessibilitySettings,
  UserFilters,
  AvatarRequest,
  AvatarData,
  AvatarAppearance,
  AvatarStats,
  WorldPosition,
  AvatarFilters,
  WorldRequest,
  WorldData,
  WorldSettings,
  PhysicsSettings,
  LightingSettings,
  AudioSettings,
  WorldPermissions,
  ModerationSettings,
  WorldObject,
  WorldFilters,
  NFTRequest,
  NFTData,
  NFTAttribute,
  NFTFilters,
  TransactionRequest,
  TransactionData,
  TransactionFilters,
  MarketplaceRequest,
  MarketplaceData,
  AuctionData,
  OfferData,
  MarketplaceFilters,
  ChatRequest,
  ChatData,
  ChatAttachment,
  ChatFilters,
  AnalyticsRequest,
  AnalyticsData,
  AnalyticsFilters,
  PaginationParams,
  NumberRange,
  DateRange,
  RequestUtils
};

export {
  HttpMethod,
  ContentType,
  AuthType
}; 