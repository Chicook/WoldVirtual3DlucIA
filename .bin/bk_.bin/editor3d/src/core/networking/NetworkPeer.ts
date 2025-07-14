/**
 * NetworkPeer - Peer de Red
 * 
 * Representación de un peer conectado en el sistema de networking
 * del editor 3D del metaverso.
 */

import { EventEmitter } from '../events/EventEmitter';
import { NetworkMessage } from './NetworkMessage';

export interface PeerEvents {
  'message:received': { peer: NetworkPeer; message: NetworkMessage };
  'message:sent': { peer: NetworkPeer; message: NetworkMessage };
  'status:changed': { peer: NetworkPeer; oldStatus: PeerStatus; newStatus: PeerStatus };
  'latency:updated': { peer: NetworkPeer; latency: number };
  'disconnected': { peer: NetworkPeer; reason: string };
}

export interface PeerData {
  id: string;
  name: string;
  status: PeerStatus;
  metadata?: PeerMetadata;
  capabilities?: PeerCapabilities;
  stats?: PeerStats;
}

export interface PeerMetadata {
  version: string;
  platform: string;
  client: string;
  userId?: string;
  sessionId?: string;
  avatar?: string;
  description?: string;
  tags?: string[];
}

export interface PeerCapabilities {
  canEdit: boolean;
  canView: boolean;
  canSync: boolean;
  canBroadcast: boolean;
  maxMessageSize: number;
  supportedFeatures: string[];
}

export interface PeerStats {
  bytesSent: number;
  bytesReceived: number;
  messagesSent: number;
  messagesReceived: number;
  latency: number;
  packetLoss: number;
  lastSeen: number;
  uptime: number;
}

export enum PeerStatus {
  OFFLINE = 'offline',
  CONNECTING = 'connecting',
  ONLINE = 'online',
  BUSY = 'busy',
  AWAY = 'away',
  DO_NOT_DISTURB = 'do_not_disturb'
}

export enum PeerType {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
  ADMIN = 'admin'
}

/**
 * Clase NetworkPeer
 */
export class NetworkPeer extends EventEmitter<PeerEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly metadata: PeerMetadata;
  public readonly capabilities: PeerCapabilities;
  public readonly type: PeerType;

  private _status: PeerStatus;
  private _stats: PeerStats;
  private _lastPing: number = 0;
  private _lastPong: number = 0;
  private _messageQueue: NetworkMessage[] = [];
  private _maxQueueSize: number = 100;
  private _connectedAt: number = 0;
  private _disconnectedAt?: number;

  constructor(data: PeerData) {
    super();
    this.id = data.id;
    this.name = data.name;
    this._status = data.status;
    this.metadata = data.metadata || {
      version: '1.0.0',
      platform: 'unknown',
      client: 'unknown'
    };
    this.capabilities = data.capabilities || {
      canEdit: true,
      canView: true,
      canSync: true,
      canBroadcast: true,
      maxMessageSize: 1024 * 1024,
      supportedFeatures: []
    };
    this.type = this._determineType();
    this._stats = data.stats || {
      bytesSent: 0,
      bytesReceived: 0,
      messagesSent: 0,
      messagesReceived: 0,
      latency: 0,
      packetLoss: 0,
      lastSeen: Date.now(),
      uptime: 0
    };
  }

  /**
   * Conecta el peer
   */
  connect(): void {
    if (this._status === PeerStatus.ONLINE) {
      return;
    }

    const oldStatus = this._status;
    this._status = PeerStatus.CONNECTING;
    this._connectedAt = Date.now();
    this._disconnectedAt = undefined;

    this.emit('status:changed', { peer: this, oldStatus, newStatus: this._status });

    // Simular conexión exitosa
    setTimeout(() => {
      this._status = PeerStatus.ONLINE;
      this.emit('status:changed', { peer: this, oldStatus, newStatus: this._status });
    }, 100);
  }

  /**
   * Desconecta el peer
   */
  disconnect(reason: string = 'Disconnected'): void {
    if (this._status === PeerStatus.OFFLINE) {
      return;
    }

    const oldStatus = this._status;
    this._status = PeerStatus.OFFLINE;
    this._disconnectedAt = Date.now();

    this.emit('status:changed', { peer: this, oldStatus, newStatus: this._status });
    this.emit('disconnected', { peer: this, reason });
  }

  /**
   * Envía un mensaje al peer
   */
  sendMessage(message: NetworkMessage): Promise<void> {
    if (this._status !== PeerStatus.ONLINE) {
      throw new Error(`Peer ${this.id} is not online`);
    }

    // Verificar capacidades
    if (message.data && JSON.stringify(message.data).length > this.capabilities.maxMessageSize) {
      throw new Error('Message too large for peer capabilities');
    }

    // Agregar a la cola si es necesario
    if (this._messageQueue.length >= this._maxQueueSize) {
      this._messageQueue.shift(); // Remover mensaje más antiguo
    }

    this._messageQueue.push(message);

    // Actualizar estadísticas
    this._stats.messagesSent++;
    this._stats.bytesSent += message.serialize().length;
    this._stats.lastSeen = Date.now();

    this.emit('message:sent', { peer: this, message });

    return Promise.resolve();
  }

  /**
   * Recibe un mensaje del peer
   */
  receiveMessage(message: NetworkMessage): void {
    // Actualizar estadísticas
    this._stats.messagesReceived++;
    this._stats.bytesReceived += message.serialize().length;
    this._stats.lastSeen = Date.now();

    this.emit('message:received', { peer: this, message });
  }

  /**
   * Envía un ping al peer
   */
  ping(): void {
    if (this._status !== PeerStatus.ONLINE) {
      return;
    }

    this._lastPing = Date.now();
    const pingMessage = NetworkMessage.createSystemMessage('ping', { timestamp: this._lastPing });
    this.sendMessage(pingMessage);
  }

  /**
   * Procesa un pong del peer
   */
  pong(timestamp: number): void {
    this._lastPong = Date.now();
    const latency = this._lastPong - timestamp;
    
    this._stats.latency = latency;
    this.emit('latency:updated', { peer: this, latency });
  }

  /**
   * Actualiza el estado del peer
   */
  updateStatus(status: PeerStatus): void {
    if (this._status === status) {
      return;
    }

    const oldStatus = this._status;
    this._status = status;

    this.emit('status:changed', { peer: this, oldStatus, newStatus: status });
  }

  /**
   * Actualiza las estadísticas del peer
   */
  updateStats(stats: Partial<PeerStats>): void {
    this._stats = { ...this._stats, ...stats };
  }

  /**
   * Verifica si el peer está activo
   */
  isActive(): boolean {
    const now = Date.now();
    const timeSinceLastSeen = now - this._stats.lastSeen;
    return timeSinceLastSeen < 30000; // 30 segundos
  }

  /**
   * Verifica si el peer puede recibir mensajes
   */
  canReceiveMessages(): boolean {
    return this._status === PeerStatus.ONLINE && this.isActive();
  }

  /**
   * Verifica si el peer puede enviar mensajes
   */
  canSendMessages(): boolean {
    return this._status === PeerStatus.ONLINE && this.isActive();
  }

  /**
   * Obtiene el tiempo de conexión
   */
  getUptime(): number {
    if (this._status === PeerStatus.OFFLINE) {
      return this._disconnectedAt ? this._disconnectedAt - this._connectedAt : 0;
    }
    return Date.now() - this._connectedAt;
  }

  /**
   * Obtiene el tiempo desde la última actividad
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this._stats.lastSeen;
  }

  /**
   * Limpia la cola de mensajes
   */
  clearMessageQueue(): void {
    this._messageQueue = [];
  }

  /**
   * Obtiene el tamaño de la cola de mensajes
   */
  getQueueSize(): number {
    return this._messageQueue.length;
  }

  /**
   * Obtiene los mensajes en cola
   */
  getQueuedMessages(): NetworkMessage[] {
    return [...this._messageQueue];
  }

  /**
   * Determina el tipo de peer basado en metadatos
   */
  private _determineType(): PeerType {
    if (this.metadata.tags?.includes('admin')) return PeerType.ADMIN;
    if (this.metadata.tags?.includes('bot')) return PeerType.BOT;
    if (this.metadata.tags?.includes('system')) return PeerType.SYSTEM;
    return PeerType.USER;
  }

  /**
   * Serializa el peer
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      status: this._status,
      metadata: this.metadata,
      capabilities: this.capabilities,
      type: this.type,
      stats: this._stats,
      connectedAt: this._connectedAt,
      disconnectedAt: this._disconnectedAt,
      lastPing: this._lastPing,
      lastPong: this._lastPong
    };
  }

  /**
   * Deserializa un peer
   */
  static deserialize(data: any): NetworkPeer {
    const peer = new NetworkPeer({
      id: data.id,
      name: data.name,
      status: data.status,
      metadata: data.metadata,
      capabilities: data.capabilities,
      stats: data.stats
    });

    // Restaurar estado interno
    (peer as any)._connectedAt = data.connectedAt;
    (peer as any)._disconnectedAt = data.disconnectedAt;
    (peer as any)._lastPing = data.lastPing;
    (peer as any)._lastPong = data.lastPong;

    return peer;
  }

  // Getters
  get status(): PeerStatus { return this._status; }
  get stats(): PeerStats { return { ...this._stats }; }
  get isOnline(): boolean { return this._status === PeerStatus.ONLINE; }
  get isOffline(): boolean { return this._status === PeerStatus.OFFLINE; }
  get isConnecting(): boolean { return this._status === PeerStatus.CONNECTING; }
  get latency(): number { return this._stats.latency; }
  get lastSeen(): number { return this._stats.lastSeen; }
  get uptime(): number { return this.getUptime(); }
  get messageCount(): number { return this._stats.messagesSent + this._stats.messagesReceived; }
  get bytesTransferred(): number { return this._stats.bytesSent + this._stats.bytesReceived; }
} 