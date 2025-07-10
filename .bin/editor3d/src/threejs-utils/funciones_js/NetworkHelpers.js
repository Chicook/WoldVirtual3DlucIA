/**
 * Network Helpers - Utilidades de red y comunicación para el editor 3D
 * Maneja WebSocket, sincronización de escenas, colaboración en tiempo real y gestión de conexiones
 * Inspirado en Blender y Godot
 */

class NetworkHelpers {
  constructor() {
    this.websocket = null;
    this.connectionStatus = 'disconnected';
    this.serverUrl = 'ws://localhost:8080';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.eventHandlers = new Map();
    this.syncEnabled = false;
    this.userId = null;
    this.sessionId = null;
    this.collaborators = new Map();
    this.lastSyncTime = 0;
    this.syncInterval = 100; // ms
  }

  /**
   * Inicializa la conexión de red
   */
  initialize(options = {}) {
    this.serverUrl = options.serverUrl || this.serverUrl;
    this.syncEnabled = options.syncEnabled || false;
    this.userId = options.userId || this.generateUserId();
    this.sessionId = options.sessionId || this.generateSessionId();

    console.log('🌐 Network Helpers inicializado');
    return this.connect();
  }

  /**
   * Conecta al servidor WebSocket
   */
  connect() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.log('✅ Ya conectado al servidor');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.serverUrl);
        this.setupWebSocketHandlers(resolve, reject);
      } catch (error) {
        console.error('❌ Error al conectar:', error);
        reject(error);
      }
    });
  }

  /**
   * Configura los manejadores de eventos del WebSocket
   */
  setupWebSocketHandlers(resolve, reject) {
    this.websocket.onopen = () => {
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      console.log('✅ Conectado al servidor WebSocket');
      
      // Enviar información de sesión
      this.sendMessage({
        type: 'session_info',
        userId: this.userId,
        sessionId: this.sessionId,
        syncEnabled: this.syncEnabled
      });

      resolve();
    };

    this.websocket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.websocket.onclose = (event) => {
      this.connectionStatus = 'disconnected';
      console.log('❌ Conexión cerrada:', event.code, event.reason);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.websocket.onerror = (error) => {
      console.error('❌ Error de WebSocket:', error);
      reject(error);
    };
  }

  /**
   * Programa un intento de reconexión
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Error en reconexión:', error);
      });
    }, delay);
  }

  /**
   * Maneja mensajes recibidos del servidor
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'scene_sync':
          this.handleSceneSync(message);
          break;
        case 'user_joined':
          this.handleUserJoined(message);
          break;
        case 'user_left':
          this.handleUserLeft(message);
          break;
        case 'object_update':
          this.handleObjectUpdate(message);
          break;
        case 'collaboration_update':
          this.handleCollaborationUpdate(message);
          break;
        case 'error':
          this.handleError(message);
          break;
        default:
          this.triggerEvent('message', message);
      }
    } catch (error) {
      console.error('❌ Error al procesar mensaje:', error);
    }
  }

  /**
   * Maneja sincronización de escena
   */
  handleSceneSync(message) {
    if (this.syncEnabled) {
      this.triggerEvent('scene_sync', message.data);
    }
  }

  /**
   * Maneja cuando un usuario se une
   */
  handleUserJoined(message) {
    this.collaborators.set(message.userId, {
      userId: message.userId,
      username: message.username,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    });

    this.triggerEvent('user_joined', message);
    console.log(`👋 Usuario unido: ${message.username} (${message.userId})`);
  }

  /**
   * Maneja cuando un usuario se va
   */
  handleUserLeft(message) {
    this.collaborators.delete(message.userId);
    this.triggerEvent('user_left', message);
    console.log(`👋 Usuario salió: ${message.userId}`);
  }

  /**
   * Maneja actualizaciones de objetos
   */
  handleObjectUpdate(message) {
    this.triggerEvent('object_update', message);
  }

  /**
   * Maneja actualizaciones de colaboración
   */
  handleCollaborationUpdate(message) {
    this.triggerEvent('collaboration_update', message);
  }

  /**
   * Maneja errores del servidor
   */
  handleError(message) {
    console.error('❌ Error del servidor:', message.error);
    this.triggerEvent('error', message);
  }

  /**
   * Envía un mensaje al servidor
   */
  sendMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      };

      this.websocket.send(JSON.stringify(fullMessage));
    } else {
      // Encolar mensaje si no hay conexión
      this.messageQueue.push(message);
      console.warn('⚠️ Mensaje encolado - sin conexión');
    }
  }

  /**
   * Envía actualización de objeto
   */
  sendObjectUpdate(objectId, data) {
    this.sendMessage({
      type: 'object_update',
      objectId: objectId,
      data: data
    });
  }

  /**
   * Sincroniza la escena completa
   */
  syncScene(sceneData) {
    if (!this.syncEnabled) return;

    const now = Date.now();
    if (now - this.lastSyncTime < this.syncInterval) return;

    this.sendMessage({
      type: 'scene_sync',
      data: sceneData
    });

    this.lastSyncTime = now;
  }

  /**
   * Registra un manejador de eventos
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Desregistra un manejador de eventos
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Dispara un evento
   */
  triggerEvent(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error en manejador de evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Obtiene el estado de la conexión
   */
  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      serverUrl: this.serverUrl,
      userId: this.userId,
      sessionId: this.sessionId,
      syncEnabled: this.syncEnabled,
      collaborators: this.collaborators.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Obtiene la lista de colaboradores
   */
  getCollaborators() {
    return Array.from(this.collaborators.values());
  }

  /**
   * Activa/desactiva la sincronización
   */
  setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
    this.sendMessage({
      type: 'sync_toggle',
      enabled: enabled
    });
    console.log(`🔄 Sincronización ${enabled ? 'activada' : 'desactivada'}`);
  }

  /**
   * Genera un ID único de usuario
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera un ID único de sesión
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Desconecta del servidor
   */
  disconnect() {
    if (this.websocket) {
      this.websocket.close(1000, 'Desconexión manual');
      this.websocket = null;
    }
    this.connectionStatus = 'disconnected';
    console.log('🔌 Desconectado del servidor');
  }

  /**
   * Limpia todos los recursos
   */
  dispose() {
    this.disconnect();
    this.eventHandlers.clear();
    this.collaborators.clear();
    this.messageQueue = [];
    console.log('🧹 Network Helpers limpiado');
  }
}

export { NetworkHelpers }; 