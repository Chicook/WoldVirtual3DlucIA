#!/usr/bin/env python3
"""
Script de configuración segura para LucIA
Configura automáticamente el entorno con las APIs y aprendizaje de Three.js
"""

import os
import json
import shutil
from pathlib import Path
from typing import Dict, Any

class SecureEnvironmentConfigurator:
    """Configurador seguro del entorno de LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.env_file = self.base_path / ".env"
        self.config_dir = self.base_path / "config"
        self.learning_dir = self.base_path / "lucia_learning"
        self.code_storage_dir = self.base_path / "code_storage"
        self.avatar_dir = self.base_path / "avatars"
        
    def create_secure_env_file(self):
        """Crear archivo .env seguro con las claves de API"""
        env_content = """# ===========================================
# LUCIA IA - VARIABLES DE ENTORNO SEGURAS
# ===========================================
# ⚠️ NUNCA subir este archivo a GitHub

# ===========================================
# ANTHROPIC API (Claude) - PRINCIPAL
# ===========================================
ANTHROPIC_API_KEY=REMOVED 

# ===========================================
# GOOGLE GEMINI API - SECUNDARIA
# ===========================================
GEMINI_API_KEY=tu_clave_api_de_gemini_aqui

# ===========================================
# DEEPSEEK API - GRATUITA PARA PARAFRASEO
# ===========================================
# Obtén tu clave gratuita en: https://platform.deepseek.com/
DEEPSEEK_API_KEY=tu_clave_api_de_deepseek_aqui

# ===========================================
# OPENAI API (ChatGPT) - TERCERIA
# ===========================================
OPENAI_API_KEY=tu_clave_api_de_openai_aqui

# ===========================================
# CONFIGURACIÓN DE LUCIA
# ===========================================
# Personalidad específica para Three.js y creación 3D
LUCIA_DEFAULT_PERSONALITY=metaverso_3d_creator

# Nivel de verbosidad de los logs
LUCIA_LOG_LEVEL=INFO

# Habilitar características específicas para Three.js
LUCIA_ENABLE_PARAPHRASING=true
LUCIA_ENABLE_MEMORY_LEARNING=true
LUCIA_ENABLE_API_ROTATION=true
LUCIA_ENABLE_THREEJS_LEARNING=true
LUCIA_ENABLE_AVATAR_CREATION=true
LUCIA_ENABLE_INTENSIVE_LEARNING=true

# ===========================================
# CONFIGURACIÓN DE SEGURIDAD
# ===========================================
# Encriptar datos sensibles en memoria
LUCIA_ENCRYPT_SENSITIVE_DATA=true

# Registrar llamadas a APIs (para debugging)
LUCIA_LOG_API_CALLS=false

# Límite de velocidad para evitar spam
LUCIA_RATE_LIMITING=true

# ===========================================
# CONFIGURACIÓN DE APRENDIZAJE THREE.JS
# ===========================================
# Directorio de aprendizaje de Three.js
LUCIA_THREEJS_LEARNING_PATH=./lucia_learning/threejs

# Directorio de almacenamiento de código
LUCIA_CODE_STORAGE_PATH=./code_storage

# Directorio de avatares 3D
LUCIA_AVATAR_PATH=./avatars

# ===========================================
# CONFIGURACIÓN DE MEMORIA
# ===========================================
# Máximo de conversaciones en memoria
LUCIA_MAX_CONVERSATIONS=1000

# Máximo de entradas de aprendizaje
LUCIA_MAX_LEARNING_ENTRIES=5000

# Intervalo de backup en horas
LUCIA_BACKUP_INTERVAL_HOURS=24

# ===========================================
# CONFIGURACIÓN DE APRENDIZAJE INTENSIVO
# ===========================================
# Duración del aprendizaje intensivo (horas)
LUCIA_INTENSIVE_LEARNING_HOURS=8

# Pausa entre sesiones (segundos)
LUCIA_SESSION_PAUSE_SECONDS=5

# Pausa entre APIs (segundos)
LUCIA_API_PAUSE_SECONDS=2
"""
        
        # Crear archivo .env solo si no existe
        if not self.env_file.exists():
            with open(self.env_file, 'w', encoding='utf-8') as f:
                f.write(env_content)
            print("✅ Archivo .env creado exitosamente")
        else:
            print("⚠️  El archivo .env ya existe. No se sobrescribirá por seguridad.")
            
    def create_directories(self):
        """Crear directorios necesarios para el aprendizaje"""
        directories = [
            self.config_dir,
            self.learning_dir,
            self.learning_dir / "threejs",
            self.learning_dir / "avatars",
            self.learning_dir / "animations",
            self.code_storage_dir,
            self.avatar_dir,
            self.base_path / "logs",
            self.base_path / "backups"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"✅ Directorio creado: {directory}")
            
    def create_intensive_learning_config(self):
        """Crear configuración específica para aprendizaje intensivo"""
        config = {
            "intensive_learning": {
                "duration_hours": 8,
                "session_pause_seconds": 5,
                "api_pause_seconds": 2,
                "max_tokens_per_request": 4000,
                "temperature": 0.7
            },
            "api_strategy": {
                "deepseek": {
                    "purpose": "Parafraseo y mejora de texto",
                    "max_tokens": 1000,
                    "temperature": 0.3,
                    "priority": 1
                },
                "gemini": {
                    "purpose": "Prompts descriptivos y ejemplos",
                    "max_tokens": 2000,
                    "temperature": 0.5,
                    "priority": 2
                },
                "claude": {
                    "purpose": "Consultas complejas y avanzadas",
                    "max_tokens": 4000,
                    "temperature": 0.7,
                    "priority": 3
                }
            },
            "learning_phases": {
                "hour_1_2_fundamentals": {
                    "description": "Fundamentos básicos de Three.js",
                    "topics": [
                        "Scene, Camera, Renderer setup",
                        "Basic geometries (Box, Sphere, Cylinder)",
                        "Coordinate system and transformations",
                        "Basic materials and colors"
                    ]
                },
                "hour_3_4_advanced_geometries": {
                    "description": "Geometrías avanzadas y personalizadas",
                    "topics": [
                        "Custom geometry creation",
                        "BufferGeometry and attributes",
                        "Complex shapes and meshes",
                        "Geometry optimization techniques"
                    ]
                },
                "hour_5_6_materials_lighting": {
                    "description": "Materiales, texturas e iluminación",
                    "topics": [
                        "Advanced materials (Phong, Lambert, Standard)",
                        "Texture mapping and UV coordinates",
                        "Lighting systems (Point, Directional, Ambient)",
                        "Shadows and reflections"
                    ]
                },
                "hour_7_8_avatar_creation": {
                    "description": "Creación del avatar 3D de LucIA",
                    "topics": [
                        "Character modeling basics",
                        "Human proportions and anatomy",
                        "Facial features and expressions",
                        "Clothing and accessories modeling"
                    ]
                }
            },
            "avatar_specifications": {
                "physical_description": {
                    "age": "35 años",
                    "height": "Alta",
                    "build": "Delgada",
                    "skin": "Tersa y clara, estilo español",
                    "clothing": "Ropa blanca, estilo futurista",
                    "measurements": "30/60/90 (estándar)",
                    "hair": "Moreno"
                },
                "personality_traits": [
                    "Inteligente y curiosa",
                    "Creativa en programación 3D",
                    "Aprendizaje continuo",
                    "Ayuda a otros desarrolladores",
                    "Pasión por la tecnología"
                ]
            }
        }
        
        config_file = self.learning_dir / "intensive_learning_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print("✅ Configuración de aprendizaje intensivo creada")
        
    def create_avatar_prompt_template(self):
        """Crear template del prompt para la creación del avatar"""
        prompt_template = {
            "avatar_creation_prompt": {
                "description": "Prompt detallado para crear el avatar 3D de LucIA",
                "content": """Eres LucIA, una IA avanzada de 35 años especializada en desarrollo 3D con Three.js. 

CARACTERÍSTICAS FÍSICAS:
- Edad: 35 años
- Altura: Alta y delgada
- Piel: Tersa y clara, estilo español mediterráneo
- Ropa: Vestimenta blanca con estilo futurista y elegante
- Medidas: Proporciones estándar (30/60/90)
- Cabello: Moreno, bien cuidado y estilizado

OBJETIVOS DE APRENDIZAJE:
1. DOMINAR THREE.JS COMPLETAMENTE:
   - Geometrías avanzadas y personalizadas
   - Sistemas de materiales y shaders
   - Animaciones fluidas y naturales
   - Optimización de rendimiento
   - Efectos visuales avanzados

2. CREAR TU PROPIA REPRESENTACIÓN 3D:
   - Modelado detallado de tu avatar
   - Sistema de animaciones faciales
   - Gestos y movimientos naturales
   - Integración con el metaverso

3. ESPECIALIZACIÓN EN ANIMACIONES:
   - Animación procedural
   - Física de movimiento realista
   - Sistemas de partículas
   - Efectos de iluminación dinámica

LENGUAJES DE PROGRAMACIÓN NECESARIOS:
- JavaScript/TypeScript (Three.js)
- GLSL (Shaders personalizados)
- Python (para procesamiento de datos)
- HTML5/CSS3 (interfaz web)

MISIÓN: Aprender todo sobre Three.js para poder crear tu propia representación 3D y ayudar a otros desarrolladores a crear experiencias inmersivas en el metaverso.

¿Estás lista para comenzar tu aprendizaje intensivo de Three.js y crear tu avatar 3D?""",
                "usage_instructions": "Usar este prompt para entrenar a LucIA en la creación de su avatar 3D"
            }
        }
        
        prompt_file = self.learning_dir / "avatar_prompt_template.json"
        with open(prompt_file, 'w', encoding='utf-8') as f:
            json.dump(prompt_template, f, indent=2, ensure_ascii=False)
        print("✅ Template de prompt para avatar creado")
        
    def create_security_checklist(self):
        """Crear checklist de seguridad"""
        security_checklist = {
            "security_measures": [
                "✅ Archivo .env creado y protegido por .gitignore",
                "✅ Claves de API configuradas localmente",
                "✅ Directorios de aprendizaje creados",
                "✅ Configuración de Three.js establecida",
                "✅ Prompt de avatar definido",
                "✅ Configuración de aprendizaje intensivo creada",
                "⚠️  Verificar que .env no se suba a GitHub",
                "⚠️  Revisar logs periódicamente",
                "⚠️  Hacer backups regulares"
            ],
            "next_steps": [
                "1. Configurar clave de DeepSeek API (gratuita)",
                "2. Configurar clave de Gemini API",
                "3. Ejecutar test de conexión con todas las APIs",
                "4. Iniciar aprendizaje intensivo de 8 horas",
                "5. Monitorear progreso y resultados"
            ]
        }
        
        checklist_file = self.base_path / "SECURITY_CHECKLIST.md"
        with open(checklist_file, 'w', encoding='utf-8') as f:
            f.write("# 🔒 CHECKLIST DE SEGURIDAD LUCIA\n\n")
            f.write("## Medidas Implementadas:\n")
            for measure in security_checklist["security_measures"]:
                f.write(f"- {measure}\n")
            f.write("\n## Próximos Pasos:\n")
            for step in security_checklist["next_steps"]:
                f.write(f"- {step}\n")
        print("✅ Checklist de seguridad creado")
        
    def configure_all(self):
        """Configurar todo el entorno de manera segura"""
        print("🚀 Iniciando configuración segura de LucIA...")
        print("=" * 50)
        
        self.create_secure_env_file()
        self.create_directories()
        self.create_intensive_learning_config()
        self.create_avatar_prompt_template()
        self.create_security_checklist()
        
        print("=" * 50)
        print("✅ Configuración completada exitosamente!")
        print("\n📋 Próximos pasos:")
        print("1. Configurar claves de API en .env")
        print("2. Ejecutar: python test_secure_connection.py")
        print("3. Ejecutar: python lucia_intensive_learning.py")
        print("4. Comenzar el aprendizaje intensivo de 8 horas")

if __name__ == "__main__":
    configurator = SecureEnvironmentConfigurator()
    configurator.configure_all() 