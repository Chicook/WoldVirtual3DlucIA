/**
 * Material - PBR Material System
 * 
 * Advanced PBR (Physically Based Rendering) material system with
 * textures, shaders, and material properties for realistic rendering.
 */

import { Vector3 } from '../scene/math/Vector3';
import { Matrix4 } from '../scene/math/Matrix4';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

// Material events
export interface MaterialEvents {
  'property:changed': { material: Material; property: string; value: any };
  'texture:changed': { material: Material; textureType: string; texture: WebGLTexture | null };
  'shader:changed': { material: Material; shaderId: string };
  'compiled': { material: Material };
  'disposed': { material: Material };
}

// Material types
export enum MaterialType {
  STANDARD = 'standard',
  PBR = 'pbr',
  UNLIT = 'unlit',
  CUSTOM = 'custom'
}

// Texture types
export type TextureType = 'albedo' | 'normal' | 'metallicRoughness' | 'emissive' | 'occlusion' | 'height';

/**
 * Tipos de blending soportados
 */
export enum BlendMode {
  NORMAL = 'normal',
  ADDITIVE = 'additive',
  MULTIPLY = 'multiply',
  CUSTOM = 'custom'
}

/**
 * Configuración de textura
 */
export interface TextureConfig {
  url?: string;
  data?: ImageData | HTMLImageElement | HTMLCanvasElement;
  wrapS?: number; // GL_REPEAT, GL_CLAMP_TO_EDGE, etc.
  wrapT?: number;
  minFilter?: number; // GL_LINEAR, GL_NEAREST, etc.
  magFilter?: number;
  generateMipmaps?: boolean;
  flipY?: boolean;
  premultiplyAlpha?: boolean;
}

/**
 * Propiedades PBR del material
 */
export interface PBRProperties {
  albedo: Vector3;
  metallic: number;
  roughness: number;
  ao: number;
  emissive: Vector3;
  normalScale: number;
  occlusionStrength: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  attenuationDistance: number;
  attenuationColor: Vector3;
}

/**
 * Material enterprise con soporte PBR, texturas y shaders avanzados
 */
export class Material extends EventEmitter<MaterialEvents> {
  private static readonly logger = new Logger('Material');
  
  // Propiedades básicas
  public readonly id: string;
  public name: string;

  // Material type
  public type: MaterialType = MaterialType.STANDARD;
  public shaderId: string = 'pbr';

  // PBR Properties
  public pbr: PBRProperties = {
    albedo: new Vector3(1, 1, 1),
    metallic: 0.0,
    roughness: 0.5,
    ao: 1.0,
    emissive: new Vector3(0, 0, 0),
    normalScale: 1.0,
    occlusionStrength: 1.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    transmission: 0.0,
    thickness: 0.0,
    attenuationDistance: 1.0,
    attenuationColor: new Vector3(1, 1, 1)
  };

  // Textures
  public textures: Map<string, WebGLTexture | null> = new Map();
  public textureConfigs: Map<string, TextureConfig> = new Map();
  
  // Shaders
  public vertexShader: string = '';
  public fragmentShader: string = '';
  public uniforms: Map<string, any> = new Map();
  
  // Estados internos
  private _dirty: boolean = true;
  private _compiled: boolean = false;
  private _program: WebGLProgram | null = null;
  private _uniformLocations: Map<string, WebGLUniformLocation | null> = new Map();

  constructor(
    id: string,
    name: string = ''
  ) {
    super();
    this.id = id;
    this.name = name || `Material_${id}`;
    this.initializeDefaultShaders();
    this.initializeDefaultUniforms();
  }
  
  /**
   * Inicializa shaders por defecto según el tipo de material
   */
  private initializeDefaultShaders(): void {
    switch (this.type) {
      case MaterialType.UNLIT:
        this.vertexShader = this.getDefaultUnlitVertexShader();
        this.fragmentShader = this.getDefaultUnlitFragmentShader();
        break;
      case MaterialType.PBR:
        this.vertexShader = this.getDefaultPBRVertexShader();
        this.fragmentShader = this.getDefaultPBRFragmentShader();
        break;
      default:
        this.vertexShader = this.getDefaultStandardVertexShader();
        this.fragmentShader = this.getDefaultStandardFragmentShader();
    }
  }
  
  /**
   * Inicializa uniforms por defecto
   */
  private initializeDefaultUniforms(): void {
    this.uniforms.set('u_modelMatrix', Matrix4.IDENTITY);
    this.uniforms.set('u_viewMatrix', Matrix4.IDENTITY);
    this.uniforms.set('u_projectionMatrix', Matrix4.IDENTITY);
    this.uniforms.set('u_normalMatrix', Matrix4.IDENTITY);
    this.uniforms.set('u_color', this.pbr.albedo);
    this.uniforms.set('u_opacity', 1.0);
    
    if (this.type === MaterialType.PBR) {
      this.uniforms.set('u_albedo', this.pbr.albedo);
      this.uniforms.set('u_metallic', this.pbr.metallic);
      this.uniforms.set('u_roughness', this.pbr.roughness);
      this.uniforms.set('u_ao', this.pbr.ao);
      this.uniforms.set('u_emissive', this.pbr.emissive);
      this.uniforms.set('u_normalScale', this.pbr.normalScale);
    }
  }
  
  /**
   * Compila el material para el contexto WebGL
   */
  public compile(gl: WebGL2RenderingContext): boolean {
    try {
      if (!this.vertexShader || !this.fragmentShader) {
        Material.logger.error('Shaders no definidos para el material', this.name);
        return false;
      }
      
      // Crear y compilar vertex shader
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      if (!vertexShader) {
        Material.logger.error('No se pudo crear vertex shader');
        return false;
      }
      
      gl.shaderSource(vertexShader, this.vertexShader);
      gl.compileShader(vertexShader);
      
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        Material.logger.error('Error compilando vertex shader:', new Error(error || 'Unknown error'));
        gl.deleteShader(vertexShader);
        return false;
      }
      
      // Crear y compilar fragment shader
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragmentShader) {
        Material.logger.error('No se pudo crear fragment shader');
        gl.deleteShader(vertexShader);
        return false;
      }
      
      gl.shaderSource(fragmentShader, this.fragmentShader);
      gl.compileShader(fragmentShader);
      
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        Material.logger.error('Error compilando fragment shader:', new Error(error || 'Unknown error'));
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return false;
      }
      
      // Crear y linkear programa
      this._program = gl.createProgram();
      if (!this._program) {
        Material.logger.error('No se pudo crear programa WebGL');
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return false;
      }
      
      gl.attachShader(this._program, vertexShader);
      gl.attachShader(this._program, fragmentShader);
      gl.linkProgram(this._program);
      
      if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(this._program);
        Material.logger.error('Error linkeando programa:', new Error(error || 'Unknown error'));
        gl.deleteProgram(this._program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return false;
      }
      
      // Limpiar shaders
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      
      // Obtener ubicaciones de uniforms
      this._uniformLocations.clear();
      for (const [name] of this.uniforms) {
        const location = gl.getUniformLocation(this._program, name);
        this._uniformLocations.set(name, location);
      }
      
      this._compiled = true;
      this._dirty = false;
      
      Material.logger.info('Material compilado exitosamente', this.name);
      this.emit('compiled', { material: this });
      
      return true;
      
    } catch (error) {
      Material.logger.error('Error compilando material', this.name, error);
      return false;
    }
  }
  
  /**
   * Aplica el material al contexto WebGL
   */
  public apply(gl: WebGL2RenderingContext): void {
    if (!this._compiled || !this._program) {
      if (!this.compile(gl)) {
        return;
      }
    }
    
    gl.useProgram(this._program);
    this.applyUniforms(gl);
    this.applyTextures(gl);
    this.setBlendMode(gl);
  }
  
  /**
   * Aplica los uniforms al shader
   */
  private applyUniforms(gl: WebGL2RenderingContext): void {
    for (const [name, value] of this.uniforms) {
      const location = this._uniformLocations.get(name);
      if (location === null) continue;
      
      if (value instanceof Matrix4) {
        gl.uniformMatrix4fv(location, false, value.toArray());
      } else if (value instanceof Vector3) {
        gl.uniform3f(location, value.x, value.y, value.z);
      } else if (typeof value === 'number') {
        gl.uniform1f(location, value);
      } else if (Array.isArray(value)) {
        if (value.length === 3) {
          gl.uniform3f(location, value[0], value[1], value[2]);
        } else if (value.length === 4) {
          gl.uniform4f(location, value[0], value[1], value[2], value[3]);
        }
      }
    }
  }
  
  /**
   * Aplica las texturas al shader
   */
  private applyTextures(gl: WebGL2RenderingContext): void {
    let textureUnit = 0;
    for (const [name, texture] of this.textures) {
      if (texture) {
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        const location = this._uniformLocations.get(name);
        if (location !== null) {
          gl.uniform1i(location, textureUnit);
        }
        textureUnit++;
      }
    }
  }
  
  /**
   * Configura el modo de blending
   */
  private setBlendMode(gl: WebGL2RenderingContext): void {
    // Implementación básica - puede ser extendida
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  
  /**
   * Crea una textura desde configuración
   */
  public createTexture(gl: WebGL2RenderingContext, name: string, config: TextureConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const texture = gl.createTexture();
      if (!texture) {
        reject(new Error('No se pudo crear textura WebGL'));
        return;
      }
      
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Configurar parámetros de textura
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, config.wrapS || gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, config.wrapT || gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, config.minFilter || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, config.magFilter || gl.LINEAR);
      
      if (config.data) {
        this.loadTextureFromData(gl, texture, config.data, config);
        this.textures.set(name, texture);
        this.emit('texture:changed', { material: this, textureType: name, texture });
        resolve();
      } else if (config.url) {
        this.loadTextureFromURL(gl, texture, config.url, config)
          .then(() => {
            this.textures.set(name, texture);
            this.emit('texture:changed', { material: this, textureType: name, texture });
            resolve();
          })
          .catch(reject);
      } else {
        reject(new Error('No se proporcionó data ni URL para la textura'));
      }
    });
  }
  
  /**
   * Carga textura desde datos
   */
  private loadTextureFromData(gl: WebGL2RenderingContext, texture: WebGLTexture, data: ImageData | HTMLImageElement | HTMLCanvasElement, config: TextureConfig): void {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    if (data instanceof ImageData) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    
    if (config.generateMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
  }
  
  /**
   * Carga textura desde URL
   */
  private loadTextureFromURL(gl: WebGL2RenderingContext, texture: WebGLTexture, url: string, config: TextureConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        if (config.generateMipmaps) {
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        
        resolve();
      };
      
      image.onerror = () => {
        reject(new Error(`Error cargando textura desde URL: ${url}`));
      };
      
      image.src = url;
    });
  }
  
  /**
   * Establece una propiedad del material
   */
  public setProperty(name: string, value: any): void {
    if (this.pbr.hasOwnProperty(name)) {
      (this.pbr as any)[name] = value;
    } else {
      this.uniforms.set(name, value);
    }
    
    this._dirty = true;
    this.emit('property:changed', { material: this, property: name, value });
  }
  
  /**
   * Obtiene una propiedad del material
   */
  public getProperty(name: string): any {
    if (this.pbr.hasOwnProperty(name)) {
      return (this.pbr as any)[name];
    }
    return this.uniforms.get(name);
  }
  
  /**
   * Clona el material
   */
  public clone(): Material {
    const cloned = new Material(this.id, this.name);
    
    cloned.type = this.type;
    cloned.shaderId = this.shaderId;
    cloned.pbr = { ...this.pbr };
    cloned.pbr.albedo = this.pbr.albedo.clone();
    cloned.pbr.emissive = this.pbr.emissive.clone();
    cloned.pbr.attenuationColor = this.pbr.attenuationColor.clone();
    
    cloned.vertexShader = this.vertexShader;
    cloned.fragmentShader = this.fragmentShader;
    
    // Clonar uniforms
    for (const [name, value] of this.uniforms) {
      if (value instanceof Matrix4) {
        cloned.uniforms.set(name, value.clone());
      } else if (value instanceof Vector3) {
        cloned.uniforms.set(name, value.clone());
      } else {
        cloned.uniforms.set(name, value);
      }
    }
    
    // Clonar texturas (referencias)
    for (const [name, texture] of this.textures) {
      cloned.textures.set(name, texture);
    }
    
    // Clonar configuraciones de textura
    for (const [name, config] of this.textureConfigs) {
      cloned.textureConfigs.set(name, { ...config });
    }
    
    return cloned;
  }
  
  /**
   * Serializa el material
   */
  public serialize(): any {
    const uniforms: any = {};
    for (const [name, value] of this.uniforms) {
      if (value instanceof Matrix4) {
        uniforms[name] = { type: 'Matrix4', data: value.toArray() };
      } else if (value instanceof Vector3) {
        uniforms[name] = { type: 'Vector3', data: { x: value.x, y: value.y, z: value.z } };
      } else {
        uniforms[name] = { type: 'primitive', data: value };
      }
    }
    
    const textures: any = {};
    for (const [name, config] of this.textureConfigs) {
      textures[name] = config;
    }
    
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      shaderId: this.shaderId,
      pbr: {
        albedo: { x: this.pbr.albedo.x, y: this.pbr.albedo.y, z: this.pbr.albedo.z },
        metallic: this.pbr.metallic,
        roughness: this.pbr.roughness,
        ao: this.pbr.ao,
        emissive: { x: this.pbr.emissive.x, y: this.pbr.emissive.y, z: this.pbr.emissive.z },
        normalScale: this.pbr.normalScale,
        occlusionStrength: this.pbr.occlusionStrength,
        clearcoat: this.pbr.clearcoat,
        clearcoatRoughness: this.pbr.clearcoatRoughness,
        transmission: this.pbr.transmission,
        thickness: this.pbr.thickness,
        attenuationDistance: this.pbr.attenuationDistance,
        attenuationColor: { x: this.pbr.attenuationColor.x, y: this.pbr.attenuationColor.y, z: this.pbr.attenuationColor.z }
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms,
      textures
    };
  }
  
  /**
   * Deserializa el material
   */
  public static deserialize(data: any): Material {
    const material = new Material(data.id, data.name);
    
    material.type = data.type;
    material.shaderId = data.shaderId;
    
    // Deserializar PBR properties
    material.pbr.albedo = new Vector3(data.pbr.albedo.x, data.pbr.albedo.y, data.pbr.albedo.z);
    material.pbr.metallic = data.pbr.metallic;
    material.pbr.roughness = data.pbr.roughness;
    material.pbr.ao = data.pbr.ao;
    material.pbr.emissive = new Vector3(data.pbr.emissive.x, data.pbr.emissive.y, data.pbr.emissive.z);
    material.pbr.normalScale = data.pbr.normalScale;
    material.pbr.occlusionStrength = data.pbr.occlusionStrength;
    material.pbr.clearcoat = data.pbr.clearcoat;
    material.pbr.clearcoatRoughness = data.pbr.clearcoatRoughness;
    material.pbr.transmission = data.pbr.transmission;
    material.pbr.thickness = data.pbr.thickness;
    material.pbr.attenuationDistance = data.pbr.attenuationDistance;
    material.pbr.attenuationColor = new Vector3(data.pbr.attenuationColor.x, data.pbr.attenuationColor.y, data.pbr.attenuationColor.z);
    
    material.vertexShader = data.vertexShader;
    material.fragmentShader = data.fragmentShader;
    
    // Deserializar uniforms
    for (const [name, uniformData] of Object.entries(data.uniforms)) {
      const uniform = uniformData as any;
      if (uniform.type === 'Matrix4') {
        material.uniforms.set(name, new Matrix4().fromArray(uniform.data));
      } else if (uniform.type === 'Vector3') {
        material.uniforms.set(name, new Vector3(uniform.data.x, uniform.data.y, uniform.data.z));
      } else {
        material.uniforms.set(name, uniform.data);
      }
    }
    
    // Deserializar texturas
    for (const [name, config] of Object.entries(data.textures)) {
      material.textureConfigs.set(name, config as TextureConfig);
    }
    
    return material;
  }
  
  /**
   * Libera recursos del material
   */
  public dispose(gl: WebGL2RenderingContext): void {
    // Liberar texturas
    for (const texture of this.textures.values()) {
      if (texture) {
        gl.deleteTexture(texture);
      }
    }
    this.textures.clear();
    
    // Liberar programa
    if (this._program) {
      gl.deleteProgram(this._program);
      this._program = null;
    }
    
    // Limpiar caches
    this._uniformLocations.clear();
    this.uniforms.clear();
    this.textureConfigs.clear();
    
    this._compiled = false;
    this._dirty = true;
    
    this.emit('disposed', { material: this });
  }
  
  // Shaders por defecto
  private getDefaultPBRVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_normal;
    layout(location = 2) in vec2 a_uv;
    layout(location = 3) in vec3 a_tangent;
    
    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat3 u_normalMatrix;
    
    out vec3 v_worldPos;
    out vec3 v_normal;
    out vec2 v_uv;
    out mat3 v_TBN;
    
    void main() {
        v_worldPos = vec3(u_modelMatrix * vec4(a_position, 1.0));
        v_normal = normalize(u_normalMatrix * a_normal);
        v_uv = a_uv;
        
        vec3 T = normalize(u_normalMatrix * a_tangent);
        vec3 N = v_normal;
        T = normalize(T - dot(T, N) * N);
        vec3 B = cross(N, T);
        v_TBN = mat3(T, B, N);
        
        gl_Position = u_projectionMatrix * u_viewMatrix * vec4(v_worldPos, 1.0);
    }`;
  }
  
  private getDefaultPBRFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec3 v_worldPos;
    in vec3 v_normal;
    in vec2 v_uv;
    in mat3 v_TBN;
    
    uniform vec3 u_albedo;
    uniform float u_metallic;
    uniform float u_roughness;
    uniform float u_ao;
    uniform vec3 u_emissive;
    uniform float u_normalScale;
    
    uniform sampler2D u_albedoMap;
    uniform sampler2D u_metallicRoughnessMap;
    uniform sampler2D u_normalMap;
    uniform sampler2D u_aoMap;
    uniform sampler2D u_emissiveMap;
    
    layout(location = 0) out vec4 fragColor;
    
    const float PI = 3.14159265359;
    
    vec3 getNormalFromMap() {
        vec3 tangentNormal = texture(u_normalMap, v_uv).xyz * 2.0 - 1.0;
        tangentNormal.xy *= u_normalScale;
        return normalize(v_TBN * tangentNormal);
    }
    
    vec3 fresnelSchlick(float cosTheta, vec3 F0) {
        return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
    }
    
    float DistributionGGX(vec3 N, vec3 H, float roughness) {
        float a = roughness * roughness;
        float a2 = a * a;
        float NdotH = max(dot(N, H), 0.0);
        float NdotH2 = NdotH * NdotH;
        
        float nom   = a2;
        float denom = (NdotH2 * (a2 - 1.0) + 1.0);
        denom = PI * denom * denom;
        
        return nom / denom;
    }
    
    float GeometrySchlickGGX(float NdotV, float roughness) {
        float r = (roughness + 1.0);
        float k = (r * r) / 8.0;
        
        float nom   = NdotV;
        float denom = NdotV * (1.0 - k) + k;
        
        return nom / denom;
    }
    
    float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
        float NdotV = max(dot(N, V), 0.0);
        float NdotL = max(dot(N, L), 0.0);
        float ggx2 = GeometrySchlickGGX(NdotV, roughness);
        float ggx1 = GeometrySchlickGGX(NdotL, roughness);
        
        return ggx1 * ggx2;
    }
    
    void main() {
        vec3 albedo = texture(u_albedoMap, v_uv).rgb * u_albedo;
        vec3 metallicRoughness = texture(u_metallicRoughnessMap, v_uv).rgb;
        float metallic = metallicRoughness.b * u_metallic;
        float roughness = metallicRoughness.g * u_roughness;
        float ao = texture(u_aoMap, v_uv).r * u_ao;
        vec3 emissive = texture(u_emissiveMap, v_uv).rgb * u_emissive;
        
        vec3 N = getNormalFromMap();
        vec3 V = normalize(-v_worldPos);
        
        vec3 F0 = vec3(0.04);
        F0 = mix(F0, albedo, metallic);
        
        // Cálculo de iluminación PBR simplificado
        vec3 Lo = vec3(0.0);
        
        // Para simplificar, usamos una luz direccional
        vec3 L = normalize(vec3(1.0, 1.0, 1.0));
        vec3 H = normalize(V + L);
        float distance = 1.0;
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = vec3(1.0) * attenuation;
        
        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);
        float G   = GeometrySmith(N, V, L, roughness);
        vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
        
        vec3 numerator    = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        vec3 specular = numerator / denominator;
        
        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;
        
        float NdotL = max(dot(N, L), 0.0);
        
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;
        
        vec3 ambient = vec3(0.03) * albedo * ao;
        vec3 color = ambient + Lo + emissive;
        
        color = color / (color + vec3(1.0));
        color = pow(color, vec3(1.0/2.2));
        
        fragColor = vec4(color, 1.0);
    }`;
  }
  
  private getDefaultStandardVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_normal;
    layout(location = 2) in vec2 a_uv;
    
    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat3 u_normalMatrix;
    
    out vec3 v_worldPos;
    out vec3 v_normal;
    out vec2 v_uv;
    
    void main() {
        v_worldPos = vec3(u_modelMatrix * vec4(a_position, 1.0));
        v_normal = normalize(u_normalMatrix * a_normal);
        v_uv = a_uv;
        
        gl_Position = u_projectionMatrix * u_viewMatrix * vec4(v_worldPos, 1.0);
    }`;
  }
  
  private getDefaultStandardFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec3 v_worldPos;
    in vec3 v_normal;
    in vec2 v_uv;
    
    uniform vec3 u_color;
    uniform float u_opacity;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec3 N = normalize(v_normal);
        vec3 L = normalize(vec3(1.0, 1.0, 1.0));
        
        float diffuse = max(dot(N, L), 0.0);
        vec3 ambient = 0.3 * u_color;
        vec3 diffuseColor = diffuse * u_color;
        
        vec3 color = ambient + diffuseColor;
        
        fragColor = vec4(color, u_opacity);
    }`;
  }
  
  private getDefaultUnlitVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 2) in vec2 a_uv;
    
    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
    }`;
  }
  
  private getDefaultUnlitFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform vec3 u_color;
    uniform float u_opacity;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        fragColor = vec4(u_color, u_opacity);
    }`;
  }
} 