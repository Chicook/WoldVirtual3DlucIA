#!/usr/bin/env python3
"""
LucIA Simple Advanced Learning - Solo Gemini y Claude
Versión simplificada y funcional del sistema de aprendizaje
"""

import os
import json
import time
import requests
from pathlib import Path
from datetime import datetime
import logging
from dotenv import load_dotenv

class SimpleAdvancedLearning:
    """Sistema de aprendizaje avanzado simplificado"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.learning_dir = self.base_path / "simple_advanced_learning"
        self.learning_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Cargar variables de entorno
        env_file = self.base_path / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        
        # URLs de las APIs
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
        self.claude_url = "https://api.anthropic.com/v1/messages"
        
        # Temas avanzados para aprender
        self.advanced_topics = [
            "Procedural geometry generation in Three.js",
            "Custom shaders and GLSL programming",
            "Advanced animation systems with Three.js",
            "Physics-based character animation",
            "Particle systems and visual effects",
            "Real-time character rigging and animation",
            "Advanced material and texture techniques",
            "Performance optimization for 3D scenes",
            "WebXR integration with Three.js",
            "Real-time networking for 3D avatars"
        ]
        
    def call_gemini(self, topic: str) -> str:
        """Llamar a Gemini API"""
        if not self.gemini_key:
            return "Error: Gemini API key no configurada"
            
        try:
            prompt = f"""
            Eres LucIA, una IA experta en Three.js de 35 años. 
            
            Proporciona una explicación detallada y práctica sobre: {topic}
            
            Incluye:
            1. Explicación técnica paso a paso
            2. Ejemplos de código prácticos
            3. Mejores prácticas
            4. Casos de uso reales
            5. Optimizaciones de rendimiento
            
            Responde como una experta en desarrollo 3D.
            """
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
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
                return f"Error Gemini API: {response.status_code}"
                
        except Exception as e:
            return f"Error en Gemini: {e}"
            
    def call_claude(self, topic: str) -> str:
        """Llamar a Claude API"""
        if not self.claude_key:
            return "Error: Claude API key no configurada"
            
        try:
            prompt = f"""
            Eres LucIA, una IA experta en Three.js de 35 años.
            
            Analiza y proporciona una solución técnica avanzada para: {topic}
            
            Incluye:
            1. Análisis profundo del problema
            2. Solución técnica detallada
            3. Implementación paso a paso
            4. Consideraciones de rendimiento
            5. Casos edge y manejo de errores
            6. Integración con sistemas existentes
            
            Responde como una experta con años de experiencia en desarrollo 3D.
            """
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4000,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.claude_key,
                "anthropic-version": "2023-06-01"
            }
            
            response = requests.post(
                self.claude_url,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]
            else:
                return f"Error Claude API: {response.status_code}"
                
        except Exception as e:
            return f"Error en Claude: {e}"
            
    def save_session(self, topic: str, api: str, response: str):
        """Guardar sesión de aprendizaje"""
        session_data = {
            "topic": topic,
            "api": api,
            "timestamp": datetime.now().isoformat(),
            "response": response
        }
        
        filename = f"{topic.replace(' ', '_')}_{api}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.learning_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
            
        self.logger.info(f"Sesión guardada: {topic} ({api})")
        
    def start_learning(self):
        """Iniciar aprendizaje avanzado"""
        self.logger.info("🚀 Iniciando aprendizaje avanzado de LucIA...")
        self.logger.info("📚 Solo Gemini y Claude")
        self.logger.info("=" * 50)
        
        total_topics = len(self.advanced_topics)
        completed = 0
        
        for i, topic in enumerate(self.advanced_topics, 1):
            self.logger.info(f"\n🎯 Tema {i}/{total_topics}: {topic}")
            self.logger.info("-" * 40)
            
            # Aprender con Gemini
            self.logger.info("🎨 Gemini - Aprendiendo...")
            gemini_response = self.call_gemini(topic)
            if not gemini_response.startswith("Error"):
                self.save_session(topic, "Gemini", gemini_response)
                self.logger.info("✅ Gemini completado")
            else:
                self.logger.error(f"❌ Gemini falló: {gemini_response}")
                
            # Aprender con Claude
            self.logger.info("🧠 Claude - Aprendiendo...")
            claude_response = self.call_claude(topic)
            if not claude_response.startswith("Error"):
                self.save_session(topic, "Claude", claude_response)
                self.logger.info("✅ Claude completado")
            else:
                self.logger.error(f"❌ Claude falló: {claude_response}")
                
            completed += 2
            progress = (completed / (total_topics * 2)) * 100
            self.logger.info(f"📊 Progreso: {progress:.1f}%")
            
            # Pausa entre temas
            time.sleep(3)
            
        self.logger.info("\n🎉 ¡Aprendizaje avanzado completado!")
        self.logger.info(f"📁 Sesiones guardadas en: {self.learning_dir}")

if __name__ == "__main__":
    learner = SimpleAdvancedLearning()
    learner.start_learning() 