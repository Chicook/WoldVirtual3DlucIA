import { ethers } from 'ethers';
import { PolygonConfig, Transaction, TransactionStatus, GasEstimate } from '../types';

/**
 * PolygonService - Servicio para interacciones con la red Polygon
 * Maneja transacciones, contratos y operaciones específicas de Polygon
 */
export class PolygonService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private isInitialized: boolean = false;
  private config: PolygonConfig;

  constructor(config: PolygonConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }

  /**
   * Inicializa el servicio con la configuración necesaria
   */
  async initialize(): Promise<void> {
    try {
      if (this.config.privateKey) {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
      }
      
      // Verificar conexión
      await this.provider.getNetwork();
      this.isInitialized = true;
      
      console.log('✅ PolygonService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando PolygonService:', error);
      throw error;
    }
  }

  /**
   * Obtiene el balance de MATIC de una dirección
   */
  async getBalance(address: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('PolygonService no está inicializado');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      throw error;
    }
  }

  /**
   * Envía una transacción de MATIC
   */
  async sendTransaction(to: string, amount: string): Promise<Transaction> {
    if (!this.isInitialized || !this.signer) {
      throw new Error('PolygonService no está inicializado o no hay signer');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: amountWei
      });

      const gasPrice = await this.provider.getFeeData();
      
      const tx = await this.signer.sendTransaction({
        to,
        value: amountWei,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice || undefined
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: amount,
        gasUsed: receipt?.gasUsed.toString() || '0',
        gasPrice: tx.gasPrice?.toString() || '0',
        blockNumber: receipt?.blockNumber || 0,
        status: receipt?.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
        timestamp: Date.now(),
        network: 'polygon',
        type: 'transfer'
      };
    } catch (error) {
      console.error('Error enviando transacción:', error);
      throw error;
    }
  }

  /**
   * Estima el gas para una transacción
   */
  async estimateGas(to: string, amount: string): Promise<GasEstimate> {
    if (!this.isInitialized) {
      throw new Error('PolygonService no está inicializado');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: amountWei
      });

      const gasPrice = await this.provider.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || 0n);

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        gasCost: ethers.formatEther(gasCost),
        estimatedTime: '~15 segundos'
      };
    } catch (error) {
      console.error('Error estimando gas:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de un bloque
   */
  async getBlockInfo(blockNumber: number): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('PolygonService no está inicializado');
    }

    try {
      const block = await this.provider.getBlock(blockNumber);
      return {
        number: block?.number,
        hash: block?.hash,
        timestamp: block?.timestamp,
        transactions: block?.transactions.length || 0,
        gasUsed: block?.gasUsed.toString(),
        gasLimit: block?.gasLimit.toString()
      };
    } catch (error) {
      console.error('Error obteniendo información del bloque:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de una transacción
   */
  async getTransactionStatus(hash: string): Promise<TransactionStatus> {
    if (!this.isInitialized) {
      throw new Error('PolygonService no está inicializado');
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(hash);
      
      if (!receipt) {
        return TransactionStatus.PENDING;
      }

      return receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED;
    } catch (error) {
      console.error('Error obteniendo estado de transacción:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de transacciones de una dirección
   */
  async getTransactionHistory(address: string, limit: number = 10): Promise<Transaction[]> {
    if (!this.isInitialized) {
      throw new Error('PolygonService no está inicializado');
    }

    try {
      // Nota: Para obtener historial completo necesitarías un indexador como The Graph
      // Esta es una implementación básica
      const currentBlock = await this.provider.getBlockNumber();
      const transactions: Transaction[] = [];

      // Buscar en los últimos 100 bloques (limitado para performance)
      for (let i = 0; i < Math.min(100, limit * 10); i++) {
        const block = await this.provider.getBlock(currentBlock - i, true);
        
        if (block?.transactions) {
          for (const tx of block.transactions) {
            if (tx.from === address || tx.to === address) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: ethers.formatEther(tx.value),
                gasUsed: '0', // Necesitarías el receipt para esto
                gasPrice: tx.gasPrice?.toString() || '0',
                blockNumber: block.number,
                status: TransactionStatus.CONFIRMED,
                timestamp: block.timestamp * 1000,
                network: 'polygon',
                type: 'transfer'
              });

              if (transactions.length >= limit) {
                break;
              }
            }
          }
        }

        if (transactions.length >= limit) {
          break;
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error obteniendo historial de transacciones:', error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está inicializado
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene información de la red
   */
  async getNetworkInfo(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('PolygonService no está inicializado');
    }

    try {
      const network = await this.provider.getNetwork();
      const currentBlock = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: network.chainId,
        name: network.name,
        currentBlock,
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        rpcUrl: this.config.rpcUrl
      };
    } catch (error) {
      console.error('Error obteniendo información de la red:', error);
      throw error;
    }
  }

  /**
   * Cierra el servicio y limpia recursos
   */
  async shutdown(): Promise<void> {
    try {
      this.isInitialized = false;
      this.signer = null;
      console.log('✅ PolygonService cerrado correctamente');
    } catch (error) {
      console.error('❌ Error cerrando PolygonService:', error);
      throw error;
    }
  }
} 