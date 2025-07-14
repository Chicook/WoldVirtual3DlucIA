export interface NetworkInfo {
  id: string
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  contracts: {
    [key: string]: string
  }
  isTestnet: boolean
  isActive: boolean
}

export const NETWORKS: { [key: string]: NetworkInfo } = {
  // Mainnets
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.ETHEREUM_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.ETHEREUM_METAVERSO_NFT || '0x...',
      marketplace: process.env.ETHEREUM_MARKETPLACE || '0x...',
      uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      aaveLendingPool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      compoundComptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
      curveRegistry: '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5',
      balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      synthetixProxy: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
      yearnRegistry: '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804'
    },
    isTestnet: false,
    isActive: true
  },

  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.POLYGON_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.POLYGON_METAVERSO_NFT || '0x...',
      marketplace: process.env.POLYGON_MARKETPLACE || '0x...',
      uniswapV2Router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      aaveLendingPool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      curveRegistry: '0x094d12e5b541784701FD8d65F11fc0598FBC6332',
      balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
    },
    isTestnet: false,
    isActive: true
  },

  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.ARBITRUM_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.ARBITRUM_METAVERSO_NFT || '0x...',
      marketplace: process.env.ARBITRUM_MARKETPLACE || '0x...',
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      aaveLendingPool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      curveRegistry: '0x445FE580eF8d70FF569aB36e80c647af338db351',
      balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
    },
    isTestnet: false,
    isActive: true
  },

  optimism: {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.OPTIMISM_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.OPTIMISM_METAVERSO_NFT || '0x...',
      marketplace: process.env.OPTIMISM_MARKETPLACE || '0x...',
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      aaveLendingPool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      curveRegistry: '0x445FE580eF8d70FF569aB36e80c647af338db351'
    },
    isTestnet: false,
    isActive: true
  },

  bsc: {
    id: 'bsc',
    name: 'Binance Smart Chain',
    chainId: 56,
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.BSC_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.BSC_METAVERSO_NFT || '0x...',
      marketplace: process.env.BSC_MARKETPLACE || '0x...',
      pancakeRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      venusComptroller: '0xfD36E2c2a6789Db23113685031d7F16329158384'
    },
    isTestnet: false,
    isActive: true
  },

  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.AVALANCHE_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.AVALANCHE_METAVERSO_NFT || '0x...',
      marketplace: process.env.AVALANCHE_MARKETPLACE || '0x...',
      traderJoeRouter: '0x60aE616a2155Ee3d9A6854Ba25216C3cCc73c6b7',
      aaveLendingPool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    },
    isTestnet: false,
    isActive: true
  },

  fantom: {
    id: 'fantom',
    name: 'Fantom',
    chainId: 250,
    rpcUrl: process.env.FANTOM_RPC_URL || 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.FANTOM_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.FANTOM_METAVERSO_NFT || '0x...',
      marketplace: process.env.FANTOM_MARKETPLACE || '0x...',
      spookyRouter: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
      yearnRegistry: '0x727fe1759430df13655ddb0731dE0D0FDE860b10'
    },
    isTestnet: false,
    isActive: true
  },

  // Testnets
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.SEPOLIA_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.SEPOLIA_METAVERSO_NFT || '0x...',
      marketplace: process.env.SEPOLIA_MARKETPLACE || '0x...'
    },
    isTestnet: true,
    isActive: true
  },

  mumbai: {
    id: 'mumbai',
    name: 'Mumbai Testnet',
    chainId: 80001,
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.MUMBAI_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.MUMBAI_METAVERSO_NFT || '0x...',
      marketplace: process.env.MUMBAI_MARKETPLACE || '0x...'
    },
    isTestnet: true,
    isActive: true
  },

  arbitrumSepolia: {
    id: 'arbitrumSepolia',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      metaversoToken: process.env.ARBITRUM_SEPOLIA_METAVERSO_TOKEN || '0x...',
      metaversoNFT: process.env.ARBITRUM_SEPOLIA_METAVERSO_NFT || '0x...',
      marketplace: process.env.ARBITRUM_SEPOLIA_MARKETPLACE || '0x...'
    },
    isTestnet: true,
    isActive: true
  }
}

export const SUPPORTED_NETWORKS = Object.keys(NETWORKS).filter(id => NETWORKS[id].isActive)

export const MAINNET_NETWORKS = Object.keys(NETWORKS).filter(id => NETWORKS[id].isActive && !NETWORKS[id].isTestnet)

export const TESTNET_NETWORKS = Object.keys(NETWORKS).filter(id => NETWORKS[id].isActive && NETWORKS[id].isTestnet)

export const DEFAULT_NETWORK = 'polygon'

export const NETWORK_NAMES = Object.fromEntries(
  Object.entries(NETWORKS).map(([id, network]) => [id, network.name])
)

export const NETWORK_SYMBOLS = Object.fromEntries(
  Object.entries(NETWORKS).map(([id, network]) => [id, network.nativeCurrency.symbol])
)

export const CHAIN_IDS = Object.fromEntries(
  Object.entries(NETWORKS).map(([id, network]) => [id, network.chainId])
)

export function getNetworkById(id: string): NetworkInfo | null {
  return NETWORKS[id] || null
}

export function getNetworkByChainId(chainId: number): NetworkInfo | null {
  return Object.values(NETWORKS).find(network => network.chainId === chainId) || null
}

export function isNetworkSupported(id: string): boolean {
  return SUPPORTED_NETWORKS.includes(id)
}

export function isMainnet(id: string): boolean {
  const network = NETWORKS[id]
  return network ? !network.isTestnet : false
}

export function isTestnet(id: string): boolean {
  const network = NETWORKS[id]
  return network ? network.isTestnet : false
} 