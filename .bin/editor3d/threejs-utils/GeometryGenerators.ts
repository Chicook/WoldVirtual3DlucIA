import * as THREE from 'three';

/**
 * Generadores de Geometría para el Editor 3D
 * Proporciona funciones para crear geometrías básicas y complejas
 * Inspirado en Blender y Godot
 */

export interface GeometryOptions {
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  segments?: number;
  material?: THREE.Material;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export class GeometryGenerators {
  private static defaultMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    roughness: 0.5,
    metalness: 0.1
  });

  /**
   * Crea un cubo con opciones personalizables
   */
  static createCube(options: GeometryOptions = {}): THREE.Mesh {
    const {
      width = 1,
      height = 1,
      depth = 1,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    return mesh;
  }

  /**
   * Crea una esfera con opciones personalizables
   */
  static createSphere(options: GeometryOptions = {}): THREE.Mesh {
    const {
      radius = 0.5,
      segments = 32,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    return mesh;
  }

  /**
   * Crea un cilindro con opciones personalizables
   */
  static createCylinder(options: GeometryOptions = {}): THREE.Mesh {
    const {
      radius = 0.5,
      height = 1,
      segments = 32,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    return mesh;
  }

  /**
   * Crea un plano con opciones personalizables
   */
  static createPlane(options: GeometryOptions = {}): THREE.Mesh {
    const {
      width = 1,
      height = 1,
      segments = 1,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    return mesh;
  }

  /**
   * Crea un toro con opciones personalizables
   */
  static createTorus(options: GeometryOptions = {}): THREE.Mesh {
    const {
      radius = 0.5,
      tube = 0.2,
      segments = 32,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    const geometry = new THREE.TorusGeometry(radius, tube, segments, segments);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    return mesh;
  }

  /**
   * Crea un cono con opciones personalizables
   */
  static createCone(options: GeometryOptions = {}): THREE.Mesh {
    const {
      radius = 0.5,
      height = 1,
      segments = 32,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    const geometry = new THREE.ConeGeometry(radius, height, segments);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    return mesh;
  }

  /**
   * Crea una geometría de texto 3D
   */
  static createText(text: string, options: GeometryOptions = {}): THREE.Mesh {
    const {
      size = 0.1,
      height = 0.02,
      material = this.defaultMaterial,
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = new THREE.Vector3(1, 1, 1)
    } = options;

    // Usar geometría básica como placeholder
    const geometry = new THREE.BoxGeometry(size * text.length, size, height);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    
    // Agregar metadata del texto
    (mesh as any).textData = { text, size, height };
    
    return mesh;
  }

  /**
   * Crea una geometría de línea entre dos puntos
   */
  static createLine(start: THREE.Vector3, end: THREE.Vector3, color: number = 0xffffff): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
  }

  /**
   * Crea una geometría de puntos
   */
  static createPoints(points: THREE.Vector3[], color: number = 0xffffff, size: number = 0.1): THREE.Points {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({ color, size });
    return new THREE.Points(geometry, material);
  }

  /**
   * Limpia la geometría y libera memoria
   */
  static disposeGeometry(mesh: THREE.Mesh): void {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  }
} 