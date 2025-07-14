#!/bin/bash

# 💾 Backup Completo - Metaverso Web3
# Crea backups de bases de datos, assets, configuraciones y logs

set -e

# Configuración
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="metaverso_backup_$TIMESTAMP"
COMPRESSION="gzip"
RETENTION_DAYS=30

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
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para crear directorio de backup
create_backup_directory() {
    log "${BLUE}📁 Creando directorio de backup...${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "${GREEN}✅ Directorio de backup creado: $BACKUP_DIR${NC}"
    fi
    
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    log "${GREEN}✅ Directorio de backup específico creado: $BACKUP_DIR/$BACKUP_NAME${NC}"
}

# Función para backup de MongoDB
backup_mongodb() {
    log "${BLUE}🗄️  Iniciando backup de MongoDB...${NC}"
    
    if ! command_exists mongodump; then
        log "${YELLOW}⚠️  mongodump no está instalado, saltando backup de MongoDB${NC}"
        return 0
    fi
    
    local mongo_backup_dir="$BACKUP_DIR/$BACKUP_NAME/mongodb"
    mkdir -p "$mongo_backup_dir"
    
    # Obtener variables de entorno o usar valores por defecto
    local mongo_uri=${MONGO_URI:-"mongodb://localhost:27017"}
    local db_name=${MONGO_DB:-"metaverso"}
    
    try {
        mongodump --uri="$mongo_uri" --db="$db_name" --out="$mongo_backup_dir" --gzip
        log "${GREEN}✅ Backup de MongoDB completado${NC}"
        
        # Verificar tamaño del backup
        local backup_size=$(du -sh "$mongo_backup_dir" | cut -f1)
        log "${GREEN}📊 Tamaño del backup MongoDB: $backup_size${NC}"
        
    } catch {
        log "${RED}❌ Error en backup de MongoDB: $error_message${NC}"
        return 1
    }
}

# Función para backup de PostgreSQL
backup_postgresql() {
    log "${BLUE}🗄️  Iniciando backup de PostgreSQL...${NC}"
    
    if ! command_exists pg_dump; then
        log "${YELLOW}⚠️  pg_dump no está instalado, saltando backup de PostgreSQL${NC}"
        return 0
    fi
    
    local pg_backup_dir="$BACKUP_DIR/$BACKUP_NAME/postgresql"
    mkdir -p "$pg_backup_dir"
    
    # Obtener variables de entorno o usar valores por defecto
    local pg_host=${PG_HOST:-"localhost"}
    local pg_port=${PG_PORT:-"5432"}
    local pg_user=${PG_USER:-"postgres"}
    local pg_db=${PG_DB:-"metaverso"}
    
    try {
        PGPASSWORD="$PG_PASSWORD" pg_dump -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$pg_db" --format=custom --file="$pg_backup_dir/metaverso.backup"
        log "${GREEN}✅ Backup de PostgreSQL completado${NC}"
        
        # Verificar tamaño del backup
        local backup_size=$(du -sh "$pg_backup_dir" | cut -f1)
        log "${GREEN}📊 Tamaño del backup PostgreSQL: $backup_size${NC}"
        
    } catch {
        log "${RED}❌ Error en backup de PostgreSQL: $error_message${NC}"
        return 1
    }
}

# Función para backup de Redis
backup_redis() {
    log "${BLUE}🗄️  Iniciando backup de Redis...${NC}"
    
    if ! command_exists redis-cli; then
        log "${YELLOW}⚠️  redis-cli no está instalado, saltando backup de Redis${NC}"
        return 0
    fi
    
    local redis_backup_dir="$BACKUP_DIR/$BACKUP_NAME/redis"
    mkdir -p "$redis_backup_dir"
    
    # Obtener variables de entorno o usar valores por defecto
    local redis_host=${REDIS_HOST:-"localhost"}
    local redis_port=${REDIS_PORT:-"6379"}
    
    try {
        # Crear dump de Redis
        redis-cli -h "$redis_host" -p "$redis_port" BGSAVE
        
        # Esperar a que termine el dump
        sleep 5
        
        # Copiar el archivo dump.rdb
        local redis_dump_path=$(redis-cli -h "$redis_host" -p "$redis_port" CONFIG GET dir | grep -v "dir" | tr -d '\r')
        if [ -f "$redis_dump_path/dump.rdb" ]; then
            cp "$redis_dump_path/dump.rdb" "$redis_backup_dir/"
            log "${GREEN}✅ Backup de Redis completado${NC}"
            
            # Verificar tamaño del backup
            local backup_size=$(du -sh "$redis_backup_dir" | cut -f1)
            log "${GREEN}📊 Tamaño del backup Redis: $backup_size${NC}"
        else
            log "${YELLOW}⚠️  No se encontró archivo dump.rdb de Redis${NC}"
        fi
        
    } catch {
        log "${RED}❌ Error en backup de Redis: $error_message${NC}"
        return 1
    }
}

# Función para backup de archivos de configuración
backup_config_files() {
    log "${BLUE}⚙️  Iniciando backup de archivos de configuración...${NC}"
    
    local config_backup_dir="$BACKUP_DIR/$BACKUP_NAME/config"
    mkdir -p "$config_backup_dir"
    
    # Lista de archivos de configuración importantes
    local config_files=(
        ".env"
        ".env.local"
        ".env.production"
        "package.json"
        "package-lock.json"
        "hardhat.config.js"
        "truffle-config.js"
        "webpack.config.js"
        "vite.config.js"
        "tsconfig.json"
        "tailwind.config.js"
        "postcss.config.js"
        "eslint.config.js"
        ".eslintrc.js"
        "jest.config.js"
        "docker-compose.yml"
        "Dockerfile"
        ".gitignore"
        "README.md"
    )
    
    local copied_files=0
    
    for config_file in "${config_files[@]}"; do
        if [ -f "$config_file" ]; then
            cp "$config_file" "$config_backup_dir/"
            copied_files=$((copied_files + 1))
            log "${GREEN}✅ Copiado: $config_file${NC}"
        fi
    done
    
    # Copiar directorios de configuración
    local config_dirs=(
        "config/"
        ".bin/"
        "scripts/"
        "docs/"
    )
    
    for config_dir in "${config_dirs[@]}"; do
        if [ -d "$config_dir" ]; then
            cp -r "$config_dir" "$config_backup_dir/"
            copied_files=$((copied_files + 1))
            log "${GREEN}✅ Copiado directorio: $config_dir${NC}"
        fi
    done
    
    log "${GREEN}✅ Backup de configuración completado: $copied_files archivos/directorios${NC}"
}

# Función para backup de assets
backup_assets() {
    log "${BLUE}🎨 Iniciando backup de assets...${NC}"
    
    local assets_backup_dir="$BACKUP_DIR/$BACKUP_NAME/assets"
    mkdir -p "$assets_backup_dir"
    
    # Directorios de assets importantes
    local assets_dirs=(
        "assets/"
        "public/"
        "src/assets/"
        "client/public/"
        "client/src/assets/"
    )
    
    local copied_dirs=0
    
    for assets_dir in "${assets_dirs[@]}"; do
        if [ -d "$assets_dir" ]; then
            # Usar rsync para copia eficiente
            if command_exists rsync; then
                rsync -av --exclude='node_modules' --exclude='.git' "$assets_dir" "$assets_backup_dir/"
            else
                cp -r "$assets_dir" "$assets_backup_dir/"
            fi
            copied_dirs=$((copied_dirs + 1))
            log "${GREEN}✅ Copiado directorio de assets: $assets_dir${NC}"
        fi
    done
    
    # Verificar tamaño del backup de assets
    if [ $copied_dirs -gt 0 ]; then
        local assets_size=$(du -sh "$assets_backup_dir" | cut -f1)
        log "${GREEN}📊 Tamaño del backup de assets: $assets_size${NC}"
    fi
    
    log "${GREEN}✅ Backup de assets completado: $copied_dirs directorios${NC}"
}

# Función para backup de logs
backup_logs() {
    log "${BLUE}📝 Iniciando backup de logs...${NC}"
    
    local logs_backup_dir="$BACKUP_DIR/$BACKUP_NAME/logs"
    mkdir -p "$logs_backup_dir"
    
    # Buscar archivos de log
    local log_files=$(find . -name "*.log" -type f 2>/dev/null || true)
    local copied_logs=0
    
    if [ -n "$log_files" ]; then
        echo "$log_files" | while read -r log_file; do
            # Crear estructura de directorios en el backup
            local relative_path=$(dirname "$log_file")
            local backup_log_dir="$logs_backup_dir/$relative_path"
            mkdir -p "$backup_log_dir"
            
            cp "$log_file" "$backup_log_dir/"
            copied_logs=$((copied_logs + 1))
            log "${GREEN}✅ Copiado log: $log_file${NC}"
        done
    fi
    
    # Copiar directorios de logs específicos
    local log_dirs=(
        "logs/"
        ".bin/logs/"
        "data/logs/"
    )
    
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            cp -r "$log_dir" "$logs_backup_dir/"
            copied_logs=$((copied_logs + 1))
            log "${GREEN}✅ Copiado directorio de logs: $log_dir${NC}"
        fi
    done
    
    log "${GREEN}✅ Backup de logs completado: $copied_logs archivos/directorios${NC}"
}

# Función para backup de código fuente
backup_source_code() {
    log "${BLUE}💻 Iniciando backup de código fuente...${NC}"
    
    local source_backup_dir="$BACKUP_DIR/$BACKUP_NAME/source"
    mkdir -p "$source_backup_dir"
    
    # Directorios de código fuente importantes
    local source_dirs=(
        "src/"
        "client/src/"
        "assets/src/"
        "components/src/"
        "entities/src/"
        "fonts/src/"
        "helpers/src/"
        "image/src/"
        "languages/src/"
        "lib/"
        "services/"
        "middlewares/"
        "models/"
        "pages/"
        "web/"
    )
    
    local copied_dirs=0
    
    for source_dir in "${source_dirs[@]}"; do
        if [ -d "$source_dir" ]; then
            # Usar rsync para excluir node_modules y .git
            if command_exists rsync; then
                rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='build' "$source_dir" "$source_backup_dir/"
            else
                cp -r "$source_dir" "$source_backup_dir/"
            fi
            copied_dirs=$((copied_dirs + 1))
            log "${GREEN}✅ Copiado directorio de código: $source_dir${NC}"
        fi
    done
    
    log "${GREEN}✅ Backup de código fuente completado: $copied_dirs directorios${NC}"
}

# Función para crear archivo de metadatos
create_metadata() {
    log "${BLUE}📋 Creando archivo de metadatos...${NC}"
    
    local metadata_file="$BACKUP_DIR/$BACKUP_NAME/metadata.json"
    
    # Información del sistema
    local system_info=$(uname -a)
    local disk_usage=$(df -h . | tail -1)
    local memory_info=$(free -h | head -2 | tail -1)
    
    # Información del backup
    local backup_info=$(cat <<EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "created_by": "$(whoami)",
    "hostname": "$(hostname)",
    "system_info": "$system_info",
    "disk_usage": "$disk_usage",
    "memory_info": "$memory_info",
    "backup_components": {
        "mongodb": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/mongodb" ]; then echo "true"; else echo "false"; fi),
        "postgresql": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/postgresql" ]; then echo "true"; else echo "false"; fi),
        "redis": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/redis" ]; then echo "true"; else echo "false"; fi),
        "config": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/config" ]; then echo "true"; else echo "false"; fi),
        "assets": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/assets" ]; then echo "true"; else echo "false"; fi),
        "logs": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/logs" ]; then echo "true"; else echo "false"; fi),
        "source": $(if [ -d "$BACKUP_DIR/$BACKUP_NAME/source" ]; then echo "true"; else echo "false"; fi)
    },
    "backup_size": "$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)",
    "compression": "$COMPRESSION"
}
EOF
)
    
    echo "$backup_info" > "$metadata_file"
    log "${GREEN}✅ Metadatos creados: $metadata_file${NC}"
}

# Función para comprimir backup
compress_backup() {
    log "${BLUE}🗜️  Comprimiendo backup...${NC}"
    
    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    local compressed_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    try {
        tar -czf "$compressed_file" -C "$BACKUP_DIR" "$BACKUP_NAME"
        log "${GREEN}✅ Backup comprimido: $compressed_file${NC}"
        
        # Verificar tamaño del archivo comprimido
        local compressed_size=$(du -sh "$compressed_file" | cut -f1)
        log "${GREEN}📊 Tamaño del archivo comprimido: $compressed_size${NC}"
        
        # Eliminar directorio sin comprimir
        rm -rf "$backup_path"
        log "${GREEN}✅ Directorio temporal eliminado${NC}"
        
    } catch {
        log "${RED}❌ Error comprimiendo backup: $error_message${NC}"
        return 1
    }
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log "${BLUE}🧹 Limpiando backups antiguos...${NC}"
    
    if [ -d "$BACKUP_DIR" ]; then
        # Encontrar backups más antiguos que RETENTION_DAYS
        local old_backups=$(find "$BACKUP_DIR" -name "metaverso_backup_*.tar.gz" -mtime +$RETENTION_DAYS 2>/dev/null || true)
        
        if [ -n "$old_backups" ]; then
            local deleted_count=0
            echo "$old_backups" | while read -r old_backup; do
                rm -f "$old_backup"
                deleted_count=$((deleted_count + 1))
                log "${YELLOW}🗑️  Eliminado backup antiguo: $(basename "$old_backup")${NC}"
            done
            log "${GREEN}✅ Limpieza completada: $deleted_count backups eliminados${NC}"
        else
            log "${GREEN}✅ No hay backups antiguos para eliminar${NC}"
        fi
    fi
}

# Función para verificar integridad del backup
verify_backup() {
    log "${BLUE}🔍 Verificando integridad del backup...${NC}"
    
    local compressed_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    if [ -f "$compressed_file" ]; then
        try {
            # Verificar que el archivo se puede extraer
            tar -tzf "$compressed_file" > /dev/null
            log "${GREEN}✅ Verificación de integridad exitosa${NC}"
            
            # Mostrar contenido del backup
            log "${BLUE}📋 Contenido del backup:${NC}"
            tar -tzf "$compressed_file" | head -10 | while read -r file; do
                log "   $file"
            done
            
        } catch {
            log "${RED}❌ Error en verificación de integridad: $error_message${NC}"
            return 1
        }
    else
        log "${RED}❌ Archivo de backup no encontrado${NC}"
        return 1
    fi
}

# Función principal de backup
main() {
    log "💾 INICIANDO BACKUP COMPLETO DEL METAVERSO"
    log "=========================================="
    
    local start_time=$(date +%s)
    local errors=0
    
    # Crear directorio de backup
    create_backup_directory
    
    # Ejecutar backups
    log "\n🗄️  BACKUP DE BASES DE DATOS"
    log "---------------------------"
    
    backup_mongodb || ((errors++))
    backup_postgresql || ((errors++))
    backup_redis || ((errors++))
    
    log "\n📁 BACKUP DE ARCHIVOS"
    log "-------------------"
    
    backup_config_files || ((errors++))
    backup_assets || ((errors++))
    backup_logs || ((errors++))
    backup_source_code || ((errors++))
    
    # Crear metadatos
    create_metadata
    
    # Comprimir backup
    log "\n🗜️  COMPRESIÓN"
    log "------------"
    compress_backup || ((errors++))
    
    # Verificar integridad
    log "\n🔍 VERIFICACIÓN"
    log "--------------"
    verify_backup || ((errors++))
    
    # Limpiar backups antiguos
    log "\n🧹 LIMPIEZA"
    log "----------"
    cleanup_old_backups
    
    # Resumen final
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "\n📊 RESUMEN DEL BACKUP"
    log "===================="
    log "Duración total: ${duration}s"
    log "Errores encontrados: $errors"
    log "Archivo de backup: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    if [ $errors -eq 0 ]; then
        log "${GREEN}🎉 BACKUP COMPLETADO EXITOSAMENTE${NC}"
        log "${GREEN}✅ Todos los componentes fueron respaldados correctamente${NC}"
        exit 0
    else
        log "${RED}⚠️  BACKUP COMPLETADO CON $errors ERROR(ES)${NC}"
        log "${YELLOW}📋 Revisa el log para más detalles: $BACKUP_DIR/backup.log${NC}"
        exit 1
    fi
}

# Ejecutar backup
main "$@" 