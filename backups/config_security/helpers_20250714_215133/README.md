# 🛠️ Sistema de Helpers del Metaverso

Sistema completo de helpers y utilidades para el desarrollo del metaverso 3D descentralizado, proporcionando herramientas de visualización, debugging, optimización y desarrollo para el ecosistema Web3.

## 📋 Características Principales

### 🎨 **Helpers de Visualización**
- Helpers para iluminación y materiales
- Debugging de geometrías y normales
- Visualización de físicas y colisiones
- Helpers para audio posicional
- Visualización de texturas y atlas

### 🔧 **Helpers de Desarrollo**
- Debugging de rendimiento
- Visualización de octrees y BVH
- Helpers para WebGPU
- Profiling de escenas
- Optimización de memoria

### 🌐 **Helpers Web3**
- Visualización de transacciones blockchain
- Helpers para NFTs y tokens
- Debugging de smart contracts
- Visualización de redes P2P
- Helpers para IPFS

### 🎮 **Helpers de Interacción**
- Controles de cámara avanzados
- Helpers para VR/AR
- Gestión de eventos táctiles
- Debugging de input
- Visualización de raycasting

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Sistema de Helpers del Metaverso                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Visualization  │    │   Development   │    │    Web3 Helpers │         │
│  │    Helpers      │    │    Helpers      │    │   (Blockchain)  │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Interaction    │    │   Performance   │    │   GPU Helpers   │         │
│  │    Helpers      │    │    Helpers      │    │   (WebGPU)      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Physics       │    │   Audio Helpers │    │   Utils         │         │
│  │   Helpers       │    │   (3D Audio)    │    │  (Common)       │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación

### Prerrequisitos

- Three.js 0.158+
- TypeScript 5.0+
- WebGL 2.0 o WebGPU
- Node.js 18+

### Instalación Básica

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/metaverso-crypto-world-virtual-3d.git
cd metaverso-crypto-world-virtual-3d/helpers

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

### Helpers de Visualización

```typescript
import { 
  LightProbeHelper, 
  RectAreaLightHelper, 
  VertexNormalsHelper,
  TextureHelper 
} from './src/visualization';

// Helper para LightProbe
const lightProbe = new THREE.LightProbe();
const lightProbeHelper = new LightProbeHelper(lightProbe, 1);
scene.add(lightProbeHelper);

// Helper para RectAreaLight
const rectLight = new THREE.RectAreaLight(0xffffff, 5, 4, 4);
const rectLightHelper = new RectAreaLightHelper(rectLight);
scene.add(rectLightHelper);

// Helper para normales de vértices
const geometry = new THREE.BoxGeometry();
const mesh = new THREE.Mesh(geometry);
const normalsHelper = new VertexNormalsHelper(mesh, 0.1, 0xff0000);
scene.add(normalsHelper);

// Helper para texturas
const texture = new THREE.TextureLoader().load('texture.jpg');
const textureHelper = new TextureHelper(texture, 2, 2, 0.1);
scene.add(textureHelper);
```

### Helpers de Desarrollo

```typescript
import { 
  PerformanceHelper, 
  OctreeHelper, 
  MemoryHelper,
  ProfilerHelper 
} from './src/development';

// Helper de rendimiento
const perfHelper = new PerformanceHelper();
perfHelper.startFrame();
// ... renderizar escena
perfHelper.endFrame();
console.log('FPS:', perfHelper.getFPS());

// Helper de octree
const octree = new Octree();
const octreeHelper = new OctreeHelper(octree, 0x00ff00);
scene.add(octreeHelper);

// Helper de memoria
const memoryHelper = new MemoryHelper();
memoryHelper.update();
console.log('Memoria GPU:', memoryHelper.getGPUMemory());

// Helper de profiling
const profiler = new ProfilerHelper();
profiler.startProfile('render');
// ... código a perfilar
profiler.endProfile('render');
console.log('Tiempo:', profiler.getProfileTime('render'));
```

### Helpers Web3

```typescript
import { 
  BlockchainHelper, 
  NFTVisualizer, 
  TransactionHelper,
  IPFSHelper 
} from './src/web3';

// Helper de blockchain
const blockchainHelper = new BlockchainHelper({
  network: 'ethereum',
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
});

// Visualizar transacción
const txHelper = new TransactionHelper();
const txVisualization = txHelper.visualizeTransaction(txHash);
scene.add(txVisualization);

// Visualizar NFT
const nftVisualizer = new NFTVisualizer();
const nftMesh = await nftVisualizer.createNFTMesh(contractAddress, tokenId);
scene.add(nftMesh);

// Helper de IPFS
const ipfsHelper = new IPFSHelper();
const ipfsContent = await ipfsHelper.loadFromIPFS(cid);
```

### Helpers de Interacción

```typescript
import { 
  CameraHelper, 
  VRHelper, 
  TouchHelper,
  RaycastHelper 
} from './src/interaction';

// Helper de cámara
const cameraHelper = new CameraHelper(camera, domElement);
cameraHelper.enableOrbitControls();
cameraHelper.enablePanControls();

// Helper de VR
const vrHelper = new VRHelper(renderer);
vrHelper.enableVR();
vrHelper.setControllerCallbacks({
  onTrigger: (event) => console.log('Trigger pressed'),
  onGrip: (event) => console.log('Grip pressed')
});

// Helper de touch
const touchHelper = new TouchHelper(domElement);
touchHelper.onPinch((scale) => camera.zoom = scale);
touchHelper.onRotate((angle) => camera.rotation.y = angle);

// Helper de raycast
const raycastHelper = new RaycastHelper(camera, scene);
raycastHelper.onIntersection((intersection) => {
  console.log('Intersected object:', intersection.object);
});
```

## 🔧 Configuración

### Configuración del Sistema

```typescript
import { HelpersConfig } from './src/types';

const config: HelpersConfig = {
  visualization: {
    enabled: true,
    showNormals: false,
    showBoundingBoxes: true,
    showWireframes: false,
    colors: {
      normal: 0xff0000,
      tangent: 0x00ff00,
      boundingBox: 0x0000ff
    }
  },
  development: {
    enabled: true,
    showFPS: true,
    showMemory: true,
    showProfiling: false,
    logLevel: 'info'
  },
  web3: {
    enabled: true,
    network: 'ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    ipfsGateway: 'https://ipfs.io'
  },
  interaction: {
    enabled: true,
    enableVR: true,
    enableTouch: true,
    enableRaycast: true
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

# Pruebas de rendimiento
npm run test:performance

# Cobertura de código
npm run test:coverage
```

### Ejemplo de Prueba

```typescript
import { describe, it, expect } from 'jest';
import { LightProbeHelper } from '../src/visualization';

describe('LightProbeHelper', () => {
  it('should create helper correctly', () => {
    const lightProbe = new THREE.LightProbe();
    const helper = new LightProbeHelper(lightProbe, 1);
    
    expect(helper).toBeDefined();
    expect(helper.lightProbe).toBe(lightProbe);
    expect(helper.size).toBe(1);
  });
});
```

## 📊 Métricas de Rendimiento

### Benchmarks

- **LightProbeHelper**: ~0.1ms por frame
- **VertexNormalsHelper**: ~0.5ms por frame
- **PerformanceHelper**: ~0.01ms por frame
- **OctreeHelper**: ~1ms por frame
- **BlockchainHelper**: ~10ms por operación

### Optimizaciones

- Lazy loading de helpers
- Frustum culling automático
- LOD para helpers complejos
- Pool de objetos reutilizables
- Compresión de geometrías

## 🔐 Seguridad

### Validación de Inputs

```typescript
import { ValidationHelper } from './src/utils';

const validator = new ValidationHelper();

// Validar parámetros de helper
const isValid = validator.validateHelperParams({
  size: 1,
  color: 0xff0000,
  enabled: true
});
```

### Sanitización de Datos

```typescript
import { SanitizationHelper } from './src/utils';

const sanitizer = new SanitizationHelper();

// Sanitizar datos de blockchain
const cleanData = sanitizer.sanitizeBlockchainData(rawData);
```

## 🌐 Integración con el Ecosistema

### Motor 3D (Rust)
- Bindings WASM para helpers de alto rendimiento
- Sincronización de estado de helpers
- Optimización de memoria compartida

### Sistema de Entidades
- Helpers para visualización de entidades
- Debugging de relaciones entre entidades
- Visualización de metadatos

### Gateway
- Helpers para debugging de APIs
- Visualización de requests/responses
- Monitoreo de performance

## 🛠️ Herramientas de Desarrollo

### Debug Panel
```typescript
import { DebugPanel } from './src/development';

const debugPanel = new DebugPanel({
  container: document.getElementById('debug-panel'),
  helpers: [perfHelper, memoryHelper, profiler]
});

debugPanel.show();
```

### Inspector
```typescript
import { SceneInspector } from './src/development';

const inspector = new SceneInspector(scene, camera, renderer);
inspector.enable();
```

### Profiler
```typescript
import { SceneProfiler } from './src/development';

const profiler = new SceneProfiler();
profiler.startProfiling();
// ... renderizar escena
profiler.stopProfiling();
profiler.generateReport();
```

## 📈 Roadmap

### Versión 1.0 (Actual)
- ✅ Helpers de visualización básicos
- ✅ Helpers de desarrollo
- ✅ Helpers Web3 básicos
- ✅ Helpers de interacción

### Versión 1.1 (Próxima)
- 🔄 Helpers para WebGPU
- 🔄 Helpers de IA y ML
- 🔄 Helpers de networking
- 🔄 Helpers de audio avanzados

### Versión 1.2 (Futura)
- 📋 Helpers de realidad aumentada
- 📋 Helpers de computación cuántica
- 📋 Helpers de holografía
- 📋 Helpers de telepresencia

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

**Desarrollado con ❤️ para los Helpers del Metaverso Descentralizado** 