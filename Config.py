"""
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
## PRECAUCIÓN ANTES DE UTILIZAR ##
# REVISARLO: y modificar errores de pérdida de ##
## datos actualmente la función de guardar una copia de seguridad... ##
## no esta funcionando como se espera ##
## por lo que se recomienda hacer refactorizacion y pruebas en .. #
## entorno seguro como un directorio de pruebas ##
## cullos archivos sea fácilmente recuperables. ##


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
            'ini', 'js', 'javascript', 'rust', 'languages', 'lib', 'middlewares', 'models',
            'modules', 'package', 'pages', 'public', 'services', 'src',
            'web', 'lucia_learning', 'coverage', 'build', 'dist', '.bin'
        ]
        
        # Archivos especiales que deben preservarse por carpeta (NO se empaquetan)
        self.special_preserve_files = {
            '.github': ['README.md', '.gitignore', 'FUNDING.yml'],  # Estos NO se empaquetan
            '.bin': ['README.md', '.gitignore'],  # Estos NO se empaquetan
            'default': ['README.md', '.gitignore']  # Estos NO se empaquetan
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
        """Encuentra solo archivos de dependencias principales"""
        dependency_files = {}
        
        # Solo buscar en carpetas principales para evitar procesar todo el proyecto
        main_dirs = ['client', 'web', 'src', 'services', 'components', 'assets', 'bloc', 'javascript', 'rust']
        
        for lang, patterns in self.dependency_files.items():
            dependency_files[lang] = []
            for pattern in patterns:
                for main_dir in main_dirs:
                    dir_path = self.project_root / main_dir
                    if dir_path.exists():
                        files = list(dir_path.rglob(pattern))
                        dependency_files[lang].extend(files)
                
                # También buscar en raíz
                root_files = list(self.project_root.glob(pattern))
                dependency_files[lang].extend(root_files)
        
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
        """Comando: Instalar dependencias y RESTAURAR carpetas"""
        print("🔧 INICIANDO INSTALACIÓN Y RESTAURACIÓN...")
        self.log_operation("COMMAND_STARTED", "Instalar")
        
        # PASO 1: BUSCAR BACKUP MÁS RECIENTE
        print("\n📁 PASO 1: BUSCANDO BACKUP MÁS RECIENTE...")
        backup_files = list(self.backup_dir.glob("collection_*.zip"))
        
        if not backup_files:
            print("❌ No se encontraron backups para restaurar")
            print("   Primero ejecuta: python Config.py Recoger")
            return
        
        # Ordenar por fecha de modificación (más reciente primero)
        backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        latest_backup = backup_files[0]
        print(f"   ✅ Backup encontrado: {latest_backup.name}")
        
        # PASO 2: INSTALAR DEPENDENCIAS
        print("\n📦 PASO 2: INSTALANDO DEPENDENCIAS...")
        dependency_files = self.find_dependency_files()
        installed_count = 0
        error_count = 0
        
        for lang, files in dependency_files.items():
            print(f"  📦 Instalando {lang}: {len(files)} archivos")
            for file_path in files:
                if self.install_dependencies(lang, file_path):
                    installed_count += 1
                else:
                    error_count += 1
        
        # PASO 3: RESTAURAR CONTENIDO DE CARPETAS
        print(f"\n🔄 PASO 3: RESTAURANDO CONTENIDO DE CARPETAS...")
        try:
            with zipfile.ZipFile(latest_backup, 'r') as zipf:
                restored_count = 0
                
                # Restaurar archivos de carpetas especiales
                for info in zipf.infolist():
                    if info.filename.startswith('folders/'):
                        # Extraer a ubicación original
                        relative_path = info.filename.replace('folders/', '')
                        target_path = self.project_root / relative_path
                        
                        # Crear directorio si no existe
                        target_path.parent.mkdir(parents=True, exist_ok=True)
                        
                        # Restaurar archivo
                        with zipf.open(info) as source:
                            with open(target_path, 'wb') as target:
                                target.write(source.read())
                        
                        restored_count += 1
                        
                        if restored_count % 10 == 0:
                            print(f"  ✅ Restaurados: {restored_count} archivos")
                
                print(f"   ✅ Total archivos restaurados: {restored_count}")
            
            print(f"   ✅ Contenido restaurado desde: {latest_backup.name}")
            
        except Exception as e:
            print(f"❌ Error en restauración: {e}")
            self.log_operation("RESTORE_ERROR", f"{e}")
        
        # PASO 4: CREAR PAQUETE FINAL
        print(f"\n📦 PASO 4: CREANDO PAQUETE FINAL...")
        package_path = self.create_dependency_package()
        
        # Resumen final
        print(f"\n✅ INSTALACIÓN Y RESTAURACIÓN COMPLETADA")
        print(f"   📦 Dependencias instaladas: {installed_count}")
        print(f"   ❌ Errores: {error_count}")
        print(f"   🔄 Archivos restaurados: {restored_count}")
        print(f"   📁 Backup usado: {latest_backup.name}")
        if package_path:
            print(f"   📦 Paquete final: {package_path}")
        
        self.log_operation("COMMAND_COMPLETED", f"Instalar - Installed: {installed_count}, Restored: {restored_count}")
    
    def command_recoger(self):
        """Comando: Recoger archivos principales con protección y limpiar carpetas"""
        print("📁 INICIANDO RECOLECCIÓN Y LIMPIEZA...")
        self.log_operation("COMMAND_STARTED", "Recoger")
        
        # Crear paquete de recolección
        collection_path = self.backup_dir / f"collection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        
        try:
            with zipfile.ZipFile(collection_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                files_processed = 0
                
                # PASO 1: Buscar archivos de dependencias en raíz
                print("  🔍 Buscando archivos de dependencias...")
                root_files = ['package.json', 'requirements.txt', 'tsconfig.json', 'go.mod']
                
                for file_name in root_files:
                    file_path = self.project_root / file_name
                    if file_path.exists():
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            
                            sanitized_content, modified = self.sanitize_content(content, str(file_path))
                            arcname = f"root/{file_name}"
                            zipf.writestr(arcname, sanitized_content)
                            files_processed += 1
                            print(f"    ✅ Recolectado: {file_name}")
                            
                        except Exception as e:
                            print(f"    ❌ Error con {file_name}: {e}")
                
                # PASO 2: Buscar en carpetas principales
                main_folders = ['client', 'web', 'src', '.bin', 'javascript', 'rust']
                for folder_name in main_folders:
                    folder_path = self.project_root / folder_name
                    if folder_path.exists():
                        print(f"  📁 Procesando carpeta: {folder_name}")
                        folder_files = 0
                        
                        # Buscar archivos de configuración y código
                        patterns = ['package.json', 'tsconfig.json', '*.ts', '*.tsx', '*.js', '*.jsx', '*.md']
                        for pattern in patterns:
                            for item in folder_path.rglob(pattern):
                                if item.is_file():
                                    try:
                                        arcname = f"folders/{folder_name}/{item.relative_to(folder_path)}"
                                        zipf.writestr(arcname, item.read_text(encoding='utf-8'))
                                        folder_files += 1
                                    except Exception as e:
                                        print(f"    ❌ Error con {item.name}: {e}")
                        
                        print(f"    ✅ Archivos en {folder_name}: {folder_files}")
                        files_processed += folder_files
                
                # PASO 3: Buscar Config.py
                config_file = self.project_root / "Config.py"
                if config_file.exists():
                    try:
                        with open(config_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        sanitized_content, modified = self.sanitize_content(content, str(config_file))
                        zipf.writestr("Config.py", sanitized_content)
                        files_processed += 1
                        print(f"    ✅ Recolectado: Config.py")
                    except Exception as e:
                        print(f"    ❌ Error con Config.py: {e}")
                
                # PASO 4: Procesar .github (solo contenido, preservar archivos especiales)
                github_folder = self.project_root / ".github"
                if github_folder.exists():
                    print(f"  📁 Procesando .github (preservando archivos especiales)...")
                    github_files = 0
                    preserve_files = set(self.special_preserve_files['.github'])
                    
                    for item in github_folder.rglob('*'):
                        if item.is_file() and item.name not in preserve_files:
                            try:
                                arcname = f"github/{item.relative_to(github_folder)}"
                                zipf.writestr(arcname, item.read_text(encoding='utf-8'))
                                github_files += 1
                            except Exception as e:
                                print(f"    ❌ Error con {item.name}: {e}")
                    
                    print(f"    ✅ Archivos en .github: {github_files}")
                    files_processed += github_files
                
                # Reporte
                report = {
                    'timestamp': datetime.now().isoformat(),
                    'files_processed': files_processed,
                    'folders_processed': len(main_folders),
                    'github_preserved': ['README.md', '.gitignore', 'FUNDING.yml']
                }
                zipf.writestr('report.json', json.dumps(report, indent=2))
            
            # PASO 4: LIMPIAR CARPETAS ESPECIALES
            print(f"\n🧹 LIMPIANDO CARPETAS ESPECIALES...")
            cleaned_folders = 0
            
            for folder_name in self.special_folders:
                folder_path = self.project_root / folder_name
                if folder_path.exists():
                    print(f"  🧹 Limpiando: {folder_name}")
                    if self.clean_special_folder(folder_path):
                        cleaned_folders += 1
                        print(f"    ✅ Limpiada: {folder_name}")
                    else:
                        print(f"    ❌ Error limpiando: {folder_name}")
            
            # PASO 5: LIMPIAR .github (preservar archivos especiales)
            github_folder = self.project_root / ".github"
            if github_folder.exists():
                print(f"  🧹 Limpiando .github (preservando archivos especiales)...")
                preserve_files = set(self.special_preserve_files['.github'])
                
                # Crear backup antes de limpiar
                self.backup_special_folder(github_folder)
                
                # Remover archivos excepto los preservados
                for item in github_folder.iterdir():
                    if item.name not in preserve_files:
                        if item.is_file():
                            item.unlink()
                        elif item.is_dir():
                            shutil.rmtree(item)
                
                print(f"    ✅ .github limpiado - Preservados: {list(preserve_files)}")
                cleaned_folders += 1
            
            # Resumen
            print(f"\n✅ RECOLECCIÓN Y LIMPIEZA COMPLETADA")
            print(f"   📦 Total archivos procesados: {files_processed}")
            print(f"   🧹 Carpetas limpiadas: {cleaned_folders}")
            print(f"   📦 Paquete creado: {collection_path}")
            
            self.log_operation("COMMAND_COMPLETED", f"Recoger - Files: {files_processed}, Cleaned: {cleaned_folders}")
            
        except Exception as e:
            print(f"❌ Error en recolección: {e}")
            self.log_operation("COLLECTION_ERROR", f"{e}")

def main():
    """Función principal"""
    if len(sys.argv) != 2:
        print("🔧 WoldVirtual3DlucIA - Sistema de Seguridad Global v0.6.0")
        print("\nUso:")
        print("  python Config.py Recoger   - Recolecta archivos y LIMPIA carpetas")
        print("  python Config.py Instalar  - Instala dependencias y RESTAURA carpetas")
        print("\nDescripción:")
        print("  Recoger:  Recolecta archivos → Limpia carpetas (solo README.md y .gitignore)")
        print("  Instalar: Instala dependencias → Restaura contenido de carpetas")
        print("\nFlujo de trabajo:")
        print("  1. python Config.py Recoger  (limpia y guarda backup)")
        print("  2. python Config.py Instalar (restaura desde backup)")
        print("\nEjemplos:")
        print("  python Config.py Recoger")
        print("  python Config.py Instalar")
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
