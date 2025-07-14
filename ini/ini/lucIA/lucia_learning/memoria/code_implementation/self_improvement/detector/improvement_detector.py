#!/usr/bin/env python3
"""
Improvement Detector - Detector de Mejoras para Auto-mejora de LucIA
Detecta oportunidades de mejora basadas en análisis de código
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class ImprovementDetector:
    """Detector de mejoras para el sistema de auto-mejora de LucIA"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.detected_opportunities = []
        self.improvement_patterns = self._load_improvement_patterns()
        
    def _load_improvement_patterns(self) -> Dict[str, Any]:
        """Carga patrones de mejora"""
        return {
            'performance': {
                'slow_loops': {
                    'pattern': r'for\s+\w+\s+in\s+range\(len\([^)]+\)\)',
                    'suggestion': 'Usar enumerate() en lugar de range(len())',
                    'priority': 'medium',
                    'impact': 'high'
                },
                'inefficient_string_concatenation': {
                    'pattern': r'(\w+)\s*\+\s*(\w+)\s*\+\s*(\w+)',
                    'suggestion': 'Usar f-strings o .join() para concatenación',
                    'priority': 'low',
                    'impact': 'medium'
                },
                'unnecessary_list_comprehension': {
                    'pattern': r'\[.*\s+for\s+\w+\s+in\s+\w+\s+if\s+.*\]',
                    'suggestion': 'Considerar usar generadores para grandes datasets',
                    'priority': 'medium',
                    'impact': 'medium'
                }
            },
            'maintainability': {
                'long_functions': {
                    'threshold': 50,
                    'suggestion': 'Dividir función en funciones más pequeñas',
                    'priority': 'high',
                    'impact': 'high'
                },
                'many_parameters': {
                    'threshold': 7,
                    'suggestion': 'Usar clase o estructura de datos para parámetros',
                    'priority': 'medium',
                    'impact': 'medium'
                },
                'deep_nesting': {
                    'threshold': 5,
                    'suggestion': 'Extraer funciones para reducir anidamiento',
                    'priority': 'high',
                    'impact': 'high'
                }
            },
            'readability': {
                'magic_numbers': {
                    'pattern': r'\b(\d{2,})\b',
                    'suggestion': 'Definir constantes con nombres descriptivos',
                    'priority': 'low',
                    'impact': 'medium'
                },
                'complex_conditions': {
                    'pattern': r'if\s+.*\s+and\s+.*\s+and\s+.*\s+and\s+.*:',
                    'suggestion': 'Simplificar condiciones usando variables intermedias',
                    'priority': 'medium',
                    'impact': 'medium'
                },
                'long_lines': {
                    'threshold': 120,
                    'suggestion': 'Dividir líneas largas para mejor legibilidad',
                    'priority': 'low',
                    'impact': 'low'
                }
            },
            'documentation': {
                'missing_docstrings': {
                    'suggestion': 'Añadir docstrings a funciones y clases',
                    'priority': 'medium',
                    'impact': 'medium'
                },
                'incomplete_comments': {
                    'suggestion': 'Mejorar comentarios explicativos',
                    'priority': 'low',
                    'impact': 'low'
                }
            },
            'error_handling': {
                'bare_except': {
                    'pattern': r'except:',
                    'suggestion': 'Especificar tipos de excepción',
                    'priority': 'high',
                    'impact': 'high'
                },
                'missing_error_handling': {
                    'suggestion': 'Añadir manejo de errores apropiado',
                    'priority': 'high',
                    'impact': 'high'
                }
            },
            'security': {
                'hardcoded_credentials': {
                    'pattern': r'(password|secret|key)\s*=\s*[\'"][^\'"]+[\'"]',
                    'suggestion': 'Usar variables de entorno para credenciales',
                    'priority': 'high',
                    'impact': 'high'
                },
                'sql_injection_risk': {
                    'pattern': r'execute\s*\(\s*[\'"][^\'"]*\s*\+\s*\w+',
                    'suggestion': 'Usar consultas parametrizadas',
                    'priority': 'high',
                    'impact': 'high'
                }
            }
        }
        
    def detect_improvements(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta oportunidades de mejora basadas en análisis"""
        logger.info("🔍 Detectando oportunidades de mejora")
        
        opportunities = []
        
        for file_path, file_analysis in analysis_results.get('file_analyses', {}).items():
            if 'error' in file_analysis:
                continue
                
            file_opportunities = self._analyze_file_for_improvements(file_path, file_analysis)
            opportunities.extend(file_opportunities)
            
        # Ordenar por prioridad e impacto
        opportunities = self._prioritize_opportunities(opportunities)
        
        self.detected_opportunities = opportunities
        return opportunities
        
    def _analyze_file_for_improvements(self, file_path: str, file_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analiza un archivo específico para detectar mejoras"""
        opportunities = []
        
        # Obtener contenido del archivo para análisis de patrones
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            return opportunities
            
        # Análisis de problemas detectados
        problems = file_analysis.get('problems_analysis', {})
        
        # Detectar mejoras basadas en problemas
        opportunities.extend(self._detect_from_problems(file_path, problems))
        
        # Detectar mejoras basadas en métricas
        metrics = file_analysis.get('metrics_analysis', {})
        opportunities.extend(self._detect_from_metrics(file_path, metrics))
        
        # Detectar mejoras basadas en patrones de código
        opportunities.extend(self._detect_from_patterns(file_path, content))
        
        # Detectar mejoras basadas en calidad
        quality = file_analysis.get('quality_analysis', {})
        opportunities.extend(self._detect_from_quality(file_path, quality))
        
        return opportunities
        
    def _detect_from_problems(self, file_path: str, problems: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta mejoras basadas en problemas encontrados"""
        opportunities = []
        
        # Funciones largas
        long_functions = problems.get('long_functions', [])
        for func in long_functions:
            opportunities.append({
                'file_path': file_path,
                'type': 'long_function',
                'category': 'maintainability',
                'description': f"Función '{func.get('name', '')}' es muy larga ({func.get('length', 0)} líneas)",
                'suggestion': 'Dividir en funciones más pequeñas',
                'priority': 'high',
                'impact': 'high',
                'effort': 'medium',
                'line_number': func.get('line_number'),
                'confidence': 0.9
            })
            
        # Muchos parámetros
        many_params = problems.get('many_parameters', [])
        for func in many_params:
            opportunities.append({
                'file_path': file_path,
                'type': 'many_parameters',
                'category': 'maintainability',
                'description': f"Función '{func.get('name', '')}' tiene muchos parámetros ({func.get('parameter_count', 0)})",
                'suggestion': 'Usar clase o estructura de datos para agrupar parámetros',
                'priority': 'medium',
                'impact': 'medium',
                'effort': 'medium',
                'line_number': func.get('line_number'),
                'confidence': 0.8
            })
            
        # Anidamiento profundo
        deep_nesting = problems.get('deep_nesting', [])
        for nesting in deep_nesting:
            opportunities.append({
                'file_path': file_path,
                'type': 'deep_nesting',
                'category': 'maintainability',
                'description': f"Anidamiento profundo detectado (profundidad: {nesting.get('depth', 0)})",
                'suggestion': 'Extraer funciones para reducir anidamiento',
                'priority': 'high',
                'impact': 'high',
                'effort': 'high',
                'line_number': nesting.get('line_number'),
                'confidence': 0.9
            })
            
        # Números mágicos
        magic_numbers = problems.get('magic_numbers', [])
        if magic_numbers:
            opportunities.append({
                'file_path': file_path,
                'type': 'magic_numbers',
                'category': 'readability',
                'description': f"Se encontraron {len(magic_numbers)} números mágicos",
                'suggestion': 'Definir constantes con nombres descriptivos',
                'priority': 'low',
                'impact': 'medium',
                'effort': 'low',
                'line_number': magic_numbers[0][1] if magic_numbers else None,
                'confidence': 0.7
            })
            
        return opportunities
        
    def _detect_from_metrics(self, file_path: str, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta mejoras basadas en métricas"""
        opportunities = []
        
        # Complejidad ciclomática alta
        complexity = metrics.get('cyclomatic_complexity', 0)
        if complexity > 10:
            opportunities.append({
                'file_path': file_path,
                'type': 'high_complexity',
                'category': 'maintainability',
                'description': f"Complejidad ciclomática alta ({complexity})",
                'suggestion': 'Simplificar lógica condicional usando early returns',
                'priority': 'high',
                'impact': 'high',
                'effort': 'medium',
                'confidence': 0.8
            })
            
        # Documentación baja
        doc_coverage = metrics.get('documentation_coverage', 0)
        if doc_coverage < 30:
            opportunities.append({
                'file_path': file_path,
                'type': 'low_documentation',
                'category': 'documentation',
                'description': f"Documentación baja ({doc_coverage:.1f}%)",
                'suggestion': 'Añadir docstrings y comentarios explicativos',
                'priority': 'medium',
                'impact': 'medium',
                'effort': 'low',
                'confidence': 0.9
            })
            
        # Duplicación de código
        duplication = metrics.get('code_duplication', 0)
        if duplication > 15:
            opportunities.append({
                'file_path': file_path,
                'type': 'code_duplication',
                'category': 'maintainability',
                'description': f"Duplicación de código alta ({duplication:.1f}%)",
                'suggestion': 'Extraer código duplicado a funciones comunes',
                'priority': 'medium',
                'impact': 'medium',
                'effort': 'high',
                'confidence': 0.7
            })
            
        return opportunities
        
    def _detect_from_patterns(self, file_path: str, content: str) -> List[Dict[str, Any]]:
        """Detecta mejoras basadas en patrones de código"""
        opportunities = []
        
        for category, patterns in self.improvement_patterns.items():
            for pattern_name, pattern_info in patterns.items():
                if 'pattern' in pattern_info:
                    matches = re.finditer(pattern_info['pattern'], content, re.MULTILINE)
                    for match in matches:
                        line_number = content[:match.start()].count('\n') + 1
                        opportunities.append({
                            'file_path': file_path,
                            'type': pattern_name,
                            'category': category,
                            'description': f"Patrón '{pattern_name}' detectado en línea {line_number}",
                            'suggestion': pattern_info['suggestion'],
                            'priority': pattern_info['priority'],
                            'impact': pattern_info['impact'],
                            'effort': self._estimate_effort(pattern_name),
                            'line_number': line_number,
                            'confidence': 0.8
                        })
                        
        return opportunities
        
    def _detect_from_quality(self, file_path: str, quality: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta mejoras basadas en análisis de calidad"""
        opportunities = []
        
        quality_score = quality.get('quality_score', 0)
        quality_level = quality.get('quality_level', 'unknown')
        
        if quality_score < 60:
            opportunities.append({
                'file_path': file_path,
                'type': 'low_quality',
                'category': 'quality',
                'description': f"Calidad de código baja (puntuación: {quality_score:.1f})",
                'suggestion': 'Implementar mejoras generales de calidad',
                'priority': 'high',
                'impact': 'high',
                'effort': 'high',
                'confidence': 0.8
            })
            
        # Detectar problemas específicos de calidad
        long_functions = quality.get('long_functions', [])
        if long_functions:
            opportunities.append({
                'file_path': file_path,
                'type': 'quality_long_functions',
                'category': 'quality',
                'description': f"Se encontraron {len(long_functions)} funciones largas",
                'suggestion': 'Refactorizar funciones largas',
                'priority': 'medium',
                'impact': 'medium',
                'effort': 'medium',
                'confidence': 0.7
            })
            
        return opportunities
        
    def _estimate_effort(self, improvement_type: str) -> str:
        """Estima el esfuerzo requerido para una mejora"""
        effort_mapping = {
            'long_function': 'medium',
            'many_parameters': 'medium',
            'deep_nesting': 'high',
            'magic_numbers': 'low',
            'high_complexity': 'medium',
            'low_documentation': 'low',
            'code_duplication': 'high',
            'performance_optimization': 'medium',
            'security_fix': 'high',
            'error_handling': 'medium'
        }
        
        return effort_mapping.get(improvement_type, 'medium')
        
    def _prioritize_opportunities(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prioriza oportunidades de mejora"""
        # Definir pesos de prioridad
        priority_weights = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        
        impact_weights = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        
        effort_weights = {
            'high': 1,  # Menor peso = mayor prioridad
            'medium': 2,
            'low': 3
        }
        
        # Calcular puntuación de prioridad
        for opportunity in opportunities:
            priority_score = (
                priority_weights.get(opportunity.get('priority', 'medium'), 2) *
                impact_weights.get(opportunity.get('impact', 'medium'), 2) *
                effort_weights.get(opportunity.get('effort', 'medium'), 2) *
                opportunity.get('confidence', 0.5)
            )
            opportunity['priority_score'] = priority_score
            
        # Ordenar por puntuación de prioridad (descendente)
        opportunities.sort(key=lambda x: x.get('priority_score', 0), reverse=True)
        
        return opportunities
        
    def generate_improvement_plan(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Genera un plan de mejora estructurado"""
        logger.info("📋 Generando plan de mejora")
        
        # Agrupar por categoría
        categories = {}
        for opp in opportunities:
            category = opp.get('category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append(opp)
            
        # Agrupar por prioridad
        priorities = {
            'high': [opp for opp in opportunities if opp.get('priority') == 'high'],
            'medium': [opp for opp in opportunities if opp.get('priority') == 'medium'],
            'low': [opp for opp in opportunities if opp.get('priority') == 'low']
        }
        
        # Calcular esfuerzo total
        effort_mapping = {'low': 1, 'medium': 3, 'high': 5}
        total_effort = sum(effort_mapping.get(opp.get('effort', 'medium'), 3) for opp in opportunities)
        
        # Generar timeline
        timeline = self._generate_timeline(opportunities)
        
        # Generar recomendaciones
        recommendations = self._generate_recommendations(opportunities)
        
        return {
            'summary': {
                'total_opportunities': len(opportunities),
                'high_priority': len(priorities['high']),
                'medium_priority': len(priorities['medium']),
                'low_priority': len(priorities['low']),
                'total_effort': total_effort,
                'estimated_time': total_effort * 2  # 2 horas por unidad de esfuerzo
            },
            'categories': categories,
            'priorities': priorities,
            'timeline': timeline,
            'recommendations': recommendations,
            'top_opportunities': opportunities[:10]  # Top 10
        }
        
    def _generate_timeline(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Genera timeline para implementar mejoras"""
        timeline = []
        
        # Agrupar por prioridad
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        low_priority = [opp for opp in opportunities if opp.get('priority') == 'low']
        
        current_week = 1
        
        # Semana 1-2: Mejoras de alta prioridad
        if high_priority:
            timeline.append({
                'week': f'{current_week}-{current_week + 1}',
                'focus': 'Mejoras de alta prioridad',
                'items': high_priority[:3],
                'estimated_hours': 16,
                'description': 'Implementar mejoras críticas de mantenibilidad y seguridad'
            })
            current_week += 2
            
        # Semana 3-4: Mejoras de media prioridad
        if medium_priority:
            timeline.append({
                'week': f'{current_week}-{current_week + 1}',
                'focus': 'Mejoras de media prioridad',
                'items': medium_priority[:3],
                'estimated_hours': 24,
                'description': 'Optimizar rendimiento y mejorar documentación'
            })
            current_week += 2
            
        # Semana 5-6: Mejoras de baja prioridad
        if low_priority:
            timeline.append({
                'week': f'{current_week}-{current_week + 1}',
                'focus': 'Mejoras de baja prioridad',
                'items': low_priority[:2],
                'estimated_hours': 16,
                'description': 'Mejoras menores de legibilidad y estilo'
            })
            
        return timeline
        
    def _generate_recommendations(self, opportunities: List[Dict[str, Any]]) -> List[str]:
        """Genera recomendaciones basadas en oportunidades"""
        recommendations = []
        
        # Contar tipos de problemas
        problem_counts = {}
        for opp in opportunities:
            opp_type = opp.get('type', '')
            problem_counts[opp_type] = problem_counts.get(opp_type, 0) + 1
            
        # Recomendaciones específicas
        if problem_counts.get('long_function', 0) > 0:
            recommendations.append("⚡ Priorizar refactorización de funciones largas")
            
        if problem_counts.get('deep_nesting', 0) > 0:
            recommendations.append("🔄 Implementar extracción de funciones para reducir anidamiento")
            
        if problem_counts.get('high_complexity', 0) > 0:
            recommendations.append("🧠 Simplificar lógica condicional")
            
        if problem_counts.get('low_documentation', 0) > 0:
            recommendations.append("📚 Mejorar documentación del código")
            
        if problem_counts.get('code_duplication', 0) > 0:
            recommendations.append("🔄 Eliminar código duplicado")
            
        # Recomendaciones generales
        recommendations.extend([
            "📈 Establecer métricas de seguimiento continuo",
            "🧪 Implementar pruebas automatizadas",
            "🔄 Realizar análisis periódicos de código",
            "📊 Monitorear tendencias de calidad"
        ])
        
        return recommendations
        
    def get_detection_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de detección"""
        if not self.detected_opportunities:
            return {}
            
        stats = {
            'total_opportunities': len(self.detected_opportunities),
            'categories': {},
            'priorities': {},
            'files_affected': set(),
            'average_confidence': 0
        }
        
        total_confidence = 0
        
        for opp in self.detected_opportunities:
            # Contar categorías
            category = opp.get('category', 'unknown')
            stats['categories'][category] = stats['categories'].get(category, 0) + 1
            
            # Contar prioridades
            priority = opp.get('priority', 'unknown')
            stats['priorities'][priority] = stats['priorities'].get(priority, 0) + 1
            
            # Archivos afectados
            stats['files_affected'].add(opp.get('file_path', ''))
            
            # Confianza promedio
            total_confidence += opp.get('confidence', 0)
            
        stats['average_confidence'] = total_confidence / len(self.detected_opportunities)
        stats['files_affected'] = len(stats['files_affected'])
        
        return stats 