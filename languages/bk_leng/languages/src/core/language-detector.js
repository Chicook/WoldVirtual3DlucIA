/**
 * Detector de Idioma - Sistema básico de detección
 */

class LanguageDetector {
    constructor() {
        // Patrones básicos para detección de idioma
        this.languagePatterns = {
            'es': {
                patterns: [
                    /\b(el|la|los|las|un|una|unos|unas)\b/gi,
                    /\b(es|son|está|están|hay|tiene|tienen)\b/gi,
                    /\b(que|como|cuando|donde|por|para|con|sin)\b/gi,
                    /\b(hola|gracias|por favor|adiós|buenos días)\b/gi
                ],
                weight: 0
            },
            'en': {
                patterns: [
                    /\b(the|a|an|this|that|these|those)\b/gi,
                    /\b(is|are|was|were|have|has|had)\b/gi,
                    /\b(and|or|but|if|when|where|why|how)\b/gi,
                    /\b(hello|thank you|please|goodbye|good morning)\b/gi
                ],
                weight: 0
            },
            'fr': {
                patterns: [
                    /\b(le|la|les|un|une|des|ce|cette)\b/gi,
                    /\b(est|sont|a|ont|être|avoir)\b/gi,
                    /\b(et|ou|mais|si|quand|où|pourquoi|comment)\b/gi,
                    /\b(bonjour|merci|s'il vous plaît|au revoir)\b/gi
                ],
                weight: 0
            },
            'de': {
                patterns: [
                    /\b(der|die|das|ein|eine|den|dem|des)\b/gi,
                    /\b(ist|sind|hat|haben|war|waren)\b/gi,
                    /\b(und|oder|aber|wenn|wo|warum|wie)\b/gi,
                    /\b(hallo|danke|bitte|auf wiedersehen)\b/gi
                ],
                weight: 0
            },
            'it': {
                patterns: [
                    /\b(il|la|lo|gli|le|un|una|uno)\b/gi,
                    /\b(è|sono|ha|hanno|era|erano)\b/gi,
                    /\b(e|o|ma|se|quando|dove|perché|come)\b/gi,
                    /\b(ciao|grazie|per favore|arrivederci)\b/gi
                ],
                weight: 0
            }
        };

        // Caracteres específicos por idioma
        this.characterPatterns = {
            'es': /[ñáéíóúü]/g,
            'fr': /[àâäéèêëïîôöùûüÿç]/g,
            'de': /[äöüß]/g,
            'it': /[àèéìíîòóù]/g
        };
    }

    /**
     * Detecta el idioma del texto proporcionado
     * @param {string} text - Texto a analizar
     * @returns {string} - Código del idioma detectado
     */
    async detect(text) {
        if (!text || text.trim().length === 0) {
            return 'en'; // Idioma por defecto
        }

        const normalizedText = text.toLowerCase().trim();
        const scores = {};

        // Inicializar puntuaciones
        Object.keys(this.languagePatterns).forEach(lang => {
            scores[lang] = 0;
        });

        // Analizar patrones de palabras
        for (const [lang, config] of Object.entries(this.languagePatterns)) {
            for (const pattern of config.patterns) {
                const matches = normalizedText.match(pattern);
                if (matches) {
                    scores[lang] += matches.length;
                }
            }
        }

        // Analizar caracteres específicos
        for (const [lang, pattern] of Object.entries(this.characterPatterns)) {
            const matches = normalizedText.match(pattern);
            if (matches) {
                scores[lang] += matches.length * 2; // Peso extra para caracteres únicos
            }
        }

        // Encontrar el idioma con mayor puntuación
        let detectedLanguage = 'en';
        let maxScore = 0;

        for (const [lang, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                detectedLanguage = lang;
            }
        }

        // Si no hay coincidencias claras, usar heurísticas adicionales
        if (maxScore === 0) {
            detectedLanguage = this.fallbackDetection(normalizedText);
        }

        return detectedLanguage;
    }

    /**
     * Detección de respaldo basada en heurísticas simples
     * @param {string} text - Texto normalizado
     * @returns {string} - Idioma detectado
     */
    fallbackDetection(text) {
        // Contar palabras comunes
        const wordCount = text.split(/\s+/).length;
        
        // Si es muy corto, usar inglés por defecto
        if (wordCount < 3) {
            return 'en';
        }

        // Verificar longitud promedio de palabras
        const words = text.split(/\s+/);
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

        // Palabras más largas tienden a ser alemán
        if (avgWordLength > 8) {
            return 'de';
        }

        // Palabras más cortas tienden a ser español o italiano
        if (avgWordLength < 5) {
            return 'es';
        }

        return 'en';
    }

    /**
     * Obtiene información del idioma detectado
     * @param {string} languageCode - Código del idioma
     * @returns {object} - Información del idioma
     */
    getLanguageInfo(languageCode) {
        const languageNames = {
            'es': { name: 'Español', nativeName: 'Español' },
            'en': { name: 'English', nativeName: 'English' },
            'fr': { name: 'Français', nativeName: 'Français' },
            'de': { name: 'Deutsch', nativeName: 'Deutsch' },
            'it': { name: 'Italiano', nativeName: 'Italiano' }
        };

        return languageNames[languageCode] || { name: 'Unknown', nativeName: 'Unknown' };
    }

    /**
     * Verifica si un idioma es soportado
     * @param {string} languageCode - Código del idioma
     * @returns {boolean} - True si es soportado
     */
    isSupported(languageCode) {
        return Object.keys(this.languagePatterns).includes(languageCode);
    }

    /**
     * Obtiene lista de idiomas soportados
     * @returns {array} - Lista de códigos de idioma
     */
    getSupportedLanguages() {
        return Object.keys(this.languagePatterns);
    }
}

module.exports = LanguageDetector; 