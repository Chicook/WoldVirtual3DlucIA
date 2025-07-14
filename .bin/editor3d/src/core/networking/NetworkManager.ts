/**
 * NetworkManager - Sistema de Networking y Multiplayer
 * 
 * Gestión de conexiones, sincronización en tiempo real y colaboración
 * para el editor 3D del metaverso.
 */

import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { WebSocketClient } from './WebSocketClient';
import { NetworkProtocol } from './NetworkProtocol';
import { NetworkMessage } from './NetworkMessage';
import { NetworkPeer } from './NetworkPeer';
import { NetworkRoom } from './NetworkRoom';
import { NetworkSync } from './NetworkSync';

export interface NetworkEvents {
  'connection:established': { manager: NetworkManager; peer: NetworkPeer };
  'connection:lost': { manager: NetworkManager; peer: NetworkPeer; reason: string };
  'peer:joined': { manager: NetworkManager; peer: NetworkPeer; room: NetworkRoom };
  'peer:left': { manager: NetworkManager; peer: NetworkPeer; room: NetworkRoom };
  'message:received': { manager: NetworkManager; message: NetworkMessage; peer: NetworkPeer };
  'message:sent': { manager: NetworkManager; message: NetworkMessage; peer: NetworkPeer };
  'room:created': { manager: NetworkManager; room: NetworkRoom };
  'room:joined': { manager: NetworkManager; room: NetworkRoom };
  'room:left': { manager: NetworkManager; room: NetworkRoom };
  'sync:started': { manager: NetworkManager; sync: NetworkSync };
  'sync:completed': { manager: NetworkManager; sync: NetworkSync };
  'error:network': { manager: NetworkManager; error: Error; context: string };
}

export interface NetworkConfig {
  id: string;
  name: string;
  serverUrl: string;
  port: number;
  protocol: 'ws' | 'wss';
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
  compression: boolean;
  encryption: boolean;
  metadata?: NetworkMetadata;
}

export interface NetworkMetadata {
  version: string;
  capabilities: string[];
  maxPeers: number;
  maxRooms: number;
  description: string;
}

export interface NetworkStats {
  bytesSent: number;
  bytesReceived: number;
  messagesSent: number;
  messagesReceived: number;
  latency: number;
  packetLoss: number;
  connections: number;
  uptime: number;
}

export enum NetworkState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * Clase NetworkManager
 */
export class NetworkManager extends EventEmitter<NetworkEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly config: NetworkConfig;
  public readonly metadata: NetworkMetadata | null;

  private _state: NetworkState = NetworkState.DISCONNECTED;
  private _peers: Map<string, NetworkPeer> = new Map();
  private _rooms: Map<string, NetworkRoom> = new Map();
  private _currentRoom: NetworkRoom | null = null;
  private _sync: NetworkSync | null = null;
  private _stats: NetworkStats;
  private _startTime: number = 0;

  private _wsClient: WebSocketClient | null = null;
  private _protocol: NetworkProtocol;
  private _reconnectAttempts: number = 0;
  private _heartbeatTimer: NodeJS.Timeout | null = null;
  private _statsTimer: NodeJS.Timeout | null = null;

  constructor(config: NetworkConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.config = config;
    this.metadata = config.metadata || null;

    this._protocol = new NetworkProtocol();
    this._stats = {
      bytesSent: 0,
      bytesReceived: 0,
      messagesSent: 0,
      messagesReceived: 0,
      latency: 0,
      packetLoss: 0,
      connections: 0,
      uptime: 0
    };

    this._startTime = Date.now();
  }

  /**
   * Conecta al servidor de red
   */
  async connect(): Promise<void> {
    if (this._state === NetworkState.CONNECTED) {
      return;
    }

    try {
      this._setState(NetworkState.CONNECTING);
      
      const url = `${this.config.protocol}://${this.config.serverUrl}:${this.config.port}`;
      this._wsClient = new WebSocketClient(url, {
        autoReconnect: this.config.autoReconnect,
        reconnectInterval: this.config.reconnectInterval,
        maxReconnectAttempts: this.config.maxReconnectAttempts,
        timeout: this.config.timeout
      });

      this._wsClient.on('open', () => this._onConnectionEstablished());
      this._wsClient.on('close', (code, reason) => this._onConnectionClosed(code, reason));
      this._wsClient.on('error', (error) => this._onConnectionError(error));
      this._wsClient.on('message', (data) => this._onMessageReceived(data));

      await this._wsClient.connect();
    } catch (error) {
      this._setState(NetworkState.ERROR);
      this.emit('error:network', { manager: this, error: error as Error, context: 'connect' });
      throw error;
    }
  }

  /**
   * Desconecta del servidor
   */
  async disconnect(): Promise<void> {
    if (this._state === NetworkState.DISCONNECTED) {
      return;
    }

    this._stopHeartbeat();
    this._stopStatsTimer();

    if (this._wsClient) {
      await this._wsClient.disconnect();
      this._wsClient = null;
    }

    this._peers.clear();
    this._rooms.clear();
    this._currentRoom = null;
    this._sync = null;
    this._reconnectAttempts = 0;

    this._setState(NetworkState.DISCONNECTED);
  }

  /**
   * Envía un mensaje a un peer específico
   */
  sendMessage(peerId: string, message: NetworkMessage): Promise<void> {
    if (this._state !== NetworkState.CONNECTED) {
      throw new Error('Not connected to network');
    }

    const peer = this._peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }

    return this._sendMessage(message, peer);
  }

  /**
   * Envía un mensaje a todos los peers en la sala actual
   */
  broadcastMessage(message: NetworkMessage): Promise<void> {
    if (this._state !== NetworkState.CONNECTED || !this._currentRoom) {
      throw new Error('Not connected or not in a room');
    }

    const promises = Array.from(this._currentRoom.peers.values()).map(peer =>
      this._sendMessage(message, peer)
    );

    return Promise.all(promises).then(() => {});
  }

  /**
   * Crea una nueva sala
   */
  async createRoom(name: string, maxPeers: number = 10): Promise<NetworkRoom> {
    if (this._state !== NetworkState.CONNECTED) {
      throw new Error('Not connected to network');
    }

    const message = new NetworkMessage({
      type: 'room:create',
      data: { name, maxPeers },
      priority: MessagePriority.HIGH
    });

    const response = await this._sendAndWaitResponse(message);
    
    if (response.type !== 'room:created') {
      throw new Error('Failed to create room');
    }

    const room = new NetworkRoom(response.data.room);
    this._rooms.set(room.id, room);
    this._currentRoom = room;

    this.emit('room:created', { manager: this, room });
    return room;
  }

  /**
   * Se une a una sala existente
   */
  async joinRoom(roomId: string): Promise<NetworkRoom> {
    if (this._state !== NetworkState.CONNECTED) {
      throw new Error('Not connected to network');
    }

    const message = new NetworkMessage({
      type: 'room:join',
      data: { roomId },
      priority: MessagePriority.HIGH
    });

    const response = await this._sendAndWaitResponse(message);
    
    if (response.type !== 'room:joined') {
      throw new Error('Failed to join room');
    }

    const room = new NetworkRoom(response.data.room);
    this._rooms.set(room.id, room);
    this._currentRoom = room;

    // Agregar peers de la sala
    response.data.peers.forEach((peerData: any) => {
      const peer = new NetworkPeer(peerData);
      this._peers.set(peer.id, peer);
      room.addPeer(peer);
    });

    this.emit('room:joined', { manager: this, room });
    return room;
  }

  /**
   * Abandona la sala actual
   */
  async leaveRoom(): Promise<void> {
    if (!this._currentRoom) {
      return;
    }

    const message = new NetworkMessage({
      type: 'room:leave',
      data: { roomId: this._currentRoom.id },
      priority: MessagePriority.HIGH
    });

    await this._sendMessage(message);

    const room = this._currentRoom;
    this._currentRoom = null;
    this._rooms.delete(room.id);

    this.emit('room:left', { manager: this, room });
  }

  /**
   * Inicia sincronización con otros peers
   */
  startSync(syncConfig: any): NetworkSync {
    if (this._state !== NetworkState.CONNECTED || !this._currentRoom) {
      throw new Error('Not connected or not in a room');
    }

    this._sync = new NetworkSync(this, syncConfig);
    this._sync.start();

    this.emit('sync:started', { manager: this, sync: this._sync });
    return this._sync;
  }

  /**
   * Detiene la sincronización
   */
  stopSync(): void {
    if (this._sync) {
      this._sync.stop();
      const sync = this._sync;
      this._sync = null;

      this.emit('sync:completed', { manager: this, sync });
    }
  }

  /**
   * Obtiene estadísticas de red
   */
  getStats(): NetworkStats {
    this._stats.uptime = Date.now() - this._startTime;
    this._stats.connections = this._peers.size;
    return { ...this._stats };
  }

  /**
   * Obtiene un peer por ID
   */
  getPeer(peerId: string): NetworkPeer | null {
    return this._peers.get(peerId) || null;
  }

  /**
   * Obtiene todos los peers
   */
  getPeers(): NetworkPeer[] {
    return Array.from(this._peers.values());
  }

  /**
   * Obtiene una sala por ID
   */
  getRoom(roomId: string): NetworkRoom | null {
    return this._rooms.get(roomId) || null;
  }

  /**
   * Obtiene todas las salas
   */
  getRooms(): NetworkRoom[] {
    return Array.from(this._rooms.values());
  }

  /**
   * Obtiene la sala actual
   */
  getCurrentRoom(): NetworkRoom | null {
    return this._currentRoom;
  }

  /**
   * Maneja la conexión establecida
   */
  private _onConnectionEstablished(): void {
    this._setState(NetworkState.CONNECTED);
    this._reconnectAttempts = 0;
    this._startHeartbeat();
    this._startStatsTimer();

    // Enviar mensaje de autenticación
    const authMessage = new NetworkMessage({
      type: 'auth',
      data: {
        id: this.id,
        name: this.name,
        metadata: this.metadata
      },
      priority: MessagePriority.CRITICAL
    });

    this._sendMessage(authMessage);
  }

  /**
   * Maneja la conexión cerrada
   */
  private _onConnectionClosed(code: number, reason: string): void {
    this._stopHeartbeat();
    this._stopStatsTimer();

    if (this.config.autoReconnect && this._reconnectAttempts < this.config.maxReconnectAttempts) {
      this._setState(NetworkState.RECONNECTING);
      this._reconnectAttempts++;
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Reintento fallido, continuar con el siguiente
        });
      }, this.config.reconnectInterval);
    } else {
      this._setState(NetworkState.DISCONNECTED);
    }
  }

  /**
   * Maneja errores de conexión
   */
  private _onConnectionError(error: Error): void {
    this._setState(NetworkState.ERROR);
    this.emit('error:network', { manager: this, error, context: 'connection' });
  }

  /**
   * Maneja mensajes recibidos
   */
  private _onMessageReceived(data: any): void {
    try {
      const message = this._protocol.deserialize(data);
      this._stats.bytesReceived += data.length;
      this._stats.messagesReceived++;

      this._handleMessage(message);
    } catch (error) {
      this.emit('error:network', { 
        manager: this, 
        error: error as Error, 
        context: 'message_parsing' 
      });
    }
  }

  /**
   * Maneja un mensaje específico
   */
  private _handleMessage(message: NetworkMessage): void {
    switch (message.type) {
      case 'peer:joined':
        this._handlePeerJoined(message);
        break;
      case 'peer:left':
        this._handlePeerLeft(message);
        break;
      case 'room:update':
        this._handleRoomUpdate(message);
        break;
      case 'sync:data':
        this._handleSyncData(message);
        break;
      default:
        // Emitir mensaje genérico
        const peer = this._peers.get(message.from);
        this.emit('message:received', { manager: this, message, peer });
    }
  }

  /**
   * Maneja peer que se unió
   */
  private _handlePeerJoined(message: NetworkMessage): void {
    const peerData = message.data.peer;
    const peer = new NetworkPeer(peerData);
    this._peers.set(peer.id, peer);

    if (this._currentRoom && message.data.roomId === this._currentRoom.id) {
      this._currentRoom.addPeer(peer);
    }

    this.emit('peer:joined', { manager: this, peer, room: this._currentRoom! });
  }

  /**
   * Maneja peer que se fue
   */
  private _handlePeerLeft(message: NetworkMessage): void {
    const peerId = message.data.peerId;
    const peer = this._peers.get(peerId);
    
    if (peer) {
      this._peers.delete(peerId);
      
      if (this._currentRoom) {
        this._currentRoom.removePeer(peerId);
      }

      this.emit('peer:left', { manager: this, peer, room: this._currentRoom! });
    }
  }

  /**
   * Maneja actualización de sala
   */
  private _handleRoomUpdate(message: NetworkMessage): void {
    const roomData = message.data.room;
    const room = this._rooms.get(roomData.id);
    
    if (room) {
      room.update(roomData);
    }
  }

  /**
   * Maneja datos de sincronización
   */
  private _handleSyncData(message: NetworkMessage): void {
    if (this._sync) {
      this._sync.handleData(message.data);
    }
  }

  /**
   * Envía un mensaje
   */
  private async _sendMessage(message: NetworkMessage, peer?: NetworkPeer): Promise<void> {
    if (!this._wsClient) {
      throw new Error('WebSocket client not available');
    }

    const serialized = this._protocol.serialize(message);
    await this._wsClient.send(serialized);

    this._stats.bytesSent += serialized.length;
    this._stats.messagesSent++;

    this.emit('message:sent', { manager: this, message, peer });
  }

  /**
   * Envía un mensaje y espera respuesta
   */
  private async _sendAndWaitResponse(message: NetworkMessage): Promise<NetworkMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Response timeout'));
      }, this.config.timeout);

      const handler = (data: any) => {
        try {
          const response = this._protocol.deserialize(data);
          if (response.correlationId === message.id) {
            clearTimeout(timeout);
            this.off('message:received', handler);
            resolve(response);
          }
        } catch (error) {
          // Ignorar errores de parsing
        }
      };

      this.on('message:received', handler);
      this._sendMessage(message);
    });
  }

  /**
   * Inicia heartbeat
   */
  private _startHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
    }

    this._heartbeatTimer = setInterval(() => {
      if (this._state === NetworkState.CONNECTED) {
        const heartbeat = new NetworkMessage({
          type: 'heartbeat',
          data: { timestamp: Date.now() },
          priority: MessagePriority.LOW
        });

        this._sendMessage(heartbeat).catch(() => {
          // Ignorar errores de heartbeat
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Detiene heartbeat
   */
  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  /**
   * Inicia timer de estadísticas
   */
  private _startStatsTimer(): void {
    if (this._statsTimer) {
      clearInterval(this._statsTimer);
    }

    this._statsTimer = setInterval(() => {
      // Actualizar estadísticas
      this._stats.uptime = Date.now() - this._startTime;
    }, 1000);
  }

  /**
   * Detiene timer de estadísticas
   */
  private _stopStatsTimer(): void {
    if (this._statsTimer) {
      clearInterval(this._statsTimer);
      this._statsTimer = null;
    }
  }

  /**
   * Establece el estado de la red
   */
  private _setState(state: NetworkState): void {
    this._state = state;
  }

  // Getters
  get state(): NetworkState { return this._state; }
  get isConnected(): boolean { return this._state === NetworkState.CONNECTED; }
  get isConnecting(): boolean { return this._state === NetworkState.CONNECTING; }
  get isReconnecting(): boolean { return this._state === NetworkState.RECONNECTING; }
  get sync(): NetworkSync | null { return this._sync; }
} 