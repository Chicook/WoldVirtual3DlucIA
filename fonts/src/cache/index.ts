/**
 * @fileoverview Sistema de cache para fuentes del metaverso
 * @module @metaverso/fonts/cache
 */

import { EventEmitter } from 'events';
import {
  CacheConfig,
  FontCacheEntry,
  FontCacheStats
} from '../types';

/**
 * Sistema de cache inteligente para fuentes
 */
export class FontCache extends EventEmitter {
  private cache: Map<string, FontCacheEntry> = new Map();
  private config: CacheConfig;
  private stats: FontCacheStats;
  private initialized: boolean = false;

  constructor(config: CacheConfig) {
    super();
    this.config = config;
    this.stats = this.initializeStats();
  }

  /**
   * Inicializa el sistema de cache
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Cargar cache persistente si está habilitado
      if (this.config.persistence) {
        await this.loadPersistentCache();
      }

      // Iniciar limpieza automática
      this.startCleanupInterval();

      this.initialized = true;
      this.emit('initialized', { timestamp: Date.now() });
    } catch (error) {
      this.emit('error', { error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Almacena un elemento en el cache
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const entry: FontCacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      size: this.calculateSize(data),
      metadata: {
        created: Date.now(),
        accessCount: 0,
        lastAccess: Date.now()
      }
    };

    // Verificar límite de tamaño
    if (this.cache.size >= this.config.maxSize) {
      await this.evictEntry();
    }

    this.cache.set(key, entry);
    this.updateStats('set');
    this.emit('set', { key, timestamp: Date.now() });
  }

  /**
   * Obtiene un elemento del cache
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateStats('miss');
      this.emit('miss', { key, timestamp: Date.now() });
      return null;
    }

    // Verificar si ha expirado
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.updateStats('miss');
      this.emit('expired', { key, timestamp: Date.now() });
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.metadata.accessCount++;
    entry.metadata.lastAccess = Date.now();

    this.updateStats('hit');
    this.emit('hit', { key, timestamp: Date.now() });
    
    return entry.data;
  }

  /**
   * Verifica si una clave existe en el cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Elimina un elemento del cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.emit('delete', { key, timestamp: Date.now() });
    }
    return deleted;
  }

  /**
   * Limpia todo el cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = this.initializeStats();
    this.emit('clear', { timestamp: Date.now() });
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): FontCacheStats {
    return { ...this.stats };
  }

  /**
   * Obtiene información detallada del cache
   */
  getInfo(): {
    size: number;
    entries: number;
    memoryUsage: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    if (this.cache.size === 0) {
      return {
        size: 0,
        entries: 0,
        memoryUsage: 0,
        oldestEntry: 0,
        newestEntry: 0
      };
    }

    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    const sizes = entries.map(e => e.size);

    return {
      size: this.cache.size,
      entries: this.cache.size,
      memoryUsage: sizes.reduce((sum, size) => sum + size, 0),
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }

  /**
   * Destruye el sistema de cache
   */
  async destroy(): Promise<void> {
    this.initialized = false;
    
    // Guardar cache persistente si está habilitado
    if (this.config.persistence) {
      await this.savePersistentCache();
    }

    this.cache.clear();
    this.removeAllListeners();
  }

  // Métodos privados

  private initializeStats(): FontCacheStats {
    return {
      hits: 0,
      misses: 0,
      size: 0,
      entries: 0,
      hitRate: 0
    };
  }

  private updateStats(type: 'hit' | 'miss' | 'set'): void {
    if (type === 'hit') {
      this.stats.hits++;
    } else if (type === 'miss') {
      this.stats.misses++;
    }

    this.stats.entries = this.cache.size;
    this.stats.size = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private isExpired(entry: FontCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private calculateSize(data: any): number {
    // Estimación simple del tamaño en bytes
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    if (typeof data === 'object') {
      return JSON.stringify(data).length * 2;
    }
    return 8; // Tamaño estimado para otros tipos
  }

  private async evictEntry(): Promise<void> {
    let entryToEvict: string | null = null;

    switch (this.config.strategy) {
      case 'lru':
        entryToEvict = this.findLRUEntry();
        break;
      case 'lfu':
        entryToEvict = this.findLFUEntry();
        break;
      case 'fifo':
        entryToEvict = this.findFIFOEntry();
        break;
    }

    if (entryToEvict) {
      this.cache.delete(entryToEvict);
      this.emit('evict', { key: entryToEvict, timestamp: Date.now() });
    }
  }

  private findLRUEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.lastAccess < oldestTime) {
        oldestTime = entry.metadata.lastAccess;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFUEntry(): string | null {
    let leastFrequentKey: string | null = null;
    let leastFrequent = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.accessCount < leastFrequent) {
        leastFrequent = entry.metadata.accessCount;
        leastFrequentKey = key;
      }
    }

    return leastFrequentKey;
  }

  private findFIFOEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private startCleanupInterval(): void {
    if (this.config.ttl > 0) {
      setInterval(() => {
        this.cleanup();
      }, this.config.ttl * 1000);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.emit('expired', { key, timestamp: now });
    }

    if (expiredKeys.length > 0) {
      this.emit('cleanup', { 
        expiredCount: expiredKeys.length, 
        timestamp: now 
      });
    }
  }

  private async loadPersistentCache(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('metaverso-font-cache');
        if (cached) {
          const data = JSON.parse(cached);
          for (const [key, entry] of Object.entries(data)) {
            if (!this.isExpired(entry as FontCacheEntry)) {
              this.cache.set(key, entry as FontCacheEntry);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error);
    }
  }

  private async savePersistentCache(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data: Record<string, FontCacheEntry> = {};
        for (const [key, entry] of this.cache.entries()) {
          data[key] = entry;
        }
        localStorage.setItem('metaverso-font-cache', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to save persistent cache:', error);
    }
  }
} 