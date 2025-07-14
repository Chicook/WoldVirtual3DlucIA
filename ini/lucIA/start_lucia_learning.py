#!/usr/bin/env python3
"""
Start LucIA Learning - Script de Inicio Rápido
Configura automáticamente el entorno y inicia el aprendizaje de Three.js
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Función principal de inicio"""
    print("🚀 Iniciando LucIA Three.js Learning System")
    print("=" * 50)
    
    base_path = Path(__file__).parent
    
    # Paso 1: Configurar entorno seguro
    print("\n1️⃣ Configurando entorno seguro...")
    try:
        from configure_secure_environment import SecureEnvironmentConfigurator
        configurator = SecureEnvironmentConfigurator()
        configurator.configure_all()
        print("✅ Entorno configurado exitosamente")
    except Exception as e:
        print(f"❌ Error configurando entorno: {e}")
        return False
        
    # Paso 2: Probar conexiones
    print("\n2️⃣ Probando conexiones de API...")
    try:
        from test_secure_connection import SecureConnectionTester
        tester = SecureConnectionTester()
        results = tester.run_all_tests()
        
        # Verificar que al menos Claude funciona
        if not results.get("claude", False):
            print("❌ Claude API no está funcionando. Verificar clave de API.")
            return False
            
        print("✅ Conexiones verificadas")
    except Exception as e:
        print(f"❌ Error probando conexiones: {e}")
        return False
        
    # Paso 3: Iniciar aprendizaje
    print("\n3️⃣ Iniciando sistema de aprendizaje...")
    try:
        from lucia_threejs_learning_enhanced import LucIAThreeJSLearning
        learner = LucIAThreeJSLearning()
        
        print("\n🎓 ¡LucIA está lista para aprender Three.js!")
        print("=" * 50)
        print("📋 Plan de aprendizaje:")
        print("• Fase 1: Fundamentos básicos")
        print("• Fase 2: Modelado del avatar")
        print("• Fase 3: Animaciones avanzadas")
        print("• Fase 4: Efectos y optimización")
        print("=" * 50)
        
        # Preguntar si quiere comenzar automáticamente
        choice = input("\n¿Comenzar aprendizaje automático? (s/n): ").strip().lower()
        
        if choice in ['s', 'si', 'sí', 'y', 'yes']:
            print("\n🎯 Iniciando aprendizaje automático...")
            learner.start_learning_session()
        else:
            print("\n🤖 Iniciando modo interactivo...")
            learner.run_interactive_learning()
            
        return True
        
    except Exception as e:
        print(f"❌ Error iniciando aprendizaje: {e}")
        return False

def check_dependencies():
    """Verificar dependencias necesarias"""
    required_packages = [
        'requests',
        'python-dotenv',
        'pathlib'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
            
    if missing_packages:
        print("❌ Faltan dependencias:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\nInstalar con: pip install " + " ".join(missing_packages))
        return False
        
    return True

def show_help():
    """Mostrar ayuda"""
    print("""
🤖 LucIA Three.js Learning System - Ayuda

USO:
  python start_lucia_learning.py

DESCRIPCIÓN:
  Este script configura automáticamente el entorno de LucIA y
  inicia el sistema de aprendizaje de Three.js para crear el
  avatar 3D de LucIA.

REQUISITOS:
  - Python 3.7+
  - Clave de API de Claude (ANTHROPIC_API_KEY)
  - Conexión a internet

ARCHIVOS CREADOS:
  - .env (variables de entorno seguras)
  - lucia_learning/ (directorio de aprendizaje)
  - code_storage/ (código generado)
  - logs/ (registros del sistema)

SEGURIDAD:
  - Todas las claves de API están protegidas en .env
  - .env está incluido en .gitignore
  - No se suben datos sensibles a GitHub

PRÓXIMOS PASOS:
  1. Ejecutar este script
  2. Seguir el plan de aprendizaje
  3. Crear el avatar 3D de LucIA
  4. Integrar con el metaverso
""")

if __name__ == "__main__":
    # Verificar argumentos
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        show_help()
        sys.exit(0)
        
    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
        
    # Ejecutar configuración y aprendizaje
    success = main()
    
    if success:
        print("\n🎉 ¡LucIA está configurada y lista para aprender!")
        print("📚 El aprendizaje continuará en segundo plano...")
    else:
        print("\n❌ Error en la configuración. Revisar logs.")
        sys.exit(1) 