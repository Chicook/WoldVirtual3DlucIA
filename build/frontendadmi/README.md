# 🎛️ Panel de Administración WoldVirtual 3D

Panel de control maestro para el sistema modular WoldVirtual 3D. Este frontend proporciona una interfaz completa y poderosa para administrar todos los aspectos del sistema.

## 🚀 Características Principales

### 📊 Dashboard Completo
- **Vista general del sistema** con métricas en tiempo real
- **Gráficos interactivos** de progreso del proyecto
- **Estado del sistema** con monitoreo de recursos
- **Actividad reciente** y alertas del sistema
- **Cola de builds** en tiempo real

### 🔧 Gestión de Builds
- **Iniciar/pausar builds** con control granular
- **Monitoreo en tiempo real** del progreso
- **Historial completo** de builds
- **Configuración avanzada** de parámetros
- **Logs detallados** con filtros y búsqueda

### 📈 Seguimiento de Progreso
- **Progreso por módulo** con visualizaciones
- **Métricas de rendimiento** detalladas
- **Tendencias y análisis** temporales
- **Reportes personalizables** en múltiples formatos

### 🔄 Gestión de Cola
- **Cola de trabajos** con prioridades
- **Reordenamiento** drag & drop
- **Cancelación y pausado** de trabajos
- **Distribución de carga** automática

### 🔔 Sistema de Notificaciones
- **Notificaciones en tiempo real** via WebSocket
- **Múltiples canales**: Email, Webhook, Slack
- **Configuración personalizada** de alertas
- **Historial de notificaciones**

### 🖥️ Monitoreo del Sistema
- **Métricas de recursos**: CPU, Memoria, Red, Almacenamiento
- **Logs del sistema** con filtros avanzados
- **Alertas automáticas** basadas en umbrales
- **Gráficos de rendimiento** históricos

### 👥 Gestión de Usuarios
- **Control de acceso** basado en roles
- **Permisos granulares** por funcionalidad
- **Auditoría de acciones** de usuarios
- **Gestión de sesiones** activas

### ⚙️ Configuración del Sistema
- **Configuración global** del sistema
- **Gestión de entornos** (dev, staging, prod)
- **Backup y restauración** de configuraciones
- **Actualizaciones del sistema**

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Query** para gestión de estado del servidor
- **Zustand** para estado local
- **Framer Motion** para animaciones

### UI/UX
- **Lucide React** para iconos
- **Recharts** para gráficos
- **React Hook Form** para formularios
- **React Hot Toast** para notificaciones
- **Monaco Editor** para edición de código
- **React Table** para tablas avanzadas

### Monitoreo y Analytics
- **Socket.IO** para WebSocket
- **Chart.js** para gráficos adicionales
- **D3.js** para visualizaciones personalizadas
- **React Virtualized** para listas grandes

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm 8+ o yarn
- Backend del sistema funcionando

### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd build/frontendadmi

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local con las configuraciones necesarias
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=WoldVirtual Admin
```

### Variables de Entorno

```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# App Configuration
VITE_APP_NAME=WoldVirtual Admin
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=false

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

## 🚀 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build

# Testing
npm run test         # Ejecutar tests
npm run test:ui      # Tests con UI
npm run test:coverage # Tests con coverage

# Linting y Formateo
npm run lint         # Verificar código
npm run lint:fix     # Corregir problemas automáticamente
npm run format       # Formatear código

# Type Checking
npm run type-check   # Verificar tipos TypeScript

# Storybook
npm run storybook    # Iniciar Storybook
npm run build-storybook # Build de Storybook
```

### Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base de UI
│   ├── layout/         # Componentes de layout
│   ├── dashboard/      # Componentes del dashboard
│   ├── forms/          # Componentes de formularios
│   └── charts/         # Componentes de gráficos
├── pages/              # Páginas de la aplicación
│   ├── auth/           # Páginas de autenticación
│   ├── dashboard/      # Dashboard principal
│   ├── builds/         # Gestión de builds
│   ├── progress/       # Seguimiento de progreso
│   ├── queue/          # Gestión de cola
│   ├── notifications/  # Sistema de notificaciones
│   ├── system/         # Monitoreo del sistema
│   ├── users/          # Gestión de usuarios
│   └── settings/       # Configuración
├── hooks/              # Custom hooks
├── services/           # Servicios de API
├── store/              # Estado global (Zustand)
├── types/              # Tipos TypeScript
├── utils/              # Utilidades
├── styles/             # Estilos globales
└── assets/             # Recursos estáticos
```

## 🎨 Temas y Personalización

### Modo Oscuro/Claro
El panel soporta temas claro y oscuro con transición suave:

```typescript
import { useTheme } from '@/hooks/useTheme'

const { theme, toggleTheme } = useTheme()
```

### Colores Personalizados
Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ... */ },
      secondary: { /* ... */ },
      // ...
    }
  }
}
```

## 🔐 Autenticación y Autorización

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Developer**: Gestión de builds y desarrollo
- **Viewer**: Solo lectura y monitoreo

### Permisos Granulares
```typescript
// Verificar permisos
const { hasPermission } = useAuth()
if (hasPermission('builds.create')) {
  // Permitir crear builds
}

// Verificar roles
const { isAdmin, isDeveloper } = useAuth()
if (isAdmin) {
  // Acceso completo
}
```

## 📊 Monitoreo y Analytics

### Métricas del Sistema
- **CPU**: Uso de procesador en tiempo real
- **Memoria**: Consumo de RAM
- **Red**: Ancho de banda y conexiones
- **Almacenamiento**: Espacio en disco

### Logs y Debugging
- **Logs del sistema** con filtros avanzados
- **Logs de builds** con búsqueda
- **Errores y excepciones** con stack traces
- **Performance metrics** detalladas

## 🔌 Integración con Backend

### API REST
```typescript
import { buildService } from '@/services/buildService'

// Obtener builds
const builds = await buildService.getBuilds()

// Crear build
const newBuild = await buildService.createBuild(data)

// Monitorear progreso
const progress = await buildService.getProgress(buildId)
```

### WebSocket
```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

const { data, isConnected } = useWebSocket('/ws/builds', {
  onMessage: (data) => {
    // Manejar actualizaciones en tiempo real
  }
})
```

## 🧪 Testing

### Tests Unitarios
```bash
npm run test
```

### Tests de Integración
```bash
npm run test:integration
```

### Tests E2E
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

## 📦 Build y Despliegue

### Build de Producción
```bash
npm run build
```

### Optimizaciones
- **Code splitting** automático
- **Tree shaking** para reducir bundle size
- **Compresión** de assets
- **Cache busting** automático

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "run", "preview"]
```

## 🔧 Configuración Avanzada

### Proxy de Desarrollo
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

### Optimización de Performance
- **Lazy loading** de componentes
- **Virtual scrolling** para listas grandes
- **Memoización** de componentes pesados
- **Debouncing** de inputs

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión al backend**
   - Verificar que el backend esté corriendo
   - Revisar configuración de `VITE_API_URL`

2. **Problemas de autenticación**
   - Limpiar localStorage
   - Verificar token de autenticación

3. **Errores de build**
   - Limpiar cache: `npm run clean`
   - Reinstalar dependencias: `rm -rf node_modules && npm install`

## 🤝 Contribución

### Guías de Desarrollo
1. **Fork** el repositorio
2. **Crear** una rama para tu feature
3. **Commit** tus cambios con mensajes descriptivos
4. **Push** a tu rama
5. **Crear** un Pull Request

### Estándares de Código
- **TypeScript** estricto
- **ESLint** y **Prettier** configurados
- **Conventional Commits**
- **Tests** para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- **Issues**: Crear un issue en GitHub
- **Documentación**: Ver `/docs` para documentación detallada
- **Wiki**: Ver wiki del proyecto para guías adicionales

---

**Desarrollado con ❤️ para el ecosistema WoldVirtual 3D** 