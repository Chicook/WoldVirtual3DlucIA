#!/usr/bin/env python3
"""
Improvement Detector - Detector de Oportunidades de Mejora para LucIA
Identifica oportunidades específicas de mejora en el código de LucIA
"""

import ast
import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from pathlib import Path
import json
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class CodePattern:
    """Patrón de código identificado"""
    name: str
    description: str
    pattern: str
    severity: str
    impact: str
    suggestion: str

@dataclass
class PerformanceIssue:
    """Problema de rendimiento detectado"""
    type: str
    description: str
    location: str
    impact: str
    solution: str
    priority: str

@dataclass
class SecurityIssue:
    """Problema de seguridad detectado"""
    type: str
    description: str
    location: str
    risk_level: str
    mitigation: str
    priority: str

@dataclass
class ArchitectureIssue:
    """Problema de arquitectura detectado"""
    type: str
    description: str
    component: str
    impact: str
    recommendation: str
    priority: str

class ImprovementDetector:
    """Detector de oportunidades de mejora para LucIA"""
    
    def __init__(self):
        self.patterns = self._load_improvement_patterns()
        self.performance_patterns = self._load_performance_patterns()
        self.security_patterns = self._load_security_patterns()
        self.architecture_patterns = self._load_architecture_patterns()
        
    def _load_improvement_patterns(self) -> List[CodePattern]:
        """Carga patrones de mejora de código"""
        return [
            CodePattern(
                name="long_function",
                description="Función muy larga",
                pattern="function_length > 50",
                severity="warning",
                impact="maintainability",
                suggestion="Dividir en funciones más pequeñas"
            ),
            CodePattern(
                name="many_parameters",
                description="Demasiados parámetros",
                pattern="parameter_count > 7",
                severity="warning",
                impact="readability",
                suggestion="Usar clases o estructuras de datos"
            ),
            CodePattern(
                name="deep_nesting",
                description="Anidamiento excesivo",
                pattern="nesting_depth > 5",
                severity="warning",
                impact="readability",
                suggestion="Extraer funciones para reducir anidamiento"
            ),
            CodePattern(
                name="magic_numbers",
                description="Números mágicos",
                pattern="hardcoded_numbers",
                severity="info",
                impact="maintainability",
                suggestion="Definir constantes con nombres descriptivos"
            ),
            CodePattern(
                name="duplicate_code",
                description="Código duplicado",
                pattern="similar_code_blocks",
                severity="warning",
                impact="maintainability",
                suggestion="Extraer a función común"
            ),
            CodePattern(
                name="missing_docstrings",
                description="Falta documentación",
                pattern="no_docstring",
                severity="info",
                impact="documentation",
                suggestion="Añadir docstrings descriptivos"
            ),
            CodePattern(
                name="complex_conditionals",
                description="Condiciones complejas",
                pattern="complex_boolean_expressions",
                severity="warning",
                impact="readability",
                suggestion="Simplificar o extraer a variables"
            ),
            CodePattern(
                name="large_classes",
                description="Clases muy grandes",
                pattern="class_methods > 15",
                severity="warning",
                impact="maintainability",
                suggestion="Dividir en clases más pequeñas"
            ),
            CodePattern(
                name="inconsistent_naming",
                description="Nomenclatura inconsistente",
                pattern="naming_convention_violations",
                severity="info",
                impact="readability",
                suggestion="Seguir convenciones de nomenclatura"
            ),
            CodePattern(
                name="unused_variables",
                description="Variables no utilizadas",
                pattern="unused_assignments",
                severity="info",
                impact="cleanliness",
                suggestion="Eliminar variables no utilizadas"
            )
        ]
        
    def _load_performance_patterns(self) -> List[PerformanceIssue]:
        """Carga patrones de problemas de rendimiento"""
        return [
            PerformanceIssue(
                type="inefficient_loop",
                description="Bucle ineficiente detectado",
                location="loop_constructs",
                impact="execution_time",
                solution="Optimizar algoritmo o usar comprensiones",
                priority="medium"
            ),
            PerformanceIssue(
                type="memory_leak",
                description="Posible fuga de memoria",
                location="resource_management",
                impact="memory_usage",
                solution="Usar context managers o liberar recursos",
                priority="high"
            ),
            PerformanceIssue(
                type="expensive_operation",
                description="Operación costosa en bucle",
                location="nested_operations",
                impact="execution_time",
                solution="Mover operación fuera del bucle",
                priority="medium"
            ),
            PerformanceIssue(
                type="unnecessary_computation",
                description="Cálculo innecesario",
                location="redundant_operations",
                impact="execution_time",
                solution="Cachear resultados o evitar recálculo",
                priority="low"
            ),
            PerformanceIssue(
                type="large_data_structures",
                description="Estructuras de datos muy grandes",
                location="data_structures",
                impact="memory_usage",
                solution="Usar estructuras más eficientes o paginación",
                priority="medium"
            )
        ]
        
    def _load_security_patterns(self) -> List[SecurityIssue]:
        """Carga patrones de problemas de seguridad"""
        return [
            SecurityIssue(
                type="sql_injection",
                description="Posible inyección SQL",
                location="database_queries",
                risk_level="high",
                mitigation="Usar consultas parametrizadas",
                priority="high"
            ),
            SecurityIssue(
                type="path_traversal",
                description="Posible traversing de rutas",
                location="file_operations",
                risk_level="medium",
                mitigation="Validar y sanitizar rutas",
                priority="medium"
            ),
            SecurityIssue(
                type="information_disclosure",
                description="Posible divulgación de información",
                location="error_handling",
                risk_level="medium",
                mitigation="No exponer detalles internos en errores",
                priority="medium"
            ),
            SecurityIssue(
                type="insecure_random",
                description="Generación de números aleatorios insegura",
                location="random_generation",
                risk_level="low",
                mitigation="Usar secrets o random.SystemRandom",
                priority="low"
            ),
            SecurityIssue(
                type="hardcoded_credentials",
                description="Credenciales hardcodeadas",
                location="configuration",
                risk_level="high",
                mitigation="Usar variables de entorno o vault",
                priority="high"
            )
        ]
        
    def _load_architecture_patterns(self) -> List[ArchitectureIssue]:
        """Carga patrones de problemas de arquitectura"""
        return [
            ArchitectureIssue(
                type="tight_coupling",
                description="Acoplamiento fuerte entre componentes",
                component="module_dependencies",
                impact="maintainability",
                recommendation="Usar interfaces o inyección de dependencias",
                priority="high"
            ),
            ArchitectureIssue(
                type="god_object",
                description="Objeto que hace demasiadas cosas",
                component="large_classes",
                impact="maintainability",
                recommendation="Dividir responsabilidades en clases más pequeñas",
                priority="medium"
            ),
            ArchitectureIssue(
                type="circular_dependency",
                description="Dependencias circulares",
                component="imports",
                impact="maintainability",
                recommendation="Reestructurar para evitar dependencias circulares",
                priority="high"
            ),
            ArchitectureIssue(
                type="violation_of_srp",
                description="Violación del principio de responsabilidad única",
                component="classes",
                impact="maintainability",
                recommendation="Cada clase debe tener una sola responsabilidad",
                priority="medium"
            ),
            ArchitectureIssue(
                type="lack_of_abstraction",
                description="Falta de abstracción",
                component="concrete_implementations",
                impact="flexibility",
                recommendation="Introducir interfaces y abstracciones",
                priority="medium"
            )
        ]
        
    def find_improvement_opportunities(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Encuentra oportunidades de mejora basadas en el análisis"""
        opportunities = []
        
        # Analizar métricas generales
        general_metrics = analysis_results.get('general_metrics', {})
        opportunities.extend(self._analyze_general_metrics(general_metrics))
        
        # Analizar problemas específicos
        issues = analysis_results.get('issues_found', [])
        opportunities.extend(self._analyze_specific_issues(issues))
        
        # Analizar archivos individuales
        for file_path, file_data in analysis_results.items():
            if isinstance(file_data, dict) and 'metrics' in file_data:
                opportunities.extend(self._analyze_file_opportunities(file_path, file_data))
                
        return opportunities
        
    def _analyze_general_metrics(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analiza métricas generales para oportunidades"""
        opportunities = []
        
        # Análisis de mantenibilidad
        maintainability = metrics.get('maintainability_index', 0)
        if maintainability < 70:
            opportunities.append({
                'category': 'maintainability',
                'priority': 'high',
                'description': f'Índice de mantenibilidad bajo ({maintainability:.1f}/100)',
                'impact': 'Dificulta el mantenimiento y desarrollo futuro',
                'suggestions': [
                    'Refactorizar funciones largas',
                    'Simplificar lógica compleja',
                    'Mejorar documentación',
                    'Reducir acoplamiento entre módulos'
                ],
                'effort': 'medium',
                'confidence': 0.9
            })
            
        # Análisis de complejidad
        complexity = metrics.get('cyclomatic_complexity', 0)
        if complexity > 10:
            opportunities.append({
                'category': 'complexity',
                'priority': 'high',
                'description': f'Complejidad ciclomática alta ({complexity})',
                'impact': 'Código difícil de entender y probar',
                'suggestions': [
                    'Simplificar condiciones complejas',
                    'Extraer métodos para reducir anidamiento',
                    'Usar early returns',
                    'Dividir funciones grandes'
                ],
                'effort': 'medium',
                'confidence': 0.8
            })
            
        # Análisis de documentación
        documentation = metrics.get('documentation_coverage', 0)
        if documentation < 30:
            opportunities.append({
                'category': 'documentation',
                'priority': 'medium',
                'description': f'Cobertura de documentación baja ({documentation:.1f}%)',
                'impact': 'Dificulta la comprensión del código',
                'suggestions': [
                    'Añadir docstrings a todas las funciones',
                    'Documentar clases y métodos',
                    'Incluir ejemplos de uso',
                    'Explicar lógica compleja'
                ],
                'effort': 'low',
                'confidence': 0.7
            })
            
        # Análisis de pruebas
        test_coverage = metrics.get('test_coverage', 0)
        if test_coverage < 50:
            opportunities.append({
                'category': 'testing',
                'priority': 'high',
                'description': f'Cobertura de pruebas insuficiente ({test_coverage:.1f}%)',
                'impact': 'Riesgo de regresiones y bugs',
                'suggestions': [
                    'Implementar pruebas unitarias',
                    'Añadir pruebas de integración',
                    'Cubrir casos edge',
                    'Automatizar pruebas'
                ],
                'effort': 'high',
                'confidence': 0.9
            })
            
        return opportunities
        
    def _analyze_specific_issues(self, issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analiza problemas específicos para oportunidades"""
        opportunities = []
        
        # Agrupar problemas por tipo
        issue_types = {}
        for issue in issues:
            issue_type = issue.get('type', 'unknown')
            if issue_type not in issue_types:
                issue_types[issue_type] = []
            issue_types[issue_type].append(issue)
            
        # Analizar cada tipo de problema
        for issue_type, issue_list in issue_types.items():
            if len(issue_list) > 3:  # Si hay más de 3 problemas del mismo tipo
                opportunities.append({
                    'category': 'code_quality',
                    'priority': 'medium',
                    'description': f'Múltiples problemas de {issue_type} ({len(issue_list)} encontrados)',
                    'impact': 'Afecta la calidad general del código',
                    'suggestions': [
                        f'Establecer reglas para evitar {issue_type}',
                        'Implementar linting automático',
                        'Revisar código regularmente',
                        'Capacitar equipo en mejores prácticas'
                    ],
                    'effort': 'medium',
                    'confidence': 0.8
                })
                
        return opportunities
        
    def _analyze_file_opportunities(self, file_path: str, file_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analiza oportunidades específicas de un archivo"""
        opportunities = []
        metrics = file_data.get('metrics', {})
        issues = file_data.get('issues', [])
        
        # Oportunidades basadas en métricas del archivo
        if metrics.get('lines_of_code', 0) > 500:
            opportunities.append({
                'category': 'file_size',
                'priority': 'medium',
                'description': f'Archivo muy grande ({metrics["lines_of_code"]} líneas)',
                'impact': 'Dificulta la navegación y mantenimiento',
                'suggestions': [
                    'Dividir en módulos más pequeños',
                    'Extraer clases o funciones a archivos separados',
                    'Reorganizar estructura del código'
                ],
                'effort': 'medium',
                'confidence': 0.7,
                'file': file_path
            })
            
        if metrics.get('functions', 0) > 20:
            opportunities.append({
                'category': 'function_count',
                'priority': 'low',
                'description': f'Muchas funciones en un archivo ({metrics["functions"]})',
                'impact': 'Puede indicar falta de organización',
                'suggestions': [
                    'Agrupar funciones relacionadas',
                    'Crear módulos especializados',
                    'Usar clases para organizar funcionalidad'
                ],
                'effort': 'low',
                'confidence': 0.6,
                'file': file_path
            })
            
        return opportunities
        
    def detect_performance_issues(self, code_content: str) -> List[PerformanceIssue]:
        """Detecta problemas de rendimiento en el código"""
        issues = []
        
        # Detectar bucles ineficientes
        if re.search(r'for\s+.*\s+in\s+.*:\s*\n.*\s+for\s+.*\s+in', code_content):
            issues.append(self.performance_patterns[0])  # inefficient_loop
            
        # Detectar posibles fugas de memoria
        if re.search(r'open\(.*\)\s*(?!.*with)', code_content):
            issues.append(self.performance_patterns[1])  # memory_leak
            
        # Detectar operaciones costosas en bucles
        if re.search(r'for\s+.*:\s*\n.*\s+\.\w+\(\)', code_content):
            issues.append(self.performance_patterns[2])  # expensive_operation
            
        return issues
        
    def detect_security_issues(self, code_content: str) -> List[SecurityIssue]:
        """Detecta problemas de seguridad en el código"""
        issues = []
        
        # Detectar posibles inyecciones SQL
        if re.search(r'execute\(.*\+.*\)', code_content):
            issues.append(self.security_patterns[0])  # sql_injection
            
        # Detectar traversing de rutas
        if re.search(r'open\(.*\+.*\)', code_content):
            issues.append(self.security_patterns[1])  # path_traversal
            
        # Detectar información en errores
        if re.search(r'raise.*Exception.*str\(', code_content):
            issues.append(self.security_patterns[2])  # information_disclosure
            
        # Detectar números aleatorios inseguros
        if re.search(r'random\.\w+\(\)', code_content):
            issues.append(self.security_patterns[3])  # insecure_random
            
        # Detectar credenciales hardcodeadas
        if re.search(r'password\s*=\s*["\'][^"\']+["\']', code_content):
            issues.append(self.security_patterns[4])  # hardcoded_credentials
            
        return issues
        
    def detect_architecture_issues(self, code_content: str) -> List[ArchitectureIssue]:
        """Detecta problemas de arquitectura en el código"""
        issues = []
        
        # Detectar acoplamiento fuerte
        if re.search(r'import\s+\w+\s*,\s*\w+', code_content):
            issues.append(self.architecture_patterns[0])  # tight_coupling
            
        # Detectar objetos dios
        if re.search(r'class\s+\w+.*:\s*\n.*def\s+\w+.*:\s*\n.*def\s+\w+.*:\s*\n.*def\s+\w+', code_content):
            issues.append(self.architecture_patterns[1])  # god_object
            
        # Detectar dependencias circulares (simplificado)
        if re.search(r'from\s+\.\w+\s+import', code_content):
            issues.append(self.architecture_patterns[2])  # circular_dependency
            
        return issues
        
    def generate_improvement_plan(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Genera un plan de mejora basado en las oportunidades"""
        # Agrupar por prioridad
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        low_priority = [opp for opp in opportunities if opp.get('priority') == 'low']
        
        # Calcular esfuerzo total
        total_effort = self._calculate_total_effort(opportunities)
        
        # Generar timeline estimado
        timeline = self._estimate_timeline(opportunities)
        
        return {
            'summary': {
                'total_opportunities': len(opportunities),
                'high_priority': len(high_priority),
                'medium_priority': len(medium_priority),
                'low_priority': len(low_priority),
                'total_effort': total_effort,
                'estimated_timeline': timeline
            },
            'priorities': {
                'high': high_priority[:5],  # Top 5
                'medium': medium_priority[:5],  # Top 5
                'low': low_priority[:3]  # Top 3
            },
            'recommendations': self._generate_priority_recommendations(opportunities),
            'timeline': self._generate_detailed_timeline(opportunities)
        }
        
    def _calculate_total_effort(self, opportunities: List[Dict[str, Any]]) -> str:
        """Calcula el esfuerzo total requerido"""
        effort_mapping = {'low': 1, 'medium': 3, 'high': 5}
        total_points = 0
        
        for opp in opportunities:
            effort = opp.get('effort', 'medium')
            total_points += effort_mapping.get(effort, 3)
            
        if total_points <= 10:
            return 'bajo'
        elif total_points <= 25:
            return 'medio'
        else:
            return 'alto'
            
    def _estimate_timeline(self, opportunities: List[Dict[str, Any]]) -> str:
        """Estima el timeline para implementar mejoras"""
        high_priority_count = len([opp for opp in opportunities if opp.get('priority') == 'high'])
        
        if high_priority_count == 0:
            return '1-2 semanas'
        elif high_priority_count <= 3:
            return '2-4 semanas'
        elif high_priority_count <= 7:
            return '1-2 meses'
        else:
            return '2-3 meses'
            
    def _generate_priority_recommendations(self, opportunities: List[Dict[str, Any]]) -> List[str]:
        """Genera recomendaciones de prioridad"""
        recommendations = []
        
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        if high_priority:
            recommendations.append("🚨 Prioridad Alta - Implementar inmediatamente:")
            for opp in high_priority[:3]:
                recommendations.append(f"  • {opp['description']}")
                
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        if medium_priority:
            recommendations.append("⚠️ Prioridad Media - Planificar para próximas iteraciones:")
            for opp in medium_priority[:3]:
                recommendations.append(f"  • {opp['description']}")
                
        return recommendations
        
    def _generate_detailed_timeline(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Genera timeline detallado"""
        timeline = []
        
        # Semana 1: Problemas críticos
        critical_issues = [opp for opp in opportunities if opp.get('priority') == 'high' and opp.get('effort') == 'low']
        if critical_issues:
            timeline.append({
                'week': 1,
                'focus': 'Problemas críticos de bajo esfuerzo',
                'items': critical_issues[:3],
                'estimated_hours': 8
            })
            
        # Semana 2-3: Problemas de alta prioridad
        high_priority_medium_effort = [opp for opp in opportunities if opp.get('priority') == 'high' and opp.get('effort') == 'medium']
        if high_priority_medium_effort:
            timeline.append({
                'week': '2-3',
                'focus': 'Problemas de alta prioridad',
                'items': high_priority_medium_effort[:2],
                'estimated_hours': 16
            })
            
        # Semana 4-6: Problemas de media prioridad
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        if medium_priority:
            timeline.append({
                'week': '4-6',
                'focus': 'Problemas de media prioridad',
                'items': medium_priority[:3],
                'estimated_hours': 24
            })
            
        return timeline
        
    def get_detection_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del detector"""
        return {
            'patterns_loaded': len(self.patterns),
            'performance_patterns': len(self.performance_patterns),
            'security_patterns': len(self.security_patterns),
            'architecture_patterns': len(self.architecture_patterns),
            'total_patterns': len(self.patterns) + len(self.performance_patterns) + 
                             len(self.security_patterns) + len(self.architecture_patterns)
        } 