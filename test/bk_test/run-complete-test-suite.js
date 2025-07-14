#!/usr/bin/env node

/**
 * Complete Test Suite Runner - Metaverso Crypto World Virtual 3D
 * Script que ejecuta tanto el test original como el avanzado para cobertura completa
 * @version 2.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

const fs = require('fs');
const path = require('path');

// Importar ambos test suites
const SystemTestSuite = require('./system-test-suite.js');
const AdvancedSystemTestSuite = require('./advanced-system-test.js');

class CompleteTestRunner {
    constructor() {
        this.config = {
            verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
            output: process.argv.includes('--output') ? process.argv[process.argv.indexOf('--output') + 1] : 'test-results',
            parallel: process.argv.includes('--parallel'),
            coverage: process.argv.includes('--coverage'),
            skipBasic: process.argv.includes('--skip-basic'),
            skipAdvanced: process.argv.includes('--skip-advanced')
        };
        
        this.results = {
            basic: null,
            advanced: null,
            combined: {
                total: 0,
                passed: 0,
                failed: 0,
                duration: 0,
                successRate: 0
            }
        };
        
        this.startTime = Date.now();
    }

    /**
     * Ejecutar suite completa de tests
     */
    async runCompleteTests() {
        console.log('🚀 Iniciando Complete Test Suite del Metaverso...');
        console.log('=' .repeat(80));
        console.log('🔧 Basic Tests | 🚀 Advanced Tests | 📊 Complete Coverage | 🎯 Full Validation');
        console.log('=' .repeat(80));
        
        try {
            // 1. Ejecutar tests básicos (si no se omiten)
            if (!this.config.skipBasic) {
                await this.runBasicTests();
            }
            
            // 2. Ejecutar tests avanzados (si no se omiten)
            if (!this.config.skipAdvanced) {
                await this.runAdvancedTests();
            }
            
            // 3. Combinar resultados
            this.combineResults();
            
            // 4. Generar reporte completo
            this.generateCompleteReport();
            
            // 5. Mostrar resumen final
            this.showFinalSummary();
            
        } catch (error) {
            console.error('❌ Error crítico en Complete Test Runner:', error);
            process.exit(1);
        }
    }

    /**
     * Ejecutar tests básicos
     */
    async runBasicTests() {
        console.log('\n🔧 Ejecutando Basic System Tests...');
        
        const basicSuite = new SystemTestSuite();
        await basicSuite.runAllTests();
        
        this.results.basic = basicSuite.getResults();
        
        console.log(`✅ Basic Tests completados: ${this.results.basic.passed}/${this.results.basic.total} exitosos`);
    }

    /**
     * Ejecutar tests avanzados
     */
    async runAdvancedTests() {
        console.log('\n🚀 Ejecutando Advanced System Tests...');
        
        const advancedSuite = new AdvancedSystemTestSuite();
        await advancedSuite.runAdvancedTests();
        
        this.results.advanced = advancedSuite.getResults();
        
        console.log(`✅ Advanced Tests completados: ${this.results.advanced.passed}/${this.results.advanced.total} exitosos`);
    }

    /**
     * Combinar resultados de ambos test suites
     */
    combineResults() {
        const basic = this.results.basic || { total: 0, passed: 0, failed: 0 };
        const advanced = this.results.advanced || { total: 0, passed: 0, failed: 0 };
        
        this.results.combined = {
            total: basic.total + advanced.total,
            passed: basic.passed + advanced.passed,
            failed: basic.failed + advanced.failed,
            duration: Date.now() - this.startTime,
            successRate: 0
        };
        
        if (this.results.combined.total > 0) {
            this.results.combined.successRate = (this.results.combined.passed / this.results.combined.total) * 100;
        }
        
        // Agregar detalles por categoría
        this.results.combined.categories = {};
        
        if (this.results.basic) {
            this.results.combined.categories.basic = {
                total: basic.total,
                passed: basic.passed,
                failed: basic.failed,
                successRate: basic.total > 0 ? (basic.passed / basic.total) * 100 : 0
            };
        }
        
        if (this.results.advanced) {
            this.results.combined.categories.advanced = {
                total: advanced.total,
                passed: advanced.passed,
                failed: advanced.failed,
                successRate: advanced.total > 0 ? (advanced.passed / advanced.total) * 100 : 0
            };
        }
    }

    /**
     * Generar reporte completo
     */
    generateCompleteReport() {
        console.log('\n📊 Generando Complete Test Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: this.results.combined.duration,
            summary: {
                total: this.results.combined.total,
                passed: this.results.combined.passed,
                failed: this.results.combined.failed,
                successRate: this.results.combined.successRate
            },
            categories: this.results.combined.categories,
            details: {
                basic: this.results.basic,
                advanced: this.results.advanced
            },
            recommendations: this.generateCompleteRecommendations()
        };
        
        // Guardar reporte
        this.saveCompleteReport(report);
        
        // Mostrar resumen por categoría
        this.showCategorySummary();
    }

    /**
     * Mostrar resumen por categoría
     */
    showCategorySummary() {
        console.log('\n📋 RESUMEN POR CATEGORÍAS:');
        console.log('-'.repeat(60));
        
        if (this.results.basic) {
            const basic = this.results.combined.categories.basic;
            console.log(`🔧 Basic Tests: ${basic.passed}/${basic.total} (${basic.successRate.toFixed(1)}%)`);
        }
        
        if (this.results.advanced) {
            const advanced = this.results.combined.categories.advanced;
            console.log(`🚀 Advanced Tests: ${advanced.passed}/${advanced.total} (${advanced.successRate.toFixed(1)}%)`);
        }
        
        console.log(`📊 TOTAL: ${this.results.combined.passed}/${this.results.combined.total} (${this.results.combined.successRate.toFixed(1)}%)`);
    }

    /**
     * Generar recomendaciones completas
     */
    generateCompleteRecommendations() {
        const recommendations = [];
        
        // Análisis de tests básicos
        if (this.results.basic) {
            const basic = this.results.combined.categories.basic;
            if (basic.successRate < 90) {
                recommendations.push({
                    category: 'Basic Tests',
                    priority: basic.successRate < 70 ? 'critical' : 'high',
                    message: `Los tests básicos tienen una tasa de éxito del ${basic.successRate.toFixed(1)}%`,
                    action: 'Revisar y corregir tests básicos fallidos'
                });
            }
        }
        
        // Análisis de tests avanzados
        if (this.results.advanced) {
            const advanced = this.results.combined.categories.advanced;
            if (advanced.successRate < 80) {
                recommendations.push({
                    category: 'Advanced Tests',
                    priority: advanced.successRate < 60 ? 'critical' : 'high',
                    message: `Los tests avanzados tienen una tasa de éxito del ${advanced.successRate.toFixed(1)}%`,
                    action: 'Revisar y corregir tests avanzados fallidos'
                });
            }
        }
        
        // Análisis general
        if (this.results.combined.successRate < 85) {
            recommendations.push({
                category: 'General',
                priority: this.results.combined.successRate < 70 ? 'critical' : 'medium',
                message: `La tasa de éxito general es del ${this.results.combined.successRate.toFixed(1)}%`,
                action: 'Revisión completa del sistema requerida'
            });
        }
        
        // Recomendaciones específicas basadas en resultados
        if (this.results.advanced && this.results.advanced.errors && this.results.advanced.errors.length > 0) {
            recommendations.push({
                category: 'Error Handling',
                priority: 'high',
                message: `${this.results.advanced.errors.length} errores críticos detectados`,
                action: 'Mejorar manejo de errores y logging'
            });
        }
        
        return recommendations;
    }

    /**
     * Guardar reporte completo
     */
    saveCompleteReport(report) {
        try {
            const reportPath = path.join(__dirname, 'test-results', 'complete-test-report.json');
            
            // Crear directorio si no existe
            const dir = path.dirname(reportPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`💾 Reporte completo guardado en: ${reportPath}`);
            
        } catch (error) {
            console.error('❌ Error al guardar reporte completo:', error.message);
        }
    }

    /**
     * Mostrar resumen final
     */
    showFinalSummary() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;
        
        console.log('\n' + '=' .repeat(80));
        console.log('🏁 RESUMEN FINAL - COMPLETE TEST SUITE');
        console.log('=' .repeat(80));
        
        console.log(`\n⏱️  Duración total: ${(totalDuration / 1000).toFixed(2)} segundos`);
        console.log(`📊 Tests ejecutados: ${this.results.combined.total}`);
        console.log(`✅ Tests exitosos: ${this.results.combined.passed}`);
        console.log(`❌ Tests fallidos: ${this.results.combined.failed}`);
        console.log(`📈 Tasa de éxito: ${this.results.combined.successRate.toFixed(1)}%`);
        
        // Estado general
        this.showSystemStatus();
        
        // Próximos pasos
        this.showNextSteps();
        
        console.log('\n' + '=' .repeat(80));
    }

    /**
     * Mostrar estado del sistema
     */
    showSystemStatus() {
        const successRate = this.results.combined.successRate;
        
        console.log('\n🎯 ESTADO DEL SISTEMA:');
        console.log('-'.repeat(40));
        
        if (successRate >= 95) {
            console.log('🎉 EXCELENTE: El sistema está funcionando de manera óptima');
            console.log('   ✅ Todos los componentes críticos funcionando correctamente');
            console.log('   ✅ Rendimiento dentro de parámetros esperados');
            console.log('   ✅ Seguridad y estabilidad verificadas');
        } else if (successRate >= 85) {
            console.log('✅ BUENO: El sistema está funcionando correctamente');
            console.log('   ⚠️  Algunos componentes requieren atención menor');
            console.log('   ✅ Funcionalidad principal operativa');
            console.log('   ✅ Seguridad básica verificada');
        } else if (successRate >= 70) {
            console.log('⚠️  ADVERTENCIA: Hay problemas que requieren atención');
            console.log('   🔧 Revisar componentes con fallos');
            console.log('   ⚠️  Algunas funcionalidades pueden estar afectadas');
            console.log('   🔍 Investigar causas de fallos');
        } else {
            console.log('🚨 CRÍTICO: El sistema tiene problemas serios');
            console.log('   🚨 Intervención inmediata requerida');
            console.log('   🔧 Revisión completa del sistema necesaria');
            console.log('   🛑 Considerar rollback o mantenimiento');
        }
    }

    /**
     * Mostrar próximos pasos
     */
    showNextSteps() {
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('-'.repeat(40));
        
        const recommendations = this.generateCompleteRecommendations();
        
        if (recommendations.length === 0) {
            console.log('🎉 No se requieren acciones inmediatas');
            console.log('   El sistema está funcionando correctamente');
        } else {
            recommendations.forEach((rec, index) => {
                const priorityIcon = this.getPriorityIcon(rec.priority);
                console.log(`${index + 1}. ${priorityIcon} ${rec.message}`);
                console.log(`   Acción: ${rec.action}`);
            });
        }
        
        // Recomendaciones generales
        if (this.results.combined.successRate >= 90) {
            console.log('\n🚀 El sistema está listo para producción');
        } else if (this.results.combined.successRate >= 80) {
            console.log('\n🔧 Considerar pruebas adicionales antes de producción');
        } else {
            console.log('\n🛑 No recomendar despliegue hasta resolver problemas críticos');
        }
    }

    /**
     * Obtener icono de prioridad
     */
    getPriorityIcon(priority) {
        const icons = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
        };
        return icons[priority] || '⚪';
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
    
    const runner = new CompleteTestRunner();
    await runner.runCompleteTests();
}

/**
 * Mostrar ayuda
 */
function showHelp() {
    console.log(`
🚀 Complete Test Suite Runner - Metaverso Crypto World Virtual 3D

Uso: node run-complete-test-suite.js [opciones]

Opciones:
  --verbose, -v           Mostrar información detallada
  --output <directorio>   Directorio de salida para reportes
  --parallel              Ejecutar tests en paralelo
  --coverage              Generar reporte de cobertura
  --skip-basic            Omitir tests básicos
  --skip-advanced         Omitir tests avanzados
  --help, -h              Mostrar esta ayuda

Ejemplos:
  node run-complete-test-suite.js
  node run-complete-test-suite.js --verbose
  node run-complete-test-suite.js --skip-basic
  node run-complete-test-suite.js --skip-advanced
  node run-complete-test-suite.js --output ./custom-results

Descripción:
  Este script ejecuta tanto el test suite básico como el avanzado
  para proporcionar una cobertura completa del sistema metaverso.

  Tests Básicos:
  - Dependencias y módulos
  - Funcionalidad core
  - Integración básica
  - Rendimiento estándar

  Tests Avanzados:
  - IA LucIA
  - Blockchain avanzado
  - Seguridad multicapa
  - Metaverso 3D
  - Performance avanzado
  - Escenarios complejos
  - Resiliencia y recuperación
`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = CompleteTestRunner; 