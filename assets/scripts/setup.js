#!/usr/bin/env node

/**
 * @fileoverview Script de configuración inicial del sistema de assets
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Sistema de Assets del Metaverso...\n');

async function setupAssetsSystem() {
  try {
    // 1. Crear directorios necesarios
    console.log('📁 Creando directorios...');
    const directories = [
      './data',
      './logs',
      './temp',
      './processed',
      './backups',
      './uploads'
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      console.log(`  ✅ ${dir}`);
    }

    // 2. Copiar archivo de configuración de entorno
    console.log('\n🔧 Configurando variables de entorno...');
    if (!await fs.pathExists('.env')) {
      await fs.copy('env.example', '.env');
      console.log('  ✅ Archivo .env creado (configura las variables según necesites)');
    } else {
      console.log('  ℹ️  Archivo .env ya existe');
    }

    // 3. Instalar dependencias
    console.log('\n📦 Instalando dependencias...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('  ✅ Dependencias instaladas');
    } catch (error) {
      console.log('  ⚠️  Error instalando dependencias, ejecuta manualmente: npm install');
    }

    // 4. Compilar TypeScript
    console.log('\n🔨 Compilando TypeScript...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('  ✅ TypeScript compilado');
    } catch (error) {
      console.log('  ⚠️  Error compilando, ejecuta manualmente: npm run build');
    }

    // 5. Crear archivo de configuración de base de datos
    console.log('\n🗄️  Configurando base de datos...');
    const dbConfig = {
      database: './data/assets.db',
      tables: {
        assets: `
          CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            url TEXT NOT NULL,
            size INTEGER NOT NULL,
            hash TEXT NOT NULL,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `,
        uploads: `
          CREATE TABLE IF NOT EXISTS uploads (
            id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            url TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
          )
        `,
        metadata: `
          CREATE TABLE IF NOT EXISTS metadata (
            id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
          )
        `
      }
    };

    await fs.writeJson('./data/db-config.json', dbConfig, { spaces: 2 });
    console.log('  ✅ Configuración de base de datos creada');

    // 6. Crear archivo de configuración de logs
    console.log('\n📝 Configurando sistema de logs...');
    const logConfig = {
      level: 'info',
      format: 'json',
      transports: [
        {
          type: 'file',
          filename: './logs/assets.log',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        },
        {
          type: 'console',
          format: 'simple'
        }
      ]
    };

    await fs.writeJson('./config/logging.json', logConfig, { spaces: 2 });
    console.log('  ✅ Configuración de logs creada');

    // 7. Crear archivo de configuración de monitoreo
    console.log('\n📊 Configurando monitoreo...');
    const monitoringConfig = {
      enabled: true,
      metrics: {
        processing: true,
        storage: true,
        performance: true,
        errors: true
      },
      alerts: {
        enabled: false,
        thresholds: {
          errorRate: 0.05,
          processingTime: 300000,
          storageUsage: 0.9
        }
      }
    };

    await fs.writeJson('./config/monitoring.json', monitoringConfig, { spaces: 2 });
    console.log('  ✅ Configuración de monitoreo creada');

    // 8. Crear archivo de configuración de seguridad
    console.log('\n🔒 Configurando seguridad...');
    const securityConfig = {
      hashAlgorithm: 'sha256',
      encryption: false,
      signing: false,
      accessControl: {
        enabled: false,
        roles: ['admin', 'artist', 'viewer'],
        permissions: {
          admin: ['read', 'write', 'delete', 'manage'],
          artist: ['read', 'write'],
          viewer: ['read']
        }
      }
    };

    await fs.writeJson('./config/security.json', securityConfig, { spaces: 2 });
    console.log('  ✅ Configuración de seguridad creada');

    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('  1. Configura las variables en el archivo .env');
    console.log('  2. Ejecuta: npm run build');
    console.log('  3. Ejecuta: npm start');
    console.log('  4. Visita: http://localhost:3001');

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar configuración
setupAssetsSystem(); 