/**
 * Core types for the Dependency Injection system
 */

export interface ILogger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error): void;
}

export interface IEventEmitter {
  on<T = any>(event: string, listener: (data: T) => void): void;
  off(event: string, listener: Function): void;
  emit<T = any>(event: string, data: T): void;
}

export interface IConfiguration {
  get<T>(key: string, defaultValue?: T): T;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
}

export interface IPerformanceMonitor {
  startTimer(name: string): void;
  endTimer(name: string): number;
  measure<T>(name: string, fn: () => T): T;
  getMetrics(): PerformanceMetrics;
}

export interface PerformanceMetrics {
  timers: Record<string, number>;
  memory: MemoryUsage;
  operations: OperationMetric[];
}

export interface MemoryUsage {
  used: number;
  total: number;
  external: number;
}

export interface OperationMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
} 