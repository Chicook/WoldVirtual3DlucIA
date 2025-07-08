/**
 * @fileoverview Tipos para formateo de utilidades del metaverso
 * @module @types/utilities/format
 */

// ============================================================================
// TIPOS BÁSICOS DE FORMATEO
// ============================================================================

/**
 * Opciones de formateo
 */
export interface FormatOptions {
  locale?: string;
  timezone?: string;
  currency?: string;
  precision?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  useGrouping?: boolean;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  metadata?: Record<string, any>;
}

/**
 * Resultado de formateo
 */
export interface FormatResult {
  value: string;
  original: any;
  type: string;
  options: FormatOptions;
  timestamp: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Formateador
 */
export interface Formatter {
  id: string;
  name: string;
  version: string;
  options: FormatOptions;
  metadata?: Record<string, any>;
  
  /**
   * Formatea un valor
   */
  format: (value: any, options?: Partial<FormatOptions>) => FormatResult;
  
  /**
   * Formatea un número
   */
  formatNumber: (value: number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una fecha
   */
  formatDate: (value: Date | string | number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una moneda
   */
  formatCurrency: (value: number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un porcentaje
   */
  formatPercentage: (value: number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una duración
   */
  formatDuration: (value: number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un tamaño de archivo
   */
  formatFileSize: (value: number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un nombre
   */
  formatName: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un email
   */
  formatEmail: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un teléfono
   */
  formatPhone: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una URL
   */
  formatUrl: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un UUID
   */
  formatUuid: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un hash
   */
  formatHash: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un JSON
   */
  formatJson: (value: any, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un XML
   */
  formatXml: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un CSV
   */
  formatCsv: (value: any[], options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un color
   */
  formatColor: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una posición 3D
   */
  formatPosition: (value: Position3D, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una rotación 3D
   */
  formatRotation: (value: Rotation3D, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un vector 3D
   */
  formatVector: (value: Vector3D, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una matriz 3D
   */
  formatMatrix: (value: Matrix3D, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un quaternion
   */
  formatQuaternion: (value: Quaternion, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un timestamp
   */
  formatTimestamp: (value: number, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un ID de transacción
   */
  formatTransactionId: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un ID de NFT
   */
  formatNftId: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un ID de avatar
   */
  formatAvatarId: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un ID de mundo
   */
  formatWorldId: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un mensaje de chat
   */
  formatChatMessage: (value: ChatMessage, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una notificación
   */
  formatNotification: (value: Notification, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un log
   */
  formatLog: (value: LogEntry, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un error
   */
  formatError: (value: Error, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un evento
   */
  formatEvent: (value: Event, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un estado
   */
  formatState: (value: State, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una métrica
   */
  formatMetric: (value: Metric, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una estadística
   */
  formatStatistic: (value: Statistic, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea un reporte
   */
  formatReport: (value: Report, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea una configuración
   */
  formatConfig: (value: Config, options?: Partial<FormatOptions>) => string;
  
  /**
   * Formatea metadatos
   */
  formatMetadata: (value: Metadata, options?: Partial<FormatOptions>) => string;
  
  /**
   * Parsea un valor formateado
   */
  parse: (value: string, type: string, options?: Partial<FormatOptions>) => any;
  
  /**
   * Valida formato
   */
  validate: (value: string, type: string, options?: Partial<FormatOptions>) => boolean;
  
  /**
   * Normaliza formato
   */
  normalize: (value: string, type: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Sanitiza formato
   */
  sanitize: (value: string, type: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Encripta formato
   */
  encrypt: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Desencripta formato
   */
  decrypt: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Comprime formato
   */
  compress: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Descomprime formato
   */
  decompress: (value: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Convierte formato
   */
  convert: (value: string, fromType: string, toType: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Exporta configuración
   */
  export: () => FormatterExport;
  
  /**
   * Importa configuración
   */
  import: (data: FormatterExport) => void;
}

// ============================================================================
// TIPOS DE DATOS ESPECÍFICOS
// ============================================================================

/**
 * Posición 3D
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
  worldId?: string;
  metadata?: Record<string, any>;
}

/**
 * Rotación 3D
 */
export interface Rotation3D {
  x: number;
  y: number;
  z: number;
  metadata?: Record<string, any>;
}

/**
 * Vector 3D
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
  metadata?: Record<string, any>;
}

/**
 * Matriz 3D
 */
export interface Matrix3D {
  m11: number;
  m12: number;
  m13: number;
  m14: number;
  m21: number;
  m22: number;
  m23: number;
  m24: number;
  m31: number;
  m32: number;
  m33: number;
  m34: number;
  m41: number;
  m42: number;
  m43: number;
  m44: number;
  metadata?: Record<string, any>;
}

/**
 * Quaternion
 */
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  metadata?: Record<string, any>;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'voice' | 'emote' | 'system';
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Notificación
 */
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Entrada de log
 */
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Error
 */
export interface Error {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Evento
 */
export interface Event {
  type: string;
  source: string;
  target: string;
  data: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Estado
 */
export interface State {
  id: string;
  type: string;
  value: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Métrica
 */
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Estadística
 */
export interface Statistic {
  name: string;
  value: number;
  min: number;
  max: number;
  avg: number;
  count: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Reporte
 */
export interface Report {
  id: string;
  title: string;
  content: string;
  type: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Configuración
 */
export interface Config {
  name: string;
  value: any;
  type: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Metadatos
 */
export interface Metadata {
  title: string;
  description: string;
  tags: string[];
  properties: Record<string, any>;
  timestamp: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE FORMATEO ESPECÍFICOS
// ============================================================================

/**
 * Formateo de número
 */
export interface NumberFormat {
  style: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  unit?: string;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  useGrouping?: boolean;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  metadata?: Record<string, any>;
}

/**
 * Formateo de fecha
 */
export interface DateFormat {
  year: 'numeric' | '2-digit';
  month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day: 'numeric' | '2-digit';
  weekday: 'long' | 'short' | 'narrow';
  hour: 'numeric' | '2-digit';
  minute: 'numeric' | '2-digit';
  second: 'numeric' | '2-digit';
  timeZoneName: 'long' | 'short';
  hour12?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de moneda
 */
export interface CurrencyFormat {
  currency: string;
  currencyDisplay: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  useGrouping?: boolean;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  metadata?: Record<string, any>;
}

/**
 * Formateo de duración
 */
export interface DurationFormat {
  years?: boolean;
  months?: boolean;
  weeks?: boolean;
  days?: boolean;
  hours?: boolean;
  minutes?: boolean;
  seconds?: boolean;
  milliseconds?: boolean;
  format: 'short' | 'long' | 'compact';
  metadata?: Record<string, any>;
}

/**
 * Formateo de tamaño de archivo
 */
export interface FileSizeFormat {
  base: 1000 | 1024;
  precision: number;
  format: 'short' | 'long';
  metadata?: Record<string, any>;
}

/**
 * Formateo de nombre
 */
export interface NameFormat {
  case: 'lower' | 'upper' | 'title' | 'sentence';
  trim: boolean;
  maxLength?: number;
  metadata?: Record<string, any>;
}

/**
 * Formateo de email
 */
export interface EmailFormat {
  case: 'lower' | 'upper';
  trim: boolean;
  validate: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de teléfono
 */
export interface PhoneFormat {
  country: string;
  format: 'national' | 'international' | 'e164';
  metadata?: Record<string, any>;
}

/**
 * Formateo de URL
 */
export interface UrlFormat {
  protocol: 'http' | 'https' | 'ws' | 'wss';
  trim: boolean;
  validate: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de UUID
 */
export interface UuidFormat {
  version: 1 | 3 | 4 | 5;
  format: 'standard' | 'compact' | 'urn';
  metadata?: Record<string, any>;
}

/**
 * Formateo de hash
 */
export interface HashFormat {
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  format: 'hex' | 'base64';
  length?: number;
  metadata?: Record<string, any>;
}

/**
 * Formateo de JSON
 */
export interface JsonFormat {
  indent: number;
  sortKeys: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de XML
 */
export interface XmlFormat {
  indent: number;
  declaration: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de CSV
 */
export interface CsvFormat {
  delimiter: string;
  quote: string;
  escape: string;
  header: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de color
 */
export interface ColorFormat {
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'name';
  alpha: boolean;
  metadata?: Record<string, any>;
}

/**
 * Formateo de posición 3D
 */
export interface PositionFormat {
  precision: number;
  includeWorldId: boolean;
  format: 'array' | 'object' | 'string';
  metadata?: Record<string, any>;
}

/**
 * Formateo de rotación 3D
 */
export interface RotationFormat {
  precision: number;
  format: 'degrees' | 'radians';
  metadata?: Record<string, any>;
}

/**
 * Formateo de vector 3D
 */
export interface VectorFormat {
  precision: number;
  format: 'array' | 'object' | 'string';
  metadata?: Record<string, any>;
}

/**
 * Formateo de matriz 3D
 */
export interface MatrixFormat {
  precision: number;
  format: 'array' | 'object' | 'string';
  metadata?: Record<string, any>;
}

/**
 * Formateo de quaternion
 */
export interface QuaternionFormat {
  precision: number;
  format: 'array' | 'object' | 'string';
  metadata?: Record<string, any>;
}

/**
 * Formateo de timestamp
 */
export interface TimestampFormat {
  format: 'unix' | 'iso' | 'rfc' | 'custom';
  timezone: string;
  metadata?: Record<string, any>;
}

/**
 * Formateo de ID de transacción
 */
export interface TransactionIdFormat {
  prefix: string;
  length: number;
  format: 'hex' | 'base64' | 'uuid';
  metadata?: Record<string, any>;
}

/**
 * Formateo de ID de NFT
 */
export interface NftIdFormat {
  prefix: string;
  length: number;
  format: 'hex' | 'base64' | 'uuid';
  metadata?: Record<string, any>;
}

/**
 * Formateo de ID de avatar
 */
export interface AvatarIdFormat {
  prefix: string;
  length: number;
  format: 'hex' | 'base64' | 'uuid';
  metadata?: Record<string, any>;
}

/**
 * Formateo de ID de mundo
 */
export interface WorldIdFormat {
  prefix: string;
  length: number;
  format: 'hex' | 'base64' | 'uuid';
  metadata?: Record<string, any>;
}

/**
 * Formateo de mensaje de chat
 */
export interface ChatMessageFormat {
  includeTimestamp: boolean;
  includeSender: boolean;
  includeType: boolean;
  format: 'text' | 'html' | 'json';
  metadata?: Record<string, any>;
}

/**
 * Formateo de notificación
 */
export interface NotificationFormat {
  includeTimestamp: boolean;
  includeType: boolean;
  format: 'text' | 'html' | 'json';
  metadata?: Record<string, any>;
}

/**
 * Formateo de log
 */
export interface LogFormat {
  includeTimestamp: boolean;
  includeLevel: boolean;
  includeSource: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de error
 */
export interface ErrorFormat {
  includeStack: boolean;
  includeCode: boolean;
  includeTimestamp: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de evento
 */
export interface EventFormat {
  includeTimestamp: boolean;
  includeSource: boolean;
  includeTarget: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de estado
 */
export interface StateFormat {
  includeTimestamp: boolean;
  includeType: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de métrica
 */
export interface MetricFormat {
  includeTimestamp: boolean;
  includeUnit: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de estadística
 */
export interface StatisticFormat {
  includeTimestamp: boolean;
  includeAll: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de reporte
 */
export interface ReportFormat {
  includeTimestamp: boolean;
  includeType: boolean;
  format: 'text' | 'html' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de configuración
 */
export interface ConfigFormat {
  includeTimestamp: boolean;
  includeType: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

/**
 * Formateo de metadatos
 */
export interface MetadataFormat {
  includeTimestamp: boolean;
  includeTags: boolean;
  format: 'text' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Exportación del formateador
 */
export interface FormatterExport {
  id: string;
  name: string;
  version: string;
  options: FormatOptions;
  metadata?: Record<string, any>;
}

/**
 * Utilidades de formateo
 */
export interface FormatUtils {
  /**
   * Crea un formateador
   */
  createFormatter: (options?: Partial<FormatOptions>) => Formatter;
  
  /**
   * Formatea un valor básico
   */
  formatValue: (value: any, type: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Parsea un valor formateado básico
   */
  parseValue: (value: string, type: string, options?: Partial<FormatOptions>) => any;
  
  /**
   * Valida formato básico
   */
  validateFormat: (value: string, type: string, options?: Partial<FormatOptions>) => boolean;
  
  /**
   * Normaliza formato básico
   */
  normalizeFormat: (value: string, type: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Sanitiza formato básico
   */
  sanitizeFormat: (value: string, type: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Convierte formato básico
   */
  convertFormat: (value: string, fromType: string, toType: string, options?: Partial<FormatOptions>) => string;
  
  /**
   * Combina resultados de formateo
   */
  mergeResults: (results: FormatResult[]) => FormatResult;
  
  /**
   * Agrupa resultados por tipo
   */
  groupResultsByType: (results: FormatResult[]) => Record<string, FormatResult[]>;
  
  /**
   * Filtra resultados por tipo
   */
  filterResultsByType: (results: FormatResult[], type: string) => FormatResult[];
  
  /**
   * Ordena resultados por timestamp
   */
  sortResultsByTimestamp: (results: FormatResult[], order: 'asc' | 'desc') => FormatResult[];
  
  /**
   * Serializa resultado de formateo
   */
  serializeResult: (result: FormatResult) => string;
  
  /**
   * Deserializa resultado de formateo
   */
  deserializeResult: (data: string) => FormatResult;
  
  /**
   * Exporta formateador
   */
  exportFormatter: (formatter: Formatter) => string;
  
  /**
   * Importa formateador
   */
  importFormatter: (data: string) => Formatter;
  
  /**
   * Valida formateador
   */
  validateFormatter: (formatter: Formatter) => boolean;
  
  /**
   * Optimiza formateador
   */
  optimizeFormatter: (formatter: Formatter) => Formatter;
  
  /**
   * Genera documentación de formateador
   */
  generateFormatterDocs: (formatter: Formatter) => string;
  
  /**
   * Ejecuta formateo en paralelo
   */
  formatParallel: (values: any[], type: string, options?: Partial<FormatOptions>) => Promise<FormatResult[]>;
  
  /**
   * Ejecuta formateo en serie
   */
  formatSerial: (values: any[], type: string, options?: Partial<FormatOptions>) => Promise<FormatResult[]>;
  
  /**
   * Formatea con timeout
   */
  formatWithTimeout: (value: any, type: string, options?: Partial<FormatOptions>, timeout: number) => Promise<FormatResult>;
  
  /**
   * Formatea con retry
   */
  formatWithRetry: (value: any, type: string, options?: Partial<FormatOptions>, maxRetries: number) => Promise<FormatResult>;
  
  /**
   * Formatea con cache
   */
  formatWithCache: (value: any, type: string, options?: Partial<FormatOptions>, cacheKey: string) => Promise<FormatResult>;
  
  /**
   * Limpia cache
   */
  clearCache: () => void;
  
  /**
   * Obtiene estadísticas de cache
   */
  getCacheStats: () => CacheStats;
  
  /**
   * Registra formateador personalizado
   */
  registerCustomFormatter: (name: string, formatter: (value: any, options?: Partial<FormatOptions>) => string) => void;
  
  /**
   * Desregistra formateador personalizado
   */
  unregisterCustomFormatter: (name: string) => void;
  
  /**
   * Lista formateadores personalizados
   */
  listCustomFormatters: () => string[];
  
  /**
   * Ejecuta formateador personalizado
   */
  executeCustomFormatter: (name: string, value: any, options?: Partial<FormatOptions>) => string;
}

/**
 * Estadísticas de cache
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de formateo
 */
export interface FormatEvent {
  type: 'started' | 'completed' | 'failed' | 'cached' | 'timeout' | 'retry';
  formatter: Formatter;
  value: any;
  result?: FormatResult;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de eventos de formateo
 */
export interface FormatEventListener {
  onFormatStarted: (event: FormatEvent) => void;
  onFormatCompleted: (event: FormatEvent) => void;
  onFormatFailed: (event: FormatEvent) => void;
  onFormatCached: (event: FormatEvent) => void;
  onFormatTimeout: (event: FormatEvent) => void;
  onFormatRetry: (event: FormatEvent) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  FormatOptions,
  FormatResult,
  Formatter,
  Position3D,
  Rotation3D,
  Vector3D,
  Matrix3D,
  Quaternion,
  ChatMessage,
  Notification,
  LogEntry,
  Error,
  Event,
  State,
  Metric,
  Statistic,
  Report,
  Config,
  Metadata,
  NumberFormat,
  DateFormat,
  CurrencyFormat,
  DurationFormat,
  FileSizeFormat,
  NameFormat,
  EmailFormat,
  PhoneFormat,
  UrlFormat,
  UuidFormat,
  HashFormat,
  JsonFormat,
  XmlFormat,
  CsvFormat,
  ColorFormat,
  PositionFormat,
  RotationFormat,
  VectorFormat,
  MatrixFormat,
  QuaternionFormat,
  TimestampFormat,
  TransactionIdFormat,
  NftIdFormat,
  AvatarIdFormat,
  WorldIdFormat,
  ChatMessageFormat,
  NotificationFormat,
  LogFormat,
  ErrorFormat,
  EventFormat,
  StateFormat,
  MetricFormat,
  StatisticFormat,
  ReportFormat,
  ConfigFormat,
  MetadataFormat,
  FormatterExport,
  FormatUtils,
  CacheStats,
  FormatEvent,
  FormatEventListener
}; 