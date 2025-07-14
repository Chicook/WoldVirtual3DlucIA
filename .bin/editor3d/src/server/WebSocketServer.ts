/**
 * WebSocketServer.ts - Servidor WebSocket para el Motor 3D
 * Maneja las conexiones y mensajes del editor 3D
 * 
 * Líneas: 1-250 (Primera instancia)
 */

import { WebSocketServer as WS, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { EngineState, EngineMessage } from '../core/engine/EngineCore';

// Tipos para el servidor
interface Client {
  id: string;
  ws: WebSocket;
  connectedAt: Date;
  lastPing: Date;
  isAlive: boolean;
  metadata: {
    userAgent: string;
    ip: string;
    userId?: string;
  };
}

interface ServerConfig {
  port: number;
  host: string;
  maxClients: number;
  pingInterval: number;
  pingTimeout: number;
  heartbeatInterval: number;
}

interface ServerStats {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  uptime: number;
  startTime: Date;
}

export class Editor3DWebSocketServer extends EventEmitter {
  private wss: WS;
  private clients: Map<string, Client> = new Map();
  private config: ServerConfig;
  private stats: ServerStats;
  private pingInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(config: Partial<ServerConfig> = {}) {
    super();
    
    this.config = {
      port: 8080,
      host: 'localhost',
      maxClients: 100,
      pingInterval: 30000, // 30 segundos
      pingTimeout: 10000,  // 10 segundos
      heartbeatInterval: 5000, // 5 segundos
      ...config
    };

    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      uptime: 0,
      startTime: new Date()
    };

    this.wss = new WS({
      port: this.config.port,
      host: this.config.host,
      clientTracking: true,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Manejar nuevas conexiones
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      this.handleConnection(ws, request);
    });

    // Manejar errores del servidor
    this.wss.on('error', (error: Error) => {
      console.error('[WebSocket Server] Error:', error);
      this.emit('error', error);
    });

    // Manejar cierre del servidor
    this.wss.on('close', () => {
      console.log('[WebSocket Server] Servidor cerrado');
      this.emit('close');
    });

    // Manejar listening
    this.wss.on('listening', () => {
      console.log(`[WebSocket Server] Escuchando en ws://${this.config.host}:${this.config.port}`);
      this.emit('listening');
    });
  }

  private handleConnection(ws: WebSocket, request: any): void {
    // Verificar límite de clientes
    if (this.clients.size >= this.config.maxClients) {
      ws.close(1013, 'Servidor lleno');
      return;
    }

    const clientId = this.generateClientId();
    const clientIp = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || 'Unknown';

    const client: Client = {
      id: clientId,
      ws,
      connectedAt: new Date(),
      lastPing: new Date(),
      isAlive: true,
      metadata: {
        userAgent,
        ip: clientIp
      }
    };

    this.clients.set(clientId, client);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    console.log(`[WebSocket Server] Cliente conectado: ${clientId} desde ${clientIp}`);

    // Enviar mensaje de bienvenida
    this.sendToClient(clientId, {
      type: 'welcome',
      timestamp: Date.now(),
      data: {
        clientId,
        serverTime: new Date().toISOString(),
        config: {
          pingInterval: this.config.pingInterval,
          heartbeatInterval: this.config.heartbeatInterval
        }
      }
    });

    // Configurar handlers del cliente
    ws.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(clientId, code, reason.toString());
    });

    ws.on('error', (error: Error) => {
      console.error(`[WebSocket Server] Error en cliente ${clientId}:`, error);
      this.handleDisconnection(clientId, 1011, 'Error interno');
    });

    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.lastPing = new Date();
        client.isAlive = true;
      }
    });

    // Emitir evento de nueva conexión
    this.emit('clientConnected', client);
  }

  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString()) as EngineMessage;
      this.stats.totalMessages++;

      console.log(`[WebSocket Server] Mensaje de ${clientId}:`, message.type);

      // Procesar mensaje según tipo
      switch (message.type) {
        case 'ping':
          this.handlePing(clientId, message);
          break;
        
        case 'pong':
          this.handlePong(clientId, message);
          break;
        
        case 'engine_command':
          this.handleEngineCommand(clientId, message);
          break;
        
        case 'scene_update':
          this.handleSceneUpdate(clientId, message);
          break;
        
        case 'object_operation':
          this.handleObjectOperation(clientId, message);
          break;
        
        case 'asset_request':
          this.handleAssetRequest(clientId, message);
          break;
        
        case 'performance_update':
          this.handlePerformanceUpdate(clientId, message);
          break;
        
        case 'error_report':
          this.handleErrorReport(clientId, message);
          break;
        
        default:
          console.warn(`[WebSocket Server] Tipo de mensaje desconocido: ${message.type}`);
          this.sendToClient(clientId, {
            type: 'error',
            data: {
              message: `Tipo de mensaje no soportado: ${message.type}`,
              timestamp: new Date().toISOString()
            }
          });
      }

      // Emitir evento de mensaje recibido
      this.emit('messageReceived', clientId, message);
    } catch (error) {
      console.error(`[WebSocket Server] Error procesando mensaje de ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        data: {
          message: 'Error procesando mensaje',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  private handlePing(clientId: string, message: EngineMessage): void {
    this.sendToClient(clientId, {
      type: 'pong',
      data: {
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      }
    });
  }

  private handlePong(clientId: string, message: EngineMessage): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date();
      client.isAlive = true;
    }
  }

  private handleEngineCommand(clientId: string, message: EngineMessage): void {
    // Procesar comandos del motor
    const { command, params } = message.data;
    
    console.log(`[WebSocket Server] Comando del motor: ${command}`, params);

    // Ejecutar comando y enviar respuesta
    this.sendToClient(clientId, {
      type: 'engine_response',
      data: {
        command,
        success: true,
        result: { message: 'Comando ejecutado correctamente' },
        timestamp: new Date().toISOString()
      }
    });

    // Broadcast a otros clientes si es necesario
    this.broadcastToOthers(clientId, {
      type: 'engine_command_broadcast',
      data: {
        clientId,
        command,
        params,
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleSceneUpdate(clientId: string, message: EngineMessage): void {
    // Procesar actualizaciones de escena
    const { sceneId, updates } = message.data;
    
    console.log(`[WebSocket Server] Actualización de escena: ${sceneId}`);

    // Broadcast a otros clientes
    this.broadcastToOthers(clientId, {
      type: 'scene_update_broadcast',
      data: {
        clientId,
        sceneId,
        updates,
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleObjectOperation(clientId: string, message: EngineMessage): void {
    // Procesar operaciones de objetos
    const { operation, objectId, sceneId, data } = message.data;
    
    console.log(`[WebSocket Server] Operación de objeto: ${operation} en ${objectId}`);

    // Broadcast a otros clientes
    this.broadcastToOthers(clientId, {
      type: 'object_operation_broadcast',
      data: {
        clientId,
        operation,
        objectId,
        sceneId,
        data,
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleAssetRequest(clientId: string, message: EngineMessage): void {
    // Procesar solicitudes de assets
    const { assetId, assetType } = message.data;
    
    console.log(`[WebSocket Server] Solicitud de asset: ${assetId} (${assetType})`);

    // Simular respuesta de asset (en implementación real, cargaría desde sistema de archivos)
    this.sendToClient(clientId, {
      type: 'asset_response',
      data: {
        assetId,
        assetType,
        success: true,
        data: { url: `/assets/${assetId}`, metadata: {} },
        timestamp: new Date().toISOString()
      }
    });
  }

  private handlePerformanceUpdate(clientId: string, message: EngineMessage): void {
    // Procesar actualizaciones de rendimiento
    const { fps, memory, cpu } = message.data;
    
    // Log performance (en implementación real, almacenaría métricas)
    console.log(`[WebSocket Server] Performance de ${clientId}: ${fps} FPS, ${memory}MB, ${cpu}%`);
  }

  private handleErrorReport(clientId: string, message: EngineMessage): void {
    // Procesar reportes de error
    const { error, stack, context } = message.data;
    
    console.error(`[WebSocket Server] Error reportado por ${clientId}:`, error, stack, context);
    
    // En implementación real, enviaría a sistema de logging
    this.emit('clientError', clientId, { error, stack, context });
  }

  private handleDisconnection(clientId: string, code: number, reason: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      this.stats.activeConnections--;

      console.log(`[WebSocket Server] Cliente desconectado: ${clientId} (${code}: ${reason})`);
      
      // Emitir evento de desconexión
      this.emit('clientDisconnected', clientId, code, reason);
    }
  }

  // Métodos públicos
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        resolve();
        return;
      }

      this.wss.once('listening', () => {
        this.isRunning = true;
        this.startHeartbeat();
        resolve();
      });

      this.wss.once('error', reject);
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isRunning) {
        resolve();
        return;
      }

      this.isRunning = false;
      this.stopHeartbeat();

      // Cerrar todas las conexiones
      this.clients.forEach((client) => {
        client.ws.close(1000, 'Servidor cerrando');
      });

      this.wss.close(() => {
        resolve();
      });
    });
  }

  public sendToClient(clientId: string, message: EngineMessage): boolean {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`[WebSocket Server] Error enviando mensaje a ${clientId}:`, error);
        return false;
      }
    }
    return false;
  }

  public broadcast(message: EngineMessage): number {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (this.sendToClient(client.id, message)) {
        sentCount++;
      }
    });
    return sentCount;
  }

  public broadcastToOthers(excludeClientId: string, message: EngineMessage): number {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.id !== excludeClientId) {
        if (this.sendToClient(client.id, message)) {
          sentCount++;
        }
      }
    });
    return sentCount;
  }

  public getStats(): ServerStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime.getTime()
    };
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public updateConfig(newConfig: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Métodos privados de utilidad
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(request: any): string {
    return request.headers['x-forwarded-for'] || 
           request.connection.remoteAddress || 
           request.socket.remoteAddress || 
           'unknown';
  }

  private startHeartbeat(): void {
    // Ping a clientes para verificar conexión
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.ping();
          } catch (error) {
            console.error(`[WebSocket Server] Error en ping a ${client.id}:`, error);
          }
        }
      });
    }, this.config.pingInterval);

    // Verificar clientes muertos
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      this.clients.forEach((client) => {
        if (now.getTime() - client.lastPing.getTime() > this.config.pingTimeout) {
          console.log(`[WebSocket Server] Cliente ${client.id} marcado como muerto`);
          client.isAlive = false;
          client.ws.terminate();
        }
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Instancia singleton del servidor
export const editor3DServer = new Editor3DWebSocketServer();

export default Editor3DWebSocketServer; 