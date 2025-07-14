import { BlockchainConfig, Transaction, Token, NFT, SmartContract, WalletInfo } from './types';
import { EthereumService } from './services/EthereumService';
import { PolygonService } from './services/PolygonService';
import { NFTService } from './services/NFTService';
import { DeFiService } from './services/DeFiService';
import { WalletService } from './services/WalletService';
import { EventEmitter } from 'events';

export class BlockchainManager extends EventEmitter {
  private config: BlockchainConfig;
  private ethereumService: EthereumService;
  private polygonService: PolygonService;
  private nftService: NFTService;
  private defiService: DeFiService;
  private walletService: WalletService;
  private isInitialized: boolean = false;
  private currentNetwork: string = 'ethereum';
  private transactions: Map<string, Transaction> = new Map();
  private tokens: Map<string, Token> = new Map();
  private nfts: Map<string, NFT> = new Map();
  private contracts: Map<string, SmartContract> = new Map();

  constructor(config: BlockchainConfig) {
    super();
    this.config = config;
    this.ethereumService = new EthereumService(config.ethereum);
    this.polygonService = new PolygonService(config.polygon);
    this.nftService = new NFTService(config.nft);
    this.defiService = new DeFiService(config.defi);
    this.walletService = new WalletService(config.wallet);
  }

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando BlockchainManager...');

      // Inicializar servicios
      await Promise.all([
        this.ethereumService.initialize(),
        this.polygonService.initialize(),
        this.nftService.initialize(),
        this.defiService.initialize(),
        this.walletService.initialize()
      ]);

      // Configurar event listeners
      this.setupEventListeners();

      // Cargar estado inicial
      await this.loadInitialState();

      this.isInitialized = true;
      console.log('BlockchainManager inicializado correctamente');

    } catch (error) {
      console.error('Error al inicializar BlockchainManager:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Eventos de wallet
    this.walletService.on('walletConnected', (walletInfo: WalletInfo) => {
      this.emit('walletConnected', walletInfo);
    });

    this.walletService.on('walletDisconnected', () => {
      this.emit('walletDisconnected');
    });

    // Eventos de transacciones
    this.ethereumService.on('transactionPending', (tx: Transaction) => {
      this.transactions.set(tx.hash, tx);
      this.emit('transactionPending', tx);
    });

    this.ethereumService.on('transactionConfirmed', (tx: Transaction) => {
      this.transactions.set(tx.hash, tx);
      this.emit('transactionConfirmed', tx);
    });

    this.ethereumService.on('transactionFailed', (tx: Transaction) => {
      this.transactions.set(tx.hash, tx);
      this.emit('transactionFailed', tx);
    });

    // Eventos de NFT
    this.nftService.on('nftMinted', (nft: NFT) => {
      this.nfts.set(nft.id, nft);
      this.emit('nftMinted', nft);
    });

    this.nftService.on('nftTransferred', (nft: NFT) => {
      this.nfts.set(nft.id, nft);
      this.emit('nftTransferred', nft);
    });

    // Eventos de DeFi
    this.defiService.on('tokenSwapped', (swap: any) => {
      this.emit('tokenSwapped', swap);
    });

    this.defiService.on('liquidityAdded', (liquidity: any) => {
      this.emit('liquidityAdded', liquidity);
    });
  }

  private async loadInitialState(): Promise<void> {
    try {
      // Cargar tokens soportados
      await this.loadSupportedTokens();

      // Cargar contratos desplegados
      await this.loadDeployedContracts();

      // Cargar NFTs del usuario si hay wallet conectada
      if (this.walletService.isConnected()) {
        await this.loadUserNFTs();
      }

    } catch (error) {
      console.error('Error al cargar estado inicial:', error);
    }
  }

  private async loadSupportedTokens(): Promise<void> {
    const supportedTokens = [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        network: 'ethereum',
        logo: '/assets/tokens/eth.png'
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        network: 'polygon',
        logo: '/assets/tokens/matic.png'
      },
      {
        symbol: 'METAVERSE',
        name: 'Metaverse Token',
        address: this.config.contracts.metaverseToken,
        decimals: 18,
        network: 'ethereum',
        logo: '/assets/tokens/metaverse.png'
      }
    ];

    supportedTokens.forEach(token => {
      this.tokens.set(token.symbol, token as Token);
    });
  }

  private async loadDeployedContracts(): Promise<void> {
    const contracts = [
      {
        name: 'MetaverseToken',
        address: this.config.contracts.metaverseToken,
        abi: this.config.abis.metaverseToken,
        network: 'ethereum'
      },
      {
        name: 'NFTMarketplace',
        address: this.config.contracts.nftMarketplace,
        abi: this.config.abis.nftMarketplace,
        network: 'ethereum'
      },
      {
        name: 'DeFiProtocol',
        address: this.config.contracts.defiProtocol,
        abi: this.config.abis.defiProtocol,
        network: 'ethereum'
      }
    ];

    contracts.forEach(contract => {
      this.contracts.set(contract.name, contract as SmartContract);
    });
  }

  private async loadUserNFTs(): Promise<void> {
    try {
      const address = this.walletService.getCurrentAddress();
      if (!address) return;

      const nfts = await this.nftService.getUserNFTs(address);
      nfts.forEach(nft => {
        this.nfts.set(nft.id, nft);
      });

    } catch (error) {
      console.error('Error al cargar NFTs del usuario:', error);
    }
  }

  // Métodos públicos principales

  async connectWallet(): Promise<WalletInfo> {
    try {
      const walletInfo = await this.walletService.connect();
      await this.loadUserNFTs();
      return walletInfo;
    } catch (error) {
      console.error('Error al conectar wallet:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await this.walletService.disconnect();
    } catch (error) {
      console.error('Error al desconectar wallet:', error);
      throw error;
    }
  }

  async switchNetwork(network: string): Promise<void> {
    try {
      await this.walletService.switchNetwork(network);
      this.currentNetwork = network;
      this.emit('networkChanged', network);
    } catch (error) {
      console.error('Error al cambiar red:', error);
      throw error;
    }
  }

  async getBalance(tokenSymbol?: string): Promise<string> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      const address = this.walletService.getCurrentAddress();
      if (!address) {
        throw new Error('Dirección de wallet no disponible');
      }

      if (tokenSymbol) {
        const token = this.tokens.get(tokenSymbol);
        if (!token) {
          throw new Error(`Token ${tokenSymbol} no soportado`);
        }

        return await this.getTokenBalance(address, token);
      } else {
        return await this.getNativeBalance(address);
      }

    } catch (error) {
      console.error('Error al obtener balance:', error);
      throw error;
    }
  }

  private async getNativeBalance(address: string): Promise<string> {
    if (this.currentNetwork === 'ethereum') {
      return await this.ethereumService.getBalance(address);
    } else if (this.currentNetwork === 'polygon') {
      return await this.polygonService.getBalance(address);
    }
    throw new Error(`Red ${this.currentNetwork} no soportada`);
  }

  private async getTokenBalance(address: string, token: Token): Promise<string> {
    if (token.network === 'ethereum') {
      return await this.ethereumService.getTokenBalance(address, token.address);
    } else if (token.network === 'polygon') {
      return await this.polygonService.getTokenBalance(address, token.address);
    }
    throw new Error(`Red ${token.network} no soportada`);
  }

  async sendTransaction(to: string, amount: string, tokenSymbol?: string): Promise<Transaction> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      let transaction: Transaction;

      if (tokenSymbol) {
        const token = this.tokens.get(tokenSymbol);
        if (!token) {
          throw new Error(`Token ${tokenSymbol} no soportado`);
        }
        transaction = await this.sendTokenTransaction(to, amount, token);
      } else {
        transaction = await this.sendNativeTransaction(to, amount);
      }

      this.transactions.set(transaction.hash, transaction);
      return transaction;

    } catch (error) {
      console.error('Error al enviar transacción:', error);
      throw error;
    }
  }

  private async sendNativeTransaction(to: string, amount: string): Promise<Transaction> {
    if (this.currentNetwork === 'ethereum') {
      return await this.ethereumService.sendTransaction(to, amount);
    } else if (this.currentNetwork === 'polygon') {
      return await this.polygonService.sendTransaction(to, amount);
    }
    throw new Error(`Red ${this.currentNetwork} no soportada`);
  }

  private async sendTokenTransaction(to: string, amount: string, token: Token): Promise<Transaction> {
    if (token.network === 'ethereum') {
      return await this.ethereumService.sendTokenTransaction(to, amount, token.address);
    } else if (token.network === 'polygon') {
      return await this.polygonService.sendTokenTransaction(to, amount, token.address);
    }
    throw new Error(`Red ${token.network} no soportada`);
  }

  async mintNFT(metadata: {
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  }): Promise<NFT> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      const nft = await this.nftService.mintNFT(metadata);
      this.nfts.set(nft.id, nft);
      return nft;

    } catch (error) {
      console.error('Error al mintar NFT:', error);
      throw error;
    }
  }

  async transferNFT(nftId: string, to: string): Promise<Transaction> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      const transaction = await this.nftService.transferNFT(nftId, to);
      this.transactions.set(transaction.hash, transaction);
      return transaction;

    } catch (error) {
      console.error('Error al transferir NFT:', error);
      throw error;
    }
  }

  async swapTokens(
    fromToken: string,
    toToken: string,
    amount: string,
    slippage: number = 0.5
  ): Promise<Transaction> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      const transaction = await this.defiService.swapTokens(fromToken, toToken, amount, slippage);
      this.transactions.set(transaction.hash, transaction);
      return transaction;

    } catch (error) {
      console.error('Error al hacer swap:', error);
      throw error;
    }
  }

  async addLiquidity(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<Transaction> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      const transaction = await this.defiService.addLiquidity(tokenA, tokenB, amountA, amountB);
      this.transactions.set(transaction.hash, transaction);
      return transaction;

    } catch (error) {
      console.error('Error al agregar liquidez:', error);
      throw error;
    }
  }

  async stakeTokens(tokenSymbol: string, amount: string, duration: number): Promise<Transaction> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('Wallet no conectada');
      }

      const token = this.tokens.get(tokenSymbol);
      if (!token) {
        throw new Error(`Token ${tokenSymbol} no soportado`);
      }

      const transaction = await this.defiService.stakeTokens(token.address, amount, duration);
      this.transactions.set(transaction.hash, transaction);
      return transaction;

    } catch (error) {
      console.error('Error al stakear tokens:', error);
      throw error;
    }
  }

  // Métodos de consulta

  getSupportedTokens(): Token[] {
    return Array.from(this.tokens.values());
  }

  getUserNFTs(): NFT[] {
    return Array.from(this.nfts.values());
  }

  getTransactionHistory(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  getDeployedContracts(): SmartContract[] {
    return Array.from(this.contracts.values());
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  isWalletConnected(): boolean {
    return this.walletService.isConnected();
  }

  getCurrentAddress(): string | null {
    return this.walletService.getCurrentAddress();
  }

  // Métodos de utilidad

  async estimateGas(to: string, amount: string, tokenSymbol?: string): Promise<string> {
    try {
      if (tokenSymbol) {
        const token = this.tokens.get(tokenSymbol);
        if (!token) {
          throw new Error(`Token ${tokenSymbol} no soportado`);
        }
        return await this.ethereumService.estimateTokenGas(to, amount, token.address);
      } else {
        return await this.ethereumService.estimateGas(to, amount);
      }
    } catch (error) {
      console.error('Error al estimar gas:', error);
      throw error;
    }
  }

  async getTokenPrice(tokenSymbol: string): Promise<string> {
    try {
      return await this.defiService.getTokenPrice(tokenSymbol);
    } catch (error) {
      console.error('Error al obtener precio del token:', error);
      throw error;
    }
  }

  async getLiquidityPoolInfo(tokenA: string, tokenB: string): Promise<any> {
    try {
      return await this.defiService.getLiquidityPoolInfo(tokenA, tokenB);
    } catch (error) {
      console.error('Error al obtener información del pool:', error);
      throw error;
    }
  }

  // Métodos de configuración

  updateConfig(newConfig: Partial<BlockchainConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  getConfig(): BlockchainConfig {
    return this.config;
  }

  // Métodos de limpieza

  dispose(): void {
    this.removeAllListeners();
    this.ethereumService.dispose();
    this.polygonService.dispose();
    this.nftService.dispose();
    this.defiService.dispose();
    this.walletService.dispose();
    
    this.transactions.clear();
    this.tokens.clear();
    this.nfts.clear();
    this.contracts.clear();
    
    this.isInitialized = false;
    console.log('BlockchainManager disposed');
  }
} 