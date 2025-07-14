#!/usr/bin/env node

/**
 * Script de inicio del sistema .bin
 * Inicializa y ejecuta el sistema completo
 */

const path = require('path');
const { spawn } = require('child_process');

// Configuración del sistema
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.BIN_SYSTEM_DEBUG === 'true'
};

console.log('🚀 Iniciando sistema .bin - WoldVirtual3DlucIA');
console.log('=' .repeat(50));
console.log(`📊 Configuración:`);
console.log(`   - Puerto: ${config.port}`);
console.log(`   - Host: ${config.host}`);
console.log(`   - Entorno: ${config.environment}`);
console.log(`   - Debug: ${config.debug}`);
console.log('=' .repeat(50));

// Función para ejecutar comandos
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falló con código ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Función principal de inicio
async function startSystem() {
  try {
    console.log('\n📦 Verificando dependencias...');
    
    // Verificar si node_modules existe
    const fs = require('fs');
    if (!fs.existsSync('node_modules')) {
      console.log('📥 Instalando dependencias...');
      await runCommand('npm', ['install']);
    }

    console.log('✅ Dependencias verificadas');

    // Ejecutar pruebas del sistema si está en modo debug
    if (config.debug) {
      console.log('\n🧪 Ejecutando pruebas del sistema...');
      try {
        await runCommand('npx', ['ts-node', 'src/test-system.ts']);
        console.log('✅ Pruebas completadas');
      } catch (error) {
        console.log('⚠️ Algunas pruebas fallaron, continuando...');
      }
    }

    // Compilar TypeScript
    console.log('\n🔨 Compilando TypeScript...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Compilación completada');

    // Iniciar el servidor de desarrollo
    console.log('\n🌐 Iniciando servidor de desarrollo...');
    console.log(`📍 URL: http://${config.host}:${config.port}`);
    
    const env = {
      ...process.env,
      PORT: config.port.toString(),
      HOST: config.host,
      NODE_ENV: config.environment,
      BIN_SYSTEM_DEBUG: config.debug.toString()
    };

    await runCommand('npm', ['start'], { env });

  } catch (error) {
    console.error('\n❌ Error iniciando el sistema:', error.message);
    process.exit(1);
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log(`
Uso: node start-system.js [opciones]

Opciones:
  --help, -h          Mostrar esta ayuda
  --port <puerto>     Puerto del servidor (default: 3000)
  --host <host>       Host del servidor (default: localhost)
  --env <entorno>     Entorno (development/production, default: development)
  --debug             Habilitar modo debug
  --test              Ejecutar solo las pruebas
  --build             Solo compilar

Ejemplos:
  node start-system.js --port 8080 --debug
  node start-system.js --env production
  node start-system.js --test
`);
}

// Procesar argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      case '--port':
        config.port = parseInt(args[++i]) || 3000;
        break;
        
      case '--host':
        config.host = args[++i] || 'localhost';
        break;
        
      case '--env':
        config.environment = args[++i] || 'development';
        break;
        
      case '--debug':
        config.debug = true;
        break;
        
      case '--test':
        runCommand('npx', ['ts-node', 'src/test-system.ts'])
          .then(() => console.log('✅ Pruebas completadas'))
          .catch(error => {
            console.error('❌ Pruebas fallaron:', error.message);
            process.exit(1);
          });
        return;
        
      case '--build':
        runCommand('npm', ['run', 'build'])
          .then(() => console.log('✅ Compilación completada'))
          .catch(error => {
            console.error('❌ Compilación falló:', error.message);
            process.exit(1);
          });
        return;
    }
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal de terminación...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal de terminación...');
  process.exit(0);
});

// Iniciar el sistema
parseArgs();
startSystem().catch(error => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
}); 