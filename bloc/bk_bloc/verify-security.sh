#!/bin/bash

# 🔒 SCRIPT DE VERIFICACIÓN DE SEGURIDAD - WOLDVIRTUAL3D BLOCKCHAIN
# Este script verifica que no hay archivos sensibles en el repositorio

echo "🔒 VERIFICACIÓN DE SEGURIDAD - WOLDVIRTUAL3D BLOCKCHAIN"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de archivos sensibles encontrados
SENSITIVE_FILES=0

echo -e "${BLUE}🔍 Verificando archivos sensibles...${NC}"
echo ""

# 1. Verificar archivos .env
echo -e "${YELLOW}📋 Verificando archivos .env...${NC}"
ENV_FILES=$(find . -name ".env*" -type f 2>/dev/null)
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}❌ ARCHIVOS .env ENCONTRADOS:${NC}"
    echo "$ENV_FILES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$ENV_FILES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos .env${NC}"
fi
echo ""

# 2. Verificar claves privadas
echo -e "${YELLOW}🔑 Verificando claves privadas...${NC}"
KEY_FILES=$(find . -name "*.key" -o -name "*.pem" -o -name "*.secret" -o -name "*.crt" 2>/dev/null)
if [ -n "$KEY_FILES" ]; then
    echo -e "${RED}❌ ARCHIVOS DE CLAVES ENCONTRADOS:${NC}"
    echo "$KEY_FILES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$KEY_FILES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos de claves${NC}"
fi
echo ""

# 3. Verificar directorios de wallets
echo -e "${YELLOW}💰 Verificando directorios de wallets...${NC}"
WALLET_DIRS=$(find . -name "wallets" -type d 2>/dev/null)
if [ -n "$WALLET_DIRS" ]; then
    echo -e "${RED}❌ DIRECTORIOS DE WALLETS ENCONTRADOS:${NC}"
    echo "$WALLET_DIRS"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$WALLET_DIRS" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron directorios de wallets${NC}"
fi
echo ""

# 4. Verificar archivos de configuración local
echo -e "${YELLOW}⚙️ Verificando archivos de configuración local...${NC}"
LOCAL_CONFIGS=$(find . -name "*local*" -name "*.json" -o -name "*local*" -name "*.js" -o -name "*local*" -name "*.toml" 2>/dev/null)
if [ -n "$LOCAL_CONFIGS" ]; then
    echo -e "${RED}❌ ARCHIVOS DE CONFIGURACIÓN LOCAL ENCONTRADOS:${NC}"
    echo "$LOCAL_CONFIGS"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$LOCAL_CONFIGS" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos de configuración local${NC}"
fi
echo ""

# 5. Verificar archivos de logs
echo -e "${YELLOW}📝 Verificando archivos de logs...${NC}"
LOG_FILES=$(find . -name "*.log" -type f 2>/dev/null)
if [ -n "$LOG_FILES" ]; then
    echo -e "${RED}❌ ARCHIVOS DE LOGS ENCONTRADOS:${NC}"
    echo "$LOG_FILES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$LOG_FILES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos de logs${NC}"
fi
echo ""

# 6. Verificar archivos de backup
echo -e "${YELLOW}💾 Verificando archivos de backup...${NC}"
BACKUP_FILES=$(find . -name "*.backup*" -o -name "*.bak" -o -name "*.old" -o -name "*.orig" 2>/dev/null)
if [ -n "$BACKUP_FILES" ]; then
    echo -e "${RED}❌ ARCHIVOS DE BACKUP ENCONTRADOS:${NC}"
    echo "$BACKUP_FILES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$BACKUP_FILES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos de backup${NC}"
fi
echo ""

# 7. Verificar archivos de cache y build
echo -e "${YELLOW}🏗️ Verificando archivos de cache y build...${NC}"
CACHE_DIRS=$(find . -name "cache" -type d -o -name "artifacts" -type d -o -name "build" -type d -o -name "dist" -type d -o -name "out" -type d 2>/dev/null)
if [ -n "$CACHE_DIRS" ]; then
    echo -e "${RED}❌ DIRECTORIOS DE CACHE/BUILD ENCONTRADOS:${NC}"
    echo "$CACHE_DIRS"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$CACHE_DIRS" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron directorios de cache/build${NC}"
fi
echo ""

# 8. Verificar node_modules
echo -e "${YELLOW}📦 Verificando node_modules...${NC}"
NODE_MODULES=$(find . -name "node_modules" -type d 2>/dev/null)
if [ -n "$NODE_MODULES" ]; then
    echo -e "${RED}❌ DIRECTORIOS NODE_MODULES ENCONTRADOS:${NC}"
    echo "$NODE_MODULES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$NODE_MODULES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron directorios node_modules${NC}"
fi
echo ""

# 9. Verificar archivos de Terraform
echo -e "${YELLOW}🏗️ Verificando archivos de Terraform...${NC}"
TF_FILES=$(find . -name "*.tfstate*" -o -name "terraform.tfvars" -o -name "*.auto.tfvars" 2>/dev/null)
if [ -n "$TF_FILES" ]; then
    echo -e "${RED}❌ ARCHIVOS DE TERRAFORM SENSIBLES ENCONTRADOS:${NC}"
    echo "$TF_FILES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$TF_FILES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos de Terraform sensibles${NC}"
fi
echo ""

# 10. Verificar archivos de Docker
echo -e "${YELLOW}🐳 Verificando archivos de Docker...${NC}"
DOCKER_FILES=$(find . -name "docker-compose.override.yml" -o -name "docker-compose.*.yml" 2>/dev/null)
if [ -n "$DOCKER_FILES" ]; then
    echo -e "${RED}❌ ARCHIVOS DE DOCKER SENSIBLES ENCONTRADOS:${NC}"
    echo "$DOCKER_FILES"
    SENSITIVE_FILES=$((SENSITIVE_FILES + $(echo "$DOCKER_FILES" | wc -l)))
else
    echo -e "${GREEN}✅ No se encontraron archivos de Docker sensibles${NC}"
fi
echo ""

# Resumen final
echo "=================================================="
echo -e "${BLUE}📊 RESUMEN DE VERIFICACIÓN${NC}"
echo "=================================================="

if [ $SENSITIVE_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ EXCELENTE: No se encontraron archivos sensibles${NC}"
    echo -e "${GREEN}✅ El repositorio está seguro para subir${NC}"
    exit 0
else
    echo -e "${RED}❌ PROBLEMA: Se encontraron $SENSITIVE_FILES archivos sensibles${NC}"
    echo -e "${RED}❌ NO subir el repositorio hasta resolver estos problemas${NC}"
    echo ""
    echo -e "${YELLOW}💡 RECOMENDACIONES:${NC}"
    echo "1. Revisar el archivo .gitignore"
    echo "2. Agregar los archivos sensibles al .gitignore"
    echo "3. Eliminar los archivos sensibles del staging area"
    echo "4. Ejecutar este script nuevamente"
    exit 1
fi 