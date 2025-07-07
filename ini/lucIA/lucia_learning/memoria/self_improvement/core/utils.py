#!/usr/bin/env python3
"""
Utils - Utilidades del Sistema de Auto-mejora de LucIA
Funciones auxiliares y utilidades para el sistema de auto-mejora
"""

import os
import re
import ast
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import hashlib
import shutil

logger = logging.getLogger(__name__)

class CodeAnalyzer:
    """Utilidades para análisis de código"""
    
    @staticmethod
    def count_lines_of_code(content: str) -> int:
        """Cuenta líneas de código efectivas"""
        lines = content.split('\n')
        code_lines = 0
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('"""') and not line.startswith("'''"):
                code_lines += 1
                
        return code_lines
        
    @staticmethod
    def count_functions(content: str) -> int:
        """Cuenta funciones en el código"""
        return len(re.findall(r'def\s+\w+\s*\(', content))
        
    @staticmethod
    def count_classes(content: str) -> int:
        """Cuenta clases en el código"""
        return len(re.findall(r'class\s+\w+', content))
        
    @staticmethod
    def calculate_complexity(content: str) -> int:
        """Calcula complejidad ciclomática"""
        complexity = 1
        
        # Contar estructuras de control
        complexity += len(re.findall(r'\bif\b', content))
        complexity += len(re.findall(r'\bfor\b', content))
        complexity += len(re.findall(r'\bwhile\b', content))
        complexity += len(re.findall(r'\bexcept\b', content))
        complexity += len(re.findall(r'\bwith\b', content))
        complexity += len(re.findall(r'\band\b', content))
        complexity += len(re.findall(r'\bor\b', content))
        
        return complexity
        
    @staticmethod
    def calculate_documentation_coverage(content: str) -> float:
        """Calcula cobertura de documentación"""
        lines = content.split('\n')
        doc_lines = 0
        code_lines = 0
        
        for line in lines:
            line = line.strip()
            if line:
                if line.startswith('#') or line.startswith('"""') or line.startswith("'''"):
                    doc_lines += 1
                elif not line.startswith('import') and not line.startswith('from'):
                    code_lines += 1
                    
        return (doc_lines / (doc_lines + code_lines) * 100) if (doc_lines + code_lines) > 0 else 0
        
    @staticmethod
    def find_long_functions(content: str, max_lines: int = 50) -> List[Dict[str, Any]]:
        """Encuentra funciones largas"""
        functions = []
        
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    start_line = node.lineno
                    end_line = node.end_lineno if hasattr(node, 'end_lineno') else start_line
                    lines = end_line - start_line + 1
                    
                    if lines > max_lines:
                        functions.append({
                            'name': node.name,
                            'lines': lines,
                            'start_line': start_line,
                            'end_line': end_line
                        })
        except SyntaxError:
            logger.warning("Error de sintaxis al analizar código")
            
        return functions
        
    @staticmethod
    def find_complex_functions(content: str, max_complexity: int = 10) -> List[Dict[str, Any]]:
        """Encuentra funciones complejas"""
        complex_functions = []
        
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    complexity = CodeAnalyzer._calculate_function_complexity(node)
                    
                    if complexity > max_complexity:
                        complex_functions.append({
                            'name': node.name,
                            'complexity': complexity,
                            'line': node.lineno
                        })
        except SyntaxError:
            logger.warning("Error de sintaxis al analizar complejidad")
            
        return complex_functions
        
    @staticmethod
    def _calculate_function_complexity(node: ast.FunctionDef) -> int:
        """Calcula complejidad de una función específica"""
        complexity = 1
        
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
                
        return complexity

class FileManager:
    """Utilidades para gestión de archivos"""
    
    @staticmethod
    def create_backup(file_path: Path, backup_dir: Path = None) -> Path:
        """Crea backup de un archivo"""
        if not backup_dir:
            backup_dir = Path(__file__).parent.parent / 'backups'
            
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
        backup_path = backup_dir / backup_name
        
        try:
            shutil.copy2(file_path, backup_path)
            logger.info(f"Backup creado: {backup_path}")
            return backup_path
        except Exception as e:
            logger.error(f"Error creando backup: {e}")
            return None
            
    @staticmethod
    def restore_backup(backup_path: Path, original_path: Path) -> bool:
        """Restaura un archivo desde backup"""
        try:
            shutil.copy2(backup_path, original_path)
            logger.info(f"Archivo restaurado desde: {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Error restaurando backup: {e}")
            return False
            
    @staticmethod
    def get_file_hash(file_path: Path) -> str:
        """Calcula hash MD5 de un archivo"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                return hashlib.md5(content).hexdigest()
        except Exception as e:
            logger.error(f"Error calculando hash: {e}")
            return ""
            
    @staticmethod
    def find_files_by_pattern(directory: Path, pattern: str) -> List[Path]:
        """Encuentra archivos por patrón"""
        files = []
        try:
            for file_path in directory.rglob(pattern):
                if file_path.is_file():
                    files.append(file_path)
        except Exception as e:
            logger.error(f"Error buscando archivos: {e}")
            
        return files
        
    @staticmethod
    def clean_old_backups(backup_dir: Path, days: int = 30) -> int:
        """Limpia backups antiguos"""
        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        
        try:
            for backup_file in backup_dir.glob('*'):
                if backup_file.is_file():
                    file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
                    if file_time < cutoff_date:
                        backup_file.unlink()
                        deleted_count += 1
                        logger.info(f"Backup eliminado: {backup_file}")
        except Exception as e:
            logger.error(f"Error limpiando backups: {e}")
            
        return deleted_count

class ValidationUtils:
    """Utilidades para validación de código"""
    
    @staticmethod
    def validate_python_syntax(content: str) -> Tuple[bool, List[str]]:
        """Valida sintaxis de Python"""
        errors = []
        
        try:
            ast.parse(content)
            return True, []
        except SyntaxError as e:
            errors.append(f"Error de sintaxis en línea {e.lineno}: {e.msg}")
            return False, errors
        except Exception as e:
            errors.append(f"Error inesperado: {e}")
            return False, errors
            
    @staticmethod
    def validate_imports(content: str) -> Tuple[bool, List[str]]:
        """Valida imports de Python"""
        errors = []
        
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if not ValidationUtils._is_valid_module(alias.name):
                            errors.append(f"Import inválido: {alias.name}")
                elif isinstance(node, ast.ImportFrom):
                    if not ValidationUtils._is_valid_module(node.module):
                        errors.append(f"Import inválido: {node.module}")
        except Exception as e:
            errors.append(f"Error validando imports: {e}")
            
        return len(errors) == 0, errors
        
    @staticmethod
    def _is_valid_module(module_name: str) -> bool:
        """Verifica si un módulo es válido"""
        if not module_name:
            return False
            
        # Lista de módulos permitidos
        allowed_modules = [
            'os', 'sys', 'json', 'datetime', 'pathlib', 'typing',
            'logging', 're', 'ast', 'hashlib', 'shutil', 'math',
            'random', 'collections', 'itertools', 'functools'
        ]
        
        return module_name in allowed_modules or module_name.startswith('lucia_')
        
    @staticmethod
    def validate_function_definitions(content: str) -> Tuple[bool, List[str]]:
        """Valida definiciones de funciones"""
        errors = []
        
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Verificar nombre de función
                    if not re.match(r'^[a-z_][a-z0-9_]*$', node.name):
                        errors.append(f"Nombre de función inválido: {node.name}")
                        
                    # Verificar argumentos
                    for arg in node.args.args:
                        if not re.match(r'^[a-z_][a-z0-9_]*$', arg.arg):
                            errors.append(f"Nombre de argumento inválido: {arg.arg}")
        except Exception as e:
            errors.append(f"Error validando funciones: {e}")
            
        return len(errors) == 0, errors

class MetricsCalculator:
    """Utilidades para cálculo de métricas"""
    
    @staticmethod
    def calculate_maintainability_index(complexity: int, lines: int, comments: int) -> float:
        """Calcula índice de mantenibilidad"""
        # Fórmula simplificada de mantenibilidad
        volume = lines * complexity
        comment_weight = min(comments / lines, 1.0) if lines > 0 else 0
        
        maintainability = 171 - 5.2 * volume - 0.23 * complexity - 16.2 * comment_weight
        return max(0, min(100, maintainability))
        
    @staticmethod
    def calculate_halstead_volume(content: str) -> float:
        """Calcula volumen de Halstead"""
        # Implementación simplificada
        operators = len(re.findall(r'[\+\-\*/=<>!&\|\(\)\[\]\{\}]', content))
        operands = len(re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', content))
        
        if operands == 0:
            return 0
            
        volume = (operators + operands) * (2 ** (operators + operands))
        return volume
        
    @staticmethod
    def calculate_cyclomatic_complexity(content: str) -> int:
        """Calcula complejidad ciclomática"""
        return CodeAnalyzer.calculate_complexity(content)
        
    @staticmethod
    def calculate_code_duplication(content: str) -> float:
        """Calcula duplicación de código (simplificado)"""
        lines = content.split('\n')
        unique_lines = set()
        total_lines = 0
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                unique_lines.add(line)
                total_lines += 1
                
        if total_lines == 0:
            return 0
            
        return ((total_lines - len(unique_lines)) / total_lines) * 100

class ReportGenerator:
    """Utilidades para generación de reportes"""
    
    @staticmethod
    def generate_analysis_report(analysis_results: Dict[str, Any]) -> str:
        """Genera reporte de análisis"""
        report = "📊 Reporte de Análisis de Código\n"
        report += "=" * 50 + "\n\n"
        
        # Métricas generales
        metrics = analysis_results.get('general_metrics', {})
        if metrics:
            report += "📈 Métricas Generales:\n"
            report += f"   • Archivos analizados: {metrics.get('files_analyzed', 0)}\n"
            report += f"   • Líneas de código: {metrics.get('lines_of_code', 0):,}\n"
            report += f"   • Funciones: {metrics.get('functions', 0)}\n"
            report += f"   • Clases: {metrics.get('classes', 0)}\n"
            report += f"   • Complejidad promedio: {metrics.get('average_complexity', 0):.1f}\n"
            report += f"   • Documentación promedio: {metrics.get('average_documentation_coverage', 0):.1f}%\n\n"
            
        # Problemas detectados
        issues = analysis_results.get('issues_found', [])
        if issues:
            report += "⚠️ Problemas Detectados:\n"
            for issue in issues[:5]:  # Top 5
                severity = issue.get('severity', 'info')
                icon = "🔴" if severity == "error" else "🟡" if severity == "warning" else "🔵"
                report += f"   {icon} {issue.get('description', 'Sin descripción')}\n"
            report += "\n"
            
        # Oportunidades de mejora
        opportunities = analysis_results.get('improvement_opportunities', [])
        if opportunities:
            report += "💡 Oportunidades de Mejora:\n"
            for opp in opportunities[:3]:  # Top 3
                priority = opp.get('priority', 'medium')
                icon = "🔴" if priority == "high" else "🟡" if priority == "medium" else "🔵"
                report += f"   {icon} {opp.get('description', 'Sin descripción')}\n"
                
        return report
        
    @staticmethod
    def generate_improvement_report(improvements: List[Dict[str, Any]]) -> str:
        """Genera reporte de mejoras"""
        report = "🛠️ Reporte de Mejoras Generadas\n"
        report += "=" * 40 + "\n\n"
        
        for i, improvement in enumerate(improvements, 1):
            report += f"{i}. {improvement.get('type', 'N/A')}\n"
            report += f"   Descripción: {improvement.get('description', 'Sin descripción')}\n"
            report += f"   Confianza: {improvement.get('confidence', 0):.2f}/1.00\n"
            
            benefits = improvement.get('benefits', [])
            if benefits:
                report += f"   Beneficios: {', '.join(benefits)}\n"
                
            report += "\n"
            
        return report
        
    @staticmethod
    def generate_validation_report(validation_results: List[Dict[str, Any]]) -> str:
        """Genera reporte de validación"""
        report = "✅ Reporte de Validación\n"
        report += "=" * 30 + "\n\n"
        
        valid_count = sum(1 for v in validation_results if v.get('is_valid', False))
        total_count = len(validation_results)
        
        report += f"Mejoras válidas: {valid_count}/{total_count}\n"
        report += f"Tasa de éxito: {(valid_count/total_count*100):.1f}% si total_count > 0 else 0}%\n\n"
        
        for i, validation in enumerate(validation_results, 1):
            status = "✅" if validation.get('is_valid', False) else "❌"
            report += f"{i}. {status} {validation.get('improvement_type', 'N/A')}\n"
            report += f"   Puntuación: {validation.get('score', 0):.2f}/1.00\n"
            
            issues = validation.get('issues', [])
            if issues:
                report += f"   Problemas: {', '.join(issues)}\n"
                
            report += "\n"
            
        return report

class PerformanceMonitor:
    """Utilidades para monitoreo de rendimiento"""
    
    def __init__(self):
        self.start_time = None
        self.memory_start = None
        
    def start_monitoring(self):
        """Inicia monitoreo"""
        import time
        import psutil
        
        self.start_time = time.time()
        self.memory_start = psutil.Process().memory_info().rss
        
    def end_monitoring(self) -> Dict[str, float]:
        """Termina monitoreo y retorna métricas"""
        import time
        import psutil
        
        if not self.start_time:
            return {}
            
        end_time = time.time()
        memory_end = psutil.Process().memory_info().rss
        
        execution_time = (end_time - self.start_time) * 1000  # en ms
        memory_usage = (memory_end - self.memory_start) / (1024 * 1024)  # en MB
        
        return {
            'execution_time_ms': execution_time,
            'memory_usage_mb': memory_usage,
            'cpu_usage_percent': psutil.cpu_percent()
        } 