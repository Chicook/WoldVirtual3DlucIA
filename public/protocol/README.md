# Metaverso Crypto World Virtual 3D - Protocol

## 📋 Descripción

Este directorio contiene el sistema completo de smart contracts para el **Metaverso Crypto World Virtual 3D**, un ecosistema descentralizado que integra blockchain, NFTs, DeFi y gobernanza DAO en un metaverso 3D inmersivo.

## 🏗️ Arquitectura del Sistema

### Contratos Principales

```
protocol/
├── contracts/
│   ├── core/
│   │   ├── MetaversoCore.sol          # Contrato principal del metaverso
│   │   ├── MetaversoToken.sol         # Token nativo del ecosistema
│   │   └── interfaces/
│   │       └── IMetaversoCore.sol     # Interfaz del contrato principal
│   ├── nfts/
│   │   └── MetaversoNFT.sol           # Sistema de NFTs
│   ├── defi/
│   │   ├── MetaversoDeFi.sol          # Sistema DeFi completo
│   │   └── interfaces/
│   │       └── IMetaversoToken.sol    # Interfaz del token
│   └── governance/
│       └── MetaversoGovernance.sol    # Sistema de gobernanza DAO
├── scripts/
│   └── Deploy.s.sol                   # Script de despliegue
├── test/
│   └── MetaversoTest.t.sol            # Tests completos
└── foundry.toml                       # Configuración de Foundry
```

## 🚀 Características Principales

### 🌍 MetaversoCore
- **Gestión de Usuarios**: Registro, perfiles, experiencia y niveles
- **Sistema de Islas**: Creación, visita y gestión de islas virtuales
- **Avatares**: Creación y personalización de avatares 3D
- **Transacciones**: Sistema de transacciones integrado
- **Reputación**: Sistema de reputación basado en actividad

### 💰 MetaversoToken
- **Token ERC-20**: Token nativo del metaverso (META)
- **Staking**: Sistema de staking con recompensas
- **Gobernanza**: Sistema de votación y propuestas
- **Vesting**: Programas de vesting para equipo y comunidad
- **Minting**: Control de emisión de tokens

### 🎨 MetaversoNFT
- **Colecciones**: Gestión de colecciones de NFTs
- **Minting**: Creación de NFTs con metadatos
- **Staking**: Staking de NFTs para recompensas
- **Subastas**: Sistema de subastas para NFTs
- **Marketplace**: Funcionalidades de marketplace integradas

### 💎 MetaversoDeFi
- **Staking Pools**: Múltiples pools de staking
- **Liquidity Pools**: Pools de liquidez AMM
- **Yield Farming**: Sistema de farming con recompensas
- **Flash Loans**: Préstamos flash para arbitraje
- **Swaps**: Intercambios de tokens

### 🗳️ MetaversoGovernance
- **Propuestas**: Creación y gestión de propuestas
- **Votación**: Sistema de votación con poder delegado
- **Delegación**: Delegación de poder de voto
- **Snapshots**: Capturas de estado para votación
- **Ejecución**: Ejecución automática de propuestas aprobadas

## 📦 Instalación y Configuración

### Prerrequisitos

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clonar el repositorio
git clone <repository-url>
cd MetaversoCryptoWoldVirtual3d/protocol

# Instalar dependencias
forge install OpenZeppelin/openzeppelin-contracts
```

### Configuración del Entorno

```bash
# Crear archivo .env
cp .env.example .env

# Configurar variables de entorno
MAINNET_RPC_URL=your_mainnet_rpc_url
SEPOLIA_RPC_URL=your_sepolia_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
TREASURY_ADDRESS=your_treasury_address
WETH_ADDRESS=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
```

## 🚀 Despliegue

### Despliegue Local (Anvil)

```bash
# Iniciar nodo local
anvil

# En otra terminal, desplegar
forge script scripts/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

### Despliegue en Testnet (Sepolia)

```bash
# Desplegar en Sepolia
forge script scripts/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### Despliegue en Mainnet

```bash
# Desplegar en Mainnet (¡CUIDADO!)
forge script scripts/Deploy.s.sol --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
forge test

# Ejecutar tests con logs
forge test -vv

# Ejecutar tests específicos
forge test --match-test testUserRegistration

# Ejecutar tests con gas report
forge test --gas-report
```

### Cobertura de Tests

```bash
# Generar reporte de cobertura
forge coverage

# Ver cobertura en navegador
forge coverage --report lcov
genhtml lcov.info -o coverage
```

## 📊 Funcionalidades Detalladas

### Sistema de Usuarios

```solidity
// Registro de usuario
metaversoCore.registerUser{value: 0.01 ether}("username");

// Obtener información del usuario
User memory user = metaversoCore.getUser(userAddress);

// Actualizar usuario
metaversoCore.updateUser("newUsername");
```

### Sistema de Islas

```solidity
// Crear isla
metaversoCore.createIsland{value: 0.1 ether}(
    "Island Name",
    "Description",
    "ipfs://metadata",
    100, // max capacity
    IslandType.FOREST
);

// Visitar isla
metaversoCore.visitIsland(islandId);

// Obtener información de isla
Island memory island = metaversoCore.getIsland(islandId);
```

### Sistema de Avatares

```solidity
// Crear avatar
AvatarTraits memory traits = AvatarTraits({
    gender: "male",
    age: "25",
    build: "athletic",
    // ... más propiedades
});

metaversoCore.createAvatar{value: 0.005 ether}("ipfs://avatar", traits);

// Obtener avatar
Avatar memory avatar = metaversoCore.getAvatar(avatarId);
```

### Sistema de Tokens

```solidity
// Staking
metaversoToken.approve(address(metaversoToken), amount);
metaversoToken.stake(amount);

// Claim rewards
metaversoToken.claimRewards();

// Governance
metaversoToken.createProposal("Title", "Description");
metaversoToken.vote(proposalId, true);
```

### Sistema de NFTs

```solidity
// Crear colección
metaversoNFT.createCollection(
    "Collection Name",
    "Description",
    "SYMBOL",
    1000, // max supply
    0.01 ether, // mint price
    "ipfs://baseURI/"
);

// Mint NFT
metaversoNFT.mintNFT{value: 0.02 ether}(
    collectionId,
    "ipfs://tokenURI",
    metadata
);

// Stake NFT
metaversoNFT.stakeNFT(tokenId);
```

### Sistema DeFi

```solidity
// Crear staking pool
metaversoDeFi.createStakingPool(
    "Pool Name",
    "Description",
    tokenAddress,
    rewardRate,
    minStake,
    maxStake,
    lockPeriod
);

// Stake en pool
metaversoDeFi.stake(poolId, amount);

// Crear liquidity pool
metaversoDeFi.createLiquidityPool(
    "LP Name",
    tokenA,
    tokenB,
    fee
);

// Add liquidity
metaversoDeFi.addLiquidity(poolId, amountA, amountB);
```

### Sistema de Gobernanza

```solidity
// Crear propuesta
metaversoGovernance.createProposal(
    "Title",
    "Description",
    "ipfs://metadata",
    ProposalType.POLICY_CHANGE
);

// Activar propuesta
metaversoGovernance.activateProposal(proposalId);

// Votar
metaversoGovernance.vote(proposalId, VoteChoice.YES, "Reason");

// Delegar voto
metaversoGovernance.delegate(delegateAddress, power);
```

## 🔧 Configuración Avanzada

### Parámetros de Configuración

```solidity
// MetaversoCore
metaversoCore.updateFees(
    0.01 ether,  // registration fee
    0.005 ether, // avatar creation fee
    0.1 ether    // island creation fee
);

// MetaversoToken
metaversoToken.updateRewardRate(1e15, 365 days);
metaversoToken.updateGovernanceParams(
    10000 * 10**18, // proposal threshold
    7 days,         // voting period
    100000 * 10**18 // quorum
);

// MetaversoNFT
metaversoNFT.updateConfiguration(
    0.01 ether, // mint fee
    1e15,       // staking reward rate
    7 days,     // auction duration
    0.001 ether, // min auction price
    250,        // platform fee (2.5%)
    100         // max NFTs per user
);
```

### Roles y Permisos

```solidity
// Agregar operadores autorizados
metaversoCore.addAuthorizedOperator(operatorAddress);
metaversoToken.addAuthorizedOperator(operatorAddress);
metaversoNFT.addAuthorizedMinter(minterAddress);

// Agregar miembros del consejo
metaversoGovernance.addCouncilMember(memberAddress);

// Agregar ejecutores autorizados
metaversoGovernance.addAuthorizedExecutor(executorAddress);
```

## 🔒 Seguridad

### Características de Seguridad

- **ReentrancyGuard**: Protección contra ataques de reentrancy
- **Pausable**: Capacidad de pausar contratos en emergencias
- **Ownable**: Control de acceso para funciones administrativas
- **Validaciones**: Validaciones exhaustivas de parámetros
- **Límites**: Límites en cantidades y frecuencias de operaciones

### Auditoría

```bash
# Ejecutar análisis estático
slither .

# Ejecutar Mythril
myth analyze contracts/core/MetaversoCore.sol

# Ejecutar Echidna (fuzzing)
echidna-test contracts/core/MetaversoCore.sol
```

## 📈 Monitoreo y Analytics

### Eventos Importantes

```solidity
// Eventos de usuario
event UserRegistered(address indexed user, uint256 userId, string username);
event UserUpdated(address indexed user, uint256 userId);

// Eventos de isla
event IslandCreated(uint256 indexed islandId, string name, address indexed creator);
event IslandVisited(uint256 indexed islandId, address indexed user);

// Eventos de token
event TokensStaked(address indexed user, uint256 amount, uint256 startTime);
event RewardsClaimed(address indexed user, uint256 amount);

// Eventos de NFT
event NFTMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed collectionId);
event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, uint256 startingPrice);

// Eventos de gobernanza
event ProposalCreated(uint256 indexed proposalId, string title, address indexed proposer);
event Voted(uint256 indexed proposalId, address indexed voter, VoteChoice choice, uint256 votingPower);
```

### Métricas Clave

```solidity
// Obtener estadísticas del core
(uint256 totalUsers, uint256 totalIslands, uint256 totalAvatars, uint256 totalTransactions, uint256 activeUsersCount, uint256 activeIslandsCount) = metaversoCore.getStats();

// Obtener estadísticas del token
(uint256 totalSupply, uint256 totalStaked, uint256 totalRewardsDistributed, uint256 activeProposals) = metaversoToken.getStats();

// Obtener estadísticas de NFTs
(uint256 totalNFTs, uint256 totalCollections, uint256 totalAuctions, uint256 activeAuctionsCount, uint256 stakedNFTs) = metaversoNFT.getStats();

// Obtener estadísticas de DeFi
(uint256 totalStakingPools, uint256 totalLiquidityPools, uint256 totalYieldFarms, uint256 activeStakingPoolsCount, uint256 activeLiquidityPoolsCount, uint256 activeYieldFarmsCount) = metaversoDeFi.getStats();

// Obtener estadísticas de gobernanza
(uint256 totalProposals, uint256 activeProposalsCount, uint256 executedProposalsCount, uint256 totalVoters, uint256 totalSnapshots) = metaversoGovernance.getStats();
```

## 🔄 Integración con Frontend

### Web3 Integration

```javascript
// Conectar con contratos
const metaversoCore = new ethers.Contract(CORE_ADDRESS, CORE_ABI, signer);
const metaversoToken = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
const metaversoNFT = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
const metaversoDeFi = new ethers.Contract(DEFI_ADDRESS, DEFI_ABI, signer);
const metaversoGovernance = new ethers.Contract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, signer);

// Ejemplo: Registrar usuario
const tx = await metaversoCore.registerUser("username", { value: ethers.utils.parseEther("0.01") });
await tx.wait();

// Ejemplo: Obtener información del usuario
const user = await metaversoCore.getUser(userAddress);
console.log("Username:", user.username);
console.log("Level:", user.level.toString());
console.log("Experience:", user.experience.toString());
```

### Event Listeners

```javascript
// Escuchar eventos de registro de usuario
metaversoCore.on("UserRegistered", (user, userId, username) => {
    console.log(`Usuario registrado: ${username} (ID: ${userId})`);
});

// Escuchar eventos de visita a isla
metaversoCore.on("IslandVisited", (islandId, user) => {
    console.log(`Usuario ${user} visitó isla ${islandId}`);
});

// Escuchar eventos de staking
metaversoToken.on("TokensStaked", (user, amount, startTime) => {
    console.log(`Usuario ${user} stakearon ${ethers.utils.formatEther(amount)} tokens`);
});
```

## 🚀 Roadmap

### Fase 1 - Core (Completado)
- ✅ Sistema de usuarios y avatares
- ✅ Sistema de islas virtuales
- ✅ Token nativo del metaverso
- ✅ Sistema básico de transacciones

### Fase 2 - NFTs y DeFi (Completado)
- ✅ Sistema completo de NFTs
- ✅ Staking pools y yield farming
- ✅ Liquidity pools y swaps
- ✅ Sistema de subastas

### Fase 3 - Gobernanza (Completado)
- ✅ Sistema de gobernanza DAO
- ✅ Delegación de votos
- ✅ Propuestas y ejecución
- ✅ Snapshots para votación

### Fase 4 - Integración (En Desarrollo)
- 🔄 Integración con Three.js
- 🔄 Sistema de audio ambiental
- 🔄 Física avanzada
- 🔄 Networking en tiempo real

### Fase 5 - Escalabilidad (Planificado)
- 📋 Layer 2 solutions
- 📋 Cross-chain bridges
- 📋 Advanced DeFi features
- 📋 AI integration

## 🤝 Contribución

### Guías de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código

- Usar **Solidity 0.8.19** o superior
- Seguir **OpenZeppelin** standards
- Documentar todas las funciones públicas
- Escribir tests para todas las funcionalidades
- Usar **NatSpec** para documentación

### Testing

```bash
# Antes de hacer commit, ejecutar:
forge test
forge coverage
forge build
forge fmt
forge doc
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Proyecto**: Metaverso Crypto World Virtual 3D
- **Email**: contacto@metaversocrypto.com
- **Discord**: [Unirse al servidor](https://discord.gg/metaversocrypto)
- **Twitter**: [@MetaversoCrypto](https://twitter.com/MetaversoCrypto)

## 🙏 Agradecimientos

- **OpenZeppelin** por las librerías de contratos seguros
- **Foundry** por el framework de desarrollo
- **Ethereum Foundation** por la plataforma blockchain
- **Comunidad** por el apoyo y feedback

---

**¡Construyendo el futuro del metaverso descentralizado! 🌍✨** 