#!/usr/bin/env python3
"""
Code Generator - Generador de Código Mejorado para LucIA
Genera versiones optimizadas del código de LucIA basado en análisis
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
class CodeImprovement:
    """Mejora de código generada"""
    original_code: str
    improved_code: str
    improvement_type: str
    description: str
    benefits: List[str]
    confidence: float

@dataclass
class RefactoringSuggestion:
    """Sugerencia de refactorización"""
    target: str
    current_structure: str
    suggested_structure: str
    reasoning: str
    impact: str

class CodeGenerator:
    """Generador de código mejorado para LucIA"""
    
    def __init__(self):
        self.improvement_templates = self._load_improvement_templates()
        self.refactoring_patterns = self._load_refactoring_patterns()
        self.optimization_strategies = self._load_optimization_strategies()
        
    def _load_improvement_templates(self) -> Dict[str, Dict[str, Any]]:
        """Carga plantillas de mejora"""
        return {
            'function_extraction': {
                'description': 'Extraer función para reducir complejidad',
                'pattern': r'def\s+(\w+)\s*\([^)]*\):\s*\n(.*?)(?=\n\S|\Z)',
                'improvement': 'split_function',
                'benefits': ['Reducir complejidad', 'Mejorar legibilidad', 'Facilitar testing']
            },
            'constant_extraction': {
                'description': 'Extraer constantes para eliminar números mágicos',
                'pattern': r'(\d+|[A-Z_]+)',
                'improvement': 'extract_constant',
                'benefits': ['Mejorar mantenibilidad', 'Evitar errores', 'Clarificar intención']
            },
            'early_return': {
                'description': 'Usar early returns para simplificar lógica',
                'pattern': r'if\s+([^:]+):\s*\n(.*?)\nelse:\s*\n(.*?)(?=\n\S|\Z)',
                'improvement': 'early_return',
                'benefits': ['Reducir anidamiento', 'Mejorar legibilidad', 'Simplificar lógica']
            },
            'list_comprehension': {
                'description': 'Convertir bucles a comprensiones de lista',
                'pattern': r'for\s+(\w+)\s+in\s+(\w+):\s*\n\s*(\w+)\.append\(([^)]+)\)',
                'improvement': 'list_comprehension',
                'benefits': ['Mejorar rendimiento', 'Código más conciso', 'Más pythónico']
            },
            'context_manager': {
                'description': 'Usar context managers para gestión de recursos',
                'pattern': r'(\w+)\s*=\s*open\(([^)]+)\)\s*\n(.*?)\n(\w+)\.close\(\)',
                'improvement': 'context_manager',
                'benefits': ['Gestión automática de recursos', 'Evitar fugas de memoria', 'Código más seguro']
            }
        }
        
    def _load_refactoring_patterns(self) -> Dict[str, RefactoringSuggestion]:
        """Carga patrones de refactorización"""
        return {
            'extract_method': RefactoringSuggestion(
                target='long_function',
                current_structure='Función con múltiples responsabilidades',
                suggested_structure='Múltiples funciones con responsabilidad única',
                reasoning='Cada función debe tener una sola razón para cambiar',
                impact='Mejorar mantenibilidad y testing'
            ),
            'extract_class': RefactoringSuggestion(
                target='large_class',
                current_structure='Clase con muchas responsabilidades',
                suggested_structure='Múltiples clases especializadas',
                reasoning='Separar responsabilidades en clases diferentes',
                impact='Reducir acoplamiento y mejorar organización'
            ),
            'replace_conditional_with_polymorphism': RefactoringSuggestion(
                target='complex_conditionals',
                current_structure='Múltiples condiciones if/elif',
                suggested_structure='Polimorfismo y herencia',
                reasoning='Usar herencia para manejar diferentes comportamientos',
                impact='Eliminar lógica condicional compleja'
            ),
            'introduce_parameter_object': RefactoringSuggestion(
                target='many_parameters',
                current_structure='Función con muchos parámetros',
                suggested_structure='Objeto que encapsula parámetros',
                reasoning='Agrupar parámetros relacionados en un objeto',
                impact='Mejorar legibilidad y mantenibilidad'
            ),
            'replace_magic_numbers': RefactoringSuggestion(
                target='magic_numbers',
                current_structure='Números hardcodeados',
                suggested_structure='Constantes con nombres descriptivos',
                reasoning='Los números mágicos dificultan la comprensión',
                impact='Mejorar legibilidad y mantenibilidad'
            )
        }
        
    def _load_optimization_strategies(self) -> Dict[str, Dict[str, Any]]:
        """Carga estrategias de optimización"""
        return {
            'caching': {
                'description': 'Implementar caché para operaciones costosas',
                'pattern': r'def\s+(\w+)\s*\([^)]*\):\s*\n(.*?)(?=\n\S|\Z)',
                'implementation': 'add_caching',
                'benefits': ['Mejorar rendimiento', 'Reducir cálculos repetitivos']
            },
            'lazy_evaluation': {
                'description': 'Usar evaluación perezosa para listas grandes',
                'pattern': r'list\(.*\)',
                'implementation': 'convert_to_generator',
                'benefits': ['Reducir uso de memoria', 'Mejorar rendimiento']
            },
            'algorithm_optimization': {
                'description': 'Optimizar algoritmos ineficientes',
                'pattern': r'O\(n\^2\)',
                'implementation': 'optimize_algorithm',
                'benefits': ['Mejorar complejidad temporal', 'Reducir tiempo de ejecución']
            },
            'memory_optimization': {
                'description': 'Optimizar uso de memoria',
                'pattern': r'large_data_structures',
                'implementation': 'optimize_memory',
                'benefits': ['Reducir uso de memoria', 'Mejorar rendimiento']
            }
        }
        
    def generate_improvements(self, opportunities: List[Dict[str, Any]]) -> List[CodeImprovement]:
        """Genera mejoras de código basadas en oportunidades"""
        improvements = []
        
        for opportunity in opportunities:
            category = opportunity.get('category', '')
            
            if category == 'maintainability':
                improvements.extend(self._generate_maintainability_improvements(opportunity))
            elif category == 'complexity':
                improvements.extend(self._generate_complexity_improvements(opportunity))
            elif category == 'performance':
                improvements.extend(self._generate_performance_improvements(opportunity))
            elif category == 'documentation':
                improvements.extend(self._generate_documentation_improvements(opportunity))
            elif category == 'testing':
                improvements.extend(self._generate_testing_improvements(opportunity))
                
        return improvements
        
    def _generate_maintainability_improvements(self, opportunity: Dict[str, Any]) -> List[CodeImprovement]:
        """Genera mejoras de mantenibilidad"""
        improvements = []
        
        # Extraer funciones largas
        if 'long_function' in opportunity.get('description', ''):
            improvements.append(CodeImprovement(
                original_code=self._generate_long_function_example(),
                improved_code=self._generate_extracted_function_example(),
                improvement_type='function_extraction',
                description='Extraer función para reducir complejidad',
                benefits=['Reducir complejidad', 'Mejorar legibilidad', 'Facilitar testing'],
                confidence=0.9
            ))
            
        # Eliminar números mágicos
        if 'magic_numbers' in opportunity.get('description', ''):
            improvements.append(CodeImprovement(
                original_code=self._generate_magic_numbers_example(),
                improved_code=self._generate_constants_example(),
                improvement_type='constant_extraction',
                description='Extraer constantes para eliminar números mágicos',
                benefits=['Mejorar mantenibilidad', 'Evitar errores', 'Clarificar intención'],
                confidence=0.8
            ))
            
        return improvements
        
    def _generate_complexity_improvements(self, opportunity: Dict[str, Any]) -> List[CodeImprovement]:
        """Genera mejoras de complejidad"""
        improvements = []
        
        # Simplificar condiciones complejas
        if 'complex_conditionals' in opportunity.get('description', ''):
            improvements.append(CodeImprovement(
                original_code=self._generate_complex_conditional_example(),
                improved_code=self._generate_simplified_conditional_example(),
                improvement_type='early_return',
                description='Usar early returns para simplificar lógica',
                benefits=['Reducir anidamiento', 'Mejorar legibilidad', 'Simplificar lógica'],
                confidence=0.85
            ))
            
        # Convertir bucles a comprensiones
        improvements.append(CodeImprovement(
            original_code=self._generate_loop_example(),
            improved_code=self._generate_list_comprehension_example(),
            improvement_type='list_comprehension',
            description='Convertir bucles a comprensiones de lista',
            benefits=['Mejorar rendimiento', 'Código más conciso', 'Más pythónico'],
            confidence=0.9
        ))
        
        return improvements
        
    def _generate_performance_improvements(self, opportunity: Dict[str, Any]) -> List[CodeImprovement]:
        """Genera mejoras de rendimiento"""
        improvements = []
        
        # Implementar caché
        improvements.append(CodeImprovement(
            original_code=self._generate_no_cache_example(),
            improved_code=self._generate_cached_example(),
            improvement_type='caching',
            description='Implementar caché para operaciones costosas',
            benefits=['Mejorar rendimiento', 'Reducir cálculos repetitivos'],
            confidence=0.8
        ))
        
        # Usar context managers
        improvements.append(CodeImprovement(
            original_code=self._generate_no_context_manager_example(),
            improved_code=self._generate_context_manager_example(),
            improvement_type='context_manager',
            description='Usar context managers para gestión de recursos',
            benefits=['Gestión automática de recursos', 'Evitar fugas de memoria', 'Código más seguro'],
            confidence=0.9
        ))
        
        return improvements
        
    def _generate_documentation_improvements(self, opportunity: Dict[str, Any]) -> List[CodeImprovement]:
        """Genera mejoras de documentación"""
        improvements = []
        
        # Añadir docstrings
        improvements.append(CodeImprovement(
            original_code=self._generate_no_docstring_example(),
            improved_code=self._generate_with_docstring_example(),
            improvement_type='documentation',
            description='Añadir docstrings descriptivos',
            benefits=['Mejorar comprensión', 'Facilitar mantenimiento', 'Generar documentación automática'],
            confidence=0.95
        ))
        
        return improvements
        
    def _generate_testing_improvements(self, opportunity: Dict[str, Any]) -> List[CodeImprovement]:
        """Genera mejoras de testing"""
        improvements = []
        
        # Generar pruebas unitarias
        improvements.append(CodeImprovement(
            original_code=self._generate_no_tests_example(),
            improved_code=self._generate_with_tests_example(),
            improvement_type='testing',
            description='Implementar pruebas unitarias',
            benefits=['Detectar errores temprano', 'Facilitar refactorización', 'Mejorar confiabilidad'],
            confidence=0.9
        ))
        
        return improvements
        
    def _generate_long_function_example(self) -> str:
        """Genera ejemplo de función larga"""
        return '''
def process_user_data(user_data):
    """Procesa datos de usuario de forma compleja"""
    # Validar datos
    if not user_data:
        return None
    if not isinstance(user_data, dict):
        return None
    if 'name' not in user_data:
        return None
    if 'email' not in user_data:
        return None
    
    # Procesar nombre
    name = user_data['name']
    if not name or len(name.strip()) == 0:
        return None
    name = name.strip().title()
    
    # Procesar email
    email = user_data['email']
    if not email or '@' not in email:
        return None
    email = email.lower().strip()
    
    # Procesar edad
    age = user_data.get('age', 0)
    if age < 0 or age > 150:
        age = 0
    
    # Crear resultado
    result = {
        'name': name,
        'email': email,
        'age': age,
        'processed_at': datetime.now()
    }
    
    return result
'''
        
    def _generate_extracted_function_example(self) -> str:
        """Genera ejemplo de función extraída"""
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

def process_age(age):
    """Procesa y valida la edad del usuario"""
    if age < 0 or age > 150:
        return 0
    return age

def process_user_data(user_data):
    """Procesa datos de usuario de forma modular"""
    if not validate_user_data(user_data):
        return None
    
    name = process_name(user_data['name'])
    email = process_email(user_data['email'])
    age = process_age(user_data.get('age', 0))
    
    if not name or not email:
        return None
    
    return {
        'name': name,
        'email': email,
        'age': age,
        'processed_at': datetime.now()
    }
'''
        
    def _generate_magic_numbers_example(self) -> str:
        """Genera ejemplo con números mágicos"""
        return '''
def calculate_discount(price, customer_type):
    """Calcula descuento basado en tipo de cliente"""
    if customer_type == "vip":
        return price * 0.20
    elif customer_type == "regular":
        return price * 0.10
    elif customer_type == "new":
        return price * 0.05
    else:
        return 0

def validate_password(password):
    """Valida contraseña"""
    if len(password) < 8:
        return False
    if len(password) > 50:
        return False
    return True
'''
        
    def _generate_constants_example(self) -> str:
        """Genera ejemplo con constantes"""
        return '''
# Constantes de descuento
VIP_DISCOUNT = 0.20
REGULAR_DISCOUNT = 0.10
NEW_CUSTOMER_DISCOUNT = 0.05

# Constantes de validación
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 50

def calculate_discount(price, customer_type):
    """Calcula descuento basado en tipo de cliente"""
    if customer_type == "vip":
        return price * VIP_DISCOUNT
    elif customer_type == "regular":
        return price * REGULAR_DISCOUNT
    elif customer_type == "new":
        return price * NEW_CUSTOMER_DISCOUNT
    else:
        return 0

def validate_password(password):
    """Valida contraseña"""
    if len(password) < MIN_PASSWORD_LENGTH:
        return False
    if len(password) > MAX_PASSWORD_LENGTH:
        return False
    return True
'''
        
    def _generate_complex_conditional_example(self) -> str:
        """Genera ejemplo de condición compleja"""
        return '''
def process_order(order):
    """Procesa orden con lógica compleja"""
    if order.status == "pending":
        if order.payment_method == "credit_card":
            if order.amount > 1000:
                if order.customer.vip:
                    order.status = "approved"
                    order.priority = "high"
                else:
                    order.status = "review"
                    order.priority = "medium"
            else:
                order.status = "approved"
                order.priority = "normal"
        else:
            order.status = "pending"
            order.priority = "low"
    else:
        order.status = "rejected"
        order.priority = "none"
    
    return order
'''
        
    def _generate_simplified_conditional_example(self) -> str:
        """Genera ejemplo de condición simplificada"""
        return '''
def process_order(order):
    """Procesa orden con early returns"""
    if order.status != "pending":
        order.status = "rejected"
        order.priority = "none"
        return order
    
    if order.payment_method != "credit_card":
        order.status = "pending"
        order.priority = "low"
        return order
    
    if order.amount <= 1000:
        order.status = "approved"
        order.priority = "normal"
        return order
    
    if order.customer.vip:
        order.status = "approved"
        order.priority = "high"
    else:
        order.status = "review"
        order.priority = "medium"
    
    return order
'''
        
    def _generate_loop_example(self) -> str:
        """Genera ejemplo de bucle tradicional"""
        return '''
def get_active_users(users):
    """Obtiene usuarios activos usando bucle tradicional"""
    active_users = []
    for user in users:
        if user.is_active:
            active_users.append(user.name)
    return active_users

def calculate_total(prices):
    """Calcula total usando bucle tradicional"""
    total = 0
    for price in prices:
        total += price
    return total
'''
        
    def _generate_list_comprehension_example(self) -> str:
        """Genera ejemplo de comprensión de lista"""
        return '''
def get_active_users(users):
    """Obtiene usuarios activos usando comprensión de lista"""
    return [user.name for user in users if user.is_active]

def calculate_total(prices):
    """Calcula total usando sum()"""
    return sum(prices)
'''
        
    def _generate_no_cache_example(self) -> str:
        """Genera ejemplo sin caché"""
        return '''
def expensive_calculation(data):
    """Cálculo costoso sin caché"""
    # Simular cálculo costoso
    result = sum(i * i for i in range(1000))
    return result + len(data)

def process_data(data_list):
    """Procesa datos sin caché"""
    results = []
    for data in data_list:
        result = expensive_calculation(data)  # Se ejecuta cada vez
        results.append(result)
    return results
'''
        
    def _generate_cached_example(self) -> str:
        """Genera ejemplo con caché"""
        return '''
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_calculation(data):
    """Cálculo costoso con caché"""
    # Simular cálculo costoso
    result = sum(i * i for i in range(1000))
    return result + len(data)

def process_data(data_list):
    """Procesa datos con caché"""
    results = []
    for data in data_list:
        result = expensive_calculation(data)  # Se cachea automáticamente
        results.append(result)
    return results
'''
        
    def _generate_no_context_manager_example(self) -> str:
        """Genera ejemplo sin context manager"""
        return '''
def read_file_data(filename):
    """Lee archivo sin context manager"""
    file = open(filename, 'r')
    try:
        data = file.read()
        return data
    finally:
        file.close()

def write_file_data(filename, data):
    """Escribe archivo sin context manager"""
    file = open(filename, 'w')
    try:
        file.write(data)
    finally:
        file.close()
'''
        
    def _generate_context_manager_example(self) -> str:
        """Genera ejemplo con context manager"""
        return '''
def read_file_data(filename):
    """Lee archivo con context manager"""
    with open(filename, 'r') as file:
        return file.read()

def write_file_data(filename, data):
    """Escribe archivo con context manager"""
    with open(filename, 'w') as file:
        file.write(data)
'''
        
    def _generate_no_docstring_example(self) -> str:
        """Genera ejemplo sin docstring"""
        return '''
def calculate_discount(price, discount_rate):
    return price * discount_rate

def validate_email(email):
    return '@' in email and '.' in email

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
'''
        
    def _generate_with_docstring_example(self) -> str:
        """Genera ejemplo con docstring"""
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

class UserManager:
    """Gestiona la colección de usuarios del sistema."""
    
    def __init__(self):
        """Inicializa el gestor de usuarios."""
        self.users = []
    
    def add_user(self, user):
        """
        Añade un usuario a la colección.
        
        Args:
            user: Usuario a añadir
        """
        self.users.append(user)
    
    def get_user(self, user_id):
        """
        Obtiene un usuario por su ID.
        
        Args:
            user_id: ID del usuario a buscar
        
        Returns:
            User: Usuario encontrado o None si no existe
        """
        for user in self.users:
            if user.id == user_id:
                return user
        return None
'''
        
    def _generate_no_tests_example(self) -> str:
        """Genera ejemplo sin pruebas"""
        return '''
def calculate_discount(price, discount_rate):
    return price * discount_rate

def validate_email(email):
    return '@' in email and '.' in email
'''
        
    def _generate_with_tests_example(self) -> str:
        """Genera ejemplo con pruebas"""
        return '''
def calculate_discount(price, discount_rate):
    return price * discount_rate

def validate_email(email):
    return '@' in email and '.' in email

# Pruebas unitarias
import unittest

class TestDiscountCalculator(unittest.TestCase):
    def test_calculate_discount(self):
        """Prueba el cálculo de descuento"""
        self.assertEqual(calculate_discount(100, 0.1), 10)
        self.assertEqual(calculate_discount(50, 0.2), 10)
        self.assertEqual(calculate_discount(0, 0.5), 0)
    
    def test_calculate_discount_edge_cases(self):
        """Prueba casos edge del cálculo de descuento"""
        self.assertEqual(calculate_discount(100, 0), 0)
        self.assertEqual(calculate_discount(100, 1), 100)

class TestEmailValidator(unittest.TestCase):
    def test_valid_emails(self):
        """Prueba emails válidos"""
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.org"
        ]
        for email in valid_emails:
            with self.subTest(email=email):
                self.assertTrue(validate_email(email))
    
    def test_invalid_emails(self):
        """Prueba emails inválidos"""
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "user@",
            "user.example.com"
        ]
        for email in invalid_emails:
            with self.subTest(email=email):
                self.assertFalse(validate_email(email))

if __name__ == '__main__':
    unittest.main()
'''
        
    def generate_refactoring_plan(self, code_analysis: Dict[str, Any]) -> List[RefactoringSuggestion]:
        """Genera plan de refactorización"""
        suggestions = []
        
        # Analizar problemas encontrados
        issues = code_analysis.get('issues_found', [])
        
        for issue in issues:
            issue_type = issue.get('type', '')
            
            if issue_type in self.refactoring_patterns:
                suggestion = self.refactoring_patterns[issue_type]
                suggestions.append(suggestion)
                
        return suggestions
        
    def get_generation_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del generador"""
        return {
            'improvement_templates': len(self.improvement_templates),
            'refactoring_patterns': len(self.refactoring_patterns),
            'optimization_strategies': len(self.optimization_strategies),
            'total_patterns': len(self.improvement_templates) + 
                             len(self.refactoring_patterns) + 
                             len(self.optimization_strategies)
        } 