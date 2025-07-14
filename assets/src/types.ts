/**
 * @fileoverview Tipos de datos para el sistema de assets del metaverso
 * @module assets/src/types
 */

/**
 * Tipos de assets soportados
 */
export enum AssetType {
  MODEL_3D = '3d_model',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  IMAGE = 'image',
  ANIMATION = 'animation',
  VIDEO = 'video'
}

/**
 * Categorías de assets
 */
export enum AssetCategory {
  CHARACTER = 'character',
  BUILDING = 'building',
  VEHICLE = 'vehicle',
  PROP = 'prop',
  ENVIRONMENT = 'environment',
  UI = 'ui',
  AUDIO = 'audio',
  EFFECT = 'effect'
}

/**
 * Metadatos de un asset
 */
export interface AssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  size: number;
  format: string;
  path: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  properties: Record<string, any>;
  description?: string;
  author?: string;
  license?: string;
  version?: string;
  dependencies?: string[];
  hash?: string;
  checksum?: string;
}

/**
 * Información completa de un asset
 */
export interface AssetInfo {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  url: string;
  size: number;
  metadata: AssetMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resultado de procesamiento de asset
 */
export interface AssetResult {
  success: boolean;
  originalPath: string;
  processedPath?: string;
  metadata?: AssetMetadata;
  stats?: {
    originalSize: number;
    optimizedSize: number;
    compressedSize: number;
    reduction: number;
  };
  error?: string;
}

/**
 * Opciones de procesamiento de asset
 */
export interface AssetProcessOptions {
  optimization?: OptimizationOptions;
  compression?: CompressionOptions;
  upload?: UploadOptions;
  batchSize?: number;
}

/**
 * Opciones de optimización
 */
export interface OptimizationOptions {
  quality?: number;
  format?: string;
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
  removeMetadata?: boolean;
  stripUnused?: boolean;
}

/**
 * Opciones de compresión
 */
export interface CompressionOptions {
  algorithm?: string;
  level?: number;
  preserveMetadata?: boolean;
  removeUnused?: boolean;
  optimizeForWeb?: boolean;
}

/**
 * Opciones de upload
 */
export interface UploadOptions {
  platform?: 'ipfs' | 'arweave' | 'aws' | 'local';
  public?: boolean;
  tags?: string[];
  pin?: boolean;
  backup?: boolean;
}

/**
 * Criterios de búsqueda de assets
 */
export interface AssetSearchCriteria {
  type?: AssetType;
  category?: AssetCategory;
  tags?: string[];
  size?: {
    min?: number;
    max?: number;
  };
  date?: {
    from?: Date;
    to?: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'size' | 'date' | 'type';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Estadísticas del sistema de assets
 */
export interface AssetSystemStats {
  totalAssets: number;
  totalSize: number;
  averageOptimization: number;
  storageUsed: number;
  uploads: number;
  categories: Record<string, number>;
  types: Record<string, number>;
  recentUploads: AssetInfo[];
}

/**
 * Configuración de validación
 */
export interface ValidationConfig {
  maxFileSize: number;
  allowedFormats: string[];
  requiredMetadata: string[];
  forbiddenPatterns: string[];
  virusScan: boolean;
  integrityCheck: boolean;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  size: number;
  format: string;
  hash: string;
  metadata: Partial<AssetMetadata>;
}

/**
 * Configuración de optimización
 */
export interface OptimizationConfig {
  models: ModelOptimizationConfig;
  textures: TextureOptimizationConfig;
  audio: AudioOptimizationConfig;
  images: ImageOptimizationConfig;
}

/**
 * Configuración de optimización de modelos 3D
 */
export interface ModelOptimizationConfig {
  maxPolygons: number;
  maxTextures: number;
  maxTextureSize: number;
  enableDraco: boolean;
  enableBasis: boolean;
  generateLOD: boolean;
  removeUnused: boolean;
}

/**
 * Configuración de optimización de texturas
 */
export interface TextureOptimizationConfig {
  maxSize: number;
  format: string;
  quality: number;
  generateMipmaps: boolean;
  enableCompression: boolean;
  preserveAlpha: boolean;
}

/**
 * Configuración de optimización de audio
 */
export interface AudioOptimizationConfig {
  format: string;
  bitrate: number;
  sampleRate: number;
  channels: number;
  normalize: boolean;
  removeSilence: boolean;
}

/**
 * Configuración de optimización de imágenes
 */
export interface ImageOptimizationConfig {
  maxSize: number;
  format: string;
  quality: number;
  progressive: boolean;
  stripMetadata: boolean;
  generateThumbnails: boolean;
}

/**
 * Configuración de compresión
 */
export interface CompressionConfig {
  algorithm: string;
  level: number;
  preserveMetadata: boolean;
  removeUnused: boolean;
  optimizeForWeb: boolean;
}

/**
 * Configuración de upload
 */
export interface UploadConfig {
  platforms: {
    ipfs?: IPFSConfig;
    arweave?: ArweaveConfig;
    aws?: AWSConfig;
    local?: LocalConfig;
  };
  defaultPlatform: string;
  backupPlatforms: string[];
  retryAttempts: number;
  timeout: number;
}

/**
 * Configuración de IPFS
 */
export interface IPFSConfig {
  endpoint: string;
  apiKey?: string;
  pin: boolean;
  timeout: number;
}

/**
 * Configuración de Arweave
 */
export interface ArweaveConfig {
  endpoint: string;
  wallet: string;
  timeout: number;
}

/**
 * Configuración de AWS
 */
export interface AWSConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  public: boolean;
}

/**
 * Configuración de almacenamiento local
 */
export interface LocalConfig {
  path: string;
  public: boolean;
  maxSize: number;
}

/**
 * Configuración del catálogo
 */
export interface CatalogConfig {
  database: string;
  backup: boolean;
  indexing: boolean;
  search: boolean;
  analytics: boolean;
}

/**
 * Configuración de metadatos
 */
export interface MetadataConfig {
  schema: string;
  validation: boolean;
  autoGenerate: boolean;
  required: string[];
  optional: string[];
}

/**
 * Configuración general del sistema
 */
export interface AssetsConfig {
  validation: ValidationConfig;
  optimization: OptimizationConfig;
  compression: CompressionConfig;
  upload: UploadConfig;
  catalog: CatalogConfig;
  metadata: MetadataConfig;
  tempDir: string;
  processedDir: string;
  maxConcurrent: number;
  timeout: number;
  retryAttempts: number;
}

/**
 * Eventos del sistema de assets
 */
export enum AssetEvent {
  VALIDATION_START = 'validation:start',
  VALIDATION_COMPLETE = 'validation:complete',
  VALIDATION_ERROR = 'validation:error',
  OPTIMIZATION_START = 'optimization:start',
  OPTIMIZATION_COMPLETE = 'optimization:complete',
  OPTIMIZATION_ERROR = 'optimization:error',
  COMPRESSION_START = 'compression:start',
  COMPRESSION_COMPLETE = 'compression:complete',
  COMPRESSION_ERROR = 'compression:error',
  UPLOAD_START = 'upload:start',
  UPLOAD_COMPLETE = 'upload:complete',
  UPLOAD_ERROR = 'upload:error',
  PROCESSING_START = 'processing:start',
  PROCESSING_COMPLETE = 'processing:complete',
  PROCESSING_ERROR = 'processing:error'
}

/**
 * Datos de evento
 */
export interface AssetEventData {
  assetId: string;
  assetPath: string;
  timestamp: Date;
  duration?: number;
  error?: Error;
  metadata?: Partial<AssetMetadata>;
}

/**
 * Callback de evento
 */
export type AssetEventHandler = (event: AssetEvent, data: AssetEventData) => void;

/**
 * Progreso de procesamiento
 */
export interface ProcessingProgress {
  current: number;
  total: number;
  percentage: number;
  currentAsset: string;
  stage: 'validation' | 'optimization' | 'compression' | 'upload';
  startTime: Date;
  estimatedTime?: number;
}

/**
 * Callback de progreso
 */
export type ProgressCallback = (progress: ProcessingProgress) => void; 