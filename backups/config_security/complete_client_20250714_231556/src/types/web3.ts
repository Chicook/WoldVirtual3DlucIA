import { ethers } from 'ethers'

export interface Web3State {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  account: string | null
  chainId: number | null
  balance: string | null
  provider: ethers.Provider | null
  signer: ethers.Signer | null
}

export interface Network {
  name: string
  chainId: number
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasLimit: bigint
  gasPrice: bigint
  nonce: number
  data: string
  chainId: number
  receipt?: ethers.TransactionReceipt
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  blockNumber?: number
}

export interface PendingTransaction {
  hash: string
  from: string
  to: string
  value: string
  gasLimit: string
  gasPrice: string
  data: string
  nonce: number
  chainId: number
}

export type Web3Action =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: { account: string; chainId: number; provider: ethers.Provider; signer: ethers.Signer; balance: string } }
  | { type: 'SET_DISCONNECTED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_CHAIN_ID'; payload: number }

export interface Web3ProviderProps {
  children: React.ReactNode
}

export interface WalletConfig {
  name: string
  icon: string
  supported: boolean
  installed: boolean
  connect: () => Promise<void>
  disconnect: () => void
  getAccounts: () => Promise<string[]>
  getChainId: () => Promise<number>
  switchChain: (chainId: number) => Promise<void>
  addChain: (chain: NetworkConfig) => Promise<void>
}

export interface ChainConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface ContractInfo {
  name: string
  address: string
  abi: any[]
  contract: ethers.Contract
}

export interface Contract {
  address: string
  name: string
  abi: any[]
  bytecode?: string
  deployedBytecode?: string
  network: string
  chainId: number
  verified: boolean
  constructorArgs?: any[]
  libraries?: Record<string, string>
  optimizer?: {
    enabled: boolean
    runs: number
  }
  metadata?: {
    compiler: {
      version: string
    }
    language: string
    output: any
    settings: any
    sources: Record<string, any>
  }
}

export interface ContractEvent {
  name: string
  signature: string
  topic: string
  inputs: {
    name: string
    type: string
    indexed: boolean
  }[]
  anonymous: boolean
}

export interface ContractFunction {
  name: string
  signature: string
  inputs: {
    name: string
    type: string
  }[]
  outputs: {
    name: string
    type: string
  }[]
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
  payable: boolean
  constant: boolean
}

export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockTime: number
  contracts: Record<string, string>
}

export interface Web3Provider {
  provider: ethers.Provider
  signer: ethers.Signer
  account: string
  chainId: number
  isConnected: boolean
}

export interface GasConfig {
  gasLimit: bigint
  gasPrice: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export interface TransactionResult {
  success: boolean
  hash?: string
  error?: string
  receipt?: ethers.TransactionReceipt
  gasUsed?: bigint
  effectiveGasPrice?: bigint
}

export interface SyncState {
  isSyncing: boolean
  currentBlock: number
  highestBlock: number
  startingBlock: number
  progress: number
}

export interface NetworkEvent {
  type: 'chainChanged' | 'accountsChanged' | 'connect' | 'disconnect'
  data: any
  timestamp: number
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      selectedAddress?: string
      chainId?: string
      networkVersion?: string
      isConnected: () => boolean
    }
  }
} 