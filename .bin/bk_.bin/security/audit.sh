#!/bin/bash

# 🔒 Auditoría de Seguridad Completa - Metaverso Web3
# Verifica dependencias, vulnerabilidades, configuraciones y smart contracts

set -e

# Configuración
LOG_FILE="security-audit-$(date +%Y%m%d-%H%M%S).log"
REPORT_FILE="security-report-$(date +%Y%m%d-%H%M%S).json"
TIMEOUT=60

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

# Función para verificar dependencias de Node.js
audit_npm_dependencies() {
    log "${BLUE}🔍 Verificando dependencias de Node.js...${NC}"
    
    if ! command_exists npm; then
        log "${RED}❌ npm no está instalado${NC}"
        return 1
    fi
    
    local audit_result=0
    
    # Ejecutar npm audit
    if npm audit --audit-level=moderate --json > npm-audit.json 2>/dev/null; then
        local vulnerabilities=$(jq -r '.metadata.vulnerabilities.total // 0' npm-audit.json 2>/dev/null || echo "0")
        
        if [ "$vulnerabilities" -eq 0 ]; then
            log "${GREEN}✅ npm audit: Sin vulnerabilidades encontradas${NC}"
        else
            log "${RED}❌ npm audit: $vulnerabilities vulnerabilidades encontradas${NC}"
            audit_result=1
        fi
    else
        log "${YELLOW}⚠️  npm audit: Error al ejecutar auditoría${NC}"
        audit_result=1
    fi
    
    # Verificar dependencias desactualizadas
    log "${BLUE}🔍 Verificando dependencias desactualizadas...${NC}"
    if npm outdated --json > npm-outdated.json 2>/dev/null; then
        local outdated_count=$(jq 'length' npm-outdated.json 2>/dev/null || echo "0")
        
        if [ "$outdated_count" -eq 0 ]; then
            log "${GREEN}✅ npm outdated: Todas las dependencias están actualizadas${NC}"
        else
            log "${YELLOW}⚠️  npm outdated: $outdated_count dependencias desactualizadas${NC}"
        fi
    fi
    
    return $audit_result
}

# Función para verificar dependencias de Python
audit_python_dependencies() {
    log "${BLUE}🔍 Verificando dependencias de Python...${NC}"
    
    if ! command_exists pip; then
        log "${YELLOW}⚠️  pip no está instalado${NC}"
        return 0
    fi
    
    local audit_result=0
    
    # Verificar si safety está instalado
    if ! command_exists safety; then
        log "${YELLOW}⚠️  safety no está instalado. Instalando...${NC}"
        pip install safety
    fi
    
    # Ejecutar safety check
    if safety check --json > safety-report.json 2>/dev/null; then
        local vulnerabilities=$(jq 'length' safety-report.json 2>/dev/null || echo "0")
        
        if [ "$vulnerabilities" -eq 0 ]; then
            log "${GREEN}✅ safety: Sin vulnerabilidades encontradas${NC}"
        else
            log "${RED}❌ safety: $vulnerabilities vulnerabilidades encontradas${NC}"
            audit_result=1
        fi
    else
        log "${YELLOW}⚠️  safety: Error al ejecutar auditoría${NC}"
        audit_result=1
    fi
    
    return $audit_result
}

# Función para verificar smart contracts
audit_smart_contracts() {
    log "${BLUE}🔍 Verificando smart contracts...${NC}"
    
    local audit_result=0
    
    # Verificar si slither está instalado
    if ! command_exists slither; then
        log "${YELLOW}⚠️  slither no está instalado. Instalando...${NC}"
        pip install slither-analyzer
    fi
    
    # Buscar archivos .sol
    local sol_files=$(find . -name "*.sol" -type f 2>/dev/null || true)
    
    if [ -z "$sol_files" ]; then
        log "${YELLOW}⚠️  No se encontraron archivos .sol${NC}"
        return 0
    fi
    
    log "${BLUE}🔍 Encontrados $(echo "$sol_files" | wc -l) archivos .sol${NC}"
    
    # Ejecutar slither en cada archivo
    echo "$sol_files" | while read -r file; do
        log "${BLUE}🔍 Analizando $file...${NC}"
        
        if slither "$file" --json slither-report.json 2>/dev/null; then
            local issues=$(jq '.results.detectors | length' slither-report.json 2>/dev/null || echo "0")
            
            if [ "$issues" -eq 0 ]; then
                log "${GREEN}✅ $file: Sin problemas de seguridad${NC}"
            else
                log "${RED}❌ $file: $issues problemas de seguridad${NC}"
                audit_result=1
            fi
        else
            log "${YELLOW}⚠️  $file: Error al analizar${NC}"
            audit_result=1
        fi
    done
    
    return $audit_result
}

# Función para verificar configuraciones de seguridad
audit_security_config() {
    log "${BLUE}🔍 Verificando configuraciones de seguridad...${NC}"
    
    local audit_result=0
    
    # Verificar archivos de configuración
    local config_files=(
        ".env"
        ".env.local"
        ".env.production"
        "package.json"
        "hardhat.config.js"
        "truffle-config.js"
    )
    
    for config in "${config_files[@]}"; do
        if [ -f "$config" ]; then
            log "${BLUE}🔍 Verificando $config...${NC}"
            
            # Verificar claves privadas expuestas
            if grep -q "PRIVATE_KEY\|SECRET_KEY\|API_KEY" "$config" 2>/dev/null; then
                log "${RED}❌ $config: Posibles claves privadas expuestas${NC}"
                audit_result=1
            else
                log "${GREEN}✅ $config: Sin claves privadas expuestas${NC}"
            fi
            
            # Verificar permisos de archivo
            local perms=$(stat -c "%a" "$config" 2>/dev/null || stat -f "%Lp" "$config" 2>/dev/null)
            if [ "$perms" = "600" ] || [ "$perms" = "400" ]; then
                log "${GREEN}✅ $config: Permisos seguros ($perms)${NC}"
            else
                log "${YELLOW}⚠️  $config: Permisos inseguros ($perms)${NC}"
            fi
        fi
    done
    
    return $audit_result
}

# Función para verificar puertos abiertos
audit_open_ports() {
    log "${BLUE}🔍 Verificando puertos abiertos...${NC}"
    
    local audit_result=0
    
    # Puertos que deberían estar cerrados
    local dangerous_ports=(22 21 23 25 53 80 443 3306 5432 27017 6379)
    
    for port in "${dangerous_ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            log "${YELLOW}⚠️  Puerto $port está abierto${NC}"
            audit_result=1
        else
            log "${GREEN}✅ Puerto $port está cerrado${NC}"
        fi
    done
    
    return $audit_result
}

# Función para verificar archivos de log
audit_log_files() {
    log "${BLUE}🔍 Verificando archivos de log...${NC}"
    
    local audit_result=0
    
    # Buscar archivos de log
    local log_files=$(find . -name "*.log" -type f 2>/dev/null || true)
    
    if [ -n "$log_files" ]; then
        log "${BLUE}🔍 Encontrados $(echo "$log_files" | wc -l) archivos de log${NC}"
        
        echo "$log_files" | while read -r file; do
            # Verificar si contiene información sensible
            if grep -q "password\|token\|key\|secret" "$file" 2>/dev/null; then
                log "${RED}❌ $file: Contiene información sensible${NC}"
                audit_result=1
            else
                log "${GREEN}✅ $file: Sin información sensible${NC}"
            fi
            
            # Verificar permisos
            local perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%Lp" "$file" 2>/dev/null)
            if [ "$perms" = "600" ] || [ "$perms" = "400" ]; then
                log "${GREEN}✅ $file: Permisos seguros ($perms)${NC}"
            else
                log "${YELLOW}⚠️  $file: Permisos inseguros ($perms)${NC}"
            fi
        done
    else
        log "${GREEN}✅ No se encontraron archivos de log${NC}"
    fi
    
    return $audit_result
}

# Función para verificar SSL/TLS
audit_ssl_tls() {
    log "${BLUE}🔍 Verificando certificados SSL/TLS...${NC}"
    
    local audit_result=0
    
    # Verificar si openssl está disponible
    if ! command_exists openssl; then
        log "${YELLOW}⚠️  openssl no está instalado${NC}"
        return 0
    fi
    
    # Verificar certificados locales
    local cert_files=$(find . -name "*.pem" -o -name "*.crt" -o -name "*.key" 2>/dev/null || true)
    
    if [ -n "$cert_files" ]; then
        log "${BLUE}🔍 Encontrados $(echo "$cert_files" | wc -l) archivos de certificados${NC}"
        
        echo "$cert_files" | while read -r file; do
            if [[ "$file" == *.key ]]; then
                # Verificar permisos de clave privada
                local perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%Lp" "$file" 2>/dev/null)
                if [ "$perms" = "600" ]; then
                    log "${GREEN}✅ $file: Permisos seguros para clave privada${NC}"
                else
                    log "${RED}❌ $file: Permisos inseguros para clave privada ($perms)${NC}"
                    audit_result=1
                fi
            fi
        done
    fi
    
    return $audit_result
}

# Función para generar reporte JSON
generate_security_report() {
    local total_checks=$1
    local failed_checks=$2
    
    local report=$(cat <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "audit_duration": "$((SECONDS))s",
    "summary": {
        "total_checks": $total_checks,
        "passed_checks": $((total_checks - failed_checks)),
        "failed_checks": $failed_checks,
        "security_score": $((100 - (failed_checks * 100 / total_checks)))
    },
    "checks": {
        "npm_dependencies": $(if [ $npm_result -eq 0 ]; then echo "true"; else echo "false"; fi),
        "python_dependencies": $(if [ $python_result -eq 0 ]; then echo "true"; else echo "false"; fi),
        "smart_contracts": $(if [ $contracts_result -eq 0 ]; then echo "true"; else echo "false"; fi),
        "security_config": $(if [ $config_result -eq 0 ]; then echo "true"; else echo "false"; fi),
        "open_ports": $(if [ $ports_result -eq 0 ]; then echo "true"; else echo "false"; fi),
        "log_files": $(if [ $logs_result -eq 0 ]; then echo "true"; else echo "false"; fi),
        "ssl_tls": $(if [ $ssl_result -eq 0 ]; then echo "true"; else echo "false"; fi)
    },
    "recommendations": [
        $(if [ $npm_result -ne 0 ]; then echo '"Actualizar dependencias de Node.js con vulnerabilidades"'; fi)
        $(if [ $python_result -ne 0 ]; then echo ',"Actualizar dependencias de Python con vulnerabilidades"'; fi)
        $(if [ $contracts_result -ne 0 ]; then echo ',"Revisar y corregir problemas en smart contracts"'; fi)
        $(if [ $config_result -ne 0 ]; then echo ',"Revisar configuraciones de seguridad"'; fi)
        $(if [ $ports_result -ne 0 ]; then echo ',"Cerrar puertos innecesarios"'; fi)
        $(if [ $logs_result -ne 0 ]; then echo ',"Revisar archivos de log por información sensible"'; fi)
        $(if [ $ssl_result -ne 0 ]; then echo ',"Revisar permisos de certificados SSL/TLS"'; fi)
    ]
}
EOF
)
    
    echo "$report" > "$REPORT_FILE"
    log "${GREEN}📄 Reporte guardado en: $REPORT_FILE${NC}"
}

# Función principal de auditoría
main() {
    log "🔒 INICIANDO AUDITORÍA DE SEGURIDAD COMPLETA"
    log "============================================"
    
    SECONDS=0
    local total_checks=7
    local failed_checks=0
    
    # Ejecutar auditorías
    audit_npm_dependencies
    local npm_result=$?
    [ $npm_result -ne 0 ] && ((failed_checks++))
    
    audit_python_dependencies
    local python_result=$?
    [ $python_result -ne 0 ] && ((failed_checks++))
    
    audit_smart_contracts
    local contracts_result=$?
    [ $contracts_result -ne 0 ] && ((failed_checks++))
    
    audit_security_config
    local config_result=$?
    [ $config_result -ne 0 ] && ((failed_checks++))
    
    audit_open_ports
    local ports_result=$?
    [ $ports_result -ne 0 ] && ((failed_checks++))
    
    audit_log_files
    local logs_result=$?
    [ $logs_result -ne 0 ] && ((failed_checks++))
    
    audit_ssl_tls
    local ssl_result=$?
    [ $ssl_result -ne 0 ] && ((failed_checks++))
    
    # Generar reporte
    log "\n📊 RESUMEN DE LA AUDITORÍA DE SEGURIDAD"
    log "======================================="
    log "Total de verificaciones: $total_checks"
    log "Verificaciones exitosas: $((total_checks - failed_checks))"
    log "Verificaciones fallidas: $failed_checks"
    log "Duración: ${SECONDS}s"
    
    # Generar reporte JSON
    generate_security_report $total_checks $failed_checks
    
    if [ $failed_checks -eq 0 ]; then
        log "${GREEN}🎉 AUDITORÍA DE SEGURIDAD EXITOSA${NC}"
        log "${GREEN}✅ No se encontraron problemas de seguridad críticos${NC}"
        exit 0
    else
        log "${RED}⚠️  SE ENCONTRARON $failed_checks PROBLEMAS DE SEGURIDAD${NC}"
        log "${YELLOW}📋 Revisa el reporte completo: $REPORT_FILE${NC}"
        exit 1
    fi
}

# Ejecutar auditoría
main "$@" 