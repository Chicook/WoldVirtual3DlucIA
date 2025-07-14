/**
 * @fileoverview Tipos para el contexto de detección de red blockchain
 * @module @types/blockchain/redes_blokchains/context
 */

import { NetworkId, NetworkType } from './network';

/**
 * Contexto de detección de red
 */
export interface DetectionContext {
  walletProvider?: any; // Ej: window.ethereum, WalletConnect, etc.
  chainId?: number | string;
  rpcUrl?: string;
  explorerUrl?: string;
  networkName?: string;
  symbol?: string;
  userAgent?: string;
  platform?: string;
  language?: string;
  location?: string;
  isMobile?: boolean;
  isDappBrowser?: boolean;
  timestamp: number;
  metadata?: Record<string, any>;
} 