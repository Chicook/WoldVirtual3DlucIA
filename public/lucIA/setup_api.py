#!/usr/bin/env python3
"""
Script para configurar las claves API de LucIA de forma segura
"""

import os
import getpass

def setup_api_keys():
    """Configura las claves API de forma interactiva"""
    print("🔧 Configuración de Claves API para LucIA")
    print("=" * 50)
    
    # Crear archivo .env
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    print("\n📝 Ingresa tus claves API (presiona Enter para saltar si no tienes una):")
    
    api_keys = {}
    
    # OpenAI
    print("\n🤖 OpenAI API Key:")
    openai_key = getpass.getpass("   Ingresa tu clave OpenAI (sk-...): ").strip()
    if openai_key and openai_key != "":
        api_keys["OPENAI_API_KEY"] = openai_key
    
    # Anthropic
    print("\n🧠 Anthropic API Key:")
    anthropic_key = getpass.getpass("   Ingresa tu clave Anthropic (sk-ant-...): ").strip()
    if anthropic_key and anthropic_key != "sk-ant-your-anthropic-api-key-here":
        api_keys["ANTHROPIC_API_KEY"] = anthropic_key
    
    # Gemini
    print("\n🌟 Google Gemini API Key:")
    gemini_key = getpass.getpass("   Ingresa tu clave Gemini: ").strip()
    if gemini_key and gemini_key != "your-gemini-api-key-here":
        api_keys["GEMINI_API_KEY"] = gemini_key
    
    # Hugging Face
    print("\n🤗 Hugging Face API Key:")
    hf_key = getpass.getpass("   Ingresa tu clave Hugging Face (hf_...): ").strip()
    if hf_key and hf_key != "hf-your-huggingface-api-key-here":
        api_keys["HUGGINGFACE_API_KEY"] = hf_key
    
    # Cohere
    print("\n🔗 Cohere API Key:")
    cohere_key = getpass.getpass("   Ingresa tu clave Cohere: ").strip()
    if cohere_key and cohere_key != "your-cohere-api-key-here":
        api_keys["COHERE_API_KEY"] = cohere_key
    
    # Escribir al archivo .env
    if api_keys:
        with open(env_path, 'w') as f:
            f.write("# API Keys para LucIA\n")
            f.write("# Este archivo contiene claves sensibles - NO lo subas a Git\n\n")
            for key, value in api_keys.items():
                f.write(f"{key}={value}\n")
        
        print(f"\n✅ Archivo .env creado en: {env_path}")
        print(f"📊 Claves configuradas: {len(api_keys)}")
        
        # Mostrar qué APIs están disponibles
        print("\n🔌 APIs configuradas:")
        for key in api_keys.keys():
            api_name = key.replace("_API_KEY", "").replace("_", " ").title()
            print(f"   ✅ {api_name}")
    else:
        print("\n⚠️ No se configuraron claves API")
        print("   LucIA funcionará solo con conocimiento local")
    
    print("\n💡 Para usar LucIA:")
    print("   python lucIA.py")

if __name__ == "__main__":
    setup_api_keys() 
