/**
 * Cliente JavaScript para el Sistema de Idiomas
 */

class LanguageClient {
    constructor() {
        this.socket = io();
        this.voiceProcessor = null;
        this.isVoiceActive = false;
        
        this.initializeSocket();
        this.initializeVoice();
        this.loadSystemStatus();
    }

    /**
     * Inicializa la conexión WebSocket
     */
    initializeSocket() {
        this.socket.on('connect', () => {
            console.log('Conectado al servidor de idiomas');
            this.updateStatus('Conectado al servidor', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado del servidor');
            this.updateStatus('Desconectado del servidor', 'error');
        });

        this.socket.on('chat-message-translated', (data) => {
            this.displayChatMessage(data);
        });

        this.socket.on('voice-message-translated', (data) => {
            this.displayVoiceMessage(data);
        });

        this.socket.on('error', (data) => {
            this.showError(data.message);
        });
    }

    /**
     * Inicializa el procesador de voz
     */
    initializeVoice() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.voiceProcessor = {
                recognition: new (window.SpeechRecognition || window.webkitSpeechRecognition)(),
                synthesis: window.speechSynthesis
            };
            
            this.voiceProcessor.recognition.continuous = true;
            this.voiceProcessor.recognition.interimResults = true;
            
            this.voiceProcessor.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (finalTranscript) {
                    this.sendVoiceMessage(finalTranscript);
                }
            };
            
            this.voiceProcessor.recognition.onerror = (event) => {
                this.showError(`Error de reconocimiento de voz: ${event.error}`);
            };
        }
    }

    /**
     * Detecta el idioma del texto
     */
    async detectLanguage() {
        const text = document.getElementById('detectionText').value;
        if (!text.trim()) {
            this.showError('Por favor, ingresa texto para detectar');
            return;
        }

        try {
            const response = await fetch('/api/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();
            
            if (data.error) {
                this.showError(data.error);
            } else {
                const languageNames = {
                    'es': 'Español',
                    'en': 'English',
                    'fr': 'Français',
                    'de': 'Deutsch',
                    'it': 'Italiano'
                };
                
                const result = document.getElementById('detectionResult');
                result.innerHTML = `
                    <strong>Idioma detectado:</strong> ${languageNames[data.language] || data.language}
                    <br><small>Código: ${data.language}</small>
                `;
            }
        } catch (error) {
            this.showError('Error al detectar idioma: ' + error.message);
        }
    }

    /**
     * Traduce texto
     */
    async translateText() {
        const text = document.getElementById('translateText').value;
        const from = document.getElementById('fromLanguage').value;
        const to = document.getElementById('toLanguage').value;

        if (!text.trim()) {
            this.showError('Por favor, ingresa texto para traducir');
            return;
        }

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, from, to })
            });

            const data = await response.json();
            
            if (data.error) {
                this.showError(data.error);
            } else {
                const result = document.getElementById('translationResult');
                result.innerHTML = `
                    <strong>Traducción:</strong><br>
                    <em>${text}</em> → <strong>${data.translation}</strong>
                `;
            }
        } catch (error) {
            this.showError('Error al traducir: ' + error.message);
        }
    }

    /**
     * Envía mensaje de chat
     */
    sendChatMessage() {
        const text = document.getElementById('chatInput').value;
        const targetLanguage = document.getElementById('chatLanguage').value;
        const userName = document.getElementById('userName').value;

        if (!text.trim()) return;

        this.socket.emit('chat-message', {
            text,
            userId: userName,
            targetLanguage
        });

        document.getElementById('chatInput').value = '';
    }

    /**
     * Envía mensaje de voz
     */
    sendVoiceMessage(text) {
        const targetLanguage = document.getElementById('chatLanguage').value;
        const userName = document.getElementById('userName').value;

        // Simular datos de audio
        const audioData = new Blob([text], { type: 'audio/wav' });

        this.socket.emit('voice-message', {
            audioData,
            userId: userName,
            targetLanguage
        });
    }

    /**
     * Muestra mensaje de chat
     */
    displayChatMessage(data) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const time = new Date(data.timestamp).toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="user">${data.userId}</div>
            <div class="time">${time}</div>
            <div class="original">${data.original}</div>
            ${data.original !== data.translated ? `<div class="translated">${data.translated}</div>` : ''}
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Muestra mensaje de voz
     */
    displayVoiceMessage(data) {
        const messagesContainer = document.getElementById('voiceMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'voice-message';
        
        const time = new Date(data.timestamp).toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="audio-indicator">🎤 ${data.userId}</div>
            <div class="time">${time}</div>
            <div class="original">${data.originalText}</div>
            <div class="translated">${data.translatedText}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Inicia chat de voz
     */
    startVoiceChat() {
        if (!this.voiceProcessor) {
            this.showError('Reconocimiento de voz no está disponible');
            return;
        }

        const targetLanguage = document.getElementById('chatLanguage').value;
        this.voiceProcessor.recognition.lang = this.getLanguageCode(targetLanguage);
        this.voiceProcessor.recognition.start();
        
        this.isVoiceActive = true;
        document.getElementById('startVoice').disabled = true;
        document.getElementById('stopVoice').disabled = false;
        document.getElementById('voiceStatus').innerHTML = '🎤 Escuchando...';
    }

    /**
     * Detiene chat de voz
     */
    stopVoiceChat() {
        if (this.voiceProcessor) {
            this.voiceProcessor.recognition.stop();
        }
        
        this.isVoiceActive = false;
        document.getElementById('startVoice').disabled = false;
        document.getElementById('stopVoice').disabled = true;
        document.getElementById('voiceStatus').innerHTML = '⏹️ Detenido';
    }

    /**
     * Intercambia idiomas de traducción
     */
    swapLanguages() {
        const fromSelect = document.getElementById('fromLanguage');
        const toSelect = document.getElementById('toLanguage');
        
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
    }

    /**
     * Carga el estado del sistema
     */
    async loadSystemStatus() {
        try {
            const response = await fetch('/');
            const data = await response.json();
            
            const statusDiv = document.getElementById('systemStatus');
            statusDiv.innerHTML = `
                <strong>Estado:</strong> ${data.status}<br>
                <strong>Versión:</strong> ${data.version}<br>
                <strong>Mensaje:</strong> ${data.message}
            `;
        } catch (error) {
            this.updateStatus('Error al cargar estado: ' + error.message, 'error');
        }
    }

    /**
     * Actualiza el estado del sistema
     */
    refreshStatus() {
        this.loadSystemStatus();
    }

    /**
     * Obtiene código de idioma para reconocimiento de voz
     */
    getLanguageCode(language) {
        const codes = {
            'es': 'es-ES',
            'en': 'en-US',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT'
        };
        return codes[language] || 'en-US';
    }

    /**
     * Muestra error
     */
    showError(message) {
        console.error(message);
        // Aquí podrías mostrar una notificación visual
        alert(message);
    }

    /**
     * Actualiza estado
     */
    updateStatus(message, type = 'info') {
        const statusDiv = document.getElementById('systemStatus');
        const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
        statusDiv.innerHTML = `<div class="${className}">${message}</div>`;
    }
}

// Inicializar cliente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.languageClient = new LanguageClient();
    
    // Event listeners para botones
    window.detectLanguage = () => window.languageClient.detectLanguage();
    window.translateText = () => window.languageClient.translateText();
    window.sendChatMessage = () => window.languageClient.sendChatMessage();
    window.startVoiceChat = () => window.languageClient.startVoiceChat();
    window.stopVoiceChat = () => window.languageClient.stopVoiceChat();
    window.swapLanguages = () => window.languageClient.swapLanguages();
    window.refreshStatus = () => window.languageClient.refreshStatus();
    
    // Event listener para Enter en chat
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.languageClient.sendChatMessage();
        }
    });
}); 