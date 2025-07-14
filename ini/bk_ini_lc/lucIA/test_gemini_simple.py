#!/usr/bin/env python3
"""
Script simple para probar la API de Gemini
"""

import os
import requests
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener la clave
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    print(f"Clave detectada: {api_key[:10]}...{api_key[-10:]}")
else:
    print("Clave detectada: NO ENCONTRADA")

if not api_key:
    print("❌ No se encontró la clave de Gemini en .env")
    exit(1)

# URL de la API de Gemini
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    print("🔍 Probando conexión con Gemini...")
    response = requests.get(url, timeout=10)
    
    if response.status_code == 200:
        models = response.json()
        print("✅ Conexión exitosa!")
        print(f"📋 Modelos disponibles: {len(models.get('models', []))}")
        for model in models.get('models', [])[:5]:  # Mostrar solo los primeros 5
            print(f"  - {model['name']}")
    else:
        print(f"❌ Error HTTP {response.status_code}")
        print(f"Respuesta: {response.text}")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}") 