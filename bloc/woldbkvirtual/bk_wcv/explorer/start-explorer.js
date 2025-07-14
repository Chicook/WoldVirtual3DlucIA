#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando WoldPBVirtual Explorer...\n');

// Verificar si existe package.json
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('❌ Error: No se encontró package.json en el directorio actual');
  console.log('💡 Asegúrate de estar en el directorio correcto: bloc/bk_wcv/explorer');
  process.exit(1);
}

// Verificar si node_modules existe
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Instalando dependencias...');
  
  const install = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true
  });

  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencias instaladas correctamente');
      startExplorer();
    } else {
      console.error('❌ Error instalando dependencias');
      process.exit(1);
    }
  });
} else {
  startExplorer();
}

function startExplorer() {
  console.log('🌐 Iniciando servidor de desarrollo...');
  console.log('📱 El explorador estará disponible en: http://localhost:3001');
  console.log('🔗 API del servidor: http://localhost:3000');
  console.log('\n⏳ Esperando conexión...\n');

  const start = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: '3001'
    }
  });

  start.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ El servidor se cerró con código: ${code}`);
    }
  });

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo el servidor...');
    start.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo el servidor...');
    start.kill('SIGTERM');
    process.exit(0);
  });
}

// Mostrar información del proyecto
console.log('📋 Información del proyecto:');
console.log('   Nombre: WoldPBVirtual Explorer');
console.log('   Versión: 1.0.0');
console.log('   Descripción: Explorador de bloques para la blockchain WCV');
console.log('   Tecnologías: React, Tailwind CSS, Ethers.js');
console.log(''); 