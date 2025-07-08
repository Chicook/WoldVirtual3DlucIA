const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

console.log("🔧 Configurando proyecto WCV Blockchain...");

// Función para generar clave privada aleatoria
function generatePrivateKey() {
    return "0x" + crypto.randomBytes(32).toString("hex");
}

// Función para crear archivo .env
function createEnvFile() {
    const envContent = `# WCV Blockchain Configuration
# ======================================

# Blockchain Configuration
BLOCKCHAIN_PORT=8545
CHAIN_ID=1337
BLOCK_TIME=15
GAS_LIMIT=8000000
GAS_PRICE=20000000000

# Private Key (GENERAR UNA NUEVA CLAVE PRIVADA)
PRIVATE_KEY=${generatePrivateKey()}

# BSC Configuration (para bridge)
BSCSCAN_API_KEY=tu_api_key_bscscan_aqui
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# WCV Network Configuration
WCV_DEV_RPC=http://127.0.0.1:8546
WCV_TEST_RPC=http://127.0.0.1:8547
WCV_MAIN_RPC=http://127.0.0.1:8550

# Database Configuration (opcional)
MONGODB_URI=mongodb://localhost:27017/wcv_blockchain
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=3000
API_SECRET=${crypto.randomBytes(32).toString("hex")}
JWT_SECRET=${crypto.randomBytes(32).toString("hex")}

# Logging
LOG_LEVEL=info
LOG_FILE=logs/wcv_blockchain.log

# Monitoring
REPORT_GAS=true
COINMARKETCAP_API_KEY=tu_api_key_coinmarketcap_aqui

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Bridge Configuration
BRIDGE_VALIDATOR_ADDRESS=0x0000000000000000000000000000000000000000
BSC_WCV_CONTRACT=0x053532E91FFD6b8a21C925Da101C909A01106BBE

# Development
NODE_ENV=development
DEBUG=true
`;

    const envPath = path.join(__dirname, "../.env");
    
    if (fs.existsSync(envPath)) {
        console.log("⚠️  Archivo .env ya existe. Creando backup...");
        const backupPath = path.join(__dirname, "../.env.backup");
        fs.copyFileSync(envPath, backupPath);
        console.log(`✅ Backup creado en: ${backupPath}`);
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Archivo .env creado");
    console.log("⚠️  IMPORTANTE: Actualiza las claves API y configura las direcciones correctas");
}

// Función para crear directorios necesarios
function createDirectories() {
    const directories = [
        "deployments",
        "logs",
        "data",
        "cache",
        "artifacts",
        "test/mocks",
        "src/config",
        "src/utils",
        "src/services",
        "src/middleware"
    ];
    
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, "..", dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Directorio creado: ${dir}`);
        }
    });
}

// Función para crear archivo de configuración de red
function createNetworkConfig() {
    const networkConfig = {
        networks: {
            wcvLocal: {
                name: "WCV Local",
                chainId: 31337,
                rpcUrl: "http://127.0.0.1:8545",
                explorer: "http://127.0.0.1:8545",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            },
            wcvDev: {
                name: "WCV Development",
                chainId: 1338,
                rpcUrl: "http://127.0.0.1:8546",
                explorer: "http://127.0.0.1:8546",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            },
            wcvTest: {
                name: "WCV Testnet",
                chainId: 1339,
                rpcUrl: "http://127.0.0.1:8547",
                explorer: "http://127.0.0.1:8547",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            },
            wcvMain: {
                name: "WCV Mainnet",
                chainId: 1340,
                rpcUrl: "http://127.0.0.1:8550",
                explorer: "http://127.0.0.1:8550",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            },
            bsc: {
                name: "Binance Smart Chain",
                chainId: 56,
                rpcUrl: "https://bsc-dataseed1.binance.org/",
                explorer: "https://bscscan.com",
                nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18
                }
            },
            bscTestnet: {
                name: "BSC Testnet",
                chainId: 97,
                rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
                explorer: "https://testnet.bscscan.com",
                nativeCurrency: {
                    name: "tBNB",
                    symbol: "tBNB",
                    decimals: 18
                }
            }
        },
        token: {
            name: "WCV Token",
            symbol: "WCV",
            decimals: 3,
            totalSupply: "30000000",
            maxSupply: "100000000"
        }
    };
    
    const configPath = path.join(__dirname, "../config/networks.json");
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(networkConfig, null, 2));
    console.log("✅ Configuración de redes creada");
}

// Función para crear archivo de configuración de MetaMask
function createMetaMaskConfig() {
    const metamaskConfig = {
        title: "WCV Blockchain - MetaMask Configuration",
        description: "Configuración para conectar MetaMask a la red WCV",
        networks: [
            {
                name: "WCV Local",
                chainId: "0x7A69", // 31337 en hex
                rpcUrl: "http://127.0.0.1:8545",
                explorer: "http://127.0.0.1:8545",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            },
            {
                name: "WCV Development",
                chainId: "0x53A", // 1338 en hex
                rpcUrl: "http://127.0.0.1:8546",
                explorer: "http://127.0.0.1:8546",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            },
            {
                name: "WCV Testnet",
                chainId: "0x53B", // 1339 en hex
                rpcUrl: "http://127.0.0.1:8547",
                explorer: "http://127.0.0.1:8547",
                nativeCurrency: {
                    name: "WCV",
                    symbol: "WCV",
                    decimals: 18
                }
            }
        ],
        instructions: [
            "1. Abrir MetaMask",
            "2. Ir a Configuración > Redes",
            "3. Hacer clic en 'Agregar red'",
            "4. Completar los campos con la información de arriba",
            "5. Guardar la configuración"
        ]
    };
    
    const configPath = path.join(__dirname, "../config/metamask.json");
    fs.writeFileSync(configPath, JSON.stringify(metamaskConfig, null, 2));
    console.log("✅ Configuración de MetaMask creada");
}

// Función para crear archivo README de configuración
function createSetupREADME() {
    const readmeContent = `# WCV Blockchain - Configuración Inicial

## 🚀 Pasos para comenzar

### 1. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 2. Configurar variables de entorno
El archivo \`.env\` ya ha sido creado con valores por defecto. Actualiza las siguientes variables:

- \`PRIVATE_KEY\`: Tu clave privada para el despliegue
- \`BSCSCAN_API_KEY\`: Tu API key de BSCScan
- \`COINMARKETCAP_API_KEY\`: Tu API key de CoinMarketCap (opcional)

### 3. Compilar contratos
\`\`\`bash
npm run compile
\`\`\`

### 4. Iniciar nodo local
\`\`\`bash
npm run node
\`\`\`

### 5. Desplegar contratos
\`\`\`bash
npm run deploy:local
\`\`\`

### 6. Configurar MetaMask
1. Abrir MetaMask
2. Agregar red personalizada con la información en \`config/metamask.json\`
3. Importar cuenta usando la clave privada del deployer

## 📁 Estructura del proyecto

\`\`\`
bk_wcv/
├── contracts/          # Contratos inteligentes
├── scripts/           # Scripts de despliegue
├── test/              # Tests
├── src/               # Código fuente
├── config/            # Configuraciones
├── deployments/       # Información de despliegues
└── logs/              # Logs del sistema
\`\`\`

## 🔧 Comandos útiles

\`\`\`bash
# Desarrollo
npm run dev            # Modo desarrollo
npm run test           # Ejecutar tests
npm run test:watch     # Tests en modo watch

# Despliegue
npm run compile        # Compilar contratos
npm run deploy:local   # Desplegar en red local
npm run deploy:test    # Desplegar en red de prueba

# Interacción
npm run console        # Consola Hardhat
npm run node           # Iniciar nodo local

# Utilidades
npm run lint           # Linting
npm run format         # Formatear código
npm run coverage       # Cobertura de tests
\`\`\`

## 🌉 Bridge Configuration

El puente permite transferir WCV entre la red local y Binance Smart Chain:

1. **WCV Local → BSC**: Enviar WCV desde la red local a BSC
2. **BSC → WCV Local**: Recibir WCV desde BSC a la red local

### Configuración del Bridge

- **Contrato BSC**: 0x053532E91FFD6b8a21C925Da101C909A01106BBE
- **Fee mínimo**: 100 WCV (0,100)
- **Fee máximo**: 1,000,000 WCV (1,000,000)
- **Fee de bridge**: 0.0001 ETH

## 🔒 Seguridad

- Nunca compartas tu clave privada
- Usa variables de entorno para secrets
- Revisa los contratos antes de producción
- Ejecuta tests completos
- Mantén backups de configuración

## 📞 Soporte

Para problemas o preguntas, consulta la documentación o crea un issue en el repositorio.
`;

    const readmePath = path.join(__dirname, "../SETUP.md");
    fs.writeFileSync(readmePath, readmeContent);
    console.log("✅ README de configuración creado");
}

// Función principal
function main() {
    console.log("🔧 Iniciando configuración del proyecto...");
    
    try {
        createDirectories();
        createEnvFile();
        createNetworkConfig();
        createMetaMaskConfig();
        createSetupREADME();
        
        console.log("\n✅ Configuración completada exitosamente!");
        console.log("\n📝 Próximos pasos:");
        console.log("1. Actualizar el archivo .env con tus claves API");
        console.log("2. Ejecutar: npm install");
        console.log("3. Ejecutar: npm run compile");
        console.log("4. Ejecutar: npm run node");
        console.log("5. Ejecutar: npm run deploy:local");
        console.log("\n📖 Consulta SETUP.md para más información");
        
    } catch (error) {
        console.error("❌ Error durante la configuración:", error);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}

module.exports = { main }; 