#!/usr/bin/env node

/**
 * Script completo para arreglar archivos package.json con problemas complejos
 * Maneja duplicados, sintaxis malformada y estructura incorrecta
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

function fixPackageJsonContent(content) {
  const lines = content.split('\n');
  const fixed = [];
  const seenSections = new Set();
  const seenDependencies = new Set();
  const seenScripts = new Set();
  
  let currentSection = '';
  let inDependencies = false;
  let inDevDependencies = false;
  let inScripts = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Saltar líneas vacías
    if (line === '') {
      continue;
    }
    
    // Manejar secciones principales
    if (line === '"name":' || line === '"version":' || line === '"description":' || line === '"main":' || line === '"author":' || line === '"license":') {
      const section = line.split(':')[0];
      if (!seenSections.has(section)) {
        seenSections.add(section);
        fixed.push(line);
      }
      continue;
    }
    
    // Manejar sección de scripts
    if (line === '"scripts":') {
      if (!seenSections.has('scripts')) {
        seenSections.add('scripts');
        inScripts = true;
        inDependencies = false;
        inDevDependencies = false;
        fixed.push(line);
        fixed.push('  {');
      }
      continue;
    }
    
    // Manejar sección de dependencies
    if (line === '"dependencies":') {
      if (!seenSections.has('dependencies')) {
        seenSections.add('dependencies');
        inDependencies = true;
        inDevDependencies = false;
        inScripts = false;
        fixed.push(line);
        fixed.push('  {');
      }
      continue;
    }
    
    // Manejar sección de devDependencies
    if (line === '"devDependencies":') {
      if (!seenSections.has('devDependencies')) {
        seenSections.add('devDependencies');
        inDevDependencies = true;
        inDependencies = false;
        inScripts = false;
        fixed.push(line);
        fixed.push('  {');
      }
      continue;
    }
    
    // Manejar dependencias
    if (inDependencies || inDevDependencies) {
      if (line.startsWith('"') && line.includes('":')) {
        const depName = line.split('":')[0] + '"';
        if (!seenDependencies.has(depName)) {
          seenDependencies.add(depName);
          fixed.push('    ' + line);
        }
      } else if (line === '},' || line === '}') {
        inDependencies = false;
        inDevDependencies = false;
        fixed.push('  }');
      }
      continue;
    }
    
    // Manejar scripts
    if (inScripts) {
      if (line.startsWith('"') && line.includes('":')) {
        const scriptName = line.split('":')[0] + '"';
        if (!seenScripts.has(scriptName)) {
          seenScripts.add(scriptName);
          fixed.push('    ' + line);
        }
      } else if (line === '},' || line === '}') {
        inScripts = false;
        fixed.push('  }');
      }
      continue;
    }
    
    // Manejar otras líneas
    if (line.startsWith('"') && line.includes('":')) {
      const key = line.split(':')[0];
      if (!seenSections.has(key)) {
        seenSections.add(key);
        fixed.push(line);
      }
    } else if (line === '}' || line === '},') {
      // Solo agregar llaves de cierre si no estamos en una sección
      if (!inDependencies && !inDevDependencies && !inScripts) {
        fixed.push(line);
      }
    } else if (!line.startsWith('"') && !line.includes(':')) {
      // Líneas que no son propiedades JSON válidas
      continue;
    }
  }
  
  // Asegurar que el JSON termine correctamente
  let result = fixed.join('\n');
  
  // Limpiar comas extra
  result = result.replace(/,\s*(\}|\])/g, '$1');
  
  // Asegurar que termina con }
  if (!result.trim().endsWith('}')) {
    result = result.trim() + '\n}';
  }
  
  return result;
}

function createCleanPackageJson(filePath) {
  const fileName = path.basename(path.dirname(filePath));
  
  // Crear un package.json limpio basado en el nombre del directorio
  const cleanContent = {
    name: `@metaverso/${fileName}`,
    version: "1.0.0",
    description: `Módulo ${fileName} del Metaverso Crypto World Virtual 3D`,
    main: "src/index.ts",
    scripts: {
      "dev": "vite",
      "build": "tsc && vite build",
      "test": "vitest",
      "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
    },
    dependencies: {
      "react": "^18.3.0",
      "react-dom": "^18.3.0"
    },
    devDependencies: {
      "@types/node": "^20.0.0",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      "@typescript-eslint/parser": "^6.0.0",
      "eslint": "^8.45.0",
      "typescript": "^5.0.0"
    },
    keywords: [
      "metaverso",
      "web3",
      "blockchain",
      "3d"
    ],
    author: "Metaverso Crypto World Team",
    license: "MIT"
  };
  
  return JSON.stringify(cleanContent, null, 2);
}

function fixPackageJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Crear backup
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, content);
    
    // Intentar arreglar el contenido
    let fixedContent = fixPackageJsonContent(content);
    
    // Verificar que el JSON es válido
    try {
      JSON.parse(fixedContent);
    } catch (error) {
      // Si no se puede arreglar, crear uno limpio
      logWarning(`⚠️  Creando package.json limpio para: ${filePath}`);
      fixedContent = createCleanPackageJson(filePath);
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
          JSON.parse(content);
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
  log('🔧 Arreglando archivos package.json problemáticos...', 'bright');
  
  const projectRoot = process.cwd();
  logInfo(`Directorio del proyecto: ${projectRoot}`);
  
  // Encontrar archivos problemáticos
  const problematicFiles = findProblematicPackageJson(projectRoot);
  
  if (problematicFiles.length === 0) {
    logSuccess('✅ No se encontraron archivos package.json con problemas');
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
  log('\n📊 Resumen de arreglo de package.json:', 'bright');
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
    logSuccess('🎉 ¡Todos los archivos package.json son válidos ahora!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixPackageJsonContent, createCleanPackageJson, fixPackageJsonFile }; 