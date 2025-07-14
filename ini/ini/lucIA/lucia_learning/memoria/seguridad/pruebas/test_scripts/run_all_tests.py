#!/usr/bin/env python3
"""
Script Principal para Ejecutar Todas las Pruebas de Seguridad
Coordina la ejecución completa del sistema de pruebas para LucIA
"""

import sys
import os
import time
import json
from pathlib import Path
from datetime import datetime

# Agregar el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent))

def main():
    """Función principal"""
    print("🧪 SISTEMA DE PRUEBAS DE SEGURIDAD - LUCIA")
    print("=" * 60)
    print(f"📅 Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        # Importar el gestor de pruebas
        from lucia_test_manager import LucIATestManager
        
        # Crear instancia del gestor
        test_manager = LucIATestManager()
        
        # Ejecutar suite completa de pruebas
        print("🚀 Iniciando ejecución de todas las pruebas...")
        print()
        
        results = test_manager.run_complete_test_suite()
        
        if results.get('status') != 'failed':
            # Mostrar resumen detallado
            print("\n" + "=" * 60)
            print("📊 RESUMEN COMPLETO DE PRUEBAS")
            print("=" * 60)
            
            final_metrics = results.get('final_metrics', {})
            
            # Métricas generales
            print(f"⏱️  Tiempo total de ejecución: {final_metrics.get('total_execution_time', 0):.2f} segundos")
            print(f"📈 Fases completadas: {final_metrics.get('phases_completed', 0)}/3")
            print(f"🔧 Componentes probados: {final_metrics.get('total_components_tested', 0)}")
            print(f"✅ Componentes exitosos: {final_metrics.get('total_components_passed', 0)}")
            print(f"📊 Tasa de éxito general: {final_metrics.get('overall_success_rate', 0):.1f}%")
            print(f"🛡️  Cobertura de seguridad: {final_metrics.get('security_coverage', 0):.1f}%")
            print(f"🧠 Puntuación de LucIA: {final_metrics.get('lucia_learning_score', 0):.1f}/100")
            
            # Análisis por fases
            analysis = results.get('analysis', {})
            print(f"\n🎯 Estado general: {analysis.get('overall_status', 'unknown').upper()}")
            
            print("\n📋 ANÁLISIS POR FASES:")
            print("-" * 40)
            
            for phase_name, phase_data in analysis.get('phase_analysis', {}).items():
                status_icon = "✅" if phase_data.get('status') == 'passed' else "❌"
                print(f"{status_icon} {phase_name.replace('_', ' ').title()}")
                print(f"   • Estado: {phase_data.get('status', 'unknown')}")
                print(f"   • Tasa de éxito: {phase_data.get('success_rate', 0):.1f}%")
                print(f"   • Componentes: {phase_data.get('components_passed', 0)}/{phase_data.get('components_tested', 0)}")
                print()
            
            # Recomendaciones
            recommendations = analysis.get('recommendations', [])
            if recommendations:
                print("💡 RECOMENDACIONES:")
                print("-" * 20)
                for i, recommendation in enumerate(recommendations, 1):
                    print(f"{i}. {recommendation}")
                print()
            
            # Reportes generados
            reports = results.get('reports', {})
            if reports:
                print("📄 REPORTES GENERADOS:")
                print("-" * 25)
                print(f"• JSON: {reports.get('json_report', 'N/A')}")
                print(f"• HTML: {reports.get('html_report', 'N/A')}")
                print(f"• Texto: {reports.get('text_report', 'N/A')}")
                print()
            
            # Guardar resultados
            save_message = test_manager.save_test_results()
            print(f"💾 {save_message}")
            
            # Determinar resultado final
            overall_status = analysis.get('overall_status', 'unknown')
            if overall_status == 'excellent':
                print("\n🎉 ¡EXCELENTE! Todas las pruebas pasaron exitosamente.")
                print("🛡️ La plataforma está completamente protegida.")
                print("🧠 LucIA ha aprendido completamente sobre seguridad.")
                return 0
            elif overall_status == 'good':
                print("\n👍 ¡BUENO! La mayoría de las pruebas pasaron.")
                print("⚠️ Algunas mejoras menores son recomendadas.")
                return 0
            elif overall_status == 'acceptable':
                print("\n⚠️ ACEPTABLE. Algunas pruebas fallaron.")
                print("🔧 Se requieren mejoras significativas.")
                return 1
            else:
                print("\n❌ NECESITA MEJORAS. Muchas pruebas fallaron.")
                print("🚨 Se requieren correcciones urgentes.")
                return 1
                
        else:
            print(f"\n❌ Error en la ejecución de pruebas:")
            print(f"   {results.get('error', 'Error desconocido')}")
            return 1
            
    except ImportError as e:
        print(f"❌ Error importando módulos: {e}")
        print("💡 Asegúrate de estar en el directorio correcto.")
        return 1
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return 1

def show_help():
    """Muestra ayuda del script"""
    print("🧪 SISTEMA DE PRUEBAS DE SEGURIDAD - LUCIA")
    print("=" * 50)
    print()
    print("USO:")
    print("  python run_all_tests.py")
    print()
    print("DESCRIPCIÓN:")
    print("  Ejecuta todas las pruebas de seguridad para LucIA:")
    print("  • Fase 1: Aspectos Críticos (WAF, IDS/IPS, VPN, etc.)")
    print("  • Fase 2: Aspectos Altos (API Security, SIEM, etc.)")
    print("  • Fase 3: Aspectos Medios (DLP, Threat Hunting, etc.)")
    print("  • LucIA Learning: Pruebas de aprendizaje")
    print()
    print("RESULTADOS:")
    print("  • Reportes en formato JSON, HTML y texto")
    print("  • Métricas detalladas de seguridad")
    print("  • Recomendaciones de mejora")
    print()
    print("CÓDIGOS DE SALIDA:")
    print("  0: Éxito (excellent/good)")
    print("  1: Fallo (acceptable/needs_improvement)")
    print()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        show_help()
    else:
        exit_code = main()
        print(f"\n📅 Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        sys.exit(exit_code) 