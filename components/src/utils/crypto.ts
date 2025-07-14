import { ethers } from 'ethers';

// ============================================================================
// 💰 UTILIDADES CRYPTO - Integración Blockchain
// ============================================================================

/**
 * Configuración de redes blockchain
 */
export const NETWORKS = {
  ethereum: {
    mainnet: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      explorer: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    goerli: {
      chainId: 5,
      name: 'Goerli Testnet',
      rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
      explorer: 'https://goerli.etherscan.io',
      nativeCurrency: {
        name: 'Goerli Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }
  },
  polygon: {
    mainnet: {
      chainId: 137,
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      explorer: 'https://polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    mumbai: {
      chainId: 80001,
      name: 'Mumbai Testnet',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      explorer: 'https://mumbai.polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    }
  }
} as const;

/**
 * Utilidades de wallet
 */
export const wallet = {
  /**
   * Conectar wallet MetaMask
   */
  connectMetaMask: async (): Promise<ethers.providers.Web3Provider> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask no está instalado');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return provider;
    } catch (error) {
      throw new Error(`Error al conectar MetaMask: ${error}`);
    }
  },

  /**
   * Conectar wallet WalletConnect
   */
  connectWalletConnect: async (): Promise<ethers.providers.Web3Provider> => {
    // Implementar WalletConnect
    throw new Error('WalletConnect no implementado');
  },

  /**
   * Obtener cuenta conectada
   */
  getConnectedAccount: async (provider: ethers.providers.Web3Provider): Promise<string> => {
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error('No hay cuentas conectadas');
    }
    return accounts[0];
  },

  /**
   * Obtener balance de ETH
   */
  getBalance: async (provider: ethers.providers.Web3Provider, address: string): Promise<string> => {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  },

  /**
   * Cambiar red
   */
  switchNetwork: async (chainId: number): Promise<void> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask no está instalado');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error) {
      throw new Error(`Error al cambiar red: ${error}`);
    }
  }
};

/**
 * Utilidades de tokens
 */
export const tokens = {
  /**
   * Crear instancia de token ERC-20
   */
  createERC20: (address: string, provider: ethers.providers.Provider): ethers.Contract => {
    const abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];

    return new ethers.Contract(address, abi, provider);
  },

  /**
   * Obtener información del token
   */
  getTokenInfo: async (tokenContract: ethers.Contract) => {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals)
    };
  },

  /**
   * Obtener balance de token
   */
  getTokenBalance: async (tokenContract: ethers.Contract, address: string): Promise<string> => {
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  },

  /**
   * Transferir tokens
   */
  transferTokens: async (
    tokenContract: ethers.Contract,
    to: string,
    amount: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> => {
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);
    
    const contractWithSigner = tokenContract.connect(signer);
    return contractWithSigner.transfer(to, amountWei);
  }
};

/**
 * Utilidades de NFTs
 */
export const nfts = {
  /**
   * Crear instancia de NFT ERC-721
   */
  createERC721: (address: string, provider: ethers.providers.Provider): ethers.Contract => {
    const abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function tokenURI(uint256 tokenId) view returns (string)',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function balanceOf(address owner) view returns (uint256)',
      'function transferFrom(address from, address to, uint256 tokenId)',
      'function approve(address to, uint256 tokenId)',
      'function getApproved(uint256 tokenId) view returns (address)',
      'function setApprovalForAll(address operator, bool approved)',
      'function isApprovedForAll(address owner, address operator) view returns (bool)'
    ];

    return new ethers.Contract(address, abi, provider);
  },

  /**
   * Obtener metadatos del NFT
   */
  getNFTMetadata: async (tokenContract: ethers.Contract, tokenId: string) => {
    try {
      const tokenURI = await tokenContract.tokenURI(tokenId);
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      
      return {
        tokenId,
        tokenURI,
        ...metadata
      };
    } catch (error) {
      throw new Error(`Error al obtener metadatos del NFT: ${error}`);
    }
  },

  /**
   * Obtener NFTs de una dirección
   */
  getNFTsByOwner: async (tokenContract: ethers.Contract, owner: string) => {
    try {
      const balance = await tokenContract.balanceOf(owner);
      const nfts = [];

      for (let i = 0; i < balance.toNumber(); i++) {
        // Esto requeriría eventos o un índice para obtener todos los tokenIds
        // Por simplicidad, asumimos que tenemos los tokenIds
        // En una implementación real, necesitarías indexar los eventos Transfer
      }

      return nfts;
    } catch (error) {
      throw new Error(`Error al obtener NFTs: ${error}`);
    }
  },

  /**
   * Transferir NFT
   */
  transferNFT: async (
    tokenContract: ethers.Contract,
    from: string,
    to: string,
    tokenId: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> => {
    const contractWithSigner = tokenContract.connect(signer);
    return contractWithSigner.transferFrom(from, to, tokenId);
  }
};

/**
 * Utilidades de transacciones
 */
export const transactions = {
  /**
   * Enviar transacción ETH
   */
  sendETH: async (
    provider: ethers.providers.Web3Provider,
    to: string,
    amount: string,
    gasLimit?: number
  ): Promise<ethers.ContractTransaction> => {
    const signer = provider.getSigner();
    const amountWei = ethers.utils.parseEther(amount);
    
    const tx = {
      to,
      value: amountWei,
      gasLimit: gasLimit || 21000
    };

    return signer.sendTransaction(tx);
  },

  /**
   * Obtener estado de transacción
   */
  getTransactionStatus: async (
    provider: ethers.providers.Provider,
    txHash: string
  ): Promise<'pending' | 'confirmed' | 'failed'> => {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return 'pending';
      }
      
      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      return 'failed';
    }
  },

  /**
   * Esperar confirmación de transacción
   */
  waitForTransaction: async (
    provider: ethers.providers.Provider,
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.providers.TransactionReceipt> => {
    return provider.waitForTransaction(txHash, confirmations);
  },

  /**
   * Obtener historial de transacciones
   */
  getTransactionHistory: async (
    provider: ethers.providers.Provider,
    address: string,
    startBlock: number = 0
  ): Promise<ethers.providers.TransactionResponse[]> => {
    // Esto requeriría un servicio como Etherscan API
    // Por simplicidad, retornamos un array vacío
    return [];
  }
};

/**
 * Utilidades de DeFi
 */
export const defi = {
  /**
   * Obtener precio de token desde DEX
   */
  getTokenPrice: async (
    tokenAddress: string,
    baseTokenAddress: string = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
  ): Promise<number> => {
    // Implementar consulta a DEX (Uniswap, SushiSwap, etc.)
    // Por simplicidad, retornamos un precio falso
    return 1.0;
  },

  /**
   * Realizar swap de tokens
   */
  swapTokens: async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> => {
    // Implementar swap usando DEX
    throw new Error('Swap no implementado');
  },

  /**
   * Obtener liquidez de pool
   */
  getPoolLiquidity: async (
    token0: string,
    token1: string
  ): Promise<{ token0: string; token1: string }> => {
    // Implementar consulta de liquidez
    return { token0: '0', token1: '0' };
  }
};

/**
 * Utilidades de seguridad
 */
export const security = {
  /**
   * Validar dirección Ethereum
   */
  isValidAddress: (address: string): boolean => {
    return ethers.utils.isAddress(address);
  },

  /**
   * Obtener checksum de dirección
   */
  getChecksumAddress: (address: string): string => {
    return ethers.utils.getAddress(address);
  },

  /**
   * Validar transacción antes de enviar
   */
  validateTransaction: (tx: {
    to: string;
    value: string;
    gasLimit?: number;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!security.isValidAddress(tx.to)) {
      errors.push('Dirección de destino inválida');
    }

    if (parseFloat(tx.value) < 0) {
      errors.push('Valor de transacción inválido');
    }

    if (tx.gasLimit && tx.gasLimit < 21000) {
      errors.push('Gas limit muy bajo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Firmar mensaje
   */
  signMessage: async (
    signer: ethers.Signer,
    message: string
  ): Promise<string> => {
    return signer.signMessage(message);
  },

  /**
   * Verificar firma de mensaje
   */
  verifyMessage: (
    message: string,
    signature: string
  ): string => {
    return ethers.utils.verifyMessage(message, signature);
  }
};

/**
 * Utilidades de eventos
 */
export const events = {
  /**
   * Escuchar eventos de contrato
   */
  listenToEvents: (
    contract: ethers.Contract,
    eventName: string,
    callback: (event: ethers.Event) => void
  ): void => {
    contract.on(eventName, callback);
  },

  /**
   * Obtener eventos pasados
   */
  getPastEvents: async (
    contract: ethers.Contract,
    eventName: string,
    fromBlock: number = 0,
    toBlock: number = 'latest'
  ): Promise<ethers.Event[]> => {
    const filter = contract.filters[eventName]();
    return contract.queryFilter(filter, fromBlock, toBlock);
  }
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default {
  NETWORKS,
  wallet,
  tokens,
  nfts,
  transactions,
  defi,
  security,
  events
}; 