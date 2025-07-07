/**
 * Ejemplo Completo - Metaverso Crypto World Virtual 3D
 * Demostración de todos los sistemas JavaScript integrados
 */

class MetaverseExample {
    constructor() {
        // Sistemas principales
        this.asyncSystem = null;
        this.counter = null;
        this.queue = null;
        this.syncSystem = null;
        this.threeJS = null;
        this.walker = null;
        
        // Estados
        this.isInitialized = false;
        this.isRunning = false;
        
        console.log('🎮 Ejemplo del Metaverso inicializado');
    }
    
    /**
     * Inicializar todos los sistemas
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando sistemas del metaverso...');
            
            // Inicializar sistemas
            this.asyncSystem = new AsyncSystem();
            this.counter = new AdvancedCounter();
            this.queue = new AdvancedQueue(this.onQueueEmpty.bind(this));
            this.syncSystem = new SyncSystem();
            this.threeJS = new ThreeJSAdvancedSystem();
            this.walker = new AdvancedWalker('/assets');
            
            // Configurar eventos
            this.setupEvents();
            
            // Inicializar Three.js
            await this.threeJS.initialize({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            
            // Crear escena de ejemplo
            await this.createExampleScene();
            
            // Inicializar walker
            await this.initializeWalker();
            
            this.isInitialized = true;
            
            console.log('✅ Todos los sistemas inicializados correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando sistemas:', error);
            throw error;
        }
    }
    
    /**
     * Configurar eventos del sistema
     */
    setupEvents() {
        // Eventos de async
        this.asyncSystem.events.addEventListener('operation-success', (event) => {
            console.log('✅ Operación async completada:', event.detail);
            this.counter.increment('successfulOperations');
        });
        
        this.asyncSystem.events.addEventListener('operation-error', (event) => {
            console.error('❌ Error en operación async:', event.detail);
            this.counter.increment('failedOperations');
        });
        
        // Eventos de contador
        this.counter.events.addEventListener('counter-changed', (event) => {
            console.log('📊 Contador actualizado:', event.detail);
        });
        
        // Eventos de cola
        this.queue.events.addEventListener('task-completed', (event) => {
            console.log('✅ Tarea completada:', event.detail);
        });
        
        this.queue.events.addEventListener('task-failed', (event) => {
            console.error('❌ Tarea falló:', event.detail);
        });
        
        // Eventos de sincronización
        this.syncSystem.events.addEventListener('metaverse-synced', (event) => {
            console.log('🔄 Metaverso sincronizado:', event.detail);
        });
        
        // Eventos de Three.js
        this.threeJS.events.addEventListener('initialized', () => {
            console.log('🎮 Three.js inicializado');
        });
        
        this.threeJS.events.addEventListener('resize', () => {
            console.log('📐 Ventana redimensionada');
        });
        
        // Eventos de walker
        this.walker.events.addEventListener('file-found', (event) => {
            console.log('📁 Archivo encontrado:', event.detail);
        });
        
        this.walker.events.addEventListener('walk-completed', (event) => {
            console.log('🚶 Exploración completada:', event.detail);
        });
    }
    
    /**
     * Crear escena de ejemplo
     */
    async createExampleScene() {
        const scene = this.threeJS.scene;
        
        // Crear geometrías básicas
        const geometries = [
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.CylinderGeometry(1, 1, 2, 8),
            new THREE.ConeGeometry(1, 2, 8),
            new THREE.TorusGeometry(1, 0.3, 8, 16)
        ];
        
        const materials = [
            new THREE.MeshLambertMaterial({ color: 0xff0000 }),
            new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
            new THREE.MeshLambertMaterial({ color: 0x0000ff }),
            new THREE.MeshLambertMaterial({ color: 0xffff00 }),
            new THREE.MeshLambertMaterial({ color: 0xff00ff })
        ];
        
        // Crear objetos
        geometries.forEach((geometry, index) => {
            const material = materials[index];
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                (index - 2) * 4,
                2,
                0
            );
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            scene.add(mesh);
        });
        
        // Crear iluminación
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Actualizar contadores
        this.counter.models = geometries.length;
        this.counter.lights = 2;
    }
    
    /**
     * Inicializar walker
     */
    async initializeWalker() {
        // Crear walkers especializados
        const modelWalker = this.walker.createModelWalker('/models');
        const textureWalker = this.walker.createTextureWalker('/textures');
        const audioWalker = this.walker.createAudioWalker('/audio');
        const shaderWalker = this.walker.createShaderWalker('/shaders');
        const blockchainWalker = this.walker.createBlockchainWalker('/blockchain');
        
        // Agregar tareas a la cola
        this.queue.enqueue(async () => {
            const modelResults = await modelWalker.start();
            this.counter.models = modelResults.length;
            return modelResults;
        }, 3);
        
        this.queue.enqueue(async () => {
            const textureResults = await textureWalker.start();
            this.counter.textures = textureResults.length;
            return textureResults;
        }, 2);
        
        this.queue.enqueue(async () => {
            const audioResults = await audioWalker.start();
            this.counter.audio = audioResults.length;
            return audioResults;
        }, 2);
        
        this.queue.enqueue(async () => {
            const shaderResults = await shaderWalker.start();
            this.counter.shaders = shaderResults.length;
            return shaderResults;
        }, 1);
        
        this.queue.enqueue(async () => {
            const blockchainResults = await blockchainWalker.start();
            this.counter.smartContracts = blockchainResults.length;
            return blockchainResults;
        }, 4);
    }
    
    /**
     * Cargar recursos del metaverso
     */
    async loadMetaverseResources() {
        console.log('📦 Cargando recursos del metaverso...');
        
        const resources = [
            { type: 'model', url: 'models/character.glb', options: { optimize: true } },
            { type: 'texture', url: 'textures/terrain.jpg', options: { generateMipmaps: true } },
            { type: 'audio', url: 'audio/ambient.mp3', options: { volume: 0.5 } },
            { type: 'shader', url: 'shaders/water.glsl', options: { uniforms: {} } },
            { type: 'blockchain', url: 'api/blockchain/status', options: { timeout: 10000 } },
            { type: 'defi', url: 'api/defi/protocols', options: { data: { chain: 'ethereum' } } },
            { type: 'nft', url: 'api/nft/collection', options: { token: 'api_key' } }
        ];
        
        try {
            const results = await this.asyncSystem.loadMetaverseResources(resources);
            console.log('✅ Recursos cargados:', results);
            return results;
        } catch (error) {
            console.error('❌ Error cargando recursos:', error);
            throw error;
        }
    }
    
    /**
     * Ejecutar transacciones blockchain
     */
    async executeBlockchainTransactions() {
        console.log('⛓️ Ejecutando transacciones blockchain...');
        
        const transactions = [
            { type: 'transfer', to: '0x123...', amount: '1.0', token: 'ETH' },
            { type: 'mint', tokenId: 123, metadata: { name: 'Crypto NFT', description: 'NFT del metaverso' } },
            { type: 'swap', from: 'ETH', to: 'USDC', amount: '0.5' },
            { type: 'stake', protocol: 'Uniswap', amount: '100', token: 'LP' }
        ];
        
        for (const tx of transactions) {
            this.queue.enqueue(async () => {
                // Simular transacción blockchain
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
                
                this.counter.increment('transactions');
                this.counter.cryptoBalance += Math.random() * 10;
                
                console.log(`✅ Transacción ${tx.type} completada`);
                return { success: true, tx };
            }, 4);
        }
    }
    
    /**
     * Crear NPCs y agentes de IA
     */
    async createAIEntities() {
        console.log('🤖 Creando entidades de IA...');
        
        const npcs = [
            { name: 'Comerciante Crypto', position: { x: 10, y: 0, z: 10 }, behavior: 'merchant' },
            { name: 'Guardia Blockchain', position: { x: -10, y: 0, z: -10 }, behavior: 'guard' },
            { name: 'Minero DeFi', position: { x: 0, y: 0, z: 20 }, behavior: 'wanderer' }
        ];
        
        const agents = [
            { type: 'trader', position: { x: 5, y: 0, z: 5 }, sensors: ['market_data', 'price_feed'] },
            { type: 'security', position: { x: -5, y: 0, z: -5 }, sensors: ['threat_detection', 'audit_logs'] }
        ];
        
        for (const npc of npcs) {
            this.queue.enqueue(async () => {
                // Simular creación de NPC
                await new Promise(resolve => setTimeout(resolve, 500));
                
                this.counter.increment('npcCount');
                console.log(`🤖 NPC ${npc.name} creado`);
                return npc;
            }, 2);
        }
        
        for (const agent of agents) {
            this.queue.enqueue(async () => {
                // Simular creación de agente
                await new Promise(resolve => setTimeout(resolve, 800));
                
                this.counter.increment('aiAgents');
                console.log(`🤖 Agente ${agent.type} creado`);
                return agent;
            }, 1);
        }
    }
    
    /**
     * Iniciar sesión VR
     */
    async startVRSession() {
        console.log('🥽 Iniciando sesión VR...');
        
        if (this.threeJS.systems.vr && this.threeJS.systems.vr.states.isVRSupported) {
            try {
                const vrStarted = await this.threeJS.systems.vr.startVRSession();
                
                if (vrStarted) {
                    this.counter.increment('vrSessions');
                    this.counter.vrControllers = 2;
                    this.counter.vrHands = 2;
                    
                    console.log('🥽 Sesión VR iniciada correctamente');
                }
            } catch (error) {
                console.error('❌ Error iniciando VR:', error);
            }
        } else {
            console.warn('⚠️ VR no soportado en este dispositivo');
        }
    }
    
    /**
     * Crear efectos de partículas
     */
    async createParticleEffects() {
        console.log('✨ Creando efectos de partículas...');
        
        const effects = [
            { type: 'explosion', position: { x: 0, y: 10, z: 0 } },
            { type: 'fire', position: { x: 3, y: 1, z: 3 } },
            { type: 'smoke', position: { x: -3, y: 1, z: -3 } },
            { type: 'magic', position: { x: 0, y: 8, z: 5 } },
            { type: 'fluid', position: { x: 0, y: 0, z: 0 } }
        ];
        
        for (const effect of effects) {
            this.queue.enqueue(async () => {
                // Simular creación de efecto
                await new Promise(resolve => setTimeout(resolve, 300));
                
                this.counter.increment('particles');
                console.log(`✨ Efecto ${effect.type} creado`);
                return effect;
            }, 1);
        }
    }
    
    /**
     * Callback cuando la cola está vacía
     */
    onQueueEmpty(error, results) {
        if (error) {
            console.error('❌ Error en cola:', error);
        } else {
            console.log('✅ Cola completada:', results);
        }
    }
    
    /**
     * Iniciar sincronización continua
     */
    startContinuousSync() {
        console.log('🔄 Iniciando sincronización continua...');
        
        this.syncSystem.startContinuousSync();
        
        // Configurar sincronización de componentes
        setInterval(() => {
            this.syncSystem.syncMetaverse({
                scene: this.threeJS.scene,
                physics: this.threeJS.systems.physics,
                audio: this.threeJS.systems.audio,
                particles: this.threeJS.systems.particles,
                ai: this.threeJS.systems.ai,
                vr: this.threeJS.systems.vr,
                blockchain: this.threeJS.systems.blockchain,
                defi: this.threeJS.systems.defi,
                nft: this.threeJS.systems.nft
            }).catch(error => {
                console.error('❌ Error en sincronización:', error);
            });
        }, 1000); // Sincronizar cada segundo
    }
    
    /**
     * Bucle de renderizado
     */
    startRenderLoop() {
        console.log('🎬 Iniciando bucle de renderizado...');
        
        this.isRunning = true;
        
        const animate = () => {
            if (!this.isRunning) return;
            
            // Renderizar Three.js
            this.threeJS.render();
            
            // Actualizar métricas
            this.updateMetrics();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics() {
        // Actualizar métricas de Three.js
        const threeMetrics = this.threeJS.getMetrics();
        this.counter.fps = threeMetrics.fps;
        this.counter.memoryUsage = threeMetrics.memoryUsage;
        this.counter.drawCalls = threeMetrics.drawCalls;
        this.counter.triangles = threeMetrics.triangles;
        this.counter.points = threeMetrics.points;
        this.counter.lines = threeMetrics.lines;
        
        // Actualizar métricas de cola
        const queueMetrics = this.queue.getMetrics();
        this.counter.totalTasks = queueMetrics.totalTasks;
        this.counter.completedTasks = queueMetrics.completedTasks;
        this.counter.failedTasks = queueMetrics.failedTasks;
    }
    
    /**
     * Mostrar métricas en tiempo real
     */
    showMetrics() {
        const metricsDiv = document.createElement('div');
        metricsDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
        `;
        
        document.body.appendChild(metricsDiv);
        
        const updateMetrics = () => {
            const metrics = this.counter.getStats();
            const threeMetrics = this.threeJS.getMetrics();
            const queueMetrics = this.queue.getMetrics();
            
            metricsDiv.innerHTML = `
                <h3>📊 Métricas del Metaverso</h3>
                <div><strong>FPS:</strong> ${threeMetrics.fps.toFixed(1)}</div>
                <div><strong>Memoria:</strong> ${(threeMetrics.memoryUsage / 1024 / 1024).toFixed(1)} MB</div>
                <div><strong>Draw Calls:</strong> ${threeMetrics.drawCalls}</div>
                <div><strong>Triángulos:</strong> ${threeMetrics.triangles}</div>
                <div><strong>Modelos:</strong> ${metrics.metaverse.models}</div>
                <div><strong>Texturas:</strong> ${metrics.metaverse.textures}</div>
                <div><strong>NFTs:</strong> ${metrics.metaverse.nfts}</div>
                <div><strong>Transacciones:</strong> ${metrics.metaverse.transactions}</div>
                <div><strong>NPCs:</strong> ${metrics.ai.npcs}</div>
                <div><strong>Agentes IA:</strong> ${metrics.ai.agents}</div>
                <div><strong>Sesiones VR:</strong> ${metrics.vr.sessions}</div>
                <div><strong>Tareas en Cola:</strong> ${queueMetrics.queueLength}</div>
            `;
        };
        
        setInterval(updateMetrics, 1000);
    }
    
    /**
     * Ejecutar ejemplo completo
     */
    async run() {
        try {
            console.log('🎮 Ejecutando ejemplo completo del metaverso...');
            
            // Inicializar sistemas
            await this.initialize();
            
            // Cargar recursos
            await this.loadMetaverseResources();
            
            // Ejecutar transacciones blockchain
            await this.executeBlockchainTransactions();
            
            // Crear entidades de IA
            await this.createAIEntities();
            
            // Crear efectos de partículas
            await this.createParticleEffects();
            
            // Iniciar sesión VR
            await this.startVRSession();
            
            // Iniciar sincronización continua
            this.startContinuousSync();
            
            // Iniciar bucle de renderizado
            this.startRenderLoop();
            
            // Mostrar métricas
            this.showMetrics();
            
            console.log('✅ Ejemplo del metaverso ejecutándose correctamente');
            
        } catch (error) {
            console.error('❌ Error ejecutando ejemplo:', error);
        }
    }
    
    /**
     * Detener ejemplo
     */
    stop() {
        console.log('🛑 Deteniendo ejemplo del metaverso...');
        
        this.isRunning = false;
        
        // Detener sincronización
        this.syncSystem.stopContinuousSync();
        
        // Limpiar recursos
        this.asyncSystem.dispose();
        this.counter.dispose();
        this.queue.dispose();
        this.syncSystem.dispose();
        this.threeJS.dispose();
        this.walker.dispose();
        
        console.log('🧹 Ejemplo del metaverso detenido y limpiado');
    }
}

// Crear instancia global
window.metaverseExample = new MetaverseExample();

// Ejecutar cuando se cargue la página
window.addEventListener('load', async () => {
    try {
        await window.metaverseExample.run();
    } catch (error) {
        console.error('❌ Error ejecutando ejemplo del metaverso:', error);
    }
});

// Exportar para uso global
window.MetaverseExample = MetaverseExample; 