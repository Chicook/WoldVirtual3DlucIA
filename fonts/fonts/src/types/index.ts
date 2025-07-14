/**
 * @fileoverview Tipos principales del sistema de fuentes del metaverso
 * @module @metaverso/fonts/types
 */

// Tipos básicos de fuentes
export interface FontStyle {
  name: string;
  weight: number;
  italic: boolean;
  stretch: number;
}

export interface FontVariant {
  name: string;
  style: FontStyle;
  filePath?: string;
  data?: ArrayBuffer;
  hash?: string;
}

export interface FontFamily {
  name: string;
  variants: FontVariant[];
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  license: string;
  author?: string;
  version?: string;
  languages: string[];
  metadata?: Record<string, any>;
}

// Configuraciones del sistema
export interface FontConfig {
  name: string;
  family: string;
  style: string;
  size: number;
  color: string;
  antialiasing: boolean;
  hinting: boolean;
  kerning: boolean;
  ligatures: boolean;
}

export interface FontSystemConfig {
  ipfs: IPFSConfig;
  cache: CacheConfig;
  optimization: OptimizationConfig;
  rendering: RenderingConfig;
  accessibility: AccessibilityConfig;
  security: SecurityConfig;
}

export interface IPFSConfig {
  enabled: boolean;
  gateway: string;
  timeout: number;
  retries: number;
  pinning: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
  persistence: boolean;
}

export interface OptimizationConfig {
  enabled: boolean;
  compression: 'woff2' | 'woff' | 'ttf';
  subsetting: boolean;
  quality: 'low' | 'medium' | 'high';
  hinting: boolean;
  kerning: boolean;
}

export interface RenderingConfig {
  antialiasing: boolean;
  hinting: boolean;
  kerning: boolean;
  ligatures: boolean;
  subpixel: boolean;
  gamma: number;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  dyslexia: boolean;
  screenReader: boolean;
  fontSize: number;
  lineHeight: number;
}

export interface SecurityConfig {
  verification: boolean;
  integrity: boolean;
  license: boolean;
  sandbox: boolean;
}

// Opciones de carga y renderizado
export interface FontLoadOptions {
  size?: number;
  color?: string;
  antialiasing?: boolean;
  hinting?: boolean;
  kerning?: boolean;
  ligatures?: boolean;
  languages?: string[];
  subset?: string;
}

export interface FontRenderOptions {
  text: string;
  font: string;
  style: string;
  size: number;
  color: string;
  position: [number, number, number];
  effects?: FontEffects;
  animation?: FontAnimation;
}

export interface FontEffects {
  glow?: boolean;
  shadow?: boolean;
  outline?: boolean;
  gradient?: boolean;
  texture?: string;
}

export interface FontAnimation {
  type: 'fade-in' | 'slide-in' | 'bounce' | 'pulse' | 'wave';
  duration: number;
  easing: string;
  delay?: number;
}

export interface FontOptimizationOptions {
  characters: string;
  quality: 'low' | 'medium' | 'high';
  format: 'woff2' | 'woff' | 'ttf';
  subsetting: boolean;
  hinting: boolean;
  kerning: boolean;
}

// Tipos de eventos
export interface FontEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface FontLoadEvent extends FontEvent {
  type: 'font:load';
  data: {
    family: string;
    style: string;
    success: boolean;
    error?: string;
  };
}

export interface FontRenderEvent extends FontEvent {
  type: 'font:render';
  data: {
    text: string;
    font: string;
    performance: number;
  };
}

// Tipos de métricas
export interface FontMetrics {
  family: string;
  style: string;
  size: number;
  ascent: number;
  descent: number;
  lineHeight: number;
  xHeight: number;
  capHeight: number;
  baseline: number;
}

export interface FontPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  compressionRatio: number;
}

// Tipos de seguridad
export interface FontVerificationResult {
  valid: boolean;
  hash: string;
  signature?: string;
  license?: string;
  warnings: string[];
}

export interface FontLicense {
  type: string;
  url: string;
  allowed: string[];
  restricted: string[];
  attribution?: string;
}

// Tipos de cache
export interface FontCacheEntry {
  key: string;
  data: ArrayBuffer;
  timestamp: number;
  ttl: number;
  size: number;
  metadata: Record<string, any>;
}

export interface FontCacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
  hitRate: number;
}

// Tipos de IPFS
export interface IPFSFontMetadata {
  cid: string;
  name: string;
  family: string;
  style: string;
  size: number;
  format: string;
  hash: string;
  timestamp: number;
  license: string;
}

export interface IPFSUploadResult {
  cid: string;
  size: number;
  hash: string;
  pinned: boolean;
}

// Tipos de renderizado 3D
export interface Font3DRenderOptions {
  text: string;
  font: string;
  style: string;
  size: number;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material?: FontMaterial;
  effects?: Font3DEffects;
}

export interface FontMaterial {
  type: 'basic' | 'phong' | 'pbr';
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
  emissive: string;
  normalMap?: string;
}

export interface Font3DEffects {
  glow?: {
    color: string;
    intensity: number;
    radius: number;
  };
  shadow?: {
    color: string;
    opacity: number;
    blur: number;
  };
  outline?: {
    color: string;
    width: number;
  };
  animation?: {
    type: string;
    duration: number;
    easing: string;
  };
}

// Tipos de accesibilidad
export interface FontAccessibilityOptions {
  highContrast: boolean;
  dyslexia: boolean;
  screenReader: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
}

export interface FontAccessibilityFeatures {
  supportsHighContrast: boolean;
  supportsDyslexia: boolean;
  supportsScreenReader: boolean;
  supportsVariableFonts: boolean;
  supportsOpenType: boolean;
}

// Tipos de utilidades
export interface FontUtils {
  measureText(text: string, font: FontConfig): TextMetrics;
  validateFont(font: FontFamily): ValidationResult;
  optimizeFont(font: ArrayBuffer, options: FontOptimizationOptions): Promise<ArrayBuffer>;
  generateAtlas(fonts: FontFamily[]): Promise<FontAtlas>;
}

export interface TextMetrics {
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
  xHeight: number;
  capHeight: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface FontAtlas {
  texture: ImageData;
  glyphs: Record<string, GlyphInfo>;
  metadata: FontAtlasMetadata;
}

export interface GlyphInfo {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advance: number;
  bearingX: number;
  bearingY: number;
}

export interface FontAtlasMetadata {
  size: number;
  padding: number;
  format: string;
  compression: string;
  quality: number;
} 