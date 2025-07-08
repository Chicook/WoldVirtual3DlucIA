#!/bin/bash

# Version Control Script para Workflows del Metaverso
# Script complementario para gestión de versiones

set -e

VERSION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWS_DIR="$(dirname "$VERSION_DIR")"
METADATA_FILE="$VERSION_DIR/version-metadata.json"
VERSIONS_DIR="$VERSION_DIR/versions"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[$timestamp] [INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[$timestamp] [WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] [ERROR]${NC} $message"
            ;;
        "DEBUG")
            echo -e "${BLUE}[$timestamp] [DEBUG]${NC} $message"
            ;;
    esac
    
    # Guardar en log file
    echo "[$timestamp] [$level] $message" >> "$VERSION_DIR/version-control.log"
}

# Función para inicializar el sistema de versiones
init_version_system() {
    log "INFO" "Inicializando sistema de versiones..."
    
    # Crear directorios necesarios
    mkdir -p "$VERSIONS_DIR"
    
    # Crear archivo de metadatos si no existe
    if [[ ! -f "$METADATA_FILE" ]]; then
        echo "{}" > "$METADATA_FILE"
        log "INFO" "Archivo de metadatos creado"
    fi
    
    log "INFO" "Sistema de versiones inicializado"
}

# Función para crear una versión
create_version() {
    local workflow_name=$1
    local version=$2
    local description=${3:-""}
    local tags=${4:-""}
    
    if [[ -z "$workflow_name" || -z "$version" ]]; then
        log "ERROR" "Uso: create_version <workflow_name> <version> [description] [tags]"
        return 1
    fi
    
    local workflow_file="$WORKFLOWS_DIR/${workflow_name}.yml"
    
    if [[ ! -f "$workflow_file" ]]; then
        log "ERROR" "Workflow $workflow_name no encontrado"
        return 1
    fi
    
    log "INFO" "Creando versión $version para $workflow_name"
    
    # Crear directorio para el workflow
    local workflow_versions_dir="$VERSIONS_DIR/$workflow_name"
    mkdir -p "$workflow_versions_dir"
    
    # Copiar archivo
    cp "$workflow_file" "$workflow_versions_dir/${version}.yml"
    
    # Crear metadatos
    local metadata="{
        \"version\": \"$version\",
        \"description\": \"$description\",
        \"tags\": [\"${tags//,/\",\"}\"],
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"author\": \"$(whoami)\",
        \"size\": $(stat -c%s "$workflow_file"),
        \"workflow\": \"$workflow_name\"
    }"
    
    echo "$metadata" > "$workflow_versions_dir/${version}.json"
    
    # Actualizar metadatos globales
    node -e "
        const fs = require('fs');
        const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
        if (!metadata['$workflow_name']) metadata['$workflow_name'] = [];
        metadata['$workflow_name'].push($metadata);
        metadata['$workflow_name'].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        fs.writeFileSync('$METADATA_FILE', JSON.stringify(metadata, null, 2));
    "
    
    log "INFO" "Versión $version creada exitosamente"
}

# Función para listar versiones
list_versions() {
    local workflow_name=$1
    
    if [[ ! -f "$METADATA_FILE" ]]; then
        log "ERROR" "Archivo de metadatos no encontrado"
        return 1
    fi
    
    if [[ -n "$workflow_name" ]]; then
        log "INFO" "Versiones de $workflow_name:"
        node -e "
            const fs = require('fs');
            const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
            const versions = metadata['$workflow_name'] || [];
            versions.forEach(v => {
                console.log(\`  \${v.version} - \${v.description} (\${v.timestamp})\`);
            });
        "
    else
        log "INFO" "Workflows con versiones:"
        node -e "
            const fs = require('fs');
            const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
            Object.entries(metadata).forEach(([wf, vers]) => {
                console.log(\`  \${wf}: \${vers.length} versiones\`);
            });
        "
    fi
}

# Función para restaurar una versión
restore_version() {
    local workflow_name=$1
    local version=$2
    
    if [[ -z "$workflow_name" || -z "$version" ]]; then
        log "ERROR" "Uso: restore_version <workflow_name> <version>"
        return 1
    fi
    
    local version_file="$VERSIONS_DIR/$workflow_name/${version}.yml"
    local workflow_file="$WORKFLOWS_DIR/${workflow_name}.yml"
    
    if [[ ! -f "$version_file" ]]; then
        log "ERROR" "Versión $version de $workflow_name no encontrada"
        return 1
    fi
    
    log "INFO" "Restaurando versión $version para $workflow_name"
    
    # Crear backup de la versión actual
    if [[ -f "$workflow_file" ]]; then
        local backup_version="backup-$(date +%Y%m%d-%H%M%S)"
        create_version "$workflow_name" "$backup_version" "Backup automático antes de restaurar" "backup"
    fi
    
    # Restaurar versión
    cp "$version_file" "$workflow_file"
    
    log "INFO" "Versión $version restaurada exitosamente"
}

# Función para comparar versiones
compare_versions() {
    local workflow_name=$1
    local version1=$2
    local version2=$3
    
    if [[ -z "$workflow_name" || -z "$version1" || -z "$version2" ]]; then
        log "ERROR" "Uso: compare_versions <workflow_name> <version1> <version2>"
        return 1
    fi
    
    local file1="$VERSIONS_DIR/$workflow_name/${version1}.yml"
    local file2="$VERSIONS_DIR/$workflow_name/${version2}.yml"
    
    if [[ ! -f "$file1" ]]; then
        log "ERROR" "Versión $version1 no encontrada"
        return 1
    fi
    
    if [[ ! -f "$file2" ]]; then
        log "ERROR" "Versión $version2 no encontrada"
        return 1
    fi
    
    log "INFO" "Comparando versiones $version1 y $version2 de $workflow_name"
    
    # Usar diff para comparar
    if command -v diff >/dev/null 2>&1; then
        diff -u "$file1" "$file2" || true
    else
        log "WARN" "Comando diff no disponible, mostrando diferencias básicas"
        # Comparación básica línea por línea
        local lines1=$(wc -l < "$file1")
        local lines2=$(wc -l < "$file2")
        echo "Líneas en $version1: $lines1"
        echo "Líneas en $version2: $lines2"
    fi
}

# Función para eliminar una versión
delete_version() {
    local workflow_name=$1
    local version=$2
    
    if [[ -z "$workflow_name" || -z "$version" ]]; then
        log "ERROR" "Uso: delete_version <workflow_name> <version>"
        return 1
    fi
    
    local version_file="$VERSIONS_DIR/$workflow_name/${version}.yml"
    local metadata_file="$VERSIONS_DIR/$workflow_name/${version}.json"
    
    if [[ ! -f "$version_file" ]]; then
        log "ERROR" "Versión $version de $workflow_name no encontrada"
        return 1
    fi
    
    log "INFO" "Eliminando versión $version de $workflow_name"
    
    # Eliminar archivos
    rm -f "$version_file" "$metadata_file"
    
    # Actualizar metadatos globales
    node -e "
        const fs = require('fs');
        const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
        if (metadata['$workflow_name']) {
            metadata['$workflow_name'] = metadata['$workflow_name'].filter(v => v.version !== '$version');
        }
        fs.writeFileSync('$METADATA_FILE', JSON.stringify(metadata, null, 2));
    "
    
    log "INFO" "Versión $version eliminada exitosamente"
}

# Función para mostrar estadísticas
show_stats() {
    if [[ ! -f "$METADATA_FILE" ]]; then
        log "ERROR" "Archivo de metadatos no encontrado"
        return 1
    fi
    
    log "INFO" "Estadísticas del sistema de versiones:"
    
    node -e "
        const fs = require('fs');
        const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
        
        const totalWorkflows = Object.keys(metadata).length;
        const totalVersions = Object.values(metadata).reduce((sum, versions) => sum + versions.length, 0);
        const totalSize = Object.values(metadata).flat().reduce((sum, v) => sum + (v.size || 0), 0);
        
        console.log(\`  Total workflows: \${totalWorkflows}\`);
        console.log(\`  Total versiones: \${totalVersions}\`);
        console.log(\`  Tamaño total: \${(totalSize / 1024).toFixed(2)} KB\`);
        
        Object.entries(metadata).forEach(([wf, versions]) => {
            console.log(\`  \${wf}: \${versions.length} versiones\`);
        });
    "
}

# Función para limpiar versiones antiguas
cleanup_old_versions() {
    local max_versions=${1:-5}
    
    log "INFO" "Limpiando versiones antiguas (máximo $max_versions por workflow)"
    
    node -e "
        const fs = require('fs');
        const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
        
        Object.entries(metadata).forEach(([workflow, versions]) => {
            if (versions.length > $max_versions) {
                const toRemove = versions.slice($max_versions);
                toRemove.forEach(v => {
                    const versionFile = '$VERSIONS_DIR/' + workflow + '/' + v.version + '.yml';
                    const metadataFile = '$VERSIONS_DIR/' + workflow + '/' + v.version + '.json';
                    
                    if (fs.existsSync(versionFile)) fs.unlinkSync(versionFile);
                    if (fs.existsSync(metadataFile)) fs.unlinkSync(metadataFile);
                    
                    console.log(\`Eliminada versión \${v.version} de \${workflow}\`);
                });
                
                metadata[workflow] = versions.slice(0, $max_versions);
            }
        });
        
        fs.writeFileSync('$METADATA_FILE', JSON.stringify(metadata, null, 2));
    "
    
    log "INFO" "Limpieza completada"
}

# Función principal
main() {
    local command=$1
    shift
    
    case $command in
        "init")
            init_version_system
            ;;
        "create")
            create_version "$@"
            ;;
        "list")
            list_versions "$@"
            ;;
        "restore")
            restore_version "$@"
            ;;
        "compare")
            compare_versions "$@"
            ;;
        "delete")
            delete_version "$@"
            ;;
        "stats")
            show_stats
            ;;
        "cleanup")
            cleanup_old_versions "$@"
            ;;
        *)
            echo -e "${BLUE}Version Control Script - Comandos disponibles:${NC}"
            echo "  init                                    - Inicializar sistema"
            echo "  create <workflow> <version> [desc] [tags] - Crear versión"
            echo "  list [workflow]                         - Listar versiones"
            echo "  restore <workflow> <version>            - Restaurar versión"
            echo "  compare <workflow> <v1> <v2>            - Comparar versiones"
            echo "  delete <workflow> <version>             - Eliminar versión"
            echo "  stats                                   - Mostrar estadísticas"
            echo "  cleanup [max_versions]                  - Limpiar versiones antiguas"
            ;;
    esac
}

# Ejecutar función principal
main "$@" 