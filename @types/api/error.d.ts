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
  UNAUTHORIZED = 1000,
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  TOKEN_INVALID = 1003,
  TOKEN_MISSING = 1004,
  INSUFFICIENT_PERMISSIONS = 1005,
  ACCOUNT_LOCKED = 1006,
  ACCOUNT_DISABLED = 1007,
  WALLET_NOT_CONNECTED = 1008,
  WALLET_SIGNATURE_INVALID = 1009,
  WALLET_ADDRESS_MISMATCH = 1010,
  
  // Errores de validación (2000-2999)
  VALIDATION_ERROR = 2000,
  REQUIRED_FIELD_MISSING = 2001,
  INVALID_FORMAT = 2002,
  INVALID_LENGTH = 2003,
  INVALID_RANGE = 2004,
  INVALID_TYPE = 2005,
  INVALID_VALUE = 2006,
  DUPLICATE_VALUE = 2007,
  CONSTRAINT_VIOLATION = 2008,
  INVALID_EMAIL = 2009,
  INVALID_PASSWORD = 2010,
  INVALID_USERNAME = 2011,
  INVALID_WALLET_ADDRESS = 2012,
  INVALID_NFT_ID = 2013,
  INVALID_TRANSACTION_HASH = 2014,
  
  // Errores de recursos (3000-3999)
  RESOURCE_NOT_FOUND = 3000,
  USER_NOT_FOUND = 3001,
  AVATAR_NOT_FOUND = 3002,
  WORLD_NOT_FOUND = 3003,
  NFT_NOT_FOUND = 3004,
  TRANSACTION_NOT_FOUND = 3005,
  FILE_NOT_FOUND = 3006,
  ASSET_NOT_FOUND = 3007,
  COLLECTION_NOT_FOUND = 3008,
  MARKETPLACE_NOT_FOUND = 3009,
  CHAT_NOT_FOUND = 3010,
  
  // Errores de conflicto (4000-4999)
  RESOURCE_CONFLICT = 4000,
  USER_ALREADY_EXISTS = 4001,
  AVATAR_ALREADY_EXISTS = 4002,
  NFT_ALREADY_MINTED = 4003,
  TRANSACTION_ALREADY_EXISTS = 4004,
  DUPLICATE_REQUEST = 4005,
  CONCURRENT_MODIFICATION = 4006,
  RESOURCE_IN_USE = 4007,
  WORLD_FULL = 4008,
  INVENTORY_FULL = 4009,
  
  // Errores de límites (5000-5999)
  RATE_LIMIT_EXCEEDED = 5000,
  QUOTA_EXCEEDED = 5001,
  FILE_SIZE_LIMIT = 5002,
  REQUEST_SIZE_LIMIT = 5003,
  CONCURRENT_REQUESTS_LIMIT = 5004,
  SESSION_LIMIT = 5005,
  API_CALL_LIMIT = 5006,
  STORAGE_LIMIT = 5007,
  BANDWIDTH_LIMIT = 5008,
  
  // Errores de blockchain (6000-6999)
  BLOCKCHAIN_ERROR = 6000,
  TRANSACTION_FAILED = 6001,
  INSUFFICIENT_FUNDS = 6002,
  INSUFFICIENT_GAS = 6003,
  WRONG_NETWORK = 6004,
  CONTRACT_ERROR = 6005,
  NFT_MINTING_FAILED = 6006,
  NFT_TRANSFER_FAILED = 6007,
  SMART_CONTRACT_ERROR = 6008,
  BLOCKCHAIN_NETWORK_ERROR = 6009,
  WALLET_CONNECTION_ERROR = 6010,
  
  // Errores de metaverso (7000-7999)
  METAVERSE_ERROR = 7000,
  WORLD_LOADING_FAILED = 7001,
  AVATAR_SPAWN_FAILED = 7002,
  OBJECT_INTERACTION_FAILED = 7003,
  TELEPORT_FAILED = 7004,
  BUILDING_FAILED = 7005,
  SCRIPTING_ERROR = 7006,
  PHYSICS_ERROR = 7007,
  RENDERING_ERROR = 7008,
  AUDIO_ERROR = 7009,
  NETWORK_SYNC_ERROR = 7010,
  
  // Errores de marketplace (8000-8999)
  MARKETPLACE_ERROR = 8000,
  LISTING_FAILED = 8001,
  PURCHASE_FAILED = 8002,
  BID_FAILED = 8003,
  OFFER_FAILED = 8004,
  PAYMENT_FAILED = 8005,
  ESCROW_ERROR = 8006,
  ROYALTY_ERROR = 8007,
  AUCTION_ERROR = 8008,
  TRADING_ERROR = 8009,
  
  // Errores de sistema (9000-9999)
  INTERNAL_SERVER_ERROR = 9000,
  DATABASE_ERROR = 9001,
  CACHE_ERROR = 9002,
  QUEUE_ERROR = 9003,
  EXTERNAL_SERVICE_ERROR = 9004,
  CONFIGURATION_ERROR = 9005,
  ENCRYPTION_ERROR = 9006,
  DECRYPTION_ERROR = 9007,
  COMPRESSION_ERROR = 9008,
  DECOMPRESSION_ERROR = 9009,
  
  // Errores de red (10000-10999)
  NETWORK_ERROR = 10000,
  CONNECTION_TIMEOUT = 10001,
  REQUEST_TIMEOUT = 10002,
  DNS_ERROR = 10003,
  SSL_ERROR = 10004,
  PROXY_ERROR = 10005,
  GATEWAY_ERROR = 10006,
  SERVICE_UNAVAILABLE = 10007,
  BANDWIDTH_ERROR = 10008,
  LATENCY_ERROR = 10009,
  
  // Errores de seguridad (11000-11999)
  SECURITY_ERROR = 11000,
  CSRF_ERROR = 11001,
  XSS_ERROR = 11002,
  SQL_INJECTION_ERROR = 11003,
  BRUTE_FORCE_ERROR = 11004,
  DDOS_ERROR = 11005,
  MALWARE_ERROR = 11006,
  PHISHING_ERROR = 11007,
  SPOOFING_ERROR = 11008,
  MAN_IN_THE_MIDDLE_ERROR = 11009,
  
  // Errores de integración (12000-12999)
  INTEGRATION_ERROR = 12000,
  API_INTEGRATION_ERROR = 12001,
  WEBHOOK_ERROR = 12002,
  OAUTH_ERROR = 12003,
  PAYMENT_GATEWAY_ERROR = 12004,
  ANALYTICS_ERROR = 12005,
  NOTIFICATION_ERROR = 12006,
  STORAGE_ERROR = 12007,
  CDN_ERROR = 12008,
  EMAIL_ERROR = 12009,
  
  // Errores de mantenimiento (13000-13999)
  MAINTENANCE_ERROR = 13000,
  SYSTEM_MAINTENANCE = 13001,
  DATABASE_MAINTENANCE = 13002,
  NETWORK_MAINTENANCE = 13003,
  UPGRADE_ERROR = 13004,
  MIGRATION_ERROR = 13005,
  BACKUP_ERROR = 13006,
  RESTORE_ERROR = 13007,
  CLEANUP_ERROR = 13008,
  OPTIMIZATION_ERROR = 13009,
  
  // Errores desconocidos (99999)
  UNKNOWN_ERROR = 99999
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

/**
 * Categorías de error
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RESOURCE = 'resource',
  CONFLICT = 'conflict',
  LIMIT = 'limit',
  BLOCKCHAIN = 'blockchain',
  METAVERSE = 'metaverse',
  MARKETPLACE = 'marketplace',
  SYSTEM = 'system',
  NETWORK = 'network',
  SECURITY = 'security',
  INTEGRATION = 'integration',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Error de API
 */
export interface APIError {
  id: ErrorId;
  code: ErrorCode;
  message: string;
  description?: string;
  details?: string;
  field?: string;
  value?: any;
  suggestions?: string[];
  severity: ErrorSeverity;
  category: ErrorCategory;
  
  // Información de contexto
  context: ErrorContext;
  
  // Información de stack
  stack?: string;
  
  // Información de causa
  cause?: APIError;
  
  // Metadatos
  metadata: ErrorMetadata;
  
  // Información de seguimiento
  trace: ErrorTrace;
}

/**
 * Contexto del error
 */
export interface ErrorContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
  environment: string;
  version: string;
  custom?: Record<string, any>;
}

/**
 * Metadatos del error
 */
export interface ErrorMetadata {
  retryable: boolean;
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  priority: number;
  tags: string[];
  labels: Record<string, string>;
  custom?: Record<string, any>;
}

/**
 * Trazabilidad del error
 */
export interface ErrorTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  service: string;
  operation: string;
  duration?: number;
  startTime: number;
  endTime?: number;
  steps: ErrorTraceStep[];
}

/**
 * Paso de trazabilidad
 */
export interface ErrorTraceStep {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'error' | 'timeout';
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE ERROR ESPECÍFICOS
// ============================================================================

/**
 * Error de autenticación
 */
export interface AuthenticationError extends APIError {
  category: ErrorCategory.AUTHENTICATION;
  authType?: string;
  authMethod?: string;
  challenge?: string;
  expiresAt?: number;
}

/**
 * Error de autorización
 */
export interface AuthorizationError extends APIError {
  category: ErrorCategory.AUTHORIZATION;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requiredScopes?: string[];
  resource?: string;
  action?: string;
}

/**
 * Error de validación
 */
export interface ValidationError extends APIError {
  category: ErrorCategory.VALIDATION;
  field: string;
  value: any;
  expectedType?: string;
  expectedFormat?: string;
  expectedRange?: {
    min?: number;
    max?: number;
  };
  constraints?: string[];
  violations: ValidationViolation[];
}

/**
 * Violación de validación
 */
export interface ValidationViolation {
  field: string;
  value: any;
  constraint: string;
  message: string;
  code: string;
}

/**
 * Error de recurso no encontrado
 */
export interface ResourceNotFoundError extends APIError {
  category: ErrorCategory.RESOURCE;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  searchCriteria?: Record<string, any>;
}

/**
 * Error de conflicto de recursos
 */
export interface ResourceConflictError extends APIError {
  category: ErrorCategory.CONFLICT;
  resourceType: string;
  resourceId: string;
  conflictingField?: string;
  conflictingValue?: any;
  resolution?: string;
}

/**
 * Error de límite excedido
 */
export interface LimitExceededError extends APIError {
  category: ErrorCategory.LIMIT;
  limitType: string;
  currentValue: number;
  limitValue: number;
  resetTime?: number;
  window?: number;
}

/**
 * Error de blockchain
 */
export interface BlockchainError extends APIError {
  category: ErrorCategory.BLOCKCHAIN;
  network: string;
  chainId: number;
  transactionHash?: string;
  blockNumber?: number;
  contractAddress?: string;
  method?: string;
  gasUsed?: number;
  gasLimit?: number;
  gasPrice?: string;
  errorData?: string;
}

/**
 * Error del metaverso
 */
export interface MetaverseError extends APIError {
  category: ErrorCategory.METAVERSE;
  worldId?: string;
  avatarId?: string;
  objectId?: string;
  interactionType?: string;
  physicsData?: any;
  renderingData?: any;
  audioData?: any;
}

/**
 * Error del marketplace
 */
export interface MarketplaceError extends APIError {
  category: ErrorCategory.MARKETPLACE;
  listingId?: string;
  nftId?: string;
  buyerId?: string;
  sellerId?: string;
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  escrowId?: string;
}

/**
 * Error del sistema
 */
export interface SystemError extends APIError {
  category: ErrorCategory.SYSTEM;
  component: string;
  operation: string;
  systemCode?: string;
  systemMessage?: string;
  technicalDetails?: string;
}

/**
 * Error de red
 */
export interface NetworkError extends APIError {
  category: ErrorCategory.NETWORK;
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  retryCount?: number;
  connectionType?: string;
}

/**
 * Error de seguridad
 */
export interface SecurityError extends APIError {
  category: ErrorCategory.SECURITY;
  threatType: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  target?: string;
  attackVector?: string;
  mitigation?: string;
}

// ============================================================================
// TIPOS DE MANEJO DE ERRORES
// ============================================================================

/**
 * Configuración de manejo de errores
 */
export interface ErrorHandlingConfig {
  enabled: boolean;
  logErrors: boolean;
  reportErrors: boolean;
  retryErrors: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  fallback?: ErrorFallback;
  handlers: ErrorHandler[];
}

/**
 * Fallback de error
 */
export interface ErrorFallback {
  enabled: boolean;
  response: any;
  statusCode: number;
  headers?: Record<string, string>;
}

/**
 * Manejador de errores
 */
export interface ErrorHandler {
  id: string;
  name: string;
  type: ErrorHandlerType;
  enabled: boolean;
  priority: number;
  conditions: ErrorCondition[];
  actions: ErrorAction[];
}

/**
 * Tipos de manejadores
 */
export enum ErrorHandlerType {
  LOGGER = 'logger',
  NOTIFIER = 'notifier',
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CUSTOM = 'custom'
}

/**
 * Condición de error
 */
export interface ErrorCondition {
  field: 'code' | 'category' | 'severity' | 'field' | 'message';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'range';
  value: any;
  logicalOperator?: 'and' | 'or';
}

/**
 * Acción de error
 */
export interface ErrorAction {
  type: 'log' | 'notify' | 'retry' | 'fallback' | 'custom';
  config: Record<string, any>;
  delay?: number;
  maxExecutions?: number;
}

/**
 * Respuesta de error
 */
export interface ErrorResponse {
  success: false;
  error: APIError;
  timestamp: number;
  requestId: string;
  path: string;
  method: string;
  version: string;
}

// ============================================================================
// TIPOS DE LOGGING
// ============================================================================

/**
 * Log de error
 */
export interface ErrorLog {
  id: string;
  error: APIError;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  logger: string;
  message: string;
  context: Record<string, any>;
  tags: string[];
}

/**
 * Configuración de logging
 */
export interface ErrorLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  format: 'json' | 'text' | 'structured';
  destination: 'console' | 'file' | 'database' | 'external';
  retention: number;
  compression: boolean;
  encryption: boolean;
}

// ============================================================================
// TIPOS DE NOTIFICACIÓN
// ============================================================================

/**
 * Notificación de error
 */
export interface ErrorNotification {
  id: string;
  error: APIError;
  recipients: string[];
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: number;
  sentAt?: number;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
}

/**
 * Canal de notificación
 */
export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'slack' | 'discord' | 'webhook';
  config: Record<string, any>;
  template?: string;
  variables?: Record<string, any>;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de error
 */
export interface ErrorUtils {
  /**
   * Crea error de API
   */
  createError: (
    code: ErrorCode,
    message: string,
    context?: Partial<ErrorContext>
  ) => APIError;
  
  /**
   * Valida error
   */
  validateError: (error: APIError) => boolean;
  
  /**
   * Serializa error
   */
  serializeError: (error: APIError) => string;
  
  /**
   * Deserializa error
   */
  deserializeError: (data: string) => APIError;
  
  /**
   * Clona error
   */
  cloneError: (error: APIError) => APIError;
  
  /**
   * Combina errores
   */
  mergeErrors: (errors: APIError[]) => APIError;
  
  /**
   * Genera ID de error
   */
  generateErrorId: () => ErrorId;
  
  /**
   * Obtiene categoría por código
   */
  getCategoryByCode: (code: ErrorCode) => ErrorCategory;
  
  /**
   * Obtiene severidad por código
   */
  getSeverityByCode: (code: ErrorCode) => ErrorSeverity;
  
  /**
   * Verifica si es error recuperable
   */
  isRecoverableError: (error: APIError) => boolean;
  
  /**
   * Verifica si es error de red
   */
  isNetworkError: (error: APIError) => boolean;
  
  /**
   * Verifica si es error de autenticación
   */
  isAuthenticationError: (error: APIError) => boolean;
  
  /**
   * Verifica si es error de autorización
   */
  isAuthorizationError: (error: APIError) => boolean;
  
  /**
   * Verifica si es error de validación
   */
  isValidationError: (error: APIError) => boolean;
  
  /**
   * Verifica si es error de blockchain
   */
  isBlockchainError: (error: APIError) => boolean;
  
  /**
   * Formatea error para usuario
   */
  formatForUser: (error: APIError) => string;
  
  /**
   * Formatea error para desarrollador
   */
  formatForDeveloper: (error: APIError) => string;
  
  /**
   * Formatea error para logging
   */
  formatForLogging: (error: APIError) => string;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ErrorId,
  APIError,
  ErrorContext,
  ErrorMetadata,
  ErrorTrace,
  ErrorTraceStep,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ValidationViolation,
  ResourceNotFoundError,
  ResourceConflictError,
  LimitExceededError,
  BlockchainError,
  MetaverseError,
  MarketplaceError,
  SystemError,
  NetworkError,
  SecurityError,
  ErrorHandlingConfig,
  ErrorFallback,
  ErrorHandler,
  ErrorCondition,
  ErrorAction,
  ErrorResponse,
  ErrorLog,
  ErrorLoggingConfig,
  ErrorNotification,
  NotificationChannel,
  ErrorUtils
};

export {
  ErrorCode,
  ErrorSeverity,
  ErrorCategory,
  ErrorHandlerType
}; 