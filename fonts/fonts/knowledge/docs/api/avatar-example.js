/**
 * Ejemplo Completo - Sistema de Generación de Avatares
 * Demostración práctica del sistema de avatares
 */

class AvatarExample {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatarGenerator = null;
        this.avatars = [];
        this.currentAvatarIndex = 0;
        
        console.log('🎭 Ejemplo de Avatares inicializado');
    }
    
    /**
     * Inicializar ejemplo
     */
    async initialize() {
        try {
            // Crear escena Three.js
            this.setupScene();
            
            // Inicializar generador de avatares
            this.avatarGenerator = new AvatarGenerator();
            
            // Generar avatares de ejemplo
            await this.generateExampleAvatars();
            
            // Configurar controles
            this.setupControls();
            
            // Iniciar renderizado
            this.startRenderLoop();
            
            console.log('✅ Ejemplo de avatares inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando ejemplo:', error);
            throw error;
        }
    }
    
    /**
     * Configurar escena Three.js
     */
    setupScene() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 2, 0);
        
        // Crear renderizador
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Configurar iluminación
        this.setupLighting();
        
        // Configurar suelo
        this.setupGround();
        
        // Configurar controles de cámara
        this.setupCameraControls();
    }
    
    /**
     * Configurar iluminación
     */
    setupLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // Luz puntual para efectos
        const pointLight = new THREE.PointLight(0x3498db, 0.5, 20);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);
    }
    
    /**
     * Configurar suelo
     */
    setupGround() {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.8,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
    
    /**
     * Configurar controles de cámara
     */
    setupCameraControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI;
    }
    
    /**
     * Generar avatares de ejemplo
     */
    async generateExampleAvatars() {
        console.log('🎭 Generando avatares de ejemplo...');
        
        const avatarConfigs = [
            {
                name: 'Cyberpunk Warrior',
                options: {
                    seed: 'cyberpunk_001',
                    style: 'cyberpunk',
                    gender: 'neutral',
                    height: 'tall',
                    build: 'athletic',
                    hairStyle: 'spiky',
                    eyeColor: 'red',
                    skinTone: 'medium',
                    clothing: 'armor',
                    accessories: ['glasses', 'cybernetics'],
                    effects: ['glow', 'hologram']
                }
            },
            {
                name: 'Fantasy Mage',
                options: {
                    seed: 'fantasy_001',
                    style: 'fantasy',
                    gender: 'female',
                    height: 'average',
                    build: 'slim',
                    hairStyle: 'long',
                    eyeColor: 'blue',
                    skinTone: 'exotic',
                    clothing: 'armor',
                    accessories: ['crown', 'magic_staff'],
                    effects: ['magic', 'particles']
                }
            },
            {
                name: 'Realistic Business',
                options: {
                    seed: 'realistic_001',
                    style: 'realistic',
                    gender: 'male',
                    height: 'average',
                    build: 'athletic',
                    hairStyle: 'short',
                    eyeColor: 'brown',
                    skinTone: 'medium',
                    clothing: 'formal',
                    accessories: ['glasses', 'watch'],
                    effects: []
                }
            },
            {
                name: 'Abstract Entity',
                options: {
                    seed: 'abstract_001',
                    style: 'abstract',
                    gender: 'neutral',
                    height: 'tall',
                    build: 'slim',
                    hairStyle: 'bald',
                    eyeColor: 'blue',
                    skinTone: 'exotic',
                    clothing: 'naked',
                    accessories: [],
                    effects: ['distortion', 'energy']
                }
            }
        ];
        
        // Generar avatares
        for (let i = 0; i < avatarConfigs.length; i++) {
            const config = avatarConfigs[i];
            console.log(`Generando avatar: ${config.name}`);
            
            try {
                const avatar = await this.avatarGenerator.generateAvatar(config.options);
                
                // Posicionar avatar
                avatar.mesh.position.set(
                    (i - 1.5) * 4,
                    0,
                    0
                );
                
                // Agregar nombre
                avatar.name = config.name;
                
                // Agregar a la escena
                this.scene.add(avatar.mesh);
                
                // Agregar a la lista
                this.avatars.push(avatar);
                
                console.log(`✅ Avatar generado: ${config.name}`);
                
            } catch (error) {
                console.error(`❌ Error generando avatar ${config.name}:`, error);
            }
        }
        
        console.log(`🎭 Total de avatares generados: ${this.avatars.length}`);
    }
    
    /**
     * Configurar controles de interfaz
     */
    setupControls() {
        this.createUI();
        this.setupKeyboardControls();
    }
    
    /**
     * Crear interfaz de usuario
     */
    createUI() {
        const ui = document.createElement('div');
        ui.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 1000;
        `;
        
        ui.innerHTML = `
            <h2>🎭 Sistema de Avatares</h2>
            <div style="margin: 10px 0;">
                <strong>Avatar actual:</strong> <span id="currentAvatar">Cyberpunk Warrior</span>
            </div>
            <div style="margin: 10px 0;">
                <button onclick="avatarExample.previousAvatar()" style="margin: 5px; padding: 8px 12px; background: #3498db; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    ← Anterior
                </button>
                <button onclick="avatarExample.nextAvatar()" style="margin: 5px; padding: 8px 12px; background: #3498db; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    Siguiente →
                </button>
            </div>
            <div style="margin: 10px 0;">
                <button onclick="avatarExample.animateAvatar()" style="margin: 5px; padding: 8px 12px; background: #e74c3c; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    🎬 Animar
                </button>
                <button onclick="avatarExample.rotateAvatar()" style="margin: 5px; padding: 8px 12px; background: #f39c12; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    🔄 Rotar
                </button>
            </div>
            <div style="margin: 10px 0;">
                <button onclick="avatarExample.generateNewAvatar()" style="margin: 5px; padding: 8px 12px; background: #27ae60; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    ✨ Nuevo Avatar
                </button>
            </div>
            <div style="margin: 10px 0; font-size: 12px;">
                <strong>Controles:</strong><br>
                WASD - Mover cámara<br>
                Mouse - Rotar vista<br>
                Rueda - Zoom<br>
                Espacio - Cambiar avatar
            </div>
        `;
        
        document.body.appendChild(ui);
    }
    
    /**
     * Configurar controles de teclado
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.key.toLowerCase()) {
                case ' ':
                    event.preventDefault();
                    this.nextAvatar();
                    break;
                case 'arrowleft':
                    this.previousAvatar();
                    break;
                case 'arrowright':
                    this.nextAvatar();
                    break;
                case 'a':
                    this.animateAvatar();
                    break;
                case 'r':
                    this.rotateAvatar();
                    break;
                case 'n':
                    this.generateNewAvatar();
                    break;
            }
        });
    }
    
    /**
     * Cambiar al avatar anterior
     */
    previousAvatar() {
        if (this.avatars.length === 0) return;
        
        this.currentAvatarIndex = (this.currentAvatarIndex - 1 + this.avatars.length) % this.avatars.length;
        this.updateCurrentAvatar();
    }
    
    /**
     * Cambiar al siguiente avatar
     */
    nextAvatar() {
        if (this.avatars.length === 0) return;
        
        this.currentAvatarIndex = (this.currentAvatarIndex + 1) % this.avatars.length;
        this.updateCurrentAvatar();
    }
    
    /**
     * Actualizar avatar actual
     */
    updateCurrentAvatar() {
        const currentAvatar = this.avatars[this.currentAvatarIndex];
        if (currentAvatar) {
            document.getElementById('currentAvatar').textContent = currentAvatar.name;
            
            // Mover cámara al avatar actual
            const targetPosition = currentAvatar.mesh.position.clone();
            targetPosition.y += 2;
            targetPosition.z += 5;
            
            // Animación suave de cámara
            new TWEEN.Tween(this.camera.position)
                .to(targetPosition, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        }
    }
    
    /**
     * Animar avatar actual
     */
    animateAvatar() {
        const currentAvatar = this.avatars[this.currentAvatarIndex];
        if (currentAvatar && currentAvatar.animations) {
            const animations = ['idle', 'walk', 'run'];
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
            currentAvatar.setAnimation(randomAnimation);
            
            console.log(`🎬 Animando avatar: ${randomAnimation}`);
        }
    }
    
    /**
     * Rotar avatar actual
     */
    rotateAvatar() {
        const currentAvatar = this.avatars[this.currentAvatarIndex];
        if (currentAvatar) {
            new TWEEN.Tween(currentAvatar.mesh.rotation)
                .to({ y: currentAvatar.mesh.rotation.y + Math.PI * 2 }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }
    
    /**
     * Generar nuevo avatar
     */
    async generateNewAvatar() {
        console.log('✨ Generando nuevo avatar...');
        
        const styles = ['cyberpunk', 'fantasy', 'realistic', 'abstract'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        
        const newAvatar = await this.avatarGenerator.generateAvatar({
            seed: `random_${Date.now()}`,
            style: randomStyle,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            height: ['short', 'average', 'tall'][Math.floor(Math.random() * 3)],
            build: ['slim', 'average', 'athletic', 'heavy'][Math.floor(Math.random() * 4)],
            hairStyle: ['short', 'long', 'bald', 'spiky'][Math.floor(Math.random() * 4)],
            eyeColor: ['blue', 'green', 'brown', 'red'][Math.floor(Math.random() * 4)],
            skinTone: ['light', 'medium', 'dark', 'exotic'][Math.floor(Math.random() * 4)],
            clothing: ['casual', 'formal', 'armor', 'naked'][Math.floor(Math.random() * 4)]
        });
        
        // Posicionar nuevo avatar
        newAvatar.mesh.position.set(
            (this.avatars.length - 1.5) * 4,
            0,
            0
        );
        
        newAvatar.name = `Random ${randomStyle.charAt(0).toUpperCase() + randomStyle.slice(1)}`;
        
        // Agregar a la escena y lista
        this.scene.add(newAvatar.mesh);
        this.avatars.push(newAvatar);
        
        console.log(`✅ Nuevo avatar generado: ${newAvatar.name}`);
    }
    
    /**
     * Iniciar bucle de renderizado
     */
    startRenderLoop() {
        const clock = new THREE.Clock();
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            const deltaTime = clock.getDelta();
            
            // Actualizar controles
            this.controls.update();
            
            // Actualizar avatares
            this.avatars.forEach(avatar => {
                if (avatar.update) {
                    avatar.update(deltaTime);
                }
            });
            
            // Actualizar TWEEN
            TWEEN.update();
            
            // Renderizar
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
    
    /**
     * Manejar redimensionamiento de ventana
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar avatares
        this.avatars.forEach(avatar => {
            if (avatar.dispose) {
                avatar.dispose();
            }
        });
        
        // Limpiar renderizador
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Remover elementos del DOM
        const canvas = this.renderer.domElement;
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        
        console.log('🧹 Ejemplo de avatares limpiado');
    }
}

// Crear instancia global
window.avatarExample = new AvatarExample();

// Inicializar cuando se cargue la página
window.addEventListener('load', async () => {
    try {
        await window.avatarExample.initialize();
        console.log('🚀 Ejemplo de avatares listo');
    } catch (error) {
        console.error('❌ Error inicializando ejemplo:', error);
    }
});

// Manejar redimensionamiento
window.addEventListener('resize', () => {
    if (window.avatarExample) {
        window.avatarExample.onWindowResize();
    }
});

// Exportar para uso global
window.AvatarExample = AvatarExample; 