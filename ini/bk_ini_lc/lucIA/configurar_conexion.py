"""
Configuración Rápida de Conexión para Lucía
Script para configurar rápidamente la conexión de Lucía
"""

import os
import sys
from pathlib import Path
import asyncio

def crear_env_basico():
    """Crea un archivo .env básico con configuración mínima"""
    print("🔧 Creando archivo .env básico...")
    
    env_content = """# ===========================================
# LUCIA IA - CONFIGURACIÓN MÍNIMA
# ===========================================
# SOLO NECESITAS CONFIGURAR GEMINI_API_KEY PARA EMPEZAR

# ===========================================
# GOOGLE GEMINI API (OBLIGATORIA)
# ===========================================
# Obtén tu clave GRATUITA en: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=tu_clave_api_de_gemini_aqui

# ===========================================
# CONFIGURACIÓN BÁSICA DE LUCIA
# ===========================================
LUCIA_DEFAULT_PERSONALITY=metaverso
LUCIA_LOG_LEVEL=INFO
LUCIA_ENABLE_PARAPHRASING=true
LUCIA_ENABLE_MEMORY_LEARNING=true
"""
    
    env_path = Path(__file__).parent / ".env"
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print("✅ Archivo .env creado")
    return env_path

def mostrar_instrucciones_gemini():
    """Muestra instrucciones específicas para obtener la clave de Gemini"""
    print("\n🔑 OBTENER CLAVE DE GOOGLE GEMINI (GRATUITA)")
    print("=" * 50)
    print("1. Ve a: https://makersuite.google.com/app/apikey")
    print("2. Inicia sesión con tu cuenta de Google")
    print("3. Haz clic en 'Create API Key'")
    print("4. Copia la clave generada (empieza con 'AIza...')")
    print("5. Abre el archivo .env en tu editor")
    print("6. Reemplaza 'tu_clave_api_de_gemini_aqui' con tu clave real")
    print("7. Guarda el archivo")
    print("\n💡 Ejemplo:")
    print("   GEMINI_API_KEY=GEMINI_API_KEY_REMOVEDwxyz")

def verificar_clave_gemini():
    """Verifica si la clave de Gemini está configurada correctamente"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        return False
    
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar la línea con GEMINI_API_KEY
    lines = content.split('\n')
    for line in lines:
        if line.startswith('GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")=', 1)[1].strip()
            # Verificar si es una clave real (empieza con AIza)
            if value.startswith('AIza') and len(value) > 30:
                return True
            else:
                return False
    
    return False

async def test_conexion_simple():
    """Prueba una conexión simple con Gemini"""
    print("\n🌐 Probando conexión con Gemini...")
    
    try:
        # Importar módulos necesarios
        sys.path.append(str(Path(__file__).parent))
        
        from config import config
        from api_manager import APIManager
        from memory import MemoryManager
        
        # Verificar que Gemini esté configurada
        gemini_api = config.get_api_by_name("gemini_pro")
        if not gemini_api or not gemini_api.enabled:
            print("❌ Gemini no está configurada o habilitada")
            return False
        
        print("✅ Gemini configurada correctamente")
        
        # Crear instancia del gestor de APIs
        memory_manager = MemoryManager()
        
        async with APIManager(memory_manager) as api_manager:
            # Probar con un prompt simple
            test_prompt = "Responde solo con 'Hola, soy Lucía'"
            
            print("🔄 Enviando prueba...")
            response = await api_manager.get_response(test_prompt)
            
            if response and response.success:
                print("✅ ¡CONEXIÓN EXITOSA!")
                print(f"   Respuesta: {response.content}")
                print(f"   Tiempo: {response.processing_time:.2f}s")
                return True
            else:
                print("❌ Error en la conexión")
                if response:
                    print(f"   Error: {response.error_message}")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def mostrar_pasos_siguientes():
    """Muestra los pasos siguientes después de la configuración"""
    print("\n🚀 PRÓXIMOS PASOS")
    print("=" * 30)
    print("1. ✅ Configura tu clave de Gemini en .env")
    print("2. 🔄 Ejecuta: python diagnostico_conexion.py")
    print("3. 🧪 Ejecuta: python test_threejs_learning.py")
    print("4. 🎭 Ejecuta: python ejemplo_aprendizaje_threejs.py")
    print("5. 🌟 ¡Disfruta aprendiendo Three.js con Lucía!")

async def main():
    """Función principal"""
    print("🎭 CONFIGURACIÓN RÁPIDA DE LUCÍA")
    print("=" * 40)
    
    # Verificar si ya existe .env
    env_path = Path(__file__).parent / ".env"
    
    if env_path.exists():
        print("📋 Archivo .env encontrado")
        
        if verificar_clave_gemini():
            print("✅ Clave de Gemini configurada correctamente")
            
            # Probar conexión
            if await test_conexion_simple():
                print("\n🎉 ¡LUCÍA ESTÁ LISTA PARA USAR!")
                mostrar_pasos_siguientes()
            else:
                print("\n❌ Problema con la conexión")
                print("💡 Verifica tu clave de Gemini")
        else:
            print("⚠️ Clave de Gemini no configurada")
            mostrar_instrucciones_gemini()
    else:
        print("📋 Archivo .env no encontrado")
        crear_env_basico()
        mostrar_instrucciones_gemini()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Configuración interrumpida")
    except Exception as e:
        print(f"\n❌ Error: {e}") 