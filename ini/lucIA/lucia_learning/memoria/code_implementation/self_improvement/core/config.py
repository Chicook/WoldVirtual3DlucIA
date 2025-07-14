#!/usr/bin/env python3
"""
Config - Configuración del Sistema de Auto-mejora de LucIA
Configuración específica para el sistema de auto-mejora integrado en el módulo de memoria
"""

import os
from pathlib import Path
from typing import Dict, Any

# Configuración del sistema de auto-mejora
self_improvement = {
    'enabled': True,
    'analysis_interval': 24,  # horas
    'max_improvements_per_run': 10,
    'validation_threshold': 0.7,
    'backup_before_improvements': True,
    'rollback_on_failure': True,
    'improvement_categories': [
        'maintainability',
        'performance',
        'complexity',
        'documentation',
        'testing',
        'security',
        'architecture'
    ]
}

# Configuración de análisis de código
code_analysis = {
    'max_file_size': 10000,  # líneas
    'complexity_threshold': 10,
    'maintainability_threshold': 70,
    'documentation_threshold': 30,
    'test_coverage_threshold': 50,
    'duplication_threshold': 15,
    'nesting_threshold': 5,
    'function_length_threshold': 50,
    'parameter_threshold': 7,
    'file_length_threshold': 500
}

# Configuración de detección de mejoras
improvement_detection = {
    'max_opportunities_per_category': 5,
    'confidence_threshold': 0.8,
    'effort_weights': {
        'low': 1,
        'medium': 3,
        'high': 5
    },
    'priority_weights': {
        'low': 1,
        'medium': 2,
        'high': 3
    },
    'impact_threshold': 0.6
}

# Configuración de generación de mejoras
improvement_generation = {
    'max_improvements_per_category': 3,
    'confidence_threshold': 0.8,
    'code_quality_threshold': 0.7,
    'performance_improvement_target': 0.2,  # 20% mejora
    'memory_improvement_target': 0.15,      # 15% mejora
    'complexity_reduction_target': 0.3      # 30% reducción
}

# Configuración de validación
validation = {
    'syntax_check': True,
    'import_check': True,
    'function_signature_check': True,
    'variable_usage_check': True,
    'logic_check': True,
    'performance_testing': True,
    'security_check': True,
    'quality_metrics': True,
    'test_coverage_check': True
}

# Configuración de rendimiento
performance = {
    'execution_time_threshold': 1.0,  # segundos
    'memory_usage_threshold': 100.0,  # MB
    'cpu_usage_threshold': 80.0,      # porcentaje
    'improvement_targets': {
        'execution_time': 0.2,  # 20% mejora
        'memory_usage': 0.15,   # 15% mejora
        'cpu_usage': 0.1        # 10% mejora
    },
    'benchmark_runs': 5,
    'timeout': 30  # segundos
}

# Configuración de seguridad
security = {
    'sql_injection_check': True,
    'path_traversal_check': True,
    'information_disclosure_check': True,
    'insecure_random_check': True,
    'hardcoded_credentials_check': True,
    'risk_levels': {
        'low': 1,
        'medium': 2,
        'high': 3
    },
    'security_threshold': 0.8
}

# Configuración de arquitectura
architecture = {
    'tight_coupling_check': True,
    'god_object_check': True,
    'circular_dependency_check': True,
    'srp_violation_check': True,
    'abstraction_check': True,
    'max_class_methods': 15,
    'max_class_lines': 500,
    'max_file_methods': 20,
    'dependency_depth_threshold': 5
}

# Configuración de logging
logging_config = {
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': 'lucia_self_improvement.log',
    'max_size': 10 * 1024 * 1024,  # 10MB
    'backup_count': 5,
    'console_output': True
}

# Configuración de reportes
reporting = {
    'generate_html_reports': True,
    'generate_json_reports': True,
    'generate_csv_reports': False,
    'include_code_snippets': True,
    'include_metrics': True,
    'include_recommendations': True,
    'output_directory': 'results/',
    'report_format': 'markdown'
}

# Configuración de pruebas
testing = {
    'run_unit_tests': True,
    'run_integration_tests': True,
    'run_performance_tests': True,
    'test_timeout': 30,  # segundos
    'coverage_threshold': 70,  # porcentaje
    'test_patterns': ['*test*.py', '*Test*.py'],
    'test_framework': 'unittest'
}

# Configuración de respaldo
backup = {
    'enabled': True,
    'frequency': 'before_improvements',
    'retention_days': 30,
    'compression': True,
    'encryption': False,
    'backup_directory': 'backups/',
    'max_backups': 10
}

# Configuración de monitoreo
monitoring = {
    'enabled': True,
    'metrics_collection': True,
    'alerting': False,
    'dashboard': False,
    'health_checks': True,
    'performance_monitoring': True,
    'check_interval': 300  # segundos
}

# Configuración de desarrollo
development = {
    'debug_mode': False,
    'verbose_output': True,
    'interactive_mode': False,
    'auto_save': True,
    'code_formatting': True,
    'linting': True,
    'type_checking': True
}

# Configuración de metaverso específica
metaverse = {
    'platform_name': 'Metaverso Crypto World Virtual 3D',
    'supported_languages': ['es', 'en'],
    'avatar_system': True,
    'blockchain_integration': True,
    '3d_rendering': True,
    'social_features': True,
    'economy_system': True,
    'improvement_focus': [
        'avatar_optimization',
        'blockchain_efficiency',
        '3d_performance',
        'social_scalability',
        'economy_balance'
    ]
}

# Configuración de personalidades de LucIA
personalities = {
    'friendly': {
        'emoji_frequency': 0.3,
        'formal_tone': False,
        'sentence_endings': ['😊', '👍', '✨', '🌟', '💫']
    },
    'professional': {
        'emoji_frequency': 0.1,
        'formal_tone': True,
        'sentence_endings': ['', '.', '']
    },
    'creative': {
        'emoji_frequency': 0.5,
        'formal_tone': False,
        'sentence_endings': ['✨', '🎨', '🚀', '💡', '🌟', '🎭', '🎪']
    },
    'technical': {
        'emoji_frequency': 0.05,
        'formal_tone': True,
        'sentence_endings': ['', '.', '']
    },
    'casual': {
        'emoji_frequency': 0.4,
        'formal_tone': False,
        'sentence_endings': ['😄', '👍', '👌', '🔥', '💯', '😎']
    }
}

# Configuración de patrones de parafraseo
paraphrase_patterns = {
    'saludos': {
        'hola': ['¡Hola!', '¡Hola! ¿Cómo estás?', '¡Hola! ¿Qué tal?', '¡Hola! ¿Cómo va todo?'],
        'buenos_dias': ['¡Buenos días!', '¡Buenos días! ¿Cómo amaneciste?', '¡Buenos días! ¿Qué tal el día?'],
        'buenas_tardes': ['¡Buenas tardes!', '¡Buenas tardes! ¿Cómo va el día?', '¡Buenas tardes! ¿Qué tal?'],
        'buenas_noches': ['¡Buenas noches!', '¡Buenas noches! ¿Cómo fue tu día?', '¡Buenas noches! ¿Qué tal?']
    },
    'respuestas_positivas': {
        'excelente': ['¡Excelente!', '¡Fantástico!', '¡Genial!', '¡Perfecto!', '¡Maravilloso!'],
        'muy_bien': ['¡Muy bien!', '¡Perfecto!', '¡Genial!', '¡Excelente!', '¡Fantástico!'],
        'perfecto': ['¡Perfecto!', '¡Excelente!', '¡Genial!', '¡Fantástico!', '¡Maravilloso!'],
        'genial': ['¡Genial!', '¡Fantástico!', '¡Excelente!', '¡Perfecto!', '¡Maravilloso!']
    },
    'explicaciones': {
        'te_explico': ['Te explico', 'Te cuento', 'Te detallo', 'Te aclaro', 'Te explico paso a paso'],
        'es_decir': ['Es decir', 'O sea', 'En otras palabras', 'Dicho de otra manera', 'Para que entiendas'],
        'por_ejemplo': ['Por ejemplo', 'Como ejemplo', 'A modo de ejemplo', 'Como muestra', 'Para ilustrar']
    }
}

# Configuración de errores comunes
common_errors = {
    'python': {
        'indentation_error': 'Error de indentación',
        'syntax_error': 'Error de sintaxis',
        'name_error': 'Variable no definida',
        'type_error': 'Error de tipo',
        'attribute_error': 'Atributo no encontrado',
        'import_error': 'Error de importación',
        'key_error': 'Clave no encontrada',
        'index_error': 'Índice fuera de rango'
    },
    'javascript': {
        'syntax_error': 'Error de sintaxis',
        'reference_error': 'Variable no definida',
        'type_error': 'Error de tipo',
        'undefined_error': 'Valor indefinido',
        'null_error': 'Valor nulo',
        'missing_semicolon': 'Punto y coma faltante'
    },
    'java': {
        'compilation_error': 'Error de compilación',
        'null_pointer_exception': 'Excepción de puntero nulo',
        'class_not_found': 'Clase no encontrada',
        'method_not_found': 'Método no encontrado',
        'missing_return': 'Return faltante'
    },
    'cpp': {
        'compilation_error': 'Error de compilación',
        'segmentation_fault': 'Fallo de segmentación',
        'undefined_reference': 'Referencia indefinida',
        'missing_semicolon': 'Punto y coma faltante',
        'missing_include': 'Include faltante'
    }
}

# Configuración de validación de código
code_validation = {
    'languages': ['python', 'javascript', 'java', 'cpp', 'typescript'],
    'max_file_size': 10000,  # líneas
    'timeout': 30,  # segundos
    'memory_limit': 512,  # MB
    'cpu_limit': 80,  # porcentaje
    'validation_rules': [
        'syntax_check',
        'import_check',
        'function_signature_check',
        'variable_usage_check',
        'logic_check'
    ]
}

# Configuración de métricas de calidad
quality_metrics = {
    'maintainability_index': {
        'excellent': 80,
        'good': 70,
        'fair': 60,
        'poor': 50
    },
    'cyclomatic_complexity': {
        'excellent': 5,
        'good': 10,
        'fair': 15,
        'poor': 20
    },
    'lines_per_function': {
        'excellent': 20,
        'good': 50,
        'fair': 100,
        'poor': 200
    },
    'code_duplication': {
        'excellent': 5,
        'good': 15,
        'fair': 25,
        'poor': 35
    },
    'documentation_coverage': {
        'excellent': 80,
        'good': 60,
        'fair': 40,
        'poor': 20
    },
    'test_coverage': {
        'excellent': 90,
        'good': 70,
        'fair': 50,
        'poor': 30
    }
}

# Configuración de evolución
evolution = {
    'learning_rate': 0.1,
    'adaptation_threshold': 0.8,
    'improvement_cycles': 10,
    'convergence_threshold': 0.95,
    'max_iterations': 100,
    'evaluation_interval': 5,
    'mutation_rate': 0.05,
    'selection_pressure': 0.7
}

# Configuración de costes
costs = {
    'api_calls': {
        'gemini': 0.001,  # por llamada
        'openai': 0.002,  # por llamada
        'daily_budget': 10.0,  # USD
        'monthly_budget': 100.0  # USD
    },
    'compute': {
        'cpu_hour': 0.05,  # USD por hora
        'memory_gb_hour': 0.01,  # USD por GB/hora
        'storage_gb_month': 0.02  # USD por GB/mes
    },
    'optimization_targets': {
        'reduce_api_calls': 0.5,  # 50% reducción
        'reduce_compute_time': 0.3,  # 30% reducción
        'reduce_memory_usage': 0.2  # 20% reducción
    }
}

# Configuración de archivos de LucIA
lucia_files = {
    'core_files': [
        'lucia_core.py',
        'memory.py',
        'paraphraser.py',
        'api_manager.py'
    ],
    'platform_files': [
        'lucia_platform_leader.py',
        'platform_leader.py'
    ],
    'utility_files': [
        'code_paraphraser.py',
        'config.py',
        'utils.py'
    ],
    'test_files': [
        '*test*.py',
        '*Test*.py'
    ]
}

# Función para obtener configuración completa
def get_self_improvement_config() -> Dict[str, Any]:
    """Obtiene la configuración completa del sistema de auto-mejora"""
    return {
        'self_improvement': self_improvement,
        'code_analysis': code_analysis,
        'improvement_detection': improvement_detection,
        'improvement_generation': improvement_generation,
        'validation': validation,
        'performance': performance,
        'security': security,
        'architecture': architecture,
        'logging': logging_config,
        'reporting': reporting,
        'testing': testing,
        'backup': backup,
        'monitoring': monitoring,
        'development': development,
        'metaverse': metaverse,
        'personalities': personalities,
        'paraphrase_patterns': paraphrase_patterns,
        'common_errors': common_errors,
        'code_validation': code_validation,
        'quality_metrics': quality_metrics,
        'evolution': evolution,
        'costs': costs,
        'lucia_files': lucia_files
    }

# Función para obtener configuración específica
def get_config_section(section: str) -> Dict[str, Any]:
    """Obtiene una sección específica de la configuración"""
    config = get_self_improvement_config()
    return config.get(section, {})

# Función para actualizar configuración
def update_config(section: str, key: str, value: Any) -> bool:
    """Actualiza un valor específico en la configuración"""
    try:
        if section in globals():
            if hasattr(globals()[section], key):
                globals()[section][key] = value
                return True
        return False
    except Exception:
        return False

# Función para validar configuración
def validate_self_improvement_config() -> Dict[str, Any]:
    """Valida la configuración del sistema de auto-mejora"""
    errors = []
    warnings = []
    
    config = get_self_improvement_config()
    
    # Validar umbrales
    if config['code_analysis']['complexity_threshold'] <= 0:
        errors.append("Umbral de complejidad debe ser mayor que 0")
        
    if config['code_analysis']['maintainability_threshold'] > 100:
        errors.append("Umbral de mantenibilidad no puede ser mayor que 100")
        
    if config['code_analysis']['documentation_threshold'] > 100:
        errors.append("Umbral de documentación no puede ser mayor que 100")
        
    # Validar configuraciones de mejora
    if config['self_improvement']['max_improvements_per_run'] <= 0:
        errors.append("Número máximo de mejoras debe ser mayor que 0")
        
    if config['validation']['validation_threshold'] <= 0 or config['validation']['validation_threshold'] > 1:
        errors.append("Umbral de validación debe estar entre 0 y 1")
        
    # Validar configuraciones de rendimiento
    if config['performance']['execution_time_threshold'] <= 0:
        errors.append("Umbral de tiempo de ejecución debe ser mayor que 0")
        
    if config['performance']['memory_usage_threshold'] <= 0:
        errors.append("Umbral de uso de memoria debe ser mayor que 0")
        
    # Validar configuraciones de archivos
    if not config['lucia_files']['core_files']:
        warnings.append("No se han definido archivos core de LucIA")
        
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }

# Función para obtener configuración por defecto
def get_default_config() -> Dict[str, Any]:
    """Obtiene configuración por defecto para nuevos proyectos"""
    return {
        'self_improvement': {
            'enabled': True,
            'analysis_interval': 24,
            'max_improvements_per_run': 5,
            'validation_threshold': 0.7
        },
        'code_analysis': {
            'complexity_threshold': 10,
            'maintainability_threshold': 70,
            'documentation_threshold': 30
        },
        'validation': {
            'syntax_check': True,
            'functionality_check': True,
            'performance_check': True
        }
    } 