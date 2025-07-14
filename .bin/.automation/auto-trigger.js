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

// ============================================================================
// SISTEMA AVANZADO DE MONITOREO Y ALERTAS INTELIGENTES
// ============================================================================

class IntelligentAlertSystem {
    constructor() {
        this.alertRules = {
            critical: {
                threshold: 3,
                timeWindow: 300000, // 5 minutos
                actions: ['email', 'slack', 'sms']
            },
            warning: {
                threshold: 5,
                timeWindow: 900000, // 15 minutos
                actions: ['slack', 'log']
            },
            info: {
                threshold: 10,
                timeWindow: 3600000, // 1 hora
                actions: ['log']
            }
        };
        this.alertHistory = [];
        this.alertCounters = new Map();
    }

    checkAlertCondition(workflowName, error, level = 'warning') {
        const rule = this.alertRules[level];
        if (!rule) return false;

        const key = `${workflowName}:${level}`;
        const now = Date.now();
        
        // Limpiar alertas antiguas
        this.alertHistory = this.alertHistory.filter(alert => 
            now - alert.timestamp < rule.timeWindow
        );
        
        // Contar alertas en la ventana de tiempo
        const recentAlerts = this.alertHistory.filter(alert => 
            alert.workflow === workflowName && 
            alert.level === level &&
            now - alert.timestamp < rule.timeWindow
        );
        
        if (recentAlerts.length >= rule.threshold) {
            this.triggerAlert(workflowName, error, level, rule.actions);
            return true;
        }
        
        return false;
    }

    triggerAlert(workflowName, error, level, actions) {
        const alert = {
            workflow: workflowName,
            error: error,
            level: level,
            timestamp: Date.now(),
            actions: actions
        };
        
        this.alertHistory.push(alert);
        
        // Ejecutar acciones de alerta
        actions.forEach(action => {
            this.executeAlertAction(action, alert);
        });
        
        console.log(`[ALERTA ${level.toUpperCase()}] Workflow ${workflowName}: ${error}`);
    }

    executeAlertAction(action, alert) {
        switch (action) {
            case 'email':
                this.sendEmailAlert(alert);
                break;
            case 'slack':
                this.sendSlackAlert(alert);
                break;
            case 'sms':
                this.sendSMSAlert(alert);
                break;
            case 'log':
                this.logAlert(alert);
                break;
        }
    }

    sendEmailAlert(alert) {
        // Implementación de envío de email
        console.log(`[EMAIL] Alerta enviada para workflow ${alert.workflow}`);
    }

    sendSlackAlert(alert) {
        // Implementación de envío a Slack
        console.log(`[SLACK] Alerta enviada para workflow ${alert.workflow}`);
    }

    sendSMSAlert(alert) {
        // Implementación de envío de SMS
        console.log(`[SMS] Alerta enviada para workflow ${alert.workflow}`);
    }

    logAlert(alert) {
        const logEntry = `[${new Date(alert.timestamp).toISOString()}] [ALERTA ${alert.level.toUpperCase()}] Workflow: ${alert.workflow}, Error: ${alert.error}`;
        fs.appendFileSync(path.join(__dirname, 'logs', 'alerts.log'), logEntry + '\n');
    }

    getAlertHistory(limit = 50) {
        return this.alertHistory.slice(-limit);
    }

    getAlertStats() {
        const stats = {
            total: this.alertHistory.length,
            byLevel: {},
            byWorkflow: {}
        };
        
        this.alertHistory.forEach(alert => {
            stats.byLevel[alert.level] = (stats.byLevel[alert.level] || 0) + 1;
            stats.byWorkflow[alert.workflow] = (stats.byWorkflow[alert.workflow] || 0) + 1;
        });
        
        return stats;
    }
}

// Extender AutoTriggerSystem con sistema de alertas
AutoTriggerSystem.prototype.alertSystem = new IntelligentAlertSystem();

// Sobrescribir executeWorkflow para incluir alertas
const originalExecuteWorkflow = AutoTriggerSystem.prototype.executeWorkflow;
AutoTriggerSystem.prototype.executeWorkflow = function(workflowName, params) {
    try {
        return originalExecuteWorkflow.call(this, workflowName, params);
    } catch (error) {
        // Verificar condiciones de alerta
        this.alertSystem.checkAlertCondition(workflowName, error.message, 'critical');
        throw error;
    }
};

// Añadir métodos de alertas al sistema
AutoTriggerSystem.prototype.getAlertHistory = function(limit) {
    return this.alertSystem.getAlertHistory(limit);
};

AutoTriggerSystem.prototype.getAlertStats = function() {
    return this.alertSystem.getAlertStats();
};

AutoTriggerSystem.prototype.configureAlerts = function(config) {
    Object.assign(this.alertSystem.alertRules, config);
}; 