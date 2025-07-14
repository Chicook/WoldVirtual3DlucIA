// Tipos principales del metaverso
export interface Avatar {
  id: string;
  name: string;
  userId: string;
  appearance: AvatarAppearance;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
  isOnline: boolean;
  lastSeen: number;
  metadata: AvatarMetadata;
}

export interface AvatarAppearance {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothing: ClothingItem[];
  accessories: AccessoryItem[];
  animations: AnimationState[];
}

export interface AvatarMetadata {
  level: number;
  experience: number;
  achievements: Achievement[];
  badges: Badge[];
  customData: Record<string, any>;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ClothingItem {
  id: string;
  name: string;
  type: 'shirt' | 'pants' | 'shoes' | 'hat' | 'accessory';
  color: string;
  texture?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AccessoryItem {
  id: string;
  name: string;
  type: 'glasses' | 'jewelry' | 'backpack' | 'weapon';
  model: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface AnimationState {
  name: string;
  isPlaying: boolean;
  speed: number;
  loop: boolean;
  blendWeight: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
  category: 'social' | 'exploration' | 'creation' | 'trading';
}

// Tipos de inventario
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'tool' | 'consumable' | 'material' | 'cosmetic';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  maxStack: number;
  icon: string;
  model?: string;
  metadata: ItemMetadata;
  createdAt: number;
  lastModified: number;
}

export interface ItemMetadata {
  durability?: number;
  maxDurability?: number;
  damage?: number;
  defense?: number;
  effects?: ItemEffect[];
  customData: Record<string, any>;
}

export interface ItemEffect {
  type: 'buff' | 'debuff' | 'heal' | 'damage';
  value: number;
  duration: number;
  description: string;
}

export interface InventorySystemState {
  items: InventoryItem[];
  isOpen: boolean;
  selectedItem: InventoryItem | null;
  maxSlots: number;
  usedSlots: number;
}

export interface InventoryAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'UPDATE_ITEM' | 'SELECT_ITEM' | 'TOGGLE_INVENTORY';
  itemId?: string;
  item?: InventoryItem;
  quantity?: number;
}

// Tipos de mundo y entorno
export interface Environment {
  id: string;
  name: string;
  description: string;
  baseColor: string;
  skybox: string;
  lighting: LightingConfig;
  weather: WeatherConfig;
  terrain: TerrainConfig;
  objects: WorldObject[];
  spawnPoints: SpawnPoint[];
}

export interface LightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  shadowMapSize: number;
  shadowBias: number;
  fogColor: string;
  fogDensity: number;
}

export interface WeatherConfig {
  type: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm';
  intensity: number;
  windSpeed: number;
  windDirection: Vector3;
  temperature: number;
  humidity: number;
}

export interface TerrainConfig {
  heightMap: string;
  textureMap: string;
  normalMap: string;
  scale: Vector3;
  resolution: number;
  maxHeight: number;
  minHeight: number;
}

export interface WorldObject {
  id: string;
  name: string;
  type: 'building' | 'tree' | 'rock' | 'furniture' | 'decoration';
  model: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  collider: Collider;
  interactable: boolean;
  metadata: ObjectMetadata;
}

export interface Collider {
  type: 'box' | 'sphere' | 'capsule' | 'mesh';
  size: Vector3;
  offset: Vector3;
  isTrigger: boolean;
}

export interface ObjectMetadata {
  health?: number;
  maxHealth?: number;
  damage?: number;
  defense?: number;
  interactable: boolean;
  customData: Record<string, any>;
}

export interface SpawnPoint {
  id: string;
  name: string;
  position: Vector3;
  rotation: Vector3;
  isActive: boolean;
  maxPlayers: number;
  currentPlayers: number;
}

// Tipos de interacción
export interface Interaction {
  id: string;
  type: 'pickup' | 'use' | 'talk' | 'trade' | 'craft';
  targetId: string;
  targetType: 'object' | 'avatar' | 'npc';
  position: Vector3;
  range: number;
  cooldown: number;
  lastUsed: number;
  requirements: InteractionRequirement[];
}

export interface InteractionRequirement {
  type: 'level' | 'item' | 'quest' | 'skill';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains';
}

// Tipos de chat y comunicación
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'global' | 'local' | 'private' | 'group';
  timestamp: number;
  metadata: ChatMetadata;
}

export interface ChatMetadata {
  channel?: string;
  recipientId?: string;
  groupId?: string;
  isSystem: boolean;
  isEncrypted: boolean;
  attachments: ChatAttachment[];
}

export interface ChatAttachment {
  type: 'image' | 'file' | 'location' | 'item';
  url?: string;
  data?: any;
  size?: number;
  name?: string;
}

// Tipos de blockchain y Web3
export interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string;
  network: string;
  isConnecting: boolean;
  error: string | null;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  network: string;
  type: 'transfer' | 'swap' | 'mint' | 'stake' | 'governance';
}

export interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  metadata: NFTMetadata;
  owner: string;
  price?: string;
  isForSale: boolean;
  createdAt: number;
}

export interface NFTMetadata {
  attributes: NFTAttribute[];
  externalUrl?: string;
  animationUrl?: string;
  background?: string;
  customData: Record<string, any>;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity?: number;
}

// Tipos de configuración
export interface MetaversoConfig {
  version: string;
  environment: string;
  apiUrl: string;
  wsUrl: string;
  blockchain: BlockchainConfig;
  graphics: GraphicsConfig;
  audio: AudioConfig;
  networking: NetworkingConfig;
}

export interface BlockchainConfig {
  networks: Record<string, string>;
  contracts: Record<string, string>;
  gasLimit: number;
  gasPrice: string;
}

export interface GraphicsConfig {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: number;
  antialiasing: boolean;
  shadows: boolean;
  reflections: boolean;
  maxFPS: number;
}

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  spatialAudio: boolean;
  maxDistance: number;
}

export interface NetworkingConfig {
  maxPlayers: number;
  syncRate: number;
  interpolation: boolean;
  compression: boolean;
  timeout: number;
}

// Tipos de eventos
export interface MetaversoEvent {
  type: string;
  data: any;
  timestamp: number;
  source: string;
  target?: string;
}

export interface PlayerEvent extends MetaversoEvent {
  playerId: string;
  position?: Vector3;
  action?: string;
}

export interface WorldEvent extends MetaversoEvent {
  location: Vector3;
  radius: number;
  affectedPlayers: string[];
}

// Tipos de utilidades
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  updateTime: number;
  timestamp: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
} 