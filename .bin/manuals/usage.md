# 🚀 Guía de Uso - Scripts de Automatización

## 📋 **Comandos Rápidos**

### **🔧 Compilación y Build**
```bash
# Compilar todo el proyecto
sh ../builder/compile.sh

# Optimizar assets 3D
node ../builder/optimize-assets.js
```

### **🚀 Despliegue**
```bash
# Desplegar en testnet
sh ../deploy/deploy-testnet.sh

# Desplegar en mainnet
sh ../deploy/deploy-mainnet.sh
```

### **⛓️ Blockchain**
```bash
# Desplegar contratos inteligentes
node ../blockchain/deploy-contracts.js

# Mintear NFTs
node ../blockchain/mint-nft.js
```

### **📊 Monitoreo**
```bash
# Verificar salud de servicios
sh ../monitor/health-check.sh

# Monitorear rendimiento completo
node ../monitor/performance-check.js
```

### **🔒 Seguridad**
```bash
# Auditoría de dependencias
sh ../security/audit.sh

# Escaneo de vulnerabilidades
node ../security/scan-vulnerabilities.js
```

### **🎮 Metaverso**
```bash
# Generar mundo virtual
node ../metaverso/generate-world.js

# Procesar nuevos assets
node ../metaverso/process-assets.js
```

### **🧪 Testing**
```bash
# Ejecutar tests
sh ../params/run-tests.sh

# Generar reporte de cobertura
node ../params/coverage-report.js
```

### **🔧 Utilidades**
```bash
# Backup automático
sh ../toolkit/backup.sh

# Limpieza del sistema
sh ../toolkit/cleanup.sh
```

---

## 🎯 **Pipelines Integrados**

### **Orquestador Cross-Módulo**
```bash
# Pipeline completo de build
node ../toolkit/integration-orchestrator.js build

# Pipeline de despliegue completo
node ../toolkit/integration-orchestrator.js deploy

# Pipeline de seguridad
node ../toolkit/integration-orchestrator.js security

# Pipeline completo del metaverso
node ../toolkit/integration-orchestrator.js metaverso

# Pipeline completo (todo)
node ../toolkit/integration-orchestrator.js full

# Pipeline de testing
node ../toolkit/integration-orchestrator.js test

# Pipeline de mantenimiento
node ../toolkit/integration-orchestrator.js maintenance
```

---

## 🔄 **Workflows de CI/CD**

### **GitHub Actions**
Los workflows están configurados en `.automation/workflows/` y se ejecutan automáticamente:

- **Push a main**: Despliegue automático a producción
- **Pull Request**: Testing y validación automática
- **Schedule**: Auditoría diaria de seguridad

### **Ejecución Manual**
```bash
# Validar workflows
npm run workflow:validate

# Ejecutar auditoría de seguridad
npm run security:audit

# Configurar monitoreo
npm run monitoring:setup

# Despliegue canario
npm run deploy:canary

# Tests de integración
npm run test:integration
```

---

## 📊 **Monitoreo y Alertas**

### **Métricas Disponibles**
- **Performance**: FPS, draw calls, memoria 3D
- **Blockchain**: Gas price, transacciones pendientes
- **Sistema**: CPU, memoria, uptime
- **Servicios**: Health checks, response times
- **Logs**: Errores, warnings, eventos críticos

### **Alertas Automáticas**
- Slack notifications para despliegues
- Email alerts para problemas críticos
- Dashboard en Grafana para métricas en tiempo real

---

## 🛡️ **Seguridad**

### **Auditorías Automáticas**
- **Dependencias**: npm audit, Snyk
- **Smart Contracts**: Slither, Mythril
- **Código**: ESLint, SonarQube
- **Infraestructura**: Penetration testing

### **Comandos de Seguridad**
```bash
# Auditoría completa
npm run security:audit

# Escaneo de vulnerabilidades
npm run scan:vulnerabilities

# Verificación de contratos
npm run verify:contracts
```

---

## 🎮 **Gestión del Metaverso**

### **Generación de Mundos**
```bash
# Generar mundo procedural
node ../metaverso/generate-world.js --type=city --size=large

# Procesar assets 3D
node ../metaverso/process-assets.js --format=gltf --optimize=true
```

### **Configuración de Eventos**
```bash
# Configurar evento del metaverso
node ../metaverso/setup-events.js --event=concert --world=main

# Gestionar usuarios
node ../metaverso/manage-users.js --action=ban --user=123
```

---

## 📈 **Reportes y Analytics**

### **Reportes Automáticos**
- **Performance**: Cada 5 minutos
- **Security**: Diario
- **Usage**: Semanal
- **Financial**: Mensual

### **Acceso a Reportes**
```bash
# Ver reporte de performance
cat ../logs/performance-report.json

# Ver reporte de integración
cat ../logs/integration-report.json

# Ver logs del sistema
tail -f ../logs/system.log
```

---

## 🔧 **Configuración Avanzada**

### **Variables de Entorno**
```bash
# Configurar endpoints
export CLIENT_URL=http://localhost:3000
export GATEWAY_URL=http://localhost:4000
export ENGINE_URL=http://localhost:5000
export BLOCKCHAIN_RPC=https://eth-mainnet.alchemyapi.io/v2/

# Configurar thresholds
export PERFORMANCE_THRESHOLD=2000
export MEMORY_THRESHOLD=80
export CPU_THRESHOLD=70
```

### **Configuración de Logs**
```bash
# Nivel de logging
export LOG_LEVEL=info  # debug, info, warn, error

# Rotación de logs
export LOG_ROTATION=daily  # hourly, daily, weekly
```

---

## 🆘 **Solución de Problemas**

### **Problemas Comunes**

**Script no encontrado:**
```bash
# Verificar permisos
chmod +x ../builder/compile.sh

# Verificar ruta
ls -la ../builder/
```

**Error de dependencias:**
```bash
# Instalar dependencias
npm install

# Limpiar cache
npm cache clean --force
```

**Error de permisos:**
```bash
# Dar permisos de ejecución
chmod +x ../deploy/*.sh
chmod +x ../monitor/*.sh
```

### **Logs de Debug**
```bash
# Modo verbose
node ../toolkit/integration-orchestrator.js build --verbose

# Modo dry-run
node ../toolkit/integration-orchestrator.js deploy --dry-run
```

---

## 📞 **Soporte**

- **Issues**: Reportar bugs en GitHub
- **Documentation**: Guías detalladas en `/docs`
- **Community**: Discord/Slack para colaboración
- **Email**: support@metaverso.dev

---

**Última actualización**: Junio 2025  
**Versión**: 1.0.0 