"""
Diagnóstico de Conexión de Lucía
Script para identificar y solucionar problemas de conexión
"""

import os
import sys
from pathlib import Path
import json
import asyncio

def verificar_archivo_env():
    """Verifica si existe el archivo .env y su contenido"""
    print("🔍 Verificando archivo .env...")
    
    env_path = Path(__file__).parent / ".env"
    env_example_path = Path(__file__).parent / "env.example"
    
    if env_path.exists():
        print("✅ Archivo .env encontrado")
        
        # Verificar contenido
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Verificar claves API
        apis_to_check = [
            ("GEMINI_API_KEY", "Google Gemini"),
            ("OPENAI_API_KEY", "OpenAI"),
            ("ANTHROPIC_API_KEY", "Anthropic Claude"),
            ("HUGGINGFACE_API_KEY", "HuggingFace")
        ]
        
        for key, name in apis_to_check:
            if key in content:
                # Verificar si tiene un valor real
                lines = content.split('\n')
                for line in lines:
                    if line.startswith(f"{key}="):
                        value = line.split('=', 1)[1].strip()
                        if value and value != f"tu_clave_api_de_{key.lower().replace('_api_key', '')}_aqui":
                            print(f"   ✅ {name} configurada")
                        else:
                            print(f"   ⚠️ {name} no configurada (valor por defecto)")
                        break
            else:
                print(f"   ❌ {name} no encontrada")
        
        return True
    else:
        print("❌ Archivo .env no encontrado")
        
        if env_example_path.exists():
            print("📋 Archivo env.example encontrado")
            print("💡 Creando archivo .env desde env.example...")
            
            # Copiar env.example a .env
            with open(env_example_path, 'r', encoding='utf-8') as f:
                example_content = f.read()
            
            with open(env_path, 'w', encoding='utf-8') as f:
                f.write(example_content)
            
            print("✅ Archivo .env creado desde env.example")
            print("⚠️ IMPORTANTE: Debes configurar tus claves API reales en el archivo .env")
            return False
        else:
            print("❌ Archivo env.example no encontrado")
            return False

def verificar_dependencias():
    """Verifica que las dependencias estén instaladas"""
    print("\n📦 Verificando dependencias...")
    
    required_packages = [
        "requests",
        "aiohttp",
        "python-dotenv",
        "numpy",
        "scikit-learn"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - NO INSTALADO")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️ Paquetes faltantes: {', '.join(missing_packages)}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False
    
    return True

def verificar_configuracion():
    """Verifica la configuración de Lucía"""
    print("\n⚙️ Verificando configuración...")
    
    try:
        sys.path.append(str(Path(__file__).parent))
        from config import config
        
        print("✅ Configuración cargada correctamente")
        
        # Verificar APIs configuradas
        enabled_apis = config.get_enabled_apis()
        if enabled_apis:
            print(f"✅ {len(enabled_apis)} APIs habilitadas:")
            for api in enabled_apis:
                print(f"   - {api.name} ({api.api_type.value}) - Prioridad: {api.priority}")
        else:
            print("❌ No hay APIs habilitadas")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error cargando configuración: {e}")
        return False

async def test_conexion_api():
    """Prueba la conexión con las APIs configuradas"""
    print("\n🌐 Probando conexión con APIs...")
    
    try:
        sys.path.append(str(Path(__file__).parent))
        from api_manager import APIManager
        from memory import MemoryManager
        
        # Crear instancia del gestor de APIs
        memory_manager = MemoryManager()
        
        async with APIManager(memory_manager) as api_manager:
            # Probar con un prompt simple
            test_prompt = "Hola, ¿puedes responder con un simple 'Hola'?"
            
            print("🔄 Probando conexión...")
            response = await api_manager.get_response(test_prompt)
            
            if response and response.success:
                print("✅ Conexión exitosa")
                print(f"   Fuente: {response.source_api}")
                print(f"   Confianza: {response.confidence:.2f}")
                print(f"   Tiempo: {response.processing_time:.2f}s")
                print(f"   Respuesta: {response.content[:100]}...")
                return True
            else:
                print("❌ No se pudo obtener respuesta")
                if response:
                    print(f"   Error: {response.error_message}")
                return False
                
    except Exception as e:
        print(f"❌ Error probando conexión: {e}")
        return False

def crear_archivo_env():
    """Crea un archivo .env básico"""
    print("\n🔧 Creando archivo .env básico...")
    
    env_content = """# ===========================================
# LUCIA IA - CONFIGURACIÓN DE APIS
# ===========================================
# Configura tus claves API reales aquí

# ===========================================
# GOOGLE GEMINI API (PRINCIPAL)
# ===========================================
# Obtén tu clave en: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=tu_clave_api_de_gemini_aqui

# ===========================================
# OPENAI API (ChatGPT) - OPCIONAL
# ===========================================
# Obtén tu clave en: https://platform.openai.com/api-keys
OPENAI_API_KEY=tu_clave_api_de_openai_aqui

# ===========================================
# ANTHROPIC API (Claude) - OPCIONAL
# ===========================================
# Obtén tu clave en: https://console.anthropic.com/
ANTHROPIC_API_KEY=tu_clave_api_de_anthropic_aqui

# ===========================================
# HUGGINGFACE API - OPCIONAL
# ===========================================
# Obtén tu clave en: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=tu_clave_api_de_huggingface_aqui

# ===========================================
# CONFIGURACIÓN DE LUCIA
# ===========================================
LUCIA_DEFAULT_PERSONALITY=metaverso
LUCIA_LOG_LEVEL=INFO
LUCIA_ENABLE_PARAPHRASING=true
LUCIA_ENABLE_MEMORY_LEARNING=true
LUCIA_ENABLE_API_ROTATION=true
LUCIA_ENCRYPT_SENSITIVE_DATA=true
LUCIA_LOG_API_CALLS=false
LUCIA_RATE_LIMITING=true
"""
    
    env_path = Path(__file__).parent / ".env"
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print("✅ Archivo .env creado")
    print("⚠️ IMPORTANTE: Configura tu GEMINI_API_KEY real en el archivo .env")

def mostrar_instrucciones_configuracion():
    """Muestra instrucciones para configurar las APIs"""
    print("\n📋 INSTRUCCIONES DE CONFIGURACIÓN")
    print("=" * 50)
    
    print("\n🔑 Para obtener tu clave de Google Gemini:")
    print("1. Ve a: https://makersuite.google.com/app/apikey")
    print("2. Inicia sesión con tu cuenta de Google")
    print("3. Haz clic en 'Create API Key'")
    print("4. Copia la clave generada")
    print("5. Pégala en el archivo .env como: GEMINI_API_KEY=tu_clave_aqui")
    
    print("\n🔑 Para obtener tu clave de OpenAI (opcional):")
    print("1. Ve a: https://platform.openai.com/api-keys")
    print("2. Inicia sesión o crea una cuenta")
    print("3. Haz clic en 'Create new secret key'")
    print("4. Copia la clave generada")
    print("5. Pégala en el archivo .env como: OPENAI_API_KEY=tu_clave_aqui")
    
    print("\n📝 Después de configurar las claves:")
    print("1. Guarda el archivo .env")
    print("2. Ejecuta este script nuevamente para verificar la conexión")
    print("3. O ejecuta: python test_threejs_learning.py")

def verificar_estructura_archivos():
    """Verifica que todos los archivos necesarios existan"""
    print("\n📁 Verificando estructura de archivos...")
    
    required_files = [
        "lucia_core.py",
        "config.py",
        "api_manager.py",
        "memory.py",
        "lucia_threejs_learning.py",
        "test_threejs_learning.py"
    ]
    
    missing_files = []
    
    for file_name in required_files:
        file_path = Path(__file__).parent / file_name
        if file_path.exists():
            print(f"   ✅ {file_name}")
        else:
            print(f"   ❌ {file_name} - NO ENCONTRADO")
            missing_files.append(file_name)
    
    if missing_files:
        print(f"\n❌ Archivos faltantes: {', '.join(missing_files)}")
        return False
    
    return True

async def main():
    """Función principal de diagnóstico"""
    print("🔍 DIAGNÓSTICO DE CONEXIÓN DE LUCÍA")
    print("=" * 50)
    
    # Verificar estructura de archivos
    if not verificar_estructura_archivos():
        print("\n❌ Problema: Archivos faltantes")
        return
    
    # Verificar dependencias
    if not verificar_dependencias():
        print("\n❌ Problema: Dependencias faltantes")
        print("💡 Solución: pip install -r requirements.txt")
        return
    
    # Verificar archivo .env
    env_ok = verificar_archivo_env()
    
    if not env_ok:
        print("\n⚠️ Problema: Archivo .env no configurado")
        crear_archivo_env()
        mostrar_instrucciones_configuracion()
        return
    
    # Verificar configuración
    if not verificar_configuracion():
        print("\n❌ Problema: Error en configuración")
        return
    
    # Probar conexión
    if await test_conexion_api():
        print("\n🎉 ¡LUCÍA ESTÁ CONECTADA Y FUNCIONANDO!")
        print("✅ Puedes usar el sistema de aprendizaje Three.js")
        print("\n🚀 Para probar el sistema:")
        print("   python test_threejs_learning.py")
        print("   python ejemplo_aprendizaje_threejs.py")
    else:
        print("\n❌ Problema: No se puede conectar a las APIs")
        print("💡 Posibles soluciones:")
        print("   1. Verifica que tu clave API sea correcta")
        print("   2. Verifica tu conexión a internet")
        print("   3. Verifica que la API no esté en mantenimiento")
        print("   4. Revisa los logs para más detalles")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Diagnóstico interrumpido por el usuario")
    except Exception as e:
        print(f"\n❌ Error durante el diagnóstico: {e}") 