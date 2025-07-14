/**
 * 🌐 CentralModuleCoordinator - Cerebro del Sistema de Instanciación Dinámica
 * 
 * Responsabilidades:
 * - Registro automático de módulos desde carpetas especializadas
 * - Carga inteligente por grupos funcionales
 * - Gestión de dependencias entre módulos
 * - Coordinación de comunicación inter-módulo
 * - Optimización de recursos por usuario
 */

import { ModuleWrapper, ModulePublicAPI, ModuleInstance } from '../@types/core/module.d';
import { InterModuleMessageBus } from './InterModuleMessageBus';
import { ModuleGroups } from './ModuleGroups';

// ===== CONTINUACIÓN: SISTEMA AVANZADO DE GESTIÓN DE MÓDULOS =====

/**
 * Sistema de monitoreo de rendimiento y métricas
 */
class PerformanceMonitor {
  private metrics = new Map<string, {
    loadTime: number;
    memoryUsage: number;
    errorCount: number;
    lastAccess: Date;
  }>();

  recordModuleLoad(moduleName: string, loadTime: number): void {
    const existing = this.metrics.get(moduleName) || {
      loadTime: 0,
      memoryUsage: 0,
      errorCount: 0,
      lastAccess: new Date()
    };

    this.metrics.set(moduleName, {
      ...existing,
      loadTime: (existing.loadTime + loadTime) / 2, // Promedio móvil
      lastAccess: new Date()
    });
  }

  recordError(moduleName: string): void {
    const existing = this.metrics.get(moduleName);
    if (existing) {
      existing.errorCount++;
      existing.lastAccess = new Date();
    }
  }

  getModulePerformance(moduleName: string): any {
    return this.metrics.get(moduleName);
  }

  getSystemHealth(): {
    healthyModules: number;
    problematicModules: string[];
    averageLoadTime: number;
  } {
    const modules = Array.from(this.metrics.entries());
    const healthyModules = modules.filter(([_, metrics]) => metrics.errorCount < 3).length;
    const problematicModules = modules
      .filter(([_, metrics]) => metrics.errorCount >= 3)
      .map(([name, _]) => name);
    const averageLoadTime = modules.reduce((sum, [_, metrics]) => sum + metrics.loadTime, 0) / modules.length;

    return {
      healthyModules,
      problematicModules,
      averageLoadTime
    };
  }
}

/**
 * Sistema de fallback y recuperación
 */
class FallbackSystem {
  private fallbackModules = new Map<string, ModuleWrapper>();
  private recoveryStrategies = new Map<string, () => Promise<void>>();

  registerFallback(moduleName: string, fallbackModule: ModuleWrapper): void {
    this.fallbackModules.set(moduleName, fallbackModule);
  }

  registerRecoveryStrategy(moduleName: string, strategy: () => Promise<void>): void {
    this.recoveryStrategies.set(moduleName, strategy);
  }

  async attemptRecovery(moduleName: string): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(moduleName);
    if (strategy) {
      try {
        await strategy();
        return true;
      } catch (error) {
        console.error(`[❌] Estrategia de recuperación falló para ${moduleName}:`, error);
        return false;
      }
    }
    return false;
  }

  getFallbackModule(moduleName: string): ModuleWrapper | undefined {
    return this.fallbackModules.get(moduleName);
  }
}

/**
 * Sistema de caché inteligente
 */
class ModuleCache {
  private cache = new Map<string, {
    module: ModuleWrapper;
    lastAccess: Date;
    size: number;
  }>();

  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private currentSize = 0;

  set(moduleName: string, module: ModuleWrapper, size: number = 1024): void {
    // Verificar si hay espacio suficiente
    while (this.currentSize + size > this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(moduleName, {
      module,
      lastAccess: new Date(),
      size
    });
    this.currentSize += size;
  }

  get(moduleName: string): ModuleWrapper | undefined {
    const cached = this.cache.get(moduleName);
    if (cached) {
      cached.lastAccess = new Date();
      return cached.module;
    }
    return undefined;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = new Date();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccess < oldestTime) {
        oldestTime = value.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const removed = this.cache.get(oldestKey);
      if (removed) {
        this.currentSize -= removed.size;
        this.cache.delete(oldestKey);
      }
    }
  }

  getCacheStats(): {
    size: number;
    itemCount: number;
    hitRate: number;
  } {
    return {
      size: this.currentSize,
      itemCount: this.cache.size,
      hitRate: 0.85 // Placeholder - implementar tracking real
    };
  }
}

// ===== EXTENSIÓN DEL CENTRAL MODULE COORDINATOR =====

export class CentralModuleCoordinator {
  private static instance: CentralModuleCoordinator;
  private modules = new Map<string, ModuleWrapper>();
  private instances = new Map<string, ModuleInstance>();
  private userActiveModules = new Map<string, Set<string>>();
  private messageBus: InterModuleMessageBus;
  private loadingPromises = new Map<string, Promise<void>>();
  private performanceMonitor: PerformanceMonitor;
  private fallbackSystem: FallbackSystem;
  private moduleCache: ModuleCache;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.messageBus = new InterModuleMessageBus();
    this.performanceMonitor = new PerformanceMonitor();
    this.fallbackSystem = new FallbackSystem();
    this.moduleCache = new ModuleCache();
    this.startHealthMonitoring();
  }

  static getInstance(): CentralModuleCoordinator {
    if (!CentralModuleCoordinator.instance) {
      CentralModuleCoordinator.instance = new CentralModuleCoordinator();
    }
    return CentralModuleCoordinator.instance;
  }

  /**
   * Carga optimizada de módulos con caché y fallback
   */
  async loadModuleOptimized(moduleName: string, userId: string): Promise<ModuleWrapper> {
    const startTime = performance.now();

    // Verificar caché primero
    const cached = this.moduleCache.get(moduleName);
    if (cached) {
      this.performanceMonitor.recordModuleLoad(moduleName, performance.now() - startTime);
      return cached;
    }

    // Intentar cargar el módulo principal
    try {
      const module = await this.loadModule(moduleName, userId);
      this.moduleCache.set(moduleName, module, 1024);
      this.performanceMonitor.recordModuleLoad(moduleName, performance.now() - startTime);
      return module;
    } catch (error) {
      // Intentar fallback
      const fallback = this.fallbackSystem.getFallbackModule(moduleName);
      if (fallback) {
        console.log(`[🔄] Usando módulo fallback para ${moduleName}`);
        return fallback;
      }
      throw error;
    }
  }

  /**
   * Obtiene estadísticas detalladas del sistema
   */
  getDetailedStats(): {
    basic: any;
    performance: any;
    cache: any;
    health: any;
  } {
    return {
      basic: this.getSystemStats(),
      performance: this.performanceMonitor.getSystemHealth(),
      cache: this.moduleCache.getCacheStats(),
      health: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        activeConnections: this.userActiveModules.size
      }
    };
  }

  /**
   * Registra un módulo de fallback
   */
  registerModuleFallback(moduleName: string, fallbackModule: ModuleWrapper): void {
    this.fallbackSystem.registerFallback(moduleName, fallbackModule);
  }

  /**
   * Registra una estrategia de recuperación
   */
  registerRecoveryStrategy(moduleName: string, strategy: () => Promise<void>): void {
    this.fallbackSystem.registerRecoveryStrategy(moduleName, strategy);
  }

  /**
   * Limpieza completa del sistema
   */
  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Limpiar todos los usuarios
    const userIds = Array.from(this.userActiveModules.keys());
    await Promise.all(userIds.map(userId => this.cleanupUserModules(userId)));

    // Limpiar instancias
    this.instances.clear();
    this.modules.clear();
    this.userActiveModules.clear();
    this.loadingPromises.clear();

    console.log(`[🧹] Sistema limpiado completamente`);
  }
}

// ===== SISTEMA DE MONITOREO AVANZADO =====

/**
 * Monitor de recursos del sistema
 */
class SystemResourceMonitor {
  private metrics = new Map<string, {
    cpuUsage: number;
    memoryUsage: number;
    timestamp: Date;
  }>();

  recordMetrics(moduleName: string, cpuUsage: number, memoryUsage: number): void {
    this.metrics.set(moduleName, {
      cpuUsage,
      memoryUsage,
      timestamp: new Date()
    });
  }

  getResourceUsage(moduleName: string): any {
    return this.metrics.get(moduleName);
  }

  getSystemResources(): {
    totalCpu: number;
    totalMemory: number;
    averageCpu: number;
    averageMemory: number;
  } {
    const modules = Array.from(this.metrics.values());
    const totalCpu = modules.reduce((sum, m) => sum + m.cpuUsage, 0);
    const totalMemory = modules.reduce((sum, m) => sum + m.memoryUsage, 0);
    const averageCpu = totalCpu / modules.length;
    const averageMemory = totalMemory / modules.length;

    return {
      totalCpu,
      totalMemory,
      averageCpu,
      averageMemory
    };
  }
}

/**
 * Sistema de alertas y notificaciones
 */
class AlertSystem {
  private alerts = new Map<string, {
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>();

  createAlert(moduleName: string, type: 'warning' | 'error' | 'info', message: string): void {
    this.alerts.set(`${moduleName}-${Date.now()}`, {
      type,
      message,
      timestamp: new Date(),
      resolved: false
    });
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  getActiveAlerts(): Array<{ id: string; alert: any }> {
    return Array.from(this.alerts.entries())
      .filter(([_, alert]) => !alert.resolved)
      .map(([id, alert]) => ({ id, alert }));
  }
}

// ===== EXTENSIÓN FINAL DEL COORDINADOR =====

// Añadir los nuevos sistemas al coordinador principal
const coordinator = CentralModuleCoordinator.getInstance();
const resourceMonitor = new SystemResourceMonitor();
const alertSystem = new AlertSystem();

// Exportar instancias para uso global
export { coordinator, resourceMonitor, alertSystem };
export default CentralModuleCoordinator; 