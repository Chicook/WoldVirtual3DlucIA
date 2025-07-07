#!/usr/bin/env node

/**
 * Script para resolver conflictos de merge automáticamente
 * Resuelve conflictos en archivos JSON, TypeScript, CSS y Markdown
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

// Estrategias de resolución para diferentes tipos de archivos
const resolutionStrategies = {
  // Para package.json - mantener todas las dependencias y scripts
  'package.json': (content) => {
    const lines = content.split('\n');
    const resolved = [];
    let inConflict = false;
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<<<<<<< HEAD')) {
        inConflict = true;
        continue;
      }
      
      if (line.includes('=======')) {
        inConflict = false;
        continue;
      }
      
      if (line.includes('>>>>>>>')) {
        inConflict = false;
        continue;
      }
      
      if (!inConflict) {
        resolved.push(line);
      } else {
        // En conflictos, mantener la línea actual
        resolved.push(line);
      }
    }
    
    return resolved.join('\n');
  },

  // Para archivos TypeScript/JavaScript - mantener la versión más reciente
  '.ts': (content) => {
    const lines = content.split('\n');
    const resolved = [];
    let inConflict = false;
    let conflictContent = [];
    let hasContent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<<<<<<< HEAD')) {
        // Si no hay contenido en la primera parte, usar la segunda
        if (!hasContent) {
          conflictContent = [];
        }
        continue;
      }
      
      if (line.includes('=======')) {
        inConflict = false;
        if (conflictContent.length > 0) {
          resolved.push(...conflictContent);
        }
        continue;
      }
      
      if (line.includes('>>>>>>>')) {
        inConflict = false;
        if (conflictContent.length > 0) {
          resolved.push(...conflictContent);
        }
        continue;
      }
      
      if (inConflict) {
        conflictContent.push(line);
        if (line.trim()) hasContent = true;
      } else {
        resolved.push(line);
      }
    }
    
    return resolved.join('\n');
  },

  // Para archivos CSS - mantener todos los estilos
  '.css': (content) => {
    const lines = content.split('\n');
    const resolved = [];
    let inConflict = false;
    let allStyles = new Set();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<<<<<<< HEAD')) {
        inConflict = true;
        continue;
      }
      
      if (line.includes('=======')) {
        inConflict = false;
        continue;
      }
      
      if (line.includes('>>>>>>>')) {
        inConflict = false;
        continue;
      }
      
      if (!inConflict) {
        resolved.push(line);
      } else {
        // En conflictos CSS, mantener todas las reglas
        if (line.trim() && !line.includes('/*') && !line.includes('*/')) {
          allStyles.add(line);
        }
      }
    }
    
    // Agregar todos los estilos del conflicto
    for (const style of allStyles) {
      resolved.push(style);
    }
    
    return resolved.join('\n');
  },

  // Para archivos Markdown - mantener todo el contenido
  '.md': (content) => {
    const lines = content.split('\n');
    const resolved = [];
    let inConflict = false;
    let conflictContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<<<<<<< HEAD')) {
        inConflict = true;
        conflictContent = [];
        continue;
      }
      
      if (line.includes('=======')) {
        // Mantener el contenido hasta ahora
        resolved.push(...conflictContent);
        conflictContent = [];
        continue;
      }
      
      if (line.includes('>>>>>>>')) {
        inConflict = false;
        // Mantener el contenido final del conflicto
        resolved.push(...conflictContent);
        continue;
      }
      
      if (inConflict) {
        conflictContent.push(line);
      } else {
        resolved.push(line);
      }
    }
    
    return resolved.join('\n');
  }
};

function resolveFileConflicts(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    // Crear backup
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, content);
    
    let resolvedContent = content;
    
    // Aplicar estrategia específica si existe
    if (resolutionStrategies[fileName]) {
      resolvedContent = resolutionStrategies[fileName](content);
    } else if (resolutionStrategies[ext]) {
      resolvedContent = resolutionStrategies[ext](content);
    } else {
      // Estrategia por defecto - eliminar marcadores de conflicto
      resolvedContent = content
        .replace(/<<<<<<< HEAD\n/g, '')
        .replace(/=======\n/g, '')
        .replace(/>>>>>>> [^\n]+\n/g, '')
        .replace(/<<<<<<< [^\n]+\n/g, '')
        .replace(/=======\n/g, '')
        .replace(/>>>>>>> [^\n]+\n/g, '');
    }
    
    // Limpiar líneas vacías múltiples
    resolvedContent = resolvedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, resolvedContent);
    
    logSuccess(`✅ Resuelto: ${filePath}`);
    logInfo(`   Backup: ${backupPath}`);
    
    return true;
  } catch (error) {
    logError(`Error procesando ${filePath}: ${error.message}`);
    return false;
  }
}

function findConflictedFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', '.bin', 'dist', 'build', '.venv'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          if (content.includes('<<<<<<< HEAD') || content.includes('=======') || content.includes('>>>>>>>')) {
            files.push(fullPath);
          }
        } catch (error) {
          // Ignorar archivos que no se pueden leer
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

function main() {
  log('🔧 INICIANDO RESOLUCIÓN AUTOMÁTICA DE CONFLICTOS', 'bright');
  log('================================================', 'bright');
  
  const startTime = Date.now();
  const conflictedFiles = findConflictedFiles(process.cwd());
  
  if (conflictedFiles.length === 0) {
    logSuccess('✅ No se encontraron archivos con conflictos');
    return;
  }
  
  logInfo(`📁 Encontrados ${conflictedFiles.length} archivos con conflictos`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of conflictedFiles) {
    if (resolveFileConflicts(file)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n🎉 RESUMEN DE RESOLUCIÓN', 'bright');
  log('=======================', 'bright');
  log(`⏱️  Tiempo total: ${duration}s`, 'cyan');
  log(`✅ Exitosos: ${successCount}`, 'green');
  log(`❌ Errores: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  log(`📁 Total procesados: ${conflictedFiles.length}`, 'blue');
  
  if (errorCount === 0) {
    log('\n🎊 ¡TODOS LOS CONFLICTOS HAN SIDO RESUELTOS!', 'bright');
  } else {
    log('\n⚠️  Algunos archivos requieren atención manual.', 'yellow');
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  resolutionStrategies,
  resolveFileConflicts,
  findConflictedFiles,
  main
};
