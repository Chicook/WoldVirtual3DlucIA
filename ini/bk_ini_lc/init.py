#!/usr/bin/env python3
"""
Script de Inicialización del Metaverso Crypto World Virtual 3D
Configura el proyecto desde la carpeta ini
"""

import os
import sys
import json
import configparser
from pathlib import Path
from typing import Dict, Any

class MetaversoInitializer:
    """Inicializador del proyecto Metaverso"""
    
    def __init__(self, project_root: str = ".."):
        self.project_root = Path(project_root).resolve()
        self.ini_file = Path("metaverso.ini")
        self.config = configparser.ConfigParser()
        
    def load_config(self) -> bool:
        """Cargar configuración desde metaverso.ini"""
        try:
            if self.ini_file.exists():
                self.config.read(self.ini_file)
                print(f"✅ Configuración cargada desde {self.ini_file}")
                return True
            else:
                print(f"❌ Archivo de configuración no encontrado: {self.ini_file}")
                return False
        except Exception as e:
            print(f"❌ Error cargando configuración: {e}")
            return False
    
    def validate_project_structure(self) -> bool:
        """Validar estructura del proyecto"""
        print("🔍 Validando estructura del proyecto...")
        
        required_dirs = [
            "client", "backend", "protocol", "engine", "gateway",
            "tooling", "knowledge", "verification", "artifacts"
        ]
        
        missing_dirs = []
        for dir_name in required_dirs:
            dir_path = self.project_root / dir_name
            if not dir_path.exists():
                missing_dirs.append(dir_name)
        
        if missing_dirs:
            print(f"❌ Directorios faltantes: {', '.join(missing_dirs)}")
            return False
        
        print("✅ Estructura del proyecto válida")
        return True
    
    def setup_environment(self) -> bool:
        """Configurar variables de entorno"""
        print("🔧 Configurando variables de entorno...")
        
        try:
            env_file = self.project_root / ".env"
            env_content = []
            
            # Configuración del metaverso
            if "metaverso" in self.config:
                env_content.append(f"METAVERSO_NAME={self.config['metaverso']['nombre']}")
                env_content.append(f"METAVERSO_VERSION={self.config['metaverso']['version']}")
                env_content.append(f"METAVERSO_MODE={self.config['metaverso']['modo']}")
            
            # Configuración blockchain
            if "blockchain" in self.config:
                env_content.append(f"BLOCKCHAIN_NETWORK={self.config['blockchain']['red']}")
                env_content.append(f"BLOCKCHAIN_CONTRACT={self.config['blockchain']['contrato_principal']}")
                env_content.append(f"BLOCKCHAIN_GAS_LIMIT={self.config['blockchain']['gas_limit']}")
                env_content.append(f"BLOCKCHAIN_GAS_PRICE={self.config['blockchain']['gas_price']}")
            
            # Configuración 3D
            if "3d" in self.config:
                env_content.append(f"THREEJS_ENGINE={self.config['3d']['motor']}")
                env_content.append(f"WEBGL_VERSION={self.config['3d']['webgl_version']}")
                env_content.append(f"MAX_FPS={self.config['3d']['max_fps']}")
            
            # Configuración seguridad
            if "seguridad" in self.config:
                env_content.append(f"SECURITY_STRICT_MODE={self.config['seguridad']['modo_estricto']}")
                env_content.append(f"SECURITY_VERIFY_CHECKSUMS={self.config['seguridad']['verificacion_checksums']}")
                env_content.append(f"SECURITY_WHITELIST_ONLY={self.config['seguridad']['whitelist_only']}")
            
            # Escribir archivo .env
            with open(env_file, 'w') as f:
                f.write('\n'.join(env_content))
            
            print(f"✅ Variables de entorno configuradas en {env_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error configurando variables de entorno: {e}")
            return False
    
    def setup_package_json(self) -> bool:
        """Configurar package.json principal"""
        print("📦 Configurando package.json principal...")
        
        try:
            package_file = self.project_root / "package.json"
            
            if package_file.exists():
                with open(package_file, 'r') as f:
                    package_data = json.load(f)
            else:
                package_data = {
                    "name": "metaverso-crypto-world-virtual-3d",
                    "version": "1.0.0",
                    "description": "Metaverso descentralizado con integración blockchain y 3D",
                    "private": True,
                    "workspaces": [
                        "client",
                        "backend", 
                        "protocol",
                        "engine",
                        "gateway",
                        "tooling",
                        "knowledge",
                        "verification",
                        "artifacts"
                    ],
                    "scripts": {
                        "dev": "concurrently \"npm run dev:client\" \"npm run dev:backend\"",
                        "dev:client": "cd client && npm run dev",
                        "dev:backend": "cd backend && npm run dev",
                        "build": "npm run build:all",
                        "build:all": "npm run build:client && npm run build:backend",
                        "build:client": "cd client && npm run build",
                        "build:backend": "cd backend && npm run build",
                        "test": "npm run test:all",
                        "test:all": "npm run test:client && npm run test:backend",
                        "test:client": "cd client && npm run test",
                        "test:backend": "cd backend && npm run test",
                        "lint": "npm run lint:all",
                        "lint:all": "npm run lint:client && npm run lint:backend",
                        "lint:client": "cd client && npm run lint",
                        "lint:backend": "cd backend && npm run lint",
                        "tooling:tsconfig-fix": "cd tooling && npm run tsconfig-fix",
                        "tooling:console-fix": "cd tooling && npm run console-fix"
                    },
                    "devDependencies": {
                        "concurrently": "^8.0.0",
                        "typescript": "^5.0.0",
                        "eslint": "^8.0.0",
                        "prettier": "^3.0.0"
                    },
                    "engines": {
                        "node": ">=18.0.0",
                        "npm": ">=9.0.0"
                    }
                }
            
            # Actualizar con configuración del INI
            if "metaverso" in self.config:
                package_data["name"] = self.config["metaverso"]["nombre"].lower().replace(" ", "-")
                package_data["version"] = self.config["metaverso"]["version"]
                package_data["description"] = self.config["metaverso"]["descripcion"]
            
            # Guardar package.json
            with open(package_file, 'w') as f:
                json.dump(package_data, f, indent=2)
            
            print(f"✅ package.json configurado en {package_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error configurando package.json: {e}")
            return False
    
    def setup_tsconfig_base(self) -> bool:
        """Configurar tsconfig.base.json"""
        print("⚙️ Configurando tsconfig.base.json...")
        
        try:
            tsconfig_file = self.project_root / "tsconfig.base.json"
            
            tsconfig_data = {
                "compilerOptions": {
                    "target": "ES2020",
                    "module": "ESNext",
                    "moduleResolution": "node",
                    "allowSyntheticDefaultImports": True,
                    "esModuleInterop": True,
                    "allowJs": True,
                    "skipLibCheck": True,
                    "strict": True,
                    "noImplicitAny": True,
                    "strictNullChecks": True,
                    "strictFunctionTypes": True,
                    "noImplicitReturns": True,
                    "noFallthroughCasesInSwitch": True,
                    "noUncheckedIndexedAccess": True,
                    "noImplicitOverride": True,
                    "exactOptionalPropertyTypes": True,
                    "forceConsistentCasingInFileNames": True,
                    "declaration": True,
                    "declarationMap": True,
                    "sourceMap": True,
                    "removeComments": False,
                    "noEmitOnError": True,
                    "incremental": True,
                    "resolveJsonModule": True,
                    "isolatedModules": True,
                    "verbatimModuleSyntax": True
                }
            }
            
            # Aplicar configuración de desarrollo si está disponible
            if "desarrollo" in self.config:
                dev_config = self.config["desarrollo"]
                if dev_config.get("typescript_strict", "true").lower() == "true":
                    tsconfig_data["compilerOptions"]["strict"] = True
                if dev_config.get("source_maps", "true").lower() == "true":
                    tsconfig_data["compilerOptions"]["sourceMap"] = True
            
            # Guardar tsconfig.base.json
            with open(tsconfig_file, 'w') as f:
                json.dump(tsconfig_data, f, indent=2)
            
            print(f"✅ tsconfig.base.json configurado en {tsconfig_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error configurando tsconfig.base.json: {e}")
            return False
    
    def run_initialization(self) -> bool:
        """Ejecutar proceso completo de inicialización"""
        print("🚀 Iniciando configuración del Metaverso Crypto World Virtual 3D")
        print("=" * 60)
        
        # Cargar configuración
        if not self.load_config():
            return False
        
        # Validar estructura
        if not self.validate_project_structure():
            return False
        
        # Configurar entorno
        if not self.setup_environment():
            return False
        
        # Configurar package.json
        if not self.setup_package_json():
            return False
        
        # Configurar tsconfig.base.json
        if not self.setup_tsconfig_base():
            return False
        
        print("\n" + "=" * 60)
        print("✅ Inicialización completada exitosamente!")
        print("\n📋 Próximos pasos:")
        print("1. Instalar dependencias: npm install")
        print("2. Configurar módulos individuales")
        print("3. Ejecutar en modo desarrollo: npm run dev")
        print("4. Revisar documentación en docs/")
        
        return True

def main():
    """Función principal"""
    initializer = MetaversoInitializer()
    
    try:
        success = initializer.run_initialization()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Inicialización cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la inicialización: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 