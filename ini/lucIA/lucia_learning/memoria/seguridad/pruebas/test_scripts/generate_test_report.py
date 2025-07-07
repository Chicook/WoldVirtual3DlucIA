#!/usr/bin/env python3
"""
Script para Generar Reportes de Pruebas de Seguridad
Genera reportes detallados de los resultados de las pruebas
"""

import sys
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Agregar el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent))

def main():
    """Función principal"""
    print("📄 GENERADOR DE REPORTES DE PRUEBAS - LUCIA")
    print("=" * 50)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        # Buscar archivos de resultados
        results_files = find_results_files()
        
        if not results_files:
            print("❌ No se encontraron archivos de resultados")
            print("💡 Ejecuta primero las pruebas con: python run_all_tests.py")
            return 1
            
        # Generar reportes
        print(f"📊 Generando reportes para {len(results_files)} archivos de resultados...")
        print()
        
        for results_file in results_files:
            print(f"📋 Procesando: {results_file}")
            generate_reports_from_file(results_file)
            print()
            
        print("✅ Reportes generados exitosamente")
        return 0
        
    except Exception as e:
        print(f"❌ Error generando reportes: {e}")
        return 1

def find_results_files() -> List[str]:
    """Busca archivos de resultados en el directorio"""
    test_dir = Path(__file__).parent.parent
    results_patterns = [
        "complete_test_results_*.json",
        "phase*_results_*.json",
        "lucia_learning_results_*.json"
    ]
    
    results_files = []
    for pattern in results_patterns:
        results_files.extend([str(f) for f in test_dir.glob(pattern)])
        
    # Ordenar por fecha de modificación (más reciente primero)
    results_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    return results_files

def generate_reports_from_file(results_file: str):
    """Genera reportes a partir de un archivo de resultados"""
    try:
        # Leer archivo de resultados
        with open(results_file, 'r', encoding='utf-8') as f:
            results = json.load(f)
            
        # Generar nombre base para reportes
        base_name = Path(results_file).stem
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Generar diferentes tipos de reportes
        generate_summary_report(results, f"{base_name}_summary_{timestamp}")
        generate_detailed_report(results, f"{base_name}_detailed_{timestamp}")
        generate_html_report(results, f"{base_name}_html_{timestamp}")
        generate_executive_report(results, f"{base_name}_executive_{timestamp}")
        
        print(f"   ✅ Reportes generados para {base_name}")
        
    except Exception as e:
        print(f"   ❌ Error procesando {results_file}: {e}")

def generate_summary_report(results: Dict[str, Any], base_name: str):
    """Genera reporte resumido"""
    try:
        summary = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'unknown',
            'phases_completed': 0,
            'total_components': 0,
            'successful_components': 0,
            'overall_success_rate': 0,
            'security_coverage': 0,
            'lucia_performance': 0,
            'execution_time': 0,
            'recommendations': []
        }
        
        # Extraer métricas finales
        final_metrics = results.get('final_metrics', {})
        summary.update({
            'phases_completed': final_metrics.get('phases_completed', 0),
            'total_components': final_metrics.get('total_components_tested', 0),
            'successful_components': final_metrics.get('total_components_passed', 0),
            'overall_success_rate': final_metrics.get('overall_success_rate', 0),
            'security_coverage': final_metrics.get('security_coverage', 0),
            'lucia_performance': final_metrics.get('lucia_learning_score', 0),
            'execution_time': final_metrics.get('total_execution_time', 0)
        })
        
        # Determinar estado general
        analysis = results.get('analysis', {})
        summary['overall_status'] = analysis.get('overall_status', 'unknown')
        summary['recommendations'] = analysis.get('recommendations', [])
        
        # Guardar reporte
        summary_file = f"{base_name}_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
            
    except Exception as e:
        print(f"   ❌ Error generando reporte resumido: {e}")

def generate_detailed_report(results: Dict[str, Any], base_name: str):
    """Genera reporte detallado"""
    try:
        detailed = {
            'timestamp': datetime.now().isoformat(),
            'test_results': results,
            'phase_analysis': {},
            'component_details': {},
            'performance_metrics': {},
            'security_analysis': {}
        }
        
        # Análisis por fases
        analysis = results.get('analysis', {})
        detailed['phase_analysis'] = analysis.get('phase_analysis', {})
        
        # Detalles por componente
        for phase_name, phase_results in results.items():
            if isinstance(phase_results, dict) and 'test_details' in phase_results:
                detailed['component_details'][phase_name] = phase_results['test_details']
                
        # Métricas de rendimiento
        final_metrics = results.get('final_metrics', {})
        detailed['performance_metrics'] = final_metrics
        
        # Análisis de seguridad
        detailed['security_analysis'] = {
            'coverage': final_metrics.get('security_coverage', 0),
            'lucia_performance': final_metrics.get('lucia_learning_score', 0),
            'overall_status': analysis.get('overall_status', 'unknown'),
            'recommendations': analysis.get('recommendations', [])
        }
        
        # Guardar reporte
        detailed_file = f"{base_name}_detailed.json"
        with open(detailed_file, 'w', encoding='utf-8') as f:
            json.dump(detailed, f, indent=2, ensure_ascii=False)
            
    except Exception as e:
        print(f"   ❌ Error generando reporte detallado: {e}")

def generate_html_report(results: Dict[str, Any], base_name: str):
    """Genera reporte HTML"""
    try:
        # Extraer datos para el reporte HTML
        final_metrics = results.get('final_metrics', {})
        analysis = results.get('analysis', {})
        
        html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Pruebas de Seguridad - LucIA</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
        }}
        .content {{
            padding: 30px;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .metric-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }}
        .metric-value {{
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }}
        .metric-label {{
            color: #666;
            margin-top: 5px;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        .section h2 {{
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }}
        .phase-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }}
        .phase-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }}
        .status-badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }}
        .status-excellent {{ background-color: #d4edda; color: #155724; }}
        .status-good {{ background-color: #d1ecf1; color: #0c5460; }}
        .status-acceptable {{ background-color: #fff3cd; color: #856404; }}
        .status-needs-improvement {{ background-color: #f8d7da; color: #721c24; }}
        .recommendations {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }}
        .recommendations h3 {{
            margin-top: 0;
            color: #856404;
        }}
        .recommendations ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .recommendations li {{
            margin-bottom: 5px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Reporte de Pruebas de Seguridad</h1>
            <p>🧠 LucIA - Cerebro Central de Seguridad</p>
            <p>Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Métricas Generales</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">{final_metrics.get('overall_success_rate', 0):.1f}%</div>
                        <div class="metric-label">Tasa de Éxito General</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{final_metrics.get('security_coverage', 0):.1f}%</div>
                        <div class="metric-label">Cobertura de Seguridad</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{final_metrics.get('lucia_learning_score', 0):.1f}/100</div>
                        <div class="metric-label">Rendimiento de LucIA</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{final_metrics.get('total_execution_time', 0):.0f}s</div>
                        <div class="metric-label">Tiempo de Ejecución</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🎯 Estado General</h2>
                <div class="phase-card">
                    <h3>Estado: 
                        <span class="status-badge status-{analysis.get('overall_status', 'unknown')}">
                            {analysis.get('overall_status', 'unknown').upper()}
                        </span>
                    </h3>
                    <p><strong>Fases completadas:</strong> {final_metrics.get('phases_completed', 0)}/3</p>
                    <p><strong>Componentes probados:</strong> {final_metrics.get('total_components_tested', 0)}</p>
                    <p><strong>Componentes exitosos:</strong> {final_metrics.get('total_components_passed', 0)}</p>
                </div>
            </div>
            
            <div class="section">
                <h2>🚨 Análisis por Fases</h2>
                <div class="phase-grid">
"""
        
        # Agregar análisis por fases
        for phase_name, phase_data in analysis.get('phase_analysis', {}).items():
            status_class = f"status-{phase_data.get('status', 'unknown')}"
            html_content += f"""
                    <div class="phase-card">
                        <h3>{phase_name.replace('_', ' ').title()}</h3>
                        <p><strong>Estado:</strong> 
                            <span class="status-badge {status_class}">
                                {phase_data.get('status', 'unknown').upper()}
                            </span>
                        </p>
                        <p><strong>Tasa de Éxito:</strong> {phase_data.get('success_rate', 0):.1f}%</p>
                        <p><strong>Componentes:</strong> {phase_data.get('components_passed', 0)}/{phase_data.get('components_tested', 0)}</p>
                    </div>
"""
        
        html_content += """
                </div>
            </div>
"""
        
        # Agregar recomendaciones si existen
        recommendations = analysis.get('recommendations', [])
        if recommendations:
            html_content += """
            <div class="section">
                <div class="recommendations">
                    <h3>💡 Recomendaciones</h3>
                    <ul>
"""
            for recommendation in recommendations:
                html_content += f"<li>{recommendation}</li>"
                
            html_content += """
                    </ul>
                </div>
            </div>
"""
        
        html_content += """
        </div>
    </div>
</body>
</html>
"""
        
        # Guardar reporte HTML
        html_file = f"{base_name}.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
    except Exception as e:
        print(f"   ❌ Error generando reporte HTML: {e}")

def generate_executive_report(results: Dict[str, Any], base_name: str):
    """Genera reporte ejecutivo"""
    try:
        # Extraer datos clave
        final_metrics = results.get('final_metrics', {})
        analysis = results.get('analysis', {})
        
        executive = {
            'executive_summary': {
                'timestamp': datetime.now().isoformat(),
                'overall_status': analysis.get('overall_status', 'unknown'),
                'key_metrics': {
                    'security_coverage': final_metrics.get('security_coverage', 0),
                    'lucia_performance': final_metrics.get('lucia_learning_score', 0),
                    'overall_success_rate': final_metrics.get('overall_success_rate', 0),
                    'execution_time': final_metrics.get('total_execution_time', 0)
                },
                'phases_summary': {},
                'critical_findings': [],
                'recommendations': analysis.get('recommendations', []),
                'next_steps': []
            }
        }
        
        # Resumen por fases
        for phase_name, phase_data in analysis.get('phase_analysis', {}).items():
            executive['executive_summary']['phases_summary'][phase_name] = {
                'status': phase_data.get('status', 'unknown'),
                'success_rate': phase_data.get('success_rate', 0),
                'components_passed': phase_data.get('components_passed', 0),
                'components_tested': phase_data.get('components_tested', 0)
            }
            
        # Hallazgos críticos
        if analysis.get('overall_status') != 'excellent':
            executive['executive_summary']['critical_findings'].append(
                f"Estado general: {analysis.get('overall_status', 'unknown')}"
            )
            
        for phase_name, phase_data in analysis.get('phase_analysis', {}).items():
            if phase_data.get('status') != 'passed':
                executive['executive_summary']['critical_findings'].append(
                    f"Fase {phase_name}: {phase_data.get('status', 'unknown')}"
                )
                
        # Próximos pasos
        if analysis.get('overall_status') == 'excellent':
            executive['executive_summary']['next_steps'].append(
                "Mantener el nivel de excelencia actual"
            )
            executive['executive_summary']['next_steps'].append(
                "Implementar monitoreo continuo"
            )
        else:
            executive['executive_summary']['next_steps'].append(
                "Revisar y corregir componentes que fallaron"
            )
            executive['executive_summary']['next_steps'].append(
                "Re-ejecutar pruebas después de las correcciones"
            )
            
        # Guardar reporte ejecutivo
        executive_file = f"{base_name}_executive.json"
        with open(executive_file, 'w', encoding='utf-8') as f:
            json.dump(executive, f, indent=2, ensure_ascii=False)
            
    except Exception as e:
        print(f"   ❌ Error generando reporte ejecutivo: {e}")

if __name__ == "__main__":
    exit_code = main()
    print(f"\n📅 Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sys.exit(exit_code) 