# WoldPBVirtual Explorer

Explorador de bloques moderno y completo para la blockchain WCV (WoldVirtual3D).

## 🚀 Características

### Funcionalidades Principales
- **Dashboard en tiempo real** con estadísticas de la red
- **Exploración de bloques** con información detallada
- **Búsqueda de transacciones** por hash o dirección
- **Información del token WCV** con estadísticas completas
- **Bridge con Binance Smart Chain** para transferencias
- **Gráficos interactivos** de actividad de red
- **Diseño responsive** para móviles y desktop
- **Modo oscuro/claro** personalizable

### Tecnologías Utilizadas
- **React 18** con hooks modernos
- **React Router** para navegación
- **React Query** para gestión de estado y caché
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Recharts** para gráficos
- **Ethers.js** para interacción con blockchain
- **Axios** para llamadas API

## 📦 Instalación

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- Servidor API de WCV ejecutándose en `http://localhost:3000`

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
cd bloc/bk_wcv/explorer
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env`:
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_CHAIN_ID=31337
REACT_APP_NETWORK_NAME=WCV Local
```

4. **Iniciar el servidor de desarrollo**
```bash
npm start
```

El explorador estará disponible en `http://localhost:3001`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── UI/             # Componentes de interfaz básicos
│   ├── Layout/         # Componentes de layout
│   ├── Blocks/         # Componentes relacionados con bloques
│   ├── Transactions/   # Componentes de transacciones
│   ├── Token/          # Componentes del token WCV
│   └── Charts/         # Componentes de gráficos
├── contexts/           # Contextos de React
├── pages/              # Páginas principales
├── hooks/              # Hooks personalizados
├── utils/              # Utilidades y helpers
└── styles/             # Estilos globales
```

## 🎯 Páginas Principales

### 1. Dashboard (Home)
- Estadísticas en tiempo real
- Gráficos de actividad de red
- Bloques y transacciones recientes
- Información del token WCV

### 2. Bloques
- Listado paginado de todos los bloques
- Búsqueda por número o hash
- Información detallada de cada bloque

### 3. Transacciones
- Listado de transacciones
- Filtros por tipo y estado
- Detalles completos de transacciones

### 4. Token WCV
- Estadísticas del token
- Distribución de supply
- Información del contrato

### 5. Bridge
- Interfaz para transferencias entre redes
- Estado de las transferencias
- Historial de operaciones

### 6. Estadísticas
- Métricas detalladas de la red
- Gráficos históricos
- Análisis de rendimiento

## 🔧 Configuración

### Variables de Entorno

```env
# URL del servidor API
REACT_APP_API_URL=http://localhost:3000

# Configuración de la red
REACT_APP_CHAIN_ID=31337
REACT_APP_NETWORK_NAME=WCV Local

# Configuración del explorador
REACT_APP_EXPLORER_NAME=WoldPBVirtual
REACT_APP_EXPLORER_VERSION=1.0.0

# Configuración de analytics (opcional)
REACT_APP_GA_TRACKING_ID=
```

### Personalización de Temas

Los temas se pueden personalizar editando `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Colores personalizados de la marca
        'wcv-blue': '#3b82f6',
        'wcv-purple': '#8b5cf6',
        // ...
      }
    }
  }
}
```

## 🚀 Despliegue

### Desarrollo
```bash
npm start
```

### Producción
```bash
npm run build
npm run serve
```

### Docker
```bash
docker build -t woldpbvirtual-explorer .
docker run -p 3001:3001 woldpbvirtual-explorer
```

## 📊 API Endpoints

El explorador consume los siguientes endpoints de la API:

### Blockchain
- `GET /api/blockchain/info` - Información general
- `GET /api/blockchain/block/:number` - Información de bloque
- `GET /api/blockchain/tx/:hash` - Información de transacción
- `GET /api/blockchain/stats` - Estadísticas de red
- `GET /api/blockchain/pending` - Transacciones pendientes

### Token
- `GET /api/token/info` - Información del token
- `GET /api/token/balance/:address` - Balance de dirección

### Bridge
- `GET /api/bridge/info` - Información del bridge
- `POST /api/bridge/transfer` - Iniciar transferencia

## 🎨 Personalización

### Colores y Temas
Los colores se pueden personalizar en `src/index.css` y `tailwind.config.js`.

### Componentes
Cada componente está modularizado y puede ser personalizado independientemente.

### Gráficos
Los gráficos utilizan Recharts y pueden ser modificados en `src/components/Charts/`.

## 🔍 Búsqueda

El explorador incluye búsqueda global que permite encontrar:
- Bloques por número
- Transacciones por hash
- Direcciones por hash
- Contratos por dirección

## 📱 Responsive Design

El explorador está completamente optimizado para:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🚀 Performance

### Optimizaciones Implementadas
- **React Query** para caché inteligente
- **Lazy loading** de componentes
- **Code splitting** automático
- **Optimización de imágenes**
- **Compresión de assets**

### Métricas Objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm start

# Construcción
npm run build

# Tests
npm test

# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format

# Type checking
npm run type-check
```

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: cambios de estilo
refactor: refactorización
test: tests
chore: tareas de mantenimiento
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

- **Documentación**: [docs.woldvirtual3d.com](https://docs.woldvirtual3d.com)
- **Issues**: [GitHub Issues](https://github.com/woldvirtual3d/wcv-blockchain/issues)
- **Discord**: [Discord Server](https://discord.gg/woldvirtual3d)
- **Email**: support@woldvirtual3d.com

## 🔗 Enlaces Útiles

- **Sitio Web**: [woldvirtual3d.com](https://woldvirtual3d.com)
- **GitHub**: [github.com/woldvirtual3d](https://github.com/woldvirtual3d)
- **Documentación**: [docs.woldvirtual3d.com](https://docs.woldvirtual3d.com)
- **API Docs**: [api.woldvirtual3d.com](https://api.woldvirtual3d.com)

---

**WoldPBVirtual Explorer** - Explorando el futuro de la blockchain WCV 🚀 