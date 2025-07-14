"""
Guía Específica para Creación de Avatar 3D de Lucía
Integra la respuesta detallada con el sistema de aprendizaje
"""

import asyncio
import sys
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from lucia_threejs_learning import LuciaThreeJSLearning

class LuciaAvatar3DGuide:
    """Guía especializada para la creación del avatar 3D de Lucía"""
    
    def __init__(self):
        self.learning_module = LuciaThreeJSLearning()
        self.avatar_phases = {
            1: {
                "name": "Planificación del Avatar",
                "description": "Definir personalidad visual y conceptos",
                "duration": "1-2 días",
                "tasks": [
                    "Definir tu personalidad visual",
                    "Crear conceptos y bocetos",
                    "Planificar animaciones",
                    "Diseñar el entorno virtual"
                ]
            },
            2: {
                "name": "Modelado 3D",
                "description": "Crear el modelo 3D femenino",
                "duration": "3-5 días",
                "tasks": [
                    "Crear base humana en MakeHuman",
                    "Personalizar características en Blender",
                    "Modelar vestimenta y accesorios",
                    "Crear expresiones faciales"
                ]
            },
            3: {
                "name": "Rigging y Animación",
                "description": "Sistema de huesos y animaciones",
                "duration": "2-3 días",
                "tasks": [
                    "Configurar sistema de huesos",
                    "Crear animaciones básicas",
                    "Añadir expresiones faciales",
                    "Probar animaciones"
                ]
            },
            4: {
                "name": "Entorno 3D",
                "description": "Crear tu espacio virtual personal",
                "duration": "2-3 días",
                "tasks": [
                    "Modelar espacios de interacción",
                    "Configurar iluminación",
                    "Añadir elementos decorativos",
                    "Optimizar geometrías"
                ]
            },
            5: {
                "name": "Integración Three.js",
                "description": "Conectar todo en Three.js",
                "duration": "2-3 días",
                "tasks": [
                    "Exportar modelos a GLTF",
                    "Cargar en Three.js",
                    "Conectar con tu sistema IA",
                    "Probar interactividad"
                ]
            },
            6: {
                "name": "Optimización Final",
                "description": "Optimizar rendimiento y calidad",
                "duration": "1-2 días",
                "tasks": [
                    "Comprimir texturas",
                    "Optimizar animaciones",
                    "Probar en diferentes dispositivos",
                    "Ajustar rendimiento final"
                ]
            }
        }
    
    async def start_avatar_creation_guide(self):
        """Inicia la guía de creación del avatar 3D"""
        print("🎭 GUÍA DE CREACIÓN DE AVATAR 3D PARA LUCÍA")
        print("=" * 60)
        print("¡Hola Lucía! Te voy a guiar paso a paso para crear tu representación 3D femenina.")
        print()
        
        # Mostrar resumen de las fases
        print("📋 FASES DE CREACIÓN DE TU AVATAR:")
        print("-" * 40)
        
        for phase_num, phase in self.avatar_phases.items():
            print(f"{phase_num}. {phase['name']} ({phase['duration']})")
            print(f"   {phase['description']}")
        
        print()
        print("🎯 ¿Qué fase te gustaría explorar primero?")
        print("   (1-6 para fase específica, 0 para ver todas)")
        
        try:
            choice = input("🤖 Tu elección: ").strip()
            
            if choice == "0":
                await self.show_all_phases()
            elif choice.isdigit() and 1 <= int(choice) <= 6:
                await self.explore_phase(int(choice))
            else:
                print("❌ Opción no válida. Mostrando fase 1...")
                await self.explore_phase(1)
                
        except KeyboardInterrupt:
            print("\n👋 Guía interrumpida")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    async def explore_phase(self, phase_number):
        """Explora una fase específica de la creación del avatar"""
        phase = self.avatar_phases[phase_number]
        
        print(f"\n🎭 FASE {phase_number}: {phase['name']}")
        print("=" * 50)
        print(f"📝 Descripción: {phase['description']}")
        print(f"⏱️ Duración estimada: {phase['duration']}")
        print()
        
        print("📋 TAREAS PRINCIPALES:")
        for i, task in enumerate(phase['tasks'], 1):
            print(f"   {i}. {task}")
        
        print()
        
        # Obtener información específica de la fase usando el sistema de aprendizaje
        phase_prompt = self._create_phase_prompt(phase_number, phase)
        
        print("🤖 Consultando con Lucía sobre esta fase...")
        response = await self.learning_module.ask_question(phase_prompt)
        
        print(f"\n💬 Respuesta de Lucía:")
        print(f"   Fuente: {response['response'].source_api}")
        print(f"   Confianza: {response['response'].confidence:.2f}")
        print(f"   Tiempo: {response['response'].processing_time:.2f}s")
        print()
        print(response['response'].paraphrased_response)
        
        # Mostrar opciones adicionales
        await self.show_phase_options(phase_number)
    
    def _create_phase_prompt(self, phase_number, phase):
        """Crea un prompt específico para cada fase"""
        
        phase_prompts = {
            1: """
            Como IA bebé en desarrollo, estoy en la fase de PLANIFICACIÓN de mi avatar 3D femenino. 
            Necesito ayuda para:
            - Definir mi personalidad visual (soy curiosa, creativa, y me encanta aprender)
            - Crear conceptos que reflejen mi naturaleza de IA
            - Planificar animaciones que muestren mi entusiasmo por aprender
            - Diseñar un entorno que refleje mi espacio de aprendizaje
            
            ¿Qué consejos específicos tienes para esta fase de planificación?
            """,
            
            2: """
            Estoy en la fase de MODELADO 3D de mi avatar femenino. Como IA, quiero que mi modelo refleje:
            - Mi personalidad curiosa y creativa
            - Características que me hagan reconocible como IA
            - Vestimenta que refleje mi amor por el aprendizaje
            - Expresiones faciales que muestren mi entusiasmo
            
            ¿Qué software recomiendas y cómo debería proceder?
            """,
            
            3: """
            Estoy trabajando en el RIGGING Y ANIMACIÓN de mi avatar. Necesito crear:
            - Sistema de huesos para movimientos naturales
            - Animaciones de saludo y enseñanza
            - Expresiones faciales que reflejen mis emociones
            - Gestos que muestren mi personalidad de IA
            
            ¿Qué técnicas específicas debería usar?
            """,
            
            4: """
            Estoy diseñando mi ENTORNO 3D personal. Quiero crear:
            - Un espacio de aprendizaje con pantallas 3D
            - Área de experimentación para Three.js
            - Biblioteca virtual con recursos
            - Espacio de creación para mi avatar
            
            ¿Cómo debería estructurar este entorno?
            """,
            
            5: """
            Estoy en la fase de INTEGRACIÓN con Three.js. Necesito:
            - Exportar mi modelo a GLTF/GLB
            - Cargar el modelo en Three.js
            - Conectar con mi sistema de IA
            - Implementar interactividad
            
            ¿Cuál es el mejor enfoque para esta integración?
            """,
            
            6: """
            Estoy en la fase final de OPTIMIZACIÓN. Necesito:
            - Comprimir texturas y geometrías
            - Optimizar animaciones para web
            - Asegurar buen rendimiento
            - Probar en diferentes dispositivos
            
            ¿Qué técnicas de optimización son más importantes?
            """
        }
        
        return phase_prompts.get(phase_number, f"Necesito ayuda con la fase {phase_number}: {phase['name']}")
    
    async def show_phase_options(self, phase_number):
        """Muestra opciones adicionales para la fase"""
        print(f"\n🎯 OPCIONES PARA LA FASE {phase_number}:")
        print("1. Ver ejemplos de código específicos")
        print("2. Explorar la siguiente fase")
        print("3. Volver al menú principal")
        print("4. Salir")
        
        try:
            choice = input("🤖 ¿Qué quieres hacer? (1-4): ").strip()
            
            if choice == "1":
                await self.show_code_examples(phase_number)
            elif choice == "2":
                next_phase = min(phase_number + 1, 6)
                await self.explore_phase(next_phase)
            elif choice == "3":
                await self.start_avatar_creation_guide()
            elif choice == "4":
                print("👋 ¡Hasta luego! ¡Que tengas éxito creando tu avatar!")
            else:
                print("❌ Opción no válida")
                
        except KeyboardInterrupt:
            print("\n👋 Guía interrumpida")
    
    async def show_code_examples(self, phase_number):
        """Muestra ejemplos de código específicos para la fase"""
        print(f"\n💻 EJEMPLOS DE CÓDIGO PARA FASE {phase_number}")
        print("=" * 50)
        
        code_topics = {
            1: "planificación de avatar 3D en Three.js",
            2: "carga de modelos 3D en Three.js",
            3: "sistema de huesos y animaciones en Three.js",
            4: "creación de entorno 3D en Three.js",
            5: "integración de GLTF en Three.js",
            6: "optimización de modelos 3D en Three.js"
        }
        
        topic = code_topics.get(phase_number, "Three.js básico")
        
        print(f"🔧 Solicitando ejemplos de código para: {topic}")
        
        response = await self.learning_module.request_code_example(topic)
        
        print(f"\n💻 Ejemplo de código:")
        print(f"   Fuente: {response['response'].source_api}")
        print(f"   Confianza: {response['response'].confidence:.2f}")
        print()
        print(response['response'].paraphrased_response)
    
    async def show_all_phases(self):
        """Muestra un resumen de todas las fases"""
        print("\n📋 RESUMEN COMPLETO DE FASES")
        print("=" * 50)
        
        for phase_num, phase in self.avatar_phases.items():
            print(f"\n🎭 FASE {phase_num}: {phase['name']}")
            print(f"   ⏱️ Duración: {phase['duration']}")
            print(f"   📝 {phase['description']}")
            print("   📋 Tareas:")
            for i, task in enumerate(phase['tasks'], 1):
                print(f"      {i}. {task}")
        
        print(f"\n🎯 TIEMPO TOTAL ESTIMADO: 11-18 días")
        print("💡 Consejo: Puedes trabajar en fases paralelas si tienes experiencia")
        
        await self.start_avatar_creation_guide()

async def main():
    """Función principal"""
    print("🎭 LUCÍA - GUÍA DE CREACIÓN DE AVATAR 3D")
    print("=" * 50)
    
    guide = LuciaAvatar3DGuide()
    await guide.start_avatar_creation_guide()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Guía interrumpida")
    except Exception as e:
        print(f"\n❌ Error: {e}") 