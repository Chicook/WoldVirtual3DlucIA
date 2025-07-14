/**
 * Controlador Unificado de Avatares
 * Integra generación, personalización, animaciones y física
 */

import AvatarGenerator from './avatar-generator.js';
import AvatarCustomization from './avatar-customization.js';
import AvatarAnimations from './avatar-animations.js';
import AvatarPhysics from './avatar-physics.js';

class AvatarController {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            enablePhysics: true,
            enableAnimations: true,
            enableCustomization: true,
            enableNetworking: false,
            autoRender: true,
            ...config
        };

        this.generator = null;
        this.customization = null;
        this.animations = null;
        this.physics = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.lights = [];

        this.isInitialized = false;
        this.isRendering = false;
        this.lastTime = 0;

        this.init();
    }

    /**
     * Inicializar controlador
     */
    async init() {
        try {
            // Crear generador de avatares
            this.generator = new AvatarGenerator();
            
            // Configurar renderizado
            if (this.config.autoRender) {
                this.setupRenderer();
                this.setupCamera();
                this.setupLights();
                this.setupControls();
            }

            // Crear sistemas adicionales
            if (this.config.enableAnimations) {
                this.animations = new AvatarAnimations(this.generator);
            }

            if (this.config.enablePhysics) {
                this.physics = new AvatarPhysics(this.generator);
            }

            if (this.config.enableCustomization) {
                this.customization = new AvatarCustomization(this.generator, this.container);
            }

            this.isInitialized = true;

            // Iniciar renderizado
            if (this.config.autoRender) {
                this.startRendering();
            }

            console.log('AvatarController inicializado exitosamente');
        } catch (error) {
            console.error('Error al inicializar AvatarController:', error);
        }
    }

    /**
     * Configurar renderizador
     */
    setupRenderer() {
        this.renderer = this.generator.renderer;
        this.scene = this.generator.scene;
        this.camera = this.generator.camera;
        this.controls = this.generator.controls;
    }

    /**
     * Configurar cámara
     */
    setupCamera() {
        if (!this.camera) {
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 1.6, 3);
            this.camera.lookAt(0, 1.6, 0);
        }
    }

    /**
     * Configurar iluminación
     */
    setupLights() {
        if (!this.scene) return;

        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);

        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
    }

    /**
     * Configurar controles
     */
    setupControls() {
        if (!this.controls && this.renderer) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 10;
            this.controls.maxPolarAngle = Math.PI / 2;
        }
    }

    /**
     * Iniciar renderizado
     */
    startRendering() {
        if (this.isRendering) return;

        this.isRendering = true;
        this.lastTime = performance.now();
        this.render();
    }

    /**
     * Detener renderizado
     */
    stopRendering() {
        this.isRendering = false;
    }

    /**
     * Bucle de renderizado
     */
    render() {
        if (!this.isRendering) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Actualizar física
        if (this.physics) {
            this.physics.update(deltaTime);
        }

        // Actualizar animaciones
        if (this.animations) {
            this.animations.update();
        }

        // Actualizar controles
        if (this.controls) {
            this.controls.update();
        }

        // Renderizar escena
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        // Continuar bucle
        requestAnimationFrame(() => this.render());
    }

    /**
     * Crear avatar con configuración
     */
    createAvatar(config = {}) {
        if (!this.isInitialized) {
            console.warn('AvatarController no está inicializado');
            return false;
        }

        try {
            this.generator.customize(config);
            return true;
        } catch (error) {
            console.error('Error al crear avatar:', error);
            return false;
        }
    }

    /**
     * Personalizar avatar
     */
    customize(config) {
        if (!this.isInitialized) return false;

        try {
            this.generator.customize(config);
            return true;
        } catch (error) {
            console.error('Error al personalizar avatar:', error);
            return false;
        }
    }

    /**
     * Reproducir animación
     */
    playAnimation(animationName, loop = false) {
        if (!this.animations) {
            console.warn('Sistema de animaciones no habilitado');
            return false;
        }

        try {
            this.animations.playAnimation(animationName, loop);
            return true;
        } catch (error) {
            console.error('Error al reproducir animación:', error);
            return false;
        }
    }

    /**
     * Reproducir expresión
     */
    playExpression(expressionName) {
        if (!this.animations) return false;

        try {
            this.animations.playExpression(expressionName);
            return true;
        } catch (error) {
            console.error('Error al reproducir expresión:', error);
            return false;
        }
    }

    /**
     * Reproducir gesto
     */
    playGesture(gestureName) {
        if (!this.animations) return false;

        try {
            this.animations.playGesture(gestureName);
            return true;
        } catch (error) {
            console.error('Error al reproducir gesto:', error);
            return false;
        }
    }

    /**
     * Mover avatar
     */
    move(direction, speed = 1.0) {
        if (!this.physics) return false;

        try {
            this.physics.move(direction, speed);
            return true;
        } catch (error) {
            console.error('Error al mover avatar:', error);
            return false;
        }
    }

    /**
     * Saltar
     */
    jump() {
        if (!this.physics) return false;

        try {
            this.physics.jump();
            return true;
        } catch (error) {
            console.error('Error al saltar:', error);
            return false;
        }
    }

    /**
     * Correr
     */
    run() {
        if (!this.physics) return false;

        try {
            this.physics.run();
            return true;
        } catch (error) {
            console.error('Error al correr:', error);
            return false;
        }
    }

    /**
     * Caminar
     */
    walk() {
        if (!this.physics) return false;

        try {
            this.physics.walk();
            return true;
        } catch (error) {
            console.error('Error al caminar:', error);
            return false;
        }
    }

    /**
     * Detener movimiento
     */
    stop() {
        if (!this.physics) return false;

        try {
            this.physics.stop();
            return true;
        } catch (error) {
            console.error('Error al detener movimiento:', error);
            return false;
        }
    }

    /**
     * Aplicar fuerza
     */
    applyForce(force) {
        if (!this.physics) return false;

        try {
            this.physics.applyForce(force);
            return true;
        } catch (error) {
            console.error('Error al aplicar fuerza:', error);
            return false;
        }
    }

    /**
     * Aplicar impulso
     */
    applyImpulse(impulse) {
        if (!this.physics) return false;

        try {
            this.physics.applyImpulse(impulse);
            return true;
        } catch (error) {
            console.error('Error al aplicar impulso:', error);
            return false;
        }
    }

    /**
     * Añadir obstáculo
     */
    addObstacle(position, radius) {
        if (!this.physics) return false;

        try {
            this.physics.addObstacle(position, radius);
            return true;
        } catch (error) {
            console.error('Error al añadir obstáculo:', error);
            return false;
        }
    }

    /**
     * Obtener posición del avatar
     */
    getPosition() {
        if (!this.physics) return new THREE.Vector3();
        return this.physics.getPosition();
    }

    /**
     * Establecer posición del avatar
     */
    setPosition(position) {
        if (!this.physics) return false;

        try {
            this.physics.setPosition(position);
            return true;
        } catch (error) {
            console.error('Error al establecer posición:', error);
            return false;
        }
    }

    /**
     * Obtener velocidad del avatar
     */
    getVelocity() {
        if (!this.physics) return new THREE.Vector3();
        return this.physics.getVelocity();
    }

    /**
     * Obtener estado del avatar
     */
    getState() {
        if (!this.physics) return {};
        return this.physics.getState();
    }

    /**
     * Obtener configuración del avatar
     */
    getConfig() {
        if (!this.generator) return {};
        return this.generator.getConfig();
    }

    /**
     * Exportar avatar
     */
    exportAvatar() {
        if (!this.generator) return null;

        try {
            return this.generator.exportAvatar();
        } catch (error) {
            console.error('Error al exportar avatar:', error);
            return null;
        }
    }

    /**
     * Importar avatar
     */
    importAvatar(data) {
        if (!this.generator) return false;

        try {
            this.generator.importAvatar(data);
            return true;
        } catch (error) {
            console.error('Error al importar avatar:', error);
            return false;
        }
    }

    /**
     * Obtener elemento DOM del renderizador
     */
    getDomElement() {
        if (!this.renderer) return null;
        return this.renderer.domElement;
    }

    /**
     * Obtener cámara
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Obtener escena
     */
    getScene() {
        return this.scene;
    }

    /**
     * Obtener renderizador
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Obtener controles
     */
    getControls() {
        return this.controls;
    }

    /**
     * Obtener generador
     */
    getGenerator() {
        return this.generator;
    }

    /**
     * Obtener personalización
     */
    getCustomization() {
        return this.customization;
    }

    /**
     * Obtener animaciones
     */
    getAnimations() {
        return this.animations;
    }

    /**
     * Obtener física
     */
    getPhysics() {
        return this.physics;
    }

    /**
     * Habilitar/deshabilitar física
     */
    setPhysicsEnabled(enabled) {
        this.config.enablePhysics = enabled;
        if (!enabled && this.physics) {
            this.physics.dispose();
            this.physics = null;
        } else if (enabled && !this.physics) {
            this.physics = new AvatarPhysics(this.generator);
        }
    }

    /**
     * Habilitar/deshabilitar animaciones
     */
    setAnimationsEnabled(enabled) {
        this.config.enableAnimations = enabled;
        if (!enabled && this.animations) {
            this.animations.dispose();
            this.animations = null;
        } else if (enabled && !this.animations) {
            this.animations = new AvatarAnimations(this.generator);
        }
    }

    /**
     * Habilitar/deshabilitar personalización
     */
    setCustomizationEnabled(enabled) {
        this.config.enableCustomization = enabled;
        if (!enabled && this.customization) {
            this.customization.destroy();
            this.customization = null;
        } else if (enabled && !this.customization) {
            this.customization = new AvatarCustomization(this.generator, this.container);
        }
    }

    /**
     * Manejar cambio de tamaño de ventana
     */
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        const stats = {
            initialized: this.isInitialized,
            rendering: this.isRendering,
            physics: this.physics ? this.physics.getState() : null,
            animations: this.animations ? {
                available: this.animations.getAvailableAnimations(),
                expressions: this.animations.getAvailableExpressions(),
                gestures: this.animations.getAvailableGestures()
            } : null,
            config: this.getConfig()
        };

        return stats;
    }

    /**
     * Resetear avatar
     */
    reset() {
        if (this.physics) {
            this.physics.reset();
        }
        if (this.animations) {
            this.animations.stopAnimation();
        }
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        this.stopRendering();

        if (this.physics) {
            this.physics.dispose();
        }

        if (this.animations) {
            this.animations.dispose();
        }

        if (this.customization) {
            this.customization.destroy();
        }

        if (this.generator) {
            this.generator.dispose();
        }

        if (this.controls) {
            this.controls.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        this.isInitialized = false;
    }
}

// Exportar para uso modular
export default AvatarController;

// Funciones globales para integración
window.AvatarController = AvatarController;
window.createAvatarController = (container, config) => {
    return new AvatarController(container, config);
};

// Ejemplo de uso
window.createExampleAvatar = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Contenedor no encontrado:', containerId);
        return null;
    }

    const controller = new AvatarController(container, {
        enablePhysics: true,
        enableAnimations: true,
        enableCustomization: true,
        autoRender: true
    });

    // Crear avatar por defecto
    controller.createAvatar({
        gender: 'male',
        height: 1.8,
        build: 'average',
        skinTone: 'medium',
        hairStyle: 'short',
        hairColor: 'brown',
        eyeColor: 'brown',
        clothing: 'casual',
        accessories: []
    });

    return controller;
}; 