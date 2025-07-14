# Sistema JavaScript Avanzado - Metaverso Crypto World Virtual 3D

## Descripción General

Este directorio contiene todos los archivos JavaScript refactorizados y ampliados para el metaverso crypto 3D. Cada archivo ha sido completamente reescrito para incluir funcionalidades avanzadas específicas del metaverso.

## Archivos Refactorizados

### 1. `async.js` - Sistema Avanzado de Async/Await

**Funcionalidades Principales:**
- Promesas con timeout y retry automático
- Ejecución paralela con límite de concurrencia
- Carga optimizada de recursos del metaverso
- Cola de operaciones con prioridades
- Pool de conexiones
- Sistema de caché inteligente

**Métodos Principales:**
```javascript
// Crear promesa con timeout
const promise = asyncSystem.createPromiseWithTimeout(myPromise, 5000, 3);

// Ejecutar operaciones en paralelo
const results = await asyncSystem.executeParallel(operations, 10);

// Cargar recursos del metaverso
const resources = await asyncSystem.loadMetaverseResources([
    { type: 'model', url: 'model.glb' },
    { type: 'texture', url: 'texture.jpg' },
    { type: 'blockchain', url: 'api/blockchain' }
]);
```

### 2. `counter.js` - Sistema Avanzado de Contadores y Métricas

**Funcionalidades Principales:**
- Contadores específicos del metaverso (modelos, texturas, NFTs, etc.)
- Métricas de rendimiento en tiempo real
- Contadores de blockchain y DeFi
- Contadores de IA y VR
- Historial de cambios con tendencias
- Contadores especializados por tipo

**Tipos de Contadores:**
```javascript
// Contador básico
const counter = new AdvancedCounter();
counter.models = 150;
counter.nfts = 1000;
counter.transactions = 500;

// Contador de recursos
const resourceCounter = counter.createResourceCounter();
resourceCounter.increment('models', 5);

// Contador de rendimiento
const perfCounter = counter.createPerformanceCounter();
perfCounter.update(rendererInfo);
```

### 3. `queue.js` - Sistema Avanzado de Colas y Tareas

**Funcionalidades Principales:**
- Colas por prioridad (5 niveles)
- Retry automático con backoff exponencial
- Timeout configurable por tarea
- Colas especializadas por tipo (recursos, blockchain, IA, VR)
- Métricas de rendimiento de cola
- Pausa/reanudación de colas

**Tipos de Colas:**
```javascript
// Cola general
const queue = new AdvancedQueue(callback, { maxConcurrent: 10 });

// Cola de recursos
const resourceQueue = queue.createResourceQueue();

// Cola de blockchain
const blockchainQueue = queue.createBlockchainQueue();

// Cola de IA
const aiQueue = queue.createAIQueue();
```

### 4. `sync.js` - Sistema Avanzado de Sincronización

**Funcionalidades Principales:**
- Sincronización de componentes del metaverso
- Sincronización continua con FPS configurable
- Sincronizadores especializados por tipo
- Manejo de estados de sincronización
- Métricas de sincronización

**Componentes Sincronizables:**
```javascript
// Sincronización completa del metaverso
await syncSystem.syncMetaverse({
    scene: myScene,
    physics: myPhysics,
    audio: myAudio,
    ai: myAI,
    vr: myVR,
    blockchain: myBlockchain
});

// Sincronizadores especializados
const sceneSync = syncSystem.createSceneSynchronizer(scene);
const physicsSync = syncSystem.createPhysicsSynchronizer(physics);
```

### 5. `three.js` - Sistema Avanzado de Three.js

**Funcionalidades Principales:**
- Sistema completo de Three.js para metaverso
- Post-procesamiento avanzado (bloom, SSAO, DOF)
- Múltiples modos de cámara (FPS, TPS, VR, cinematográfico)
- Integración con todos los sistemas del metaverso
- Métricas de rendimiento en tiempo real

**Características:**
```javascript
// Inicializar sistema completo
const threeJS = new ThreeJSAdvancedSystem();
await threeJS.initialize({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});

// Renderizar
threeJS.render();

// Obtener métricas
const metrics = threeJS.getMetrics();
```

### 6. `walker.js` - Sistema Avanzado de Navegación y Exploración

**Funcionalidades Principales:**
- Exploración recursiva de directorios
- Filtros avanzados por tipo de archivo
- Walkers especializados (modelos, texturas, audio, shaders, blockchain)
- Pausa/reanudación de exploración
- Métricas de exploración

**Walkers Especializados:**
```javascript
// Walker para modelos 3D
const modelWalker = walker.createModelWalker('/models');

// Walker para texturas
const textureWalker = walker.createTextureWalker('/textures');

// Walker para blockchain
const blockchainWalker = walker.createBlockchainWalker('/contracts');
```

## Sistemas Integrados

### Sistema de Física
- Cuerpos rígidos y suaves
- Vehículos con física realista
- Fluidos y telas
- Colisiones avanzadas

### Sistema de Audio
- Audio 3D posicional
- Efectos de sonido
- Música ambiental
- Visualización de audio

### Sistema de Partículas
- Emisores configurables
- Efectos predefinidos (explosión, fuego, humo, magia)
- Geometrías personalizadas
- Integración con física

### Sistema de Shaders
- Shaders personalizados (agua, fuego, cristal, metal, holograma)
- Post-procesamiento avanzado
- Efectos especiales
- Optimización automática

### Sistema de IA
- NPCs inteligentes
- Agentes de IA
- Árboles de comportamiento
- Redes neuronales
- Generación procedural

### Sistema de VR
- Soporte completo para WebXR
- Controladores VR
- Tracking de manos
- Anclas espaciales
- Feedback háptico

## Uso Básico

```javascript
// Inicializar todos los sistemas
const asyncSystem = new AsyncSystem();
const counter = new AdvancedCounter();
const queue = new AdvancedQueue();
const syncSystem = new SyncSystem();
const threeJS = new ThreeJSAdvancedSystem();
const walker = new AdvancedWalker();

// Configurar eventos
asyncSystem.events.addEventListener('operation-completed', (event) => {
    console.log('Operación completada:', event.detail);
});

// Iniciar sincronización continua
syncSystem.startContinuousSync();

// Renderizar loop
function animate() {
    threeJS.render();
    requestAnimationFrame(animate);
}
animate();
```

## Configuración Avanzada

### Configuración de Rendimiento
```javascript
const config = {
    maxConcurrent: 10,
    retryAttempts: 3,
    timeout: 30000,
    cacheSize: 1000,
    syncInterval: 16, // 60 FPS
    maxDepth: 10
};
```

### Configuración de Metaverso
```javascript
const metaverseConfig = {
    worldId: 'unique_world_id',
    blockchain: 'ethereum',
    defiEnabled: true,
    nftEnabled: true,
    vrEnabled: true,
    aiEnabled: true
};
```

## Métricas y Monitoreo

Todos los sistemas incluyen métricas detalladas:

```javascript
// Métricas de async
const asyncMetrics = asyncSystem.getMetrics();

// Métricas de contador
const counterMetrics = counter.getMetrics();

// Métricas de cola
const queueMetrics = queue.getMetrics();

// Métricas de sincronización
const syncMetrics = syncSystem.getMetrics();

// Métricas de Three.js
const threeMetrics = threeJS.getMetrics();

// Métricas de walker
const walkerMetrics = walker.getMetrics();
```

## Eventos del Sistema

Todos los sistemas emiten eventos personalizados:

```javascript
// Eventos de async
asyncSystem.events.addEventListener('operation-success', callback);
asyncSystem.events.addEventListener('operation-error', callback);

// Eventos de contador
counter.events.addEventListener('counter-changed', callback);

// Eventos de cola
queue.events.addEventListener('task-completed', callback);
queue.events.addEventListener('task-failed', callback);

// Eventos de sincronización
syncSystem.events.addEventListener('metaverse-synced', callback);
syncSystem.events.addEventListener('sync-error', callback);

// Eventos de Three.js
threeJS.events.addEventListener('initialized', callback);
threeJS.events.addEventListener('resize', callback);

// Eventos de walker
walker.events.addEventListener('file-found', callback);
walker.events.addEventListener('walk-completed', callback);
```

## Limpieza de Recursos

Todos los sistemas incluyen métodos de limpieza:

```javascript
// Limpiar todos los sistemas
asyncSystem.dispose();
counter.dispose();
queue.dispose();
syncSystem.dispose();
threeJS.dispose();
walker.dispose();
```

## Compatibilidad

Todos los archivos mantienen compatibilidad con el código original mientras añaden funcionalidades avanzadas. Las clases originales siguen funcionando:

```javascript
// Código original sigue funcionando
const counter = new Counter();
const queue = new Queue(callback);
const walker = new Walker(root, options, callback);

// Nuevas funcionalidades disponibles
const advancedCounter = new AdvancedCounter();
const advancedQueue = new AdvancedQueue(callback);
const advancedWalker = new AdvancedWalker(root, options, callback);
```

## Requisitos

- Three.js r128+
- WebGL 2.0 compatible
- Node.js 14+ (para walker)
- Navegador moderno con soporte ES2020+

## Licencia

Este código es parte del proyecto Metaverso Crypto World Virtual 3D y está sujeto a los términos de licencia del proyecto. 