#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WoldVirtual3DlucIA - Sistema de Seguridad Global v0.6.0
Config.py - Gestor de Dependencias y Protección de APIs

Funcionalidades:
- Instalación segura de dependencias
- Recolección de archivos con protección de APIs
- Gestión de múltiples lenguajes de programación
- Protección automática de claves API
- Backup y restauración de configuraciones

Comandos disponibles:
- "Instalar": Instala todas las dependencias del proyecto
- "Recoger": Recolecta archivos con protección de APIs
"""

import os
import sys
import json
import shutil
import subprocess
import hashlib
import zipfile
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import re
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('config_security.log'),
        logging.StreamHandler()
    ]
)

class SecurityConfigManager:
    """Gestor principal de seguridad y configuración global"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.backup_dir = self.project_root / "backups" / "config_security"
        self.temp_dir = Path(tempfile.gettempdir()) / "woldvirtual_config"
        self.security_log = self.project_root / "logs" / "security_operations.log"
        
        # Patrones de APIs sensibles
        self.api_patterns = {
            'openai': [
                r'sk-[a-zA-Z0-9]{20,}',
                r'OPENAI_API_KEY\s*=\s*["\'][^"\']*["\']',
                r'openai\.api_key\s*=\s*["\'][^"\']*["\']'
            ],
            'gemini': [
                r'AIza[0-9A-Za-z-_]{35}',
                r'GEMINI_API_KEY\s*=\s*["\'][^"\']*["\']',
                r'genai\.configure\(api_key\s*=\s*["\'][^"\']*["\']'
            ],
            'claude': [
                r'sk-ant-[a-zA-Z0-9]{48}',
                r'CLAUDE_API_KEY\s*=\s*["\'][^"\']*["\']',
                r'ANTHROPIC_API_KEY\s*=\s*["\'][^"\']*["\']'
            ]
        }
        
        # Archivos de dependencias por lenguaje
        self.dependency_files = {
            'python': ['requirements.txt', 'setup.py', 'pyproject.toml'],
            'javascript': ['package.json', 'yarn.lock', 'package-lock.json'],
            'go': ['go.mod', 'go.sum'],
            'rust': ['Cargo.toml', 'Cargo.lock'],
            'java': ['pom.xml', 'build.gradle'],
            'csharp': ['*.csproj', 'packages.config'],
            'php': ['composer.json', 'composer.lock']
        }
        
        # Carpetas especiales que solo deben mantener README y .gitignore
        self.special_folders = [
            '@types', 'config', 'docs', 'test', 'scripts', 'logs',
            'assets', 'bloc', 'cli', 'client', 'components', 'css',
            'data', 'entities', 'fonts', 'helpers', 'image', 'Include',
            'ini', 'js', 'languages', 'lib', 'middlewares', 'models',
            'modules', 'package', 'pages', 'public', 'services', 'src',
            'web', 'lucia_learning', 'coverage', 'build', 'dist'
        ]
        
        # Archivos especiales que deben preservarse por carpeta
        self.special_preserve_files = {
            '.github': ['README.md', '.gitignore', 'FUNDING.yml'],
            'default': ['README.md', '.gitignore']
        }
        
        self.setup_directories()
    
    def setup_directories(self):
        """Configura los directorios necesarios"""
        directories = [
            self.backup_dir,
            self.temp_dir,
            self.security_log.parent
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def log_operation(self, operation: str, details: str):
        """Registra operaciones de seguridad"""
        timestamp = datetime.now().isoformat()
        log_entry = f"[{timestamp}] {operation}: {details}\n"
        
        with open(self.security_log, 'a', encoding='utf-8') as f:
            f.write(log_entry)
        
        logging.info(f"{operation}: {details}")
    
    def detect_api_keys(self, content: str) -> Dict[str, List[str]]:
        """Detecta claves API en el contenido"""
        found_keys = {}
        
        for api_type, patterns in self.api_patterns.items():
            found_keys[api_type] = []
            for pattern in patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                found_keys[api_type].extend(matches)
        
        return found_keys
    
    def sanitize_content(self, content: str, file_path: str) -> Tuple[str, bool]:
        """Sanitiza el contenido removiendo claves API"""
        original_content = content
        modified = False
        
        # Patrones de reemplazo seguros
        replacements = {
            'openai': {
                r'sk-[a-zA-Z0-9]{20,}': 'OPENAI_API_KEY_REMOVED',
                r'OPENAI_API_KEY\s*=\s*["\'][^"\']*["\']': 'OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")',
                r'openai\.api_key\s*=\s*["\'][^"\']*["\']': 'openai.api_key = os.getenv("OPENAI_API_KEY")'
            },
            'gemini': {
                r'AIza[0-9A-Za-z-_]{35}': 'GEMINI_API_KEY_REMOVED',
                r'GEMINI_API_KEY\s*=\s*["\'][^"\']*["\']': 'GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")',
                r'genai\.configure\(api_key\s*=\s*["\'][^"\']*["\']': 'genai.configure(api_key=os.getenv("GEMINI_API_KEY"))'
            },
            'claude': {
                r'sk-ant-[a-zA-Z0-9]{48}': 'CLAUDE_API_KEY_REMOVED',
                r'CLAUDE_API_KEY\s*=\s*["\'][^"\']*["\']': 'CLAUDE_API_KEY=os.getenv("CLAUDE_API_KEY")',
                r'ANTHROPIC_API_KEY\s*=\s*["\'][^"\']*["\']': 'ANTHROPIC_API_KEY=os.getenv("ANTHROPIC_API_KEY")'
            }
        }
        
        for api_type, patterns in replacements.items():
            for pattern, replacement in patterns.items():
                if re.search(pattern, content, re.IGNORECASE):
                    content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
                    modified = True
                    self.log_operation("API_SANITIZED", f"{api_type} en {file_path}")
        
        return content, modified
    
    def find_dependency_files(self) -> Dict[str, List[Path]]:
        """Encuentra todos los archivos de dependencias"""
        dependency_files = {}
        
        for lang, patterns in self.dependency_files.items():
            dependency_files[lang] = []
            for pattern in patterns:
                files = list(self.project_root.rglob(pattern))
                dependency_files[lang].extend(files)
        
        return dependency_files
    
    def install_dependencies(self, lang: str, file_path: Path) -> bool:
        """Instala dependencias para un archivo específico"""
        try:
            if lang == 'python':
                if file_path.name == 'requirements.txt':
                    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(file_path)], 
                                 check=True, capture_output=True)
                elif file_path.name == 'setup.py':
                    subprocess.run([sys.executable, 'setup.py', 'install'], 
                                 cwd=file_path.parent, check=True, capture_output=True)
            
            elif lang == 'javascript':
                if file_path.name == 'package.json':
                    subprocess.run(['npm', 'install'], 
                                 cwd=file_path.parent, check=True, capture_output=True)
            
            elif lang == 'go':
                if file_path.name == 'go.mod':
                    subprocess.run(['go', 'mod', 'download'], 
                                 cwd=file_path.parent, check=True, capture_output=True)
            
            self.log_operation("DEPENDENCY_INSTALLED", f"{lang}: {file_path}")
            return True
            
        except subprocess.CalledProcessError as e:
            self.log_operation("DEPENDENCY_ERROR", f"{lang}: {file_path} - {e}")
            return False
    
    def backup_special_folder(self, folder_path: Path) -> bool:
        """Hace backup de una carpeta especial"""
        try:
            if not folder_path.exists():
                return True
            
            backup_path = self.backup_dir / f"{folder_path.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Determinar qué archivos preservar según la carpeta
            folder_name = folder_path.name
            preserve_files = self.special_preserve_files.get(folder_name, self.special_preserve_files['default'])
            
            # Crear backup de archivos preservados
            backup_path.mkdir(parents=True, exist_ok=True)
            
            for file_name in preserve_files:
                source_file = folder_path / file_name
                if source_file.exists():
                    shutil.copy2(source_file, backup_path / file_name)
            
            self.log_operation("FOLDER_BACKUP", f"{folder_path} -> {backup_path}")
            return True
            
        except Exception as e:
            self.log_operation("BACKUP_ERROR", f"{folder_path}: {e}")
            return False
    
    def clean_special_folder(self, folder_path: Path) -> bool:
        """Limpia una carpeta especial dejando solo archivos preservados"""
        try:
            if not folder_path.exists():
                return True
            
            # Determinar qué archivos preservar según la carpeta
            folder_name = folder_path.name
            preserve_files = set(self.special_preserve_files.get(folder_name, self.special_preserve_files['default']))
            
            # Crear backup antes de limpiar
            self.backup_special_folder(folder_path)
            
            # Remover archivos excepto los preservados
            for item in folder_path.iterdir():
                if item.name not in preserve_files:
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            
            self.log_operation("FOLDER_CLEANED", f"{folder_path} - Preserved: {list(preserve_files)}")
            return True
            
        except Exception as e:
            self.log_operation("CLEAN_ERROR", f"{folder_path}: {e}")
            return False
    
    def create_dependency_package(self) -> Path:
        """Crea un paquete con todas las dependencias"""
        try:
            package_path = self.backup_dir / f"dependencies_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
            
            with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                dependency_files = self.find_dependency_files()
                
                for lang, files in dependency_files.items():
                    for file_path in files:
                        # Sanitizar contenido antes de empaquetar
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        sanitized_content, modified = self.sanitize_content(content, str(file_path))
                        
                        # Agregar al zip con ruta relativa
                        arcname = f"{lang}/{file_path.relative_to(self.project_root)}"
                        zipf.writestr(arcname, sanitized_content)
                        
                        if modified:
                            self.log_operation("PACKAGE_SANITIZED", f"{file_path}")
            
            self.log_operation("PACKAGE_CREATED", f"{package_path}")
            return package_path
            
        except Exception as e:
            self.log_operation("PACKAGE_ERROR", f"{e}")
            return None
    
    def scan_project_files(self) -> Dict[str, any]:
        """Escanea todos los archivos del proyecto"""
        scan_results = {
            'total_files': 0,
            'api_keys_found': {},
            'dependency_files': {},
            'special_folders': {},
            'security_issues': []
        }
        
        try:
            # Escanear archivos de dependencias
            dependency_files = self.find_dependency_files()
            scan_results['dependency_files'] = {
                lang: [str(f) for f in files] 
                for lang, files in dependency_files.items()
            }
            
            # Escanear carpetas especiales
            for folder_name in self.special_folders:
                folder_path = self.project_root / folder_name
                if folder_path.exists():
                    scan_results['special_folders'][folder_name] = {
                        'exists': True,
                        'files': [f.name for f in folder_path.iterdir() if f.is_file()],
                        'subdirs': [d.name for d in folder_path.iterdir() if d.is_dir()]
                    }
                else:
                    scan_results['special_folders'][folder_name] = {'exists': False}
            
            # Escanear archivos en busca de APIs
            for file_path in self.project_root.rglob('*'):
                if file_path.is_file() and file_path.suffix in ['.py', '.js', '.ts', '.json', '.env', '.md']:
                    scan_results['total_files'] += 1
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        api_keys = self.detect_api_keys(content)
                        if any(api_keys.values()):
                            scan_results['api_keys_found'][str(file_path)] = api_keys
                            
                    except Exception as e:
                        scan_results['security_issues'].append(f"Error leyendo {file_path}: {e}")
            
            self.log_operation("PROJECT_SCANNED", f"Total files: {scan_results['total_files']}")
            return scan_results
            
        except Exception as e:
            self.log_operation("SCAN_ERROR", f"{e}")
            return scan_results
    
    def command_instalar(self):
        """Comando: Instalar dependencias"""
        print("🔧 INICIANDO INSTALACIÓN DE DEPENDENCIAS...")
        self.log_operation("COMMAND_STARTED", "Instalar")
        
        # Escanear proyecto
        scan_results = self.scan_project_files()
        
        # Instalar dependencias por lenguaje
        dependency_files = self.find_dependency_files()
        installed_count = 0
        error_count = 0
        
        for lang, files in dependency_files.items():
            print(f"\n📦 Instalando dependencias {lang.upper()}...")
            
            for file_path in files:
                print(f"  - {file_path.relative_to(self.project_root)}")
                
                if self.install_dependencies(lang, file_path):
                    installed_count += 1
                else:
                    error_count += 1
        
        # Limpiar carpetas especiales
        print(f"\n🧹 Limpiando carpetas especiales...")
        for folder_name in self.special_folders:
            folder_path = self.project_root / folder_name
            if folder_path.exists():
                print(f"  - {folder_name}")
                self.clean_special_folder(folder_path)
        
        # Crear paquete de dependencias
        print(f"\n📦 Creando paquete de dependencias...")
        package_path = self.create_dependency_package()
        
        # Resumen
        print(f"\n✅ INSTALACIÓN COMPLETADA")
        print(f"   📊 Archivos escaneados: {scan_results['total_files']}")
        print(f"   📦 Dependencias instaladas: {installed_count}")
        print(f"   ❌ Errores: {error_count}")
        print(f"   🧹 Carpetas limpiadas: {len(self.special_folders)}")
        if package_path:
            print(f"   📦 Paquete creado: {package_path}")
        
        self.log_operation("COMMAND_COMPLETED", f"Instalar - Installed: {installed_count}, Errors: {error_count}")
    
    def command_recoger(self):
        """Comando: Recoger archivos con protección"""
        print("📁 INICIANDO RECOLECCIÓN DE ARCHIVOS...")
        self.log_operation("COMMAND_STARTED", "Recoger")
        
        # Escanear proyecto
        scan_results = self.scan_project_files()
        
        # Crear paquete de recolección
        collection_path = self.backup_dir / f"collection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        
        try:
            with zipfile.ZipFile(collection_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Agregar archivos de dependencias sanitizados
                dependency_files = self.find_dependency_files()
                for lang, files in dependency_files.items():
                    for file_path in files:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        sanitized_content, modified = self.sanitize_content(content, str(file_path))
                        arcname = f"dependencies/{lang}/{file_path.relative_to(self.project_root)}"
                        zipf.writestr(arcname, sanitized_content)
                
                # Agregar archivos preservados de carpetas especiales
                for folder_name in self.special_folders:
                    folder_path = self.project_root / folder_name
                    if folder_path.exists():
                        preserve_files = self.special_preserve_files.get(folder_name, self.special_preserve_files['default'])
                        for file_name in preserve_files:
                            file_path = folder_path / file_name
                            if file_path.exists():
                                arcname = f"special_folders/{folder_name}/{file_name}"
                                zipf.writestr(arcname, file_path.read_text(encoding='utf-8'))
                
                # Agregar reporte de escaneo
                scan_report = {
                    'timestamp': datetime.now().isoformat(),
                    'scan_results': scan_results,
                    'security_summary': {
                        'api_keys_found': len(scan_results['api_keys_found']),
                        'total_files_scanned': scan_results['total_files'],
                        'special_folders_processed': len(scan_results['special_folders'])
                    }
                }
                
                zipf.writestr('scan_report.json', json.dumps(scan_report, indent=2))
            
            # Resumen
            print(f"\n✅ RECOLECCIÓN COMPLETADA")
            print(f"   📊 Archivos escaneados: {scan_results['total_files']}")
            print(f"   🔑 APIs encontradas: {len(scan_results['api_keys_found'])}")
            print(f"   📦 Dependencias procesadas: {sum(len(files) for files in dependency_files.values())}")
            print(f"   🧹 Carpetas especiales: {len(scan_results['special_folders'])}")
            print(f"   📦 Paquete creado: {collection_path}")
            
            # Mostrar APIs encontradas
            if scan_results['api_keys_found']:
                print(f"\n⚠️  APIs ENCONTRADAS (SANITIZADAS):")
                for file_path, apis in scan_results['api_keys_found'].items():
                    print(f"   📄 {file_path}")
                    for api_type, keys in apis.items():
                        if keys:
                            print(f"      🔑 {api_type}: {len(keys)} claves")
            
            self.log_operation("COMMAND_COMPLETED", f"Recoger - Package: {collection_path}")
            
        except Exception as e:
            print(f"❌ Error en recolección: {e}")
            self.log_operation("COLLECTION_ERROR", f"{e}")

def main():
    """Función principal"""
    if len(sys.argv) != 2:
        print("🔧 WoldVirtual3DlucIA - Sistema de Seguridad Global v0.6.0")
        print("\nUso:")
        print("  python Config.py Instalar  - Instala dependencias y limpia carpetas")
        print("  python Config.py Recoger   - Recolecta archivos con protección de APIs")
        print("\nEjemplos:")
        print("  python Config.py Instalar")
        print("  python Config.py Recoger")
        return
    
    command = sys.argv[1].lower()
    manager = SecurityConfigManager()
    
    if command == "instalar":
        manager.command_instalar()
    elif command == "recoger":
        manager.command_recoger()
    else:
        print(f"❌ Comando desconocido: {command}")
        print("Comandos disponibles: Instalar, Recoger")

if __name__ == "__main__":
    main()
