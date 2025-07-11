/**
 * 🏥 ServiceHealthMonitor - Monitor de Salud de Servicios
 * 
 * Responsabilidades:
 * - Monitoreo continuo de la salud de servicios
 * - Detección de fallos y degradación
 * - Alertas y notificaciones de problemas
 * - Métricas de rendimiento y disponibilidad
 * - Análisis de tendencias de salud
 */

import { EventEmitter } from 'events';

export interface HealthCheck {
  serviceId: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'timeout';
  responseTime: number;
  error?: string;
  metrics: {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
  };
}

export interface HealthThresholds {
  responseTime: number; // ms
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  errorRate: number; // percentage
  consecutiveFailures: number;
}

export interface ServiceHealth {
  serviceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  uptime: number;
  responseTime: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  availability: number; // percentage
  errorRate: number; // percentage
  consecutiveFailures: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  trends: {
    responseTime: number[];
    errorRate: number[];
    availability: number[];
  };
}

export class ServiceHealthMonitor extends EventEmitter {
  private healthData: Map<string, ServiceHealth> = new Map();
  private healthChecks: Map<string, HealthCheck[]> = new Map();
  private thresholds: Map<string, HealthThresholds> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized: boolean = false;
  private globalThresholds: HealthThresholds = {
    responseTime: 5000,
    cpuUsage: 80,
    memoryUsage: 85,
    errorRate: 5,
    consecutiveFailures: 3
  };

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[🏥] ServiceHealthMonitor ya está inicializado');
      return;
    }

    console.log('[🏥] Inicializando ServiceHealthMonitor...');

    try {
      // Configurar monitoreo global
      this.setupGlobalMonitoring();
      
      this.isInitialized = true;
      console.log('[✅] ServiceHealthMonitor inicializado correctamente');
      this.emit('initialized');
    } catch (error) {
      console.error('[❌] Error inicializando ServiceHealthMonitor:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private setupGlobalMonitoring(): void {
    // Monitoreo de memoria del sistema
    setInterval(() => {
      this.checkSystemHealth();
    }, 60000); // Cada minuto

    // Limpieza de datos antiguos
    setInterval(() => {
      this.cleanupOldData();
    }, 300000); // Cada 5 minutos
  }

  private checkSystemHealth(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
      console.warn('[⚠️] Uso de memoria crítico detectado');
      this.emit('system-warning', 'memory', {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      });
    }
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [serviceId, checks] of this.healthChecks.entries()) {
      const filteredChecks = checks.filter(check => 
        now - check.timestamp.getTime() < maxAge
      );
      this.healthChecks.set(serviceId, filteredChecks);
    }
  }

  startMonitoring(serviceId: string, interval: number = 30000): void {
    if (this.monitoringIntervals.has(serviceId)) {
      console.log(`[🏥] Monitoreo ya activo para ${serviceId}`);
      return;
    }

    console.log(`[🏥] Iniciando monitoreo para ${serviceId}`);

    const healthInterval = setInterval(async () => {
      try {
        await this.performHealthCheck(serviceId);
      } catch (error) {
        console.error(`[❌] Error en health check de ${serviceId}:`, error);
      }
    }, interval);

    this.monitoringIntervals.set(serviceId, healthInterval);
  }

  stopMonitoring(serviceId: string): void {
    const interval = this.monitoringIntervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(serviceId);
      console.log(`[🏥] Monitoreo detenido para ${serviceId}`);
    }
  }

  async performHealthCheck(serviceId: string): Promise<HealthCheck> {
    const startTime = Date.now();
    const check: HealthCheck = {
      serviceId,
      timestamp: new Date(),
      status: 'success',
      responseTime: 0,
      metrics: {
        cpu: 0,
        memory: 0,
        network: 0,
        disk: 0
      }
    };

    try {
      // Simular health check
      await this.simulateHealthCheck(serviceId);
      
      check.responseTime = Date.now() - startTime;
      check.metrics = this.generateMetrics();
      
      // Verificar umbrales
      const thresholds = this.thresholds.get(serviceId) || this.globalThresholds;
      if (check.responseTime > thresholds.responseTime) {
        check.status = 'timeout';
      }
    } catch (error) {
      check.status = 'failure';
      check.error = error.message;
      check.responseTime = Date.now() - startTime;
    }

    // Almacenar check
    this.storeHealthCheck(serviceId, check);
    
    // Actualizar salud del servicio
    this.updateServiceHealth(serviceId, check);

    return check;
  }

  private async simulateHealthCheck(serviceId: string): Promise<void> {
    // Simular diferentes tipos de servicios
    const serviceTypes = {
      'blockchain-service': () => this.simulateBlockchainHealth(),
      'audio-service': () => this.simulateAudioHealth(),
      'ai-service': () => this.simulateAIHealth()
    };

    const simulator = serviceTypes[serviceId as keyof typeof serviceTypes];
    if (simulator) {
      await simulator();
    } else {
      // Health check genérico
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    }
  }

  private async simulateBlockchainHealth(): Promise<void> {
    // Simular verificación de conexión blockchain
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Simular fallo ocasional
    if (Math.random() < 0.05) {
      throw new Error('Blockchain connection timeout');
    }
  }

  private async simulateAudioHealth(): Promise<void> {
    // Simular verificación de audio
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simular fallo ocasional
    if (Math.random() < 0.03) {
      throw new Error('Audio context not available');
    }
  }

  private async simulateAIHealth(): Promise<void> {
    // Simular verificación de IA
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
    
    // Simular fallo ocasional
    if (Math.random() < 0.07) {
      throw new Error('AI model loading failed');
    }
  }

  private generateMetrics(): HealthCheck['metrics'] {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100,
      disk: Math.random() * 100
    };
  }

  private storeHealthCheck(serviceId: string, check: HealthCheck): void {
    if (!this.healthChecks.has(serviceId)) {
      this.healthChecks.set(serviceId, []);
    }
    
    this.healthChecks.get(serviceId)!.push(check);
    
    // Mantener solo los últimos 100 checks
    const checks = this.healthChecks.get(serviceId)!;
    if (checks.length > 100) {
      checks.splice(0, checks.length - 100);
    }
  }

  private updateServiceHealth(serviceId: string, check: HealthCheck): void {
    let health = this.healthData.get(serviceId);
    
    if (!health) {
      health = {
        serviceId,
        status: 'unhealthy',
        lastCheck: new Date(),
        uptime: 0,
        responseTime: { current: 0, average: 0, min: 0, max: 0 },
        availability: 0,
        errorRate: 0,
        consecutiveFailures: 0,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        trends: {
          responseTime: [],
          errorRate: [],
          availability: []
        }
      };
      this.healthData.set(serviceId, health);
    }

    // Actualizar métricas
    health.lastCheck = check.timestamp;
    health.totalChecks++;
    
    if (check.status === 'success') {
      health.successfulChecks++;
      health.consecutiveFailures = 0;
    } else {
      health.failedChecks++;
      health.consecutiveFailures++;
    }

    // Calcular métricas
    health.responseTime.current = check.responseTime;
    health.availability = (health.successfulChecks / health.totalChecks) * 100;
    health.errorRate = (health.failedChecks / health.totalChecks) * 100;

    // Calcular estadísticas de response time
    const checks = this.healthChecks.get(serviceId) || [];
    const responseTimes = checks.map(c => c.responseTime);
    health.responseTime.average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    health.responseTime.min = Math.min(...responseTimes);
    health.responseTime.max = Math.max(...responseTimes);

    // Actualizar tendencias
    this.updateTrends(health);

    // Determinar estado de salud
    const thresholds = this.thresholds.get(serviceId) || this.globalThresholds;
    const newStatus = this.determineHealthStatus(health, thresholds);
    
    if (newStatus !== health.status) {
      health.status = newStatus;
      this.emit('health-change', serviceId, newStatus);
    }

    this.emit('health-updated', serviceId, health);
  }

  private updateTrends(health: ServiceHealth): void {
    const checks = this.healthChecks.get(health.serviceId) || [];
    const recentChecks = checks.slice(-10); // Últimos 10 checks

    // Tendencia de response time
    const responseTimes = recentChecks.map(c => c.responseTime);
    health.trends.responseTime = responseTimes;

    // Tendencia de error rate
    const errorRates = recentChecks.map(c => c.status === 'success' ? 0 : 100);
    health.trends.errorRate = errorRates;

    // Tendencia de disponibilidad
    const availability = recentChecks.map(c => c.status === 'success' ? 100 : 0);
    health.trends.availability = availability;
  }

  private determineHealthStatus(health: ServiceHealth, thresholds: HealthThresholds): 'healthy' | 'degraded' | 'unhealthy' {
    if (health.consecutiveFailures >= thresholds.consecutiveFailures) {
      return 'unhealthy';
    }

    if (health.errorRate > thresholds.errorRate || 
        health.responseTime.average > thresholds.responseTime) {
      return 'degraded';
    }

    return 'healthy';
  }

  setThresholds(serviceId: string, thresholds: Partial<HealthThresholds>): void {
    const current = this.thresholds.get(serviceId) || { ...this.globalThresholds };
    this.thresholds.set(serviceId, { ...current, ...thresholds });
  }

  getServiceHealth(serviceId: string): ServiceHealth | undefined {
    return this.healthData.get(serviceId);
  }

  getAllHealthData(): ServiceHealth[] {
    return Array.from(this.healthData.values());
  }

  getHealthStats(): any {
    const total = this.healthData.size;
    const healthy = Array.from(this.healthData.values()).filter(h => h.status === 'healthy').length;
    const degraded = Array.from(this.healthData.values()).filter(h => h.status === 'degraded').length;
    const unhealthy = Array.from(this.healthData.values()).filter(h => h.status === 'unhealthy').length;

    return {
      total,
      healthy,
      degraded,
      unhealthy,
      averageAvailability: Array.from(this.healthData.values())
        .reduce((sum, h) => sum + h.availability, 0) / total || 0,
      averageResponseTime: Array.from(this.healthData.values())
        .reduce((sum, h) => sum + h.responseTime.average, 0) / total || 0,
      monitoredServices: Array.from(this.monitoringIntervals.keys())
    };
  }

  async cleanup(): Promise<void> {
    console.log('[🏥] Limpiando ServiceHealthMonitor...');

    // Detener todos los intervalos de monitoreo
    for (const interval of this.monitoringIntervals.values()) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();

    // Limpiar datos
    this.healthData.clear();
    this.healthChecks.clear();
    this.thresholds.clear();
    this.isInitialized = false;

    console.log('[✅] ServiceHealthMonitor limpiado correctamente');
  }
}

export default ServiceHealthMonitor; 