/**
 * Sistema de Idiomas y Traducción - Metaverso Crypto World Virtual 3D
 * @author Metaverso Team
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const LanguageDetector = require('./core/language-detector');
const TranslationService = require('./core/translation-service');
const VoiceProcessor = require('./core/voice-processor');

class LanguageSystem {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.languageDetector = new LanguageDetector();
        this.translationService = new TranslationService();
        this.voiceProcessor = new VoiceProcessor();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }

    setupRoutes() {
        // Ruta principal
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Sistema de Idiomas - Metaverso Crypto World Virtual 3D',
                version: '1.0.0',
                status: 'Activo'
            });
        });

        // API de detección de idioma
        this.app.post('/api/detect', async (req, res) => {
            try {
                const { text } = req.body;
                const detectedLanguage = await this.languageDetector.detect(text);
                res.json({ language: detectedLanguage });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // API de traducción
        this.app.post('/api/translate', async (req, res) => {
            try {
                const { text, from, to } = req.body;
                const translation = await this.translationService.translate(text, from, to);
                res.json({ translation });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Usuario conectado:', socket.id);

            // Chat de texto con traducción
            socket.on('chat-message', async (data) => {
                try {
                    const { text, userId, targetLanguage } = data;
                    
                    // Detectar idioma del mensaje
                    const detectedLanguage = await this.languageDetector.detect(text);
                    
                    // Traducir si es necesario
                    let translatedText = text;
                    if (detectedLanguage !== targetLanguage) {
                        translatedText = await this.translationService.translate(
                            text, 
                            detectedLanguage, 
                            targetLanguage
                        );
                    }

                    // Enviar mensaje traducido a todos
                    this.io.emit('chat-message-translated', {
                        original: text,
                        translated: translatedText,
                        fromLanguage: detectedLanguage,
                        toLanguage: targetLanguage,
                        userId: userId,
                        timestamp: new Date()
                    });
                } catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });

            // Chat de voz
            socket.on('voice-message', async (data) => {
                try {
                    const { audioData, userId, targetLanguage } = data;
                    
                    // Procesar audio y convertir a texto
                    const speechText = await this.voiceProcessor.speechToText(audioData);
                    
                    // Detectar idioma
                    const detectedLanguage = await this.languageDetector.detect(speechText);
                    
                    // Traducir texto
                    const translatedText = await this.translationService.translate(
                        speechText,
                        detectedLanguage,
                        targetLanguage
                    );
                    
                    // Convertir texto traducido a voz
                    const translatedAudio = await this.voiceProcessor.textToSpeech(
                        translatedText,
                        targetLanguage
                    );

                    // Enviar audio traducido
                    this.io.emit('voice-message-translated', {
                        originalText: speechText,
                        translatedText: translatedText,
                        translatedAudio: translatedAudio,
                        fromLanguage: detectedLanguage,
                        toLanguage: targetLanguage,
                        userId: userId,
                        timestamp: new Date()
                    });
                } catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });

            socket.on('disconnect', () => {
                console.log('Usuario desconectado:', socket.id);
            });
        });
    }

    start(port = 3001) {
        this.server.listen(port, () => {
            console.log(`🚀 Sistema de Idiomas iniciado en puerto ${port}`);
            console.log(`📡 WebSocket disponible en ws://localhost:${port}`);
            console.log(`🌍 API REST disponible en http://localhost:${port}`);
        });
    }
}

// Iniciar sistema
const languageSystem = new LanguageSystem();
languageSystem.start();

module.exports = LanguageSystem; 