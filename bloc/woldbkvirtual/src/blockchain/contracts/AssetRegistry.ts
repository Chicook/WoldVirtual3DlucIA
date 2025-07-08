/**
 * @fileoverview Registro de Assets para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/contracts/AssetRegistry
 */

import { Asset } from '../types';
import { StateManager } from '../state/StateManager';
import { Logger } from '../../utils/logger';

// Simulación de ethers para desarrollo
const ethers = {
  utils: {
    getAddress: (address: string) => address,
    keccak256: (data: string) => '0x' + data.split('').map(c => c.charCodeAt(0).toString(16)).join(''),
    toUtf8Bytes: (str: string) => str,
    defaultAbiCoder: {
      encode: (types: string[], values: any[]) => JSON.stringify({ types, values })
    },
    id: (str: string) => '0x' + str.split('').map(c => c.charCodeAt(0).toString(16)).join(''),
    formatEther: (wei: string) => wei,
    parseEther: (ether: string) => ether,
    randomBytes: (length: number) => Array.from({ length }, () => Math.floor(Math.random() * 256))
  },
  BigNumber: {
    from: (value: string | number) => ({
      toString: () => value.toString(),
      add: (other: any) => ({ toString: () => (Number(value) + Number(other)).toString() }),
      sub: (other: any) => ({ toString: () => (Number(value) - Number(other)).toString() }),
      mul: (other: any) => ({ toString: () => (Number(value) * Number(other)).toString() }),
      div: (other: any) => ({ toString: () => (Number(value) / Number(other)).toString() }),
      gt: (other: any) => Number(value) > Number(other),
      gte: (other: any) => Number(value) >= Number(other),
      lt: (other: any) => Number(value) < Number(other),
      lte: (other: any) => Number(value) <= Number(other),
      eq: (other: any) => Number(value) === Number(other),
      isZero: () => Number(value) === 0
    })
  }
};

const logger = new Logger('AssetRegistry');

export interface AssetMetadata {
  name: string;
  description: string;
  type: 'MODEL_3D' | 'TEXTURE' | 'ANIMATION' | 'SOUND';
  fileSize: number;
  fileFormat: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  tags: string[];
  category: string;
  version: string;
  license: string;
  attributes: { [key: string]: any };
}

export interface AssetTransfer {
  from: string;
  to: string;
  assetId: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

export class AssetRegistry {
  private stateManager: StateManager;
  private contractAddress: string;
  private assets: Map<string, Asset> = new Map();
  private transfers: AssetTransfer[] = [];
  private totalAssets: number = 0;
  private totalTransfers: number = 0;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.contractAddress = this.generateContractAddress();
    
    logger.info('Registro de Assets inicializado');
  }

  /**
   * Generar dirección del contrato
   */
  private generateContractAddress(): string {
    return ethers.utils.getAddress(
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('AssetRegistry' + Date.now())
      ).slice(0, 42)
    );
  }

  /**
   * Inicializar registro
   */
  async initialize(): Promise<void> {
    try {
      // Crear cuenta para el contrato
      await this.stateManager.setStorage(
        this.contractAddress,
        'totalAssets',
        '0'
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalTransfers',
        '0'
      );

      logger.info('Registro de Assets inicializado');
      
    } catch (error: any) {
      logger.error('Error inicializando AssetRegistry:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo asset
   */
  async registerAsset(assetData: any, ownerAddress: string): Promise<string> {
    try {
      // Generar ID único del asset
      const assetId = this.generateAssetId(assetData, ownerAddress);
      
      // Verificar que el asset no existe
      if (this.assets.has(assetId)) {
        throw new Error('Asset ya existe');
      }

      // Crear asset
      const asset: Asset = {
        id: assetId,
        name: assetData.name,
        description: assetData.description,
        type: assetData.type,
        owner: ownerAddress,
        metadata: assetData.metadata || {},
        ipfsHash: assetData.ipfsHash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPublic: assetData.isPublic || false,
        allowDownload: assetData.allowDownload || false,
        allowModification: assetData.allowModification || false,
        allowCommercialUse: assetData.allowCommercialUse || false,
        price: assetData.price || '0',
        tags: assetData.tags || []
      };

      // Guardar asset
      this.assets.set(assetId, asset);
      this.totalAssets++;

      // Actualizar estado en la blockchain
      await this.stateManager.setStorage(
        this.contractAddress,
        `asset:${assetId}`,
        JSON.stringify(asset)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalAssets',
        this.totalAssets.toString()
      );

      // Emitir evento
      this.emitAssetEvent('AssetRegistered', {
        assetId,
        owner: ownerAddress,
        name: asset.name,
        type: asset.type
      });

      logger.info(`Asset registrado: ${assetId} por ${ownerAddress}`);
      return assetId;

    } catch (error: any) {
      logger.error('Error registrando asset:', error);
      throw error;
    }
  }

  /**
   * Generar ID único para asset
   */
  private generateAssetId(assetData: any, ownerAddress: string): string {
    const data = `${ownerAddress}-${assetData.name}-${assetData.type}-${Date.now()}`;
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data)).slice(0, 34);
  }

  /**
   * Obtener asset por ID
   */
  async getAsset(assetId: string): Promise<Asset | null> {
    try {
      // Buscar en caché local
      if (this.assets.has(assetId)) {
        return this.assets.get(assetId)!;
      }

      // Buscar en blockchain
      const assetData = await this.stateManager.getStorage(
        this.contractAddress,
        `asset:${assetId}`
      );

      if (assetData && assetData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const asset: Asset = JSON.parse(assetData);
        this.assets.set(assetId, asset);
        return asset;
      }

      return null;

    } catch (error: any) {
      logger.error(`Error obteniendo asset ${assetId}:`, error);
      return null;
    }
  }

  /**
   * Obtener assets por propietario
   */
  async getAssetsByOwner(ownerAddress: string): Promise<Asset[]> {
    try {
      const assets: Asset[] = [];
      
      for (const asset of this.assets.values()) {
        if (asset.owner.toLowerCase() === ownerAddress.toLowerCase()) {
          assets.push(asset);
        }
      }

      return assets;

    } catch (error: any) {
      logger.error(`Error obteniendo assets de ${ownerAddress}:`, error);
      return [];
    }
  }

  /**
   * Obtener assets por tipo
   */
  async getAssetsByType(type: Asset['type']): Promise<Asset[]> {
    try {
      const assets: Asset[] = [];
      
      for (const asset of this.assets.values()) {
        if (asset.type === type) {
          assets.push(asset);
        }
      }

      return assets;

    } catch (error: any) {
      logger.error(`Error obteniendo assets de tipo ${type}:`, error);
      return [];
    }
  }

  /**
   * Buscar assets por tags
   */
  async searchAssetsByTags(tags: string[]): Promise<Asset[]> {
    try {
      const assets: Asset[] = [];
      
      for (const asset of this.assets.values()) {
        const hasAllTags = tags.every(tag => 
          asset.tags.some(assetTag => 
            assetTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        
        if (hasAllTags) {
          assets.push(asset);
        }
      }

      return assets;

    } catch (error: any) {
      logger.error('Error buscando assets por tags:', error);
      return [];
    }
  }

  /**
   * Transferir asset
   */
  async transferAsset(
    from: string,
    to: string,
    assetId: string,
    amount: string = '1',
    transactionHash: string
  ): Promise<boolean> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) {
        throw new Error('Asset no encontrado');
      }

      if (asset.owner.toLowerCase() !== from.toLowerCase()) {
        throw new Error('No eres el propietario del asset');
      }

      // Actualizar propietario
      asset.owner = to;
      asset.updatedAt = Date.now();

      // Guardar asset actualizado
      this.assets.set(assetId, asset);
      await this.stateManager.setStorage(
        this.contractAddress,
        `asset:${assetId}`,
        JSON.stringify(asset)
      );

      // Registrar transferencia
      const transfer: AssetTransfer = {
        from,
        to,
        assetId,
        amount,
        timestamp: Date.now(),
        transactionHash
      };

      this.transfers.push(transfer);
      this.totalTransfers++;

      await this.stateManager.setStorage(
        this.contractAddress,
        `transfer:${this.totalTransfers}`,
        JSON.stringify(transfer)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalTransfers',
        this.totalTransfers.toString()
      );

      // Emitir evento
      this.emitAssetEvent('AssetTransferred', {
        assetId,
        from,
        to,
        amount,
        transactionHash
      });

      logger.info(`Asset ${assetId} transferido de ${from} a ${to}`);
      return true;

    } catch (error: any) {
      logger.error('Error transfiriendo asset:', error);
      return false;
    }
  }

  /**
   * Actualizar asset
   */
  async updateAsset(
    assetId: string,
    updates: Partial<Asset>,
    ownerAddress: string
  ): Promise<boolean> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) {
        throw new Error('Asset no encontrado');
      }

      if (asset.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('No eres el propietario del asset');
      }

      // Aplicar actualizaciones
      const updatedAsset: Asset = {
        ...asset,
        ...updates,
        updatedAt: Date.now()
      };

      // Guardar asset actualizado
      this.assets.set(assetId, updatedAsset);
      await this.stateManager.setStorage(
        this.contractAddress,
        `asset:${assetId}`,
        JSON.stringify(updatedAsset)
      );

      // Emitir evento
      this.emitAssetEvent('AssetUpdated', {
        assetId,
        owner: ownerAddress,
        updates: Object.keys(updates)
      });

      logger.info(`Asset ${assetId} actualizado por ${ownerAddress}`);
      return true;

    } catch (error: any) {
      logger.error('Error actualizando asset:', error);
      return false;
    }
  }

  /**
   * Eliminar asset (soft delete)
   */
  async deleteAsset(assetId: string, ownerAddress: string): Promise<boolean> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) {
        throw new Error('Asset no encontrado');
      }

      if (asset.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('No eres el propietario del asset');
      }

      // Marcar como eliminado
      asset.updatedAt = Date.now();
      asset.isPublic = false;
      asset.allowDownload = false;

      // Guardar asset actualizado
      this.assets.set(assetId, asset);
      await this.stateManager.setStorage(
        this.contractAddress,
        `asset:${assetId}`,
        JSON.stringify(asset)
      );

      // Emitir evento
      this.emitAssetEvent('AssetDeleted', {
        assetId,
        owner: ownerAddress
      });

      logger.info(`Asset ${assetId} eliminado por ${ownerAddress}`);
      return true;

    } catch (error: any) {
      logger.error('Error eliminando asset:', error);
      return false;
    }
  }

  /**
   * Obtener historial de transferencias de un asset
   */
  async getAssetTransferHistory(assetId: string): Promise<AssetTransfer[]> {
    try {
      return this.transfers.filter(transfer => transfer.assetId === assetId);
    } catch (error: any) {
      logger.error(`Error obteniendo historial de transferencias de ${assetId}:`, error);
      return [];
    }
  }

  /**
   * Obtener assets públicos
   */
  async getPublicAssets(): Promise<Asset[]> {
    try {
      const assets: Asset[] = [];
      
      for (const asset of this.assets.values()) {
        if (asset.isPublic) {
          assets.push(asset);
        }
      }

      return assets;

    } catch (error: any) {
      logger.error('Error obteniendo assets públicos:', error);
      return [];
    }
  }

  /**
   * Obtener assets por precio
   */
  async getAssetsByPriceRange(minPrice: string, maxPrice: string): Promise<Asset[]> {
    try {
      const assets: Asset[] = [];
      const min = ethers.BigNumber.from(minPrice);
      const max = ethers.BigNumber.from(maxPrice);
      
      for (const asset of this.assets.values()) {
        const price = ethers.BigNumber.from(asset.price);
        if (price.gte(min) && price.lte(max)) {
          assets.push(asset);
        }
      }

      return assets;

    } catch (error: any) {
      logger.error('Error obteniendo assets por rango de precio:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del registro
   */
  async getRegistryStats(): Promise<{
    totalAssets: number;
    totalTransfers: number;
    assetsByType: { [key: string]: number };
    totalOwners: number;
    averagePrice: string;
  }> {
    try {
      const assetsByType: { [key: string]: number } = {};
      const owners = new Set<string>();
      let totalPrice = ethers.BigNumber.from(0);
      let pricedAssets = 0;

      for (const asset of this.assets.values()) {
        // Contar por tipo
        assetsByType[asset.type] = (assetsByType[asset.type] || 0) + 1;
        
        // Contar propietarios únicos
        owners.add(asset.owner);
        
        // Calcular precio promedio
        if (ethers.BigNumber.from(asset.price).gt(0)) {
          totalPrice = totalPrice.add(asset.price);
          pricedAssets++;
        }
      }

      const averagePrice = pricedAssets > 0 
        ? totalPrice.div(pricedAssets).toString()
        : '0';

      return {
        totalAssets: this.totalAssets,
        totalTransfers: this.totalTransfers,
        assetsByType,
        totalOwners: owners.size,
        averagePrice
      };

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas del registro:', error);
      return {
        totalAssets: 0,
        totalTransfers: 0,
        assetsByType: {},
        totalOwners: 0,
        averagePrice: '0'
      };
    }
  }

  /**
   * Emitir evento de asset
   */
  private emitAssetEvent(eventName: string, data: any): void {
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
   * Obtener total de assets
   */
  getTotalAssets(): number {
    return this.totalAssets;
  }

  /**
   * Verificar si un asset existe
   */
  async assetExists(assetId: string): Promise<boolean> {
    return this.assets.has(assetId) || 
           (await this.stateManager.getStorage(this.contractAddress, `asset:${assetId}`)) !== 
           '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Obtener assets recientes
   */
  async getRecentAssets(limit: number = 10): Promise<Asset[]> {
    try {
      const assets = Array.from(this.assets.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      return assets;

    } catch (error: any) {
      logger.error('Error obteniendo assets recientes:', error);
      return [];
    }
  }

  /**
   * Obtener assets populares (por número de transferencias)
   */
  async getPopularAssets(limit: number = 10): Promise<Asset[]> {
    try {
      const transferCounts: { [assetId: string]: number } = {};
      
      // Contar transferencias por asset
      for (const transfer of this.transfers) {
        transferCounts[transfer.assetId] = (transferCounts[transfer.assetId] || 0) + 1;
      }

      // Ordenar por número de transferencias
      const sortedAssetIds = Object.keys(transferCounts)
        .sort((a, b) => transferCounts[b] - transferCounts[a])
        .slice(0, limit);

      const assets: Asset[] = [];
      for (const assetId of sortedAssetIds) {
        const asset = await this.getAsset(assetId);
        if (asset) {
          assets.push(asset);
        }
      }

      return assets;

    } catch (error: any) {
      logger.error('Error obteniendo assets populares:', error);
      return [];
    }
  }
}

export default AssetRegistry; 