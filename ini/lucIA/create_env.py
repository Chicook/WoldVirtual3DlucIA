#!/usr/bin/env python3
"""Script simple para crear el archivo .env"""

env_content = """# LUCIA IA - VARIABLES DE ENTORNO SEGURAS
ANTHROPIC_API_KEY
GEMINI_API_KEY=tu_clave_api_de_gemini_aqui
DEEPSEEK_API_KEY=tu_clave_api_de_deepseek_aqui
OPENAI_API_KEY=tu_clave_api_de_openai_aqui
"""

with open('.env', 'w', encoding='utf-8') as f:
    f.write(env_content)

print("✅ Archivo .env creado exitosamente") 