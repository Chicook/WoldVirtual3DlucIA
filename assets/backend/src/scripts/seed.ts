/**
 * @fileoverview Script CLI para ejecutar seeders
 * @module backend/src/scripts/seed
 */

import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from '../database/connection';
import { AssetSeeder, runAssetSeeder, runAssetSeederWithCleanup, runAssetExamples } from '../seeders/assetSeeder';
import { Logger } from '../utils/logger';

// Cargar variables de entorno
config();

const logger = new Logger('SeedScript');

interface SeedOptions {
  command: string;
  count?: number;
  clean?: boolean;
  examples?: boolean;
  type?: string;
  status?: string;
}

/**
 * Mostrar ayuda del script
 */
function showHelp(): void {
  console.log(`
🌱 WoldVirtual3D Assets Seeder CLI

Uso: npm run seed [comando] [opciones]

Comandos:
  full              Ejecutar seeder completo con configuración por defecto
  clean             Limpiar todos los assets existentes
  examples          Crear solo assets de ejemplo
  custom            Ejecutar seeder con configuración personalizada

Opciones:
  --count <number>  Número de assets a generar (default: 1000)
  --clean           Limpiar antes de ejecutar
  --type <type>     Tipo específico de asset (MODEL_3D, TEXTURE, ANIMATION, SOUND)
  --status <status> Status específico (PUBLISHED, DRAFT, ARCHIVED)

Ejemplos:
  npm run seed full
  npm run seed full --count 500
  npm run seed full --clean
  npm run seed examples
  npm run seed custom --count 100 --type MODEL_3D
  `);
}

/**
 * Parsear argumentos de línea de comandos
 */
function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = { command: 'help' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case 'full':
      case 'clean':
      case 'examples':
      case 'custom':
        options.command = arg;
        break;
      
      case '--count':
        options.count = parseInt(args[++i]);
        break;
      
      case '--clean':
        options.clean = true;
        break;
      
      case '--examples':
        options.examples = true;
        break;
      
      case '--type':
        options.type = args[++i];
        break;
      
      case '--status':
        options.status = args[++i];
        break;
      
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

/**
 * Validar configuración
 */
function validateConfig(options: SeedOptions): void {
  if (options.count && (options.count < 1 || options.count > 10000)) {
    throw new Error('El número de assets debe estar entre 1 y 10000');
  }
  
  if (options.type && !['MODEL_3D', 'TEXTURE', 'ANIMATION', 'SOUND'].includes(options.type)) {
    throw new Error('Tipo de asset inválido. Opciones: MODEL_3D, TEXTURE, ANIMATION, SOUND');
  }
  
  if (options.status && !['PUBLISHED', 'DRAFT', 'ARCHIVED', 'DELETED'].includes(options.status)) {
    throw new Error('Status inválido. Opciones: PUBLISHED, DRAFT, ARCHIVED, DELETED');
  }
}

/**
 * Crear configuración personalizada
 */
function createCustomConfig(options: SeedOptions) {
  const config: any = {
    totalAssets: options.count || 1000,
    enableRandomization: true,
    batchSize: 100
  };

  // Configurar distribución por tipo si se especifica
  if (options.type) {
    config.distribution = {
      MODEL_3D: 0,
      TEXTURE: 0,
      ANIMATION: 0,
      SOUND: 0
    };
    config.distribution[options.type as any] = 1;
  }

  // Configurar distribución por status si se especifica
  if (options.status) {
    config.statusDistribution = {
      PUBLISHED: 0,
      DRAFT: 0,
      ARCHIVED: 0,
      DELETED: 0
    };
    config.statusDistribution[options.status as any] = 1;
  }

  return config;
}

/**
 * Función principal del script
 */
async function main(): Promise<void> {
  try {
    logger.info('🚀 Iniciando script de seeder...');
    
    const options = parseArgs();
    
    if (options.command === 'help') {
      showHelp();
      return;
    }

    // Validar configuración
    validateConfig(options);

    // Conectar a la base de datos
    logger.info('📊 Conectando a la base de datos...');
    await AppDataSource.initialize();
    logger.info('✅ Base de datos conectada');

    // Ejecutar comando correspondiente
    switch (options.command) {
      case 'full':
        if (options.clean) {
          logger.info('🧹 Ejecutando seeder completo con limpieza...');
          await runAssetSeederWithCleanup({ totalAssets: options.count });
        } else {
          logger.info('🌱 Ejecutando seeder completo...');
          await runAssetSeeder({ totalAssets: options.count });
        }
        break;

      case 'clean':
        logger.info('🧹 Limpiando assets...');
        const seeder = new AssetSeeder();
        await seeder.clear();
        break;

      case 'examples':
        logger.info('🎯 Creando assets de ejemplo...');
        await runAssetExamples();
        break;

      case 'custom':
        logger.info('⚙️ Ejecutando seeder personalizado...');
        const customConfig = createCustomConfig(options);
        if (options.clean) {
          await runAssetSeederWithCleanup(customConfig);
        } else {
          await runAssetSeeder(customConfig);
        }
        break;

      default:
        logger.error(`❌ Comando desconocido: ${options.command}`);
        showHelp();
        process.exit(1);
    }

    logger.info('✅ Script completado exitosamente');

  } catch (error: any) {
    logger.error('❌ Error en script:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión de base de datos
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('🔌 Conexión de base de datos cerrada');
    }
  }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
  main().catch((error) => {
    logger.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export { main as runSeedScript }; 