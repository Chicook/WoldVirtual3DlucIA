#!/usr/bin/env node

/**
 * Script para arreglar la sintaxis JSON de archivos package.json
 * Resuelve problemas de JSON malformado después de resolver conflictos
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

function fixJsonSyntax(content) {
  const lines = content.split('\n');
  const fixed = [];
  let inObject = 0;
  let inArray = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Eliminar líneas vacías múltiples
    if (line.trim() === '' && (i === 0 || lines[i-1].trim() === '')) {
      continue;
    }
    
    // Eliminar líneas con solo espacios y llaves
    if (line.trim() === '}' || line.trim() === '{') {
      // Verificar si es una llave duplicada
      if (i > 0 && (lines[i-1].trim() === '}' || lines[i-1].trim() === '{')) {
        continue;
      }
    }
    
    // Eliminar llaves extra al final
    if (line.trim() === '}' && i === lines.length - 1) {
      // Verificar si ya hay suficientes llaves cerradas
      let openBraces = 0;
      let closeBraces = 0;
      for (let j = 0; j < fixed.length; j++) {
        const fixedLine = fixed[j];
        openBraces += (fixedLine.match(/\{/g) || []).length;
        closeBraces += (fixedLine.match(/\}/g) || []).length;
      }
      if (closeBraces >= openBraces) {
        continue;
      }
    }
    
    // Limpiar líneas con problemas de sintaxis
    line = line.replace(/\s*\}\s*\}\s*$/, '}');
    line = line.replace(/\s*\}\s*\}\s*\}\s*$/, '}');
    
    // Eliminar comas extra antes de llaves cerradas
    line = line.replace(/,\s*(\}|\])/g, '$1');
    
    // Eliminar líneas duplicadas de dependencias
    if (line.includes('"dependencies":') || line.includes('"devDependencies":')) {
      // Verificar si ya existe esta sección
      const sectionExists = fixed.some(fixedLine => 
        fixedLine.includes(line.trim())
      );
      if (sectionExists) {
        continue;
      }
    }
    
    // Eliminar dependencias duplicadas
    if (line.includes('":') && (line.includes('"^') || line.includes('"~') || line.includes('"*'))) {
      const depName = line.split('":')[0].trim();
      const depExists = fixed.some(fixedLine => 
        fixedLine.includes(depName) && fixedLine.includes('":')
      );
      if (depExists) {
        continue;
      }
    }
    
    fixed.push(line);
  }
  
  return fixed.join('\n');
}

function validateJson(content) {
  try {
    JSON.parse(content);
    return true;
  } catch (error) {
    return false;
  }
}

function fixPackageJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Crear backup
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, content);
    
    // Intentar arreglar la sintaxis
    let fixedContent = fixJsonSyntax(content);
    
    // Verificar que el JSON es válido
    if (!validateJson(fixedContent)) {
      // Si aún no es válido, intentar una limpieza más agresiva
      fixedContent = fixedContent
        .replace(/,\s*(\}|\])\s*(\}|\])/g, '$1$2')
        .replace(/\s*\}\s*\}\s*$/gm, '}')
        .replace(/\s*\}\s*\}\s*\}\s*$/gm, '}')
        .replace(/,\s*$/gm, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n');
    }
    
    // Verificar nuevamente
    if (!validateJson(fixedContent)) {
      logWarning(`⚠️  No se pudo arreglar completamente: ${filePath}`);
      return false;
    }
    
    // Escribir contenido arreglado
    fs.writeFileSync(filePath, fixedContent);
    
    logSuccess(`✅ Arreglado: ${filePath}`);
    logInfo(`   Backup: ${backupPath}`);
    return true;
    
  } catch (error) {
    logError(`Error procesando ${filePath}: ${error.message}`);
    return false;
  }
}

function findProblematicPackageJson(dir) {
  const problematicFiles = [];
  
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
          if (!validateJson(content)) {
            problematicFiles.push(fullPath);
          }
        } catch (error) {
          problematicFiles.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return problematicFiles;
}

function main() {
  log('🔧 Arreglando sintaxis JSON de archivos package.json...', 'bright');
  
  const projectRoot = process.cwd();
  logInfo(`Directorio del proyecto: ${projectRoot}`);
  
  // Encontrar archivos problemáticos
  const problematicFiles = findProblematicPackageJson(projectRoot);
  
  if (problematicFiles.length === 0) {
    logSuccess('✅ No se encontraron archivos package.json con problemas de sintaxis');
    return;
  }
  
  logInfo(`📦 Encontrados ${problematicFiles.length} archivos package.json con problemas:`);
  problematicFiles.forEach(file => {
    const relativePath = path.relative(projectRoot, file);
    log(`   - ${relativePath}`, 'cyan');
  });
  
  // Arreglar archivos
  let fixedCount = 0;
  let failedCount = 0;
  
  for (const file of problematicFiles) {
    if (fixPackageJsonFile(file)) {
      fixedCount++;
    } else {
      failedCount++;
    }
  }
  
  // Resumen final
  log('\n📊 Resumen de arreglo de sintaxis JSON:', 'bright');
  logSuccess(`✅ Archivos arreglados: ${fixedCount}`);
  
  if (failedCount > 0) {
    logWarning(`⚠️  Archivos con problemas persistentes: ${failedCount}`);
  }
  
  // Verificar que todos los archivos son válidos ahora
  const remainingProblematic = findProblematicPackageJson(projectRoot);
  if (remainingProblematic.length > 0) {
    logWarning(`⚠️  Aún quedan ${remainingProblematic.length} archivos problemáticos:`);
    remainingProblematic.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      log(`   - ${relativePath}`, 'red');
    });
  } else {
    logSuccess('🎉 ¡Todos los archivos package.json tienen sintaxis JSON válida!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixJsonSyntax, validateJson, fixPackageJsonFile }; 