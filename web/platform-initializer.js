/**
 * Platform Initializer - Inicializador de la Plataforma
 * Configuración y lanzamiento del metaverso crypto 3D descentralizado
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

class PlatformInitializer {
    constructor() {
        this.platform = null;
        this.config = null;
        this.isInitialized = false;
        this.eventEmitter = new EventTarget();
    }

    /**
     * Inicializar la plataforma completa
     */
    async initialize(config = {}) {
        try {
            console.log('🎯 Inicializando plataforma del metaverso...');

            // Cargar configuración
            this.config = await this.loadConfiguration(config);

            // Verificar dependencias
            await this.checkDependencies();

            // Crear instancia de la plataforma
            this.platform = new MetaversoPlatformCore(this.config);

            // Configurar eventos de la plataforma
            this.setupPlatformEvents();

            // Inicializar la plataforma
            await this.platform.initialize();

            this.isInitialized = true;
            this.emit('initializer:ready');

            console.log('✅ Plataforma inicializada correctamente');

            return this.platform;

        } catch (error) {
            console.error('❌ Error inicializando plataforma:', error);
            this.emit('initializer:error', { error });
            throw error;
        }
    }

    /**
     * Cargar configuración
     */
    async loadConfiguration(userConfig = {}) {
        // Configuración por defecto
        const defaultConfig = {
            environment: 'development',
            debug: true,
            autoStart: true,
            
            modules: {
                threejs: true,
                audio: true,
                blockchain: true,
                networking: true,
                physics: true,
                avatars: true,
                islands: true,
                marketplace: true,
                defi: true,
                governance: true,
                security: true,
                pages: true,
                protocol: true,
                services: true
            },
            
            threejs: {
                container: '#metaverso-canvas',
                antialias: true,
                shadows: true,
                postprocessing: true,
                renderer: 'webgl2',
                pixelRatio: window.devicePixelRatio || 1
            },
            
            audio: {
                enabled: true,
                spatial: true,
                ambient: true,
                volume: 0.7,
                sampleRate: 44100,
                bufferSize: 2048,
                maxSources: 32
            },
            
            blockchain: {
                network: 'ethereum',
                rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
                chainId: 1,
                gasLimit: 3000000,
                gasPrice: 'auto',
                contracts: {
                    metaversoCore: '0x...',
                    metaversoToken: '0x...',
                    metaversoNFT: '0x...',
                    metaversoDeFi: '0x...',
                    metaversoGovernance: '0x...'
                }
            },
            
            networking: {
                serverUrl: 'wss://metaverso-server.com',
                reconnectInterval: 5000,
                maxReconnectAttempts: 10,
                heartbeatInterval: 30000,
                maxMessageSize: 1024 * 1024 // 1MB
            },
            
            physics: {
                enabled: true,
                gravity: -9.81,
                collisionDetection: true,
                maxBodies: 1000,
                solverIterations: 10,
                timeStep: 1/60
            },
            
            avatars: {
                enabled: true,
                maxAvatars: 100,
                defaultHeight: 1.7,
                collisionRadius: 0.5,
                animationSpeed: 1.0,
                customization: {
                    enabled: true,
                    maxCustomizations: 50
                }
            },
            
            islands: {
                enabled: true,
                maxIslands: 10,
                maxUsersPerIsland: 50,
                transitionTime: 2000,
                autoSave: true,
                persistence: true
            },
            
            marketplace: {
                enabled: true,
                maxListings: 1000,
                transactionTimeout: 300000, // 5 minutos
                fees: {
                    listing: 0.01, // 1%
                    transaction: 0.025 // 2.5%
                },
                categories: ['land', 'items', 'avatars', 'experiences']
            },
            
            defi: {
                enabled: true,
                maxPools: 100,
                minStakeAmount: 0.001,
                maxStakeAmount: 1000000,
                rewardRate: 0.05, // 5% APY
                lockPeriod: 7 * 24 * 60 * 60 * 1000 // 7 días
            },
            
            governance: {
                enabled: true,
                minProposalDuration: 24 * 60 * 60 * 1000, // 24 horas
                maxProposalDuration: 7 * 24 * 60 * 60 * 1000, // 7 días
                minVotingPower: 100,
                quorum: 0.1, // 10%
                executionDelay: 24 * 60 * 60 * 1000 // 24 horas
            },
            
            security: {
                enabled: true,
                encryption: true,
                rateLimit: 100,
                maxLoginAttempts: 5,
                sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
                blacklist: [],
                whitelist: [],
                audit: true
            },
            
            pages: {
                enabled: true,
                defaultRoute: '/',
                routes: {
                    '/': 'HomePage',
                    '/explore': 'ExplorePage',
                    '/marketplace': 'MarketplacePage',
                    '/defi': 'DeFiPage',
                    '/governance': 'GovernancePage',
                    '/profile': 'ProfilePage'
                },
                transitions: {
                    enabled: true,
                    duration: 300,
                    easing: 'ease-in-out'
                }
            },
            
            protocol: {
                enabled: true,
                autoDeploy: false,
                upgradeable: true,
                proxy: true,
                verification: true,
                gasOptimization: true
            },
            
            services: {
                enabled: true,
                cache: {
                    enabled: true,
                    ttl: 300000, // 5 minutos
                    maxSize: 1000
                },
                monitoring: {
                    enabled: true,
                    interval: 5000,
                    metrics: ['fps', 'memory', 'users', 'transactions']
                },
                backup: {
                    enabled: true,
                    interval: 24 * 60 * 60 * 1000, // 24 horas
                    retention: 7 // 7 días
                }
            }
        };

        // Combinar configuración por defecto con configuración del usuario
        const mergedConfig = this.deepMerge(defaultConfig, userConfig);

        // Validar configuración
        this.validateConfiguration(mergedConfig);

        // Cargar configuración específica del entorno
        const envConfig = await this.loadEnvironmentConfig(mergedConfig.environment);
        const finalConfig = this.deepMerge(mergedConfig, envConfig);

        console.log('📋 Configuración cargada:', finalConfig.environment);
        return finalConfig;
    }

    /**
     * Combinar objetos de configuración de forma profunda
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Validar configuración
     */
    validateConfiguration(config) {
        const errors = [];

        // Validar configuración de blockchain
        if (config.modules.blockchain) {
            if (!config.blockchain.rpcUrl || config.blockchain.rpcUrl === 'https://mainnet.infura.io/v3/YOUR_KEY') {
                errors.push('URL de RPC de blockchain no configurada');
            }
        }

        // Validar configuración de networking
        if (config.modules.networking) {
            if (!config.networking.serverUrl || config.networking.serverUrl === 'wss://metaverso-server.com') {
                errors.push('URL del servidor de networking no configurada');
            }
        }

        // Validar configuración de audio
        if (config.modules.audio && config.audio.enabled) {
            if (config.audio.volume < 0 || config.audio.volume > 1) {
                errors.push('Volumen de audio debe estar entre 0 y 1');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Errores de configuración: ${errors.join(', ')}`);
        }
    }

    /**
     * Cargar configuración específica del entorno
     */
    async loadEnvironmentConfig(environment) {
        const envConfigs = {
            development: {
                debug: true,
                blockchain: {
                    network: 'localhost',
                    rpcUrl: 'http://localhost:8545'
                },
                networking: {
                    serverUrl: 'ws://localhost:8080'
                },
                security: {
                    rateLimit: 1000
                }
            },
            
            staging: {
                debug: true,
                blockchain: {
                    network: 'goerli',
                    rpcUrl: 'https://goerli.infura.io/v3/YOUR_KEY'
                },
                networking: {
                    serverUrl: 'wss://staging.metaverso-server.com'
                }
            },
            
            production: {
                debug: false,
                blockchain: {
                    network: 'ethereum',
                    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY'
                },
                networking: {
                    serverUrl: 'wss://metaverso-server.com'
                },
                security: {
                    rateLimit: 50,
                    audit: true
                }
            }
        };

        return envConfigs[environment] || {};
    }

    /**
     * Verificar dependencias
     */
    async checkDependencies() {
        const dependencies = [
            { name: 'THREE', global: 'THREE', required: true },
            { name: 'ethers', global: 'ethers', required: true },
            { name: 'WebSocket', global: 'WebSocket', required: true },
            { name: 'AudioContext', global: 'AudioContext', required: false },
            { name: 'WebGL2RenderingContext', global: 'WebGL2RenderingContext', required: false }
        ];

        const missing = [];

        for (const dep of dependencies) {
            if (dep.required && !window[dep.global]) {
                missing.push(dep.name);
            }
        }

        if (missing.length > 0) {
            throw new Error(`Dependencias faltantes: ${missing.join(', ')}`);
        }

        console.log('✅ Todas las dependencias verificadas');
    }

    /**
     * Configurar eventos de la plataforma
     */
    setupPlatformEvents() {
        // Eventos de inicialización
        this.platform.on('platform:initialized', () => {
            this.emit('platform:initialized');
        });

        this.platform.on('platform:started', () => {
            this.emit('platform:started');
        });

        this.platform.on('platform:error', (data) => {
            this.emit('platform:error', data);
        });

        // Eventos de módulos
        this.platform.on('module:initialized', (data) => {
            this.emit('module:initialized', data);
        });

        this.platform.on('module:error', (data) => {
            this.emit('module:error', data);
        });

        // Eventos de usuario
        this.platform.on('user:login', (data) => {
            this.emit('user:login', data);
        });

        this.platform.on('user:logout', (data) => {
            this.emit('user:logout', data);
        });

        // Eventos de blockchain
        this.platform.on('blockchain:connected', (data) => {
            this.emit('blockchain:connected', data);
        });

        this.platform.on('transaction:completed', (data) => {
            this.emit('transaction:completed', data);
        });

        // Eventos de networking
        this.platform.on('networking:connected', (data) => {
            this.emit('networking:connected', data);
        });

        this.platform.on('networking:disconnected', (data) => {
            this.emit('networking:disconnected', data);
        });

        // Eventos de audio
        this.platform.on('audio:ambient:changed', (data) => {
            this.emit('audio:ambient:changed', data);
        });

        // Eventos de islas
        this.platform.on('island:changed', (data) => {
            this.emit('island:changed', data);
        });

        // Eventos de avatares
        this.platform.on('avatar:created', (data) => {
            this.emit('avatar:created', data);
        });

        this.platform.on('avatar:updated', (data) => {
            this.emit('avatar:updated', data);
        });

        // Eventos de marketplace
        this.platform.on('marketplace:item:listed', (data) => {
            this.emit('marketplace:item:listed', data);
        });

        this.platform.on('marketplace:item:sold', (data) => {
            this.emit('marketplace:item:sold', data);
        });

        // Eventos de DeFi
        this.platform.on('defi:staked', (data) => {
            this.emit('defi:staked', data);
        });

        this.platform.on('defi:unstaked', (data) => {
            this.emit('defi:unstaked', data);
        });

        // Eventos de gobernanza
        this.platform.on('governance:proposal:created', (data) => {
            this.emit('governance:proposal:created', data);
        });

        this.platform.on('governance:vote:cast', (data) => {
            this.emit('governance:vote:cast', data);
        });

        // Eventos de seguridad
        this.platform.on('security:threat:detected', (data) => {
            this.emit('security:threat:detected', data);
        });

        this.platform.on('security:user:blocked', (data) => {
            this.emit('security:user:blocked', data);
        });
    }

    /**
     * Iniciar la plataforma
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('Inicializador no está listo');
        }

        try {
            console.log('🚀 Iniciando plataforma del metaverso...');
            
            await this.platform.start();
            
            console.log('✅ Plataforma iniciada correctamente');
            
        } catch (error) {
            console.error('❌ Error iniciando plataforma:', error);
            throw error;
        }
    }

    /**
     * Detener la plataforma
     */
    async stop() {
        if (this.platform) {
            try {
                console.log('🛑 Deteniendo plataforma del metaverso...');
                
                await this.platform.stop();
                
                console.log('✅ Plataforma detenida correctamente');
                
            } catch (error) {
                console.error('❌ Error deteniendo plataforma:', error);
                throw error;
            }
        }
    }

    /**
     * Obtener instancia de la plataforma
     */
    getPlatform() {
        return this.platform;
    }

    /**
     * Obtener configuración
     */
    getConfig() {
        return this.config;
    }

    /**
     * Obtener estado
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            platform: this.platform ? this.platform.getState() : null
        };
    }

    /**
     * Emitir evento
     */
    emit(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.eventEmitter.dispatchEvent(event);
    }

    /**
     * Escuchar eventos
     */
    on(eventName, callback) {
        this.eventEmitter.addEventListener(eventName, (event) => {
            callback(event.detail);
        });
    }

    /**
     * Remover listener de eventos
     */
    off(eventName, callback) {
        this.eventEmitter.removeEventListener(eventName, callback);
    }

    /**
     * Destruir el inicializador
     */
    async destroy() {
        try {
            console.log('🧹 Destruyendo inicializador...');
            
            await this.stop();
            
            if (this.platform) {
                await this.platform.destroy();
                this.platform = null;
            }
            
            this.config = null;
            this.isInitialized = false;
            this.eventEmitter = null;
            
            console.log('✅ Inicializador destruido');
            
        } catch (error) {
            console.error('❌ Error destruyendo inicializador:', error);
            throw error;
        }
    }
}

// Función de inicialización global
async function initializeMetaversoPlatform(config = {}) {
    const initializer = new PlatformInitializer();
    
    try {
        const platform = await initializer.initialize(config);
        
        // Configurar eventos globales
        initializer.on('platform:started', () => {
            console.log('🎉 ¡Metaverso Crypto World Virtual 3D iniciado!');
        });
        
        initializer.on('platform:error', (data) => {
            console.error('❌ Error en la plataforma:', data.error);
        });
        
        // Iniciar automáticamente si está configurado
        if (config.autoStart !== false) {
            await initializer.start();
        }
        
        return { initializer, platform };
        
    } catch (error) {
        console.error('❌ Error inicializando metaverso:', error);
        throw error;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.PlatformInitializer = PlatformInitializer;
    window.initializeMetaversoPlatform = initializeMetaversoPlatform;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlatformInitializer, initializeMetaversoPlatform };
} 