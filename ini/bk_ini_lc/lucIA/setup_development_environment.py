#!/usr/bin/env python3
"""
🚀 SETUP AUTOMÁTICO DEL ENTORNO DE DESARROLLO
=============================================
Script de LucIA para configurar automáticamente todo el entorno
de desarrollo del Metaverso Crypto World Virtual 3D.

Uso: python lucIA/setup_development_environment.py
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import platform

class DevelopmentEnvironmentSetup:
    """Configurador automático del entorno de desarrollo"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.setup_log = []
        self.errors = []
        
    def log(self, message: str, level: str = "INFO"):
        """Registra un mensaje en el log"""
        timestamp = f"[{level}]"
        log_message = f"{timestamp} {message}"
        print(log_message)
        self.setup_log.append(log_message)
        
    def run_command(self, command: str, cwd: Optional[Path] = None) -> bool:
        """Ejecuta un comando del sistema"""
        try:
            cwd = cwd or self.project_root
            self.log(f"Ejecutando: {command}")
            
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                self.log(f"✅ Comando exitoso: {command}")
                return True
            else:
                self.log(f"❌ Error en comando: {command}")
                self.log(f"Error: {result.stderr}")
                self.errors.append(f"Error en {command}: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log(f"⏰ Timeout en comando: {command}")
            self.errors.append(f"Timeout en {command}")
            return False
        except Exception as e:
            self.log(f"❌ Excepción en comando: {command} - {e}")
            self.errors.append(f"Excepción en {command}: {e}")
            return False
    
    def create_directory_structure(self):
        """Crea la estructura de directorios del proyecto"""
        self.log("📁 Creando estructura de directorios...")
        
        directories = [
            "client/src",
            "client/public",
            "client/src/components",
            "client/src/hooks",
            "client/src/stores",
            "client/src/utils",
            "client/src/types",
            "client/src/services",
            "client/src/constants",
            "client/src/assets",
            "backend/src",
            "backend/src/api",
            "backend/src/models",
            "backend/src/services",
            "backend/src/utils",
            "backend/src/config",
            "docs",
            "docs/api",
            "docs/architecture",
            "docs/deployment",
            "config",
            "config/contracts",
            "config/environments",
            "config/networks",
            "data",
            "data/blockchain",
            "data/metaverso",
            "data/users",
            "data/system",
            "test",
            "test/unit",
            "test/integration",
            "test/e2e",
            "scripts",
            "public",
            "public/assets",
            "public/metaverse",
            "public/lucIA"
        ]
        
        for directory in directories:
            dir_path = self.project_root / directory
            dir_path.mkdir(parents=True, exist_ok=True)
            self.log(f"  ✅ Creado: {directory}")
    
    def create_package_json_files(self):
        """Crea los archivos package.json necesarios"""
        self.log("📦 Creando archivos package.json...")
        
        # Package.json principal
        main_package = {
            "name": "metaverso-crypto-world-virtual-3d",
            "version": "1.0.0",
            "description": "Metaverso Crypto World Virtual 3D - Plataforma completa de realidad virtual con blockchain",
            "main": "index.js",
            "scripts": {
                "dev": "concurrently \"npm run dev:client\" \"npm run dev:backend\"",
                "dev:client": "cd client && npm run dev",
                "dev:backend": "cd backend && npm run dev",
                "build": "npm run build:client && npm run build:backend",
                "build:client": "cd client && npm run build",
                "build:backend": "cd backend && npm run build",
                "test": "npm run test:client && npm run test:backend",
                "test:client": "cd client && npm run test",
                "test:backend": "cd backend && npm run test",
                "setup": "python lucIA/setup_development_environment.py",
                "lucia": "python lucIA/lucia_core.py"
            },
            "keywords": [
                "metaverso",
                "blockchain",
                "crypto",
                "3d",
                "virtual-reality",
                "web3",
                "nft",
                "threejs"
            ],
            "author": "Metaverso Crypto World Team",
            "license": "MIT",
            "devDependencies": {
                "concurrently": "^8.2.0"
            }
        }
        
        with open(self.project_root / "package.json", "w") as f:
            json.dump(main_package, f, indent=2)
        
        # Package.json del cliente
        client_package = {
            "name": "@metaverso/client",
            "version": "1.0.0",
            "description": "Módulo client del Metaverso Crypto World Virtual 3D",
            "main": "src/index.ts",
            "scripts": {
                "dev": "vite",
                "build": "tsc --project tsconfig.build.json && vite build",
                "test": "vitest",
                "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
            },
            "dependencies": {
                "@readyplayerme/react-avatar-creator": "^0.5.0",
                "immer": "^10.0.0",
                "process": "^0.11.10",
                "react": "^19.1.0",
                "react-dom": "^19.1.0",
                "react-hot-toast": "^2.5.2",
                "react-query": "^3.39.0",
                "react-router-dom": "^6.30.1",
                "stream-browserify": "^3.0.0",
                "tailwindcss": "^3.3.0",
                "three": "^0.178.0",
                "util": "^0.12.5",
                "zustand": "^4.4.0"
            },
            "devDependencies": {
                "@types/node": "^20.0.0",
                "@types/react": "^19.1.8",
                "@types/react-dom": "^19.1.6",
                "@types/three": "^0.177.0",
                "@headlessui/react": "^1.7.0",
                "@heroicons/react": "^2.0.0",
                "@react-three/drei": "^9.88.0",
                "@react-three/fiber": "^8.15.0",
                "@webgpu/types": "^0.1.40",
                "ethers": "^6.8.0",
                "framer-motion": "^10.16.0",
                "react-error-boundary": "^4.0.11",
                "react-icons": "^5.5.0",
                "socket.io-client": "^4.7.0",
                "@typescript-eslint/eslint-plugin": "^6.0.0",
                "@typescript-eslint/parser": "^6.0.0",
                "eslint": "^8.45.0",
                "typescript": "^5.0.0",
                "vite": "^6.3.5",
                "@vitejs/plugin-react": "^4.4.1"
            },
            "keywords": [
                "metaverso",
                "web3",
                "blockchain",
                "3d"
            ],
            "author": "Metaverso Crypto World Team",
            "license": "MIT"
        }
        
        with open(self.project_root / "client" / "package.json", "w") as f:
            json.dump(client_package, f, indent=2)
        
        # Package.json del backend
        backend_package = {
            "name": "@metaverso/backend",
            "version": "1.0.0",
            "description": "Módulo backend del Metaverso Crypto World Virtual 3D",
            "main": "src/index.ts",
            "scripts": {
                "dev": "tsx watch src/index.ts",
                "build": "tsc",
                "start": "node dist/index.js",
                "test": "jest"
            },
            "dependencies": {
                "express": "^4.18.2",
                "cors": "^2.8.5",
                "helmet": "^7.0.0",
                "morgan": "^1.10.0",
                "dotenv": "^16.3.1",
                "socket.io": "^4.7.2",
                "mongoose": "^7.5.0",
                "jsonwebtoken": "^9.0.2",
                "bcryptjs": "^2.4.3",
                "ethers": "^6.8.0",
                "web3": "^4.0.3",
                "three": "^0.178.0",
                "uuid": "^9.0.0",
                "zod": "^3.22.2"
            },
            "devDependencies": {
                "@types/express": "^4.17.17",
                "@types/cors": "^2.8.13",
                "@types/morgan": "^1.9.4",
                "@types/node": "^20.5.0",
                "@types/jsonwebtoken": "^9.0.2",
                "@types/bcryptjs": "^2.4.2",
                "@types/uuid": "^9.0.2",
                "typescript": "^5.1.6",
                "tsx": "^3.12.7",
                "jest": "^29.6.2",
                "@types/jest": "^29.5.4",
                "ts-jest": "^29.1.1"
            },
            "keywords": [
                "metaverso",
                "backend",
                "api",
                "blockchain"
            ],
            "author": "Metaverso Crypto World Team",
            "license": "MIT"
        }
        
        with open(self.project_root / "backend" / "package.json", "w") as f:
            json.dump(backend_package, f, indent=2)
    
    def create_configuration_files(self):
        """Crea archivos de configuración esenciales"""
        self.log("⚙️ Creando archivos de configuración...")
        
        # Docker Compose
        docker_compose = {
            "version": "3.8",
            "services": {
                "client": {
                    "build": "./client",
                    "ports": ["3000:3000"],
                    "volumes": ["./client:/app", "/app/node_modules"],
                    "environment": ["NODE_ENV=development"],
                    "depends_on": ["backend"]
                },
                "backend": {
                    "build": "./backend",
                    "ports": ["8000:8000"],
                    "volumes": ["./backend:/app", "/app/node_modules"],
                    "environment": ["NODE_ENV=development"],
                    "depends_on": ["mongodb", "redis"]
                },
                "mongodb": {
                    "image": "mongo:6.0",
                    "ports": ["27017:27017"],
                    "volumes": ["mongodb_data:/data/db"],
                    "environment": ["MONGO_INITDB_ROOT_USERNAME=admin", "MONGO_INITDB_ROOT_PASSWORD=password"]
                },
                "redis": {
                    "image": "redis:7-alpine",
                    "ports": ["6379:6379"],
                    "volumes": ["redis_data:/data"]
                }
            },
            "volumes": {
                "mongodb_data": {},
                "redis_data": {}
            }
        }
        
        with open(self.project_root / "docker-compose.yml", "w") as f:
            json.dump(docker_compose, f, indent=2)
        
        # .env.example
        env_example = """# ===========================================
# METAVERSO CRYPTO WORLD VIRTUAL 3D - VARIABLES DE ENTORNO
# ===========================================

# ===========================================
# CONFIGURACIÓN GENERAL
# ===========================================
NODE_ENV=development
PORT=8000
CLIENT_PORT=3000

# ===========================================
# BASE DE DATOS
# ===========================================
MONGODB_URI=mongodb://admin:password@localhost:27017/metaverso?authSource=admin
REDIS_URL=redis://localhost:6379

# ===========================================
# JWT Y AUTENTICACIÓN
# ===========================================
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=tu_refresh_token_secret_aqui

# ===========================================
# BLOCKCHAIN Y WEB3
# ===========================================
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/tu_proyecto_id
POLYGON_RPC_URL=https://polygon-rpc.com
CHAIN_ID=1
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# ===========================================
# APIs EXTERNAS
# ===========================================
# Google Gemini API
GEMINI_API_KEY=tu_gemini_api_key_aqui

# OpenAI API (opcional)
OPENAI_API_KEY=tu_openai_api_key_aqui

# Anthropic API (opcional)
ANTHROPIC_API_KEY=tu_anthropic_api_key_aqui

# HuggingFace API (opcional)
HUGGINGFACE_API_KEY=tu_huggingface_api_key_aqui

# ===========================================
# LUCIA IA
# ===========================================
LUCIA_PERSONALITY=metaverso
LUCIA_ENABLE_MEMORY=true
LUCIA_ENABLE_PARAPHRASING=true

# ===========================================
# METAVERSO
# ===========================================
METAVERSE_NAME=Crypto World Virtual 3D
METAVERSE_DESCRIPTION=Plataforma de metaverso con integración blockchain
METAVERSE_VERSION=1.0.0

# ===========================================
# REDES SOCIALES Y COMUNICACIÓN
# ===========================================
DISCORD_WEBHOOK_URL=tu_discord_webhook_url_aqui
TELEGRAM_BOT_TOKEN=tu_telegram_bot_token_aqui

# ===========================================
# MONITOREO Y LOGS
# ===========================================
LOG_LEVEL=info
SENTRY_DSN=tu_sentry_dsn_aqui

# ===========================================
# DESARROLLO
# ===========================================
DEBUG=true
HOT_RELOAD=true
"""
        
        with open(self.project_root / ".env.example", "w") as f:
            f.write(env_example)
    
    def create_readme_files(self):
        """Crea archivos README para cada módulo"""
        self.log("📖 Creando archivos README...")
        
        # README principal
        main_readme = """# 🌐 Metaverso Crypto World Virtual 3D

## 🚀 Descripción

Metaverso Crypto World Virtual 3D es una plataforma completa de realidad virtual que integra blockchain, NFTs, criptomonedas y tecnologías 3D avanzadas para crear una experiencia inmersiva única.

## 🎯 Características Principales

- **🌍 Mundo Virtual 3D**: Experiencias inmersivas con Three.js
- **₿ Integración Blockchain**: Smart contracts y transacciones cripto
- **🖼️ Sistema NFT**: Creación y gestión de activos digitales únicos
- **👤 Avatares Personalizables**: Sistema completo de personalización
- **🤖 IA LucIA**: Asistente inteligente para el metaverso
- **🔗 Web3**: Conectividad completa con la blockchain
- **🎮 Gaming**: Elementos de juego integrados
- **💬 Social**: Interacción entre usuarios en tiempo real

## 🏗️ Arquitectura

```
Metaverso Crypto World Virtual 3D/
├── client/                 # Frontend React + Three.js
├── backend/                # API Node.js + Express
├── lucIA/                  # IA inteligente del metaverso
├── config/                 # Configuraciones del sistema
├── docs/                   # Documentación
├── test/                   # Pruebas automatizadas
└── scripts/                # Scripts de utilidad
```

## 🚀 Inicio Rápido

### 1. Configuración Automática
```bash
# Configurar todo el entorno automáticamente
python lucIA/setup_development_environment.py
```

### 2. Instalación Manual (si es necesario)
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar desarrollo
npm run dev
```

### 3. Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **LucIA**: Ejecutar `python lucIA/lucia_core.py`

## 🛠️ Tecnologías

### Frontend
- **React 19** - Framework de UI
- **Three.js** - Gráficos 3D
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Zustand** - Estado global

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Redis** - Cache
- **Socket.io** - Tiempo real
- **Ethers.js** - Blockchain

### IA LucIA
- **Python** - Lenguaje principal
- **Google Gemini** - Modelo de IA
- **SQLite** - Base de datos local
- **Three.js** - Generación 3D

### Blockchain
- **Ethereum** - Red principal
- **Polygon** - Red secundaria
- **Solidity** - Smart contracts
- **Web3.js** - Interacción

## 📚 Documentación

- [Guía de Desarrollo](docs/development.md)
- [API Reference](docs/api/README.md)
- [Arquitectura](docs/architecture/README.md)
- [Deployment](docs/deployment/README.md)
- [LucIA IA](lucIA/README.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Discord**: [Servidor de la comunidad](https://discord.gg/metaverso)
- **Telegram**: [Canal oficial](https://t.me/metaversocryptoworld)
- **Email**: support@metaversocryptoworld.com

## 🌟 Agradecimientos

- Comunidad de desarrolladores Web3
- Contribuidores de Three.js
- Equipo de Google Gemini
- Todos los usuarios beta

---

**¡Bienvenido al futuro del metaverso! 🚀**
"""
        
        with open(self.project_root / "README.md", "w", encoding="utf-8") as f:
            f.write(main_readme)
        
        # README del cliente
        client_readme = """# 🎮 Cliente - Metaverso Crypto World Virtual 3D

## Descripción

Módulo frontend del metaverso construido con React, Three.js y tecnologías Web3.

## Características

- 🌍 Mundo 3D inmersivo
- 👤 Sistema de avatares
- ₿ Integración blockchain
- 🎮 Elementos de juego
- 💬 Chat en tiempo real

## Desarrollo

```bash
cd client
npm install
npm run dev
```

## Tecnologías

- React 19
- Three.js
- TypeScript
- Vite
- Tailwind CSS
"""
        
        with open(self.project_root / "client" / "README.md", "w", encoding="utf-8") as f:
            f.write(client_readme)
        
        # README del backend
        backend_readme = """# 🔧 Backend - Metaverso Crypto World Virtual 3D

## Descripción

API backend del metaverso con soporte para blockchain, tiempo real y IA.

## Características

- 🔌 API RESTful
- ⚡ WebSocket en tiempo real
- ₿ Integración blockchain
- 🤖 IA LucIA
- 🔐 Autenticación JWT

## Desarrollo

```bash
cd backend
npm install
npm run dev
```

## Tecnologías

- Node.js
- Express
- MongoDB
- Redis
- Socket.io
"""
        
        with open(self.project_root / "backend" / "README.md", "w", encoding="utf-8") as f:
            f.write(backend_readme)
    
    def install_dependencies(self):
        """Instala las dependencias del proyecto"""
        self.log("📦 Instalando dependencias...")
        
        # Instalar dependencias principales
        if not self.run_command("npm install --legacy-peer-deps"):
            self.log("⚠️ Error instalando dependencias principales")
            return False
        
        # Instalar dependencias del cliente
        if not self.run_command("npm install --legacy-peer-deps", self.project_root / "client"):
            self.log("⚠️ Error instalando dependencias del cliente")
            return False
        
        # Instalar dependencias del backend
        if not self.run_command("npm install", self.project_root / "backend"):
            self.log("⚠️ Error instalando dependencias del backend")
            return False
        
        return True
    
    def setup_lucia(self):
        """Configura LucIA IA"""
        self.log("🤖 Configurando LucIA IA...")
        
        # Instalar dependencias de Python
        if not self.run_command("pip install -r lucIA/requirements.txt"):
            self.log("⚠️ Error instalando dependencias de Python")
            return False
        
        # Crear archivo .env para LucIA
        lucia_env = """# ===========================================
# LUCIA IA - CONFIGURACIÓN
# ===========================================

# API Keys
GEMINI_API_KEY=tu_gemini_api_key_aqui
OPENAI_API_KEY=tu_openai_api_key_aqui
ANTHROPIC_API_KEY=tu_anthropic_api_key_aqui
HUGGINGFACE_API_KEY=tu_huggingface_api_key_aqui

# Configuración de LucIA
LUCIA_PERSONALITY=metaverso
LUCIA_ENABLE_MEMORY=true
LUCIA_ENABLE_PARAPHRASING=true

# Configuración de memoria
LUCIA_MAX_MEMORY_ENTRIES=10000
LUCIA_MEMORY_CLEANUP_DAYS=30

# Configuración de APIs
LUCIA_API_TIMEOUT=30
LUCIA_MAX_RETRIES=3
"""
        
        with open(self.project_root / "lucIA" / ".env.example", "w") as f:
            f.write(lucia_env)
        
        return True
    
    def create_quick_start_script(self):
        """Crea script de inicio rápido"""
        self.log("⚡ Creando script de inicio rápido...")
        
        if platform.system() == "Windows":
            script_content = """@echo off
echo 🌐 Iniciando Metaverso Crypto World Virtual 3D...
echo.

echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install --legacy-peer-deps
)

echo 🔧 Configurando entorno...
if not exist ".env" (
    copy ".env.example" ".env"
    echo ⚠️  Por favor, edita el archivo .env con tus configuraciones
)

echo 🚀 Iniciando servidores...
start "Cliente" cmd /k "cd client && npm run dev"
start "Backend" cmd /k "cd backend && npm run dev"
start "LucIA" cmd /k "python lucIA/lucia_core.py"

echo.
echo ✅ Metaverso iniciado correctamente!
echo 🌍 Cliente: http://localhost:3000
echo 🔧 Backend: http://localhost:8000
echo 🤖 LucIA: Ejecutándose en consola separada
echo.
pause
"""
            script_file = "start_metaverso.bat"
        else:
            script_content = """#!/bin/bash
echo "🌐 Iniciando Metaverso Crypto World Virtual 3D..."
echo

echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install --legacy-peer-deps
fi

echo "🔧 Configurando entorno..."
if [ ! -f ".env" ]; then
    cp ".env.example" ".env"
    echo "⚠️  Por favor, edita el archivo .env con tus configuraciones"
fi

echo "🚀 Iniciando servidores..."
gnome-terminal --title="Cliente" -- bash -c "cd client && npm run dev; exec bash" &
gnome-terminal --title="Backend" -- bash -c "cd backend && npm run dev; exec bash" &
gnome-terminal --title="LucIA" -- bash -c "python lucIA/lucia_core.py; exec bash" &

echo
echo "✅ Metaverso iniciado correctamente!"
echo "🌍 Cliente: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "🤖 LucIA: Ejecutándose en consola separada"
echo
"""
            script_file = "start_metaverso.sh"
            # Hacer ejecutable el script
            os.chmod(self.project_root / script_file, 0o755)
        
        with open(self.project_root / script_file, "w") as f:
            f.write(script_content)
    
    def run_setup(self):
        """Ejecuta todo el proceso de configuración"""
        self.log("🚀 INICIANDO CONFIGURACIÓN AUTOMÁTICA DEL METAVERSO")
        self.log("=" * 60)
        
        try:
            # 1. Crear estructura de directorios
            self.create_directory_structure()
            
            # 2. Crear archivos package.json
            self.create_package_json_files()
            
            # 3. Crear archivos de configuración
            self.create_configuration_files()
            
            # 4. Crear archivos README
            self.create_readme_files()
            
            # 5. Instalar dependencias
            if not self.install_dependencies():
                self.log("⚠️ Algunas dependencias no se pudieron instalar")
            
            # 6. Configurar LucIA
            if not self.setup_lucia():
                self.log("⚠️ Error configurando LucIA")
            
            # 7. Crear script de inicio rápido
            self.create_quick_start_script()
            
            # Resumen final
            self.log("=" * 60)
            self.log("✅ CONFIGURACIÓN COMPLETADA")
            self.log("=" * 60)
            
            if self.errors:
                self.log(f"⚠️ Se encontraron {len(self.errors)} errores:")
                for error in self.errors:
                    self.log(f"  - {error}")
            
            self.log("🎯 PRÓXIMOS PASOS:")
            self.log("1. Edita el archivo .env con tus configuraciones")
            self.log("2. Ejecuta: npm run dev")
            self.log("3. O usa el script de inicio rápido")
            
            if platform.system() == "Windows":
                self.log("   Windows: start_metaverso.bat")
            else:
                self.log("   Linux/Mac: ./start_metaverso.sh")
            
            self.log("")
            self.log("🌍 ¡Bienvenido al Metaverso Crypto World Virtual 3D!")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error crítico en la configuración: {e}")
            return False

def main():
    """Función principal"""
    setup = DevelopmentEnvironmentSetup()
    success = setup.run_setup()
    
    if success:
        print("\n🎉 ¡Configuración completada exitosamente!")
        print("🚀 Tu entorno de desarrollo está listo para el metaverso!")
    else:
        print("\n❌ La configuración encontró algunos problemas.")
        print("🔧 Revisa los logs anteriores para más detalles.")

if __name__ == "__main__":
    main() 