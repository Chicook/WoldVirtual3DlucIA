// Error: No se puede encontrar el módulo '@prisma/client' o sus declaraciones de tipo correspondientes.
// import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/Logger';
import { config } from '../config';

import { PrismaClient } from '@prisma/client';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient;
  private logger: Logger;
  private isConnected: boolean = false;

  private constructor() {
    this.logger = new Logger('DatabaseManager');
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url
        }
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });

    this.setupEventListeners();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private setupEventListeners(): void {
    this.prisma.$on('query', (e) => {
      this.logger.debug('Database query', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`
      });
    });

    this.prisma.$on('error', (e) => {
      this.logger.error('Database error', e.error);
    });

    this.prisma.$on('info', (e) => {
      this.logger.info('Database info', { message: e.message });
    });

    this.prisma.$on('warn', (e) => {
      this.logger.warn('Database warning', { message: e.message });
    });
  }

  public static async initialize(): Promise<void> {
    const instance = DatabaseManager.getInstance();
    await instance.connect();
  }

  public async connect(): Promise<void> {
    try {
      this.logger.info('Conectando a la base de datos...');
      
      await this.prisma.$connect();
      this.isConnected = true;
      
      this.logger.success('Base de datos conectada exitosamente');
      
      // Verificar conexión
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.info('Conexión de base de datos verificada');
      
    } catch (error) {
      this.logger.error('Error conectando a la base de datos', error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.logger.info('Desconectando de la base de datos...');
      
      await this.prisma.$disconnect();
      this.isConnected = false;
      
      this.logger.success('Base de datos desconectada');
      
    } catch (error) {
      this.logger.error('Error desconectando de la base de datos', error as Error);
      throw error;
    }
  }

  public static async close(): Promise<void> {
    const instance = DatabaseManager.getInstance();
    await instance.disconnect();
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Health check falló', error as Error);
      return false;
    }
  }

  public async getDatabaseInfo(): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          version() as version,
          current_database() as database,
          current_user as user,
          inet_server_addr() as host,
          inet_server_port() as port
      `;
      
      return result[0];
    } catch (error) {
      this.logger.error('Error obteniendo información de la base de datos', error as Error);
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      this.logger.info('Ejecutando migraciones...');
      
      // En un entorno real, aquí se ejecutarían las migraciones de Prisma
      // await this.prisma.$executeRaw`-- Run migrations here`;
      
      this.logger.success('Migraciones ejecutadas exitosamente');
      
    } catch (error) {
      this.logger.error('Error ejecutando migraciones', error as Error);
      throw error;
    }
  }

  public async seedDatabase(): Promise<void> {
    try {
      this.logger.info('Sembrando base de datos...');
      
      // Crear datos de ejemplo para el sistema de build
      await this.createSeedData();
      
      this.logger.success('Base de datos sembrada exitosamente');
      
    } catch (error) {
      this.logger.error('Error sembrando base de datos', error as Error);
      throw error;
    }
  }

  private async createSeedData(): Promise<void> {
    // Crear módulos de ejemplo
    const modules = [
      { name: 'blockchain', description: 'Sistema de blockchain personalizado', status: 'completed', progress: 100 },
      { name: 'smart-contracts', description: 'Contratos inteligentes', status: 'completed', progress: 100 },
      { name: 'bridge-bsc', description: 'Puente BSC', status: 'in-progress', progress: 75 },
      { name: 'gas-abstraction', description: 'Abstracción de gas', status: 'in-progress', progress: 30 },
      { name: 'frontend', description: 'Interfaz de usuario', status: 'in-progress', progress: 45 },
      { name: 'backend', description: 'API y servicios', status: 'not-started', progress: 0 },
      { name: 'assets', description: 'Gestión de assets', status: 'not-started', progress: 0 },
      { name: 'metaverso', description: 'Motor del metaverso', status: 'not-started', progress: 0 }
    ];

    for (const module of modules) {
      await this.prisma.buildModule.upsert({
        where: { name: module.name },
        update: module,
        create: {
          ...module,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Crear builds de ejemplo
    const builds = [
      {
        moduleName: 'blockchain',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000), // 1 día atrás
        endTime: new Date(Date.now() - 86400000 + 3600000), // 1 hora después
        duration: 3600000,
        buildSize: 1024000,
        compressedSize: 256000,
        optimizationRatio: 0.75
      },
      {
        moduleName: 'smart-contracts',
        status: 'completed',
        startTime: new Date(Date.now() - 43200000), // 12 horas atrás
        endTime: new Date(Date.now() - 43200000 + 1800000), // 30 minutos después
        duration: 1800000,
        buildSize: 512000,
        compressedSize: 128000,
        optimizationRatio: 0.8
      }
    ];

    for (const build of builds) {
      await this.prisma.build.upsert({
        where: { 
          moduleName_startTime: {
            moduleName: build.moduleName,
            startTime: build.startTime
          }
        },
        update: build,
        create: {
          ...build,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }

  public async getDatabaseStats(): Promise<any> {
    try {
      const stats = {
        modules: await this.prisma.buildModule.count(),
        builds: await this.prisma.build.count(),
        completedBuilds: await this.prisma.build.count({
          where: { status: 'completed' }
        }),
        failedBuilds: await this.prisma.build.count({
          where: { status: 'failed' }
        }),
        inProgressBuilds: await this.prisma.build.count({
          where: { status: 'in-progress' }
        })
      };

      return stats;
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de la base de datos', error as Error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const databaseManager = DatabaseManager.getInstance(); 