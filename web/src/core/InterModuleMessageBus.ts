// Sistema de comunicación inter-módulos
export class InterModuleMessageBus {
  private static instance: InterModuleMessageBus;
  private channels: Record<string, Function[]> = {};
  private eventHistory: Array<{ event: string; data: any; timestamp: Date }> = [];

  static getInstance(): InterModuleMessageBus {
    if (!InterModuleMessageBus.instance) {
      InterModuleMessageBus.instance = new InterModuleMessageBus();
    }
    return InterModuleMessageBus.instance;
  }

  // Suscribirse a un evento
  subscribe(event: string, handler: Function): void {
    if (!this.channels[event]) {
      this.channels[event] = [];
    }
    this.channels[event].push(handler);
  }

  // Publicar un evento
  publish(event: string, data?: any): void {
    console.log(`[MessageBus] Evento publicado: ${event}`, data);
    
    // Registrar en historial
    this.eventHistory.push({
      event,
      data,
      timestamp: new Date()
    });

    // Limitar historial a 100 eventos
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }

    // Ejecutar handlers
    this.channels[event]?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[MessageBus] Error en handler para evento ${event}:`, error);
      }
    });
  }

  // Solicitar componente con callback
  requestComponent(componentName: string, callback: (component: any) => void): void {
    this.publish('component-request', { componentName, callback });
  }

  // Obtener historial de eventos
  getEventHistory(): Array<{ event: string; data: any; timestamp: Date }> {
    return [...this.eventHistory];
  }

  // Limpiar historial
  clearHistory(): void {
    this.eventHistory = [];
  }

  // Obtener estadísticas
  getStats(): { totalEvents: number; activeChannels: number; recentEvents: number } {
    return {
      totalEvents: this.eventHistory.length,
      activeChannels: Object.keys(this.channels).length,
      recentEvents: this.eventHistory.filter(e => 
        Date.now() - e.timestamp.getTime() < 60000
      ).length
    };
  }
}

// Instancia global
export const messageBus = InterModuleMessageBus.getInstance(); 