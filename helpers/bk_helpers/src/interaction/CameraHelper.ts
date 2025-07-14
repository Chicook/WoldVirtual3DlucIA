/**
 * @fileoverview Helper de cámara para controles avanzados en el metaverso
 * @module @metaverso/helpers/interaction/CameraHelper
 */

import * as THREE from 'three';
import { IInteractionHelper } from '../types';

/**
 * Configuración de controles de cámara
 */
export interface CameraControlsConfig {
  enableOrbit: boolean;
  enablePan: boolean;
  enableZoom: boolean;
  enableDolly: boolean;
  enableRotate: boolean;
  enableKeys: boolean;
  enableTouch: boolean;
  enableVR: boolean;
  
  // Límites
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  
  // Sensibilidad
  panSpeed: number;
  zoomSpeed: number;
  rotateSpeed: number;
  dollySpeed: number;
  
  // Suavizado
  enableDamping: boolean;
  dampingFactor: number;
  
  // Configuración de VR
  vr: {
    enabled: boolean;
    controllerOffset: THREE.Vector3;
    eyeHeight: number;
    movementSpeed: number;
  };
}

/**
 * Estado de la cámara
 */
export interface CameraState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  target: THREE.Vector3;
  distance: number;
  polarAngle: number;
  azimuthAngle: number;
}

/**
 * Helper de cámara para controles avanzados en el metaverso
 */
export class CameraHelper implements IInteractionHelper {
  public readonly type = 'CameraHelper';
  public enabled: boolean = true;
  public domElement: HTMLElement;
  public events: Map<string, Function> = new Map();
  
  private _camera: THREE.Camera;
  private _config: CameraControlsConfig;
  private _target: THREE.Vector3 = new THREE.Vector3();
  private _spherical: THREE.Spherical = new THREE.Spherical();
  private _sphericalDelta: THREE.Spherical = new THREE.Spherical();
  private _scale: number = 1;
  private _panOffset: THREE.Vector3 = new THREE.Vector3();
  private _state: CameraState;
  
  // Estados de input
  private _isMouseDown: boolean = false;
  private _isTouchDown: boolean = false;
  private _mousePosition: THREE.Vector2 = new THREE.Vector2();
  private _touchPositions: THREE.Vector2[] = [];
  private _keyStates: Set<string> = new Set();
  
  // VR
  private _vrSession?: any;
  private _vrControllers: any[] = [];
  private _vrReferenceSpace?: any;
  
  // Suavizado
  private _dampingVector: THREE.Vector3 = new THREE.Vector3();
  private _dampingSpherical: THREE.Spherical = new THREE.Spherical();

  /**
   * Constructor del helper
   * @param camera - Cámara a controlar
   * @param domElement - Elemento DOM para eventos
   * @param config - Configuración de controles
   */
  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    config: Partial<CameraControlsConfig> = {}
  ) {
    this._camera = camera;
    this.domElement = domElement;
    
    // Configuración por defecto
    this._config = {
      enableOrbit: true,
      enablePan: true,
      enableZoom: true,
      enableDolly: true,
      enableRotate: true,
      enableKeys: true,
      enableTouch: true,
      enableVR: true,
      minDistance: 0.1,
      maxDistance: Infinity,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
      panSpeed: 1.0,
      zoomSpeed: 1.0,
      rotateSpeed: 1.0,
      dollySpeed: 1.0,
      enableDamping: true,
      dampingFactor: 0.05,
      vr: {
        enabled: true,
        controllerOffset: new THREE.Vector3(0, 1.6, 0),
        eyeHeight: 1.6,
        movementSpeed: 2.0
      },
      ...config
    };
    
    // Inicializar estado
    this._state = {
      position: camera.position.clone(),
      rotation: camera.rotation.clone(),
      target: this._target.clone(),
      distance: 10,
      polarAngle: Math.PI / 2,
      azimuthAngle: 0
    };
    
    this.init();
  }

  /**
   * Inicializar el helper
   */
  public init(): void {
    // Configurar cámara inicial
    this._updateCamera();
    
    // Configurar eventos
    this._setupEventListeners();
    
    // Configurar VR si está disponible
    if (this._config.vr.enabled && this._isVRAvailable()) {
      this._setupVR();
    }
    
    console.log('[CameraHelper] Inicializado');
  }

  /**
   * Actualizar el helper
   */
  public update(): void {
    if (!this.enabled) return;

    // Actualizar controles de teclado
    this._updateKeyboardControls();
    
    // Aplicar suavizado
    if (this._config.enableDamping) {
      this._applyDamping();
    }
    
    // Actualizar cámara
    this._updateCamera();
    
    // Actualizar VR
    if (this._vrSession) {
      this._updateVR();
    }
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    // Remover event listeners
    this._removeEventListeners();
    
    // Finalizar sesión VR
    if (this._vrSession) {
      this._vrSession.end();
    }
    
    // Limpiar eventos
    this.clearEvents();
    
    console.log('[CameraHelper] Limpiado');
  }

  /**
   * Mostrar el helper
   */
  public show(): void {
    this.enabled = true;
  }

  /**
   * Ocultar el helper
   */
  public hide(): void {
    this.enabled = false;
  }

  /**
   * Registrar evento
   */
  public addEventListener(event: string, callback: Function): void {
    this.events.set(event, callback);
  }

  /**
   * Remover evento
   */
  public removeEventListener(event: string): void {
    this.events.delete(event);
  }

  /**
   * Limpiar todos los eventos
   */
  public clearEvents(): void {
    this.events.clear();
  }

  /**
   * Establecer target de la cámara
   */
  public setTarget(target: THREE.Vector3): void {
    this._target.copy(target);
    this._updateSpherical();
    this._emitEvent('targetChanged', target);
  }

  /**
   * Obtener target de la cámara
   */
  public getTarget(): THREE.Vector3 {
    return this._target.clone();
  }

  /**
   * Establecer distancia de la cámara
   */
  public setDistance(distance: number): void {
    this._spherical.radius = Math.max(
      this._config.minDistance,
      Math.min(this._config.maxDistance, distance)
    );
    this._emitEvent('distanceChanged', distance);
  }

  /**
   * Obtener distancia de la cámara
   */
  public getDistance(): number {
    return this._spherical.radius;
  }

  /**
   * Establecer ángulos de la cámara
   */
  public setAngles(polarAngle: number, azimuthAngle: number): void {
    this._spherical.phi = Math.max(
      this._config.minPolarAngle,
      Math.min(this._config.maxPolarAngle, polarAngle)
    );
    this._spherical.theta = Math.max(
      this._config.minAzimuthAngle,
      Math.min(this._config.maxAzimuthAngle, azimuthAngle)
    );
    this._emitEvent('anglesChanged', { polarAngle, azimuthAngle });
  }

  /**
   * Obtener ángulos de la cámara
   */
  public getAngles(): { polarAngle: number; azimuthAngle: number } {
    return {
      polarAngle: this._spherical.phi,
      azimuthAngle: this._spherical.theta
    };
  }

  /**
   * Hacer zoom
   */
  public zoom(delta: number): void {
    if (!this._config.enableZoom) return;

    const scale = Math.pow(0.95, delta * this._config.zoomSpeed);
    this._scale *= scale;
    
    this._emitEvent('zoom', { scale, delta });
  }

  /**
   * Hacer pan
   */
  public pan(deltaX: number, deltaY: number): void {
    if (!this._config.enablePan) return;

    const offset = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const quaternionInverse = new THREE.Quaternion();
    
    quaternion.setFromUnitVectors(this._camera.up, new THREE.Vector3(0, 1, 0));
    quaternionInverse.copy(quaternion).invert();
    
    offset.setFromMatrixColumn(this._camera.matrix, 0);
    offset.crossVectors(this._camera.up, offset);
    offset.multiplyScalar(deltaX * this._config.panSpeed);
    
    this._panOffset.add(offset);
    
    offset.setFromMatrixColumn(this._camera.matrix, 1);
    offset.multiplyScalar(deltaY * this._config.panSpeed);
    
    this._panOffset.add(offset);
    
    this._emitEvent('pan', { deltaX, deltaY });
  }

  /**
   * Rotar cámara
   */
  public rotate(deltaX: number, deltaY: number): void {
    if (!this._config.enableRotate) return;

    this._sphericalDelta.theta -= deltaX * this._config.rotateSpeed;
    this._sphericalDelta.phi -= deltaY * this._config.rotateSpeed;
    
    this._emitEvent('rotate', { deltaX, deltaY });
  }

  /**
   * Resetear cámara
   */
  public reset(): void {
    this._spherical.set(1, Math.PI / 2, 0);
    this._sphericalDelta.set(0, 0, 0);
    this._scale = 1;
    this._panOffset.set(0, 0, 0);
    this._target.set(0, 0, 0);
    
    this._emitEvent('reset', {});
  }

  /**
   * Obtener estado de la cámara
   */
  public getState(): CameraState {
    return {
      position: this._camera.position.clone(),
      rotation: this._camera.rotation.clone(),
      target: this._target.clone(),
      distance: this._spherical.radius,
      polarAngle: this._spherical.phi,
      azimuthAngle: this._spherical.theta
    };
  }

  /**
   * Establecer estado de la cámara
   */
  public setState(state: CameraState): void {
    this._camera.position.copy(state.position);
    this._camera.rotation.copy(state.rotation);
    this._target.copy(state.target);
    this._spherical.radius = state.distance;
    this._spherical.phi = state.polarAngle;
    this._spherical.theta = state.azimuthAngle;
    
    this._emitEvent('stateChanged', state);
  }

  /**
   * Habilitar/deshabilitar VR
   */
  public setVREnabled(enabled: boolean): void {
    this._config.vr.enabled = enabled;
    
    if (enabled && this._isVRAvailable()) {
      this._setupVR();
    } else if (!enabled && this._vrSession) {
      this._vrSession.end();
    }
  }

  /**
   * Configurar event listeners
   */
  private _setupEventListeners(): void {
    // Mouse events
    this.domElement.addEventListener('mousedown', this._onMouseDown.bind(this));
    this.domElement.addEventListener('mousemove', this._onMouseMove.bind(this));
    this.domElement.addEventListener('mouseup', this._onMouseUp.bind(this));
    this.domElement.addEventListener('wheel', this._onWheel.bind(this));
    
    // Touch events
    this.domElement.addEventListener('touchstart', this._onTouchStart.bind(this));
    this.domElement.addEventListener('touchmove', this._onTouchMove.bind(this));
    this.domElement.addEventListener('touchend', this._onTouchEnd.bind(this));
    
    // Keyboard events
    if (this._config.enableKeys) {
      document.addEventListener('keydown', this._onKeyDown.bind(this));
      document.addEventListener('keyup', this._onKeyUp.bind(this));
    }
    
    // Context menu
    this.domElement.addEventListener('contextmenu', this._onContextMenu.bind(this));
  }

  /**
   * Remover event listeners
   */
  private _removeEventListeners(): void {
    this.domElement.removeEventListener('mousedown', this._onMouseDown.bind(this));
    this.domElement.removeEventListener('mousemove', this._onMouseMove.bind(this));
    this.domElement.removeEventListener('mouseup', this._onMouseUp.bind(this));
    this.domElement.removeEventListener('wheel', this._onWheel.bind(this));
    this.domElement.removeEventListener('touchstart', this._onTouchStart.bind(this));
    this.domElement.removeEventListener('touchmove', this._onTouchMove.bind(this));
    this.domElement.removeEventListener('touchend', this._onTouchEnd.bind(this));
    document.removeEventListener('keydown', this._onKeyDown.bind(this));
    document.removeEventListener('keyup', this._onKeyUp.bind(this));
    this.domElement.removeEventListener('contextmenu', this._onContextMenu.bind(this));
  }

  /**
   * Event handlers
   */
  private _onMouseDown(event: MouseEvent): void {
    if (!this.enabled) return;
    
    this._isMouseDown = true;
    this._mousePosition.set(event.clientX, event.clientY);
    
    this._emitEvent('mouseDown', { event, position: this._mousePosition });
  }

  private _onMouseMove(event: MouseEvent): void {
    if (!this.enabled || !this._isMouseDown) return;
    
    const newPosition = new THREE.Vector2(event.clientX, event.clientY);
    const delta = newPosition.sub(this._mousePosition);
    
    if (event.buttons === 1) {
      // Botón izquierdo - rotar
      this.rotate(delta.x, delta.y);
    } else if (event.buttons === 2) {
      // Botón derecho - pan
      this.pan(delta.x, delta.y);
    }
    
    this._mousePosition.copy(newPosition);
    
    this._emitEvent('mouseMove', { event, delta, position: newPosition });
  }

  private _onMouseUp(event: MouseEvent): void {
    if (!this.enabled) return;
    
    this._isMouseDown = false;
    
    this._emitEvent('mouseUp', { event });
  }

  private _onWheel(event: WheelEvent): void {
    if (!this.enabled) return;
    
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 1 : -1;
    this.zoom(delta);
    
    this._emitEvent('wheel', { event, delta });
  }

  private _onTouchStart(event: TouchEvent): void {
    if (!this.enabled || !this._config.enableTouch) return;
    
    event.preventDefault();
    
    this._isTouchDown = true;
    this._touchPositions = Array.from(event.touches).map(touch => 
      new THREE.Vector2(touch.clientX, touch.clientY)
    );
    
    this._emitEvent('touchStart', { event, positions: this._touchPositions });
  }

  private _onTouchMove(event: TouchEvent): void {
    if (!this.enabled || !this._isTouchDown || !this._config.enableTouch) return;
    
    event.preventDefault();
    
    const newPositions = Array.from(event.touches).map(touch => 
      new THREE.Vector2(touch.clientX, touch.clientY)
    );
    
    if (newPositions.length === 1) {
      // Un dedo - rotar
      const delta = newPositions[0].sub(this._touchPositions[0]);
      this.rotate(delta.x, delta.y);
    } else if (newPositions.length === 2) {
      // Dos dedos - zoom y pan
      const oldDistance = this._touchPositions[0].distanceTo(this._touchPositions[1]);
      const newDistance = newPositions[0].distanceTo(newPositions[1]);
      const delta = newDistance - oldDistance;
      
      this.zoom(delta * 0.01);
      
      const oldCenter = this._touchPositions[0].clone().add(this._touchPositions[1]).multiplyScalar(0.5);
      const newCenter = newPositions[0].clone().add(newPositions[1]).multiplyScalar(0.5);
      const panDelta = newCenter.sub(oldCenter);
      
      this.pan(panDelta.x, panDelta.y);
    }
    
    this._touchPositions = newPositions;
    
    this._emitEvent('touchMove', { event, positions: newPositions });
  }

  private _onTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;
    
    this._isTouchDown = false;
    this._touchPositions = [];
    
    this._emitEvent('touchEnd', { event });
  }

  private _onKeyDown(event: KeyboardEvent): void {
    if (!this.enabled || !this._config.enableKeys) return;
    
    this._keyStates.add(event.code);
    
    // Controles de teclado
    const speed = 0.1;
    switch (event.code) {
      case 'KeyW':
        this._moveForward(speed);
        break;
      case 'KeyS':
        this._moveForward(-speed);
        break;
      case 'KeyA':
        this._moveRight(-speed);
        break;
      case 'KeyD':
        this._moveRight(speed);
        break;
      case 'KeyQ':
        this._moveUp(speed);
        break;
      case 'KeyE':
        this._moveUp(-speed);
        break;
    }
    
    this._emitEvent('keyDown', { event, code: event.code });
  }

  private _onKeyUp(event: KeyboardEvent): void {
    if (!this.enabled) return;
    
    this._keyStates.delete(event.code);
    
    this._emitEvent('keyUp', { event, code: event.code });
  }

  private _onContextMenu(event: Event): void {
    if (!this.enabled) return;
    
    event.preventDefault();
  }

  /**
   * Actualizar controles de teclado
   */
  private _updateKeyboardControls(): void {
    if (!this._config.enableKeys) return;
    
    const speed = 0.01;
    
    if (this._keyStates.has('KeyW')) this._moveForward(speed);
    if (this._keyStates.has('KeyS')) this._moveForward(-speed);
    if (this._keyStates.has('KeyA')) this._moveRight(-speed);
    if (this._keyStates.has('KeyD')) this._moveRight(speed);
    if (this._keyStates.has('KeyQ')) this._moveUp(speed);
    if (this._keyStates.has('KeyE')) this._moveUp(-speed);
  }

  /**
   * Movimientos de cámara
   */
  private _moveForward(distance: number): void {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this._camera.quaternion);
    this._camera.position.add(direction.multiplyScalar(distance));
    this._target.add(direction);
  }

  private _moveRight(distance: number): void {
    const direction = new THREE.Vector3(1, 0, 0);
    direction.applyQuaternion(this._camera.quaternion);
    this._camera.position.add(direction.multiplyScalar(distance));
    this._target.add(direction);
  }

  private _moveUp(distance: number): void {
    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyQuaternion(this._camera.quaternion);
    this._camera.position.add(direction.multiplyScalar(distance));
    this._target.add(direction);
  }

  /**
   * Aplicar suavizado
   */
  private _applyDamping(): void {
    this._dampingSpherical.theta += (this._sphericalDelta.theta - this._dampingSpherical.theta) * this._config.dampingFactor;
    this._dampingSpherical.phi += (this._sphericalDelta.phi - this._dampingSpherical.phi) * this._config.dampingFactor;
    this._dampingSpherical.radius += (this._spherical.radius - this._dampingSpherical.radius) * this._config.dampingFactor;
    
    this._sphericalDelta.theta = this._dampingSpherical.theta;
    this._sphericalDelta.phi = this._dampingSpherical.phi;
    this._spherical.radius = this._dampingSpherical.radius;
  }

  /**
   * Actualizar cámara
   */
  private _updateCamera(): void {
    // Aplicar cambios esféricos
    this._spherical.theta += this._sphericalDelta.theta;
    this._spherical.phi += this._sphericalDelta.phi;
    this._spherical.radius *= this._scale;
    
    // Aplicar límites
    this._spherical.radius = Math.max(
      this._config.minDistance,
      Math.min(this._config.maxDistance, this._spherical.radius)
    );
    this._spherical.phi = Math.max(
      this._config.minPolarAngle,
      Math.min(this._config.maxPolarAngle, this._spherical.phi)
    );
    this._spherical.theta = Math.max(
      this._config.minAzimuthAngle,
      Math.min(this._config.maxAzimuthAngle, this._spherical.theta)
    );
    
    // Calcular posición de la cámara
    const position = new THREE.Vector3();
    position.setFromSpherical(this._spherical);
    position.add(this._target);
    position.add(this._panOffset);
    
    this._camera.position.copy(position);
    this._camera.lookAt(this._target);
    
    // Resetear deltas
    this._sphericalDelta.set(0, 0, 0);
    this._scale = 1;
    this._panOffset.set(0, 0, 0);
  }

  /**
   * Actualizar coordenadas esféricas
   */
  private _updateSpherical(): void {
    const offset = this._camera.position.clone().sub(this._target);
    this._spherical.setFromVector3(offset);
  }

  /**
   * Verificar disponibilidad de VR
   */
  private _isVRAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'xr' in navigator;
  }

  /**
   * Configurar VR
   */
  private async _setupVR(): Promise<void> {
    if (!this._isVRAvailable()) return;
    
    try {
      const xr = (navigator as any).xr;
      const isSupported = await xr.isSessionSupported('immersive-vr');
      
      if (isSupported) {
        console.log('[CameraHelper] VR soportado');
      }
    } catch (error) {
      console.warn('[CameraHelper] VR no disponible:', error);
    }
  }

  /**
   * Actualizar VR
   */
  private _updateVR(): void {
    // Implementación de actualización VR
    // Esto se implementaría con WebXR API
  }

  /**
   * Emitir evento
   */
  private _emitEvent(event: string, data: any): void {
    const callback = this.events.get(event);
    if (callback) {
      try {
        callback(data);
      } catch (error) {
        console.error(`[CameraHelper] Error en evento ${event}:`, error);
      }
    }
  }
} 