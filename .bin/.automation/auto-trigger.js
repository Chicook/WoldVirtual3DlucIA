#!/usr/bin/env node

/**
 * Auto-Trigger System para Metaverso
 * Sistema de automatización avanzada que coordina workflows y triggers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoTriggerSystem {
    constructor() {
        this.config = {
            triggers: {
                healthCheck: { interval: 300000, enabled: true }, // 5 min
                securityAudit: { interval: 3600000, enabled: true }, // 1 hora
                backup: { interval: 86400000, enabled: true }, // 24 horas
                cleanup: { interval: 43200000, enabled: true }, // 12 horas
                performanceCheck: { interval: 600000, enabled: true } // 10 min
            },
            logDir: path.join(__dirname, 'logs'),
            maxLogFiles: 50
        };
        
        this.init();
    }

    init() {
        // Crear directorio de logs si no existe
        if (!fs.existsSync(this.config.logDir)) {
            fs.mkdirSync(this.config.logDir, { recursive: true });
        }
        
        this.log('Auto-Trigger System iniciado');
        this.startTriggers();
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        const logFile = path.join(this.config.logDir, `auto-trigger-${new Date().toISOString().split('T')[0]}.log`);
        
        fs.appendFileSync(logFile, logEntry);
        console.log(logEntry.trim());
    }

    async executeWorkflow(workflowName, params = {}) {
        try {
            this.log(`Ejecutando workflow: ${workflowName}`);
            
            const workflows = {
                healthCheck: () => this.runHealthCheck(),
                securityAudit: () => this.runSecurityAudit(),
                backup: () => this.runBackup(),
                cleanup: () => this.runCleanup(),
                performanceCheck: () => this.runPerformanceCheck(),
                deploy: () => this.runDeploy(params),
                test: () => this.runTests(params)
            };

            if (workflows[workflowName]) {
                await workflows[workflowName]();
                this.log(`Workflow ${workflowName} completado exitosamente`);
            } else {
                throw new Error(`Workflow ${workflowName} no encontrado`);
            }
        } catch (error) {
            this.log(`Error en workflow ${workflowName}: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async runHealthCheck() {
        const healthScript = path.join(__dirname, '../monitor/health-check.sh');
        if (fs.existsSync(healthScript)) {
            execSync(`bash "${healthScript}"`, { stdio: 'inherit' });
        }
    }

    async runSecurityAudit() {
        const auditScript = path.join(__dirname, '../security/audit.sh');
        if (fs.existsSync(auditScript)) {
            execSync(`bash "${auditScript}"`, { stdio: 'inherit' });
        }
    }

    async runBackup() {
        const backupScript = path.join(__dirname, '../toolkit/backup.sh');
        if (fs.existsSync(backupScript)) {
            execSync(`bash "${backupScript}"`, { stdio: 'inherit' });
        }
    }

    async runCleanup() {
        const cleanupScript = path.join(__dirname, '../toolkit/cleanup.sh');
        if (fs.existsSync(cleanupScript)) {
            execSync(`bash "${cleanupScript}"`, { stdio: 'inherit' });
        }
    }

    async runPerformanceCheck() {
        const perfScript = path.join(__dirname, '../monitor/performance-check.js');
        if (fs.existsSync(perfScript)) {
            execSync(`node "${perfScript}"`, { stdio: 'inherit' });
        }
    }

    async runDeploy(params) {
        const deployScript = path.join(__dirname, '../deploy/deploy-mainnet.sh');
        if (fs.existsSync(deployScript)) {
            execSync(`bash "${deployScript}"`, { stdio: 'inherit' });
        }
    }

    async runTests(params) {
        const testScript = path.join(__dirname, '../params/run-tests.sh');
        if (fs.existsSync(testScript)) {
            execSync(`bash "${testScript}"`, { stdio: 'inherit' });
        }
    }

    startTriggers() {
        Object.entries(this.config.triggers).forEach(([name, config]) => {
            if (config.enabled) {
                this.log(`Iniciando trigger: ${name} (intervalo: ${config.interval}ms)`);
                setInterval(() => {
                    this.executeWorkflow(name).catch(error => {
                        this.log(`Error en trigger ${name}: ${error.message}`, 'ERROR');
                    });
                }, config.interval);
            }
        });
    }

    async triggerManual(workflowName, params = {}) {
        this.log(`Trigger manual ejecutado: ${workflowName}`);
        await this.executeWorkflow(workflowName, params);
    }

    getStatus() {
        return {
            triggers: this.config.triggers,
            logDir: this.config.logDir,
            uptime: process.uptime()
        };
    }

    cleanupLogs() {
        try {
            const files = fs.readdirSync(this.config.logDir)
                .filter(file => file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.config.logDir, file),
                    mtime: fs.statSync(path.join(this.config.logDir, file)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);

            // Mantener solo los últimos maxLogFiles archivos
            if (files.length > this.config.maxLogFiles) {
                files.slice(this.config.maxLogFiles).forEach(file => {
                    fs.unlinkSync(file.path);
                    this.log(`Log eliminado: ${file.name}`);
                });
            }
        } catch (error) {
            this.log(`Error limpiando logs: ${error.message}`, 'ERROR');
        }
    }
}

// CLI Interface
if (require.main === module) {
    const autoTrigger = new AutoTriggerSystem();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'trigger':
            const workflow = args[1];
            if (workflow) {
                autoTrigger.triggerManual(workflow);
            } else {
                console.log('Uso: node auto-trigger.js trigger <workflow-name>');
            }
            break;
            
        case 'status':
            console.log(JSON.stringify(autoTrigger.getStatus(), null, 2));
            break;
            
        case 'cleanup':
            autoTrigger.cleanupLogs();
            break;
            
        default:
            console.log(`
Auto-Trigger System - Comandos disponibles:
  trigger <workflow>  - Ejecutar workflow manualmente
  status             - Mostrar estado del sistema
  cleanup            - Limpiar logs antiguos
            `);
    }
}

module.exports = AutoTriggerSystem; 