# 🌐 WoldVirtual3D Blockchain

**Blockchain personalizada para la plataforma WoldVirtual3D con puente BSC y sistema de gas abstraction multi-lenguaje**

## 🚀 Características Principales

### 🔗 **Sistema de Gas Abstraction**
- **Pago unificado en WCV**: Los usuarios pagan siempre en WCV independientemente de la red blockchain
- **Conversión automática**: El sistema convierte automáticamente WCV a la criptomoneda nativa de cada red
- **Transparencia total**: El usuario solo se preocupa por tener WCV, el sistema maneja todo lo demás

### 🌉 **Puente Multi-Cadena**
- **Binance Smart Chain (BSC)**: Integración completa con BNB
- **Ethereum**: Soporte para ETH
- **Polygon**: Integración con MATIC
- **Avalanche**: Soporte para AVAX
- **Arbitrum**: Integración con ARB
- **Y más redes...**

### 💰 **Token WCV (WoldCoinVirtual)**
- **Suministro total**: 30,000,000 WCV
- **Decimales**: 3
- **Red nativa**: Binance Smart Chain (BSC)
- **Contrato**: `0x...` (desplegado en BSC)

## 🛠️ Lenguajes de Programación Soportados

### **1. Solidity (Ethereum/BSC/Polygon)**
```solidity
// Contratos implementados:
- WCVToken.sol (Token principal)
- BSWCV.sol (Wrapped WCV para BSC)
- WoldVirtualBridge.sol (Puente BSC)
- WCVStaking.sol (Sistema de staking)
- WCVGovernance.sol (Gobernanza DAO)
- GasFeeManager.sol (Gestión de gas fees)
- WCVGasProxy.sol (Proxy para metaverso)
```

### **2. Rust (Substrate/Polkadot)**
```rust
// Contratos implementados:
- wcv_token.rs (Token WCV para Substrate)
- staking.rs (Sistema de staking)
- governance.rs (Gobernanza)
- bridge.rs (Puente cross-chain)
```

### **3. Move (Aptos/Sui)**
```move
// Contratos implementados:
- wcv_token.move (Token WCV para Aptos)
- staking.move (Sistema de staking)
- governance.move (Gobernanza)
- bridge.move (Puente cross-chain)
```

### **4. Vyper (Ethereum)**
```python
# Contratos implementados:
- wcv_token.vy (Token WCV en Vyper)
- staking.vy (Sistema de staking)
- governance.vy (Gobernanza)
- bridge.vy (Puente cross-chain)
```

### **5. TypeScript/JavaScript (Node.js)**
```typescript
// Implementación principal:
- WoldVirtualChain.ts (Blockchain principal)
- BridgeService.ts (Servicio de puente)
- GasFeeService.ts (Servicio de gas fees)
- StakingService.ts (Servicio de staking)
```

### **6. Python**
```python
# Implementación alternativa:
- python_blockchain.py (Blockchain completa en Python)
- bridge_service.py (Servicio de puente)
- gas_fee_service.py (Servicio de gas fees)
```

## 📁 Estructura del Proyecto

```
bloc/woldbkvirtual/
├── contracts/
│   ├── solidity/           # Contratos Solidity
│   │   ├── WCVToken.sol
│   │   ├── BSWCV.sol
│   │   ├── WoldVirtualBridge.sol
│   │   ├── WCVStaking.sol
│   │   ├── WCVGovernance.sol
│   │   ├── GasFeeManager.sol
│   │   └── WCVGasProxy.sol
│   ├── rust/               # Contratos Rust
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs
│   ├── move/               # Contratos Move
│   │   ├── Move.toml
│   │   └── sources/
│   │       └── wcv_token.move
│   └── vyper/              # Contratos Vyper
│       └── wcv_token.vy
├── src/                    # Código TypeScript
├── scripts/                # Scripts de deployment
├── test/                   # Tests
├── python_blockchain.py    # Implementación Python
└── README.md
```

## 🚀 Instalación y Configuración

### **Requisitos Previos**
```bash
# Node.js 16+
node --version

# Python 3.8+
python --version

# Rust (para contratos Rust)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Move CLI (para contratos Move)
curl -L https://github.com/move-language/move/releases/latest/download/move-cli-linux -o move
chmod +x move
sudo mv move /usr/local/bin/

# Vyper (para contratos Vyper)
pip install vyper
```

### **Instalación**
```bash
# Clonar repositorio
git clone https://github.com/woldvirtual3d/blockchain.git
cd blockchain/bloc/woldbkvirtual

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones
```

### **Configuración de Redes**
```bash
# Configurar redes blockchain en network-config.json
{
  "networks": {
    "BSC": {
      "rpc": "https://bsc-dataseed1.binance.org/",
      "chainId": 56,
      "gasToken": "BNB",
      "wrappedToken": "BSWCV"
    },
    "ETH": {
      "rpc": "https://mainnet.infura.io/v3/YOUR_KEY",
      "chainId": 1,
      "gasToken": "ETH",
      "wrappedToken": "ETHWCV"
    }
  }
}
```

## 🔧 Comandos de Uso

### **Blockchain Principal**
```bash
# Iniciar blockchain
npm run chain:start

# Modo desarrollo
npm run chain:dev

# Modo producción
npm run chain:prod

# Iniciar con puente BSC
npm run chain:bridge

# Iniciar con gas abstraction
npm run chain:gas
```

### **Contratos Solidity**
```bash
# Compilar contratos
npm run solidity:compile

# Ejecutar tests
npm run solidity:test

# Deploy contratos
npm run solidity:deploy

# Deploy sistema de gas
npm run solidity:deploy-gas
```

### **Contratos Rust**
```bash
# Compilar contratos Rust
npm run rust:build

# Ejecutar tests Rust
npm run rust:test
```

### **Contratos Move**
```bash
# Compilar contratos Move
npm run move:build

# Ejecutar tests Move
npm run move:test
```

### **Contratos Vyper**
```bash
# Compilar contratos Vyper
npm run vyper:compile

# Ejecutar tests Vyper
npm run vyper:test
```

### **Tests y Desarrollo**
```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm run test:gas
npm run test:bridge
npm run test:bsc
npm run test:wcv

# Modo watch
npm run test:watch

# Cobertura de tests
npm run test:coverage
```

## 💡 Ejemplos de Uso

### **1. Publicar Isla en el Metaverso (Gas Abstraction)**
```javascript
// El usuario solo necesita WCV, no se preocupa por BNB
const gasProxy = await WCVGasProxy.deploy();

// Usuario publica isla desde BSC
const assetId = await gasProxy.publishIsland(
  "BSC",                    // Red blockchain
  "Mi Isla Paradisíaca",    // Nombre
  '{"type":"island"}',      // Metadata
  transactionId
);

// Sistema automáticamente:
// 1. Quema BSWCV del usuario (0.001 WCV)
// 2. Paga gas fees en BNB
// 3. Registra la acción en el metaverso
```

### **2. Transferir WCV entre Redes**
```javascript
// Transferir WCV de BSC a Ethereum
const bridge = await WoldVirtualBridge.deploy();

// Usuario paga en WCV, sistema maneja la conversión
await bridge.transferFromBSC(
  userAddress,    // Dirección destino
  1000            // Cantidad en WCV
);

// Sistema automáticamente:
// 1. Quema WCV en BSC
// 2. Acuña WCV en Ethereum
// 3. Paga gas fees en ambas redes
```

### **3. Staking WCV**
```javascript
// Hacer stake de WCV
const staking = await WCVStaking.deploy();

await staking.stake(10000); // 10 WCV

// Obtener recompensas
await staking.claimRewards();

// Convertirse en validador
// (requiere 10M WCV de stake)
```

## 🔗 Integración con Metaverso

### **Flujo de Trabajo Completo**
1. **Usuario conecta wallet** desde cualquier red soportada
2. **Sistema detecta red** automáticamente
3. **Usuario paga en WCV** (o token wrapped correspondiente)
4. **Sistema convierte** WCV a criptomoneda nativa
5. **Paga gas fees** en la red correspondiente
6. **Ejecuta acción** en el metaverso
7. **Registra transacción** en la blockchain

### **Servicios Disponibles**
- ✅ **Publicar isla**: 0.001 WCV
- ✅ **Publicar casa**: 0.001 WCV
- ✅ **Crear avatar**: 0.005 WCV
- ✅ **Crear mundo**: 0.05 WCV
- ✅ **Unirse al metaverso**: 0.001 WCV
- ✅ **Transferir assets**: 0.002 WCV
- ✅ **Mint NFT**: 0.01 WCV
- ✅ **Deploy smart contract**: 0.1 WCV

## 🌐 Redes Soportadas

### **L1 (Layer 1)**
- ✅ **Ethereum** (ETH)
- ✅ **Binance Smart Chain** (BNB)
- ✅ **Polygon** (MATIC)
- ✅ **Avalanche** (AVAX)
- ✅ **Arbitrum** (ARB)
- ✅ **Optimism** (OP)
- ✅ **Base** (ETH)
- ✅ **Mantle** (MNT)

### **L2 (Layer 2)**
- ✅ **zkSync** (ETH)
- ✅ **Starknet** (ETH)
- ✅ **Scroll** (ETH)
- ✅ **Linea** (ETH)

### **Otras Blockchains**
- ✅ **Solana** (SOL)
- ✅ **Cardano** (ADA)
- ✅ **Polkadot** (DOT)
- ✅ **Cosmos** (ATOM)
- ✅ **Aptos** (APT)
- ✅ **Sui** (SUI)
- ✅ **Near** (NEAR)
- ✅ **Tezos** (XTZ)

## 🔒 Seguridad

### **Características de Seguridad**
- ✅ **ReentrancyGuard**: Protección contra ataques de reentrancy
- ✅ **Ownable**: Control de acceso para funciones críticas
- ✅ **Pausable**: Capacidad de pausar en emergencias
- ✅ **Validación de inputs**: Verificación de parámetros
- ✅ **Límites de gas**: Protección contra ataques de gas
- ✅ **Timeouts**: Protección contra ataques de tiempo
- ✅ **Multi-sig**: Firmas múltiples para operaciones críticas

### **Auditorías**
- 🔄 **Auditoría externa** (pendiente)
- 🔄 **Bug bounty program** (pendiente)
- ✅ **Tests automatizados** (implementado)
- ✅ **Análisis estático** (implementado)

## 📊 Monitoreo y Analytics

### **Métricas Disponibles**
- 📈 **Total de transacciones**
- 💰 **Volumen total**
- 🌉 **Transacciones cross-chain**
- ⛽ **Gas fees pagados**
- 🏦 **Staking total**
- 🗳️ **Propuestas de gobernanza**
- 👥 **Usuarios activos**

### **Herramientas de Monitoreo**
- ✅ **Prometheus** (métricas)
- ✅ **Grafana** (dashboards)
- ✅ **Winston** (logging)
- ✅ **Health checks** (estado del sistema)

## 🚀 Despliegue

### **Docker**
```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run
```

### **Kubernetes**
```bash
# Aplicar configuración
kubectl apply -f k8s/

# Verificar estado
kubectl get pods
kubectl get services
```

### **Terraform**
```bash
# Inicializar
terraform init

# Planificar
terraform plan

# Aplicar
terraform apply
```

## 🤝 Contribución

### **Cómo Contribuir**
1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Implementa** tu cambio
4. **Añade** tests
5. **Ejecuta** todos los tests
6. **Envía** un pull request

### **Estándares de Código**
- ✅ **ESLint** para JavaScript/TypeScript
- ✅ **Prettier** para formateo
- ✅ **TypeScript** para tipado
- ✅ **Jest** para testing
- ✅ **Conventional Commits** para commits

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

### **Recursos**
- 📖 **Documentación**: [docs/](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/woldvirtual3d/blockchain/issues)
- 💬 **Discord**: [WoldVirtual3D Discord](https://discord.gg/woldvirtual3d)
- 📧 **Email**: support@woldvirtual3d.com

### **Comunidad**
- 🌐 **Website**: [woldvirtual3d.com](https://woldvirtual3d.com)
- 🐦 **Twitter**: [@WoldVirtual3D](https://twitter.com/WoldVirtual3D)
- 📺 **YouTube**: [WoldVirtual3D](https://youtube.com/@woldvirtual3d)
- 📱 **Telegram**: [@WoldVirtual3D](https://t.me/WoldVirtual3D)

---

**¡Construyendo el futuro del metaverso, una transacción a la vez! 🌟** 