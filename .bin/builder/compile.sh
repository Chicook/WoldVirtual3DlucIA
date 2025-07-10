#!/bin/bash

set -e

# Limpiar builds anteriores
clean() {
    echo "Limpiando builds anteriores..."
    rm -rf dist build artifacts cache
}

# Compilar código fuente
build_source() {
    echo "Compilando código fuente..."
    npm run build
}

# Compilar smart contracts
compile_contracts() {
    echo "Compilando smart contracts..."
    npx hardhat compile
}

# Ejecutar pruebas
run_tests() {
    echo "Ejecutando pruebas..."
    npm test
    npx hardhat test
}

# Desplegar contratos (red de prueba)
deploy_contracts() {
    echo "Desplegando smart contracts en red de prueba..."
    npx hardhat run scripts/deploy.js --network goerli
}

# Generar documentación
generate_docs() {
    echo "Generando documentación..."
    npm run docs || echo "No se encontró el comando de documentación."
}

# Menú principal
main() {
    clean
    build_source
    compile_contracts
    run_tests
    generate_docs
    # Descomenta la siguiente línea si quieres desplegar automáticamente
    # deploy_contracts
    echo "¡Compilación y procesos avanzados completados!"
}

main "$@"

# ============================================================================
# SISTEMA AVANZADO DE CACHE Y OPTIMIZACIÓN
# ============================================================================

# Configuración de cache
CACHE_DIR="./.build-cache"
CACHE_ENABLED=${CACHE_ENABLED:-true}
PARALLEL_JOBS=${PARALLEL_JOBS:-4}
OPTIMIZATION_LEVEL=${OPTIMIZATION_LEVEL:-medium}

# Función para gestionar cache
manage_cache() {
    if [ "$CACHE_ENABLED" = "true" ]; then
        echo "Gestionando cache de build..."
        mkdir -p "$CACHE_DIR"
        
        # Limpiar cache antiguo (más de 7 días)
        find "$CACHE_DIR" -type f -mtime +7 -delete 2>/dev/null || true
        
        # Mostrar estadísticas de cache
        cache_size=$(du -sh "$CACHE_DIR" 2>/dev/null | cut -f1)
        echo "Tamaño del cache: $cache_size"
    fi
}

# Función para build incremental
incremental_build() {
    echo "Ejecutando build incremental..."
    
    # Detectar archivos modificados
    modified_files=$(git diff --name-only HEAD~1 2>/dev/null || echo "")
    
    if [ -n "$modified_files" ]; then
        echo "Archivos modificados detectados:"
        echo "$modified_files"
        
        # Compilar solo archivos modificados
        for file in $modified_files; do
            case "$file" in
                *.ts|*.tsx)
                    echo "Compilando TypeScript: $file"
                    npx tsc "$file" --outDir dist
                    ;;
                *.js|*.jsx)
                    echo "Compilando JavaScript: $file"
                    npx babel "$file" --out-dir dist
                    ;;
                *.py)
                    echo "Compilando Python: $file"
                    python -m py_compile "$file"
                    ;;
            esac
        done
    else
        echo "No se detectaron cambios, ejecutando build completo..."
        main
    fi
}

# Función para análisis de performance
analyze_performance() {
    echo "Analizando performance del build..."
    
    # Medir tiempo de compilación
    start_time=$(date +%s)
    
    # Ejecutar build con profiling
    npm run build -- --profile
    
    end_time=$(date +%s)
    build_duration=$((end_time - start_time))
    
    echo "Tiempo de build: ${build_duration} segundos"
    
    # Analizar tamaño de bundles
    if command -v webpack-bundle-analyzer &> /dev/null; then
        npx webpack-bundle-analyzer dist/stats.json
    fi
    
    # Generar reporte de performance
    cat > build-performance-report.json << EOF
{
    "build_duration": $build_duration,
    "timestamp": "$(date -Iseconds)",
    "optimization_level": "$OPTIMIZATION_LEVEL",
    "cache_enabled": $CACHE_ENABLED,
    "parallel_jobs": $PARALLEL_JOBS
}
EOF
}

# Función para build paralelo
parallel_build() {
    echo "Ejecutando build paralelo con $PARALLEL_JOBS jobs..."
    
    # Compilar TypeScript en paralelo
    find src -name "*.ts" -o -name "*.tsx" | xargs -P $PARALLEL_JOBS -I {} npx tsc {} --outDir dist
    
    # Compilar JavaScript en paralelo
    find src -name "*.js" -o -name "*.jsx" | xargs -P $PARALLEL_JOBS -I {} npx babel {} --out-dir dist
    
    echo "Build paralelo completado"
}

# Función para limpiar cache
clear_cache() {
    echo "Limpiando cache de build..."
    rm -rf "$CACHE_DIR"
    echo "Cache limpiado"
}

# Función para mostrar estadísticas de cache
cache_stats() {
    if [ -d "$CACHE_DIR" ]; then
        echo "Estadísticas del cache:"
        echo "Tamaño total: $(du -sh "$CACHE_DIR" | cut -f1)"
        echo "Número de archivos: $(find "$CACHE_DIR" -type f | wc -l)"
        echo "Archivos más antiguos:"
        find "$CACHE_DIR" -type f -printf '%T+ %p\n' | sort | head -5
    else
        echo "No existe directorio de cache"
    fi
}

# Procesar argumentos de línea de comandos
case "${1:-}" in
    --incremental)
        incremental_build
        ;;
    --analyze)
        analyze_performance
        ;;
    --parallel)
        parallel_build
        ;;
    --clear-cache)
        clear_cache
        ;;
    --cache-stats)
        cache_stats
        ;;
    --optimize)
        OPTIMIZATION_LEVEL="high"
        main
        ;;
    --ci)
        echo "Ejecutando en modo CI/CD..."
        CACHE_ENABLED="false"
        OPTIMIZATION_LEVEL="production"
        main
        ;;
    *)
        manage_cache
        main
        ;;
esac