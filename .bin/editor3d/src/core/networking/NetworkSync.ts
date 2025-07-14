/**
 * 🌐 NetworkSync - Sincronización de Red en Tiempo Real
 * 
 * Responsabilidades:
 * - Sincronización P2P de objetos 3D
 * - Interpolación de movimiento
 * - Predicción de movimiento
 * - Compresión de datos
 * - Gestión de latencia
 * - Escalabilidad de red
 */

import * as THREE from 'three';

// Verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface NetworkObject {
  id: string;
  object: THREE.Object3D;
  owner: string;
  lastUpdate: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  velocity: THREE.Vector3;
  interpolation: {
    enabled: boolean;
    delay: number;
    buffer: Array<{ time: number; position: THREE.Vector3; rotation: THREE.Euler }>;
  };
}

export interface NetworkConfig {
  p2p: boolean;
  maxPlayers: number;
  syncRate: number;
  interpolation: boolean;
  compression: boolean;
  prediction: boolean;
}

export class NetworkSync {
  private objects: Map<string, NetworkObject> = new Map();
  private config: NetworkConfig;
  private isInitialized: boolean = false;
  private peerConnection: any = null;
  private dataChannel: any = null;
  private lastSync: number = 0;

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = {
      p2p: true,
      maxPlayers: 100,
      syncRate: 60,
      interpolation: true,
      compression: true,
      prediction: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[🌐] NetworkSync ya está inicializado');
      return;
    }

    console.log('[🌐] Inicializando NetworkSync...');

    try {
      if (this.config.p2p && isBrowser) {
        await this.initializeP2P();
      }

      this.isInitialized = true;
      console.log('[✅] NetworkSync inicializado correctamente');
    } catch (error) {
      console.error('[❌] Error inicializando NetworkSync:', error);
      throw error;
    }
  }

  private async initializeP2P(): Promise<void> {
    if (!isBrowser) return;

    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      this.dataChannel = this.peerConnection.createDataChannel('sync', {
        ordered: false,
        maxRetransmits: 0
      });

      this.dataChannel.onmessage = (event: any) => {
        this.handleMessage(event.data);
      };

      console.log('[🌐] Conexión P2P inicializada');
    } catch (error) {
      console.warn('[⚠️] P2P no disponible:', error);
      this.config.p2p = false;
    }
  }
} 