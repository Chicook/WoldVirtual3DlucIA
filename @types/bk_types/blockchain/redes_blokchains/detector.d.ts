/**
 * @fileoverview Tipos para la detección de red blockchain
 * @module @types/blockchain/redes_blokchains/detector
 */

import { BlockchainNetwork, NetworkId, NetworkStatus, NetworkType } from './network';

/** Métodos de detección soportados */
export enum DetectionMethod {
  WALLET = 'wallet',
  CHAIN_ID = 'chain_id',
  RPC_URL = 'rpc_url',
  EXPLORER_URL = 'explorer_url',
  NETWORK_NAME = 'network_name',
  SYMBOL = 'symbol',
  AUTO = 'auto',
  MANUAL = 'manual',
  HEURISTIC = 'heuristic'
}

/** Resultado de la detección */
export interface DetectionResult {
  network: BlockchainNetwork | null;
  method: DetectionMethod;
  confidence: number; // 0-1
  detectedAt: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Interfaz principal del detector de red
 */
export interface NetworkDetectorCore {
  detect: (context: DetectionContext) => Promise<DetectionResult>;
  supportedMethods: DetectionMethod[];
  lastResult?: DetectionResult;
  metadata?: Record<string, any>;
}

/**
 * Contexto de detección (importado de context.d.ts)
 */
import type { DetectionContext } from './context';
