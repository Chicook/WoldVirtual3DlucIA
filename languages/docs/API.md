# API del Sistema de Idiomas

## Endpoints REST

### Detección de Idioma

#### POST /api/detect

Detecta el idioma de un texto.

**Request:**
```json
{
  "text": "Hola, ¿cómo estás?"
}
```

**Response:**
```json
{
  "language": "es"
}
```

### Traducción

#### POST /api/translate

Traduce texto de un idioma a otro.

**Request:**
```json
{
  "text": "Hello world",
  "from": "en",
  "to": "es"
}
```

**Response:**
```json
{
  "translation": "Hola mundo"
}
```

## WebSocket Events

### Conexión

```javascript
const socket = io('http://localhost:3001');
```

### Chat de Texto

#### Enviar mensaje
```javascript
socket.emit('chat-message', {
  text: 'Hola a todos',
  userId: 'usuario123',
  targetLanguage: 'en'
});
```

#### Recibir mensaje traducido
```javascript
socket.on('chat-message-translated', (data) => {
  console.log('Original:', data.original);
  console.log('Traducido:', data.translated);
  console.log('De:', data.fromLanguage);
  console.log('A:', data.toLanguage);
  console.log('Usuario:', data.userId);
  console.log('Timestamp:', data.timestamp);
});
```

### Chat de Voz

#### Enviar mensaje de voz
```javascript
socket.emit('voice-message', {
  audioData: audioBlob,
  userId: 'usuario123',
  targetLanguage: 'en'
});
```

#### Recibir mensaje de voz traducido
```javascript
socket.on('voice-message-translated', (data) => {
  console.log('Texto original:', data.originalText);
  console.log('Texto traducido:', data.translatedText);
  console.log('Audio traducido:', data.translatedAudio);
  console.log('De:', data.fromLanguage);
  console.log('A:', data.toLanguage);
  console.log('Usuario:', data.userId);
  console.log('Timestamp:', data.timestamp);
});
```

## Clases JavaScript

### LanguageDetector

```javascript
const detector = new LanguageDetector();

// Detectar idioma
const language = await detector.detect('Hola mundo');

// Obtener información del idioma
const info = detector.getLanguageInfo('es');

// Verificar soporte
const isSupported = detector.isSupported('es');

// Obtener idiomas soportados
const languages = detector.getSupportedLanguages();
```

### TranslationService

```javascript
const translator = new TranslationService();

// Traducir texto
const translation = await translator.translate('Hello', 'en', 'es');

// Agregar traducción personalizada
translator.addTranslation('en', 'es', 'metaverse', 'metaverso');

// Obtener estadísticas
const stats = translator.getStats();

// Verificar si se puede traducir
const canTranslate = translator.canTranslate('en', 'es');
```

### VoiceProcessor

```javascript
const voiceProcessor = new VoiceProcessor();

// Verificar soporte
const isSupported = voiceProcessor.isSupported;

// Convertir voz a texto
const text = await voiceProcessor.speechToText(audioBlob);

// Convertir texto a voz
const audio = await voiceProcessor.textToSpeech('Hello world', 'en-US');

// Obtener voces disponibles
const voices = voiceProcessor.getAvailableVoices();

// Obtener estado
const status = voiceProcessor.getStatus();
```

## Códigos de Idioma

| Código | Idioma | Nombre Nativo |
|--------|--------|---------------|
| es | Español | Español |
| en | English | English |
| fr | Français | Français |
| de | Deutsch | Deutsch |
| it | Italiano | Italiano |
| pt | Português | Português |
| ru | Русский | Русский |
| zh | 中文 | 中文 |
| ja | 日本語 | 日本語 |
| ko | 한국어 | 한국어 |

## Manejo de Errores

Todos los endpoints pueden devolver errores en el siguiente formato:

```json
{
  "error": "Descripción del error"
}
```

Códigos de estado HTTP comunes:
- `200` - Éxito
- `400` - Error en la solicitud
- `500` - Error interno del servidor

## Ejemplos de Uso

### Cliente JavaScript Completo

```javascript
class LanguageClient {
    constructor() {
        this.socket = io('http://localhost:3001');
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.socket.on('chat-message-translated', (data) => {
            this.displayMessage(data);
        });

        this.socket.on('voice-message-translated', (data) => {
            this.displayVoiceMessage(data);
        });
    }

    async detectLanguage(text) {
        const response = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return response.json();
    }

    async translateText(text, from, to) {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, from, to })
        });
        return response.json();
    }

    sendChatMessage(text, userId, targetLanguage) {
        this.socket.emit('chat-message', { text, userId, targetLanguage });
    }

    displayMessage(data) {
        console.log(`${data.userId}: ${data.translated}`);
    }
}

// Uso
const client = new LanguageClient();
client.sendChatMessage('Hola mundo', 'usuario1', 'en');
``` 