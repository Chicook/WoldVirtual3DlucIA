#!/usr/bin/env node

/**
 * Script para iniciar el servidor del motor 3D
 * Ejecuta el servidor WebSocket en el puerto 8080
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor del motor 3D...');
console.log('=' .repeat(50));

// Configuración
const config = {
  port: process.env.ENGINE_PORT || 8181,
  host: process.env.ENGINE_HOST || 'localhost',
  debug: process.env.ENGINE_DEBUG === 'true'
};

console.log(`📊 Configuración:`);
console.log(`   - Puerto: ${config.port}`);
console.log(`   - Host: ${config.host}`);
console.log(`   - Debug: ${config.debug}`);
console.log('=' .repeat(50));

// Función para ejecutar el servidor
function startEngineServer() {
  const serverPath = path.join(__dirname, 'src', 'core', 'engine', 'EngineServer.ts');
  
  console.log(`📍 Ruta del servidor: ${serverPath}`);
  
  const env = {
    ...process.env,
    ENGINE_PORT: config.port.toString(),
    ENGINE_HOST: config.host,
    ENGINE_DEBUG: config.debug.toString()
  };

  // Intentar ejecutar con ts-node
  const child = spawn('npx', ['ts-node', serverPath], {
    stdio: 'inherit',
    shell: true,
    env
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Servidor terminado con código ${code}`);
      
      // Si ts-node falla, intentar con node directamente
      console.log('🔄 Intentando con compilación manual...');
      tryCompileAndRun();
    }
  });

  child.on('error', (error) => {
    console.error('❌ Error ejecutando servidor:', error.message);
    console.log('🔄 Intentando con compilación manual...');
    tryCompileAndRun();
  });

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor...');
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo servidor...');
    child.kill('SIGTERM');
  });
}

// Función alternativa para compilar y ejecutar
function tryCompileAndRun() {
  console.log('🔨 Compilando TypeScript...');
  
  const compileProcess = spawn('npx', ['tsc', '--outDir', 'dist', 'src/**/*.ts'], {
    stdio: 'inherit',
    shell: true
  });

  compileProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Compilación exitosa');
      
      const serverPath = path.join(__dirname, 'dist', 'core', 'engine', 'EngineServer.js');
      const env = {
        ...process.env,
        ENGINE_PORT: config.port.toString(),
        ENGINE_HOST: config.host,
        ENGINE_DEBUG: config.debug.toString()
      };

      const serverProcess = spawn('node', [serverPath], {
        stdio: 'inherit',
        shell: true,
        env
      });

      serverProcess.on('close', (code) => {
        console.error(`❌ Servidor terminado con código ${code}`);
      });

      serverProcess.on('error', (error) => {
        console.error('❌ Error ejecutando servidor compilado:', error.message);
      });

      // Manejar señales de terminación
      process.on('SIGINT', () => {
        console.log('\n🛑 Deteniendo servidor...');
        serverProcess.kill('SIGINT');
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Deteniendo servidor...');
        serverProcess.kill('SIGTERM');
      });

    } else {
      console.error('❌ Error en compilación');
      process.exit(1);
    }
  });
}

// Función para mostrar ayuda
function showHelp() {
  console.log(`
Uso: node start-engine-server.js [opciones]

Opciones:
  --help, -h          Mostrar esta ayuda
  --port <puerto>     Puerto del servidor (default: 8080)
  --host <host>       Host del servidor (default: localhost)
  --debug             Habilitar modo debug

Variables de entorno:
  ENGINE_PORT         Puerto del servidor
  ENGINE_HOST         Host del servidor
  ENGINE_DEBUG        Habilitar debug (true/false)

Ejemplos:
  node start-engine-server.js --port 8080 --debug
  ENGINE_PORT=9000 node start-engine-server.js
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
        config.port = parseInt(args[++i]) || 8080;
        break;
        
      case '--host':
        config.host = args[++i] || 'localhost';
        break;
        
      case '--debug':
        config.debug = true;
        break;
    }
  }
}

// Verificar dependencias
function checkDependencies() {
  const fs = require('fs');
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No se encontró package.json');
    process.exit(1);
  }

  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📥 Instalando dependencias...');
    const installProcess = spawn('npm', ['install'], {
      stdio: 'inherit',
      shell: true
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencias instaladas');
        startEngineServer();
      } else {
        console.error('❌ Error instalando dependencias');
        process.exit(1);
      }
    });
    return;
  }

  startEngineServer();
}

// Iniciar el sistema
parseArgs();
checkDependencies(); 