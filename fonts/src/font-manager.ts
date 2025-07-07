/**
 * @fileoverview Gestor principal de fuentes del metaverso
 * @module @metaverso/fonts/font-manager
 */

import { EventEmitter } from 'events';
import {
  FontFamily,
  FontVariant,
  FontConfig,
  FontSystemConfig,
  FontLoadOptions,
  FontRenderOptions,
  FontEvent,
  FontLoadEvent,
  FontRenderEvent,
  FontPerformanceMetrics
} from './types';
import { FontCache } from './cache';
import { FontOptimizer } from './optimization';
import { IPFSFontStorage } from './ipfs';
import { FontVerifier } from './security';
import { FontAccessibility } from './accessibility';
import { FontRenderer3D } from './3d';
import { FontUtils } from './utils';
import { defaultConfig } from './config';

/**
 * Gestor principal de fuentes del metaverso
 * Maneja la carga, cache, optimización y renderizado de fuentes
 */
export class FontManager extends EventEmitter {
  private families: Map<string, FontFamily> = new Map();
  private loadedFonts: Map<string, FontConfig> = new Map();
  private cache: FontCache;
  private optimizer: FontOptimizer;
  private ipfsStorage: IPFSFontStorage;
  private verifier: FontVerifier;
  private accessibility: FontAccessibility;
  private renderer3D: FontRenderer3D;
  private utils: FontUtils;
  private config: FontSystemConfig;
  private metrics: FontPerformanceMetrics;
  private initialized: boolean = false;

  constructor(config?: Partial<FontSystemConfig>) {
    super();
    this.config = { ...defaultConfig, ...config };
    this.metrics = this.initializeMetrics();
    
    // Inicializar componentes
    this.cache = new FontCache(this.config.cache);
    this.optimizer = new FontOptimizer(this.config.optimization);
    this.ipfsStorage = new IPFSFontStorage(this.config.ipfs);
    this.verifier = new FontVerifier(this.config.security);
    this.accessibility = new FontAccessibility(this.config.accessibility);
    this.renderer3D = new FontRenderer3D();
    this.utils = new FontUtils();
  }

  /**
   * Inicializa el sistema de fuentes
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Inicializar componentes
      await this.cache.initialize();
      await this.optimizer.initialize();
      await this.ipfsStorage.initialize();
      await this.verifier.initialize();
      await this.accessibility.initialize();
      await this.renderer3D.initialize();

      // Cargar fuentes del sistema
      await this.loadSystemFonts();

      this.initialized = true;
      this.emit('initialized', { timestamp: Date.now() });
    } catch (error) {
      this.emit('error', { error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Registra una familia de fuentes
   */
  async registerFamily(family: FontFamily): Promise<void> {
    const startTime = performance.now();

    try {
      // Verificar integridad de la fuente
      if (this.config.security.verification) {
        const verification = await this.verifier.verifyFont(family);
        if (!verification.valid) {
          throw new Error(`Font verification failed: ${verification.warnings.join(', ')}`);
        }
      }

      // Optimizar fuentes si está habilitado
      if (this.config.optimization.enabled) {
        for (const variant of family.variants) {
          if (variant.data) {
            variant.data = await this.optimizer.optimize(variant.data, {
              characters: this.getCommonCharacters(),
              quality: this.config.optimization.quality,
              format: this.config.optimization.compression,
              subsetting: this.config.optimization.subsetting,
              hinting: this.config.optimization.hinting,
              kerning: this.config.optimization.kerning
            });
          }
        }
      }

      // Almacenar en IPFS si está habilitado
      if (this.config.ipfs.enabled) {
        for (const variant of family.variants) {
          if (variant.data) {
            const result = await this.ipfsStorage.uploadFont(variant.data, {
              name: variant.name,
              family: family.name,
              style: variant.style.name,
              license: family.license
            });
            variant.hash = result.cid;
          }
        }
      }

      // Registrar en el sistema
      this.families.set(family.name, family);

      // Emitir evento
      const loadEvent: FontLoadEvent = {
        type: 'font:load',
        timestamp: Date.now(),
        data: {
          family: family.name,
          style: 'all',
          success: true
        }
      };
      this.emit('font:load', loadEvent);

      // Actualizar métricas
      this.updateMetrics('loadTime', performance.now() - startTime);

    } catch (error) {
      const loadEvent: FontLoadEvent = {
        type: 'font:load',
        timestamp: Date.now(),
        data: {
          family: family.name,
          style: 'all',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      this.emit('font:load', loadEvent);
      throw error;
    }
  }

  /**
   * Carga una fuente específica
   */
  async loadFont(
    familyName: string,
    styleName: string,
    options: FontLoadOptions = {}
  ): Promise<FontConfig> {
    const cacheKey = `${familyName}:${styleName}:${JSON.stringify(options)}`;
    
    // Verificar cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.updateMetrics('cacheHitRate', 1);
      return cached as FontConfig;
    }

    const startTime = performance.now();

    try {
      const family = this.families.get(familyName);
      if (!family) {
        throw new Error(`Font family '${familyName}' not found`);
      }

      const variant = family.variants.find(v => v.name === styleName);
      if (!variant) {
        throw new Error(`Font style '${styleName}' not found in family '${familyName}'`);
      }

      // Cargar datos de la fuente si no están en memoria
      if (!variant.data && variant.filePath) {
        variant.data = await this.loadFontData(variant.filePath);
      }

      if (!variant.data) {
        throw new Error(`Font data not available for '${familyName}:${styleName}'`);
      }

      // Crear configuración de fuente
      const fontConfig: FontConfig = {
        name: `${familyName}-${styleName}`,
        family: familyName,
        style: styleName,
        size: options.size || 16,
        color: '#000000',
        antialiasing: options.antialiasing ?? this.config.rendering.antialiasing,
        hinting: options.hinting ?? this.config.rendering.hinting,
        kerning: options.kerning ?? this.config.rendering.kerning,
        ligatures: options.ligatures ?? this.config.rendering.ligatures
      };

      // Aplicar configuraciones de accesibilidad
      if (this.config.accessibility.highContrast) {
        fontConfig.color = this.accessibility.getHighContrastColor(fontConfig.color);
      }

      // Almacenar en cache
      await this.cache.set(cacheKey, fontConfig);
      this.loadedFonts.set(cacheKey, fontConfig);

      // Emitir evento
      const loadEvent: FontLoadEvent = {
        type: 'font:load',
        timestamp: Date.now(),
        data: {
          family: familyName,
          style: styleName,
          success: true
        }
      };
      this.emit('font:load', loadEvent);

      // Actualizar métricas
      this.updateMetrics('loadTime', performance.now() - startTime);

      return fontConfig;

    } catch (error) {
      const loadEvent: FontLoadEvent = {
        type: 'font:load',
        timestamp: Date.now(),
        data: {
          family: familyName,
          style: styleName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      this.emit('font:load', loadEvent);
      throw error;
    }
  }

  /**
   * Renderiza texto en 3D
   */
  async renderText3D(options: FontRenderOptions): Promise<any> {
    const startTime = performance.now();

    try {
      // Cargar fuente si no está cargada
      const font = await this.loadFont(options.font, options.style);

      // Renderizar texto 3D
      const result = await this.renderer3D.renderText({
        text: options.text,
        font: font.name,
        style: font.style,
        size: font.size,
        color: font.color,
        position: options.position,
        material: {
          type: 'basic',
          color: font.color,
          opacity: 1.0,
          metalness: 0.0,
          roughness: 1.0,
          emissive: '#000000'
        },
        effects: {
          glow: options.effects?.glow,
          shadow: options.effects?.shadow,
          outline: options.effects?.outline,
          animation: options.animation
        }
      });

      // Emitir evento
      const renderEvent: FontRenderEvent = {
        type: 'font:render',
        timestamp: Date.now(),
        data: {
          text: options.text,
          font: font.name,
          performance: performance.now() - startTime
        }
      };
      this.emit('font:render', renderEvent);

      // Actualizar métricas
      this.updateMetrics('renderTime', performance.now() - startTime);

      return result;

    } catch (error) {
      this.emit('error', { error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Obtiene métricas de rendimiento
   */
  getPerformanceMetrics(): FontPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtiene estadísticas del cache
   */
  async getCacheStats(): Promise<any> {
    return this.cache.getStats();
  }

  /**
   * Limpia el cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Obtiene todas las familias de fuentes registradas
   */
  getRegisteredFamilies(): FontFamily[] {
    return Array.from(this.families.values());
  }

  /**
   * Obtiene una familia de fuentes específica
   */
  getFamily(name: string): FontFamily | undefined {
    return this.families.get(name);
  }

  /**
   * Verifica si una fuente está disponible
   */
  isFontAvailable(familyName: string, styleName?: string): boolean {
    const family = this.families.get(familyName);
    if (!family) return false;
    
    if (styleName) {
      return family.variants.some(v => v.name === styleName);
    }
    
    return true;
  }

  /**
   * Destruye el gestor de fuentes
   */
  async destroy(): Promise<void> {
    this.initialized = false;
    
    await this.cache.destroy();
    await this.optimizer.destroy();
    await this.ipfsStorage.destroy();
    await this.verifier.destroy();
    await this.accessibility.destroy();
    await this.renderer3D.destroy();
    
    this.families.clear();
    this.loadedFonts.clear();
    this.removeAllListeners();
  }

  // Métodos privados

  private initializeMetrics(): FontPerformanceMetrics {
    return {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      compressionRatio: 0
    };
  }

  private updateMetrics(key: keyof FontPerformanceMetrics, value: number): void {
    this.metrics[key] = value;
  }

  private async loadFontData(filePath: string): Promise<ArrayBuffer> {
    // Implementar carga de archivos de fuentes
    // Por ahora retornamos un buffer vacío
    return new ArrayBuffer(0);
  }

  private getCommonCharacters(): string {
    return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:()[]{}"\'-_+=@#$%^&*~`|\\/<>';
  }

  private async loadSystemFonts(): Promise<void> {
    // Cargar fuentes del sistema por defecto
    const systemFonts: FontFamily[] = [
      {
        name: 'Arial',
        variants: [
          {
            name: 'regular',
            style: { name: 'regular', weight: 400, italic: false, stretch: 100 }
          },
          {
            name: 'bold',
            style: { name: 'bold', weight: 700, italic: false, stretch: 100 }
          }
        ],
        category: 'sans-serif',
        license: 'Commercial',
        languages: ['en']
      }
    ];

    for (const font of systemFonts) {
      await this.registerFamily(font);
    }
  }
} 