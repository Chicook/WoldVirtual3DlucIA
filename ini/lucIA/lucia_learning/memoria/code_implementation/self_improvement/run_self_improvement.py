#!/usr/bin/env python3
"""
Run Self Improvement - Script Principal del Sistema de Auto-mejora de LucIA
Ejecuta el proceso completo de auto-mejora integrado en el módulo de memoria
"""

import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

# Añadir el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

# Importar componentes del sistema de auto-mejora
from memoria.self_improvement.core.self_improvement import LucIASelfImprovement
from memoria.self_improvement.core.config import get_self_improvement_config
from memoria.self_improvement.analyzer.code_analyzer import CodeAnalyzer
from memoria.self_improvement.detector.improvement_detector import ImprovementDetector
from memoria.self_improvement.generator.code_generator import CodeGenerator
from memoria.self_improvement.validator.validation_engine import ValidationEngine

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lucia_self_improvement.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class LucIASelfImprovementRunner:
    """Ejecutor principal del sistema de auto-mejora de LucIA"""
    
    def __init__(self):
        self.config = get_self_improvement_config()
        self.self_improvement = LucIASelfImprovement()
        self.analyzer = CodeAnalyzer(self.config.get('code_analysis', {}))
        self.detector = ImprovementDetector(self.config.get('improvement_detection', {}))
        self.generator = CodeGenerator(self.config.get('improvement_generation', {}))
        self.validator = ValidationEngine(self.config.get('validation', {}))
        
        # Resultados del proceso
        self.results = {}
        
    def run_complete_self_improvement(self) -> Dict[str, Any]:
        """Ejecuta el proceso completo de auto-mejora"""
        logger.info("🚀 Iniciando proceso completo de auto-mejora de LucIA")
        
        try:
            # Paso 1: Análisis de código actual
            logger.info("📊 Paso 1: Analizando código actual de LucIA")
            analysis_results = self._run_code_analysis()
            
            # Paso 2: Detección de oportunidades de mejora
            logger.info("🔍 Paso 2: Detectando oportunidades de mejora")
            opportunities = self._run_improvement_detection(analysis_results)
            
            # Paso 3: Generación de mejoras
            logger.info("🛠️ Paso 3: Generando mejoras de código")
            improvements = self._run_improvement_generation(opportunities)
            
            # Paso 4: Validación de mejoras
            logger.info("✅ Paso 4: Validando mejoras generadas")
            validation_results = self._run_improvement_validation(improvements)
            
            # Paso 5: Generación de reporte final
            logger.info("📋 Paso 5: Generando reporte final")
            final_report = self._generate_final_report(
                analysis_results, opportunities, improvements, validation_results
            )
            
            # Guardar resultados
            self.results = {
                'timestamp': datetime.now().isoformat(),
                'analysis': analysis_results,
                'opportunities': opportunities,
                'improvements': improvements,
                'validation': validation_results,
                'final_report': final_report
            }
            
            logger.info("🎉 Proceso de auto-mejora completado exitosamente")
            return self.results
            
        except Exception as e:
            logger.error(f"Error en proceso de auto-mejora: {e}")
            return {'error': str(e)}
            
    def _run_code_analysis(self) -> Dict[str, Any]:
        """Ejecuta análisis de código"""
        try:
            # Obtener archivos de LucIA
            lucia_files = self._get_lucia_files()
            
            # Ejecutar análisis
            analysis_results = self.analyzer.analyze_multiple_files(lucia_files)
            
            logger.info(f"✅ Análisis completado: {analysis_results.get('files_analyzed', 0)} archivos analizados")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Error en análisis de código: {e}")
            return {'error': str(e)}
            
    def _run_improvement_detection(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Ejecuta detección de mejoras"""
        try:
            # Detectar mejoras basadas en análisis
            opportunities = self.detector.detect_improvements(analysis_results)
            
            # Generar plan de mejora
            improvement_plan = self.detector.generate_improvement_plan(opportunities)
            
            logger.info(f"✅ Detección completada: {len(opportunities)} oportunidades encontradas")
            return opportunities
            
        except Exception as e:
            logger.error(f"Error en detección de mejoras: {e}")
            return []
            
    def _run_improvement_generation(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ejecuta generación de mejoras"""
        try:
            # Generar mejoras de código
            improvements = self.generator.generate_improvements(opportunities)
            
            logger.info(f"✅ Generación completada: {len(improvements)} mejoras generadas")
            return improvements
            
        except Exception as e:
            logger.error(f"Error en generación de mejoras: {e}")
            return []
            
    def _run_improvement_validation(self, improvements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Ejecuta validación de mejoras"""
        try:
            # Validar mejoras
            validation_results = self.validator.run_comprehensive_validation(improvements)
            
            logger.info(f"✅ Validación completada: {validation_results.get('summary', {}).get('valid_improvements', 0)} mejoras válidas")
            return validation_results
            
        except Exception as e:
            logger.error(f"Error en validación de mejoras: {e}")
            return {'error': str(e)}
            
    def _get_lucia_files(self) -> List[Path]:
        """Obtiene los archivos principales de LucIA"""
        lucia_dir = Path(__file__).parent.parent.parent.parent
        lucia_files = []
        
        # Archivos principales de LucIA
        main_files = [
            'lucia_core.py',
            'memory.py',
            'paraphraser.py',
            'api_manager.py',
            'lucia_platform_leader.py',
            'platform_leader.py',
            'code_paraphraser.py',
            'config.py'
        ]
        
        for file_name in main_files:
            file_path = lucia_dir / file_name
            if file_path.exists():
                lucia_files.append(file_path)
                
        return lucia_files
        
    def _generate_final_report(self, analysis_results: Dict[str, Any], 
                             opportunities: List[Dict[str, Any]], 
                             improvements: List[Dict[str, Any]], 
                             validation_results: Dict[str, Any]) -> str:
        """Genera reporte final del proceso"""
        report = f"""
🌟 Reporte Final de Auto-mejora de LucIA
{'='*60}

📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🎯 Objetivo: Mejora automática del código de LucIA

📊 RESUMEN EJECUTIVO:
{'='*30}

📁 Archivos analizados: {analysis_results.get('files_analyzed', 0)}
💡 Oportunidades detectadas: {len(opportunities)}
🛠️ Mejoras generadas: {len(improvements)}
✅ Mejoras válidas: {validation_results.get('summary', {}).get('valid_improvements', 0)}
📈 Tasa de éxito: {validation_results.get('summary', {}).get('success_rate', 0):.1%}

📋 DETALLES POR FASE:
{'='*30}

🔍 FASE 1: ANÁLISIS DE CÓDIGO
"""
        
        # Detalles del análisis
        summary = analysis_results.get('summary', {})
        if summary:
            report += f"   • Líneas de código totales: {summary.get('total_lines', 0):,}\n"
            report += f"   • Funciones totales: {summary.get('total_functions', 0)}\n"
            report += f"   • Clases totales: {summary.get('total_classes', 0)}\n"
            report += f"   • Complejidad promedio: {summary.get('average_complexity', 0):.1f}\n"
            report += f"   • Documentación promedio: {summary.get('average_documentation', 0):.1f}%\n"
            
        # Problemas detectados
        issues = analysis_results.get('issues_found', [])
        if issues:
            report += f"   • Problemas detectados: {len(issues)}\n"
            
        report += "\n🎯 FASE 2: DETECCIÓN DE MEJORAS\n"
        
        # Oportunidades por prioridad
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        low_priority = [opp for opp in opportunities if opp.get('priority') == 'low']
        
        report += f"   • Alta prioridad: {len(high_priority)}\n"
        report += f"   • Media prioridad: {len(medium_priority)}\n"
        report += f"   • Baja prioridad: {len(low_priority)}\n"
        
        report += "\n🛠️ FASE 3: GENERACIÓN DE MEJORAS\n"
        
        # Mejoras por tipo
        improvement_types = {}
        for improvement in improvements:
            imp_type = improvement.get('type', 'unknown')
            improvement_types[imp_type] = improvement_types.get(imp_type, 0) + 1
            
        for imp_type, count in improvement_types.items():
            report += f"   • {imp_type}: {count}\n"
            
        report += "\n✅ FASE 4: VALIDACIÓN DE MEJORAS\n"
        
        # Resultados de validación
        validation_summary = validation_results.get('summary', {})
        if validation_summary:
            report += f"   • Mejoras válidas: {validation_summary.get('valid_improvements', 0)}\n"
            report += f"   • Mejoras inválidas: {validation_summary.get('invalid_improvements', 0)}\n"
            report += f"   • Puntuación promedio: {validation_summary.get('average_score', 0):.2f}/1.00\n"
            
        # Problemas de validación
        issue_distribution = validation_results.get('issue_distribution', {})
        if issue_distribution:
            report += "\n🚨 PROBLEMAS DE VALIDACIÓN:\n"
            for issue_type, count in issue_distribution.items():
                report += f"   • {issue_type}: {count}\n"
                
        # Recomendaciones
        recommendations = validation_results.get('recommendations', [])
        if recommendations:
            report += "\n💡 RECOMENDACIONES:\n"
            for rec in recommendations[:5]:  # Top 5
                report += f"   • {rec}\n"
                
        report += "\n📈 MÉTRICAS DE CALIDAD:\n"
        report += "="*30 + "\n"
        
        # Métricas de calidad
        if summary:
            quality_metrics = {
                'Mantenibilidad': 'Buena' if summary.get('average_complexity', 0) < 10 else 'Necesita mejora',
                'Documentación': 'Buena' if summary.get('average_documentation', 0) > 30 else 'Necesita mejora',
                'Estructura': 'Buena' if summary.get('total_functions', 0) > 0 else 'Necesita mejora'
            }
            
            for metric, status in quality_metrics.items():
                report += f"   • {metric}: {status}\n"
                
        report += "\n🎯 PRÓXIMOS PASOS:\n"
        report += "="*30 + "\n"
        
        # Próximos pasos
        next_steps = [
            "Implementar mejoras de alta prioridad",
            "Establecer métricas de seguimiento continuo",
            "Realizar análisis periódicos",
            "Implementar pruebas automatizadas",
            "Documentar mejoras implementadas"
        ]
        
        for i, step in enumerate(next_steps, 1):
            report += f"   {i}. {step}\n"
            
        report += "\n🌟 CONCLUSIÓN:\n"
        report += "="*30 + "\n"
        
        success_rate = validation_results.get('summary', {}).get('success_rate', 0)
        if success_rate > 0.8:
            report += "✅ El proceso de auto-mejora fue exitoso. Se detectaron y validaron múltiples mejoras."
        elif success_rate > 0.5:
            report += "⚠️ El proceso fue parcialmente exitoso. Se recomienda revisar las mejoras inválidas."
        else:
            report += "❌ El proceso necesita mejoras. Se recomienda revisar el proceso de generación."
            
        report += f"\n\n📊 LucIA está evolucionando hacia un líder técnico más capaz y eficiente."
        
        return report
        
    def run_specific_improvement(self, improvement_type: str) -> Dict[str, Any]:
        """Ejecuta mejora específica"""
        logger.info(f"🔧 Ejecutando mejora específica: {improvement_type}")
        
        try:
            # Analizar código actual
            analysis_results = self._run_code_analysis()
            
            # Filtrar oportunidades por tipo
            opportunities = self._run_improvement_detection(analysis_results)
            filtered_opportunities = [
                opp for opp in opportunities 
                if improvement_type in opp.get('type', '').lower()
            ]
            
            if not filtered_opportunities:
                return {'error': f'No se encontraron oportunidades para: {improvement_type}'}
                
            # Generar y validar mejoras
            improvements = self._run_improvement_generation(filtered_opportunities)
            validation_results = self._run_improvement_validation(improvements)
            
            return {
                'improvement_type': improvement_type,
                'opportunities_found': len(filtered_opportunities),
                'improvements_generated': len(improvements),
                'validation_results': validation_results
            }
            
        except Exception as e:
            logger.error(f"Error en mejora específica: {e}")
            return {'error': str(e)}
            
    def save_results(self, output_dir: Path = None) -> str:
        """Guarda resultados del proceso"""
        if not output_dir:
            output_dir = Path(__file__).parent / 'results'
            
        try:
            output_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Guardar resultados como JSON
            json_file = output_dir / f'self_improvement_results_{timestamp}.json'
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
                
            # Guardar reporte como texto
            if 'final_report' in self.results:
                report_file = output_dir / f'self_improvement_report_{timestamp}.txt'
                with open(report_file, 'w', encoding='utf-8') as f:
                    f.write(self.results['final_report'])
                    
            return f"Resultados guardados en: {output_dir}"
            
        except Exception as e:
            logger.error(f"Error guardando resultados: {e}")
            return f"Error guardando resultados: {e}"
            
    def get_improvement_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del proceso de mejora"""
        if not self.results:
            return {}
            
        return {
            'total_opportunities': len(self.results.get('opportunities', [])),
            'total_improvements': len(self.results.get('improvements', [])),
            'valid_improvements': self.results.get('validation', {}).get('summary', {}).get('valid_improvements', 0),
            'success_rate': self.results.get('validation', {}).get('summary', {}).get('success_rate', 0),
            'timestamp': self.results.get('timestamp')
        }

def main():
    """Función principal"""
    print("🌟 Sistema de Auto-mejora de LucIA")
    print("="*50)
    
    # Crear ejecutor
    runner = LucIASelfImprovementRunner()
    
    # Verificar argumentos de línea de comandos
    if len(sys.argv) > 1:
        improvement_type = sys.argv[1]
        print(f"🔧 Ejecutando mejora específica: {improvement_type}")
        results = runner.run_specific_improvement(improvement_type)
    else:
        print("🚀 Ejecutando proceso completo de auto-mejora")
        results = runner.run_complete_self_improvement()
        
    # Mostrar resultados
    if 'error' in results:
        print(f"❌ Error: {results['error']}")
        return 1
        
    # Mostrar reporte final
    if 'final_report' in results:
        print("\n" + results['final_report'])
        
    # Guardar resultados
    save_message = runner.save_results()
    print(f"\n💾 {save_message}")
    
    # Mostrar estadísticas
    stats = runner.get_improvement_stats()
    if stats:
        print(f"\n📊 Estadísticas: {stats['total_improvements']} mejoras generadas, "
              f"{stats['valid_improvements']} válidas ({stats['success_rate']:.1%} éxito)")
        
    print("\n🎉 Proceso completado exitosamente")
    return 0

if __name__ == "__main__":
    exit(main()) 