#!/usr/bin/env node

/**
 * Script específico para resolver conflictos en archivos package.json
 * Combina dependencias y scripts de múltiples ramas
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

function logError(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function resolvePackageJsonConflicts(content) {
  const lines = content.split('\n');
  const resolved = [];
  let inConflict = false;
  let conflictLines = [];
  let currentIndent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('<<<<<<< HEAD')) {
      inConflict = true;
      conflictLines = [];
      continue;
    }
    
    if (line.includes('=======')) {
      // Procesar el contenido del conflicto
      const processedLines = processConflictLines(conflictLines);
      resolved.push(...processedLines);
      conflictLines = [];
      continue;
    }
    
    if (line.includes('>>>>>>>')) {
      inConflict = false;
      // Procesar el contenido final del conflicto
      const processedLines = processConflictLines(conflictLines);
      resolved.push(...processedLines);
      conflictLines = [];
      continue;
    }
    
    if (inConflict) {
      conflictLines.push(line);
    } else {
      resolved.push(line);
    }
  }
  
  return resolved.join('\n');
}

function processConflictLines(lines) {
  const processed = [];
  const dependencies = new Map();
  const scripts = new Map();
  const otherLines = [];
  
  let currentSection = '';
  let currentIndent = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '"dependencies":' || trimmed === '"devDependencies":') {
      currentSection = trimmed;
      processed.push(line);
      continue;
    }
    
    if (trimmed === '"scripts":') {
      currentSection = trimmed;
      processed.push(line);
      continue;
    }
    
    if (trimmed.startsWith('"') && trimmed.includes('":')) {
      // Es una dependencia o script
      const key = trimmed.split('":')[0] + '"';
      const value = line.substring(line.indexOf('":') + 2);
      
      if (currentSection === '"dependencies":' || currentSection === '"devDependencies":') {
        dependencies.set(key, value);
      } else if (currentSection === '"scripts":') {
        scripts.set(key, value);
      } else {
        otherLines.push(line);
      }
    } else {
      otherLines.push(line);
    }
  }
  
  // Agregar dependencias únicas
  for (const [key, value] of dependencies) {
    processed.push(`    ${key}:${value}`);
  }
  
  // Agregar scripts únicos
  for (const [key, value] of scripts) {
    processed.push(`    ${key}:${value}`);
  }
  
  // Agregar otras líneas
  processed.push(...otherLines);
  
  return processed;
}

function findPackageJsonFiles(dir) {
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
      } else if (item === 'package.json') {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          if (content.includes('<<<<<<< HEAD') || content.includes('=======') || content.includes('>>>>>>>')) {
            files.push(fullPath);
          }
        } catch (error) {
          logWarning(`⚠️  Error leyendo ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

function fixPackageJsonFile(filePath) {
  try {
    logInfo(`Procesando: ${filePath}`);
    
    // Crear backup
    const backupPath = `${filePath}.backup`;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, originalContent);
    
    // Resolver conflictos
    const resolvedContent = resolvePackageJsonConflicts(originalContent);
    
    // Validar JSON
    try {
      JSON.parse(resolvedContent);
    } catch (error) {
      logWarning(`⚠️  JSON inválido en ${filePath}, intentando arreglar...`);
      
      // Intentar arreglar JSON malformado
      const fixedContent = fixJsonSyntax(resolvedContent);
      
      try {
        JSON.parse(fixedContent);
        fs.writeFileSync(filePath, fixedContent);
        logSuccess(`✅ Arreglado y guardado: ${filePath}`);
        return true;
      } catch (secondError) {
        logError(`❌ No se pudo arreglar JSON en ${filePath}: ${secondError.message}`);
        // Restaurar backup
        fs.writeFileSync(filePath, originalContent);
        return false;
      }
    }
    
    // Guardar contenido resuelto
    fs.writeFileSync(filePath, resolvedContent);
    logSuccess(`✅ Resuelto: ${filePath}`);
    return true;
    
  } catch (error) {
    logError(`❌ Error procesando ${filePath}: ${error.message}`);
    return false;
  }
}

function fixJsonSyntax(content) {
  // Arreglar comas faltantes
  let fixed = content.replace(/([}\]"])\s*\n\s*([{"])/g, '$1,\n$2');
  
  // Arreglar comas extra al final
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  
  // Arreglar comillas faltantes en claves
  fixed = fixed.replace(/(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  
  // Arreglar comillas faltantes en valores string
  fixed = fixed.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)(\s*[,\n}])/g, ': "$1"$2');
  
  return fixed;
}

function main() {
  log('🔧 INICIANDO RESOLUCIÓN DE CONFLICTOS EN PACKAGE.JSON', 'bright');
  log('====================================================', 'bright');
  
  const startTime = Date.now();
  const packageFiles = findPackageJsonFiles(process.cwd());
  
  if (packageFiles.length === 0) {
    logSuccess('✅ No se encontraron archivos package.json con conflictos');
    return;
  }
  
  logInfo(`📦 Encontrados ${packageFiles.length} archivos package.json con conflictos`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of packageFiles) {
    if (fixPackageJsonFile(file)) {
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
  log(`📦 Total procesados: ${packageFiles.length}`, 'blue');
  
  if (errorCount === 0) {
    log('\n🎊 ¡TODOS LOS CONFLICTOS EN PACKAGE.JSON HAN SIDO RESUELTOS!', 'bright');
  } else {
    log('\n⚠️  Algunos archivos requieren atención manual.', 'yellow');
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  resolvePackageJsonConflicts,
  processConflictLines,
  findPackageJsonFiles,
  fixPackageJsonFile,
  fixJsonSyntax,
  main
};
