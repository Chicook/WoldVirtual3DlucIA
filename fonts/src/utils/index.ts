/**
 * @fileoverview Utilidades del sistema de fuentes del metaverso
 * @module @metaverso/fonts/utils
 */

import {
  FontConfig,
  FontOptimizationOptions,
  TextMetrics,
  ValidationResult,
  FontFamily,
  FontAtlas,
  FontAtlasMetadata,
  GlyphInfo
} from '../types';

/**
 * Clase de utilidades para el sistema de fuentes
 */
export class FontUtils {
  /**
   * Mide el texto con una configuración de fuente específica
   */
  measureText(text: string, font: FontConfig): TextMetrics {
    // Implementación básica de medición de texto
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        width: 0,
        height: 0,
        baseline: 0,
        ascent: 0,
        descent: 0,
        xHeight: 0,
        capHeight: 0
      };
    }

    ctx.font = `${font.size}px ${font.family}`;
    const metrics = ctx.measureText(text);
    
    return {
      width: metrics.width,
      height: font.size,
      baseline: font.size * 0.8,
      ascent: font.size * 0.8,
      descent: font.size * 0.2,
      xHeight: font.size * 0.5,
      capHeight: font.size * 0.7
    };
  }

  /**
   * Valida una familia de fuentes
   */
  validateFont(font: FontFamily): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validar nombre
    if (!font.name || font.name.trim().length === 0) {
      errors.push('Font family name is required');
    }

    // Validar variantes
    if (!font.variants || font.variants.length === 0) {
      errors.push('Font family must have at least one variant');
    }

    // Validar categoría
    const validCategories = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
    if (!validCategories.includes(font.category)) {
      errors.push(`Invalid font category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validar licencia
    if (!font.license || font.license.trim().length === 0) {
      warnings.push('Font license is not specified');
    }

    // Validar idiomas
    if (!font.languages || font.languages.length === 0) {
      warnings.push('No languages specified for font family');
    }

    // Sugerencias
    if (!font.author) {
      suggestions.push('Consider adding font author information');
    }

    if (!font.version) {
      suggestions.push('Consider adding font version information');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Optimiza una fuente según las opciones especificadas
   */
  async optimizeFont(font: ArrayBuffer, options: FontOptimizationOptions): Promise<ArrayBuffer> {
    // Implementación básica de optimización
    // En una implementación real, aquí se usarían librerías como opentype.js
    
    // Por ahora, retornamos el buffer original
    return font;
  }

  /**
   * Genera un atlas de fuentes
   */
  async generateAtlas(fonts: FontFamily[]): Promise<FontAtlas> {
    // Implementación básica de generación de atlas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot create canvas context');
    }

    const glyphs: Record<string, GlyphInfo> = {};
    let x = 0;
    let y = 0;
    const lineHeight = 32;

    // Generar glifos básicos
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:()[]{}"\'-_+=@#$%^&*~`|\\/<>';
    
    for (const char of characters) {
      if (x + 32 > canvas.width) {
        x = 0;
        y += lineHeight;
      }

      ctx.font = '24px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText(char, x, y + 24);

      glyphs[char] = {
        char,
        x,
        y,
        width: 24,
        height: 24,
        advance: 24,
        bearingX: 0,
        bearingY: 0
      };

      x += 32;
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const metadata: FontAtlasMetadata = {
      size: 1024,
      padding: 4,
      format: 'rgba',
      compression: 'none',
      quality: 1.0
    };

    return {
      texture: imageData,
      glyphs,
      metadata
    };
  }

  /**
   * Convierte un color hexadecimal a RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convierte RGB a color hexadecimal
   */
  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Calcula el contraste entre dos colores
   */
  calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const luminance1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Calcula la luminancia de un color
   */
  private calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Genera un hash simple para una fuente
   */
  generateFontHash(fontData: ArrayBuffer): string {
    let hash = 0;
    const bytes = new Uint8Array(fontData);
    
    for (let i = 0; i < bytes.length; i++) {
      const char = bytes[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  /**
   * Comprime datos usando un algoritmo simple
   */
  async compress(data: ArrayBuffer): Promise<ArrayBuffer> {
    // Implementación básica de compresión
    // En una implementación real, se usaría una librería de compresión
    return data;
  }

  /**
   * Descomprime datos
   */
  async decompress(data: ArrayBuffer): Promise<ArrayBuffer> {
    // Implementación básica de descompresión
    return data;
  }
} 