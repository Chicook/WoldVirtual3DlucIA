import { Light, LightType } from './Light';
import { Vector3 } from '../scene/math/Vector3';
import { Matrix4 } from '../scene/math/Matrix4';

/**
 * Luz de área (como un panel LED)
 * Emite luz desde una superficie rectangular
 */
export class AreaLight extends Light {
  // Propiedades específicas de luz de área
  public width: number = 1.0;
  public height: number = 1.0;
  public shape: 'rectangle' | 'disk' | 'sphere' = 'rectangle';
  public samples: number = 16; // Número de muestras para soft shadows
  
  constructor(id: string, name: string = '') {
    super(id, LightType.AREA, name);
    
    // Configuración por defecto para luz de área
    this.position = new Vector3(0, 5, 0);
    this.direction = new Vector3(0, -1, 0);
    this.target = new Vector3(0, 0, 0);
    this.updateMatrices();
  }
  
  /**
   * Actualiza matrices para luz de área
   */
  protected updateAreaMatrices(): void {
    const up = new Vector3(0, 1, 0);
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, up);
    
    // Proyección basada en el tamaño del área
    const angle = this.getAreaAngle();
    const aspect = this.width / this.height;
    this.projectionMatrix = Matrix4.perspective(angle, aspect, 0.1, 1000);
  }
  
  /**
   * Renderiza el pass de sombra para luz de área
   */
  protected renderShadowPass(gl: WebGL2RenderingContext, scene: any): void {
    if (!this._shadowFramebuffer) {
      return;
    }
    
    // Para luces de área, renderizamos múltiples vistas para soft shadows
    for (let i = 0; i < this.samples; i++) {
      this.renderAreaShadowSample(gl, scene, i);
    }
  }
  
  /**
   * Renderiza una muestra específica de sombra para luz de área
   */
  private renderAreaShadowSample(gl: WebGL2RenderingContext, scene: any, sampleIndex: number): void {
    // Calcular offset de la posición para esta muestra
    const offset = this.calculateSampleOffset(sampleIndex);
    const samplePosition = this.position.clone().add(offset);
    
    // Crear matriz de vista para esta muestra
    const up = new Vector3(0, 1, 0);
    const viewMatrix = Matrix4.lookAt(samplePosition, this.target, up);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFramebuffer);
    gl.viewport(0, 0, this.shadowConfig.mapSize, this.shadowConfig.mapSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    
    // Renderizar escena desde esta perspectiva
    if (scene && scene.renderShadowPass) {
      scene.renderShadowPass(gl, viewMatrix, this.projectionMatrix);
    }
  }
  
  /**
   * Calcula el offset para una muestra específica
   */
  private calculateSampleOffset(sampleIndex: number): Vector3 {
    // Distribución de muestras en el área de la luz
    const samplesPerRow = Math.ceil(Math.sqrt(this.samples));
    const row = Math.floor(sampleIndex / samplesPerRow);
    const col = sampleIndex % samplesPerRow;
    
    const xOffset = (col / (samplesPerRow - 1) - 0.5) * this.width;
    const yOffset = (row / (samplesPerRow - 1) - 0.5) * this.height;
    
    // Transformar offset al espacio de la luz
    const right = new Vector3(1, 0, 0);
    const up = new Vector3(0, 1, 0);
    
    return right.clone().multiplyScalar(xOffset).add(up.clone().multiplyScalar(yOffset));
  }
  
  /**
   * Agrega uniforms específicos de luz de área
   */
  protected addTypeSpecificUniforms(uniforms: Record<string, any>): void {
    uniforms[`u_light_${this.id}_position`] = this.position;
    uniforms[`u_light_${this.id}_direction`] = this.direction;
    uniforms[`u_light_${this.id}_width`] = this.width;
    uniforms[`u_light_${this.id}_height`] = this.height;
    uniforms[`u_light_${this.id}_shape`] = this.getShapeValue();
    uniforms[`u_light_${this.id}_samples`] = this.samples;
  }
  
  /**
   * Obtiene la distancia máxima de la luz
   */
  protected getMaxDistance(): number {
    return 100.0; // Distancia fija para luces de área
  }
  
  /**
   * Obtiene el ángulo del área
   */
  protected getAreaAngle(): number {
    // Ángulo basado en el tamaño del área
    const maxDimension = Math.max(this.width, this.height);
    return Math.atan2(maxDimension / 2, 1.0) * 2;
  }
  
  /**
   * Obtiene el aspect ratio del área
   */
  protected getAreaAspect(): number {
    return this.width / this.height;
  }
  
  /**
   * Obtiene el valor numérico de la forma
   */
  private getShapeValue(): number {
    switch (this.shape) {
      case 'rectangle': return 0;
      case 'disk': return 1;
      case 'sphere': return 2;
      default: return 0;
    }
  }
  
  /**
   * Establece el tamaño del área de la luz
   */
  public setSize(width: number, height: number): this {
    this.width = Math.max(0.1, width);
    this.height = Math.max(0.1, height);
    this.updateMatrices();
    this.emit('sizeChanged', { light: this, width, height });
    return this;
  }
  
  /**
   * Establece la forma del área de la luz
   */
  public setShape(shape: 'rectangle' | 'disk' | 'sphere'): this {
    this.shape = shape;
    this.emit('shapeChanged', { light: this, shape });
    return this;
  }
  
  /**
   * Establece el número de muestras para soft shadows
   */
  public setSamples(samples: number): this {
    this.samples = Math.max(1, Math.min(64, samples));
    this.emit('samplesChanged', { light: this, samples });
    return this;
  }
  
  /**
   * Calcula la irradiancia en un punto dado
   */
  public calculateIrradiance(point: Vector3): number {
    const toPoint = point.clone().subtract(this.position);
    const distance = toPoint.length();
    
    if (distance === 0) {
      return this.intensity;
    }
    
    // Factor de distancia
    const distanceFactor = 1.0 / (distance * distance);
    
    // Factor de dirección (coseno del ángulo)
    const direction = toPoint.normalize();
    const cosAngle = this.direction.dot(direction);
    
    if (cosAngle <= 0) {
      return 0.0; // Detrás de la luz
    }
    
    // Factor de área
    const areaFactor = this.width * this.height;
    
    return this.intensity * distanceFactor * cosAngle * areaFactor;
  }
  
  /**
   * Obtiene los puntos de muestra para soft shadows
   */
  public getSamplePoints(): Vector3[] {
    const points: Vector3[] = [];
    const samplesPerRow = Math.ceil(Math.sqrt(this.samples));
    
    for (let i = 0; i < this.samples; i++) {
      const row = Math.floor(i / samplesPerRow);
      const col = i % samplesPerRow;
      
      const xOffset = (col / (samplesPerRow - 1) - 0.5) * this.width;
      const yOffset = (row / (samplesPerRow - 1) - 0.5) * this.height;
      
      const right = new Vector3(1, 0, 0);
      const up = new Vector3(0, 1, 0);
      
      const offset = right.clone().multiplyScalar(xOffset).add(up.clone().multiplyScalar(yOffset));
      points.push(this.position.clone().add(offset));
    }
    
    return points;
  }
  
  /**
   * Clona la luz de área
   */
  public clone(): AreaLight {
    const cloned = new AreaLight(this.id, this.name);
    
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
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.shape = this.shape;
    cloned.samples = this.samples;
    
    return cloned;
  }
  
  /**
   * Serializa la luz de área
   */
  public serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      width: this.width,
      height: this.height,
      shape: this.shape,
      samples: this.samples
    };
  }
} 