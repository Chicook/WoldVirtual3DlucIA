#!/usr/bin/env node

/**
 * Script para instalar todas las dependencias del proyecto
 * Instala dependencias en todos los módulos del metaverso
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logStep(message) {
  log(`\n🔧 ${message}`, 'bright');
}

function findPackageJsonFiles(dir) {
  const packageFiles = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', '.bin', 'dist', 'build', '.venv'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (item === 'package.json') {
        packageFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return packageFiles;
}

function installDependencies(packagePath) {
  try {
    const dir = path.dirname(packagePath);
    const relativePath = path.relative(process.cwd(), dir);
    
    logInfo(`Instalando dependencias en: ${relativePath}`);
    
    // Cambiar al directorio del módulo
    process.chdir(dir);
    
    // Instalar dependencias
    execSync('npm install', { 
      stdio: 'inherit',
      cwd: dir
    });
    
    // Volver al directorio raíz
    process.chdir(process.cwd());
    
    logSuccess(`✅ Dependencias instaladas en: ${relativePath}`);
    return true;
  } catch (error) {
    logError(`Error instalando dependencias en ${packagePath}: ${error.message}`);
    return false;
  }
}

function main() {
  log('🚀 Instalando todas las dependencias del proyecto...', 'bright');
  
  const projectRoot = process.cwd();
  logInfo(`Directorio del proyecto: ${projectRoot}`);
  
  // Paso 1: Instalar dependencias de la raíz
  logStep('Instalando dependencias de la raíz...');
  
  try {
    execSync('npm install', { 
      stdio: 'inherit',
      cwd: projectRoot
    });
    logSuccess('✅ Dependencias de la raíz instaladas');
  } catch (error) {
    logError(`Error instalando dependencias de la raíz: ${error.message}`);
  }
  
  // Paso 2: Encontrar todos los package.json
  logStep('Buscando módulos con package.json...');
  
  const packageFiles = findPackageJsonFiles(projectRoot);
  
  logInfo(`📦 Encontrados ${packageFiles.length} archivos package.json:`);
  packageFiles.forEach(file => {
    const relativePath = path.relative(projectRoot, file);
    log(`   - ${relativePath}`, 'cyan');
  });
  
  // Paso 3: Instalar dependencias en cada módulo
  logStep('Instalando dependencias en cada módulo...');
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const packageFile of packageFiles) {
    if (installDependencies(packageFile)) {
      successCount++;
    } else {
      failedCount++;
    }
  }
  
  // Resumen final
  log('\n📊 Resumen de instalación de dependencias:', 'bright');
  logSuccess(`✅ Módulos con dependencias instaladas: ${successCount}`);
  
  if (failedCount > 0) {
    logWarning(`⚠️  Módulos con errores: ${failedCount}`);
  }
  
  // Paso 4: Verificar instalación
  logStep('Verificando instalación...');
  
  try {
    // Verificar que node_modules existe en la raíz
    if (fs.existsSync(path.join(projectRoot, 'node_modules'))) {
      logSuccess('✅ node_modules encontrado en la raíz');
    } else {
      logWarning('⚠️  node_modules no encontrado en la raíz');
    }
    
    // Verificar que algunos módulos clave tienen node_modules
    const keyModules = ['client', 'backend', 'bloc'];
    for (const module of keyModules) {
      const modulePath = path.join(projectRoot, module);
      if (fs.existsSync(modulePath)) {
        const nodeModulesPath = path.join(modulePath, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          logSuccess(`✅ ${module}/node_modules encontrado`);
        } else {
          logWarning(`⚠️  ${module}/node_modules no encontrado`);
        }
      }
    }
    
  } catch (error) {
    logError(`Error verificando instalación: ${error.message}`);
  }
  
  logSuccess('🎉 Proceso de instalación completado');
  
  log('\n💡 Próximos pasos recomendados:', 'bright');
  logInfo('1. Verificar compilación: npm run build');
  logInfo('2. Ejecutar tests: npm test');
  logInfo('3. Iniciar desarrollo: npm run dev');
  logInfo('4. Verificar que todo funciona correctamente');
}

if (require.main === module) {
  main();
}

module.exports = { findPackageJsonFiles, installDependencies }; 