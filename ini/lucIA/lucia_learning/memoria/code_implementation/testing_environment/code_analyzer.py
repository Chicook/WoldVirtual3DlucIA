#!/usr/bin/env python3
"""
Code Analyzer - Analizador de Código Propio de LucIA
Permite a LucIA analizar su propia implementación para identificar mejoras
"""

import ast
import inspect
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from pathlib import Path
import json
import re
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class CodeMetrics:
    """Métricas de código"""
    lines_of_code: int
    functions: int
    classes: int
    complexity: float
    maintainability_index: float
    cyclomatic_complexity: int
    code_duplication: float
    documentation_coverage: float
    test_coverage: float

@dataclass
class CodeIssue:
    """Problema detectado en el código"""
    type: str
    severity: str
    message: str
    line_number: int
    file_path: str
    suggestion: str
    impact: str

@dataclass
class ImprovementOpportunity:
    """Oportunidad de mejora detectada"""
    category: str
    description: str
    current_implementation: str
    suggested_improvement: str
    expected_benefit: str
    priority: str
    effort: str
    confidence: float

class CodeAnalyzer:
    """Analizador de código para auto-mejora de LucIA"""
    
    def __init__(self, code_path: str = "../code_implementation"):
        self.code_path = Path(code_path)
        self.analysis_results = {}
        self.issues_found = []
        self.improvement_opportunities = []
        
    def analyze_implementation(self) -> Dict[str, Any]:
        """Analiza toda la implementación de LucIA"""
        logger.info("🔍 Iniciando análisis completo de la implementación de LucIA")
        
        try:
            # Analizar cada archivo Python
            python_files = list(self.code_path.rglob("*.py"))
            
            for file_path in python_files:
                self._analyze_file(file_path)
                
            # Generar análisis general
            general_analysis = self._generate_general_analysis()
            
            # Detectar oportunidades de mejora
            self._detect_improvement_opportunities()
            
            # Generar reporte completo
            report = {
                "timestamp": datetime.now().isoformat(),
                "files_analyzed": len(python_files),
                "general_metrics": general_analysis,
                "issues_found": [issue.__dict__ for issue in self.issues_found],
                "improvement_opportunities": [opp.__dict__ for opp in self.improvement_opportunities],
                "recommendations": self._generate_recommendations()
            }
            
            self.analysis_results = report
            return report
            
        except Exception as e:
            logger.error(f"Error en análisis de implementación: {e}")
            return {"error": str(e)}
            
    def _analyze_file(self, file_path: Path):
        """Analiza un archivo específico"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Parsear AST
            tree = ast.parse(content)
            
            # Calcular métricas
            metrics = self._calculate_metrics(tree, content)
            
            # Detectar problemas
            issues = self._detect_issues(tree, content, file_path)
            
            # Almacenar resultados
            self.analysis_results[str(file_path)] = {
                "metrics": metrics.__dict__,
                "issues": [issue.__dict__ for issue in issues]
            }
            
            self.issues_found.extend(issues)
            
        except Exception as e:
            logger.error(f"Error analizando {file_path}: {e}")
            
    def _calculate_metrics(self, tree: ast.AST, content: str) -> CodeMetrics:
        """Calcula métricas del código"""
        # Contar líneas de código
        lines_of_code = len(content.split('\n'))
        
        # Contar funciones y clases
        functions = len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)])
        classes = len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)])
        
        # Calcular complejidad ciclomática
        cyclomatic_complexity = self._calculate_cyclomatic_complexity(tree)
        
        # Calcular complejidad general
        complexity = self._calculate_complexity(tree)
        
        # Calcular índice de mantenibilidad
        maintainability_index = self._calculate_maintainability_index(
            lines_of_code, cyclomatic_complexity, complexity
        )
        
        # Calcular duplicación de código
        code_duplication = self._calculate_code_duplication(content)
        
        # Calcular cobertura de documentación
        documentation_coverage = self._calculate_documentation_coverage(content)
        
        # Cobertura de pruebas (estimada)
        test_coverage = self._estimate_test_coverage()
        
        return CodeMetrics(
            lines_of_code=lines_of_code,
            functions=functions,
            classes=classes,
            complexity=complexity,
            maintainability_index=maintainability_index,
            cyclomatic_complexity=cyclomatic_complexity,
            code_duplication=code_duplication,
            documentation_coverage=documentation_coverage,
            test_coverage=test_coverage
        )
        
    def _calculate_cyclomatic_complexity(self, tree: ast.AST) -> int:
        """Calcula la complejidad ciclomática"""
        complexity = 1  # Base complexity
        
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
        
    def _calculate_complexity(self, tree: ast.AST) -> float:
        """Calcula complejidad general del código"""
        # Factores de complejidad
        factors = {
            'nesting_depth': self._calculate_max_nesting_depth(tree),
            'function_length': self._calculate_avg_function_length(tree),
            'parameter_count': self._calculate_avg_parameter_count(tree),
            'variable_count': self._calculate_variable_count(tree)
        }
        
        # Ponderación de factores
        weights = {
            'nesting_depth': 0.3,
            'function_length': 0.25,
            'parameter_count': 0.2,
            'variable_count': 0.25
        }
        
        complexity = sum(factors[key] * weights[key] for key in factors)
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
        
    def _calculate_avg_function_length(self, tree: ast.AST) -> float:
        """Calcula la longitud promedio de funciones"""
        functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        
        if not functions:
            return 0
            
        total_lines = sum(len(node.body) for node in functions)
        return total_lines / len(functions)
        
    def _calculate_avg_parameter_count(self, tree: ast.AST) -> float:
        """Calcula el número promedio de parámetros"""
        functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        
        if not functions:
            return 0
            
        total_params = sum(len(node.args.args) for node in functions)
        return total_params / len(functions)
        
    def _calculate_variable_count(self, tree: ast.AST) -> int:
        """Calcula el número de variables"""
        variables = set()
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        variables.add(target.id)
                        
        return len(variables)
        
    def _calculate_maintainability_index(self, loc: int, cc: int, complexity: float) -> float:
        """Calcula el índice de mantenibilidad"""
        # Fórmula simplificada del índice de mantenibilidad
        # MI = 171 - 5.2 * ln(HV) - 0.23 * (CC) - 16.2 * ln(LOC)
        # Donde HV = Halstead Volume, CC = Cyclomatic Complexity, LOC = Lines of Code
        
        # Estimación simplificada
        hv_factor = 5.2 * complexity  # Halstead Volume aproximado
        cc_factor = 0.23 * cc
        loc_factor = 16.2 * (loc ** 0.5)  # Log aproximado
        
        mi = 171 - hv_factor - cc_factor - loc_factor
        return max(0, min(100, mi))  # Normalizar entre 0 y 100
        
    def _calculate_code_duplication(self, content: str) -> float:
        """Calcula el porcentaje de duplicación de código"""
        lines = content.split('\n')
        line_hashes = {}
        duplicates = 0
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line and not line.startswith('#'):
                line_hash = hash(line)
                if line_hash in line_hashes:
                    duplicates += 1
                else:
                    line_hashes[line_hash] = i
                    
        total_lines = len([line for line in lines if line.strip() and not line.strip().startswith('#')])
        return (duplicates / total_lines * 100) if total_lines > 0 else 0
        
    def _calculate_documentation_coverage(self, content: str) -> float:
        """Calcula la cobertura de documentación"""
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
        
    def _estimate_test_coverage(self) -> float:
        """Estima la cobertura de pruebas"""
        # Estimación basada en la presencia de archivos de prueba
        test_files = list(self.code_path.rglob("*test*.py"))
        test_files.extend(list(self.code_path.rglob("*Test*.py")))
        
        if test_files:
            return min(80, len(test_files) * 20)  # Estimación optimista
        return 0
        
    def _detect_issues(self, tree: ast.AST, content: str, file_path: Path) -> List[CodeIssue]:
        """Detecta problemas en el código"""
        issues = []
        
        # Detectar funciones muy largas
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if len(node.body) > 50:
                    issues.append(CodeIssue(
                        type="long_function",
                        severity="warning",
                        message=f"Función '{node.name}' es muy larga ({len(node.body)} líneas)",
                        line_number=node.lineno,
                        file_path=str(file_path),
                        suggestion="Considera dividir la función en funciones más pequeñas",
                        impact="maintainability"
                    ))
                    
        # Detectar funciones con muchos parámetros
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if len(node.args.args) > 7:
                    issues.append(CodeIssue(
                        type="many_parameters",
                        severity="warning",
                        message=f"Función '{node.name}' tiene muchos parámetros ({len(node.args.args)})",
                        line_number=node.lineno,
                        file_path=str(file_path),
                        suggestion="Considera usar clases o estructuras de datos para agrupar parámetros",
                        impact="readability"
                    ))
                    
        # Detectar anidamiento excesivo
        max_depth = self._calculate_max_nesting_depth(tree)
        if max_depth > 5:
            issues.append(CodeIssue(
                type="deep_nesting",
                severity="warning",
                message=f"Anidamiento excesivo detectado (profundidad: {max_depth})",
                line_number=1,
                file_path=str(file_path),
                suggestion="Considera extraer funciones para reducir el anidamiento",
                impact="readability"
            ))
            
        # Detectar imports no utilizados
        imports = [node for node in ast.walk(tree) if isinstance(node, ast.Import)]
        imports.extend([node for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)])
        
        for imp in imports:
            # Verificación simplificada de imports no utilizados
            if isinstance(imp, ast.Import):
                for alias in imp.names:
                    if not self._is_import_used(alias.name, tree):
                        issues.append(CodeIssue(
                            type="unused_import",
                            severity="info",
                            message=f"Import '{alias.name}' posiblemente no utilizado",
                            line_number=imp.lineno,
                            file_path=str(file_path),
                            suggestion="Elimina el import si no se utiliza",
                            impact="cleanliness"
                        ))
                        
        return issues
        
    def _is_import_used(self, import_name: str, tree: ast.AST) -> bool:
        """Verifica si un import se utiliza"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and node.id == import_name:
                return True
        return False
        
    def _generate_general_analysis(self) -> Dict[str, Any]:
        """Genera análisis general de toda la implementación"""
        total_metrics = {
            'lines_of_code': 0,
            'functions': 0,
            'classes': 0,
            'complexity': 0,
            'maintainability_index': 0,
            'cyclomatic_complexity': 0,
            'code_duplication': 0,
            'documentation_coverage': 0,
            'test_coverage': 0
        }
        
        file_count = 0
        
        for file_data in self.analysis_results.values():
            if isinstance(file_data, dict) and 'metrics' in file_data:
                metrics = file_data['metrics']
                for key in total_metrics:
                    if key in metrics:
                        total_metrics[key] += metrics[key]
                file_count += 1
                
        # Calcular promedios
        if file_count > 0:
            for key in total_metrics:
                if key in ['maintainability_index', 'code_duplication', 'documentation_coverage', 'test_coverage']:
                    total_metrics[key] /= file_count
                    
        return total_metrics
        
    def _detect_improvement_opportunities(self):
        """Detecta oportunidades de mejora"""
        # Oportunidades basadas en métricas
        general_metrics = self._generate_general_analysis()
        
        # Mejora de mantenibilidad
        if general_metrics['maintainability_index'] < 70:
            self.improvement_opportunities.append(ImprovementOpportunity(
                category="maintainability",
                description="Índice de mantenibilidad bajo",
                current_implementation=f"MI: {general_metrics['maintainability_index']:.1f}",
                suggested_improvement="Refactorizar código para mejorar legibilidad y estructura",
                expected_benefit="Mayor facilidad de mantenimiento y desarrollo",
                priority="high",
                effort="medium",
                confidence=0.8
            ))
            
        # Reducción de complejidad
        if general_metrics['cyclomatic_complexity'] > 10:
            self.improvement_opportunities.append(ImprovementOpportunity(
                category="complexity",
                description="Complejidad ciclomática alta",
                current_implementation=f"CC: {general_metrics['cyclomatic_complexity']}",
                suggested_improvement="Simplificar lógica condicional y extraer métodos",
                expected_benefit="Código más fácil de entender y probar",
                priority="high",
                effort="medium",
                confidence=0.9
            ))
            
        # Mejora de documentación
        if general_metrics['documentation_coverage'] < 30:
            self.improvement_opportunities.append(ImprovementOpportunity(
                category="documentation",
                description="Cobertura de documentación baja",
                current_implementation=f"Documentación: {general_metrics['documentation_coverage']:.1f}%",
                suggested_improvement="Añadir docstrings y comentarios explicativos",
                expected_benefit="Mejor comprensión del código",
                priority="medium",
                effort="low",
                confidence=0.7
            ))
            
        # Reducción de duplicación
        if general_metrics['code_duplication'] > 15:
            self.improvement_opportunities.append(ImprovementOpportunity(
                category="duplication",
                description="Duplicación de código detectada",
                current_implementation=f"Duplicación: {general_metrics['code_duplication']:.1f}%",
                suggested_improvement="Extraer código común a funciones utilitarias",
                expected_benefit="Menos código duplicado y mejor mantenibilidad",
                priority="medium",
                effort="medium",
                confidence=0.8
            ))
            
        # Mejora de cobertura de pruebas
        if general_metrics['test_coverage'] < 50:
            self.improvement_opportunities.append(ImprovementOpportunity(
                category="testing",
                description="Cobertura de pruebas insuficiente",
                current_implementation=f"Pruebas: {general_metrics['test_coverage']:.1f}%",
                suggested_improvement="Implementar pruebas unitarias y de integración",
                expected_benefit="Mayor confiabilidad y detección temprana de errores",
                priority="high",
                effort="high",
                confidence=0.9
            ))
            
    def _generate_recommendations(self) -> List[str]:
        """Genera recomendaciones basadas en el análisis"""
        recommendations = []
        
        # Ordenar oportunidades por prioridad
        high_priority = [opp for opp in self.improvement_opportunities if opp.priority == "high"]
        medium_priority = [opp for opp in self.improvement_opportunities if opp.priority == "medium"]
        
        if high_priority:
            recommendations.append("🚨 Prioridad Alta:")
            for opp in high_priority[:3]:  # Top 3
                recommendations.append(f"  - {opp.description}")
                
        if medium_priority:
            recommendations.append("⚠️ Prioridad Media:")
            for opp in medium_priority[:3]:  # Top 3
                recommendations.append(f"  - {opp.description}")
                
        # Recomendaciones generales
        recommendations.extend([
            "📈 Considera implementar análisis de código continuo",
            "🔄 Establece un proceso de refactorización regular",
            "📚 Mejora la documentación del código",
            "🧪 Aumenta la cobertura de pruebas",
            "⚡ Optimiza el rendimiento de funciones críticas"
        ])
        
        return recommendations
        
    def get_analysis_summary(self) -> str:
        """Obtiene un resumen del análisis"""
        if not self.analysis_results:
            return "No hay análisis disponible"
            
        general_metrics = self._generate_general_analysis()
        
        summary = f"""
📊 Resumen del Análisis de LucIA

📁 Archivos analizados: {len([k for k in self.analysis_results.keys() if not k.startswith('error')])}
📏 Líneas de código: {general_metrics['lines_of_code']}
🔧 Funciones: {general_metrics['functions']}
🏗️ Clases: {general_metrics['classes']}
📈 Índice de mantenibilidad: {general_metrics['maintainability_index']:.1f}/100
🔄 Complejidad ciclomática: {general_metrics['cyclomatic_complexity']}
📝 Cobertura de documentación: {general_metrics['documentation_coverage']:.1f}%
🧪 Cobertura de pruebas: {general_metrics['test_coverage']:.1f}%
🔄 Duplicación de código: {general_metrics['code_duplication']:.1f}%

🚨 Problemas encontrados: {len(self.issues_found)}
💡 Oportunidades de mejora: {len(self.improvement_opportunities)}
        """
        
        return summary.strip()
        
    def export_analysis(self, format: str = "json") -> str:
        """Exporta el análisis en el formato especificado"""
        if format.lower() == "json":
            return json.dumps(self.analysis_results, indent=2, ensure_ascii=False)
        elif format.lower() == "summary":
            return self.get_analysis_summary()
        else:
            return "Formato no soportado. Use 'json' o 'summary'." 