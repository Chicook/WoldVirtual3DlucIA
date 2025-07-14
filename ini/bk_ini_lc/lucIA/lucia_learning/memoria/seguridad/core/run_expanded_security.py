#!/usr/bin/env python3
"""
run_expanded_security.py
Script principal para ejecutar el sistema de seguridad expandido de LucIA
Coordina todos los módulos de seguridad en múltiples lenguajes
"""

import os
import sys
import json
import time
import asyncio
import threading
from datetime import datetime
from pathlib import Path
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('expanded_security.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def print_banner():
    """Imprimir banner del sistema"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🔒 LUCIA EXPANDED SECURITY SYSTEM 🔒                     ║
║                                                              ║
║    Sistema de Seguridad Multi-Lenguaje                      ║
║    Capaz de Refactorizar Virus en Tiempo Real               ║
║                                                              ║
║    Lenguajes: Python, Mojo, Rust, Go, C++, Q#, Swift,       ║
║               Kotlin, Java                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(banner)

def check_language_availability():
    """Verificar disponibilidad de lenguajes de programación"""
    languages = {
        'Python': 'python',
        'Mojo': 'mojo',
        'Rust': 'rustc',
        'Go': 'go',
        'C++': 'g++',
        'Q#': 'dotnet',
        'Swift': 'swift',
        'Kotlin': 'kotlinc',
        'Java': 'java'
    }
    
    available_languages = {}
    
    print("🔍 Verificando disponibilidad de lenguajes...")
    
    for lang_name, command in languages.items():
        try:
            import subprocess
            result = subprocess.run([command, '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                available_languages[lang_name] = True
                print(f"✅ {lang_name}: Disponible")
            else:
                available_languages[lang_name] = False
                print(f"❌ {lang_name}: No disponible")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            available_languages[lang_name] = False
            print(f"❌ {lang_name}: No encontrado")
    
    return available_languages

def run_security_analysis(file_path: str, use_refactorization: bool = True):
    """Ejecutar análisis de seguridad completo"""
    try:
        print(f"\n🔍 Iniciando análisis de seguridad para: {file_path}")
        
        # Importar módulos dinámicamente
        try:
            from advanced_security_orchestrator import AdvancedSecurityOrchestrator
            from lucia_virus_refactorizer import LucIAVirusRefactorizer
        except ImportError as e:
            print(f"❌ Error importando módulos: {e}")
            return
        
        # Crear orquestador
        orchestrator = AdvancedSecurityOrchestrator()
        
        # Ejecutar análisis completo
        print("🔄 Ejecutando análisis multi-capa...")
        security_report = orchestrator.analyze_file_comprehensive(file_path)
        
        # Mostrar resultados
        print("\n📊 RESULTADOS DEL ANÁLISIS:")
        print(f"   Amenaza detectada: {'🚨 SÍ' if security_report.threat_detected else '✅ NO'}")
        print(f"   Confianza general: {security_report.overall_confidence:.2f}")
        print(f"   Capas activas: {security_report.active_layers}/{security_report.total_layers}")
        print(f"   Tiempo de ejecución: {security_report.execution_time:.2f}s")
        
        # Mostrar detalles por capa
        print("\n🛡️ DETALLES POR CAPA DE SEGURIDAD:")
        for layer in security_report.layers:
            status_icon = "✅" if layer.status == 'completed' else "❌"
            threat_icon = "🚨" if layer.threat_detected else "✅"
            print(f"   {status_icon} {layer.name} ({layer.language}): {threat_icon} {layer.confidence:.2f}")
        
        # Refactorización si se detecta amenaza
        if security_report.threat_detected and use_refactorization:
            print("\n🔄 Iniciando refactorización de malware...")
            
            refactorizer = LucIAVirusRefactorizer()
            refactorization_job = refactorizer.analyze_and_refactorize_virus(file_path)
            
            if refactorization_job.refactorization_status == "completed":
                print("🎉 ¡REFACTORIZACIÓN COMPLETADA!")
                print(f"   Puntuación de seguridad: {refactorization_job.original_threat_score:.2f} → {refactorization_job.final_safety_score:.2f}")
                
                # Mostrar insights de LucIA
                print("\n🧠 INSIGHTS DE LUCIA:")
                for insight in refactorization_job.learning_insights[:3]:
                    print(f"   • {insight}")
                
                # Mostrar notas de LucIA
                print("\n💭 NOTAS DE LUCIA:")
                for note in refactorization_job.lucia_notes[:3]:
                    print(f"   {note}")
                
                # Guardar código refactorizado
                if refactorization_job.refactored_code:
                    refactored_path = f"refactorized_{Path(file_path).stem}_safe.py"
                    with open(refactored_path, 'w', encoding='utf-8') as f:
                        f.write(refactorization_job.refactored_code)
                    print(f"\n💾 Código refactorizado guardado en: {refactored_path}")
            else:
                print(f"❌ Error en refactorización: {refactorization_job.refactorization_status}")
        
        # Mostrar recomendaciones
        print("\n📋 RECOMENDACIONES:")
        for rec in security_report.recommendations:
            print(f"   • {rec}")
        
        return security_report
        
    except Exception as e:
        print(f"❌ Error en análisis de seguridad: {e}")
        return None

def run_continuous_monitoring(monitored_paths: list, interval: int = 300):
    """Ejecutar monitoreo continuo"""
    print(f"\n👁️ Iniciando monitoreo continuo de: {monitored_paths}")
    print(f"   Intervalo de escaneo: {interval} segundos")
    
    try:
        from advanced_security_orchestrator import AdvancedSecurityOrchestrator
        orchestrator = AdvancedSecurityOrchestrator()
        
        while True:
            print(f"\n🔍 Escaneo iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            for path in monitored_paths:
                if os.path.exists(path):
                    if os.path.isfile(path):
                        # Analizar archivo individual
                        run_security_analysis(path, use_refactorization=True)
                    elif os.path.isdir(path):
                        # Escanear directorio
                        for root, dirs, files in os.walk(path):
                            for file in files:
                                if file.endswith(('.py', '.js', '.java', '.cpp', '.rs', '.go')):
                                    file_path = os.path.join(root, file)
                                    print(f"   Escaneando: {file_path}")
                                    run_security_analysis(file_path, use_refactorization=True)
            
            print(f"⏰ Esperando {interval} segundos para próximo escaneo...")
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n🛑 Monitoreo detenido por el usuario")
    except Exception as e:
        print(f"❌ Error en monitoreo continuo: {e}")

def run_benchmark_test():
    """Ejecutar prueba de rendimiento del sistema"""
    print("\n⚡ Ejecutando prueba de rendimiento...")
    
    # Crear archivo de prueba
    test_file = "security_test_file.py"
    test_code = """
# Archivo de prueba para benchmark de seguridad
import os
import subprocess
import base64

def test_function():
    # Simular código sospechoso
    eval("print('test')")
    os.system("echo test")
    base64.b64decode("dGVzdA==")
    
if __name__ == "__main__":
    test_function()
"""
    
    with open(test_file, 'w') as f:
        f.write(test_code)
    
    try:
        # Medir tiempo de análisis
        start_time = time.time()
        result = run_security_analysis(test_file, use_refactorization=True)
        end_time = time.time()
        
        print(f"⏱️ Tiempo de análisis: {end_time - start_time:.2f} segundos")
        
        if result:
            print(f"📊 Resultados del benchmark:")
            print(f"   - Amenaza detectada: {result.threat_detected}")
            print(f"   - Confianza: {result.overall_confidence:.2f}")
            print(f"   - Capas activas: {result.active_layers}")
        
        # Limpiar archivo de prueba
        os.remove(test_file)
        
    except Exception as e:
        print(f"❌ Error en benchmark: {e}")

def show_system_status():
    """Mostrar estado del sistema"""
    print("\n📊 ESTADO DEL SISTEMA:")
    
    # Verificar archivos de módulos
    modules = [
        'advanced_security_orchestrator.py',
        'lucia_virus_refactorizer.py',
        'virus_scanner.mojo',
        'network_analyzer.rs',
        'behavior_analyzer.go',
        'malware_analyzer.cpp',
        'quantum_security_analyzer.qs',
        'ai_threat_classifier.swift',
        'sandbox_environment.kotlin',
        'malware_refactorizer.java'
    ]
    
    print("📁 Módulos de seguridad:")
    for module in modules:
        if os.path.exists(module):
            print(f"   ✅ {module}")
        else:
            print(f"   ❌ {module}")
    
    # Verificar directorios
    directories = ['quarantine', 'sandbox', 'refactorized', 'lucia_work', 'lucia_learning']
    print("\n📂 Directorios del sistema:")
    for directory in directories:
        if os.path.exists(directory):
            print(f"   ✅ {directory}/")
        else:
            print(f"   ❌ {directory}/")

def main():
    """Función principal"""
    print_banner()
    
    # Verificar lenguajes disponibles
    available_languages = check_language_availability()
    
    # Mostrar menú principal
    while True:
        print("\n" + "="*60)
        print("🎛️ MENÚ PRINCIPAL - LUCIA EXPANDED SECURITY")
        print("="*60)
        print("1. 🔍 Analizar archivo individual")
        print("2. 👁️ Monitoreo continuo")
        print("3. ⚡ Prueba de rendimiento")
        print("4. 📊 Estado del sistema")
        print("5. 🧠 Estadísticas de aprendizaje")
        print("6. 🛠️ Configuración")
        print("0. 🚪 Salir")
        print("="*60)
        
        choice = input("\nSeleccione una opción: ").strip()
        
        if choice == "1":
            file_path = input("Ingrese la ruta del archivo a analizar: ").strip()
            if os.path.exists(file_path):
                run_security_analysis(file_path, use_refactorization=True)
            else:
                print("❌ Archivo no encontrado")
        
        elif choice == "2":
            paths_input = input("Ingrese rutas a monitorear (separadas por coma): ").strip()
            monitored_paths = [path.strip() for path in paths_input.split(",")]
            interval = int(input("Intervalo de escaneo en segundos (default 300): ") or "300")
            run_continuous_monitoring(monitored_paths, interval)
        
        elif choice == "3":
            run_benchmark_test()
        
        elif choice == "4":
            show_system_status()
        
        elif choice == "5":
            try:
                from lucia_virus_refactorizer import LucIAVirusRefactorizer
                refactorizer = LucIAVirusRefactorizer()
                stats = refactorizer.get_learning_statistics()
                print("\n🧠 ESTADÍSTICAS DE APRENDIZAJE:")
                print(json.dumps(stats, indent=2))
            except Exception as e:
                print(f"❌ Error obteniendo estadísticas: {e}")
        
        elif choice == "6":
            print("\n⚙️ CONFIGURACIÓN:")
            print("   - Lenguajes disponibles: " + ", ".join([lang for lang, available in available_languages.items() if available]))
            print("   - Directorio de trabajo: " + os.getcwd())
            print("   - Archivo de log: expanded_security.log")
        
        elif choice == "0":
            print("\n👋 ¡Gracias por usar LucIA Expanded Security System!")
            break
        
        else:
            print("❌ Opción no válida")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Sistema detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        logger.error(f"Error crítico en sistema: {e}") 