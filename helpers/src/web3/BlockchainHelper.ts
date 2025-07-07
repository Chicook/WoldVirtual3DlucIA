/**
 * @fileoverview Helper de blockchain para integrar funcionalidades Web3 en el metaverso
 * @module @metaverso/helpers/web3/BlockchainHelper
 */

import { ethers } from 'ethers';
import * as THREE from 'three';
import { IWeb3Helper } from '../types';

/**
 * Configuración de red blockchain
 */
export interface BlockchainConfig {
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum' | 'optimism';
  rpcUrl: string;
  chainId: number;
  name: string;
  currency: string;
  blockTime: number;
}

/**
 * Información de transacción
 */
export interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  data?: string;
}

/**
 * Información de token
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
}

/**
 * Información de NFT
 */
export interface NFTInfo {
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  owner: string;
  metadata?: any;
}

/**
 * Helper de blockchain para integrar funcionalidades Web3 en el metaverso
 */
export class BlockchainHelper implements IWeb3Helper {
  public readonly type = 'BlockchainHelper';
  public enabled: boolean = true;
  public network: string;
  public provider: ethers.Provider;
  public connected: boolean = false;
  
  private _config: BlockchainConfig;
  private _signer?: ethers.Signer;
  private _wallet?: ethers.Wallet;
  private _contracts: Map<string, ethers.Contract> = new Map();
  private _eventListeners: Map<string, Function[]> = new Map();
  private _transactionPool: Map<string, TransactionInfo> = new Map();
  private _tokenCache: Map<string, TokenInfo> = new Map();
  private _nftCache: Map<string, NFTInfo> = new Map();
  private _blockSubscription?: ethers.Listener;
  private _pendingTransactionSubscription?: ethers.Listener;

  /**
   * Constructor del helper
   * @param config - Configuración de la red blockchain
   */
  constructor(config: BlockchainConfig) {
    this._config = config;
    this.network = config.name;
    
    // Crear proveedor
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    this.init();
  }

  /**
   * Inicializar el helper
   */
  public async init(): Promise<void> {
    try {
      // Verificar conexión
      await this.provider.getNetwork();
      this.connected = true;
      
      // Configurar listeners de eventos
      this._setupEventListeners();
      
      // Iniciar monitoreo de bloques
      this._startBlockMonitoring();
      
      console.log(`[BlockchainHelper] Conectado a ${this._config.name}`);
    } catch (error) {
      console.error('[BlockchainHelper] Error al conectar:', error);
      this.connected = false;
    }
  }

  /**
   * Actualizar el helper
   */
  public update(): void {
    if (!this.enabled || !this.connected) return;

    // Actualizar transacciones pendientes
    this._updatePendingTransactions();
    
    // Limpiar cache expirado
    this._cleanExpiredCache();
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    // Desconectar listeners
    if (this._blockSubscription) {
      this.provider.off('block', this._blockSubscription);
    }
    
    if (this._pendingTransactionSubscription) {
      this.provider.off('pending', this._pendingTransactionSubscription);
    }
    
    // Limpiar caches
    this._transactionPool.clear();
    this._tokenCache.clear();
    this._nftCache.clear();
    this._contracts.clear();
    
    this.connected = false;
  }

  /**
   * Mostrar el helper
   */
  public show(): void {
    this.enabled = true;
  }

  /**
   * Ocultar el helper
   */
  public hide(): void {
    this.enabled = false;
  }

  /**
   * Conectar a la red
   */
  public async connect(): Promise<void> {
    try {
      await this.provider.getNetwork();
      this.connected = true;
      console.log(`[BlockchainHelper] Conectado a ${this._config.name}`);
    } catch (error) {
      console.error('[BlockchainHelper] Error al conectar:', error);
      throw error;
    }
  }

  /**
   * Desconectar de la red
   */
  public disconnect(): void {
    this.connected = false;
    this._signer = undefined;
    this._wallet = undefined;
    console.log(`[BlockchainHelper] Desconectado de ${this._config.name}`);
  }

  /**
   * Conectar wallet
   */
  public async connectWallet(privateKey?: string): Promise<void> {
    try {
      if (privateKey) {
        // Conectar con clave privada
        this._wallet = new ethers.Wallet(privateKey, this.provider);
        this._signer = this._wallet;
      } else if (typeof window !== 'undefined' && 'ethereum' in window) {
        // Conectar con MetaMask
        const ethereum = (window as any).ethereum;
        await ethereum.request({ method: 'eth_requestAccounts' });
        this._signer = new ethers.BrowserProvider(ethereum).getSigner();
      } else {
        throw new Error('No se encontró wallet disponible');
      }
      
      console.log('[BlockchainHelper] Wallet conectado');
    } catch (error) {
      console.error('[BlockchainHelper] Error al conectar wallet:', error);
      throw error;
    }
  }

  /**
   * Obtener balance de ETH
   */
  public async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('[BlockchainHelper] Error al obtener balance:', error);
      return '0';
    }
  }

  /**
   * Obtener información de token
   */
  public async getTokenInfo(tokenAddress: string, userAddress?: string): Promise<TokenInfo> {
    // Verificar cache
    const cacheKey = `${tokenAddress}-${userAddress || 'no-user'}`;
    if (this._tokenCache.has(cacheKey)) {
      return this._tokenCache.get(cacheKey)!;
    }

    try {
      // ABI básico para tokens ERC20
      const tokenABI = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)'
      ];

      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, this.provider);
      
      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        userAddress ? tokenContract.balanceOf(userAddress) : '0'
      ]);

      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        balance: userAddress ? ethers.formatUnits(balance, decimals) : undefined
      };

      // Guardar en cache
      this._tokenCache.set(cacheKey, tokenInfo);
      
      return tokenInfo;
    } catch (error) {
      console.error('[BlockchainHelper] Error al obtener información de token:', error);
      throw error;
    }
  }

  /**
   * Obtener información de NFT
   */
  public async getNFTInfo(contractAddress: string, tokenId: string): Promise<NFTInfo> {
    const cacheKey = `${contractAddress}-${tokenId}`;
    if (this._nftCache.has(cacheKey)) {
      return this._nftCache.get(cacheKey)!;
    }

    try {
      // ABI básico para NFTs ERC721
      const nftABI = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function tokenURI(uint256) view returns (string)',
        'function ownerOf(uint256) view returns (address)'
      ];

      const nftContract = new ethers.Contract(contractAddress, nftABI, this.provider);
      
      const [name, symbol, tokenURI, owner] = await Promise.all([
        nftContract.name(),
        nftContract.symbol(),
        nftContract.tokenURI(tokenId),
        nftContract.ownerOf(tokenId)
      ]);

      // Obtener metadata del NFT
      let metadata = {};
      let image = '';
      let description = '';

      try {
        const response = await fetch(tokenURI);
        metadata = await response.json();
        image = metadata.image || '';
        description = metadata.description || '';
      } catch (error) {
        console.warn('[BlockchainHelper] Error al obtener metadata del NFT:', error);
      }

      const nftInfo: NFTInfo = {
        contractAddress,
        tokenId,
        name: metadata.name || `${symbol} #${tokenId}`,
        description,
        image,
        attributes: metadata.attributes || [],
        owner,
        metadata
      };

      // Guardar en cache
      this._nftCache.set(cacheKey, nftInfo);
      
      return nftInfo;
    } catch (error) {
      console.error('[BlockchainHelper] Error al obtener información de NFT:', error);
      throw error;
    }
  }

  /**
   * Enviar transacción
   */
  public async sendTransaction(
    to: string,
    value: string,
    data?: string
  ): Promise<TransactionInfo> {
    if (!this._signer) {
      throw new Error('Wallet no conectado');
    }

    try {
      const tx = await this._signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
        data
      });

      const transactionInfo: TransactionInfo = {
        hash: tx.hash,
        from: tx.from || '',
        to: tx.to || '',
        value: ethers.formatEther(tx.value || 0),
        gasUsed: '0',
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
        blockNumber: 0,
        timestamp: Date.now(),
        status: 'pending',
        data: tx.data
      };

      // Agregar a pool de transacciones pendientes
      this._transactionPool.set(tx.hash, transactionInfo);
      
      // Esperar confirmación
      const receipt = await tx.wait();
      
      // Actualizar información de la transacción
      transactionInfo.gasUsed = receipt.gasUsed.toString();
      transactionInfo.blockNumber = receipt.blockNumber;
      transactionInfo.status = 'confirmed';
      
      // Emitir evento
      this._emitEvent('transactionConfirmed', transactionInfo);
      
      return transactionInfo;
    } catch (error) {
      console.error('[BlockchainHelper] Error al enviar transacción:', error);
      throw error;
    }
  }

  /**
   * Obtener información de transacción
   */
  public async getTransactionInfo(hash: string): Promise<TransactionInfo | null> {
    try {
      const tx = await this.provider.getTransaction(hash);
      const receipt = await this.provider.getTransactionReceipt(hash);
      
      if (!tx || !receipt) return null;

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(), // TODO: Obtener timestamp real del bloque
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        data: tx.data
      };
    } catch (error) {
      console.error('[BlockchainHelper] Error al obtener información de transacción:', error);
      return null;
    }
  }

  /**
   * Registrar evento
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event)!.push(callback);
  }

  /**
   * Remover evento
   */
  public removeEventListener(event: string): void {
    this._eventListeners.delete(event);
  }

  /**
   * Limpiar todos los eventos
   */
  public clearEvents(): void {
    this._eventListeners.clear();
  }

  /**
   * Obtener información de la red
   */
  public getNetworkInfo(): BlockchainConfig {
    return { ...this._config };
  }

  /**
   * Obtener estadísticas de la red
   */
  public async getNetworkStats(): Promise<{
    blockNumber: number;
    gasPrice: string;
    blockTime: number;
    difficulty: string;
  }> {
    try {
      const [blockNumber, gasPrice, block] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
        this.provider.getBlock('latest')
      ]);

      return {
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        blockTime: block?.timestamp || 0,
        difficulty: block?.difficulty?.toString() || '0'
      };
    } catch (error) {
      console.error('[BlockchainHelper] Error al obtener estadísticas de red:', error);
      throw error;
    }
  }

  /**
   * Configurar listeners de eventos
   */
  private _setupEventListeners(): void {
    // Listener para nuevos bloques
    this._blockSubscription = (blockNumber: number) => {
      this._emitEvent('newBlock', { blockNumber, timestamp: Date.now() });
    };
    this.provider.on('block', this._blockSubscription);

    // Listener para transacciones pendientes
    this._pendingTransactionSubscription = (tx: any) => {
      this._emitEvent('pendingTransaction', tx);
    };
    this.provider.on('pending', this._pendingTransactionSubscription);
  }

  /**
   * Iniciar monitoreo de bloques
   */
  private _startBlockMonitoring(): void {
    // Monitoreo periódico de bloques
    setInterval(async () => {
      if (this.enabled && this.connected) {
        try {
          const blockNumber = await this.provider.getBlockNumber();
          this._emitEvent('blockUpdate', { blockNumber, timestamp: Date.now() });
        } catch (error) {
          console.error('[BlockchainHelper] Error en monitoreo de bloques:', error);
        }
      }
    }, 15000); // Cada 15 segundos
  }

  /**
   * Actualizar transacciones pendientes
   */
  private async _updatePendingTransactions(): Promise<void> {
    for (const [hash, tx] of this._transactionPool.entries()) {
      if (tx.status === 'pending') {
        try {
          const receipt = await this.provider.getTransactionReceipt(hash);
          if (receipt) {
            tx.status = receipt.status === 1 ? 'confirmed' : 'failed';
            tx.gasUsed = receipt.gasUsed.toString();
            tx.blockNumber = receipt.blockNumber;
            
            this._emitEvent('transactionUpdated', tx);
            
            if (tx.status !== 'pending') {
              this._transactionPool.delete(hash);
            }
          }
        } catch (error) {
          // Transacción aún pendiente
        }
      }
    }
  }

  /**
   * Limpiar cache expirado
   */
  private _cleanExpiredCache(): void {
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutos

    // Limpiar cache de tokens
    for (const [key, token] of this._tokenCache.entries()) {
      if (now - (token as any).timestamp > cacheExpiry) {
        this._tokenCache.delete(key);
      }
    }

    // Limpiar cache de NFTs
    for (const [key, nft] of this._nftCache.entries()) {
      if (now - (nft as any).timestamp > cacheExpiry) {
        this._nftCache.delete(key);
      }
    }
  }

  /**
   * Emitir evento
   */
  private _emitEvent(event: string, data: any): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[BlockchainHelper] Error en listener de evento ${event}:`, error);
        }
      });
    }
  }
} 