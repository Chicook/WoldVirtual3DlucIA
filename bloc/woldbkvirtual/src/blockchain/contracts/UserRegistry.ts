/**
 * @fileoverview Registro de Usuarios para la blockchain WoldVirtual3D
 * @module woldbkvirtual/src/blockchain/contracts/UserRegistry
 */

import { User, UserPreferences, NotificationSettings, PrivacySettings } from '../types';
import { StateManager } from '../state/StateManager';
import { Logger } from '../../utils/logger';

const logger = new Logger('UserRegistry');

export interface UserProfile {
  username: string;
  email: string;
  avatar: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    github?: string;
    website?: string;
  };
  skills: string[];
  interests: string[];
  achievements: string[];
}

export interface UserStats {
  totalAssets: number;
  totalMetaverses: number;
  reputation: number;
  joinDate: number;
  lastActive: number;
  totalTransactions: number;
  totalValue: string;
}

export class UserRegistry {
  private stateManager: StateManager;
  private contractAddress: string;
  private users: Map<string, User> = new Map();
  private totalUsers: number = 0;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.contractAddress = this.generateContractAddress();
    
    logger.info('Registro de Usuarios inicializado');
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
        'totalUsers',
        '0'
      );

      logger.info('Registro de Usuarios inicializado');
      
    } catch (error: any) {
      logger.error('Error inicializando UserRegistry:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async registerUser(userData: any, walletAddress: string): Promise<string> {
    try {
      // Verificar que el usuario no existe
      if (this.users.has(walletAddress)) {
        throw new Error('Usuario ya existe');
      }

      // Verificar que el username no esté en uso
      const existingUser = Array.from(this.users.values())
        .find(u => u.username === userData.username);
      
      if (existingUser) {
        throw new Error('Username ya está en uso');
      }

      // Crear usuario
      const user: User = {
        id: this.generateUserId(walletAddress),
        walletAddress,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar || '',
        bio: userData.bio || '',
        reputation: 0,
        assets: [],
        metaverses: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isVerified: false,
        preferences: this.createDefaultPreferences()
      };

      // Guardar usuario
      this.users.set(walletAddress, user);
      this.totalUsers++;

      // Actualizar estado en la blockchain
      await this.stateManager.setStorage(
        this.contractAddress,
        `user:${walletAddress}`,
        JSON.stringify(user)
      );

      await this.stateManager.setStorage(
        this.contractAddress,
        'totalUsers',
        this.totalUsers.toString()
      );

      // Emitir evento
      this.emitUserEvent('UserRegistered', {
        userId: user.id,
        walletAddress,
        username: user.username
      });

      logger.info(`Usuario registrado: ${user.username} (${walletAddress})`);
      return user.id;

    } catch (error: any) {
      logger.error('Error registrando usuario:', error);
      throw error;
    }
  }

  /**
   * Generar ID único para usuario
   */
  private generateUserId(walletAddress: string): string {
    const timestamp = Date.now().toString();
    const data = `${walletAddress}-${timestamp}`;
    const hash = data.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    return hash.slice(0, 16);
  }

  /**
   * Crear preferencias por defecto
   */
  private createDefaultPreferences(): UserPreferences {
    return {
      theme: 'dark',
      language: 'es',
      notifications: {
        email: true,
        push: true,
        marketplace: true,
        social: true,
        updates: true
      },
      privacy: {
        profileVisibility: 'public',
        assetVisibility: 'public',
        showBalance: true,
        showActivity: true
      }
    };
  }

  /**
   * Obtener usuario por dirección de wallet
   */
  async getUser(walletAddress: string): Promise<User | null> {
    try {
      // Buscar en caché local
      if (this.users.has(walletAddress)) {
        return this.users.get(walletAddress)!;
      }

      // Buscar en blockchain
      const userData = await this.stateManager.getStorage(
        this.contractAddress,
        `user:${walletAddress}`
      );

      if (userData && userData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const user: User = JSON.parse(userData);
        this.users.set(walletAddress, user);
        return user;
      }

      return null;

    } catch (error: any) {
      logger.error(`Error obteniendo usuario ${walletAddress}:`, error);
      return null;
    }
  }

  /**
   * Obtener usuario por username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      for (const user of this.users.values()) {
        if (user.username === username) {
          return user;
        }
      }
      return null;

    } catch (error: any) {
      logger.error(`Error obteniendo usuario por username ${username}:`, error);
      return null;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(
    walletAddress: string,
    updates: Partial<User>
  ): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar username único si se está actualizando
      if (updates.username && updates.username !== user.username) {
        const existingUser = await this.getUserByUsername(updates.username);
        if (existingUser) {
          throw new Error('Username ya está en uso');
        }
      }

      // Aplicar actualizaciones
      const updatedUser: User = {
        ...user,
        ...updates,
        updatedAt: Date.now()
      };

      // Guardar usuario actualizado
      this.users.set(walletAddress, updatedUser);
      await this.stateManager.setStorage(
        this.contractAddress,
        `user:${walletAddress}`,
        JSON.stringify(updatedUser)
      );

      // Emitir evento
      this.emitUserEvent('UserProfileUpdated', {
        walletAddress,
        updates: Object.keys(updates)
      });

      logger.info(`Perfil de usuario actualizado: ${walletAddress}`);
      return true;

    } catch (error: any) {
      logger.error('Error actualizando perfil de usuario:', error);
      return false;
    }
  }

  /**
   * Actualizar preferencias de usuario
   */
  async updateUserPreferences(
    walletAddress: string,
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const updatedPreferences: UserPreferences = {
        ...user.preferences,
        ...preferences
      };

      return await this.updateUserProfile(walletAddress, {
        preferences: updatedPreferences
      });

    } catch (error: any) {
      logger.error('Error actualizando preferencias de usuario:', error);
      return false;
    }
  }

  /**
   * Actualizar reputación de usuario
   */
  async updateUserReputation(
    walletAddress: string,
    reputationChange: number
  ): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const newReputation = Math.max(0, user.reputation + reputationChange);
      
      return await this.updateUserProfile(walletAddress, {
        reputation: newReputation
      });

    } catch (error: any) {
      logger.error('Error actualizando reputación de usuario:', error);
      return false;
    }
  }

  /**
   * Agregar asset a usuario
   */
  async addAssetToUser(walletAddress: string, assetId: string): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.assets.includes(assetId)) {
        user.assets.push(assetId);
        return await this.updateUserProfile(walletAddress, {
          assets: user.assets
        });
      }

      return true;

    } catch (error: any) {
      logger.error('Error agregando asset a usuario:', error);
      return false;
    }
  }

  /**
   * Remover asset de usuario
   */
  async removeAssetFromUser(walletAddress: string, assetId: string): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const updatedAssets = user.assets.filter(id => id !== assetId);
      
      return await this.updateUserProfile(walletAddress, {
        assets: updatedAssets
      });

    } catch (error: any) {
      logger.error('Error removiendo asset de usuario:', error);
      return false;
    }
  }

  /**
   * Agregar metaverso a usuario
   */
  async addMetaverseToUser(walletAddress: string, metaverseId: string): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.metaverses.includes(metaverseId)) {
        user.metaverses.push(metaverseId);
        return await this.updateUserProfile(walletAddress, {
          metaverses: user.metaverses
        });
      }

      return true;

    } catch (error: any) {
      logger.error('Error agregando metaverso a usuario:', error);
      return false;
    }
  }

  /**
   * Remover metaverso de usuario
   */
  async removeMetaverseFromUser(walletAddress: string, metaverseId: string): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const updatedMetaverses = user.metaverses.filter(id => id !== metaverseId);
      
      return await this.updateUserProfile(walletAddress, {
        metaverses: updatedMetaverses
      });

    } catch (error: any) {
      logger.error('Error removiendo metaverso de usuario:', error);
      return false;
    }
  }

  /**
   * Verificar usuario
   */
  async verifyUser(walletAddress: string): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return await this.updateUserProfile(walletAddress, {
        isVerified: true
      });

    } catch (error: any) {
      logger.error('Error verificando usuario:', error);
      return false;
    }
  }

  /**
   * Buscar usuarios
   */
  async searchUsers(query: string): Promise<User[]> {
    try {
      const users: User[] = [];
      const lowerQuery = query.toLowerCase();
      
      for (const user of this.users.values()) {
        if (user.username.toLowerCase().includes(lowerQuery) ||
            user.bio.toLowerCase().includes(lowerQuery)) {
          users.push(user);
        }
      }

      return users;

    } catch (error: any) {
      logger.error('Error buscando usuarios:', error);
      return [];
    }
  }

  /**
   * Obtener usuarios por reputación
   */
  async getUsersByReputation(minReputation: number): Promise<User[]> {
    try {
      const users: User[] = [];
      
      for (const user of this.users.values()) {
        if (user.reputation >= minReputation) {
          users.push(user);
        }
      }

      return users.sort((a, b) => b.reputation - a.reputation);

    } catch (error: any) {
      logger.error('Error obteniendo usuarios por reputación:', error);
      return [];
    }
  }

  /**
   * Obtener usuarios verificados
   */
  async getVerifiedUsers(): Promise<User[]> {
    try {
      const users: User[] = [];
      
      for (const user of this.users.values()) {
        if (user.isVerified) {
          users.push(user);
        }
      }

      return users;

    } catch (error: any) {
      logger.error('Error obteniendo usuarios verificados:', error);
      return [];
    }
  }

  /**
   * Obtener usuarios recientes
   */
  async getRecentUsers(limit: number = 10): Promise<User[]> {
    try {
      const users = Array.from(this.users.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      return users;

    } catch (error: any) {
      logger.error('Error obteniendo usuarios recientes:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del registro
   */
  async getRegistryStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    averageReputation: number;
    usersByMonth: { [key: string]: number };
  }> {
    try {
      let verifiedUsers = 0;
      let activeUsers = 0;
      let totalReputation = 0;
      const usersByMonth: { [key: string]: number } = {};

      for (const user of this.users.values()) {
        if (user.isVerified) verifiedUsers++;
        
        // Usuario activo si se ha actualizado en los últimos 30 días
        if (Date.now() - user.updatedAt < 30 * 24 * 60 * 60 * 1000) {
          activeUsers++;
        }

        totalReputation += user.reputation;

        // Contar por mes
        const month = new Date(user.createdAt).toISOString().slice(0, 7);
        usersByMonth[month] = (usersByMonth[month] || 0) + 1;
      }

      const averageReputation = this.totalUsers > 0 
        ? totalReputation / this.totalUsers 
        : 0;

      return {
        totalUsers: this.totalUsers,
        verifiedUsers,
        activeUsers,
        averageReputation,
        usersByMonth
      };

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas del registro:', error);
      return {
        totalUsers: 0,
        verifiedUsers: 0,
        activeUsers: 0,
        averageReputation: 0,
        usersByMonth: {}
      };
    }
  }

  /**
   * Emitir evento de usuario
   */
  private emitUserEvent(eventName: string, data: any): void {
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
   * Obtener total de usuarios
   */
  getTotalUsers(): number {
    return this.totalUsers;
  }

  /**
   * Verificar si un usuario existe
   */
  async userExists(walletAddress: string): Promise<boolean> {
    return this.users.has(walletAddress) || 
           (await this.stateManager.getStorage(this.contractAddress, `user:${walletAddress}`)) !== 
           '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(walletAddress: string): Promise<boolean> {
    try {
      const user = await this.getUser(walletAddress);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Marcar como eliminado
      user.updatedAt = Date.now();
      user.isVerified = false;

      // Guardar usuario actualizado
      this.users.set(walletAddress, user);
      await this.stateManager.setStorage(
        this.contractAddress,
        `user:${walletAddress}`,
        JSON.stringify(user)
      );

      // Emitir evento
      this.emitUserEvent('UserDeleted', {
        walletAddress
      });

      logger.info(`Usuario eliminado: ${walletAddress}`);
      return true;

    } catch (error: any) {
      logger.error('Error eliminando usuario:', error);
      return false;
    }
  }
}

export default UserRegistry; 