#!/usr/bin/env python3
"""
Start Intensive Learning - Script de Inicio Rápido para 8 Horas
Inicia el aprendizaje intensivo de Three.js usando las 3 APIs estratégicamente
"""

import os
import sys
import time
from pathlib import Path

def main():
    """Función principal de inicio intensivo"""
    print("🚀 Iniciando LucIA Intensive Learning - 8 Horas de Three.js")
    print("=" * 60)
    print("🎯 Estrategia de APIs:")
    print("• DeepSeek: Parafraseo y mejora de texto")
    print("• Gemini: Prompts descriptivos y ejemplos")
    print("• Claude: Consultas complejas y avanzadas")
    print("=" * 60)
    
    base_path = Path(__file__).parent
    
    # Paso 1: Verificar configuración
    print("\n1️⃣ Verificando configuración...")
    try:
        from configure_secure_environment import SecureEnvironmentConfigurator
        configurator = SecureEnvironmentConfigurator()
        configurator.configure_all()
        print("✅ Configuración verificada")
    except Exception as e:
        print(f"❌ Error en configuración: {e}")
        return False
        
    # Paso 2: Verificar APIs
    print("\n2️⃣ Verificando APIs...")
    try:
        from test_secure_connection import SecureConnectionTester
        tester = SecureConnectionTester()
        results = tester.run_all_tests()
        
        # Verificar que al menos Claude funciona
        if not results.get("claude", False):
            print("❌ Claude API no está funcionando. Es necesaria para el aprendizaje.")
            return False
            
        print("✅ APIs verificadas")
    except Exception as e:
        print(f"❌ Error verificando APIs: {e}")
        return False
        
    # Paso 3: Mostrar plan de aprendizaje
    print("\n3️⃣ Plan de Aprendizaje Intensivo:")
    print("=" * 40)
    print("⏰ Horas 1-2: Fundamentos básicos")
    print("  • Scene, Camera, Renderer setup")
    print("  • Basic geometries (Box, Sphere, Cylinder)")
    print("  • Coordinate system and transformations")
    print("  • Basic materials and colors")
    print()
    print("⏰ Horas 3-4: Geometrías avanzadas")
    print("  • Custom geometry creation")
    print("  • BufferGeometry and attributes")
    print("  • Complex shapes and meshes")
    print("  • Geometry optimization techniques")
    print()
    print("⏰ Horas 5-6: Materiales e iluminación")
    print("  • Advanced materials (Phong, Lambert, Standard)")
    print("  • Texture mapping and UV coordinates")
    print("  • Lighting systems (Point, Directional, Ambient)")
    print("  • Shadows and reflections")
    print()
    print("⏰ Horas 7-8: Creación del avatar")
    print("  • Character modeling basics")
    print("  • Human proportions and anatomy")
    print("  • Facial features and expressions")
    print("  • Clothing and accessories modeling")
    print("=" * 40)
    
    # Paso 4: Confirmar inicio
    print("\n⚠️  ADVERTENCIA: Este proceso durará 8 horas continuas.")
    print("📊 Se realizarán aproximadamente 48 consultas a las APIs.")
    print("💾 Todo el progreso se guardará automáticamente.")
    print("🛑 Puedes interrumpir en cualquier momento con Ctrl+C")
    
    confirm = input("\n¿Estás seguro de que quieres comenzar? (s/n): ").strip().lower()
    
    if confirm not in ['s', 'si', 'sí', 'y', 'yes']:
        print("❌ Aprendizaje cancelado")
        return False
        
    # Paso 5: Iniciar aprendizaje intensivo
    print("\n4️⃣ Iniciando aprendizaje intensivo...")
    try:
        from lucia_intensive_learning import LucIAIntensiveLearning
        learner = LucIAIntensiveLearning()
        
        print("🎓 ¡LucIA está lista para su aprendizaje intensivo!")
        print("🚀 Iniciando en 5 segundos...")
        
        for i in range(5, 0, -1):
            print(f"⏳ {i}...")
            time.sleep(1)
            
        print("🎯 ¡COMIENZA EL APRENDIZAJE INTENSIVO!")
        learner.start_intensive_learning()
        
        return True
        
    except KeyboardInterrupt:
        print("\n⏹️  Aprendizaje interrumpido por el usuario")
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
🤖 LucIA Intensive Learning System - Ayuda

USO:
  python start_intensive_learning.py

DESCRIPCIÓN:
  Este script inicia un aprendizaje intensivo de 8 horas
  donde LucIA aprenderá Three.js usando estratégicamente
  las 3 APIs disponibles.

ESTRATEGIA DE APIs:
  1. DeepSeek: Parafraseo y mejora de texto
  2. Gemini: Prompts descriptivos y ejemplos
  3. Claude: Consultas complejas y avanzadas

DURACIÓN:
  - 8 horas continuas
  - 48 consultas aproximadamente
  - Pausas automáticas entre sesiones

REQUISITOS:
  - Python 3.7+
  - Clave de API de Claude (obligatoria)
  - Clave de API de DeepSeek (recomendada)
  - Clave de API de Gemini (recomendada)
  - Conexión a internet estable

ARCHIVOS GENERADOS:
  - lucia_learning/intensive_sessions.json
  - code_storage/ (código generado)
  - logs/intensive_learning.log

SEGURIDAD:
  - Todas las claves están protegidas
  - No se suben datos a GitHub
  - Progreso guardado localmente

PRÓXIMOS PASOS:
  1. Configurar claves de API
  2. Ejecutar este script
  3. Monitorear progreso
  4. Revisar resultados
""")

if __name__ == "__main__":
    # Verificar argumentos
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        show_help()
        sys.exit(0)
        
    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
        
    # Ejecutar aprendizaje intensivo
    success = main()
    
    if success:
        print("\n🎉 ¡Aprendizaje intensivo completado!")
        print("📚 LucIA ha aprendido Three.js intensivamente")
        print("🎭 Está lista para crear su avatar 3D")
    else:
        print("\n❌ Error en el aprendizaje intensivo. Revisar logs.")
        sys.exit(1) 