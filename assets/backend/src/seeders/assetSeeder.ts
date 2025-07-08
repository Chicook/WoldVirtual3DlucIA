/**
 * @fileoverview Seeder avanzado y modular para assets con generación de datos realistas
 * @module backend/src/seeders/assetSeeder
 */

import { AppDataSource } from '../database/connection';
import { Asset, AssetStatus, AssetType } from '../entities/Asset';
import { Logger } from '../utils/logger';
import { faker } from '@faker-js/faker/locale/es';

const logger = new Logger('AssetSeeder');

// Configuración del seeder
interface SeederConfig {
  totalAssets: number;
  distribution: {
    [key in AssetType]: number;
  };
  statusDistribution: {
    [key in AssetStatus]: number;
  };
  enableRandomization: boolean;
  batchSize: number;
}

// Datos de ejemplo para assets 3D
const ASSET_TEMPLATES = {
  [AssetType.MODEL_3D]: {
    names: [
      'Casa Moderna Minimalista',
      'Coche Deportivo Clásico',
      'Árbol Realista con Texturas',
      'Personaje Fantasía Élfico',
      'Mueble Escandinavo',
      'Arma Medieval Espada',
      'Edificio Corporativo',
      'Vehículo Futurista',
      'Planta Tropical',
      'Mascota Virtual Realista'
    ],
    descriptions: [
      'Modelo 3D de alta calidad con texturas PBR completas',
      'Asset optimizado para renderizado en tiempo real',
      'Incluye mapas de normales, roughness y metallic',
      'Perfecto para proyectos de arquitectura y diseño',
      'Modelo low-poly con LODs incluidos',
      'Texturas de 4K con múltiples variaciones',
      'Rig completo con animaciones básicas',
      'Compatible con Unity, Unreal Engine y Blender'
    ],
    tags: [
      '3d-model', 'pbr', 'textures', 'low-poly', 'high-poly',
      'architecture', 'vehicle', 'character', 'furniture', 'nature'
    ]
  },
  [AssetType.TEXTURE]: {
    names: [
      'Textura de Madera Natural',
      'Metal Corroído Industrial',
      'Tela de Seda Elegante',
      'Piedra Granito Gris',
      'Plástico Transparente',
      'Cuero Envejecido',
      'Cristal Esmerilado',
      'Hormigón Rugoso',
      'Tela de Algodón',
      'Metal Pulido Cromado'
    ],
    descriptions: [
      'Textura PBR de alta resolución con mapas completos',
      'Incluye diffuse, normal, roughness y metallic maps',
      'Perfecta para materiales realistas',
      'Compatible con todos los motores 3D principales',
      'Textura tileable sin costuras visibles',
      'Optimizada para rendimiento en tiempo real'
    ],
    tags: [
      'texture', 'pbr', 'material', 'seamless', 'tileable',
      'wood', 'metal', 'fabric', 'stone', 'plastic'
    ]
  },
  [AssetType.ANIMATION]: {
    names: [
      'Animación de Caminar Humana',
      'Vuelo de Ave Realista',
      'Danza Élfica Elegante',
      'Combate con Espada',
      'Salto Acrobático',
      'Gestos de Manos Naturales',
      'Correr Dinámico',
      'Idle Breathing Sutil',
      'Ataque con Magia',
      'Interacción con Objetos'
    ],
    descriptions: [
      'Animación de alta calidad con keyframes optimizados',
      'Incluye transiciones suaves entre estados',
      'Perfecta para personajes de videojuegos',
      'Compatible con sistemas de animación estándar',
      'Optimizada para rendimiento en tiempo real',
      'Incluye variaciones para diferentes velocidades'
    ],
    tags: [
      'animation', 'character', 'motion', 'keyframe',
      'walk', 'run', 'jump', 'combat', 'idle'
    ]
  },
  [AssetType.SOUND]: {
    names: [
      'Ambiente de Bosque Místico',
      'Efecto de Espada Metálica',
      'Música de Batalla Épica',
      'Sonido de Pasos en Madera',
      'Viento en las Montañas',
      'Explosión Distante',
      'Agua Fluyendo Suavemente',
      'Voces de Multitud',
      'Máquina Industrial',
      'Animales Nocturnos'
    ],
    descriptions: [
      'Audio de alta calidad con múltiples formatos',
      'Perfecto para ambientación inmersiva',
      'Incluye variaciones de intensidad',
      'Optimizado para streaming y compresión',
      'Compatible con sistemas de audio 3D',
      'Incluye loops y one-shots'
    ],
    tags: [
      'sound', 'audio', 'ambient', 'effect', 'music',
      'nature', 'combat', 'environment', 'atmospheric'
    ]
  }
};

// Generadores de datos específicos
class AssetDataGenerator {
  /**
   * Generar nombre realista para asset
   */
  static generateName(type: AssetType): string {
    const templates = ASSET_TEMPLATES[type];
    const baseName = faker.helpers.arrayElement(templates.names);
    
    // Agregar variaciones
    const variations = [
      `${baseName} - ${faker.commerce.productAdjective()}`,
      `${baseName} ${faker.helpers.arrayElement(['Pro', 'Premium', 'HD', '4K', 'Ultra'])}`,
      `${baseName} v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
      `${baseName} ${faker.helpers.arrayElement(['Pack', 'Collection', 'Bundle', 'Set'])}`
    ];
    
    return faker.helpers.arrayElement(variations);
  }

  /**
   * Generar descripción realista
   */
  static generateDescription(type: AssetType): string {
    const templates = ASSET_TEMPLATES[type];
    const baseDesc = faker.helpers.arrayElement(templates.descriptions);
    
    // Agregar detalles técnicos
    const technicalDetails = [
      `Tamaño de archivo: ${faker.number.int({ min: 5, max: 500 })}MB`,
      `Resolución: ${faker.helpers.arrayElement(['2K', '4K', '8K'])}`,
      `Polígonos: ${faker.number.int({ min: 1000, max: 100000 })}`,
      `Formatos incluidos: ${faker.helpers.arrayElement(['FBX, OBJ, GLTF', 'PNG, JPG, TGA', 'MP3, WAV, OGG'])}`
    ];
    
    return `${baseDesc}. ${faker.helpers.arrayElement(technicalDetails)}.`;
  }

  /**
   * Generar tags relevantes
   */
  static generateTags(type: AssetType): string[] {
    const templates = ASSET_TEMPLATES[type];
    const baseTags = faker.helpers.arrayElements(templates.tags, { min: 3, max: 6 });
    
    // Agregar tags adicionales
    const additionalTags = [
      faker.helpers.arrayElement(['free', 'premium', 'exclusive']),
      faker.helpers.arrayElement(['new', 'popular', 'trending']),
      faker.helpers.arrayElement(['verified', 'quality', 'professional'])
    ];
    
    return [...baseTags, ...additionalTags];
  }

  /**
   * Generar metadatos específicos por tipo
   */
  static generateMetadata(type: AssetType): any {
    switch (type) {
      case AssetType.MODEL_3D:
        return {
          polygonCount: faker.number.int({ min: 1000, max: 100000 }),
          textureResolution: faker.helpers.arrayElement(['2K', '4K', '8K']),
          rigged: faker.datatype.boolean(),
          animated: faker.datatype.boolean(),
          lodLevels: faker.number.int({ min: 1, max: 5 }),
          fileFormats: faker.helpers.arrayElements(['FBX', 'OBJ', 'GLTF', 'BLEND'], { min: 2, max: 4 })
        };
      
      case AssetType.TEXTURE:
        return {
          resolution: faker.helpers.arrayElement(['2K', '4K', '8K']),
          tileable: faker.datatype.boolean(),
          pbrMaps: faker.helpers.arrayElements(['diffuse', 'normal', 'roughness', 'metallic', 'ao'], { min: 3, max: 5 }),
          compression: faker.helpers.arrayElement(['PNG', 'JPG', 'TGA', 'EXR'])
        };
      
      case AssetType.ANIMATION:
        return {
          duration: faker.number.float({ min: 1, max: 10, precision: 0.1 }),
          frameRate: faker.helpers.arrayElement([24, 30, 60]),
          keyframeCount: faker.number.int({ min: 10, max: 1000 }),
          loopable: faker.datatype.boolean(),
          fileFormats: faker.helpers.arrayElements(['FBX', 'BVH', 'ABC'], { min: 1, max: 3 })
        };
      
      case AssetType.SOUND:
        return {
          duration: faker.number.float({ min: 1, max: 300, precision: 0.1 }),
          sampleRate: faker.helpers.arrayElement([44100, 48000, 96000]),
          bitDepth: faker.helpers.arrayElement([16, 24, 32]),
          channels: faker.helpers.arrayElement([1, 2, 5.1]),
          fileFormats: faker.helpers.arrayElements(['MP3', 'WAV', 'OGG', 'FLAC'], { min: 2, max: 4 })
        };
      
      default:
        return {};
    }
  }

  /**
   * Generar URL de archivo realista
   */
  static generateFileUrl(type: AssetType): string {
    const baseUrl = 'https://assets.woldvirtual3d.com';
    const extensions = {
      [AssetType.MODEL_3D]: ['fbx', 'obj', 'gltf'],
      [AssetType.TEXTURE]: ['png', 'jpg', 'tga'],
      [AssetType.ANIMATION]: ['fbx', 'bvh', 'abc'],
      [AssetType.SOUND]: ['mp3', 'wav', 'ogg']
    };
    
    const ext = faker.helpers.arrayElement(extensions[type]);
    const filename = faker.string.alphanumeric(16);
    
    return `${baseUrl}/${type.toLowerCase()}/${filename}.${ext}`;
  }

  /**
   * Generar URL de preview
   */
  static generatePreviewUrl(type: AssetType): string {
    const baseUrl = 'https://previews.woldvirtual3d.com';
    const filename = faker.string.alphanumeric(16);
    
    return `${baseUrl}/${type.toLowerCase()}/${filename}.jpg`;
  }
}

// Clase principal del seeder
export class AssetSeeder {
  private config: SeederConfig;
  private assetRepository = AppDataSource.getRepository(Asset);

  constructor(config: Partial<SeederConfig> = {}) {
    this.config = {
      totalAssets: 1000,
      distribution: {
        [AssetType.MODEL_3D]: 0.4,
        [AssetType.TEXTURE]: 0.3,
        [AssetType.ANIMATION]: 0.2,
        [AssetType.SOUND]: 0.1
      },
      statusDistribution: {
        [AssetStatus.PUBLISHED]: 0.7,
        [AssetStatus.DRAFT]: 0.2,
        [AssetStatus.ARCHIVED]: 0.1,
        [AssetStatus.DELETED]: 0
      },
      enableRandomization: true,
      batchSize: 100,
      ...config
    };
  }

  /**
   * Generar un asset individual
   */
  private generateAsset(): Asset {
    // Seleccionar tipo basado en distribución
    const type = this.selectTypeByDistribution();
    const status = this.selectStatusByDistribution();
    
    const asset = new Asset();
    asset.name = AssetDataGenerator.generateName(type);
    asset.description = AssetDataGenerator.generateDescription(type);
    asset.type = type;
    asset.status = status;
    asset.fileUrl = AssetDataGenerator.generateFileUrl(type);
    asset.previewUrl = AssetDataGenerator.generatePreviewUrl(type);
    asset.ownerId = faker.string.uuid();
    asset.tags = AssetDataGenerator.generateTags(type);
    asset.metadata = AssetDataGenerator.generateMetadata(type);
    
    // Propiedades de permisos
    asset.isPublic = faker.datatype.boolean({ probability: 0.8 });
    asset.allowDownload = faker.datatype.boolean({ probability: 0.9 });
    asset.allowModification = faker.datatype.boolean({ probability: 0.6 });
    asset.allowCommercialUse = faker.datatype.boolean({ probability: 0.7 });
    
    // Propiedades de archivo
    asset.fileSize = faker.number.int({ min: 1024, max: 100 * 1024 * 1024 }); // 1KB a 100MB
    asset.fileFormat = faker.helpers.arrayElement(['FBX', 'OBJ', 'PNG', 'JPG', 'MP3', 'WAV']);
    
    // Propiedades de rendimiento
    asset.rating = faker.number.float({ min: 1, max: 5, precision: 0.1 });
    asset.ratingCount = faker.number.int({ min: 0, max: 1000 });
    asset.downloadCount = faker.number.int({ min: 0, max: 10000 });
    asset.viewCount = faker.number.int({ min: 0, max: 50000 });
    
    // Fechas realistas
    const createdAt = faker.date.past({ years: 2 });
    asset.createdAt = createdAt;
    asset.updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    
    if (status === AssetStatus.PUBLISHED) {
      asset.publishedAt = faker.date.between({ from: createdAt, to: new Date() });
    }
    
    if (status === AssetStatus.DELETED) {
      asset.deletedAt = faker.date.between({ from: createdAt, to: new Date() });
    }
    
    return asset;
  }

  /**
   * Seleccionar tipo basado en distribución
   */
  private selectTypeByDistribution(): AssetType {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [type, probability] of Object.entries(this.config.distribution)) {
      cumulative += probability;
      if (random <= cumulative) {
        return type as AssetType;
      }
    }
    
    return AssetType.MODEL_3D; // fallback
  }

  /**
   * Seleccionar status basado en distribución
   */
  private selectStatusByDistribution(): AssetStatus {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [status, probability] of Object.entries(this.config.statusDistribution)) {
      cumulative += probability;
      if (random <= cumulative) {
        return status as AssetStatus;
      }
    }
    
    return AssetStatus.PUBLISHED; // fallback
  }

  /**
   * Ejecutar seeder completo
   */
  async seed(): Promise<void> {
    try {
      logger.info(`🌱 Iniciando seeder de assets...`);
      logger.info(`📊 Configuración: ${this.config.totalAssets} assets totales`);
      
      const startTime = Date.now();
      let processed = 0;
      
      // Procesar en lotes para mejor rendimiento
      for (let i = 0; i < this.config.totalAssets; i += this.config.batchSize) {
        const batchSize = Math.min(this.config.batchSize, this.config.totalAssets - i);
        const batch = [];
        
        for (let j = 0; j < batchSize; j++) {
          batch.push(this.generateAsset());
        }
        
        await this.assetRepository.save(batch);
        processed += batchSize;
        
        const progress = ((processed / this.config.totalAssets) * 100).toFixed(1);
        logger.info(`📈 Progreso: ${progress}% (${processed}/${this.config.totalAssets})`);
      }
      
      const duration = Date.now() - startTime;
      logger.info(`✅ Seeder completado en ${duration}ms`);
      logger.info(`📊 Assets creados: ${processed}`);
      
    } catch (error: any) {
      logger.error('❌ Error en seeder:', error);
      throw error;
    }
  }

  /**
   * Limpiar todos los assets
   */
  async clear(): Promise<void> {
    try {
      logger.info('🧹 Limpiando assets...');
      await this.assetRepository.clear();
      logger.info('✅ Assets limpiados');
    } catch (error: any) {
      logger.error('❌ Error limpiando assets:', error);
      throw error;
    }
  }

  /**
   * Ejecutar seeder con limpieza previa
   */
  async seedWithCleanup(): Promise<void> {
    await this.clear();
    await this.seed();
  }

  /**
   * Generar assets de ejemplo específicos
   */
  async seedExamples(): Promise<void> {
    try {
      logger.info('🎯 Generando assets de ejemplo...');
      
      const examples = [
        this.createExampleAsset(AssetType.MODEL_3D, 'Casa Moderna Premium', 'Casa moderna con diseño minimalista y texturas PBR completas'),
        this.createExampleAsset(AssetType.TEXTURE, 'Madera Roble Natural', 'Textura de madera de roble con mapas PBR de alta calidad'),
        this.createExampleAsset(AssetType.ANIMATION, 'Caminar Humano Realista', 'Animación de caminar con 24 keyframes optimizados'),
        this.createExampleAsset(AssetType.SOUND, 'Ambiente Bosque Místico', 'Sonido ambiental de bosque con duración de 3 minutos')
      ];
      
      await this.assetRepository.save(examples);
      logger.info('✅ Assets de ejemplo creados');
      
    } catch (error: any) {
      logger.error('❌ Error creando ejemplos:', error);
      throw error;
    }
  }

  /**
   * Crear asset de ejemplo específico
   */
  private createExampleAsset(type: AssetType, name: string, description: string): Asset {
    const asset = new Asset();
    asset.name = name;
    asset.description = description;
    asset.type = type;
    asset.status = AssetStatus.PUBLISHED;
    asset.fileUrl = AssetDataGenerator.generateFileUrl(type);
    asset.previewUrl = AssetDataGenerator.generatePreviewUrl(type);
    asset.ownerId = 'example-owner-id';
    asset.tags = AssetDataGenerator.generateTags(type);
    asset.metadata = AssetDataGenerator.generateMetadata(type);
    asset.isPublic = true;
    asset.allowDownload = true;
    asset.allowModification = false;
    asset.allowCommercialUse = false;
    asset.fileSize = 1024 * 1024; // 1MB
    asset.fileFormat = 'FBX';
    asset.rating = 4.5;
    asset.ratingCount = 10;
    asset.downloadCount = 100;
    asset.viewCount = 500;
    asset.createdAt = new Date();
    asset.updatedAt = new Date();
    asset.publishedAt = new Date();
    
    return asset;
  }
}

// Función de conveniencia para ejecutar el seeder
export async function runAssetSeeder(config?: Partial<SeederConfig>): Promise<void> {
  const seeder = new AssetSeeder(config);
  await seeder.seed();
}

// Función para ejecutar con limpieza
export async function runAssetSeederWithCleanup(config?: Partial<SeederConfig>): Promise<void> {
  const seeder = new AssetSeeder(config);
  await seeder.seedWithCleanup();
}

// Función para ejecutar solo ejemplos
export async function runAssetExamples(): Promise<void> {
  const seeder = new AssetSeeder();
  await seeder.seedExamples();
}

export default AssetSeeder;
