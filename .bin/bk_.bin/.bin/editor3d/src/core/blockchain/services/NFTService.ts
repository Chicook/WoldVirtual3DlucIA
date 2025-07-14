import { NFT, NFTConfig } from '../types';

export class NFTService {
  private config: NFTConfig;
  private isInitialized: boolean = false;
  private nftStorage: Map<string, NFT> = new Map();

  constructor(config: NFTConfig) {
    this.config = config;
  }

  /**
   * Inicializa el servicio NFT
   */
  async initialize(): Promise<void> {
    try {
      console.log('🖼️ Inicializando NFTService...');
      
      // Simular inicialización
      this.isInitialized = true;
      console.log('✅ NFTService inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar NFTService:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo NFT
   */
  async createNFT(metadata: any, tokenURI: string, creatorAddress: string): Promise<NFT> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const tokenId = Math.floor(Math.random() * 10000).toString();
      const nftId = `nft_${Date.now()}_${tokenId}`;

      const nft: NFT = {
        id: nftId,
        tokenId,
        contractAddress: this.config.marketplaceAddress,
        owner: creatorAddress,
        creator: creatorAddress,
        name: metadata.name || `NFT #${tokenId}`,
        description: metadata.description || 'NFT creado en el metaverso',
        image: metadata.image || 'https://via.placeholder.com/400x400',
        metadata: {
          ...metadata,
          tokenURI,
          attributes: metadata.attributes || []
        },
        attributes: metadata.attributes || [],
        rarity: this.calculateRarity(metadata.attributes || []),
        mintDate: Date.now(),
        transactionHash: '0x' + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      };

      this.nftStorage.set(nftId, nft);
      console.log(`🎨 NFT creado: ${nft.name} (ID: ${nftId})`);
      
      return nft;
    } catch (error) {
      console.error('❌ Error al crear NFT:', error);
      throw error;
    }
  }

  /**
   * Transfiere un NFT
   */
  async transferNFT(nftId: string, fromAddress: string, toAddress: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const nft = this.nftStorage.get(nftId);
      if (!nft) {
        throw new Error(`NFT no encontrado: ${nftId}`);
      }

      if (nft.owner !== fromAddress) {
        throw new Error('No eres el propietario de este NFT');
      }

      // Actualizar propietario
      nft.owner = toAddress;
      this.nftStorage.set(nftId, nft);

      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      console.log(`🔄 NFT transferido: ${nftId} de ${fromAddress} a ${toAddress}`);
      
      return txHash;
    } catch (error) {
      console.error('❌ Error al transferir NFT:', error);
      throw error;
    }
  }

  /**
   * Obtiene NFTs del usuario
   */
  async getUserNFTs(userAddress: string): Promise<NFT[]> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const userNFTs: NFT[] = [];
      
      for (const nft of this.nftStorage.values()) {
        if (nft.owner === userAddress) {
          userNFTs.push(nft);
        }
      }

      console.log(`📦 NFTs encontrados para ${userAddress}: ${userNFTs.length}`);
      return userNFTs;
    } catch (error) {
      console.error('❌ Error al obtener NFTs del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene un NFT específico
   */
  async getNFT(nftId: string): Promise<NFT | null> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const nft = this.nftStorage.get(nftId);
      return nft || null;
    } catch (error) {
      console.error('❌ Error al obtener NFT:', error);
      throw error;
    }
  }

  /**
   * Lista un NFT en el marketplace
   */
  async listNFT(nftId: string, price: string, sellerAddress: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const nft = this.nftStorage.get(nftId);
      if (!nft) {
        throw new Error(`NFT no encontrado: ${nftId}`);
      }

      if (nft.owner !== sellerAddress) {
        throw new Error('No eres el propietario de este NFT');
      }

      // Actualizar precio
      nft.price = price;
      this.nftStorage.set(nftId, nft);

      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      console.log(`📋 NFT listado: ${nftId} por ${price} ETH`);
      
      return txHash;
    } catch (error) {
      console.error('❌ Error al listar NFT:', error);
      throw error;
    }
  }

  /**
   * Compra un NFT del marketplace
   */
  async buyNFT(nftId: string, buyerAddress: string, price: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const nft = this.nftStorage.get(nftId);
      if (!nft) {
        throw new Error(`NFT no encontrado: ${nftId}`);
      }

      if (!nft.price) {
        throw new Error('Este NFT no está en venta');
      }

      if (parseFloat(price) < parseFloat(nft.price)) {
        throw new Error('Precio insuficiente');
      }

      // Transferir NFT
      const sellerAddress = nft.owner;
      nft.owner = buyerAddress;
      nft.price = undefined; // Ya no está en venta
      nft.lastSoldPrice = price;
      nft.lastSoldDate = Date.now();
      this.nftStorage.set(nftId, nft);

      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      console.log(`💰 NFT comprado: ${nftId} por ${price} ETH`);
      
      return txHash;
    } catch (error) {
      console.error('❌ Error al comprar NFT:', error);
      throw error;
    }
  }

  /**
   * Obtiene NFTs por rareza
   */
  async getNFTsByRarity(rarity: string): Promise<NFT[]> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const nfts: NFT[] = [];
      
      for (const nft of this.nftStorage.values()) {
        if (nft.rarity === rarity) {
          nfts.push(nft);
        }
      }

      return nfts;
    } catch (error) {
      console.error('❌ Error al obtener NFTs por rareza:', error);
      throw error;
    }
  }

  /**
   * Obtiene NFTs por tipo de atributo
   */
  async getNFTsByAttribute(traitType: string, value: string): Promise<NFT[]> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const nfts: NFT[] = [];
      
      for (const nft of this.nftStorage.values()) {
        const attribute = nft.attributes?.find(attr => 
          attr.trait_type === traitType && attr.value === value
        );
        
        if (attribute) {
          nfts.push(nft);
        }
      }

      return nfts;
    } catch (error) {
      console.error('❌ Error al obtener NFTs por atributo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de NFTs
   */
  async getNFTStats(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('NFTService no está inicializado');
    }

    try {
      const totalNFTs = this.nftStorage.size;
      const totalOwners = new Set([...this.nftStorage.values()].map(nft => nft.owner)).size;
      const totalCreators = new Set([...this.nftStorage.values()].map(nft => nft.creator)).size;
      
      const rarityStats = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      };

      for (const nft of this.nftStorage.values()) {
        if (nft.rarity) {
          rarityStats[nft.rarity as keyof typeof rarityStats]++;
        }
      }

      const totalVolume = [...this.nftStorage.values()]
        .filter(nft => nft.lastSoldPrice)
        .reduce((sum, nft) => sum + parseFloat(nft.lastSoldPrice || '0'), 0);

      return {
        totalNFTs,
        totalOwners,
        totalCreators,
        rarityStats,
        totalVolume: totalVolume.toString(),
        averagePrice: totalVolume / totalNFTs
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de NFTs:', error);
      throw error;
    }
  }

  /**
   * Obtiene total de NFTs
   */
  async getTotalNFTs(): Promise<number> {
    return this.nftStorage.size;
  }

  /**
   * Calcula la rareza de un NFT basado en sus atributos
   */
  private calculateRarity(attributes: any[]): string {
    if (attributes.length === 0) return 'common';

    // Simular cálculo de rareza basado en atributos
    const rarityScore = attributes.reduce((score, attr) => {
      if (typeof attr.value === 'number') {
        return score + (attr.value / 100);
      }
      return score + 0.1;
    }, 0);

    if (rarityScore > 0.8) return 'legendary';
    if (rarityScore > 0.6) return 'epic';
    if (rarityScore > 0.4) return 'rare';
    return 'common';
  }

  /**
   * Genera NFTs de ejemplo para testing
   */
  async generateSampleNFTs(creatorAddress: string, count: number = 5): Promise<NFT[]> {
    const sampleNFTs: NFT[] = [];
    
    const sampleMetadata = [
      {
        name: 'Avatar Legendario',
        description: 'Un avatar épico del metaverso',
        image: 'https://via.placeholder.com/400x400/FFD700/000000?text=Legendary',
        attributes: [
          { trait_type: 'Rareza', value: 'Legendaria' },
          { trait_type: 'Poder', value: 95 },
          { trait_type: 'Velocidad', value: 90 }
        ]
      },
      {
        name: 'Arma Épica',
        description: 'Arma poderosa para el combate',
        image: 'https://via.placeholder.com/400x400/9932CC/FFFFFF?text=Epic',
        attributes: [
          { trait_type: 'Tipo', value: 'Espada' },
          { trait_type: 'Daño', value: 85 },
          { trait_type: 'Durabilidad', value: 100 }
        ]
      },
      {
        name: 'Vehículo Raro',
        description: 'Vehículo de alta velocidad',
        image: 'https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Rare',
        attributes: [
          { trait_type: 'Tipo', value: 'Nave' },
          { trait_type: 'Velocidad', value: 80 },
          { trait_type: 'Capacidad', value: 4 }
        ]
      }
    ];

    for (let i = 0; i < count; i++) {
      const metadata = sampleMetadata[i % sampleMetadata.length];
      const nft = await this.createNFT(metadata, `ipfs://sample_${i}`, creatorAddress);
      sampleNFTs.push(nft);
    }

    return sampleNFTs;
  }

  /**
   * Verifica si está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): NFTConfig {
    return this.config;
  }
} 