# 🔒 SCRIPT DE VERIFICACIÓN DE SEGURIDAD - WOLDVIRTUAL3D BLOCKCHAIN
# Este script verifica que no hay archivos sensibles en el repositorio

Write-Host "🔒 VERIFICACIÓN DE SEGURIDAD - WOLDVIRTUAL3D BLOCKCHAIN" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue
Write-Host ""

# Contador de archivos sensibles encontrados
$SENSITIVE_FILES = 0

Write-Host "🔍 Verificando archivos sensibles..." -ForegroundColor Blue
Write-Host ""

# 1. Verificar archivos .env
Write-Host "📋 Verificando archivos .env..." -ForegroundColor Yellow
$ENV_FILES = Get-ChildItem -Path . -Recurse -Name ".env*" -File -ErrorAction SilentlyContinue
if ($ENV_FILES) {
    Write-Host "❌ ARCHIVOS .env ENCONTRADOS:" -ForegroundColor Red
    $ENV_FILES | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    $SENSITIVE_FILES += $ENV_FILES.Count
} else {
    Write-Host "✅ No se encontraron archivos .env" -ForegroundColor Green
}
Write-Host ""

# 2. Verificar claves privadas
Write-Host "🔑 Verificando claves privadas..." -ForegroundColor Yellow
$KEY_FILES = Get-ChildItem -Path . -Recurse -Include "*.key", "*.pem", "*.secret", "*.crt" -File -ErrorAction SilentlyContinue
if ($KEY_FILES) {
    Write-Host "❌ ARCHIVOS DE CLAVES ENCONTRADOS:" -ForegroundColor Red
    $KEY_FILES | ForEach-Object { Write-Host $_.FullName -ForegroundColor Red }
    $SENSITIVE_FILES += $KEY_FILES.Count
} else {
    Write-Host "✅ No se encontraron archivos de claves" -ForegroundColor Green
}
Write-Host ""

# 3. Verificar directorios de wallets
Write-Host "💰 Verificando directorios de wallets..." -ForegroundColor Yellow
$WALLET_DIRS = Get-ChildItem -Path . -Recurse -Name "wallets" -Directory -ErrorAction SilentlyContinue
if ($WALLET_DIRS) {
    Write-Host "❌ DIRECTORIOS DE WALLETS ENCONTRADOS:" -ForegroundColor Red
    $WALLET_DIRS | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    $SENSITIVE_FILES += $WALLET_DIRS.Count
} else {
    Write-Host "✅ No se encontraron directorios de wallets" -ForegroundColor Green
}
Write-Host ""

# 4. Verificar archivos de configuración local
Write-Host "⚙️ Verificando archivos de configuración local..." -ForegroundColor Yellow
$LOCAL_CONFIGS = Get-ChildItem -Path . -Recurse -Include "*local*.json", "*local*.js", "*local*.toml" -File -ErrorAction SilentlyContinue
if ($LOCAL_CONFIGS) {
    Write-Host "❌ ARCHIVOS DE CONFIGURACIÓN LOCAL ENCONTRADOS:" -ForegroundColor Red
    $LOCAL_CONFIGS | ForEach-Object { Write-Host $_.FullName -ForegroundColor Red }
    $SENSITIVE_FILES += $LOCAL_CONFIGS.Count
} else {
    Write-Host "✅ No se encontraron archivos de configuración local" -ForegroundColor Green
}
Write-Host ""

# 5. Verificar archivos de logs
Write-Host "📝 Verificando archivos de logs..." -ForegroundColor Yellow
$LOG_FILES = Get-ChildItem -Path . -Recurse -Include "*.log" -File -ErrorAction SilentlyContinue
if ($LOG_FILES) {
    Write-Host "❌ ARCHIVOS DE LOGS ENCONTRADOS:" -ForegroundColor Red
    $LOG_FILES | ForEach-Object { Write-Host $_.FullName -ForegroundColor Red }
    $SENSITIVE_FILES += $LOG_FILES.Count
} else {
    Write-Host "✅ No se encontraron archivos de logs" -ForegroundColor Green
}
Write-Host ""

# 6. Verificar archivos de backup
Write-Host "💾 Verificando archivos de backup..." -ForegroundColor Yellow
$BACKUP_FILES = Get-ChildItem -Path . -Recurse -Include "*.backup*", "*.bak", "*.old", "*.orig" -File -ErrorAction SilentlyContinue
if ($BACKUP_FILES) {
    Write-Host "❌ ARCHIVOS DE BACKUP ENCONTRADOS:" -ForegroundColor Red
    $BACKUP_FILES | ForEach-Object { Write-Host $_.FullName -ForegroundColor Red }
    $SENSITIVE_FILES += $BACKUP_FILES.Count
} else {
    Write-Host "✅ No se encontraron archivos de backup" -ForegroundColor Green
}
Write-Host ""

# 7. Verificar archivos de cache y build
Write-Host "🏗️ Verificando archivos de cache y build..." -ForegroundColor Yellow
$CACHE_DIRS = Get-ChildItem -Path . -Recurse -Name "cache", "artifacts", "build", "dist", "out" -Directory -ErrorAction SilentlyContinue
if ($CACHE_DIRS) {
    Write-Host "❌ DIRECTORIOS DE CACHE/BUILD ENCONTRADOS:" -ForegroundColor Red
    $CACHE_DIRS | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    $SENSITIVE_FILES += $CACHE_DIRS.Count
} else {
    Write-Host "✅ No se encontraron directorios de cache/build" -ForegroundColor Green
}
Write-Host ""

# 8. Verificar node_modules
Write-Host "📦 Verificando node_modules..." -ForegroundColor Yellow
$NODE_MODULES = Get-ChildItem -Path . -Recurse -Name "node_modules" -Directory -ErrorAction SilentlyContinue
if ($NODE_MODULES) {
    Write-Host "❌ DIRECTORIOS NODE_MODULES ENCONTRADOS:" -ForegroundColor Red
    $NODE_MODULES | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    $SENSITIVE_FILES += $NODE_MODULES.Count
} else {
    Write-Host "✅ No se encontraron directorios node_modules" -ForegroundColor Green
}
Write-Host ""

# 9. Verificar archivos de Terraform
Write-Host "🏗️ Verificando archivos de Terraform..." -ForegroundColor Yellow
$TF_FILES = Get-ChildItem -Path . -Recurse -Include "*.tfstate*", "terraform.tfvars", "*.auto.tfvars" -File -ErrorAction SilentlyContinue
if ($TF_FILES) {
    Write-Host "❌ ARCHIVOS DE TERRAFORM SENSIBLES ENCONTRADOS:" -ForegroundColor Red
    $TF_FILES | ForEach-Object { Write-Host $_.FullName -ForegroundColor Red }
    $SENSITIVE_FILES += $TF_FILES.Count
} else {
    Write-Host "✅ No se encontraron archivos de Terraform sensibles" -ForegroundColor Green
}
Write-Host ""

# 10. Verificar archivos de Docker
Write-Host "🐳 Verificando archivos de Docker..." -ForegroundColor Yellow
$DOCKER_FILES = Get-ChildItem -Path . -Recurse -Include "docker-compose.override.yml", "docker-compose.*.yml" -File -ErrorAction SilentlyContinue
if ($DOCKER_FILES) {
    Write-Host "❌ ARCHIVOS DE DOCKER SENSIBLES ENCONTRADOS:" -ForegroundColor Red
    $DOCKER_FILES | ForEach-Object { Write-Host $_.FullName -ForegroundColor Red }
    $SENSITIVE_FILES += $DOCKER_FILES.Count
} else {
    Write-Host "✅ No se encontraron archivos de Docker sensibles" -ForegroundColor Green
}
Write-Host ""

# Resumen final
Write-Host "==================================================" -ForegroundColor Blue
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

if ($SENSITIVE_FILES -eq 0) {
    Write-Host "✅ EXCELENTE: No se encontraron archivos sensibles" -ForegroundColor Green
    Write-Host "✅ El repositorio está seguro para subir" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ PROBLEMA: Se encontraron $SENSITIVE_FILES archivos sensibles" -ForegroundColor Red
    Write-Host "❌ NO subir el repositorio hasta resolver estos problemas" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 RECOMENDACIONES:" -ForegroundColor Yellow
    Write-Host "1. Revisar el archivo .gitignore"
    Write-Host "2. Agregar los archivos sensibles al .gitignore"
    Write-Host "3. Eliminar los archivos sensibles del staging area"
    Write-Host "4. Ejecutar este script nuevamente"
    exit 1
} 