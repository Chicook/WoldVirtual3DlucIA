import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { NFTConfig, NFT, NFTMetadata, Transaction, TransactionStatus } from '../types';

export class NFTService extends EventEmitter {
  private config: NFTConfig;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private marketplaceContract: ethers.Contract | null = null;
  private collectionContract: ethers.Contract | null = null;
  private isInitialized: boolean = false;
  private nfts: Map<string, NFT> = new Map();

  constructor(config: NFTConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando NFTService...');

      // Configurar contratos
      await this.setupContracts();
      
      this.isInitialized = true;
      console.log('NFTService inicializado correctamente');

    } catch (error) {
      console.error('Error al inicializar NFTService:', error);
      throw error;
    }
  }

  private async setupContracts(): Promise<void> {
    // ABI para marketplace
    const marketplaceABI = [
      'function mintNFT(address to, string memory tokenURI) public returns (uint256)',
      'function listNFT(uint256 tokenId, uint256 price) public',
      'function buyNFT(uint256 tokenId) public payable',
      'function getNFTPrice(uint256 tokenId) public view returns (uint256)',
      'function isNFTListed(uint256 tokenId) public view returns (bool)',
      'function getNFTListings() public view returns (uint256[])',
      'event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)',
      'event NFTListed(uint256 indexed tokenId, uint256 price)',
      'event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price)'
    ];

    // ABI para colección
    const collectionABI = [
      'function tokenURI(uint256 tokenId) public view returns (string memory)',
      'function ownerOf(uint256 tokenId) public view returns (address)',
      'function balanceOf(address owner) public view returns (uint256)',
      'function transferFrom(address from, address to, uint256 tokenId) public',
      'function approve(address to, uint256 tokenId) public',
      'function getApproved(uint256 tokenId) public view returns (address)',
      'function isApprovedForAll(address owner, address operator) public view returns (bool)',
      'function totalSupply() public view returns (uint256)',
      'function tokenByIndex(uint256 index) public view returns (uint256)',
      'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)'
    ];

    if (this.provider) {
      this.marketplaceContract = new ethers.Contract(
        this.config.marketplaceAddress,
        marketplaceABI,
        this.provider
      );

      this.collectionContract = new ethers.Contract(
        this.config.collectionAddress,
        collectionABI,
        this.provider
      );
    }
  }

  setProvider(provider: ethers.providers.JsonRpcProvider): void {
    this.provider = provider;
    this.setupContracts();
  }

  setSigner(signer: ethers.Signer): void {
    this.signer = signer;
    if (this.marketplaceContract) {
      this.marketplaceContract = this.marketplaceContract.connect(signer);
    }
    if (this.collectionContract) {
      this.collectionContract = this.collectionContract.connect(signer);
    }
  }

  async mintNFT(metadata: {
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  }): Promise<NFT> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      if (!this.marketplaceContract) {
        throw new Error('Contrato de marketplace no configurado');
      }

      console.log('Mintando NFT...');

      const from = await this.signer.getAddress();

      // Crear metadata completa
      const nftMetadata: NFTMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: metadata.attributes
      };

      // Subir metadata a IPFS o almacenamiento
      const tokenURI = await this.uploadMetadata(nftMetadata);

      // Mint NFT
      const tx = await this.marketplaceContract.mintNFT(from, tokenURI);
      const receipt = await tx.wait();

      // Obtener tokenId del evento
      const mintEvent = receipt.events?.find((e: any) => e.event === 'NFTMinted');
      if (!mintEvent) {
        throw new Error('Evento de mint no encontrado');
      }

      const tokenId = mintEvent.args.tokenId.toString();

      // Crear objeto NFT
      const nft: NFT = {
        id: `${this.config.collectionAddress}-${tokenId}`,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        tokenId,
        contractAddress: this.config.collectionAddress,
        owner: from,
        creator: from,
        network: 'ethereum',
        metadata: nftMetadata,
        attributes: metadata.attributes,
        royalties: this.config.royaltyPercentage,
        isListed: false,
        isStaked: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Guardar NFT
      this.nfts.set(nft.id, nft);

      // Emitir evento
      this.emit('nftMinted', nft);

      console.log('NFT mintado:', nft.id);
      return nft;

    } catch (error) {
      console.error('Error al mintar NFT:', error);
      throw error;
    }
  }

  private async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      // En una implementación real, aquí se subiría a IPFS
      // Por ahora, simulamos la subida
      const metadataHash = ethers.utils.id(JSON.stringify(metadata));
      return `${this.config.baseURI}/${metadataHash}`;

    } catch (error) {
      console.error('Error al subir metadata:', error);
      throw error;
    }
  }

  async listNFT(nftId: string, price: string): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      if (!this.marketplaceContract) {
        throw new Error('Contrato de marketplace no configurado');
      }

      const nft = this.nfts.get(nftId);
      if (!nft) {
        throw new Error('NFT no encontrado');
      }

      if (nft.owner !== await this.signer.getAddress()) {
        throw new Error('No eres el propietario del NFT');
      }

      console.log('Listando NFT:', nftId);

      const priceWei = ethers.utils.parseEther(price);
      const tx = await this.marketplaceContract.listNFT(nft.tokenId, priceWei);
      const receipt = await tx.wait();

      // Actualizar NFT
      nft.price = price;
      nft.isListed = true;
      nft.updatedAt = Date.now();
      this.nfts.set(nftId, nft);

      const transaction: Transaction = {
        hash: tx.hash,
        from: await this.signer.getAddress(),
        to: this.config.marketplaceAddress,
        value: '0',
        gasLimit: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        nonce: tx.nonce,
        data: tx.data,
        chainId: 1, // Ethereum mainnet
        status: TransactionStatus.CONFIRMED,
        confirmations: receipt.confirmations,
        metadata: {
          type: 'nft',
          nftId,
          action: 'list'
        }
      };

      console.log('NFT listado:', nftId);
      return transaction;

    } catch (error) {
      console.error('Error al listar NFT:', error);
      throw error;
    }
  }

  async buyNFT(nftId: string): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      if (!this.marketplaceContract) {
        throw new Error('Contrato de marketplace no configurado');
      }

      const nft = this.nfts.get(nftId);
      if (!nft) {
        throw new Error('NFT no encontrado');
      }

      if (!nft.isListed || !nft.price) {
        throw new Error('NFT no está listado para venta');
      }

      console.log('Comprando NFT:', nftId);

      const priceWei = ethers.utils.parseEther(nft.price);
      const tx = await this.marketplaceContract.buyNFT(nft.tokenId, { value: priceWei });
      const receipt = await tx.wait();

      // Actualizar NFT
      const buyer = await this.signer.getAddress();
      nft.owner = buyer;
      nft.isListed = false;
      nft.price = undefined;
      nft.updatedAt = Date.now();
      this.nfts.set(nftId, nft);

      // Emitir evento
      this.emit('nftTransferred', nft);

      const transaction: Transaction = {
        hash: tx.hash,
        from: buyer,
        to: this.config.marketplaceAddress,
        value: nft.price || '0',
        gasLimit: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        nonce: tx.nonce,
        data: tx.data,
        chainId: 1,
        status: TransactionStatus.CONFIRMED,
        confirmations: receipt.confirmations,
        metadata: {
          type: 'nft',
          nftId,
          action: 'buy'
        }
      };

      console.log('NFT comprado:', nftId);
      return transaction;

    } catch (error) {
      console.error('Error al comprar NFT:', error);
      throw error;
    }
  }

  async transferNFT(nftId: string, to: string): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Signer no configurado');
      }

      if (!this.collectionContract) {
        throw new Error('Contrato de colección no configurado');
      }

      const nft = this.nfts.get(nftId);
      if (!nft) {
        throw new Error('NFT no encontrado');
      }

      if (nft.owner !== await this.signer.getAddress()) {
        throw new Error('No eres el propietario del NFT');
      }

      console.log('Transferiendo NFT:', nftId, 'a', to);

      const tx = await this.collectionContract.transferFrom(
        await this.signer.getAddress(),
        to,
        nft.tokenId
      );
      const receipt = await tx.wait();

      // Actualizar NFT
      nft.owner = to;
      nft.updatedAt = Date.now();
      this.nfts.set(nftId, nft);

      // Emitir evento
      this.emit('nftTransferred', nft);

      const transaction: Transaction = {
        hash: tx.hash,
        from: await this.signer.getAddress(),
        to,
        value: '0',
        gasLimit: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        nonce: tx.nonce,
        data: tx.data,
        chainId: 1,
        status: TransactionStatus.CONFIRMED,
        confirmations: receipt.confirmations,
        metadata: {
          type: 'nft',
          nftId,
          action: 'transfer'
        }
      };

      console.log('NFT transferido:', nftId);
      return transaction;

    } catch (error) {
      console.error('Error al transferir NFT:', error);
      throw error;
    }
  }

  async getUserNFTs(address: string): Promise<NFT[]> {
    try {
      if (!this.collectionContract) {
        throw new Error('Contrato de colección no configurado');
      }

      const balance = await this.collectionContract.balanceOf(address);
      const nfts: NFT[] = [];

      for (let i = 0; i < balance.toNumber(); i++) {
        try {
          const tokenId = await this.collectionContract.tokenOfOwnerByIndex(address, i);
          const tokenIdStr = tokenId.toString();
          
          // Obtener metadata
          const tokenURI = await this.collectionContract.tokenURI(tokenId);
          const metadata = await this.getMetadataFromURI(tokenURI);
          
          const nft: NFT = {
            id: `${this.config.collectionAddress}-${tokenIdStr}`,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            tokenId: tokenIdStr,
            contractAddress: this.config.collectionAddress,
            owner: address,
            creator: address, // En una implementación real, se obtendría del contrato
            network: 'ethereum',
            metadata,
            attributes: metadata.attributes,
            royalties: this.config.royaltyPercentage,
            isListed: false,
            isStaked: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          nfts.push(nft);
          this.nfts.set(nft.id, nft);

        } catch (error) {
          console.warn(`Error al obtener NFT ${i}:`, error);
        }
      }

      return nfts;

    } catch (error) {
      console.error('Error al obtener NFTs del usuario:', error);
      throw error;
    }
  }

  private async getMetadataFromURI(tokenURI: string): Promise<NFTMetadata> {
    try {
      // En una implementación real, se obtendría desde IPFS o HTTP
      // Por ahora, simulamos metadata
      return {
        name: 'NFT #' + Math.floor(Math.random() * 1000),
        description: 'Un NFT único en el metaverso',
        image: 'https://via.placeholder.com/400x400',
        attributes: [
          { trait_type: 'Rarity', value: 'Common' },
          { trait_type: 'Level', value: 1 }
        ]
      };

    } catch (error) {
      console.error('Error al obtener metadata:', error);
      throw error;
    }
  }

  async getNFTListings(): Promise<NFT[]> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Contrato de marketplace no configurado');
      }

      const listings = await this.marketplaceContract.getNFTListings();
      const listedNFTs: NFT[] = [];

      for (const tokenId of listings) {
        try {
          const price = await this.marketplaceContract.getNFTPrice(tokenId);
          const nft = Array.from(this.nfts.values()).find(n => n.tokenId === tokenId.toString());
          
          if (nft) {
            nft.price = ethers.utils.formatEther(price);
            nft.isListed = true;
            listedNFTs.push(nft);
          }

        } catch (error) {
          console.warn(`Error al obtener listing ${tokenId}:`, error);
        }
      }

      return listedNFTs;

    } catch (error) {
      console.error('Error al obtener listings:', error);
      throw error;
    }
  }

  async getNFTById(nftId: string): Promise<NFT | null> {
    return this.nfts.get(nftId) || null;
  }

  async getNFTByTokenId(tokenId: string): Promise<NFT | null> {
    return Array.from(this.nfts.values()).find(nft => nft.tokenId === tokenId) || null;
  }

  async updateNFTMetadata(nftId: string, metadata: Partial<NFTMetadata>): Promise<void> {
    const nft = this.nfts.get(nftId);
    if (!nft) {
      throw new Error('NFT no encontrado');
    }

    nft.metadata = { ...nft.metadata, ...metadata };
    nft.updatedAt = Date.now();
    this.nfts.set(nftId, nft);

    console.log('Metadata de NFT actualizada:', nftId);
  }

  // Métodos de utilidad

  getAllNFTs(): NFT[] {
    return Array.from(this.nfts.values());
  }

  getNFTsByOwner(owner: string): NFT[] {
    return Array.from(this.nfts.values()).filter(nft => nft.owner === owner);
  }

  getNFTsByCreator(creator: string): NFT[] {
    return Array.from(this.nfts.values()).filter(nft => nft.creator === creator);
  }

  getListedNFTs(): NFT[] {
    return Array.from(this.nfts.values()).filter(nft => nft.isListed);
  }

  getStakedNFTs(): NFT[] {
    return Array.from(this.nfts.values()).filter(nft => nft.isStaked);
  }

  // Métodos de limpieza

  dispose(): void {
    this.removeAllListeners();
    this.nfts.clear();
    this.marketplaceContract = null;
    this.collectionContract = null;
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
    console.log('NFTService disposed');
  }
} 