#!/usr/bin/env node

/**
 * 🎯 Orquestador de Integración Cross-Módulo - Metaverso Web3
 * 
 * Este script coordina todos los módulos del .bin para realizar
 * operaciones complejas como builds completos, despliegues y monitoreo.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { performance } = require('perf_hooks');

// Configuración de módulos
const MODULES = {
  builder: {
    path: path.join(__dirname, '../builder'),
    scripts: ['compile.sh', 'optimize-assets.js'],
    dependencies: []
  },
  deploy: {
    path: path.join(__dirname, '../deploy'),
    scripts: ['deploy-mainnet.sh', 'deploy-testnet.sh'],
    dependencies: ['builder']
  },
  blockchain: {
    path: path.join(__dirname, '../blockchain'),
    scripts: ['deploy-contracts.js', 'mint-nft.js'],
    dependencies: []
  },
  monitor: {
    path: path.join(__dirname, '../monitor'),
    scripts: ['health-check.sh', 'performance-check.js'],
    dependencies: ['deploy']
  },
  security: {
    path: path.join(__dirname, '../security'),
    scripts: ['audit.sh', 'scan-vulnerabilities.js'],
    dependencies: []
  },
  metaverso: {
    path: path.join(__dirname, '../metaverso'),
    scripts: ['generate-world.js', 'process-assets.js'],
    dependencies: ['builder', 'blockchain']
  },
  toolkit: {
    path: path.join(__dirname, '../toolkit'),
    scripts: ['backup.sh', 'cleanup.sh'],
    dependencies: []
  },
  params: {
    path: path.join(__dirname, '../params'),
    scripts: ['run-tests.sh', 'coverage-report.js'],
    dependencies: ['builder']
  }
};

// Estados de ejecución
const ExecutionStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  SKIPPED: 'skipped'
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

class IntegrationOrchestrator {
  constructor() {
    this.executionLog = [];
    this.moduleStatus = new Map();
    this.startTime = performance.now();
  }

  log(message, color = 'reset', module = 'ORCHESTRATOR') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${module}] ${message}`;
    console.log(`${colors[color]}${logMessage}${colors.reset}`);
    
    this.executionLog.push({
      timestamp,
      module,
      message,
      level: color === 'red' ? 'ERROR' : color === 'yellow' ? 'WARN' : 'INFO'
    });
  }

  // Verificar dependencias
  checkDependencies(moduleName) {
    const module = MODULES[moduleName];
    if (!module) {
      throw new Error(`Módulo ${moduleName} no encontrado`);
    }

    for (const dep of module.dependencies) {
      const depStatus = this.moduleStatus.get(dep);
      if (depStatus !== ExecutionStatus.SUCCESS) {
        this.log(`Dependencia ${dep} no está lista (${depStatus})`, 'yellow', moduleName);
        return false;
      }
    }
    return true;
  }

  // Ejecutar script
  async executeScript(moduleName, scriptName) {
    const module = MODULES[moduleName];
    const scriptPath = path.join(module.path, scriptName);
    
    if (!fs.existsSync(scriptPath)) {
      this.log(`Script ${scriptName} no encontrado en ${moduleName}`, 'yellow', moduleName);
      return ExecutionStatus.SKIPPED;
    }

    this.log(`Ejecutando ${scriptName}...`, 'blue', moduleName);
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      try {
        let command;
        let args = [];
        
        if (scriptName.endsWith('.sh')) {
          command = 'bash';
          args = [scriptPath];
        } else if (scriptName.endsWith('.js')) {
          command = 'node';
          args = [scriptPath];
        } else {
          command = scriptPath;
        }

        const child = spawn(command, args, {
          cwd: module.path,
          stdio: 'pipe',
          shell: true
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
          this.log(data.toString().trim(), 'cyan', moduleName);
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
          this.log(data.toString().trim(), 'yellow', moduleName);
        });

        child.on('close', (code) => {
          const duration = performance.now() - startTime;
          
          if (code === 0) {
            this.log(`${scriptName} completado exitosamente (${duration.toFixed(2)}ms)`, 'green', moduleName);
            resolve(ExecutionStatus.SUCCESS);
          } else {
            this.log(`${scriptName} falló con código ${code} (${duration.toFixed(2)}ms)`, 'red', moduleName);
            if (stderr) {
              this.log(`Error: ${stderr}`, 'red', moduleName);
            }
            resolve(ExecutionStatus.FAILED);
          }
        });

        child.on('error', (error) => {
          const duration = performance.now() - startTime;
          this.log(`${scriptName} error: ${error.message} (${duration.toFixed(2)}ms)`, 'red', moduleName);
          resolve(ExecutionStatus.FAILED);
        });

      } catch (error) {
        this.log(`Error ejecutando ${scriptName}: ${error.message}`, 'red', moduleName);
        resolve(ExecutionStatus.FAILED);
      }
    });
  }

  // Ejecutar módulo completo
  async executeModule(moduleName) {
    const module = MODULES[moduleName];
    
    if (!module) {
      this.log(`Módulo ${moduleName} no encontrado`, 'red');
      return ExecutionStatus.FAILED;
    }

    this.log(`Iniciando ejecución del módulo ${moduleName}`, 'blue', moduleName);
    this.moduleStatus.set(moduleName, ExecutionStatus.RUNNING);

    // Verificar dependencias
    if (!this.checkDependencies(moduleName)) {
      this.moduleStatus.set(moduleName, ExecutionStatus.SKIPPED);
      this.log(`Módulo ${moduleName} omitido por dependencias no satisfechas`, 'yellow', moduleName);
      return ExecutionStatus.SKIPPED;
    }

    // Ejecutar scripts del módulo
    for (const script of module.scripts) {
      const status = await this.executeScript(moduleName, script);
      
      if (status === ExecutionStatus.FAILED) {
        this.moduleStatus.set(moduleName, ExecutionStatus.FAILED);
        this.log(`Módulo ${moduleName} falló en script ${script}`, 'red', moduleName);
        return ExecutionStatus.FAILED;
      }
    }

    this.moduleStatus.set(moduleName, ExecutionStatus.SUCCESS);
    this.log(`Módulo ${moduleName} completado exitosamente`, 'green', moduleName);
    return ExecutionStatus.SUCCESS;
  }

  // Ejecutar pipeline completo
  async executePipeline(pipelineName) {
    this.log(`🚀 Iniciando pipeline: ${pipelineName}`, 'magenta');
    
    const pipelines = {
      'build': ['builder', 'params'],
      'deploy': ['builder', 'blockchain', 'deploy', 'monitor'],
      'security': ['security', 'monitor'],
      'metaverso': ['builder', 'blockchain', 'metaverso', 'monitor'],
      'full': Object.keys(MODULES),
      'test': ['builder', 'params', 'security'],
      'maintenance': ['toolkit', 'monitor']
    };

    const moduleOrder = pipelines[pipelineName];
    if (!moduleOrder) {
      this.log(`Pipeline ${pipelineName} no encontrado`, 'red');
      return false;
    }

    // Ejecutar módulos en orden
    for (const moduleName of moduleOrder) {
      const status = await this.executeModule(moduleName);
      
      if (status === ExecutionStatus.FAILED) {
        this.log(`Pipeline ${pipelineName} falló en módulo ${moduleName}`, 'red');
        return false;
      }
    }

    const totalTime = performance.now() - this.startTime;
    this.log(`✅ Pipeline ${pipelineName} completado exitosamente (${totalTime.toFixed(2)}ms)`, 'green');
    return true;
  }

  // Generar reporte
  generateReport() {
    const totalTime = performance.now() - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: totalTime,
      modules: Object.fromEntries(this.moduleStatus),
      logs: this.executionLog,
      summary: {
        total: this.moduleStatus.size,
        success: Array.from(this.moduleStatus.values()).filter(s => s === ExecutionStatus.SUCCESS).length,
        failed: Array.from(this.moduleStatus.values()).filter(s => s === ExecutionStatus.FAILED).length,
        skipped: Array.from(this.moduleStatus.values()).filter(s => s === ExecutionStatus.SKIPPED).length
      }
    };

    // Mostrar resumen
    this.log('\n📊 RESUMEN DE EJECUCIÓN', 'magenta');
    this.log('=' * 50, 'magenta');
    this.log(`Tiempo Total: ${totalTime.toFixed(2)}ms`, 'blue');
    this.log(`Módulos Totales: ${report.summary.total}`, 'blue');
    this.log(`✅ Exitosos: ${report.summary.success}`, 'green');
    this.log(`❌ Fallidos: ${report.summary.failed}`, 'red');
    this.log(`⏭️ Omitidos: ${report.summary.skipped}`, 'yellow');

    // Estado de cada módulo
    this.log('\n🔧 ESTADO DE MÓDULOS:', 'magenta');
    for (const [module, status] of this.moduleStatus) {
      const icon = status === ExecutionStatus.SUCCESS ? '✅' : 
                   status === ExecutionStatus.FAILED ? '❌' : 
                   status === ExecutionStatus.SKIPPED ? '⏭️' : '🔄';
      const color = status === ExecutionStatus.SUCCESS ? 'green' : 
                    status === ExecutionStatus.FAILED ? 'red' : 
                    status === ExecutionStatus.SKIPPED ? 'yellow' : 'blue';
      this.log(`${icon} ${module}: ${status}`, color);
    }

    // Guardar reporte
    const reportPath = path.join(__dirname, '../logs/integration-report.json');
    const logDir = path.dirname(reportPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n💾 Reporte guardado en: ${reportPath}`, 'green');

    return report;
  }

  // Mostrar ayuda
  showHelp() {
    console.log(`
🎯 Orquestador de Integración Cross-Módulo - Metaverso Web3

Uso: node integration-orchestrator.js <pipeline> [opciones]

PIPELINES DISPONIBLES:
  build      - Compilación y testing
  deploy     - Despliegue completo
  security   - Auditoría de seguridad
  metaverso  - Generación de mundo virtual
  full       - Pipeline completo
  test       - Solo testing
  maintenance - Mantenimiento del sistema

MÓDULOS DISPONIBLES:
  ${Object.keys(MODULES).join(', ')}

EJEMPLOS:
  node integration-orchestrator.js build
  node integration-orchestrator.js deploy
  node integration-orchestrator.js full

OPCIONES:
  --help     - Mostrar esta ayuda
  --verbose  - Modo verbose
  --dry-run  - Simular ejecución sin cambios
    `);
  }
}

// Función principal
async function main() {
  const orchestrator = new IntegrationOrchestrator();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    orchestrator.showHelp();
    return;
  }

  const pipeline = args[0];
  
  try {
    const success = await orchestrator.executePipeline(pipeline);
    orchestrator.generateReport();
    
    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    orchestrator.log(`Error en orquestador: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = IntegrationOrchestrator; 