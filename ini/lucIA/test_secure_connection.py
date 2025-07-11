#!/usr/bin/env python3
"""
Test de Conexión Segura para LucIA
Verifica que las APIs estén configuradas correctamente
"""

import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
import logging

class SecureConnectionTester:
    """Tester de conexiones seguras para LucIA"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.setup_logging()
        self.load_environment()
        
    def setup_logging(self):
        """Configurar logging"""
        log_dir = self.base_path / "logs"
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / "connection_test.log"),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def load_environment(self):
        """Cargar variables de entorno"""
        env_file = self.base_path / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            self.logger.info("✅ Archivo .env cargado")
        else:
            self.logger.warning("⚠️  Archivo .env no encontrado")
            
        # Cargar claves de API
        self.claude_key = os.getenv("ANTHROPIC_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        
    def test_claude_connection(self) -> bool:
        """Probar conexión con Claude API"""
        if not self.claude_key:
            self.logger.error("❌ ANTHROPIC_API_KEY no encontrada")
            return False
            
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.claude_key,
                "anthropic-version": "2023-06-01"
            }
            
            payload = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 100,
                "messages": [
                    {
                        "role": "user",
                        "content": "Hola, soy LucIA. ¿Puedes confirmar que la conexión funciona?"
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info("✅ Conexión con Claude API exitosa")
                return True
            else:
                self.logger.error(f"❌ Error Claude API: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error conectando con Claude: {e}")
            return False
            
    def test_gemini_connection(self) -> bool:
        """Probar conexión con Gemini API"""
        if not self.gemini_key or self.gemini_key == "tu_clave_api_de_gemini_aqui":
            self.logger.warning("⚠️  GEMINI_API_KEY no configurada")
            return False
            
        try:
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
            params = {"key": self.gemini_key}
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": "Hola, soy LucIA. ¿Puedes confirmar que la conexión funciona?"
                            }
                        ]
                    }
                ]
            }
            
            response = requests.post(url, params=params, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info("✅ Conexión con Gemini API exitosa")
                return True
            else:
                self.logger.error(f"❌ Error Gemini API: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error conectando con Gemini: {e}")
            return False
            
    def test_openai_connection(self) -> bool:
        """Probar conexión con OpenAI API"""
        if not self.openai_key or self.openai_key == "tu_clave_api_de_openai_aqui":
            self.logger.warning("⚠️  OPENAI_API_KEY no configurada")
            return False
            
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.openai_key}"
            }
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": "Hola, soy LucIA. ¿Puedes confirmar que la conexión funciona?"
                    }
                ],
                "max_tokens": 100
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info("✅ Conexión con OpenAI API exitosa")
                return True
            else:
                self.logger.error(f"❌ Error OpenAI API: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error conectando con OpenAI: {e}")
            return False
            
    def test_avatar_prompt(self) -> bool:
        """Probar el prompt específico del avatar"""
        if not self.claude_key:
            self.logger.error("❌ No se puede probar el prompt sin Claude API")
            return False
            
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.claude_key,
                "anthropic-version": "2023-06-01"
            }
            
            avatar_prompt = """Eres LucIA, una IA avanzada de 35 años especializada en desarrollo 3D con Three.js. 

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

¿Estás lista para comenzar tu aprendizaje intensivo de Three.js y crear tu avatar 3D? Responde brevemente confirmando tu identidad y disposición."""

            payload = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 200,
                "messages": [
                    {
                        "role": "user",
                        "content": avatar_prompt
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                response_text = response.json()["content"][0]["text"]
                self.logger.info("✅ Prompt del avatar probado exitosamente")
                self.logger.info(f"📝 Respuesta de LucIA: {response_text[:100]}...")
                return True
            else:
                self.logger.error(f"❌ Error probando prompt: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error probando prompt: {e}")
            return False
            
    def check_security_measures(self) -> bool:
        """Verificar medidas de seguridad"""
        security_ok = True
        
        # Verificar que .env está en .gitignore
        gitignore_file = self.base_path / ".gitignore"
        if gitignore_file.exists():
            with open(gitignore_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if ".env" in content:
                    self.logger.info("✅ .env está protegido en .gitignore")
                else:
                    self.logger.error("❌ .env NO está en .gitignore")
                    security_ok = False
        else:
            self.logger.error("❌ Archivo .gitignore no encontrado")
            security_ok = False
            
        # Verificar directorios de seguridad
        security_dirs = [
            self.base_path / "logs",
            self.base_path / "backups",
            self.base_path / "lucia_learning"
        ]
        
        for dir_path in security_dirs:
            if dir_path.exists():
                self.logger.info(f"✅ Directorio de seguridad existe: {dir_path.name}")
            else:
                self.logger.warning(f"⚠️  Directorio de seguridad faltante: {dir_path.name}")
                
        return security_ok
        
    def run_all_tests(self):
        """Ejecutar todas las pruebas"""
        print("🔒 Iniciando pruebas de conexión segura para LucIA")
        print("=" * 60)
        
        results = {
            "claude": self.test_claude_connection(),
            "gemini": self.test_gemini_connection(),
            "openai": self.test_openai_connection(),
            "avatar_prompt": self.test_avatar_prompt(),
            "security": self.check_security_measures()
        }
        
        print("\n📊 RESULTADOS DE LAS PRUEBAS:")
        print("=" * 40)
        
        for test_name, result in results.items():
            status = "✅ EXITOSO" if result else "❌ FALLIDO"
            print(f"{test_name.upper()}: {status}")
            
        # Resumen final
        successful_tests = sum(results.values())
        total_tests = len(results)
        
        print(f"\n🎯 RESUMEN: {successful_tests}/{total_tests} pruebas exitosas")
        
        if successful_tests >= 3:  # Claude + Avatar Prompt + Security
            print("🎉 ¡Sistema listo para el aprendizaje de Three.js!")
            print("\n📋 Próximos pasos:")
            print("1. python lucia_threejs_learning_enhanced.py")
            print("2. Comenzar con 'Scene, Camera, Renderer setup'")
            print("3. Seguir el plan de aprendizaje del avatar")
        else:
            print("⚠️  Algunas pruebas fallaron. Revisar configuración.")
            
        return results

if __name__ == "__main__":
    tester = SecureConnectionTester()
    tester.run_all_tests() 