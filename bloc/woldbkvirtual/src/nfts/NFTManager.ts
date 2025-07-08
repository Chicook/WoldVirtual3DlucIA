import { ethers } from 'ethers'
import { Logger } from '../utils/Logger'

export interface NFTConfig {
  metaverseNFT?: string
  marketplace?: string
  metadataBase?: string
}

export interface NFTToken {
  tokenId: string
  owner: string
  tokenURI: string
  metadata: NFTMetadata
  contract: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
  properties: any
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: string
}

export interface NFTCollection {
  address: string
  name: string
  symbol: string
  totalSupply: string
  owner: string
  metadata: NFTMetadata
}

export class NFTManager {
  private config: NFTConfig
  private logger: Logger
  private isInitialized: boolean = false
  private nftContract: ethers.Contract | null = null
  private marketplaceContract: ethers.Contract | null = null

  constructor() {
    this.logger = new Logger('NFTManager')
  }

  /**
   * Inicializa el NFT Manager
   */
  async initialize(config?: NFTConfig): Promise<void> {
    try {
      this.logger.info('Initializing NFT Manager...')
      
      this.config = config || {}
      
      // Initialize contracts if addresses are provided
      if (this.config.metaverseNFT) {
        this.nftContract = new ethers.Contract(
          this.config.metaverseNFT,
          this.getNFTABI(),
          null
        )
      }
      
      if (this.config.marketplace) {
        this.marketplaceContract = new ethers.Contract(
          this.config.marketplace,
          this.getMarketplaceABI(),
          null
        )
      }
      
      this.isInitialized = true
      this.logger.info('NFT Manager initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize NFT Manager:', error)
      throw error
    }
  }

  /**
   * Obtiene información del protocolo
   */
  async getProtocolInfo(): Promise<any> {
    try {
      return {
        name: 'Metaverso NFTs',
        version: '1.0.0',
        chainId: 1, // Will be updated based on current network
        tvl: '5000000', // Placeholder
        apy: '0', // NFTs don't generate yield directly
        isActive: true
      }
    } catch (error) {
      this.logger.error('Failed to get protocol info:', error)
      return null
    }
  }

  /**
   * Obtiene los NFTs de una dirección
   */
  async getNFTs(address: string): Promise<NFTToken[]> {
    try {
      this.logger.info(`Getting NFTs for ${address}`)
      
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized')
      }
      
      const balance = await this.nftContract.balanceOf(address)
      const nfts: NFTToken[] = []
      
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.nftContract.tokenOfOwnerByIndex(address, i)
          const nft = await this.getNFT(tokenId.toString())
          if (nft) {
            nfts.push(nft)
          }
        } catch (error) {
          this.logger.warn(`Failed to get NFT at index ${i}:`, error)
        }
      }
      
      return nfts
    } catch (error) {
      this.logger.error(`Failed to get NFTs for ${address}:`, error)
      return []
    }
  }

  /**
   * Obtiene un NFT específico por tokenId
   */
  async getNFT(tokenId: string): Promise<NFTToken | null> {
    try {
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized')
      }
      
      const [owner, tokenURI] = await Promise.all([
        this.nftContract.ownerOf(tokenId),
        this.nftContract.tokenURI(tokenId)
      ])
      
      const metadata = await this.getMetadata(tokenURI)
      
      return {
        tokenId,
        owner,
        tokenURI,
        metadata,
        contract: this.nftContract.target as string
      }
    } catch (error) {
      this.logger.error(`Failed to get NFT ${tokenId}:`, error)
      return null
    }
  }

  /**
   * Obtiene metadatos de un NFT
   */
  async getMetadata(tokenURI: string): Promise<NFTMetadata> {
    try {
      // Handle IPFS URIs
      const uri = tokenURI.startsWith('ipfs://') 
        ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : tokenURI
      
      const response = await fetch(uri)
      const metadata = await response.json()
      
      return {
        name: metadata.name || 'Unknown',
        description: metadata.description || '',
        image: metadata.image || '',
        attributes: metadata.attributes || [],
        properties: metadata.properties || {}
      }
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${tokenURI}:`, error)
      return {
        name: 'Unknown',
        description: '',
        image: '',
        attributes: [],
        properties: {}
      }
    }
  }

  /**
   * Crea un nuevo NFT
   */
  async mintNFT(
    to: string,
    tokenURI: string,
    metadata?: NFTMetadata
  ): Promise<any> {
    try {
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized')
      }
      
      this.logger.info(`Minting NFT to ${to} with URI ${tokenURI}`)
      
      const tx = await this.nftContract.mint(to, tokenURI)
      const receipt = await tx.wait()
      
      // Get the tokenId from the event
      const event = receipt.logs.find((log: any) => 
        log.eventName === 'Transfer' && log.args.to === to
      )
      
      const tokenId = event?.args.tokenId.toString()
      
      this.logger.info(`NFT minted successfully with tokenId: ${tokenId}`)
      
      return {
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      this.logger.error('Failed to mint NFT:', error)
      throw error
    }
  }

  /**
   * Transfiere un NFT
   */
  async transferNFT(
    from: string,
    to: string,
    tokenId: string
  ): Promise<any> {
    try {
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized')
      }
      
      this.logger.info(`Transferring NFT ${tokenId} from ${from} to ${to}`)
      
      const tx = await this.nftContract.transferFrom(from, to, tokenId)
      const receipt = await tx.wait()
      
      this.logger.info(`NFT transferred successfully`)
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      this.logger.error('Failed to transfer NFT:', error)
      throw error
    }
  }

  /**
   * Lista un NFT en el marketplace
   */
  async listNFT(
    tokenId: string,
    price: string,
    duration: number = 0 // 0 = no expiration
  ): Promise<any> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Marketplace contract not initialized')
      }
      
      this.logger.info(`Listing NFT ${tokenId} for ${price} ETH`)
      
      // First approve the marketplace to transfer the NFT
      if (this.nftContract) {
        const approveTx = await this.nftContract.approve(
          this.marketplaceContract.target,
          tokenId
        )
        await approveTx.wait()
      }
      
      // Then list it on the marketplace
      const tx = await this.marketplaceContract.listItem(
        this.nftContract?.target,
        tokenId,
        ethers.parseEther(price),
        duration
      )
      
      const receipt = await tx.wait()
      
      this.logger.info(`NFT listed successfully`)
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      this.logger.error('Failed to list NFT:', error)
      throw error
    }
  }

  /**
   * Compra un NFT del marketplace
   */
  async buyNFT(
    tokenId: string,
    price: string
  ): Promise<any> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Marketplace contract not initialized')
      }
      
      this.logger.info(`Buying NFT ${tokenId} for ${price} ETH`)
      
      const tx = await this.marketplaceContract.buyItem(
        this.nftContract?.target,
        tokenId,
        { value: ethers.parseEther(price) }
      )
      
      const receipt = await tx.wait()
      
      this.logger.info(`NFT purchased successfully`)
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      this.logger.error('Failed to buy NFT:', error)
      throw error
    }
  }

  /**
   * Obtiene NFTs listados en el marketplace
   */
  async getListedNFTs(): Promise<any[]> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Marketplace contract not initialized')
      }
      
      const listedItems = await this.marketplaceContract.getListedItems()
      const nfts = []
      
      for (const item of listedItems) {
        try {
          const nft = await this.getNFT(item.tokenId.toString())
          if (nft) {
            nfts.push({
              ...nft,
              price: ethers.formatEther(item.price),
              seller: item.seller,
              isListed: true
            })
          }
        } catch (error) {
          this.logger.warn(`Failed to get listed NFT ${item.tokenId}:`, error)
        }
      }
      
      return nfts
    } catch (error) {
      this.logger.error('Failed to get listed NFTs:', error)
      return []
    }
  }

  /**
   * Obtiene colecciones de NFTs
   */
  async getCollections(): Promise<NFTCollection[]> {
    try {
      // This would require querying multiple contracts
      // For now, return the main collection if available
      if (!this.nftContract) {
        return []
      }
      
      const [name, symbol, totalSupply, owner] = await Promise.all([
        this.nftContract.name(),
        this.nftContract.symbol(),
        this.nftContract.totalSupply(),
        this.nftContract.owner()
      ])
      
      return [{
        address: this.nftContract.target as string,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        owner,
        metadata: {
          name,
          description: 'Metaverso NFT Collection',
          image: '',
          attributes: [],
          properties: {}
        }
      }]
    } catch (error) {
      this.logger.error('Failed to get collections:', error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de NFTs
   */
  async getStats(): Promise<any> {
    try {
      if (!this.nftContract) {
        return {
          totalSupply: '0',
          totalOwners: '0',
          totalTransfers: '0'
        }
      }
      
      const totalSupply = await this.nftContract.totalSupply()
      
      return {
        totalSupply: totalSupply.toString(),
        totalOwners: '0', // Would require additional queries
        totalTransfers: '0' // Would require event queries
      }
    } catch (error) {
      this.logger.error('Failed to get stats:', error)
      return {
        totalSupply: '0',
        totalOwners: '0',
        totalTransfers: '0'
      }
    }
  }

  /**
   * Limpia recursos
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up NFT Manager...')
      this.isInitialized = false
      this.logger.info('NFT Manager cleaned up successfully')
    } catch (error) {
      this.logger.error('Failed to cleanup NFT Manager:', error)
      throw error
    }
  }

  /**
   * Obtiene ABI del contrato NFT
   */
  private getNFTABI(): any[] {
    return [
      'function name() external view returns (string)',
      'function symbol() external view returns (string)',
      'function totalSupply() external view returns (uint256)',
      'function ownerOf(uint256 tokenId) external view returns (address)',
      'function tokenURI(uint256 tokenId) external view returns (string)',
      'function balanceOf(address owner) external view returns (uint256)',
      'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
      'function mint(address to, string memory tokenURI) external returns (uint256)',
      'function transferFrom(address from, address to, uint256 tokenId) external',
      'function approve(address to, uint256 tokenId) external',
      'function owner() external view returns (address)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ]
  }

  /**
   * Obtiene ABI del contrato Marketplace
   */
  private getMarketplaceABI(): any[] {
    return [
      'function listItem(address nftContract, uint256 tokenId, uint256 price, uint256 duration) external',
      'function buyItem(address nftContract, uint256 tokenId) external payable',
      'function getListedItems() external view returns (tuple(address seller, uint256 price, uint256 tokenId, bool isListed)[])',
      'function getItem(address nftContract, uint256 tokenId) external view returns (address seller, uint256 price, bool isListed)'
    ]
  }
} 