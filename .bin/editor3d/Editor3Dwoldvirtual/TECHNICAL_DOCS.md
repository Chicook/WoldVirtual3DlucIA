# Documentación Técnica - Editor 3D WoldVirtual

## Arquitectura del Sistema

### Componentes Principales

#### 1. Editor3D Class
La clase principal que gestiona toda la funcionalidad del editor.

```javascript
class Editor3D {
    constructor() {
        this.scene = null;           // Escena Three.js
        this.camera = null;          // Cámara perspectiva
        this.renderer = null;        // Renderer WebGL
        this.controls = null;        // Controles de órbita
        this.transformControls = null; // Controles de transformación
        this.selectedObject = null;  // Objeto seleccionado
        this.objects = new Map();    // Registro de objetos
    }
}
```

#### 2. Sistema de Escena
- **Scene**: Contenedor principal de objetos 3D
- **Camera**: Cámara perspectiva con controles de órbita
- **Renderer**: Renderer WebGL con sombras habilitadas
- **Lighting**: Sistema de iluminación con múltiples tipos de luz

#### 3. Sistema de Controles
- **OrbitControls**: Navegación de cámara
- **TransformControls**: Manipulación de objetos
- **Event Listeners**: Gestión de eventos de ratón y teclado

### Flujo de Datos

```
Usuario → Event Listeners → Editor3D → Three.js → Canvas
   ↑                                           ↓
   ←─────────── UI Updates ←───────────────────┘
```

## Estructura de Archivos

```
src/
├── main.js              # Lógica principal del editor
├── styles/
│   └── main.css        # Estilos de la interfaz
└── utils/
    └── editor-utils.js # Utilidades auxiliares
```

## API del Editor

### Métodos Principales

#### Inicialización
```javascript
init()                    // Inicializa Three.js y controles
setupLighting()          // Configura iluminación
setupGrid()              // Configura grid y ejes
setupEventListeners()    // Configura eventos
```

#### Gestión de Objetos
```javascript
createGeometry(type)     // Crea geometrías básicas
createLight(type)        // Crea luces
selectObject(object)     // Selecciona un objeto
deselectObject()         // Deselecciona objetos
```

#### Transformaciones
```javascript
setTool(tool)            // Cambia herramienta activa
updateObjectProperties() // Actualiza propiedades
updateMaterialColor()    // Cambia color de material
updateMaterialType()     // Cambia tipo de material
```

### Tipos de Objetos Soportados

#### Geometrías
- `box`: Cubo
- `sphere`: Esfera
- `cylinder`: Cilindro
- `plane`: Plano
- `cone`: Cono
- `torus`: Toro

#### Luces
- `ambient`: Luz ambiental
- `directional`: Luz direccional
- `point`: Luz puntual
- `spot`: Luz spot

#### Materiales
- `basic`: Material básico
- `phong`: Material Phong
- `lambert`: Material Lambert
- `standard`: Material estándar

## Sistema de Eventos

### Eventos de Ratón
```javascript
onMouseClick(event)      // Selección de objetos
onWindowResize()         // Redimensionamiento
```

### Eventos de Transformación
```javascript
'dragging-changed'       // Cambio en arrastre
'change'                 // Cambio en propiedades
```

## Gestión de Estado

### Estado del Editor
```javascript
{
    selectedObject: THREE.Object3D,
    activeTool: 'select' | 'translate' | 'rotate' | 'scale',
    objects: Map<string, ObjectData>,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
}
```

### Estructura de Objeto
```javascript
{
    mesh: THREE.Mesh,
    type: 'geometry' | 'light',
    geometryType?: string,
    lightType?: string,
    materialType?: string,
    color?: string
}
```

## Rendimiento

### Optimizaciones Implementadas

1. **Frustum Culling**: Solo renderiza objetos visibles
2. **Level of Detail**: Diferentes resoluciones según distancia
3. **Shadow Mapping**: Sombras optimizadas
4. **Object Pooling**: Reutilización de objetos
5. **Memory Management**: Limpieza automática de recursos

### Métricas de Rendimiento
- **FPS**: Frames por segundo
- **Object Count**: Número de objetos en escena
- **Polygon Count**: Número total de polígonos
- **Memory Usage**: Uso de memoria GPU

## Configuración

### Variables CSS
```css
:root {
    --primary-color: #2563eb;
    --bg-primary: #0f172a;
    --panel-width: 280px;
    --header-height: 60px;
}
```

### Configuración de Vite
```javascript
{
    server: { port: 3000 },
    build: { outDir: 'dist' },
    resolve: { alias: { '@': 'src' } }
}
```

## Extensibilidad

### Agregar Nuevas Geometrías
```javascript
// En createGeometry()
case 'nueva-geometria':
    geometry = new THREE.NuevaGeometria(parametros);
    break;
```

### Agregar Nuevos Materiales
```javascript
// En updateMaterialType()
case 'nuevo-material':
    newMaterial = new THREE.NuevoMaterial({ color });
    break;
```

### Agregar Nuevas Herramientas
```javascript
// En setTool()
case 'nueva-herramienta':
    this.transformControls.setMode('nueva-herramienta');
    break;
```

## Integración con WoldVirtual3DlucIA

### Módulo de Coordinación
```javascript
// Integración con CentralModuleCoordinator
class Editor3DModule {
    initialize(userId) {
        // Inicializar editor
    }
    
    getPublicAPI() {
        return {
            createObject: this.createObject,
            exportScene: this.exportScene,
            importScene: this.importScene
        };
    }
}
```

### Comunicación Inter-Módulo
```javascript
// Uso del InterModuleMessageBus
messageBus.publish('editor3d', 'object-created', objectData);
messageBus.subscribe('editor3d', 'scene-updated', this.handleSceneUpdate);
```

## Seguridad

### Validaciones
- Validación de tipos de geometría
- Sanitización de parámetros
- Límites en número de objetos
- Validación de archivos importados

### Permisos
- Control de acceso por usuario
- Validación de operaciones
- Auditoría de cambios

## Testing

### Estrategia de Testing
1. **Unit Tests**: Funciones individuales
2. **Integration Tests**: Interacción entre componentes
3. **E2E Tests**: Flujos completos de usuario
4. **Performance Tests**: Rendimiento bajo carga

### Herramientas de Testing
- Jest para unit tests
- Playwright para E2E tests
- Three.js testing utilities

## Deployment

### Build Process
```bash
npm run build    # Construir para producción
npm run preview  # Previsualizar build
```

### Optimizaciones de Producción
- Minificación de código
- Compresión de assets
- Code splitting
- Tree shaking

## Mantenimiento

### Logs y Debugging
```javascript
// Sistema de logging
console.log('[Editor3D]', message);
console.warn('[Editor3D] Warning:', warning);
console.error('[Editor3D] Error:', error);
```

### Monitoreo
- Performance monitoring
- Error tracking
- Usage analytics
- Resource monitoring

## Roadmap Técnico

### Fase 1 (Completada)
- [x] Editor básico con Three.js
- [x] Herramientas de transformación
- [x] Geometrías básicas
- [x] Sistema de iluminación

### Fase 2 (En Desarrollo)
- [ ] Importación/exportación de modelos
- [ ] Sistema de texturas
- [ ] Animaciones básicas
- [ ] Colaboración en tiempo real

### Fase 3 (Planificada)
- [ ] Renderizado avanzado
- [ ] Sistema de partículas
- [ ] Integración con blockchain
- [ ] Exportación a metaverso

## Troubleshooting

### Problemas Comunes

#### Error de WebGL
```javascript
// Verificar soporte de WebGL
if (!THREE.WEBGL.isWebGLAvailable()) {
    console.error('WebGL no disponible');
}
```

#### Problemas de Rendimiento
```javascript
// Reducir calidad de sombras
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
```

#### Problemas de Memoria
```javascript
// Limpiar geometrías no utilizadas
geometry.dispose();
material.dispose();
texture.dispose();
```

## Contribución

### Guías de Desarrollo
1. Seguir convenciones de código
2. Documentar nuevas funciones
3. Agregar tests para nuevas funcionalidades
4. Mantener compatibilidad con versiones anteriores

### Code Review
- Revisión de código obligatoria
- Tests automáticos
- Validación de rendimiento
- Verificación de seguridad 