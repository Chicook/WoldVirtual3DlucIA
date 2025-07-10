/**
 * EngineCore.ts - Núcleo del Motor 3D
 * Gestiona la conexión WebSocket y el estado del motor
 * 
 * Líneas: 1-250 (Primera instancia)
 */

import { EventEmitter } from 'events';

// Tipos del motor
export interface EngineState {
  connected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  engine: 'threejs' | 'babylon' | 'custom';
  performance: {
    fps: number;
    memory: number;
    cpu: number;
  };
  resources: {
    models: number;
    textures: number;
    animations: number;
  };
  errors: string[];
}

export interface EngineConfig {
  url: string;
  port: number;
  protocol: 'ws' | 'wss';
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  autoReconnect: boolean;
}

export interface EngineMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export class EngineCore extends EventEmitter {
  private ws: WebSocket | null = null;
  private state: EngineState;
  private config: EngineConfig;
  private reconnectAttempts = 0;
  private messageQueue: EngineMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat = 0;

  constructor(config: Partial<EngineConfig> = {}) {
    super();
    
    this.config = {
      url: 'localhost',
      port: 8080,
      protocol: 'ws',
      timeout: 8000,
      maxRetries: 5,
      retryDelay: 1500,
      autoReconnect: true,
      ...config
    };

    this.state = {
      connected: false,
      status: 'disconnected',
      engine: 'threejs',
      performance: {
        fps: 0,
        memory: 0,
        cpu: 0
      },
      resources: {
        models: 0,
        textures: 0,
        animations: 0
      },
      errors: []
    };
  }

  /**
   * Conectar al motor 3D
   */
  async connect(): Promise<void> {
    if (this.state.status === 'connecting' || this.state.status === 'connected') {
      return;
    }

    this.updateState({ status: 'connecting' });
    this.emit('connecting');

    try {
      const wsUrl = `${this.config.protocol}://${this.config.url}:${this.config.port}/`;
      this.ws = new WebSocket(wsUrl);

      // Configurar timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          this.handleConnectionError('Connection timeout');
        }
      }, this.config.timeout);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.handleConnectionOpen();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        this.handleConnectionClose(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        this.handleConnectionError('WebSocket error', error);
      };

    } catch (error) {
      this.handleConnectionError('Connection failed', error);
    }
  }

  /**
   * Desconectar del motor
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateState({
      connected: false,
      status: 'disconnected'
    });

    this.emit('disconnected');
  }

  /**
   * Enviar mensaje al motor
   */
  sendMessage(type: string, data: any = {}): void {
    const message: EngineMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };

    if (this.state.connected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      this.emit('messageSent', message);
    } else {
      // Agregar a cola si no está conectado
      this.messageQueue.push(message);
      this.emit('messageQueued', message);
    }
  }

  /**
   * Obtener estado actual del motor
   */
  getState(): EngineState {
    return { ...this.state };
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): EngineConfig {
    return { ...this.config };
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<EngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.state.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtener estadísticas de conexión
   */
  getStats() {
    return {
      connected: this.state.connected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      lastHeartbeat: this.lastHeartbeat,
      uptime: this.lastHeartbeat > 0 ? Date.now() - this.lastHeartbeat : 0
    };
  }

  // Métodos privados para manejo de eventos

  private handleConnectionOpen(): void {
    this.reconnectAttempts = 0;
    this.updateState({
      connected: true,
      status: 'connected'
    });

    // Procesar cola de mensajes
    this.processMessageQueue();

    // Iniciar heartbeat
    this.startHeartbeat();

    this.emit('connected');
  }

  private handleConnectionClose(event: CloseEvent): void {
    this.updateState({
      connected: false,
      status: 'disconnected'
    });

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.emit('disconnected', event);

    // Reconexión automática si está habilitada
    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxRetries) {
      this.scheduleReconnect();
    }
  }

  private handleConnectionError(message: string, error?: any): void {
    const errorMessage = `${message}: ${error?.message || error || 'Unknown error'}`;
    
    this.updateState({
      status: 'error',
      errors: [...this.state.errors, errorMessage]
    });

    this.emit('error', errorMessage, error);

    // Reconexión automática si está habilitada
    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxRetries) {
      this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: EngineMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'heartbeat':
          this.lastHeartbeat = Date.now();
          this.emit('heartbeat', message.data);
          break;

        case 'performance':
          this.updateState({
            performance: { ...this.state.performance, ...message.data }
          });
          this.emit('performanceUpdate', message.data);
          break;

        case 'resources':
          this.updateState({
            resources: { ...this.state.resources, ...message.data }
          });
          this.emit('resourcesUpdate', message.data);
          break;

        case 'engine':
          this.updateState({
            engine: message.data.engine
          });
          this.emit('engineChanged', message.data.engine);
          break;

        default:
          this.emit('message', message);
      }
    } catch (error) {
      this.emit('messageError', error, event.data);
    }
  }

  private updateState(updates: Partial<EngineState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state, oldState);
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.config.retryDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    this.emit('reconnecting', this.reconnectAttempts, delay);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message.type, message.data);
      }
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Heartbeat cada 30 segundos
  }
}

// Exportar instancia singleton
export const engineCore = new EngineCore(); 