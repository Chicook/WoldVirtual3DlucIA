/**
 * @fileoverview Tipos para validación de compatibilidad de red blockchain
 * @module @types/blockchain/redes_blokchains/compatibility
 */

import { BlockchainNetwork, NetworkId } from './network';

/** Resultado de validación de compatibilidad */
export interface CompatibilityResult {
  compatible: boolean;
  reasons?: string[];
  network: BlockchainNetwork;
  walletProvider?: any;
  metadata?: Record<string, any>;
}

/**
 * Función de validación de compatibilidad
 */
export interface CompatibilityValidator {
  validate: (network: BlockchainNetwork, walletProvider?: any) => CompatibilityResult;
} 