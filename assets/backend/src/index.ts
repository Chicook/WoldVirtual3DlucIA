/**
 * @fileoverview Punto de entrada principal del servidor backend del metaverso
 * @module backend/src/index
 */

import 'reflect-metadata';
import { config } from 'dotenv';
import { createServer } from './app';
import { connectDatabase } from './utils/database/connection';
import { connectRedis } from './utils/database/redis';
import { initializeBlockchain } from './utils/blockchain/web3.utils';
import { setupMonitoring } from './monitoring';
import { Logger } from './monitoring/logger';

// Cargar variables de entorno
config();

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Logger principal
const logger = new Logger('Server');

/**
 * Función principal de inicialización del servidor
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Iniciando servidor del metaverso...', {
      environment: NODE_ENV,
      port: PORT,
      timestamp: new Date().toISOString()
    });

    // 1. Conectar base de datos
    logger.info('📊 Conectando a base de datos...');
    await connectDatabase();
    logger.success('✅ Base de datos conectada');

    // 2. Conectar Redis
    logger.info('🔴 Conectando a Redis...');
    await connectRedis();
    logger.success('✅ Redis conectado');

    // 3. Inicializar blockchain
    logger.info('⛓️ Inicializando blockchain...');
    await initializeBlockchain();
    logger.success('✅ Blockchain inicializada');

    // 4. Configurar monitoreo
    logger.info('📈 Configurando monitoreo...');
    await setupMonitoring();
    logger.success('✅ Monitoreo configurado');

    // 5. Crear y configurar servidor
    logger.info('🌐 Configurando servidor...');
    const app = await createServer();
    
    // 6. Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.success(`✅ Servidor iniciado en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${NODE_ENV}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API docs: http://localhost:${PORT}/docs`);
      logger.info(`🔍 Swagger: http://localhost:${PORT}/swagger`);
    });

    // 7. Configurar graceful shutdown
    setupGracefulShutdown(server);

    // 8. Log de métricas iniciales
    logInitialMetrics();

  } catch (error) {
    logger.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

/**
 * Configura graceful shutdown del servidor
 */
function setupGracefulShutdown(server: any): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`🛑 Recibida señal ${signal}, iniciando shutdown graceful...`);
    
    try {
      // Cerrar servidor HTTP
      server.close(() => {
        logger.info('✅ Servidor HTTP cerrado');
      });

      // Cerrar conexiones de base de datos
      await closeDatabaseConnections();
      
      // Cerrar conexiones de Redis
      await closeRedisConnections();
      
      // Cerrar conexiones de blockchain
      await closeBlockchainConnections();
      
      logger.success('✅ Shutdown graceful completado');
      process.exit(0);
      
    } catch (error) {
      logger.error('❌ Error durante shutdown graceful:', error);
      process.exit(1);
    }
  };

  // Escuchar señales de terminación
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Para nodemon
}

/**
 * Cierra conexiones de base de datos
 */
async function closeDatabaseConnections(): Promise<void> {
  try {
    const { getConnection } = await import('typeorm');
    const connection = getConnection();
    
    if (connection.isConnected) {
      await connection.close();
      logger.info('✅ Conexión de base de datos cerrada');
    }
  } catch (error) {
    logger.warn('⚠️ Error cerrando conexión de base de datos:', error);
  }
}

/**
 * Cierra conexiones de Redis
 */
async function closeRedisConnections(): Promise<void> {
  try {
    const { redisClient } = await import('./utils/database/redis');
    
    if (redisClient) {
      await redisClient.quit();
      logger.info('✅ Conexión de Redis cerrada');
    }
  } catch (error) {
    logger.warn('⚠️ Error cerrando conexión de Redis:', error);
  }
}

/**
 * Cierra conexiones de blockchain
 */
async function closeBlockchainConnections(): Promise<void> {
  try {
    const { closeWeb3Connections } = await import('./utils/blockchain/web3.utils');
    await closeWeb3Connections();
    logger.info('✅ Conexiones de blockchain cerradas');
  } catch (error) {
    logger.warn('⚠️ Error cerrando conexiones de blockchain:', error);
  }
}

/**
 * Registra métricas iniciales
 */
function logInitialMetrics(): void {
  const startTime = process.hrtime.bigint();
  const memoryUsage = process.memoryUsage();
  
  logger.metrics('Memory Usage', memoryUsage.heapUsed / 1024 / 1024, 'MB', {
    type: 'initial',
    heapTotal: memoryUsage.heapTotal / 1024 / 1024,
    external: memoryUsage.external / 1024 / 1024,
    rss: memoryUsage.rss / 1024 / 1024
  });

  logger.metrics('Uptime', process.uptime(), 'seconds', {
    type: 'initial',
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform
  });

  // Log de configuración del entorno
  logger.info('🔧 Configuración del entorno:', {
    nodeEnv: NODE_ENV,
    port: PORT,
    database: process.env.DB_HOST,
    redis: process.env.REDIS_HOST,
    blockchain: {
      ethereum: process.env.ETH_RPC_URL ? 'Configurado' : 'No configurado',
      polygon: process.env.POLYGON_RPC_URL ? 'Configurado' : 'No configurado'
    },
    features: {
      cors: process.env.ENABLE_CORS === 'true',
      rateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
      compression: process.env.ENABLE_COMPRESSION === 'true'
    }
  });
}

/**
 * Maneja errores no capturados
 */
function setupUnhandledErrorHandling(): void {
  // Errores no capturados
  process.on('uncaughtException', (error) => {
    logger.error('❌ Error no capturado:', error);
    process.exit(1);
  });

  // Promesas rechazadas no manejadas
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Promesa rechazada no manejada:', {
      reason,
      promise: promise.toString()
    });
    process.exit(1);
  });

  // Advertencias
  process.on('warning', (warning) => {
    logger.warn('⚠️ Advertencia del sistema:', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    });
  });
}

/**
 * Configuración de desarrollo
 */
function setupDevelopment(): void {
  if (NODE_ENV === 'development') {
    logger.info('🔧 Configurando entorno de desarrollo...');
    
    // Habilitar source maps
    require('source-map-support').install();
    
    // Configurar hot reload si está disponible
    if (process.env.HOT_RELOAD === 'true') {
      logger.info('🔥 Hot reload habilitado');
    }
    
    // Configurar debugging
    if (process.env.DEBUG === 'true') {
      logger.info('🐛 Modo debug habilitado');
    }
  }
}

/**
 * Verifica dependencias críticas
 */
async function checkDependencies(): Promise<void> {
  logger.info('🔍 Verificando dependencias críticas...');
  
  const checks = [
    { name: 'Database', check: checkDatabaseConnection },
    { name: 'Redis', check: checkRedisConnection },
    { name: 'Blockchain', check: checkBlockchainConnection }
  ];

  for (const { name, check } of checks) {
    try {
      await check();
      logger.success(`✅ ${name} verificado`);
    } catch (error) {
      logger.error(`❌ Error verificando ${name}:`, error);
      throw error;
    }
  }
}

/**
 * Verifica conexión de base de datos
 */
async function checkDatabaseConnection(): Promise<void> {
  const { getConnection } = await import('typeorm');
  const connection = getConnection();
  
  if (!connection.isConnected) {
    throw new Error('Base de datos no conectada');
  }
  
  // Ejecutar query simple para verificar
  await connection.query('SELECT 1');
}

/**
 * Verifica conexión de Redis
 */
async function checkRedisConnection(): Promise<void> {
  const { redisClient } = await import('./utils/database/redis');
  
  if (!redisClient) {
    throw new Error('Cliente Redis no inicializado');
  }
  
  // Ejecutar ping para verificar
  const pong = await redisClient.ping();
  if (pong !== 'PONG') {
    throw new Error('Redis no responde correctamente');
  }
}

/**
 * Verifica conexión de blockchain
 */
async function checkBlockchainConnection(): Promise<void> {
  const { checkWeb3Connections } = await import('./utils/blockchain/web3.utils');
  await checkWeb3Connections();
}

// Inicialización del servidor
if (require.main === module) {
  // Configurar manejo de errores no capturados
  setupUnhandledErrorHandling();
  
  // Configurar entorno de desarrollo
  setupDevelopment();
  
  // Verificar dependencias y iniciar servidor
  checkDependencies()
    .then(() => bootstrap())
    .catch((error) => {
      logger.error('❌ Error crítico durante inicialización:', error);
      process.exit(1);
    });
}

// Exportaciones para testing
export {
  bootstrap,
  setupGracefulShutdown,
  checkDependencies,
  logInitialMetrics
}; 