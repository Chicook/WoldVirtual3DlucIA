#!/usr/bin/env node

/**
 * 📊 Performance Check - Metaverso Web3
 * Monitorea métricas de rendimiento en tiempo real
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

// Configuración
const CONFIG = {
    interval: 5000, // 5 segundos
    logFile: `performance-${new Date().toISOString().split('T')[0]}.log`,
    thresholds: {
        cpu: 80, // %
        memory: 85, // %
        disk: 90, // %
        fps: 30, // FPS mínimo
        latency: 1000 // ms máximo
    }
};

// Colores para consola
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            cpu: [],
            memory: [],
            disk: [],
            network: [],
            processes: [],
            fps: [],
            latency: []
        };
        this.alerts = [];
        this.startTime = performance.now();
    }

    log(message, color = 'reset', level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(`${colors[color]}${logMessage}${colors.reset}`);
        
        // Guardar en archivo
        fs.appendFileSync(CONFIG.logFile, `${logMessage}\n`);
    }

    // Obtener métricas del sistema
    getSystemMetrics() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = (usedMem / totalMem) * 100;

        const cpus = os.cpus();
        const cpuUsage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length;

        return {
            cpu: cpuUsage.toFixed(2),
            memory: memoryUsage.toFixed(2),
            totalMemory: (totalMem / 1024 / 1024 / 1024).toFixed(2),
            usedMemory: (usedMem / 1024 / 1024 / 1024).toFixed(2),
            freeMemory: (freeMem / 1024 / 1024 / 1024).toFixed(2),
            uptime: os.uptime(),
            loadAverage: os.loadavg()
        };
    }

    // Obtener métricas de disco
    getDiskMetrics() {
        try {
            const df = execSync('df -h /', { encoding: 'utf8' });
            const lines = df.split('\n');
            const data = lines[1].split(/\s+/);
            
            return {
                total: data[1],
                used: data[2],
                available: data[3],
                usagePercent: parseInt(data[4].replace('%', ''))
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Obtener métricas de red
    getNetworkMetrics() {
        try {
            const netstat = execSync('netstat -i', { encoding: 'utf8' });
            const lines = netstat.split('\n');
            const eth0 = lines.find(line => line.includes('eth0') || line.includes('en0'));
            
            if (eth0) {
                const data = eth0.split(/\s+/);
                return {
                    interface: data[0],
                    rxBytes: data[3],
                    txBytes: data[7],
                    rxErrors: data[4],
                    txErrors: data[8]
                };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    // Obtener métricas de procesos
    getProcessMetrics() {
        try {
            const ps = execSync('ps aux --sort=-%cpu | head -10', { encoding: 'utf8' });
            const lines = ps.split('\n').slice(1, 6); // Top 5 procesos
            
            return lines.map(line => {
                const data = line.split(/\s+/);
                return {
                    pid: data[1],
                    cpu: data[2],
                    memory: data[3],
                    command: data[10] || data[9]
                };
            }).filter(proc => proc.pid);
        } catch (error) {
            return [{ error: error.message }];
        }
    }

    // Simular métricas de FPS (en un entorno real, esto vendría del frontend)
    getFPSMetrics() {
        // Simulación de FPS basada en carga del sistema
        const systemLoad = os.loadavg()[0];
        const baseFPS = 60;
        const fps = Math.max(30, baseFPS - (systemLoad * 10));
        
        return {
            current: fps.toFixed(1),
            average: (fps * 0.9 + parseFloat(this.metrics.fps[this.metrics.fps.length - 1]?.current || fps) * 0.1).toFixed(1),
            min: Math.min(...this.metrics.fps.map(m => parseFloat(m.current) || 60), fps).toFixed(1),
            max: Math.max(...this.metrics.fps.map(m => parseFloat(m.current) || 60), fps).toFixed(1)
        };
    }

    // Medir latencia de red
    async getLatencyMetrics() {
        const targets = [
            'google.com',
            'cloudflare.com',
            'localhost'
        ];

        const latencies = await Promise.all(
            targets.map(async (target) => {
                try {
                    const start = performance.now();
                    await new Promise((resolve, reject) => {
                        const { exec } = require('child_process');
                        exec(`ping -c 1 ${target}`, (error, stdout) => {
                            if (error) reject(error);
                            else resolve(stdout);
                        });
                    });
                    const end = performance.now();
                    return { target, latency: (end - start).toFixed(2) };
                } catch (error) {
                    return { target, latency: 'timeout' };
                }
            })
        );

        return latencies;
    }

    // Verificar umbrales y generar alertas
    checkThresholds(metrics) {
        const alerts = [];

        if (parseFloat(metrics.cpu) > CONFIG.thresholds.cpu) {
            alerts.push(`CPU usage high: ${metrics.cpu}%`);
        }

        if (parseFloat(metrics.memory) > CONFIG.thresholds.memory) {
            alerts.push(`Memory usage high: ${metrics.memory}%`);
        }

        if (metrics.disk && metrics.disk.usagePercent > CONFIG.thresholds.disk) {
            alerts.push(`Disk usage high: ${metrics.disk.usagePercent}%`);
        }

        if (parseFloat(metrics.fps.current) < CONFIG.thresholds.fps) {
            alerts.push(`FPS low: ${metrics.fps.current}`);
        }

        return alerts;
    }

    // Generar reporte de rendimiento
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            uptime: ((performance.now() - this.startTime) / 1000 / 60).toFixed(2), // minutos
            system: this.getSystemMetrics(),
            disk: this.getDiskMetrics(),
            network: this.getNetworkMetrics(),
            processes: this.getProcessMetrics(),
            fps: this.getFPSMetrics(),
            alerts: this.alerts,
            summary: {
                totalAlerts: this.alerts.length,
                averageCPU: (this.metrics.cpu.reduce((a, b) => a + parseFloat(b), 0) / this.metrics.cpu.length).toFixed(2),
                averageMemory: (this.metrics.memory.reduce((a, b) => a + parseFloat(b), 0) / this.metrics.memory.length).toFixed(2),
                averageFPS: (this.metrics.fps.reduce((a, b) => a + parseFloat(b.current), 0) / this.metrics.fps.length).toFixed(2)
            }
        };

        return report;
    }

    // Mostrar métricas en tiempo real
    displayMetrics(metrics) {
        console.clear();
        console.log(`${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║                    📊 PERFORMANCE MONITOR                    ║${colors.reset}`);
        console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

        // CPU y Memoria
        const cpuColor = parseFloat(metrics.cpu) > CONFIG.thresholds.cpu ? 'red' : 'green';
        const memColor = parseFloat(metrics.memory) > CONFIG.thresholds.memory ? 'red' : 'green';
        
        console.log(`${colors.blue}🖥️  SYSTEM METRICS:${colors.reset}`);
        console.log(`   CPU: ${colors[cpuColor]}${metrics.cpu}%${colors.reset} | Memory: ${colors[memColor]}${metrics.memory}%${colors.reset} | Uptime: ${(metrics.uptime / 3600).toFixed(1)}h`);
        console.log(`   Load Average: ${metrics.loadAverage.map(l => l.toFixed(2)).join(', ')}`);

        // FPS
        const fpsColor = parseFloat(metrics.fps.current) < CONFIG.thresholds.fps ? 'red' : 'green';
        console.log(`\n${colors.blue}🎮 PERFORMANCE:${colors.reset}`);
        console.log(`   FPS: ${colors[fpsColor]}${metrics.fps.current}${colors.reset} (avg: ${metrics.fps.average}, min: ${metrics.fps.min}, max: ${metrics.fps.max})`);

        // Disco
        if (metrics.disk && !metrics.disk.error) {
            const diskColor = metrics.disk.usagePercent > CONFIG.thresholds.disk ? 'red' : 'green';
            console.log(`\n${colors.blue}💾 DISK:${colors.reset}`);
            console.log(`   Usage: ${colors[diskColor]}${metrics.disk.usagePercent}%${colors.reset} | Available: ${metrics.disk.available}`);
        }

        // Procesos
        console.log(`\n${colors.blue}⚙️  TOP PROCESSES:${colors.reset}`);
        metrics.processes.slice(0, 3).forEach((proc, i) => {
            if (proc.error) return;
            const cpuColor = parseFloat(proc.cpu) > 50 ? 'red' : 'green';
            console.log(`   ${i + 1}. ${colors[cpuColor]}${proc.cpu}%${colors.reset} CPU | ${proc.memory}% MEM | ${proc.command.substring(0, 30)}...`);
        });

        // Alertas
        if (this.alerts.length > 0) {
            console.log(`\n${colors.red}🚨 ALERTS:${colors.reset}`);
            this.alerts.slice(-3).forEach(alert => {
                console.log(`   ⚠️  ${alert}`);
            });
        }

        console.log(`\n${colors.yellow}Press Ctrl+C to stop monitoring${colors.reset}`);
    }

    // Iniciar monitoreo
    async start() {
        this.log('🚀 Iniciando Performance Monitor...', 'green');
        this.log(`📁 Log file: ${CONFIG.logFile}`, 'blue');
        this.log(`⏱️  Interval: ${CONFIG.interval}ms`, 'blue');

        const monitor = async () => {
            try {
                // Recolectar métricas
                const systemMetrics = this.getSystemMetrics();
                const diskMetrics = this.getDiskMetrics();
                const networkMetrics = this.getNetworkMetrics();
                const processMetrics = this.getProcessMetrics();
                const fpsMetrics = this.getFPSMetrics();
                const latencyMetrics = await this.getLatencyMetrics();

                // Almacenar métricas
                this.metrics.cpu.push(systemMetrics.cpu);
                this.metrics.memory.push(systemMetrics.memory);
                this.metrics.fps.push(fpsMetrics);

                // Limitar historial
                if (this.metrics.cpu.length > 100) {
                    this.metrics.cpu.shift();
                    this.metrics.memory.shift();
                    this.metrics.fps.shift();
                }

                // Verificar umbrales
                const alerts = this.checkThresholds({
                    ...systemMetrics,
                    disk: diskMetrics,
                    fps: fpsMetrics
                });

                this.alerts.push(...alerts.map(alert => `${new Date().toISOString()}: ${alert}`));

                // Limitar alertas
                if (this.alerts.length > 50) {
                    this.alerts = this.alerts.slice(-50);
                }

                // Mostrar métricas
                this.displayMetrics({
                    ...systemMetrics,
                    disk: diskMetrics,
                    network: networkMetrics,
                    processes: processMetrics,
                    fps: fpsMetrics,
                    latency: latencyMetrics
                });

            } catch (error) {
                this.log(`Error en monitoreo: ${error.message}`, 'red', 'ERROR');
            }
        };

        // Ejecutar inmediatamente
        await monitor();

        // Configurar intervalo
        setInterval(monitor, CONFIG.interval);
    }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('\n\n📊 Generando reporte final...');
    const monitor = new PerformanceMonitor();
    const report = monitor.generateReport();
    
    console.log('\n📋 PERFORMANCE REPORT:');
    console.log(JSON.stringify(report, null, 2));
    
    process.exit(0);
});

// Iniciar si es el script principal
if (require.main === module) {
    const monitor = new PerformanceMonitor();
    monitor.start();
}

module.exports = PerformanceMonitor; 