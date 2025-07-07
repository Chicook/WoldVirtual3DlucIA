/**
 * Sistema Aleatorio Avanzado para Generación de Avatares
 * Algoritmos de generación procedural y aleatorización inteligente
 */

class AvatarRandomizer {
    constructor() {
        this.seed = Date.now();
        this.rng = null;
        this.templates = new Map();
        this.variations = new Map();
        this.constraints = new Map();
        this.patterns = new Map();
        
        this.init();
    }

    /**
     * Inicializar randomizador
     */
    init() {
        this.setSeed(this.seed);
        this.createTemplates();
        this.createVariations();
        this.createConstraints();
        this.createPatterns();
    }

    /**
     * Establecer semilla para generación reproducible
     */
    setSeed(seed) {
        this.seed = seed;
        this.rng = this.createSeededRNG(seed);
    }

    /**
     * Crear generador de números aleatorios con semilla
     */
    createSeededRNG(seed) {
        let state = seed;
        
        return {
            next: () => {
                state = (state * 9301 + 49297) % 233280;
                return state / 233280;
            },
            nextInt: (min, max) => {
                return Math.floor(this.rng.next() * (max - min + 1)) + min;
            },
            nextFloat: (min, max) => {
                return this.rng.next() * (max - min) + min;
            },
            nextChoice: (array) => {
                return array[Math.floor(this.rng.next() * array.length)];
            },
            nextWeighted: (weights) => {
                const total = weights.reduce((sum, weight) => sum + weight, 0);
                let random = this.rng.next() * total;
                
                for (let i = 0; i < weights.length; i++) {
                    random -= weights[i];
                    if (random <= 0) return i;
                }
                return weights.length - 1;
            }
        };
    }

    /**
     * Crear plantillas de variación
     */
    createTemplates() {
        // Plantillas de rostro
        this.templates.set('face_shapes', [
            { name: 'oval', probability: 0.3, features: ['balanced', 'symmetrical'] },
            { name: 'round', probability: 0.2, features: ['soft', 'friendly'] },
            { name: 'square', probability: 0.2, features: ['strong', 'angular'] },
            { name: 'heart', probability: 0.15, features: ['pointed_chin', 'wide_forehead'] },
            { name: 'diamond', probability: 0.15, features: ['angular', 'defined'] }
        ]);

        // Plantillas de cuerpo
        this.templates.set('body_types', [
            { name: 'ectomorph', probability: 0.25, traits: ['slim', 'tall', 'lean'] },
            { name: 'mesomorph', probability: 0.35, traits: ['athletic', 'muscular', 'balanced'] },
            { name: 'endomorph', probability: 0.2, traits: ['rounded', 'soft', 'curvy'] },
            { name: 'mixed', probability: 0.2, traits: ['combination', 'unique'] }
        ]);

        // Plantillas de personalidad
        this.templates.set('personality_types', [
            { name: 'extrovert', probability: 0.3, traits: ['social', 'energetic', 'outgoing'] },
            { name: 'introvert', probability: 0.25, traits: ['reserved', 'thoughtful', 'private'] },
            { name: 'ambivert', probability: 0.25, traits: ['balanced', 'adaptable', 'flexible'] },
            { name: 'analytical', probability: 0.1, traits: ['logical', 'systematic', 'precise'] },
            { name: 'creative', probability: 0.1, traits: ['imaginative', 'artistic', 'expressive'] }
        ]);
    }

    /**
     * Crear variaciones
     */
    createVariations() {
        // Variaciones de cabello
        this.variations.set('hair_variations', {
            short: {
                styles: ['buzzcut', 'crew_cut', 'pixie', 'bob'],
                colors: ['black', 'brown', 'blonde', 'red', 'gray'],
                textures: ['straight', 'wavy', 'curly']
            },
            long: {
                styles: ['straight_long', 'wavy_long', 'curly_long', 'braided'],
                colors: ['black', 'brown', 'blonde', 'red', 'gray'],
                textures: ['straight', 'wavy', 'curly', 'coily']
            },
            curly: {
                styles: ['afro', 'curly_short', 'curly_long', 'twists'],
                colors: ['black', 'brown', 'red', 'gray'],
                textures: ['curly', 'coily', 'kinky']
            }
        });

        // Variaciones de ojos
        this.variations.set('eye_variations', {
            shapes: ['almond', 'round', 'hooded', 'upturned', 'downturned'],
            colors: ['brown', 'blue', 'green', 'hazel', 'gray'],
            sizes: ['small', 'medium', 'large'],
            expressions: ['friendly', 'serious', 'mysterious', 'energetic']
        });

        // Variaciones de ropa
        this.variations.set('clothing_variations', {
            casual: ['t_shirt', 'jeans', 'sweater', 'hoodie', 'dress'],
            formal: ['suit', 'dress_shirt', 'dress_pants', 'blazer', 'formal_dress'],
            sport: ['athletic_shirt', 'athletic_pants', 'jersey', 'track_suit'],
            elegant: ['evening_dress', 'tuxedo', 'cocktail_dress', 'formal_suit']
        });
    }

    /**
     * Crear restricciones
     */
    createConstraints() {
        // Restricciones de compatibilidad
        this.constraints.set('compatibility', {
            // Cabello y tono de piel
            hair_skin: {
                'very_light': ['blonde', 'brown', 'red'],
                'light': ['blonde', 'brown', 'red', 'black'],
                'medium': ['brown', 'black', 'red'],
                'dark': ['black', 'brown'],
                'very_dark': ['black', 'brown']
            },
            
            // Ojos y cabello
            eyes_hair: {
                'brown': ['black', 'brown', 'red'],
                'blue': ['blonde', 'brown', 'black'],
                'green': ['brown', 'red', 'blonde'],
                'hazel': ['brown', 'black', 'red']
            },
            
            // Ropa y personalidad
            clothing_personality: {
                'extrovert': ['casual', 'sport', 'elegant'],
                'introvert': ['casual', 'formal'],
                'analytical': ['formal', 'casual'],
                'creative': ['casual', 'elegant']
            }
        });

        // Restricciones de edad
        this.constraints.set('age_restrictions', {
            'young': {
                hair_styles: ['short', 'long', 'curly'],
                clothing: ['casual', 'sport'],
                accessories: ['watch', 'glasses']
            },
            'adult': {
                hair_styles: ['short', 'long', 'curly', 'bald'],
                clothing: ['casual', 'formal', 'sport', 'elegant'],
                accessories: ['glasses', 'watch', 'necklace', 'hat']
            },
            'mature': {
                hair_styles: ['short', 'bald'],
                clothing: ['formal', 'casual'],
                accessories: ['glasses', 'watch']
            }
        });
    }

    /**
     * Crear patrones de generación
     */
    createPatterns() {
        // Patrones de generación por región
        this.patterns.set('regional_patterns', {
            'north_europe': {
                skinTone: ['very_light', 'light'],
                hairColor: ['blonde', 'brown', 'red'],
                eyeColor: ['blue', 'green', 'brown'],
                height: [1.70, 1.90]
            },
            'mediterranean': {
                skinTone: ['light', 'medium'],
                hairColor: ['brown', 'black'],
                eyeColor: ['brown', 'hazel'],
                height: [1.65, 1.85]
            },
            'east_asia': {
                skinTone: ['light', 'medium'],
                hairColor: ['black', 'brown'],
                eyeColor: ['brown'],
                height: [1.60, 1.80]
            },
            'africa': {
                skinTone: ['dark', 'very_dark'],
                hairColor: ['black'],
                eyeColor: ['brown'],
                height: [1.65, 1.85]
            }
        });

        // Patrones de generación por profesión
        this.patterns.set('professional_patterns', {
            'business': {
                clothing: ['formal'],
                accessories: ['watch', 'glasses'],
                personality: ['analytical', 'extrovert'],
                traits: ['professional', 'confident']
            },
            'creative': {
                clothing: ['casual', 'elegant'],
                accessories: [],
                personality: ['creative', 'introvert'],
                traits: ['artistic', 'imaginative']
            },
            'athlete': {
                clothing: ['sport'],
                accessories: ['watch'],
                personality: ['extrovert'],
                traits: ['energetic', 'competitive']
            }
        });
    }

    /**
     * Generar avatar aleatorio
     */
    generateRandomAvatar(options = {}) {
        const avatar = {
            id: this.generateId(),
            seed: this.seed,
            generatedAt: new Date().toISOString()
        };

        // Aplicar patrones regionales si se especifica
        if (options.region) {
            this.applyRegionalPattern(avatar, options.region);
        }

        // Aplicar patrones profesionales si se especifica
        if (options.profession) {
            this.applyProfessionalPattern(avatar, options.profession);
        }

        // Generar características básicas
        avatar.gender = this.generateGender(options.gender);
        avatar.age = this.generateAge(options.age);
        avatar.build = this.generateBuild(options.build);
        avatar.height = this.generateHeight(avatar.build, options.height);

        // Generar apariencia
        avatar.skinTone = this.generateSkinTone(options.skinTone);
        avatar.hairStyle = this.generateHairStyle(avatar.gender, avatar.age, options.hairStyle);
        avatar.hairColor = this.generateHairColor(avatar.skinTone, avatar.hairStyle, options.hairColor);
        avatar.eyeColor = this.generateEyeColor(avatar.hairColor, options.eyeColor);

        // Generar ropa y accesorios
        avatar.clothing = this.generateClothing(avatar.personality, avatar.age, options.clothing);
        avatar.accessories = this.generateAccessories(avatar.age, avatar.gender, options.accessories);

        // Generar características de personalidad
        avatar.personality = this.generatePersonality(options.personality);
        avatar.traits = this.generateTraits(avatar.personality);
        avatar.interests = this.generateInterests(avatar.personality, avatar.traits);

        // Generar estadísticas
        avatar.stats = this.generateStats(avatar.personality, avatar.traits);

        // Aplicar variaciones aleatorias
        this.applyRandomVariations(avatar);

        return avatar;
    }

    /**
     * Generar género
     */
    generateGender(preference = null) {
        if (preference) return preference;
        
        const genders = ['male', 'female'];
        const weights = [0.5, 0.5];
        return genders[this.rng.nextWeighted(weights)];
    }

    /**
     * Generar edad
     */
    generateAge(preference = null) {
        if (preference) return preference;

        const ageGroups = [
            { name: 'young', range: [18, 30], weight: 0.4 },
            { name: 'adult', range: [31, 50], weight: 0.4 },
            { name: 'mature', range: [51, 70], weight: 0.2 }
        ];

        const weights = ageGroups.map(group => group.weight);
        const selectedIndex = this.rng.nextWeighted(weights);
        const selectedGroup = ageGroups[selectedIndex];

        return {
            group: selectedGroup.name,
            value: this.rng.nextInt(selectedGroup.range[0], selectedGroup.range[1])
        };
    }

    /**
     * Generar complexión
     */
    generateBuild(preference = null) {
        if (preference) return preference;

        const builds = ['slim', 'average', 'athletic', 'heavy'];
        const weights = [0.3, 0.4, 0.2, 0.1];
        return builds[this.rng.nextWeighted(weights)];
    }

    /**
     * Generar altura
     */
    generateHeight(build, preference = null) {
        if (preference) return preference;

        const heightRanges = {
            slim: [1.60, 1.85],
            average: [1.65, 1.90],
            athletic: [1.70, 1.95],
            heavy: [1.65, 1.90]
        };

        const range = heightRanges[build] || [1.65, 1.85];
        return this.rng.nextFloat(range[0], range[1]);
    }

    /**
     * Generar tono de piel
     */
    generateSkinTone(preference = null) {
        if (preference) return preference;

        const skinTones = ['very_light', 'light', 'medium', 'dark', 'very_dark'];
        const weights = [0.15, 0.25, 0.35, 0.15, 0.1];
        return skinTones[this.rng.nextWeighted(weights)];
    }

    /**
     * Generar estilo de cabello
     */
    generateHairStyle(gender, age, preference = null) {
        if (preference) return preference;

        const restrictions = this.constraints.get('age_restrictions')[age.group];
        const availableStyles = restrictions.hair_styles;

        if (gender === 'female') {
            availableStyles.push('long');
        }

        return this.rng.nextChoice(availableStyles);
    }

    /**
     * Generar color de cabello
     */
    generateHairColor(skinTone, hairStyle, preference = null) {
        if (preference) return preference;

        const compatibility = this.constraints.get('compatibility').hair_skin[skinTone];
        return this.rng.nextChoice(compatibility);
    }

    /**
     * Generar color de ojos
     */
    generateEyeColor(hairColor, preference = null) {
        if (preference) return preference;

        const compatibility = this.constraints.get('compatibility').eyes_hair[hairColor];
        return this.rng.nextChoice(compatibility);
    }

    /**
     * Generar ropa
     */
    generateClothing(personality, age, preference = null) {
        if (preference) return preference;

        const compatibility = this.constraints.get('compatibility').clothing_personality[personality];
        return this.rng.nextChoice(compatibility);
    }

    /**
     * Generar accesorios
     */
    generateAccessories(age, gender, preference = null) {
        if (preference) return preference;

        const restrictions = this.constraints.get('age_restrictions')[age.group];
        const availableAccessories = restrictions.accessories;
        const accessories = [];

        // Añadir accesorios aleatoriamente
        for (const accessory of availableAccessories) {
            if (this.rng.next() < 0.3) { // 30% de probabilidad
                accessories.push(accessory);
            }
        }

        return accessories;
    }

    /**
     * Generar personalidad
     */
    generatePersonality(preference = null) {
        if (preference) return preference;

        const personalities = this.templates.get('personality_types');
        const weights = personalities.map(p => p.probability);
        const selectedIndex = this.rng.nextWeighted(weights);
        return personalities[selectedIndex].name;
    }

    /**
     * Generar rasgos
     */
    generateTraits(personality) {
        const allTraits = [
            'friendly', 'confident', 'creative', 'analytical', 'energetic',
            'calm', 'ambitious', 'artistic', 'competitive', 'cooperative',
            'curious', 'determined', 'empathetic', 'focused', 'generous',
            'honest', 'imaginative', 'independent', 'intelligent', 'kind'
        ];

        const numTraits = this.rng.nextInt(3, 5);
        const traits = [];

        while (traits.length < numTraits) {
            const trait = this.rng.nextChoice(allTraits);
            if (!traits.includes(trait)) {
                traits.push(trait);
            }
        }

        return traits;
    }

    /**
     * Generar intereses
     */
    generateInterests(personality, traits) {
        const allInterests = [
            'gaming', 'sports', 'music', 'art', 'technology', 'reading',
            'travel', 'cooking', 'fitness', 'photography', 'dancing',
            'writing', 'science', 'fashion', 'nature', 'socializing'
        ];

        const numInterests = this.rng.nextInt(2, 5);
        const interests = [];

        while (interests.length < numInterests) {
            const interest = this.rng.nextChoice(allInterests);
            if (!interests.includes(interest)) {
                interests.push(interest);
            }
        }

        return interests;
    }

    /**
     * Generar estadísticas
     */
    generateStats(personality, traits) {
        const baseStats = {
            charisma: 50,
            intelligence: 50,
            strength: 50,
            agility: 50,
            creativity: 50,
            social: 50
        };

        // Ajustar basado en personalidad
        switch (personality) {
            case 'extrovert':
                baseStats.charisma += 15;
                baseStats.social += 15;
                break;
            case 'introvert':
                baseStats.intelligence += 15;
                baseStats.creativity += 15;
                break;
            case 'analytical':
                baseStats.intelligence += 20;
                baseStats.creativity += 10;
                break;
            case 'creative':
                baseStats.creativity += 20;
                baseStats.charisma += 10;
                break;
        }

        // Añadir variación aleatoria
        for (const stat in baseStats) {
            const variation = this.rng.nextInt(-10, 10);
            baseStats[stat] = Math.max(0, Math.min(100, baseStats[stat] + variation));
        }

        return baseStats;
    }

    /**
     * Aplicar patrón regional
     */
    applyRegionalPattern(avatar, region) {
        const pattern = this.patterns.get('regional_patterns')[region];
        if (!pattern) return;

        if (!avatar.skinTone) avatar.skinTone = this.rng.nextChoice(pattern.skinTone);
        if (!avatar.hairColor) avatar.hairColor = this.rng.nextChoice(pattern.hairColor);
        if (!avatar.eyeColor) avatar.eyeColor = this.rng.nextChoice(pattern.eyeColor);
        if (!avatar.height) avatar.height = this.rng.nextFloat(pattern.height[0], pattern.height[1]);
    }

    /**
     * Aplicar patrón profesional
     */
    applyProfessionalPattern(avatar, profession) {
        const pattern = this.patterns.get('professional_patterns')[profession];
        if (!pattern) return;

        if (!avatar.clothing) avatar.clothing = this.rng.nextChoice(pattern.clothing);
        if (!avatar.accessories) avatar.accessories = pattern.accessories;
        if (!avatar.personality) avatar.personality = this.rng.nextChoice(pattern.personality);
        if (!avatar.traits) avatar.traits = pattern.traits;
    }

    /**
     * Aplicar variaciones aleatorias
     */
    applyRandomVariations(avatar) {
        // Variaciones de cabello
        const hairVariations = this.variations.get('hair_variations')[avatar.hairStyle];
        if (hairVariations) {
            avatar.hairVariation = {
                style: this.rng.nextChoice(hairVariations.styles),
                texture: this.rng.nextChoice(hairVariations.textures)
            };
        }

        // Variaciones de ojos
        const eyeVariations = this.variations.get('eye_variations');
        avatar.eyeVariation = {
            shape: this.rng.nextChoice(eyeVariations.shapes),
            size: this.rng.nextChoice(eyeVariations.sizes),
            expression: this.rng.nextChoice(eyeVariations.expressions)
        };

        // Variaciones de ropa
        const clothingVariations = this.variations.get('clothing_variations')[avatar.clothing];
        if (clothingVariations) {
            avatar.clothingVariation = this.rng.nextChoice(clothingVariations);
        }
    }

    /**
     * Generar ID único
     */
    generateId() {
        return 'avatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generar múltiples avatares
     */
    generateMultipleAvatars(count, options = {}) {
        const avatars = [];
        for (let i = 0; i < count; i++) {
            avatars.push(this.generateRandomAvatar(options));
        }
        return avatars;
    }

    /**
     * Generar avatar con semilla específica
     */
    generateAvatarWithSeed(seed, options = {}) {
        const originalSeed = this.seed;
        this.setSeed(seed);
        const avatar = this.generateRandomAvatar(options);
        this.setSeed(originalSeed);
        return avatar;
    }

    /**
     * Obtener estadísticas de generación
     */
    getGenerationStats() {
        return {
            seed: this.seed,
            templatesCount: this.templates.size,
            variationsCount: this.variations.size,
            constraintsCount: this.constraints.size,
            patternsCount: this.patterns.size
        };
    }
}

// Exportar para uso modular
export default AvatarRandomizer;

// Funciones globales para integración
window.AvatarRandomizer = AvatarRandomizer;
window.createAvatarRandomizer = (seed = Date.now()) => {
    return new AvatarRandomizer(seed);
}; 