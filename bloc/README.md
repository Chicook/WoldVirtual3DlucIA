# Metaverso Blockchain Module (@metaverso/bloc)

Infraestructura blockchain completa y integración DeFi para el metaverso descentralizado Web3.

## 🚀 Características

### Core Blockchain
- **Multi-Network Support**: Ethereum, Polygon, Arbitrum, Optimism, BSC, Avalanche, Fantom
- **Smart Contract Management**: Despliegue, interacción y monitoreo de contratos
- **Transaction Management**: Manejo robusto de transacciones con gas optimization
- **Event Management**: Escucha y procesamiento de eventos en tiempo real

### DeFi Integration
- **Uniswap V2/V3**: Swaps, liquidity provision, yield farming
- **Aave**: Lending, borrowing, flash loans
- **Compound**: Supply, borrow, governance
- **Curve**: Stable swaps, yield optimization
- **Balancer**: Weighted pools, liquidity mining
- **Synthetix**: Synthetic assets, derivatives
- **Yearn**: Vault strategies, yield aggregation

### NFT & Metaverse Assets
- **NFT Management**: Minting, transfer, metadata handling
- **Marketplace Integration**: Listing, buying, auctions
- **Metaverse Assets**: Virtual land, avatars, items
- **Cross-Chain NFTs**: Bridge between networks

### Governance & DAO
- **Voting Systems**: Proposal creation, voting, execution
- **DAO Management**: Treasury, permissions, governance
- **Delegation**: Vote delegation and management

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Build de contratos
npm run build:contracts

# Build de TypeScript
npm run build

# Tests
npm run test
```

## 🏗️ Arquitectura

### Estructura de Carpetas
```
src/
├── core/                 # Core blockchain functionality
│   ├── BlockchainManager.ts
│   ├── NetworkManager.ts
│   ├── ContractManager.ts
│   ├── TransactionManager.ts
│   └── EventManager.ts
├── defi/                 # DeFi protocol integrations
│   ├── DeFiManager.ts
│   └── protocols/
│       ├── UniswapManager.ts
│       ├── AaveManager.ts
│       ├── CompoundManager.ts
│       ├── CurveManager.ts
│       ├── BalancerManager.ts
│       ├── SynthetixManager.ts
│       └── YearnManager.ts
├── nfts/                 # NFT management
│   ├── NFTManager.ts
│   ├── MetaverseAssetManager.ts
│   └── MarketplaceManager.ts
├── governance/           # Governance & DAO
│   ├── GovernanceManager.ts
│   ├── DAOManager.ts
│   └── VotingManager.ts
├── utils/                # Utilities
│   ├── Logger.ts
│   ├── ChainlinkOracle.ts
│   ├── PriceFeeds.ts
│   ├── GasOptimizer.ts
│   └── TransactionBuilder.ts
├── constants/            # Constants
│   ├── networks.ts
│   ├── contracts.ts
│   └── addresses.ts
├── types/                # TypeScript types
├── services/             # Services
└── middleware/           # Middleware
```

### Flujo de Datos
```
User Request → BlockchainManager → NetworkManager → Protocol Manager → Smart Contract
     ↓              ↓                ↓                ↓                ↓
Response ← EventManager ← TransactionManager ← ContractManager ← Blockchain
```

## 🔧 Configuración

### Variables de Entorno
```env
# Network RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io
BSC_RPC_URL=https://bsc-dataseed.binance.org
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
FANTOM_RPC_URL=https://rpc.ftm.tools

# Contract Addresses
ETHEREUM_METAVERSO_TOKEN=0x...
ETHEREUM_METAVERSO_NFT=0x...
ETHEREUM_MARKETPLACE=0x...

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key

# Logging
LOG_LEVEL=info
```

### Configuración de Redes
```typescript
import { NETWORKS, getNetworkById } from '@metaverso/bloc'

// Obtener red específica
const polygon = getNetworkById('polygon')

// Configurar red personalizada
const customNetwork = {
  id: 'custom',
  name: 'Custom Network',
  chainId: 1337,
  rpcUrl: 'http://localhost:8545',
  explorerUrl: 'http://localhost:4000',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  contracts: {
    metaversoToken: '0x...',
    metaversoNFT: '0x...'
  },
  isTestnet: false,
  isActive: true
}
```

## 🎮 Uso

### Inicialización
```typescript
import { 
  initializeBlockchain, 
  blockchainManager, 
  defiManager, 
  nftManager 
} from '@metaverso/bloc'

// Inicializar toda la infraestructura blockchain
const managers = await initializeBlockchain({
  networks: [
    { id: 'polygon', rpcUrl: 'https://polygon-rpc.com' },
    { id: 'ethereum', rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY' }
  ],
  defi: {
    uniswap: { v2Router: '0x...', v3Router: '0x...' },
    aave: { lendingPool: '0x...' }
  },
  nft: {
    metaverseNFT: '0x...',
    marketplace: '0x...'
  }
})
```

### Conexión a Redes
```typescript
import { networkManager } from '@metaverso/bloc'

// Conectar a una red específica
await networkManager.connectToNetwork('polygon')

// Obtener información de la red actual
const currentNetwork = await networkManager.getCurrentNetwork()
console.log(`Connected to: ${currentNetwork.name}`)

// Obtener balance
const balance = await blockchainManager.getBalance('0x...')
console.log(`Balance: ${balance} ${currentNetwork.nativeCurrency.symbol}`)
```

### DeFi Operations
```typescript
import { defiManager } from '@metaverso/bloc'

// Swap tokens en Uniswap
const swapResult = await defiManager.swapTokens(
  '0x...', // tokenIn
  '0x...', // tokenOut
  '1000000000000000000', // amountIn (1 ETH)
  '0', // amountOutMin
  Math.floor(Date.now() / 1000) + 300 // deadline (5 minutes)
)

// Depositar en Aave
const depositResult = await defiManager.depositToAave(
  '0x...', // asset
  '1000000000000000000', // amount
  '0x...' // onBehalfOf
)

// Obtener oportunidades de yield
const opportunities = await defiManager.getYieldOpportunities()
console.log('Top yield opportunities:', opportunities.slice(0, 5))
```

### NFT Operations
```typescript
import { nftManager } from '@metaverso/bloc'

// Obtener NFTs de una dirección
const nfts = await nftManager.getNFTs('0x...')
console.log(`User has ${nfts.length} NFTs`)

// Mintear nuevo NFT
const mintResult = await nftManager.mintNFT(
  '0x...', // to
  'ipfs://Qm...', // tokenURI
  {
    name: 'Metaverso Land #1',
    description: 'Virtual land in the metaverse',
    image: 'ipfs://Qm...',
    attributes: [
      { trait_type: 'Location', value: 'Downtown' },
      { trait_type: 'Size', value: '100x100' }
    ]
  }
)

// Listar NFT en marketplace
const listResult = await nftManager.listNFT(
  '1', // tokenId
  '1.5', // price in ETH
  86400 // duration in seconds (24 hours)
)
```

### Smart Contract Interaction
```typescript
import { blockchainManager } from '@metaverso/bloc'

// Obtener instancia de contrato
const contract = blockchainManager.getContract(
  '0x...', // address
  ['function balanceOf(address) view returns (uint256)'] // abi
)

// Llamar función del contrato
const balance = await contract.balanceOf('0x...')

// Enviar transacción
const tx = await contract.transfer('0x...', '1000000000000000000')
const receipt = await blockchainManager.waitForTransaction(tx.hash)
```

### Event Listening
```typescript
import { blockchainManager } from '@metaverso/bloc'

// Escuchar eventos de un contrato
await blockchainManager.listenToEvents(
  '0x...', // contract address
  'Transfer', // event name
  (event) => {
    console.log('Transfer event:', event)
  }
)

// Obtener eventos históricos
const events = await blockchainManager.getEvents(
  '0x...', // contract address
  'Transfer', // event name
  1000000, // fromBlock
  1001000  // toBlock
)
```

## 🔌 APIs y Servicios

### BlockchainManager
```typescript
// Core operations
await blockchainManager.connectToNetwork('polygon')
const provider = blockchainManager.getCurrentProvider()
const signer = blockchainManager.getCurrentSigner()
const balance = await blockchainManager.getBalance('0x...')

// Transaction management
const tx = await blockchainManager.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('1.0'),
  gasLimit: 21000
})

// Contract management
const contract = blockchainManager.getContract('0x...', abi)
const deployed = await blockchainManager.deployContract(bytecode, abi, args)
```

### DeFiManager
```typescript
// Protocol information
const protocols = await defiManager.getProtocols()
const positions = await defiManager.getPositions('0x...')
const totalValue = await defiManager.getTotalValue('0x...')

// Trading operations
const swap = await defiManager.swapTokens(tokenIn, tokenOut, amountIn, amountOutMin, deadline)
const deposit = await defiManager.depositToAave(asset, amount, onBehalfOf)
const borrow = await defiManager.borrowFromAave(asset, amount, interestRateMode, onBehalfOf)

// Yield farming
const opportunities = await defiManager.getYieldOpportunities()
```

### NFTManager
```typescript
// NFT operations
const nfts = await nftManager.getNFTs('0x...')
const nft = await nftManager.getNFT('1')
const minted = await nftManager.mintNFT(to, tokenURI, metadata)

// Marketplace operations
const listed = await nftManager.listNFT(tokenId, price, duration)
const bought = await nftManager.buyNFT(tokenId, price)
const listedNFTs = await nftManager.getListedNFTs()

// Collections
const collections = await nftManager.getCollections()
```

## 🧪 Testing

### Configuración de Tests
```typescript
// test/setup.ts
import { ethers } from 'ethers'
import { initializeBlockchain } from '@metaverso/bloc'

beforeAll(async () => {
  // Setup local blockchain
  const provider = new ethers.JsonRpcProvider('http://localhost:8545')
  
  await initializeBlockchain({
    networks: [{
      id: 'local',
      name: 'Local Network',
      chainId: 1337,
      rpcUrl: 'http://localhost:8545',
      explorerUrl: 'http://localhost:4000',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      contracts: {},
      isTestnet: true,
      isActive: true
    }]
  })
})
```

### Ejemplos de Tests
```typescript
import { blockchainManager, defiManager, nftManager } from '@metaverso/bloc'

describe('Blockchain Operations', () => {
  test('should connect to network', async () => {
    await blockchainManager.connectToNetwork('local')
    expect(blockchainManager.isReady()).toBe(true)
  })

  test('should get balance', async () => {
    const balance = await blockchainManager.getBalance('0x...')
    expect(parseFloat(balance)).toBeGreaterThan(0)
  })

  test('should deploy contract', async () => {
    const deployed = await blockchainManager.deployContract(bytecode, abi, [])
    expect(deployed.address).toBeDefined()
  })
})

describe('DeFi Operations', () => {
  test('should get protocols', async () => {
    const protocols = await defiManager.getProtocols()
    expect(protocols.length).toBeGreaterThan(0)
  })

  test('should get yield opportunities', async () => {
    const opportunities = await defiManager.getYieldOpportunities()
    expect(opportunities.length).toBeGreaterThan(0)
  })
})
```

## 🚀 Despliegue

### Despliegue de Contratos
```bash
# Despliegue local
npm run deploy:local

# Despliegue en testnet
npm run deploy:testnet

# Despliegue en mainnet
npm run deploy:mainnet
```

### Verificación de Contratos
```bash
# Verificar contrato en Etherscan
npm run verify 0x... --network ethereum

# Verificar contrato en Polygonscan
npm run verify 0x... --network polygon
```

### Monitoreo
```bash
# Reporte de gas
npm run gas

# Cobertura de tests
npm run coverage

# Análisis de tamaño
npm run size
```

## 🔒 Seguridad

### Best Practices
- **Access Control**: Implementar roles y permisos en contratos
- **Reentrancy Protection**: Usar OpenZeppelin ReentrancyGuard
- **Input Validation**: Validar todos los inputs de usuario
- **Gas Optimization**: Optimizar uso de gas en contratos
- **Emergency Pause**: Implementar mecanismos de pausa de emergencia

### Auditoría
```bash
# Análisis estático con Slither
slither contracts/

# Análisis con Mythril
myth analyze contracts/MetaversoToken.sol

# Análisis con Echidna
echidna-test contracts/ --config echidna.config.yml
```

## 📊 Monitoreo y Analytics

### Métricas de Red
```typescript
// Obtener estado de salud
const health = await blockchainManager.getHealthStatus()
console.log('Network health:', health)

// Obtener estadísticas
const stats = await blockchainManager.getStats()
console.log('Network stats:', stats)

// Monitorear transacciones
const pending = blockchainManager.getPendingTransactions()
console.log('Pending transactions:', pending.length)
```

### DeFi Analytics
```typescript
// TVL por protocolo
const protocols = await defiManager.getProtocols()
const totalTVL = protocols.reduce((sum, p) => sum + parseFloat(p.tvl), 0)

// APY promedio
const avgAPY = protocols.reduce((sum, p) => sum + parseFloat(p.apy), 0) / protocols.length

// Posiciones de usuario
const positions = await defiManager.getPositions('0x...')
const totalValue = positions.reduce((sum, p) => sum + parseFloat(p.value), 0)
```

## 🌐 Integración con Frontend

### React Hook
```typescript
import { useBlockchain } from '@metaverso/bloc/react'

function MetaversoApp() {
  const { 
    isConnected, 
    connect, 
    disconnect, 
    balance, 
    network 
  } = useBlockchain()

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected to {network.name}</p>
          <p>Balance: {balance} {network.nativeCurrency.symbol}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  )
}
```

### Web3 Provider
```typescript
import { BlockchainProvider } from '@metaverso/bloc/react'

function App() {
  return (
    <BlockchainProvider>
      <MetaversoApp />
    </BlockchainProvider>
  )
}
```

## 📚 Recursos

### Documentación
- [Ethers.js](https://docs.ethers.io/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Uniswap V3](https://docs.uniswap.org/)
- [Aave V3](https://docs.aave.com/)

### Comunidad
- [Discord](https://discord.gg/metaverso)
- [GitHub](https://github.com/metaverso/bloc)
- [Documentación](https://docs.metaverso.com/bloc)

## 🤝 Contribución

### Guías de Contribución
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- Solidity: Solhint + Prettier
- TypeScript: ESLint + Prettier
- Tests: Jest + Hardhat
- Documentación: JSDoc + README

## 📄 Licencia

MIT License - ver [LICENSE](../LICENSE) para detalles.

---

**Metaverso Blockchain Module** - Infraestructura blockchain descentralizada para el futuro del metaverso 🌐⚡ 