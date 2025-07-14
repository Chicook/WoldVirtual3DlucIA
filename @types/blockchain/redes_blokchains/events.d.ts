/**
 * @fileoverview Tipos para eventos de red blockchain
 * @module @types/blockchain/redes_blokchains/events
 */

import { BlockchainNetwork, NetworkId, NetworkStatus } from './network';
import { DetectionResult } from './detector';

/** Tipos de eventos de red */
export enum NetworkEventType {
  DETECTED = 'detected',
  CHANGED = 'changed',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/** Evento de red */
export interface NetworkEvent {
  type: NetworkEventType;
  network: BlockchainNetwork | null;
  previousNetwork?: BlockchainNetwork | null;
  result?: DetectionResult;
  timestamp: number;
  error?: string;
  metadata?: Record<string, any>;
}

/** Listener de eventos de red */
export interface NetworkEventListener {
  (event: NetworkEvent): void;
} 