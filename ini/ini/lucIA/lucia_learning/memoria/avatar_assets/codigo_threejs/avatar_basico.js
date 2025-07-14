/**
 * 🎭 AVATAR BÁSICO DE LUCIA - THREE.JS
 * 
 * Este archivo contiene el código completo para crear y renderizar
 * el avatar básico de LucIA en Three.js.
 * 
 * @author LucIA Learning System
 * @version 1.0.0
 * @date 2025-01-07
 */

// Importaciones necesarias (si se usa módulos)
// import * as THREE from 'three';

/**
 * Clase principal para el avatar de LucIA
 */
class LuciaAvatar {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            scale: options.scale || 1.0,
            position: options.position || { x: 0, y: 0, z: 0 },
            rotation: options.rotation || { x: 0, y: 0, z: 0 },
            ...options
        };
        
        this.avatarGroup = null;
        this.components = {};
        this.animations = {};
        
        this.init();
    }
    
    /**
     * Inicializa el avatar
     */
    init() {
        this.createAvatarGroup();
        this.createHead();
        this.createBody();
        this.createArms();
        this.createLegs();
        this.createAccessories();
        this.setupMaterials();
        this.setupAnimations();
        
        // Aplicar transformaciones iniciales
        this.applyTransformations();
    }
    
    /**
     * Crea el grupo principal del avatar
     */
    createAvatarGroup() {
        this.avatarGroup = new THREE.Group();
        this.avatarGroup.name = 'LuciaAvatar';
        this.scene.add(this.avatarGroup);
    }
    
    /**
     * Crea la cabeza de LucIA
     */
    createHead() {
        // Geometría de la cabeza
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        
        // Material de la cabeza
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFCC99,  // Color piel cálida
            shininess: 30,
            transparent: true,
            opacity: 0.95,
            side: THREE.FrontSide
        });
        
        // Mesh de la cabeza
        this.components.head = new THREE.Mesh(headGeometry, headMaterial);
        this.components.head.position.y = 0.8;
        this.components.head.name = 'LuciaHead';
        
        // Agregar a la escena
        this.avatarGroup.add(this.components.head);
        
        // Crear ojos
        this.createEyes();
    }
    
    /**
     * Crea los ojos de LucIA
     */
    createEyes() {
        const eyeGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,  // Negro para los ojos
            shininess: 100
        });
        
        // Ojo izquierdo
        this.components.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.components.leftEye.position.set(-0.05, 0.85, 0.12);
        this.avatarGroup.add(this.components.leftEye);
        
        // Ojo derecho
        this.components.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.components.rightEye.position.set(0.05, 0.85, 0.12);
        this.avatarGroup.add(this.components.rightEye);
    }
    
    /**
     * Crea el cuerpo de LucIA
     */
    createBody() {
        // Geometría del cuerpo
        const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.6, 8);
        
        // Material del cuerpo
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,  // Azul característico
            shininess: 100,
            transparent: true,
            opacity: 0.9,
            side: THREE.FrontSide
        });
        
        // Mesh del cuerpo
        this.components.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.components.body.position.y = 0.2;
        this.components.body.name = 'LuciaBody';
        
        // Agregar a la escena
        this.avatarGroup.add(this.components.body);
    }
    
    /**
     * Crea los brazos de LucIA
     */
    createArms() {
        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
        const armMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,
            shininess: 80,
            transparent: true,
            opacity: 0.9
        });
        
        // Brazo izquierdo
        this.components.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.components.leftArm.position.set(-0.3, 0.3, 0);
        this.components.leftArm.rotation.z = Math.PI / 4;
        this.components.leftArm.name = 'LuciaLeftArm';
        this.avatarGroup.add(this.components.leftArm);
        
        // Brazo derecho
        this.components.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.components.rightArm.position.set(0.3, 0.3, 0);
        this.components.rightArm.rotation.z = -Math.PI / 4;
        this.components.rightArm.name = 'LuciaRightArm';
        this.avatarGroup.add(this.components.rightArm);
        
        // Crear manos
        this.createHands();
    }
    
    /**
     * Crea las manos de LucIA
     */
    createHands() {
        const handGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const handMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,
            shininess: 80,
            transparent: true,
            opacity: 0.9
        });
        
        // Mano izquierda
        this.components.leftHand = new THREE.Mesh(handGeometry, handMaterial);
        this.components.leftHand.position.set(-0.45, 0.1, 0);
        this.avatarGroup.add(this.components.leftHand);
        
        // Mano derecha
        this.components.rightHand = new THREE.Mesh(handGeometry, handMaterial);
        this.components.rightHand.position.set(0.45, 0.1, 0);
        this.avatarGroup.add(this.components.rightHand);
    }
    
    /**
     * Crea las piernas de LucIA
     */
    createLegs() {
        const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6);
        const legMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,
            shininess: 80,
            transparent: true,
            opacity: 0.9
        });
        
        // Pierna izquierda
        this.components.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.components.leftLeg.position.set(-0.1, -0.4, 0);
        this.components.leftLeg.name = 'LuciaLeftLeg';
        this.avatarGroup.add(this.components.leftLeg);
        
        // Pierna derecha
        this.components.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.components.rightLeg.position.set(0.1, -0.4, 0);
        this.components.rightLeg.name = 'LuciaRightLeg';
        this.avatarGroup.add(this.components.rightLeg);
        
        // Crear pies
        this.createFeet();
    }
    
    /**
     * Crea los pies de LucIA
     */
    createFeet() {
        const footGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8);
        const footMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,
            shininess: 80,
            transparent: true,
            opacity: 0.9
        });
        
        // Pie izquierdo
        this.components.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.components.leftFoot.position.set(-0.1, -0.75, 0);
        this.avatarGroup.add(this.components.leftFoot);
        
        // Pie derecho
        this.components.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.components.rightFoot.position.set(0.1, -0.75, 0);
        this.avatarGroup.add(this.components.rightFoot);
    }
    
    /**
     * Crea los accesorios de LucIA
     */
    createAccessories() {
        this.createNecklace();
        this.createGloves();
        this.createBoots();
    }
    
    /**
     * Crea el collar tecnológico
     */
    createNecklace() {
        const necklaceGeometry = new THREE.TorusGeometry(0.18, 0.02, 8, 16);
        const necklaceMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,  // Dorado
            shininess: 150,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        this.components.necklace = new THREE.Mesh(necklaceGeometry, necklaceMaterial);
        this.components.necklace.position.y = 0.75;
        this.components.necklace.rotation.x = Math.PI / 2;
        this.avatarGroup.add(this.components.necklace);
    }
    
    /**
     * Crea los guantes holográficos
     */
    createGloves() {
        const gloveGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const gloveMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,
            shininess: 120,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Guante izquierdo
        this.components.leftGlove = new THREE.Mesh(gloveGeometry, gloveMaterial);
        this.components.leftGlove.position.set(-0.45, 0.1, 0);
        this.avatarGroup.add(this.components.leftGlove);
        
        // Guante derecho
        this.components.rightGlove = new THREE.Mesh(gloveGeometry, gloveMaterial);
        this.components.rightGlove.position.set(0.45, 0.1, 0);
        this.avatarGroup.add(this.components.rightGlove);
    }
    
    /**
     * Crea las botas espaciales
     */
    createBoots() {
        const bootGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 8);
        const bootMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066CC,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        // Bota izquierda
        this.components.leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        this.components.leftBoot.position.set(-0.1, -0.85, 0);
        this.avatarGroup.add(this.components.leftBoot);
        
        // Bota derecha
        this.components.rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        this.components.rightBoot.position.set(0.1, -0.85, 0);
        this.avatarGroup.add(this.components.rightBoot);
    }
    
    /**
     * Configura los materiales avanzados
     */
    setupMaterials() {
        // Agregar efectos de brillo a los accesorios
        if (this.components.necklace) {
            this.components.necklace.material.emissive = new THREE.Color(0x333300);
            this.components.necklace.material.emissiveIntensity = 0.1;
        }
        
        // Efectos de transparencia para guantes
        if (this.components.leftGlove && this.components.rightGlove) {
            this.components.leftGlove.material.alphaTest = 0.5;
            this.components.rightGlove.material.alphaTest = 0.5;
        }
    }
    
    /**
     * Configura las animaciones básicas
     */
    setupAnimations() {
        // Animación de respiración
        this.animations.breathing = {
            duration: 2000,
            easing: 'easeInOutSine',
            target: this.components.body,
            property: 'scale',
            values: { y: [0.98, 1.02] }
        };
        
        // Animación de rotación de cabeza
        this.animations.headRotation = {
            duration: 3000,
            easing: 'easeInOutSine',
            target: this.components.head,
            property: 'rotation',
            values: { y: [-0.1, 0.1] }
        };
        
        // Animación de brazos
        this.animations.armSwing = {
            duration: 1500,
            easing: 'easeInOutSine',
            targets: [this.components.leftArm, this.components.rightArm],
            property: 'rotation',
            values: { z: [Math.PI/4, -Math.PI/4] }
        };
    }
    
    /**
     * Aplica las transformaciones iniciales
     */
    applyTransformations() {
        // Escala
        this.avatarGroup.scale.setScalar(this.options.scale);
        
        // Posición
        this.avatarGroup.position.set(
            this.options.position.x,
            this.options.position.y,
            this.options.position.z
        );
        
        // Rotación
        this.avatarGroup.rotation.set(
            this.options.rotation.x,
            this.options.rotation.y,
            this.options.rotation.z
        );
    }
    
    /**
     * Actualiza el avatar (para animaciones)
     */
    update(deltaTime) {
        // Aquí se pueden agregar animaciones en tiempo real
        this.updateBreathing(deltaTime);
        this.updateHeadMovement(deltaTime);
    }
    
    /**
     * Animación de respiración
     */
    updateBreathing(deltaTime) {
        if (this.components.body) {
            const time = Date.now() * 0.001;
            const breathingScale = 1 + Math.sin(time * 2) * 0.01;
            this.components.body.scale.y = breathingScale;
        }
    }
    
    /**
     * Movimiento de cabeza
     */
    updateHeadMovement(deltaTime) {
        if (this.components.head) {
            const time = Date.now() * 0.0005;
            this.components.head.rotation.y = Math.sin(time) * 0.1;
        }
    }
    
    /**
     * Obtiene el grupo del avatar
     */
    getAvatarGroup() {
        return this.avatarGroup;
    }
    
    /**
     * Obtiene un componente específico
     */
    getComponent(name) {
        return this.components[name];
    }
    
    /**
     * Cambia el color de un componente
     */
    changeComponentColor(componentName, color) {
        if (this.components[componentName]) {
            this.components[componentName].material.color.setHex(color);
        }
    }
    
    /**
     * Aplica una animación personalizada
     */
    playAnimation(animationName, duration = 1000) {
        // Implementación básica de animación
        console.log(`Reproduciendo animación: ${animationName}`);
    }
}

/**
 * Función de utilidad para crear el avatar
 */
function createLuciaAvatar(scene, options = {}) {
    return new LuciaAvatar(scene, options);
}

/**
 * Función de utilidad para crear el avatar básico (versión simple)
 */
function createBasicLuciaAvatar(scene) {
    const avatarGroup = new THREE.Group();
    
    // Cabeza
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFCC99,
        shininess: 30,
        transparent: true,
        opacity: 0.95
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.8;
    avatarGroup.add(head);
    
    // Cuerpo
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.6, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066CC,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    avatarGroup.add(body);
    
    // Brazos
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
    const armMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066CC,
        shininess: 80
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.3, 0.3, 0);
    leftArm.rotation.z = Math.PI / 4;
    avatarGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.3, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 4;
    avatarGroup.add(rightArm);
    
    // Piernas
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6);
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066CC,
        shininess: 80
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.1, -0.4, 0);
    avatarGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.1, -0.4, 0);
    avatarGroup.add(rightLeg);
    
    scene.add(avatarGroup);
    return avatarGroup;
}

// Exportaciones (si se usa módulos)
// export { LuciaAvatar, createLuciaAvatar, createBasicLuciaAvatar };

// Para uso global (sin módulos)
if (typeof window !== 'undefined') {
    window.LuciaAvatar = LuciaAvatar;
    window.createLuciaAvatar = createLuciaAvatar;
    window.createBasicLuciaAvatar = createBasicLuciaAvatar;
} 