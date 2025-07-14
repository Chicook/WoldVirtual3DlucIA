/**
 * @fileoverview Registro de Metaversos para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/contracts/MetaverseRegistry
 */

import { Metaverse, MetaverseSettings, PhysicsSettings, GraphicsSettings, NetworkingSettings, EconomySettings } from '../types';
import { StateManager } from '../state/StateManager';
import { Logger } from '../../utils/logger';

const logger = new Logger('MetaverseRegistry');

export interface MetaverseWorld {
  id: string;
  name: string;
  description: string;
  version: string;
  worldData: any;
  spawnPoints: Array<{
    x: number;
    y: number;
    z: number;
    name: string;
  }>;
  boundaries: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  environment: {
    skybox: string;
    lighting: string;
    weather: string;
    timeOfDay: number;
  };
}

export interface MetaverseSession {
  id: string;
  metaverseId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  actions: string[];
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export class MetaverseRegistry {
  private stateManager: StateManager;
  private contractAddress: string;
  private metaverses: Map<string, Metaverse> = new Map();
  private sessions: Map<string, MetaverseSession> = new Map();
  private totalMetaverses: number = 0;
  private totalSessions: number = 0;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.contractAddress = this.generateContractAddress();
    
    logger.info('Registro de Metaversos inicializado');
  }

  /**
   * Generar dirección del contrato
   */
  private generateContractAddress(): string {
    const timestamp = Date.now().toString();
    const hash = timestamp.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    return '0x' + hash.padEnd(40, '0').slice(0, 40);
  }

  /**
   * Inicializar registro
   */
  async initialize(): Promise<void> {
    try {
      // Crear cuenta para el contrato
      await this.stateManager.setStorage(
        this.contractAddress,
        'totalMetaverses',
        '0'
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalSessions',
        '0'
      );

      logger.info('Registro de Metaversos inicializado');
      
    } catch (error: any) {
      logger.error('Error inicializando MetaverseRegistry:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo metaverso
   */
  async createMetaverse(metaverseData: any, creatorAddress: string): Promise<string> {
    try {
      // Generar ID único del metaverso
      const metaverseId = this.generateMetaverseId(metaverseData, creatorAddress);
      
      // Verificar que el metaverso no existe
      if (this.metaverses.has(metaverseId)) {
        throw new Error('Metaverso ya existe');
      }

      // Crear metaverso
      const metaverse: Metaverse = {
        id: metaverseId,
        name: metaverseData.name,
        description: metaverseData.description,
        creator: creatorAddress,
        worldData: metaverseData.worldData || {},
        assets: metaverseData.assets || [],
        users: [creatorAddress], // El creador es el primer usuario
        settings: this.createDefaultSettings(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        maxUsers: metaverseData.maxUsers || 100,
        currentUsers: 1
      };

      // Guardar metaverso
      this.metaverses.set(metaverseId, metaverse);
      this.totalMetaverses++;

      // Actualizar estado en la blockchain
      await this.stateManager.setStorage(
        this.contractAddress,
        `metaverse:${metaverseId}`,
        JSON.stringify(metaverse)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalMetaverses',
        this.totalMetaverses.toString()
      );

      // Emitir evento
      this.emitMetaverseEvent('MetaverseCreated', {
        metaverseId,
        creator: creatorAddress,
        name: metaverse.name
      });

      logger.info(`Metaverso creado: ${metaverse.name} (${metaverseId}) por ${creatorAddress}`);
      return metaverseId;

    } catch (error: any) {
      logger.error('Error creando metaverso:', error);
      throw error;
    }
  }

  /**
   * Generar ID único para metaverso
   */
  private generateMetaverseId(metaverseData: any, creatorAddress: string): string {
    const timestamp = Date.now().toString();
    const data = `${creatorAddress}-${metaverseData.name}-${timestamp}`;
    const hash = data.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    return hash.slice(0, 16);
  }

  /**
   * Crear configuración por defecto
   */
  private createDefaultSettings(): MetaverseSettings {
    return {
      physics: {
        gravity: 9.81,
        collisionDetection: true,
        particleSystem: true,
        fluidSimulation: false
      },
      graphics: {
        renderDistance: 1000,
        shadowQuality: 'high',
        textureQuality: 'high',
        antiAliasing: true,
        rayTracing: false
      },
      networking: {
        maxLatency: 100,
        compression: true,
        encryption: true,
        peerToPeer: false
      },
      economy: {
        currency: 'WVC',
        inflationRate: 0.02,
        transactionFee: 0.001,
        marketplaceEnabled: true
      }
    };
  }

  /**
   * Obtener metaverso por ID
   */
  async getMetaverse(metaverseId: string): Promise<Metaverse | null> {
    try {
      // Buscar en caché local
      if (this.metaverses.has(metaverseId)) {
        return this.metaverses.get(metaverseId)!;
      }

      // Buscar en blockchain
      const metaverseData = await this.stateManager.getStorage(
        this.contractAddress,
        `metaverse:${metaverseId}`
      );

      if (metaverseData && metaverseData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const metaverse: Metaverse = JSON.parse(metaverseData);
        this.metaverses.set(metaverseId, metaverse);
        return metaverse;
      }

      return null;

    } catch (error: any) {
      logger.error(`Error obteniendo metaverso ${metaverseId}:`, error);
      return null;
    }
  }

  /**
   * Obtener metaversos por creador
   */
  async getMetaversesByCreator(creatorAddress: string): Promise<Metaverse[]> {
    try {
      const metaverses: Metaverse[] = [];
      
      for (const metaverse of this.metaverses.values()) {
        if (metaverse.creator.toLowerCase() === creatorAddress.toLowerCase()) {
          metaverses.push(metaverse);
        }
      }

      return metaverses;

    } catch (error: any) {
      logger.error(`Error obteniendo metaversos de ${creatorAddress}:`, error);
      return [];
    }
  }

  /**
   * Obtener metaversos activos
   */
  async getActiveMetaverses(): Promise<Metaverse[]> {
    try {
      const metaverses: Metaverse[] = [];
      
      for (const metaverse of this.metaverses.values()) {
        if (metaverse.isActive) {
          metaverses.push(metaverse);
        }
      }

      return metaverses;

    } catch (error: any) {
      logger.error('Error obteniendo metaversos activos:', error);
      return [];
    }
  }

  /**
   * Actualizar metaverso
   */
  async updateMetaverse(
    metaverseId: string,
    updates: Partial<Metaverse>,
    updaterAddress: string
  ): Promise<boolean> {
    try {
      const metaverse = await this.getMetaverse(metaverseId);
      if (!metaverse) {
        throw new Error('Metaverso no encontrado');
      }

      // Verificar permisos (solo el creador puede actualizar)
      if (metaverse.creator.toLowerCase() !== updaterAddress.toLowerCase()) {
        throw new Error('No tienes permisos para actualizar este metaverso');
      }

      // Aplicar actualizaciones
      const updatedMetaverse: Metaverse = {
        ...metaverse,
        ...updates,
        updatedAt: Date.now()
      };

      // Guardar metaverso actualizado
      this.metaverses.set(metaverseId, updatedMetaverse);
      await this.stateManager.setStorage(
        this.contractAddress,
        `metaverse:${metaverseId}`,
        JSON.stringify(updatedMetaverse)
      );

      // Emitir evento
      this.emitMetaverseEvent('MetaverseUpdated', {
        metaverseId,
        updater: updaterAddress,
        updates: Object.keys(updates)
      });

      logger.info(`Metaverso ${metaverseId} actualizado por ${updaterAddress}`);
      return true;

    } catch (error: any) {
      logger.error('Error actualizando metaverso:', error);
      return false;
    }
  }

  /**
   * Unirse a un metaverso
   */
  async joinMetaverse(metaverseId: string, userAddress: string): Promise<boolean> {
    try {
      const metaverse = await this.getMetaverse(metaverseId);
      if (!metaverse) {
        throw new Error('Metaverso no encontrado');
      }

      if (!metaverse.isActive) {
        throw new Error('Metaverso no está activo');
      }

      if (metaverse.currentUsers >= metaverse.maxUsers) {
        throw new Error('Metaverso está lleno');
      }

      if (metaverse.users.includes(userAddress)) {
        throw new Error('Usuario ya está en el metaverso');
      }

      // Agregar usuario
      metaverse.users.push(userAddress);
      metaverse.currentUsers++;
      metaverse.updatedAt = Date.now();

      // Guardar metaverso actualizado
      this.metaverses.set(metaverseId, metaverse);
      await this.stateManager.setStorage(
        this.contractAddress,
        `metaverse:${metaverseId}`,
        JSON.stringify(metaverse)
      );

      // Crear sesión
      await this.createSession(metaverseId, userAddress);

      // Emitir evento
      this.emitMetaverseEvent('UserJoinedMetaverse', {
        metaverseId,
        user: userAddress
      });

      logger.info(`Usuario ${userAddress} se unió al metaverso ${metaverseId}`);
      return true;

    } catch (error: any) {
      logger.error('Error uniéndose al metaverso:', error);
      return false;
    }
  }

  /**
   * Salir de un metaverso
   */
  async leaveMetaverse(metaverseId: string, userAddress: string): Promise<boolean> {
    try {
      const metaverse = await this.getMetaverse(metaverseId);
      if (!metaverse) {
        throw new Error('Metaverso no encontrado');
      }

      if (!metaverse.users.includes(userAddress)) {
        throw new Error('Usuario no está en el metaverso');
      }

      // Remover usuario
      metaverse.users = metaverse.users.filter(u => u !== userAddress);
      metaverse.currentUsers--;
      metaverse.updatedAt = Date.now();

      // Guardar metaverso actualizado
      this.metaverses.set(metaverseId, metaverse);
      await this.stateManager.setStorage(
        this.contractAddress,
        `metaverse:${metaverseId}`,
        JSON.stringify(metaverse)
      );

      // Finalizar sesión
      await this.endSession(metaverseId, userAddress);

      // Emitir evento
      this.emitMetaverseEvent('UserLeftMetaverse', {
        metaverseId,
        user: userAddress
      });

      logger.info(`Usuario ${userAddress} salió del metaverso ${metaverseId}`);
      return true;

    } catch (error: any) {
      logger.error('Error saliendo del metaverso:', error);
      return false;
    }
  }

  /**
   * Crear sesión de usuario
   */
  private async createSession(metaverseId: string, userAddress: string): Promise<void> {
    try {
      const sessionId = `${metaverseId}-${userAddress}-${Date.now()}`;
      
      const session: MetaverseSession = {
        id: sessionId,
        metaverseId,
        userId: userAddress,
        startTime: Date.now(),
        duration: 0,
        actions: [],
        position: { x: 0, y: 0, z: 0 }
      };

      this.sessions.set(sessionId, session);
      this.totalSessions++;

      await this.stateManager.setStorage(
        this.contractAddress,
        `session:${sessionId}`,
        JSON.stringify(session)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalSessions',
        this.totalSessions.toString()
      );

    } catch (error: any) {
      logger.error('Error creando sesión:', error);
    }
  }

  /**
   * Finalizar sesión de usuario
   */
  private async endSession(metaverseId: string, userAddress: string): Promise<void> {
    try {
      // Buscar sesión activa
      for (const [sessionId, session] of this.sessions) {
        if (session.metaverseId === metaverseId && 
            session.userId === userAddress && 
            !session.endTime) {
          
          session.endTime = Date.now();
          session.duration = session.endTime - session.startTime;

          await this.stateManager.setStorage(
            this.contractAddress,
            `session:${sessionId}`,
            JSON.stringify(session)
          );

          break;
        }
      }

    } catch (error: any) {
      logger.error('Error finalizando sesión:', error);
    }
  }

  /**
   * Agregar asset a metaverso
   */
  async addAssetToMetaverse(metaverseId: string, assetId: string): Promise<boolean> {
    try {
      const metaverse = await this.getMetaverse(metaverseId);
      if (!metaverse) {
        throw new Error('Metaverso no encontrado');
      }

      if (!metaverse.assets.includes(assetId)) {
        metaverse.assets.push(assetId);
        return await this.updateMetaverse(metaverseId, {
          assets: metaverse.assets
        }, metaverse.creator);
      }

      return true;

    } catch (error: any) {
      logger.error('Error agregando asset a metaverso:', error);
      return false;
    }
  }

  /**
   * Remover asset de metaverso
   */
  async removeAssetFromMetaverse(metaverseId: string, assetId: string): Promise<boolean> {
    try {
      const metaverse = await this.getMetaverse(metaverseId);
      if (!metaverse) {
        throw new Error('Metaverso no encontrado');
      }

      const updatedAssets = metaverse.assets.filter(id => id !== assetId);
      
      return await this.updateMetaverse(metaverseId, {
        assets: updatedAssets
      }, metaverse.creator);

    } catch (error: any) {
      logger.error('Error removiendo asset de metaverso:', error);
      return false;
    }
  }

  /**
   * Buscar metaversos
   */
  async searchMetaverses(query: string): Promise<Metaverse[]> {
    try {
      const metaverses: Metaverse[] = [];
      const lowerQuery = query.toLowerCase();
      
      for (const metaverse of this.metaverses.values()) {
        if (metaverse.name.toLowerCase().includes(lowerQuery) ||
            metaverse.description.toLowerCase().includes(lowerQuery)) {
          metaverses.push(metaverse);
        }
      }

      return metaverses;

    } catch (error: any) {
      logger.error('Error buscando metaversos:', error);
      return [];
    }
  }

  /**
   * Obtener metaversos populares
   */
  async getPopularMetaverses(limit: number = 10): Promise<Metaverse[]> {
    try {
      const metaverses = Array.from(this.metaverses.values())
        .filter(m => m.isActive)
        .sort((a, b) => b.currentUsers - a.currentUsers)
        .slice(0, limit);

      return metaverses;

    } catch (error: any) {
      logger.error('Error obteniendo metaversos populares:', error);
      return [];
    }
  }

  /**
   * Obtener metaversos recientes
   */
  async getRecentMetaverses(limit: number = 10): Promise<Metaverse[]> {
    try {
      const metaverses = Array.from(this.metaverses.values())
        .filter(m => m.isActive)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      return metaverses;

    } catch (error: any) {
      logger.error('Error obteniendo metaversos recientes:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del registro
   */
  async getRegistryStats(): Promise<{
    totalMetaverses: number;
    activeMetaverses: number;
    totalSessions: number;
    totalUsers: number;
    averageUsersPerMetaverse: number;
    metaversesByMonth: { [key: string]: number };
  }> {
    try {
      let activeMetaverses = 0;
      let totalUsers = 0;
      const metaversesByMonth: { [key: string]: number } = {};

      for (const metaverse of this.metaverses.values()) {
        if (metaverse.isActive) {
          activeMetaverses++;
          totalUsers += metaverse.currentUsers;
        }

        // Contar por mes
        const month = new Date(metaverse.createdAt).toISOString().slice(0, 7);
        metaversesByMonth[month] = (metaversesByMonth[month] || 0) + 1;
      }

      const averageUsersPerMetaverse = activeMetaverses > 0 
        ? totalUsers / activeMetaverses 
        : 0;

      return {
        totalMetaverses: this.totalMetaverses,
        activeMetaverses,
        totalSessions: this.totalSessions,
        totalUsers,
        averageUsersPerMetaverse,
        metaversesByMonth
      };

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas del registro:', error);
      return {
        totalMetaverses: 0,
        activeMetaverses: 0,
        totalSessions: 0,
        totalUsers: 0,
        averageUsersPerMetaverse: 0,
        metaversesByMonth: {}
      };
    }
  }

  /**
   * Emitir evento de metaverso
   */
  private emitMetaverseEvent(eventName: string, data: any): void {
    // En una implementación real, esto emitiría un evento en la blockchain
    logger.debug(`Evento emitido: ${eventName}`, data);
  }

  /**
   * Obtener dirección del contrato
   */
  getAddress(): string {
    return this.contractAddress;
  }

  /**
   * Obtener total de metaversos
   */
  getTotalMetaverses(): number {
    return this.totalMetaverses;
  }

  /**
   * Verificar si un metaverso existe
   */
  async metaverseExists(metaverseId: string): Promise<boolean> {
    return this.metaverses.has(metaverseId) || 
           (await this.stateManager.getStorage(this.contractAddress, `metaverse:${metaverseId}`)) !== 
           '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Desactivar metaverso
   */
  async deactivateMetaverse(metaverseId: string, creatorAddress: string): Promise<boolean> {
    try {
      const metaverse = await this.getMetaverse(metaverseId);
      if (!metaverse) {
        throw new Error('Metaverso no encontrado');
      }

      if (metaverse.creator.toLowerCase() !== creatorAddress.toLowerCase()) {
        throw new Error('No tienes permisos para desactivar este metaverso');
      }

      return await this.updateMetaverse(metaverseId, {
        isActive: false
      }, creatorAddress);

    } catch (error: any) {
      logger.error('Error desactivando metaverso:', error);
      return false;
    }
  }
}

export default MetaverseRegistry; 