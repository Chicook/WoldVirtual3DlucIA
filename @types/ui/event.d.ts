/**
 * @fileoverview Tipos para eventos UI del metaverso
 * @module @types/ui/event
 */

import React from 'react';

// ============================================================================
// TIPOS BÁSICOS DE EVENTO
// ============================================================================

/**
 * Identificador único de un evento
 */
export type EventId = string;

/**
 * Tipos de evento UI
 */
export enum UIEventType {
  // Eventos de mouse
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  RIGHT_CLICK = 'right_click',
  MOUSE_DOWN = 'mouse_down',
  MOUSE_UP = 'mouse_up',
  MOUSE_ENTER = 'mouse_enter',
  MOUSE_LEAVE = 'mouse_leave',
  MOUSE_MOVE = 'mouse_move',
  MOUSE_OVER = 'mouse_over',
  MOUSE_OUT = 'mouse_out',
  WHEEL = 'wheel',
  
  // Eventos de teclado
  KEY_DOWN = 'key_down',
  KEY_UP = 'key_up',
  KEY_PRESS = 'key_press',
  
  // Eventos de foco
  FOCUS = 'focus',
  BLUR = 'blur',
  FOCUS_IN = 'focus_in',
  FOCUS_OUT = 'focus_out',
  
  // Eventos de formulario
  CHANGE = 'change',
  INPUT = 'input',
  SUBMIT = 'submit',
  RESET = 'reset',
  SELECT = 'select',
  SELECT_START = 'select_start',
  SELECTION_CHANGE = 'selection_change',
  
  // Eventos de arrastre
  DRAG_START = 'drag_start',
  DRAG = 'drag',
  DRAG_END = 'drag_end',
  DRAG_ENTER = 'drag_enter',
  DRAG_LEAVE = 'drag_leave',
  DRAG_OVER = 'drag_over',
  DROP = 'drop',
  
  // Eventos de toque
  TOUCH_START = 'touch_start',
  TOUCH_MOVE = 'touch_move',
  TOUCH_END = 'touch_end',
  TOUCH_CANCEL = 'touch_cancel',
  
  // Eventos de gestos
  GESTURE_START = 'gesture_start',
  GESTURE_CHANGE = 'gesture_change',
  GESTURE_END = 'gesture_end',
  
  // Eventos de scroll
  SCROLL = 'scroll',
  SCROLL_START = 'scroll_start',
  SCROLL_END = 'scroll_end',
  
  // Eventos de resize
  RESIZE = 'resize',
  ORIENTATION_CHANGE = 'orientation_change',
  
  // Eventos de visibilidad
  VISIBILITY_CHANGE = 'visibility_change',
  PAGE_SHOW = 'page_show',
  PAGE_HIDE = 'page_hide',
  
  // Eventos de carga
  LOAD = 'load',
  UNLOAD = 'unload',
  BEFORE_UNLOAD = 'before_unload',
  
  // Eventos de error
  ERROR = 'error',
  ABORT = 'abort',
  
  // Eventos de copia/pegado
  COPY = 'copy',
  CUT = 'cut',
  PASTE = 'paste',
  
  // Eventos de contexto
  CONTEXT_MENU = 'context_menu',
  
  // Eventos de animación
  ANIMATION_START = 'animation_start',
  ANIMATION_END = 'animation_end',
  ANIMATION_ITERATION = 'animation_iteration',
  
  // Eventos de transición
  TRANSITION_START = 'transition_start',
  TRANSITION_END = 'transition_end',
  
  // Eventos de metaverso
  AVATAR_MOVE = 'avatar_move',
  AVATAR_INTERACT = 'avatar_interact',
  WORLD_JOIN = 'world_join',
  WORLD_LEAVE = 'world_leave',
  CHAT_MESSAGE = 'chat_message',
  NFT_SELECT = 'nft_select',
  TRANSACTION_COMPLETE = 'transaction_complete',
  
  // Eventos de sistema
  SYSTEM_MESSAGE = 'system_message',
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  CONFIRM = 'confirm',
  PROMPT = 'prompt'
}

/**
 * Fases de evento
 */
export enum EventPhase {
  CAPTURING = 1,
  AT_TARGET = 2,
  BUBBLING = 3
}

/**
 * Estados de evento
 */
export enum EventState {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Evento UI base
 */
export interface BaseUIEvent {
  id: EventId;
  type: UIEventType;
  target: EventTarget;
  currentTarget: EventTarget;
  phase: EventPhase;
  state: EventState;
  timestamp: number;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  isTrusted: boolean;
  eventPhase: number;
  timeStamp: number;
  metadata?: Record<string, any>;
}

/**
 * Objetivo del evento
 */
export interface EventTarget {
  id: string;
  type: string;
  tagName?: string;
  className?: string;
  attributes?: Record<string, string>;
  dataset?: Record<string, string>;
  value?: any;
  checked?: boolean;
  selected?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  accept?: string;
  multiple?: boolean;
  size?: number;
  step?: number;
  min?: number;
  max?: number;
  src?: string;
  alt?: string;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaHidden?: boolean;
  role?: string;
  tabIndex?: number;
  style?: React.CSSProperties;
  children?: EventTarget[];
  parent?: EventTarget;
  siblings?: EventTarget[];
  ancestors?: EventTarget[];
  descendants?: EventTarget[];
  metadata?: Record<string, any>;
}

/**
 * Posición del evento
 */
export interface EventPosition {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  offsetX: number;
  offsetY: number;
  movementX: number;
  movementY: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  deltaMode: number;
}

/**
 * Información del evento
 */
export interface EventInfo {
  type: UIEventType;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAction: boolean;
  systemAction: boolean;
  preventable: boolean;
  stoppable: boolean;
  bubbles: boolean;
  cancelable: boolean;
  async: boolean;
  debounced: boolean;
  throttled: boolean;
  retryable: boolean;
  maxRetries: number;
  timeout: number;
  priority: number;
  tags: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE EVENTO ESPECÍFICOS
// ============================================================================

/**
 * Evento de mouse
 */
export interface MouseEvent extends BaseUIEvent {
  type: UIEventType.CLICK | UIEventType.DOUBLE_CLICK | UIEventType.RIGHT_CLICK | UIEventType.MOUSE_DOWN | UIEventType.MOUSE_UP | UIEventType.MOUSE_ENTER | UIEventType.MOUSE_LEAVE | UIEventType.MOUSE_MOVE | UIEventType.MOUSE_OVER | UIEventType.MOUSE_OUT;
  position: EventPosition;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  relatedTarget?: EventTarget;
  detail: number;
  which: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pointerId: number;
  pointerType: string;
  isPrimary: boolean;
}

/**
 * Evento de teclado
 */
export interface KeyboardEvent extends BaseUIEvent {
  type: UIEventType.KEY_DOWN | UIEventType.KEY_UP | UIEventType.KEY_PRESS;
  key: string;
  code: string;
  keyCode: number;
  which: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  isComposing: boolean;
  charCode: number;
  location: number;
  locale: string;
}

/**
 * Evento de foco
 */
export interface FocusEvent extends BaseUIEvent {
  type: UIEventType.FOCUS | UIEventType.BLUR | UIEventType.FOCUS_IN | UIEventType.FOCUS_OUT;
  relatedTarget?: EventTarget;
  bubbles: boolean;
  cancelable: boolean;
}

/**
 * Evento de cambio
 */
export interface ChangeEvent extends BaseUIEvent {
  type: UIEventType.CHANGE;
  value: any;
  oldValue?: any;
  checked?: boolean;
  files?: FileList;
  selectedOptions?: HTMLCollectionOf<HTMLOptionElement>;
  target: EventTarget & {
    value: any;
    checked?: boolean;
    files?: FileList;
    selectedOptions?: HTMLCollectionOf<HTMLOptionElement>;
  };
}

/**
 * Evento de entrada
 */
export interface InputEvent extends BaseUIEvent {
  type: UIEventType.INPUT;
  value: any;
  oldValue?: any;
  data?: string;
  inputType: string;
  isComposing: boolean;
  target: EventTarget & {
    value: any;
  };
}

/**
 * Evento de envío
 */
export interface SubmitEvent extends BaseUIEvent {
  type: UIEventType.SUBMIT;
  formData: FormData;
  target: EventTarget & {
    elements: HTMLFormControlsCollection;
    method: string;
    action: string;
    enctype: string;
    encoding: string;
  };
}

/**
 * Evento de arrastre
 */
export interface DragEvent extends BaseUIEvent {
  type: UIEventType.DRAG_START | UIEventType.DRAG | UIEventType.DRAG_END | UIEventType.DRAG_ENTER | UIEventType.DRAG_LEAVE | UIEventType.DRAG_OVER | UIEventType.DROP;
  position: EventPosition;
  dataTransfer: DataTransfer;
  relatedTarget?: EventTarget;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Transferencia de datos
 */
export interface DataTransfer {
  dropEffect: string;
  effectAllowed: string;
  files: FileList;
  items: DataTransferItemList;
  types: string[];
  clearData(format?: string): void;
  getData(format: string): string;
  setData(format: string, data: string): void;
  setDragImage(image: Element, x: number, y: number): void;
}

/**
 * Lista de elementos de transferencia
 */
export interface DataTransferItemList {
  length: number;
  add(data: string, type: string): DataTransferItem | null;
  add(file: File): DataTransferItem | null;
  clear(): void;
  remove(index: number): void;
  item(index: number): DataTransferItem | null;
  [index: number]: DataTransferItem;
}

/**
 * Elemento de transferencia
 */
export interface DataTransferItem {
  kind: string;
  type: string;
  getAsFile(): File | null;
  getAsString(callback: (data: string) => void): void;
  webkitGetAsEntry(): any;
}

/**
 * Evento de toque
 */
export interface TouchEvent extends BaseUIEvent {
  type: UIEventType.TOUCH_START | UIEventType.TOUCH_MOVE | UIEventType.TOUCH_END | UIEventType.TOUCH_CANCEL;
  touches: TouchList;
  targetTouches: TouchList;
  changedTouches: TouchList;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Lista de toques
 */
export interface TouchList {
  length: number;
  item(index: number): Touch | null;
  [index: number]: Touch;
}

/**
 * Toque
 */
export interface Touch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;
}

/**
 * Evento de gesto
 */
export interface GestureEvent extends BaseUIEvent {
  type: UIEventType.GESTURE_START | UIEventType.GESTURE_CHANGE | UIEventType.GESTURE_END;
  scale: number;
  rotation: number;
  position: EventPosition;
  velocity: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  acceleration: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

/**
 * Evento de scroll
 */
export interface ScrollEvent extends BaseUIEvent {
  type: UIEventType.SCROLL | UIEventType.SCROLL_START | UIEventType.SCROLL_END;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  deltaMode: number;
}

/**
 * Evento de redimensionamiento
 */
export interface ResizeEvent extends BaseUIEvent {
  type: UIEventType.RESIZE;
  width: number;
  height: number;
  oldWidth?: number;
  oldHeight?: number;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  devicePixelRatio: number;
}

/**
 * Evento de visibilidad
 */
export interface VisibilityEvent extends BaseUIEvent {
  type: UIEventType.VISIBILITY_CHANGE | UIEventType.PAGE_SHOW | UIEventType.PAGE_HIDE;
  hidden: boolean;
  visibilityState: string;
  timeStamp: number;
}

/**
 * Evento de carga
 */
export interface LoadEvent extends BaseUIEvent {
  type: UIEventType.LOAD | UIEventType.UNLOAD | UIEventType.BEFORE_UNLOAD;
  target: EventTarget;
  timeStamp: number;
}

/**
 * Evento de error
 */
export interface ErrorEvent extends BaseUIEvent {
  type: UIEventType.ERROR | UIEventType.ABORT;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  target: EventTarget;
}

/**
 * Evento de copia/pegado
 */
export interface ClipboardEvent extends BaseUIEvent {
  type: UIEventType.COPY | UIEventType.CUT | UIEventType.PASTE;
  clipboardData: DataTransfer;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Evento de contexto
 */
export interface ContextMenuEvent extends BaseUIEvent {
  type: UIEventType.CONTEXT_MENU;
  position: EventPosition;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  relatedTarget?: EventTarget;
  detail: number;
  which: number;
}

/**
 * Evento de animación
 */
export interface AnimationEvent extends BaseUIEvent {
  type: UIEventType.ANIMATION_START | UIEventType.ANIMATION_END | UIEventType.ANIMATION_ITERATION;
  animationName: string;
  elapsedTime: number;
  pseudoElement: string;
}

/**
 * Evento de transición
 */
export interface TransitionEvent extends BaseUIEvent {
  type: UIEventType.TRANSITION_START | UIEventType.TRANSITION_END;
  propertyName: string;
  elapsedTime: number;
  pseudoElement: string;
}

/**
 * Evento de metaverso
 */
export interface MetaverseEvent extends BaseUIEvent {
  type: UIEventType.AVATAR_MOVE | UIEventType.AVATAR_INTERACT | UIEventType.WORLD_JOIN | UIEventType.WORLD_LEAVE | UIEventType.CHAT_MESSAGE | UIEventType.NFT_SELECT | UIEventType.TRANSACTION_COMPLETE;
  avatarId?: string;
  worldId?: string;
  userId?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  interaction?: {
    type: string;
    target: string;
    parameters: Record<string, any>;
  };
  message?: {
    content: string;
    type: string;
    timestamp: number;
  };
  nft?: {
    id: string;
    contractAddress: string;
    tokenId: string;
  };
  transaction?: {
    hash: string;
    status: string;
    amount: string;
  };
}

/**
 * Evento de sistema
 */
export interface SystemEvent extends BaseUIEvent {
  type: UIEventType.SYSTEM_MESSAGE | UIEventType.NOTIFICATION | UIEventType.ALERT | UIEventType.CONFIRM | UIEventType.PROMPT;
  level: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  code?: string;
  actions?: SystemAction[];
  timeout?: number;
  persistent?: boolean;
  dismissible?: boolean;
  priority?: number;
  category?: string;
  tags?: string[];
}

/**
 * Acción del sistema
 */
export interface SystemAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'modal';
  action: string;
  parameters?: Record<string, any>;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Configuración de evento
 */
export interface EventConfig {
  type: UIEventType;
  target: EventTarget;
  handler: EventHandler;
  options?: EventOptions;
  metadata?: Record<string, any>;
}

/**
 * Opciones de evento
 */
export interface EventOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  debounce?: number;
  throttle?: number;
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff: number;
  };
  timeout?: number;
  priority?: number;
  metadata?: Record<string, any>;
}

/**
 * Manejador de evento
 */
export interface EventHandler {
  (event: BaseUIEvent): void | Promise<void>;
  id?: string;
  name?: string;
  description?: string;
  async?: boolean;
  debounced?: boolean;
  throttled?: boolean;
  retryable?: boolean;
  timeout?: number;
  priority?: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de evento
 */
export interface EventListener {
  type: UIEventType;
  target: EventTarget;
  handler: EventHandler;
  options?: EventOptions;
  active: boolean;
  added: number;
  removed?: number;
  calls: number;
  errors: number;
  totalTime: number;
  averageTime: number;
  lastCall?: number;
  metadata?: Record<string, any>;
}

/**
 * Utilidades de evento
 */
export interface EventUtils {
  /**
   * Crea evento UI
   */
  createEvent: <T extends BaseUIEvent>(type: UIEventType, target: EventTarget, data?: Partial<T>) => T;
  
  /**
   * Valida evento UI
   */
  validateEvent: (event: BaseUIEvent) => boolean;
  
  /**
   * Serializa evento UI
   */
  serializeEvent: (event: BaseUIEvent) => string;
  
  /**
   * Deserializa evento UI
   */
  deserializeEvent: (data: string) => BaseUIEvent;
  
  /**
   * Clona evento UI
   */
  cloneEvent: <T extends BaseUIEvent>(event: T) => T;
  
  /**
   * Combina eventos UI
   */
  mergeEvents: (events: BaseUIEvent[]) => BaseUIEvent;
  
  /**
   * Genera ID de evento
   */
  generateEventId: () => EventId;
  
  /**
   * Verifica si evento es de mouse
   */
  isMouseEvent: (event: BaseUIEvent) => event is MouseEvent;
  
  /**
   * Verifica si evento es de teclado
   */
  isKeyboardEvent: (event: BaseUIEvent) => event is KeyboardEvent;
  
  /**
   * Verifica si evento es de foco
   */
  isFocusEvent: (event: BaseUIEvent) => event is FocusEvent;
  
  /**
   * Verifica si evento es de cambio
   */
  isChangeEvent: (event: BaseUIEvent) => event is ChangeEvent;
  
  /**
   * Verifica si evento es de entrada
   */
  isInputEvent: (event: BaseUIEvent) => event is InputEvent;
  
  /**
   * Verifica si evento es de envío
   */
  isSubmitEvent: (event: BaseUIEvent) => event is SubmitEvent;
  
  /**
   * Verifica si evento es de arrastre
   */
  isDragEvent: (event: BaseUIEvent) => event is DragEvent;
  
  /**
   * Verifica si evento es de toque
   */
  isTouchEvent: (event: BaseUIEvent) => event is TouchEvent;
  
  /**
   * Verifica si evento es de gesto
   */
  isGestureEvent: (event: BaseUIEvent) => event is GestureEvent;
  
  /**
   * Verifica si evento es de scroll
   */
  isScrollEvent: (event: BaseUIEvent) => event is ScrollEvent;
  
  /**
   * Verifica si evento es de redimensionamiento
   */
  isResizeEvent: (event: BaseUIEvent) => event is ResizeEvent;
  
  /**
   * Verifica si evento es de visibilidad
   */
  isVisibilityEvent: (event: BaseUIEvent) => event is VisibilityEvent;
  
  /**
   * Verifica si evento es de carga
   */
  isLoadEvent: (event: BaseUIEvent) => event is LoadEvent;
  
  /**
   * Verifica si evento es de error
   */
  isErrorEvent: (event: BaseUIEvent) => event is ErrorEvent;
  
  /**
   * Verifica si evento es de portapapeles
   */
  isClipboardEvent: (event: BaseUIEvent) => event is ClipboardEvent;
  
  /**
   * Verifica si evento es de contexto
   */
  isContextMenuEvent: (event: BaseUIEvent) => event is ContextMenuEvent;
  
  /**
   * Verifica si evento es de animación
   */
  isAnimationEvent: (event: BaseUIEvent) => event is AnimationEvent;
  
  /**
   * Verifica si evento es de transición
   */
  isTransitionEvent: (event: BaseUIEvent) => event is TransitionEvent;
  
  /**
   * Verifica si evento es de metaverso
   */
  isMetaverseEvent: (event: BaseUIEvent) => event is MetaverseEvent;
  
  /**
   * Verifica si evento es de sistema
   */
  isSystemEvent: (event: BaseUIEvent) => event is SystemEvent;
  
  /**
   * Obtiene tipo de evento
   */
  getEventType: (event: BaseUIEvent) => UIEventType;
  
  /**
   * Obtiene objetivo del evento
   */
  getEventTarget: (event: BaseUIEvent) => EventTarget;
  
  /**
   * Obtiene posición del evento
   */
  getEventPosition: (event: BaseUIEvent) => EventPosition | null;
  
  /**
   * Obtiene información del evento
   */
  getEventInfo: (event: BaseUIEvent) => EventInfo;
  
  /**
   * Previene comportamiento por defecto
   */
  preventDefault: (event: BaseUIEvent) => void;
  
  /**
   * Detiene propagación
   */
  stopPropagation: (event: BaseUIEvent) => void;
  
  /**
   * Detiene propagación inmediata
   */
  stopImmediatePropagation: (event: BaseUIEvent) => void;
  
  /**
   * Registra evento
   */
  registerEvent: (event: BaseUIEvent) => void;
  
  /**
   * Desregistra evento
   */
  unregisterEvent: (eventId: EventId) => void;
  
  /**
   * Obtiene evento por ID
   */
  getEvent: (eventId: EventId) => BaseUIEvent | null;
  
  /**
   * Lista todos los eventos
   */
  listEvents: () => BaseUIEvent[];
  
  /**
   * Filtra eventos
   */
  filterEvents: (filter: (event: BaseUIEvent) => boolean) => BaseUIEvent[];
  
  /**
   * Ordena eventos
   */
  sortEvents: (events: BaseUIEvent[], sorter: (a: BaseUIEvent, b: BaseUIEvent) => number) => BaseUIEvent[];
  
  /**
   * Agrupa eventos
   */
  groupEvents: (events: BaseUIEvent[], grouper: (event: BaseUIEvent) => string) => Record<string, BaseUIEvent[]>;
  
  /**
   * Exporta eventos
   */
  exportEvents: (events: BaseUIEvent[]) => string;
  
  /**
   * Importa eventos
   */
  importEvents: (data: string) => BaseUIEvent[];
  
  /**
   * Valida eventos
   */
  validateEvents: (events: BaseUIEvent[]) => boolean;
  
  /**
   * Optimiza eventos
   */
  optimizeEvents: (events: BaseUIEvent[]) => BaseUIEvent[];
  
  /**
   * Limpia eventos
   */
  cleanupEvents: (events: BaseUIEvent[]) => BaseUIEvent[];
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de evento
 */
export interface EventEvent {
  type: 'created' | 'fired' | 'handled' | 'cancelled' | 'error';
  event: BaseUIEvent;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de eventos
 */
export interface EventEventListener {
  onEventCreated: (event: EventEvent) => void;
  onEventFired: (event: EventEvent) => void;
  onEventHandled: (event: EventEvent) => void;
  onEventCancelled: (event: EventEvent) => void;
  onEventError: (event: EventEvent) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  EventId,
  BaseUIEvent,
  EventTarget,
  EventPosition,
  EventInfo,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  ChangeEvent,
  InputEvent,
  SubmitEvent,
  DragEvent,
  DataTransfer,
  DataTransferItemList,
  DataTransferItem,
  TouchEvent,
  TouchList,
  Touch,
  GestureEvent,
  ScrollEvent,
  ResizeEvent,
  VisibilityEvent,
  LoadEvent,
  ErrorEvent,
  ClipboardEvent,
  ContextMenuEvent,
  AnimationEvent,
  TransitionEvent,
  MetaverseEvent,
  SystemEvent,
  SystemAction,
  EventConfig,
  EventOptions,
  EventHandler,
  EventListener,
  EventUtils,
  EventEvent,
  EventEventListener
};

export {
  UIEventType,
  EventPhase,
  EventState
}; 