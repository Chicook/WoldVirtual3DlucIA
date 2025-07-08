#!/usr/bin/env node

/**
 * Scheduler System para Metaverso
 * Sistema de programación de tareas y eventos automáticos
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class MetaversoScheduler {
    constructor() {
        this.tasks = new Map();
        this.config = {
            logDir: path.join(__dirname, 'logs'),
            tasksFile: path.join(__dirname, 'scheduled-tasks.json'),
            defaultTimezone: 'America/Mexico_City'
        };
        
        this.init();
    }

    init() {
        // Crear directorio de logs si no existe
        if (!fs.existsSync(this.config.logDir)) {
            fs.mkdirSync(this.config.logDir, { recursive: true });
        }
        
        this.loadTasks();
        this.log('Scheduler System iniciado');
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        const logFile = path.join(this.config.logDir, `scheduler-${new Date().toISOString().split('T')[0]}.log`);
        
        fs.appendFileSync(logFile, logEntry);
        console.log(logEntry.trim());
    }

    loadTasks() {
        try {
            if (fs.existsSync(this.config.tasksFile)) {
                const tasksData = JSON.parse(fs.readFileSync(this.config.tasksFile, 'utf8'));
                tasksData.forEach(task => {
                    this.scheduleTask(task);
                });
                this.log(`Cargadas ${tasksData.length} tareas programadas`);
            }
        } catch (error) {
            this.log(`Error cargando tareas: ${error.message}`, 'ERROR');
        }
    }

    saveTasks() {
        try {
            const tasksData = Array.from(this.tasks.values()).map(task => ({
                id: task.id,
                name: task.name,
                schedule: task.schedule,
                command: task.command,
                enabled: task.enabled,
                description: task.description,
                lastRun: task.lastRun,
                nextRun: task.nextRun
            }));
            
            fs.writeFileSync(this.config.tasksFile, JSON.stringify(tasksData, null, 2));
        } catch (error) {
            this.log(`Error guardando tareas: ${error.message}`, 'ERROR');
        }
    }

    scheduleTask(taskConfig) {
        const task = {
            id: taskConfig.id || this.generateId(),
            name: taskConfig.name,
            schedule: taskConfig.schedule,
            command: taskConfig.command,
            enabled: taskConfig.enabled !== false,
            description: taskConfig.description || '',
            lastRun: null,
            nextRun: null,
            cronJob: null
        };

        if (task.enabled && task.schedule) {
            try {
                task.cronJob = cron.schedule(task.schedule, () => {
                    this.executeTask(task);
                }, {
                    scheduled: true,
                    timezone: taskConfig.timezone || this.config.defaultTimezone
                });
                
                // Calcular próxima ejecución
                const nextRun = cron.getNextDate(task.schedule);
                task.nextRun = nextRun.toISOString();
                
                this.log(`Tarea programada: ${task.name} (${task.schedule})`);
            } catch (error) {
                this.log(`Error programando tarea ${task.name}: ${error.message}`, 'ERROR');
                task.enabled = false;
            }
        }

        this.tasks.set(task.id, task);
        this.saveTasks();
        return task.id;
    }

    executeTask(task) {
        try {
            this.log(`Ejecutando tarea: ${task.name}`);
            task.lastRun = new Date().toISOString();
            
            // Ejecutar comando
            const { execSync } = require('child_process');
            const result = execSync(task.command, { 
                encoding: 'utf8',
                cwd: path.join(__dirname, '..')
            });
            
            this.log(`Tarea ${task.name} completada exitosamente`);
            
            // Actualizar próxima ejecución
            if (task.cronJob) {
                const nextRun = cron.getNextDate(task.schedule);
                task.nextRun = nextRun.toISOString();
            }
            
            this.saveTasks();
            return result;
        } catch (error) {
            this.log(`Error ejecutando tarea ${task.name}: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    createTask(name, schedule, command, description = '') {
        const taskConfig = {
            name,
            schedule,
            command,
            description,
            enabled: true
        };
        
        return this.scheduleTask(taskConfig);
    }

    updateTask(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Tarea ${taskId} no encontrada`);
        }

        // Detener tarea actual si está programada
        if (task.cronJob) {
            task.cronJob.stop();
        }

        // Actualizar configuración
        Object.assign(task, updates);

        // Reprogramar si está habilitada
        if (task.enabled && task.schedule) {
            try {
                task.cronJob = cron.schedule(task.schedule, () => {
                    this.executeTask(task);
                }, {
                    scheduled: true,
                    timezone: updates.timezone || this.config.defaultTimezone
                });
                
                const nextRun = cron.getNextDate(task.schedule);
                task.nextRun = nextRun.toISOString();
            } catch (error) {
                this.log(`Error reprogramando tarea ${task.name}: ${error.message}`, 'ERROR');
                task.enabled = false;
            }
        }

        this.saveTasks();
        this.log(`Tarea ${task.name} actualizada`);
    }

    deleteTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Tarea ${taskId} no encontrada`);
        }

        if (task.cronJob) {
            task.cronJob.stop();
        }

        this.tasks.delete(taskId);
        this.saveTasks();
        this.log(`Tarea ${task.name} eliminada`);
    }

    enableTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Tarea ${taskId} no encontrada`);
        }

        if (!task.enabled) {
            task.enabled = true;
            this.scheduleTask(task);
            this.log(`Tarea ${task.name} habilitada`);
        }
    }

    disableTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Tarea ${taskId} no encontrada`);
        }

        if (task.enabled) {
            task.enabled = false;
            if (task.cronJob) {
                task.cronJob.stop();
                task.cronJob = null;
            }
            this.saveTasks();
            this.log(`Tarea ${task.name} deshabilitada`);
        }
    }

    runTaskNow(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Tarea ${taskId} no encontrada`);
        }

        return this.executeTask(task);
    }

    getTask(taskId) {
        return this.tasks.get(taskId);
    }

    listTasks() {
        return Array.from(this.tasks.values()).map(task => ({
            id: task.id,
            name: task.name,
            schedule: task.schedule,
            enabled: task.enabled,
            description: task.description,
            lastRun: task.lastRun,
            nextRun: task.nextRun
        }));
    }

    getTasksByStatus(enabled = null) {
        const tasks = this.listTasks();
        if (enabled === null) return tasks;
        return tasks.filter(task => task.enabled === enabled);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Tareas predefinidas para el metaverso
    createDefaultTasks() {
        const defaultTasks = [
            {
                name: 'Health Check Diario',
                schedule: '0 6 * * *', // 6:00 AM diario
                command: 'bash ../monitor/health-check.sh',
                description: 'Verificación diaria del estado del sistema'
            },
            {
                name: 'Backup Automático',
                schedule: '0 2 * * *', // 2:00 AM diario
                command: 'bash ../toolkit/backup.sh',
                description: 'Backup automático de datos del metaverso'
            },
            {
                name: 'Auditoría de Seguridad',
                schedule: '0 4 * * 0', // 4:00 AM domingos
                command: 'bash ../security/audit.sh',
                description: 'Auditoría semanal de seguridad'
            },
            {
                name: 'Limpieza del Sistema',
                schedule: '0 3 * * 0', // 3:00 AM domingos
                command: 'bash ../toolkit/cleanup.sh',
                description: 'Limpieza semanal de archivos temporales'
            },
            {
                name: 'Check de Performance',
                schedule: '*/30 * * * *', // Cada 30 minutos
                command: 'node ../monitor/performance-check.js',
                description: 'Monitoreo de rendimiento cada 30 minutos'
            }
        ];

        defaultTasks.forEach(taskConfig => {
            this.createTask(
                taskConfig.name,
                taskConfig.schedule,
                taskConfig.command,
                taskConfig.description
            );
        });

        this.log('Tareas predefinidas creadas');
    }

    getStatus() {
        return {
            totalTasks: this.tasks.size,
            enabledTasks: this.getTasksByStatus(true).length,
            disabledTasks: this.getTasksByStatus(false).length,
            nextScheduledTask: this.getNextScheduledTask()
        };
    }

    getNextScheduledTask() {
        const enabledTasks = this.getTasksByStatus(true);
        if (enabledTasks.length === 0) return null;

        return enabledTasks
            .filter(task => task.nextRun)
            .sort((a, b) => new Date(a.nextRun) - new Date(b.nextRun))[0];
    }
}

// CLI Interface
if (require.main === module) {
    const scheduler = new MetaversoScheduler();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'create':
            const name = args[1];
            const schedule = args[2];
            const cmd = args[3];
            const description = args[4] || '';
            
            if (name && schedule && cmd) {
                const taskId = scheduler.createTask(name, schedule, cmd, description);
                console.log(`Tarea creada con ID: ${taskId}`);
            } else {
                console.log('Uso: node scheduler.js create <name> <schedule> <command> [description]');
            }
            break;
            
        case 'list':
            const tasks = scheduler.listTasks();
            console.log('Tareas programadas:');
            tasks.forEach(task => {
                const status = task.enabled ? '✓' : '✗';
                console.log(`  ${status} ${task.name} (${task.schedule})`);
                if (task.description) {
                    console.log(`    ${task.description}`);
                }
            });
            break;
            
        case 'run':
            const taskId = args[1];
            if (taskId) {
                try {
                    scheduler.runTaskNow(taskId);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node scheduler.js run <task-id>');
            }
            break;
            
        case 'enable':
            const enableId = args[1];
            if (enableId) {
                try {
                    scheduler.enableTask(enableId);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node scheduler.js enable <task-id>');
            }
            break;
            
        case 'disable':
            const disableId = args[1];
            if (disableId) {
                try {
                    scheduler.disableTask(disableId);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node scheduler.js disable <task-id>');
            }
            break;
            
        case 'delete':
            const deleteId = args[1];
            if (deleteId) {
                try {
                    scheduler.deleteTask(deleteId);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.log('Uso: node scheduler.js delete <task-id>');
            }
            break;
            
        case 'status':
            console.log(JSON.stringify(scheduler.getStatus(), null, 2));
            break;
            
        case 'init-defaults':
            scheduler.createDefaultTasks();
            break;
            
        default:
            console.log(`
Scheduler System - Comandos disponibles:
  create <name> <schedule> <command> [desc]  - Crear nueva tarea
  list                                    - Listar tareas
  run <task-id>                           - Ejecutar tarea ahora
  enable <task-id>                        - Habilitar tarea
  disable <task-id>                       - Deshabilitar tarea
  delete <task-id>                        - Eliminar tarea
  status                                  - Mostrar estado
  init-defaults                           - Crear tareas predefinidas
            `);
    }
}

module.exports = MetaversoScheduler;
