import os
from dotenv import load_dotenv
import anthropic

# Cargar variables de entorno
env_loaded = load_dotenv()
api_key = os.getenv('ANTHROPIC_API_KEY')

print(f"¿.env cargado?: {env_loaded}")
print(f"API KEY detectada: {api_key[:8]}...{api_key[-8:] if api_key else ''}")

if not api_key or not api_key.startswith('sk-ant-'):
    print("❌ No se detectó una API key válida de Claude.")
    exit(1)

try:
    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-3-haiku-20240307",  # Modelo gratuito
        max_tokens=32,
        messages=[{"role": "user", "content": "Responde solo con OK si recibes este mensaje."}]
    )
    print("✅ Respuesta de Claude:", response.content[0].text)
except Exception as e:
    print(f"❌ Error al conectar con Claude: {e}") 