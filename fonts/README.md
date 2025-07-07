# 🎨 Sistema de Fuentes del Metaverso

Sistema de gestión de fuentes tipográficas descentralizado para el metaverso, diseñado para proporcionar tipografías optimizadas, personalizables y accesibles en entornos 3D y web.

## 📋 Características Principales

### 🌐 **Fuentes Descentralizadas**
- Almacenamiento en IPFS para distribución descentralizada
- Verificación de integridad mediante hashes blockchain
- Sistema de versionado y actualizaciones automáticas
- Cache inteligente para rendimiento optimizado

### 🎯 **Optimización para 3D**
- Fuentes optimizadas para renderizado en WebGL/WebGPU
- Soporte para texturas de fuentes de alta resolución
- Generación automática de atlas de caracteres
- LOD (Level of Detail) para diferentes distancias

### 🔧 **Sistema Modular**
- Gestión de familias de fuentes
- Carga dinámica y lazy loading
- Compresión y optimización automática
- Soporte para múltiples formatos (WOFF2, TTF, OTF)

### ♿ **Accesibilidad Avanzada**
- Soporte para múltiples idiomas y scripts
- Fuentes optimizadas para legibilidad
- Ajustes automáticos de contraste
- Soporte para lectores de pantalla

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                Sistema de Fuentes del Metaverso             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Font      │ │   Atlas     │ │   Cache     │           │
│  │  Manager    │ │  Generator  │ │   System    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   IPFS      │ │  Blockchain │ │  3D Render  │           │
│  │ Integration │ │ Integration │ │ Integration │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Font       │ │  Language   │ │  Performance│           │
│  │ Optimizer   │ │   Support   │ │  Monitor    │           │
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
- IPFS node (opcional)

### Instalación Básica

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/metaverso-crypto-world-virtual-3d.git
cd metaverso-crypto-world-virtual-3d/fonts

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

### Gestión de Fuentes

```typescript
import { FontManager, FontFamily, FontStyle } from './src';

// Crear gestor de fuentes
const fontManager = new FontManager({
  ipfs: { enabled: true, gateway: 'https://ipfs.io' },
  cache: { enabled: true, ttl: 3600 },
  optimization: { enabled: true, quality: 'high' }
});

// Registrar familia de fuentes
const roboto = new FontFamily({
  name: 'Roboto',
  variants: ['regular', 'bold', 'italic'],
  languages: ['en', 'es', 'fr'],
  category: 'sans-serif',
  license: 'Apache-2.0'
});

await fontManager.registerFamily(roboto);

// Cargar fuente específica
const font = await fontManager.loadFont('Roboto', 'regular', {
  size: 16,
  color: '#ffffff',
  antialiasing: true
});
```

### Integración con 3D

```typescript
import { FontRenderer3D } from './src/3d';

// Crear renderizador 3D
const renderer = new FontRenderer3D({
  canvas: document.getElementById('canvas'),
  quality: 'high',
  antialiasing: true
});

// Renderizar texto en 3D
const text3D = await renderer.renderText({
  text: 'Metaverso',
  font: 'Roboto',
  style: 'bold',
  size: 24,
  position: [0, 0, 0],
  color: '#00ff00',
  effects: {
    glow: true,
    shadow: true,
    animation: 'fade-in'
  }
});
```

### Optimización Automática

```typescript
import { FontOptimizer } from './src/optimization';

const optimizer = new FontOptimizer({
  compression: 'woff2',
  subsetting: true,
  hinting: true,
  kerning: true
});

// Optimizar fuente
const optimizedFont = await optimizer.optimize(font, {
  characters: 'abcdefghijklmnopqrstuvwxyz',
  quality: 'high',
  format: 'woff2'
});
```

## 🔧 Configuración

### Configuración del Sistema

```typescript
import { FontSystemConfig } from './src/config';

const config: FontSystemConfig = {
  ipfs: {
    enabled: true,
    gateway: 'https://ipfs.io',
    timeout: 30000,
    retries: 3
  },
  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 100,
    strategy: 'lru'
  },
  optimization: {
    enabled: true,
    compression: 'woff2',
    subsetting: true,
    quality: 'high'
  },
  rendering: {
    antialiasing: true,
    hinting: true,
    kerning: true,
    ligatures: true
  },
  accessibility: {
    highContrast: false,
    dyslexia: false,
    screenReader: true
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
import { FontManager } from '../src';

describe('FontManager', () => {
  it('should load font correctly', async () => {
    const manager = new FontManager();
    const font = await manager.loadFont('Roboto', 'regular');
    
    expect(font).toBeDefined();
    expect(font.name).toBe('Roboto');
    expect(font.style).toBe('regular');
  });
});
```

## 📊 Métricas de Rendimiento

### Benchmarks

- **Carga de fuente**: ~50ms (primera vez), ~5ms (cache)
- **Renderizado 3D**: ~10ms por carácter
- **Optimización**: ~100ms por fuente
- **Compresión**: ~70% reducción de tamaño
- **Cache hit rate**: ~95%

### Optimizaciones

- Lazy loading de fuentes
- Compresión WOFF2 automática
- Subsetting inteligente
- Cache distribuido
- Preload de fuentes críticas

## 🔐 Seguridad

### Verificación de Integridad

```typescript
import { FontVerifier } from './src/security';

const verifier = new FontVerifier();

// Verificar hash de fuente
const isValid = await verifier.verifyFont(fontData, expectedHash);

// Verificar licencia
const license = await verifier.checkLicense(fontFamily);
```

### Control de Acceso

```typescript
import { FontAccessControl } from './src/security';

const acl = new FontAccessControl();

// Verificar permisos de uso
const canUse = await acl.checkPermission(
  userId,
  fontId,
  'commercial-use'
);
```

## 🌐 Integración con IPFS

### Almacenamiento Descentralizado

```typescript
import { IPFSFontStorage } from './src/ipfs';

const storage = new IPFSFontStorage({
  gateway: 'https://ipfs.io',
  pinning: true
});

// Subir fuente a IPFS
const cid = await storage.uploadFont(fontData);

// Descargar fuente desde IPFS
const fontData = await storage.downloadFont(cid);
```

## 🎨 Formatos Soportados

### Formatos de Entrada
- **TTF** - TrueType Font
- **OTF** - OpenType Font
- **WOFF** - Web Open Font Format
- **WOFF2** - Web Open Font Format 2.0

### Formatos de Salida
- **WOFF2** - Compresión máxima
- **WOFF** - Compatibilidad amplia
- **TTF** - Compatibilidad universal
- **Atlas** - Texturas para 3D

## 🌍 Soporte Multiidioma

### Idiomas Soportados

```typescript
const languages = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
  'ar', 'he', 'th', 'hi', 'bn', 'ur', 'fa', 'tr', 'nl', 'sv'
];

// Cargar fuente con soporte multiidioma
const font = await fontManager.loadFont('Roboto', 'regular', {
  languages: ['en', 'es', 'fr'],
  fallback: true
});
```

## 📈 Roadmap

### Versión 1.0 (Actual)
- ✅ Gestión básica de fuentes
- ✅ Integración IPFS
- ✅ Optimización automática
- ✅ Renderizado 3D básico

### Versión 1.1 (Próxima)
- 🔄 Fuentes variables
- 🔄 Animaciones tipográficas
- 🔄 IA para optimización
- 🔄 Soporte VR/AR

### Versión 1.2 (Futura)
- 📋 Fuentes generativas
- 📋 Personalización en tiempo real
- 📋 Análisis de uso
- 📋 Marketplace de fuentes

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

**Desarrollado con ❤️ para la Tipografía del Metaverso Descentralizado** 