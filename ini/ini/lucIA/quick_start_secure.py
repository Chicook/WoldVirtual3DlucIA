#!/usr/bin/env python3
"""
🚀 Quick Start Seguro para LucIA
Guía interactiva para configurar LucIA de forma segura
"""

import os
import sys
import subprocess
import getpass
from pathlib import Path
from typing import Dict, List

class QuickStartSecure:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.env_file = self.project_root / '.env'
        self.example_file = self.project_root / 'env.example'
        
        # Colores para output
        self.colors = {
            'red': '\033[91m',
            'green': '\033[92m',
            'yellow': '\033[93m',
            'blue': '\033[94m',
            'purple': '\033[95m',
            'cyan': '\033[96m',
            'white': '\033[97m',
            'bold': '\033[1m',
            'end': '\033[0m'
        }
    
    def print_banner(self):
        """Imprime el banner de bienvenida"""
        banner = f"""
{self.colors['cyan']}{self.colors['bold']}
╔══════════════════════════════════════════════════════════════╗
║                    🚀 LucIA Quick Start Seguro               ║
║                                                              ║
║  Configuración segura para código abierto                    ║
║  Sin claves API reales, sin información sensible            ║
╚══════════════════════════════════════════════════════════════╝
{self.colors['end']}
        """
        print(banner)
    
    def print_step(self, step: int, title: str, description: str = ""):
        """Imprime un paso del proceso"""
        print(f"\n{self.colors['blue']}{self.colors['bold']}PASO {step}: {title}{self.colors['end']}")
        if description:
            print(f"{self.colors['white']}{description}{self.colors['end']}")
        print("-" * 60)
    
    def print_success(self, message: str):
        """Imprime mensaje de éxito"""
        print(f"{self.colors['green']}✅ {message}{self.colors['end']}")
    
    def print_warning(self, message: str):
        """Imprime mensaje de advertencia"""
        print(f"{self.colors['yellow']}⚠️ {message}{self.colors['end']}")
    
    def print_error(self, message: str):
        """Imprime mensaje de error"""
        print(f"{self.colors['red']}❌ {message}{self.colors['end']}")
    
    def print_info(self, message: str):
        """Imprime mensaje informativo"""
        print(f"{self.colors['cyan']}ℹ️ {message}{self.colors['end']}")
    
    def check_prerequisites(self) -> bool:
        """Verifica prerequisitos del sistema"""
        self.print_step(1, "Verificación de Prerequisitos", "Comprobando que tu sistema esté listo")
        
        # Verificar Python
        python_version = sys.version_info
        if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
            self.print_error(f"Python 3.8+ requerido. Tienes {python_version.major}.{python_version.minor}")
            return False
        self.print_success(f"Python {python_version.major}.{python_version.minor} detectado")
        
        # Verificar pip
        try:
            subprocess.run([sys.executable, '-m', 'pip', '--version'], 
                         capture_output=True, check=True)
            self.print_success("pip está disponible")
        except subprocess.CalledProcessError:
            self.print_error("pip no está disponible")
            return False
        
        # Verificar git
        try:
            subprocess.run(['git', '--version'], capture_output=True, check=True)
            self.print_success("Git está disponible")
        except subprocess.CalledProcessError:
            self.print_warning("Git no está disponible (opcional)")
        
        # Verificar que estamos en el directorio correcto
        if not (self.project_root / 'lucIA.py').exists():
            self.print_error("No se encontró lucIA.py. Ejecuta desde el directorio lucIA/")
            return False
        self.print_success("Directorio de proyecto correcto")
        
        return True
    
    def check_security_status(self) -> bool:
        """Verifica el estado de seguridad actual"""
        self.print_step(2, "Verificación de Seguridad", "Comprobando que no hay información sensible")
        
        # Verificar si existe .env
        if self.env_file.exists():
            self.print_warning("Archivo .env encontrado - verificando contenido...")
            
            try:
                with open(self.env_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Buscar claves API reales
                if 'sk-' in content or 'tu_clave' not in content:
                    self.print_error("Archivo .env contiene claves API reales")
                    self.print_info("Este archivo NO debe subirse a GitHub")
                    return False
                else:
                    self.print_success("Archivo .env contiene solo plantillas")
            except Exception as e:
                self.print_error(f"Error leyendo .env: {e}")
                return False
        else:
            self.print_success("No se encontró archivo .env (correcto para código abierto)")
        
        # Verificar .gitignore
        gitignore_file = self.project_root / '.gitignore'
        if gitignore_file.exists():
            with open(gitignore_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '.env' in content:
                self.print_success(".gitignore incluye .env")
            else:
                self.print_warning(".gitignore no incluye .env")
        else:
            self.print_warning("No se encontró .gitignore")
        
        return True
    
    def install_dependencies(self) -> bool:
        """Instala dependencias necesarias"""
        self.print_step(3, "Instalación de Dependencias", "Instalando paquetes necesarios")
        
        requirements_file = self.project_root / 'requirements.txt'
        if not requirements_file.exists():
            self.print_error("No se encontró requirements.txt")
            return False
        
        try:
            self.print_info("Instalando dependencias...")
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.print_success("Dependencias instaladas correctamente")
                return True
            else:
                self.print_error(f"Error instalando dependencias: {result.stderr}")
                return False
                
        except Exception as e:
            self.print_error(f"Error durante instalación: {e}")
            return False
    
    def configure_apis(self) -> bool:
        """Configura las APIs de forma segura"""
        self.print_step(4, "Configuración de APIs", "Configurando APIs de forma segura")
        
        self.print_info("Este paso te ayudará a configurar tus APIs de forma segura")
        self.print_info("Las claves se guardarán en el archivo .env (privado)")
        
        # Verificar si ya existe configuración
        if self.env_file.exists():
            response = input(f"\n{self.colors['yellow']}¿Quieres reconfigurar las APIs? (s/N): {self.colors['end']}")
            if response.lower() != 's':
                self.print_info("Saltando configuración de APIs")
                return True
        
        # Crear archivo .env desde ejemplo
        if not self.example_file.exists():
            self.print_error("No se encontró env.example")
            return False
        
        try:
            with open(self.example_file, 'r', encoding='utf-8') as f:
                example_content = f.read()
            
            # Reemplazar placeholders con valores reales
            config_content = self.interactive_config(example_content)
            
            # Guardar archivo .env
            with open(self.env_file, 'w', encoding='utf-8') as f:
                f.write(config_content)
            
            # Configurar permisos seguros
            os.chmod(self.env_file, 0o600)
            
            self.print_success("Archivo .env creado con permisos seguros")
            return True
            
        except Exception as e:
            self.print_error(f"Error configurando APIs: {e}")
            return False
    
    def interactive_config(self, template: str) -> str:
        """Configuración interactiva de APIs"""
        config = template
        
        print(f"\n{self.colors['cyan']}Configuración de APIs:{self.colors['end']}")
        print("Deja vacío para saltar una API")
        
        # OpenAI
        print(f"\n{self.colors['blue']}OpenAI (ChatGPT):{self.colors['end']}")
        print("Obtén tu clave gratuita en: https://platform.openai.com/api-keys")
        openai_key = getpass.getpass("API Key (no se mostrará): ").strip()
        if openai_key:
            config = config.replace('tu_clave_api_de_openai_aqui', openai_key)
            self.print_success("OpenAI configurado")
        else:
            config = config.replace('tu_clave_api_de_openai_aqui', '')
            self.print_info("OpenAI saltado")
        
        # HuggingFace
        print(f"\n{self.colors['blue']}HuggingFace (Gratuita):{self.colors['end']}")
        print("Obtén tu clave gratuita en: https://huggingface.co/settings/tokens")
        hf_key = getpass.getpass("API Key (no se mostrará): ").strip()
        if hf_key:
            config = config.replace('tu_clave_api_de_huggingface_aqui', hf_key)
            self.print_success("HuggingFace configurado")
        else:
            config = config.replace('tu_clave_api_de_huggingface_aqui', '')
            self.print_info("HuggingFace saltado")
        
        # Google Gemini
        print(f"\n{self.colors['blue']}Google Gemini (Gratuita):{self.colors['end']}")
        print("Obtén tu clave gratuita en: https://makersuite.google.com/app/apikey")
        gemini_key = getpass.getpass("API Key (no se mostrará): ").strip()
        if gemini_key:
            config = config.replace('tu_clave_api_de_gemini_aqui', gemini_key)
            self.print_success("Google Gemini configurado")
        else:
            config = config.replace('tu_clave_api_de_gemini_aqui', '')
            self.print_info("Google Gemini saltado")
        
        # Anthropic
        print(f"\n{self.colors['blue']}Anthropic (Claude):{self.colors['end']}")
        print("Obtén tu clave en: https://console.anthropic.com/")
        anthropic_key = getpass.getpass("API Key (no se mostrará): ").strip()
        if anthropic_key:
            config = config.replace('tu_clave_api_de_anthropic_aqui', anthropic_key)
            self.print_success("Anthropic configurado")
        else:
            config = config.replace('tu_clave_api_de_anthropic_aqui', '')
            self.print_info("Anthropic saltado")
        
        return config
    
    def test_configuration(self) -> bool:
        """Prueba la configuración"""
        self.print_step(5, "Prueba de Configuración", "Verificando que todo funciona correctamente")
        
        # Verificar que existe el script de prueba
        test_script = self.project_root / 'probar_api.py'
        if test_script.exists():
            try:
                self.print_info("Ejecutando pruebas de configuración...")
                result = subprocess.run([
                    sys.executable, str(test_script)
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    self.print_success("Configuración probada correctamente")
                    return True
                else:
                    self.print_warning(f"Pruebas fallaron: {result.stderr}")
                    return False
                    
            except subprocess.TimeoutExpired:
                self.print_warning("Pruebas tardaron demasiado (timeout)")
                return False
            except Exception as e:
                self.print_warning(f"Error ejecutando pruebas: {e}")
                return False
        else:
            self.print_warning("Script de prueba no encontrado")
            return True
    
    def run_security_check(self) -> bool:
        """Ejecuta verificación de seguridad"""
        self.print_step(6, "Verificación Final de Seguridad", "Asegurando que todo está configurado de forma segura")
        
        # Verificar que existe el script de seguridad
        security_script = self.project_root / 'security_checker.py'
        if security_script.exists():
            try:
                self.print_info("Ejecutando verificación de seguridad...")
                result = subprocess.run([
                    sys.executable, str(security_script)
                ], capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    self.print_success("Verificación de seguridad pasada")
                    return True
                else:
                    self.print_warning("Verificación de seguridad encontró problemas")
                    print(result.stdout)
                    return False
                    
            except subprocess.TimeoutExpired:
                self.print_warning("Verificación de seguridad tardó demasiado")
                return False
            except Exception as e:
                self.print_warning(f"Error en verificación de seguridad: {e}")
                return False
        else:
            self.print_warning("Script de verificación de seguridad no encontrado")
            return True
    
    def show_next_steps(self):
        """Muestra los próximos pasos"""
        self.print_step(7, "Próximos Pasos", "Lo que puedes hacer ahora")
        
        print(f"\n{self.colors['green']}🎉 ¡Configuración completada!{self.colors['end']}")
        
        print(f"\n{self.colors['cyan']}Comandos útiles:{self.colors['end']}")
        print("  python lucIA.py                    # Iniciar LucIA")
        print("  python probar_api.py               # Probar configuración")
        print("  python security_checker.py         # Verificar seguridad")
        
        print(f"\n{self.colors['cyan']}Documentación:{self.colors['end']}")
        print("  README_OPEN_SOURCE.md              # Guía de código abierto")
        print("  SECURITY_GUIDE.md                  # Guía de seguridad")
        print("  CONFIGURACION_API.md               # Configuración de APIs")
        
        print(f"\n{self.colors['cyan']}Recursos de ayuda:{self.colors['end']}")
        print("  https://github.com/Chicook/MetaversoCryptoWoldVirtual3d")
        print("  https://discord.gg/metaversocrypto")
        
        print(f"\n{self.colors['yellow']}⚠️ IMPORTANTE:{self.colors['end']}")
        print("  - El archivo .env contiene tus claves privadas")
        print("  - NUNCA lo subas a GitHub")
        print("  - Mantén una copia de seguridad segura")
        
        print(f"\n{self.colors['green']}🚀 ¡Disfruta explorando el metaverso con LucIA!{self.colors['end']}")
    
    def run(self):
        """Ejecuta el proceso completo de configuración"""
        self.print_banner()
        
        steps = [
            ("Verificación de Prerequisitos", self.check_prerequisites),
            ("Verificación de Seguridad", self.check_security_status),
            ("Instalación de Dependencias", self.install_dependencies),
            ("Configuración de APIs", self.configure_apis),
            ("Prueba de Configuración", self.test_configuration),
            ("Verificación Final de Seguridad", self.run_security_check),
        ]
        
        for i, (title, step_func) in enumerate(steps, 1):
            try:
                if not step_func():
                    self.print_error(f"Error en paso {i}: {title}")
                    self.print_info("Revisa los errores y vuelve a intentar")
                    return False
            except KeyboardInterrupt:
                self.print_info("\nConfiguración cancelada por el usuario")
                return False
            except Exception as e:
                self.print_error(f"Error inesperado en paso {i}: {e}")
                return False
        
        self.show_next_steps()
        return True

def main():
    """Función principal"""
    quick_start = QuickStartSecure()
    success = quick_start.run()
    
    if success:
        print(f"\n{quick_start.colors['green']}✅ Configuración completada exitosamente{quick_start.colors['end']}")
        sys.exit(0)
    else:
        print(f"\n{quick_start.colors['red']}❌ Configuración falló{quick_start.colors['end']}")
        sys.exit(1)

if __name__ == "__main__":
    main() 