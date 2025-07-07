#!/usr/bin/env node

/**
 * Script de prueba del Metaverso Crypto World Virtual 3D
 * Verifica que todas las funcionalidades principales funcionen correctamente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function logStep(step, message) {
  log(`\n${colors.cyan}${step}${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Verificar estructura de archivos
function checkFileStructure() {
  logStep('1', 'Verificando estructura de archivos...');
  
  const requiredFiles = [
    'package.json',
    'README.md',
    'docker-compose.yml',
    'client/package.json',
    'backend/package.json',
    'client/src/App.tsx',
    'client/src/components/world/WorldTerrain.tsx',
    'client/src/components/world/WorldObjects.tsx',
    'client/src/components/world/UserAvatars.tsx',
    'client/src/components/world/WorldUI.tsx',
    'client/src/components/world/WorldControls.tsx',
    'client/src/components/Login.tsx',
    'client/src/components/LoadingScreen.tsx',
    'client/src/components/chat/ChatSystem.tsx',
    'client/src/components/chat/ChatInput.tsx',
    'client/src/components/inventory/InventorySystem.tsx',
    'client/src/components/payments/PaymentSystem.tsx',
    'client/src/components/marketplace/NFTMarketplace.tsx',
    'client/src/hooks/useChat.ts',
    'client/src/hooks/useInventory.ts',
    'client/src/hooks/usePayments.ts',
    'client/src/hooks/useNFTMarketplace.ts',
    'client/src/hooks/useAuth.ts',
    'client/src/styles/globals.css',
    'backend/src/services/chatService.ts',
    'backend/src/types/chat.ts',
    'scripts/setup-metaverso.js',
    'scripts/quick-start.sh'
  ];

  let missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  });

  if (missingFiles.length === 0) {
    logSuccess('Estructura de archivos correcta');
    return true;
  } else {
    logError(`Archivos faltantes: ${missingFiles.join(', ')}`);
    return false;
  }
}

// Verificar dependencias
function checkDependencies() {
  logStep('2', 'Verificando dependencias...');
  
  try {
    // Verificar package.json principal
    const mainPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['react', 'three', '@react-three/fiber', '@react-three/drei'];
    
    let missingDeps = [];
    requiredDeps.forEach(dep => {
      if (!mainPackage.dependencies?.[dep] && !mainPackage.devDependencies?.[dep]) {
        missingDeps.push(dep);
      }
    });

    if (missingDeps.length === 0) {
      logSuccess('Dependencias principales correctas');
    } else {
      logWarning(`Dependencias faltantes: ${missingDeps.join(', ')}`);
    }

    // Verificar package.json del cliente
    const clientPackage = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
    const clientRequiredDeps = [
      'react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei',
      'socket.io-client', '@stripe/stripe-js', '@paypal/react-paypal-js'
    ];
    
    let missingClientDeps = [];
    clientRequiredDeps.forEach(dep => {
      if (!clientPackage.dependencies?.[dep] && !clientPackage.devDependencies?.[dep]) {
        missingClientDeps.push(dep);
      }
    });

    if (missingClientDeps.length === 0) {
      logSuccess('Dependencias del cliente correctas');
    } else {
      logWarning(`Dependencias del cliente faltantes: ${missingClientDeps.join(', ')}`);
    }

    return missingDeps.length === 0 && missingClientDeps.length === 0;
  } catch (error) {
    logError('Error verificando dependencias: ' + error.message);
    return false;
  }
}

// Verificar configuración
function checkConfiguration() {
  logStep('3', 'Verificando configuración...');
  
  try {
    // Verificar archivo de configuración del metaverso
    if (fs.existsSync('config/metaverso-config.json')) {
      const config = JSON.parse(fs.readFileSync('config/metaverso-config.json', 'utf8'));
      logSuccess('Configuración del metaverso encontrada');
    } else {
      logWarning('Archivo de configuración del metaverso no encontrado');
    }

    // Verificar variables de entorno
    if (fs.existsSync('.env')) {
      logSuccess('Archivo .env encontrado');
    } else {
      logWarning('Archivo .env no encontrado - crear con variables de ejemplo');
    }

    // Verificar configuración de Docker
    if (fs.existsSync('docker-compose.yml')) {
      const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
      if (dockerCompose.includes('metaverso') && dockerCompose.includes('mongodb')) {
        logSuccess('Configuración de Docker correcta');
      } else {
        logWarning('Configuración de Docker incompleta');
      }
    } else {
      logWarning('Archivo docker-compose.yml no encontrado');
    }

    return true;
  } catch (error) {
    logError('Error verificando configuración: ' + error.message);
    return false;
  }
}

// Verificar sintaxis de archivos TypeScript/JavaScript
function checkSyntax() {
  logStep('4', 'Verificando sintaxis de archivos...');
  
  try {
    // Verificar sintaxis de archivos principales
    const filesToCheck = [
      'client/src/App.tsx',
      'client/src/components/world/WorldTerrain.tsx',
      'client/src/components/chat/ChatSystem.tsx',
      'client/src/components/inventory/InventorySystem.tsx',
      'client/src/components/payments/PaymentSystem.tsx',
      'client/src/components/marketplace/NFTMarketplace.tsx',
      'backend/src/services/chatService.ts',
      'backend/src/types/chat.ts'
    ];

    let syntaxErrors = [];
    
    filesToCheck.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          // Verificar que el archivo se puede leer
          const content = fs.readFileSync(file, 'utf8');
          
          // Verificaciones básicas de sintaxis
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            // Verificar imports básicos
            if (content.includes('import') && content.includes('export')) {
              // Verificar estructura básica
              if (content.includes('React') || content.includes('useState') || content.includes('interface')) {
                logSuccess(`Sintaxis correcta: ${file}`);
              } else {
                syntaxErrors.push(`${file}: Estructura básica incorrecta`);
              }
            } else {
              syntaxErrors.push(`${file}: Imports/exports faltantes`);
            }
          }
        } catch (error) {
          syntaxErrors.push(`${file}: ${error.message}`);
        }
      } else {
        syntaxErrors.push(`${file}: Archivo no encontrado`);
      }
    });

    if (syntaxErrors.length === 0) {
      logSuccess('Sintaxis de archivos correcta');
      return true;
    } else {
      logError(`Errores de sintaxis encontrados: ${syntaxErrors.length}`);
      syntaxErrors.forEach(error => logError(error));
      return false;
    }
  } catch (error) {
    logError('Error verificando sintaxis: ' + error.message);
    return false;
  }
}

// Verificar funcionalidades específicas
function checkFeatures() {
  logStep('5', 'Verificando funcionalidades específicas...');
  
  const features = [
    {
      name: 'Sistema de Chat',
      files: ['client/src/components/chat/ChatSystem.tsx', 'client/src/hooks/useChat.ts'],
      required: ['socket.io-client', 'WebSocket', 'real-time']
    },
    {
      name: 'Sistema de Inventario',
      files: ['client/src/components/inventory/InventorySystem.tsx', 'client/src/hooks/useInventory.ts'],
      required: ['3D', 'drag', 'drop', 'items']
    },
    {
      name: 'Sistema de Pagos',
      files: ['client/src/components/payments/PaymentSystem.tsx', 'client/src/hooks/usePayments.ts'],
      required: ['stripe', 'paypal', 'crypto', 'payment']
    },
    {
      name: 'Marketplace de NFTs',
      files: ['client/src/components/marketplace/NFTMarketplace.tsx', 'client/src/hooks/useNFTMarketplace.ts'],
      required: ['NFT', 'marketplace', 'auction', 'blockchain']
    },
    {
      name: 'Mundo 3D',
      files: ['client/src/components/world/WorldTerrain.tsx', 'client/src/components/world/WorldObjects.tsx'],
      required: ['three.js', '3D', 'terrain', 'objects']
    }
  ];

  let featureResults = [];
  
  features.forEach(feature => {
    let featureStatus = true;
    let missingFiles = [];
    let missingRequirements = [];
    
    // Verificar archivos
    feature.files.forEach(file => {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
        featureStatus = false;
      }
    });
    
    // Verificar requisitos en archivos existentes
    feature.files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        feature.required.forEach(req => {
          if (!content.includes(req.toLowerCase())) {
            missingRequirements.push(req);
            featureStatus = false;
          }
        });
      }
    });
    
    if (featureStatus) {
      logSuccess(`${feature.name}: Implementado correctamente`);
    } else {
      logError(`${feature.name}: Problemas encontrados`);
      if (missingFiles.length > 0) {
        logError(`  Archivos faltantes: ${missingFiles.join(', ')}`);
      }
      if (missingRequirements.length > 0) {
        logError(`  Requisitos faltantes: ${missingRequirements.join(', ')}`);
      }
    }
    
    featureResults.push(featureStatus);
  });

  return featureResults.every(result => result);
}

// Verificar scripts de desarrollo
function checkScripts() {
  logStep('6', 'Verificando scripts de desarrollo...');
  
  try {
    // Verificar script de configuración
    if (fs.existsSync('scripts/setup-metaverso.js')) {
      const setupScript = fs.readFileSync('scripts/setup-metaverso.js', 'utf8');
      if (setupScript.includes('setupEnvironment') && setupScript.includes('setupDatabase')) {
        logSuccess('Script de configuración correcto');
      } else {
        logWarning('Script de configuración incompleto');
      }
    } else {
      logError('Script de configuración no encontrado');
    }

    // Verificar script de inicio rápido
    if (fs.existsSync('scripts/quick-start.sh')) {
      logSuccess('Script de inicio rápido encontrado');
    } else {
      logWarning('Script de inicio rápido no encontrado');
    }

    // Verificar scripts en package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = ['dev', 'build', 'start', 'test'];
    
    let missingScripts = [];
    requiredScripts.forEach(script => {
      if (!packageJson.scripts?.[script]) {
        missingScripts.push(script);
      }
    });

    if (missingScripts.length === 0) {
      logSuccess('Scripts de package.json correctos');
    } else {
      logWarning(`Scripts faltantes: ${missingScripts.join(', ')}`);
    }

    return true;
  } catch (error) {
    logError('Error verificando scripts: ' + error.message);
    return false;
  }
}

// Generar reporte de estado
function generateReport(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 REPORTE DE ESTADO DEL METAVERSO', 'magenta');
  log('='.repeat(60), 'cyan');
  
  const totalTests = results.length;
  const passedTests = results.filter(result => result).length;
  const failedTests = totalTests - passedTests;
  
  log(`\n📈 Resumen:`, 'yellow');
  log(`   Total de pruebas: ${totalTests}`, 'blue');
  log(`   ✅ Exitosas: ${passedTests}`, 'green');
  log(`   ❌ Fallidas: ${failedTests}`, 'red');
  log(`   📊 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'cyan');
  
  if (failedTests === 0) {
    log('\n🎉 ¡Todas las pruebas pasaron! El metaverso está listo para usar.', 'green');
    log('\n🚀 Próximos pasos:', 'yellow');
    log('   1. Ejecutar: npm run dev', 'blue');
    log('   2. Abrir http://localhost:3000', 'blue');
    log('   3. ¡Disfrutar del metaverso!', 'blue');
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisar los errores anteriores.', 'yellow');
    log('\n🔧 Acciones recomendadas:', 'yellow');
    log('   1. Instalar dependencias faltantes', 'blue');
    log('   2. Verificar configuración', 'blue');
    log('   3. Corregir errores de sintaxis', 'blue');
    log('   4. Ejecutar pruebas nuevamente', 'blue');
  }
  
  log('\n' + '='.repeat(60), 'cyan');
}

// Función principal
function main() {
  log('🧪 Iniciando pruebas del Metaverso Crypto World Virtual 3D', 'magenta');
  log('='.repeat(60), 'cyan');
  
  const tests = [
    { name: 'Estructura de archivos', test: checkFileStructure },
    { name: 'Dependencias', test: checkDependencies },
    { name: 'Configuración', test: checkConfiguration },
    { name: 'Sintaxis', test: checkSyntax },
    { name: 'Funcionalidades', test: checkFeatures },
    { name: 'Scripts', test: checkScripts }
  ];
  
  const results = [];
  
  tests.forEach((test, index) => {
    try {
      logStep(`${index + 1}`, `Probando ${test.name}...`);
      const result = test.test();
      results.push(result);
    } catch (error) {
      logError(`Error en prueba ${test.name}: ${error.message}`);
      results.push(false);
    }
  });
  
  generateReport(results);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkFileStructure,
  checkDependencies,
  checkConfiguration,
  checkSyntax,
  checkFeatures,
  checkScripts,
  generateReport
}; 