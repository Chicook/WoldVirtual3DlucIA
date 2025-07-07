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
  // Informational
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  IM_USED = 226,
  
  // Redirection
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  USE_PROXY = 305,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  
  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  MISDIRECTED_REQUEST = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  TOO_EARLY = 425,
  UPGRADE_REQUIRED = 426,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  VARIANT_ALSO_NEGOTIATES = 506,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508,
  NOT_EXTENDED = 510,
  NETWORK_AUTHENTICATION_REQUIRED = 511
}

/**
 * Tipos de respuesta
 */
export enum ResponseType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  REDIRECT = 'redirect'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Response de API
 */
export interface APIResponse<T = any> {
  id: ResponseId;
  type: ResponseType;
  status: HttpStatus;
  success: boolean;
  
  // Datos de la respuesta
  data?: T;
  
  // Información de error
  error?: APIError;
  
  // Información de paginación
  pagination?: PaginationInfo;
  
  // Headers de respuesta
  headers: ResponseHeaders;
  
  // Metadatos
  metadata: ResponseMetadata;
  
  // Información de caché
  cache?: CacheInfo;
}

/**
 * Error de API
 */
export interface APIError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  value?: any;
  suggestions?: string[];
  timestamp: number;
  requestId?: string;
  stack?: string;
  context?: Record<string, any>;
}

/**
 * Headers de respuesta
 */
export interface ResponseHeaders {
  'Content-Type': string;
  'Content-Length'?: string;
  'Cache-Control'?: string;
  'ETag'?: string;
  'Last-Modified'?: string;
  'X-Request-ID'?: string;
  'X-Response-Time'?: string;
  'X-Rate-Limit-Limit'?: string;
  'X-Rate-Limit-Remaining'?: string;
  'X-Rate-Limit-Reset'?: string;
  'X-Powered-By'?: string;
  'Access-Control-Allow-Origin'?: string;
  'Access-Control-Allow-Methods'?: string;
  'Access-Control-Allow-Headers'?: string;
  [key: string]: string | undefined;
}

/**
 * Metadatos de respuesta
 */
export interface ResponseMetadata {
  timestamp: number;
  version: string;
  endpoint: string;
  method: string;
  duration: number;
  size: number;
  compression?: string;
  encoding?: string;
  server: string;
  environment: string;
  custom?: Record<string, any>;
}

/**
 * Información de caché
 */
export interface CacheInfo {
  cached: boolean;
  cacheKey?: string;
  cacheTime?: number;
  expiresAt?: number;
  etag?: string;
  lastModified?: string;
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
  firstPage: number;
  lastPage: number;
}

// ============================================================================
// TIPOS DE RESPONSE ESPECÍFICOS
// ============================================================================

/**
 * Response de autenticación
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: UserData;
  permissions?: string[];
  scopes?: string[];
  error?: APIError;
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
  status: 'active' | 'inactive' | 'banned';
  role: string;
  permissions: string[];
  preferences: UserPreferences;
  createdAt: number;
  updatedAt: number;
  lastActive?: number;
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
 * Response de avatar
 */
export interface AvatarResponse {
  success: boolean;
  avatar?: AvatarData;
  avatars?: AvatarData[];
  pagination?: PaginationInfo;
  error?: APIError;
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
  inventory: InventoryItem[];
  stats: AvatarStats;
  position?: WorldPosition;
  status: 'active' | 'inactive' | 'traveling';
  createdAt: number;
  updatedAt: number;
  lastActive?: number;
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
 * Item del inventario
 */
export interface InventoryItem {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  maxQuantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  nftData?: NFTData;
  stats?: ItemStats;
}

/**
 * Datos NFT
 */
export interface NFTData {
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  metadata: any;
}

/**
 * Estadísticas del item
 */
export interface ItemStats {
  damage?: number;
  defense?: number;
  speed?: number;
  durability?: number;
  magic?: number;
}

/**
 * Estadísticas del avatar
 */
export interface AvatarStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  luck: number;
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
 * Response de mundo
 */
export interface WorldResponse {
  success: boolean;
  world?: WorldData;
  worlds?: WorldData[];
  pagination?: PaginationInfo;
  error?: APIError;
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
  settings: WorldSettings;
  objects: WorldObject[];
  avatars: string[];
  status: 'active' | 'inactive' | 'maintenance';
  maxPlayers: number;
  currentPlayers: number;
  createdAt: number;
  updatedAt: number;
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
 * Response de NFT
 */
export interface NFTResponse {
  success: boolean;
  nft?: NFTData;
  nfts?: NFTData[];
  pagination?: PaginationInfo;
  error?: APIError;
}

/**
 * Response de transacción
 */
export interface TransactionResponse {
  success: boolean;
  transaction?: TransactionData;
  transactions?: TransactionData[];
  pagination?: PaginationInfo;
  error?: APIError;
}

/**
 * Datos de transacción
 */
export interface TransactionData {
  id: string;
  hash: string;
  from: string;
  to?: string;
  value: string;
  data?: string;
  gasUsed: number;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: number;
  type: string;
}

/**
 * Response de marketplace
 */
export interface MarketplaceResponse {
  success: boolean;
  listing?: MarketplaceListing;
  listings?: MarketplaceListing[];
  pagination?: PaginationInfo;
  error?: APIError;
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
  auction?: AuctionData;
  offers: OfferData[];
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

/**
 * Datos de subasta
 */
export interface AuctionData {
  startPrice: string;
  currentPrice: string;
  reservePrice?: string;
  startTime: number;
  endTime: number;
  minBidIncrement: string;
  bids: AuctionBid[];
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  winner?: string;
}

/**
 * Puja de subasta
 */
export interface AuctionBid {
  bidder: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

/**
 * Datos de oferta
 */
export interface OfferData {
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
 * Response de chat
 */
export interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  messages?: ChatMessage[];
  pagination?: PaginationInfo;
  error?: APIError;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  type: 'text' | 'voice' | 'emote' | 'system';
  target?: string;
  replyTo?: string;
  attachments?: ChatAttachment[];
  timestamp: number;
  edited?: boolean;
  deleted?: boolean;
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
 * Response de analytics
 */
export interface AnalyticsResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: APIError;
}

/**
 * Datos de analytics
 */
export interface AnalyticsData {
  events: AnalyticsEvent[];
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  insights: AnalyticsInsights;
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
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

/**
 * Métricas de analytics
 */
export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  activeUsers: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  transactions: number;
}

/**
 * Tendencias de analytics
 */
export interface AnalyticsTrends {
  timeSeries: TimeSeriesData[];
  comparisons: ComparisonData[];
  forecasts: ForecastData[];
}

/**
 * Datos de serie temporal
 */
export interface TimeSeriesData {
  timestamp: number;
  value: number;
  label: string;
}

/**
 * Datos de comparación
 */
export interface ComparisonData {
  period: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

/**
 * Datos de pronóstico
 */
export interface ForecastData {
  timestamp: number;
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

/**
 * Insights de analytics
 */
export interface AnalyticsInsights {
  topEvents: string[];
  topUsers: string[];
  anomalies: AnomalyData[];
  recommendations: string[];
}

/**
 * Datos de anomalía
 */
export interface AnomalyData {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  value: number;
  expectedValue: number;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de response
 */
export interface ResponseUtils {
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
   * Crea response de éxito
   */
  createSuccessResponse: <T>(data: T, status?: HttpStatus) => APIResponse<T>;
  
  /**
   * Crea response de error
   */
  createErrorResponse: (error: APIError, status?: HttpStatus) => APIResponse;
  
  /**
   * Crea response de redirección
   */
  createRedirectResponse: (url: string, status?: HttpStatus) => APIResponse;
  
  /**
   * Valida código de estado
   */
  isValidStatus: (status: number) => boolean;
  
  /**
   * Obtiene mensaje de estado
   */
  getStatusMessage: (status: HttpStatus) => string;
  
  /**
   * Verifica si es respuesta de éxito
   */
  isSuccessResponse: (response: APIResponse) => boolean;
  
  /**
   * Verifica si es respuesta de error
   */
  isErrorResponse: (response: APIResponse) => boolean;
  
  /**
   * Extrae datos de response
   */
  extractData: <T>(response: APIResponse<T>) => T | undefined;
  
  /**
   * Extrae error de response
   */
  extractError: (response: APIResponse) => APIError | undefined;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ResponseId,
  APIResponse,
  APIError,
  ResponseHeaders,
  ResponseMetadata,
  CacheInfo,
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
  NFTData,
  ItemStats,
  AvatarStats,
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
  MarketplaceResponse,
  MarketplaceListing,
  AuctionData,
  AuctionBid,
  OfferData,
  ChatResponse,
  ChatMessage,
  ChatAttachment,
  AnalyticsResponse,
  AnalyticsData,
  AnalyticsEvent,
  AnalyticsMetrics,
  AnalyticsTrends,
  TimeSeriesData,
  ComparisonData,
  ForecastData,
  AnalyticsInsights,
  AnomalyData,
  ResponseUtils
};

export {
  HttpStatus,
  ResponseType
}; 