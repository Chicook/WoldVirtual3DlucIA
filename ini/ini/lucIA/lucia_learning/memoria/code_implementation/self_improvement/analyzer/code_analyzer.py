#!/usr/bin/env python3
"""
Code Analyzer - Analizador de Código para Auto-mejora de LucIA
Analiza el código de LucIA para detectar oportunidades de mejora
"""

import ast
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import re
from datetime import datetime

# Importar utilidades del sistema de auto-mejora
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from memoria.self_improvement.core.utils import (
    calculate_code_hash, parse_python_file, count_functions, count_classes,
    calculate_cyclomatic_complexity, calculate_max_nesting_depth,
    calculate_documentation_coverage, calculate_code_duplication,
    detect_magic_numbers, detect_long_functions, detect_many_parameters,
    detect_unused_imports, calculate_maintainability_index,
    check_code_quality, generate_code_suggestions
)

logger = logging.getLogger(__name__)

class CodeAnalyzer:
    """Analizador de código para el sistema de auto-mejora de LucIA"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.analysis_results = {}
        self.file_hashes = {}
        
    def analyze_file(self, file_path: Path) -> Dict[str, Any]:
        """Analiza un archivo específico"""
        logger.info(f"🔍 Analizando archivo: {file_path}")
        
        try:
            # Verificar si el archivo existe
            if not file_path.exists():
                return {'error': f'Archivo no encontrado: {file_path}'}
                
            # Leer contenido del archivo
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Calcular hash del archivo
            file_hash = calculate_code_hash(content)
            self.file_hashes[str(file_path)] = file_hash
            
            # Parsear AST
            tree = parse_python_file(file_path)
            if tree is None:
                return {'error': f'Error parseando archivo: {file_path}'}
                
            # Análisis básico
            basic_analysis = self._perform_basic_analysis(content, tree)
            
            # Análisis de calidad
            quality_analysis = check_code_quality(content)
            
            # Análisis de problemas
            problems_analysis = self._detect_problems(content, tree)
            
            # Análisis de métricas
            metrics_analysis = self._calculate_metrics(content, tree)
            
            # Combinar resultados
            analysis_result = {
                'file_path': str(file_path),
                'file_size': len(content),
                'lines_of_code': len(content.split('\n')),
                'last_modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                'file_hash': file_hash,
                'basic_analysis': basic_analysis,
                'quality_analysis': quality_analysis,
                'problems_analysis': problems_analysis,
                'metrics_analysis': metrics_analysis,
                'suggestions': generate_code_suggestions(quality_analysis),
                'timestamp': datetime.now().isoformat()
            }
            
            self.analysis_results[str(file_path)] = analysis_result
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analizando {file_path}: {e}")
            return {'error': str(e)}
            
    def _perform_basic_analysis(self, content: str, tree: ast.AST) -> Dict[str, Any]:
        """Realiza análisis básico del código"""
        return {
            'functions': count_functions(tree),
            'classes': count_classes(tree),
            'imports': self._count_imports(tree),
            'comments': self._count_comments(content),
            'blank_lines': self._count_blank_lines(content),
            'total_lines': len(content.split('\n'))
        }
        
    def _count_imports(self, tree: ast.AST) -> int:
        """Cuenta el número de imports"""
        import_count = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                import_count += 1
        return import_count
        
    def _count_comments(self, content: str) -> int:
        """Cuenta el número de comentarios"""
        lines = content.split('\n')
        comment_count = 0
        
        for line in lines:
            line = line.strip()
            if line.startswith('#'):
                comment_count += 1
            elif '"""' in line or "'''" in line:
                comment_count += 1
                
        return comment_count
        
    def _count_blank_lines(self, content: str) -> int:
        """Cuenta líneas en blanco"""
        lines = content.split('\n')
        return sum(1 for line in lines if not line.strip())
        
    def _detect_problems(self, content: str, tree: ast.AST) -> Dict[str, Any]:
        """Detecta problemas en el código"""
        problems = {
            'long_functions': detect_long_functions(tree),
            'many_parameters': detect_many_parameters(tree),
            'magic_numbers': detect_magic_numbers(content),
            'unused_imports': detect_unused_imports(tree),
            'deep_nesting': self._detect_deep_nesting(tree),
            'complex_conditions': self._detect_complex_conditions(tree),
            'code_smells': self._detect_code_smells(content, tree)
        }
        
        return problems
        
    def _detect_deep_nesting(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Detecta anidamiento profundo"""
        deep_nesting = []
        max_depth = self.config.get('nesting_threshold', 5)
        
        def check_nesting(node, depth=0, path=None):
            if path is None:
                path = []
                
            if depth > max_depth:
                deep_nesting.append({
                    'type': 'deep_nesting',
                    'depth': depth,
                    'path': path.copy(),
                    'line_number': getattr(node, 'lineno', 0)
                })
                
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.If, ast.For, ast.While, ast.Try, ast.With)):
                    check_nesting(child, depth + 1, path + [type(child).__name__])
                else:
                    check_nesting(child, depth, path)
                    
        check_nesting(tree)
        return deep_nesting
        
    def _detect_complex_conditions(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Detecta condiciones complejas"""
        complex_conditions = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.If):
                condition_str = ast.unparse(node.test) if hasattr(ast, 'unparse') else str(node.test)
                if len(condition_str.split()) > 10:  # Condición muy larga
                    complex_conditions.append({
                        'type': 'complex_condition',
                        'line_number': node.lineno,
                        'condition': condition_str,
                        'complexity': len(condition_str.split())
                    })
                    
        return complex_conditions
        
    def _detect_code_smells(self, content: str, tree: ast.AST) -> List[Dict[str, Any]]:
        """Detecta code smells"""
        smells = []
        
        # Detectar funciones muy largas
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if len(node.body) > 50:
                    smells.append({
                        'type': 'long_function',
                        'name': node.name,
                        'line_number': node.lineno,
                        'length': len(node.body)
                    })
                    
        # Detectar clases muy grandes
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                methods = [child for child in node.body if isinstance(child, ast.FunctionDef)]
                if len(methods) > 15:
                    smells.append({
                        'type': 'large_class',
                        'name': node.name,
                        'line_number': node.lineno,
                        'method_count': len(methods)
                    })
                    
        # Detectar duplicación de código (simplificado)
        lines = content.split('\n')
        line_frequency = {}
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                line_frequency[line] = line_frequency.get(line, 0) + 1
                
        duplicated_lines = [line for line, count in line_frequency.items() if count > 3]
        if duplicated_lines:
            smells.append({
                'type': 'code_duplication',
                'duplicated_lines': len(duplicated_lines),
                'examples': duplicated_lines[:3]
            })
            
        return smells
        
    def _calculate_metrics(self, content: str, tree: ast.AST) -> Dict[str, Any]:
        """Calcula métricas del código"""
        return {
            'cyclomatic_complexity': calculate_cyclomatic_complexity(tree),
            'max_nesting_depth': calculate_max_nesting_depth(tree),
            'documentation_coverage': calculate_documentation_coverage(content),
            'code_duplication': calculate_code_duplication(content),
            'maintainability_index': calculate_maintainability_index(
                len(content.split('\n')),
                calculate_cyclomatic_complexity(tree),
                calculate_cyclomatic_complexity(tree)  # Simplificado
            ),
            'lines_per_function': self._calculate_lines_per_function(tree),
            'parameters_per_function': self._calculate_parameters_per_function(tree)
        }
        
    def _calculate_lines_per_function(self, tree: ast.AST) -> float:
        """Calcula promedio de líneas por función"""
        functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        if not functions:
            return 0
            
        total_lines = sum(len(node.body) for node in functions)
        return total_lines / len(functions)
        
    def _calculate_parameters_per_function(self, tree: ast.AST) -> float:
        """Calcula promedio de parámetros por función"""
        functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        if not functions:
            return 0
            
        total_params = sum(len(node.args.args) for node in functions)
        return total_params / len(functions)
        
    def analyze_multiple_files(self, file_paths: List[Path]) -> Dict[str, Any]:
        """Analiza múltiples archivos"""
        logger.info(f"🔍 Analizando {len(file_paths)} archivos")
        
        results = {
            'files_analyzed': 0,
            'files_with_errors': 0,
            'total_analysis_time': 0,
            'file_analyses': {},
            'summary': {},
            'timestamp': datetime.now().isoformat()
        }
        
        start_time = datetime.now()
        
        for file_path in file_paths:
            try:
                analysis = self.analyze_file(file_path)
                results['file_analyses'][str(file_path)] = analysis
                
                if 'error' in analysis:
                    results['files_with_errors'] += 1
                else:
                    results['files_analyzed'] += 1
                    
            except Exception as e:
                logger.error(f"Error analizando {file_path}: {e}")
                results['files_with_errors'] += 1
                results['file_analyses'][str(file_path)] = {'error': str(e)}
                
        results['total_analysis_time'] = (datetime.now() - start_time).total_seconds()
        
        # Generar resumen
        results['summary'] = self._generate_summary(results['file_analyses'])
        
        return results
        
    def _generate_summary(self, file_analyses: Dict[str, Any]) -> Dict[str, Any]:
        """Genera resumen de todos los análisis"""
        summary = {
            'total_files': len(file_analyses),
            'total_lines': 0,
            'total_functions': 0,
            'total_classes': 0,
            'average_complexity': 0,
            'average_documentation': 0,
            'total_problems': 0,
            'problem_distribution': {},
            'quality_distribution': {}
        }
        
        valid_analyses = [analysis for analysis in file_analyses.values() if 'error' not in analysis]
        
        if not valid_analyses:
            return summary
            
        # Calcular totales
        for analysis in valid_analyses:
            summary['total_lines'] += analysis.get('lines_of_code', 0)
            summary['total_functions'] += analysis.get('basic_analysis', {}).get('functions', 0)
            summary['total_classes'] += analysis.get('basic_analysis', {}).get('classes', 0)
            
            # Contar problemas
            problems = analysis.get('problems_analysis', {})
            for problem_type, problem_list in problems.items():
                if isinstance(problem_list, list):
                    summary['total_problems'] += len(problem_list)
                    summary['problem_distribution'][problem_type] = summary['problem_distribution'].get(problem_type, 0) + len(problem_list)
                    
            # Calcular promedios
            metrics = analysis.get('metrics_analysis', {})
            summary['average_complexity'] += metrics.get('cyclomatic_complexity', 0)
            summary['average_documentation'] += metrics.get('documentation_coverage', 0)
            
        # Finalizar promedios
        summary['average_complexity'] /= len(valid_analyses)
        summary['average_documentation'] /= len(valid_analyses)
        
        # Distribución de calidad
        for analysis in valid_analyses:
            quality = analysis.get('quality_analysis', {})
            quality_level = quality.get('quality_level', 'unknown')
            summary['quality_distribution'][quality_level] = summary['quality_distribution'].get(quality_level, 0) + 1
            
        return summary
        
    def get_analysis_results(self) -> Dict[str, Any]:
        """Obtiene todos los resultados de análisis"""
        return self.analysis_results
        
    def get_file_hash(self, file_path: str) -> Optional[str]:
        """Obtiene el hash de un archivo"""
        return self.file_hashes.get(file_path)
        
    def has_file_changed(self, file_path: str) -> bool:
        """Verifica si un archivo ha cambiado"""
        if file_path not in self.file_hashes:
            return True
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                current_hash = calculate_code_hash(f.read())
            return current_hash != self.file_hashes[file_path]
        except Exception:
            return True
            
    def generate_analysis_report(self) -> str:
        """Genera reporte de análisis"""
        if not self.analysis_results:
            return "No hay resultados de análisis disponibles"
            
        report = f"""
📊 Reporte de Análisis de Código - LucIA
{'='*50}

📁 Archivos analizados: {len(self.analysis_results)}
⏱️ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

📈 Resumen General:
"""
        
        # Calcular estadísticas
        total_lines = sum(analysis.get('lines_of_code', 0) for analysis in self.analysis_results.values() if 'error' not in analysis)
        total_functions = sum(analysis.get('basic_analysis', {}).get('functions', 0) for analysis in self.analysis_results.values() if 'error' not in analysis)
        total_classes = sum(analysis.get('basic_analysis', {}).get('classes', 0) for analysis in self.analysis_results.values() if 'error' not in analysis)
        
        report += f"   • Líneas de código totales: {total_lines:,}\n"
        report += f"   • Funciones totales: {total_functions}\n"
        report += f"   • Clases totales: {total_classes}\n"
        
        # Problemas detectados
        total_problems = 0
        problem_types = {}
        
        for analysis in self.analysis_results.values():
            if 'error' not in analysis:
                problems = analysis.get('problems_analysis', {})
                for problem_type, problem_list in problems.items():
                    if isinstance(problem_list, list):
                        count = len(problem_list)
                        total_problems += count
                        problem_types[problem_type] = problem_types.get(problem_type, 0) + count
                        
        report += f"   • Problemas detectados: {total_problems}\n"
        
        if problem_types:
            report += "\n🚨 Distribución de problemas:\n"
            for problem_type, count in sorted(problem_types.items(), key=lambda x: x[1], reverse=True):
                report += f"   • {problem_type}: {count}\n"
                
        # Archivos con problemas
        files_with_problems = []
        for file_path, analysis in self.analysis_results.items():
            if 'error' not in analysis:
                problems = analysis.get('problems_analysis', {})
                total_file_problems = sum(len(problem_list) for problem_list in problems.values() if isinstance(problem_list, list))
                if total_file_problems > 0:
                    files_with_problems.append((file_path, total_file_problems))
                    
        if files_with_problems:
            report += "\n📁 Archivos con más problemas:\n"
            for file_path, count in sorted(files_with_problems, key=lambda x: x[1], reverse=True)[:5]:
                report += f"   • {Path(file_path).name}: {count} problemas\n"
                
        return report
        
    def export_analysis_results(self, output_path: Path) -> str:
        """Exporta resultados de análisis a archivo"""
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.generate_analysis_report())
                
            return f"Reporte exportado a: {output_path}"
            
        except Exception as e:
            logger.error(f"Error exportando resultados: {e}")
            return f"Error exportando resultados: {e}" 