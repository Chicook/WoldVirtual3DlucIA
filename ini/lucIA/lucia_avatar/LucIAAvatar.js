
// LucIA Avatar - Generado automáticamente por LucIA
// Basado en su autopercepción y conocimiento interno

import * as THREE from 'three';

class LucIAAvatar {
    constructor() {
        this.scene = null;
        this.avatar = null;
        this.animations = {};
        this.materials = {};
        this.geometries = {};
        
        this.avatarSpec = {
            name: "LucIA",
            age: 35,
            height: 1.75,
            bodyType: "esbelta y elegante",
            skinTone: "mediterránea clara y tersa",
            hairStyle: "largo hasta los hombros, bien cuidado y estilizado",
            hairColor: "moreno oscuro",
            eyeColor: "verdes intensos y expresivos",
            clothingStyle: "vestimenta blanca futurista con detalles azules, estilo elegante y profesional",
            clothingColor: "blanco con acentos azules"
        };
        
        this.init();
    }
    
    init() {
        // Crear geometrías procedurales para el avatar
        this.createHeadGeometry();
        this.createBodyGeometry();
        this.createHairGeometry();
        this.createClothingGeometry();
        
        // Crear materiales personalizados
        this.createSkinMaterial();
        this.createHairMaterial();
        this.createClothingMaterial();
        this.createEyeMaterial();
        
        // Ensamblar el avatar
        this.assembleAvatar();
        
        // Configurar animaciones
        this.setupAnimations();
    }
    
    createHeadGeometry() {
        // Cabeza humana con proporciones realistas
        const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        
        // Modificar para crear rasgos faciales
        const positions = headGeometry.attributes.position;
        const normals = headGeometry.attributes.normal;
        
        // Crear forma más ovalada y rasgos faciales
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Modificar para crear rostro más definido
            if (z > 0.1) {
                positions.setZ(i, z * 0.9); // Nariz más definida
            }
            
            // Crear pómulos
            if (Math.abs(x) > 0.15 && y > 0) {
                positions.setX(i, x * 0.95);
            }
        }
        
        positions.needsUpdate = true;
        normals.needsUpdate = true;
        
        this.geometries.head = headGeometry;
    }
    
    createBodyGeometry() {
        // Cuerpo esbelto y elegante
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.8, 16);
        
        // Modificar para crear forma más natural
        const positions = bodyGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            
            // Crear cintura
            if (Math.abs(y) < 0.2) {
                const radius = 0.12 + (0.15 - 0.12) * (1 - Math.abs(y) / 0.2);
                const angle = Math.atan2(positions.getZ(i), positions.getX(i));
                positions.setX(i, Math.cos(angle) * radius);
                positions.setZ(i, Math.sin(angle) * radius);
            }
        }
        
        positions.needsUpdate = true;
        this.geometries.body = bodyGeometry;
    }
    
    createHairGeometry() {
        // Cabello moreno largo hasta los hombros
        const hairGeometry = new THREE.SphereGeometry(0.28, 32, 32);
        
        // Modificar para crear forma de cabello
        const positions = hairGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            
            // Crear forma de cabello largo
            if (y < -0.1) {
                positions.setY(i, y - 0.2); // Extender hacia abajo
            }
            
            // Crear volumen en la parte superior
            if (y > 0.1) {
                positions.setY(i, y * 1.1);
            }
        }
        
        positions.needsUpdate = true;
        this.geometries.hair = hairGeometry;
    }
    
    createClothingGeometry() {
        // Vestimenta blanca futurista
        const clothingGeometry = new THREE.CylinderGeometry(0.16, 0.13, 0.85, 16);
        
        // Modificar para crear forma de ropa
        const positions = clothingGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            
            // Crear forma de vestido
            if (y < -0.3) {
                const radius = 0.13 + (0.16 - 0.13) * (1 - (y + 0.3) / 0.2);
                const angle = Math.atan2(positions.getZ(i), positions.getX(i));
                positions.setX(i, Math.cos(angle) * radius);
                positions.setZ(i, Math.sin(angle) * radius);
            }
        }
        
        positions.needsUpdate = true;
        this.geometries.clothing = clothingGeometry;
    }
    
    createSkinMaterial() {
        // Material de piel mediterránea clara
        this.materials.skin = new THREE.MeshPhongMaterial({
            color: 0xf4d4c4, // Tono mediterráneo claro
            shininess: 30,
            specular: 0x222222
        });
    }
    
    createHairMaterial() {
        // Material de cabello moreno
        this.materials.hair = new THREE.MeshPhongMaterial({
            color: 0x2d1810, // Moreno oscuro
            shininess: 50,
            specular: 0x444444
        });
    }
    
    createClothingMaterial() {
        // Material de vestimenta blanca futurista
        this.materials.clothing = new THREE.MeshPhongMaterial({
            color: 0xffffff, // Blanco
            shininess: 80,
            specular: 0x666666,
            transparent: true,
            opacity: 0.9
        });
    }
    
    createEyeMaterial() {
        // Material de ojos verdes intensos
        this.materials.eyes = new THREE.MeshPhongMaterial({
            color: 0x228b22, // Verde intenso
            shininess: 100,
            specular: 0xffffff,
            emissive: 0x114411
        });
    }
    
    assembleAvatar() {
        // Crear grupo principal del avatar
        this.avatar = new THREE.Group();
        
        // Cabeza
        const head = new THREE.Mesh(this.geometries.head, this.materials.skin);
        head.position.y = 0.4;
        this.avatar.add(head);
        
        // Ojos
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 16, 16),
            this.materials.eyes
        );
        leftEye.position.set(-0.08, 0.45, 0.22);
        this.avatar.add(leftEye);
        
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 16, 16),
            this.materials.eyes
        );
        rightEye.position.set(0.08, 0.45, 0.22);
        this.avatar.add(rightEye);
        
        // Cabello
        const hair = new THREE.Mesh(this.geometries.hair, this.materials.hair);
        hair.position.y = 0.4;
        this.avatar.add(hair);
        
        // Cuerpo
        const body = new THREE.Mesh(this.geometries.body, this.materials.skin);
        body.position.y = -0.2;
        this.avatar.add(body);
        
        // Vestimenta
        const clothing = new THREE.Mesh(this.geometries.clothing, this.materials.clothing);
        clothing.position.y = -0.2;
        this.avatar.add(clothing);
        
        // Configurar escala general
        this.avatar.scale.set(1, 1, 1);
    }
    
    setupAnimations() {
        // Animaciones básicas del avatar
        this.animations.idle = () => {
            // Movimiento sutil de respiración
            const time = Date.now() * 0.001;
            this.avatar.rotation.y = Math.sin(time * 0.5) * 0.1;
            this.avatar.position.y = Math.sin(time * 2) * 0.02;
        };
        
        this.animations.greeting = () => {
            // Saludo con la mano
            const time = Date.now() * 0.001;
            this.avatar.rotation.y = Math.sin(time * 2) * 0.3;
        };
        
        this.animations.thinking = () => {
            // Gestos de pensamiento
            const time = Date.now() * 0.001;
            this.avatar.rotation.x = Math.sin(time * 1.5) * 0.1;
        };
    }
    
    update(animationType = 'idle') {
        if (this.animations[animationType]) {
            this.animations[animationType]();
        }
    }
    
    getAvatar() {
        return this.avatar;
    }
    
    getSpecification() {
        return this.avatarSpec;
    }
}

// Exportar la clase
export default LucIAAvatar;
