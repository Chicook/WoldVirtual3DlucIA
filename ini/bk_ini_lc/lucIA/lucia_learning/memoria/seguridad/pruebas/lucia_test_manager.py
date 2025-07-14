#!/usr/bin/env python3
"""
LucIA Test Manager - Gestor Principal de Pruebas de Seguridad
Coordina todas las pruebas de seguridad para LucIA
"""

import sys
import logging
import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import subprocess

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lucia_test_manager.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class LucIATestManager:
    """Gestor principal de pruebas de seguridad para LucIA"""
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.results_dir = self.test_dir / 'test_results'
        self.reports_dir = self.results_dir / 'test_reports'
        self.metrics_dir = self.results_dir / 'security_metrics'
        self.performance_dir = self.results_dir / 'lucia_performance'
        
        # Crear directorios si no existen
        self._create_directories()
        
        self.test_results = {}
        self.test_metrics = {}
        self.start_time = None
        
    def _create_directories(self):
        """Crea directorios necesarios para las pruebas"""
        directories = [
            self.results_dir,
            self.reports_dir,
            self.metrics_dir,
            self.performance_dir
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def run_complete_test_suite(self) -> Dict[str, Any]:
        """Ejecuta suite completa de pruebas de seguridad"""
        logger.info("🧪 Iniciando suite completa de pruebas de seguridad para LucIA")
        
        self.start_time = time.time()
        
        try:
            # 1. Preparación del entorno
            logger.info("🔧 Preparando entorno de pruebas...")
            preparation_result = self._prepare_test_environment()
            
            # 2. Pruebas de Fase 1 - Crítico
            logger.info("🚨 Ejecutando pruebas de Fase 1 - Aspectos Críticos...")
            phase1_results = self._run_phase1_tests()
            
            # 3. Pruebas de Fase 2 - Alto
            logger.info("🔒 Ejecutando pruebas de Fase 2 - Aspectos Altos...")
            phase2_results = self._run_phase2_tests()
            
            # 4. Pruebas de Fase 3 - Medio
            logger.info("🛡️ Ejecutando pruebas de Fase 3 - Aspectos Medios...")
            phase3_results = self._run_phase3_tests()
            
            # 5. Pruebas de LucIA Learning
            logger.info("🧠 Ejecutando pruebas de aprendizaje de LucIA...")
            lucia_learning_results = self._run_lucia_learning_tests()
            
            # 6. Análisis de resultados
            logger.info("📊 Analizando resultados de pruebas...")
            analysis_results = self._analyze_test_results(
                phase1_results, phase2_results, phase3_results, lucia_learning_results
            )
            
            # 7. Generación de reportes
            logger.info("📝 Generando reportes finales...")
            report_results = self._generate_final_reports(analysis_results)
            
            # 8. Cálculo de métricas finales
            execution_time = time.time() - self.start_time
            final_metrics = self._calculate_final_metrics(
                phase1_results, phase2_results, phase3_results, 
                lucia_learning_results, execution_time
            )
            
            # Compilar resultados completos
            self.test_results = {
                'timestamp': datetime.now().isoformat(),
                'preparation': preparation_result,
                'phase1_critical': phase1_results,
                'phase2_high': phase2_results,
                'phase3_medium': phase3_results,
                'lucia_learning': lucia_learning_results,
                'analysis': analysis_results,
                'reports': report_results,
                'final_metrics': final_metrics,
                'execution_time': execution_time
            }
            
            logger.info("✅ Suite completa de pruebas finalizada exitosamente")
            return self.test_results
            
        except Exception as e:
            logger.error(f"❌ Error en suite completa de pruebas: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'execution_time': time.time() - self.start_time if self.start_time else 0
            }
            
    def _prepare_test_environment(self) -> Dict[str, Any]:
        """Prepara el entorno de pruebas"""
        try:
            # Verificar que estamos en la carpeta correcta
            current_dir = Path.cwd()
            if 'pruebas' not in str(current_dir):
                logger.warning("⚠️ No estamos en la carpeta de pruebas")
                
            # Verificar archivos de prueba necesarios
            required_files = [
                'test_scenarios/fase1_critical_tests.py',
                'test_scenarios/fase2_high_tests.py',
                'test_scenarios/fase3_medium_tests.py',
                'test_scenarios/lucia_learning_tests.py',
                'test_data/malicious_payloads.json',
                'test_data/security_configs.json',
                'test_data/expected_results.json'
            ]
            
            missing_files = []
            for file_path in required_files:
                if not (self.test_dir / file_path).exists():
                    missing_files.append(file_path)
                    
            if missing_files:
                logger.warning(f"Archivos faltantes: {missing_files}")
                
            # Limpiar resultados anteriores
            self._clean_previous_results()
            
            return {
                'status': 'prepared',
                'current_directory': str(current_dir),
                'missing_files': missing_files,
                'environment_ready': len(missing_files) == 0
            }
            
        except Exception as e:
            logger.error(f"Error preparando entorno: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _run_phase1_tests(self) -> Dict[str, Any]:
        """Ejecuta pruebas de Fase 1 - Aspectos Críticos"""
        try:
            # Importar y ejecutar pruebas de Fase 1
            sys.path.append(str(self.test_dir / 'test_scenarios'))
            
            from fase1_critical_tests import Phase1CriticalTester
            tester = Phase1CriticalTester()
            results = tester.run_all_critical_tests()
            
            # Guardar resultados
            results_file = self.metrics_dir / 'phase1_results.json'
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
                
            return results
            
        except Exception as e:
            logger.error(f"Error en pruebas de Fase 1: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _run_phase2_tests(self) -> Dict[str, Any]:
        """Ejecuta pruebas de Fase 2 - Aspectos Altos"""
        try:
            # Importar y ejecutar pruebas de Fase 2
            sys.path.append(str(self.test_dir / 'test_scenarios'))
            
            from fase2_high_tests import Phase2HighTester
            tester = Phase2HighTester()
            results = tester.run_all_high_tests()
            
            # Guardar resultados
            results_file = self.metrics_dir / 'phase2_results.json'
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
                
            return results
            
        except Exception as e:
            logger.error(f"Error en pruebas de Fase 2: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _run_phase3_tests(self) -> Dict[str, Any]:
        """Ejecuta pruebas de Fase 3 - Aspectos Medios"""
        try:
            # Importar y ejecutar pruebas de Fase 3
            sys.path.append(str(self.test_dir / 'test_scenarios'))
            
            from fase3_medium_tests import Phase3MediumTester
            tester = Phase3MediumTester()
            results = tester.run_all_medium_tests()
            
            # Guardar resultados
            results_file = self.metrics_dir / 'phase3_results.json'
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
                
            return results
            
        except Exception as e:
            logger.error(f"Error en pruebas de Fase 3: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _run_lucia_learning_tests(self) -> Dict[str, Any]:
        """Ejecuta pruebas de aprendizaje de LucIA"""
        try:
            # Importar y ejecutar pruebas de LucIA Learning
            sys.path.append(str(self.test_dir / 'test_scenarios'))
            
            from lucia_learning_tests import LucIALearningTester
            tester = LucIALearningTester()
            results = tester.run_all_learning_tests()
            
            # Guardar resultados
            results_file = self.performance_dir / 'lucia_learning_results.json'
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
                
            return results
            
        except Exception as e:
            logger.error(f"Error en pruebas de LucIA Learning: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _analyze_test_results(self, phase1_results: Dict, phase2_results: Dict, 
                            phase3_results: Dict, lucia_results: Dict) -> Dict[str, Any]:
        """Analiza todos los resultados de pruebas"""
        try:
            analysis = {
                'overall_status': 'pending',
                'phase_analysis': {},
                'security_coverage': 0,
                'lucia_performance': 0,
                'recommendations': []
            }
            
            # Análisis por fase
            phases = [
                ('phase1_critical', phase1_results, 100),  # 100% requerido
                ('phase2_high', phase2_results, 95),       # 95% requerido
                ('phase3_medium', phase3_results, 90)      # 90% requerido
            ]
            
            total_coverage = 0
            phase_count = 0
            
            for phase_name, phase_results, required_percentage in phases:
                if phase_results.get('status') == 'completed':
                    success_rate = phase_results.get('success_rate', 0)
                    total_coverage += success_rate
                    phase_count += 1
                    
                    analysis['phase_analysis'][phase_name] = {
                        'status': 'passed' if success_rate >= required_percentage else 'failed',
                        'success_rate': success_rate,
                        'required_rate': required_percentage,
                        'components_tested': phase_results.get('components_tested', 0),
                        'components_passed': phase_results.get('components_passed', 0)
                    }
                    
                    if success_rate < required_percentage:
                        analysis['recommendations'].append(
                            f"Mejorar {phase_name}: {success_rate}% < {required_percentage}% requerido"
                        )
                else:
                    analysis['phase_analysis'][phase_name] = {
                        'status': 'failed',
                        'error': phase_results.get('error', 'Unknown error')
                    }
                    analysis['recommendations'].append(f"Corregir errores en {phase_name}")
                    
            # Calcular cobertura total de seguridad
            if phase_count > 0:
                analysis['security_coverage'] = total_coverage / phase_count
                
            # Análisis de LucIA
            if lucia_results.get('status') == 'completed':
                lucia_score = lucia_results.get('average_score', 0)
                analysis['lucia_performance'] = lucia_score
                
                if lucia_score < 90:
                    analysis['recommendations'].append(
                        f"Mejorar rendimiento de LucIA: {lucia_score}/100 < 90 requerido"
                    )
            else:
                analysis['recommendations'].append("Corregir errores en aprendizaje de LucIA")
                
            # Determinar estado general
            if (analysis['security_coverage'] >= 95 and 
                analysis['lucia_performance'] >= 90 and
                len(analysis['recommendations']) == 0):
                analysis['overall_status'] = 'excellent'
            elif (analysis['security_coverage'] >= 85 and 
                  analysis['lucia_performance'] >= 80):
                analysis['overall_status'] = 'good'
            elif (analysis['security_coverage'] >= 70 and 
                  analysis['lucia_performance'] >= 70):
                analysis['overall_status'] = 'acceptable'
            else:
                analysis['overall_status'] = 'needs_improvement'
                
            return analysis
            
        except Exception as e:
            logger.error(f"Error analizando resultados: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _generate_final_reports(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Genera reportes finales de las pruebas"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Reporte JSON
            json_report_file = self.reports_dir / f'security_test_report_{timestamp}.json'
            with open(json_report_file, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, indent=2, ensure_ascii=False)
                
            # Reporte HTML
            html_report_file = self.reports_dir / f'security_test_report_{timestamp}.html'
            html_content = self._generate_html_report(analysis_results)
            with open(html_report_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
            # Reporte de texto
            text_report_file = self.reports_dir / f'security_test_report_{timestamp}.txt'
            text_content = self._generate_text_report(analysis_results)
            with open(text_report_file, 'w', encoding='utf-8') as f:
                f.write(text_content)
                
            return {
                'json_report': str(json_report_file),
                'html_report': str(html_report_file),
                'text_report': str(text_report_file),
                'timestamp': timestamp
            }
            
        except Exception as e:
            logger.error(f"Error generando reportes: {e}")
            return {'status': 'failed', 'error': str(e)}
            
    def _generate_html_report(self, analysis_results: Dict[str, Any]) -> str:
        """Genera reporte HTML"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Pruebas de Seguridad - LucIA</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background-color: #2c3e50; color: white; padding: 20px; text-align: center; }}
        .section {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; }}
        .success {{ background-color: #d4edda; border-color: #c3e6cb; }}
        .warning {{ background-color: #fff3cd; border-color: #ffeaa7; }}
        .error {{ background-color: #f8d7da; border-color: #f5c6cb; }}
        .metric {{ display: inline-block; margin: 10px; padding: 10px; background-color: #f8f9fa; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ Reporte de Pruebas de Seguridad</h1>
        <h2>🧠 LucIA - Cerebro Central de Seguridad</h2>
        <p>Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="section {'success' if analysis_results.get('overall_status') == 'excellent' else 'warning' if analysis_results.get('overall_status') == 'good' else 'error'}">
        <h3>📊 Estado General: {analysis_results.get('overall_status', 'unknown').upper()}</h3>
        <div class="metric">
            <strong>Cobertura de Seguridad:</strong> {analysis_results.get('security_coverage', 0):.1f}%
        </div>
        <div class="metric">
            <strong>Rendimiento de LucIA:</strong> {analysis_results.get('lucia_performance', 0):.1f}/100
        </div>
    </div>
    
    <div class="section">
        <h3>🚨 Análisis por Fases</h3>
"""
        
        for phase_name, phase_data in analysis_results.get('phase_analysis', {}).items():
            status_class = 'success' if phase_data.get('status') == 'passed' else 'error'
            html += f"""
        <div class="{status_class}">
            <h4>{phase_name.replace('_', ' ').title()}</h4>
            <p><strong>Estado:</strong> {phase_data.get('status', 'unknown')}</p>
            <p><strong>Tasa de Éxito:</strong> {phase_data.get('success_rate', 0):.1f}%</p>
            <p><strong>Componentes Probados:</strong> {phase_data.get('components_tested', 0)}</p>
            <p><strong>Componentes Exitosos:</strong> {phase_data.get('components_passed', 0)}</p>
        </div>
"""
        
        html += """
    </div>
    
    <div class="section">
        <h3>💡 Recomendaciones</h3>
        <ul>
"""
        
        for recommendation in analysis_results.get('recommendations', []):
            html += f"<li>{recommendation}</li>"
            
        html += """
        </ul>
    </div>
</body>
</html>
"""
        return html
        
    def _generate_text_report(self, analysis_results: Dict[str, Any]) -> str:
        """Genera reporte de texto"""
        report = "🛡️ REPORTE DE PRUEBAS DE SEGURIDAD - LUCIA\n"
        report += "=" * 60 + "\n\n"
        
        report += f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        report += f"🎯 Estado General: {analysis_results.get('overall_status', 'unknown').upper()}\n"
        report += f"📊 Cobertura de Seguridad: {analysis_results.get('security_coverage', 0):.1f}%\n"
        report += f"🧠 Rendimiento de LucIA: {analysis_results.get('lucia_performance', 0):.1f}/100\n\n"
        
        report += "🚨 ANÁLISIS POR FASES:\n"
        report += "-" * 30 + "\n"
        
        for phase_name, phase_data in analysis_results.get('phase_analysis', {}).items():
            status_icon = "✅" if phase_data.get('status') == 'passed' else "❌"
            report += f"{status_icon} {phase_name.replace('_', ' ').title()}\n"
            report += f"   Estado: {phase_data.get('status', 'unknown')}\n"
            report += f"   Tasa de Éxito: {phase_data.get('success_rate', 0):.1f}%\n"
            report += f"   Componentes: {phase_data.get('components_passed', 0)}/{phase_data.get('components_tested', 0)}\n\n"
            
        report += "💡 RECOMENDACIONES:\n"
        report += "-" * 20 + "\n"
        
        for recommendation in analysis_results.get('recommendations', []):
            report += f"• {recommendation}\n"
            
        return report
        
    def _calculate_final_metrics(self, phase1_results: Dict, phase2_results: Dict,
                               phase3_results: Dict, lucia_results: Dict, 
                               execution_time: float) -> Dict[str, Any]:
        """Calcula métricas finales de las pruebas"""
        try:
            metrics = {
                'total_execution_time': execution_time,
                'phases_completed': 0,
                'total_components_tested': 0,
                'total_components_passed': 0,
                'overall_success_rate': 0,
                'lucia_learning_score': 0,
                'security_coverage': 0
            }
            
            # Contar fases completadas
            phases = [phase1_results, phase2_results, phase3_results]
            for phase in phases:
                if phase.get('status') == 'completed':
                    metrics['phases_completed'] += 1
                    metrics['total_components_tested'] += phase.get('components_tested', 0)
                    metrics['total_components_passed'] += phase.get('components_passed', 0)
                    
            # Calcular tasa de éxito general
            if metrics['total_components_tested'] > 0:
                metrics['overall_success_rate'] = (
                    metrics['total_components_passed'] / metrics['total_components_tested'] * 100
                )
                
            # Métricas de LucIA
            if lucia_results.get('status') == 'completed':
                metrics['lucia_learning_score'] = lucia_results.get('average_score', 0)
                
            # Cobertura de seguridad
            security_scores = []
            for phase in phases:
                if phase.get('status') == 'completed':
                    security_scores.append(phase.get('success_rate', 0))
                    
            if security_scores:
                metrics['security_coverage'] = sum(security_scores) / len(security_scores)
                
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculando métricas finales: {e}")
            return {'error': str(e)}
            
    def _clean_previous_results(self):
        """Limpia resultados de pruebas anteriores"""
        try:
            # Limpiar archivos de resultados antiguos (mantener solo los últimos 5)
            for directory in [self.reports_dir, self.metrics_dir, self.performance_dir]:
                files = list(directory.glob('*'))
                files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
                
                # Mantener solo los últimos 5 archivos
                for file in files[5:]:
                    file.unlink()
                    
        except Exception as e:
            logger.warning(f"Error limpiando resultados anteriores: {e}")
            
    def save_test_results(self, output_file: str = None) -> str:
        """Guarda resultados completos de las pruebas"""
        if not output_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f'complete_test_results_{timestamp}.json'
            
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, indent=2, ensure_ascii=False)
                
            return f"Resultados guardados en: {output_file}"
            
        except Exception as e:
            logger.error(f"Error guardando resultados: {e}")
            return f"Error guardando resultados: {e}"

def main():
    """Función principal"""
    print("🧪 LucIA Test Manager - Gestor de Pruebas de Seguridad")
    print("=" * 60)
    
    test_manager = LucIATestManager()
    
    # Ejecutar suite completa de pruebas
    results = test_manager.run_complete_test_suite()
    
    if results.get('status') != 'failed':
        # Mostrar resumen
        final_metrics = results.get('final_metrics', {})
        print(f"\n📊 Resumen de Pruebas:")
        print(f"   • Tiempo total: {final_metrics.get('total_execution_time', 0):.2f} segundos")
        print(f"   • Fases completadas: {final_metrics.get('phases_completed', 0)}/3")
        print(f"   • Componentes probados: {final_metrics.get('total_components_tested', 0)}")
        print(f"   • Componentes exitosos: {final_metrics.get('total_components_passed', 0)}")
        print(f"   • Tasa de éxito: {final_metrics.get('overall_success_rate', 0):.1f}%")
        print(f"   • Cobertura de seguridad: {final_metrics.get('security_coverage', 0):.1f}%")
        print(f"   • Puntuación de LucIA: {final_metrics.get('lucia_learning_score', 0):.1f}/100")
        
        # Guardar resultados
        save_message = test_manager.save_test_results()
        print(f"\n💾 {save_message}")
        
        print("\n🎉 ¡Pruebas de seguridad completadas exitosamente!")
        return 0
    else:
        print(f"\n❌ Error en pruebas: {results.get('error', 'Error desconocido')}")
        return 1

if __name__ == "__main__":
    exit(main()) 