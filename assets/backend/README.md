# 🖥️ Carpeta `backend/` - Servidor y APIs del Metaverso

## 🎯 **Misión Principal**

La carpeta `backend/` es el **corazón del servidor** del Metaverso Crypto World Virtual 3D. Aquí se centralizan todas las APIs, servicios, modelos de datos, middleware y lógica de negocio que sustentan el ecosistema descentralizado.

---

## 🚀 **Principales Responsabilidades**

### **1. 🌐 APIs RESTful y GraphQL**
- **REST APIs**: Endpoints para todas las funcionalidades del metaverso
- **GraphQL**: API flexible para consultas complejas
- **WebSocket**: Comunicación en tiempo real
- **gRPC**: APIs de alto rendimiento para servicios internos

### **2. 🔧 Servicios de Negocio**
- **Autenticación**: JWT, OAuth, Web3 wallet authentication
- **Blockchain**: Integración con smart contracts y wallets
- **Metaverso**: Gestión de avatares, mundos, escenas
- **Economía**: NFTs, tokens, transacciones, marketplace

### **3. 📊 Modelos de Datos**
- **Entidades**: Avatares, mundos, escenas, interacciones
- **Blockchain**: Wallets, NFTs, tokens, transacciones
- **Economía**: Marketplace, ofertas, subastas
- **Social**: Usuarios, relaciones, grupos

### **4. 🛡️ Middleware y Seguridad**
- **Autenticación**: JWT, rate limiting, CORS
- **Validación**: Schemas, sanitización, validación de datos
- **Monitoreo**: Logging, métricas, health checks
- **Caché**: Redis, memoria, CDN

---

## 📋 **Estructura del Backend**

```
backend/
├── 🚀 src/                    # Código fuente principal
│   ├── index.ts              # Punto de entrada del servidor
│   ├── app.ts                # Configuración de Express/Fastify
│   ├── config/               # Configuraciones
│   │   ├── database.ts       # Configuración de base de datos
│   │   ├── redis.ts          # Configuración de Redis
│   │   ├── blockchain.ts     # Configuración de blockchain
│   │   ├── auth.ts           # Configuración de autenticación
│   │   └── environments/     # Configuraciones por entorno
│   ├── 🌐 apis/              # APIs y endpoints
│   │   ├── index.ts          # Router principal de APIs
│   │   ├── auth/             # APIs de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validator.ts
│   │   ├── metaverso/        # APIs del metaverso
│   │   │   ├── avatar/       # APIs de avatares
│   │   │   ├── world/        # APIs de mundos
│   │   │   ├── scene/        # APIs de escenas
│   │   │   └── interaction/  # APIs de interacciones
│   │   ├── blockchain/       # APIs de blockchain
│   │   │   ├── wallet/       # APIs de wallets
│   │   │   ├── nft/          # APIs de NFTs
│   │   │   ├── token/        # APIs de tokens
│   │   │   └── transaction/  # APIs de transacciones
│   │   ├── economy/          # APIs de economía
│   │   │   ├── marketplace/  # APIs de marketplace
│   │   │   ├── auction/      # APIs de subastas
│   │   │   └── trading/      # APIs de trading
│   │   ├── social/           # APIs sociales
│   │   │   ├── user/         # APIs de usuarios
│   │   │   ├── group/        # APIs de grupos
│   │   │   └── chat/         # APIs de chat
│   │   └── admin/            # APIs administrativas
│   │       ├── dashboard/    # APIs de dashboard
│   │       ├── analytics/    # APIs de analytics
│   │       └── moderation/   # APIs de moderación
│   ├── 🔧 services/          # Servicios de negocio
│   │   ├── index.ts          # Exportaciones de servicios
│   │   ├── auth/             # Servicios de autenticación
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.service.ts
│   │   │   └── wallet.service.ts
│   │   ├── metaverso/        # Servicios del metaverso
│   │   │   ├── avatar.service.ts
│   │   │   ├── world.service.ts
│   │   │   ├── scene.service.ts
│   │   │   └── interaction.service.ts
│   │   ├── blockchain/       # Servicios de blockchain
│   │   │   ├── ethereum.service.ts
│   │   │   ├── polygon.service.ts
│   │   │   ├── nft.service.ts
│   │   │   └── token.service.ts
│   │   ├── economy/          # Servicios de economía
│   │   │   ├── marketplace.service.ts
│   │   │   ├── auction.service.ts
│   │   │   └── trading.service.ts
│   │   ├── social/           # Servicios sociales
│   │   │   ├── user.service.ts
│   │   │   ├── group.service.ts
│   │   │   └── chat.service.ts
│   │   ├── notification/     # Servicios de notificaciones
│   │   │   ├── email.service.ts
│   │   │   ├── push.service.ts
│   │   │   └── websocket.service.ts
│   │   └── storage/          # Servicios de almacenamiento
│   │       ├── file.service.ts
│   │       ├── ipfs.service.ts
│   │       └── arweave.service.ts
│   ├── 📊 models/            # Modelos de datos
│   │   ├── index.ts          # Exportaciones de modelos
│   │   ├── user/             # Modelos de usuario
│   │   │   ├── user.model.ts
│   │   │   ├── profile.model.ts
│   │   │   └── session.model.ts
│   │   ├── metaverso/        # Modelos del metaverso
│   │   │   ├── avatar.model.ts
│   │   │   ├── world.model.ts
│   │   │   ├── scene.model.ts
│   │   │   └── interaction.model.ts
│   │   ├── blockchain/       # Modelos de blockchain
│   │   │   ├── wallet.model.ts
│   │   │   ├── nft.model.ts
│   │   │   ├── token.model.ts
│   │   │   └── transaction.model.ts
│   │   ├── economy/          # Modelos de economía
│   │   │   ├── marketplace.model.ts
│   │   │   ├── auction.model.ts
│   │   │   └── trade.model.ts
│   │   └── social/           # Modelos sociales
│   │       ├── group.model.ts
│   │       ├── chat.model.ts
│   │       └── relationship.model.ts
│   ├── 🛡️ middleware/        # Middleware y seguridad
│   │   ├── index.ts          # Exportaciones de middleware
│   │   ├── auth/             # Middleware de autenticación
│   │   │   ├── auth.middleware.ts
│   │   │   ├── jwt.middleware.ts
│   │   │   └── wallet.middleware.ts
│   │   ├── validation/       # Middleware de validación
│   │   │   ├── validator.middleware.ts
│   │   │   ├── sanitizer.middleware.ts
│   │   │   └── rate-limiter.middleware.ts
│   │   ├── security/         # Middleware de seguridad
│   │   │   ├── cors.middleware.ts
│   │   │   ├── helmet.middleware.ts
│   │   │   └── csrf.middleware.ts
│   │   ├── monitoring/       # Middleware de monitoreo
│   │   │   ├── logger.middleware.ts
│   │   │   ├── metrics.middleware.ts
│   │   │   └── performance.middleware.ts
│   │   └── cache/            # Middleware de caché
│   │       ├── redis.middleware.ts
│   │       ├── memory.middleware.ts
│   │       └── cdn.middleware.ts
│   ├── 🛠️ utils/             # Utilidades y helpers
│   │   ├── index.ts          # Exportaciones de utilidades
│   │   ├── database/         # Utilidades de base de datos
│   │   │   ├── connection.ts
│   │   │   ├── migration.ts
│   │   │   └── seeder.ts
│   │   ├── blockchain/       # Utilidades de blockchain
│   │   │   ├── web3.utils.ts
│   │   │   ├── contract.utils.ts
│   │   │   └── transaction.utils.ts
│   │   ├── crypto/           # Utilidades de criptografía
│   │   │   ├── hash.utils.ts
│   │   │   ├── encryption.utils.ts
│   │   │   └── signature.utils.ts
│   │   ├── validation/       # Utilidades de validación
│   │   │   ├── schemas.ts
│   │   │   ├── validators.ts
│   │   │   └── sanitizers.ts
│   │   ├── response/         # Utilidades de respuesta
│   │   │   ├── api-response.ts
│   │   │   ├── error-handler.ts
│   │   │   └── pagination.ts
│   │   └── helpers/          # Helpers generales
│   │       ├── date.utils.ts
│   │       ├── string.utils.ts
│   │       └── file.utils.ts
│   ├── 📈 monitoring/        # Monitoreo y métricas
│   │   ├── logger.ts         # Sistema de logging
│   │   ├── metrics.ts        # Métricas de aplicación
│   │   ├── health.ts         # Health checks
│   │   └── alerts.ts         # Sistema de alertas
│   └── 🧪 tests/             # Tests
│       ├── unit/             # Tests unitarios
│       ├── integration/      # Tests de integración
│       ├── e2e/              # Tests end-to-end
│       └── fixtures/         # Datos de prueba
├── 📁 config/                # Configuraciones adicionales
│   ├── database/             # Configuraciones de BD
│   ├── redis/                # Configuraciones de Redis
│   ├── blockchain/           # Configuraciones de blockchain
│   └── environments/         # Configuraciones por entorno
├── 📁 docs/                  # Documentación
│   ├── api/                  # Documentación de APIs
│   ├── deployment/           # Guías de despliegue
│   └── development/          # Guías de desarrollo
└── 📁 scripts/               # Scripts de utilidad
    ├── setup.sh              # Script de configuración
    ├── migrate.sh            # Script de migraciones
    └── seed.sh               # Script de datos iniciales
```

---

## 🎯 **Casos de Uso Principales**

### **Para Desarrolladores**
```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm run test

# Generar documentación de APIs
npm run docs:generate

# Ejecutar migraciones
npm run db:migrate
```

### **Para DevOps**
```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start

# Monitorear logs
npm run logs

# Health check
npm run health
```

### **Para Administradores**
```bash
# Dashboard administrativo
npm run admin:start

# Backup de base de datos
npm run db:backup

# Restaurar datos
npm run db:restore
```

---

## 🔧 **Tecnologías y Herramientas**

### **Framework y Runtime**
- **Node.js**: Runtime de JavaScript
- **Express/Fastify**: Framework web
- **TypeScript**: Lenguaje de programación
- **ESLint/Prettier**: Linting y formateo

### **Base de Datos**
- **PostgreSQL**: Base de datos principal
- **Redis**: Caché y sesiones
- **MongoDB**: Datos no estructurados
- **Prisma/TypeORM**: ORM

### **Blockchain**
- **Web3.js/Ethers.js**: Cliente Ethereum
- **Hardhat/Truffle**: Desarrollo de smart contracts
- **IPFS**: Almacenamiento descentralizado
- **Arweave**: Almacenamiento permanente

### **Autenticación y Seguridad**
- **JWT**: Tokens de autenticación
- **Passport.js**: Estrategias de autenticación
- **bcrypt**: Hashing de contraseñas
- **Helmet**: Seguridad HTTP

### **Monitoreo y Logging**
- **Winston**: Sistema de logging
- **Prometheus**: Métricas
- **Grafana**: Visualización
- **Sentry**: Error tracking

---

## 🚀 **Flujo de APIs**

### **1. Autenticación**
```
Cliente → JWT/Wallet Auth → Middleware → Controller → Service → Database
```

### **2. Metaverso**
```
Cliente → Avatar API → World Service → Scene Manager → Interaction Handler
```

### **3. Blockchain**
```
Cliente → Wallet API → Web3 Service → Smart Contract → Transaction Pool
```

### **4. Economía**
```
Cliente → Marketplace API → Auction Service → NFT Service → Blockchain
```

---

## 📈 **Métricas de Rendimiento**

### **Performance**
- ⚡ Response time < 200ms
- 🔄 Throughput > 1000 req/s
- 💾 Memory usage < 512MB
- 🗄️ Database queries < 50ms

### **Disponibilidad**
- 🎯 Uptime > 99.9%
- 🔄 Auto-scaling enabled
- 🛡️ Rate limiting active
- 📊 Health monitoring 24/7

### **Seguridad**
- 🔒 JWT validation 100%
- 🛡️ CORS properly configured
- 🔐 Rate limiting active
- 📋 Input validation 100%

---

## 🔮 **Roadmap del Backend**

### **Q1 2025**
- [ ] APIs básicas de autenticación
- [ ] APIs del metaverso (avatar, world)
- [ ] Integración blockchain básica
- [ ] Sistema de logging

### **Q2 2025**
- [ ] APIs de economía (marketplace, NFTs)
- [ ] WebSocket para tiempo real
- [ ] Sistema de caché Redis
- [ ] Monitoreo y métricas

### **Q3 2025**
- [ ] APIs sociales (chat, grupos)
- [ ] GraphQL API
- [ ] Microservicios
- [ ] Auto-scaling

---

## 🤝 **Colaboración y Contribución**

### **Para Desarrolladores**
- 📚 **API Documentation**: `/docs/api`
- 🧪 **Testing Guide**: `/docs/testing`
- 🔧 **Development Setup**: `/docs/development`
- 💬 **Code Review**: GitHub PRs

### **Para DevOps**
- 🚀 **Deployment Guide**: `/docs/deployment`
- 📊 **Monitoring Setup**: `/docs/monitoring`
- 🔒 **Security Guide**: `/docs/security`
- 📋 **Infrastructure**: `/docs/infrastructure`

---

## 📞 **Soporte y Recursos**

### **Recursos de Desarrollo**
- 📖 **Backend Documentation**: `/docs/backend`
- 🧪 **Backend Testing**: `/tests/backend`
- 🔧 **Backend Tools**: `/tools/backend-utils`
- 📚 **Backend Examples**: `/examples/backend`

### **Soporte Técnico**
- 🐛 **API Errors**: GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions
- 📧 **Backend Support**: backend@metaverso.com
- 🔒 **Security Issues**: security@metaverso.com

---

## 📝 **Ejemplos de Configuración**

### **Configuración de Base de Datos**
```typescript
// backend/src/config/database.ts
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'metaverso',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'metaverso',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development'
};
```

### **Configuración de Blockchain**
```typescript
// backend/src/config/blockchain.ts
export const blockchainConfig = {
  ethereum: {
    rpcUrl: process.env.ETH_RPC_URL,
    chainId: parseInt(process.env.ETH_CHAIN_ID) || 1,
    contracts: {
      nft: process.env.NFT_CONTRACT_ADDRESS,
      marketplace: process.env.MARKETPLACE_CONTRACT_ADDRESS
    }
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL,
    chainId: parseInt(process.env.POLYGON_CHAIN_ID) || 137
  }
};
```

### **Configuración de Autenticación**
```typescript
// backend/src/config/auth.ts
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  wallet: {
    messageExpiresIn: '5m',
    signatureVerification: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requests por ventana
  }
};
```

---

**Última actualización**: Junio 2025  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de Backend del Metaverso 