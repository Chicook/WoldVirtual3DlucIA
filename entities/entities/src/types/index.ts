/**
 * Tipos principales del Sistema de Entidades del Metaverso
 */

import { URIComponents } from '../../esnext/uri';

// ============================================================================
// TIPOS BASE DE ENTIDADES
// ============================================================================

/**
 * Identificador único de entidad
 */
export type EntityId = string;

/**
 * Tipos de entidades del metaverso
 */
export type EntityType = 
  | 'world'
  | 'avatar'
  | 'object'
  | 'scene'
  | 'asset'
  | 'user'
  | 'group'
  | 'event'
  | 'transaction'
  | 'contract';

/**
 * Estado de una entidad
 */
export interface EntityState {
  active: boolean;
  visible: boolean;
  locked: boolean;
  synced: boolean;
  lastModified: Date;
  version: string;
}

/**
 * Metadatos de una entidad
 */
export interface EntityMetadata {
  name: string;
  description?: string;
  tags?: string[];
  owner?: string;
  created: Date;
  modified: Date;
  version: string;
  properties?: Record<string, unknown>;
  permissions?: Permission[];
  blockchain?: BlockchainMetadata;
}

/**
 * Permisos de acceso
 */
export interface Permission {
  user: string;
  actions: string[];
  granted: Date;
  expires?: Date;
}

/**
 * Metadatos de blockchain
 */
export interface BlockchainMetadata {
  tokenId?: string;
  contractAddress?: string;
  network: string;
  transactionHash?: string;
  blockNumber?: number;
  verified: boolean;
}

/**
 * Entidad principal del metaverso
 */
export interface Entity {
  id: EntityId;
  type: EntityType;
  uri: string;
  state: EntityState;
  metadata: EntityMetadata;
  components?: Record<string, unknown>;
  parent?: EntityId;
  children?: EntityId[];
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

/**
 * Configuración del sistema URI
 */
export interface URIConfig {
  schemes: string[];
  validation: {
    strict: boolean;
    allowRelative: boolean;
    maxLength: number;
  };
  normalization: {
    enabled: boolean;
    caseSensitive: boolean;
  };
}

/**
 * Configuración de blockchain
 */
export interface BlockchainConfig {
  enabled: boolean;
  network: string;
  contractAddress?: string;
  provider: string;
  gasLimit: number;
  confirmations: number;
  timeout: number;
}

/**
 * Configuración de cache
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
  persistence: boolean;
}

/**
 * Configuración de sincronización
 */
export interface SyncConfig {
  enabled: boolean;
  interval: number;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Configuración del sistema de entidades
 */
export interface EntitySystemConfig {
  uri: URIConfig;
  blockchain: BlockchainConfig;
  cache: CacheConfig;
  sync: SyncConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

/**
 * Configuración de seguridad
 */
export interface SecurityConfig {
  validation: {
    enabled: boolean;
    strict: boolean;
  };
  sanitization: {
    enabled: boolean;
    level: 'low' | 'medium' | 'high';
  };
  accessControl: {
    enabled: boolean;
    defaultPolicy: 'deny' | 'allow';
  };
}

/**
 * Configuración de rendimiento
 */
export interface PerformanceConfig {
  maxEntities: number;
  maxMetadataSize: number;
  compression: boolean;
  lazyLoading: boolean;
  backgroundSync: boolean;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Tipos de eventos del sistema
 */
export type EntityEventType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'permission_changed'
  | 'blockchain_synced'
  | 'cache_updated';

/**
 * Evento de entidad
 */
export interface EntityEvent {
  id: string;
  type: EntityEventType;
  entityId: EntityId;
  timestamp: Date;
  data?: Record<string, unknown>;
  source: string;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'critical';
}

/**
 * Advertencia de validación
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// ============================================================================
// TIPOS DE SINCRONIZACIÓN
// ============================================================================

/**
 * Estado de sincronización
 */
export interface SyncState {
  syncing: boolean;
  lastSync: Date;
  pendingChanges: number;
  errors: string[];
  progress: number;
}

/**
 * Operación de sincronización
 */
export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityId: EntityId;
  data?: Entity;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
}

// ============================================================================
// TIPOS DE WASM
// ============================================================================

/**
 * Estado del motor 3D
 */
export interface EngineState {
  entities: Entity[];
  components: Record<string, unknown[]>;
  systems: string[];
  performance: {
    fps: number;
    memory: number;
    entities: number;
  };
}

/**
 * Operación WASM
 */
export interface WASMOperation {
  type: 'sync' | 'query' | 'update' | 'delete';
  data: unknown;
  callback?: (result: unknown) => void;
}

// ============================================================================
// TIPOS DE UTILIDADES
// ============================================================================

/**
 * Opciones de búsqueda
 */
export interface SearchOptions {
  query: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

/**
 * Resultado de búsqueda
 */
export interface SearchResult<T = Entity> {
  items: T[];
  total: number;
  hasMore: boolean;
  query: string;
  filters?: Record<string, unknown>;
}

/**
 * Paginación
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================================================
// TIPOS DE ERRORES
// ============================================================================

/**
 * Error base del sistema
 */
export class EntitySystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EntitySystemError';
  }
}

/**
 * Error de validación
 */
export class ValidationError extends EntitySystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Error de blockchain
 */
export class BlockchainError extends EntitySystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BLOCKCHAIN_ERROR', details);
    this.name = 'BlockchainError';
  }
}

/**
 * Error de sincronización
 */
export class SyncError extends EntitySystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SYNC_ERROR', details);
    this.name = 'SyncError';
  }
} 