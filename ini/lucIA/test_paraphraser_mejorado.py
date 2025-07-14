#!/usr/bin/env python3
"""
Script para probar el sistema de parafraseo mejorado
"""

import asyncio
from paraphraser import Paraphraser, ParaphraseConfig
from memory import MemoryManager
from config import PersonalityType

async def test_paraphraser():
    """Prueba el sistema de parafraseo mejorado"""
    
    print("🧪 PROBANDO SISTEMA DE PARAFRASEO MEJORADO")
    print("="*60)
    
    # Crear paraphraser
    config = ParaphraseConfig(
        personality=PersonalityType.METAVERSE,
        confidence_threshold=0.8,
        max_attempts=3,
        preserve_meaning=True,
        add_personality=True
    )
    
    paraphraser = Paraphraser(config)
    memory_manager = MemoryManager()
    
    # Preguntas de prueba
    test_prompts = [
        "¿Cómo puedo mejorar el rendimiento de mi código?",
        "¿Qué es el metaverso?",
        "¿Cómo funciona la memoria de LucIA?",
        "¿Puedes ayudarme con programación?",
        "¿Cuáles son las prioridades para crear un metaverso?"
    ]
    
    print("\n🔄 Probando parafraseo desde memoria:")
    print("-" * 40)
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n📝 Pregunta {i}: {prompt}")
        
        # Probar parafraseo desde memoria
        try:
            response = paraphraser.paraphrase_from_memory(prompt)
            print(f"🤖 Respuesta: {response}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("-" * 40)
    
    # Probar múltiples respuestas para la misma pregunta
    print("\n🔄 Probando variabilidad (misma pregunta, diferentes respuestas):")
    print("-" * 40)
    
    test_prompt = "¿Cómo funciona la memoria de LucIA?"
    print(f"📝 Pregunta: {test_prompt}")
    
    for i in range(3):
        try:
            response = paraphraser.paraphrase_from_memory(test_prompt)
            print(f"🤖 Respuesta {i+1}: {response}")
        except Exception as e:
            print(f"❌ Error: {e}")
        print("-" * 20)
    
    # Probar con memoria manager
    print("\n🔄 Probando con MemoryManager:")
    print("-" * 40)
    
    for prompt in test_prompts[:2]:
        print(f"\n📝 Pregunta: {prompt}")
        
        try:
            memory_entry = memory_manager.generate_response_from_memory(prompt, paraphraser)
            if memory_entry:
                print(f"🤖 Respuesta: {memory_entry.paraphrased_response}")
                print(f"📊 Confianza: {memory_entry.confidence}")
                print(f"🔗 Fuente: {memory_entry.source_api}")
            else:
                print("❌ No se encontró respuesta en memoria")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("-" * 40)

if __name__ == "__main__":
    asyncio.run(test_paraphraser()) 