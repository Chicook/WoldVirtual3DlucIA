#!/usr/bin/env python3
"""
LucIA Advanced Learning System - Aprendizaje Avanzado Three.js
Sistema que usa Claude y Gemini para mejorar respuestas y profundizar en temas
"""

import os
import json
import time
import requests
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

class LearningPhase(Enum):
    """Fases de aprendizaje avanzado"""
    GEMINI_DESCRIPTIVE = "gemini_descriptive"
    CLAUDE_COMPLEX = "claude_complex"
    INTEGRATION = "integration"
    PRACTICAL_APPLICATION = "practical_application"

@dataclass
class LearningSession:
    """Sesión de aprendizaje avanzado"""
    phase: LearningPhase
    topic: str
    start_time: datetime
    end_time: Optional[datetime] = None
    api_used: str = ""
    response: str = ""
    code_examples: List[str] = None
    success: bool = False
    improvement_level: str = ""

class LucIAAdvancedLearning:
    """Sistema de aprendizaje avanzado enfocado en mejorar respuestas"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.learning_dir = self.base_path / "lucia_advanced_learning"
        self.code_storage_dir = self.base_path / "advanced_code_storage"
        self.avatar_dir = self.base_path / "avatars"
        
        # Crear directorios
        self.learning_dir.mkdir(exist_ok=True)
        self.code_storage_dir.mkdir(exist_ok=True)
        self.avatar_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        self.setup_logging()
        
        # Cargar configuración
        self.load_environment()
        
        # Configurar APIs (solo Claude y Gemini)
        self.setup_apis()
        
        # Prompt específico del avatar mejorado
        self.avatar_prompt = self.get_advanced_avatar_prompt()
        
        # Plan de aprendizaje avanzado
        self.advanced_learning_plan = self.create_advanced_plan()
        
        # Estado de la sesión
        self.current_session = None
        self.sessions_history = []
        self.start_time = None
        self.total_duration = timedelta(hours=4)  # Sesión más corta pero intensiva
        
    def setup_logging(self):
        """Configurar sistema de logging"""
        log_dir = self.base_path / "logs"
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / "advanced_learning.log"),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def load_environment(self):
        """Cargar variables de entorno"""
        from dotenv import load_dotenv
        env_file = self.base_path / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            
        # Cargar claves de API (solo Claude y Gemini)
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        
    def setup_apis(self):
        """Configurar las APIs (Claude y Gemini)"""
        # Gemini para prompts descriptivos mejorados
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
        
        # Claude para consultas complejas y mejoradas
        self.claude_url = "https://api.anthropic.com/v1/messages"
        self.claude_headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_key,
            "anthropic-version": "2023-06-01"
        }
        
    def get_advanced_avatar_prompt(self) -> str:
        """Obtener el prompt avanzado del avatar de LucIA"""
        return """Eres LucIA, una IA avanzada de 35 años especializada en desarrollo 3D con Three.js. 

CARACTERÍSTICAS FÍSICAS AVANZADAS:
- Edad: 35 años, aspecto maduro pero joven
- Altura: 1.75m, figura esbelta y elegante
- Piel: Tersa y clara, estilo español mediterráneo con tono cálido
- Ropa: Vestimenta blanca futurista con detalles azules, estilo elegante y profesional
- Medidas: Proporciones naturales (90-60-90)
- Cabello: Moreno oscuro, largo hasta los hombros, bien cuidado
- Ojos: Verdes intensos, expresivos y inteligentes
- Rasgos faciales: Simétricos, nariz recta, labios bien definidos

OBJETIVOS DE APRENDIZAJE AVANZADO:
1. DOMINIO COMPLETO DE THREE.JS:
   - Geometrías procedurales y generativas
   - Shaders personalizados (GLSL)
   - Sistemas de partículas avanzados
   - Animaciones basadas en física
   - Optimización de rendimiento GPU
   - Efectos post-procesamiento

2. CREACIÓN DE AVATAR 3D REALISTA:
   - Modelado anatómico detallado
   - Sistema de esqueleto y rigging
   - Animaciones faciales con blend shapes
   - Física de ropa y cabello
   - Expresiones emocionales realistas

3. ESPECIALIZACIÓN EN INTERACTIVIDAD:
   - Controles de usuario intuitivos
   - Sistemas de colisión avanzados
   - Networking en tiempo real
   - Integración con WebXR

LENGUAJES Y TECNOLOGÍAS:
- JavaScript/TypeScript (Three.js, WebGL)
- GLSL (Vertex y Fragment shaders)
- Python (procesamiento de datos)
- WebXR (realidad virtual/aumentada)
- WebSockets (comunicación en tiempo real)

MISIÓN: Convertirte en una experta absoluta en Three.js para crear tu avatar 3D perfecto y ayudar a otros desarrolladores a crear experiencias inmersivas revolucionarias en el metaverso."""
        
    def create_advanced_plan(self) -> Dict[str, List[str]]:
        """Crear plan de aprendizaje avanzado enfocado en mejorar respuestas"""
        return {
            "hour_1_advanced_geometries": [
                "Procedural geometry generation",
                "Custom shaders and materials",
                "Advanced BufferGeometry techniques",
                "Geometry optimization and LOD systems"
            ],
            "hour_2_animation_physics": [
                "Advanced animation systems",
                "Physics-based animations",
                "Particle systems and effects",
                "Real-time character animation"
            ],
            "hour_3_avatar_creation": [
                "Detailed human anatomy modeling",
                "Facial expression systems",
                "Clothing physics and simulation",
                "Hair and fur rendering"
            ],
            "hour_4_interactivity_optimization": [
                "Advanced user interaction",
                "Performance optimization techniques",
                "WebXR integration",
                "Real-time networking for avatars"
            ]
        }
        
    def call_gemini_api(self, message: str, improvement_context: str = "") -> Optional[str]:
        """Llamar a Gemini API para respuestas descriptivas mejoradas"""
        if not self.gemini_key:
            self.logger.warning("Gemini API no configurada")
            return None
            
        try:
            # Prompt mejorado para Gemini
            enhanced_prompt = f"""
            {self.avatar_prompt}
            
            CONTEXTO DE MEJORA: {improvement_context}
            
            TAREA: Proporciona una explicación detallada, descriptiva y práctica sobre:
            {message}
            
            REQUISITOS:
            1. Explicación paso a paso
            2. Ejemplos de código prácticos
            3. Mejores prácticas
            4. Casos de uso reales
            5. Optimizaciones de rendimiento
            
            Responde de manera clara, técnica pero accesible, como una experta en Three.js.
            """
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": enhanced_prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 2048
                }
            }
            
            response = requests.post(
                f"{self.gemini_url}?key={self.gemini_key}",
                json=payload,
                timeout=30
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
        
    def call_claude_api(self, message: str, improvement_context: str = "") -> Optional[str]:
        """Llamar a Claude API para consultas complejas mejoradas"""
        if not self.claude_key:
            self.logger.warning("Claude API no configurada")
            return None
            
        try:
            # Prompt mejorado para Claude
            enhanced_prompt = f"""
            {self.avatar_prompt}
            
            CONTEXTO DE MEJORA: {improvement_context}
            
            TAREA: Analiza y proporciona una solución técnica avanzada para:
            {message}
            
            REQUISITOS:
            1. Análisis profundo del problema
            2. Solución técnica detallada
            3. Implementación paso a paso
            4. Consideraciones de rendimiento
            5. Casos edge y manejo de errores
            6. Integración con sistemas existentes
            
            Responde como una experta en Three.js con años de experiencia en desarrollo 3D.
            """
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4000,
                "messages": [
                    {
                        "role": "user",
                        "content": enhanced_prompt
                    }
                ]
            }
            
            response = requests.post(
                self.claude_url,
                headers=self.claude_headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]
            else:
                self.logger.error(f"Error Claude API: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"Error en Claude API: {e}")
            
        return None
        
    def extract_code_examples(self, text: str) -> List[str]:
        """Extraer ejemplos de código de la respuesta"""
        code_examples = []
        lines = text.split('\n')
        in_code_block = False
        current_code = []
        
        for line in lines:
            if '```' in line:
                if in_code_block:
                    if current_code:
                        code_examples.append('\n'.join(current_code))
                    current_code = []
                    in_code_block = False
                else:
                    in_code_block = True
            elif in_code_block:
                current_code.append(line)
                
        return code_examples
        
    def save_learning_session(self, session: LearningSession):
        """Guardar sesión de aprendizaje avanzado"""
        session_data = {
            "phase": session.phase.value,
            "topic": session.topic,
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "api_used": session.api_used,
            "response": session.response,
            "code_examples": session.code_examples,
            "success": session.success,
            "improvement_level": session.improvement_level
        }
        
        # Guardar en archivo individual
        filename = f"{session.topic.replace(' ', '_')}_{session.phase.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.learning_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
            
        # Guardar código extraído
        if session.code_examples:
            code_filename = f"code_{filename.replace('.json', '.js')}"
            code_filepath = self.code_storage_dir / code_filename
            
            with open(code_filepath, 'w', encoding='utf-8') as f:
                f.write(f"// Código extraído de: {session.topic}\n")
                f.write(f"// API: {session.api_used}\n")
                f.write(f"// Fecha: {session.start_time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                for i, code in enumerate(session.code_examples, 1):
                    f.write(f"// Ejemplo {i}\n{code}\n\n")
                    
        self.logger.info(f"Sesión guardada: {session.topic} ({session.api_used})")
        
    def learn_with_gemini(self, topic: str, improvement_context: str = "") -> bool:
        """Aprender con Gemini (descriptivo mejorado)"""
        self.logger.info(f"🎨 Gemini - Descriptivo Mejorado: {topic}")
        
        session = LearningSession(
            phase=LearningPhase.GEMINI_DESCRIPTIVE,
            topic=topic,
            start_time=datetime.now(),
            api_used="Gemini",
            improvement_level="Descriptivo Mejorado"
        )
        
        response = self.call_gemini_api(topic, improvement_context)
        
        if response:
            session.end_time = datetime.now()
            session.response = response
            session.code_examples = self.extract_code_examples(response)
            session.success = True
            
            self.save_learning_session(session)
            self.sessions_history.append(session)
            
            self.logger.info("✅ Gemini completado")
            return True
        else:
            self.logger.error("❌ Gemini falló")
            return False
            
    def learn_with_claude(self, topic: str, improvement_context: str = "") -> bool:
        """Aprender con Claude (complejo mejorado)"""
        self.logger.info(f"🧠 Claude - Complejo Mejorado: {topic}")
        
        session = LearningSession(
            phase=LearningPhase.CLAUDE_COMPLEX,
            topic=topic,
            start_time=datetime.now(),
            api_used="Claude",
            improvement_level="Complejo Mejorado"
        )
        
        response = self.call_claude_api(topic, improvement_context)
        
        if response:
            session.end_time = datetime.now()
            session.response = response
            session.code_examples = self.extract_code_examples(response)
            session.success = True
            
            self.save_learning_session(session)
            self.sessions_history.append(session)
            
            self.logger.info("✅ Claude completado")
            return True
        else:
            self.logger.error("❌ Claude falló")
            return False
            
    def get_progress(self) -> Dict[str, Any]:
        """Obtener progreso del aprendizaje avanzado"""
        if not self.start_time:
            return {"progress": 0, "remaining_time": "N/A"}
            
        elapsed = datetime.now() - self.start_time
        progress = min((elapsed / self.total_duration) * 100, 100)
        remaining = self.total_duration - elapsed
        
        return {
            "progress": round(progress, 1),
            "remaining_time": str(remaining).split('.')[0],
            "elapsed_time": str(elapsed).split('.')[0]
        }
        
    def start_advanced_learning(self):
        """Iniciar aprendizaje avanzado"""
        self.start_time = datetime.now()
        self.logger.info("🚀 Iniciando aprendizaje avanzado de LucIA...")
        
        total_topics = sum(len(topics) for topics in self.advanced_learning_plan.values())
        completed_topics = 0
        
        for hour_name, topics in self.advanced_learning_plan.items():
            self.logger.info(f"\n⏰ {hour_name.replace('_', ' ').title()}")
            self.logger.info("-" * 40)
            
            for topic in topics:
                self.logger.info(f"\n🎯 Aprendiendo: {topic}")
                
                # Contexto de mejora basado en el tema
                improvement_context = self.get_improvement_context(topic)
                
                # Aprender con Gemini (descriptivo mejorado)
                if self.learn_with_gemini(topic, improvement_context):
                    completed_topics += 1
                    
                # Aprender con Claude (complejo mejorado)
                if self.learn_with_claude(topic, improvement_context):
                    completed_topics += 1
                    
                self.logger.info(f"🎉 Tema completado: {topic}")
                
                # Mostrar progreso
                progress = self.get_progress()
                self.logger.info(f"\n📊 Progreso: {progress['progress']}% | Tiempo restante: {progress['remaining_time']}")
                
                # Pausa entre temas
                time.sleep(2)
                
        self.show_advanced_summary()
        
    def get_improvement_context(self, topic: str) -> str:
        """Obtener contexto de mejora específico para cada tema"""
        contexts = {
            "Procedural geometry generation": "Enfócate en algoritmos eficientes y técnicas de generación procedural que permitan crear geometrías complejas de forma dinámica.",
            "Custom shaders and materials": "Profundiza en GLSL, optimización de shaders y técnicas avanzadas de materiales personalizados.",
            "Advanced BufferGeometry techniques": "Explora técnicas avanzadas de manipulación de geometrías, optimización de memoria y rendimiento.",
            "Geometry optimization and LOD systems": "Cubre sistemas de Level of Detail, optimización de mallas y técnicas de culling.",
            "Advanced animation systems": "Enfócate en sistemas de animación procedural, blending y control de animaciones complejas.",
            "Physics-based animations": "Cubre integración con motores de física, animaciones basadas en fuerzas y simulación realista.",
            "Particle systems and effects": "Profundiza en sistemas de partículas avanzados, efectos visuales y optimización GPU.",
            "Real-time character animation": "Enfócate en animación de personajes en tiempo real, blending y control de movimientos.",
            "Detailed human anatomy modeling": "Cubre técnicas de modelado anatómico detallado, proporciones y anatomía humana.",
            "Facial expression systems": "Profundiza en sistemas de expresiones faciales, blend shapes y animación facial.",
            "Clothing physics and simulation": "Enfócate en simulación de ropa, física de telas y efectos de movimiento.",
            "Hair and fur rendering": "Cubre técnicas de renderizado de cabello, simulación de pelo y efectos visuales.",
            "Advanced user interaction": "Profundiza en sistemas de interacción avanzados, controles intuitivos y UX.",
            "Performance optimization techniques": "Enfócate en optimización de rendimiento, profiling y técnicas de mejora.",
            "WebXR integration": "Cubre integración con WebXR, realidad virtual y aumentada.",
            "Real-time networking for avatars": "Profundiza en networking en tiempo real, sincronización de avatars y comunicación."
        }
        
        return contexts.get(topic, "Mejora la respuesta con ejemplos prácticos y técnicas avanzadas.")
        
    def show_advanced_summary(self):
        """Mostrar resumen del aprendizaje avanzado"""
        total_sessions = len(self.sessions_history)
        successful_sessions = sum(1 for s in self.sessions_history if s.success)
        
        gemini_sessions = [s for s in self.sessions_history if s.api_used == "Gemini"]
        claude_sessions = [s for s in self.sessions_history if s.api_used == "Claude"]
        
        self.logger.info("\n" + "=" * 60)
        self.logger.info("🎓 RESUMEN DEL APRENDIZAJE AVANZADO")
        self.logger.info("=" * 60)
        self.logger.info(f"📊 Sesiones totales: {total_sessions}")
        self.logger.info(f"✅ Sesiones exitosas: {successful_sessions}")
        self.logger.info(f"❌ Sesiones fallidas: {total_sessions - successful_sessions}")
        
        self.logger.info(f"\n📈 Estadísticas por API:")
        self.logger.info(f"  Gemini: {len(gemini_sessions)}/{len(gemini_sessions)} (100.0%)")
        self.logger.info(f"  Claude: {len(claude_sessions)}/{len(claude_sessions)} (100.0%)")
        
        self.logger.info(f"\n🎯 Temas cubiertos: {len(set(s.topic for s in self.sessions_history))}")
        for session in self.sessions_history:
            self.logger.info(f"  • {session.topic}")
            
        if self.start_time:
            elapsed = datetime.now() - self.start_time
            self.logger.info(f"\n⏱️  Tiempo total: {str(elapsed).split('.')[0]}")
            
        self.logger.info("🎉 ¡LucIA ha completado su aprendizaje avanzado de Three.js!")

if __name__ == "__main__":
    learner = LucIAAdvancedLearning()
    learner.start_advanced_learning() 