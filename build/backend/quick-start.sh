#!/bin/bash

# WoldVirtual Build Backend - Quick Start Script
# Este script configura e inicia el backend rápidamente

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  WoldVirtual Build Backend${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar requisitos
check_requirements() {
    print_message "Verificando requisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18+ es requerido. Versión actual: $(node -v)"
        exit 1
    fi
    
    print_message "Node.js $(node -v) ✓"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_message "npm $(npm -v) ✓"
    
    # Verificar Docker (opcional)
    if command -v docker &> /dev/null; then
        print_message "Docker $(docker --version) ✓"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker no está instalado. Se usará instalación local"
        DOCKER_AVAILABLE=false
    fi
    
    # Verificar Docker Compose (opcional)
    if command -v docker-compose &> /dev/null; then
        print_message "Docker Compose $(docker-compose --version) ✓"
        DOCKER_COMPOSE_AVAILABLE=true
    else
        print_warning "Docker Compose no está instalado"
        DOCKER_COMPOSE_AVAILABLE=false
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_message "Configurando variables de entorno..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_message "Archivo .env creado desde .env.example"
        else
            print_error "Archivo .env.example no encontrado"
            exit 1
        fi
    else
        print_message "Archivo .env ya existe"
    fi
    
    # Generar JWT secret si no existe
    if ! grep -q "JWT_SECRET=" .env || grep -q "your-super-secret-jwt-key" .env; then
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        print_message "JWT_SECRET generado automáticamente"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_message "Instalando dependencias..."
    
    if [ ! -d node_modules ]; then
        npm install
        print_message "Dependencias instaladas ✓"
    else
        print_message "Dependencias ya instaladas ✓"
    fi
}

# Configurar base de datos
setup_database() {
    print_message "Configurando base de datos..."
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        print_message "Usando Docker para base de datos..."
        
        # Iniciar solo PostgreSQL y Redis
        docker-compose up -d postgres redis
        
        # Esperar a que PostgreSQL esté listo
        print_message "Esperando a que PostgreSQL esté listo..."
        sleep 10
        
        # Ejecutar migraciones
        docker-compose exec -T postgres psql -U postgres -d woldvirtual_build -c "SELECT 1;" > /dev/null 2>&1 || {
            print_error "No se pudo conectar a PostgreSQL"
            exit 1
        }
        
        print_message "PostgreSQL y Redis iniciados ✓"
    else
        print_warning "Docker no disponible. Asegúrate de tener PostgreSQL y Redis ejecutándose localmente"
        print_message "Comandos para iniciar servicios localmente:"
        echo "  PostgreSQL: brew services start postgresql (macOS) o sudo systemctl start postgresql (Linux)"
        echo "  Redis: brew services start redis (macOS) o sudo systemctl start redis (Linux)"
    fi
}

# Ejecutar migraciones
run_migrations() {
    print_message "Ejecutando migraciones de base de datos..."
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        docker-compose exec -T backend npx prisma migrate deploy || {
            print_error "Error ejecutando migraciones"
            exit 1
        }
    else
        npx prisma migrate deploy || {
            print_error "Error ejecutando migraciones"
            exit 1
        }
    fi
    
    print_message "Migraciones ejecutadas ✓"
}

# Generar cliente Prisma
generate_prisma() {
    print_message "Generando cliente Prisma..."
    
    npx prisma generate
    print_message "Cliente Prisma generado ✓"
}

# Sembrar datos iniciales
seed_database() {
    print_message "Sembrando datos iniciales..."
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        docker-compose exec -T backend npm run db:seed || {
            print_warning "Error sembrando datos (puede ser normal si ya existen)"
        }
    else
        npm run db:seed || {
            print_warning "Error sembrando datos (puede ser normal si ya existen)"
        }
    fi
    
    print_message "Datos sembrados ✓"
}

# Construir proyecto
build_project() {
    print_message "Construyendo proyecto..."
    
    npm run build
    print_message "Proyecto construido ✓"
}

# Iniciar servicios
start_services() {
    print_message "Iniciando servicios..."
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        print_message "Iniciando con Docker Compose..."
        docker-compose up -d
        
        print_message "Servicios iniciados ✓"
        print_message "Backend: http://localhost:3001"
        print_message "Grafana: http://localhost:3000"
        print_message "Prometheus: http://localhost:9090"
        print_message "Adminer: http://localhost:8080"
        print_message "Redis Commander: http://localhost:8081"
    else
        print_message "Iniciando en modo desarrollo..."
        npm run dev
    fi
}

# Verificar salud del sistema
health_check() {
    print_message "Verificando salud del sistema..."
    
    sleep 5
    
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_message "Backend saludable ✓"
    else
        print_error "Backend no responde"
        exit 1
    fi
}

# Mostrar información final
show_final_info() {
    echo ""
    print_header
    print_message "¡Backend iniciado exitosamente!"
    echo ""
    print_message "Endpoints disponibles:"
    echo "  - Health Check: http://localhost:3001/health"
    echo "  - API Docs: http://localhost:3001/api/v1/docs"
    echo "  - Metrics: http://localhost:3001/api/v1/system/metrics"
    echo ""
    print_message "Comandos útiles:"
    echo "  - Ver logs: docker-compose logs -f backend"
    echo "  - Detener: docker-compose down"
    echo "  - Reiniciar: docker-compose restart backend"
    echo ""
    print_message "Para desarrollo:"
    echo "  - npm run dev (modo desarrollo)"
    echo "  - npm run test (ejecutar tests)"
    echo "  - npm run lint (verificar código)"
    echo ""
}

# Función principal
main() {
    print_header
    
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    run_migrations
    generate_prisma
    seed_database
    build_project
    start_services
    health_check
    show_final_info
}

# Manejar interrupciones
trap 'print_error "Script interrumpido"; exit 1' INT TERM

# Ejecutar función principal
main "$@" 