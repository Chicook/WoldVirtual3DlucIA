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