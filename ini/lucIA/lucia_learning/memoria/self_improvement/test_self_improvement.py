#!/usr/bin/env python3
"""
Test Self Improvement - Script de Prueba del Sistema de Auto-mejora de LucIA
Prueba básica del sistema de auto-mejora integrado
"""

import sys
import logging
from pathlib import Path

# Añadir el directorio padre al path para importar módulos
current_dir = Path(__file__).parent
lucia_dir = current_dir.parent.parent.parent.parent  # Subir hasta lucIA/
sys.path.append(str(lucia_dir))

# Importar componentes del sistema
from lucia_learning.memoria.self_improvement.core.self_improvement import LucIASelfImprovement

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_self_improvement_system():
    """Prueba básica del sistema de auto-mejora"""
    print("🧪 Prueba del Sistema de Auto-mejora de LucIA")
    print("="*60)
    
    try:
        # 1. Probar clase principal
        print("\n1️⃣ Probando clase principal LucIASelfImprovement...")
        improvement = LucIASelfImprovement()
        print("✅ Clase principal inicializada correctamente")
        
        # 2. Probar análisis de código
        print("\n2️⃣ Probando análisis de código...")
        analysis = improvement.analyze_current_code()
        
        if 'error' in analysis:
            print(f"❌ Error en análisis: {analysis['error']}")
            return False
            
        print(f"✅ Análisis completado: {analysis.get('files_analyzed', 0)} archivos analizados")
        
        # 3. Probar detección de mejoras
        print("\n3️⃣ Probando detección de mejoras...")
        opportunities = improvement.detect_improvements(analysis)
        print(f"✅ Detección completada: {len(opportunities)} oportunidades encontradas")
        
        # 4. Probar generación de mejoras
        print("\n4️⃣ Probando generación de mejoras...")
        improvements = improvement.generate_improvements(opportunities)
        print(f"✅ Generación completada: {len(improvements)} mejoras generadas")
        
        # 5. Probar validación
        print("\n5️⃣ Probando validación de mejoras...")
        validation = improvement.validate_improvements(improvements)
        valid_count = sum(1 for v in validation if v.get('is_valid', False))
        print(f"✅ Validación completada: {valid_count}/{len(validation)} mejoras válidas")
        
        # 6. Mostrar resultados
        print("\n📊 RESULTADOS DE LA PRUEBA:")
        print("="*40)
        
        metrics = analysis.get('general_metrics', {})
        if metrics:
            print(f"📁 Archivos analizados: {metrics.get('files_analyzed', 0)}")
            print(f"📏 Líneas de código: {metrics.get('lines_of_code', 0):,}")
            print(f"🔧 Funciones encontradas: {metrics.get('functions', 0)}")
            print(f"🏗️ Clases encontradas: {metrics.get('classes', 0)}")
            print(f"🧠 Complejidad promedio: {metrics.get('average_complexity', 0):.1f}")
            print(f"📚 Documentación promedio: {metrics.get('average_documentation_coverage', 0):.1f}%")
            
        print(f"💡 Oportunidades detectadas: {len(opportunities)}")
        print(f"🛠️ Mejoras generadas: {len(improvements)}")
        print(f"✅ Mejoras válidas: {valid_count}")
        
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
                
        print("\n🎉 ¡Prueba completada exitosamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")
        logger.error(f"Error en prueba: {e}")
        return False

def test_specific_improvements():
    """Prueba mejoras específicas"""
    print("\n🔧 Prueba de Mejoras Específicas")
    print("="*40)
    
    try:
        improvement = LucIASelfImprovement()
        
        # Probar mejora de mantenibilidad
        print("\n📊 Probando mejora de mantenibilidad...")
        results = improvement.run_specific_improvement('maintainability')
        if 'error' not in results:
            print(f"✅ Mejora de mantenibilidad: {results.get('improvements_generated', 0)} mejoras generadas")
        else:
            print(f"⚠️ Mejora de mantenibilidad: {results.get('error', 'Error desconocido')}")
            
        # Probar mejora de documentación
        print("\n📚 Probando mejora de documentación...")
        results = improvement.run_specific_improvement('documentation')
        if 'error' not in results:
            print(f"✅ Mejora de documentación: {results.get('improvements_generated', 0)} mejoras generadas")
        else:
            print(f"⚠️ Mejora de documentación: {results.get('error', 'Error desconocido')}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de mejoras específicas: {e}")
        return False

def main():
    """Función principal de pruebas"""
    print("🧪 Sistema de Pruebas del Auto-mejora de LucIA")
    print("="*60)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ejecutar pruebas
    tests = [
        ("Sistema Completo", test_self_improvement_system),
        ("Mejoras Específicas", test_specific_improvements)
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
    from datetime import datetime
    exit(main()) 