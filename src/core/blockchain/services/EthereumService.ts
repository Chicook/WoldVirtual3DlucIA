import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { EthereumConfig, Transaction, TransactionStatus, GasEstimate, Token } from '../types';

export class EthereumService extends EventEmitter {
  private config: EthereumConfig;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private isInitialized: boolean = false;
  private pendingTransactions: Map<string, Transaction> = new Map();

  constructor(config: EthereumConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando EthereumService...');

      // Configurar proveedor
      this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
      
      // Verificar conexión
      await this.provider.getNetwork();
      
      this.isInitialized = true;
      console.log('EthereumService inicializado correctamente');

    } catch (error) {
      console.error('Error al inicializar EthereumService:', error);
      throw error;
    }
  }

  setSigner(signer: ethers.Signer): void {
    this.signer = signer;
    console.log('Signer configurado para Ethereum');
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);

    } catch (error) {
      console.error('Error al obtener balance:', error);
      throw error;
    }
  }

  async getTokenBalance(address: string, tokenAddress: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      // ABI mínimo para balanceOf
      const abi = ['function balanceOf(address owner) view returns (uint256)'];
      const contract = new ethers.Contract(tokenAddress, abi, this.provider);
      
      const balance = await contract.balanceOf(address);
      return balance.toString();

    } catch (error) {
      console.error('Error al obtener balance de token:', error);
      throw error;
    }
  }

  async sendTransaction(to: string, amount: string): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      const from = await this.signer.getAddress();
      const value = ethers.utils.parseEther(amount);
      
      // Estimar gas
      const gasEstimate = await this.estimateGas(to, amount);
      const gasLimit = ethers.BigNumber.from(gasEstimate.gasLimit);
      const gasPrice = ethers.utils.parseUnits(gasEstimate.gasPrice, 'wei');

      // Crear transacción
      const tx = {
        to,
        value,
        gasLimit,
        gasPrice
      };

      // Enviar transacción
      const response = await this.signer.sendTransaction(tx);
      
      const transaction: Transaction = {
        hash: response.hash,
        from,
        to,
        value: amount,
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        nonce: response.nonce,
        data: response.data || '0x',
        chainId: this.config.chainId,
        status: TransactionStatus.PENDING,
        confirmations: 0
      };

      // Emitir evento
      this.emit('transactionPending', transaction);
      this.pendingTransactions.set(transaction.hash, transaction);

      // Esperar confirmación
      this.waitForConfirmation(transaction.hash);

      return transaction;

    } catch (error) {
      console.error('Error al enviar transacción:', error);
      throw error;
    }
  }

  async sendTokenTransaction(to: string, amount: string, tokenAddress: string): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      const from = await this.signer.getAddress();
      
      // ABI para transferencia de tokens
      const abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ];
      
      const contract = new ethers.Contract(tokenAddress, abi, this.signer);
      
      // Obtener decimales del token
      const decimals = await contract.decimals();
      const tokenAmount = ethers.utils.parseUnits(amount, decimals);
      
      // Estimar gas
      const gasEstimate = await this.estimateTokenGas(to, amount, tokenAddress);
      const gasLimit = ethers.BigNumber.from(gasEstimate.gasLimit);
      const gasPrice = ethers.utils.parseUnits(gasEstimate.gasPrice, 'wei');

      // Crear transacción
      const tx = await contract.populateTransaction.transfer(to, tokenAmount);
      tx.gasLimit = gasLimit;
      tx.gasPrice = gasPrice;

      // Enviar transacción
      const response = await this.signer.sendTransaction(tx);
      
      const transaction: Transaction = {
        hash: response.hash,
        from,
        to: tokenAddress,
        value: '0',
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        nonce: response.nonce,
        data: response.data || '0x',
        chainId: this.config.chainId,
        status: TransactionStatus.PENDING,
        confirmations: 0,
        metadata: {
          type: 'transfer',
          tokenSymbol: 'TOKEN'
        }
      };

      // Emitir evento
      this.emit('transactionPending', transaction);
      this.pendingTransactions.set(transaction.hash, transaction);

      // Esperar confirmación
      this.waitForConfirmation(transaction.hash);

      return transaction;

    } catch (error) {
      console.error('Error al enviar transacción de token:', error);
      throw error;
    }
  }

  async estimateGas(to: string, amount: string): Promise<GasEstimate> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      const value = ethers.utils.parseEther(amount);
      const gasLimit = await this.provider.estimateGas({ to, value });
      
      // Obtener gas price actual
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.utils.parseUnits(this.config.gasPrice, 'wei');
      
      const totalCost = gasLimit.mul(gasPrice);
      
      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'wei'),
        totalCost: ethers.utils.formatEther(totalCost)
      };

    } catch (error) {
      console.error('Error al estimar gas:', error);
      throw error;
    }
  }

  async estimateTokenGas(to: string, amount: string, tokenAddress: string): Promise<GasEstimate> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      // ABI para estimar gas de transferencia
      const abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ];
      
      const contract = new ethers.Contract(tokenAddress, abi, this.provider);
      
      // Obtener decimales del token
      const decimals = await contract.decimals();
      const tokenAmount = ethers.utils.parseUnits(amount, decimals);
      
      // Estimar gas
      const gasLimit = await contract.estimateGas.transfer(to, tokenAmount);
      
      // Obtener gas price actual
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.utils.parseUnits(this.config.gasPrice, 'wei');
      
      const totalCost = gasLimit.mul(gasPrice);
      
      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'wei'),
        totalCost: ethers.utils.formatEther(totalCost)
      };

    } catch (error) {
      console.error('Error al estimar gas de token:', error);
      throw error;
    }
  }

  private async waitForConfirmation(txHash: string): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      const transaction = this.pendingTransactions.get(txHash);
      if (!transaction) {
        throw new Error('Transacción no encontrada');
      }

      // Esperar confirmaciones
      const receipt = await this.provider.waitForTransaction(
        txHash, 
        this.config.confirmations
      );

      // Actualizar transacción
      const updatedTransaction: Transaction = {
        ...transaction,
        status: receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        confirmations: receipt.confirmations,
        error: receipt.status === 0 ? 'Transaction failed' : undefined
      };

      // Emitir evento
      if (receipt.status === 1) {
        this.emit('transactionConfirmed', updatedTransaction);
      } else {
        this.emit('transactionFailed', updatedTransaction);
      }

      // Actualizar mapa
      this.pendingTransactions.set(txHash, updatedTransaction);

    } catch (error) {
      console.error('Error al esperar confirmación:', error);
      
      const transaction = this.pendingTransactions.get(txHash);
      if (transaction) {
        const failedTransaction: Transaction = {
          ...transaction,
          status: TransactionStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        this.emit('transactionFailed', failedTransaction);
        this.pendingTransactions.set(txHash, failedTransaction);
      }
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      return await this.provider.getTransactionReceipt(txHash);

    } catch (error) {
      console.error('Error al obtener recibo de transacción:', error);
      return null;
    }
  }

  async getTransaction(txHash: string): Promise<ethers.providers.TransactionResponse | null> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      return await this.provider.getTransaction(txHash);

    } catch (error) {
      console.error('Error al obtener transacción:', error);
      return null;
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      return await this.provider.getBlockNumber();

    } catch (error) {
      console.error('Error al obtener número de bloque:', error);
      throw error;
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.utils.parseUnits(this.config.gasPrice, 'wei');
      
      return ethers.utils.formatUnits(gasPrice, 'gwei');

    } catch (error) {
      console.error('Error al obtener gas price:', error);
      throw error;
    }
  }

  async getNetworkInfo(): Promise<any> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.getGasPrice();

      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber,
        gasPrice,
        explorerUrl: this.config.explorerUrl
      };

    } catch (error) {
      console.error('Error al obtener información de red:', error);
      throw error;
    }
  }

  async callContract(
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = []
  ): Promise<any> {
    try {
      if (!this.provider) {
        throw new Error('Proveedor no inicializado');
      }

      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      const result = await contract[method](...params);
      
      return result;

    } catch (error) {
      console.error('Error al llamar contrato:', error);
      throw error;
    }
  }

  async sendContractTransaction(
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = [],
    overrides: any = {}
  ): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      const from = await this.signer.getAddress();
      const contract = new ethers.Contract(contractAddress, abi, this.signer);
      
      // Estimar gas
      const gasEstimate = await contract.estimateGas[method](...params, overrides);
      const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
      
      // Obtener gas price
      const feeData = await this.provider!.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.utils.parseUnits(this.config.gasPrice, 'wei');

      // Crear transacción
      const tx = await contract.populateTransaction[method](...params, {
        ...overrides,
        gasLimit,
        gasPrice
      });

      // Enviar transacción
      const response = await this.signer.sendTransaction(tx);
      
      const transaction: Transaction = {
        hash: response.hash,
        from,
        to: contractAddress,
        value: overrides.value ? ethers.utils.formatEther(overrides.value) : '0',
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        nonce: response.nonce,
        data: response.data || '0x',
        chainId: this.config.chainId,
        status: TransactionStatus.PENDING,
        confirmations: 0,
        metadata: {
          type: 'contract',
          method
        }
      };

      // Emitir evento
      this.emit('transactionPending', transaction);
      this.pendingTransactions.set(transaction.hash, transaction);

      // Esperar confirmación
      this.waitForConfirmation(transaction.hash);

      return transaction;

    } catch (error) {
      console.error('Error al enviar transacción de contrato:', error);
      throw error;
    }
  }

  // Métodos de utilidad

  getPendingTransactions(): Transaction[] {
    return Array.from(this.pendingTransactions.values());
  }

  getTransactionByHash(hash: string): Transaction | undefined {
    return this.pendingTransactions.get(hash);
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }

  getProvider(): ethers.providers.JsonRpcProvider | null {
    return this.provider;
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  // Métodos de limpieza

  dispose(): void {
    this.removeAllListeners();
    this.pendingTransactions.clear();
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
    console.log('EthereumService disposed');
  }
} 