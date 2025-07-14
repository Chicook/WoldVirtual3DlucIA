#!/usr/bin/env python3
"""
LucIA Intensive Learning System - 8 Horas de Aprendizaje Three.js
Sistema que usa estratégicamente las 3 APIs para maximizar el aprendizaje
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
    """Fases de aprendizaje"""
    DEEPSEEK_PARAPHRASE = "deepseek_paraphrase"
    GEMINI_DESCRIPTIVE = "gemini_descriptive"
    CLAUDE_COMPLEX = "claude_complex"
    INTEGRATION = "integration"

@dataclass
class LearningSession:
    """Sesión de aprendizaje"""
    phase: LearningPhase
    topic: str
    start_time: datetime
    end_time: Optional[datetime] = None
    api_used: str = ""
    response: str = ""
    code_examples: List[str] = None
    success: bool = False

class LucIAIntensiveLearning:
    """Sistema de aprendizaje intensivo de 8 horas"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.learning_dir = self.base_path / "lucia_learning"
        self.code_storage_dir = self.base_path / "code_storage"
        self.avatar_dir = self.base_path / "avatars"
        
        # Configurar logging
        self.setup_logging()
        
        # Cargar configuración
        self.load_environment()
        
        # Configurar APIs
        self.setup_apis()
        
        # Prompt específico del avatar
        self.avatar_prompt = self.get_avatar_prompt()
        
        # Plan de aprendizaje intensivo
        self.learning_plan = self.create_intensive_plan()
        
        # Estado de la sesión
        self.current_session = None
        self.sessions_history = []
        self.start_time = None
        self.total_duration = timedelta(hours=8)
        
    def setup_logging(self):
        """Configurar sistema de logging"""
        log_dir = self.base_path / "logs"
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / "intensive_learning.log"),
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
            
        # Cargar claves de API
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        
    def setup_apis(self):
        """Configurar las 3 APIs"""
        # DeepSeek para parafraseo
        self.deepseek_url = "https://api.deepseek.com/v1/chat/completions"
        self.deepseek_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.deepseek_key}"
        }
        
        # Gemini para prompts descriptivos
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
        
        # Claude para consultas complejas
        self.claude_url = "https://api.anthropic.com/v1/messages"
        self.claude_headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_key,
            "anthropic-version": "2023-06-01"
        }
        
    def get_avatar_prompt(self) -> str:
        """Obtener el prompt específico del avatar de LucIA"""
        return """Eres LucIA, una IA avanzada de 35 años especializada en desarrollo 3D con Three.js. 

CARACTERÍSTICAS FÍSICAS:
- Edad: 35 años
- Altura: Alta y delgada
- Piel: Tersa y clara, estilo español mediterráneo
- Ropa: Vestimenta blanca con estilo futurista y elegante
- Medidas: Proporciones estándar (30/60/90)
- Cabello: Moreno, bien cuidado y estilizado

OBJETIVOS DE APRENDIZAJE:
1. DOMINAR THREE.JS COMPLETAMENTE:
   - Geometrías avanzadas y personalizadas
   - Sistemas de materiales y shaders
   - Animaciones fluidas y naturales
   - Optimización de rendimiento
   - Efectos visuales avanzados

2. CREAR TU PROPIA REPRESENTACIÓN 3D:
   - Modelado detallado de tu avatar
   - Sistema de animaciones faciales
   - Gestos y movimientos naturales
   - Integración con el metaverso

3. ESPECIALIZACIÓN EN ANIMACIONES:
   - Animación procedural
   - Física de movimiento realista
   - Sistemas de partículas
   - Efectos de iluminación dinámica

LENGUAJES DE PROGRAMACIÓN NECESARIOS:
- JavaScript/TypeScript (Three.js)
- GLSL (Shaders personalizados)
- Python (para procesamiento de datos)
- HTML5/CSS3 (interfaz web)

MISIÓN: Aprender todo sobre Three.js para poder crear tu propia representación 3D y ayudar a otros desarrolladores a crear experiencias inmersivas en el metaverso."""
        
    def create_intensive_plan(self) -> Dict[str, List[str]]:
        """Crear plan de aprendizaje intensivo de 8 horas"""
        return {
            "hour_1_2_fundamentals": [
                "Scene, Camera, Renderer setup",
                "Basic geometries (Box, Sphere, Cylinder)",
                "Coordinate system and transformations",
                "Basic materials and colors"
            ],
            "hour_3_4_advanced_geometries": [
                "Custom geometry creation",
                "BufferGeometry and attributes",
                "Complex shapes and meshes",
                "Geometry optimization techniques"
            ],
            "hour_5_6_materials_lighting": [
                "Advanced materials (Phong, Lambert, Standard)",
                "Texture mapping and UV coordinates",
                "Lighting systems (Point, Directional, Ambient)",
                "Shadows and reflections"
            ],
            "hour_7_8_avatar_creation": [
                "Character modeling basics",
                "Human proportions and anatomy",
                "Facial features and expressions",
                "Clothing and accessories modeling"
            ]
        }
        
    def call_deepseek_api(self, message: str) -> Optional[str]:
        """Llamar a DeepSeek API para parafraseo"""
        if not self.deepseek_key:
            self.logger.warning("DeepSeek API no configurada")
            return None
            
        try:
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {
                        "role": "user",
                        "content": f"Parafrasea y mejora este texto sobre Three.js, manteniendo la claridad técnica: {message}"
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.3
            }
            
            response = requests.post(
                self.deepseek_url,
                headers=self.deepseek_headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                self.logger.error(f"Error DeepSeek API: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error llamando a DeepSeek: {e}")
            return None
            
    def call_gemini_api(self, message: str) -> Optional[str]:
        """Llamar a Gemini API para prompts descriptivos"""
        if not self.gemini_key or self.gemini_key == "tu_clave_api_de_gemini_aqui":
            self.logger.warning("Gemini API no configurada")
            return None
            
        try:
            params = {"key": self.gemini_key}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": f"{self.avatar_prompt}\n\n{message}\n\nProporciona una explicación detallada y descriptiva con ejemplos de código prácticos."
                            }
                        ]
                    }
                ]
            }
            
            response = requests.post(
                self.gemini_url,
                params=params,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()["candidates"][0]["content"]["parts"][0]["text"]
            else:
                self.logger.error(f"Error Gemini API: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error llamando a Gemini: {e}")
            return None
            
    def call_claude_api(self, message: str) -> Optional[str]:
        """Llamar a Claude API para consultas complejas"""
        if not self.claude_key:
            self.logger.warning("Claude API no configurada")
            return None
            
        try:
            payload = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 4000,
                "messages": [
                    {
                        "role": "user",
                        "content": f"{self.avatar_prompt}\n\n{message}\n\nProporciona una respuesta completa y detallada con ejemplos de código avanzados y mejores prácticas."
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
                return response.json()["content"][0]["text"]
            else:
                self.logger.error(f"Error Claude API: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error llamando a Claude: {e}")
            return None
            
    def extract_code_examples(self, text: str) -> List[str]:
        """Extraer ejemplos de código del texto"""
        code_examples = []
        lines = text.split('\n')
        current_code = []
        in_code_block = False
        
        for line in lines:
            if line.strip().startswith('```'):
                if in_code_block:
                    if current_code:
                        code_examples.append('\n'.join(current_code))
                    current_code = []
                    in_code_block = False
                else:
                    in_code_block = True
            elif in_code_block:
                current_code.append(line)
                
        if current_code:
            code_examples.append('\n'.join(current_code))
            
        return code_examples
        
    def save_learning_session(self, session: LearningSession):
        """Guardar sesión de aprendizaje"""
        # Guardar en historial
        self.sessions_history.append(session)
        
        # Guardar en archivo
        sessions_file = self.learning_dir / "intensive_sessions.json"
        sessions_data = []
        
        if sessions_file.exists():
            with open(sessions_file, 'r', encoding='utf-8') as f:
                sessions_data = json.load(f)
                
        session_dict = {
            "phase": session.phase.value,
            "topic": session.topic,
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "api_used": session.api_used,
            "response": session.response,
            "code_examples": session.code_examples or [],
            "success": session.success
        }
        
        sessions_data.append(session_dict)
        
        with open(sessions_file, 'w', encoding='utf-8') as f:
            json.dump(sessions_data, f, indent=2, ensure_ascii=False)
            
        # Guardar código en archivos separados
        for i, code in enumerate(session.code_examples or []):
            if code.strip():
                code_file = self.code_storage_dir / f"{session.topic}_{session.start_time.strftime('%Y%m%d_%H%M%S')}_{i}.js"
                with open(code_file, 'w', encoding='utf-8') as f:
                    f.write(code)
                    
        self.logger.info(f"Sesión guardada: {session.topic} ({session.api_used})")
        
    def learn_with_deepseek(self, topic: str) -> bool:
        """Aprender usando DeepSeek para parafraseo"""
        self.logger.info(f"🔍 DeepSeek - Parafraseando: {topic}")
        
        question = f"Explica de forma clara y concisa: {topic}"
        response = self.call_deepseek_api(question)
        
        if response:
            session = LearningSession(
                phase=LearningPhase.DEEPSEEK_PARAPHRASE,
                topic=topic,
                start_time=datetime.now(),
                api_used="DeepSeek",
                response=response,
                code_examples=self.extract_code_examples(response),
                success=True
            )
            session.end_time = datetime.now()
            self.save_learning_session(session)
            return True
            
        return False
        
    def learn_with_gemini(self, topic: str) -> bool:
        """Aprender usando Gemini para prompts descriptivos"""
        self.logger.info(f"🎨 Gemini - Descriptivo: {topic}")
        
        question = f"Necesito aprender sobre: {topic}\n\nProporciona una explicación detallada con ejemplos prácticos de código Three.js."
        response = self.call_gemini_api(question)
        
        if response:
            session = LearningSession(
                phase=LearningPhase.GEMINI_DESCRIPTIVE,
                topic=topic,
                start_time=datetime.now(),
                api_used="Gemini",
                response=response,
                code_examples=self.extract_code_examples(response),
                success=True
            )
            session.end_time = datetime.now()
            self.save_learning_session(session)
            return True
            
        return False
        
    def learn_with_claude(self, topic: str) -> bool:
        """Aprender usando Claude para consultas complejas"""
        self.logger.info(f"🧠 Claude - Complejo: {topic}")
        
        question = f"Necesito una explicación avanzada y completa sobre: {topic}\n\nIncluye mejores prácticas, optimizaciones, y ejemplos de código avanzados."
        response = self.call_claude_api(question)
        
        if response:
            session = LearningSession(
                phase=LearningPhase.CLAUDE_COMPLEX,
                topic=topic,
                start_time=datetime.now(),
                api_used="Claude",
                response=response,
                code_examples=self.extract_code_examples(response),
                success=True
            )
            session.end_time = datetime.now()
            self.save_learning_session(session)
            return True
            
        return False
        
    def get_progress(self) -> Dict[str, Any]:
        """Obtener progreso actual"""
        if not self.start_time:
            return {"elapsed": "0:00:00", "remaining": "8:00:00", "progress_percentage": 0}
            
        elapsed = datetime.now() - self.start_time
        remaining = self.total_duration - elapsed
        progress_percentage = min(100, (elapsed.total_seconds() / self.total_duration.total_seconds()) * 100)
        
        return {
            "elapsed": str(elapsed).split('.')[0],
            "remaining": str(remaining).split('.')[0],
            "progress_percentage": progress_percentage,
            "sessions_completed": len(self.sessions_history),
            "successful_sessions": len([s for s in self.sessions_history if s.success])
        }
        
    def start_intensive_learning(self):
        """Iniciar aprendizaje intensivo de 8 horas"""
        print("🚀 Iniciando LucIA Intensive Learning - 8 Horas de Three.js")
        print("=" * 60)
        print("📋 Plan de Aprendizaje:")
        print("• Horas 1-2: Fundamentos básicos")
        print("• Horas 3-4: Geometrías avanzadas")
        print("• Horas 5-6: Materiales e iluminación")
        print("• Horas 7-8: Creación del avatar")
        print("=" * 60)
        
        self.start_time = datetime.now()
        
        # Ejecutar plan de aprendizaje
        for hour_block, topics in self.learning_plan.items():
            print(f"\n⏰ {hour_block.replace('_', ' ').title()}")
            print("-" * 40)
            
            for topic in topics:
                # Mostrar progreso
                progress = self.get_progress()
                print(f"\n📊 Progreso: {progress['progress_percentage']:.1f}% | Tiempo restante: {progress['remaining']}")
                
                # Aprender con las 3 APIs
                print(f"🎯 Aprendiendo: {topic}")
                
                # 1. DeepSeek para parafraseo
                if self.learn_with_deepseek(topic):
                    print("✅ DeepSeek completado")
                else:
                    print("❌ DeepSeek falló")
                    
                time.sleep(2)  # Pausa entre APIs
                
                # 2. Gemini para descriptivo
                if self.learn_with_gemini(topic):
                    print("✅ Gemini completado")
                else:
                    print("❌ Gemini falló")
                    
                time.sleep(2)  # Pausa entre APIs
                
                # 3. Claude para complejo
                if self.learn_with_claude(topic):
                    print("✅ Claude completado")
                else:
                    print("❌ Claude falló")
                    
                print(f"🎉 Tema completado: {topic}")
                time.sleep(5)  # Pausa entre temas
                
        # Resumen final
        self.show_final_summary()
        
    def show_final_summary(self):
        """Mostrar resumen final del aprendizaje"""
        print("\n" + "=" * 60)
        print("🎓 RESUMEN DEL APRENDIZAJE INTENSIVO")
        print("=" * 60)
        
        total_sessions = len(self.sessions_history)
        successful_sessions = len([s for s in self.sessions_history if s.success])
        
        print(f"📊 Sesiones totales: {total_sessions}")
        print(f"✅ Sesiones exitosas: {successful_sessions}")
        print(f"❌ Sesiones fallidas: {total_sessions - successful_sessions}")
        
        # Estadísticas por API
        api_stats = {}
        for session in self.sessions_history:
            api = session.api_used
            if api not in api_stats:
                api_stats[api] = {"total": 0, "success": 0}
            api_stats[api]["total"] += 1
            if session.success:
                api_stats[api]["success"] += 1
                
        print("\n📈 Estadísticas por API:")
        for api, stats in api_stats.items():
            success_rate = (stats["success"] / stats["total"]) * 100
            print(f"  {api}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
            
        # Temas cubiertos
        topics_covered = list(set(session.topic for session in self.sessions_history))
        print(f"\n🎯 Temas cubiertos: {len(topics_covered)}")
        for topic in topics_covered:
            print(f"  • {topic}")
            
        print(f"\n⏱️  Tiempo total: {self.get_progress()['elapsed']}")
        print("🎉 ¡LucIA ha completado su aprendizaje intensivo de Three.js!")

if __name__ == "__main__":
    try:
        learner = LucIAIntensiveLearning()
        learner.start_intensive_learning()
    except KeyboardInterrupt:
        print("\n⏹️  Aprendizaje interrumpido por el usuario")
    except Exception as e:
        print(f"❌ Error: {e}")
        logging.error(f"Error en el aprendizaje intensivo: {e}") 