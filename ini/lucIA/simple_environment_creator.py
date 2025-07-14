#!/usr/bin/env python3
"""
Simple Environment Creator - Versión simplificada para LucIA
Crea entorno virtual, voz personalizada e interfaz de usuario
"""

import os
import json
import time
import requests
from pathlib import Path
from datetime import datetime
import logging

class SimpleEnvironmentCreator:
    """Creador de entorno simplificado para LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.environment_dir = self.base_path / "lucia_environment"
        self.environment_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar APIs
        self.load_apis()
        
    def load_apis(self):
        """Cargar configuración de APIs"""
        from dotenv import load_dotenv
        env_file = self.base_path / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        
    def call_gemini(self, topic: str) -> str:
        """Llamar a Gemini API"""
        if not self.gemini_key:
            return "API key no disponible"
            
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={self.gemini_key}"
            
            prompt = f"""
            Eres LucIA, una IA experta en Three.js creando su entorno virtual.
            
            TEMA: {topic}
            
            Proporciona una explicación técnica detallada que incluya:
            1. Fundamentos teóricos
            2. Implementación paso a paso en Three.js
            3. Ejemplos de código prácticos
            4. Optimizaciones de rendimiento
            5. Integración con React
            
            Responde como una experta en desarrollo 3D y web.
            """
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048
                }
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if "candidates" in result and result["candidates"]:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
            else:
                return f"Error API: {response.status_code}"
                
        except Exception as e:
            return f"Error: {str(e)}"
            
    def call_claude(self, topic: str) -> str:
        """Llamar a Claude API"""
        if not self.claude_key:
            return "API key no disponible"
            
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.claude_key,
                "anthropic-version": "2023-06-01"
            }
            
            prompt = f"""
            Eres LucIA, una IA experta en desarrollo web y 3D.
            
            TEMA: {topic}
            
            Proporciona una solución técnica que incluya:
            1. Análisis del problema
            2. Solución técnica detallada
            3. Código optimizado
            4. Consideraciones de rendimiento
            5. Integración con sistemas existentes
            
            Responde como una experta con experiencia.
            """
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 3000,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            
            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]
            else:
                return f"Error API: {response.status_code}"
                
        except Exception as e:
            return f"Error: {str(e)}"
            
    def learn_environment_topics(self):
        """Aprender temas de entorno virtual"""
        
        topics = [
            "Minimalist room design with Three.js",
            "Procedural material generation for walls and floor",
            "Advanced lighting techniques for virtual studio",
            "Furniture placement and interaction in 3D space"
        ]
        
        self.logger.info("🏠 LucIA aprendiendo creación de entorno virtual...")
        
        for topic in topics:
            self.logger.info(f"\n🎯 APRENDIENDO: {topic}")
            self.logger.info("-" * 50)
            
            # Gemini
            self.logger.info("🎨 Gemini - Aprendiendo...")
            gemini_response = self.call_gemini(topic)
            self.save_response("Gemini", topic, gemini_response)
            self.logger.info("✅ Gemini completado")
            
            # Claude
            self.logger.info("🧠 Claude - Aprendiendo...")
            claude_response = self.call_claude(topic)
            self.save_response("Claude", topic, claude_response)
            self.logger.info("✅ Claude completado")
            
            time.sleep(2)
            
    def learn_voice_topics(self):
        """Aprender temas de voz personalizada"""
        
        topics = [
            "Text-to-speech voice synthesis for Spanish female voice",
            "Voice cloning and customization techniques",
            "Real-time voice generation with Web Speech API",
            "Voice quality optimization for natural speech"
        ]
        
        self.logger.info("🎤 LucIA aprendiendo creación de voz personalizada...")
        
        for topic in topics:
            self.logger.info(f"\n🎯 APRENDIENDO: {topic}")
            self.logger.info("-" * 50)
            
            # Gemini
            self.logger.info("🎨 Gemini - Aprendiendo...")
            gemini_response = self.call_gemini(topic)
            self.save_response("Gemini", topic, gemini_response)
            self.logger.info("✅ Gemini completado")
            
            # Claude
            self.logger.info("🧠 Claude - Aprendiendo...")
            claude_response = self.call_claude(topic)
            self.save_response("Claude", topic, claude_response)
            self.logger.info("✅ Claude completado")
            
            time.sleep(2)
            
    def learn_ui_topics(self):
        """Aprender temas de interfaz de usuario"""
        
        topics = [
            "React chat interface development with real-time messaging",
            "Webcam and microphone integration with React",
            "Voice interface integration with chat system",
            "Three.js and React integration for 3D UI"
        ]
        
        self.logger.info("🖥️ LucIA aprendiendo creación de interfaz de usuario...")
        
        for topic in topics:
            self.logger.info(f"\n🎯 APRENDIENDO: {topic}")
            self.logger.info("-" * 50)
            
            # Gemini
            self.logger.info("🎨 Gemini - Aprendiendo...")
            gemini_response = self.call_gemini(topic)
            self.save_response("Gemini", topic, gemini_response)
            self.logger.info("✅ Gemini completado")
            
            # Claude
            self.logger.info("🧠 Claude - Aprendiendo...")
            claude_response = self.call_claude(topic)
            self.save_response("Claude", topic, claude_response)
            self.logger.info("✅ Claude completado")
            
            time.sleep(2)
            
    def save_response(self, api: str, topic: str, response: str):
        """Guardar respuesta de aprendizaje"""
        session_data = {
            "api": api,
            "topic": topic,
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
        
        filename = f"{topic.replace(' ', '_')}_{api}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.environment_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
            
    def generate_environment_files(self):
        """Generar archivos del entorno"""
        
        # Especificación del entorno
        env_spec = {
            "name": "LucIA Virtual Studio",
            "style": "minimalista moderno español",
            "dimensions": {"width": 8.0, "height": 3.5, "depth": 6.0},
            "lighting": {"main_light": "soft_white", "accent_light": "warm_blue"},
            "voice_settings": {
                "type": "femenina española",
                "age": 35,
                "tone": "suave y juvenil",
                "accent": "español peninsular"
            },
            "ui_components": ["chat_interface", "camera_interface", "voice_controls"],
            "created_at": datetime.now().isoformat()
        }
        
        # Guardar especificación
        spec_file = self.environment_dir / "environment_specification.json"
        with open(spec_file, 'w', encoding='utf-8') as f:
            json.dump(env_spec, f, indent=2, ensure_ascii=False)
            
        # Generar código básico
        self.generate_basic_code()
        
        self.logger.info(f"📁 Archivos del entorno guardados en: {self.environment_dir}")
        
    def generate_basic_code(self):
        """Generar código básico del entorno"""
        
        # Código Three.js básico
        three_js_code = """
// LucIA Virtual Studio - Código básico
import * as THREE from 'three';

class LucIAStudio {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        
        this.init();
    }
    
    init() {
        // Configuración básica
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        // Crear habitación minimalista
        this.createRoom();
        this.createLighting();
        this.createFurniture();
        
        this.camera.position.z = 5;
        this.animate();
    }
    
    createRoom() {
        // Paredes
        const geometry = new THREE.BoxGeometry(8, 3.5, 6);
        const material = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
        const room = new THREE.Mesh(geometry, material);
        this.scene.add(room);
    }
    
    createLighting() {
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(0, 5, 5);
        this.scene.add(light);
        
        const ambient = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambient);
    }
    
    createFurniture() {
        // Escritorio
        const deskGeometry = new THREE.BoxGeometry(2, 0.8, 0.6);
        const deskMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(0, 0, -2);
        this.scene.add(desk);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

export default LucIAStudio;
"""
        
        # Guardar código Three.js
        three_file = self.environment_dir / "LucIAStudio.js"
        with open(three_file, 'w', encoding='utf-8') as f:
            f.write(three_js_code)
            
        # Código de voz básico
        voice_code = """
// LucIA Voice System - Código básico
class LucIAVoice {
    constructor() {
        this.voiceSettings = {
            type: "femenina española",
            age: 35,
            tone: "suave y juvenil",
            accent: "español peninsular"
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
"""
        
        # Guardar código de voz
        voice_file = self.environment_dir / "LucIAVoice.js"
        with open(voice_file, 'w', encoding='utf-8') as f:
            f.write(voice_code)
            
        # Código React básico
        react_code = """
// LucIA UI - Código React básico
import React, { useState, useEffect } from 'react';
import LucIAStudio from './LucIAStudio.js';
import LucIAVoice from './LucIAVoice.js';

const LucIAUI = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [voiceSystem, setVoiceSystem] = useState(null);
    
    useEffect(() => {
        // Inicializar sistemas
        const voice = new LucIAVoice();
        setVoiceSystem(voice);
        
        // Inicializar estudio 3D
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
        
        // Simular respuesta de LucIA
        setTimeout(() => {
            const luciaResponse = {
                id: Date.now() + 1,
                text: "¡Hola! Soy LucIA, tu asistente virtual. ¿En qué puedo ayudarte?",
                sender: 'lucia',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, luciaResponse]);
            
            // Reproducir con voz
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
"""
        
        # Guardar código React
        react_file = self.environment_dir / "LucIAUI.jsx"
        with open(react_file, 'w', encoding='utf-8') as f:
            f.write(react_code)
            
    def create_environment(self):
        """Crear el entorno completo"""
        
        self.logger.info("🏠 LUCIA ENVIRONMENT CREATOR")
        self.logger.info("=" * 50)
        self.logger.info("🎯 Objetivo: Crear entorno virtual, voz e interfaz")
        self.logger.info("🎨 Estilo: Minimalista moderno español")
        self.logger.info("🎤 Voz: Femenina española, 35 años, suave y juvenil")
        self.logger.info("🖥️ UI: Chat, cámara y controles de voz")
        self.logger.info("=" * 50)
        
        # Aprender temas
        self.learn_environment_topics()
        self.learn_voice_topics()
        self.learn_ui_topics()
        
        # Generar archivos
        self.generate_environment_files()
        
        self.logger.info("🎉 ¡Entorno de LucIA creado exitosamente!")
        self.logger.info(f"📁 Archivos guardados en: {self.environment_dir}")

if __name__ == "__main__":
    creator = SimpleEnvironmentCreator()
    creator.create_environment() 