#!/usr/bin/env python3
"""
Test Self Improvement - Script de Prueba del Sistema de Auto-mejora de LucIA
Demuestra las capacidades del sistema de auto-mejora integrado
"""

import sys
import logging
from pathlib import Path
from datetime import datetime

# Añadir el directorio padre al path para importar módulos
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

# Importar componentes del sistema
from memoria.self_improvement.core.self_improvement import LucIASelfImprovement
from memoria.self_improvement.analyzer.code_analyzer import CodeAnalyzer
from memoria.self_improvement.detector.improvement_detector import ImprovementDetector
from memoria.self_improvement.generator.code_generator import CodeGenerator
from memoria.self_improvement.validator.validation_engine import ValidationEngine

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_self_improvement_system():
    """Prueba el sistema completo de auto-mejora"""
    print("🧪 Prueba del Sistema de Auto-mejora de LucIA")
    print("="*60)
    
    try:
        # 1. Probar clase principal
        print("\n1️⃣ Probando clase principal LucIASelfImprovement...")
        improvement = LucIASelfImprovement()
        print("✅ Clase principal inicializada correctamente")
        
        # 2. Probar analizador de código
        print("\n2️⃣ Probando analizador de código...")
        analyzer = CodeAnalyzer()
        
        # Crear archivo de prueba
        test_file = Path(__file__).parent / "test_code.py"
        test_code = '''
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
    
    result = {
        'name': name,
        'email': email,
        'age': age,
        'processed_at': datetime.now()
    }
    
    return result
'''
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(test_code)
            
        # Analizar archivo de prueba
        analysis = analyzer.analyze_file(test_file)
        print(f"✅ Análisis completado: {analysis.get('lines_of_code', 0)} líneas analizadas")
        
        # 3. Probar detector de mejoras
        print("\n3️⃣ Probando detector de mejoras...")
        detector = ImprovementDetector()
        
        # Crear análisis simulado
        mock_analysis = {
            'file_analyses': {
                str(test_file): analysis
            }
        }
        
        opportunities = detector.detect_improvements(mock_analysis)
        print(f"✅ Detección completada: {len(opportunities)} oportunidades encontradas")
        
        # 4. Probar generador de mejoras
        print("\n4️⃣ Probando generador de mejoras...")
        generator = CodeGenerator()
        
        improvements = generator.generate_improvements(opportunities)
        print(f"✅ Generación completada: {len(improvements)} mejoras generadas")
        
        # 5. Probar validador
        print("\n5️⃣ Probando validador de mejoras...")
        validator = ValidationEngine()
        
        validation_results = validator.run_comprehensive_validation(improvements)
        print(f"✅ Validación completada: {validation_results.get('summary', {}).get('valid_improvements', 0)} mejoras válidas")
        
        # 6. Mostrar resultados
        print("\n📊 RESULTADOS DE LA PRUEBA:")
        print("="*40)
        
        print(f"📁 Archivo analizado: {test_file.name}")
        print(f"📏 Líneas de código: {analysis.get('lines_of_code', 0)}")
        print(f"🔧 Funciones encontradas: {analysis.get('basic_analysis', {}).get('functions', 0)}")
        print(f"💡 Oportunidades detectadas: {len(opportunities)}")
        print(f"🛠️ Mejoras generadas: {len(improvements)}")
        print(f"✅ Mejoras válidas: {validation_results.get('summary', {}).get('valid_improvements', 0)}")
        
        # Mostrar algunas oportunidades
        if opportunities:
            print(f"\n🎯 Oportunidades detectadas:")
            for i, opp in enumerate(opportunities[:3], 1):
                print(f"   {i}. {opp.get('description', 'Sin descripción')} (Prioridad: {opp.get('priority', 'N/A')})")
                
        # Mostrar algunas mejoras
        if improvements:
            print(f"\n🛠️ Mejoras generadas:")
            for i, imp in enumerate(improvements[:3], 1):
                print(f"   {i}. {imp.get('description', 'Sin descripción')} (Confianza: {imp.get('confidence', 0):.2f})")
                
        # Mostrar problemas de validación
        issue_distribution = validation_results.get('issue_distribution', {})
        if issue_distribution:
            print(f"\n🚨 Problemas de validación:")
            for issue_type, count in issue_distribution.items():
                print(f"   • {issue_type}: {count}")
                
        # Limpiar archivo de prueba
        test_file.unlink()
        
        print("\n🎉 ¡Prueba completada exitosamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")
        logger.error(f"Error en prueba: {e}")
        return False

def test_specific_components():
    """Prueba componentes específicos del sistema"""
    print("\n🔧 Prueba de Componentes Específicos")
    print("="*50)
    
    try:
        # Probar análisis de código específico
        print("\n📊 Probando análisis de código específico...")
        analyzer = CodeAnalyzer()
        
        # Código de prueba con problemas conocidos
        test_code = '''
def bad_function_with_many_parameters(param1, param2, param3, param4, param5, param6, param7, param8):
    """Función con muchos parámetros"""
    if param1 and param2 and param3 and param4 and param5 and param6 and param7 and param8:
        result = param1 + param2 + param3 + param4 + param5 + param6 + param7 + param8
        if result > 100:
            if result > 200:
                if result > 300:
                    if result > 400:
                        if result > 500:
                            return "Very high result"
                        else:
                            return "High result"
                    else:
                        return "Medium result"
                else:
                    return "Low result"
            else:
                return "Very low result"
        else:
            return "No result"
    return None

def function_with_magic_numbers():
    """Función con números mágicos"""
    if age < 13:
        return False
    elif age > 65:
        return False
    else:
        return True

def function_without_docstring(param):
    return param * 2
'''
        
        # Crear archivo temporal
        temp_file = Path(__file__).parent / "temp_test.py"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(test_code)
            
        # Analizar
        analysis = analyzer.analyze_file(temp_file)
        
        # Probar detección específica
        detector = ImprovementDetector()
        mock_analysis = {'file_analyses': {str(temp_file): analysis}}
        opportunities = detector.detect_improvements(mock_analysis)
        
        print(f"✅ Análisis específico completado")
        print(f"   • Problemas detectados: {len(opportunities)}")
        
        # Mostrar problemas específicos
        for opp in opportunities:
            print(f"   • {opp.get('type', 'N/A')}: {opp.get('description', 'Sin descripción')}")
            
        # Limpiar
        temp_file.unlink()
        
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de componentes: {e}")
        return False

def test_improvement_generation():
    """Prueba la generación de mejoras específicas"""
    print("\n🛠️ Prueba de Generación de Mejoras")
    print("="*40)
    
    try:
        generator = CodeGenerator()
        
        # Crear oportunidades de prueba
        test_opportunities = [
            {
                'type': 'long_function',
                'description': 'Función muy larga detectada',
                'priority': 'high',
                'impact': 'high',
                'file_path': 'test.py',
                'line_number': 10
            },
            {
                'type': 'many_parameters',
                'description': 'Función con muchos parámetros',
                'priority': 'medium',
                'impact': 'medium',
                'file_path': 'test.py',
                'line_number': 20
            },
            {
                'type': 'magic_numbers',
                'description': 'Números mágicos detectados',
                'priority': 'low',
                'impact': 'medium',
                'file_path': 'test.py',
                'line_number': 30
            }
        ]
        
        # Generar mejoras
        improvements = generator.generate_improvements(test_opportunities)
        
        print(f"✅ Generación completada: {len(improvements)} mejoras generadas")
        
        # Mostrar mejoras generadas
        for i, improvement in enumerate(improvements, 1):
            print(f"\n{i}. {improvement.get('type', 'N/A')}")
            print(f"   Descripción: {improvement.get('description', 'Sin descripción')}")
            print(f"   Confianza: {improvement.get('confidence', 0):.2f}")
            print(f"   Beneficios: {', '.join(improvement.get('benefits', []))}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de generación: {e}")
        return False

def test_validation_system():
    """Prueba el sistema de validación"""
    print("\n✅ Prueba del Sistema de Validación")
    print("="*40)
    
    try:
        validator = ValidationEngine()
        
        # Crear mejoras de prueba
        test_improvements = [
            {
                'type': 'extract_methods',
                'description': 'Dividir función larga',
                'improved_code': '''
def validate_user_data(user_data):
    """Valida datos de usuario"""
    if not user_data:
        return False
    return True

def process_user_data(user_data):
    """Procesa datos de usuario"""
    if not validate_user_data(user_data):
        return None
    return {'status': 'processed'}
''',
                'confidence': 0.9,
                'file_path': 'test.py'
            },
            {
                'type': 'add_documentation',
                'description': 'Añadir documentación',
                'improved_code': '''
def calculate_discount(price: float, rate: float) -> float:
    """
    Calcula descuento.
    
    Args:
        price: Precio original
        rate: Tasa de descuento
    
    Returns:
        float: Descuento calculado
    """
    return price * rate
''',
                'confidence': 0.95,
                'file_path': 'test.py'
            }
        ]
        
        # Validar mejoras
        validation_results = validator.run_comprehensive_validation(test_improvements)
        
        print(f"✅ Validación completada")
        print(f"   • Mejoras validadas: {validation_results.get('summary', {}).get('valid_improvements', 0)}")
        print(f"   • Puntuación promedio: {validation_results.get('summary', {}).get('average_score', 0):.2f}")
        
        # Mostrar detalles de validación
        for i, result in enumerate(validation_results.get('validation_results', []), 1):
            print(f"\n{i}. {result.get('improvement_type', 'N/A')}")
            print(f"   Válido: {'✅' if result.get('is_valid') else '❌'}")
            print(f"   Puntuación: {result.get('score', 0):.2f}")
            if result.get('issues'):
                print(f"   Problemas: {len(result.get('issues', []))}")
            if result.get('warnings'):
                print(f"   Advertencias: {len(result.get('warnings', []))}")
                
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de validación: {e}")
        return False

def main():
    """Función principal de pruebas"""
    print("🧪 Sistema de Pruebas del Auto-mejora de LucIA")
    print("="*60)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ejecutar pruebas
    tests = [
        ("Sistema Completo", test_self_improvement_system),
        ("Componentes Específicos", test_specific_components),
        ("Generación de Mejoras", test_improvement_generation),
        ("Sistema de Validación", test_validation_system)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
            print(f"{'✅ PASÓ' if result else '❌ FALLÓ'}: {test_name}")
        except Exception as e:
            print(f"❌ ERROR: {test_name} - {e}")
            results.append((test_name, False))
            
    # Resumen final
    print(f"\n{'='*60}")
    print("📊 RESUMEN DE PRUEBAS")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{status}: {test_name}")
        
    print(f"\n🎯 Resultado Final: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron exitosamente!")
        return 0
    else:
        print("⚠️ Algunas pruebas fallaron. Revisar errores.")
        return 1

if __name__ == "__main__":
    exit(main()) 