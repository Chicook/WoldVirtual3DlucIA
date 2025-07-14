/**
 * Procesador de Voz - Sistema básico de procesamiento de voz
 */

class VoiceProcessor {
    constructor() {
        this.speechRecognition = null;
        this.speechSynthesis = null;
        this.isSupported = this.checkSupport();
        
        if (this.isSupported) {
            this.initializeSpeechAPI();
        }
    }

    /**
     * Verifica si las APIs de voz están soportadas
     * @returns {boolean} - True si están soportadas
     */
    checkSupport() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition) &&
               !!(window.speechSynthesis);
    }

    /**
     * Inicializa las APIs de voz
     */
    initializeSpeechAPI() {
        // Inicializar reconocimiento de voz
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
        }

        // Inicializar síntesis de voz
        if (window.speechSynthesis) {
            this.speechSynthesis = window.speechSynthesis;
        }
    }

    /**
     * Convierte voz a texto
     * @param {Blob} audioData - Datos de audio
     * @returns {Promise<string>} - Texto reconocido
     */
    async speechToText(audioData) {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) {
                reject(new Error('Speech recognition no está soportado'));
                return;
            }

            if (!this.speechRecognition) {
                reject(new Error('Speech recognition no está disponible'));
                return;
            }

            let finalTranscript = '';
            let interimTranscript = '';

            this.speechRecognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
            };

            this.speechRecognition.onend = () => {
                resolve(finalTranscript || interimTranscript);
            };

            this.speechRecognition.onerror = (event) => {
                reject(new Error(`Error en reconocimiento de voz: ${event.error}`));
            };

            // Iniciar reconocimiento
            this.speechRecognition.start();
        });
    }

    /**
     * Convierte texto a voz
     * @param {string} text - Texto a convertir
     * @param {string} language - Idioma para la síntesis
     * @returns {Promise<Blob>} - Datos de audio
     */
    async textToSpeech(text, language = 'en-US') {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) {
                reject(new Error('Speech synthesis no está soportado'));
                return;
            }

            if (!this.speechSynthesis) {
                reject(new Error('Speech synthesis no está disponible'));
                return;
            }

            // Crear utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Configurar voces según el idioma
            this.setVoiceForLanguage(utterance, language);

            utterance.onend = () => {
                // En una implementación real, aquí se capturaría el audio
                // Por ahora, simulamos un blob de audio
                const audioBlob = new Blob(['audio_data'], { type: 'audio/wav' });
                resolve(audioBlob);
            };

            utterance.onerror = (event) => {
                reject(new Error(`Error en síntesis de voz: ${event.error}`));
            };

            // Iniciar síntesis
            this.speechSynthesis.speak(utterance);
        });
    }

    /**
     * Configura la voz apropiada para el idioma
     * @param {SpeechSynthesisUtterance} utterance - Utterance a configurar
     * @param {string} language - Idioma objetivo
     */
    setVoiceForLanguage(utterance, language) {
        const voices = this.speechSynthesis.getVoices();
        
        // Buscar voz apropiada para el idioma
        const voice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
        
        if (voice) {
            utterance.voice = voice;
        }
    }

    /**
     * Obtiene voces disponibles
     * @returns {Array} - Lista de voces disponibles
     */
    getAvailableVoices() {
        if (!this.speechSynthesis) {
            return [];
        }

        return this.speechSynthesis.getVoices().map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default
        }));
    }

    /**
     * Obtiene idiomas soportados para síntesis
     * @returns {Array} - Lista de idiomas soportados
     */
    getSupportedLanguages() {
        if (!this.speechSynthesis) {
            return [];
        }

        const voices = this.speechSynthesis.getVoices();
        const languages = new Set();
        
        voices.forEach(voice => {
            const lang = voice.lang.split('-')[0];
            languages.add(lang);
        });

        return Array.from(languages);
    }

    /**
     * Pausa la síntesis de voz
     */
    pauseSpeech() {
        if (this.speechSynthesis) {
            this.speechSynthesis.pause();
        }
    }

    /**
     * Reanuda la síntesis de voz
     */
    resumeSpeech() {
        if (this.speechSynthesis) {
            this.speechSynthesis.resume();
        }
    }

    /**
     * Cancela la síntesis de voz
     */
    cancelSpeech() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    /**
     * Cancela el reconocimiento de voz
     */
    cancelRecognition() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
    }

    /**
     * Configura el idioma para reconocimiento de voz
     * @param {string} language - Código de idioma
     */
    setRecognitionLanguage(language) {
        if (this.speechRecognition) {
            this.speechRecognition.lang = language;
        }
    }

    /**
     * Obtiene el estado del procesador de voz
     * @returns {object} - Estado del sistema
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            speechRecognition: !!this.speechRecognition,
            speechSynthesis: !!this.speechSynthesis,
            availableVoices: this.getAvailableVoices().length,
            supportedLanguages: this.getSupportedLanguages()
        };
    }

    /**
     * Simula procesamiento de audio (para desarrollo)
     * @param {string} text - Texto a simular
     * @returns {Promise<string>} - Texto simulado
     */
    async simulateSpeechToText(text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(text);
            }, 1000);
        });
    }

    /**
     * Simula síntesis de voz (para desarrollo)
     * @param {string} text - Texto a sintetizar
     * @param {string} language - Idioma
     * @returns {Promise<Blob>} - Audio simulado
     */
    async simulateTextToSpeech(text, language = 'en-US') {
        return new Promise((resolve) => {
            setTimeout(() => {
                const audioBlob = new Blob([text], { type: 'audio/wav' });
                resolve(audioBlob);
            }, 1000);
        });
    }
}

module.exports = VoiceProcessor; 