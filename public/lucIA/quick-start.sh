#!/bin/bash

# 🌍 Metaverso Crypto World Virtual 3D - Inicio Rápido
# ============================================================================

# Colores para la consola
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🌍 $1${NC}"
}

print_step() {
    echo -e "${CYAN}📋 $1${NC}"
}

# Banner del metaverso
print_banner() {
    clear
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║  🌍 Metaverso Crypto World Virtual 3D - Inicio Rápido 🌍    ║"
    echo "║                                                              ║"
    echo "║  Un metaverso descentralizado y modular                      ║"
    echo "║  construido con tecnologías web3 y Threejs 3D                ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar dependencias del sistema
check_dependencies() {
    print_step "Verificando dependencias del sistema..."
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        if [[ $(echo "$NODE_VERSION 18.0.0" | tr " " "\n" | sort -V | head -n 1) == "18.0.0" ]]; then
            print_message "Node.js $NODE_VERSION ✓"
        else
            print_error "Node.js $NODE_VERSION - Se requiere versión 18.0.0 o superior"
            exit 1
        fi
    else
        print_error "Node.js no está instalado"
        print_info "Descarga Node.js desde: https://nodejs.org/"
        exit 1
    fi
    
    # Verificar npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_message "npm $NPM_VERSION ✓"
    else
        print_error "npm no está instalado"
        exit 1
    fi
    
    # Verificar Git
    if command -v git &> /dev/null; then
        print_message "Git ✓"
    else
        print_warning "Git no está instalado (recomendado para desarrollo)"
    fi
    
    # Verificar Docker (opcional)
    if command -v docker &> /dev/null; then
        print_message "Docker ✓"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker no está instalado (opcional para despliegue)"
        DOCKER_AVAILABLE=false
    fi
}

# Instalar dependencias
install_dependencies() {
    print_step "Instalando dependencias del proyecto..."
    
    if [ -f "package.json" ]; then
        print_info "Instalando dependencias principales..."
        npm install
        
        if [ -d "client" ]; then
            print_info "Instalando dependencias del frontend..."
            cd client && npm install && cd ..
        fi
        
        if [ -d "backend" ]; then
            print_info "Instalando dependencias del backend..."
            cd backend && npm install && cd ..
        fi
        
        print_message "Dependencias instaladas correctamente"
    else
        print_error "No se encontró package.json"
        exit 1
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_step "Configurando variables de entorno..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_message "Archivo .env creado desde .env.example"
        else
            # Crear archivo .env básico
            cat > .env << EOF
# Configuración del Metaverso Crypto World Virtual 3D
# ============================================================================

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
MONGODB_URI=mongodb://localhost:27017/metaverso
REDIS_URL=redis://localhost:6379

# Configuración de blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Configuración de autenticación
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Configuración de WebSocket
WS_PORT=3001

# Configuración de almacenamiento
IPFS_GATEWAY=https://ipfs.io/ipfs/
ARWEAVE_GATEWAY=https://arweave.net

# Configuración de desarrollo
DEBUG=true
LOG_LEVEL=debug
EOF
            print_message "Archivo .env creado con configuración básica"
        fi
        print_warning "Recuerda actualizar las variables de entorno con tus valores reales"
    else
        print_info "Archivo .env ya existe"
    fi
}

# Iniciar servicios con Docker (si está disponible)
start_docker_services() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_step "Iniciando servicios con Docker..."
        
        if [ -f "docker-compose.yml" ]; then
            print_info "Iniciando MongoDB, Redis y otros servicios..."
            docker-compose up -d mongodb redis ganache mailhog
            
            # Esperar a que los servicios estén listos
            print_info "Esperando a que los servicios estén listos..."
            sleep 10
            
            print_message "Servicios Docker iniciados correctamente"
        else
            print_warning "No se encontró docker-compose.yml"
        fi
    else
        print_warning "Docker no está disponible - usando configuración local"
        print_info "Asegúrate de tener MongoDB y Redis ejecutándose localmente"
    fi
}

# Iniciar el servidor de desarrollo
start_development_server() {
    print_step "Iniciando servidor de desarrollo..."
    
    if [ -f "package.json" ]; then
        print_info "Iniciando metaverso en modo desarrollo..."
        print_info "Frontend: http://localhost:3000"
        print_info "Backend: http://localhost:3001"
        print_info "Grafana: http://localhost:3002"
        print_info "Prometheus: http://localhost:9090"
        print_info "MailHog: http://localhost:8025"
        echo ""
        print_info "Presiona Ctrl+C para detener el servidor"
        echo ""
        
        npm run dev
    else
        print_error "No se encontró package.json"
        exit 1
    fi
}

# Función principal
main() {
    print_banner
    
    print_header "Iniciando configuración del Metaverso..."
    echo ""
    
    # Verificar dependencias
    check_dependencies
    echo ""
    
    # Instalar dependencias
    install_dependencies
    echo ""
    
    # Configurar entorno
    setup_environment
    echo ""
    
    # Iniciar servicios Docker
    start_docker_services
    echo ""
    
    # Mostrar información final
    print_header "¡Configuración completada!"
    echo ""
    print_message "El metaverso está listo para usar"
    echo ""
    print_info "Próximos pasos:"
    echo "  1. Actualiza las variables de entorno en .env"
    echo "  2. Ejecuta: npm run dev"
    echo "  3. Abre http://localhost:3000 en tu navegador"
    echo ""
    print_info "Comandos útiles:"
    echo "  npm run dev          - Iniciar desarrollo"
    echo "  npm run build        - Construir para producción"
    echo "  npm run test         - Ejecutar tests"
    echo "  npm run lint         - Verificar código"
    echo "  docker-compose up    - Iniciar todos los servicios"
    echo ""
    
    # Preguntar si quiere iniciar el servidor
    read -p "¿Quieres iniciar el servidor de desarrollo ahora? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_development_server
    else
        print_info "Para iniciar más tarde, ejecuta: npm run dev"
        echo ""
        print_header "¡Bienvenido al Metaverso! 🌍✨"
    fi
}

# Manejar interrupciones
trap 'print_error "Proceso interrumpido"; exit 1' INT TERM

# Ejecutar función principal
main "$@" 