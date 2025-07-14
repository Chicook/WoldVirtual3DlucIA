"""
Prueba Directa de Conexión con Gemini
Script para verificar que la nueva clave funciona correctamente
"""

import os
import sys
import asyncio
import aiohttp
import json
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

def cargar_clave_gemini():
    """Carga la clave de Gemini desde el archivo .env"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ Archivo .env no encontrado")
        return None
    
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for line in lines:
            if line.startswith('GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")=', 1)[1].strip()
                print(f"🔑 Clave cargada: {clave[:8]}...{clave[-4:]}")
                return clave
        
        print("❌ No se encontró GEMINI_API_KEY en el archivo .env")
        return None
        
    except Exception as e:
        print(f"❌ Error leyendo archivo .env: {e}")
        return None

async def test_gemini_directo():
    """Prueba directa de conexión con Gemini"""
    print("🌐 PRUEBA DIRECTA DE CONEXIÓN CON GEMINI")
    print("=" * 50)
    
    # Cargar clave
    api_key = cargar_clave_gemini()
    if not api_key:
        return False
    
    # URL de la API de Gemini
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={api_key}"
    
    # Datos de prueba
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Hola, responde solo con 'Conexión exitosa con Gemini'"
                    }
                ]
            }
        ]
    }
    
    try:
        print("🔄 Enviando solicitud a Gemini...")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                print(f"📡 Código de respuesta: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ ¡CONEXIÓN EXITOSA!")
                    
                    # Extraer respuesta
                    if 'candidates' in result and len(result['candidates']) > 0:
                        content = result['candidates'][0]['content']
                        if 'parts' in content and len(content['parts']) > 0:
                            text = content['parts'][0]['text']
                            print(f"💬 Respuesta: {text}")
                    
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Error en la respuesta:")
                    print(f"   Código: {response.status}")
                    print(f"   Respuesta: {error_text}")
                    return False
                    
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

async def test_con_configuracion():
    """Prueba usando la configuración del sistema"""
    print("\n🔧 PRUEBA USANDO CONFIGURACIÓN DEL SISTEMA")
    print("=" * 50)
    
    try:
        from config import config
        from api_manager import APIManager
        from memory import MemoryManager
        
        print("✅ Configuración cargada")
        
        # Verificar APIs configuradas
        enabled_apis = config.get_enabled_apis()
        print(f"📡 APIs habilitadas: {len(enabled_apis)}")
        
        for api in enabled_apis:
            print(f"   - {api.name} ({api.api_type.value}) - Prioridad: {api.priority}")
            if api.name == "gemini_pro":
                print(f"     Clave: {api.api_key[:8]}...{api.api_key[-4:]}")
        
        # Probar con el sistema
        memory_manager = MemoryManager()
        
        async with APIManager(memory_manager) as api_manager:
            test_prompt = "Responde solo con 'Prueba exitosa del sistema'"
            
            print("🔄 Probando con el sistema...")
            response = await api_manager.get_response(test_prompt)
            
            if response and response.success:
                print("✅ ¡SISTEMA FUNCIONANDO!")
                print(f"   Fuente: {response.source_api}")
                print(f"   Respuesta: {response.content}")
                return True
            else:
                print("❌ Error en el sistema")
                if response:
                    print(f"   Error: {response.error_message}")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    """Función principal"""
    print("🧪 PRUEBA COMPLETA DE CONEXIÓN GEMINI")
    print("=" * 60)
    
    # Prueba directa
    directo_ok = await test_gemini_directo()
    
    # Prueba con configuración
    config_ok = await test_con_configuracion()
    
    # Resumen
    print("\n📊 RESUMEN DE PRUEBAS")
    print("=" * 30)
    print(f"Prueba directa: {'✅ EXITOSA' if directo_ok else '❌ FALLÓ'}")
    print(f"Prueba con sistema: {'✅ EXITOSA' if config_ok else '❌ FALLÓ'}")
    
    if directo_ok and config_ok:
        print("\n🎉 ¡TODAS LAS PRUEBAS PASARON!")
        print("✅ Lucía está completamente conectada a Gemini")
        print("🚀 Puedes usar el sistema de aprendizaje Three.js")
    elif directo_ok:
        print("\n⚠️ Gemini funciona, pero hay problema con la configuración")
        print("💡 Revisa la configuración del sistema")
    else:
        print("\n❌ Problema con la clave de Gemini")
        print("💡 Verifica que la clave sea válida y esté activa")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Prueba interrumpida")
    except Exception as e:
        print(f"\n❌ Error general: {e}") 