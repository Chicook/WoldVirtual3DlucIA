#!/bin/bash

# 🚀 Script de Inicio Rápido - Sistema de Build WoldVirtual3D
# Este script configura y ejecuta el sistema de build rápidamente

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 INICIO RÁPIDO - SISTEMA DE BUILD WOLDVIRTUAL3D${NC}"
echo "=================================================="
echo ""

# Función para mostrar progreso
show_progress() {
    echo -e "${YELLOW}$1${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar Node.js
show_progress "1️⃣ Verificando Node.js..."
if ! command -v node &> /dev/null; then
    show_error "Node.js no está instalado. Por favor instala Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    show_error "Node.js versión 16+ requerida. Versión actual: $(node -v)"
    exit 1
fi

show_success "Node.js $(node -v) detectado"

# 2. Verificar npm
show_progress "2️⃣ Verificando npm..."
if ! command -v npm &> /dev/null; then
    show_error "npm no está instalado"
    exit 1
fi

show_success "npm $(npm -v) detectado"

# 3. Instalar dependencias
show_progress "3️⃣ Instalando dependencias..."
if [ ! -d "node_modules" ]; then
    npm install
    show_success "Dependencias instaladas"
else
    show_success "Dependencias ya instaladas"
fi

# 4. Compilar TypeScript
show_progress "4️⃣ Compilando TypeScript..."
npm run build:system
show_success "TypeScript compilado"

# 5. Verificar instalación
show_progress "5️⃣ Verificando instalación..."
if [ -f "dist/index.js" ]; then
    show_success "Sistema de build compilado correctamente"
else
    show_error "Error en la compilación"
    exit 1
fi

# 6. Mostrar información del sistema
show_progress "6️⃣ Información del sistema..."
node dist/index.js info

# 7. Mostrar progreso inicial
show_progress "7️⃣ Progreso inicial del proyecto..."
node dist/index.js progress

echo ""
echo -e "${BLUE}🎉 ¡Sistema de Build WoldVirtual3D configurado exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos disponibles:${NC}"
echo "  npm run progress    - Mostrar progreso del proyecto"
echo "  npm run analyze     - Analizar estado del proyecto"
echo "  npm run build       - Construir módulos"
echo "  npm run clean       - Limpiar archivos de build"
echo "  npm run info        - Mostrar información del sistema"
echo ""
echo -e "${YELLOW}🚀 Comandos CLI:${NC}"
echo "  node dist/index.js progress    - Mostrar progreso"
echo "  node dist/index.js analyze     - Analizar proyecto"
echo "  node dist/index.js build       - Construir módulos"
echo "  node dist/index.js clean       - Limpiar build"
echo "  node dist/index.js info        - Información del sistema"
echo ""
echo -e "${YELLOW}📚 Documentación:${NC}"
echo "  README.md           - Documentación completa"
echo "  scripts/demo-build.js - Script de demostración"
echo ""
echo -e "${GREEN}¡Listo para usar el sistema de build!${NC}" 