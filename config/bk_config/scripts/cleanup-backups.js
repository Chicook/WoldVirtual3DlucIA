#!/usr/bin/env node

/**
 * Script para limpiar archivos de backup después de resolver conflictos
 */

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

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function findBackupFiles(dir) {
  const backupFiles = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', '.bin', 'dist', 'build', '.venv'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile() && item.includes('.backup.')) {
        backupFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return backupFiles;
}

function cleanupBackups() {
  log('🧹 Limpiando archivos de backup...', 'bright');
  
  const projectRoot = process.cwd();
  const backupFiles = findBackupFiles(projectRoot);
  
  if (backupFiles.length === 0) {
    logSuccess('✅ No se encontraron archivos de backup para limpiar');
    return;
  }
  
  logInfo(`📁 Encontrados ${backupFiles.length} archivos de backup:`);
  backupFiles.forEach(file => {
    log(`   - ${file}`, 'cyan');
  });
  
  let deletedCount = 0;
  
  for (const file of backupFiles) {
    try {
      fs.unlinkSync(file);
      logSuccess(`🗑️  Eliminado: ${file}`);
      deletedCount++;
    } catch (error) {
      logWarning(`⚠️  Error eliminando ${file}: ${error.message}`);
    }
  }
  
  logSuccess(`🎉 Eliminados ${deletedCount} archivos de backup`);
}

function verifyProjectIntegrity() {
  log('\n🔍 Verificando integridad del proyecto...', 'bright');
  
  // Verificar que no hay conflictos de merge
  const { execSync } = require('child_process');
  
  try {
    const result = execSync('grep -r "<<<<<<< HEAD" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.bin --exclude-dir=dist --exclude-dir=build --exclude-dir=.venv --exclude="*.backup.*"', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.trim()) {
      logWarning('⚠️  Aún quedan conflictos sin resolver:');
      console.log(result);
      return false;
    } else {
      logSuccess('✅ No se encontraron conflictos de merge');
      return true;
    }
  } catch (error) {
    // grep retorna error si no encuentra coincidencias (código 1)
    if (error.status === 1) {
      logSuccess('✅ No se encontraron conflictos de merge');
      return true;
    } else {
      logWarning(`⚠️  Error verificando conflictos: ${error.message}`);
      return false;
    }
  }
}

function main() {
  log('🚀 Iniciando limpieza de archivos de backup...', 'bright');
  
  const projectRoot = process.cwd();
  logInfo(`Directorio del proyecto: ${projectRoot}`);
  
  // Limpiar archivos de backup
  cleanupBackups();
  
  // Verificar integridad del proyecto
  const integrityOk = verifyProjectIntegrity();
  
  if (integrityOk) {
    logSuccess('🎉 ¡Proyecto limpio y sin conflictos!');
    
    log('\n💡 Próximos pasos recomendados:', 'bright');
    logInfo('1. Instalar dependencias: npm run install:all');
    logInfo('2. Verificar compilación: npm run build');
    logInfo('3. Ejecutar tests: npm test');
    logInfo('4. Hacer commit: git add . && git commit -m "Resuelve conflictos de merge"');
    logInfo('5. Iniciar desarrollo: npm run dev');
  } else {
    logWarning('⚠️  El proyecto puede requerir atención manual');
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanupBackups, verifyProjectIntegrity }; 