/**
 * Integración Blockchain del Metaverso
 * 
 * Proporciona funcionalidades para interactuar con blockchain,
 * incluyendo registro de entidades, verificación de propiedad
 * y sincronización de datos.
 */

import { ethers } from 'ethers';
import { Entity, BlockchainConfig, BlockchainMetadata } from '../types';
import { ValidationError } from '../types';

/**
 * Integración con blockchain
 */
export class BlockchainIntegration {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contract?: ethers.Contract;
  private config: BlockchainConfig;
  private pendingTransactions: Map<string, PendingTransaction> = new Map();

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.provider);
  }

  /**
   * Conectar wallet
   */
  async connect(privateKey?: string): Promise<void> {
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else {
      // Intentar conectar con MetaMask
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = new ethers.BrowserProvider(window.ethereum).getSigner();
      } else {
        throw new Error('No se pudo conectar con wallet');
      }
    }
  }

  /**
   * Registrar entidad en blockchain
   */
  async registerEntity(entity: Entity): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    if (!this.contract) {
      await this.deployContract();
    }

    const tx = await this.contract!.registerEntity(
      entity.id,
      entity.type,
      entity.uri,
      this.serializeMetadata(entity.metadata),
      {
        gasLimit: this.config.gasLimit
      }
    );

    const receipt = await tx.wait();
    
    // Actualizar metadatos de blockchain
    const blockchainMetadata: BlockchainMetadata = {
      network: this.config.network,
      contractAddress: this.contract!.target as string,
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      verified: true
    };

    return tx.hash;
  }

  /**
   * Actualizar entidad en blockchain
   */
  async updateEntity(entity: Entity): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    if (!this.contract) {
      throw new Error('Contrato no desplegado');
    }

    const tx = await this.contract.updateEntity(
      entity.id,
      this.serializeMetadata(entity.metadata),
      {
        gasLimit: this.config.gasLimit
      }
    );

    const receipt = await tx.wait();
    return tx.hash;
  }

  /**
   * Eliminar entidad de blockchain
   */
  async deleteEntity(entityId: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    if (!this.contract) {
      throw new Error('Contrato no desplegado');
    }

    const tx = await this.contract.deleteEntity(entityId, {
      gasLimit: this.config.gasLimit
    });

    const receipt = await tx.wait();
    return tx.hash;
  }

  /**
   * Verificar propiedad de entidad
   */
  async verifyOwnership(entityId: string, userAddress: string): Promise<boolean> {
    if (!this.contract) {
      return false;
    }

    try {
      const owner = await this.contract.getEntityOwner(entityId);
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('Error verificando propiedad:', error);
      return false;
    }
  }

  /**
   * Obtener entidades pendientes
   */
  async getPendingEntities(): Promise<Entity[]> {
    if (!this.contract) {
      return [];
    }

    try {
      const pendingCount = await this.contract.getPendingEntityCount();
      const entities: Entity[] = [];

      for (let i = 0; i < pendingCount; i++) {
        const entityData = await this.contract.getPendingEntity(i);
        const entity = this.deserializeEntity(entityData);
        entities.push(entity);
      }

      return entities;
    } catch (error) {
      console.error('Error obteniendo entidades pendientes:', error);
      return [];
    }
  }

  /**
   * Obtener entidad de blockchain
   */
  async getEntityFromBlockchain(entityId: string): Promise<Entity | null> {
    if (!this.contract) {
      return null;
    }

    try {
      const entityData = await this.contract.getEntity(entityId);
      return this.deserializeEntity(entityData);
    } catch (error) {
      console.error('Error obteniendo entidad de blockchain:', error);
      return null;
    }
  }

  /**
   * Transferir propiedad de entidad
   */
  async transferOwnership(
    entityId: string, 
    fromAddress: string, 
    toAddress: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    if (!this.contract) {
      throw new Error('Contrato no desplegado');
    }

    // Verificar que el remitente es el propietario
    const isOwner = await this.verifyOwnership(entityId, fromAddress);
    if (!isOwner) {
      throw new Error('No eres el propietario de esta entidad');
    }

    const tx = await this.contract.transferEntityOwnership(
      entityId,
      toAddress,
      {
        gasLimit: this.config.gasLimit
      }
    );

    const receipt = await tx.wait();
    return tx.hash;
  }

  /**
   * Obtener historial de transacciones
   */
  async getTransactionHistory(entityId: string): Promise<TransactionHistory[]> {
    if (!this.contract) {
      return [];
    }

    try {
      const filter = this.contract.filters.EntityEvent(entityId);
      const events = await this.contract.queryFilter(filter);

      return events.map(event => ({
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        event: event.event,
        args: event.args,
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de blockchain
   */
  getStats(): Record<string, unknown> {
    return {
      network: this.config.network,
      contractAddress: this.contract?.target,
      pendingTransactions: this.pendingTransactions.size,
      connected: !!this.signer,
      provider: this.config.provider
    };
  }

  /**
   * Verificar estado de transacción
   */
  async checkTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending', confirmations: 0 };
      }

      const confirmations = receipt.confirmations;
      const status = confirmations >= this.config.confirmations ? 'confirmed' : 'pending';

      return {
        status,
        confirmations,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private async deployContract(): Promise<void> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    // ABI del contrato (simplificado)
    const abi = [
      'function registerEntity(string entityId, string entityType, string uri, string metadata) external',
      'function updateEntity(string entityId, string metadata) external',
      'function deleteEntity(string entityId) external',
      'function getEntityOwner(string entityId) external view returns (address)',
      'function getEntity(string entityId) external view returns (tuple)',
      'function getPendingEntityCount() external view returns (uint256)',
      'function getPendingEntity(uint256 index) external view returns (tuple)',
      'function transferEntityOwnership(string entityId, address newOwner) external',
      'event EntityEvent(string entityId, string eventType, address owner)'
    ];

    // Bytecode del contrato (simplificado)
    const bytecode = '0x...'; // Aquí iría el bytecode real del contrato

    const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    this.contract = contract;
  }

  private serializeMetadata(metadata: any): string {
    return JSON.stringify(metadata);
  }

  private deserializeEntity(entityData: any): Entity {
    // Convertir datos de blockchain a entidad
    return {
      id: entityData.entityId,
      type: entityData.entityType,
      uri: entityData.uri,
      state: {
        active: true,
        visible: true,
        locked: false,
        synced: true,
        lastModified: new Date(),
        version: '1.0.0'
      },
      metadata: JSON.parse(entityData.metadata),
      components: {},
      parent: undefined,
      children: []
    };
  }
}

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

interface PendingTransaction {
  hash: string;
  entityId: string;
  type: 'register' | 'update' | 'delete';
  timestamp: Date;
  retries: number;
}

interface TransactionHistory {
  transactionHash: string;
  blockNumber: number;
  event: string;
  args: any[];
  timestamp: Date;
}

interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

// Extender Window para MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
} 