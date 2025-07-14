/**
 * Three.js Advanced Core - Metaverso Crypto World Virtual 3D
 * Sistema modular avanzado con funcionalidades de metaverso
 */

class ThreeJSAdvancedCore {
    constructor(config = {}) {
        this.config = {
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: false,
            ...config
        };
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Sistemas avanzados
        this.systems = {
            physics: null,
            audio: null,
            particles: null,
            shaders: null,
            networking: null,
            blockchain: null,
            defi: null,
            nft: null,
            vr: null,
            ai: null
        };
        
        // Estados del sistema
        this.states = {
            isInitialized: false,
            isRendering: false,
            isVRMode: false,
            isMultiplayer: false,
            isBlockchainConnected: false,
            isDefiEnabled: false,
            isNFTEnabled: false,
            isAIActive: false
        };
        
        // Métricas de rendimiento
        this.metrics = {
            fps: 0,
            memoryUsage: 0,
            drawCalls: 0,
            triangles: 0,
            points: 0,
            lines: 0
        };
        
        // Eventos personalizados
        this.events = new EventTarget();
        
        console.log('🚀 Three.js Advanced Core inicializado');
    }
    
    /**
     * Inicializar el sistema completo
     */
    async initialize() {
        try {
            await this.createScene();
            await this.createCamera();
            await this.createRenderer();
            await this.createComposer();
            await this.createControls();
            await this.setupEventListeners();
            await this.initializeSystems();
            
            this.states.isInitialized = true;
            this.events.dispatchEvent(new CustomEvent('initialized'));
            
            console.log('✅ Sistema Three.js Advanced Core inicializado completamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Three.js Advanced Core:', error);
            throw error;
        }
    }
    
    /**
     * Crear escena avanzada con configuraciones optimizadas
     */
    async createScene() {
        this.scene = new THREE.Scene();
        
        // Configuración de ambiente
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = new THREE.Fog(0x000011, 10, 1000);
        
        // Configuración de iluminación global
        this.scene.environment = await this.createEnvironmentMap();
        
        // Configuración de física
        this.scene.userData.physics = {
            gravity: new THREE.Vector3(0, -9.81, 0),
            airResistance: 0.1,
            groundFriction: 0.8
        };
        
        // Configuración de metaverso
        this.scene.userData.metaverse = {
            worldId: this.generateWorldId(),
            version: '3.0.0',
            blockchain: 'ethereum',
            defiEnabled: true,
            nftEnabled: true,
            vrEnabled: true
        };
        
        console.log('✅ Escena avanzada creada');
    }
    
    /**
     * Crear cámara avanzada con múltiples modos
     */
    async createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Cámara principal
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);
        
        // Configuración de cámara avanzada
        this.camera.userData = {
            modes: {
                firstPerson: { fov: 90, near: 0.1, far: 1000 },
                thirdPerson: { fov: 60, near: 0.1, far: 2000 },
                vr: { fov: 110, near: 0.01, far: 10000 },
                cinematic: { fov: 45, near: 0.1, far: 5000 }
            },
            currentMode: 'thirdPerson',
            shake: { intensity: 0, duration: 0 },
            postProcessing: {
                bloom: true,
                dof: true,
                ssao: true,
                motionBlur: true
            }
        };
        
        // Cámaras adicionales para efectos
        this.cameras = {
            shadow: new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000),
            reflection: new THREE.PerspectiveCamera(75, aspect, 0.1, 1000),
            ui: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
        };
        
        console.log('✅ Cámara avanzada creada');
    }
    
    /**
     * Crear renderizador avanzado con optimizaciones
     */
    async createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.config.antialias,
            alpha: this.config.alpha,
            powerPreference: this.config.powerPreference,
            stencil: this.config.stencil,
            depth: this.config.depth,
            logarithmicDepthBuffer: this.config.logarithmicDepthBuffer
        });
        
        // Configuración avanzada del renderizador
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        
        // Configuración de rendimiento
        this.renderer.userData = {
            maxLights: 8,
            maxShadows: 4,
            maxTextures: 16,
            maxGeometries: 1000,
            maxMaterials: 1000,
            autoClear: true,
            sortObjects: true
        };
        
        document.body.appendChild(this.renderer.domElement);
        
        console.log('✅ Renderizador avanzado creado');
    }
    
    /**
     * Crear compositor para post-procesamiento avanzado
     */
    async createComposer() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom pass
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        this.composer.addPass(bloomPass);
        
        // SSAO pass
        const ssaoPass = new THREE.SSAOPass(this.scene, this.camera);
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        this.composer.addPass(ssaoPass);
        
        // DOF pass
        const dofPass = new THREE.BokehPass(this.scene, this.camera, {
            focus: 1.0,
            aperture: 0.025,
            maxblur: 0.01
        });
        this.composer.addPass(dofPass);
        
        // Motion blur pass
        const motionBlurPass = new THREE.MotionBlurPass({
            samples: 32
        });
        this.composer.addPass(motionBlurPass);
        
        console.log('✅ Compositor avanzado creado');
    }
    
    /**
     * Crear controles avanzados
     */
    async createControls() {
        // Orbit controls para cámara libre
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 1000;
        this.controls.maxPolarAngle = Math.PI;
        
        // Pointer lock controls para FPS
        this.pointerLockControls = new THREE.PointerLockControls(this.camera, this.renderer.domElement);
        
        // VR controls
        if (this.isVRSupported()) {
            this.vrControls = new THREE.VRControls(this.camera);
        }
        
        console.log('✅ Controles avanzados creados');
    }
    
    /**
     * Configurar event listeners
     */
    async setupEventListeners() {
        // Resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Mouse events
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('dblclick', this.onMouseDoubleClick.bind(this));
        
        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Touch events
        window.addEventListener('touchstart', this.onTouchStart.bind(this));
        window.addEventListener('touchmove', this.onTouchMove.bind(this));
        window.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // VR events
        if (this.isVRSupported()) {
            window.addEventListener('vrdisplaypresentchange', this.onVRDisplayChange.bind(this));
        }
        
        // Blockchain events
        window.addEventListener('blockchain-connected', this.onBlockchainConnected.bind(this));
        window.addEventListener('defi-update', this.onDefiUpdate.bind(this));
        window.addEventListener('nft-mint', this.onNFTMint.bind(this));
        
        console.log('✅ Event listeners configurados');
    }
    
    /**
     * Inicializar sistemas avanzados
     */
    async initializeSystems() {
        // Sistema de física
        this.systems.physics = new PhysicsSystem(this.scene);
        await this.systems.physics.initialize();
        
        // Sistema de audio
        this.systems.audio = new AudioSystem(this.camera);
        await this.systems.audio.initialize();
        
        // Sistema de partículas
        this.systems.particles = new ParticleSystem(this.scene);
        await this.systems.particles.initialize();
        
        // Sistema de shaders
        this.systems.shaders = new ShaderSystem(this.renderer);
        await this.systems.shaders.initialize();
        
        // Sistema de networking
        this.systems.networking = new NetworkingSystem();
        await this.systems.networking.initialize();
        
        // Sistema blockchain
        this.systems.blockchain = new BlockchainSystem();
        await this.systems.blockchain.initialize();
        
        // Sistema DeFi
        this.systems.defi = new DefiSystem();
        await this.systems.defi.initialize();
        
        // Sistema NFT
        this.systems.nft = new NFTSystem();
        await this.systems.nft.initialize();
        
        // Sistema VR
        this.systems.vr = new VRSystem(this.renderer, this.camera);
        await this.systems.vr.initialize();
        
        // Sistema AI
        this.systems.ai = new AISystem(this.scene);
        await this.systems.ai.initialize();
        
        console.log('✅ Sistemas avanzados inicializados');
    }
    
    /**
     * Crear mapa de ambiente
     */
    async createEnvironmentMap() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'textures/px.jpg', 'textures/nx.jpg',
            'textures/py.jpg', 'textures/ny.jpg',
            'textures/pz.jpg', 'textures/nz.jpg'
        ]);
        
        return texture;
    }
    
    /**
     * Generar ID único del mundo
     */
    generateWorldId() {
        return 'world_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Verificar soporte VR
     */
    isVRSupported() {
        return 'getVRDisplays' in navigator || 'getVRDevices' in navigator;
    }
    
    /**
     * Event handlers
     */
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
        
        this.events.dispatchEvent(new CustomEvent('resize'));
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.events.dispatchEvent(new CustomEvent('mousemove', { detail: { mouse: this.mouse } }));
    }
    
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.events.dispatchEvent(new CustomEvent('object-clicked', { detail: { object } }));
        }
    }
    
    onMouseDoubleClick(event) {
        this.events.dispatchEvent(new CustomEvent('double-click'));
    }
    
    onKeyDown(event) {
        this.events.dispatchEvent(new CustomEvent('keydown', { detail: { key: event.key } }));
    }
    
    onKeyUp(event) {
        this.events.dispatchEvent(new CustomEvent('keyup', { detail: { key: event.key } }));
    }
    
    onTouchStart(event) {
        this.events.dispatchEvent(new CustomEvent('touchstart', { detail: { touches: event.touches } }));
    }
    
    onTouchMove(event) {
        this.events.dispatchEvent(new CustomEvent('touchmove', { detail: { touches: event.touches } }));
    }
    
    onTouchEnd(event) {
        this.events.dispatchEvent(new CustomEvent('touchend', { detail: { touches: event.touches } }));
    }
    
    onVRDisplayChange(event) {
        this.states.isVRMode = event.detail.isPresenting;
        this.events.dispatchEvent(new CustomEvent('vr-mode-changed', { detail: { isVRMode: this.states.isVRMode } }));
    }
    
    onBlockchainConnected(event) {
        this.states.isBlockchainConnected = true;
        this.events.dispatchEvent(new CustomEvent('blockchain-connected'));
    }
    
    onDefiUpdate(event) {
        this.events.dispatchEvent(new CustomEvent('defi-update', { detail: event.detail }));
    }
    
    onNFTMint(event) {
        this.events.dispatchEvent(new CustomEvent('nft-mint', { detail: event.detail }));
    }
    
    /**
     * Bucle de renderizado principal
     */
    render() {
        if (!this.states.isInitialized) return;
        
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();
        
        // Actualizar controles
        if (this.controls) this.controls.update();
        
        // Actualizar sistemas
        this.updateSystems(delta, elapsed);
        
        // Actualizar métricas
        this.updateMetrics();
        
        // Renderizar
        if (this.states.isVRMode && this.renderer.xr.isPresenting) {
            this.renderer.setAnimationLoop(this.render.bind(this));
        } else {
            this.composer.render();
        }
        
        this.states.isRendering = true;
    }
    
    /**
     * Actualizar sistemas
     */
    updateSystems(delta, elapsed) {
        if (this.systems.physics) this.systems.physics.update(delta);
        if (this.systems.audio) this.systems.audio.update(delta);
        if (this.systems.particles) this.systems.particles.update(delta);
        if (this.systems.shaders) this.systems.shaders.update(delta);
        if (this.systems.networking) this.systems.networking.update(delta);
        if (this.systems.blockchain) this.systems.blockchain.update(delta);
        if (this.systems.defi) this.systems.defi.update(delta);
        if (this.systems.nft) this.systems.nft.update(delta);
        if (this.systems.vr) this.systems.vr.update(delta);
        if (this.systems.ai) this.systems.ai.update(delta);
    }
    
    /**
     * Actualizar métricas de rendimiento
     */
    updateMetrics() {
        this.metrics.fps = 1 / this.clock.getDelta();
        this.metrics.memoryUsage = this.renderer.info.memory;
        this.metrics.drawCalls = this.renderer.info.render.calls;
        this.metrics.triangles = this.renderer.info.render.triangles;
        this.metrics.points = this.renderer.info.render.points;
        this.metrics.lines = this.renderer.info.render.lines;
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * Obtener estado del sistema
     */
    getState() {
        return this.states;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar renderizador
        this.renderer.dispose();
        
        // Limpiar sistemas
        Object.values(this.systems).forEach(system => {
            if (system && system.dispose) system.dispose();
        });
        
        // Remover event listeners
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('click', this.onMouseClick);
        window.removeEventListener('dblclick', this.onMouseDoubleClick);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
        
        console.log('🧹 Three.js Advanced Core limpiado');
    }
}

// Exportar para uso global
window.ThreeJSAdvancedCore = ThreeJSAdvancedCore; 