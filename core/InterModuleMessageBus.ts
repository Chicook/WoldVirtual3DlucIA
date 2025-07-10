/**
 * InterModuleMessageBus - Sistema de Comunicación Inter-Módulo
 * Gestiona la comunicación entre módulos de diferentes lenguajes de programación
 * 
 * Responsabilidades:
 * - Comunicación pub/sub entre módulos
 * - Enrutamiento de mensajes por prioridad
 * - Gestión de colas de mensajes
 * - Retry automático para mensajes fallidos
 * - Monitoreo de rendimiento de comunicación
 */

import { 
  InterModuleMessage, 
  MessagePriority, 
  MessageTypes, 
  EventCallback, 
  EventFilter,
  ModularSystemEvent 
} from './types/core';

export class InterModuleMessageBus {
  private static instance: InterModuleMessageBus;
  private channels = new Map<string, Set<EventCallback>>();
  private messageQueue = new Map<MessagePriority, InterModuleMessage[]>();
  private pendingResponses = new Map<string, { resolve: Function; reject: Function; timeout: any }>();
  private messageHistory = new Map<string, InterModuleMessage[]>();
  private performanceMetrics = new Map<string, { count: number; avgLatency: number; errors: number }>();
  private isInitialized = false;
  private maxHistorySize = 1000;
  private maxRetries = 3;
  private responseTimeout = 30000; // 30 segundos

  private constructor() {
    this.initializeMessageQueues();
  }

  static getInstance(): InterModuleMessageBus {
    if (!InterModuleMessageBus.instance) {
      InterModuleMessageBus.instance = new InterModuleMessageBus();
    }
    return InterModuleMessageBus.instance;
  }

  /**
   * Inicializa las colas de mensajes por prioridad
   */
  private initializeMessageQueues(): void {
    Object.values(MessagePriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.messageQueue.set(priority, []);
      }
    });
  }

  /**
   * Inicializa el bus de mensajes
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Inicializando InterModuleMessageBus...');
      
      // Iniciar procesamiento de colas
      this.startQueueProcessor();
      
      // Configurar limpieza periódica
      this.startPeriodicCleanup();
      
      this.isInitialized = true;
      console.log('✅ InterModuleMessageBus inicializado');
      
    } catch (error) {
      console.error('❌ Error inicializando InterModuleMessageBus:', error);
      throw error;
    }
  }

  /**
   * Suscribe un callback a un canal específico
   */
  subscribe(channel: string, callback: EventCallback): () => void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    
    this.channels.get(channel)!.add(callback);
    
    console.log(`📡 Suscripción agregada al canal: ${channel}`);
    
    // Retornar función para desuscribirse
    return () => {
      this.channels.get(channel)?.delete(callback);
      if (this.channels.get(channel)?.size === 0) {
        this.channels.delete(channel);
      }
      console.log(`📡 Suscripción removida del canal: ${channel}`);
    };
  }

  /**
   * Publica un mensaje en un canal específico
   */
  publish(channel: string, message: Partial<InterModuleMessage>): void {
    const fullMessage: InterModuleMessage = {
      id: this.generateMessageId(),
      from: message.from || 'system',
      to: message.to || 'all',
      type: message.type || MessageTypes.CUSTOM,
      data: message.data || {},
      timestamp: new Date(),
      priority: message.priority || MessagePriority.NORMAL,
      retryCount: 0,
      maxRetries: this.maxRetries,
      isResponse: message.isResponse || false,
      originalMessageId: message.originalMessageId
    };

    // Agregar a la cola de mensajes
    this.addToQueue(fullMessage);
    
    // Registrar en historial
    this.addToHistory(fullMessage);
    
    // Actualizar métricas
    this.updateMetrics(channel, fullMessage);
  }

  /**
   * Envía un mensaje y espera respuesta
   */
  async requestResponse(channel: string, message: Partial<InterModuleMessage>, timeoutMs?: number): Promise<any> {
    const messageId = this.generateMessageId();
    const timeout = timeoutMs || this.responseTimeout;
    
    return new Promise((resolve, reject) => {
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        this.pendingResponses.delete(messageId);
        reject(new Error(`Timeout esperando respuesta para mensaje ${messageId}`));
      }, timeout);
      
      // Guardar referencia para la respuesta
      this.pendingResponses.set(messageId, { resolve, reject, timeout: timeoutId });
      
      // Publicar mensaje con ID
      this.publish(channel, {
        ...message,
        id: messageId,
        isResponse: false
      });
    });
  }

  /**
   * Responde a un mensaje específico
   */
  respond(originalMessageId: string, data: any, channel?: string): void {
    const originalMessage = this.findMessageById(originalMessageId);
    if (!originalMessage) {
      console.warn(`⚠️ Mensaje original no encontrado: ${originalMessageId}`);
      return;
    }
    
    const responseMessage: InterModuleMessage = {
      id: this.generateMessageId(),
      from: originalMessage.to,
      to: originalMessage.from,
      type: `${originalMessage.type}-response`,
      data: data,
      timestamp: new Date(),
      priority: originalMessage.priority,
      retryCount: 0,
      maxRetries: 0,
      isResponse: true,
      originalMessageId: originalMessageId
    };
    
    // Enviar respuesta al canal original o al canal especificado
    const targetChannel = channel || this.getChannelForMessage(originalMessage);
    this.publish(targetChannel, responseMessage);
  }

  /**
   * Solicita un componente específico
   */
  requestComponent(componentName: string, callback: (component: any) => void): void {
    this.publish('component-request', {
      type: MessageTypes.COMPONENT_REQUESTED,
      data: { componentName },
      priority: MessagePriority.HIGH
    });
    
    // Suscribirse temporalmente para recibir la respuesta
    const unsubscribe = this.subscribe('component-response', (event) => {
      if (event.data.componentName === componentName) {
        callback(event.data.component);
        unsubscribe();
      }
    });
  }

  /**
   * Agrega un mensaje a la cola de prioridad
   */
  private addToQueue(message: InterModuleMessage): void {
    const queue = this.messageQueue.get(message.priority);
    if (queue) {
      queue.push(message);
    }
  }

  /**
   * Procesa las colas de mensajes por prioridad
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      // Procesar mensajes por prioridad (CRITICAL primero)
      const priorities = [MessagePriority.CRITICAL, MessagePriority.HIGH, MessagePriority.NORMAL, MessagePriority.LOW];
      
      for (const priority of priorities) {
        const queue = this.messageQueue.get(priority);
        if (queue && queue.length > 0) {
          const message = queue.shift();
          if (message) {
            this.processMessage(message);
          }
        }
      }
    }, 10); // Procesar cada 10ms
  }

  /**
   * Procesa un mensaje individual
   */
  private processMessage(message: InterModuleMessage): void {
    try {
      // Verificar si es una respuesta a un mensaje pendiente
      if (message.isResponse && message.originalMessageId) {
        const pending = this.pendingResponses.get(message.originalMessageId);
        if (pending) {
          clearTimeout(pending.timeout);
          pending.resolve(message.data);
          this.pendingResponses.delete(message.originalMessageId);
          return;
        }
      }
      
      // Enviar a todos los suscriptores del canal
      const channel = this.getChannelForMessage(message);
      const subscribers = this.channels.get(channel);
      
      if (subscribers) {
        const event: ModularSystemEvent = {
          type: message.type,
          data: message.data,
          timestamp: message.timestamp,
          source: message.from,
          target: message.to
        };
        
        subscribers.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error en callback del canal ${channel}:`, error);
            this.handleMessageError(message, error);
          }
        });
      }
      
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      this.handleMessageError(message, error);
    }
  }

  /**
   * Maneja errores en el procesamiento de mensajes
   */
  private handleMessageError(message: InterModuleMessage, error: any): void {
    if (message.retryCount < message.maxRetries) {
      message.retryCount++;
      message.timestamp = new Date();
      this.addToQueue(message);
      console.log(`🔄 Reintentando mensaje ${message.id} (intento ${message.retryCount})`);
    } else {
      console.error(`❌ Mensaje ${message.id} falló después de ${message.maxRetries} intentos`);
      this.publish('error', {
        type: MessageTypes.ERROR_OCCURRED,
        data: { 
          originalMessage: message,
          error: error.message,
          retryCount: message.retryCount
        },
        priority: MessagePriority.HIGH
      });
    }
  }

  /**
   * Obtiene el canal para un mensaje
   */
  private getChannelForMessage(message: InterModuleMessage): string {
    if (message.to === 'all') {
      return message.type;
    }
    return `${message.from}-${message.to}`;
  }

  /**
   * Agrega un mensaje al historial
   */
  private addToHistory(message: InterModuleMessage): void {
    const channel = this.getChannelForMessage(message);
    if (!this.messageHistory.has(channel)) {
      this.messageHistory.set(channel, []);
    }
    
    const history = this.messageHistory.get(channel)!;
    history.push(message);
    
    // Limitar tamaño del historial
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Actualiza métricas de rendimiento
   */
  private updateMetrics(channel: string, message: InterModuleMessage): void {
    if (!this.performanceMetrics.has(channel)) {
      this.performanceMetrics.set(channel, { count: 0, avgLatency: 0, errors: 0 });
    }
    
    const metrics = this.performanceMetrics.get(channel)!;
    metrics.count++;
    
    // Calcular latencia promedio (simplificado)
    const latency = Date.now() - message.timestamp.getTime();
    metrics.avgLatency = (metrics.avgLatency * (metrics.count - 1) + latency) / metrics.count;
  }

  /**
   * Encuentra un mensaje por ID
   */
  private findMessageById(messageId: string): InterModuleMessage | null {
    for (const history of this.messageHistory.values()) {
      const message = history.find(msg => msg.id === messageId);
      if (message) return message;
    }
    return null;
  }

  /**
   * Genera un ID único para mensajes
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicia limpieza periódica
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupResources();
    }, 60000); // Limpiar cada minuto
  }

  /**
   * Limpia recursos no utilizados
   */
  private cleanupResources(): void {
    // Limpiar mensajes antiguos del historial
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    
    for (const [channel, history] of this.messageHistory.entries()) {
      const filteredHistory = history.filter(msg => msg.timestamp.getTime() > cutoffTime);
      this.messageHistory.set(channel, filteredHistory);
    }
    
    // Limpiar respuestas pendientes expiradas
    for (const [messageId, pending] of this.pendingResponses.entries()) {
      const messageAge = Date.now() - pending.timeout.refresh();
      if (messageAge > this.responseTimeout) {
        pending.reject(new Error('Respuesta expirada'));
        this.pendingResponses.delete(messageId);
      }
    }
  }

  /**
   * Obtiene estadísticas del bus de mensajes
   */
  getStats(): any {
    return {
      channels: this.channels.size,
      pendingResponses: this.pendingResponses.size,
      messageHistorySize: Array.from(this.messageHistory.values()).reduce((sum, history) => sum + history.length, 0),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      isInitialized: this.isInitialized
    };
  }

  /**
   * Obtiene el historial de mensajes para un canal
   */
  getMessageHistory(channel: string, filter?: EventFilter): InterModuleMessage[] {
    const history = this.messageHistory.get(channel) || [];
    
    if (!filter) return history;
    
    return history.filter(message => {
      if (filter.types && !filter.types.includes(message.type)) return false;
      if (filter.sources && !filter.sources.includes(message.from)) return false;
      if (filter.targets && !filter.targets.includes(message.to)) return false;
      if (filter.timeRange) {
        const messageTime = message.timestamp.getTime();
        if (messageTime < filter.timeRange.start.getTime() || 
            messageTime > filter.timeRange.end.getTime()) return false;
      }
      return true;
    });
  }

  /**
   * Limpia todos los recursos
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Limpiando InterModuleMessageBus...');
    
    this.channels.clear();
    this.messageQueue.clear();
    this.pendingResponses.clear();
    this.messageHistory.clear();
    this.performanceMetrics.clear();
    
    this.isInitialized = false;
    console.log('✅ InterModuleMessageBus limpiado');
  }
}

// Exportar instancia singleton
export const interModuleBus = InterModuleMessageBus.getInstance(); 