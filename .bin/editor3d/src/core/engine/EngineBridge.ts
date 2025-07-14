//! Puente de comunicación entre el Editor y el Motor 3D
//! 
//! Proporciona comunicación bidireccional, sincronización de estado,
//! y control remoto del motor desde el editor.

import { EventEmitter } from 'events';
import { EngineMessage, EngineResponse, EngineCommand } from '../types/engine';

/// Configuración del puente del motor
export interface EngineBridgeConfig {
  /// URL del motor
  motorUrl: string;
  /// Puerto del motor
  motorPort: number;
  /// Protocolo de comunicación
  protocol: 'ws' | 'http' | 'tcp';
  /// Timeout de conexión
  connectionTimeout: number;
  /// Reintentos de conexión
  maxRetries: number;
  /// Configuración de heartbeat
  heartbeat: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  /// Configuración de sincronización
  sync: {
    enabled: boolean;
    interval: number;
    autoSync: boolean;
  };
}

/// Estado del puente
export interface EngineBridgeState {
  /// Conectado
  connected: boolean;
  /// Estado de la conexión
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  /// Última actividad
  lastActivity: number;
  /// Latencia
  latency: number;
  /// Error
  error?: string;
  /// Estadísticas
  stats: {
    messagesSent: number;
    messagesReceived: number;
    errors: number;
    reconnections: number;
  };
}

/// Eventos del puente
export interface EngineBridgeEvents {
  /// Conexión establecida
  connected: () => void;
  /// Conexión perdida
  disconnected: () => void;
  /// Error de conexión
  error: (error: string) => void;
  /// Mensaje recibido
  message: (message: EngineMessage) => void;
  /// Estado actualizado
  stateChanged: (state: EngineBridgeState) => void;
  /// Sincronización completada
  synced: (data: any) => void;
}

/// Puente del motor
export class EngineBridge extends EventEmitter {
  /// Configuración
  private config: EngineBridgeConfig;
  /// Estado
  private state: EngineBridgeState;
  /// WebSocket
  private ws: WebSocket | null = null;
  /// Heartbeat timer
  private heartbeatTimer: NodeJS.Timeout | null = null;
  /// Sync timer
  private syncTimer: NodeJS.Timeout | null = null;
  /// Reconnection timer
  private reconnectTimer: NodeJS.Timeout | null = null;
  /// Message queue
  private messageQueue: EngineMessage[] = [];
  /// Response handlers
  private responseHandlers: Map<string, (response: EngineResponse) => void> = new Map();

  constructor(config: EngineBridgeConfig) {
    super();
    this.config = config;
    this.state = {
      connected: false,
      connectionState: 'disconnected',
      lastActivity: 0,
      latency: 0,
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
        reconnections: 0,
      },
    };
  }

  /// Conectar al motor
  async connect(): Promise<void> {
    if (this.state.connectionState === 'connecting' || this.state.connectionState === 'connected') {
      return;
    }

    this.updateState({ connectionState: 'connecting' });

    try {
      const url = `${this.config.protocol === 'ws' ? 'ws' : 'wss'}://${this.config.motorUrl}:${this.config.motorPort}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.updateState({ 
          connected: true, 
          connectionState: 'connected',
          lastActivity: Date.now(),
          error: undefined 
        });
        
        this.emit('connected');
        this.startHeartbeat();
        this.startSync();
        this.processMessageQueue();
        
        console.log('✅ Conectado al motor 3D');
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        this.handleError(`Error de WebSocket: ${error}`);
      };

      // Timeout de conexión
      setTimeout(() => {
        if (this.state.connectionState === 'connecting') {
          this.handleError('Timeout de conexión');
        }
      }, this.config.connectionTimeout);

    } catch (error) {
      this.handleError(`Error conectando al motor: ${error}`);
    }
  }

  /// Desconectar del motor
  disconnect(): void {
    this.stopHeartbeat();
    this.stopSync();
    this.stopReconnection();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateState({ 
      connected: false, 
      connectionState: 'disconnected' 
    });
    
    this.emit('disconnected');
    console.log('🔌 Desconectado del motor 3D');
  }

  /// Enviar comando al motor
  async sendCommand(command: EngineCommand): Promise<EngineResponse> {
    const message: EngineMessage = {
      id: this.generateMessageId(),
      type: 'command',
      timestamp: Date.now(),
      data: command,
    };

    return new Promise((resolve, reject) => {
      // Registrar handler para la respuesta
      this.responseHandlers.set(message.id, (response) => {
        this.responseHandlers.delete(message.id);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Comando falló'));
        }
      });

      // Enviar mensaje
      this.sendMessage(message);
    });
  }

  /// Enviar mensaje al motor
  sendMessage(message: EngineMessage): void {
    if (!this.state.connected || !this.ws) {
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.updateState({
        lastActivity: Date.now(),
        stats: {
          ...this.state.stats,
          messagesSent: this.state.stats.messagesSent + 1,
        },
      });
    } catch (error) {
      this.handleError(`Error enviando mensaje: ${error}`);
    }
  }

  /// Manejar mensaje recibido
  private handleMessage(data: string): void {
    try {
      const message: EngineMessage = JSON.parse(data);
      
      this.updateState({
        lastActivity: Date.now(),
        stats: {
          ...this.state.stats,
          messagesReceived: this.state.stats.messagesReceived + 1,
        },
      });

      // Calcular latencia
      if (message.timestamp) {
        this.updateState({
          latency: Date.now() - message.timestamp,
        });
      }

      // Emitir evento de mensaje
      this.emit('message', message);

      // Manejar respuesta
      if (message.type === 'response') {
        const handler = this.responseHandlers.get(message.id);
        if (handler) {
          handler(message.data as EngineResponse);
        }
      }

      // Manejar eventos del motor
      if (message.type === 'event') {
        this.handleEngineEvent(message.data);
      }

    } catch (error) {
      this.handleError(`Error procesando mensaje: ${error}`);
    }
  }

  /// Manejar eventos del motor
  private handleEngineEvent(event: any): void {
    switch (event.type) {
      case 'entity_created':
        this.emit('entityCreated', event.data);
        break;
      case 'entity_updated':
        this.emit('entityUpdated', event.data);
        break;
      case 'entity_deleted':
        this.emit('entityDeleted', event.data);
        break;
      case 'scene_loaded':
        this.emit('sceneLoaded', event.data);
        break;
      case 'scene_saved':
        this.emit('sceneSaved', event.data);
        break;
      case 'error':
        this.emit('engineError', event.data);
        break;
      case 'performance_update':
        this.emit('performanceUpdate', event.data);
        break;
      default:
        console.log('Evento del motor no manejado:', event);
    }
  }

  /// Manejar desconexión
  private handleDisconnection(): void {
    this.updateState({ 
      connected: false, 
      connectionState: 'disconnected' 
    });
    
    this.stopHeartbeat();
    this.stopSync();
    this.emit('disconnected');

    // Intentar reconectar
    if (this.state.stats.reconnections < this.config.maxRetries) {
      this.scheduleReconnection();
    } else {
      this.handleError('Máximo número de reconexiones alcanzado');
    }
  }

  /// Manejar error
  private handleError(error: string): void {
    this.updateState({
      connectionState: 'error',
      error,
      stats: {
        ...this.state.stats,
        errors: this.state.stats.errors + 1,
      },
    });
    
    this.emit('error', error);
    console.error('❌ Error del puente del motor:', error);
  }

  /// Programar reconexión
  private scheduleReconnection(): void {
    this.stopReconnection();
    
    const delay = Math.min(1000 * Math.pow(2, this.state.stats.reconnections), 30000);
    
    this.reconnectTimer = setTimeout(() => {
      this.updateState({
        stats: {
          ...this.state.stats,
          reconnections: this.state.stats.reconnections + 1,
        },
      });
      
      this.connect();
    }, delay);
  }

  /// Iniciar heartbeat
  private startHeartbeat(): void {
    if (!this.config.heartbeat.enabled) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.state.connected) {
        this.sendMessage({
          id: this.generateMessageId(),
          type: 'heartbeat',
          timestamp: Date.now(),
          data: { ping: true },
        });
      }
    }, this.config.heartbeat.interval);
  }

  /// Detener heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /// Iniciar sincronización
  private startSync(): void {
    if (!this.config.sync.enabled) return;

    this.syncTimer = setInterval(() => {
      if (this.state.connected && this.config.sync.autoSync) {
        this.syncState();
      }
    }, this.config.sync.interval);
  }

  /// Detener sincronización
  private stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /// Detener reconexión
  private stopReconnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /// Procesar cola de mensajes
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /// Sincronizar estado
  async syncState(): Promise<void> {
    try {
      const response = await this.sendCommand({
        type: 'get_state',
        data: {},
      });

      if (response.success) {
        this.emit('synced', response.data);
      }
    } catch (error) {
      console.error('Error sincronizando estado:', error);
    }
  }

  /// Actualizar estado
  private updateState(updates: Partial<EngineBridgeState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  /// Generar ID de mensaje
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /// Obtener estado
  getState(): EngineBridgeState {
    return { ...this.state };
  }

  /// Verificar si está conectado
  isConnected(): boolean {
    return this.state.connected;
  }

  /// Obtener latencia
  getLatency(): number {
    return this.state.latency;
  }

  /// Obtener estadísticas
  getStats() {
    return { ...this.state.stats };
  }
}

/// Comandos específicos del motor
export class EngineCommands {
  constructor(private bridge: EngineBridge) {}

  /// Crear entidad
  async createEntity(components: any[] = []): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'create_entity',
      data: { components },
    });
    return response.data;
  }

  /// Eliminar entidad
  async deleteEntity(entityId: string): Promise<void> {
    await this.bridge.sendCommand({
      type: 'delete_entity',
      data: { entityId },
    });
  }

  /// Agregar componente
  async addComponent(entityId: string, componentType: string, componentData: any): Promise<void> {
    await this.bridge.sendCommand({
      type: 'add_component',
      data: { entityId, componentType, componentData },
    });
  }

  /// Remover componente
  async removeComponent(entityId: string, componentType: string): Promise<void> {
    await this.bridge.sendCommand({
      type: 'remove_component',
      data: { entityId, componentType },
    });
  }

  /// Actualizar componente
  async updateComponent(entityId: string, componentType: string, componentData: any): Promise<void> {
    await this.bridge.sendCommand({
      type: 'update_component',
      data: { entityId, componentType, componentData },
    });
  }

  /// Cargar modelo 3D
  async loadModel(path: string): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'load_model',
      data: { path },
    });
    return response.data;
  }

  /// Crear material
  async createMaterial(materialData: any): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'create_material',
      data: materialData,
    });
    return response.data;
  }

  /// Crear luz
  async createLight(lightData: any): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'create_light',
      data: lightData,
    });
    return response.data;
  }

  /// Crear cámara
  async createCamera(cameraData: any): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'create_camera',
      data: cameraData,
    });
    return response.data;
  }

  /// Cargar escena
  async loadScene(sceneData: any): Promise<void> {
    await this.bridge.sendCommand({
      type: 'load_scene',
      data: sceneData,
    });
  }

  /// Guardar escena
  async saveScene(sceneData: any): Promise<void> {
    await this.bridge.sendCommand({
      type: 'save_scene',
      data: sceneData,
    });
  }

  /// Obtener estadísticas del motor
  async getEngineStats(): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'get_stats',
      data: {},
    });
    return response.data;
  }

  /// Ejecutar script WASM
  async executeWasmScript(scriptData: any): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'execute_wasm',
      data: scriptData,
    });
    return response.data;
  }

  /// Enviar transacción blockchain
  async sendBlockchainTransaction(transactionData: any): Promise<any> {
    const response = await this.bridge.sendCommand({
      type: 'blockchain_transaction',
      data: transactionData,
    });
    return response.data;
  }
} 