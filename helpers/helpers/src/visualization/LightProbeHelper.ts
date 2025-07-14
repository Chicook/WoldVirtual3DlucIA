/**
 * @fileoverview Helper avanzado para LightProbe con funcionalidades del metaverso
 * @module @metaverso/helpers/visualization/LightProbeHelper
 */

import * as THREE from 'three';
import { IVisualizationHelper } from '../types';

/**
 * Helper avanzado para LightProbe con funcionalidades del metaverso
 */
export class LightProbeHelper extends THREE.Mesh implements IVisualizationHelper {
  public readonly type = 'LightProbeHelper';
  public enabled: boolean = true;
  
  private _lightProbe: THREE.LightProbe;
  private _size: number;
  private _color: THREE.ColorRepresentation;
  private _intensity: number;
  private _showIntensity: boolean = false;
  private _showSphericalHarmonics: boolean = false;
  private _sphericalHarmonicsHelper?: THREE.Mesh;
  private _intensityHelper?: THREE.Mesh;
  private _originalMaterial?: THREE.Material;

  /**
   * Constructor del helper
   * @param lightProbe - LightProbe a visualizar
   * @param size - Tamaño del helper
   * @param color - Color del helper
   * @param intensity - Intensidad del helper
   */
  constructor(
    lightProbe: THREE.LightProbe,
    size: number = 1,
    color: THREE.ColorRepresentation = 0xffffff,
    intensity: number = 1
  ) {
    // Crear geometría esférica para el helper
    const geometry = new THREE.SphereGeometry(size, 16, 16);
    
    // Crear material con shader personalizado
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        time: { value: 0 },
        showIntensity: { value: 0 },
        showSphericalHarmonics: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        uniform float time;
        uniform float showIntensity;
        uniform float showSphericalHarmonics;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 baseColor = color;
          
          // Efecto de pulso
          float pulse = sin(time * 2.0) * 0.5 + 0.5;
          baseColor *= (1.0 + pulse * 0.2);
          
          // Mostrar intensidad
          if (showIntensity > 0.5) {
            float intensityFactor = intensity;
            baseColor *= intensityFactor;
          }
          
          // Mostrar armónicos esféricos
          if (showSphericalHarmonics > 0.5) {
            vec3 normal = normalize(vNormal);
            float sh = dot(normal, vec3(0.577, 0.577, 0.577));
            baseColor *= (0.5 + sh * 0.5);
          }
          
          gl_FragColor = vec4(baseColor, 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    super(geometry, material);
    
    this._lightProbe = lightProbe;
    this._size = size;
    this._color = color;
    this._intensity = intensity;
    
    this.init();
  }

  /**
   * Inicializar el helper
   */
  public init(): void {
    // Crear helper para armónicos esféricos
    this._createSphericalHarmonicsHelper();
    
    // Crear helper para intensidad
    this._createIntensityHelper();
    
    // Configurar propiedades iniciales
    this.update();
  }

  /**
   * Actualizar el helper
   */
  public update(): void {
    if (!this.enabled) return;

    const material = this.material as THREE.ShaderMaterial;
    if (material && material.uniforms) {
      material.uniforms.time.value += 0.016; // ~60fps
      material.uniforms.intensity.value = this._intensity;
      material.uniforms.showIntensity.value = this._showIntensity ? 1.0 : 0.0;
      material.uniforms.showSphericalHarmonics.value = this._showSphericalHarmonics ? 1.0 : 0.0;
    }

    // Actualizar posición para seguir al LightProbe
    if (this._lightProbe.parent) {
      this.position.copy(this._lightProbe.getWorldPosition(new THREE.Vector3()));
    }

    // Actualizar helpers secundarios
    this._updateSphericalHarmonicsHelper();
    this._updateIntensityHelper();
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    if (this.geometry) {
      this.geometry.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }
    
    if (this._sphericalHarmonicsHelper) {
      this._sphericalHarmonicsHelper.geometry.dispose();
      this._sphericalHarmonicsHelper.material.dispose();
    }
    
    if (this._intensityHelper) {
      this._intensityHelper.geometry.dispose();
      this._intensityHelper.material.dispose();
    }
  }

  /**
   * Mostrar el helper
   */
  public show(): void {
    this.visible = true;
    this.enabled = true;
  }

  /**
   * Ocultar el helper
   */
  public hide(): void {
    this.visible = false;
    this.enabled = false;
  }

  /**
   * Obtener el LightProbe asociado
   */
  public get lightProbe(): THREE.LightProbe {
    return this._lightProbe;
  }

  /**
   * Obtener el tamaño del helper
   */
  public get size(): number {
    return this._size;
  }

  /**
   * Establecer el tamaño del helper
   */
  public setSize(size: number): void {
    this._size = size;
    this.geometry = new THREE.SphereGeometry(size, 16, 16);
  }

  /**
   * Obtener el color del helper
   */
  public get color(): THREE.ColorRepresentation {
    return this._color;
  }

  /**
   * Establecer el color del helper
   */
  public setColor(color: THREE.ColorRepresentation): void {
    this._color = color;
    const material = this.material as THREE.ShaderMaterial;
    if (material && material.uniforms) {
      material.uniforms.color.value.set(color);
    }
  }

  /**
   * Obtener la intensidad del helper
   */
  public get intensity(): number {
    return this._intensity;
  }

  /**
   * Establecer la intensidad del helper
   */
  public setIntensity(intensity: number): void {
    this._intensity = intensity;
  }

  /**
   * Mostrar/ocultar visualización de intensidad
   */
  public setShowIntensity(show: boolean): void {
    this._showIntensity = show;
  }

  /**
   * Mostrar/ocultar visualización de armónicos esféricos
   */
  public setShowSphericalHarmonics(show: boolean): void {
    this._showSphericalHarmonics = show;
  }

  /**
   * Crear helper para armónicos esféricos
   */
  private _createSphericalHarmonicsHelper(): void {
    const geometry = new THREE.SphereGeometry(this._size * 1.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    this._sphericalHarmonicsHelper = new THREE.Mesh(geometry, material);
    this._sphericalHarmonicsHelper.visible = false;
    this.add(this._sphericalHarmonicsHelper);
  }

  /**
   * Crear helper para intensidad
   */
  private _createIntensityHelper(): void {
    const geometry = new THREE.SphereGeometry(this._size * 0.8, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5
    });

    this._intensityHelper = new THREE.Mesh(geometry, material);
    this._intensityHelper.visible = false;
    this.add(this._intensityHelper);
  }

  /**
   * Actualizar helper de armónicos esféricos
   */
  private _updateSphericalHarmonicsHelper(): void {
    if (this._sphericalHarmonicsHelper) {
      this._sphericalHarmonicsHelper.visible = this._showSphericalHarmonics;
      
      if (this._showSphericalHarmonics) {
        // Aplicar armónicos esféricos del LightProbe
        const sh = this._lightProbe.sh;
        if (sh) {
          // Visualizar los coeficientes de los armónicos esféricos
          const material = this._sphericalHarmonicsHelper.material as THREE.MeshBasicMaterial;
          const intensity = Math.sqrt(sh[0] * sh[0] + sh[1] * sh[1] + sh[2] * sh[2]);
          material.color.setHSL(0.3, 1, intensity * 0.5);
        }
      }
    }
  }

  /**
   * Actualizar helper de intensidad
   */
  private _updateIntensityHelper(): void {
    if (this._intensityHelper) {
      this._intensityHelper.visible = this._showIntensity;
      
      if (this._showIntensity) {
        // Escalar según la intensidad
        const scale = this._intensity;
        this._intensityHelper.scale.setScalar(scale);
        
        // Cambiar color según intensidad
        const material = this._intensityHelper.material as THREE.MeshBasicMaterial;
        if (scale > 1.5) {
          material.color.setHex(0xff0000); // Rojo para alta intensidad
        } else if (scale > 1.0) {
          material.color.setHex(0xffff00); // Amarillo para intensidad media
        } else {
          material.color.setHex(0x00ff00); // Verde para baja intensidad
        }
      }
    }
  }

  /**
   * Obtener información del helper
   */
  public getInfo(): {
    type: string;
    enabled: boolean;
    size: number;
    color: THREE.ColorRepresentation;
    intensity: number;
    showIntensity: boolean;
    showSphericalHarmonics: boolean;
    lightProbeInfo: {
      intensity: number;
      hasSphericalHarmonics: boolean;
      coefficientCount: number;
    };
  } {
    return {
      type: this.type,
      enabled: this.enabled,
      size: this._size,
      color: this._color,
      intensity: this._intensity,
      showIntensity: this._showIntensity,
      showSphericalHarmonics: this._showSphericalHarmonics,
      lightProbeInfo: {
        intensity: this._lightProbe.intensity,
        hasSphericalHarmonics: !!this._lightProbe.sh,
        coefficientCount: this._lightProbe.sh ? this._lightProbe.sh.length : 0
      }
    };
  }

  /**
   * Clonar el helper
   */
  public clone(): LightProbeHelper {
    const helper = new LightProbeHelper(
      this._lightProbe,
      this._size,
      this._color,
      this._intensity
    );
    
    helper.enabled = this.enabled;
    helper.setShowIntensity(this._showIntensity);
    helper.setShowSphericalHarmonics(this._showSphericalHarmonics);
    
    return helper;
  }
} 