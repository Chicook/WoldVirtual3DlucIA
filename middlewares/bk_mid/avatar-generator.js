/**
 * Generador de Avatares Humanos 3D para Metaverso
 * Sistema modular para crear y personalizar avatares humanos
 */

import * as THREE from 'three';

class AvatarGenerator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatar = null;
        this.animations = {};
        this.materials = {};
        this.textures = {};
        this.controls = null;
        
        // Configuración del avatar
        this.config = {
            gender: 'male',
            height: 1.8,
            build: 'average', // slim, average, athletic, heavy
            skinTone: 'medium',
            hairStyle: 'short',
            hairColor: 'brown',
            eyeColor: 'brown',
            clothing: 'casual',
            accessories: []
        };

        // Geometrías base
        this.geometries = {
            head: null,
            body: null,
            arms: null,
            legs: null,
            hands: null,
            feet: null
        };

        // Huesos del esqueleto
        this.skeleton = {
            root: null,
            spine: [],
            arms: [],
            legs: [],
            head: null
        };

        this.init();
    }

    /**
     * Inicializar el generador de avatares
     */
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.createBaseGeometries();
        this.createMaterials();
        this.createAvatar();
        this.setupAnimations();
    }

    /**
     * Configurar escena
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Cielo azul
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    }

    /**
     * Configurar cámara
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 3);
        this.camera.lookAt(0, 1.6, 0);
    }

    /**
     * Configurar renderizador
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    /**
     * Configurar iluminación
     */
    setupLights() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direccional principal (sol)
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

        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Luz de acento
        const accentLight = new THREE.PointLight(0xffa500, 0.5, 10);
        accentLight.position.set(0, 3, 2);
        this.scene.add(accentLight);
    }

    /**
     * Configurar controles
     */
    setupControls() {
        // Controles de órbita para rotar alrededor del avatar
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    /**
     * Crear geometrías base
     */
    createBaseGeometries() {
        // Cabeza
        this.geometries.head = new THREE.SphereGeometry(0.25, 32, 32);
        
        // Cuerpo (torso)
        this.geometries.body = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 16);
        
        // Brazos
        this.geometries.arms = {
            upperArm: new THREE.CylinderGeometry(0.08, 0.07, 0.4, 12),
            forearm: new THREE.CylinderGeometry(0.07, 0.06, 0.35, 12),
            hand: new THREE.BoxGeometry(0.12, 0.08, 0.25)
        };
        
        // Piernas
        this.geometries.legs = {
            thigh: new THREE.CylinderGeometry(0.12, 0.1, 0.5, 12),
            calf: new THREE.CylinderGeometry(0.1, 0.08, 0.45, 12),
            foot: new THREE.BoxGeometry(0.25, 0.1, 0.3)
        };
        
        // Manos
        this.geometries.hands = new THREE.BoxGeometry(0.12, 0.08, 0.25);
        
        // Pies
        this.geometries.feet = new THREE.BoxGeometry(0.25, 0.1, 0.3);
    }

    /**
     * Crear materiales
     */
    createMaterials() {
        // Materiales de piel
        this.materials.skin = {
            light: new THREE.MeshLambertMaterial({ color: 0xFFDBB4 }),
            medium: new THREE.MeshLambertMaterial({ color: 0xE6B17A }),
            dark: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            veryDark: new THREE.MeshLambertMaterial({ color: 0x654321 })
        };

        // Materiales de cabello
        this.materials.hair = {
            black: new THREE.MeshLambertMaterial({ color: 0x000000 }),
            brown: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            blonde: new THREE.MeshLambertMaterial({ color: 0xFFD700 }),
            red: new THREE.MeshLambertMaterial({ color: 0x8B0000 }),
            gray: new THREE.MeshLambertMaterial({ color: 0x808080 }),
            white: new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
        };

        // Materiales de ropa
        this.materials.clothing = {
            casual: {
                shirt: new THREE.MeshLambertMaterial({ color: 0x4169E1 }),
                pants: new THREE.MeshLambertMaterial({ color: 0x2F4F4F }),
                shoes: new THREE.MeshLambertMaterial({ color: 0x000000 })
            },
            formal: {
                shirt: new THREE.MeshLambertMaterial({ color: 0xFFFFFF }),
                pants: new THREE.MeshLambertMaterial({ color: 0x000000 }),
                shoes: new THREE.MeshLambertMaterial({ color: 0x000000 })
            },
            sport: {
                shirt: new THREE.MeshLambertMaterial({ color: 0xFF4500 }),
                pants: new THREE.MeshLambertMaterial({ color: 0x000000 }),
                shoes: new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
            }
        };

        // Materiales de ojos
        this.materials.eyes = {
            brown: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            blue: new THREE.MeshLambertMaterial({ color: 0x4169E1 }),
            green: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
            hazel: new THREE.MeshLambertMaterial({ color: 0xCD853F })
        };
    }

    /**
     * Crear avatar completo
     */
    createAvatar() {
        this.avatar = new THREE.Group();
        this.avatar.name = 'Avatar';

        // Crear esqueleto
        this.createSkeleton();
        
        // Crear partes del cuerpo
        this.createHead();
        this.createBody();
        this.createArms();
        this.createLegs();
        this.createClothing();
        this.createAccessories();

        this.scene.add(this.avatar);
    }

    /**
     * Crear esqueleto del avatar
     */
    createSkeleton() {
        // Grupo raíz
        this.skeleton.root = new THREE.Group();
        this.skeleton.root.position.y = 0;
        this.avatar.add(this.skeleton.root);

        // Columna vertebral
        for (let i = 0; i < 5; i++) {
            const spineBone = new THREE.Group();
            spineBone.position.y = i * 0.2;
            this.skeleton.spine.push(spineBone);
            if (i === 0) {
                this.skeleton.root.add(spineBone);
            } else {
                this.skeleton.spine[i - 1].add(spineBone);
            }
        }

        // Cabeza
        this.skeleton.head = new THREE.Group();
        this.skeleton.head.position.y = 0.2;
        this.skeleton.spine[4].add(this.skeleton.head);

        // Brazos
        this.skeleton.arms = {
            left: {
                shoulder: new THREE.Group(),
                upperArm: new THREE.Group(),
                forearm: new THREE.Group(),
                hand: new THREE.Group()
            },
            right: {
                shoulder: new THREE.Group(),
                upperArm: new THREE.Group(),
                forearm: new THREE.Group(),
                hand: new THREE.Group()
            }
        };

        // Configurar brazos
        this.skeleton.arms.left.shoulder.position.set(-0.4, 0.1, 0);
        this.skeleton.arms.right.shoulder.position.set(0.4, 0.1, 0);
        this.skeleton.spine[3].add(this.skeleton.arms.left.shoulder);
        this.skeleton.spine[3].add(this.skeleton.arms.right.shoulder);

        this.skeleton.arms.left.upperArm.position.y = -0.2;
        this.skeleton.arms.right.upperArm.position.y = -0.2;
        this.skeleton.arms.left.shoulder.add(this.skeleton.arms.left.upperArm);
        this.skeleton.arms.right.shoulder.add(this.skeleton.arms.right.upperArm);

        this.skeleton.arms.left.forearm.position.y = -0.2;
        this.skeleton.arms.right.forearm.position.y = -0.2;
        this.skeleton.arms.left.upperArm.add(this.skeleton.arms.left.forearm);
        this.skeleton.arms.right.upperArm.add(this.skeleton.arms.right.forearm);

        this.skeleton.arms.left.hand.position.y = -0.175;
        this.skeleton.arms.right.hand.position.y = -0.175;
        this.skeleton.arms.left.forearm.add(this.skeleton.arms.left.hand);
        this.skeleton.arms.right.forearm.add(this.skeleton.arms.right.hand);

        // Piernas
        this.skeleton.legs = {
            left: {
                hip: new THREE.Group(),
                thigh: new THREE.Group(),
                calf: new THREE.Group(),
                foot: new THREE.Group()
            },
            right: {
                hip: new THREE.Group(),
                thigh: new THREE.Group(),
                calf: new THREE.Group(),
                foot: new THREE.Group()
            }
        };

        // Configurar piernas
        this.skeleton.legs.left.hip.position.set(-0.15, -0.4, 0);
        this.skeleton.legs.right.hip.position.set(0.15, -0.4, 0);
        this.skeleton.root.add(this.skeleton.legs.left.hip);
        this.skeleton.root.add(this.skeleton.legs.right.hip);

        this.skeleton.legs.left.thigh.position.y = -0.25;
        this.skeleton.legs.right.thigh.position.y = -0.25;
        this.skeleton.legs.left.hip.add(this.skeleton.legs.left.thigh);
        this.skeleton.legs.right.hip.add(this.skeleton.legs.right.thigh);

        this.skeleton.legs.left.calf.position.y = -0.25;
        this.skeleton.legs.right.calf.position.y = -0.25;
        this.skeleton.legs.left.thigh.add(this.skeleton.legs.left.calf);
        this.skeleton.legs.right.thigh.add(this.skeleton.legs.right.calf);

        this.skeleton.legs.left.foot.position.y = -0.225;
        this.skeleton.legs.right.foot.position.y = -0.225;
        this.skeleton.legs.left.calf.add(this.skeleton.legs.left.foot);
        this.skeleton.legs.right.calf.add(this.skeleton.legs.right.foot);
    }

    /**
     * Crear cabeza del avatar
     */
    createHead() {
        // Cabeza base
        const headMesh = new THREE.Mesh(
            this.geometries.head,
            this.materials.skin[this.config.skinTone]
        );
        headMesh.castShadow = true;
        headMesh.receiveShadow = true;
        this.skeleton.head.add(headMesh);

        // Ojos
        this.createEyes();

        // Nariz
        this.createNose();

        // Boca
        this.createMouth();

        // Orejas
        this.createEars();

        // Cabello
        this.createHair();
    }

    /**
     * Crear ojos
     */
    createEyes() {
        const eyeGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const eyeMaterial = this.materials.eyes[this.config.eyeColor];

        // Ojo izquierdo
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 0.05, 0.2);
        this.skeleton.head.add(leftEye);

        // Ojo derecho
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 0.05, 0.2);
        this.skeleton.head.add(rightEye);

        // Pupilas
        const pupilGeometry = new THREE.SphereGeometry(0.015, 16, 16);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(0, 0, 0.015);
        leftEye.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0, 0, 0.015);
        rightEye.add(rightPupil);
    }

    /**
     * Crear nariz
     */
    createNose() {
        const noseGeometry = new THREE.ConeGeometry(0.02, 0.05, 8);
        const noseMaterial = this.materials.skin[this.config.skinTone];
        
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0, 0.25);
        nose.rotation.x = Math.PI / 2;
        this.skeleton.head.add(nose);
    }

    /**
     * Crear boca
     */
    createMouth() {
        const mouthGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.1, 0.24);
        this.skeleton.head.add(mouth);
    }

    /**
     * Crear orejas
     */
    createEars() {
        const earGeometry = new THREE.BoxGeometry(0.02, 0.06, 0.03);
        const earMaterial = this.materials.skin[this.config.skinTone];

        // Oreja izquierda
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.25, 0, 0);
        this.skeleton.head.add(leftEar);

        // Oreja derecha
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.25, 0, 0);
        this.skeleton.head.add(rightEar);
    }

    /**
     * Crear cabello
     */
    createHair() {
        const hairMaterial = this.materials.hair[this.config.hairColor];
        
        switch (this.config.hairStyle) {
            case 'short':
                this.createShortHair(hairMaterial);
                break;
            case 'long':
                this.createLongHair(hairMaterial);
                break;
            case 'curly':
                this.createCurlyHair(hairMaterial);
                break;
            case 'bald':
                // No crear cabello
                break;
            default:
                this.createShortHair(hairMaterial);
        }
    }

    /**
     * Crear cabello corto
     */
    createShortHair(hairMaterial) {
        const hairGeometry = new THREE.SphereGeometry(0.26, 16, 16);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.01;
        hair.scale.y = 0.8;
        this.skeleton.head.add(hair);
    }

    /**
     * Crear cabello largo
     */
    createLongHair(hairMaterial) {
        // Cabello superior
        const topHairGeometry = new THREE.SphereGeometry(0.26, 16, 16);
        const topHair = new THREE.Mesh(topHairGeometry, hairMaterial);
        topHair.position.y = 0.01;
        topHair.scale.y = 0.8;
        this.skeleton.head.add(topHair);

        // Cabello largo
        const longHairGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.6, 16);
        const longHair = new THREE.Mesh(longHairGeometry, hairMaterial);
        longHair.position.y = -0.3;
        this.skeleton.head.add(longHair);
    }

    /**
     * Crear cabello rizado
     */
    createCurlyHair(hairMaterial) {
        const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.01;
        hair.scale.y = 0.9;
        this.skeleton.head.add(hair);
    }

    /**
     * Crear cuerpo
     */
    createBody() {
        const bodyMesh = new THREE.Mesh(
            this.geometries.body,
            this.materials.skin[this.config.skinTone]
        );
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.skeleton.spine[2].add(bodyMesh);
    }

    /**
     * Crear brazos
     */
    createArms() {
        // Brazos izquierdos
        this.createArm('left');
        
        // Brazos derechos
        this.createArm('right');
    }

    /**
     * Crear un brazo
     */
    createArm(side) {
        const arm = this.skeleton.arms[side];
        
        // Brazo superior
        const upperArmMesh = new THREE.Mesh(
            this.geometries.arms.upperArm,
            this.materials.skin[this.config.skinTone]
        );
        upperArmMesh.castShadow = true;
        upperArmMesh.receiveShadow = true;
        arm.upperArm.add(upperArmMesh);

        // Antebrazo
        const forearmMesh = new THREE.Mesh(
            this.geometries.arms.forearm,
            this.materials.skin[this.config.skinTone]
        );
        forearmMesh.castShadow = true;
        forearmMesh.receiveShadow = true;
        arm.forearm.add(forearmMesh);

        // Mano
        const handMesh = new THREE.Mesh(
            this.geometries.arms.hand,
            this.materials.skin[this.config.skinTone]
        );
        handMesh.castShadow = true;
        handMesh.receiveShadow = true;
        arm.hand.add(handMesh);
    }

    /**
     * Crear piernas
     */
    createLegs() {
        // Pierna izquierda
        this.createLeg('left');
        
        // Pierna derecha
        this.createLeg('right');
    }

    /**
     * Crear una pierna
     */
    createLeg(side) {
        const leg = this.skeleton.legs[side];
        
        // Muslo
        const thighMesh = new THREE.Mesh(
            this.geometries.legs.thigh,
            this.materials.skin[this.config.skinTone]
        );
        thighMesh.castShadow = true;
        thighMesh.receiveShadow = true;
        leg.thigh.add(thighMesh);

        // Pantorrilla
        const calfMesh = new THREE.Mesh(
            this.geometries.legs.calf,
            this.materials.skin[this.config.skinTone]
        );
        calfMesh.castShadow = true;
        calfMesh.receiveShadow = true;
        leg.calf.add(calfMesh);

        // Pie
        const footMesh = new THREE.Mesh(
            this.geometries.legs.foot,
            this.materials.skin[this.config.skinTone]
        );
        footMesh.castShadow = true;
        footMesh.receiveShadow = true;
        leg.foot.add(footMesh);
    }

    /**
     * Crear ropa
     */
    createClothing() {
        const clothing = this.materials.clothing[this.config.clothing];
        
        // Camisa
        this.createShirt(clothing.shirt);
        
        // Pantalones
        this.createPants(clothing.pants);
        
        // Zapatos
        this.createShoes(clothing.shoes);
    }

    /**
     * Crear camisa
     */
    createShirt(material) {
        const shirtGeometry = new THREE.CylinderGeometry(0.32, 0.28, 0.6, 16);
        const shirt = new THREE.Mesh(shirtGeometry, material);
        shirt.position.y = 0.1;
        shirt.castShadow = true;
        shirt.receiveShadow = true;
        this.skeleton.spine[2].add(shirt);
    }

    /**
     * Crear pantalones
     */
    createPants(material) {
        const pantsGeometry = new THREE.CylinderGeometry(0.28, 0.25, 0.8, 16);
        const pants = new THREE.Mesh(pantsGeometry, material);
        pants.position.y = -0.2;
        pants.castShadow = true;
        pants.receiveShadow = true;
        this.skeleton.root.add(pants);
    }

    /**
     * Crear zapatos
     */
    createShoes(material) {
        const shoeGeometry = new THREE.BoxGeometry(0.28, 0.12, 0.35);
        
        // Zapato izquierdo
        const leftShoe = new THREE.Mesh(shoeGeometry, material);
        leftShoe.position.set(-0.15, -0.35, 0.025);
        leftShoe.castShadow = true;
        leftShoe.receiveShadow = true;
        this.skeleton.legs.left.foot.add(leftShoe);

        // Zapato derecho
        const rightShoe = new THREE.Mesh(shoeGeometry, material);
        rightShoe.position.set(0.15, -0.35, 0.025);
        rightShoe.castShadow = true;
        rightShoe.receiveShadow = true;
        this.skeleton.legs.right.foot.add(rightShoe);
    }

    /**
     * Crear accesorios
     */
    createAccessories() {
        this.config.accessories.forEach(accessory => {
            switch (accessory) {
                case 'glasses':
                    this.createGlasses();
                    break;
                case 'hat':
                    this.createHat();
                    break;
                case 'watch':
                    this.createWatch();
                    break;
                case 'necklace':
                    this.createNecklace();
                    break;
            }
        });
    }

    /**
     * Crear gafas
     */
    createGlasses() {
        const frameGeometry = new THREE.TorusGeometry(0.08, 0.01, 8, 16);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        // Marco izquierdo
        const leftFrame = new THREE.Mesh(frameGeometry, frameMaterial);
        leftFrame.position.set(-0.08, 0.05, 0.22);
        leftFrame.rotation.y = Math.PI / 2;
        this.skeleton.head.add(leftFrame);

        // Marco derecho
        const rightFrame = new THREE.Mesh(frameGeometry, frameMaterial);
        rightFrame.position.set(0.08, 0.05, 0.22);
        rightFrame.rotation.y = Math.PI / 2;
        this.skeleton.head.add(rightFrame);

        // Puente
        const bridgeGeometry = new THREE.BoxGeometry(0.16, 0.01, 0.01);
        const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
        bridge.position.set(0, 0.05, 0.22);
        this.skeleton.head.add(bridge);
    }

    /**
     * Crear sombrero
     */
    createHat() {
        const hatGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 16);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 0.35;
        hat.castShadow = true;
        this.skeleton.head.add(hat);
    }

    /**
     * Crear reloj
     */
    createWatch() {
        const watchGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
        const watchMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
        
        const watch = new THREE.Mesh(watchGeometry, watchMaterial);
        watch.position.set(0.12, -0.1, 0);
        watch.rotation.z = Math.PI / 2;
        this.skeleton.arms.left.forearm.add(watch);
    }

    /**
     * Crear collar
     */
    createNecklace() {
        const necklaceGeometry = new THREE.TorusGeometry(0.15, 0.01, 8, 16);
        const necklaceMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        
        const necklace = new THREE.Mesh(necklaceGeometry, necklaceMaterial);
        necklace.position.y = 0.3;
        necklace.rotation.x = Math.PI / 2;
        this.skeleton.spine[3].add(necklace);
    }

    /**
     * Configurar animaciones
     */
    setupAnimations() {
        // Animación de respiración
        this.animations.breathing = {
            duration: 2000,
            startTime: Date.now(),
            amplitude: 0.02
        };

        // Animación de parpadeo
        this.animations.blinking = {
            duration: 3000,
            startTime: Date.now(),
            blinkDuration: 150
        };

        // Animación de movimiento sutil
        this.animations.idle = {
            duration: 4000,
            startTime: Date.now(),
            amplitude: 0.01
        };
    }

    /**
     * Actualizar animaciones
     */
    updateAnimations() {
        const currentTime = Date.now();

        // Animación de respiración
        const breathing = this.animations.breathing;
        const breathingTime = (currentTime - breathing.startTime) % breathing.duration;
        const breathingProgress = (breathingTime / breathing.duration) * Math.PI * 2;
        const breathingOffset = Math.sin(breathingProgress) * breathing.amplitude;
        
        this.skeleton.spine[2].scale.y = 1 + breathingOffset;

        // Animación de parpadeo
        const blinking = this.animations.blinking;
        const blinkingTime = (currentTime - blinking.startTime) % blinking.duration;
        if (blinkingTime < blinking.blinkDuration) {
            // Cerrar ojos (simplificado)
            this.skeleton.head.children.forEach(child => {
                if (child.name === 'eye') {
                    child.scale.y = 0.1;
                }
            });
        } else {
            // Abrir ojos
            this.skeleton.head.children.forEach(child => {
                if (child.name === 'eye') {
                    child.scale.y = 1;
                }
            });
        }

        // Animación de movimiento sutil
        const idle = this.animations.idle;
        const idleTime = (currentTime - idle.startTime) % idle.duration;
        const idleProgress = (idleTime / idle.duration) * Math.PI * 2;
        const idleOffset = Math.sin(idleProgress) * idle.amplitude;
        
        this.skeleton.root.rotation.y = idleOffset;
    }

    /**
     * Personalizar avatar
     */
    customize(config) {
        this.config = { ...this.config, ...config };
        this.recreateAvatar();
    }

    /**
     * Recrear avatar con nueva configuración
     */
    recreateAvatar() {
        // Remover avatar actual
        if (this.avatar) {
            this.scene.remove(this.avatar);
        }

        // Crear nuevo avatar
        this.createAvatar();
    }

    /**
     * Obtener configuración actual
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Exportar avatar como JSON
     */
    exportAvatar() {
        return {
            config: this.config,
            position: this.avatar.position.toArray(),
            rotation: this.avatar.rotation.toArray(),
            scale: this.avatar.scale.toArray()
        };
    }

    /**
     * Importar avatar desde JSON
     */
    importAvatar(data) {
        this.config = data.config;
        this.recreateAvatar();
        
        if (data.position) {
            this.avatar.position.fromArray(data.position);
        }
        if (data.rotation) {
            this.avatar.rotation.fromArray(data.rotation);
        }
        if (data.scale) {
            this.avatar.scale.fromArray(data.scale);
        }
    }

    /**
     * Renderizar escena
     */
    render() {
        this.updateAnimations();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Obtener elemento DOM del renderizador
     */
    getDomElement() {
        return this.renderer.domElement;
    }

    /**
     * Manejar cambio de tamaño de ventana
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
        this.renderer.dispose();
        this.controls.dispose();
        
        // Limpiar geometrías
        Object.values(this.geometries).forEach(geometry => {
            if (geometry) {
                if (typeof geometry === 'object' && geometry !== null) {
                    Object.values(geometry).forEach(geo => {
                        if (geo && geo.dispose) geo.dispose();
                    });
                } else if (geometry.dispose) {
                    geometry.dispose();
                }
            }
        });

        // Limpiar materiales
        Object.values(this.materials).forEach(materialGroup => {
            if (typeof materialGroup === 'object' && materialGroup !== null) {
                Object.values(materialGroup).forEach(material => {
                    if (material && material.dispose) material.dispose();
                });
            }
        });
    }
}

// Exportar para uso modular
export default AvatarGenerator;

// Funciones globales para integración
window.AvatarGenerator = AvatarGenerator;
window.createAvatar = (container, config = {}) => {
    const generator = new AvatarGenerator();
    if (config) {
        generator.customize(config);
    }
    container.appendChild(generator.getDomElement());
    return generator;
}; 