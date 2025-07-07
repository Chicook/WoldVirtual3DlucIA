"""
Script de inicio rápido para LucIA Pro
Permite probar la IA sin configuración completa
"""

import asyncio
import sys
from pathlib import Path

def check_files():
    """Verifica que todos los archivos necesarios estén presentes"""
    required_files = [
        "config.py",
        "memory.py", 
        "api_manager.py",
        "paraphraser.py",
        "lucia_core.py",
        "lucIA.py"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("❌ Archivos faltantes:")
        for file in missing_files:
            print(f"   - {file}")
        print("\n💡 Ejecuta 'python install.py' para configurar todo")
        return False
    
    return True

def quick_test():
    """Prueba rápida de la IA"""
    print("🧪 Prueba rápida de LucIA Pro")
    print("=" * 40)
    
    try:
        # Importar módulos básicos
        from config import config, PersonalityType
        print("✅ Configuración cargada")
        
        from memory import MemoryManager
        memory = MemoryManager()
        print("✅ Sistema de memoria funcionando")
        
        from paraphraser import Paraphraser, ParaphraseConfig
        paraphraser = Paraphraser(ParaphraseConfig(personality=PersonalityType.METAVERSE))
        print("✅ Sistema de parafraseo funcionando")
        
        # Prueba de parafraseo
        test_text = "El metaverso es un mundo virtual 3D"
        paraphrased = paraphraser.paraphrase(test_text)
        print(f"✅ Parafraseo: '{test_text}' → '{paraphrased}'")
        
        # Prueba de respuesta local
        from lucia_core import LucIACore
        lucia = LucIACore(
            personality=PersonalityType.METAVERSE,
            enable_memory=True,
            enable_paraphrasing=True
        )
        print("✅ Núcleo de IA funcionando")
        
        print("\n🎉 ¡Todo funciona correctamente!")
        print("🚀 Puedes ejecutar 'python lucIA.py' para usar la IA completa")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba: {e}")
        return False

def demo_conversation():
    """Demo de conversación rápida"""
    print("\n💬 Demo de conversación")
    print("=" * 40)
    
    try:
        from lucia_core import LucIACore
        from config import PersonalityType
        
        # Crear IA
        lucia = LucIACore(
            personality=PersonalityType.METAVERSE,
            enable_memory=True,
            enable_paraphrasing=True
        )
        
        # Preguntas de demo
        demo_questions = [
            "¿Qué es el metaverso?",
            "¿Cómo funcionan los avatares?",
            "¿Qué son los NFTs?",
            "¿Puedo crear mi propio mundo virtual?"
        ]
        
        async def run_demo():
            print("🤖 Iniciando demo...")
            
            for i, question in enumerate(demo_questions, 1):
                print(f"\n{i}. 👤 Usuario: {question}")
                
                response = await lucia.chat(question)
                
                source = "Memoria" if response.used_memory else response.source_api
                print(f"   🤖 LucIA ({source}): {response.paraphrased_response}")
                
                # Pequeña pausa
                await asyncio.sleep(1)
            
            print(f"\n✅ Demo completado. {len(demo_questions)} preguntas procesadas.")
            
            # Mostrar estadísticas
            stats = lucia.get_stats()
            print(f"📊 Total de peticiones: {stats['core_stats']['total_requests']}")
            print(f"🧠 Entradas en memoria: {stats['memory_stats']['total_memory_entries']}")
        
        # Ejecutar demo
        asyncio.run(run_demo())
        
    except Exception as e:
        print(f"❌ Error en demo: {e}")

def main():
    """Función principal"""
    print("🚀 LucIA Pro - Inicio Rápido")
    print("=" * 40)
    
    # Verificar archivos
    if not check_files():
        return
    
    # Prueba básica
    if not quick_test():
        return
    
    # Preguntar si quiere hacer demo
    try:
        response = input("\n¿Quieres ver una demo de conversación? (s/n): ").strip().lower()
        if response in ['s', 'si', 'sí', 'y', 'yes']:
            demo_conversation()
    except KeyboardInterrupt:
        print("\n👋 Demo cancelada")
    
    print("\n🎯 Próximos pasos:")
    print("1. python lucIA.py - Usar la IA completa")
    print("2. python install.py - Configurar APIs adicionales")
    print("3. Ver README.md para más información")

if __name__ == "__main__":
    main() 