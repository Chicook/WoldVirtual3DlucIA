/**
 * Ejemplo de Chat Multilingüe - Sistema de Idiomas
 * 
 * Este ejemplo simula un chat con múltiples usuarios
 * hablando diferentes idiomas con traducción automática.
 */

const LanguageDetector = require('../src/core/language-detector');
const TranslationService = require('../src/core/translation-service');

class ChatSimulator {
    constructor() {
        this.detector = new LanguageDetector();
        this.translator = new TranslationService();
        this.messages = [];
        this.users = [
            { id: 'user1', name: 'María', language: 'es' },
            { id: 'user2', name: 'John', language: 'en' },
            { id: 'user3', name: 'Pierre', language: 'fr' },
            { id: 'user4', name: 'Hans', language: 'de' }
        ];
    }

    /**
     * Simula un mensaje de chat
     */
    async simulateMessage(userId, text) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // Detectar idioma del mensaje
        const detectedLanguage = await this.detector.detect(text);
        
        // Traducir para cada usuario
        const translations = {};
        for (const targetUser of this.users) {
            if (targetUser.language !== detectedLanguage) {
                translations[targetUser.language] = await this.translator.translate(
                    text, 
                    detectedLanguage, 
                    targetUser.language
                );
            } else {
                translations[targetUser.language] = text;
            }
        }

        const message = {
            id: Date.now(),
            userId,
            userName: user.name,
            originalText: text,
            detectedLanguage,
            translations,
            timestamp: new Date()
        };

        this.messages.push(message);
        this.displayMessage(message);
        
        return message;
    }

    /**
     * Muestra un mensaje en la consola
     */
    displayMessage(message) {
        console.log(`\n💬 ${message.userName} (${message.detectedLanguage}):`);
        console.log(`   Original: "${message.originalText}"`);
        
        for (const [lang, translation] of Object.entries(message.translations)) {
            if (lang !== message.detectedLanguage) {
                const langNames = { 'es': 'Español', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch' };
                console.log(`   ${langNames[lang]}: "${translation}"`);
            }
        }
        
        console.log(`   ⏰ ${message.timestamp.toLocaleTimeString()}`);
    }

    /**
     * Ejecuta una conversación simulada
     */
    async runConversation() {
        console.log('🌍 Iniciando Chat Multilingüe Simulado\n');
        console.log('Usuarios conectados:');
        this.users.forEach(user => {
            const langNames = { 'es': 'Español', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch' };
            console.log(`   ${user.name} (${langNames[user.language]})`);
        });
        console.log('');

        // Simular conversación
        const conversation = [
            { user: 'user1', text: '¡Hola a todos! ¿Cómo están?' },
            { user: 'user2', text: 'Hello everyone! I am doing well, thank you.' },
            { user: 'user3', text: 'Bonjour! Je suis très content de vous rencontrer.' },
            { user: 'user4', text: 'Hallo! Es ist schön, euch alle zu treffen.' },
            { user: 'user1', text: '¿Qué piensan del metaverso?' },
            { user: 'user2', text: 'I think the metaverse is very interesting!' },
            { user: 'user3', text: 'Le métavers est fascinant, n\'est-ce pas?' },
            { user: 'user4', text: 'Ja, das Metaversum ist wirklich beeindruckend!' }
        ];

        for (const msg of conversation) {
            await this.simulateMessage(msg.user, msg.text);
            // Simular delay entre mensajes
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n📊 Estadísticas de la conversación:');
        console.log(`   Total de mensajes: ${this.messages.length}`);
        
        const languageStats = {};
        this.messages.forEach(msg => {
            languageStats[msg.detectedLanguage] = (languageStats[msg.detectedLanguage] || 0) + 1;
        });
        
        console.log('   Mensajes por idioma:');
        for (const [lang, count] of Object.entries(languageStats)) {
            const langNames = { 'es': 'Español', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch' };
            console.log(`     ${langNames[lang]}: ${count}`);
        }
    }

    /**
     * Obtiene mensajes traducidos para un usuario específico
     */
    getMessagesForUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return [];

        return this.messages.map(msg => ({
            ...msg,
            displayText: msg.translations[user.language] || msg.originalText
        }));
    }
}

// Ejecutar ejemplo
async function ejecutarEjemploChat() {
    const chat = new ChatSimulator();
    await chat.runConversation();
}

if (require.main === module) {
    ejecutarEjemploChat().catch(console.error);
}

module.exports = { ChatSimulator, ejecutarEjemploChat }; 