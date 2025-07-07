#!/usr/bin/env python3
"""
Script de prueba para el sistema de optimización de consultas
"""

import asyncio
import sys
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from lucia_core import LucIACore
from config import PersonalityType

async def test_query_optimization():
    """Prueba el sistema de optimización de consultas"""
    
    print("🧪 Prueba del Sistema de Optimización de Consultas")
    print("=" * 60)
    
    # Inicializar LucIA con optimización habilitada
    lucia = LucIACore(
        name="LucIA Optimizada",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True,
        enable_optimization=True,
        memory_interval=2  # Usar memoria cada 2 interacciones
    )
    
    # Preguntas de prueba para simular múltiples interacciones
    test_questions = [
        "¿Qué es el metaverso?",
        "¿Cómo puedo crear un avatar?",
        "¿Qué son los NFTs?",
        "¿Cómo funciona la realidad virtual?",
        "¿Cuál es la diferencia entre criptomonedas y tokens?",
        "¿Puedo ganar dinero en el metaverso?",
        "¿Qué es la blockchain?",
        "¿Cómo me conecto al metaverso?"
    ]
    
    print(f"\n📝 Probando {len(test_questions)} preguntas con optimización...")
    print(f"⚡ Configuración: Memoria cada {lucia.memory_interval} interacciones")
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{'='*70}")
        print(f"🔍 Interacción {i}: {question}")
        print(f"{'='*70}")
        
        try:
            # Procesar con LucIA
            response = await lucia.chat(question)
            
            print(f"\n📤 Pregunta: {question}")
            print(f"📥 Respuesta: {response.paraphrased_response}")
            print(f"⏱️ Tiempo: {response.processing_time:.2f}s")
            print(f"🎯 Confianza: {response.confidence:.2f}")
            print(f"📡 Fuente: {response.source_api}")
            print(f"🧠 Usó memoria: {'✅' if response.used_memory else '❌'}")
            
            # Mostrar estadísticas de optimización cada 4 interacciones
            if i % 4 == 0:
                stats = lucia.get_stats()
                if "optimization_stats" in stats:
                    opt_stats = stats["optimization_stats"]
                    print(f"\n📊 Estadísticas de optimización (interacción {i}):")
                    print(f"   🔢 Contador de interacciones: {opt_stats['interaction_counter']}")
                    print(f"   💰 Ahorro total: ${opt_stats['cost_savings']['total_saved']:.4f}")
                    print(f"   🧠 Respuestas de memoria: {opt_stats['cost_savings']['memory_responses']}")
                    print(f"   🚀 Respuestas de APIs: {opt_stats['cost_savings']['api_responses']}")
                    print(f"   ⏭️ Próxima memoria en: {opt_stats['next_memory_use']} interacciones")
            
        except Exception as e:
            print(f"❌ Error en interacción {i}: {e}")
            continue
    
    # Mostrar estadísticas finales
    print(f"\n{'='*70}")
    print("📊 ESTADÍSTICAS FINALES DE OPTIMIZACIÓN")
    print(f"{'='*70}")
    
    final_stats = lucia.get_stats()
    
    print(f"📈 Estadísticas generales:")
    print(f"   Total de peticiones: {final_stats['core_stats']['total_requests']}")
    print(f"   Peticiones a APIs: {final_stats['core_stats']['api_requests']}")
    print(f"   Peticiones a memoria: {final_stats['core_stats']['memory_requests']}")
    print(f"   Tiempo promedio: {final_stats['core_stats']['total_processing_time'] / max(final_stats['core_stats']['total_requests'], 1):.2f}s")
    print(f"   Confianza promedio: {final_stats['core_stats']['average_confidence']:.2f}")
    
    if "optimization_stats" in final_stats:
        opt_stats = final_stats["optimization_stats"]
        print(f"\n💰 Ahorros de optimización:")
        print(f"   Ahorro total estimado: ${opt_stats['cost_savings']['total_saved']:.4f}")
        print(f"   Respuestas de memoria: {opt_stats['cost_savings']['memory_responses']}")
        print(f"   Respuestas de APIs: {opt_stats['cost_savings']['api_responses']}")
        
        if opt_stats['cost_savings']['api_responses'] > 0:
            savings_percentage = (opt_stats['cost_savings']['memory_responses'] / 
                                (opt_stats['cost_savings']['memory_responses'] + opt_stats['cost_savings']['api_responses'])) * 100
            print(f"   Porcentaje de ahorro: {savings_percentage:.1f}%")
    
    print(f"\n💾 Estadísticas de memoria:")
    memory_stats = final_stats['memory_stats']
    print(f"   Total de entradas: {memory_stats.get('total_memory_entries', 0)}")
    print(f"   Entradas recientes: {memory_stats.get('recent_entries', 0)}")
    print(f"   Conversaciones: {memory_stats.get('total_conversations', 0)}")

async def test_optimization_configuration():
    """Prueba diferentes configuraciones de optimización"""
    
    print("\n🎛️ Prueba de Configuraciones de Optimización")
    print("=" * 60)
    
    # Probar diferentes intervalos de memoria
    intervals = [1, 2, 3, 5]
    
    for interval in intervals:
        print(f"\n🔧 Probando intervalo de memoria: cada {interval} interacciones")
        
        lucia = LucIACore(
            name=f"LucIA-{interval}",
            personality=PersonalityType.METAVERSE,
            enable_optimization=True,
            memory_interval=interval
        )
        
        # Hacer 6 preguntas para ver el patrón
        for i in range(1, 7):
            question = f"Pregunta de prueba {i}"
            response = await lucia.chat(question)
            
            print(f"   Interacción {i}: {'🧠' if response.used_memory else '🚀'} {response.source_api}")
        
        # Mostrar estadísticas
        stats = lucia.get_stats()
        if "optimization_stats" in stats:
            opt_stats = stats["optimization_stats"]
            print(f"   💰 Ahorro: ${opt_stats['cost_savings']['total_saved']:.4f}")
            print(f"   🧠 Memoria: {opt_stats['cost_savings']['memory_responses']}")
            print(f"   🚀 APIs: {opt_stats['cost_savings']['api_responses']}")

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas del sistema de optimización de consultas...")
    
    # Ejecutar pruebas
    asyncio.run(test_query_optimization())
    asyncio.run(test_optimization_configuration())
    
    print("\n🎉 Pruebas de optimización completadas!")

if __name__ == "__main__":
    main() 