/**
 * Definiciones de tipos para el sistema de módulos core
 * WoldVirtual3DlucIA v0.6.0
 */

// Tipos para el sistema de módulos core
export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  peerDependencies: string[];
  optionalDependencies: string[];
  category: ModuleCategory;
  priority: ModulePriority;
  status: ModuleStatus;
  createdAt: number;
  updatedAt: number;
  size: number;
  entryPoint: string;
  exports: string[];
  configSchema: any;
  permissions: ModulePermission[];
}

export type ModuleCategory = 
  | 'CORE' 
  | 'FRONTEND' 
  | 'BACKEND' 
  | 'BLOCKCHAIN' 
  | 'AI' 
  | 'GAMING' 
  | 'MEDIA' 
  | 'BUSINESS' 
  | 'DEVELOPMENT' 
  | 'UTILITY';

export type ModulePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ModuleStatus = 'INACTIVE' | 'LOADING' | 'ACTIVE' | 'ERROR' | 'DEPRECATED';

export interface ModulePermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface ModuleConfig {
  id: string;
  enabled: boolean;
  autoLoad: boolean;
  dependencies: string[];
  settings: Record<string, any>;
  environment: string;
  version: string;
}

export interface ModuleInstance {
  id: string;
  metadata: ModuleMetadata;
  config: ModuleConfig;
  instance: any;
  status: ModuleStatus;
  loadTime: number;
  memoryUsage: number;
  errorCount: number;
  lastError?: Error;
  health: ModuleHealth;
}

export interface ModuleHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  lastCheck: number;
  metrics: ModuleMetrics;
}

export interface ModuleMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

export interface ModuleWrapper {
  id: string;
  metadata: ModuleMetadata;
  config: ModuleConfig;
  instance: any;
  status: ModuleStatus;
  loadTime: number;
  errorCount: number;
  lastError?: Error;
  health: ModuleHealth;
  methods: ModuleMethod[];
  events: ModuleEvent[];
  dependencies: ModuleDependency[];
}

export interface ModuleMethod {
  name: string;
  signature: string;
  description: string;
  parameters: ModuleParameter[];
  returnType: string;
  isAsync: boolean;
  isPublic: boolean;
  permissions: string[];
}

export interface ModuleParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface ModuleEvent {
  name: string;
  description: string;
  payload: any;
  isPublic: boolean;
  subscribers: number;
}

export interface ModuleDependency {
  id: string;
  version: string;
  type: 'required' | 'optional' | 'peer';
  status: 'satisfied' | 'missing' | 'conflict';
  resolvedVersion?: string;
}

export interface ModulePublicAPI {
  id: string;
  methods: ModuleMethod[];
  events: ModuleEvent[];
  properties: ModuleProperty[];
  version: string;
  documentation: string;
}

export interface ModuleProperty {
  name: string;
  type: string;
  description: string;
  isReadOnly: boolean;
  isPublic: boolean;
  value?: any;
}

export interface ModuleRegistry {
  modules: Map<string, ModuleWrapper>;
  dependencies: Map<string, string[]>;
  loadOrder: string[];
  circularDependencies: string[][];
  conflicts: ModuleConflict[];
}

export interface ModuleConflict {
  moduleId: string;
  conflictingModules: string[];
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModuleLoader {
  registry: ModuleRegistry;
  loadQueue: string[];
  loadedModules: Set<string>;
  failedModules: Map<string, Error>;
  loadTimeouts: Map<string, NodeJS.Timeout>;
}

export interface ModuleValidator {
  validateMetadata(metadata: ModuleMetadata): ValidationResult;
  validateConfig(config: ModuleConfig): ValidationResult;
  validateDependencies(dependencies: string[]): ValidationResult;
  checkCircularDependencies(modules: ModuleWrapper[]): string[][];
  checkConflicts(modules: ModuleWrapper[]): ModuleConflict[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

export interface ModuleManager {
  registry: ModuleRegistry;
  loader: ModuleLoader;
  validator: ModuleValidator;
  healthMonitor: ModuleHealthMonitor;
  eventBus: ModuleEventBus;
}

export interface ModuleHealthMonitor {
  checkHealth(moduleId: string): ModuleHealth;
  checkAllHealth(): Map<string, ModuleHealth>;
  startMonitoring(moduleId: string): void;
  stopMonitoring(moduleId: string): void;
  getMetrics(moduleId: string): ModuleMetrics;
}

export interface ModuleEventBus {
  subscribe(event: string, handler: EventHandler): SubscriptionToken;
  unsubscribe(token: SubscriptionToken): boolean;
  publish(event: string, data: any): void;
  getSubscribers(event: string): EventHandler[];
}

export type EventHandler = (data: any) => void | Promise<void>;
export type SubscriptionToken = string;

export interface ModuleLifecycle {
  onLoad?(): void | Promise<void>;
  onUnload?(): void | Promise<void>;
  onEnable?(): void | Promise<void>;
  onDisable?(): void | Promise<void>;
  onError?(error: Error): void | Promise<void>;
}

export interface ModuleContext {
  id: string;
  environment: string;
  config: Record<string, any>;
  logger: ModuleLogger;
  eventBus: ModuleEventBus;
  dependencies: Map<string, any>;
}

export interface ModuleLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
}

export interface ModuleFactory {
  create(metadata: ModuleMetadata, config: ModuleConfig, context: ModuleContext): Promise<ModuleWrapper>;
  destroy(wrapper: ModuleWrapper): Promise<void>;
  validate(metadata: ModuleMetadata): ValidationResult;
}

export interface ModuleResolver {
  resolve(id: string, version?: string): Promise<ModuleMetadata>;
  resolveDependencies(dependencies: string[]): Promise<ModuleDependency[]>;
  checkAvailability(id: string, version?: string): boolean;
}

export interface ModuleCache {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): boolean;
  clear(): void;
  has(key: string): boolean;
  size(): number;
} 