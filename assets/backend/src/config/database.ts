/**
 * @fileoverview Configuración de base de datos para el backend del metaverso
 * @module backend/src/config/database
 */

import mongoose from 'mongoose';

/**
 * Interfaz para configuración de base de datos
 */
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferMaxEntries: number;
    bufferCommands: boolean;
    autoIndex: boolean;
    autoCreate: boolean;
  };
}

/**
 * Configuración por defecto
 */
const defaultConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/metaverso',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    autoIndex: true,
    autoCreate: true
  }
};

/**
 * Clase para manejo de conexión a base de datos
 */
export class DatabaseService {
  private config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Conectar a la base de datos
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        console.log('✅ Ya conectado a la base de datos');
        return;
      }

      console.log('🔄 Conectando a la base de datos...');

      // Configurar eventos de conexión
      mongoose.connection.on('connected', () => {
        console.log('✅ Conectado a MongoDB');
        this.isConnected = true;
      });

      mongoose.connection.on('error', (error) => {
        console.error('❌ Error de conexión a MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Desconectado de MongoDB');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 Reconectado a MongoDB');
        this.isConnected = true;
      });

      // Conectar a MongoDB
      await mongoose.connect(this.config.uri, this.config.options);

      // Configurar índices
      await this.setupIndexes();

    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  /**
   * Desconectar de la base de datos
   */
  async disconnect(): Promise<void> {
    try {
      if (!this.isConnected) {
        console.log('✅ Ya desconectado de la base de datos');
        return;
      }

      console.log('🔄 Desconectando de la base de datos...');
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Desconectado de la base de datos');

    } catch (error) {
      console.error('❌ Error desconectando de la base de datos:', error);
      throw error;
    }
  }

  /**
   * Configurar índices de la base de datos
   */
  private async setupIndexes(): Promise<void> {
    try {
      console.log('🔧 Configurando índices de la base de datos...');

      // Importar modelos
      const User = require('../models/user').default;
      const Asset = require('../models/asset').default;

      // Índices para User
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ username: 1 }, { unique: true });
      await User.collection.createIndex({ wallet: 1 }, { sparse: true });
      await User.collection.createIndex({ role: 1 });
      await User.collection.createIndex({ 'verification.emailVerified': 1 });
      await User.collection.createIndex({ 'verification.walletVerified': 1 });
      await User.collection.createIndex({ isActive: 1 });
      await User.collection.createIndex({ createdAt: -1 });

      // Índices para Asset
      await Asset.collection.createIndex({ name: 'text', description: 'text', tags: 'text' });
      await Asset.collection.createIndex({ type: 1 });
      await Asset.collection.createIndex({ category: 1 });
      await Asset.collection.createIndex({ status: 1 });
      await Asset.collection.createIndex({ creator: 1 });
      await Asset.collection.createIndex({ owner: 1 });
      await Asset.collection.createIndex({ 'file.hash': 1 });
      await Asset.collection.createIndex({ tags: 1 });
      await Asset.collection.createIndex({ 'moderation.isApproved': 1 });
      await Asset.collection.createIndex({ 'privacy.isPublic': 1 });
      await Asset.collection.createIndex({ createdAt: -1 });
      await Asset.collection.createIndex({ 'stats.views': -1 });
      await Asset.collection.createIndex({ 'stats.downloads': -1 });
      await Asset.collection.createIndex({ 'stats.rating': -1 });

      console.log('✅ Índices configurados correctamente');

    } catch (error) {
      console.error('❌ Error configurando índices:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de la conexión
   */
  getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    host: string;
    name: string;
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    };
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getDatabaseStats(): Promise<any> {
    try {
      const stats = await mongoose.connection.db.stats();
      
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        fileSize: stats.fileSize
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de la base de datos:', error);
      throw error;
    }
  }

  /**
   * Limpiar base de datos (solo para desarrollo)
   */
  async clearDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se puede limpiar la base de datos en producción');
    }

    try {
      console.log('🧹 Limpiando base de datos...');
      
      const collections = await mongoose.connection.db.collections();
      
      for (const collection of collections) {
        await collection.deleteMany({});
      }
      
      console.log('✅ Base de datos limpiada');
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  /**
   * Crear backup de la base de datos
   */
  async createBackup(): Promise<string> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `./backups/metaverso-backup-${timestamp}`;
      
      const command = `mongodump --uri="${this.config.uri}" --out="${backupPath}"`;
      
      await execAsync(command);
      
      console.log(`✅ Backup creado en: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Restaurar backup de la base de datos
   */
  async restoreBackup(backupPath: string): Promise<void> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const command = `mongorestore --uri="${this.config.uri}" --drop "${backupPath}"`;
      
      await execAsync(command);
      
      console.log('✅ Backup restaurado correctamente');
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      throw error;
    }
  }

  /**
   * Verificar integridad de la base de datos
   */
  async verifyIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    try {
      // Verificar conexión
      if (!this.isConnected) {
        issues.push('No hay conexión activa a la base de datos');
      }

      // Verificar colecciones principales
      const collections = ['users', 'assets'];
      for (const collectionName of collections) {
        try {
          await mongoose.connection.db.collection(collectionName).stats();
        } catch (error) {
          issues.push(`Colección '${collectionName}' no encontrada`);
        }
      }

      // Verificar índices críticos
      try {
        const userIndexes = await mongoose.connection.db.collection('users').indexes();
        const assetIndexes = await mongoose.connection.db.collection('assets').indexes();
        
        if (userIndexes.length < 5) {
          issues.push('Índices de usuarios incompletos');
        }
        
        if (assetIndexes.length < 10) {
          issues.push('Índices de assets incompletos');
        }
      } catch (error) {
        issues.push('Error verificando índices');
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Error general: ${error.message}`);
      return {
        isValid: false,
        issues
      };
    }
  }
}

// Instancia del servicio
export const databaseService = new DatabaseService();

export default databaseService; 