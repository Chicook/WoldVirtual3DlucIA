#!/usr/bin/env python3
"""
Script para continuar el entrenamiento de LucIA
Avanza al siguiente módulo y continúa el aprendizaje
"""

import asyncio
from lucia_threejs_learning import LuciaThreeJSLearning
from lucia_core import LucIACore

async def continuar_entrenamiento():
    """Continúa el entrenamiento de LucIA al siguiente módulo"""
    
    print("🎭 CONTINUANDO ENTRENAMIENTO DE LUCIA")
    print("=" * 50)
    
    # Crear instancia de LucIACore y LuciaThreeJSLearning
    lucia_core = LucIACore()
    learning_module = LuciaThreeJSLearning(lucia_core)
    
    # Mostrar progreso actual
    stats = learning_module.get_learning_statistics()
    print(f"\n📊 PROGRESO ACTUAL:")
    print(f"   Módulo actual: {stats['current_module']}")
    print(f"   Proyectos completados: {stats['completed_projects']}/{stats['total_projects']}")
    print(f"   Fragmentos de código aprendidos: {stats['code_snippets_learned']}")
    
    # Completar el módulo actual si no está completado
    current_module = stats['current_module']
    if current_module not in learning_module.completed_projects:
        print(f"\n✅ Completando módulo {current_module}...")
        learning_module.complete_module(current_module)
    
    # Avanzar al siguiente módulo
    next_module = current_module + 1
    if next_module <= max(learning_module.learning_projects.keys()):
        print(f"\n🚀 Iniciando módulo {next_module}...")
        response = await learning_module.start_learning_session(next_module)
        
        print(f"\n💬 Respuesta de LucIA:")
        print(response)
        
        # Mostrar estadísticas actualizadas
        stats = learning_module.get_learning_statistics()
        print(f"\n📈 PROGRESO ACTUALIZADO:")
        print(f"   Módulo actual: {stats['current_module']}")
        print(f"   Proyectos completados: {stats['completed_projects']}/{stats['total_projects']}")
        print(f"   Fragmentos de código aprendidos: {stats['code_snippets_learned']}")
        
    else:
        print(f"\n🎉 ¡Felicitaciones! LucIA ha completado todos los módulos de entrenamiento.")
        
        # Mostrar reporte final
        report = learning_module.export_learning_report()
        print(f"\n📋 REPORTE FINAL:")
        print(report)

async def entrenar_modulo_especifico(modulo_numero):
    """Entrena LucIA en un módulo específico"""
    
    print(f"🎭 ENTRENANDO LUCIA EN MÓDULO {modulo_numero}")
    print("=" * 50)
    
    # Crear instancia de LucIACore y LuciaThreeJSLearning
    lucia_core = LucIACore()
    learning_module = LuciaThreeJSLearning(lucia_core)
    
    # Verificar que el módulo existe
    if modulo_numero not in learning_module.learning_projects:
        print(f"❌ Error: El módulo {modulo_numero} no existe.")
        return
    
    # Obtener información del módulo
    proyecto = learning_module.learning_projects[modulo_numero]
    print(f"\n📚 Módulo: {modulo_numero} - {proyecto['title']}")
    print(f"📝 Descripción: {proyecto['description']}")
    print(f"🎯 Objetivos: {', '.join(proyecto['objectives'])}")
    print(f"⏱️ Tiempo estimado: {proyecto['estimated_time']}")
    print(f"📊 Dificultad: {proyecto['difficulty']}")
    
    # Iniciar sesión de aprendizaje
    print(f"\n🚀 Iniciando sesión de aprendizaje...")
    response = await learning_module.start_learning_session(modulo_numero)
    
    print(f"\n💬 Respuesta de LucIA:")
    print(response)
    
    # Completar el módulo
    print(f"\n✅ Completando módulo {modulo_numero}...")
    learning_module.complete_module(modulo_numero)
    
    # Mostrar estadísticas actualizadas
    stats = learning_module.get_learning_statistics()
    print(f"\n📈 PROGRESO ACTUALIZADO:")
    print(f"   Módulo actual: {stats['current_module']}")
    print(f"   Proyectos completados: {stats['completed_projects']}/{stats['total_projects']}")
    print(f"   Fragmentos de código aprendidos: {stats['code_snippets_learned']}")

async def hacer_pregunta_especifica(pregunta):
    """Hace una pregunta específica a LucIA sobre Three.js"""
    
    print(f"🎭 PREGUNTA ESPECÍFICA A LUCIA")
    print("=" * 50)
    
    # Crear instancia de LucIACore y LuciaThreeJSLearning
    lucia_core = LucIACore()
    learning_module = LuciaThreeJSLearning(lucia_core)
    
    print(f"🤔 Pregunta: {pregunta}")
    
    # Hacer la pregunta
    response = await learning_module.ask_specific_question(pregunta)
    
    print(f"\n💬 Respuesta de LucIA:")
    print(response)

async def solicitar_ejemplo_codigo(tema):
    """Solicita un ejemplo de código específico a LucIA"""
    
    print(f"🎭 SOLICITANDO EJEMPLO DE CÓDIGO")
    print("=" * 50)
    
    # Crear instancia de LucIACore y LuciaThreeJSLearning
    lucia_core = LucIACore()
    learning_module = LuciaThreeJSLearning(lucia_core)
    
    print(f"💻 Tema: {tema}")
    
    # Solicitar ejemplo
    response = await learning_module.request_code_example(tema)
    
    print(f"\n💬 Respuesta de LucIA:")
    print(response)

async def mostrar_estadisticas():
    """Muestra las estadísticas completas del aprendizaje de LucIA"""
    
    print(f"🎭 ESTADÍSTICAS DE APRENDIZAJE DE LUCIA")
    print("=" * 50)
    
    # Crear instancia de LucIACore y LuciaThreeJSLearning
    lucia_core = LucIACore()
    learning_module = LuciaThreeJSLearning(lucia_core)
    
    # Obtener estadísticas
    stats = learning_module.get_learning_statistics()
    
    print(f"\n📊 ESTADÍSTICAS GENERALES:")
    print(f"   Módulo actual: {stats['current_module']}")
    print(f"   Proyectos completados: {stats['completed_projects']}/{stats['total_projects']}")
    print(f"   Habilidades aprendidas: {stats['learned_skills']}")
    print(f"   Fragmentos de código: {stats['code_snippets_learned']}")
    
    print(f"\n📚 ESTADÍSTICAS DE CÓDIGO:")
    print(f"   Total de fragmentos: {stats['total_learned_snippets']}")
    print(f"   Categorías exploradas: {stats['categories_learned']}")
    print(f"   Lenguajes aprendidos: {stats['languages_learned']}")
    print(f"   Categoría más común: {stats['most_common_category']}")
    print(f"   Lenguaje más común: {stats['most_common_language']}")
    
    # Mostrar módulos disponibles
    print(f"\n📋 MÓDULOS DISPONIBLES:")
    for num, proyecto in learning_module.learning_projects.items():
        estado = "✅ COMPLETADO" if num in learning_module.completed_projects else "⏳ PENDIENTE"
        print(f"   {num}. {proyecto['title']} - {estado}")

async def main():
    """Función principal"""
    import sys
    
    if len(sys.argv) > 1:
        comando = sys.argv[1].lower()
        
        if comando == "continuar":
            await continuar_entrenamiento()
        elif comando == "modulo" and len(sys.argv) > 2:
            modulo = int(sys.argv[2])
            await entrenar_modulo_especifico(modulo)
        elif comando == "pregunta" and len(sys.argv) > 2:
            pregunta = " ".join(sys.argv[2:])
            await hacer_pregunta_especifica(pregunta)
        elif comando == "ejemplo" and len(sys.argv) > 2:
            tema = " ".join(sys.argv[2:])
            await solicitar_ejemplo_codigo(tema)
        elif comando == "estadisticas":
            await mostrar_estadisticas()
        else:
            print("❌ Comando no reconocido.")
            print("Uso:")
            print("  python continuar_entrenamiento.py continuar")
            print("  python continuar_entrenamiento.py modulo <numero>")
            print("  python continuar_entrenamiento.py pregunta <pregunta>")
            print("  python continuar_entrenamiento.py ejemplo <tema>")
            print("  python continuar_entrenamiento.py estadisticas")
    else:
        # Por defecto, continuar entrenamiento
        await continuar_entrenamiento()

if __name__ == "__main__":
    asyncio.run(main()) 