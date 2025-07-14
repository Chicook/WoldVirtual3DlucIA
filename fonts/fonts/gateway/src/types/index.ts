/**
 * @fileoverview Tipos principales del gateway del metaverso
 * @module @metaverso/gateway/types
 */

// Configuraciones del sistema
export interface GatewayConfig {
  server: ServerConfig;
  redis: RedisConfig;
  federation: FederationConfig;
  did: DIDConfig;
  indexing: IndexingConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

export interface ServerConfig {
  port: number;
  host: string;
  cors: CORSConfig;
  compression: boolean;
  trustProxy: boolean;
}

export interface CORSConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface RedisConfig {
  url: string;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keyPrefix: string;
}

export interface FederationConfig {
  enabled: boolean;
  services: FederationService[];
  mesh: GraphQLMeshConfig;
  cache: boolean;
  timeout: number;
}

export interface FederationService {
  name: string;
  url: string;
  timeout: number;
  retries: number;
  healthCheck: boolean;
  schema?: string;
}

export interface GraphQLMeshConfig {
  cache: boolean;
  introspection: boolean;
  playground: boolean;
  tracing: boolean;
  cacheControl: boolean;
}

export interface DIDConfig {
  enabled: boolean;
  resolvers: string[];
  cache: boolean;
  timeout: number;
  ethereum: EthereumConfig;
}

export interface EthereumConfig {
  rpcUrl: string;
  networkId: number;
  registryAddress: string;
  gasLimit: number;
}

export interface IndexingConfig {
  enabled: boolean;
  batchSize: number;
  interval: number;
  cache: boolean;
  elasticsearch?: ElasticsearchConfig;
}

export interface ElasticsearchConfig {
  url: string;
  index: string;
  username?: string;
  password?: string;
}

export interface SecurityConfig {
  rateLimit: RateLimitConfig;
  jwt: JWTConfig;
  cors: CORSConfig;
  helmet: boolean;
  compression: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  prometheus: boolean;
  sentry?: SentryConfig;
  logging: LoggingConfig;
}

export interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
}

export interface LoggingConfig {
  level: string;
  format: string;
  transports: string[];
}

// Tipos de API
export interface APIConfig {
  basePath: string;
  version: string;
  documentation: boolean;
  rateLimit: boolean;
  cors: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: APIMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface APIMeta {
  timestamp: string;
  version: string;
  requestId: string;
}

// Tipos de DID
export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  keyAgreement: string[];
  capabilityInvocation: string[];
  capabilityDelegation: string[];
  service: Service[];
  created: string;
  updated: string;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: any;
  publicKeyHex?: string;
  publicKeyBase64?: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  didResolutionMetadata: DIDResolutionMetadata;
  didDocumentMetadata: DIDDocumentMetadata;
}

export interface DIDResolutionMetadata {
  contentType: string;
  error?: string;
}

export interface DIDDocumentMetadata {
  created: string;
  updated: string;
  deactivated?: boolean;
  versionId?: string;
  nextUpdate?: string;
  nextVersionId?: string;
}

// Tipos de Indexación
export interface IndexingJob {
  id: string;
  type: 'world' | 'user' | 'asset' | 'transaction';
  data: any;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilter[];
  sort: SearchSort[];
  pagination: SearchPagination;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'exists' | 'regex';
  value: any;
}

export interface SearchSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchPagination {
  page: number;
  limit: number;
  offset: number;
}

export interface SearchResult<T = any> {
  hits: SearchHit<T>[];
  total: number;
  page: number;
  limit: number;
  aggregations?: any;
}

export interface SearchHit<T = any> {
  id: string;
  score: number;
  source: T;
  highlights?: Record<string, string[]>;
}

// Tipos de Middleware
export interface MiddlewareConfig {
  enabled: boolean;
  order: number;
  options?: any;
}

export interface AuthConfig extends MiddlewareConfig {
  strategy: 'jwt' | 'did' | 'api-key';
  secret?: string;
  algorithms: string[];
}

export interface RateLimitConfig extends MiddlewareConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface ValidationConfig extends MiddlewareConfig {
  schema: any;
  abortEarly: boolean;
  allowUnknown: boolean;
}

// Tipos de Métricas
export interface MetricsConfig {
  enabled: boolean;
  prometheus: boolean;
  custom: boolean;
}

export interface MetricPoint {
  timestamp: number;
  value: number;
  labels: Record<string, string>;
}

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  labels: string[];
  points: MetricPoint[];
}

// Tipos de Cache
export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
  hitRate: number;
}

// Tipos de Eventos
export interface GatewayEvent {
  type: string;
  timestamp: number;
  data: any;
  source: string;
}

export interface RequestEvent extends GatewayEvent {
  type: 'request';
  data: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    ip: string;
    userAgent: string;
  };
}

export interface ResponseEvent extends GatewayEvent {
  type: 'response';
  data: {
    statusCode: number;
    responseTime: number;
    size: number;
  };
}

export interface ErrorEvent extends GatewayEvent {
  type: 'error';
  data: {
    error: string;
    stack?: string;
    context?: any;
  };
}

// Tipos de Health Check
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  timestamp: string;
  details?: any;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  timestamp: string;
  version: string;
}

// Tipos de Configuración de Entorno
export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  host: string;
  redisUrl: string;
  jwtSecret: string;
  sentryDsn?: string;
  logLevel: string;
} 