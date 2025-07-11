

// Tipos básicos para el sistema de Metaverso
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Scale {
  x: number;
  y: number;
  z: number;
}

// Tipos de ambiente
export type Environment = 'indoor' | 'outdoor' | 'underground' | 'space' | 'underwater' | 'desert' | 'forest' | 'urban';

// Avatar básico
export interface Avatar {
  id: string;
  name: string;
  position: Position;
  rotation: Rotation;
  scale: Scale;
  model: string;
  texture: string;
  animations: string[];
  currentAnimation: string;
  health: number;
  energy: number;
  level: number;
  experience: number;
  equipment: Record<string, any>;
  customization: Record<string, any>;
}

// Mundo básico
export interface World {
  id: string;
  name: string;
  description: string;
  position: Position;
  maxPlayers: number;
  currentPlayers: number;
  environment: Environment;
  assets: any[];
  active: boolean;
}

// Mensaje de chat
export interface ChatMessage {
  id: string;
  text: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
    level: number;
    guild?: string;
  };
  timestamp: Date;
  type: 'text' | 'system' | 'trade' | 'guild' | 'whisper' | 'emote';
  channel: string;
  roomId: string;
  mentions: string[];
  attachments: any[];
  reactions: any[];
  edited: boolean;
  deleted: boolean;
}

// Wallet básico
export interface Wallet {
  address: string;
  balance: Currency;
  assets: any[];
  transactions: any[];
  connected: boolean;
  network: string;
  gasPrice: number;
  nonce: number;
}

// Moneda básica
export interface Currency {
  gold: number;
  silver: number;
  copper: number;
  tokens: number;
  crystals: number;
  reputation: Record<string, number>;
}

// Usuario básico
export interface User {
  id: string;
  username: string;
  avatar: Avatar;
  level: number;
  experience: number;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeen: Date;
  reputation: Record<string, number>;
}

// Objeto del mundo
export interface WorldObject {
  id: string;
  name: string;
  type: 'interactive' | 'decorative' | 'functional' | 'portal' | 'spawner';
  position: Position;
  rotation: Rotation;
  scale: Scale;
  model: string;
  texture: string;
  interactive: boolean;
  properties: Record<string, any>;
}

// Estado del metaverso
export interface MetaversoState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  userAvatar: Avatar | null;
  currentWorld: World | null;
  currentScene: string;
  worlds: World[];
  inventory: any[];
  wallet: Wallet | null;
  chatMessages: ChatMessage[];
  settings: UserSettings;
  nearbyUsers: User[];
  nearbyObjects: WorldObject[];
}

// Configuración de usuario
export interface UserSettings {
  graphics: 'low' | 'medium' | 'high' | 'ultra';
  audio: boolean;
  notifications: boolean;
  language: string;
  privacy: 'public' | 'friends' | 'private';
  theme: 'light' | 'dark' | 'auto';
  controls: ControlSettings;
}

// Configuración de controles
export interface ControlSettings {
  mouseSensitivity: number;
  invertY: boolean;
  keyBindings: Record<string, string>;
}

// Acciones del metaverso
export type MetaversoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_METAVERSO'; payload: { userAvatar: Avatar; inventory: any[]; wallet: Wallet } }
  | { type: 'SET_CURRENT_WORLD'; payload: World | null }
  | { type: 'SET_CURRENT_SCENE'; payload: string }
  | { type: 'UPDATE_AVATAR'; payload: Avatar }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'UPDATE_CURRENCY'; payload: Currency };

// Props del provider
export interface MetaversoProviderProps {
  children: React.ReactNode;
}

