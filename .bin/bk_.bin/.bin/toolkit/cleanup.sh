#!/bin/bash

# 🧹 Cleanup Completo - Metaverso Web3
# Elimina archivos temporales, cachés, logs antiguos y optimiza espacio

set -e

# Configuración
LOG_FILE="cleanup-$(date +%Y%m%d-%H%M%S).log"
DRY_RUN=false
VERBOSE=false
CLEANUP_TYPES=("temp" "cache" "logs" "node_modules" "build" "coverage" "all")

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para obtener tamaño de directorio
get_directory_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1 || echo "0B"
    else
        echo "0B"
    fi
}

# Función para contar archivos
count_files() {
    local dir="$1"
    if [ -d "$dir" ]; then
        find "$dir" -type f 2>/dev/null | wc -l || echo "0"
    else
        echo "0"
    fi
}

# Función para limpiar archivos temporales
cleanup_temp_files() {
    log "${BLUE}🗂️  Limpiando archivos temporales...${NC}"
    
    local temp_patterns=(
        "*.tmp"
        "*.temp"
        "*.swp"
        "*.swo"
        "*~"
        ".DS_Store"
        "Thumbs.db"
        "*.log.tmp"
        "*.pid"
        "*.lock"
    )
    
    local temp_dirs=(
        "/tmp/metaverso*"
        "./temp"
        "./tmp"
        "./.temp"
        "./.tmp"
    )
    
    local total_cleaned=0
    local total_size=0
    
    # Limpiar archivos temporales por patrón
    for pattern in "${temp_patterns[@]}"; do
        local files=$(find . -name "$pattern" -type f 2>/dev/null || true)
        if [ -n "$files" ]; then
            local file_count=$(echo "$files" | wc -l)
            local size_before=0
            
            echo "$files" | while read -r file; do
                if [ -f "$file" ]; then
                    size_before=$((size_before + $(stat -c%s "$file" 2>/dev/null || echo 0)))
                    if [ "$DRY_RUN" = false ]; then
                        rm -f "$file"
                    fi
                fi
            done
            
            total_cleaned=$((total_cleaned + file_count))
            total_size=$((total_size + size_before))
            
            if [ "$VERBOSE" = true ]; then
                log "${GREEN}✅ Eliminados $file_count archivos con patrón: $pattern${NC}"
            fi
        fi
    done
    
    # Limpiar directorios temporales
    for temp_dir in "${temp_dirs[@]}"; do
        if [ -d "$temp_dir" ]; then
            local size_before=$(get_directory_size "$temp_dir")
            local file_count=$(count_files "$temp_dir")
            
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$temp_dir"
            fi
            
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminado directorio temporal: $temp_dir ($size_before, $file_count archivos)${NC}"
        fi
    done
    
    log "${GREEN}✅ Limpieza de archivos temporales completada: $total_cleaned archivos${NC}"
}

# Función para limpiar cachés
cleanup_cache() {
    log "${BLUE}🗄️  Limpiando cachés...${NC}"
    
    local cache_dirs=(
        "./node_modules/.cache"
        "./.cache"
        "./cache"
        "./.parcel-cache"
        "./.next"
        "./dist"
        "./build"
        "./.nuxt"
        "./.vuepress/dist"
        "./.gatsby"
        "./.svelte-kit"
        "./.astro"
        "./.vite"
        "./.esbuild"
        "./.swc"
        "./.babel"
        "./.webpack"
        "./.rollup"
        "./.terser"
        "./.uglify"
    )
    
    local total_cleaned=0
    local total_size=0
    
    for cache_dir in "${cache_dirs[@]}"; do
        if [ -d "$cache_dir" ]; then
            local size_before=$(get_directory_size "$cache_dir")
            local file_count=$(count_files "$cache_dir")
            
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$cache_dir"
            fi
            
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminado caché: $cache_dir ($size_before, $file_count archivos)${NC}"
        fi
    done
    
    # Limpiar caché de npm
    if command_exists npm; then
        if [ "$DRY_RUN" = false ]; then
            npm cache clean --force 2>/dev/null || true
        fi
        log "${GREEN}✅ Caché de npm limpiado${NC}"
    fi
    
    # Limpiar caché de yarn
    if command_exists yarn; then
        if [ "$DRY_RUN" = false ]; then
            yarn cache clean 2>/dev/null || true
        fi
        log "${GREEN}✅ Caché de yarn limpiado${NC}"
    fi
    
    # Limpiar caché de pnpm
    if command_exists pnpm; then
        if [ "$DRY_RUN" = false ]; then
            pnpm store prune 2>/dev/null || true
        fi
        log "${GREEN}✅ Caché de pnpm limpiado${NC}"
    fi
    
    log "${GREEN}✅ Limpieza de cachés completada: $total_cleaned archivos${NC}"
}

# Función para limpiar logs antiguos
cleanup_logs() {
    log "${BLUE}📝 Limpiando logs antiguos...${NC}"
    
    local log_retention_days=7
    local log_dirs=(
        "./logs"
        "./.bin/logs"
        "./data/logs"
        "./client/logs"
        "./assets/logs"
        "./test/logs"
    )
    
    local total_cleaned=0
    local total_size=0
    
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            # Encontrar archivos de log más antiguos que log_retention_days
            local old_logs=$(find "$log_dir" -name "*.log" -type f -mtime +$log_retention_days 2>/dev/null || true)
            
            if [ -n "$old_logs" ]; then
                local file_count=$(echo "$old_logs" | wc -l)
                local size_before=0
                
                echo "$old_logs" | while read -r log_file; do
                    if [ -f "$log_file" ]; then
                        size_before=$((size_before + $(stat -c%s "$log_file" 2>/dev/null || echo 0)))
                        if [ "$DRY_RUN" = false ]; then
                            rm -f "$log_file"
                        fi
                    fi
                done
                
                total_cleaned=$((total_cleaned + file_count))
                total_size=$((total_size + size_before))
                
                log "${GREEN}✅ Eliminados $file_count logs antiguos en: $log_dir${NC}"
            fi
        fi
    done
    
    # Limpiar logs del sistema
    if [ -d "/var/log" ] && [ "$(id -u)" -eq 0 ]; then
        local system_logs=(
            "/var/log/metaverso*"
            "/var/log/nginx/access.log.*"
            "/var/log/nginx/error.log.*"
        )
        
        for log_pattern in "${system_logs[@]}"; do
            local old_system_logs=$(find $log_pattern -type f -mtime +$log_retention_days 2>/dev/null || true)
            if [ -n "$old_system_logs" ]; then
                local file_count=$(echo "$old_system_logs" | wc -l)
                if [ "$DRY_RUN" = false ]; then
                    rm -f $old_system_logs
                fi
                total_cleaned=$((total_cleaned + file_count))
                log "${GREEN}✅ Eliminados $file_count logs del sistema: $log_pattern${NC}"
            fi
        done
    fi
    
    log "${GREEN}✅ Limpieza de logs completada: $total_cleaned archivos${NC}"
}

# Función para limpiar node_modules
cleanup_node_modules() {
    log "${BLUE}📦 Limpiando node_modules...${NC}"
    
    local node_modules_dirs=$(find . -name "node_modules" -type d 2>/dev/null || true)
    local total_cleaned=0
    local total_size=0
    
    if [ -n "$node_modules_dirs" ]; then
        echo "$node_modules_dirs" | while read -r node_dir; do
            local size_before=$(get_directory_size "$node_dir")
            local file_count=$(count_files "$node_dir")
            
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$node_dir"
            fi
            
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminado node_modules: $node_dir ($size_before, $file_count archivos)${NC}"
        done
    fi
    
    log "${GREEN}✅ Limpieza de node_modules completada: $total_cleaned archivos${NC}"
}

# Función para limpiar archivos de build
cleanup_build_files() {
    log "${BLUE}🏗️  Limpiando archivos de build...${NC}"
    
    local build_dirs=(
        "./dist"
        "./build"
        "./out"
        "./.next"
        "./.nuxt"
        "./.vuepress/dist"
        "./.gatsby"
        "./.svelte-kit"
        "./.astro"
        "./coverage"
        "./.nyc_output"
        "./.jest"
        "./.mocha"
        "./.karma"
        "./.cypress/videos"
        "./.cypress/screenshots"
        "./.playwright-report"
        "./test-results"
        "./reports"
    )
    
    local total_cleaned=0
    local total_size=0
    
    for build_dir in "${build_dirs[@]}"; do
        if [ -d "$build_dir" ]; then
            local size_before=$(get_directory_size "$build_dir")
            local file_count=$(count_files "$build_dir")
            
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$build_dir"
            fi
            
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminado directorio de build: $build_dir ($size_before, $file_count archivos)${NC}"
        fi
    done
    
    # Limpiar archivos de build específicos
    local build_files=(
        "*.tsbuildinfo"
        "*.map"
        "*.min.js"
        "*.min.css"
        "*.bundle.js"
        "*.bundle.css"
    )
    
    for pattern in "${build_files[@]}"; do
        local files=$(find . -name "$pattern" -type f 2>/dev/null || true)
        if [ -n "$files" ]; then
            local file_count=$(echo "$files" | wc -l)
            if [ "$DRY_RUN" = false ]; then
                rm -f $files
            fi
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminados $file_count archivos de build con patrón: $pattern${NC}"
        fi
    done
    
    log "${GREEN}✅ Limpieza de archivos de build completada: $total_cleaned archivos${NC}"
}

# Función para limpiar archivos de coverage
cleanup_coverage() {
    log "${BLUE}📊 Limpiando archivos de coverage...${NC}"
    
    local coverage_dirs=(
        "./coverage"
        "./.nyc_output"
        "./.jest"
        "./.mocha"
        "./.karma"
        "./test-results"
        "./reports"
    )
    
    local total_cleaned=0
    
    for coverage_dir in "${coverage_dirs[@]}"; do
        if [ -d "$coverage_dir" ]; then
            local size_before=$(get_directory_size "$coverage_dir")
            local file_count=$(count_files "$coverage_dir")
            
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$coverage_dir"
            fi
            
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminado directorio de coverage: $coverage_dir ($size_before, $file_count archivos)${NC}"
        fi
    done
    
    # Limpiar archivos de coverage específicos
    local coverage_files=(
        "*.lcov"
        "coverage.json"
        "coverage.xml"
        "*.coverage"
    )
    
    for pattern in "${coverage_files[@]}"; do
        local files=$(find . -name "$pattern" -type f 2>/dev/null || true)
        if [ -n "$files" ]; then
            local file_count=$(echo "$files" | wc -l)
            if [ "$DRY_RUN" = false ]; then
                rm -f $files
            fi
            total_cleaned=$((total_cleaned + file_count))
            log "${GREEN}✅ Eliminados $file_count archivos de coverage con patrón: $pattern${NC}"
        fi
    done
    
    log "${GREEN}✅ Limpieza de archivos de coverage completada: $total_cleaned archivos${NC}"
}

# Función para optimizar espacio en disco
optimize_disk_space() {
    log "${BLUE}💾 Optimizando espacio en disco...${NC}"
    
    # Limpiar caché del sistema si es posible
    if command_exists apt-get && [ "$(id -u)" -eq 0 ]; then
        if [ "$DRY_RUN" = false ]; then
            apt-get clean 2>/dev/null || true
            apt-get autoremove -y 2>/dev/null || true
        fi
        log "${GREEN}✅ Caché del sistema limpiado${NC}"
    fi
    
    # Limpiar caché de Docker si está disponible
    if command_exists docker; then
        if [ "$DRY_RUN" = false ]; then
            docker system prune -f 2>/dev/null || true
        fi
        log "${GREEN}✅ Caché de Docker limpiado${NC}"
    fi
    
    # Limpiar caché de npm global
    if command_exists npm; then
        if [ "$DRY_RUN" = false ]; then
            npm cache clean --force 2>/dev/null || true
        fi
        log "${GREEN}✅ Caché global de npm limpiado${NC}"
    fi
    
    # Comprimir archivos de log grandes
    local large_logs=$(find . -name "*.log" -type f -size +10M 2>/dev/null || true)
    if [ -n "$large_logs" ]; then
        echo "$large_logs" | while read -r log_file; do
            if [ "$DRY_RUN" = false ]; then
                gzip -f "$log_file" 2>/dev/null || true
            fi
            log "${GREEN}✅ Comprimido log grande: $log_file${NC}"
        done
    fi
    
    log "${GREEN}✅ Optimización de espacio en disco completada${NC}"
}

# Función para mostrar estadísticas de espacio
show_disk_stats() {
    log "${BLUE}📊 Estadísticas de espacio en disco...${NC}"
    
    # Espacio total y disponible
    local disk_info=$(df -h . | tail -1)
    log "${GREEN}💾 Información del disco: $disk_info${NC}"
    
    # Tamaño de directorios principales
    local main_dirs=(
        "./node_modules"
        "./dist"
        "./build"
        "./coverage"
        "./logs"
        "./.cache"
        "./temp"
    )
    
    log "${BLUE}📁 Tamaño de directorios principales:${NC}"
    for dir in "${main_dirs[@]}"; do
        if [ -d "$dir" ]; then
            local size=$(get_directory_size "$dir")
            local file_count=$(count_files "$dir")
            log "   $dir: $size ($file_count archivos)"
        fi
    done
    
    # Archivos más grandes
    log "${BLUE}📋 Archivos más grandes:${NC}"
    find . -type f -size +10M 2>/dev/null | head -5 | while read -r file; do
        local size=$(du -h "$file" 2>/dev/null | cut -f1)
        log "   $file: $size"
    done
}

# Función para mostrar resumen
show_summary() {
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "\n📊 RESUMEN DE LIMPIEZA"
    log "====================="
    log "Duración total: ${duration}s"
    log "Modo dry-run: $DRY_RUN"
    log "Log file: $LOG_FILE"
    
    # Mostrar espacio liberado (aproximado)
    if [ "$DRY_RUN" = false ]; then
        log "${GREEN}✅ Limpieza completada exitosamente${NC}"
        log "${GREEN}📁 Revisa el log para más detalles: $LOG_FILE${NC}"
    else
        log "${YELLOW}🔍 Modo dry-run: No se eliminaron archivos${NC}"
        log "${YELLOW}📁 Revisa el log para ver qué se habría eliminado${NC}"
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "${CYAN}🧹 Cleanup Completo - Metaverso Web3${NC}"
    echo ""
    echo "Uso: $0 [opciones] [tipos]"
    echo ""
    echo "Opciones:"
    echo "  -d, --dry-run     Modo de prueba (no elimina archivos)"
    echo "  -v, --verbose     Modo verboso"
    echo "  -h, --help        Mostrar esta ayuda"
    echo ""
    echo "Tipos de limpieza:"
    echo "  temp              Archivos temporales"
    echo "  cache             Cachés de aplicaciones"
    echo "  logs              Logs antiguos"
    echo "  node_modules      Directorios node_modules"
    echo "  build             Archivos de build"
    echo "  coverage          Archivos de coverage"
    echo "  all               Todos los tipos (por defecto)"
    echo ""
    echo "Ejemplos:"
    echo "  $0                    # Limpieza completa"
    echo "  $0 --dry-run          # Modo de prueba"
    echo "  $0 temp cache         # Solo archivos temporales y cachés"
    echo "  $0 --verbose logs     # Logs con modo verboso"
}

# Función principal
main() {
    local start_time=$(date +%s)
    
    # Parsear argumentos
    local cleanup_types=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            temp|cache|logs|node_modules|build|coverage|all)
                cleanup_types+=("$1")
                shift
                ;;
            *)
                echo "${RED}❌ Opción desconocida: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Si no se especificaron tipos, usar todos
    if [ ${#cleanup_types[@]} -eq 0 ]; then
        cleanup_types=("all")
    fi
    
    log "🧹 INICIANDO LIMPIEZA COMPLETA DEL METAVERSO"
    log "============================================"
    log "Modo dry-run: $DRY_RUN"
    log "Modo verboso: $VERBOSE"
    log "Tipos de limpieza: ${cleanup_types[*]}"
    
    # Mostrar estadísticas iniciales
    show_disk_stats
    
    # Ejecutar limpiezas según los tipos especificados
    for cleanup_type in "${cleanup_types[@]}"; do
        case $cleanup_type in
            temp)
                cleanup_temp_files
                ;;
            cache)
                cleanup_cache
                ;;
            logs)
                cleanup_logs
                ;;
            node_modules)
                cleanup_node_modules
                ;;
            build)
                cleanup_build_files
                ;;
            coverage)
                cleanup_coverage
                ;;
            all)
                cleanup_temp_files
                cleanup_cache
                cleanup_logs
                cleanup_node_modules
                cleanup_build_files
                cleanup_coverage
                optimize_disk_space
                ;;
        esac
    done
    
    # Mostrar estadísticas finales
    show_disk_stats
    
    # Mostrar resumen
    show_summary
}

# Ejecutar limpieza
main "$@" 