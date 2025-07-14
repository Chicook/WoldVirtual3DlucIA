// Tipos para el sistema de mensajería entre módulos
export interface MessageData {
  id: string;
  type: string;
  payload: any;
  metadata: MessageMetadata;
  timestamp: number;
  source: string;
  target?: string;
  correlationId?: string;
  replyTo?: string;
}

export interface MessageMetadata {
  version: string;
  encoding: string;
  compression?: string;
  encryption?: string;
  checksum: string;
  size: number;
  priority: MessagePriority;
  ttl: number;
  retryCount: number;
  maxRetries: number;
}

export type MessagePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface EventHandler {
  (data: MessageData): void | Promise<void>;
}

export interface MessageBus {
  subscribe(event: string, handler: EventHandler): SubscriptionToken;
  unsubscribe(token: SubscriptionToken): boolean;
  publish(event: string, data: MessageData): Promise<void>;
  request(event: string, data: MessageData, timeout?: number): Promise<MessageData>;
  getSubscribers(event: string): EventHandler[];
  getStats(): MessageBusStats;
}

export type SubscriptionToken = string;

export interface MessageBusStats {
  totalMessages: number;
  activeSubscriptions: number;
  events: Map<string, EventStats>;
  performance: PerformanceStats;
  errors: ErrorStats;
}

export interface EventStats {
  event: string;
  messageCount: number;
  subscriberCount: number;
  averageLatency: number;
  errorCount: number;
  lastMessage: number;
}

export interface PerformanceStats {
  averageLatency: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  queueSize: number;
}

export interface ErrorStats {
  totalErrors: number;
  errorRate: number;
  lastError?: Error;
  errorTypes: Map<string, number>;
}

export interface MessageQueue {
  enqueue(message: MessageData): Promise<void>;
  dequeue(): Promise<MessageData | null>;
  peek(): MessageData | null;
  size(): number;
  clear(): void;
  isEmpty(): boolean;
}

export interface MessageRouter {
  route(message: MessageData): Promise<void>;
  addRoute(pattern: string, handler: EventHandler): void;
  removeRoute(pattern: string): boolean;
  getRoutes(): Map<string, EventHandler>;
}

export interface MessageFilter {
  matches(message: MessageData): boolean;
  getDescription(): string;
}

export interface MessageTransformer {
  transform(message: MessageData): MessageData;
  canTransform(message: MessageData): boolean;
  getDescription(): string;
}

export interface MessageValidator {
  validate(message: MessageData): ValidationResult;
  getSchema(): any;
  getDescription(): string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface MessageSerializer {
  serialize(data: any): string | Buffer;
  deserialize(data: string | Buffer): any;
  getFormat(): string;
}

export interface MessageCompressor {
  compress(data: Buffer): Buffer;
  decompress(data: Buffer): Buffer;
  getAlgorithm(): string;
}

export interface MessageEncryptor {
  encrypt(data: Buffer, key: string): Buffer;
  decrypt(data: Buffer, key: string): Buffer;
  getAlgorithm(): string;
}

export interface MessageAuthenticator {
  sign(data: Buffer, privateKey: string): string;
  verify(data: Buffer, signature: string, publicKey: string): boolean;
  getAlgorithm(): string;
}

export interface MessageRetryPolicy {
  shouldRetry(message: MessageData, error: Error): boolean;
  getRetryDelay(attempt: number): number;
  getMaxRetries(): number;
  getBackoffStrategy(): string;
}

export interface MessageCircuitBreaker {
  isOpen(): boolean;
  recordSuccess(): void;
  recordFailure(): void;
  reset(): void;
  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  getStats(): CircuitBreakerStats;
}

export interface CircuitBreakerStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  lastFailure: number;
  nextAttempt: number;
}

export interface MessageRateLimiter {
  isAllowed(key: string): boolean;
  recordRequest(key: string): void;
  getRemaining(key: string): number;
  getResetTime(key: string): number;
}

export interface MessageDeadLetterQueue {
  add(message: MessageData, error: Error): Promise<void>;
  get(size?: number): Promise<DeadLetterMessage[]>;
  remove(id: string): Promise<boolean>;
  retry(id: string): Promise<void>;
  size(): number;
}

export interface DeadLetterMessage {
  id: string;
  originalMessage: MessageData;
  error: Error;
  timestamp: number;
  retryCount: number;
}

export interface MessageMonitor {
  recordMessage(message: MessageData): void;
  recordError(message: MessageData, error: Error): void;
  recordLatency(message: MessageData, latency: number): void;
  getMetrics(): MessageMetrics;
  getAlerts(): MessageAlert[];
}

export interface MessageMetrics {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  averageLatency: number;
  throughput: number;
  errorRate: number;
  queueDepth: number;
}

export interface MessageAlert {
  id: string;
  type: 'ERROR_RATE' | 'LATENCY' | 'QUEUE_DEPTH' | 'THROUGHPUT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface MessageConfig {
  maxMessageSize: number;
  defaultTimeout: number;
  maxRetries: number;
  retryDelay: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  authenticationEnabled: boolean;
  rateLimitingEnabled: boolean;
  circuitBreakerEnabled: boolean;
  deadLetterQueueEnabled: boolean;
  monitoringEnabled: boolean;
}

export interface MessageContext {
  messageId: string;
  correlationId?: string;
  source: string;
  target?: string;
  timestamp: number;
  metadata: Record<string, any>;
  user?: string;
  session?: string;
  trace?: string;
} 