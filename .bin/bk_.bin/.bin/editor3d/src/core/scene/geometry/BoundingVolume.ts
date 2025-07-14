/**
 * Bounding Volumes - 3D Geometry Bounds
 * 
 * Bounding box and sphere implementations for culling and collision detection.
 */

import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';

/**
 * Axis-Aligned Bounding Box (AABB)
 */
export class BoundingBox {
  public min: Vector3;
  public max: Vector3;

  constructor(min: Vector3 = new Vector3(), max: Vector3 = new Vector3()) {
    this.min = min.clone();
    this.max = max.clone();
  }

  // ===== BASIC OPERATIONS =====

  /**
   * Sets the bounding box from min and max points
   */
  set(min: Vector3, max: Vector3): this {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }

  /**
   * Sets the bounding box from center and size
   */
  setFromCenterAndSize(center: Vector3, size: Vector3): this {
    const halfSize = size.clone().multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).add(halfSize);
    return this;
  }

  /**
   * Copies values from another bounding box
   */
  copy(box: BoundingBox): this {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }

  /**
   * Creates a clone of this bounding box
   */
  clone(): BoundingBox {
    return new BoundingBox(this.min, this.max);
  }

  /**
   * Makes the bounding box empty
   */
  makeEmpty(): this {
    this.min.set(Infinity, Infinity, Infinity);
    this.max.set(-Infinity, -Infinity, -Infinity);
    return this;
  }

  /**
   * Checks if the bounding box is empty
   */
  isEmpty(): boolean {
    return this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z;
  }

  // ===== GEOMETRIC OPERATIONS =====

  /**
   * Gets the center of the bounding box
   */
  getCenter(): Vector3 {
    return this.min.clone().add(this.max).multiplyScalar(0.5);
  }

  /**
   * Gets the size of the bounding box
   */
  getSize(): Vector3 {
    return this.max.clone().sub(this.min);
  }

  /**
   * Gets the radius of the bounding sphere that contains this box
   */
  getBoundingSphereRadius(): number {
    return this.getSize().length() * 0.5;
  }

  /**
   * Gets the volume of the bounding box
   */
  getVolume(): number {
    const size = this.getSize();
    return size.x * size.y * size.z;
  }

  /**
   * Gets the surface area of the bounding box
   */
  getSurfaceArea(): number {
    const size = this.getSize();
    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }

  /**
   * Gets the diagonal length of the bounding box
   */
  getDiagonalLength(): number {
    return this.min.distanceTo(this.max);
  }

  // ===== EXPANSION OPERATIONS =====

  /**
   * Expands the bounding box to include a point
   */
  expandByPoint(point: Vector3): this {
    this.min.min(point);
    this.max.max(point);
    return this;
  }

  /**
   * Expands the bounding box by a scalar
   */
  expandByScalar(scalar: number): this {
    this.min.sub(new Vector3(scalar, scalar, scalar));
    this.max.add(new Vector3(scalar, scalar, scalar));
    return this;
  }

  /**
   * Expands the bounding box by a vector
   */
  expandByVector(vector: Vector3): this {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  }

  /**
   * Expands the bounding box to include another bounding box
   */
  expandByBox(box: BoundingBox): this {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  }

  /**
   * Expands the bounding box to include a sphere
   */
  expandBySphere(sphere: BoundingSphere): this {
    this.min.min(sphere.center.clone().sub(new Vector3(sphere.radius, sphere.radius, sphere.radius)));
    this.max.max(sphere.center.clone().add(new Vector3(sphere.radius, sphere.radius, sphere.radius)));
    return this;
  }

  // ===== TRANSFORMATION OPERATIONS =====

  /**
   * Applies a transformation matrix to this bounding box
   */
  applyMatrix4(matrix: Matrix4): this {
    const points = [
      new Vector3(this.min.x, this.min.y, this.min.z),
      new Vector3(this.min.x, this.min.y, this.max.z),
      new Vector3(this.min.x, this.max.y, this.min.z),
      new Vector3(this.min.x, this.max.y, this.max.z),
      new Vector3(this.max.x, this.min.y, this.min.z),
      new Vector3(this.max.x, this.min.y, this.max.z),
      new Vector3(this.max.x, this.max.y, this.min.z),
      new Vector3(this.max.x, this.max.y, this.max.z)
    ];

    this.makeEmpty();
    for (const point of points) {
      this.expandByPoint(matrix.transformPoint(point));
    }

    return this;
  }

  /**
   * Translates the bounding box by a vector
   */
  translate(offset: Vector3): this {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  }

  /**
   * Scales the bounding box by a scalar
   */
  scale(scalar: number): this {
    this.min.multiplyScalar(scalar);
    this.max.multiplyScalar(scalar);
    return this;
  }

  // ===== INTERSECTION TESTS =====

  /**
   * Checks if this bounding box intersects with another bounding box
   */
  intersectsBox(box: BoundingBox): boolean {
    return this.min.x <= box.max.x && this.max.x >= box.min.x &&
           this.min.y <= box.max.y && this.max.y >= box.min.y &&
           this.min.z <= box.max.z && this.max.z >= box.min.z;
  }

  /**
   * Checks if this bounding box intersects with a sphere
   */
  intersectsSphere(sphere: BoundingSphere): boolean {
    const closest = this.clampPoint(sphere.center);
    return closest.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
  }

  /**
   * Checks if this bounding box contains a point
   */
  containsPoint(point: Vector3): boolean {
    return point.x >= this.min.x && point.x <= this.max.x &&
           point.y >= this.min.y && point.y <= this.max.y &&
           point.z >= this.min.z && point.z <= this.max.z;
  }

  /**
   * Checks if this bounding box contains another bounding box
   */
  containsBox(box: BoundingBox): boolean {
    return this.min.x <= box.min.x && this.max.x >= box.max.x &&
           this.min.y <= box.min.y && this.max.y >= box.max.y &&
           this.min.z <= box.min.z && this.max.z >= box.max.z;
  }

  /**
   * Checks if this bounding box contains a sphere
   */
  containsSphere(sphere: BoundingSphere): boolean {
    const closest = this.clampPoint(sphere.center);
    return closest.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
  }

  /**
   * Clamps a point to the bounds of this box
   */
  clampPoint(point: Vector3): Vector3 {
    return new Vector3(
      Math.max(this.min.x, Math.min(this.max.x, point.x)),
      Math.max(this.min.y, Math.min(this.max.y, point.y)),
      Math.max(this.min.z, Math.min(this.max.z, point.z))
    );
  }

  /**
   * Gets the distance from a point to this bounding box
   */
  distanceToPoint(point: Vector3): number {
    const clamped = this.clampPoint(point);
    return clamped.distanceTo(point);
  }

  // ===== STATIC METHODS =====

  /**
   * Creates a bounding box from points
   */
  static fromPoints(points: Vector3[]): BoundingBox {
    const box = new BoundingBox();
    box.makeEmpty();
    for (const point of points) {
      box.expandByPoint(point);
    }
    return box;
  }

  /**
   * Creates a bounding box from center and size
   */
  static fromCenterAndSize(center: Vector3, size: Vector3): BoundingBox {
    return new BoundingBox().setFromCenterAndSize(center, size);
  }

  /**
   * Creates a bounding box from a sphere
   */
  static fromSphere(sphere: BoundingSphere): BoundingBox {
    const box = new BoundingBox();
    box.min.copy(sphere.center).sub(new Vector3(sphere.radius, sphere.radius, sphere.radius));
    box.max.copy(sphere.center).add(new Vector3(sphere.radius, sphere.radius, sphere.radius));
    return box;
  }

  /**
   * Creates a bounding box from multiple bounding boxes
   */
  static fromBoxes(boxes: BoundingBox[]): BoundingBox {
    const result = new BoundingBox();
    result.makeEmpty();
    for (const box of boxes) {
      result.expandByBox(box);
    }
    return result;
  }

  // ===== SERIALIZATION =====

  /**
   * Converts the bounding box to a plain object
   */
  toJSON(): { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } {
    return {
      min: this.min.toJSON(),
      max: this.max.toJSON()
    };
  }

  /**
   * Creates a bounding box from a plain object
   */
  static fromJSON(json: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }): BoundingBox {
    return new BoundingBox(
      Vector3.fromJSON(json.min),
      Vector3.fromJSON(json.max)
    );
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of the bounding box
   */
  toString(): string {
    return `BoundingBox(min: ${this.min.toString()}, max: ${this.max.toString()})`;
  }
}

/**
 * Bounding Sphere
 */
export class BoundingSphere {
  public center: Vector3;
  public radius: number;

  constructor(center: Vector3 = new Vector3(), radius: number = 0) {
    this.center = center.clone();
    this.radius = radius;
  }

  // ===== BASIC OPERATIONS =====

  /**
   * Sets the bounding sphere from center and radius
   */
  set(center: Vector3, radius: number): this {
    this.center.copy(center);
    this.radius = radius;
    return this;
  }

  /**
   * Copies values from another bounding sphere
   */
  copy(sphere: BoundingSphere): this {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;
    return this;
  }

  /**
   * Creates a clone of this bounding sphere
   */
  clone(): BoundingSphere {
    return new BoundingSphere(this.center, this.radius);
  }

  /**
   * Makes the bounding sphere empty
   */
  makeEmpty(): this {
    this.center.setZero();
    this.radius = -1;
    return this;
  }

  /**
   * Checks if the bounding sphere is empty
   */
  isEmpty(): boolean {
    return this.radius < 0;
  }

  // ===== GEOMETRIC OPERATIONS =====

  /**
   * Gets the volume of the bounding sphere
   */
  getVolume(): number {
    return (4 / 3) * Math.PI * this.radius * this.radius * this.radius;
  }

  /**
   * Gets the surface area of the bounding sphere
   */
  getSurfaceArea(): number {
    return 4 * Math.PI * this.radius * this.radius;
  }

  // ===== EXPANSION OPERATIONS =====

  /**
   * Expands the bounding sphere to include a point
   */
  expandByPoint(point: Vector3): this {
    const deltaLengthSq = this.center.distanceToSquared(point);
    if (deltaLengthSq > this.radius * this.radius) {
      const deltaLength = Math.sqrt(deltaLengthSq);
      const newRadius = (this.radius + deltaLength) * 0.5;
      const scale = newRadius / deltaLength;
      this.center.lerp(point, scale);
      this.radius = newRadius;
    }
    return this;
  }

  /**
   * Expands the bounding sphere by a scalar
   */
  expandByScalar(scalar: number): this {
    this.radius += scalar;
    if (this.radius < 0) {
      this.radius = 0;
    }
    return this;
  }

  /**
   * Expands the bounding sphere to include another sphere
   */
  expandBySphere(sphere: BoundingSphere): this {
    const delta = sphere.center.clone().sub(this.center);
    const lengthSq = delta.lengthSq();
    const radiusDiff = sphere.radius - this.radius;

    if (radiusDiff * radiusDiff >= lengthSq) {
      if (radiusDiff > 0) {
        this.copy(sphere);
      }
    } else {
      const length = Math.sqrt(lengthSq);
      if (length > 0) {
        const newRadius = (length + this.radius + sphere.radius) * 0.5;
        const scale = (newRadius - this.radius) / length;
        this.center.add(delta.multiplyScalar(scale));
        this.radius = newRadius;
      }
    }

    return this;
  }

  /**
   * Expands the bounding sphere to include a bounding box
   */
  expandByBox(box: BoundingBox): this {
    const points = [
      new Vector3(box.min.x, box.min.y, box.min.z),
      new Vector3(box.min.x, box.min.y, box.max.z),
      new Vector3(box.min.x, box.max.y, box.min.z),
      new Vector3(box.min.x, box.max.y, box.max.z),
      new Vector3(box.max.x, box.min.y, box.min.z),
      new Vector3(box.max.x, box.min.y, box.max.z),
      new Vector3(box.max.x, box.max.y, box.min.z),
      new Vector3(box.max.x, box.max.y, box.max.z)
    ];

    for (const point of points) {
      this.expandByPoint(point);
    }

    return this;
  }

  // ===== TRANSFORMATION OPERATIONS =====

  /**
   * Applies a transformation matrix to this bounding sphere
   */
  applyMatrix4(matrix: Matrix4): this {
    this.center = matrix.transformPoint(this.center);
    const scale = matrix.getScale();
    const maxScale = Math.max(scale.x, scale.y, scale.z);
    this.radius *= maxScale;
    return this;
  }

  /**
   * Translates the bounding sphere by a vector
   */
  translate(offset: Vector3): this {
    this.center.add(offset);
    return this;
  }

  /**
   * Scales the bounding sphere by a scalar
   */
  scale(scalar: number): this {
    this.radius *= Math.abs(scalar);
    return this;
  }

  // ===== INTERSECTION TESTS =====

  /**
   * Checks if this bounding sphere intersects with another sphere
   */
  intersectsSphere(sphere: BoundingSphere): boolean {
    const radiusSum = this.radius + sphere.radius;
    return this.center.distanceToSquared(sphere.center) <= radiusSum * radiusSum;
  }

  /**
   * Checks if this bounding sphere intersects with a bounding box
   */
  intersectsBox(box: BoundingBox): boolean {
    const closest = box.clampPoint(this.center);
    return closest.distanceToSquared(this.center) <= this.radius * this.radius;
  }

  /**
   * Checks if this bounding sphere contains a point
   */
  containsPoint(point: Vector3): boolean {
    return this.center.distanceToSquared(point) <= this.radius * this.radius;
  }

  /**
   * Checks if this bounding sphere contains another sphere
   */
  containsSphere(sphere: BoundingSphere): boolean {
    const radiusDiff = this.radius - sphere.radius;
    return radiusDiff >= 0 && this.center.distanceToSquared(sphere.center) <= radiusDiff * radiusDiff;
  }

  /**
   * Checks if this bounding sphere contains a bounding box
   */
  containsBox(box: BoundingBox): boolean {
    const points = [
      new Vector3(box.min.x, box.min.y, box.min.z),
      new Vector3(box.min.x, box.min.y, box.max.z),
      new Vector3(box.min.x, box.max.y, box.min.z),
      new Vector3(box.min.x, box.max.y, box.max.z),
      new Vector3(box.max.x, box.min.y, box.min.z),
      new Vector3(box.max.x, box.min.y, box.max.z),
      new Vector3(box.max.x, box.max.y, box.min.z),
      new Vector3(box.max.x, box.max.y, box.max.z)
    ];

    for (const point of points) {
      if (!this.containsPoint(point)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the distance from a point to this bounding sphere
   */
  distanceToPoint(point: Vector3): number {
    return Math.max(0, this.center.distanceTo(point) - this.radius);
  }

  // ===== STATIC METHODS =====

  /**
   * Creates a bounding sphere from points
   */
  static fromPoints(points: Vector3[]): BoundingSphere {
    const sphere = new BoundingSphere();
    sphere.makeEmpty();
    for (const point of points) {
      sphere.expandByPoint(point);
    }
    return sphere;
  }

  /**
   * Creates a bounding sphere from a bounding box
   */
  static fromBoundingBox(box: BoundingBox): BoundingSphere {
    const sphere = new BoundingSphere();
    sphere.center.copy(box.getCenter());
    sphere.radius = box.getBoundingSphereRadius();
    return sphere;
  }

  /**
   * Creates a bounding sphere from multiple bounding spheres
   */
  static fromSpheres(spheres: BoundingSphere[]): BoundingSphere {
    const result = new BoundingSphere();
    result.makeEmpty();
    for (const sphere of spheres) {
      result.expandBySphere(sphere);
    }
    return result;
  }

  // ===== SERIALIZATION =====

  /**
   * Converts the bounding sphere to a plain object
   */
  toJSON(): { center: { x: number; y: number; z: number }; radius: number } {
    return {
      center: this.center.toJSON(),
      radius: this.radius
    };
  }

  /**
   * Creates a bounding sphere from a plain object
   */
  static fromJSON(json: { center: { x: number; y: number; z: number }; radius: number }): BoundingSphere {
    return new BoundingSphere(
      Vector3.fromJSON(json.center),
      json.radius
    );
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of the bounding sphere
   */
  toString(): string {
    return `BoundingSphere(center: ${this.center.toString()}, radius: ${this.radius.toFixed(3)})`;
  }
} 