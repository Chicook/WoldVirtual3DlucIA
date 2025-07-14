#!/usr/bin/env python3
"""
Script para configurar la API de ChatGPT de forma segura
Este script te ayuda a configurar tu API key sin exponerla en el código
"""

import os
import json
from pathlib import Path
from getpass import getpass

def crear_archivo_env():
    """Crea el archivo .env con la configuración de la API"""
    
    print("🔐 CONFIGURACIÓN SEGURA DE API DE CHATGPT")
    print("=" * 50)
    print()
    
    # Verificar si ya existe un archivo .env
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        print("⚠️  Ya existe un archivo .env")
        respuesta = input("¿Quieres sobrescribirlo? (s/N): ").lower()
        if respuesta != 's':
            print("❌ Configuración cancelada")
            return
    
    # Solicitar la API key de forma segura
    print("📝 INGRESA TU API KEY DE CHATGPT")
    print("Obtén tu clave gratuita en: https://platform.openai.com/api-keys")
    print()
    
    api_key = getpass("🔑 API Key de OpenAI (no se mostrará): ").strip()
    
    if not api_key:
        print("❌ No se proporcionó una API key")
        return
    
    # Verificar formato básico de la API key
    if not api_key.startswith("sk-"):
        print("⚠️  La API key no parece tener el formato correcto (debería empezar con 'sk-')")
        continuar = input("¿Continuar de todas formas? (s/N): ").lower()
        if continuar != 's':
            return
    
    # Crear contenido del archivo .env
    env_content = f"""# ===========================================
# LUCIA IA - CONFIGURACIÓN DE API
# ===========================================
# Archivo generado automáticamente - NO SUBIR A GITHUB

# ===========================================
# OPENAI API (ChatGPT)
# ===========================================
OPENAI_API_KEY={api_key}

# ===========================================
# CONFIGURACIÓN DE LUCIA
# ===========================================
LUCIA_DEFAULT_PERSONALITY=metaverso
LUCIA_LOG_LEVEL=INFO
LUCIA_ENABLE_PARAPHRASING=true
LUCIA_ENABLE_MEMORY_LEARNING=true
LUCIA_ENABLE_API_ROTATION=true

# ===========================================
# CONFIGURACIÓN DE SEGURIDAD
# ===========================================
LUCIA_ENCRYPT_SENSITIVE_DATA=true
LUCIA_LOG_API_CALLS=false
LUCIA_RATE_LIMITING=true
"""
    
    # Escribir el archivo .env
    try:
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Archivo .env creado exitosamente")
        print(f"📁 Ubicación: {env_file}")
        print()
        
        # Configurar la API en el sistema
        configurar_api_en_sistema(api_key)
        
    except Exception as e:
        print(f"❌ Error creando el archivo .env: {e}")

def configurar_api_en_sistema(api_key):
    """Configura la API en el sistema de configuración de LucIA"""
    
    print("🔧 CONFIGURANDO API EN EL SISTEMA")
    print("=" * 40)
    
    try:
        # Importar el módulo de configuración
        from config import Config, APIType
        
        # Crear instancia de configuración
        config = Config()
        
        # Agregar la API de OpenAI
        config.add_api(
            name="openai_chatgpt",
            api_type=APIType.OPENAI,
            api_key=api_key,
            endpoint="https://api.openai.com/v1",
            model="gpt-3.5-turbo",  # Modelo gratuito
            daily_limit=100,  # Límite diario para versión gratuita
            priority=1,  # Prioridad alta
            cost_per_request=0.002,  # Costo aproximado por 1K tokens
            response_timeout=30,
            max_tokens=1500,
            temperature=0.7
        )
        
        print("✅ API de ChatGPT configurada en el sistema")
        print("📊 Configuración:")
        print(f"   - Modelo: gpt-3.5-turbo")
        print(f"   - Límite diario: 100 requests")
        print(f"   - Prioridad: 1 (alta)")
        print(f"   - Timeout: 30 segundos")
        
        # Mostrar APIs disponibles
        print()
        print("📋 APIs configuradas:")
        for api in config.get_enabled_apis():
            print(f"   - {api.name}: {api.api_type.value} ({'✅' if api.enabled else '❌'})")
        
    except Exception as e:
        print(f"❌ Error configurando la API en el sistema: {e}")
        print("💡 Puedes configurar manualmente editando el archivo de configuración")

def verificar_configuracion():
    """Verifica que la configuración esté correcta"""
    
    print("🔍 VERIFICANDO CONFIGURACIÓN")
    print("=" * 30)
    
    # Verificar archivo .env
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        print("✅ Archivo .env encontrado")
        
        # Verificar que no esté en git
        try:
            from git import Repo
            repo = Repo(Path(__file__).parent.parent)
            if not repo.ignored(env_file):
                print("✅ Archivo .env está en .gitignore")
            else:
                print("⚠️  Archivo .env NO está en .gitignore")
        except:
            print("ℹ️  No se pudo verificar .gitignore")
    else:
        print("❌ Archivo .env no encontrado")
    
    # Verificar configuración del sistema
    try:
        from config import Config
        config = Config()
        apis = config.get_enabled_apis()
        
        if apis:
            print(f"✅ {len(apis)} APIs configuradas en el sistema")
            for api in apis:
                print(f"   - {api.name}: {api.api_type.value}")
        else:
            print("❌ No hay APIs configuradas en el sistema")
            
    except Exception as e:
        print(f"❌ Error verificando configuración del sistema: {e}")

def main():
    """Función principal"""
    
    print("🤖 CONFIGURADOR DE API PARA LUCIA IA")
    print("=" * 50)
    print()
    
    while True:
        print("Opciones disponibles:")
        print("1. 🔐 Configurar API de ChatGPT")
        print("2. 🔍 Verificar configuración actual")
        print("3. ❌ Salir")
        print()
        
        opcion = input("Selecciona una opción (1-3): ").strip()
        
        if opcion == "1":
            crear_archivo_env()
        elif opcion == "2":
            verificar_configuracion()
        elif opcion == "3":
            print("👋 ¡Hasta luego!")
            break
        else:
            print("❌ Opción no válida")
        
        print()
        input("Presiona Enter para continuar...")
        print()

if __name__ == "__main__":
    main() 