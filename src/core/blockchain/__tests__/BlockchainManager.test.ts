import { BlockchainManager } from '../BlockchainManager';
import { BlockchainConfig } from '../types';

// Mock de servicios
jest.mock('../services/EthereumService');
jest.mock('../services/PolygonService');
jest.mock('../services/NFTService');
jest.mock('../services/DeFiService');
jest.mock('../services/WalletService');

describe('BlockchainManager', () => {
  let blockchainManager: BlockchainManager;
  let mockConfig: BlockchainConfig;

  beforeEach(() => {
    // Configuración mock
    mockConfig = {
      ethereum: {
        rpcUrl: 'https://mainnet.infura.io/v3/test',
        chainId: 1,
        explorerUrl: 'https://etherscan.io',
        gasLimit: 300000,
        gasPrice: '20000000000',
        confirmations: 1
      },
      polygon: {
        rpcUrl: 'https://polygon-rpc.com',
        chainId: 137,
        explorerUrl: 'https://polygonscan.com',
        gasLimit: 300000,
        gasPrice: '30000000000',
        confirmations: 1
      },
      nft: {
        marketplaceAddress: '0x1234567890123456789012345678901234567890',
        collectionAddress: '0x0987654321098765432109876543210987654321',
        royaltyPercentage: 2.5,
        maxSupply: 10000,
        baseURI: 'ipfs://',
        metadataFormat: 'ipfs'
      },
      defi: {
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        slippageTolerance: 0.5,
        deadlineMinutes: 20,
        maxGasPrice: '50000000000'
      },
      wallet: {
        supportedWallets: ['metamask', 'walletconnect'],
        autoConnect: false,
        rememberConnection: true,
        defaultNetwork: 'ethereum',
        rpcUrls: {
          ethereum: 'https://mainnet.infura.io/v3/test',
          polygon: 'https://polygon-rpc.com'
        }
      },
      contracts: {
        metaverseToken: '0x1111111111111111111111111111111111111111',
        nftMarketplace: '0x2222222222222222222222222222222222222222',
        defiProtocol: '0x3333333333333333333333333333333333333333',
        stakingContract: '0x4444444444444444444444444444444444444444',
        governanceContract: '0x5555555555555555555555555555555555555555',
        treasuryContract: '0x6666666666666666666666666666666666666666'
      },
      abis: {
        metaverseToken: [],
        nftMarketplace: [],
        defiProtocol: [],
        stakingContract: [],
        governanceContract: [],
        treasuryContract: []
      },
      gas: {
        defaultGasLimit: 300000,
        maxGasLimit: 500000,
        gasPriceStrategy: 'medium'
      },
      security: {
        requireConfirmation: true,
        maxTransactionValue: '1000000000000000000000',
        blacklistedAddresses: [],
        whitelistedTokens: [],
        rateLimit: {
          maxTransactionsPerMinute: 10,
          maxTransactionsPerHour: 100
        }
      }
    };

    blockchainManager = new BlockchainManager(mockConfig);
  });

  afterEach(() => {
    blockchainManager.dispose();
  });

  describe('Inicialización', () => {
    test('debe inicializar correctamente', async () => {
      await expect(blockchainManager.initialize()).resolves.not.toThrow();
      expect(blockchainManager.isInitialized()).toBe(true);
    });

    test('debe emitir eventos de inicialización', async () => {
      const mockEmit = jest.spyOn(blockchainManager, 'emit');
      
      await blockchainManager.initialize();
      
      expect(mockEmit).toHaveBeenCalledWith('configUpdated', mockConfig);
    });

    test('debe manejar errores de inicialización', async () => {
      // Mock de error en inicialización
      const mockEthereumService = require('../services/EthereumService').EthereumService;
      mockEthereumService.prototype.initialize.mockRejectedValue(new Error('Error de red'));

      await expect(blockchainManager.initialize()).rejects.toThrow('Error de red');
    });
  });

  describe('Gestión de Wallet', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe conectar wallet correctamente', async () => {
      const mockWalletInfo = {
        address: '0x1234567890123456789012345678901234567890',
        network: 'ethereum',
        chainId: 1,
        balance: '1.0',
        isConnected: true,
        provider: 'metamask'
      };

      const mockWalletService = require('../services/WalletService').WalletService;
      mockWalletService.prototype.connect.mockResolvedValue(mockWalletInfo);

      const result = await blockchainManager.connectWallet();
      
      expect(result).toEqual(mockWalletInfo);
    });

    test('debe desconectar wallet correctamente', async () => {
      const mockWalletService = require('../services/WalletService').WalletService;
      mockWalletService.prototype.disconnect.mockResolvedValue(undefined);

      await expect(blockchainManager.disconnectWallet()).resolves.not.toThrow();
    });

    test('debe cambiar red correctamente', async () => {
      const mockWalletService = require('../services/WalletService').WalletService;
      mockWalletService.prototype.switchNetwork.mockResolvedValue(undefined);

      const mockEmit = jest.spyOn(blockchainManager, 'emit');

      await blockchainManager.switchNetwork('polygon');
      
      expect(mockEmit).toHaveBeenCalledWith('networkChanged', 'polygon');
    });
  });

  describe('Gestión de Balance', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe obtener balance nativo correctamente', async () => {
      const mockEthereumService = require('../services/EthereumService').EthereumService;
      mockEthereumService.prototype.getBalance.mockResolvedValue('1.5');

      const balance = await blockchainManager.getBalance();
      
      expect(balance).toBe('1.5');
    });

    test('debe obtener balance de token correctamente', async () => {
      const mockEthereumService = require('../services/EthereumService').EthereumService;
      mockEthereumService.prototype.getTokenBalance.mockResolvedValue('100');

      const balance = await blockchainManager.getBalance('METAVERSE');
      
      expect(balance).toBe('100');
    });

    test('debe manejar error cuando wallet no está conectada', async () => {
      const mockWalletService = require('../services/WalletService').WalletService;
      mockWalletService.prototype.isConnected.mockReturnValue(false);

      await expect(blockchainManager.getBalance()).rejects.toThrow('Wallet no conectada');
    });
  });

  describe('Transacciones', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe enviar transacción nativa correctamente', async () => {
      const mockTransaction = {
        hash: '0x1234567890123456789012345678901234567890',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: '0.1',
        gasLimit: '21000',
        gasPrice: '20000000000',
        nonce: 0,
        data: '0x',
        chainId: 1,
        status: 'pending',
        confirmations: 0
      };

      const mockEthereumService = require('../services/EthereumService').EthereumService;
      mockEthereumService.prototype.sendTransaction.mockResolvedValue(mockTransaction);

      const result = await blockchainManager.sendTransaction('0x2222222222222222222222222222222222222222', '0.1');
      
      expect(result).toEqual(mockTransaction);
    });

    test('debe enviar transacción de token correctamente', async () => {
      const mockTransaction = {
        hash: '0x1234567890123456789012345678901234567890',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x3333333333333333333333333333333333333333',
        value: '0',
        gasLimit: '65000',
        gasPrice: '20000000000',
        nonce: 0,
        data: '0x',
        chainId: 1,
        status: 'pending',
        confirmations: 0
      };

      const mockEthereumService = require('../services/EthereumService').EthereumService;
      mockEthereumService.prototype.sendTokenTransaction.mockResolvedValue(mockTransaction);

      const result = await blockchainManager.sendTransaction('0x2222222222222222222222222222222222222222', '100', 'METAVERSE');
      
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('NFTs', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe mintar NFT correctamente', async () => {
      const mockNFT = {
        id: '0x0987654321098765432109876543210987654321-1',
        name: 'Test NFT',
        description: 'Test Description',
        image: 'ipfs://test',
        tokenId: '1',
        contractAddress: '0x0987654321098765432109876543210987654321',
        owner: '0x1111111111111111111111111111111111111111',
        creator: '0x1111111111111111111111111111111111111111',
        network: 'ethereum',
        metadata: {
          name: 'Test NFT',
          description: 'Test Description',
          image: 'ipfs://test',
          attributes: []
        },
        attributes: [],
        royalties: 2.5,
        isListed: false,
        isStaked: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const mockNFTService = require('../services/NFTService').NFTService;
      mockNFTService.prototype.mintNFT.mockResolvedValue(mockNFT);

      const metadata = {
        name: 'Test NFT',
        description: 'Test Description',
        image: 'ipfs://test',
        attributes: []
      };

      const result = await blockchainManager.mintNFT(metadata);
      
      expect(result).toEqual(mockNFT);
    });

    test('debe transferir NFT correctamente', async () => {
      const mockTransaction = {
        hash: '0x1234567890123456789012345678901234567890',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: '0',
        gasLimit: '65000',
        gasPrice: '20000000000',
        nonce: 0,
        data: '0x',
        chainId: 1,
        status: 'confirmed',
        confirmations: 1
      };

      const mockNFTService = require('../services/NFTService').NFTService;
      mockNFTService.prototype.transferNFT.mockResolvedValue(mockTransaction);

      const result = await blockchainManager.transferNFT('test-nft-id', '0x2222222222222222222222222222222222222222');
      
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('DeFi', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe hacer swap de tokens correctamente', async () => {
      const mockTransaction = {
        hash: '0x1234567890123456789012345678901234567890',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x3333333333333333333333333333333333333333',
        value: '0',
        gasLimit: '150000',
        gasPrice: '20000000000',
        nonce: 0,
        data: '0x',
        chainId: 1,
        status: 'pending',
        confirmations: 0
      };

      const mockDeFiService = require('../services/DeFiService').DeFiService;
      mockDeFiService.prototype.swapTokens.mockResolvedValue(mockTransaction);

      const result = await blockchainManager.swapTokens('ETH', 'METAVERSE', '0.1');
      
      expect(result).toEqual(mockTransaction);
    });

    test('debe agregar liquidez correctamente', async () => {
      const mockTransaction = {
        hash: '0x1234567890123456789012345678901234567890',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x3333333333333333333333333333333333333333',
        value: '0',
        gasLimit: '200000',
        gasPrice: '20000000000',
        nonce: 0,
        data: '0x',
        chainId: 1,
        status: 'pending',
        confirmations: 0
      };

      const mockDeFiService = require('../services/DeFiService').DeFiService;
      mockDeFiService.prototype.addLiquidity.mockResolvedValue(mockTransaction);

      const result = await blockchainManager.addLiquidity('ETH', 'METAVERSE', '0.1', '100');
      
      expect(result).toEqual(mockTransaction);
    });

    test('debe stakear tokens correctamente', async () => {
      const mockTransaction = {
        hash: '0x1234567890123456789012345678901234567890',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x4444444444444444444444444444444444444444',
        value: '0',
        gasLimit: '100000',
        gasPrice: '20000000000',
        nonce: 0,
        data: '0x',
        chainId: 1,
        status: 'pending',
        confirmations: 0
      };

      const mockDeFiService = require('../services/DeFiService').DeFiService;
      mockDeFiService.prototype.stakeTokens.mockResolvedValue(mockTransaction);

      const result = await blockchainManager.stakeTokens('METAVERSE', '100', 30);
      
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('Consultas', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe obtener tokens soportados', () => {
      const tokens = blockchainManager.getSupportedTokens();
      expect(tokens).toHaveLength(3); // ETH, MATIC, METAVERSE
      expect(tokens[0].symbol).toBe('ETH');
    });

    test('debe obtener NFTs del usuario', () => {
      const nfts = blockchainManager.getUserNFTs();
      expect(Array.isArray(nfts)).toBe(true);
    });

    test('debe obtener historial de transacciones', () => {
      const transactions = blockchainManager.getTransactionHistory();
      expect(Array.isArray(transactions)).toBe(true);
    });

    test('debe obtener contratos desplegados', () => {
      const contracts = blockchainManager.getDeployedContracts();
      expect(contracts).toHaveLength(3); // MetaverseToken, NFTMarketplace, DeFiProtocol
    });

    test('debe obtener red actual', () => {
      const network = blockchainManager.getCurrentNetwork();
      expect(network).toBe('ethereum');
    });

    test('debe verificar conexión de wallet', () => {
      const mockWalletService = require('../services/WalletService').WalletService;
      mockWalletService.prototype.isConnected.mockReturnValue(true);

      const isConnected = blockchainManager.isWalletConnected();
      expect(isConnected).toBe(true);
    });

    test('debe obtener dirección actual', () => {
      const mockWalletService = require('../services/WalletService').WalletService;
      mockWalletService.prototype.getCurrentAddress.mockReturnValue('0x1234567890123456789012345678901234567890');

      const address = blockchainManager.getCurrentAddress();
      expect(address).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('Utilidades', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe estimar gas correctamente', async () => {
      const mockGasEstimate = {
        gasLimit: '21000',
        gasPrice: '20000000000',
        totalCost: '0.00042'
      };

      const mockEthereumService = require('../services/EthereumService').EthereumService;
      mockEthereumService.prototype.estimateGas.mockResolvedValue(mockGasEstimate);

      const result = await blockchainManager.estimateGas('0x2222222222222222222222222222222222222222', '0.1');
      
      expect(result).toEqual(mockGasEstimate);
    });

    test('debe obtener precio de token correctamente', async () => {
      const mockDeFiService = require('../services/DeFiService').DeFiService;
      mockDeFiService.prototype.getTokenPrice.mockResolvedValue('1.5');

      const price = await blockchainManager.getTokenPrice('METAVERSE');
      
      expect(price).toBe('1.5');
    });

    test('debe obtener información de pool de liquidez', async () => {
      const mockPoolInfo = {
        address: '0x1234567890123456789012345678901234567890',
        tokenA: 'ETH',
        tokenB: 'METAVERSE',
        reserveA: '100',
        reserveB: '1000',
        totalSupply: '1000',
        fee: 0.3,
        apr: '15.5',
        volume24h: '50000',
        tvl: '100000'
      };

      const mockDeFiService = require('../services/DeFiService').DeFiService;
      mockDeFiService.prototype.getLiquidityPoolInfo.mockResolvedValue(mockPoolInfo);

      const result = await blockchainManager.getLiquidityPoolInfo('ETH', 'METAVERSE');
      
      expect(result).toEqual(mockPoolInfo);
    });
  });

  describe('Configuración', () => {
    test('debe actualizar configuración correctamente', () => {
      const mockEmit = jest.spyOn(blockchainManager, 'emit');
      
      const newConfig = {
        gas: {
          defaultGasLimit: 400000,
          maxGasLimit: 600000,
          gasPriceStrategy: 'high' as const
        }
      };

      blockchainManager.updateConfig(newConfig);
      
      expect(mockEmit).toHaveBeenCalledWith('configUpdated', expect.objectContaining(newConfig));
    });

    test('debe obtener configuración actual', () => {
      const config = blockchainManager.getConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe('Limpieza', () => {
    test('debe limpiar recursos correctamente', () => {
      blockchainManager.dispose();
      
      expect(blockchainManager.isInitialized()).toBe(false);
    });
  });
}); 