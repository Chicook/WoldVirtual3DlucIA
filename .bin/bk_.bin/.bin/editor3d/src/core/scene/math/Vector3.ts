/**
 * Vector3 - 3D Vector Mathematics
 * 
 * High-performance 3D vector operations for the scene graph system.
 */

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // ===== BASIC OPERATIONS =====

  /**
   * Sets the vector components
   */
  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Copies values from another vector
   */
  copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * Creates a clone of this vector
   */
  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Adds another vector to this one
   */
  add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * Subtracts another vector from this one
   */
  sub(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Multiplies this vector by a scalar
   */
  multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  /**
   * Divides this vector by a scalar
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
   * Component-wise multiplication
   */
  multiply(v: Vector3): this {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  /**
   * Component-wise division
   */
  divide(v: Vector3): this {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }

  // ===== VECTOR OPERATIONS =====

  /**
   * Calculates the dot product with another vector
   */
  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Calculates the cross product with another vector
   */
  cross(v: Vector3): this {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Calculates the length (magnitude) of the vector
   */
  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Calculates the squared length of the vector
   */
  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Normalizes the vector (makes it unit length)
   */
  normalize(): this {
    const length = this.length();
    if (length > 0) {
      this.divideScalar(length);
    }
    return this;
  }

  /**
   * Calculates the distance to another vector
   */
  distanceTo(v: Vector3): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * Calculates the squared distance to another vector
   */
  distanceToSquared(v: Vector3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Calculates the Manhattan distance to another vector
   */
  manhattanDistanceTo(v: Vector3): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Sets the vector to zero
   */
  setZero(): this {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  /**
   * Sets the vector to one
   */
  setOne(): this {
    this.x = 1;
    this.y = 1;
    this.z = 1;
    return this;
  }

  /**
   * Sets the vector to unit X
   */
  setUnitX(): this {
    this.x = 1;
    this.y = 0;
    this.z = 0;
    return this;
  }

  /**
   * Sets the vector to unit Y
   */
  setUnitY(): this {
    this.x = 0;
    this.y = 1;
    this.z = 0;
    return this;
  }

  /**
   * Sets the vector to unit Z
   */
  setUnitZ(): this {
    this.x = 0;
    this.y = 0;
    this.z = 1;
    return this;
  }

  /**
   * Negates the vector
   */
  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Calculates the absolute value of each component
   */
  abs(): this {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    this.z = Math.abs(this.z);
    return this;
  }

  /**
   * Rounds each component to the nearest integer
   */
  round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  /**
   * Floors each component
   */
  floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  /**
   * Ceils each component
   */
  ceil(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  // ===== COMPARISON OPERATIONS =====

  /**
   * Checks if this vector equals another vector
   */
  equals(v: Vector3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  /**
   * Checks if this vector approximately equals another vector
   */
  approximatelyEquals(v: Vector3, epsilon: number = 1e-6): boolean {
    return Math.abs(this.x - v.x) < epsilon &&
           Math.abs(this.y - v.y) < epsilon &&
           Math.abs(this.z - v.z) < epsilon;
  }

  /**
   * Component-wise minimum with another vector
   */
  min(v: Vector3): this {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  /**
   * Component-wise maximum with another vector
   */
  max(v: Vector3): this {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  /**
   * Clamps each component between min and max values
   */
  clamp(min: Vector3, max: Vector3): this {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  }

  /**
   * Clamps the vector length between min and max values
   */
  clampLength(min: number, max: number): this {
    const length = this.length();
    if (length > 0) {
      const clampedLength = Math.max(min, Math.min(max, length));
      this.normalize().multiplyScalar(clampedLength);
    }
    return this;
  }

  // ===== INTERPOLATION =====

  /**
   * Linear interpolation with another vector
   */
  lerp(v: Vector3, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }

  /**
   * Spherical linear interpolation with another vector
   */
  slerp(v: Vector3, alpha: number): this {
    const dot = this.dot(v);
    const clampedDot = Math.max(-1, Math.min(1, dot));
    const theta = Math.acos(clampedDot);

    if (theta < 1e-6) {
      return this.lerp(v, alpha);
    }

    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - alpha) * theta) / sinTheta;
    const w2 = Math.sin(alpha * theta) / sinTheta;

    this.x = w1 * this.x + w2 * v.x;
    this.y = w1 * this.y + w2 * v.y;
    this.z = w1 * this.z + w2 * v.z;

    return this;
  }

  // ===== ANGLE OPERATIONS =====

  /**
   * Calculates the angle between this vector and another vector
   */
  angleTo(v: Vector3): number {
    const dot = this.dot(v);
    const clampedDot = Math.max(-1, Math.min(1, dot));
    return Math.acos(clampedDot);
  }

  /**
   * Calculates the signed angle between this vector and another vector around an axis
   */
  signedAngleTo(v: Vector3, axis: Vector3): number {
    const cross = this.clone().cross(v);
    const dot = this.dot(v);
    const angle = Math.atan2(cross.length(), dot);
    return cross.dot(axis) < 0 ? -angle : angle;
  }

  // ===== PROJECTION OPERATIONS =====

  /**
   * Projects this vector onto another vector
   */
  projectOnVector(v: Vector3): this {
    const denominator = v.lengthSq();
    if (denominator === 0) {
      return this.setZero();
    }
    const scalar = this.dot(v) / denominator;
    return this.copy(v).multiplyScalar(scalar);
  }

  /**
   * Projects this vector onto a plane defined by a normal
   */
  projectOnPlane(normal: Vector3): this {
    const projected = this.clone().projectOnVector(normal);
    return this.sub(projected);
  }

  /**
   * Reflects this vector off a surface with the given normal
   */
  reflect(normal: Vector3): this {
    const reflected = normal.clone().multiplyScalar(2 * this.dot(normal));
    return this.sub(reflected);
  }

  // ===== ARRAY OPERATIONS =====

  /**
   * Sets the vector from an array
   */
  fromArray(array: number[], offset: number = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }

  /**
   * Converts the vector to an array
   */
  toArray(array: number[] = [], offset: number = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }

  /**
   * Converts the vector to a Float32Array
   */
  toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
  }

  // ===== STATIC METHODS =====

  /**
   * Creates a vector from an array
   */
  static fromArray(array: number[], offset: number = 0): Vector3 {
    return new Vector3(array[offset], array[offset + 1], array[offset + 2]);
  }

  /**
   * Creates a vector from spherical coordinates
   */
  static fromSpherical(radius: number, phi: number, theta: number): Vector3 {
    const sinPhiRadius = radius * Math.sin(phi);
    return new Vector3(
      sinPhiRadius * Math.sin(theta),
      radius * Math.cos(phi),
      sinPhiRadius * Math.cos(theta)
    );
  }

  /**
   * Creates a vector from cylindrical coordinates
   */
  static fromCylindrical(radius: number, theta: number, y: number): Vector3 {
    return new Vector3(
      radius * Math.sin(theta),
      y,
      radius * Math.cos(theta)
    );
  }

  /**
   * Creates a random unit vector
   */
  static random(): Vector3 {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return Vector3.fromSpherical(1, phi, theta);
  }

  /**
   * Creates a random vector within a sphere
   */
  static randomInSphere(radius: number = 1): Vector3 {
    return Vector3.random().multiplyScalar(radius * Math.cbrt(Math.random()));
  }

  /**
   * Creates a random vector within a cube
   */
  static randomInCube(size: number = 1): Vector3 {
    return new Vector3(
      (Math.random() - 0.5) * size,
      (Math.random() - 0.5) * size,
      (Math.random() - 0.5) * size
    );
  }

  // ===== CONSTANTS =====

  static readonly ZERO = new Vector3(0, 0, 0);
  static readonly ONE = new Vector3(1, 1, 1);
  static readonly UNIT_X = new Vector3(1, 0, 0);
  static readonly UNIT_Y = new Vector3(0, 1, 0);
  static readonly UNIT_Z = new Vector3(0, 0, 1);
  static readonly UP = new Vector3(0, 1, 0);
  static readonly DOWN = new Vector3(0, -1, 0);
  static readonly LEFT = new Vector3(-1, 0, 0);
  static readonly RIGHT = new Vector3(1, 0, 0);
  static readonly FORWARD = new Vector3(0, 0, -1);
  static readonly BACKWARD = new Vector3(0, 0, 1);

  // ===== SERIALIZATION =====

  /**
   * Converts the vector to a plain object
   */
  toJSON(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * Creates a vector from a plain object
   */
  static fromJSON(json: { x: number; y: number; z: number }): Vector3 {
    return new Vector3(json.x, json.y, json.z);
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of the vector
   */
  toString(): string {
    return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
  }
} 