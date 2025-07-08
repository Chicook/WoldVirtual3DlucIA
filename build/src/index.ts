#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { BuildManager } from './core/BuildManager';
import { ProjectProgress } from './core/ProjectProgress';
import { Logger } from './utils/Logger';

const program = new Command();
const logger = new Logger('BuildCLI');

// Configurar el programa CLI
program
  .name('woldvirtual-build')
  .description('Sistema de build para WoldVirtual3D Metaverso')
  .version('1.0.0');

// Comando para mostrar el progreso del proyecto
program
  .command('progress')
  .description('Mostrar el progreso actual del proyecto')
  .option('-f, --format <format>', 'Formato de salida (json, html, markdown)', 'console')
  .option('-o, --output <file>', 'Archivo de salida')
  .action(async (options) => {
    try {
      const progress = new ProjectProgress();
      progress.loadStatus();
      
      if (options.format === 'console') {
        progress.displayStatus();
      } else {
        const report = progress.exportReport(options.format as any);
        
        if (options.output) {
          const fs = require('fs-extra');
          await fs.writeFile(options.output, report);
          logger.success(`Reporte guardado en: ${options.output}`);
        } else {
          console.log(report);
        }
      }
    } catch (error) {
      logger.error(`Error mostrando progreso: ${error}`);
      process.exit(1);
    }
  });

// Comando para construir módulos específicos
program
  .command('build')
  .description('Construir módulos del proyecto')
  .option('-m, --modules <modules>', 'Módulos específicos a construir (separados por coma)')
  .option('-e, --exclude <modules>', 'Módulos a excluir (separados por coma)')
  .option('-p, --parallel', 'Construir en paralelo', true)
  .option('-c, --concurrency <number>', 'Número máximo de builds paralelos', '4')
  .option('--no-optimize', 'Deshabilitar optimización')
  .option('--no-compress', 'Deshabilitar compresión')
  .option('--no-verify', 'Deshabilitar verificación')
  .option('--sign', 'Firmar builds')
  .option('--clean', 'Limpiar antes de construir', true)
  .option('--watch', 'Modo watch')
  .option('--env <environment>', 'Entorno de construcción', 'development')
  .action(async (options) => {
    try {
      const config = {
        environment: options.env as any,
        parallel: options.parallel,
        maxConcurrency: parseInt(options.concurrency),
        optimize: options.optimize,
        compress: options.compress,
        sign: options.sign,
        verify: options.verify,
        clean: options.clean,
        watch: options.watch,
        modules: options.modules ? options.modules.split(',') : [],
        excludeModules: options.exclude ? options.exclude.split(',') : []
      };

      const buildManager = new BuildManager(config);
      
      // Configurar event listeners para mostrar progreso en tiempo real
      buildManager.on('module-started', (moduleName: string) => {
        logger.info(`Iniciando build: ${moduleName}`);
      });

      buildManager.on('module-completed', (moduleName: string) => {
        logger.success(`Completado: ${moduleName}`);
      });

      buildManager.on('module-error', (moduleName: string, error: string) => {
        logger.error(`Error en ${moduleName}: ${error}`);
      });

      buildManager.on('module-progress', (moduleName: string, progress: number) => {
        // El progreso se muestra automáticamente por el BuildManager
      });

      const result = await buildManager.build();
      
      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Error en build: ${error}`);
      process.exit(1);
    }
  });

// Comando para limpiar builds
program
  .command('clean')
  .description('Limpiar archivos de build')
  .option('-a, --all', 'Limpiar todos los archivos generados')
  .action(async (options) => {
    try {
      const fs = require('fs-extra');
      const dirsToClean = ['dist', 'build', 'out', 'target', '.cache'];
      
      if (options.all) {
        dirsToClean.push('node_modules', 'coverage', 'logs');
      }
      
      logger.info('Limpiando archivos de build...');
      
      for (const dir of dirsToClean) {
        if (await fs.pathExists(dir)) {
          await fs.remove(dir);
          logger.info(`Directorio eliminado: ${dir}`);
        }
      }
      
      logger.success('Limpieza completada');
    } catch (error) {
      logger.error(`Error en limpieza: ${error}`);
      process.exit(1);
    }
  });

// Comando para analizar el proyecto
program
  .command('analyze')
  .description('Analizar el estado del proyecto')
  .option('-d, --detailed', 'Análisis detallado')
  .action(async (options) => {
    try {
      const progress = new ProjectProgress();
      progress.loadStatus();
      
      const status = progress.getStatus();
      
      console.log('\n' + chalk.bold.blue('🔍 ANÁLISIS DEL PROYECTO WOLDVIRTUAL3D') + '\n');
      
      // Análisis general
      console.log(chalk.bold('📊 ESTADO GENERAL:'));
      console.log(`  Progreso total: ${chalk.green(status.totalProgress.toFixed(1))}%`);
      console.log(`  Módulos completados: ${chalk.green(status.completedModules)}/${status.totalModules}`);
      console.log(`  Módulos en progreso: ${chalk.blue(status.inProgressModules)}`);
      console.log(`  Módulos bloqueados: ${chalk.red(status.blockedModules)}`);
      console.log(`  Módulos con errores: ${chalk.red(status.errorModules)}`);
      
      // Análisis de dependencias
      console.log('\n' + chalk.bold('🔗 ANÁLISIS DE DEPENDENCIAS:'));
      const blockedModules = status.modules.filter(m => m.status === 'blocked');
      if (blockedModules.length > 0) {
        console.log(chalk.yellow('  Módulos bloqueados:'));
        blockedModules.forEach(module => {
          const missingDeps = module.dependencies.filter(dep => {
            const depModule = status.modules.find(m => m.name === dep);
            return !depModule || depModule.status !== 'completed';
          });
          console.log(`    ${module.name}: esperando ${missingDeps.join(', ')}`);
        });
      } else {
        console.log(chalk.green('  ✅ No hay módulos bloqueados'));
      }
      
      // Análisis de tiempo
      console.log('\n' + chalk.bold('⏱️ ANÁLISIS DE TIEMPO:'));
      const completedModules = status.modules.filter(m => m.status === 'completed');
      const totalEstimatedTime = status.modules.reduce((sum, m) => sum + (m.estimatedTime || 0), 0);
      const totalActualTime = completedModules.reduce((sum, m) => sum + (m.actualTime || 0), 0);
      const remainingEstimatedTime = status.modules
        .filter(m => m.status !== 'completed')
        .reduce((sum, m) => sum + (m.estimatedTime || 0), 0);
      
      console.log(`  Tiempo estimado total: ${totalEstimatedTime} minutos`);
      console.log(`  Tiempo real completado: ${totalActualTime.toFixed(1)} minutos`);
      console.log(`  Tiempo restante estimado: ${remainingEstimatedTime} minutos`);
      
      if (completedModules.length > 0) {
        const avgTimeRatio = completedModules.reduce((sum, m) => {
          if (m.estimatedTime && m.actualTime) {
            return sum + (m.actualTime / m.estimatedTime);
          }
          return sum;
        }, 0) / completedModules.length;
        
        console.log(`  Ratio tiempo real/estimado: ${avgTimeRatio.toFixed(2)}x`);
      }
      
      // Análisis de errores
      console.log('\n' + chalk.bold('❌ ANÁLISIS DE ERRORES:'));
      const errorModules = status.modules.filter(m => m.status === 'error');
      if (errorModules.length > 0) {
        console.log(chalk.red('  Módulos con errores:'));
        errorModules.forEach(module => {
          console.log(`    ${module.name}:`);
          module.errors?.forEach(error => {
            console.log(`      - ${error}`);
          });
        });
      } else {
        console.log(chalk.green('  ✅ No hay errores reportados'));
      }
      
      // Análisis de advertencias
      console.log('\n' + chalk.bold('⚠️ ANÁLISIS DE ADVERTENCIAS:'));
      const warningModules = status.modules.filter(m => m.warnings && m.warnings.length > 0);
      if (warningModules.length > 0) {
        console.log(chalk.yellow('  Módulos con advertencias:'));
        warningModules.forEach(module => {
          console.log(`    ${module.name}:`);
          module.warnings?.forEach(warning => {
            console.log(`      - ${warning}`);
          });
        });
      } else {
        console.log(chalk.green('  ✅ No hay advertencias reportadas'));
      }
      
      // Recomendaciones
      console.log('\n' + chalk.bold('💡 RECOMENDACIONES:'));
      if (status.blockedModules > 0) {
        console.log(chalk.yellow('  • Priorizar la finalización de módulos bloqueados'));
      }
      if (status.errorModules > 0) {
        console.log(chalk.red('  • Resolver errores antes de continuar'));
      }
      if (status.inProgressModules === 0 && status.completedModules < status.totalModules) {
        console.log(chalk.blue('  • Iniciar construcción de módulos pendientes'));
      }
      if (status.completedModules === status.totalModules) {
        console.log(chalk.green('  • ¡Proyecto completado! Considerar optimizaciones finales'));
      }
      
    } catch (error) {
      logger.error(`Error en análisis: ${error}`);
      process.exit(1);
    }
  });

// Comando para mostrar información del sistema
program
  .command('info')
  .description('Mostrar información del sistema de build')
  .action(() => {
    console.log('\n' + chalk.bold.blue('ℹ️ INFORMACIÓN DEL SISTEMA DE BUILD') + '\n');
    
    console.log(chalk.bold('📦 Versión:') + ' 1.0.0');
    console.log(chalk.bold('🏗️ Proyecto:') + ' WoldVirtual3D Metaverso');
    console.log(chalk.bold('🔧 Entorno:') + ' Node.js ' + process.version);
    console.log(chalk.bold('📁 Directorio:') + ' ' + process.cwd());
    
    console.log('\n' + chalk.bold('📋 Comandos disponibles:'));
    console.log('  progress    - Mostrar progreso del proyecto');
    console.log('  build       - Construir módulos');
    console.log('  clean       - Limpiar archivos de build');
    console.log('  analyze     - Analizar estado del proyecto');
    console.log('  info        - Mostrar esta información');
    
    console.log('\n' + chalk.bold('🎯 Módulos del proyecto:'));
    const modules = [
      'blockchain', 'smart-contracts', 'bridge-bsc', 'gas-abstraction',
      'frontend', 'backend', 'assets', 'metaverso', 'avatars',
      'nfts', 'defi', 'governance', 'monitoring', 'security',
      'deployment', 'documentation', 'testing', 'optimization'
    ];
    
    modules.forEach((module, index) => {
      const isLast = index === modules.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      console.log(`  ${prefix}${module}`);
    });
  });

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Mostrar ayuda si no se proporcionan argumentos
if (process.argv.length === 2) {
  program.help();
}

// Parsear argumentos
program.parse(process.argv);
