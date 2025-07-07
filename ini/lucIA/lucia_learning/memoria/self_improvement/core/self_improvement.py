#!/usr/bin/env python3
"""
LucIA Self Improvement - Sistema de Auto-mejora Integrado
Clase principal del sistema de auto-mejora de LucIA integrado en el módulo de memoria
"""

import sys
import logging
from pathlib import Path
from datetime import datetime
import json
from typing import Dict, List, Optional, Any

# Añadir el directorio padre al path para importar módulos de LucIA
current_dir = Path(__file__).parent
lucia_dir = current_dir.parent.parent.parent.parent  # Subir hasta lucIA/
sys.path.append(str(lucia_dir))

from memory import MemoryManager
from paraphraser import Paraphraser, ParaphraseConfig, PersonalityType
from lucia_core import LucIACore
import config

logger = logging.getLogger(__name__)

class LucIASelfImprovement:
    """Sistema de auto-mejora de LucIA integrado en el módulo de memoria"""
    
    def __init__(self, memory_manager: MemoryManager = None):
        self.memory_manager = memory_manager or MemoryManager()
        self.paraphraser = Paraphraser(ParaphraseConfig(
            personality=PersonalityType.TECHNICAL,
            confidence_threshold=0.8
        ))
        
        # Componentes del sistema de auto-mejora
        self.analyzer = None
        self.detector = None
        self.generator = None
        self.validator = None
        
        # Estado del sistema
        self.improvement_history = []
        self.current_analysis = {}
        self.improvement_opportunities = []
        
        # Configuración
        self.config = self._load_improvement_config()
        
        logger.info("🧠 Sistema de auto-mejora de LucIA inicializado")
        
    def _load_improvement_config(self) -> Dict[str, Any]:
        """Carga configuración del sistema de auto-mejora"""
        return {
            'analysis': {
                'max_file_size': 10000,
                'complexity_threshold': 10,
                'maintainability_threshold': 70,
                'documentation_threshold': 30,
                'test_coverage_threshold': 50
            },
            'improvement': {
                'max_improvements_per_run': 10,
                'validation_threshold': 0.7,
                'backup_before_improvements': True,
                'rollback_on_failure': True
            },
            'validation': {
                'syntax_check': True,
                'functionality_check': True,
                'performance_check': True,
                'security_check': True
            }
        }
        
    def analyze_current_code(self) -> Dict[str, Any]:
        """Analiza el código actual de LucIA"""
        logger.info("📊 Iniciando análisis del código actual de LucIA")
        
        try:
            # Obtener archivos de LucIA
            lucia_files = self._get_lucia_files()
            
            analysis_results = {
                'timestamp': datetime.now().isoformat(),
                'files_analyzed': len(lucia_files),
                'general_metrics': {},
                'file_analysis': {},
                'issues_found': [],
                'improvement_opportunities': []
            }
            
            # Analizar cada archivo
            for file_path in lucia_files:
                file_analysis = self._analyze_file(file_path)
                analysis_results['file_analysis'][str(file_path)] = file_analysis
                
            # Calcular métricas generales
            analysis_results['general_metrics'] = self._calculate_general_metrics(
                analysis_results['file_analysis']
            )
            
            # Detectar problemas
            analysis_results['issues_found'] = self._detect_issues(
                analysis_results['file_analysis']
            )
            
            # Identificar oportunidades de mejora
            analysis_results['improvement_opportunities'] = self._identify_opportunities(
                analysis_results
            )
            
            self.current_analysis = analysis_results
            
            logger.info(f"✅ Análisis completado: {len(lucia_files)} archivos analizados")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Error en análisis de código: {e}")
            return {'error': str(e)}
            
    def _get_lucia_files(self) -> List[Path]:
        """Obtiene los archivos principales de LucIA"""
        lucia_dir = Path(__file__).parent.parent.parent.parent
        python_files = []
        
        # Archivos principales de LucIA
        main_files = [
            'lucia_core.py',
            'memory.py',
            'paraphraser.py',
            'api_manager.py',
            'lucia_platform_leader.py',
            'platform_leader.py',
            'code_paraphraser.py',
            'config.py',
            'lucIA.py'
        ]
        
        for file_name in main_files:
            file_path = lucia_dir / file_name
            if file_path.exists():
                python_files.append(file_path)
                
        return python_files
        
    def _analyze_file(self, file_path: Path) -> Dict[str, Any]:
        """Analiza un archivo específico"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Métricas básicas
            lines = len(content.split('\n'))
            functions = content.count('def ')
            classes = content.count('class ')
            
            # Análisis de complejidad (simplificado)
            complexity = self._calculate_complexity(content)
            
            # Análisis de documentación
            doc_coverage = self._calculate_documentation_coverage(content)
            
            return {
                'lines_of_code': lines,
                'functions': functions,
                'classes': classes,
                'complexity': complexity,
                'documentation_coverage': doc_coverage,
                'file_size': len(content)
            }
            
        except Exception as e:
            logger.error(f"Error analizando {file_path}: {e}")
            return {'error': str(e)}
            
    def _calculate_complexity(self, content: str) -> int:
        """Calcula complejidad del código"""
        complexity = 1
        
        # Contar estructuras de control
        complexity += content.count('if ')
        complexity += content.count('for ')
        complexity += content.count('while ')
        complexity += content.count('except ')
        complexity += content.count('with ')
        
        return complexity
        
    def _calculate_documentation_coverage(self, content: str) -> float:
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
        
    def _calculate_general_metrics(self, file_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula métricas generales"""
        total_lines = 0
        total_functions = 0
        total_classes = 0
        total_complexity = 0
        total_doc_coverage = 0
        file_count = 0
        
        for file_data in file_analysis.values():
            if isinstance(file_data, dict) and 'error' not in file_data:
                total_lines += file_data.get('lines_of_code', 0)
                total_functions += file_data.get('functions', 0)
                total_classes += file_data.get('classes', 0)
                total_complexity += file_data.get('complexity', 0)
                total_doc_coverage += file_data.get('documentation_coverage', 0)
                file_count += 1
                
        if file_count == 0:
            return {}
            
        return {
            'lines_of_code': total_lines,
            'functions': total_functions,
            'classes': total_classes,
            'average_complexity': total_complexity / file_count,
            'average_documentation_coverage': total_doc_coverage / file_count,
            'files_analyzed': file_count
        }
        
    def _detect_issues(self, file_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta problemas en el código"""
        issues = []
        
        for file_path, file_data in file_analysis.items():
            if isinstance(file_data, dict) and 'error' not in file_data:
                # Detectar funciones largas
                if file_data.get('lines_of_code', 0) > 500:
                    issues.append({
                        'type': 'large_file',
                        'file': file_path,
                        'description': f'Archivo muy grande ({file_data["lines_of_code"]} líneas)',
                        'severity': 'warning'
                    })
                    
                # Detectar complejidad alta
                if file_data.get('complexity', 0) > self.config['analysis']['complexity_threshold']:
                    issues.append({
                        'type': 'high_complexity',
                        'file': file_path,
                        'description': f'Complejidad alta ({file_data["complexity"]})',
                        'severity': 'warning'
                    })
                    
                # Detectar documentación baja
                if file_data.get('documentation_coverage', 0) < self.config['analysis']['documentation_threshold']:
                    issues.append({
                        'type': 'low_documentation',
                        'file': file_path,
                        'description': f'Documentación baja ({file_data["documentation_coverage"]:.1f}%)',
                        'severity': 'info'
                    })
                    
        return issues
        
    def _identify_opportunities(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identifica oportunidades de mejora"""
        opportunities = []
        
        general_metrics = analysis.get('general_metrics', {})
        issues = analysis.get('issues_found', [])
        
        # Oportunidades basadas en métricas
        if general_metrics.get('average_complexity', 0) > self.config['analysis']['complexity_threshold']:
            opportunities.append({
                'category': 'complexity',
                'priority': 'high',
                'description': 'Reducir complejidad del código',
                'impact': 'Mejorar legibilidad y mantenibilidad',
                'effort': 'medium'
            })
            
        if general_metrics.get('average_documentation_coverage', 0) < self.config['analysis']['documentation_threshold']:
            opportunities.append({
                'category': 'documentation',
                'priority': 'medium',
                'description': 'Mejorar documentación del código',
                'impact': 'Facilitar mantenimiento y comprensión',
                'effort': 'low'
            })
            
        # Oportunidades basadas en problemas detectados
        large_files = [issue for issue in issues if issue['type'] == 'large_file']
        if large_files:
            opportunities.append({
                'category': 'refactoring',
                'priority': 'medium',
                'description': 'Refactorizar archivos grandes',
                'impact': 'Mejorar organización y mantenibilidad',
                'effort': 'high'
            })
            
        return opportunities
        
    def detect_improvements(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta mejoras específicas basadas en el análisis"""
        logger.info("🔍 Detectando mejoras específicas")
        
        opportunities = analysis.get('improvement_opportunities', [])
        improvements = []
        
        for opportunity in opportunities:
            category = opportunity.get('category', '')
            
            if category == 'complexity':
                improvements.extend(self._generate_complexity_improvements(opportunity))
            elif category == 'documentation':
                improvements.extend(self._generate_documentation_improvements(opportunity))
            elif category == 'refactoring':
                improvements.extend(self._generate_refactoring_improvements(opportunity))
                
        self.improvement_opportunities = improvements
        return improvements
        
    def _generate_complexity_improvements(self, opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Genera mejoras para reducir complejidad"""
        return [{
            'type': 'complexity_reduction',
            'description': 'Simplificar lógica condicional',
            'suggestion': 'Usar early returns y extraer métodos',
            'priority': opportunity.get('priority', 'medium'),
            'effort': opportunity.get('effort', 'medium')
        }]
        
    def _generate_documentation_improvements(self, opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Genera mejoras para documentación"""
        return [{
            'type': 'documentation_improvement',
            'description': 'Añadir docstrings y comentarios',
            'suggestion': 'Documentar funciones y clases principales',
            'priority': opportunity.get('priority', 'medium'),
            'effort': opportunity.get('effort', 'low')
        }]
        
    def _generate_refactoring_improvements(self, opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Genera mejoras de refactorización"""
        return [{
            'type': 'file_refactoring',
            'description': 'Dividir archivos grandes en módulos',
            'suggestion': 'Extraer clases y funciones a archivos separados',
            'priority': opportunity.get('priority', 'medium'),
            'effort': opportunity.get('effort', 'high')
        }]
        
    def generate_improvement_plan(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Genera un plan de mejora estructurado"""
        logger.info("📋 Generando plan de mejora")
        
        # Agrupar por prioridad
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        low_priority = [opp for opp in opportunities if opp.get('priority') == 'low']
        
        # Calcular esfuerzo total
        total_effort = sum(self._get_effort_score(opp.get('effort', 'medium')) for opp in opportunities)
        
        return {
            'summary': {
                'total_opportunities': len(opportunities),
                'high_priority': len(high_priority),
                'medium_priority': len(medium_priority),
                'low_priority': len(low_priority),
                'total_effort': total_effort
            },
            'priorities': {
                'high': high_priority[:3],  # Top 3
                'medium': medium_priority[:3],  # Top 3
                'low': low_priority[:2]  # Top 2
            },
            'timeline': self._generate_timeline(opportunities),
            'recommendations': self._generate_recommendations(opportunities)
        }
        
    def _get_effort_score(self, effort: str) -> int:
        """Convierte esfuerzo a puntuación numérica"""
        effort_scores = {'low': 1, 'medium': 3, 'high': 5}
        return effort_scores.get(effort, 3)
        
    def _generate_timeline(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Genera timeline para implementar mejoras"""
        timeline = []
        
        high_priority = [opp for opp in opportunities if opp.get('priority') == 'high']
        medium_priority = [opp for opp in opportunities if opp.get('priority') == 'medium']
        
        if high_priority:
            timeline.append({
                'week': '1-2',
                'focus': 'Mejoras de alta prioridad',
                'items': high_priority[:2],
                'estimated_hours': 16
            })
            
        if medium_priority:
            timeline.append({
                'week': '3-4',
                'focus': 'Mejoras de media prioridad',
                'items': medium_priority[:2],
                'estimated_hours': 24
            })
            
        return timeline
        
    def _generate_recommendations(self, opportunities: List[Dict[str, Any]]) -> List[str]:
        """Genera recomendaciones basadas en oportunidades"""
        recommendations = []
        
        if any(opp.get('category') == 'complexity' for opp in opportunities):
            recommendations.append("⚡ Priorizar reducción de complejidad")
            
        if any(opp.get('category') == 'documentation' for opp in opportunities):
            recommendations.append("📚 Mejorar documentación del código")
            
        if any(opp.get('category') == 'refactoring' for opp in opportunities):
            recommendations.append("🔄 Implementar refactorización gradual")
            
        recommendations.extend([
            "📈 Establecer métricas de seguimiento",
            "🧪 Implementar pruebas automatizadas",
            "🔄 Realizar análisis periódicos"
        ])
        
        return recommendations
        
    def generate_improvements(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Genera mejoras de código específicas"""
        logger.info("🛠️ Generando mejoras de código")
        
        improvements = []
        
        for opportunity in opportunities:
            improvement_type = opportunity.get('type', '')
            
            if improvement_type == 'complexity_reduction':
                improvements.append(self._generate_complexity_improvement(opportunity))
            elif improvement_type == 'documentation_improvement':
                improvements.append(self._generate_documentation_improvement(opportunity))
            elif improvement_type == 'file_refactoring':
                improvements.append(self._generate_refactoring_improvement(opportunity))
                
        return improvements
        
    def _generate_complexity_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora específica para reducir complejidad"""
        return {
            'type': 'complexity_reduction',
            'description': opportunity.get('description', ''),
            'original_code': self._get_complexity_example(),
            'improved_code': self._get_simplified_example(),
            'benefits': ['Reducir complejidad', 'Mejorar legibilidad', 'Facilitar testing'],
            'confidence': 0.9
        }
        
    def _generate_documentation_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora específica para documentación"""
        return {
            'type': 'documentation_improvement',
            'description': opportunity.get('description', ''),
            'original_code': self._get_no_docstring_example(),
            'improved_code': self._get_with_docstring_example(),
            'benefits': ['Mejorar comprensión', 'Facilitar mantenimiento', 'Generar documentación'],
            'confidence': 0.95
        }
        
    def _generate_refactoring_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora específica de refactorización"""
        return {
            'type': 'file_refactoring',
            'description': opportunity.get('description', ''),
            'original_code': self._get_large_file_example(),
            'improved_code': self._get_refactored_example(),
            'benefits': ['Mejorar organización', 'Reducir acoplamiento', 'Facilitar mantenimiento'],
            'confidence': 0.85
        }
        
    # Ejemplos de código para las mejoras
    def _get_complexity_example(self) -> str:
        """Ejemplo de código complejo"""
        return '''
def process_user_data(user_data):
    if not user_data:
        return None
    if not isinstance(user_data, dict):
        return None
    if 'name' not in user_data:
        return None
    if 'email' not in user_data:
        return None
    
    name = user_data['name']
    if not name or len(name.strip()) == 0:
        return None
    name = name.strip().title()
    
    email = user_data['email']
    if not email or '@' not in email:
        return None
    email = email.lower().strip()
    
    age = user_data.get('age', 0)
    if age < 0 or age > 150:
        age = 0
    
    result = {
        'name': name,
        'email': email,
        'age': age,
        'processed_at': datetime.now()
    }
    
    return result
'''
        
    def _get_simplified_example(self) -> str:
        """Ejemplo de código simplificado"""
        return '''
def validate_user_data(user_data):
    """Valida que los datos de usuario sean correctos"""
    if not user_data or not isinstance(user_data, dict):
        return False
    if 'name' not in user_data or 'email' not in user_data:
        return False
    return True

def process_name(name):
    """Procesa y valida el nombre del usuario"""
    if not name or len(name.strip()) == 0:
        return None
    return name.strip().title()

def process_email(email):
    """Procesa y valida el email del usuario"""
    if not email or '@' not in email:
        return None
    return email.lower().strip()

def process_user_data(user_data):
    """Procesa datos de usuario de forma modular"""
    if not validate_user_data(user_data):
        return None
    
    name = process_name(user_data['name'])
    email = process_email(user_data['email'])
    age = max(0, min(150, user_data.get('age', 0)))
    
    if not name or not email:
        return None
    
    return {
        'name': name,
        'email': email,
        'age': age,
        'processed_at': datetime.now()
    }
'''
        
    def _get_no_docstring_example(self) -> str:
        """Ejemplo sin docstring"""
        return '''
def calculate_discount(price, discount_rate):
    return price * discount_rate

def validate_email(email):
    return '@' in email and '.' in email
'''
        
    def _get_with_docstring_example(self) -> str:
        """Ejemplo con docstring"""
        return '''
def calculate_discount(price: float, discount_rate: float) -> float:
    """
    Calcula el descuento aplicado a un precio.
    
    Args:
        price: Precio original del producto
        discount_rate: Tasa de descuento (0.0 a 1.0)
    
    Returns:
        float: Monto del descuento calculado
    
    Raises:
        ValueError: Si el precio o tasa de descuento son negativos
    """
    if price < 0 or discount_rate < 0:
        raise ValueError("Precio y tasa de descuento deben ser positivos")
    return price * discount_rate

def validate_email(email: str) -> bool:
    """
    Valida si una cadena es un email válido.
    
    Args:
        email: Cadena a validar como email
    
    Returns:
        bool: True si es un email válido, False en caso contrario
    """
    return '@' in email and '.' in email
'''
        
    def _get_large_file_example(self) -> str:
        """Ejemplo de archivo grande"""
        return '''
# Archivo grande con múltiples responsabilidades
class UserManager:
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        self.users.append(user)
    
    def get_user(self, user_id):
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def update_user(self, user_id, data):
        user = self.get_user(user_id)
        if user:
            user.update(data)
    
    def delete_user(self, user_id):
        user = self.get_user(user_id)
        if user:
            self.users.remove(user)
    
    def validate_user(self, user):
        # Lógica de validación compleja
        pass
    
    def authenticate_user(self, credentials):
        # Lógica de autenticación
        pass
    
    def authorize_user(self, user, resource):
        # Lógica de autorización
        pass
    
    def log_user_activity(self, user, activity):
        # Lógica de logging
        pass
    
    def backup_user_data(self, user):
        # Lógica de backup
        pass
'''
        
    def _get_refactored_example(self) -> str:
        """Ejemplo de archivo refactorizado"""
        return '''
# user_manager.py - Gestión básica de usuarios
class UserManager:
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        self.users.append(user)
    
    def get_user(self, user_id):
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def update_user(self, user_id, data):
        user = self.get_user(user_id)
        if user:
            user.update(data)
    
    def delete_user(self, user_id):
        user = self.get_user(user_id)
        if user:
            self.users.remove(user)

# user_validator.py - Validación de usuarios
class UserValidator:
    def validate_user(self, user):
        # Lógica de validación
        pass

# user_auth.py - Autenticación y autorización
class UserAuthenticator:
    def authenticate_user(self, credentials):
        # Lógica de autenticación
        pass
    
    def authorize_user(self, user, resource):
        # Lógica de autorización
        pass

# user_logger.py - Logging de actividades
class UserLogger:
    def log_user_activity(self, user, activity):
        # Lógica de logging
        pass

# user_backup.py - Backup de datos
class UserBackup:
    def backup_user_data(self, user):
        # Lógica de backup
        pass
'''
        
    def validate_improvements(self, improvements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Valida las mejoras generadas"""
        logger.info("✅ Validando mejoras generadas")
        
        validation_results = []
        
        for improvement in improvements:
            validation = {
                'improvement_type': improvement.get('type', ''),
                'is_valid': True,
                'score': 0.9,
                'issues': [],
                'warnings': [],
                'suggestions': []
            }
            
            # Validación básica
            if not improvement.get('improved_code'):
                validation['is_valid'] = False
                validation['issues'].append('Código mejorado no proporcionado')
                
            if not improvement.get('benefits'):
                validation['warnings'].append('Beneficios no especificados')
                
            validation_results.append(validation)
            
        return validation_results
        
    def apply_refactoring(self, improvements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aplica refactorizaciones (simulado)"""
        logger.info("🔄 Aplicando refactorizaciones")
        
        applied_count = 0
        failed_count = 0
        
        for improvement in improvements:
            try:
                # Simular aplicación de mejora
                logger.info(f"Aplicando mejora: {improvement.get('type', '')}")
                applied_count += 1
            except Exception as e:
                logger.error(f"Error aplicando mejora: {e}")
                failed_count += 1
                
        return {
            'applied_count': applied_count,
            'failed_count': failed_count,
            'success_rate': applied_count / (applied_count + failed_count) if (applied_count + failed_count) > 0 else 0
        }
        
    def generate_report(self, validation: List[Dict[str, Any]]) -> str:
        """Genera reporte de validación"""
        valid_count = sum(1 for v in validation if v.get('is_valid', False))
        total_count = len(validation)
        
        report = f"""
📊 Reporte de Auto-mejora de LucIA

✅ Mejoras válidas: {valid_count}/{total_count}
📈 Tasa de éxito: {(valid_count/total_count*100):.1f}% si total_count > 0 else 0}%

🔍 Detalles por tipo:
"""
        
        for v in validation:
            status = "✅" if v.get('is_valid', False) else "❌"
            report += f"   {status} {v.get('improvement_type', 'N/A')}: {v.get('score', 0):.2f}/1.00\n"
            
        return report
        
    def run_complete_analysis(self) -> Dict[str, Any]:
        """Ejecuta análisis completo de auto-mejora"""
        logger.info("🚀 Iniciando análisis completo de auto-mejora")
        
        try:
            # Paso 1: Análisis
            analysis = self.analyze_current_code()
            
            # Paso 2: Detección
            opportunities = self.detect_improvements(analysis)
            
            # Paso 3: Plan de mejora
            plan = self.generate_improvement_plan(opportunities)
            
            # Paso 4: Generación
            improvements = self.generate_improvements(opportunities)
            
            # Paso 5: Validación
            validation = self.validate_improvements(improvements)
            
            # Paso 6: Aplicación
            refactoring_results = self.apply_refactoring(improvements)
            
            # Paso 7: Reporte
            report = self.generate_report(validation)
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'analysis': analysis,
                'opportunities': opportunities,
                'plan': plan,
                'improvements': improvements,
                'validation': validation,
                'refactoring': refactoring_results,
                'report': report
            }
            
            # Guardar en memoria
            self._save_improvement_results(results)
            
            logger.info("🎉 Análisis completo finalizado")
            return results
            
        except Exception as e:
            logger.error(f"Error en análisis completo: {e}")
            return {'error': str(e)}
            
    def run_specific_improvement(self, improvement_type: str) -> Dict[str, Any]:
        """Ejecuta mejora específica"""
        logger.info(f"🔧 Ejecutando mejora específica: {improvement_type}")
        
        try:
            # Analizar código actual
            analysis = self.analyze_current_code()
            
            # Filtrar oportunidades por tipo
            opportunities = self.detect_improvements(analysis)
            filtered_opportunities = [
                opp for opp in opportunities 
                if improvement_type in opp.get('type', '').lower()
            ]
            
            if not filtered_opportunities:
                return {'error': f'No se encontraron oportunidades para: {improvement_type}'}
                
            # Generar y validar mejoras
            improvements = self.generate_improvements(filtered_opportunities)
            validation = self.validate_improvements(improvements)
            
            return {
                'improvement_type': improvement_type,
                'opportunities_found': len(filtered_opportunities),
                'improvements_generated': len(improvements),
                'validation_results': validation
            }
            
        except Exception as e:
            logger.error(f"Error en mejora específica: {e}")
            return {'error': str(e)}
            
    def _save_improvement_results(self, results: Dict[str, Any]):
        """Guarda resultados en memoria"""
        try:
            # Crear entrada de memoria para los resultados
            memory_entry = {
                'type': 'self_improvement_results',
                'timestamp': datetime.now().isoformat(),
                'results': results,
                'summary': {
                    'opportunities_found': len(results.get('opportunities', [])),
                    'improvements_generated': len(results.get('improvements', [])),
                    'validation_success': sum(1 for v in results.get('validation', []) if v.get('is_valid', False))
                }
            }
            
            # Guardar en memoria (simulado)
            self.improvement_history.append(memory_entry)
            
            logger.info("💾 Resultados guardados en memoria")
            
        except Exception as e:
            logger.error(f"Error guardando resultados: {e}")
            
    def get_improvement_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del sistema de auto-mejora"""
        return {
            'total_analyses': len(self.improvement_history),
            'total_opportunities_found': sum(
                entry.get('summary', {}).get('opportunities_found', 0) 
                for entry in self.improvement_history
            ),
            'total_improvements_generated': sum(
                entry.get('summary', {}).get('improvements_generated', 0) 
                for entry in self.improvement_history
            ),
            'total_validation_success': sum(
                entry.get('summary', {}).get('validation_success', 0) 
                for entry in self.improvement_history
            ),
            'last_analysis': self.improvement_history[-1]['timestamp'] if self.improvement_history else None
        } 