/**
 * @fileoverview Gestor de estado para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/state/StateManager
 */

import { ethers } from 'ethers';
import { Block, Transaction, TransactionReceipt, Log, SmartContract } from '../types';
import { Logger } from '../../utils/logger';

const logger = new Logger('StateManager');

export interface AccountState {
  balance: string;
  nonce: number;
  code: string;
  storage: Map<string, string>;
}

export interface StateSnapshot {
  blockNumber: number;
  accounts: Map<string, AccountState>;
  contracts: Map<string, SmartContract>;
  receipts: Map<string, TransactionReceipt>;
  timestamp: number;
}

export class StateManager {
  private accounts: Map<string, AccountState> = new Map();
  private contracts: Map<string, SmartContract> = new Map();
  private blocks: Map<number, Block> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private receipts: Map<string, TransactionReceipt> = new Map();
  private logs: Log[] = [];
  private snapshots: StateSnapshot[] = [];
  private currentBlockNumber: number = 0;
  private gasPrice: string = ethers.utils.parseUnits('20', 'gwei').toString();

  constructor() {
    logger.info('Gestor de estado inicializado');
  }

  /**
   * Inicializar estado con bloque génesis
   */
  async initialize(genesisBlock: Block): Promise<void> {
    try {
      // Establecer bloque génesis
      this.blocks.set(0, genesisBlock);
      this.currentBlockNumber = 0;

      // Crear cuenta para el minero del bloque génesis
      const minerAccount: AccountState = {
        balance: ethers.utils.parseEther('1000000').toString(), // 1M tokens iniciales
        nonce: 0,
        code: '',
        storage: new Map()
      };
      this.accounts.set(genesisBlock.header.miner, minerAccount);

      // Crear snapshot inicial
      await this.createSnapshot(0);

      logger.info('Estado inicializado con bloque génesis');
      
    } catch (error: any) {
      logger.error('Error inicializando estado:', error);
      throw error;
    }
  }

  /**
   * Obtener balance de una cuenta
   */
  async getBalance(address: string): Promise<string> {
    const account = this.accounts.get(address);
    return account ? account.balance : '0';
  }

  /**
   * Obtener nonce de una cuenta
   */
  async getNonce(address: string): Promise<number> {
    const account = this.accounts.get(address);
    return account ? account.nonce : 0;
  }

  /**
   * Incrementar nonce de una cuenta
   */
  async incrementNonce(address: string): Promise<void> {
    const account = this.accounts.get(address);
    if (account) {
      account.nonce++;
    } else {
      // Crear cuenta si no existe
      this.accounts.set(address, {
        balance: '0',
        nonce: 1,
        code: '',
        storage: new Map()
      });
    }
  }

  /**
   * Transferir tokens entre cuentas
   */
  async transfer(from: string, to: string, amount: string): Promise<boolean> {
    try {
      const fromAccount = this.accounts.get(from);
      const toAccount = this.accounts.get(to);

      if (!fromAccount) {
        logger.warn(`Cuenta origen no encontrada: ${from}`);
        return false;
      }

      const fromBalance = ethers.BigNumber.from(fromAccount.balance);
      const transferAmount = ethers.BigNumber.from(amount);

      if (fromBalance.lt(transferAmount)) {
        logger.warn(`Saldo insuficiente en ${from}`);
        return false;
      }

      // Actualizar balance de origen
      fromAccount.balance = fromBalance.sub(transferAmount).toString();

      // Actualizar balance de destino
      if (toAccount) {
        toAccount.balance = ethers.BigNumber.from(toAccount.balance).add(transferAmount).toString();
      } else {
        // Crear cuenta destino si no existe
        this.accounts.set(to, {
          balance: amount,
          nonce: 0,
          code: '',
          storage: new Map()
        });
      }

      logger.debug(`Transferencia: ${ethers.utils.formatEther(amount)} de ${from} a ${to}`);
      return true;

    } catch (error: any) {
      logger.error('Error en transferencia:', error);
      return false;
    }
  }

  /**
   * Agregar bloque al estado
   */
  async addBlock(block: Block): Promise<void> {
    try {
      this.blocks.set(block.header.number, block);
      this.currentBlockNumber = block.header.number;

      // Procesar transacciones del bloque
      for (let i = 0; i < block.transactions.length; i++) {
        const tx = block.transactions[i];
        await this.processTransaction(tx, block.header.number, i);
      }

      // Crear snapshot
      await this.createSnapshot(block.header.number);

      // Limpiar snapshots antiguos (mantener solo los últimos 100)
      if (this.snapshots.length > 100) {
        this.snapshots = this.snapshots.slice(-100);
      }

      logger.info(`Bloque ${block.header.number} agregado al estado`);

    } catch (error: any) {
      logger.error('Error agregando bloque:', error);
      throw error;
    }
  }

  /**
   * Procesar transacción
   */
  private async processTransaction(
    transaction: Transaction, 
    blockNumber: number, 
    transactionIndex: number
  ): Promise<void> {
    try {
      // Ejecutar transacción
      const receipt = await this.executeTransaction(transaction, blockNumber, transactionIndex);
      
      // Guardar transacción y receipt
      this.transactions.set(transaction.hash, transaction);
      this.receipts.set(transaction.hash, receipt);

      // Agregar logs
      this.logs.push(...receipt.logs);

    } catch (error: any) {
      logger.error(`Error procesando transacción ${transaction.hash}:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar transacción
   */
  private async executeTransaction(
    transaction: Transaction, 
    blockNumber: number, 
    transactionIndex: number
  ): Promise<TransactionReceipt> {
    const gasUsed = ethers.BigNumber.from(transaction.gasLimit);
    const gasPrice = ethers.BigNumber.from(transaction.gasPrice);
    const gasCost = gasUsed.mul(gasPrice);

    // Transferir valor
    if (ethers.BigNumber.from(transaction.value).gt(0)) {
      await this.transfer(transaction.from, transaction.to, transaction.value);
    }

    // Cobrar gas
    await this.transfer(transaction.from, transaction.to, gasCost.toString());

    // Ejecutar código si es una llamada a contrato
    let contractAddress: string | undefined;
    let logs: Log[] = [];

    if (transaction.data && transaction.data !== '0x') {
      const result = await this.executeContractCode(transaction);
      contractAddress = result.contractAddress;
      logs = result.logs;
    }

    const receipt: TransactionReceipt = {
      transactionHash: transaction.hash,
      blockNumber,
      blockHash: '', // Se establecerá después
      from: transaction.from,
      to: transaction.to,
      gasUsed: gasUsed.toString(),
      gasPrice: gasPrice.toString(),
      cumulativeGasUsed: gasUsed.toString(),
      status: true,
      logs,
      contractAddress
    };

    return receipt;
  }

  /**
   * Ejecutar código de contrato
   */
  private async executeContractCode(transaction: Transaction): Promise<{
    contractAddress?: string;
    logs: Log[];
  }> {
    try {
      // Parsear datos de la transacción
      const data = JSON.parse(transaction.data);
      
      // Ejecutar método del contrato
      switch (data.method) {
        case 'deployContract':
          return await this.deployContract(transaction, data);
        case 'callContract':
          return await this.callContract(transaction, data);
        default:
          logger.warn(`Método de contrato desconocido: ${data.method}`);
          return { logs: [] };
      }

    } catch (error: any) {
      logger.error('Error ejecutando código de contrato:', error);
      return { logs: [] };
    }
  }

  /**
   * Desplegar contrato
   */
  private async deployContract(transaction: Transaction, data: any): Promise<{
    contractAddress: string;
    logs: Log[];
  }> {
    // Generar dirección del contrato
    const contractAddress = ethers.utils.getContractAddress({
      from: transaction.from,
      nonce: transaction.nonce
    });

    // Crear contrato
    const contract: SmartContract = {
      address: contractAddress,
      name: data.name || 'Unknown Contract',
      abi: data.abi || [],
      bytecode: data.bytecode || '',
      owner: transaction.from,
      balance: '0',
      methods: data.methods || [],
      events: data.events || [],
      createdAt: Date.now()
    };

    this.contracts.set(contractAddress, contract);

    // Crear cuenta para el contrato
    this.accounts.set(contractAddress, {
      balance: '0',
      nonce: 0,
      code: data.bytecode || '',
      storage: new Map()
    });

    const log: Log = {
      address: contractAddress,
      topics: [ethers.utils.id('ContractCreated(address,string)')],
      data: ethers.utils.defaultAbiCoder.encode(
        ['address', 'string'],
        [contractAddress, contract.name]
      ),
      blockNumber: 0, // Se establecerá después
      transactionHash: transaction.hash,
      transactionIndex: 0,
      blockHash: '',
      logIndex: 0,
      removed: false
    };

    logger.info(`Contrato desplegado: ${contractAddress}`);
    return { contractAddress, logs: [log] };
  }

  /**
   * Llamar contrato
   */
  private async callContract(transaction: Transaction, data: any): Promise<{
    logs: Log[];
  }> {
    const contract = this.contracts.get(transaction.to);
    if (!contract) {
      logger.warn(`Contrato no encontrado: ${transaction.to}`);
      return { logs: [] };
    }

    // Ejecutar método del contrato
    const method = contract.methods.find(m => m.name === data.methodName);
    if (!method) {
      logger.warn(`Método no encontrado: ${data.methodName}`);
      return { logs: [] };
    }

    // Simular ejecución del método
    const log: Log = {
      address: transaction.to,
      topics: [ethers.utils.id(`${data.methodName}(address,uint256)`)],
      data: ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256'],
        [transaction.from, data.value || 0]
      ),
      blockNumber: 0,
      transactionHash: transaction.hash,
      transactionIndex: 0,
      blockHash: '',
      logIndex: 0,
      removed: false
    };

    logger.debug(`Método ${data.methodName} ejecutado en contrato ${transaction.to}`);
    return { logs: [log] };
  }

  /**
   * Obtener bloque por número
   */
  async getBlock(blockNumber: number): Promise<Block | null> {
    return this.blocks.get(blockNumber) || null;
  }

  /**
   * Obtener transacción por hash
   */
  async getTransaction(hash: string): Promise<Transaction | null> {
    return this.transactions.get(hash) || null;
  }

  /**
   * Obtener receipt de transacción
   */
  async getTransactionReceipt(hash: string): Promise<TransactionReceipt | null> {
    return this.receipts.get(hash) || null;
  }

  /**
   * Obtener logs
   */
  async getLogs(filter: {
    fromBlock?: number;
    toBlock?: number;
    address?: string;
    topics?: string[];
  }): Promise<Log[]> {
    let filteredLogs = this.logs;

    if (filter.fromBlock !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.blockNumber >= filter.fromBlock!);
    }

    if (filter.toBlock !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.blockNumber <= filter.toBlock!);
    }

    if (filter.address) {
      filteredLogs = filteredLogs.filter(log => log.address.toLowerCase() === filter.address!.toLowerCase());
    }

    if (filter.topics && filter.topics.length > 0) {
      filteredLogs = filteredLogs.filter(log => 
        filter.topics!.some(topic => log.topics.includes(topic))
      );
    }

    return filteredLogs;
  }

  /**
   * Obtener contrato por dirección
   */
  async getContract(address: string): Promise<SmartContract | null> {
    return this.contracts.get(address) || null;
  }

  /**
   * Obtener todos los contratos
   */
  async getAllContracts(): Promise<SmartContract[]> {
    return Array.from(this.contracts.values());
  }

  /**
   * Obtener precio del gas
   */
  async getGasPrice(): Promise<string> {
    return this.gasPrice;
  }

  /**
   * Actualizar precio del gas
   */
  async updateGasPrice(newPrice: string): Promise<void> {
    this.gasPrice = newPrice;
    logger.debug(`Precio del gas actualizado: ${ethers.utils.formatUnits(newPrice, 'gwei')} gwei`);
  }

  /**
   * Crear snapshot del estado
   */
  private async createSnapshot(blockNumber: number): Promise<void> {
    const snapshot: StateSnapshot = {
      blockNumber,
      accounts: new Map(this.accounts),
      contracts: new Map(this.contracts),
      receipts: new Map(this.receipts),
      timestamp: Date.now()
    };

    this.snapshots.push(snapshot);
  }

  /**
   * Revertir a snapshot
   */
  async revertToSnapshot(blockNumber: number): Promise<boolean> {
    const snapshot = this.snapshots.find(s => s.blockNumber === blockNumber);
    if (!snapshot) {
      logger.warn(`Snapshot no encontrado para bloque ${blockNumber}`);
      return false;
    }

    this.accounts = new Map(snapshot.accounts);
    this.contracts = new Map(snapshot.contracts);
    this.receipts = new Map(snapshot.receipts);
    this.currentBlockNumber = blockNumber;

    logger.info(`Estado revertido al bloque ${blockNumber}`);
    return true;
  }

  /**
   * Obtener estadísticas del estado
   */
  async getStateStats(): Promise<{
    totalAccounts: number;
    totalContracts: number;
    totalTransactions: number;
    totalBlocks: number;
    totalSupply: string;
  }> {
    const totalSupply = Array.from(this.accounts.values()).reduce(
      (sum, account) => sum.add(ethers.BigNumber.from(account.balance)),
      ethers.BigNumber.from(0)
    );

    return {
      totalAccounts: this.accounts.size,
      totalContracts: this.contracts.size,
      totalTransactions: this.transactions.size,
      totalBlocks: this.blocks.size,
      totalSupply: totalSupply.toString()
    };
  }

  /**
   * Obtener número de bloque actual
   */
  getCurrentBlockNumber(): number {
    return this.currentBlockNumber;
  }

  /**
   * Verificar si una dirección es un contrato
   */
  async isContract(address: string): Promise<boolean> {
    return this.contracts.has(address);
  }

  /**
   * Obtener código de una cuenta
   */
  async getCode(address: string): Promise<string> {
    const account = this.accounts.get(address);
    return account ? account.code : '';
  }

  /**
   * Obtener almacenamiento de una cuenta
   */
  async getStorage(address: string, key: string): Promise<string> {
    const account = this.accounts.get(address);
    if (!account) return '0x0000000000000000000000000000000000000000000000000000000000000000';
    return account.storage.get(key) || '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Establecer almacenamiento de una cuenta
   */
  async setStorage(address: string, key: string, value: string): Promise<void> {
    let account = this.accounts.get(address);
    if (!account) {
      account = {
        balance: '0',
        nonce: 0,
        code: '',
        storage: new Map()
      };
      this.accounts.set(address, account);
    }
    account.storage.set(key, value);
  }

  /**
   * Limpiar estado
   */
  async clear(): Promise<void> {
    this.accounts.clear();
    this.contracts.clear();
    this.blocks.clear();
    this.transactions.clear();
    this.receipts.clear();
    this.logs = [];
    this.snapshots = [];
    this.currentBlockNumber = 0;
    
    logger.info('Estado limpiado');
  }

  /**
   * Cerrar gestor de estado
   */
  async shutdown(): Promise<void> {
    try {
      // Guardar estado final
      await this.createSnapshot(this.currentBlockNumber);
      
      logger.info('Gestor de estado cerrado');
    } catch (error: any) {
      logger.error('Error cerrando gestor de estado:', error);
    }
  }
}

export default StateManager; 