import Redis = require('ioredis');
import { Logger } from '../utils/Logger';
import { config } from '../config';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  uptime: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private redis: Redis;
  private logger: Logger;
  private isConnected: boolean = false;
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 };

  private constructor() {
    this.logger = new Logger('CacheManager');
    
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      keyPrefix: config.redis.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      maxLoadingTimeout: 10000,
      enableReadyCheck: true,
      maxMemoryPolicy: 'allkeys-lru',
      maxMemory: '256mb'
    });

    this.setupEventListeners();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private setupEventListeners(): void {
    this.redis.on('connect', () => {
      this.logger.info('Conectando a Redis...');
    });

    this.redis.on('ready', () => {
      this.isConnected = true;
      this.logger.success('Redis conectado y listo');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Error de Redis', error);
      this.isConnected = false;
    });

    this.redis.on('close', () => {
      this.logger.warn('Conexión de Redis cerrada');
      this.isConnected = false;
    });

    this.redis.on('reconnecting', () => {
      this.logger.info('Reconectando a Redis...');
    });
  }

  public static async initialize(): Promise<void> {
    const instance = CacheManager.getInstance();
    await instance.connect();
  }

  public async connect(): Promise<void> {
    try {
      this.logger.info('Conectando a Redis...');
      
      await this.redis.connect();
      
      // Verificar conexión
      await this.redis.ping();
      this.logger.success('Redis conectado exitosamente');
      
    } catch (error) {
      this.logger.error('Error conectando a Redis', error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.logger.info('Desconectando de Redis...');
      
      await this.redis.disconnect();
      this.isConnected = false;
      
      this.logger.success('Redis desconectado');
      
    } catch (error) {
      this.logger.error('Error desconectando de Redis', error as Error);
      throw error;
    }
  }

  public static async close(): Promise<void> {
    const instance = CacheManager.getInstance();
    await instance.disconnect();
  }

  public async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || config.cache.ttl;
      const prefix = options.prefix || '';
      const fullKey = prefix ? `${prefix}:${key}` : key;
      
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, serializedValue);
      } else {
        await this.redis.set(fullKey, serializedValue);
      }
      
      this.logger.debug(`Cache set: ${fullKey}`, { ttl });
      
    } catch (error) {
      this.logger.error(`Error setting cache key: ${key}`, error as Error);
      throw error;
    }
  }

  public async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const prefix = options.prefix || '';
      const fullKey = prefix ? `${prefix}:${key}` : key;
      
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        this.logger.debug(`Cache miss: ${fullKey}`);
        return null;
      }
      
      this.stats.hits++;
      this.logger.debug(`Cache hit: ${fullKey}`);
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
      
    } catch (error) {
      this.logger.error(`Error getting cache key: ${key}`, error as Error);
      throw error;
    }
  }

  public async delete(key: string, options: CacheOptions = {}): Promise<void> {
    try {
      const prefix = options.prefix || '';
      const fullKey = prefix ? `${prefix}:${key}` : key;
      
      await this.redis.del(fullKey);
      this.logger.debug(`Cache deleted: ${fullKey}`);
      
    } catch (error) {
      this.logger.error(`Error deleting cache key: ${key}`, error as Error);
      throw error;
    }
  }

  public async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const prefix = options.prefix || '';
      const fullKey = prefix ? `${prefix}:${key}` : key;
      
      const result = await this.redis.exists(fullKey);
      return result === 1;
      
    } catch (error) {
      this.logger.error(`Error checking cache key: ${key}`, error as Error);
      throw error;
    }
  }

  public async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<void> {
    try {
      const prefix = options.prefix || '';
      const fullKey = prefix ? `${prefix}:${key}` : key;
      
      await this.redis.expire(fullKey, ttl);
      this.logger.debug(`Cache expire set: ${fullKey} -> ${ttl}s`);
      
    } catch (error) {
      this.logger.error(`Error setting expire for key: ${key}`, error as Error);
      throw error;
    }
  }

  public async ttl(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const prefix = options.prefix || '';
      const fullKey = prefix ? `${prefix}:${key}` : key;
      
      return await this.redis.ttl(fullKey);
      
    } catch (error) {
      this.logger.error(`Error getting TTL for key: ${key}`, error as Error);
      throw error;
    }
  }

  public async clear(pattern: string = '*'): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.info(`Cache cleared: ${keys.length} keys removed`);
      } else {
        this.logger.info('No keys found to clear');
      }
      
    } catch (error) {
      this.logger.error(`Error clearing cache with pattern: ${pattern}`, error as Error);
      throw error;
    }
  }

  public async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.dbsize();
      
      // Parse Redis info
      const lines = info.split('\r\n');
      const stats: any = {};
      
      for (const line of lines) {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      }
      
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys,
        memory: parseInt(stats.used_memory_human || '0', 10),
        uptime: parseInt(stats.uptime_in_seconds || '0', 10)
      };
      
    } catch (error) {
      this.logger.error('Error getting cache stats', error as Error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Cache health check failed', error as Error);
      return false;
    }
  }

  public isCacheConnected(): boolean {
    return this.isConnected;
  }

  public getClient(): Redis {
    return this.redis;
  }

  // Métodos específicos para el sistema de build
  public async cacheBuildProgress(moduleName: string, progress: any): Promise<void> {
    await this.set(`build:progress:${moduleName}`, progress, {
      ttl: 3600, // 1 hora
      prefix: 'build'
    });
  }

  public async getBuildProgress(moduleName: string): Promise<any> {
    return await this.get(`build:progress:${moduleName}`, {
      prefix: 'build'
    });
  }

  public async cacheBuildQueue(queueData: any): Promise<void> {
    await this.set('build:queue', queueData, {
      ttl: 300, // 5 minutos
      prefix: 'build'
    });
  }

  public async getBuildQueue(): Promise<any> {
    return await this.get('build:queue', {
      prefix: 'build'
    });
  }

  public async cacheModuleStats(moduleName: string, stats: any): Promise<void> {
    await this.set(`module:stats:${moduleName}`, stats, {
      ttl: 1800, // 30 minutos
      prefix: 'module'
    });
  }

  public async getModuleStats(moduleName: string): Promise<any> {
    return await this.get(`module:stats:${moduleName}`, {
      prefix: 'module'
    });
  }

  public async invalidateBuildCache(moduleName?: string): Promise<void> {
    if (moduleName) {
      await this.clear(`build:progress:${moduleName}`);
      await this.clear(`module:stats:${moduleName}`);
    } else {
      await this.clear('build:*');
      await this.clear('module:*');
    }
  }
}

// Exportar instancia singleton
export const cacheManager = CacheManager.getInstance(); 