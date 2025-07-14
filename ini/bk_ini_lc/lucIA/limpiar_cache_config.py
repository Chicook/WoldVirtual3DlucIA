"""
Limpiar Caché de Configuración
Script para limpiar la configuración en caché y forzar la recarga
"""

import os
import shutil
import json
from pathlib import Path
from dotenv import load_dotenv

def limpiar_cache_config():
    """Limpia la caché de configuración y fuerza la recarga"""
    print("🧹 LIMPIANDO CACHÉ DE CONFIGURACIÓN")
    print("=" * 40)
    
    # Directorio de configuración
    config_dir = Path(__file__).parent / "config"
    config_file = config_dir / "lucia_config.json"
    
    # Verificar archivo de configuración
    if config_file.exists():
        print(f"📁 Archivo de configuración encontrado: {config_file}")
        
        # Hacer backup
        backup_file = config_dir / "lucia_config_backup.json"
        shutil.copy2(config_file, backup_file)
        print(f"💾 Backup creado: {backup_file}")
        
        # Eliminar archivo de configuración
        config_file.unlink()
        print("🗑️ Archivo de configuración eliminado")
    else:
        print("📁 No se encontró archivo de configuración")
    
    # Verificar archivo .env
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        print(f"✅ Archivo .env encontrado")
        
        # Cargar y verificar clave
        load_dotenv(env_file)
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        if gemini_key:
            print(f"🔑 Clave Gemini en .env: {gemini_key[:8]}...{gemini_key[-4:]}")
        else:
            print("❌ No se encontró GEMINI_API_KEY en .env")
    else:
        print("❌ Archivo .env no encontrado")
    
    # Limpiar archivos __pycache__
    cache_dirs = [
        Path(__file__).parent / "__pycache__",
        Path(__file__).parent / "config" / "__pycache__"
    ]
    
    for cache_dir in cache_dirs:
        if cache_dir.exists():
            shutil.rmtree(cache_dir)
            print(f"🗑️ Caché eliminado: {cache_dir}")
    
    print("\n✅ Limpieza completada")

def crear_nueva_configuracion():
    """Crea una nueva configuración con la clave actual"""
    print("\n🔧 CREANDO NUEVA CONFIGURACIÓN")
    print("=" * 40)
    
    # Cargar clave desde .env
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if not gemini_key:
        print("❌ No se pudo cargar la clave de Gemini")
        return False
    
    # Crear nueva configuración
    config_data = {
        "apis": [
            {
                "name": "gemini_pro",
                "api_type": "gemini",
                "api_key": gemini_key,
                "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent",
                "model": "models/gemini-1.5-pro-latest",
                "daily_limit": 1000,
                "priority": 1,
                "enabled": True,
                "cost_per_request": 0.0,
                "response_timeout": 30,
                "max_tokens": 1500,
                "temperature": 0.7
            },
            {
                "name": "local_fallback",
                "api_type": "local",
                "api_key": "",
                "endpoint": "local",
                "model": "local_fallback",
                "daily_limit": 10000,
                "priority": 999,
                "enabled": True,
                "cost_per_request": 0.0,
                "response_timeout": 1,
                "max_tokens": 500,
                "temperature": 0.7
            }
        ],
        "platform": {
            "platform_name": "Metaverso Crypto World Virtual 3D",
            "ai_name": "LucIA",
            "version": "2.0.0",
            "description": "IA inteligente para la plataforma metaverso",
            "enable_paraphrasing": True,
            "enable_memory_learning": True,
            "enable_api_rotation": True,
            "enable_fallback_to_memory": True,
            "default_personality": "metaverso",
            "encrypt_sensitive_data": True,
            "log_api_calls": False,
            "rate_limiting": True
        },
        "memory": {
            "max_conversations": 1000,
            "max_learning_entries": 5000,
            "backup_interval_hours": 24,
            "cleanup_old_data_days": 30,
            "similarity_threshold": 0.3,
            "paraphrase_confidence": 0.8
        }
    }
    
    # Guardar nueva configuración
    config_dir = Path(__file__).parent / "config"
    config_dir.mkdir(exist_ok=True)
    config_file = config_dir / "lucia_config.json"
    
    try:
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Nueva configuración creada: {config_file}")
        print(f"🔑 Clave configurada: {gemini_key[:8]}...{gemini_key[-4:]}")
        return True
        
    except Exception as e:
        print(f"❌ Error creando configuración: {e}")
        return False

def verificar_configuracion():
    """Verifica que la configuración se cargue correctamente"""
    print("\n🔍 VERIFICANDO CONFIGURACIÓN")
    print("=" * 40)
    
    try:
        # Importar después de limpiar caché
        import sys
        sys.path.insert(0, str(Path(__file__).parent))
        
        from config import config
        
        print("✅ Configuración cargada correctamente")
        
        # Verificar APIs
        enabled_apis = config.get_enabled_apis()
        print(f"📡 APIs habilitadas: {len(enabled_apis)}")
        
        for api in enabled_apis:
            print(f"   - {api.name} ({api.api_type.value}) - Prioridad: {api.priority}")
            if api.name == "gemini_pro":
                print(f"     Clave: {api.api_key[:8]}...{api.api_key[-4:]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando configuración: {e}")
        return False

def main():
    """Función principal"""
    print("🔄 RECONFIGURACIÓN COMPLETA DEL SISTEMA")
    print("=" * 50)
    
    # Paso 1: Limpiar caché
    limpiar_cache_config()
    
    # Paso 2: Crear nueva configuración
    if crear_nueva_configuracion():
        # Paso 3: Verificar configuración
        if verificar_configuracion():
            print("\n🎉 ¡RECONFIGURACIÓN EXITOSA!")
            print("✅ El sistema está listo para usar la nueva clave")
            print("🚀 Puedes probar ahora con:")
            print("   python test_threejs_learning.py")
            print("   python ejemplo_aprendizaje_threejs.py")
        else:
            print("\n❌ Error verificando la configuración")
    else:
        print("\n❌ Error creando la nueva configuración")

if __name__ == "__main__":
    main() 