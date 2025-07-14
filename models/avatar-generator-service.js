/**
 * Servicio de Generación Aleatoria de Avatares
 * Maneja la generación automática de avatares para usuarios registrados
 */

import AvatarDatabase from './avatar-database.js';

class AvatarGeneratorService {
    constructor() {
        this.database = new AvatarDatabase();
        this.generationQueue = [];
        this.isProcessing = false;
        this.generationStats = {
            totalGenerated: 0,
            todayGenerated: 0,
            lastReset: new Date().toDateString()
        };

        this.init();
    }

    /**
     * Inicializar servicio
     */
    init() {
        this.loadStats();
        this.resetDailyStats();
        this.startProcessing();
    }

    /**
     * Cargar estadísticas
     */
    loadStats() {
        const savedStats = localStorage.getItem('avatarGeneratorStats');
        if (savedStats) {
            try {
                this.generationStats = JSON.parse(savedStats);
            } catch (error) {
                console.warn('Error al cargar estadísticas:', error);
            }
        }
    }

    /**
     * Guardar estadísticas
     */
    saveStats() {
        try {
            localStorage.setItem('avatarGeneratorStats', JSON.stringify(this.generationStats));
        } catch (error) {
            console.warn('Error al guardar estadísticas:', error);
        }
    }

    /**
     * Resetear estadísticas diarias
     */
    resetDailyStats() {
        const today = new Date().toDateString();
        if (this.generationStats.lastReset !== today) {
            this.generationStats.todayGenerated = 0;
            this.generationStats.lastReset = today;
            this.saveStats();
        }
    }

    /**
     * Iniciar procesamiento de cola
     */
    startProcessing() {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.processQueue();
    }

    /**
     * Procesar cola de generación
     */
    async processQueue() {
        while (this.generationQueue.length > 0 && this.isProcessing) {
            const request = this.generationQueue.shift();
            await this.processGenerationRequest(request);
            
            // Pausa entre generaciones para no sobrecargar
            await this.delay(100);
        }

        this.isProcessing = false;
    }

    /**
     * Procesar solicitud de generación
     */
    async processGenerationRequest(request) {
        try {
            const { userId, preferences, callback, priority } = request;
            
            // Generar avatar
            const avatar = this.generateAvatarForUser(userId, preferences);
            
            // Actualizar estadísticas
            this.updateStats();
            
            // Ejecutar callback
            if (callback) {
                callback(avatar, null);
            }

            console.log(`Avatar generado para usuario ${userId}:`, avatar.id);
        } catch (error) {
            console.error('Error al procesar solicitud de generación:', error);
            
            if (request.callback) {
                request.callback(null, error);
            }
        }
    }

    /**
     * Generar avatar para usuario
     */
    generateAvatarForUser(userId, preferences = {}) {
        // Verificar si el usuario ya tiene un avatar
        const existingAvatar = this.database.getUserAvatar(userId);
        if (existingAvatar) {
            console.log(`Usuario ${userId} ya tiene avatar:`, existingAvatar.id);
            return existingAvatar;
        }

        // Generar preferencias inteligentes basadas en el usuario
        const enhancedPreferences = this.enhancePreferences(userId, preferences);
        
        // Generar avatar
        const avatar = this.database.generateRandomAvatar(userId, enhancedPreferences);
        
        // Aplicar mejoras adicionales
        this.applyAvatarEnhancements(avatar, userId);
        
        return avatar;
    }

    /**
     * Mejorar preferencias basadas en el usuario
     */
    enhancePreferences(userId, preferences) {
        const enhanced = { ...preferences };

        // Analizar patrones de usuarios similares
        const similarUsers = this.findSimilarUsers(userId);
        if (similarUsers.length > 0) {
            const commonPreferences = this.analyzeCommonPreferences(similarUsers);
            Object.assign(enhanced, commonPreferences);
        }

        // Aplicar reglas de balanceo
        this.applyBalancingRules(enhanced);

        return enhanced;
    }

    /**
     * Encontrar usuarios similares
     */
    findSimilarUsers(userId) {
        // Implementación simplificada - en una versión real
        // esto analizaría patrones de comportamiento, edad, ubicación, etc.
        const allAvatars = this.database.getAllAvatars();
        const userAvatar = this.database.getUserAvatar(userId);
        
        if (!userAvatar) return [];

        return allAvatars.filter(avatar => {
            if (avatar.userId === userId) return false;
            
            // Similitud basada en características básicas
            let similarity = 0;
            if (avatar.gender === userAvatar.gender) similarity += 0.3;
            if (avatar.age === userAvatar.age) similarity += 0.2;
            if (avatar.build === userAvatar.build) similarity += 0.2;
            if (avatar.clothing === userAvatar.clothing) similarity += 0.15;
            if (avatar.personality === userAvatar.personality) similarity += 0.15;
            
            return similarity > 0.5;
        });
    }

    /**
     * Analizar preferencias comunes
     */
    analyzeCommonPreferences(users) {
        const preferences = {
            gender: {},
            build: {},
            clothing: {},
            personality: {},
            interests: {}
        };

        for (const user of users) {
            // Contar preferencias
            preferences.gender[user.gender] = (preferences.gender[user.gender] || 0) + 1;
            preferences.build[user.build] = (preferences.build[user.build] || 0) + 1;
            preferences.clothing[user.clothing] = (preferences.clothing[user.clothing] || 0) + 1;
            preferences.personality[user.personality] = (preferences.personality[user.personality] || 0) + 1;
            
            for (const interest of user.interests) {
                preferences.interests[interest] = (preferences.interests[interest] || 0) + 1;
            }
        }

        // Encontrar preferencias más comunes
        const result = {};
        for (const [category, counts] of Object.entries(preferences)) {
            const maxCount = Math.max(...Object.values(counts));
            const mostCommon = Object.entries(counts)
                .filter(([, count]) => count === maxCount)
                .map(([key]) => key);
            
            if (mostCommon.length > 0) {
                result[category] = mostCommon[Math.floor(Math.random() * mostCommon.length)];
            }
        }

        return result;
    }

    /**
     * Aplicar reglas de balanceo
     */
    applyBalancingRules(preferences) {
        const stats = this.database.getDatabaseStats();
        
        // Balancear distribución de género
        if (stats.genderDistribution.male > stats.genderDistribution.female * 1.5) {
            preferences.gender = 'female';
        } else if (stats.genderDistribution.female > stats.genderDistribution.male * 1.5) {
            preferences.gender = 'male';
        }

        // Balancear categorías
        const categoryCounts = stats.categories;
        const minCategory = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => a - b)[0];
        
        if (minCategory) {
            const category = this.database.categories.get(minCategory[0]);
            if (category) {
                preferences.clothing = category.clothing[0];
                preferences.traits = category.traits.slice(0, 2);
            }
        }
    }

    /**
     * Aplicar mejoras al avatar
     */
    applyAvatarEnhancements(avatar, userId) {
        // Mejorar estadísticas basadas en personalidad
        this.enhanceStats(avatar);
        
        // Añadir características únicas
        this.addUniqueFeatures(avatar);
        
        // Optimizar para rendimiento
        this.optimizeAvatar(avatar);
        
        // Guardar avatar mejorado
        this.database.updateAvatar(avatar.id, avatar);
    }

    /**
     * Mejorar estadísticas del avatar
     */
    enhanceStats(avatar) {
        const personality = avatar.personality;
        const stats = avatar.stats;

        switch (personality) {
            case 'extroverted':
                stats.charisma += 15;
                stats.social += 15;
                break;
            case 'introverted':
                stats.intelligence += 15;
                stats.creativity += 15;
                break;
            case 'analytical':
                stats.intelligence += 20;
                stats.creativity += 10;
                break;
            case 'artistic':
                stats.creativity += 20;
                stats.charisma += 10;
                break;
            case 'competitive':
                stats.strength += 15;
                stats.agility += 15;
                break;
            case 'cooperative':
                stats.social += 20;
                stats.charisma += 10;
                break;
        }

        // Normalizar estadísticas
        for (const stat in stats) {
            stats[stat] = Math.min(100, Math.max(0, stats[stat]));
        }
    }

    /**
     * Añadir características únicas
     */
    addUniqueFeatures(avatar) {
        // Añadir características especiales basadas en intereses
        const specialFeatures = [];
        
        if (avatar.interests.includes('gaming')) {
            specialFeatures.push('gamer_tag');
        }
        if (avatar.interests.includes('art')) {
            specialFeatures.push('artistic_style');
        }
        if (avatar.interests.includes('sports')) {
            specialFeatures.push('athletic_achievement');
        }
        if (avatar.interests.includes('music')) {
            specialFeatures.push('musical_talent');
        }

        avatar.specialFeatures = specialFeatures;
    }

    /**
     * Optimizar avatar para rendimiento
     */
    optimizeAvatar(avatar) {
        // Simplificar datos innecesarios
        delete avatar.metadata.generatedBy;
        
        // Comprimir datos de estadísticas
        avatar.stats = Object.fromEntries(
            Object.entries(avatar.stats).map(([key, value]) => [key, Math.round(value)])
        );
    }

    /**
     * Solicitar generación de avatar
     */
    requestAvatarGeneration(userId, preferences = {}, callback = null, priority = 'normal') {
        const request = {
            userId,
            preferences,
            callback,
            priority,
            timestamp: Date.now()
        };

        // Añadir a cola según prioridad
        if (priority === 'high') {
            this.generationQueue.unshift(request);
        } else {
            this.generationQueue.push(request);
        }

        // Iniciar procesamiento si no está activo
        if (!this.isProcessing) {
            this.startProcessing();
        }

        return request;
    }

    /**
     * Generar avatar inmediatamente (síncrono)
     */
    generateAvatarImmediate(userId, preferences = {}) {
        return this.generateAvatarForUser(userId, preferences);
    }

    /**
     * Generar múltiples avatares
     */
    generateMultipleAvatars(userIds, preferences = {}) {
        const promises = userIds.map(userId => 
            new Promise((resolve, reject) => {
                this.requestAvatarGeneration(userId, preferences, (avatar, error) => {
                    if (error) reject(error);
                    else resolve(avatar);
                });
            })
        );

        return Promise.all(promises);
    }

    /**
     * Regenerar avatar existente
     */
    regenerateAvatar(userId, preferences = {}) {
        // Eliminar avatar existente
        const existingAvatar = this.database.getUserAvatar(userId);
        if (existingAvatar) {
            this.database.deleteAvatar(existingAvatar.id);
        }

        // Generar nuevo avatar
        return this.generateAvatarForUser(userId, preferences);
    }

    /**
     * Obtener avatar de usuario
     */
    getUserAvatar(userId) {
        return this.database.getUserAvatar(userId);
    }

    /**
     * Actualizar avatar de usuario
     */
    updateUserAvatar(userId, updates) {
        const avatar = this.database.getUserAvatar(userId);
        if (!avatar) return false;

        return this.database.updateAvatar(avatar.id, updates);
    }

    /**
     * Eliminar avatar de usuario
     */
    deleteUserAvatar(userId) {
        const avatar = this.database.getUserAvatar(userId);
        if (!avatar) return false;

        return this.database.deleteAvatar(avatar.id);
    }

    /**
     * Obtener estadísticas de generación
     */
    getGenerationStats() {
        return {
            ...this.generationStats,
            queueLength: this.generationQueue.length,
            isProcessing: this.isProcessing,
            databaseStats: this.database.getDatabaseStats()
        };
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        this.generationStats.totalGenerated++;
        this.generationStats.todayGenerated++;
        this.saveStats();
    }

    /**
     * Obtener avatares populares
     */
    getPopularAvatars(limit = 10) {
        const avatars = this.database.getAllAvatars();
        
        // Calcular popularidad basada en unicidad y características
        const popularAvatars = avatars.map(avatar => ({
            ...avatar,
            popularity: this.calculatePopularity(avatar)
        }));

        return popularAvatars
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    }

    /**
     * Calcular popularidad de avatar
     */
    calculatePopularity(avatar) {
        let popularity = avatar.metadata.uniqueness;

        // Bonus por características especiales
        if (avatar.specialFeatures) {
            popularity += avatar.specialFeatures.length * 10;
        }

        // Bonus por estadísticas altas
        const avgStats = Object.values(avatar.stats).reduce((a, b) => a + b, 0) / 6;
        popularity += avgStats * 0.5;

        // Bonus por personalidad única
        const personalityCount = this.database.getAllAvatars()
            .filter(a => a.personality === avatar.personality).length;
        const totalAvatars = this.database.getAllAvatars().length;
        const personalityRarity = (totalAvatars - personalityCount) / totalAvatars;
        popularity += personalityRarity * 20;

        return Math.round(popularity);
    }

    /**
     * Buscar avatares por criterios
     */
    searchAvatars(criteria) {
        const avatars = this.database.getAllAvatars();
        
        return avatars.filter(avatar => {
            for (const [key, value] of Object.entries(criteria)) {
                if (Array.isArray(value)) {
                    if (!value.includes(avatar[key])) return false;
                } else if (avatar[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Obtener recomendaciones de avatar
     */
    getAvatarRecommendations(userId, limit = 5) {
        const userAvatar = this.database.getUserAvatar(userId);
        if (!userAvatar) return [];

        const allAvatars = this.database.getAllAvatars();
        const recommendations = allAvatars
            .filter(avatar => avatar.userId !== userId)
            .map(avatar => ({
                ...avatar,
                similarity: this.calculateSimilarity(userAvatar, avatar)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        return recommendations;
    }

    /**
     * Calcular similitud entre avatares
     */
    calculateSimilarity(avatar1, avatar2) {
        let similarity = 0;

        // Características básicas
        if (avatar1.gender === avatar2.gender) similarity += 0.2;
        if (avatar1.age === avatar2.age) similarity += 0.15;
        if (avatar1.build === avatar2.build) similarity += 0.15;
        if (avatar1.clothing === avatar2.clothing) similarity += 0.1;

        // Rasgos de personalidad
        const commonTraits = avatar1.traits.filter(trait => 
            avatar2.traits.includes(trait)
        );
        similarity += commonTraits.length * 0.05;

        // Intereses
        const commonInterests = avatar1.interests.filter(interest => 
            avatar2.interests.includes(interest)
        );
        similarity += commonInterests.length * 0.05;

        // Personalidad
        if (avatar1.personality === avatar2.personality) similarity += 0.1;

        return similarity;
    }

    /**
     * Exportar servicio
     */
    exportService() {
        return {
            database: this.database.exportDatabase(),
            generationStats: this.generationStats,
            queueLength: this.generationQueue.length,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Importar servicio
     */
    importService(data) {
        try {
            if (data.database) {
                this.database.importDatabase(data.database);
            }
            if (data.generationStats) {
                this.generationStats = data.generationStats;
                this.saveStats();
            }
            return true;
        } catch (error) {
            console.error('Error al importar servicio:', error);
            return false;
        }
    }

    /**
     * Limpiar cola de generación
     */
    clearQueue() {
        this.generationQueue = [];
    }

    /**
     * Detener procesamiento
     */
    stopProcessing() {
        this.isProcessing = false;
    }

    /**
     * Función de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exportar para uso modular
export default AvatarGeneratorService;

// Funciones globales para integración
window.AvatarGeneratorService = AvatarGeneratorService;
window.createAvatarGeneratorService = () => {
    return new AvatarGeneratorService();
}; 