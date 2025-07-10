//! EngineBridge.3.ts - Puente de Motor Avanzado - Tercera Instancia
//! 
//! Esta es la tercera instancia del EngineBridge que corrige errores de linter
//! y añade funcionalidades avanzadas de colaboración multiusuario y plugins.
//! Continuación desde EngineBridge.2.ts línea 300.

import { EventEmitter } from 'events';
import { EngineMessage, EngineResponse, EngineCommand } from '../types/engine';

/// Tipos extendidos para mensajes
export interface ExtendedEngineMessage extends EngineMessage {
  type: 'command' | 'response' | 'event' | 'heartbeat' | 'ping' | 'pong' | 'sync' | 'collaboration';
  userId?: string;
  sessionId?: string;
  timestamp: number;
  data: any;
}

/// Configuración de colaboración
export interface CollaborationConfig {
  enabled: boolean;
  maxUsers: number;
  syncInterval: number;
  conflictResolution: 'last-write-wins' | 'merge' | 'manual' | 'timestamp';
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

/// Configuración de plugins
export interface PluginConfig {
  enabled: boolean;
  autoLoad: boolean;
  sandboxed: boolean;
  maxMemory: number;
  allowedAPIs: string[];
}

/// Estado de colaboración
export interface CollaborationState {
  activeUsers: Map<string, {
    userId: string;
    username: string;
    lastActivity: number;
    permissions: string[];
    cursor?: { x: number; y: number; z: number };
  }>;
  sessions: Map<string, {
    sessionId: string;
    users: string[];
    sceneData: any;
    lastSync: number;
  }>;
  conflicts: Array<{
    id: string;
    entityId: string;
    user1: string;
    user2: string;
    data1: any;
    data2: any;
    timestamp: number;
  }>;
}

/// Estado de plugins
export interface PluginState {
  loaded: Map<string, {
    name: string;
    version: string;
    enabled: boolean;
    memory: number;
    lastActivity: number;
  }>;
  available: string[];
  errors: Array<{
    pluginId: string;
    error: string;
    timestamp: number;
  }>;
}

/// Configuración extendida del puente
export interface ExtendedEngineBridgeConfig {
  /// Configuración base
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
  
  /// Configuración de motores
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
  
  /// Configuración de colaboración
  collaboration: CollaborationConfig;
  
  /// Configuración de plugins
  plugins: PluginConfig;
}

/// Estado extendido del puente
export interface ExtendedEngineBridgeState {
  /// Estado base
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
  
  /// Estado de colaboración
  collaboration: CollaborationState;
  
  /// Estado de plugins
  plugins: PluginState;
  
  /// Estadísticas
  stats: {
    messagesSent: number;
    messagesReceived: number;
    errors: number;
    reconnections: number;
    engineSwitches: number;
    performanceDrops: number;
    collaborationEvents: number;
    pluginExecutions: number;
  };
}

/// Eventos extendidos del puente
export interface ExtendedEngineBridgeEvents {
  /// Eventos base
  connected: () => void;
  disconnected: () => void;
  reconnecting: (attempt: number) => void;
  connectionFailed: (error: string) => void;
  engineSwitched: (from: string, to: string, reason: string) => void;
  performanceUpdate: (metrics: any) => void;
  resourceWarning: (resource: string, usage: number) => void;
  message: (message: ExtendedEngineMessage) => void;
  messageSent: (message: ExtendedEngineMessage) => void;
  messageReceived: (message: ExtendedEngineMessage) => void;
  stateChanged: (state: ExtendedEngineBridgeState) => void;
  error: (error: string, context?: any) => void;
  
  /// Eventos de colaboración
  userJoined: (userId: string, userData: any) => void;
  userLeft: (userId: string) => void;
  userActivity: (userId: string, activity: any) => void;
  collaborationConflict: (conflict: any) => void;
  sceneSynced: (sessionId: string, data: any) => void;
  
  /// Eventos de plugins
  pluginLoaded: (pluginId: string, pluginData: any) => void;
  pluginUnloaded: (pluginId: string) => void;
  pluginError: (pluginId: string, error: string) => void;
  pluginExecuted: (pluginId: string, result: any) => void;
}

/// Puente de motor extendido
export class ExtendedEngineBridge extends EventEmitter {
  /// Configuración
  private config: ExtendedEngineBridgeConfig;
  
  /// Estado
  private state: ExtendedEngineBridgeState;
  
  /// Conexiones WebSocket
  private connections: Map<string, WebSocket> = new Map();
  
  /// Timers
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  /// Cola de mensajes
  private messageQueue: ExtendedEngineMessage[] = [];
  
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

  /// Gestor de colaboración
  private collaborationManager: CollaborationManager;
  
  /// Gestor de plugins
  private pluginManager: PluginManager;

  constructor(config: ExtendedEngineBridgeConfig) {
    super();
    this.config = config;
    this.state = this.initializeState();
    this.collaborationManager = new CollaborationManager(this);
    this.pluginManager = new PluginManager(this);
    this.setupEventHandlers();
  }

  /// Inicializar estado
  private initializeState(): ExtendedEngineBridgeState {
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
      collaboration: {
        activeUsers: new Map(),
        sessions: new Map(),
        conflicts: []
      },
      plugins: {
        loaded: new Map(),
        available: [],
        errors: []
      },
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
        reconnections: 0,
        engineSwitches: 0,
        performanceDrops: 0,
        collaborationEvents: 0,
        pluginExecutions: 0
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

  /// Conectar al motor con manejo mejorado
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
        
        // Inicializar colaboración si está habilitada
        if (this.config.collaboration.enabled) {
          this.collaborationManager.initialize();
        }
        
        // Inicializar plugins si están habilitados
        if (this.config.plugins.enabled) {
          this.pluginManager.initialize();
        }
        
        console.log('✅ Conectado al motor 3D (Extended Bridge)');
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
        }, this.config.connection.connectionTimeout);

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

    // Verificar memoria disponible
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

    // Monitoreo de colaboración
    if (this.config.collaboration.enabled) {
      this.startCollaborationMonitoring();
    }

    // Monitoreo de plugins
    if (this.config.plugins.enabled) {
      this.startPluginMonitoring();
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

  /// Monitoreo de colaboración
  private startCollaborationMonitoring(): void {
    const timer = setInterval(() => {
      this.collaborationManager.update();
    }, this.config.collaboration.syncInterval);

    this.timers.set('collaboration', timer);
  }

  /// Monitoreo de plugins
  private startPluginMonitoring(): void {
    const timer = setInterval(() => {
      this.pluginManager.update();
    }, 10000);

    this.timers.set('plugins', timer);
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
    const message: ExtendedEngineMessage = {
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
      const message: ExtendedEngineMessage = JSON.parse(data);
      
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

      // Manejar mensajes de colaboración
      if (message.type === 'collaboration') {
        this.collaborationManager.handleMessage(message);
        this.updateState({
          stats: {
            ...this.state.stats,
            collaborationEvents: this.state.stats.collaborationEvents + 1
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
  sendMessage(message: ExtendedEngineMessage): void {
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
    const message: ExtendedEngineMessage = {
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
    console.error('❌ ExtendedEngineBridge Error:', error, context);
  }

  /// Actualizar estado
  private updateState(updates: Partial<ExtendedEngineBridgeState>): void {
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

    // Limpiar colaboración
    if (this.config.collaboration.enabled) {
      this.collaborationManager.cleanup();
    }

    // Limpiar plugins
    if (this.config.plugins.enabled) {
      this.pluginManager.cleanup();
    }

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
    console.log('🔌 Desconectado del motor 3D (Extended Bridge)');
  }

  /// Obtener estado
  getState(): ExtendedEngineBridgeState {
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

  /// Obtener gestor de colaboración
  getCollaborationManager(): CollaborationManager {
    return this.collaborationManager;
  }

  /// Obtener gestor de plugins
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }
}

/// Gestor de colaboración
class CollaborationManager {
  private bridge: ExtendedEngineBridge;
  private config: CollaborationConfig;

  constructor(bridge: ExtendedEngineBridge) {
    this.bridge = bridge;
    this.config = bridge.getState().collaboration as any;
  }

  initialize(): void {
    console.log('🤝 Inicializando gestor de colaboración');
  }

  update(): void {
    // Actualizar estado de usuarios
    const now = Date.now();
    const timeout = 30000; // 30 segundos

    this.bridge.getState().collaboration.activeUsers.forEach((user, userId) => {
      if (now - user.lastActivity > timeout) {
        this.removeUser(userId);
      }
    });
  }

  handleMessage(message: ExtendedEngineMessage): void {
    switch (message.data.type) {
      case 'user_joined':
        this.addUser(message.data.userId, message.data.userData);
        break;
      case 'user_left':
        this.removeUser(message.data.userId);
        break;
      case 'user_activity':
        this.updateUserActivity(message.data.userId, message.data.activity);
        break;
      case 'scene_sync':
        this.syncScene(message.data.sessionId, message.data.sceneData);
        break;
      case 'conflict_detected':
        this.handleConflict(message.data.conflict);
        break;
    }
  }

  addUser(userId: string, userData: any): void {
    const state = this.bridge.getState();
    state.collaboration.activeUsers.set(userId, {
      userId,
      username: userData.username || 'Anonymous',
      lastActivity: Date.now(),
      permissions: userData.permissions || ['read'],
      cursor: userData.cursor
    });

    this.bridge.emit('userJoined', userId, userData);
  }

  removeUser(userId: string): void {
    const state = this.bridge.getState();
    state.collaboration.activeUsers.delete(userId);
    this.bridge.emit('userLeft', userId);
  }

  updateUserActivity(userId: string, activity: any): void {
    const state = this.bridge.getState();
    const user = state.collaboration.activeUsers.get(userId);
    if (user) {
      user.lastActivity = Date.now();
      user.cursor = activity.cursor;
      this.bridge.emit('userActivity', userId, activity);
    }
  }

  syncScene(sessionId: string, sceneData: any): void {
    const state = this.bridge.getState();
    const session = state.collaboration.sessions.get(sessionId);
    if (session) {
      session.sceneData = sceneData;
      session.lastSync = Date.now();
      this.bridge.emit('sceneSynced', sessionId, sceneData);
    }
  }

  handleConflict(conflict: any): void {
    const state = this.bridge.getState();
    state.collaboration.conflicts.push({
      id: conflict.id,
      entityId: conflict.entityId,
      user1: conflict.user1,
      user2: conflict.user2,
      data1: conflict.data1,
      data2: conflict.data2,
      timestamp: Date.now()
    });

    this.bridge.emit('collaborationConflict', conflict);
  }

  cleanup(): void {
    console.log('🧹 Limpiando gestor de colaboración');
  }
}

/// Gestor de plugins
class PluginManager {
  private bridge: ExtendedEngineBridge;
  private config: PluginConfig;

  constructor(bridge: ExtendedEngineBridge) {
    this.bridge = bridge;
    this.config = bridge.getState().plugins as any;
  }

  initialize(): void {
    console.log('🔌 Inicializando gestor de plugins');
  }

  update(): void {
    // Verificar plugins activos
    const state = this.bridge.getState();
    state.plugins.loaded.forEach((plugin, pluginId) => {
      if (Date.now() - plugin.lastActivity > 60000) { // 1 minuto
        this.unloadPlugin(pluginId);
      }
    });
  }

  loadPlugin(pluginId: string, pluginData: any): void {
    const state = this.bridge.getState();
    state.plugins.loaded.set(pluginId, {
      name: pluginData.name,
      version: pluginData.version,
      enabled: true,
      memory: 0,
      lastActivity: Date.now()
    });

    this.bridge.emit('pluginLoaded', pluginId, pluginData);
  }

  unloadPlugin(pluginId: string): void {
    const state = this.bridge.getState();
    state.plugins.loaded.delete(pluginId);
    this.bridge.emit('pluginUnloaded', pluginId);
  }

  executePlugin(pluginId: string, data: any): any {
    const state = this.bridge.getState();
    const plugin = state.plugins.loaded.get(pluginId);
    
    if (plugin && plugin.enabled) {
      try {
        // Simular ejecución de plugin
        const result = { success: true, data: `Plugin ${pluginId} executed` };
        plugin.lastActivity = Date.now();
        
        this.bridge.updateState({
          stats: {
            ...state.stats,
            pluginExecutions: state.stats.pluginExecutions + 1
          }
        });

        this.bridge.emit('pluginExecuted', pluginId, result);
        return result;
      } catch (error) {
        this.handlePluginError(pluginId, error as string);
        return { success: false, error };
      }
    }
    
    return { success: false, error: 'Plugin not found or disabled' };
  }

  handlePluginError(pluginId: string, error: string): void {
    const state = this.bridge.getState();
    state.plugins.errors.push({
      pluginId,
      error,
      timestamp: Date.now()
    });

    this.bridge.emit('pluginError', pluginId, error);
  }

  cleanup(): void {
    console.log('🧹 Limpiando gestor de plugins');
  }
}

/// Configuración por defecto extendida
export const DEFAULT_EXTENDED_CONFIG: ExtendedEngineBridgeConfig = {
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
  },
  collaboration: {
    enabled: true,
    maxUsers: 10,
    syncInterval: 5000,
    conflictResolution: 'timestamp',
    permissions: {
      read: true,
      write: true,
      admin: false
    }
  },
  plugins: {
    enabled: true,
    autoLoad: false,
    sandboxed: true,
    maxMemory: 100, // MB
    allowedAPIs: ['scene', 'entities', 'materials']
  }
};

/// Factory para crear puente extendido
export class ExtendedEngineBridgeFactory {
  static create(config?: Partial<ExtendedEngineBridgeConfig>): ExtendedEngineBridge {
    const fullConfig = { ...DEFAULT_EXTENDED_CONFIG, ...config };
    return new ExtendedEngineBridge(fullConfig);
  }

  static createWithCollaboration(config?: Partial<ExtendedEngineBridgeConfig>): {
    bridge: ExtendedEngineBridge;
    collaboration: CollaborationManager;
  } {
    const bridge = this.create(config);
    const collaboration = bridge.getCollaborationManager();
    return { bridge, collaboration };
  }

  static createWithPlugins(config?: Partial<ExtendedEngineBridgeConfig>): {
    bridge: ExtendedEngineBridge;
    plugins: PluginManager;
  } {
    const bridge = this.create(config);
    const plugins = bridge.getPluginManager();
    return { bridge, plugins };
  }
} 