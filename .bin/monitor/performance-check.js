#!/usr/bin/env node

/**
 * 📊 Script de Monitoreo de Rendimiento - Metaverso Web3
 * 
 * Este script monitorea el rendimiento del ecosistema completo del metaverso,
 * incluyendo métricas de blockchain, 3D, networking y economía.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

// Configuración
const CONFIG = {
  endpoints: {
    client: process.env.CLIENT_URL || 'http://localhost:3000',
    gateway: process.env.GATEWAY_URL || 'http://localhost:4000',
    engine: process.env.ENGINE_URL || 'http://localhost:5000',
    blockchain: process.env.BLOCKCHAIN_RPC || 'https://eth-mainnet.alchemyapi.io/v2/'
  },
  thresholds: {
    responseTime: 2000, // ms
    memoryUsage: 80, // %
    cpuUsage: 70, // %
    errorRate: 5 // %
  },
  logFile: path.join(__dirname, '../logs/performance.log')
};

// Colores para consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(`${colors[color]}${logMessage}${colors.reset}`);
  
  // Guardar en archivo
  fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
}

// Métricas del sistema
function getSystemMetrics() {
  try {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    
    return {
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      uptime: process.uptime()
    };
  } catch (error) {
    log(`Error obteniendo métricas del sistema: ${error.message}`, 'red');
    return null;
  }
}

// Health check de endpoints
async function healthCheck(url, service) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = protocol.get(url + '/health', (res) => {
      const responseTime = Date.now() - startTime;
      const status = res.statusCode;
      
      resolve({
        service,
        status,
        responseTime,
        healthy: status >= 200 && status < 300,
        timestamp: new Date().toISOString()
      });
    });
    
    req.on('error', (error) => {
      resolve({
        service,
        status: 0,
        responseTime: Date.now() - startTime,
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        service,
        status: 0,
        responseTime: 5000,
        healthy: false,
        error: 'Timeout',
        timestamp: new Date().toISOString()
      });
    });
  });
}

// Métricas de blockchain
async function getBlockchainMetrics() {
  try {
    // Simular métricas de blockchain (en producción usaría Web3.js)
    const metrics = {
      gasPrice: Math.random() * 100 + 20, // Gwei
      blockNumber: Math.floor(Math.random() * 1000000),
      pendingTransactions: Math.floor(Math.random() * 1000),
      networkLoad: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
    
    return metrics;
  } catch (error) {
    log(`Error obteniendo métricas de blockchain: ${error.message}`, 'red');
    return null;
  }
}

// Métricas de 3D (simuladas)
function get3DMetrics() {
  try {
    return {
      fps: Math.random() * 30 + 30, // 30-60 FPS
      drawCalls: Math.floor(Math.random() * 1000),
      triangles: Math.floor(Math.random() * 100000),
      memoryUsage: Math.random() * 512 + 128, // MB
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log(`Error obteniendo métricas 3D: ${error.message}`, 'red');
    return null;
  }
}

// Análisis de logs
function analyzeLogs() {
  try {
    const logPath = path.join(__dirname, '../logs/');
    const files = fs.readdirSync(logPath).filter(f => f.endsWith('.log'));
    
    const analysis = {
      totalLogs: 0,
      errors: 0,
      warnings: 0,
      criticalErrors: 0
    };
    
    files.forEach(file => {
      const content = fs.readFileSync(path.join(logPath, file), 'utf8');
      const lines = content.split('\n');
      
      analysis.totalLogs += lines.length;
      analysis.errors += (content.match(/ERROR/g) || []).length;
      analysis.warnings += (content.match(/WARN/g) || []).length;
      analysis.criticalErrors += (content.match(/CRITICAL/g) || []).length;
    });
    
    return analysis;
  } catch (error) {
    log(`Error analizando logs: ${error.message}`, 'red');
    return null;
  }
}

// Generar reporte
function generateReport(metrics) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      overallHealth: 'healthy',
      criticalIssues: 0,
      warnings: 0
    },
    services: metrics.services,
    system: metrics.system,
    blockchain: metrics.blockchain,
    threeD: metrics.threeD,
    logs: metrics.logs
  };
  
  // Evaluar salud general
  let criticalIssues = 0;
  let warnings = 0;
  
  metrics.services.forEach(service => {
    if (!service.healthy) criticalIssues++;
    if (service.responseTime > CONFIG.thresholds.responseTime) warnings++;
  });
  
  if (metrics.system) {
    const memoryPercent = (metrics.system.memory.heapUsed / metrics.system.memory.heapTotal) * 100;
    if (memoryPercent > CONFIG.thresholds.memoryUsage) warnings++;
  }
  
  if (metrics.logs && metrics.logs.criticalErrors > 0) criticalIssues += metrics.logs.criticalErrors;
  
  report.summary.criticalIssues = criticalIssues;
  report.summary.warnings = warnings;
  report.summary.overallHealth = criticalIssues > 0 ? 'critical' : warnings > 0 ? 'warning' : 'healthy';
  
  return report;
}

// Función principal
async function main() {
  log('🚀 Iniciando monitoreo de rendimiento del Metaverso Web3...', 'blue');
  
  // Crear directorio de logs si no existe
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  try {
    // Health checks de servicios
    log('🔍 Verificando salud de servicios...', 'blue');
    const healthChecks = await Promise.all([
      healthCheck(CONFIG.endpoints.client, 'client'),
      healthCheck(CONFIG.endpoints.gateway, 'gateway'),
      healthCheck(CONFIG.endpoints.engine, 'engine')
    ]);
    
    // Métricas del sistema
    log('📊 Recolectando métricas del sistema...', 'blue');
    const systemMetrics = getSystemMetrics();
    
    // Métricas de blockchain
    log('⛓️ Recolectando métricas de blockchain...', 'blue');
    const blockchainMetrics = await getBlockchainMetrics();
    
    // Métricas 3D
    log('🎮 Recolectando métricas 3D...', 'blue');
    const threeDMetrics = get3DMetrics();
    
    // Análisis de logs
    log('📝 Analizando logs...', 'blue');
    const logAnalysis = analyzeLogs();
    
    // Generar reporte
    const report = generateReport({
      services: healthChecks,
      system: systemMetrics,
      blockchain: blockchainMetrics,
      threeD: threeDMetrics,
      logs: logAnalysis
    });
    
    // Mostrar resultados
    log('\n📋 REPORTE DE RENDIMIENTO', 'blue');
    log('=' * 50, 'blue');
    
    log(`Estado General: ${report.summary.overallHealth.toUpperCase()}`, 
        report.summary.overallHealth === 'healthy' ? 'green' : 
        report.summary.overallHealth === 'warning' ? 'yellow' : 'red');
    
    log(`Problemas Críticos: ${report.summary.criticalIssues}`, 
        report.summary.criticalIssues > 0 ? 'red' : 'green');
    
    log(`Advertencias: ${report.summary.warnings}`, 
        report.summary.warnings > 0 ? 'yellow' : 'green');
    
    // Detalles de servicios
    log('\n🔧 SERVICIOS:', 'blue');
    report.services.forEach(service => {
      const status = service.healthy ? '✅' : '❌';
      const color = service.healthy ? 'green' : 'red';
      log(`${status} ${service.service}: ${service.status} (${service.responseTime}ms)`, color);
    });
    
    // Métricas de blockchain
    if (report.blockchain) {
      log('\n⛓️ BLOCKCHAIN:', 'blue');
      log(`Gas Price: ${report.blockchain.gasPrice.toFixed(2)} Gwei`, 'green');
      log(`Block Number: ${report.blockchain.blockNumber}`, 'green');
      log(`Pending TX: ${report.blockchain.pendingTransactions}`, 'green');
    }
    
    // Métricas 3D
    if (report.threeD) {
      log('\n🎮 3D RENDERING:', 'blue');
      log(`FPS: ${report.threeD.fps.toFixed(1)}`, 'green');
      log(`Draw Calls: ${report.threeD.drawCalls}`, 'green');
      log(`Triangles: ${report.threeD.triangles.toLocaleString()}`, 'green');
    }
    
    // Guardar reporte
    const reportPath = path.join(logDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\n💾 Reporte guardado en: ${reportPath}`, 'green');
    
    // Alertas si hay problemas críticos
    if (report.summary.criticalIssues > 0) {
      log(`\n🚨 ALERTA: ${report.summary.criticalIssues} problema(s) crítico(s) detectado(s)!`, 'red');
      process.exit(1);
    }
    
    log('\n✅ Monitoreo completado exitosamente', 'green');
    
  } catch (error) {
    log(`❌ Error durante el monitoreo: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  main,
  healthCheck,
  getSystemMetrics,
  getBlockchainMetrics,
  get3DMetrics,
  analyzeLogs,
  generateReport
}; 