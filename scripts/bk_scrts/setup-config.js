#!/usr/bin/env node

/**
 * Script de Configuración Principal del Metaverso
 * Integra y configura todos los módulos del sistema
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D Team
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

// ============================================================================
// 🎯 CONFIGURACIÓN PRINCIPAL
// ============================================================================

class MetaversoConfigSetup {
    constructor() {
        this.rootDir = process.cwd();
        this.configDir = path.join(this.rootDir, 'config');
        this.scriptsDir = path.join(this.rootDir, 'scripts');
        this.modules = [
            'web',
            'backend', 
            'bloc',
            'assets',
            'components',
            'entities',
            'fonts',
            'helpers',
            'image',
            'languages',
            'cli',
            'gateway',
            'knowledge'
        ];
        
        this.spinner = null;
        this.config = {};
    }

    /**
     * Inicializar el setup
     */
    async init() {
        console.log(chalk.blue.bold('\n🚀 Configuración del Metaverso Crypto World Virtual 3D\n'));
        
        try {
            await this.checkPrerequisites();
            await this.loadConfiguration();
            await this.setupModules();
            await this.setupIntegration();
            await this.setupEnvironment();
            await this.runTests();
            
            console.log(chalk.green.bold('\n✅ Configuración completada exitosamente!\n'));
            this.showNextSteps();
            
        } catch (error) {
            console.error(chalk.red.bold('\n❌ Error durante la configuración:'), error.message);
            process.exit(1);
        }
    }

    /**
     * Verificar prerrequisitos
     */
    async checkPrerequisites() {
        this.spinner = ora('Verificando prerrequisitos...').start();
        
        const requirements = [
            { name: 'Node.js', version: '18.0.0', command: 'node --version' },
            { name: 'npm', version: '8.0.0', command: 'npm --version' },
            { name: 'Git', version: '2.0.0', command: 'git --version' }
        ];

        for (const req of requirements) {
            try {
                const output = execSync(req.command, { encoding: 'utf8' });
                const version = output.trim().replace(/^v/, '');
                
                if (this.compareVersions(version, req.version) < 0) {
                    throw new Error(`${req.name} ${version} es menor que ${req.version}`);
                }
            } catch (error) {
                this.spinner.fail();
                throw new Error(`Prerrequisito no cumplido: ${req.name} - ${error.message}`);
            }
        }
        
        this.spinner.succeed('Prerrequisitos verificados');
    }

    /**
     * Cargar configuración
     */
    async loadConfiguration() {
        this.spinner = ora('Cargando configuración...').start();
        
        try {
            // Cargar configuración desde config/
            const configFiles = [
                'config/contracts/addresses.json',
                'config/networks/ethereum.json',
                'config/networks/polygon.json',
                'config/environments/development.env'
            ];

            for (const configFile of configFiles) {
                const configPath = path.join(this.rootDir, configFile);
                if (await fs.pathExists(configPath)) {
                    const content = await fs.readFile(configPath, 'utf8');
                    this.config[path.basename(configFile, path.extname(configFile))] = JSON.parse(content);
                }
            }

            this.spinner.succeed('Configuración cargada');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error cargando configuración: ${error.message}`);
        }
    }

    /**
     * Configurar módulos
     */
    async setupModules() {
        this.spinner = ora('Configurando módulos...').start();
        
        try {
            for (const module of this.modules) {
                const modulePath = path.join(this.rootDir, module);
                
                if (await fs.pathExists(modulePath)) {
                    await this.setupModule(module, modulePath);
                } else {
                    console.log(chalk.yellow(`⚠️  Módulo ${module} no encontrado, saltando...`));
                }
            }
            
            this.spinner.succeed('Módulos configurados');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error configurando módulos: ${error.message}`);
        }
    }

    /**
     * Configurar módulo individual
     */
    async setupModule(moduleName, modulePath) {
        const packageJsonPath = path.join(modulePath, 'package.json');
        
        if (await fs.pathExists(packageJsonPath)) {
            // Instalar dependencias del módulo
            try {
                execSync('npm install', { cwd: modulePath, stdio: 'pipe' });
                console.log(chalk.green(`  ✓ ${moduleName} - Dependencias instaladas`));
            } catch (error) {
                console.log(chalk.yellow(`  ⚠ ${moduleName} - Error instalando dependencias: ${error.message}`));
            }

            // Construir módulo si tiene script de build
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                if (packageJson.scripts && packageJson.scripts.build) {
                    execSync('npm run build', { cwd: modulePath, stdio: 'pipe' });
                    console.log(chalk.green(`  ✓ ${moduleName} - Construido`));
                }
            } catch (error) {
                console.log(chalk.yellow(`  ⚠ ${moduleName} - Error construyendo: ${error.message}`));
            }
        }
    }

    /**
     * Configurar integración entre módulos
     */
    async setupIntegration() {
        this.spinner = ora('Configurando integración entre módulos...').start();
        
        try {
            // Crear archivo de configuración de integración
            const integrationConfig = {
                modules: this.modules.reduce((acc, module) => {
                    acc[module] = {
                        enabled: true,
                        path: `./${module}`,
                        dependencies: this.getModuleDependencies(module)
                    };
                    return acc;
                }, {}),
                
                integration: {
                    eventSystem: true,
                    sharedState: true,
                    crossModuleCommunication: true,
                    unifiedLogging: true
                },
                
                performance: {
                    moduleLoading: 'lazy',
                    caching: true,
                    compression: true,
                    optimization: true
                }
            };

            await fs.writeJson(
                path.join(this.configDir, 'integration.json'),
                integrationConfig,
                { spaces: 2 }
            );

            this.spinner.succeed('Integración configurada');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error configurando integración: ${error.message}`);
        }
    }

    /**
     * Configurar entorno
     */
    async setupEnvironment() {
        this.spinner = ora('Configurando entorno...').start();
        
        try {
            // Crear archivo .env principal
            const envContent = `
# ============================================================================
# 🏗️ CONFIGURACIÓN DEL ENTORNO - METAVERSO CRYPTO WORLD VIRTUAL 3D
# ============================================================================

# Configuración General
NODE_ENV=development
METAVERSO_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Configuración de Redes Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Configuración de APIs
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key

# Configuración de Base de Datos
DATABASE_URL=postgresql://metaverso:password@localhost:5432/metaverso
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017/metaverso

# Configuración de Seguridad
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Configuración de Servicios
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Configuración de Testing
TEST_NETWORK=goerli
TEST_CONTRACTS=true
MOCK_BLOCKCHAIN=false

# Configuración de Monitoreo
METRICS_ENABLED=true
METRICS_PORT=9090
ALERTS_WEBHOOK=your_webhook_url

# Configuración de Desarrollo
HOT_RELOAD=true
AUTO_RESTART=true
VERBOSE_LOGGING=true
            `.trim();

            await fs.writeFile(path.join(this.rootDir, '.env'), envContent);

            this.spinner.succeed('Entorno configurado');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error configurando entorno: ${error.message}`);
        }
    }

    /**
     * Ejecutar tests
     */
    async runTests() {
        this.spinner = ora('Ejecutando tests de verificación...').start();
        
        try {
            // Tests básicos de verificación
            const testResults = await this.runVerificationTests();
            
            if (testResults.success) {
                this.spinner.succeed('Tests de verificación pasados');
            } else {
                this.spinner.warn('Algunos tests fallaron, pero la configuración continúa');
                console.log(chalk.yellow('  ⚠ Tests fallidos:'), testResults.failures.join(', '));
            }
        } catch (error) {
            this.spinner.fail();
            console.log(chalk.yellow('  ⚠ Error ejecutando tests:'), error.message);
        }
    }

    /**
     * Ejecutar tests de verificación
     */
    async runVerificationTests() {
        const results = {
            success: true,
            failures: []
        };

        // Verificar que los módulos principales existen
        const criticalModules = ['web', 'backend', 'bloc'];
        
        for (const module of criticalModules) {
            const modulePath = path.join(this.rootDir, module);
            if (!await fs.pathExists(modulePath)) {
                results.success = false;
                results.failures.push(`Módulo ${module} no encontrado`);
            }
        }

        // Verificar archivos de configuración
        const configFiles = [
            'config/contracts/addresses.json',
            'config/networks/ethereum.json',
            'config/environments/development.env'
        ];

        for (const configFile of configFiles) {
            const configPath = path.join(this.rootDir, configFile);
            if (!await fs.pathExists(configPath)) {
                results.success = false;
                results.failures.push(`Archivo de configuración ${configFile} no encontrado`);
            }
        }

        return results;
    }

    /**
     * Mostrar próximos pasos
     */
    showNextSteps() {
        console.log(chalk.cyan.bold('\n📋 Próximos Pasos:\n'));
        console.log(chalk.white('1. Configurar variables de entorno en .env'));
        console.log(chalk.white('2. Configurar APIs de blockchain (Etherscan, etc.)'));
        console.log(chalk.white('3. Configurar base de datos'));
        console.log(chalk.white('4. Ejecutar: npm run dev (para desarrollo)'));
        console.log(chalk.white('5. Ejecutar: npm test (para tests)'));
        console.log(chalk.white('6. Visitar: http://localhost:3000 (frontend)'));
        console.log(chalk.white('7. Visitar: http://localhost:8000 (backend)'));
        
        console.log(chalk.cyan.bold('\n🔗 Enlaces Útiles:\n'));
        console.log(chalk.white('• Documentación: https://metaverso.com/docs'));
        console.log(chalk.white('• GitHub: https://github.com/metaverso/metaverso-crypto-world-virtual-3d'));
        console.log(chalk.white('• Discord: https://discord.gg/metaverso'));
        console.log(chalk.white('• Twitter: https://twitter.com/metaverso'));
    }

    /**
     * Obtener dependencias de un módulo
     */
    getModuleDependencies(moduleName) {
        const dependencies = {
            web: ['backend', 'bloc', 'assets', 'components'],
            backend: ['bloc', 'entities', 'gateway'],
            bloc: ['protocol'],
            assets: ['web', 'backend'],
            components: ['web', 'helpers'],
            entities: ['bloc'],
            fonts: ['web', 'assets'],
            helpers: ['web'],
            image: ['web', 'assets'],
            languages: ['web', 'backend'],
            cli: ['web', 'backend', 'bloc'],
            gateway: ['backend', 'bloc'],
            knowledge: ['web']
        };

        return dependencies[moduleName] || [];
    }

    /**
     * Comparar versiones
     */
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;
            
            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }
        
        return 0;
    }
}

// ============================================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================================

async function main() {
    const setup = new MetaversoConfigSetup();
    
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

module.exports = MetaversoConfigSetup;
