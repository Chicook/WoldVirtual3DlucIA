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
  CLOSED = 'closed',
  ERROR = 'error'
}

/**
 * Tipos de mensaje WebSocket
 */
export enum WebSocketMessageType {
  // Mensajes de conexión
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  
  // Mensajes de autenticación
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_ERROR = 'auth_error',
  
  // Mensajes de usuario
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  USER_UPDATE = 'user_update',
  USER_STATUS = 'user_status',
  
  // Mensajes de avatar
  AVATAR_MOVE = 'avatar_move',
  AVATAR_ANIMATE = 'avatar_animate',
  AVATAR_INTERACT = 'avatar_interact',
  AVATAR_CUSTOMIZE = 'avatar_customize',
  
  // Mensajes de mundo
  WORLD_JOIN = 'world_join',
  WORLD_LEAVE = 'world_leave',
  WORLD_UPDATE = 'world_update',
  WORLD_OBJECT_ADD = 'world_object_add',
  WORLD_OBJECT_REMOVE = 'world_object_remove',
  WORLD_OBJECT_UPDATE = 'world_object_update',
  
  // Mensajes de chat
  CHAT_MESSAGE = 'chat_message',
  CHAT_TYPING = 'chat_typing',
  CHAT_READ = 'chat_read',
  
  // Mensajes de blockchain
  TRANSACTION_UPDATE = 'transaction_update',
  NFT_UPDATE = 'nft_update',
  BALANCE_UPDATE = 'balance_update',
  
  // Mensajes de marketplace
  MARKETPLACE_UPDATE = 'marketplace_update',
  AUCTION_UPDATE = 'auction_update',
  OFFER_UPDATE = 'offer_update',
  
  // Mensajes de sistema
  SYSTEM_MESSAGE = 'system_message',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Tipos de evento WebSocket
 */
export enum WebSocketEventType {
  CONNECTION = 'connection',
  DISCONNECTION = 'disconnection',
  MESSAGE = 'message',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  TIMEOUT = 'timeout'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Mensaje WebSocket genérico
 */
export interface WebSocketMessage<T = any> {
  id: string;
  type: WebSocketMessageType;
  data: T;
  timestamp: number;
  senderId?: string;
  recipientId?: string;
  roomId?: string;
  metadata?: Record<string, any>;
}

/**
 * Conexión WebSocket
 */
export interface WebSocketConnection {
  id: WebSocketId;
  userId?: string;
  sessionId?: string;
  state: WebSocketState;
  url: string;
  protocol?: string;
  extensions?: string[];
  connectedAt: number;
  lastActivity: number;
  metadata: ConnectionMetadata;
}

/**
 * Metadatos de conexión
 */
export interface ConnectionMetadata {
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  device?: {
    type?: string;
    os?: string;
    browser?: string;
    version?: string;
  };
  performance?: {
    latency: number;
    bandwidth?: number;
    quality?: string;
  };
  custom?: Record<string, any>;
}

/**
 * Evento WebSocket
 */
export interface WebSocketEvent {
  type: WebSocketEventType;
  connection: WebSocketConnection;
  message?: WebSocketMessage;
  error?: WebSocketError;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Error de WebSocket
 */
export interface WebSocketError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  connectionId: WebSocketId;
}

// ============================================================================
// TIPOS DE MENSAJE ESPECÍFICOS
// ============================================================================

/**
 * Mensaje de conexión
 */
export interface ConnectMessage {
  userId?: string;
  sessionId?: string;
  token?: string;
  metadata?: Record<string, any>;
}

/**
 * Mensaje de autenticación
 */
export interface AuthMessage {
  token: string;
  walletAddress?: string;
  signature?: string;
  timestamp: number;
  nonce: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  success: boolean;
  user?: UserData;
  permissions: string[];
  roles: string[];
  expiresAt: number;
}

/**
 * Datos de usuario
 */
export interface UserData {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
}

/**
 * Mensaje de movimiento de avatar
 */
export interface AvatarMoveMessage {
  avatarId: string;
  position: {
    x: number;
    y: number;
    z: number;
    worldId: string;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  velocity?: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

/**
 * Mensaje de animación de avatar
 */
export interface AvatarAnimateMessage {
  avatarId: string;
  animation: string;
  parameters?: Record<string, any>;
  duration?: number;
  loop?: boolean;
  timestamp: number;
}

/**
 * Mensaje de interacción de avatar
 */
export interface AvatarInteractMessage {
  avatarId: string;
  targetId: string;
  targetType: 'avatar' | 'object' | 'npc';
  interactionType: string;
  parameters?: Record<string, any>;
  timestamp: number;
}

/**
 * Mensaje de personalización de avatar
 */
export interface AvatarCustomizeMessage {
  avatarId: string;
  changes: {
    appearance?: Partial<AvatarAppearance>;
    clothing?: Record<string, string>;
    accessories?: string[];
  };
  timestamp: number;
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
  customizations: Record<string, any>;
}

/**
 * Mensaje de unión a mundo
 */
export interface WorldJoinMessage {
  worldId: string;
  avatarId: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Mensaje de actualización de mundo
 */
export interface WorldUpdateMessage {
  worldId: string;
  changes: {
    objects?: WorldObject[];
    avatars?: AvatarInfo[];
    environment?: EnvironmentData;
  };
  timestamp: number;
}

/**
 * Objeto del mundo
 */
export interface WorldObject {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  properties: Record<string, any>;
  ownerId?: string;
}

/**
 * Información de avatar
 */
export interface AvatarInfo {
  id: string;
  userId: string;
  username: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  animation?: string;
  status: 'idle' | 'walking' | 'running' | 'interacting';
  lastUpdate: number;
}

/**
 * Datos del entorno
 */
export interface EnvironmentData {
  lighting?: {
    ambient: {
      color: string;
      intensity: number;
    };
    directional?: {
      color: string;
      intensity: number;
      position: {
        x: number;
        y: number;
        z: number;
      };
    };
  };
  weather?: {
    type: string;
    intensity: number;
    temperature: number;
  };
  time?: {
    hour: number;
    minute: number;
    day: number;
    season: string;
  };
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'voice' | 'emote' | 'system';
  replyTo?: string;
  attachments?: ChatAttachment[];
  timestamp: number;
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
 * Mensaje de escritura
 */
export interface TypingMessage {
  roomId: string;
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * Mensaje de transacción
 */
export interface TransactionMessage {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  value: string;
  gasUsed?: number;
  blockNumber?: number;
  timestamp: number;
}

/**
 * Mensaje de NFT
 */
export interface NFTMessage {
  nftId: string;
  action: 'mint' | 'transfer' | 'burn' | 'list' | 'sold';
  from?: string;
  to?: string;
  price?: string;
  timestamp: number;
}

/**
 * Mensaje de balance
 */
export interface BalanceMessage {
  walletAddress: string;
  token: string;
  balance: string;
  change: string;
  timestamp: number;
}

/**
 * Mensaje de marketplace
 */
export interface MarketplaceMessage {
  listingId: string;
  action: 'created' | 'updated' | 'sold' | 'cancelled';
  nftId: string;
  price?: string;
  buyer?: string;
  seller: string;
  timestamp: number;
}

/**
 * Mensaje de subasta
 */
export interface AuctionMessage {
  auctionId: string;
  action: 'created' | 'bid' | 'ended' | 'cancelled';
  nftId: string;
  currentBid?: string;
  currentBidder?: string;
  endTime: number;
  timestamp: number;
}

/**
 * Mensaje de oferta
 */
export interface OfferMessage {
  offerId: string;
  action: 'created' | 'accepted' | 'rejected' | 'expired';
  nftId: string;
  amount: string;
  buyer: string;
  seller: string;
  timestamp: number;
}

/**
 * Mensaje de sistema
 */
export interface SystemMessage {
  level: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  code?: string;
  actions?: SystemAction[];
  timestamp: number;
}

/**
 * Acción del sistema
 */
export interface SystemAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'modal';
  action: string;
  parameters?: Record<string, any>;
}

// ============================================================================
// TIPOS DE SALA Y GRUPO
// ============================================================================

/**
 * Sala WebSocket
 */
export interface WebSocketRoom {
  id: string;
  name: string;
  type: 'world' | 'chat' | 'auction' | 'private';
  connections: WebSocketId[];
  maxConnections?: number;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Grupo WebSocket
 */
export interface WebSocketGroup {
  id: string;
  name: string;
  members: WebSocketId[];
  permissions: GroupPermissions;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Permisos de grupo
 */
export interface GroupPermissions {
  sendMessage: boolean;
  sendFile: boolean;
  inviteMembers: boolean;
  removeMembers: boolean;
  modifyGroup: boolean;
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

/**
 * Configuración de WebSocket
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
  };
  heartbeat: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate';
    level: number;
  };
  security: {
    requireAuth: boolean;
    validateOrigin: boolean;
    allowedOrigins: string[];
    rateLimit: {
      enabled: boolean;
      maxMessages: number;
      window: number;
    };
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includePayload: boolean;
  };
}

/**
 * Configuración de reconexión
 */
export interface ReconnectConfig {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  onReconnect?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

/**
 * Configuración de heartbeat
 */
export interface HeartbeatConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  onTimeout?: () => void;
  onResponse?: (latency: number) => void;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Estadísticas de WebSocket
 */
export interface WebSocketStats {
  connections: {
    total: number;
    active: number;
    idle: number;
    error: number;
  };
  messages: {
    sent: number;
    received: number;
    errors: number;
    rate: number;
  };
  performance: {
    averageLatency: number;
    maxLatency: number;
    minLatency: number;
    uptime: number;
  };
  memory: {
    used: number;
    peak: number;
    connections: number;
  };
}

/**
 * Utilidades de WebSocket
 */
export interface WebSocketUtils {
  /**
   * Crea mensaje WebSocket
   */
  createMessage: <T>(
    type: WebSocketMessageType,
    data: T,
    senderId?: string,
    recipientId?: string
  ) => WebSocketMessage<T>;
  
  /**
   * Valida mensaje WebSocket
   */
  validateMessage: (message: WebSocketMessage) => boolean;
  
  /**
   * Serializa mensaje WebSocket
   */
  serializeMessage: (message: WebSocketMessage) => string;
  
  /**
   * Deserializa mensaje WebSocket
   */
  deserializeMessage: (data: string) => WebSocketMessage;
  
  /**
   * Clona mensaje WebSocket
   */
  cloneMessage: <T>(message: WebSocketMessage<T>) => WebSocketMessage<T>;
  
  /**
   * Combina mensajes WebSocket
   */
  mergeMessages: (messages: WebSocketMessage[]) => WebSocketMessage;
  
  /**
   * Genera ID de WebSocket
   */
  generateWebSocketId: () => WebSocketId;
  
  /**
   * Verifica si es mensaje de sistema
   */
  isSystemMessage: (message: WebSocketMessage) => boolean;
  
  /**
   * Verifica si es mensaje de usuario
   */
  isUserMessage: (message: WebSocketMessage) => boolean;
  
  /**
   * Verifica si es mensaje de chat
   */
  isChatMessage: (message: WebSocketMessage) => boolean;
  
  /**
   * Verifica si es mensaje de blockchain
   */
  isBlockchainMessage: (message: WebSocketMessage) => boolean;
  
  /**
   * Obtiene tipo de mensaje
   */
  getMessageType: (message: WebSocketMessage) => WebSocketMessageType;
  
  /**
   * Obtiene timestamp del mensaje
   */
  getMessageTimestamp: (message: WebSocketMessage) => number;
  
  /**
   * Calcula latencia
   */
  calculateLatency: (sentTime: number, receivedTime: number) => number;
  
  /**
   * Valida conexión WebSocket
   */
  validateConnection: (connection: WebSocketConnection) => boolean;
  
  /**
   * Actualiza actividad de conexión
   */
  updateConnectionActivity: (connection: WebSocketConnection) => void;
  
  /**
   * Verifica si conexión está activa
   */
  isConnectionActive: (connection: WebSocketConnection, timeout: number) => boolean;
  
  /**
   * Cierra conexión WebSocket
   */
  closeConnection: (connection: WebSocketConnection, reason?: string) => void;
  
  /**
   * Registra evento WebSocket
   */
  logEvent: (event: WebSocketEvent) => void;
  
  /**
   * Reporta estadísticas
   */
  reportStats: (stats: WebSocketStats) => void;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de conexión
 */
export interface ConnectionEvent {
  type: 'connected' | 'disconnected' | 'reconnected' | 'error';
  connection: WebSocketConnection;
  error?: WebSocketError;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Evento de mensaje
 */
export interface MessageEvent {
  type: 'sent' | 'received' | 'error';
  message: WebSocketMessage;
  connection: WebSocketConnection;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Evento de sala
 */
export interface RoomEvent {
  type: 'joined' | 'left' | 'created' | 'destroyed';
  room: WebSocketRoom;
  connection: WebSocketConnection;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de WebSocket
 */
export interface WebSocketListener {
  onConnection: (event: ConnectionEvent) => void;
  onMessage: (event: MessageEvent) => void;
  onRoom: (event: RoomEvent) => void;
  onError: (error: WebSocketError) => void;
  onStats: (stats: WebSocketStats) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  WebSocketId,
  WebSocketMessage,
  WebSocketConnection,
  ConnectionMetadata,
  WebSocketEvent,
  WebSocketError,
  ConnectMessage,
  AuthMessage,
  AuthResponse,
  UserData,
  AvatarMoveMessage,
  AvatarAnimateMessage,
  AvatarInteractMessage,
  AvatarCustomizeMessage,
  AvatarAppearance,
  WorldJoinMessage,
  WorldUpdateMessage,
  WorldObject,
  AvatarInfo,
  EnvironmentData,
  ChatMessage,
  ChatAttachment,
  TypingMessage,
  TransactionMessage,
  NFTMessage,
  BalanceMessage,
  MarketplaceMessage,
  AuctionMessage,
  OfferMessage,
  SystemMessage,
  SystemAction,
  WebSocketRoom,
  WebSocketGroup,
  GroupPermissions,
  WebSocketConfig,
  ReconnectConfig,
  HeartbeatConfig,
  WebSocketStats,
  WebSocketUtils,
  ConnectionEvent,
  MessageEvent,
  RoomEvent,
  WebSocketListener
};

export {
  WebSocketState,
  WebSocketMessageType,
  WebSocketEventType
}; 