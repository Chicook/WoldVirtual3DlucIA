/**
 * @fileoverview Generador de ruido procedural con múltiples algoritmos
 * @module @metaverso/image-generator/utils/NoiseGenerator
 */

import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise';

/**
 * Configuración del generador de ruido
 */
export interface NoiseConfig {
  seed?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  scale?: number;
  amplitude?: number;
  frequency?: number;
}

/**
 * Generador de ruido procedural
 */
export class NoiseGenerator {
  private noise2D: ReturnType<typeof createNoise2D>;
  private noise3D: ReturnType<typeof createNoise3D>;
  private noise4D: ReturnType<typeof createNoise4D>;
  private seed: number;

  /**
   * Constructor del generador
   * @param seed - Semilla para generación
   */
  constructor(seed?: number) {
    this.seed = seed || Math.random() * 1000000;
    this.noise2D = createNoise2D(() => this.seed);
    this.noise3D = createNoise3D(() => this.seed);
    this.noise4D = createNoise4D(() => this.seed);
  }

  /**
   * Generar ruido Perlin 2D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @returns Valor de ruido entre -1 y 1
   */
  public perlin2(x: number, y: number): number {
    return this.noise2D(x, y);
  }

  /**
   * Generar ruido Perlin 3D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param z - Coordenada Z
   * @returns Valor de ruido entre -1 y 1
   */
  public perlin3(x: number, y: number, z: number): number {
    return this.noise3D(x, y, z);
  }

  /**
   * Generar ruido Perlin 4D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param z - Coordenada Z
   * @param w - Coordenada W
   * @returns Valor de ruido entre -1 y 1
   */
  public perlin4(x: number, y: number, z: number, w: number): number {
    return this.noise4D(x, y, z, w);
  }

  /**
   * Generar ruido Simplex 2D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @returns Valor de ruido entre -1 y 1
   */
  public simplex2(x: number, y: number): number {
    return this.noise2D(x, y);
  }

  /**
   * Generar ruido Simplex 3D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param z - Coordenada Z
   * @returns Valor de ruido entre -1 y 1
   */
  public simplex3(x: number, y: number, z: number): number {
    return this.noise3D(x, y, z);
  }

  /**
   * Generar ruido Worley/Cellular 2D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public worley2(x: number, y: number, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;

    // Implementación simplificada de Worley noise
    const points = this._generateWorleyPoints(nx, ny, 4);
    const distances = points.map(p => Math.sqrt((nx - p.x) ** 2 + (ny - p.y) ** 2));
    
    // Retornar la distancia más cercana
    const minDistance = Math.min(...distances);
    return Math.min(1, minDistance * amplitude);
  }

  /**
   * Generar ruido Worley/Cellular 3D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param z - Coordenada Z
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public worley3(x: number, y: number, z: number, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;
    const nz = z * frequency * scale;

    // Implementación simplificada de Worley noise 3D
    const points = this._generateWorleyPoints3D(nx, ny, nz, 4);
    const distances = points.map(p => 
      Math.sqrt((nx - p.x) ** 2 + (ny - p.y) ** 2 + (nz - p.z) ** 2)
    );
    
    const minDistance = Math.min(...distances);
    return Math.min(1, minDistance * amplitude);
  }

  /**
   * Generar ruido Cellular 2D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public cellular2(x: number, y: number, config: NoiseConfig = {}): number {
    return this.worley2(x, y, config);
  }

  /**
   * Generar ruido fractal 2D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param octaves - Número de octavas
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre -1 y 1
   */
  public fractal2(x: number, y: number, octaves: number = 4, config: NoiseConfig = {}): number {
    const {
      persistence = 0.5,
      lacunarity = 2.0,
      amplitude = 1.0,
      frequency = 1.0
    } = config;

    let value = 0;
    let amplitudeSum = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;

    for (let i = 0; i < octaves; i++) {
      value += this.simplex2(x * currentFrequency, y * currentFrequency) * currentAmplitude;
      amplitudeSum += currentAmplitude;
      currentAmplitude *= persistence;
      currentFrequency *= lacunarity;
    }

    return value / amplitudeSum;
  }

  /**
   * Generar ruido fractal 3D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param z - Coordenada Z
   * @param octaves - Número de octavas
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre -1 y 1
   */
  public fractal3(x: number, y: number, z: number, octaves: number = 4, config: NoiseConfig = {}): number {
    const {
      persistence = 0.5,
      lacunarity = 2.0,
      amplitude = 1.0,
      frequency = 1.0
    } = config;

    let value = 0;
    let amplitudeSum = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;

    for (let i = 0; i < octaves; i++) {
      value += this.simplex3(x * currentFrequency, y * currentFrequency, z * currentFrequency) * currentAmplitude;
      amplitudeSum += currentAmplitude;
      currentAmplitude *= persistence;
      currentFrequency *= lacunarity;
    }

    return value / amplitudeSum;
  }

  /**
   * Generar ruido de turbulencia 2D
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param octaves - Número de octavas
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public turbulence2(x: number, y: number, octaves: number = 4, config: NoiseConfig = {}): number {
    const {
      persistence = 0.5,
      lacunarity = 2.0,
      amplitude = 1.0,
      frequency = 1.0
    } = config;

    let value = 0;
    let amplitudeSum = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;

    for (let i = 0; i < octaves; i++) {
      const noise = this.simplex2(x * currentFrequency, y * currentFrequency);
      value += Math.abs(noise) * currentAmplitude;
      amplitudeSum += currentAmplitude;
      currentAmplitude *= persistence;
      currentFrequency *= lacunarity;
    }

    return value / amplitudeSum;
  }

  /**
   * Generar ruido de mármol
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public marble2(x: number, y: number, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;

    // Generar ruido base
    const noise = this.fractal2(nx, ny, 6, { persistence: 0.5, lacunarity: 2.0 });
    
    // Aplicar función de mármol
    const marble = Math.sin(nx + noise * amplitude);
    
    return (marble + 1) * 0.5; // Normalizar a [0, 1]
  }

  /**
   * Generar ruido de madera
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public wood2(x: number, y: number, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;

    // Generar ruido base
    const noise = this.fractal2(nx, ny, 4, { persistence: 0.5, lacunarity: 2.0 });
    
    // Calcular distancia desde el centro
    const distance = Math.sqrt(nx * nx + ny * ny);
    
    // Aplicar función de madera
    const wood = Math.sin(distance + noise * amplitude);
    
    return (wood + 1) * 0.5; // Normalizar a [0, 1]
  }

  /**
   * Generar ruido de fuego
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param time - Tiempo para animación
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public fire2(x: number, y: number, time: number = 0, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;

    // Generar ruido base
    const noise1 = this.fractal2(nx, ny + time * 0.5, 4, { persistence: 0.5, lacunarity: 2.0 });
    const noise2 = this.fractal2(nx * 2, ny * 2 + time * 0.3, 3, { persistence: 0.6, lacunarity: 1.8 });
    
    // Combinar ruidos
    const fire = (noise1 + noise2) * 0.5 * amplitude;
    
    // Aplicar función de fuego
    const result = Math.max(0, fire - 0.3);
    
    return Math.min(1, result * 2); // Normalizar y ajustar
  }

  /**
   * Generar ruido de humo
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param time - Tiempo para animación
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public smoke2(x: number, y: number, time: number = 0, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;

    // Generar ruido base
    const noise1 = this.fractal2(nx, ny + time * 0.2, 5, { persistence: 0.6, lacunarity: 1.5 });
    const noise2 = this.fractal2(nx * 1.5, ny * 1.5 + time * 0.1, 4, { persistence: 0.7, lacunarity: 1.3 });
    
    // Combinar ruidos
    const smoke = (noise1 + noise2) * 0.5 * amplitude;
    
    // Aplicar función de humo
    const result = Math.max(0, smoke - 0.2);
    
    return Math.min(1, result * 1.5); // Normalizar y ajustar
  }

  /**
   * Generar ruido de agua
   * @param x - Coordenada X
   * @param y - Coordenada Y
   * @param time - Tiempo para animación
   * @param config - Configuración del ruido
   * @returns Valor de ruido entre 0 y 1
   */
  public water2(x: number, y: number, time: number = 0, config: NoiseConfig = {}): number {
    const {
      scale = 1,
      amplitude = 1,
      frequency = 1
    } = config;

    const nx = x * frequency * scale;
    const ny = y * frequency * scale;

    // Generar ruido base
    const noise1 = this.fractal2(nx + time * 0.1, ny, 6, { persistence: 0.4, lacunarity: 2.2 });
    const noise2 = this.fractal2(nx, ny + time * 0.15, 5, { persistence: 0.5, lacunarity: 2.0 });
    
    // Combinar ruidos
    const water = (noise1 + noise2) * 0.5 * amplitude;
    
    // Aplicar función de agua
    const result = Math.sin(water * Math.PI);
    
    return (result + 1) * 0.5; // Normalizar a [0, 1]
  }

  /**
   * Generar puntos para Worley noise
   */
  private _generateWorleyPoints(x: number, y: number, count: number): Array<{x: number, y: number}> {
    const points: Array<{x: number, y: number}> = [];
    
    for (let i = 0; i < count; i++) {
      // Usar ruido para generar puntos pseudo-aleatorios
      const seed = this.seed + i * 1000;
      const noiseGen = createNoise2D(() => seed);
      
      const px = noiseGen(x * 0.1, y * 0.1) * 10;
      const py = noiseGen(x * 0.1 + 100, y * 0.1 + 100) * 10;
      
      points.push({ x: px, y: py });
    }
    
    return points;
  }

  /**
   * Generar puntos para Worley noise 3D
   */
  private _generateWorleyPoints3D(x: number, y: number, z: number, count: number): Array<{x: number, y: number, z: number}> {
    const points: Array<{x: number, y: number, z: number}> = [];
    
    for (let i = 0; i < count; i++) {
      // Usar ruido para generar puntos pseudo-aleatorios
      const seed = this.seed + i * 1000;
      const noiseGen = createNoise3D(() => seed);
      
      const px = noiseGen(x * 0.1, y * 0.1, z * 0.1) * 10;
      const py = noiseGen(x * 0.1 + 100, y * 0.1 + 100, z * 0.1) * 10;
      const pz = noiseGen(x * 0.1, y * 0.1, z * 0.1 + 100) * 10;
      
      points.push({ x: px, y: py, z: pz });
    }
    
    return points;
  }

  /**
   * Cambiar semilla
   * @param seed - Nueva semilla
   */
  public setSeed(seed: number): void {
    this.seed = seed;
    this.noise2D = createNoise2D(() => this.seed);
    this.noise3D = createNoise3D(() => this.seed);
    this.noise4D = createNoise4D(() => this.seed);
  }

  /**
   * Obtener semilla actual
   * @returns Semilla actual
   */
  public getSeed(): number {
    return this.seed;
  }
} 