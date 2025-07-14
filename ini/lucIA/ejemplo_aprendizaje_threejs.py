"""
Ejemplo de uso del módulo de aprendizaje Three.js de Lucía
Este script demuestra cómo Lucía puede aprender Three.js paso a paso
"""

import asyncio
import sys
from pathlib import Path

# Añadir el directorio actual al path para importar módulos
sys.path.append(str(Path(__file__).parent))

from lucia_threejs_learning import LuciaThreeJSLearning

async def ejemplo_sesion_aprendizaje():
    """Ejemplo de una sesión completa de aprendizaje"""
    
    print("🎭 LUCÍA - EJEMPLO DE APRENDIZAJE THREE.JS")
    print("=" * 60)
    
    # Crear instancia del módulo de aprendizaje
    learning_module = LuciaThreeJSLearning()
    
    # Cargar progreso anterior si existe
    if learning_module.load_learning_progress():
        print("📚 Progreso anterior cargado exitosamente")
    else:
        print("🆕 Iniciando nuevo progreso de aprendizaje")
    
    # Mostrar progreso actual
    progress = learning_module.get_learning_progress()
    print(f"\n📊 ESTADO ACTUAL:")
    print(f"   Módulo actual: {progress['current_module']}")
    print(f"   Proyectos completados: {progress['completed_projects']}/{progress['total_projects']}")
    
    # Ejemplo 1: Iniciar sesión de aprendizaje
    print(f"\n🚀 EJEMPLO 1: Iniciando sesión de aprendizaje")
    print("-" * 40)
    
    session = await learning_module.start_learning_session()
    
    if "error" not in session:
        print(f"✅ Sesión iniciada exitosamente")
        print(f"📚 Módulo: {session['module']} - {session['project']['name']}")
        print(f"⏱️ Tiempo estimado: {session['project']['estimated_time']}")
        print(f"📊 Dificultad: {session['project']['difficulty']}")
        
        print(f"\n💬 Respuesta de Lucía:")
        print(f"   Fuente: {session['response'].source_api}")
        print(f"   Confianza: {session['response'].confidence:.2f}")
        print(f"   Tiempo: {session['response'].processing_time:.2f}s")
        
        # Mostrar parte de la respuesta (primeros 300 caracteres)
        response_preview = session['response'].paraphrased_response[:300] + "..."
        print(f"\n📝 Vista previa de la respuesta:")
        print(response_preview)
    else:
        print(f"❌ Error: {session['error']}")
    
    # Ejemplo 2: Hacer una pregunta específica
    print(f"\n🤔 EJEMPLO 2: Pregunta específica sobre Three.js")
    print("-" * 40)
    
    pregunta = "¿Cómo funciona el sistema de coordenadas en Three.js y por qué es importante?"
    
    print(f"❓ Pregunta: {pregunta}")
    
    answer = await learning_module.ask_question(pregunta)
    
    print(f"✅ Respuesta obtenida")
    print(f"   Fuente: {answer['response'].source_api}")
    print(f"   Confianza: {answer['response'].confidence:.2f}")
    print(f"   Tiempo: {answer['response'].processing_time:.2f}s")
    
    # Mostrar parte de la respuesta
    answer_preview = answer['response'].paraphrased_response[:250] + "..."
    print(f"\n📝 Vista previa de la respuesta:")
    print(answer_preview)
    
    # Ejemplo 3: Solicitar ejemplo de código
    print(f"\n💻 EJEMPLO 3: Solicitar ejemplo de código")
    print("-" * 40)
    
    topic = "crear un cubo que rote en Three.js"
    
    print(f"🔧 Tema: {topic}")
    
    code_example = await learning_module.request_code_example(topic)
    
    print(f"✅ Ejemplo de código obtenido")
    print(f"   Fuente: {code_example['response'].source_api}")
    print(f"   Confianza: {code_example['response'].confidence:.2f}")
    print(f"   Tiempo: {code_example['response'].processing_time:.2f}s")
    
    # Mostrar parte del código
    code_preview = code_example['response'].paraphrased_response[:300] + "..."
    print(f"\n📝 Vista previa del código:")
    print(code_preview)
    
    # Ejemplo 4: Marcar módulo como completado
    print(f"\n✅ EJEMPLO 4: Marcar módulo como completado")
    print("-" * 40)
    
    current_module = learning_module.current_module
    if learning_module.mark_module_completed(current_module):
        print(f"✅ Módulo {current_module} marcado como completado")
        print(f"📈 Progreso actualizado")
        
        # Mostrar nuevo progreso
        new_progress = learning_module.get_learning_progress()
        print(f"   Nuevo módulo actual: {new_progress['current_module']}")
        print(f"   Proyectos completados: {new_progress['completed_projects']}/{new_progress['total_projects']}")
    else:
        print(f"⚠️ El módulo {current_module} ya estaba completado o no existe")
    
    # Ejemplo 5: Guardar progreso
    print(f"\n💾 EJEMPLO 5: Guardar progreso")
    print("-" * 40)
    
    progress_file = learning_module.save_learning_progress()
    print(f"✅ Progreso guardado en: {progress_file}")
    
    # Mostrar estadísticas finales
    print(f"\n📈 ESTADÍSTICAS FINALES")
    print("-" * 40)
    
    final_progress = learning_module.get_learning_progress()
    print(f"   Módulo actual: {final_progress['current_module']}")
    print(f"   Proyectos completados: {final_progress['completed_projects']}")
    print(f"   Ejemplos de código creados: {len(final_progress['progress']['code_examples_created'])}")
    print(f"   Habilidades adquiridas: {len(final_progress['progress']['skills_acquired'])}")
    
    if final_progress['next_project']:
        print(f"   Próximo proyecto: {final_progress['next_project']['name']}")
        print(f"   Dificultad: {final_progress['next_project']['difficulty']}")
        print(f"   Tiempo estimado: {final_progress['next_project']['estimated_time']}")
    
    print(f"\n🎉 ¡Ejemplo completado exitosamente!")
    print(f"🌟 Lucía está lista para continuar su aprendizaje de Three.js")

async def ejemplo_interactivo():
    """Ejemplo interactivo donde el usuario puede guiar el aprendizaje"""
    
    print("🎭 LUCÍA - MODO INTERACTIVO")
    print("=" * 40)
    
    learning_module = LuciaThreeJSLearning()
    learning_module.load_learning_progress()
    
    while True:
        print(f"\n📚 Módulo actual: {learning_module.current_module}")
        print(f"🎯 Opciones disponibles:")
        print(f"   1. Iniciar sesión de aprendizaje")
        print(f"   2. Hacer una pregunta específica")
        print(f"   3. Solicitar ejemplo de código")
        print(f"   4. Ver progreso actual")
        print(f"   5. Marcar módulo como completado")
        print(f"   6. Salir")
        
        try:
            opcion = input(f"\n🤖 ¿Qué quieres hacer? (1-6): ").strip()
            
            if opcion == "1":
                print(f"\n🚀 Iniciando sesión de aprendizaje...")
                session = await learning_module.start_learning_session()
                
                if "error" not in session:
                    print(f"\n💬 Respuesta de Lucía:")
                    print(session['response'].paraphrased_response)
                else:
                    print(f"❌ Error: {session['error']}")
            
            elif opcion == "2":
                pregunta = input(f"\n❓ ¿Qué pregunta tienes sobre Three.js? ").strip()
                if pregunta:
                    print(f"🤔 Procesando pregunta...")
                    answer = await learning_module.ask_question(pregunta)
                    print(f"\n💬 Respuesta de Lucía:")
                    print(answer['response'].paraphrased_response)
            
            elif opcion == "3":
                topic = input(f"\n🔧 ¿Qué ejemplo de código necesitas? ").strip()
                if topic:
                    print(f"💻 Generando ejemplo de código...")
                    code_example = await learning_module.request_code_example(topic)
                    print(f"\n💻 Ejemplo de código:")
                    print(code_example['response'].paraphrased_response)
            
            elif opcion == "4":
                progress = learning_module.get_learning_progress()
                print(f"\n📊 PROGRESO ACTUAL:")
                print(f"   Módulo: {progress['current_module']}")
                print(f"   Completados: {progress['completed_projects']}/{progress['total_projects']}")
                print(f"   Ejemplos creados: {len(progress['progress']['code_examples_created'])}")
                
                if progress['next_project']:
                    print(f"   Próximo: {progress['next_project']['name']}")
            
            elif opcion == "5":
                current = learning_module.current_module
                if learning_module.mark_module_completed(current):
                    print(f"✅ Módulo {current} marcado como completado")
                else:
                    print(f"⚠️ El módulo {current} ya estaba completado")
            
            elif opcion == "6":
                print(f"👋 ¡Hasta luego! Guardando progreso...")
                learning_module.save_learning_progress()
                break
            
            else:
                print(f"❌ Opción no válida. Por favor elige 1-6.")
                
        except KeyboardInterrupt:
            print(f"\n👋 ¡Hasta luego! Guardando progreso...")
            learning_module.save_learning_progress()
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Función principal"""
    
    print("🎭 LUCÍA THREE.JS LEARNING - EJEMPLOS")
    print("=" * 50)
    print(f"1. Ejemplo automático de sesión")
    print(f"2. Modo interactivo")
    
    try:
        choice = input(f"\n🤖 ¿Qué ejemplo quieres ejecutar? (1-2): ").strip()
        
        if choice == "1":
            asyncio.run(ejemplo_sesion_aprendizaje())
        elif choice == "2":
            asyncio.run(ejemplo_interactivo())
        else:
            print(f"❌ Opción no válida. Ejecutando ejemplo automático...")
            asyncio.run(ejemplo_sesion_aprendizaje())
            
    except KeyboardInterrupt:
        print(f"\n👋 ¡Hasta luego!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 