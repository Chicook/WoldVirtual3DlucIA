/**
 * @fileoverview Gestor de red para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/network/NetworkManager
 */

import * as net from 'net';
import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Block, Transaction, NetworkPeer } from '../types';
import { Logger } from '../../utils/logger';

const logger = new Logger('NetworkManager');

export interface NetworkMessage {
  type: 'block' | 'transaction' | 'peer_discovery' | 'sync_request' | 'sync_response' | 'ping' | 'pong';
  data: any;
  timestamp: number;
  sender: string;
  signature?: string;
}

export interface PeerConnection {
  id: string;
  socket: net.Socket | WebSocket;
  address: string;
  port: number;
  version: string;
  lastSeen: number;
  isConnected: boolean;
  latency: number;
  capabilities: string[];
}

export class NetworkManager extends EventEmitter {
  private server: net.Server | null = null;
  private wsServer: WebSocket.Server | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private nodeId: string;
  private port: number;
  private wsPort: number;
  private isRunning: boolean = false;
  private maxPeers: number = 50;
  private pingInterval: NodeJS.Timeout | null = null;
  private discoveryInterval: NodeJS.Timeout | null = null;

  constructor(port: number, wsPort: number) {
    super();
    this.port = port;
    this.wsPort = wsPort;
    this.nodeId = this.generateNodeId();
    
    logger.info(`Gestor de red inicializado en puerto ${port} (TCP) y ${wsPort} (WebSocket)`);
  }

  /**
   * Generar ID único del nodo
   */
  private generateNodeId(): string {
    return `woldvirtual-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Iniciar servidor de red
   */
  async start(): Promise<void> {
    try {
      // Iniciar servidor TCP
      await this.startTcpServer();
      
      // Iniciar servidor WebSocket
      await this.startWebSocketServer();
      
      // Iniciar intervalos
      this.startPingInterval();
      this.startDiscoveryInterval();
      
      this.isRunning = true;
      
      logger.info('Servidor de red iniciado');
      
    } catch (error: any) {
      logger.error('Error iniciando servidor de red:', error);
      throw error;
    }
  }

  /**
   * Iniciar servidor TCP
   */
  private async startTcpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.handleNewConnection(socket);
      });

      this.server.listen(this.port, () => {
        logger.info(`Servidor TCP escuchando en puerto ${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('Error en servidor TCP:', error);
        reject(error);
      });
    });
  }

  /**
   * Iniciar servidor WebSocket
   */
  private async startWebSocketServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wsServer = new WebSocket.Server({ port: this.wsPort });

      this.wsServer.on('connection', (ws, req) => {
        this.handleWebSocketConnection(ws, req);
      });

      this.wsServer.on('listening', () => {
        logger.info(`Servidor WebSocket escuchando en puerto ${this.wsPort}`);
        resolve();
      });

      this.wsServer.on('error', (error) => {
        logger.error('Error en servidor WebSocket:', error);
        reject(error);
      });
    });
  }

  /**
   * Manejar nueva conexión TCP
   */
  private handleNewConnection(socket: net.Socket): void {
    const peerId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    const connection: PeerConnection = {
      id: peerId,
      socket,
      address: socket.remoteAddress || 'unknown',
      port: socket.remotePort || 0,
      version: '1.0.0',
      lastSeen: Date.now(),
      isConnected: true,
      latency: 0,
      capabilities: ['tcp', 'block', 'transaction']
    };

    this.peers.set(peerId, connection);

    // Configurar manejo de datos
    socket.on('data', (data) => {
      this.handleMessage(connection, data);
    });

    socket.on('close', () => {
      this.handlePeerDisconnection(peerId);
    });

    socket.on('error', (error) => {
      logger.error(`Error en conexión con peer ${peerId}:`, error);
      this.handlePeerDisconnection(peerId);
    });

    // Enviar mensaje de bienvenida
    this.sendMessage(connection, {
      type: 'peer_discovery',
      data: {
        nodeId: this.nodeId,
        version: '1.0.0',
        capabilities: ['tcp', 'block', 'transaction'],
        port: this.port
      },
      timestamp: Date.now(),
      sender: this.nodeId
    });

    logger.info(`Nueva conexión TCP: ${peerId}`);
  }

  /**
   * Manejar conexión WebSocket
   */
  private handleWebSocketConnection(ws: WebSocket, req: any): void {
    const peerId = `ws-${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: PeerConnection = {
      id: peerId,
      socket: ws,
      address: req.socket.remoteAddress || 'unknown',
      port: req.socket.remotePort || 0,
      version: '1.0.0',
      lastSeen: Date.now(),
      isConnected: true,
      latency: 0,
      capabilities: ['websocket', 'block', 'transaction']
    };

    this.peers.set(peerId, connection);

    // Configurar manejo de mensajes
    ws.on('message', (data) => {
      this.handleMessage(connection, data);
    });

    ws.on('close', () => {
      this.handlePeerDisconnection(peerId);
    });

    ws.on('error', (error) => {
      logger.error(`Error en conexión WebSocket ${peerId}:`, error);
      this.handlePeerDisconnection(peerId);
    });

    // Enviar mensaje de bienvenida
    this.sendMessage(connection, {
      type: 'peer_discovery',
      data: {
        nodeId: this.nodeId,
        version: '1.0.0',
        capabilities: ['websocket', 'block', 'transaction'],
        port: this.wsPort
      },
      timestamp: Date.now(),
      sender: this.nodeId
    });

    logger.info(`Nueva conexión WebSocket: ${peerId}`);
  }

  /**
   * Manejar mensaje recibido
   */
  private handleMessage(connection: PeerConnection, data: Buffer | WebSocket.Data): void {
    try {
      const message: NetworkMessage = JSON.parse(data.toString());
      
      // Verificar timestamp
      const now = Date.now();
      if (Math.abs(now - message.timestamp) > 30000) { // 30 segundos
        logger.warn(`Mensaje con timestamp muy antiguo de ${connection.id}`);
        return;
      }

      // Actualizar último visto
      connection.lastSeen = now;

      // Procesar mensaje según tipo
      switch (message.type) {
        case 'peer_discovery':
          this.handlePeerDiscovery(connection, message);
          break;
        case 'block':
          this.handleBlockMessage(connection, message);
          break;
        case 'transaction':
          this.handleTransactionMessage(connection, message);
          break;
        case 'sync_request':
          this.handleSyncRequest(connection, message);
          break;
        case 'sync_response':
          this.handleSyncResponse(connection, message);
          break;
        case 'ping':
          this.handlePing(connection, message);
          break;
        case 'pong':
          this.handlePong(connection, message);
          break;
        default:
          logger.warn(`Tipo de mensaje desconocido: ${message.type}`);
      }

    } catch (error: any) {
      logger.error(`Error procesando mensaje de ${connection.id}:`, error);
    }
  }

  /**
   * Manejar descubrimiento de peers
   */
  private handlePeerDiscovery(connection: PeerConnection, message: NetworkMessage): void {
    const peerInfo = message.data;
    
    // Actualizar información del peer
    connection.version = peerInfo.version;
    connection.capabilities = peerInfo.capabilities;

    // Emitir evento de nuevo peer
    this.emit('peer_discovered', {
      id: connection.id,
      address: connection.address,
      port: peerInfo.port,
      version: peerInfo.version,
      capabilities: peerInfo.capabilities
    });

    logger.debug(`Peer descubierto: ${connection.id} (${peerInfo.version})`);
  }

  /**
   * Manejar mensaje de bloque
   */
  private handleBlockMessage(connection: PeerConnection, message: NetworkMessage): void {
    const block: Block = message.data;
    
    // Emitir evento de nuevo bloque
    this.emit('block_received', {
      block,
      peer: connection.id
    });

    logger.debug(`Bloque recibido de ${connection.id}: ${block.header.number}`);
  }

  /**
   * Manejar mensaje de transacción
   */
  private handleTransactionMessage(connection: PeerConnection, message: NetworkMessage): void {
    const transaction: Transaction = message.data;
    
    // Emitir evento de nueva transacción
    this.emit('transaction_received', {
      transaction,
      peer: connection.id
    });

    logger.debug(`Transacción recibida de ${connection.id}: ${transaction.hash}`);
  }

  /**
   * Manejar solicitud de sincronización
   */
  private handleSyncRequest(connection: PeerConnection, message: NetworkMessage): void {
    const { fromBlock, toBlock } = message.data;
    
    // Emitir evento de solicitud de sincronización
    this.emit('sync_requested', {
      fromBlock,
      toBlock,
      peer: connection.id
    });

    logger.debug(`Solicitud de sincronización de ${connection.id}: bloques ${fromBlock}-${toBlock}`);
  }

  /**
   * Manejar respuesta de sincronización
   */
  private handleSyncResponse(connection: PeerConnection, message: NetworkMessage): void {
    const { blocks, transactions } = message.data;
    
    // Emitir evento de respuesta de sincronización
    this.emit('sync_response_received', {
      blocks,
      transactions,
      peer: connection.id
    });

    logger.debug(`Respuesta de sincronización recibida de ${connection.id}`);
  }

  /**
   * Manejar ping
   */
  private handlePing(connection: PeerConnection, message: NetworkMessage): void {
    // Responder con pong
    this.sendMessage(connection, {
      type: 'pong',
      data: { timestamp: message.data.timestamp },
      timestamp: Date.now(),
      sender: this.nodeId
    });
  }

  /**
   * Manejar pong
   */
  private handlePong(connection: PeerConnection, message: NetworkMessage): void {
    const latency = Date.now() - message.data.timestamp;
    connection.latency = latency;
    
    logger.debug(`Latencia de ${connection.id}: ${latency}ms`);
  }

  /**
   * Enviar mensaje a un peer
   */
  private sendMessage(connection: PeerConnection, message: NetworkMessage): void {
    try {
      const data = JSON.stringify(message);
      
      if (connection.socket instanceof WebSocket) {
        connection.socket.send(data);
      } else {
        connection.socket.write(data + '\n');
      }
      
    } catch (error: any) {
      logger.error(`Error enviando mensaje a ${connection.id}:`, error);
      this.handlePeerDisconnection(connection.id);
    }
  }

  /**
   * Manejar desconexión de peer
   */
  private handlePeerDisconnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.isConnected = false;
      this.peers.delete(peerId);
      
      // Emitir evento de desconexión
      this.emit('peer_disconnected', peerId);
      
      logger.info(`Peer desconectado: ${peerId}`);
    }
  }

  /**
   * Conectar a un peer
   */
  async connectToPeer(address: string, port: number): Promise<boolean> {
    try {
      const peerId = `${address}:${port}`;
      
      // Verificar si ya está conectado
      if (this.peers.has(peerId)) {
        logger.warn(`Ya conectado a ${peerId}`);
        return false;
      }

      // Verificar límite de peers
      if (this.peers.size >= this.maxPeers) {
        logger.warn('Límite de peers alcanzado');
        return false;
      }

      const socket = new net.Socket();
      
      return new Promise((resolve) => {
        socket.connect(port, address, () => {
          this.handleNewConnection(socket);
          resolve(true);
        });

        socket.on('error', () => {
          resolve(false);
        });

        // Timeout de conexión
        setTimeout(() => {
          socket.destroy();
          resolve(false);
        }, 5000);
      });

    } catch (error: any) {
      logger.error(`Error conectando a ${address}:${port}:`, error);
      return false;
    }
  }

  /**
   * Transmitir bloque a todos los peers
   */
  async broadcastBlock(block: Block): Promise<void> {
    const message: NetworkMessage = {
      type: 'block',
      data: block,
      timestamp: Date.now(),
      sender: this.nodeId
    };

    for (const [peerId, connection] of this.peers) {
      if (connection.isConnected && connection.capabilities.includes('block')) {
        this.sendMessage(connection, message);
      }
    }

    logger.debug(`Bloque ${block.header.number} transmitido a ${this.peers.size} peers`);
  }

  /**
   * Transmitir transacción a todos los peers
   */
  async broadcastTransaction(transaction: Transaction): Promise<void> {
    const message: NetworkMessage = {
      type: 'transaction',
      data: transaction,
      timestamp: Date.now(),
      sender: this.nodeId
    };

    for (const [peerId, connection] of this.peers) {
      if (connection.isConnected && connection.capabilities.includes('transaction')) {
        this.sendMessage(connection, message);
      }
    }

    logger.debug(`Transacción ${transaction.hash} transmitida a ${this.peers.size} peers`);
  }

  /**
   * Solicitar sincronización a un peer
   */
  async requestSync(peerId: string, fromBlock: number, toBlock: number): Promise<void> {
    const connection = this.peers.get(peerId);
    if (!connection || !connection.isConnected) {
      logger.warn(`Peer no disponible para sincronización: ${peerId}`);
      return;
    }

    const message: NetworkMessage = {
      type: 'sync_request',
      data: { fromBlock, toBlock },
      timestamp: Date.now(),
      sender: this.nodeId
    };

    this.sendMessage(connection, message);
    logger.debug(`Solicitud de sincronización enviada a ${peerId}`);
  }

  /**
   * Enviar respuesta de sincronización
   */
  async sendSyncResponse(peerId: string, blocks: Block[], transactions: Transaction[]): Promise<void> {
    const connection = this.peers.get(peerId);
    if (!connection || !connection.isConnected) {
      return;
    }

    const message: NetworkMessage = {
      type: 'sync_response',
      data: { blocks, transactions },
      timestamp: Date.now(),
      sender: this.nodeId
    };

    this.sendMessage(connection, message);
  }

  /**
   * Iniciar intervalo de ping
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (!this.isRunning) return;

      for (const [peerId, connection] of this.peers) {
        if (connection.isConnected) {
          this.sendMessage(connection, {
            type: 'ping',
            data: { timestamp: Date.now() },
            timestamp: Date.now(),
            sender: this.nodeId
          });
        }
      }
    }, 30000); // Cada 30 segundos
  }

  /**
   * Iniciar intervalo de descubrimiento
   */
  private startDiscoveryInterval(): void {
    this.discoveryInterval = setInterval(() => {
      if (!this.isRunning) return;

      // Limpiar peers inactivos
      const now = Date.now();
      for (const [peerId, connection] of this.peers) {
        if (now - connection.lastSeen > 120000) { // 2 minutos
          this.handlePeerDisconnection(peerId);
        }
      }
    }, 60000); // Cada minuto
  }

  /**
   * Obtener información de peers
   */
  getPeers(): NetworkPeer[] {
    return Array.from(this.peers.values()).map(peer => ({
      address: peer.address,
      port: peer.port,
      version: peer.version,
      lastSeen: peer.lastSeen,
      isConnected: peer.isConnected,
      latency: peer.latency
    }));
  }

  /**
   * Obtener número de peers conectados
   */
  getConnectedPeersCount(): number {
    return Array.from(this.peers.values()).filter(p => p.isConnected).length;
  }

  /**
   * Obtener ID del nodo
   */
  getNodeId(): string {
    return this.nodeId;
  }

  /**
   * Detener servidor de red
   */
  async stop(): Promise<void> {
    try {
      this.isRunning = false;

      // Detener intervalos
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      if (this.discoveryInterval) {
        clearInterval(this.discoveryInterval);
      }

      // Cerrar conexiones de peers
      for (const [peerId, connection] of this.peers) {
        if (connection.socket instanceof WebSocket) {
          connection.socket.close();
        } else {
          connection.socket.destroy();
        }
      }
      this.peers.clear();

      // Cerrar servidores
      if (this.server) {
        this.server.close();
      }
      if (this.wsServer) {
        this.wsServer.close();
      }

      logger.info('Servidor de red detenido');

    } catch (error: any) {
      logger.error('Error deteniendo servidor de red:', error);
      throw error;
    }
  }

  /**
   * Verificar si está ejecutándose
   */
  isNetworkRunning(): boolean {
    return this.isRunning;
  }
}

export default NetworkManager; 