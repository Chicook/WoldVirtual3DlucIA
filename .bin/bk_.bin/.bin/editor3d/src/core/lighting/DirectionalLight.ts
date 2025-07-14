import { Light, LightType } from './Light';
import { Vector3 } from '../scene/math/Vector3';
import { Matrix4 } from '../scene/math/Matrix4';

/**
 * Luz direccional (como el sol)
 * Emite luz en una dirección específica desde el infinito
 */
export class DirectionalLight extends Light {
  // Propiedades específicas de luz direccional
  public shadowCascadeCount: number = 4;
  public shadowCascadeSplits: number[] = [0.1, 0.25, 0.5, 1.0];
  public shadowCascadeBlend: number = 0.1;
  
  constructor(id: string, name: string = '') {
    super(id, LightType.DIRECTIONAL, name);
    
    // Configuración por defecto para luz direccional
    this.direction = new Vector3(0, -1, 0);
    this.target = new Vector3(0, 0, 0);
    this.shadowConfig.cascadeCount = this.shadowCascadeCount;
    this.shadowConfig.cascadeSplits = this.shadowCascadeSplits;
  }
  
  /**
   * Actualiza matrices para luz direccional con cascaded shadow mapping
   */
  protected updateDirectionalMatrices(): void {
    const up = new Vector3(0, 1, 0);
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, up);
    
    // Para luces direccionales, usamos proyección ortográfica
    const size = 10.0;
    this.projectionMatrix = Matrix4.orthographic(-size, size, -size, size, 0.1, 1000);
  }
  
  /**
   * Renderiza el pass de sombra para luz direccional
   */
  protected renderShadowPass(gl: WebGL2RenderingContext, scene: any): void {
    // Implementación de cascaded shadow mapping
    for (let i = 0; i < this.shadowCascadeCount; i++) {
      this.renderCascadeShadow(gl, scene, i);
    }
  }
  
  /**
   * Renderiza una cascada específica de sombra
   */
  private renderCascadeShadow(gl: WebGL2RenderingContext, scene: any, cascadeIndex: number): void {
    // Calcular frustum para esta cascada
    const split = this.shadowCascadeSplits[cascadeIndex];
    const near = cascadeIndex === 0 ? 0.1 : this.shadowCascadeSplits[cascadeIndex - 1];
    const far = split;
    
    // Actualizar matriz de proyección para esta cascada
    const cascadeProjection = Matrix4.orthographic(-10, 10, -10, 10, near, far);
    
    // Renderizar geometría desde la perspectiva de la luz
    if (scene && scene.renderShadowPass) {
      scene.renderShadowPass(gl, this.viewMatrix, cascadeProjection);
    }
  }
  
  /**
   * Agrega uniforms específicos de luz direccional
   */
  protected addTypeSpecificUniforms(uniforms: Record<string, any>): void {
    uniforms[`u_light_${this.id}_direction`] = this.direction;
    uniforms[`u_light_${this.id}_shadowCascadeCount`] = this.shadowCascadeCount;
    uniforms[`u_light_${this.id}_shadowCascadeSplits`] = this.shadowCascadeSplits;
    uniforms[`u_light_${this.id}_shadowCascadeBlend`] = this.shadowCascadeBlend;
  }
  
  /**
   * Obtiene la distancia máxima (infinito para luces direccionales)
   */
  protected getMaxDistance(): number {
    return Infinity;
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
   * Establece el número de cascadas de sombra
   */
  public setShadowCascadeCount(count: number): this {
    this.shadowCascadeCount = Math.max(1, Math.min(4, count));
    this.shadowConfig.cascadeCount = this.shadowCascadeCount;
    this.emit('shadowCascadeCountChanged', { light: this, count });
    return this;
  }
  
  /**
   * Establece los splits de las cascadas
   */
  public setShadowCascadeSplits(splits: number[]): this {
    this.shadowCascadeSplits = [...splits];
    this.shadowConfig.cascadeSplits = this.shadowCascadeSplits;
    this.emit('shadowCascadeSplitsChanged', { light: this, splits });
    return this;
  }
  
  /**
   * Clona la luz direccional
   */
  public clone(): DirectionalLight {
    const cloned = new DirectionalLight(this.id, this.name);
    
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
    cloned.shadowCascadeCount = this.shadowCascadeCount;
    cloned.shadowCascadeSplits = [...this.shadowCascadeSplits];
    cloned.shadowCascadeBlend = this.shadowCascadeBlend;
    
    return cloned;
  }
  
  /**
   * Serializa la luz direccional
   */
  public serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      shadowCascadeCount: this.shadowCascadeCount,
      shadowCascadeSplits: [...this.shadowCascadeSplits],
      shadowCascadeBlend: this.shadowCascadeBlend
    };
  }
} 