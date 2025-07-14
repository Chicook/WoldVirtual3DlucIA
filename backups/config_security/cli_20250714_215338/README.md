# 🖥️ CLI - Metaverso Web3

Herramientas de línea de comandos para gestión, desarrollo y despliegue del metaverso descentralizado.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Comandos](#comandos)
- [Configuración](#configuración)
- [Templates](#templates)
- [Desarrollo](#desarrollo)
- [API](#api)
- [Troubleshooting](#troubleshooting)

## ✨ Características

### 🚀 Gestión de Proyectos
- **Inicialización**: Crear nuevos proyectos con templates predefinidos
- **Configuración**: Gestión centralizada de configuraciones
- **Validación**: Verificación automática de integridad del proyecto
- **Backup**: Sistema de respaldo y restauración

### 🔨 Build System
- **Construcción Modular**: Builds independientes por módulo
- **Optimización**: Optimización automática de código y assets
- **Compresión**: Compresión inteligente de archivos
- **Firma Digital**: Firma y verificación de builds

### 🚀 Despliegue
- **Multi-Entorno**: Despliegue a development, staging, production
- **Multi-Red**: Despliegue a múltiples redes blockchain
- **Rollback**: Rollback automático en caso de fallos
- **Monitoreo**: Monitoreo en tiempo real del despliegue

### 🧪 Testing
- **Tests Unitarios**: Ejecución de tests unitarios
- **Tests de Integración**: Tests de integración entre módulos
- **Tests E2E**: Tests end-to-end del metaverso
- **Cobertura**: Reportes de cobertura de código

### 📊 Monitoreo
- **Métricas**: Métricas de rendimiento y uso
- **Logs**: Sistema de logging centralizado
- **Alertas**: Alertas automáticas por eventos
- **Dashboard**: Dashboard de monitoreo en tiempo real

### 🔒 Seguridad
- **Auditoría**: Auditoría automática de seguridad
- **Validación**: Validación de contratos y código
- **Escaneo**: Escaneo de vulnerabilidades
- **Compliance**: Verificación de compliance

## 🚀 Instalación

### Instalación Global

```bash
# Instalar CLI globalmente
npm install -g @metaverso/cli

# Verificar instalación
metaverso --version
```

### Instalación Local

```bash
# Instalar en el proyecto
npm install @metaverso/cli --save-dev

# Usar con npx
npx metaverso --help
```

### Instalación desde Fuente

```bash
# Clonar repositorio
git clone https://github.com/metaverso/cli.git
cd cli

# Instalar dependencias
npm install

# Construir
npm run build

# Instalar globalmente
npm link
```

## 📖 Uso Básico

### Inicializar Proyecto

```bash
# Inicializar nuevo proyecto
metaverso init

# Con template específico
metaverso init --template gaming

# Con configuración automática
metaverso init --yes
```

### Construir Proyecto

```bash
# Construir todo
metaverso build

# Construir módulo específico
metaverso build --target contracts
metaverso build --target backend
metaverso build --target frontend
metaverso build --target assets

# Con optimización
metaverso build --optimize

# Con compresión
metaverso build --compress
```

### Desplegar Proyecto

```bash
# Desplegar a desarrollo
metaverso deploy --env development

# Desplegar a producción
metaverso deploy --env production

# Desplegar contratos
metaverso deploy --target contracts

# Con verificación
metaverso deploy --verify
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests
metaverso test

# Tests específicos
metaverso test --unit
metaverso test --integration
metaverso test --e2e

# Con cobertura
metaverso test --coverage
```

## 🛠️ Comandos

### Comandos Principales

#### `init` - Inicializar Proyecto
```bash
metaverso init [opciones]
```

**Opciones:**
- `-t, --template <template>` - Template a usar
- `-y, --yes` - Confirmar todas las opciones por defecto
- `-o, --output <directory>` - Directorio de salida

**Templates disponibles:**
- `basic` - Estructura mínima
- `full` - Con todos los módulos
- `gaming` - Enfocado en juegos
- `social` - Enfocado en interacción social
- `defi` - Enfocado en finanzas descentralizadas
- `custom` - Configuración manual

#### `build` - Construir Proyecto
```bash
metaverso build [opciones]
```

**Opciones:**
- `-t, --target <target>` - Target específico (contracts, backend, frontend, assets, all)
- `-e, --env <environment>` - Entorno de build
- `-o, --optimize` - Habilitar optimización
- `-c, --compress` - Habilitar compresión
- `-s, --sign` - Firmar builds
- `-v, --verify` - Verificar builds
- `--watch` - Modo watch
- `--clean` - Limpiar antes de construir
- `--parallel` - Construir en paralelo

#### `deploy` - Desplegar Proyecto
```bash
metaverso deploy [opciones]
```

**Opciones:**
- `-e, --env <environment>` - Entorno de despliegue
- `-t, --target <target>` - Target específico
- `-n, --network <network>` - Red blockchain
- `-v, --verify` - Verificar después del despliegue
- `--rollback` - Habilitar rollback automático
- `--monitor` - Monitorear despliegue

#### `test` - Ejecutar Tests
```bash
metaverso test [opciones]
```

**Opciones:**
- `--unit` - Solo tests unitarios
- `--integration` - Solo tests de integración
- `--e2e` - Solo tests end-to-end
- `--coverage` - Generar reporte de cobertura
- `--watch` - Modo watch
- `--parallel` - Ejecutar en paralelo

#### `monitor` - Monitorear Proyecto
```bash
metaverso monitor [opciones]
```

**Opciones:**
- `--metrics` - Mostrar métricas
- `--logs` - Mostrar logs en tiempo real
- `--alerts` - Configurar alertas
- `--dashboard` - Abrir dashboard
- `--export` - Exportar datos

### Comandos de Configuración

#### `config` - Gestionar Configuración
```bash
metaverso config [comando] [opciones]
```

**Comandos:**
- `show` - Mostrar configuración actual
- `set <key> <value>` - Establecer valor
- `get <key>` - Obtener valor
- `validate` - Validar configuración
- `export` - Exportar configuración
- `import <file>` - Importar configuración

#### `blockchain` - Gestionar Blockchain
```bash
metaverso blockchain [comando] [opciones]
```

**Comandos:**
- `deploy` - Desplegar contratos
- `verify` - Verificar contratos
- `upgrade` - Actualizar contratos
- `interact` - Interactuar con contratos
- `events` - Monitorear eventos
- `gas` - Analizar uso de gas

#### `asset` - Gestionar Assets
```bash
metaverso asset [comando] [opciones]
```

**Comandos:**
- `upload` - Subir assets
- `optimize` - Optimizar assets
- `compress` - Comprimir assets
- `validate` - Validar assets
- `catalog` - Gestionar catálogo
- `sync` - Sincronizar assets

### Comandos Avanzados

#### `generate` - Generar Código
```bash
metaverso generate [tipo] [opciones]
```

**Tipos:**
- `contract` - Generar contrato inteligente
- `component` - Generar componente React
- `api` - Generar endpoint API
- `test` - Generar tests
- `docs` - Generar documentación

#### `validate` - Validar Proyecto
```bash
metaverso validate [opciones]
```

**Opciones:**
- `--security` - Validación de seguridad
- `--performance` - Validación de rendimiento
- `--quality` - Validación de calidad
- `--compliance` - Validación de compliance

#### `analytics` - Análisis y Métricas
```bash
metaverso analytics [comando] [opciones]
```

**Comandos:**
- `users` - Métricas de usuarios
- `transactions` - Métricas de transacciones
- `performance` - Métricas de rendimiento
- `revenue` - Métricas de ingresos
- `export` - Exportar datos

#### `security` - Auditoría de Seguridad
```bash
metaverso security [comando] [opciones]
```

**Comandos:**
- `audit` - Auditoría completa
- `scan` - Escaneo de vulnerabilidades
- `test` - Tests de penetración
- `report` - Generar reporte
- `fix` - Aplicar fixes automáticos

## ⚙️ Configuración

### Archivo de Configuración

El CLI utiliza `metaverso.config.json` para la configuración:

```json
{
  "version": "1.0.0",
  "environment": "development",
  "project": {
    "name": "mi-metaverso",
    "description": "Mi proyecto de metaverso"
  },
  "networks": [
    {
      "name": "Polygon",
      "chainId": 137,
      "rpcUrl": "https://polygon-rpc.com",
      "enabled": true
    }
  ],
  "contracts": {
    "compiler": {
      "version": "0.8.19",
      "optimizer": {
        "enabled": true,
        "runs": 200
      }
    }
  },
  "backend": {
    "server": {
      "port": 3000,
      "host": "localhost"
    },
    "database": {
      "type": "postgresql",
      "url": "postgresql://localhost:5432/metaverso"
    }
  },
  "frontend": {
    "build": {
      "target": "es2020",
      "format": "es",
      "minify": true
    }
  },
  "metaverse": {
    "features": ["avatars", "chat", "trading"],
    "world": {
      "name": "Mi Metaverso",
      "maxPlayers": 100
    }
  }
}
```

### Variables de Entorno

```bash
# .env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/metaverso
JWT_SECRET=your-super-secret-jwt-key
POLYGON_RPC_URL=https://polygon-rpc.com
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### Configuración por Entorno

```bash
# Configuración específica por entorno
metaverso config set --env production database.url "postgresql://prod-server/metaverso"
metaverso config set --env staging database.url "postgresql://staging-server/metaverso"
```

## 📋 Templates

### Template Básico
Estructura mínima para comenzar:
```
project/
├── contracts/
├── backend/
├── client/
├── assets/
├── package.json
└── metaverso.config.json
```

### Template Completo
Con todos los módulos y herramientas:
```
project/
├── contracts/
│   ├── core/
│   ├── nfts/
│   ├── defi/
│   └── governance/
├── backend/
│   ├── src/
│   │   ├── apis/
│   │   ├── models/
│   │   ├── services/
│   │   └── middleware/
│   └── tests/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── stores/
│   └── public/
├── assets/
│   ├── images/
│   ├── models/
│   ├── audio/
│   └── textures/
├── build/
├── config/
├── docs/
├── tests/
├── scripts/
├── .github/
├── package.json
└── metaverso.config.json
```

### Template Gaming
Enfocado en juegos y experiencias interactivas:
- Sistema de avatares avanzado
- Física y colisiones
- Sistema de misiones
- Leaderboards
- Recompensas y achievements

### Template Social
Enfocado en interacción social:
- Chat en tiempo real
- Grupos y comunidades
- Eventos y meetups
- Sistema de reputación
- Redes sociales integradas

### Template DeFi
Enfocado en finanzas descentralizadas:
- Integración con DEXs
- Yield farming
- Staking y governance
- Portfolio tracking
- Trading avanzado

## 🛠️ Desarrollo

### Estructura del CLI

```
cli/
├── src/
│   ├── index.ts              # Punto de entrada
│   ├── commands/             # Comandos del CLI
│   │   ├── InitCommand.ts
│   │   ├── BuildCommand.ts
│   │   ├── DeployCommand.ts
│   │   └── ...
│   ├── utils/                # Utilidades
│   │   ├── Logger.ts
│   │   ├── ConfigManager.ts
│   │   ├── ProjectManager.ts
│   │   └── ...
│   └── validators/           # Validadores
│       ├── ConfigValidator.ts
│       ├── ProjectValidator.ts
│       └── ...
├── tests/                    # Tests
├── docs/                     # Documentación
└── package.json
```

### Crear Nuevo Comando

```typescript
// src/commands/MyCommand.ts
import { Command } from 'commander'
import { Logger } from '../utils/Logger'

export class MyCommand {
  private logger: Logger

  constructor() {
    this.logger = new Logger('MyCommand')
  }

  register(program: Command): void {
    program
      .command('my-command')
      .description('Descripción del comando')
      .option('-o, --option <value>', 'Opción del comando')
      .action(async (options) => {
        await this.execute(options)
      })
  }

  async execute(options: any): Promise<void> {
    try {
      this.logger.info('Ejecutando mi comando...')
      // Lógica del comando
      this.logger.success('Comando ejecutado exitosamente')
    } catch (error) {
      this.logger.error('Error ejecutando comando:', error as Error)
      throw error
    }
  }
}
```

### Tests

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests específicos
npm test -- --grep "InitCommand"
```

## 🔌 API

### Uso Programático

```typescript
import { 
  program, 
  logger, 
  configManager, 
  projectManager 
} from '@metaverso/cli'

// Inicializar CLI
await configManager.loadDefaultConfig()

// Ejecutar comando programáticamente
await program.parseAsync(['node', 'cli', 'build', '--target', 'contracts'])

// Usar utilidades directamente
const projectInfo = await projectManager.getProjectInfo()
logger.info('Proyecto:', projectInfo)
```

### Hooks y Eventos

```typescript
// Hook pre-action
program.hook('preAction', async (command) => {
  logger.info(`Ejecutando: ${command.name()}`)
})

// Hook post-action
program.hook('postAction', async (command) => {
  logger.info(`Completado: ${command.name()}`)
})
```

### Plugins

```typescript
// Crear plugin
class MyPlugin {
  name = 'my-plugin'
  
  install(cli: any) {
    cli.addCommand('my-command', {
      description: 'Mi comando personalizado',
      action: this.execute.bind(this)
    })
  }
  
  async execute(options: any) {
    // Lógica del plugin
  }
}

// Registrar plugin
program.addPlugin(new MyPlugin())
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Permisos
```bash
# Error: EACCES: permission denied
sudo npm install -g @metaverso/cli
```

#### Error de Dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error de Configuración
```bash
# Validar configuración
metaverso config validate

# Resetear configuración
metaverso config reset
```

#### Error de Build
```bash
# Limpiar builds
metaverso build --clean

# Verificar proyecto
metaverso validate

# Debug de build
metaverso build --debug
```

#### Error de Despliegue
```bash
# Verificar conectividad
metaverso blockchain status

# Verificar configuración de red
metaverso config get networks

# Rollback automático
metaverso deploy --rollback
```

### Logs y Debug

```bash
# Habilitar logs detallados
metaverso --debug

# Ver logs en tiempo real
metaverso monitor --logs

# Exportar logs
metaverso monitor --export logs.json
```

### Soporte

- 📧 Email: support@metaverso.dev
- 💬 Discord: [Metaverso Community](https://discord.gg/metaverso)
- 📖 Documentación: [docs.metaverso.dev](https://docs.metaverso.dev)
- 🐛 Issues: [GitHub Issues](https://github.com/metaverso/cli/issues)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request 