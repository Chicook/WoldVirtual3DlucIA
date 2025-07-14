/**
 * Gestor de Entidades del Metaverso
 * 
 * Proporciona funcionalidades para crear, gestionar y sincronizar
 * entidades del metaverso con el sistema blockchain y motor 3D.
 */

import { v4 as uuidv4 } from 'uuid';
import { Entity, EntityId, EntityType, EntityMetadata, EntityState } from '../types';
import { ValidationResult, ValidationError } from '../types';
import { EntitySystemConfig } from '../types';
import { validateEntity } from '../validation';
import { BlockchainIntegration } from '../blockchain';
import { MetadataSystem } from '../metadata-system';
import { VersioningSystem } from '../versioning';
import { CacheSystem } from '../cache';
import { EventEmitter } from '../utils/event-emitter';

/**
 * Gestor principal de entidades
 */
export class EntityManager {
  private entities: Map<EntityId, Entity> = new Map();
  private eventEmitter: EventEmitter;
  private blockchain: BlockchainIntegration;
  private metadata: MetadataSystem;
  private versioning: VersioningSystem;
  private cache: CacheSystem;
  private config: EntitySystemConfig;

  constructor(config: EntitySystemConfig) {
    this.config = config;
    this.eventEmitter = new EventEmitter();
    this.blockchain = new BlockchainIntegration(config.blockchain);
    this.metadata = new MetadataSystem();
    this.versioning = new VersioningSystem();
    this.cache = new CacheSystem(config.cache);
  }

  /**
   * Crear una nueva entidad
   */
  async create(
    type: EntityType,
    metadata: Partial<EntityMetadata>,
    parent?: EntityId
  ): Promise<Entity> {
    const id = this.generateId(type);
    const uri = this.generateURI(type, id);
    
    const entity: Entity = {
      id,
      type,
      uri,
      state: this.createInitialState(),
      metadata: this.metadata.create(metadata),
      parent,
      children: []
    };

    // Validar entidad
    const validation = await validateEntity(entity, this.config);
    if (!validation.valid) {
      throw new ValidationError('Entidad inválida', { errors: validation.errors });
    }

    // Registrar en blockchain si está habilitado
    if (this.config.blockchain.enabled) {
      await this.blockchain.registerEntity(entity);
    }

    // Guardar en cache
    await this.cache.set(id, entity);

    // Emitir evento
    this.eventEmitter.emit('entity:created', { entity });

    return entity;
  }

  /**
   * Obtener una entidad por ID
   */
  async get(id: EntityId): Promise<Entity | null> {
    // Intentar obtener del cache primero
    let entity = await this.cache.get<Entity>(id);
    
    if (!entity) {
      // Buscar en memoria
      entity = this.entities.get(id) || null;
      
      if (entity) {
        // Actualizar cache
        await this.cache.set(id, entity);
      }
    }

    return entity;
  }

  /**
   * Actualizar una entidad
   */
  async update(id: EntityId, updates: Partial<Entity>): Promise<Entity> {
    const entity = await this.get(id);
    if (!entity) {
      throw new Error(`Entidad no encontrada: ${id}`);
    }

    // Aplicar actualizaciones
    const updatedEntity: Entity = {
      ...entity,
      ...updates,
      state: {
        ...entity.state,
        lastModified: new Date(),
        version: this.versioning.increment(entity.state.version)
      }
    };

    // Validar entidad actualizada
    const validation = await validateEntity(updatedEntity, this.config);
    if (!validation.valid) {
      throw new ValidationError('Entidad inválida después de actualización', { 
        errors: validation.errors 
      });
    }

    // Actualizar en blockchain si está habilitado
    if (this.config.blockchain.enabled) {
      await this.blockchain.updateEntity(updatedEntity);
    }

    // Guardar cambios
    this.entities.set(id, updatedEntity);
    await this.cache.set(id, updatedEntity);

    // Emitir evento
    this.eventEmitter.emit('entity:updated', { 
      entity: updatedEntity,
      previous: entity 
    });

    return updatedEntity;
  }

  /**
   * Eliminar una entidad
   */
  async delete(id: EntityId): Promise<void> {
    const entity = await this.get(id);
    if (!entity) {
      throw new Error(`Entidad no encontrada: ${id}`);
    }

    // Eliminar de blockchain si está habilitado
    if (this.config.blockchain.enabled) {
      await this.blockchain.deleteEntity(id);
    }

    // Eliminar de memoria y cache
    this.entities.delete(id);
    await this.cache.delete(id);

    // Emitir evento
    this.eventEmitter.emit('entity:deleted', { entity });
  }

  /**
   * Buscar entidades
   */
  async search(query: string, filters?: Record<string, unknown>): Promise<Entity[]> {
    const results: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (this.matchesSearch(entity, query, filters)) {
        results.push(entity);
      }
    }

    return results;
  }

  /**
   * Obtener entidades por tipo
   */
  async getByType(type: EntityType): Promise<Entity[]> {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  /**
   * Obtener entidades hijas
   */
  async getChildren(parentId: EntityId): Promise<Entity[]> {
    const parent = await this.get(parentId);
    if (!parent || !parent.children) {
      return [];
    }

    const children: Entity[] = [];
    for (const childId of parent.children) {
      const child = await this.get(childId);
      if (child) {
        children.push(child);
      }
    }

    return children;
  }

  /**
   * Agregar entidad hija
   */
  async addChild(parentId: EntityId, childId: EntityId): Promise<void> {
    const parent = await this.get(parentId);
    const child = await this.get(childId);

    if (!parent || !child) {
      throw new Error('Entidad padre o hija no encontrada');
    }

    // Actualizar padre
    const updatedParent = {
      ...parent,
      children: [...(parent.children || []), childId]
    };

    await this.update(parentId, updatedParent);

    // Actualizar hijo
    await this.update(childId, { parent: parentId });
  }

  /**
   * Remover entidad hija
   */
  async removeChild(parentId: EntityId, childId: EntityId): Promise<void> {
    const parent = await this.get(parentId);
    if (!parent) {
      throw new Error('Entidad padre no encontrada');
    }

    // Actualizar padre
    const updatedParent = {
      ...parent,
      children: (parent.children || []).filter(id => id !== childId)
    };

    await this.update(parentId, updatedParent);

    // Actualizar hijo
    await this.update(childId, { parent: undefined });
  }

  /**
   * Verificar propiedad de entidad
   */
  async verifyOwnership(entityId: EntityId, userAddress: string): Promise<boolean> {
    if (!this.config.blockchain.enabled) {
      return false;
    }

    return await this.blockchain.verifyOwnership(entityId, userAddress);
  }

  /**
   * Sincronizar con blockchain
   */
  async syncWithBlockchain(): Promise<void> {
    if (!this.config.blockchain.enabled) {
      return;
    }

    const pendingEntities = await this.blockchain.getPendingEntities();
    
    for (const entity of pendingEntities) {
      await this.update(entity.id, entity);
    }
  }

  /**
   * Exportar entidades
   */
  async export(ids?: EntityId[]): Promise<Entity[]> {
    if (ids) {
      const entities: Entity[] = [];
      for (const id of ids) {
        const entity = await this.get(id);
        if (entity) {
          entities.push(entity);
        }
      }
      return entities;
    }

    return Array.from(this.entities.values());
  }

  /**
   * Importar entidades
   */
  async import(entities: Entity[]): Promise<void> {
    for (const entity of entities) {
      // Validar entidad antes de importar
      const validation = await validateEntity(entity, this.config);
      if (!validation.valid) {
        console.warn(`Saltando entidad inválida: ${entity.id}`, validation.errors);
        continue;
      }

      this.entities.set(entity.id, entity);
      await this.cache.set(entity.id, entity);
    }
  }

  /**
   * Limpiar cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Obtener estadísticas
   */
  getStats(): Record<string, unknown> {
    const stats = {
      totalEntities: this.entities.size,
      byType: {} as Record<EntityType, number>,
      cacheStats: this.cache.getStats(),
      blockchainStats: this.blockchain.getStats()
    };

    // Contar por tipo
    for (const entity of this.entities.values()) {
      stats.byType[entity.type] = (stats.byType[entity.type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Suscribirse a eventos
   */
  on(event: string, callback: (data: unknown) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Desuscribirse de eventos
   */
  off(event: string, callback: (data: unknown) => void): void {
    this.eventEmitter.off(event, callback);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private generateId(type: EntityType): EntityId {
    return `${type}:${uuidv4()}`;
  }

  private generateURI(type: EntityType, id: EntityId): string {
    return `metaverso://${type}s/${id.split(':')[1]}`;
  }

  private createInitialState(): EntityState {
    return {
      active: true,
      visible: true,
      locked: false,
      synced: false,
      lastModified: new Date(),
      version: '1.0.0'
    };
  }

  private matchesSearch(
    entity: Entity, 
    query: string, 
    filters?: Record<string, unknown>
  ): boolean {
    // Búsqueda por texto
    const searchText = query.toLowerCase();
    const matchesQuery = 
      entity.metadata.name.toLowerCase().includes(searchText) ||
      entity.metadata.description?.toLowerCase().includes(searchText) ||
      entity.id.toLowerCase().includes(searchText);

    if (!matchesQuery) {
      return false;
    }

    // Aplicar filtros
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'type' && entity.type !== value) {
          return false;
        }
        if (key === 'owner' && entity.metadata.owner !== value) {
          return false;
        }
        if (key === 'active' && entity.state.active !== value) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Clase Entity para crear instancias de entidades
 */
export class Entity {
  constructor(data: Partial<Entity>) {
    Object.assign(this, data);
  }
} 