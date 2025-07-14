#!/usr/bin/env node

/**
 * Script para limpiar el historial de Git y eliminar secretos
 * Usa git filter-branch para reescribir el historial completo
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

// Patrones para detectar claves API de OpenAI
const OPENAI_API_PATTERNS = [
  /sk-[a-zA-Z0-9]{48}/g,  // Claves API de OpenAI
  /sk-[a-zA-Z0-9]{32}/g,  // Claves API más cortas
  /sk-[a-zA-Z0-9]{20,}/g, // Claves API variables
];

// Archivos específicos mencionados en el error
const CRITICAL_FILES = [
  'clean_secrets.py',
  'lucIA/lucIA.py',
  'lucIA/setup_api.py'
];

function createFilterScript() {
  const filterScript = `#!/bin/bash
# Script para filtrar secretos del historial de Git

# Función para limpiar contenido de archivos
clean_file_content() {
    local file_content="$1"
    
    # Reemplazar claves API de OpenAI
    file_content=$(echo "$file_content" | sed 's/sk-[a-zA-Z0-9]\\{20,\\}/OPENAI_API_KEY_REMOVED/g')
    
    # Reemplazar asignaciones específicas
    file_content=$(echo "$file_content" | sed 's/openai\\.api_key\\s*=\\s*["'"'"']sk-[a-zA-Z0-9]\\{20,\\}["'"'"']/openai.api_key = os.getenv("OPENAI_API_KEY")/g')
    file_content=$(echo "$file_content" | sed 's/api_key\\s*=\\s*["'"'"']sk-[a-zA-Z0-9]\\{20,\\}["'"'"']/api_key = os.getenv("OPENAI_API_KEY")/g')
    
    # Reemplazar en JavaScript/TypeScript
    file_content=$(echo "$file_content" | sed 's/const\\s\\+openai\\s\\*=\\s\\*new\\s\\+OpenAI(\\(["'"'"']sk-[a-zA-Z0-9]\\{20,\\}["'"'"']\\))/const openai = new OpenAI(process.env.OPENAI_API_KEY)/g')
    file_content=$(echo "$file_content" | sed 's/apiKey:\\s\\*["'"'"']sk-[a-zA-Z0-9]\\{20,\\}["'"'"']/apiKey: process.env.OPENAI_API_KEY/g')
    
    echo "$file_content"
}

# Procesar cada archivo en el commit
while read -r file; do
    if [[ -f "$file" ]]; then
        # Verificar si el archivo contiene secretos
        if grep -q "sk-[a-zA-Z0-9]\\{20,\\}" "$file" 2>/dev/null; then
            echo "Cleaning secrets from: $file" >&2
            
            # Leer contenido del archivo
            content=$(cat "$file")
            
            # Limpiar contenido
            cleaned_content=$(clean_file_content "$content")
            
            # Escribir contenido limpio
            echo "$cleaned_content" > "$file"
        fi
    fi
done

echo "Filter script completed" >&2
`;

  fs.writeFileSync('git-filter-secrets.sh', filterScript);
  fs.chmodSync('git-filter-secrets.sh', '755');
  logSuccess('✅ Script de filtrado creado: git-filter-secrets.sh');
}

function backupRepository() {
  logStep('Creando backup del repositorio...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `../MetaversoCryptoWoldVirtual3d-backup-${timestamp}`;
    
    execSync(`cp -r . "${backupDir}"`, { stdio: 'inherit' });
    logSuccess(`✅ Backup creado en: ${backupDir}`);
    return backupDir;
  } catch (error) {
    logError(`Error creando backup: ${error.message}`);
    return null;
  }
}

function cleanGitHistory() {
  logStep('Limpiando historial de Git...');
  
  try {
    // Crear script de filtrado
    createFilterScript();
    
    // Ejecutar git filter-branch
    logInfo('Ejecutando git filter-branch (esto puede tomar varios minutos)...');
    
    const filterCommand = `
      git filter-branch --tree-filter '
        if [ -f "git-filter-secrets.sh" ]; then
          find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.json" | while read file; do
            if grep -q "sk-[a-zA-Z0-9]\\{20,\\}" "$file" 2>/dev/null; then
              echo "Cleaning: $file"
              sed -i "s/sk-[a-zA-Z0-9]\\{20,\\}/OPENAI_API_KEY_REMOVED/g" "$file"
              sed -i "s/openai\\.api_key\\s*=\\s*[\"'\''][^\"'\'']*[\"'\'']/openai.api_key = os.getenv(\"OPENAI_API_KEY\")/g" "$file"
              sed -i "s/api_key\\s*=\\s*[\"'\''][^\"'\'']*[\"'\'']/api_key = os.getenv(\"OPENAI_API_KEY\")/g" "$file"
            fi
          done
        fi
      ' --prune-empty --tag-name-filter cat -- --all
    `;
    
    execSync(filterCommand, { stdio: 'inherit' });
    
    logSuccess('✅ Historial de Git limpiado exitosamente');
    return true;
  } catch (error) {
    logError(`Error limpiando historial: ${error.message}`);
    return false;
  }
}

function forcePush() {
  logStep('Forzando push al repositorio remoto...');
  
  try {
    logWarning('⚠️  ADVERTENCIA: Esto sobrescribirá el historial remoto');
    logWarning('⚠️  Asegúrate de que no hay otros colaboradores trabajando');
    
    // Forzar push
    execSync('git push origin --force --all', { stdio: 'inherit' });
    execSync('git push origin --force --tags', { stdio: 'inherit' });
    
    logSuccess('✅ Push forzado completado exitosamente');
    return true;
  } catch (error) {
    logError(`Error en push forzado: ${error.message}`);
    return false;
  }
}

function cleanup() {
  logStep('Limpiando archivos temporales...');
  
  try {
    // Eliminar script temporal
    if (fs.existsSync('git-filter-secrets.sh')) {
      fs.unlinkSync('git-filter-secrets.sh');
    }
    
    // Limpiar refs de filter-branch
    execSync('git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d', { stdio: 'pipe' });
    
    // Ejecutar garbage collection
    execSync('git reflog expire --expire=now --all', { stdio: 'pipe' });
    execSync('git gc --prune=now --aggressive', { stdio: 'pipe' });
    
    logSuccess('✅ Limpieza completada');
    return true;
  } catch (error) {
    logWarning(`Advertencia en limpieza: ${error.message}`);
    return false;
  }
}

function main() {
  log('🔐 INICIANDO LIMPIEZA COMPLETA DEL HISTORIAL DE GIT', 'bright');
  log('====================================================', 'bright');
  
  const startTime = Date.now();
  
  try {
    // Verificar que estamos en un repositorio Git
    if (!fs.existsSync('.git')) {
      logError('No se encontró un repositorio Git en el directorio actual');
      process.exit(1);
    }
    
    // 1. Crear backup
    const backupDir = backupRepository();
    if (!backupDir) {
      logError('No se pudo crear el backup. Abortando...');
      process.exit(1);
    }
    
    // 2. Limpiar historial
    if (!cleanGitHistory()) {
      logError('Error limpiando el historial. Revisa el backup en: ' + backupDir);
      process.exit(1);
    }
    
    // 3. Limpiar archivos temporales
    cleanup();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log('\n🎉 LIMPIEZA DEL HISTORIAL COMPLETADA', 'bright');
    log('====================================', 'bright');
    log(`⏱️  Tiempo total: ${duration}s`, 'cyan');
    log(`💾 Backup creado en: ${backupDir}`, 'green');
    log(`🔐 Historial limpiado: ✅`, 'green');
    log(`🧹 Archivos temporales: ✅`, 'green');
    
    log('\n🔄 PRÓXIMOS PASOS:', 'bright');
    log('1. Verifica que los cambios son correctos', 'yellow');
    log('2. Ejecuta: git push origin --force --all', 'yellow');
    log('3. Ejecuta: git push origin --force --tags', 'yellow');
    log('4. Si hay problemas, restaura desde el backup', 'yellow');
    
    log('\n⚠️  IMPORTANTE:', 'bright');
    log('- El historial ha sido reescrito completamente', 'red');
    log('- Todos los commits anteriores han sido modificados', 'red');
    log('- Otros colaboradores necesitarán clonar el repo nuevamente', 'red');
    
  } catch (error) {
    logError(`Error en la limpieza del historial: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  createFilterScript,
  backupRepository,
  cleanGitHistory,
  forcePush,
  cleanup,
  main
}; 