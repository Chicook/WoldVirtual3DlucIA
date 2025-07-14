/**
 * @fileoverview Configuración de conexión a base de datos PostgreSQL
 * @module backend/src/database/connection
 */

import { DataSource } from 'typeorm';
import { Logger } from '../utils/logger';

const logger = new Logger('Database');

/**
 * Configuración de la base de datos
 */
const dbConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'metaverso_dev',
  password: process.env.DB_PASSWORD || 'metaverso_dev_password',
  database: process.env.DB_NAME || 'metaverso_assets_dev',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscribers/**/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

/**
 * DataSource de TypeORM
 */
export const AppDataSource = new DataSource(dbConfig);

/**
 * Conectar a la base de datos
 */
export async function connectDatabase(): Promise<void> {
  try {
    logger.info('📊 Conectando a base de datos PostgreSQL...', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      synchronize: dbConfig.synchronize
    });

    await AppDataSource.initialize();
    
    logger.success('✅ Base de datos conectada exitosamente');
    
    // Log de información de conexión
    const connection = AppDataSource;
    logger.info('🔧 Información de conexión:', {
      isConnected: connection.isInitialized,
      driver: 'postgres',
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    });

  } catch (error) {
    logger.error('❌ Error conectando a base de datos:', error);
    throw error;
  }
}

/**
 * Desconectar de la base de datos
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.success('✅ Conexión de base de datos cerrada');
    }
  } catch (error) {
    logger.error('❌ Error cerrando conexión de base de datos:', error);
    throw error;
  }
}

/**
 * Verificar estado de la conexión
 */
export function isDatabaseConnected(): boolean {
  return AppDataSource.isInitialized;
}

/**
 * Obtener el DataSource
 */
export function getDataSource(): DataSource {
  return AppDataSource;
} 