#!/usr/bin/env python3
"""
Config - Configuración del Sistema de Auto-mejora de LucIA
Configuración centralizada para el sistema de auto-mejora integrado
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

class ImprovementPriority(Enum):
    """Prioridades de mejora"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ImprovementCategory(Enum):
    """Categorías de mejora"""
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"
    DOCUMENTATION = "documentation"
    SECURITY = "security"
    FUNCTIONALITY = "functionality"
    ARCHITECTURE = "architecture"

@dataclass
class AnalysisConfig:
    """Configuración para análisis de código"""
    max_file_size: int = 10000
    complexity_threshold: int = 10
    maintainability_threshold: int = 70
    documentation_threshold: float = 30.0
    test_coverage_threshold: float = 50.0
    max_files_per_analysis: int = 50

@dataclass
class ImprovementConfig:
    """Configuración para generación de mejoras"""
    max_improvements_per_run: int = 10
    validation_threshold: float = 0.7
    backup_before_improvements: bool = True
    rollback_on_failure: bool = True
    max_improvement_size: int = 1000

@dataclass
class ValidationConfig:
    """Configuración para validación"""
    syntax_check: bool = True
    functionality_check: bool = True
    performance_check: bool = True
    security_check: bool = True
    style_check: bool = True

class SelfImprovementConfig:
    """Configuración principal del sistema de auto-mejora"""
    
    def __init__(self):
        # Configuraciones específicas
        self.analysis = AnalysisConfig()
        self.improvement = ImprovementConfig()
        self.validation = ValidationConfig()
        
        # Configuración general
        self.general = {
            'log_level': 'INFO',
            'max_log_size': 10 * 1024 * 1024,  # 10MB
            'backup_retention_days': 30,
            'results_retention_days': 90,
            'auto_run_interval_hours': 24,
            'max_concurrent_improvements': 3
        }
        
        # Configuración de métricas
        self.metrics = {
            'performance_targets': {
                'execution_time_ms': 1000,
                'memory_usage_mb': 100,
                'cpu_usage_percent': 80
            },
            'quality_targets': {
                'maintainability_index': 70,
                'cyclomatic_complexity': 10,
                'lines_per_function': 50,
                'documentation_coverage': 30,
                'test_coverage': 50
            },
            'evolution_targets': {
                'improvement_rate_percent': 10,
                'response_time_ms': 2000,
                'analysis_accuracy_percent': 85,
                'success_rate_percent': 90
            }
        }
        
        # Configuración de seguridad
        self.security = {
            'max_code_changes_per_run': 5,
            'require_human_approval': False,
            'allowed_file_extensions': ['.py', '.js', '.ts', '.java', '.cpp'],
            'forbidden_patterns': [
                'import os',
                'subprocess.call',
                'eval(',
                'exec(',
                '__import__'
            ],
            'backup_required': True,
            'validation_required': True
        }
        
        # Configuración de archivos
        self.files = {
            'lucia_core_files': [
                'lucia_core.py',
                'memory.py',
                'paraphraser.py',
                'api_manager.py',
                'lucia_platform_leader.py',
                'platform_leader.py',
                'code_paraphraser.py',
                'config.py',
                'lucIA.py'
            ],
            'excluded_patterns': [
                '__pycache__',
                '.git',
                'node_modules',
                'venv',
                'env',
                '.env'
            ],
            'max_file_size_kb': 1000
        }
        
        # Configuración de patrones de mejora
        self.improvement_patterns = {
            'complexity_reduction': {
                'description': 'Reducir complejidad del código',
                'priority': ImprovementPriority.HIGH,
                'category': ImprovementCategory.MAINTAINABILITY,
                'patterns': [
                    'if.*and.*and',
                    'for.*for.*for',
                    'try.*except.*except',
                    'def.*def.*def'
                ]
            },
            'documentation_improvement': {
                'description': 'Mejorar documentación',
                'priority': ImprovementPriority.MEDIUM,
                'category': ImprovementCategory.DOCUMENTATION,
                'patterns': [
                    'def [^:]+:$',
                    'class [^:]+:$',
                    'import [^#]+$'
                ]
            },
            'performance_optimization': {
                'description': 'Optimizar rendimiento',
                'priority': ImprovementPriority.HIGH,
                'category': ImprovementCategory.PERFORMANCE,
                'patterns': [
                    'for.*in.*range',
                    'list\\(.*\\)',
                    'dict\\(.*\\)',
                    'sum\\(.*\\)'
                ]
            },
            'error_handling': {
                'description': 'Mejorar manejo de errores',
                'priority': ImprovementPriority.MEDIUM,
                'category': ImprovementCategory.FUNCTIONALITY,
                'patterns': [
                    'except:',
                    'except Exception:',
                    'raise [^E]'
                ]
            }
        }
        
        # Configuración de validación de código
        self.code_validation = {
            'python': {
                'syntax_check': True,
                'import_check': True,
                'function_check': True,
                'class_check': True,
                'indentation_check': True
            },
            'javascript': {
                'syntax_check': True,
                'function_check': True,
                'variable_check': True,
                'semicolon_check': True
            },
            'typescript': {
                'syntax_check': True,
                'type_check': True,
                'interface_check': True,
                'import_check': True
            }
        }
        
        # Configuración de métricas de calidad
        self.quality_metrics = {
            'maintainability': {
                'weight': 0.3,
                'threshold': 70,
                'calculation': 'halstead_volume + cyclomatic_complexity'
            },
            'reliability': {
                'weight': 0.25,
                'threshold': 80,
                'calculation': 'error_rate + exception_handling'
            },
            'testability': {
                'weight': 0.2,
                'threshold': 60,
                'calculation': 'test_coverage + function_size'
            },
            'reusability': {
                'weight': 0.15,
                'threshold': 50,
                'calculation': 'coupling + cohesion'
            },
            'understandability': {
                'weight': 0.1,
                'threshold': 75,
                'calculation': 'documentation + naming'
            }
        }
        
        # Configuración de evolución
        self.evolution = {
            'learning_rate': 0.1,
            'adaptation_threshold': 0.8,
            'improvement_memory_size': 1000,
            'pattern_recognition': True,
            'auto_optimization': True,
            'personality_evolution': True
        }
        
        # Configuración de costes
        self.costs = {
            'api_calls_per_day': 1000,
            'max_cost_per_month': 100.0,
            'optimization_target': 0.2,  # 20% reducción
            'cost_tracking': True,
            'budget_alerts': True
        }
        
    def get_config(self) -> Dict[str, Any]:
        """Obtiene toda la configuración como diccionario"""
        return {
            'analysis': self.analysis.__dict__,
            'improvement': self.improvement.__dict__,
            'validation': self.validation.__dict__,
            'general': self.general,
            'metrics': self.metrics,
            'security': self.security,
            'files': self.files,
            'improvement_patterns': self.improvement_patterns,
            'code_validation': self.code_validation,
            'quality_metrics': self.quality_metrics,
            'evolution': self.evolution,
            'costs': self.costs
        }
        
    def update_config(self, section: str, key: str, value: Any) -> bool:
        """Actualiza una configuración específica"""
        try:
            if hasattr(self, section):
                section_obj = getattr(self, section)
                if hasattr(section_obj, key):
                    setattr(section_obj, key, value)
                    return True
                elif isinstance(section_obj, dict):
                    section_obj[key] = value
                    return True
            return False
        except Exception:
            return False
            
    def validate_config(self) -> List[str]:
        """Valida la configuración y retorna errores"""
        errors = []
        
        # Validar thresholds
        if self.analysis.complexity_threshold < 1:
            errors.append("complexity_threshold debe ser >= 1")
            
        if self.analysis.maintainability_threshold < 0 or self.analysis.maintainability_threshold > 100:
            errors.append("maintainability_threshold debe estar entre 0 y 100")
            
        if self.analysis.documentation_threshold < 0 or self.analysis.documentation_threshold > 100:
            errors.append("documentation_threshold debe estar entre 0 y 100")
            
        if self.improvement.validation_threshold < 0 or self.improvement.validation_threshold > 1:
            errors.append("validation_threshold debe estar entre 0 y 1")
            
        return errors
        
    def get_improvement_priority(self, category: str) -> ImprovementPriority:
        """Obtiene la prioridad para una categoría de mejora"""
        pattern = self.improvement_patterns.get(category, {})
        return pattern.get('priority', ImprovementPriority.MEDIUM)
        
    def get_improvement_category(self, category: str) -> ImprovementCategory:
        """Obtiene la categoría para un tipo de mejora"""
        pattern = self.improvement_patterns.get(category, {})
        return pattern.get('category', ImprovementCategory.FUNCTIONALITY)
        
    def is_file_allowed(self, file_path: str) -> bool:
        """Verifica si un archivo está permitido para mejora"""
        import os
        file_ext = os.path.splitext(file_path)[1]
        return file_ext in self.security['allowed_file_extensions']
        
    def should_backup(self) -> bool:
        """Verifica si se debe hacer backup"""
        return self.security['backup_required'] and self.improvement.backup_before_improvements
        
    def get_quality_score(self, metrics: Dict[str, float]) -> float:
        """Calcula puntuación de calidad basada en métricas"""
        total_score = 0
        total_weight = 0
        
        for metric_name, metric_config in self.quality_metrics.items():
            if metric_name in metrics:
                weight = metric_config['weight']
                score = min(100, metrics[metric_name])
                total_score += score * weight
                total_weight += weight
                
        return total_score / total_weight if total_weight > 0 else 0

# Instancia global de configuración
config = SelfImprovementConfig() 