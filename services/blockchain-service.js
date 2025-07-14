/**
 * Blockchain Service - Metaverso Crypto World Virtual 3D
 * Servicio de integración con blockchain y smart contracts
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

class BlockchainService {
    constructor() {
        this.providers = new Map();
        this.contracts = new Map();
        this.wallets = new Map();
        this.networks = new Map();
        this.transactions = new Map();
        this.eventListeners = new Map();
        
        this.config = {
            defaultNetwork: 'testnet',
            gasLimit: 3000000,
            gasPrice: 'auto',
            confirmations: 1,
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000
        };
        
        this.isConnected = false;
        this.isInitialized = false;
        this.currentNetwork = null;
        this.currentWallet = null;
    }

    /**
     * Inicializar el servicio de blockchain
     */
    async initialize(config = {}) {
        if (this.isInitialized) {
            console.warn('Blockchain Service ya está inicializado');
            return;
        }

        console.log('🔗 Inicializando Blockchain Service...');
        
        // Aplicar configuración
        this.config = { ...this.config, ...config };
        
        // Configurar redes
        await this.setupNetworks();
        
        // Configurar contratos
        await this.setupContracts();
        
        // Conectar a la red por defecto
        await this.connectToNetwork(this.config.defaultNetwork);
        
        this.isInitialized = true;
        console.log('✅ Blockchain Service inicializado correctamente');
        
        // Emitir evento
        this.emit('initialized', { 
            network: this.currentNetwork,
            timestamp: Date.now() 
        });
    }

    /**
     * Configurar redes disponibles
     */
    async setupNetworks() {
        const networks = {
            localhost: {
                name: 'Localhost',
                rpc: 'http://localhost:8545',
                chainId: 1337,
                explorer: null,
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                }
            },
            testnet: {
                name: 'Goerli Testnet',
                rpc: process.env.GOERLI_RPC_URL || 'https://goerli.infura.io/v3/YOUR_KEY',
                chainId: 5,
                explorer: 'https://goerli.etherscan.io',
                nativeCurrency: {
                    name: 'Goerli Ether',
                    symbol: 'ETH',
                    decimals: 18
                }
            },
            mainnet: {
                name: 'Ethereum Mainnet',
                rpc: process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
                chainId: 1,
                explorer: 'https://etherscan.io',
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                }
            },
            polygon: {
                name: 'Polygon',
                rpc: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
                chainId: 137,
                explorer: 'https://polygonscan.com',
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                }
            }
        };

        for (const [key, network] of Object.entries(networks)) {
            this.networks.set(key, network);
        }

        console.log(`🌐 ${this.networks.size} redes configuradas`);
    }

    /**
     * Configurar contratos inteligentes
     */
    async setupContracts() {
        const contractAddresses = {
            localhost: {
                metaversoCore: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                metaversoToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                metaversoNFT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
                metaversoDeFi: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
                metaversoGovernance: '0xDc64a140Aa3E981100a9becA4E685f962fC0B8Dc'
            },
            testnet: {
                metaversoCore: process.env.TESTNET_CORE_ADDRESS || '0x...',
                metaversoToken: process.env.TESTNET_TOKEN_ADDRESS || '0x...',
                metaversoNFT: process.env.TESTNET_NFT_ADDRESS || '0x...',
                metaversoDeFi: process.env.TESTNET_DEFI_ADDRESS || '0x...',
                metaversoGovernance: process.env.TESTNET_GOVERNANCE_ADDRESS || '0x...'
            },
            mainnet: {
                metaversoCore: process.env.MAINNET_CORE_ADDRESS || '0x...',
                metaversoToken: process.env.MAINNET_TOKEN_ADDRESS || '0x...',
                metaversoNFT: process.env.MAINNET_NFT_ADDRESS || '0x...',
                metaversoDeFi: process.env.MAINNET_DEFI_ADDRESS || '0x...',
                metaversoGovernance: process.env.MAINNET_GOVERNANCE_ADDRESS || '0x...'
            }
        };

        for (const [network, addresses] of Object.entries(contractAddresses)) {
            this.contracts.set(network, addresses);
        }

        console.log(`📜 Contratos configurados para ${this.contracts.size} redes`);
    }

    /**
     * Conectar a una red específica
     */
    async connectToNetwork(networkName) {
        const network = this.networks.get(networkName);
        if (!network) {
            throw new Error(`Red '${networkName}' no encontrada`);
        }

        console.log(`🔗 Conectando a ${network.name}...`);

        try {
            // Crear provider
            const provider = new ethers.providers.JsonRpcProvider(network.rpc);
            
            // Verificar conexión
            await provider.getNetwork();
            
            // Guardar provider
            this.providers.set(networkName, provider);
            this.currentNetwork = networkName;
            this.isConnected = true;

            console.log(`✅ Conectado a ${network.name} (Chain ID: ${network.chainId})`);
            
            // Emitir evento
            this.emit('networkConnected', { 
                network: networkName,
                chainId: network.chainId,
                timestamp: Date.now() 
            });
            
            return true;
        } catch (error) {
            console.error(`❌ Error conectando a ${network.name}:`, error);
            this.emit('networkConnectionError', { 
                network: networkName, 
                error: error.message 
            });
            return false;
        }
    }

    /**
     * Conectar wallet
     */
    async connectWallet(walletType = 'metamask') {
        if (!this.isConnected) {
            throw new Error('No hay conexión a red blockchain');
        }

        console.log(`👛 Conectando wallet: ${walletType}`);

        try {
            let wallet;

            switch (walletType) {
                case 'metamask':
                    if (typeof window.ethereum !== 'undefined') {
                        // Solicitar conexión
                        await window.ethereum.request({ 
                            method: 'eth_requestAccounts' 
                        });
                        
                        // Crear signer
                        const provider = new ethers.providers.Web3Provider(window.ethereum);
                        wallet = provider.getSigner();
                    } else {
                        throw new Error('MetaMask no está instalado');
                    }
                    break;

                case 'privateKey':
                    const privateKey = process.env.PRIVATE_KEY;
                    if (!privateKey) {
                        throw new Error('PRIVATE_KEY no configurada');
                    }
                    const provider = this.providers.get(this.currentNetwork);
                    wallet = new ethers.Wallet(privateKey, provider);
                    break;

                default:
                    throw new Error(`Tipo de wallet no soportado: ${walletType}`);
            }

            // Verificar red
            const network = await wallet.provider.getNetwork();
            const expectedNetwork = this.networks.get(this.currentNetwork);
            
            if (network.chainId !== expectedNetwork.chainId) {
                throw new Error(`Red incorrecta. Esperada: ${expectedNetwork.chainId}, Actual: ${network.chainId}`);
            }

            // Guardar wallet
            this.wallets.set(walletType, wallet);
            this.currentWallet = wallet;

            const address = await wallet.getAddress();
            console.log(`✅ Wallet conectado: ${address}`);
            
            // Emitir evento
            this.emit('walletConnected', { 
                type: walletType,
                address: address,
                timestamp: Date.now() 
            });
            
            return address;
        } catch (error) {
            console.error(`❌ Error conectando wallet:`, error);
            this.emit('walletConnectionError', { 
                type: walletType, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Obtener contrato
     */
    getContract(contractName, networkName = null) {
        const network = networkName || this.currentNetwork;
        const addresses = this.contracts.get(network);
        const provider = this.providers.get(network);
        
        if (!addresses || !provider) {
            throw new Error(`Red '${network}' no configurada`);
        }

        const address = addresses[contractName];
        if (!address) {
            throw new Error(`Contrato '${contractName}' no encontrado en ${network}`);
        }

        // Crear instancia del contrato
        const contract = new ethers.Contract(
            address,
            this.getContractABI(contractName),
            this.currentWallet || provider
        );

        return contract;
    }

    /**
     * Obtener ABI del contrato
     */
    getContractABI(contractName) {
        // ABIs básicos - en producción se cargarían desde archivos
        const abis = {
            metaversoCore: [
                "function getWorldInfo() external view returns (string memory name, string memory description, uint256 totalUsers, uint256 totalTransactions)",
                "function createWorld(string memory name, string memory description) external returns (uint256 worldId)",
                "function joinWorld(uint256 worldId) external returns (bool)",
                "function leaveWorld(uint256 worldId) external returns (bool)",
                "event WorldCreated(uint256 indexed worldId, string name, address indexed creator)",
                "event UserJoined(uint256 indexed worldId, address indexed user)",
                "event UserLeft(uint256 indexed worldId, address indexed user)"
            ],
            metaversoToken: [
                "function name() external view returns (string memory)",
                "function symbol() external view returns (string memory)",
                "function decimals() external view returns (uint8)",
                "function totalSupply() external view returns (uint256)",
                "function balanceOf(address account) external view returns (uint256)",
                "function transfer(address to, uint256 amount) external returns (bool)",
                "function approve(address spender, uint256 amount) external returns (bool)",
                "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
                "event Transfer(address indexed from, address indexed to, uint256 value)",
                "event Approval(address indexed owner, address indexed spender, uint256 value)"
            ],
            metaversoNFT: [
                "function name() external view returns (string memory)",
                "function symbol() external view returns (string memory)",
                "function tokenURI(uint256 tokenId) external view returns (string memory)",
                "function ownerOf(uint256 tokenId) external view returns (address)",
                "function mint(address to, string memory tokenURI) external returns (uint256)",
                "function transferFrom(address from, address to, uint256 tokenId) external",
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
                "event Minted(uint256 indexed tokenId, address indexed to, string tokenURI)"
            ],
            metaversoDeFi: [
                "function stake(uint256 amount) external returns (bool)",
                "function unstake(uint256 amount) external returns (bool)",
                "function claimRewards() external returns (uint256)",
                "function getStakedBalance(address user) external view returns (uint256)",
                "function getRewards(address user) external view returns (uint256)",
                "event Staked(address indexed user, uint256 amount)",
                "event Unstaked(address indexed user, uint256 amount)",
                "event RewardsClaimed(address indexed user, uint256 amount)"
            ],
            metaversoGovernance: [
                "function createProposal(string memory description, uint256 votingPeriod) external returns (uint256)",
                "function vote(uint256 proposalId, bool support) external returns (bool)",
                "function executeProposal(uint256 proposalId) external returns (bool)",
                "function getProposal(uint256 proposalId) external view returns (string memory description, uint256 yesVotes, uint256 noVotes, uint256 endTime, bool executed)",
                "event ProposalCreated(uint256 indexed proposalId, string description, address indexed creator)",
                "event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
                "event ProposalExecuted(uint256 indexed proposalId)"
            ]
        };

        return abis[contractName] || [];
    }

    /**
     * Enviar transacción
     */
    async sendTransaction(contractName, method, params = [], options = {}) {
        if (!this.currentWallet) {
            throw new Error('No hay wallet conectado');
        }

        const contract = this.getContract(contractName);
        const methodName = method;
        
        console.log(`📝 Enviando transacción: ${contractName}.${methodName}`);

        try {
            // Preparar transacción
            const txOptions = {
                gasLimit: options.gasLimit || this.config.gasLimit,
                gasPrice: options.gasPrice || this.config.gasPrice,
                ...options
            };

            // Ejecutar método
            const tx = await contract[methodName](...params, txOptions);
            
            // Guardar transacción
            const txHash = tx.hash;
            this.transactions.set(txHash, {
                contract: contractName,
                method: methodName,
                params: params,
                status: 'pending',
                timestamp: Date.now()
            });

            console.log(`⏳ Transacción enviada: ${txHash}`);
            
            // Emitir evento
            this.emit('transactionSent', { 
                hash: txHash,
                contract: contractName,
                method: methodName,
                timestamp: Date.now() 
            });

            // Esperar confirmación
            const receipt = await tx.wait(this.config.confirmations);
            
            // Actualizar estado
            this.transactions.set(txHash, {
                ...this.transactions.get(txHash),
                status: 'confirmed',
                receipt: receipt
            });

            console.log(`✅ Transacción confirmada: ${txHash}`);
            
            // Emitir evento
            this.emit('transactionConfirmed', { 
                hash: txHash,
                receipt: receipt,
                timestamp: Date.now() 
            });

            return { hash: txHash, receipt: receipt };
        } catch (error) {
            console.error(`❌ Error en transacción:`, error);
            this.emit('transactionError', { 
                contract: contractName,
                method: methodName,
                error: error.message,
                timestamp: Date.now() 
            });
            throw error;
        }
    }

    /**
     * Obtener balance de tokens
     */
    async getTokenBalance(tokenContract, address = null) {
        const userAddress = address || await this.currentWallet.getAddress();
        const contract = this.getContract(tokenContract);
        
        try {
            const balance = await contract.balanceOf(userAddress);
            const decimals = await contract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        } catch (error) {
            console.error(`Error obteniendo balance de ${tokenContract}:`, error);
            return '0';
        }
    }

    /**
     * Obtener balance de ETH/MATIC
     */
    async getNativeBalance(address = null) {
        const userAddress = address || await this.currentWallet.getAddress();
        const provider = this.providers.get(this.currentNetwork);
        
        try {
            const balance = await provider.getBalance(userAddress);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Error obteniendo balance nativo:', error);
            return '0';
        }
    }

    /**
     * Obtener información del mundo
     */
    async getWorldInfo() {
        const contract = this.getContract('metaversoCore');
        
        try {
            const info = await contract.getWorldInfo();
            return {
                name: info.name,
                description: info.description,
                totalUsers: info.totalUsers.toString(),
                totalTransactions: info.totalTransactions.toString()
            };
        } catch (error) {
            console.error('Error obteniendo información del mundo:', error);
            return null;
        }
    }

    /**
     * Crear mundo
     */
    async createWorld(name, description) {
        return await this.sendTransaction('metaversoCore', 'createWorld', [name, description]);
    }

    /**
     * Unirse a mundo
     */
    async joinWorld(worldId) {
        return await this.sendTransaction('metaversoCore', 'joinWorld', [worldId]);
    }

    /**
     * Salir de mundo
     */
    async leaveWorld(worldId) {
        return await this.sendTransaction('metaversoCore', 'leaveWorld', [worldId]);
    }

    /**
     * Mintear NFT
     */
    async mintNFT(to, tokenURI) {
        return await this.sendTransaction('metaversoNFT', 'mint', [to, tokenURI]);
    }

    /**
     * Hacer stake
     */
    async stake(amount) {
        return await this.sendTransaction('metaversoDeFi', 'stake', [amount]);
    }

    /**
     * Hacer unstake
     */
    async unstake(amount) {
        return await this.sendTransaction('metaversoDeFi', 'unstake', [amount]);
    }

    /**
     * Reclamar recompensas
     */
    async claimRewards() {
        return await this.sendTransaction('metaversoDeFi', 'claimRewards', []);
    }

    /**
     * Crear propuesta de gobernanza
     */
    async createProposal(description, votingPeriod) {
        return await this.sendTransaction('metaversoGovernance', 'createProposal', [description, votingPeriod]);
    }

    /**
     * Votar en propuesta
     */
    async vote(proposalId, support) {
        return await this.sendTransaction('metaversoGovernance', 'vote', [proposalId, support]);
    }

    /**
     * Health check del servicio
     */
    async healthCheck() {
        try {
            const isConnected = this.isConnected && this.currentNetwork;
            const hasWallet = !!this.currentWallet;
            const networkInfo = this.currentNetwork ? this.networks.get(this.currentNetwork) : null;
            
            return {
                isHealthy: isConnected && hasWallet,
                details: {
                    connected: isConnected,
                    network: this.currentNetwork,
                    networkName: networkInfo?.name,
                    hasWallet: hasWallet,
                    walletAddress: hasWallet ? await this.currentWallet.getAddress() : null
                }
            };
        } catch (error) {
            return {
                isHealthy: false,
                details: {
                    error: error.message
                }
            };
        }
    }

    /**
     * Sistema de eventos
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en evento '${event}':`, error);
                }
            });
        }
    }

    /**
     * Limpiar recursos
     */
    async cleanup() {
        console.log('🧹 Limpiando Blockchain Service...');

        // Limpiar listeners
        this.eventListeners.clear();

        // Limpiar maps
        this.providers.clear();
        this.contracts.clear();
        this.wallets.clear();
        this.networks.clear();
        this.transactions.clear();

        this.isConnected = false;
        this.isInitialized = false;
        this.currentNetwork = null;
        this.currentWallet = null;

        console.log('✅ Blockchain Service limpiado correctamente');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BlockchainService = BlockchainService;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlockchainService;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const service = new BlockchainService();
    service.initialize().then(() => {
        console.log('Blockchain Service iniciado correctamente');
    }).catch(error => {
        console.error('Error iniciando Blockchain Service:', error);
    });
} 