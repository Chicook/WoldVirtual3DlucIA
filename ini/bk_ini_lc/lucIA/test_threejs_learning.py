"""
Script de prueba para el sistema de aprendizaje Three.js de Lucía
Verifica que todos los componentes funcionen correctamente
"""

import asyncio
import sys
import os
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    """Prueba que todos los módulos se importen correctamente"""
    print("🔍 Probando importaciones...")
    
    try:
        from lucia_threejs_learning import LuciaThreeJSLearning
        print("✅ LuciaThreeJSLearning importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando LuciaThreeJSLearning: {e}")
        return False
    
    try:
        from lucia_core import LucIACore
        print("✅ LucIACore importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando LucIACore: {e}")
        return False
    
    try:
        from config import PersonalityType
        print("✅ PersonalityType importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando PersonalityType: {e}")
        return False
    
    try:
        from api_manager import APIManager
        print("✅ APIManager importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando APIManager: {e}")
        return False
    
    return True

def test_file_structure():
    """Prueba que la estructura de archivos sea correcta"""
    print("\n📁 Probando estructura de archivos...")
    
    required_files = [
        "lucia_threejs_learning.py",
        "ejemplo_aprendizaje_threejs.py",
        "README_THREEJS_LEARNING.md"
    ]
    
    required_dirs = [
        "prompts",
        "lucia_learning"
    ]
    
    # Verificar archivos
    for file_name in required_files:
        file_path = Path(__file__).parent / file_name
        if file_path.exists():
            print(f"✅ {file_name} encontrado")
        else:
            print(f"❌ {file_name} no encontrado")
            return False
    
    # Verificar directorios
    for dir_name in required_dirs:
        dir_path = Path(__file__).parent / dir_name
        if dir_path.exists():
            print(f"✅ Directorio {dir_name} encontrado")
        else:
            print(f"❌ Directorio {dir_name} no encontrado")
            return False
    
    # Verificar prompt especializado
    prompt_path = Path(__file__).parent / "prompts" / "lucia_threejs_learning_prompt.md"
    if prompt_path.exists():
        print("✅ Prompt especializado encontrado")
        # Verificar contenido básico
        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if "Lucía" in content and "Three.js" in content:
                print("✅ Contenido del prompt válido")
            else:
                print("⚠️ Contenido del prompt puede estar incompleto")
    else:
        print("❌ Prompt especializado no encontrado")
        return False
    
    return True

def test_configuration():
    """Prueba la configuración del sistema"""
    print("\n⚙️ Probando configuración...")
    
    # Verificar archivo .env
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        print("✅ Archivo .env encontrado")
        
        # Verificar que tenga la API key de Gemini
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if "GEMINI_API_KEY" in content:
                print("✅ GEMINI_API_KEY configurada")
            else:
                print("⚠️ GEMINI_API_KEY no encontrada en .env")
    else:
        print("⚠️ Archivo .env no encontrado")
    
    # Verificar configuración de Lucía
    try:
        from config import config
        print("✅ Configuración de Lucía cargada")
        
        # Verificar APIs habilitadas
        enabled_apis = config.get_enabled_apis()
        if enabled_apis:
            print(f"✅ {len(enabled_apis)} APIs habilitadas")
            for api in enabled_apis:
                print(f"   - {api.name} ({api.api_type.value})")
        else:
            print("⚠️ No hay APIs habilitadas")
            
    except Exception as e:
        print(f"❌ Error cargando configuración: {e}")
        return False
    
    return True

async def test_learning_module():
    """Prueba la funcionalidad básica del módulo de aprendizaje"""
    print("\n🧠 Probando módulo de aprendizaje...")
    
    try:
        from lucia_threejs_learning import LuciaThreeJSLearning
        
        # Crear instancia
        learning_module = LuciaThreeJSLearning()
        print("✅ Instancia de LuciaThreeJSLearning creada")
        
        # Probar carga de progreso
        if learning_module.load_learning_progress():
            print("✅ Progreso cargado correctamente")
        else:
            print("ℹ️ No hay progreso anterior para cargar")
        
        # Probar obtención de progreso
        progress = learning_module.get_learning_progress()
        print(f"✅ Progreso obtenido: Módulo {progress['current_module']}")
        
        # Probar guardado de progreso
        progress_file = learning_module.save_learning_progress()
        print(f"✅ Progreso guardado en: {progress_file}")
        
        # Verificar proyectos de aprendizaje
        projects = learning_module.learning_projects
        print(f"✅ {len(projects)} proyectos de aprendizaje configurados")
        
        for module_num, project in projects.items():
            print(f"   - Módulo {module_num}: {project['name']} ({project['difficulty']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error probando módulo de aprendizaje: {e}")
        return False

async def test_api_connection():
    """Prueba la conexión con la API de Gemini"""
    print("\n🌐 Probando conexión con API...")
    
    try:
        from lucia_core import LucIACore
        from config import PersonalityType
        
        # Crear instancia de Lucía
        lucia = LucIACore(
            name="Lucía Test",
            personality=PersonalityType.CREATIVE,
            enable_memory=False,  # Deshabilitar memoria para prueba rápida
            enable_paraphrasing=False  # Deshabilitar parafraseo para prueba rápida
        )
        
        print("✅ Instancia de Lucía creada para prueba")
        
        # Probar chat simple
        test_prompt = "Hola, ¿puedes explicarme brevemente qué es Three.js?"
        
        print("🔄 Probando conexión con API...")
        response = await lucia.chat(test_prompt)
        
        if response and response.paraphrased_response:
            print("✅ Respuesta recibida de la API")
            print(f"   Fuente: {response.source_api}")
            print(f"   Confianza: {response.confidence:.2f}")
            print(f"   Tiempo: {response.processing_time:.2f}s")
            
            # Mostrar parte de la respuesta
            preview = response.paraphrased_response[:100] + "..."
            print(f"   Vista previa: {preview}")
            
            return True
        else:
            print("❌ No se recibió respuesta de la API")
            return False
            
    except Exception as e:
        print(f"❌ Error probando API: {e}")
        return False

def test_prompt_content():
    """Prueba el contenido del prompt especializado"""
    print("\n📝 Probando contenido del prompt...")
    
    prompt_path = Path(__file__).parent / "prompts" / "lucia_threejs_learning_prompt.md"
    
    if not prompt_path.exists():
        print("❌ Archivo de prompt no encontrado")
        return False
    
    with open(prompt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar elementos clave
    key_elements = [
        "Lucía",
        "Three.js",
        "representación 3D femenina",
        "módulos de aprendizaje",
        "prompt especializado",
        "Gemini"
    ]
    
    missing_elements = []
    for element in key_elements:
        if element in content:
            print(f"✅ '{element}' encontrado en el prompt")
        else:
            print(f"❌ '{element}' no encontrado en el prompt")
            missing_elements.append(element)
    
    if missing_elements:
        print(f"⚠️ Faltan elementos: {', '.join(missing_elements)}")
        return False
    
    print("✅ Todos los elementos clave presentes en el prompt")
    return True

async def run_all_tests():
    """Ejecuta todas las pruebas"""
    print("🧪 INICIANDO PRUEBAS DEL SISTEMA DE APRENDIZAJE THREE.JS")
    print("=" * 60)
    
    tests = [
        ("Importaciones", test_imports),
        ("Estructura de archivos", test_file_structure),
        ("Configuración", test_configuration),
        ("Contenido del prompt", test_prompt_content),
        ("Módulo de aprendizaje", test_learning_module),
        ("Conexión API", test_api_connection)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Error en prueba {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumen de resultados
    print(f"\n{'='*60}")
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron! El sistema está listo para usar.")
        return True
    else:
        print("⚠️ Algunas pruebas fallaron. Revisa los errores antes de usar el sistema.")
        return False

def main():
    """Función principal"""
    try:
        success = asyncio.run(run_all_tests())
        
        if success:
            print(f"\n🚀 Para usar el sistema:")
            print(f"   1. python ejemplo_aprendizaje_threejs.py")
            print(f"   2. python lucia_threejs_learning.py")
            print(f"\n📚 Para más información, consulta README_THREEJS_LEARNING.md")
        else:
            print(f"\n🔧 Revisa los errores y vuelve a ejecutar las pruebas")
            
    except KeyboardInterrupt:
        print(f"\n👋 Pruebas interrumpidas por el usuario")
    except Exception as e:
        print(f"\n❌ Error general: {e}")

if __name__ == "__main__":
    main() 