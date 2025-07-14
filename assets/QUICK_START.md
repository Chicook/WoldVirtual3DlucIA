# 🚀 Guía de Inicio Rápido - Sistema de Assets

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Git

## ⚡ Instalación Rápida

### 1. Clonar y configurar
```bash
cd assets
npm run setup
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
# Edita el archivo .env con tus configuraciones
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Compilar
```bash
npm run build
```

### 5. Iniciar
```bash
npm start
```

## 🎯 Uso Básico

### Procesar un asset individual
```javascript
const { AssetsSystem } = require('@metaverso/assets');

const assetsSystem = new AssetsSystem();
await assetsSystem.initialize();

const result = await assetsSystem.processAsset('./model.glb', {
  optimization: { quality: 85 },
  compression: { algorithm: 'gzip' },
  upload: { platform: 'ipfs' }
});

console.log(`✅ Asset procesado: ${result.stats.reduction.toFixed(1)}% reducción`);
```

### Procesar múltiples assets
```javascript
const filePaths = [
  './assets/models/character.glb',
  './assets/textures/skin.png',
  './assets/audio/ambient.mp3'
];

const results = await assetsSystem.processAssets(filePaths, {
  batchSize: 5,
  optimization: { quality: 80 },
  upload: { platform: 'arweave' }
});
```

### Buscar assets
```javascript
const assets = await assetsSystem.searchAssets({
  type: '3d_model',
  category: 'character',
  size: { min: 1024 * 1024 }, // > 1MB
  tags: ['animated'],
  limit: 20
});
```

## 🛠️ CLI Interactivo

### Comandos principales
```bash
# Inicializar sistema
npm run setup

# Procesar asset individual
node dist/cli.js process ./model.glb

# Procesar directorio completo
node dist/cli.js process-batch ./assets

# Buscar assets
node dist/cli.js search --type "3d_model"

# Ver estadísticas
node dist/cli.js stats
```

## 📊 Tipos de Assets Soportados

### Modelos 3D
- **glTF/GLB**: Formato estándar para web
- **FBX**: Para animaciones complejas
- **OBJ**: Para modelos simples
- **DAE**: Para compatibilidad con Blender

### Texturas e Imágenes
- **PNG**: Para transparencias
- **JPG/JPEG**: Para texturas sin transparencia
- **WebP**: Para compresión moderna
- **SVG**: Para gráficos vectoriales

### Audio
- **MP3**: Para música y sonidos largos
- **WAV**: Para calidad sin pérdida
- **OGG**: Para mejor compresión
- **AAC**: Para dispositivos móviles

## 🔧 Configuración Avanzada

### Optimización personalizada
```javascript
const options = {
  optimization: {
    quality: 90,
    format: 'webp',
    maxWidth: 2048,
    maxHeight: 2048
  },
  compression: {
    algorithm: 'brotli',
    level: 11
  },
  upload: {
    platform: 'ipfs',
    public: true,
    tags: ['character', '3d']
  }
};
```

### Configuración de plataformas
```json
{
  "upload": {
    "platforms": {
      "ipfs": {
        "endpoint": "https://ipfs.infura.io:5001",
        "apiKey": "tu_api_key"
      },
      "arweave": {
        "endpoint": "https://arweave.net",
        "wallet": "tu_wallet"
      }
    }
  }
}
```

## 🧪 Pruebas

### Ejecutar pruebas unitarias
```bash
npm test
```

### Ejecutar pruebas con cobertura
```bash
npm run test:coverage
```

## 📝 Logs y Monitoreo

### Ver logs en tiempo real
```bash
tail -f logs/assets.log
```

### Ver estadísticas del sistema
```javascript
const stats = await assetsSystem.getStats();
console.log(`Total assets: ${stats.totalAssets}`);
console.log(`Tamaño total: ${stats.totalSize} bytes`);
console.log(`Optimización promedio: ${stats.averageOptimization}%`);
```

## 🔒 Seguridad

### Validación de archivos
- Verificación de integridad con SHA256
- Escaneo de virus opcional
- Validación de tipos MIME
- Control de tamaño máximo

### Control de acceso
```javascript
const securityConfig = {
  accessControl: {
    enabled: true,
    roles: ['admin', 'artist', 'viewer'],
    permissions: {
      admin: ['read', 'write', 'delete', 'manage'],
      artist: ['read', 'write'],
      viewer: ['read']
    }
  }
};
```

## 🚨 Solución de Problemas

### Error: "Module not found"
```bash
npm install
npm run build
```

### Error: "Database connection failed"
```bash
npm run setup
# Verifica que el archivo .env esté configurado
```

### Error: "Upload failed"
- Verifica las credenciales de las plataformas
- Revisa la conectividad a internet
- Consulta los logs en `logs/assets.log`

## 📞 Soporte

- 📧 Email: support@metaverso.com
- 📖 Documentación: `/docs`
- 🐛 Issues: GitHub Issues
- 💬 Discord: Metaverso Community

---

**¡Listo para procesar assets del metaverso! 🎮✨** 