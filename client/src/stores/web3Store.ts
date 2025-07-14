import { Web3State, Web3Action } from '@/types/web3'

export const web3Reducer = (state: Web3State, action: Web3Action): Web3State => {
  switch (action.type) {
    case 'SET_CONNECTING':
      return {
        ...state,
        isConnecting: action.payload
      }
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        account: action.payload.account,
        chainId: action.payload.chainId,
        provider: action.payload.provider,
        signer: action.payload.signer,
        balance: action.payload.balance,
        error: null
      }
    case 'SET_DISCONNECTED':
      return {
        ...state,
        isConnected: false,
        isConnecting: false,
        account: null,
        chainId: null,
        provider: null,
        signer: null,
        balance: '0',
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isConnecting: false
      }
    case 'SET_BALANCE':
      return {
        ...state,
        balance: action.payload
      }
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.payload
      }
    default:
      return state
  }
} 