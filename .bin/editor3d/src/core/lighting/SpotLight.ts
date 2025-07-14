import { Light, LightType } from './Light';
import { Vector3 } from '../scene/math/Vector3';
import { AttenuationConfig } from './Light';

/**
 * Luz spot (como un foco)
 * Emite luz en forma de cono desde un punto
 */
export class SpotLight extends Light {
  // Propiedades específicas de luz spot
  public angle: number = Math.PI / 4; // 45 grados
  public penumbra: number = 0.1; // Suavizado del borde del cono
  public attenuation: AttenuationConfig = {
    constant: 1.0,
    linear: 0.09,
    quadratic: 0.032,
    maxDistance: 100.0
  };
  
  constructor(id: string, name: string = '') {
    super(id, LightType.SPOT, name);
    
    // Configuración por defecto para luz spot
    this.position = new Vector3(0, 5, 0);
    this.direction = new Vector3(0, -1, 0);
    this.target = new Vector3(0, 0, 0);
    this.updateMatrices();
  }
  
  /**
   * Actualiza matrices para luz spot
   */
  protected updateSpotMatrices(): void {
    const up = new Vector3(0, 1, 0);
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, up);
    
    // Proyección cónica
    const angle = this.angle * 2; // Ángulo total del cono
    this.projectionMatrix = Matrix4.perspective(angle, 1, 0.1, this.attenuation.maxDistance);
  }
  
  /**
   * Renderiza el pass de sombra para luz spot
   */
  protected renderShadowPass(gl: WebGL2RenderingContext, scene: any): void {
    if (!this._shadowFramebuffer) {
      return;
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFramebuffer);
    gl.viewport(0, 0, this.shadowConfig.mapSize, this.shadowConfig.mapSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    
    // Renderizar escena desde la perspectiva de la luz spot
    if (scene && scene.renderShadowPass) {
      scene.renderShadowPass(gl, this.viewMatrix, this.projectionMatrix);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  /**
   * Agrega uniforms específicos de luz spot
   */
  protected addTypeSpecificUniforms(uniforms: Record<string, any>): void {
    uniforms[`u_light_${this.id}_position`] = this.position;
    uniforms[`u_light_${this.id}_direction`] = this.direction;
    uniforms[`u_light_${this.id}_angle`] = this.angle;
    uniforms[`u_light_${this.id}_penumbra`] = this.penumbra;
    uniforms[`u_light_${this.id}_attenuation`] = [
      this.attenuation.constant,
      this.attenuation.linear,
      this.attenuation.quadratic
    ];
    uniforms[`u_light_${this.id}_maxDistance`] = this.attenuation.maxDistance;
  }
  
  /**
   * Obtiene la distancia máxima de la luz
   */
  protected getMaxDistance(): number {
    return this.attenuation.maxDistance;
  }
  
  /**
   * Obtiene el ángulo del spot
   */
  protected getSpotAngle(): number {
    return this.angle * 2; // Ángulo total del cono
  }
  
  /**
   * Calcula la atenuación de la luz a una distancia dada
   */
  public calculateAttenuation(distance: number): number {
    const { constant, linear, quadratic } = this.attenuation;
    return 1.0 / (constant + linear * distance + quadratic * distance * distance);
  }
  
  /**
   * Calcula el factor de cono para un punto dado
   */
  public calculateConeFactor(point: Vector3): number {
    const toPoint = point.clone().subtract(this.position).normalize();
    const cosAngle = this.direction.dot(toPoint);
    const cosConeAngle = Math.cos(this.angle);
    
    if (cosAngle < cosConeAngle) {
      return 0.0; // Fuera del cono
    }
    
    // Suavizado del borde del cono
    const penumbraCos = Math.cos(this.angle + this.penumbra);
    if (cosAngle < penumbraCos) {
      const t = (cosAngle - cosConeAngle) / (penumbraCos - cosConeAngle);
      return t * t * (3.0 - 2.0 * t); // Smoothstep
    }
    
    return 1.0; // Dentro del cono
  }
  
  /**
   * Establece el ángulo del cono de luz
   */
  public setAngle(angle: number): this {
    this.angle = Math.max(0.01, Math.min(Math.PI / 2, angle));
    this.updateMatrices();
    this.emit('angleChanged', { light: this, angle });
    return this;
  }
  
  /**
   * Establece el penumbra (suavizado del borde)
   */
  public setPenumbra(penumbra: number): this {
    this.penumbra = Math.max(0, Math.min(this.angle, penumbra));
    this.emit('penumbraChanged', { light: this, penumbra });
    return this;
  }
  
  /**
   * Establece la configuración de atenuación
   */
  public setAttenuation(attenuation: Partial<AttenuationConfig>): this {
    this.attenuation = { ...this.attenuation, ...attenuation };
    this.updateMatrices();
    this.emit('attenuationChanged', { light: this, attenuation: this.attenuation });
    return this;
  }
  
  /**
   * Establece la distancia máxima de la luz
   */
  public setMaxDistance(maxDistance: number): this {
    this.attenuation.maxDistance = Math.max(0.1, maxDistance);
    this.updateMatrices();
    this.emit('maxDistanceChanged', { light: this, maxDistance });
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
   * Establece el target de la luz
   */
  public setTarget(target: Vector3): this {
    this.target = target.clone();
    this.direction = target.clone().subtract(this.position).normalize();
    this.updateMatrices();
    this.emit('targetChanged', { light: this, target });
    return this;
  }
  
  /**
   * Obtiene el frustum de la luz spot
   */
  public getFrustum(): any {
    // Implementar cálculo del frustum cónico
    // Esto es útil para culling y optimizaciones
    return {
      position: this.position,
      direction: this.direction,
      angle: this.angle,
      maxDistance: this.attenuation.maxDistance
    };
  }
  
  /**
   * Clona la luz spot
   */
  public clone(): SpotLight {
    const cloned = new SpotLight(this.id, this.name);
    
    cloned.enabled = this.enabled;
    cloned.visible = this.visible;
    cloned.color = this.color.clone();
    cloned.intensity = this.intensity;
    cloned.exposure = this.exposure;
    cloned.position = this.position.clone();
    cloned.direction = this.direction.clone();
    cloned.target = this.target.clone();
    cloned.castShadows = this.castShadows;
    cloned.shadowConfig = { ...this.shadowConfig };
    cloned.angle = this.angle;
    cloned.penumbra = this.penumbra;
    cloned.attenuation = { ...this.attenuation };
    
    return cloned;
  }
  
  /**
   * Serializa la luz spot
   */
  public serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      angle: this.angle,
      penumbra: this.penumbra,
      attenuation: { ...this.attenuation }
    };
  }
} 