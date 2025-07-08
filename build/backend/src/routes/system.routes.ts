import { Router } from 'express';
import { databaseManager } from '../database/DatabaseManager';
import { cacheManager } from '../cache/CacheManager';
import { Logger } from '../utils/Logger';
import { config } from '../config';

const router = Router();
const logger = new Logger('SystemRoutes');

// GET /api/v1/system/health - Health check completo del sistema
router.get('/health', async (req, res, next) => {
  try {
    const healthChecks = await Promise.allSettled([
      databaseManager.healthCheck(),
      cacheManager.healthCheck()
    ]);
    
    const [dbHealth, cacheHealth] = healthChecks.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
    
    const overallHealth = dbHealth && cacheHealth;
    
    const health = {
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth ? 'healthy' : 'unhealthy',
          connected: databaseManager.isDatabaseConnected()
        },
        cache: {
          status: cacheHealth ? 'healthy' : 'unhealthy',
          connected: cacheManager.isCacheConnected()
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: config.server.environment
    };
    
    res.status(overallHealth ? 200 : 503).json({
      success: overallHealth,
      data: health
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/info - Información del sistema
router.get('/info', async (req, res, next) => {
  try {
    const systemInfo = {
      name: 'WoldVirtual Build Backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.environment,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid,
      config: {
        server: {
          port: config.server.port,
          host: config.server.host
        },
        database: {
          type: config.database.type,
          host: config.database.host,
          port: config.database.port,
          database: config.database.database
        },
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          db: config.redis.db
        },
        build: {
          maxConcurrency: config.build.maxConcurrency,
          maxQueueSize: config.build.maxQueueSize
        }
      }
    };
    
    res.json({
      success: true,
      data: systemInfo
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/stats - Estadísticas del sistema
router.get('/stats', async (req, res, next) => {
  try {
    const [dbStats, cacheStats] = await Promise.all([
      databaseManager.getDatabaseStats(),
      cacheManager.getStats()
    ]);
    
    const systemStats = {
      database: dbStats,
      cache: cacheStats,
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: systemStats
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/database - Información de la base de datos
router.get('/database', async (req, res, next) => {
  try {
    const [dbInfo, dbStats] = await Promise.all([
      databaseManager.getDatabaseInfo(),
      databaseManager.getDatabaseStats()
    ]);
    
    const databaseInfo = {
      info: dbInfo,
      stats: dbStats,
      connection: {
        connected: databaseManager.isDatabaseConnected(),
        health: await databaseManager.healthCheck()
      }
    };
    
    res.json({
      success: true,
      data: databaseInfo
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/cache - Información del cache
router.get('/cache', async (req, res, next) => {
  try {
    const cacheInfo = {
      stats: await cacheManager.getStats(),
      connection: {
        connected: cacheManager.isCacheConnected(),
        health: await cacheManager.healthCheck()
      },
      config: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix
      }
    };
    
    res.json({
      success: true,
      data: cacheInfo
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/system/cache/clear - Limpiar cache
router.post('/cache/clear', async (req, res, next) => {
  try {
    const { pattern = '*' } = req.body;
    
    logger.info(`Limpiando cache con patrón: ${pattern}`);
    
    await cacheManager.clear(pattern);
    
    res.json({
      success: true,
      message: 'Cache limpiado exitosamente',
      data: {
        pattern,
        clearedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/logs - Obtener logs del sistema
router.get('/logs', async (req, res, next) => {
  try {
    const { level, service, limit = 100, offset = 0 } = req.query;
    
    // En un entorno real, aquí se leerían los logs desde archivos
    // Por ahora retornamos logs simulados
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        service: 'SystemRoutes',
        message: 'Sistema iniciado correctamente'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        service: 'DatabaseManager',
        message: 'Base de datos conectada'
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'info',
        service: 'CacheManager',
        message: 'Cache inicializado'
      }
    ];
    
    // Filtrar por nivel si se especifica
    const filteredLogs = level ? 
      logs.filter(log => log.level === level) : logs;
    
    // Filtrar por servicio si se especifica
    const serviceFilteredLogs = service ?
      filteredLogs.filter(log => log.service === service) : filteredLogs;
    
    // Aplicar paginación
    const paginatedLogs = serviceFilteredLogs.slice(
      Number(offset),
      Number(offset) + Number(limit)
    );
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page: Math.floor(Number(offset) / Number(limit)) + 1,
          limit: Number(limit),
          total: serviceFilteredLogs.length,
          pages: Math.ceil(serviceFilteredLogs.length / Number(limit))
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/system/restart - Reiniciar servicios (solo en desarrollo)
router.post('/restart', async (req, res, next) => {
  try {
    if (config.server.isProduction) {
      return res.status(403).json({
        success: false,
        error: 'Reinicio no permitido en producción'
      });
    }
    
    logger.info('Reiniciando servicios del sistema');
    
    // Reiniciar conexiones
    await databaseManager.disconnect();
    await cacheManager.disconnect();
    
    await databaseManager.connect();
    await cacheManager.connect();
    
    res.json({
      success: true,
      message: 'Servicios reiniciados exitosamente',
      data: {
        restartedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/config - Obtener configuración del sistema
router.get('/config', async (req, res, next) => {
  try {
    // Solo mostrar configuración no sensible
    const safeConfig = {
      server: {
        port: config.server.port,
        host: config.server.host,
        environment: config.server.environment
      },
      database: {
        type: config.database.type,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
      },
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db
      },
      build: {
        maxConcurrency: config.build.maxConcurrency,
        maxQueueSize: config.build.maxQueueSize,
        retryAttempts: config.build.retryAttempts,
        timeout: config.build.timeout
      },
      logging: {
        level: config.logging.level,
        format: config.logging.format
      },
      cache: {
        ttl: config.cache.ttl,
        maxSize: config.cache.maxSize
      }
    };
    
    res.json({
      success: true,
      data: safeConfig
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/version - Obtener información de versiones
router.get('/version', async (req, res, next) => {
  try {
    const versionInfo = {
      application: {
        name: 'WoldVirtual Build Backend',
        version: process.env.npm_package_version || '1.0.0',
        description: 'Sistema de build para WoldVirtual 3D'
      },
      runtime: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      dependencies: {
        // En un entorno real, aquí se leerían las versiones de package.json
        express: '^4.18.0',
        prisma: '^5.0.0',
        redis: '^4.6.0',
        winston: '^3.10.0'
      },
      build: {
        timestamp: process.env.BUILD_TIMESTAMP || new Date().toISOString(),
        commit: process.env.GIT_COMMIT || 'unknown',
        branch: process.env.GIT_BRANCH || 'unknown'
      }
    };
    
    res.json({
      success: true,
      data: versionInfo
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/metrics - Métricas del sistema (formato Prometheus)
router.get('/metrics', async (req, res, next) => {
  try {
    const [dbStats, cacheStats] = await Promise.all([
      databaseManager.getDatabaseStats(),
      cacheManager.getStats()
    ]);
    
    const metrics = [
      '# HELP woldvirtual_build_uptime_seconds Uptime del sistema en segundos',
      `# TYPE woldvirtual_build_uptime_seconds gauge`,
      `woldvirtual_build_uptime_seconds ${process.uptime()}`,
      '',
      '# HELP woldvirtual_build_memory_bytes Uso de memoria en bytes',
      '# TYPE woldvirtual_build_memory_bytes gauge',
      `woldvirtual_build_memory_bytes{type="rss"} ${process.memoryUsage().rss}`,
      `woldvirtual_build_memory_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
      `woldvirtual_build_memory_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
      `woldvirtual_build_memory_bytes{type="external"} ${process.memoryUsage().external}`,
      '',
      '# HELP woldvirtual_build_database_connections Conexiones de base de datos',
      '# TYPE woldvirtual_build_database_connections gauge',
      `woldvirtual_build_database_connections ${dbStats.modules + dbStats.builds}`,
      '',
      '# HELP woldvirtual_build_cache_keys Número de claves en cache',
      '# TYPE woldvirtual_build_cache_keys gauge',
      `woldvirtual_build_cache_keys ${cacheStats.keys}`,
      '',
      '# HELP woldvirtual_build_cache_hits Cache hits',
      '# TYPE woldvirtual_build_cache_hits counter',
      `woldvirtual_build_cache_hits ${cacheStats.hits}`,
      '',
      '# HELP woldvirtual_build_cache_misses Cache misses',
      '# TYPE woldvirtual_build_cache_misses counter',
      `woldvirtual_build_cache_misses ${cacheStats.misses}`
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics);
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/system/maintenance - Activar modo mantenimiento
router.post('/maintenance', async (req, res, next) => {
  try {
    const { enabled, message } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled debe ser un booleano'
      });
    }
    
    // En un entorno real, aquí se activaría/desactivaría el modo mantenimiento
    // Por ahora solo retornamos un mensaje
    
    logger.info(`Modo mantenimiento ${enabled ? 'activado' : 'desactivado'}`);
    
    res.json({
      success: true,
      message: `Modo mantenimiento ${enabled ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        maintenance: enabled,
        message: message || 'Sistema en mantenimiento',
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

export { router as systemRoutes }; 