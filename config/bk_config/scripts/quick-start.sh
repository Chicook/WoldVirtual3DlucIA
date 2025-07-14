#!/bin/bash

# Script de inicio rápido para Metaverso Crypto World Virtual 3D
# Compatible con Windows (Git Bash) y Linux/macOS

set -e

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
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Detectar sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo "Sistema operativo detectado: $OS"
}

# Verificar dependencias
check_dependencies() {
    print_info "Verificando dependencias..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js versión 16+ es requerida. Versión actual: $(node -v)"
        exit 1
    fi
    
    print_message "✅ Node.js $(node -v) - OK"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_message "✅ npm $(npm -v) - OK"
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_warning "Git no está instalado. Algunas funcionalidades pueden no estar disponibles."
    else
        print_message "✅ Git $(git --version) - OK"
    fi
}

# Instalar dependencias del proyecto
install_dependencies() {
    print_info "Instalando dependencias del proyecto..."
    
    # Instalar dependencias principales
    if [ -f "package.json" ]; then
        print_message "Instalando dependencias principales..."
        npm install
    fi
    
    # Instalar dependencias del cliente
    if [ -f "client/package.json" ]; then
        print_message "Instalando dependencias del cliente..."
        cd client
        npm install
        cd ..
    fi
    
    # Instalar dependencias del backend
    if [ -f "backend/package.json" ]; then
        print_message "Instalando dependencias del backend..."
        cd backend
        npm install
        cd ..
    fi
    
    print_message "✅ Dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_environment() {
    print_info "Configurando variables de entorno..."
    
    if [ ! -f ".env" ]; then
        print_message "Creando archivo .env..."
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

# Configuración de IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/
ARWEAVE_GATEWAY=https://arweave.net

# Configuración de autenticación
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Configuración de WebSocket
WS_PORT=3001

# Configuración de almacenamiento
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=metaverso-assets

# Configuración de analytics
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token

# Configuración de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Configuración de pagos
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Configuración de redes sociales
DISCORD_WEBHOOK_URL=your-discord-webhook-url
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret

# Configuración de seguridad
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Configuración de desarrollo
DEBUG=true
LOG_LEVEL=debug
EOF
        print_message "✅ Archivo .env creado"
        print_warning "⚠️  Recuerda actualizar las variables de entorno con tus valores reales"
    else
        print_message "✅ Archivo .env ya existe"
    fi
}

# Configurar base de datos
setup_database() {
    print_info "Configurando base de datos..."
    
    # Crear directorio de datos si no existe
    mkdir -p data
    
    # Verificar si MongoDB está ejecutándose
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            print_message "✅ MongoDB ya está ejecutándose"
        else
            print_warning "MongoDB no está ejecutándose. Iniciando..."
            if [ "$OS" = "windows" ]; then
                start mongod
            else
                mongod --fork --logpath /dev/null
            fi
            sleep 2
        fi
    else
        print_warning "MongoDB no está instalado. Instala MongoDB para funcionalidad completa."
    fi
    
    # Verificar si Redis está ejecutándose
    if command -v redis-server &> /dev/null; then
        if pgrep -x "redis-server" > /dev/null; then
            print_message "✅ Redis ya está ejecutándose"
        else
            print_warning "Redis no está ejecutándose. Iniciando..."
            if [ "$OS" = "windows" ]; then
                start redis-server
            else
                redis-server --daemonize yes
            fi
            sleep 1
        fi
    else
        print_warning "Redis no está instalado. Instala Redis para funcionalidad completa."
    fi
}

# Construir el proyecto
build_project() {
    print_info "Construyendo el proyecto..."
    
    # Construir cliente
    if [ -f "client/package.json" ]; then
        print_message "Construyendo cliente..."
        cd client
        npm run build
        cd ..
    fi
    
    # Construir backend
    if [ -f "backend/package.json" ]; then
        print_message "Construyendo backend..."
        cd backend
        npm run build
        cd ..
    fi
    
    print_message "✅ Proyecto construido correctamente"
}

# Iniciar el servidor de desarrollo
start_development() {
    print_info "Iniciando servidor de desarrollo..."
    
    # Verificar si el puerto 3000 está disponible
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Puerto 3000 ya está en uso. Deteniendo proceso..."
        if [ "$OS" = "windows" ]; then
            taskkill /F /PID $(lsof -t -i:3000) 2>/dev/null || true
        else
            kill -9 $(lsof -t -i:3000) 2>/dev/null || true
        fi
        sleep 2
    fi
    
    # Iniciar servidor de desarrollo
    print_message "🚀 Iniciando Metaverso en modo desarrollo..."
    print_message "📱 Frontend: http://localhost:3000"
    print_message "🔧 Backend: http://localhost:3001"
    print_message "📊 WebSocket: ws://localhost:3001"
    
    # Usar npm run dev si existe, sino iniciar manualmente
    if [ -f "package.json" ] && grep -q '"dev"' package.json; then
        npm run dev
    else
        # Iniciar backend y frontend en paralelo
        print_message "Iniciando backend y frontend..."
        
        # Iniciar backend
        if [ -f "backend/package.json" ]; then
            cd backend
            npm run dev &
            BACKEND_PID=$!
            cd ..
        fi
        
        # Iniciar frontend
        if [ -f "client/package.json" ]; then
            cd client
            npm run dev &
            FRONTEND_PID=$!
            cd ..
        fi
        
        # Esperar a que los procesos terminen
        wait $BACKEND_PID $FRONTEND_PID
    fi
}

# Función de limpieza
cleanup() {
    print_info "Limpiando procesos..."
    
    # Detener procesos en puertos específicos
    if [ "$OS" = "windows" ]; then
        taskkill /F /PID $(lsof -t -i:3000) 2>/dev/null || true
        taskkill /F /PID $(lsof -t -i:3001) 2>/dev/null || true
    else
        kill -9 $(lsof -t -i:3000) 2>/dev/null || true
        kill -9 $(lsof -t -i:3001) 2>/dev/null || true
    fi
    
    print_message "✅ Limpieza completada"
}

# Función principal
main() {
    print_header "🌍 Metaverso Crypto World Virtual 3D - Inicio Rápido"
    print_header "=================================================="
    
    # Configurar trap para limpieza al salir
    trap cleanup EXIT
    
    # Detectar sistema operativo
    detect_os
    
    # Verificar dependencias
    check_dependencies
    
    # Instalar dependencias
    install_dependencies
    
    # Configurar entorno
    setup_environment
    
    # Configurar base de datos
    setup_database
    
    # Construir proyecto
    build_project
    
    # Iniciar desarrollo
    start_development
}

# Manejar argumentos de línea de comandos
case "${1:-}" in
    "install")
        detect_os
        check_dependencies
        install_dependencies
        setup_environment
        setup_database
        print_message "✅ Instalación completada"
        ;;
    "build")
        build_project
        ;;
    "start")
        start_development
        ;;
    "clean")
        cleanup
        ;;
    "help"|"-h"|"--help")
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  install  - Instalar dependencias y configurar entorno"
        echo "  build    - Construir el proyecto"
        echo "  start    - Iniciar servidor de desarrollo"
        echo "  clean    - Limpiar procesos"
        echo "  help     - Mostrar esta ayuda"
        echo ""
        echo "Sin argumentos: Ejecuta la instalación completa y inicia el servidor"
        ;;
    "")
        main
        ;;
    *)
        print_error "Comando desconocido: $1"
        echo "Usa '$0 help' para ver los comandos disponibles"
        exit 1
        ;;
esac 