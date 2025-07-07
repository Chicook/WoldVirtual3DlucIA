/**
 * Base de Datos de Modelos de Avatares Humanos
 * Sistema de generación procedural y aleatoria de avatares
 */

class AvatarDatabase {
    constructor() {
        this.avatars = new Map();
        this.templates = new Map();
        this.categories = new Map();
        this.userAvatars = new Map();
        this.generationRules = {};
        
        this.init();
    }

    /**
     * Inicializar base de datos
     */
    init() {
        this.createGenerationRules();
        this.createAvatarTemplates();
        this.createAvatarCategories();
        this.loadExistingAvatars();
    }

    /**
     * Crear reglas de generación
     */
    createGenerationRules() {
        this.generationRules = {
            // Reglas de género
            gender: {
                male: { weight: 0.5, traits: ['athletic', 'business', 'casual'] },
                female: { weight: 0.5, traits: ['elegant', 'sporty', 'casual'] }
            },

            // Reglas de edad
            age: {
                young: { range: [18, 30], weight: 0.4 },
                adult: { range: [31, 50], weight: 0.4 },
                mature: { range: [51, 70], weight: 0.2 }
            },

            // Reglas de complexión
            build: {
                slim: { weight: 0.3, heightRange: [1.60, 1.85] },
                average: { weight: 0.4, heightRange: [1.65, 1.90] },
                athletic: { weight: 0.2, heightRange: [1.70, 1.95] },
                heavy: { weight: 0.1, heightRange: [1.65, 1.90] }
            },

            // Reglas de tono de piel
            skinTone: {
                veryLight: { weight: 0.15, regions: ['north_europe', 'east_asia'] },
                light: { weight: 0.25, regions: ['europe', 'americas'] },
                medium: { weight: 0.35, regions: ['mediterranean', 'latin_america'] },
                dark: { weight: 0.15, regions: ['africa', 'south_asia'] },
                veryDark: { weight: 0.1, regions: ['africa'] }
            },

            // Reglas de cabello
            hairStyle: {
                short: { weight: 0.4, gender: ['male', 'female'] },
                long: { weight: 0.3, gender: ['female'] },
                curly: { weight: 0.2, gender: ['male', 'female'] },
                bald: { weight: 0.1, gender: ['male'], age: ['mature'] }
            },

            hairColor: {
                black: { weight: 0.3, regions: ['asia', 'africa'] },
                brown: { weight: 0.4, regions: ['global'] },
                blonde: { weight: 0.15, regions: ['europe'] },
                red: { weight: 0.1, regions: ['europe'] },
                gray: { weight: 0.05, age: ['mature'] }
            },

            // Reglas de ojos
            eyeColor: {
                brown: { weight: 0.6, regions: ['global'] },
                blue: { weight: 0.2, regions: ['europe'] },
                green: { weight: 0.1, regions: ['europe'] },
                hazel: { weight: 0.1, regions: ['global'] }
            },

            // Reglas de ropa
            clothing: {
                casual: { weight: 0.5, occasions: ['daily', 'social'] },
                formal: { weight: 0.2, occasions: ['business', 'formal'] },
                sport: { weight: 0.2, occasions: ['sports', 'casual'] },
                elegant: { weight: 0.1, occasions: ['formal', 'special'] }
            },

            // Reglas de accesorios
            accessories: {
                none: { weight: 0.4 },
                glasses: { weight: 0.2, age: ['adult', 'mature'] },
                watch: { weight: 0.2, gender: ['male'] },
                necklace: { weight: 0.1, gender: ['female'] },
                hat: { weight: 0.1, occasions: ['casual', 'sport'] }
            }
        };
    }

    /**
     * Crear plantillas de avatares
     */
    createAvatarTemplates() {
        // Plantillas masculinas
        this.templates.set('male_athlete', {
            id: 'male_athlete',
            name: 'Atleta Masculino',
            gender: 'male',
            build: 'athletic',
            height: 1.85,
            skinTone: 'medium',
            hairStyle: 'short',
            hairColor: 'brown',
            eyeColor: 'brown',
            clothing: 'sport',
            accessories: ['watch'],
            traits: ['energetic', 'fit', 'competitive'],
            personality: 'extroverted',
            interests: ['sports', 'fitness', 'competition']
        });

        this.templates.set('male_business', {
            id: 'male_business',
            name: 'Ejecutivo Masculino',
            gender: 'male',
            build: 'average',
            height: 1.78,
            skinTone: 'light',
            hairStyle: 'short',
            hairColor: 'brown',
            eyeColor: 'blue',
            clothing: 'formal',
            accessories: ['glasses', 'watch'],
            traits: ['professional', 'confident', 'ambitious'],
            personality: 'analytical',
            interests: ['business', 'technology', 'networking']
        });

        this.templates.set('male_casual', {
            id: 'male_casual',
            name: 'Hombre Casual',
            gender: 'male',
            build: 'average',
            height: 1.75,
            skinTone: 'medium',
            hairStyle: 'short',
            hairColor: 'black',
            eyeColor: 'brown',
            clothing: 'casual',
            accessories: [],
            traits: ['friendly', 'relaxed', 'approachable'],
            personality: 'easygoing',
            interests: ['music', 'gaming', 'social']
        });

        // Plantillas femeninas
        this.templates.set('female_elegant', {
            id: 'female_elegant',
            name: 'Mujer Elegante',
            gender: 'female',
            build: 'slim',
            height: 1.68,
            skinTone: 'light',
            hairStyle: 'long',
            hairColor: 'brown',
            eyeColor: 'green',
            clothing: 'elegant',
            accessories: ['necklace'],
            traits: ['sophisticated', 'graceful', 'stylish'],
            personality: 'refined',
            interests: ['fashion', 'art', 'culture']
        });

        this.templates.set('female_sporty', {
            id: 'female_sporty',
            name: 'Mujer Deportiva',
            gender: 'female',
            build: 'athletic',
            height: 1.70,
            skinTone: 'medium',
            hairStyle: 'short',
            hairColor: 'blonde',
            eyeColor: 'blue',
            clothing: 'sport',
            accessories: ['watch'],
            traits: ['active', 'determined', 'energetic'],
            personality: 'competitive',
            interests: ['fitness', 'sports', 'outdoors']
        });

        this.templates.set('female_casual', {
            id: 'female_casual',
            name: 'Mujer Casual',
            gender: 'female',
            build: 'average',
            height: 1.65,
            skinTone: 'medium',
            hairStyle: 'long',
            hairColor: 'black',
            eyeColor: 'brown',
            clothing: 'casual',
            accessories: [],
            traits: ['friendly', 'creative', 'social'],
            personality: 'artistic',
            interests: ['music', 'travel', 'photography']
        });

        // Plantillas especiales
        this.templates.set('gamer', {
            id: 'gamer',
            name: 'Gamer',
            gender: 'male',
            build: 'average',
            height: 1.75,
            skinTone: 'light',
            hairStyle: 'short',
            hairColor: 'brown',
            eyeColor: 'brown',
            clothing: 'casual',
            accessories: ['glasses'],
            traits: ['tech_savvy', 'competitive', 'focused'],
            personality: 'introverted',
            interests: ['gaming', 'technology', 'esports']
        });

        this.templates.set('artist', {
            id: 'artist',
            name: 'Artista',
            gender: 'female',
            build: 'slim',
            height: 1.67,
            skinTone: 'medium',
            hairStyle: 'long',
            hairColor: 'red',
            eyeColor: 'hazel',
            clothing: 'casual',
            accessories: [],
            traits: ['creative', 'expressive', 'imaginative'],
            personality: 'artistic',
            interests: ['art', 'music', 'creativity']
        });
    }

    /**
     * Crear categorías de avatares
     */
    createAvatarCategories() {
        this.categories.set('professionals', {
            name: 'Profesionales',
            templates: ['male_business', 'female_elegant'],
            traits: ['professional', 'confident', 'ambitious'],
            clothing: ['formal', 'elegant'],
            accessories: ['glasses', 'watch']
        });

        this.categories.set('athletes', {
            name: 'Atletas',
            templates: ['male_athlete', 'female_sporty'],
            traits: ['energetic', 'fit', 'competitive'],
            clothing: ['sport'],
            accessories: ['watch']
        });

        this.categories.set('casual', {
            name: 'Casual',
            templates: ['male_casual', 'female_casual'],
            traits: ['friendly', 'relaxed', 'approachable'],
            clothing: ['casual'],
            accessories: []
        });

        this.categories.set('creatives', {
            name: 'Creativos',
            templates: ['artist'],
            traits: ['creative', 'expressive', 'imaginative'],
            clothing: ['casual'],
            accessories: []
        });

        this.categories.set('gamers', {
            name: 'Gamers',
            templates: ['gamer'],
            traits: ['tech_savvy', 'competitive', 'focused'],
            clothing: ['casual'],
            accessories: ['glasses']
        });
    }

    /**
     * Cargar avatares existentes
     */
    loadExistingAvatars() {
        // Cargar desde localStorage si existe
        const savedAvatars = localStorage.getItem('avatarDatabase');
        if (savedAvatars) {
            try {
                const data = JSON.parse(savedAvatars);
                this.avatars = new Map(data.avatars);
                this.userAvatars = new Map(data.userAvatars);
            } catch (error) {
                console.warn('Error al cargar avatares guardados:', error);
            }
        }
    }

    /**
     * Guardar avatares en localStorage
     */
    saveAvatars() {
        try {
            const data = {
                avatars: Array.from(this.avatars.entries()),
                userAvatars: Array.from(this.userAvatars.entries())
            };
            localStorage.setItem('avatarDatabase', JSON.stringify(data));
        } catch (error) {
            console.warn('Error al guardar avatares:', error);
        }
    }

    /**
     * Generar avatar aleatorio
     */
    generateRandomAvatar(userId = null, preferences = {}) {
        const avatar = {
            id: this.generateAvatarId(),
            userId: userId,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '1.0',
            
            // Características básicas
            gender: this.selectRandomWithRules('gender', preferences.gender),
            age: this.selectRandomWithRules('age', preferences.age),
            build: this.selectRandomWithRules('build', preferences.build),
            height: this.generateHeight(preferences.build),
            
            // Apariencia
            skinTone: this.selectRandomWithRules('skinTone', preferences.skinTone),
            hairStyle: this.selectRandomWithRules('hairStyle', preferences.hairStyle),
            hairColor: this.selectRandomWithRules('hairColor', preferences.hairColor),
            eyeColor: this.selectRandomWithRules('eyeColor', preferences.eyeColor),
            
            // Ropa y accesorios
            clothing: this.selectRandomWithRules('clothing', preferences.clothing),
            accessories: this.generateAccessories(preferences.accessories),
            
            // Características adicionales
            traits: this.generateTraits(),
            personality: this.generatePersonality(),
            interests: this.generateInterests(),
            
            // Estadísticas
            stats: this.generateStats(),
            
            // Metadatos
            metadata: {
                generatedBy: 'AvatarDatabase',
                template: this.findBestTemplate(avatar),
                category: this.categorizeAvatar(avatar),
                uniqueness: this.calculateUniqueness(avatar)
            }
        };

        // Guardar avatar
        this.avatars.set(avatar.id, avatar);
        if (userId) {
            this.userAvatars.set(userId, avatar.id);
        }
        
        this.saveAvatars();
        return avatar;
    }

    /**
     * Seleccionar aleatoriamente con reglas
     */
    selectRandomWithRules(category, preference = null) {
        const rules = this.generationRules[category];
        if (!rules) return null;

        let candidates = [];
        let totalWeight = 0;

        // Filtrar candidatos basados en preferencias
        for (const [key, rule] of Object.entries(rules)) {
            if (preference && key === preference) {
                return key;
            }

            let isValid = true;
            
            // Verificar restricciones de género
            if (rule.gender && !rule.gender.includes(this.currentGender)) {
                isValid = false;
            }

            // Verificar restricciones de edad
            if (rule.age && !rule.age.includes(this.currentAge)) {
                isValid = false;
            }

            if (isValid) {
                candidates.push({ key, weight: rule.weight });
                totalWeight += rule.weight;
            }
        }

        // Seleccionar aleatoriamente
        const random = Math.random() * totalWeight;
        let currentWeight = 0;

        for (const candidate of candidates) {
            currentWeight += candidate.weight;
            if (random <= currentWeight) {
                return candidate.key;
            }
        }

        return candidates[0]?.key || Object.keys(rules)[0];
    }

    /**
     * Generar altura basada en complexión
     */
    generateHeight(build) {
        const rules = this.generationRules.build[build];
        if (!rules) return 1.75;

        const [min, max] = rules.heightRange;
        return min + Math.random() * (max - min);
    }

    /**
     * Generar accesorios
     */
    generateAccessories(preference = null) {
        const accessories = [];
        const accessoryRules = this.generationRules.accessories;

        for (const [accessory, rule] of Object.entries(accessoryRules)) {
            if (accessory === 'none') continue;

            const shouldAdd = Math.random() < rule.weight;
            if (shouldAdd) {
                accessories.push(accessory);
            }
        }

        return accessories;
    }

    /**
     * Generar rasgos de personalidad
     */
    generateTraits() {
        const allTraits = [
            'friendly', 'confident', 'creative', 'analytical', 'energetic',
            'calm', 'ambitious', 'artistic', 'competitive', 'cooperative',
            'curious', 'determined', 'empathetic', 'focused', 'generous',
            'honest', 'imaginative', 'independent', 'intelligent', 'kind'
        ];

        const numTraits = 3 + Math.floor(Math.random() * 3); // 3-5 rasgos
        const traits = [];

        while (traits.length < numTraits) {
            const trait = allTraits[Math.floor(Math.random() * allTraits.length)];
            if (!traits.includes(trait)) {
                traits.push(trait);
            }
        }

        return traits;
    }

    /**
     * Generar tipo de personalidad
     */
    generatePersonality() {
        const personalities = [
            'extroverted', 'introverted', 'analytical', 'artistic',
            'competitive', 'cooperative', 'adventurous', 'cautious'
        ];

        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    /**
     * Generar intereses
     */
    generateInterests() {
        const allInterests = [
            'gaming', 'sports', 'music', 'art', 'technology', 'reading',
            'travel', 'cooking', 'fitness', 'photography', 'dancing',
            'writing', 'science', 'fashion', 'nature', 'socializing'
        ];

        const numInterests = 2 + Math.floor(Math.random() * 4); // 2-5 intereses
        const interests = [];

        while (interests.length < numInterests) {
            const interest = allInterests[Math.floor(Math.random() * allInterests.length)];
            if (!interests.includes(interest)) {
                interests.push(interest);
            }
        }

        return interests;
    }

    /**
     * Generar estadísticas
     */
    generateStats() {
        return {
            charisma: 50 + Math.floor(Math.random() * 50),
            intelligence: 50 + Math.floor(Math.random() * 50),
            strength: 50 + Math.floor(Math.random() * 50),
            agility: 50 + Math.floor(Math.random() * 50),
            creativity: 50 + Math.floor(Math.random() * 50),
            social: 50 + Math.floor(Math.random() * 50)
        };
    }

    /**
     * Encontrar mejor plantilla
     */
    findBestTemplate(avatar) {
        let bestTemplate = null;
        let bestScore = 0;

        for (const [templateId, template] of this.templates) {
            let score = 0;

            // Comparar características básicas
            if (template.gender === avatar.gender) score += 10;
            if (template.build === avatar.build) score += 8;
            if (template.clothing === avatar.clothing) score += 6;
            if (template.hairStyle === avatar.hairStyle) score += 4;
            if (template.eyeColor === avatar.eyeColor) score += 3;

            // Comparar rasgos
            const commonTraits = template.traits.filter(trait => 
                avatar.traits.includes(trait)
            );
            score += commonTraits.length * 2;

            if (score > bestScore) {
                bestScore = score;
                bestTemplate = templateId;
            }
        }

        return bestTemplate;
    }

    /**
     * Categorizar avatar
     */
    categorizeAvatar(avatar) {
        let bestCategory = 'casual';
        let bestScore = 0;

        for (const [categoryId, category] of this.categories) {
            let score = 0;

            // Verificar si el avatar coincide con las plantillas de la categoría
            if (category.templates.includes(avatar.metadata.template)) {
                score += 20;
            }

            // Verificar rasgos
            const commonTraits = category.traits.filter(trait => 
                avatar.traits.includes(trait)
            );
            score += commonTraits.length * 5;

            // Verificar ropa
            if (category.clothing.includes(avatar.clothing)) {
                score += 10;
            }

            if (score > bestScore) {
                bestScore = score;
                bestCategory = categoryId;
            }
        }

        return bestCategory;
    }

    /**
     * Calcular unicidad del avatar
     */
    calculateUniqueness(avatar) {
        let uniqueness = 100;

        // Reducir unicidad basado en características comunes
        const commonTraits = this.getCommonTraits();
        const avatarTraits = avatar.traits.filter(trait => commonTraits.includes(trait));
        uniqueness -= avatarTraits.length * 5;

        // Reducir unicidad basado en plantilla
        if (avatar.metadata.template) {
            uniqueness -= 10;
        }

        return Math.max(0, uniqueness);
    }

    /**
     * Obtener rasgos comunes
     */
    getCommonTraits() {
        const traitCounts = {};
        
        for (const avatar of this.avatars.values()) {
            for (const trait of avatar.traits) {
                traitCounts[trait] = (traitCounts[trait] || 0) + 1;
            }
        }

        const totalAvatars = this.avatars.size;
        return Object.entries(traitCounts)
            .filter(([trait, count]) => count / totalAvatars > 0.3)
            .map(([trait]) => trait);
    }

    /**
     * Generar ID único para avatar
     */
    generateAvatarId() {
        return 'avatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtener avatar por ID
     */
    getAvatar(id) {
        return this.avatars.get(id);
    }

    /**
     * Obtener avatar de usuario
     */
    getUserAvatar(userId) {
        const avatarId = this.userAvatars.get(userId);
        return avatarId ? this.avatars.get(avatarId) : null;
    }

    /**
     * Actualizar avatar
     */
    updateAvatar(id, updates) {
        const avatar = this.avatars.get(id);
        if (!avatar) return false;

        Object.assign(avatar, updates);
        avatar.lastModified = new Date().toISOString();
        
        this.saveAvatars();
        return true;
    }

    /**
     * Eliminar avatar
     */
    deleteAvatar(id) {
        const avatar = this.avatars.get(id);
        if (!avatar) return false;

        this.avatars.delete(id);
        
        // Remover de usuarios si existe
        for (const [userId, avatarId] of this.userAvatars.entries()) {
            if (avatarId === id) {
                this.userAvatars.delete(userId);
                break;
            }
        }

        this.saveAvatars();
        return true;
    }

    /**
     * Obtener todos los avatares
     */
    getAllAvatars() {
        return Array.from(this.avatars.values());
    }

    /**
     * Obtener avatares por categoría
     */
    getAvatarsByCategory(category) {
        return this.getAllAvatars().filter(avatar => 
            avatar.metadata.category === category
        );
    }

    /**
     * Obtener estadísticas de la base de datos
     */
    getDatabaseStats() {
        const avatars = this.getAllAvatars();
        const totalAvatars = avatars.length;
        
        const stats = {
            totalAvatars,
            totalUsers: this.userAvatars.size,
            categories: {},
            genderDistribution: {},
            ageDistribution: {},
            buildDistribution: {},
            averageUniqueness: 0,
            mostCommonTraits: [],
            mostCommonInterests: []
        };

        if (totalAvatars === 0) return stats;

        // Distribuciones
        for (const avatar of avatars) {
            // Categorías
            const category = avatar.metadata.category;
            stats.categories[category] = (stats.categories[category] || 0) + 1;

            // Género
            stats.genderDistribution[avatar.gender] = (stats.genderDistribution[avatar.gender] || 0) + 1;

            // Edad
            stats.ageDistribution[avatar.age] = (stats.ageDistribution[avatar.age] || 0) + 1;

            // Complexión
            stats.buildDistribution[avatar.build] = (stats.buildDistribution[avatar.build] || 0) + 1;

            // Unicidad promedio
            stats.averageUniqueness += avatar.metadata.uniqueness;
        }

        stats.averageUniqueness /= totalAvatars;

        // Rasgos más comunes
        const traitCounts = {};
        const interestCounts = {};

        for (const avatar of avatars) {
            for (const trait of avatar.traits) {
                traitCounts[trait] = (traitCounts[trait] || 0) + 1;
            }
            for (const interest of avatar.interests) {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            }
        }

        stats.mostCommonTraits = Object.entries(traitCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([trait]) => trait);

        stats.mostCommonInterests = Object.entries(interestCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([interest]) => interest);

        return stats;
    }

    /**
     * Exportar base de datos
     */
    exportDatabase() {
        return {
            avatars: Array.from(this.avatars.entries()),
            userAvatars: Array.from(this.userAvatars.entries()),
            templates: Array.from(this.templates.entries()),
            categories: Array.from(this.categories.entries()),
            stats: this.getDatabaseStats(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Importar base de datos
     */
    importDatabase(data) {
        try {
            if (data.avatars) {
                this.avatars = new Map(data.avatars);
            }
            if (data.userAvatars) {
                this.userAvatars = new Map(data.userAvatars);
            }
            if (data.templates) {
                this.templates = new Map(data.templates);
            }
            if (data.categories) {
                this.categories = new Map(data.categories);
            }
            
            this.saveAvatars();
            return true;
        } catch (error) {
            console.error('Error al importar base de datos:', error);
            return false;
        }
    }

    /**
     * Limpiar base de datos
     */
    clearDatabase() {
        this.avatars.clear();
        this.userAvatars.clear();
        this.saveAvatars();
    }
}

// Exportar para uso modular
export default AvatarDatabase;

// Funciones globales para integración
window.AvatarDatabase = AvatarDatabase;
window.createAvatarDatabase = () => {
    return new AvatarDatabase();
}; 