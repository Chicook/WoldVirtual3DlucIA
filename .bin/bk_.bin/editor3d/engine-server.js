#!/usr/bin/env node

/**
 * Servidor WebSocket del Motor 3D (Versión JavaScript)
 * Maneja las conexiones del EngineBridge y procesa comandos del motor
 */

const { WebSocketServer } = require('ws');
const { EventEmitter } = require('events');

class EngineServer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      port: config.port || 8181,
      host: config.host || 'localhost',
      maxConnections: config.maxConnections || 100,
      heartbeatInterval: config.heartbeatInterval || 30000,
      commandTimeout: config.commandTimeout || 5000
    };

    this.state = {
      connected: false,
      clients: new Map(),
      entities: new Map(),
      currentScene: null,
      stats: {
        performance: {
          fps: 60,
          frameTime: 16.67,
          cpuUsage: 0,
          memoryUsage: 0,
          gpuUsage: 0,
          drawCalls: 0,
          triangles: 0,
          vertices: 0
        },
        entities: 0,
        components: 0,
        systems: 0,
        memory: {
          total: 0,
          used: 0,
          free: 0,
          allocated: 0
        },
        network: {
          connectedPeers: 0,
          messagesSent: 0,
          messagesReceived: 0,
          latency: 0,
          bandwidth: 0
        }
      }
    };

    this.wss = null;
    this.heartbeatTimer = null;
    this.statsTimer = null;
  }

  async start() {
    try {
      this.wss = new WebSocketServer({
        port: this.config.port,
        host: this.config.host
      });

      this.wss.on('connection', (ws) => {
        this.handleClientConnection(ws);
      });

      this.wss.on('error', (error) => {
        this.emit('error', `Error del servidor WebSocket: ${error.message}`);
      });

      this.state.connected = true;
      this.startHeartbeat();
      this.startStatsUpdate();

      console.log(`🚀 Servidor del motor 3D iniciado en ws://${this.config.host}:${this.config.port}`);
      this.emit('started');

    } catch (error) {
      this.emit('error', `Error iniciando servidor: ${error}`);
      throw error;
    }
  }

  async stop() {
    this.state.connected = false;
    this.stopHeartbeat();
    this.stopStatsUpdate();

    // Cerrar todas las conexiones
    for (const [, ws] of this.state.clients) {
      ws.close();
    }
    this.state.clients.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    console.log('🛑 Servidor del motor 3D detenido');
    this.emit('stopped');
  }

  handleClientConnection(ws) {
    const clientId = this.generateClientId();
    
    console.log(`🔌 Cliente conectado: ${clientId}`);
    
    this.state.clients.set(clientId, ws);
    this.emit('clientConnected', clientId);

    // Configurar eventos del WebSocket
    ws.on('message', (data) => {
      this.handleClientMessage(clientId, data);
    });

    ws.on('close', () => {
      this.handleClientDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`❌ Error en cliente ${clientId}:`, error);
      this.handleClientDisconnection(clientId);
    });

    // Enviar mensaje de bienvenida
    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'response',
      timestamp: Date.now(),
      data: {
        success: true,
        message: 'Conectado al motor 3D',
        clientId,
        engineInfo: {
          version: '1.0.0',
          capabilities: ['3d_rendering', 'entity_system', 'physics', 'audio', 'networking']
        }
      }
    });
  }

  handleClientDisconnection(clientId) {
    console.log(`🔌 Cliente desconectado: ${clientId}`);
    
    this.state.clients.delete(clientId);
    this.emit('clientDisconnected', clientId);
  }

  handleClientMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());
      
      console.log(`📨 Mensaje de ${clientId}:`, message.type);

      switch (message.type) {
        case 'command':
          this.handleCommand(clientId, message.data);
          break;
          
        case 'heartbeat':
          this.handleHeartbeat(clientId);
          break;
          
        default:
          console.warn(`⚠️ Tipo de mensaje desconocido: ${message.type}`);
      }

    } catch (error) {
      console.error(`❌ Error procesando mensaje de ${clientId}:`, error);
      this.sendErrorToClient(clientId, 'Error procesando mensaje');
    }
  }

  async handleCommand(clientId, command) {
    try {
      console.log(`⚡ Comando de ${clientId}:`, command.type);
      
      this.emit('commandReceived', clientId, command);

      let response;

      switch (command.type) {
        case 'create_entity':
          response = await this.createEntity(command.data);
          break;
          
        case 'delete_entity':
          response = await this.deleteEntity(command.data.entityId);
          break;
          
        case 'add_component':
          response = await this.addComponent(command.data);
          break;
          
        case 'remove_component':
          response = await this.removeComponent(command.data);
          break;
          
        case 'update_component':
          response = await this.updateComponent(command.data);
          break;
          
        case 'load_model':
          response = await this.loadModel(command.data.path);
          break;
          
        case 'create_material':
          response = await this.createMaterial(command.data);
          break;
          
        case 'create_light':
          response = await this.createLight(command.data);
          break;
          
        case 'create_camera':
          response = await this.createCamera(command.data);
          break;
          
        case 'load_scene':
          response = await this.loadScene(command.data);
          break;
          
        case 'save_scene':
          response = await this.saveScene();
          break;
          
        case 'get_state':
          response = await this.getState();
          break;
          
        case 'get_stats':
          response = await this.getStats();
          break;
          
        default:
          response = {
            success: false,
            error: `Comando desconocido: ${command.type}`,
            errorCode: 400
          };
      }

      // Enviar respuesta al cliente
      this.sendToClient(clientId, {
        id: this.generateMessageId(),
        type: 'response',
        timestamp: Date.now(),
        data: response
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.sendErrorToClient(clientId, `Error ejecutando comando: ${errorMessage}`);
    }
  }

  handleHeartbeat(clientId) {
    // Responder con heartbeat
    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'heartbeat',
      timestamp: Date.now(),
      data: { pong: true }
    });
  }

  sendToClient(clientId, message) {
    const ws = this.state.clients.get(clientId);
    if (ws && ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  }

  sendErrorToClient(clientId, error) {
    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'response',
      timestamp: Date.now(),
      data: {
        success: false,
        error,
        errorCode: 500
      }
    });
  }

  broadcast(message) {
    for (const [, ws] of this.state.clients) {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(message));
      }
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.broadcast({
        id: this.generateMessageId(),
        type: 'heartbeat',
        timestamp: Date.now(),
        data: { ping: true }
      });
    }, this.config.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  startStatsUpdate() {
    this.statsTimer = setInterval(() => {
      this.updateStats();
    }, 1000);
  }

  stopStatsUpdate() {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
  }

  updateStats() {
    this.state.stats.entities = this.state.entities.size;
    this.state.stats.network.connectedPeers = this.state.clients.size;
    this.state.stats.performance.fps = Math.random() * 30 + 30; // Simulación
  }

  async createEntity(data) {
    const entity = {
      id: data.id || this.generateEntityId(),
      name: data.name || 'Entity',
      components: [],
      children: [],
      parent: data.parent,
      active: data.active !== false
    };

    this.state.entities.set(entity.id, entity);
    
    return {
      success: true,
      data: { entityId: entity.id }
    };
  }

  async deleteEntity(entityId) {
    const entity = this.state.entities.get(entityId);
    if (!entity) {
      return {
        success: false,
        error: `Entidad no encontrada: ${entityId}`,
        errorCode: 404
      };
    }

    this.state.entities.delete(entityId);
    
    return {
      success: true,
      data: { deleted: true }
    };
  }

  async addComponent(data) {
    const entity = this.state.entities.get(data.entityId);
    if (!entity) {
      return {
        success: false,
        error: `Entidad no encontrada: ${data.entityId}`,
        errorCode: 404
      };
    }

    const component = {
      id: this.generateMessageId(),
      type: data.componentType,
      data: data.componentData,
      active: true
    };

    entity.components.push(component);
    
    return {
      success: true,
      data: { componentId: component.id }
    };
  }

  async removeComponent(data) {
    const entity = this.state.entities.get(data.entityId);
    if (!entity) {
      return {
        success: false,
        error: `Entidad no encontrada: ${data.entityId}`,
        errorCode: 404
      };
    }

    const index = entity.components.findIndex(c => c.id === data.componentId);
    if (index === -1) {
      return {
        success: false,
        error: `Componente no encontrado: ${data.componentId}`,
        errorCode: 404
      };
    }

    entity.components.splice(index, 1);
    
    return {
      success: true,
      data: { removed: true }
    };
  }

  async updateComponent(data) {
    const entity = this.state.entities.get(data.entityId);
    if (!entity) {
      return {
        success: false,
        error: `Entidad no encontrada: ${data.entityId}`,
        errorCode: 404
      };
    }

    const component = entity.components.find(c => c.id === data.componentId);
    if (!component) {
      return {
        success: false,
        error: `Componente no encontrado: ${data.componentId}`,
        errorCode: 404
      };
    }

    component.data = { ...component.data, ...data.componentData };
    
    return {
      success: true,
      data: { updated: true }
    };
  }

  async loadModel(path) {
    // Simulación de carga de modelo
    return {
      success: true,
      data: {
        modelId: this.generateMessageId(),
        path,
        loaded: true
      }
    };
  }

  async createMaterial(data) {
    return {
      success: true,
      data: {
        materialId: this.generateMessageId(),
        ...data
      }
    };
  }

  async createLight(data) {
    return {
      success: true,
      data: {
        lightId: this.generateMessageId(),
        ...data
      }
    };
  }

  async createCamera(data) {
    return {
      success: true,
      data: {
        cameraId: this.generateMessageId(),
        ...data
      }
    };
  }

  async loadScene(data) {
    const scene = {
      id: data.id || this.generateMessageId(),
      name: data.name || 'Scene',
      entities: [],
      config: data.config || {
        background: { r: 0, g: 0, b: 0, a: 1 },
        physics: { gravity: { x: 0, y: -9.81, z: 0 }, enabled: true, debug: false },
        audio: { masterVolume: 1, spatialAudio: true, hrtf: false }
      },
      metadata: {
        author: data.author || 'Unknown',
        version: data.version || '1.0.0',
        description: data.description || '',
        tags: data.tags || [],
        created: Date.now(),
        modified: Date.now()
      }
    };

    this.state.currentScene = scene;
    
    return {
      success: true,
      data: { sceneId: scene.id }
    };
  }

  async saveScene() {
    if (!this.state.currentScene) {
      return {
        success: false,
        error: 'No hay escena activa para guardar',
        errorCode: 400
      };
    }

    return {
      success: true,
      data: { saved: true, sceneId: this.state.currentScene.id }
    };
  }

  async getState() {
    return {
      success: true,
      data: {
        connected: this.state.connected,
        clients: this.state.clients.size,
        entities: this.state.entities.size,
        currentScene: this.state.currentScene?.id
      }
    };
  }

  async getStats() {
    return {
      success: true,
      data: this.state.stats
    };
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEntityId() {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getServerState() {
    return this.state;
  }

  isRunning() {
    return this.state.connected && this.wss !== null;
  }
}

// Iniciar servidor si se ejecuta directamente
if (require.main === module) {
  const server = new EngineServer({
    port: parseInt(process.env.ENGINE_PORT || '8080'),
    host: process.env.ENGINE_HOST || 'localhost'
  });

  server.on('started', () => {
    console.log('✅ Servidor del motor 3D iniciado correctamente');
  });

  server.on('error', (error) => {
    console.error('❌ Error del servidor:', error);
  });

  server.on('clientConnected', (clientId) => {
    console.log(`🔌 Cliente conectado: ${clientId}`);
  });

  server.on('clientDisconnected', (clientId) => {
    console.log(`🔌 Cliente desconectado: ${clientId}`);
  });

  server.start().catch(console.error);

  // Manejar cierre graceful
  process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await server.stop();
    process.exit(0);
  });
}

module.exports = EngineServer; 