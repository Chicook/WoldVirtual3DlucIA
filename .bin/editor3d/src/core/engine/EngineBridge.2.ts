//! EngineBridge.2.ts - Puente de Motor Mejorado con Solución de WebSocket
//! 
//! Esta es la segunda instancia del EngineBridge que soluciona los problemas
//! de conexión WebSocket y añade funcionalidades avanzadas de motor híbrido.
//! Continuación desde EngineBridge.ts línea 599.

import { EventEmitter } from 'events';
import { EngineMessage, EngineResponse, EngineCommand } from '../types/engine';

/// Configuración avanzada del puente del motor
export interface AdvancedEngineBridgeConfig {
  /// Configuración de conexión principal
  connection: {
    motorUrl: string;
    motorPort: number;
    protocol: 'ws' | 'wss' | 'http' | 'https';
    connectionTimeout: number;
    maxRetries: number;
    retryDelay: number;
    keepAlive: boolean;
    keepAliveInterval: number;
  };
  
  /// Configuración de motores híbridos
  engines: {
    primary: 'threejs' | 'babylon' | 'webgl' | 'custom';
    fallback: 'threejs' | 'babylon' | 'webgl' | 'custom';
    autoSwitch: boolean;
    performanceThreshold: number;
  };
  
  /// Configuración de recursos
  resources: {
    maxConnections: number;
    connectionPool: boolean;
    resourceTimeout: number;
    memoryLimit: number;
    cpuLimit: number;
  };
  
  /// Configuración de sincronización
  sync: {
    enabled: boolean;
    interval: number;
    autoSync: boolean;
    conflictResolution: 'last-write-wins' | 'merge' | 'manual';
    batchSize: number;
  };
  
  /// Configuración de seguridad
  security: {
    authentication: boolean;
    token?: string;
    encryption: boolean;
    sslVerify: boolean;
    allowedOrigins: string[];
  };
}

/// Estado avanzado del puente
export interface AdvancedEngineBridgeState {
  /// Estado de conexión
  connection: {
    connected: boolean;
    state: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
    lastActivity: number;
    latency: number;
    error?: string;
    retryCount: number;
  };
  
  /// Estado de motores
  engines: {
    active: string;
    available: string[];
    performance: {
      fps: number;
      memory: number;
      cpu: number;
      gpu: number;
    };
    health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
  
  /// Estado de recursos
  resources: {
    connections: number;
    memory: number;
    cpu: number;
    gpu: number;
    network: {
      bandwidth: number;
      packetsLost: number;
      jitter: number;
    };
  };
  
  /// Estadísticas
  stats: {
    messagesSent: number;
    messagesReceived: number;
    errors: number;
    reconnections: number;
    engineSwitches: number;
    performanceDrops: number;
  };
}

/// Eventos avanzados del puente
export interface AdvancedEngineBridgeEvents {
  /// Eventos de conexión
  connected: () => void;
  disconnected: () => void;
  reconnecting: (attempt: number) => void;
  connectionFailed: (error: string) => void;
  
  /// Eventos de motor
  engineSwitched: (from: string, to: string, reason: string) => void;
  performanceUpdate: (metrics: any) => void;
  resourceWarning: (resource: string, usage: number) => void;
  
  /// Eventos de mensajes
  message: (message: EngineMessage) => void;
  messageSent: (message: EngineMessage) => void;
  messageReceived: (message: EngineMessage) => void;
  
  /// Eventos de estado
  stateChanged: (state: AdvancedEngineBridgeState) => void;
  error: (error: string, context?: any) => void;
}

/// Puente de motor avanzado
export class AdvancedEngineBridge extends EventEmitter {
  /// Configuración
  private config: AdvancedEngineBridgeConfig;
  
  /// Estado
  private state: AdvancedEngineBridgeState;
  
  /// Conexiones WebSocket
  private connections: Map<string, WebSocket> = new Map();
  
  /// Timers
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  /// Cola de mensajes
  private messageQueue: EngineMessage[] = [];
  
  /// Handlers de respuesta
  private responseHandlers: Map<string, (response: EngineResponse) => void> = new Map();
  
  /// Pool de conexiones
  private connectionPool: WebSocket[] = [];
  
  /// Métricas de rendimiento
  private performanceMetrics: {
    fps: number[];
    memory: number[];
    cpu: number[];
    latency: number[];
  } = {
    fps: [],
    memory: [],
    cpu: [],
    latency: []
  };

  constructor(config: AdvancedEngineBridgeConfig) {
    super();
    this.config = config;
    this.state = this.initializeState();
    this.setupEventHandlers();
  }

  /// Inicializar estado
  private initializeState(): AdvancedEngineBridgeState {
    return {
      connection: {
        connected: false,
        state: 'disconnected',
        lastActivity: 0,
        latency: 0,
        retryCount: 0
      },
      engines: {
        active: this.config.engines.primary,
        available: [this.config.engines.primary, this.config.engines.fallback],
        performance: {
          fps: 0,
          memory: 0,
          cpu: 0,
          gpu: 0
        },
        health: 'excellent'
      },
      resources: {
        connections: 0,
        memory: 0,
        cpu: 0,
        gpu: 0,
        network: {
          bandwidth: 0,
          packetsLost: 0,
          jitter: 0
        }
      },
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
        reconnections: 0,
        engineSwitches: 0,
        performanceDrops: 0
      }
    };
  }

  /// Configurar handlers de eventos
  private setupEventHandlers(): void {
    // Handler para errores no capturados
    process.on('uncaughtException', (error) => {
      this.handleError(`Uncaught Exception: ${error.message}`, { error });
    });

    // Handler para promesas rechazadas
    process.on('unhandledRejection', (reason, promise) => {
      this.handleError(`Unhandled Rejection: ${reason}`, { promise });
    });
  }

  /// Conectar al motor con manejo mejorado de errores
  async connect(): Promise<void> {
    if (this.state.connection.state === 'connecting' || this.state.connection.state === 'connected') {
      return;
    }

    this.updateState({ 
      connection: { 
        ...this.state.connection, 
        state: 'connecting' 
      } 
    });

    try {
      // Verificar recursos disponibles
      if (!this.checkResources()) {
        throw new Error('Insufficient resources');
      }

      // Crear conexión principal
      const primaryConnection = await this.createConnection('primary');
      
      if (primaryConnection) {
        this.connections.set('primary', primaryConnection);
        this.updateState({
          connection: {
            ...this.state.connection,
            connected: true,
            state: 'connected',
            lastActivity: Date.now(),
            error: undefined
          },
          resources: {
            ...this.state.resources,
            connections: this.connections.size
          }
        });

        this.emit('connected');
        this.startMonitoring();
        this.processMessageQueue();
        
        console.log('✅ Conectado al motor 3D (Advanced Bridge)');
      } else {
        throw new Error('Failed to establish primary connection');
      }

    } catch (error) {
      this.handleConnectionError(error as Error);
    }
  }

  /// Crear conexión WebSocket con configuración mejorada
  private async createConnection(type: string): Promise<WebSocket | null> {
    return new Promise((resolve) => {
      try {
        const url = this.buildConnectionUrl();
        const ws = new WebSocket(url);

        // Configurar timeout de conexión
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            resolve(null);
          }
        }, this.config.connection.timeout);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          this.setupWebSocketHandlers(ws, type);
          resolve(ws);
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error(`WebSocket error (${type}):`, error);
          resolve(null);
        };

      } catch (error) {
        console.error(`Error creating connection (${type}):`, error);
        resolve(null);
      }
    });
  }

  /// Construir URL de conexión
  private buildConnectionUrl(): string {
    const { motorUrl, motorPort, protocol } = this.config.connection;
    const secure = protocol === 'wss' || protocol === 'https';
    const wsProtocol = secure ? 'wss' : 'ws';
    const httpProtocol = secure ? 'https' : 'http';
    
    // Si es WebSocket, usar ws/wss
    if (protocol === 'ws' || protocol === 'wss') {
      return `${wsProtocol}://${motorUrl}:${motorPort}`;
    }
    
    // Si es HTTP, convertir a WebSocket
    return `${wsProtocol}://${motorUrl}:${motorPort}`;
  }

  /// Configurar handlers de WebSocket
  private setupWebSocketHandlers(ws: WebSocket, type: string): void {
    ws.onmessage = (event) => {
      this.handleMessage(event.data, type);
    };

    ws.onclose = () => {
      this.handleDisconnection(type);
    };

    ws.onerror = (error) => {
      this.handleError(`WebSocket error (${type}): ${error}`, { type, error });
    };
  }

  /// Verificar recursos disponibles
  private checkResources(): boolean {
    // Verificar límite de conexiones
    if (this.state.resources.connections >= this.config.resources.maxConnections) {
      console.warn('⚠️ Límite de conexiones alcanzado');
      return false;
    }

    // Verificar memoria disponible (simulado)
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > this.config.resources.memoryLimit * 1024 * 1024) {
      console.warn('⚠️ Límite de memoria alcanzado');
      return false;
    }

    return true;
  }

  /// Manejar error de conexión
  private handleConnectionError(error: Error): void {
    this.state.connection.retryCount++;
    
    this.updateState({
      connection: {
        ...this.state.connection,
        state: 'error',
        error: error.message
      },
      stats: {
        ...this.state.stats,
        errors: this.state.stats.errors + 1
      }
    });

    this.emit('connectionFailed', error.message);

    // Intentar reconexión si no se ha excedido el límite
    if (this.state.connection.retryCount < this.config.connection.maxRetries) {
      this.scheduleReconnection();
    } else {
      console.error('❌ Máximo número de reintentos alcanzado');
    }
  }

  /// Programar reconexión
  private scheduleReconnection(): void {
    const delay = this.config.connection.retryDelay * Math.pow(2, this.state.connection.retryCount - 1);
    
    this.updateState({
      connection: {
        ...this.state.connection,
        state: 'reconnecting'
      }
    });

    this.emit('reconnecting', this.state.connection.retryCount);

    const timer = setTimeout(() => {
      this.connect();
    }, delay);

    this.timers.set('reconnection', timer);
  }

  /// Iniciar monitoreo
  private startMonitoring(): void {
    // Monitoreo de rendimiento
    if (this.config.engines.autoSwitch) {
      this.startPerformanceMonitoring();
    }

    // Monitoreo de recursos
    this.startResourceMonitoring();

    // Keep-alive
    if (this.config.connection.keepAlive) {
      this.startKeepAlive();
    }
  }

  /// Monitoreo de rendimiento
  private startPerformanceMonitoring(): void {
    const timer = setInterval(() => {
      this.updatePerformanceMetrics();
      
      // Verificar si necesitamos cambiar de motor
      if (this.shouldSwitchEngine()) {
        this.switchEngine();
      }
    }, 1000);

    this.timers.set('performance', timer);
  }

  /// Monitoreo de recursos
  private startResourceMonitoring(): void {
    const timer = setInterval(() => {
      this.updateResourceMetrics();
    }, 5000);

    this.timers.set('resources', timer);
  }

  /// Keep-alive
  private startKeepAlive(): void {
    const timer = setInterval(() => {
      this.sendKeepAlive();
    }, this.config.connection.keepAliveInterval);

    this.timers.set('keepAlive', timer);
  }

  /// Actualizar métricas de rendimiento
  private updatePerformanceMetrics(): void {
    // Simular métricas de rendimiento
    const fps = Math.random() * 60 + 30;
    const memory = Math.random() * 100;
    const cpu = Math.random() * 100;
    const latency = Math.random() * 100;

    this.performanceMetrics.fps.push(fps);
    this.performanceMetrics.memory.push(memory);
    this.performanceMetrics.cpu.push(cpu);
    this.performanceMetrics.latency.push(latency);

    // Mantener solo las últimas 60 métricas (1 minuto)
    if (this.performanceMetrics.fps.length > 60) {
      this.performanceMetrics.fps.shift();
      this.performanceMetrics.memory.shift();
      this.performanceMetrics.cpu.shift();
      this.performanceMetrics.latency.shift();
    }

    // Calcular promedios
    const avgFps = this.performanceMetrics.fps.reduce((a, b) => a + b, 0) / this.performanceMetrics.fps.length;
    const avgMemory = this.performanceMetrics.memory.reduce((a, b) => a + b, 0) / this.performanceMetrics.memory.length;
    const avgCpu = this.performanceMetrics.cpu.reduce((a, b) => a + b, 0) / this.performanceMetrics.cpu.length;
    const avgLatency = this.performanceMetrics.latency.reduce((a, b) => a + b, 0) / this.performanceMetrics.latency.length;

    this.updateState({
      engines: {
        ...this.state.engines,
        performance: {
          fps: avgFps,
          memory: avgMemory,
          cpu: avgCpu,
          gpu: 0 // Simulado
        },
        health: this.calculateHealth(avgFps, avgMemory, avgCpu)
      },
      connection: {
        ...this.state.connection,
        latency: avgLatency
      }
    });

    this.emit('performanceUpdate', {
      fps: avgFps,
      memory: avgMemory,
      cpu: avgCpu,
      latency: avgLatency
    });
  }

  /// Calcular salud del motor
  private calculateHealth(fps: number, memory: number, cpu: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (fps >= 55 && memory < 70 && cpu < 70) return 'excellent';
    if (fps >= 45 && memory < 80 && cpu < 80) return 'good';
    if (fps >= 30 && memory < 90 && cpu < 90) return 'fair';
    if (fps >= 20 && memory < 95 && cpu < 95) return 'poor';
    return 'critical';
  }

  /// Verificar si debe cambiar de motor
  private shouldSwitchEngine(): boolean {
    const { fps, memory, cpu } = this.state.engines.performance;
    const threshold = this.config.engines.performanceThreshold;

    return fps < threshold || memory > 90 || cpu > 90;
  }

  /// Cambiar de motor
  private switchEngine(): void {
    const currentEngine = this.state.engines.active;
    const newEngine = currentEngine === this.config.engines.primary 
      ? this.config.engines.fallback 
      : this.config.engines.primary;

    this.updateState({
      engines: {
        ...this.state.engines,
        active: newEngine
      },
      stats: {
        ...this.state.stats,
        engineSwitches: this.state.stats.engineSwitches + 1
      }
    });

    this.emit('engineSwitched', currentEngine, newEngine, 'Performance threshold exceeded');
    console.log(`🔄 Cambiando de motor: ${currentEngine} → ${newEngine}`);
  }

  /// Actualizar métricas de recursos
  private updateResourceMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.updateState({
      resources: {
        ...this.state.resources,
        memory: memoryUsage.heapUsed / 1024 / 1024, // MB
        cpu: cpuUsage.user / 1000000, // Segundos
        connections: this.connections.size
      }
    });

    // Verificar advertencias de recursos
    if (memoryUsage.heapUsed > this.config.resources.memoryLimit * 1024 * 1024 * 0.8) {
      this.emit('resourceWarning', 'memory', memoryUsage.heapUsed / 1024 / 1024);
    }
  }

  /// Enviar keep-alive
  private sendKeepAlive(): void {
    const message: EngineMessage = {
      id: this.generateMessageId(),
      type: 'ping',
      timestamp: Date.now(),
      data: { type: 'keep-alive' }
    };

    this.sendMessage(message);
  }

  /// Manejar mensaje recibido
  private handleMessage(data: string, connectionType: string): void {
    try {
      const message: EngineMessage = JSON.parse(data);
      
      this.updateState({
        connection: {
          ...this.state.connection,
          lastActivity: Date.now()
        },
        stats: {
          ...this.state.stats,
          messagesReceived: this.state.stats.messagesReceived + 1
        }
      });

      // Calcular latencia para pings
      if (message.type === 'pong' && message.timestamp) {
        const latency = Date.now() - message.timestamp;
        this.updateState({
          connection: {
            ...this.state.connection,
            latency
          }
        });
      }

      this.emit('messageReceived', message);
      this.emit('message', message);

      // Manejar respuesta
      if (message.type === 'response') {
        const handler = this.responseHandlers.get(message.id);
        if (handler) {
          handler(message.data as EngineResponse);
          this.responseHandlers.delete(message.id);
        }
      }

    } catch (error) {
      this.handleError(`Error procesando mensaje: ${error}`, { data, connectionType });
    }
  }

  /// Manejar desconexión
  private handleDisconnection(connectionType: string): void {
    this.connections.delete(connectionType);
    
    this.updateState({
      connection: {
        ...this.state.connection,
        connected: false,
        state: 'disconnected'
      },
      resources: {
        ...this.state.resources,
        connections: this.connections.size
      }
    });

    this.emit('disconnected');

    // Intentar reconexión si es la conexión principal
    if (connectionType === 'primary' && this.state.connection.retryCount < this.config.connection.maxRetries) {
      this.scheduleReconnection();
    }
  }

  /// Enviar mensaje
  sendMessage(message: EngineMessage): void {
    if (!this.state.connection.connected || this.connections.size === 0) {
      this.messageQueue.push(message);
      return;
    }

    try {
      const primaryConnection = this.connections.get('primary');
      if (primaryConnection && primaryConnection.readyState === WebSocket.OPEN) {
        primaryConnection.send(JSON.stringify(message));
        
        this.updateState({
          connection: {
            ...this.state.connection,
            lastActivity: Date.now()
          },
          stats: {
            ...this.state.stats,
            messagesSent: this.state.stats.messagesSent + 1
          }
        });

        this.emit('messageSent', message);
      } else {
        this.messageQueue.push(message);
      }
    } catch (error) {
      this.handleError(`Error enviando mensaje: ${error}`, { message });
    }
  }

  /// Procesar cola de mensajes
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state.connection.connected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /// Enviar comando
  async sendCommand(command: EngineCommand): Promise<EngineResponse> {
    const message: EngineMessage = {
      id: this.generateMessageId(),
      type: 'command',
      timestamp: Date.now(),
      data: command
    };

    return new Promise((resolve, reject) => {
      // Timeout para la respuesta
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(message.id);
        reject(new Error('Command timeout'));
      }, 10000);

      // Registrar handler para la respuesta
      this.responseHandlers.set(message.id, (response) => {
        clearTimeout(timeout);
        this.responseHandlers.delete(message.id);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Command failed'));
        }
      });

      this.sendMessage(message);
    });
  }

  /// Manejar error
  private handleError(error: string, context?: any): void {
    this.updateState({
      stats: {
        ...this.state.stats,
        errors: this.state.stats.errors + 1
      }
    });

    this.emit('error', error, context);
    console.error('❌ EngineBridge Error:', error, context);
  }

  /// Actualizar estado
  private updateState(updates: Partial<AdvancedEngineBridgeState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  /// Generar ID de mensaje
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /// Desconectar
  disconnect(): void {
    // Limpiar timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Cerrar conexiones
    this.connections.forEach(connection => {
      if (connection.readyState === WebSocket.OPEN) {
        connection.close();
      }
    });
    this.connections.clear();

    this.updateState({
      connection: {
        ...this.state.connection,
        connected: false,
        state: 'disconnected'
      },
      resources: {
        ...this.state.resources,
        connections: 0
      }
    });

    this.emit('disconnected');
    console.log('🔌 Desconectado del motor 3D (Advanced Bridge)');
  }

  /// Obtener estado
  getState(): AdvancedEngineBridgeState {
    return { ...this.state };
  }

  /// Verificar si está conectado
  isConnected(): boolean {
    return this.state.connection.connected;
  }

  /// Obtener latencia
  getLatency(): number {
    return this.state.connection.latency;
  }

  /// Obtener estadísticas
  getStats() {
    return { ...this.state.stats };
  }

  /// Obtener métricas de rendimiento
  getPerformanceMetrics() {
    return { ...this.state.engines.performance };
  }

  /// Obtener salud del motor
  getEngineHealth(): string {
    return this.state.engines.health;
  }
}

/// Comandos avanzados del motor
export class AdvancedEngineCommands {
  constructor(private bridge: AdvancedEngineBridge) {}

  /// Crear entidad con componentes avanzados
  async createEntity(components: any[] = [], metadata?: any): Promise<any> {
    return this.bridge.sendCommand({
      type: 'create_entity',
      data: { components, metadata }
    });
  }

  /// Eliminar entidad con limpieza
  async deleteEntity(entityId: string, cleanup: boolean = true): Promise<void> {
    return this.bridge.sendCommand({
      type: 'delete_entity',
      data: { entityId, cleanup }
    });
  }

  /// Añadir componente con validación
  async addComponent(entityId: string, componentType: string, componentData: any, validate: boolean = true): Promise<void> {
    return this.bridge.sendCommand({
      type: 'add_component',
      data: { entityId, componentType, componentData, validate }
    });
  }

  /// Remover componente con limpieza
  async removeComponent(entityId: string, componentType: string, cleanup: boolean = true): Promise<void> {
    return this.bridge.sendCommand({
      type: 'remove_component',
      data: { entityId, componentType, cleanup }
    });
  }

  /// Actualizar componente con optimización
  async updateComponent(entityId: string, componentType: string, componentData: any, optimize: boolean = true): Promise<void> {
    return this.bridge.sendCommand({
      type: 'update_component',
      data: { entityId, componentType, componentData, optimize }
    });
  }

  /// Cargar modelo con optimización
  async loadModel(path: string, optimize: boolean = true, cache: boolean = true): Promise<any> {
    return this.bridge.sendCommand({
      type: 'load_model',
      data: { path, optimize, cache }
    });
  }

  /// Crear material con shaders personalizados
  async createMaterial(materialData: any, shaders?: any): Promise<any> {
    return this.bridge.sendCommand({
      type: 'create_material',
      data: { materialData, shaders }
    });
  }

  /// Crear luz con configuración avanzada
  async createLight(lightData: any, shadows: boolean = true): Promise<any> {
    return this.bridge.sendCommand({
      type: 'create_light',
      data: { lightData, shadows }
    });
  }

  /// Crear cámara con configuración avanzada
  async createCamera(cameraData: any, controls?: any): Promise<any> {
    return this.bridge.sendCommand({
      type: 'create_camera',
      data: { cameraData, controls }
    });
  }

  /// Cargar escena con progreso
  async loadScene(sceneData: any, onProgress?: (progress: number) => void): Promise<void> {
    return this.bridge.sendCommand({
      type: 'load_scene',
      data: { sceneData, onProgress }
    });
  }

  /// Guardar escena con compresión
  async saveScene(sceneData: any, compress: boolean = true): Promise<void> {
    return this.bridge.sendCommand({
      type: 'save_scene',
      data: { sceneData, compress }
    });
  }

  /// Obtener estadísticas del motor
  async getEngineStats(): Promise<any> {
    return this.bridge.sendCommand({
      type: 'get_engine_stats',
      data: {}
    });
  }

  /// Ejecutar script WASM con contexto
  async executeWasmScript(scriptData: any, context?: any): Promise<any> {
    return this.bridge.sendCommand({
      type: 'execute_wasm_script',
      data: { scriptData, context }
    });
  }

  /// Enviar transacción blockchain con confirmación
  async sendBlockchainTransaction(transactionData: any, confirm: boolean = true): Promise<any> {
    return this.bridge.sendCommand({
      type: 'send_blockchain_transaction',
      data: { transactionData, confirm }
    });
  }

  /// Cambiar motor en tiempo real
  async switchEngine(engineType: string): Promise<void> {
    return this.bridge.sendCommand({
      type: 'switch_engine',
      data: { engineType }
    });
  }

  /// Optimizar escena
  async optimizeScene(optimizationLevel: 'low' | 'medium' | 'high'): Promise<void> {
    return this.bridge.sendCommand({
      type: 'optimize_scene',
      data: { optimizationLevel }
    });
  }

  /// Exportar escena
  async exportScene(format: 'gltf' | 'fbx' | 'obj' | 'blend', options?: any): Promise<any> {
    return this.bridge.sendCommand({
      type: 'export_scene',
      data: { format, options }
    });
  }

  /// Importar assets
  async importAssets(assets: any[], onProgress?: (progress: number) => void): Promise<any> {
    return this.bridge.sendCommand({
      type: 'import_assets',
      data: { assets, onProgress }
    });
  }

  /// Configurar renderizado
  async configureRendering(config: any): Promise<void> {
    return this.bridge.sendCommand({
      type: 'configure_rendering',
      data: { config }
    });
  }

  /// Ejecutar animación
  async executeAnimation(animationData: any, loop: boolean = false): Promise<void> {
    return this.bridge.sendCommand({
      type: 'execute_animation',
      data: { animationData, loop }
    });
  }

  /// Aplicar física
  async applyPhysics(entityId: string, physicsData: any): Promise<void> {
    return this.bridge.sendCommand({
      type: 'apply_physics',
      data: { entityId, physicsData }
    });
  }

  /// Configurar audio
  async configureAudio(audioConfig: any): Promise<void> {
    return this.bridge.sendCommand({
      type: 'configure_audio',
      data: { audioConfig }
    });
  }

  /// Ejecutar script personalizado
  async executeCustomScript(script: string, context?: any): Promise<any> {
    return this.bridge.sendCommand({
      type: 'execute_custom_script',
      data: { script, context }
    });
  }
}

/// Configuración por defecto
export const DEFAULT_ADVANCED_CONFIG: AdvancedEngineBridgeConfig = {
  connection: {
    motorUrl: 'localhost',
    motorPort: 8080,
    protocol: 'ws',
    connectionTimeout: 10000,
    maxRetries: 5,
    retryDelay: 1000,
    keepAlive: true,
    keepAliveInterval: 30000
  },
  engines: {
    primary: 'threejs',
    fallback: 'babylon',
    autoSwitch: true,
    performanceThreshold: 30
  },
  resources: {
    maxConnections: 10,
    connectionPool: true,
    resourceTimeout: 30000,
    memoryLimit: 512, // MB
    cpuLimit: 80 // %
  },
  sync: {
    enabled: true,
    interval: 1000,
    autoSync: true,
    conflictResolution: 'last-write-wins',
    batchSize: 100
  },
  security: {
    authentication: false,
    encryption: false,
    sslVerify: true,
    allowedOrigins: ['*']
  }
};

/// Factory para crear puente avanzado
export class AdvancedEngineBridgeFactory {
  static create(config?: Partial<AdvancedEngineBridgeConfig>): AdvancedEngineBridge {
    const fullConfig = { ...DEFAULT_ADVANCED_CONFIG, ...config };
    return new AdvancedEngineBridge(fullConfig);
  }

  static createWithCommands(config?: Partial<AdvancedEngineBridgeConfig>): {
    bridge: AdvancedEngineBridge;
    commands: AdvancedEngineCommands;
  } {
    const bridge = this.create(config);
    const commands = new AdvancedEngineCommands(bridge);
    return { bridge, commands };
  }
}
