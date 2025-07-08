/**
 * @fileoverview Tipos para componentes UI del metaverso
 * @module @types/ui/component
 */

import React from 'react';

// ============================================================================
// TIPOS BÁSICOS DE COMPONENTE
// ============================================================================

/**
 * Identificador único de un componente
 */
export type ComponentId = string;

/**
 * Tipos de componente
 */
export enum ComponentType {
  // Componentes básicos
  BUTTON = 'button',
  INPUT = 'input',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SWITCH = 'switch',
  SLIDER = 'slider',
  PROGRESS = 'progress',
  LOADER = 'loader',
  
  // Componentes de navegación
  NAVBAR = 'navbar',
  SIDEBAR = 'sidebar',
  BREADCRUMB = 'breadcrumb',
  PAGINATION = 'pagination',
  TABS = 'tabs',
  MENU = 'menu',
  DROPDOWN = 'dropdown',
  
  // Componentes de layout
  CONTAINER = 'container',
  GRID = 'grid',
  FLEX = 'flex',
  CARD = 'card',
  PANEL = 'panel',
  MODAL = 'modal',
  DRAWER = 'drawer',
  TOOLTIP = 'tooltip',
  
  // Componentes de datos
  TABLE = 'table',
  LIST = 'list',
  TREE = 'tree',
  CHART = 'chart',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline',
  
  // Componentes de formulario
  FORM = 'form',
  FIELD = 'field',
  VALIDATION = 'validation',
  SUBMIT = 'submit',
  RESET = 'reset',
  
  // Componentes de metaverso
  AVATAR = 'avatar',
  INVENTORY = 'inventory',
  CHAT = 'chat',
  MAP = 'map',
  MINIMAP = 'minimap',
  HUD = 'hud',
  SCOREBOARD = 'scoreboard',
  SETTINGS = 'settings',
  
  // Componentes de blockchain
  WALLET = 'wallet',
  NFT = 'nft',
  TRANSACTION = 'transaction',
  MARKETPLACE = 'marketplace',
  STAKING = 'staking',
  
  // Componentes de audio/video
  AUDIO_PLAYER = 'audio_player',
  VIDEO_PLAYER = 'video_player',
  VOICE_CHAT = 'voice_chat',
  SCREEN_SHARE = 'screen_share',
  
  // Componentes personalizados
  CUSTOM = 'custom'
}

/**
 * Estados de componente
 */
export enum ComponentState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  DISABLED = 'disabled',
  FOCUSED = 'focused',
  HOVERED = 'hovered',
  ACTIVE = 'active',
  SELECTED = 'selected'
}

/**
 * Tamaños de componente
 */
export enum ComponentSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = 'xxl'
}

/**
 * Variantes de componente
 */
export enum ComponentVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  GHOST = 'ghost',
  OUTLINE = 'outline',
  SOLID = 'solid',
  TRANSPARENT = 'transparent'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Componente UI base
 */
export interface UIComponent {
  id: ComponentId;
  type: ComponentType;
  state: ComponentState;
  size: ComponentSize;
  variant: ComponentVariant;
  
  // Propiedades básicas
  props: ComponentProps;
  
  // Estilos
  styles: ComponentStyles;
  
  // Eventos
  events: ComponentEvents;
  
  // Accesibilidad
  accessibility: AccessibilityProps;
  
  // Animaciones
  animations: ComponentAnimations;
  
  // Responsividad
  responsive: ResponsiveProps;
  
  // Metadatos
  metadata: ComponentMetadata;
  
  // Hijos
  children?: UIComponent[];
}

/**
 * Propiedades del componente
 */
export interface ComponentProps {
  // Propiedades básicas
  className?: string;
  id?: string;
  title?: string;
  placeholder?: string;
  value?: any;
  defaultValue?: any;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
  
  // Propiedades de datos
  data?: any;
  options?: ComponentOption[];
  items?: any[];
  selectedItems?: any[];
  multiple?: boolean;
  
  // Propiedades de validación
  validation?: ValidationProps;
  
  // Propiedades de configuración
  config?: Record<string, any>;
  
  // Propiedades personalizadas
  custom?: Record<string, any>;
}

/**
 * Opción de componente
 */
export interface ComponentOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Propiedades de validación
 */
export interface ValidationProps {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
  message?: string;
}

/**
 * Estilos del componente
 */
export interface ComponentStyles {
  // Estilos CSS
  css: React.CSSProperties;
  
  // Clases CSS
  classes: string[];
  
  // Estilos inline
  inline: Record<string, any>;
  
  // Temas
  theme: ThemeProps;
  
  // Estados
  states: ComponentStateStyles;
  
  // Responsividad
  responsive: ResponsiveStyles;
  
  // Animaciones
  animations: AnimationStyles;
}

/**
 * Propiedades de tema
 */
export interface ThemeProps {
  name: string;
  colors: ColorPalette;
  typography: TypographyProps;
  spacing: SpacingProps;
  shadows: ShadowProps;
  borders: BorderProps;
  breakpoints: BreakpointProps;
}

/**
 * Paleta de colores
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  light: string;
  dark: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
}

/**
 * Propiedades de tipografía
 */
export interface TypographyProps {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
  letterSpacing: Record<string, string>;
}

/**
 * Propiedades de espaciado
 */
export interface SpacingProps {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

/**
 * Propiedades de sombras
 */
export interface ShadowProps {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Propiedades de bordes
 */
export interface BorderProps {
  radius: Record<string, string>;
  width: Record<string, string>;
  style: Record<string, string>;
}

/**
 * Propiedades de breakpoints
 */
export interface BreakpointProps {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

/**
 * Estilos de estados
 */
export interface ComponentStateStyles {
  default: React.CSSProperties;
  hover: React.CSSProperties;
  active: React.CSSProperties;
  focus: React.CSSProperties;
  disabled: React.CSSProperties;
  loading: React.CSSProperties;
  error: React.CSSProperties;
  success: React.CSSProperties;
}

/**
 * Estilos responsivos
 */
export interface ResponsiveStyles {
  xs?: React.CSSProperties;
  sm?: React.CSSProperties;
  md?: React.CSSProperties;
  lg?: React.CSSProperties;
  xl?: React.CSSProperties;
  xxl?: React.CSSProperties;
}

/**
 * Estilos de animación
 */
export interface AnimationStyles {
  enter: AnimationProps;
  exit: AnimationProps;
  transition: TransitionProps;
}

/**
 * Propiedades de animación
 */
export interface AnimationProps {
  duration: number;
  easing: string;
  delay?: number;
  keyframes?: string;
}

/**
 * Propiedades de transición
 */
export interface TransitionProps {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Eventos del componente
 */
export interface ComponentEvents {
  onClick?: (event: UIEvent) => void;
  onDoubleClick?: (event: UIEvent) => void;
  onMouseEnter?: (event: UIEvent) => void;
  onMouseLeave?: (event: UIEvent) => void;
  onFocus?: (event: UIEvent) => void;
  onBlur?: (event: UIEvent) => void;
  onChange?: (event: UIEvent) => void;
  onInput?: (event: UIEvent) => void;
  onSubmit?: (event: UIEvent) => void;
  onKeyDown?: (event: UIEvent) => void;
  onKeyUp?: (event: UIEvent) => void;
  onKeyPress?: (event: UIEvent) => void;
  onScroll?: (event: UIEvent) => void;
  onResize?: (event: UIEvent) => void;
  onLoad?: (event: UIEvent) => void;
  onError?: (event: UIEvent) => void;
  custom?: Record<string, (event: UIEvent) => void>;
}

/**
 * Evento UI
 */
export interface UIEvent {
  type: string;
  target: UIComponent;
  currentTarget: UIComponent;
  preventDefault: () => void;
  stopPropagation: () => void;
  data?: any;
  timestamp: number;
}

/**
 * Propiedades de accesibilidad
 */
export interface AccessibilityProps {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  ariaHidden?: boolean;
  ariaDisabled?: boolean;
  ariaRequired?: boolean;
  ariaInvalid?: boolean;
  ariaExpanded?: boolean;
  ariaSelected?: boolean;
  ariaChecked?: boolean;
  ariaValueNow?: number;
  ariaValueMin?: number;
  ariaValueMax?: number;
  ariaValueText?: string;
  tabIndex?: number;
  focusable?: boolean;
  keyboardNavigation?: boolean;
  screenReader?: boolean;
}

/**
 * Animaciones del componente
 */
export interface ComponentAnimations {
  enabled: boolean;
  enter: AnimationConfig;
  exit: AnimationConfig;
  transition: TransitionConfig;
  keyframes: KeyframeConfig[];
}

/**
 * Configuración de animación
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
  playState?: 'running' | 'paused';
}

/**
 * Configuración de transición
 */
export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Configuración de keyframes
 */
export interface KeyframeConfig {
  name: string;
  keyframes: Record<string, React.CSSProperties>;
}

/**
 * Propiedades responsivas
 */
export interface ResponsiveProps {
  breakpoint: string;
  hidden: boolean;
  size: ComponentSize;
  layout: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  gap?: string;
  padding?: string;
  margin?: string;
}

/**
 * Metadatos del componente
 */
export interface ComponentMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  category: string;
  dependencies: string[];
  documentation?: string;
  examples?: ComponentExample[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Ejemplo de componente
 */
export interface ComponentExample {
  id: string;
  title: string;
  description: string;
  code: string;
  preview: string;
  props: Record<string, any>;
}

// ============================================================================
// TIPOS DE COMPONENTES ESPECÍFICOS
// ============================================================================

/**
 * Componente de botón
 */
export interface ButtonComponent extends UIComponent {
  type: ComponentType.BUTTON;
  props: ButtonProps;
  events: ButtonEvents;
}

/**
 * Propiedades de botón
 */
export interface ButtonProps extends ComponentProps {
  text: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  elevated?: boolean;
  ripple?: boolean;
}

/**
 * Eventos de botón
 */
export interface ButtonEvents extends ComponentEvents {
  onPress?: (event: UIEvent) => void;
  onLongPress?: (event: UIEvent) => void;
}

/**
 * Componente de entrada
 */
export interface InputComponent extends UIComponent {
  type: ComponentType.INPUT;
  props: InputProps;
  events: InputEvents;
}

/**
 * Propiedades de entrada
 */
export interface InputProps extends ComponentProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autocomplete?: string;
  autofocus?: boolean;
  spellcheck?: boolean;
  clearable?: boolean;
  prefix?: string;
  suffix?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
}

/**
 * Eventos de entrada
 */
export interface InputEvents extends ComponentEvents {
  onClear?: (event: UIEvent) => void;
  onEnter?: (event: UIEvent) => void;
  onEscape?: (event: UIEvent) => void;
}

/**
 * Componente de selección
 */
export interface SelectComponent extends UIComponent {
  type: ComponentType.SELECT;
  props: SelectProps;
  events: SelectEvents;
}

/**
 * Propiedades de selección
 */
export interface SelectProps extends ComponentProps {
  options: ComponentOption[];
  value?: any;
  defaultValue?: any;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  noOptionsText?: string;
  loadingText?: string;
  maxHeight?: string;
  virtualized?: boolean;
}

/**
 * Eventos de selección
 */
export interface SelectEvents extends ComponentEvents {
  onOptionSelect?: (option: ComponentOption, event: UIEvent) => void;
  onOptionDeselect?: (option: ComponentOption, event: UIEvent) => void;
  onSearch?: (query: string, event: UIEvent) => void;
  onClear?: (event: UIEvent) => void;
}

/**
 * Componente de tabla
 */
export interface TableComponent extends UIComponent {
  type: ComponentType.TABLE;
  props: TableProps;
  events: TableEvents;
}

/**
 * Propiedades de tabla
 */
export interface TableProps extends ComponentProps {
  columns: TableColumn[];
  data: any[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyText?: string;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  virtualized?: boolean;
}

/**
 * Columna de tabla
 */
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

/**
 * Eventos de tabla
 */
export interface TableEvents extends ComponentEvents {
  onRowSelect?: (selectedRows: any[], event: UIEvent) => void;
  onRowClick?: (record: any, index: number, event: UIEvent) => void;
  onSort?: (column: TableColumn, order: 'asc' | 'desc', event: UIEvent) => void;
  onFilter?: (filters: Record<string, any>, event: UIEvent) => void;
  onPageChange?: (page: number, pageSize: number, event: UIEvent) => void;
}

/**
 * Componente de avatar
 */
export interface AvatarComponent extends UIComponent {
  type: ComponentType.AVATAR;
  props: AvatarProps;
  events: AvatarEvents;
}

/**
 * Propiedades de avatar
 */
export interface AvatarProps extends ComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: ComponentSize;
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  statusColor?: string;
  fallback?: string;
  group?: boolean;
  maxCount?: number;
  overlap?: boolean;
}

/**
 * Eventos de avatar
 */
export interface AvatarEvents extends ComponentEvents {
  onAvatarClick?: (avatar: any, event: UIEvent) => void;
  onStatusChange?: (status: string, event: UIEvent) => void;
}

/**
 * Componente de inventario
 */
export interface InventoryComponent extends UIComponent {
  type: ComponentType.INVENTORY;
  props: InventoryProps;
  events: InventoryEvents;
}

/**
 * Propiedades de inventario
 */
export interface InventoryProps extends ComponentProps {
  items: InventoryItem[];
  maxSlots: number;
  usedSlots: number;
  weight: number;
  maxWeight: number;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  gridView?: boolean;
  listView?: boolean;
  showWeight?: boolean;
  showRarity?: boolean;
}

/**
 * Item de inventario
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  maxQuantity: number;
  weight: number;
  stackable: boolean;
  tradeable: boolean;
  droppable: boolean;
  nftData?: NFTData;
  stats?: ItemStats;
  metadata?: Record<string, any>;
}

/**
 * Datos NFT
 */
export interface NFTData {
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  metadata: any;
}

/**
 * Estadísticas del item
 */
export interface ItemStats {
  damage?: number;
  defense?: number;
  speed?: number;
  durability?: number;
  magic?: number;
}

/**
 * Eventos de inventario
 */
export interface InventoryEvents extends ComponentEvents {
  onItemSelect?: (item: InventoryItem, event: UIEvent) => void;
  onItemUse?: (item: InventoryItem, event: UIEvent) => void;
  onItemDrop?: (item: InventoryItem, event: UIEvent) => void;
  onItemTrade?: (item: InventoryItem, event: UIEvent) => void;
  onItemSort?: (items: InventoryItem[], event: UIEvent) => void;
  onItemFilter?: (filteredItems: InventoryItem[], event: UIEvent) => void;
}

/**
 * Componente de chat
 */
export interface ChatComponent extends UIComponent {
  type: ComponentType.CHAT;
  props: ChatProps;
  events: ChatEvents;
}

/**
 * Propiedades de chat
 */
export interface ChatProps extends ComponentProps {
  messages: ChatMessage[];
  channels: ChatChannel[];
  activeChannel?: string;
  maxMessages?: number;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  showAvatars?: boolean;
  showTyping?: boolean;
  showReadReceipts?: boolean;
  emojiPicker?: boolean;
  fileUpload?: boolean;
  voiceMessage?: boolean;
  moderation?: boolean;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id: string;
  sender: ChatUser;
  content: string;
  type: 'text' | 'voice' | 'emote' | 'system' | 'file' | 'nft';
  timestamp: number;
  edited?: boolean;
  deleted?: boolean;
  replyTo?: string;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  readBy?: string[];
}

/**
 * Usuario de chat
 */
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  role: 'user' | 'moderator' | 'admin';
  verified: boolean;
}

/**
 * Adjunto de chat
 */
export interface ChatAttachment {
  type: 'image' | 'audio' | 'video' | 'file' | 'nft';
  url: string;
  name?: string;
  size?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Reacción de chat
 */
export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[];
}

/**
 * Canal de chat
 */
export interface ChatChannel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description?: string;
  icon?: string;
  unreadCount: number;
  lastMessage?: ChatMessage;
  participants?: ChatUser[];
  permissions?: string[];
}

/**
 * Eventos de chat
 */
export interface ChatEvents extends ComponentEvents {
  onMessageSend?: (message: ChatMessage, event: UIEvent) => void;
  onMessageEdit?: (message: ChatMessage, event: UIEvent) => void;
  onMessageDelete?: (messageId: string, event: UIEvent) => void;
  onChannelSelect?: (channel: ChatChannel, event: UIEvent) => void;
  onUserSelect?: (user: ChatUser, event: UIEvent) => void;
  onReactionAdd?: (messageId: string, reaction: ChatReaction, event: UIEvent) => void;
  onReactionRemove?: (messageId: string, reaction: ChatReaction, event: UIEvent) => void;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de componentes
 */
export interface ComponentUtils {
  /**
   * Crea componente
   */
  createComponent: (type: ComponentType, props?: Partial<ComponentProps>) => UIComponent;
  
  /**
   * Valida componente
   */
  validateComponent: (component: UIComponent) => boolean;
  
  /**
   * Clona componente
   */
  cloneComponent: (component: UIComponent) => UIComponent;
  
  /**
   * Combina componentes
   */
  mergeComponents: (components: UIComponent[]) => UIComponent;
  
  /**
   * Genera ID de componente
   */
  generateComponentId: () => ComponentId;
  
  /**
   * Obtiene componente por ID
   */
  getComponentById: (id: ComponentId, components: UIComponent[]) => UIComponent | undefined;
  
  /**
   * Encuentra componentes por tipo
   */
  findComponentsByType: (type: ComponentType, components: UIComponent[]) => UIComponent[];
  
  /**
   * Encuentra componentes por estado
   */
  findComponentsByState: (state: ComponentState, components: UIComponent[]) => UIComponent[];
  
  /**
   * Actualiza componente
   */
  updateComponent: (component: UIComponent, updates: Partial<UIComponent>) => UIComponent;
  
  /**
   * Elimina componente
   */
  removeComponent: (id: ComponentId, components: UIComponent[]) => UIComponent[];
  
  /**
   * Renderiza componente
   */
  renderComponent: (component: UIComponent) => React.ReactNode;
  
  /**
   * Serializa componente
   */
  serializeComponent: (component: UIComponent) => string;
  
  /**
   * Deserializa componente
   */
  deserializeComponent: (data: string) => UIComponent;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ComponentId,
  UIComponent,
  ComponentProps,
  ComponentOption,
  ValidationProps,
  ComponentStyles,
  ThemeProps,
  ColorPalette,
  TypographyProps,
  SpacingProps,
  ShadowProps,
  BorderProps,
  BreakpointProps,
  ComponentStateStyles,
  ResponsiveStyles,
  AnimationStyles,
  AnimationProps,
  TransitionProps,
  ComponentEvents,
  UIEvent,
  AccessibilityProps,
  ComponentAnimations,
  AnimationConfig,
  TransitionConfig,
  KeyframeConfig,
  ResponsiveProps,
  ComponentMetadata,
  ComponentExample,
  ButtonComponent,
  ButtonProps,
  ButtonEvents,
  InputComponent,
  InputProps,
  InputEvents,
  SelectComponent,
  SelectProps,
  SelectEvents,
  TableComponent,
  TableProps,
  TableColumn,
  TableEvents,
  AvatarComponent,
  AvatarProps,
  AvatarEvents,
  InventoryComponent,
  InventoryProps,
  InventoryItem,
  NFTData,
  ItemStats,
  InventoryEvents,
  ChatComponent,
  ChatProps,
  ChatMessage,
  ChatUser,
  ChatAttachment,
  ChatReaction,
  ChatChannel,
  ChatEvents,
  ComponentUtils
};

export {
  ComponentType,
  ComponentState,
  ComponentSize,
  ComponentVariant
}; 