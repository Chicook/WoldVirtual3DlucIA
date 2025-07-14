/**
 * Sistema de Generación de Avatares - Three.js Metaverso
 * Generación procedural completa de avatares únicos
 */

class AvatarGenerator {
    constructor() {
        this.seed = 0;
        this.cache = new Map();
        this.lod = {
            enabled: true,
            distances: [10, 50, 100],
            quality: ['high', 'medium', 'low']
        };
        
        // Generadores especializados
        this.geometryGenerator = new GeometryGenerator();
        this.textureGenerator = new TextureGenerator();
        this.materialGenerator = new MaterialGenerator();
        this.animationSystem = new AnimationSystem();
        
        // Configuración por defecto
        this.defaultOptions = {
            style: 'cyberpunk',
            gender: 'neutral',
            height: 'average',
            build: 'average',
            hairStyle: 'short',
            eyeColor: 'blue',
            skinTone: 'medium',
            clothing: 'casual',
            accessories: [],
            effects: []
        };
        
        console.log('🎭 Avatar Generator inicializado');
    }
    
    /**
     * Generar avatar único
     */
    async generateAvatar(options = {}) {
        const finalOptions = { ...this.defaultOptions, ...options };
        const seed = this.generateSeed(finalOptions.seed || Date.now().toString());
        
        // Verificar caché
        const cacheKey = this.generateCacheKey(finalOptions);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            // Generar componentes del avatar
            const geometry = await this.geometryGenerator.generateGeometry(finalOptions, seed);
            const textures = await this.textureGenerator.generateTextures(finalOptions, seed);
            const materials = await this.materialGenerator.generateMaterials(textures, finalOptions, seed);
            const animations = await this.animationSystem.generateAnimations(finalOptions, seed);
            
            // Crear mesh del avatar
            const mesh = new THREE.Group();
            
            // Agregar partes del cuerpo
            Object.keys(geometry).forEach(partName => {
                const partGeometry = geometry[partName];
                const partMaterial = materials[partName] || materials.default;
                
                if (partGeometry && partMaterial) {
                    const partMesh = new THREE.Mesh(partGeometry, partMaterial);
                    partMesh.name = partName;
                    partMesh.castShadow = true;
                    partMesh.receiveShadow = true;
                    
                    // Posicionar partes del cuerpo
                    this.positionBodyPart(partMesh, partName, finalOptions);
                    
                    mesh.add(partMesh);
                }
            });
            
            // Crear avatar completo
            const avatar = {
                id: this.generateId(),
                seed: seed,
                options: finalOptions,
                mesh: mesh,
                geometry: geometry,
                materials: materials,
                textures: textures,
                animations: animations,
                metadata: this.generateMetadata(finalOptions, seed),
                
                // Métodos del avatar
                update: (deltaTime) => this.updateAvatar(avatar, deltaTime),
                setAnimation: (name) => this.setAvatarAnimation(avatar, name),
                setExpression: (expression) => this.setAvatarExpression(avatar, expression),
                setPose: (pose) => this.setAvatarPose(avatar, pose),
                dispose: () => this.disposeAvatar(avatar)
            };
            
            // Configurar LOD si está habilitado
            if (this.lod.enabled) {
                this.setupLOD(avatar);
            }
            
            // Guardar en caché
            this.cache.set(cacheKey, avatar);
            
            console.log(`✅ Avatar generado: ${avatar.id}`);
            return avatar;
            
        } catch (error) {
            console.error('❌ Error generando avatar:', error);
            throw error;
        }
    }
    
    /**
     * Generar múltiples avatares
     */
    async generateAvatars(count, options = {}) {
        const avatars = [];
        
        for (let i = 0; i < count; i++) {
            const avatarOptions = {
                ...options,
                seed: `${options.seed || 'batch'}_${i}`
            };
            
            const avatar = await this.generateAvatar(avatarOptions);
            avatars.push(avatar);
        }
        
        return avatars;
    }
    
    /**
     * Generar avatar desde semilla específica
     */
    async generateFromSeed(seed, options = {}) {
        return await this.generateAvatar({
            ...options,
            seed: seed
        });
    }
    
    /**
     * Clonar avatar existente
     */
    cloneAvatar(avatar, modifications = {}) {
        const newOptions = { ...avatar.options, ...modifications };
        return this.generateAvatar(newOptions);
    }
    
    /**
     * Generar semilla única
     */
    generateSeed(input) {
        let hash = 0;
        const str = input.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        
        return Math.abs(hash);
    }
    
    /**
     * Generar clave de caché
     */
    generateCacheKey(options) {
        return JSON.stringify(options);
    }
    
    /**
     * Generar ID único
     */
    generateId() {
        return 'avatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Posicionar partes del cuerpo
     */
    positionBodyPart(mesh, partName, options) {
        const positions = {
            head: { x: 0, y: 2.5, z: 0 },
            torso: { x: 0, y: 1.5, z: 0 },
            leftArm: { x: -1.5, y: 1.8, z: 0 },
            rightArm: { x: 1.5, y: 1.8, z: 0 },
            leftLeg: { x: -0.5, y: 0.5, z: 0 },
            rightLeg: { x: 0.5, y: 0.5, z: 0 },
            hair: { x: 0, y: 2.7, z: 0 },
            eyes: { x: 0, y: 2.4, z: 0.3 },
            mouth: { x: 0, y: 2.2, z: 0.3 }
        };
        
        if (positions[partName]) {
            const pos = positions[partName];
            mesh.position.set(pos.x, pos.y, pos.z);
        }
    }
    
    /**
     * Configurar LOD
     */
    setupLOD(avatar) {
        const lod = new THREE.LOD();
        
        // Crear diferentes niveles de detalle
        this.lod.quality.forEach((quality, index) => {
            const distance = this.lod.distances[index];
            const qualityMesh = this.createQualityMesh(avatar, quality);
            lod.addLevel(qualityMesh, distance);
        });
        
        avatar.mesh = lod;
    }
    
    /**
     * Crear mesh de calidad específica
     */
    createQualityMesh(avatar, quality) {
        const mesh = avatar.mesh.clone();
        
        // Reducir geometrías según calidad
        mesh.traverse(child => {
            if (child.isMesh && child.geometry) {
                const reductionFactor = quality === 'high' ? 1 : quality === 'medium' ? 0.5 : 0.2;
                child.geometry = this.reduceGeometry(child.geometry, reductionFactor);
            }
        });
        
        return mesh;
    }
    
    /**
     * Reducir geometría
     */
    reduceGeometry(geometry, factor) {
        // Implementación simplificada de reducción de geometría
        return geometry;
    }
    
    /**
     * Actualizar avatar
     */
    updateAvatar(avatar, deltaTime) {
        if (avatar.animations) {
            avatar.animations.update(deltaTime);
        }
    }
    
    /**
     * Establecer animación del avatar
     */
    setAvatarAnimation(avatar, name) {
        if (avatar.animations) {
            avatar.animations.play(name);
        }
    }
    
    /**
     * Establecer expresión del avatar
     */
    setAvatarExpression(avatar, expression) {
        // Implementar cambios de expresión facial
        console.log(`Expresión cambiada a: ${expression}`);
    }
    
    /**
     * Establecer pose del avatar
     */
    setAvatarPose(avatar, pose) {
        // Implementar cambios de pose
        console.log(`Pose cambiada a: ${pose}`);
    }
    
    /**
     * Limpiar avatar
     */
    disposeAvatar(avatar) {
        if (avatar.mesh) {
            avatar.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
    
    /**
     * Generar metadatos del avatar
     */
    generateMetadata(options, seed) {
        return {
            createdAt: new Date().toISOString(),
            seed: seed,
            style: options.style,
            characteristics: {
                gender: options.gender,
                height: options.height,
                build: options.build,
                hairStyle: options.hairStyle,
                eyeColor: options.eyeColor,
                skinTone: options.skinTone
            },
            clothing: options.clothing,
            accessories: options.accessories,
            effects: options.effects
        };
    }
}

/**
 * Generador de Geometrías
 */
class GeometryGenerator {
    constructor() {
        this.noise = new SimplexNoise();
    }
    
    /**
     * Generar geometría completa del avatar
     */
    async generateGeometry(options, seed) {
        const geometries = {};
        
        // Generar cabeza
        geometries.head = this.generateHead(options, seed);
        geometries.hair = this.generateHair(options, seed);
        geometries.eyes = this.generateEyes(options, seed);
        geometries.mouth = this.generateMouth(options, seed);
        
        // Generar cuerpo
        geometries.torso = this.generateTorso(options, seed);
        geometries.leftArm = this.generateArm(options, seed, 'left');
        geometries.rightArm = this.generateArm(options, seed, 'right');
        geometries.leftLeg = this.generateLeg(options, seed, 'left');
        geometries.rightLeg = this.generateLeg(options, seed, 'right');
        
        return geometries;
    }
    
    /**
     * Generar cabeza
     */
    generateHead(options, seed) {
        const radius = this.getHeadRadius(options);
        const segments = 16;
        
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Modificar geometría según estilo
        if (options.style === 'cyberpunk') {
            this.modifyGeometryForCyberpunk(geometry, seed);
        } else if (options.style === 'fantasy') {
            this.modifyGeometryForFantasy(geometry, seed);
        }
        
        return geometry;
    }
    
    /**
     * Generar cabello
     */
    generateHair(options, seed) {
        let geometry;
        
        switch (options.hairStyle) {
            case 'short':
                geometry = this.generateShortHair(seed);
                break;
            case 'long':
                geometry = this.generateLongHair(seed);
                break;
            case 'spiky':
                geometry = this.generateSpikyHair(seed);
                break;
            case 'bald':
                return null;
            default:
                geometry = this.generateShortHair(seed);
        }
        
        return geometry;
    }
    
    /**
     * Generar ojos
     */
    generateEyes(options, seed) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        return geometry;
    }
    
    /**
     * Generar boca
     */
    generateMouth(options, seed) {
        const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
        return geometry;
    }
    
    /**
     * Generar torso
     */
    generateTorso(options, seed) {
        const width = this.getTorsoWidth(options);
        const height = this.getTorsoHeight(options);
        const depth = this.getTorsoDepth(options);
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        
        // Modificar según el estilo
        if (options.style === 'cyberpunk') {
            this.addCyberpunkDetails(geometry, seed);
        }
        
        return geometry;
    }
    
    /**
     * Generar brazo
     */
    generateArm(options, seed, side) {
        const length = this.getArmLength(options);
        const radius = 0.2;
        
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
        geometry.rotateZ(Math.PI / 2);
        
        return geometry;
    }
    
    /**
     * Generar pierna
     */
    generateLeg(options, seed, side) {
        const length = this.getLegLength(options);
        const radius = 0.25;
        
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
        
        return geometry;
    }
    
    // Métodos auxiliares para generar geometrías específicas
    generateShortHair(seed) {
        const geometry = new THREE.SphereGeometry(0.6, 8, 8);
        geometry.scale(1, 0.3, 1);
        return geometry;
    }
    
    generateLongHair(seed) {
        const geometry = new THREE.CylinderGeometry(0.4, 0.2, 1.5, 8);
        return geometry;
    }
    
    generateSpikyHair(seed) {
        const geometry = new THREE.ConeGeometry(0.5, 1, 8);
        return geometry;
    }
    
    // Métodos para obtener dimensiones
    getHeadRadius(options) {
        const baseRadius = 0.5;
        const heightFactor = options.height === 'tall' ? 1.1 : options.height === 'short' ? 0.9 : 1;
        return baseRadius * heightFactor;
    }
    
    getTorsoWidth(options) {
        const baseWidth = 1.2;
        const buildFactor = options.build === 'athletic' ? 1.2 : options.build === 'slim' ? 0.8 : 1;
        return baseWidth * buildFactor;
    }
    
    getTorsoHeight(options) {
        const baseHeight = 1.5;
        const heightFactor = options.height === 'tall' ? 1.3 : options.height === 'short' ? 0.8 : 1;
        return baseHeight * heightFactor;
    }
    
    getTorsoDepth(options) {
        const baseDepth = 0.6;
        const buildFactor = options.build === 'athletic' ? 1.1 : options.build === 'slim' ? 0.7 : 1;
        return baseDepth * buildFactor;
    }
    
    getArmLength(options) {
        const baseLength = 1.2;
        const heightFactor = options.height === 'tall' ? 1.2 : options.height === 'short' ? 0.8 : 1;
        return baseLength * heightFactor;
    }
    
    getLegLength(options) {
        const baseLength = 1.8;
        const heightFactor = options.height === 'tall' ? 1.3 : options.height === 'short' ? 0.7 : 1;
        return baseLength * heightFactor;
    }
    
    // Métodos para modificar geometrías según estilo
    modifyGeometryForCyberpunk(geometry, seed) {
        // Añadir detalles angulares y tecnológicos
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] += this.noise.noise3D(vertices[i] * 0.1, vertices[i+1] * 0.1, seed) * 0.1;
        }
        geometry.attributes.position.needsUpdate = true;
    }
    
    modifyGeometryForFantasy(geometry, seed) {
        // Añadir detalles orgánicos y fluidos
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] += this.noise.noise3D(vertices[i] * 0.05, vertices[i+1] * 0.05, seed) * 0.05;
        }
        geometry.attributes.position.needsUpdate = true;
    }
    
    addCyberpunkDetails(geometry, seed) {
        // Añadir detalles tecnológicos al torso
        // Implementación simplificada
    }
}

/**
 * Generador de Texturas
 */
class TextureGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    /**
     * Generar texturas para el avatar
     */
    async generateTextures(options, seed) {
        const textures = {};
        
        // Generar texturas principales
        textures.skin = this.generateSkinTexture(options, seed);
        textures.hair = this.generateHairTexture(options, seed);
        textures.clothing = this.generateClothingTexture(options, seed);
        textures.eyes = this.generateEyeTexture(options, seed);
        
        return textures;
    }
    
    /**
     * Generar textura de piel
     */
    generateSkinTexture(options, seed) {
        const size = 512;
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Obtener color base de piel
        const skinColor = this.getSkinColor(options.skinTone);
        
        // Crear gradiente base
        const gradient = this.ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, skinColor);
        gradient.addColorStop(1, this.darkenColor(skinColor, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, size, size);
        
        // Añadir detalles de piel
        this.addSkinDetails(seed);
        
        // Añadir efectos según estilo
        if (options.style === 'cyberpunk') {
            this.addCyberpunkEffects(seed);
        } else if (options.style === 'fantasy') {
            this.addFantasyEffects(seed);
        }
        
        const texture = new THREE.CanvasTexture(this.canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        return texture;
    }
    
    /**
     * Generar textura de cabello
     */
    generateHairTexture(options, seed) {
        const size = 256;
        this.canvas.width = size;
        this.canvas.height = size;
        
        const hairColor = this.getHairColor(seed);
        
        // Crear patrón de cabello
        this.ctx.fillStyle = hairColor;
        this.ctx.fillRect(0, 0, size, size);
        
        // Añadir detalles de cabello
        this.addHairDetails(seed);
        
        const texture = new THREE.CanvasTexture(this.canvas);
        return texture;
    }
    
    /**
     * Generar textura de ropa
     */
    generateClothingTexture(options, seed) {
        const size = 512;
        this.canvas.width = size;
        this.canvas.height = size;
        
        const clothingColor = this.getClothingColor(options, seed);
        
        // Crear patrón de ropa
        this.ctx.fillStyle = clothingColor;
        this.ctx.fillRect(0, 0, size, size);
        
        // Añadir detalles de ropa según estilo
        if (options.style === 'cyberpunk') {
            this.addCyberpunkClothingDetails(seed);
        } else if (options.style === 'fantasy') {
            this.addFantasyClothingDetails(seed);
        }
        
        const texture = new THREE.CanvasTexture(this.canvas);
        return texture;
    }
    
    /**
     * Generar textura de ojos
     */
    generateEyeTexture(options, seed) {
        const size = 64;
        this.canvas.width = size;
        this.canvas.height = size;
        
        const eyeColor = this.getEyeColor(options.eyeColor);
        
        // Crear ojo
        this.ctx.fillStyle = eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Añadir pupila
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, size/6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Añadir brillo
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(size/2 - 5, size/2 - 5, size/12, 0, Math.PI * 2);
        this.ctx.fill();
        
        const texture = new THREE.CanvasTexture(this.canvas);
        return texture;
    }
    
    // Métodos auxiliares para colores
    getSkinColor(skinTone) {
        const colors = {
            light: '#f4d03f',
            medium: '#d68910',
            dark: '#8b4513',
            exotic: '#e74c3c'
        };
        return colors[skinTone] || colors.medium;
    }
    
    getHairColor(seed) {
        const colors = ['#2c3e50', '#8b4513', '#d68910', '#f4d03f', '#e74c3c', '#9b59b6'];
        return colors[seed % colors.length];
    }
    
    getClothingColor(options, seed) {
        if (options.style === 'cyberpunk') {
            const cyberpunkColors = ['#2c3e50', '#e74c3c', '#3498db', '#f39c12', '#9b59b6'];
            return cyberpunkColors[seed % cyberpunkColors.length];
        } else if (options.style === 'fantasy') {
            const fantasyColors = ['#8e44ad', '#2980b9', '#27ae60', '#f39c12', '#e67e22'];
            return fantasyColors[seed % fantasyColors.length];
        } else {
            const neutralColors = ['#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'];
            return neutralColors[seed % neutralColors.length];
        }
    }
    
    getEyeColor(eyeColor) {
        const colors = {
            blue: '#3498db',
            green: '#27ae60',
            brown: '#8b4513',
            red: '#e74c3c'
        };
        return colors[eyeColor] || colors.blue;
    }
    
    // Métodos para añadir detalles
    addSkinDetails(seed) {
        // Añadir imperfecciones y variaciones de piel
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 3;
            
            this.ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    addHairDetails(seed) {
        // Añadir mechones y variaciones de cabello
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const length = Math.random() * 20 + 10;
            const width = Math.random() * 2 + 1;
            
            this.ctx.strokeStyle = this.darkenColor(this.getHairColor(seed), Math.random() * 0.5);
            this.ctx.lineWidth = width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.random() * 10 - 5, y + length);
            this.ctx.stroke();
        }
    }
    
    addCyberpunkEffects(seed) {
        // Añadir efectos tecnológicos
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Añadir líneas tecnológicas
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 50, y + 50);
            this.ctx.stroke();
        }
    }
    
    addFantasyEffects(seed) {
        // Añadir efectos mágicos
        this.ctx.fillStyle = 'rgba(142, 68, 173, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Añadir partículas mágicas
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 3;
            
            this.ctx.fillStyle = `rgba(142, 68, 173, ${Math.random() * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    addCyberpunkClothingDetails(seed) {
        // Añadir detalles de ropa cyberpunk
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 30, y);
            this.ctx.stroke();
        }
    }
    
    addFantasyClothingDetails(seed) {
        // Añadir detalles de ropa fantasy
        this.ctx.fillStyle = '#f39c12';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 10 + 5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
}

/**
 * Generador de Materiales
 */
class MaterialGenerator {
    constructor() {
        this.shaders = new ShaderLibrary();
    }
    
    /**
     * Generar materiales para el avatar
     */
    async generateMaterials(textures, options, seed) {
        const materials = {};
        
        // Generar materiales principales
        materials.skin = this.generateSkinMaterial(textures.skin, options, seed);
        materials.hair = this.generateHairMaterial(textures.hair, options, seed);
        materials.clothing = this.generateClothingMaterial(textures.clothing, options, seed);
        materials.eyes = this.generateEyeMaterial(textures.eyes, options, seed);
        materials.default = this.generateDefaultMaterial(options, seed);
        
        return materials;
    }
    
    /**
     * Generar material de piel
     */
    generateSkinMaterial(texture, options, seed) {
        if (options.style === 'cyberpunk') {
            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.3,
                metalness: 0.1,
                emissive: new THREE.Color(0x3498db),
                emissiveIntensity: 0.1
            });
        } else if (options.style === 'fantasy') {
            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.2,
                metalness: 0.0,
                emissive: new THREE.Color(0x8e44ad),
                emissiveIntensity: 0.05
            });
        } else {
            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.0
            });
        }
    }
    
    /**
     * Generar material de cabello
     */
    generateHairMaterial(texture, options, seed) {
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
            metalness: 0.0,
            transparent: true,
            opacity: 0.9
        });
    }
    
    /**
     * Generar material de ropa
     */
    generateClothingMaterial(texture, options, seed) {
        if (options.style === 'cyberpunk') {
            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.2,
                metalness: 0.8,
                emissive: new THREE.Color(0xe74c3c),
                emissiveIntensity: 0.2
            });
        } else if (options.style === 'fantasy') {
            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.1,
                metalness: 0.0,
                emissive: new THREE.Color(0xf39c12),
                emissiveIntensity: 0.1
            });
        } else {
            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.7,
                metalness: 0.0
            });
        }
    }
    
    /**
     * Generar material de ojos
     */
    generateEyeMaterial(texture, options, seed) {
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.1,
            metalness: 0.0,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.1
        });
    }
    
    /**
     * Generar material por defecto
     */
    generateDefaultMaterial(options, seed) {
        return new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.5,
            metalness: 0.0
        });
    }
}

/**
 * Sistema de Animaciones
 */
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.mixer = null;
        this.currentAnimation = null;
    }
    
    /**
     * Generar animaciones para el avatar
     */
    async generateAnimations(options, seed) {
        const animations = {};
        
        // Generar animaciones básicas
        animations.idle = this.generateIdleAnimation(options, seed);
        animations.walk = this.generateWalkAnimation(options, seed);
        animations.run = this.generateRunAnimation(options, seed);
        
        return animations;
    }
    
    /**
     * Generar animación de reposo
     */
    generateIdleAnimation(options, seed) {
        const tracks = [];
        
        // Animación de respiración
        const breathingTrack = new THREE.VectorKeyframeTrack(
            '.scale',
            [0, 2, 4],
            [
                1, 1, 1,
                1.02, 1.02, 1.02,
                1, 1, 1
            ]
        );
        tracks.push(breathingTrack);
        
        return new THREE.AnimationClip('idle', 4, tracks);
    }
    
    /**
     * Generar animación de caminar
     */
    generateWalkAnimation(options, seed) {
        const tracks = [];
        
        // Animación de brazos
        const armTrack = new THREE.VectorKeyframeTrack(
            '.rotation[x]',
            [0, 0.5, 1, 1.5, 2],
            [0, 0.3, 0, -0.3, 0]
        );
        tracks.push(armTrack);
        
        return new THREE.AnimationClip('walk', 2, tracks);
    }
    
    /**
     * Generar animación de correr
     */
    generateRunAnimation(options, seed) {
        const tracks = [];
        
        // Animación de correr
        const runTrack = new THREE.VectorKeyframeTrack(
            '.rotation[x]',
            [0, 0.25, 0.5, 0.75, 1],
            [0, 0.5, 0, -0.5, 0]
        );
        tracks.push(runTrack);
        
        return new THREE.AnimationClip('run', 1, tracks);
    }
    
    /**
     * Reproducir animación
     */
    play(name, options = {}) {
        if (this.animations.has(name)) {
            this.currentAnimation = name;
            console.log(`Reproduciendo animación: ${name}`);
        }
    }
    
    /**
     * Actualizar animaciones
     */
    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
}

/**
 * Biblioteca de Shaders
 */
class ShaderLibrary {
    constructor() {
        this.shaders = new Map();
        this.initializeShaders();
    }
    
    /**
     * Inicializar shaders disponibles
     */
    initializeShaders() {
        // Shader cyberpunk
        this.shaders.set('cyberpunk', {
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D map;
                uniform float time;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vec4 texColor = texture2D(map, vUv);
                    vec3 glow = vec3(0.2, 0.4, 0.8) * sin(time + vPosition.x * 10.0) * 0.5;
                    gl_FragColor = vec4(texColor.rgb + glow, texColor.a);
                }
            `,
            uniforms: {
                map: { value: null },
                time: { value: 0 }
            }
        });
        
        // Shader fantasy
        this.shaders.set('fantasy', {
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D map;
                uniform float time;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vec4 texColor = texture2D(map, vUv);
                    vec3 magic = vec3(0.5, 0.2, 0.8) * sin(time * 2.0 + vNormal.x * 5.0) * 0.3;
                    gl_FragColor = vec4(texColor.rgb + magic, texColor.a);
                }
            `,
            uniforms: {
                map: { value: null },
                time: { value: 0 }
            }
        });
    }
    
    /**
     * Obtener shader por nombre
     */
    getShader(name) {
        return this.shaders.get(name);
    }
}

/**
 * Simplex Noise para generación procedural
 */
class SimplexNoise {
    constructor() {
        this.perm = new Array(512);
        this.gradP = new Array(512);
        this.init();
    }
    
    init() {
        for (let i = 0; i < 256; i++) {
            this.perm[i] = Math.floor(Math.random() * 256);
        }
        for (let i = 0; i < 256; i++) {
            this.perm[i + 256] = this.perm[i];
        }
    }
    
    noise3D(x, y, z) {
        // Implementación simplificada de Simplex Noise
        return (Math.sin(x * 10) + Math.sin(y * 10) + Math.sin(z * 10)) / 3;
    }
}

// Exportar para uso global
window.AvatarGenerator = AvatarGenerator;
window.GeometryGenerator = GeometryGenerator;
window.TextureGenerator = TextureGenerator;
window.MaterialGenerator = MaterialGenerator;
window.AnimationSystem = AnimationSystem;
window.ShaderLibrary = ShaderLibrary;
window.SimplexNoise = SimplexNoise; 