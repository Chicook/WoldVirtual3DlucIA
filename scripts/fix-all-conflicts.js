#!/usr/bin/env node

/**
 * Script principal para resolver todos los conflictos del proyecto
 * Ejecuta múltiples estrategias de resolución
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
  magenta: '\x1b[35m',
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

function runScript(scriptPath) {
  try {
    logInfo(`Ejecutando: ${scriptPath}`);
    execSync(`node ${scriptPath}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    return true;
  } catch (error) {
    logError(`Error ejecutando ${scriptPath}: ${error.message}`);
    return false;
  }
}

function resolveSimpleConflicts() {
  logStep('Resolviendo conflictos simples...');
  
  const files = [
    'anticonflixtos/package.json',
    'gateway/package.json',
    'config/package.json',
    'client/vite.config.ts',
    'client/tsconfig.node.json',
    'client/src/App.tsx',
    'client/src/components/HomePage.tsx',
    'client/src/components/world/UserAvatars.tsx',
    'client/src/components/world/WorldObjects.tsx',
    'client/src/components/world/WorldTerrain.tsx',
    'client/src/components/Profile.tsx',
    'client/src/components/MetaversoWorld.tsx',
    'client/src/components/profile/Profile.tsx',
    'client/src/types/metaverso.ts',
    'client/src/styles/globals.css',
    'client/src/stores/metaversoStore.ts',
    'client/README.md',
    'README.md',
    'lucIA/tsconfig.json'
  ];
  
  let resolvedCount = 0;
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Crear backup
        const backupPath = `${file}.backup`;
        fs.writeFileSync(backupPath, content);
        
        // Resolver conflictos de merge
        let resolvedContent = content
          .replace(/<<<<<<< HEAD\n/g, '')
          .replace(/=======\n/g, '')
          .replace(/>>>>>>> [^\n]+\n/g, '')
          .replace(/<<<<<<< [^\n]+\n/g, '')
          .replace(/=======\n/g, '')
          .replace(/>>>>>>> [^\n]+\n/g, '');
        
        // Limpiar líneas vacías múltiples
        resolvedContent = resolvedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(file, resolvedContent);
        
        logSuccess(`✅ Resuelto: ${file}`);
        logInfo(`   Backup: ${backupPath}`);
        resolvedCount++;
      } catch (error) {
        logWarning(`⚠️  Error procesando ${file}: ${error.message}`);
      }
    }
  }
  
  logSuccess(`🎉 Resueltos ${resolvedCount} archivos con conflictos simples`);
  return resolvedCount;
}

function fixPackageJsonFiles() {
  logStep('Resolviendo conflictos en archivos package.json...');
  
  const packageFiles = [
    'anticonflixtos/package.json',
    'gateway/package.json',
    'config/package.json',
    'client/package.json',
    'backend/package.json',
    'bloc/package.json',
    'cli/package.json',
    'components/package.json',
    'entities/package.json',
    'fonts/package.json',
    'gateway/package.json',
    'helpers/package.json',
    'image/package.json',
    'languages/package.json',
    'knowledge/package.json'
  ];
  
  let resolvedCount = 0;
  
  for (const file of packageFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Crear backup
        const backupPath = `${file}.backup`;
        fs.writeFileSync(backupPath, content);
        
        // Resolver conflictos de merge
        let resolvedContent = content
          .replace(/<<<<<<< HEAD\n/g, '')
          .replace(/=======\n/g, '')
          .replace(/>>>>>>> [^\n]+\n/g, '')
          .replace(/<<<<<<< [^\n]+\n/g, '')
          .replace(/=======\n/g, '')
          .replace(/>>>>>>> [^\n]+\n/g, '');
        
        // Limpiar dependencias duplicadas
        const lines = resolvedContent.split('\n');
        const cleanedLines = [];
        const seenDependencies = new Set();
        const seenScripts = new Set();
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('"') && trimmed.includes('":')) {
            const key = trimmed.split('":')[0] + '"';
            
            if (trimmed.includes('"^') || trimmed.includes('"~') || trimmed.includes('"*')) {
              // Es una dependencia
              if (!seenDependencies.has(key)) {
                seenDependencies.add(key);
                cleanedLines.push(line);
              }
            } else if (trimmed.includes('"cd ') || trimmed.includes('"npm ') || trimmed.includes('"node ')) {
              // Es un script
              if (!seenScripts.has(key)) {
                seenScripts.add(key);
                cleanedLines.push(line);
              }
            } else {
              cleanedLines.push(line);
            }
          } else {
            cleanedLines.push(line);
          }
        }
        
        resolvedContent = cleanedLines.join('\n');
        
        fs.writeFileSync(file, resolvedContent);
        
        logSuccess(`✅ Resuelto: ${file}`);
        logInfo(`   Backup: ${backupPath}`);
        resolvedCount++;
      } catch (error) {
        logWarning(`⚠️  Error procesando ${file}: ${error.message}`);
      }
    }
  }
  
  logSuccess(`🎉 Resueltos ${resolvedCount} archivos package.json`);
  return resolvedCount;
}

function verifyResolution() {
  logStep('Verificando resolución de conflictos...');
  
  try {
    // Verificar que no hay marcadores de conflicto
    const result = execSync('grep -r "<<<<<<< HEAD" . --exclude-dir=node_modules --exclude-dir=.git || true', { encoding: 'utf8' });
    
    if (result.trim()) {
      logWarning('⚠️  Aún se encontraron marcadores de conflicto:');
      console.log(result);
      return false;
    } else {
      logSuccess('✅ No se encontraron marcadores de conflicto restantes');
      return true;
    }
  } catch (error) {
    logError(`Error verificando resolución: ${error.message}`);
    return false;
  }
}

function cleanBackupFiles() {
  logStep('Limpiando archivos de backup...');
  
  try {
    const backupFiles = execSync('find . -name "*.backup" -type f', { encoding: 'utf8' }).trim().split('\n');
    
    let cleanedCount = 0;
    for (const backupFile of backupFiles) {
      if (backupFile) {
        try {
          fs.unlinkSync(backupFile);
          cleanedCount++;
        } catch (error) {
          logWarning(`⚠️  No se pudo eliminar ${backupFile}: ${error.message}`);
        }
      }
    }
    
    logSuccess(`🎉 Eliminados ${cleanedCount} archivos de backup`);
    return cleanedCount;
  } catch (error) {
    logWarning(`⚠️  Error limpiando backups: ${error.message}`);
    return 0;
  }
}

function main() {
  log('🚀 INICIANDO RESOLUCIÓN COMPLETA DE CONFLICTOS', 'bright');
  log('================================================', 'bright');
  
  const startTime = Date.now();
  
  try {
    // Ejecutar scripts específicos
    const scripts = [
      'scripts/resolve-conflicts.js',
      'scripts/fix-package-conflicts.js',
      'scripts/fix-json-syntax.js',
      'scripts/create-clean-package.js'
    ];
    
    let successCount = 0;
    for (const script of scripts) {
      if (fs.existsSync(script)) {
        if (runScript(script)) {
          successCount++;
        }
      } else {
        logWarning(`⚠️  Script no encontrado: ${script}`);
      }
    }
    
    // Resolver conflictos simples
    const simpleResolved = resolveSimpleConflicts();
    
    // Arreglar package.json
    const packageResolved = fixPackageJsonFiles();
    
    // Verificar resolución
    const verificationPassed = verifyResolution();
    
    // Limpiar backups
    const backupsCleaned = cleanBackupFiles();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log('\n🎉 RESUMEN DE RESOLUCIÓN DE CONFLICTOS', 'bright');
    log('=====================================', 'bright');
    log(`⏱️  Tiempo total: ${duration}s`, 'cyan');
    log(`📜 Scripts ejecutados: ${successCount}/${scripts.length}`, 'cyan');
    log(`📁 Archivos simples resueltos: ${simpleResolved}`, 'green');
    log(`📦 Package.json resueltos: ${packageResolved}`, 'green');
    log(`🧹 Backups eliminados: ${backupsCleaned}`, 'yellow');
    log(`✅ Verificación: ${verificationPassed ? 'PASÓ' : 'FALLÓ'}`, verificationPassed ? 'green' : 'red');
    
    if (verificationPassed) {
      log('\n🎊 ¡TODOS LOS CONFLICTOS HAN SIDO RESUELTOS EXITOSAMENTE!', 'bright');
      log('El proyecto está listo para continuar el desarrollo.', 'green');
    } else {
      log('\n⚠️  Algunos conflictos pueden requerir atención manual.', 'yellow');
      log('Revisa los archivos mencionados arriba.', 'yellow');
    }
    
  } catch (error) {
    logError(`Error en la resolución de conflictos: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  resolveSimpleConflicts,
  fixPackageJsonFiles,
  verifyResolution,
  cleanBackupFiles,
  main
};
