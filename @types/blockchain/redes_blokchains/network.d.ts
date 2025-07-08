/**
 * @fileoverview Tipos para sistema de redes blockchain descentralizado
 * @module @types/blockchain/redes_blokchains/network
 */

// ============================================================================
// TIPOS BÁSICOS DE RED
// ============================================================================

/**
 * Identificador único de red blockchain
 */
export type NetworkId = string;

/**
 * Tipos de redes blockchain
 */
export enum NetworkType {
  // Redes principales
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
  REGTEST = 'regtest',
  
  // Tipos de consenso
  PROOF_OF_WORK = 'pow',
  PROOF_OF_STAKE = 'pos',
  PROOF_OF_AUTHORITY = 'poa',
  PROOF_OF_SPACE = 'pospace',
  PROOF_OF_CAPACITY = 'poc',
  PROOF_OF_ELAPSED_TIME = 'poet',
  PROOF_OF_HISTORY = 'poh',
  PROOF_OF_REPUTATION = 'por',
  PROOF_OF_ACTIVITY = 'poa',
  PROOF_OF_BURN = 'pob',
  PROOF_OF_DEVELOPMENT = 'pod',
  PROOF_OF_IMPORTANCE = 'poi',
  PROOF_OF_LIQUIDITY = 'pol',
  PROOF_OF_MEMORY = 'pom',
  PROOF_OF_PARTICIPATION = 'pop',
  PROOF_OF_RETRIEVABILITY = 'por',
  PROOF_OF_SERVICE = 'pos',
  PROOF_OF_STORAGE = 'post',
  PROOF_OF_TIME = 'pot',
  PROOF_OF_TRANSACTION = 'pot',
  PROOF_OF_VALIDATION = 'pov',
  PROOF_OF_VELOCITY = 'pov',
  PROOF_OF_WEIGHT = 'pow',
  PROOF_OF_WORKLOAD = 'pow',
  PROOF_OF_YIELD = 'poy',
  
  // Tipos de red
  LAYER_1 = 'layer1',
  LAYER_2 = 'layer2',
  SIDECHAIN = 'sidechain',
  ROLLUP = 'rollup',
  PLASMA = 'plasma',
  STATE_CHANNEL = 'state_channel',
  PAYMENT_CHANNEL = 'payment_channel',
  HASHGRAPH = 'hashgraph',
  DAG = 'dag',
  HOLOCHAIN = 'holochain',
  BLOCK_LATTICE = 'block_lattice',
  TANGLE = 'tangle',
  TEMPO = 'tempo',
  SPECTRE = 'spectre',
  PHANTOM = 'phantom',
  CONFLUX = 'conflux',
  NANO = 'nano',
  IOTA = 'iota',
  HEDERA = 'hedera',
  FANTOM = 'fantom',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  ZKSYNC = 'zksync',
  STARKNET = 'starknet',
  CELO = 'celo',
  ALGORAND = 'algorand',
  TEZOS = 'tezos',
  CARDANO = 'cardano',
  SOLANA = 'solana',
  AVALANCHE = 'avalanche',
  BINANCE_SMART_CHAIN = 'bsc',
  POLKADOT = 'polkadot',
  COSMOS = 'cosmos',
  TRON = 'tron',
  EOS = 'eos',
  STEEM = 'steem',
  HIVE = 'hive',
  WAVES = 'waves',
  NEO = 'neo',
  ONTOLOGY = 'ontology',
  VECHAIN = 'vechain',
  ICON = 'icon',
  ZILLIQA = 'zilliqa',
  HARMONY = 'harmony',
  ELROND = 'elrond',
  MULTIVERSX = 'multiversx',
  THETA = 'theta',
  CHIA = 'chia',
  FILECOIN = 'filecoin',
  ARWEAVE = 'arweave',
  STORJ = 'storj',
  SIA = 'sia',
  MAIDSAFE = 'maidsafe',
  SWARM = 'swarm',
  IPFS = 'ipfs',
  ORBITDB = 'orbitdb',
  TEXTILE = 'textile',
  CERAMIC = 'ceramic',
  THREEBOX = 'threebox',
  PINATA = 'pinata',
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  QUICKNODE = 'quicknode',
  GETBLOCK = 'getblock',
  BLOCKCYPHER = 'blockcypher',
  BLOCKCHAIN_INFO = 'blockchain_info',
  ETHERSCAN = 'etherscan',
  BSCSCAN = 'bscscan',
  POLYGONSCAN = 'polygonscan',
  SNOWTRACE = 'snowtrace',
  FTMSCAN = 'ftmscan',
  ARBISCAN = 'arbiscan',
  OPTIMISTIC_ETHERSCAN = 'optimistic_etherscan',
  CELOSCAN = 'celoscan',
  TEZOSCAN = 'tezoscan',
  CARDANOSCAN = 'cardanoscan',
  SOLSCAN = 'solscan',
  TRONSCAN = 'tronscan',
  EOSSCAN = 'eosscan',
  STEEMSCAN = 'steemscan',
  HIVESCAN = 'hivescan',
  WAVESSCAN = 'wavescan',
  NEOSCAN = 'neoscan',
  ONTOLOGYSCAN = 'ontologyscan',
  VECHAINSCAN = 'vechainscan',
  ICONSCAN = 'iconscan',
  ZILLIQA_SCAN = 'zilliqa_scan',
  HARMONYSCAN = 'harmonyscan',
  ELRONDSCAN = 'elrondscan',
  MULTIVERSXSCAN = 'multiversxscan',
  THETASCAN = 'thetascan',
  CHIASCAN = 'chiascan',
  FILECOINSCAN = 'filecoinscan',
  ARWEAVESCAN = 'arweavescan',
  STORJSCAN = 'storjscan',
  SIASCAN = 'siascan',
  MAIDSAFESCAN = 'maidsafescan',
  SWARMSCAN = 'swarmscan',
  IPFSSCAN = 'ipfsscan',
  ORBITDBSCAN = 'orbitdbscan',
  TEXTILESCAN = 'textilescan',
  CERAMICSCAN = 'ceramicscan',
  THREEBOXSCAN = 'threeboxscan',
  PINATASCAN = 'pinatascan',
  INFURASCAN = 'infurascan',
  ALCHEMYSCAN = 'alchemyscan',
  QUICKNODESCAN = 'quicknodescan',
  GETBLOCKSCAN = 'getblockscan',
  BLOCKCYPHERSCAN = 'blockcypherscan',
  BLOCKCHAIN_INFOSCAN = 'blockchain_infoscan'
}

/**
 * Estados de red
 */
export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  SYNCING = 'syncing',
  STALE = 'stale',
  UNKNOWN = 'unknown'
}

/**
 * Tipos de nodo
 */
export enum NodeType {
  FULL = 'full',
  LIGHT = 'light',
  ARCHIVE = 'archive',
  VALIDATOR = 'validator',
  MINER = 'miner',
  RELAY = 'relay',
  GATEWAY = 'gateway',
  BRIDGE = 'bridge',
  ORACLE = 'oracle',
  INDEXER = 'indexer',
  API = 'api',
  RPC = 'rpc',
  WEBSOCKET = 'websocket',
  GRAPHQL = 'graphql',
  REST = 'rest',
  GRPC = 'grpc',
  P2P = 'p2p',
  CONSENSUS = 'consensus',
  EXECUTION = 'execution',
  BEACON = 'beacon',
  SHARD = 'shard',
  PARACHAIN = 'parachain',
  RELAY_CHAIN = 'relay_chain',
  SIDECHAIN = 'sidechain',
  ROLLUP = 'rollup',
  PLASMA = 'plasma',
  STATE_CHANNEL = 'state_channel',
  PAYMENT_CHANNEL = 'payment_channel',
  HASHGRAPH = 'hashgraph',
  DAG = 'dag',
  HOLOCHAIN = 'holochain',
  BLOCK_LATTICE = 'block_lattice',
  TANGLE = 'tangle',
  TEMPO = 'tempo',
  SPECTRE = 'spectre',
  PHANTOM = 'phantom',
  CONFLUX = 'conflux',
  NANO = 'nano',
  IOTA = 'iota',
  HEDERA = 'hedera',
  FANTOM = 'fantom',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  ZKSYNC = 'zksync',
  STARKNET = 'starknet',
  CELO = 'celo',
  ALGORAND = 'algorand',
  TEZOS = 'tezos',
  CARDANO = 'cardano',
  SOLANA = 'solana',
  AVALANCHE = 'avalanche',
  BINANCE_SMART_CHAIN = 'bsc',
  POLKADOT = 'polkadot',
  COSMOS = 'cosmos',
  TRON = 'tron',
  EOS = 'eos',
  STEEM = 'steem',
  HIVE = 'hive',
  WAVES = 'waves',
  NEO = 'neo',
  ONTOLOGY = 'ontology',
  VECHAIN = 'vechain',
  ICON = 'icon',
  ZILLIQA = 'zilliqa',
  HARMONY = 'harmony',
  ELROND = 'elrond',
  MULTIVERSX = 'multiversx',
  THETA = 'theta',
  CHIA = 'chia',
  FILECOIN = 'filecoin',
  ARWEAVE = 'arweave',
  STORJ = 'storj',
  SIA = 'sia',
  MAIDSAFE = 'maidsafe',
  SWARM = 'swarm',
  IPFS = 'ipfs',
  ORBITDB = 'orbitdb',
  TEXTILE = 'textile',
  CERAMIC = 'ceramic',
  THREEBOX = 'threebox',
  PINATA = 'pinata',
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  QUICKNODE = 'quicknode',
  GETBLOCK = 'getblock',
  BLOCKCYPHER = 'blockcypher',
  BLOCKCHAIN_INFO = 'blockchain_info',
  ETHERSCAN = 'etherscan',
  BSCSCAN = 'bscscan',
  POLYGONSCAN = 'polygonscan',
  SNOWTRACE = 'snowtrace',
  FTMSCAN = 'ftmscan',
  ARBISCAN = 'arbiscan',
  OPTIMISTIC_ETHERSCAN = 'optimistic_etherscan',
  CELOSCAN = 'celoscan',
  TEZOSCAN = 'tezoscan',
  CARDANOSCAN = 'cardanoscan',
  SOLSCAN = 'solscan',
  TRONSCAN = 'tronscan',
  EOSSCAN = 'eosscan',
  STEEMSCAN = 'steemscan',
  HIVESCAN = 'hivescan',
  WAVESSCAN = 'wavesscan',
  NEOSCAN = 'neoscan',
  ONTOLOGYSCAN = 'ontologyscan',
  VECHAINSCAN = 'vechainscan',
  ICONSCAN = 'iconscan',
  ZILLIQA_SCAN = 'zilliqa_scan',
  HARMONYSCAN = 'harmonyscan',
  ELRONDSCAN = 'elrondscan',
  MULTIVERSXSCAN = 'multiversxscan',
  THETASCAN = 'thetascan',
  CHIASCAN = 'chiascan',
  FILECOINSCAN = 'filecoinscan',
  ARWEAVESCAN = 'arweavescan',
  STORJSCAN = 'storjscan',
  SIASCAN = 'siascan',
  MAIDSAFESCAN = 'maidsafescan',
  SWARMSCAN = 'swarmscan',
  IPFSSCAN = 'ipfsscan',
  ORBITDBSCAN = 'orbitdbscan',
  TEXTILESCAN = 'textilescan',
  CERAMICSCAN = 'ceramicscan',
  THREEBOXSCAN = 'threeboxscan',
  PINATASCAN = 'pinatascan',
  INFURASCAN = 'infurascan',
  ALCHEMYSCAN = 'alchemyscan',
  QUICKNODESCAN = 'quicknodescan',
  GETBLOCKSCAN = 'getblockscan',
  BLOCKCYPHERSCAN = 'blockcypherscan',
  BLOCKCHAIN_INFOSCAN = 'blockchain_infoscan'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Red blockchain
 */
export interface BlockchainNetwork {
  id: NetworkId;
  name: string;
  symbol: string;
  type: NetworkType;
  status: NetworkStatus;
  chainId: number | string;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrls: string[];
  testnet: boolean;
  faucet?: string;
  infoURL: string;
  shortName: string;
  chain: string;
  network: string;
  networkId: number;
  slip44?: number;
  ens?: {
    registry: string;
  };
  parent?: {
    type: string;
    chain: string;
    bridges?: Array<{
      url: string;
    }>;
  };
  explorers?: Array<{
    name: string;
    url: string;
    icon?: string;
    standard: string;
  }>;
  features?: Array<{
    name: string;
  }>;
  redFlags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Moneda nativa
 */
export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
  iconUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Nodo blockchain
 */
export interface BlockchainNode {
  id: string;
  name: string;
  type: NodeType;
  url: string;
  networkId: NetworkId;
  status: NetworkStatus;
  version: string;
  height: number;
  synced: boolean;
  peers: number;
  uptime: number;
  latency: number;
  lastSeen: number;
  capabilities: NodeCapability[];
  endpoints: NodeEndpoint[];
  metadata?: Record<string, any>;
}

/**
 * Capacidad del nodo
 */
export interface NodeCapability {
  name: string;
  version: string;
  enabled: boolean;
  metadata?: Record<string, any>;
}

/**
 * Endpoint del nodo
 */
export interface NodeEndpoint {
  type: 'rpc' | 'websocket' | 'graphql' | 'rest' | 'grpc' | 'p2p';
  url: string;
  port: number;
  protocol: string;
  secure: boolean;
  rateLimit?: number;
  metadata?: Record<string, any>;
}

/**
 * Configuración de red
 */
export interface NetworkConfig {
  id: NetworkId;
  name: string;
  type: NetworkType;
  chainId: number | string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: NativeCurrency;
  testnet: boolean;
  autoConnect: boolean;
  autoSwitch: boolean;
  preferredNodes: string[];
  fallbackNodes: string[];
  timeout: number;
  retries: number;
  metadata?: Record<string, any>;
}

/**
 * Estado de conexión
 */
export interface ConnectionState {
  networkId: NetworkId;
  status: NetworkStatus;
  connectedAt?: number;
  disconnectedAt?: number;
  lastActivity: number;
  latency: number;
  errors: ConnectionError[];
  metadata?: Record<string, any>;
}

/**
 * Error de conexión
 */
export interface ConnectionError {
  code: string;
  message: string;
  timestamp: number;
  retryable: boolean;
  metadata?: Record<string, any>;
}

/**
 * Detector de red
 */
export interface NetworkDetector {
  id: string;
  name: string;
  version: string;
  networks: BlockchainNetwork[];
  configs: NetworkConfig[];
  connections: ConnectionState[];
  metadata?: Record<string, any>;
  
  /**
   * Detecta red actual
   */
  detectCurrentNetwork: () => Promise<BlockchainNetwork | null>;
  
  /**
   * Detecta todas las redes disponibles
   */
  detectAvailableNetworks: () => Promise<BlockchainNetwork[]>;
  
  /**
   * Detecta red por chainId
   */
  detectNetworkByChainId: (chainId: number | string) => BlockchainNetwork | null;
  
  /**
   * Detecta red por nombre
   */
  detectNetworkByName: (name: string) => BlockchainNetwork | null;
  
  /**
   * Detecta red por símbolo
   */
  detectNetworkBySymbol: (symbol: string) => BlockchainNetwork | null;
  
  /**
   * Detecta red por URL
   */
  detectNetworkByUrl: (url: string) => Promise<BlockchainNetwork | null>;
  
  /**
   * Detecta red por wallet
   */
  detectNetworkByWallet: (wallet: any) => Promise<BlockchainNetwork | null>;
  
  /**
   * Conecta a red
   */
  connectToNetwork: (networkId: NetworkId) => Promise<ConnectionState>;
  
  /**
   * Desconecta de red
   */
  disconnectFromNetwork: (networkId: NetworkId) => Promise<void>;
  
  /**
   * Cambia de red
   */
  switchNetwork: (fromNetworkId: NetworkId, toNetworkId: NetworkId) => Promise<ConnectionState>;
  
  /**
   * Obtiene estado de conexión
   */
  getConnectionState: (networkId: NetworkId) => ConnectionState | null;
  
  /**
   * Obtiene todas las conexiones
   */
  getAllConnections: () => ConnectionState[];
  
  /**
   * Verifica si está conectado
   */
  isConnected: (networkId: NetworkId) => boolean;
  
  /**
   * Verifica si la red es compatible
   */
  isCompatible: (networkId: NetworkId) => boolean;
  
  /**
   * Obtiene nodos disponibles
   */
  getAvailableNodes: (networkId: NetworkId) => BlockchainNode[];
  
  /**
   * Obtiene mejor nodo
   */
  getBestNode: (networkId: NetworkId) => BlockchainNode | null;
  
  /**
   * Agrega red personalizada
   */
  addCustomNetwork: (network: BlockchainNetwork) => void;
  
  /**
   * Remueve red personalizada
   */
  removeCustomNetwork: (networkId: NetworkId) => void;
  
  /**
   * Actualiza configuración de red
   */
  updateNetworkConfig: (networkId: NetworkId, config: Partial<NetworkConfig>) => void;
  
  /**
   * Exporta configuración
   */
  exportConfig: () => NetworkDetectorExport;
  
  /**
   * Importa configuración
   */
  importConfig: (data: NetworkDetectorExport) => void;
}

/**
 * Exportación del detector de red
 */
export interface NetworkDetectorExport {
  id: string;
  name: string;
  version: string;
  networks: BlockchainNetwork[];
  configs: NetworkConfig[];
  connections: ConnectionState[];
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de red
 */
export interface NetworkUtils {
  /**
   * Crea detector de red
   */
  createDetector: (options?: Partial<NetworkDetector>) => NetworkDetector;
  
  /**
   * Crea red blockchain
   */
  createNetwork: (options: Partial<BlockchainNetwork>) => BlockchainNetwork;
  
  /**
   * Crea nodo blockchain
   */
  createNode: (options: Partial<BlockchainNode>) => BlockchainNode;
  
  /**
   * Crea configuración de red
   */
  createConfig: (options: Partial<NetworkConfig>) => NetworkConfig;
  
  /**
   * Valida red
   */
  validateNetwork: (network: BlockchainNetwork) => boolean;
  
  /**
   * Valida nodo
   */
  validateNode: (node: BlockchainNode) => boolean;
  
  /**
   * Valida configuración
   */
  validateConfig: (config: NetworkConfig) => boolean;
  
  /**
   * Serializa red
   */
  serializeNetwork: (network: BlockchainNetwork) => string;
  
  /**
   * Deserializa red
   */
  deserializeNetwork: (data: string) => BlockchainNetwork;
  
  /**
   * Clona red
   */
  cloneNetwork: (network: BlockchainNetwork) => BlockchainNetwork;
  
  /**
   * Combina redes
   */
  mergeNetworks: (networks: BlockchainNetwork[]) => BlockchainNetwork[];
  
  /**
   * Genera ID de red
   */
  generateNetworkId: () => NetworkId;
  
  /**
   * Verifica si red está activa
   */
  isNetworkActive: (network: BlockchainNetwork) => boolean;
  
  /**
   * Verifica si red es testnet
   */
  isTestnet: (network: BlockchainNetwork) => boolean;
  
  /**
   * Verifica si red es mainnet
   */
  isMainnet: (network: BlockchainNetwork) => boolean;
  
  /**
   * Verifica si red es compatible
   */
  isCompatible: (network: BlockchainNetwork, wallet: any) => boolean;
  
  /**
   * Obtiene tipo de red
   */
  getNetworkType: (network: BlockchainNetwork) => NetworkType;
  
  /**
   * Obtiene estado de red
   */
  getNetworkStatus: (network: BlockchainNetwork) => NetworkStatus;
  
  /**
   * Obtiene moneda nativa
   */
  getNativeCurrency: (network: BlockchainNetwork) => NativeCurrency;
  
  /**
   * Obtiene URLs RPC
   */
  getRpcUrls: (network: BlockchainNetwork) => string[];
  
  /**
   * Obtiene URLs de explorador
   */
  getExplorerUrls: (network: BlockchainNetwork) => string[];
  
  /**
   * Obtiene iconos
   */
  getIconUrls: (network: BlockchainNetwork) => string[];
  
  /**
   * Actualiza red
   */
  updateNetwork: (network: BlockchainNetwork, updates: Partial<BlockchainNetwork>) => BlockchainNetwork;
  
  /**
   * Transiciona estado de red
   */
  transitionNetworkStatus: (network: BlockchainNetwork, newStatus: NetworkStatus) => BlockchainNetwork;
  
  /**
   * Revierte red
   */
  revertNetwork: (network: BlockchainNetwork) => BlockchainNetwork;
  
  /**
   * Registra red
   */
  registerNetwork: (network: BlockchainNetwork) => void;
  
  /**
   * Desregistra red
   */
  unregisterNetwork: (networkId: NetworkId) => void;
  
  /**
   * Obtiene red por ID
   */
  getNetwork: (networkId: NetworkId) => BlockchainNetwork | null;
  
  /**
   * Lista todas las redes
   */
  listNetworks: () => BlockchainNetwork[];
  
  /**
   * Filtra redes
   */
  filterNetworks: (filter: (network: BlockchainNetwork) => boolean) => BlockchainNetwork[];
  
  /**
   * Ordena redes
   */
  sortNetworks: (networks: BlockchainNetwork[], sorter: (a: BlockchainNetwork, b: BlockchainNetwork) => number) => BlockchainNetwork[];
  
  /**
   * Agrupa redes
   */
  groupNetworks: (networks: BlockchainNetwork[], grouper: (network: BlockchainNetwork) => string) => Record<string, BlockchainNetwork[]>;
  
  /**
   * Exporta redes
   */
  exportNetworks: (networks: BlockchainNetwork[]) => string;
  
  /**
   * Importa redes
   */
  importNetworks: (data: string) => BlockchainNetwork[];
  
  /**
   * Valida redes
   */
  validateNetworks: (networks: BlockchainNetwork[]) => boolean;
  
  /**
   * Optimiza redes
   */
  optimizeNetworks: (networks: BlockchainNetwork[]) => BlockchainNetwork[];
  
  /**
   * Limpia redes
   */
  cleanupNetworks: (networks: BlockchainNetwork[]) => BlockchainNetwork[];
  
  /**
   * Suscribe a cambios de red
   */
  subscribeToNetwork: (networkId: NetworkId, listener: (network: BlockchainNetwork) => void) => void;
  
  /**
   * Desuscribe de cambios de red
   */
  unsubscribeFromNetwork: (networkId: NetworkId, listener: (network: BlockchainNetwork) => void) => void;
  
  /**
   * Notifica cambios de red
   */
  notifyNetworkChange: (network: BlockchainNetwork) => void;
  
  /**
   * Ejecuta acción en red
   */
  executeNetworkAction: (network: BlockchainNetwork, action: string, parameters?: Record<string, any>) => Promise<any>;
  
  /**
   * Valida transición de estado
   */
  validateStatusTransition: (from: NetworkStatus, to: NetworkStatus) => boolean;
  
  /**
   * Obtiene estados permitidos
   */
  getAllowedStatuses: (currentStatus: NetworkStatus) => NetworkStatus[];
  
  /**
   * Obtiene reglas de transición
   */
  getTransitionRules: (from: NetworkStatus, to: NetworkStatus) => any[];
  
  /**
   * Aplica reglas de transición
   */
  applyTransitionRules: (network: BlockchainNetwork, transition: any) => BlockchainNetwork;
  
  /**
   * Verifica condiciones de red
   */
  checkNetworkConditions: (network: BlockchainNetwork, conditions: any[]) => boolean;
  
  /**
   * Evalúa expresión de red
   */
  evaluateNetworkExpression: (expression: string, network: BlockchainNetwork) => any;
  
  /**
   * Calcula estadísticas de red
   */
  calculateNetworkStats: (networks: BlockchainNetwork[]) => NetworkStats;
  
  /**
   * Genera reporte de red
   */
  generateNetworkReport: (networks: BlockchainNetwork[]) => NetworkReport;
}

/**
 * Estadísticas de red
 */
export interface NetworkStats {
  total: number;
  byType: Record<NetworkType, number>;
  byStatus: Record<NetworkStatus, number>;
  byChainId: Record<string, number>;
  averageLatency: number;
  totalConnections: number;
  activeConnections: number;
  metadata?: Record<string, any>;
}

/**
 * Reporte de red
 */
export interface NetworkReport {
  id: string;
  timestamp: number;
  stats: NetworkStats;
  networks: BlockchainNetwork[];
  summary: string;
  recommendations: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de red
 */
export interface NetworkEvent {
  type: 'connected' | 'disconnected' | 'switched' | 'error' | 'maintenance' | 'syncing' | 'stale' | 'unknown';
  network: BlockchainNetwork;
  previousNetwork?: BlockchainNetwork;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de eventos de red
 */
export interface NetworkEventListener {
  onNetworkConnected: (event: NetworkEvent) => void;
  onNetworkDisconnected: (event: NetworkEvent) => void;
  onNetworkSwitched: (event: NetworkEvent) => void;
  onNetworkError: (event: NetworkEvent) => void;
  onNetworkMaintenance: (event: NetworkEvent) => void;
  onNetworkSyncing: (event: NetworkEvent) => void;
  onNetworkStale: (event: NetworkEvent) => void;
  onNetworkUnknown: (event: NetworkEvent) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  NetworkId,
  BlockchainNetwork,
  NativeCurrency,
  BlockchainNode,
  NodeCapability,
  NodeEndpoint,
  NetworkConfig,
  ConnectionState,
  ConnectionError,
  NetworkDetector,
  NetworkDetectorExport,
  NetworkUtils,
  NetworkStats,
  NetworkReport,
  NetworkEvent,
  NetworkEventListener
};

export {
  NetworkType,
  NetworkStatus,
  NodeType
};
