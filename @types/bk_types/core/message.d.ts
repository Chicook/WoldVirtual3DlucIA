/**
 * 📡 Tipos del Sistema de Mensajería Inter-Módulo
 * 
 * Definiciones TypeScript para la comunicación entre módulos
 * Aprovecha las fortalezas de TypeScript: tipado fuerte, eventos, callbacks
 */

// ============================================================================
// TIPOS FUNDAMENTALES DE MENSAJERÍA
// ============================================================================

/**
 * Datos de un mensaje
 */
export type MessageData = any;

/**
 * Prioridad de un mensaje
 */
export type MessagePriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * Token de suscripción para eventos
 */
export type SubscriptionToken = string;

/**
 * Handler de eventos
 */
export type EventHandler = (data: MessageData) => void | Promise<void>;

/**
 * Callback para respuestas
 */
export type ResponseCallback<T = any> = (response: T) => void;

/**
 * Callback para errores
 */
export type ErrorCallback = (error: Error) => void;

// ============================================================================
// INTERFACES DE MENSAJES
// ============================================================================

/**
 * Mensaje base del sistema
 */
export interface BaseMessage {
  id: string;
  type: string;
  timestamp: Date;
  priority: MessagePriority;
  source: string;
  target?: string;
  data: MessageData;
  metadata?: Record<string, any>;
}

/**
 * Mensaje de solicitud
 */
export interface RequestMessage extends BaseMessage {
  type: 'request';
  target: string;
  correlationId: string;
  timeout?: number;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Mensaje de respuesta
 */
export interface ResponseMessage extends BaseMessage {
  type: 'response';
  correlationId: string;
  success: boolean;
  error?: string;
  processingTime: number;
}

/**
 * Mensaje de evento
 */
export interface EventMessage extends BaseMessage {
  type: 'event';
  eventName: string;
  broadcast: boolean;
  subscribers?: string[];
}

/**
 * Mensaje de notificación
 */
export interface NotificationMessage extends BaseMessage {
  type: 'notification';
  notificationType: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  duration?: number;
}

/**
 * Mensaje de comando
 */
export interface CommandMessage extends BaseMessage {
  type: 'command';
  command: string;
  parameters: Record<string, any>;
  target: string;
  requiresResponse: boolean;
}

/**
 * Mensaje de estado
 */
export interface StateMessage extends BaseMessage {
  type: 'state';
  stateType: 'update' | 'sync' | 'reset';
  stateData: any;
  previousState?: any;
}

// ============================================================================
// INTERFACES DE CANALES Y SUSCRIPCIONES
// ============================================================================

/**
 * Canal de comunicación
 */
export interface MessageChannel {
  name: string;
  subscribers: Set<EventHandler>;
  messageQueue: BaseMessage[];
  maxQueueSize: number;
  isActive: boolean;
  createdAt: Date;
  lastMessageAt?: Date;
  messageCount: number;
  errorCount: number;
}

/**
 * Suscripción a un canal
 */
export interface ChannelSubscription {
  token: SubscriptionToken;
  channelName: string;
  handler: EventHandler;
  createdAt: Date;
  isActive: boolean;
  messageCount: number;
  lastMessageAt?: Date;
}

/**
 * Configuración de un canal
 */
export interface ChannelConfig {
  name: string;
  maxQueueSize: number;
  maxSubscribers: number;
  messageTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  priority: MessagePriority;
  persistence: boolean;
  encryption: boolean;
}

// ============================================================================
// INTERFACES DE RENDIMIENTO Y MÉTRICAS
// ============================================================================

/**
 * Métricas de rendimiento de mensajería
 */
export interface MessageMetrics {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  averageLatency: number;
  averageQueueSize: number;
  errorRate: number;
  throughput: number; // mensajes por segundo
  lastUpdated: Date;
}

/**
 * Métricas por canal
 */
export interface ChannelMetrics {
  channelName: string;
  messageCount: number;
  subscriberCount: number;
  averageLatency: number;
  errorRate: number;
  queueSize: number;
  lastMessageAt?: Date;
}

/**
 * Métricas por prioridad
 */
export interface PriorityMetrics {
  priority: MessagePriority;
  messageCount: number;
  averageLatency: number;
  errorRate: number;
  queueSize: number;
}

// ============================================================================
// INTERFACES DE CONFIGURACIÓN Y CONTROL
// ============================================================================

/**
 * Configuración del sistema de mensajería
 */
export interface MessageBusConfig {
  maxChannels: number;
  maxSubscribersPerChannel: number;
  defaultMessageTimeout: number;
  defaultRetryAttempts: number;
  defaultRetryDelay: number;
  enableMetrics: boolean;
  enablePersistence: boolean;
  enableEncryption: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  performanceMonitoring: boolean;
  autoCleanup: boolean;
  cleanupInterval: number;
}

/**
 * Configuración de reintentos
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
}

/**
 * Configuración de timeout
 */
export interface TimeoutConfig {
  defaultTimeout: number;
  criticalTimeout: number;
  highTimeout: number;
  normalTimeout: number;
  lowTimeout: number;
  timeoutHandler?: (message: BaseMessage) => void;
}

// ============================================================================
// INTERFACES DE PERSISTENCIA Y CACHE
// ============================================================================

/**
 * Mensaje persistente
 */
export interface PersistentMessage extends BaseMessage {
  persistenceId: string;
  expiresAt?: Date;
  ttl: number;
  isPersistent: true;
}

/**
 * Configuración de persistencia
 */
export interface PersistenceConfig {
  enabled: boolean;
  storageType: 'memory' | 'localStorage' | 'indexedDB' | 'redis';
  maxMessages: number;
  ttl: number;
  compression: boolean;
  encryption: boolean;
}

/**
 * Configuración de cache
 */
export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  ttl: number;
  strategy: 'lru' | 'fifo' | 'lfu';
  compression: boolean;
}

// ============================================================================
// INTERFACES DE SEGURIDAD Y AUTENTICACIÓN
// ============================================================================

/**
 * Mensaje autenticado
 */
export interface AuthenticatedMessage extends BaseMessage {
  signature: string;
  publicKey: string;
  timestamp: Date;
  nonce: string;
}

/**
 * Configuración de seguridad
 */
export interface SecurityConfig {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  signature: boolean;
  allowedOrigins: string[];
  rateLimiting: boolean;
  maxMessagesPerSecond: number;
}

/**
 * Permisos de mensajería
 */
export interface MessagePermissions {
  canPublish: boolean;
  canSubscribe: boolean;
  canCreateChannels: boolean;
  canDeleteChannels: boolean;
  allowedChannels: string[];
  deniedChannels: string[];
}

// ============================================================================
// INTERFACES DE MONITOREO Y DEBUGGING
// ============================================================================

/**
 * Evento de monitoreo
 */
export interface MonitoringEvent {
  type: 'message_sent' | 'message_received' | 'message_failed' | 'channel_created' | 'channel_deleted' | 'subscriber_added' | 'subscriber_removed';
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Log de mensajería
 */
export interface MessageLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  stack?: string;
}

/**
 * Configuración de logging
 */
export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  maxLogs: number;
  persistence: boolean;
  format: 'json' | 'text';
  includeTimestamp: boolean;
  includeMetadata: boolean;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Función de filtro de mensajes
 */
export type MessageFilter = (message: BaseMessage) => boolean;

/**
 * Función de transformación de mensajes
 */
export type MessageTransformer = (message: BaseMessage) => BaseMessage;

/**
 * Función de validación de mensajes
 */
export type MessageValidator = (message: BaseMessage) => boolean | Promise<boolean>;

/**
 * Función de middleware de mensajes
 */
export type MessageMiddleware = (message: BaseMessage, next: () => void) => void | Promise<void>;

/**
 * Función de callback para eventos de monitoreo
 */
export type MonitoringCallback = (event: MonitoringEvent) => void;

/**
 * Función de callback para logs
 */
export type LoggingCallback = (log: MessageLog) => void;

// ============================================================================
// UNION TYPES
// ============================================================================

/**
 * Todos los tipos de mensajes
 */
export type Message = 
  | RequestMessage 
  | ResponseMessage 
  | EventMessage 
  | NotificationMessage 
  | CommandMessage 
  | StateMessage;

/**
 * Todos los tipos de configuración
 */
export type Config = 
  | MessageBusConfig 
  | ChannelConfig 
  | RetryConfig 
  | TimeoutConfig 
  | PersistenceConfig 
  | CacheConfig 
  | SecurityConfig 
  | LoggingConfig;

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  MessageData,
  MessagePriority,
  SubscriptionToken,
  EventHandler,
  ResponseCallback,
  ErrorCallback,
  MessageFilter,
  MessageTransformer,
  MessageValidator,
  MessageMiddleware,
  MonitoringCallback,
  LoggingCallback,
  Message,
  Config
};

export {
  BaseMessage,
  RequestMessage,
  ResponseMessage,
  EventMessage,
  NotificationMessage,
  CommandMessage,
  StateMessage,
  MessageChannel,
  ChannelSubscription,
  ChannelConfig,
  MessageMetrics,
  ChannelMetrics,
  PriorityMetrics,
  MessageBusConfig,
  RetryConfig,
  TimeoutConfig,
  PersistentMessage,
  PersistenceConfig,
  CacheConfig,
  AuthenticatedMessage,
  SecurityConfig,
  MessagePermissions,
  MonitoringEvent,
  MessageLog,
  LoggingConfig
}; 