/**
 * NetworkMessage - Mensajes de Red
 * 
 * Sistema de mensajes para el protocolo de comunicación
 * del editor 3D del metaverso.
 */

import { v4 as uuidv4 } from 'uuid';

export interface MessageData {
  id?: string;
  type: string;
  data: any;
  from?: string;
  to?: string;
  roomId?: string;
  timestamp?: number;
  priority?: number;
  correlationId?: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  version: string;
  source: string;
  target?: string;
  sessionId?: string;
  userId?: string;
  tags?: string[];
  expiresAt?: number;
}

export enum MessageCategory {
  SYSTEM = 'system',
  USER = 'user',
  SYNC = 'sync',
  CONTROL = 'control',
  ERROR = 'error'
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

/**
 * Clase NetworkMessage
 */
export class NetworkMessage {
  public readonly id: string;
  public readonly type: string;
  public readonly data: any;
  public readonly from?: string;
  public readonly to?: string;
  public readonly roomId?: string;
  public readonly timestamp: number;
  public readonly priority: number;
  public readonly correlationId?: string;
  public readonly metadata: MessageMetadata;

  private _status: MessageStatus = MessageStatus.PENDING;
  private _retryCount: number = 0;
  private _maxRetries: number = 3;
  private _createdAt: number;
  private _sentAt?: number;
  private _deliveredAt?: number;
  private _readAt?: number;

  constructor(data: MessageData) {
    this.id = data.id || uuidv4();
    this.type = data.type;
    this.data = data.data;
    this.from = data.from;
    this.to = data.to;
    this.roomId = data.roomId;
    this.timestamp = data.timestamp || Date.now();
    this.priority = data.priority || 1;
    this.correlationId = data.correlationId;
    this.metadata = {
      version: '1.0.0',
      source: 'editor3d',
      ...data.metadata
    };

    this._createdAt = Date.now();
  }

  /**
   * Marca el mensaje como enviado
   */
  markAsSent(): void {
    this._status = MessageStatus.SENT;
    this._sentAt = Date.now();
  }

  /**
   * Marca el mensaje como entregado
   */
  markAsDelivered(): void {
    this._status = MessageStatus.DELIVERED;
    this._deliveredAt = Date.now();
  }

  /**
   * Marca el mensaje como leído
   */
  markAsRead(): void {
    this._status = MessageStatus.READ;
    this._readAt = Date.now();
  }

  /**
   * Marca el mensaje como fallido
   */
  markAsFailed(): void {
    this._status = MessageStatus.FAILED;
  }

  /**
   * Marca el mensaje como expirado
   */
  markAsExpired(): void {
    this._status = MessageStatus.EXPIRED;
  }

  /**
   * Incrementa el contador de reintentos
   */
  incrementRetryCount(): void {
    this._retryCount++;
  }

  /**
   * Verifica si el mensaje puede ser reintentado
   */
  canRetry(): boolean {
    return this._retryCount < this._maxRetries && this._status !== MessageStatus.DELIVERED;
  }

  /**
   * Verifica si el mensaje ha expirado
   */
  isExpired(): boolean {
    if (!this.metadata.expiresAt) {
      return false;
    }
    return Date.now() > this.metadata.expiresAt;
  }

  /**
   * Obtiene la latencia del mensaje
   */
  getLatency(): number | null {
    if (this._sentAt && this._deliveredAt) {
      return this._deliveredAt - this._sentAt;
    }
    return null;
  }

  /**
   * Obtiene el tiempo de respuesta
   */
  getResponseTime(): number | null {
    if (this._sentAt && this._readAt) {
      return this._readAt - this._sentAt;
    }
    return null;
  }

  /**
   * Crea una respuesta a este mensaje
   */
  createResponse(type: string, data: any): NetworkMessage {
    return new NetworkMessage({
      type,
      data,
      from: this.to,
      to: this.from,
      roomId: this.roomId,
      correlationId: this.id,
      metadata: {
        ...this.metadata,
        source: this.metadata.target || this.metadata.source
      }
    });
  }

  /**
   * Crea un mensaje de confirmación
   */
  createAck(): NetworkMessage {
    return this.createResponse('ack', { originalId: this.id });
  }

  /**
   * Crea un mensaje de error
   */
  createError(error: string, code?: number): NetworkMessage {
    return this.createResponse('error', { 
      originalId: this.id, 
      error, 
      code 
    });
  }

  /**
   * Clona el mensaje
   */
  clone(): NetworkMessage {
    return new NetworkMessage({
      id: this.id,
      type: this.type,
      data: this.data,
      from: this.from,
      to: this.to,
      roomId: this.roomId,
      timestamp: this.timestamp,
      priority: this.priority,
      correlationId: this.correlationId,
      metadata: { ...this.metadata }
    });
  }

  /**
   * Serializa el mensaje
   */
  serialize(): string {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      data: this.data,
      from: this.from,
      to: this.to,
      roomId: this.roomId,
      timestamp: this.timestamp,
      priority: this.priority,
      correlationId: this.correlationId,
      metadata: this.metadata,
      status: this._status,
      retryCount: this._retryCount,
      createdAt: this._createdAt,
      sentAt: this._sentAt,
      deliveredAt: this._deliveredAt,
      readAt: this._readAt
    });
  }

  /**
   * Deserializa un mensaje
   */
  static deserialize(data: string): NetworkMessage {
    const parsed = JSON.parse(data);
    const message = new NetworkMessage({
      id: parsed.id,
      type: parsed.type,
      data: parsed.data,
      from: parsed.from,
      to: parsed.to,
      roomId: parsed.roomId,
      timestamp: parsed.timestamp,
      priority: parsed.priority,
      correlationId: parsed.correlationId,
      metadata: parsed.metadata
    });

    // Restaurar estado interno
    (message as any)._status = parsed.status;
    (message as any)._retryCount = parsed.retryCount;
    (message as any)._createdAt = parsed.createdAt;
    (message as any)._sentAt = parsed.sentAt;
    (message as any)._deliveredAt = parsed.deliveredAt;
    (message as any)._readAt = parsed.readAt;

    return message;
  }

  /**
   * Crea un mensaje de sistema
   */
  static createSystemMessage(type: string, data: any): NetworkMessage {
    return new NetworkMessage({
      type,
      data,
      priority: 3, // CRITICAL
      metadata: {
        version: '1.0.0',
        source: 'system',
        tags: ['system']
      }
    });
  }

  /**
   * Crea un mensaje de usuario
   */
  static createUserMessage(type: string, data: any, userId: string): NetworkMessage {
    return new NetworkMessage({
      type,
      data,
      priority: 1, // NORMAL
      metadata: {
        version: '1.0.0',
        source: 'user',
        userId,
        tags: ['user']
      }
    });
  }

  /**
   * Crea un mensaje de sincronización
   */
  static createSyncMessage(type: string, data: any, syncId: string): NetworkMessage {
    return new NetworkMessage({
      type,
      data,
      priority: 2, // HIGH
      metadata: {
        version: '1.0.0',
        source: 'sync',
        tags: ['sync', syncId]
      }
    });
  }

  /**
   * Crea un mensaje de control
   */
  static createControlMessage(type: string, data: any): NetworkMessage {
    return new NetworkMessage({
      type,
      data,
      priority: 2, // HIGH
      metadata: {
        version: '1.0.0',
        source: 'control',
        tags: ['control']
      }
    });
  }

  /**
   * Crea un mensaje de error
   */
  static createErrorMessage(error: string, code?: number, originalId?: string): NetworkMessage {
    return new NetworkMessage({
      type: 'error',
      data: { error, code, originalId },
      priority: 3, // CRITICAL
      metadata: {
        version: '1.0.0',
        source: 'system',
        tags: ['error']
      }
    });
  }

  // Getters
  get status(): MessageStatus { return this._status; }
  get retryCount(): number { return this._retryCount; }
  get maxRetries(): number { return this._maxRetries; }
  get createdAt(): number { return this._createdAt; }
  get sentAt(): number | undefined { return this._sentAt; }
  get deliveredAt(): number | undefined { return this._deliveredAt; }
  get readAt(): number | undefined { return this._readAt; }
  get category(): MessageCategory {
    if (this.metadata.tags?.includes('system')) return MessageCategory.SYSTEM;
    if (this.metadata.tags?.includes('sync')) return MessageCategory.SYNC;
    if (this.metadata.tags?.includes('control')) return MessageCategory.CONTROL;
    if (this.metadata.tags?.includes('error')) return MessageCategory.ERROR;
    return MessageCategory.USER;
  }
} 