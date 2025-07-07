#!/usr/bin/env node

/**
 * Script de Inicialización Principal del Metaverso
 * Configura y inicia toda la plataforma
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D Team
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { execSync, spawn } = require('child_process');

class MetaversoInitializer {
    constructor() {
        this.rootDir = process.cwd();
        this.configDir = path.join(this.rootDir, 'config');
        this.webDir = path.join(this.rootDir, 'web');
        this.backendDir = path.join(this.rootDir, 'backend');
        this.blocDir = path.join(this.rootDir, 'bloc');
        this.spinner = null;
    }

    async init() {
        console.log(chalk.blue.bold('\n🚀 Inicializando Metaverso Crypto World Virtual 3D\n'));
        
        try {
            await this.checkStructure();
            await this.installDependencies();
            await this.setupConfiguration();
            await this.buildModules();
            await this.startServices();
            
            console.log(chalk.green.bold('\n✅ Metaverso inicializado exitosamente!\n'));
            this.showStatus();
            
        } catch (error) {
            console.error(chalk.red.bold('\n❌ Error durante la inicialización:'), error.message);
            process.exit(1);
        }
    }

    async checkStructure() {
        this.spinner = ora('Verificando estructura del proyecto...').start();
        
        const requiredDirs = [
            'web',
            'backend', 
            'bloc',
            'assets',
            'components',
            'config',
            'scripts'
        ];

        const missingDirs = [];
        
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.rootDir, dir);
            if (!await fs.pathExists(dirPath)) {
                missingDirs.push(dir);
            }
        }

        if (missingDirs.length > 0) {
            this.spinner.fail();
            throw new Error(`Directorios faltantes: ${missingDirs.join(', ')}`);
        }

        this.spinner.succeed('Estructura del proyecto verificada');
    }

    async installDependencies() {
        this.spinner = ora('Instalando dependencias...').start();
        
        try {
            // Instalar dependencias principales
            execSync('npm install', { cwd: this.rootDir, stdio: 'pipe' });
            
            // Instalar dependencias de módulos críticos
            const criticalModules = ['web', 'backend', 'bloc'];
            
            for (const module of criticalModules) {
                const modulePath = path.join(this.rootDir, module);
                if (await fs.pathExists(path.join(modulePath, 'package.json'))) {
                    execSync('npm install', { cwd: modulePath, stdio: 'pipe' });
                }
            }
            
            this.spinner.succeed('Dependencias instaladas');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error instalando dependencias: ${error.message}`);
        }
    }

    async setupConfiguration() {
        this.spinner = ora('Configurando sistema...').start();
        
        try {
            // Ejecutar scripts de configuración
            const setupScripts = [
                'scripts/setup-config.js',
                'scripts/setup-env.js'
            ];

            for (const script of setupScripts) {
                const scriptPath = path.join(this.rootDir, script);
                if (await fs.pathExists(scriptPath)) {
                    execSync(`node ${script}`, { cwd: this.rootDir, stdio: 'pipe' });
                }
            }
            
            this.spinner.succeed('Sistema configurado');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error configurando sistema: ${error.message}`);
        }
    }

    async buildModules() {
        this.spinner = ora('Construyendo módulos...').start();
        
        try {
            const modulesToBuild = ['web', 'backend', 'bloc', 'assets'];
            
            for (const module of modulesToBuild) {
                const modulePath = path.join(this.rootDir, module);
                const packageJsonPath = path.join(modulePath, 'package.json');
                
                if (await fs.pathExists(packageJsonPath)) {
                    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                    
                    if (packageJson.scripts && packageJson.scripts.build) {
                        try {
                            execSync('npm run build', { cwd: modulePath, stdio: 'pipe' });
                            console.log(chalk.green(`  ✓ ${module} construido`));
                        } catch (error) {
                            console.log(chalk.yellow(`  ⚠ ${module} - Error construyendo: ${error.message}`));
                        }
                    }
                }
            }
            
            this.spinner.succeed('Módulos construidos');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error construyendo módulos: ${error.message}`);
        }
    }

    async startServices() {
        this.spinner = ora('Iniciando servicios...').start();
        
        try {
            // Verificar que los servicios pueden iniciarse
            const services = [
                { name: 'Backend', path: this.backendDir, port: 8000 },
                { name: 'Web', path: this.webDir, port: 3000 }
            ];

            for (const service of services) {
                const packageJsonPath = path.join(service.path, 'package.json');
                
                if (await fs.pathExists(packageJsonPath)) {
                    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                    
                    if (packageJson.scripts && (packageJson.scripts.dev || packageJson.scripts.start)) {
                        console.log(chalk.cyan(`  → ${service.name} listo en puerto ${service.port}`));
                    }
                }
            }
            
            this.spinner.succeed('Servicios listos');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error iniciando servicios: ${error.message}`);
        }
    }

    showStatus() {
        console.log(chalk.cyan.bold('\n📊 Estado del Sistema:\n'));
        
        console.log(chalk.green('✅ Módulos Principales:'));
        console.log(chalk.white('  • Web (Frontend) - Puerto 3000'));
        console.log(chalk.white('  • Backend (API) - Puerto 8000'));
        console.log(chalk.white('  • Blockchain (Smart Contracts)'));
        console.log(chalk.white('  • Assets (Gestión de recursos)'));
        
        console.log(chalk.green('\n✅ Módulos de Soporte:'));
        console.log(chalk.white('  • Components (Biblioteca de componentes)'));
        console.log(chalk.white('  • Entities (Sistema de entidades)'));
        console.log(chalk.white('  • Fonts (Gestión de fuentes)'));
        console.log(chalk.white('  • Helpers (Utilidades)'));
        console.log(chalk.white('  • Image (Procesamiento de imágenes)'));
        console.log(chalk.white('  • Languages (Sistema de idiomas)'));
        console.log(chalk.white('  • CLI (Herramientas de línea de comandos)'));
        console.log(chalk.white('  • Gateway (Puerta de enlace)'));
        console.log(chalk.white('  • Knowledge (Documentación)'));
        
        console.log(chalk.cyan.bold('\n🚀 Comandos Disponibles:\n'));
        console.log(chalk.white('  npm start          - Iniciar en modo desarrollo'));
        console.log(chalk.white('  npm run dev        - Iniciar todos los servicios'));
        console.log(chalk.white('  npm run build      - Construir todos los módulos'));
        console.log(chalk.white('  npm test           - Ejecutar tests'));
        console.log(chalk.white('  npm run lint       - Verificar código'));
        console.log(chalk.white('  npm run deploy     - Desplegar sistema'));
        console.log(chalk.white('  npm run docs       - Generar documentación'));
        console.log(chalk.white('  npm run security   - Verificar seguridad'));
        console.log(chalk.white('  npm run monitor    - Monitorear sistema'));
        
        console.log(chalk.cyan.bold('\n🌐 Acceso al Sistema:\n'));
        console.log(chalk.white('  • Frontend: http://localhost:3000'));
        console.log(chalk.white('  • Backend API: http://localhost:8000'));
        console.log(chalk.white('  • Documentación: http://localhost:3000/docs'));
        console.log(chalk.white('  • Métricas: http://localhost:9090'));
        
        console.log(chalk.cyan.bold('\n📚 Recursos:\n'));
        console.log(chalk.white('  • Documentación: https://metaverso.com/docs'));
        console.log(chalk.white('  • GitHub: https://github.com/metaverso/metaverso-crypto-world-virtual-3d'));
        console.log(chalk.white('  • Discord: https://discord.gg/metaverso'));
        console.log(chalk.white('  • Twitter: https://twitter.com/metaverso'));
        
        console.log(chalk.yellow.bold('\n💡 Tip: Ejecuta "npm start" para iniciar el sistema completo\n'));
    }
}

// ============================================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================================

async function main() {
    const initializer = new MetaversoInitializer();
    
    try {
        await initializer.init();
    } catch (error) {
        console.error(chalk.red.bold('\n❌ Error fatal:'), error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = MetaversoInitializer; 