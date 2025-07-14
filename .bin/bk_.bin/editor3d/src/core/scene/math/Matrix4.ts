/**
 * Matrix4 - 4x4 Transformation Matrix
 * 
 * High-performance 4x4 matrix operations for 3D transformations.
 */

import { Vector3 } from './Vector3';
import { Quaternion } from './Quaternion';
import { Euler } from './Euler';

export class Matrix4 {
  // Matrix elements stored in column-major order
  public m11: number; public m12: number; public m13: number; public m14: number;
  public m21: number; public m22: number; public m23: number; public m24: number;
  public m31: number; public m32: number; public m33: number; public m34: number;
  public m41: number; public m42: number; public m43: number; public m44: number;

  constructor(
    m11: number = 1, m12: number = 0, m13: number = 0, m14: number = 0,
    m21: number = 0, m22: number = 1, m23: number = 0, m24: number = 0,
    m31: number = 0, m32: number = 0, m33: number = 1, m34: number = 0,
    m41: number = 0, m42: number = 0, m43: number = 0, m44: number = 1
  ) {
    this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
    this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
    this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
    this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
  }

  // ===== BASIC OPERATIONS =====

  /**
   * Sets the matrix elements
   */
  set(
    m11: number, m12: number, m13: number, m14: number,
    m21: number, m22: number, m23: number, m24: number,
    m31: number, m32: number, m33: number, m34: number,
    m41: number, m42: number, m43: number, m44: number
  ): this {
    this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
    this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
    this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
    this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
    return this;
  }

  /**
   * Copies values from another matrix
   */
  copy(m: Matrix4): this {
    this.m11 = m.m11; this.m12 = m.m12; this.m13 = m.m13; this.m14 = m.m14;
    this.m21 = m.m21; this.m22 = m.m22; this.m23 = m.m23; this.m24 = m.m24;
    this.m31 = m.m31; this.m32 = m.m32; this.m33 = m.m33; this.m34 = m.m34;
    this.m41 = m.m41; this.m42 = m.m42; this.m43 = m.m43; this.m44 = m.m44;
    return this;
  }

  /**
   * Creates a clone of this matrix
   */
  clone(): Matrix4 {
    return new Matrix4(
      this.m11, this.m12, this.m13, this.m14,
      this.m21, this.m22, this.m23, this.m24,
      this.m31, this.m32, this.m33, this.m34,
      this.m41, this.m42, this.m43, this.m44
    );
  }

  /**
   * Sets the matrix to identity
   */
  identity(): this {
    this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
    this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
    this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
    this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    return this;
  }

  /**
   * Sets the matrix to zero
   */
  setZero(): this {
    this.m11 = 0; this.m12 = 0; this.m13 = 0; this.m14 = 0;
    this.m21 = 0; this.m22 = 0; this.m23 = 0; this.m24 = 0;
    this.m31 = 0; this.m32 = 0; this.m33 = 0; this.m34 = 0;
    this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 0;
    return this;
  }

  // ===== MATRIX OPERATIONS =====

  /**
   * Multiplies this matrix by another matrix
   */
  multiply(m: Matrix4): this {
    const a11 = this.m11, a12 = this.m12, a13 = this.m13, a14 = this.m14;
    const a21 = this.m21, a22 = this.m22, a23 = this.m23, a24 = this.m24;
    const a31 = this.m31, a32 = this.m32, a33 = this.m33, a34 = this.m34;
    const a41 = this.m41, a42 = this.m42, a43 = this.m43, a44 = this.m44;

    const b11 = m.m11, b12 = m.m12, b13 = m.m13, b14 = m.m14;
    const b21 = m.m21, b22 = m.m22, b23 = m.m23, b24 = m.m24;
    const b31 = m.m31, b32 = m.m32, b33 = m.m33, b34 = m.m34;
    const b41 = m.m41, b42 = m.m42, b43 = m.m43, b44 = m.m44;

    this.m11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    this.m12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    this.m13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    this.m14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    this.m21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    this.m22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    this.m23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    this.m24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    this.m31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    this.m32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    this.m33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    this.m34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    this.m41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    this.m42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    this.m43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    this.m44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  /**
   * Multiplies this matrix by a scalar
   */
  multiplyScalar(scalar: number): this {
    this.m11 *= scalar; this.m12 *= scalar; this.m13 *= scalar; this.m14 *= scalar;
    this.m21 *= scalar; this.m22 *= scalar; this.m23 *= scalar; this.m24 *= scalar;
    this.m31 *= scalar; this.m32 *= scalar; this.m33 *= scalar; this.m34 *= scalar;
    this.m41 *= scalar; this.m42 *= scalar; this.m43 *= scalar; this.m44 *= scalar;
    return this;
  }

  /**
   * Adds another matrix to this one
   */
  add(m: Matrix4): this {
    this.m11 += m.m11; this.m12 += m.m12; this.m13 += m.m13; this.m14 += m.m14;
    this.m21 += m.m21; this.m22 += m.m22; this.m23 += m.m23; this.m24 += m.m24;
    this.m31 += m.m31; this.m32 += m.m32; this.m33 += m.m33; this.m34 += m.m34;
    this.m41 += m.m41; this.m42 += m.m42; this.m43 += m.m43; this.m44 += m.m44;
    return this;
  }

  /**
   * Subtracts another matrix from this one
   */
  sub(m: Matrix4): this {
    this.m11 -= m.m11; this.m12 -= m.m12; this.m13 -= m.m13; this.m14 -= m.m14;
    this.m21 -= m.m21; this.m22 -= m.m22; this.m23 -= m.m23; this.m24 -= m.m24;
    this.m31 -= m.m31; this.m32 -= m.m32; this.m33 -= m.m33; this.m34 -= m.m34;
    this.m41 -= m.m41; this.m42 -= m.m42; this.m43 -= m.m43; this.m44 -= m.m44;
    return this;
  }

  /**
   * Calculates the determinant of the matrix
   */
  determinant(): number {
    const a11 = this.m11, a12 = this.m12, a13 = this.m13, a14 = this.m14;
    const a21 = this.m21, a22 = this.m22, a23 = this.m23, a24 = this.m24;
    const a31 = this.m31, a32 = this.m32, a33 = this.m33, a34 = this.m34;
    const a41 = this.m41, a42 = this.m42, a43 = this.m43, a44 = this.m44;

    return a11 * a22 * a33 * a44 - a11 * a22 * a34 * a43 + a11 * a23 * a34 * a42 - a11 * a23 * a32 * a44
         + a11 * a24 * a32 * a43 - a11 * a24 * a33 * a42 - a12 * a23 * a34 * a41 + a12 * a23 * a31 * a44
         - a12 * a24 * a31 * a43 + a12 * a24 * a33 * a41 - a12 * a21 * a33 * a44 + a12 * a21 * a34 * a43
         + a13 * a24 * a31 * a42 - a13 * a24 * a32 * a41 + a13 * a21 * a32 * a44 - a13 * a21 * a34 * a42
         + a13 * a22 * a34 * a41 - a13 * a22 * a31 * a44 - a14 * a21 * a32 * a43 + a14 * a21 * a33 * a42
         - a14 * a22 * a33 * a41 + a14 * a22 * a31 * a43 - a14 * a23 * a31 * a42 + a14 * a23 * a32 * a41;
  }

  /**
   * Calculates the inverse of the matrix
   */
  invert(): this {
    const det = this.determinant();
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is not invertible');
    }

    const invDet = 1 / det;
    const a11 = this.m11, a12 = this.m12, a13 = this.m13, a14 = this.m14;
    const a21 = this.m21, a22 = this.m22, a23 = this.m23, a24 = this.m24;
    const a31 = this.m31, a32 = this.m32, a33 = this.m33, a34 = this.m34;
    const a41 = this.m41, a42 = this.m42, a43 = this.m43, a44 = this.m44;

    this.m11 = invDet * (a22 * a33 * a44 - a22 * a34 * a43 - a23 * a32 * a44 + a23 * a34 * a42 + a24 * a32 * a43 - a24 * a33 * a42);
    this.m12 = invDet * (-a12 * a33 * a44 + a12 * a34 * a43 + a13 * a32 * a44 - a13 * a34 * a42 - a14 * a32 * a43 + a14 * a33 * a42);
    this.m13 = invDet * (a12 * a23 * a44 - a12 * a24 * a43 - a13 * a22 * a44 + a13 * a24 * a42 + a14 * a22 * a43 - a14 * a23 * a42);
    this.m14 = invDet * (-a12 * a23 * a34 + a12 * a24 * a33 + a13 * a22 * a34 - a13 * a24 * a32 - a14 * a22 * a33 + a14 * a23 * a32);

    this.m21 = invDet * (-a21 * a33 * a44 + a21 * a34 * a43 + a23 * a31 * a44 - a23 * a34 * a41 - a24 * a31 * a43 + a24 * a33 * a41);
    this.m22 = invDet * (a11 * a33 * a44 - a11 * a34 * a43 - a13 * a31 * a44 + a13 * a34 * a41 + a14 * a31 * a43 - a14 * a33 * a41);
    this.m23 = invDet * (-a11 * a23 * a44 + a11 * a24 * a43 + a13 * a21 * a44 - a13 * a24 * a41 - a14 * a21 * a43 + a14 * a23 * a41);
    this.m24 = invDet * (a11 * a23 * a34 - a11 * a24 * a33 - a13 * a21 * a34 + a13 * a24 * a31 + a14 * a21 * a33 - a14 * a23 * a31);

    this.m31 = invDet * (a21 * a32 * a44 - a21 * a34 * a42 - a22 * a31 * a44 + a22 * a34 * a41 + a24 * a31 * a42 - a24 * a32 * a41);
    this.m32 = invDet * (-a11 * a32 * a44 + a11 * a34 * a42 + a12 * a31 * a44 - a12 * a34 * a41 - a14 * a31 * a42 + a14 * a32 * a41);
    this.m33 = invDet * (a11 * a22 * a44 - a11 * a24 * a42 - a12 * a21 * a44 + a12 * a24 * a41 + a14 * a21 * a42 - a14 * a22 * a41);
    this.m34 = invDet * (-a11 * a22 * a34 + a11 * a24 * a32 + a12 * a21 * a34 - a12 * a24 * a31 - a14 * a21 * a32 + a14 * a22 * a31);

    this.m41 = invDet * (-a21 * a32 * a43 + a21 * a33 * a42 + a22 * a31 * a43 - a22 * a33 * a41 - a23 * a31 * a42 + a23 * a32 * a41);
    this.m42 = invDet * (a11 * a32 * a43 - a11 * a33 * a42 - a12 * a31 * a43 + a12 * a33 * a41 + a13 * a31 * a42 - a13 * a32 * a41);
    this.m43 = invDet * (-a11 * a22 * a43 + a11 * a23 * a42 + a12 * a21 * a43 - a12 * a23 * a41 - a13 * a21 * a42 + a13 * a22 * a41);
    this.m44 = invDet * (a11 * a22 * a33 - a11 * a23 * a32 - a12 * a21 * a33 + a12 * a23 * a31 + a13 * a21 * a32 - a13 * a22 * a31);

    return this;
  }

  /**
   * Calculates the transpose of the matrix
   */
  transpose(): this {
    const temp = this.m12;
    this.m12 = this.m21;
    this.m21 = temp;

    temp = this.m13;
    this.m13 = this.m31;
    this.m31 = temp;

    temp = this.m14;
    this.m14 = this.m41;
    this.m41 = temp;

    temp = this.m23;
    this.m23 = this.m32;
    this.m32 = temp;

    temp = this.m24;
    this.m24 = this.m42;
    this.m42 = temp;

    temp = this.m34;
    this.m34 = this.m43;
    this.m43 = temp;

    return this;
  }

  // ===== TRANSFORMATION OPERATIONS =====

  /**
   * Sets the matrix from position, rotation, and scale
   */
  compose(position: Vector3, rotation: Quaternion, scale: Vector3): this {
    const x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    this.m11 = (1 - (yy + zz)) * scale.x;
    this.m12 = (xy - wz) * scale.x;
    this.m13 = (xz + wy) * scale.x;
    this.m14 = 0;

    this.m21 = (xy + wz) * scale.y;
    this.m22 = (1 - (xx + zz)) * scale.y;
    this.m23 = (yz - wx) * scale.y;
    this.m24 = 0;

    this.m31 = (xz - wy) * scale.z;
    this.m32 = (yz + wx) * scale.z;
    this.m33 = (1 - (xx + yy)) * scale.z;
    this.m34 = 0;

    this.m41 = position.x;
    this.m42 = position.y;
    this.m43 = position.z;
    this.m44 = 1;

    return this;
  }

  /**
   * Decomposes the matrix into position, rotation, and scale
   */
  decompose(position: Vector3, rotation: Quaternion, scale: Vector3): this {
    const te = this;

    // Extract position
    position.x = te.m41;
    position.y = te.m42;
    position.z = te.m43;

    // Extract scale
    const sx = new Vector3(te.m11, te.m21, te.m31).length();
    const sy = new Vector3(te.m12, te.m22, te.m32).length();
    const sz = new Vector3(te.m13, te.m23, te.m33).length();

    scale.x = sx;
    scale.y = sy;
    scale.z = sz;

    // Extract rotation
    const det = this.determinant();
    if (det < 0) {
      scale.x = -scale.x;
    }

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    const m11 = te.m11 * invSX;
    const m12 = te.m12 * invSY;
    const m13 = te.m13 * invSZ;
    const m21 = te.m21 * invSX;
    const m22 = te.m22 * invSY;
    const m23 = te.m23 * invSZ;
    const m31 = te.m31 * invSX;
    const m32 = te.m32 * invSY;
    const m33 = te.m33 * invSZ;

    rotation.setFromRotationMatrix(new Matrix4(
      m11, m12, m13, 0,
      m21, m22, m23, 0,
      m31, m32, m33, 0,
      0, 0, 0, 1
    ));

    return this;
  }

  /**
   * Gets the translation vector from the matrix
   */
  getTranslation(): Vector3 {
    return new Vector3(this.m41, this.m42, this.m43);
  }

  /**
   * Gets the rotation quaternion from the matrix
   */
  getRotation(): Quaternion {
    const scale = this.getScale();
    const invSX = 1 / scale.x;
    const invSY = 1 / scale.y;
    const invSZ = 1 / scale.z;

    const m11 = this.m11 * invSX;
    const m12 = this.m12 * invSY;
    const m13 = this.m13 * invSZ;
    const m21 = this.m21 * invSX;
    const m22 = this.m22 * invSY;
    const m23 = this.m23 * invSZ;
    const m31 = this.m31 * invSX;
    const m32 = this.m32 * invSY;
    const m33 = this.m33 * invSZ;

    return new Quaternion().setFromRotationMatrix(new Matrix4(
      m11, m12, m13, 0,
      m21, m22, m23, 0,
      m31, m32, m33, 0,
      0, 0, 0, 1
    ));
  }

  /**
   * Gets the scale vector from the matrix
   */
  getScale(): Vector3 {
    const sx = new Vector3(this.m11, this.m21, this.m31).length();
    const sy = new Vector3(this.m12, this.m22, this.m32).length();
    const sz = new Vector3(this.m13, this.m23, this.m33).length();
    return new Vector3(sx, sy, sz);
  }

  // ===== TRANSFORMATION MATRICES =====

  /**
   * Sets the matrix to a translation matrix
   */
  makeTranslation(x: number, y: number, z: number): this {
    this.identity();
    this.m41 = x;
    this.m42 = y;
    this.m43 = z;
    return this;
  }

  /**
   * Sets the matrix to a rotation matrix around X axis
   */
  makeRotationX(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    this.identity();
    this.m22 = c;
    this.m23 = -s;
    this.m32 = s;
    this.m33 = c;
    return this;
  }

  /**
   * Sets the matrix to a rotation matrix around Y axis
   */
  makeRotationY(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    this.identity();
    this.m11 = c;
    this.m13 = s;
    this.m31 = -s;
    this.m33 = c;
    return this;
  }

  /**
   * Sets the matrix to a rotation matrix around Z axis
   */
  makeRotationZ(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    this.identity();
    this.m11 = c;
    this.m12 = -s;
    this.m21 = s;
    this.m22 = c;
    return this;
  }

  /**
   * Sets the matrix to a scale matrix
   */
  makeScale(x: number, y: number, z: number): this {
    this.identity();
    this.m11 = x;
    this.m22 = y;
    this.m33 = z;
    return this;
  }

  /**
   * Sets the matrix to a look-at matrix
   */
  makeLookAt(eye: Vector3, target: Vector3, up: Vector3): this {
    const z = eye.clone().sub(target).normalize();
    const x = up.clone().cross(z).normalize();
    const y = z.clone().cross(x);

    this.m11 = x.x; this.m12 = x.y; this.m13 = x.z; this.m14 = 0;
    this.m21 = y.x; this.m22 = y.y; this.m23 = y.z; this.m24 = 0;
    this.m31 = z.x; this.m32 = z.y; this.m33 = z.z; this.m34 = 0;
    this.m41 = eye.x; this.m42 = eye.y; this.m43 = eye.z; this.m44 = 1;

    return this;
  }

  /**
   * Sets the matrix to a perspective projection matrix
   */
  makePerspective(fov: number, aspect: number, near: number, far: number): this {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    this.m11 = f / aspect; this.m12 = 0; this.m13 = 0; this.m14 = 0;
    this.m21 = 0; this.m22 = f; this.m23 = 0; this.m24 = 0;
    this.m31 = 0; this.m32 = 0; this.m33 = (near + far) * rangeInv; this.m34 = -1;
    this.m41 = 0; this.m42 = 0; this.m43 = near * far * rangeInv * 2; this.m44 = 0;

    return this;
  }

  /**
   * Sets the matrix to an orthographic projection matrix
   */
  makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): this {
    const w = right - left;
    const h = top - bottom;
    const d = far - near;

    this.m11 = 2 / w; this.m12 = 0; this.m13 = 0; this.m14 = 0;
    this.m21 = 0; this.m22 = 2 / h; this.m23 = 0; this.m24 = 0;
    this.m31 = 0; this.m32 = 0; this.m33 = -2 / d; this.m34 = 0;
    this.m41 = -(right + left) / w; this.m42 = -(top + bottom) / h; this.m43 = -(far + near) / d; this.m44 = 1;

    return this;
  }

  // ===== VECTOR TRANSFORMATIONS =====

  /**
   * Transforms a point by this matrix
   */
  transformPoint(point: Vector3): Vector3 {
    const x = point.x, y = point.y, z = point.z;
    return new Vector3(
      this.m11 * x + this.m21 * y + this.m31 * z + this.m41,
      this.m12 * x + this.m22 * y + this.m32 * z + this.m42,
      this.m13 * x + this.m23 * y + this.m33 * z + this.m43
    );
  }

  /**
   * Transforms a direction vector by this matrix
   */
  transformDirection(direction: Vector3): Vector3 {
    const x = direction.x, y = direction.y, z = direction.z;
    return new Vector3(
      this.m11 * x + this.m21 * y + this.m31 * z,
      this.m12 * x + this.m22 * y + this.m32 * z,
      this.m13 * x + this.m23 * y + this.m33 * z
    ).normalize();
  }

  /**
   * Transforms a normal vector by this matrix
   */
  transformNormal(normal: Vector3): Vector3 {
    const x = normal.x, y = normal.y, z = normal.z;
    return new Vector3(
      this.m11 * x + this.m12 * y + this.m13 * z,
      this.m21 * x + this.m22 * y + this.m23 * z,
      this.m31 * x + this.m32 * y + this.m33 * z
    ).normalize();
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Checks if this matrix equals another matrix
   */
  equals(m: Matrix4): boolean {
    return this.m11 === m.m11 && this.m12 === m.m12 && this.m13 === m.m13 && this.m14 === m.m14 &&
           this.m21 === m.m21 && this.m22 === m.m22 && this.m23 === m.m23 && this.m24 === m.m24 &&
           this.m31 === m.m31 && this.m32 === m.m32 && this.m33 === m.m33 && this.m34 === m.m34 &&
           this.m41 === m.m41 && this.m42 === m.m42 && this.m43 === m.m43 && this.m44 === m.m44;
  }

  /**
   * Checks if this matrix approximately equals another matrix
   */
  approximatelyEquals(m: Matrix4, epsilon: number = 1e-6): boolean {
    return Math.abs(this.m11 - m.m11) < epsilon && Math.abs(this.m12 - m.m12) < epsilon &&
           Math.abs(this.m13 - m.m13) < epsilon && Math.abs(this.m14 - m.m14) < epsilon &&
           Math.abs(this.m21 - m.m21) < epsilon && Math.abs(this.m22 - m.m22) < epsilon &&
           Math.abs(this.m23 - m.m23) < epsilon && Math.abs(this.m24 - m.m24) < epsilon &&
           Math.abs(this.m31 - m.m31) < epsilon && Math.abs(this.m32 - m.m32) < epsilon &&
           Math.abs(this.m33 - m.m33) < epsilon && Math.abs(this.m34 - m.m34) < epsilon &&
           Math.abs(this.m41 - m.m41) < epsilon && Math.abs(this.m42 - m.m42) < epsilon &&
           Math.abs(this.m43 - m.m43) < epsilon && Math.abs(this.m44 - m.m44) < epsilon;
  }

  /**
   * Checks if the matrix is the identity matrix
   */
  isIdentity(): boolean {
    return this.m11 === 1 && this.m12 === 0 && this.m13 === 0 && this.m14 === 0 &&
           this.m21 === 0 && this.m22 === 1 && this.m23 === 0 && this.m24 === 0 &&
           this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 &&
           this.m41 === 0 && this.m42 === 0 && this.m43 === 0 && this.m44 === 1;
  }

  // ===== ARRAY OPERATIONS =====

  /**
   * Sets the matrix from an array
   */
  fromArray(array: number[], offset: number = 0): this {
    this.m11 = array[offset]; this.m12 = array[offset + 1]; this.m13 = array[offset + 2]; this.m14 = array[offset + 3];
    this.m21 = array[offset + 4]; this.m22 = array[offset + 5]; this.m23 = array[offset + 6]; this.m24 = array[offset + 7];
    this.m31 = array[offset + 8]; this.m32 = array[offset + 9]; this.m33 = array[offset + 10]; this.m34 = array[offset + 11];
    this.m41 = array[offset + 12]; this.m42 = array[offset + 13]; this.m43 = array[offset + 14]; this.m44 = array[offset + 15];
    return this;
  }

  /**
   * Converts the matrix to an array
   */
  toArray(array: number[] = [], offset: number = 0): number[] {
    array[offset] = this.m11; array[offset + 1] = this.m12; array[offset + 2] = this.m13; array[offset + 3] = this.m14;
    array[offset + 4] = this.m21; array[offset + 5] = this.m22; array[offset + 6] = this.m23; array[offset + 7] = this.m24;
    array[offset + 8] = this.m31; array[offset + 9] = this.m32; array[offset + 10] = this.m33; array[offset + 11] = this.m34;
    array[offset + 12] = this.m41; array[offset + 13] = this.m42; array[offset + 14] = this.m43; array[offset + 15] = this.m44;
    return array;
  }

  /**
   * Converts the matrix to a Float32Array
   */
  toFloat32Array(): Float32Array {
    return new Float32Array([
      this.m11, this.m12, this.m13, this.m14,
      this.m21, this.m22, this.m23, this.m24,
      this.m31, this.m32, this.m33, this.m34,
      this.m41, this.m42, this.m43, this.m44
    ]);
  }

  // ===== STATIC METHODS =====

  /**
   * Creates a matrix from an array
   */
  static fromArray(array: number[], offset: number = 0): Matrix4 {
    return new Matrix4().fromArray(array, offset);
  }

  /**
   * Creates a translation matrix
   */
  static makeTranslation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4().makeTranslation(x, y, z);
  }

  /**
   * Creates a rotation matrix around X axis
   */
  static makeRotationX(angle: number): Matrix4 {
    return new Matrix4().makeRotationX(angle);
  }

  /**
   * Creates a rotation matrix around Y axis
   */
  static makeRotationY(angle: number): Matrix4 {
    return new Matrix4().makeRotationY(angle);
  }

  /**
   * Creates a rotation matrix around Z axis
   */
  static makeRotationZ(angle: number): Matrix4 {
    return new Matrix4().makeRotationZ(angle);
  }

  /**
   * Creates a scale matrix
   */
  static makeScale(x: number, y: number, z: number): Matrix4 {
    return new Matrix4().makeScale(x, y, z);
  }

  /**
   * Creates a look-at matrix
   */
  static makeLookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
    return new Matrix4().makeLookAt(eye, target, up);
  }

  /**
   * Creates a perspective projection matrix
   */
  static makePerspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
    return new Matrix4().makePerspective(fov, aspect, near, far);
  }

  /**
   * Creates an orthographic projection matrix
   */
  static makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): Matrix4 {
    return new Matrix4().makeOrthographic(left, right, top, bottom, near, far);
  }

  // ===== CONSTANTS =====

  static readonly IDENTITY = new Matrix4();

  // ===== SERIALIZATION =====

  /**
   * Converts the matrix to a plain object
   */
  toJSON(): {
    m11: number; m12: number; m13: number; m14: number;
    m21: number; m22: number; m23: number; m24: number;
    m31: number; m32: number; m33: number; m34: number;
    m41: number; m42: number; m43: number; m44: number;
  } {
    return {
      m11: this.m11, m12: this.m12, m13: this.m13, m14: this.m14,
      m21: this.m21, m22: this.m22, m23: this.m23, m24: this.m24,
      m31: this.m31, m32: this.m32, m33: this.m33, m34: this.m34,
      m41: this.m41, m42: this.m42, m43: this.m43, m44: this.m44
    };
  }

  /**
   * Creates a matrix from a plain object
   */
  static fromJSON(json: {
    m11: number; m12: number; m13: number; m14: number;
    m21: number; m22: number; m23: number; m24: number;
    m31: number; m32: number; m33: number; m34: number;
    m41: number; m42: number; m43: number; m44: number;
  }): Matrix4 {
    return new Matrix4(
      json.m11, json.m12, json.m13, json.m14,
      json.m21, json.m22, json.m23, json.m24,
      json.m31, json.m32, json.m33, json.m34,
      json.m41, json.m42, json.m43, json.m44
    );
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of the matrix
   */
  toString(): string {
    return `Matrix4(\n` +
           `  ${this.m11.toFixed(3)}, ${this.m12.toFixed(3)}, ${this.m13.toFixed(3)}, ${this.m14.toFixed(3)}\n` +
           `  ${this.m21.toFixed(3)}, ${this.m22.toFixed(3)}, ${this.m23.toFixed(3)}, ${this.m24.toFixed(3)}\n` +
           `  ${this.m31.toFixed(3)}, ${this.m32.toFixed(3)}, ${this.m33.toFixed(3)}, ${this.m34.toFixed(3)}\n` +
           `  ${this.m41.toFixed(3)}, ${this.m42.toFixed(3)}, ${this.m43.toFixed(3)}, ${this.m44.toFixed(3)}\n` +
           `)`;
  }
} 