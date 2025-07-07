/**
 * @fileoverview Tipos principales del sistema de generación de imágenes
 * @module @metaverso/image-generator/types
 */

import * as THREE from 'three';

// ============================================================================
// PARÁMETROS DE GENERACIÓN
// ============================================================================

/**
 * Parámetros base de generación
 */
export interface GenerationParams {
  /** Resolución de la imagen */
  resolution: number;
  /** Calidad de la generación */
  quality: 'low' | 'medium' | 'high' | 'ultra';
  /** Algoritmo de ruido */
  algorithm: 'perlin' | 'simplex' | 'worley' | 'cellular' | 'fractal';
  /** Número de octavas */
  octaves: number;
  /** Persistencia del ruido */
  persistence: number;
  /** Lacunaridad del ruido */
  lacunarity: number;
  /** Semilla para generación */
  seed: number;
  /** Paleta de colores */
  colorPalette: ColorPalette;
  /** Contraste */
  contrast: number;
  /** Saturación */
  saturation: number;
  /** Brillo */
  brightness: number;
  /** Efectos adicionales */
  effects: GenerationEffects;
}

/**
 * Parámetros específicos para skybox
 */
export interface SkyboxParams extends GenerationParams {
  /** Tipo de skybox */
  type: 'day' | 'night' | 'sunset' | 'sunrise' | 'storm' | 'aurora' | 'space';
  /** Simulación atmosférica */
  atmosphere: boolean;
  /** Nubes */
  clouds: boolean;
  /** Estrellas */
  stars: boolean;
  /** Aurora boreal */
  aurora: boolean;
  /** Rayos */
  lightning: boolean;
  /** Dirección del sol */
  sunDirection: THREE.Vector3;
  /** Color del sol */
  sunColor: THREE.Color;
  /** Color del cielo superior */
  skyTopColor: THREE.Color;
  /** Color del cielo inferior */
  skyBottomColor: THREE.Color;
  /** Intensidad del scattering */
  scatteringIntensity: number;
  /** Altura de la atmósfera */
  atmosphereHeight: number;
}

/**
 * Parámetros específicos para terreno
 */
export interface TerrainParams extends GenerationParams {
  /** Ancho del terreno */
  width: number;
  /** Alto del terreno */
  height: number;
  /** Escala del terreno */
  scale: number;
  /** Altura máxima */
  maxHeight: number;
  /** Altura mínima */
  minHeight: number;
  /** Erosión */
  erosion: boolean;
  /** Erosión por agua */
  waterErosion: boolean;
  /** Erosión térmica */
  thermalErosion: boolean;
  /** Intensidad de erosión */
  erosionIntensity: number;
  /** Iteraciones de erosión */
  erosionIterations: number;
  /** Textura de altura */
  heightTexture: boolean;
  /** Textura de normal */
  normalTexture: boolean;
  /** Textura de rugosidad */
  roughnessTexture: boolean;
}

/**
 * Parámetros específicos para texturas
 */
export interface TextureParams extends GenerationParams {
  /** Tipo de textura */
  type: 'marble' | 'wood' | 'metal' | 'fabric' | 'stone' | 'noise' | 'gradient';
  /** Tamaño de la textura */
  size: number;
  /** Repetición */
  repeat: THREE.Vector2;
  /** Offset */
  offset: THREE.Vector2;
  /** Rotación */
  rotation: number;
  /** Tiling */
  tiling: boolean;
  /** Seamless */
  seamless: boolean;
  /** Normal map */
  normalMap: boolean;
  /** Roughness map */
  roughnessMap: boolean;
  /** Metallic map */
  metallicMap: boolean;
  /** AO map */
  aoMap: boolean;
}

/**
 * Efectos de generación
 */
export interface GenerationEffects {
  /** Efectos atmosféricos */
  atmosphere: boolean;
  /** Nubes volumétricas */
  volumetricClouds: boolean;
  /** Niebla */
  fog: boolean;
  /** Lluvia */
  rain: boolean;
  /** Nieve */
  snow: boolean;
  /** Polvo */
  dust: boolean;
  /** Humo */
  smoke: boolean;
  /** Partículas */
  particles: boolean;
  /** Post-procesamiento */
  postProcessing: boolean;
  /** Bloom */
  bloom: boolean;
  /** SSAO */
  ssao: boolean;
  /** Motion blur */
  motionBlur: boolean;
}

// ============================================================================
// PALETAS DE COLORES
// ============================================================================

/**
 * Paleta de colores
 */
export interface ColorPalette {
  /** Nombre de la paleta */
  name: string;
  /** Colores principales */
  primary: THREE.Color[];
  /** Colores secundarios */
  secondary: THREE.Color[];
  /** Colores de acento */
  accent: THREE.Color[];
  /** Colores de fondo */
  background: THREE.Color[];
  /** Función de interpolación */
  interpolation: 'linear' | 'ease' | 'cubic' | 'bezier';
  /** Distribución de colores */
  distribution: 'uniform' | 'weighted' | 'random';
}

/**
 * Paletas predefinidas
 */
export const PREDEFINED_PALETTES: Record<string, ColorPalette> = {
  sunset: {
    name: 'Sunset',
    primary: [
      new THREE.Color(0xff6b35),
      new THREE.Color(0xf7931e),
      new THREE.Color(0xffd23f)
    ],
    secondary: [
      new THREE.Color(0x8b4513),
      new THREE.Color(0xcd853f),
      new THREE.Color(0xdaa520)
    ],
    accent: [
      new THREE.Color(0xff1493),
      new THREE.Color(0xff69b4),
      new THREE.Color(0xffb6c1)
    ],
    background: [
      new THREE.Color(0x191970),
      new THREE.Color(0x4169e1),
      new THREE.Color(0x87ceeb)
    ],
    interpolation: 'cubic',
    distribution: 'weighted'
  },
  ocean: {
    name: 'Ocean',
    primary: [
      new THREE.Color(0x006994),
      new THREE.Color(0x0099cc),
      new THREE.Color(0x00bfff)
    ],
    secondary: [
      new THREE.Color(0x004d99),
      new THREE.Color(0x0066cc),
      new THREE.Color(0x0099ff)
    ],
    accent: [
      new THREE.Color(0x00ffff),
      new THREE.Color(0x40e0d0),
      new THREE.Color(0x7fffd4)
    ],
    background: [
      new THREE.Color(0x000080),
      new THREE.Color(0x0000cd),
      new THREE.Color(0x0000ff)
    ],
    interpolation: 'linear',
    distribution: 'uniform'
  },
  forest: {
    name: 'Forest',
    primary: [
      new THREE.Color(0x228b22),
      new THREE.Color(0x32cd32),
      new THREE.Color(0x90ee90)
    ],
    secondary: [
      new THREE.Color(0x006400),
      new THREE.Color(0x008000),
      new THREE.Color(0x00ff00)
    ],
    accent: [
      new THREE.Color(0x8fbc8f),
      new THREE.Color(0x98fb98),
      new THREE.Color(0xadff2f)
    ],
    background: [
      new THREE.Color(0x2f4f2f),
      new THREE.Color(0x556b2f),
      new THREE.Color(0x6b8e23)
    ],
    interpolation: 'ease',
    distribution: 'weighted'
  }
};

// ============================================================================
// PARÁMETROS DE NFT
// ============================================================================

/**
 * Parámetros para creación de NFT
 */
export interface NFTParams {
  /** Imagen generada */
  image: THREE.Texture | string;
  /** Nombre del NFT */
  name: string;
  /** Descripción del NFT */
  description: string;
  /** Atributos del NFT */
  attributes: NFTAttributes;
  /** Red blockchain */
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum' | 'optimism';
  /** Dirección del contrato */
  contractAddress?: string;
  /** Metadatos adicionales */
  metadata?: Record<string, any>;
}

/**
 * Atributos del NFT
 */
export interface NFTAttributes {
  /** Tipo de imagen */
  type: 'skybox' | 'terrain' | 'texture' | 'atmosphere' | 'clouds';
  /** Resolución */
  resolution: string;
  /** Algoritmo usado */
  algorithm: string;
  /** Semilla de generación */
  seed: number;
  /** Parámetros de generación */
  generationParams: GenerationParams;
  /** Fecha de creación */
  createdAt: string;
  /** Versión del generador */
  generatorVersion: string;
  /** Hash de la imagen */
  imageHash: string;
  /** Raridad */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// ============================================================================
// PARÁMETROS DE COMPRESIÓN
// ============================================================================

/**
 * Parámetros de compresión
 */
export interface CompressionParams {
  /** Algoritmo de compresión */
  algorithm: 'jpeg' | 'png' | 'webp' | 'avif' | 'ktx2' | 'dds';
  /** Calidad de compresión */
  quality: number;
  /** Tamaño máximo */
  maxSize: number;
  /** Optimización */
  optimization: boolean;
  /** Progressive */
  progressive: boolean;
  /** Metadata */
  preserveMetadata: boolean;
  /** Color space */
  colorSpace: 'srgb' | 'p3' | 'rec2020';
  /** Bit depth */
  bitDepth: 8 | 16 | 32;
}

// ============================================================================
// PARÁMETROS DEL EDITOR
// ============================================================================

/**
 * Parámetros del editor visual
 */
export interface EditorParams {
  /** Canvas del editor */
  canvas: HTMLCanvasElement;
  /** Controles habilitados */
  controls: EditorControls;
  /** Preview en tiempo real */
  realTimePreview: boolean;
  /** Auto-save */
  autoSave: boolean;
  /** Intervalo de auto-save */
  autoSaveInterval: number;
  /** Historial de cambios */
  history: boolean;
  /** Máximo de cambios en historial */
  maxHistorySize: number;
  /** Templates disponibles */
  templates: string[];
}

/**
 * Controles del editor
 */
export interface EditorControls {
  /** Controles de parámetros */
  parameters: boolean;
  /** Controles de color */
  colors: boolean;
  /** Controles de efectos */
  effects: boolean;
  /** Controles de exportación */
  export: boolean;
  /** Controles de NFT */
  nft: boolean;
  /** Controles de compresión */
  compression: boolean;
}

// ============================================================================
// RESULTADOS DE GENERACIÓN
// ============================================================================

/**
 * Resultado de generación de skybox
 */
export interface SkyboxResult {
  /** Textura del skybox */
  texture: THREE.Texture;
  /** Cubemap */
  cubemap: THREE.CubeTexture;
  /** Equirectangular */
  equirectangular: THREE.Texture;
  /** Metadata */
  metadata: SkyboxMetadata;
  /** Parámetros usados */
  parameters: SkyboxParams;
}

/**
 * Metadata del skybox
 */
export interface SkyboxMetadata {
  /** Tipo de skybox */
  type: string;
  /** Resolución */
  resolution: string;
  /** Tiempo de generación */
  generationTime: number;
  /** Tamaño del archivo */
  fileSize: number;
  /** Hash de la imagen */
  imageHash: string;
  /** Parámetros de generación */
  generationParams: SkyboxParams;
}

/**
 * Resultado de generación de terreno
 */
export interface TerrainResult {
  /** Heightmap */
  heightmap: THREE.Texture;
  /** Normal map */
  normalMap: THREE.Texture;
  /** Roughness map */
  roughnessMap: THREE.Texture;
  /** Geometría del terreno */
  geometry: THREE.BufferGeometry;
  /** Metadata */
  metadata: TerrainMetadata;
  /** Parámetros usados */
  parameters: TerrainParams;
}

/**
 * Metadata del terreno
 */
export interface TerrainMetadata {
  /** Dimensiones */
  dimensions: { width: number; height: number };
  /** Altura máxima */
  maxHeight: number;
  /** Altura mínima */
  minHeight: number;
  /** Tiempo de generación */
  generationTime: number;
  /** Tamaño del archivo */
  fileSize: number;
  /** Hash de la imagen */
  imageHash: string;
  /** Parámetros de generación */
  generationParams: TerrainParams;
}

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

/**
 * Formatos de exportación
 */
export type ExportFormat = 
  | 'png'
  | 'jpg'
  | 'webp'
  | 'avif'
  | 'ktx2'
  | 'dds'
  | 'hdr'
  | 'exr'
  | 'tga'
  | 'bmp';

/**
 * Opciones de exportación
 */
export interface ExportOptions {
  /** Formato de exportación */
  format: ExportFormat;
  /** Calidad */
  quality: number;
  /** Compresión */
  compression: boolean;
  /** Metadata */
  includeMetadata: boolean;
  /** Múltiples resoluciones */
  multipleResolutions: boolean;
  /** Resoluciones */
  resolutions: number[];
  /** Nombre del archivo */
  filename: string;
  /** Directorio de salida */
  outputDir: string;
}

// ============================================================================
// TIPOS DE EXPORTACIÓN
// ============================================================================

/**
 * Exportaciones del módulo
 */
export type {
  GenerationParams,
  SkyboxParams,
  TerrainParams,
  TextureParams,
  GenerationEffects,
  ColorPalette,
  NFTParams,
  NFTAttributes,
  CompressionParams,
  EditorParams,
  EditorControls,
  SkyboxResult,
  SkyboxMetadata,
  TerrainResult,
  TerrainMetadata,
  ExportFormat,
  ExportOptions
};

export { PREDEFINED_PALETTES }; 