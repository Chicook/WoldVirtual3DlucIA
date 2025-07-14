import { Light, LightType } from './Light';
import { Vector3 } from '../scene/math/Vector3';

/**
 * Luz ambiental (iluminación de fondo)
 * Proporciona iluminación uniforme en toda la escena
 */
export class AmbientLight extends Light {
  // Propiedades específicas de luz ambiental
  public skyColor: Vector3 = new Vector3(0.5, 0.7, 1.0);
  public groundColor: Vector3 = new Vector3(0.3, 0.3, 0.3);
  public hemisphere: boolean = false; // Usar iluminación hemisférica
  
  constructor(id: string, name: string = '') {
    super(id, LightType.AMBIENT, name);
    
    // Configuración por defecto para luz ambiental
    this.intensity = 0.3;
    this.updateMatrices();
  }
  
  /**
   * Actualiza matrices para luz ambiental (no aplica)
   */
  protected updateDirectionalMatrices(): void {
    // Las luces ambientales no necesitan matrices de transformación
  }
  
  protected updatePointMatrices(): void {
    // Las luces ambientales no necesitan matrices de transformación
  }
  
  protected updateSpotMatrices(): void {
    // Las luces ambientales no necesitan matrices de transformación
  }
  
  protected updateAreaMatrices(): void {
    // Las luces ambientales no necesitan matrices de transformación
  }
  
  /**
   * Renderiza el pass de sombra para luz ambiental (no aplica)
   */
  protected renderShadowPass(gl: WebGL2RenderingContext, scene: any): void {
    // Las luces ambientales no proyectan sombras
  }
  
  /**
   * Agrega uniforms específicos de luz ambiental
   */
  protected addTypeSpecificUniforms(uniforms: Record<string, any>): void {
    uniforms[`u_light_${this.id}_color`] = this.color;
    uniforms[`u_light_${this.id}_intensity`] = this.intensity * this.exposure;
    uniforms[`u_light_${this.id}_skyColor`] = this.skyColor;
    uniforms[`u_light_${this.id}_groundColor`] = this.groundColor;
    uniforms[`u_light_${this.id}_hemisphere`] = this.hemisphere ? 1 : 0;
  }
  
  /**
   * Obtiene la distancia máxima de la luz
   */
  protected getMaxDistance(): number {
    return Infinity; // Luz ambiental afecta toda la escena
  }
  
  /**
   * Establece el color del cielo para iluminación hemisférica
   */
  public setSkyColor(color: Vector3): this {
    this.skyColor = color.clone();
    this.emit('skyColorChanged', { light: this, color });
    return this;
  }
  
  /**
   * Establece el color del suelo para iluminación hemisférica
   */
  public setGroundColor(color: Vector3): this {
    this.groundColor = color.clone();
    this.emit('groundColorChanged', { light: this, color });
    return this;
  }
  
  /**
   * Habilita/deshabilita la iluminación hemisférica
   */
  public setHemisphere(enabled: boolean): this {
    this.hemisphere = enabled;
    this.emit('hemisphereChanged', { light: this, enabled });
    return this;
  }
  
  /**
   * Calcula la iluminación ambiental en un punto dado
   */
  public calculateAmbient(point: Vector3, normal: Vector3): Vector3 {
    if (this.hemisphere) {
      // Iluminación hemisférica
      const up = new Vector3(0, 1, 0);
      const dot = normal.dot(up);
      const t = (dot + 1) / 2; // Interpolación entre suelo y cielo
      
      return this.skyColor.clone().multiplyScalar(t)
        .add(this.groundColor.clone().multiplyScalar(1 - t))
        .multiplyScalar(this.intensity);
    } else {
      // Iluminación ambiental uniforme
      return this.color.clone().multiplyScalar(this.intensity);
    }
  }
  
  /**
   * Clona la luz ambiental
   */
  public clone(): AmbientLight {
    const cloned = new AmbientLight(this.id, this.name);
    
    cloned.enabled = this.enabled;
    cloned.visible = this.visible;
    cloned.color = this.color.clone();
    cloned.intensity = this.intensity;
    cloned.exposure = this.exposure;
    cloned.skyColor = this.skyColor.clone();
    cloned.groundColor = this.groundColor.clone();
    cloned.hemisphere = this.hemisphere;
    
    return cloned;
  }
  
  /**
   * Serializa la luz ambiental
   */
  public serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      skyColor: this.skyColor.serialize(),
      groundColor: this.groundColor.serialize(),
      hemisphere: this.hemisphere
    };
  }
} 