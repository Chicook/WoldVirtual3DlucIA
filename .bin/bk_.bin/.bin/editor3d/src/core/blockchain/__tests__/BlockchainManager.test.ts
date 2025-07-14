import { BlockchainManager } from '../BlockchainManager';
import { BlockchainConfig, Transaction, NFT } from '../types';

describe('BlockchainManager', () => {
  let blockchainManager: BlockchainManager;
  let mockConfig: BlockchainConfig;

  beforeEach(() => {
    mockConfig = {
      ethereum: {
        rpcUrl: 'https://mainnet.infura.io/v3/test',
        chainId: 1,
        networkName: 'Ethereum Mainnet',
        blockExplorer: 'https://etherscan.io',
        gasLimit: 21000,
        gasPrice: '20000000000',
        confirmations: 12
      },
      nft: {
        marketplaceAddress: '0x1234567890123456789012345678901234567890',
        royaltyPercentage: 2.5,
        maxSupply: 10000,
        mintPrice: '0.01',
        metadataBaseURI: 'ipfs://'
      },
      defi: {
        protocols: [],
        liquidityPools: [],
        yieldFarming: {
          farms: [],
          rewards: [],
          lockPeriod: 30,
          minStake: '100'
        },
        staking: {
          minStake: '100',
          lockPeriod: 30,
          earlyWithdrawalFee: 5,
          rewards: []
        }
      },
      governance: {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        timelockAddress: '0x1234567890123456789012345678901234567890',
        governorAddress: '0x1234567890123456789012345678901234567890',
        proposalThreshold: '1000',
        votingPeriod: 45818,
        quorumVotes: '4000',
        executionDelay: 172800
      },
      bridges: {
        bridges: [],
        supportedChains: [],
        fees: []
      }
    };

    blockchainManager = new BlockchainManager(mockConfig);
  });

  describe('Inicialización', () => {
    test('debe inicializar correctamente', async () => {
      const initSpy = jest.spyOn(blockchainManager, 'emit');
      
      await blockchainManager.initialize();
      
      expect(initSpy).toHaveBeenCalledWith('initialized');
      expect(blockchainManager.isReady()).toBe(false); // No wallet conectado
    });

    test('debe emitir evento de inicialización', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('initialized', eventSpy);
      
      await blockchainManager.initialize();
      
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Conexión de Wallet', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe conectar wallet correctamente', async () => {
      const walletInfo = await blockchainManager.connectWallet();
      
      expect(walletInfo).toBeDefined();
      expect(walletInfo.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(walletInfo.isConnected).toBe(true);
      expect(walletInfo.network).toBe('Ethereum Mainnet');
    });

    test('debe emitir evento de wallet conectado', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('walletConnected', eventSpy);
      
      await blockchainManager.connectWallet();
      
      expect(eventSpy).toHaveBeenCalled();
    });

    test('debe obtener información del wallet', async () => {
      await blockchainManager.connectWallet();
      const walletInfo = blockchainManager.getWalletInfo();
      
      expect(walletInfo).toBeDefined();
      expect(walletInfo?.isConnected).toBe(true);
    });
  });

  describe('Transacciones', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
      await blockchainManager.connectWallet();
    });

    test('debe enviar transacción correctamente', async () => {
      const transaction: Transaction = {
        id: 'tx_1',
        hash: '',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: '0.1',
        gas: '21000',
        gasPrice: '20000000000',
        nonce: 0,
        timestamp: Date.now(),
        status: 'pending'
      };

      const txHash = await blockchainManager.sendTransaction(transaction);
      
      expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('debe emitir evento de transacción enviada', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('transactionSent', eventSpy);
      
      const transaction: Transaction = {
        id: 'tx_1',
        hash: '',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: '0.1',
        gas: '21000',
        gasPrice: '20000000000',
        nonce: 0,
        timestamp: Date.now(),
        status: 'pending'
      };

      await blockchainManager.sendTransaction(transaction);
      
      expect(eventSpy).toHaveBeenCalled();
    });

    test('debe obtener balance de token', async () => {
      const balance = await blockchainManager.getTokenBalance('0x1234567890123456789012345678901234567890');
      
      expect(balance).toBeDefined();
      expect(typeof balance).toBe('string');
    });
  });

  describe('NFTs', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
      await blockchainManager.connectWallet();
    });

    test('debe crear NFT correctamente', async () => {
      const metadata = {
        name: 'Test NFT',
        description: 'NFT de prueba',
        image: 'https://example.com/image.png',
        attributes: [
          { trait_type: 'Rareza', value: 'Común' },
          { trait_type: 'Poder', value: 50 }
        ]
      };

      const nft = await blockchainManager.createNFT(metadata, 'ipfs://test');
      
      expect(nft).toBeDefined();
      expect(nft.name).toBe('Test NFT');
      expect(nft.creator).toBeDefined();
      expect(nft.mintDate).toBeDefined();
    });

    test('debe emitir evento de NFT creado', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('nftCreated', eventSpy);
      
      const metadata = {
        name: 'Test NFT',
        description: 'NFT de prueba',
        image: 'https://example.com/image.png'
      };

      await blockchainManager.createNFT(metadata, 'ipfs://test');
      
      expect(eventSpy).toHaveBeenCalled();
    });

    test('debe transferir NFT correctamente', async () => {
      // Primero crear un NFT
      const metadata = {
        name: 'Test NFT',
        description: 'NFT de prueba',
        image: 'https://example.com/image.png'
      };
      const nft = await blockchainManager.createNFT(metadata, 'ipfs://test');
      
      // Luego transferirlo
      const toAddress = '0x0987654321098765432109876543210987654321';
      const txHash = await blockchainManager.transferNFT(nft.id, toAddress);
      
      expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('debe obtener NFTs del usuario', async () => {
      // Crear algunos NFTs
      const metadata = {
        name: 'Test NFT',
        description: 'NFT de prueba',
        image: 'https://example.com/image.png'
      };
      
      await blockchainManager.createNFT(metadata, 'ipfs://test1');
      await blockchainManager.createNFT(metadata, 'ipfs://test2');
      
      const userNFTs = await blockchainManager.getUserNFTs();
      
      expect(userNFTs).toBeDefined();
      expect(Array.isArray(userNFTs)).toBe(true);
    });
  });

  describe('Smart Contracts', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
      await blockchainManager.connectWallet();
    });

    test('debe interactuar con contrato correctamente', async () => {
      const result = await blockchainManager.interactWithContract(
        '0x1234567890123456789012345678901234567890',
        'mint',
        ['100']
      );
      
      expect(result).toBeDefined();
    });

    test('debe emitir evento de interacción con contrato', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('contractInteraction', eventSpy);
      
      await blockchainManager.interactWithContract(
        '0x1234567890123456789012345678901234567890',
        'transfer',
        ['0x0987654321098765432109876543210987654321', '100']
      );
      
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('DeFi', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
      await blockchainManager.connectWallet();
    });

    test('debe participar en protocolo DeFi', async () => {
      const protocol = {
        name: 'Uniswap',
        address: '0x1234567890123456789012345678901234567890',
        type: 'dex' as const,
        risk: 'low' as const
      };

      const txHash = await blockchainManager.participateInDeFi(protocol, 'addLiquidity', '100');
      
      expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('debe emitir evento de participación DeFi', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('defiParticipation', eventSpy);
      
      const protocol = {
        name: 'Aave',
        address: '0x1234567890123456789012345678901234567890',
        type: 'lending' as const,
        risk: 'medium' as const
      };

      await blockchainManager.participateInDeFi(protocol, 'deposit', '100');
      
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Gobernanza', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
      await blockchainManager.connectWallet();
    });

    test('debe votar en propuesta correctamente', async () => {
      const txHash = await blockchainManager.voteOnProposal('1', true);
      
      expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('debe emitir evento de voto', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('governanceVote', eventSpy);
      
      await blockchainManager.voteOnProposal('1', false);
      
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Cross-Chain Bridge', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
      await blockchainManager.connectWallet();
    });

    test('debe realizar bridge correctamente', async () => {
      const bridge = {
        name: 'Polygon Bridge',
        address: '0x1234567890123456789012345678901234567890',
        supportedTokens: ['0x1234567890123456789012345678901234567890'],
        minAmount: '1',
        maxAmount: '1000000',
        fee: 0.1,
        estimatedTime: 300,
        security: 'high' as const
      };

      const txHash = await blockchainManager.bridgeTokens(
        bridge,
        '0x1234567890123456789012345678901234567890',
        '100',
        'polygon'
      );
      
      expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('debe emitir evento de bridge', async () => {
      const eventSpy = jest.fn();
      blockchainManager.on('crossChainBridge', eventSpy);
      
      const bridge = {
        name: 'BSC Bridge',
        address: '0x1234567890123456789012345678901234567890',
        supportedTokens: ['0x1234567890123456789012345678901234567890'],
        minAmount: '1',
        maxAmount: '1000000',
        fee: 0.05,
        estimatedTime: 600,
        security: 'medium' as const
      };

      await blockchainManager.bridgeTokens(bridge, '0x1234567890123456789012345678901234567890', '50', 'bsc');
      
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Utilidades', () => {
    beforeEach(async () => {
      await blockchainManager.initialize();
    });

    test('debe obtener historial de transacciones', async () => {
      await blockchainManager.connectWallet();
      const history = await blockchainManager.getTransactionHistory(10);
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);
    });

    test('debe obtener precio de token', async () => {
      const price = await blockchainManager.getTokenPrice('0x1234567890123456789012345678901234567890');
      
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
    });

    test('debe obtener estadísticas del metaverso', async () => {
      const stats = await blockchainManager.getMetaverseStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalUsers).toBeDefined();
      expect(stats.totalTransactions).toBeDefined();
      expect(stats.totalNFTs).toBeDefined();
      expect(stats.totalValue).toBeDefined();
      expect(stats.activeContracts).toBeDefined();
    });

    test('debe desconectar wallet', () => {
      blockchainManager.disconnectWallet();
      
      expect(blockchainManager.getWalletInfo()).toBeNull();
    });

    test('debe verificar si está listo', async () => {
      expect(blockchainManager.isReady()).toBe(false); // No inicializado ni wallet conectado
      
      await blockchainManager.initialize();
      expect(blockchainManager.isReady()).toBe(false); // Inicializado pero sin wallet
      
      await blockchainManager.connectWallet();
      expect(blockchainManager.isReady()).toBe(true); // Inicializado y wallet conectado
    });

    test('debe obtener y actualizar configuración', () => {
      const config = blockchainManager.getConfig();
      expect(config).toEqual(mockConfig);
      
      const newConfig = { ethereum: { ...config.ethereum, gasLimit: 50000 } };
      blockchainManager.updateConfig(newConfig);
      
      const updatedConfig = blockchainManager.getConfig();
      expect(updatedConfig.ethereum.gasLimit).toBe(50000);
    });
  });

  describe('Manejo de errores', () => {
    test('debe fallar si no está inicializado', async () => {
      await expect(blockchainManager.connectWallet()).rejects.toThrow('BlockchainManager no está inicializado');
      await expect(blockchainManager.sendTransaction({} as Transaction)).rejects.toThrow('BlockchainManager no está inicializado');
    });

    test('debe fallar si wallet no está conectado', async () => {
      await blockchainManager.initialize();
      
      await expect(blockchainManager.sendTransaction({} as Transaction)).rejects.toThrow('Wallet no conectado');
      await expect(blockchainManager.getTokenBalance('0x123')).rejects.toThrow('Wallet no conectado');
    });
  });
}); 