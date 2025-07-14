"""
Script de instalación para LucIA - IA de la Plataforma Metaverso
"""

import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Instala las dependencias necesarias"""
    print("📦 Instalando dependencias...")
    
    # Dependencias básicas
    basic_deps = [
        "aiohttp==3.9.1",
        "requests==2.31.0",
        "python-dotenv==1.0.0",
        "loguru==0.7.2",
        "rich==13.7.0"
    ]
    
    # Dependencias opcionales (APIs)
    optional_deps = [
        "openai==1.3.7",
        "anthropic==0.7.8",
        "google-generativeai==0.3.2"
    ]
    
    # Dependencias de NLP (opcionales)
    nlp_deps = [
        "nltk==3.8.1",
        "textblob==0.17.1"
    ]
    
    all_deps = basic_deps + optional_deps + nlp_deps
    
    for dep in all_deps:
        try:
            print(f"  Instalando {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
        except subprocess.CalledProcessError as e:
            print(f"  ⚠️  Error instalando {dep}: {e}")
            continue
    
    print("✅ Dependencias instaladas")

def create_directories():
    """Crea los directorios necesarios"""
    print("📁 Creando directorios...")
    
    directories = [
        "lucia_learning",
        "lucia_learning/backups",
        "lucia_learning/exports",
        "config",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"  ✅ Creado: {directory}")
    
    print("✅ Directorios creados")

def create_env_example():
    """Crea archivo de ejemplo de variables de entorno"""
    print("🔧 Creando archivo de configuración...")
    
    env_content = """# Configuración de APIs para LucIA
# Descomenta y configura las APIs que quieras usar

# OpenAI (opcional)
# OPENAI_API_KEY=tu_clave_openai_aqui

# Anthropic (opcional)
# ANTHROPIC_API_KEY=tu_clave_anthropic_aqui

# Google Gemini (opcional)
# GEMINI_API_KEY=tu_clave_gemini_aqui

# HuggingFace (gratuita, recomendada)
# HUGGINGFACE_API_KEY=tu_clave_huggingface_aqui

# Configuración de la IA
LUCIA_NAME=LucIA
LUCIA_PERSONALITY=metaverse
LUCIA_ENABLE_MEMORY=true
LUCIA_ENABLE_PARAPHRASING=true
"""
    
    with open(".env.example", "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print("✅ Archivo .env.example creado")

def test_installation():
    """Prueba la instalación"""
    print("🧪 Probando instalación...")
    
    try:
        # Probar imports
        import aiohttp
        import requests
        from dotenv import load_dotenv
        
        print("  ✅ Imports básicos funcionando")
        
        # Probar configuración
        from config import config
        print("  ✅ Configuración cargada")
        
        # Probar memoria
        from memory import MemoryManager
        memory = MemoryManager()
        print("  ✅ Sistema de memoria funcionando")
        
        # Probar paraphraser
        from paraphraser import Paraphraser, ParaphraseConfig
        from config import PersonalityType
        paraphraser = Paraphraser(ParaphraseConfig(personality=PersonalityType.METAVERSE))
        print("  ✅ Sistema de parafraseo funcionando")
        
        print("✅ Instalación completada exitosamente!")
        return True
        
    except ImportError as e:
        print(f"  ❌ Error de importación: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error en prueba: {e}")
        return False

def show_next_steps():
    """Muestra los siguientes pasos"""
    print("\n" + "="*60)
    print("🎯 PRÓXIMOS PASOS:")
    print("="*60)
    print("1. 📝 Configura las APIs (opcional):")
    print("   • Copia .env.example a .env")
    print("   • Añade tus claves de API")
    print("   • Las APIs gratuitas funcionan sin configuración")
    print()
    print("2. 🚀 Ejecuta LucIA:")
    print("   • python lucIA.py")
    print()
    print("3. 🎮 Comandos útiles:")
    print("   • 'ayuda' - Ver todos los comandos")
    print("   • 'stats' - Ver estadísticas")
    print("   • 'personalidad metaverse' - Cambiar personalidad")
    print()
    print("4. 🌐 APIs gratuitas disponibles:")
    print("   • HuggingFace (configurada por defecto)")
    print("   • Respuestas locales inteligentes")
    print()
    print("5. 💡 Características principales:")
    print("   • Rotación automática de APIs")
    print("   • Memoria persistente con parafraseo")
    print("   • Fallback a memoria cuando se agotan las APIs")
    print("   • Personalidades configurables")
    print("="*60)

def main():
    """Función principal de instalación"""
    print("🚀 Instalador de LucIA Pro - IA del Metaverso")
    print("=" * 50)
    
    # Instalar dependencias
    install_dependencies()
    
    # Crear directorios
    create_directories()
    
    # Crear archivo de configuración
    create_env_example()
    
    # Probar instalación
    if test_installation():
        show_next_steps()
    else:
        print("\n❌ Error en la instalación. Revisa los errores anteriores.")

if __name__ == "__main__":
    main() 