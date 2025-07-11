#!/usr/bin/env python3
"""
Enhanced Learning System - Sistema de Aprendizaje Mejorado
Basado en las recomendaciones del avatar de LucIA para mejorar su representación 3D
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
class LearningSession:
    """Sesión de aprendizaje mejorada"""
    topic: str
    priority: int
    estimated_duration: int  # minutos
    api_used: str
    start_time: datetime
    end_time: Optional[datetime] = None
    response: str = ""
    success: bool = False
    avatar_impact: str = ""

class EnhancedLearningSystem:
    """Sistema de aprendizaje mejorado para LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.learning_dir = self.base_path / "enhanced_learning"
        self.learning_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Cargar configuración
        self.load_environment()
        
        # Cargar recomendaciones del avatar
        self.avatar_recommendations = self.load_avatar_recommendations()
        
        # Configurar APIs
        self.setup_apis()
        
        # Plan de aprendizaje mejorado
        self.enhanced_learning_plan = self.create_enhanced_plan()
        
    def load_environment(self):
        """Cargar variables de entorno"""
        from dotenv import load_dotenv
        env_file = self.base_path / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        
    def load_avatar_recommendations(self) -> List[str]:
        """Cargar recomendaciones del avatar de LucIA"""
        avatar_file = self.base_path / "lucia_avatar" / "learning_recommendations.json"
        
        if avatar_file.exists():
            with open(avatar_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("recommendations", [])
        else:
            return self.get_default_recommendations()
            
    def get_default_recommendations(self) -> List[str]:
        """Recomendaciones por defecto si no hay archivo del avatar"""
        return [
            "Advanced facial animation and expressions",
            "Realistic hair physics and simulation",
            "Clothing physics and fabric simulation",
            "Advanced skin shaders with subsurface scattering",
            "Eye movement and blinking animations",
            "Lip sync and speech animations",
            "Gesture recognition and natural movements",
            "Emotional state representation in 3D",
            "Advanced lighting for character rendering",
            "Real-time character customization systems"
        ]
        
    def setup_apis(self):
        """Configurar APIs"""
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
        self.claude_url = "https://api.anthropic.com/v1/messages"
        
        self.claude_headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_key,
            "anthropic-version": "2023-06-01"
        }
        
    def create_enhanced_plan(self) -> Dict[str, List[Dict[str, Any]]]:
        """Crear plan de aprendizaje mejorado basado en recomendaciones del avatar"""
        
        # Categorizar recomendaciones por prioridad y duración
        categorized_topics = {
            "high_priority": [
                {
                    "topic": "Advanced facial animation and expressions",
                    "priority": 5,
                    "duration": 45,
                    "avatar_impact": "Mejora expresiones faciales del avatar",
                    "description": "Sistemas avanzados de animación facial para expresiones realistas"
                },
                {
                    "topic": "Realistic hair physics and simulation",
                    "priority": 5,
                    "duration": 60,
                    "avatar_impact": "Cabello realista con física",
                    "description": "Simulación física del cabello moreno largo de LucIA"
                },
                {
                    "topic": "Advanced skin shaders with subsurface scattering",
                    "priority": 5,
                    "duration": 40,
                    "avatar_impact": "Piel mediterránea realista",
                    "description": "Shaders avanzados para la piel clara y tersa"
                }
            ],
            "medium_priority": [
                {
                    "topic": "Clothing physics and fabric simulation",
                    "priority": 4,
                    "duration": 50,
                    "avatar_impact": "Vestimenta futurista con física",
                    "description": "Simulación de la ropa blanca futurista"
                },
                {
                    "topic": "Eye movement and blinking animations",
                    "priority": 4,
                    "duration": 30,
                    "avatar_impact": "Ojos verdes expresivos",
                    "description": "Animaciones de ojos verdes intensos"
                },
                {
                    "topic": "Gesture recognition and natural movements",
                    "priority": 4,
                    "duration": 45,
                    "avatar_impact": "Movimientos naturales y gestos",
                    "description": "Sistema de gestos para comunicación"
                }
            ],
            "low_priority": [
                {
                    "topic": "Lip sync and speech animations",
                    "priority": 3,
                    "duration": 35,
                    "avatar_impact": "Sincronización de labios",
                    "description": "Animaciones de habla para comunicación"
                },
                {
                    "topic": "Emotional state representation in 3D",
                    "priority": 3,
                    "duration": 40,
                    "avatar_impact": "Estados emocionales",
                    "description": "Representación de emociones en 3D"
                },
                {
                    "topic": "Advanced lighting for character rendering",
                    "priority": 3,
                    "duration": 35,
                    "avatar_impact": "Iluminación avanzada",
                    "description": "Iluminación profesional para el avatar"
                }
            ]
        }
        
        return categorized_topics
        
    def call_gemini_api(self, topic: str, context: str = "") -> Optional[str]:
        """Llamar a Gemini API con contexto mejorado"""
        if not self.gemini_key:
            return None
            
        try:
            prompt = f"""
            Eres LucIA, una IA experta en Three.js de 35 años creando su propio avatar 3D.
            
            CONTEXTO DEL AVATAR:
            - Mujer alta (1.75m), esbelta y elegante
            - Piel mediterránea clara, cabello moreno largo
            - Ojos verdes intensos, vestimenta blanca futurista
            - Personalidad técnica pero accesible
            
            TEMA DE APRENDIZAJE: {topic}
            CONTEXTO ESPECÍFICO: {context}
            
            Proporciona una explicación técnica detallada y práctica que incluya:
            1. Fundamentos teóricos del tema
            2. Implementación paso a paso en Three.js
            3. Ejemplos de código prácticos y funcionales
            4. Optimizaciones de rendimiento específicas
            5. Integración con el avatar de LucIA
            6. Casos de uso reales y mejores prácticas
            
            Responde como una experta en desarrollo 3D enfocada en mejorar su propia representación.
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
        """Llamar a Claude API con contexto mejorado"""
        if not self.claude_key:
            return None
            
        try:
            prompt = f"""
            Eres LucIA, una IA experta en Three.js de 35 años desarrollando su avatar 3D.
            
            CONTEXTO DEL AVATAR:
            - Figura humana realista con proporciones anatómicas
            - Expresiones faciales inteligentes y expresivas
            - Movimientos fluidos y naturales
            - Vestimenta que refleja naturaleza técnica y profesional
            
            TEMA DE APRENDIZAJE: {topic}
            CONTEXTO ESPECÍFICO: {context}
            
            Analiza y proporciona una solución técnica avanzada que incluya:
            1. Análisis profundo del problema y su impacto en el avatar
            2. Solución técnica detallada con implementación completa
            3. Código Three.js optimizado y listo para usar
            4. Consideraciones de rendimiento y optimización
            5. Integración específica con el sistema de avatar
            6. Casos edge, manejo de errores y debugging
            7. Escalabilidad y mantenimiento del código
            
            Responde como una experta en desarrollo 3D con años de experiencia.
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
        
    def save_learning_session(self, session: LearningSession):
        """Guardar sesión de aprendizaje mejorada"""
        session_data = {
            "topic": session.topic,
            "priority": session.priority,
            "estimated_duration": session.estimated_duration,
            "api_used": session.api_used,
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "response": session.response,
            "success": session.success,
            "avatar_impact": session.avatar_impact
        }
        
        filename = f"{session.topic.replace(' ', '_')}_{session.api_used}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.learning_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
            
        self.logger.info(f"Sesión guardada: {session.topic} ({session.api_used})")
        
    def learn_topic(self, topic_data: Dict[str, Any]) -> bool:
        """Aprender un tema específico con ambas APIs"""
        
        topic = topic_data["topic"]
        priority = topic_data["priority"]
        duration = topic_data["duration"]
        avatar_impact = topic_data["avatar_impact"]
        
        self.logger.info(f"\n🎯 APRENDIENDO: {topic}")
        self.logger.info(f"📊 Prioridad: {priority}/5 | Duración estimada: {duration} min")
        self.logger.info(f"🎨 Impacto en avatar: {avatar_impact}")
        self.logger.info("-" * 60)
        
        success_count = 0
        
        # Aprender con Gemini
        self.logger.info("🎨 Gemini - Aprendiendo...")
        gemini_response = self.call_gemini_api(topic, avatar_impact)
        
        if gemini_response:
            session = LearningSession(
                topic=topic,
                priority=priority,
                estimated_duration=duration,
                api_used="Gemini",
                start_time=datetime.now(),
                end_time=datetime.now(),
                response=gemini_response,
                success=True,
                avatar_impact=avatar_impact
            )
            self.save_learning_session(session)
            self.logger.info("✅ Gemini completado")
            success_count += 1
        else:
            self.logger.error("❌ Gemini falló")
            
        # Aprender con Claude
        self.logger.info("🧠 Claude - Aprendiendo...")
        claude_response = self.call_claude_api(topic, avatar_impact)
        
        if claude_response:
            session = LearningSession(
                topic=topic,
                priority=priority,
                estimated_duration=duration,
                api_used="Claude",
                start_time=datetime.now(),
                end_time=datetime.now(),
                response=claude_response,
                success=True,
                avatar_impact=avatar_impact
            )
            self.save_learning_session(session)
            self.logger.info("✅ Claude completado")
            success_count += 1
        else:
            self.logger.error("❌ Claude falló")
            
        return success_count > 0
        
    def start_enhanced_learning(self):
        """Iniciar aprendizaje mejorado"""
        
        self.logger.info("🚀 SISTEMA DE APRENDIZAJE MEJORADO DE LUCIA")
        self.logger.info("=" * 60)
        self.logger.info("🎯 Objetivo: Mejorar la representación 3D del avatar")
        self.logger.info("📚 Basado en: Recomendaciones del avatar de LucIA")
        self.logger.info("⏱️  Sesiones: Más largas y detalladas")
        self.logger.info("=" * 60)
        
        total_topics = sum(len(topics) for topics in self.enhanced_learning_plan.values())
        completed_topics = 0
        
        # Procesar por prioridad
        for priority_level, topics in self.enhanced_learning_plan.items():
            self.logger.info(f"\n🔥 {priority_level.replace('_', ' ').upper()}")
            self.logger.info("=" * 40)
            
            for topic_data in topics:
                if self.learn_topic(topic_data):
                    completed_topics += 1
                    
                # Pausa entre temas
                time.sleep(5)
                
        self.logger.info(f"\n🎉 Aprendizaje mejorado completado!")
        self.logger.info(f"📊 Temas completados: {completed_topics}/{total_topics}")
        self.logger.info(f"📁 Sesiones guardadas en: {self.learning_dir}")

if __name__ == "__main__":
    enhanced_learner = EnhancedLearningSystem()
    enhanced_learner.start_enhanced_learning() 