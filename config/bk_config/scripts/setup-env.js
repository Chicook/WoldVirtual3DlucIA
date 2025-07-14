#!/usr/bin/env node

/**
 * Script de Configuración de Variables de Entorno
 * Configura automáticamente las variables de entorno del metaverso
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D Team
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const crypto = require('crypto');

class EnvironmentSetup {
    constructor() {
        this.rootDir = process.cwd();
        this.envFile = path.join(this.rootDir, '.env');
        this.envExampleFile = path.join(this.rootDir, '.env.example');
    }

    async init() {
        console.log(chalk.blue.bold('\n🔧 Configuración de Variables de Entorno\n'));
        
        try {
            await this.checkExistingEnv();
            await this.generateSecrets();
            await this.promptConfiguration();
            await this.createEnvFile();
            await this.validateConfiguration();
            
            console.log(chalk.green.bold('\n✅ Variables de entorno configuradas exitosamente!\n'));
            
        } catch (error) {
            console.error(chalk.red.bold('\n❌ Error:'), error.message);
            process.exit(1);
        }
    }

    async checkExistingEnv() {
        if (await fs.pathExists(this.envFile)) {
            const { overwrite } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: 'El archivo .env ya existe. ¿Deseas sobrescribirlo?',
                    default: false
                }
            ]);

            if (!overwrite) {
                console.log(chalk.yellow('Configuración cancelada.'));
                process.exit(0);
            }
        }
    }

    async generateSecrets() {
        this.secrets = {
            jwtSecret: crypto.randomBytes(64).toString('hex'),
            encryptionKey: crypto.randomBytes(32).toString('hex'),
            sessionSecret: crypto.randomBytes(32).toString('hex')
        };
    }

    async promptConfiguration() {
        console.log(chalk.cyan('\n📝 Configuración del Sistema\n'));

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'environment',
                message: 'Selecciona el entorno:',
                choices: [
                    { name: 'Desarrollo (Development)', value: 'development' },
                    { name: 'Staging', value: 'staging' },
                    { name: 'Producción (Production)', value: 'production' }
                ],
                default: 'development'
            },
            {
                type: 'input',
                name: 'ethereumRpcUrl',
                message: 'URL RPC de Ethereum (Infura/Alchemy):',
                default: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
            },
            {
                type: 'input',
                name: 'polygonRpcUrl',
                message: 'URL RPC de Polygon:',
                default: 'https://polygon-rpc.com'
            },
            {
                type: 'input',
                name: 'bscRpcUrl',
                message: 'URL RPC de BSC:',
                default: 'https://bsc-dataseed.binance.org'
            },
            {
                type: 'input',
                name: 'etherscanApiKey',
                message: 'API Key de Etherscan (opcional):',
                default: ''
            },
            {
                type: 'input',
                name: 'polygonscanApiKey',
                message: 'API Key de Polygonscan (opcional):',
                default: ''
            },
            {
                type: 'input',
                name: 'databaseUrl',
                message: 'URL de Base de Datos PostgreSQL:',
                default: 'postgresql://metaverso:password@localhost:5432/metaverso'
            },
            {
                type: 'input',
                name: 'redisUrl',
                message: 'URL de Redis:',
                default: 'redis://localhost:6379'
            },
            {
                type: 'input',
                name: 'mongoUri',
                message: 'URI de MongoDB:',
                default: 'mongodb://localhost:27017/metaverso'
            },
            {
                type: 'input',
                name: 'ipfsGateway',
                message: 'Gateway de IPFS:',
                default: 'https://ipfs.io/ipfs/'
            },
            {
                type: 'input',
                name: 'pinataApiKey',
                message: 'API Key de Pinata (opcional):',
                default: ''
            },
            {
                type: 'input',
                name: 'pinataSecretKey',
                message: 'Secret Key de Pinata (opcional):',
                default: ''
            },
            {
                type: 'confirm',
                name: 'enableMetrics',
                message: '¿Habilitar métricas y monitoreo?',
                default: true
            },
            {
                type: 'input',
                name: 'metricsPort',
                message: 'Puerto para métricas:',
                default: '9090',
                when: (answers) => answers.enableMetrics
            },
            {
                type: 'confirm',
                name: 'enableAlerts',
                message: '¿Habilitar alertas?',
                default: false
            },
            {
                type: 'input',
                name: 'alertsWebhook',
                message: 'Webhook para alertas:',
                default: '',
                when: (answers) => answers.enableAlerts
            }
        ]);

        this.config = answers;
    }

    async createEnvFile() {
        const envContent = this.generateEnvContent();
        
        try {
            await fs.writeFile(this.envFile, envContent);
            console.log(chalk.green('✓ Archivo .env creado'));
        } catch (error) {
            throw new Error(`Error creando archivo .env: ${error.message}`);
        }
    }

    generateEnvContent() {
        const { config, secrets } = this;
        
        return `# ============================================================================
# 🏗️ CONFIGURACIÓN DEL ENTORNO - METAVERSO CRYPTO WORLD VIRTUAL 3D
# ============================================================================
# Generado automáticamente el ${new Date().toISOString()}
# NO editar manualmente - usar scripts/setup-env.js para cambios

# ============================================================================
# 🌍 CONFIGURACIÓN GENERAL
# ============================================================================

NODE_ENV=${config.environment}
METAVERSO_ENV=${config.environment}
DEBUG=${config.environment === 'development'}
LOG_LEVEL=${config.environment === 'development' ? 'debug' : 'info'}

# ============================================================================
# 🌐 CONFIGURACIÓN DE REDES BLOCKCHAIN
# ============================================================================

# Ethereum
ETHEREUM_RPC_URL=${config.ethereumRpcUrl}
ETHEREUM_CHAIN_ID=1
ETHEREUM_GAS_LIMIT=3000000
ETHEREUM_GAS_PRICE=20000000000

# Polygon
POLYGON_RPC_URL=${config.polygonRpcUrl}
POLYGON_CHAIN_ID=137
POLYGON_GAS_LIMIT=3000000
POLYGON_GAS_PRICE=30000000000

# BSC
BSC_RPC_URL=${config.bscRpcUrl}
BSC_CHAIN_ID=56
BSC_GAS_LIMIT=3000000
BSC_GAS_PRICE=5000000000

# Arbitrum
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ARBITRUM_CHAIN_ID=42161
ARBITRUM_GAS_LIMIT=3000000

# Optimism
OPTIMISM_RPC_URL=https://mainnet.optimism.io
OPTIMISM_CHAIN_ID=10
OPTIMISM_GAS_LIMIT=3000000

# Avalanche
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43114
AVALANCHE_GAS_LIMIT=3000000

# ============================================================================
# 🔍 CONFIGURACIÓN DE EXPLORADORES
# ============================================================================

ETHERSCAN_API_KEY=${config.etherscanApiKey}
POLYGONSCAN_API_KEY=${config.polygonscanApiKey}
BSCSCAN_API_KEY=
ARBISCAN_API_KEY=
OPTIMISTIC_ETHERSCAN_API_KEY=
SNOWTRACE_API_KEY=

# ============================================================================
# 🗄️ CONFIGURACIÓN DE BASE DE DATOS
# ============================================================================

# PostgreSQL
DATABASE_URL=${config.databaseUrl}
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=metaverso
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=metaverso

# Redis
REDIS_URL=${config.redisUrl}
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0

# MongoDB
MONGO_URI=${config.mongoUri}
MONGO_DATABASE=metaverso

# ============================================================================
# 🔐 CONFIGURACIÓN DE SEGURIDAD
# ============================================================================

JWT_SECRET=${secrets.jwtSecret}
ENCRYPTION_KEY=${secrets.encryptionKey}
SESSION_SECRET=${secrets.sessionSecret}
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=*

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60

# ============================================================================
# 📡 CONFIGURACIÓN DE SERVICIOS
# ============================================================================

# IPFS
IPFS_GATEWAY=${config.ipfsGateway}
PINATA_API_KEY=${config.pinataApiKey}
PINATA_SECRET_KEY=${config.pinataSecretKey}

# APIs Externas
IPFS_HTTP_CLIENT_URL=https://ipfs.infura.io:5001/api/v0
ARWEAVE_URL=https://arweave.net

# ============================================================================
# 🎮 CONFIGURACIÓN DEL METAVERSO
# ============================================================================

# Configuración de Mundo
WORLD_SIZE=10000
CHUNK_SIZE=100
MAX_CHUNKS_LOADED=100
MAX_PLAYERS=1000
MAX_OBJECTS_PER_SCENE=10000

# Configuración de Física
GRAVITY=-9.81
PHYSICS_TICK_RATE=60
COLLISION_DETECTION=true

# Configuración de Renderizado
RENDER_DISTANCE=1000
SHADOW_QUALITY=medium
TEXTURE_QUALITY=medium
TARGET_FPS=60

# Configuración de Audio
AUDIO_ENABLED=true
AUDIO_CHANNELS=32
AUDIO_SAMPLE_RATE=44100
AUDIO_BUFFER_SIZE=2048

# ============================================================================
# 📊 CONFIGURACIÓN DE MONITOREO
# ============================================================================

METRICS_ENABLED=${config.enableMetrics}
METRICS_PORT=${config.metricsPort || 9090}
METRICS_PATH=/metrics

# Logging
LOG_FILE=logs/metaverso.log
LOG_MAX_SIZE=100
LOG_BACKUP_COUNT=5

# Alertas
ALERTS_ENABLED=${config.enableAlerts}
ALERTS_WEBHOOK=${config.alertsWebhook || ''}
ALERT_THRESHOLD=0.9

# ============================================================================
# 🧪 CONFIGURACIÓN DE TESTING
# ============================================================================

TEST_NETWORK=goerli
TEST_CONTRACTS=true
MOCK_BLOCKCHAIN=false
COVERAGE_ENABLED=true
COVERAGE_THRESHOLD=80

# ============================================================================
# 🔧 CONFIGURACIÓN DE DESARROLLO
# ============================================================================

HOT_RELOAD=true
AUTO_RESTART=true
VERBOSE_LOGGING=${config.environment === 'development'}
ENABLE_SWAGGER=true
ENABLE_GRAPHIQL=true
ENABLE_PROFILING=true

# ============================================================================
# 📝 NOTAS
# ============================================================================

# IMPORTANTE: 
# - Cambiar todas las claves y secretos en producción
# - Configurar URLs reales para APIs y servicios externos
# - Ajustar configuraciones según el entorno
# - Revisar configuraciones de seguridad antes de desplegar
`;
    }

    async validateConfiguration() {
        console.log(chalk.cyan('\n🔍 Validando configuración...\n'));

        const validations = [
            { name: 'Archivo .env', check: () => fs.pathExists(this.envFile) },
            { name: 'JWT Secret', check: () => this.secrets.jwtSecret.length >= 64 },
            { name: 'Encryption Key', check: () => this.secrets.encryptionKey.length >= 32 },
            { name: 'Database URL', check: () => this.config.databaseUrl.includes('postgresql://') },
            { name: 'Redis URL', check: () => this.config.redisUrl.includes('redis://') },
            { name: 'MongoDB URI', check: () => this.config.mongoUri.includes('mongodb://') }
        ];

        for (const validation of validations) {
            try {
                const isValid = await validation.check();
                if (isValid) {
                    console.log(chalk.green(`  ✓ ${validation.name}`));
                } else {
                    console.log(chalk.red(`  ✗ ${validation.name}`));
                }
            } catch (error) {
                console.log(chalk.red(`  ✗ ${validation.name} - Error: ${error.message}`));
            }
        }
    }
}

// ============================================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================================

async function main() {
    const setup = new EnvironmentSetup();
    
    try {
        await setup.init();
    } catch (error) {
        console.error(chalk.red.bold('\n❌ Error fatal:'), error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = EnvironmentSetup; 