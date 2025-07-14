# .automation/

Esta subcarpeta contiene los sistemas avanzados de automatización, CI/CD, auditorías, monitoreo y programación de tareas para el metaverso.

## 🚀 Funcionalidades Principales

### Auto-Trigger System (`auto-trigger.js`)
Sistema de triggers automáticos que coordina workflows y ejecuta tareas programadas:
- **Triggers automáticos**: Health checks, auditorías de seguridad, backups, limpieza
- **Integración cross-módulo**: Coordina scripts de todas las subcarpetas de `.bin`
- **Logging centralizado**: Registra todas las ejecuciones con timestamps
- **CLI Interface**: Comandos para trigger manual, status y cleanup

```bash
# Ejecutar workflow manualmente
node auto-trigger.js trigger healthCheck

# Ver estado del sistema
node auto-trigger.js status

# Limpiar logs antiguos
node auto-trigger.js cleanup
```

### Workflow Manager (`workflow-manager.js`)
Gestor dinámico de workflows personalizables con templates:
- **Templates predefinidos**: Deploy, test, security audit
- **Workflows personalizados**: Crear y gestionar workflows específicos
- **Validación automática**: Verifica estructura y sintaxis de workflows
- **Exportación**: Soporte para YAML y JSON

```bash
# Crear nuevo workflow
node workflow-manager.js create mi-workflow deploy-template.yml

# Listar workflows disponibles
node workflow-manager.js list

# Validar workflow
node workflow-manager.js validate mi-workflow
```

### Scheduler System (`scheduler.js`)
Sistema de programación de tareas con cron jobs:
- **Tareas programadas**: Configuración flexible con cron expressions
- **Tareas predefinidas**: Health checks diarios, backups automáticos, auditorías semanales
- **Persistencia**: Guarda y carga tareas automáticamente
- **Timezone support**: Soporte para diferentes zonas horarias

```bash
# Crear tarea programada
node scheduler.js create "Backup Diario" "0 2 * * *" "bash ../toolkit/backup.sh"

# Listar tareas
node scheduler.js list

# Ejecutar tarea ahora
node scheduler.js run <task-id>

# Inicializar tareas predefinidas
node scheduler.js init-defaults
```

## 📋 Workflows Disponibles

### 1. Deploy Metaverso (`deploy-metaverso.yml`)
Workflow completo para despliegue en múltiples entornos:
- **Validación previa**: Linting, tests, verificación de assets
- **Auditoría de seguridad**: Escaneo de vulnerabilidades y secretos
- **Construcción**: Build, optimización de assets, generación de metadatos
- **Despliegue progresivo**: Staging → Producción con validaciones
- **Post-despliegue**: Backup automático y reportes

### 2. Security Audit (`security-audit.yml`)
Auditoría completa de seguridad:
- **Dependencias**: npm audit, Snyk, dependencias desactualizadas
- **Código**: ESLint security, detección de secretos, SonarQube
- **Blockchain**: Auditoría de contratos, análisis de transacciones
- **Infraestructura**: Verificación de red, certificados SSL, logs de seguridad
- **Pentesting**: Pruebas de penetración (manual)

### 3. Performance Monitoring (`performance-monitoring.yml`)
Monitoreo continuo de rendimiento:
- **Métricas del sistema**: CPU, memoria, disco, red
- **Rendimiento de aplicación**: Tests, análisis de bundle, Lighthouse
- **Base de datos**: Consultas lentas, índices, optimización
- **Blockchain**: Monitoreo de transacciones, análisis de gas
- **Optimización automática**: Aplicación de mejoras detectadas

## 🔧 Configuración y Uso

### Estructura de Directorios
```
.automation/
├── auto-trigger.js          # Sistema de triggers automáticos
├── workflow-manager.js      # Gestor de workflows
├── scheduler.js            # Programador de tareas
├── workflows/              # Workflows estándar
│   ├── ci-multi-env.yml
│   ├── deploy-metaverso.yml
│   ├── security-audit.yml
│   └── performance-monitoring.yml
├── custom-workflows/       # Workflows personalizados
├── templates/             # Templates para workflows
├── logs/                  # Logs centralizados
└── README.md
```

### Variables de Entorno
```bash
# Configuración de timezone para scheduler
TZ=America/Mexico_City

# Tokens para herramientas de seguridad
SNYK_TOKEN=your_snyk_token
SONAR_TOKEN=your_sonar_token

# Configuración de notificaciones
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook
```

### Integración con Otros Módulos
El sistema de automatización se integra con todas las subcarpetas de `.bin`:
- **monitor/**: Health checks y performance monitoring
- **security/**: Auditorías y escaneo de vulnerabilidades
- **toolkit/**: Backups y limpieza
- **blockchain/**: Despliegue de contratos y minting
- **deploy/**: Scripts de despliegue
- **metaverso/**: Generación de mundos y procesamiento de assets

## 📊 Monitoreo y Reportes

### Logs Centralizados
Todos los sistemas generan logs en `logs/`:
- `auto-trigger-YYYY-MM-DD.log`: Logs del sistema de triggers
- `scheduler-YYYY-MM-DD.log`: Logs del programador de tareas
- `workflow-YYYY-MM-DD.log`: Logs de ejecución de workflows

### Reportes Automáticos
- **Reportes de seguridad**: Vulnerabilidades encontradas y recomendaciones
- **Reportes de rendimiento**: Métricas y optimizaciones aplicadas
- **Reportes de despliegue**: Estado de despliegues y validaciones

## 🛡️ Seguridad y Privacidad

### Archivos Protegidos
El `.gitignore` protege información sensible:
- Logs y reportes detallados
- Configuraciones locales y secretos
- Workflows personalizados
- Artifacts y builds
- Métricas y datos de monitoreo

### Buenas Prácticas
- ✅ Workflows estándar en repositorio público
- ✅ Templates reutilizables para la comunidad
- ✅ Configuración local protegida
- ✅ Logs detallados para debugging
- ✅ Reportes consolidados para análisis

## 🚀 Próximos Pasos

1. **Configurar notificaciones**: Integrar con Slack/Discord
2. **Añadir más templates**: Workflows específicos para diferentes casos de uso
3. **Implementar rollback automático**: En caso de fallos en despliegue
4. **Dashboard web**: Interfaz visual para monitoreo
5. **Machine Learning**: Predicción de problemas basada en métricas históricas

## 📝 Ejemplos de Uso

### Configuración Inicial
```bash
# Inicializar sistema de automatización
node scheduler.js init-defaults
node auto-trigger.js status

# Crear workflow personalizado
node workflow-manager.js create mi-deploy deploy-template.yml
```

### Monitoreo Continuo
```bash
# Verificar estado de todos los sistemas
node auto-trigger.js status
node scheduler.js status

# Ejecutar auditoría manual
node auto-trigger.js trigger securityAudit
```

### Troubleshooting
```bash
# Ver logs recientes
tail -f logs/auto-trigger-$(date +%Y-%m-%d).log

# Ejecutar tarea específica
node scheduler.js run <task-id>

# Validar workflow
node workflow-manager.js validate <workflow-name>
``` 