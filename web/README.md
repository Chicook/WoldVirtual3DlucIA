# WoldVirtual3DlucIA - Sistema Modular Web

## 🎯 Descripción

Este es el sistema modular web de **WoldVirtual3DlucIA**, un metaverso descentralizado ultra-modular donde cada carpeta del proyecto se representa como un componente React independiente, coordinado por el **CentralModuleCoordinator** y comunicado a través del **InterModuleMessageBus**.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **CentralModuleCoordinator** (`src/core/CentralModuleCoordinator.ts`)
   - Coordinador central que gestiona todos los módulos
   - Carga dinámica de módulos por grupos funcionales
   - Registro centralizado de componentes React
   - Gestión de estado de módulos por usuario

2. **InterModuleMessageBus** (`src/core/InterModuleMessageBus.ts`)
   - Sistema de comunicación entre módulos
   - Patrón pub/sub para eventos
   - Historial de eventos y estadísticas
   - Solicitud de componentes con callbacks

3. **Módulos por Carpeta**
   - Cada carpeta del proyecto tiene su módulo correspondiente
   - Componentes React específicos para cada funcionalidad
   - APIs públicas e internas por módulo

### Grupos de Módulos

```typescript
ModuleGroups = {
  CORE: ['config', 'data', 'models', 'services', 'middlewares'],
  FRONTEND: ['web', 'pages', 'components', 'css', 'fonts', 'public'],
  BLOCKCHAIN: ['bloc', 'assets', 'entities'],
  AI: ['ini', 'js', 'test'],
  UTILITIES: ['helpers', 'cli', 'scripts', 'lib', 'languages'],
  MEDIA: ['image', 'fonts', 'css', 'public'],
  EDITOR: ['.bin', 'client', 'src'],
  INFRASTRUCTURE: ['build', 'dist', 'coverage', 'docs', 'Include']
}
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
cd web
npm install
```

### 2. Desarrollo

```bash
npm run dev
```

### 3. Construcción

```bash
npm run build
```

## 📁 Estructura de Archivos

```
web/
├── src/
│   ├── core/
│   │   ├── CentralModuleCoordinator.ts    # Coordinador principal
│   │   └── InterModuleMessageBus.ts       # Sistema de mensajes
│   ├── modules/
│   │   ├── BinModule.ts                   # Módulo .bin (Editor 3D)
│   │   ├── WebModule.ts                   # Módulo web principal
│   │   ├── ComponentsModule.ts            # Módulo de componentes
│   │   └── ...                            # Otros módulos
│   ├── components/
│   │   ├── MainAppComponent.tsx           # Componente principal
│   │   ├── Editor3DComponent.tsx          # Editor 3D
│   │   ├── EngineBridgeComponent.tsx      # Conexión engine
│   │   ├── BinaryToolsComponent.tsx       # Herramientas
│   │   ├── NavigationComponent.tsx        # Navegación
│   │   └── DashboardComponent.tsx         # Dashboard
│   ├── styles/
│   │   └── main.css                       # Estilos principales
│   └── index.tsx                          # Punto de entrada
├── index.html                             # HTML principal
└── README.md                              # Esta documentación
```

## 🔧 Uso del Sistema

### Cargar un Módulo

```typescript
import { centralCoordinator } from './core/CentralModuleCoordinator';

// Cargar módulo específico
const binModule = await centralCoordinator.loadModule('.bin', userId);

// Cargar grupo de módulos
await centralCoordinator.loadModuleGroup('BLOCKCHAIN', userId);
```

### Comunicación entre Módulos

```typescript
import { messageBus } from './core/InterModuleMessageBus';

// Publicar evento
messageBus.publish('load-component', {
  componentName: 'Editor3D',
  props: { userId },
  targetId: 'dynamic-content'
});

// Suscribirse a eventos
messageBus.subscribe('module-status-update', (status) => {
  console.log('Estado actualizado:', status);
});
```

### Cargar Componente Dinámicamente

```typescript
// Desde cualquier módulo
messageBus.publish('load-component', {
  componentName: 'EngineBridge',
  props: { port: 8181, autoConnect: true },
  targetId: 'engine-container'
});
```

## 🎨 Componentes Disponibles

### Editor 3D (`.bin`)
- **Editor3DComponent**: Editor 3D completo con herramientas
- **EngineBridgeComponent**: Conexión WebSocket con engine
- **BinaryToolsComponent**: Herramientas de compilación

### Dashboard Principal
- **MainAppComponent**: Aplicación principal con navegación
- **NavigationComponent**: Menú de navegación
- **DashboardComponent**: Panel de control y métricas

## 🔄 Flujo de Carga

1. **Inicialización**: Se carga el módulo `web` principal
2. **Carga de Dependencias**: Se cargan módulos core y frontend
3. **Registro de Componentes**: Los componentes se registran en el coordinador
4. **Renderizado**: La aplicación React se renderiza
5. **Carga Bajo Demanda**: Los módulos adicionales se cargan según necesidad

## 🎯 Características Principales

### ✅ Implementado
- ✅ Sistema de módulos modulares
- ✅ Carga dinámica de componentes
- ✅ Comunicación inter-módulo
- ✅ Coordinador central
- ✅ Componentes React para cada carpeta
- ✅ Sistema de navegación
- ✅ Dashboard con métricas
- ✅ Editor 3D básico
- ✅ Engine Bridge WebSocket
- ✅ Herramientas binarias

### 🚧 En Desarrollo
- 🔄 Módulos para todas las carpetas del proyecto
- 🔄 Servidores internos por componente
- 🔄 Integración completa con el engine 3D
- 🔄 Sistema de autenticación
- 🔄 Persistencia de estado

## 🐛 Solución de Problemas

### Error de Conexión WebSocket
Si el EngineBridge no conecta:
1. Verificar que el servidor esté corriendo en puerto 8181
2. Ejecutar: `node .bin/editor3d/start-engine-server.js`
3. Verificar firewall y permisos

### Módulo No Encontrado
Si un módulo no se carga:
1. Verificar que existe en `src/modules/`
2. Verificar dependencias del módulo
3. Revisar logs de consola

### Componente No Renderiza
Si un componente no aparece:
1. Verificar que esté registrado en el módulo
2. Verificar targetId en el DOM
3. Revisar props del componente

## 📊 Métricas y Monitoreo

El sistema incluye:
- Métricas de rendimiento por módulo
- Estado de conexiones WebSocket
- Uso de memoria y CPU
- Historial de eventos
- Estadísticas de carga de componentes

## 🔮 Próximos Pasos

1. **Completar Módulos**: Crear módulos para todas las carpetas restantes
2. **Servidores Internos**: Implementar servidores específicos por componente
3. **Integración Engine**: Conectar completamente con el engine 3D
4. **Optimización**: Mejorar rendimiento y carga bajo demanda
5. **Testing**: Implementar tests unitarios y de integración

## 🤝 Contribución

Para contribuir al sistema:

1. Crear módulo para nueva carpeta en `src/modules/`
2. Crear componentes React en `src/components/`
3. Registrar en `CentralModuleCoordinator`
4. Documentar APIs públicas
5. Agregar tests

## 📝 Licencia

Este proyecto es parte de WoldVirtual3DlucIA y sigue las mismas licencias del proyecto principal.

---

**WoldVirtual3DlucIA** - Metaverso Modular Descentralizado 🚀 