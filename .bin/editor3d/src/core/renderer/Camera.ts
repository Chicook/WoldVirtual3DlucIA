/**
 * Camera - 3D Camera System
 * 
 * Advanced camera system with multiple projection types, controls,
 * and frustum culling for 3D rendering.
 */

import { Vector3, Matrix4, Quaternion } from '../scene/math';
import { BoundingSphere } from '../scene/geometry';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

// Camera events
export interface CameraEvents {
  'position:changed': { camera: Camera; position: Vector3 };
  'rotation:changed': { camera: Camera; rotation: Quaternion };
  'projection:changed': { camera: Camera; type: CameraType };
  'fov:changed': { camera: Camera; fov: number };
  'near:changed': { camera: Camera; near: number };
  'far:changed': { camera: Camera; far: number };
}

// Camera types
export type CameraType = 'perspective' | 'orthographic' | 'fisheye' | 'cubemap';

// Camera controls
export type CameraControl = 'orbit' | 'fly' | 'first-person' | 'trackball';

/**
 * Camera Frustum for culling
 */
export class CameraFrustum {
  public planes: Vector3[] = [];
  public corners: Vector3[] = [];

  constructor() {
    // Initialize 6 frustum planes (near, far, left, right, top, bottom)
    for (let i = 0; i < 6; i++) {
      this.planes.push(new Vector3());
    }
    
    // Initialize 8 frustum corners
    for (let i = 0; i < 8; i++) {
      this.corners.push(new Vector3());
    }
  }

  /**
   * Updates frustum from view-projection matrix
   */
  updateFromMatrix(viewProjection: Matrix4): void {
    const m = viewProjection;
    
    // Extract frustum planes
    // Left plane
    this.planes[0].set(m.m14 + m.m11, m.m24 + m.m21, m.m34 + m.m31);
    this.planes[0].normalize();
    
    // Right plane
    this.planes[1].set(m.m14 - m.m11, m.m24 - m.m21, m.m34 - m.m31);
    this.planes[1].normalize();
    
    // Bottom plane
    this.planes[2].set(m.m14 + m.m12, m.m24 + m.m22, m.m34 + m.m32);
    this.planes[2].normalize();
    
    // Top plane
    this.planes[3].set(m.m14 - m.m12, m.m24 - m.m22, m.m34 - m.m32);
    this.planes[3].normalize();
    
    // Near plane
    this.planes[4].set(m.m14 + m.m13, m.m24 + m.m23, m.m34 + m.m33);
    this.planes[4].normalize();
    
    // Far plane
    this.planes[5].set(m.m14 - m.m13, m.m24 - m.m23, m.m34 - m.m33);
    this.planes[5].normalize();
  }

  /**
   * Checks if a sphere intersects with the frustum
   */
  intersectsSphere(sphere: BoundingSphere): boolean {
    for (let i = 0; i < 6; i++) {
      const plane = this.planes[i];
      const distance = plane.dot(sphere.center) + sphere.radius;
      
      if (distance < 0) {
        return false; // Sphere is completely outside frustum
      }
    }
    return true;
  }

  /**
   * Checks if a box intersects with the frustum
   */
  intersectsBox(box: any): boolean {
    // Simplified box-frustum intersection
    // In a real implementation, this would be more sophisticated
    return true;
  }
}

/**
 * Camera class with advanced features
 */
export class Camera {
  // Basic properties
  public readonly id: string;
  public name: string;
  public readonly eventEmitter: EventEmitter<CameraEvents>;
  public readonly logger: Logger;

  // Transform
  public position: Vector3 = new Vector3(0, 0, 5);
  public rotation: Quaternion = new Quaternion();
  public scale: Vector3 = new Vector3(1, 1, 1);

  // Projection
  public type: CameraType = 'perspective';
  public fov: number = 75; // Field of view in degrees
  public aspect: number = 16 / 9;
  public near: number = 0.1;
  public far: number = 1000;

  // Orthographic specific
  public left: number = -1;
  public right: number = 1;
  public top: number = 1;
  public bottom: number = -1;

  // Matrices
  public viewMatrix: Matrix4 = new Matrix4();
  public projectionMatrix: Matrix4 = new Matrix4();
  public viewProjectionMatrix: Matrix4 = new Matrix4();

  // Frustum
  public frustum: CameraFrustum = new CameraFrustum();

  // Controls
  public control: CameraControl = 'orbit';
  public target: Vector3 = new Vector3(0, 0, 0);
  public distance: number = 5;
  public minDistance: number = 0.1;
  public maxDistance: number = 1000;

  // Performance
  public cullingEnabled: boolean = true;
  public lodEnabled: boolean = true;

  // Metadata
  public tags: Set<string> = new Set();
  public userData: Map<string, any> = new Map();

  constructor(
    id: string,
    name: string = '',
    eventEmitter?: EventEmitter<CameraEvents>,
    logger?: Logger
  ) {
    this.id = id;
    this.name = name || `Camera_${id}`;
    this.eventEmitter = eventEmitter || new EventEmitter<CameraEvents>();
    this.logger = logger || new Logger('Camera');

    this.updateMatrices();
  }

  // ===== TRANSFORM METHODS =====

  /**
   * Sets the camera position
   */
  setPosition(position: Vector3): this {
    this.position.copy(position);
    this.updateViewMatrix();
    this.eventEmitter.emit('position:changed', { camera: this, position: this.position.clone() });
    return this;
  }

  /**
   * Sets the camera rotation
   */
  setRotation(rotation: Quaternion): this {
    this.rotation.copy(rotation);
    this.updateViewMatrix();
    this.eventEmitter.emit('rotation:changed', { camera: this, rotation: this.rotation.clone() });
    return this;
  }

  /**
   * Looks at a target point
   */
  lookAt(target: Vector3): this {
    const direction = target.clone().sub(this.position).normalize();
    const up = new Vector3(0, 1, 0);
    
    // Create rotation matrix from direction
    const z = direction.clone().negate();
    const x = up.clone().cross(z).normalize();
    const y = z.clone().cross(x);
    
    const rotationMatrix = new Matrix4(
      x.x, y.x, z.x, 0,
      x.y, y.y, z.y, 0,
      x.z, y.z, z.z, 0,
      0, 0, 0, 1
    );
    
    this.rotation.setFromRotationMatrix(rotationMatrix);
    this.updateViewMatrix();
    
    return this;
  }

  /**
   * Moves the camera by a vector
   */
  translate(offset: Vector3): this {
    this.position.add(offset);
    this.updateViewMatrix();
    this.eventEmitter.emit('position:changed', { camera: this, position: this.position.clone() });
    return this;
  }

  /**
   * Rotates the camera by a quaternion
   */
  rotate(rotation: Quaternion): this {
    this.rotation.multiply(rotation);
    this.updateViewMatrix();
    this.eventEmitter.emit('rotation:changed', { camera: this, rotation: this.rotation.clone() });
    return this;
  }

  // ===== PROJECTION METHODS =====

  /**
   * Sets the camera to perspective projection
   */
  setPerspective(fov: number, aspect: number, near: number, far: number): this {
    this.type = 'perspective';
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    
    this.updateProjectionMatrix();
    this.eventEmitter.emit('projection:changed', { camera: this, type: this.type });
    this.eventEmitter.emit('fov:changed', { camera: this, fov: this.fov });
    this.eventEmitter.emit('near:changed', { camera: this, near: this.near });
    this.eventEmitter.emit('far:changed', { camera: this, far: this.far });
    
    return this;
  }

  /**
   * Sets the camera to orthographic projection
   */
  setOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): this {
    this.type = 'orthographic';
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
    
    this.updateProjectionMatrix();
    this.eventEmitter.emit('projection:changed', { camera: this, type: this.type });
    this.eventEmitter.emit('near:changed', { camera: this, near: this.near });
    this.eventEmitter.emit('far:changed', { camera: this, far: this.far });
    
    return this;
  }

  /**
   * Sets the field of view
   */
  setFOV(fov: number): this {
    this.fov = fov;
    this.updateProjectionMatrix();
    this.eventEmitter.emit('fov:changed', { camera: this, fov: this.fov });
    return this;
  }

  /**
   * Sets the near and far clipping planes
   */
  setClippingPlanes(near: number, far: number): this {
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
    this.eventEmitter.emit('near:changed', { camera: this, near: this.near });
    this.eventEmitter.emit('far:changed', { camera: this, far: this.far });
    return this;
  }

  // ===== MATRIX UPDATES =====

  /**
   * Updates the view matrix
   */
  updateViewMatrix(): void {
    this.viewMatrix.compose(this.position, this.rotation, this.scale).invert();
    this.updateViewProjectionMatrix();
  }

  /**
   * Updates the projection matrix
   */
  updateProjectionMatrix(): void {
    if (this.type === 'perspective') {
      this.projectionMatrix.makePerspective(this.fov, this.aspect, this.near, this.far);
    } else if (this.type === 'orthographic') {
      this.projectionMatrix.makeOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
    }
    
    this.updateViewProjectionMatrix();
  }

  /**
   * Updates the view-projection matrix
   */
  updateViewProjectionMatrix(): void {
    this.viewProjectionMatrix.copy(this.projectionMatrix).multiply(this.viewMatrix);
    this.frustum.updateFromMatrix(this.viewProjectionMatrix);
  }

  /**
   * Updates all matrices
   */
  updateMatrices(): void {
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }

  // ===== CAMERA CONTROLS =====

  /**
   * Sets the camera control type
   */
  setControl(control: CameraControl): this {
    this.control = control;
    this.logger.debug(`Camera control set to: ${control}`);
    return this;
  }

  /**
   * Sets the orbit target
   */
  setTarget(target: Vector3): this {
    this.target.copy(target);
    return this;
  }

  /**
   * Sets the orbit distance
   */
  setDistance(distance: number): this {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
    return this;
  }

  /**
   * Orbits around the target
   */
  orbit(deltaX: number, deltaY: number): this {
    if (this.control !== 'orbit') return this;

    // Convert to radians
    const phi = deltaX * 0.01;
    const theta = deltaY * 0.01;

    // Calculate new position
    const offset = this.position.clone().sub(this.target);
    const radius = offset.length();

    // Apply rotation
    const rotationX = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), phi);
    const rotationY = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), theta);
    
    offset.applyQuaternion(rotationX).applyQuaternion(rotationY);
    offset.normalize().multiplyScalar(radius);

    this.position.copy(this.target).add(offset);
    this.lookAt(this.target);

    return this;
  }

  /**
   * Zooms the camera
   */
  zoom(delta: number): this {
    if (this.control === 'orbit') {
      this.setDistance(this.distance - delta * 0.1);
      const direction = this.position.clone().sub(this.target).normalize();
      this.position.copy(this.target).add(direction.multiplyScalar(this.distance));
    } else {
      // For other control types, move forward/backward
      const direction = this.getForwardDirection();
      this.translate(direction.multiplyScalar(delta * 0.1));
    }

    return this;
  }

  /**
   * Pans the camera
   */
  pan(deltaX: number, deltaY: number): this {
    const right = this.getRightDirection();
    const up = this.getUpDirection();
    
    const panX = right.multiplyScalar(-deltaX * 0.01);
    const panY = up.multiplyScalar(deltaY * 0.01);
    
    this.translate(panX.add(panY));
    
    if (this.control === 'orbit') {
      this.target.add(panX.add(panY));
    }

    return this;
  }

  // ===== DIRECTION VECTORS =====

  /**
   * Gets the forward direction vector
   */
  getForwardDirection(): Vector3 {
    return new Vector3(0, 0, -1).applyQuaternion(this.rotation);
  }

  /**
   * Gets the right direction vector
   */
  getRightDirection(): Vector3 {
    return new Vector3(1, 0, 0).applyQuaternion(this.rotation);
  }

  /**
   * Gets the up direction vector
   */
  getUpDirection(): Vector3 {
    return new Vector3(0, 1, 0).applyQuaternion(this.rotation);
  }

  // ===== UTILITY METHODS =====

  /**
   * Gets the camera's world matrix
   */
  getWorldMatrix(): Matrix4 {
    return new Matrix4().compose(this.position, this.rotation, this.scale);
  }

  /**
   * Gets the camera's inverse world matrix
   */
  getWorldMatrixInverse(): Matrix4 {
    return this.getWorldMatrix().invert();
  }

  /**
   * Checks if a point is visible to the camera
   */
  isPointVisible(point: Vector3): boolean {
    if (!this.cullingEnabled) return true;
    
    // Transform point to clip space
    const clipPos = this.viewProjectionMatrix.transformPoint(point);
    
    // Check if point is in clip space bounds
    return Math.abs(clipPos.x) <= Math.abs(clipPos.w) &&
           Math.abs(clipPos.y) <= Math.abs(clipPos.w) &&
           Math.abs(clipPos.z) <= Math.abs(clipPos.w) &&
           clipPos.w > 0;
  }

  /**
   * Gets the camera's frustum
   */
  getFrustum(): CameraFrustum {
    return this.frustum;
  }

  /**
   * Clones the camera
   */
  clone(): Camera {
    const cloned = new Camera(this.id, this.name, this.eventEmitter, this.logger);
    
    cloned.position.copy(this.position);
    cloned.rotation.copy(this.rotation);
    cloned.scale.copy(this.scale);
    
    cloned.type = this.type;
    cloned.fov = this.fov;
    cloned.aspect = this.aspect;
    cloned.near = this.near;
    cloned.far = this.far;
    
    cloned.left = this.left;
    cloned.right = this.right;
    cloned.top = this.top;
    cloned.bottom = this.bottom;
    
    cloned.control = this.control;
    cloned.target.copy(this.target);
    cloned.distance = this.distance;
    cloned.minDistance = this.minDistance;
    cloned.maxDistance = this.maxDistance;
    
    cloned.cullingEnabled = this.cullingEnabled;
    cloned.lodEnabled = this.lodEnabled;
    
    // Clone tags
    for (const tag of this.tags) {
      cloned.tags.add(tag);
    }
    
    // Clone user data
    for (const [key, value] of this.userData) {
      cloned.userData.set(key, value);
    }
    
    cloned.updateMatrices();
    
    return cloned;
  }

  /**
   * Disposes the camera
   */
  dispose(): void {
    this.logger.debug(`Camera '${this.name}' disposed`);
  }

  /**
   * Gets a string representation of the camera
   */
  toString(): string {
    return `Camera(${this.name}, type: ${this.type}, position: ${this.position.toString()})`;
  }
} 