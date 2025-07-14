# WoldVirtual3D Editor 3D

Editor 3D avanzado para WoldVirtual3DlucIA con soporte para WebSocket en tiempo real.

## 🚀 Características

- **Editor 3D Completo**: Viewport Three.js con controles avanzados
- **Servidor WebSocket**: Comunicación en tiempo real entre clientes
- **Sistema de Escenas**: Gestión completa de escenas 3D
- **Biblioteca de Assets**: Importación y gestión de modelos 3D
- **Constructor de Islas**: Herramientas para crear islas del metaverso
- **Animador de Avatares**: Sistema de animación avanzado
- **Inspector de Propiedades**: Edición detallada de objetos
- **Timeline**: Control de animaciones y keyframes
- **Sistema de Materiales**: Editor de materiales PBR
- **Integración con LucIA**: IA integrada para asistencia

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Navegador moderno con soporte WebGL

## 🛠️ Instalación

1. **Clonar el repositorio**:
```bash
git clone https://github.com/woldvirtual3d/editor3d.git
cd editor3d
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Iniciar el editor**:
```bash
# Opción 1: Script automático (Windows)
start-editor.bat

# Opción 2: Comandos manuales
npm run start

# Opción 3: Solo servidor WebSocket
npm run server

# Opción 4: Solo editor (sin servidor)
npm run dev
```

## 🎮 Uso

### Inicio Rápido

1. Ejecuta `start-editor.bat` (Windows) o `npm run start`
2. El servidor WebSocket se iniciará en `ws://localhost:8080`
3. El editor se abrirá en `http://localhost:5173`
4. ¡Listo para crear contenido 3D!

### Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Solo editor (modo desarrollo)
npm run server           # Solo servidor WebSocket
npm run start            # Editor + Servidor (producción)
npm run start:dev        # Editor + Servidor (desarrollo)

# Construcción
npm run build            # Construir para producción
npm run build:all        # Construir + verificación de tipos
npm run preview          # Vista previa de la construcción

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch

# Linting
npm run lint             # Verificar código
npm run lint:fix         # Corregir problemas automáticamente
npm run type-check       # Verificación de tipos TypeScript
```

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Viewport.tsx     # Viewport 3D principal
│   ├── EngineControls.tsx # Controles del motor
│   ├── EngineStatus.tsx # Estado del motor
│   ├── EngineConnector.tsx # Conector del motor
│   ├── EngineBridge.tsx # Puente WebSocket
│   ├── SceneEditor.tsx  # Editor de escenas
│   ├── ObjectPanel.tsx  # Panel de objetos
│   ├── Inspector.tsx    # Inspector de propiedades
│   ├── AssetLibrary.tsx # Biblioteca de assets
│   ├── IslandBuilder.tsx # Constructor de islas
│   ├── AvatarAnimator.tsx # Animador de avatares
│   └── Timeline.tsx     # Timeline de animaciones
├── core/
│   └── engine/
│       ├── EngineCore.ts # Motor 3D base
│       └── EngineCore.2.ts # Motor 3D avanzado
├── server/
│   ├── WebSocketServer.ts # Servidor WebSocket
│   └── startServer.ts   # Script de inicio
└── types/               # Definiciones TypeScript
```

### Componentes Principales

#### EngineCore.ts
- Gestión de conexión WebSocket
- Estado del motor 3D
- Manejo de errores y reconexión
- Configuración del motor

#### EngineCore.2.ts
- Gestión de escenas 3D
- Operaciones de objetos
- Sistema de selección
- Historial de operaciones (undo/redo)

#### EngineConnector.tsx
- Contexto React para el motor
- Hooks personalizados
- Integración con componentes UI

#### EngineBridge.tsx
- Puente entre motor y UI
- Diagnóstico del motor
- Estado de conexión visual

#### WebSocketServer.ts
- Servidor WebSocket robusto
- Manejo de múltiples clientes
- Heartbeat y ping/pong
- Broadcast de mensajes

## 🔧 Configuración

### Variables de Entorno

```bash
# Servidor WebSocket
EDITOR3D_PORT=8080              # Puerto del servidor
EDITOR3D_HOST=localhost          # Host del servidor
EDITOR3D_MAX_CLIENTS=100         # Máximo de clientes

# Editor
VITE_ENGINE_URL=ws://localhost:8080  # URL del motor
VITE_API_URL=http://localhost:3000   # URL de la API
```

### Configuración del Motor

```typescript
// Configuración por defecto
const defaultConfig = {
  url: 'localhost',
  port: 8080,
  protocol: 'ws',
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 2000,
  autoReconnect: true
};
```

## 🌐 WebSocket API

### Mensajes del Cliente

```typescript
// Ping/Pong
{ type: 'ping', timestamp: number }

// Comandos del motor
{ 
  type: 'engine_command', 
  timestamp: number,
  data: { command: string, params: any } 
}

// Actualización de escena
{ 
  type: 'scene_update', 
  timestamp: number,
  data: { sceneId: string, updates: any } 
}

// Operación de objeto
{ 
  type: 'object_operation', 
  timestamp: number,
  data: { operation: string, objectId: string, data: any } 
}

// Solicitud de asset
{ 
  type: 'asset_request', 
  timestamp: number,
  data: { assetId: string, assetType: string } 
}
```

### Respuestas del Servidor

```typescript
// Bienvenida
{ 
  type: 'welcome', 
  timestamp: number,
  data: { clientId: string, serverTime: string, config: any } 
}

// Respuesta de comando
{ 
  type: 'engine_response', 
  timestamp: number,
  data: { command: string, success: boolean, result: any } 
}

// Broadcast de actualización
{ 
  type: 'scene_update_broadcast', 
  timestamp: number,
  data: { clientId: string, sceneId: string, updates: any } 
}
```

## 🎨 Interfaz de Usuario

### Paneles Principales

1. **Viewport**: Área principal de visualización 3D
2. **EngineControls**: Controles del motor y herramientas
3. **ObjectPanel**: Lista y gestión de objetos
4. **Inspector**: Propiedades del objeto seleccionado
5. **AssetLibrary**: Biblioteca de modelos y texturas
6. **Timeline**: Control de animaciones
7. **EngineStatus**: Estado de conexión y rendimiento

### Atajos de Teclado

- `W`: Herramienta de traslación
- `E`: Herramienta de rotación
- `R`: Herramienta de escala
- `Q`: Herramienta de selección
- `Delete`: Eliminar objeto seleccionado
- `Ctrl+Z`: Deshacer
- `Ctrl+Y`: Rehacer
- `Ctrl+D`: Duplicar objeto
- `Ctrl+G`: Agrupar objetos
- `F`: Enfocar objeto seleccionado

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test -- --coverage
```

## 📦 Construcción

```bash
# Construcción de desarrollo
npm run build

# Construcción de producción
NODE_ENV=production npm run build

# Vista previa
npm run preview
```

## 🐛 Solución de Problemas

### Error de Conexión WebSocket

1. Verificar que el servidor esté ejecutándose:
```bash
npm run server
```

2. Verificar el puerto en la configuración
3. Revisar firewall y antivirus
4. Usar `npm run server:auto` para puerto automático

### Problemas de Rendimiento

1. Reducir calidad de texturas
2. Deshabilitar sombras en tiempo real
3. Limitar número de objetos en escena
4. Usar LOD (Level of Detail)

### Errores de TypeScript

```bash
# Verificar tipos
npm run type-check

# Corregir automáticamente
npm run lint:fix
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/woldvirtual3d/editor3d/issues)
- **Documentación**: [Wiki](https://github.com/woldvirtual3d/editor3d/wiki)
- **Discord**: [Servidor de la comunidad](https://discord.gg/woldvirtual3d)

## 🗺️ Roadmap

- [ ] Soporte para VR/AR
- [ ] Exportación a formatos adicionales
- [ ] Sistema de plugins
- [ ] Colaboración en tiempo real
- [ ] Integración con blockchain
- [ ] IA avanzada para generación de contenido
- [ ] Soporte para múltiples motores 3D
- [ ] Sistema de versionado de escenas

---

**Desarrollado con ❤️ por el equipo de WoldVirtual3d** 