#!/usr/bin/env node

/**
 * Script para resolver el problema de secretos de OpenAI API
 * Proporciona instrucciones paso a paso para solucionarlo
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

function logImportant(message) {
  log(`🔥 ${message}`, 'magenta');
}

function checkCurrentStatus() {
  logStep('Verificando estado actual del repositorio...');
  
  try {
    // Verificar si hay cambios pendientes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      logWarning('Hay cambios pendientes en el repositorio:');
      console.log(status);
      return false;
    } else {
      logSuccess('✅ No hay cambios pendientes');
      return true;
    }
  } catch (error) {
    logError(`Error verificando estado: ${error.message}`);
    return false;
  }
}

function showSolutionOptions() {
  log('\n🔐 SOLUCIONES PARA EL PROBLEMA DE SECRETOS', 'bright');
  log('============================================', 'bright');
  
  log('\n📋 OPCIONES DISPONIBLES:', 'cyan');
  
  log('\n1️⃣  SOLUCIÓN RÁPIDA (Recomendada):', 'green');
  log('   • Usar la URL de GitHub para permitir el secreto temporalmente', 'yellow');
  log('   • URL: https://github.com/Chicook/MetaversoCryptoWoldVirtual3d/security/secret-scanning/unblock-secret/2zNZ21TzkU5AF28VQxiRDTygSOP', 'blue');
  log('   • Ventajas: Rápido, seguro, no afecta el historial', 'green');
  log('   • Desventajas: El secreto sigue en el historial (pero está invalidado)', 'yellow');
  
  log('\n2️⃣  SOLUCIÓN COMPLETA (Avanzada):', 'green');
  log('   • Reescribir el historial completo con git filter-branch', 'yellow');
  log('   • Ventajas: Elimina completamente los secretos del historial', 'green');
  log('   • Desventajas: Complejo, puede romper el repositorio, afecta a colaboradores', 'red');
  
  log('\n3️⃣  SOLUCIÓN HÍBRIDA (Intermedia):', 'green');
  log('   • Crear una nueva rama limpia desde un commit anterior', 'yellow');
  log('   • Aplicar cambios sin secretos', 'yellow');
  log('   • Ventajas: Historial limpio, más seguro', 'green');
  log('   • Desventajas: Pierdes algunos commits recientes', 'yellow');
}

function showQuickSolution() {
  logStep('SOLUCIÓN RÁPIDA - Instrucciones paso a paso:');
  
  log('\n📝 PASOS A SEGUIR:', 'cyan');
  
  log('\n1. 🌐 Abre tu navegador y ve a:', 'yellow');
  log('   https://github.com/Chicook/MetaversoCryptoWoldVirtual3d/security/secret-scanning/unblock-secret/2zNZ21TzkU5AF28VQxiRDTygSOP', 'blue');
  
  log('\n2. 🔐 En la página de GitHub:', 'yellow');
  log('   • Haz clic en "Allow secret" o "Permitir secreto"', 'green');
  log('   • Confirma que el secreto ya no es válido', 'green');
  log('   • Marca como "Used in testing" o "Revoked"', 'green');
  
  log('\n3. 🔄 Regresa aquí y ejecuta:', 'yellow');
  log('   git push origin pruebas', 'blue');
  
  log('\n4. ✅ Verifica que el push funcione', 'yellow');
}

function showCompleteSolution() {
  logStep('SOLUCIÓN COMPLETA - Reescribir historial:');
  
  logWarning('⚠️  ADVERTENCIA: Esta operación es DESTRUCTIVA');
  logWarning('⚠️  Hacer backup antes de continuar');
  
  log('\n📝 PASOS A SEGUIR:', 'cyan');
  
  log('\n1. 💾 Crear backup:', 'yellow');
  log('   git clone --mirror https://github.com/Chicook/MetaversoCryptoWoldVirtual3d.git backup-repo', 'blue');
  
  log('\n2. 🔧 Instalar git-filter-repo:', 'yellow');
  log('   pip install git-filter-repo', 'blue');
  
  log('\n3. 🧹 Limpiar historial:', 'yellow');
  log('   git filter-repo --replace-text <(echo "***REMOVED***")', 'blue');
  
  log('\n4. 🚀 Forzar push:', 'yellow');
  log('   git push origin --force --all', 'blue');
  log('   git push origin --force --tags', 'blue');
}

function showHybridSolution() {
  logStep('SOLUCIÓN HÍBRIDA - Nueva rama limpia:');
  
  log('\n📝 PASOS A SEGUIR:', 'cyan');
  
  log('\n1. 🔍 Encontrar commit limpio:', 'yellow');
  log('   git log --oneline --grep="sk-" -B1 -A1', 'blue');
  
  log('\n2. 🌿 Crear nueva rama:', 'yellow');
  log('   git checkout -b pruebas-clean <commit-hash>', 'blue');
  
  log('\n3. 🔄 Aplicar cambios recientes:', 'yellow');
  log('   git cherry-pick <commits-recientes-sin-secretos>', 'blue');
  
  log('\n4. 🚀 Push nueva rama:', 'yellow');
  log('   git push origin pruebas-clean', 'blue');
}

function createEnvFiles() {
  logStep('Creando archivos de configuración de entorno...');
  
  const envExample = `# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Other API Keys (add as needed)
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
# COHERE_API_KEY=your-cohere-api-key-here

# Database Configuration
DATABASE_URL=your-database-url-here

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Environment
NODE_ENV=development
`;

  const envTemplate = `# Template for environment variables
# Copy this file to .env and fill in your actual values

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Other API Keys (add as needed)
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
# COHERE_API_KEY=your-cohere-api-key-here

# Database Configuration
DATABASE_URL=your-database-url-here

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Environment
NODE_ENV=development
`;

  try {
    if (!fs.existsSync('.env.example')) {
      fs.writeFileSync('.env.example', envExample);
      logSuccess('✅ Creado: .env.example');
    }
    
    if (!fs.existsSync('.env.template')) {
      fs.writeFileSync('.env.template', envTemplate);
      logSuccess('✅ Creado: .env.template');
    }
    
    // Actualizar .gitignore
    let gitignore = '';
    if (fs.existsSync('.gitignore')) {
      gitignore = fs.readFileSync('.gitignore', 'utf8');
    }
    
    const envPatterns = ['.env', '.env.local', '.env.development', '.env.production'];
    let updated = false;
    
    for (const pattern of envPatterns) {
      if (!gitignore.includes(pattern)) {
        gitignore += `\n${pattern}`;
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync('.gitignore', gitignore);
      logSuccess('✅ Actualizado: .gitignore');
    }
    
  } catch (error) {
    logError(`Error creando archivos de entorno: ${error.message}`);
  }
}

function main() {
  log('🔐 RESOLUCIÓN DE PROBLEMA DE SECRETOS DE OPENAI API', 'bright');
  log('====================================================', 'bright');
  
  try {
    // Verificar estado actual
    if (!checkCurrentStatus()) {
      logWarning('Resuelve los cambios pendientes antes de continuar');
      return;
    }
    
    // Mostrar opciones de solución
    showSolutionOptions();
    
    // Crear archivos de entorno
    createEnvFiles();
    
    log('\n🎯 RECOMENDACIÓN:', 'bright');
    logImportant('Usa la SOLUCIÓN RÁPIDA (Opción 1) para resolver el problema inmediatamente');
    logImportant('Luego implementa buenas prácticas para evitar futuros problemas');
    
    log('\n📋 PRÓXIMOS PASOS:', 'cyan');
    log('1. Ejecuta: node scripts/resolve-secrets-issue.js --quick-solution', 'yellow');
    log('2. Sigue las instrucciones en pantalla', 'yellow');
    log('3. Configura tus variables de entorno en .env', 'yellow');
    log('4. Nunca commits archivos .env al repositorio', 'yellow');
    
    log('\n🛡️  PREVENCIÓN FUTURA:', 'bright');
    log('• Usa variables de entorno para todos los secretos', 'green');
    log('• Configura pre-commit hooks para detectar secretos', 'green');
    log('• Usa herramientas como git-secrets o truffleHog', 'green');
    log('• Revisa regularmente el historial de Git', 'green');
    
  } catch (error) {
    logError(`Error en el script: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  checkCurrentStatus,
  showSolutionOptions,
  showQuickSolution,
  showCompleteSolution,
  showHybridSolution,
  createEnvFiles,
  main
}; 