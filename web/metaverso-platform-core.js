/**
 * Metaverso Platform Core - Núcleo Principal de la Plataforma
 * Integración completa de todos los módulos del metaverso crypto 3D descentralizado
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

class MetaversoPlatformCore {
    constructor(config = {}) {
        this.config = {
            // Configuración general
            environment: config.environment || 'development',
            debug: config.debug !== false,
            autoStart: config.autoStart !== false,
            
            // Configuración de módulos
            modules: {
                threejs: config.modules?.threejs !== false,
                audio: config.modules?.audio !== false,
                blockchain: config.modules?.blockchain !== false,
                networking: config.modules?.networking !== false,
                physics: config.modules?.physics !== false,
                avatars: config.modules?.avatars !== false,
                islands: config.modules?.islands !== false,
                marketplace: config.modules?.marketplace !== false,
                defi: config.modules?.defi !== false,
                governance: config.modules?.governance !== false,
                security: config.modules?.security !== false,
                pages: config.modules?.pages !== false,
                protocol: config.modules?.protocol !== false,
                services: config.modules?.services !== false
            },
            
            // Configuración específica por módulo
            threejs: {
                container: config.threejs?.container || '#metaverso-canvas',
                antialias: config.threejs?.antialias !== false,
                shadows: config.threejs?.shadows !== false,
                postprocessing: config.threejs?.postprocessing !== false,
                ...config.threejs
            },
            
            audio: {
                enabled: config.audio?.enabled !== false,
                spatial: config.audio?.spatial !== false,
                ambient: config.audio?.ambient !== false,
                volume: config.audio?.volume || 0.7,
                ...config.audio
            },
            
            blockchain: {
                network: config.blockchain?.network || 'ethereum',
                rpcUrl: config.blockchain?.rpcUrl || 'https://mainnet.infura.io/v3/YOUR_KEY',
                contracts: config.blockchain?.contracts || {},
                ...config.blockchain
            },
            
            networking: {
                serverUrl: config.networking?.serverUrl || 'wss://metaverso-server.com',
                reconnectInterval: config.networking?.reconnectInterval || 5000,
                ...config.networking
            },
            
            physics: {
                enabled: config.physics?.enabled !== false,
                gravity: config.physics?.gravity || -9.81,
                ...config.physics
            },
            
            avatars: {
                enabled: config.avatars?.enabled !== false,
                maxAvatars: config.avatars?.maxAvatars || 100,
                ...config.avatars
            },
            
            islands: {
                enabled: config.islands?.enabled !== false,
                maxIslands: config.islands?.maxIslands || 10,
                ...config.islands
            },
            
            marketplace: {
                enabled: config.marketplace?.enabled !== false,
                ...config.marketplace
            },
            
            defi: {
                enabled: config.defi?.enabled !== false,
                ...config.defi
            },
            
            governance: {
                enabled: config.governance?.enabled !== false,
                ...config.governance
            },
            
            security: {
                enabled: config.security?.enabled !== false,
                ...config.security
            },
            
            pages: {
                enabled: config.pages?.enabled !== false,
                ...config.pages
            },
            
            protocol: {
                enabled: config.protocol?.enabled !== false,
                ...config.protocol
            },
            
            services: {
                enabled: config.services?.enabled !== false,
                ...config.services
            }
        };

        // Estado de la plataforma
        this.state = {
            isInitialized: false,
            isRunning: false,
            currentUser: null,
            currentIsland: null,
            activeModules: new Set(),
            errors: [],
            metrics: {
                fps: 0,
                memory: 0,
                users: 0,
                transactions: 0
            }
        };

        // Instancias de módulos
        this.modules = new Map();
        
        // Gestor de eventos
        this.eventEmitter = new EventTarget();
        
        // Sistema de métricas
        this.metricsCollector = null;
        
        // Sistema de logging
        this.logger = null;
        
        console.log('🚀 Metaverso Platform Core inicializado');
    }

    /**
     * Inicializar la plataforma completa
     */
    async initialize() {
        try {
            console.log('🎯 Inicializando plataforma del metaverso...');

            // Inicializar sistema de logging
            await this.initializeLogger();
            
            // Inicializar sistema de métricas
            await this.initializeMetrics();
            
            // Inicializar módulos en orden de dependencia
            await this.initializeModules();
            
            // Configurar comunicación entre módulos
            await this.setupModuleCommunication();
            
            // Configurar eventos globales
            await this.setupGlobalEvents();
            
            // Inicializar UI
            await this.initializeUI();
            
            this.state.isInitialized = true;
            this.emit('platform:initialized');
            
            console.log('✅ Plataforma del metaverso inicializada correctamente');
            
            // Auto-start si está configurado
            if (this.config.autoStart) {
                await this.start();
            }
            
        } catch (error) {
            console.error('❌ Error inicializando plataforma:', error);
            this.state.errors.push(error);
            this.emit('platform:error', { error });
            throw error;
        }
    }

    /**
     * Inicializar sistema de logging
     */
    async initializeLogger() {
        this.logger = {
            log: (level, message, data = {}) => {
                const timestamp = new Date().toISOString();
                const logEntry = { timestamp, level, message, data };
                
                if (this.config.debug) {
                    console.log(`[${level.toUpperCase()}] ${message}`, data);
                }
                
                this.emit('log', logEntry);
            },
            
            info: (message, data) => this.logger.log('info', message, data),
            warn: (message, data) => this.logger.log('warn', message, data),
            error: (message, data) => this.logger.log('error', message, data),
            debug: (message, data) => this.logger.log('debug', message, data)
        };
        
        this.logger.info('Sistema de logging inicializado');
    }

    /**
     * Inicializar sistema de métricas
     */
    async initializeMetrics() {
        this.metricsCollector = {
            startTime: Date.now(),
            counters: new Map(),
            gauges: new Map(),
            histograms: new Map(),
            
            increment: (name, value = 1) => {
                const current = this.metricsCollector.counters.get(name) || 0;
                this.metricsCollector.counters.set(name, current + value);
            },
            
            gauge: (name, value) => {
                this.metricsCollector.gauges.set(name, value);
            },
            
            histogram: (name, value) => {
                if (!this.metricsCollector.histograms.has(name)) {
                    this.metricsCollector.histograms.set(name, []);
                }
                this.metricsCollector.histograms.get(name).push(value);
            },
            
            getMetrics: () => {
                const metrics = {
                    uptime: Date.now() - this.metricsCollector.startTime,
                    counters: Object.fromEntries(this.metricsCollector.counters),
                    gauges: Object.fromEntries(this.metricsCollector.gauges),
                    histograms: Object.fromEntries(this.metricsCollector.histograms)
                };
                
                return { ...metrics, ...this.state.metrics };
            }
        };
        
        this.logger.info('Sistema de métricas inicializado');
    }

    /**
     * Inicializar módulos en orden de dependencia
     */
    async initializeModules() {
        const moduleOrder = [
            'services',      // Servicios base
            'security',      // Seguridad
            'blockchain',    // Blockchain
            'protocol',      // Smart contracts
            'networking',    // Networking
            'audio',         // Audio
            'physics',       // Física
            'avatars',       // Avatares
            'islands',       // Islas
            'marketplace',   // Marketplace
            'defi',          // DeFi
            'governance',    // Gobernanza
            'pages',         // Páginas
            'threejs'        // Three.js (último)
        ];

        for (const moduleName of moduleOrder) {
            if (this.config.modules[moduleName]) {
                await this.initializeModule(moduleName);
            }
        }
    }

    /**
     * Inicializar un módulo específico
     */
    async initializeModule(moduleName) {
        try {
            this.logger.info(`Inicializando módulo: ${moduleName}`);
            
            let moduleInstance = null;
            
            switch (moduleName) {
                case 'services':
                    moduleInstance = await this.initializeServicesModule();
                    break;
                    
                case 'security':
                    moduleInstance = await this.initializeSecurityModule();
                    break;
                    
                case 'blockchain':
                    moduleInstance = await this.initializeBlockchainModule();
                    break;
                    
                case 'protocol':
                    moduleInstance = await this.initializeProtocolModule();
                    break;
                    
                case 'networking':
                    moduleInstance = await this.initializeNetworkingModule();
                    break;
                    
                case 'audio':
                    moduleInstance = await this.initializeAudioModule();
                    break;
                    
                case 'physics':
                    moduleInstance = await this.initializePhysicsModule();
                    break;
                    
                case 'avatars':
                    moduleInstance = await this.initializeAvatarsModule();
                    break;
                    
                case 'islands':
                    moduleInstance = await this.initializeIslandsModule();
                    break;
                    
                case 'marketplace':
                    moduleInstance = await this.initializeMarketplaceModule();
                    break;
                    
                case 'defi':
                    moduleInstance = await this.initializeDeFiModule();
                    break;
                    
                case 'governance':
                    moduleInstance = await this.initializeGovernanceModule();
                    break;
                    
                case 'pages':
                    moduleInstance = await this.initializePagesModule();
                    break;
                    
                case 'threejs':
                    moduleInstance = await this.initializeThreeJSModule();
                    break;
                    
                default:
                    throw new Error(`Módulo desconocido: ${moduleName}`);
            }
            
            if (moduleInstance) {
                this.modules.set(moduleName, moduleInstance);
                this.state.activeModules.add(moduleName);
                this.emit('module:initialized', { moduleName, instance: moduleInstance });
                this.logger.info(`Módulo ${moduleName} inicializado correctamente`);
            }
            
        } catch (error) {
            this.logger.error(`Error inicializando módulo ${moduleName}:`, error);
            this.state.errors.push(error);
            this.emit('module:error', { moduleName, error });
            throw error;
        }
    }

    /**
     * Inicializar módulo de servicios
     */
    async initializeServicesModule() {
        const ServicesCore = await this.loadModule('services/metaverso-services-core.js');
        const ServiceManager = await this.loadModule('services/service-manager.js');
        
        const serviceManager = new ServiceManager();
        const servicesCore = new ServicesCore(this.config.services);
        
        await serviceManager.startAllServices();
        await servicesCore.initializeServices();
        
        return { serviceManager, servicesCore };
    }

    /**
     * Inicializar módulo de seguridad
     */
    async initializeSecurityModule() {
        const securityConfig = this.config.security;
        const securityModule = {
            name: 'security',
            config: securityConfig,
            blacklist: new Set(),
            rateLimits: new Map(),
            
            checkSecurity: async (userId, action, data) => {
                // Implementación de verificación de seguridad
                return true;
            },
            
            blockUser: async (userId, reason) => {
                this.securityModule.blacklist.add(userId);
                this.emit('security:user:blocked', { userId, reason });
            }
        };
        
        return securityModule;
    }

    /**
     * Inicializar módulo de blockchain
     */
    async initializeBlockchainModule() {
        const BlockchainService = await this.loadModule('services/blockchain-service.js');
        const blockchainService = new BlockchainService(this.config.blockchain);
        
        await blockchainService.initialize();
        
        return blockchainService;
    }

    /**
     * Inicializar módulo de protocolo
     */
    async initializeProtocolModule() {
        const protocolModule = {
            name: 'protocol',
            contracts: new Map(),
            
            async loadContracts() {
                // Cargar contratos inteligentes
                const contractAddresses = this.config.blockchain.contracts;
                
                for (const [name, address] of Object.entries(contractAddresses)) {
                    this.contracts.set(name, address);
                }
            },
            
            async deployContract(name, abi, bytecode, args = []) {
                // Implementación de despliegue de contratos
                return { success: true, address: '0x...' };
            }
        };
        
        await protocolModule.loadContracts();
        return protocolModule;
    }

    /**
     * Inicializar módulo de networking
     */
    async initializeNetworkingModule() {
        const networkingModule = {
            name: 'networking',
            socket: null,
            isConnected: false,
            
            async connect() {
                try {
                    this.socket = new WebSocket(this.config.networking.serverUrl);
                    
                    this.socket.onopen = () => {
                        this.isConnected = true;
                        this.emit('networking:connected');
                    };
                    
                    this.socket.onmessage = (event) => {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    };
                    
                    this.socket.onclose = () => {
                        this.isConnected = false;
                        this.emit('networking:disconnected');
                    };
                    
                } catch (error) {
                    this.logger.error('Error conectando al servidor:', error);
                }
            },
            
            handleMessage(message) {
                this.emit('message:received', message);
            },
            
            sendMessage(type, data) {
                if (this.isConnected) {
                    this.socket.send(JSON.stringify({ type, data }));
                }
            }
        };
        
        await networkingModule.connect();
        return networkingModule;
    }

    /**
     * Inicializar módulo de audio
     */
    async initializeAudioModule() {
        const AudioService = await this.loadModule('services/audio-service.js');
        const audioService = new AudioService(this.config.audio);
        
        await audioService.initialize();
        
        return audioService;
    }

    /**
     * Inicializar módulo de física
     */
    async initializePhysicsModule() {
        const physicsModule = {
            name: 'physics',
            bodies: new Map(),
            gravity: this.config.physics.gravity,
            
            addBody: (id, body) => {
                this.bodies.set(id, body);
            },
            
            update: (deltaTime) => {
                // Implementación de física
                this.bodies.forEach(body => {
                    if (body.affectedByGravity) {
                        body.velocity.y += this.gravity * deltaTime;
                    }
                });
            }
        };
        
        return physicsModule;
    }

    /**
     * Inicializar módulo de avatares
     */
    async initializeAvatarsModule() {
        const avatarsModule = {
            name: 'avatars',
            avatars: new Map(),
            
            async createAvatar(userId, options = {}) {
                const avatar = {
                    id: `avatar_${userId}`,
                    userId,
                    appearance: options.appearance || this.generateRandomAppearance(),
                    position: options.position || { x: 0, y: 0, z: 0 }
                };
                
                this.avatars.set(avatar.id, avatar);
                return avatar;
            },
            
            generateRandomAppearance() {
                return {
                    skinColor: '#FFDBB4',
                    hairColor: '#090806',
                    height: 1.7
                };
            }
        };
        
        return avatarsModule;
    }

    /**
     * Inicializar módulo de islas
     */
    async initializeIslandsModule() {
        const islandsModule = {
            name: 'islands',
            islands: new Map(),
            currentIsland: null,
            
            async loadIslands() {
                const islandTypes = ['forest', 'ocean', 'mountain', 'desert', 'city'];
                
                islandTypes.forEach(type => {
                    this.islands.set(type, {
                        id: type,
                        type,
                        name: this.getIslandName(type),
                        position: { x: 0, y: 0, z: 0 }
                    });
                });
            },
            
            getIslandName(type) {
                const names = {
                    forest: 'Bosque Místico',
                    ocean: 'Océano Infinito',
                    mountain: 'Cumbres Nevadas',
                    desert: 'Desierto Dorado',
                    city: 'Ciudad Futurista'
                };
                return names[type] || 'Isla Desconocida';
            },
            
            async changeIsland(islandType) {
                const island = this.islands.get(islandType);
                if (island) {
                    this.currentIsland = island;
                    this.emit('island:changed', { island });
                    return island;
                }
            }
        };
        
        await islandsModule.loadIslands();
        return islandsModule;
    }

    /**
     * Inicializar módulo de marketplace
     */
    async initializeMarketplaceModule() {
        const marketplaceModule = {
            name: 'marketplace',
            items: new Map(),
            
            async listItem(item) {
                const listing = {
                    id: `item_${Date.now()}`,
                    ...item,
                    status: 'active'
                };
                
                this.items.set(listing.id, listing);
                return listing;
            },
            
            async buyItem(itemId, buyerId) {
                const item = this.items.get(itemId);
                if (item && item.status === 'active') {
                    item.status = 'sold';
                    return { success: true, item };
                }
                return { success: false };
            }
        };
        
        return marketplaceModule;
    }

    /**
     * Inicializar módulo de DeFi
     */
    async initializeDeFiModule() {
        const defiModule = {
            name: 'defi',
            pools: new Map(),
            
            async createPool(poolData) {
                const pool = {
                    id: `pool_${Date.now()}`,
                    ...poolData,
                    totalStaked: 0
                };
                
                this.pools.set(pool.id, pool);
                return pool;
            },
            
            async stake(poolId, amount) {
                const pool = this.pools.get(poolId);
                if (pool) {
                    pool.totalStaked += amount;
                    return { success: true, pool };
                }
                return { success: false };
            }
        };
        
        return defiModule;
    }

    /**
     * Inicializar módulo de gobernanza
     */
    async initializeGovernanceModule() {
        const governanceModule = {
            name: 'governance',
            proposals: new Map(),
            
            async createProposal(proposalData) {
                const proposal = {
                    id: `proposal_${Date.now()}`,
                    ...proposalData,
                    status: 'active',
                    votesFor: 0,
                    votesAgainst: 0
                };
                
                this.proposals.set(proposal.id, proposal);
                return proposal;
            },
            
            async vote(proposalId, support) {
                const proposal = this.proposals.get(proposalId);
                if (proposal) {
                    if (support) {
                        proposal.votesFor++;
                    } else {
                        proposal.votesAgainst++;
                    }
                    return { success: true, proposal };
                }
                return { success: false };
            }
        };
        
        return governanceModule;
    }

    /**
     * Inicializar módulo de páginas
     */
    async initializePagesModule() {
        const pagesModule = {
            name: 'pages',
            routes: new Map(),
            currentPage: null,
            
            registerRoute: (path, component) => {
                this.routes.set(path, component);
            },
            
            navigateTo: (path) => {
                const component = this.routes.get(path);
                if (component) {
                    this.currentPage = path;
                    this.emit('page:changed', { path, component });
                    return true;
                }
                return false;
            }
        };
        
        return pagesModule;
    }

    /**
     * Inicializar módulo de Three.js
     */
    async initializeThreeJSModule() {
        const threejsModule = {
            name: 'threejs',
            scene: null,
            camera: null,
            renderer: null,
            
            async initialize() {
                // Crear escena
                this.scene = new THREE.Scene();
                
                // Crear cámara
                this.camera = new THREE.PerspectiveCamera(
                    75, 
                    window.innerWidth / window.innerHeight, 
                    0.1, 
                    1000
                );
                
                // Crear renderer
                this.renderer = new THREE.WebGLRenderer({ 
                    antialias: this.config.threejs.antialias 
                });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                
                // Agregar al DOM
                const container = document.querySelector(this.config.threejs.container);
                if (container) {
                    container.appendChild(this.renderer.domElement);
                }
                
                // Configurar iluminación
                const ambientLight = new THREE.AmbientLight(0x404040);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(10, 10, 5);
                
                this.scene.add(ambientLight);
                this.scene.add(directionalLight);
                
                // Posicionar cámara
                this.camera.position.z = 5;
                
                // Iniciar loop de renderizado
                this.animate();
            },
            
            animate: () => {
                requestAnimationFrame(() => this.animate());
                this.renderer.render(this.scene, this.camera);
            },
            
            addObject: (object) => {
                this.scene.add(object);
            },
            
            removeObject: (object) => {
                this.scene.remove(object);
            }
        };
        
        await threejsModule.initialize();
        return threejsModule;
    }

    /**
     * Cargar módulo dinámicamente
     */
    async loadModule(modulePath) {
        try {
            // En un entorno real, esto cargaría el módulo dinámicamente
            // Por ahora, asumimos que los módulos están disponibles globalmente
            const moduleName = modulePath.split('/').pop().replace('.js', '');
            return window[moduleName] || null;
        } catch (error) {
            this.logger.error(`Error cargando módulo ${modulePath}:`, error);
            throw error;
        }
    }

    /**
     * Configurar comunicación entre módulos
     */
    async setupModuleCommunication() {
        // Configurar eventos entre módulos
        this.on('blockchain:transaction', (data) => {
            this.modules.get('networking')?.sendMessage('transaction', data);
        });
        
        this.on('island:changed', (data) => {
            this.modules.get('audio')?.changeAmbient(data.island.type);
        });
        
        this.on('avatar:created', (data) => {
            this.modules.get('physics')?.addBody(data.avatar.id, {
                type: 'avatar',
                position: data.avatar.position,
                mass: 70
            });
        });
        
        this.logger.info('Comunicación entre módulos configurada');
    }

    /**
     * Configurar eventos globales
     */
    async setupGlobalEvents() {
        // Eventos de usuario
        this.on('user:login', this.handleUserLogin.bind(this));
        this.on('user:logout', this.handleUserLogout.bind(this));
        
        // Eventos de navegación
        this.on('island:change', this.handleIslandChange.bind(this));
        this.on('avatar:customize', this.handleAvatarCustomize.bind(this));
        
        // Eventos de blockchain
        this.on('blockchain:connected', this.handleBlockchainConnection.bind(this));
        this.on('transaction:completed', this.handleTransactionCompleted.bind(this));
        
        this.logger.info('Eventos globales configurados');
    }

    /**
     * Inicializar interfaz de usuario
     */
    async initializeUI() {
        // Crear elementos de UI básicos
        this.createUIElements();
        
        // Configurar controles
        this.setupControls();
        
        // Configurar notificaciones
        this.setupNotifications();
        
        this.logger.info('Interfaz de usuario inicializada');
    }

    /**
     * Crear elementos de UI
     */
    createUIElements() {
        // Crear contenedor principal si no existe
        if (!document.getElementById('metaverso-platform')) {
            const container = document.createElement('div');
            container.id = 'metaverso-platform';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '1000';
            document.body.appendChild(container);
        }
        
        // Crear canvas para Three.js
        if (!document.getElementById('metaverso-canvas')) {
            const canvas = document.createElement('div');
            canvas.id = 'metaverso-canvas';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            document.getElementById('metaverso-platform').appendChild(canvas);
        }
    }

    /**
     * Configurar controles
     */
    setupControls() {
        // Controles de teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // Controles de mouse
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        // Controles de touch
        document.addEventListener('touchstart', (event) => {
            this.handleTouchStart(event);
        });
    }

    /**
     * Configurar notificaciones
     */
    setupNotifications() {
        this.notificationSystem = {
            show: (message, type = 'info', duration = 3000) => {
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
                    color: white;
                    border-radius: 5px;
                    z-index: 10000;
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, duration);
            }
        };
    }

    /**
     * Iniciar la plataforma
     */
    async start() {
        if (!this.state.isInitialized) {
            throw new Error('Plataforma no inicializada');
        }
        
        try {
            this.logger.info('Iniciando plataforma del metaverso...');
            
            // Iniciar todos los módulos
            for (const [moduleName, moduleInstance] of this.modules) {
                if (typeof moduleInstance.start === 'function') {
                    await moduleInstance.start();
                }
            }
            
            // Iniciar loop principal
            this.startMainLoop();
            
            this.state.isRunning = true;
            this.emit('platform:started');
            
            this.logger.info('Plataforma del metaverso iniciada');
            
        } catch (error) {
            this.logger.error('Error iniciando plataforma:', error);
            throw error;
        }
    }

    /**
     * Iniciar loop principal
     */
    startMainLoop() {
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            if (!this.state.isRunning) return;
            
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Actualizar física
            const physicsModule = this.modules.get('physics');
            if (physicsModule) {
                physicsModule.update(deltaTime);
            }
            
            // Actualizar métricas
            this.updateMetrics();
            
            // Continuar loop
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Actualizar métricas
     */
    updateMetrics() {
        // FPS
        this.state.metrics.fps = Math.round(1000 / (performance.now() - this.lastFrameTime));
        this.lastFrameTime = performance.now();
        
        // Memoria (si está disponible)
        if (performance.memory) {
            this.state.metrics.memory = performance.memory.usedJSHeapSize;
        }
        
        // Usuarios activos
        this.state.metrics.users = this.modules.get('avatars')?.avatars.size || 0;
        
        // Transacciones
        this.state.metrics.transactions = this.modules.get('blockchain')?.transactionHistory?.length || 0;
    }

    /**
     * Detener la plataforma
     */
    async stop() {
        try {
            this.logger.info('Deteniendo plataforma del metaverso...');
            
            this.state.isRunning = false;
            
            // Detener todos los módulos
            for (const [moduleName, moduleInstance] of this.modules) {
                if (typeof moduleInstance.stop === 'function') {
                    await moduleInstance.stop();
                }
            }
            
            this.emit('platform:stopped');
            this.logger.info('Plataforma del metaverso detenida');
            
        } catch (error) {
            this.logger.error('Error deteniendo plataforma:', error);
            throw error;
        }
    }

    /**
     * Obtener módulo
     */
    getModule(moduleName) {
        return this.modules.get(moduleName);
    }

    /**
     * Obtener estado de la plataforma
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Obtener métricas
     */
    getMetrics() {
        return this.metricsCollector?.getMetrics() || {};
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
     * Handlers de eventos
     */
    handleUserLogin(data) {
        this.state.currentUser = data.user;
        this.logger.info(`Usuario conectado: ${data.user.username}`);
    }

    handleUserLogout(data) {
        this.state.currentUser = null;
        this.logger.info('Usuario desconectado');
    }

    handleIslandChange(data) {
        this.state.currentIsland = data.island;
        this.logger.info(`Cambiando a isla: ${data.island.name}`);
    }

    handleAvatarCustomize(data) {
        this.logger.info(`Avatar personalizado: ${data.avatarId}`);
    }

    handleBlockchainConnection(data) {
        this.logger.info('Conectado a blockchain');
    }

    handleTransactionCompleted(data) {
        this.logger.info(`Transacción completada: ${data.hash}`);
    }

    handleKeyPress(event) {
        // Implementar controles de teclado
    }

    handleMouseMove(event) {
        // Implementar controles de mouse
    }

    handleTouchStart(event) {
        // Implementar controles de touch
    }

    /**
     * Destruir la plataforma
     */
    async destroy() {
        try {
            this.logger.info('Destruyendo plataforma del metaverso...');
            
            await this.stop();
            
            // Limpiar módulos
            this.modules.clear();
            
            // Limpiar eventos
            this.eventEmitter = null;
            
            // Limpiar UI
            const container = document.getElementById('metaverso-platform');
            if (container) {
                container.remove();
            }
            
            this.logger.info('Plataforma del metaverso destruida');
            
        } catch (error) {
            this.logger.error('Error destruyendo plataforma:', error);
            throw error;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.MetaversoPlatformCore = MetaversoPlatformCore;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoPlatformCore;
} 