/**
 * InterModuleMessageBus - Sistema de comunicación inter-módulos
 * Permite a los módulos comunicarse entre sí de forma desacoplada
 */
export class InterModuleMessageBus {
  private static instance: InterModuleMessageBus;
  private channels = new Map<string, Set<Function>>();
  private messageHistory = new Map<string, any[]>();
  private maxHistorySize = 100;
  private isEnabled = true;
  private eventListeners = new Map<string, Function[]>();

  private constructor() {
    this.setupDefaultHandlers();
  }

  static getInstance(): InterModuleMessageBus {
    if (!InterModuleMessageBus.instance) {
      InterModuleMessageBus.instance = new InterModuleMessageBus();
    }
    return InterModuleMessageBus.instance;
  }

  /**
   * Configura manejadores por defecto
   */
  private setupDefaultHandlers(): void {
    // Manejador para mensajes de debug
    this.on('debug', (data: any) => {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.log('[MessageBus Debug]', data);
      }
    });

    // Manejador para errores
    this.on('error', (error: any) => {
      console.error('[MessageBus Error]', error);
    });
  }

  /**
   * Agrega un listener para eventos internos
   */
  private on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Emite un evento interno
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[MessageBus] Error en listener del evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Suscribe un callback a un canal específico
   */
  subscribe(channel: string, callback: Function): void {
    if (!this.isEnabled) {
      console.warn('[MessageBus] Bus deshabilitado, no se puede suscribir');
      return;
    }

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel)!.add(callback);
    
    // Emitir evento de suscripción
    this.emit('subscription-added', { channel, timestamp: Date.now() });
    
    console.log(`[MessageBus] Suscripción agregada al canal: ${channel}`);
  }

  /**
   * Desuscribe un callback de un canal
   */
  unsubscribe(channel: string, callback: Function): void {
    const channelCallbacks = this.channels.get(channel);
    if (channelCallbacks) {
      channelCallbacks.delete(callback);
      
      // Si no hay más callbacks, eliminar el canal
      if (channelCallbacks.size === 0) {
        this.channels.delete(channel);
      }
      
      this.emit('subscription-removed', { channel, timestamp: Date.now() });
      console.log(`[MessageBus] Suscripción removida del canal: ${channel}`);
    }
  }

  /**
   * Publica un mensaje en un canal
   */
  publish(channel: string, data?: any): void {
    if (!this.isEnabled) {
      console.warn('[MessageBus] Bus deshabilitado, no se puede publicar');
      return;
    }

    const message = {
      channel,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    // Guardar en historial
    this.addToHistory(channel, message);

    // Emitir a todos los suscriptores del canal
    const channelCallbacks = this.channels.get(channel);
    if (channelCallbacks) {
      channelCallbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`[MessageBus] Error en callback del canal ${channel}:`, error);
          this.emit('callback-error', { channel, error, message });
        }
      });
    }

    // Emitir evento de publicación
    this.emit('message-published', message);
    
    console.log(`[MessageBus] Mensaje publicado en canal: ${channel}`, data);
  }

  /**
   * Publica un mensaje con respuesta (request-response pattern)
   */
  async publishWithResponse(
    channel: string, 
    data: any, 
    timeout: number = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const responseChannel = `${channel}_response_${Date.now()}`;
      const timeoutId = setTimeout(() => {
        this.unsubscribe(responseChannel, responseHandler);
        reject(new Error(`Timeout esperando respuesta en canal ${channel}`));
      }, timeout);

      const responseHandler = (response: any) => {
        clearTimeout(timeoutId);
        this.unsubscribe(responseChannel, responseHandler);
        resolve(response.data);
      };

      this.subscribe(responseChannel, responseHandler);
      this.publish(channel, { ...data, responseChannel });
    });
  }

  /**
   * Solicita la carga de un módulo
   */
  requestModuleLoad(moduleName: string, userId: string, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    this.publish('module-load-request', {
      moduleName,
      userId,
      priority,
      timestamp: Date.now()
    });
  }

  /**
   * Solicita la carga de un grupo de módulos
   */
  requestGroupLoad(groupName: string, userId: string): void {
    this.publish('group-load-request', {
      groupName,
      userId,
      timestamp: Date.now()
    });
  }

  /**
   * Solicita una API de un módulo
   */
  requestModuleAPI(
    moduleName: string, 
    apiMethod: string, 
    params: any[], 
    callback: (result: any) => void
  ): void {
    this.publish('module-api-request', {
      moduleName,
      apiMethod,
      params,
      callback,
      timestamp: Date.now()
    });
  }

  /**
   * Notifica un evento del sistema
   */
  notifySystemEvent(eventType: string, data: any): void {
    this.publish('system-event', {
      type: eventType,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Notifica un error del sistema
   */
  notifySystemError(error: Error, context: string): void {
    this.publish('system-error', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Obtiene el historial de mensajes de un canal
   */
  getMessageHistory(channel: string, limit: number = 10): any[] {
    const history = this.messageHistory.get(channel) || [];
    return history.slice(-limit);
  }

  /**
   * Limpia el historial de mensajes
   */
  clearMessageHistory(channel?: string): void {
    if (channel) {
      this.messageHistory.delete(channel);
    } else {
      this.messageHistory.clear();
    }
  }

  /**
   * Obtiene estadísticas del message bus
   */
  getStats(): {
    totalChannels: number;
    totalSubscriptions: number;
    totalMessages: number;
    isEnabled: boolean;
  } {
    let totalSubscriptions = 0;
    for (const callbacks of this.channels.values()) {
      totalSubscriptions += callbacks.size;
    }

    let totalMessages = 0;
    for (const history of this.messageHistory.values()) {
      totalMessages += history.length;
    }

    return {
      totalChannels: this.channels.size,
      totalSubscriptions,
      totalMessages,
      isEnabled: this.isEnabled
    };
  }

  /**
   * Habilita o deshabilita el message bus
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.emit('bus-state-changed', { enabled, timestamp: Date.now() });
    console.log(`[MessageBus] Bus ${enabled ? 'habilitado' : 'deshabilitado'}`);
  }

  /**
   * Limpia todos los canales y suscripciones
   */
  clearAll(): void {
    this.channels.clear();
    this.messageHistory.clear();
    this.emit('bus-cleared', { timestamp: Date.now() });
    console.log('[MessageBus] Todos los canales y suscripciones limpiados');
  }

  /**
   * Agrega un mensaje al historial
   */
  private addToHistory(channel: string, message: any): void {
    if (!this.messageHistory.has(channel)) {
      this.messageHistory.set(channel, []);
    }

    const history = this.messageHistory.get(channel)!;
    history.push(message);

    // Mantener tamaño máximo del historial
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Genera un ID único para el mensaje
   */
  private generateMessageId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene información de un canal específico
   */
  getChannelInfo(channel: string): {
    subscribers: number;
    messageCount: number;
    lastMessage?: any;
  } | null {
    const callbacks = this.channels.get(channel);
    const history = this.messageHistory.get(channel) || [];
    
    if (!callbacks) {
      return null;
    }

    return {
      subscribers: callbacks.size,
      messageCount: history.length,
      lastMessage: history.length > 0 ? history[history.length - 1] : undefined
    };
  }

  /**
   * Lista todos los canales activos
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Verifica si un canal tiene suscriptores
   */
  hasSubscribers(channel: string): boolean {
    const callbacks = this.channels.get(channel);
    return callbacks ? callbacks.size > 0 : false;
  }

  /**
   * Obtiene el número de suscriptores de un canal
   */
  getSubscriberCount(channel: string): number {
    const callbacks = this.channels.get(channel);
    return callbacks ? callbacks.size : 0;
  }
}

// Exportar instancia singleton
export const messageBus = InterModuleMessageBus.getInstance(); 