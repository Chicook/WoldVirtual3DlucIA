import { ethers } from 'ethers';
import { WalletConfig, WalletInfo, Transaction, NetworkInfo } from '../types';

/**
 * WalletService - Servicio para gestión de wallets y transacciones
 * Maneja múltiples wallets, firmas y operaciones de seguridad
 */
export class WalletService {
  private wallets: Map<string, ethers.Wallet> = new Map();
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private isInitialized: boolean = false;
  private config: WalletConfig;

  constructor(config: WalletConfig) {
    this.config = config;
  }

  /**
   * Inicializa el servicio con la configuración de wallets
   */
  async initialize(): Promise<void> {
    try {
      // Inicializar providers para cada red
      for (const [network, rpcUrl] of Object.entries(this.config.networks)) {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        this.providers.set(network, provider);
      }

      // Inicializar wallets desde configuración
      for (const [name, walletConfig] of Object.entries(this.config.wallets)) {
        const provider = this.providers.get(walletConfig.network);
        if (provider && walletConfig.privateKey) {
          const wallet = new ethers.Wallet(walletConfig.privateKey, provider);
          this.wallets.set(name, wallet);
        }
      }

      this.isInitialized = true;
      console.log('✅ WalletService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando WalletService:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva wallet
   */
  async createWallet(name: string, network: string): Promise<WalletInfo> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Red ${network} no configurada`);
      }

      const wallet = ethers.Wallet.createRandom(provider);
      this.wallets.set(name, wallet);

      const walletInfo: WalletInfo = {
        name,
        address: wallet.address,
        network,
        balance: '0',
        isEncrypted: false,
        createdAt: Date.now()
      };

      console.log(`Nueva wallet creada: ${name} en ${network}`);
      return walletInfo;
    } catch (error) {
      console.error('Error creando wallet:', error);
      throw error;
    }
  }

  /**
   * Importa una wallet desde private key
   */
  async importWallet(name: string, privateKey: string, network: string): Promise<WalletInfo> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Red ${network} no configurada`);
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      this.wallets.set(name, wallet);

      const balance = await provider.getBalance(wallet.address);
      const walletInfo: WalletInfo = {
        name,
        address: wallet.address,
        network,
        balance: ethers.formatEther(balance),
        isEncrypted: false,
        createdAt: Date.now()
      };

      console.log(`Wallet importada: ${name} en ${network}`);
      return walletInfo;
    } catch (error) {
      console.error('Error importando wallet:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de una wallet
   */
  async getWalletInfo(name: string): Promise<WalletInfo | null> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const wallet = this.wallets.get(name);
      if (!wallet) {
        return null;
      }

      const provider = wallet.provider;
      const balance = await provider.getBalance(wallet.address);
      const network = await provider.getNetwork();

      const walletInfo: WalletInfo = {
        name,
        address: wallet.address,
        network: network.name,
        balance: ethers.formatEther(balance),
        isEncrypted: false,
        createdAt: Date.now()
      };

      return walletInfo;
    } catch (error) {
      console.error('Error obteniendo información de wallet:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las wallets
   */
  async getAllWallets(): Promise<WalletInfo[]> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const walletInfos: WalletInfo[] = [];

      for (const [name, wallet] of this.wallets) {
        const info = await this.getWalletInfo(name);
        if (info) {
          walletInfos.push(info);
        }
      }

      return walletInfos;
    } catch (error) {
      console.error('Error obteniendo todas las wallets:', error);
      throw error;
    }
  }

  /**
   * Envía una transacción desde una wallet
   */
  async sendTransaction(
    walletName: string,
    to: string,
    amount: string,
    data?: string
  ): Promise<Transaction> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const wallet = this.wallets.get(walletName);
      if (!wallet) {
        throw new Error(`Wallet ${walletName} no encontrada`);
      }

      const amountWei = ethers.parseEther(amount);
      const gasEstimate = await wallet.provider.estimateGas({
        to,
        value: amountWei,
        data: data || '0x'
      });

      const gasPrice = await wallet.provider.getFeeData();
      
      const tx = await wallet.sendTransaction({
        to,
        value: amountWei,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice || undefined,
        data: data || '0x'
      });

      const receipt = await tx.wait();

      const transaction: Transaction = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: amount,
        gasUsed: receipt?.gasUsed.toString() || '0',
        gasPrice: tx.gasPrice?.toString() || '0',
        blockNumber: receipt?.blockNumber || 0,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        timestamp: Date.now(),
        network: (await wallet.provider.getNetwork()).name,
        type: 'transfer'
      };

      console.log(`Transacción enviada desde ${walletName}: ${tx.hash}`);
      return transaction;
    } catch (error) {
      console.error('Error enviando transacción:', error);
      throw error;
    }
  }

  /**
   * Firma un mensaje
   */
  async signMessage(walletName: string, message: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const wallet = this.wallets.get(walletName);
      if (!wallet) {
        throw new Error(`Wallet ${walletName} no encontrada`);
      }

      const signature = await wallet.signMessage(message);
      console.log(`Mensaje firmado por ${walletName}`);
      return signature;
    } catch (error) {
      console.error('Error firmando mensaje:', error);
      throw error;
    }
  }

  /**
   * Verifica una firma
   */
  async verifySignature(message: string, signature: string, expectedAddress: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Error verificando firma:', error);
      return false;
    }
  }

  /**
   * Obtiene el historial de transacciones de una wallet
   */
  async getTransactionHistory(walletName: string, limit: number = 10): Promise<Transaction[]> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const wallet = this.wallets.get(walletName);
      if (!wallet) {
        throw new Error(`Wallet ${walletName} no encontrada`);
      }

      const provider = wallet.provider;
      const currentBlock = await provider.getBlockNumber();
      const transactions: Transaction[] = [];

      // Buscar en los últimos bloques (limitado para performance)
      for (let i = 0; i < Math.min(100, limit * 10); i++) {
        const block = await provider.getBlock(currentBlock - i, true);
        
        if (block?.transactions) {
          for (const tx of block.transactions) {
            if (tx.from === wallet.address || tx.to === wallet.address) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: ethers.formatEther(tx.value),
                gasUsed: '0', // Necesitarías el receipt para esto
                gasPrice: tx.gasPrice?.toString() || '0',
                blockNumber: block.number,
                status: 'confirmed',
                timestamp: block.timestamp * 1000,
                network: (await provider.getNetwork()).name,
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
   * Obtiene información de la red
   */
  async getNetworkInfo(network: string): Promise<NetworkInfo> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Red ${network} no configurada`);
      }

      const networkData = await provider.getNetwork();
      const currentBlock = await provider.getBlockNumber();
      const gasPrice = await provider.getFeeData();

      return {
        chainId: networkData.chainId,
        name: networkData.name,
        currentBlock,
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        rpcUrl: this.config.networks[network]
      };
    } catch (error) {
      console.error('Error obteniendo información de la red:', error);
      throw error;
    }
  }

  /**
   * Elimina una wallet
   */
  async removeWallet(name: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('WalletService no está inicializado');
    }

    try {
      const removed = this.wallets.delete(name);
      if (removed) {
        console.log(`Wallet ${name} eliminada`);
      }
      return removed;
    } catch (error) {
      console.error('Error eliminando wallet:', error);
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
   * Cierra el servicio y limpia recursos
   */
  async shutdown(): Promise<void> {
    try {
      this.isInitialized = false;
      this.wallets.clear();
      this.providers.clear();
      console.log('✅ WalletService cerrado correctamente');
    } catch (error) {
      console.error('❌ Error cerrando WalletService:', error);
      throw error;
    }
  }
} 