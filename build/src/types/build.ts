/**
 * @metaverso/build - Build System Types
 * 
 * Definiciones de tipos para el sistema de construcción del metaverso
 */

// ============================================================================
// CONFIGURACIÓN DE BUILD
// ============================================================================

export interface BuildConfig {
  contracts?: ContractBuildConfig
  backend?: BackendBuildConfig
  frontend?: FrontendBuildConfig
  assets?: AssetBuildConfig
  optimization?: OptimizationConfig
  compression?: CompressionConfig
  signing?: SigningConfig
  monitoring?: MonitoringConfig
}

export interface ContractBuildConfig {
  sourceDir: string
  outputDir: string
  optimize: boolean
  verify: boolean
  compilerVersion?: string
  optimizerRuns?: number
  viaIR?: boolean
  gasReports?: boolean
  flatten?: boolean
  sizeReports?: boolean
}

export interface BackendBuildConfig {
  sourceDir: string
  outputDir: string
  bundle: boolean
  minify: boolean
  target?: 'node' | 'es2020' | 'es2022'
  format?: 'cjs' | 'esm' | 'umd'
  sourcemap?: boolean
  external?: string[]
  plugins?: string[]
}

export interface FrontendBuildConfig {
  sourceDir: string
  outputDir: string
  bundle: boolean
  minify: boolean
  target?: 'es2015' | 'es2017' | 'es2020' | 'esnext'
  format?: 'es' | 'cjs' | 'umd' | 'iife'
  sourcemap?: boolean
  external?: string[]
  plugins?: string[]
  css?: boolean
  assets?: boolean
}

export interface AssetBuildConfig {
  sourceDir: string
  outputDir: string
  optimize: boolean
  compress: boolean
  formats?: string[]
  quality?: number
  resize?: boolean
  maxWidth?: number
  maxHeight?: number
  generateThumbnails?: boolean
}

export interface OptimizationConfig {
  enabled: boolean
  level: 'low' | 'medium' | 'high'
  targets?: ('contracts' | 'backend' | 'frontend' | 'assets')[]
  treeShaking?: boolean
  deadCodeElimination?: boolean
  constantFolding?: boolean
  inlining?: boolean
}

export interface CompressionConfig {
  enabled: boolean
  algorithm: 'gzip' | 'brotli' | 'lz4' | 'zstd'
  level?: number
  targets?: ('backend' | 'frontend' | 'assets')[]
  exclude?: string[]
}

export interface SigningConfig {
  enabled: boolean
  keyPath: string
  keyPassword?: string
  algorithm?: 'rsa' | 'ecdsa' | 'ed25519'
  targets?: ('contracts' | 'backend' | 'frontend')[]
  timestamp?: boolean
}

export interface MonitoringConfig {
  enabled: boolean
  metrics: boolean
  tracing: boolean
  profiling: boolean
  alerts: boolean
  dashboard: boolean
}

// ============================================================================
// RESULTADOS DE BUILD
// ============================================================================

export interface BuildResult {
  success: boolean
  duration: number
  size: number
  files: string[]
  errors: string[]
  warnings: string[]
  metadata: BuildMetadata
  timestamp: string
  id: string
}

export interface BuildMetadata {
  type: 'contracts' | 'backend' | 'frontend' | 'assets' | 'all'
  config: any
  stats: BuildStats
  dependencies?: string[]
  environment?: string
  version?: string
}

export interface BuildStats {
  totalFiles: number
  totalSize: number
  compressedSize?: number
  optimizationRatio?: number
  compressionRatio?: number
  buildTime: number
  memoryUsage: number
  cpuUsage: number
}

export interface ContractBuildResult extends BuildResult {
  contracts: ContractInfo[]
  artifacts: string[]
  gasReport?: GasReport
  verificationResults?: VerificationResult[]
}

export interface ContractInfo {
  name: string
  address?: string
  bytecode: string
  abi: any[]
  gasUsed: number
  size: number
  verified: boolean
  constructorArgs?: any[]
  libraries?: Record<string, string>
}

export interface GasReport {
  contracts: Record<string, ContractGasInfo>
  summary: GasSummary
  timestamp: string
}

export interface ContractGasInfo {
  functions: Record<string, FunctionGasInfo>
  constructor?: FunctionGasInfo
  fallback?: FunctionGasInfo
  receive?: FunctionGasInfo
}

export interface FunctionGasInfo {
  min: number
  max: number
  avg: number
  calls: number
}

export interface GasSummary {
  totalGas: number
  averageGas: number
  maxGas: number
  minGas: number
  totalFunctions: number
}

export interface VerificationResult {
  contract: string
  address: string
  network: string
  success: boolean
  url?: string
  error?: string
}

export interface BackendBuildResult extends BuildResult {
  bundles: BundleInfo[]
  dependencies: DependencyInfo[]
  runtimeInfo: RuntimeInfo
}

export interface BundleInfo {
  name: string
  size: number
  format: string
  target: string
  entryPoints: string[]
  chunks: string[]
}

export interface DependencyInfo {
  name: string
  version: string
  type: 'production' | 'development' | 'peer'
  size: number
  vulnerabilities?: VulnerabilityInfo[]
}

export interface VulnerabilityInfo {
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  cve?: string
  fixedIn?: string
}

export interface RuntimeInfo {
  nodeVersion: string
  platform: string
  architecture: string
  memory: number
  cpu: number
}

export interface FrontendBuildResult extends BuildResult {
  bundles: BundleInfo[]
  assets: AssetInfo[]
  chunks: ChunkInfo[]
  manifest: ManifestInfo
}

export interface AssetInfo {
  name: string
  type: 'js' | 'css' | 'html' | 'image' | 'font' | 'other'
  size: number
  path: string
  hash: string
  compressed?: boolean
}

export interface ChunkInfo {
  name: string
  size: number
  files: string[]
  modules: string[]
  entry: boolean
  async: boolean
}

export interface ManifestInfo {
  version: string
  timestamp: string
  entries: Record<string, string>
  chunks: Record<string, string[]>
  assets: Record<string, string>
}

export interface AssetBuildResult extends BuildResult {
  processed: ProcessedAssetInfo[]
  thumbnails: ThumbnailInfo[]
  metadata: AssetMetadataInfo
}

export interface ProcessedAssetInfo {
  original: string
  processed: string
  type: 'image' | 'audio' | 'video' | 'model' | 'texture'
  originalSize: number
  processedSize: number
  format: string
  quality: number
  dimensions?: Dimensions
}

export interface ThumbnailInfo {
  original: string
  thumbnail: string
  size: Dimensions
  format: string
}

export interface AssetMetadataInfo {
  totalAssets: number
  totalSize: number
  processedSize: number
  formats: Record<string, number>
  types: Record<string, number>
}

export interface Dimensions {
  width: number
  height: number
}

// ============================================================================
// OPTIMIZACIÓN
// ============================================================================

export interface OptimizationResult {
  success: boolean
  originalSize: number
  optimizedSize: number
  savings: number
  savingsPercentage: number
  optimizations: OptimizationInfo[]
  duration: number
}

export interface OptimizationInfo {
  type: string
  description: string
  savings: number
  applied: boolean
  error?: string
}

// ============================================================================
// COMPRESIÓN
// ============================================================================

export interface CompressionResult {
  success: boolean
  originalSize: number
  compressedSize: number
  savings: number
  savingsPercentage: number
  algorithm: string
  level: number
  duration: number
}

// ============================================================================
// FIRMA DIGITAL
// ============================================================================

export interface SigningResult {
  success: boolean
  signature: string
  publicKey: string
  algorithm: string
  timestamp: string
  verified: boolean
  certificate?: CertificateInfo
}

export interface CertificateInfo {
  issuer: string
  subject: string
  validFrom: string
  validTo: string
  serialNumber: string
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  score: number
  recommendations: string[]
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  file?: string
  line?: number
  column?: number
  code?: string
  suggestion?: string
}

// ============================================================================
// MONITOREO
// ============================================================================

export interface BuildMetrics {
  builds: BuildMetric[]
  performance: PerformanceMetrics
  quality: QualityMetrics
  trends: TrendMetrics
}

export interface BuildMetric {
  id: string
  type: string
  duration: number
  size: number
  success: boolean
  timestamp: string
  environment: string
}

export interface PerformanceMetrics {
  averageBuildTime: number
  averageSize: number
  successRate: number
  throughput: number
  bottlenecks: string[]
}

export interface QualityMetrics {
  codeQuality: number
  testCoverage: number
  securityScore: number
  maintainability: number
  technicalDebt: number
}

export interface TrendMetrics {
  buildTimeTrend: TrendData[]
  sizeTrend: TrendData[]
  successRateTrend: TrendData[]
  qualityTrend: TrendData[]
}

export interface TrendData {
  timestamp: string
  value: number
  change: number
}

// ============================================================================
// EVENTOS
// ============================================================================

export interface BuildEvent {
  type: BuildEventType
  timestamp: string
  data: any
  metadata: EventMetadata
}

export type BuildEventType = 
  | 'build_started'
  | 'build_completed'
  | 'build_failed'
  | 'optimization_started'
  | 'optimization_completed'
  | 'compression_started'
  | 'compression_completed'
  | 'signing_started'
  | 'signing_completed'
  | 'validation_started'
  | 'validation_completed'
  | 'deployment_started'
  | 'deployment_completed'

export interface EventMetadata {
  buildId: string
  module: string
  environment: string
  version: string
  user?: string
}

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum BuildStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum BuildPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum BuildEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing'
}

export const BUILD_CONSTANTS = {
  MAX_BUILD_TIME: 30 * 60 * 1000, // 30 minutes
  MAX_BUILD_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_CONCURRENT_BUILDS: 4,
  RETRY_ATTEMPTS: 3,
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  LOG_RETENTION_DAYS: 30,
  METRICS_RETENTION_DAYS: 90
} as const 