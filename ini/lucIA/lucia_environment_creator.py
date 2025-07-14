#!/usr/bin/env python3
"""
LucIA Environment Creator - Sistema de Creación de Entorno Virtual
Permite a LucIA crear su propio espacio virtual, voz personalizada e interfaz de usuario
"""

import os
import json
import time
import requests
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

@dataclass
class EnvironmentSpecification:
    """Especificación del entorno virtual de LucIA"""
    name: str
    style: str
    dimensions: Dict[str, float]
    lighting: Dict[str, Any]
    materials: List[Dict[str, Any]]
    furniture: List[Dict[str, Any]]
    audio_settings: Dict[str, Any]
    ui_components: List[Dict[str, Any]]

class LucIAEnvironmentCreator:
    """Sistema de creación de entorno virtual para LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.environment_dir = self.base_path / "lucia_environment"
        self.environment_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Cargar configuración
        self.load_environment()
        
        # Configurar APIs
        self.setup_apis()
        
        # Especificación del entorno
        self.env_spec = self.create_environment_specification()
        
    def load_environment(self):
        """Cargar variables de entorno"""
        from dotenv import load_dotenv
        env_file = self.base_path / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        
    def setup_apis(self):
        """Configurar APIs"""
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
        self.claude_url = "https://api.anthropic.com/v1/messages"
        
        self.claude_headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_key,
            "anthropic-version": "2023-06-01"
        }
        
    def create_environment_specification(self) -> EnvironmentSpecification:
        """Crear especificación del entorno virtual"""
        
        return EnvironmentSpecification(
            name="LucIA Virtual Studio",
            style="minimalista moderno español",
            dimensions={
                "width": 8.0,
                "height": 3.5,
                "depth": 6.0
            },
            lighting={
                "main_light": "soft_white",
                "accent_light": "warm_blue",
                "intensity": 0.8,
                "shadows": True
            },
            materials=[
                {
                    "name": "paredes",
                    "type": "procedural",
                    "color": "#f5f5f5",
                    "texture": "subtle_pattern"
                },
                {
                    "name": "suelo",
                    "type": "procedural",
                    "color": "#e8e8e8",
                    "texture": "wood_planks"
                },
                {
                    "name": "muebles",
                    "type": "procedural",
                    "color": "#2c3e50",
                    "texture": "smooth_metal"
                }
            ],
            furniture=[
                {
                    "name": "escritorio",
                    "type": "desk",
                    "position": [0, 0, -2],
                    "size": [2.0, 0.8, 0.6]
                },
                {
                    "name": "silla",
                    "type": "chair",
                    "position": [0, 0, -1],
                    "size": [0.6, 1.2, 0.6]
                },
                {
                    "name": "estantería",
                    "type": "bookshelf",
                    "position": [3, 0, 0],
                    "size": [0.3, 2.5, 1.8]
                }
            ],
            audio_settings={
                "voice_type": "femenina española",
                "age": 35,
                "tone": "suave y juvenil",
                "accent": "español peninsular",
                "sample_rate": 44100,
                "quality": "high"
            },
            ui_components=[
                {
                    "name": "chat_interface",
                    "type": "react_component",
                    "position": "bottom_right",
                    "size": [400, 300]
                },
                {
                    "name": "camera_interface",
                    "type": "webcam_component",
                    "position": "top_right",
                    "size": [320, 240]
                },
                {
                    "name": "voice_controls",
                    "type": "audio_component",
                    "position": "bottom_left",
                    "size": [200, 150]
                }
            ]
        )
        
    def call_gemini_api(self, topic: str, context: str = "") -> Optional[str]:
        """Llamar a Gemini API"""
        if not self.gemini_key:
            return None
            
        try:
            prompt = f"""
            Eres LucIA, una IA experta en Three.js creando su propio entorno virtual.
            
            CONTEXTO: {context}
            TEMA: {topic}
            
            Proporciona una explicación técnica detallada que incluya:
            1. Fundamentos teóricos
            2. Implementación paso a paso en Three.js
            3. Ejemplos de código prácticos
            4. Optimizaciones de rendimiento
            5. Integración con React
            6. Mejores prácticas
            
            Responde como una experta en desarrollo 3D y web.
            """
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 4096
                }
            }
            
            response = requests.post(
                f"{self.gemini_url}?key={self.gemini_key}",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if "candidates" in result and result["candidates"]:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
            else:
                self.logger.error(f"Error Gemini API: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"Error en Gemini API: {e}")
            
        return None
        
    def call_claude_api(self, topic: str, context: str = "") -> Optional[str]:
        """Llamar a Claude API"""
        if not self.claude_key:
            return None
            
        try:
            prompt = f"""
            Eres LucIA, una IA experta en desarrollo web y 3D creando su entorno virtual.
            
            CONTEXTO: {context}
            TEMA: {topic}
            
            Analiza y proporciona una solución técnica avanzada que incluya:
            1. Análisis profundo del problema
            2. Solución técnica detallada
            3. Código optimizado y listo para usar
            4. Consideraciones de rendimiento
            5. Integración con sistemas existentes
            6. Casos edge y debugging
            7. Escalabilidad y mantenimiento
            
            Responde como una experta con años de experiencia.
            """
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 6000,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            response = requests.post(
                self.claude_url,
                headers=self.claude_headers,
                json=payload,
                timeout=90
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]
            else:
                self.logger.error(f"Error Claude API: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"Error en Claude API: {e}")
            
        return None
        
    def learn_environment_creation(self):
        """Aprender a crear el entorno virtual"""
        
        topics = [
            {
                "topic": "Minimalist room design with Three.js",
                "context": "Creating a clean, modern Spanish minimalist studio for LucIA",
                "focus": "Room geometry, lighting, and basic materials"
            },
            {
                "topic": "Procedural material generation",
                "context": "Creating original procedural textures for walls, floor, and furniture",
                "focus": "Shader-based procedural textures"
            },
            {
                "topic": "Advanced lighting techniques",
                "context": "Soft, professional lighting for a virtual studio",
                "focus": "Multiple light sources and shadows"
            },
            {
                "topic": "Furniture placement and interaction",
                "context": "Positioning desk, chair, and bookshelf in the virtual space",
                "focus": "3D object placement and collision"
            }
        ]
        
        self.logger.info("🏠 LucIA aprendiendo a crear su entorno virtual...")
        
        for topic_data in topics:
            self.logger.info(f"\n🎯 APRENDIENDO: {topic_data['topic']}")
            self.logger.info(f"📝 Contexto: {topic_data['context']}")
            self.logger.info("-" * 60)
            
            # Aprender con Gemini
            gemini_response = self.call_gemini_api(topic_data['topic'], topic_data['context'])
            if gemini_response:
                self.save_learning_session("Gemini", topic_data['topic'], gemini_response)
                self.logger.info("✅ Gemini completado")
                
            # Aprender con Claude
            claude_response = self.call_claude_api(topic_data['topic'], topic_data['context'])
            if claude_response:
                self.save_learning_session("Claude", topic_data['topic'], claude_response)
                self.logger.info("✅ Claude completado")
                
            time.sleep(3)
            
    def learn_voice_creation(self):
        """Aprender a crear voz personalizada"""
        
        topics = [
            {
                "topic": "Text-to-speech voice synthesis",
                "context": "Creating a realistic female Spanish voice for LucIA, age 35, soft and youthful tone",
                "focus": "Voice synthesis techniques and implementation"
            },
            {
                "topic": "Voice cloning and customization",
                "context": "Customizing voice parameters for Spanish female accent",
                "focus": "Voice parameter adjustment and accent simulation"
            },
            {
                "topic": "Real-time voice generation",
                "context": "Generating voice responses in real-time for chat interface",
                "focus": "Real-time audio processing and streaming"
            },
            {
                "topic": "Voice quality optimization",
                "context": "Optimizing voice quality for natural Spanish speech",
                "focus": "Audio quality enhancement and naturalness"
            }
        ]
        
        self.logger.info("🎤 LucIA aprendiendo a crear su voz personalizada...")
        
        for topic_data in topics:
            self.logger.info(f"\n🎯 APRENDIENDO: {topic_data['topic']}")
            self.logger.info(f"📝 Contexto: {topic_data['context']}")
            self.logger.info("-" * 60)
            
            # Aprender con Gemini
            gemini_response = self.call_gemini_api(topic_data['topic'], topic_data['context'])
            if gemini_response:
                self.save_learning_session("Gemini", topic_data['topic'], gemini_response)
                self.logger.info("✅ Gemini completado")
                
            # Aprender con Claude
            claude_response = self.call_claude_api(topic_data['topic'], topic_data['context'])
            if claude_response:
                self.save_learning_session("Claude", topic_data['topic'], claude_response)
                self.logger.info("✅ Claude completado")
                
            time.sleep(3)
            
    def learn_ui_creation(self):
        """Aprender a crear interfaz de usuario"""
        
        topics = [
            {
                "topic": "React chat interface development",
                "context": "Creating a chat interface for LucIA with real-time messaging",
                "focus": "React components and real-time communication"
            },
            {
                "topic": "Webcam integration with React",
                "context": "Integrating camera and microphone for video/audio interaction",
                "focus": "Media capture and streaming"
            },
            {
                "topic": "Voice interface integration",
                "context": "Connecting voice synthesis with chat interface",
                "focus": "Audio integration and user interaction"
            },
            {
                "topic": "Three.js and React integration",
                "context": "Integrating 3D environment with React UI components",
                "focus": "3D-UI integration and interaction"
            }
        ]
        
        self.logger.info("🖥️ LucIA aprendiendo a crear su interfaz de usuario...")
        
        for topic_data in topics:
            self.logger.info(f"\n🎯 APRENDIENDO: {topic_data['topic']}")
            self.logger.info(f"📝 Contexto: {topic_data['context']}")
            self.logger.info("-" * 60)
            
            # Aprender con Gemini
            gemini_response = self.call_gemini_api(topic_data['topic'], topic_data['context'])
            if gemini_response:
                self.save_learning_session("Gemini", topic_data['topic'], gemini_response)
                self.logger.info("✅ Gemini completado")
                
            # Aprender con Claude
            claude_response = self.call_claude_api(topic_data['topic'], topic_data['context'])
            if claude_response:
                self.save_learning_session("Claude", topic_data['topic'], claude_response)
                self.logger.info("✅ Claude completado")
                
            time.sleep(3)
            
    def save_learning_session(self, api: str, topic: str, response: str):
        """Guardar sesión de aprendizaje"""
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
            
    def generate_environment_code(self):
        """Generar código del entorno virtual"""
        
        # Código Three.js para el entorno
        three_js_code = f"""
// LucIA Virtual Studio - Entorno Virtual Generado
// Basado en especificaciones de LucIA

import * as THREE from 'three';
import {{ OrbitControls }} from 'three/examples/jsm/controls/OrbitControls';

class LucIAVirtualStudio {{
    constructor() {{
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.room = null;
        this.furniture = {{}};
        this.lights = {{}};
        
        this.roomSpec = {{
            name: "{self.env_spec.name}",
            style: "{self.env_spec.style}",
            dimensions: {self.env_spec.dimensions},
            lighting: {self.env_spec.lighting}
        }};
        
        this.init();
    }}
    
    init() {{
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(0, 2, 5);
        
        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({{ antialias: true }});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Crear controles
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        
        // Crear entorno
        this.createRoom();
        this.createLighting();
        this.createFurniture();
        this.createMaterials();
        
        // Agregar a DOM
        document.body.appendChild(this.renderer.domElement);
        
        // Iniciar animación
        this.animate();
    }}
    
    createRoom() {{
        // Crear geometría de la habitación
        const roomGeometry = new THREE.BoxGeometry(
            this.roomSpec.dimensions.width,
            this.roomSpec.dimensions.height,
            this.roomSpec.dimensions.depth
        );
        
        // Material de paredes
        const wallMaterial = new THREE.MeshPhongMaterial({{
            color: 0xf5f5f5,
            transparent: true,
            opacity: 0.9
        }});
        
        // Crear paredes
        const walls = new THREE.Mesh(roomGeometry, wallMaterial);
        walls.receiveShadow = true;
        this.scene.add(walls);
        
        this.room = walls;
    }}
    
    createLighting() {{
        // Luz principal suave
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(0, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        this.lights.main = mainLight;
        
        // Luz de acento azul cálido
        const accentLight = new THREE.PointLight(0x4a90e2, 0.3);
        accentLight.position.set(-3, 2, 0);
        this.scene.add(accentLight);
        this.lights.accent = accentLight;
        
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        this.lights.ambient = ambientLight;
    }}
    
    createFurniture() {{
        // Escritorio
        const deskGeometry = new THREE.BoxGeometry(2.0, 0.8, 0.6);
        const deskMaterial = new THREE.MeshPhongMaterial({{ color: 0x2c3e50 }});
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(0, 0, -2);
        desk.castShadow = true;
        desk.receiveShadow = true;
        this.scene.add(desk);
        this.furniture.desk = desk;
        
        // Silla
        const chairGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.6);
        const chairMaterial = new THREE.MeshPhongMaterial({{ color: 0x34495e }});
        const chair = new THREE.Mesh(chairGeometry, chairMaterial);
        chair.position.set(0, 0, -1);
        chair.castShadow = true;
        this.scene.add(chair);
        this.furniture.chair = chair;
        
        // Estantería
        const shelfGeometry = new THREE.BoxGeometry(0.3, 2.5, 1.8);
        const shelfMaterial = new THREE.MeshPhongMaterial({{ color: 0x2c3e50 }});
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(3, 0, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        this.scene.add(shelf);
        this.furniture.shelf = shelf;
    }}
    
    createMaterials() {{
        // Materiales procedurales
        this.materials = {{
            wall: new THREE.MeshPhongMaterial({{
                color: 0xf5f5f5,
                shininess: 10
            }}),
            floor: new THREE.MeshPhongMaterial({{
                color: 0xe8e8e8,
                shininess: 30
            }}),
            furniture: new THREE.MeshPhongMaterial({{
                color: 0x2c3e50,
                shininess: 50
            }})
        }};
    }}
    
    animate() {{
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }}
    
    // Métodos para interacción
    addAvatar(avatar) {{
        avatar.position.set(0, 0, 0);
        this.scene.add(avatar);
    }}
    
    updateLighting(intensity) {{
        this.lights.main.intensity = intensity;
    }}
    
    resize() {{
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }}
}}

// Exportar la clase
export default LucIAVirtualStudio;
"""
        
        return three_js_code
        
    def generate_voice_code(self):
        """Generar código para voz personalizada"""
        
        voice_code = f"""
// LucIA Voice System - Sistema de Voz Personalizada
// Voz femenina española, 35 años, suave y juvenil

class LucIAVoiceSystem {{
    constructor() {{
        this.voiceSettings = {{
            type: "{self.env_spec.audio_settings['voice_type']}",
            age: {self.env_spec.audio_settings['age']},
            tone: "{self.env_spec.audio_settings['tone']}",
            accent: "{self.env_spec.audio_settings['accent']}",
            sampleRate: {self.env_spec.audio_settings['sample_rate']},
            quality: "{self.env_spec.audio_settings['quality']}"
        }};
        
        this.audioContext = null;
        this.voiceSynthesis = null;
        this.isInitialized = false;
        
        this.init();
    }}
    
    async init() {{
        try {{
            // Inicializar Web Speech API
            if ('speechSynthesis' in window) {{
                this.voiceSynthesis = window.speechSynthesis;
                await this.setupVoice();
            }} else {{
                console.warn('Speech synthesis not supported');
            }}
            
            // Inicializar Audio Context para efectos
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.isInitialized = true;
            console.log('LucIA Voice System initialized');
        }} catch (error) {{
            console.error('Error initializing voice system:', error);
        }}
    }}
    
    async setupVoice() {{
        // Configurar voz española
        const voices = await this.getVoices();
        const spanishVoice = voices.find(voice => 
            voice.lang.includes('es') && voice.name.includes('female')
        );
        
        if (spanishVoice) {{
            this.selectedVoice = spanishVoice;
        }} else {{
            // Fallback a voz disponible
            this.selectedVoice = voices[0];
        }}
    }}
    
    getVoices() {{
        return new Promise((resolve) => {{
            let voices = this.voiceSynthesis.getVoices();
            if (voices.length > 0) {{
                resolve(voices);
            }} else {{
                this.voiceSynthesis.onvoiceschanged = () => {{
                    resolve(this.voiceSynthesis.getVoices());
                }};
            }}
        }});
    }}
    
    speak(text, options = {{}}) {{
        if (!this.isInitialized) {{
            console.warn('Voice system not initialized');
            return;
        }}
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar voz
        if (this.selectedVoice) {{
            utterance.voice = this.selectedVoice;
        }}
        
        // Configurar parámetros para voz suave y juvenil
        utterance.rate = 0.9;  // Velocidad ligeramente más lenta
        utterance.pitch = 1.1; // Tono ligeramente más alto
        utterance.volume = 0.8; // Volumen suave
        
        // Aplicar opciones personalizadas
        Object.assign(utterance, options);
        
        // Reproducir
        this.voiceSynthesis.speak(utterance);
        
        return utterance;
    }}
    
    // Métodos para efectos de voz
    addEcho(text, delay = 0.3, decay = 0.5) {{
        // Implementar efecto de eco
        const echoText = text;
        setTimeout(() => {{
            this.speak(echoText, {{ volume: 0.4 }});
        }}, delay * 1000);
    }}
    
    addReverb(text, roomSize = 0.8) {{
        // Implementar efecto de reverberación
        this.speak(text, {{ 
            rate: 0.85,
            pitch: 1.05
        }});
    }}
    
    // Método para generar voz procedural
    generateProceduralVoice(text) {{
        // Aquí se implementaría generación procedural de voz
        // Usando Web Audio API para crear ondas de sonido
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configurar para voz femenina
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A4
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }}
    
    // Método para reconocimiento de voz
    startVoiceRecognition() {{
        if ('webkitSpeechRecognition' in window) {{
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES';
            
            recognition.onresult = (event) => {{
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                // Procesar transcripción
                this.processVoiceInput(transcript);
            }};
            
            recognition.start();
            return recognition;
        }} else {{
            console.warn('Speech recognition not supported');
            return null;
        }}
    }}
    
    processVoiceInput(transcript) {{
        // Procesar entrada de voz
        console.log('Voice input:', transcript);
        // Aquí se conectaría con el sistema de chat de LucIA
    }}
}}

// Exportar la clase
export default LucIAVoiceSystem;
"""
        
        return voice_code
        
    def generate_ui_code(self):
        """Generar código para interfaz de usuario"""
        
        ui_code = f"""
// LucIA UI System - Sistema de Interfaz de Usuario
// Chat, cámara y controles de voz integrados

import React, {{ useState, useEffect, useRef }} from 'react';
import './LucIAUI.css';

const LucIAUI = () => {{
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [voiceSystem, setVoiceSystem] = useState(null);
    const [virtualStudio, setVirtualStudio] = useState(null);
    
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const chatRef = useRef(null);
    
    useEffect(() => {{
        // Inicializar sistemas
        initializeSystems();
        
        // Configurar reconocimiento de voz
        setupVoiceRecognition();
        
        // Configurar cámara
        setupCamera();
        
        return () => {{
            // Limpiar recursos
            cleanup();
        }};
    }}, []);
    
    const initializeSystems = async () => {{
        try {{
            // Importar sistemas dinámicamente
            const {{ default: LucIAVoiceSystem }} = await import('./LucIAVoiceSystem.js');
            const {{ default: LucIAVirtualStudio }} = await import('./LucIAVirtualStudio.js');
            
            const voice = new LucIAVoiceSystem();
            const studio = new LucIAVirtualStudio();
            
            setVoiceSystem(voice);
            setVirtualStudio(studio);
            
        }} catch (error) {{
            console.error('Error initializing systems:', error);
        }}
    }};
    
    const setupVoiceRecognition = () => {{
        if (voiceSystem) {{
            voiceSystem.startVoiceRecognition();
        }}
    }};
    
    const setupCamera = async () => {{
        try {{
            const stream = await navigator.mediaDevices.getUserMedia({{
                video: true,
                audio: true
            }});
            
            if (videoRef.current) {{
                videoRef.current.srcObject = stream;
            }}
            
            if (audioRef.current) {{
                audioRef.current.srcObject = stream;
            }}
            
        }} catch (error) {{
            console.error('Error accessing camera/microphone:', error);
        }}
    }};
    
    const sendMessage = async (text) => {{
        if (!text.trim()) return;
        
        // Agregar mensaje del usuario
        const userMessage = {{
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        }};
        
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        
        // Simular respuesta de LucIA
        setTimeout(async () => {{
            const luciaResponse = await generateLucIAResponse(text);
            
            const luciaMessage = {{
                id: Date.now() + 1,
                text: luciaResponse,
                sender: 'lucia',
                timestamp: new Date()
            }};
            
            setMessages(prev => [...prev, luciaMessage]);
            
            // Reproducir respuesta con voz
            if (voiceSystem) {{
                voiceSystem.speak(luciaResponse);
            }}
            
        }}, 1000);
    }};
    
    const generateLucIAResponse = async (userInput) => {{
        // Aquí se conectaría con el sistema de memoria de LucIA
        const responses = [
            "¡Hola! Soy LucIA, tu asistente virtual. ¿En qué puedo ayudarte?",
            "Me encanta ayudarte con el desarrollo 3D. ¿Qué te gustaría aprender?",
            "Como experta en Three.js, puedo guiarte en cualquier proyecto 3D.",
            "¿Te gustaría que te ayude a crear algo específico en el metaverso?",
            "Estoy aquí para hacer que el desarrollo 3D sea más accesible y divertido."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }};
    
    const toggleVoiceRecognition = () => {{
        setIsListening(!isListening);
        // Implementar toggle de reconocimiento de voz
    }};
    
    const toggleCamera = () => {{
        setIsCameraOn(!isCameraOn);
        // Implementar toggle de cámara
    }};
    
    const cleanup = () => {{
        // Limpiar recursos de cámara y audio
        if (videoRef.current && videoRef.current.srcObject) {{
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }}
    }};
    
    return (
        <div className="lucia-ui">
            {/* Panel principal */}
            <div className="main-panel">
                {/* Entorno 3D */}
                <div className="virtual-environment" id="threejs-container">
                    {/* Three.js se renderiza aquí */}
                </div>
                
                {/* Interfaz de chat */}
                <div className="chat-interface" ref={{chatRef}}>
                    <div className="chat-header">
                        <h3>💬 Chat con LucIA</h3>
                        <div className="chat-controls">
                            <button 
                                className={{'active': isListening}}
                                onClick={{toggleVoiceRecognition}}
                            >
                                🎤
                            </button>
                            <button 
                                className={{'active': isCameraOn}}
                                onClick={{toggleCamera}}
                            >
                                📹
                            </button>
                        </div>
                    </div>
                    
                    <div className="chat-messages">
                        {{messages.map(message => (
                            <div key={{message.id}} className={{`message ${{message.sender}}`}}>
                                <div className="message-content">
                                    {{message.text}}
                                </div>
                                <div className="message-time">
                                    {{message.timestamp.toLocaleTimeString()}}
                                </div>
                            </div>
                        ))}}
                    </div>
                    
                    <div className="chat-input">
                        <input
                            type="text"
                            value={{inputText}}
                            onChange={{e => setInputText(e.target.value)}}
                            onKeyPress={{e => e.key === 'Enter' && sendMessage(inputText)}}
                            placeholder="Escribe tu mensaje..."
                        />
                        <button onClick={{() => sendMessage(inputText)}}>
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Panel de cámara */}
            {{isCameraOn && (
                <div className="camera-panel">
                    <video
                        ref={{videoRef}}
                        autoPlay
                        muted
                        playsInline
                        className="camera-video"
                    />
                    <audio ref={{audioRef}} autoPlay />
                </div>
            )}}
            
            {/* Controles de voz */}
            <div className="voice-controls">
                <button onClick={{() => voiceSystem?.speak('Hola, soy LucIA')}}>
                    🔊 Probar Voz
                </button>
                <button onClick={{toggleVoiceRecognition}}>
                    {{isListening ? '🛑' : '🎤'}} Reconocimiento
                </button>
            </div>
        </div>
    );
}};

export default LucIAUI;
"""
        
        return ui_code
        
    def generate_css_styles(self):
        """Generar estilos CSS para la interfaz"""
        
        css_code = """
/* LucIA UI Styles - Estilos para la interfaz de LucIA */

.lucia-ui {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
}

.main-panel {
    display: flex;
    width: 100%;
    height: 100%;
}

.virtual-environment {
    flex: 1;
    position: relative;
    background: #f5f5f5;
}

#threejs-container {
    width: 100%;
    height: 100%;
}

.chat-interface {
    width: 400px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}

.chat-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
}

.chat-controls {
    display: flex;
    gap: 10px;
}

.chat-controls button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.chat-controls button:hover {
    background: rgba(102, 126, 234, 0.1);
}

.chat-controls button.active {
    background: #667eea;
    color: white;
}

.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
}

.message.user {
    align-self: flex-end;
    background: #667eea;
    color: white;
}

.message.lucia {
    align-self: flex-start;
    background: #f1f3f4;
    color: #333;
}

.message-content {
    margin-bottom: 5px;
    line-height: 1.4;
}

.message-time {
    font-size: 11px;
    opacity: 0.7;
}

.chat-input {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
}

.chat-input input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 25px;
    outline: none;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.chat-input input:focus {
    border-color: #667eea;
}

.chat-input button {
    padding: 12px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s ease;
}

.chat-input button:hover {
    background: #5a6fd8;
}

.camera-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    height: 240px;
    background: #000;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.camera-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.voice-controls {
    position: fixed;
    bottom: 20px;
    left: 20px;
    display: flex;
    gap: 10px;
}

.voice-controls button {
    padding: 15px 20px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.voice-controls button:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Responsive design */
@media (max-width: 768px) {
    .chat-interface {
        width: 100%;
        height: 50%;
        position: absolute;
        bottom: 0;
    }
    
    .virtual-environment {
        height: 50%;
    }
    
    .camera-panel {
        width: 200px;
        height: 150px;
    }
}

/* Animaciones */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.message {
    animation: fadeIn 0.3s ease;
}

/* Scrollbar personalizado */
.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
"""
        
        return css_code
        
    def save_environment_files(self):
        """Guardar todos los archivos del entorno"""
        
        # Guardar código Three.js
        three_js_code = self.generate_environment_code()
        three_js_file = self.environment_dir / "LucIAVirtualStudio.js"
        with open(three_js_file, 'w', encoding='utf-8') as f:
            f.write(three_js_code)
            
        # Guardar código de voz
        voice_code = self.generate_voice_code()
        voice_file = self.environment_dir / "LucIAVoiceSystem.js"
        with open(voice_file, 'w', encoding='utf-8') as f:
            f.write(voice_code)
            
        # Guardar código de UI
        ui_code = self.generate_ui_code()
        ui_file = self.environment_dir / "LucIAUI.jsx"
        with open(ui_file, 'w', encoding='utf-8') as f:
            f.write(ui_code)
            
        # Guardar estilos CSS
        css_code = self.generate_css_styles()
        css_file = self.environment_dir / "LucIAUI.css"
        with open(css_file, 'w', encoding='utf-8') as f:
            f.write(css_code)
            
        # Guardar especificación del entorno
        env_data = {
            "name": self.env_spec.name,
            "style": self.env_spec.style,
            "dimensions": self.env_spec.dimensions,
            "lighting": self.env_spec.lighting,
            "materials": self.env_spec.materials,
            "furniture": self.env_spec.furniture,
            "audio_settings": self.env_spec.audio_settings,
            "ui_components": self.env_spec.ui_components,
            "created_at": datetime.now().isoformat()
        }
        
        spec_file = self.environment_dir / "environment_specification.json"
        with open(spec_file, 'w', encoding='utf-8') as f:
            json.dump(env_data, f, indent=2, ensure_ascii=False)
            
        self.logger.info(f"🏠 Entorno virtual creado y guardado en: {self.environment_dir}")
        
    def create_environment(self):
        """Crear el entorno virtual completo"""
        
        self.logger.info("🏠 LucIA creando su entorno virtual...")
        self.logger.info("=" * 60)
        self.logger.info(f"🏢 Nombre: {self.env_spec.name}")
        self.logger.info(f"🎨 Estilo: {self.env_spec.style}")
        self.logger.info(f"📏 Dimensiones: {self.env_spec.dimensions}")
        self.logger.info(f"🎤 Voz: {self.env_spec.audio_settings['voice_type']}")
        self.logger.info("=" * 60)
        
        # Aprender creación de entorno
        self.learn_environment_creation()
        
        # Aprender creación de voz
        self.learn_voice_creation()
        
        # Aprender creación de UI
        self.learn_ui_creation()
        
        # Guardar archivos generados
        self.save_environment_files()
        
        self.logger.info("🎉 ¡Entorno virtual de LucIA creado exitosamente!")
        self.logger.info(f"📁 Archivos guardados en: {self.environment_dir}")

if __name__ == "__main__":
    creator = LucIAEnvironmentCreator()
    creator.create_environment() 