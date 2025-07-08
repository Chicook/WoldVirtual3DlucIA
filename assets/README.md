# 🌟 WoldVirtual3D Assets System

Sistema completo y modular para la gestión de assets 3D del metaverso WoldVirtual3D. Incluye un sistema modular de procesamiento de assets y un backend profesional con APIs avanzadas.

## 🚀 Características Principales

### ✨ Sistema Modular de Assets (`/src/`)
- **Uploaders**: IPFS, AWS S3, Google Cloud Storage
- **Compressors**: Gzip, Brotli, LZMA
- **Optimizers**: Sharp para imágenes, FFmpeg para video
- **Validators**: Validación completa con análisis de seguridad
- **Managers**: Gestión avanzada con métricas y caché
- **Procesamiento en Lotes**: Optimización para grandes volúmenes
- **Sistema de Fallback**: Redundancia y alta disponibilidad

### 🏗️ Backend Profesional (`/backend/`)
- **CRUD Avanzado**: Operaciones completas con validación robusta
- **Búsqueda Inteligente**: Filtros complejos, ordenamiento dinámico
- **Sistema de Caché**: Caché en memoria con TTL configurable
- **Métricas y Estadísticas**: Análisis detallado de uso
- **Recomendaciones**: Algoritmo basado en popularidad y rating
- **Seeder Modular**: Generación de datos de prueba realistas
- **Manejo de Errores**: Sistema robusto con logging estructurado

### 🔧 Tecnologías Utilizadas
- **TypeScript**: Tipado estático para mayor robustez
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **TypeORM**: ORM moderno
- **PostgreSQL**: Base de datos relacional
- **Sharp**: Procesamiento de imágenes
- **FFmpeg**: Procesamiento de video
- **IPFS**: Almacenamiento descentralizado

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- FFmpeg (para procesamiento de video)
- npm >= 8.0.0

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/woldvirtual3d/assets.git
cd assets
```

2. **Instalar dependencias del sistema principal**
```bash
npm install
```

3. **Instalar dependencias del backend**
```bash
cd backend
npm install
cd ..
```

4. **Configurar variables de entorno**
```bash
cp env.example .env
cp backend/.env.example backend/.env
```

5. **Configurar base de datos**
```sql
CREATE DATABASE woldvirtual3d_assets;
```

6. **Ejecutar migraciones y seeders**
```bash
cd backend
npm run db:migrate
npm run seed:examples
cd ..
```

## 🚀 Uso

### Sistema Modular de Assets

#### Uso Básico
```typescript
import { AssetsSystemAdvanced } from './src';

const assetsSystem = new AssetsSystemAdvanced({
  uploaders: ['ipfs'],
  compressors: ['gzip'],
  optimizers: ['sharp'],
  validators: ['security']
});

// Procesar un asset
const result = await assetsSystem.processAsset({
  file: buffer,
  type: 'image',
  options: {
    quality: 80,
    format: 'webp'
  }
});
```

#### Uso Avanzado
```typescript
// Procesamiento en lotes
const batchResult = await assetsSystem.processBatch([
  { file: buffer1, type: 'image' },
  { file: buffer2, type: 'video' },
  { file: buffer3, type: 'model' }
]);

// Análisis de assets
const analysis = await assetsSystem.analyzeAsset(fileBuffer);

// Optimización inteligente
const optimized = await assetsSystem.optimizeIntelligently(fileBuffer, {
  targetSize: 1024 * 1024, // 1MB
  quality: 0.8
});
```

### Backend

#### Desarrollo
```bash
cd backend
npm run dev
```

#### Producción
```bash
cd backend
npm run build
npm start
```

#### Seeders
```bash
cd backend
npm run seed:examples    # 4 assets de ejemplo
npm run seed:full        # 1000 assets con configuración por defecto
npm run seed:custom -- --count 500 --type MODEL_3D
```

## 📚 API Endpoints

### 🔍 Assets

#### Obtener todos los assets
```http
GET /api/assets?type=MODEL_3D&minRating=4&page=1&limit=10
```

#### Assets recomendados
```http
GET /api/assets/recommended?limit=10
```

#### Assets trending
```http
GET /api/assets/trending?days=7&limit=10
```

#### Búsqueda por similitud
```http
GET /api/assets/search?q=casa&limit=10
```

#### Estadísticas detalladas
```http
GET /api/assets/stats
```

#### Crear asset
```http
POST /api/assets
Content-Type: application/json

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

#### Actualizar rating
```http
POST /api/assets/:id/rating
Content-Type: application/json

{
  "rating": 4.5
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
assets/
├── src/                    # Sistema modular de assets
│   ├── index.ts           # Punto de entrada principal
│   ├── manager.ts         # Manager principal
│   ├── upload/            # Uploaders
│   │   ├── IPFSUploader.ts
│   │   └── index.ts
│   ├── compression/       # Compressors
│   │   ├── GzipCompressor.ts
│   │   └── index.ts
│   ├── optimization/      # Optimizers
│   │   ├── SharpOptimizer.ts
│   │   └── index.ts
│   ├── validation/        # Validators
│   │   ├── SecurityValidator.ts
│   │   └── index.ts
│   └── utils/             # Utilidades
│       ├── metrics.ts
│       └── cache.ts
├── backend/               # Backend profesional
│   ├── src/
│   │   ├── controllers/   # Controladores
│   │   ├── entities/      # Modelos de datos
│   │   ├── middleware/    # Middleware
│   │   ├── routes/        # Rutas
│   │   ├── services/      # Servicios
│   │   ├── seeders/       # Generadores de datos
│   │   ├── scripts/       # Scripts CLI
│   │   ├── utils/         # Utilidades
│   │   ├── validators/    # Validación
│   │   ├── database/      # Configuración BD
│   │   └── index.ts       # Punto de entrada
│   ├── package.json       # Dependencias del backend
│   └── README.md          # Documentación del backend
├── config/                # Configuraciones
├── models/                # Modelos de ejemplo
├── scripts/               # Scripts de utilidad
├── package.json           # Dependencias principales
├── tsconfig.json          # Configuración TypeScript
└── README.md              # Este archivo
```

## 🔧 Configuración

### Variables de Entorno Principales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NODE_ENV` | Ambiente | development |
| `PORT` | Puerto del servidor | 3000 |
| `DB_HOST` | Host de PostgreSQL | localhost |
| `DB_PORT` | Puerto de PostgreSQL | 5432 |
| `DB_USERNAME` | Usuario de PostgreSQL | postgres |
| `DB_PASSWORD` | Contraseña de PostgreSQL | - |
| `DB_DATABASE` | Nombre de la base de datos | woldvirtual3d_assets |
| `IPFS_ENDPOINT` | Endpoint de IPFS | https://ipfs.infura.io:5001 |
| `AWS_ACCESS_KEY_ID` | Clave de acceso AWS | - |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta AWS | - |
| `AWS_REGION` | Región de AWS | us-east-1 |
| `AWS_S3_BUCKET` | Bucket de S3 | - |

### Configuración del Sistema Modular

```typescript
const config = {
  uploaders: {
    ipfs: {
      endpoint: process.env.IPFS_ENDPOINT,
      timeout: 30000
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET
    }
  },
  compressors: {
    gzip: {
      level: 6,
      threshold: 1024
    }
  },
  optimizers: {
    sharp: {
      quality: 80,
      format: 'webp'
    }
  },
  validators: {
    security: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['image', 'video', 'model'],
      scanForViruses: true
    }
  }
};
```

## 🧪 Testing

### Sistema Modular
```bash
npm test
```

### Backend
```bash
cd backend
npm test
```

### Cobertura
```bash
npm run test:coverage
cd backend
npm run test:coverage
```

## 🚀 Despliegue

### Docker Compose Completo

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
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
      - ipfs

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

  ipfs:
    image: ipfs/kubo:latest
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs_data:/data/ipfs

volumes:
  postgres_data:
  redis_data:
  ipfs_data:
```

## 📊 Métricas y Monitoreo

### Health Checks
- `GET /health` - Estado general del sistema
- `GET /api/info` - Información de la API
- `GET /api/cache/stats` - Estadísticas de caché

### Logging
El sistema utiliza Winston para logging estructurado:
- **Error**: Errores críticos
- **Warn**: Advertencias
- **Info**: Información general
- **Debug**: Información detallada

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
- 🐛 Issues: [GitHub Issues](https://github.com/woldvirtual3d/assets/issues)

## 🙏 Agradecimientos

- [TypeORM](https://typeorm.io/) - ORM moderno
- [Express.js](https://expressjs.com/) - Framework web
- [Sharp](https://sharp.pixelplumbing.com/) - Procesamiento de imágenes
- [FFmpeg](https://ffmpeg.org/) - Procesamiento de video
- [IPFS](https://ipfs.io/) - Almacenamiento descentralizado
- [Faker.js](https://fakerjs.dev/) - Generación de datos de prueba

---

**Desarrollado con ❤️ por el equipo de WoldVirtual3D**

## 📈 Estado del Proyecto

### ✅ Completado (95%)
- ✅ Sistema modular de assets
- ✅ Backend profesional completo
- ✅ APIs avanzadas
- ✅ Sistema de caché
- ✅ Seeders y documentación
- ✅ Configuración y despliegue

### 🔄 En Progreso (5%)
- 🔄 Tests unitarios y de integración
- 🔄 Integración completa entre sistemas
- 🔄 Sistema de autenticación

### 📋 Próximos Pasos
1. Implementar tests completos
2. Agregar sistema de autenticación
3. Integrar completamente ambos sistemas
4. Optimizar rendimiento
5. Desplegar en producción 