/**
 * @fileoverview Tipos para manejo de errores de API del metaverso
 * @module @types/api/error
 */

// ============================================================================
// TIPOS BÁSICOS DE ERROR
// ============================================================================

/**
 * Identificador único de un error
 */
export type ErrorId = string;

/**
 * Códigos de error del sistema
 */
export enum ErrorCode {
  // Errores de autenticación (1000-1999)
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_WALLET_NOT_CONNECTED = 'AUTH_WALLET_NOT_CONNECTED',
  AUTH_SIGNATURE_INVALID = 'AUTH_SIGNATURE_INVALID',
  
  // Errores de validación (2000-2999)
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_VALUE = 'VALIDATION_INVALID_VALUE',
  VALIDATION_STRING_TOO_LONG = 'VALIDATION_STRING_TOO_LONG',
  VALIDATION_STRING_TOO_SHORT = 'VALIDATION_STRING_TOO_SHORT',
  VALIDATION_NUMBER_TOO_LARGE = 'VALIDATION_NUMBER_TOO_LARGE',
  VALIDATION_NUMBER_TOO_SMALL = 'VALIDATION_NUMBER_TOO_SMALL',
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_URL = 'VALIDATION_INVALID_URL',
  VALIDATION_INVALID_DATE = 'VALIDATION_INVALID_DATE',
  
  // Errores de recursos (3000-3999)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  RESOURCE_DELETED = 'RESOURCE_DELETED',
  RESOURCE_INVALID_STATE = 'RESOURCE_INVALID_STATE',
  
  // Errores de usuario (4000-4999)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_BANNED = 'USER_BANNED',
  USER_QUOTA_EXCEEDED = 'USER_QUOTA_EXCEEDED',
  USER_PROFILE_INCOMPLETE = 'USER_PROFILE_INCOMPLETE',
  
  // Errores de avatar (5000-5999)
  AVATAR_NOT_FOUND = 'AVATAR_NOT_FOUND',
  AVATAR_INVALID_MODEL = 'AVATAR_INVALID_MODEL',
  AVATAR_CUSTOMIZATION_FAILED = 'AVATAR_CUSTOMIZATION_FAILED',
  AVATAR_POSITION_INVALID = 'AVATAR_POSITION_INVALID',
  AVATAR_INVENTORY_FULL = 'AVATAR_INVENTORY_FULL',
  AVATAR_ITEM_NOT_FOUND = 'AVATAR_ITEM_NOT_FOUND',
  
  // Errores de mundo (6000-6999)
  WORLD_NOT_FOUND = 'WORLD_NOT_FOUND',
  WORLD_ACCESS_DENIED = 'WORLD_ACCESS_DENIED',
  WORLD_FULL = 'WORLD_FULL',
  WORLD_MAINTENANCE = 'WORLD_MAINTENANCE',
  WORLD_INVALID_POSITION = 'WORLD_INVALID_POSITION',
  WORLD_OBJECT_NOT_FOUND = 'WORLD_OBJECT_NOT_FOUND',
  WORLD_BUILDING_DISABLED = 'WORLD_BUILDING_DISABLED',
  
  // Errores de blockchain (7000-7999)
  BLOCKCHAIN_NETWORK_ERROR = 'BLOCKCHAIN_NETWORK_ERROR',
  BLOCKCHAIN_TRANSACTION_FAILED = 'BLOCKCHAIN_TRANSACTION_FAILED',
  BLOCKCHAIN_INSUFFICIENT_FUNDS = 'BLOCKCHAIN_INSUFFICIENT_FUNDS',
  BLOCKCHAIN_GAS_LIMIT_EXCEEDED = 'BLOCKCHAIN_GAS_LIMIT_EXCEEDED',
  BLOCKCHAIN_CONTRACT_ERROR = 'BLOCKCHAIN_CONTRACT_ERROR',
  BLOCKCHAIN_NFT_NOT_FOUND = 'BLOCKCHAIN_NFT_NOT_FOUND',
  BLOCKCHAIN_NFT_ALREADY_MINTED = 'BLOCKCHAIN_NFT_ALREADY_MINTED',
  BLOCKCHAIN_WALLET_NOT_SUPPORTED = 'BLOCKCHAIN_WALLET_NOT_SUPPORTED',
  
  // Errores de marketplace (8000-8999)
  MARKETPLACE_LISTING_NOT_FOUND = 'MARKETPLACE_LISTING_NOT_FOUND',
  MARKETPLACE_INSUFFICIENT_BALANCE = 'MARKETPLACE_INSUFFICIENT_BALANCE',
  MARKETPLACE_AUCTION_ENDED = 'MARKETPLACE_AUCTION_ENDED',
  MARKETPLACE_BID_TOO_LOW = 'MARKETPLACE_BID_TOO_LOW',
  MARKETPLACE_OFFER_EXPIRED = 'MARKETPLACE_OFFER_EXPIRED',
  MARKETPLACE_TRADE_FAILED = 'MARKETPLACE_TRADE_FAILED',
  
  // Errores de chat (9000-9999)
  CHAT_ROOM_NOT_FOUND = 'CHAT_ROOM_NOT_FOUND',
  CHAT_MESSAGE_TOO_LONG = 'CHAT_MESSAGE_TOO_LONG',
  CHAT_RATE_LIMIT_EXCEEDED = 'CHAT_RATE_LIMIT_EXCEEDED',
  CHAT_USER_MUTED = 'CHAT_USER_MUTED',
  CHAT_USER_BANNED = 'CHAT_USER_BANNED',
  CHAT_ATTACHMENT_TOO_LARGE = 'CHAT_ATTACHMENT_TOO_LARGE',
  
  // Errores de archivos (10000-10999)
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE = 'FILE_INVALID_TYPE',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_ACCESS_DENIED = 'FILE_ACCESS_DENIED',
  
  // Errores de rate limiting (11000-11999)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_TOO_MANY_REQUESTS = 'RATE_LIMIT_TOO_MANY_REQUESTS',
  RATE_LIMIT_ACCOUNT_SUSPENDED = 'RATE_LIMIT_ACCOUNT_SUSPENDED',
  
  // Errores de servidor (12000-12999)
  SERVER_INTERNAL_ERROR = 'SERVER_INTERNAL_ERROR',
  SERVER_DATABASE_ERROR = 'SERVER_DATABASE_ERROR',
  SERVER_CACHE_ERROR = 'SERVER_CACHE_ERROR',
  SERVER_EXTERNAL_SERVICE_ERROR = 'SERVER_EXTERNAL_SERVICE_ERROR',
  SERVER_MAINTENANCE = 'SERVER_MAINTENANCE',
  SERVER_OVERLOADED = 'SERVER_OVERLOADED',
  
  // Errores de red (13000-13999)
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_FAILED = 'NETWORK_CONNECTION_FAILED',
  NETWORK_DNS_ERROR = 'NETWORK_DNS_ERROR',
  NETWORK_SSL_ERROR = 'NETWORK_SSL_ERROR',
  
  // Errores de configuración (14000-14999)
  CONFIG_MISSING = 'CONFIG_MISSING',
  CONFIG_INVALID = 'CONFIG_INVALID',
  CONFIG_ENVIRONMENT_ERROR = 'CONFIG_ENVIRONMENT_ERROR',
  
  // Errores desconocidos (99999)
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Categorías de error
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RESOURCE = 'resource',
  USER = 'user',
  AVATAR = 'avatar',
  WORLD = 'world',
  BLOCKCHAIN = 'blockchain',
  MARKETPLACE = 'marketplace',
  CHAT = 'chat',
  FILE = 'file',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  NETWORK = 'network',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown'
}

/**
 * Niveles de severidad
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Error base del sistema
 */
export interface BaseError {
  id: ErrorId;
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: number;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  context?: ErrorContext;
  metadata?: Record<string, any>;
}

/**
 * Contexto del error
 */
export interface ErrorContext {
  url?: string;
  method?: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  ipAddress?: string;
  userAgent?: string;
  stack?: string;
  cause?: BaseError;
}

/**
 * Error de API
 */
export interface APIError extends BaseError {
  status: number;
  title: string;
  type: string;
  instance?: string;
  errors?: ValidationError[];
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
  path?: string[];
}

/**
 * Error de autenticación
 */
export interface AuthError extends BaseError {
  authType?: string;
  scopes?: string[];
  permissions?: string[];
  tokenType?: string;
  expiresAt?: number;
}

/**
 * Error de autorización
 */
export interface AuthorizationError extends BaseError {
  requiredPermissions: string[];
  requiredRoles: string[];
  userPermissions: string[];
  userRoles: string[];
  resource?: string;
  action?: string;
}

/**
 * Error de validación de datos
 */
export interface ValidationError extends BaseError {
  field: string;
  value?: any;
  constraints: Record<string, any>;
  violations: ValidationViolation[];
}

/**
 * Violación de validación
 */
export interface ValidationViolation {
  constraint: string;
  message: string;
  value?: any;
  params?: Record<string, any>;
}

/**
 * Error de recurso
 */
export interface ResourceError extends BaseError {
  resourceType: string;
  resourceId: string;
  action: string;
  currentState?: string;
  expectedState?: string;
}

/**
 * Error de usuario
 */
export interface UserError extends BaseError {
  userId: string;
  action: string;
  userState: string;
  restrictions?: string[];
}

/**
 * Error de avatar
 */
export interface AvatarError extends BaseError {
  avatarId: string;
  action: string;
  avatarState: string;
  position?: {
    x: number;
    y: number;
    z: number;
    worldId: string;
  };
}

/**
 * Error de mundo
 */
export interface WorldError extends BaseError {
  worldId: string;
  action: string;
  worldState: string;
  playerCount: number;
  maxPlayers: number;
  permissions?: string[];
}

/**
 * Error de blockchain
 */
export interface BlockchainError extends BaseError {
  network: string;
  transactionHash?: string;
  contractAddress?: string;
  method?: string;
  gasUsed?: number;
  gasLimit?: number;
  errorData?: string;
}

/**
 * Error de marketplace
 */
export interface MarketplaceError extends BaseError {
  listingId?: string;
  nftId?: string;
  action: string;
  price?: string;
  currency?: string;
  balance?: string;
}

/**
 * Error de chat
 */
export interface ChatError extends BaseError {
  roomId?: string;
  messageId?: string;
  action: string;
  content?: string;
  attachments?: string[];
}

/**
 * Error de archivo
 */
export interface FileError extends BaseError {
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  action: string;
  maxSize?: number;
  allowedTypes?: string[];
}

/**
 * Error de rate limiting
 */
export interface RateLimitError extends BaseError {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
  window: number;
}

/**
 * Error de servidor
 */
export interface ServerError extends BaseError {
  service: string;
  operation: string;
  retryable: boolean;
  retryAfter?: number;
  fallback?: string;
}

/**
 * Error de red
 */
export interface NetworkError extends BaseError {
  endpoint: string;
  timeout: number;
  retries: number;
  lastAttempt: number;
  nextRetry?: number;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Información de debugging
 */
export interface DebugInfo {
  requestId: string;
  timestamp: number;
  environment: string;
  version: string;
  build: string;
  stack: string;
  memory: {
    used: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
  };
  performance: {
    duration: number;
    cpu: number;
    memory: number;
  };
}

/**
 * Información de reporte
 */
export interface ErrorReport {
  error: BaseError;
  debug: DebugInfo;
  user: {
    id?: string;
    username?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  session: {
    id?: string;
    startTime?: number;
    duration?: number;
  };
  system: {
    os: string;
    browser?: string;
    device?: string;
    screen?: {
      width: number;
      height: number;
    };
  };
}

/**
 * Configuración de manejo de errores
 */
export interface ErrorHandlerConfig {
  logErrors: boolean;
  reportErrors: boolean;
  showUserFriendlyMessages: boolean;
  includeStackTraces: boolean;
  maxErrorLength: number;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  rateLimitConfig: {
    maxErrorsPerMinute: number;
    maxErrorsPerHour: number;
    blockDuration: number;
  };
}

/**
 * Utilidades de manejo de errores
 */
export interface ErrorUtils {
  /**
   * Crea error base
   */
  createError: (
    code: ErrorCode,
    message: string,
    category?: ErrorCategory,
    severity?: ErrorSeverity
  ) => BaseError;
  
  /**
   * Crea error de API
   */
  createAPIError: (
    code: ErrorCode,
    message: string,
    status: number,
    title?: string
  ) => APIError;
  
  /**
   * Crea error de validación
   */
  createValidationError: (
    field: string,
    message: string,
    value?: any,
    constraints?: Record<string, any>
  ) => ValidationError;
  
  /**
   * Crea error de autenticación
   */
  createAuthError: (
    code: ErrorCode,
    message: string,
    authType?: string
  ) => AuthError;
  
  /**
   * Crea error de autorización
   */
  createAuthorizationError: (
    requiredPermissions: string[],
    userPermissions: string[],
    resource?: string,
    action?: string
  ) => AuthorizationError;
  
  /**
   * Crea error de recurso
   */
  createResourceError: (
    resourceType: string,
    resourceId: string,
    action: string,
    message?: string
  ) => ResourceError;
  
  /**
   * Crea error de rate limiting
   */
  createRateLimitError: (
    limit: number,
    remaining: number,
    reset: number,
    retryAfter: number
  ) => RateLimitError;
  
  /**
   * Valida error
   */
  validateError: (error: BaseError) => boolean;
  
  /**
   * Serializa error
   */
  serializeError: (error: BaseError) => string;
  
  /**
   * Deserializa error
   */
  deserializeError: (data: string) => BaseError;
  
  /**
   * Clona error
   */
  cloneError: (error: BaseError) => BaseError;
  
  /**
   * Combina errores
   */
  mergeErrors: (errors: BaseError[]) => BaseError;
  
  /**
   * Genera ID de error
   */
  generateErrorId: () => ErrorId;
  
  /**
   * Verifica si es error recuperable
   */
  isRecoverableError: (error: BaseError) => boolean;
  
  /**
   * Verifica si es error de red
   */
  isNetworkError: (error: BaseError) => boolean;
  
  /**
   * Verifica si es error de servidor
   */
  isServerError: (error: BaseError) => boolean;
  
  /**
   * Verifica si es error de cliente
   */
  isClientError: (error: BaseError) => boolean;
  
  /**
   * Obtiene mensaje amigable para el usuario
   */
  getUserFriendlyMessage: (error: BaseError) => string;
  
  /**
   * Obtiene sugerencias de solución
   */
  getSuggestions: (error: BaseError) => string[];
  
  /**
   * Registra error
   */
  logError: (error: BaseError, context?: Record<string, any>) => void;
  
  /**
   * Reporta error
   */
  reportError: (error: BaseError, report?: ErrorReport) => Promise<void>;
  
  /**
   * Maneja error
   */
  handleError: (error: BaseError, config?: ErrorHandlerConfig) => void;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de error
 */
export interface ErrorEvent {
  type: 'error_occurred' | 'error_handled' | 'error_reported' | 'error_resolved';
  error: BaseError;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Listener de errores
 */
export interface ErrorListener {
  onError: (event: ErrorEvent) => void;
  onErrorHandled: (event: ErrorEvent) => void;
  onErrorReported: (event: ErrorEvent) => void;
  onErrorResolved: (event: ErrorEvent) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ErrorId,
  BaseError,
  ErrorContext,
  APIError,
  AuthError,
  AuthorizationError,
  ValidationError,
  ValidationViolation,
  ResourceError,
  UserError,
  AvatarError,
  WorldError,
  BlockchainError,
  MarketplaceError,
  ChatError,
  FileError,
  RateLimitError,
  ServerError,
  NetworkError,
  DebugInfo,
  ErrorReport,
  ErrorHandlerConfig,
  ErrorUtils,
  ErrorEvent,
  ErrorListener
};

export {
  ErrorCode,
  ErrorCategory,
  ErrorSeverity
}; 