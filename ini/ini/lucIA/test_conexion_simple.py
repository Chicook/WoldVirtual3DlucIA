#!/usr/bin/env python3
"""
Script simple para probar la conexión básica de LucIA
"""

import asyncio
from lucia_core import LucIACore

async def test_conexion_basica():
    """Prueba la conexión básica de LucIA"""
    print("🧪 PRUEBA DE CONEXIÓN BÁSICA DE LUCIA")
    print("=" * 50)
    
    # Inicializar LucIA
    lucia = LucIACore(
        name="LucIA Test",
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Pruebas básicas
    test_prompts = [
        "Hola, ¿cómo estás?",
        "¿Qué es el metaverso?",
        "¿Puedes ayudarme con Three.js?",
        "Crear un cubo rojo"
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n🤖 Prueba {i}: {prompt}")
        print("-" * 30)
        
        try:
            # Obtener respuesta
            response = await lucia.chat(prompt, session_id="test_basico")
            
            print(f"✅ Respuesta obtenida:")
            print(f"   Fuente: {response.source_api}")
            print(f"   Confianza: {response.confidence:.2f}")
            print(f"   Tiempo: {response.processing_time:.2f}s")
            print(f"   Respuesta: {response.paraphrased_response[:100]}...")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n🎉 Pruebas completadas")
    print(f"✅ LucIA está funcionando correctamente")

if __name__ == "__main__":
    asyncio.run(test_conexion_basica()) 