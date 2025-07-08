# 🌟 WCV Blockchain v2.0

Una blockchain personalizada completa con su propia criptomoneda WCV de 30 millones de unidades y 3 decimales, diseñada para el ecosistema WoldVirtual3D.

## 🚀 Características Principales

### 🔗 Blockchain Personalizada
- **Chain ID**: 1337 (Local), 1338 (Dev), 1339 (Test), 1340 (Main)
- **Consenso**: Proof of Authority (PoA)
- **Block Time**: 15 segundos
- **Gas Limit**: 8,000,000
- **Gas Price**: 20 Gwei

### 🪙 Token WCV
- **Nombre**: WCV Token
- **Símbolo**: WCV
- **Decimales**: 3 (formato: 0,000 WCV)
- **Supply Inicial**: 30,000,000 WCV
- **Supply Máximo**: 100,000,000 WCV
- **Fee de Minting**: 0.001 ETH

### 🌉 Puente BSC
- **Contrato BSC**: 0x053532E91FFD6b8a21C925Da101C909A01106BBE
- **Fee de Bridge**: 0.0001 ETH
- **Límite Mínimo**: 100 WCV (0,100)
- **Límite Máximo**: 1,000,000 WCV (1,000,000)
- **Límite Diario**: 10,000,000 WCV

### 🔧 Funcionalidades Avanzadas
- ✅ Minting controlado con fees
- ✅ Burning de tokens
- ✅ Pausado/Reanudado
- ✅ Blacklist/Whitelist
- ✅ Exclusión de fees
- ✅ Límites configurables
- ✅ Estadísticas detalladas
- ✅ API REST completa
- ✅ WebSocket para eventos
- ✅ Integración con MetaMask
- ✅ Validación de transacciones
- ✅ Logging avanzado
- ✅ Rate limiting
- ✅ Seguridad mejorada

## 📋 Requisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **MetaMask**: Para interacción con la blockchain
- **Hardhat**: Para desarrollo y testing

## 🛠️ Instalación

### 1. Clonar y configurar
```bash
# Navegar al directorio
cd bloc/bk_wcv

# Instalar dependencias
npm install

# Configurar variables de entorno
npm run setup
```

### 2. Configurar variables de entorno
Editar el archivo `.env` generado:
```env
# Blockchain Configuration
BLOCKCHAIN_PORT=8545
CHAIN_ID=1337
BLOCK_TIME=15
GAS_LIMIT=8000000
GAS_PRICE=20000000000

# Private Key (GENERAR UNA NUEVA CLAVE PRIVADA)
PRIVATE_KEY=tu_clave_privada_aqui

# BSC Configuration
BSCSCAN_API_KEY=tu_api_key_bscscan
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# WCV Network Configuration
WCV_DEV_RPC=http://127.0.0.1:8546
WCV_TEST_RPC=http://127.0.0.1:8547
WCV_MAIN_RPC=http://127.0.0.1:8550

# API Configuration
API_PORT=3000
API_SECRET=tu_api_secret_aqui
JWT_SECRET=tu_jwt_secret_aqui
```

## 🚀 Uso

### 1. Compilar contratos
```bash
npm run compile
```

### 2. Iniciar nodo local
```bash
npm run node
```

### 3. Desplegar contratos
```bash
# Desplegar en red local
npm run deploy:local

# Desplegar en red de prueba
npm run deploy:test
```

### 4. Iniciar servidor API
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

### 5. Configurar MetaMask

#### Agregar red WCV Local:
- **Nombre**: WCV Local
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Símbolo**: WCV
- **Explorer**: http://127.0.0.1:8545

#### Agregar red WCV Development:
- **Nombre**: WCV Development
- **Chain ID**: 1338
- **RPC URL**: http://127.0.0.1:8546
- **Símbolo**: WCV
- **Explorer**: http://127.0.0.1:8546

#### Agregar red WCV Testnet:
- **Nombre**: WCV Testnet
- **Chain ID**: 1339
- **RPC URL**: http://127.0.0.1:8547
- **Símbolo**: WCV
- **Explorer**: http://127.0.0.1:8547

### 6. Importar cuenta
Usar la clave privada del deployer mostrada durante el despliegue.

## 📊 Especificaciones del Token WCV

### Características Técnicas
```solidity
// Constantes del token
INITIAL_SUPPLY = 30_000_000 * 10**3; // 30 millones con 3 decimales
MAX_SUPPLY = 100_000_000 * 10**3;    // 100 millones máximo
DECIMALS = 3;                         // 3 decimales

// Configuración de fees
mintingFee = 0.001 ether;             // Fee para acuñar tokens
transferFee = 0;                      // Fee por transferencia (0%)
maxTransferAmount = MAX_SUPPLY;       // Límite máximo de transferencia
```

### Funcionalidades del Token
- **Minting**: Acuñar nuevos tokens con fee
- **Burning**: Quemar tokens existentes
- **Transfer**: Transferir tokens con validaciones
- **Blacklist**: Bloquear direcciones
- **Whitelist**: Permitir direcciones especiales
- **Minters**: Controlar quién puede acuñar
- **Fees**: Configurar fees de transferencia
- **Pausable**: Pausar/reanudar operaciones
- **Statistics**: Estadísticas detalladas

## 🌉 Puente BSC

### Características del Bridge
```solidity
// Constantes del bridge
MIN_BRIDGE_AMOUNT = 100 * 10**3;      // 100 WCV mínimo
MAX_BRIDGE_AMOUNT = 1_000_000 * 10**3; // 1M WCV máximo
BRIDGE_FEE = 0.0001 ether;            // Fee en ETH
BRIDGE_TIMEOUT = 24 hours;            // Timeout para solicitudes
```

### Proceso de Bridge

#### WCV Local → BSC:
1. Usuario envía WCV al contrato bridge
2. Se genera solicitud única con hash
3. Validador procesa la solicitud
4. Tokens se liberan en BSC

#### BSC → WCV Local:
1. Usuario envía WCV desde BSC
2. Validador verifica la transacción
3. Se liberan tokens en WCV local

### Configuración del Bridge
- **Validador**: Dirección autorizada para procesar solicitudes
- **Contrato BSC**: 0x053532E91FFD6b8a21C925Da101C909A01106BBE
- **Límite Diario**: 10,000,000 WCV
- **Firma Digital**: Validación criptográfica de solicitudes

## 🔧 API Endpoints

### Token Endpoints
```
GET  /api/token/info              # Información del token
GET  /api/token/stats             # Estadísticas del token
GET  /api/token/fees              # Configuración de fees
GET  /api/token/balance/:address  # Balance de una dirección
GET  /api/token/status/:address   # Estado de una dirección
GET  /api/token/allowance         # Allowance entre direcciones
POST /api/token/transfer/tx       # Crear transacción de transferencia
POST /api/token/mint/tx           # Crear transacción de minting
POST /api/token/burn/tx           # Crear transacción de burning
GET  /api/token/status            # Estado del servicio
```

### Blockchain Endpoints
```
GET  /api/blockchain/info         # Información de la blockchain
GET  /api/blockchain/block/:number # Información de un bloque
GET  /api/blockchain/tx/:hash     # Información de una transacción
GET  /api/blockchain/balance/:address # Balance ETH de una dirección
GET  /api/blockchain/pending      # Transacciones pendientes
GET  /api/blockchain/stats        # Estadísticas de la red
GET  /api/blockchain/status       # Estado del servicio
```

### Bridge Endpoints
```
GET  /api/bridge/info             # Información del bridge
GET  /api/bridge/stats            # Estadísticas del bridge
GET  /api/bridge/request/:hash    # Información de una solicitud
POST /api/bridge/to-bsc           # Crear solicitud WCV → BSC
POST /api/bridge/from-bsc         # Crear solicitud BSC → WCV
POST /api/bridge/process          # Procesar solicitud (validador)
POST /api/bridge/cancel           # Cancelar solicitud
GET  /api/bridge/status           # Estado del servicio
```

### MetaMask Endpoints
```
GET  /api/metamask/config         # Configuración para MetaMask
GET  /api/metamask/networks       # Lista de redes disponibles
POST /api/metamask/connect        # Conectar wallet
POST /api/metamask/sign           # Firmar transacción
POST /api/metamask/send           # Enviar transacción
GET  /api/metamask/status         # Estado de la conexión
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Modo desarrollo con nodemon
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run lint             # Linting del código
npm run lint:fix         # Linting con auto-fix
npm run format           # Formatear código

# Despliegue
npm run compile          # Compilar contratos
npm run deploy:local     # Desplegar en red local
npm run deploy:test      # Desplegar en red de prueba
npm run node             # Iniciar nodo Hardhat
npm run console          # Consola Hardhat
npm run verify           # Verificar contratos
npm run clean            # Limpiar cache
npm run coverage         # Cobertura de tests

# Utilidades
npm run setup            # Configuración inicial
npm run bridge:deploy    # Desplegar bridge
npm run bridge:test      # Probar bridge
```

## 🧪 Testing

### Ejecutar tests
```bash
# Todos los tests
npm test

# Tests específicos
npm test -- --grep "WCVToken"
npm test -- --grep "WCVBridge"

# Con cobertura
npm run coverage

# Tests en modo watch
npm run test:watch
```

### Tests disponibles
- ✅ Tests unitarios de contratos
- ✅ Tests de integración
- ✅ Tests de API
- ✅ Tests de bridge
- ✅ Tests de MetaMask
- ✅ Tests de seguridad

## 🔒 Seguridad

### Características de Seguridad
- ✅ **ReentrancyGuard**: Protección contra reentrancy
- ✅ **Pausable**: Pausar operaciones en emergencias
- ✅ **Ownable**: Control de acceso por propietario
- ✅ **Validaciones**: Validación de entrada exhaustiva
- ✅ **Límites**: Límites de gas y cantidad
- ✅ **Blacklist/Whitelist**: Control de direcciones
- ✅ **Fees configurables**: Fees ajustables
- ✅ **Rate Limiting**: Protección contra spam
- ✅ **Helmet**: Headers de seguridad
- ✅ **CORS**: Configuración de CORS
- ✅ **Input Validation**: Validación de entrada con Joi

### Mejores Prácticas
1. **Claves Privadas**: Nunca compartir claves privadas
2. **Variables de Entorno**: Usar archivos .env para secrets
3. **Auditoría**: Revisar contratos antes de producción
4. **Testing**: Ejecutar tests completos
5. **Backup**: Mantener backups de configuración
6. **Monitoreo**: Monitorear logs y métricas
7. **Actualizaciones**: Mantener dependencias actualizadas

## 🌐 Redes Disponibles

### Local (Desarrollo)
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Gas Price**: 20 Gwei
- **Uso**: Desarrollo local

### Development
- **Chain ID**: 1338
- **RPC URL**: http://127.0.0.1:8546
- **Gas Price**: 20 Gwei
- **Uso**: Desarrollo en equipo

### Testnet
- **Chain ID**: 1339
- **RPC URL**: http://127.0.0.1:8547
- **Gas Price**: 20 Gwei
- **Uso**: Pruebas de integración

### Mainnet (Futura)
- **Chain ID**: 1340
- **RPC URL**: http://127.0.0.1:8550
- **Gas Price**: 20 Gwei
- **Uso**: Producción

### BSC (Migración)
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed1.binance.org/
- **Gas Price**: 5 Gwei
- **Uso**: Migración de tokens

## 📈 Monitoreo y Métricas

### Métricas Disponibles
- **Blockchain**: Bloques, transacciones, gas
- **Token**: Supply, minting, burning, transfers
- **Bridge**: Solicitudes, procesadas, canceladas
- **API**: Requests, errores, latencia
- **Sistema**: CPU, memoria, disco

### Logging
- **Nivel**: Configurable (error, warn, info, debug)
- **Archivos**: error.log, combined.log
- **Formato**: JSON con timestamps
- **Rotación**: Automática

## 🔄 Migración desde BSC

### Proceso de Migración
1. **Fase 1**: Despliegue en red de pruebas
2. **Fase 2**: Testing exhaustivo del bridge
3. **Fase 3**: Despliegue en mainnet
4. **Fase 4**: Migración gradual de tokens
5. **Fase 5**: Desactivación del bridge BSC

### Contrato BSC Original
- **Dirección**: 0x053532E91FFD6b8a21C925Da101C909A01106BBE
- **Red**: Binance Smart Chain (BSC)
- **Supply**: 30,000,000 WCV
- **Decimales**: 3

## 📞 Soporte

### Documentación
- **API Docs**: http://localhost:3000/api/docs
- **Configuración**: `config/` directory
- **Ejemplos**: `examples/` directory
- **Tests**: `test/` directory

### Comandos de Ayuda
```bash
# Verificar estado
npm run status

# Ver logs
tail -f logs/combined.log

# Verificar contratos
npm run verify

# Limpiar todo
npm run clean
```

### Contacto
- **Equipo**: WoldVirtual3D Team
- **Versión**: 2.0.0
- **Licencia**: MIT

## 🎉 ¡Listo para usar!

El proyecto WCV Blockchain v2.0 está completamente refactorizado y listo para desarrollo, testing y producción. Incluye todas las funcionalidades necesarias para una blockchain personalizada robusta con su propia criptomoneda.

¡Disfruta construyendo el futuro de WoldVirtual3D! 🚀 

## Resumen de Implementaciones y Cambios (Sesión de Hoy)

### 1. Explorador de Bloques "WoldPBVirtual"
- Creación de un explorador de bloques moderno en React para la blockchain WCV.
- Estructura de carpetas y archivos base para el explorador (`explorer/`).
- Configuración de `package.json` con dependencias modernas: React, Tailwind CSS, Ethers.js, React Query, Framer Motion, Recharts, etc.
- Configuración de Tailwind CSS y estilos globales.
- Componentes principales: Header, Sidebar, Footer, navegación, búsqueda, modo oscuro, estado de conexión y enlaces útiles.
- Contextos React para conexión a blockchain y tema (modo oscuro/claro).
- Páginas principales:
  - Home (dashboard con estadísticas, gráficos, bloques y transacciones recientes)
  - Listado de bloques con paginación y búsqueda
  - Listado de transacciones recientes
  - Estadísticas del token WCV
  - Gráficos de actividad de red
  - Detalle de bloque, transacción y dirección
  - Página de Bridge y página 404 personalizada
- Componentes UI reutilizables: tarjetas de estadísticas, spinner de carga, listas, gráficos con Recharts.
- Archivo README detallado para el explorador.
- Archivo `.env.example` para configuración de variables de entorno.
- Manifest para PWA y scripts de inicio.
- Instalación de dependencias y solución de conflictos de TypeScript.
- Creación y ajuste de `.gitignore` para proteger información sensible y dependencias, tanto en el root como en el explorador.
- Pruebas internas de build y desarrollo, corrigiendo errores de iconos y formateo.

### 2. Lógica y Formato del Token WCV
- **Actualización global:** WCV ahora tiene **3 decimales** en todos los contextos (metaverso y fuera de él).
- Ajuste de la lógica de formateo y visualización en la página del token y utilidades.
- Corrección de supply, balances y valores para mostrar siempre 3 decimales.
- Documentación y textos de ayuda actualizados para reflejar esta característica.

### 3. Seguridad y Buenas Prácticas
- `.gitignore` actualizado para proteger claves, datos sensibles, builds y dependencias.
- Se mantiene en el repositorio solo el código fuente, contratos, scripts y archivos de configuración pública.

---

## Pendiente de Implementar / Mejorar

- **Integración real con la blockchain WCV:**
  - Conexión a nodos reales y endpoints de la red principal/testnet.
  - Extracción de datos en tiempo real para bloques, transacciones y balances.
- **Mejorar la gestión de errores y mensajes al usuario.**
- **Optimización de componentes y hooks para mayor rendimiento.**
- **Internacionalización (i18n) y soporte multilenguaje.**
- **Pruebas unitarias y de integración para todos los componentes y utilidades.**
- **Despliegue automatizado y scripts de CI/CD.**
- **Documentación técnica avanzada para desarrolladores y usuarios finales.**
- **Integración del explorador como complemento en la web principal del metaverso.**
- **Ajustes visuales y de accesibilidad (a11y).**
- **Soporte para tokens y contratos adicionales (NFTs, bridge, etc).**

---

## Notas
- El proyecto está listo para desarrollo colaborativo y pruebas.
- Se recomienda instalar dependencias de forma individual en cada entorno local.
- Para cualquier duda o sugerencia, revisar el README del explorador y la documentación técnica.

---

**Última actualización:** [Fecha de hoy] 