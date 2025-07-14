/**
 * 🔧 ServiceManager - Gestor Central de Servicios
 * 
 * Responsabilidades:
 * - Gestión centralizada de todos los servicios del sistema
 * - Inicialización y cierre ordenado de servicios
 * - Monitoreo de salud y estado de servicios
 * - Balanceo de carga y failover
 * - Gestión de dependencias entre servicios
 */

import { EventEmitter } from 'events';
import { ServiceRegistry } from './ServiceRegistry';
import { ServiceHealthMonitor } from './ServiceHealthMonitor';

export interface ServiceInfo {
  id: string;
  name: string;
  version: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  health: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastHeartbeat: Date;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface ServiceConfig {
  id: string;
  name: string;
  version: string;
  autoStart?: boolean;
  restartOnFailure?: boolean;
  maxRestarts?: number;
  healthCheckInterval?: number;
  timeout?: number;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export class ServiceManager extends EventEmitter {
  private services: Map<string, ServiceInfo> = new Map();
  private serviceInstances: Map<string, any> = new Map();
  private registry: ServiceRegistry;
  private healthMonitor: ServiceHealthMonitor;
  private isInitialized: boolean = false;
  private restartCounts: Map<string, number> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.registry = new ServiceRegistry();
    this.healthMonitor = new ServiceHealthMonitor();
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Escuchar eventos de salud
    this.healthMonitor.on('health-change', (serviceId: string, health: string) => {
      this.updateServiceHealth(serviceId, health as any);
    });

    // Escuchar eventos de registro
    this.registry.on('service-registered', (serviceId: string) => {
      console.log(`[🔧] Servicio registrado: ${serviceId}`);
    });

    this.registry.on('service-unregistered', (serviceId: string) => {
      console.log(`[🔧] Servicio desregistrado: ${serviceId}`);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[🔧] ServiceManager ya está inicializado');
      return;
    }

    console.log('[🔧] Inicializando ServiceManager...');

    try {
      // Inicializar componentes core
      await this.registry.initialize();
      await this.healthMonitor.initialize();

      // Cargar servicios configurados
      await this.loadConfiguredServices();

      this.isInitialized = true;
      console.log('[✅] ServiceManager inicializado correctamente');
      this.emit('initialized');
    } catch (error) {
      console.error('[❌] Error inicializando ServiceManager:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private async loadConfiguredServices(): Promise<void> {
    const defaultServices: ServiceConfig[] = [
      {
        id: 'blockchain-service',
        name: 'Blockchain Service',
        version: '1.0.0',
        autoStart: true,
        restartOnFailure: true,
        maxRestarts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      },
      {
        id: 'audio-service',
        name: 'Audio Service',
        version: '1.0.0',
        autoStart: true,
        restartOnFailure: true,
        maxRestarts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      },
      {
        id: 'ai-service',
        name: 'AI Service',
        version: '1.0.0',
        autoStart: true,
        restartOnFailure: true,
        maxRestarts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      }
    ];

    for (const config of defaultServices) {
      await this.registerService(config);
    }
  }

  async registerService(config: ServiceConfig): Promise<void> {
    try {
      // Registrar en el registro
      await this.registry.registerService(config);

      // Crear información del servicio
      const serviceInfo: ServiceInfo = {
        id: config.id,
        name: config.name,
        version: config.version,
        status: 'stopped',
        health: 'unhealthy',
        uptime: 0,
        lastHeartbeat: new Date(),
        dependencies: config.dependencies || [],
        metadata: config.metadata || {}
      };

      this.services.set(config.id, serviceInfo);
      this.restartCounts.set(config.id, 0);

      console.log(`[🔧] Servicio registrado: ${config.name} (${config.id})`);

      // Auto-iniciar si está configurado
      if (config.autoStart) {
        await this.startService(config.id);
      }
    } catch (error) {
      console.error(`[❌] Error registrando servicio ${config.id}:`, error);
      throw error;
    }
  }

  async startService(serviceId: string): Promise<void> {
    const serviceInfo = this.services.get(serviceId);
    if (!serviceInfo) {
      throw new Error(`Servicio no encontrado: ${serviceId}`);
    }

    if (serviceInfo.status === 'running') {
      console.log(`[🔧] Servicio ${serviceId} ya está ejecutándose`);
      return;
    }

    try {
      console.log(`[🔧] Iniciando servicio: ${serviceId}`);
      
      // Verificar dependencias
      await this.checkDependencies(serviceId);

      // Actualizar estado
      serviceInfo.status = 'starting';
      serviceInfo.uptime = 0;
      this.emit('service-status-change', serviceId, 'starting');

      // Simular inicio del servicio
      await this.simulateServiceStart(serviceId);

      // Actualizar estado a ejecutándose
      serviceInfo.status = 'running';
      serviceInfo.lastHeartbeat = new Date();
      this.emit('service-status-change', serviceId, 'running');

      // Configurar monitoreo de salud
      this.setupHealthMonitoring(serviceId);

      console.log(`[✅] Servicio ${serviceId} iniciado correctamente`);
    } catch (error) {
      console.error(`[❌] Error iniciando servicio ${serviceId}:`, error);
      serviceInfo.status = 'error';
      this.emit('service-status-change', serviceId, 'error');
      throw error;
    }
  }

  private async checkDependencies(serviceId: string): Promise<void> {
    const serviceInfo = this.services.get(serviceId);
    if (!serviceInfo) return;

    for (const depId of serviceInfo.dependencies) {
      const depInfo = this.services.get(depId);
      if (!depInfo || depInfo.status !== 'running') {
        throw new Error(`Dependencia no disponible: ${depId}`);
      }
    }
  }

  private async simulateServiceStart(serviceId: string): Promise<void> {
    // Simular tiempo de inicio
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private setupHealthMonitoring(serviceId: string): void {
    const serviceInfo = this.services.get(serviceId);
    if (!serviceInfo) return;

    // Limpiar intervalo existente
    const existingInterval = this.healthCheckIntervals.get(serviceId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Configurar nuevo intervalo
    const interval = setInterval(async () => {
      try {
        await this.checkServiceHealth(serviceId);
      } catch (error) {
        console.error(`[❌] Error en health check de ${serviceId}:`, error);
      }
    }, 30000); // 30 segundos

    this.healthCheckIntervals.set(serviceId, interval);
  }

  private async checkServiceHealth(serviceId: string): Promise<void> {
    const serviceInfo = this.services.get(serviceId);
    if (!serviceInfo) return;

    // Simular health check
    const isHealthy = Math.random() > 0.1; // 90% de probabilidad de estar saludable
    
    if (isHealthy) {
      serviceInfo.health = 'healthy';
      serviceInfo.lastHeartbeat = new Date();
      serviceInfo.uptime = Date.now() - serviceInfo.lastHeartbeat.getTime();
    } else {
      serviceInfo.health = 'degraded';
      console.warn(`[⚠️] Servicio ${serviceId} muestra degradación`);
    }

    this.emit('service-health-change', serviceId, serviceInfo.health);
  }

  private updateServiceHealth(serviceId: string, health: 'healthy' | 'degraded' | 'unhealthy'): void {
    const serviceInfo = this.services.get(serviceId);
    if (serviceInfo) {
      serviceInfo.health = health;
      this.emit('service-health-change', serviceId, health);
    }
  }

  async stopService(serviceId: string): Promise<void> {
    const serviceInfo = this.services.get(serviceId);
    if (!serviceInfo) {
      throw new Error(`Servicio no encontrado: ${serviceId}`);
    }

    if (serviceInfo.status === 'stopped') {
      console.log(`[🔧] Servicio ${serviceId} ya está detenido`);
      return;
    }

    try {
      console.log(`[🔧] Deteniendo servicio: ${serviceId}`);
      
      serviceInfo.status = 'stopping';
      this.emit('service-status-change', serviceId, 'stopping');

      // Limpiar monitoreo de salud
      const interval = this.healthCheckIntervals.get(serviceId);
      if (interval) {
        clearInterval(interval);
        this.healthCheckIntervals.delete(serviceId);
      }

      // Simular parada del servicio
      await this.simulateServiceStop(serviceId);

      serviceInfo.status = 'stopped';
      serviceInfo.health = 'unhealthy';
      this.emit('service-status-change', serviceId, 'stopped');

      console.log(`[✅] Servicio ${serviceId} detenido correctamente`);
    } catch (error) {
      console.error(`[❌] Error deteniendo servicio ${serviceId}:`, error);
      throw error;
    }
  }

  private async simulateServiceStop(serviceId: string): Promise<void> {
    // Simular tiempo de parada
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  getServiceInfo(serviceId: string): ServiceInfo | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  getRunningServices(): ServiceInfo[] {
    return Array.from(this.services.values()).filter(s => s.status === 'running');
  }

  getServiceStats(): any {
    const total = this.services.size;
    const running = this.getRunningServices().length;
    const healthy = Array.from(this.services.values()).filter(s => s.health === 'healthy').length;

    return {
      total,
      running,
      stopped: total - running,
      healthy,
      degraded: Array.from(this.services.values()).filter(s => s.health === 'degraded').length,
      unhealthy: Array.from(this.services.values()).filter(s => s.health === 'unhealthy').length,
      uptime: Date.now()
    };
  }

  async cleanup(): Promise<void> {
    console.log('[🔧] Limpiando ServiceManager...');

    // Detener todos los servicios
    for (const serviceId of this.services.keys()) {
      try {
        await this.stopService(serviceId);
      } catch (error) {
        console.error(`[❌] Error deteniendo servicio ${serviceId}:`, error);
      }
    }

    // Limpiar intervalos
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();

    // Limpiar componentes
    await this.registry.cleanup();
    await this.healthMonitor.cleanup();

    this.services.clear();
    this.serviceInstances.clear();
    this.restartCounts.clear();
    this.isInitialized = false;

    console.log('[✅] ServiceManager limpiado correctamente');
  }
}

export default ServiceManager; 