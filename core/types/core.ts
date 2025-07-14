/**
 * Tipos Core del Sistema Modular - WoldVirtual3DlucIA
 * Definiciones de interfaces para el sistema de módulos multi-lenguaje
 * 
 * Responsabilidades:
 * - Definir interfaces para módulos de diferentes lenguajes
 * - Estructurar grupos de módulos por funcionalidad
 * - Tipificar APIs públicas e internas
 * - Definir contratos de comunicación inter-módulo
 */

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * API pública que expone un módulo
 */
export interface ModulePublicAPI {
  [key: string]: any;
  getComponent?: (name: string) => any;
  getService?: (name: string) => any;
  getUtility?: (name: string) => any;
  getConfig?: (key: string) => any;
  execute?: (command: string, params?: any) => Promise<any>;
}

/**
 * API interna de un módulo (para comunicación privada)
 */
export interface ModuleInternalAPI {
  [key: string]: any;
  _initialize?: () => Promise<void>;
  _cleanup?: () => Promise<void>;
  _validate?: () => boolean;
  _getDependencies?: () => string[];
  _getLanguage?: () => string;
}

/**
 * Wrapper principal de un módulo
 */
export interface ModuleWrapper {
  name: string;
  dependencies: string[];
  publicAPI: ModulePublicAPI;
  internalAPI: ModuleInternalAPI;
  initialize: (userId: string) => Promise<void>;
  cleanup?: (userId: string) => Promise<void>;
  language?: string;
  filePath?: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  tags?: string[];
  isActive?: boolean;
  lastAccessed?: Date;
  memoryUsage?: number;
  performanceMetrics?: PerformanceMetrics;
}

/**
 * Métricas de rendimiento de un módulo
 */
export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastUpdated: Date;
}

/**
 * Instancia de un módulo para un usuario específico
 */
export interface ModuleInstance {
  moduleName: string;
  userId: string;
  instanceId: string;
  isActive: boolean;
  createdAt: Date;
  lastAccessed: Date;
  memoryUsage: number;
  performanceMetrics: PerformanceMetrics;
  customData?: Record<string, any>;
}

/**
 * Configuración de un cargador de módulos
 */
export interface ModuleLoaderConfig {
  language: string;
  extensions: string[];
  loader: (filePath: string) => Promise<ModuleWrapper | null>;
  validator?: (module: ModuleWrapper) => boolean;
  preprocessor?: (content: string) => string;
  postprocessor?: (module: ModuleWrapper) => void;
}

/**
 * Resultado de la carga de un módulo
 */
export interface ModuleLoadResult {
  success: boolean;
  module?: ModuleWrapper;
  error?: string;
  warnings?: string[];
  loadTime: number;
  dependencies?: string[];
  language: string;
}

// ============================================================================
// GRUPOS DE MÓDULOS
// ============================================================================

/**
 * Grupos de módulos organizados por funcionalidad
 * Cada grupo contiene módulos que trabajan juntos para una funcionalidad específica
 */
export const ModuleGroups = {
  // Infraestructura Core
  CORE: [
    'config', 'data', 'models', 'services', 'middlewares'
  ],
  
  // Frontend y UI
  FRONTEND: [
    'web', 'pages', 'components', 'css', 'fonts', 'public'
  ],
  
  // Blockchain y Web3
  BLOCKCHAIN: [
    'bloc', 'assets', 'entities'
  ],
  
  // Inteligencia Artificial
  AI: [
    'ini', 'js', 'test'
  ],
  
  // Utilidades y Herramientas
  UTILITIES: [
    'helpers', 'cli', 'scripts', 'lib', 'languages'
  ],
  
  // Medios y Recursos
  MEDIA: [
    'image', 'fonts', 'css', 'public'
  ],
  
  // Editor 3D
  EDITOR_3D: [
    '.bin', 'components', 'web', 'js'
  ],
  
  // Cliente Principal
  CLIENT: [
    'client', 'components', 'web', 'services'
  ],
  
  // Testing y QA
  TESTING: [
    'test', 'coverage', 'scripts'
  ],
  
  // Documentación
  DOCUMENTATION: [
    'docs', 'README', 'examples'
  ]
} as const;

/**
 * Tipos de grupos de módulos
 */
export type ModuleGroupName = keyof typeof ModuleGroups;

// ============================================================================
// COMUNICACIÓN INTER-MÓDULO
// ============================================================================

/**
 * Mensaje entre módulos
 */
export interface InterModuleMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: Date;
  priority: MessagePriority;
  retryCount: number;
  maxRetries: number;
  isResponse: boolean;
  originalMessageId?: string;
}

/**
 * Prioridad de mensajes
 */
export enum MessagePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

/**
 * Tipos de mensajes predefinidos
 */
export const MessageTypes = {
  // Gestión de módulos
  MODULE_REGISTERED: 'module-registered',
  MODULE_UNREGISTERED: 'module-unregistered',
  MODULE_LOADED: 'module-loaded',
  MODULE_UNLOADED: 'module-unloaded',
  
  // Gestión de componentes
  COMPONENT_REGISTERED: 'component-registered',
  COMPONENT_UNREGISTERED: 'component-unregistered',
  COMPONENT_REQUESTED: 'component-requested',
  COMPONENT_LOADED: 'component-loaded',
  
  // Gestión de usuarios
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  USER_MODULE_ACTIVATED: 'user-module-activated',
  USER_MODULE_DEACTIVATED: 'user-module-deactivated',
  
  // Gestión de recursos
  RESOURCE_REQUESTED: 'resource-requested',
  RESOURCE_LOADED: 'resource-loaded',
  RESOURCE_ERROR: 'resource-error',
  
  // Gestión de errores
  ERROR_OCCURRED: 'error-occurred',
  WARNING_RAISED: 'warning-raised',
  
  // Gestión de rendimiento
  PERFORMANCE_METRIC: 'performance-metric',
  MEMORY_USAGE_UPDATE: 'memory-usage-update',
  
  // Comunicación personalizada
  CUSTOM: 'custom'
} as const;

// ============================================================================
// DEPENDENCIAS Y RESOLUCIÓN
// ============================================================================

/**
 * Dependencia entre módulos
 */
export interface ModuleDependency {
  name: string;
  version: string;
  type: DependencyType;
  isOptional: boolean;
  isPeer: boolean;
  isDev: boolean;
  description?: string;
  url?: string;
}

/**
 * Tipos de dependencias
 */
export enum DependencyType {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  PEER = 'peer',
  DEV = 'dev',
  BUNDLED = 'bundled'
}

/**
 * Grafo de dependencias
 */
export interface DependencyGraph {
  nodes: Map<string, ModuleWrapper>;
  edges: Map<string, Set<string>>;
  cycles: string[][];
  levels: string[][];
  isAcyclic: boolean;
}

// ============================================================================
// CONFIGURACIÓN Y SETTINGS
// ============================================================================

/**
 * Configuración del sistema modular
 */
export interface ModularSystemConfig {
  autoDiscovery: boolean;
  lazyLoading: boolean;
  preloadCritical: boolean;
  maxConcurrentLoads: number;
  timeoutMs: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheSize: number;
  cacheTTL: number;
  performanceMonitoring: boolean;
  errorReporting: boolean;
  debugMode: boolean;
  languages: string[];
  defaultLanguage: string;
  fallbackLanguage: string;
}

/**
 * Configuración por defecto
 */
export const DEFAULT_MODULAR_CONFIG: ModularSystemConfig = {
  autoDiscovery: true,
  lazyLoading: true,
  preloadCritical: true,
  maxConcurrentLoads: 5,
  timeoutMs: 30000,
  retryAttempts: 3,
  cacheEnabled: true,
  cacheSize: 100,
  cacheTTL: 300000, // 5 minutos
  performanceMonitoring: true,
  errorReporting: true,
  debugMode: false,
  languages: ['typescript', 'python', 'go', 'rust'],
  defaultLanguage: 'typescript',
  fallbackLanguage: 'javascript'
};

// ============================================================================
// EVENTOS Y CALLBACKS
// ============================================================================

/**
 * Evento del sistema modular
 */
export interface ModularSystemEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  target?: string;
  userId?: string;
}

/**
 * Callback para eventos
 */
export type EventCallback = (event: ModularSystemEvent) => void | Promise<void>;

/**
 * Filtro de eventos
 */
export interface EventFilter {
  types?: string[];
  sources?: string[];
  targets?: string[];
  userIds?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Resultado de una operación
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
}

/**
 * Estadísticas del sistema
 */
export interface SystemStats {
  totalModules: number;
  activeModules: number;
  totalUsers: number;
  activeUsers: number;
  totalComponents: number;
  registeredComponents: number;
  languages: Record<string, number>;
  performance: {
    averageLoadTime: number;
    averageMemoryUsage: number;
    errorRate: number;
    throughput: number;
  };
  uptime: number;
  lastUpdated: Date;
}

/**
 * Información de salud del sistema
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  lastCheck: Date;
  uptime: number;
  version: string;
}

/**
 * Verificación de salud
 */
export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration: number;
  timestamp: Date;
} 