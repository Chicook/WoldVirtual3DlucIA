/**
 * Servicio de Traducción - Sistema básico de traducción
 */

class TranslationService {
    constructor() {
        // Diccionario básico de traducciones
        this.translations = {
            'es-en': {
                'hola': 'hello',
                'gracias': 'thank you',
                'por favor': 'please',
                'adiós': 'goodbye',
                'buenos días': 'good morning',
                'buenas tardes': 'good afternoon',
                'buenas noches': 'good night',
                'cómo estás': 'how are you',
                'bien': 'good',
                'mal': 'bad',
                'sí': 'yes',
                'no': 'no',
                'agua': 'water',
                'comida': 'food',
                'casa': 'house',
                'trabajo': 'work',
                'amigo': 'friend',
                'familia': 'family',
                'tiempo': 'time',
                'dinero': 'money'
            },
            'en-es': {
                'hello': 'hola',
                'thank you': 'gracias',
                'please': 'por favor',
                'goodbye': 'adiós',
                'good morning': 'buenos días',
                'good afternoon': 'buenas tardes',
                'good night': 'buenas noches',
                'how are you': 'cómo estás',
                'good': 'bien',
                'bad': 'mal',
                'yes': 'sí',
                'no': 'no',
                'water': 'agua',
                'food': 'comida',
                'house': 'casa',
                'work': 'trabajo',
                'friend': 'amigo',
                'family': 'familia',
                'time': 'tiempo',
                'money': 'dinero'
            },
            'es-fr': {
                'hola': 'bonjour',
                'gracias': 'merci',
                'por favor': 's\'il vous plaît',
                'adiós': 'au revoir',
                'buenos días': 'bonjour',
                'buenas tardes': 'bonne après-midi',
                'buenas noches': 'bonne nuit',
                'cómo estás': 'comment allez-vous',
                'bien': 'bien',
                'mal': 'mal',
                'sí': 'oui',
                'no': 'non'
            },
            'fr-es': {
                'bonjour': 'hola',
                'merci': 'gracias',
                's\'il vous plaît': 'por favor',
                'au revoir': 'adiós',
                'comment allez-vous': 'cómo estás',
                'bien': 'bien',
                'mal': 'mal',
                'oui': 'sí',
                'non': 'no'
            }
        };

        // Cache para traducciones
        this.cache = new Map();
    }

    /**
     * Traduce texto de un idioma a otro
     * @param {string} text - Texto a traducir
     * @param {string} from - Idioma origen
     * @param {string} to - Idioma destino
     * @returns {string} - Texto traducido
     */
    async translate(text, from, to) {
        if (!text || text.trim().length === 0) {
            return text;
        }

        // Si los idiomas son iguales, no traducir
        if (from === to) {
            return text;
        }

        // Verificar cache
        const cacheKey = `${text.toLowerCase()}_${from}_${to}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Buscar traducción en diccionario
        const translationKey = `${from}-${to}`;
        const dictionary = this.translations[translationKey];

        if (!dictionary) {
            // Si no hay diccionario directo, intentar traducción inversa
            const reverseKey = `${to}-${from}`;
            const reverseDictionary = this.translations[reverseKey];
            
            if (reverseDictionary) {
                const translatedText = this.translateWithDictionary(text, reverseDictionary, true);
                this.cache.set(cacheKey, translatedText);
                return translatedText;
            }

            // Si no hay traducción disponible, devolver texto original
            return text;
        }

        const translatedText = this.translateWithDictionary(text, dictionary);
        this.cache.set(cacheKey, translatedText);
        return translatedText;
    }

    /**
     * Traduce texto usando un diccionario específico
     * @param {string} text - Texto a traducir
     * @param {object} dictionary - Diccionario de traducciones
     * @param {boolean} reverse - Si es traducción inversa
     * @returns {string} - Texto traducido
     */
    translateWithDictionary(text, dictionary, reverse = false) {
        let translatedText = text.toLowerCase();

        // Ordenar palabras por longitud (más largas primero) para evitar conflictos
        const sortedWords = Object.keys(dictionary).sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            const translation = dictionary[word];
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            
            if (reverse) {
                translatedText = translatedText.replace(regex, word);
            } else {
                translatedText = translatedText.replace(regex, translation);
            }
        }

        // Preservar capitalización original
        return this.preserveCapitalization(text, translatedText);
    }

    /**
     * Preserva la capitalización del texto original
     * @param {string} original - Texto original
     * @param {string} translated - Texto traducido
     * @returns {string} - Texto con capitalización preservada
     */
    preserveCapitalization(original, translated) {
        const originalWords = original.split(' ');
        const translatedWords = translated.split(' ');

        return translatedWords.map((word, index) => {
            if (index < originalWords.length) {
                const originalWord = originalWords[index];
                
                // Si la palabra original empieza con mayúscula
                if (originalWord.charAt(0) === originalWord.charAt(0).toUpperCase()) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }
                
                // Si toda la palabra original es mayúscula
                if (originalWord === originalWord.toUpperCase()) {
                    return word.toUpperCase();
                }
            }
            
            return word;
        }).join(' ');
    }

    /**
     * Agrega una nueva traducción al diccionario
     * @param {string} from - Idioma origen
     * @param {string} to - Idioma destino
     * @param {string} original - Palabra original
     * @param {string} translation - Traducción
     */
    addTranslation(from, to, original, translation) {
        const key = `${from}-${to}`;
        
        if (!this.translations[key]) {
            this.translations[key] = {};
        }
        
        this.translations[key][original.toLowerCase()] = translation.toLowerCase();
        
        // Limpiar cache relacionado
        this.clearCache();
    }

    /**
     * Limpia el cache de traducciones
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Obtiene estadísticas de traducción
     * @returns {object} - Estadísticas del servicio
     */
    getStats() {
        const totalTranslations = Object.values(this.translations)
            .reduce((sum, dict) => sum + Object.keys(dict).length, 0);
        
        return {
            totalDictionaries: Object.keys(this.translations).length,
            totalTranslations: totalTranslations,
            cacheSize: this.cache.size,
            supportedLanguages: this.getSupportedLanguages()
        };
    }

    /**
     * Obtiene idiomas soportados
     * @returns {array} - Lista de códigos de idioma
     */
    getSupportedLanguages() {
        const languages = new Set();
        
        Object.keys(this.translations).forEach(key => {
            const [from, to] = key.split('-');
            languages.add(from);
            languages.add(to);
        });
        
        return Array.from(languages);
    }

    /**
     * Verifica si una traducción es posible
     * @param {string} from - Idioma origen
     * @param {string} to - Idioma destino
     * @returns {boolean} - True si es posible traducir
     */
    canTranslate(from, to) {
        return this.translations[`${from}-${to}`] || this.translations[`${to}-${from}`];
    }
}

module.exports = TranslationService; 