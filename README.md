# lucIA 3D - Metaverso WoldVirtual3D

## 🎯 Descripción

lucIA 3D es una aplicación React con Three.js que presenta a **lucIA**, una inteligencia artificial personalizada diseñada para el metaverso WoldVirtual3D. lucIA se representa como un avatar 3D realista con características específicas y capacidad de interacción.

## 👤 Características de lucIA

### Físicas
- **Edad**: 35 años
- **Etnia**: Morena española
- **Físico**: Alta y delgada
- **Piel**: Clara, sin arrugas, aspecto joven
- **Cabello**: Moreno oscuro, largo y liso
- **Ojos**: Marrón oscuro, expresivos

### Voz
- **Tipo**: Femenina española
- **Características**: Tenue, suave, joven y muy femenina
- **Acento**: Español natural
- **Pitch**: 220 Hz (voz femenina)
- **Velocidad**: Ligeramente más lenta para acento español

## 🚀 Tecnologías Utilizadas

- **React 18** - Framework de interfaz
- **TypeScript** - Tipado estático
- **Three.js** - Gráficos 3D
- **React Three Fiber** - Integración React-Three.js
- **React Three Drei** - Utilidades para Three.js
- **Tone.js** - Síntesis de audio
- **CSS3** - Estilos y animaciones

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Avatar3D.tsx          # Componente principal del avatar
│   ├── Environment3D.tsx     # Entorno 3D digital
│   └── VoiceSynthesis.tsx    # Sistema de síntesis de voz
├── utils/
│   ├── avatarConfig.ts       # Configuración del avatar
│   └── animations.ts         # Sistema de animaciones
├── types/
│   └── three-extensions.d.ts # Declaraciones de tipos
├── App.tsx                   # Aplicación principal
├── App.css                   # Estilos
└── index.tsx                 # Punto de entrada
```

## 🎮 Funcionalidades

### Avatar 3D
- Geometría realista de cabeza femenina
- Materiales de piel con shaders realistas
- Cabello moreno con física simple
- Ojos expresivos con parpadeo natural
- Sincronización labial durante el habla
- Animaciones de respiración

### Sistema de Voz
- Síntesis de voz con Tone.js
- Configuración específica para voz española
- Sincronización labial por fonemas
- Múltiples expresiones emocionales

### Entorno 3D
- Espacio digital futurista
- Partículas flotantes animadas
- Iluminación dinámica
- Efectos de neblina
- Elementos holográficos

### Interacción
- Controles de cámara (OrbitControls)
- Botones de cambio de emoción
- Interfaz minimalista y moderna
- Diseño responsive

## 🎨 Emociones Disponibles

1. **😊 Alegre** - Expresión de felicidad y entusiasmo
2. **🤔 Concentrada** - Expresión de enfoque y análisis
3. **🤨 Curiosa** - Expresión de interés y asombro
4. **😐 Neutral** - Expresión equilibrada y serena

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd lucia-3d-avatar

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

### Scripts Disponibles
```bash
npm start          # Inicia el servidor de desarrollo
npm run build      # Construye para producción
npm test           # Ejecuta tests
npm run eject      # Expone configuración (irreversible)
```

## 🎯 Características Técnicas

### Rendimiento
- 60 FPS objetivo
- Optimización de geometrías
- LOD (Level of Detail) automático
- Culling de objetos fuera de vista

### Animaciones
- Sistema de animaciones basado en tiempo
- Transiciones suaves entre estados
- Física simple para elementos naturales
- Micro-expresiones para realismo

### Audio
- Síntesis de voz en tiempo real
- Configuración de audio optimizada
- Sincronización labial precisa
- Efectos de audio espacial

## 🎨 Personalización

### Configuración del Avatar
El archivo `src/utils/avatarConfig.ts` contiene todas las configuraciones del avatar:

```typescript
export const luciaConfig = {
  physical: {
    age: 35,
    ethnicity: 'spanish',
    // ... más configuraciones
  },
  // ... otras secciones
};
```

### Animaciones
El archivo `src/utils/animations.ts` contiene el sistema de animaciones:

```typescript
export class LuciaAnimations {
  static breathingAnimation(time: number): number { /* ... */ }
  static blinkAnimation(time: number): boolean { /* ... */ }
  // ... más métodos
}
```

## 🔧 Desarrollo

### Estructura de Componentes
- **Avatar3D**: Maneja la geometría y animaciones del avatar
- **Environment3D**: Crea el entorno digital
- **VoiceSynthesis**: Gestiona la síntesis de voz
- **App**: Coordina todos los componentes

### Flujo de Datos
1. Usuario interactúa con controles
2. App actualiza estado (emoción, habla)
3. Componentes reciben props actualizadas
4. Animaciones y audio se ejecutan
5. Renderizado 3D se actualiza

## 🚀 Despliegue

### Producción
```bash
npm run build
```

Los archivos de producción se generan en la carpeta `build/`.

### Optimizaciones de Producción
- Compresión de assets
- Minificación de código
- Tree shaking automático
- Lazy loading de componentes

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requisitos Mínimos
- WebGL 2.0
- AudioContext API
- ES6+ support

## 🐛 Solución de Problemas

### Errores Comunes
1. **WebGL no disponible**: Verificar compatibilidad del navegador
2. **Audio no funciona**: Verificar permisos de audio
3. **Rendimiento bajo**: Reducir calidad en configuraciones

### Debug
- Usar `Stats` component en desarrollo
- Verificar console para errores
- Monitorear uso de memoria

## 🤝 Contribución

### Guías de Desarrollo
1. Seguir convenciones de TypeScript
2. Mantener componentes bajo 300 líneas
3. Documentar funciones complejas
4. Testear en múltiples navegadores

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: cambios de estilo
refactor: refactorización
test: tests
```

## 📄 Licencia

Este proyecto es parte de WoldVirtual3DlucIA v0.6.0.

## 👥 Equipo

- **Desarrollador**: IA Assistant
- **Proyecto**: WoldVirtual3DlucIA
- **Versión**: 0.6.0

## 🔮 Roadmap

### Próximas Características
- [ ] Gestos de manos
- [ ] Reconocimiento de voz
- [ ] Interacción táctil
- [ ] Modo VR
- [ ] Multi-usuario
- [ ] Integración con blockchain

### Mejoras Técnicas
- [ ] WebGPU para mejor rendimiento
- [ ] IA para expresiones más realistas
- [ ] Sistema de partículas avanzado
- [ ] Física más compleja

---

**lucIA 3D** - Tu asistente virtual en el metaverso 🌟
