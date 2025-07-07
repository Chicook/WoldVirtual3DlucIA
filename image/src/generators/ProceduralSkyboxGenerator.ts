/**
 * @fileoverview Generador de skyboxes procedurales con efectos atmosféricos avanzados
 * @module @metaverso/image-generator/generators/ProceduralSkyboxGenerator
 */

import * as THREE from 'three';
import { SkyboxParams, SkyboxResult, SkyboxMetadata } from '../types';
import { NoiseGenerator } from '../utils/NoiseGenerator';
import { ColorPalette } from '../utils/ColorPalette';

/**
 * Generador de skyboxes procedurales
 */
export class ProceduralSkyboxGenerator {
  private params: SkyboxParams;
  private noiseGenerator: NoiseGenerator;
  private colorPalette: ColorPalette;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private material: THREE.ShaderMaterial;

  /**
   * Constructor del generador
   * @param params - Parámetros de generación
   */
  constructor(params: SkyboxParams) {
    this.params = this._validateParams(params);
    this.noiseGenerator = new NoiseGenerator();
    this.colorPalette = new ColorPalette();
    
    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: document.createElement('canvas'),
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.params.resolution, this.params.resolution);
    
    // Configurar escena
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
    
    // Configurar material con shader personalizado
    this.material = new THREE.ShaderMaterial({
      uniforms: this._createUniforms(),
      vertexShader: this._getVertexShader(),
      fragmentShader: this._getFragmentShader(),
      side: THREE.BackSide
    });
    
    this._setupScene();
  }

  /**
   * Generar skybox
   */
  public async generate(): Promise<SkyboxResult> {
    const startTime = performance.now();
    
    // Actualizar uniformes
    this._updateUniforms();
    
    // Renderizar skybox
    const texture = await this._renderSkybox();
    
    // Crear cubemap
    const cubemap = this._createCubemap(texture);
    
    // Crear equirectangular
    const equirectangular = this._createEquirectangular(cubemap);
    
    const generationTime = performance.now() - startTime;
    
    // Crear metadata
    const metadata: SkyboxMetadata = {
      type: this.params.type,
      resolution: `${this.params.resolution}x${this.params.resolution}`,
      generationTime,
      fileSize: this._calculateFileSize(texture),
      imageHash: await this._calculateHash(texture),
      generationParams: this.params
    };
    
    return {
      texture,
      cubemap,
      equirectangular,
      metadata,
      parameters: this.params
    };
  }

  /**
   * Obtener textura del skybox
   */
  public getTexture(): THREE.Texture {
    return this.material.uniforms.skyboxTexture.value;
  }

  /**
   * Actualizar parámetros
   */
  public updateParams(params: Partial<SkyboxParams>): void {
    this.params = { ...this.params, ...params };
    this._updateUniforms();
  }

  /**
   * Validar parámetros
   */
  private _validateParams(params: SkyboxParams): SkyboxParams {
    return {
      resolution: Math.max(256, Math.min(8192, params.resolution)),
      quality: params.quality || 'high',
      algorithm: params.algorithm || 'simplex',
      octaves: Math.max(1, Math.min(8, params.octaves || 4)),
      persistence: Math.max(0, Math.min(1, params.persistence || 0.5)),
      lacunarity: Math.max(1, Math.min(4, params.lacunarity || 2)),
      seed: params.seed || Math.random() * 1000000,
      colorPalette: params.colorPalette,
      contrast: Math.max(0, Math.min(2, params.contrast || 1)),
      saturation: Math.max(0, Math.min(2, params.saturation || 1)),
      brightness: Math.max(0, Math.min(2, params.brightness || 1)),
      effects: {
        atmosphere: params.effects?.atmosphere ?? true,
        volumetricClouds: params.effects?.volumetricClouds ?? false,
        fog: params.effects?.fog ?? false,
        rain: params.effects?.rain ?? false,
        snow: params.effects?.snow ?? false,
        dust: params.effects?.dust ?? false,
        smoke: params.effects?.smoke ?? false,
        particles: params.effects?.particles ?? false,
        postProcessing: params.effects?.postProcessing ?? true,
        bloom: params.effects?.bloom ?? false,
        ssao: params.effects?.ssao ?? false,
        motionBlur: params.effects?.motionBlur ?? false
      },
      type: params.type || 'day',
      atmosphere: params.atmosphere ?? true,
      clouds: params.clouds ?? true,
      stars: params.stars ?? false,
      aurora: params.aurora ?? false,
      lightning: params.lightning ?? false,
      sunDirection: params.sunDirection || new THREE.Vector3(0, 1, 0),
      sunColor: params.sunColor || new THREE.Color(0xffff00),
      skyTopColor: params.skyTopColor || new THREE.Color(0x87ceeb),
      skyBottomColor: params.skyBottomColor || new THREE.Color(0x4169e1),
      scatteringIntensity: Math.max(0, Math.min(2, params.scatteringIntensity || 1)),
      atmosphereHeight: Math.max(0, Math.min(100, params.atmosphereHeight || 10))
    };
  }

  /**
   * Configurar escena
   */
  private _setupScene(): void {
    // Crear geometría de skybox
    const geometry = new THREE.SphereGeometry(500, 64, 64);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);
    
    // Configurar cámara
    this.camera.position.set(0, 0, 0);
  }

  /**
   * Crear uniformes del shader
   */
  private _createUniforms(): THREE.ShaderMaterialParameters['uniforms'] {
    return {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(this.params.resolution, this.params.resolution) },
      sunDirection: { value: this.params.sunDirection },
      sunColor: { value: this.params.sunColor },
      skyTopColor: { value: this.params.skyTopColor },
      skyBottomColor: { value: this.params.skyBottomColor },
      scatteringIntensity: { value: this.params.scatteringIntensity },
      atmosphereHeight: { value: this.params.atmosphereHeight },
      cloudTexture: { value: null },
      starTexture: { value: null },
      auroraTexture: { value: null },
      noiseTexture: { value: null },
      contrast: { value: this.params.contrast },
      saturation: { value: this.params.saturation },
      brightness: { value: this.params.brightness },
      skyboxTexture: { value: null }
    };
  }

  /**
   * Actualizar uniformes
   */
  private _updateUniforms(): void {
    this.material.uniforms.time.value = performance.now() * 0.001;
    this.material.uniforms.sunDirection.value = this.params.sunDirection;
    this.material.uniforms.sunColor.value = this.params.sunColor;
    this.material.uniforms.skyTopColor.value = this.params.skyTopColor;
    this.material.uniforms.skyBottomColor.value = this.params.skyBottomColor;
    this.material.uniforms.scatteringIntensity.value = this.params.scatteringIntensity;
    this.material.uniforms.atmosphereHeight.value = this.params.atmosphereHeight;
    this.material.uniforms.contrast.value = this.params.contrast;
    this.material.uniforms.saturation.value = this.params.saturation;
    this.material.uniforms.brightness.value = this.params.brightness;
    
    // Generar texturas adicionales
    if (this.params.clouds) {
      this.material.uniforms.cloudTexture.value = this._generateCloudTexture();
    }
    
    if (this.params.stars) {
      this.material.uniforms.starTexture.value = this._generateStarTexture();
    }
    
    if (this.params.aurora) {
      this.material.uniforms.auroraTexture.value = this._generateAuroraTexture();
    }
    
    this.material.uniforms.noiseTexture.value = this._generateNoiseTexture();
  }

  /**
   * Renderizar skybox
   */
  private async _renderSkybox(): Promise<THREE.Texture> {
    // Renderizar a textura
    const renderTarget = new THREE.WebGLRenderTarget(
      this.params.resolution,
      this.params.resolution,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        generateMipmaps: false
      }
    );
    
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    
    const texture = renderTarget.texture;
    texture.flipY = false;
    
    return texture;
  }

  /**
   * Crear cubemap
   */
  private _createCubemap(texture: THREE.Texture): THREE.CubeTexture {
    // Convertir textura esférica a cubemap
    const cubeTexture = new THREE.CubeTexture();
    cubeTexture.format = THREE.RGBAFormat;
    cubeTexture.type = THREE.FloatType;
    
    // Renderizar las 6 caras del cubo
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, this.params.resolution);
    
    for (let i = 0; i < 6; i++) {
      cubeCamera.update(this.renderer, this.scene);
      cubeTexture.images[i] = cubeCamera.renderTarget.texture;
    }
    
    cubeTexture.needsUpdate = true;
    return cubeTexture;
  }

  /**
   * Crear equirectangular
   */
  private _createEquirectangular(cubemap: THREE.CubeTexture): THREE.Texture {
    // Convertir cubemap a equirectangular
    const equirectangularShader = {
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform samplerCube cubemap;
        varying vec2 vUv;
        
        vec3 directionFromEquirectangular(vec2 uv) {
          float phi = uv.x * 2.0 * PI;
          float theta = uv.y * PI;
          return vec3(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));
        }
        
        void main() {
          vec3 direction = directionFromEquirectangular(vUv);
          gl_FragColor = textureCube(cubemap, direction);
        }
      `
    };
    
    const material = new THREE.ShaderMaterial({
      uniforms: { cubemap: { value: cubemap } },
      vertexShader: equirectangularShader.vertexShader,
      fragmentShader: equirectangularShader.fragmentShader
    });
    
    const geometry = new THREE.PlaneGeometry(2, 1);
    const mesh = new THREE.Mesh(geometry, material);
    
    const renderTarget = new THREE.WebGLRenderTarget(
      this.params.resolution * 2,
      this.params.resolution,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType
      }
    );
    
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.render(mesh, new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0, 1));
    this.renderer.setRenderTarget(null);
    
    return renderTarget.texture;
  }

  /**
   * Generar textura de nubes
   */
  private _generateCloudTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % 512;
      const y = Math.floor((i / 4) / 512);
      
      const noise = this.noiseGenerator.simplex2(x * 0.01, y * 0.01);
      const cloud = Math.max(0, noise * 0.5 + 0.5);
      
      data[i] = cloud * 255;     // R
      data[i + 1] = cloud * 255; // G
      data[i + 2] = cloud * 255; // B
      data[i + 3] = 255;         // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    
    return texture;
  }

  /**
   * Generar textura de estrellas
   */
  private _generateStarTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Generar estrellas aleatorias
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = Math.random() * 2 + 0.5;
      const brightness = Math.random() * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  /**
   * Generar textura de aurora
   */
  private _generateAuroraTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % 512;
      const y = Math.floor((i / 4) / 512);
      
      const noise1 = this.noiseGenerator.simplex2(x * 0.02, y * 0.02);
      const noise2 = this.noiseGenerator.simplex2(x * 0.01, y * 0.01);
      const aurora = Math.max(0, (noise1 + noise2) * 0.5);
      
      // Colores de aurora (verde-azul)
      data[i] = 0;                    // R
      data[i + 1] = aurora * 255;     // G
      data[i + 2] = aurora * 200;     // B
      data[i + 3] = aurora * 255;     // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  /**
   * Generar textura de ruido
   */
  private _generateNoiseTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % 256;
      const y = Math.floor((i / 4) / 256);
      
      const noise = this.noiseGenerator.simplex2(x * 0.1, y * 0.1);
      const value = (noise + 1) * 0.5;
      
      data[i] = value * 255;     // R
      data[i + 1] = value * 255; // G
      data[i + 2] = value * 255; // B
      data[i + 3] = 255;         // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  /**
   * Obtener vertex shader
   */
  private _getVertexShader(): string {
    return `
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      void main() {
        vWorldPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  /**
   * Obtener fragment shader
   */
  private _getFragmentShader(): string {
    return `
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 sunDirection;
      uniform vec3 sunColor;
      uniform vec3 skyTopColor;
      uniform vec3 skyBottomColor;
      uniform float scatteringIntensity;
      uniform float atmosphereHeight;
      uniform sampler2D cloudTexture;
      uniform sampler2D starTexture;
      uniform sampler2D auroraTexture;
      uniform sampler2D noiseTexture;
      uniform float contrast;
      uniform float saturation;
      uniform float brightness;
      
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      const float PI = 3.14159265359;
      
      // Función de ruido
      float noise(vec2 p) {
        return texture2D(noiseTexture, p * 0.1).r;
      }
      
      // Función de ruido fractal
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      // Scattering de Rayleigh
      vec3 rayleighScattering(vec3 viewDir, vec3 sunDir) {
        float cosTheta = dot(viewDir, sunDir);
        float rayleigh = 1.0 + cosTheta * cosTheta;
        return vec3(0.5, 0.7, 1.0) * rayleigh * scatteringIntensity;
      }
      
      // Función principal
      void main() {
        vec3 worldPos = normalize(vWorldPosition);
        vec3 skyColor = mix(skyBottomColor, skyTopColor, worldPos.y);
        
        // Scattering atmosférico
        vec3 scattering = rayleighScattering(worldPos, sunDirection);
        skyColor += scattering;
        
        // Sol
        float sunDot = dot(worldPos, sunDirection);
        float sunIntensity = pow(max(sunDot, 0.0), 256.0);
        skyColor += sunColor * sunIntensity;
        
        // Nubes
        if (sunDirection.y > 0.0) {
          vec2 cloudUV = vec2(atan(worldPos.x, worldPos.z) / (2.0 * PI) + 0.5, asin(worldPos.y) / PI + 0.5);
          float clouds = texture2D(cloudTexture, cloudUV + time * 0.01).r;
          skyColor = mix(skyColor, vec3(1.0), clouds * 0.3);
        }
        
        // Estrellas (solo de noche)
        if (sunDirection.y < 0.0) {
          vec2 starUV = vec2(atan(worldPos.x, worldPos.z) / (2.0 * PI) + 0.5, asin(worldPos.y) / PI + 0.5);
          float stars = texture2D(starTexture, starUV).r;
          skyColor += vec3(1.0) * stars * 0.5;
        }
        
        // Aurora (solo en ciertas condiciones)
        if (abs(worldPos.y) < 0.3) {
          vec2 auroraUV = vec2(atan(worldPos.x, worldPos.z) / (2.0 * PI) + 0.5, asin(worldPos.y) / PI + 0.5);
          float aurora = texture2D(auroraTexture, auroraUV + time * 0.005).r;
          skyColor += vec3(0.0, 0.5, 0.3) * aurora * 0.3;
        }
        
        // Post-procesamiento
        // Contraste
        skyColor = (skyColor - 0.5) * contrast + 0.5;
        
        // Saturación
        float luminance = dot(skyColor, vec3(0.299, 0.587, 0.114));
        skyColor = mix(vec3(luminance), skyColor, saturation);
        
        // Brillo
        skyColor *= brightness;
        
        // Clamp
        skyColor = clamp(skyColor, 0.0, 1.0);
        
        gl_FragColor = vec4(skyColor, 1.0);
      }
    `;
  }

  /**
   * Calcular tamaño del archivo
   */
  private _calculateFileSize(texture: THREE.Texture): number {
    const width = texture.image?.width || this.params.resolution;
    const height = texture.image?.height || this.params.resolution;
    return width * height * 4; // 4 bytes por pixel (RGBA)
  }

  /**
   * Calcular hash de la imagen
   */
  private async _calculateHash(texture: THREE.Texture): Promise<string> {
    // Implementación simple de hash
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Renderizar textura a canvas
    const imageData = ctx.createImageData(64, 64);
    // ... implementar renderizado de textura a imageData
    
    // Calcular hash simple
    let hash = 0;
    for (let i = 0; i < imageData.data.length; i++) {
      hash = ((hash << 5) - hash) + imageData.data[i];
      hash = hash & hash; // Convertir a 32-bit
    }
    
    return hash.toString(16);
  }
} 