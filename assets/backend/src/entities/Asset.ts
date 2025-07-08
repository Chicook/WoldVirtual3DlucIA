/**
 * @fileoverview Entidad Asset para la base de datos
 * @module backend/src/entities/Asset
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

/**
 * Enum para el estado del asset
 */
export enum AssetStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

/**
 * Enum para el tipo de asset
 */
export enum AssetType {
  MODEL_3D = '3d_model',
  TEXTURE = 'texture',
  MATERIAL = 'material',
  ANIMATION = 'animation',
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document'
}

/**
 * Entidad Asset
 */
@Entity('assets')
@Index(['ownerId', 'status'])
@Index(['type', 'status'])
@Index(['createdAt'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ 
    type: 'enum', 
    enum: AssetType, 
    default: AssetType.MODEL_3D 
  })
  type!: AssetType;

  @Column({ 
    type: 'enum', 
    enum: AssetStatus, 
    default: AssetStatus.DRAFT 
  })
  status!: AssetStatus;

  @Column({ type: 'varchar', length: 500, nullable: false })
  fileUrl!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileType?: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'uuid', nullable: false })
  ownerId!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'boolean', default: true })
  allowDownload!: boolean;

  @Column({ type: 'boolean', default: false })
  allowModification!: boolean;

  @Column({ type: 'boolean', default: false })
  allowCommercialUse!: boolean;

  @Column({ type: 'int', default: 0 })
  downloadCount!: number;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: 'int', default: 0 })
  ratingCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  /**
   * Verificar si el asset está publicado
   */
  isPublished(): boolean {
    return this.status === AssetStatus.PUBLISHED;
  }

  /**
   * Verificar si el asset puede ser descargado
   */
  canBeDownloaded(): boolean {
    return this.isPublished() && this.allowDownload;
  }

  /**
   * Verificar si el asset puede ser modificado
   */
  canBeModified(): boolean {
    return this.isPublished() && this.allowModification;
  }

  /**
   * Incrementar contador de descargas
   */
  incrementDownloadCount(): void {
    this.downloadCount++;
  }

  /**
   * Incrementar contador de vistas
   */
  incrementViewCount(): void {
    this.viewCount++;
  }

  /**
   * Calcular rating promedio
   */
  calculateAverageRating(newRating: number): void {
    const totalRating = (this.rating * this.ratingCount) + newRating;
    this.ratingCount++;
    this.rating = totalRating / this.ratingCount;
  }

  /**
   * Publicar el asset
   */
  publish(): void {
    this.status = AssetStatus.PUBLISHED;
    this.publishedAt = new Date();
  }

  /**
   * Archivar el asset
   */
  archive(): void {
    this.status = AssetStatus.ARCHIVED;
    this.archivedAt = new Date();
  }

  /**
   * Eliminar el asset (soft delete)
   */
  delete(): void {
    this.status = AssetStatus.DELETED;
    this.deletedAt = new Date();
  }
} 