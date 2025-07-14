/**
 * @fileoverview Tipos para interacciones y eventos del metaverso
 * @module @types/metaverso/interaction
 */

import { WorldCoordinates, WorldRotation } from './world';
import { AvatarId } from './avatar';
import { SceneObject } from './scene';

// ============================================================================
// TIPOS BÁSICOS DE INTERACCIÓN
// ============================================================================

/**
 * Identificador único de una interacción
 */
export type InteractionId = string;

/**
 * Tipos de interacciones
 */
export enum InteractionType {
  CLICK = 'click',
  HOVER = 'hover',
  DRAG = 'drag',
  DROP = 'drop',
  TOUCH = 'touch',
  GESTURE = 'gesture',
  VOICE = 'voice',
  COLLISION = 'collision',
  TRIGGER = 'trigger',
  PROXIMITY = 'proximity',
  GAZE = 'gaze',
  GRAB = 'grab',
  RELEASE = 'release'
}

/**
 * Estados de interacción
 */
export enum InteractionState {
  IDLE = 'idle',
  HOVERING = 'hovering',
  PRESSED = 'pressed',
  DRAGGING = 'dragging',
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

/**
 * Interacción básica
 */
export interface Interaction {
  id: InteractionId;
  type: InteractionType;
  state: InteractionState;
  source: InteractionSource;
  target: InteractionTarget;
  timestamp: number;
  data: InteractionData;
}

/**
 * Fuente de interacción
 */
export interface InteractionSource {
  type: 'avatar' | 'object' | 'system' | 'external';
  id: string;
  position: WorldCoordinates;
  rotation: WorldRotation;
  metadata?: Record<string, any>;
}

/**
 * Objetivo de interacción
 */
export interface InteractionTarget {
  type: 'object' | 'avatar' | 'ui' | 'world';
  id: string;
  position: WorldCoordinates;
  rotation: WorldRotation;
  metadata?: Record<string, any>;
}

/**
 * Datos de interacción
 */
export interface InteractionData {
  position?: WorldCoordinates;
  rotation?: WorldRotation;
  pressure?: number;
  distance?: number;
  duration?: number;
  velocity?: WorldCoordinates;
  custom?: Record<string, any>;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Tipos de eventos
 */
export enum EventType {
  // Eventos de usuario
  USER_INPUT = 'user_input',
  USER_ACTION = 'user_action',
  USER_MOVEMENT = 'user_movement',
  
  // Eventos de objeto
  OBJECT_CREATED = 'object_created',
  OBJECT_DESTROYED = 'object_destroyed',
  OBJECT_MODIFIED = 'object_modified',
  OBJECT_MOVED = 'object_moved',
  
  // Eventos de avatar
  AVATAR_JOINED = 'avatar_joined',
  AVATAR_LEFT = 'avatar_left',
  AVATAR_MOVED = 'avatar_moved',
  AVATAR_ANIMATED = 'avatar_animated',
  
  // Eventos de mundo
  WORLD_LOADED = 'world_loaded',
  WORLD_UNLOADED = 'world_unloaded',
  WEATHER_CHANGED = 'weather_changed',
  TIME_CHANGED = 'time_changed',
  
  // Eventos de red
  NETWORK_CONNECTED = 'network_connected',
  NETWORK_DISCONNECTED = 'network_disconnected',
  DATA_SYNCED = 'data_synced',
  
  // Eventos de blockchain
  TRANSACTION_STARTED = 'transaction_started',
  TRANSACTION_COMPLETED = 'transaction_completed',
  NFT_MINTED = 'nft_minted',
  NFT_TRANSFERRED = 'nft_transferred',
  
  // Eventos de sistema
  SYSTEM_STARTED = 'system_started',
  SYSTEM_STOPPED = 'system_stopped',
  ERROR_OCCURRED = 'error_occurred',
  WARNING_OCCURRED = 'warning_occurred'
}

/**
 * Evento del metaverso
 */
export interface MetaverseEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source: EventSource;
  target?: EventTarget;
  data: EventData;
  priority: EventPriority;
  reliable: boolean;
}

/**
 * Fuente del evento
 */
export interface EventSource {
  type: 'avatar' | 'object' | 'system' | 'network' | 'blockchain';
  id: string;
  position?: WorldCoordinates;
  metadata?: Record<string, any>;
}

/**
 * Objetivo del evento
 */
export interface EventTarget {
  type: 'avatar' | 'object' | 'world' | 'system';
  id: string;
  position?: WorldCoordinates;
  metadata?: Record<string, any>;
}

/**
 * Datos del evento
 */
export interface EventData {
  [key: string]: any;
}

/**
 * Prioridad del evento
 */
export enum EventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// TIPOS DE COLISIONES
// ============================================================================

/**
 * Tipos de colisión
 */
export enum CollisionType {
  START = 'start',
  PERSIST = 'persist',
  END = 'end'
}

/**
 * Colisión entre objetos
 */
export interface Collision {
  id: string;
  type: CollisionType;
  timestamp: number;
  objectA: CollisionObject;
  objectB: CollisionObject;
  contact: CollisionContact;
  force: number;
  impulse: WorldCoordinates;
}

/**
 * Objeto en colisión
 */
export interface CollisionObject {
  id: string;
  type: 'avatar' | 'object' | 'trigger';
  position: WorldCoordinates;
  velocity: WorldCoordinates;
  mass: number;
  metadata?: Record<string, any>;
}

/**
 * Punto de contacto de colisión
 */
export interface CollisionContact {
  point: WorldCoordinates;
  normal: WorldCoordinates;
  penetration: number;
}

/**
 * Configuración de colisión
 */
export interface CollisionConfig {
  enabled: boolean;
  groups: CollisionGroup[];
  masks: CollisionMask[];
  callbacks: CollisionCallback[];
}

/**
 * Grupo de colisión
 */
export interface CollisionGroup {
  id: number;
  name: string;
  description: string;
}

/**
 * Máscara de colisión
 */
export interface CollisionMask {
  groupId: number;
  collidesWith: number[];
}

/**
 * Callback de colisión
 */
export interface CollisionCallback {
  id: string;
  event: 'start' | 'persist' | 'end';
  handler: string;
  filter?: CollisionFilter;
}

/**
 * Filtro de colisión
 */
export interface CollisionFilter {
  objectTypes?: string[];
  tags?: string[];
  groups?: number[];
  custom?: (collision: Collision) => boolean;
}

// ============================================================================
// TIPOS DE TRIGGERS
// ============================================================================

/**
 * Tipos de triggers
 */
export enum TriggerType {
  ENTER = 'enter',
  EXIT = 'exit',
  STAY = 'stay',
  INTERVAL = 'interval',
  CONDITION = 'condition'
}

/**
 * Trigger de interacción
 */
export interface Trigger {
  id: string;
  name: string;
  type: TriggerType;
  shape: TriggerShape;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  enabled: boolean;
  oneTime: boolean;
  cooldown: number;
  lastTriggered?: number;
}

/**
 * Forma del trigger
 */
export interface TriggerShape {
  type: 'box' | 'sphere' | 'cylinder' | 'mesh';
  size?: WorldCoordinates;
  radius?: number;
  height?: number;
  mesh?: string;
}

/**
 * Condición del trigger
 */
export interface TriggerCondition {
  id: string;
  type: ConditionType;
  parameters: Record<string, any>;
  operator: 'and' | 'or' | 'not';
}

/**
 * Tipos de condiciones
 */
export enum ConditionType {
  PROXIMITY = 'proximity',
  TAG = 'tag',
  PROPERTY = 'property',
  TIME = 'time',
  WEATHER = 'weather',
  CUSTOM = 'custom'
}

/**
 * Acción del trigger
 */
export interface TriggerAction {
  id: string;
  type: ActionType;
  parameters: Record<string, any>;
  delay: number;
  repeat: number;
}

/**
 * Tipos de acciones
 */
export enum ActionType {
  TELEPORT = 'teleport',
  SPAWN = 'spawn',
  ANIMATE = 'animate',
  PLAY_SOUND = 'play_sound',
  SHOW_UI = 'show_ui',
  EXECUTE_SCRIPT = 'execute_script',
  SEND_EVENT = 'send_event',
  MODIFY_PROPERTY = 'modify_property',
  CUSTOM = 'custom'
}

// ============================================================================
// TIPOS DE GESTOS
// ============================================================================

/**
 * Tipos de gestos
 */
export enum GestureType {
  WAVE = 'wave',
  POINT = 'point',
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
  CLAP = 'clap',
  BOW = 'bow',
  DANCE = 'dance',
  CUSTOM = 'custom'
}

/**
 * Gesto del avatar
 */
export interface Gesture {
  id: string;
  type: GestureType;
  avatarId: AvatarId;
  timestamp: number;
  duration: number;
  intensity: number;
  target?: WorldCoordinates;
  metadata?: Record<string, any>;
}

/**
 * Configuración de gestos
 */
export interface GestureConfig {
  enabled: boolean;
  gestures: GestureDefinition[];
  sensitivity: number;
  cooldown: number;
}

/**
 * Definición de gesto
 */
export interface GestureDefinition {
  id: string;
  name: string;
  type: GestureType;
  animation: string;
  sound?: string;
  particles?: string;
  duration: number;
  cooldown: number;
}

// ============================================================================
// TIPOS DE VOZ
// ============================================================================

/**
 * Tipos de voz
 */
export enum VoiceType {
  SPEECH = 'speech',
  COMMAND = 'command',
  EMOTE = 'emote',
  SONG = 'song'
}

/**
 * Interacción de voz
 */
export interface VoiceInteraction {
  id: string;
  type: VoiceType;
  avatarId: AvatarId;
  timestamp: number;
  duration: number;
  text?: string;
  audio?: string;
  language: string;
  confidence: number;
  target?: AvatarId | WorldCoordinates;
  metadata?: Record<string, any>;
}

/**
 * Configuración de voz
 */
export interface VoiceConfig {
  enabled: boolean;
  language: string;
  autoTranslate: boolean;
  voiceCommands: VoiceCommand[];
  speechToText: boolean;
  textToSpeech: boolean;
}

/**
 * Comando de voz
 */
export interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  parameters: Record<string, any>;
  cooldown: number;
}

// ============================================================================
// TIPOS DE UI INTERACTIVA
// ============================================================================

/**
 * Tipos de elementos UI
 */
export enum UIElementType {
  BUTTON = 'button',
  SLIDER = 'slider',
  INPUT = 'input',
  DROPDOWN = 'dropdown',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  PANEL = 'panel',
  MODAL = 'modal',
  TOOLTIP = 'tooltip'
}

/**
 * Elemento UI interactivo
 */
export interface UIElement {
  id: string;
  type: UIElementType;
  position: WorldCoordinates;
  size: WorldCoordinates;
  visible: boolean;
  enabled: boolean;
  properties: UIElementProperties;
  events: UIEvent[];
  children: UIElement[];
}

/**
 * Propiedades del elemento UI
 */
export interface UIElementProperties {
  text?: string;
  value?: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  style?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Evento de UI
 */
export interface UIEvent {
  type: 'click' | 'hover' | 'change' | 'focus' | 'blur';
  handler: string;
  parameters?: Record<string, any>;
}

// ============================================================================
// TIPOS DE PROXIMIDAD
// ============================================================================

/**
 * Interacción de proximidad
 */
export interface ProximityInteraction {
  id: string;
  avatarId: AvatarId;
  objectId: string;
  distance: number;
  timestamp: number;
  type: 'enter' | 'exit' | 'near' | 'far';
  metadata?: Record<string, any>;
}

/**
 * Configuración de proximidad
 */
export interface ProximityConfig {
  enabled: boolean;
  maxDistance: number;
  updateInterval: number;
  zones: ProximityZone[];
}

/**
 * Zona de proximidad
 */
export interface ProximityZone {
  id: string;
  name: string;
  center: WorldCoordinates;
  radius: number;
  actions: ProximityAction[];
}

/**
 * Acción de proximidad
 */
export interface ProximityAction {
  type: 'notification' | 'highlight' | 'interaction' | 'custom';
  parameters: Record<string, any>;
  condition?: (distance: number) => boolean;
}

// ============================================================================
// TIPOS DE SISTEMA DE EVENTOS
// ============================================================================

/**
 * Sistema de eventos
 */
export interface EventSystem {
  id: string;
  name: string;
  events: MetaverseEvent[];
  listeners: EventListener[];
  queues: EventQueue[];
  config: EventSystemConfig;
}

/**
 * Listener de eventos
 */
export interface EventListener {
  id: string;
  eventType: EventType;
  handler: string;
  filter?: EventFilter;
  priority: EventPriority;
  enabled: boolean;
}

/**
 * Filtro de eventos
 */
export interface EventFilter {
  sourceTypes?: string[];
  targetTypes?: string[];
  tags?: string[];
  custom?: (event: MetaverseEvent) => boolean;
}

/**
 * Cola de eventos
 */
export interface EventQueue {
  id: string;
  name: string;
  events: MetaverseEvent[];
  maxSize: number;
  processing: boolean;
  handlers: EventHandler[];
}

/**
 * Manejador de eventos
 */
export interface EventHandler {
  id: string;
  name: string;
  handler: string;
  async: boolean;
  timeout: number;
  retries: number;
}

/**
 * Configuración del sistema de eventos
 */
export interface EventSystemConfig {
  maxEvents: number;
  maxListeners: number;
  eventTimeout: number;
  retryAttempts: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

// ============================================================================
// TIPOS DE MÉTRICAS DE INTERACCIÓN
// ============================================================================

/**
 * Métricas de interacción
 */
export interface InteractionMetrics {
  totalInteractions: number;
  interactionsByType: Record<InteractionType, number>;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  userEngagement: number;
  popularInteractions: PopularInteraction[];
  timeDistribution: TimeDistribution[];
}

/**
 * Interacción popular
 */
export interface PopularInteraction {
  type: InteractionType;
  count: number;
  percentage: number;
  averageDuration: number;
}

/**
 * Distribución temporal
 */
export interface TimeDistribution {
  hour: number;
  interactions: number;
  uniqueUsers: number;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  InteractionId,
  Interaction,
  InteractionSource,
  InteractionTarget,
  InteractionData,
  MetaverseEvent,
  EventSource,
  EventTarget,
  EventData,
  Collision,
  CollisionObject,
  CollisionContact,
  CollisionConfig,
  CollisionGroup,
  CollisionMask,
  CollisionCallback,
  CollisionFilter,
  Trigger,
  TriggerShape,
  TriggerCondition,
  TriggerAction,
  Gesture,
  GestureConfig,
  GestureDefinition,
  VoiceInteraction,
  VoiceConfig,
  VoiceCommand,
  UIElement,
  UIElementProperties,
  UIEvent,
  ProximityInteraction,
  ProximityConfig,
  ProximityZone,
  ProximityAction,
  EventSystem,
  EventListener,
  EventFilter,
  EventQueue,
  EventHandler,
  EventSystemConfig,
  InteractionMetrics,
  PopularInteraction,
  TimeDistribution
};

export {
  InteractionType,
  InteractionState,
  EventType,
  EventPriority,
  CollisionType,
  TriggerType,
  ConditionType,
  ActionType,
  GestureType,
  VoiceType,
  UIElementType
}; 