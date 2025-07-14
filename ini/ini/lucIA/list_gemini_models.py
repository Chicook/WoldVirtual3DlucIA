import os
from dotenv import load_dotenv
import google.generativeai as genai

# Cargar variables de entorno
env_loaded = load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

print(f"¿.env cargado?: {env_loaded}")
print(f"API KEY detectada: {api_key[:8]}...{api_key[-8:] if api_key else ''}")

if not api_key or not api_key.startswith('AIza'):
    print("❌ No se detectó una API key válida de Gemini.")
    exit(1)

try:
    genai.configure(api_key=api_key)
    print("\nModelos disponibles que soportan 'generateContent':\n")
    for m in genai.list_models():
        if hasattr(m, 'supported_generation_methods') and "generateContent" in m.supported_generation_methods:
            print(f"- {m.name} (DisplayName: {getattr(m, 'display_name', 'N/A')})")
            print(f"  Input tokens: {getattr(m, 'input_token_limit', 'N/A')}, Output tokens: {getattr(m, 'output_token_limit', 'N/A')}")
            print(f"  Supported methods: {m.supported_generation_methods}")
            print("-" * 20)
        else:
            print(f"- {m.name} (NO soporta generateContent)")
except Exception as e:
    print(f"❌ Error al listar modelos de Gemini: {e}") 