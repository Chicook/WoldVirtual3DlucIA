#!/bin/bash
# Despliega la app en mainnet con funcionalidades avanzadas

set -e

LOG_FILE="deploy-mainnet-$(date +%Y%m%d-%H%M%S).log"

function log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

function check_dependencies() {
    for cmd in npm git; do
        if ! command -v $cmd &>/dev/null; then
            log "Error: $cmd no está instalado."
            exit 1
        fi
    done
}

function git_status_check() {
    if [[ -n $(git status --porcelain) ]]; then
        log "Advertencia: Hay cambios sin commitear en el repositorio."
        read -p "¿Deseas continuar? (s/n): " choice
        [[ "$choice" != "s" ]] && exit 1
    fi
}

function backup_build() {
    if [ -d build ]; then
        BACKUP_DIR="build_backup_$(date +%Y%m%d-%H%M%S)"
        cp -r build "$BACKUP_DIR"
        log "Backup de la carpeta build creado en $BACKUP_DIR"
    fi
}

function deploy() {
    log "Instalando dependencias..."
    npm install | tee -a "$LOG_FILE"

    log "Construyendo la aplicación..."
    npm run build | tee -a "$LOG_FILE"

    log "Desplegando en mainnet..."
    npm run deploy:mainnet | tee -a "$LOG_FILE"
}

function post_deploy() {
    log "Despliegue completado."
    # Aquí puedes agregar notificaciones, limpieza, etc.
}

# Ejecución del script
log "==== INICIO DEL DESPLIEGUE EN MAINNET ===="
check_dependencies
git_status_check
backup_build
deploy
post_deploy
log "==== FIN DEL DESPLIEGUE ===="

# ============================================================================
# SISTEMA AVANZADO DE VALIDACIÓN Y MONITOREO
# ============================================================================

function validate_environment() {
    log "Validando entorno de producción..."
    
    # Verificar variables de entorno críticas
    local required_vars=("NODE_ENV" "DATABASE_URL" "API_KEY" "SECRET_KEY")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log "Error: Variable de entorno $var no está definida"
            exit 1
        fi
    done
    
    # Verificar conectividad de servicios
    log "Verificando conectividad de servicios..."
    if ! curl -f -s --connect-timeout 5 "$DATABASE_URL" > /dev/null; then
        log "Error: No se puede conectar a la base de datos"
        exit 1
    fi
    
    log "Validación de entorno completada exitosamente"
}

function security_scan() {
    log "Ejecutando escaneo de seguridad..."
    
    # Verificar dependencias vulnerables
    if command -v npm-audit &> /dev/null; then
        if npm audit --audit-level=high; then
            log "Advertencia: Se encontraron vulnerabilidades de seguridad"
            read -p "¿Deseas continuar? (s/n): " choice
            [[ "$choice" != "s" ]] && exit 1
        fi
    fi
    
    # Verificar archivos sensibles
    if grep -r "password\|secret\|key" --include="*.env*" . 2>/dev/null; then
        log "Advertencia: Se encontraron posibles archivos sensibles"
    fi
    
    log "Escaneo de seguridad completado"
}

function performance_test() {
    log "Ejecutando pruebas de rendimiento..."
    
    # Simular carga básica
    if command -v ab &> /dev/null; then
        log "Ejecutando Apache Bench..."
        ab -n 100 -c 10 http://localhost:3000/ > performance_test.log 2>&1
    fi
    
    # Verificar métricas de memoria
    local memory_usage=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')
    log "Uso de memoria actual: $memory_usage"
    
    log "Pruebas de rendimiento completadas"
}

function health_check() {
    log "Realizando health check..."
    
    # Verificar que la aplicación esté respondiendo
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3000/health > /dev/null; then
            log "Health check exitoso en el intento $attempt"
            return 0
        fi
        
        log "Intento $attempt/$max_attempts - Esperando 10 segundos..."
        sleep 10
        ((attempt++))
    done
    
    log "Error: Health check falló después de $max_attempts intentos"
    return 1
}

function send_notification() {
    local status=$1
    local message=$2
    
    log "Enviando notificación: $message"
    
    # Enviar notificación por email (ejemplo)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "Deploy $status - $(date)" admin@woldvirtual.com
    fi
    
    # Enviar notificación por Slack (ejemplo)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

function cleanup_old_backups() {
    log "Limpiando backups antiguos..."
    
    # Mantener solo los últimos 5 backups
    local backup_count=$(ls -1 build_backup_* 2>/dev/null | wc -l)
    if [ $backup_count -gt 5 ]; then
        ls -1t build_backup_* | tail -n +6 | xargs rm -rf
        log "Backups antiguos eliminados"
    fi
}

# Función principal mejorada
function main() {
    local start_time=$(date +%s)
    
    log "==== INICIO DEL DESPLIEGUE AVANZADO EN MAINNET ===="
    
    # Validaciones previas
    check_dependencies
    validate_environment
    security_scan
    git_status_check
    
    # Backup y despliegue
    backup_build
    deploy
    
    # Post-despliegue
    health_check
    performance_test
    post_deploy
    cleanup_old_backups
    
    # Notificación de éxito
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    send_notification "EXITOSO" "Deploy completado en ${duration} segundos"
    
    log "==== DESPLIEGUE COMPLETADO EXITOSAMENTE ===="
}

# Ejecutar función principal si no se llama desde otro script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi