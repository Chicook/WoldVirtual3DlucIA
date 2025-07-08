# WoldVirtual Build Backend

Backend API para el sistema de build de WoldVirtual 3D. Proporciona servicios para gestión de builds, seguimiento de progreso, cola de trabajos y notificaciones.

## 🚀 Características

- **Gestión de Builds**: API completa para crear, monitorear y gestionar builds
- **Seguimiento de Progreso**: Sistema en tiempo real para seguimiento del progreso de módulos
- **Cola de Trabajos**: Gestión inteligente de cola con prioridades y reintentos
- **Notificaciones**: Sistema multi-canal (email, webhook, Slack, WebSocket)
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Cache**: Redis para optimización de rendimiento
- **Autenticación**: JWT con roles y permisos
- **Logging**: Sistema de logging avanzado con Winston
- **Monitoreo**: Métricas con Prometheus y Grafana
- **Docker**: Contenedores optimizados para producción

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (opcional)

## 🛠️ Instalación

### Desarrollo Local

1. **Clonar el repositorio**
```bash
cd build/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb woldvirtual_build

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate
```

5. **Iniciar servicios**
```bash
# Iniciar Redis
redis-server

# En otra terminal, iniciar el backend
npm run dev
```

### Docker

1. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env
```

2. **Iniciar con Docker Compose**
```bash
docker-compose up -d
```

3. **Ejecutar migraciones**
```bash
docker-compose exec backend npx prisma migrate deploy
```

## 🔧 Configuración

### Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3001
HOST=localhost

# Base de Datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/woldvirtual_build
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=woldvirtual_build

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Webhook
WEBHOOK_ENABLED=false
WEBHOOK_URL=https://your-webhook-url.com
WEBHOOK_SECRET=your-webhook-secret

# Slack
SLACK_ENABLED=false
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#builds

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=logs/backend.log

# Build
BUILD_MAX_CONCURRENCY=4
BUILD_MAX_QUEUE_SIZE=100
BUILD_TIMEOUT=300000
BUILD_RETRY_ATTEMPTS=3
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Estado del sistema

### Builds
- `GET /api/v1/builds` - Listar builds
- `GET /api/v1/builds/:id` - Obtener build específico
- `POST /api/v1/builds` - Crear nuevo build
- `PUT /api/v1/builds/:id/cancel` - Cancelar build
- `GET /api/v1/builds/:id/logs` - Obtener logs del build
- `GET /api/v1/builds/stats/overview` - Estadísticas de builds
- `GET /api/v1/builds/stats/modules` - Estadísticas por módulo
- `POST /api/v1/builds/batch` - Crear múltiples builds

### Progreso
- `GET /api/v1/progress` - Progreso general del proyecto
- `GET /api/v1/progress/modules` - Progreso de todos los módulos
- `GET /api/v1/progress/modules/:name` - Progreso de módulo específico
- `PUT /api/v1/progress/modules/:name` - Actualizar progreso
- `POST /api/v1/progress/modules/:name/start` - Iniciar progreso
- `POST /api/v1/progress/modules/:name/complete` - Completar progreso
- `POST /api/v1/progress/modules/:name/fail` - Marcar como fallido
- `GET /api/v1/progress/stats` - Estadísticas de progreso

### Cola
- `GET /api/v1/queue` - Estado de la cola
- `GET /api/v1/queue/jobs` - Jobs en cola
- `GET /api/v1/queue/jobs/:id` - Job específico
- `POST /api/v1/queue/jobs` - Agregar job
- `DELETE /api/v1/queue/jobs/:id` - Cancelar job
- `POST /api/v1/queue/jobs/:id/retry` - Reintentar job
- `GET /api/v1/queue/stats` - Estadísticas de cola

### Notificaciones
- `GET /api/v1/notifications` - Listar notificaciones
- `GET /api/v1/notifications/:id` - Notificación específica
- `POST /api/v1/notifications` - Enviar notificación personalizada
- `POST /api/v1/notifications/template/:templateId` - Enviar con template
- `GET /api/v1/notifications/templates` - Templates disponibles
- `GET /api/v1/notifications/stats` - Estadísticas de notificaciones

### Sistema
- `GET /api/v1/system/health` - Health check completo
- `GET /api/v1/system/info` - Información del sistema
- `GET /api/v1/system/stats` - Estadísticas del sistema
- `GET /api/v1/system/database` - Información de base de datos
- `GET /api/v1/system/cache` - Información de cache
- `GET /api/v1/system/logs` - Logs del sistema
- `GET /api/v1/system/metrics` - Métricas Prometheus

## 🏗️ Estructura del Proyecto

```
src/
├── config/           # Configuración del sistema
├── database/         # Gestión de base de datos
├── cache/           # Gestión de cache
├── services/        # Servicios de negocio
├── routes/          # Rutas de la API
├── middleware/      # Middlewares
├── utils/           # Utilidades
└── index.ts         # Punto de entrada

prisma/
├── schema.prisma    # Esquema de base de datos
└── migrations/      # Migraciones

tests/               # Tests
├── unit/           # Tests unitarios
├── integration/    # Tests de integración
└── e2e/            # Tests end-to-end
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests de integración
npm run test:integration

# Tests e2e
npm run test:e2e

# Todos los tests
npm run test:all
```

### Ejecutar Tests en Docker
```bash
docker-compose exec backend npm run test
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar en modo desarrollo
npm run build        # Compilar TypeScript
npm run start        # Iniciar en producción

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Sembrar datos
npm run db:reset     # Resetear base de datos

# Testing
npm run test         # Tests unitarios
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con coverage

# Linting y formateo
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de linting
npm run format       # Formatear código con Prettier

# Docker
npm run docker:build # Construir imagen Docker
npm run docker:run   # Ejecutar contenedor
npm run docker:stop  # Detener contenedor
```

## 📊 Monitoreo

### Métricas Prometheus
- Endpoint: `http://localhost:3001/api/v1/system/metrics`
- Dashboard: `http://localhost:3000` (Grafana)

### Logs
- Archivo: `logs/backend.log`
- Formato: JSON estructurado
- Rotación: Diaria con retención de 14 días

### Health Checks
- Endpoint: `http://localhost:3001/health`
- Verifica: Base de datos, Redis, servicios internos

## 🔒 Seguridad

- **Autenticación**: JWT con expiración configurable
- **Autorización**: Roles y permisos granulares
- **Rate Limiting**: Protección contra spam
- **CORS**: Configuración de orígenes permitidos
- **Helmet**: Headers de seguridad
- **Validación**: Validación de entrada estricta

## 🐳 Docker

### Construir Imagen
```bash
docker build -t woldvirtual-build-backend .
```

### Ejecutar Contenedor
```bash
docker run -p 3001:3001 woldvirtual-build-backend
```

### Docker Compose
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Ejecutar comandos
docker-compose exec backend npm run test
```

## 📈 Escalabilidad

- **Horizontal**: Múltiples instancias del backend
- **Vertical**: Configuración de recursos por contenedor
- **Cache**: Redis para optimización
- **Base de datos**: Connection pooling configurado
- **Cola**: Procesamiento asíncrono de builds

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar que PostgreSQL esté ejecutándose
   - Verificar credenciales en `.env`
   - Ejecutar migraciones: `npx prisma migrate deploy`

2. **Error de conexión a Redis**
   - Verificar que Redis esté ejecutándose
   - Verificar configuración en `.env`

3. **Error de permisos**
   - Verificar que el usuario tenga permisos en la base de datos
   - Verificar configuración de JWT

4. **Builds fallando**
   - Verificar logs: `docker-compose logs backend`
   - Verificar estado de la cola: `GET /api/v1/queue`

### Logs
```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de base de datos
docker-compose logs -f postgres

# Ver logs de Redis
docker-compose logs -f redis
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier
- Tests unitarios obligatorios
- Documentación de API
- Commits semánticos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]
- **Discord**: [Servidor de Discord]
- **Email**: support@woldvirtual.com

## 🔄 Changelog

### v1.0.0 (2024-01-XX)
- ✅ Sistema de builds completo
- ✅ Seguimiento de progreso en tiempo real
- ✅ Cola de trabajos con prioridades
- ✅ Sistema de notificaciones multi-canal
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL
- ✅ Cache Redis
- ✅ Docker y Docker Compose
- ✅ Monitoreo con Prometheus/Grafana
- ✅ Tests unitarios y de integración
- ✅ Documentación completa 