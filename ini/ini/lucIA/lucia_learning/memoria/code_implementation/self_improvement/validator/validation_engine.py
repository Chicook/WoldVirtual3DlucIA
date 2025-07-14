#!/usr/bin/env python3
"""
Validation Engine - Motor de Validación para Auto-mejora de LucIA
Valida las mejoras generadas antes de su implementación
"""

import ast
import logging
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import re
from datetime import datetime
import subprocess
import sys

logger = logging.getLogger(__name__)

class ValidationEngine:
    """Motor de validación para el sistema de auto-mejora de LucIA"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.validation_results = []
        self.validation_rules = self._load_validation_rules()
        
    def _load_validation_rules(self) -> Dict[str, Any]:
        """Carga reglas de validación"""
        return {
            'syntax_check': {
                'enabled': True,
                'description': 'Verificar sintaxis del código',
                'weight': 1.0
            },
            'import_check': {
                'enabled': True,
                'description': 'Verificar imports válidos',
                'weight': 0.8
            },
            'function_signature_check': {
                'enabled': True,
                'description': 'Verificar firmas de funciones',
                'weight': 0.9
            },
            'variable_usage_check': {
                'enabled': True,
                'description': 'Verificar uso de variables',
                'weight': 0.7
            },
            'logic_check': {
                'enabled': True,
                'description': 'Verificar lógica básica',
                'weight': 0.6
            },
            'performance_check': {
                'enabled': True,
                'description': 'Verificar rendimiento',
                'weight': 0.5
            },
            'security_check': {
                'enabled': True,
                'description': 'Verificar seguridad',
                'weight': 0.9
            },
            'quality_check': {
                'enabled': True,
                'description': 'Verificar calidad del código',
                'weight': 0.8
            }
        }
        
    def validate_improvements(self, improvements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Valida todas las mejoras generadas"""
        logger.info("✅ Iniciando validación de mejoras")
        
        validation_results = []
        
        for improvement in improvements:
            validation_result = self._validate_single_improvement(improvement)
            validation_results.append(validation_result)
            
        self.validation_results = validation_results
        return validation_results
        
    def _validate_single_improvement(self, improvement: Dict[str, Any]) -> Dict[str, Any]:
        """Valida una mejora individual"""
        improvement_type = improvement.get('type', '')
        improved_code = improvement.get('improved_code', '')
        
        validation_result = {
            'improvement_type': improvement_type,
            'file_path': improvement.get('file_path', ''),
            'line_number': improvement.get('line_number'),
            'is_valid': True,
            'score': 0.0,
            'issues': [],
            'warnings': [],
            'suggestions': [],
            'validation_details': {},
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Validación de sintaxis
            if self.validation_rules['syntax_check']['enabled']:
                syntax_result = self._validate_syntax(improved_code)
                validation_result['validation_details']['syntax'] = syntax_result
                if not syntax_result['is_valid']:
                    validation_result['is_valid'] = False
                    validation_result['issues'].extend(syntax_result['issues'])
                    
            # Validación de imports
            if self.validation_rules['import_check']['enabled']:
                import_result = self._validate_imports(improved_code)
                validation_result['validation_details']['imports'] = import_result
                if not import_result['is_valid']:
                    validation_result['warnings'].extend(import_result['warnings'])
                    
            # Validación de firmas de funciones
            if self.validation_rules['function_signature_check']['enabled']:
                signature_result = self._validate_function_signatures(improved_code)
                validation_result['validation_details']['signatures'] = signature_result
                if not signature_result['is_valid']:
                    validation_result['issues'].extend(signature_result['issues'])
                    
            # Validación de uso de variables
            if self.validation_rules['variable_usage_check']['enabled']:
                variable_result = self._validate_variable_usage(improved_code)
                validation_result['validation_details']['variables'] = variable_result
                if not variable_result['is_valid']:
                    validation_result['warnings'].extend(variable_result['warnings'])
                    
            # Validación de lógica
            if self.validation_rules['logic_check']['enabled']:
                logic_result = self._validate_logic(improved_code)
                validation_result['validation_details']['logic'] = logic_result
                if not logic_result['is_valid']:
                    validation_result['issues'].extend(logic_result['issues'])
                    
            # Validación de rendimiento
            if self.validation_rules['performance_check']['enabled']:
                performance_result = self._validate_performance(improved_code)
                validation_result['validation_details']['performance'] = performance_result
                if not performance_result['is_valid']:
                    validation_result['warnings'].extend(performance_result['warnings'])
                    
            # Validación de seguridad
            if self.validation_rules['security_check']['enabled']:
                security_result = self._validate_security(improved_code)
                validation_result['validation_details']['security'] = security_result
                if not security_result['is_valid']:
                    validation_result['is_valid'] = False
                    validation_result['issues'].extend(security_result['issues'])
                    
            # Validación de calidad
            if self.validation_rules['quality_check']['enabled']:
                quality_result = self._validate_quality(improved_code)
                validation_result['validation_details']['quality'] = quality_result
                if not quality_result['is_valid']:
                    validation_result['warnings'].extend(quality_result['warnings'])
                    
            # Calcular puntuación final
            validation_result['score'] = self._calculate_validation_score(validation_result['validation_details'])
            
        except Exception as e:
            logger.error(f"Error validando mejora {improvement_type}: {e}")
            validation_result['is_valid'] = False
            validation_result['issues'].append(f"Error en validación: {e}")
            validation_result['score'] = 0.0
            
        return validation_result
        
    def _validate_syntax(self, code: str) -> Dict[str, Any]:
        """Valida sintaxis del código Python"""
        result = {
            'is_valid': True,
            'issues': [],
            'details': {}
        }
        
        try:
            ast.parse(code)
        except SyntaxError as e:
            result['is_valid'] = False
            result['issues'].append(f"Error de sintaxis en línea {e.lineno}: {e.msg}")
        except Exception as e:
            result['is_valid'] = False
            result['issues'].append(f"Error parseando código: {e}")
            
        return result
        
    def _validate_imports(self, code: str) -> Dict[str, Any]:
        """Valida imports del código"""
        result = {
            'is_valid': True,
            'warnings': [],
            'details': {}
        }
        
        try:
            tree = ast.parse(code)
            imports = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ''
                    for alias in node.names:
                        imports.append(f"{module}.{alias.name}")
                        
            # Verificar imports problemáticos
            problematic_imports = [
                'os', 'subprocess', 'sys', 'eval', 'exec'
            ]
            
            for imp in imports:
                if any(problematic in imp for problematic in problematic_imports):
                    result['warnings'].append(f"Import potencialmente problemático: {imp}")
                    
            result['details']['imports_found'] = imports
            
        except Exception as e:
            result['is_valid'] = False
            result['warnings'].append(f"Error validando imports: {e}")
            
        return result
        
    def _validate_function_signatures(self, code: str) -> Dict[str, Any]:
        """Valida firmas de funciones"""
        result = {
            'is_valid': True,
            'issues': [],
            'details': {}
        }
        
        try:
            tree = ast.parse(code)
            functions = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    func_info = {
                        'name': node.name,
                        'args': len(node.args.args),
                        'line': node.lineno
                    }
                    functions.append(func_info)
                    
                    # Verificar parámetros excesivos
                    if func_info['args'] > 7:
                        result['issues'].append(
                            f"Función '{func_info['name']}' tiene muchos parámetros ({func_info['args']})"
                        )
                        
            result['details']['functions'] = functions
            
        except Exception as e:
            result['is_valid'] = False
            result['issues'].append(f"Error validando firmas: {e}")
            
        return result
        
    def _validate_variable_usage(self, code: str) -> Dict[str, Any]:
        """Valida uso de variables"""
        result = {
            'is_valid': True,
            'warnings': [],
            'details': {}
        }
        
        try:
            tree = ast.parse(code)
            variables = set()
            used_variables = set()
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Name):
                    if isinstance(node.ctx, ast.Store):
                        variables.add(node.id)
                    elif isinstance(node.ctx, ast.Load):
                        used_variables.add(node.id)
                        
            # Verificar variables no utilizadas
            unused_variables = variables - used_variables
            if unused_variables:
                result['warnings'].append(f"Variables no utilizadas: {unused_variables}")
                
            result['details']['variables_defined'] = list(variables)
            result['details']['variables_used'] = list(used_variables)
            
        except Exception as e:
            result['is_valid'] = False
            result['warnings'].append(f"Error validando variables: {e}")
            
        return result
        
    def _validate_logic(self, code: str) -> Dict[str, Any]:
        """Valida lógica básica del código"""
        result = {
            'is_valid': True,
            'issues': [],
            'details': {}
        }
        
        try:
            tree = ast.parse(code)
            
            # Verificar returns faltantes en funciones
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    has_return = False
                    for child in ast.walk(node):
                        if isinstance(child, ast.Return):
                            has_return = True
                            break
                            
                    # Verificar si la función debería tener return
                    if not has_return and node.name.startswith('get_'):
                        result['issues'].append(f"Función '{node.name}' podría necesitar return")
                        
            # Verificar condiciones siempre verdaderas/falsas
            for node in ast.walk(tree):
                if isinstance(node, ast.If):
                    if isinstance(node.test, ast.Constant):
                        if node.test.value:
                            result['warnings'].append("Condición siempre verdadera detectada")
                        else:
                            result['warnings'].append("Condición siempre falsa detectada")
                            
        except Exception as e:
            result['is_valid'] = False
            result['issues'].append(f"Error validando lógica: {e}")
            
        return result
        
    def _validate_performance(self, code: str) -> Dict[str, Any]:
        """Valida rendimiento del código"""
        result = {
            'is_valid': True,
            'warnings': [],
            'details': {}
        }
        
        try:
            # Detectar patrones de rendimiento problemáticos
            performance_patterns = {
                'nested_loops': r'for\s+.*\s+in\s+.*:\s*\n.*for\s+.*\s+in\s+.*:',
                'inefficient_list_ops': r'\.append\(.*\)\s*\n.*\.append\(.*\)',
                'string_concatenation': r'(\w+)\s*\+\s*(\w+)\s*\+\s*(\w+)',
                'unnecessary_comprehension': r'\[.*\s+for\s+\w+\s+in\s+\w+\s+if\s+.*\]'
            }
            
            for pattern_name, pattern in performance_patterns.items():
                matches = re.finditer(pattern, code, re.MULTILINE)
                for match in matches:
                    result['warnings'].append(f"Patrón de rendimiento problemático: {pattern_name}")
                    
        except Exception as e:
            result['is_valid'] = False
            result['warnings'].append(f"Error validando rendimiento: {e}")
            
        return result
        
    def _validate_security(self, code: str) -> Dict[str, Any]:
        """Valida seguridad del código"""
        result = {
            'is_valid': True,
            'issues': [],
            'details': {}
        }
        
        try:
            # Patrones de seguridad problemáticos
            security_patterns = {
                'eval_usage': r'eval\s*\(',
                'exec_usage': r'exec\s*\(',
                'shell_command': r'subprocess\.call\s*\(\s*[\'"][^\'"]*[\'"]',
                'sql_injection': r'execute\s*\(\s*[\'"][^\'"]*\s*\+\s*\w+',
                'path_traversal': r'open\s*\(\s*\w+\s*\)',
                'hardcoded_credentials': r'(password|secret|key)\s*=\s*[\'"][^\'"]+[\'"]'
            }
            
            for pattern_name, pattern in security_patterns.items():
                matches = re.finditer(pattern, code, re.IGNORECASE)
                for match in matches:
                    result['is_valid'] = False
                    result['issues'].append(f"Problema de seguridad: {pattern_name}")
                    
        except Exception as e:
            result['is_valid'] = False
            result['issues'].append(f"Error validando seguridad: {e}")
            
        return result
        
    def _validate_quality(self, code: str) -> Dict[str, Any]:
        """Valida calidad del código"""
        result = {
            'is_valid': True,
            'warnings': [],
            'details': {}
        }
        
        try:
            tree = ast.parse(code)
            
            # Verificar funciones largas
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    if len(node.body) > 50:
                        result['warnings'].append(f"Función '{node.name}' es muy larga")
                        
            # Verificar anidamiento profundo
            max_depth = 0
            current_depth = 0
            
            def check_depth(node, depth):
                nonlocal max_depth
                max_depth = max(max_depth, depth)
                
                for child in ast.iter_child_nodes(node):
                    if isinstance(child, (ast.If, ast.For, ast.While, ast.Try, ast.With)):
                        check_depth(child, depth + 1)
                    else:
                        check_depth(child, depth)
                        
            check_depth(tree, 0)
            
            if max_depth > 5:
                result['warnings'].append(f"Anidamiento muy profundo (nivel {max_depth})")
                
            result['details']['max_nesting_depth'] = max_depth
            
        except Exception as e:
            result['is_valid'] = False
            result['warnings'].append(f"Error validando calidad: {e}")
            
        return result
        
    def _calculate_validation_score(self, validation_details: Dict[str, Any]) -> float:
        """Calcula puntuación de validación"""
        total_score = 0.0
        total_weight = 0.0
        
        for rule_name, rule_config in self.validation_rules.items():
            if rule_config['enabled']:
                weight = rule_config['weight']
                total_weight += weight
                
                if rule_name in validation_details:
                    rule_result = validation_details[rule_name]
                    if rule_result.get('is_valid', True):
                        total_score += weight
                    else:
                        # Penalizar por problemas
                        issues_count = len(rule_result.get('issues', []))
                        warnings_count = len(rule_result.get('warnings', []))
                        penalty = (issues_count * 0.3 + warnings_count * 0.1) * weight
                        total_score += max(0, weight - penalty)
                        
        return total_score / total_weight if total_weight > 0 else 0.0
        
    def run_comprehensive_validation(self, improvements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Ejecuta validación comprehensiva"""
        logger.info("🔍 Ejecutando validación comprehensiva")
        
        # Validar mejoras individuales
        validation_results = self.validate_improvements(improvements)
        
        # Calcular estadísticas
        total_improvements = len(validation_results)
        valid_improvements = sum(1 for result in validation_results if result.get('is_valid', False))
        average_score = sum(result.get('score', 0) for result in validation_results) / total_improvements if total_improvements > 0 else 0
        
        # Agrupar por tipo de problema
        issue_types = {}
        warning_types = {}
        
        for result in validation_results:
            for issue in result.get('issues', []):
                issue_type = issue.split(':')[0] if ':' in issue else 'general'
                issue_types[issue_type] = issue_types.get(issue_type, 0) + 1
                
            for warning in result.get('warnings', []):
                warning_type = warning.split(':')[0] if ':' in warning else 'general'
                warning_types[warning_type] = warning_types.get(warning_type, 0) + 1
                
        return {
            'summary': {
                'total_improvements': total_improvements,
                'valid_improvements': valid_improvements,
                'invalid_improvements': total_improvements - valid_improvements,
                'success_rate': valid_improvements / total_improvements if total_improvements > 0 else 0,
                'average_score': average_score
            },
            'issue_distribution': issue_types,
            'warning_distribution': warning_types,
            'validation_results': validation_results,
            'recommendations': self._generate_validation_recommendations(validation_results),
            'timestamp': datetime.now().isoformat()
        }
        
    def _generate_validation_recommendations(self, validation_results: List[Dict[str, Any]]) -> List[str]:
        """Genera recomendaciones basadas en resultados de validación"""
        recommendations = []
        
        # Contar tipos de problemas
        issue_counts = {}
        warning_counts = {}
        
        for result in validation_results:
            for issue in result.get('issues', []):
                issue_type = issue.split(':')[0] if ':' in issue else 'general'
                issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
                
            for warning in result.get('warnings', []):
                warning_type = warning.split(':')[0] if ':' in warning else 'general'
                warning_counts[warning_type] = warning_counts.get(warning_type, 0) + 1
                
        # Recomendaciones específicas
        if issue_counts.get('syntax', 0) > 0:
            recommendations.append("🔧 Corregir errores de sintaxis antes de implementar")
            
        if issue_counts.get('security', 0) > 0:
            recommendations.append("🛡️ Revisar problemas de seguridad críticos")
            
        if warning_counts.get('performance', 0) > 0:
            recommendations.append("⚡ Optimizar patrones de rendimiento problemáticos")
            
        if warning_counts.get('quality', 0) > 0:
            recommendations.append("📈 Mejorar calidad del código generado")
            
        # Recomendaciones generales
        valid_count = sum(1 for result in validation_results if result.get('is_valid', False))
        total_count = len(validation_results)
        
        if valid_count / total_count < 0.8:
            recommendations.append("⚠️ Revisar proceso de generación de mejoras")
            
        recommendations.extend([
            "✅ Implementar mejoras validadas gradualmente",
            "📊 Monitorear impacto de las mejoras implementadas",
            "🔄 Realizar validación continua del código"
        ])
        
        return recommendations
        
    def get_validation_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de validación"""
        if not self.validation_results:
            return {}
            
        stats = {
            'total_validations': len(self.validation_results),
            'valid_count': sum(1 for result in self.validation_results if result.get('is_valid', False)),
            'average_score': sum(result.get('score', 0) for result in self.validation_results) / len(self.validation_results),
            'issue_types': {},
            'warning_types': {}
        }
        
        for result in self.validation_results:
            for issue in result.get('issues', []):
                issue_type = issue.split(':')[0] if ':' in issue else 'general'
                stats['issue_types'][issue_type] = stats['issue_types'].get(issue_type, 0) + 1
                
            for warning in result.get('warnings', []):
                warning_type = warning.split(':')[0] if ':' in warning else 'general'
                stats['warning_types'][warning_type] = stats['warning_types'].get(warning_type, 0) + 1
                
        return stats 