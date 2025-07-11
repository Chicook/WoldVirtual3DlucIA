# lucIA 3D - Documentación Completa
## WoldVirtual3DlucIA v0.6.0

### 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Características de lucIA](#características-de-lucia)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Uso del Sistema](#uso-del-sistema)
6. [API de Desarrollo](#api-de-desarrollo)
7. [Troubleshooting](#troubleshooting)
8. [Roadmap](#roadmap)

---

## 🎯 Descripción General

**lucIA 3D** es un sistema de avatar virtual 3D integrado en el metaverso WoldVirtual3D. Representa a una inteligencia artificial femenina de 35 años, morena española, con voz natural y expresiones emocionales realistas.

### Características Principales
- ✅ Avatar 3D realista con geometría personalizada
- ✅ Síntesis de voz española natural
- ✅ Animaciones fluidas y expresiones emocionales
- ✅ Entorno digital futurista
- ✅ Sincronización labial en tiempo real
- ✅ Sistema modular y extensible

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
Entorno3D_lucIA/
├── lucia-3d-core.ts          # Sistema principal 3D (300 líneas)
├── lucia-animations.ts       # Sistema de animaciones (250 líneas)
├── lucia-voice-system.ts     # Síntesis de voz (280 líneas)
├── lucia-environment.ts      # Entorno 3D digital (250 líneas)
├── lucia-main.ts             # Integración principal (200 líneas)
├── lucia-demo.html           # Demostración HTML (300 líneas)
└── lucia-documentation.md    # Documentación (este archivo)
```

### Patrón de Diseño
- **Singleton Pattern**: Cada sistema principal es una instancia única
- **Modular Architecture**: Cada funcionalidad está separada en módulos
- **Event-Driven**: Comunicación entre módulos mediante callbacks
- **TypeScript**: Tipado estático para mayor robustez

---

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

### Emociones Disponibles
1. **😊 Alegre** - Expresión de felicidad y entusiasmo
2. **🤔 Concentrada** - Expresión de enfoque y análisis
3. **🤨 Curiosa** - Expresión de interés y asombro
4. **😐 Neutral** - Expresión equilibrada y serena

---

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Navegador moderno con WebGL 2.0
- Soporte para AudioContext API
- TypeScript (para desarrollo)

### Instalación
```bash
# Los archivos ya están en el directorio Entorno3D_lucIA
# No se requiere instalación adicional
```

### Configuración
```typescript
// Importar el sistema
import { luciaUtils } from './lucia-main.js';

// Inicializar
await luciaUtils.initialize(containerElement);
```

---

## 🎮 Uso del Sistema

### Uso Básico
```typescript
// 1. Inicializar
await luciaUtils.initialize(container);

// 2. Presentar lucIA
await luciaUtils.present();

// 3. Cambiar emoción
await luciaUtils.changeEmotion('happy');

// 4. Hablar texto personalizado
await luciaUtils.speak("Hola, ¿cómo estás?");
```

### Uso Avanzado
```typescript
// Obtener estado actual
const state = luciaUtils.getState();
console.log('Estado:', state);

// Verificar si está hablando
if (luciaUtils.isSpeaking()) {
    console.log('lucIA está hablando');
}

// Pausar/Reanudar
luciaUtils.pause();
luciaUtils.resume();

// Limpiar recursos
luciaUtils.cleanup();
```

---

## 🔧 API de Desarrollo

### luciaUtils
```typescript
interface LuciaUtils {
    // Inicialización
    initialize(container: HTMLElement): Promise<void>;
    
    // Interacción
    present(): Promise<void>;
    changeEmotion(emotion: EmotionType): Promise<void>;
    speak(text: string): Promise<void>;
    
    // Estado
    getState(): LuciaState;
    isSpeaking(): boolean;
    
    // Control
    pause(): void;
    resume(): void;
    cleanup(): void;
    
    // Información
    getInfo(): SystemInfo;
}
```

### LuciaState
```typescript
interface LuciaState {
    isInitialized: boolean;
    isSpeaking: boolean;
    currentEmotion: 'neutral' | 'happy' | 'concentrated' | 'curious';
    currentText: string;
    mouthOpenness: number;
    isAnimating: boolean;
}
```

### Configuración
```typescript
interface LuciaConfig {
    physical: {
        age: number;
        ethnicity: string;
        height: string;
        build: string;
        skinTone: THREE.Color;
        hairColor: THREE.Color;
        eyeColor: THREE.Color;
        lipColor: THREE.Color;
    };
    voice: {
        pitch: number;
        rate: number;
        volume: number;
        vibrato: number;
        attack: number;
        decay: number;
        sustain: number;
        release: number;
    };
    // ... más configuraciones
}
```

---

## 🎨 Personalización

### Modificar Apariencia
```typescript
// En lucia-3d-core.ts
export const luciaConfig: LuciaConfig = {
    physical: {
        age: 35,
        ethnicity: 'spanish',
        height: 'tall',
        build: 'slim',
        skinTone: new THREE.Color(0xf5d0c5), // Piel clara española
        hairColor: new THREE.Color(0x2c1810), // Moreno oscuro
        eyeColor: new THREE.Color(0x4a4a4a), // Marrón oscuro
        lipColor: new THREE.Color(0xd4a5a5) // Labios naturales
    },
    // ... más configuraciones
};
```

### Modificar Voz
```typescript
// En lucia-3d-core.ts
voice: {
    pitch: 220, // Hz - voz femenina
    rate: 0.9, // Velocidad ligeramente más lenta para acento español
    volume: -10, // dB - volumen suave
    vibrato: 0.1, // Ligero vibrato para naturalidad
    attack: 0.1, // Ataque suave
    decay: 0.3, // Decay natural
    sustain: 0.7, // Sustain para mantener la voz
    release: 0.5 // Release suave
}
```

### Modificar Animaciones
```typescript
// En lucia-3d-core.ts
animations: {
    breathing: {
        frequency: 0.5, // Hz
        amplitude: 0.02
    },
    blinking: {
        frequency: 3, // segundos entre parpadeos
        duration: 0.15 // segundos de parpadeo
    },
    speaking: {
        frequency: 8, // Hz para movimiento de boca
        amplitude: 0.1
    }
}
```

---

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. WebGL no disponible
**Síntoma**: Error "WebGL not supported"
**Solución**: Verificar compatibilidad del navegador

#### 2. Audio no funciona
**Síntoma**: No se escucha la voz de lucIA
**Solución**: 
- Verificar permisos de audio
- Hacer clic en la página para activar AudioContext
- Verificar volumen del sistema

#### 3. Rendimiento bajo
**Síntoma**: Animaciones lentas o saltadas
**Solución**:
- Reducir calidad de partículas
- Cerrar otras aplicaciones
- Verificar drivers de gráficos

#### 4. Error de inicialización
**Síntoma**: "Error inicializando lucIA"
**Solución**:
- Verificar que todos los archivos estén presentes
- Verificar consola para errores específicos
- Reiniciar navegador

### Logs de Debug
```typescript
// Habilitar logs detallados
console.log('Estado de lucIA:', luciaUtils.getState());
console.log('Información del sistema:', luciaUtils.getInfo());
```

---

## 🚀 Roadmap

### Versión 0.7.0 (Próxima)
- [ ] Gestos de manos
- [ ] Reconocimiento de voz
- [ ] Interacción táctil
- [ ] Modo VR básico

### Versión 0.8.0
- [ ] Multi-usuario
- [ ] Integración con blockchain
- [ ] IA para expresiones más realistas
- [ ] Sistema de partículas avanzado

### Versión 0.9.0
- [ ] WebGPU para mejor rendimiento
- [ ] Física más compleja
- [ ] Animaciones faciales avanzadas
- [ ] Integración con servicios externos

### Versión 1.0.0
- [ ] Sistema completo de metaverso
- [ ] Integración con WoldVirtual3D
- [ ] API pública
- [ ] Documentación completa

---

## 📞 Soporte

### Información del Sistema
```typescript
const info = luciaUtils.getInfo();
console.log('Versión:', info.version);
console.log('Características:', info.features);
console.log('Estado:', info.status);
```

### Contacto
- **Proyecto**: WoldVirtual3DlucIA
- **Versión**: 0.6.0
- **Desarrollador**: IA Assistant

---

## 📄 Licencia

Este proyecto es parte de WoldVirtual3DlucIA v0.6.0.

---

**lucIA 3D** - Tu asistente virtual en el metaverso 🌟 