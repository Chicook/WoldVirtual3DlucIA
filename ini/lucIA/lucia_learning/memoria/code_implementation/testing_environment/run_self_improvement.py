#!/usr/bin/env python3
"""
Run Self Improvement - Sistema de Auto-mejora de LucIA
Ejecuta el proceso completo de análisis, mejora y validación del código de LucIA
"""

import sys
import logging
from pathlib import Path
from datetime import datetime
import json

# Añadir el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent))

from code_analyzer import CodeAnalyzer
from improvement_detector import ImprovementDetector
from code_generator import CodeGenerator
from validation_engine import ValidationEngine

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

class LucIASelfImprovement:
    """Sistema de auto-mejora de LucIA"""
    
    def __init__(self):
        self.analyzer = CodeAnalyzer()
        self.detector = ImprovementDetector()
        self.generator = CodeGenerator()
        self.validator = ValidationEngine()
        
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'analysis': {},
            'improvements': [],
            'validation': {},
            'summary': {}
        }
        
    def run_complete_analysis(self) -> Dict[str, Any]:
        """Ejecuta análisis completo de auto-mejora"""
        logger.info("🚀 Iniciando proceso de auto-mejora de LucIA")
        
        try:
            # Paso 1: Análisis del código actual
            logger.info("📊 Paso 1: Analizando código actual de LucIA")
            analysis_results = self.analyzer.analyze_implementation()
            self.results['analysis'] = analysis_results
            
            # Mostrar resumen del análisis
            print("\n" + "="*60)
            print("📊 ANÁLISIS DEL CÓDIGO ACTUAL DE LUCIA")
            print("="*60)
            print(self.analyzer.get_analysis_summary())
            
            # Paso 2: Detectar oportunidades de mejora
            logger.info("🔍 Paso 2: Detectando oportunidades de mejora")
            opportunities = self.detector.find_improvement_opportunities(analysis_results)
            self.results['opportunities'] = opportunities
            
            print(f"\n💡 OPORTUNIDADES DE MEJORA DETECTADAS: {len(opportunities)}")
            for i, opp in enumerate(opportunities[:5], 1):  # Mostrar top 5
                print(f"{i}. {opp.get('description', 'Sin descripción')}")
                print(f"   Prioridad: {opp.get('priority', 'N/A')}")
                print(f"   Esfuerzo: {opp.get('effort', 'N/A')}")
                print()
                
            # Paso 3: Generar mejoras de código
            logger.info("🛠️ Paso 3: Generando mejoras de código")
            improvements = self.generator.generate_improvements(opportunities)
            self.results['improvements'] = [imp.__dict__ for imp in improvements]
            
            print(f"🔄 MEJORAS DE CÓDIGO GENERADAS: {len(improvements)}")
            for i, imp in enumerate(improvements[:3], 1):  # Mostrar top 3
                print(f"{i}. {imp.improvement_type}: {imp.description}")
                print(f"   Confianza: {imp.confidence:.2f}")
                print(f"   Beneficios: {', '.join(imp.benefits[:2])}")
                print()
                
            # Paso 4: Validar mejoras
            logger.info("✅ Paso 4: Validando mejoras generadas")
            validation_results = []
            
            for improvement in improvements:
                validation = self.validator.validate_improvements(improvement.improved_code)
                validation_results.append({
                    'improvement_type': improvement.improvement_type,
                    'validation': validation.__dict__
                })
                
            self.results['validation'] = validation_results
            
            # Mostrar resultados de validación
            print("✅ RESULTADOS DE VALIDACIÓN:")
            valid_count = sum(1 for v in validation_results if v['validation']['is_valid'])
            print(f"   Mejoras válidas: {valid_count}/{len(validation_results)}")
            
            for v in validation_results:
                status = "✅" if v['validation']['is_valid'] else "❌"
                print(f"   {status} {v['improvement_type']}: {v['validation']['score']:.2f}/1.00")
                
            # Paso 5: Generar resumen final
            logger.info("📋 Paso 5: Generando resumen final")
            self.results['summary'] = self._generate_final_summary()
            
            # Mostrar resumen final
            print("\n" + "="*60)
            print("📋 RESUMEN FINAL DE AUTO-MEJORA")
            print("="*60)
            print(self._format_final_summary())
            
            # Guardar resultados
            self._save_results()
            
            logger.info("🎉 Proceso de auto-mejora completado exitosamente")
            return self.results
            
        except Exception as e:
            logger.error(f"Error en proceso de auto-mejora: {e}")
            return {'error': str(e)}
            
    def _generate_final_summary(self) -> Dict[str, Any]:
        """Genera resumen final del proceso"""
        analysis = self.results.get('analysis', {})
        opportunities = self.results.get('opportunities', [])
        improvements = self.results.get('improvements', [])
        validation = self.results.get('validation', [])
        
        # Estadísticas generales
        general_metrics = analysis.get('general_metrics', {})
        
        # Oportunidades por prioridad
        high_priority = len([opp for opp in opportunities if opp.get('priority') == 'high'])
        medium_priority = len([opp for opp in opportunities if opp.get('priority') == 'medium'])
        low_priority = len([opp for opp in opportunities if opp.get('priority') == 'low'])
        
        # Validaciones exitosas
        valid_improvements = sum(1 for v in validation if v['validation']['is_valid'])
        
        # Calcular puntuación general
        overall_score = self._calculate_overall_score()
        
        return {
            'overall_score': overall_score,
            'files_analyzed': analysis.get('files_analyzed', 0),
            'total_opportunities': len(opportunities),
            'opportunities_by_priority': {
                'high': high_priority,
                'medium': medium_priority,
                'low': low_priority
            },
            'improvements_generated': len(improvements),
            'valid_improvements': valid_improvements,
            'current_metrics': general_metrics,
            'recommendations': self._generate_recommendations()
        }
        
    def _calculate_overall_score(self) -> float:
        """Calcula puntuación general del proceso"""
        analysis = self.results.get('analysis', {})
        opportunities = self.results.get('opportunities', [])
        validation = self.results.get('validation', [])
        
        # Puntuación base
        score = 1.0
        
        # Penalizar por problemas encontrados
        issues = analysis.get('issues_found', [])
        score -= len(issues) * 0.05
        
        # Penalizar por oportunidades de alta prioridad
        high_priority = len([opp for opp in opportunities if opp.get('priority') == 'high'])
        score -= high_priority * 0.1
        
        # Bonificar por mejoras válidas
        valid_improvements = sum(1 for v in validation if v['validation']['is_valid'])
        score += valid_improvements * 0.05
        
        return max(0.0, min(1.0, score))
        
    def _generate_recommendations(self) -> List[str]:
        """Genera recomendaciones finales"""
        recommendations = []
        
        analysis = self.results.get('analysis', {})
        opportunities = self.results.get('opportunities', [])
        
        # Recomendaciones basadas en problemas encontrados
        issues = analysis.get('issues_found', [])
        if len(issues) > 10:
            recommendations.append("🚨 Implementar revisión de código más estricta")
            
        # Recomendaciones basadas en oportunidades
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        if high_priority:
            recommendations.append(f"⚡ Priorizar {len(high_priority)} mejoras de alta prioridad")
            
        # Recomendaciones generales
        recommendations.extend([
            "📈 Establecer proceso de mejora continua",
            "🧪 Implementar pruebas automatizadas",
            "📚 Mejorar documentación del código",
            "🔄 Realizar análisis periódicos",
            "🎯 Fijar objetivos de calidad específicos"
        ])
        
        return recommendations
        
    def _format_final_summary(self) -> str:
        """Formatea el resumen final para mostrar"""
        summary = self.results.get('summary', {})
        
        report = f"""
🎯 Puntuación General: {summary.get('overall_score', 0):.2f}/1.00

📊 Estadísticas del Proceso:
   • Archivos analizados: {summary.get('files_analyzed', 0)}
   • Oportunidades detectadas: {summary.get('total_opportunities', 0)}
   • Mejoras generadas: {summary.get('improvements_generated', 0)}
   • Mejoras válidas: {summary.get('valid_improvements', 0)}

🎯 Oportunidades por Prioridad:
   • Alta: {summary.get('opportunities_by_priority', {}).get('high', 0)}
   • Media: {summary.get('opportunities_by_priority', {}).get('medium', 0)}
   • Baja: {summary.get('opportunities_by_priority', {}).get('low', 0)}

📈 Métricas Actuales:
"""
        
        current_metrics = summary.get('current_metrics', {})
        if current_metrics:
            report += f"   • Líneas de código: {current_metrics.get('lines_of_code', 0)}\n"
            report += f"   • Funciones: {current_metrics.get('functions', 0)}\n"
            report += f"   • Clases: {current_metrics.get('classes', 0)}\n"
            report += f"   • Índice de mantenibilidad: {current_metrics.get('maintainability_index', 0):.1f}/100\n"
            report += f"   • Complejidad ciclomática: {current_metrics.get('cyclomatic_complexity', 0)}\n"
            
        report += "\n💡 Recomendaciones:\n"
        recommendations = summary.get('recommendations', [])
        for rec in recommendations[:5]:  # Top 5
            report += f"   • {rec}\n"
            
        return report
        
    def _save_results(self):
        """Guarda los resultados del análisis"""
        try:
            output_dir = Path(__file__).parent / 'results'
            output_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = output_dir / f'self_improvement_results_{timestamp}.json'
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
                
            logger.info(f"Resultados guardados en: {output_file}")
            
        except Exception as e:
            logger.error(f"Error guardando resultados: {e}")
            
    def run_specific_improvement(self, improvement_type: str) -> Dict[str, Any]:
        """Ejecuta mejora específica"""
        logger.info(f"🔧 Ejecutando mejora específica: {improvement_type}")
        
        try:
            # Analizar solo el tipo de mejora específico
            analysis_results = self.analyzer.analyze_implementation()
            
            # Filtrar oportunidades por tipo
            opportunities = self.detector.find_improvement_opportunities(analysis_results)
            filtered_opportunities = [
                opp for opp in opportunities 
                if improvement_type in opp.get('category', '').lower()
            ]
            
            if not filtered_opportunities:
                return {'error': f'No se encontraron oportunidades de mejora para: {improvement_type}'}
                
            # Generar mejoras específicas
            improvements = self.generator.generate_improvements(filtered_opportunities)
            
            # Validar mejoras
            validation_results = []
            for improvement in improvements:
                validation = self.validator.validate_improvements(improvement.improved_code)
                validation_results.append({
                    'improvement_type': improvement.improvement_type,
                    'validation': validation.__dict__
                })
                
            return {
                'improvement_type': improvement_type,
                'opportunities_found': len(filtered_opportunities),
                'improvements_generated': len(improvements),
                'validation_results': validation_results
            }
            
        except Exception as e:
            logger.error(f"Error en mejora específica: {e}")
            return {'error': str(e)}
            
    def get_system_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del sistema de auto-mejora"""
        return {
            'analyzer_stats': self.analyzer.get_analysis_stats(),
            'detector_stats': self.detector.get_detection_stats(),
            'generator_stats': self.generator.get_generation_stats(),
            'validator_stats': self.validator.get_validation_stats()
        }

def main():
    """Función principal"""
    print("🧠 LUCIA - SISTEMA DE AUTO-MEJORA")
    print("="*50)
    
    # Crear instancia del sistema
    self_improvement = LucIASelfImprovement()
    
    # Verificar argumentos de línea de comandos
    if len(sys.argv) > 1:
        improvement_type = sys.argv[1].lower()
        print(f"🎯 Ejecutando mejora específica: {improvement_type}")
        results = self_improvement.run_specific_improvement(improvement_type)
    else:
        print("🚀 Ejecutando análisis completo de auto-mejora")
        results = self_improvement.run_complete_analysis()
        
    # Mostrar estadísticas del sistema
    print("\n📊 ESTADÍSTICAS DEL SISTEMA:")
    stats = self_improvement.get_system_stats()
    for component, component_stats in stats.items():
        print(f"   {component}: {len(component_stats)} métricas disponibles")
        
    print("\n✨ Proceso completado. Revisa los logs para más detalles.")

if __name__ == "__main__":
    main() 