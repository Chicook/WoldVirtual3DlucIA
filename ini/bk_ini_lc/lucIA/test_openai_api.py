import os
from dotenv import load_dotenv
import openai

# Cargar variables de entorno
env_loaded = load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

print(f"¿.env cargado?: {env_loaded}")
print(f"API KEY detectada: {api_key[:8]}...{api_key[-8:]}")

if not api_key or not api_key.startswith('sk-'):
    print("❌ No se detectó una API key válida.")
    exit(1)

try:
    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Responde solo con OK si recibes este mensaje."}],
        max_tokens=5,
        temperature=0
    )
    print("✅ Respuesta de OpenAI:", response.choices[0].message.content)
    print(f"Tokens usados: {response.usage.total_tokens}")
except Exception as e:
    print(f"❌ Error al conectar con OpenAI: {e}") 