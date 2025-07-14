/**
 * NetworkSync - Sincronización de Red
 * 
 * Sistema de sincronización en tiempo real para colaboración
 * en el editor 3D del metaverso.
 */

import { EventEmitter } from '../events/EventEmitter';
import { NetworkManager } from './NetworkManager';
import { NetworkMessage } from './NetworkMessage';
import { NetworkPeer } from './NetworkPeer';

export interface SyncEvents {
  'sync:started': { sync: NetworkSync };
  'sync:stopped': { sync: NetworkSync };
  'data:received': { sync: NetworkSync; data: any; from: NetworkPeer };
  'data:sent': { sync: NetworkSync; data: any; to: NetworkPeer };
  'conflict:resolved': { sync: NetworkSync; conflict: SyncConflict; resolution: any };
  'error:sync': { sync: NetworkSync; error: Error; context: string };
}

export interface SyncConfig {
  id: string;
  name: string;
  type: SyncType;
  interval: number;
  compression: boolean;
  encryption: boolean;
  conflictResolution: ConflictResolution;
  metadata?: SyncMetadata;
}

export interface SyncMetadata {
  version: string;
  description: string;
  tags: string[];
  schema: any;
  validation: boolean;
}

export interface SyncData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  version: number;
  checksum: string;
  metadata?: any;
}

export interface SyncConflict {
  id: string;
  type: string;
  localData: any;
  remoteData: any;
  localTimestamp: number;
  remoteTimestamp: number;
  localVersion: number;
  remoteVersion: number;
  resolution: ConflictResolution;
}

export enum SyncType {
  SCENE = 'scene',
  ANIMATION = 'animation',
  MATERIAL = 'material',
  GEOMETRY = 'geometry',
  LIGHTING = 'lighting',
  AUDIO = 'audio',
  UI = 'ui',
  CUSTOM = 'custom'
}

export enum ConflictResolution {
  LAST_WRITE_WINS = 'last_write_wins',
  MANUAL = 'manual',
  MERGE = 'merge',
  IGNORE = 'ignore',
  CUSTOM = 'custom'
}

export enum SyncState {
  STOPPED = 'stopped',
  STARTING = 'starting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error'
}

export interface SyncStats {
  dataSent: number;
  dataReceived: number;
  conflictsResolved: number;
  errors: number;
  lastSync: number;
  uptime: number;
}

/**
 * Clase NetworkSync
 */
export class NetworkSync extends EventEmitter<SyncEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly type: SyncType;
  public readonly config: SyncConfig;
  public readonly metadata: SyncMetadata | null;

  private _state: SyncState = SyncState.STOPPED;
  private _stats: SyncStats;
  private _version: number = 0;
  private _data: Map<string, SyncData> = new Map();
  private _conflicts: Map<string, SyncConflict> = new Map();
  private _syncTimer: NodeJS.Timeout | null = null;
  private _startTime: number = 0;
  private _lastSync: number = 0;

  constructor(networkManager: NetworkManager, config: SyncConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.config = config;
    this.metadata = config.metadata || null;

    this._stats = {
      dataSent: 0,
      dataReceived: 0,
      conflictsResolved: 0,
      errors: 0,
      lastSync: 0,
      uptime: 0
    };
  }

  /**
   * Inicia la sincronización
   */
  start(): void {
    if (this._state === SyncState.ACTIVE) {
      return;
    }

    this._setState(SyncState.STARTING);
    this._startTime = Date.now();
    this._version = 0;

    // Iniciar timer de sincronización
    this._syncTimer = setInterval(() => {
      this._performSync();
    }, this.config.interval);

    this._setState(SyncState.ACTIVE);
    this.emit('sync:started', { sync: this });
  }

  /**
   * Detiene la sincronización
   */
  stop(): void {
    if (this._state === SyncState.STOPPED) {
      return;
    }

    if (this._syncTimer) {
      clearInterval(this._syncTimer);
      this._syncTimer = null;
    }

    this._setState(SyncState.STOPPED);
    this.emit('sync:stopped', { sync: this });
  }

  /**
   * Pausa la sincronización
   */
  pause(): void {
    if (this._state === SyncState.ACTIVE) {
      this._setState(SyncState.PAUSED);
    }
  }

  /**
   * Reanuda la sincronización
   */
  resume(): void {
    if (this._state === SyncState.PAUSED) {
      this._setState(SyncState.ACTIVE);
    }
  }

  /**
   * Sincroniza datos específicos
   */
  syncData(data: any, type: string = 'custom'): void {
    if (this._state !== SyncState.ACTIVE) {
      return;
    }

    const syncData: SyncData = {
      id: `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      version: ++this._version,
      checksum: this._calculateChecksum(data),
      metadata: this.metadata
    };

    this._data.set(syncData.id, syncData);
    this._broadcastData(syncData);
  }

  /**
   * Maneja datos recibidos de otros peers
   */
  handleData(data: any, from: NetworkPeer): void {
    try {
      const syncData = data as SyncData;
      
      // Validar datos
      if (!this._validateData(syncData)) {
        throw new Error('Invalid sync data');
      }

      // Verificar si ya tenemos estos datos
      const existingData = this._data.get(syncData.id);
      if (existingData) {
        // Resolver conflicto si es necesario
        if (existingData.version !== syncData.version) {
          this._resolveConflict(existingData, syncData, from);
        }
        return;
      }

      // Agregar nuevos datos
      this._data.set(syncData.id, syncData);
      this._stats.dataReceived++;
      this._stats.lastSync = Date.now();

      this.emit('data:received', { sync: this, data: syncData, from });
    } catch (error) {
      this._stats.errors++;
      this.emit('error:sync', { sync: this, error: error as Error, context: 'handle_data' });
    }
  }

  /**
   * Resuelve un conflicto manualmente
   */
  resolveConflict(conflictId: string, resolution: any): boolean {
    const conflict = this._conflicts.get(conflictId);
    if (!conflict) {
      return false;
    }

    // Aplicar resolución
    const resolvedData = this._applyResolution(conflict, resolution);
    if (resolvedData) {
      this._data.set(conflictId, resolvedData);
      this._conflicts.delete(conflictId);
      this._stats.conflictsResolved++;
      
      this.emit('conflict:resolved', { sync: this, conflict, resolution });
      return true;
    }

    return false;
  }

  /**
   * Obtiene datos sincronizados
   */
  getData(dataId: string): SyncData | null {
    return this._data.get(dataId) || null;
  }

  /**
   * Obtiene todos los datos sincronizados
   */
  getAllData(): SyncData[] {
    return Array.from(this._data.values());
  }

  /**
   * Obtiene datos por tipo
   */
  getDataByType(type: string): SyncData[] {
    return Array.from(this._data.values()).filter(data => data.type === type);
  }

  /**
   * Obtiene conflictos pendientes
   */
  getConflicts(): SyncConflict[] {
    return Array.from(this._conflicts.values());
  }

  /**
   * Limpia datos antiguos
   */
  cleanupData(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 horas por defecto
    const now = Date.now();
    const toDelete: string[] = [];

    this._data.forEach((data, id) => {
      if (now - data.timestamp > maxAge) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => {
      this._data.delete(id);
    });
  }

  /**
   * Realiza sincronización
   */
  private _performSync(): void {
    if (this._state !== SyncState.ACTIVE) {
      return;
    }

    try {
      // Sincronizar datos pendientes
      this._data.forEach(data => {
        if (data.timestamp > this._lastSync) {
          this._broadcastData(data);
        }
      });

      this._lastSync = Date.now();
      this._stats.uptime = Date.now() - this._startTime;
    } catch (error) {
      this._stats.errors++;
      this.emit('error:sync', { sync: this, error: error as Error, context: 'perform_sync' });
    }
  }

  /**
   * Transmite datos a todos los peers
   */
  private _broadcastData(syncData: SyncData): void {
    const message = NetworkMessage.createSyncMessage('sync:data', syncData, this.id);
    
    // Enviar a través del NetworkManager
    // Nota: Esto requeriría acceso al NetworkManager
    this._stats.dataSent++;
    
    this.emit('data:sent', { sync: this, data: syncData, to: null as any });
  }

  /**
   * Resuelve conflictos automáticamente
   */
  private _resolveConflict(localData: SyncData, remoteData: SyncData, from: NetworkPeer): void {
    const conflict: SyncConflict = {
      id: localData.id,
      type: localData.type,
      localData: localData.data,
      remoteData: remoteData.data,
      localTimestamp: localData.timestamp,
      remoteTimestamp: remoteData.timestamp,
      localVersion: localData.version,
      remoteVersion: remoteData.version,
      resolution: this.config.conflictResolution
    };

    this._conflicts.set(conflict.id, conflict);

    // Resolver automáticamente según la estrategia
    switch (this.config.conflictResolution) {
      case ConflictResolution.LAST_WRITE_WINS:
        this._resolveLastWriteWins(conflict);
        break;
      case ConflictResolution.MERGE:
        this._resolveMerge(conflict);
        break;
      case ConflictResolution.IGNORE:
        this._resolveIgnore(conflict);
        break;
      case ConflictResolution.MANUAL:
        // Dejar para resolución manual
        break;
      default:
        this._resolveCustom(conflict);
    }
  }

  /**
   * Resuelve conflicto usando "último en escribir gana"
   */
  private _resolveLastWriteWins(conflict: SyncConflict): void {
    const winner = conflict.localTimestamp > conflict.remoteTimestamp ? 
      conflict.localData : conflict.remoteData;
    
    this.resolveConflict(conflict.id, winner);
  }

  /**
   * Resuelve conflicto usando merge
   */
  private _resolveMerge(conflict: SyncConflict): void {
    try {
      const merged = this._mergeData(conflict.localData, conflict.remoteData);
      this.resolveConflict(conflict.id, merged);
    } catch (error) {
      // Fallback a last write wins
      this._resolveLastWriteWins(conflict);
    }
  }

  /**
   * Resuelve conflicto ignorando
   */
  private _resolveIgnore(conflict: SyncConflict): void {
    this._conflicts.delete(conflict.id);
  }

  /**
   * Resuelve conflicto usando estrategia personalizada
   */
  private _resolveCustom(conflict: SyncConflict): void {
    // Implementación personalizada
    this._resolveLastWriteWins(conflict);
  }

  /**
   * Aplica resolución a un conflicto
   */
  private _applyResolution(conflict: SyncConflict, resolution: any): SyncData | null {
    try {
      return {
        id: conflict.id,
        type: conflict.type,
        data: resolution,
        timestamp: Date.now(),
        version: Math.max(conflict.localVersion, conflict.remoteVersion) + 1,
        checksum: this._calculateChecksum(resolution),
        metadata: this.metadata
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Fusiona datos
   */
  private _mergeData(local: any, remote: any): any {
    if (typeof local !== typeof remote) {
      return remote; // Fallback
    }

    if (typeof local === 'object' && local !== null) {
      if (Array.isArray(local)) {
        return [...new Set([...local, ...remote])];
      } else {
        return { ...local, ...remote };
      }
    }

    return remote;
  }

  /**
   * Valida datos de sincronización
   */
  private _validateData(syncData: SyncData): boolean {
    if (!syncData.id || !syncData.type || !syncData.data) {
      return false;
    }

    if (syncData.checksum !== this._calculateChecksum(syncData.data)) {
      return false;
    }

    return true;
  }

  /**
   * Calcula checksum de datos
   */
  private _calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Establece el estado de sincronización
   */
  private _setState(state: SyncState): void {
    this._state = state;
  }

  /**
   * Serializa la sincronización
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      config: this.config,
      metadata: this.metadata,
      state: this._state,
      stats: this._stats,
      version: this._version,
      dataCount: this._data.size,
      conflictCount: this._conflicts.size,
      startTime: this._startTime,
      lastSync: this._lastSync
    };
  }

  /**
   * Deserializa una sincronización
   */
  static deserialize(data: any, networkManager: NetworkManager): NetworkSync {
    const sync = new NetworkSync(networkManager, data.config);
    
    // Restaurar estado interno
    (sync as any)._state = data.state;
    (sync as any)._stats = data.stats;
    (sync as any)._version = data.version;
    (sync as any)._startTime = data.startTime;
    (sync as any)._lastSync = data.lastSync;

    return sync;
  }

  // Getters
  get state(): SyncState { return this._state; }
  get stats(): SyncStats { return { ...this._stats }; }
  get version(): number { return this._version; }
  get dataCount(): number { return this._data.size; }
  get conflictCount(): number { return this._conflicts.size; }
  get isActive(): boolean { return this._state === SyncState.ACTIVE; }
  get isPaused(): boolean { return this._state === SyncState.PAUSED; }
  get uptime(): number { return this._stats.uptime; }
} 