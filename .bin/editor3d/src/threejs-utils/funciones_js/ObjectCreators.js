/**
 * Object Creators - Funciones JavaScript para crear objetos 3D básicos
 * Genera geometrías primitivas y objetos complejos para el editor
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class ObjectCreators {
  constructor() {
    this.defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.1
    });
  }

  /**
   * Crea un cubo con dimensiones personalizables
   */
  createCube(width = 1, height = 1, depth = 1, material = null) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'cube',
      dimensions: { width, height, depth },
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea una esfera con radio y segmentos personalizables
   */
  createSphere(radius = 0.5, segments = 32, material = null) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'sphere',
      radius,
      segments,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un cilindro con parámetros personalizables
   */
  createCylinder(radiusTop = 0.5, radiusBottom = 0.5, height = 1, segments = 32, material = null) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'cylinder',
      radiusTop,
      radiusBottom,
      height,
      segments,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un cono (cilindro con radio superior 0)
   */
  createCone(radius = 0.5, height = 1, segments = 32, material = null) {
    return this.createCylinder(0, radius, height, segments, material);
  }

  /**
   * Crea un plano con dimensiones personalizables
   */
  createPlane(width = 1, height = 1, segments = 1, material = null) {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'plane',
      dimensions: { width, height },
      segments,
      createdAt: Date.now()
    };

    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un toro (donut) con parámetros personalizables
   */
  createTorus(radius = 0.5, tube = 0.2, radialSegments = 16, tubularSegments = 32, material = null) {
    const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'torus',
      radius,
      tube,
      radialSegments,
      tubularSegments,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un octaedro (dado de 8 caras)
   */
  createOctahedron(radius = 0.5, detail = 0, material = null) {
    const geometry = new THREE.OctahedronGeometry(radius, detail);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'octahedron',
      radius,
      detail,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un tetraedro (pirámide triangular)
   */
  createTetrahedron(radius = 0.5, detail = 0, material = null) {
    const geometry = new THREE.TetrahedronGeometry(radius, detail);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'tetrahedron',
      radius,
      detail,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un icosaedro (dado de 20 caras)
   */
  createIcosahedron(radius = 0.5, detail = 0, material = null) {
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'icosahedron',
      radius,
      detail,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un dodecaedro (dado de 12 caras)
   */
  createDodecahedron(radius = 0.5, detail = 0, material = null) {
    const geometry = new THREE.DodecahedronGeometry(radius, detail);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'dodecahedron',
      radius,
      detail,
      createdAt: Date.now()
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un anillo (toro delgado)
   */
  createRing(innerRadius = 0.3, outerRadius = 0.5, segments = 32, material = null) {
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'ring',
      innerRadius,
      outerRadius,
      segments,
      createdAt: Date.now()
    };

    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un círculo (disco)
   */
  createCircle(radius = 0.5, segments = 32, material = null) {
    const geometry = new THREE.CircleGeometry(radius, segments);
    const mesh = new THREE.Mesh(geometry, material || this.defaultMaterial);
    
    mesh.userData = {
      type: 'circle',
      radius,
      segments,
      createdAt: Date.now()
    };

    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Crea un grupo vacío para organizar objetos
   */
  createGroup(name = 'Group') {
    const group = new THREE.Group();
    group.name = name;
    
    group.userData = {
      type: 'group',
      name,
      createdAt: Date.now()
    };
    
    return group;
  }

  /**
   * Crea una luz puntual
   */
  createPointLight(color = 0xffffff, intensity = 1, distance = 0) {
    const light = new THREE.PointLight(color, intensity, distance);
    
    light.userData = {
      type: 'pointLight',
      color,
      intensity,
      distance,
      createdAt: Date.now()
    };
    
    return light;
  }

  /**
   * Crea una luz direccional
   */
  createDirectionalLight(color = 0xffffff, intensity = 1) {
    const light = new THREE.DirectionalLight(color, intensity);
    
    light.userData = {
      type: 'directionalLight',
      color,
      intensity,
      createdAt: Date.now()
    };
    
    return light;
  }

  /**
   * Crea una luz ambiental
   */
  createAmbientLight(color = 0x404040, intensity = 0.4) {
    const light = new THREE.AmbientLight(color, intensity);
    
    light.userData = {
      type: 'ambientLight',
      color,
      intensity,
      createdAt: Date.now()
    };
    
    return light;
  }

  /**
   * Crea una luz de área rectangular
   */
  createRectAreaLight(color = 0xffffff, intensity = 1, width = 1, height = 1) {
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    
    light.userData = {
      type: 'rectAreaLight',
      color,
      intensity,
      width,
      height,
      createdAt: Date.now()
    };
    
    return light;
  }

  /**
   * Crea una cámara perspectiva
   */
  createPerspectiveCamera(fov = 75, aspect = 1, near = 0.1, far = 1000) {
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    camera.userData = {
      type: 'perspectiveCamera',
      fov,
      aspect,
      near,
      far,
      createdAt: Date.now()
    };
    
    return camera;
  }

  /**
   * Crea una cámara ortográfica
   */
  createOrthographicCamera(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 1000) {
    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    
    camera.userData = {
      type: 'orthographicCamera',
      left,
      right,
      top,
      bottom,
      near,
      far,
      createdAt: Date.now()
    };
    
    return camera;
  }

  /**
   * Obtiene el material por defecto
   */
  getDefaultMaterial() {
    return this.defaultMaterial;
  }

  /**
   * Crea un material personalizado
   */
  createMaterial(options = {}) {
    const material = new THREE.MeshStandardMaterial({
      color: options.color || 0x808080,
      roughness: options.roughness || 0.5,
      metalness: options.metalness || 0.1,
      transparent: options.transparent || false,
      opacity: options.opacity || 1.0,
      wireframe: options.wireframe || false,
      ...options
    });
    
    return material;
  }
}

export { ObjectCreators }; 