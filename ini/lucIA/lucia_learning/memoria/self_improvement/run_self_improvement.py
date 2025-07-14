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
current_dir = Path(__file__).parent
lucia_dir = current_dir.parent.parent.parent.parent  # Subir hasta lucIA/
sys.path.append(str(lucia_dir))

# Importar componentes del sistema de auto-mejora
from lucia_learning.memoria.self_improvement.core.self_improvement import LucIASelfImprovement

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
        self.self_improvement = LucIASelfImprovement()
        
        # Resultados del proceso
        self.results = {}
        
    def run_complete_self_improvement(self) -> Dict[str, Any]:
        """Ejecuta el proceso completo de auto-mejora"""
        logger.info("🚀 Iniciando proceso completo de auto-mejora de LucIA")
        
        try:
            # Ejecutar análisis completo
            results = self.self_improvement.run_complete_analysis()
            
            if 'error' in results:
                logger.error(f"Error en análisis: {results['error']}")
                return results
                
            self.results = results
            
            logger.info("🎉 Proceso de auto-mejora completado exitosamente")
            return results
            
        except Exception as e:
            logger.error(f"Error en proceso de auto-mejora: {e}")
            return {'error': str(e)}
            
    def run_specific_improvement(self, improvement_type: str) -> Dict[str, Any]:
        """Ejecuta mejora específica"""
        logger.info(f"🔧 Ejecutando mejora específica: {improvement_type}")
        
        try:
            results = self.self_improvement.run_specific_improvement(improvement_type)
            self.results = results
            return results
            
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
            if 'report' in self.results:
                report_file = output_dir / f'self_improvement_report_{timestamp}.txt'
                with open(report_file, 'w', encoding='utf-8') as f:
                    f.write(self.results['report'])
                    
            return f"Resultados guardados en: {output_dir}"
            
        except Exception as e:
            logger.error(f"Error guardando resultados: {e}")
            return f"Error guardando resultados: {e}"
            
    def get_improvement_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del proceso de mejora"""
        return self.self_improvement.get_improvement_stats()

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
    if 'report' in results:
        print("\n" + results['report'])
        
    # Guardar resultados
    save_message = runner.save_results()
    print(f"\n💾 {save_message}")
    
    # Mostrar estadísticas
    stats = runner.get_improvement_stats()
    if stats:
        print(f"\n📊 Estadísticas: {stats.get('total_analyses', 0)} análisis realizados")
        
    print("\n🎉 Proceso completado exitosamente")
    return 0

if __name__ == "__main__":
    exit(main()) 