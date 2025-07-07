// ============================================================================
// 📝 TIPOS PRINCIPALES - Biblioteca de Componentes 3D
// ============================================================================

import { Object3D, Vector3, Euler, Color } from 'three';
import { ReactNode } from 'react';

// ============================================================================
// 🎮 TIPOS CORE 3D
// ============================================================================

export interface ThreeComponentProps {
  position?: Vector3 | [number, number, number];
  rotation?: Euler | [number, number, number];
  scale?: Vector3 | [number, number, number];
  visible?: boolean;
  userData?: Record<string, any>;
}

export interface SceneProps extends ThreeComponentProps {
  background?: Color | string;
  fog?: {
    color: Color | string;
    near: number;
    far: number;
  };
  children?: ReactNode;
}

export interface Object3DProps extends ThreeComponentProps {
  geometry?: any;
  material?: any;
  model?: string;
  onLoad?: (object: Object3D) => void;
  onError?: (error: Error) => void;
}

export interface LightingProps extends ThreeComponentProps {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  intensity?: number;
  color?: Color | string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface CameraProps extends ThreeComponentProps {
  type: 'perspective' | 'orthographic';
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  controls?: boolean;
}

// ============================================================================
// 👤 TIPOS DE AVATAR
// ============================================================================

export interface AvatarProps extends ThreeComponentProps {
  userId: string;
  model?: string;
  skin?: string;
  clothing?: ClothingItem[];
  animations?: AnimationConfig[];
  onAnimationComplete?: (animation: string) => void;
}

export interface ClothingItem {
  id: string;
  type: 'head' | 'body' | 'legs' | 'feet' | 'accessory';
  model: string;
  texture?: string;
  color?: string;
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
}

export interface AnimationConfig {
  name: string;
  duration: number;
  loop?: boolean;
  easing?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface ExpressionProps {
  type: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';
  intensity?: number;
  duration?: number;
}

// ============================================================================
// 🏗️ TIPOS DEL MUNDO
// ============================================================================

export interface BuildingProps extends Object3DProps {
  type: 'residential' | 'commercial' | 'industrial' | 'landmark';
  floors: number;
  interactive?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

export interface LandscapeProps extends Object3DProps {
  type: 'terrain' | 'vegetation' | 'water' | 'sky';
  biome?: string;
  weather?: WeatherConfig;
  timeOfDay?: number; // 0-24
}

export interface WeatherConfig {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  intensity?: number;
  wind?: number;
  temperature?: number;
}

export interface InteractiveProps extends Object3DProps {
  type: 'button' | 'lever' | 'door' | 'portal' | 'npc';
  action?: () => void;
  hoverText?: string;
  cooldown?: number;
  requirements?: InteractionRequirement[];
}

export interface InteractionRequirement {
  type: 'level' | 'item' | 'quest' | 'permission';
  value: any;
}

export interface PortalProps extends InteractiveProps {
  destination: {
    world: string;
    position: Vector3;
    rotation?: Euler;
  };
  cost?: number;
  currency?: string;
}

// ============================================================================
// 💰 TIPOS CRYPTO/BLOCKCHAIN
// ============================================================================

export interface WalletProps {
  provider: 'metamask' | 'walletconnect' | 'coinbase';
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface NFTProps {
  contractAddress: string;
  tokenId: string;
  metadata?: NFTMetadata;
  onSelect?: (nft: NFTData) => void;
  onTransfer?: (to: string) => void;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTData {
  contractAddress: string;
  tokenId: string;
  owner: string;
  metadata: NFTMetadata;
  price?: number;
}

export interface TokenProps {
  symbol: string;
  balance: number;
  decimals: number;
  price?: number;
  onTransfer?: (to: string, amount: number) => void;
}

export interface TransactionProps {
  type: 'mint' | 'transfer' | 'swap' | 'stake';
  amount: number;
  currency: string;
  recipient?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  gasEstimate?: number;
}

// ============================================================================
// 🎨 TIPOS UI/UX
// ============================================================================

export interface HUDProps {
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  children: ReactNode;
  visible?: boolean;
  opacity?: number;
}

export interface MenuProps {
  items: MenuItem[];
  orientation: 'horizontal' | 'vertical';
  onSelect?: (item: MenuItem) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

export interface ChatProps {
  messages: ChatMessage[];
  onSend?: (message: string) => void;
  maxMessages?: number;
  autoScroll?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'whisper' | 'global';
}

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// 🎯 TIPOS INTERACTIVOS
// ============================================================================

export interface Button3DProps extends InteractiveProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export interface Panel3DProps extends Object3DProps {
  title?: string;
  children: ReactNode;
  draggable?: boolean;
  resizable?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

export interface Modal3DProps extends Panel3DProps {
  backdrop?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface Form3DProps {
  fields: FormField[];
  onSubmit?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export interface FormField {
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
}

// ============================================================================
// 🛠️ TIPOS DE UTILIDADES
// ============================================================================

export interface LoaderProps {
  type: 'spinner' | 'progress' | 'skeleton';
  text?: string;
  progress?: number;
  size?: 'small' | 'medium' | 'large';
}

export interface OptimizerProps {
  targetFPS?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableLOD?: boolean;
  enableCulling?: boolean;
}

export interface ValidatorProps {
  rules: ValidationRule[];
  onValidate?: (isValid: boolean, errors: string[]) => void;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// ============================================================================
// 🎣 TIPOS DE HOOKS
// ============================================================================

export interface UseThreeSceneReturn {
  scene: any;
  camera: any;
  renderer: any;
  controls: any;
  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  animate: () => void;
}

export interface UseAvatarReturn {
  avatar: any;
  animations: string[];
  currentAnimation: string;
  playAnimation: (name: string) => void;
  stopAnimation: () => void;
  updateClothing: (items: ClothingItem[]) => void;
}

export interface UseCryptoReturn {
  account: string | null;
  balance: number;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (tx: any) => Promise<any>;
}

export interface UseMetaversoReturn {
  user: any;
  world: any;
  position: Vector3;
  teleport: (position: Vector3) => void;
  interact: (object: any) => void;
  chat: (message: string) => void;
}

// ============================================================================
// 🔧 TIPOS DE UTILIDADES
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  drawCalls: number;
  triangles: number;
  loadTime: number;
}

export interface AssetConfig {
  url: string;
  type: 'model' | 'texture' | 'audio' | 'video';
  compression?: boolean;
  preload?: boolean;
  cache?: boolean;
}

export interface EventConfig {
  name: string;
  data?: any;
  timestamp: number;
  source: string;
}

// ============================================================================
// 📊 TIPOS DE ESTADO
// ============================================================================

export interface ComponentState {
  loading: boolean;
  error: Error | null;
  data: any;
  lastUpdated: Date;
}

export interface StoreState {
  user: ComponentState;
  world: ComponentState;
  crypto: ComponentState;
  ui: ComponentState;
}

// ============================================================================
// 🎯 TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface ComponentConfig {
  debug: boolean;
  performance: {
    targetFPS: number;
    enableLOD: boolean;
    enableCulling: boolean;
    maxDrawCalls: number;
  };
  quality: {
    textureResolution: number;
    shadowQuality: 'low' | 'medium' | 'high';
    antialiasing: boolean;
  };
  network: {
    timeout: number;
    retries: number;
    cacheSize: number;
  };
} 