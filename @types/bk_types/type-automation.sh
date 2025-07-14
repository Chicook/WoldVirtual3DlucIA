#!/bin/bash

# 🔧 Type Automation Script - Automatización de Tipos TypeScript
# ==============================================================
#
# Responsabilidades:
# - Orquestación de herramientas de tipos
# - Automatización de generación y validación
# - Gestión de archivos y directorios
# - Integración de herramientas multi-lenguaje
# - Monitoreo y reportes de tipos
# - Backup y versionado de tipos
#
# Fortalezas de Bash aprovechadas:
# - Orquestación de procesos
# - Manipulación de archivos y directorios
# - Integración de herramientas externas
# - Scripting de automatización
# - Gestión de permisos y ejecución

set -euo pipefail  # Modo estricto: errores, variables no definidas, pipes

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TYPES_DIR="$SCRIPT_DIR"
CONFIG_FILE="$TYPES_DIR/types-config.json"
LOG_FILE="$TYPES_DIR/type-automation.log"
BACKUP_DIR="$TYPES_DIR/backups"
TEMP_DIR="$TYPES_DIR/temp"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

# Función de limpieza al salir
cleanup() {
    log_info "Limpiando archivos temporales..."
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

# Verificación de dependencias
check_dependencies() {
    log_step "Verificando dependencias..."
    
    local missing_deps=()
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # Verificar TypeScript
    if ! command -v tsc &> /dev/null; then
        missing_deps+=("typescript")
    fi
    
    # Verificar jq para procesar JSON
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Dependencias faltantes: ${missing_deps[*]}"
        log_info "Instale las dependencias faltantes y vuelva a intentar"
        exit 1
    fi
    
    log_success "Todas las dependencias están disponibles"
}

# Crear directorios necesarios
setup_directories() {
    log_step "Configurando directorios..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP_DIR"
    mkdir -p "$TYPES_DIR/core"
    mkdir -p "$TYPES_DIR/metaverso"
    mkdir -p "$TYPES_DIR/blockchain"
    mkdir -p "$TYPES_DIR/ui"
    mkdir -p "$TYPES_DIR/api"
    mkdir -p "$TYPES_DIR/assets"
    mkdir -p "$TYPES_DIR/audio"
    mkdir -p "$TYPES_DIR/analytics"
    mkdir -p "$TYPES_DIR/utilities"
    
    log_success "Directorios configurados"
}

# Backup de tipos existentes
create_backup() {
    log_step "Creando backup de tipos existentes..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_path="$BACKUP_DIR/types_backup_$timestamp"
    
    if [ -d "$TYPES_DIR" ] && [ "$(ls -A "$TYPES_DIR" 2>/dev/null)" ]; then
        mkdir -p "$backup_path"
        cp -r "$TYPES_DIR"/*.d.ts "$backup_path/" 2>/dev/null || true
        cp -r "$TYPES_DIR"/*.ts "$backup_path/" 2>/dev/null || true
        
        log_success "Backup creado en: $backup_path"
    else
        log_warning "No hay tipos existentes para hacer backup"
    fi
}

# Generar tipos usando Python
generate_types() {
    log_step "Generando tipos con Python..."
    
    if [ -f "$TYPES_DIR/TypeGenerator.py" ]; then
        cd "$TYPES_DIR"
        python3 TypeGenerator.py
        
        if [ $? -eq 0 ]; then
            log_success "Tipos generados exitosamente"
        else
            log_error "Error durante la generación de tipos"
            return 1
        fi
    else
        log_warning "TypeGenerator.py no encontrado, saltando generación"
    fi
}

# Validar tipos usando JavaScript
validate_types() {
    log_step "Validando tipos con JavaScript..."
    
    if [ -f "$TYPES_DIR/TypeValidator.js" ]; then
        cd "$TYPES_DIR"
        node TypeValidator.js
        
        if [ $? -eq 0 ]; then
            log_success "Validación completada"
        else
            log_warning "Advertencias durante la validación"
        fi
    else
        log_warning "TypeValidator.js no encontrado, saltando validación"
    fi
}

# Compilar tipos TypeScript
compile_types() {
    log_step "Compilando tipos TypeScript..."
    
    # Crear tsconfig temporal para compilación
    cat > "$TEMP_DIR/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "$TEMP_DIR/dist",
    "rootDir": "$TYPES_DIR",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "$TYPES_DIR/**/*.ts",
    "$TYPES_DIR/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
EOF
    
    cd "$TEMP_DIR"
    tsc --project tsconfig.json
    
    if [ $? -eq 0 ]; then
        log_success "Compilación TypeScript exitosa"
        
        # Copiar archivos compilados
        if [ -d "$TEMP_DIR/dist" ]; then
            cp -r "$TEMP_DIR/dist"/* "$TYPES_DIR/"
            log_success "Archivos compilados copiados"
        fi
    else
        log_error "Error durante la compilación TypeScript"
        return 1
    fi
}

# Analizar estadísticas de tipos
analyze_types() {
    log_step "Analizando estadísticas de tipos..."
    
    local total_files=0
    local total_interfaces=0
    local total_types=0
    local total_enums=0
    local total_imports=0
    local total_exports=0
    
    # Contar archivos
    total_files=$(find "$TYPES_DIR" -name "*.d.ts" -o -name "*.ts" | grep -v node_modules | wc -l)
    
    # Analizar contenido
    while IFS= read -r -d '' file; do
        if [[ "$file" == *.d.ts ]] || [[ "$file" == *.ts ]]; then
            # Contar interfaces
            local interfaces=$(grep -c "export interface" "$file" 2>/dev/null || echo "0")
            total_interfaces=$((total_interfaces + interfaces))
            
            # Contar tipos
            local types=$(grep -c "export type" "$file" 2>/dev/null || echo "0")
            total_types=$((total_types + types))
            
            # Contar enums
            local enums=$(grep -c "export enum" "$file" 2>/dev/null || echo "0")
            total_enums=$((total_enums + enums))
            
            # Contar imports
            local imports=$(grep -c "import" "$file" 2>/dev/null || echo "0")
            total_imports=$((total_imports + imports))
            
            # Contar exports
            local exports=$(grep -c "export" "$file" 2>/dev/null || echo "0")
            total_exports=$((total_exports + exports))
        fi
    done < <(find "$TYPES_DIR" -type f \( -name "*.d.ts" -o -name "*.ts" \) -print0)
    
    # Generar reporte
    cat > "$TYPES_DIR/type-stats.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "statistics": {
    "totalFiles": $total_files,
    "totalInterfaces": $total_interfaces,
    "totalTypes": $total_types,
    "totalEnums": $total_enums,
    "totalImports": $total_imports,
    "totalExports": $total_exports
  },
  "categories": {
    "core": $(find "$TYPES_DIR/core" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "metaverse": $(find "$TYPES_DIR/metaverso" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "blockchain": $(find "$TYPES_DIR/blockchain" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "ui": $(find "$TYPES_DIR/ui" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "api": $(find "$TYPES_DIR/api" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "assets": $(find "$TYPES_DIR/assets" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "audio": $(find "$TYPES_DIR/audio" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "analytics": $(find "$TYPES_DIR/analytics" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l),
    "utilities": $(find "$TYPES_DIR/utilities" -name "*.d.ts" -o -name "*.ts" 2>/dev/null | wc -l)
  }
}
EOF
    
    log_success "Estadísticas generadas en type-stats.json"
    
    # Mostrar resumen
    echo -e "${CYAN}📊 Resumen de Tipos:${NC}"
    echo "  📁 Archivos totales: $total_files"
    echo "  🔗 Interfaces: $total_interfaces"
    echo "  📝 Tipos: $total_types"
    echo "  🔢 Enums: $total_enums"
    echo "  📥 Imports: $total_imports"
    echo "  📤 Exports: $total_exports"
}

# Limpiar archivos temporales y antiguos
cleanup_old_files() {
    log_step "Limpiando archivos temporales y antiguos..."
    
    # Eliminar archivos .js generados por TypeScript
    find "$TYPES_DIR" -name "*.js" -delete 2>/dev/null || true
    
    # Eliminar archivos .map
    find "$TYPES_DIR" -name "*.map" -delete 2>/dev/null || true
    
    # Eliminar backups antiguos (más de 30 días)
    find "$BACKUP_DIR" -name "types_backup_*" -mtime +30 -delete 2>/dev/null || true
    
    log_success "Limpieza completada"
}

# Función principal
main() {
    log_info "🚀 Iniciando automatización de tipos..."
    log_info "Directorio de trabajo: $TYPES_DIR"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Archivo de configuración no encontrado: $CONFIG_FILE"
        log_info "Ejecute este script desde el directorio @types"
        exit 1
    fi
    
    # Ejecutar pasos
    check_dependencies
    setup_directories
    create_backup
    generate_types
    validate_types
    compile_types
    analyze_types
    cleanup_old_files
    
    log_success "✅ Automatización de tipos completada exitosamente!"
    
    # Mostrar archivos generados
    echo -e "${CYAN}📁 Archivos generados:${NC}"
    find "$TYPES_DIR" -name "*.d.ts" -o -name "*.ts" | head -10 | while read -r file; do
        echo "  📄 $(basename "$file")"
    done
    
    if [ $(find "$TYPES_DIR" -name "*.d.ts" -o -name "*.ts" | wc -l) -gt 10 ]; then
        echo "  ... y más archivos"
    fi
}

# Función de ayuda
show_help() {
    echo "🔧 Type Automation Script"
    echo ""
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -g, --generate Solo generar tipos"
    echo "  -v, --validate Solo validar tipos"
    echo "  -c, --compile  Solo compilar tipos"
    echo "  -a, --analyze  Solo analizar estadísticas"
    echo "  -b, --backup   Solo crear backup"
    echo ""
    echo "Sin opciones: Ejecuta todo el proceso completo"
}

# Procesar argumentos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -g|--generate)
        check_dependencies
        setup_directories
        generate_types
        ;;
    -v|--validate)
        check_dependencies
        validate_types
        ;;
    -c|--compile)
        check_dependencies
        setup_directories
        compile_types
        ;;
    -a|--analyze)
        analyze_types
        ;;
    -b|--backup)
        setup_directories
        create_backup
        ;;
    "")
        main
        ;;
    *)
        log_error "Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac 