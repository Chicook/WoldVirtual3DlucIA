/**
 * NetworkRoom - Sala de Red
 * 
 * Sistema de salas para colaboración en tiempo real
 * en el editor 3D del metaverso.
 */

import { EventEmitter } from '../events/EventEmitter';
import { NetworkPeer } from './NetworkPeer';
import { NetworkMessage } from './NetworkMessage';

export interface RoomEvents {
  'peer:joined': { room: NetworkRoom; peer: NetworkPeer };
  'peer:left': { room: NetworkRoom; peer: NetworkPeer; reason: string };
  'message:broadcast': { room: NetworkRoom; message: NetworkMessage; from: NetworkPeer };
  'message:private': { room: NetworkRoom; message: NetworkMessage; from: NetworkPeer; to: NetworkPeer };
  'state:changed': { room: NetworkRoom; oldState: RoomState; newState: RoomState };
  'settings:updated': { room: NetworkRoom; settings: RoomSettings };
}

export interface RoomData {
  id: string;
  name: string;
  description?: string;
  state: RoomState;
  settings: RoomSettings;
  metadata?: RoomMetadata;
  stats?: RoomStats;
}

export interface RoomSettings {
  maxPeers: number;
  allowAnonymous: boolean;
  requireInvitation: boolean;
  allowChat: boolean;
  allowFileSharing: boolean;
  allowScreenSharing: boolean;
  allowVoiceChat: boolean;
  allowVideoChat: boolean;
  autoSave: boolean;
  saveInterval: number;
  permissions: RoomPermissions;
}

export interface RoomPermissions {
  canInvite: boolean;
  canKick: boolean;
  canBan: boolean;
  canModifySettings: boolean;
  canDeleteRoom: boolean;
  canBroadcast: boolean;
  canPrivateMessage: boolean;
}

export interface RoomMetadata {
  category: string;
  tags: string[];
  creator: string;
  createdAt: number;
  lastActivity: number;
  version: string;
  features: string[];
}

export interface RoomStats {
  peerCount: number;
  maxPeers: number;
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  uptime: number;
  lastActivity: number;
}

export enum RoomState {
  CREATING = 'creating',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
  PASSWORD_PROTECTED = 'password_protected'
}

/**
 * Clase NetworkRoom
 */
export class NetworkRoom extends EventEmitter<RoomEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly metadata: RoomMetadata;
  public readonly type: RoomType;

  private _state: RoomState;
  private _settings: RoomSettings;
  private _peers: Map<string, NetworkPeer> = new Map();
  private _stats: RoomStats;
  private _createdAt: number;
  private _lastActivity: number;
  private _password?: string;
  private _invitations: Set<string> = new Set();
  private _bannedPeers: Set<string> = new Set();

  constructor(data: RoomData) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this._state = data.state;
    this._settings = data.settings;
    this.metadata = data.metadata || {
      category: 'general',
      tags: [],
      creator: 'unknown',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      version: '1.0.0',
      features: []
    };
    this.type = this._determineType();
    this._stats = data.stats || {
      peerCount: 0,
      maxPeers: this._settings.maxPeers,
      messagesSent: 0,
      messagesReceived: 0,
      bytesSent: 0,
      bytesReceived: 0,
      uptime: 0,
      lastActivity: Date.now()
    };
    this._createdAt = this.metadata.createdAt;
    this._lastActivity = this.metadata.lastActivity;
  }

  /**
   * Agrega un peer a la sala
   */
  addPeer(peer: NetworkPeer): boolean {
    // Verificar límite de peers
    if (this._peers.size >= this._settings.maxPeers) {
      return false;
    }

    // Verificar si el peer está baneado
    if (this._bannedPeers.has(peer.id)) {
      return false;
    }

    // Verificar invitación si es requerida
    if (this._settings.requireInvitation && !this._invitations.has(peer.id)) {
      return false;
    }

    this._peers.set(peer.id, peer);
    this._stats.peerCount = this._peers.size;
    this._updateLastActivity();

    this.emit('peer:joined', { room: this, peer });
    return true;
  }

  /**
   * Remueve un peer de la sala
   */
  removePeer(peerId: string, reason: string = 'Left room'): boolean {
    const peer = this._peers.get(peerId);
    if (!peer) {
      return false;
    }

    this._peers.delete(peerId);
    this._stats.peerCount = this._peers.size;
    this._updateLastActivity();

    this.emit('peer:left', { room: this, peer, reason });
    return true;
  }

  /**
   * Banea un peer de la sala
   */
  banPeer(peerId: string, reason: string = 'Banned'): boolean {
    if (!this._settings.permissions.canBan) {
      return false;
    }

    this._bannedPeers.add(peerId);
    return this.removePeer(peerId, reason);
  }

  /**
   * Desbanea un peer
   */
  unbanPeer(peerId: string): boolean {
    if (!this._settings.permissions.canBan) {
      return false;
    }

    return this._bannedPeers.delete(peerId);
  }

  /**
   * Invita un peer a la sala
   */
  invitePeer(peerId: string): boolean {
    if (!this._settings.permissions.canInvite) {
      return false;
    }

    this._invitations.add(peerId);
    return true;
  }

  /**
   * Remueve una invitación
   */
  removeInvitation(peerId: string): boolean {
    return this._invitations.delete(peerId);
  }

  /**
   * Transmite un mensaje a todos los peers en la sala
   */
  broadcastMessage(message: NetworkMessage, from: NetworkPeer): void {
    if (!this._settings.permissions.canBroadcast) {
      return;
    }

    this._peers.forEach(peer => {
      if (peer.id !== from.id) {
        peer.sendMessage(message).catch(() => {
          // Ignorar errores de envío
        });
      }
    });

    this._stats.messagesSent++;
    this._stats.bytesSent += message.serialize().length;
    this._updateLastActivity();

    this.emit('message:broadcast', { room: this, message, from });
  }

  /**
   * Envía un mensaje privado entre dos peers
   */
  sendPrivateMessage(message: NetworkMessage, from: NetworkPeer, to: NetworkPeer): boolean {
    if (!this._settings.permissions.canPrivateMessage) {
      return false;
    }

    if (!this._peers.has(from.id) || !this._peers.has(to.id)) {
      return false;
    }

    to.sendMessage(message).catch(() => {
      // Ignorar errores de envío
    });

    this._stats.messagesSent++;
    this._stats.bytesSent += message.serialize().length;
    this._updateLastActivity();

    this.emit('message:private', { room: this, message, from, to });
    return true;
  }

  /**
   * Actualiza el estado de la sala
   */
  updateState(state: RoomState): void {
    if (this._state === state) {
      return;
    }

    const oldState = this._state;
    this._state = state;
    this._updateLastActivity();

    this.emit('state:changed', { room: this, oldState, newState: state });
  }

  /**
   * Actualiza la configuración de la sala
   */
  updateSettings(settings: Partial<RoomSettings>): boolean {
    if (!this._settings.permissions.canModifySettings) {
      return false;
    }

    this._settings = { ...this._settings, ...settings };
    this._stats.maxPeers = this._settings.maxPeers;
    this._updateLastActivity();

    this.emit('settings:updated', { room: this, settings: this._settings });
    return true;
  }

  /**
   * Establece una contraseña para la sala
   */
  setPassword(password: string): boolean {
    if (this.type !== RoomType.PASSWORD_PROTECTED) {
      return false;
    }

    this._password = password;
    return true;
  }

  /**
   * Verifica la contraseña de la sala
   */
  verifyPassword(password: string): boolean {
    if (!this._password) {
      return true;
    }
    return this._password === password;
  }

  /**
   * Obtiene un peer por ID
   */
  getPeer(peerId: string): NetworkPeer | null {
    return this._peers.get(peerId) || null;
  }

  /**
   * Obtiene todos los peers en la sala
   */
  getPeers(): NetworkPeer[] {
    return Array.from(this._peers.values());
  }

  /**
   * Obtiene los peers baneados
   */
  getBannedPeers(): string[] {
    return Array.from(this._bannedPeers);
  }

  /**
   * Obtiene las invitaciones activas
   */
  getInvitations(): string[] {
    return Array.from(this._invitations);
  }

  /**
   * Verifica si un peer está en la sala
   */
  hasPeer(peerId: string): boolean {
    return this._peers.has(peerId);
  }

  /**
   * Verifica si un peer está baneado
   */
  isPeerBanned(peerId: string): boolean {
    return this._bannedPeers.has(peerId);
  }

  /**
   * Verifica si un peer está invitado
   */
  isPeerInvited(peerId: string): boolean {
    return this._invitations.has(peerId);
  }

  /**
   * Verifica si la sala está llena
   */
  isFull(): boolean {
    return this._peers.size >= this._settings.maxPeers;
  }

  /**
   * Verifica si la sala está activa
   */
  isActive(): boolean {
    return this._state === RoomState.ACTIVE;
  }

  /**
   * Obtiene el tiempo de actividad de la sala
   */
  getUptime(): number {
    return Date.now() - this._createdAt;
  }

  /**
   * Obtiene el tiempo desde la última actividad
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this._lastActivity;
  }

  /**
   * Actualiza la última actividad
   */
  private _updateLastActivity(): void {
    this._lastActivity = Date.now();
    this.metadata.lastActivity = this._lastActivity;
    this._stats.lastActivity = this._lastActivity;
    this._stats.uptime = this.getUptime();
  }

  /**
   * Determina el tipo de sala basado en configuración
   */
  private _determineType(): RoomType {
    if (this._settings.requireInvitation) {
      return RoomType.INVITE_ONLY;
    }
    if (this._password) {
      return RoomType.PASSWORD_PROTECTED;
    }
    if (this.metadata.tags?.includes('private')) {
      return RoomType.PRIVATE;
    }
    return RoomType.PUBLIC;
  }

  /**
   * Actualiza la sala con nuevos datos
   */
  update(data: Partial<RoomData>): void {
    if (data.name) this.name = data.name;
    if (data.description) this.description = data.description;
    if (data.state) this._state = data.state;
    if (data.settings) this._settings = { ...this._settings, ...data.settings };
    if (data.metadata) this.metadata = { ...this.metadata, ...data.metadata };
    if (data.stats) this._stats = { ...this._stats, ...data.stats };

    this._updateLastActivity();
  }

  /**
   * Serializa la sala
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      state: this._state,
      settings: this._settings,
      metadata: this.metadata,
      type: this.type,
      stats: this._stats,
      createdAt: this._createdAt,
      lastActivity: this._lastActivity,
      peerCount: this._peers.size,
      bannedPeers: Array.from(this._bannedPeers),
      invitations: Array.from(this._invitations)
    };
  }

  /**
   * Deserializa una sala
   */
  static deserialize(data: any): NetworkRoom {
    const room = new NetworkRoom({
      id: data.id,
      name: data.name,
      description: data.description,
      state: data.state,
      settings: data.settings,
      metadata: data.metadata,
      stats: data.stats
    });

    // Restaurar estado interno
    (room as any)._createdAt = data.createdAt;
    (room as any)._lastActivity = data.lastActivity;
    (room as any)._bannedPeers = new Set(data.bannedPeers);
    (room as any)._invitations = new Set(data.invitations);

    return room;
  }

  // Getters
  get state(): RoomState { return this._state; }
  get settings(): RoomSettings { return { ...this._settings }; }
  get stats(): RoomStats { return { ...this._stats }; }
  get peerCount(): number { return this._peers.size; }
  get maxPeers(): number { return this._settings.maxPeers; }
  get createdAt(): number { return this._createdAt; }
  get lastActivity(): number { return this._lastActivity; }
  get uptime(): number { return this.getUptime(); }
  get isPublic(): boolean { return this.type === RoomType.PUBLIC; }
  get isPrivate(): boolean { return this.type === RoomType.PRIVATE; }
  get isInviteOnly(): boolean { return this.type === RoomType.INVITE_ONLY; }
  get isPasswordProtected(): boolean { return this.type === RoomType.PASSWORD_PROTECTED; }
} 