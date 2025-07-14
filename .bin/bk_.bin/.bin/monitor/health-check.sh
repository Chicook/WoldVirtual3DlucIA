#!/bin/bash

# 🏥 Health Check Completo - Metaverso Web3
# Verifica el estado de todos los servicios críticos

set -e

# Configuración
LOG_FILE="health-check-$(date +%Y%m%d-%H%M%S).log"
TIMEOUT=30
RETRY_COUNT=3

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función para verificar endpoint HTTP
check_http_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    log "${BLUE}🔍 Verificando $name...${NC}"
    
    for i in $(seq 1 $RETRY_COUNT); do
        if curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" | grep -q "$expected_status"; then
            log "${GREEN}✅ $name: OK${NC}"
            return 0
        else
            log "${YELLOW}⚠️  $name: Intento $i/$RETRY_COUNT falló${NC}"
            if [ $i -lt $RETRY_COUNT ]; then
                sleep 2
            fi
        fi
    done
    
    log "${RED}❌ $name: FAILED${NC}"
    return 1
}

# Función para verificar proceso
check_process() {
    local process_name=$1
    local display_name=$2
    
    log "${BLUE}🔍 Verificando $display_name...${NC}"
    
    if pgrep -f "$process_name" > /dev/null; then
        log "${GREEN}✅ $display_name: RUNNING${NC}"
        return 0
    else
        log "${RED}❌ $display_name: NOT RUNNING${NC}"
        return 1
    fi
}

# Función para verificar puerto
check_port() {
    local port=$1
    local service_name=$2
    
    log "${BLUE}🔍 Verificando $service_name (puerto $port)...${NC}"
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        log "${GREEN}✅ $service_name: LISTENING${NC}"
        return 0
    else
        log "${RED}❌ $service_name: NOT LISTENING${NC}"
        return 1
    fi
}

# Función para verificar base de datos
check_database() {
    local db_type=$1
    local connection_string=$2
    
    log "${BLUE}🔍 Verificando base de datos $db_type...${NC}"
    
    case $db_type in
        "mongodb")
            if command -v mongo >/dev/null 2>&1; then
                if mongo --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
                    log "${GREEN}✅ MongoDB: CONNECTED${NC}"
                    return 0
                fi
            fi
            ;;
        "postgres")
            if command -v psql >/dev/null 2>&1; then
                if psql -c "SELECT 1;" >/dev/null 2>&1; then
                    log "${GREEN}✅ PostgreSQL: CONNECTED${NC}"
                    return 0
                fi
            fi
            ;;
        "redis")
            if command -v redis-cli >/dev/null 2>&1; then
                if redis-cli ping >/dev/null 2>&1; then
                    log "${GREEN}✅ Redis: CONNECTED${NC}"
                    return 0
                fi
            fi
            ;;
    esac
    
    log "${RED}❌ $db_type: NOT CONNECTED${NC}"
    return 1
}

# Función para verificar blockchain
check_blockchain() {
    local network=$1
    local rpc_url=$2
    
    log "${BLUE}🔍 Verificando blockchain $network...${NC}"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            --max-time $TIMEOUT "$rpc_url" 2>/dev/null)
        
        if echo "$response" | grep -q '"result"'; then
            log "${GREEN}✅ $network: CONNECTED${NC}"
            return 0
        fi
    fi
    
    log "${RED}❌ $network: NOT CONNECTED${NC}"
    return 1
}

# Función para verificar sistema de archivos
check_filesystem() {
    local path=$1
    local name=$2
    local min_space_gb=${3:-1}
    
    log "${BLUE}🔍 Verificando $name...${NC}"
    
    if [ -d "$path" ]; then
        local available_space=$(df "$path" | awk 'NR==2 {print $4}')
        local available_gb=$((available_space / 1024 / 1024))
        
        if [ $available_gb -ge $min_space_gb ]; then
            log "${GREEN}✅ $name: ${available_gb}GB disponible${NC}"
            return 0
        else
            log "${YELLOW}⚠️  $name: Solo ${available_gb}GB disponible${NC}"
            return 1
        fi
    else
        log "${RED}❌ $name: PATH NOT FOUND${NC}"
        return 1
    fi
}

# Función para verificar memoria del sistema
check_memory() {
    log "${BLUE}🔍 Verificando memoria del sistema...${NC}"
    
    local total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    local used_mem=$(free -m | awk 'NR==2{printf "%.0f", $3/1024}')
    local available_mem=$((total_mem - used_mem))
    local usage_percent=$((used_mem * 100 / total_mem))
    
    if [ $usage_percent -lt 90 ]; then
        log "${GREEN}✅ Memoria: ${usage_percent}% usado (${available_mem}GB disponible)${NC}"
        return 0
    else
        log "${YELLOW}⚠️  Memoria: ${usage_percent}% usado (${available_mem}GB disponible)${NC}"
        return 1
    fi
}

# Función para verificar CPU
check_cpu() {
    log "${BLUE}🔍 Verificando CPU...${NC}"
    
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local cpu_usage_int=${cpu_usage%.*}
    
    if [ $cpu_usage_int -lt 90 ]; then
        log "${GREEN}✅ CPU: ${cpu_usage}% usado${NC}"
        return 0
    else
        log "${YELLOW}⚠️  CPU: ${cpu_usage}% usado${NC}"
        return 1
    fi
}

# Función principal de health check
main() {
    log "🏥 INICIANDO HEALTH CHECK COMPLETO"
    log "=================================="
    
    local failed_checks=0
    local total_checks=0
    
    # Verificar servicios web
    log "\n🌐 VERIFICANDO SERVICIOS WEB"
    log "----------------------------"
    
    check_http_endpoint "http://localhost:3000" "Frontend React" && ((total_checks++)) || ((failed_checks++))
    check_http_endpoint "http://localhost:8000" "Backend API" && ((total_checks++)) || ((failed_checks++))
    check_http_endpoint "http://localhost:8000/health" "Health Endpoint" && ((total_checks++)) || ((failed_checks++))
    
    # Verificar puertos
    log "\n🔌 VERIFICANDO PUERTOS"
    log "----------------------"
    
    check_port 3000 "Frontend" && ((total_checks++)) || ((failed_checks++))
    check_port 8000 "Backend" && ((total_checks++)) || ((failed_checks++))
    check_port 6379 "Redis" && ((total_checks++)) || ((failed_checks++))
    check_port 27017 "MongoDB" && ((total_checks++)) || ((failed_checks++))
    
    # Verificar procesos
    log "\n⚙️  VERIFICANDO PROCESOS"
    log "------------------------"
    
    check_process "node" "Node.js" && ((total_checks++)) || ((failed_checks++))
    check_process "npm" "NPM" && ((total_checks++)) || ((failed_checks++))
    
    # Verificar base de datos
    log "\n🗄️  VERIFICANDO BASE DE DATOS"
    log "----------------------------"
    
    check_database "mongodb" "mongodb://localhost:27017" && ((total_checks++)) || ((failed_checks++))
    check_database "redis" "redis://localhost:6379" && ((total_checks++)) || ((failed_checks++))
    
    # Verificar blockchain
    log "\n⛓️  VERIFICANDO BLOCKCHAIN"
    log "-------------------------"
    
    check_blockchain "Ethereum" "https://mainnet.infura.io/v3/YOUR_PROJECT_ID" && ((total_checks++)) || ((failed_checks++))
    check_blockchain "Polygon" "https://polygon-rpc.com" && ((total_checks++)) || ((failed_checks++))
    
    # Verificar sistema de archivos
    log "\n💾 VERIFICANDO SISTEMA DE ARCHIVOS"
    log "---------------------------------"
    
    check_filesystem "/" "Disco raíz" 5 && ((total_checks++)) || ((failed_checks++))
    check_filesystem "./assets" "Assets" 1 && ((total_checks++)) || ((failed_checks++))
    check_filesystem "./logs" "Logs" 1 && ((total_checks++)) || ((failed_checks++))
    
    # Verificar recursos del sistema
    log "\n🖥️  VERIFICANDO RECURSOS DEL SISTEMA"
    log "-----------------------------------"
    
    check_memory && ((total_checks++)) || ((failed_checks++))
    check_cpu && ((total_checks++)) || ((failed_checks++))
    
    # Resumen final
    log "\n📊 RESUMEN DEL HEALTH CHECK"
    log "==========================="
    log "Total de verificaciones: $total_checks"
    log "Verificaciones exitosas: $((total_checks - failed_checks))"
    log "Verificaciones fallidas: $failed_checks"
    
    if [ $failed_checks -eq 0 ]; then
        log "${GREEN}🎉 TODOS LOS SERVICIOS ESTÁN FUNCIONANDO CORRECTAMENTE${NC}"
        exit 0
    else
        log "${RED}⚠️  HAY $failed_checks SERVICIOS CON PROBLEMAS${NC}"
        log "Revisa el log completo: $LOG_FILE"
        exit 1
    fi
}

# Ejecutar health check
main "$@" 