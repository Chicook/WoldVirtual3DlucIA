/**
 * Sistema de Exploración de Islas Virtuales - Metaverso Crypto World Virtual 3D
 * @author Metaverso Team
 */

class MetaverseExplorationSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.audioManager = null;
        this.locationManager = null;
        this.player = null;
        this.islands = new Map();
        this.currentIsland = null;
        this.transitionInProgress = false;
        
        this.init();
    }

    init() {
        this.setupThreeJS();
        this.setupAudioSystem();
        this.setupLocationManager();
        this.createIslands();
        this.setupPlayer();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    /**
     * Configurar Three.js
     */
    setupThreeJS() {
        // Escena
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);

        // Cámara
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            2000
        );
        this.camera.position.set(0, 50, 100);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        document.body.appendChild(this.renderer.domElement);

        // Iluminación
        this.setupLighting();
    }

    /**
     * Configurar iluminación
     */
    setupLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direccional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz puntual para efectos
        const pointLight = new THREE.PointLight(0xffaa00, 1, 200);
        pointLight.position.set(0, 30, 0);
        this.scene.add(pointLight);
    }

    /**
     * Configurar sistema de audio
     */
    setupAudioSystem() {
        this.audioManager = {
            context: null,
            masterGain: null,
            ambientGain: null,
            spatialGain: null,
            sounds: new Map(),
            
            init() {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.context.createGain();
                this.ambientGain = this.context.createGain();
                this.spatialGain = this.context.createGain();
                
                this.masterGain.connect(this.context.destination);
                this.ambientGain.connect(this.masterGain);
                this.spatialGain.connect(this.masterGain);
                
                this.masterGain.gain.value = 0.7;
                this.ambientGain.gain.value = 0.5;
                this.spatialGain.gain.value = 0.6;
            },

            generateAmbientSound(locationType, intensity = 0.5) {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                const filter = this.context.createBiquadFilter();
                
                // Configurar según tipo de ubicación
                const config = this.getLocationAudioConfig(locationType);
                oscillator.frequency.value = config.frequency;
                oscillator.type = config.waveform;
                gainNode.gain.value = intensity * config.volume;
                filter.frequency.value = config.filterFreq;
                filter.Q.value = config.resonance;
                
                // Conexiones
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.ambientGain);
                
                // Modulación para sonidos más naturales
                const lfo = this.context.createOscillator();
                const lfoGain = this.context.createGain();
                lfo.frequency.value = config.modulationFreq;
                lfoGain.gain.value = config.modulationDepth;
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                
                oscillator.start();
                lfo.start();
                
                return { oscillator, gainNode, lfo };
            },

            getLocationAudioConfig(locationType) {
                const configs = {
                    forest: {
                        frequency: 180,
                        waveform: 'sine',
                        volume: 0.6,
                        filterFreq: 2000,
                        resonance: 0.5,
                        modulationFreq: 0.1,
                        modulationDepth: 20
                    },
                    ocean: {
                        frequency: 60,
                        waveform: 'sine',
                        volume: 0.8,
                        filterFreq: 800,
                        resonance: 0.3,
                        modulationFreq: 0.05,
                        modulationDepth: 15
                    },
                    mountain: {
                        frequency: 120,
                        waveform: 'sine',
                        volume: 0.7,
                        filterFreq: 3000,
                        resonance: 0.7,
                        modulationFreq: 0.08,
                        modulationDepth: 25
                    },
                    desert: {
                        frequency: 90,
                        waveform: 'sawtooth',
                        volume: 0.5,
                        filterFreq: 1500,
                        resonance: 0.4,
                        modulationFreq: 0.12,
                        modulationDepth: 30
                    },
                    city: {
                        frequency: 440,
                        waveform: 'square',
                        volume: 0.8,
                        filterFreq: 4000,
                        resonance: 0.8,
                        modulationFreq: 0.15,
                        modulationDepth: 50
                    }
                };
                
                return configs[locationType] || configs.forest;
            },

            stopAllSounds() {
                this.sounds.forEach(sound => {
                    if (sound.oscillator) sound.oscillator.stop();
                    if (sound.lfo) sound.lfo.stop();
                });
                this.sounds.clear();
            }
        };
        
        this.audioManager.init();
    }

    /**
     * Configurar gestor de ubicaciones
     */
    setupLocationManager() {
        this.locationManager = {
            currentLocation: null,
            transitionDuration: 3.0,
            transitionProgress: 0,
            
            changeLocation(newLocation, duration = 3.0) {
                if (this.currentLocation === newLocation) return;
                
                this.transitionDuration = duration;
                this.transitionProgress = 0;
                
                // Fade out ubicación actual
                if (this.currentLocation) {
                    this.fadeOutLocation(this.currentLocation);
                }
                
                // Fade in nueva ubicación
                setTimeout(() => {
                    this.fadeInLocation(newLocation);
                    this.currentLocation = newLocation;
                }, duration * 500);
            },
            
            fadeInLocation(locationType) {
                const sound = this.audioManager.generateAmbientSound(locationType, 0);
                this.audioManager.sounds.set(locationType, sound);
                
                // Fade in gradual
                const gainNode = sound.gainNode;
                gainNode.gain.setValueAtTime(0, this.audioManager.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    0.5, 
                    this.audioManager.context.currentTime + this.transitionDuration
                );
            },
            
            fadeOutLocation(locationType) {
                const sound = this.audioManager.sounds.get(locationType);
                if (sound) {
                    const gainNode = sound.gainNode;
                    gainNode.gain.linearRampToValueAtTime(
                        0, 
                        this.audioManager.context.currentTime + this.transitionDuration
                    );
                    
                    setTimeout(() => {
                        if (sound.oscillator) sound.oscillator.stop();
                        if (sound.lfo) sound.lfo.stop();
                        this.audioManager.sounds.delete(locationType);
                    }, this.transitionDuration * 1000);
                }
            }
        };
    }

    /**
     * Crear islas virtuales
     */
    createIslands() {
        // Isla del Bosque Mágico
        this.createForestIsland();
        
        // Isla del Océano Profundo
        this.createOceanIsland();
        
        // Isla de las Montañas Nevadas
        this.createMountainIsland();
        
        // Isla del Desierto Místico
        this.createDesertIsland();
        
        // Isla de la Ciudad Futurista
        this.createCityIsland();
    }

    /**
     * Crear Isla del Bosque Mágico
     */
    createForestIsland() {
        const island = new THREE.Group();
        
        // Terreno base
        const terrainGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2d5016,
            transparent: true,
            opacity: 0.8
        });
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        island.add(terrain);
        
        // Árboles
        for (let i = 0; i < 50; i++) {
            const tree = this.createTree();
            tree.position.set(
                (Math.random() - 0.5) * 180,
                0,
                (Math.random() - 0.5) * 180
            );
            tree.rotation.y = Math.random() * Math.PI * 2;
            island.add(tree);
        }
        
        // Partículas mágicas
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = Math.random() * 50;
            positions[i + 2] = (Math.random() - 0.5) * 200;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff88,
            size: 2,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        island.add(particles);
        
        island.position.set(0, 0, 0);
        this.scene.add(island);
        this.islands.set('forest', island);
    }

    /**
     * Crear árbol
     */
    createTree() {
        const tree = new THREE.Group();
        
        // Tronco
        const trunkGeometry = new THREE.CylinderGeometry(2, 3, 15);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 7.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Copa
        const leavesGeometry = new THREE.SphereGeometry(8, 8, 8);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 20;
        leaves.castShadow = true;
        tree.add(leaves);
        
        return tree;
    }

    /**
     * Crear Isla del Océano Profundo
     */
    createOceanIsland() {
        const island = new THREE.Group();
        
        // Agua
        const waterGeometry = new THREE.PlaneGeometry(300, 300, 100, 100);
        const waterMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x006994,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -5;
        island.add(water);
        
        // Olas animadas
        const waveGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
        const waveMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0099cc,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        const waves = new THREE.Mesh(waveGeometry, waveMaterial);
        waves.rotation.x = -Math.PI / 2;
        waves.position.y = -4;
        island.add(waves);
        
        // Islas pequeñas
        for (let i = 0; i < 5; i++) {
            const smallIsland = this.createSmallIsland();
            smallIsland.position.set(
                (Math.random() - 0.5) * 250,
                -2,
                (Math.random() - 0.5) * 250
            );
            island.add(smallIsland);
        }
        
        island.position.set(400, 0, 0);
        this.scene.add(island);
        this.islands.set('ocean', island);
    }

    /**
     * Crear isla pequeña
     */
    createSmallIsland() {
        const island = new THREE.Group();
        
        const geometry = new THREE.ConeGeometry(10, 8, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 4;
        mesh.castShadow = true;
        island.add(mesh);
        
        return island;
    }

    /**
     * Crear Isla de las Montañas Nevadas
     */
    createMountainIsland() {
        const island = new THREE.Group();
        
        // Terreno montañoso
        const mountainGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.rotation.x = -Math.PI / 2;
        mountain.receiveShadow = true;
        island.add(mountain);
        
        // Picos nevados
        for (let i = 0; i < 8; i++) {
            const peak = this.createMountainPeak();
            peak.position.set(
                (Math.random() - 0.5) * 150,
                0,
                (Math.random() - 0.5) * 150
            );
            peak.rotation.y = Math.random() * Math.PI * 2;
            island.add(peak);
        }
        
        // Nieve
        const snowGeometry = new THREE.SphereGeometry(1, 4, 4);
        const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        for (let i = 0; i < 200; i++) {
            const snowflake = new THREE.Mesh(snowGeometry, snowMaterial);
            snowflake.position.set(
                (Math.random() - 0.5) * 200,
                Math.random() * 100,
                (Math.random() - 0.5) * 200
            );
            snowflake.scale.setScalar(Math.random() * 0.5 + 0.5);
            island.add(snowflake);
        }
        
        island.position.set(-400, 0, 200);
        this.scene.add(island);
        this.islands.set('mountain', island);
    }

    /**
     * Crear pico de montaña
     */
    createMountainPeak() {
        const peak = new THREE.Group();
        
        const geometry = new THREE.ConeGeometry(15, 60, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 30;
        mesh.castShadow = true;
        peak.add(mesh);
        
        return peak;
    }

    /**
     * Crear Isla del Desierto Místico
     */
    createDesertIsland() {
        const island = new THREE.Group();
        
        // Arena
        const sandGeometry = new THREE.PlaneGeometry(250, 250, 50, 50);
        const sandMaterial = new THREE.MeshLambertMaterial({ color: 0xf4a460 });
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        sand.rotation.x = -Math.PI / 2;
        sand.receiveShadow = true;
        island.add(sand);
        
        // Dunas
        for (let i = 0; i < 20; i++) {
            const dune = this.createSandDune();
            dune.position.set(
                (Math.random() - 0.5) * 200,
                0,
                (Math.random() - 0.5) * 200
            );
            dune.rotation.y = Math.random() * Math.PI * 2;
            island.add(dune);
        }
        
        // Oasis
        const oasisGeometry = new THREE.CircleGeometry(15, 32);
        const oasisMaterial = new THREE.MeshLambertMaterial({ color: 0x006994 });
        const oasis = new THREE.Mesh(oasisGeometry, oasisMaterial);
        oasis.rotation.x = -Math.PI / 2;
        oasis.position.y = 0.1;
        island.add(oasis);
        
        // Palmeras
        for (let i = 0; i < 8; i++) {
            const palm = this.createPalmTree();
            const angle = (i / 8) * Math.PI * 2;
            palm.position.set(
                Math.cos(angle) * 20,
                0,
                Math.sin(angle) * 20
            );
            palm.rotation.y = angle;
            island.add(palm);
        }
        
        island.position.set(0, 0, 400);
        this.scene.add(island);
        this.islands.set('desert', island);
    }

    /**
     * Crear duna de arena
     */
    createSandDune() {
        const dune = new THREE.Group();
        
        const geometry = new THREE.ConeGeometry(8, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0xdaa520 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 6;
        mesh.castShadow = true;
        dune.add(mesh);
        
        return dune;
    }

    /**
     * Crear palmera
     */
    createPalmTree() {
        const palm = new THREE.Group();
        
        // Tronco
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 12);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6;
        trunk.castShadow = true;
        palm.add(trunk);
        
        // Hojas
        for (let i = 0; i < 6; i++) {
            const leafGeometry = new THREE.PlaneGeometry(8, 2);
            const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * 3,
                12,
                Math.sin(angle) * 3
            );
            leaf.rotation.y = angle;
            leaf.rotation.z = Math.PI / 4;
            leaf.castShadow = true;
            palm.add(leaf);
        }
        
        return palm;
    }

    /**
     * Crear Isla de la Ciudad Futurista
     */
    createCityIsland() {
        const island = new THREE.Group();
        
        // Base de la ciudad
        const baseGeometry = new THREE.PlaneGeometry(300, 300);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2;
        base.receiveShadow = true;
        island.add(base);
        
        // Rascacielos
        for (let i = 0; i < 25; i++) {
            const building = this.createSkyscraper();
            building.position.set(
                (Math.random() - 0.5) * 250,
                0,
                (Math.random() - 0.5) * 250
            );
            building.rotation.y = Math.random() * Math.PI * 2;
            island.add(building);
        }
        
        // Luces de la ciudad
        for (let i = 0; i < 100; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.5, 4, 4);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xffff00 : 0xff0000 
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                (Math.random() - 0.5) * 250,
                Math.random() * 100,
                (Math.random() - 0.5) * 250
            );
            island.add(light);
        }
        
        island.position.set(400, 0, -400);
        this.scene.add(island);
        this.islands.set('city', island);
    }

    /**
     * Crear rascacielos
     */
    createSkyscraper() {
        const building = new THREE.Group();
        
        const height = Math.random() * 80 + 20;
        const geometry = new THREE.BoxGeometry(8, height, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color: Math.random() > 0.5 ? 0x666666 : 0x999999 
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = height / 2;
        mesh.castShadow = true;
        building.add(mesh);
        
        // Ventanas
        for (let y = 5; y < height - 5; y += 8) {
            for (let x = -3; x <= 3; x += 6) {
                for (let z = -3; z <= 3; z += 6) {
                    if (Math.random() > 0.3) {
                        const windowGeometry = new THREE.PlaneGeometry(1, 1);
                        const windowMaterial = new THREE.MeshBasicMaterial({ 
                            color: Math.random() > 0.5 ? 0xffff00 : 0xffffff 
                        });
                        const window = new THREE.Mesh(windowGeometry, windowMaterial);
                        window.position.set(x, y, z + 4.1);
                        building.add(window);
                    }
                }
            }
        }
        
        return building;
    }

    /**
     * Configurar jugador
     */
    setupPlayer() {
        this.player = {
            position: new THREE.Vector3(0, 50, 100),
            velocity: new THREE.Vector3(),
            speed: 0.5,
            rotationSpeed: 0.02,
            
            update(deltaTime) {
                // Actualizar posición
                this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
                
                // Límites del mundo
                this.position.x = Math.max(-800, Math.min(800, this.position.x));
                this.position.z = Math.max(-800, Math.min(800, this.position.z));
                this.position.y = Math.max(10, Math.min(200, this.position.y));
            }
        };
        
        // Actualizar cámara
        this.camera.position.copy(this.player.position);
    }

    /**
     * Configurar controles
     */
    setupControls() {
        this.controls = {
            keys: {},
            
            onKeyDown(event) {
                this.keys[event.code] = true;
            },
            
            onKeyUp(event) {
                this.keys[event.code] = false;
            },
            
            update() {
                const speed = this.player.speed;
                this.player.velocity.set(0, 0, 0);
                
                if (this.keys['KeyW']) this.player.velocity.z -= speed;
                if (this.keys['KeyS']) this.player.velocity.z += speed;
                if (this.keys['KeyA']) this.player.velocity.x -= speed;
                if (this.keys['KeyD']) this.player.velocity.x += speed;
                if (this.keys['Space']) this.player.velocity.y += speed;
                if (this.keys['ShiftLeft']) this.player.velocity.y -= speed;
                
                // Actualizar cámara
                this.camera.position.copy(this.player.position);
            }
        };
        
        // Vincular controles
        this.controls.player = this.player;
        this.controls.camera = this.camera;
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.controls.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.controls.onKeyUp(e));
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Detectar isla actual
     */
    detectCurrentIsland() {
        const playerPos = this.player.position;
        let closestIsland = null;
        let closestDistance = Infinity;
        
        this.islands.forEach((island, type) => {
            const islandPos = island.position;
            const distance = playerPos.distanceTo(islandPos);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIsland = type;
            }
        });
        
        // Cambiar ubicación si es necesario
        if (closestIsland && closestIsland !== this.currentIsland) {
            this.changeIsland(closestIsland);
        }
    }

    /**
     * Cambiar isla
     */
    changeIsland(islandType) {
        if (this.transitionInProgress) return;
        
        this.transitionInProgress = true;
        this.currentIsland = islandType;
        
        // Cambiar audio
        this.locationManager.changeLocation(islandType);
        
        // Efectos visuales de transición
        this.createTransitionEffect();
        
        setTimeout(() => {
            this.transitionInProgress = false;
        }, 3000);
    }

    /**
     * Crear efecto de transición
     */
    createTransitionEffect() {
        // Partículas de transición
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 3,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.position.copy(this.player.position);
        this.scene.add(particles);
        
        // Animar partículas
        const animateParticles = () => {
            particles.rotation.y += 0.01;
            particles.material.opacity -= 0.01;
            
            if (particles.material.opacity > 0) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particles);
            }
        };
        
        animateParticles();
    }

    /**
     * Bucle de animación
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 16; // Aproximadamente 60 FPS
        
        // Actualizar jugador
        this.player.update(deltaTime);
        
        // Actualizar controles
        this.controls.update();
        
        // Detectar isla actual
        this.detectCurrentIsland();
        
        // Animar islas
        this.animateIslands(deltaTime);
        
        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Animar islas
     */
    animateIslands(deltaTime) {
        this.islands.forEach((island, type) => {
            // Rotación lenta
            island.rotation.y += 0.001;
            
            // Animaciones específicas por tipo
            switch (type) {
                case 'forest':
                    this.animateForestIsland(island, deltaTime);
                    break;
                case 'ocean':
                    this.animateOceanIsland(island, deltaTime);
                    break;
                case 'mountain':
                    this.animateMountainIsland(island, deltaTime);
                    break;
                case 'desert':
                    this.animateDesertIsland(island, deltaTime);
                    break;
                case 'city':
                    this.animateCityIsland(island, deltaTime);
                    break;
            }
        });
    }

    /**
     * Animar isla del bosque
     */
    animateForestIsland(island, deltaTime) {
        // Animar partículas mágicas
        island.children.forEach(child => {
            if (child instanceof THREE.Points) {
                child.rotation.y += 0.005;
                child.material.opacity = 0.4 + Math.sin(Date.now() * 0.001) * 0.2;
            }
        });
    }

    /**
     * Animar isla del océano
     */
    animateOceanIsland(island, deltaTime) {
        // Animar olas
        island.children.forEach(child => {
            if (child.material && child.material.wireframe) {
                child.position.y = -4 + Math.sin(Date.now() * 0.002) * 0.5;
            }
        });
    }

    /**
     * Animar isla de montañas
     */
    animateMountainIsland(island, deltaTime) {
        // Animar copos de nieve
        island.children.forEach(child => {
            if (child.material && child.material.color.getHex() === 0xffffff) {
                child.position.y += Math.sin(Date.now() * 0.001 + child.position.x) * 0.1;
                child.rotation.y += 0.01;
            }
        });
    }

    /**
     * Animar isla del desierto
     */
    animateDesertIsland(island, deltaTime) {
        // Animar dunas
        island.children.forEach(child => {
            if (child.children.length > 0 && child.children[0].geometry instanceof THREE.ConeGeometry) {
                child.rotation.y += 0.001;
            }
        });
    }

    /**
     * Animar isla de la ciudad
     */
    animateCityIsland(island, deltaTime) {
        // Animar luces
        island.children.forEach(child => {
            if (child.material && child.material.color) {
                const color = child.material.color;
                if (color.getHex() === 0xffff00 || color.getHex() === 0xff0000) {
                    child.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
                }
            }
        });
    }

    /**
     * Obtener información de la isla actual
     */
    getCurrentIslandInfo() {
        if (!this.currentIsland) return null;
        
        const islandInfo = {
            forest: {
                name: "Isla del Bosque Mágico",
                description: "Un bosque místico lleno de árboles antiguos y partículas mágicas flotantes.",
                features: ["Árboles mágicos", "Partículas flotantes", "Sonidos de naturaleza"]
            },
            ocean: {
                name: "Isla del Océano Profundo",
                description: "Un vasto océano con islas pequeñas y olas que se mueven suavemente.",
                features: ["Olas animadas", "Islas pequeñas", "Sonidos de agua"]
            },
            mountain: {
                name: "Isla de las Montañas Nevadas",
                description: "Picos nevados que se elevan hacia el cielo con copos de nieve que caen.",
                features: ["Picos nevados", "Copos de nieve", "Sonidos de viento"]
            },
            desert: {
                name: "Isla del Desierto Místico",
                description: "Un desierto dorado con dunas de arena y un oasis en el centro.",
                features: ["Dunas de arena", "Oasis", "Palmeras"]
            },
            city: {
                name: "Isla de la Ciudad Futurista",
                description: "Una metrópolis futurista con rascacielos iluminados y tecnología avanzada.",
                features: ["Rascacielos", "Luces de ciudad", "Tecnología futurista"]
            }
        };
        
        return islandInfo[this.currentIsland];
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        // Detener audio
        this.audioManager.stopAllSounds();
        
        // Limpiar Three.js
        this.scene.traverse(object => {
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
        
        this.renderer.dispose();
        
        // Remover event listeners
        document.removeEventListener('keydown', this.controls.onKeyDown);
        document.removeEventListener('keyup', this.controls.onKeyUp);
    }
}

// Inicializar sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.metaverseExploration = new MetaverseExplorationSystem();
});

// Funciones globales
window.getCurrentIslandInfo = () => window.metaverseExploration.getCurrentIslandInfo();
window.changeIsland = (islandType) => window.metaverseExploration.changeIsland(islandType); 