/**
 * @fileoverview Tipos para estado de componentes UI del metaverso
 * @module @types/ui/state
 */

import React from 'react';

// ============================================================================
// TIPOS BÁSICOS DE ESTADO
// ============================================================================

/**
 * Identificador único de un estado
 */
export type StateId = string;

/**
 * Tipos de estado
 */
export enum StateType {
  // Estados básicos
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  DISABLED = 'disabled',
  HIDDEN = 'hidden',
  
  // Estados de interacción
  FOCUSED = 'focused',
  HOVERED = 'hovered',
  ACTIVE = 'active',
  SELECTED = 'selected',
  CHECKED = 'checked',
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
  
  // Estados de validación
  VALID = 'valid',
  INVALID = 'invalid',
  PENDING = 'pending',
  VALIDATING = 'validating',
  
  // Estados de datos
  EMPTY = 'empty',
  POPULATED = 'populated',
  UPDATING = 'updating',
  REFRESHING = 'refreshing',
  
  // Estados de autenticación
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATING = 'authenticating',
  
  // Estados de conexión
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  
  // Estados de metaverso
  IN_WORLD = 'in_world',
  OUT_OF_WORLD = 'out_of_world',
  TRAVELING = 'traveling',
  INTERACTING = 'interacting',
  BUILDING = 'building',
  TRADING = 'trading',
  CHATTING = 'chatting'
}

/**
 * Prioridades de estado
 */
export enum StatePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

/**
 * Duración de estado
 */
export enum StateDuration {
  INSTANT = 0,
  SHORT = 1000,
  MEDIUM = 3000,
  LONG = 10000,
  PERSISTENT = -1
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Estado base
 */
export interface BaseState {
  id: StateId;
  type: StateType;
  priority: StatePriority;
  duration: StateDuration;
  timestamp: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

/**
 * Estado de componente
 */
export interface ComponentState extends BaseState {
  componentId: string;
  value: any;
  previousValue?: any;
  transitions: StateTransition[];
  history: StateHistory[];
  listeners: StateListener[];
  metadata?: Record<string, any>;
}

/**
 * Transición de estado
 */
export interface StateTransition {
  from: StateType;
  to: StateType;
  timestamp: number;
  duration: number;
  trigger: string;
  metadata?: Record<string, any>;
}

/**
 * Historial de estado
 */
export interface StateHistory {
  state: StateType;
  value: any;
  timestamp: number;
  duration: number;
  trigger: string;
  metadata?: Record<string, any>;
}

/**
 * Listener de estado
 */
export interface StateListener {
  id: string;
  callback: (state: ComponentState) => void;
  conditions: StateCondition[];
  active: boolean;
  added: number;
  calls: number;
  metadata?: Record<string, any>;
}

/**
 * Condición de estado
 */
export interface StateCondition {
  field: 'type' | 'value' | 'priority' | 'duration';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

// ============================================================================
// TIPOS DE ESTADO ESPECÍFICOS
// ============================================================================

/**
 * Estado de formulario
 */
export interface FormState extends ComponentState {
  type: StateType.VALID | StateType.INVALID | StateType.PENDING | StateType.VALIDATING;
  fields: Record<string, FieldState>;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  isDirty: boolean;
  isPristine: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitCount: number;
  lastSubmitAt?: number;
}

/**
 * Estado de campo
 */
export interface FieldState {
  id: string;
  value: any;
  previousValue?: any;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  isDirty: boolean;
  isPristine: boolean;
  isValid: boolean;
  isTouched: boolean;
  isFocused: boolean;
  isRequired: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  validationRules: ValidationRule[];
  metadata?: Record<string, any>;
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  constraints?: Record<string, any>;
  timestamp: number;
}

/**
 * Advertencia de validación
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
  timestamp: number;
}

/**
 * Regla de validación
 */
export interface ValidationRule {
  type: string;
  message: string;
  value?: any;
  enabled: boolean;
  async?: boolean;
  validator?: (value: any, rule: ValidationRule) => boolean | Promise<boolean>;
  metadata?: Record<string, any>;
}

/**
 * Estado de lista
 */
export interface ListState extends ComponentState {
  type: StateType.EMPTY | StateType.POPULATED | StateType.UPDATING | StateType.REFRESHING;
  items: any[];
  filteredItems: any[];
  selectedItems: any[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters: Record<string, any>;
  pagination: PaginationState;
  search: SearchState;
  metadata?: Record<string, any>;
}

/**
 * Estado de paginación
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  metadata?: Record<string, any>;
}

/**
 * Estado de búsqueda
 */
export interface SearchState {
  query: string;
  results: any[];
  totalResults: number;
  isSearching: boolean;
  searchTime?: number;
  suggestions: string[];
  history: string[];
  filters: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Estado de modal
 */
export interface ModalState extends ComponentState {
  type: StateType.IDLE | StateType.LOADING | StateType.SUCCESS | StateType.ERROR;
  isOpen: boolean;
  isClosing: boolean;
  isAnimating: boolean;
  backdrop: boolean;
  closable: boolean;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  zIndex: number;
  data?: any;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  metadata?: Record<string, any>;
}

/**
 * Estado de notificación
 */
export interface NotificationState extends ComponentState {
  type: StateType.IDLE | StateType.LOADING | StateType.SUCCESS | StateType.ERROR;
  level: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isVisible: boolean;
  isDismissible: boolean;
  isPersistent: boolean;
  autoClose: boolean;
  closeDelay: number;
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'topCenter' | 'bottomCenter';
  actions: NotificationAction[];
  metadata?: Record<string, any>;
}

/**
 * Acción de notificación
 */
export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link';
  action: string;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Estado de cargador
 */
export interface LoaderState extends ComponentState {
  type: StateType.LOADING | StateType.SUCCESS | StateType.ERROR;
  progress: number;
  total: number;
  current: number;
  message: string;
  isIndeterminate: boolean;
  canCancel: boolean;
  isCancelled: boolean;
  speed: number;
  eta?: number;
  metadata?: Record<string, any>;
}

/**
 * Estado de avatar
 */
export interface AvatarState extends ComponentState {
  type: StateType.IDLE | StateType.LOADING | StateType.INTERACTING | StateType.TRAVELING;
  position: {
    x: number;
    y: number;
    z: number;
    worldId: string;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  animation: string;
  isMoving: boolean;
  isInteracting: boolean;
  isTalking: boolean;
  isTyping: boolean;
  health: number;
  energy: number;
  metadata?: Record<string, any>;
}

/**
 * Estado de mundo
 */
export interface WorldState extends ComponentState {
  type: StateType.IN_WORLD | StateType.OUT_OF_WORLD | StateType.TRAVELING;
  worldId: string;
  worldName: string;
  playerCount: number;
  maxPlayers: number;
  objects: WorldObject[];
  avatars: AvatarInfo[];
  environment: EnvironmentState;
  permissions: WorldPermissions;
  metadata?: Record<string, any>;
}

/**
 * Objeto del mundo
 */
export interface WorldObject {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  properties: Record<string, any>;
  ownerId?: string;
  isInteractive: boolean;
  isVisible: boolean;
  metadata?: Record<string, any>;
}

/**
 * Información de avatar
 */
export interface AvatarInfo {
  id: string;
  userId: string;
  username: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  animation: string;
  status: 'idle' | 'walking' | 'running' | 'interacting' | 'talking';
  isOnline: boolean;
  lastActivity: number;
  metadata?: Record<string, any>;
}

/**
 * Estado del entorno
 */
export interface EnvironmentState {
  lighting: {
    ambient: {
      color: string;
      intensity: number;
    };
    directional?: {
      color: string;
      intensity: number;
      position: {
        x: number;
        y: number;
        z: number;
      };
    };
  };
  weather: {
    type: string;
    intensity: number;
    temperature: number;
  };
  time: {
    hour: number;
    minute: number;
    day: number;
    season: string;
  };
  audio: {
    ambientSounds: string[];
    backgroundMusic?: string;
    volume: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Permisos del mundo
 */
export interface WorldPermissions {
  canBuild: boolean;
  canScript: boolean;
  canTeleport: boolean;
  canChat: boolean;
  canVoice: boolean;
  canTrade: boolean;
  canInvite: boolean;
  canKick: boolean;
  canBan: boolean;
  canModerate: boolean;
  metadata?: Record<string, any>;
}

/**
 * Estado de chat
 */
export interface ChatState extends ComponentState {
  type: StateType.CHATTING | StateType.IDLE;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  isTyping: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  unreadCount: number;
  lastMessageAt?: number;
  metadata?: Record<string, any>;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'voice' | 'emote' | 'system';
  timestamp: number;
  isRead: boolean;
  isEdited: boolean;
  replyTo?: string;
  attachments?: ChatAttachment[];
  metadata?: Record<string, any>;
}

/**
 * Participante del chat
 */
export interface ChatParticipant {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  isTyping: boolean;
  lastSeen: number;
  role: 'user' | 'moderator' | 'admin';
  metadata?: Record<string, any>;
}

/**
 * Adjunto de chat
 */
export interface ChatAttachment {
  type: 'image' | 'audio' | 'video' | 'file' | 'nft';
  url: string;
  name: string;
  size: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Configuración de estado
 */
export interface StateConfig {
  type: StateType;
  priority: StatePriority;
  duration: StateDuration;
  transitions: StateTransition[];
  listeners: StateListener[];
  metadata?: Record<string, any>;
}

/**
 * Utilidades de estado
 */
export interface StateUtils {
  /**
   * Crea estado de componente
   */
  createState: (componentId: string, type: StateType, value?: any) => ComponentState;
  
  /**
   * Valida estado
   */
  validateState: (state: ComponentState) => boolean;
  
  /**
   * Serializa estado
   */
  serializeState: (state: ComponentState) => string;
  
  /**
   * Deserializa estado
   */
  deserializeState: (data: string) => ComponentState;
  
  /**
   * Clona estado
   */
  cloneState: (state: ComponentState) => ComponentState;
  
  /**
   * Combina estados
   */
  mergeStates: (states: ComponentState[]) => ComponentState;
  
  /**
   * Genera ID de estado
   */
  generateStateId: () => StateId;
  
  /**
   * Verifica si estado está activo
   */
  isStateActive: (state: ComponentState) => boolean;
  
  /**
   * Verifica si estado ha expirado
   */
  isStateExpired: (state: ComponentState) => boolean;
  
  /**
   * Verifica si estado es transitorio
   */
  isStateTransient: (state: ComponentState) => boolean;
  
  /**
   * Verifica si estado es persistente
   */
  isStatePersistent: (state: ComponentState) => boolean;
  
  /**
   * Obtiene duración del estado
   */
  getStateDuration: (state: ComponentState) => number;
  
  /**
   * Obtiene tiempo restante del estado
   */
  getStateTimeRemaining: (state: ComponentState) => number;
  
  /**
   * Actualiza estado
   */
  updateState: (state: ComponentState, updates: Partial<ComponentState>) => ComponentState;
  
  /**
   * Transiciona estado
   */
  transitionState: (state: ComponentState, newType: StateType, trigger?: string) => ComponentState;
  
  /**
   * Revierte estado
   */
  revertState: (state: ComponentState) => ComponentState;
  
  /**
   * Registra estado
   */
  registerState: (state: ComponentState) => void;
  
  /**
   * Desregistra estado
   */
  unregisterState: (stateId: StateId) => void;
  
  /**
   * Obtiene estado por ID
   */
  getState: (stateId: StateId) => ComponentState | null;
  
  /**
   * Lista todos los estados
   */
  listStates: () => ComponentState[];
  
  /**
   * Filtra estados
   */
  filterStates: (filter: (state: ComponentState) => boolean) => ComponentState[];
  
  /**
   * Ordena estados
   */
  sortStates: (states: ComponentState[], sorter: (a: ComponentState, b: ComponentState) => number) => ComponentState[];
  
  /**
   * Agrupa estados
   */
  groupStates: (states: ComponentState[], grouper: (state: ComponentState) => string) => Record<string, ComponentState[]>;
  
  /**
   * Exporta estados
   */
  exportStates: (states: ComponentState[]) => string;
  
  /**
   * Importa estados
   */
  importStates: (data: string) => ComponentState[];
  
  /**
   * Valida estados
   */
  validateStates: (states: ComponentState[]) => boolean;
  
  /**
   * Optimiza estados
   */
  optimizeStates: (states: ComponentState[]) => ComponentState[];
  
  /**
   * Limpia estados
   */
  cleanupStates: (states: ComponentState[]) => ComponentState[];
  
  /**
   * Suscribe a cambios de estado
   */
  subscribeToState: (stateId: StateId, listener: StateListener) => void;
  
  /**
   * Desuscribe de cambios de estado
   */
  unsubscribeFromState: (stateId: StateId, listenerId: string) => void;
  
  /**
   * Notifica cambios de estado
   */
  notifyStateChange: (state: ComponentState) => void;
  
  /**
   * Ejecuta acción en estado
   */
  executeStateAction: (state: ComponentState, action: string, parameters?: Record<string, any>) => Promise<any>;
  
  /**
   * Valida transición de estado
   */
  validateStateTransition: (from: StateType, to: StateType) => boolean;
  
  /**
   * Obtiene transiciones permitidas
   */
  getAllowedTransitions: (stateType: StateType) => StateType[];
  
  /**
   * Obtiene reglas de transición
   */
  getTransitionRules: (from: StateType, to: StateType) => StateTransition[];
  
  /**
   * Aplica reglas de transición
   */
  applyTransitionRules: (state: ComponentState, transition: StateTransition) => ComponentState;
  
  /**
   * Verifica condiciones de estado
   */
  checkStateConditions: (state: ComponentState, conditions: StateCondition[]) => boolean;
  
  /**
   * Evalúa expresión de estado
   */
  evaluateStateExpression: (expression: string, state: ComponentState) => any;
  
  /**
   * Calcula estadísticas de estado
   */
  calculateStateStats: (states: ComponentState[]) => StateStats;
  
  /**
   * Genera reporte de estado
   */
  generateStateReport: (states: ComponentState[]) => StateReport;
}

/**
 * Estadísticas de estado
 */
export interface StateStats {
  total: number;
  byType: Record<StateType, number>;
  byPriority: Record<StatePriority, number>;
  averageDuration: number;
  totalDuration: number;
  transitions: number;
  listeners: number;
  metadata?: Record<string, any>;
}

/**
 * Reporte de estado
 */
export interface StateReport {
  id: string;
  timestamp: number;
  stats: StateStats;
  states: ComponentState[];
  summary: string;
  recommendations: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de estado
 */
export interface StateEvent {
  type: 'created' | 'updated' | 'transitioned' | 'expired' | 'deleted';
  state: ComponentState;
  previousState?: ComponentState;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de eventos de estado
 */
export interface StateEventListener {
  onStateCreated: (event: StateEvent) => void;
  onStateUpdated: (event: StateEvent) => void;
  onStateTransitioned: (event: StateEvent) => void;
  onStateExpired: (event: StateEvent) => void;
  onStateDeleted: (event: StateEvent) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  StateId,
  BaseState,
  ComponentState,
  StateTransition,
  StateHistory,
  StateListener,
  StateCondition,
  FormState,
  FieldState,
  ValidationError,
  ValidationWarning,
  ValidationRule,
  ListState,
  PaginationState,
  SearchState,
  ModalState,
  NotificationState,
  NotificationAction,
  LoaderState,
  AvatarState,
  WorldState,
  WorldObject,
  AvatarInfo,
  EnvironmentState,
  WorldPermissions,
  ChatState,
  ChatMessage,
  ChatParticipant,
  ChatAttachment,
  StateConfig,
  StateUtils,
  StateStats,
  StateReport,
  StateEvent,
  StateEventListener
};

export {
  StateType,
  StatePriority,
  StateDuration
}; 