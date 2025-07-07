"""
Renovar Clave de Gemini
Script para actualizar la clave de Gemini expirada
"""

import os
from pathlib import Path

def mostrar_instrucciones_renovacion():
    """Muestra instrucciones para renovar la clave de Gemini"""
    print("🔄 RENOVAR CLAVE DE GEMINI")
    print("=" * 40)
    print("Tu clave de Gemini ha expirado. Sigue estos pasos:")
    print()
    print("1. 🌐 Ve a: https://makersuite.google.com/app/apikey")
    print("2. 🔐 Inicia sesión con tu cuenta de Google")
    print("3. 🗑️ Elimina la clave expirada (si existe)")
    print("4. ➕ Haz clic en 'Create API Key'")
    print("5. 📋 Copia la nueva clave (empieza con 'AIza...')")
    print("6. 📝 Abre el archivo .env en tu editor")
    print("7. 🔄 Reemplaza la clave antigua con la nueva")
    print("8. 💾 Guarda el archivo")
    print()
    print("💡 Ejemplo de formato:")
    print("   GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz")

def verificar_archivo_env():
    """Verifica y muestra el contenido actual del archivo .env"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ Archivo .env no encontrado")
        return False
    
    print("📋 Contenido actual del archivo .env:")
    print("-" * 40)
    
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        if line.startswith('GEMINI_API_KEY='):
            # Ocultar la clave por seguridad
            parts = line.split('=', 1)
            if len(parts) == 2:
                key = parts[1].strip()
                if key.startswith('AIza') and len(key) > 30:
                    # Mostrar solo los primeros y últimos caracteres
                    masked_key = key[:8] + "..." + key[-4:]
                    print(f"GEMINI_API_KEY={masked_key} (CLAVE EXPIRADA)")
                else:
                    print(f"GEMINI_API_KEY={key}")
            else:
                print(line.strip())
        else:
            print(line.strip())
    
    return True

def actualizar_clave_manual():
    """Guía para actualizar la clave manualmente"""
    print("\n📝 ACTUALIZACIÓN MANUAL")
    print("=" * 30)
    print("1. Abre el archivo .env en tu editor de texto")
    print("2. Busca la línea que dice 'GEMINI_API_KEY='")
    print("3. Reemplaza todo lo que está después del '=' con tu nueva clave")
    print("4. Guarda el archivo")
    print("5. Ejecuta: python test_threejs_learning.py")
    print()
    print("💡 La nueva clave debe empezar con 'AIza' y tener al menos 30 caracteres")

def mostrar_alternativas():
    """Muestra alternativas si no puedes renovar la clave"""
    print("\n🔄 ALTERNATIVAS")
    print("=" * 20)
    print("Si no puedes renovar la clave de Gemini ahora:")
    print()
    print("✅ El sistema funciona con respuestas locales")
    print("✅ Puedes usar el sistema de aprendizaje básico")
    print("✅ Las funcionalidades principales están disponibles")
    print()
    print("⚠️ Limitaciones sin Gemini:")
    print("   - Respuestas menos específicas sobre Three.js")
    print("   - No hay ejemplos de código detallados")
    print("   - Respuestas más genéricas")
    print()
    print("💡 Para obtener la mejor experiencia:")
    print("   - Renueva tu clave de Gemini")
    print("   - O usa una cuenta de Google diferente")

def main():
    """Función principal"""
    print("🎭 RENOVACIÓN DE CLAVE GEMINI")
    print("=" * 40)
    
    # Verificar archivo .env
    if not verificar_archivo_env():
        return
    
    print()
    mostrar_instrucciones_renovacion()
    print()
    actualizar_clave_manual()
    print()
    mostrar_alternativas()
    
    print("\n🚀 DESPUÉS DE RENOVAR LA CLAVE:")
    print("1. python test_threejs_learning.py")
    print("2. python ejemplo_aprendizaje_threejs.py")
    print("3. ¡Disfruta aprendiendo Three.js con Lucía!")

if __name__ == "__main__":
    main() 