# Sistema de Generación de Avatares - Three.js Metaverso

## 🎭 Descripción

El Sistema de Generación de Avatares es una solución completa y 100% original para crear avatares únicos en Three.js. Utiliza generación procedural para crear geometrías, texturas y materiales únicos para cada avatar, perfecto para aplicaciones de metaverso.

## ✨ Características Principales

### 🎨 Generación Procedural Completa
- **Geometrías únicas** generadas algorítmicamente
- **Texturas procedurales** originales sin dependencias externas
- **Materiales personalizados** con shaders avanzados
- **Colores y patrones únicos** basados en semillas

### 🤖 Personalización Avanzada
- **Múltiples estilos**: Cyberpunk, Fantasy, Realistic, Abstract
- **Partes del cuerpo**: Cabeza, torso, extremidades, detalles faciales
- **Animaciones personalizadas**: Idle, walk, run, gestos
- **Expresiones faciales** dinámicas

### ⚡ Rendimiento Optimizado
- **LOD automático** (Level of Detail)
- **Instancing** para múltiples avatares
- **Caché inteligente** de recursos
- **Optimización automática** de geometrías

## 🚀 Instalación

### Requisitos Previos
```bash
# Three.js r128+
npm install three@latest

# Dependencias opcionales para ejemplos
npm install tween.js
npm install three-orbit-controls
```

### Instalación del Sistema
```bash
# Clonar o descargar los archivos del sistema
# Copiar los archivos a tu proyecto:
# - avatar-generator.js
# - avatar-config.js
# - avatar-example.js
# - avatar-styles.css
```

### Inclusión en HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>Sistema de Avatares</title>
    <link rel="stylesheet" href="avatar-styles.css">
</head>
<body>
    <!-- Canvas para Three.js -->
    <div id="avatar-container"></div>
    
    <!-- Scripts -->
    <script src="three.min.js"></script>
    <script src="avatar-config.js"></script>
    <script src="avatar-generator.js"></script>
    <script src="avatar-example.js"></script>
</body>
</html>
```

## 📖 Uso Básico

### 1. Inicializar el Sistema
```javascript
// Crear generador de avatares
const avatarGenerator = new AvatarGenerator();

// Configurar opciones por defecto
avatarGenerator.setLOD({
    enabled: true,
    distances: [10, 50, 100],
    quality: ['high', 'medium', 'low']
});
```

### 2. Generar Avatar Único
```javascript
// Generar avatar con opciones específicas
const avatar = await avatarGenerator.generateAvatar({
    seed: 'unique_seed_123',
    style: 'cyberpunk',
    gender: 'neutral',
    height: 'tall',
    build: 'athletic',
    hairStyle: 'spiky',
    eyeColor: 'red',
    skinTone: 'medium',
    clothing: 'armor',
    accessories: ['glasses', 'cybernetics'],
    effects: ['glow', 'hologram']
});

// Agregar a la escena
scene.add(avatar.mesh);

// Animar avatar
avatar.animations.play('idle');
```

### 3. Generar Múltiples Avatares
```javascript
// Generar múltiples avatares
const avatars = await avatarGenerator.generateAvatars(10, {
    style: 'fantasy'
});

// Posicionar en la escena
avatars.forEach((avatar, index) => {
    avatar.mesh.position.set(
        (index - 5) * 4,
        0,
        0
    );
    scene.add(avatar.mesh);
});
```

## 🎨 Estilos Disponibles

### Cyberpunk
```javascript
const cyberpunkAvatar = await avatarGenerator.generateAvatar({
    style: 'cyberpunk',
    gender: 'neutral',
    height: 'tall',
    build: 'athletic',
    hairStyle: 'spiky',
    eyeColor: 'red',
    clothing: 'armor',
    accessories: ['glasses', 'cybernetics'],
    effects: ['glow', 'hologram']
});
```

**Características:**
- Geometrías angulares y futuristas
- Colores neón y metálicos
- Efectos de holograma y partículas
- Accesorios tecnológicos

### Fantasy
```javascript
const fantasyAvatar = await avatarGenerator.generateAvatar({
    style: 'fantasy',
    gender: 'female',
    height: 'average',
    build: 'slim',
    hairStyle: 'long',
    eyeColor: 'blue',
    skinTone: 'exotic',
    clothing: 'armor',
    accessories: ['crown', 'magic_staff'],
    effects: ['magic', 'particles']
});
```

**Características:**
- Formas orgánicas y fluidas
- Colores mágicos y brillantes
- Efectos de energía y magia
- Accesorios mágicos

### Realistic
```javascript
const realisticAvatar = await avatarGenerator.generateAvatar({
    style: 'realistic',
    gender: 'male',
    height: 'average',
    build: 'athletic',
    hairStyle: 'short',
    eyeColor: 'brown',
    skinTone: 'medium',
    clothing: 'casual',
    accessories: ['glasses']
});
```

**Características:**
- Proporciones humanas realistas
- Texturas de piel naturales
- Materiales PBR realistas
- Animaciones fluidas

### Abstract
```javascript
const abstractAvatar = await avatarGenerator.generateAvatar({
    style: 'abstract',
    gender: 'neutral',
    height: 'tall',
    build: 'slim',
    hairStyle: 'bald',
    eyeColor: 'blue',
    skinTone: 'exotic',
    clothing: 'naked',
    effects: ['distortion', 'energy']
});
```

**Características:**
- Formas geométricas únicas
- Colores vibrantes y contrastantes
- Efectos de distorsión
- Animaciones no convencionales

## ⚙️ Configuración Avanzada

### Opciones de Generación
```javascript
const options = {
    // Semilla para generación reproducible
    seed: 'unique_identifier',
    
    // Estilo del avatar
    style: 'cyberpunk' | 'fantasy' | 'realistic' | 'abstract',
    
    // Características físicas
    gender: 'male' | 'female' | 'neutral',
    height: 'short' | 'average' | 'tall',
    build: 'slim' | 'average' | 'athletic' | 'heavy',
    
    // Personalización
    hairStyle: 'short' | 'long' | 'bald' | 'spiky',
    eyeColor: 'blue' | 'green' | 'brown' | 'red',
    skinTone: 'light' | 'medium' | 'dark' | 'exotic',
    
    // Ropa y accesorios
    clothing: 'casual' | 'formal' | 'armor' | 'naked',
    accessories: ['glasses', 'hat', 'jewelry'],
    
    // Efectos especiales
    effects: ['glow', 'particles', 'hologram'],
    
    // Optimización
    lod: true,
    instancing: false,
    cache: true
};
```

### Configuración de Rendimiento
```javascript
// Configurar LOD
avatarGenerator.setLOD({
    enabled: true,
    distances: [10, 50, 100],
    quality: ['high', 'medium', 'low']
});

// Configurar caché
avatarGenerator.setCache({
    enabled: true,
    maxSize: 1000,
    ttl: 3600000 // 1 hora
});
```

## 🎬 Animaciones

### Animaciones Disponibles
```javascript
// Reproducir animación
avatar.animations.play('idle');
avatar.animations.play('walk');
avatar.animations.play('run');

// Pausar animación
avatar.animations.pause();

// Detener animación
avatar.animations.stop();

// Mezclar animaciones
avatar.animations.blend('idle', 'walk', 1000);
```

### Crear Animación Personalizada
```javascript
const customAnimation = avatar.animations.createCustomAnimation([
    { time: 0, rotation: [0, 0, 0] },
    { time: 1, rotation: [0, Math.PI, 0] },
    { time: 2, rotation: [0, Math.PI * 2, 0] }
]);

avatar.animations.play(customAnimation);
```

## 🔧 API Completa

### AvatarGenerator

#### Métodos Principales
```javascript
class AvatarGenerator {
    // Generar avatar único
    async generateAvatar(options: AvatarOptions): Promise<Avatar>
    
    // Generar múltiples avatares
    async generateAvatars(count: number, options: AvatarOptions): Promise<Avatar[]>
    
    // Generar avatar desde semilla
    async generateFromSeed(seed: string, options: AvatarOptions): Promise<Avatar>
    
    // Clonar avatar existente
    cloneAvatar(avatar: Avatar, modifications: Partial<AvatarOptions>): Avatar
    
    // Exportar avatar
    exportAvatar(avatar: Avatar, format: 'gltf' | 'obj' | 'fbx'): Promise<Blob>
    
    // Importar avatar
    async importAvatar(data: Blob): Promise<Avatar>
    
    // Configurar LOD
    setLOD(config: LODConfig): void
    
    // Configurar caché
    setCache(config: CacheConfig): void
}
```

### Avatar

#### Propiedades y Métodos
```javascript
interface Avatar {
    // Geometría y renderizado
    mesh: THREE.Group
    geometry: THREE.BufferGeometry
    materials: THREE.Material[]
    
    // Animaciones
    animations: AnimationSystem
    skeleton: THREE.Skeleton
    
    // Metadatos
    id: string
    seed: string
    options: AvatarOptions
    metadata: AvatarMetadata
    
    // Métodos
    update(deltaTime: number): void
    setAnimation(name: string): void
    setExpression(expression: string): void
    setPose(pose: Pose): void
    dispose(): void
}
```

## 📊 Optimización y Rendimiento

### LOD (Level of Detail)
```javascript
// Configurar LOD automático
avatarGenerator.setLOD({
    enabled: true,
    distances: [10, 50, 100],
    quality: ['high', 'medium', 'low']
});
```

### Instancing
```javascript
// Crear múltiples instancias del mismo avatar
const instances = avatarGenerator.createInstances(avatar, 100);
scene.add(instances);
```

### Caché
```javascript
// Habilitar caché de avatares
avatarGenerator.setCache({
    enabled: true,
    maxSize: 1000,
    ttl: 3600000 // 1 hora
});
```

## 🎮 Ejemplo Completo

### Ejecutar Ejemplo
```javascript
// Crear instancia del ejemplo
const avatarExample = new AvatarExample();

// Inicializar
await avatarExample.initialize();

// El ejemplo incluye:
// - 4 avatares de diferentes estilos
// - Controles de navegación
// - Animaciones
// - Interfaz de usuario
// - Métricas en tiempo real
```

### Controles del Ejemplo
- **Espacio**: Cambiar avatar
- **Flechas**: Navegar entre avatares
- **A**: Animar avatar actual
- **R**: Rotar avatar
- **N**: Generar nuevo avatar
- **Mouse**: Controlar cámara
- **Rueda**: Zoom

## 🔧 Extensibilidad

### Plugins Personalizados
```javascript
// Crear plugin personalizado
class CustomAvatarPlugin {
    constructor(generator) {
        this.generator = generator;
    }
    
    // Añadir características personalizadas
    addCustomFeatures(avatar, options) {
        // Implementación personalizada
    }
}

// Registrar plugin
avatarGenerator.registerPlugin(new CustomAvatarPlugin(avatarGenerator));
```

### Shaders Personalizados
```javascript
// Crear shader personalizado
const customShader = {
    vertexShader: `
        // Código del vertex shader
    `,
    fragmentShader: `
        // Código del fragment shader
    `,
    uniforms: {
        // Uniforms personalizados
    }
};

// Aplicar shader al avatar
avatar.applyCustomShader(customShader);
```

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Error de memoria
```javascript
// Solución: Limpiar caché
avatarGenerator.clearCache();

// O reducir tamaño de caché
avatarGenerator.setCache({
    enabled: true,
    maxSize: 100, // Reducir de 1000 a 100
    ttl: 1800000 // Reducir TTL a 30 minutos
});
```

#### 2. Rendimiento lento
```javascript
// Solución: Habilitar LOD
avatarGenerator.setLOD({
    enabled: true,
    distances: [5, 25, 50], // Reducir distancias
    quality: ['high', 'low'] // Solo 2 niveles
});
```

#### 3. Texturas no se cargan
```javascript
// Solución: Verificar configuración
const avatar = await avatarGenerator.generateAvatar({
    style: 'realistic', // Usar estilo más simple
    effects: [] // Sin efectos especiales
});
```

## 📝 Notas de Desarrollo

### Generación Procedural
- Todas las geometrías se generan algorítmicamente
- Las texturas se crean usando Canvas API
- Los materiales usan shaders personalizados
- No hay dependencias de archivos externos

### Optimización
- Geometrías optimizadas automáticamente
- LOD dinámico basado en distancia
- Caché inteligente de recursos
- Instancing para múltiples avatares

### Compatibilidad
- Three.js r128+
- WebGL 2.0 compatible
- Navegadores modernos
- Soporte para móviles

## 📄 Licencia

Este sistema es parte del proyecto Metaverso Crypto World Virtual 3D y está sujeto a los términos de licencia del proyecto.

## 🤝 Contribuciones

Para contribuir al sistema de avatares:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Añade tests si es necesario
5. Envía un pull request

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema de avatares:

- Crear un issue en el repositorio
- Consultar la documentación completa
- Revisar los ejemplos incluidos

---

**¡Disfruta creando avatares únicos para tu metaverso! 🎭✨** 