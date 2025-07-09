// Tipos principales para el Sistema de Binarios

export type BinModuleStatus = 'active' | 'inactive' | 'warning' | 'loading' | 'error';

export interface BinModule {
  id: string;
  name: string;
  description: string;
  status: BinModuleStatus;
  version: string;
  dependencies: string[];
  lastUpdated: Date;
  path?: string;
  size?: number;
  checksum?: string;
}

export interface BinState {
  modules: BinModule[];
  selectedModule: BinModule | null;
  isLoading: boolean;
  error: string | null;
}

export type BinAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MODULES'; payload: BinModule[] }
  | { type: 'SELECT_MODULE'; payload: BinModule | null }
  | { type: 'UPDATE_MODULE_STATUS'; payload: { id: string; status: BinModule['status'] } }
  | { type: 'ADD_MODULE'; payload: BinModule }
  | { type: 'REMOVE_MODULE'; payload: string };

export interface BinContextType {
  state: BinState;
  dispatch: React.Dispatch<BinAction>;
  selectModule: (module: BinModule | null) => void;
  updateModuleStatus: (id: string, status: BinModule['status']) => void;
  getModuleById: (id: string) => BinModule | undefined;
  addModule: (module: BinModule) => void;
  removeModule: (id: string) => void;
}

// Tipos para componentes
export interface BinModuleCardProps {
  module: BinModule;
}

export interface BinModuleDetailProps {
  module: BinModule;
}

// Tipos para acciones de módulos
export interface ModuleAction {
  id: string;
  type: 'execute' | 'configure' | 'update' | 'logs' | 'metrics' | 'docs';
  params?: Record<string, any>;
}

// Tipos para logs y métricas
export interface ModuleLog {
  id: string;
  moduleId: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ModuleMetrics {
  moduleId: string;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  lastActivity: Date;
  errorCount: number;
  successCount: number;
}

// Tipos para configuración
export interface ModuleConfig {
  moduleId: string;
  settings: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  autoStart: boolean;
  maxRetries: number;
  timeout: number;
}

// Tipos para eventos del sistema
export interface BinEvent {
  type: string;
  moduleId?: string;
  data?: any;
  timestamp: Date;
  userId?: string;
}

// Tipos para comunicación inter-módulo
export interface ModuleMessage {
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: Date;
  id: string;
}

// Tipos para dependencias
export interface ModuleDependency {
  id: string;
  name: string;
  version: string;
  required: boolean;
  status: 'available' | 'missing' | 'conflict';
}

// Tipos para actualizaciones
export interface ModuleUpdate {
  moduleId: string;
  currentVersion: string;
  newVersion: string;
  changelog: string[];
  breakingChanges: boolean;
  requiresRestart: boolean;
  downloadSize: number;
  estimatedTime: number;
}

// Tipos para permisos y seguridad
export interface ModulePermission {
  moduleId: string;
  userId: string;
  permissions: string[];
  grantedAt: Date;
  expiresAt?: Date;
}

// Tipos para auditoría
export interface ModuleAuditLog {
  id: string;
  moduleId: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
} 