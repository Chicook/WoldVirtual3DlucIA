import os
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv()

# Leer la variable
api_key = os.getenv('OPENAI_API_KEY')

print(f"OPENAI_API_KEY: {api_key}")
if api_key and api_key.startswith('sk-'):
    print("✅ La variable se lee correctamente.")
else:
    print("❌ La variable NO se lee correctamente.") 