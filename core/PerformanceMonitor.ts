/**
 * PerformanceMonitor - Monitor de Rendimiento
 * Gestiona métricas de rendimiento del sistema modular
 * 
 * Responsabilidades:
 * - Monitoreo de tiempo de carga de módulos
 * - Seguimiento de uso de memoria
 * - Métricas de comunicación inter-módulo
 * - Alertas de rendimiento
 * - Generación de reportes de rendimiento
 */

import { PerformanceMetrics, SystemStats } from './types/core';

export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();
  private systemMetrics = new Map<string, number[]>();
  private alerts = new Map<string, { message: string; timestamp: Date; severity: 'low' | 'medium' | 'high' }[]>();
  private startTime = Date.now();
  private maxMetricsHistory = 1000;
  private alertThresholds = {
    loadTime: 5000, // 5 segundos
    memoryUsage: 100 * 1024 * 1024, // 100 MB
    responseTime: 1000, // 1 segundo
    errorRate: 0.1 // 10%
  };

  constructor() {
    this.initializeSystemMetrics();
  }

  /**
   * Inicializa métricas del sistema
   */
  private initializeSystemMetrics(): void {
    this.systemMetrics.set('loadTime', []);
    this.systemMetrics.set('memoryUsage', []);
    this.systemMetrics.set('responseTime', []);
    this.systemMetrics.set('errorRate', []);
    this.systemMetrics.set('throughput', []);
  }

  /**
   * Registra una métrica específica
   */
  recordMetric(metricName: string, value: number, moduleName?: string): void {
    const timestamp = new Date();
    
    // Registrar métrica del módulo si se especifica
    if (moduleName) {
      if (!this.metrics.has(moduleName)) {
        this.metrics.set(moduleName, {
          loadTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          responseTime: 0,
          errorRate: 0,
          throughput: 0,
          lastUpdated: timestamp
        });
      }
      
      const moduleMetrics = this.metrics.get(moduleName)!;
      if (metricName !== 'lastUpdated') {
        (moduleMetrics as any)[metricName] = value;
      }
      moduleMetrics.lastUpdated = timestamp;
    }
    
    // Registrar métrica del sistema
    if (this.systemMetrics.has(metricName)) {
      const history = this.systemMetrics.get(metricName)!;
      history.push(value);
      
      // Limitar historial
      if (history.length > this.maxMetricsHistory) {
        history.shift();
      }
    }
    
    // Verificar alertas
    this.checkAlertThresholds(metricName, value, moduleName);
  }

  /**
   * Registra métricas de rendimiento de un módulo
   */
  recordModuleMetrics(moduleName: string, metrics: Partial<PerformanceMetrics>): void {
    const timestamp = new Date();
    
    if (!this.metrics.has(moduleName)) {
      this.metrics.set(moduleName, {
        loadTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        lastUpdated: timestamp
      });
    }
    
    const moduleMetrics = this.metrics.get(moduleName)!;
    Object.assign(moduleMetrics, metrics);
    moduleMetrics.lastUpdated = timestamp;
    
    // Registrar métricas individuales en el sistema
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        this.recordMetric(key, value, moduleName);
      }
    });
  }

  /**
   * Verifica umbrales de alerta
   */
  private checkAlertThresholds(metricName: string, value: number, moduleName?: string): void {
    const threshold = this.alertThresholds[metricName as keyof typeof this.alertThresholds];
    
    if (threshold && value > threshold) {
      const severity = this.calculateAlertSeverity(value, threshold);
      const message = `${metricName} excedió el umbral: ${value} > ${threshold}`;
      
      this.addAlert(moduleName || 'system', message, severity);
    }
  }

  /**
   * Calcula la severidad de una alerta
   */
  private calculateAlertSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' {
    const ratio = value / threshold;
    
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  /**
   * Agrega una alerta
   */
  private addAlert(moduleName: string, message: string, severity: 'low' | 'medium' | 'high'): void {
    if (!this.alerts.has(moduleName)) {
      this.alerts.set(moduleName, []);
    }
    
    const moduleAlerts = this.alerts.get(moduleName)!;
    moduleAlerts.push({
      message,
      timestamp: new Date(),
      severity
    });
    
    // Limitar alertas por módulo
    if (moduleAlerts.length > 100) {
      moduleAlerts.shift();
    }
    
    // Log de alertas críticas
    if (severity === 'high') {
      console.error(`🚨 ALERTA CRÍTICA [${moduleName}]: ${message}`);
    } else if (severity === 'medium') {
      console.warn(`⚠️ ALERTA [${moduleName}]: ${message}`);
    }
  }

  /**
   * Obtiene métricas de un módulo específico
   */
  getModuleMetrics(moduleName: string): PerformanceMetrics | null {
    return this.metrics.get(moduleName) || null;
  }

  /**
   * Obtiene todas las métricas de módulos
   */
  getAllModuleMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Obtiene métricas del sistema
   */
  getSystemMetrics(): any {
    const systemStats: any = {};
    
    for (const [metricName, history] of this.systemMetrics.entries()) {
      if (history.length > 0) {
        systemStats[metricName] = {
          current: history[history.length - 1],
          average: this.calculateAverage(history),
          min: Math.min(...history),
          max: Math.max(...history),
          trend: this.calculateTrend(history)
        };
      }
    }
    
    return systemStats;
  }

  /**
   * Calcula el promedio de un array de números
   */
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Calcula la tendencia de un array de números
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-10); // Últimos 10 valores
    const older = values.slice(-20, -10); // 10 valores anteriores
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Obtiene alertas de un módulo
   */
  getModuleAlerts(moduleName: string): any[] {
    return this.alerts.get(moduleName) || [];
  }

  /**
   * Obtiene todas las alertas
   */
  getAllAlerts(): Map<string, any[]> {
    return new Map(this.alerts);
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getStats(): SystemStats {
    const totalModules = this.metrics.size;
    const activeModules = Array.from(this.metrics.values())
      .filter(metrics => Date.now() - metrics.lastUpdated.getTime() < 300000).length; // 5 minutos
    
    const systemMetrics = this.getSystemMetrics();
    
    return {
      totalModules,
      activeModules,
      totalUsers: 0, // Implementar cuando se agregue gestión de usuarios
      activeUsers: 0,
      totalComponents: 0, // Implementar cuando se agregue registro de componentes
      registeredComponents: 0,
      languages: {}, // Implementar cuando se agregue tracking de lenguajes
      performance: {
        averageLoadTime: systemMetrics.loadTime?.average || 0,
        averageMemoryUsage: systemMetrics.memoryUsage?.average || 0,
        errorRate: systemMetrics.errorRate?.average || 0,
        throughput: systemMetrics.throughput?.average || 0
      },
      uptime: Date.now() - this.startTime,
      lastUpdated: new Date()
    };
  }

  /**
   * Genera un reporte de rendimiento
   */
  generatePerformanceReport(): any {
    const stats = this.getStats();
    const systemMetrics = this.getSystemMetrics();
    const alerts = this.getAllAlerts();
    
    const totalAlerts = Array.from(alerts.values())
      .reduce((sum, moduleAlerts) => sum + moduleAlerts.length, 0);
    
    const criticalAlerts = Array.from(alerts.values())
      .flat()
      .filter(alert => alert.severity === 'high').length;
    
    return {
      timestamp: new Date(),
      uptime: stats.uptime,
      systemMetrics,
      moduleMetrics: Object.fromEntries(this.metrics),
      alerts: {
        total: totalAlerts,
        critical: criticalAlerts,
        byModule: Object.fromEntries(alerts)
      },
      recommendations: this.generateRecommendations(systemMetrics, stats)
    };
  }

  /**
   * Genera recomendaciones basadas en métricas
   */
  private generateRecommendations(systemMetrics: any, stats: SystemStats): string[] {
    const recommendations: string[] = [];
    
    // Recomendaciones basadas en tiempo de carga
    if (systemMetrics.loadTime?.average > 2000) {
      recommendations.push('Considerar optimización de carga de módulos');
    }
    
    // Recomendaciones basadas en uso de memoria
    if (systemMetrics.memoryUsage?.average > 50 * 1024 * 1024) { // 50 MB
      recommendations.push('Revisar gestión de memoria en módulos');
    }
    
    // Recomendaciones basadas en tasa de errores
    if (systemMetrics.errorRate?.average > 0.05) { // 5%
      recommendations.push('Investigar y corregir errores frecuentes');
    }
    
    // Recomendaciones basadas en throughput
    if (systemMetrics.throughput?.average < 100) {
      recommendations.push('Optimizar rendimiento general del sistema');
    }
    
    return recommendations;
  }

  /**
   * Limpia métricas antiguas
   */
  cleanup(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    
    // Limpiar métricas de módulos inactivos
    for (const [moduleName, metrics] of this.metrics.entries()) {
      if (Date.now() - metrics.lastUpdated.getTime() > cutoffTime) {
        this.metrics.delete(moduleName);
      }
    }
    
    // Limpiar alertas antiguas
    for (const [moduleName, moduleAlerts] of this.alerts.entries()) {
      const recentAlerts = moduleAlerts.filter(
        alert => Date.now() - alert.timestamp.getTime() < cutoffTime
      );
      this.alerts.set(moduleName, recentAlerts);
    }
    
    console.log('🧹 Métricas de rendimiento limpiadas');
  }

  /**
   * Resetea todas las métricas
   */
  reset(): void {
    this.metrics.clear();
    this.systemMetrics.clear();
    this.alerts.clear();
    this.startTime = Date.now();
    this.initializeSystemMetrics();
    
    console.log('🔄 Métricas de rendimiento reseteadas');
  }
} 