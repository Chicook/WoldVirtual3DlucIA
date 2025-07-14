#!/usr/bin/env python3
"""
Script para Ejecutar Pruebas por Fases Específicas
Permite ejecutar pruebas de seguridad por fases individuales
"""

import sys
import argparse
import json
import time
from pathlib import Path
from datetime import datetime

# Agregar el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent))

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Ejecutar pruebas de seguridad por fases')
    parser.add_argument('--phase', type=int, choices=[1, 2, 3], 
                       help='Fase a ejecutar: 1 (Crítico), 2 (Alto), 3 (Medio)')
    parser.add_argument('--learning', action='store_true',
                       help='Ejecutar pruebas de aprendizaje de LucIA')
    parser.add_argument('--all', action='store_true',
                       help='Ejecutar todas las fases')
    
    args = parser.parse_args()
    
    print("🧪 SISTEMA DE PRUEBAS POR FASES - LUCIA")
    print("=" * 50)
    print(f"📅 Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        if args.all:
            # Ejecutar todas las fases
            print("🚀 Ejecutando todas las fases...")
            return run_all_phases()
        elif args.learning:
            # Ejecutar solo pruebas de aprendizaje
            print("🧠 Ejecutando pruebas de aprendizaje de LucIA...")
            return run_learning_tests()
        elif args.phase:
            # Ejecutar fase específica
            print(f"🎯 Ejecutando Fase {args.phase}...")
            return run_specific_phase(args.phase)
        else:
            print("❌ Debes especificar una opción:")
            print("   --phase 1,2,3 : Ejecutar fase específica")
            print("   --learning    : Ejecutar pruebas de aprendizaje")
            print("   --all         : Ejecutar todas las fases")
            return 1
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

def run_specific_phase(phase_number: int) -> int:
    """Ejecuta una fase específica"""
    try:
        if phase_number == 1:
            from test_scenarios.fase1_critical_tests import Phase1CriticalTester
            tester = Phase1CriticalTester()
            results = tester.run_all_critical_tests()
            phase_name = "Fase 1 - Aspectos Críticos"
        elif phase_number == 2:
            from test_scenarios.fase2_high_tests import Phase2HighTester
            tester = Phase2HighTester()
            results = tester.run_all_high_tests()
            phase_name = "Fase 2 - Aspectos Altos"
        elif phase_number == 3:
            from test_scenarios.fase3_medium_tests import Phase3MediumTester
            tester = Phase3MediumTester()
            results = tester.run_all_medium_tests()
            phase_name = "Fase 3 - Aspectos Medios"
        else:
            print(f"❌ Fase {phase_number} no válida")
            return 1
            
        # Mostrar resultados
        print(f"\n📊 Resultados de {phase_name}:")
        print("-" * 40)
        print(f"Estado: {results.get('status', 'unknown')}")
        print(f"Componentes probados: {results.get('components_tested', 0)}")
        print(f"Componentes exitosos: {results.get('components_passed', 0)}")
        print(f"Tasa de éxito: {results.get('success_rate', 0):.1f}%")
        
        # Mostrar detalles por componente
        print(f"\n📋 Detalles por componente:")
        for component, result in results.get('test_details', {}).items():
            status_icon = "✅" if result.get('status') == 'passed' else "❌"
            print(f"{status_icon} {component}: {result.get('success_rate', 0):.1f}%")
            
        # Guardar resultados
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        results_file = f"phase{phase_number}_results_{timestamp}.json"
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
            
        print(f"\n💾 Resultados guardados en: {results_file}")
        
        # Determinar resultado
        if results.get('status') == 'completed' and results.get('success_rate', 0) >= 90:
            print(f"\n✅ {phase_name} completada exitosamente")
            return 0
        else:
            print(f"\n⚠️ {phase_name} necesita mejoras")
            return 1
            
    except ImportError as e:
        print(f"❌ Error importando módulos: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error ejecutando fase {phase_number}: {e}")
        return 1

def run_learning_tests() -> int:
    """Ejecuta pruebas de aprendizaje de LucIA"""
    try:
        from test_scenarios.lucia_learning_tests import LucIALearningTester
        tester = LucIALearningTester()
        results = tester.run_all_learning_tests()
        
        # Mostrar resultados
        print(f"\n📊 Resultados de Pruebas de Aprendizaje:")
        print("-" * 40)
        print(f"Estado: {results.get('status', 'unknown')}")
        print(f"Componentes probados: {results.get('components_tested', 0)}")
        print(f"Componentes exitosos: {results.get('components_passed', 0)}")
        print(f"Tasa de éxito: {results.get('success_rate', 0):.1f}%")
        print(f"Puntuación promedio: {results.get('average_score', 0):.1f}/100")
        
        # Mostrar detalles por componente
        print(f"\n📋 Detalles por componente:")
        for component, result in results.get('test_details', {}).items():
            status_icon = "✅" if result.get('status') == 'passed' else "❌"
            print(f"{status_icon} {component}: {result.get('success_rate', 0):.1f}%")
            
        # Guardar resultados
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        results_file = f"lucia_learning_results_{timestamp}.json"
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
            
        print(f"\n💾 Resultados guardados en: {results_file}")
        
        # Determinar resultado
        if results.get('status') == 'completed' and results.get('success_rate', 0) >= 100:
            print(f"\n✅ Pruebas de aprendizaje completadas exitosamente")
            return 0
        else:
            print(f"\n⚠️ Pruebas de aprendizaje necesitan mejoras")
            return 1
            
    except ImportError as e:
        print(f"❌ Error importando módulos: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error ejecutando pruebas de aprendizaje: {e}")
        return 1

def run_all_phases() -> int:
    """Ejecuta todas las fases secuencialmente"""
    try:
        print("🚀 Ejecutando todas las fases secuencialmente...")
        print()
        
        phase_results = {}
        total_phases = 3
        successful_phases = 0
        
        # Ejecutar cada fase
        for phase in range(1, total_phases + 1):
            print(f"🎯 Ejecutando Fase {phase}...")
            result = run_specific_phase(phase)
            phase_results[f"phase_{phase}"] = result
            if result == 0:
                successful_phases += 1
            print()
            
        # Ejecutar pruebas de aprendizaje
        print("🧠 Ejecutando pruebas de aprendizaje...")
        learning_result = run_learning_tests()
        phase_results["learning"] = learning_result
        if learning_result == 0:
            successful_phases += 1
        print()
        
        # Resumen final
        print("📊 RESUMEN FINAL:")
        print("=" * 30)
        print(f"Fases completadas: {successful_phases}/{total_phases + 1}")
        
        for phase_name, result in phase_results.items():
            status = "✅ Exitoso" if result == 0 else "❌ Falló"
            print(f"{phase_name}: {status}")
            
        # Determinar resultado general
        if successful_phases == total_phases + 1:
            print(f"\n🎉 ¡Todas las fases completadas exitosamente!")
            return 0
        else:
            print(f"\n⚠️ Algunas fases necesitan mejoras")
            return 1
            
    except Exception as e:
        print(f"❌ Error ejecutando todas las fases: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    print(f"\n📅 Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sys.exit(exit_code) 