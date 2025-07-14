/**
 * @fileoverview Utilidades para redes blockchain
 * @module @types/blockchain/redes_blokchains/utils
 */

import { BlockchainNetwork, NetworkId, NetworkType } from './network';
import { DetectionContext } from './context';

/**
 * Funciones utilitarias para redes blockchain
 */
export interface NetworkUtils {
  normalizeChainId: (chainId: string | number) => string;
  compareNetworks: (a: BlockchainNetwork, b: BlockchainNetwork) => boolean;
  isTestnet: (network: BlockchainNetwork) => boolean;
  isMainnet: (network: BlockchainNetwork) => boolean;
  getNetworkByChainId: (chainId: string | number) => BlockchainNetwork | null;
  getNetworkByName: (name: string) => BlockchainNetwork | null;
  getNetworkBySymbol: (symbol: string) => BlockchainNetwork | null;
  detectFromContext: (context: DetectionContext) => BlockchainNetwork | null;
} 