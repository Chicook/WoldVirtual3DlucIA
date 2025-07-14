#!/usr/bin/env node

/**
 * @fileoverview CLI para el sistema de assets del metaverso
 * @module assets/src/cli
 */

import { Command } from 'commander';
import { AssetsSystem } from './index';
import { Logger } from './utils/logger';
import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';

const program = new Command();
const logger = new Logger('CLI');
const assetsSystem = new AssetsSystem();

// Configurar programa principal
program
  .name('metaverso-assets')
  .description('Sistema de gestión de assets del Metaverso Web3')
  .version('1.0.0');

// Comando de inicialización
program
  .command('init')
  .description('Inicializar el sistema de assets')
  .action(async () => {
    try {
      logger.info('🚀 Inicializando sistema de assets...');
      await assetsSystem.initialize();
      logger.success('✅ Sistema inicializado correctamente');
    } catch (error) {
      logger.error('❌ Error inicializando sistema:', error);
      process.exit(1);
    }
  });

// Comando de procesamiento
program
  .command('process <file>')
  .description('Procesar un asset individual')
  .option('-o, --optimization <options>', 'Opciones de optimización (JSON)')
  .option('-c, --compression <options>', 'Opciones de compresión (JSON)')
  .option('-u, --upload <options>', 'Opciones de upload (JSON)')
  .action(async (file, options) => {
    try {
      await assetsSystem.initialize();
      
      const processOptions = {
        optimization: options.optimization ? JSON.parse(options.optimization) : undefined,
        compression: options.compression ? JSON.parse(options.compression) : undefined,
        upload: options.upload ? JSON.parse(options.upload) : undefined
      };

      logger.info(`🔄 Procesando asset: ${file}`);
      const result = await assetsSystem.processAsset(file, processOptions);
      
      if (result.success) {
        logger.success(`✅ Asset procesado exitosamente`);
        console.log('Resultado:', JSON.stringify(result, null, 2));
      } else {
        logger.error(`❌ Error procesando asset: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      logger.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Comando de procesamiento en lote
program
  .command('process-batch <directory>')
  .description('Procesar múltiples assets en un directorio')
  .option('-p, --pattern <pattern>', 'Patrón de archivos (glob)')
  .option('-b, --batch-size <size>', 'Tamaño del lote', '5')
  .option('-o, --optimization <options>', 'Opciones de optimización (JSON)')
  .option('-c, --compression <options>', 'Opciones de compresión (JSON)')
  .option('-u, --upload <options>', 'Opciones de upload (JSON)')
  .action(async (directory, options) => {
    try {
      await assetsSystem.initialize();
      
      // Encontrar archivos
      const glob = require('glob');
      const pattern = options.pattern || '**/*';
      const files = glob.sync(pattern, { cwd: directory, absolute: true });
      
      if (files.length === 0) {
        logger.warn('No se encontraron archivos para procesar');
        return;
      }

      const processOptions = {
        batchSize: parseInt(options.batchSize),
        optimization: options.optimization ? JSON.parse(options.optimization) : undefined,
        compression: options.compression ? JSON.parse(options.compression) : undefined,
        upload: options.upload ? JSON.parse(options.upload) : undefined
      };

      logger.info(`🔄 Procesando ${files.length} assets...`);
      const results = await assetsSystem.processAssets(files, processOptions);
      
      const successCount = results.filter(r => r.success).length;
      logger.success(`✅ Procesamiento completado: ${successCount}/${files.length} exitosos`);
      
      // Mostrar resumen
      console.log('\n📊 Resumen:');
      console.log(`- Total: ${results.length}`);
      console.log(`- Exitosos: ${successCount}`);
      console.log(`- Fallidos: ${results.length - successCount}`);
      
      if (successCount > 0) {
        const totalReduction = results
          .filter(r => r.success && r.stats)
          .reduce((sum, r) => sum + r.stats!.reduction, 0);
        const avgReduction = totalReduction / successCount;
        console.log(`- Reducción promedio: ${avgReduction.toFixed(1)}%`);
      }
      
    } catch (error) {
      logger.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Comando de búsqueda
program
  .command('search')
  .description('Buscar assets en el catálogo')
  .option('-t, --type <type>', 'Tipo de asset')
  .option('-c, --category <category>', 'Categoría')
  .option('-s, --size <range>', 'Rango de tamaño (ej: 1MB-10MB)')
  .option('-d, --date <range>', 'Rango de fechas (ej: 2024-01-01,2024-12-31)')
  .option('-l, --limit <limit>', 'Límite de resultados', '20')
  .action(async (options) => {
    try {
      await assetsSystem.initialize();
      
      const criteria: any = {};
      
      if (options.type) criteria.type = options.type;
      if (options.category) criteria.category = options.category;
      if (options.limit) criteria.limit = parseInt(options.limit);
      
      if (options.size) {
        const [min, max] = options.size.split('-');
        criteria.size = {};
        if (min) criteria.size.min = parseSize(min);
        if (max) criteria.size.max = parseSize(max);
      }
      
      if (options.date) {
        const [from, to] = options.date.split(',');
        criteria.date = {};
        if (from) criteria.date.from = new Date(from);
        if (to) criteria.date.to = new Date(to);
      }
      
      logger.info('🔍 Buscando assets...');
      const assets = await assetsSystem.searchAssets(criteria);
      
      console.log(`\n📋 Resultados (${assets.length}):`);
      assets.forEach(asset => {
        console.log(`- ${asset.name} (${asset.type}/${asset.category}) - ${formatSize(asset.size)}`);
      });
      
    } catch (error) {
      logger.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Comando de estadísticas
program
  .command('stats')
  .description('Mostrar estadísticas del sistema')
  .action(async () => {
    try {
      await assetsSystem.initialize();
      
      logger.info('📊 Obteniendo estadísticas...');
      const stats = await assetsSystem.getStats();
      
      console.log('\n📈 Estadísticas del Sistema:');
      console.log(`- Total de assets: ${stats.totalAssets}`);
      console.log(`- Tamaño total: ${formatSize(stats.totalSize)}`);
      console.log(`- Optimización promedio: ${stats.averageOptimization.toFixed(1)}%`);
      console.log(`- Almacenamiento usado: ${formatSize(stats.storageUsed)}`);
      console.log(`- Total de uploads: ${stats.uploads}`);
      
      console.log('\n📂 Por Categorías:');
      Object.entries(stats.categories).forEach(([category, count]) => {
        console.log(`- ${category}: ${count}`);
      });
      
    } catch (error) {
      logger.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Comando de limpieza
program
  .command('cleanup')
  .description('Limpiar archivos temporales')
  .action(async () => {
    try {
      await assetsSystem.initialize();
      
      logger.info('🧹 Limpiando archivos temporales...');
      await assetsSystem.cleanup();
      logger.success('✅ Limpieza completada');
      
    } catch (error) {
      logger.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Comando interactivo
program
  .command('interactive')
  .description('Modo interactivo')
  .action(async () => {
    try {
      await assetsSystem.initialize();
      
      console.log('🎮 Modo Interactivo - Sistema de Assets del Metaverso\n');
      
      while (true) {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: '¿Qué quieres hacer?',
            choices: [
              'Procesar asset',
              'Buscar assets',
              'Ver estadísticas',
              'Limpiar archivos',
              'Salir'
            ]
          }
        ]);
        
        switch (action) {
          case 'Procesar asset':
            await handleProcessAsset();
            break;
          case 'Buscar assets':
            await handleSearchAssets();
            break;
          case 'Ver estadísticas':
            await handleShowStats();
            break;
          case 'Limpiar archivos':
            await handleCleanup();
            break;
          case 'Salir':
            console.log('👋 ¡Hasta luego!');
            process.exit(0);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
      }
      
    } catch (error) {
      logger.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Funciones auxiliares para modo interactivo
async function handleProcessAsset() {
  const { filePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filePath',
      message: 'Ruta del archivo a procesar:',
      validate: (input) => {
        return fs.pathExists(input) ? true : 'Archivo no encontrado';
      }
    }
  ]);
  
  const { platform } = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      message: 'Plataforma de upload:',
      choices: ['ipfs', 'arweave', 'aws', 'local']
    }
  ]);
  
  logger.info(`🔄 Procesando: ${filePath}`);
  const result = await assetsSystem.processAsset(filePath, {
    upload: { platform }
  });
  
  if (result.success) {
    logger.success('✅ Asset procesado exitosamente');
  } else {
    logger.error(`❌ Error: ${result.error}`);
  }
}

async function handleSearchAssets() {
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Tipo de asset:',
      choices: ['Todos', '3d_model', 'texture', 'audio', 'image']
    }
  ]);
  
  const criteria: any = {};
  if (type !== 'Todos') {
    criteria.type = type;
  }
  
  const assets = await assetsSystem.searchAssets(criteria);
  
  console.log(`\n📋 Resultados (${assets.length}):`);
  assets.forEach(asset => {
    console.log(`- ${asset.name} (${asset.type}/${asset.category}) - ${formatSize(asset.size)}`);
  });
}

async function handleShowStats() {
  const stats = await assetsSystem.getStats();
  
  console.log('\n📈 Estadísticas:');
  console.log(`- Total de assets: ${stats.totalAssets}`);
  console.log(`- Tamaño total: ${formatSize(stats.totalSize)}`);
  console.log(`- Optimización promedio: ${stats.averageOptimization.toFixed(1)}%`);
}

async function handleCleanup() {
  logger.info('🧹 Limpiando archivos temporales...');
  await assetsSystem.cleanup();
  logger.success('✅ Limpieza completada');
}

// Funciones auxiliares
function parseSize(sizeStr: string): number {
  const units: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024
  };
  
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
  if (!match) return 0;
  
  const [, value, unit] = match;
  return parseFloat(value) * units[unit.toUpperCase()];
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Ejecutar CLI
if (require.main === module) {
  program.parse();
} 