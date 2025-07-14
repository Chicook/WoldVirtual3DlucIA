/**
 * NetworkProtocol - Protocolo de Red
 * 
 * Protocolo de comunicación para el sistema de networking
 * del editor 3D del metaverso.
 */

import { NetworkMessage } from './NetworkMessage';
import { Logger } from '../logging/Logger';

export interface ProtocolMessage {
  id: string;
  type: string;
  data: any;
  from?: string;
  to?: string;
  roomId?: string;
  timestamp: number;
  priority: number;
  correlationId?: string;
  sequence?: number;
  checksum?: string;
}

export interface ProtocolConfig {
  version: string;
  compression: boolean;
  encryption: boolean;
  maxMessageSize: number;
  timeout: number;
}

export enum MessageType {
  // Autenticación
  AUTH = 'auth',
  AUTH_RESPONSE = 'auth:response',
  
  // Salas
  ROOM_CREATE = 'room:create',
  ROOM_CREATED = 'room:created',
  ROOM_JOIN = 'room:join',
  ROOM_JOINED = 'room:joined',
  ROOM_LEAVE = 'room:leave',
  ROOM_LEFT = 'room:left',
  ROOM_UPDATE = 'room:update',
  ROOM_LIST = 'room:list',
  
  // Peers
  PEER_JOINED = 'peer:joined',
  PEER_LEFT = 'peer:left',
  PEER_UPDATE = 'peer:update',
  
  // Mensajes
  MESSAGE = 'message',
  MESSAGE_ACK = 'message:ack',
  MESSAGE_NACK = 'message:nack',
  
  // Sincronización
  SYNC_START = 'sync:start',
  SYNC_DATA = 'sync:data',
  SYNC_END = 'sync:end',
  SYNC_REQUEST = 'sync:request',
  SYNC_RESPONSE = 'sync:response',
  
  // Control
  HEARTBEAT = 'heartbeat',
  PING = 'ping',
  PONG = 'pong',
  
  // Errores
  ERROR = 'error',
  INVALID_MESSAGE = 'invalid:message',
  RATE_LIMIT = 'rate:limit'
}

export enum CompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  LZ4 = 'lz4',
  BROTLI = 'brotli'
}

export enum EncryptionType {
  NONE = 'none',
  AES = 'aes',
  RSA = 'rsa'
}

/**
 * Clase NetworkProtocol
 */
export class NetworkProtocol {
  private _config: ProtocolConfig;
  private _version: string;
  private _sequence: number = 0;
  private _compression: CompressionType;
  private _encryption: EncryptionType;

  constructor(config?: Partial<ProtocolConfig>) {
    this._config = {
      version: '1.0.0',
      compression: false,
      encryption: false,
      maxMessageSize: 1024 * 1024, // 1MB
      timeout: 30000, // 30s
      ...config
    };

    this._version = this._config.version;
    this._compression = this._config.compression ? CompressionType.GZIP : CompressionType.NONE;
    this._encryption = this._config.encryption ? EncryptionType.AES : EncryptionType.NONE;
  }

  /**
   * Serializa un mensaje de red
   */
  serialize(message: NetworkMessage): string {
    const protocolMessage: ProtocolMessage = {
      id: message.id,
      type: message.type,
      data: message.data,
      from: message.from,
      to: message.to,
      roomId: message.roomId,
      timestamp: message.timestamp,
      priority: message.priority,
      correlationId: message.correlationId,
      sequence: this._getNextSequence(),
      checksum: this._calculateChecksum(message)
    };

    let serialized = JSON.stringify(protocolMessage);

    // Aplicar compresión si está habilitada
    if (this._compression !== CompressionType.NONE) {
      serialized = this._compress(serialized);
    }

    // Aplicar encriptación si está habilitada
    if (this._encryption !== EncryptionType.NONE) {
      serialized = this._encrypt(serialized);
    }

    // Agregar header del protocolo
    const header = {
      version: this._version,
      compression: this._compression,
      encryption: this._encryption,
      size: serialized.length,
      timestamp: Date.now()
    };

    return JSON.stringify({ header, data: serialized });
  }

  /**
   * Deserializa un mensaje de red
   */
  deserialize(data: string): NetworkMessage {
    try {
      // Parsear header del protocolo
      const parsed = JSON.parse(data);
      let messageData = parsed.data;

      // Desencriptar si es necesario
      if (parsed.header.encryption !== EncryptionType.NONE) {
        messageData = this._decrypt(messageData);
      }

      // Descomprimir si es necesario
      if (parsed.header.compression !== CompressionType.NONE) {
        messageData = this._decompress(messageData);
      }

      // Parsear mensaje del protocolo
      const protocolMessage: ProtocolMessage = JSON.parse(messageData);

      // Validar checksum
      if (!this._validateChecksum(protocolMessage)) {
        throw new Error('Invalid checksum');
      }

      // Crear mensaje de red
      const message = new NetworkMessage({
        id: protocolMessage.id,
        type: protocolMessage.type,
        data: protocolMessage.data,
        from: protocolMessage.from,
        to: protocolMessage.to,
        roomId: protocolMessage.roomId,
        timestamp: protocolMessage.timestamp,
        priority: protocolMessage.priority,
        correlationId: protocolMessage.correlationId
      });

      return message;
    } catch (error) {
      throw new Error(`Failed to deserialize message: ${error}`);
    }
  }

  /**
   * Crea un mensaje de autenticación
   */
  createAuthMessage(id: string, name: string, metadata?: any): NetworkMessage {
    return new NetworkMessage({
      type: MessageType.AUTH,
      data: { id, name, metadata },
      priority: 3 // CRITICAL
    });
  }

  /**
   * Crea un mensaje de heartbeat
   */
  createHeartbeatMessage(): NetworkMessage {
    return new NetworkMessage({
      type: MessageType.HEARTBEAT,
      data: { timestamp: Date.now() },
      priority: 0 // LOW
    });
  }

  /**
   * Crea un mensaje de ping
   */
  createPingMessage(): NetworkMessage {
    return new NetworkMessage({
      type: MessageType.PING,
      data: { timestamp: Date.now() },
      priority: 1 // NORMAL
    });
  }

  /**
   * Crea un mensaje de pong
   */
  createPongMessage(timestamp: number): NetworkMessage {
    return new NetworkMessage({
      type: MessageType.PONG,
      data: { timestamp, responseTime: Date.now() - timestamp },
      priority: 1 // NORMAL
    });
  }

  /**
   * Crea un mensaje de error
   */
  createErrorMessage(error: string, code?: number): NetworkMessage {
    return new NetworkMessage({
      type: MessageType.ERROR,
      data: { error, code, timestamp: Date.now() },
      priority: 2 // HIGH
    });
  }

  /**
   * Crea un mensaje de sincronización
   */
  createSyncMessage(data: any, syncId: string): NetworkMessage {
    return new NetworkMessage({
      type: MessageType.SYNC_DATA,
      data: { syncId, data, timestamp: Date.now() },
      priority: 2 // HIGH
    });
  }

  /**
   * Valida un mensaje
   */
  validateMessage(message: NetworkMessage): boolean {
    // Validar tipo de mensaje
    if (!Object.values(MessageType).includes(message.type as MessageType)) {
      return false;
    }

    // Validar tamaño de datos
    const dataSize = JSON.stringify(message.data).length;
    if (dataSize > this._config.maxMessageSize) {
      return false;
    }

    // Validar timestamp
    const now = Date.now();
    const messageAge = now - message.timestamp;
    if (messageAge > this._config.timeout) {
      return false;
    }

    return true;
  }

  /**
   * Obtiene el siguiente número de secuencia
   */
  private _getNextSequence(): number {
    return ++this._sequence;
  }

  /**
   * Calcula el checksum de un mensaje
   */
  private _calculateChecksum(message: NetworkMessage): string {
    const data = JSON.stringify({
      id: message.id,
      type: message.type,
      data: message.data,
      timestamp: message.timestamp
    });

    // Implementación simple de checksum (en producción usar SHA-256)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Valida el checksum de un mensaje
   */
  private _validateChecksum(protocolMessage: ProtocolMessage): boolean {
    if (!protocolMessage.checksum) {
      return true; // Sin checksum, considerar válido
    }

    const expectedChecksum = this._calculateChecksum({
      id: protocolMessage.id,
      type: protocolMessage.type,
      data: protocolMessage.data,
      timestamp: protocolMessage.timestamp
    } as any);

    return protocolMessage.checksum === expectedChecksum;
  }

  /**
   * Comprime datos
   */
  private _compress(data: string): string {
    switch (this._compression) {
      case CompressionType.GZIP:
        return this._compressGzip(data);
      case CompressionType.LZ4:
        return this._compressLZ4(data);
      case CompressionType.BROTLI:
        return this._compressBrotli(data);
      default:
        return data;
    }
  }

  /**
   * Descomprime datos
   */
  private _decompress(data: string): string {
    switch (this._compression) {
      case CompressionType.GZIP:
        return this._decompressGzip(data);
      case CompressionType.LZ4:
        return this._decompressLZ4(data);
      case CompressionType.BROTLI:
        return this._decompressBrotli(data);
      default:
        return data;
    }
  }

  /**
   * Encripta datos
   */
  private _encrypt(data: string): string {
    switch (this._encryption) {
      case EncryptionType.AES:
        return this._encryptAES(data);
      case EncryptionType.RSA:
        return this._encryptRSA(data);
      default:
        return data;
    }
  }

  /**
   * Desencripta datos
   */
  private _decrypt(data: string): string {
    switch (this._encryption) {
      case EncryptionType.AES:
        return this._decryptAES(data);
      case EncryptionType.RSA:
        return this._decryptRSA(data);
      default:
        return data;
    }
  }

  // Implementaciones de compresión (simplificadas)
  private _compressGzip(data: string): string {
    // En producción usar una librería real de compresión
    return data;
  }

  private _decompressGzip(data: string): string {
    return data;
  }

  private _compressLZ4(data: string): string {
    return data;
  }

  private _decompressLZ4(data: string): string {
    return data;
  }

  private _compressBrotli(data: string): string {
    return data;
  }

  private _decompressBrotli(data: string): string {
    return data;
  }

  // Implementaciones de encriptación (simplificadas)
  private _encryptAES(data: string): string {
    // En producción usar una librería real de encriptación
    return btoa(data);
  }

  private _decryptAES(data: string): string {
    return atob(data);
  }

  private _encryptRSA(data: string): string {
    return btoa(data);
  }

  private _decryptRSA(data: string): string {
    return atob(data);
  }

  // Getters
  get version(): string { return this._version; }
  get compression(): CompressionType { return this._compression; }
  get encryption(): EncryptionType { return this._encryption; }
  get maxMessageSize(): number { return this._config.maxMessageSize; }
  get timeout(): number { return this._config.timeout; }
} 