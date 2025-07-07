#!/usr/bin/env python3
"""
Script para probar la pregunta específica del usuario
"""

import asyncio
from lucia_core import LucIACore
from config import PersonalityType

async def test_specific_question():
    """Prueba la pregunta específica del usuario"""
    
    print("🎭 PROBANDO PREGUNTA ESPECÍFICA DEL USUARIO")
    print("=" * 60)
    
    # Inicializar LucIA
    lucia = LucIACore(
        name="LucIA",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Pregunta específica del usuario
    question = "¿Puedes generar un avatar 3D femenino en Three.js?"
    
    print(f"Pregunta: {question}")
    print("-" * 40)
    
    try:
        # Obtener respuesta de LucIA
        response = await lucia.chat(question)
        
        print(f"Respuesta de LucIA:")
        print(f"📝 Original: {response.original_response}")
        print(f"🔄 Parafraseada: {response.paraphrased_response}")
        print(f"🎯 Confianza: {response.confidence:.2f}")
        print(f"⚡ Tiempo: {response.processing_time:.2f}s")
        print(f"🔗 API: {response.source_api}")
        
        # Verificar si contiene código Three.js
        if "THREE." in response.paraphrased_response or "new THREE" in response.paraphrased_response:
            print("🎯 ¡CÓDIGO THREE.JS DETECTADO!")
        else:
            print("⚠️ No se detectó código Three.js específico")
        
        # Verificar si menciona características femeninas
        if "femenino" in response.paraphrased_response.lower() or "mujer" in response.paraphrased_response.lower():
            print("👩 ¡CARACTERÍSTICAS FEMENINAS MENCIONADAS!")
        else:
            print("⚠️ No se mencionan características femeninas")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_specific_question()) 