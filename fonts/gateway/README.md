# 🌐 Gateway del Metaverso - API Federation & DID Resolution

Sistema de gateway descentralizado para el metaverso que proporciona federación de APIs, resolución de DIDs, indexación de datos y middleware de seguridad para el ecosistema Web3.

## 📋 Características Principales

### 🌍 **API Federation**
- Federación de múltiples APIs del ecosistema
- GraphQL Mesh para unificación de esquemas
- Resolución inteligente de endpoints
- Cache distribuido con Redis
- Rate limiting y throttling

### 🔐 **DID Resolution**
- Resolución de DIDs Ethereum y Web
- Verificación de identidades descentralizadas
- Integración con wallets Web3
- Autenticación sin contraseñas
- Gestión de credenciales verificables

### 🔍 **Indexación Inteligente**
- Indexación en tiempo real de datos del metaverso
- Búsqueda semántica de mundos y assets
- Filtros avanzados y recomendaciones
- Sincronización con blockchain
- Cache de consultas optimizado

### 🛡️ **Seguridad Avanzada**
- Middleware de autenticación JWT
- Rate limiting por usuario/IP
- Validación de esquemas con Zod
- CORS configurado
- Helmet para headers de seguridad

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Gateway del Metaverso                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   API Gateway   │    │  GraphQL Mesh   │    │   DID Resolver  │         │
│  │   (Express)     │    │  (Federation)   │    │  (Identity)     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Indexing      │    │   Middleware    │    │   Cache         │         │
│  │   (Real-time)   │    │   (Security)    │    │   (Redis)       │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Federation    │    │   Monitoring    │    │   Config        │         │
│  │   (Services)    │    │   (Metrics)     │    │  (Management)   │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- Redis 6+
- TypeScript 5.0+
- Docker (opcional)

### Instalación Básica

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/metaverso-crypto-world-virtual-3d.git
cd metaverso-crypto-world-virtual-3d/gateway

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar Redis (si no está corriendo)
redis-server

# Ejecutar en modo desarrollo
npm run dev
```

### Docker

```bash
# Construir imagen
docker build -t metaverso-gateway .

# Ejecutar contenedor
docker run -p 3000:3000 -e REDIS_URL=redis://redis:6379 metaverso-gateway
```

## 📖 Uso Básico

### Inicialización del Gateway

```typescript
import { GatewayServer } from './src';

// Crear instancia del gateway
const gateway = new GatewayServer({
  port: 3000,
  redis: {
    url: 'redis://localhost:6379',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  federation: {
    enabled: true,
    services: [
      { name: 'worlds', url: 'http://worlds-service:3001' },
      { name: 'users', url: 'http://users-service:3002' },
      { name: 'assets', url: 'http://assets-service:3003' }
    ]
  },
  did: {
    enabled: true,
    resolvers: ['ethr', 'web']
  }
});

// Inicializar gateway
await gateway.initialize();
await gateway.start();
```

### API REST

```bash
# Obtener mundos virtuales
curl -X GET "https://api.metaverso.dev/v1/worlds?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Crear nuevo mundo
curl -X POST "https://api.metaverso.dev/v1/worlds" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mi Mundo Virtual",
    "description": "Un mundo increíble",
    "category": "gaming",
    "capacity": 100
  }'

# Obtener perfil de usuario
curl -X GET "https://api.metaverso.dev/v1/users/USER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### GraphQL Federation

```graphql
# Consulta federada
query GetWorldWithUsers($worldId: ID!) {
  world(id: $worldId) {
    id
    name
    description
    users {
      id
      username
      avatar
      walletAddress
    }
    assets {
      id
      name
      category
      price
    }
  }
}

# Mutación federada
mutation CreateWorldSession($input: CreateSessionInput!) {
  createSession(input: $input) {
    id
    world {
      id
      name
    }
    user {
      id
      username
    }
    status
    createdAt
  }
}
```

### DID Resolution

```typescript
import { DIDResolver } from './src/did';

const resolver = new DIDResolver({
  resolvers: ['ethr', 'web'],
  cache: true
});

// Resolver DID
const didDocument = await resolver.resolve('did:ethr:0x1234567890123456789012345678901234567890');

// Verificar credencial
const isValid = await resolver.verifyCredential(credential);

// Crear DID
const did = await resolver.createDID(wallet);
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Federation
FEDERATION_ENABLED=true
WORLDS_SERVICE_URL=http://worlds-service:3001
USERS_SERVICE_URL=http://users-service:3002
ASSETS_SERVICE_URL=http://assets-service:3003

# DID
DID_ENABLED=true
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_ENABLED=true
```

### Configuración Avanzada

```typescript
import { GatewayConfig } from './src/config';

const config: GatewayConfig = {
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: ['https://metaverso.dev', 'https://app.metaverso.dev'],
      credentials: true
    }
  },
  redis: {
    url: 'redis://localhost:6379',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  },
  federation: {
    enabled: true,
    services: [
      {
        name: 'worlds',
        url: 'http://worlds-service:3001',
        timeout: 5000,
        retries: 3
      }
    ],
    mesh: {
      cache: true,
      introspection: true
    }
  },
  did: {
    enabled: true,
    resolvers: ['ethr', 'web'],
    cache: true,
    timeout: 10000
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // máximo 100 requests por ventana
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: '24h'
    }
  }
};
```

## 🧪 Pruebas

### Ejecutar Pruebas

```bash
# Pruebas unitarias
npm test

# Pruebas de integración
npm run test:integration

# Pruebas de carga
npm run test:load

# Cobertura de código
npm run test:coverage
```

### Ejemplo de Prueba

```typescript
import { describe, it, expect } from 'jest';
import { GatewayServer } from '../src';

describe('GatewayServer', () => {
  it('should initialize correctly', async () => {
    const gateway = new GatewayServer({
      port: 0, // Puerto aleatorio para pruebas
      redis: { url: 'redis://localhost:6379' }
    });

    await gateway.initialize();
    expect(gateway.isInitialized()).toBe(true);
    
    await gateway.destroy();
  });
});
```

## 📊 Métricas y Monitoreo

### Métricas Disponibles

- **Rendimiento**: Tiempo de respuesta, throughput, latencia
- **Federación**: Tiempo de resolución, tasa de éxito, errores
- **DID**: Resoluciones exitosas, tiempo de verificación
- **Cache**: Hit rate, miss rate, tamaño del cache
- **Seguridad**: Intentos de acceso, rate limiting, errores de autenticación

### Prometheus

```bash
# Métricas disponibles en /metrics
curl http://localhost:3000/metrics
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Metaverso Gateway",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  }
}
```

## 🔐 Seguridad

### Autenticación

```typescript
import { AuthMiddleware } from './src/middleware/auth';

// Middleware de autenticación JWT
app.use('/api/v1', AuthMiddleware.verifyToken);

// Middleware de autenticación DID
app.use('/api/v1/did', AuthMiddleware.verifyDID);
```

### Rate Limiting

```typescript
import { RateLimitMiddleware } from './src/middleware/rate-limit';

// Rate limiting por IP
app.use(RateLimitMiddleware.byIP({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Rate limiting por usuario
app.use('/api/v1', RateLimitMiddleware.byUser({
  windowMs: 15 * 60 * 1000,
  max: 1000
}));
```

### Validación de Esquemas

```typescript
import { ValidationMiddleware } from './src/middleware/validation';
import { createWorldSchema } from './src/schemas/world';

// Validación de esquemas con Zod
app.post('/api/v1/worlds', 
  ValidationMiddleware.validate(createWorldSchema),
  worldsController.create
);
```

## 🌐 Integración con el Ecosistema

### Motor 3D (Rust)
- APIs para sincronización de estado
- WebSocket para actualizaciones en tiempo real
- Optimización de transferencia de datos

### Sistema de Entidades
- Resolución de entidades por DID
- Sincronización de metadatos
- Verificación de propiedad

### Blockchain
- Verificación de transacciones
- Resolución de DIDs Ethereum
- Integración con smart contracts

## 🚀 Despliegue

### Docker Compose

```yaml
version: '3.8'
services:
  gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on:
      - redis
    networks:
      - metaverso

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - metaverso

networks:
  metaverso:
    driver: bridge
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: metaverso-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: metaverso-gateway
  template:
    metadata:
      labels:
        app: metaverso-gateway
    spec:
      containers:
      - name: gateway
        image: metaverso/gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
```

## 📈 Roadmap

### Versión 1.0 (Actual)
- ✅ API Gateway básico
- ✅ GraphQL Federation
- ✅ DID Resolution
- ✅ Cache con Redis
- ✅ Middleware de seguridad

### Versión 1.1 (Próxima)
- 🔄 Indexación avanzada
- 🔄 WebSocket para tiempo real
- 🔄 Métricas detalladas
- 🔄 Load balancing

### Versión 1.2 (Futura)
- 📋 Federación cross-chain
- 📋 IA para optimización
- 📋 Análisis predictivo
- 📋 Marketplace de APIs

## 🤝 Contribución

### Guías de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código

- TypeScript strict mode
- ESLint + Prettier
- Jest para pruebas
- Documentación JSDoc
- Conventional Commits

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE) para detalles.

## 🆘 Soporte

- 📧 Email: support@metaverso.example.com
- 💬 Discord: [Metaverso Community](https://discord.gg/metaverso)
- 📖 Documentación: [docs.metaverso.example.com](https://docs.metaverso.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/metaverso-crypto-world-virtual-3d/issues)

---

**Desarrollado con ❤️ para el Gateway Descentralizado del Metaverso** 