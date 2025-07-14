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
    model = genai.GenerativeModel('models/gemini-1.5-pro-latest')
    response = model.generate_content("Responde solo con OK si recibes este mensaje.")
    print("✅ Respuesta de Gemini:", response.text)
except Exception as e:
    print(f"❌ Error al conectar con Gemini: {e}") 