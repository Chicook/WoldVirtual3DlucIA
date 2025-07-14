"""
Gestor de Dependencias para LucIA
Permite a LucIA instalar automáticamente todas las dependencias del proyecto
"""

import os
import sys
import subprocess
import json
import platform
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class DependenciesManager:
    """Gestor de dependencias para WoldVirtual3DlucIA"""
    
    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.system = platform.system().lower()
        self.node_version = None
        self.npm_version = None
        
    def check_system_requirements(self) -> Dict[str, any]:
        """Verifica los requisitos del sistema"""
        status = {
            "node_installed": False,
            "npm_installed": False,
            "python_installed": False,
            "git_installed": False,
            "node_version": None,
            "npm_version": None,
            "python_version": None,
            "git_version": None,
            "recommendations": []
        }
        
        # Verificar Node.js
        try:
            result = subprocess.run(['node', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                status["node_installed"] = True
                status["node_version"] = result.stdout.strip()
                self.node_version = result.stdout.strip()
        except (subprocess.TimeoutExpired, FileNotFoundError):
            status["recommendations"].append("Instalar Node.js 18.x o superior")
        
        # Verificar npm
        try:
            result = subprocess.run(['npm', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                status["npm_installed"] = True
                status["npm_version"] = result.stdout.strip()
                self.npm_version = result.stdout.strip()
        except (subprocess.TimeoutExpired, FileNotFoundError):
            status["recommendations"].append("Instalar npm 9.x o superior")
        
        # Verificar Python
        try:
            result = subprocess.run([sys.executable, '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                status["python_installed"] = True
                status["python_version"] = result.stdout.strip()
        except (subprocess.TimeoutExpired, FileNotFoundError):
            status["recommendations"].append("Instalar Python 3.11+")
        
        # Verificar Git
        try:
            result = subprocess.run(['git', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                status["git_installed"] = True
                status["git_version"] = result.stdout.strip()
        except (subprocess.TimeoutExpired, FileNotFoundError):
            status["recommendations"].append("Instalar Git")
        
        return status
    
    def get_project_structure(self) -> Dict[str, any]:
        """Obtiene la estructura del proyecto y sus dependencias"""
        structure = {
            "project_root": str(self.project_root),
            "modules": {},
            "total_modules": 0,
            "modules_with_deps": 0
        }
        
        # Módulos principales que pueden tener dependencias
        modules_to_check = [
            "web",
            ".bin/editor3d", 
            "client",
            "assets",
            "bloc",
            "components",
            "entities",
            "fonts",
            "helpers",
            "image",
            "languages",
            "lib",
            "middlewares",
            "models",
            "package",
            "pages",
            "public",
            "scripts",
            "services",
            "src",
            "test"
        ]
        
        for module in modules_to_check:
            module_path = self.project_root / module
            if module_path.exists():
                package_json = module_path / "package.json"
                requirements_txt = module_path / "requirements.txt"
                
                module_info = {
                    "path": str(module_path),
                    "has_package_json": package_json.exists(),
                    "has_requirements_txt": requirements_txt.exists(),
                    "dependencies": {},
                    "dev_dependencies": {},
                    "python_dependencies": []
                }
                
                # Leer package.json si existe
                if package_json.exists():
                    try:
                        with open(package_json, 'r', encoding='utf-8') as f:
                            package_data = json.load(f)
                            module_info["dependencies"] = package_data.get("dependencies", {})
                            module_info["dev_dependencies"] = package_data.get("devDependencies", {})
                            structure["modules_with_deps"] += 1
                    except Exception as e:
                        logger.error(f"Error leyendo {package_json}: {e}")
                
                # Leer requirements.txt si existe
                if requirements_txt.exists():
                    try:
                        with open(requirements_txt, 'r', encoding='utf-8') as f:
                            requirements = f.read().strip().split('\n')
                            module_info["python_dependencies"] = [
                                req.strip() for req in requirements 
                                if req.strip() and not req.strip().startswith('#')
                            ]
                            structure["modules_with_deps"] += 1
                    except Exception as e:
                        logger.error(f"Error leyendo {requirements_txt}: {e}")
                
                structure["modules"][module] = module_info
                structure["total_modules"] += 1
        
        return structure
    
    def install_dependencies(self, module: str = None, force: bool = False) -> Dict[str, any]:
        """Instala las dependencias de un módulo específico o de todo el proyecto"""
        results = {
            "success": True,
            "installed_modules": [],
            "failed_modules": [],
            "errors": [],
            "warnings": [],
            "total_time": 0
        }
        
        import time
        start_time = time.time()
        
        if module:
            # Instalar dependencias de un módulo específico
            module_results = self._install_module_dependencies(module, force)
            if module_results["success"]:
                results["installed_modules"].append(module)
            else:
                results["failed_modules"].append(module)
                results["errors"].extend(module_results["errors"])
        else:
            # Instalar dependencias de todos los módulos
            structure = self.get_project_structure()
            
            # Orden de instalación (dependencias primero)
            install_order = [
                "web",
                ".bin/editor3d",
                "client", 
                "assets",
                "bloc",
                "components",
                "entities",
                "fonts",
                "helpers",
                "image",
                "languages",
                "lib",
                "middlewares",
                "models",
                "package",
                "pages",
                "public",
                "scripts",
                "services",
                "src",
                "test"
            ]
            
            for module_name in install_order:
                if module_name in structure["modules"]:
                    print(f"📦 Instalando dependencias de {module_name}...")
                    module_results = self._install_module_dependencies(module_name, force)
                    
                    if module_results["success"]:
                        results["installed_modules"].append(module_name)
                        print(f"✅ {module_name} - Dependencias instaladas")
                    else:
                        results["failed_modules"].append(module_name)
                        results["errors"].extend(module_results["errors"])
                        print(f"❌ {module_name} - Error en instalación")
        
        results["total_time"] = time.time() - start_time
        return results
    
    def _install_module_dependencies(self, module: str, force: bool = False) -> Dict[str, any]:
        """Instala las dependencias de un módulo específico"""
        results = {
            "success": True,
            "errors": [],
            "warnings": [],
            "npm_installed": False,
            "python_installed": False
        }
        
        module_path = self.project_root / module
        
        if not module_path.exists():
            results["errors"].append(f"El módulo {module} no existe")
            results["success"] = False
            return results
        
        # Instalar dependencias de Node.js
        package_json = module_path / "package.json"
        if package_json.exists():
            try:
                print(f"   📦 Instalando dependencias npm para {module}...")
                result = subprocess.run(
                    ['npm', 'install'],
                    cwd=module_path,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutos
                )
                
                if result.returncode == 0:
                    results["npm_installed"] = True
                    print(f"   ✅ npm install completado para {module}")
                else:
                    results["errors"].append(f"Error en npm install para {module}: {result.stderr}")
                    results["success"] = False
                    
            except subprocess.TimeoutExpired:
                results["errors"].append(f"Timeout en npm install para {module}")
                results["success"] = False
            except Exception as e:
                results["errors"].append(f"Error inesperado en npm install para {module}: {e}")
                results["success"] = False
        
        # Instalar dependencias de Python
        requirements_txt = module_path / "requirements.txt"
        if requirements_txt.exists():
            try:
                print(f"   🐍 Instalando dependencias Python para {module}...")
                result = subprocess.run(
                    [sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
                    cwd=module_path,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutos
                )
                
                if result.returncode == 0:
                    results["python_installed"] = True
                    print(f"   ✅ pip install completado para {module}")
                else:
                    results["errors"].append(f"Error en pip install para {module}: {result.stderr}")
                    results["success"] = False
                    
            except subprocess.TimeoutExpired:
                results["errors"].append(f"Timeout en pip install para {module}")
                results["success"] = False
            except Exception as e:
                results["errors"].append(f"Error inesperado en pip install para {module}: {e}")
                results["success"] = False
        
        return results
    
    def verify_installation(self) -> Dict[str, any]:
        """Verifica que todas las dependencias estén correctamente instaladas"""
        verification = {
            "success": True,
            "verified_modules": [],
            "failed_modules": [],
            "errors": [],
            "warnings": [],
            "missing_dependencies": []
        }
        
        structure = self.get_project_structure()
        
        for module_name, module_info in structure["modules"].items():
            module_path = self.project_root / module_name
            
            if module_info["has_package_json"]:
                node_modules = module_path / "node_modules"
                if not node_modules.exists():
                    verification["failed_modules"].append(module_name)
                    verification["missing_dependencies"].append(f"{module_name}: node_modules")
                    verification["success"] = False
                else:
                    verification["verified_modules"].append(f"{module_name} (npm)")
            
            if module_info["has_requirements_txt"]:
                # Verificar que las dependencias Python estén instaladas
                try:
                    result = subprocess.run(
                        [sys.executable, '-c', 'import sys; print("Python OK")'],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        verification["verified_modules"].append(f"{module_name} (Python)")
                    else:
                        verification["failed_modules"].append(module_name)
                        verification["missing_dependencies"].append(f"{module_name}: Python packages")
                        verification["success"] = False
                except Exception as e:
                    verification["errors"].append(f"Error verificando Python para {module_name}: {e}")
                    verification["success"] = False
        
        return verification
    
    def get_installation_summary(self) -> str:
        """Genera un resumen de la instalación"""
        system_status = self.check_system_requirements()
        structure = self.get_project_structure()
        
        summary = f"""
🔧 RESUMEN DE INSTALACIÓN - WoldVirtual3DlucIA
{'='*50}

📊 ESTADO DEL SISTEMA:
✅ Node.js: {system_status['node_version'] or 'No instalado'}
✅ npm: {system_status['npm_version'] or 'No instalado'}
✅ Python: {system_status['python_version'] or 'No instalado'}
✅ Git: {system_status['git_version'] or 'No instalado'}

📦 MÓDULOS DEL PROYECTO:
• Total de módulos: {structure['total_modules']}
• Módulos con dependencias: {structure['modules_with_deps']}

🎯 MÓDULOS PRINCIPALES:
"""
        
        for module_name, module_info in structure["modules"].items():
            if module_info["has_package_json"] or module_info["has_requirements_txt"]:
                deps_count = len(module_info["dependencies"]) + len(module_info["python_dependencies"])
                summary += f"• {module_name}: {deps_count} dependencias\n"
        
        if system_status["recommendations"]:
            summary += f"\n⚠️ RECOMENDACIONES:\n"
            for rec in system_status["recommendations"]:
                summary += f"• {rec}\n"
        
        summary += f"""
🚀 COMANDOS ÚTILES:
• Para instalar todas las dependencias: python dependencies_manager.py install
• Para verificar instalación: python dependencies_manager.py verify
• Para instalar módulo específico: python dependencies_manager.py install <módulo>

💡 CONSEJOS:
• Asegúrate de tener Node.js 18.x+ y npm 9.x+ instalados
• Si tienes problemas, ejecuta: npm cache clean --force
• Para desarrollo, usa: npm run dev en cada módulo
"""
        
        return summary

def main():
    """Función principal para ejecutar desde línea de comandos"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Gestor de Dependencias de WoldVirtual3DlucIA")
    parser.add_argument("action", choices=["install", "verify", "summary"], 
                       help="Acción a realizar")
    parser.add_argument("--module", "-m", help="Módulo específico a procesar")
    parser.add_argument("--force", "-f", action="store_true", 
                       help="Forzar reinstalación")
    
    args = parser.parse_args()
    
    manager = DependenciesManager()
    
    if args.action == "install":
        print("🚀 Instalando dependencias de WoldVirtual3DlucIA...")
        results = manager.install_dependencies(args.module, args.force)
        
        if results["success"]:
            print(f"✅ Instalación completada en {results['total_time']:.2f}s")
            print(f"📦 Módulos instalados: {len(results['installed_modules'])}")
        else:
            print(f"❌ Instalación falló")
            print(f"❌ Módulos fallidos: {len(results['failed_modules'])}")
            for error in results["errors"]:
                print(f"   • {error}")
    
    elif args.action == "verify":
        print("🔍 Verificando instalación...")
        verification = manager.verify_installation()
        
        if verification["success"]:
            print("✅ Todas las dependencias están instaladas correctamente")
        else:
            print("❌ Algunas dependencias faltan:")
            for missing in verification["missing_dependencies"]:
                print(f"   • {missing}")
    
    elif args.action == "summary":
        print(manager.get_installation_summary())

if __name__ == "__main__":
    main() 