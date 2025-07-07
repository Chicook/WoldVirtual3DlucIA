/**
 * @fileoverview Utilidad de blockchain para el backend del metaverso
 * @module backend/src/utils/blockchain
 */

import { ethers } from 'ethers';

/**
 * Interfaz para configuración de blockchain
 */
export interface BlockchainConfig {
  network: string;
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  privateKey?: string;
}

/**
 * Interfaz para transacción
 */
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  data: string;
  nonce: number;
}

/**
 * Interfaz para evento de blockchain
 */
export interface BlockchainEvent {
  event: string;
  args: any[];
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

/**
 * Clase para manejo de blockchain
 */
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private contract?: ethers.Contract;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  /**
   * Verificar firma de wallet
   */
  async verifyWalletSignature(wallet: string, signature: string, message: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === wallet.toLowerCase();
    } catch (error) {
      console.error('Error verificando firma de wallet:', error);
      return false;
    }
  }

  /**
   * Obtener balance de ETH
   */
  async getEthBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error obteniendo balance de ETH:', error);
      throw error;
    }
  }

  /**
   * Obtener balance de token ERC-20
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      );

      const balance = await tokenContract.balanceOf(walletAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error obteniendo balance de token:', error);
      throw error;
    }
  }

  /**
   * Enviar transacción ETH
   */
  async sendEthTransaction(to: string, amount: string, gasLimit?: string): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet no configurada');
    }

    try {
      const tx = {
        to,
        value: ethers.utils.parseEther(amount),
        gasLimit: gasLimit ? ethers.BigNumber.from(gasLimit) : undefined
      };

      const transaction = await this.wallet.sendTransaction(tx);
      
      return {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to!,
        value: transaction.value.toString(),
        gasLimit: transaction.gasLimit?.toString() || '0',
        gasPrice: transaction.gasPrice?.toString() || '0',
        data: transaction.data,
        nonce: transaction.nonce
      };
    } catch (error) {
      console.error('Error enviando transacción ETH:', error);
      throw error;
    }
  }

  /**
   * Enviar token ERC-20
   */
  async sendTokenTransaction(
    tokenAddress: string,
    to: string,
    amount: string,
    gasLimit?: string
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet no configurada');
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        this.wallet
      );

      const tx = await tokenContract.transfer(to, ethers.utils.parseEther(amount), {
        gasLimit: gasLimit ? ethers.BigNumber.from(gasLimit) : undefined
      });

      return {
        hash: tx.hash,
        from: tx.from,
        to: tokenAddress,
        value: '0',
        gasLimit: tx.gasLimit?.toString() || '0',
        gasPrice: tx.gasPrice?.toString() || '0',
        data: tx.data,
        nonce: tx.nonce
      };
    } catch (error) {
      console.error('Error enviando token:', error);
      throw error;
    }
  }

  /**
   * Obtener información de transacción
   */
  async getTransactionInfo(txHash: string): Promise<any> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.utils.formatEther(tx.value),
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice?.toString(),
        data: tx.data,
        nonce: tx.nonce,
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations,
        status: receipt?.status,
        gasUsed: receipt?.gasUsed.toString(),
        effectiveGasPrice: receipt?.effectiveGasPrice?.toString()
      };
    } catch (error) {
      console.error('Error obteniendo información de transacción:', error);
      throw error;
    }
  }

  /**
   * Obtener eventos de contrato
   */
  async getContractEvents(
    contractAddress: string,
    abi: any[],
    eventName: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<BlockchainEvent[]> {
    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      const events = await contract.queryFilter(
        contract.filters[eventName](),
        fromBlock || 0,
        toBlock || 'latest'
      );

      return events.map(event => ({
        event: event.event,
        args: event.args,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex
      }));
    } catch (error) {
      console.error('Error obteniendo eventos de contrato:', error);
      throw error;
    }
  }

  /**
   * Crear NFT (ERC-721)
   */
  async createNFT(
    contractAddress: string,
    to: string,
    tokenURI: string,
    gasLimit?: string
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet no configurada');
    }

    try {
      const nftContract = new ethers.Contract(
        contractAddress,
        ['function mint(address to, string memory tokenURI) returns (uint256)'],
        this.wallet
      );

      const tx = await nftContract.mint(to, tokenURI, {
        gasLimit: gasLimit ? ethers.BigNumber.from(gasLimit) : undefined
      });

      return {
        hash: tx.hash,
        from: tx.from,
        to: contractAddress,
        value: '0',
        gasLimit: tx.gasLimit?.toString() || '0',
        gasPrice: tx.gasPrice?.toString() || '0',
        data: tx.data,
        nonce: tx.nonce
      };
    } catch (error) {
      console.error('Error creando NFT:', error);
      throw error;
    }
  }

  /**
   * Transferir NFT
   */
  async transferNFT(
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    gasLimit?: string
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet no configurada');
    }

    try {
      const nftContract = new ethers.Contract(
        contractAddress,
        ['function transferFrom(address from, address to, uint256 tokenId)'],
        this.wallet
      );

      const tx = await nftContract.transferFrom(from, to, tokenId, {
        gasLimit: gasLimit ? ethers.BigNumber.from(gasLimit) : undefined
      });

      return {
        hash: tx.hash,
        from: tx.from,
        to: contractAddress,
        value: '0',
        gasLimit: tx.gasLimit?.toString() || '0',
        gasPrice: tx.gasPrice?.toString() || '0',
        data: tx.data,
        nonce: tx.nonce
      };
    } catch (error) {
      console.error('Error transfiriendo NFT:', error);
      throw error;
    }
  }

  /**
   * Obtener información de NFT
   */
  async getNFTInfo(contractAddress: string, tokenId: string): Promise<any> {
    try {
      const nftContract = new ethers.Contract(
        contractAddress,
        [
          'function ownerOf(uint256 tokenId) view returns (address)',
          'function tokenURI(uint256 tokenId) view returns (string)',
          'function name() view returns (string)',
          'function symbol() view returns (string)'
        ],
        this.provider
      );

      const [owner, tokenURI, name, symbol] = await Promise.all([
        nftContract.ownerOf(tokenId),
        nftContract.tokenURI(tokenId),
        nftContract.name(),
        nftContract.symbol()
      ]);

      return {
        tokenId,
        owner,
        tokenURI,
        name,
        symbol,
        contractAddress
      };
    } catch (error) {
      console.error('Error obteniendo información de NFT:', error);
      throw error;
    }
  }

  /**
   * Verificar si una dirección es válida
   */
  static isValidAddress(address: string): boolean {
    try {
      ethers.utils.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener checksum de dirección
   */
  static getChecksumAddress(address: string): string {
    return ethers.utils.getAddress(address);
  }

  /**
   * Crear mensaje para firma
   */
  static createSignMessage(nonce: string, timestamp: number): string {
    return `Metaverso Login\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nSign this message to authenticate with the Metaverso platform.`;
  }

  /**
   * Generar nonce único
   */
  static generateNonce(): string {
    return ethers.utils.randomBytes(32).toString('hex');
  }

  /**
   * Obtener precio de gas
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      console.error('Error obteniendo precio de gas:', error);
      throw error;
    }
  }

  /**
   * Estimar gas para transacción
   */
  async estimateGas(tx: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to: tx.to,
        value: tx.value ? ethers.utils.parseEther(tx.value) : undefined,
        data: tx.data
      });

      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimando gas:', error);
      throw error;
    }
  }

  /**
   * Obtener información de red
   */
  async getNetworkInfo(): Promise<any> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      };
    } catch (error) {
      console.error('Error obteniendo información de red:', error);
      throw error;
    }
  }
}

// Configuraciones predefinidas
export const NETWORKS = {
  ethereum: {
    mainnet: {
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      chainId: 1,
      explorer: 'https://etherscan.io'
    },
    goerli: {
      name: 'Goerli Testnet',
      rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
      chainId: 5,
      explorer: 'https://goerli.etherscan.io'
    },
    sepolia: {
      name: 'Sepolia Testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      chainId: 11155111,
      explorer: 'https://sepolia.etherscan.io'
    }
  },
  polygon: {
    mainnet: {
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      explorer: 'https://polygonscan.com'
    },
    mumbai: {
      name: 'Mumbai Testnet',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      explorer: 'https://mumbai.polygonscan.com'
    }
  }
};

// Función de conveniencia para verificar firma
export const verifyWalletSignature = async (
  wallet: string,
  signature: string,
  message: string
): Promise<boolean> => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === wallet.toLowerCase();
  } catch (error) {
    console.error('Error verificando firma de wallet:', error);
    return false;
  }
};

export default BlockchainService; 