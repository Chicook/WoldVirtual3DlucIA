#!/usr/bin/env node

/**
 * Run Advanced Tests Script - Metaverso Crypto World Virtual 3D
 * Script para ejecutar tests avanzados del sistema con IA LucIA
 * @version 2.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Importar el test suite avanzado
const AdvancedSystemTestSuite = require('./advanced-system-test.js');

class AdvancedTestRunner {
    constructor() {
        this.config = {
            verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
            output: process.argv.includes('--output') ? process.argv[process.argv.indexOf('--output') + 1] : 'test-results',
            parallel: process.argv.includes('--parallel'),
            coverage: process.argv.includes('--coverage'),
            categories: this.parseCategories()
        };
        
        this.testSuite = new AdvancedSystemTestSuite();
        this.startTime = Date.now();
    }

    /**
     * Parsear categorías específicas de tests
     */
    parseCategories() {
        const categories = [];
        const args = process.argv;
        
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--categories' && args[i + 1]) {
                categories.push(...args[i + 1].split(','));
                break;
            }
        }
        
        return categories.length > 0 ? categories : null;
    }

    /**
     * Ejecutar tests avanzados
     */
    async runAdvancedTests() {
        console.log('🚀 Iniciando Advanced Test Runner del Metaverso...');
        console.log('=' .repeat(70));
        console.log('🧠 IA LucIA | 🔗 Blockchain | 🛡️ Security | 🌐 Metaverse | ⚡ Performance');
        console.log('=' .repeat(70));
        
        try {
            // 1. Verificar entorno
            await this.checkAdvancedEnvironment();
            
            // 2. Ejecutar tests avanzados
            await this.executeAdvancedTests();
            
            // 3. Generar reportes especializados
            await this.generateSpecializedReports();
            
            // 4. Mostrar resumen final
            this.showFinalSummary();
            
        } catch (error) {
            console.error('❌ Error crítico en Advanced Test Runner:', error);
            process.exit(1);
        }
    }

    /**
     * Verificar entorno avanzado
     */
    async checkAdvancedEnvironment() {
        console.log('\n🔍 Verificando entorno avanzado...');
        
        const checks = [
            {
                name: 'Node.js Version (Advanced)',
                check: () => {
                    const version = process.version;
                    const major = parseInt(version.slice(1).split('.')[0]);
                    return {
                        passed: major >= 16,
                        message: `Node.js ${version} (requerido: >=16)`,
                        severity: 'high'
                    };
                }
            },
            {
                name: 'Advanced Test Suite',
                check: () => {
                    const testPath = path.join(__dirname, 'advanced-system-test.js');
                    const exists = fs.existsSync(testPath);
                    return {
                        passed: exists,
                        message: exists ? 'Advanced Test Suite disponible' : 'Advanced Test Suite no encontrado',
                        severity: 'critical'
                    };
                }
            },
            {
                name: 'LucIA AI Module',
                check: () => {
                    const luciaPath = path.join(__dirname, '../ini/lucIA');
                    const exists = fs.existsSync(luciaPath);
                    return {
                        passed: exists,
                        message: exists ? 'Módulo LucIA encontrado' : 'Módulo LucIA no encontrado',
                        severity: 'high'
                    };
                }
            },
            {
                name: 'Blockchain Contracts',
                check: () => {
                    const contractsPath = path.join(__dirname, '../bloc/bk_wcv/contracts');
                    const exists = fs.existsSync(contractsPath);
                    return {
                        passed: exists,
                        message: exists ? 'Contratos blockchain encontrados' : 'Contratos blockchain no encontrados',
                        severity: 'high'
                    };
                }
            },
            {
                name: 'Security Modules',
                check: () => {
                    const securityPath = path.join(__dirname, '../Include');
                    const exists = fs.existsSync(securityPath);
                    return {
                        passed: exists,
                        message: exists ? 'Módulos de seguridad encontrados' : 'Módulos de seguridad no encontrados',
                        severity: 'critical'
                    };
                }
            },
            {
                name: 'Metaverse Core',
                check: () => {
                    const metaversePath = path.join(__dirname, '../web/metaverso-platform-core.js');
                    const exists = fs.existsSync(metaversePath);
                    return {
                        passed: exists,
                        message: exists ? 'Core del metaverso encontrado' : 'Core del metaverso no encontrado',
                        severity: 'high'
                    };
                }
            },
            {
                name: 'Test Results Directory',
                check: () => {
                    const resultsPath = path.join(__dirname, 'test-results');
                    const exists = fs.existsSync(resultsPath);
                    if (!exists) {
                        try {
                            fs.mkdirSync(resultsPath, { recursive: true });
                            return {
                                passed: true,
                                message: 'Directorio de resultados creado',
                                severity: 'low'
                            };
                        } catch (error) {
                            return {
                                passed: false,
                                message: 'No se pudo crear directorio de resultados',
                                severity: 'medium'
                            };
                        }
                    }
                    return {
                        passed: true,
                        message: 'Directorio de resultados disponible',
                        severity: 'low'
                    };
                }
            }
        ];

        let allChecksPassed = true;
        
        for (const check of checks) {
            const result = check.check();
            
            if (this.config.verbose) {
                const icon = result.passed ? '✅' : '❌';
                const severityIcon = this.getSeverityIcon(result.severity);
                console.log(`${icon} ${severityIcon} ${check.name}: ${result.message}`);
            }
            
            if (!result.passed && result.severity === 'critical') {
                allChecksPassed = false;
            }
        }

        if (!allChecksPassed) {
            throw new Error('Verificaciones críticas del entorno fallaron');
        }

        console.log('✅ Entorno avanzado verificado correctamente');
    }

    /**
     * Ejecutar tests avanzados
     */
    async executeAdvancedTests() {
        console.log('\n🧪 Ejecutando Advanced System Tests...');
        
        try {
            await this.testSuite.runAdvancedTests();
        } catch (error) {
            console.error('❌ Error en ejecución de tests avanzados:', error);
            throw error;
        }
    }

    /**
     * Generar reportes especializados
     */
    async generateSpecializedReports() {
        console.log('\n📊 Generando reportes especializados...');
        
        const results = this.testSuite.getResults();
        
        // Reporte de IA
        if (results.ai && results.ai.length > 0) {
            this.generateAIReport(results.ai);
        }
        
        // Reporte de Blockchain
        if (results.blockchain && results.blockchain.length > 0) {
            this.generateBlockchainReport(results.blockchain);
        }
        
        // Reporte de Seguridad
        if (results.security && results.security.length > 0) {
            this.generateSecurityReport(results.security);
        }
        
        // Reporte de Metaverso
        if (results.metaverse && results.metaverse.length > 0) {
            this.generateMetaverseReport(results.metaverse);
        }
        
        // Reporte de Performance
        if (results.performance && results.performance.length > 0) {
            this.generatePerformanceReport(results.performance);
        }
    }

    /**
     * Generar reporte de IA
     */
    generateAIReport(aiResults) {
        const passed = aiResults.filter(r => r.passed).length;
        const total = aiResults.length;
        const successRate = (passed / total) * 100;
        
        console.log(`\n🧠 REPORTE DE IA LUCIA:`);
        console.log(`   Tests: ${passed}/${total} (${successRate.toFixed(1)}%)`);
        
        aiResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`   ${icon} ${result.name}: ${result.message}`);
        });
    }

    /**
     * Generar reporte de Blockchain
     */
    generateBlockchainReport(blockchainResults) {
        const passed = blockchainResults.filter(r => r.passed).length;
        const total = blockchainResults.length;
        const successRate = (passed / total) * 100;
        
        console.log(`\n🔗 REPORTE DE BLOCKCHAIN:`);
        console.log(`   Tests: ${passed}/${total} (${successRate.toFixed(1)}%)`);
        
        blockchainResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`   ${icon} ${result.name}: ${result.message}`);
        });
    }

    /**
     * Generar reporte de Seguridad
     */
    generateSecurityReport(securityResults) {
        const passed = securityResults.filter(r => r.passed).length;
        const total = securityResults.length;
        const successRate = (passed / total) * 100;
        
        console.log(`\n🛡️ REPORTE DE SEGURIDAD:`);
        console.log(`   Tests: ${passed}/${total} (${successRate.toFixed(1)}%)`);
        
        securityResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            const severityIcon = this.getSeverityIcon(result.severity);
            console.log(`   ${icon} ${severityIcon} ${result.name}: ${result.message}`);
        });
    }

    /**
     * Generar reporte de Metaverso
     */
    generateMetaverseReport(metaverseResults) {
        const passed = metaverseResults.filter(r => r.passed).length;
        const total = metaverseResults.length;
        const successRate = (passed / total) * 100;
        
        console.log(`\n🌐 REPORTE DE METAVERSO:`);
        console.log(`   Tests: ${passed}/${total} (${successRate.toFixed(1)}%)`);
        
        metaverseResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`   ${icon} ${result.name}: ${result.message}`);
        });
    }

    /**
     * Generar reporte de Performance
     */
    generatePerformanceReport(performanceResults) {
        const passed = performanceResults.filter(r => r.passed).length;
        const total = performanceResults.length;
        const successRate = (passed / total) * 100;
        
        console.log(`\n⚡ REPORTE DE PERFORMANCE:`);
        console.log(`   Tests: ${passed}/${total} (${successRate.toFixed(1)}%)`);
        
        performanceResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`   ${icon} ${result.name}: ${result.message}`);
        });
    }

    /**
     * Mostrar resumen final
     */
    showFinalSummary() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;
        const results = this.testSuite.getResults();
        
        console.log('\n' + '=' .repeat(70));
        console.log('🏁 RESUMEN FINAL - ADVANCED TEST RUNNER');
        console.log('=' .repeat(70));
        
        console.log(`\n⏱️  Duración total: ${(totalDuration / 1000).toFixed(2)} segundos`);
        console.log(`📊 Tests ejecutados: ${results.total}`);
        console.log(`✅ Tests exitosos: ${results.passed}`);
        console.log(`❌ Tests fallidos: ${results.failed}`);
        console.log(`📈 Tasa de éxito: ${results.successRate.toFixed(1)}%`);
        
        // Estado general
        if (results.successRate >= 95) {
            console.log('\n🎉 EXCELENTE: El sistema está funcionando de manera óptima');
        } else if (results.successRate >= 80) {
            console.log('\n✅ BUENO: El sistema está funcionando correctamente');
        } else if (results.successRate >= 60) {
            console.log('\n⚠️  ADVERTENCIA: Hay problemas que requieren atención');
        } else {
            console.log('\n🚨 CRÍTICO: El sistema tiene problemas serios que requieren intervención inmediata');
        }
        
        // Próximos pasos
        console.log('\n📋 PRÓXIMOS PASOS:');
        if (results.failed > 0) {
            console.log('🔧 Revisar y corregir tests fallidos');
        }
        if (results.errors.length > 0) {
            console.log('🐛 Investigar errores críticos');
        }
        if (results.successRate >= 90) {
            console.log('🚀 El sistema está listo para producción');
        }
        
        console.log('\n' + '=' .repeat(70));
    }

    /**
     * Obtener icono de severidad
     */
    getSeverityIcon(severity) {
        const icons = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
        };
        return icons[severity] || '⚪';
    }
}

/**
 * Función principal
 */
async function main() {
    // Mostrar ayuda si se solicita
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showHelp();
        return;
    }
    
    const runner = new AdvancedTestRunner();
    await runner.runAdvancedTests();
}

/**
 * Mostrar ayuda
 */
function showHelp() {
    console.log(`
🚀 Advanced Test Runner - Metaverso Crypto World Virtual 3D

Uso: node run-advanced-tests.js [opciones]

Opciones:
  --verbose, -v           Mostrar información detallada
  --output <directorio>   Directorio de salida para reportes
  --parallel              Ejecutar tests en paralelo
  --coverage              Generar reporte de cobertura
  --categories <cats>     Ejecutar solo categorías específicas (AI,Blockchain,Security,etc.)
  --help, -h              Mostrar esta ayuda

Ejemplos:
  node run-advanced-tests.js
  node run-advanced-tests.js --verbose
  node run-advanced-tests.js --categories AI,Blockchain
  node run-advanced-tests.js --output ./custom-results

Categorías disponibles:
  🧠 AI          - Tests de IA LucIA
  🔗 Blockchain  - Tests de blockchain y smart contracts
  🛡️ Security    - Tests de seguridad multicapa
  🌐 Metaverse   - Tests del metaverso 3D
  🔗 Integration - Tests de integración compleja
  ⚡ Performance - Tests de rendimiento avanzado
  👥 UserScenarios - Tests de escenarios de usuario
  🔄 Resilience  - Tests de resiliencia y recuperación
`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = AdvancedTestRunner; 