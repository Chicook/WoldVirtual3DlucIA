import { Vector3 } from '../scene/math/Vector3';
import { Matrix4 } from '../scene/math/Matrix4';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

/**
 * Tipos de luces soportadas
 */
export enum LightType {
  DIRECTIONAL = 'directional',
  POINT = 'point',
  SPOT = 'spot',
  AREA = 'area',
  AMBIENT = 'ambient'
}

/**
 * Configuración de sombras
 */
export interface ShadowConfig {
  enabled: boolean;
  mapSize: number;
  bias: number;
  normalBias: number;
  radius: number;
  maxDistance: number;
  cascadeCount: number;
  cascadeSplits: number[];
}

/**
 * Configuración de atenuación
 */
export interface AttenuationConfig {
  constant: number;
  linear: number;
  quadratic: number;
  maxDistance: number;
}

/**
 * Clase base para todas las luces del sistema
 */
export abstract class Light extends EventEmitter {
  protected static readonly logger = new Logger('Light');
  
  // Propiedades básicas
  public readonly id: string;
  public name: string;
  public type: LightType;
  public enabled: boolean = true;
  public visible: boolean = true;
  
  // Propiedades de color e intensidad
  public color: Vector3 = new Vector3(1, 1, 1);
  public intensity: number = 1.0;
  public exposure: number = 1.0;
  
  // Propiedades de posición y dirección
  public position: Vector3 = new Vector3(0, 0, 0);
  public direction: Vector3 = new Vector3(0, -1, 0);
  public target: Vector3 = new Vector3(0, 0, 0);
  
  // Propiedades PBR
  public castShadows: boolean = false;
  public shadowConfig: ShadowConfig = {
    enabled: false,
    mapSize: 1024,
    bias: 0.0001,
    normalBias: 0.02,
    radius: 1.0,
    maxDistance: 100.0,
    cascadeCount: 4,
    cascadeSplits: [0.1, 0.25, 0.5, 1.0]
  };
  
  // Matrices de transformación
  public worldMatrix: Matrix4 = Matrix4.IDENTITY;
  public viewMatrix: Matrix4 = Matrix4.IDENTITY;
  public projectionMatrix: Matrix4 = Matrix4.IDENTITY;
  
  // Estados internos
  protected _dirty: boolean = true;
  protected _shadowMap: WebGLTexture | null = null;
  protected _shadowFramebuffer: WebGLFramebuffer | null = null;
  
  constructor(id: string, type: LightType, name: string = '') {
    super();
    this.id = id;
    this.type = type;
    this.name = name || `${type}_${id}`;
    
    this.updateMatrices();
  }
  
  /**
   * Actualiza las matrices de transformación de la luz
   */
  public updateMatrices(): void {
    switch (this.type) {
      case LightType.DIRECTIONAL:
        this.updateDirectionalMatrices();
        break;
      case LightType.POINT:
        this.updatePointMatrices();
        break;
      case LightType.SPOT:
        this.updateSpotMatrices();
        break;
      case LightType.AREA:
        this.updateAreaMatrices();
        break;
    }
    
    this._dirty = true;
    this.emit('matricesUpdated', this);
  }
  
  /**
   * Actualiza matrices para luz direccional
   */
  protected updateDirectionalMatrices(): void {
    // Matriz de vista para luz direccional
    const up = new Vector3(0, 1, 0);
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, up);
    
    // Matriz de proyección ortográfica
    const size = 10.0;
    this.projectionMatrix = Matrix4.orthographic(-size, size, -size, size, 0.1, 1000);
  }
  
  /**
   * Actualiza matrices para luz puntual
   */
  protected updatePointMatrices(): void {
    // Las luces puntuales usan proyección cúbica
    this.projectionMatrix = Matrix4.perspective(90, 1, 0.1, this.getMaxDistance());
  }
  
  /**
   * Actualiza matrices para luz spot
   */
  protected updateSpotMatrices(): void {
    const up = new Vector3(0, 1, 0);
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, up);
    
    const angle = this.getSpotAngle();
    this.projectionMatrix = Matrix4.perspective(angle, 1, 0.1, this.getMaxDistance());
  }
  
  /**
   * Actualiza matrices para luz de área
   */
  protected updateAreaMatrices(): void {
    // Similar a spot pero con forma rectangular
    const up = new Vector3(0, 1, 0);
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, up);
    
    const angle = this.getAreaAngle();
    this.projectionMatrix = Matrix4.perspective(angle, this.getAreaAspect(), 0.1, this.getMaxDistance());
  }
  
  /**
   * Crea el shadow map para esta luz
   */
  public createShadowMap(gl: WebGL2RenderingContext): void {
    if (!this.castShadows || !this.shadowConfig.enabled) {
      return;
    }
    
    try {
      // Crear textura de shadow map
      this._shadowMap = gl.createTexture();
      if (!this._shadowMap) {
        Light.logger.error('No se pudo crear shadow map texture');
        return;
      }
      
      gl.bindTexture(gl.TEXTURE_2D, this._shadowMap);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.DEPTH_COMPONENT24,
        this.shadowConfig.mapSize,
        this.shadowConfig.mapSize,
        0,
        gl.DEPTH_COMPONENT,
        gl.UNSIGNED_INT,
        null
      );
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      // Crear framebuffer
      this._shadowFramebuffer = gl.createFramebuffer();
      if (!this._shadowFramebuffer) {
        Light.logger.error('No se pudo crear shadow framebuffer');
        return;
      }
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFramebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D,
        this._shadowMap,
        0
      );
      
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        Light.logger.error('Shadow framebuffer incompleto:', status);
        return;
      }
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      Light.logger.info('Shadow map creado exitosamente para', this.name);
      this.emit('shadowMapCreated', this);
      
    } catch (error) {
      Light.logger.error('Error creando shadow map:', error);
    }
  }
  
  /**
   * Renderiza la sombra de la luz
   */
  public renderShadow(gl: WebGL2RenderingContext, scene: any): void {
    if (!this._shadowFramebuffer || !this.castShadows) {
      return;
    }
    
    try {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFramebuffer);
      gl.viewport(0, 0, this.shadowConfig.mapSize, this.shadowConfig.mapSize);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      
      // Renderizar escena desde la perspectiva de la luz
      this.renderShadowPass(gl, scene);
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
    } catch (error) {
      Light.logger.error('Error renderizando sombra:', error);
    }
  }
  
  /**
   * Renderiza el pass de sombra (implementado por subclases)
   */
  protected abstract renderShadowPass(gl: WebGL2RenderingContext, scene: any): void;
  
  /**
   * Obtiene los uniforms de la luz para el shader
   */
  public getUniforms(): Record<string, any> {
    const uniforms: Record<string, any> = {
      [`u_light_${this.id}_type`]: this.getLightTypeValue(),
      [`u_light_${this.id}_color`]: this.color,
      [`u_light_${this.id}_intensity`]: this.intensity * this.exposure,
      [`u_light_${this.id}_position`]: this.position,
      [`u_light_${this.id}_direction`]: this.direction,
      [`u_light_${this.id}_enabled`]: this.enabled && this.visible ? 1 : 0
    };
    
    // Agregar propiedades específicas del tipo de luz
    this.addTypeSpecificUniforms(uniforms);
    
    // Agregar información de sombras
    if (this.castShadows && this._shadowMap) {
      uniforms[`u_light_${this.id}_shadowMap`] = this._shadowMap;
      uniforms[`u_light_${this.id}_shadowMatrix`] = this.projectionMatrix.clone().multiply(this.viewMatrix);
      uniforms[`u_light_${this.id}_shadowBias`] = this.shadowConfig.bias;
      uniforms[`u_light_${this.id}_shadowNormalBias`] = this.shadowConfig.normalBias;
      uniforms[`u_light_${this.id}_shadowRadius`] = this.shadowConfig.radius;
    }
    
    return uniforms;
  }
  
  /**
   * Obtiene el valor numérico del tipo de luz
   */
  protected getLightTypeValue(): number {
    switch (this.type) {
      case LightType.DIRECTIONAL: return 0;
      case LightType.POINT: return 1;
      case LightType.SPOT: return 2;
      case LightType.AREA: return 3;
      case LightType.AMBIENT: return 4;
      default: return 0;
    }
  }
  
  /**
   * Agrega uniforms específicos del tipo de luz (implementado por subclases)
   */
  protected abstract addTypeSpecificUniforms(uniforms: Record<string, any>): void;
  
  /**
   * Obtiene la distancia máxima de la luz
   */
  protected abstract getMaxDistance(): number;
  
  /**
   * Obtiene el ángulo del spot (para luces spot)
   */
  protected getSpotAngle(): number {
    return Math.PI / 4; // 45 grados por defecto
  }
  
  /**
   * Obtiene el ángulo del área (para luces de área)
   */
  protected getAreaAngle(): number {
    return Math.PI / 6; // 30 grados por defecto
  }
  
  /**
   * Obtiene el aspect ratio del área (para luces de área)
   */
  protected getAreaAspect(): number {
    return 1.0; // Cuadrado por defecto
  }
  
  /**
   * Establece la posición de la luz
   */
  public setPosition(position: Vector3): this {
    this.position = position.clone();
    this.updateMatrices();
    this.emit('positionChanged', { light: this, position });
    return this;
  }
  
  /**
   * Establece la dirección de la luz
   */
  public setDirection(direction: Vector3): this {
    this.direction = direction.normalize();
    this.target = this.position.clone().add(this.direction);
    this.updateMatrices();
    this.emit('directionChanged', { light: this, direction });
    return this;
  }
  
  /**
   * Establece el color de la luz
   */
  public setColor(color: Vector3): this {
    this.color = color.clone();
    this.emit('colorChanged', { light: this, color });
    return this;
  }
  
  /**
   * Establece la intensidad de la luz
   */
  public setIntensity(intensity: number): this {
    this.intensity = Math.max(0, intensity);
    this.emit('intensityChanged', { light: this, intensity });
    return this;
  }
  
  /**
   * Habilita/deshabilita las sombras
   */
  public setCastShadows(castShadows: boolean): this {
    this.castShadows = castShadows;
    this.shadowConfig.enabled = castShadows;
    this.emit('castShadowsChanged', { light: this, castShadows });
    return this;
  }
  
  /**
   * Clona la luz
   */
  public abstract clone(): Light;
  
  /**
   * Serializa la luz
   */
  public serialize(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      visible: this.visible,
      color: this.color.serialize(),
      intensity: this.intensity,
      exposure: this.exposure,
      position: this.position.serialize(),
      direction: this.direction.serialize(),
      target: this.target.serialize(),
      castShadows: this.castShadows,
      shadowConfig: { ...this.shadowConfig }
    };
  }
  
  /**
   * Deserializa la luz
   */
  public static deserialize(data: any): Light {
    let light: Light;
    
    switch (data.type) {
      case LightType.DIRECTIONAL:
        light = new DirectionalLight(data.id, data.name);
        break;
      case LightType.POINT:
        light = new PointLight(data.id, data.name);
        break;
      case LightType.SPOT:
        light = new SpotLight(data.id, data.name);
        break;
      case LightType.AREA:
        light = new AreaLight(data.id, data.name);
        break;
      case LightType.AMBIENT:
        light = new AmbientLight(data.id, data.name);
        break;
      default:
        throw new Error(`Tipo de luz no soportado: ${data.type}`);
    }
    
    light.enabled = data.enabled;
    light.visible = data.visible;
    light.color = Vector3.deserialize(data.color);
    light.intensity = data.intensity;
    light.exposure = data.exposure;
    light.position = Vector3.deserialize(data.position);
    light.direction = Vector3.deserialize(data.direction);
    light.target = Vector3.deserialize(data.target);
    light.castShadows = data.castShadows;
    light.shadowConfig = { ...data.shadowConfig };
    
    return light;
  }
  
  /**
   * Limpia recursos de la luz
   */
  public dispose(gl: WebGL2RenderingContext): void {
    if (this._shadowMap) {
      gl.deleteTexture(this._shadowMap);
      this._shadowMap = null;
    }
    
    if (this._shadowFramebuffer) {
      gl.deleteFramebuffer(this._shadowFramebuffer);
      this._shadowFramebuffer = null;
    }
    
    Light.logger.info('Luz eliminada', this.name);
    this.emit('disposed', this);
  }
} 