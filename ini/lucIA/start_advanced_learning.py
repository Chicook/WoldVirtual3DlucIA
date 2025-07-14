#!/usr/bin/env python3
"""
Script de inicio para el aprendizaje avanzado de LucIA
Verifica dependencias y ejecuta el sistema de aprendizaje mejorado
"""

import sys
import subprocess
import os
from pathlib import Path

def check_dependencies():
    """Verificar dependencias necesarias"""
    required_packages = [
        "requests",
        "python-dotenv"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Faltan dependencias:")
        for package in missing_packages:
            print(f"  - {package}")
        print(f"\nInstalar con: pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_api_keys():
    """Verificar que las claves de API estén configuradas"""
    from dotenv import load_dotenv
    
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        load_dotenv(env_file)
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    claude_key = os.getenv("ANTHROPIC_API_KEY")
    
    missing_keys = []
    
    if not gemini_key:
        missing_keys.append("GEMINI_API_KEY")
    if not claude_key:
        missing_keys.append("ANTHROPIC_API_KEY")
    
    if missing_keys:
        print("❌ Faltan claves de API:")
        for key in missing_keys:
            print(f"  - {key}")
        print("\nAgregar al archivo .env:")
        for key in missing_keys:
            print(f"  {key}=tu_clave_aqui")
        return False
    
    return True

def main():
    """Función principal"""
    print("🚀 LucIA Advanced Learning System")
    print("=" * 40)
    
    # Verificar dependencias
    print("🔍 Verificando dependencias...")
    if not check_dependencies():
        return
    
    # Verificar claves de API
    print("🔑 Verificando claves de API...")
    if not check_api_keys():
        return
    
    print("✅ Todo configurado correctamente")
    print("\n🎯 Iniciando aprendizaje avanzado...")
    print("📚 Enfoque: Mejorar respuestas con Claude y Gemini")
    print("🎨 Objetivo: Profundizar en temas ya aprendidos")
    print("⏱️  Duración: 4 horas intensivas")
    print("-" * 40)
    
    # Ejecutar el aprendizaje avanzado
    try:
        from lucia_advanced_learning import LucIAAdvancedLearning
        learner = LucIAAdvancedLearning()
        learner.start_advanced_learning()
    except Exception as e:
        print(f"❌ Error al iniciar el aprendizaje: {e}")
        return

if __name__ == "__main__":
    main() 