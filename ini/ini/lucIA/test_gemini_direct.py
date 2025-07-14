#!/usr/bin/env python3
"""
Script para probar la API de Gemini directamente
"""

import requests

# Clave de Gemini directamente
api_key = "AIzaSyD6JzBZiCrasLVxYr_SGVrZ79o8HboHg34"
print(f"Clave a probar: {api_key[:10]}...{api_key[-10:]}")

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