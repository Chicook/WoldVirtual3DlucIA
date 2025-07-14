"""
Actualizar Clave de Gemini
Script para actualizar la clave de Gemini de manera segura
"""

import os
from pathlib import Path

def actualizar_clave_gemini(nueva_clave):
    """Actualiza la clave de Gemini en el archivo .env"""
    
    env_path = Path(__file__).parent / ".env"
    
    # Contenido del archivo .env con la nueva clave
    env_content = f"""# ===========================================
# LUCIA IA - CONFIGURACIÓN DE APIS
# ===========================================
# Configuración actualizada con nueva clave de Gemini

# ===========================================
# GOOGLE GEMINI API (PRINCIPAL)
# ===========================================
# Clave actualizada - Julio 2025
GEMINI_API_KEY={nueva_clave}

# ===========================================
# CONFIGURACIÓN BÁSICA DE LUCIA
# ===========================================
LUCIA_DEFAULT_PERSONALITY=metaverso
LUCIA_LOG_LEVEL=INFO
LUCIA_ENABLE_PARAPHRASING=true
LUCIA_ENABLE_MEMORY_LEARNING=true
LUCIA_ENABLE_API_ROTATION=true
LUCIA_ENCRYPT_SENSITIVE_DATA=true
LUCIA_LOG_API_CALLS=false
LUCIA_RATE_LIMITING=true

# ===========================================
# OTRAS APIS (OPCIONALES)
# ===========================================
# Descomenta y configura si las necesitas

# OPENAI_API_KEY=tu_clave_api_de_openai_aqui
# ANTHROPIC_API_KEY=tu_clave_api_de_anthropic_aqui
# HUGGINGFACE_API_KEY=tu_clave_api_de_huggingface_aqui
"""
    
    try:
        # Crear o actualizar el archivo .env
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Archivo .env actualizado exitosamente")
        print(f"📁 Ubicación: {env_path}")
        
        # Verificar que la clave se guardó correctamente
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if nueva_clave in content:
                print("✅ Nueva clave de Gemini guardada correctamente")
                return True
            else:
                print("❌ Error: La clave no se guardó correctamente")
                return False
                
    except Exception as e:
        print(f"❌ Error actualizando archivo .env: {e}")
        return False

def verificar_clave_actual():
    """Verifica la clave actual en el archivo .env"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ Archivo .env no encontrado")
        return None
    
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for line in lines:
            if line.startswith('GEMINI_API_KEY='):
                clave = line.split('=', 1)[1].strip()
                # Mostrar solo los primeros y últimos caracteres por seguridad
                if len(clave) > 10:
                    masked_clave = clave[:8] + "..." + clave[-4:]
                    print(f"🔑 Clave actual: {masked_clave}")
                    return clave
                else:
                    print(f"🔑 Clave actual: {clave}")
                    return clave
        
        print("❌ No se encontró GEMINI_API_KEY en el archivo .env")
        return None
        
    except Exception as e:
        print(f"❌ Error leyendo archivo .env: {e}")
        return None

def main():
    """Función principal"""
    print("🔄 ACTUALIZACIÓN DE CLAVE GEMINI")
    print("=" * 40)
    
    # Verificar clave actual
    clave_actual = verificar_clave_actual()
    
    # Nueva clave proporcionada por el usuario
    nueva_clave = ""
    
    print(f"\n🆕 Nueva clave proporcionada: {nueva_clave[:8]}...{nueva_clave[-4:]}")
    
    # Actualizar la clave
    if actualizar_clave_gemini(nueva_clave):
        print("\n🎉 ¡Clave actualizada exitosamente!")
        print("🔄 Ahora puedes probar la conexión con:")
        print("   python test_threejs_learning.py")
        print("   python ejemplo_aprendizaje_threejs.py")
    else:
        print("\n❌ Error actualizando la clave")

if __name__ == "__main__":
    main() 
