/**
 * @fileoverview Sistema de Generación de Imágenes de Entorno - Punto de entrada principal
 * @module @metaverso/image-generator
 * @version 1.0.0
 * @license MIT
 */

// Exportaciones de generadores
export { ProceduralSkyboxGenerator } from './generators/ProceduralSkyboxGenerator';
export { TerrainGenerator } from './generators/TerrainGenerator';
export { TextureGenerator } from './generators/TextureGenerator';
export { AtmosphereGenerator } from './generators/AtmosphereGenerator';
export { CloudGenerator } from './generators/CloudGenerator';
export { StarFieldGenerator } from './generators/StarFieldGenerator';
export { AuroraGenerator } from './generators/AuroraGenerator';

// Exportaciones de shaders
export { SkyboxShader } from './shaders/SkyboxShader';
export { TerrainShader } from './shaders/TerrainShader';
export { AtmosphereShader } from './shaders/AtmosphereShader';
export { CloudShader } from './shaders/CloudShader';
export { NoiseShader } from './shaders/NoiseShader';

// Exportaciones Web3
export { NFTImageCreator } from './web3/NFTImageCreator';
export { ImageMarketplace } from './web3/ImageMarketplace';
export { AuthenticityVerifier } from './web3/AuthenticityVerifier';
export { MetadataManager } from './web3/MetadataManager';

// Exportaciones de utilidades
export { NoiseGenerator } from './utils/NoiseGenerator';
export { ColorPalette } from './utils/ColorPalette';
export { ImageProcessor } from './utils/ImageProcessor';
export { CompressionManager } from './utils/CompressionManager';
export { LODManager } from './utils/LODManager';

// Exportaciones del editor
export { VisualEditor } from './editor/VisualEditor';
export { ParameterController } from './editor/ParameterController';
export { RealTimePreview } from './editor/RealTimePreview';

// Exportaciones de tipos
export type {
  GenerationParams,
  SkyboxParams,
  TerrainParams,
  TextureParams,
  NFTParams,
  CompressionParams,
  EditorParams
} from './types';

// Exportaciones de configuración
export { defaultConfig } from './config';

// Versión del sistema
export const VERSION = '1.0.0';

// Información del sistema
export const SYSTEM_INFO = {
  name: '@metaverso/image-generator',
  version: VERSION,
  description: 'Sistema avanzado de generación de imágenes de entorno procedurales para el metaverso 3D descentralizado',
  features: [
    'Generación procedural de skyboxes',
    'Creación de terrenos dinámicos',
    'Texturas procedurales avanzadas',
    'Efectos atmosféricos realistas',
    'Integración Web3 y NFTs',
    'Editor visual en tiempo real',
    'Optimización automática',
    'Exportación múltiples formatos'
  ]
};

/**
 * Inicializa el sistema de generación de imágenes con configuración personalizada
 * @param config - Configuración del sistema
 * @returns Configuración inicializada
 */
export function initializeImageGenerator(config?: Partial<GenerationParams>): GenerationParams {
  return { ...defaultConfig, ...config };
}

/**
 * Crea una configuración por defecto del sistema
 * @returns Configuración por defecto
 */
export function createDefaultConfig(): GenerationParams {
  return { ...defaultConfig };
}

/**
 * Verifica la compatibilidad del sistema
 * @returns Información de compatibilidad
 */
export function checkCompatibility(): {
  supported: boolean;
  features: Record<string, boolean>;
  warnings: string[];
} {
  const features: Record<string, boolean> = {
    threejs: typeof THREE !== 'undefined',
    webgl: typeof WebGLRenderingContext !== 'undefined',
    webgl2: typeof WebGL2RenderingContext !== 'undefined',
    web3: typeof window !== 'undefined' ? 'ethereum' in window : false,
    canvas: typeof HTMLCanvasElement !== 'undefined',
    workers: typeof Worker !== 'undefined'
  };

  const warnings: string[] = [];
  
  if (!features.threejs) {
    warnings.push('Three.js no está disponible - la generación puede no funcionar');
  }
  
  if (!features.webgl && !features.webgl2) {
    warnings.push('WebGL no está disponible - el renderizado puede no funcionar');
  }

  if (!features.webgl2) {
    warnings.push('WebGL 2 no está disponible - algunas características avanzadas pueden no funcionar');
  }

  return {
    supported: Object.values(features).some(Boolean),
    features,
    warnings
  };
}

/**
 * Genera una imagen procedural básica
 * @param params - Parámetros de generación
 * @returns Promise con la imagen generada
 */
export async function generateProceduralImage(params: GenerationParams): Promise<THREE.Texture> {
  const generator = new ProceduralSkyboxGenerator(params);
  const skybox = await generator.generate();
  return skybox.getTexture();
}

/**
 * Crea un NFT de una imagen generada
 * @param params - Parámetros del NFT
 * @returns Promise con el NFT creado
 */
export async function createImageNFT(params: NFTParams): Promise<any> {
  const nftCreator = new NFTImageCreator();
  return await nftCreator.createNFT(params);
}

/**
 * Verifica la autenticidad de una imagen
 * @param imageHash - Hash de la imagen
 * @param metadata - Metadata de la imagen
 * @returns Promise con el resultado de verificación
 */
export async function verifyImageAuthenticity(imageHash: string, metadata: any): Promise<boolean> {
  const verifier = new AuthenticityVerifier();
  return await verifier.verifyImage(imageHash, metadata);
}

// Exportación por defecto
export default {
  // Generators
  ProceduralSkyboxGenerator,
  TerrainGenerator,
  TextureGenerator,
  AtmosphereGenerator,
  CloudGenerator,
  StarFieldGenerator,
  AuroraGenerator,
  
  // Shaders
  SkyboxShader,
  TerrainShader,
  AtmosphereShader,
  CloudShader,
  NoiseShader,
  
  // Web3
  NFTImageCreator,
  ImageMarketplace,
  AuthenticityVerifier,
  MetadataManager,
  
  // Utils
  NoiseGenerator,
  ColorPalette,
  ImageProcessor,
  CompressionManager,
  LODManager,
  
  // Editor
  VisualEditor,
  ParameterController,
  RealTimePreview,
  
  // Functions
  initializeImageGenerator,
  createDefaultConfig,
  checkCompatibility,
  generateProceduralImage,
  createImageNFT,
  verifyImageAuthenticity,
  VERSION,
  SYSTEM_INFO
}; 