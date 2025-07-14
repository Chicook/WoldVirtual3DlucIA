/**
 * Sistema de Partículas Avanzado - Three.js
 * Efectos de partículas complejos para el metaverso crypto 3D
 */

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = new Map();
        this.emitters = new Map();
        this.effects = new Map();
        this.fluids = new Map();
        this.smoke = new Map();
        this.fire = new Map();
        this.magic = new Map();
        
        // Configuración del sistema
        this.config = {
            maxParticles: 10000,
            maxEmitters: 100,
            maxEffects: 50,
            gpuAccelerated: true,
            useInstancing: true,
            useComputeShaders: false
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isPaused: false
        };
        
        // Métricas
        this.metrics = {
            activeParticles: 0,
            activeEmitters: 0,
            activeEffects: 0,
            totalParticles: 0,
            fps: 0,
            memoryUsage: 0
        };
        
        // Geometrías y materiales compartidos
        this.sharedGeometries = new Map();
        this.sharedMaterials = new Map();
        
        console.log('✨ Sistema de Partículas inicializado');
    }
    
    /**
     * Inicializar sistema de partículas
     */
    async initialize() {
        try {
            // Crear geometrías compartidas
            this.createSharedGeometries();
            
            // Crear materiales compartidos
            this.createSharedMaterials();
            
            // Configurar shaders personalizados
            await this.setupCustomShaders();
            
            // Crear efectos por defecto
            await this.createDefaultEffects();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Partículas inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de partículas:', error);
            throw error;
        }
    }
    
    /**
     * Crear geometrías compartidas
     */
    createSharedGeometries() {
        // Geometría de punto
        this.sharedGeometries.set('point', new THREE.BufferGeometry());
        
        // Geometría de sprite
        this.sharedGeometries.set('sprite', new THREE.PlaneGeometry(1, 1));
        
        // Geometría de cubo
        this.sharedGeometries.set('cube', new THREE.BoxGeometry(1, 1, 1));
        
        // Geometría de esfera
        this.sharedGeometries.set('sphere', new THREE.SphereGeometry(0.5, 8, 8));
        
        // Geometría de estrella
        this.sharedGeometries.set('star', this.createStarGeometry());
        
        // Geometría de diamante
        this.sharedGeometries.set('diamond', this.createDiamondGeometry());
        
        console.log('✅ Geometrías compartidas creadas');
    }
    
    /**
     * Crear geometría de estrella
     */
    createStarGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        
        const points = 5;
        const outerRadius = 0.5;
        const innerRadius = 0.25;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            
            vertices.push(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
        }
        
        for (let i = 0; i < points; i++) {
            const base = i * 2;
            indices.push(base, (base + 1) % (points * 2), (base + 2) % (points * 2));
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    /**
     * Crear geometría de diamante
     */
    createDiamondGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [
            // Punto superior
            0, 0.5, 0,
            // Base
            -0.25, -0.25, 0.25,
            0.25, -0.25, 0.25,
            0.25, -0.25, -0.25,
            -0.25, -0.25, -0.25
        ];
        
        const indices = [
            0, 1, 2, // Cara frontal
            0, 2, 3, // Cara derecha
            0, 3, 4, // Cara trasera
            0, 4, 1, // Cara izquierda
            1, 4, 3, // Base
            1, 3, 2  // Base
        ];
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    /**
     * Crear materiales compartidos
     */
    createSharedMaterials() {
        // Material de punto básico
        this.sharedMaterials.set('point', new THREE.PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        }));
        
        // Material de sprite
        this.sharedMaterials.set('sprite', new THREE.SpriteMaterial({
            transparent: true,
            opacity: 0.8
        }));
        
        // Material de partícula con shader personalizado
        this.sharedMaterials.set('custom', new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                size: { value: 1 },
                color: { value: new THREE.Color(0xffffff) },
                texture: { value: null }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = customColor;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D texture;
                varying vec3 vColor;
                
                void main() {
                    gl_FragColor = vec4(color * vColor, 1.0);
                }
            `,
            transparent: true,
            vertexColors: true
        }));
        
        console.log('✅ Materiales compartidos creados');
    }
    
    /**
     * Configurar shaders personalizados
     */
    async setupCustomShaders() {
        // Shader de partículas avanzado
        this.advancedParticleShader = {
            vertexShader: `
                attribute float size;
                attribute float life;
                attribute vec3 velocity;
                attribute vec3 acceleration;
                attribute vec3 customColor;
                
                uniform float time;
                uniform float deltaTime;
                uniform vec3 gravity;
                
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    vColor = customColor;
                    vLife = life;
                    
                    // Actualizar posición
                    vec3 newPosition = position + velocity * deltaTime + 0.5 * acceleration * deltaTime * deltaTime;
                    
                    // Actualizar velocidad
                    vec3 newVelocity = velocity + acceleration * deltaTime + gravity * deltaTime;
                    
                    // Actualizar vida
                    float newLife = life - deltaTime;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (newLife / 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D texture;
                varying vec3 vColor;
                varying float vLife;
                
                void main() {
                    vec4 texColor = texture2D(texture, gl_PointCoord);
                    float alpha = texColor.a * (vLife / 1.0);
                    gl_FragColor = vec4(vColor * texColor.rgb, alpha);
                }
            `
        };
        
        console.log('✅ Shaders personalizados configurados');
    }
    
    /**
     * Crear efectos por defecto
     */
    async createDefaultEffects() {
        // Efecto de explosión
        await this.createExplosionEffect();
        
        // Efecto de fuego
        await this.createFireEffect();
        
        // Efecto de humo
        await this.createSmokeEffect();
        
        // Efecto de magia
        await this.createMagicEffect();
        
        // Efecto de fluido
        await this.createFluidEffect();
        
        console.log('✅ Efectos por defecto creados');
    }
    
    /**
     * Crear emisor de partículas
     */
    createParticleEmitter(options = {}) {
        const {
            id = `emitter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            position = { x: 0, y: 0, z: 0 },
            geometry = 'point',
            material = 'custom',
            count = 100,
            life = 2.0,
            size = { min: 0.1, max: 1.0 },
            velocity = { x: { min: -1, max: 1 }, y: { min: 0, max: 2 }, z: { min: -1, max: 1 } },
            acceleration = { x: 0, y: -9.81, z: 0 },
            color = { start: 0xffffff, end: 0x000000 },
            opacity = { start: 1.0, end: 0.0 },
            emissionRate = 10,
            burst = false,
            burstCount = 50,
            texture = null
        } = options;
        
        // Crear geometría de partículas
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const accelerations = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        const lives = new Float32Array(count);
        
        // Inicializar partículas
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Posición
            positions[i3] = position.x + (Math.random() - 0.5) * 0.1;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.1;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.1;
            
            // Velocidad
            velocities[i3] = this.randomRange(velocity.x.min, velocity.x.max);
            velocities[i3 + 1] = this.randomRange(velocity.y.min, velocity.y.max);
            velocities[i3 + 2] = this.randomRange(velocity.z.min, velocity.z.max);
            
            // Aceleración
            accelerations[i3] = acceleration.x;
            accelerations[i3 + 1] = acceleration.y;
            accelerations[i3 + 2] = acceleration.z;
            
            // Tamaño
            sizes[i] = this.randomRange(size.min, size.max);
            
            // Color
            const startColor = new THREE.Color(color.start);
            const endColor = new THREE.Color(color.end);
            colors[i3] = startColor.r;
            colors[i3 + 1] = startColor.g;
            colors[i3 + 2] = startColor.b;
            
            // Vida
            lives[i] = this.randomRange(0, life);
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        particleGeometry.setAttribute('acceleration', new THREE.BufferAttribute(accelerations, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('life', new THREE.BufferAttribute(lives, 1));
        
        // Crear material
        let particleMaterial;
        if (material === 'custom') {
            particleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    deltaTime: { value: 0 },
                    gravity: { value: new THREE.Vector3(acceleration.x, acceleration.y, acceleration.z) },
                    texture: { value: texture }
                },
                vertexShader: this.advancedParticleShader.vertexShader,
                fragmentShader: this.advancedParticleShader.fragmentShader,
                transparent: true,
                vertexColors: true
            });
        } else {
            particleMaterial = this.sharedMaterials.get(material).clone();
        }
        
        // Crear sistema de partículas
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        particleSystem.position.copy(position);
        
        // Configurar emisor
        const emitter = {
            id,
            system: particleSystem,
            geometry: particleGeometry,
            material: particleMaterial,
            options,
            isActive: true,
            currentTime: 0,
            lastEmission: 0
        };
        
        this.emitters.set(id, emitter);
        this.scene.add(particleSystem);
        
        this.metrics.activeEmitters++;
        this.metrics.totalParticles += count;
        
        console.log(`✅ Emisor de partículas creado: ${id}`);
        
        return emitter;
    }
    
    /**
     * Crear efecto de explosión
     */
    async createExplosionEffect() {
        const explosionEmitter = this.createParticleEmitter({
            id: 'explosion',
            count: 200,
            life: 3.0,
            size: { min: 0.5, max: 2.0 },
            velocity: {
                x: { min: -5, max: 5 },
                y: { min: 2, max: 8 },
                z: { min: -5, max: 5 }
            },
            acceleration: { x: 0, y: -9.81, z: 0 },
            color: { start: 0xff4400, end: 0x000000 },
            opacity: { start: 1.0, end: 0.0 },
            emissionRate: 0,
            burst: true,
            burstCount: 200
        });
        
        this.effects.set('explosion', explosionEmitter);
    }
    
    /**
     * Crear efecto de fuego
     */
    async createFireEffect() {
        const fireEmitter = this.createParticleEmitter({
            id: 'fire',
            count: 100,
            life: 2.0,
            size: { min: 0.2, max: 1.0 },
            velocity: {
                x: { min: -0.5, max: 0.5 },
                y: { min: 1, max: 3 },
                z: { min: -0.5, max: 0.5 }
            },
            acceleration: { x: 0, y: 2, z: 0 },
            color: { start: 0xff6600, end: 0x000000 },
            opacity: { start: 1.0, end: 0.0 },
            emissionRate: 20
        });
        
        this.fire.set('fire', fireEmitter);
    }
    
    /**
     * Crear efecto de humo
     */
    async createSmokeEffect() {
        const smokeEmitter = this.createParticleEmitter({
            id: 'smoke',
            count: 50,
            life: 4.0,
            size: { min: 1.0, max: 3.0 },
            velocity: {
                x: { min: -0.2, max: 0.2 },
                y: { min: 0.5, max: 1.5 },
                z: { min: -0.2, max: 0.2 }
            },
            acceleration: { x: 0, y: 0.5, z: 0 },
            color: { start: 0x666666, end: 0x000000 },
            opacity: { start: 0.3, end: 0.0 },
            emissionRate: 10
        });
        
        this.smoke.set('smoke', smokeEmitter);
    }
    
    /**
     * Crear efecto de magia
     */
    async createMagicEffect() {
        const magicEmitter = this.createParticleEmitter({
            id: 'magic',
            geometry: 'star',
            count: 50,
            life: 3.0,
            size: { min: 0.1, max: 0.5 },
            velocity: {
                x: { min: -1, max: 1 },
                y: { min: -1, max: 1 },
                z: { min: -1, max: 1 }
            },
            acceleration: { x: 0, y: 0, z: 0 },
            color: { start: 0x00ffff, end: 0x0000ff },
            opacity: { start: 1.0, end: 0.0 },
            emissionRate: 5
        });
        
        this.magic.set('magic', magicEmitter);
    }
    
    /**
     * Crear efecto de fluido
     */
    async createFluidEffect() {
        const fluidEmitter = this.createParticleEmitter({
            id: 'fluid',
            geometry: 'sphere',
            count: 300,
            life: 5.0,
            size: { min: 0.1, max: 0.3 },
            velocity: {
                x: { min: -0.5, max: 0.5 },
                y: { min: -2, max: 0 },
                z: { min: -0.5, max: 0.5 }
            },
            acceleration: { x: 0, y: -9.81, z: 0 },
            color: { start: 0x0088ff, end: 0x0044aa },
            opacity: { start: 0.8, end: 0.0 },
            emissionRate: 30
        });
        
        this.fluids.set('fluid', fluidEmitter);
    }
    
    /**
     * Reproducir efecto
     */
    playEffect(effectName, position = { x: 0, y: 0, z: 0 }) {
        const effect = this.effects.get(effectName);
        if (effect) {
            effect.system.position.copy(position);
            effect.isActive = true;
            effect.currentTime = 0;
            
            if (effect.options.burst) {
                this.emitBurst(effect, effect.options.burstCount);
            }
            
            console.log(`✨ Efecto reproducido: ${effectName}`);
            return effect;
        }
        return null;
    }
    
    /**
     * Emitir ráfaga de partículas
     */
    emitBurst(emitter, count) {
        const geometry = emitter.geometry;
        const positions = geometry.attributes.position.array;
        const lives = geometry.attributes.life.array;
        
        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * positions.length / 3);
            lives[index] = emitter.options.life;
        }
        
        geometry.attributes.life.needsUpdate = true;
    }
    
    /**
     * Detener efecto
     */
    stopEffect(effectName) {
        const effect = this.effects.get(effectName);
        if (effect) {
            effect.isActive = false;
            console.log(`⏹️ Efecto detenido: ${effectName}`);
        }
    }
    
    /**
     * Actualizar sistema de partículas
     */
    update(deltaTime) {
        if (!this.states.isInitialized || this.states.isPaused) return;
        
        this.emitters.forEach(emitter => {
            if (emitter.isActive) {
                this.updateEmitter(emitter, deltaTime);
            }
        });
        
        // Actualizar métricas
        this.updateMetrics();
        
        this.states.isRunning = true;
    }
    
    /**
     * Actualizar emisor
     */
    updateEmitter(emitter, deltaTime) {
        const geometry = emitter.geometry;
        const positions = geometry.attributes.position.array;
        const velocities = geometry.attributes.velocity.array;
        const accelerations = geometry.attributes.acceleration.array;
        const lives = geometry.attributes.life.array;
        const colors = geometry.attributes.customColor.array;
        
        emitter.currentTime += deltaTime;
        
        // Actualizar partículas
        for (let i = 0; i < positions.length; i += 3) {
            const particleIndex = i / 3;
            
            if (lives[particleIndex] > 0) {
                // Actualizar posición
                positions[i] += velocities[i] * deltaTime + 0.5 * accelerations[i] * deltaTime * deltaTime;
                positions[i + 1] += velocities[i + 1] * deltaTime + 0.5 * accelerations[i + 1] * deltaTime * deltaTime;
                positions[i + 2] += velocities[i + 2] * deltaTime + 0.5 * accelerations[i + 2] * deltaTime * deltaTime;
                
                // Actualizar velocidad
                velocities[i] += accelerations[i] * deltaTime;
                velocities[i + 1] += accelerations[i + 1] * deltaTime;
                velocities[i + 2] += accelerations[i + 2] * deltaTime;
                
                // Actualizar vida
                lives[particleIndex] -= deltaTime;
                
                // Actualizar color basado en la vida
                const lifeRatio = lives[particleIndex] / emitter.options.life;
                const startColor = new THREE.Color(emitter.options.color.start);
                const endColor = new THREE.Color(emitter.options.color.end);
                
                colors[i] = startColor.r * lifeRatio + endColor.r * (1 - lifeRatio);
                colors[i + 1] = startColor.g * lifeRatio + endColor.g * (1 - lifeRatio);
                colors[i + 2] = startColor.b * lifeRatio + endColor.b * (1 - lifeRatio);
            } else {
                // Reiniciar partícula si es necesario
                if (emitter.options.emissionRate > 0 && 
                    emitter.currentTime - emitter.lastEmission > 1 / emitter.options.emissionRate) {
                    this.resetParticle(emitter, particleIndex);
                    emitter.lastEmission = emitter.currentTime;
                }
            }
        }
        
        // Marcar atributos para actualización
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.velocity.needsUpdate = true;
        geometry.attributes.life.needsUpdate = true;
        geometry.attributes.customColor.needsUpdate = true;
        
        // Actualizar uniformes del shader
        if (emitter.material.uniforms) {
            emitter.material.uniforms.time.value = emitter.currentTime;
            emitter.material.uniforms.deltaTime.value = deltaTime;
        }
    }
    
    /**
     * Reiniciar partícula
     */
    resetParticle(emitter, index) {
        const positions = emitter.geometry.attributes.position.array;
        const velocities = emitter.geometry.attributes.velocity.array;
        const lives = emitter.geometry.attributes.life.array;
        
        const i = index * 3;
        
        // Reiniciar posición
        positions[i] = emitter.system.position.x + (Math.random() - 0.5) * 0.1;
        positions[i + 1] = emitter.system.position.y + (Math.random() - 0.5) * 0.1;
        positions[i + 2] = emitter.system.position.z + (Math.random() - 0.5) * 0.1;
        
        // Reiniciar velocidad
        velocities[i] = this.randomRange(emitter.options.velocity.x.min, emitter.options.velocity.x.max);
        velocities[i + 1] = this.randomRange(emitter.options.velocity.y.min, emitter.options.velocity.y.max);
        velocities[i + 2] = this.randomRange(emitter.options.velocity.z.min, emitter.options.velocity.z.max);
        
        // Reiniciar vida
        lives[index] = emitter.options.life;
    }
    
    /**
     * Número aleatorio en rango
     */
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeEmitters = this.emitters.size;
        this.metrics.activeEffects = this.effects.size;
        this.metrics.activeParticles = this.calculateActiveParticles();
        this.metrics.fps = 1 / (performance.now() - (this.lastUpdate || performance.now()));
        this.metrics.memoryUsage = this.calculateMemoryUsage();
        
        this.lastUpdate = performance.now();
    }
    
    /**
     * Calcular partículas activas
     */
    calculateActiveParticles() {
        let count = 0;
        this.emitters.forEach(emitter => {
            const lives = emitter.geometry.attributes.life.array;
            for (let i = 0; i < lives.length; i++) {
                if (lives[i] > 0) count++;
            }
        });
        return count;
    }
    
    /**
     * Calcular uso de memoria
     */
    calculateMemoryUsage() {
        let total = 0;
        this.emitters.forEach(emitter => {
            const geometry = emitter.geometry;
            total += geometry.attributes.position.array.length * 4; // 4 bytes por float
            total += geometry.attributes.velocity.array.length * 4;
            total += geometry.attributes.acceleration.array.length * 4;
            total += geometry.attributes.size.array.length * 4;
            total += geometry.attributes.customColor.array.length * 4;
            total += geometry.attributes.life.array.length * 4;
        });
        return total;
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * Obtener estado
     */
    getState() {
        return this.states;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar emisores
        this.emitters.forEach(emitter => {
            this.scene.remove(emitter.system);
            emitter.geometry.dispose();
            emitter.material.dispose();
        });
        this.emitters.clear();
        
        // Limpiar geometrías compartidas
        this.sharedGeometries.forEach(geometry => {
            geometry.dispose();
        });
        this.sharedGeometries.clear();
        
        // Limpiar materiales compartidos
        this.sharedMaterials.forEach(material => {
            material.dispose();
        });
        this.sharedMaterials.clear();
        
        console.log('🧹 Sistema de Partículas limpiado');
    }
}

// Exportar para uso global
window.ParticleSystem = ParticleSystem; 