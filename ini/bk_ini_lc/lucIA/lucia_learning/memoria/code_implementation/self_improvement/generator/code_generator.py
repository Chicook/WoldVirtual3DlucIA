#!/usr/bin/env python3
"""
Code Generator - Generador de Mejoras de Código para Auto-mejora de LucIA
Genera código mejorado basado en oportunidades detectadas
"""

import ast
import logging
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import re
from datetime import datetime

logger = logging.getLogger(__name__)

class CodeGenerator:
    """Generador de mejoras de código para el sistema de auto-mejora de LucIA"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.generated_improvements = []
        self.refactoring_templates = self._load_refactoring_templates()
        
    def _load_refactoring_templates(self) -> Dict[str, Any]:
        """Carga plantillas de refactorización"""
        return {
            'long_function': {
                'description': 'Dividir función larga en funciones más pequeñas',
                'strategy': 'extract_methods',
                'confidence': 0.9
            },
            'many_parameters': {
                'description': 'Agrupar parámetros en clase o estructura',
                'strategy': 'parameter_object',
                'confidence': 0.8
            },
            'deep_nesting': {
                'description': 'Extraer funciones para reducir anidamiento',
                'strategy': 'extract_conditions',
                'confidence': 0.85
            },
            'high_complexity': {
                'description': 'Simplificar lógica condicional',
                'strategy': 'early_returns',
                'confidence': 0.9
            },
            'magic_numbers': {
                'description': 'Reemplazar números mágicos con constantes',
                'strategy': 'extract_constants',
                'confidence': 0.95
            },
            'code_duplication': {
                'description': 'Extraer código duplicado a funciones comunes',
                'strategy': 'extract_common_code',
                'confidence': 0.8
            },
            'low_documentation': {
                'description': 'Añadir documentación y comentarios',
                'strategy': 'add_documentation',
                'confidence': 0.9
            },
            'performance_optimization': {
                'description': 'Optimizar rendimiento del código',
                'strategy': 'optimize_performance',
                'confidence': 0.7
            }
        }
        
    def generate_improvements(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Genera mejoras de código basadas en oportunidades"""
        logger.info("🛠️ Generando mejoras de código")
        
        improvements = []
        
        for opportunity in opportunities:
            improvement_type = opportunity.get('type', '')
            
            if improvement_type in self.refactoring_templates:
                improvement = self._generate_specific_improvement(opportunity)
                if improvement:
                    improvements.append(improvement)
            else:
                # Generar mejora genérica
                improvement = self._generate_generic_improvement(opportunity)
                if improvement:
                    improvements.append(improvement)
                    
        self.generated_improvements = improvements
        return improvements
        
    def _generate_specific_improvement(self, opportunity: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Genera mejora específica basada en el tipo"""
        improvement_type = opportunity.get('type', '')
        template = self.refactoring_templates.get(improvement_type)
        
        if not template:
            return None
            
        strategy = template.get('strategy', '')
        
        if strategy == 'extract_methods':
            return self._generate_extract_methods_improvement(opportunity)
        elif strategy == 'parameter_object':
            return self._generate_parameter_object_improvement(opportunity)
        elif strategy == 'extract_conditions':
            return self._generate_extract_conditions_improvement(opportunity)
        elif strategy == 'early_returns':
            return self._generate_early_returns_improvement(opportunity)
        elif strategy == 'extract_constants':
            return self._generate_extract_constants_improvement(opportunity)
        elif strategy == 'extract_common_code':
            return self._generate_extract_common_code_improvement(opportunity)
        elif strategy == 'add_documentation':
            return self._generate_add_documentation_improvement(opportunity)
        elif strategy == 'optimize_performance':
            return self._generate_performance_optimization_improvement(opportunity)
            
        return None
        
    def _generate_extract_methods_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para extraer métodos"""
        return {
            'type': 'extract_methods',
            'description': 'Dividir función larga en funciones más pequeñas',
            'original_code': self._get_long_function_example(),
            'improved_code': self._get_extracted_methods_example(),
            'benefits': [
                'Mejorar legibilidad',
                'Facilitar testing',
                'Reducir complejidad',
                'Mejorar mantenibilidad'
            ],
            'confidence': 0.9,
            'effort': 'medium',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_parameter_object_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para agrupar parámetros"""
        return {
            'type': 'parameter_object',
            'description': 'Agrupar parámetros en clase o estructura',
            'original_code': self._get_many_parameters_example(),
            'improved_code': self._get_parameter_object_example(),
            'benefits': [
                'Reducir número de parámetros',
                'Mejorar legibilidad',
                'Facilitar extensión',
                'Mejorar mantenibilidad'
            ],
            'confidence': 0.8,
            'effort': 'medium',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_extract_conditions_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para extraer condiciones"""
        return {
            'type': 'extract_conditions',
            'description': 'Extraer condiciones complejas a funciones',
            'original_code': self._get_complex_conditions_example(),
            'improved_code': self._get_extracted_conditions_example(),
            'benefits': [
                'Reducir anidamiento',
                'Mejorar legibilidad',
                'Facilitar testing',
                'Mejorar mantenibilidad'
            ],
            'confidence': 0.85,
            'effort': 'medium',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_early_returns_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para early returns"""
        return {
            'type': 'early_returns',
            'description': 'Simplificar lógica usando early returns',
            'original_code': self._get_nested_conditions_example(),
            'improved_code': self._get_early_returns_example(),
            'benefits': [
                'Reducir complejidad',
                'Mejorar legibilidad',
                'Eliminar anidamiento',
                'Mejorar mantenibilidad'
            ],
            'confidence': 0.9,
            'effort': 'low',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_extract_constants_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para extraer constantes"""
        return {
            'type': 'extract_constants',
            'description': 'Reemplazar números mágicos con constantes',
            'original_code': self._get_magic_numbers_example(),
            'improved_code': self._get_constants_example(),
            'benefits': [
                'Mejorar legibilidad',
                'Facilitar mantenimiento',
                'Reducir errores',
                'Mejorar documentación'
            ],
            'confidence': 0.95,
            'effort': 'low',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_extract_common_code_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para extraer código común"""
        return {
            'type': 'extract_common_code',
            'description': 'Extraer código duplicado a funciones comunes',
            'original_code': self._get_duplicated_code_example(),
            'improved_code': self._get_extracted_common_code_example(),
            'benefits': [
                'Eliminar duplicación',
                'Mejorar mantenibilidad',
                'Reducir errores',
                'Facilitar cambios'
            ],
            'confidence': 0.8,
            'effort': 'high',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_add_documentation_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para añadir documentación"""
        return {
            'type': 'add_documentation',
            'description': 'Añadir documentación y comentarios',
            'original_code': self._get_no_documentation_example(),
            'improved_code': self._get_with_documentation_example(),
            'benefits': [
                'Mejorar comprensión',
                'Facilitar mantenimiento',
                'Generar documentación automática',
                'Mejorar colaboración'
            ],
            'confidence': 0.9,
            'effort': 'low',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_performance_optimization_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora para optimización de rendimiento"""
        return {
            'type': 'performance_optimization',
            'description': 'Optimizar rendimiento del código',
            'original_code': self._get_slow_code_example(),
            'improved_code': self._get_optimized_code_example(),
            'benefits': [
                'Mejorar rendimiento',
                'Reducir uso de memoria',
                'Mejorar escalabilidad',
                'Optimizar recursos'
            ],
            'confidence': 0.7,
            'effort': 'medium',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    def _generate_generic_improvement(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Genera mejora genérica"""
        return {
            'type': 'generic_improvement',
            'description': opportunity.get('suggestion', 'Mejora general'),
            'original_code': '# Código original\n# Implementar mejora específica',
            'improved_code': '# Código mejorado\n# Implementar mejora específica',
            'benefits': [
                'Mejorar calidad del código',
                'Reducir problemas detectados',
                'Mejorar mantenibilidad'
            ],
            'confidence': 0.5,
            'effort': 'medium',
            'file_path': opportunity.get('file_path', ''),
            'line_number': opportunity.get('line_number')
        }
        
    # Ejemplos de código para las mejoras
    def _get_long_function_example(self) -> str:
        return '''
def process_user_data(user_data):
    """Procesa datos de usuario de forma compleja"""
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
    
    # Validar formato de email
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return None
    
    # Validar edad
    if age < 13:
        return None
    
    # Generar ID único
    import uuid
    user_id = str(uuid.uuid4())
    
    # Crear timestamp
    from datetime import datetime
    created_at = datetime.now()
    
    # Preparar resultado
    result = {
        'id': user_id,
        'name': name,
        'email': email,
        'age': age,
        'created_at': created_at,
        'status': 'active'
    }
    
    # Validar resultado final
    if not result['id'] or not result['name'] or not result['email']:
        return None
    
    return result
'''
        
    def _get_extracted_methods_example(self) -> str:
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
    email = email.lower().strip()
    
    # Validar formato de email
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return None
    return email

def process_age(age):
    """Procesa y valida la edad del usuario"""
    age = int(age) if age else 0
    if age < 13 or age > 150:
        return None
    return age

def generate_user_id():
    """Genera ID único para el usuario"""
    import uuid
    return str(uuid.uuid4())

def create_user_record(user_id, name, email, age):
    """Crea el registro final del usuario"""
    from datetime import datetime
    return {
        'id': user_id,
        'name': name,
        'email': email,
        'age': age,
        'created_at': datetime.now(),
        'status': 'active'
    }

def process_user_data(user_data):
    """Procesa datos de usuario de forma modular"""
    if not validate_user_data(user_data):
        return None
    
    name = process_name(user_data['name'])
    email = process_email(user_data['email'])
    age = process_age(user_data.get('age', 0))
    
    if not name or not email or age is None:
        return None
    
    user_id = generate_user_id()
    return create_user_record(user_id, name, email, age)
'''
        
    def _get_many_parameters_example(self) -> str:
        return '''
def create_user_profile(name, email, age, phone, address, city, country, 
                       occupation, company, salary, preferences, settings):
    """Crea perfil de usuario con muchos parámetros"""
    return {
        'name': name,
        'email': email,
        'age': age,
        'phone': phone,
        'address': address,
        'city': city,
        'country': country,
        'occupation': occupation,
        'company': company,
        'salary': salary,
        'preferences': preferences,
        'settings': settings
    }
'''
        
    def _get_parameter_object_example(self) -> str:
        return '''
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class UserPersonalInfo:
    name: str
    email: str
    age: int
    phone: str
    address: str
    city: str
    country: str

@dataclass
class UserProfessionalInfo:
    occupation: str
    company: str
    salary: float

@dataclass
class UserPreferences:
    preferences: Dict[str, Any]
    settings: Dict[str, Any]

def create_user_profile(personal_info: UserPersonalInfo, 
                       professional_info: UserProfessionalInfo,
                       user_preferences: UserPreferences):
    """Crea perfil de usuario usando objetos de parámetros"""
    return {
        'name': personal_info.name,
        'email': personal_info.email,
        'age': personal_info.age,
        'phone': personal_info.phone,
        'address': personal_info.address,
        'city': personal_info.city,
        'country': personal_info.country,
        'occupation': professional_info.occupation,
        'company': professional_info.company,
        'salary': professional_info.salary,
        'preferences': user_preferences.preferences,
        'settings': user_preferences.settings
    }
'''
        
    def _get_complex_conditions_example(self) -> str:
        return '''
def validate_user_access(user, resource, action, time, location):
    """Valida acceso de usuario con condiciones complejas"""
    if (user.is_active and 
        user.has_permission(resource, action) and 
        user.is_in_allowed_location(location) and 
        user.is_within_time_window(time) and 
        not user.is_blocked and 
        user.credits > 0 and 
        resource.is_available):
        return True
    return False
'''
        
    def _get_extracted_conditions_example(self) -> str:
        return '''
def is_user_active(user):
    """Verifica si el usuario está activo"""
    return user.is_active and not user.is_blocked

def has_valid_permissions(user, resource, action):
    """Verifica si el usuario tiene permisos válidos"""
    return user.has_permission(resource, action)

def is_valid_location(user, location):
    """Verifica si la ubicación es válida"""
    return user.is_in_allowed_location(location)

def is_valid_time(user, time):
    """Verifica si el tiempo es válido"""
    return user.is_within_time_window(time)

def has_sufficient_credits(user):
    """Verifica si el usuario tiene créditos suficientes"""
    return user.credits > 0

def is_resource_available(resource):
    """Verifica si el recurso está disponible"""
    return resource.is_available

def validate_user_access(user, resource, action, time, location):
    """Valida acceso de usuario con condiciones extraídas"""
    if (is_user_active(user) and 
        has_valid_permissions(user, resource, action) and 
        is_valid_location(user, location) and 
        is_valid_time(user, time) and 
        has_sufficient_credits(user) and 
        is_resource_available(resource)):
        return True
    return False
'''
        
    def _get_nested_conditions_example(self) -> str:
        return '''
def process_order(order):
    """Procesa orden con condiciones anidadas"""
    if order is not None:
        if order.items:
            if order.customer:
                if order.customer.is_active:
                    if order.payment:
                        if order.payment.is_valid:
                            if order.shipping:
                                if order.shipping.is_available:
                                    return "Order processed successfully"
                                else:
                                    return "Shipping not available"
                            else:
                                return "No shipping information"
                        else:
                            return "Invalid payment"
                    else:
                        return "No payment information"
                else:
                    return "Customer not active"
            else:
                return "No customer information"
        else:
            return "No items in order"
    else:
        return "No order provided"
'''
        
    def _get_early_returns_example(self) -> str:
        return '''
def process_order(order):
    """Procesa orden usando early returns"""
    if order is None:
        return "No order provided"
    
    if not order.items:
        return "No items in order"
    
    if not order.customer:
        return "No customer information"
    
    if not order.customer.is_active:
        return "Customer not active"
    
    if not order.payment:
        return "No payment information"
    
    if not order.payment.is_valid:
        return "Invalid payment"
    
    if not order.shipping:
        return "No shipping information"
    
    if not order.shipping.is_available:
        return "Shipping not available"
    
    return "Order processed successfully"
'''
        
    def _get_magic_numbers_example(self) -> str:
        return '''
def calculate_discount(price, customer_type):
    """Calcula descuento con números mágicos"""
    if customer_type == "vip":
        return price * 0.25
    elif customer_type == "regular":
        return price * 0.10
    elif customer_type == "new":
        return price * 0.05
    else:
        return 0

def validate_age(age):
    """Valida edad con números mágicos"""
    if age < 13:
        return False
    elif age > 65:
        return False
    else:
        return True

def calculate_interest(amount, years):
    """Calcula interés con números mágicos"""
    rate = 0.05
    if years > 10:
        rate = 0.07
    elif years > 5:
        rate = 0.06
    
    return amount * rate * years
'''
        
    def _get_constants_example(self) -> str:
        return '''
# Constantes de descuento
VIP_DISCOUNT_RATE = 0.25
REGULAR_DISCOUNT_RATE = 0.10
NEW_CUSTOMER_DISCOUNT_RATE = 0.05

# Constantes de edad
MIN_AGE = 13
MAX_AGE = 65

# Constantes de interés
BASE_INTEREST_RATE = 0.05
MEDIUM_TERM_RATE = 0.06
LONG_TERM_RATE = 0.07
MEDIUM_TERM_YEARS = 5
LONG_TERM_YEARS = 10

def calculate_discount(price, customer_type):
    """Calcula descuento usando constantes"""
    if customer_type == "vip":
        return price * VIP_DISCOUNT_RATE
    elif customer_type == "regular":
        return price * REGULAR_DISCOUNT_RATE
    elif customer_type == "new":
        return price * NEW_CUSTOMER_DISCOUNT_RATE
    else:
        return 0

def validate_age(age):
    """Valida edad usando constantes"""
    if age < MIN_AGE:
        return False
    elif age > MAX_AGE:
        return False
    else:
        return True

def calculate_interest(amount, years):
    """Calcula interés usando constantes"""
    if years > LONG_TERM_YEARS:
        rate = LONG_TERM_RATE
    elif years > MEDIUM_TERM_YEARS:
        rate = MEDIUM_TERM_RATE
    else:
        rate = BASE_INTEREST_RATE
    
    return amount * rate * years
'''
        
    def _get_duplicated_code_example(self) -> str:
        return '''
def process_user_data(user_data):
    """Procesa datos de usuario"""
    if not user_data:
        return None
    
    name = user_data.get('name', '')
    if not name:
        return None
    
    email = user_data.get('email', '')
    if not email:
        return None
    
    # Validar email
    if '@' not in email:
        return None
    
    return {'name': name, 'email': email}

def process_employee_data(employee_data):
    """Procesa datos de empleado"""
    if not employee_data:
        return None
    
    name = employee_data.get('name', '')
    if not name:
        return None
    
    email = employee_data.get('email', '')
    if not email:
        return None
    
    # Validar email
    if '@' not in email:
        return None
    
    return {'name': name, 'email': email}
'''
        
    def _get_extracted_common_code_example(self) -> str:
        return '''
def validate_required_fields(data, required_fields):
    """Valida campos requeridos"""
    if not data:
        return False
    
    for field in required_fields:
        if not data.get(field):
            return False
    
    return True

def validate_email(email):
    """Valida formato de email"""
    if not email or '@' not in email:
        return False
    return True

def extract_name_and_email(data):
    """Extrae nombre y email de los datos"""
    name = data.get('name', '')
    email = data.get('email', '')
    
    if not name or not validate_email(email):
        return None, None
    
    return name, email

def process_user_data(user_data):
    """Procesa datos de usuario"""
    if not validate_required_fields(user_data, ['name', 'email']):
        return None
    
    name, email = extract_name_and_email(user_data)
    if not name or not email:
        return None
    
    return {'name': name, 'email': email}

def process_employee_data(employee_data):
    """Procesa datos de empleado"""
    if not validate_required_fields(employee_data, ['name', 'email']):
        return None
    
    name, email = extract_name_and_email(employee_data)
    if not name or not email:
        return None
    
    return {'name': name, 'email': email}
'''
        
    def _get_no_documentation_example(self) -> str:
        return '''
def calculate_discount(price, discount_rate):
    return price * discount_rate

def validate_email(email):
    return '@' in email and '.' in email

def process_user_data(user_data):
    if not user_data:
        return None
    name = user_data.get('name', '')
    email = user_data.get('email', '')
    if not name or not email:
        return None
    return {'name': name, 'email': email}
'''
        
    def _get_with_documentation_example(self) -> str:
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

def process_user_data(user_data: dict) -> dict:
    """
    Procesa datos de usuario y valida campos requeridos.
    
    Args:
        user_data: Diccionario con datos del usuario
    
    Returns:
        dict: Diccionario con datos procesados o None si hay errores
    """
    if not user_data:
        return None
    
    name = user_data.get('name', '')
    email = user_data.get('email', '')
    
    if not name or not email:
        return None
    
    return {'name': name, 'email': email}
'''
        
    def _get_slow_code_example(self) -> str:
        return '''
def find_duplicates(items):
    """Encuentra duplicados usando lista"""
    duplicates = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates

def process_large_list(data):
    """Procesa lista grande de forma ineficiente"""
    result = []
    for item in data:
        processed = item.upper() + " processed"
        result.append(processed)
    return result
'''
        
    def _get_optimized_code_example(self) -> str:
        return '''
def find_duplicates(items):
    """Encuentra duplicados usando set"""
    seen = set()
    duplicates = set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return list(duplicates)

def process_large_list(data):
    """Procesa lista grande usando generador"""
    for item in data:
        yield item.upper() + " processed"
'''
        
    def get_generation_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de generación"""
        if not self.generated_improvements:
            return {}
            
        stats = {
            'total_improvements': len(self.generated_improvements),
            'types': {},
            'average_confidence': 0,
            'effort_distribution': {}
        }
        
        total_confidence = 0
        
        for improvement in self.generated_improvements:
            # Contar tipos
            imp_type = improvement.get('type', 'unknown')
            stats['types'][imp_type] = stats['types'].get(imp_type, 0) + 1
            
            # Confianza promedio
            total_confidence += improvement.get('confidence', 0)
            
            # Distribución de esfuerzo
            effort = improvement.get('effort', 'medium')
            stats['effort_distribution'][effort] = stats['effort_distribution'].get(effort, 0) + 1
            
        stats['average_confidence'] = total_confidence / len(self.generated_improvements)
        
        return stats 