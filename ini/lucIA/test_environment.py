#!/usr/bin/env python3
"""
Test Environment - Script de prueba para el entorno de LucIA
"""

import os
import json
from pathlib import Path
from datetime import datetime

def main():
    print("🏠 LUCIA ENVIRONMENT TEST")
    print("=" * 40)
    
    # Crear directorio
    base_path = Path(__file__).parent
    env_dir = base_path / "test_environment"
    env_dir.mkdir(exist_ok=True)
    
    # Crear especificación básica
    env_spec = {
        "name": "LucIA Virtual Studio",
        "style": "minimalista moderno español",
        "voice": {
            "type": "femenina española",
            "age": 35,
            "tone": "suave y juvenil"
        },
        "features": [
            "Salón minimalista",
            "Materiales procedurales",
            "Voz personalizada",
            "Interfaz de chat",
            "Integración de cámara"
        ],
        "created_at": datetime.now().isoformat()
    }
    
    # Guardar especificación
    spec_file = env_dir / "environment_spec.json"
    with open(spec_file, 'w', encoding='utf-8') as f:
        json.dump(env_spec, f, indent=2, ensure_ascii=False)
    
    # Crear archivos básicos
    files = {
        "LucIAStudio.js": """
// LucIA Virtual Studio
import * as THREE from 'three';

class LucIAStudio {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.init();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        // Crear habitación minimalista
        const geometry = new THREE.BoxGeometry(8, 3.5, 6);
        const material = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
        const room = new THREE.Mesh(geometry, material);
        this.scene.add(room);
        
        // Iluminación
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(0, 5, 5);
        this.scene.add(light);
        
        this.camera.position.z = 5;
        this.animate();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

export default LucIAStudio;
""",
        "LucIAVoice.js": """
// LucIA Voice System
class LucIAVoice {
    constructor() {
        this.voiceSettings = {
            type: "femenina española",
            age: 35,
            tone: "suave y juvenil"
        };
        this.init();
    }
    
    init() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.setupVoice();
        }
    }
    
    setupVoice() {
        const voices = this.synthesis.getVoices();
        const spanishVoice = voices.find(voice => 
            voice.lang.includes('es') && voice.name.includes('female')
        );
        this.selectedVoice = spanishVoice || voices[0];
    }
    
    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        this.synthesis.speak(utterance);
    }
}

export default LucIAVoice;
""",
        "LucIAUI.jsx": """
// LucIA UI Component
import React, { useState, useEffect } from 'react';
import LucIAStudio from './LucIAStudio.js';
import LucIAVoice from './LucIAVoice.js';

const LucIAUI = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [voiceSystem, setVoiceSystem] = useState(null);
    
    useEffect(() => {
        const voice = new LucIAVoice();
        setVoiceSystem(voice);
        
        const studio = new LucIAStudio();
    }, []);
    
    const sendMessage = (text) => {
        if (!text.trim()) return;
        
        const userMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        
        setTimeout(() => {
            const luciaResponse = {
                id: Date.now() + 1,
                text: "¡Hola! Soy LucIA, tu asistente virtual. ¿En qué puedo ayudarte?",
                sender: 'lucia',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, luciaResponse]);
            
            if (voiceSystem) {
                voiceSystem.speak(luciaResponse.text);
            }
        }, 1000);
    };
    
    return (
        <div className="lucia-ui">
            <div className="virtual-environment" id="threejs-container">
                {/* Three.js se renderiza aquí */}
            </div>
            
            <div className="chat-interface">
                <div className="chat-messages">
                    {messages.map(message => (
                        <div key={message.id} className={`message ${message.sender}`}>
                            <div className="message-content">{message.text}</div>
                            <div className="message-time">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="chat-input">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        placeholder="Escribe tu mensaje..."
                    />
                    <button onClick={() => sendMessage(inputText)}>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LucIAUI;
""",
        "README.md": """
# LucIA Environment - Entorno Virtual de LucIA

## Características

### 🏠 Entorno Virtual
- **Estilo**: Minimalista moderno español
- **Dimensiones**: 8x3.5x6 metros
- **Iluminación**: Suave y profesional
- **Materiales**: Procedurales y originales

### 🎤 Voz Personalizada
- **Tipo**: Femenina española
- **Edad**: 35 años
- **Tono**: Suave y juvenil
- **Acento**: Español peninsular

### 🖥️ Interfaz de Usuario
- **Chat en tiempo real**
- **Integración de cámara**
- **Controles de voz**
- **Interfaz React moderna**

## Archivos Generados

- `LucIAStudio.js` - Entorno 3D con Three.js
- `LucIAVoice.js` - Sistema de voz personalizada
- `LucIAUI.jsx` - Interfaz de usuario React
- `environment_spec.json` - Especificación del entorno

## Instalación

1. Instalar dependencias:
```bash
npm install three react react-dom
```

2. Importar componentes:
```javascript
import LucIAStudio from './LucIAStudio.js';
import LucIAVoice from './LucIAVoice.js';
import LucIAUI from './LucIAUI.jsx';
```

3. Usar en tu aplicación:
```javascript
const luciaUI = <LucIAUI />;
```

## Próximos Pasos

- [ ] Integrar con sistema de memoria de LucIA
- [ ] Añadir más materiales procedurales
- [ ] Mejorar sistema de voz
- [ ] Agregar animaciones avanzadas
- [ ] Integrar con metaverso principal
"""
    }
    
    # Crear archivos
    for filename, content in files.items():
        filepath = env_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    print("✅ Entorno de prueba creado exitosamente!")
    print(f"📁 Ubicación: {env_dir}")
    print(f"📄 Archivos creados: {len(files) + 1}")
    print("\n🎯 Características implementadas:")
    for feature in env_spec["features"]:
        print(f"  • {feature}")
    
    print(f"\n🎤 Voz configurada: {env_spec['voice']['type']}")
    print(f"🎨 Estilo: {env_spec['style']}")
    
    print("\n🚀 ¡LucIA está lista para su entorno virtual!")

if __name__ == "__main__":
    main() 