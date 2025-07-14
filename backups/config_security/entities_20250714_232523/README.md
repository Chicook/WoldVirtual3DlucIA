# 🏗️ Sistema de Entidades del Metaverso

Sistema de gestión de entidades descentralizado para el metaverso, construido con TypeScript/JavaScript y diseñado para integrarse con el motor 3D en Rust.

## 📋 Características Principales

### 🌐 **Sistema URI Avanzado**
- Parsing y serialización de URIs RFC 3986 compliant
- Soporte para múltiples esquemas (http, https, ws, wss, mailto, urn)
- Manejo de IRIs (Internationalized Resource Identifiers)
- Normalización y resolución de URIs

### 🎯 **Gestión de Entidades del Metaverso**
- Sistema de identificación único para entidades
- Metadatos y propiedades dinámicas
- Integración con blockchain para propiedad de activos
- Sistema de versionado y historial

### 🔗 **Integración con Motor 3D**
- Compatibilidad con el sistema ECS del motor Rust
- Bindings para WebAssembly
- Sincronización de estado en tiempo real
- Gestión de componentes distribuida

### 🔐 **Seguridad y Validación**
- Validación de esquemas URI
- Sanitización de entradas
- Verificación de integridad
- Control de acceso basado en blockchain

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                Sistema de Entidades del Metaverso           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    URI      │ │  Entity     │ │  Metadata   │           │
│  │  System     │ │  Manager    │ │   System    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Blockchain │ │  Validation │ │  Versioning │           │
│  │ Integration │ │   System    │ │   System    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   WASM      │ │  Sync       │ │   Cache     │           │
│  │  Bindings   │ │  System     │ │   System    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Utils System                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- TypeScript 5.0+
- npm o yarn

### Instalación Básica

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/metaverso-crypto-world-virtual-3d.git
cd metaverso-crypto-world-virtual-3d/entities

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar pruebas
npm test
```

### Desarrollo

```bash
# Modo desarrollo con watch
npm run dev

# Generar documentación
npm run docs

# Linting y formateo
npm run lint
npm run format
```

## 📖 Uso Básico

### Sistema URI

```typescript
import { parse, serialize, normalize } from './esnext/uri';

// Parsear una URI
const components = parse('https://metaverso.example.com/world/123?user=alice#section');

// Serializar componentes
const uri = serialize(components);

// Normalizar URI
const normalized = normalize('HTTPS://METAVERSO.EXAMPLE.COM/world/123');
```

### Gestión de Entidades

```typescript
import { EntityManager, Entity, EntityMetadata } from './src/entity-manager';

// Crear gestor de entidades
const entityManager = new EntityManager();

// Crear una entidad del metaverso
const entity = new Entity({
    id: 'world:123',
    type: 'world',
    uri: 'metaverso://worlds/123',
    metadata: {
        name: 'Mundo Virtual',
        description: 'Un mundo virtual increíble',
        owner: '0x1234...',
        created: new Date(),
        version: '1.0.0'
    }
});

// Registrar entidad
entityManager.register(entity);

// Buscar entidad
const found = entityManager.findById('world:123');
```

### Integración con Blockchain

```typescript
import { BlockchainIntegration } from './src/blockchain';

const blockchain = new BlockchainIntegration({
    network: 'ethereum',
    contractAddress: '0x...',
    provider: 'https://mainnet.infura.io/v3/...'
});

// Verificar propiedad de entidad
const isOwner = await blockchain.verifyOwnership(
    entity.id,
    '0x1234...'
);

// Registrar entidad en blockchain
await blockchain.registerEntity(entity);
```

## 🔧 Configuración

### Configuración del Sistema

```typescript
import { EntitySystemConfig } from './src/config';

const config: EntitySystemConfig = {
    uri: {
        schemes: ['http', 'https', 'ws', 'wss', 'metaverso'],
        validation: {
            strict: true,
            allowRelative: false
        }
    },
    blockchain: {
        enabled: true,
        network: 'polygon',
        gasLimit: 3000000
    },
    cache: {
        enabled: true,
        ttl: 3600,
        maxSize: 1000
    },
    sync: {
        enabled: true,
        interval: 5000,
        batchSize: 100
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

# Cobertura de código
npm run test:coverage

# Pruebas de rendimiento
npm run test:performance
```

### Ejemplo de Prueba

```typescript
import { describe, it, expect } from 'jest';
import { parse, serialize } from '../esnext/uri';

describe('URI System', () => {
    it('should parse metaverso URI correctly', () => {
        const uri = 'metaverso://worlds/123?user=alice';
        const components = parse(uri);
        
        expect(components.scheme).toBe('metaverso');
        expect(components.host).toBe('worlds');
        expect(components.path).toBe('/123');
        expect(components.query).toBe('user=alice');
    });
});
```

## 📊 Métricas de Rendimiento

### Benchmarks

- **Parsing URI**: ~10,000 ops/sec
- **Serialización**: ~15,000 ops/sec
- **Validación**: ~20,000 ops/sec
- **Búsqueda de entidades**: ~50,000 ops/sec
- **Sincronización blockchain**: ~100 ops/sec

### Optimizaciones

- Cache inteligente para URIs frecuentes
- Lazy loading de metadatos
- Batch processing para operaciones blockchain
- Compresión de datos para sincronización

## 🔐 Seguridad

### Validación de Entrada

```typescript
import { validateURI, sanitizeInput } from './src/security';

// Validar URI antes de procesar
const isValid = validateURI(inputURI);

// Sanitizar entrada de usuario
const sanitized = sanitizeInput(userInput);
```

### Control de Acceso

```typescript
import { AccessControl } from './src/security';

const acl = new AccessControl();

// Verificar permisos
const canEdit = await acl.checkPermission(
    userId,
    entityId,
    'edit'
);
```

## 🌐 Integración con Motor 3D

### Bindings WASM

```typescript
import { WASMBindings } from './src/wasm';

const wasm = new WASMBindings();

// Sincronizar entidades con motor 3D
await wasm.syncEntities(entities);

// Obtener estado del motor
const engineState = await wasm.getEngineState();
```

### Sincronización en Tiempo Real

```typescript
import { SyncManager } from './src/sync';

const sync = new SyncManager({
    engine: wasm,
    blockchain: blockchain,
    interval: 1000
});

// Iniciar sincronización
sync.start();
```

## 📈 Roadmap

### Versión 1.0 (Actual)
- ✅ Sistema URI completo
- ✅ Gestión básica de entidades
- ✅ Integración blockchain básica
- ✅ Validación y seguridad

### Versión 1.1 (Próxima)
- 🔄 Sistema de versionado avanzado
- 🔄 Cache distribuido
- 🔄 Sincronización P2P
- 🔄 API GraphQL

### Versión 1.2 (Futura)
- 📋 Sistema de eventos
- 📋 Análisis y métricas
- 📋 Machine Learning para optimización
- 📋 Integración con IPFS

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

**Desarrollado con ❤️ para el Metaverso Descentralizado** 