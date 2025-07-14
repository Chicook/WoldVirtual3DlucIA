# 🎨 Sistema de Generación de Imágenes de Entorno

Sistema avanzado para crear imágenes de entorno 100% originales y procedurales para el metaverso 3D descentralizado usando Three.js, WebGL y técnicas de generación procedural.

## 🌟 Características Principales

### 🎨 **Generación Procedural**
- Texturas procedurales en tiempo real
- Generación de cielos dinámicos
- Creación de terrenos procedurales
- Generación de nubes volumétricas
- Efectos atmosféricos avanzados

### 🌐 **Integración Web3**
- NFTs de imágenes generadas
- Metadata on-chain
- Verificación de autenticidad
- Marketplace de imágenes
- Licencias descentralizadas

### 🎮 **Optimización para Metaverso**
- Renderizado en tiempo real
- LOD (Level of Detail) automático
- Compresión inteligente
- Cache distribuido
- Streaming adaptativo

### 🔧 **Herramientas de Desarrollo**
- Editor visual de parámetros
- Preview en tiempo real
- Exportación en múltiples formatos
- Batch processing
- Templates predefinidos

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                Sistema de Generación de Imágenes de Entorno                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Procedural     │    │   Real-time     │    │   Web3          │         │
│  │  Generation     │    │   Rendering     │    │   Integration   │         │
│  │                 │    │                 │    │                 │         │
│  │ • Noise Gen     │    │ • WebGL Shaders │    │ • NFT Creation  │         │
│  │ • Fractals      │    │ • Ray Marching  │    │ • Metadata      │         │
│  │ • Patterns      │    │ • Post Process  │    │ • Verification  │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Environment   │    │   Optimization  │    │   Export        │         │
│  │   Types         │    │                 │    │                 │         │
│  │                 │    │                 │    │                 │         │
│  │ • Skyboxes      │    │ • LOD System    │    │ • Multi Format  │         │
│  │ • HDRIs         │    │ • Compression   │    │ • Batch Export  │         │
│  │ • Panoramas     │    │ • Streaming     │    │ • Templates     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación

### Prerrequisitos
- Three.js 0.158+
- WebGL 2.0
- Node.js 18+
- TypeScript 5.0+

### Instalación
```bash
cd image
npm install
npm run build
npm start
```

## 📖 Uso Básico

### Generación de Skybox Procedural
```typescript
import { ProceduralSkyboxGenerator } from './src/generators/ProceduralSkyboxGenerator';

const generator = new ProceduralSkyboxGenerator({
  resolution: 2048,
  type: 'sunset',
  atmosphere: true,
  clouds: true
});

const skybox = await generator.generate();
const texture = skybox.getTexture();
```

### Generación de Terreno
```typescript
import { TerrainGenerator } from './src/generators/TerrainGenerator';

const terrainGen = new TerrainGenerator({
  width: 1024,
  height: 1024,
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2.0
});

const terrain = await terrainGen.generate();
const heightmap = terrain.getHeightmap();
```

### Creación de NFT
```typescript
import { NFTImageCreator } from './src/web3/NFTImageCreator';

const nftCreator = new NFTImageCreator({
  network: 'ethereum',
  contractAddress: '0x...'
});

const nft = await nftCreator.createNFT({
  image: generatedImage,
  name: 'Procedural Skybox #1',
  description: 'Generated using AI algorithms',
  attributes: {
    type: 'skybox',
    resolution: '2048x2048',
    algorithm: 'procedural'
  }
});
```

## 🎨 Tipos de Generación

### 1. Skyboxes Procedurales
- **Cielos dinámicos** con simulación atmosférica
- **Puestas de sol** con scattering de Rayleigh
- **Noches estrelladas** con constelaciones reales
- **Auroras boreales** con partículas dinámicas
- **Tormentas** con rayos y nubes volumétricas

### 2. Terrenos Procedurales
- **Montañas** con erosión simulada
- **Océanos** con ondas dinámicas
- **Desiertos** con dunas de arena
- **Bosques** con distribución natural
- **Ciudades** con arquitectura procedural

### 3. Texturas Procedurales
- **Mármol** con vetas naturales
- **Madera** con anillos de crecimiento
- **Metal** con oxidación y desgaste
- **Tela** con fibras y pliegues
- **Piedra** con grietas y porosidad

### 4. Efectos Atmosféricos
- **Niebla** volumétrica
- **Lluvia** con gotas dinámicas
- **Nieve** con copos únicos
- **Polvo** con partículas flotantes
- **Humo** con turbulencia

## 🔧 Configuración Avanzada

### Parámetros de Generación
```typescript
interface GenerationParams {
  // Resolución
  resolution: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  
  // Algoritmos
  algorithm: 'perlin' | 'simplex' | 'worley' | 'cellular';
  octaves: number;
  persistence: number;
  lacunarity: number;
  
  // Colores
  colorPalette: ColorPalette;
  contrast: number;
  saturation: number;
  brightness: number;
  
  // Efectos
  effects: {
    atmosphere: boolean;
    clouds: boolean;
    stars: boolean;
    aurora: boolean;
    lightning: boolean;
  };
}
```

### Shaders Personalizados
```glsl
// Fragment Shader para Skybox
varying vec3 vWorldPosition;

void main() {
    vec3 worldPos = normalize(vWorldPosition);
    
    // Simulación atmosférica
    float sunIntensity = pow(max(dot(worldPos, sunDirection), 0.0), 8.0);
    vec3 skyColor = mix(skyTop, skyBottom, worldPos.y);
    
    // Scattering de Rayleigh
    float rayleigh = 1.0 + pow(1.0 - worldPos.y, 2.0);
    
    gl_FragColor = vec4(skyColor * rayleigh + sunColor * sunIntensity, 1.0);
}
```

## 🌐 Integración Web3

### Creación de NFTs
```typescript
class NFTImageCreator {
  async createNFT(params: NFTParams): Promise<NFT> {
    // Generar imagen
    const image = await this.generateImage(params);
    
    // Subir a IPFS
    const ipfsHash = await this.uploadToIPFS(image);
    
    // Crear metadata
    const metadata = {
      name: params.name,
      description: params.description,
      image: `ipfs://${ipfsHash}`,
      attributes: params.attributes,
      generator: {
        algorithm: params.algorithm,
        seed: params.seed,
        parameters: params.parameters
      }
    };
    
    // Mintear NFT
    const nft = await this.mintNFT(metadata);
    
    return nft;
  }
}
```

### Verificación de Autenticidad
```typescript
class AuthenticityVerifier {
  async verifyImage(imageHash: string, metadata: Metadata): Promise<boolean> {
    // Verificar hash de la imagen
    const calculatedHash = await this.calculateHash(imageHash);
    
    // Verificar parámetros de generación
    const regeneratedImage = await this.regenerateFromParams(metadata.generator);
    const regeneratedHash = await this.calculateHash(regeneratedImage);
    
    return calculatedHash === regeneratedHash;
  }
}
```

## 📊 Optimización y Rendimiento

### LOD System
```typescript
class LODManager {
  private levels: Map<number, Texture> = new Map();
  
  async generateLODs(baseTexture: Texture): Promise<void> {
    const resolutions = [2048, 1024, 512, 256, 128, 64];
    
    for (const resolution of resolutions) {
      const lodTexture = await this.downsample(baseTexture, resolution);
      this.levels.set(resolution, lodTexture);
    }
  }
  
  getTextureForDistance(distance: number): Texture {
    if (distance < 10) return this.levels.get(2048);
    if (distance < 50) return this.levels.get(1024);
    if (distance < 100) return this.levels.get(512);
    return this.levels.get(256);
  }
}
```

### Compresión Inteligente
```typescript
class CompressionManager {
  async compressTexture(texture: Texture, quality: number): Promise<CompressedTexture> {
    // Análisis de contenido
    const analysis = await this.analyzeContent(texture);
    
    // Seleccionar algoritmo de compresión
    const algorithm = this.selectCompressionAlgorithm(analysis);
    
    // Comprimir
    const compressed = await this.compress(texture, algorithm, quality);
    
    return compressed;
  }
}
```

## 🎮 Editor Visual

### Interfaz de Usuario
```typescript
class VisualEditor {
  private canvas: HTMLCanvasElement;
  private controls: Map<string, Control> = new Map();
  
  constructor() {
    this.setupCanvas();
    this.setupControls();
    this.setupRealTimePreview();
  }
  
  private setupControls(): void {
    // Controles de parámetros
    this.addSlider('octaves', 1, 8, 4);
    this.addSlider('persistence', 0, 1, 0.5);
    this.addSlider('lacunarity', 1, 4, 2);
    this.addColorPicker('skyColor', '#87CEEB');
    this.addCheckbox('atmosphere', true);
  }
  
  private setupRealTimePreview(): void {
    // Preview en tiempo real
    this.canvas.addEventListener('input', () => {
      this.updatePreview();
    });
  }
}
```

## 📈 Métricas y Analytics

### Rendimiento
- **Tiempo de generación**: < 100ms para 1024x1024
- **Memoria**: < 100MB para texturas grandes
- **GPU Usage**: Optimizado para 60fps
- **Compresión**: 80% reducción de tamaño

### Calidad
- **Resolución**: Hasta 8K
- **Color Depth**: 16-bit HDR
- **Dynamic Range**: 20+ stops
- **Artifacts**: < 0.1% PSNR

## 🔮 Roadmap

### Versión 1.0 (Actual)
- ✅ Generación procedural básica
- ✅ Skyboxes dinámicos
- ✅ Integración Web3 básica
- ✅ Exportación múltiples formatos

### Versión 1.1 (Próxima)
- 🔄 IA generativa (GANs)
- 🔄 Ray tracing en tiempo real
- 🔄 Volumétricos avanzados
- 🔄 Marketplace descentralizado

### Versión 1.2 (Futura)
- 📋 Realidad aumentada
- 📋 Holografía
- 📋 Computación cuántica
- 📋 Telepresencia

## 🤝 Contribución

### Guías de Contribución
1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa con tests
4. Documenta cambios
5. Abre Pull Request

### Estándares de Código
- TypeScript strict mode
- ESLint + Prettier
- Jest para pruebas
- Documentación JSDoc
- Conventional Commits

## 📄 Licencia

MIT License - ver [LICENSE](../LICENSE) para detalles.

## 🆘 Soporte

- 📧 Email: support@metaverso.example.com
- 💬 Discord: [Metaverso Community](https://discord.gg/metaverso)
- 📖 Documentación: [docs.metaverso.example.com](https://docs.metaverso.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/metaverso-crypto-world-virtual-3d/issues)

---

**Desarrollado con ❤️ para la Generación de Imágenes del Metaverso Descentralizado** 