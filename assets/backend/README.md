# 🌟 WoldVirtual3D Assets Backend

Backend avanzado y modular para la gestión de assets 3D del metaverso WoldVirtual3D. Sistema completo con CRUD avanzado, búsqueda inteligente, caché, métricas y funcionalidades profesionales.

## 🚀 Características Principales

### ✨ Funcionalidades Avanzadas
- **CRUD Completo**: Operaciones CRUD con validación robusta y soft delete
- **Búsqueda Inteligente**: Filtros avanzados, ordenamiento dinámico y paginación
- **Sistema de Caché**: Caché en memoria con TTL configurable y invalidación automática
- **Métricas y Estadísticas**: Análisis detallado de uso y rendimiento
- **Recomendaciones**: Algoritmo de recomendaciones basado en popularidad y rating
- **Sistema de Ratings**: Calificación y comentarios de assets
- **Manejo de Errores**: Sistema robusto de manejo de errores con logging estructurado
- **Rate Limiting**: Protección contra abuso con límites configurables
- **Validación Avanzada**: Validación de datos con mensajes personalizados

### 🏗️ Arquitectura Modular
- **Servicios**: Lógica de negocio separada en servicios especializados
- **Controladores**: Controladores limpios con responsabilidades específicas
- **Middleware**: Middleware reutilizable para caché, errores y validación
- **Entidades**: Modelos de datos con TypeORM y validación
- **Seeders**: Generación de datos de prueba realistas y escalables

### 🔧 Tecnologías
- **TypeScript**: Tipado estático para mayor robustez
- **Express.js**: Framework web rápido y minimalista
- **TypeORM**: ORM moderno con soporte para múltiples bases de datos
- **PostgreSQL**: Base de datos relacional robusta
- **Winston**: Sistema de logging avanzado
- **Faker.js**: Generación de datos de prueba realistas

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 8.0.0

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/woldvirtual3d/assets-backend.git
cd assets-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=woldvirtual3d_assets

# Servidor
PORT=3000
NODE_ENV=development

# Caché
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

4. **Crear base de datos**
```sql
CREATE DATABASE woldvirtual3d_assets;
```

5. **Ejecutar migraciones**
```bash
npm run db:migrate
```

6. **Poblar con datos de prueba**
```bash
npm run seed:examples
```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Seeders

#### Generar datos de ejemplo (4 assets)
```bash
npm run seed:examples
```

#### Generar 1000 assets con configuración por defecto
```bash
npm run seed:full
```

#### Generar 500 assets con limpieza previa
```bash
npm run seed:full -- --count 500 --clean
```

#### Generar solo modelos 3D
```bash
npm run seed:custom -- --count 100 --type MODEL_3D
```

#### Generar assets publicados
```bash
npm run seed:custom -- --count 200 --status PUBLISHED
```

## 📚 API Endpoints

### 🔍 Assets

#### Obtener todos los assets
```http
GET /api/assets
```

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20, max: 100)
- `sortBy`: Campo para ordenar (default: createdAt)
- `sortOrder`: Orden ASC/DESC (default: DESC)
- `type`: Tipo de asset (MODEL_3D, TEXTURE, ANIMATION, SOUND)
- `status`: Status del asset (PUBLISHED, DRAFT, ARCHIVED)
- `ownerId`: ID del propietario
- `isPublic`: Boolean (true/false)
- `allowDownload`: Boolean (true/false)
- `allowModification`: Boolean (true/false)
- `allowCommercialUse`: Boolean (true/false)
- `minFileSize`: Tamaño mínimo en bytes
- `maxFileSize`: Tamaño máximo en bytes
- `minRating`: Rating mínimo (1-5)
- `maxRating`: Rating máximo (1-5)
- `minDownloadCount`: Mínimo de descargas
- `minViewCount`: Mínimo de vistas
- `tags`: Array de tags
- `createdAfter`: Fecha de creación posterior
- `createdBefore`: Fecha de creación anterior
- `publishedAfter`: Fecha de publicación posterior
- `publishedBefore`: Fecha de publicación anterior
- `q`: Búsqueda en nombre y descripción

**Ejemplo:**
```bash
curl "http://localhost:3000/api/assets?type=MODEL_3D&minRating=4&page=1&limit=10"
```

#### Obtener asset por ID
```http
GET /api/assets/:id
```

**Parámetros:**
- `incrementViews`: Boolean para incrementar contador de vistas (default: true)

#### Crear nuevo asset
```http
POST /api/assets
```

**Body:**
```json
{
  "name": "Casa Moderna Premium",
  "description": "Modelo 3D de casa moderna con texturas PBR",
  "type": "MODEL_3D",
  "fileUrl": "https://assets.example.com/house.fbx",
  "previewUrl": "https://previews.example.com/house.jpg",
  "ownerId": "user-123",
  "tags": ["casa", "moderna", "3d"],
  "isPublic": true,
  "allowDownload": true,
  "allowModification": false,
  "allowCommercialUse": false
}
```

#### Actualizar asset
```http
PUT /api/assets/:id
```

#### Eliminar asset (soft delete)
```http
DELETE /api/assets/:id
```

#### Restaurar asset eliminado
```http
PATCH /api/assets/:id/restore
```

### 🎯 Funcionalidades Especiales

#### Assets recomendados
```http
GET /api/assets/recommended?limit=10
```

#### Assets trending
```http
GET /api/assets/trending?days=7&limit=10
```

#### Assets similares
```http
GET /api/assets/:id/similar?limit=5
```

#### Búsqueda por similitud
```http
GET /api/assets/search?q=casa&limit=10
```

#### Assets por rango de fechas
```http
GET /api/assets/date-range?startDate=2024-01-01&endDate=2024-12-31
```

#### Assets por propietario
```http
GET /api/assets/owner/:ownerId?page=1&limit=20&status=PUBLISHED
```

#### Incrementar descargas
```http
POST /api/assets/:id/download
```

#### Actualizar rating
```http
POST /api/assets/:id/rating
```

**Body:**
```json
{
  "rating": 4.5
}
```

### 📊 Estadísticas

#### Estadísticas detalladas
```http
GET /api/assets/stats
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 1000,
      "published": 700,
      "draft": 200,
      "archived": 100,
      "deleted": 0,
      "public": 800,
      "downloadable": 900,
      "commercial": 600
    },
    "byType": [
      { "type": "MODEL_3D", "count": "400" },
      { "type": "TEXTURE", "count": "300" },
      { "type": "ANIMATION", "count": "200" },
      { "type": "SOUND", "count": "100" }
    ],
    "topDownloads": [...],
    "topRated": [...]
  }
}
```

### 🏥 Health Check

#### Estado del sistema
```http
GET /health
```

#### Información de la API
```http
GET /api/info
```

#### Estadísticas de caché
```http
GET /api/cache/stats
```

## 🏗️ Estructura del Proyecto

```
src/
├── controllers/          # Controladores de la API
│   └── AssetController.ts
├── entities/            # Modelos de datos
│   └── Asset.ts
├── middleware/          # Middleware personalizado
│   ├── cache.ts
│   └── errorHandler.ts
├── routes/              # Definición de rutas
│   └── assetRoutes.ts
├── seeders/             # Generadores de datos
│   └── assetSeeder.ts
├── services/            # Lógica de negocio
│   └── AssetService.ts
├── scripts/             # Scripts de utilidad
│   └── seed.ts
├── utils/               # Utilidades
│   └── logger.ts
├── validators/          # Validación de datos
│   └── assetValidator.ts
├── database/            # Configuración de BD
│   └── connection.ts
└── index.ts            # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Ambiente (development/production) | development |
| `DB_HOST` | Host de PostgreSQL | localhost |
| `DB_PORT` | Puerto de PostgreSQL | 5432 |
| `DB_USERNAME` | Usuario de PostgreSQL | postgres |
| `DB_PASSWORD` | Contraseña de PostgreSQL | - |
| `DB_DATABASE` | Nombre de la base de datos | woldvirtual3d_assets |
| `REDIS_HOST` | Host de Redis | localhost |
| `REDIS_PORT` | Puerto de Redis | 6379 |
| `REDIS_PASSWORD` | Contraseña de Redis | - |
| `REDIS_DB` | Base de datos de Redis | 0 |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS | http://localhost:3000 |

### Configuración del Seeder

```typescript
const config = {
  totalAssets: 1000,
  distribution: {
    MODEL_3D: 0.4,      // 40% modelos 3D
    TEXTURE: 0.3,       // 30% texturas
    ANIMATION: 0.2,     // 20% animaciones
    SOUND: 0.1          // 10% sonidos
  },
  statusDistribution: {
    PUBLISHED: 0.7,     // 70% publicados
    DRAFT: 0.2,         // 20% borradores
    ARCHIVED: 0.1,      // 10% archivados
    DELETED: 0          // 0% eliminados
  },
  enableRandomization: true,
  batchSize: 100
};
```

## 🧪 Testing

### Ejecutar tests
```bash
npm test
```

### Tests en modo watch
```bash
npm run test:watch
```

### Cobertura de tests
```bash
npm run test:coverage
```

## 🔍 Logging

El sistema utiliza Winston para logging estructurado con diferentes niveles:

- **Error**: Errores críticos del sistema
- **Warn**: Advertencias y problemas no críticos
- **Info**: Información general del sistema
- **Debug**: Información detallada para desarrollo

### Ejemplo de log
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Asset creado exitosamente",
  "assetId": "uuid-123",
  "userId": "user-456"
}
```

## 🚀 Despliegue

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: woldvirtual3d_assets
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- 📧 Email: support@woldvirtual3d.com
- 💬 Discord: [WoldVirtual3D Community](https://discord.gg/woldvirtual3d)
- 📖 Documentación: [docs.woldvirtual3d.com](https://docs.woldvirtual3d.com)
- 🐛 Issues: [GitHub Issues](https://github.com/woldvirtual3d/assets-backend/issues)

## 🙏 Agradecimientos

- [TypeORM](https://typeorm.io/) - ORM moderno y potente
- [Express.js](https://expressjs.com/) - Framework web minimalista
- [Faker.js](https://fakerjs.dev/) - Generación de datos de prueba
- [Winston](https://github.com/winstonjs/winston) - Sistema de logging

---

**Desarrollado con ❤️ por el equipo de WoldVirtual3D** 