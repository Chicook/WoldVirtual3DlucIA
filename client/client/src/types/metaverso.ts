

// Tipos avanzados para el sistema de Metaverso
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

export interface Size {
  width: number;
  height: number;
  depth: number;
}

// Tipos de ambiente avanzados
export type Environment = 'indoor' | 'outdoor' | 'underground' | 'space' | 'underwater' | 'desert' | 'forest' | 'urban';

// Avatar avanzado con sistema de animaciones
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
  skills: Skill[];
  equipment: Equipment;
  customization: AvatarCustomization;
}

// Sistema de habilidades avanzado
export interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  experience: number;
  type: 'combat' | 'social' | 'crafting' | 'exploration' | 'magic';
  effects: SkillEffect[];
  cooldown: number;
  manaCost: number;
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'teleport' | 'summon';
  value: number;
  duration: number;
  target: 'self' | 'enemy' | 'ally' | 'area';
}

// Sistema de equipamiento avanzado
export interface Equipment {
  head?: Item;
  chest?: Item;
  legs?: Item;
  feet?: Item;
  hands?: Item;
  weapon?: Item;
  shield?: Item;
  accessory1?: Item;
  accessory2?: Item;
  accessory3?: Item;
}

// Personalización de avatar avanzada
export interface AvatarCustomization {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  facialFeatures: string[];
  tattoos: Tattoo[];
  scars: Scar[];
  accessories: string[];
}

export interface Tattoo {
  id: string;
  design: string;
  position: Position;
  color: string;
  size: number;
}

export interface Scar {
  id: string;
  type: string;
  position: Position;
  intensity: number;
}

// Mundo avanzado con múltiples capas
export interface World {
  id: string;
  name: string;
  description: string;
  position: Position;
  size: Size;
  maxPlayers: number;
  currentPlayers: number;
  environment: Environment;
  assets: Asset[];
  weather: Weather;
  time: WorldTime;
  physics: PhysicsSettings;
  lighting: LightingSettings;
  audio: AudioSettings;
  events: WorldEvent[];
  npcs: NPC[];
  quests: Quest[];
  shops: Shop[];
  portals: Portal[];
}

// Configuración de física avanzada
export interface PhysicsSettings {
  gravity: number;
  airResistance: number;
  waterDensity: number;
  collisionEnabled: boolean;
  ragdollEnabled: boolean;
  particleSystems: ParticleSystem[];
}

// Sistema de partículas avanzado
export interface ParticleSystem {
  id: string;
  type: 'fire' | 'smoke' | 'sparkle' | 'water' | 'magic' | 'dust';
  position: Position;
  count: number;
  lifetime: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

// Configuración de iluminación avanzada
export interface LightingSettings {
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  directionalPosition: Position;
  shadowsEnabled: boolean;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  fogEnabled: boolean;
  fogColor: string;
  fogDensity: number;
  fogNear: number;
  fogFar: number;
}

// Configuración de audio avanzada
export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  spatialAudio: boolean;
  reverbEnabled: boolean;
  reverbPreset: string;
}

// Tiempo del mundo avanzado
export interface WorldTime {
  currentTime: number; // 0-24 horas
  dayOfYear: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weatherCycle: number;
  dayNightCycle: boolean;
  timeScale: number;
}

// Clima avanzado
export interface Weather {
  type: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' | 'windy';
  intensity: number; // 0-1
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
}

// Eventos del mundo avanzados
export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: 'festival' | 'invasion' | 'natural' | 'social' | 'economic';
  startTime: Date;
  endTime: Date;
  location: Position;
  radius: number;
  participants: string[];
  rewards: Reward[];
  requirements: EventRequirement[];
  active: boolean;
}

// Requisitos de eventos avanzados
export interface EventRequirement {
  type: 'level' | 'skill' | 'item' | 'quest' | 'reputation';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'not';
}

// Recompensas avanzadas
export interface Reward {
  type: 'experience' | 'currency' | 'item' | 'skill' | 'reputation' | 'title';
  value: any;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// NPCs avanzados
export interface NPC {
  id: string;
  name: string;
  type: 'merchant' | 'quest_giver' | 'trainer' | 'guard' | 'citizen' | 'boss';
  position: Position;
  avatar: Avatar;
  dialogue: Dialogue[];
  inventory: Item[];
  services: Service[];
  schedule: NPCSchedule[];
  personality: Personality;
  relationships: Relationship[];
}

// Personalidad de NPC avanzada
export interface Personality {
  traits: string[];
  mood: 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'worried';
  openness: number; // 0-1
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// Relaciones de NPC avanzadas
export interface Relationship {
  targetId: string;
  type: 'friend' | 'enemy' | 'lover' | 'family' | 'mentor' | 'student';
  strength: number; // -1 to 1
  trust: number; // 0-1
  history: RelationshipEvent[];
}

export interface RelationshipEvent {
  type: string;
  description: string;
  timestamp: Date;
  impact: number; // -1 to 1
}

// Horario de NPC avanzado
export interface NPCSchedule {
  dayOfWeek: number; // 0-6
  activities: ScheduledActivity[];
}

export interface ScheduledActivity {
  startTime: number; // 0-24
  endTime: number;
  activity: string;
  location: Position;
}

// Diálogo avanzado
export interface Dialogue {
  id: string;
  text: string;
  speaker: string;
  conditions: DialogueCondition[];
  responses: DialogueResponse[];
  consequences: DialogueConsequence[];
}

export interface DialogueCondition {
  type: 'quest' | 'reputation' | 'item' | 'skill' | 'relationship';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains';
}

export interface DialogueResponse {
  text: string;
  conditions: DialogueCondition[];
  consequences: DialogueConsequence[];
}

export interface DialogueConsequence {
  type: 'reputation' | 'quest' | 'item' | 'relationship';
  value: any;
  target?: string;
}

// Servicios avanzados
export interface Service {
  type: 'trade' | 'repair' | 'craft' | 'train' | 'transport' | 'storage';
  name: string;
  description: string;
  cost: Currency;
  requirements: ServiceRequirement[];
  quality: number; // 0-1
}

export interface ServiceRequirement {
  type: 'level' | 'skill' | 'item' | 'reputation';
  value: any;
}

// Portal avanzado
export interface Portal {
  id: string;
  name: string;
  position: Position;
  destination: PortalDestination;
  requirements: PortalRequirement[];
  cost: Currency;
  cooldown: number;
  active: boolean;
}

export interface PortalDestination {
  worldId: string;
  position: Position;
  orientation: Rotation;
}

export interface PortalRequirement {
  type: 'level' | 'item' | 'quest' | 'reputation';
  value: any;
}

// Tienda avanzada
export interface Shop {
  id: string;
  name: string;
  owner: string;
  position: Position;
  inventory: ShopItem[];
  services: Service[];
  schedule: ShopSchedule;
  reputation: number;
  specialization: string[];
}

export interface ShopItem {
  item: Item;
  price: Currency;
  stock: number;
  maxStock: number;
  restockRate: number;
  quality: number;
}

export interface ShopSchedule {
  openTime: number;
  closeTime: number;
  daysOpen: number[]; // 0-6
  holidays: Date[];
}

// Misiones avanzadas
export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'guild';
  giver: string;
  objectives: QuestObjective[];
  rewards: Reward[];
  requirements: QuestRequirement[];
  timeLimit?: number;
  repeatable: boolean;
  chainId?: string;
  status: 'available' | 'active' | 'completed' | 'failed';
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'collect' | 'kill' | 'talk' | 'reach' | 'craft' | 'explore';
  target: any;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestRequirement {
  type: 'level' | 'quest' | 'reputation' | 'item' | 'skill';
  value: any;
}

// Activos avanzados
export interface Asset {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'audio' | 'animation' | 'script' | 'data';
  url: string;
  size: number;
  format: string;
  metadata: AssetMetadata;
  dependencies: string[];
  tags: string[];
}

export interface AssetMetadata {
  author: string;
  version: string;
  license: string;
  description: string;
  category: string;
  tags: string[];
  properties: Record<string, any>;
}

// Inventario avanzado
export interface InventoryItem {
  id: string;
  item: Item;
  quantity: number;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
  socketed: SocketedItem[];
  bound: boolean;
  tradeable: boolean;
  stackable: boolean;
  maxStack: number;
}

// Item avanzado
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'tool' | 'currency' | 'quest' | 'cosmetic';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  level: number;
  stats: ItemStats;
  effects: ItemEffect[];
  requirements: ItemRequirement[];
  crafting: CraftingInfo;
  trade: TradeInfo;
  model: string;
  icon: string;
  weight: number;
  value: Currency;
}

// Estadísticas de item avanzadas
export interface ItemStats {
  attack?: number;
  defense?: number;
  magic?: number;
  health?: number;
  mana?: number;
  stamina?: number;
  speed?: number;
  critical?: number;
  dodge?: number;
  block?: number;
  resistance: ResistanceStats;
}

export interface ResistanceStats {
  fire: number;
  ice: number;
  lightning: number;
  poison: number;
  physical: number;
  magical: number;
}

// Efectos de item avanzados
export interface ItemEffect {
  type: 'buff' | 'debuff' | 'heal' | 'damage' | 'teleport' | 'summon';
  target: 'self' | 'enemy' | 'ally' | 'area';
  value: number;
  duration: number;
  chance: number;
  conditions: ItemEffectCondition[];
}

export interface ItemEffectCondition {
  type: 'health' | 'mana' | 'time' | 'location' | 'weather';
  value: any;
  operator: 'equals' | 'greater' | 'less';
}

// Requisitos de item avanzados
export interface ItemRequirement {
  type: 'level' | 'strength' | 'dexterity' | 'intelligence' | 'skill' | 'class';
  value: number;
}

// Información de crafteo avanzada
export interface CraftingInfo {
  craftable: boolean;
  recipe?: Recipe;
  difficulty: number;
  time: number;
  tools: string[];
  station: string;
  experience: number;
}

export interface Recipe {
  materials: RecipeMaterial[];
  tools: string[];
  station: string;
  time: number;
  experience: number;
  failureChance: number;
  qualityFactors: QualityFactor[];
}

export interface RecipeMaterial {
  itemId: string;
  quantity: number;
  quality: number;
}

export interface QualityFactor {
  type: 'skill' | 'tool' | 'material' | 'environment';
  factor: number;
}

// Información de comercio avanzada
export interface TradeInfo {
  tradeable: boolean;
  basePrice: Currency;
  marketPrice: Currency;
  demand: number; // 0-1
  supply: number; // 0-1
  volatility: number; // 0-1
  restrictions: TradeRestriction[];
}

export interface TradeRestriction {
  type: 'level' | 'reputation' | 'location' | 'time' | 'quest';
  value: any;
}

// Encantamientos avanzados
export interface Enchantment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'universal';
  effect: EnchantmentEffect;
  level: number;
  maxLevel: number;
  cost: Currency;
  materials: string[];
}

export interface EnchantmentEffect {
  type: 'stat_boost' | 'elemental' | 'special' | 'set_bonus';
  stat?: string;
  value: number;
  element?: string;
  special?: string;
}

// Items con sockets avanzados
export interface SocketedItem {
  socketType: string;
  gem?: Gem;
  enchantment?: Enchantment;
}

export interface Gem {
  id: string;
  name: string;
  type: string;
  color: string;
  effect: GemEffect;
  quality: number;
  level: number;
}

export interface GemEffect {
  type: 'stat' | 'elemental' | 'special';
  value: number;
  element?: string;
  special?: string;
}

// Monedas avanzadas
export interface Currency {
  gold: number;
  silver: number;
  copper: number;
  tokens: number;
  crystals: number;
  reputation: Record<string, number>;
}

// Wallet avanzado
export interface Wallet {
  address: string;
  balance: Currency;
  assets: Asset[];
  transactions: Transaction[];
  connected: boolean;
  network: string;
  gasPrice: number;
  nonce: number;
}

// Transacciones avanzadas
export interface Transaction {
  id: string;
  type: 'transfer' | 'purchase' | 'sale' | 'mint' | 'burn' | 'stake' | 'unstake';
  from: string;
  to: string;
  amount: Currency;
  asset?: Asset;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  gasUsed: number;
  gasPrice: number;
  blockNumber?: number;
  hash: string;
  metadata: Record<string, any>;
}

// Mensajes de chat avanzados
export interface ChatMessage {
  id: string;
  text: string;
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
  mentions: string[];
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  edited: boolean;
  deleted: boolean;
}

export interface ChatAttachment {
  type: 'image' | 'file' | 'item' | 'location';
  url?: string;
  item?: Item;
  position?: Position;
  size: number;
}

export interface ChatReaction {
  emoji: string;
  users: string[];
  count: number;
}

// Configuración de usuario avanzada
export interface UserSettings {
  graphics: 'low' | 'medium' | 'high' | 'ultra';
  audio: boolean;
  notifications: boolean;
  language: string;
  privacy: 'public' | 'friends' | 'private';
  theme: 'light' | 'dark' | 'auto';
  controls: ControlSettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  social: SocialSettings;
}

// Configuración de controles avanzada
export interface ControlSettings {
  mouseSensitivity: number;
  invertY: boolean;
  keyBindings: Record<string, string>;
  gamepadEnabled: boolean;
  gamepadSensitivity: number;
  autoRun: boolean;
  toggleCrouch: boolean;
  quickAccess: string[];
}

// Configuración de accesibilidad avanzada
export interface AccessibilitySettings {
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  subtitles: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  audioDescriptions: boolean;
  motionReduction: boolean;
}

// Configuración de rendimiento avanzada
export interface PerformanceSettings {
  targetFPS: number;
  vsync: boolean;
  antialiasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x' | 'msaa8x';
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  drawDistance: number;
  particleCount: number;
  waterQuality: 'low' | 'medium' | 'high' | 'ultra';
  grassDensity: number;
  treeQuality: 'low' | 'medium' | 'high' | 'ultra';
}

// Configuración social avanzada
export interface SocialSettings {
  autoAcceptFriendRequests: boolean;
  showOnlineStatus: boolean;
  allowWhispers: boolean;
  allowPartyInvites: boolean;
  allowGuildInvites: boolean;
  blockList: string[];
  muteList: string[];
  chatFilters: string[];
  autoReply: string;
}

// Estado del metaverso avanzado
export interface MetaversoState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  userAvatar: Avatar | null;
  currentWorld: World | null;
  worlds: World[];
  inventory: InventoryItem[];
  wallet: Wallet | null;
  chatMessages: ChatMessage[];
  settings: UserSettings;
  nearbyUsers: User[];
  nearbyObjects: WorldObject[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  achievements: Achievement[];
  statistics: PlayerStatistics;
  social: SocialState;
  notifications: Notification[];
  system: SystemState;
}

// Usuario avanzado
export interface User {
  id: string;
  username: string;
  avatar: Avatar;
  level: number;
  experience: number;
  guild?: Guild;
  party?: Party;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeen: Date;
  reputation: Record<string, number>;
  achievements: Achievement[];
  statistics: PlayerStatistics;
}

// Guild avanzado
export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  level: number;
  experience: number;
  members: GuildMember[];
  ranks: GuildRank[];
  treasury: Currency;
  achievements: Achievement[];
  wars: GuildWar[];
  alliances: string[];
  headquarters: Position;
  emblem: string;
  color: string;
  permissions: GuildPermissions;
}

export interface GuildMember {
  userId: string;
  rank: string;
  joinDate: Date;
  contribution: number;
  permissions: string[];
}

export interface GuildRank {
  name: string;
  level: number;
  permissions: string[];
  color: string;
}

export interface GuildWar {
  id: string;
  opponent: string;
  startDate: Date;
  endDate: Date;
  status: 'preparing' | 'active' | 'finished';
  score: number;
  opponentScore: number;
  rewards: Reward[];
}

export interface GuildPermissions {
  invite: string[];
  kick: string[];
  promote: string[];
  demote: string[];
  treasury: string[];
  declareWar: string[];
  acceptAlliance: string[];
}

// Party avanzado
export interface Party {
  id: string;
  name: string;
  leader: string;
  members: PartyMember[];
  maxMembers: number;
  type: 'quest' | 'dungeon' | 'pvp' | 'social';
  status: 'forming' | 'ready' | 'in_combat' | 'exploring';
  location: Position;
  objectives: PartyObjective[];
  lootDistribution: 'free_for_all' | 'round_robin' | 'need_before_greed' | 'master_looter';
  experienceSharing: boolean;
  created: Date;
}

export interface PartyMember {
  userId: string;
  role: 'leader' | 'member';
  joinDate: Date;
  status: 'ready' | 'not_ready' | 'in_combat' | 'afk';
  contribution: number;
}

export interface PartyObjective {
  type: 'quest' | 'boss' | 'exploration' | 'collection';
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

// Logros avanzados
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockDate?: Date;
  progress: number;
  target: number;
  rewards: Reward[];
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  type: 'quest' | 'kill' | 'collect' | 'explore' | 'craft' | 'social';
  target: any;
  current: number;
  required: number;
}

// Estadísticas de jugador avanzadas
export interface PlayerStatistics {
  combat: CombatStats;
  exploration: ExplorationStats;
  social: SocialStats;
  crafting: CraftingStats;
  economy: EconomyStats;
  achievements: AchievementStats;
  time: TimeStats;
}

export interface CombatStats {
  kills: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  criticalHits: number;
  dodges: number;
  blocks: number;
  bossKills: number;
  pvpWins: number;
  pvpLosses: number;
}

export interface ExplorationStats {
  worldsVisited: number;
  areasDiscovered: number;
  secretsFound: number;
  distanceTraveled: number;
  timeExplored: number;
  portalsUsed: number;
  treasuresFound: number;
}

export interface SocialStats {
  friends: number;
  guildsJoined: number;
  partiesJoined: number;
  tradesCompleted: number;
  giftsGiven: number;
  giftsReceived: number;
  reputationEarned: number;
}

export interface CraftingStats {
  itemsCrafted: number;
  recipesLearned: number;
  materialsGathered: number;
  qualityItems: number;
  masterpieces: number;
  timeCrafting: number;
}

export interface EconomyStats {
  goldEarned: number;
  goldSpent: number;
  itemsSold: number;
  itemsBought: number;
  auctionsWon: number;
  auctionsLost: number;
  investments: number;
}

export interface AchievementStats {
  totalAchievements: number;
  achievementPoints: number;
  rareAchievements: number;
  completionRate: number;
  fastestCompletion: number;
}

export interface TimeStats {
  totalPlayTime: number;
  sessionsCount: number;
  averageSessionTime: number;
  longestSession: number;
  lastLogin: Date;
  consecutiveDays: number;
}

// Estado social avanzado
export interface SocialState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  blockedUsers: string[];
  mutedUsers: string[];
  recentPlayers: RecentPlayer[];
  guildInvites: GuildInvite[];
  partyInvites: PartyInvite[];
}

export interface Friend {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  relationship: number; // 0-1
  notes: string;
  favorite: boolean;
}

export interface FriendRequest {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface RecentPlayer {
  userId: string;
  lastInteraction: Date;
  interactionType: string;
  worldId: string;
}

export interface GuildInvite {
  id: string;
  guildId: string;
  guildName: string;
  inviter: string;
  message: string;
  timestamp: Date;
  expires: Date;
}

export interface PartyInvite {
  id: string;
  partyId: string;
  partyName: string;
  inviter: string;
  message: string;
  timestamp: Date;
  expires: Date;
}

// Notificaciones avanzadas
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'quest' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: NotificationAction;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  metadata: Record<string, any>;
}

export interface NotificationAction {
  type: 'navigate' | 'open' | 'dismiss' | 'custom';
  target: string;
  data?: any;
}

// Estado del sistema avanzado
export interface SystemState {
  version: string;
  build: string;
  uptime: number;
  performance: PerformanceMetrics;
  network: NetworkState;
  storage: StorageState;
  security: SecurityState;
  maintenance: MaintenanceInfo;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage: number;
  networkLatency: number;
  loadTime: number;
  renderTime: number;
}

export interface NetworkState {
  connected: boolean;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  serverRegion: string;
  connectionType: string;
}

export interface StorageState {
  used: number;
  total: number;
  cacheSize: number;
  saveDataSize: number;
  lastBackup: Date;
}

export interface SecurityState {
  authenticated: boolean;
  sessionValid: boolean;
  lastSecurityCheck: Date;
  suspiciousActivity: boolean;
  twoFactorEnabled: boolean;
}

export interface MaintenanceInfo {
  scheduled: boolean;
  startTime?: Date;
  endTime?: Date;
  reason: string;
  affectedServices: string[];
}

// Objetos del mundo avanzados
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
  script?: string;
  properties: Record<string, any>;
  health?: number;
  maxHealth?: number;
  respawnTime?: number;
  loot?: LootTable;
  quest?: string;
  faction?: string;
}

export interface LootTable {
  items: LootItem[];
  currency: Currency;
  experience: number;
  reputation: Record<string, number>;
}

export interface LootItem {
  item: Item;
  chance: number; // 0-1
  quantity: [number, number]; // min, max
  quality: number; // 0-1
}

// Acciones del metaverso avanzadas
export type MetaversoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_METAVERSO'; payload: { userAvatar: Avatar; inventory: InventoryItem[]; wallet: Wallet } }
  | { type: 'SET_CURRENT_WORLD'; payload: World }

export interface MetaversoState {
  isInitialized: boolean
  isLoading: boolean
  currentWorld: World | null
  userAvatar: Avatar | null
  userPosition: Position
  nearbyUsers: User[]
  nearbyObjects: WorldObject[]
  inventory: InventoryItem[]
  wallet: Wallet
  chat: ChatState
  settings: UserSettings
  error: string | null
}

export interface World {
  id: string
  name: string
  description: string
  owner: string
  maxUsers: number
  currentUsers: number
  environment: Environment
  objects: WorldObject[]
  spawnPoints: Position[]
  portals: Portal[]
  boundaries: {
    min: Position
    max: Position
  }
  rules: {
    allowPvP: boolean
    allowBuilding: boolean
    allowTrading: boolean
    maxGroupSize: number
  }
  permissions: WorldPermissions
  metadata: WorldMetadata
  createdAt: string
  updatedAt: string
}

export interface Environment {
  type: 'forest' | 'desert' | 'snow' | 'urban' | 'underwater' | 'space'
  skybox: string
  lighting: {
    ambient: { r: number; g: number; b: number; a: number }
    directional: {
      color: { r: number; g: number; b: number; a: number }
      intensity: number
      position: Position
      castShadow: boolean
    }
    shadows: boolean
    fog: {
      enabled: boolean
      color: { r: number; g: number; b: number; a: number }
      near: number
      far: number
    }
  }
  weather: {
    type: 'clear' | 'rain' | 'snow' | 'storm'
    temperature: number
    humidity: number
    wind: Position
  }
  gravity: number
  physics: {
    enabled: boolean
    gravity: Position
    airResistance: number
  }
}

export interface Lighting {
  ambient: Color
  directional: DirectionalLight
  shadows: boolean
  fog: FogSettings
}

export interface DirectionalLight {
  color: Color
  intensity: number
  position: Position
  castShadow: boolean
}

export interface Color {
  r: number
  g: number
  b: number
  a: number
}

export interface Weather {
  type: 'clear' | 'rain' | 'snow' | 'fog'
  intensity: number
  wind: WindSettings
}

export interface WindSettings {
  direction: Position
  speed: number
}

export interface FogSettings {
  color: Color
  near: number
  far: number
}

export interface PhysicsSettings {
  gravity: number
  airResistance: number
  collisionDetection: boolean
}

export interface WorldObject {
  id: string
  name: string
  type: 'static' | 'dynamic' | 'interactive' | 'npc'
  model: string
  position: Position
  rotation: Rotation
  scale: Scale
  properties: Record<string, any>
  interactions: Interaction[]
  lastInteraction?: any
}

export interface Position {
  x: number
  y: number
  z: number
}

export interface Rotation {
  x: number
  y: number
  z: number
}

export interface Scale {
  x: number
  y: number
  z: number
}

export interface Interaction {
  type: string
  name: string
  description: string
  requirements: InteractionRequirement[]
  effects: InteractionEffect[]
}

export interface InteractionRequirement {
  type: 'item' | 'level' | 'permission' | 'proximity'
  value: any
}

export interface InteractionEffect {
  type: 'animation' | 'sound' | 'particle' | 'state_change' | 'reward'
  value: any
}

export interface WorldPermissions {
  canBuild: boolean
  canDestroy: boolean
  canInteract: boolean
  canChat: boolean
  canInvite: boolean
  allowedUsers: string[]
  bannedUsers: string[]
}

export interface WorldMetadata {
  tags: string[]
  category: string
  rating: number
  downloads: number
  likes: number
  thumbnail: string
}

export interface User {
  id: string
  username: string
  email: string
  avatar: string
  isOnline: boolean
  lastSeen: Date
  position: Position
  currentWorld: string | null
  socketId?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  permissions: UserPermissions
}

export interface Avatar {
  id: string
  name: string
  level: number
  experience: number
  health: number
  energy: number
  position: Position
  rotation: Rotation
  scale: Scale
  model: string
  animations: string[]
  customizations: Record<string, any>
  equipment: Record<string, any>
  inventory: InventoryItem[]
  stats: {
    strength: number
    agility: number
    intelligence: number
    charisma: number
  }
  skinColor?: string
  clothing?: {
    shirt?: { color: string }
    pants?: { color: string }
    shoes?: { color: string }
  }
}

export interface AvatarAnimation {
  name: string
  file: string
  loop: boolean
  speed: number
}

export interface AvatarCustomization {
  skinColor: string
  hairStyle: string
  hairColor: string
  eyeColor: string
  height: number
  weight: number
  features: Record<string, any>
}

export interface Equipment {
  slot: string
  itemId: string
  item: InventoryItem
}

export interface UserPermissions {
  canBuild: boolean
  canDestroy: boolean
  canInteract: boolean
  canChat: boolean
  canInvite: boolean
  isModerator: boolean
  isAdmin: boolean
}

export interface InventoryItem {
  id: string
  name: string
  type: string
  rarity: number
  value: number
  description: string
  icon: string
  model?: string
  properties: Record<string, any>
  quantity: number
  slot?: string
}

export interface ItemMetadata {
  creator: string
  collection: string
  tokenId?: string
  blockchain: string
  contractAddress?: string
}

export interface Wallet {
  balance: string
  assets: Asset[]
  transactions: Transaction[]
}

export interface Asset {
  id: string
  name: string
  type: string
  value: string
  metadata: AssetMetadata
}

export interface AssetMetadata {
  tokenId: string
  contractAddress: string
  blockchain: string
  creator: string
  collection: string
}

export interface Transaction {
  id: string
  type: 'purchase' | 'sale' | 'transfer' | 'reward'
  amount: string
  currency: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  metadata: Record<string, any>
}

export interface ChatState {
  global: ChatMessage[]
  local: ChatMessage[]
  private: ChatMessage[]
}

export interface ChatMessage {
  id: string
  content: string
  sender: {
    id: string
    username: string
    avatar: string
  }
  timestamp: Date
  roomId: string
  type: 'text' | 'image' | 'file' | 'system'
  userId?: string
  message?: string
  channel?: string
}

export interface UserSettings {
  graphics: 'low' | 'medium' | 'high' | 'ultra'
  audio: boolean
  notifications: boolean
  privacy: 'public' | 'friends' | 'private'
  language: string
  theme: 'light' | 'dark' | 'auto'
  controls: ControlSettings
}

export interface ControlSettings {
  mouseSensitivity: number
  invertY: boolean
  keyBindings: Record<string, string>
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra'
  shadows: boolean
  antialiasing: boolean
  vsync: boolean
}

export interface AudioSettings {
  master: number
  music: number
  sfx: number
  voice: number
}

export interface NotificationSettings {
  chat: boolean
  trade: boolean
  system: boolean
  sound: boolean
  desktop: boolean
  mentions: boolean
  privateMessages?: boolean
}

export interface Settings {
  graphics: GraphicsSettings
  audio: AudioSettings
  controls: ControlSettings
  notifications: NotificationSettings
}

export interface UserCurrency {
  coins: number
  tokens: number
  gems: number
}

export type MetaversoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_METAVERSO'; payload: { userAvatar: Avatar; inventory: InventoryItem[]; wallet: Wallet } }
  | { type: 'SET_CURRENT_WORLD'; payload: World | null }

// Tipos avanzados para el sistema de Metaverso
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

export interface Size {
  width: number;
  height: number;
  depth: number;
}

// Tipos de ambiente avanzados
export type Environment = 'indoor' | 'outdoor' | 'underground' | 'space' | 'underwater' | 'desert' | 'forest' | 'urban';

// Avatar avanzado con sistema de animaciones
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
  skills: Skill[];
  equipment: Equipment;
  customization: AvatarCustomization;
}

// Sistema de habilidades avanzado
export interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  experience: number;
  type: 'combat' | 'social' | 'crafting' | 'exploration' | 'magic';
  effects: SkillEffect[];
  cooldown: number;
  manaCost: number;
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'teleport' | 'summon';
  value: number;
  duration: number;
  target: 'self' | 'enemy' | 'ally' | 'area';
}

// Sistema de equipamiento avanzado
export interface Equipment {
  head?: Item;
  chest?: Item;
  legs?: Item;
  feet?: Item;
  hands?: Item;
  weapon?: Item;
  shield?: Item;
  accessory1?: Item;
  accessory2?: Item;
  accessory3?: Item;
}

// Personalización de avatar avanzada
export interface AvatarCustomization {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  facialFeatures: string[];
  tattoos: Tattoo[];
  scars: Scar[];
  accessories: string[];
}

export interface Tattoo {
  id: string;
  design: string;
  position: Position;
  color: string;
  size: number;
}

export interface Scar {
  id: string;
  type: string;
  position: Position;
  intensity: number;
}

// Mundo avanzado con múltiples capas
export interface World {
  id: string;
  name: string;
  description: string;
  position: Position;
  size: Size;
  maxPlayers: number;
  currentPlayers: number;
  environment: Environment;
  assets: Asset[];
  weather: Weather;
  time: WorldTime;
  physics: PhysicsSettings;
  lighting: LightingSettings;
  audio: AudioSettings;
  events: WorldEvent[];
  npcs: NPC[];
  quests: Quest[];
  shops: Shop[];
  portals: Portal[];
}

// Configuración de física avanzada
export interface PhysicsSettings {
  gravity: number;
  airResistance: number;
  waterDensity: number;
  collisionEnabled: boolean;
  ragdollEnabled: boolean;
  particleSystems: ParticleSystem[];
}

// Sistema de partículas avanzado
export interface ParticleSystem {
  id: string;
  type: 'fire' | 'smoke' | 'sparkle' | 'water' | 'magic' | 'dust';
  position: Position;
  count: number;
  lifetime: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

// Configuración de iluminación avanzada
export interface LightingSettings {
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  directionalPosition: Position;
  shadowsEnabled: boolean;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  fogEnabled: boolean;
  fogColor: string;
  fogDensity: number;
  fogNear: number;
  fogFar: number;
}

// Configuración de audio avanzada
export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  spatialAudio: boolean;
  reverbEnabled: boolean;
  reverbPreset: string;
}

// Tiempo del mundo avanzado
export interface WorldTime {
  currentTime: number; // 0-24 horas
  dayOfYear: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weatherCycle: number;
  dayNightCycle: boolean;
  timeScale: number;
}

// Clima avanzado
export interface Weather {
  type: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' | 'windy';
  intensity: number; // 0-1
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
}

// Eventos del mundo avanzados
export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: 'festival' | 'invasion' | 'natural' | 'social' | 'economic';
  startTime: Date;
  endTime: Date;
  location: Position;
  radius: number;
  participants: string[];
  rewards: Reward[];
  requirements: EventRequirement[];
  active: boolean;
}

// Requisitos de eventos avanzados
export interface EventRequirement {
  type: 'level' | 'skill' | 'item' | 'quest' | 'reputation';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'not';
}

// Recompensas avanzadas
export interface Reward {
  type: 'experience' | 'currency' | 'item' | 'skill' | 'reputation' | 'title';
  value: any;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// NPCs avanzados
export interface NPC {
  id: string;
  name: string;
  type: 'merchant' | 'quest_giver' | 'trainer' | 'guard' | 'citizen' | 'boss';
  position: Position;
  avatar: Avatar;
  dialogue: Dialogue[];
  inventory: Item[];
  services: Service[];
  schedule: NPCSchedule[];
  personality: Personality;
  relationships: Relationship[];
}

// Personalidad de NPC avanzada
export interface Personality {
  traits: string[];
  mood: 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'worried';
  openness: number; // 0-1
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// Relaciones de NPC avanzadas
export interface Relationship {
  targetId: string;
  type: 'friend' | 'enemy' | 'lover' | 'family' | 'mentor' | 'student';
  strength: number; // -1 to 1
  trust: number; // 0-1
  history: RelationshipEvent[];
}

export interface RelationshipEvent {
  type: string;
  description: string;
  timestamp: Date;
  impact: number; // -1 to 1
}

// Horario de NPC avanzado
export interface NPCSchedule {
  dayOfWeek: number; // 0-6
  activities: ScheduledActivity[];
}

export interface ScheduledActivity {
  startTime: number; // 0-24
  endTime: number;
  activity: string;
  location: Position;
}

// Diálogo avanzado
export interface Dialogue {
  id: string;
  text: string;
  speaker: string;
  conditions: DialogueCondition[];
  responses: DialogueResponse[];
  consequences: DialogueConsequence[];
}

export interface DialogueCondition {
  type: 'quest' | 'reputation' | 'item' | 'skill' | 'relationship';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains';
}

export interface DialogueResponse {
  text: string;
  conditions: DialogueCondition[];
  consequences: DialogueConsequence[];
}

export interface DialogueConsequence {
  type: 'reputation' | 'quest' | 'item' | 'relationship';
  value: any;
  target?: string;
}

// Servicios avanzados
export interface Service {
  type: 'trade' | 'repair' | 'craft' | 'train' | 'transport' | 'storage';
  name: string;
  description: string;
  cost: Currency;
  requirements: ServiceRequirement[];
  quality: number; // 0-1
}

export interface ServiceRequirement {
  type: 'level' | 'skill' | 'item' | 'reputation';
  value: any;
}

// Portal avanzado
export interface Portal {
  id: string;
  name: string;
  position: Position;
  destination: PortalDestination;
  requirements: PortalRequirement[];
  cost: Currency;
  cooldown: number;
  active: boolean;
}

export interface PortalDestination {
  worldId: string;
  position: Position;
  orientation: Rotation;
}

export interface PortalRequirement {
  type: 'level' | 'item' | 'quest' | 'reputation';
  value: any;
}

// Tienda avanzada
export interface Shop {
  id: string;
  name: string;
  owner: string;
  position: Position;
  inventory: ShopItem[];
  services: Service[];
  schedule: ShopSchedule;
  reputation: number;
  specialization: string[];
}

export interface ShopItem {
  item: Item;
  price: Currency;
  stock: number;
  maxStock: number;
  restockRate: number;
  quality: number;
}

export interface ShopSchedule {
  openTime: number;
  closeTime: number;
  daysOpen: number[]; // 0-6
  holidays: Date[];
}

// Misiones avanzadas
export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'guild';
  giver: string;
  objectives: QuestObjective[];
  rewards: Reward[];
  requirements: QuestRequirement[];
  timeLimit?: number;
  repeatable: boolean;
  chainId?: string;
  status: 'available' | 'active' | 'completed' | 'failed';
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'collect' | 'kill' | 'talk' | 'reach' | 'craft' | 'explore';
  target: any;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestRequirement {
  type: 'level' | 'quest' | 'reputation' | 'item' | 'skill';
  value: any;
}

// Activos avanzados
export interface Asset {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'audio' | 'animation' | 'script' | 'data';
  url: string;
  size: number;
  format: string;
  metadata: AssetMetadata;
  dependencies: string[];
  tags: string[];
}

export interface AssetMetadata {
  author: string;
  version: string;
  license: string;
  description: string;
  category: string;
  tags: string[];
  properties: Record<string, any>;
}

// Inventario avanzado
export interface InventoryItem {
  id: string;
  item: Item;
  quantity: number;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
  socketed: SocketedItem[];
  bound: boolean;
  tradeable: boolean;
  stackable: boolean;
  maxStack: number;
}

// Item avanzado
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'tool' | 'currency' | 'quest' | 'cosmetic';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  level: number;
  stats: ItemStats;
  effects: ItemEffect[];
  requirements: ItemRequirement[];
  crafting: CraftingInfo;
  trade: TradeInfo;
  model: string;
  icon: string;
  weight: number;
  value: Currency;
}

// Estadísticas de item avanzadas
export interface ItemStats {
  attack?: number;
  defense?: number;
  magic?: number;
  health?: number;
  mana?: number;
  stamina?: number;
  speed?: number;
  critical?: number;
  dodge?: number;
  block?: number;
  resistance: ResistanceStats;
}

export interface ResistanceStats {
  fire: number;
  ice: number;
  lightning: number;
  poison: number;
  physical: number;
  magical: number;
}

// Efectos de item avanzados
export interface ItemEffect {
  type: 'buff' | 'debuff' | 'heal' | 'damage' | 'teleport' | 'summon';
  target: 'self' | 'enemy' | 'ally' | 'area';
  value: number;
  duration: number;
  chance: number;
  conditions: ItemEffectCondition[];
}

export interface ItemEffectCondition {
  type: 'health' | 'mana' | 'time' | 'location' | 'weather';
  value: any;
  operator: 'equals' | 'greater' | 'less';
}

// Requisitos de item avanzados
export interface ItemRequirement {
  type: 'level' | 'strength' | 'dexterity' | 'intelligence' | 'skill' | 'class';
  value: number;
}

// Información de crafteo avanzada
export interface CraftingInfo {
  craftable: boolean;
  recipe?: Recipe;
  difficulty: number;
  time: number;
  tools: string[];
  station: string;
  experience: number;
}

export interface Recipe {
  materials: RecipeMaterial[];
  tools: string[];
  station: string;
  time: number;
  experience: number;
  failureChance: number;
  qualityFactors: QualityFactor[];
}

export interface RecipeMaterial {
  itemId: string;
  quantity: number;
  quality: number;
}

export interface QualityFactor {
  type: 'skill' | 'tool' | 'material' | 'environment';
  factor: number;
}

// Información de comercio avanzada
export interface TradeInfo {
  tradeable: boolean;
  basePrice: Currency;
  marketPrice: Currency;
  demand: number; // 0-1
  supply: number; // 0-1
  volatility: number; // 0-1
  restrictions: TradeRestriction[];
}

export interface TradeRestriction {
  type: 'level' | 'reputation' | 'location' | 'time' | 'quest';
  value: any;
}

// Encantamientos avanzados
export interface Enchantment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'universal';
  effect: EnchantmentEffect;
  level: number;
  maxLevel: number;
  cost: Currency;
  materials: string[];
}

export interface EnchantmentEffect {
  type: 'stat_boost' | 'elemental' | 'special' | 'set_bonus';
  stat?: string;
  value: number;
  element?: string;
  special?: string;
}

// Items con sockets avanzados
export interface SocketedItem {
  socketType: string;
  gem?: Gem;
  enchantment?: Enchantment;
}

export interface Gem {
  id: string;
  name: string;
  type: string;
  color: string;
  effect: GemEffect;
  quality: number;
  level: number;
}

export interface GemEffect {
  type: 'stat' | 'elemental' | 'special';
  value: number;
  element?: string;
  special?: string;
}

// Monedas avanzadas
export interface Currency {
  gold: number;
  silver: number;
  copper: number;
  tokens: number;
  crystals: number;
  reputation: Record<string, number>;
}

// Wallet avanzado
export interface Wallet {
  address: string;
  balance: Currency;
  assets: Asset[];
  transactions: Transaction[];
  connected: boolean;
  network: string;
  gasPrice: number;
  nonce: number;
}

// Transacciones avanzadas
export interface Transaction {
  id: string;
  type: 'transfer' | 'purchase' | 'sale' | 'mint' | 'burn' | 'stake' | 'unstake';
  from: string;
  to: string;
  amount: Currency;
  asset?: Asset;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  gasUsed: number;
  gasPrice: number;
  blockNumber?: number;
  hash: string;
  metadata: Record<string, any>;
}

// Mensajes de chat avanzados
export interface ChatMessage {
  id: string;
  text: string;
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
  mentions: string[];
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  edited: boolean;
  deleted: boolean;
}

export interface ChatAttachment {
  type: 'image' | 'file' | 'item' | 'location';
  url?: string;
  item?: Item;
  position?: Position;
  size: number;
}

export interface ChatReaction {
  emoji: string;
  users: string[];
  count: number;
}

// Configuración de usuario avanzada
export interface UserSettings {
  graphics: 'low' | 'medium' | 'high' | 'ultra';
  audio: boolean;
  notifications: boolean;
  language: string;
  privacy: 'public' | 'friends' | 'private';
  theme: 'light' | 'dark' | 'auto';
  controls: ControlSettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  social: SocialSettings;
}

// Configuración de controles avanzada
export interface ControlSettings {
  mouseSensitivity: number;
  invertY: boolean;
  keyBindings: Record<string, string>;
  gamepadEnabled: boolean;
  gamepadSensitivity: number;
  autoRun: boolean;
  toggleCrouch: boolean;
  quickAccess: string[];
}

// Configuración de accesibilidad avanzada
export interface AccessibilitySettings {
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  subtitles: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  audioDescriptions: boolean;
  motionReduction: boolean;
}

// Configuración de rendimiento avanzada
export interface PerformanceSettings {
  targetFPS: number;
  vsync: boolean;
  antialiasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x' | 'msaa8x';
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  drawDistance: number;
  particleCount: number;
  waterQuality: 'low' | 'medium' | 'high' | 'ultra';
  grassDensity: number;
  treeQuality: 'low' | 'medium' | 'high' | 'ultra';
}

// Configuración social avanzada
export interface SocialSettings {
  autoAcceptFriendRequests: boolean;
  showOnlineStatus: boolean;
  allowWhispers: boolean;
  allowPartyInvites: boolean;
  allowGuildInvites: boolean;
  blockList: string[];
  muteList: string[];
  chatFilters: string[];
  autoReply: string;
}

// Estado del metaverso avanzado
export interface MetaversoState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  userAvatar: Avatar | null;
  currentWorld: World | null;
  worlds: World[];
  inventory: InventoryItem[];
  wallet: Wallet | null;
  chatMessages: ChatMessage[];
  settings: UserSettings;
  nearbyUsers: User[];
  nearbyObjects: WorldObject[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  achievements: Achievement[];
  statistics: PlayerStatistics;
  social: SocialState;
  notifications: Notification[];
  system: SystemState;
}

// Usuario avanzado
export interface User {
  id: string;
  username: string;
  avatar: Avatar;
  level: number;
  experience: number;
  guild?: Guild;
  party?: Party;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeen: Date;
  reputation: Record<string, number>;
  achievements: Achievement[];
  statistics: PlayerStatistics;
}

// Guild avanzado
export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  level: number;
  experience: number;
  members: GuildMember[];
  ranks: GuildRank[];
  treasury: Currency;
  achievements: Achievement[];
  wars: GuildWar[];
  alliances: string[];
  headquarters: Position;
  emblem: string;
  color: string;
  permissions: GuildPermissions;
}

export interface GuildMember {
  userId: string;
  rank: string;
  joinDate: Date;
  contribution: number;
  permissions: string[];
}

export interface GuildRank {
  name: string;
  level: number;
  permissions: string[];
  color: string;
}

export interface GuildWar {
  id: string;
  opponent: string;
  startDate: Date;
  endDate: Date;
  status: 'preparing' | 'active' | 'finished';
  score: number;
  opponentScore: number;
  rewards: Reward[];
}

export interface GuildPermissions {
  invite: string[];
  kick: string[];
  promote: string[];
  demote: string[];
  treasury: string[];
  declareWar: string[];
  acceptAlliance: string[];
}

// Party avanzado
export interface Party {
  id: string;
  name: string;
  leader: string;
  members: PartyMember[];
  maxMembers: number;
  type: 'quest' | 'dungeon' | 'pvp' | 'social';
  status: 'forming' | 'ready' | 'in_combat' | 'exploring';
  location: Position;
  objectives: PartyObjective[];
  lootDistribution: 'free_for_all' | 'round_robin' | 'need_before_greed' | 'master_looter';
  experienceSharing: boolean;
  created: Date;
}

export interface PartyMember {
  userId: string;
  role: 'leader' | 'member';
  joinDate: Date;
  status: 'ready' | 'not_ready' | 'in_combat' | 'afk';
  contribution: number;
}

export interface PartyObjective {
  type: 'quest' | 'boss' | 'exploration' | 'collection';
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

// Logros avanzados
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockDate?: Date;
  progress: number;
  target: number;
  rewards: Reward[];
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  type: 'quest' | 'kill' | 'collect' | 'explore' | 'craft' | 'social';
  target: any;
  current: number;
  required: number;
}

// Estadísticas de jugador avanzadas
export interface PlayerStatistics {
  combat: CombatStats;
  exploration: ExplorationStats;
  social: SocialStats;
  crafting: CraftingStats;
  economy: EconomyStats;
  achievements: AchievementStats;
  time: TimeStats;
}

export interface CombatStats {
  kills: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  criticalHits: number;
  dodges: number;
  blocks: number;
  bossKills: number;
  pvpWins: number;
  pvpLosses: number;
}

export interface ExplorationStats {
  worldsVisited: number;
  areasDiscovered: number;
  secretsFound: number;
  distanceTraveled: number;
  timeExplored: number;
  portalsUsed: number;
  treasuresFound: number;
}

export interface SocialStats {
  friends: number;
  guildsJoined: number;
  partiesJoined: number;
  tradesCompleted: number;
  giftsGiven: number;
  giftsReceived: number;
  reputationEarned: number;
}

export interface CraftingStats {
  itemsCrafted: number;
  recipesLearned: number;
  materialsGathered: number;
  qualityItems: number;
  masterpieces: number;
  timeCrafting: number;
}

export interface EconomyStats {
  goldEarned: number;
  goldSpent: number;
  itemsSold: number;
  itemsBought: number;
  auctionsWon: number;
  auctionsLost: number;
  investments: number;
}

export interface AchievementStats {
  totalAchievements: number;
  achievementPoints: number;
  rareAchievements: number;
  completionRate: number;
  fastestCompletion: number;
}

export interface TimeStats {
  totalPlayTime: number;
  sessionsCount: number;
  averageSessionTime: number;
  longestSession: number;
  lastLogin: Date;
  consecutiveDays: number;
}

// Estado social avanzado
export interface SocialState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  blockedUsers: string[];
  mutedUsers: string[];
  recentPlayers: RecentPlayer[];
  guildInvites: GuildInvite[];
  partyInvites: PartyInvite[];
}

export interface Friend {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  relationship: number; // 0-1
  notes: string;
  favorite: boolean;
}

export interface FriendRequest {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface RecentPlayer {
  userId: string;
  lastInteraction: Date;
  interactionType: string;
  worldId: string;
}

export interface GuildInvite {
  id: string;
  guildId: string;
  guildName: string;
  inviter: string;
  message: string;
  timestamp: Date;
  expires: Date;
}

export interface PartyInvite {
  id: string;
  partyId: string;
  partyName: string;
  inviter: string;
  message: string;
  timestamp: Date;
  expires: Date;
}

// Notificaciones avanzadas
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'quest' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: NotificationAction;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  metadata: Record<string, any>;
}

export interface NotificationAction {
  type: 'navigate' | 'open' | 'dismiss' | 'custom';
  target: string;
  data?: any;
}

// Estado del sistema avanzado
export interface SystemState {
  version: string;
  build: string;
  uptime: number;
  performance: PerformanceMetrics;
  network: NetworkState;
  storage: StorageState;
  security: SecurityState;
  maintenance: MaintenanceInfo;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage: number;
  networkLatency: number;
  loadTime: number;
  renderTime: number;
}

export interface NetworkState {
  connected: boolean;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  serverRegion: string;
  connectionType: string;
}

export interface StorageState {
  used: number;
  total: number;
  cacheSize: number;
  saveDataSize: number;
  lastBackup: Date;
}

export interface SecurityState {
  authenticated: boolean;
  sessionValid: boolean;
  lastSecurityCheck: Date;
  suspiciousActivity: boolean;
  twoFactorEnabled: boolean;
}

export interface MaintenanceInfo {
  scheduled: boolean;
  startTime?: Date;
  endTime?: Date;
  reason: string;
  affectedServices: string[];
}

// Objetos del mundo avanzados
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
  script?: string;
  properties: Record<string, any>;
  health?: number;
  maxHealth?: number;
  respawnTime?: number;
  loot?: LootTable;
  quest?: string;
  faction?: string;
}

export interface LootTable {
  items: LootItem[];
  currency: Currency;
  experience: number;
  reputation: Record<string, number>;
}

export interface LootItem {
  item: Item;
  chance: number; // 0-1
  quantity: [number, number]; // min, max
  quality: number; // 0-1
}

// Acciones del metaverso avanzadas
export type MetaversoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_METAVERSO'; payload: { userAvatar: Avatar; inventory: InventoryItem[]; wallet: Wallet } }
  | { type: 'SET_CURRENT_WORLD'; payload: World }

  | { type: 'JOIN_WORLD'; payload: { world: World; position: Position } }
  | { type: 'LEAVE_WORLD' }
  | { type: 'UPDATE_USER_POSITION'; payload: Position }
  | { type: 'MOVE_TO_POSITION'; payload: Position }
  | { type: 'SET_NEARBY_USERS'; payload: User[] }
  | { type: 'UPDATE_NEARBY_USERS'; payload: User[] }
  | { type: 'USER_JOINED'; payload: User }
  | { type: 'USER_LEFT'; payload: { userId: string } }
  | { type: 'USER_MOVED'; payload: { userId: string; position: Position } }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'MESSAGE_RECEIVED'; payload: ChatMessage }
  | { type: 'UPDATE_AVATAR'; payload: Avatar }
  | { type: 'SET_WORLD_OBJECTS'; payload: WorldObject[] }
  | { type: 'UPDATE_NEARBY_OBJECTS'; payload: WorldObject[] }

  | { type: 'OBJECT_INTERACTION'; payload: { objectId: string; action: string; result: any } }
  | { type: 'OBJECT_INTERACTION_RECEIVED'; payload: any }

  | { type: 'OBJECT_INTERACTION'; payload: { objectId: string; userId: string } }
  | { type: 'OBJECT_INTERACTION_RECEIVED'; payload: { objectId: string; userId: string } }

  | { type: 'OBJECT_INTERACTION'; payload: { objectId: string; userId: string } }
  | { type: 'OBJECT_INTERACTION_RECEIVED'; payload: { objectId: string; userId: string } }

  | { type: 'OBJECT_INTERACTION'; payload: { objectId: string; action: string; result: any } }
  | { type: 'OBJECT_INTERACTION_RECEIVED'; payload: any }
  | { type: 'UPDATE_INVENTORY'; payload: InventoryItem[] }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'WORLD_CREATED'; payload: World }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }

  | { type: 'UPDATE_CURRENCY'; payload: Currency }; 

  | { type: 'UPDATE_CURRENCY'; payload: UserCurrency }

export interface MetaversoProviderProps {
  children: React.ReactNode
}

export interface Portal {
  id: string
  name: string
  position: Position
  destination: {
    worldId: string
    position: Position
  }
  isActive: boolean
} 

  | { type: 'UPDATE_CURRENCY'; payload: Currency }; 

