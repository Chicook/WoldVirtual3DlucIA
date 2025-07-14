# 📦 Apollo Package Manager

Sistema Apollo GraphQL para gestión inteligente de paquetes y dependencias faltantes en el proyecto Metaverso Crypto World Virtual 3D.

## 🚀 Características

- **Análisis Automático**: Detecta dependencias faltantes en todos los módulos
- **Restauración Inteligente**: Restaura automáticamente paquetes faltantes
- **Gestión de Conflictos**: Identifica y resuelve conflictos de versiones
- **Análisis de Vulnerabilidades**: Detecta paquetes con vulnerabilidades de seguridad
- **Reportes Detallados**: Genera reportes completos del estado de dependencias
- **Dashboard Web**: Interfaz web para gestión visual
- **API GraphQL**: API completa para integración con otros sistemas
- **Monitoreo en Tiempo Real**: Métricas y alertas del sistema

## 🏗️ Arquitectura

```
📦 Apollo Package Manager
├── 🎯 Servidor Apollo GraphQL
├── 🔧 Servicios Core
│   ├── PackageService - Gestión de paquetes
│   ├── DependencyService - Análisis de dependencias
│   ├── ModuleService - Gestión de módulos
│   └── RestoreService - Restauración automática
├── 🌐 API REST
├── 📊 Dashboard Web
└── 📈 Métricas y Reportes
```

## 📋 Requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0
- Docker (opcional)
- Docker Compose (opcional)

## 🛠️ Instalación

### Instalación Local

1. **Clonar el repositorio**
```bash
cd package
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar el servidor**
```bash
npm start
```

### Instalación con Docker

1. **Construir la imagen**
```bash
docker build -t apollo-package-manager .
```

2. **Ejecutar con Docker Compose**
```bash
docker-compose up -d
```

## 🎯 Uso

### Endpoints Principales

- **GraphQL API**: `http://localhost:4001/graphql`
- **Apollo Studio**: `http://localhost:4001/studio`
- **Dashboard Web**: `http://localhost:4001/dashboard`
- **Health Check**: `http://localhost:4001/api/health`

### Comandos NPM

```bash
# Iniciar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Generar reporte de cobertura
npm run test:coverage

# Linting
npm run lint

# Análisis de módulos
npm run analyze

# Escaneo de dependencias
npm run scan

# Restauración automática
npm run restore

# Generar reporte
npm run report
```

## 🔍 Funcionalidades

### 1. Análisis de Módulos

Analiza automáticamente todos los módulos del proyecto:

```graphql
query {
  analyzeAllModules {
    id
    name
    type
    status
    healthScore
    missingDependencies {
      name
      version
    }
  }
}
```

### 2. Escaneo de Dependencias

Detecta dependencias faltantes, desactualizadas y vulnerables:

```graphql
query {
  scanDependencies {
    name
    version
    isMissing
    isOutdated
    isVulnerable
    status
  }
}
```

### 3. Restauración Automática

Restaura automáticamente las dependencias faltantes:

```graphql
mutation {
  restoreDependencies(input: {
    type: ALL
  }) {
    id
    status
    successCount
    failureCount
  }
}
```

### 4. Reportes de Dependencias

Genera reportes detallados del estado de las dependencias:

```graphql
query {
  dependencyReport {
    summary {
      totalModules
      totalDependencies
      missingDependencies
      vulnerableDependencies
      overallHealth
      riskLevel
    }
    recommendations {
      type
      priority
      title
      action
    }
  }
}
```

### 5. Métricas y Monitoreo

Obtiene métricas del sistema:

```graphql
query {
  dependencyMetrics {
    totalPackages
    totalDependencies
    missingDependencies
    vulnerableDependencies
    averageHealthScore
  }
}
```

## 📊 Dashboard Web

El dashboard web proporciona una interfaz visual para:

- **Vista General**: Estado general del proyecto
- **Análisis de Módulos**: Detalles de cada módulo
- **Gestión de Dependencias**: Lista y gestión de dependencias
- **Reportes**: Generación y visualización de reportes
- **Métricas**: Gráficos y estadísticas en tiempo real
- **Alertas**: Notificaciones de problemas detectados

## 🔧 Configuración

### Variables de Entorno

```bash
# Servidor
NODE_ENV=development
PACKAGE_MANAGER_PORT=4001
PACKAGE_MANAGER_HOST=localhost

# Cache
CACHE_ENABLED=true
CACHE_TTL=3600

# Análisis
ANALYSIS_BATCH_SIZE=10
ANALYSIS_TIMEOUT=30000

# Seguridad
CORS_ORIGIN=*
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración de Módulos

El sistema detecta automáticamente los siguientes módulos:

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

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

### Estructura de Tests

```
tests/
├── unit/
│   ├── package-service.test.js
│   ├── dependency-service.test.js
│   ├── module-service.test.js
│   └── restore-service.test.js
├── integration/
│   └── apollo-server.test.js
└── setup.js
```

## 🐳 Docker

### Construir Imagen

```bash
docker build -t apollo-package-manager .
```

### Ejecutar Contenedor

```bash
docker run -p 4001:4001 apollo-package-manager
```

### Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📈 Monitoreo

### Health Check

```bash
curl http://localhost:4001/api/health
```

### Métricas

- **Uptime**: Tiempo de funcionamiento
- **Memory Usage**: Uso de memoria
- **Active Operations**: Operaciones activas
- **Dependency Health**: Salud de dependencias
- **Error Rate**: Tasa de errores

### Alertas

El sistema puede configurarse para enviar alertas por:

- **Slack**: Webhook de Slack
- **Email**: SMTP
- **Webhook**: HTTP POST
- **Logs**: Archivos de log

## 🔒 Seguridad

### Rate Limiting

- **Window**: 15 minutos
- **Max Requests**: 100 por ventana
- **Configurable**: Por IP y endpoint

### CORS

- **Origin**: Configurable
- **Credentials**: Soporte para cookies
- **Methods**: GET, POST, PUT, DELETE

### Validación

- **Input Validation**: Validación de entrada GraphQL
- **SQL Injection**: Prevención con parámetros
- **XSS**: Sanitización de datos

## 🚀 Despliegue

### Producción

1. **Configurar variables de entorno**
```bash
NODE_ENV=production
PACKAGE_MANAGER_PORT=4001
```

2. **Instalar dependencias de producción**
```bash
npm ci --only=production
```

3. **Iniciar con PM2**
```bash
pm2 start apollo-package-manager.js --name "apollo-package-manager"
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apollo-package-manager
spec:
  replicas: 3
  selector:
    matchLabels:
      app: apollo-package-manager
  template:
    metadata:
      labels:
        app: apollo-package-manager
    spec:
      containers:
      - name: apollo-package-manager
        image: apollo-package-manager:latest
        ports:
        - containerPort: 4001
        env:
        - name: NODE_ENV
          value: "production"
```

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/metaverso-crypto-world-virtual-3d/apollo-package-manager/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/metaverso-crypto-world-virtual-3d/apollo-package-manager/discussions)

## 🔄 Changelog

### v1.0.0
- ✅ Sistema Apollo GraphQL completo
- ✅ Análisis automático de módulos
- ✅ Detección de dependencias faltantes
- ✅ Restauración automática
- ✅ Dashboard web
- ✅ API REST
- ✅ Métricas y reportes
- ✅ Soporte Docker
- ✅ Tests unitarios
- ✅ Documentación completa

---

**Desarrollado con ❤️ para el Metaverso Crypto World Virtual 3D** 