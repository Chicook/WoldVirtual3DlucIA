/**
 * BlockchainService - Servicio de gestión de blockchain
 * Maneja conexiones, transacciones y operaciones con redes blockchain
 */
export class BlockchainService {
  private isInitialized: boolean = false;
  private isConnected: boolean = false;
  private currentNetwork: string = '';
  private provider: any = null;
  private accounts: string[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private transactionQueue: Transaction[] = [];
  private isProcessingQueue: boolean = false;

  /**
   * Inicializar el servicio de blockchain
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🔗 Inicializando BlockchainService...');

    try {
      // Configurar provider por defecto
      await this.setupProvider();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Inicializar queue de transacciones
      this.setupTransactionQueue();

      this.isInitialized = true;
      console.log('✅ BlockchainService inicializado');
      this.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      console.error('❌ Error inicializando BlockchainService:', error);
      this.emit('error', { error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Configurar provider de blockchain
   */
  private async setupProvider(): Promise<void> {
    try {
      // Detectar provider disponible
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = (window as any).ethereum;
        console.log('🔗 Provider Ethereum detectado');
      } else {
        // Fallback a provider local o testnet
        this.provider = this.createFallbackProvider();
        console.log('🔗 Usando provider fallback');
      }

      // Configurar listeners del provider
      this.setupProviderListeners();
      
    } catch (error) {
      console.error('❌ Error configurando provider:', error);
      throw error;
    }
  }

  /**
   * Crear provider fallback
   */
  private createFallbackProvider(): any {
    // Implementación básica de provider fallback
    return {
      request: async (args: any) => {
        console.log('🔄 Request fallback:', args);
        return { result: 'fallback_response' };
      },
      on: (event: string, callback: Function) => {
        console.log('📡 Event listener fallback:', event);
      },
      removeListener: (event: string, callback: Function) => {
        console.log('🗑️ Remove listener fallback:', event);
      }
    };
  }

  /**
   * Configurar listeners del provider
   */
  private setupProviderListeners(): void {
    if (!this.provider) return;

    this.provider.on('accountsChanged', (accounts: string[]) => {
      console.log('👥 Cuentas cambiadas:', accounts);
      this.accounts = accounts;
      this.emit('accountsChanged', { accounts, timestamp: new Date() });
    });

    this.provider.on('chainChanged', (chainId: string) => {
      console.log('🔄 Red cambiada:', chainId);
      this.currentNetwork = chainId;
      this.emit('chainChanged', { chainId, timestamp: new Date() });
    });

    this.provider.on('connect', (info: any) => {
      console.log('🔗 Conectado a blockchain:', info);
      this.isConnected = true;
      this.emit('connected', { info, timestamp: new Date() });
    });

    this.provider.on('disconnect', (error: any) => {
      console.log('🔌 Desconectado de blockchain:', error);
      this.isConnected = false;
      this.emit('disconnected', { error, timestamp: new Date() });
    });
  }

  /**
   * Configurar event listeners internos
   */
  private setupEventListeners(): void {
    // Event listeners específicos del servicio
  }

  /**
   * Configurar queue de transacciones
   */
  private setupTransactionQueue(): void {
    // Procesar queue cada 5 segundos
    setInterval(() => {
      this.processTransactionQueue();
    }, 5000);
  }

  /**
   * Conectar a wallet
   */
  public async connectWallet(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('Provider no disponible');
    }

    try {
      console.log('🔗 Conectando wallet...');
      
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });

      this.accounts = accounts;
      this.isConnected = true;
      
      console.log('✅ Wallet conectada:', accounts);
      this.emit('walletConnected', { accounts, timestamp: new Date() });
      
      return accounts;
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      this.emit('walletConnectionError', { error, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Obtener cuentas conectadas
   */
  public getAccounts(): string[] {
    return this.accounts;
  }

  /**
   * Obtener cuenta principal
   */
  public getMainAccount(): string | null {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }

  /**
   * Obtener red actual
   */
  public async getCurrentNetwork(): Promise<string> {
    if (!this.provider) {
      return 'unknown';
    }

    try {
      const chainId = await this.provider.request({
        method: 'eth_chainId'
      });
      
      this.currentNetwork = chainId;
      return chainId;
    } catch (error) {
      console.error('❌ Error obteniendo red:', error);
      return 'unknown';
    }
  }

  /**
   * Cambiar red
   */
  public async switchNetwork(chainId: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider no disponible');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });

      this.currentNetwork = chainId;
      console.log('✅ Red cambiada a:', chainId);
      this.emit('networkSwitched', { chainId, timestamp: new Date() });
    } catch (error) {
      console.error('❌ Error cambiando red:', error);
      this.emit('networkSwitchError', { error, chainId, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Obtener balance de cuenta
   */
  public async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider no disponible');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      return balance;
    } catch (error) {
      console.error('❌ Error obteniendo balance:', error);
      throw error;
    }
  }

  /**
   * Enviar transacción
   */
  public async sendTransaction(transaction: TransactionRequest): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider no disponible');
    }

    if (!this.isConnected) {
      throw new Error('Wallet no conectada');
    }

    try {
      console.log('📤 Enviando transacción:', transaction);
      
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      console.log('✅ Transacción enviada:', txHash);
      this.emit('transactionSent', { txHash, transaction, timestamp: new Date() });
      
      return txHash;
    } catch (error) {
      console.error('❌ Error enviando transacción:', error);
      this.emit('transactionError', { error, transaction, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Agregar transacción a la queue
   */
  public async queueTransaction(transaction: TransactionRequest): Promise<void> {
    const queuedTransaction: Transaction = {
      id: Date.now().toString(),
      request: transaction,
      status: 'queued',
      timestamp: new Date(),
      retries: 0
    };

    this.transactionQueue.push(queuedTransaction);
    console.log('📋 Transacción agregada a queue:', queuedTransaction.id);
    
    this.emit('transactionQueued', { transaction: queuedTransaction, timestamp: new Date() });
  }

  /**
   * Procesar queue de transacciones
   */
  private async processTransactionQueue(): Promise<void> {
    if (this.isProcessingQueue || this.transactionQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      const transaction = this.transactionQueue.shift();
      if (!transaction) return;

      console.log('🔄 Procesando transacción de queue:', transaction.id);

      try {
        const txHash = await this.sendTransaction(transaction.request);
        
        transaction.status = 'completed';
        transaction.txHash = txHash;
        
        this.emit('transactionCompleted', { transaction, timestamp: new Date() });
      } catch (error) {
        transaction.status = 'failed';
        transaction.error = error;
        transaction.retries++;

        if (transaction.retries < 3) {
          // Reintentar
          this.transactionQueue.unshift(transaction);
          console.log(`🔄 Reintentando transacción ${transaction.id} (${transaction.retries}/3)`);
        } else {
          console.error(`❌ Transacción ${transaction.id} falló después de 3 intentos`);
          this.emit('transactionFailed', { transaction, timestamp: new Date() });
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Firmar mensaje
   */
  public async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider no disponible');
    }

    const account = this.getMainAccount();
    if (!account) {
      throw new Error('No hay cuenta conectada');
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, account]
      });

      console.log('✍️ Mensaje firmado:', signature);
      this.emit('messageSigned', { message, signature, timestamp: new Date() });
      
      return signature;
    } catch (error) {
      console.error('❌ Error firmando mensaje:', error);
      this.emit('messageSignError', { error, message, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Verificar estado de conexión
   */
  public isReady(): boolean {
    return this.isInitialized && this.isConnected;
  }

  /**
   * Obtener estadísticas del servicio
   */
  public getStats(): BlockchainStats {
    return {
      isInitialized: this.isInitialized,
      isConnected: this.isConnected,
      currentNetwork: this.currentNetwork,
      accountsCount: this.accounts.length,
      queueLength: this.transactionQueue.length,
      isProcessingQueue: this.isProcessingQueue
    };
  }

  /**
   * Agregar event listener
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remover event listener
   */
  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en event listener para ${event}:`, error);
        }
      });
    }
  }

  /**
   * Limpiar recursos
   */
  public async shutdown(): Promise<void> {
    console.log('🔄 Cerrando BlockchainService...');
    
    this.transactionQueue = [];
    this.eventListeners.clear();
    this.isInitialized = false;
    this.isConnected = false;
    
    console.log('✅ BlockchainService cerrado');
  }
}

// Tipos de datos
export interface TransactionRequest {
  from: string;
  to?: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: string;
}

export interface Transaction {
  id: string;
  request: TransactionRequest;
  status: 'queued' | 'completed' | 'failed';
  timestamp: Date;
  retries: number;
  txHash?: string;
  error?: any;
}

export interface BlockchainStats {
  isInitialized: boolean;
  isConnected: boolean;
  currentNetwork: string;
  accountsCount: number;
  queueLength: number;
  isProcessingQueue: boolean;
} 