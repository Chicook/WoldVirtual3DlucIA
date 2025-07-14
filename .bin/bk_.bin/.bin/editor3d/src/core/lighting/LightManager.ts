import { Light, LightType } from './Light';
import { DirectionalLight } from './DirectionalLight';
import { PointLight } from './PointLight';
import { SpotLight } from './SpotLight';
import { AreaLight } from './AreaLight';
import { AmbientLight } from './AmbientLight';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3 } from '../scene/math/Vector3';

/**
 * Eventos del sistema de iluminación
 */
export interface LightingEvents {
  'light:added': { light: Light };
  'light:removed': { light: Light };
  'light:updated': { light: Light };
  'light:enabled': { light: Light };
  'light:disabled': { light: Light };
  'shadows:updated': { light: Light };
}

/**
 * Configuración del sistema de iluminación
 */
export interface LightingConfig {
  maxLights: number;
  enableShadows: boolean;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  enableGlobalIllumination: boolean;
  enableLightProbes: boolean;
  ambientIntensity: number;
  exposure: number;
  gamma: number;
}

/**
 * Gestor de iluminación enterprise
 * Maneja todas las luces de la escena y optimizaciones
 */
export class LightManager extends EventEmitter<LightingEvents> {
  private static readonly logger = new Logger('LightManager');
  
  // Configuración
  public config: LightingConfig = {
    maxLights: 16,
    enableShadows: true,
    shadowQuality: 'high',
    enableGlobalIllumination: false,
    enableLightProbes: false,
    ambientIntensity: 0.3,
    exposure: 1.0,
    gamma: 2.2
  };
  
  // Colección de luces
  private lights: Map<string, Light> = new Map();
  private ambientLight: AmbientLight | null = null;
  
  // Optimizaciones
  private lightCulling: boolean = true;
  private shadowCulling: boolean = true;
  private lightProbes: Map<string, any> = new Map();
  
  // Estados
  private _dirty: boolean = true;
  private _shadowMapsDirty: boolean = true;
  
  constructor() {
    super();
    this.initializeDefaultLighting();
  }
  
  /**
   * Inicializa la iluminación por defecto
   */
  private initializeDefaultLighting(): void {
    // Crear luz ambiental por defecto
    this.ambientLight = new AmbientLight('ambient_default', 'Ambient Light');
    this.ambientLight.setColor(new Vector3(0.5, 0.5, 0.5));
    this.ambientLight.setIntensity(this.config.ambientIntensity);
    
    // Crear luz direccional por defecto (sol)
    const sunLight = new DirectionalLight('sun_default', 'Sun Light');
    sunLight.setPosition(new Vector3(10, 10, 10));
    sunLight.setDirection(new Vector3(-1, -1, -1));
    sunLight.setColor(new Vector3(1, 0.95, 0.8));
    sunLight.setIntensity(1.0);
    sunLight.setCastShadows(true);
    
    this.addLight(sunLight);
    
    LightManager.logger.info('Sistema de iluminación inicializado');
  }
  
  /**
   * Agrega una luz al sistema
   */
  public addLight(light: Light): void {
    if (this.lights.has(light.id)) {
      LightManager.logger.warn('Luz ya existe:', light.id);
      return;
    }
    
    if (this.lights.size >= this.config.maxLights) {
      LightManager.logger.warn('Límite de luces alcanzado:', this.config.maxLights);
      return;
    }
    
    this.lights.set(light.id, light);
    this._dirty = true;
    
    // Configurar eventos de la luz
    light.on('positionChanged', () => this.onLightUpdated(light));
    light.on('directionChanged', () => this.onLightUpdated(light));
    light.on('colorChanged', () => this.onLightUpdated(light));
    light.on('intensityChanged', () => this.onLightUpdated(light));
    light.on('castShadowsChanged', () => this.onShadowUpdated(light));
    
    LightManager.logger.info('Luz agregada:', light.name);
    this.emit('light:added', { light });
  }
  
  /**
   * Remueve una luz del sistema
   */
  public removeLight(lightId: string): boolean {
    const light = this.lights.get(lightId);
    if (!light) {
      return false;
    }
    
    this.lights.delete(lightId);
    this._dirty = true;
    
    LightManager.logger.info('Luz removida:', light.name);
    this.emit('light:removed', { light });
    
    return true;
  }
  
  /**
   * Obtiene una luz por ID
   */
  public getLight(lightId: string): Light | undefined {
    return this.lights.get(lightId);
  }
  
  /**
   * Obtiene todas las luces
   */
  public getLights(): Light[] {
    return Array.from(this.lights.values());
  }
  
  /**
   * Obtiene luces por tipo
   */
  public getLightsByType(type: LightType): Light[] {
    return this.getLights().filter(light => light.type === type);
  }
  
  /**
   * Obtiene luces que proyectan sombras
   */
  public getShadowCastingLights(): Light[] {
    return this.getLights().filter(light => light.castShadows);
  }
  
  /**
   * Obtiene la luz ambiental
   */
  public getAmbientLight(): AmbientLight | null {
    return this.ambientLight;
  }
  
  /**
   * Establece la luz ambiental
   */
  public setAmbientLight(light: AmbientLight): void {
    this.ambientLight = light;
    this._dirty = true;
    this.emit('light:updated', { light });
  }
  
  /**
   * Crea una luz direccional
   */
  public createDirectionalLight(id: string, name?: string): DirectionalLight {
    const light = new DirectionalLight(id, name);
    this.addLight(light);
    return light;
  }
  
  /**
   * Crea una luz puntual
   */
  public createPointLight(id: string, name?: string): PointLight {
    const light = new PointLight(id, name);
    this.addLight(light);
    return light;
  }
  
  /**
   * Crea una luz spot
   */
  public createSpotLight(id: string, name?: string): SpotLight {
    const light = new SpotLight(id, name);
    this.addLight(light);
    return light;
  }
  
  /**
   * Crea una luz de área
   */
  public createAreaLight(id: string, name?: string): AreaLight {
    const light = new AreaLight(id, name);
    this.addLight(light);
    return light;
  }
  
  /**
   * Crea una luz ambiental
   */
  public createAmbientLight(id: string, name?: string): AmbientLight {
    const light = new AmbientLight(id, name);
    this.setAmbientLight(light);
    return light;
  }
  
  /**
   * Actualiza todas las luces
   */
  public update(): void {
    if (!this._dirty) {
      return;
    }
    
    // Actualizar matrices de todas las luces
    for (const light of this.lights.values()) {
      if (light.enabled) {
        light.updateMatrices();
      }
    }
    
    this._dirty = false;
    LightManager.logger.debug('Sistema de iluminación actualizado');
  }
  
  /**
   * Renderiza las sombras de todas las luces
   */
  public renderShadows(gl: WebGL2RenderingContext, scene: any): void {
    if (!this.config.enableShadows) {
      return;
    }
    
    const shadowLights = this.getShadowCastingLights();
    
    for (const light of shadowLights) {
      if (light.enabled && light.visible) {
        light.renderShadow(gl, scene);
      }
    }
    
    this._shadowMapsDirty = false;
  }
  
  /**
   * Obtiene todos los uniforms de iluminación
   */
  public getLightingUniforms(): Record<string, any> {
    const uniforms: Record<string, any> = {};
    
    // Uniforms de configuración
    uniforms['u_lighting_enabled'] = 1;
    uniforms['u_lighting_maxLights'] = this.config.maxLights;
    uniforms['u_lighting_exposure'] = this.config.exposure;
    uniforms['u_lighting_gamma'] = this.config.gamma;
    uniforms['u_lighting_enableShadows'] = this.config.enableShadows ? 1 : 0;
    uniforms['u_lighting_enableGI'] = this.config.enableGlobalIllumination ? 1 : 0;
    
    // Uniforms de luz ambiental
    if (this.ambientLight && this.ambientLight.enabled) {
      Object.assign(uniforms, this.ambientLight.getUniforms());
    }
    
    // Uniforms de luces dinámicas
    const enabledLights = this.getLights().filter(light => light.enabled && light.visible);
    const lightCount = Math.min(enabledLights.length, this.config.maxLights);
    
    uniforms['u_lighting_count'] = lightCount;
    
    for (let i = 0; i < lightCount; i++) {
      const light = enabledLights[i];
      const lightUniforms = light.getUniforms();
      
      // Renombrar uniforms para el array de luces
      for (const [key, value] of Object.entries(lightUniforms)) {
        const newKey = key.replace(`u_light_${light.id}_`, `u_lighting_lights[${i}].`);
        uniforms[newKey] = value;
      }
    }
    
    return uniforms;
  }
  
  /**
   * Optimiza las luces para una cámara específica
   */
  public cullLights(cameraPosition: Vector3, cameraFrustum: any): Light[] {
    if (!this.lightCulling) {
      return this.getLights().filter(light => light.enabled && light.visible);
    }
    
    const visibleLights: Light[] = [];
    
    for (const light of this.getLights()) {
      if (!light.enabled || !light.visible) {
        continue;
      }
      
      // Culling básico por distancia
      const distance = cameraPosition.distanceTo(light.position);
      const maxDistance = light.getMaxDistance();
      
      if (distance > maxDistance) {
        continue;
      }
      
      // Culling por frustum (para luces direccionales y spot)
      if (light.type === LightType.DIRECTIONAL || light.type === LightType.SPOT) {
        // Implementar culling por frustum
        // Por ahora, incluimos todas las luces
      }
      
      visibleLights.push(light);
    }
    
    return visibleLights.slice(0, this.config.maxLights);
  }
  
  /**
   * Optimiza las sombras para una cámara específica
   */
  public cullShadows(cameraPosition: Vector3, cameraFrustum: any): Light[] {
    if (!this.shadowCulling) {
      return this.getShadowCastingLights();
    }
    
    const shadowLights = this.getShadowCastingLights();
    const visibleShadowLights: Light[] = [];
    
    for (const light of shadowLights) {
      if (!light.enabled || !light.visible) {
        continue;
      }
      
      // Culling por distancia para sombras
      const distance = cameraPosition.distanceTo(light.position);
      const shadowDistance = light.shadowConfig.maxDistance;
      
      if (distance > shadowDistance) {
        continue;
      }
      
      visibleShadowLights.push(light);
    }
    
    return visibleShadowLights;
  }
  
  /**
   * Maneja actualización de luz
   */
  private onLightUpdated(light: Light): void {
    this._dirty = true;
    this.emit('light:updated', { light });
  }
  
  /**
   * Maneja actualización de sombras
   */
  private onShadowUpdated(light: Light): void {
    this._shadowMapsDirty = true;
    this.emit('shadows:updated', { light });
  }
  
  /**
   * Establece la configuración del sistema
   */
  public setConfig(config: Partial<LightingConfig>): void {
    this.config = { ...this.config, ...config };
    this._dirty = true;
    
    // Actualizar luz ambiental si cambió la intensidad
    if (this.ambientLight && config.ambientIntensity !== undefined) {
      this.ambientLight.setIntensity(config.ambientIntensity);
    }
    
    LightManager.logger.info('Configuración de iluminación actualizada');
  }
  
  /**
   * Habilita/deshabilita el culling de luces
   */
  public setLightCulling(enabled: boolean): void {
    this.lightCulling = enabled;
    LightManager.logger.info('Culling de luces:', enabled ? 'habilitado' : 'deshabilitado');
  }
  
  /**
   * Habilita/deshabilita el culling de sombras
   */
  public setShadowCulling(enabled: boolean): void {
    this.shadowCulling = enabled;
    LightManager.logger.info('Culling de sombras:', enabled ? 'habilitado' : 'deshabilitado');
  }
  
  /**
   * Limpia todos los recursos
   */
  public dispose(gl: WebGL2RenderingContext): void {
    // Limpiar luces
    for (const light of this.lights.values()) {
      light.dispose(gl);
    }
    this.lights.clear();
    
    // Limpiar luz ambiental
    if (this.ambientLight) {
      this.ambientLight.dispose(gl);
      this.ambientLight = null;
    }
    
    // Limpiar light probes
    this.lightProbes.clear();
    
    LightManager.logger.info('Sistema de iluminación eliminado');
  }
  
  /**
   * Serializa el sistema de iluminación
   */
  public serialize(): any {
    return {
      config: { ...this.config },
      lights: Array.from(this.lights.values()).map(light => light.serialize()),
      ambientLight: this.ambientLight?.serialize() || null,
      lightCulling: this.lightCulling,
      shadowCulling: this.shadowCulling
    };
  }
  
  /**
   * Deserializa el sistema de iluminación
   */
  public static deserialize(data: any): LightManager {
    const manager = new LightManager();
    
    // Restaurar configuración
    manager.setConfig(data.config);
    
    // Restaurar luces
    for (const lightData of data.lights) {
      const light = Light.deserialize(lightData);
      manager.addLight(light);
    }
    
    // Restaurar luz ambiental
    if (data.ambientLight) {
      const ambientLight = AmbientLight.deserialize(data.ambientLight);
      manager.setAmbientLight(ambientLight);
    }
    
    // Restaurar configuraciones de culling
    manager.setLightCulling(data.lightCulling);
    manager.setShadowCulling(data.shadowCulling);
    
    return manager;
  }
} 