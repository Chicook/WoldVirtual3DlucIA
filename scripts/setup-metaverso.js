#!/usr/bin/env node

/**
 * Script de configuración del Metaverso Crypto World Virtual 3D
 * Configura automáticamente todo el entorno de desarrollo
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

// Verificar si un comando existe
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Verificar dependencias del sistema
function checkSystemDependencies() {
  logStep('1', 'Verificando dependencias del sistema...');
  
  const dependencies = [
    { name: 'Node.js', command: 'node', minVersion: '16.0.0' },
    { name: 'npm', command: 'npm', minVersion: '8.0.0' },
    { name: 'Git', command: 'git', minVersion: '2.0.0' }
  ];

  let allDependenciesMet = true;

  dependencies.forEach(dep => {
    if (commandExists(dep.command)) {
      try {
        const version = execSync(`${dep.command} --version`, { encoding: 'utf8' }).trim();
        logSuccess(`${dep.name}: ${version}`);
      } catch {
        logWarning(`${dep.name}: Versión no verificable`);
      }
    } else {
      logError(`${dep.name} no está instalado`);
      allDependenciesMet = false;
    }
  });

  return allDependenciesMet;
}

// Instalar dependencias del proyecto
function installDependencies() {
  logStep('2', 'Instalando dependencias del proyecto...');
  
  try {
    // Verificar si existe package.json
    if (!fs.existsSync('package.json')) {
      logError('No se encontró package.json en el directorio actual');
      return false;
    }

    logInfo('Instalando dependencias con npm...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Dependencias instaladas correctamente');
    
    return true;
  } catch (error) {
    logError('Error instalando dependencias: ' + error.message);
    return false;
  }
}

// Configurar variables de entorno
function setupEnvironment() {
  logStep('3', 'Configurando variables de entorno...');
  
  const envTemplate = `# Configuración del Metaverso Crypto World Virtual 3D
# ============================================================================

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
MONGODB_URI=mongodb://localhost:27017/metaverso
REDIS_URL=redis://localhost:6379

# Configuración de blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Configuración de IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/
ARWEAVE_GATEWAY=https://arweave.net

# Configuración de autenticación
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Configuración de WebSocket
WS_PORT=3001

# Configuración de almacenamiento
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=metaverso-assets

# Configuración de analytics
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token

# Configuración de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Configuración de pagos
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Configuración de redes sociales
DISCORD_WEBHOOK_URL=your-discord-webhook-url
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret

# Configuración de seguridad
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Configuración de desarrollo
DEBUG=true
LOG_LEVEL=debug
`;

  try {
    if (!fs.existsSync('.env')) {
      fs.writeFileSync('.env', envTemplate);
      logSuccess('Archivo .env creado con configuración de ejemplo');
      logWarning('Recuerda actualizar las variables de entorno con tus valores reales');
    } else {
      logInfo('Archivo .env ya existe');
    }
    
    return true;
  } catch (error) {
    logError('Error creando archivo .env: ' + error.message);
    return false;
  }
}

// Configurar base de datos
function setupDatabase() {
  logStep('4', 'Configurando base de datos...');
  
  try {
    // Crear directorio de datos si no existe
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logSuccess('Directorio de datos creado');
    }

    // Crear archivos de configuración de base de datos
    const dbConfig = {
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/metaverso',
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      }
    };

    fs.writeFileSync(
      path.join(dataDir, 'database-config.json'),
      JSON.stringify(dbConfig, null, 2)
    );
    
    logSuccess('Configuración de base de datos creada');
    logWarning('Asegúrate de tener MongoDB y Redis ejecutándose localmente');
    
    return true;
  } catch (error) {
    logError('Error configurando base de datos: ' + error.message);
    return false;
  }
}

// Configurar blockchain
function setupBlockchain() {
  logStep('5', 'Configurando blockchain...');
  
  try {
    const blockchainDir = path.join(__dirname, '..', 'bloc');
    if (!fs.existsSync(blockchainDir)) {
      fs.mkdirSync(blockchainDir, { recursive: true });
    }

    // Crear configuración de redes
    const networksConfig = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        explorer: 'https://etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        }
      },
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        }
      },
      bsc: {
        chainId: 56,
        name: 'Binance Smart Chain',
        rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
        explorer: 'https://bscscan.com',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        }
      }
    };

    fs.writeFileSync(
      path.join(blockchainDir, 'networks.json'),
      JSON.stringify(networksConfig, null, 2)
    );
    
    logSuccess('Configuración de blockchain creada');
    
    return true;
  } catch (error) {
    logError('Error configurando blockchain: ' + error.message);
    return false;
  }
}

// Configurar assets
function setupAssets() {
  logStep('6', 'Configurando assets...');
  
  try {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const subdirs = ['models', 'textures', 'audio', 'images'];
    
    subdirs.forEach(subdir => {
      const fullPath = path.join(assetsDir, subdir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        logSuccess(`Directorio ${subdir} creado`);
      }
    });

    // Crear archivo de configuración de assets
    const assetsConfig = {
      models: {
        path: './models',
        formats: ['glb', 'gltf', 'obj'],
        maxSize: '50MB'
      },
      textures: {
        path: './textures',
        formats: ['jpg', 'png', 'webp'],
        maxSize: '10MB'
      },
      audio: {
        path: './audio',
        formats: ['mp3', 'wav', 'ogg'],
        maxSize: '20MB'
      },
      images: {
        path: './images',
        formats: ['jpg', 'png', 'webp', 'svg'],
        maxSize: '5MB'
      }
    };

    fs.writeFileSync(
      path.join(assetsDir, 'assets.config.json'),
      JSON.stringify(assetsConfig, null, 2)
    );
    
    logSuccess('Configuración de assets creada');
    
    return true;
  } catch (error) {
    logError('Error configurando assets: ' + error.message);
    return false;
  }
}

// Crear scripts de desarrollo
function createDevScripts() {
  logStep('7', 'Creando scripts de desarrollo...');
  
  try {
    const scriptsDir = path.join(__dirname, '..', 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // Script para iniciar el servidor de desarrollo
    const devScript = `#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor de desarrollo del Metaverso...');

// Iniciar backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit'
});

// Iniciar frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'client'),
  stdio: 'inherit'
});

// Manejar cierre
process.on('SIGINT', () => {
  console.log('\\n🛑 Cerrando servidores...');
  backend.kill();
  frontend.kill();
  process.exit();
});
`;

    fs.writeFileSync(path.join(scriptsDir, 'dev.js'), devScript);
    fs.chmodSync(path.join(scriptsDir, 'dev.js'), '755');
    
    logSuccess('Scripts de desarrollo creados');
    
    return true;
  } catch (error) {
    logError('Error creando scripts de desarrollo: ' + error.message);
    return false;
  }
}

// Función principal
function main() {
  log('🌍 Configurando Metaverso Crypto World Virtual 3D', 'magenta');
  log('='.repeat(60), 'cyan');
  
  const steps = [
    checkSystemDependencies,
    installDependencies,
    setupEnvironment,
    setupDatabase,
    setupBlockchain,
    setupAssets,
    createDevScripts
  ];
  
  let successCount = 0;
  
  steps.forEach((step, index) => {
    try {
      if (step()) {
        successCount++;
      }
    } catch (error) {
      logError(`Error en paso ${index + 1}: ${error.message}`);
    }
  });
  
  log('\n' + '='.repeat(60), 'cyan');
  
  if (successCount === steps.length) {
    log('🎉 ¡Configuración completada exitosamente!', 'green');
    log('\nPróximos pasos:', 'yellow');
    log('1. Actualiza las variables de entorno en el archivo .env', 'blue');
    log('2. Inicia MongoDB y Redis localmente', 'blue');
    log('3. Ejecuta: npm run dev', 'blue');
    log('4. Abre http://localhost:3000 en tu navegador', 'blue');
  } else {
    log(`⚠️  Configuración completada con ${steps.length - successCount} errores`, 'yellow');
    log('Revisa los errores anteriores y ejecuta el script nuevamente', 'red');
  }
  
  log('\n¡Bienvenido al Metaverso! 🌍✨', 'magenta');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkSystemDependencies,
  installDependencies,
  setupEnvironment,
  setupDatabase,
  setupBlockchain,
  setupAssets,
  createDevScripts
};