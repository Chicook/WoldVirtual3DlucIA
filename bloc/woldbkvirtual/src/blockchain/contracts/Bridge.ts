/**
 * @fileoverview Puente entre Binance Smart Chain y WoldVirtual3D Blockchain
 * @module woldbkvirtual/src/blockchain/contracts/Bridge
 */

import { StateManager } from '../state/StateManager';
import { WCVToken } from './WCVToken';
import { Logger } from '../../utils/logger';

const logger = new Logger('Bridge');

export interface BridgeTransfer {
  id: string;
  from: string;
  to: string;
  amount: string;
  sourceChain: 'BSC' | 'WOLDVIRTUAL';
  targetChain: 'BSC' | 'WOLDVIRTUAL';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  timestamp: number;
  transactionHash: string;
  confirmationHash?: string;
  fee: string;
}

export interface BridgeConfig {
  bscContractAddress: string;
  woldvirtualContractAddress: string;
  minTransferAmount: string;
  maxTransferAmount: string;
  dailyLimit: string;
  transferFee: string;
  confirmationBlocks: {
    bsc: number;
    woldvirtual: number;
  };
}

export class Bridge {
  private stateManager: StateManager;
  private wcvToken: WCVToken;
  private contractAddress: string;
  private config: BridgeConfig;
  private transfers: Map<string, BridgeTransfer> = new Map();
  private dailyTransfers: Map<string, number> = new Map();
  private totalTransfers: number = 0;
  private totalVolume: string = '0';

  constructor(stateManager: StateManager, wcvToken: WCVToken) {
    this.stateManager = stateManager;
    this.wcvToken = wcvToken;
    this.contractAddress = this.generateContractAddress();
    
    this.config = {
      bscContractAddress: '0x053532E91FFD6b8a21C925Da101C909A01106BBE',
      woldvirtualContractAddress: wcvToken.getAddress(),
      minTransferAmount: '1000', // 1 WCV
      maxTransferAmount: '1000000000', // 1M WCV
      dailyLimit: '10000000000', // 10M WCV
      transferFee: '100', // 0.1 WCV
      confirmationBlocks: {
        bsc: 15,
        woldvirtual: 5
      }
    };
    
    logger.info('Puente BSC ↔ WoldVirtual3D inicializado');
  }

  /**
   * Generar dirección del contrato
   */
  private generateContractAddress(): string {
    const timestamp = Date.now().toString();
    const hash = timestamp.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    return '0x' + hash.padEnd(40, '0').slice(0, 40);
  }

  /**
   * Inicializar puente
   */
  async initialize(): Promise<void> {
    try {
      // Crear cuenta para el contrato
      await this.stateManager.setStorage(
        this.contractAddress,
        'totalTransfers',
        '0'
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalVolume',
        '0'
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'config',
        JSON.stringify(this.config)
      );

      logger.info('Puente inicializado');
      
    } catch (error: any) {
      logger.error('Error inicializando puente:', error);
      throw error;
    }
  }

  /**
   * Transferir tokens de BSC a WoldVirtual3D
   */
  async transferFromBSC(
    from: string,
    to: string,
    amount: string,
    transactionHash: string
  ): Promise<string> {
    try {
      // Validar transferencia
      if (!this.validateTransfer(from, to, amount)) {
        throw new Error('Transferencia inválida');
      }

      // Verificar límite diario
      if (!this.checkDailyLimit(amount)) {
        throw new Error('Límite diario excedido');
      }

      // Crear transferencia
      const transferId = this.generateTransferId(from, to, amount, 'BSC');
      const fee = this.calculateFee(amount);
      const netAmount = (parseInt(amount) - parseInt(fee)).toString();

      const transfer: BridgeTransfer = {
        id: transferId,
        from,
        to,
        amount: netAmount,
        sourceChain: 'BSC',
        targetChain: 'WOLDVIRTUAL',
        status: 'PENDING',
        timestamp: Date.now(),
        transactionHash,
        fee
      };

      // Guardar transferencia
      this.transfers.set(transferId, transfer);
      this.totalTransfers++;
      this.updateDailyTransfers(amount);

      // Actualizar en blockchain
      await this.stateManager.setStorage(
        this.contractAddress,
        `transfer:${transferId}`,
        JSON.stringify(transfer)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalTransfers',
        this.totalTransfers.toString()
      );

      // Emitir evento
      this.emitBridgeEvent('TransferInitiated', {
        transferId,
        from,
        to,
        amount: netAmount,
        sourceChain: 'BSC',
        targetChain: 'WOLDVIRTUAL',
        fee
      });

      logger.info(`Transferencia iniciada desde BSC: ${transferId}`);
      return transferId;

    } catch (error: any) {
      logger.error('Error iniciando transferencia desde BSC:', error);
      throw error;
    }
  }

  /**
   * Transferir tokens de WoldVirtual3D a BSC
   */
  async transferToBSC(
    from: string,
    to: string,
    amount: string,
    transactionHash: string
  ): Promise<string> {
    try {
      // Validar transferencia
      if (!this.validateTransfer(from, to, amount)) {
        throw new Error('Transferencia inválida');
      }

      // Verificar balance en WoldVirtual3D
      const balance = await this.wcvToken.getBalance(from);
      const balanceNum = parseInt(balance);
      const amountNum = parseInt(amount);
      const fee = parseInt(this.calculateFee(amount));
      const totalRequired = amountNum + fee;

      if (balanceNum < totalRequired) {
        throw new Error('Saldo insuficiente en WoldVirtual3D');
      }

      // Verificar límite diario
      if (!this.checkDailyLimit(amount)) {
        throw new Error('Límite diario excedido');
      }

      // Quemar tokens en WoldVirtual3D
      await this.wcvToken.burn(from, totalRequired.toString(), transactionHash);

      // Crear transferencia
      const transferId = this.generateTransferId(from, to, amount, 'WOLDVIRTUAL');
      
      const transfer: BridgeTransfer = {
        id: transferId,
        from,
        to,
        amount,
        sourceChain: 'WOLDVIRTUAL',
        targetChain: 'BSC',
        status: 'PENDING',
        timestamp: Date.now(),
        transactionHash,
        fee: fee.toString()
      };

      // Guardar transferencia
      this.transfers.set(transferId, transfer);
      this.totalTransfers++;
      this.updateDailyTransfers(amount);

      // Actualizar en blockchain
      await this.stateManager.setStorage(
        this.contractAddress,
        `transfer:${transferId}`,
        JSON.stringify(transfer)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalTransfers',
        this.totalTransfers.toString()
      );

      // Emitir evento
      this.emitBridgeEvent('TransferInitiated', {
        transferId,
        from,
        to,
        amount,
        sourceChain: 'WOLDVIRTUAL',
        targetChain: 'BSC',
        fee: fee.toString()
      });

      logger.info(`Transferencia iniciada hacia BSC: ${transferId}`);
      return transferId;

    } catch (error: any) {
      logger.error('Error iniciando transferencia hacia BSC:', error);
      throw error;
    }
  }

  /**
   * Confirmar transferencia desde BSC
   */
  async confirmTransferFromBSC(
    transferId: string,
    confirmationHash: string
  ): Promise<boolean> {
    try {
      const transfer = this.transfers.get(transferId);
      if (!transfer) {
        throw new Error('Transferencia no encontrada');
      }

      if (transfer.status !== 'PENDING') {
        throw new Error('Transferencia ya procesada');
      }

      if (transfer.sourceChain !== 'BSC') {
        throw new Error('Transferencia no es desde BSC');
      }

      // Actualizar estado
      transfer.status = 'PROCESSING';
      transfer.confirmationHash = confirmationHash;

      // Acuñar tokens en WoldVirtual3D
      const mintSuccess = await this.wcvToken.mint(
        transfer.to,
        transfer.amount,
        this.contractAddress,
        confirmationHash
      );

      if (mintSuccess) {
        transfer.status = 'COMPLETED';
        
        // Actualizar estadísticas
        this.totalVolume = (parseInt(this.totalVolume) + parseInt(transfer.amount)).toString();
        
        await this.stateManager.setStorage(
          this.contractAddress,
          'totalVolume',
          this.totalVolume
        );

        // Emitir evento
        this.emitBridgeEvent('TransferCompleted', {
          transferId,
          amount: transfer.amount,
          to: transfer.to
        });

        logger.info(`Transferencia confirmada desde BSC: ${transferId}`);
        return true;
      } else {
        transfer.status = 'FAILED';
        logger.error(`Error acuñando tokens para transferencia: ${transferId}`);
        return false;
      }

    } catch (error: any) {
      logger.error('Error confirmando transferencia desde BSC:', error);
      return false;
    }
  }

  /**
   * Validar transferencia
   */
  private validateTransfer(from: string, to: string, amount: string): boolean {
    const amountNum = parseInt(amount);
    const minAmount = parseInt(this.config.minTransferAmount);
    const maxAmount = parseInt(this.config.maxTransferAmount);

    if (amountNum < minAmount) {
      logger.warn(`Cantidad menor al mínimo: ${amount} < ${minAmount}`);
      return false;
    }

    if (amountNum > maxAmount) {
      logger.warn(`Cantidad mayor al máximo: ${amount} > ${maxAmount}`);
      return false;
    }

    if (from === to) {
      logger.warn('Dirección origen y destino son iguales');
      return false;
    }

    return true;
  }

  /**
   * Verificar límite diario
   */
  private checkDailyLimit(amount: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const dailyAmount = this.dailyTransfers.get(today) || 0;
    const amountNum = parseInt(amount);
    const limit = parseInt(this.config.dailyLimit);

    if (dailyAmount + amountNum > limit) {
      logger.warn(`Límite diario excedido: ${dailyAmount + amountNum} > ${limit}`);
      return false;
    }

    return true;
  }

  /**
   * Actualizar transferencias diarias
   */
  private updateDailyTransfers(amount: string): void {
    const today = new Date().toISOString().split('T')[0];
    const current = this.dailyTransfers.get(today) || 0;
    this.dailyTransfers.set(today, current + parseInt(amount));
  }

  /**
   * Calcular fee
   */
  private calculateFee(amount: string): string {
    const amountNum = parseInt(amount);
    const feeRate = parseInt(this.config.transferFee);
    return Math.max(feeRate, Math.floor(amountNum * 0.001)).toString(); // Mínimo 0.1 WCV o 0.1%
  }

  /**
   * Generar ID de transferencia
   */
  private generateTransferId(from: string, to: string, amount: string, sourceChain: string): string {
    const timestamp = Date.now().toString();
    const data = `${from}-${to}-${amount}-${sourceChain}-${timestamp}`;
    const hash = data.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    return hash.slice(0, 16);
  }

  /**
   * Obtener transferencia por ID
   */
  async getTransfer(transferId: string): Promise<BridgeTransfer | null> {
    try {
      // Buscar en caché local
      if (this.transfers.has(transferId)) {
        return this.transfers.get(transferId)!;
      }

      // Buscar en blockchain
      const transferData = await this.stateManager.getStorage(
        this.contractAddress,
        `transfer:${transferId}`
      );

      if (transferData && transferData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const transfer: BridgeTransfer = JSON.parse(transferData);
        this.transfers.set(transferId, transfer);
        return transfer;
      }

      return null;

    } catch (error: any) {
      logger.error(`Error obteniendo transferencia ${transferId}:`, error);
      return null;
    }
  }

  /**
   * Obtener transferencias de una dirección
   */
  async getTransfersByAddress(address: string): Promise<BridgeTransfer[]> {
    try {
      const transfers: BridgeTransfer[] = [];
      
      for (const transfer of this.transfers.values()) {
        if (transfer.from === address || transfer.to === address) {
          transfers.push(transfer);
        }
      }

      return transfers.sort((a, b) => b.timestamp - a.timestamp);

    } catch (error: any) {
      logger.error(`Error obteniendo transferencias de ${address}:`, error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del puente
   */
  async getBridgeStats(): Promise<{
    totalTransfers: number;
    totalVolume: string;
    dailyTransfers: { [date: string]: number };
    pendingTransfers: number;
    completedTransfers: number;
    failedTransfers: number;
  }> {
    try {
      let pendingTransfers = 0;
      let completedTransfers = 0;
      let failedTransfers = 0;

      for (const transfer of this.transfers.values()) {
        switch (transfer.status) {
          case 'PENDING':
          case 'PROCESSING':
            pendingTransfers++;
            break;
          case 'COMPLETED':
            completedTransfers++;
            break;
          case 'FAILED':
          case 'CANCELLED':
            failedTransfers++;
            break;
        }
      }

      const dailyTransfersObj: { [date: string]: number } = {};
      for (const [date, amount] of this.dailyTransfers) {
        dailyTransfersObj[date] = amount;
      }

      return {
        totalTransfers: this.totalTransfers,
        totalVolume: this.totalVolume,
        dailyTransfers: dailyTransfersObj,
        pendingTransfers,
        completedTransfers,
        failedTransfers
      };

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas del puente:', error);
      return {
        totalTransfers: 0,
        totalVolume: '0',
        dailyTransfers: {},
        pendingTransfers: 0,
        completedTransfers: 0,
        failedTransfers: 0
      };
    }
  }

  /**
   * Emitir evento del puente
   */
  private emitBridgeEvent(eventName: string, data: any): void {
    // En una implementación real, esto emitiría un evento en la blockchain
    logger.debug(`Evento emitido: ${eventName}`, data);
  }

  /**
   * Obtener dirección del contrato
   */
  getAddress(): string {
    return this.contractAddress;
  }

  /**
   * Obtener configuración del puente
   */
  getConfig(): BridgeConfig {
    return this.config;
  }
}

export default Bridge; 