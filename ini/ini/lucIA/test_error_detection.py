#!/usr/bin/env python3
"""
Script de prueba para el sistema de detección y corrección de errores de código
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from paraphraser import Paraphraser, ParaphraseConfig, PersonalityType
import asyncio

async def test_error_detection():
    """Prueba el sistema de detección y corrección de errores"""
    
    print("🔍 Probando sistema de detección y corrección de errores...")
    print("=" * 70)
    
    # Crear instancia del parafraseador
    paraphraser = Paraphraser(ParaphraseConfig(
        personality=PersonalityType.FRIENDLY,
        confidence_threshold=0.7
    ))
    
    # Códigos con errores comunes para probar
    test_codes_with_errors = {
        "python_indentation": '''
def get_data():
data = []
for i in range(10):
data.append(i * 2)
return data
''',
        "python_missing_colon": '''
def get_data()
    data = []
    for i in range(10)
        data.append(i * 2)
    return data
''',
        "python_missing_return": '''
def process_data(items):
    result = []
    for item in items:
        if item > 0:
            result.append(item * 2)
''',
        "javascript_missing_semicolons": '''
function getData() {
    const data = []
    for (let i = 0; i < 10; i++) {
        data.push(i * 2)
    }
    return data
}
''',
        "javascript_missing_braces": '''
function getData() {
    const data = []
    for (let i = 0; i < 10; i++)
        data.push(i * 2)
    return data
}
''',
        "javascript_undefined_variables": '''
function processData() {
    data = []
    for (let i = 0; i < 10; i++) {
        data.push(i * 2)
    }
    return data
}
''',
        "java_missing_semicolons": '''
public class DataProcessor {
    public List<Integer> processData(List<Integer> items) {
        List<Integer> result = new ArrayList<>()
        for (Integer item : items) {
            if (item > 0) {
                result.add(item * 2)
            }
        }
        return result
    }
}
''',
        "cpp_missing_semicolons": '''
#include <iostream>
#include <vector>

int main() {
    std::vector<int> data
    for (int i = 0; i < 10; i++) {
        data.push_back(i * 2)
    }
    return 0
}
'''
    }
    
    # Probar detección y corrección de errores
    for test_name, code_with_errors in test_codes_with_errors.items():
        print(f"\n🧪 Probando: {test_name}")
        print("-" * 50)
        
        # Detectar lenguaje
        language = paraphraser._detect_code_language(code_with_errors)
        print(f"Lenguaje detectado: {language}")
        
        # Detectar errores
        errors = paraphraser._detect_common_errors(code_with_errors, language)
        print(f"Errores detectados: {len(errors)}")
        for error in errors:
            print(f"  ❌ {error}")
        
        # Aplicar correcciones
        corrected_code = paraphraser._validate_and_fix_code(code_with_errors, language)
        
        print(f"\n📝 Código original con errores:")
        print(code_with_errors)
        
        print(f"\n✅ Código corregido:")
        print(corrected_code)
        
        # Validar sintaxis después de corrección
        is_valid = paraphraser._validate_syntax(corrected_code, language)
        print(f"\n🔍 Sintaxis válida después de corrección: {'✅ Sí' if is_valid else '❌ No'}")
        
        print("\n" + "=" * 70)
    
    # Probar parafraseo completo con corrección de errores
    print("\n🎯 Probando parafraseo completo con corrección de errores:")
    print("-" * 50)
    
    problematic_code = '''
def get_data():
data = []
for i in range(10):
data.append(i * 2)
return data

class DataProcessor:
def __init__(self):
self.config = {}

def process_items(self, items):
result = []
for item in items:
if item > 0:
result.append(item * 2)
'''
    
    print("Código original con múltiples errores:")
    print(problematic_code)
    
    # Aplicar parafraseo completo (incluye corrección de errores)
    paraphrased_and_fixed = paraphraser.paraphrase_code(problematic_code, "python")
    
    print("\nCódigo parafraseado y corregido:")
    print(paraphrased_and_fixed)
    
    # Validar sintaxis final
    final_validation = paraphraser._validate_syntax(paraphrased_and_fixed, "python")
    print(f"\n🔍 Sintaxis final válida: {'✅ Sí' if final_validation else '❌ No'}")
    
    print("\n" + "=" * 70)
    
    # Probar casos edge
    print("\n🚀 Probando casos edge:")
    print("-" * 30)
    
    edge_cases = {
        "código_vacío": "",
        "solo_comentarios": "# Este es un comentario\n# Otro comentario",
        "código_inválido": "def invalid code here",
        "mezcla_lenguajes": '''
def python_function():
    return "python"

function javascriptFunction() {
    return "javascript";
}
'''
    }
    
    for case_name, edge_code in edge_cases.items():
        print(f"\n📋 Caso: {case_name}")
        print(f"Código: {repr(edge_code)}")
        
        try:
            language = paraphraser._detect_code_language(edge_code)
            errors = paraphraser._detect_common_errors(edge_code, language)
            corrected = paraphraser._validate_and_fix_code(edge_code, language)
            
            print(f"Lenguaje: {language}")
            print(f"Errores: {len(errors)}")
            print(f"Corregido: {repr(corrected)}")
            
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n✅ Pruebas de detección y corrección completadas!")
    print("\n🎯 Beneficios del sistema de detección de errores:")
    print("   • 🔍 Detección automática de errores comunes")
    print("   • 🛠️ Corrección automática de sintaxis")
    print("   • 🛡️ Prevención de código inválido")
    print("   • 📊 Logging detallado de errores")
    print("   • 🔄 Validación múltiple de correcciones")
    print("   • 🌐 Soporte multi-lenguaje")
    print("   • ⚡ Corrección en tiempo real")

if __name__ == "__main__":
    asyncio.run(test_error_detection()) 