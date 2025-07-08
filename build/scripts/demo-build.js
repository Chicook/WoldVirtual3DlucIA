#!/usr/bin/env node

/**
 * 🎯 Script de Demostración - Sistema de Build WoldVirtual3D
 * 
 * Este script demuestra el uso completo del sistema de build
 * y seguimiento de progreso del proyecto.
 */

const { BuildManager } = require('../dist/core/BuildManager');
const { ProjectProgress } = require('../dist/core/ProjectProgress');
const chalk = require('chalk');

async function demoBuildSystem() {
  console.log(chalk.bold.blue('🎯 DEMOSTRACIÓN DEL SISTEMA DE BUILD WOLDVIRTUAL3D\n'));

  // 1. Inicializar sistema de progreso
  console.log(chalk.yellow('1️⃣ Inicializando sistema de progreso...'));
  const progress = new ProjectProgress();
  
  // Simular algunos módulos completados
  progress.completeModule('blockchain');
  progress.completeModule('smart-contracts');
  progress.updateModuleProgress('bridge-bsc', 75);
  progress.updateModuleProgress('gas-abstraction', 30);
  progress.startModule('frontend');
  progress.updateModuleProgress('frontend', 45);
  
  // Mostrar progreso inicial
  console.log(chalk.green('✅ Sistema de progreso inicializado'));
  progress.displayStatus();

  // 2. Configurar build manager
  console.log(chalk.yellow('\n2️⃣ Configurando build manager...'));
  const buildConfig = {
    environment: 'development',
    parallel: true,
    maxConcurrency: 3,
    optimize: true,
    compress: true,
    sign: false,
    verify: true,
    clean: true,
    watch: false,
    modules: ['backend', 'assets', 'metaverso'],
    excludeModules: []
  };

  const buildManager = new BuildManager(buildConfig);
  console.log(chalk.green('✅ Build manager configurado'));

  // 3. Configurar event listeners
  console.log(chalk.yellow('\n3️⃣ Configurando event listeners...'));
  
  buildManager.on('module-started', (moduleName) => {
    console.log(chalk.blue(`🚀 Iniciando build: ${moduleName}`));
  });

  buildManager.on('module-completed', (moduleName) => {
    console.log(chalk.green(`✅ Completado: ${moduleName}`));
  });

  buildManager.on('module-error', (moduleName, error) => {
    console.log(chalk.red(`❌ Error en ${moduleName}: ${error}`));
  });

  buildManager.on('module-progress', (moduleName, progress) => {
    // El progreso se muestra automáticamente
  });

  console.log(chalk.green('✅ Event listeners configurados'));

  // 4. Ejecutar build
  console.log(chalk.yellow('\n4️⃣ Ejecutando build...'));
  
  try {
    const result = await buildManager.build();
    
    if (result.success) {
      console.log(chalk.green('\n🎉 ¡Build completado exitosamente!'));
    } else {
      console.log(chalk.red('\n❌ Build completado con errores'));
    }
    
    // Mostrar estadísticas finales
    console.log(chalk.bold('\n📊 Estadísticas del Build:'));
    console.log(`  Tiempo total: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`  Módulos construidos: ${result.stats.modulesBuilt}`);
    console.log(`  Módulos fallidos: ${result.stats.modulesFailed}`);
    console.log(`  Archivos totales: ${result.stats.totalFiles}`);
    console.log(`  Tamaño total: ${(result.stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Tamaño comprimido: ${(result.stats.compressedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Ratio de optimización: ${(result.stats.optimizationRatio * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.log(chalk.red(`\n💥 Error durante el build: ${error.message}`));
  }

  // 5. Mostrar progreso final
  console.log(chalk.yellow('\n5️⃣ Progreso final del proyecto:'));
  progress.displayStatus();

  // 6. Generar reportes
  console.log(chalk.yellow('\n6️⃣ Generando reportes...'));
  
  try {
    const jsonReport = progress.exportReport('json');
    const htmlReport = progress.exportReport('html');
    const markdownReport = progress.exportReport('markdown');
    
    // Guardar reportes
    const fs = require('fs-extra');
    await fs.writeFile('demo-report.json', jsonReport);
    await fs.writeFile('demo-report.html', htmlReport);
    await fs.writeFile('demo-report.md', markdownReport);
    
    console.log(chalk.green('✅ Reportes generados:'));
    console.log('  - demo-report.json');
    console.log('  - demo-report.html');
    console.log('  - demo-report.md');
    
  } catch (error) {
    console.log(chalk.red(`❌ Error generando reportes: ${error.message}`));
  }

  // 7. Análisis final
  console.log(chalk.yellow('\n7️⃣ Análisis final del proyecto:'));
  
  const status = progress.getStatus();
  console.log(chalk.bold('\n📈 Resumen:'));
  console.log(`  Progreso total: ${chalk.green(status.totalProgress.toFixed(1))}%`);
  console.log(`  Módulos completados: ${chalk.green(status.completedModules)}/${status.totalModules}`);
  console.log(`  Módulos en progreso: ${chalk.blue(status.inProgressModules)}`);
  console.log(`  Módulos bloqueados: ${chalk.red(status.blockedModules)}`);
  console.log(`  Módulos con errores: ${chalk.red(status.errorModules)}`);

  // Recomendaciones
  console.log(chalk.bold('\n💡 Recomendaciones:'));
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

  console.log(chalk.bold.blue('\n🎯 ¡Demostración completada!'));
  console.log(chalk.gray('\nPara más información, consulta la documentación o ejecuta:'));
  console.log(chalk.cyan('  npm run info'));
  console.log(chalk.cyan('  npm run progress'));
  console.log(chalk.cyan('  npm run analyze'));
}

// Función para simular builds reales
async function simulateRealBuild() {
  console.log(chalk.bold.blue('\n🔧 Simulando builds reales...\n'));

  const modules = [
    { name: 'backend', time: 3000, success: true },
    { name: 'assets', time: 2000, success: true },
    { name: 'metaverso', time: 4000, success: false }
  ];

  for (const module of modules) {
    console.log(chalk.blue(`🔨 Construyendo ${module.name}...`));
    
    await new Promise(resolve => setTimeout(resolve, module.time));
    
    if (module.success) {
      console.log(chalk.green(`✅ ${module.name} completado`));
    } else {
      console.log(chalk.red(`❌ ${module.name} falló`));
    }
  }
}

// Función principal
async function main() {
  try {
    await demoBuildSystem();
    
    // Preguntar si quiere simular builds reales
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(chalk.yellow('\n¿Quieres simular builds reales? (y/n): '), async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await simulateRealBuild();
      }
      rl.close();
    });
    
  } catch (error) {
    console.error(chalk.red(`Error en la demostración: ${error.message}`));
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { demoBuildSystem, simulateRealBuild }; 