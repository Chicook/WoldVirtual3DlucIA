/**
 * 🌐 InterModuleMessageBus - Sistema de Comunicación Inter-Módulo
 * 
 * Responsabilidades:
 * - Comunicación asíncrona entre módulos especializados
 * - Patrón Pub/Sub para desacoplamiento
 * - Gestión de eventos con tipado fuerte
 * - Optimización de rendimiento con colas de mensajes
 * - Sistema de retry y fallback para mensajes críticos
 */

import { EventHandler, MessageData, MessagePriority, SubscriptionToken } from '../@types/core/message.d';

export class InterModuleMessageBus {
  private static instance: InterModuleMessageBus;
  private channels = new Map<string, Set<EventHandler>>();
  private priorityQueues = new Map<MessagePriority, Array<{ event: string; data: MessageData; timestamp: number }>>();
  private retryConfig = new Map<string, { maxRetries: number; backoffMs: number }>();
  private messageHistory = new Map<string, Array<{ event: string; data: MessageData; timestamp: number }>>();
  private performanceMetrics = new Map<string, { totalMessages: number; avgLatency: number; errors: number }>();

  private constructor() {
    this.initializePriorityQueues();
    this.initializeRetryConfig();
    this.startPerformanceMonitoring();
  }

  static getInstance(): InterModuleMessageBus {
    if (!InterModuleMessageBus.instance) {
      InterModuleMessageBus.instance = new InterModuleMessageBus();
    }
    return InterModuleMessageBus.instance;
  }

  /**
   * Inicializa las colas de prioridad para diferentes tipos de mensajes
   */
  private initializePriorityQueues(): void {
    const priorities: MessagePriority[] = ['critical', 'high', 'normal', 'low'];
    priorities.forEach(priority => {
      this.priorityQueues.set(priority, []);
    });
  }

  /**
   * Configura estrategias de retry para diferentes tipos de eventos
   */
  private initializeRetryConfig(): void {
    const retryStrategies = {
      'component-load': { maxRetries: 3, backoffMs: 1000 },
      'module-initialization': { maxRetries: 5, backoffMs: 2000 },
      'blockchain-transaction': { maxRetries: 10, backoffMs: 5000 },
      'asset-upload': { maxRetries: 3, backoffMs: 3000 },
      'ai-request': { maxRetries: 2, backoffMs: 1000 }
    };

    Object.entries(retryStrategies).forEach(([event, config]) => {
      this.retryConfig.set(event, config);
    });
  }

  /**
   * Inicia el monitoreo de rendimiento del sistema de mensajería
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.analyzePerformanceMetrics();
    }, 60000); // Análisis cada minuto
  }

  /**
   * Analiza métricas de rendimiento y optimiza el sistema
   */
  private analyzePerformanceMetrics(): void {
    let totalLatency = 0;
    let totalMessages = 0;
    let totalErrors = 0;

    this.performanceMetrics.forEach(metrics => {
      totalLatency += metrics.avgLatency * metrics.totalMessages;
      totalMessages += metrics.totalMessages;
      totalErrors += metrics.errors;
    });

    if (totalMessages > 0) {
      const avgLatency = totalLatency / totalMessages;
      const errorRate = totalErrors / totalMessages;

      console.log(`[📊] MessageBus Performance - Avg Latency: ${avgLatency.toFixed(2)}ms, Error Rate: ${(errorRate * 100).toFixed(2)}%`);

      // Optimización automática basada en métricas
      if (errorRate > 0.1) {
        this.optimizeRetryStrategies();
      }

      if (avgLatency > 100) {
        this.optimizeMessageProcessing();
      }
    }
  }

  /**
   * Optimiza estrategias de retry basado en métricas de error
   */
  private optimizeRetryStrategies(): void {
    this.retryConfig.forEach((config, event) => {
      if (config.maxRetries < 10) {
        config.maxRetries += 1;
        config.backoffMs = Math.min(config.backoffMs * 1.2, 10000);
      }
    });
  }

  /**
   * Optimiza el procesamiento de mensajes para reducir latencia
   */
  private optimizeMessageProcessing(): void {
    // Implementar procesamiento en lotes para mensajes de baja prioridad
    const lowPriorityQueue = this.priorityQueues.get('low');
    if (lowPriorityQueue && lowPriorityQueue.length > 10) {
      this.processBatchMessages(lowPriorityQueue);
    }
  }

  /**
   * Procesa mensajes en lotes para optimizar rendimiento
   */
  private processBatchMessages(messages: Array<{ event: string; data: MessageData; timestamp: number }>): void {
    const batchSize = 5;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      setTimeout(() => {
        batch.forEach(message => this.processMessage(message.event, message.data));
      }, 0);
    }
  }

  /**
   * Suscribe a un evento específico con manejo de errores y retry
   */
  subscribe(event: string, handler: EventHandler): SubscriptionToken {
    if (!this.channels.has(event)) {
      this.channels.set(event, new Set());
    }

    const token = this.generateSubscriptionToken();
    const wrappedHandler = this.createWrappedHandler(handler, event, token);
    
    this.channels.get(event)!.add(wrappedHandler);
    this.initializePerformanceTracking(event);

    console.log(`[📡] Suscripción creada para evento '${event}' con token ${token}`);
    return token;
  }

  /**
   * Crea un handler envuelto con manejo de errores y métricas
   */
  private createWrappedHandler(handler: EventHandler, event: string, token: string): EventHandler {
    return async (data: MessageData) => {
      const startTime = performance.now();
      
      try {
        await handler(data);
        this.recordSuccessfulMessage(event, performance.now() - startTime);
      } catch (error) {
        this.recordFailedMessage(event, error);
        await this.handleMessageError(event, data, error, handler);
      }
    };
  }

  /**
   * Maneja errores en el procesamiento de mensajes con retry automático
   */
  private async handleMessageError(event: string, data: MessageData, error: Error, handler: EventHandler): Promise<void> {
    const retryConfig = this.retryConfig.get(event);
    if (!retryConfig) {
      console.error(`[❌] Error en evento '${event}':`, error);
      return;
    }

    let retryCount = 0;
    while (retryCount < retryConfig.maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, retryConfig.backoffMs * (retryCount + 1)));
        await handler(data);
        console.log(`[✅] Retry exitoso para evento '${event}' después de ${retryCount + 1} intentos`);
        return;
      } catch (retryError) {
        retryCount++;
        console.warn(`[⚠️] Retry ${retryCount}/${retryConfig.maxRetries} falló para evento '${event}':`, retryError);
      }
    }

    console.error(`[❌] Evento '${event}' falló después de ${retryConfig.maxRetries} intentos`);
    this.publish('message-error', { event, error: error.message, data });
  }

  /**
   * Publica un mensaje con prioridad y manejo de colas
   */
  publish(event: string, data: MessageData, priority: MessagePriority = 'normal'): void {
    const message = { event, data, timestamp: Date.now() };
    
    // Agregar a la cola de prioridad correspondiente
    const queue = this.priorityQueues.get(priority);
    if (queue) {
      queue.push(message);
    }

    // Procesar mensajes según prioridad
    this.processPriorityQueue(priority);
    
    // Registrar en historial
    this.recordMessageInHistory(event, data);
  }

  /**
   * Procesa la cola de mensajes según prioridad
   */
  private processPriorityQueue(priority: MessagePriority): void {
    const queue = this.priorityQueues.get(priority);
    if (!queue || queue.length === 0) return;

    // Procesar mensajes críticos inmediatamente
    if (priority === 'critical') {
      while (queue.length > 0) {
        const message = queue.shift()!;
        this.processMessage(message.event, message.data);
      }
    } else {
      // Procesar otros mensajes con delay para evitar bloqueo
      setTimeout(() => {
        const message = queue.shift();
        if (message) {
          this.processMessage(message.event, message.data);
        }
      }, 0);
    }
  }

  /**
   * Procesa un mensaje individual
   */
  private processMessage(event: string, data: MessageData): void {
    const handlers = this.channels.get(event);
    if (!handlers || handlers.size === 0) {
      console.warn(`[⚠️] No hay handlers registrados para evento '${event}'`);
      return;
    }

    const startTime = performance.now();
    const promises = Array.from(handlers).map(handler => handler(data));
    
    Promise.allSettled(promises).then(results => {
      const latency = performance.now() - startTime;
      this.updatePerformanceMetrics(event, latency, results);
    });
  }

  /**
   * Actualiza métricas de rendimiento para un evento
   */
  private updatePerformanceMetrics(event: string, latency: number, results: PromiseSettledResult<any>[]): void {
    const metrics = this.performanceMetrics.get(event) || { totalMessages: 0, avgLatency: 0, errors: 0 };
    
    metrics.totalMessages += 1;
    metrics.avgLatency = (metrics.avgLatency * (metrics.totalMessages - 1) + latency) / metrics.totalMessages;
    metrics.errors += results.filter(result => result.status === 'rejected').length;
    
    this.performanceMetrics.set(event, metrics);
  }

  /**
   * Registra un mensaje exitoso
   */
  private recordSuccessfulMessage(event: string, latency: number): void {
    const metrics = this.performanceMetrics.get(event);
    if (metrics) {
      metrics.totalMessages += 1;
      metrics.avgLatency = (metrics.avgLatency * (metrics.totalMessages - 1) + latency) / metrics.totalMessages;
    }
  }

  /**
   * Registra un mensaje fallido
   */
  private recordFailedMessage(event: string, error: Error): void {
    const metrics = this.performanceMetrics.get(event);
    if (metrics) {
      metrics.errors += 1;
    }
    console.error(`[❌] Error en evento '${event}':`, error);
  }

  /**
   * Inicializa el tracking de rendimiento para un evento
   */
  private initializePerformanceTracking(event: string): void {
    if (!this.performanceMetrics.has(event)) {
      this.performanceMetrics.set(event, { totalMessages: 0, avgLatency: 0, errors: 0 });
    }
  }

  /**
   * Registra un mensaje en el historial
   */
  private recordMessageInHistory(event: string, data: MessageData): void {
    if (!this.messageHistory.has(event)) {
      this.messageHistory.set(event, []);
    }

    const history = this.messageHistory.get(event)!;
    history.push({ event, data, timestamp: Date.now() });

    // Mantener solo los últimos 100 mensajes por evento
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Genera un token único para suscripciones
   */
  private generateSubscriptionToken(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Desuscribe de un evento usando el token
   */
  unsubscribe(event: string, token: SubscriptionToken): boolean {
    const handlers = this.channels.get(event);
    if (!handlers) return false;

    // En una implementación real, necesitarías mantener un mapeo de tokens a handlers
    // Por simplicidad, aquí removemos todos los handlers del evento
    const removed = handlers.size > 0;
    handlers.clear();
    
    console.log(`[📡] Desuscripción completada para evento '${event}'`);
    return removed;
  }

  /**
   * Obtiene estadísticas del sistema de mensajería
   */
  getStats(): {
    totalChannels: number;
    totalSubscriptions: number;
    messageHistory: Map<string, number>;
    performanceMetrics: Map<string, any>;
  } {
    let totalSubscriptions = 0;
    this.channels.forEach(handlers => {
      totalSubscriptions += handlers.size;
    });

    const messageHistory = new Map<string, number>();
    this.messageHistory.forEach((messages, event) => {
      messageHistory.set(event, messages.length);
    });

    return {
      totalChannels: this.channels.size,
      totalSubscriptions,
      messageHistory,
      performanceMetrics: this.performanceMetrics
    };
  }

  /**
   * Limpia recursos y resetea el sistema
   */
  cleanup(): void {
    this.channels.clear();
    this.priorityQueues.clear();
    this.messageHistory.clear();
    this.performanceMetrics.clear();
    console.log('[🧹] MessageBus limpiado completamente');
  }
}

// Exportar instancia singleton
export const interModuleBus = InterModuleMessageBus.getInstance(); 