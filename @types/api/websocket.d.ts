/**
 * @fileoverview Tipos para WebSocket del metaverso
 * @module @types/api/websocket
 */

// ============================================================================
// TIPOS BÁSICOS DE WEBSOCKET
// ============================================================================

/**
 * Identificador único de una conexión WebSocket
 */
export type WebSocketId = string;

/**
 * Estados de conexión WebSocket
 */
export enum WebSocketState {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed'
}

/**
 * Tipos de mensajes WebSocket
 */
export enum WebSocketMessageType {
  // Mensajes de conexión
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  HEARTBEAT = 'heartbeat',
  
  // Mensajes de autenticación
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  
  // Mensajes de mundo
  WORLD_JOIN = 'world_join',
  WORLD_LEAVE = 'world_leave',
  WORLD_UPDATE = 'world_update',
  WORLD_SYNC = 'world_sync',
  
  // Mensajes de avatar
  AVATAR_UPDATE = 'avatar_update',
  AVATAR_MOVE = 'avatar_move',
  AVATAR_ANIMATE = 'avatar_animate',
  AVATAR_INTERACT = 'avatar_interact',
  
  // Mensajes de chat
  CHAT_MESSAGE = 'chat_message',
  CHAT_TYPING = 'chat_typing',
  CHAT_READ = 'chat_read',
  
  // Mensajes de objetos
  OBJECT_CREATE = 'object_create',
  OBJECT_UPDATE = 'object_update',
  OBJECT_DELETE = 'object_delete',
  OBJECT_INTERACT = 'object_interact',
  
  // Mensajes de eventos
  EVENT_TRIGGER = 'event_trigger',
  EVENT_BROADCAST = 'event_broadcast',
  
  // Mensajes de blockchain
  TRANSACTION_UPDATE = 'transaction_update',
  NFT_UPDATE = 'nft_update',
  BALANCE_UPDATE = 'balance_update',
  
  // Mensajes de sistema
  SYSTEM_NOTIFICATION = 'system_notification',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  
  // Mensajes personalizados
  CUSTOM = 'custom'
}

/**
 * Tipos de eventos WebSocket
 */
export enum WebSocketEventType {
  OPEN = 'open',
  MESSAGE = 'message',
  CLOSE = 'close',
  ERROR = 'error',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  RECONNECTED = 'reconnected',
  DISCONNECTED = 'disconnected'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Conexión WebSocket
 */
export interface WebSocketConnection {
  id: WebSocketId;
  url: string;
  state: WebSocketState;
  
  // Información de conexión
  connection: ConnectionInfo;
  
  // Configuración
  config: WebSocketConfig;
  
  // Autenticación
  auth: WebSocketAuth;
  
  // Suscripciones
  subscriptions: WebSocketSubscription[];
  
  // Métricas
  metrics: WebSocketMetrics;
  
  // Metadatos
  createdAt: number;
  connectedAt?: number;
  disconnectedAt?: number;
  lastActivity?: number;
}

/**
 * Información de conexión
 */
export interface ConnectionInfo {
  protocol: string;
  extensions: string[];
  readyState: number;
  bufferedAmount: number;
  url: string;
  origin?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}

/**
 * Configuración de WebSocket
 */
export interface WebSocketConfig {
  // Configuración de conexión
  autoConnect: boolean;
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectDelay: number;
  
  // Configuración de mensajes
  heartbeatInterval: number;
  heartbeatTimeout: number;
  messageTimeout: number;
  maxMessageSize: number;
  
  // Configuración de seguridad
  secure: boolean;
  verifySSL: boolean;
  apiKey?: string;
  token?: string;
  
  // Configuración de compresión
  compression: boolean;
  compressionLevel: number;
  
  // Configuración de buffer
  bufferSize: number;
  bufferTimeout: number;
  
  // Configuración de logging
  logging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Autenticación WebSocket
 */
export interface WebSocketAuth {
  authenticated: boolean;
  method: 'none' | 'api_key' | 'token' | 'wallet' | 'oauth2';
  credentials: AuthCredentials;
  expiresAt?: number;
  permissions: string[];
  scopes: string[];
}

/**
 * Credenciales de autenticación
 */
export interface AuthCredentials {
  apiKey?: string;
  token?: string;
  walletAddress?: string;
  signature?: string;
  timestamp?: number;
  nonce?: string;
}

/**
 * Suscripción WebSocket
 */
export interface WebSocketSubscription {
  id: string;
  type: WebSocketMessageType;
  channel: string;
  filters?: Record<string, any>;
  callback?: (message: WebSocketMessage) => void;
  active: boolean;
  createdAt: number;
  lastMessage?: number;
}

/**
 * Métricas de WebSocket
 */
export interface WebSocketMetrics {
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  latency: number;
  uptime: number;
  reconnectCount: number;
  errorCount: number;
  lastPing?: number;
  lastPong?: number;
}

/**
 * Mensaje WebSocket
 */
export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  channel?: string;
  data: any;
  timestamp: number;
  sender?: string;
  recipient?: string;
  broadcast?: boolean;
  reliable?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE MENSAJES ESPECÍFICOS
// ============================================================================

/**
 * Mensaje de conexión
 */
export interface ConnectMessage extends WebSocketMessage {
  type: WebSocketMessageType.CONNECT;
  data: {
    clientId: string;
    version: string;
    capabilities: string[];
    auth?: AuthCredentials;
  };
}

/**
 * Mensaje de autenticación
 */
export interface AuthMessage extends WebSocketMessage {
  type: WebSocketMessageType.AUTH;
  data: {
    method: string;
    credentials: AuthCredentials;
    challenge?: string;
  };
}

/**
 * Mensaje de respuesta de autenticación
 */
export interface AuthResponseMessage extends WebSocketMessage {
  type: WebSocketMessageType.AUTH_SUCCESS | WebSocketMessageType.AUTH_FAILED;
  data: {
    success: boolean;
    token?: string;
    permissions?: string[];
    scopes?: string[];
    expiresAt?: number;
    error?: string;
  };
}

/**
 * Mensaje de unión al mundo
 */
export interface WorldJoinMessage extends WebSocketMessage {
  type: WebSocketMessageType.WORLD_JOIN;
  data: {
    worldId: string;
    avatarId: string;
    position: WorldPosition;
    permissions: string[];
  };
}

/**
 * Mensaje de salida del mundo
 */
export interface WorldLeaveMessage extends WebSocketMessage {
  type: WebSocketMessageType.WORLD_LEAVE;
  data: {
    worldId: string;
    avatarId: string;
    reason?: string;
  };
}

/**
 * Mensaje de actualización del mundo
 */
export interface WorldUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.WORLD_UPDATE;
  data: {
    worldId: string;
    updates: WorldUpdate[];
    timestamp: number;
  };
}

/**
 * Actualización del mundo
 */
export interface WorldUpdate {
  type: 'avatar' | 'object' | 'environment' | 'weather' | 'time';
  id: string;
  data: any;
  timestamp: number;
}

/**
 * Mensaje de sincronización del mundo
 */
export interface WorldSyncMessage extends WebSocketMessage {
  type: WebSocketMessageType.WORLD_SYNC;
  data: {
    worldId: string;
    avatars: AvatarData[];
    objects: WorldObject[];
    environment: EnvironmentData;
    timestamp: number;
  };
}

/**
 * Datos de avatar
 */
export interface AvatarData {
  id: string;
  name: string;
  position: WorldPosition;
  rotation: WorldRotation;
  animation: string;
  state: AvatarState;
  metadata?: Record<string, any>;
}

/**
 * Posición en el mundo
 */
export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotación en el mundo
 */
export interface WorldRotation {
  x: number;
  y: number;
  z: number;
}

/**
 * Estado del avatar
 */
export interface AvatarState {
  health: number;
  mana: number;
  stamina: number;
  status: 'idle' | 'walking' | 'running' | 'jumping' | 'interacting';
}

/**
 * Objeto del mundo
 */
export interface WorldObject {
  id: string;
  type: string;
  position: WorldPosition;
  rotation: WorldRotation;
  scale: WorldScale;
  properties: Record<string, any>;
  interactive: boolean;
}

/**
 * Escala en el mundo
 */
export interface WorldScale {
  x: number;
  y: number;
  z: number;
}

/**
 * Datos del entorno
 */
export interface EnvironmentData {
  weather: WeatherData;
  time: TimeData;
  lighting: LightingData;
  audio: AudioData;
}

/**
 * Datos del clima
 */
export interface WeatherData {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy';
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

/**
 * Datos del tiempo
 */
export interface TimeData {
  currentTime: number;
  dayLength: number;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

/**
 * Datos de iluminación
 */
export interface LightingData {
  ambientLight: {
    color: string;
    intensity: number;
  };
  directionalLight: {
    color: string;
    intensity: number;
    position: WorldPosition;
  };
}

/**
 * Datos de audio
 */
export interface AudioData {
  ambientSounds: string[];
  backgroundMusic?: string;
  volume: number;
}

/**
 * Mensaje de actualización de avatar
 */
export interface AvatarUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.AVATAR_UPDATE;
  data: {
    avatarId: string;
    updates: AvatarUpdate[];
    timestamp: number;
  };
}

/**
 * Actualización de avatar
 */
export interface AvatarUpdate {
  field: 'position' | 'rotation' | 'animation' | 'state' | 'appearance';
  value: any;
  timestamp: number;
}

/**
 * Mensaje de movimiento de avatar
 */
export interface AvatarMoveMessage extends WebSocketMessage {
  type: WebSocketMessageType.AVATAR_MOVE;
  data: {
    avatarId: string;
    position: WorldPosition;
    rotation: WorldRotation;
    velocity: WorldPosition;
    timestamp: number;
  };
}

/**
 * Mensaje de animación de avatar
 */
export interface AvatarAnimateMessage extends WebSocketMessage {
  type: WebSocketMessageType.AVATAR_ANIMATE;
  data: {
    avatarId: string;
    animation: string;
    parameters: Record<string, any>;
    duration?: number;
    timestamp: number;
  };
}

/**
 * Mensaje de interacción de avatar
 */
export interface AvatarInteractMessage extends WebSocketMessage {
  type: WebSocketMessageType.AVATAR_INTERACT;
  data: {
    avatarId: string;
    targetId: string;
    targetType: 'avatar' | 'object' | 'ui';
    interaction: string;
    parameters: Record<string, any>;
    timestamp: number;
  };
}

/**
 * Mensaje de chat
 */
export interface ChatMessage extends WebSocketMessage {
  type: WebSocketMessageType.CHAT_MESSAGE;
  data: {
    messageId: string;
    senderId: string;
    content: string;
    type: 'text' | 'voice' | 'emote' | 'system';
    target?: string;
    replyTo?: string;
    attachments?: ChatAttachment[];
    timestamp: number;
  };
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
 * Mensaje de escritura de chat
 */
export interface ChatTypingMessage extends WebSocketMessage {
  type: WebSocketMessageType.CHAT_TYPING;
  data: {
    avatarId: string;
    typing: boolean;
    timestamp: number;
  };
}

/**
 * Mensaje de lectura de chat
 */
export interface ChatReadMessage extends WebSocketMessage {
  type: WebSocketMessageType.CHAT_READ;
  data: {
    avatarId: string;
    messageIds: string[];
    timestamp: number;
  };
}

/**
 * Mensaje de creación de objeto
 */
export interface ObjectCreateMessage extends WebSocketMessage {
  type: WebSocketMessageType.OBJECT_CREATE;
  data: {
    objectId: string;
    object: WorldObject;
    creatorId: string;
    timestamp: number;
  };
}

/**
 * Mensaje de actualización de objeto
 */
export interface ObjectUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.OBJECT_UPDATE;
  data: {
    objectId: string;
    updates: ObjectUpdate[];
    timestamp: number;
  };
}

/**
 * Actualización de objeto
 */
export interface ObjectUpdate {
  field: 'position' | 'rotation' | 'scale' | 'properties' | 'state';
  value: any;
  timestamp: number;
}

/**
 * Mensaje de eliminación de objeto
 */
export interface ObjectDeleteMessage extends WebSocketMessage {
  type: WebSocketMessageType.OBJECT_DELETE;
  data: {
    objectId: string;
    reason?: string;
    timestamp: number;
  };
}

/**
 * Mensaje de interacción con objeto
 */
export interface ObjectInteractMessage extends WebSocketMessage {
  type: WebSocketMessageType.OBJECT_INTERACT;
  data: {
    objectId: string;
    avatarId: string;
    interaction: string;
    parameters: Record<string, any>;
    timestamp: number;
  };
}

/**
 * Mensaje de evento
 */
export interface EventMessage extends WebSocketMessage {
  type: WebSocketMessageType.EVENT_TRIGGER | WebSocketMessageType.EVENT_BROADCAST;
  data: {
    eventId: string;
    eventType: string;
    source: string;
    target?: string;
    parameters: Record<string, any>;
    timestamp: number;
  };
}

/**
 * Mensaje de actualización de transacción
 */
export interface TransactionUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.TRANSACTION_UPDATE;
  data: {
    transactionId: string;
    status: 'pending' | 'confirmed' | 'failed';
    hash?: string;
    blockNumber?: number;
    gasUsed?: number;
    timestamp: number;
  };
}

/**
 * Mensaje de actualización de NFT
 */
export interface NFTUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.NFT_UPDATE;
  data: {
    nftId: string;
    action: 'minted' | 'transferred' | 'burned' | 'listed' | 'sold';
    from?: string;
    to?: string;
    price?: string;
    timestamp: number;
  };
}

/**
 * Mensaje de actualización de balance
 */
export interface BalanceUpdateMessage extends WebSocketMessage {
  type: WebSocketMessageType.BALANCE_UPDATE;
  data: {
    walletAddress: string;
    tokenAddress?: string;
    oldBalance: string;
    newBalance: string;
    change: string;
    timestamp: number;
  };
}

/**
 * Mensaje de notificación del sistema
 */
export interface SystemNotificationMessage extends WebSocketMessage {
  type: WebSocketMessageType.SYSTEM_NOTIFICATION;
  data: {
    notificationId: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    actions?: NotificationAction[];
    expiresAt?: number;
    timestamp: number;
  };
}

/**
 * Acción de notificación
 */
export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  parameters?: Record<string, any>;
}

/**
 * Mensaje de error
 */
export interface ErrorMessage extends WebSocketMessage {
  type: WebSocketMessageType.ERROR;
  data: {
    errorId: string;
    code: string;
    message: string;
    details?: string;
    timestamp: number;
  };
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento WebSocket
 */
export interface WebSocketEvent {
  type: WebSocketEventType;
  connection: WebSocketConnection;
  data?: any;
  timestamp: number;
}

/**
 * Evento de conexión abierta
 */
export interface OpenEvent extends WebSocketEvent {
  type: WebSocketEventType.OPEN;
  data: {
    protocol: string;
    extensions: string[];
  };
}

/**
 * Evento de mensaje
 */
export interface MessageEvent extends WebSocketEvent {
  type: WebSocketEventType.MESSAGE;
  data: WebSocketMessage;
}

/**
 * Evento de cierre
 */
export interface CloseEvent extends WebSocketEvent {
  type: WebSocketEventType.CLOSE;
  data: {
    code: number;
    reason: string;
    wasClean: boolean;
  };
}

/**
 * Evento de error
 */
export interface ErrorEvent extends WebSocketEvent {
  type: WebSocketEventType.ERROR;
  data: {
    error: string;
    message: string;
    code?: number;
  };
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de WebSocket
 */
export interface WebSocketUtils {
  /**
   * Crea conexión WebSocket
   */
  createConnection: (url: string, config?: Partial<WebSocketConfig>) => WebSocketConnection;
  
  /**
   * Conecta WebSocket
   */
  connect: (connection: WebSocketConnection) => Promise<void>;
  
  /**
   * Desconecta WebSocket
   */
  disconnect: (connection: WebSocketConnection) => Promise<void>;
  
  /**
   * Envía mensaje
   */
  sendMessage: (connection: WebSocketConnection, message: WebSocketMessage) => Promise<void>;
  
  /**
   * Suscribe a canal
   */
  subscribe: (connection: WebSocketConnection, subscription: WebSocketSubscription) => void;
  
  /**
   * Desuscribe de canal
   */
  unsubscribe: (connection: WebSocketConnection, subscriptionId: string) => void;
  
  /**
   * Valida mensaje
   */
  validateMessage: (message: WebSocketMessage) => boolean;
  
  /**
   * Serializa mensaje
   */
  serializeMessage: (message: WebSocketMessage) => string;
  
  /**
   * Deserializa mensaje
   */
  deserializeMessage: (data: string) => WebSocketMessage;
  
  /**
   * Genera ID de conexión
   */
  generateConnectionId: () => WebSocketId;
  
  /**
   * Genera ID de mensaje
   */
  generateMessageId: () => string;
  
  /**
   * Verifica si está conectado
   */
  isConnected: (connection: WebSocketConnection) => boolean;
  
  /**
   * Verifica si está reconectando
   */
  isReconnecting: (connection: WebSocketConnection) => boolean;
  
  /**
   * Obtiene latencia
   */
  getLatency: (connection: WebSocketConnection) => number;
  
  /**
   * Envía ping
   */
  sendPing: (connection: WebSocketConnection) => Promise<void>;
  
  /**
   * Envía pong
   */
  sendPong: (connection: WebSocketConnection) => Promise<void>;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  WebSocketId,
  WebSocketConnection,
  ConnectionInfo,
  WebSocketConfig,
  WebSocketAuth,
  AuthCredentials,
  WebSocketSubscription,
  WebSocketMetrics,
  WebSocketMessage,
  ConnectMessage,
  AuthMessage,
  AuthResponseMessage,
  WorldJoinMessage,
  WorldLeaveMessage,
  WorldUpdateMessage,
  WorldUpdate,
  WorldSyncMessage,
  AvatarData,
  WorldPosition,
  WorldRotation,
  AvatarState,
  WorldObject,
  WorldScale,
  EnvironmentData,
  WeatherData,
  TimeData,
  LightingData,
  AudioData,
  AvatarUpdateMessage,
  AvatarUpdate,
  AvatarMoveMessage,
  AvatarAnimateMessage,
  AvatarInteractMessage,
  ChatMessage,
  ChatAttachment,
  ChatTypingMessage,
  ChatReadMessage,
  ObjectCreateMessage,
  ObjectUpdateMessage,
  ObjectUpdate,
  ObjectDeleteMessage,
  ObjectInteractMessage,
  EventMessage,
  TransactionUpdateMessage,
  NFTUpdateMessage,
  BalanceUpdateMessage,
  SystemNotificationMessage,
  NotificationAction,
  ErrorMessage,
  WebSocketEvent,
  OpenEvent,
  MessageEvent,
  CloseEvent,
  ErrorEvent,
  WebSocketUtils
};

export {
  WebSocketState,
  WebSocketMessageType,
  WebSocketEventType
}; 