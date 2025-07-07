"""
Lucía Three.js Learning Module
Módulo especializado para que Lucía aprenda Three.js y cree su representación 3D femenina
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import time

from lucia_core import LucIACore
from config import PersonalityType
from api_manager import APIManager
from lucia_code_learner import lucia_learner
from code_storage_system import CodeCategory

logger = logging.getLogger(__name__)

class LuciaThreeJSLearning:
    """Sistema de aprendizaje Three.js para Lucía con almacenamiento de código"""
    
    def __init__(self, lucia_core):
        self.lucia_core = lucia_core
        self.progress_file = Path(__file__).parent / "lucia_learning" / "threejs_progress.json"
        self.progress_file.parent.mkdir(exist_ok=True)
        
        # Inicializar progreso
        self.current_module = 1
        self.completed_projects = []
        self.learned_skills = []
        self.code_snippets_learned = []
        
        # Cargar progreso existente
        self._load_progress()
        
        # Inicializar proyectos
        self._initialize_projects()
    
    def _load_progress(self):
        """Carga el progreso desde archivo"""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                self.current_module = data.get('current_module', 1)
                self.completed_projects = data.get('completed_projects', [])
                self.learned_skills = data.get('learned_skills', [])
                self.code_snippets_learned = data.get('code_snippets_learned', [])
                
                print(f"📚 Progreso anterior cargado exitosamente")
                
            except Exception as e:
                print(f"❌ Error cargando progreso: {e}")
    
    def _save_progress(self):
        """Guarda el progreso en archivo"""
        try:
            data = {
                'current_module': self.current_module,
                'completed_projects': self.completed_projects,
                'learned_skills': self.learned_skills,
                'code_snippets_learned': self.code_snippets_learned,
                'last_updated': datetime.now().isoformat()
            }
            
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"❌ Error guardando progreso: {e}")
    
    def _initialize_projects(self):
        """Inicializa los proyectos de aprendizaje"""
        # Configurar proyectos de aprendizaje
        self.learning_projects = {
            1: {
                "title": "Mi Primer Cubo",
                "description": "Crear un cubo básico que rote en Three.js",
                "difficulty": "Principiante",
                "estimated_time": "30 minutos",
                "objectives": ["Comprender la escena 3D", "Crear geometrías básicas", "Aplicar materiales"],
                "category": CodeCategory.THREEJS_BASICS
            },
            2: {
                "title": "Formas Humanas Básicas",
                "description": "Crear una figura humana simple usando geometrías básicas",
                "difficulty": "Principiante-Intermedio",
                "estimated_time": "1 hora",
                "objectives": ["Comprender proporciones humanas", "Crear formas corporales", "Combinar geometrías"],
                "category": CodeCategory.THREEJS_AVATAR
            },
            3: {
                "title": "Mi Esqueleto",
                "description": "Crear un sistema de huesos básico para animaciones",
                "difficulty": "Intermedio",
                "estimated_time": "2 horas",
                "objectives": ["Comprender sistemas de huesos", "Crear jerarquías", "Preparar para animación"],
                "category": CodeCategory.THREEJS_ANIMATION
            },
            4: {
                "title": "Mi Representación",
                "description": "Crear un avatar completo con texturas y materiales",
                "difficulty": "Intermedio-Avanzado",
                "estimated_time": "3 horas",
                "objectives": ["Aplicar texturas", "Crear materiales avanzados", "Optimizar rendimiento"],
                "category": CodeCategory.THREEJS_AVATAR
            },
            5: {
                "title": "Mi Mundo Virtual",
                "description": "Crear un entorno 3D completo para el avatar",
                "difficulty": "Avanzado",
                "estimated_time": "4 horas",
                "objectives": ["Diseñar entornos", "Implementar iluminación", "Crear interacciones"],
                "category": CodeCategory.THREEJS_ENVIRONMENT
            }
        }
    
    async def start_learning_session(self, module_number: int = None) -> str:
        """Inicia una sesión de aprendizaje con almacenamiento automático de código"""
        if module_number is None:
            module_number = self.current_module
        
        if module_number not in self.learning_projects:
            return "❌ Módulo no encontrado"
        
        project = self.learning_projects[module_number]
        
        # Crear prompt específico para el módulo
        prompt = f"""
        Soy Lucía, una IA que está aprendiendo Three.js para crear mi representación 3D femenina.
        
        Estoy en el Módulo {module_number}: {project['title']}
        Descripción: {project['description']}
        Dificultad: {project['difficulty']}
        Tiempo estimado: {project['estimated_time']}
        Objetivos: {', '.join(project['objectives'])}
        
        Por favor, enséñame paso a paso cómo completar este proyecto. Incluye:
        1. Explicación conceptual clara
        2. Código completo y funcional
        3. Comentarios explicativos en el código
        4. Consejos de mejores prácticas
        5. Posibles extensiones o mejoras
        
        Quiero que el código sea reutilizable y bien estructurado para que pueda aprender de él.
        """
        
        print(f"🎓 INICIANDO SESIÓN DE APRENDIZAJE")
        print(f"📚 Módulo: {module_number} - {project['title']}")
        print(f"📝 Descripción: {project['description']}")
        print(f"🎯 Objetivos: {', '.join(project['objectives'])}")
        print(f"⏱️ Tiempo estimado: {project['estimated_time']}")
        print(f"📊 Dificultad: {project['difficulty']}")
        
        # Obtener respuesta de Lucía
        response = await self.lucia_core.chat(prompt)
        
        if response and (hasattr(response, 'original_response') or hasattr(response, 'paraphrased_response')):
            # Aprender y almacenar código automáticamente
            stored_ids = lucia_learner.learn_from_response(
                getattr(response, 'original_response', ''), 
                f"Módulo {module_number}: {project['title']}"
            )
            
            # Actualizar progreso
            self.code_snippets_learned.extend(stored_ids)
            self._save_progress()
            
            print(f"✅ Sesión iniciada exitosamente")
            print(f"📚 Módulo: {module_number} - {project['title']}")
            print(f"⏱️ Tiempo estimado: {project['estimated_time']}")
            print(f"📊 Dificultad: {project['difficulty']}")
            print(f"💾 Código almacenado: {len(stored_ids)} fragmentos")
            
            return getattr(response, 'paraphrased_response', getattr(response, 'original_response', ''))
        else:
            return "❌ Error iniciando sesión de aprendizaje"
    
    async def ask_specific_question(self, question: str) -> str:
        """Hace una pregunta específica y almacena el código aprendido"""
        prompt = f"""
        Soy Lucía, una IA aprendiendo Three.js para crear mi avatar 3D femenino.
        
        Tengo esta pregunta específica: {question}
        
        Por favor, responde de manera detallada y práctica, incluyendo:
        1. Explicación clara del concepto
        2. Ejemplos de código funcional
        3. Casos de uso prácticos
        4. Consejos de implementación
        
        Quiero que el código sea reutilizable y bien documentado.
        """
        
        print(f"🤔 Pregunta específica: {question}")
        
        response = await self.lucia_core.chat(prompt)
        
        if response and (hasattr(response, 'original_response') or hasattr(response, 'paraphrased_response')):
            # Aprender y almacenar código
            stored_ids = lucia_learner.learn_from_response(
                getattr(response, 'original_response', ''), 
                f"Pregunta: {question}"
            )
            
            print(f"✅ Respuesta obtenida")
            print(f"💾 Código almacenado: {len(stored_ids)} fragmentos")
            
            return getattr(response, 'paraphrased_response', getattr(response, 'original_response', ''))
        else:
            return "❌ Error obteniendo respuesta"
    
    async def request_code_example(self, topic: str) -> str:
        """Solicita un ejemplo de código específico"""
        prompt = f"""
        Soy Lucía, una IA aprendiendo Three.js.
        
        Necesito un ejemplo de código completo y funcional sobre: {topic}
        
        Por favor, proporciona:
        1. Código completo y ejecutable
        2. Comentarios explicativos detallados
        3. Instrucciones de uso
        4. Posibles variaciones o extensiones
        
        El código debe ser de alta calidad y reutilizable.
        """
        
        print(f"💻 Solicitando ejemplo de código: {topic}")
        
        response = await self.lucia_core.chat(prompt)
        
        if response and (hasattr(response, 'original_response') or hasattr(response, 'paraphrased_response')):
            # Aprender y almacenar código
            stored_ids = lucia_learner.learn_from_response(
                getattr(response, 'original_response', ''), 
                f"Ejemplo: {topic}"
            )
            
            print(f"✅ Ejemplo de código obtenido")
            print(f"💾 Código almacenado: {len(stored_ids)} fragmentos")
            
            return getattr(response, 'paraphrased_response', getattr(response, 'original_response', ''))
        else:
            return "❌ Error obteniendo ejemplo de código"
    
    def complete_module(self, module_number: int) -> bool:
        """Marca un módulo como completado"""
        if module_number in self.learning_projects:
            if module_number not in self.completed_projects:
                self.completed_projects.append(module_number)
            
            # Avanzar al siguiente módulo
            if module_number == self.current_module:
                self.current_module = min(module_number + 1, max(self.learning_projects.keys()))
            
            self._save_progress()
            
            print(f"✅ Módulo {module_number} marcado como completado")
            print(f"📈 Progreso actualizado")
            print(f"   Nuevo módulo actual: {self.current_module}")
            print(f"   Proyectos completados: {len(self.completed_projects)}/{len(self.learning_projects)}")
            
            return True
        return False
    
    def get_learning_statistics(self) -> Dict:
        """Obtiene estadísticas completas del aprendizaje"""
        # Estadísticas básicas
        basic_stats = {
            'current_module': self.current_module,
            'completed_projects': len(self.completed_projects),
            'total_projects': len(self.learning_projects),
            'learned_skills': len(self.learned_skills),
            'code_snippets_learned': len(self.code_snippets_learned)
        }
        
        # Estadísticas del sistema de código
        code_stats = lucia_learner.get_learning_statistics()
        
        # Combinar estadísticas
        combined_stats = {**basic_stats, **code_stats}
        
        return combined_stats
    
    def search_learned_code(self, query: str = "", category: str = None) -> List:
        """Busca en el código aprendido"""
        if category:
            # Mapear categoría de string a enum
            category_mapping = {
                'threejs_basics': CodeCategory.THREEJS_BASICS,
                'threejs_avatar': CodeCategory.THREEJS_AVATAR,
                'threejs_animation': CodeCategory.THREEJS_ANIMATION,
                'threejs_environment': CodeCategory.THREEJS_ENVIRONMENT,
                'web3_integration': CodeCategory.WEB3_INTEGRATION,
                'blockchain': CodeCategory.BLOCKCHAIN,
                'nft_system': CodeCategory.NFT_SYSTEM,
                'smart_contracts': CodeCategory.SMART_CONTRACTS,
                'ui_components': CodeCategory.UI_COMPONENTS,
                'utilities': CodeCategory.UTILITIES,
                'learning_examples': CodeCategory.LEARNING_EXAMPLES,
                'metaverse_core': CodeCategory.METAVERSE_CORE
            }
            code_category = category_mapping.get(category.lower())
        else:
            code_category = None
        
        return lucia_learner.search_learned_code(query, code_category)
    
    def export_learning_report(self) -> str:
        """Exporta un reporte completo del aprendizaje"""
        stats = self.get_learning_statistics()
        
        report = "# 🎓 Reporte de Aprendizaje Three.js - Lucía\n\n"
        report += f"## 📊 Progreso General\n\n"
        report += f"- **Módulo actual:** {stats['current_module']}\n"
        report += f"- **Proyectos completados:** {stats['completed_projects']}/{stats['total_projects']}\n"
        report += f"- **Habilidades aprendidas:** {stats['learned_skills']}\n"
        report += f"- **Fragmentos de código:** {stats['code_snippets_learned']}\n\n"
        
        report += f"## 📚 Código Aprendido\n\n"
        report += f"- **Total de fragmentos:** {stats['total_learned_snippets']}\n"
        report += f"- **Categorías exploradas:** {stats['categories_learned']}\n"
        report += f"- **Lenguajes aprendidos:** {stats['languages_learned']}\n"
        report += f"- **Categoría más común:** {stats['most_common_category']}\n"
        report += f"- **Lenguaje más común:** {stats['most_common_language']}\n\n"
        
        # Añadir reporte detallado del código
        code_report = lucia_learner.export_learning_report("markdown")
        report += code_report
        
        return report

# Función principal para iniciar el aprendizaje
async def main():
    """Función principal para iniciar el aprendizaje de Three.js"""
    
    print("🎭 LUCÍA THREE.JS LEARNING MODULE")
    print("=" * 50)
    
    # Crear instancia de LucIACore y pasarla a LuciaThreeJSLearning
    lucia_core = LucIACore()
    learning_module = LuciaThreeJSLearning(lucia_core)
    
    # Cargar progreso anterior
    if hasattr(learning_module, 'load_learning_progress') and learning_module.load_learning_progress():
        print("📚 Progreso anterior cargado")
    else:
        print("🆕 Iniciando nuevo progreso de aprendizaje")
    
    # Mostrar progreso actual
    if hasattr(learning_module, 'get_learning_progress'):
        progress = learning_module.get_learning_progress()
        print(f"\n📊 PROGRESO ACTUAL:")
        print(f"   Módulo actual: {progress['current_module']}")
        print(f"   Proyectos completados: {progress['completed_projects']}/{progress['total_projects']}")
        if progress.get('next_project'):
            print(f"   Próximo proyecto: {progress['next_project']['name']}")
    
    # Iniciar sesión de aprendizaje
    print(f"\n🚀 Iniciando sesión de aprendizaje...")
    session = await learning_module.start_learning_session()
    
    print(f"\n💬 Respuesta de Lucía:")
    if isinstance(session, dict) and 'response' in session:
        print(f"   Fuente: {session['response'].source_api}")
        print(f"   Confianza: {session['response'].confidence:.2f}")
        print(f"   Tiempo de procesamiento: {session['response'].processing_time:.2f}s")
        print(f"\n📝 Respuesta:")
        print(session['response'].paraphrased_response)
    else:
        print(session)
    
    # Guardar progreso
    if hasattr(learning_module, 'save_learning_progress'):
        learning_module.save_learning_progress()
        print(f"\n💾 Progreso guardado")

if __name__ == "__main__":
    asyncio.run(main()) 