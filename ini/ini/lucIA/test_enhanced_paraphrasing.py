#!/usr/bin/env python3
"""
Script de prueba para el sistema de parafraseo mejorado
"""

import asyncio
import sys
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from lucia_core import LucIACore
from config import PersonalityType

async def test_enhanced_paraphrasing():
    """Prueba el sistema de parafraseo mejorado"""
    
    print("🧪 Prueba del Sistema de Parafraseo Mejorado")
    print("=" * 50)
    
    # Inicializar LucIA
    lucia = LucIACore(
        name="LucIA Test",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Preguntas de prueba
    test_questions = [
        "¿Qué es el metaverso?",
        "¿Cómo puedo crear un avatar?",
        "¿Qué son los NFTs y para qué sirven?",
        "¿Puedes explicarme cómo funciona la realidad virtual?",
        "¿Cuál es la diferencia entre criptomonedas y tokens?"
    ]
    
    print(f"\n📝 Probando {len(test_questions)} preguntas...")
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{'='*60}")
        print(f"🔍 Pregunta {i}: {question}")
        print(f"{'='*60}")
        
        try:
            # Procesar con LucIA
            response = await lucia.chat(question)
            
            print(f"\n📤 Pregunta original: {question}")
            print(f"📥 Respuesta final: {response.paraphrased_response}")
            print(f"⏱️ Tiempo total: {response.processing_time:.2f}s")
            print(f"🎯 Confianza: {response.confidence:.2f}")
            print(f"📡 Fuente: {response.source_api}")
            
        except Exception as e:
            print(f"❌ Error en pregunta {i}: {e}")
            continue
    
    # Mostrar estadísticas finales
    stats = lucia.get_stats()
    print(f"\n{'='*60}")
    print("📊 ESTADÍSTICAS FINALES")
    print(f"{'='*60}")
    print(f"Total de peticiones: {stats['core_stats']['total_requests']}")
    print(f"Peticiones a APIs: {stats['core_stats']['api_requests']}")
    print(f"Peticiones a memoria: {stats['core_stats']['memory_requests']}")
    print(f"Tiempo promedio: {stats['core_stats']['total_processing_time'] / max(stats['core_stats']['total_requests'], 1):.2f}s")
    print(f"Confianza promedio: {stats['core_stats']['average_confidence']:.2f}")

async def test_specific_question():
    """Prueba una pregunta específica con más detalle"""
    
    print("\n🎯 Prueba Específica - Pregunta Detallada")
    print("=" * 50)
    
    lucia = LucIACore(
        name="LucIA Test",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    question = "¿Puedes explicarme de manera clara y sencilla qué es el metaverso y cómo funciona la tecnología blockchain en este contexto?"
    
    print(f"📝 Pregunta: {question}")
    print("\n🔄 Procesando...")
    
    try:
        response = await lucia.chat(question)
        
        print(f"\n✅ RESULTADO:")
        print(f"📤 Pregunta original: {question}")
        print(f"📥 Respuesta final: {response.paraphrased_response}")
        print(f"⏱️ Tiempo de procesamiento: {response.processing_time:.2f}s")
        print(f"🎯 Nivel de confianza: {response.confidence:.2f}")
        print(f"📡 Fuente de respuesta: {response.source_api}")
        print(f"🔑 Palabras clave: {', '.join(response.keywords)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas del sistema de parafraseo mejorado...")
    
    # Ejecutar pruebas
    asyncio.run(test_enhanced_paraphrasing())
    asyncio.run(test_specific_question())
    
    print("\n🎉 Pruebas completadas!")

if __name__ == "__main__":
    main() 