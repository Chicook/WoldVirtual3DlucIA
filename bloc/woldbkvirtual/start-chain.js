#!/usr/bin/env node

/**
 * Script de inicio para WoldVirtual3D Blockchain
 * Incluye puente BSC ↔ WoldVirtual3D y token WCV
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Logo de WoldVirtual3D
const logo = `
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🌉 WoldVirtual3D Blockchain - Puente BSC ↔ WoldVirtual3D  ║
║                                                              ║
║    💰 WoldCoinVirtual (WCV) - 30,000,000 tokens             ║
║    🔗 Contrato BSC: 0x053532E91FFD6b8a21C925Da101C909A01106BBE ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
`;

// Configuración
const config = {
  ports: {
    network: 8545,
    rpc: 8546,
    ws: 8547,
    bridge: 8548
  },
  chains: {
    woldvirtual: {
      chainId: 1337,
      name: 'WoldVirtual3D',
      symbol: 'WCV',
      decimals: 3
    },
    bsc: {
      chainId: 56,
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      decimals: 18
    }
  },
  bridge: {
    enabled: true,
    bscContract: '0x053532E91FFD6b8a21C925Da101C909A01106BBE',
    minTransfer: '1000', // 1 WCV
    maxTransfer: '1000000000', // 1M WCV
    dailyLimit: '10000000000', // 10M WCV
    fee: '100' // 0.1 WCV
  }
};

// Función para imprimir con colores
function print(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para imprimir banner
function printBanner() {
  console.clear();
  console.log(logo);
  print('🚀 Iniciando WoldVirtual3D Blockchain...', 'green');
  print('🌉 Puente BSC ↔ WoldVirtual3D activo', 'cyan');
  print('💰 Token WCV (WoldCoinVirtual) disponible', 'yellow');
  console.log('');
}

// Función para mostrar información del sistema
function showSystemInfo() {
  print('📊 Información del Sistema:', 'bright');
  print(`   Chain ID: ${config.chains.woldvirtual.chainId}`, 'cyan');
  print(`   Token: ${config.chains.woldvirtual.symbol}`, 'yellow');
  print(`   Decimales: ${config.chains.woldvirtual.decimals}`, 'cyan');
  print(`   Formato: 0,000 WCV`, 'yellow');
  console.log('');
  
  print('🔗 Configuración del Puente:', 'bright');
  print(`   Contrato BSC: ${config.bridge.bscContract}`, 'cyan');
  print(`   Transferencia mínima: ${config.bridge.minTransfer} WCV`, 'yellow');
  print(`   Transferencia máxima: ${config.bridge.maxTransfer} WCV`, 'yellow');
  print(`   Límite diario: ${config.bridge.dailyLimit} WCV`, 'yellow');
  print(`   Fee: ${config.bridge.fee} WCV`, 'yellow');
  console.log('');
  
  print('🌐 Puertos:', 'bright');
  print(`   Network: ${config.ports.network}`, 'cyan');
  print(`   RPC: ${config.ports.rpc}`, 'cyan');
  print(`   WebSocket: ${config.ports.ws}`, 'cyan');
  print(`   Bridge: ${config.ports.bridge}`, 'cyan');
  console.log('');
}

// Función para verificar dependencias
function checkDependencies() {
  return new Promise((resolve, reject) => {
    print('🔍 Verificando dependencias...', 'cyan');
    
    const dependencies = ['node', 'npm', 'tsc'];
    let checked = 0;
    
    dependencies.forEach(dep => {
      exec(`which ${dep}`, (error) => {
        checked++;
        
        if (error) {
          print(`   ❌ ${dep} no encontrado`, 'red');
        } else {
          print(`   ✅ ${dep} encontrado`, 'green');
        }
        
        if (checked === dependencies.length) {
          resolve();
        }
      });
    });
  });
}

// Función para compilar TypeScript
function compileTypeScript() {
  return new Promise((resolve, reject) => {
    print('🔨 Compilando TypeScript...', 'cyan');
    
    const tsc = spawn('npx', ['tsc'], { stdio: 'inherit' });
    
    tsc.on('close', (code) => {
      if (code === 0) {
        print('✅ Compilación completada', 'green');
        resolve();
      } else {
        print('❌ Error en compilación', 'red');
        reject(new Error('Compilación falló'));
      }
    });
  });
}

// Función para iniciar blockchain en modo desarrollo
function startDevelopment() {
  print('🛠️  Iniciando modo desarrollo...', 'yellow');
  
  const child = spawn('node', ['dist/examples/demo.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  child.on('close', (code) => {
    print(`Proceso terminado con código: ${code}`, 'cyan');
  });
  
  return child;
}

// Función para iniciar blockchain en modo producción
function startProduction() {
  print('🚀 Iniciando modo producción...', 'green');
  
  const child = spawn('node', ['dist/blockchain/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  child.on('close', (code) => {
    print(`Proceso terminado con código: ${code}`, 'cyan');
  });
  
  return child;
}

// Función para iniciar solo el puente
function startBridge() {
  print('🌉 Iniciando solo el puente BSC...', 'cyan');
  
  const child = spawn('node', ['dist/examples/bridge-demo.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'bridge' }
  });
  
  child.on('close', (code) => {
    print(`Puente terminado con código: ${code}`, 'cyan');
  });
  
  return child;
}

// Función para ejecutar tests
function runTests() {
  print('🧪 Ejecutando tests...', 'magenta');
  
  const child = spawn('npm', ['test'], {
    stdio: 'inherit'
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      print('✅ Todos los tests pasaron', 'green');
    } else {
      print('❌ Algunos tests fallaron', 'red');
    }
  });
  
  return child;
}

// Función para limpiar archivos
function cleanup() {
  print('🧹 Limpiando archivos...', 'yellow');
  
  const dirs = ['dist', 'node_modules', 'coverage'];
  
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      print(`   ✅ ${dir} eliminado`, 'green');
    }
  });
  
  print('✅ Limpieza completada', 'green');
}

// Función para mostrar menú interactivo
function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('');
    print('📋 Selecciona una opción:', 'bright');
    print('   1. 🛠️  Modo Desarrollo (con demo completo)', 'cyan');
    print('   2. 🚀 Modo Producción', 'green');
    print('   3. 🌉 Solo Puente BSC', 'yellow');
    print('   4. 🧪 Ejecutar Tests', 'magenta');
    print('   5. 🧹 Limpiar archivos', 'red');
    print('   6. 📊 Mostrar información', 'blue');
    print('   7. 🐍 Ejecutar Python', 'cyan');
    print('   8. ❌ Salir', 'red');
    console.log('');
    
    rl.question('Selecciona una opción (1-8): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Función para ejecutar Python
function runPython() {
  print('🐍 Ejecutando blockchain en Python...', 'cyan');
  
  const pythonFile = path.join(__dirname, 'python_blockchain.py');
  
  if (!fs.existsSync(pythonFile)) {
    print('❌ Archivo Python no encontrado', 'red');
    return;
  }
  
  const child = spawn('python', [pythonFile], {
    stdio: 'inherit'
  });
  
  child.on('close', (code) => {
    print(`Proceso Python terminado con código: ${code}`, 'cyan');
  });
  
  return child;
}

// Función principal
async function main() {
  try {
    printBanner();
    showSystemInfo();
    
    // Verificar argumentos de línea de comandos
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command) {
      // Modo comando directo
      switch (command) {
        case 'dev':
        case 'development':
          await checkDependencies();
          await compileTypeScript();
          startDevelopment();
          break;
          
        case 'prod':
        case 'production':
          await checkDependencies();
          await compileTypeScript();
          startProduction();
          break;
          
        case 'bridge':
          await checkDependencies();
          await compileTypeScript();
          startBridge();
          break;
          
        case 'test':
          runTests();
          break;
          
        case 'clean':
        case 'cleanup':
          cleanup();
          break;
          
        case 'python':
          runPython();
          break;
          
        case 'info':
          showSystemInfo();
          break;
          
        default:
          print(`❌ Comando desconocido: ${command}`, 'red');
          print('Comandos disponibles: dev, prod, bridge, test, clean, python, info', 'yellow');
          process.exit(1);
      }
    } else {
      // Modo interactivo
      await checkDependencies();
      await compileTypeScript();
      
      let running = true;
      while (running) {
        const option = await showMenu();
        
        switch (option) {
          case '1':
            startDevelopment();
            break;
            
          case '2':
            startProduction();
            break;
            
          case '3':
            startBridge();
            break;
            
          case '4':
            runTests();
            break;
            
          case '5':
            cleanup();
            break;
            
          case '6':
            showSystemInfo();
            break;
            
          case '7':
            runPython();
            break;
            
          case '8':
            print('👋 ¡Hasta luego!', 'green');
            running = false;
            process.exit(0);
            break;
            
          default:
            print('❌ Opción inválida', 'red');
        }
        
        if (running) {
          console.log('');
          print('Presiona Enter para continuar...', 'cyan');
          await new Promise(resolve => {
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            rl.question('', () => {
              rl.close();
              resolve();
            });
          });
        }
      }
    }
    
  } catch (error) {
    print(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  print('\n🛑 Deteniendo blockchain...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  print('\n🛑 Deteniendo blockchain...', 'yellow');
  process.exit(0);
});

// Ejecutar función principal
if (require.main === module) {
  main();
}

module.exports = {
  startDevelopment,
  startProduction,
  startBridge,
  runTests,
  cleanup,
  runPython,
  showSystemInfo
}; 