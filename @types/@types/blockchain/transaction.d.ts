/**
 * @fileoverview Tipos para transacciones blockchain del metaverso
 * @module @types/blockchain/transaction
 */

// ============================================================================
// TIPOS BÁSICOS DE TRANSACCIÓN
// ============================================================================

/**
 * Hash de transacción
 */
export type TransactionHash = string;

/**
 * Tipos de transacciones
 */
export enum TransactionType {
  TRANSFER = 'transfer',
  MINT = 'mint',
  BURN = 'burn',
  APPROVE = 'approve',
  SWAP = 'swap',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM = 'claim',
  VOTE = 'vote',
  CREATE_PROPOSAL = 'create_proposal',
  EXECUTE_PROPOSAL = 'execute_proposal',
  DEPLOY_CONTRACT = 'deploy_contract',
  UPGRADE_CONTRACT = 'upgrade_contract',
  CUSTOM = 'custom'
}

/**
 * Estados de transacción
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REVERTED = 'reverted',
  DROPPED = 'dropped',
  REPLACED = 'replaced'
}

/**
 * Tipos de gas
 */
export enum GasType {
  LEGACY = 'legacy',
  EIP1559 = 'eip1559',
  EIP4844 = 'eip4844'
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Transacción blockchain
 */
export interface Transaction {
  hash: TransactionHash;
  type: TransactionType;
  status: TransactionStatus;
  
  // Información básica
  basic: TransactionBasic;
  
  // Información de gas
  gas: TransactionGas;
  
  // Información de red
  network: TransactionNetwork;
  
  // Información de bloque
  block: TransactionBlock;
  
  // Información de eventos
  events: TransactionEvent[];
  
  // Información de logs
  logs: TransactionLog[];
  
  // Información de error
  error?: TransactionError;
  
  // Metadatos del sistema
  createdAt: number;
  updatedAt: number;
  confirmedAt?: number;
  failedAt?: number;
}

/**
 * Información básica de transacción
 */
export interface TransactionBasic {
  from: string;
  to?: string;
  value: string;
  data?: string;
  nonce: number;
  chainId: number;
  signature?: TransactionSignature;
}

/**
 * Firma de transacción
 */
export interface TransactionSignature {
  r: string;
  s: string;
  v: number;
  recoveryParam?: number;
}

/**
 * Información de gas
 */
export interface TransactionGas {
  gasLimit: number;
  gasUsed?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  effectiveGasPrice?: string;
  gasType: GasType;
  gasCost: string;
  gasRefund?: string;
  gasRefunded?: string;
}

/**
 * Información de red
 */
export interface TransactionNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: string;
  confirmations: number;
  requiredConfirmations: number;
}

/**
 * Información de bloque
 */
export interface TransactionBlock {
  number: number;
  hash: string;
  timestamp: number;
  confirmations: number;
  baseFeePerGas?: string;
  difficulty?: string;
  extraData?: string;
  gasLimit: number;
  gasUsed: number;
  miner?: string;
  nonce?: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: number;
  stateRoot: string;
  totalDifficulty?: string;
  transactions: TransactionHash[];
  transactionsRoot: string;
  uncles: string[];
}

/**
 * Evento de transacción
 */
export interface TransactionEvent {
  name: string;
  signature: string;
  address: string;
  blockNumber: number;
  transactionHash: TransactionHash;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
  args: any[];
  topics: string[];
  data: string;
}

/**
 * Log de transacción
 */
export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: TransactionHash;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}

/**
 * Error de transacción
 */
export interface TransactionError {
  code: number;
  message: string;
  reason?: string;
  method?: string;
  data?: string;
  transaction?: any;
  receipt?: any;
}

// ============================================================================
// TIPOS DE TRANSACCIONES ESPECÍFICAS
// ============================================================================

/**
 * Transacción de transferencia
 */
export interface TransferTransaction extends Transaction {
  type: TransactionType.TRANSFER;
  transfer: TransferDetails;
}

/**
 * Detalles de transferencia
 */
export interface TransferDetails {
  tokenAddress?: string;
  tokenType: 'native' | 'erc20' | 'erc721' | 'erc1155';
  amount: string;
  tokenId?: string;
  from: string;
  to: string;
  fee: string;
  gasUsed: number;
}

/**
 * Transacción de minting
 */
export interface MintTransaction extends Transaction {
  type: TransactionType.MINT;
  mint: MintDetails;
}

/**
 * Detalles de minting
 */
export interface MintDetails {
  tokenAddress: string;
  tokenType: 'erc20' | 'erc721' | 'erc1155';
  amount?: string;
  tokenId?: string;
  to: string;
  metadata?: any;
  cost: string;
  gasUsed: number;
}

/**
 * Transacción de burning
 */
export interface BurnTransaction extends Transaction {
  type: TransactionType.BURN;
  burn: BurnDetails;
}

/**
 * Detalles de burning
 */
export interface BurnDetails {
  tokenAddress: string;
  tokenType: 'erc20' | 'erc721' | 'erc1155';
  amount?: string;
  tokenId?: string;
  from: string;
  gasUsed: number;
}

/**
 * Transacción de aprobación
 */
export interface ApproveTransaction extends Transaction {
  type: TransactionType.APPROVE;
  approve: ApproveDetails;
}

/**
 * Detalles de aprobación
 */
export interface ApproveDetails {
  tokenAddress: string;
  spender: string;
  amount: string;
  owner: string;
  gasUsed: number;
}

/**
 * Transacción de swap
 */
export interface SwapTransaction extends Transaction {
  type: TransactionType.SWAP;
  swap: SwapDetails;
}

/**
 * Detalles de swap
 */
export interface SwapDetails {
  router: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
  fee: string;
  gasUsed: number;
  slippage: number;
}

/**
 * Transacción de staking
 */
export interface StakeTransaction extends Transaction {
  type: TransactionType.STAKE;
  stake: StakeDetails;
}

/**
 * Detalles de staking
 */
export interface StakeDetails {
  pool: string;
  token: string;
  amount: string;
  staker: string;
  lockPeriod?: number;
  rewards?: string;
  gasUsed: number;
}

/**
 * Transacción de unstaking
 */
export interface UnstakeTransaction extends Transaction {
  type: TransactionType.UNSTAKE;
  unstake: UnstakeDetails;
}

/**
 * Detalles de unstaking
 */
export interface UnstakeDetails {
  pool: string;
  token: string;
  amount: string;
  staker: string;
  rewards: string;
  gasUsed: number;
}

/**
 * Transacción de claim
 */
export interface ClaimTransaction extends Transaction {
  type: TransactionType.CLAIM;
  claim: ClaimDetails;
}

/**
 * Detalles de claim
 */
export interface ClaimDetails {
  pool: string;
  token: string;
  amount: string;
  claimant: string;
  gasUsed: number;
}

/**
 * Transacción de voto
 */
export interface VoteTransaction extends Transaction {
  type: TransactionType.VOTE;
  vote: VoteDetails;
}

/**
 * Detalles de voto
 */
export interface VoteDetails {
  proposal: string;
  voter: string;
  support: 'for' | 'against' | 'abstain';
  weight: string;
  reason?: string;
  gasUsed: number;
}

/**
 * Transacción de creación de propuesta
 */
export interface CreateProposalTransaction extends Transaction {
  type: TransactionType.CREATE_PROPOSAL;
  createProposal: CreateProposalDetails;
}

/**
 * Detalles de creación de propuesta
 */
export interface CreateProposalDetails {
  governor: string;
  proposer: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  description: string;
  gasUsed: number;
}

/**
 * Transacción de ejecución de propuesta
 */
export interface ExecuteProposalTransaction extends Transaction {
  type: TransactionType.EXECUTE_PROPOSAL;
  executeProposal: ExecuteProposalDetails;
}

/**
 * Detalles de ejecución de propuesta
 */
export interface ExecuteProposalDetails {
  governor: string;
  proposalId: string;
  executor: string;
  gasUsed: number;
}

/**
 * Transacción de despliegue de contrato
 */
export interface DeployContractTransaction extends Transaction {
  type: TransactionType.DEPLOY_CONTRACT;
  deployContract: DeployContractDetails;
}

/**
 * Detalles de despliegue de contrato
 */
export interface DeployContractDetails {
  contractAddress: string;
  contractName: string;
  constructorArgs: any[];
  bytecode: string;
  gasUsed: number;
}

/**
 * Transacción de actualización de contrato
 */
export interface UpgradeContractTransaction extends Transaction {
  type: TransactionType.UPGRADE_CONTRACT;
  upgradeContract: UpgradeContractDetails;
}

/**
 * Detalles de actualización de contrato
 */
export interface UpgradeContractDetails {
  proxyAddress: string;
  implementationAddress: string;
  admin: string;
  gasUsed: number;
}

/**
 * Transacción personalizada
 */
export interface CustomTransaction extends Transaction {
  type: TransactionType.CUSTOM;
  custom: CustomDetails;
}

/**
 * Detalles personalizados
 */
export interface CustomDetails {
  method: string;
  params: any[];
  gasUsed: number;
  metadata?: any;
}

// ============================================================================
// TIPOS DE RECEPTO
// ============================================================================

/**
 * Recibo de transacción
 */
export interface TransactionReceipt {
  transactionHash: TransactionHash;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to?: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  effectiveGasPrice: string;
  contractAddress?: string;
  logs: TransactionLog[];
  status: number;
  logsBloom: string;
  root?: string;
  type: number;
}

// ============================================================================
// TIPOS DE ESTIMACIÓN
// ============================================================================

/**
 * Estimación de gas
 */
export interface GasEstimation {
  gasLimit: number;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  totalCost: string;
  breakdown: GasBreakdown;
}

/**
 * Desglose de gas
 */
export interface GasBreakdown {
  baseFee: string;
  priorityFee: string;
  maxFee: string;
  gasLimit: number;
  totalCost: string;
}

/**
 * Configuración de gas
 */
export interface GasConfig {
  gasLimit: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  type: GasType;
}

// ============================================================================
// TIPOS DE MONITOREO
// ============================================================================

/**
 * Monitoreo de transacción
 */
export interface TransactionMonitoring {
  hash: TransactionHash;
  status: TransactionStatus;
  confirmations: number;
  requiredConfirmations: number;
  estimatedTime?: number;
  gasPrice?: string;
  gasUsed?: number;
  blockNumber?: number;
  timestamp?: number;
  error?: TransactionError;
}

/**
 * Configuración de monitoreo
 */
export interface MonitoringConfig {
  confirmations: number;
  timeout: number;
  retries: number;
  interval: number;
  onConfirm?: (tx: Transaction) => void;
  onError?: (error: TransactionError) => void;
  onTimeout?: (hash: TransactionHash) => void;
}

// ============================================================================
// TIPOS DE HISTORIAL
// ============================================================================

/**
 * Historial de transacciones
 */
export interface TransactionHistory {
  transactions: Transaction[];
  pagination: TransactionPagination;
  filters: TransactionFilters;
  statistics: TransactionStatistics;
}

/**
 * Paginación de transacciones
 */
export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Filtros de transacciones
 */
export interface TransactionFilters {
  type?: TransactionType[];
  status?: TransactionStatus[];
  from?: string;
  to?: string;
  startDate?: number;
  endDate?: number;
  minValue?: string;
  maxValue?: string;
  network?: string;
  contractAddress?: string;
}

/**
 * Estadísticas de transacciones
 */
export interface TransactionStatistics {
  totalTransactions: number;
  totalVolume: string;
  averageGasUsed: number;
  averageGasPrice: string;
  successRate: number;
  failureRate: number;
  pendingCount: number;
  confirmedCount: number;
  failedCount: number;
  byType: Record<TransactionType, number>;
  byStatus: Record<TransactionStatus, number>;
  byNetwork: Record<string, number>;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de transacción
 */
export interface TransactionUtils {
  /**
   * Valida hash de transacción
   */
  isValidHash: (hash: string) => boolean;
  
  /**
   * Formatea hash de transacción
   */
  formatHash: (hash: string, start?: number, end?: number) => string;
  
  /**
   * Convierte wei a ether
   */
  weiToEther: (wei: string) => string;
  
  /**
   * Convierte ether a wei
   */
  etherToWei: (ether: string) => string;
  
  /**
   * Calcula costo total de gas
   */
  calculateGasCost: (gasUsed: number, gasPrice: string) => string;
  
  /**
   * Estima tiempo de confirmación
   */
  estimateConfirmationTime: (gasPrice: string, network: string) => number;
  
  /**
   * Valida dirección
   */
  isValidAddress: (address: string) => boolean;
  
  /**
   * Formatea dirección
   */
  formatAddress: (address: string, start?: number, end?: number) => string;
  
  /**
   * Obtiene información de transacción
   */
  getTransactionInfo: (hash: string, network: string) => Promise<Transaction>;
  
  /**
   * Espera confirmación de transacción
   */
  waitForConfirmation: (hash: string, confirmations: number, network: string) => Promise<Transaction>;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  TransactionHash,
  Transaction,
  TransactionBasic,
  TransactionSignature,
  TransactionGas,
  TransactionNetwork,
  TransactionBlock,
  TransactionEvent,
  TransactionLog,
  TransactionError,
  TransferTransaction,
  TransferDetails,
  MintTransaction,
  MintDetails,
  BurnTransaction,
  BurnDetails,
  ApproveTransaction,
  ApproveDetails,
  SwapTransaction,
  SwapDetails,
  StakeTransaction,
  StakeDetails,
  UnstakeTransaction,
  UnstakeDetails,
  ClaimTransaction,
  ClaimDetails,
  VoteTransaction,
  VoteDetails,
  CreateProposalTransaction,
  CreateProposalDetails,
  ExecuteProposalTransaction,
  ExecuteProposalDetails,
  DeployContractTransaction,
  DeployContractDetails,
  UpgradeContractTransaction,
  UpgradeContractDetails,
  CustomTransaction,
  CustomDetails,
  TransactionReceipt,
  GasEstimation,
  GasBreakdown,
  GasConfig,
  TransactionMonitoring,
  MonitoringConfig,
  TransactionHistory,
  TransactionPagination,
  TransactionFilters,
  TransactionStatistics,
  TransactionUtils
};

export {
  TransactionType,
  TransactionStatus,
  GasType
}; 