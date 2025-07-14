/**
 * @fileoverview Sistema de creación de NFTs para imágenes generadas
 * @module @metaverso/image-generator/web3/NFTImageCreator
 */

import * as THREE from 'three';
import { ethers } from 'ethers';
import { NFTParams, NFTAttributes } from '../types';
import { ImageProcessor } from '../utils/ImageProcessor';
import { MetadataManager } from './MetadataManager';

/**
 * Información del NFT creado
 */
export interface CreatedNFT {
  tokenId: string;
  contractAddress: string;
  transactionHash: string;
  metadata: NFTAttributes;
  imageUrl: string;
  ipfsHash: string;
  blockNumber: number;
  timestamp: number;
}

/**
 * Configuración del creador de NFTs
 */
export interface NFTCreatorConfig {
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum' | 'optimism';
  contractAddress: string;
  rpcUrl: string;
  privateKey?: string;
  ipfsGateway: string;
  gasLimit: number;
  gasPrice?: string;
}

/**
 * Creador de NFTs para imágenes generadas
 */
export class NFTImageCreator {
  private config: NFTCreatorConfig;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private contract?: ethers.Contract;
  private imageProcessor: ImageProcessor;
  private metadataManager: MetadataManager;

  /**
   * Constructor del creador
   * @param config - Configuración del creador
   */
  constructor(config: NFTCreatorConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.imageProcessor = new ImageProcessor();
    this.metadataManager = new MetadataManager();
    
    this._initializeContract();
  }

  /**
   * Crear NFT de imagen generada
   * @param params - Parámetros del NFT
   * @returns Promise con el NFT creado
   */
  public async createNFT(params: NFTParams): Promise<CreatedNFT> {
    try {
      // Procesar imagen
      const processedImage = await this._processImage(params.image);
      
      // Subir imagen a IPFS
      const imageIpfsHash = await this._uploadToIPFS(processedImage, 'image');
      
      // Crear metadata
      const metadata = await this._createMetadata(params, imageIpfsHash);
      
      // Subir metadata a IPFS
      const metadataIpfsHash = await this._uploadToIPFS(metadata, 'metadata');
      
      // Mintear NFT
      const nft = await this._mintNFT(metadataIpfsHash);
      
      // Crear resultado
      const result: CreatedNFT = {
        tokenId: nft.tokenId,
        contractAddress: this.config.contractAddress,
        transactionHash: nft.transactionHash,
        metadata: params.attributes,
        imageUrl: `${this.config.ipfsGateway}/ipfs/${imageIpfsHash}`,
        ipfsHash: imageIpfsHash,
        blockNumber: nft.blockNumber,
        timestamp: Date.now()
      };
      
      console.log(`[NFTImageCreator] NFT creado: ${result.tokenId}`);
      
      return result;
    } catch (error) {
      console.error('[NFTImageCreator] Error al crear NFT:', error);
      throw error;
    }
  }

  /**
   * Crear múltiples NFTs en batch
   * @param paramsArray - Array de parámetros de NFTs
   * @returns Promise con los NFTs creados
   */
  public async createNFTBatch(paramsArray: NFTParams[]): Promise<CreatedNFT[]> {
    const results: CreatedNFT[] = [];
    
    for (const params of paramsArray) {
      try {
        const nft = await this.createNFT(params);
        results.push(nft);
        
        // Esperar entre minting para evitar nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[NFTImageCreator] Error al crear NFT en batch:`, error);
        // Continuar con el siguiente
      }
    }
    
    return results;
  }

  /**
   * Verificar si una imagen ya existe como NFT
   * @param imageHash - Hash de la imagen
   * @returns Promise con información de existencia
   */
  public async checkImageExists(imageHash: string): Promise<{
    exists: boolean;
    tokenId?: string;
    contractAddress?: string;
  }> {
    try {
      // Buscar en el contrato por hash de imagen
      if (this.contract) {
        const tokenId = await this.contract.getTokenIdByImageHash(imageHash);
        if (tokenId && tokenId.toString() !== '0') {
          return {
            exists: true,
            tokenId: tokenId.toString(),
            contractAddress: this.config.contractAddress
          };
        }
      }
      
      return { exists: false };
    } catch (error) {
      console.error('[NFTImageCreator] Error al verificar existencia:', error);
      return { exists: false };
    }
  }

  /**
   * Obtener información de un NFT
   * @param tokenId - ID del token
   * @returns Promise con información del NFT
   */
  public async getNFTInfo(tokenId: string): Promise<{
    tokenId: string;
    owner: string;
    metadata: NFTAttributes;
    imageUrl: string;
    ipfsHash: string;
    createdAt: number;
  } | null> {
    try {
      if (!this.contract) {
        throw new Error('Contrato no inicializado');
      }
      
      // Obtener información del token
      const tokenURI = await this.contract.tokenURI(tokenId);
      const owner = await this.contract.ownerOf(tokenId);
      
      // Obtener metadata desde IPFS
      const metadata = await this._getMetadataFromIPFS(tokenURI);
      
      return {
        tokenId,
        owner,
        metadata,
        imageUrl: metadata.image,
        ipfsHash: metadata.image.replace('ipfs://', ''),
        createdAt: Date.now() // TODO: Obtener timestamp real del bloque
      };
    } catch (error) {
      console.error('[NFTImageCreator] Error al obtener información del NFT:', error);
      return null;
    }
  }

  /**
   * Transferir NFT
   * @param tokenId - ID del token
   * @param to - Dirección de destino
   * @returns Promise con hash de transacción
   */
  public async transferNFT(tokenId: string, to: string): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contrato o signer no inicializado');
      }
      
      const tx = await this.contract.transferFrom(await this.signer.getAddress(), to, tokenId);
      const receipt = await tx.wait();
      
      console.log(`[NFTImageCreator] NFT transferido: ${tokenId} -> ${to}`);
      
      return receipt.hash;
    } catch (error) {
      console.error('[NFTImageCreator] Error al transferir NFT:', error);
      throw error;
    }
  }

  /**
   * Obtener NFTs de una dirección
   * @param address - Dirección del propietario
   * @returns Promise con lista de NFTs
   */
  public async getNFTsByOwner(address: string): Promise<CreatedNFT[]> {
    try {
      if (!this.contract) {
        throw new Error('Contrato no inicializado');
      }
      
      const balance = await this.contract.balanceOf(address);
      const nfts: CreatedNFT[] = [];
      
      for (let i = 0; i < balance; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(address, i);
        const nftInfo = await this.getNFTInfo(tokenId.toString());
        
        if (nftInfo) {
          nfts.push({
            tokenId: nftInfo.tokenId,
            contractAddress: this.config.contractAddress,
            transactionHash: '', // No disponible en este contexto
            metadata: nftInfo.metadata,
            imageUrl: nftInfo.imageUrl,
            ipfsHash: nftInfo.ipfsHash,
            blockNumber: 0, // No disponible en este contexto
            timestamp: nftInfo.createdAt
          });
        }
      }
      
      return nfts;
    } catch (error) {
      console.error('[NFTImageCreator] Error al obtener NFTs del propietario:', error);
      throw error;
    }
  }

  /**
   * Inicializar contrato
   */
  private async _initializeContract(): Promise<void> {
    try {
      // ABI básico para NFT
      const abi = [
        'function mint(address to, string tokenURI) external returns (uint256)',
        'function tokenURI(uint256 tokenId) external view returns (string)',
        'function ownerOf(uint256 tokenId) external view returns (address)',
        'function balanceOf(address owner) external view returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
        'function transferFrom(address from, address to, uint256 tokenId) external',
        'function getTokenIdByImageHash(string imageHash) external view returns (uint256)'
      ];
      
      this.contract = new ethers.Contract(this.config.contractAddress, abi, this.provider);
      
      // Configurar signer si se proporciona private key
      if (this.config.privateKey) {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
        this.contract = this.contract.connect(this.signer);
      }
      
      console.log('[NFTImageCreator] Contrato inicializado');
    } catch (error) {
      console.error('[NFTImageCreator] Error al inicializar contrato:', error);
      throw error;
    }
  }

  /**
   * Procesar imagen
   */
  private async _processImage(image: THREE.Texture | string): Promise<Blob> {
    if (typeof image === 'string') {
      // Si es una URL, descargar la imagen
      const response = await fetch(image);
      return await response.blob();
    } else {
      // Si es una textura Three.js, convertir a blob
      return await this.imageProcessor.textureToBlob(image, {
        format: 'png',
        quality: 0.9
      });
    }
  }

  /**
   * Subir a IPFS
   */
  private async _uploadToIPFS(data: any, type: 'image' | 'metadata'): Promise<string> {
    try {
      let content: string;
      
      if (type === 'image') {
        // Para imágenes, usar el blob directamente
        const formData = new FormData();
        formData.append('file', data);
        
        const response = await fetch(`${this.config.ipfsGateway}/api/v0/add`, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        return result.Hash;
      } else {
        // Para metadata, convertir a JSON
        content = JSON.stringify(data, null, 2);
        
        const response = await fetch(`${this.config.ipfsGateway}/api/v0/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: content
          })
        });
        
        const result = await response.json();
        return result.Hash;
      }
    } catch (error) {
      console.error('[NFTImageCreator] Error al subir a IPFS:', error);
      throw error;
    }
  }

  /**
   * Crear metadata
   */
  private async _createMetadata(params: NFTParams, imageIpfsHash: string): Promise<any> {
    const metadata = {
      name: params.name,
      description: params.description,
      image: `ipfs://${imageIpfsHash}`,
      external_url: `https://metaverso.example.com/nft/${imageIpfsHash}`,
      attributes: [
        {
          trait_type: 'Type',
          value: params.attributes.type
        },
        {
          trait_type: 'Resolution',
          value: params.attributes.resolution
        },
        {
          trait_type: 'Algorithm',
          value: params.attributes.algorithm
        },
        {
          trait_type: 'Seed',
          value: params.attributes.seed
        },
        {
          trait_type: 'Rarity',
          value: params.attributes.rarity
        },
        {
          trait_type: 'Generator Version',
          value: params.attributes.generatorVersion
        },
        {
          trait_type: 'Created At',
          value: params.attributes.createdAt
        }
      ],
      properties: {
        files: [
          {
            uri: `ipfs://${imageIpfsHash}`,
            type: 'image/png'
          }
        ],
        category: 'image',
        generator: {
          algorithm: params.attributes.generationParams.algorithm,
          seed: params.attributes.seed,
          parameters: params.attributes.generationParams
        }
      }
    };
    
    return metadata;
  }

  /**
   * Mintear NFT
   */
  private async _mintNFT(metadataIpfsHash: string): Promise<{
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
  }> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contrato o signer no inicializado');
      }
      
      const tokenURI = `ipfs://${metadataIpfsHash}`;
      const ownerAddress = await this.signer.getAddress();
      
      // Configurar gas
      const gasEstimate = await this.contract.mint.estimateGas(ownerAddress, tokenURI);
      const gasLimit = Math.ceil(Number(gasEstimate) * 1.2); // 20% de margen
      
      // Mintear NFT
      const tx = await this.contract.mint(ownerAddress, tokenURI, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      // Obtener token ID del evento
      const mintEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );
      
      let tokenId = '0';
      if (mintEvent) {
        tokenId = ethers.formatUnits(mintEvent.topics[3], 0);
      }
      
      return {
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('[NFTImageCreator] Error al mintear NFT:', error);
      throw error;
    }
  }

  /**
   * Obtener metadata desde IPFS
   */
  private async _getMetadataFromIPFS(tokenURI: string): Promise<NFTAttributes> {
    try {
      const ipfsHash = tokenURI.replace('ipfs://', '');
      const response = await fetch(`${this.config.ipfsGateway}/ipfs/${ipfsHash}`);
      const metadata = await response.json();
      
      return metadata.attributes as NFTAttributes;
    } catch (error) {
      console.error('[NFTImageCreator] Error al obtener metadata desde IPFS:', error);
      throw error;
    }
  }
} 