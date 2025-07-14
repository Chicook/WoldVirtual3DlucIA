/**
 * Quaternion - 3D Rotation Mathematics
 * 
 * High-performance quaternion operations for 3D rotations.
 */

import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
import { Euler } from './Euler';

export class Quaternion {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  // ===== BASIC OPERATIONS =====

  /**
   * Sets the quaternion components
   */
  set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  /**
   * Copies values from another quaternion
   */
  copy(q: Quaternion): this {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  /**
   * Creates a clone of this quaternion
   */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Sets the quaternion to identity
   */
  identity(): this {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
    return this;
  }

  // ===== QUATERNION OPERATIONS =====

  /**
   * Adds another quaternion to this one
   */
  add(q: Quaternion): this {
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
    this.w += q.w;
    return this;
  }

  /**
   * Subtracts another quaternion from this one
   */
  sub(q: Quaternion): this {
    this.x -= q.x;
    this.y -= q.y;
    this.z -= q.z;
    this.w -= q.w;
    return this;
  }

  /**
   * Multiplies this quaternion by another quaternion
   */
  multiply(q: Quaternion): this {
    const qax = this.x, qay = this.y, qaz = this.z, qaw = this.w;
    const qbx = q.x, qby = q.y, qbz = q.z, qbw = q.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  /**
   * Multiplies this quaternion by a scalar
   */
  multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    this.w *= scalar;
    return this;
  }

  /**
   * Divides this quaternion by a scalar
   */
  divideScalar(scalar: number): this {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
      this.z /= scalar;
      this.w /= scalar;
    }
    return this;
  }

  /**
   * Calculates the conjugate of this quaternion
   */
  conjugate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Calculates the inverse of this quaternion
   */
  invert(): this {
    const lengthSq = this.lengthSq();
    if (lengthSq > 0) {
      this.conjugate().divideScalar(lengthSq);
    }
    return this;
  }

  /**
   * Calculates the length (magnitude) of the quaternion
   */
  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Calculates the squared length of the quaternion
   */
  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  /**
   * Normalizes the quaternion
   */
  normalize(): this {
    const length = this.length();
    if (length > 0) {
      this.divideScalar(length);
    }
    return this;
  }

  /**
   * Calculates the dot product with another quaternion
   */
  dot(q: Quaternion): number {
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
  }

  // ===== ROTATION OPERATIONS =====

  /**
   * Sets the quaternion from axis-angle rotation
   */
  setFromAxisAngle(axis: Vector3, angle: number): this {
    const halfAngle = angle / 2;
    const sinHalfAngle = Math.sin(halfAngle);
    
    this.x = axis.x * sinHalfAngle;
    this.y = axis.y * sinHalfAngle;
    this.z = axis.z * sinHalfAngle;
    this.w = Math.cos(halfAngle);
    
    return this;
  }

  /**
   * Sets the quaternion from Euler angles
   */
  setFromEuler(euler: Euler): this {
    const cx = Math.cos(euler.x / 2);
    const sx = Math.sin(euler.x / 2);
    const cy = Math.cos(euler.y / 2);
    const sy = Math.sin(euler.y / 2);
    const cz = Math.cos(euler.z / 2);
    const sz = Math.sin(euler.z / 2);

    switch (euler.order) {
      case 'XYZ':
        this.x = sx * cy * cz + cx * sy * sz;
        this.y = cx * sy * cz - sx * cy * sz;
        this.z = cx * cy * sz + sx * sy * cz;
        this.w = cx * cy * cz - sx * sy * sz;
        break;
      case 'YXZ':
        this.x = sx * cy * cz + cx * sy * sz;
        this.y = cx * sy * cz - sx * cy * sz;
        this.z = cx * cy * sz - sx * sy * cz;
        this.w = cx * cy * cz + sx * sy * sz;
        break;
      case 'ZXY':
        this.x = sx * cy * cz - cx * sy * sz;
        this.y = cx * sy * cz + sx * cy * sz;
        this.z = cx * cy * sz + sx * sy * cz;
        this.w = cx * cy * cz - sx * sy * sz;
        break;
      case 'ZYX':
        this.x = sx * cy * cz - cx * sy * sz;
        this.y = cx * sy * cz + sx * cy * sz;
        this.z = cx * cy * sz - sx * sy * cz;
        this.w = cx * cy * cz + sx * sy * sz;
        break;
      case 'YZX':
        this.x = sx * cy * cz + cx * sy * sz;
        this.y = cx * sy * cz + sx * cy * sz;
        this.z = cx * cy * sz - sx * sy * cz;
        this.w = cx * cy * cz - sx * sy * sz;
        break;
      case 'XZY':
        this.x = sx * cy * cz - cx * sy * sz;
        this.y = cx * sy * cz - sx * cy * sz;
        this.z = cx * cy * sz + sx * sy * cz;
        this.w = cx * cy * cz + sx * sy * sz;
        break;
    }

    return this;
  }

  /**
   * Sets the quaternion from rotation matrix
   */
  setFromRotationMatrix(m: Matrix4): this {
    const trace = m.m11 + m.m22 + m.m33;
    
    if (trace > 0) {
      const s = Math.sqrt(trace + 1) * 2;
      this.w = 0.25 * s;
      this.x = (m.m32 - m.m23) / s;
      this.y = (m.m13 - m.m31) / s;
      this.z = (m.m21 - m.m12) / s;
    } else if (m.m11 > m.m22 && m.m11 > m.m33) {
      const s = Math.sqrt(1 + m.m11 - m.m22 - m.m33) * 2;
      this.w = (m.m32 - m.m23) / s;
      this.x = 0.25 * s;
      this.y = (m.m12 + m.m21) / s;
      this.z = (m.m13 + m.m31) / s;
    } else if (m.m22 > m.m33) {
      const s = Math.sqrt(1 + m.m22 - m.m11 - m.m33) * 2;
      this.w = (m.m13 - m.m31) / s;
      this.x = (m.m12 + m.m21) / s;
      this.y = 0.25 * s;
      this.z = (m.m23 + m.m32) / s;
    } else {
      const s = Math.sqrt(1 + m.m33 - m.m11 - m.m22) * 2;
      this.w = (m.m21 - m.m12) / s;
      this.x = (m.m13 + m.m31) / s;
      this.y = (m.m23 + m.m32) / s;
      this.z = 0.25 * s;
    }

    return this;
  }

  /**
   * Sets the quaternion to rotate from one vector to another
   */
  setFromUnitVectors(vFrom: Vector3, vTo: Vector3): this {
    const EPS = 0.000001;
    let r = vFrom.dot(vTo) + 1;

    if (r < EPS) {
      r = 0;
      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        this.x = -vFrom.y;
        this.y = vFrom.x;
        this.z = 0;
        this.w = r;
      } else {
        this.x = 0;
        this.y = -vFrom.z;
        this.z = vFrom.y;
        this.w = r;
      }
    } else {
      this.x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this.y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this.z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this.w = r;
    }

    return this.normalize();
  }

  /**
   * Applies this quaternion rotation to a vector
   */
  multiplyVector3(v: Vector3): Vector3 {
    const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
    const vx = v.x, vy = v.y, vz = v.z;

    const ix = qw * vx + qy * vz - qz * vy;
    const iy = qw * vy + qz * vx - qx * vz;
    const iz = qw * vz + qx * vy - qy * vx;
    const iw = -qx * vx - qy * vy - qz * vz;

    return new Vector3(
      ix * qw + iw * -qx + iy * -qz - iz * -qy,
      iy * qw + iw * -qy + iz * -qx - ix * -qz,
      iz * qw + iw * -qz + ix * -qy - iy * -qx
    );
  }

  // ===== INTERPOLATION =====

  /**
   * Linear interpolation with another quaternion
   */
  lerp(q: Quaternion, alpha: number): this {
    this.x += (q.x - this.x) * alpha;
    this.y += (q.y - this.y) * alpha;
    this.z += (q.z - this.z) * alpha;
    this.w += (q.w - this.w) * alpha;
    return this;
  }

  /**
   * Spherical linear interpolation with another quaternion
   */
  slerp(q: Quaternion, alpha: number): this {
    let dot = this.dot(q);
    
    // Ensure we take the shortest path
    if (dot < 0) {
      q = q.clone().negate();
      dot = -dot;
    }

    if (dot > 0.9995) {
      // Quaternions are very close, use linear interpolation
      return this.lerp(q, alpha);
    }

    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - alpha) * theta) / sinTheta;
    const w2 = Math.sin(alpha * theta) / sinTheta;

    this.x = w1 * this.x + w2 * q.x;
    this.y = w1 * this.y + w2 * q.y;
    this.z = w1 * this.z + w2 * q.z;
    this.w = w1 * this.w + w2 * q.w;

    return this;
  }

  /**
   * Squad interpolation (spherical cubic interpolation)
   */
  squad(q: Quaternion, a: Quaternion, b: Quaternion, t: number): this {
    const slerp1 = this.clone().slerp(q, t);
    const slerp2 = a.clone().slerp(b, t);
    return slerp1.slerp(slerp2, 2 * t * (1 - t));
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Negates the quaternion
   */
  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  }

  /**
   * Checks if this quaternion equals another quaternion
   */
  equals(q: Quaternion): boolean {
    return this.x === q.x && this.y === q.y && this.z === q.z && this.w === q.w;
  }

  /**
   * Checks if this quaternion approximately equals another quaternion
   */
  approximatelyEquals(q: Quaternion, epsilon: number = 1e-6): boolean {
    return Math.abs(this.x - q.x) < epsilon &&
           Math.abs(this.y - q.y) < epsilon &&
           Math.abs(this.z - q.z) < epsilon &&
           Math.abs(this.w - q.w) < epsilon;
  }

  /**
   * Checks if the quaternion is the identity quaternion
   */
  isIdentity(): boolean {
    return this.x === 0 && this.y === 0 && this.z === 0 && this.w === 1;
  }

  /**
   * Checks if the quaternion is normalized
   */
  isNormalized(): boolean {
    const lengthSq = this.lengthSq();
    return Math.abs(lengthSq - 1) < 1e-6;
  }

  // ===== ARRAY OPERATIONS =====

  /**
   * Sets the quaternion from an array
   */
  fromArray(array: number[], offset: number = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    return this;
  }

  /**
   * Converts the quaternion to an array
   */
  toArray(array: number[] = [], offset: number = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    return array;
  }

  /**
   * Converts the quaternion to a Float32Array
   */
  toFloat32Array(): Float32Array {
    return new Float32Array([this.x, this.y, this.z, this.w]);
  }

  // ===== STATIC METHODS =====

  /**
   * Creates a quaternion from an array
   */
  static fromArray(array: number[], offset: number = 0): Quaternion {
    return new Quaternion(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
  }

  /**
   * Creates a quaternion from axis-angle rotation
   */
  static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
    return new Quaternion().setFromAxisAngle(axis, angle);
  }

  /**
   * Creates a quaternion from Euler angles
   */
  static fromEuler(euler: Euler): Quaternion {
    return new Quaternion().setFromEuler(euler);
  }

  /**
   * Creates a quaternion from rotation matrix
   */
  static fromRotationMatrix(matrix: Matrix4): Quaternion {
    return new Quaternion().setFromRotationMatrix(matrix);
  }

  /**
   * Creates a quaternion that rotates from one vector to another
   */
  static fromUnitVectors(vFrom: Vector3, vTo: Vector3): Quaternion {
    return new Quaternion().setFromUnitVectors(vFrom, vTo);
  }

  /**
   * Creates a random quaternion
   */
  static random(): Quaternion {
    const u1 = Math.random();
    const u2 = Math.random();
    const u3 = Math.random();

    const sqrt1MinusU1 = Math.sqrt(1 - u1);
    const sqrtU1 = Math.sqrt(u1);

    return new Quaternion(
      sqrt1MinusU1 * Math.sin(2 * Math.PI * u2),
      sqrt1MinusU1 * Math.cos(2 * Math.PI * u2),
      sqrtU1 * Math.sin(2 * Math.PI * u3),
      sqrtU1 * Math.cos(2 * Math.PI * u3)
    );
  }

  // ===== CONSTANTS =====

  static readonly IDENTITY = new Quaternion(0, 0, 0, 1);

  // ===== SERIALIZATION =====

  /**
   * Converts the quaternion to a plain object
   */
  toJSON(): { x: number; y: number; z: number; w: number } {
    return { x: this.x, y: this.y, z: this.z, w: this.w };
  }

  /**
   * Creates a quaternion from a plain object
   */
  static fromJSON(json: { x: number; y: number; z: number; w: number }): Quaternion {
    return new Quaternion(json.x, json.y, json.z, json.w);
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of the quaternion
   */
  toString(): string {
    return `Quaternion(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)}, ${this.w.toFixed(3)})`;
  }
} 