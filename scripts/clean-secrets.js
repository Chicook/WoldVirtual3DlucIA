#!/usr/bin/env node

/**
 * Script para limpiar secretos de OpenAI API del código
 * Reemplaza claves API hardcodeadas con variables de entorno
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

function logStep(message) {
  log(`\n🔧 ${message}`, 'bright');
}

// Patrones para detectar claves API de OpenAI
const OPENAI_API_PATTERNS = [
  /sk-[a-zA-Z0-9]{48}/g,  // Claves API de OpenAI
  /sk-[a-zA-Z0-9]{32}/g,  // Claves API más cortas
  /sk-[a-zA-Z0-9]{20,}/g, // Claves API variables
  /"sk-[a-zA-Z0-9]{20,}"/g, // Claves API entre comillas
  /'sk-[a-zA-Z0-9]{20,}'/g, // Claves API entre comillas simples
  /openai_api_key\s*[:=]\s*["']sk-[a-zA-Z0-9]{20,}["']/gi, // Asignaciones de API key
  /OPENAI_API_KEY\s*[:=]\s*["']sk-[a-zA-Z0-9]{20,}["']/gi, // Variables de entorno
];

// Archivos específicos mencionados en el error
const CRITICAL_FILES = [
  'clean_secrets.py',
  'lucIA/lucIA.py',
  'lucIA/setup_api.py'
];

function cleanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logWarning(`⚠️  Archivo no encontrado: ${filePath}`);
      return false;
    }

    logInfo(`Procesando: ${filePath}`);
    
    // Crear backup
    const backupPath = `${filePath}.backup`;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, originalContent);
    
    let cleanedContent = originalContent;
    let secretsFound = 0;
    
    // Reemplazar patrones de claves API
    for (const pattern of OPENAI_API_PATTERNS) {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        secretsFound += matches.length;
        
        // Reemplazar con variable de entorno apropiada
        cleanedContent = cleanedContent.replace(pattern, (match) => {
          if (match.includes('"') || match.includes("'")) {
            // Si está entre comillas, reemplazar con variable de entorno
            return 'process.env.OPENAI_API_KEY || "your-openai-api-key-here"';
          } else {
            // Si no está entre comillas, mantener el patrón pero limpiar
            return 'process.env.OPENAI_API_KEY';
          }
        });
      }
    }
    
    // Reemplazamientos específicos para Python
    if (filePath.endsWith('.py')) {
      cleanedContent = cleanedContent.replace(
        /import os/g,
        'import os\nfrom dotenv import load_dotenv\n\nload_dotenv()'
      );
      
      cleanedContent = cleanedContent.replace(
        /openai\.api_key\s*=\s*["']sk-[a-zA-Z0-9]{20,}["']/g,
        'openai.api_key = os.getenv("OPENAI_API_KEY")'
      );
      
      cleanedContent = cleanedContent.replace(
        /api_key\s*=\s*["']sk-[a-zA-Z0-9]{20,}["']/g,
        'api_key = os.getenv("OPENAI_API_KEY")'
      );
    }
    
    // Reemplazamientos específicos para JavaScript/TypeScript
    if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      cleanedContent = cleanedContent.replace(
        /const\s+openai\s*=\s*new\s+OpenAI\(["']sk-[a-zA-Z0-9]{20,}["']\)/g,
        'const openai = new OpenAI(process.env.OPENAI_API_KEY)'
      );
      
      cleanedContent = cleanedContent.replace(
        /apiKey:\s*["']sk-[a-zA-Z0-9]{20,}["']/g,
        'apiKey: process.env.OPENAI_API_KEY'
      );
    }
    
    if (secretsFound > 0) {
      fs.writeFileSync(filePath, cleanedContent);
      logSuccess(`✅ Limpiado: ${filePath} (${secretsFound} secretos encontrados)`);
      logInfo(`   Backup: ${backupPath}`);
      return true;
    } else {
      logInfo(`ℹ️  No se encontraron secretos en: ${filePath}`);
      // Eliminar backup si no se encontraron secretos
      try {
        fs.unlinkSync(backupPath);
      } catch (error) {
        // Ignorar error si el archivo no existe
      }
      return false;
    }
    
  } catch (error) {
    logError(`Error procesando ${filePath}: ${error.message}`);
    return false;
  }
}

function findFilesWithSecrets(dir) {
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
          
          // Verificar si contiene patrones de claves API
          for (const pattern of OPENAI_API_PATTERNS) {
            if (pattern.test(content)) {
              files.push(fullPath);
              break;
            }
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

function createEnvTemplate() {
  const envTemplate = `# OpenAI API Configuration
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
  
  const envFiles = ['.env', '.env.example', '.env.template'];
  
  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      fs.writeFileSync(envFile, envTemplate);
      logSuccess(`✅ Creado: ${envFile}`);
    }
  }
}

function updateGitignore() {
  const gitignorePath = '.gitignore';
  const envPatterns = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '*.backup'
  ];
  
  try {
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    let updated = false;
    for (const pattern of envPatterns) {
      if (!gitignoreContent.includes(pattern)) {
        gitignoreContent += `\n${pattern}`;
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      logSuccess(`✅ Actualizado: ${gitignorePath}`);
    } else {
      logInfo(`ℹ️  ${gitignorePath} ya está actualizado`);
    }
  } catch (error) {
    logError(`Error actualizando ${gitignorePath}: ${error.message}`);
  }
}

function main() {
  log('🔐 INICIANDO LIMPIEZA DE SECRETOS', 'bright');
  log('==================================', 'bright');
  
  const startTime = Date.now();
  
  try {
    // 1. Limpiar archivos críticos mencionados en el error
    logStep('Limpiando archivos críticos...');
    let criticalCleaned = 0;
    
    for (const file of CRITICAL_FILES) {
      if (cleanFile(file)) {
        criticalCleaned++;
      }
    }
    
    // 2. Buscar otros archivos con secretos
    logStep('Buscando otros archivos con secretos...');
    const filesWithSecrets = findFilesWithSecrets(process.cwd());
    
    let otherCleaned = 0;
    for (const file of filesWithSecrets) {
      if (!CRITICAL_FILES.includes(file)) {
        if (cleanFile(file)) {
          otherCleaned++;
        }
      }
    }
    
    // 3. Crear plantillas de variables de entorno
    logStep('Creando plantillas de variables de entorno...');
    createEnvTemplate();
    
    // 4. Actualizar .gitignore
    logStep('Actualizando .gitignore...');
    updateGitignore();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log('\n🎉 RESUMEN DE LIMPIEZA DE SECRETOS', 'bright');
    log('====================================', 'bright');
    log(`⏱️  Tiempo total: ${duration}s`, 'cyan');
    log(`🔐 Archivos críticos limpiados: ${criticalCleaned}`, 'green');
    log(`📁 Otros archivos limpiados: ${otherCleaned}`, 'green');
    log(`📦 Total de archivos procesados: ${criticalCleaned + otherCleaned}`, 'blue');
    
    if (criticalCleaned > 0 || otherCleaned > 0) {
      log('\n⚠️  IMPORTANTE: Configura tus variables de entorno', 'yellow');
      log('1. Copia .env.example a .env', 'yellow');
      log('2. Agrega tu clave API de OpenAI real', 'yellow');
      log('3. Nunca commits .env al repositorio', 'yellow');
      
      log('\n🔄 Ahora puedes intentar hacer push nuevamente', 'green');
    } else {
      log('\n✅ No se encontraron secretos para limpiar', 'green');
    }
    
  } catch (error) {
    logError(`Error en la limpieza de secretos: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = {
  cleanFile,
  findFilesWithSecrets,
  createEnvTemplate,
  updateGitignore,
  main
}; 