#!/usr/bin/env python3
"""
🐍 CLIPythonBridge - Puente Python para Sistema CLI Avanzado
WoldVirtual3DlucIA - Módulo de Integración Python

Responsabilidades:
- Procesamiento de datos y análisis de métricas CLI
- Automatización de tareas complejas con Python
- Gestión de dependencias y entornos virtuales
- Generación de reportes y documentación
- Integración con herramientas de desarrollo Python
- Validación y testing de configuraciones
"""

import json
import subprocess
import sys
import os
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import yaml
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============================================================================
# CONFIGURACIÓN Y LOGGING
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class CLIPythonConfig:
    """Configuración para el puente Python CLI"""
    python_version: str = "3.9+"
    max_workers: int = 4
    timeout: int = 30
    retry_attempts: int = 3
    log_level: str = "INFO"
    cache_dir: str = ".cli_cache"
    templates_dir: str = "templates"
    reports_dir: str = "reports"

# ============================================================================
# CLASE PRINCIPAL DEL PUENTE PYTHON
# ============================================================================

class CLIPythonBridge:
    """
    Puente Python para extender funcionalidades del CLI
    Proporciona capacidades avanzadas de procesamiento y automatización
    """
    
    def __init__(self, config: Optional[CLIPythonConfig] = None):
        self.config = config or CLIPythonConfig()
        self.executor = ThreadPoolExecutor(max_workers=self.config.max_workers)
        self.cache = {}
        self.active_tasks = {}
        self._setup_directories()
        
    def _setup_directories(self) -> None:
        """Configurar directorios necesarios para el funcionamiento"""
        directories = [
            self.config.cache_dir,
            self.config.templates_dir,
            self.config.reports_dir
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            logger.info(f"Directorio configurado: {directory}")
    
    async def analyze_project_structure(self, project_path: str) -> Dict[str, Any]:
        """
        Analizar estructura del proyecto y generar métricas
        """
        logger.info(f"Analizando estructura del proyecto: {project_path}")
        
        analysis = {
            "project_path": project_path,
            "timestamp": datetime.now().isoformat(),
            "files": {},
            "dependencies": {},
            "metrics": {},
            "recommendations": []
        }
        
        try:
            # Análisis de archivos por tipo
            file_types = await self._count_file_types(project_path)
            analysis["files"] = file_types
            
            # Análisis de dependencias
            dependencies = await self._analyze_dependencies(project_path)
            analysis["dependencies"] = dependencies
            
            # Métricas de complejidad
            metrics = await self._calculate_complexity_metrics(project_path)
            analysis["metrics"] = metrics
            
            # Generar recomendaciones
            recommendations = await self._generate_recommendations(analysis)
            analysis["recommendations"] = recommendations
            
            # Guardar análisis en caché
            self.cache[f"analysis_{project_path}"] = analysis
            
            logger.info(f"Análisis completado para: {project_path}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error en análisis de proyecto: {e}")
            return {"error": str(e)}
    
    async def _count_file_types(self, project_path: str) -> Dict[str, int]:
        """Contar archivos por tipo en el proyecto"""
        file_counts = {}
        
        try:
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    ext = Path(file).suffix.lower()
                    file_counts[ext] = file_counts.get(ext, 0) + 1
                    
        except Exception as e:
            logger.error(f"Error contando archivos: {e}")
            
        return file_counts
    
    async def _analyze_dependencies(self, project_path: str) -> Dict[str, Any]:
        """Analizar dependencias del proyecto"""
        dependencies = {
            "package.json": {},
            "requirements.txt": [],
            "pyproject.toml": {},
            "cargo.toml": {},
            "go.mod": {}
        }
        
        try:
            # Analizar package.json
            package_json_path = Path(project_path) / "package.json"
            if package_json_path.exists():
                with open(package_json_path, 'r') as f:
                    data = json.load(f)
                    dependencies["package.json"] = {
                        "dependencies": data.get("dependencies", {}),
                        "devDependencies": data.get("devDependencies", {}),
                        "scripts": data.get("scripts", {})
                    }
            
            # Analizar requirements.txt
            requirements_path = Path(project_path) / "requirements.txt"
            if requirements_path.exists():
                with open(requirements_path, 'r') as f:
                    dependencies["requirements.txt"] = [
                        line.strip() for line in f if line.strip() and not line.startswith('#')
                    ]
                    
        except Exception as e:
            logger.error(f"Error analizando dependencias: {e}")
            
        return dependencies
    
    async def _calculate_complexity_metrics(self, project_path: str) -> Dict[str, Any]:
        """Calcular métricas de complejidad del proyecto"""
        metrics = {
            "total_files": 0,
            "total_lines": 0,
            "average_file_size": 0,
            "largest_files": [],
            "most_complex_modules": []
        }
        
        try:
            file_sizes = []
            
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    file_path = Path(root) / file
                    if file_path.is_file():
                        size = file_path.stat().st_size
                        file_sizes.append((file_path, size))
                        
                        # Contar líneas si es un archivo de código
                        if file_path.suffix in ['.py', '.js', '.ts', '.tsx', '.jsx']:
                            try:
                                with open(file_path, 'r', encoding='utf-8') as f:
                                    lines = len(f.readlines())
                                    metrics["total_lines"] += lines
                            except:
                                pass
            
            metrics["total_files"] = len(file_sizes)
            if file_sizes:
                metrics["average_file_size"] = sum(size for _, size in file_sizes) / len(file_sizes)
                metrics["largest_files"] = sorted(file_sizes, key=lambda x: x[1], reverse=True)[:10]
                
        except Exception as e:
            logger.error(f"Error calculando métricas: {e}")
            
        return metrics
    
    async def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generar recomendaciones basadas en el análisis"""
        recommendations = []
        
        try:
            files = analysis.get("files", {})
            metrics = analysis.get("metrics", {})
            
            # Recomendaciones basadas en tipos de archivo
            if files.get(".ts", 0) > 100:
                recommendations.append("Considerar migración gradual a otros lenguajes para mejor distribución")
            
            if files.get(".js", 0) > 500:
                recommendations.append("Evaluar uso de TypeScript para mejor tipado")
            
            # Recomendaciones basadas en métricas
            if metrics.get("total_files", 0) > 1000:
                recommendations.append("Proyecto grande detectado - considerar modularización")
            
            if metrics.get("average_file_size", 0) > 10000:
                recommendations.append("Archivos muy grandes - considerar división en módulos más pequeños")
                
        except Exception as e:
            logger.error(f"Error generando recomendaciones: {e}")
            
        return recommendations
    
    async def generate_project_report(self, project_path: str, format: str = "json") -> str:
        """
        Generar reporte completo del proyecto
        """
        logger.info(f"Generando reporte para: {project_path}")
        
        try:
            # Obtener análisis
            analysis = await self.analyze_project_structure(project_path)
            
            # Generar reporte según formato
            if format.lower() == "json":
                report_path = Path(self.config.reports_dir) / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(report_path, 'w') as f:
                    json.dump(analysis, f, indent=2)
                    
            elif format.lower() == "yaml":
                report_path = Path(self.config.reports_dir) / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.yaml"
                with open(report_path, 'w') as f:
                    yaml.dump(analysis, f, default_flow_style=False)
                    
            elif format.lower() == "markdown":
                report_path = Path(self.config.reports_dir) / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
                await self._generate_markdown_report(analysis, report_path)
            
            logger.info(f"Reporte generado: {report_path}")
            return str(report_path)
            
        except Exception as e:
            logger.error(f"Error generando reporte: {e}")
            return f"Error: {str(e)}"
    
    async def _generate_markdown_report(self, analysis: Dict[str, Any], report_path: Path) -> None:
        """Generar reporte en formato Markdown"""
        with open(report_path, 'w') as f:
            f.write("# Análisis de Proyecto WoldVirtual3DlucIA\n\n")
            f.write(f"**Fecha:** {analysis.get('timestamp', 'N/A')}\n")
            f.write(f"**Proyecto:** {analysis.get('project_path', 'N/A')}\n\n")
            
            # Métricas principales
            metrics = analysis.get("metrics", {})
            f.write("## Métricas Principales\n\n")
            f.write(f"- **Total archivos:** {metrics.get('total_files', 0)}\n")
            f.write(f"- **Total líneas:** {metrics.get('total_lines', 0)}\n")
            f.write(f"- **Tamaño promedio:** {metrics.get('average_file_size', 0):.2f} bytes\n\n")
            
            # Tipos de archivo
            files = analysis.get("files", {})
            f.write("## Distribución por Tipo de Archivo\n\n")
            for ext, count in sorted(files.items(), key=lambda x: x[1], reverse=True):
                f.write(f"- `{ext}`: {count} archivos\n")
            f.write("\n")
            
            # Recomendaciones
            recommendations = analysis.get("recommendations", [])
            if recommendations:
                f.write("## Recomendaciones\n\n")
                for i, rec in enumerate(recommendations, 1):
                    f.write(f"{i}. {rec}\n")
                f.write("\n")
    
    async def cleanup_cache(self, older_than_days: int = 7) -> int:
        """
        Limpiar caché antiguo
        """
        logger.info(f"Limpiando caché más antiguo que {older_than_days} días")
        
        try:
            cache_dir = Path(self.config.cache_dir)
            cutoff_date = datetime.now() - timedelta(days=older_than_days)
            deleted_count = 0
            
            for cache_file in cache_dir.glob("*"):
                if cache_file.is_file():
                    file_time = datetime.fromtimestamp(cache_file.stat().st_mtime)
                    if file_time < cutoff_date:
                        cache_file.unlink()
                        deleted_count += 1
                        
            logger.info(f"Archivos eliminados del caché: {deleted_count}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error limpiando caché: {e}")
            return 0
    
    def get_status(self) -> Dict[str, Any]:
        """Obtener estado actual del puente Python"""
        return {
            "python_version": sys.version,
            "config": asdict(self.config),
            "active_tasks": len(self.active_tasks),
            "cache_size": len(self.cache),
            "executor_status": {
                "max_workers": self.config.max_workers,
                "active_threads": len(self.executor._threads)
            }
        }

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

async def create_cli_python_bridge(config: Optional[CLIPythonConfig] = None) -> CLIPythonBridge:
    """Factory function para crear instancia del puente Python"""
    return CLIPythonBridge(config)

def validate_python_environment() -> bool:
    """Validar que el entorno Python sea adecuado"""
    try:
        import yaml
        import requests
        return True
    except ImportError as e:
        logger.error(f"Dependencias Python faltantes: {e}")
        return False

# ============================================================================
# PUNTO DE ENTRADA PARA INTEGRACIÓN CON CLI
# ============================================================================

if __name__ == "__main__":
    async def main():
        """Función principal para testing"""
        bridge = await create_cli_python_bridge()
        
        # Ejemplo de uso
        project_path = "."
        analysis = await bridge.analyze_project_structure(project_path)
        print(json.dumps(analysis, indent=2))
        
        # Generar reporte
        report_path = await bridge.generate_project_report(project_path, "markdown")
        print(f"Reporte generado: {report_path}")
        
        # Limpiar caché
        deleted = await bridge.cleanup_cache()
        print(f"Archivos eliminados del caché: {deleted}")
    
    asyncio.run(main()) 