/**
 * Sistema de Metadatos del Metaverso
 * 
 * Gestiona metadatos de entidades, incluyendo propiedades dinámicas,
 * versionado y validación de esquemas.
 */

import { EntityMetadata, Permission, BlockchainMetadata } from '../types';
import { ValidationResult, ValidationError } from '../types';

/**
 * Sistema de gestión de metadatos
 */
export class MetadataSystem {
  private schemas: Map<string, MetadataSchema> = new Map();
  private validators: Map<string, MetadataValidator> = new Map();

  constructor() {
    this.initializeDefaultSchemas();
  }

  /**
   * Crear metadatos para una entidad
   */
  create(data: Partial<EntityMetadata>): EntityMetadata {
    const metadata: EntityMetadata = {
      name: data.name || 'Sin nombre',
      description: data.description,
      tags: data.tags || [],
      owner: data.owner,
      created: data.created || new Date(),
      modified: data.modified || new Date(),
      version: data.version || '1.0.0',
      properties: data.properties || {},
      permissions: data.permissions || [],
      blockchain: data.blockchain
    };

    // Validar metadatos
    const validation = this.validate(metadata);
    if (!validation.valid) {
      throw new ValidationError('Metadatos inválidos', { errors: validation.errors });
    }

    return metadata;
  }

  /**
   * Actualizar metadatos
   */
  update(
    current: EntityMetadata, 
    updates: Partial<EntityMetadata>
  ): EntityMetadata {
    const updated: EntityMetadata = {
      ...current,
      ...updates,
      modified: new Date(),
      version: this.incrementVersion(current.version)
    };

    // Validar metadatos actualizados
    const validation = this.validate(updated);
    if (!validation.valid) {
      throw new ValidationError('Metadatos inválidos después de actualización', { 
        errors: validation.errors 
      });
    }

    return updated;
  }

  /**
   * Validar metadatos
   */
  validate(metadata: EntityMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validar nombre
    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'El nombre es requerido',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (metadata.name && metadata.name.length > 100) {
      errors.push({
        field: 'name',
        message: 'El nombre no puede exceder 100 caracteres',
        code: 'MAX_LENGTH_EXCEEDED',
        severity: 'error'
      });
    }

    // Validar descripción
    if (metadata.description && metadata.description.length > 1000) {
      errors.push({
        field: 'description',
        message: 'La descripción no puede exceder 1000 caracteres',
        code: 'MAX_LENGTH_EXCEEDED',
        severity: 'error'
      });
    }

    // Validar tags
    if (metadata.tags && metadata.tags.length > 20) {
      errors.push({
        field: 'tags',
        message: 'No se pueden tener más de 20 tags',
        code: 'MAX_ITEMS_EXCEEDED',
        severity: 'error'
      });
    }

    // Validar propiedades
    if (metadata.properties) {
      const propertyValidation = this.validateProperties(metadata.properties);
      errors.push(...propertyValidation.errors);
      warnings.push(...propertyValidation.warnings);
    }

    // Validar permisos
    if (metadata.permissions) {
      const permissionValidation = this.validatePermissions(metadata.permissions);
      errors.push(...permissionValidation.errors);
      warnings.push(...permissionValidation.warnings);
    }

    // Validar metadatos de blockchain
    if (metadata.blockchain) {
      const blockchainValidation = this.validateBlockchainMetadata(metadata.blockchain);
      errors.push(...blockchainValidation.errors);
      warnings.push(...blockchainValidation.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Agregar propiedad a metadatos
   */
  addProperty(
    metadata: EntityMetadata, 
    key: string, 
    value: unknown
  ): EntityMetadata {
    const properties = {
      ...metadata.properties,
      [key]: value
    };

    return this.update(metadata, { properties });
  }

  /**
   * Remover propiedad de metadatos
   */
  removeProperty(metadata: EntityMetadata, key: string): EntityMetadata {
    const properties = { ...metadata.properties };
    delete properties[key];

    return this.update(metadata, { properties });
  }

  /**
   * Agregar tag
   */
  addTag(metadata: EntityMetadata, tag: string): EntityMetadata {
    const tags = [...(metadata.tags || []), tag];
    return this.update(metadata, { tags });
  }

  /**
   * Remover tag
   */
  removeTag(metadata: EntityMetadata, tag: string): EntityMetadata {
    const tags = (metadata.tags || []).filter(t => t !== tag);
    return this.update(metadata, { tags });
  }

  /**
   * Agregar permiso
   */
  addPermission(
    metadata: EntityMetadata, 
    permission: Permission
  ): EntityMetadata {
    const permissions = [...(metadata.permissions || []), permission];
    return this.update(metadata, { permissions });
  }

  /**
   * Remover permiso
   */
  removePermission(
    metadata: EntityMetadata, 
    userId: string
  ): EntityMetadata {
    const permissions = (metadata.permissions || []).filter(p => p.user !== userId);
    return this.update(metadata, { permissions });
  }

  /**
   * Actualizar metadatos de blockchain
   */
  updateBlockchainMetadata(
    metadata: EntityMetadata, 
    blockchainData: Partial<BlockchainMetadata>
  ): EntityMetadata {
    const blockchain = {
      ...metadata.blockchain,
      ...blockchainData
    };

    return this.update(metadata, { blockchain });
  }

  /**
   * Buscar en metadatos
   */
  search(
    metadata: EntityMetadata, 
    query: string
  ): boolean {
    const searchText = query.toLowerCase();
    
    return (
      metadata.name.toLowerCase().includes(searchText) ||
      metadata.description?.toLowerCase().includes(searchText) ||
      metadata.tags?.some(tag => tag.toLowerCase().includes(searchText)) ||
      Object.keys(metadata.properties || {}).some(key => 
        key.toLowerCase().includes(searchText)
      )
    );
  }

  /**
   * Exportar metadatos
   */
  export(metadata: EntityMetadata): Record<string, unknown> {
    return {
      name: metadata.name,
      description: metadata.description,
      tags: metadata.tags,
      owner: metadata.owner,
      created: metadata.created.toISOString(),
      modified: metadata.modified.toISOString(),
      version: metadata.version,
      properties: metadata.properties,
      permissions: metadata.permissions?.map(p => ({
        ...p,
        granted: p.granted.toISOString(),
        expires: p.expires?.toISOString()
      })),
      blockchain: metadata.blockchain
    };
  }

  /**
   * Importar metadatos
   */
  import(data: Record<string, unknown>): EntityMetadata {
    return this.create({
      name: data.name as string,
      description: data.description as string,
      tags: data.tags as string[],
      owner: data.owner as string,
      created: data.created ? new Date(data.created as string) : undefined,
      modified: data.modified ? new Date(data.modified as string) : undefined,
      version: data.version as string,
      properties: data.properties as Record<string, unknown>,
      permissions: (data.permissions as any[])?.map(p => ({
        ...p,
        granted: new Date(p.granted),
        expires: p.expires ? new Date(p.expires) : undefined
      })),
      blockchain: data.blockchain as BlockchainMetadata
    });
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private initializeDefaultSchemas(): void {
    // Esquema básico para entidades
    this.schemas.set('basic', {
      name: { type: 'string', required: true, maxLength: 100 },
      description: { type: 'string', required: false, maxLength: 1000 },
      tags: { type: 'array', required: false, maxItems: 20 },
      owner: { type: 'string', required: false },
      properties: { type: 'object', required: false }
    });

    // Esquema para mundos
    this.schemas.set('world', {
      name: { type: 'string', required: true, maxLength: 100 },
      description: { type: 'string', required: false, maxLength: 1000 },
      tags: { type: 'array', required: false, maxItems: 20 },
      owner: { type: 'string', required: true },
      properties: { 
        type: 'object', 
        required: false,
        schema: {
          size: { type: 'number', required: false },
          theme: { type: 'string', required: false },
          maxPlayers: { type: 'number', required: false }
        }
      }
    });
  }

  private validateProperties(properties: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validar tamaño de propiedades
    const propertyKeys = Object.keys(properties);
    if (propertyKeys.length > 100) {
      errors.push({
        field: 'properties',
        message: 'No se pueden tener más de 100 propiedades',
        code: 'MAX_PROPERTIES_EXCEEDED',
        severity: 'error'
      });
    }

    // Validar valores de propiedades
    for (const [key, value] of Object.entries(properties)) {
      if (key.length > 50) {
        errors.push({
          field: `properties.${key}`,
          message: 'La clave de propiedad no puede exceder 50 caracteres',
          code: 'MAX_LENGTH_EXCEEDED',
          severity: 'error'
        });
      }

      if (typeof value === 'string' && value.length > 1000) {
        errors.push({
          field: `properties.${key}`,
          message: 'El valor de propiedad no puede exceder 1000 caracteres',
          code: 'MAX_LENGTH_EXCEEDED',
          severity: 'error'
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validatePermissions(permissions: Permission[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (let i = 0; i < permissions.length; i++) {
      const permission = permissions[i];

      if (!permission.user) {
        errors.push({
          field: `permissions[${i}].user`,
          message: 'El usuario es requerido',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!permission.actions || permission.actions.length === 0) {
        errors.push({
          field: `permissions[${i}].actions`,
          message: 'Las acciones son requeridas',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (permission.expires && permission.expires < new Date()) {
        warnings.push({
          field: `permissions[${i}].expires`,
          message: 'El permiso ha expirado',
          code: 'EXPIRED_PERMISSION',
          severity: 'error'
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateBlockchainMetadata(blockchain: BlockchainMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!blockchain.network) {
      errors.push({
        field: 'blockchain.network',
        message: 'La red de blockchain es requerida',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (blockchain.tokenId && !blockchain.contractAddress) {
      warnings.push({
        field: 'blockchain.contractAddress',
        message: 'Se requiere dirección de contrato cuando hay token ID',
        code: 'MISSING_CONTRACT_ADDRESS',
        severity: 'error'
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0] || '1');
    const minor = parseInt(parts[1] || '0');
    const patch = parseInt(parts[2] || '0') + 1;
    
    return `${major}.${minor}.${patch}`;
  }
}

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

interface MetadataSchema {
  [key: string]: SchemaField;
}

interface SchemaField {
  type: string;
  required: boolean;
  maxLength?: number;
  maxItems?: number;
  schema?: MetadataSchema;
}

interface MetadataValidator {
  validate(data: unknown): ValidationResult;
} 