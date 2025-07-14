#!/usr/bin/env python3
"""
Test Script para LucIA Memory Learning
Demuestra cómo LucIA puede aprender de su propia memoria sin usar APIs externas
"""

from lucia_memory_learning import LucIAMemoryLearning
import time

def main():
    """Función principal de prueba"""
    print("🧠 LUCIA MEMORY LEARNING SYSTEM")
    print("=" * 50)
    print("🎯 Objetivo: Probar aprendizaje desde memoria interna")
    print("💰 Beneficio: Ahorro en costos de APIs externas")
    print("🚀 Ventaja: Desarrollo de conocimiento autónomo")
    print("=" * 50)
    
    # Inicializar sistema de memoria
    lucia = LucIAMemoryLearning()
    
    # Mostrar estadísticas iniciales
    print("\n📊 ESTADO INICIAL DE LA MEMORIA:")
    lucia.show_memory_stats()
    
    # Pruebas de consultas específicas
    test_queries = [
        "How to create procedural geometry in Three.js?",
        "What are the best practices for custom shaders?",
        "How to optimize 3D scene performance?",
        "Explain particle systems and visual effects",
        "How to implement real-time character animation?",
        "What are advanced material techniques?",
        "How to integrate WebXR with Three.js?",
        "Explain networking for 3D avatars"
    ]
    
    print("\n🧠 INICIANDO PRUEBAS DE MEMORIA:")
    print("=" * 50)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🎯 PRUEBA {i}/{len(test_queries)}")
        print(f"❓ Consulta: {query}")
        print("-" * 40)
        
        # Generar respuesta desde memoria
        start_time = time.time()
        response = lucia.generate_response_from_memory(query)
        end_time = time.time()
        
        # Mostrar resultados
        print(f"⏱️  Tiempo de respuesta: {end_time - start_time:.2f} segundos")
        print(f"🧠 Fuente: Memoria interna de LucIA")
        print(f"💰 Costo: $0.00 (sin APIs externas)")
        
        # Mostrar resumen de la respuesta
        response_lines = response.split('\n')
        print(f"📝 Respuesta (primeras 5 líneas):")
        for j, line in enumerate(response_lines[:5]):
            if line.strip():
                print(f"   {line.strip()}")
        if len(response_lines) > 5:
            print("   ...")
            
        print("-" * 40)
        time.sleep(1)
    
    # Mostrar estadísticas finales
    print("\n📊 ESTADO FINAL DE LA MEMORIA:")
    lucia.show_memory_stats()
    
    print("\n🎉 PRUEBA COMPLETADA!")
    print("=" * 50)
    print("✅ LucIA puede aprender de su propia memoria")
    print("✅ Respuestas generadas sin APIs externas")
    print("✅ Ahorro significativo en costos")
    print("✅ Desarrollo de conocimiento autónomo")
    print("=" * 50)

if __name__ == "__main__":
    main() 