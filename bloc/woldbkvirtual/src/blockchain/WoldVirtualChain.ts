/**
 * @fileoverview Blockchain personalizada de WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/WoldVirtualChain
 */

import { ethers } from 'ethers';
import { Block, Transaction, Wallet, BlockHeader } from './types';
import { ConsensusEngine } from './consensus/ConsensusEngine';
import { StateManager } from './state/StateManager';
import { NetworkManager } from './network/NetworkManager';
import { AssetRegistry } from './contracts/AssetRegistry';
import { UserRegistry } from './contracts/UserRegistry';
import { MetaverseRegistry } from './contracts/MetaverseRegistry';
import { WCVToken } from './contracts/WCVToken';
import { Bridge } from './contracts/Bridge';
import { BSCIntegration } from './services/BSCIntegration';
import { Logger } from '../utils/logger';

const logger = new Logger('WoldVirtualChain');

export interface ChainConfig {
  name: string;
  symbol: string;
  chainId: number;
  blockTime: number;
  maxBlockSize: number;
  maxGasLimit: number;
  consensus: 'pos' | 'dpos' | 'pbft';
  validators: string[];
  genesisBlock: Block;
  networkPort: number;
  rpcPort: number;
  wsPort: number;
}

export interface ChainStats {
  currentBlock: number;
  totalTransactions: number;
  totalAssets: number;
  totalUsers: number;
  totalMetaverses: number;
  networkHashrate: string;
  difficulty: string;
  gasPrice: string;
  validators: string[];
  peers: number;
}

export class WoldVirtualChain {
  private config: ChainConfig;
  private consensus: ConsensusEngine;
  private stateManager: StateManager;
  private networkManager: NetworkManager;
  private assetRegistry: AssetRegistry;
  private userRegistry: UserRegistry;
  private metaverseRegistry: MetaverseRegistry;
  private wcvToken: WCVToken;
  private bridge: Bridge;
  private bscIntegration: BSCIntegration;
  
  private isRunning: boolean = false;
  private currentBlock: Block;
  private pendingTransactions: Transaction[] = [];
  private wallets: Map<string, Wallet> = new Map();
  private peers: Set<string> = new Set();

  constructor(config: ChainConfig) {
    this.config = config;
    this.currentBlock = config.genesisBlock;
    
    // Inicializar componentes
    this.consensus = new ConsensusEngine(config.consensus, config.validators);
    this.stateManager = new StateManager();
    this.networkManager = new NetworkManager(config.networkPort, config.wsPort);
    this.assetRegistry = new AssetRegistry(this.stateManager);
    this.userRegistry = new UserRegistry(this.stateManager);
    this.metaverseRegistry = new MetaverseRegistry(this.stateManager);
    this.wcvToken = new WCVToken(this.stateManager);
    this.bridge = new Bridge(this.stateManager, this.wcvToken);
    this.bscIntegration = new BSCIntegration(this.bridge);
    
    logger.info(`Blockchain ${config.name} inicializada con ChainID: ${config.chainId}`);
  }

  /**
   * Iniciar la blockchain
   */
  async start(): Promise<void> {
    try {
      logger.info('🚀 Iniciando blockchain WoldVirtual3D...');
      
      // Inicializar estado
      await this.stateManager.initialize(this.config.genesisBlock);
      
      // Inicializar token WCV
      await this.wcvToken.initialize();
      
      // Inicializar puente
      await this.bridge.initialize();
      
      // Conectar a BSC
      await this.bscIntegration.connect();
      
      // Iniciar consenso
      await this.consensus.start();
      
      // Iniciar red
      await this.networkManager.start();
      
      // Iniciar registros
      await this.assetRegistry.initialize();
      await this.userRegistry.initialize();
      await this.metaverseRegistry.initialize();
      
      this.isRunning = true;
      
      // Iniciar minería de bloques
      this.startMining();
      
      // Iniciar procesamiento de transacciones BSC
      this.startBSCProcessing();
      
      logger.info('✅ Blockchain iniciada exitosamente');
      
    } catch (error: any) {
      logger.error('❌ Error iniciando blockchain:', error);
      throw error;
    }
  }

  /**
   * Detener la blockchain
   */
  async stop(): Promise<void> {
    try {
      logger.info('🛑 Deteniendo blockchain...');
      
      this.isRunning = false;
      
      await this.consensus.stop();
      await this.networkManager.stop();
      await this.stateManager.shutdown();
      
      logger.info('✅ Blockchain detenida');
      
    } catch (error: any) {
      logger.error('❌ Error deteniendo blockchain:', error);
      throw error;
    }
  }

  /**
   * Crear nueva wallet
   */
  createWallet(): Wallet {
    const wallet = ethers.Wallet.createRandom();
    this.wallets.set(wallet.address, wallet);
    
    logger.info(`Nueva wallet creada: ${wallet.address}`);
    return wallet;
  }

  /**
   * Importar wallet desde clave privada
   */
  importWallet(privateKey: string): Wallet {
    try {
      const wallet = new ethers.Wallet(privateKey);
      this.wallets.set(wallet.address, wallet);
      
      logger.info(`Wallet importada: ${wallet.address}`);
      return wallet;
    } catch (error: any) {
      logger.error('Error importando wallet:', error);
      throw new Error('Clave privada inválida');
    }
  }

  /**
   * Enviar transacción
   */
  async sendTransaction(transaction: Omit<Transaction, 'hash' | 'nonce' | 'timestamp'>): Promise<string> {
    try {
      const wallet = this.wallets.get(transaction.from);
      if (!wallet) {
        throw new Error('Wallet no encontrada');
      }

      // Obtener nonce
      const nonce = await this.stateManager.getNonce(transaction.from);
      
      // Crear transacción completa
      const fullTransaction: Transaction = {
        ...transaction,
        nonce,
        timestamp: Date.now(),
        hash: ''
      };

      // Firmar transacción
      const txHash = await this.signTransaction(fullTransaction, wallet);
      fullTransaction.hash = txHash;

      // Agregar a transacciones pendientes
      this.pendingTransactions.push(fullTransaction);
      
      logger.info(`Transacción enviada: ${txHash}`);
      return txHash;
      
    } catch (error: any) {
      logger.error('Error enviando transacción:', error);
      throw error;
    }
  }

  /**
   * Firmar transacción
   */
  private async signTransaction(transaction: Transaction, wallet: Wallet): Promise<string> {
    const txData = {
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      nonce: transaction.nonce,
      gasLimit: transaction.gasLimit,
      gasPrice: transaction.gasPrice,
      chainId: this.config.chainId
    };

    const signature = await wallet.signTransaction(txData);
    return ethers.utils.keccak256(signature);
  }

  /**
   * Obtener balance de una dirección
   */
  async getBalance(address: string): Promise<string> {
    return await this.stateManager.getBalance(address);
  }

  /**
   * Obtener información de un bloque
   */
  async getBlock(blockNumber: number): Promise<Block | null> {
    return await this.stateManager.getBlock(blockNumber);
  }

  /**
   * Obtener transacción por hash
   */
  async getTransaction(hash: string): Promise<Transaction | null> {
    return await this.stateManager.getTransaction(hash);
  }

  /**
   * Obtener estadísticas de la cadena
   */
  async getStats(): Promise<ChainStats> {
    const currentBlockNumber = this.currentBlock.header.number;
    const totalTransactions = await this.stateManager.getTotalTransactions();
    const totalAssets = await this.assetRegistry.getTotalAssets();
    const totalUsers = await this.userRegistry.getTotalUsers();
    const totalMetaverses = await this.metaverseRegistry.getTotalMetaverses();
    
    return {
      currentBlock: currentBlockNumber,
      totalTransactions,
      totalAssets,
      totalUsers,
      totalMetaverses,
      networkHashrate: await this.consensus.getHashrate(),
      difficulty: this.currentBlock.header.difficulty,
      gasPrice: await this.stateManager.getGasPrice(),
      validators: this.config.validators,
      peers: this.peers.size
    };
  }

  /**
   * Registrar asset en la blockchain
   */
  async registerAsset(assetData: any, ownerAddress: string): Promise<string> {
    try {
      const assetId = await this.assetRegistry.registerAsset(assetData, ownerAddress);
      
      // Crear transacción de registro
      const transaction: Omit<Transaction, 'hash' | 'nonce' | 'timestamp'> = {
        from: ownerAddress,
        to: this.assetRegistry.getAddress(),
        value: '0',
        data: JSON.stringify({
          method: 'registerAsset',
          assetId,
          assetData
        }),
        gasLimit: '21000',
        gasPrice: await this.stateManager.getGasPrice()
      };

      await this.sendTransaction(transaction);
      
      logger.info(`Asset registrado: ${assetId}`);
      return assetId;
      
    } catch (error: any) {
      logger.error('Error registrando asset:', error);
      throw error;
    }
  }

  /**
   * Registrar usuario en la blockchain
   */
  async registerUser(userData: any, walletAddress: string): Promise<string> {
    try {
      const userId = await this.userRegistry.registerUser(userData, walletAddress);
      
      const transaction: Omit<Transaction, 'hash' | 'nonce' | 'timestamp'> = {
        from: walletAddress,
        to: this.userRegistry.getAddress(),
        value: '0',
        data: JSON.stringify({
          method: 'registerUser',
          userId,
          userData
        }),
        gasLimit: '21000',
        gasPrice: await this.stateManager.getGasPrice()
      };

      await this.sendTransaction(transaction);
      
      logger.info(`Usuario registrado: ${userId}`);
      return userId;
      
    } catch (error: any) {
      logger.error('Error registrando usuario:', error);
      throw error;
    }
  }

  /**
   * Crear metaverso en la blockchain
   */
  async createMetaverse(metaverseData: any, creatorAddress: string): Promise<string> {
    try {
      const metaverseId = await this.metaverseRegistry.createMetaverse(metaverseData, creatorAddress);
      
      const transaction: Omit<Transaction, 'hash' | 'nonce' | 'timestamp'> = {
        from: creatorAddress,
        to: this.metaverseRegistry.getAddress(),
        value: '0',
        data: JSON.stringify({
          method: 'createMetaverse',
          metaverseId,
          metaverseData
        }),
        gasLimit: '21000',
        gasPrice: await this.stateManager.getGasPrice()
      };

      await this.sendTransaction(transaction);
      
      logger.info(`Metaverso creado: ${metaverseId}`);
      return metaverseId;
      
    } catch (error: any) {
      logger.error('Error creando metaverso:', error);
      throw error;
    }
  }

  /**
   * Iniciar minería de bloques
   */
  private async startMining(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Crear nuevo bloque
      const newBlock = await this.createNewBlock();
      
      // Validar transacciones
      const validTransactions = await this.validateTransactions(this.pendingTransactions);
      
      // Ejecutar transacciones
      for (const tx of validTransactions) {
        await this.executeTransaction(tx);
      }
      
      // Finalizar bloque
      await this.finalizeBlock(newBlock, validTransactions);
      
      // Limpiar transacciones procesadas
      this.pendingTransactions = this.pendingTransactions.filter(
        tx => !validTransactions.find(vt => vt.hash === tx.hash)
      );
      
      // Programar siguiente bloque
      setTimeout(() => this.startMining(), this.config.blockTime * 1000);
      
    } catch (error: any) {
      logger.error('Error en minería:', error);
      // Reintentar en caso de error
      setTimeout(() => this.startMining(), 5000);
    }
  }

  /**
   * Crear nuevo bloque
   */
  private async createNewBlock(): Promise<Block> {
    const header: BlockHeader = {
      number: this.currentBlock.header.number + 1,
      parentHash: this.currentBlock.header.hash,
      timestamp: Date.now(),
      difficulty: await this.calculateDifficulty(),
      gasLimit: this.config.maxGasLimit.toString(),
      gasUsed: '0',
      miner: this.config.validators[0], // Simplificado
      extraData: 'WoldVirtual3D',
      nonce: '0',
      hash: ''
    };

    const block: Block = {
      header,
      transactions: [],
      hash: ''
    };

    // Calcular hash del bloque
    block.header.hash = this.calculateBlockHash(block);
    block.hash = block.header.hash;

    return block;
  }

  /**
   * Validar transacciones
   */
  private async validateTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    const validTransactions: Transaction[] = [];
    
    for (const tx of transactions) {
      try {
        // Verificar firma
        const isValidSignature = await this.verifyTransactionSignature(tx);
        if (!isValidSignature) continue;

        // Verificar balance
        const balance = await this.getBalance(tx.from);
        const totalCost = ethers.BigNumber.from(tx.value)
          .add(ethers.BigNumber.from(tx.gasPrice).mul(tx.gasLimit));
        
        if (ethers.BigNumber.from(balance).lt(totalCost)) continue;

        // Verificar nonce
        const currentNonce = await this.stateManager.getNonce(tx.from);
        if (tx.nonce !== currentNonce) continue;

        validTransactions.push(tx);
        
      } catch (error) {
        logger.warn(`Transacción inválida ${tx.hash}:`, error);
      }
    }

    return validTransactions;
  }

  /**
   * Ejecutar transacción
   */
  private async executeTransaction(transaction: Transaction): Promise<void> {
    try {
      // Transferir valor
      await this.stateManager.transfer(
        transaction.from,
        transaction.to,
        transaction.value
      );

      // Ejecutar datos de la transacción (smart contract)
      if (transaction.data && transaction.data !== '0x') {
        await this.executeContractCall(transaction);
      }

      // Actualizar nonce
      await this.stateManager.incrementNonce(transaction.from);

      // Cobrar gas
      const gasCost = ethers.BigNumber.from(transaction.gasPrice)
        .mul(transaction.gasLimit);
      await this.stateManager.transfer(
        transaction.from,
        this.config.validators[0], // Minero
        gasCost.toString()
      );

    } catch (error: any) {
      logger.error(`Error ejecutando transacción ${transaction.hash}:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar llamada a contrato
   */
  private async executeContractCall(transaction: Transaction): Promise<void> {
    try {
      const data = JSON.parse(transaction.data);
      
      switch (data.method) {
        case 'registerAsset':
          await this.assetRegistry.registerAsset(data.assetData, transaction.from);
          break;
        case 'registerUser':
          await this.userRegistry.registerUser(data.userData, transaction.from);
          break;
        case 'createMetaverso':
          await this.metaverseRegistry.createMetaverso(data.metaversoData, transaction.from);
          break;
        default:
          logger.warn(`Método de contrato desconocido: ${data.method}`);
      }
      
    } catch (error: any) {
      logger.error('Error ejecutando contrato:', error);
      throw error;
    }
  }

  /**
   * Finalizar bloque
   */
  private async finalizeBlock(block: Block, transactions: Transaction[]): Promise<void> {
    block.transactions = transactions;
    
    // Actualizar estado
    await this.stateManager.addBlock(block);
    
    // Actualizar bloque actual
    this.currentBlock = block;
    
    // Notificar a la red
    await this.networkManager.broadcastBlock(block);
    
    logger.info(`Bloque ${block.header.number} minado con ${transactions.length} transacciones`);
  }

  /**
   * Calcular dificultad
   */
  private async calculateDifficulty(): Promise<string> {
    // Algoritmo simple de ajuste de dificultad
    const targetBlockTime = this.config.blockTime;
    const actualBlockTime = Date.now() - this.currentBlock.header.timestamp;
    
    let newDifficulty = ethers.BigNumber.from(this.currentBlock.header.difficulty);
    
    if (actualBlockTime < targetBlockTime * 0.8) {
      newDifficulty = newDifficulty.mul(11).div(10); // Aumentar 10%
    } else if (actualBlockTime > targetBlockTime * 1.2) {
      newDifficulty = newDifficulty.mul(9).div(10); // Disminuir 10%
    }
    
    return newDifficulty.toString();
  }

  /**
   * Calcular hash del bloque
   */
  private calculateBlockHash(block: Block): string {
    const headerData = {
      number: block.header.number,
      parentHash: block.header.parentHash,
      timestamp: block.header.timestamp,
      difficulty: block.header.difficulty,
      gasLimit: block.header.gasLimit,
      gasUsed: block.header.gasUsed,
      miner: block.header.miner,
      extraData: block.header.extraData,
      nonce: block.header.nonce
    };
    
    return ethers.utils.keccak256(JSON.stringify(headerData));
  }

  /**
   * Verificar firma de transacción
   */
  private async verifyTransactionSignature(transaction: Transaction): Promise<boolean> {
    try {
      const txData = {
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit,
        gasPrice: transaction.gasPrice,
        chainId: this.config.chainId
      };

      const recoveredAddress = ethers.utils.verifyMessage(
        JSON.stringify(txData),
        transaction.hash
      );
      
      return recoveredAddress.toLowerCase() === transaction.from.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Conectar a peer
   */
  async connectToPeer(peerAddress: string): Promise<void> {
    try {
      await this.networkManager.connectToPeer(peerAddress);
      this.peers.add(peerAddress);
      logger.info(`Conectado a peer: ${peerAddress}`);
    } catch (error: any) {
      logger.error(`Error conectando a peer ${peerAddress}:`, error);
    }
  }

  /**
   * Obtener peers conectados
   */
  getConnectedPeers(): string[] {
    return Array.from(this.peers);
  }

  /**
   * Obtener configuración de la blockchain
   */
  getConfig(): ChainConfig {
    return this.config;
  }

  /**
   * Verificar si la blockchain está ejecutándose
   */
  isChainRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Obtener token WCV
   */
  getWCVToken(): WCVToken {
    return this.wcvToken;
  }

  /**
   * Obtener puente
   */
  getBridge(): Bridge {
    return this.bridge;
  }

  /**
   * Obtener integración BSC
   */
  getBSCIntegration(): BSCIntegration {
    return this.bscIntegration;
  }

  /**
   * Transferir WCV
   */
  async transferWCV(
    from: string,
    to: string,
    amount: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      
      // Crear transacción de transferencia
      const transaction = {
        from: wallet.address,
        to: this.wcvToken.getAddress(),
        value: '0',
        data: this.encodeTransferData(to, amount),
        gasLimit: 100000,
        gasPrice: '20000000000'
      };

      const txHash = await this.sendTransaction(transaction);
      
      logger.info(`Transferencia WCV: ${amount} de ${from} a ${to}`);
      return txHash;

    } catch (error: any) {
      logger.error('Error en transferencia WCV:', error);
      throw error;
    }
  }

  /**
   * Codificar datos de transferencia
   */
  private encodeTransferData(to: string, amount: string): string {
    // Función transfer(address to, uint256 amount)
    const functionSignature = 'transfer(address,uint256)';
    const functionSelector = ethers.utils.id(functionSignature).slice(0, 10);
    
    const encodedAddress = ethers.utils.defaultAbiCoder.encode(['address'], [to]);
    const encodedAmount = ethers.utils.defaultAbiCoder.encode(['uint256'], [amount]);
    
    return functionSelector + encodedAddress.slice(2) + encodedAmount.slice(2);
  }

  /**
   * Obtener balance WCV
   */
  async getWCVBalance(address: string): Promise<string> {
    return await this.wcvToken.getBalance(address);
  }

  /**
   * Transferir desde BSC a WoldVirtual3D
   */
  async bridgeFromBSC(
    from: string,
    to: string,
    amount: string,
    bscTransactionHash: string
  ): Promise<string> {
    try {
      const transferId = await this.bridge.transferFromBSC(
        from,
        to,
        amount,
        bscTransactionHash
      );

      await this.bridge.confirmTransferFromBSC(transferId, bscTransactionHash);
      
      logger.info(`Puente BSC → WoldVirtual3D: ${amount} WCV`);
      return transferId;

    } catch (error: any) {
      logger.error('Error en puente desde BSC:', error);
      throw error;
    }
  }

  /**
   * Transferir desde WoldVirtual3D a BSC
   */
  async bridgeToBSC(
    from: string,
    to: string,
    amount: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      
      // Crear transacción de puente
      const transaction = {
        from: wallet.address,
        to: this.bridge.getAddress(),
        value: '0',
        data: this.encodeBridgeData(to, amount),
        gasLimit: 200000,
        gasPrice: '20000000000'
      };

      const txHash = await this.sendTransaction(transaction);
      
      logger.info(`Puente WoldVirtual3D → BSC: ${amount} WCV`);
      return txHash;

    } catch (error: any) {
      logger.error('Error en puente hacia BSC:', error);
      throw error;
    }
  }

  /**
   * Codificar datos de puente
   */
  private encodeBridgeData(to: string, amount: string): string {
    // Función transferToBSC(address to, uint256 amount)
    const functionSignature = 'transferToBSC(address,uint256)';
    const functionSelector = ethers.utils.id(functionSignature).slice(0, 10);
    
    const encodedAddress = ethers.utils.defaultAbiCoder.encode(['address'], [to]);
    const encodedAmount = ethers.utils.defaultAbiCoder.encode(['uint256'], [amount]);
    
    return functionSelector + encodedAddress.slice(2) + encodedAmount.slice(2);
  }

  /**
   * Iniciar procesamiento de transacciones BSC
   */
  private startBSCProcessing(): void {
    setInterval(async () => {
      if (this.isRunning) {
        await this.bscIntegration.processBSCTransactions();
      }
    }, 30000); // Procesar cada 30 segundos
  }

  /**
   * Obtener estadísticas del puente
   */
  async getBridgeStats(): Promise<any> {
    return await this.bridge.getBridgeStats();
  }

  /**
   * Obtener estadísticas de integración BSC
   */
  getBSCStats(): any {
    return this.bscIntegration.getIntegrationStats();
  }
}

export default WoldVirtualChain; 