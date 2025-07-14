export const CHAIN_CONFIG = {
  1: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    explorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      metaversoToken: '0x...',
      metaversoNFT: '0x...',
      marketplace: '0x...'
    }
  },
  137: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    contracts: {
      metaversoToken: '0x...',
      metaversoNFT: '0x...',
      marketplace: '0x...'
    }
  },
  56: {
    name: 'Binance Smart Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    contracts: {
      metaversoToken: '0x...',
      metaversoNFT: '0x...',
      marketplace: '0x...'
    }
  },
  43114: {
    name: 'Avalanche',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    },
    contracts: {
      metaversoToken: '0x...',
      metaversoNFT: '0x...',
      marketplace: '0x...'
    }
  },
  250: {
    name: 'Fantom',
    chainId: 250,
    rpcUrl: 'https://rpc.ftm.tools',
    explorer: 'https://ftmscan.com',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18
    },
    contracts: {
      metaversoToken: '0x...',
      metaversoNFT: '0x...',
      marketplace: '0x...'
    }
  }
} as const

export const SUPPORTED_CHAINS = Object.keys(CHAIN_CONFIG).map(Number)

export const DEFAULT_CHAIN_ID = 137 // Polygon por defecto

export const CHAIN_NAMES = {
  1: 'Ethereum',
  137: 'Polygon',
  56: 'BSC',
  43114: 'Avalanche',
  250: 'Fantom'
} as const

export const CHAIN_SYMBOLS = {
  1: 'ETH',
  137: 'MATIC',
  56: 'BNB',
  43114: 'AVAX',
  250: 'FTM'
} as const 