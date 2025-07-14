# 📦 Apollo Package Manager

## Descripción
Sistema Apollo GraphQL para gestión inteligente de paquetes y dependencias faltantes en el proyecto Metaverso Crypto World Virtual 3D.

## Características Principales

### 🔍 Análisis Automático
- Detecta dependencias faltantes en todos los módulos
- Analiza conflictos de versiones
- Identifica paquetes desactualizados
- Escanea vulnerabilidades de seguridad

### 🔧 Restauración Inteligente
- Restaura automáticamente paquetes faltantes
- Resuelve conflictos de dependencias
- Actualiza paquetes vulnerables
- Gestión selectiva por módulo o paquete

### 📊 Reportes y Métricas
- Reportes detallados del estado de dependencias
- Métricas de salud del proyecto
- Análisis de tendencias
- Alertas automáticas

### 🌐 Interfaz Web
- Dashboard interactivo
- Apollo Studio para GraphQL
- API REST complementaria
- Monitoreo en tiempo real

## Arquitectura

```
📦 Apollo Package Manager
├── 🎯 Servidor Apollo GraphQL (puerto 4001)
├── 🔧 Servicios Core
│   ├── PackageService - Gestión de paquetes
│   ├── DependencyService - Análisis de dependencias
│   ├── ModuleService - Gestión de módulos
│   └── RestoreService - Restauración automática
├── 🌐 API REST
├── 📊 Dashboard Web
└── 📈 Métricas y Reportes
```

## Endpoints Principales

- **GraphQL API**: `http://localhost:4001/graphql`
- **Apollo Studio**: `http://localhost:4001/studio`
- **Dashboard Web**: `http://localhost:4001/dashboard`
- **Health Check**: `http://localhost:4001/api/health`

## Comandos de Uso

```bash
# Iniciar servidor
npm start

# Modo desarrollo
npm run dev

# Análisis de módulos
npm run analyze

# Escaneo de dependencias
npm run scan

# Restauración automática
npm run restore

# Generar reporte
npm run report

# Docker
docker-compose up -d
```

## Módulos Soportados

El sistema detecta automáticamente:
- `client` - Frontend React
- `backend` - Backend Node.js
- `components` - Componentes React
- `services` - Servicios
- `entities` - Entidades del dominio
- `fonts` - Fuentes tipográficas
- `helpers` - Utilidades
- `image` - Imágenes y assets
- `languages` - Internacionalización
- `lib` - Librerías
- `middlewares` - Middlewares
- `models` - Modelos de datos
- `pages` - Páginas
- `public` - Archivos públicos
- `scripts` - Scripts
- `src` - Código fuente
- `test` - Tests
- `web` - Web
- `coverage` - Cobertura de código
- `package` - Gestión de paquetes

## Funcionalidades Avanzadas

### Gestión de Conflictos
- Detección automática de conflictos de versiones
- Resolución inteligente con versiones recomendadas
- Actualización automática en múltiples módulos

### Análisis de Vulnerabilidades
- Escaneo de vulnerabilidades de seguridad
- Corrección automática de vulnerabilidades críticas
- Reportes detallados de seguridad

### Automatización CI/CD
- Integración con pipelines de CI/CD
- Checks automáticos de salud del proyecto
- Alertas y notificaciones

### Métricas Personalizadas
- Análisis de tendencias de dependencias
- Puntuación de salud del proyecto
- Alertas proactivas

## Configuración

### Variables de Entorno
```bash
NODE_ENV=development
PACKAGE_MANAGER_PORT=4001
CACHE_ENABLED=true
ANALYSIS_BATCH_SIZE=10
```

### Docker
```bash
# Construir imagen
docker build -t apollo-package-manager .

# Ejecutar con Docker Compose
docker-compose up -d
```

## Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Linting
npm run lint
```

## Estado del Sistema

- ✅ **Servidor Apollo GraphQL**: Implementado
- ✅ **Servicios Core**: Implementados
- ✅ **API REST**: Implementada
- ✅ **Dashboard Web**: Implementado
- ✅ **Docker**: Configurado
- ✅ **Tests**: Implementados
- ✅ **Documentación**: Completa

## Próximas Mejoras

- 🔄 Integración con más gestores de paquetes (yarn, pnpm)
- 🔄 Análisis de dependencias circulares
- 🔄 Optimización de rendimiento
- 🔄 Más integraciones CI/CD
- 🔄 Alertas por Slack/Email

---

**Desarrollado para el Metaverso Crypto World Virtual 3D**
