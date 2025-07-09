/**
 * 🎯 Tipos Core del Sistema de Instanciación Dinámica
 * 
 * Definiciones TypeScript para el sistema modular de WoldVirtual3DlucIA
 * Aprovecha las fortalezas de TypeScript: tipado fuerte, interfaces, generics
 */

// ============================================================================
// INTERFACES FUNDAMENTALES DEL SISTEMA MODULAR
// ============================================================================

/**
 * API pública que expone cada módulo al sistema
 */
export interface ModulePublicAPI {
  // Componentes React disponibles en el módulo
  getComponent?: (name: string) => React.LazyExoticComponent<React.ComponentType<any>> | null;
  
  // Servicios disponibles en el módulo
  getService?: (name: string) => any;
  
  // Utilidades disponibles en el módulo
  getUtility?: (name: string) => any;
  
  // Configuraciones del módulo
  getConfig?: (key: string) => any;
  
  // Métodos de inicialización específicos
  initializeComponent?: (name: string, props: any) => Promise<void>;
  initializeService?: (name: string, config: any) => Promise<void>;
  
  // Métodos de limpieza específicos
  cleanupComponent?: (name: string) => Promise<void>;
  cleanupService?: (name: string) => Promise<void>;
  
  // Métodos de validación
  validateComponent?: (name: string) => boolean;
  validateService?: (name: string) => boolean;
  
  // Métodos de información
  getModuleInfo?: () => ModuleInfo;
  getDependencies?: () => string[];
  getVersion?: () => string;
}

/**
 * API interna del módulo (no expuesta al sistema)
 */
export interface ModuleInternalAPI {
  // Métodos de gestión interna
  internalInitialize?: (userId: string) => Promise<void>;
  internalCleanup?: (userId: string) => Promise<void>;
  
  // Métodos de comunicación interna
  sendInternalMessage?: (target: string, message: any) => void;
  receiveInternalMessage?: (message: any) => void;
  
  // Métodos de gestión de estado interno
  getInternalState?: () => any;
  setInternalState?: (state: any) => void;
  
  // Métodos de logging interno
  logInternal?: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => void;
  
  // Métodos de métricas internas
  recordInternalMetric?: (name: string, value: number) => void;
  getInternalMetrics?: () => Record<string, number>;
}

/**
 * Información del módulo
 */
export interface ModuleInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: string;
  dependencies: string[];
  peerDependencies: string[];
  devDependencies: string[];
  keywords: string[];
  category: ModuleCategory;
  priority: ModulePriority;
  size: ModuleSize;
  performance: ModulePerformance;
  security: ModuleSecurity;
  compatibility: ModuleCompatibility;
}

/**
 * Categorías de módulos
 */
export type ModuleCategory = 
  | 'core'           // Módulos fundamentales del sistema
  | 'frontend'       // Módulos de interfaz de usuario
  | 'backend'        // Módulos de servicios backend
  | 'blockchain'     // Módulos de blockchain y Web3
  | 'ai'             // Módulos de inteligencia artificial
  | 'gaming'         // Módulos de gaming y 3D
  | 'media'          // Módulos de procesamiento de medios
  | 'utility'        // Módulos de utilidades
  | 'development'    // Módulos de desarrollo
  | 'testing'        // Módulos de testing
  | 'documentation'  // Módulos de documentación
  | 'i18n';          // Módulos de internacionalización

/**
 * Prioridades de módulos
 */
export type ModulePriority = 
  | 'critical'       // Carga crítica, siempre disponible
  | 'high'           // Alta prioridad, carga temprana
  | 'normal'         // Prioridad normal, carga bajo demanda
  | 'low'            // Baja prioridad, carga diferida
  | 'optional';      // Opcional, carga solo si se solicita

/**
 * Tamaños de módulos
 */
export type ModuleSize = 
  | 'tiny'           // < 10KB
  | 'small'          // 10KB - 100KB
  | 'medium'         // 100KB - 1MB
  | 'large'          // 1MB - 10MB
  | 'huge';          // > 10MB

/**
 * Información de rendimiento del módulo
 */
export interface ModulePerformance {
  loadTime: number;          // Tiempo de carga en ms
  memoryUsage: number;       // Uso de memoria en MB
  cpuUsage: number;          // Uso de CPU en %
  networkRequests: number;   // Número de requests de red
  cacheHitRate: number;      // Tasa de acierto de cache (0-1)
  errorRate: number;         // Tasa de errores (0-1)
}

/**
 * Información de seguridad del módulo
 */
export interface ModuleSecurity {
  permissions: string[];     // Permisos requeridos
  vulnerabilities: string[]; // Vulnerabilidades conocidas
  encryption: boolean;       // Usa encriptación
  authentication: boolean;   // Requiere autenticación
  authorization: boolean;    // Requiere autorización
  auditLevel: 'low' | 'medium' | 'high'; // Nivel de auditoría
}

/**
 * Información de compatibilidad del módulo
 */
export interface ModuleCompatibility {
  browsers: string[];        // Navegadores soportados
  platforms: string[];       // Plataformas soportadas
  nodeVersion: string;       // Versión de Node.js requerida
  reactVersion: string;      // Versión de React requerida
  threeJsVersion: string;    // Versión de Three.js requerida
  webglVersion: string;      // Versión de WebGL requerida
}

// ============================================================================
// INTERFACES DE INSTANCIA Y ESTADO
// ============================================================================

/**
 * Instancia de un módulo para un usuario específico
 */
export interface ModuleInstance {
  id: string;
  moduleName: string;
  userId: string;
  status: ModuleStatus;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  errorCount: number;
  performance: ModulePerformance;
  state: any;
  metadata: Record<string, any>;
}

/**
 * Estados de un módulo
 */
export type ModuleStatus = 
  | 'uninitialized'  // Módulo no inicializado
  | 'initializing'   // Módulo en proceso de inicialización
  | 'active'         // Módulo activo y funcionando
  | 'idle'           // Módulo inactivo pero disponible
  | 'error'          // Módulo en estado de error
  | 'cleaning'       // Módulo en proceso de limpieza
  | 'cleaned';       // Módulo limpiado y no disponible

/**
 * Wrapper principal de un módulo
 */
export interface ModuleWrapper {
  // Identificación del módulo
  name: string;
  version: string;
  description: string;
  
  // Dependencias del módulo
  dependencies: string[];
  peerDependencies: string[];
  optionalDependencies: string[];
  
  // APIs del módulo
  publicAPI: ModulePublicAPI;
  internalAPI: ModuleInternalAPI;
  
  // Métodos de ciclo de vida
  initialize: (userId: string) => Promise<void>;
  cleanup?: (userId: string) => Promise<void>;
  
  // Métodos de validación
  validate?: () => Promise<boolean>;
  validateDependencies?: () => Promise<boolean>;
  
  // Métodos de información
  getInfo: () => ModuleInfo;
  getStats: () => ModuleStats;
  
  // Métodos de configuración
  configure?: (config: any) => Promise<void>;
  getConfiguration?: () => any;
  
  // Métodos de eventos
  onInitialize?: (callback: (userId: string) => void) => void;
  onCleanup?: (callback: (userId: string) => void) => void;
  onError?: (callback: (error: Error) => void) => void;
}

/**
 * Estadísticas del módulo
 */
export interface ModuleStats {
  totalInstances: number;
  activeInstances: number;
  totalErrors: number;
  averageLoadTime: number;
  averageMemoryUsage: number;
  lastUpdated: Date;
  uptime: number;
  reliability: number; // 0-1
}

// ============================================================================
// INTERFACES DE COMUNICACIÓN Y EVENTOS
// ============================================================================

/**
 * Evento del sistema de módulos
 */
export interface ModuleEvent {
  type: string;
  moduleName: string;
  userId?: string;
  timestamp: Date;
  data: any;
  priority: EventPriority;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Prioridades de eventos
 */
export type EventPriority = 
  | 'critical'   // Evento crítico, procesar inmediatamente
  | 'high'       // Evento de alta prioridad
  | 'normal'     // Evento de prioridad normal
  | 'low'        // Evento de baja prioridad
  | 'background'; // Evento de fondo

/**
 * Mensaje entre módulos
 */
export interface ModuleMessage {
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: Date;
  id: string;
  correlationId?: string;
  priority: EventPriority;
  ttl?: number; // Time to live en ms
}

/**
 * Respuesta a un mensaje
 */
export interface ModuleResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  requestId: string;
  processingTime: number;
}

// ============================================================================
// INTERFACES DE CONFIGURACIÓN Y VALIDACIÓN
// ============================================================================

/**
 * Configuración de un módulo
 */
export interface ModuleConfig {
  name: string;
  enabled: boolean;
  autoLoad: boolean;
  preload: boolean;
  cache: boolean;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  maxInstances: number;
  maxMemoryUsage: number;
  permissions: string[];
  settings: Record<string, any>;
}

/**
 * Resultado de validación de un módulo
 */
export interface ModuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  dependencies: {
    missing: string[];
    outdated: string[];
    incompatible: string[];
  };
  performance: {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  };
  security: {
    score: number; // 0-100
    vulnerabilities: string[];
    recommendations: string[];
  };
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Callback para eventos de módulo
 */
export type ModuleCallback<T = any> = (data: T) => void | Promise<void>;

/**
 * Función de transformación de datos
 */
export type DataTransformer<T = any, U = any> = (data: T) => U | Promise<U>;

/**
 * Función de validación
 */
export type Validator<T = any> = (data: T) => boolean | Promise<boolean>;

/**
 * Función de middleware
 */
export type Middleware<T = any> = (data: T, next: () => void) => void | Promise<void>;

/**
 * Configuración de carga de módulo
 */
export interface ModuleLoadConfig {
  priority: ModulePriority;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  preload: boolean;
  cache: boolean;
  validate: boolean;
  dependencies: string[];
}

/**
 * Resultado de carga de módulo
 */
export interface ModuleLoadResult {
  success: boolean;
  module?: ModuleWrapper;
  error?: string;
  loadTime: number;
  dependencies: string[];
  warnings: string[];
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ModuleCallback,
  DataTransformer,
  Validator,
  Middleware
};

export {
  ModulePublicAPI,
  ModuleInternalAPI,
  ModuleInfo,
  ModuleCategory,
  ModulePriority,
  ModuleSize,
  ModulePerformance,
  ModuleSecurity,
  ModuleCompatibility,
  ModuleInstance,
  ModuleStatus,
  ModuleWrapper,
  ModuleStats,
  ModuleEvent,
  EventPriority,
  ModuleMessage,
  ModuleResponse,
  ModuleConfig,
  ModuleValidationResult,
  ModuleLoadConfig,
  ModuleLoadResult
}; 