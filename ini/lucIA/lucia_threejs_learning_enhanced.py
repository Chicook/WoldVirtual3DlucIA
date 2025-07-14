#!/usr/bin/env python3
"""
LucIA Three.js Learning Enhanced
Sistema avanzado de aprendizaje de Three.js para crear el avatar 3D de LucIA
"""

import os
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

class LucIAThreeJSLearning:
    """Sistema de aprendizaje de Three.js para LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.learning_dir = self.base_path / "lucia_learning"
        self.code_storage_dir = self.base_path / "code_storage"
        self.avatar_dir = self.base_path / "avatars"
        
        # Configurar logging
        self.setup_logging()
        
        # Cargar configuración
        self.config = self.load_config()
        
        # Configurar API de Claude
        self.setup_claude_api()
        
        # Prompt específico del avatar
        self.avatar_prompt = self.get_avatar_prompt()
        
    def setup_logging(self):
        """Configurar sistema de logging"""
        log_dir = self.base_path / "logs"
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / "threejs_learning.log"),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def load_config(self) -> Dict[str, Any]:
        """Cargar configuración de aprendizaje"""
        config_file = self.learning_dir / "threejs_learning_config.json"
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
        
    def setup_claude_api(self):
        """Configurar API de Claude"""
        from dotenv import load_dotenv
        load_dotenv(self.base_path / ".env")
        
        self.claude_api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.claude_api_key:
            raise ValueError("ANTHROPIC_API_KEY no encontrada en .env")
            
        self.claude_url = "https://api.anthropic.com/v1/messages"
        self.claude_headers = {
            "Content-Type": "application/json",
            "x-api-key": self.claude_api_key,
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

MISIÓN: Aprender todo sobre Three.js para poder crear tu propia representación 3D y ayudar a otros desarrolladores a crear experiencias inmersivas en el metaverso.

¿Estás lista para comenzar tu aprendizaje intensivo de Three.js y crear tu avatar 3D?"""
        
    def call_claude_api(self, message: str, system_prompt: str = None) -> str:
        """Llamar a la API de Claude"""
        try:
            payload = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 4000,
                "messages": [
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            }
            
            if system_prompt:
                payload["system"] = system_prompt
                
            response = requests.post(
                self.claude_url,
                headers=self.claude_headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json()["content"][0]["text"]
            else:
                self.logger.error(f"Error API Claude: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error llamando a Claude API: {e}")
            return None
            
    def save_learning_session(self, topic: str, question: str, answer: str, code_examples: List[str]):
        """Guardar sesión de aprendizaje"""
        session_data = {
            "timestamp": datetime.now().isoformat(),
            "topic": topic,
            "question": question,
            "answer": answer,
            "code_examples": code_examples,
            "learning_progress": self.get_learning_progress()
        }
        
        # Guardar en archivo de sesiones
        sessions_file = self.learning_dir / "learning_sessions.json"
        sessions = []
        
        if sessions_file.exists():
            with open(sessions_file, 'r', encoding='utf-8') as f:
                sessions = json.load(f)
                
        sessions.append(session_data)
        
        with open(sessions_file, 'w', encoding='utf-8') as f:
            json.dump(sessions, f, indent=2, ensure_ascii=False)
            
        # Guardar código en archivos separados
        for i, code in enumerate(code_examples):
            if code.strip():
                code_file = self.code_storage_dir / f"{topic}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}.js"
                with open(code_file, 'w', encoding='utf-8') as f:
                    f.write(code)
                    
        self.logger.info(f"Sesión de aprendizaje guardada: {topic}")
        
    def get_learning_progress(self) -> Dict[str, Any]:
        """Obtener progreso actual del aprendizaje"""
        sessions_file = self.learning_dir / "learning_sessions.json"
        if not sessions_file.exists():
            return {"total_sessions": 0, "topics_covered": [], "progress_percentage": 0}
            
        with open(sessions_file, 'r', encoding='utf-8') as f:
            sessions = json.load(f)
            
        topics_covered = list(set(session["topic"] for session in sessions))
        total_sessions = len(sessions)
        
        # Calcular progreso basado en objetivos
        total_objectives = len(self.config.get("learning_objectives", {}))
        progress_percentage = min(100, (len(topics_covered) / total_objectives) * 100) if total_objectives > 0 else 0
        
        return {
            "total_sessions": total_sessions,
            "topics_covered": topics_covered,
            "progress_percentage": progress_percentage,
            "last_session": sessions[-1]["timestamp"] if sessions else None
        }
        
    def learn_threejs_topic(self, topic: str, specific_question: str = None) -> bool:
        """Aprender un tema específico de Three.js"""
        self.logger.info(f"Iniciando aprendizaje de: {topic}")
        
        # Construir pregunta específica
        if specific_question:
            question = f"{self.avatar_prompt}\n\nAhora necesito aprender específicamente sobre: {specific_question}\n\nPor favor, proporciona:\n1. Explicación detallada\n2. Ejemplos de código prácticos\n3. Cómo aplicar esto a mi avatar 3D\n4. Próximos pasos de aprendizaje"
        else:
            question = f"{self.avatar_prompt}\n\nNecesito aprender sobre: {topic}\n\nPor favor, proporciona:\n1. Explicación detallada\n2. Ejemplos de código prácticos\n3. Cómo aplicar esto a mi avatar 3D\n4. Próximos pasos de aprendizaje"
            
        # Llamar a Claude
        response = self.call_claude_api(question)
        
        if not response:
            self.logger.error("No se pudo obtener respuesta de Claude")
            return False
            
        # Extraer ejemplos de código
        code_examples = self.extract_code_examples(response)
        
        # Guardar sesión
        self.save_learning_session(topic, question, response, code_examples)
        
        # Mostrar resumen
        self.logger.info(f"✅ Aprendizaje completado: {topic}")
        self.logger.info(f"📝 Código extraído: {len(code_examples)} ejemplos")
        
        return True
        
    def extract_code_examples(self, text: str) -> List[str]:
        """Extraer ejemplos de código del texto de respuesta"""
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
                
        # Agregar último bloque si existe
        if current_code:
            code_examples.append('\n'.join(current_code))
            
        return code_examples
        
    def create_avatar_learning_plan(self):
        """Crear plan de aprendizaje específico para el avatar"""
        plan = {
            "phase_1_basics": [
                "Scene, Camera, Renderer setup",
                "Basic geometries (Box, Sphere, Cylinder)",
                "Materials and textures",
                "Lighting basics",
                "Basic animations"
            ],
            "phase_2_avatar_modeling": [
                "Custom geometry creation",
                "Character modeling techniques",
                "UV mapping and texturing",
                "Material systems for skin/clothing",
                "Hair and clothing simulation"
            ],
            "phase_3_animations": [
                "Skeletal animation",
                "Facial expressions",
                "Procedural animations",
                "Physics-based movement",
                "Particle systems"
            ],
            "phase_4_advanced": [
                "Custom shaders",
                "Post-processing effects",
                "Performance optimization",
                "Integration with metaverse",
                "Real-time rendering"
            ]
        }
        
        plan_file = self.learning_dir / "avatar_learning_plan.json"
        with open(plan_file, 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
            
        self.logger.info("✅ Plan de aprendizaje del avatar creado")
        return plan
        
    def start_learning_session(self, topic: str = None):
        """Iniciar sesión de aprendizaje"""
        print("🎓 Iniciando sesión de aprendizaje de Three.js para LucIA")
        print("=" * 60)
        
        # Mostrar progreso actual
        progress = self.get_learning_progress()
        print(f"📊 Progreso actual: {progress['progress_percentage']:.1f}%")
        print(f"📚 Sesiones completadas: {progress['total_sessions']}")
        print(f"🎯 Temas cubiertos: {', '.join(progress['topics_covered'])}")
        print()
        
        # Si no se especifica tema, usar el siguiente del plan
        if not topic:
            plan = self.create_avatar_learning_plan()
            all_topics = []
            for phase_topics in plan.values():
                all_topics.extend(phase_topics)
                
            # Encontrar próximo tema no cubierto
            covered_topics = set(progress['topics_covered'])
            for t in all_topics:
                if t not in covered_topics:
                    topic = t
                    break
                    
        if topic:
            print(f"🎯 Tema a aprender: {topic}")
            print()
            
            success = self.learn_threejs_topic(topic)
            if success:
                print("✅ Sesión completada exitosamente!")
            else:
                print("❌ Error en la sesión de aprendizaje")
        else:
            print("🎉 ¡Todos los temas han sido cubiertos!")
            
        # Mostrar progreso actualizado
        new_progress = self.get_learning_progress()
        print(f"\n📈 Nuevo progreso: {new_progress['progress_percentage']:.1f}%")
        
    def run_interactive_learning(self):
        """Ejecutar aprendizaje interactivo"""
        print("🤖 LucIA Three.js Learning System")
        print("=" * 40)
        
        while True:
            print("\nOpciones:")
            print("1. Aprender tema específico")
            print("2. Ver progreso actual")
            print("3. Ver plan de aprendizaje")
            print("4. Salir")
            
            choice = input("\nSelecciona una opción (1-4): ").strip()
            
            if choice == "1":
                topic = input("Ingresa el tema a aprender: ").strip()
                if topic:
                    self.start_learning_session(topic)
                    
            elif choice == "2":
                progress = self.get_learning_progress()
                print(f"\n📊 Progreso: {progress['progress_percentage']:.1f}%")
                print(f"📚 Sesiones: {progress['total_sessions']}")
                print(f"🎯 Temas: {', '.join(progress['topics_covered'])}")
                
            elif choice == "3":
                plan = self.create_avatar_learning_plan()
                print("\n📋 Plan de Aprendizaje del Avatar:")
                for phase, topics in plan.items():
                    print(f"\n{phase.replace('_', ' ').title()}:")
                    for topic in topics:
                        print(f"  • {topic}")
                        
            elif choice == "4":
                print("👋 ¡Hasta luego! LucIA seguirá aprendiendo...")
                break
                
            else:
                print("❌ Opción no válida")

if __name__ == "__main__":
    try:
        learner = LucIAThreeJSLearning()
        learner.run_interactive_learning()
    except Exception as e:
        print(f"❌ Error: {e}")
        logging.error(f"Error en el sistema de aprendizaje: {e}") 