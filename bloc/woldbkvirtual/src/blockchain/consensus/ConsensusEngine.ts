/**
 * @fileoverview Motor de consenso para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/consensus/ConsensusEngine
 */

import { ethers } from 'ethers';
import { ConsensusNode, Block, Transaction, ValidatorInfo } from '../types';
import { Logger } from '../../utils/logger';

const logger = new Logger('ConsensusEngine');

export type ConsensusType = 'pos' | 'dpos' | 'pbft';

export interface ConsensusConfig {
  type: ConsensusType;
  validators: string[];
  minStake: string;
  blockReward: string;
  epochLength: number;
  maxValidators: number;
  consensusThreshold: number;
}

export interface ConsensusState {
  currentEpoch: number;
  activeValidators: ConsensusNode[];
  totalStake: string;
  lastBlockTime: number;
  averageBlockTime: number;
  consensusRate: number;
}

export class ConsensusEngine {
  private config: ConsensusConfig;
  private validators: Map<string, ConsensusNode> = new Map();
  private currentEpoch: number = 0;
  private lastBlockTime: number = Date.now();
  private blockTimes: number[] = [];
  private isRunning: boolean = false;

  constructor(type: ConsensusType, validators: string[]) {
    this.config = {
      type,
      validators,
      minStake: ethers.utils.parseEther('1000').toString(),
      blockReward: ethers.utils.parseEther('10').toString(),
      epochLength: 100,
      maxValidators: 21,
      consensusThreshold: 0.67
    };

    this.initializeValidators();
    logger.info(`Motor de consenso ${type.toUpperCase()} inicializado`);
  }

  /**
   * Inicializar validadores
   */
  private initializeValidators(): void {
    for (const address of this.config.validators) {
      const validator: ConsensusNode = {
        address,
        publicKey: '',
        stake: ethers.utils.parseEther('10000').toString(),
        reputation: 100,
        isActive: true,
        lastBlock: 0,
        uptime: 100
      };
      this.validators.set(address, validator);
    }
  }

  /**
   * Iniciar motor de consenso
   */
  async start(): Promise<void> {
    try {
      this.isRunning = true;
      
      // Iniciar epoch actual
      await this.startEpoch();
      
      // Iniciar monitoreo de validadores
      this.startValidatorMonitoring();
      
      logger.info('Motor de consenso iniciado');
      
    } catch (error: any) {
      logger.error('Error iniciando consenso:', error);
      throw error;
    }
  }

  /**
   * Detener motor de consenso
   */
  async stop(): Promise<void> {
    try {
      this.isRunning = false;
      logger.info('Motor de consenso detenido');
    } catch (error: any) {
      logger.error('Error deteniendo consenso:', error);
      throw error;
    }
  }

  /**
   * Iniciar epoch
   */
  private async startEpoch(): Promise<void> {
    this.currentEpoch++;
    
    // Seleccionar validadores para este epoch
    await this.selectValidators();
    
    // Distribuir recompensas del epoch anterior
    await this.distributeRewards();
    
    logger.info(`Epoch ${this.currentEpoch} iniciado`);
  }

  /**
   * Seleccionar validadores para el epoch
   */
  private async selectValidators(): Promise<void> {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive && ethers.BigNumber.from(v.stake).gte(this.config.minStake))
      .sort((a, b) => {
        // Ordenar por stake y reputación
        const aScore = ethers.BigNumber.from(a.stake).mul(a.reputation);
        const bScore = ethers.BigNumber.from(b.stake).mul(b.reputation);
        return bScore.sub(aScore).toNumber();
      })
      .slice(0, this.config.maxValidators);

    // Actualizar estado de validadores
    for (const validator of this.validators.values()) {
      validator.isActive = activeValidators.some(v => v.address === validator.address);
    }

    logger.info(`${activeValidators.length} validadores seleccionados para epoch ${this.currentEpoch}`);
  }

  /**
   * Distribuir recompensas
   */
  private async distributeRewards(): Promise<void> {
    if (this.currentEpoch <= 1) return;

    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive);

    const totalStake = activeValidators.reduce(
      (sum, v) => sum.add(ethers.BigNumber.from(v.stake)),
      ethers.BigNumber.from(0)
    );

    for (const validator of activeValidators) {
      const stakeRatio = ethers.BigNumber.from(validator.stake).mul(10000).div(totalStake);
      const reward = ethers.BigNumber.from(this.config.blockReward)
        .mul(stakeRatio)
        .div(10000);

      // Actualizar stake del validador
      validator.stake = ethers.BigNumber.from(validator.stake).add(reward).toString();
      
      logger.debug(`Recompensa distribuida a ${validator.address}: ${ethers.utils.formatEther(reward)}`);
    }
  }

  /**
   * Proponer bloque
   */
  async proposeBlock(transactions: Transaction[], proposerAddress: string): Promise<Block | null> {
    try {
      // Verificar que el proponente es un validador activo
      const validator = this.validators.get(proposerAddress);
      if (!validator || !validator.isActive) {
        logger.warn(`Proponente no autorizado: ${proposerAddress}`);
        return null;
      }

      // Crear bloque
      const block = await this.createBlock(transactions, proposerAddress);
      
      // Validar bloque
      if (!await this.validateBlock(block)) {
        logger.warn('Bloque propuesto inválido');
        return null;
      }

      // Actualizar estadísticas del validador
      validator.lastBlock = block.header.number;
      validator.uptime = Math.min(100, validator.uptime + 1);

      logger.info(`Bloque ${block.header.number} propuesto por ${proposerAddress}`);
      return block;

    } catch (error: any) {
      logger.error('Error proponiendo bloque:', error);
      return null;
    }
  }

  /**
   * Crear bloque
   */
  private async createBlock(transactions: Transaction[], miner: string): Promise<Block> {
    const timestamp = Date.now();
    const blockTime = timestamp - this.lastBlockTime;
    this.blockTimes.push(blockTime);
    
    // Mantener solo los últimos 100 tiempos de bloque
    if (this.blockTimes.length > 100) {
      this.blockTimes.shift();
    }

    const header = {
      number: 0, // Se establecerá después
      parentHash: '',
      timestamp,
      difficulty: await this.calculateDifficulty(),
      gasLimit: '30000000',
      gasUsed: '0',
      miner,
      extraData: `WoldVirtual3D Epoch:${this.currentEpoch}`,
      nonce: '0',
      hash: ''
    };

    const block: Block = {
      header,
      transactions,
      hash: ''
    };

    return block;
  }

  /**
   * Validar bloque
   */
  private async validateBlock(block: Block): Promise<boolean> {
    try {
      // Verificar timestamp
      const now = Date.now();
      if (Math.abs(now - block.header.timestamp) > 30000) { // 30 segundos
        return false;
      }

      // Verificar transacciones
      for (const tx of block.transactions) {
        if (!await this.validateTransaction(tx)) {
          return false;
        }
      }

      // Verificar límite de gas
      const totalGasUsed = block.transactions.reduce(
        (sum, tx) => sum.add(ethers.BigNumber.from(tx.gasLimit)),
        ethers.BigNumber.from(0)
      );

      if (totalGasUsed.gt(block.header.gasLimit)) {
        return false;
      }

      return true;

    } catch (error: any) {
      logger.error('Error validando bloque:', error);
      return false;
    }
  }

  /**
   * Validar transacción
   */
  private async validateTransaction(transaction: Transaction): Promise<boolean> {
    try {
      // Verificar firma
      if (!await this.verifyTransactionSignature(transaction)) {
        return false;
      }

      // Verificar nonce (simplificado)
      if (transaction.nonce < 0) {
        return false;
      }

      // Verificar gas
      if (ethers.BigNumber.from(transaction.gasLimit).isZero()) {
        return false;
      }

      return true;

    } catch (error: any) {
      logger.error('Error validando transacción:', error);
      return false;
    }
  }

  /**
   * Verificar firma de transacción
   */
  private async verifyTransactionSignature(transaction: Transaction): Promise<boolean> {
    try {
      // Implementación simplificada de verificación de firma
      return transaction.hash.length === 66 && transaction.hash.startsWith('0x');
    } catch {
      return false;
    }
  }

  /**
   * Calcular dificultad
   */
  private async calculateDifficulty(): Promise<string> {
    if (this.blockTimes.length < 10) {
      return '1000000';
    }

    const averageBlockTime = this.blockTimes.reduce((sum, time) => sum + time, 0) / this.blockTimes.length;
    const targetBlockTime = 15000; // 15 segundos

    let difficulty = ethers.BigNumber.from('1000000');

    if (averageBlockTime < targetBlockTime * 0.8) {
      difficulty = difficulty.mul(11).div(10); // Aumentar 10%
    } else if (averageBlockTime > targetBlockTime * 1.2) {
      difficulty = difficulty.mul(9).div(10); // Disminuir 10%
    }

    return difficulty.toString();
  }

  /**
   * Obtener validador para el siguiente bloque
   */
  async getNextValidator(blockNumber: number): Promise<string | null> {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive);

    if (activeValidators.length === 0) {
      return null;
    }

    // Algoritmo de selección basado en stake y reputación
    const totalWeight = activeValidators.reduce(
      (sum, v) => sum.add(ethers.BigNumber.from(v.stake).mul(v.reputation)),
      ethers.BigNumber.from(0)
    );

    let random = ethers.BigNumber.from(ethers.utils.randomBytes(32)).mod(totalWeight);
    
    for (const validator of activeValidators) {
      const weight = ethers.BigNumber.from(validator.stake).mul(validator.reputation);
      if (random.lt(weight)) {
        return validator.address;
      }
      random = random.sub(weight);
    }

    return activeValidators[0].address;
  }

  /**
   * Agregar validador
   */
  async addValidator(address: string, stake: string): Promise<boolean> {
    try {
      if (this.validators.has(address)) {
        logger.warn(`Validador ya existe: ${address}`);
        return false;
      }

      if (ethers.BigNumber.from(stake).lt(this.config.minStake)) {
        logger.warn(`Stake insuficiente para ${address}`);
        return false;
      }

      const validator: ConsensusNode = {
        address,
        publicKey: '',
        stake,
        reputation: 50, // Reputación inicial
        isActive: false,
        lastBlock: 0,
        uptime: 0
      };

      this.validators.set(address, validator);
      
      logger.info(`Validador agregado: ${address} con stake ${ethers.utils.formatEther(stake)}`);
      return true;

    } catch (error: any) {
      logger.error('Error agregando validador:', error);
      return false;
    }
  }

  /**
   * Remover validador
   */
  async removeValidator(address: string): Promise<boolean> {
    try {
      const validator = this.validators.get(address);
      if (!validator) {
        logger.warn(`Validador no encontrado: ${address}`);
        return false;
      }

      validator.isActive = false;
      
      logger.info(`Validador removido: ${address}`);
      return true;

    } catch (error: any) {
      logger.error('Error removiendo validador:', error);
      return false;
    }
  }

  /**
   * Actualizar stake de validador
   */
  async updateValidatorStake(address: string, newStake: string): Promise<boolean> {
    try {
      const validator = this.validators.get(address);
      if (!validator) {
        logger.warn(`Validador no encontrado: ${address}`);
        return false;
      }

      validator.stake = newStake;
      
      // Verificar si cumple con el stake mínimo
      if (ethers.BigNumber.from(newStake).lt(this.config.minStake)) {
        validator.isActive = false;
      }

      logger.info(`Stake actualizado para ${address}: ${ethers.utils.formatEther(newStake)}`);
      return true;

    } catch (error: any) {
      logger.error('Error actualizando stake:', error);
      return false;
    }
  }

  /**
   * Obtener información de validadores
   */
  getValidators(): ValidatorInfo[] {
    return Array.from(this.validators.values()).map(v => ({
      address: v.address,
      name: `Validator-${v.address.slice(0, 8)}`,
      description: 'WoldVirtual3D Validator',
      website: '',
      commission: 0.1, // 10%
      totalStake: v.stake,
      selfStake: v.stake,
      delegatorCount: 0,
      isActive: v.isActive,
      uptime: v.uptime,
      lastBlock: v.lastBlock
    }));
  }

  /**
   * Obtener estado del consenso
   */
  getConsensusState(): ConsensusState {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive);

    const totalStake = activeValidators.reduce(
      (sum, v) => sum.add(ethers.BigNumber.from(v.stake)),
      ethers.BigNumber.from(0)
    );

    const averageBlockTime = this.blockTimes.length > 0
      ? this.blockTimes.reduce((sum, time) => sum + time, 0) / this.blockTimes.length
      : 0;

    return {
      currentEpoch: this.currentEpoch,
      activeValidators,
      totalStake: totalStake.toString(),
      lastBlockTime: this.lastBlockTime,
      averageBlockTime,
      consensusRate: activeValidators.length / this.config.maxValidators
    };
  }

  /**
   * Obtener hashrate de la red
   */
  async getHashrate(): Promise<string> {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive);

    // Simular hashrate basado en número de validadores y stake
    const totalStake = activeValidators.reduce(
      (sum, v) => sum.add(ethers.BigNumber.from(v.stake)),
      ethers.BigNumber.from(0)
    );

    const hashrate = totalStake.div(ethers.utils.parseEther('1000')).toNumber() * 1000;
    return `${hashrate} H/s`;
  }

  /**
   * Monitorear validadores
   */
  private startValidatorMonitoring(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      const now = Date.now();
      for (const validator of this.validators.values()) {
        // Verificar uptime
        if (validator.isActive && now - validator.lastBlock > 300000) { // 5 minutos
          validator.uptime = Math.max(0, validator.uptime - 5);
          
          if (validator.uptime < 50) {
            validator.isActive = false;
            logger.warn(`Validador ${validator.address} desactivado por bajo uptime`);
          }
        }
      }
    }, 60000); // Cada minuto
  }

  /**
   * Verificar si el consenso está funcionando
   */
  isConsensusRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Obtener configuración del consenso
   */
  getConfig(): ConsensusConfig {
    return this.config;
  }
}

export default ConsensusEngine; 