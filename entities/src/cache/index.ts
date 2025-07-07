/**
 * Sistema de Cache del Metaverso
 */

export class CacheSystem {
  private cache: Map<string, any> = new Map();
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) || null;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats(): any {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize
    };
  }
} 