#!/usr/bin/env python3
"""
Script para probar la configuración de la API de ChatGPT
"""

import os
import sys
from pathlib import Path

def probar_configuracion():
    """Prueba la configuración de la API"""
    
    print("🧪 PROBANDO CONFIGURACIÓN DE API")
    print("=" * 40)
    
    # Verificar archivo .env
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        print("❌ No se encontró el archivo .env")
        print("💡 Ejecuta primero: python configurar_api.py")
        return False
    
    print("✅ Archivo .env encontrado")
    
    # Cargar variables de entorno
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file)
        print("✅ Variables de entorno cargadas")
    except Exception as e:
        print(f"❌ Error cargando variables de entorno: {e}")
        return False
    
    # Verificar API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ No se encontró OPENAI_API_KEY en las variables de entorno")
        return False
    
    print("✅ API key encontrada")
    
    # Verificar formato de la API key
    if not api_key.startswith("sk-"):
        print("⚠️  La API key no tiene el formato esperado (debería empezar con 'sk-')")
    
    # Probar configuración del sistema
    try:
        from config import Config
        config = Config()
        
        apis = config.get_enabled_apis()
        if not apis:
            print("❌ No hay APIs configuradas en el sistema")
            return False
        
        print(f"✅ {len(apis)} APIs configuradas:")
        for api in apis:
            print(f"   - {api.name}: {api.api_type.value} (Prioridad: {api.priority})")
        
        # Buscar API de OpenAI
        openai_api = None
        for api in apis:
            if api.api_type.value == "openai":
                openai_api = api
                break
        
        if not openai_api:
            print("❌ No se encontró la API de OpenAI en la configuración")
            return False
        
        print("✅ API de OpenAI configurada correctamente")
        print(f"   - Modelo: {openai_api.model}")
        print(f"   - Endpoint: {openai_api.endpoint}")
        print(f"   - Límite diario: {openai_api.daily_limit}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando configuración del sistema: {e}")
        return False

def probar_conexion_api():
    """Prueba la conexión real con la API"""
    
    print("\n🌐 PROBANDO CONEXIÓN CON LA API")
    print("=" * 40)
    
    try:
        import openai
        from dotenv import load_dotenv
        
        # Cargar variables de entorno
        env_file = Path(__file__).parent / ".env"
        load_dotenv(env_file)
        
        # Configurar cliente de OpenAI
        client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            timeout=30.0
        )
        
        print("🔄 Enviando prueba a la API...")
        
        # Prueba simple
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Responde solo con 'OK' si recibes este mensaje."}
            ],
            max_tokens=10,
            temperature=0
        )
        
        if response.choices and response.choices[0].message.content:
            print("✅ Conexión exitosa con la API de OpenAI")
            print(f"📝 Respuesta: {response.choices[0].message.content}")
            print(f"💰 Tokens usados: {response.usage.total_tokens}")
            return True
        else:
            print("❌ No se recibió respuesta válida de la API")
            return False
            
    except Exception as e:
        print(f"❌ Error conectando con la API: {e}")
        return False

def probar_lucia_completa():
    """Prueba LucIA completa con la API configurada"""
    
    print("\n🤖 PROBANDO LUCIA COMPLETA")
    print("=" * 40)
    
    try:
        from lucia_core import LuciaCore
        
        # Crear instancia de LucIA
        lucia = LuciaCore()
        
        print("🔄 Inicializando LucIA...")
        
        # Probar respuesta simple
        respuesta = lucia.process_message("Hola, ¿cómo estás?")
        
        if respuesta:
            print("✅ LucIA respondió correctamente")
            print(f"📝 Respuesta: {respuesta[:100]}...")
            return True
        else:
            print("❌ LucIA no respondió")
            return False
            
    except Exception as e:
        print(f"❌ Error probando LucIA: {e}")
        return False

def main():
    """Función principal"""
    
    print("🧪 TEST COMPLETO DE CONFIGURACIÓN DE API")
    print("=" * 50)
    print()
    
    # Paso 1: Probar configuración
    if not probar_configuracion():
        print("\n❌ Configuración incorrecta. Revisa los pasos anteriores.")
        return
    
    # Paso 2: Probar conexión con API
    if not probar_conexion_api():
        print("\n❌ Error de conexión con la API. Verifica tu API key.")
        return
    
    # Paso 3: Probar LucIA completa
    if not probar_lucia_completa():
        print("\n❌ Error en LucIA. Revisa la configuración del sistema.")
        return
    
    print("\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!")
    print("✅ Tu API de ChatGPT está configurada correctamente")
    print("✅ LucIA está funcionando perfectamente")
    print("\n💡 Ahora puedes usar LucIA con: python lucIA.py")

if __name__ == "__main__":
    main() 