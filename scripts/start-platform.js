#!/usr/bin/env node

/**
 * Script de Inicio de la Plataforma Metaverso
 * Inicia todos los servicios y módulos del sistema
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D Team
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { spawn, execSync } = require('child_process');

class PlatformStarter {
    constructor() {
        this.rootDir = process.cwd();
        this.configFile = path.join(this.rootDir, 'config/metaverso-config.json');
        this.processes = [];
        this.spinner = null;
        this.config = null;
    }

    async start() {
        console.log(chalk.blue.bold('\n🚀 Iniciando Metaverso Crypto World Virtual 3D\n'));
        
        try {
            await this.loadConfiguration();
            await this.checkDependencies();
            await this.startServices();
            await this.waitForServices();
            await this.showStatus();
            
            this.setupGracefulShutdown();
            
            console.log(chalk.green.bold('\n✅ Plataforma iniciada exitosamente!\n'));
            console.log(chalk.cyan('Presiona Ctrl+C para detener todos los servicios\n'));
            
        } catch (error) {
            console.error(chalk.red.bold('\n❌ Error iniciando plataforma:'), error.message);
            await this.cleanup();
            process.exit(1);
        }
    }

    async loadConfiguration() {
        this.spinner = ora('Cargando configuración...').start();
        
        try {
            if (!await fs.pathExists(this.configFile)) {
                throw new Error('Archivo de configuración no encontrado: config/metaverso-config.json');
            }
            
            this.config = JSON.parse(await fs.readFile(this.configFile, 'utf8'));
            this.spinner.succeed('Configuración cargada');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error cargando configuración: ${error.message}`);
        }
    }

    async checkDependencies() {
        this.spinner = ora('Verificando dependencias...').start();
        
        try {
            const criticalModules = ['web', 'backend', 'bloc'];
            
            for (const module of criticalModules) {
                const moduleConfig = this.config.modules[module];
                if (!moduleConfig || !moduleConfig.enabled) {
                    throw new Error(`Módulo crítico ${module} no está habilitado`);
                }
                
                const modulePath = path.join(this.rootDir, moduleConfig.path);
                if (!await fs.pathExists(modulePath)) {
                    throw new Error(`Módulo ${module} no encontrado en ${modulePath}`);
                }
                
                const packageJsonPath = path.join(modulePath, 'package.json');
                if (!await fs.pathExists(packageJsonPath)) {
                    throw new Error(`package.json no encontrado en ${module}`);
                }
            }
            
            this.spinner.succeed('Dependencias verificadas');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error verificando dependencias: ${error.message}`);
        }
    }

    async startServices() {
        this.spinner = ora('Iniciando servicios...').start();
        
        try {
            const servicesToStart = [
                { name: 'Backend', module: 'backend', command: 'npm run dev' },
                { name: 'Web', module: 'web', command: 'npm run dev' }
            ];

            for (const service of servicesToStart) {
                const moduleConfig = this.config.modules[service.module];
                if (moduleConfig && moduleConfig.enabled) {
                    await this.startService(service, moduleConfig);
                }
            }
            
            this.spinner.succeed('Servicios iniciados');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error iniciando servicios: ${error.message}`);
        }
    }

    async startService(service, moduleConfig) {
        const modulePath = path.join(this.rootDir, moduleConfig.path);
        
        try {
            console.log(chalk.cyan(`  → Iniciando ${service.name}...`));
            
            const childProcess = spawn('npm', ['run', 'dev'], {
                cwd: modulePath,
                stdio: 'pipe',
                shell: true,
                env: {
                    ...process.env,
                    NODE_ENV: this.config.metaverso.environment,
                    METAVERSO_ENV: this.config.metaverso.environment
                }
            });

            childProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(chalk.gray(`[${service.name}] ${output}`));
                }
            });

            childProcess.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output && !output.includes('WARN')) {
                    console.log(chalk.yellow(`[${service.name}] ${output}`));
                }
            });

            childProcess.on('error', (error) => {
                console.log(chalk.red(`[${service.name}] Error: ${error.message}`));
            });

            childProcess.on('exit', (code) => {
                if (code !== 0) {
                    console.log(chalk.red(`[${service.name}] Proceso terminado con código ${code}`));
                }
            });

            this.processes.push({
                name: service.name,
                process: childProcess,
                module: service.module
            });

            // Esperar un poco entre servicios
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            throw new Error(`Error iniciando ${service.name}: ${error.message}`);
        }
    }

    async waitForServices() {
        this.spinner = ora('Esperando que los servicios estén listos...').start();
        
        try {
            const services = [
                { name: 'Backend', url: 'http://localhost:8000/health', timeout: 30000 },
                { name: 'Web', url: 'http://localhost:3000', timeout: 30000 }
            ];

            for (const service of services) {
                await this.waitForService(service);
            }
            
            this.spinner.succeed('Servicios listos');
        } catch (error) {
            this.spinner.fail();
            throw new Error(`Error esperando servicios: ${error.message}`);
        }
    }

    async waitForService(service) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < service.timeout) {
            try {
                const response = await fetch(service.url);
                if (response.ok) {
                    console.log(chalk.green(`  ✓ ${service.name} listo`));
                    return;
                }
            } catch (error) {
                // Servicio aún no está listo
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error(`Timeout esperando ${service.name}`);
    }

    async showStatus() {
        console.log(chalk.cyan.bold('\n📊 Estado de los Servicios:\n'));
        
        for (const proc of this.processes) {
            const status = proc.process.killed ? 'Detenido' : 'Ejecutándose';
            const color = proc.process.killed ? chalk.red : chalk.green;
            console.log(color(`  • ${proc.name}: ${status}`));
        }
        
        console.log(chalk.cyan.bold('\n🌐 URLs de Acceso:\n'));
        console.log(chalk.white('  • Frontend: http://localhost:3000'));
        console.log(chalk.white('  • Backend API: http://localhost:8000'));
        console.log(chalk.white('  • Documentación: http://localhost:3000/docs'));
        console.log(chalk.white('  • Métricas: http://localhost:9090'));
        console.log(chalk.white('  • Health Check: http://localhost:8000/health'));
        
        console.log(chalk.cyan.bold('\n🔧 Comandos Útiles:\n'));
        console.log(chalk.white('  • Ver logs: npm run monitor'));
        console.log(chalk.white('  • Ejecutar tests: npm test'));
        console.log(chalk.white('  • Construir: npm run build'));
        console.log(chalk.white('  • Linting: npm run lint'));
        
        console.log(chalk.yellow.bold('\n💡 Tip: Los servicios se reiniciarán automáticamente al detectar cambios\n'));
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(chalk.yellow.bold(`\n🛑 Recibido ${signal}, deteniendo servicios...\n`));
            
            for (const proc of this.processes) {
                if (!proc.process.killed) {
                    console.log(chalk.cyan(`  → Deteniendo ${proc.name}...`));
                    proc.process.kill('SIGTERM');
                }
            }
            
            // Esperar a que los procesos terminen
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Forzar terminación si es necesario
            for (const proc of this.processes) {
                if (!proc.process.killed) {
                    proc.process.kill('SIGKILL');
                }
            }
            
            console.log(chalk.green.bold('\n✅ Todos los servicios detenidos\n'));
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGQUIT', () => shutdown('SIGQUIT'));
    }

    async cleanup() {
        console.log(chalk.yellow('\n🧹 Limpiando procesos...\n'));
        
        for (const proc of this.processes) {
            if (!proc.process.killed) {
                proc.process.kill('SIGKILL');
            }
        }
    }
}

// ============================================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================================

async function main() {
    const starter = new PlatformStarter();
    
    try {
        await starter.start();
    } catch (error) {
        console.error(chalk.red.bold('\n❌ Error fatal:'), error.message);
        await starter.cleanup();
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = PlatformStarter; 