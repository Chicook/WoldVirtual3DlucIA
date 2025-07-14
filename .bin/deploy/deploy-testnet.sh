#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

install_dependencies() {
    echo "Instalando dependencias..."
    cd "$PROJECT_DIR"
    npm install
}

build_project() {
    echo "Compilando el proyecto..."
    cd "$PROJECT_DIR"
    npm run build
}

deploy_testnet() {
    echo "Desplegando en testnet..."
    cd "$PROJECT_DIR"
    npm run deploy:testnet
}

verify_deploy() {
    echo "Verificando despliegue en testnet..."
    # Aquí puedes añadir comandos específicos de verificación, por ejemplo:
    npm run verify:testnet
}

clean_temp() {
    echo "Limpiando archivos temporales..."
    cd "$PROJECT_DIR"
    rm -rf dist node_modules/.cache
}

show_help() {
    echo "Uso: $0 [comando]"
    echo "Comandos disponibles:"
    echo "  install      Instala dependencias"
    echo "  build        Compila el proyecto"
    echo "  deploy       Despliega en testnet"
    echo "  verify       Verifica el despliegue"
    echo "  clean        Limpia archivos temporales"
    echo "  help         Muestra esta ayuda"
}

case "$1" in
    install)
        install_dependencies
        ;;
    build)
        build_project
        ;;
    deploy)
        deploy_testnet
        ;;
    verify)
        verify_deploy
        ;;
    clean)
        clean_temp
        ;;
    help|*)
        show_help
        ;;
esac

# ============================================================================
# SISTEMA AVANZADO DE DESPLIEGUE EN TESTNET
# ============================================================================

function setup_testnet_environment() {
    echo "Configurando entorno de testnet..."
    
    # Configurar variables de entorno para testnet
    export NODE_ENV=testnet
    export TESTNET_MODE=true
    export DEBUG_MODE=true
    
    # Crear archivo de configuración temporal
    cat > testnet-config.json << EOF
{
    "environment": "testnet",
    "debug": true,
    "logging": "verbose",
    "timeout": 30000,
    "retries": 3
}
EOF
    
    echo "Entorno de testnet configurado"
}

function run_tests() {
    echo "Ejecutando suite de pruebas..."
    
    # Ejecutar pruebas unitarias
    if npm run test:unit; then
        echo "Pruebas unitarias exitosas"
    else
        echo "Error: Pruebas unitarias fallaron"
        exit 1
    fi
    
    # Ejecutar pruebas de integración
    if npm run test:integration; then
        echo "Pruebas de integración exitosas"
    else
        echo "Error: Pruebas de integración fallaron"
        exit 1
    fi
    
    # Ejecutar pruebas de end-to-end
    if npm run test:e2e; then
        echo "Pruebas E2E exitosas"
    else
        echo "Error: Pruebas E2E fallaron"
        exit 1
    fi
}

function validate_testnet_deploy() {
    echo "Validando despliegue en testnet..."
    
    # Verificar que la aplicación esté respondiendo
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3001/health > /dev/null; then
            echo "Validación exitosa en el intento $attempt"
            return 0
        fi
        
        echo "Intento $attempt/$max_attempts - Esperando 5 segundos..."
        sleep 5
        ((attempt++))
    done
    
    echo "Error: Validación falló después de $max_attempts intentos"
    return 1
}

function generate_test_report() {
    echo "Generando reporte de pruebas..."
    
    # Crear directorio de reportes si no existe
    mkdir -p test-reports
    
    # Generar reporte de cobertura
    if npm run test:coverage; then
        echo "Reporte de cobertura generado"
    fi
    
    # Generar reporte de performance
    if command -v lighthouse &> /dev/null; then
        lighthouse http://localhost:3001 --output=json --output-path=test-reports/lighthouse.json
        echo "Reporte de Lighthouse generado"
    fi
    
    # Generar reporte de seguridad
    if command -v npm-audit &> /dev/null; then
        npm audit --json > test-reports/security-audit.json
        echo "Reporte de seguridad generado"
    fi
    
    echo "Reportes generados en test-reports/"
}

function cleanup_testnet() {
    echo "Limpiando entorno de testnet..."
    
    # Detener servicios de testnet
    if pgrep -f "testnet" > /dev/null; then
        pkill -f "testnet"
        echo "Servicios de testnet detenidos"
    fi
    
    # Limpiar archivos temporales
    rm -f testnet-config.json
    rm -rf test-reports/temp
    
    # Limpiar logs de testnet
    find . -name "testnet-*.log" -delete
    
    echo "Limpieza de testnet completada"
}

function monitor_testnet() {
    echo "Iniciando monitoreo de testnet..."
    
    # Monitorear logs en tiempo real
    tail -f testnet-*.log &
    local tail_pid=$!
    
    # Monitorear métricas del sistema
    while true; do
        echo "=== Métricas del Sistema ==="
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
        echo "Memoria: $(free -h | awk 'NR==2{print $3"/"$2}')"
        echo "Disco: $(df -h / | awk 'NR==2{print $5}')"
        echo "=========================="
        sleep 30
    done &
    local monitor_pid=$!
    
    # Esperar señal de interrupción
    trap "kill $tail_pid $monitor_pid; exit" INT TERM
    wait
}

# Funciones adicionales para el case statement
function testnet_full() {
    echo "Ejecutando despliegue completo de testnet..."
    setup_testnet_environment
    install_dependencies
    run_tests
    build_project
    deploy_testnet
    validate_testnet_deploy
    generate_test_report
    echo "Despliegue completo de testnet finalizado"
}

function testnet_monitor() {
    monitor_testnet
}

function testnet_cleanup() {
    cleanup_testnet
}

# Actualizar case statement con nuevas funciones
case "$1" in
    install)
        install_dependencies
        ;;
    build)
        build_project
        ;;
    deploy)
        deploy_testnet
        ;;
    verify)
        verify_deploy
        ;;
    clean)
        clean_temp
        ;;
    test)
        run_tests
        ;;
    full)
        testnet_full
        ;;
    monitor)
        testnet_monitor
        ;;
    cleanup)
        testnet_cleanup
        ;;
    help|*)
        show_help
        ;;
esac