#!/usr/bin/env node

/**
 * 🔍 Validador Cross-Módulo - Metaverso Web3
 * 
 * Este script valida la integridad y consistencia entre todos los módulos
 * del .bin, verificando dependencias, configuraciones y compatibilidad.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración de validación
const VALIDATION_CONFIG = {
  modules: {
    builder: {
      required: ['compile.sh', 'optimize-assets.js'],
      dependencies: ['node_modules'],
      configs: ['package.json']
    },
    deploy: {
      required: ['deploy-mainnet.sh', 'deploy-testnet.sh'],
      dependencies: ['builder'],
      configs: ['package.json']
    },
    blockchain: {
      required: ['deploy-contracts.js', 'mint-nft.js'],
      dependencies: ['node_modules'],
      configs: ['package.json', 'hardhat.config.js']
    },
    monitor: {
      required: ['health-check.sh', 'performance-check.js'],
      dependencies: ['deploy'],
      configs: ['package.json']
    },
    security: {
      required: ['audit.sh', 'scan-vulnerabilities.js'],
      dependencies: ['node_modules'],
      configs: ['package.json']
    },
    metaverso: {
      required: ['generate-world.js', 'process-assets.js'],
      dependencies: ['builder', 'blockchain'],
      configs: ['package.json']
    },
    toolkit: {
      required: ['backup.sh', 'cleanup.sh'],
      dependencies: [],
      configs: []
    },
    params: {
      required: ['run-tests.sh', 'coverage-report.js'],
      dependencies: ['builder'],
      configs: ['package.json']
    }
  },
  global: {
    required: ['JERARQUIA.MD', 'README.md', 'informacion_y_flujodetrabajo.md'],
    configs: ['package.json', '.env.example']
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

class ModuleValidator {
  constructor() {
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: {}
    };
    this.basePath = path.join(__dirname, '..');
  }

  log(message, color = 'reset', module = 'VALIDATOR') {
    const timestamp = new Date().toISOString();
    console.log(`${colors[color]}[${timestamp}] [${module}] ${message}${colors.reset}`);
  }

  // Validar archivos requeridos
  validateRequiredFiles(moduleName, modulePath) {
    const config = VALIDATION_CONFIG.modules[moduleName];
    const results = {
      passed: 0,
      failed: 0,
      missing: []
    };

    for (const file of config.required) {
      const filePath = path.join(modulePath, file);
      if (fs.existsSync(filePath)) {
        results.passed++;
        this.log(`✅ ${file} encontrado`, 'green', moduleName);
      } else {
        results.failed++;
        results.missing.push(file);
        this.log(`❌ ${file} no encontrado`, 'red', moduleName);
      }
    }

    return results;
  }

  // Validar configuraciones
  validateConfigs(moduleName, modulePath) {
    const config = VALIDATION_CONFIG.modules[moduleName];
    const results = {
      passed: 0,
      failed: 0,
      invalid: []
    };

    for (const configFile of config.configs) {
      const configPath = path.join(modulePath, configFile);
      if (fs.existsSync(configPath)) {
        try {
          if (configFile === 'package.json') {
            const pkg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (pkg.name && pkg.version) {
              results.passed++;
              this.log(`✅ ${configFile} válido`, 'green', moduleName);
            } else {
              results.failed++;
              results.invalid.push(configFile);
              this.log(`❌ ${configFile} inválido (falta name/version)`, 'red', moduleName);
            }
          } else {
            results.passed++;
            this.log(`✅ ${configFile} encontrado`, 'green', moduleName);
          }
        } catch (error) {
          results.failed++;
          results.invalid.push(configFile);
          this.log(`❌ ${configFile} inválido: ${error.message}`, 'red', moduleName);
        }
      } else {
        results.failed++;
        results.invalid.push(configFile);
        this.log(`❌ ${configFile} no encontrado`, 'red', moduleName);
      }
    }

    return results;
  }

  // Validar dependencias
  validateDependencies(moduleName, modulePath) {
    const config = VALIDATION_CONFIG.modules[moduleName];
    const results = {
      passed: 0,
      failed: 0,
      missing: []
    };

    for (const dep of config.dependencies) {
      if (dep === 'node_modules') {
        const nodeModulesPath = path.join(modulePath, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          results.passed++;
          this.log(`✅ node_modules encontrado`, 'green', moduleName);
        } else {
          results.failed++;
          results.missing.push(dep);
          this.log(`❌ node_modules no encontrado`, 'red', moduleName);
        }
      } else {
        const depPath = path.join(this.basePath, dep);
        if (fs.existsSync(depPath)) {
          results.passed++;
          this.log(`✅ Dependencia ${dep} encontrada`, 'green', moduleName);
        } else {
          results.failed++;
          results.missing.push(dep);
          this.log(`❌ Dependencia ${dep} no encontrada`, 'red', moduleName);
        }
      }
    }

    return results;
  }

  // Validar permisos de ejecución
  validatePermissions(moduleName, modulePath) {
    const config = VALIDATION_CONFIG.modules[moduleName];
    const results = {
      passed: 0,
      failed: 0,
      noPermission: []
    };

    for (const file of config.required) {
      if (file.endsWith('.sh')) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          try {
            const stats = fs.statSync(filePath);
            const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
            
            if (isExecutable) {
              results.passed++;
              this.log(`✅ ${file} tiene permisos de ejecución`, 'green', moduleName);
            } else {
              results.failed++;
              results.noPermission.push(file);
              this.log(`⚠️ ${file} no tiene permisos de ejecución`, 'yellow', moduleName);
            }
          } catch (error) {
            results.failed++;
            results.noPermission.push(file);
            this.log(`❌ Error verificando permisos de ${file}: ${error.message}`, 'red', moduleName);
          }
        }
      }
    }

    return results;
  }

  // Validar sintaxis de scripts
  validateScriptSyntax(moduleName, modulePath) {
    const config = VALIDATION_CONFIG.modules[moduleName];
    const results = {
      passed: 0,
      failed: 0,
      syntaxErrors: []
    };

    for (const file of config.required) {
      if (file.endsWith('.js')) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          try {
            // Verificar sintaxis básica de JavaScript
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar que tenga shebang
            if (!content.startsWith('#!/usr/bin/env node')) {
              this.log(`⚠️ ${file} no tiene shebang`, 'yellow', moduleName);
            }
            
            // Verificar sintaxis con node
            execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
            results.passed++;
            this.log(`✅ ${file} sintaxis válida`, 'green', moduleName);
          } catch (error) {
            results.failed++;
            results.syntaxErrors.push(file);
            this.log(`❌ ${file} error de sintaxis: ${error.message}`, 'red', moduleName);
          }
        }
      }
    }

    return results;
  }

  // Validar módulo completo
  validateModule(moduleName) {
    this.log(`🔍 Validando módulo: ${moduleName}`, 'blue');
    
    const modulePath = path.join(this.basePath, moduleName);
    const config = VALIDATION_CONFIG.modules[moduleName];
    
    if (!config) {
      this.log(`❌ Configuración no encontrada para ${moduleName}`, 'red');
      return false;
    }

    if (!fs.existsSync(modulePath)) {
      this.log(`❌ Módulo ${moduleName} no encontrado`, 'red');
      return false;
    }

    const results = {
      files: this.validateRequiredFiles(moduleName, modulePath),
      configs: this.validateConfigs(moduleName, modulePath),
      dependencies: this.validateDependencies(moduleName, modulePath),
      permissions: this.validatePermissions(moduleName, modulePath),
      syntax: this.validateScriptSyntax(moduleName, modulePath)
    };

    // Calcular totales
    const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);

    this.validationResults.details[moduleName] = {
      path: modulePath,
      results,
      totalPassed,
      totalFailed,
      valid: totalFailed === 0
    };

    if (totalFailed === 0) {
      this.validationResults.passed++;
      this.log(`✅ Módulo ${moduleName} válido`, 'green');
    } else {
      this.validationResults.failed++;
      this.log(`❌ Módulo ${moduleName} tiene ${totalFailed} errores`, 'red');
    }

    return totalFailed === 0;
  }

  // Validar estructura global
  validateGlobalStructure() {
    this.log(`🔍 Validando estructura global`, 'blue');
    
    const results = {
      passed: 0,
      failed: 0,
      missing: []
    };

    // Validar archivos globales requeridos
    for (const file of VALIDATION_CONFIG.global.required) {
      const filePath = path.join(this.basePath, file);
      if (fs.existsSync(filePath)) {
        results.passed++;
        this.log(`✅ ${file} encontrado`, 'green', 'GLOBAL');
      } else {
        results.failed++;
        results.missing.push(file);
        this.log(`❌ ${file} no encontrado`, 'red', 'GLOBAL');
      }
    }

    // Validar jerarquía
    const hierarchyPath = path.join(this.basePath, 'JERARQUIA.MD');
    if (fs.existsSync(hierarchyPath)) {
      const content = fs.readFileSync(hierarchyPath, 'utf8');
      const modules = Object.keys(VALIDATION_CONFIG.modules);
      const missingInHierarchy = modules.filter(module => !content.includes(module));
      
      if (missingInHierarchy.length === 0) {
        results.passed++;
        this.log(`✅ Jerarquía actualizada`, 'green', 'GLOBAL');
      } else {
        results.failed++;
        this.log(`❌ Módulos faltantes en jerarquía: ${missingInHierarchy.join(', ')}`, 'red', 'GLOBAL');
      }
    }

    this.validationResults.details.global = {
      results,
      valid: results.failed === 0
    };

    return results.failed === 0;
  }

  // Generar reporte
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalModules: Object.keys(VALIDATION_CONFIG.modules).length,
        passed: this.validationResults.passed,
        failed: this.validationResults.failed,
        warnings: this.validationResults.warnings
      },
      details: this.validationResults.details
    };

    // Mostrar resumen
    this.log('\n📊 RESUMEN DE VALIDACIÓN', 'magenta');
    this.log('=' * 50, 'magenta');
    this.log(`Módulos Totales: ${report.summary.totalModules}`, 'blue');
    this.log(`✅ Válidos: ${report.summary.passed}`, 'green');
    this.log(`❌ Inválidos: ${report.summary.failed}`, 'red');
    this.log(`⚠️ Advertencias: ${report.summary.warnings}`, 'yellow');

    // Detalles por módulo
    this.log('\n🔧 DETALLES POR MÓDULO:', 'magenta');
    for (const [moduleName, details] of Object.entries(report.details)) {
      if (moduleName === 'global') continue;
      
      const icon = details.valid ? '✅' : '❌';
      const color = details.valid ? 'green' : 'red';
      this.log(`${icon} ${moduleName}: ${details.totalPassed} pasaron, ${details.totalFailed} fallaron`, color);
    }

    // Guardar reporte
    const reportPath = path.join(this.basePath, 'logs/validation-report.json');
    const logDir = path.dirname(reportPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n💾 Reporte guardado en: ${reportPath}`, 'green');

    return report;
  }

  // Ejecutar validación completa
  async runValidation() {
    this.log('🚀 Iniciando validación cross-módulo...', 'magenta');
    
    // Validar estructura global
    this.validateGlobalStructure();
    
    // Validar cada módulo
    for (const moduleName of Object.keys(VALIDATION_CONFIG.modules)) {
      this.validateModule(moduleName);
    }
    
    // Generar reporte
    const report = this.generateReport();
    
    // Resultado final
    const allValid = this.validationResults.failed === 0;
    if (allValid) {
      this.log('\n🎉 ¡Todas las validaciones pasaron!', 'green');
    } else {
      this.log(`\n⚠️ ${this.validationResults.failed} módulo(s) tienen problemas`, 'yellow');
    }
    
    return allValid;
  }
}

// Función principal
async function main() {
  const validator = new ModuleValidator();
  
  try {
    const success = await validator.runValidation();
    process.exit(success ? 0 : 1);
  } catch (error) {
    validator.log(`Error durante la validación: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = ModuleValidator; 