/**
 * Metaverso Three.js Scene Manager
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoThreeScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = null;
        this.isInitialized = false;
        this.isActive = false;
        
        // Scene objects
        this.objects = {
            islands: [],
            avatars: [],
            particles: [],
            lights: [],
            audio: []
        };
        
        // Camera settings
        this.cameraSettings = {
            fov: 75,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 10, z: 20 },
            target: { x: 0, y: 0, z: 0 }
        };
        
        // Renderer settings
        this.rendererSettings = {
            antialias: true,
            alpha: true,
            shadowMap: true,
            pixelRatio: window.devicePixelRatio
        };
        
        // Animation loop
        this.animationId = null;
        
        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Initialize Three.js scene
     */
    async initialize() {
        try {
            console.log('🎮 Inicializando escena Three.js...');
            
            // Create scene
            this.createScene();
            
            // Create camera
            this.createCamera();
            
            // Create renderer
            this.createRenderer();
            
            // Create controls
            this.createControls();
            
            // Setup lighting
            this.setupLighting();
            
            // Create initial environment
            this.createEnvironment();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start render loop
            this.startRenderLoop();
            
            this.isInitialized = true;
            console.log('✅ Escena Three.js inicializada');
            
        } catch (error) {
            console.error('❌ Error inicializando escena Three.js:', error);
            throw error;
        }
    }

    /**
     * Create scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        this.objects.lights.push(ambientLight);
    }

    /**
     * Create camera
     */
    createCamera() {
        const canvas = document.getElementById('three-canvas');
        const aspect = canvas.clientWidth / canvas.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(
            this.cameraSettings.fov,
            aspect,
            this.cameraSettings.near,
            this.cameraSettings.far
        );
        
        this.camera.position.set(
            this.cameraSettings.position.x,
            this.cameraSettings.position.y,
            this.cameraSettings.position.z
        );
        
        this.camera.lookAt(
            this.cameraSettings.target.x,
            this.cameraSettings.target.y,
            this.cameraSettings.target.z
        );
    }

    /**
     * Create renderer
     */
    createRenderer() {
        const canvas = document.getElementById('three-canvas');
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: this.rendererSettings.antialias,
            alpha: this.rendererSettings.alpha
        });
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(this.rendererSettings.pixelRatio);
        
        if (this.rendererSettings.shadowMap) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Enable post-processing
        this.setupPostProcessing();
    }

    /**
     * Create controls
     */
    createControls() {
        const canvas = document.getElementById('three-canvas');
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Custom controls for metaverso
        this.setupCustomControls();
    }

    /**
     * Setup lighting
     */
    setupLighting() {
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        this.objects.lights.push(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 50);
        pointLight1.position.set(20, 10, 20);
        this.scene.add(pointLight1);
        this.objects.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff6b35, 0.3, 30);
        pointLight2.position.set(-20, 5, -20);
        this.scene.add(pointLight2);
        this.objects.lights.push(pointLight2);
    }

    /**
     * Create environment
     */
    createEnvironment() {
        // Create ground
        this.createGround();
        
        // Create skybox
        this.createSkybox();
        
        // Create particle system
        this.createParticleSystem();
        
        // Create initial islands
        this.createInitialIslands();
    }

    /**
     * Create ground
     */
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    /**
     * Create skybox
     */
    createSkybox() {
        const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vWorldPosition;
                void main() {
                    vec3 worldPosition = normalize(vWorldPosition);
                    float intensity = pow(0.7 - dot(worldPosition, vec3(0, 0, 1.0)), 2.0);
                    vec3 color = mix(vec3(0.0, 0.2, 0.4), vec3(0.0, 0.8, 1.0), intensity);
                    color += 0.1 * sin(time + worldPosition.x * 10.0);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);
        
        // Animate skybox
        this.addAnimation(() => {
            skyboxMaterial.uniforms.time.value += 0.01;
        });
    }

    /**
     * Create particle system
     */
    createParticleSystem() {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            
            colors[i * 3] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 2] = 1.0;
            
            sizes[i] = Math.random() * 2 + 1;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `,
            transparent: true,
            vertexColors: true
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.objects.particles.push(particleSystem);
        
        // Animate particles
        this.addAnimation(() => {
            particleMaterial.uniforms.time.value += 0.01;
            particleSystem.rotation.y += 0.001;
        });
    }

    /**
     * Create initial islands
     */
    createInitialIslands() {
        const islandTypes = ['forest', 'ocean', 'mountain', 'desert', 'city'];
        const positions = [
            { x: -30, z: -30 },
            { x: 30, z: -30 },
            { x: 0, z: -50 },
            { x: -50, z: 0 },
            { x: 50, z: 0 }
        ];
        
        islandTypes.forEach((type, index) => {
            const position = positions[index];
            this.createIsland(type, position.x, position.z);
        });
    }

    /**
     * Create island
     */
    createIsland(type, x, z) {
        const island = new THREE.Group();
        
        // Base geometry
        const baseGeometry = new THREE.CylinderGeometry(8, 10, 2, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        base.castShadow = true;
        base.receiveShadow = true;
        island.add(base);
        
        // Island specific elements
        switch (type) {
            case 'forest':
                this.addForestElements(island);
                break;
            case 'ocean':
                this.addOceanElements(island);
                break;
            case 'mountain':
                this.addMountainElements(island);
                break;
            case 'desert':
                this.addDesertElements(island);
                break;
            case 'city':
                this.addCityElements(island);
                break;
        }
        
        island.position.set(x, 0, z);
        this.scene.add(island);
        this.objects.islands.push(island);
        
        // Add island data
        island.userData = {
            type: type,
            id: this.objects.islands.length - 1,
            currentUsers: 0,
            maxCapacity: 50
        };
        
        return island;
    }

    /**
     * Add forest elements
     */
    addForestElements(island) {
        // Trees
        for (let i = 0; i < 15; i++) {
            const tree = this.createTree();
            tree.position.set(
                (Math.random() - 0.5) * 12,
                0,
                (Math.random() - 0.5) * 12
            );
            island.add(tree);
        }
        
        // Ground texture
        const groundGeometry = new THREE.CircleGeometry(8, 8);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0.1;
        island.add(ground);
    }

    /**
     * Add ocean elements
     */
    addOceanElements(island) {
        // Water surface
        const waterGeometry = new THREE.CircleGeometry(8, 8);
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.1;
        island.add(water);
        
        // Waves
        for (let i = 0; i < 8; i++) {
            const wave = this.createWave();
            wave.position.set(
                (Math.random() - 0.5) * 12,
                0.2,
                (Math.random() - 0.5) * 12
            );
            island.add(wave);
        }
    }

    /**
     * Add mountain elements
     */
    addMountainElements(island) {
        // Mountain peaks
        for (let i = 0; i < 3; i++) {
            const peak = this.createMountainPeak();
            peak.position.set(
                (Math.random() - 0.5) * 8,
                0,
                (Math.random() - 0.5) * 8
            );
            island.add(peak);
        }
        
        // Snow
        const snowGeometry = new THREE.CircleGeometry(8, 8);
        const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.rotation.x = -Math.PI / 2;
        snow.position.y = 0.1;
        island.add(snow);
    }

    /**
     * Add desert elements
     */
    addDesertElements(island) {
        // Sand dunes
        for (let i = 0; i < 5; i++) {
            const dune = this.createSandDune();
            dune.position.set(
                (Math.random() - 0.5) * 10,
                0,
                (Math.random() - 0.5) * 10
            );
            island.add(dune);
        }
        
        // Cactus
        for (let i = 0; i < 8; i++) {
            const cactus = this.createCactus();
            cactus.position.set(
                (Math.random() - 0.5) * 12,
                0,
                (Math.random() - 0.5) * 12
            );
            island.add(cactus);
        }
    }

    /**
     * Add city elements
     */
    addCityElements(island) {
        // Buildings
        for (let i = 0; i < 12; i++) {
            const building = this.createBuilding();
            building.position.set(
                (Math.random() - 0.5) * 12,
                0,
                (Math.random() - 0.5) * 12
            );
            island.add(building);
        }
        
        // Roads
        const roadGeometry = new THREE.PlaneGeometry(12, 2);
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.1;
        island.add(road);
    }

    /**
     * Create tree
     */
    createTree() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 4;
        leaves.castShadow = true;
        tree.add(leaves);
        
        return tree;
    }

    /**
     * Create wave
     */
    createWave() {
        const waveGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const waveMaterial = new THREE.MeshLambertMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.6
        });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        
        // Animate wave
        this.addAnimation(() => {
            wave.position.y = 0.2 + Math.sin(Date.now() * 0.003) * 0.1;
            wave.scale.y = 1 + Math.sin(Date.now() * 0.002) * 0.2;
        });
        
        return wave;
    }

    /**
     * Create mountain peak
     */
    createMountainPeak() {
        const peakGeometry = new THREE.ConeGeometry(2, 6, 8);
        const peakMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const peak = new THREE.Mesh(peakGeometry, peakMaterial);
        peak.position.y = 3;
        peak.castShadow = true;
        return peak;
    }

    /**
     * Create sand dune
     */
    createSandDune() {
        const duneGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const duneMaterial = new THREE.MeshLambertMaterial({ color: 0xF4A460 });
        const dune = new THREE.Mesh(duneGeometry, duneMaterial);
        dune.position.y = 0.5;
        dune.scale.y = 0.5;
        return dune;
    }

    /**
     * Create cactus
     */
    createCactus() {
        const cactus = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2;
        cactus.add(body);
        
        // Arms
        for (let i = 0; i < 3; i++) {
            const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
            const arm = new THREE.Mesh(armGeometry, bodyMaterial);
            arm.position.y = 1.5 + i * 0.8;
            arm.position.x = (Math.random() - 0.5) * 0.5;
            arm.rotation.z = (Math.random() - 0.5) * 0.5;
            cactus.add(arm);
        }
        
        return cactus;
    }

    /**
     * Create building
     */
    createBuilding() {
        const height = Math.random() * 8 + 4;
        const buildingGeometry = new THREE.BoxGeometry(1.5, height, 1.5);
        const buildingMaterial = new THREE.MeshLambertMaterial({
            color: Math.random() > 0.5 ? 0x87CEEB : 0xD3D3D3
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Add windows
        for (let i = 0; i < Math.floor(height / 2); i++) {
            const windowGeometry = new THREE.PlaneGeometry(0.3, 0.3);
            const windowMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFF00,
                emissive: 0xFFFF00,
                emissiveIntensity: 0.2
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(0.76, i * 2 + 1, 0);
            building.add(window);
        }
        
        return building;
    }

    /**
     * Setup post processing
     */
    setupPostProcessing() {
        // This would include effects like bloom, vignette, etc.
        // For now, we'll keep it simple
    }

    /**
     * Setup custom controls
     */
    setupCustomControls() {
        // Add custom keyboard controls
        document.addEventListener('keydown', (event) => {
            const speed = 0.5;
            switch (event.code) {
                case 'KeyW':
                    this.camera.position.z -= speed;
                    break;
                case 'KeyS':
                    this.camera.position.z += speed;
                    break;
                case 'KeyA':
                    this.camera.position.x -= speed;
                    break;
                case 'KeyD':
                    this.camera.position.x += speed;
                    break;
                case 'KeyQ':
                    this.camera.position.y += speed;
                    break;
                case 'KeyE':
                    this.camera.position.y -= speed;
                    break;
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Mouse events
        const canvas = this.renderer.domElement;
        canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
    }

    /**
     * Start render loop
     */
    startRenderLoop() {
        this.clock = new THREE.Clock();
        
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            const delta = this.clock.getDelta();
            
            // Update controls
            if (this.controls) {
                this.controls.update();
            }
            
            // Run animations
            this.runAnimations(delta);
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    /**
     * Add animation
     */
    addAnimation(animation) {
        if (!this.animations) {
            this.animations = [];
        }
        this.animations.push(animation);
    }

    /**
     * Run animations
     */
    runAnimations(delta) {
        if (this.animations) {
            this.animations.forEach(animation => {
                animation(delta);
            });
        }
    }

    /**
     * Handle resize
     */
    handleResize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    /**
     * Handle click
     */
    handleClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.handleObjectClick(object);
        }
    }

    /**
     * Handle object click
     */
    handleObjectClick(object) {
        // Find the island this object belongs to
        let island = null;
        let current = object;
        
        while (current && !island) {
            if (current.userData && current.userData.type) {
                island = current;
            }
            current = current.parent;
        }
        
        if (island) {
            this.selectIsland(island);
        }
    }

    /**
     * Select island
     */
    selectIsland(island) {
        console.log('🏝️ Isla seleccionada:', island.userData);
        
        // Highlight island
        this.highlightIsland(island);
        
        // Emit event
        this.emit('islandSelected', island.userData);
    }

    /**
     * Highlight island
     */
    highlightIsland(island) {
        // Remove previous highlights
        this.objects.islands.forEach(island => {
            island.children.forEach(child => {
                if (child.material) {
                    child.material.emissive.setHex(0x000000);
                }
            });
        });
        
        // Add highlight to selected island
        island.children.forEach(child => {
            if (child.material) {
                child.material.emissive.setHex(0x00d4ff);
            }
        });
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(event) {
        // This could be used for hover effects
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    /**
     * Activate scene
     */
    activate() {
        this.isActive = true;
        const container = document.getElementById('scene-container');
        if (container) {
            container.classList.add('active');
        }
    }

    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
        const container = document.getElementById('scene-container');
        if (container) {
            container.classList.remove('active');
        }
    }

    /**
     * Dispose
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoThreeScene;
} 