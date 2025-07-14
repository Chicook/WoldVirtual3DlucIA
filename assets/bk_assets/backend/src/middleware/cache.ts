/**
 * @fileoverview Middleware de caché en memoria
 * @module backend/src/middleware/cache
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('CacheMiddleware');

// Caché en memoria simple
interface CacheEntry {
  data: any;
  expires: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttl: number): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const memoryCache = new MemoryCache();

export interface CacheOptions {
  ttl?: number; // tiempo de vida en segundos
  key?: string; // clave personalizada
  condition?: (req: Request) => boolean; // condición para aplicar caché
}

/**
 * Middleware de caché genérico
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key, condition } = options; // 5 minutos por defecto

  return async (req: Request, res: Response, next: NextFunction) => {
    // Verificar condición personalizada
    if (condition && !condition(req)) {
      return next();
    }

    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generar clave de caché
      const cacheKey = key || `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      // Intentar obtener del caché
      const cachedData = memoryCache.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Interceptar la respuesta para guardar en caché
      const originalSend = res.json;
      res.json = function(data: any) {
        // Guardar en caché solo si la respuesta es exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
          memoryCache.set(cacheKey, data, ttl);
        }
        
        return originalSend.call(this, data);
      };

      next();
    } catch (error: any) {
      logger.error('Error en middleware de caché:', error);
      next(); // Continuar sin caché en caso de error
    }
  };
};

/**
 * Middleware específico para assets con TTL variable
 */
export const assetCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TTL más largo para assets populares
  const ttl = req.query.popular ? 1800 : 600; // 30 min para populares, 10 min para otros
  
  return cacheMiddleware({ ttl })(req, res, next);
};

/**
 * Middleware para estadísticas con TTL largo
 */
export const statsCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  return cacheMiddleware({ ttl: 3600 })(req, res, next); // 1 hora
};

/**
 * Limpiar caché específico
 */
export const clearCache = async (pattern: string): Promise<void> => {
  try {
    memoryCache.delete(pattern);
    logger.info(`Cache limpiado: patrón ${pattern}`);
  } catch (error: any) {
    logger.error('Error limpiando caché:', error);
  }
};

/**
 * Limpiar caché de assets
 */
export const clearAssetCache = async (): Promise<void> => {
  await clearCache('/api/assets');
};

/**
 * Limpiar caché de estadísticas
 */
export const clearStatsCache = async (): Promise<void> => {
  await clearCache('/api/stats');
};

/**
 * Obtener estadísticas del caché
 */
export const getCacheStats = async (): Promise<any> => {
  try {
    return {
      keys: memoryCache.size(),
      type: 'memory',
      info: {
        description: 'Caché en memoria simple'
      }
    };
  } catch (error: any) {
    logger.error('Error obteniendo estadísticas de caché:', error);
    return { error: 'No disponible' };
  }
};

/**
 * Middleware para invalidar caché en operaciones de escritura
 */
export const invalidateCache = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // Invalidar caché solo si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          patterns.forEach(pattern => memoryCache.delete(pattern));
        } catch (error: any) {
          logger.error('Error invalidando caché:', error);
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

export { memoryCache as redis }; 