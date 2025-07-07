/**
 * @fileoverview Tipos para avatares del metaverso
 * @module @types/metaverso/avatar
 */

import { WorldCoordinates, WorldRotation } from './world';

// ============================================================================
// TIPOS BÁSICOS DEL AVATAR
// ============================================================================

/**
 * Identificador único de un avatar
 */
export type AvatarId = string;

/**
 * Modelo base del avatar
 */
export interface AvatarModel {
  id: string;
  name: string;
  mesh: string; // URL del modelo 3D
  skeleton: string; // URL del esqueleto
  animations: AvatarAnimation[];
  defaultPose: AvatarPose;
}

/**
 * Apariencia del avatar
 */
export interface AvatarAppearance {
  // Características físicas
  height: number;
  weight: number;
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  
  // Ropa y accesorios
  clothing: AvatarClothing;
  accessories: AvatarAccessory[];
  
  // Personalización
  customizations: AvatarCustomization[];
}

/**
 * Ropa del avatar
 */
export interface AvatarClothing {
  head?: string;
  torso?: string;
  legs?: string;
  feet?: string;
  hands?: string;
  back?: string;
}

/**
 * Accesorio del avatar
 */
export interface AvatarAccessory {
  id: string;
  type: 'hat' | 'glasses' | 'jewelry' | 'backpack' | 'weapon' | 'tool';
  mesh: string;
  position: WorldCoordinates;
  rotation: WorldRotation;
  scale: WorldCoordinates;
}

/**
 * Personalización del avatar
 */
export interface AvatarCustomization {
  id: string;
  type: 'color' | 'texture' | 'shape' | 'size';
  target: string; // Parte del cuerpo o objeto
  value: any;
}

// ============================================================================
// TIPOS DE ANIMACIÓN
// ============================================================================

/**
 * Animación del avatar
 */
export interface AvatarAnimation {
  id: string;
  name: string;
  clip: string; // URL del clip de animación
  duration: number;
  loop: boolean;
  blendMode: 'additive' | 'normal' | 'override';
  weight: number;
}

/**
 * Pose del avatar
 */
export interface AvatarPose {
  bones: {
    [boneName: string]: {
      position: WorldCoordinates;
      rotation: WorldRotation;
      scale: WorldCoordinates;
    };
  };
}

/**
 * Estado de animación
 */
export interface AvatarAnimationState {
  currentAnimation?: string;
  animations: AvatarAnimation[];
  blendTime: number;
  speed: number;
  paused: boolean;
}

// ============================================================================
// TIPOS DE MOVIMIENTO
// ============================================================================

/**
 * Estado de movimiento del avatar
 */
export interface AvatarMovement {
  position: WorldCoordinates;
  rotation: WorldRotation;
  velocity: WorldCoordinates;
  acceleration: WorldCoordinates;
  onGround: boolean;
  jumping: boolean;
  running: boolean;
  walking: boolean;
  idle: boolean;
}

/**
 * Control de movimiento
 */
export interface AvatarMovementControl {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
  crouch: boolean;
}

// ============================================================================
// TIPOS DE INVENTARIO
// ============================================================================

/**
 * Item del inventario
 */
export interface InventoryItem {
  id: string;
  type: 'weapon' | 'tool' | 'consumable' | 'material' | 'nft' | 'currency';
  name: string;
  description: string;
  icon: string;
  mesh?: string;
  quantity: number;
  maxQuantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  nftData?: NFTData;
  stats?: ItemStats;
}

/**
 * Datos NFT del item
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
 * Inventario del avatar
 */
export interface AvatarInventory {
  items: InventoryItem[];
  maxSlots: number;
  usedSlots: number;
  weight: number;
  maxWeight: number;
}

// ============================================================================
// TIPOS DE ESTADÍSTICAS
// ============================================================================

/**
 * Estadísticas del avatar
 */
export interface AvatarStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  luck: number;
}

/**
 * Progreso del avatar
 */
export interface AvatarProgress {
  achievements: Achievement[];
  quests: Quest[];
  skills: Skill[];
  reputation: Reputation[];
}

/**
 * Logro del avatar
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
  reward?: Reward;
}

/**
 * Misión del avatar
 */
export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly';
  status: 'available' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  reward?: Reward;
}

/**
 * Objetivo de misión
 */
export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

/**
 * Habilidad del avatar
 */
export interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  maxLevel: number;
  description: string;
  icon: string;
}

/**
 * Reputación del avatar
 */
export interface Reputation {
  faction: string;
  level: number;
  experience: number;
  maxExperience: number;
  standing: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored' | 'revered' | 'exalted';
}

/**
 * Recompensa
 */
export interface Reward {
  experience?: number;
  currency?: { type: string; amount: number }[];
  items?: InventoryItem[];
  reputation?: { faction: string; amount: number }[];
}

// ============================================================================
// TIPOS DE COMUNICACIÓN
// ============================================================================

/**
 * Chat del avatar
 */
export interface AvatarChat {
  messages: ChatMessage[];
  muted: boolean;
  language: string;
  autoTranslate: boolean;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id: string;
  sender: AvatarId;
  content: string;
  timestamp: number;
  type: 'text' | 'voice' | 'emote' | 'system';
  target?: AvatarId | 'all' | 'nearby';
}

/**
 * Emote del avatar
 */
export interface AvatarEmote {
  id: string;
  name: string;
  animation: string;
  duration: number;
  sound?: string;
  particles?: string;
}

// ============================================================================
// TIPOS DE ESTADO
// ============================================================================

/**
 * Estado del avatar
 */
export interface AvatarState {
  id: AvatarId;
  name: string;
  model: AvatarModel;
  appearance: AvatarAppearance;
  movement: AvatarMovement;
  animation: AvatarAnimationState;
  inventory: AvatarInventory;
  stats: AvatarStats;
  progress: AvatarProgress;
  chat: AvatarChat;
  
  // Metadatos
  walletAddress: string;
  worldId: string;
  createdAt: number;
  lastActive: number;
  
  // Configuración
  settings: AvatarSettings;
  permissions: AvatarPermissions;
}

/**
 * Configuración del avatar
 */
export interface AvatarSettings {
  privacy: {
    showName: boolean;
    showStats: boolean;
    allowMessages: boolean;
    allowInvites: boolean;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    shadows: boolean;
    particles: boolean;
    reflections: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
  };
  controls: {
    sensitivity: number;
    invertY: boolean;
    keyBindings: { [key: string]: string };
  };
}

/**
 * Permisos del avatar
 */
export interface AvatarPermissions {
  canBuild: boolean;
  canScript: boolean;
  canTrade: boolean;
  canTeleport: boolean;
  canUseVoice: boolean;
  canModerate: boolean;
  canAdmin: boolean;
}

// ============================================================================
// TIPOS DE CUSTOMIZACIÓN
// ============================================================================

/**
 * Opciones de customización
 */
export interface AvatarCustomizationOptions {
  models: AvatarModel[];
  colors: ColorPalette[];
  textures: TexturePalette[];
  accessories: AccessoryPalette[];
  animations: AnimationPalette[];
}

/**
 * Paleta de colores
 */
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  category: 'skin' | 'hair' | 'eyes' | 'clothing';
}

/**
 * Paleta de texturas
 */
export interface TexturePalette {
  id: string;
  name: string;
  textures: string[];
  category: 'skin' | 'clothing' | 'accessories';
}

/**
 * Paleta de accesorios
 */
export interface AccessoryPalette {
  id: string;
  name: string;
  accessories: AvatarAccessory[];
  category: 'hat' | 'glasses' | 'jewelry' | 'backpack' | 'weapon' | 'tool';
}

/**
 * Paleta de animaciones
 */
export interface AnimationPalette {
  id: string;
  name: string;
  animations: AvatarAnimation[];
  category: 'idle' | 'walk' | 'run' | 'jump' | 'emote' | 'action';
}

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

export type {
  AvatarId,
  AvatarModel,
  AvatarAppearance,
  AvatarClothing,
  AvatarAccessory,
  AvatarCustomization,
  AvatarAnimation,
  AvatarPose,
  AvatarAnimationState,
  AvatarMovement,
  AvatarMovementControl,
  InventoryItem,
  NFTData,
  ItemStats,
  AvatarInventory,
  AvatarStats,
  AvatarProgress,
  Achievement,
  Quest,
  QuestObjective,
  Skill,
  Reputation,
  Reward,
  AvatarChat,
  ChatMessage,
  AvatarEmote,
  AvatarState,
  AvatarSettings,
  AvatarPermissions,
  AvatarCustomizationOptions,
  ColorPalette,
  TexturePalette,
  AccessoryPalette,
  AnimationPalette
}; 