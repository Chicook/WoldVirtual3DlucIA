/**
 * Ejemplos Avanzados - Three.js Metaverso Crypto World Virtual 3D
 * Demostración completa de todos los sistemas integrados
 */

class ThreeJSExamples {
    constructor() {
        this.core = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Sistemas
        this.physics = null;
        this.audio = null;
        this.particles = null;
        this.shaders = null;
        this.vr = null;
        this.ai = null;
        
        // Ejemplos
        this.examples = {
            basic: this.basicExample.bind(this),
            physics: this.physicsExample.bind(this),
            audio: this.audioExample.bind(this),
            particles: this.particlesExample.bind(this),
            shaders: this.shadersExample.bind(this),
            vr: this.vrExample.bind(this),
            ai: this.aiExample.bind(this),
            complete: this.completeExample.bind(this)
        };
        
        console.log('🎯 Ejemplos Three.js inicializados');
    }
    
    /**
     * Inicializar todos los sistemas
     */
    async initialize() {
        try {
            // Crear core avanzado
            this.core = new ThreeJSAdvancedCore({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            
            await this.core.initialize();
            
            this.scene = this.core.scene;
            this.camera = this.core.camera;
            this.renderer = this.core.renderer;
            
            // Inicializar sistemas
            this.physics = this.core.systems.physics;
            this.audio = this.core.systems.audio;
            this.particles = this.core.systems.particles;
            this.shaders = this.core.systems.shaders;
            this.vr = this.core.systems.vr;
            this.ai = this.core.systems.ai;
            
            console.log('✅ Todos los sistemas inicializados');
            
        } catch (error) {
            console.error('❌ Error inicializando ejemplos:', error);
            throw error;
        }
    }
    
    /**
     * Ejemplo básico
     */
    async basicExample() {
        console.log('🎬 Ejecutando ejemplo básico...');
        
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
            
            this.scene.add(mesh);
        });
        
        // Crear iluminación
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Animar objetos
        const animate = () => {
            this.scene.children.forEach(child => {
                if (child.isMesh) {
                    child.rotation.x += 0.01;
                    child.rotation.y += 0.01;
                }
            });
            
            this.core.render();
            requestAnimationFrame(animate);
        };
        
        animate();
        
        console.log('✅ Ejemplo básico completado');
    }
    
    /**
     * Ejemplo de física
     */
    async physicsExample() {
        console.log('🎬 Ejecutando ejemplo de física...');
        
        // Crear cuerpos físicos
        const bodies = [
            this.physics.createRigidBody({
                type: 'box',
                mass: 1,
                position: { x: 0, y: 10, z: 0 },
                size: { x: 1, y: 1, z: 1 }
            }),
            
            this.physics.createRigidBody({
                type: 'sphere',
                mass: 2,
                position: { x: 2, y: 15, z: 0 },
                size: { x: 1, y: 1, z: 1 }
            }),
            
            this.physics.createRigidBody({
                type: 'cylinder',
                mass: 3,
                position: { x: -2, y: 20, z: 0 },
                size: { x: 0.5, y: 2, z: 0.5 }
            })
        ];
        
        // Crear vehículo
        const vehicle = this.physics.createVehicle({
            position: { x: 5, y: 2, z: 5 }
        });
        
        // Crear fluido
        const fluid = this.physics.createFluid({
            position: { x: -5, y: 0, z: -5 },
            resolution: 10
        });
        
        // Crear tela
        const cloth = this.physics.createCloth({
            position: { x: 0, y: 5, z: 5 }
        });
        
        // Controlar vehículo
        document.addEventListener('keydown', (event) => {
            const controls = {
                engineForce: 0,
                brakeForce: 0,
                steering: 0
            };
            
            switch (event.key) {
                case 'w':
                    controls.engineForce = 1000;
                    break;
                case 's':
                    controls.engineForce = -1000;
                    break;
                case 'a':
                    controls.steering = -0.5;
                    break;
                case 'd':
                    controls.steering = 0.5;
                    break;
                case ' ':
                    controls.brakeForce = 100;
                    break;
            }
            
            this.physics.controlVehicle(vehicle.id, controls);
        });
        
        console.log('✅ Ejemplo de física completado');
        console.log('🎮 Controles: WASD para mover, ESPACIO para frenar');
    }
    
    /**
     * Ejemplo de audio
     */
    async audioExample() {
        console.log('🎬 Ejecutando ejemplo de audio...');
        
        // Cargar sonidos 3D
        const sounds = [
            await this.audio.load3DSound('ambient', 'sounds/ambient/forest.mp3', {
                position: { x: 0, y: 0, z: 0 },
                volume: 0.5,
                loop: true
            }),
            
            await this.audio.load3DSound('waterfall', 'sounds/ambient/waterfall.mp3', {
                position: { x: 10, y: 0, z: 10 },
                volume: 0.7,
                loop: true
            }),
            
            await this.audio.load3DSound('wind', 'sounds/ambient/wind.mp3', {
                position: { x: -10, y: 5, z: -10 },
                volume: 0.3,
                loop: true
            })
        ];
        
        // Cargar música
        const music = await this.audio.loadMusic('background', 'sounds/music/background.mp3', {
            volume: 0.4,
            loop: true,
            autoplay: true
        });
        
        // Cargar efectos
        const effects = [
            await this.audio.loadEffect('click', 'sounds/effects/click.mp3'),
            await this.audio.loadEffect('notification', 'sounds/effects/notification.mp3'),
            await this.audio.loadEffect('success', 'sounds/effects/success.mp3')
        ];
        
        // Crear controles de audio
        this.createAudioControls();
        
        // Crear visualización de audio
        this.createAudioVisualization();
        
        console.log('✅ Ejemplo de audio completado');
    }
    
    /**
     * Crear controles de audio
     */
    createAudioControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        controls.innerHTML = `
            <h3>🎵 Controles de Audio</h3>
            <div>
                <label>Volumen Maestro: </label>
                <input type="range" min="0" max="1" step="0.1" value="1" id="masterVolume">
            </div>
            <div>
                <label>Volumen Música: </label>
                <input type="range" min="0" max="1" step="0.1" value="0.7" id="musicVolume">
            </div>
            <div>
                <label>Volumen Efectos: </label>
                <input type="range" min="0" max="1" step="0.1" value="0.8" id="sfxVolume">
            </div>
            <button onclick="examples.audio.setMuted(!examples.audio.getState().isMuted)">
                Mute/Unmute
            </button>
        `;
        
        document.body.appendChild(controls);
        
        // Event listeners
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.audio.setMasterVolume(parseFloat(e.target.value));
        });
        
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.audio.setMusicVolume(parseFloat(e.target.value));
        });
        
        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.audio.setSFXVolume(parseFloat(e.target.value));
        });
    }
    
    /**
     * Crear visualización de audio
     */
    createAudioVisualization() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
        `;
        
        container.innerHTML = '<h3>📊 Visualización de Audio</h3>';
        document.body.appendChild(container);
        
        this.audio.createAudioVisualization(container);
    }
    
    /**
     * Ejemplo de partículas
     */
    async particlesExample() {
        console.log('🎬 Ejecutando ejemplo de partículas...');
        
        // Crear emisores de partículas
        const emitters = [
            this.particles.createParticleEmitter({
                position: { x: 0, y: 5, z: 0 },
                count: 200,
                life: 3.0,
                size: { min: 0.1, max: 0.5 },
                velocity: {
                    x: { min: -2, max: 2 },
                    y: { min: 1, max: 3 },
                    z: { min: -2, max: 2 }
                },
                color: { start: 0xff6600, end: 0x000000 },
                emissionRate: 20
            }),
            
            this.particles.createParticleEmitter({
                position: { x: 5, y: 2, z: 5 },
                geometry: 'sphere',
                count: 100,
                life: 2.0,
                size: { min: 0.05, max: 0.2 },
                velocity: {
                    x: { min: -1, max: 1 },
                    y: { min: 0, max: 2 },
                    z: { min: -1, max: 1 }
                },
                color: { start: 0x00ffff, end: 0x0000ff },
                emissionRate: 10
            }),
            
            this.particles.createParticleEmitter({
                position: { x: -5, y: 3, z: -5 },
                geometry: 'star',
                count: 50,
                life: 4.0,
                size: { min: 0.1, max: 0.3 },
                velocity: {
                    x: { min: -0.5, max: 0.5 },
                    y: { min: -0.5, max: 0.5 },
                    z: { min: -0.5, max: 0.5 }
                },
                color: { start: 0xffff00, end: 0xff0000 },
                emissionRate: 5
            })
        ];
        
        // Reproducir efectos
        this.particles.playEffect('explosion', { x: 0, y: 10, z: 0 });
        this.particles.playEffect('fire', { x: 3, y: 1, z: 3 });
        this.particles.playEffect('smoke', { x: -3, y: 1, z: -3 });
        this.particles.playEffect('magic', { x: 0, y: 8, z: 5 });
        this.particles.playEffect('fluid', { x: 0, y: 0, z: 0 });
        
        console.log('✅ Ejemplo de partículas completado');
    }
    
    /**
     * Ejemplo de shaders
     */
    async shadersExample() {
        console.log('🎬 Ejecutando ejemplo de shaders...');
        
        // Crear materiales con shaders personalizados
        const materials = [
            this.shaders.createMaterial('water', {
                waveHeight: 0.2,
                waveFrequency: 15.0,
                waveSpeed: 2.0,
                waterColor: new THREE.Color(0x0066cc),
                transparency: 0.8
            }),
            
            this.shaders.createMaterial('fire', {
                intensity: 1.5,
                fireColor: new THREE.Color(0xff4400),
                smokeAmount: 0.4
            }),
            
            this.shaders.createMaterial('crystal', {
                crystalColor: new THREE.Color(0x88ccff),
                transparency: 0.9,
                reflection: 0.8
            }),
            
            this.shaders.createMaterial('metal', {
                metalColor: new THREE.Color(0x888888),
                roughness: 0.3,
                metallic: 1.0
            }),
            
            this.shaders.createMaterial('hologram', {
                hologramColor: new THREE.Color(0x00ffff),
                transparency: 0.7,
                flicker: 0.2
            })
        ];
        
        // Crear objetos con shaders
        const geometries = [
            new THREE.PlaneGeometry(10, 10),
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.CylinderGeometry(1, 1, 2, 8),
            new THREE.TorusGeometry(1, 0.3, 8, 16)
        ];
        
        geometries.forEach((geometry, index) => {
            const material = materials[index];
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                (index - 2) * 4,
                2,
                5
            );
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.scene.add(mesh);
        });
        
        // Crear post-procesamiento
        this.createPostProcessing();
        
        console.log('✅ Ejemplo de shaders completado');
    }
    
    /**
     * Crear post-procesamiento
     */
    createPostProcessing() {
        // Configurar bloom
        const bloomPass = this.core.composer.passes.find(pass => 
            pass.constructor.name === 'UnrealBloomPass'
        );
        if (bloomPass) {
            bloomPass.strength = 1.5;
            bloomPass.radius = 0.4;
            bloomPass.threshold = 0.8;
        }
        
        // Configurar SSAO
        const ssaoPass = this.core.composer.passes.find(pass => 
            pass.constructor.name === 'SSAOPass'
        );
        if (ssaoPass) {
            ssaoPass.kernelRadius = 16;
            ssaoPass.minDistance = 0.005;
            ssaoPass.maxDistance = 0.1;
        }
        
        // Configurar DOF
        const dofPass = this.core.composer.passes.find(pass => 
            pass.constructor.name === 'BokehPass'
        );
        if (dofPass) {
            dofPass.focus = 1.0;
            dofPass.aperture = 0.025;
            dofPass.maxblur = 0.01;
        }
    }
    
    /**
     * Ejemplo de VR
     */
    async vrExample() {
        console.log('🎬 Ejecutando ejemplo de VR...');
        
        if (!this.vr.states.isVRSupported) {
            console.warn('⚠️ VR no soportado en este dispositivo');
            return;
        }
        
        // Crear objetos interactivos para VR
        const interactiveObjects = [
            this.createInteractiveCube({ x: 0, y: 1.5, z: -2 }),
            this.createInteractiveSphere({ x: 2, y: 1.5, z: -2 }),
            this.createInteractiveCylinder({ x: -2, y: 1.5, z: -2 })
        ];
        
        // Crear controles VR
        this.createVRControls();
        
        // Iniciar sesión VR
        const vrStarted = await this.vr.startVRSession();
        
        if (vrStarted) {
            console.log('🥽 Sesión VR iniciada');
            console.log('🎮 Usa los controladores para interactuar');
        }
        
        console.log('✅ Ejemplo de VR completado');
    }
    
    /**
     * Crear objeto interactivo
     */
    createInteractiveCube(position) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(position);
        cube.userData.interactive = true;
        cube.userData.type = 'cube';
        
        this.scene.add(cube);
        return cube;
    }
    
    /**
     * Crear esfera interactiva
     */
    createInteractiveSphere(position) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        sphere.userData.interactive = true;
        sphere.userData.type = 'sphere';
        
        this.scene.add(sphere);
        return sphere;
    }
    
    /**
     * Crear cilindro interactivo
     */
    createInteractiveCylinder(position) {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x0000ff,
            transparent: true,
            opacity: 0.8
        });
        
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.copy(position);
        cylinder.userData.interactive = true;
        cylinder.userData.type = 'cylinder';
        
        this.scene.add(cylinder);
        return cylinder;
    }
    
    /**
     * Crear controles VR
     */
    createVRControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        controls.innerHTML = `
            <h3>🥽 Controles VR</h3>
            <button onclick="examples.vr.startVRSession()">Iniciar VR</button>
            <button onclick="examples.vr.stopVRSession()">Detener VR</button>
            <div>
                <label>Feedback Háptico: </label>
                <button onclick="examples.vr.activateHapticFeedback('left_controller', 100, 1.0, 1.0)">
                    Izquierdo
                </button>
                <button onclick="examples.vr.activateHapticFeedback('right_controller', 100, 1.0, 1.0)">
                    Derecho
                </button>
            </div>
        `;
        
        document.body.appendChild(controls);
    }
    
    /**
     * Ejemplo de IA
     */
    async aiExample() {
        console.log('🎬 Ejecutando ejemplo de IA...');
        
        // Crear NPCs inteligentes
        const npcs = [
            this.ai.createNPC({
                name: 'Comerciante Crypto',
                position: { x: 10, y: 0, z: 10 },
                behavior: 'merchant',
                personality: 'friendly',
                dialogue: 'greeting'
            }),
            
            this.ai.createNPC({
                name: 'Guardia Blockchain',
                position: { x: -10, y: 0, z: -10 },
                behavior: 'guard',
                personality: 'neutral',
                dialogue: 'greeting'
            }),
            
            this.ai.createNPC({
                name: 'Minero DeFi',
                position: { x: 0, y: 0, z: 20 },
                behavior: 'wanderer',
                personality: 'curious',
                dialogue: 'greeting'
            })
        ];
        
        // Crear agentes de IA
        const agents = [
            this.ai.createAgent({
                type: 'trader',
                position: { x: 5, y: 0, z: 5 },
                sensors: [
                    { name: 'market_data', type: 'vision', range: 10 },
                    { name: 'price_feed', type: 'hearing', range: 5 }
                ],
                actuators: [
                    { name: 'buy', type: 'action' },
                    { name: 'sell', type: 'action' },
                    { name: 'move', type: 'movement' }
                ]
            }),
            
            this.ai.createAgent({
                type: 'security',
                position: { x: -5, y: 0, z: -5 },
                sensors: [
                    { name: 'threat_detection', type: 'vision', range: 15 },
                    { name: 'audit_logs', type: 'hearing', range: 8 }
                ],
                actuators: [
                    { name: 'alert', type: 'action' },
                    { name: 'block', type: 'action' },
                    { name: 'patrol', type: 'movement' }
                ]
            })
        ];
        
        // Crear controles de IA
        this.createAIControls();
        
        console.log('✅ Ejemplo de IA completado');
    }
    
    /**
     * Crear controles de IA
     */
    createAIControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        
        controls.innerHTML = `
            <h3>🤖 Controles de IA</h3>
            <div>
                <strong>NPCs Activos:</strong> <span id="npcCount">0</span>
            </div>
            <div>
                <strong>Agentes Activos:</strong> <span id="agentCount">0</span>
            </div>
            <div>
                <strong>Comportamientos:</strong> <span id="behaviorCount">0</span>
            </div>
            <button onclick="examples.ai.states.isLearning = !examples.ai.states.isLearning">
                Toggle Aprendizaje
            </button>
            <button onclick="examples.ai.states.isGenerating = !examples.ai.states.isGenerating">
                Toggle Generación
            </button>
        `;
        
        document.body.appendChild(controls);
        
        // Actualizar métricas
        setInterval(() => {
            const metrics = this.ai.getMetrics();
            document.getElementById('npcCount').textContent = metrics.activeNPCs;
            document.getElementById('agentCount').textContent = metrics.activeAgents;
            document.getElementById('behaviorCount').textContent = metrics.activeBehaviors;
        }, 1000);
    }
    
    /**
     * Ejemplo completo integrado
     */
    async completeExample() {
        console.log('🎬 Ejecutando ejemplo completo integrado...');
        
        // Crear escena completa
        await this.createCompleteScene();
        
        // Integrar todos los sistemas
        await this.integrateAllSystems();
        
        // Crear interfaz de control
        this.createCompleteInterface();
        
        // Iniciar loop de renderizado
        this.startCompleteLoop();
        
        console.log('✅ Ejemplo completo integrado ejecutándose');
        console.log('🎮 Usa la interfaz para controlar todos los sistemas');
    }
    
    /**
     * Crear escena completa
     */
    async createCompleteScene() {
        // Crear terreno procedural
        const terrain = this.ai.systems.procedural.generators.get('terrain').generate(50, 50, 12345);
        
        // Crear edificios procedurales
        for (let i = 0; i < 10; i++) {
            const building = this.ai.systems.procedural.generators.get('building').generate(
                'skyscraper',
                { x: 10, y: 20, z: 10 },
                Math.random() * 1000
            );
            
            // Crear mesh del edificio
            const geometry = new THREE.BoxGeometry(building.size.x, building.size.y, building.size.z);
            const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                (i - 5) * 20,
                building.size.y / 2,
                (i % 2) * 20
            );
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.scene.add(mesh);
        }
        
        // Crear elementos de agua
        const waterGeometry = new THREE.PlaneGeometry(100, 100);
        const waterMaterial = this.shaders.createMaterial('water', {
            waveHeight: 0.3,
            waveFrequency: 20.0,
            waveSpeed: 1.5
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -2;
        this.scene.add(water);
        
        // Crear elementos de fuego
        const fireGeometry = new THREE.ConeGeometry(2, 4, 8);
        const fireMaterial = this.shaders.createMaterial('fire', {
            intensity: 2.0
        });
        
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(15, 2, 15);
        this.scene.add(fire);
        
        // Crear elementos de cristal
        const crystalGeometry = new THREE.OctahedronGeometry(2);
        const crystalMaterial = this.shaders.createMaterial('crystal', {
            transparency: 0.9
        });
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(-15, 2, -15);
        this.scene.add(crystal);
    }
    
    /**
     * Integrar todos los sistemas
     */
    async integrateAllSystems() {
        // Integrar física con partículas
        this.physics.bodies.forEach((body, id) => {
            if (body.mass > 0) {
                // Crear partículas cuando los objetos colisionan
                this.physics.world.addEventListener('collide', (event) => {
                    if (event.body === body) {
                        this.particles.playEffect('explosion', {
                            x: event.contact.bi.position.x,
                            y: event.contact.bi.position.y,
                            z: event.contact.bi.position.z
                        });
                        
                        this.audio.playEffect('impact');
                    }
                });
            }
        });
        
        // Integrar IA con audio
        this.ai.npcs.forEach(npc => {
            // Reproducir sonidos basados en el comportamiento
            if (npc.behavior === 'merchant') {
                this.audio.playAmbient('market');
            } else if (npc.behavior === 'guard') {
                this.audio.playAmbient('city');
            }
        });
        
        // Integrar shaders con partículas
        this.particles.emitters.forEach(emitter => {
            // Aplicar shaders a las partículas
            if (emitter.options.color.start === 0xff6600) {
                emitter.material = this.shaders.createMaterial('fire', {
                    intensity: 1.5
                });
            }
        });
        
        // Integrar VR con IA
        if (this.vr.states.isVRSupported) {
            this.vr.controllers.forEach(controller => {
                // Permitir interacción con NPCs
                controller.mesh.addEventListener('click', () => {
                    const nearbyNPCs = this.findNearbyNPCs(controller.mesh.position);
                    if (nearbyNPCs.length > 0) {
                        this.startDialogue(nearbyNPCs[0]);
                    }
                });
            });
        }
    }
    
    /**
     * Encontrar NPCs cercanos
     */
    findNearbyNPCs(position, range = 5) {
        const nearby = [];
        this.ai.npcs.forEach(npc => {
            const distance = this.distance(position, npc.position);
            if (distance <= range) {
                nearby.push(npc);
            }
        });
        return nearby;
    }
    
    /**
     * Iniciar diálogo
     */
    startDialogue(npc) {
        this.ai.startDialogue(npc, { x: 0, y: 0, z: 0 }); // Posición del jugador
    }
    
    /**
     * Crear interfaz completa
     */
    createCompleteInterface() {
        const interface = document.createElement('div');
        interface.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            padding: 30px;
            border-radius: 15px;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            z-index: 1000;
        `;
        
        interface.innerHTML = `
            <h1>🎮 Metaverso Crypto World Virtual 3D</h1>
            <h2>Sistema Completo Integrado</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                <button onclick="examples.examples.physics()" style="padding: 15px; background: #ff4444; border: none; border-radius: 10px; color: white; cursor: pointer;">
                    🎯 Física
                </button>
                <button onclick="examples.examples.audio()" style="padding: 15px; background: #44ff44; border: none; border-radius: 10px; color: white; cursor: pointer;">
                    🎵 Audio
                </button>
                <button onclick="examples.examples.particles()" style="padding: 15px; background: #4444ff; border: none; border-radius: 10px; color: white; cursor: pointer;">
                    ✨ Partículas
                </button>
                <button onclick="examples.examples.shaders()" style="padding: 15px; background: #ff44ff; border: none; border-radius: 10px; color: white; cursor: pointer;">
                    🎨 Shaders
                </button>
                <button onclick="examples.examples.vr()" style="padding: 15px; background: #ffff44; border: none; border-radius: 10px; color: white; cursor: pointer;">
                    🥽 VR
                </button>
                <button onclick="examples.examples.ai()" style="padding: 15px; background: #44ffff; border: none; border-radius: 10px; color: white; cursor: pointer;">
                    🤖 IA
                </button>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>📊 Métricas del Sistema</h3>
                <div id="metrics" style="font-size: 12px; text-align: left;">
                    Cargando métricas...
                </div>
            </div>
            
            <button onclick="this.parentElement.style.display='none'" style="padding: 10px 20px; background: #666; border: none; border-radius: 5px; color: white; cursor: pointer;">
                Cerrar
            </button>
        `;
        
        document.body.appendChild(interface);
        
        // Actualizar métricas
        setInterval(() => {
            this.updateCompleteMetrics();
        }, 1000);
    }
    
    /**
     * Actualizar métricas completas
     */
    updateCompleteMetrics() {
        const metrics = {
            physics: this.physics.getMetrics(),
            audio: this.audio.getMetrics(),
            particles: this.particles.getMetrics(),
            shaders: this.shaders.getMetrics(),
            vr: this.vr.getMetrics(),
            ai: this.ai.getMetrics()
        };
        
        const metricsElement = document.getElementById('metrics');
        if (metricsElement) {
            metricsElement.innerHTML = `
                <div><strong>Física:</strong> ${metrics.physics.bodiesCount} cuerpos, ${metrics.physics.fps.toFixed(1)} FPS</div>
                <div><strong>Audio:</strong> ${metrics.audio.activeSounds} sonidos, ${metrics.audio.fps.toFixed(1)} FPS</div>
                <div><strong>Partículas:</strong> ${metrics.particles.activeParticles} partículas, ${metrics.particles.fps.toFixed(1)} FPS</div>
                <div><strong>Shaders:</strong> ${metrics.shaders.activeShaders} shaders, ${metrics.shaders.memoryUsage} bytes</div>
                <div><strong>VR:</strong> ${metrics.vr.controllerCount} controladores, ${metrics.vr.fps.toFixed(1)} FPS</div>
                <div><strong>IA:</strong> ${metrics.ai.activeNPCs} NPCs, ${metrics.ai.activeAgents} agentes</div>
            `;
        }
    }
    
    /**
     * Iniciar loop completo
     */
    startCompleteLoop() {
        const animate = () => {
            // Actualizar todos los sistemas
            this.physics.update(this.core.deltaTime);
            this.audio.update(this.core.deltaTime);
            this.particles.update(this.core.deltaTime);
            this.shaders.update(this.core.deltaTime);
            this.vr.update(this.core.deltaTime);
            this.ai.update(this.core.deltaTime);
            
            // Renderizar
            this.core.render();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Función auxiliar para distancia
     */
    distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    }
    
    /**
     * Ejecutar ejemplo
     */
    async runExample(exampleName) {
        if (this.examples[exampleName]) {
            await this.examples[exampleName]();
        } else {
            console.error(`Ejemplo no encontrado: ${exampleName}`);
        }
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar todos los sistemas
        if (this.physics) this.physics.dispose();
        if (this.audio) this.audio.dispose();
        if (this.particles) this.particles.dispose();
        if (this.shaders) this.shaders.dispose();
        if (this.vr) this.vr.dispose();
        if (this.ai) this.ai.dispose();
        
        // Limpiar core
        if (this.core) this.core.dispose();
        
        console.log('🧹 Ejemplos limpiados');
    }
}

// Crear instancia global
window.examples = new ThreeJSExamples();

// Inicializar cuando se cargue la página
window.addEventListener('load', async () => {
    try {
        await window.examples.initialize();
        console.log('🚀 Ejemplos listos para usar');
        
        // Mostrar menú de ejemplos
        window.examples.createCompleteInterface();
        
    } catch (error) {
        console.error('❌ Error inicializando ejemplos:', error);
    }
});
</rewritten_file>