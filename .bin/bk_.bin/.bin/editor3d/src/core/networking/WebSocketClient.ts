/**
 * WebSocketClient - Cliente WebSocket para Networking
 * 
 * Cliente WebSocket robusto con reconexión automática y manejo de errores
 * para el sistema de networking del editor 3D.
 */

import { EventEmitter } from '../events/EventEmitter';

export interface WebSocketEvents {
  'open': { client: WebSocketClient };
  'close': { client: WebSocketClient; code: number; reason: string };
  'error': { client: WebSocketClient; error: Error };
  'message': { client: WebSocketClient; data: any };
  'reconnect': { client: WebSocketClient; attempt: number };
  'reconnect:failed': { client: WebSocketClient; attempts: number };
}

export interface WebSocketConfig {
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  timeout: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
}

export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

/**
 * Clase WebSocketClient
 */
export class WebSocketClient extends EventEmitter<WebSocketEvents> {
  private _url: string;
  private _config: WebSocketConfig;
  private _socket: WebSocket | null = null;
  private _state: WebSocketState = WebSocketState.CLOSED;
  private _reconnectAttempts: number = 0;
  private _reconnectTimer: NodeJS.Timeout | null = null;
  private _heartbeatTimer: NodeJS.Timeout | null = null;
  private _heartbeatTimeout: NodeJS.Timeout | null = null;
  private _messageQueue: Array<{ data: any; priority: number }> = [];
  private _isReconnecting: boolean = false;

  constructor(url: string, config: WebSocketConfig) {
    super();
    this._url = url;
    this._config = config;
  }

  /**
   * Conecta al servidor WebSocket
   */
  async connect(): Promise<void> {
    if (this._state === WebSocketState.OPEN || this._state === WebSocketState.CONNECTING) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this._socket = new WebSocket(this._url);
        this._state = WebSocketState.CONNECTING;

        this._socket.onopen = () => {
          this._state = WebSocketState.OPEN;
          this._reconnectAttempts = 0;
          this._isReconnecting = false;
          this._startHeartbeat();
          this._processMessageQueue();
          this.emit('open', { client: this });
          resolve();
        };

        this._socket.onclose = (event) => {
          this._state = WebSocketState.CLOSED;
          this._stopHeartbeat();
          this.emit('close', { client: this, code: event.code, reason: event.reason });

          if (this._config.autoReconnect && !this._isReconnecting) {
            this._attemptReconnect();
          }
        };

        this._socket.onerror = (error) => {
          this.emit('error', { client: this, error: error as Error });
          reject(error);
        };

        this._socket.onmessage = (event) => {
          this._handleMessage(event.data);
        };

        // Timeout para la conexión
        setTimeout(() => {
          if (this._state === WebSocketState.CONNECTING) {
            this._socket?.close();
            reject(new Error('Connection timeout'));
          }
        }, this._config.timeout);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desconecta del servidor
   */
  async disconnect(): Promise<void> {
    this._config.autoReconnect = false;
    this._stopReconnect();
    this._stopHeartbeat();

    if (this._socket && this._state === WebSocketState.OPEN) {
      this._state = WebSocketState.CLOSING;
      this._socket.close(1000, 'Client disconnect');
    }

    this._state = WebSocketState.CLOSED;
    this._socket = null;
    this._messageQueue = [];
  }

  /**
   * Envía un mensaje
   */
  async send(data: any, priority: number = 1): Promise<void> {
    if (this._state === WebSocketState.OPEN && this._socket) {
      try {
        this._socket.send(data);
      } catch (error) {
        throw new Error(`Failed to send message: ${error}`);
      }
    } else {
      // Agregar a la cola de mensajes
      this._messageQueue.push({ data, priority });
      this._messageQueue.sort((a, b) => b.priority - a.priority);
    }
  }

  /**
   * Envía un mensaje con prioridad
   */
  async sendWithPriority(data: any, priority: number): Promise<void> {
    return this.send(data, priority);
  }

  /**
   * Obtiene el estado actual
   */
  getState(): WebSocketState {
    return this._state;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this._state === WebSocketState.OPEN;
  }

  /**
   * Obtiene la URL del servidor
   */
  getUrl(): string {
    return this._url;
  }

  /**
   * Obtiene el número de intentos de reconexión
   */
  getReconnectAttempts(): number {
    return this._reconnectAttempts;
  }

  /**
   * Obtiene el tamaño de la cola de mensajes
   */
  getQueueSize(): number {
    return this._messageQueue.length;
  }

  /**
   * Limpia la cola de mensajes
   */
  clearQueue(): void {
    this._messageQueue = [];
  }

  /**
   * Intenta reconectar
   */
  private _attemptReconnect(): void {
    if (this._reconnectAttempts >= this._config.maxReconnectAttempts) {
      this.emit('reconnect:failed', { client: this, attempts: this._reconnectAttempts });
      return;
    }

    this._isReconnecting = true;
    this._reconnectAttempts++;

    this.emit('reconnect', { client: this, attempt: this._reconnectAttempts });

    this._reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reintento fallido, continuar con el siguiente
        if (this._config.autoReconnect) {
          this._attemptReconnect();
        }
      });
    }, this._config.reconnectInterval);
  }

  /**
   * Detiene el proceso de reconexión
   */
  private _stopReconnect(): void {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    this._isReconnecting = false;
  }

  /**
   * Inicia el heartbeat
   */
  private _startHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
    }

    this._heartbeatTimer = setInterval(() => {
      if (this._state === WebSocketState.OPEN) {
        this._sendHeartbeat();
      }
    }, this._config.heartbeatInterval);
  }

  /**
   * Detiene el heartbeat
   */
  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }

    if (this._heartbeatTimeout) {
      clearTimeout(this._heartbeatTimeout);
      this._heartbeatTimeout = null;
    }
  }

  /**
   * Envía heartbeat
   */
  private _sendHeartbeat(): void {
    if (this._socket && this._state === WebSocketState.OPEN) {
      try {
        this._socket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        
        // Configurar timeout para heartbeat
        this._heartbeatTimeout = setTimeout(() => {
          // Heartbeat timeout, cerrar conexión
          this._socket?.close(1000, 'Heartbeat timeout');
        }, this._config.heartbeatTimeout);
      } catch (error) {
        // Ignorar errores de heartbeat
      }
    }
  }

  /**
   * Maneja mensajes recibidos
   */
  private _handleMessage(data: any): void {
    try {
      // Limpiar timeout de heartbeat si es un heartbeat
      const message = JSON.parse(data);
      if (message.type === 'heartbeat') {
        if (this._heartbeatTimeout) {
          clearTimeout(this._heartbeatTimeout);
          this._heartbeatTimeout = null;
        }
      }

      this.emit('message', { client: this, data });
    } catch (error) {
      // Mensaje no es JSON, emitir como datos raw
      this.emit('message', { client: this, data });
    }
  }

  /**
   * Procesa la cola de mensajes
   */
  private _processMessageQueue(): void {
    if (this._state !== WebSocketState.OPEN || !this._socket) {
      return;
    }

    while (this._messageQueue.length > 0) {
      const { data } = this._messageQueue.shift()!;
      try {
        this._socket.send(data);
      } catch (error) {
        // Re-encolar mensaje si falla
        this._messageQueue.unshift({ data, priority: 1 });
        break;
      }
    }
  }

  /**
   * Serializa datos para envío
   */
  serialize(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }

  /**
   * Deserializa datos recibidos
   */
  deserialize(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
} 