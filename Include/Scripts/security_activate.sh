#!/bin/bash
# Script de activación seguro del entorno virtual para Metaverso Crypto World Virtual 3D
# Este script proporciona una capa adicional de seguridad al activar el entorno virtual

set -euo pipefail  # Salir en caso de error, variables no definidas, o fallo en pipeline

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de seguridad
SECURITY_CONFIG_FILE="security_config.json"
BLACKLIST_FILE="blacklist.json"
WHITELIST_FILE="whitelist.json"
SECURITY_LOG_FILE="security.log"
INTEGRITY_CHECK_FILE=".venv_checksums"

# Función de logging
log_security() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$SECURITY_LOG_FILE"
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "SECURITY")
            echo -e "${RED}[SECURITY]${NC} $message"
            ;;
    esac
}

# Función para verificar integridad del entorno
check_environment_integrity() {
    log_security "INFO" "🔍 Verificando integridad del entorno virtual..."
    
    # Verificar que estamos en el directorio correcto
    if [[ ! -f "$SECURITY_CONFIG_FILE" ]]; then
        log_security "ERROR" "❌ Archivo de configuración de seguridad no encontrado"
        return 1
    fi
    
    # Verificar checksums si existe el archivo
    if [[ -f "$INTEGRITY_CHECK_FILE" ]]; then
        log_security "INFO" "Verificando checksums de archivos críticos..."
        
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                local expected_hash=$(echo "$line" | cut -d' ' -f1)
                local file_path=$(echo "$line" | cut -d' ' -f2-)
                
                if [[ -f "$file_path" ]]; then
                    local actual_hash=$(sha256sum "$file_path" 2>/dev/null | cut -d' ' -f1)
                    if [[ "$expected_hash" != "$actual_hash" ]]; then
                        log_security "SECURITY" "❌ Checksum incorrecto para: $file_path"
                        return 1
                    fi
                fi
            fi
        done < "$INTEGRITY_CHECK_FILE"
    fi
    
    # Verificar permisos de archivos críticos
    local critical_files=(
        "Scripts/activate"
        "Scripts/python"
        "Scripts/pip"
        "security_config.json"
        "blacklist.json"
        "whitelist.json"
    )
    
    for file in "${critical_files[@]}"; do
        if [[ -f "$file" ]]; then
            local perms=$(stat -c %a "$file" 2>/dev/null || stat -f %Lp "$file" 2>/dev/null)
            if [[ "$perms" != "644" && "$perms" != "755" ]]; then
                log_security "WARN" "⚠️ Permisos inusuales para: $file ($perms)"
            fi
        fi
    done
    
    log_security "INFO" "✅ Integridad del entorno verificada"
    return 0
}

# Función para verificar dependencias
verify_dependencies() {
    log_security "INFO" "🔍 Verificando dependencias críticas..."
    
    local critical_deps=(
        "pip"
        "setuptools"
        "wheel"
    )
    
    for dep in "${critical_deps[@]}"; do
        if ! python -c "import $dep" 2>/dev/null; then
            log_security "ERROR" "❌ Dependencia crítica faltante: $dep"
            return 1
        fi
    done
    
    log_security "INFO" "✅ Dependencias críticas verificadas"
    return 0
}

# Función para configurar entorno seguro
setup_secure_environment() {
    log_security "INFO" "🔒 Configurando entorno seguro..."
    
    # Configurar variables de entorno para seguridad
    export VENV_SECURE_MODE=1
    export PYTHONHASHSEED=random
    export PYTHONWARNINGS=error
    export PYTHONDONTWRITEBYTECODE=1
    export PYTHONUNBUFFERED=1
    
    # Configurar logging de seguridad
    export SECURITY_LOG_FILE="$VIRTUAL_ENV/security.log"
    
    # Configurar timeout para operaciones
    export PIP_TIMEOUT=300
    export PIP_RETRIES=3
    
    # Configurar variables de seguridad adicionales
    export SECURITY_LEVEL="high"
    export MONITORING_ENABLED=1
    export AUTO_BLOCK_SUSPICIOUS=1
    
    log_security "INFO" "✅ Entorno seguro configurado"
}

# Función para monitoreo de actividad
monitor_activity() {
    local user=$(whoami)
    local hostname=$(hostname)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    log_security "INFO" "📊 Iniciando monitoreo de actividad..."
    log_security "INFO" "Usuario: $user, Host: $hostname, Timestamp: $timestamp"
    
    # Configurar trap para logging de salida
    trap 'log_security "INFO" "Entorno virtual desactivado por usuario $user"; exit' EXIT
    
    # Iniciar monitoreo en background
    (
        while true; do
            # Verificar procesos sospechosos
            check_suspicious_processes
            
            # Verificar uso de recursos
            check_resource_usage
            
            # Verificar conexiones de red
            check_network_connections
            
            sleep 30  # Verificar cada 30 segundos
        done
    ) &
    
    export MONITOR_PID=$!
}

# Función para verificar procesos sospechosos
check_suspicious_processes() {
    local suspicious_patterns=(
        "keylogger"
        "trojan"
        "backdoor"
        "malware"
        "spyware"
        "crypto-miner"
        "network-sniffer"
    )
    
    for pattern in "${suspicious_patterns[@]}"; do
        if pgrep -f "$pattern" >/dev/null 2>&1; then
            log_security "SECURITY" "🚨 Proceso sospechoso detectado: $pattern"
            # Aquí se podría implementar bloqueo automático
        fi
    done
}

# Función para verificar uso de recursos
check_resource_usage() {
    # Verificar uso de CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if (( $(echo "$cpu_usage > 90" | bc -l) )); then
        log_security "WARN" "⚠️ Uso de CPU alto: ${cpu_usage}%"
    fi
    
    # Verificar uso de memoria
    local mem_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    if (( $(echo "$mem_usage > 85" | bc -l) )); then
        log_security "WARN" "⚠️ Uso de memoria alto: ${mem_usage}%"
    fi
}

# Función para verificar conexiones de red
check_network_connections() {
    # Verificar conexiones sospechosas
    local suspicious_ports=(22, 23, 25, 80, 443, 3389, 5900)
    
    for port in "${suspicious_ports[@]}"; do
        local connections=$(netstat -an 2>/dev/null | grep ":$port " | wc -l)
        if [[ $connections -gt 10 ]]; then
            log_security "WARN" "⚠️ Muchas conexiones al puerto $port: $connections"
        fi
    done
}

# Función para cargar configuración de seguridad
load_security_config() {
    if [[ -f "$SECURITY_CONFIG_FILE" ]]; then
        log_security "INFO" "📋 Cargando configuración de seguridad..."
        
        # Extraer configuraciones importantes
        local verify_checksums=$(python -c "import json; print(json.load(open('$SECURITY_CONFIG_FILE'))['security_config']['verify_checksums'])" 2>/dev/null || echo "true")
        local whitelist_only=$(python -c "import json; print(json.load(open('$SECURITY_CONFIG_FILE'))['security_config']['whitelist_only'])" 2>/dev/null || echo "true")
        local monitoring_interval=$(python -c "import json; print(json.load(open('$SECURITY_CONFIG_FILE'))['security_config']['monitoring_interval'])" 2>/dev/null || echo "30")
        
        export SECURITY_VERIFY_CHECKSUMS="$verify_checksums"
        export SECURITY_WHITELIST_ONLY="$whitelist_only"
        export SECURITY_MONITORING_INTERVAL="$monitoring_interval"
        
        log_security "INFO" "✅ Configuración de seguridad cargada"
    else
        log_security "WARN" "⚠️ Archivo de configuración de seguridad no encontrado, usando valores por defecto"
        export SECURITY_VERIFY_CHECKSUMS="true"
        export SECURITY_WHITELIST_ONLY="true"
        export SECURITY_MONITORING_INTERVAL="30"
    fi
}

# Función para verificar lista negra
check_blacklist() {
    if [[ -f "$BLACKLIST_FILE" ]]; then
        log_security "INFO" "🚫 Verificando lista negra de paquetes..."
        
        # Verificar paquetes instalados contra la lista negra
        local installed_packages=$(pip list --format=freeze 2>/dev/null | cut -d'=' -f1 || echo "")
        
        while IFS= read -r package; do
            if [[ -n "$package" ]]; then
                if python -c "import json; blacklist=json.load(open('$BLACKLIST_FILE')); print('$package' in blacklist['packages']['malicious_packages'])" 2>/dev/null | grep -q "True"; then
                    log_security "SECURITY" "🚨 Paquete en lista negra detectado: $package"
                    # Aquí se podría implementar desinstalación automática
                fi
            fi
        done <<< "$installed_packages"
    fi
}

# Función principal
main() {
    echo -e "${BLUE}🚀 Activando entorno virtual seguro para Metaverso Crypto World Virtual 3D${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    # Verificar que estamos en el directorio correcto
    if [[ ! -d "Scripts" ]]; then
        log_security "ERROR" "❌ Este script debe ejecutarse desde el directorio del entorno virtual"
        exit 1
    fi
    
    # Cargar configuración de seguridad
    load_security_config
    
    # Verificar integridad del entorno
    if ! check_environment_integrity; then
        log_security "ERROR" "❌ Fallo en verificación de integridad"
        exit 1
    fi
    
    # Verificar dependencias
    if ! verify_dependencies; then
        log_security "ERROR" "❌ Fallo en verificación de dependencias"
        exit 1
    fi
    
    # Verificar lista negra
    check_blacklist
    
    # Configurar entorno seguro
    setup_secure_environment
    
    # Configurar monitoreo
    monitor_activity
    
    # Activar entorno virtual estándar
    export VIRTUAL_ENV="$(pwd)"
    export PATH="$VIRTUAL_ENV/Scripts:$PATH"
    export PS1="(venv-secure) $PS1"
    
    # Configurar Python
    if [[ -n "${PYTHONHOME:-}" ]]; then
        _OLD_VIRTUAL_PYTHONHOME="${PYTHONHOME:-}"
        unset PYTHONHOME
    fi
    
    # Limpiar hash de comandos
    hash -r 2>/dev/null || true
    
    echo -e "${GREEN}✅ Entorno virtual seguro activado${NC}"
    echo -e "${GREEN}📊 Logs de seguridad: $SECURITY_LOG_FILE${NC}"
    echo -e "${GREEN}🔒 Modo de seguridad: ACTIVADO${NC}"
    echo -e "${GREEN}📈 Monitoreo: ACTIVADO${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Ejecutar función principal
main "$@" 