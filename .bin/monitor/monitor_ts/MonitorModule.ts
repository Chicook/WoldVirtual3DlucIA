/**
 * 📊 MonitorModule - Monitoreo de Rendimiento y Health Checks
 * 
 * Responsabilidades:
 * - Health checks del sistema
 * - Monitoreo de rendimiento
 * - Métricas y alertas
 * - Análisis de recursos
 * - Dashboard de estado
 */

import { ModuleWrapper, ModulePublicAPI, ModuleInternalAPI } from '../../../@types/core/module.d';
import { centralCoordinator } from '../../../src/core/CentralModuleCoordinator';
import { interModuleBus } from '../../../src/core/InterModuleMessageBus';
import { EventEmitter } from 'events';

// ============================================================================
// INTERFACES ESPECÍFICAS DE MONITOREO
// ============================================================================

interface MonitorConfig {
  enabled: boolean;
  checkInterval: number;
  alertThreshold: number;
  retentionDays: number;
  components: string[];
  metrics: MetricConfig[];
}

interface MetricConfig {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
  unit: string;
  threshold: number;
  enabled: boolean;
  description: string;
}

interface HealthCheck {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'database' | 'service' | 'custom';
  target: string;
  interval: number;
  timeout: number;
  enabled: boolean;
  lastCheck: Date;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime: number;
  error?: string;
}

interface PerformanceMetric {
  id: string;
  timestamp: Date;
  component: string;
  metric: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
}

interface SystemAlert {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  resolved: boolean;
  resolvedAt?: Date;
}

interface ResourceUsage {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

// ============================================================================
// CLASE PRINCIPAL DE MONITOREO
// ============================================================================

class MonitorManager extends EventEmitter {
  private config: MonitorConfig;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private metrics: PerformanceMetric[] = [];
  private alerts: SystemAlert[] = [];
  private isInitialized: boolean = false;
  private monitorTimer?: NodeJS.Timeout;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): MonitorConfig {
    return {
      enabled: true,
      checkInterval: 30000, // 30 segundos
      alertThreshold: 80, // 80%
      retentionDays: 30,
      components: ['web', 'api', 'database', 'cache', 'queue'],
      metrics: this.getDefaultMetrics()
    };
  }

  private getDefaultMetrics(): MetricConfig[] {
    return [
      {
        id: 'cpu_usage',
        name: 'CPU Usage',
        type: 'cpu',
        unit: '%',
        threshold: 80,
        enabled: true,
        description: 'CPU usage percentage'
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage',
        type: 'memory',
        unit: '%',
        threshold: 85,
        enabled: true,
        description: 'Memory usage percentage'
      },
      {
        id: 'disk_usage',
        name: 'Disk Usage',
        type: 'disk',
        unit: '%',
        threshold: 90,
        enabled: true,
        description: 'Disk usage percentage'
      },
      {
        id: 'response_time',
        name: 'Response Time',
        type: 'custom',
        unit: 'ms',
        threshold: 1000,
        enabled: true,
        description: 'API response time'
      }
    ];
  }

  async initialize(): Promise<void> {
    console.log('[📊] Initializing MonitorManager...');
    
    try {
      await this.loadConfiguration();
      await this.setupHealthChecks();
      await this.startMonitoring();
      
      this.isInitialized = true;
      console.log('[✅] MonitorManager initialized successfully');
    } catch (error) {
      console.error('[❌] Error initializing MonitorManager:', error);
      throw error;
    }
  }

  private async loadConfiguration(): Promise<void> {
    console.log('[📊] Loading monitor configuration...');
    
    // En un entorno real, cargaría desde archivo o base de datos
    this.config = this.getDefaultConfig();
  }

  private async setupHealthChecks(): Promise<void> {
    console.log('[📊] Setting up health checks...');
    
    const defaultChecks: HealthCheck[] = [
      {
        id: 'web_health',
        name: 'Web Server Health',
        type: 'http',
        target: 'http://localhost:3000/health',
        interval: 30000,
        timeout: 5000,
        enabled: true,
        lastCheck: new Date(),
        status: 'unknown',
        responseTime: 0
      },
      {
        id: 'api_health',
        name: 'API Server Health',
        type: 'http',
        target: 'http://localhost:8000/health',
        interval: 30000,
        timeout: 5000,
        enabled: true,
        lastCheck: new Date(),
        status: 'unknown',
        responseTime: 0
      },
      {
        id: 'database_health',
        name: 'Database Health',
        type: 'database',
        target: 'postgresql://localhost:5432/woldvirtual',
        interval: 60000,
        timeout: 10000,
        enabled: true,
        lastCheck: new Date(),
        status: 'unknown',
        responseTime: 0
      }
    ];

    for (const check of defaultChecks) {
      this.healthChecks.set(check.id, check);
    }
  }

  private async startMonitoring(): Promise<void> {
    console.log('[📊] Starting monitoring...');
    
    if (this.config.enabled && this.config.checkInterval > 0) {
      this.monitorTimer = setInterval(() => {
        this.performMonitoring();
      }, this.config.checkInterval);
    }
  }

  private async performMonitoring(): Promise<void> {
    console.log('[📊] Performing monitoring checks...');
    
    try {
      // Ejecutar health checks
      await this.runHealthChecks();
      
      // Recolectar métricas
      await this.collectMetrics();
      
      // Verificar alertas
      await this.checkAlerts();
      
      console.log('[✅] Monitoring cycle completed');
    } catch (error) {
      console.error('[❌] Monitoring cycle failed:', error);
    }
  }

  private async runHealthChecks(): Promise<void> {
    console.log('[🏥] Running health checks...');
    
    for (const [id, check] of this.healthChecks) {
      if (check.enabled) {
        await this.executeHealthCheck(check);
      }
    }
  }

  private async executeHealthCheck(check: HealthCheck): Promise<void> {
    const startTime = Date.now();
    
    try {
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let error: string | undefined;
      
      switch (check.type) {
        case 'http':
          const result = await this.checkHttpEndpoint(check.target, check.timeout);
          status = result.status;
          error = result.error;
          break;
          
        case 'database':
          const dbResult = await this.checkDatabase(check.target, check.timeout);
          status = dbResult.status;
          error = dbResult.error;
          break;
          
        default:
          status = 'unknown';
          error = 'Unsupported check type';
      }
      
      const responseTime = Date.now() - startTime;
      
      // Actualizar health check
      check.lastCheck = new Date();
      check.status = status;
      check.responseTime = responseTime;
      check.error = error;
      
      // Emitir evento
      this.emit('healthCheckCompleted', check);
      
      // Crear alerta si es necesario
      if (status === 'critical') {
        await this.createAlert('critical', check.name, `Health check failed: ${error}`, check.id);
      }
      
    } catch (error) {
      check.status = 'critical';
      check.error = error.message;
      check.responseTime = Date.now() - startTime;
      
      await this.createAlert('critical', check.name, `Health check error: ${error.message}`, check.id);
    }
  }

  private async checkHttpEndpoint(url: string, timeout: number): Promise<{ status: 'healthy' | 'warning' | 'critical'; error?: string }> {
    // Simular verificación HTTP
    const responseTime = Math.random() * 2000; // 0-2000ms
    
    if (responseTime < 500) {
      return { status: 'healthy' };
    } else if (responseTime < 1000) {
      return { status: 'warning', error: 'Slow response time' };
    } else {
      return { status: 'critical', error: 'Timeout or error' };
    }
  }

  private async checkDatabase(connectionString: string, timeout: number): Promise<{ status: 'healthy' | 'warning' | 'critical'; error?: string }> {
    // Simular verificación de base de datos
    const isHealthy = Math.random() > 0.1; // 90% de probabilidad de estar saludable
    
    if (isHealthy) {
      return { status: 'healthy' };
    } else {
      return { status: 'critical', error: 'Database connection failed' };
    }
  }

  private async collectMetrics(): Promise<void> {
    console.log('[📈] Collecting metrics...');
    
    const resourceUsage = await this.getResourceUsage();
    
    // Crear métricas de recursos
    const metrics: PerformanceMetric[] = [
      {
        id: `metric_${Date.now()}_001`,
        timestamp: new Date(),
        component: 'system',
        metric: 'cpu_usage',
        value: resourceUsage.cpu.usage,
        unit: '%',
        tags: { type: 'system' }
      },
      {
        id: `metric_${Date.now()}_002`,
        timestamp: new Date(),
        component: 'system',
        metric: 'memory_usage',
        value: resourceUsage.memory.usage,
        unit: '%',
        tags: { type: 'system' }
      },
      {
        id: `metric_${Date.now()}_003`,
        timestamp: new Date(),
        component: 'system',
        metric: 'disk_usage',
        value: resourceUsage.disk.usage,
        unit: '%',
        tags: { type: 'system' }
      }
    ];
    
    this.metrics.push(...metrics);
    
    // Limpiar métricas antiguas
    this.cleanupOldMetrics();
  }

  private async getResourceUsage(): Promise<ResourceUsage> {
    // Simular obtención de uso de recursos
    return {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
      },
      memory: {
        total: 16384, // 16GB
        used: Math.random() * 16384,
        available: Math.random() * 16384,
        usage: Math.random() * 100
      },
      disk: {
        total: 1000000, // 1TB
        used: Math.random() * 1000000,
        available: Math.random() * 1000000,
        usage: Math.random() * 100
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000
      }
    };
  }

  private async checkAlerts(): Promise<void> {
    console.log('[🚨] Checking for alerts...');
    
    // Verificar métricas contra umbrales
    for (const metricConfig of this.config.metrics) {
      if (metricConfig.enabled) {
        const recentMetrics = this.metrics
          .filter(m => m.metric === metricConfig.id)
          .slice(-10); // Últimas 10 métricas
        
        if (recentMetrics.length > 0) {
          const avgValue = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
          
          if (avgValue > metricConfig.threshold) {
            await this.createAlert(
              'warning',
              metricConfig.name,
              `${metricConfig.name} exceeded threshold: ${avgValue.toFixed(2)}${metricConfig.unit} > ${metricConfig.threshold}${metricConfig.unit}`,
              metricConfig.id,
              avgValue,
              metricConfig.threshold
            );
          }
        }
      }
    }
  }

  private async createAlert(
    severity: 'info' | 'warning' | 'error' | 'critical',
    component: string,
    message: string,
    metric?: string,
    value?: number,
    threshold?: number
  ): Promise<void> {
    const alert: SystemAlert = {
      id: `alert_${Date.now()}`,
      timestamp: new Date(),
      severity,
      component,
      message,
      metric,
      value,
      threshold,
      resolved: false
    };
    
    this.alerts.push(alert);
    this.emit('alertCreated', alert);
    
    console.log(`[🚨] Alert created: ${severity} - ${component} - ${message}`);
  }

  private cleanupOldMetrics(): void {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffDate);
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  async getHealthStatus(): Promise<{ overall: string; checks: HealthCheck[] }> {
    const checks = Array.from(this.healthChecks.values());
    const criticalChecks = checks.filter(c => c.status === 'critical');
    const warningChecks = checks.filter(c => c.status === 'warning');
    
    let overall: string;
    if (criticalChecks.length > 0) {
      overall = 'critical';
    } else if (warningChecks.length > 0) {
      overall = 'warning';
    } else {
      overall = 'healthy';
    }
    
    return { overall, checks };
  }

  getMetrics(component?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    
    if (component) {
      filtered = filtered.filter(m => m.component === component);
    }
    
    return filtered.slice(-limit);
  }

  getAlerts(resolved: boolean = false, limit: number = 100): SystemAlert[] {
    return this.alerts
      .filter(a => a.resolved === resolved)
      .slice(-limit);
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alertResolved', alert);
    }
  }

  getResourceUsage(): Promise<ResourceUsage> {
    return this.getResourceUsage();
  }

  addHealthCheck(check: Omit<HealthCheck, 'id' | 'lastCheck' | 'status' | 'responseTime'>): void {
    const id = `health_${Date.now()}`;
    const newCheck: HealthCheck = {
      ...check,
      id,
      lastCheck: new Date(),
      status: 'unknown',
      responseTime: 0
    };
    
    this.healthChecks.set(id, newCheck);
  }

  removeHealthCheck(checkId: string): void {
    this.healthChecks.delete(checkId);
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  async cleanup(): Promise<void> {
    console.log('[🧹] Cleaning up MonitorManager...');
    
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    
    this.metrics = [];
    this.alerts = [];
    
    console.log('[✅] MonitorManager cleaned up');
  }
}

// ============================================================================
// INSTANCIA Y EXPORTACIÓN
// ============================================================================

const monitorManager = new MonitorManager();

export const MonitorModule: ModuleWrapper = {
  name: 'monitor',
  dependencies: ['security', 'network'],
  publicAPI: {
    getHealthStatus: () => monitorManager.getHealthStatus(),
    getMetrics: (component, limit) => monitorManager.getMetrics(component, limit),
    getAlerts: (resolved, limit) => monitorManager.getAlerts(resolved, limit),
    resolveAlert: (alertId) => monitorManager.resolveAlert(alertId),
    getResourceUsage: () => monitorManager.getResourceUsage(),
    addHealthCheck: (check) => monitorManager.addHealthCheck(check),
    removeHealthCheck: (checkId) => monitorManager.removeHealthCheck(checkId)
  },
  internalAPI: {
    manager: monitorManager
  },
  
  async initialize(userId: string): Promise<void> {
    console.log(`[📊] Initializing MonitorModule for user ${userId}...`);
    await monitorManager.initialize();
    
    // Suscribirse a eventos del message bus
    const messageBus = interModuleBus.getInstance();
    messageBus.subscribe('health-check-request', async () => {
      const status = await monitorManager.getHealthStatus();
      messageBus.publish('health-status-update', status);
    });
    
    console.log(`[✅] MonitorModule initialized for user ${userId}`);
  },
  
  async cleanup(userId: string): Promise<void> {
    console.log(`[🧹] Cleaning up MonitorModule for user ${userId}...`);
    await monitorManager.cleanup();
    console.log(`[✅] MonitorModule cleaned up for user ${userId}`);
  }
};

export default MonitorModule; 