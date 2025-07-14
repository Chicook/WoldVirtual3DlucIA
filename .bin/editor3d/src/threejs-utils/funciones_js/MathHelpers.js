/**
 * Math Helpers - Utilidades de matemáticas y geometría avanzada para el editor 3D
 * Maneja cálculos vectoriales, matrices, interpolación, snapping y otras operaciones matemáticas
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class MathHelpers {
  constructor() {
    this.snapEnabled = false;
    this.snapValue = 1.0;
    this.snapAngle = Math.PI / 4; // 45 grados
    this.snapDistance = 1.0;
    this.precision = 0.001;
  }

  /**
   * Redondea un valor al múltiplo más cercano del snapValue
   */
  snapToGrid(value, snapValue = null) {
    const snap = snapValue || this.snapValue;
    return Math.round(value / snap) * snap;
  }

  /**
   * Aplica snapping a un vector 3D
   */
  snapVector(vector, snapValue = null) {
    return new THREE.Vector3(
      this.snapToGrid(vector.x, snapValue),
      this.snapToGrid(vector.y, snapValue),
      this.snapToGrid(vector.z, snapValue)
    );
  }

  /**
   * Redondea un ángulo al múltiplo más cercano del snapAngle
   */
  snapAngle(angle, snapAngle = null) {
    const snap = snapAngle || this.snapAngle;
    return Math.round(angle / snap) * snap;
  }

  /**
   * Calcula la distancia entre dos puntos 3D
   */
  distance(point1, point2) {
    return point1.distanceTo(point2);
  }

  /**
   * Calcula el punto medio entre dos puntos 3D
   */
  midpoint(point1, point2) {
    return new THREE.Vector3(
      (point1.x + point2.x) / 2,
      (point1.y + point2.y) / 2,
      (point1.z + point2.z) / 2
    );
  }

  /**
   * Interpola linealmente entre dos valores
   */
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Interpola linealmente entre dos vectores 3D
   */
  lerpVector(start, end, factor) {
    return new THREE.Vector3(
      this.lerp(start.x, end.x, factor),
      this.lerp(start.y, end.y, factor),
      this.lerp(start.z, end.z, factor)
    );
  }

  /**
   * Interpola esféricamente entre dos vectores 3D
   */
  slerpVector(start, end, factor) {
    const startNormalized = start.clone().normalize();
    const endNormalized = end.clone().normalize();
    const dot = startNormalized.dot(endNormalized);
    
    if (Math.abs(dot) > 0.9995) {
      return this.lerpVector(start, end, factor);
    }
    
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - factor) * theta) / sinTheta;
    const w2 = Math.sin(factor * theta) / sinTheta;
    
    return new THREE.Vector3(
      w1 * start.x + w2 * end.x,
      w1 * start.y + w2 * end.y,
      w1 * start.z + w2 * end.z
    );
  }

  /**
   * Calcula el centro de masa de un array de puntos
   */
  centerOfMass(points) {
    if (points.length === 0) return new THREE.Vector3();
    
    const center = new THREE.Vector3();
    points.forEach(point => center.add(point));
    return center.divideScalar(points.length);
  }

  /**
   * Calcula el bounding box de un array de puntos
   */
  boundingBox(points) {
    if (points.length === 0) return new THREE.Box3();
    
    const box = new THREE.Box3();
    points.forEach(point => box.expandByPoint(point));
    return box;
  }

  /**
   * Calcula el radio del bounding sphere de un array de puntos
   */
  boundingSphereRadius(points) {
    if (points.length === 0) return 0;
    
    const center = this.centerOfMass(points);
    let maxDistance = 0;
    
    points.forEach(point => {
      const distance = center.distanceTo(point);
      if (distance > maxDistance) maxDistance = distance;
    });
    
    return maxDistance;
  }

  /**
   * Calcula la normal de un triángulo definido por tres puntos
   */
  triangleNormal(point1, point2, point3) {
    const v1 = new THREE.Vector3().subVectors(point2, point1);
    const v2 = new THREE.Vector3().subVectors(point3, point1);
    return new THREE.Vector3().crossVectors(v1, v2).normalize();
  }

  /**
   * Calcula el área de un triángulo
   */
  triangleArea(point1, point2, point3) {
    const v1 = new THREE.Vector3().subVectors(point2, point1);
    const v2 = new THREE.Vector3().subVectors(point3, point1);
    const cross = new THREE.Vector3().crossVectors(v1, v2);
    return cross.length() / 2;
  }

  /**
   * Calcula el volumen de un tetraedro
   */
  tetrahedronVolume(point1, point2, point3, point4) {
    const v1 = new THREE.Vector3().subVectors(point2, point1);
    const v2 = new THREE.Vector3().subVectors(point3, point1);
    const v3 = new THREE.Vector3().subVectors(point4, point1);
    
    const cross = new THREE.Vector3().crossVectors(v2, v3);
    return Math.abs(v1.dot(cross)) / 6;
  }

  /**
   * Calcula el ángulo entre dos vectores
   */
  angleBetweenVectors(vector1, vector2) {
    const dot = vector1.dot(vector2);
    const mag1 = vector1.length();
    const mag2 = vector2.length();
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    return Math.acos(dot / (mag1 * mag2));
  }

  /**
   * Calcula el ángulo diedro entre dos planos
   */
  dihedralAngle(normal1, normal2) {
    const dot = normal1.dot(normal2);
    return Math.acos(Math.abs(dot));
  }

  /**
   * Proyecta un punto en una línea
   */
  projectPointOnLine(point, lineStart, lineEnd) {
    const lineVector = new THREE.Vector3().subVectors(lineEnd, lineStart);
    const pointVector = new THREE.Vector3().subVectors(point, lineStart);
    
    const t = pointVector.dot(lineVector) / lineVector.dot(lineVector);
    return new THREE.Vector3().addVectors(lineStart, lineVector.multiplyScalar(t));
  }

  /**
   * Proyecta un punto en un plano
   */
  projectPointOnPlane(point, planePoint, planeNormal) {
    const pointVector = new THREE.Vector3().subVectors(point, planePoint);
    const distance = pointVector.dot(planeNormal);
    return new THREE.Vector3().subVectors(point, planeNormal.multiplyScalar(distance));
  }

  /**
   * Calcula la distancia de un punto a una línea
   */
  distancePointToLine(point, lineStart, lineEnd) {
    const projected = this.projectPointOnLine(point, lineStart, lineEnd);
    return point.distanceTo(projected);
  }

  /**
   * Calcula la distancia de un punto a un plano
   */
  distancePointToPlane(point, planePoint, planeNormal) {
    const pointVector = new THREE.Vector3().subVectors(point, planePoint);
    return Math.abs(pointVector.dot(planeNormal));
  }

  /**
   * Calcula la intersección de dos líneas en 2D
   */
  lineIntersection2D(line1Start, line1End, line2Start, line2End) {
    const x1 = line1Start.x, y1 = line1Start.y;
    const x2 = line1End.x, y2 = line1End.y;
    const x3 = line2Start.x, y3 = line2Start.y;
    const x4 = line2End.x, y4 = line2End.y;
    
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (Math.abs(denominator) < this.precision) {
      return null; // Líneas paralelas
    }
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    
    return new THREE.Vector3(
      x1 + t * (x2 - x1),
      y1 + t * (y2 - y1),
      0
    );
  }

  /**
   * Calcula la intersección de una línea con un plano
   */
  linePlaneIntersection(lineStart, lineEnd, planePoint, planeNormal) {
    const lineVector = new THREE.Vector3().subVectors(lineEnd, lineStart);
    const pointVector = new THREE.Vector3().subVectors(planePoint, lineStart);
    
    const denominator = lineVector.dot(planeNormal);
    
    if (Math.abs(denominator) < this.precision) {
      return null; // Línea paralela al plano
    }
    
    const t = pointVector.dot(planeNormal) / denominator;
    
    return new THREE.Vector3().addVectors(lineStart, lineVector.multiplyScalar(t));
  }

  /**
   * Calcula el punto más cercano en un mesh a un punto dado
   */
  closestPointOnMesh(point, mesh) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    let closestPoint = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < position.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(position, i);
      vertex.applyMatrix4(mesh.matrixWorld);
      
      const distance = point.distanceTo(vertex);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = vertex.clone();
      }
    }
    
    return closestPoint;
  }

  /**
   * Calcula la normal promedio de un vértice en un mesh
   */
  averageVertexNormal(vertexIndex, mesh) {
    const geometry = mesh.geometry;
    const normal = geometry.attributes.normal;
    const index = geometry.index;
    
    if (!index) return new THREE.Vector3(0, 1, 0);
    
    const normalSum = new THREE.Vector3();
    let count = 0;
    
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      
      if (a === vertexIndex || b === vertexIndex || c === vertexIndex) {
        const normalA = new THREE.Vector3();
        const normalB = new THREE.Vector3();
        const normalC = new THREE.Vector3();
        
        normalA.fromBufferAttribute(normal, a);
        normalB.fromBufferAttribute(normal, b);
        normalC.fromBufferAttribute(normal, c);
        
        normalSum.add(normalA).add(normalB).add(normalC);
        count++;
      }
    }
    
    return count > 0 ? normalSum.divideScalar(count).normalize() : new THREE.Vector3(0, 1, 0);
  }

  /**
   * Calcula el área de superficie de un mesh
   */
  meshSurfaceArea(mesh) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;
    
    if (!index) return 0;
    
    let totalArea = 0;
    
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      
      const pointA = new THREE.Vector3();
      const pointB = new THREE.Vector3();
      const pointC = new THREE.Vector3();
      
      pointA.fromBufferAttribute(position, a);
      pointB.fromBufferAttribute(position, b);
      pointC.fromBufferAttribute(position, c);
      
      totalArea += this.triangleArea(pointA, pointB, pointC);
    }
    
    return totalArea;
  }

  /**
   * Calcula el volumen de un mesh cerrado
   */
  meshVolume(mesh) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;
    
    if (!index) return 0;
    
    let totalVolume = 0;
    const center = this.centerOfMass([new THREE.Vector3(0, 0, 0)]);
    
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      
      const pointA = new THREE.Vector3();
      const pointB = new THREE.Vector3();
      const pointC = new THREE.Vector3();
      
      pointA.fromBufferAttribute(position, a);
      pointB.fromBufferAttribute(position, b);
      pointC.fromBufferAttribute(position, c);
      
      totalVolume += this.tetrahedronVolume(center, pointA, pointB, pointC);
    }
    
    return totalVolume;
  }

  /**
   * Convierte grados a radianes
   */
  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * Convierte radianes a grados
   */
  radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  /**
   * Clampa un valor entre un mínimo y máximo
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Mapea un valor de un rango a otro
   */
  map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
  }

  /**
   * Calcula el factorial de un número
   */
  factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Calcula el coeficiente binomial
   */
  binomialCoefficient(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
  }

  /**
   * Calcula la curva de Bézier
   */
  bezierCurve(points, t) {
    const n = points.length - 1;
    let result = new THREE.Vector3();
    
    for (let i = 0; i <= n; i++) {
      const coefficient = this.binomialCoefficient(n, i);
      const term = coefficient * Math.pow(1 - t, n - i) * Math.pow(t, i);
      result.add(points[i].clone().multiplyScalar(term));
    }
    
    return result;
  }

  /**
   * Calcula puntos en una curva de Bézier
   */
  bezierCurvePoints(points, segments = 50) {
    const curvePoints = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      curvePoints.push(this.bezierCurve(points, t));
    }
    
    return curvePoints;
  }
}

export { MathHelpers };
