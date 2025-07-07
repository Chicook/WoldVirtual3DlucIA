#!/usr/bin/env python3
"""
Comando de LucIA para configurar automáticamente el entorno de desarrollo
"""

import asyncio
import sys
from pathlib import Path

# Añadir el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from lucia_core import LucIACore
from config import PersonalityType

async def setup_development_environment():
    """Comando de LucIA para configurar el entorno de desarrollo"""
    
    print("🤖 LUCIA - CONFIGURACIÓN AUTOMÁTICA DEL ENTORNO")
    print("=" * 60)
    
    # Inicializar LucIA
    lucia = LucIACore(
        name="LucIA",
        personality=PersonalityType.METAVERSE,
        enable_memory=True,
        enable_paraphrasing=True
    )
    
    # Mensaje de inicio
    print("🚀 LucIA está configurando automáticamente tu entorno de desarrollo...")
    print("📋 Esto incluye:")
    print("  ✅ Estructura de directorios")
    print("  ✅ Archivos de configuración")
    print("  ✅ Dependencias y paquetes")
    print("  ✅ Scripts de inicio rápido")
    print("  ✅ Documentación completa")
    print()
    
    # Ejecutar el script de configuración
    try:
        from setup_development_environment import DevelopmentEnvironmentSetup
        
        setup = DevelopmentEnvironmentSetup()
        success = setup.run_setup()
        
        if success:
            print("🎉 ¡Configuración completada exitosamente!")
            print()
            print("📋 RESUMEN DE LO CONFIGURADO:")
            print("  🌍 Estructura del metaverso creada")
            print("  📦 Dependencias instaladas")
            print("  ⚙️ Archivos de configuración generados")
            print("  📖 Documentación actualizada")
            print("  🤖 LucIA configurada y lista")
            print()
            print("🚀 PRÓXIMOS PASOS:")
            print("1. Edita el archivo .env con tus configuraciones")
            print("2. Ejecuta: npm run dev")
            print("3. Accede a http://localhost:3000")
            print()
            print("🌐 ¡Tu metaverso está listo para el desarrollo!")
            
            # Guardar en memoria de LucIA
            await lucia.chat("Configuración automática del entorno completada exitosamente")
            
        else:
            print("❌ La configuración encontró algunos problemas.")
            print("🔧 Revisa los logs anteriores para más detalles.")
            
            await lucia.chat("Configuración automática del entorno completada con algunos errores")
            
    except Exception as e:
        print(f"❌ Error ejecutando la configuración: {e}")
        await lucia.chat(f"Error en configuración automática: {e}")

async def main():
    """Función principal"""
    await setup_development_environment()

if __name__ == "__main__":
    asyncio.run(main()) 