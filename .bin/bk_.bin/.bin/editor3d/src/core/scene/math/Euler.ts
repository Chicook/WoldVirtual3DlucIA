/**
 * Euler - 3D Euler Angles
 * 
 * Represents 3D rotations using Euler angles with different rotation orders.
 */

export type EulerOrder = 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';

export class Euler {
  public x: number;
  public y: number;
  public z: number;
  public order: EulerOrder;

  constructor(x: number = 0, y: number = 0, z: number = 0, order: EulerOrder = 'XYZ') {
    this.x = x;
    this.y = y;
    this.z = z;
    this.order = order;
  }

  // ===== BASIC OPERATIONS =====

  /**
   * Sets the Euler angles
   */
  set(x: number, y: number, z: number, order: EulerOrder = this.order): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.order = order;
    return this;
  }

  /**
   * Copies values from another Euler
   */
  copy(euler: Euler): this {
    this.x = euler.x;
    this.y = euler.y;
    this.z = euler.z;
    this.order = euler.order;
    return this;
  }

  /**
   * Creates a clone of this Euler
   */
  clone(): Euler {
    return new Euler(this.x, this.y, this.z, this.order);
  }

  /**
   * Sets the Euler to zero
   */
  setZero(): this {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  // ===== EULER OPERATIONS =====

  /**
   * Adds another Euler to this one
   */
  add(euler: Euler): this {
    this.x += euler.x;
    this.y += euler.y;
    this.z += euler.z;
    return this;
  }

  /**
   * Subtracts another Euler from this one
   */
  sub(euler: Euler): this {
    this.x -= euler.x;
    this.y -= euler.y;
    this.z -= euler.z;
    return this;
  }

  /**
   * Multiplies this Euler by a scalar
   */
  multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  /**
   * Divides this Euler by a scalar
   */
  divideScalar(scalar: number): this {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
      this.z /= scalar;
    }
    return this;
  }

  /**
   * Negates the Euler angles
   */
  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  // ===== NORMALIZATION =====

  /**
   * Normalizes the Euler angles to the range [0, 2π]
   */
  normalize(): this {
    this.x = this.normalizeAngle(this.x);
    this.y = this.normalizeAngle(this.y);
    this.z = this.normalizeAngle(this.z);
    return this;
  }

  /**
   * Normalizes a single angle to the range [0, 2π]
   */
  private normalizeAngle(angle: number): number {
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    return angle;
  }

  /**
   * Normalizes the Euler angles to the range [-π, π]
   */
  normalizeToPi(): this {
    this.x = this.normalizeAngleToPi(this.x);
    this.y = this.normalizeAngleToPi(this.y);
    this.z = this.normalizeAngleToPi(this.z);
    return this;
  }

  /**
   * Normalizes a single angle to the range [-π, π]
   */
  private normalizeAngleToPi(angle: number): number {
    while (angle > Math.PI) {
      angle -= 2 * Math.PI;
    }
    while (angle <= -Math.PI) {
      angle += 2 * Math.PI;
    }
    return angle;
  }

  // ===== CONVERSION OPERATIONS =====

  /**
   * Sets the Euler from a quaternion
   */
  setFromQuaternion(q: any): this {
    // This would require the Quaternion class to be imported
    // For now, we'll leave this as a placeholder
    throw new Error('setFromQuaternion not implemented - requires Quaternion class');
  }

  /**
   * Sets the Euler from a rotation matrix
   */
  setFromRotationMatrix(m: any): this {
    // This would require the Matrix4 class to be imported
    // For now, we'll leave this as a placeholder
    throw new Error('setFromRotationMatrix not implemented - requires Matrix4 class');
  }

  /**
   * Sets the Euler from a direction vector
   */
  setFromDirection(direction: any): this {
    // This would require the Vector3 class to be imported
    // For now, we'll leave this as a placeholder
    throw new Error('setFromDirection not implemented - requires Vector3 class');
  }

  // ===== INTERPOLATION =====

  /**
   * Linear interpolation with another Euler
   */
  lerp(euler: Euler, alpha: number): this {
    this.x += (euler.x - this.x) * alpha;
    this.y += (euler.y - this.y) * alpha;
    this.z += (euler.z - this.z) * alpha;
    return this;
  }

  /**
   * Spherical linear interpolation with another Euler
   */
  slerp(euler: Euler, alpha: number): this {
    // Convert to quaternions, slerp, then convert back
    // This is a simplified version - in practice, you'd want to use quaternions
    return this.lerp(euler, alpha);
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Checks if this Euler equals another Euler
   */
  equals(euler: Euler): boolean {
    return this.x === euler.x && this.y === euler.y && this.z === euler.z && this.order === euler.order;
  }

  /**
   * Checks if this Euler approximately equals another Euler
   */
  approximatelyEquals(euler: Euler, epsilon: number = 1e-6): boolean {
    return Math.abs(this.x - euler.x) < epsilon &&
           Math.abs(this.y - euler.y) < epsilon &&
           Math.abs(this.z - euler.z) < epsilon &&
           this.order === euler.order;
  }

  /**
   * Checks if the Euler angles are zero
   */
  isZero(): boolean {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  /**
   * Gets the magnitude of the Euler angles
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Gets the squared magnitude of the Euler angles
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  // ===== ARRAY OPERATIONS =====

  /**
   * Sets the Euler from an array
   */
  fromArray(array: number[], offset: number = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }

  /**
   * Converts the Euler to an array
   */
  toArray(array: number[] = [], offset: number = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }

  /**
   * Converts the Euler to a Float32Array
   */
  toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
  }

  // ===== STATIC METHODS =====

  /**
   * Creates an Euler from an array
   */
  static fromArray(array: number[], offset: number = 0, order: EulerOrder = 'XYZ'): Euler {
    return new Euler(array[offset], array[offset + 1], array[offset + 2], order);
  }

  /**
   * Creates a random Euler
   */
  static random(order: EulerOrder = 'XYZ'): Euler {
    return new Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      order
    );
  }

  /**
   * Creates an Euler from degrees
   */
  static fromDegrees(x: number, y: number, z: number, order: EulerOrder = 'XYZ'): Euler {
    return new Euler(
      x * Math.PI / 180,
      y * Math.PI / 180,
      z * Math.PI / 180,
      order
    );
  }

  // ===== CONSTANTS =====

  static readonly ZERO = new Euler(0, 0, 0);
  static readonly HALF_PI = new Euler(Math.PI / 2, 0, 0);
  static readonly PI = new Euler(Math.PI, 0, 0);
  static readonly TWO_PI = new Euler(Math.PI * 2, 0, 0);

  // ===== SERIALIZATION =====

  /**
   * Converts the Euler to a plain object
   */
  toJSON(): { x: number; y: number; z: number; order: EulerOrder } {
    return { x: this.x, y: this.y, z: this.z, order: this.order };
  }

  /**
   * Creates an Euler from a plain object
   */
  static fromJSON(json: { x: number; y: number; z: number; order: EulerOrder }): Euler {
    return new Euler(json.x, json.y, json.z, json.order);
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of the Euler
   */
  toString(): string {
    return `Euler(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)}, ${this.order})`;
  }

  /**
   * Gets a string representation in degrees
   */
  toStringDegrees(): string {
    const xDeg = this.x * 180 / Math.PI;
    const yDeg = this.y * 180 / Math.PI;
    const zDeg = this.z * 180 / Math.PI;
    return `Euler(${xDeg.toFixed(1)}°, ${yDeg.toFixed(1)}°, ${zDeg.toFixed(1)}°, ${this.order})`;
  }
} 