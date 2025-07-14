#!/usr/bin/env python3
"""
Validation Engine - Motor de Validación para LucIA
Valida las mejoras de código generadas por LucIA
"""

import ast
import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from pathlib import Path
import json
from datetime import datetime
import subprocess
import sys

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    """Resultado de validación"""
    is_valid: bool
    score: float
    issues: List[str]
    warnings: List[str]
    suggestions: List[str]
    metrics: Dict[str, Any]

@dataclass
class CodeQualityMetric:
    """Métrica de calidad de código"""
    name: str
    value: float
    threshold: float
    status: str
    description: str

@dataclass
class PerformanceMetric:
    """Métrica de rendimiento"""
    name: str
    before_value: float
    after_value: float
    improvement: float
    unit: str

class ValidationEngine:
    """Motor de validación para mejoras de código"""
    
    def __init__(self):
        self.quality_thresholds = self._load_quality_thresholds()
        self.performance_benchmarks = self._load_performance_benchmarks()
        self.validation_rules = self._load_validation_rules()
        
    def _load_quality_thresholds(self) -> Dict[str, float]:
        """Carga umbrales de calidad"""
        return {
            'maintainability_index': 70.0,
            'cyclomatic_complexity': 10.0,
            'lines_per_function': 50.0,
            'parameters_per_function': 7.0,
            'nesting_depth': 5.0,
            'code_duplication': 15.0,
            'documentation_coverage': 30.0,
            'test_coverage': 50.0
        }
        
    def _load_performance_benchmarks(self) -> Dict[str, Dict[str, Any]]:
        """Carga benchmarks de rendimiento"""
        return {
            'execution_time': {
                'threshold': 1.0,  # segundos
                'improvement_target': 0.2,  # 20% mejora
                'unit': 'seconds'
            },
            'memory_usage': {
                'threshold': 100.0,  # MB
                'improvement_target': 0.15,  # 15% mejora
                'unit': 'MB'
            },
            'cpu_usage': {
                'threshold': 80.0,  # porcentaje
                'improvement_target': 0.1,  # 10% mejora
                'unit': 'percent'
            }
        }
        
    def _load_validation_rules(self) -> List[Dict[str, Any]]:
        """Carga reglas de validación"""
        return [
            {
                'name': 'syntax_check',
                'description': 'Verificar sintaxis del código',
                'severity': 'error',
                'function': 'check_syntax'
            },
            {
                'name': 'import_check',
                'description': 'Verificar imports válidos',
                'severity': 'error',
                'function': 'check_imports'
            },
            {
                'name': 'function_signature_check',
                'description': 'Verificar firmas de funciones',
                'severity': 'warning',
                'function': 'check_function_signatures'
            },
            {
                'name': 'variable_usage_check',
                'description': 'Verificar uso de variables',
                'severity': 'warning',
                'function': 'check_variable_usage'
            },
            {
                'name': 'logic_check',
                'description': 'Verificar lógica del código',
                'severity': 'info',
                'function': 'check_logic'
            }
        ]
        
    def validate_improvements(self, improved_code: str, original_code: str = None) -> ValidationResult:
        """Valida las mejoras de código generadas"""
        logger.info("🔍 Iniciando validación de mejoras de código")
        
        issues = []
        warnings = []
        suggestions = []
        metrics = {}
        
        try:
            # Validar sintaxis
            syntax_valid = self._check_syntax(improved_code)
            if not syntax_valid:
                issues.append("Error de sintaxis en el código mejorado")
                
            # Validar imports
            import_issues = self._check_imports(improved_code)
            issues.extend(import_issues)
            
            # Validar firmas de funciones
            signature_warnings = self._check_function_signatures(improved_code)
            warnings.extend(signature_warnings)
            
            # Validar uso de variables
            variable_warnings = self._check_variable_usage(improved_code)
            warnings.extend(variable_warnings)
            
            # Validar lógica
            logic_suggestions = self._check_logic(improved_code)
            suggestions.extend(logic_suggestions)
            
            # Calcular métricas de calidad
            quality_metrics = self._calculate_quality_metrics(improved_code)
            metrics['quality'] = quality_metrics
            
            # Comparar con código original si está disponible
            if original_code:
                comparison_metrics = self._compare_with_original(improved_code, original_code)
                metrics['comparison'] = comparison_metrics
                
            # Calcular puntuación general
            score = self._calculate_validation_score(issues, warnings, quality_metrics)
            
            # Determinar si es válido
            is_valid = len(issues) == 0 and score >= 0.7
            
            return ValidationResult(
                is_valid=is_valid,
                score=score,
                issues=issues,
                warnings=warnings,
                suggestions=suggestions,
                metrics=metrics
            )
            
        except Exception as e:
            logger.error(f"Error en validación: {e}")
            return ValidationResult(
                is_valid=False,
                score=0.0,
                issues=[f"Error de validación: {str(e)}"],
                warnings=[],
                suggestions=[],
                metrics={}
            )
            
    def _check_syntax(self, code: str) -> bool:
        """Verifica la sintaxis del código"""
        try:
            ast.parse(code)
            return True
        except SyntaxError as e:
            logger.error(f"Error de sintaxis: {e}")
            return False
            
    def _check_imports(self, code: str) -> List[str]:
        """Verifica los imports del código"""
        issues = []
        
        try:
            tree = ast.parse(code)
            
            # Verificar imports no utilizados
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    imports.append(node.module or '')
                    
            # Verificar si los imports se usan (simplificado)
            for imp in imports:
                if imp and not self._is_import_used(imp, tree):
                    issues.append(f"Import posiblemente no utilizado: {imp}")
                    
        except Exception as e:
            issues.append(f"Error verificando imports: {e}")
            
        return issues
        
    def _is_import_used(self, import_name: str, tree: ast.AST) -> bool:
        """Verifica si un import se utiliza"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and node.id == import_name.split('.')[-1]:
                return True
        return False
        
    def _check_function_signatures(self, code: str) -> List[str]:
        """Verifica las firmas de funciones"""
        warnings = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Verificar número de parámetros
                    param_count = len(node.args.args)
                    if param_count > self.quality_thresholds['parameters_per_function']:
                        warnings.append(f"Función '{node.name}' tiene muchos parámetros ({param_count})")
                        
                    # Verificar longitud de función
                    if len(node.body) > self.quality_thresholds['lines_per_function']:
                        warnings.append(f"Función '{node.name}' es muy larga ({len(node.body)} líneas)")
                        
        except Exception as e:
            warnings.append(f"Error verificando firmas: {e}")
            
        return warnings
        
    def _check_variable_usage(self, code: str) -> List[str]:
        """Verifica el uso de variables"""
        warnings = []
        
        try:
            tree = ast.parse(code)
            
            # Verificar variables no utilizadas
            assignments = {}
            usages = set()
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Assign):
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            assignments[target.id] = node.lineno
                elif isinstance(node, ast.Name):
                    usages.add(node.id)
                    
            for var_name, line_num in assignments.items():
                if var_name not in usages:
                    warnings.append(f"Variable '{var_name}' asignada en línea {line_num} pero no utilizada")
                    
        except Exception as e:
            warnings.append(f"Error verificando variables: {e}")
            
        return warnings
        
    def _check_logic(self, code: str) -> List[str]:
        """Verifica la lógica del código"""
        suggestions = []
        
        try:
            tree = ast.parse(code)
            
            # Verificar condiciones siempre verdaderas o falsas
            for node in ast.walk(tree):
                if isinstance(node, ast.If):
                    if isinstance(node.test, ast.Constant):
                        if node.test.value:
                            suggestions.append("Condición siempre verdadera detectada")
                        else:
                            suggestions.append("Condición siempre falsa detectada")
                            
            # Verificar bucles infinitos potenciales
            for node in ast.walk(tree):
                if isinstance(node, ast.While):
                    if isinstance(node.test, ast.Constant) and node.test.value:
                        suggestions.append("Posible bucle infinito detectado")
                        
        except Exception as e:
            suggestions.append(f"Error verificando lógica: {e}")
            
        return suggestions
        
    def _calculate_quality_metrics(self, code: str) -> List[CodeQualityMetric]:
        """Calcula métricas de calidad del código"""
        metrics = []
        
        try:
            tree = ast.parse(code)
            
            # Calcular líneas de código
            lines = len(code.split('\n'))
            metrics.append(CodeQualityMetric(
                name='lines_of_code',
                value=lines,
                threshold=500,
                status='pass' if lines <= 500 else 'fail',
                description=f'Código tiene {lines} líneas'
            ))
            
            # Calcular funciones
            functions = len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)])
            metrics.append(CodeQualityMetric(
                name='function_count',
                value=functions,
                threshold=20,
                status='pass' if functions <= 20 else 'fail',
                description=f'Código tiene {functions} funciones'
            ))
            
            # Calcular complejidad ciclomática
            complexity = self._calculate_cyclomatic_complexity(tree)
            metrics.append(CodeQualityMetric(
                name='cyclomatic_complexity',
                value=complexity,
                threshold=self.quality_thresholds['cyclomatic_complexity'],
                status='pass' if complexity <= self.quality_thresholds['cyclomatic_complexity'] else 'fail',
                description=f'Complejidad ciclomática: {complexity}'
            ))
            
            # Calcular profundidad de anidamiento
            max_depth = self._calculate_max_nesting_depth(tree)
            metrics.append(CodeQualityMetric(
                name='nesting_depth',
                value=max_depth,
                threshold=self.quality_thresholds['nesting_depth'],
                status='pass' if max_depth <= self.quality_thresholds['nesting_depth'] else 'fail',
                description=f'Profundidad máxima de anidamiento: {max_depth}'
            ))
            
            # Calcular cobertura de documentación
            doc_coverage = self._calculate_documentation_coverage(code)
            metrics.append(CodeQualityMetric(
                name='documentation_coverage',
                value=doc_coverage,
                threshold=self.quality_thresholds['documentation_coverage'],
                status='pass' if doc_coverage >= self.quality_thresholds['documentation_coverage'] else 'fail',
                description=f'Cobertura de documentación: {doc_coverage:.1f}%'
            ))
            
        except Exception as e:
            logger.error(f"Error calculando métricas: {e}")
            
        return metrics
        
    def _calculate_cyclomatic_complexity(self, tree: ast.AST) -> int:
        """Calcula la complejidad ciclomática"""
        complexity = 1
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.AsyncFor)):
                complexity += 1
            elif isinstance(node, ast.ExceptHandler):
                complexity += 1
            elif isinstance(node, ast.With):
                complexity += 1
            elif isinstance(node, ast.AsyncWith):
                complexity += 1
            elif isinstance(node, ast.Assert):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
                
        return complexity
        
    def _calculate_max_nesting_depth(self, tree: ast.AST) -> int:
        """Calcula la profundidad máxima de anidamiento"""
        max_depth = 0
        current_depth = 0
        
        def visit_node(node, depth):
            nonlocal max_depth
            max_depth = max(max_depth, depth)
            
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.If, ast.For, ast.While, ast.Try, ast.With)):
                    visit_node(child, depth + 1)
                else:
                    visit_node(child, depth)
                    
        visit_node(tree, 0)
        return max_depth
        
    def _calculate_documentation_coverage(self, code: str) -> float:
        """Calcula la cobertura de documentación"""
        lines = code.split('\n')
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
        
    def _compare_with_original(self, improved_code: str, original_code: str) -> Dict[str, Any]:
        """Compara el código mejorado con el original"""
        comparison = {}
        
        try:
            # Calcular métricas del código original
            original_tree = ast.parse(original_code)
            improved_tree = ast.parse(improved_code)
            
            # Comparar complejidad
            original_complexity = self._calculate_cyclomatic_complexity(original_tree)
            improved_complexity = self._calculate_cyclomatic_complexity(improved_tree)
            
            comparison['complexity_improvement'] = {
                'original': original_complexity,
                'improved': improved_complexity,
                'improvement': original_complexity - improved_complexity,
                'percentage': ((original_complexity - improved_complexity) / original_complexity * 100) if original_complexity > 0 else 0
            }
            
            # Comparar líneas de código
            original_lines = len(original_code.split('\n'))
            improved_lines = len(improved_code.split('\n'))
            
            comparison['lines_improvement'] = {
                'original': original_lines,
                'improved': improved_lines,
                'difference': improved_lines - original_lines,
                'percentage': ((improved_lines - original_lines) / original_lines * 100) if original_lines > 0 else 0
            }
            
            # Comparar funciones
            original_functions = len([node for node in ast.walk(original_tree) if isinstance(node, ast.FunctionDef)])
            improved_functions = len([node for node in ast.walk(improved_tree) if isinstance(node, ast.FunctionDef)])
            
            comparison['functions_improvement'] = {
                'original': original_functions,
                'improved': improved_functions,
                'difference': improved_functions - original_functions
            }
            
        except Exception as e:
            logger.error(f"Error comparando códigos: {e}")
            comparison['error'] = str(e)
            
        return comparison
        
    def _calculate_validation_score(self, issues: List[str], warnings: List[str], quality_metrics: List[CodeQualityMetric]) -> float:
        """Calcula la puntuación de validación"""
        score = 1.0
        
        # Penalizar por errores
        score -= len(issues) * 0.3
        
        # Penalizar por advertencias
        score -= len(warnings) * 0.1
        
        # Evaluar métricas de calidad
        failed_metrics = [m for m in quality_metrics if m.status == 'fail']
        score -= len(failed_metrics) * 0.05
        
        return max(0.0, min(1.0, score))
        
    def run_performance_tests(self, improved_code: str, original_code: str = None) -> List[PerformanceMetric]:
        """Ejecuta pruebas de rendimiento"""
        metrics = []
        
        try:
            # Crear archivos temporales para pruebas
            improved_file = self._create_temp_file(improved_code, "improved")
            original_file = self._create_temp_file(original_code, "original") if original_code else None
            
            # Medir tiempo de ejecución
            if original_file:
                original_time = self._measure_execution_time(original_file)
                improved_time = self._measure_execution_time(improved_file)
                
                metrics.append(PerformanceMetric(
                    name='execution_time',
                    before_value=original_time,
                    after_value=improved_time,
                    improvement=((original_time - improved_time) / original_time * 100) if original_time > 0 else 0,
                    unit='seconds'
                ))
                
            # Limpiar archivos temporales
            self._cleanup_temp_files([improved_file, original_file])
            
        except Exception as e:
            logger.error(f"Error en pruebas de rendimiento: {e}")
            
        return metrics
        
    def _create_temp_file(self, code: str, prefix: str) -> str:
        """Crea archivo temporal para pruebas"""
        import tempfile
        import os
        
        fd, path = tempfile.mkstemp(suffix='.py', prefix=f'lucia_test_{prefix}_')
        with os.fdopen(fd, 'w') as f:
            f.write(code)
        return path
        
    def _measure_execution_time(self, file_path: str) -> float:
        """Mide el tiempo de ejecución de un archivo"""
        try:
            import time
            start_time = time.time()
            
            result = subprocess.run([sys.executable, file_path], 
                                  capture_output=True, 
                                  timeout=10)
            
            end_time = time.time()
            return end_time - start_time
            
        except subprocess.TimeoutExpired:
            return 10.0  # Timeout
        except Exception as e:
            logger.error(f"Error midiendo tiempo de ejecución: {e}")
            return 0.0
            
    def _cleanup_temp_files(self, file_paths: List[str]):
        """Limpia archivos temporales"""
        import os
        
        for path in file_paths:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as e:
                    logger.error(f"Error eliminando archivo temporal {path}: {e}")
                    
    def generate_validation_report(self, validation_result: ValidationResult) -> str:
        """Genera reporte de validación"""
        report = f"""
📊 Reporte de Validación de LucIA

✅ Estado: {'VÁLIDO' if validation_result.is_valid else 'INVÁLIDO'}
📈 Puntuación: {validation_result.score:.2f}/1.00

🚨 Errores ({len(validation_result.issues)}):
"""
        
        if validation_result.issues:
            for issue in validation_result.issues:
                report += f"  • {issue}\n"
        else:
            report += "  • Ningún error encontrado\n"
            
        report += f"""
⚠️ Advertencias ({len(validation_result.warnings)}):
"""
        
        if validation_result.warnings:
            for warning in validation_result.warnings:
                report += f"  • {warning}\n"
        else:
            report += "  • Ninguna advertencia encontrada\n"
            
        report += f"""
💡 Sugerencias ({len(validation_result.suggestions)}):
"""
        
        if validation_result.suggestions:
            for suggestion in validation_result.suggestions:
                report += f"  • {suggestion}\n"
        else:
            report += "  • Ninguna sugerencia\n"
            
        # Métricas de calidad
        if 'quality' in validation_result.metrics:
            report += "\n📈 Métricas de Calidad:\n"
            for metric in validation_result.metrics['quality']:
                status_emoji = "✅" if metric.status == 'pass' else "❌"
                report += f"  {status_emoji} {metric.name}: {metric.value} (Umbral: {metric.threshold})\n"
                report += f"     {metric.description}\n"
                
        # Comparación con original
        if 'comparison' in validation_result.metrics:
            report += "\n🔄 Comparación con Código Original:\n"
            comparison = validation_result.metrics['comparison']
            
            if 'complexity_improvement' in comparison:
                comp = comparison['complexity_improvement']
                report += f"  • Complejidad: {comp['original']} → {comp['improved']} ({comp['improvement']:+d})\n"
                
            if 'lines_improvement' in comparison:
                lines = comparison['lines_improvement']
                report += f"  • Líneas: {lines['original']} → {lines['improved']} ({lines['difference']:+d})\n"
                
        return report.strip()
        
    def get_validation_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del motor de validación"""
        return {
            'quality_thresholds': len(self.quality_thresholds),
            'performance_benchmarks': len(self.performance_benchmarks),
            'validation_rules': len(self.validation_rules),
            'total_checks': len(self.validation_rules) + len(self.quality_thresholds)
        } 