import * as THREE from 'three';

// ============================================================================
// 🛠️ UTILIDADES THREE.JS - Funciones Auxiliares
// ============================================================================

/**
 * Crear geometría básica con configuración optimizada
 */
export const createGeometry = {
  /**
   * Crear cubo optimizado
   */
  cube: (size: number = 1, segments: number = 1): THREE.BoxGeometry => {
    return new THREE.BoxGeometry(size, size, size, segments, segments, segments);
  },

  /**
   * Crear esfera optimizada
   */
  sphere: (radius: number = 1, segments: number = 16): THREE.SphereGeometry => {
    return new THREE.SphereGeometry(radius, segments, segments);
  },

  /**
   * Crear cilindro optimizado
   */
  cylinder: (radius: number = 1, height: number = 2, segments: number = 16): THREE.CylinderGeometry => {
    return new THREE.CylinderGeometry(radius, radius, height, segments);
  },

  /**
   * Crear plano optimizado
   */
  plane: (width: number = 1, height: number = 1, segments: number = 1): THREE.PlaneGeometry => {
    return new THREE.PlaneGeometry(width, height, segments, segments);
  },

  /**
   * Crear geometría personalizada
   */
  custom: (vertices: number[], indices: number[], normals?: number[], uvs?: number[]): THREE.BufferGeometry => {
    const geometry = new THREE.BufferGeometry();
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    
    if (normals) {
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    }
    
    if (uvs) {
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
    
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
  }
};

/**
 * Crear materiales con configuración optimizada
 */
export const createMaterial = {
  /**
   * Material estándar optimizado
   */
  standard: (options: {
    color?: THREE.ColorRepresentation;
    roughness?: number;
    metalness?: number;
    map?: THREE.Texture;
    normalMap?: THREE.Texture;
    aoMap?: THREE.Texture;
    emissiveMap?: THREE.Texture;
  } = {}): THREE.MeshStandardMaterial => {
    return new THREE.MeshStandardMaterial({
      color: options.color || 0xffffff,
      roughness: options.roughness ?? 0.5,
      metalness: options.metalness ?? 0.1,
      map: options.map,
      normalMap: options.normalMap,
      aoMap: options.aoMap,
      emissiveMap: options.emissiveMap
    });
  },

  /**
   * Material básico optimizado
   */
  basic: (options: {
    color?: THREE.ColorRepresentation;
    map?: THREE.Texture;
    transparent?: boolean;
    opacity?: number;
  } = {}): THREE.MeshBasicMaterial => {
    return new THREE.MeshBasicMaterial({
      color: options.color || 0xffffff,
      map: options.map,
      transparent: options.transparent || false,
      opacity: options.opacity || 1.0
    });
  },

  /**
   * Material emisivo
   */
  emissive: (options: {
    color?: THREE.ColorRepresentation;
    intensity?: number;
  } = {}): THREE.MeshStandardMaterial => {
    return new THREE.MeshStandardMaterial({
      color: options.color || 0xffffff,
      emissive: options.color || 0xffffff,
      emissiveIntensity: options.intensity || 1.0
    });
  },

  /**
   * Material translúcido
   */
  translucent: (options: {
    color?: THREE.ColorRepresentation;
    opacity?: number;
    roughness?: number;
  } = {}): THREE.MeshStandardMaterial => {
    return new THREE.MeshStandardMaterial({
      color: options.color || 0xffffff,
      transparent: true,
      opacity: options.opacity || 0.5,
      roughness: options.roughness || 0.1
    });
  }
};

/**
 * Utilidades de transformación
 */
export const transform = {
  /**
   * Crear matriz de transformación
   */
  createMatrix: (position?: THREE.Vector3, rotation?: THREE.Euler, scale?: THREE.Vector3): THREE.Matrix4 => {
    const matrix = new THREE.Matrix4();
    
    if (position) matrix.setPosition(position);
    if (rotation) matrix.makeRotationFromEuler(rotation);
    if (scale) matrix.scale(scale);
    
    return matrix;
  },

  /**
   * Aplicar transformación a objeto
   */
  applyToObject: (object: THREE.Object3D, matrix: THREE.Matrix4): void => {
    object.applyMatrix4(matrix);
  },

  /**
   * Interpolar entre dos posiciones
   */
  lerpPosition: (start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 => {
    return start.clone().lerp(end, t);
  },

  /**
   * Interpolar entre dos rotaciones
   */
  lerpRotation: (start: THREE.Euler, end: THREE.Euler, t: number): THREE.Euler => {
    const quaternion = new THREE.Quaternion();
    quaternion.slerpQuaternions(
      start.toQuaternion(),
      end.toQuaternion(),
      t
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  },

  /**
   * Crear curva de Bezier
   */
  createBezierCurve: (points: THREE.Vector3[]): THREE.CubicBezierCurve3 => {
    if (points.length < 4) {
      throw new Error('Bezier curve requires at least 4 points');
    }
    
    return new THREE.CubicBezierCurve3(
      points[0],
      points[1],
      points[2],
      points[3]
    );
  }
};

/**
 * Utilidades de optimización
 */
export const optimization = {
  /**
   * Crear LOD (Level of Detail)
   */
  createLOD: (object: THREE.Object3D, distances: number[]): THREE.LOD => {
    const lod = new THREE.LOD();
    
    distances.forEach((distance, index) => {
      const level = object.clone();
      // Aplicar optimizaciones según el nivel
      if (index > 0) {
        level.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Reducir geometría
            if (child.geometry) {
              const simplified = child.geometry.clone();
              // Simplificar geometría
              child.geometry = simplified;
            }
          }
        });
      }
      lod.addLevel(level, distance);
    });
    
    return lod;
  },

  /**
   * Optimizar geometría
   */
  optimizeGeometry: (geometry: THREE.BufferGeometry, targetTriangles: number): THREE.BufferGeometry => {
    // Implementar simplificación de geometría
    // Esto requeriría una biblioteca adicional como SimplifyModifier
    return geometry;
  },

  /**
   * Comprimir texturas
   */
  compressTexture: (texture: THREE.Texture, quality: number = 0.8): void => {
    if (texture.image) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;
        ctx.drawImage(texture.image, 0, 0);
        
        // Comprimir usando canvas
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            texture.image.src = url;
            texture.needsUpdate = true;
          }
        }, 'image/jpeg', quality);
      }
    }
  }
};

/**
 * Utilidades de física
 */
export const physics = {
  /**
   * Crear bounding box
   */
  createBoundingBox: (object: THREE.Object3D): THREE.Box3 => {
    const box = new THREE.Box3();
    box.setFromObject(object);
    return box;
  },

  /**
   * Detectar colisión entre objetos
   */
  checkCollision: (object1: THREE.Object3D, object2: THREE.Object3D): boolean => {
    const box1 = physics.createBoundingBox(object1);
    const box2 = physics.createBoundingBox(object2);
    return box1.intersectsBox(box2);
  },

  /**
   * Calcular distancia entre objetos
   */
  getDistance: (object1: THREE.Object3D, object2: THREE.Object3D): number => {
    return object1.position.distanceTo(object2.position);
  },

  /**
   * Aplicar gravedad a objeto
   */
  applyGravity: (object: THREE.Object3D, gravity: THREE.Vector3, deltaTime: number): void => {
    if (object.userData.velocity) {
      object.userData.velocity.add(gravity.clone().multiplyScalar(deltaTime));
      object.position.add(object.userData.velocity.clone().multiplyScalar(deltaTime));
    }
  }
};

/**
 * Utilidades de animación
 */
export const animation = {
  /**
   * Crear animación de rotación
   */
  createRotationAnimation: (object: THREE.Object3D, axis: THREE.Vector3, speed: number) => {
    return (deltaTime: number) => {
      object.rotateOnAxis(axis, speed * deltaTime);
    };
  },

  /**
   * Crear animación de movimiento
   */
  createMovementAnimation: (object: THREE.Object3D, path: THREE.Vector3[], speed: number) => {
    let currentIndex = 0;
    let progress = 0;
    
    return (deltaTime: number) => {
      if (currentIndex < path.length - 1) {
        progress += speed * deltaTime;
        
        if (progress >= 1) {
          progress = 0;
          currentIndex++;
        }
        
        const start = path[currentIndex];
        const end = path[currentIndex + 1];
        object.position.lerpVectors(start, end, progress);
      }
    };
  },

  /**
   * Crear animación de escala
   */
  createScaleAnimation: (object: THREE.Object3D, minScale: number, maxScale: number, speed: number) => {
    let time = 0;
    
    return (deltaTime: number) => {
      time += deltaTime;
      const scale = minScale + (maxScale - minScale) * (Math.sin(time * speed) * 0.5 + 0.5);
      object.scale.setScalar(scale);
    };
  }
};

/**
 * Utilidades de carga de assets
 */
export const assetLoader = {
  /**
   * Cargar textura con manejo de errores
   */
  loadTexture: (url: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  },

  /**
   * Cargar modelo GLTF
   */
  loadGLTF: (url: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error)
      );
    });
  },

  /**
   * Cargar audio
   */
  loadAudio: (url: string, listener: THREE.AudioListener): Promise<THREE.Audio> => {
    return new Promise((resolve, reject) => {
      const loader = new THREE.AudioLoader();
      const audio = new THREE.Audio(listener);
      
      loader.load(
        url,
        (buffer) => {
          audio.setBuffer(buffer);
          resolve(audio);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }
};

/**
 * Utilidades de renderizado
 */
export const rendering = {
  /**
   * Crear post-processing básico
   */
  createPostProcessing: (renderer: THREE.WebGLRenderer) => {
    // Implementar efectos de post-processing
    // Requeriría bibliotecas adicionales como postprocessing
    return {
      render: (scene: THREE.Scene, camera: THREE.Camera) => {
        renderer.render(scene, camera);
      }
    };
  },

  /**
   * Crear render target
   */
  createRenderTarget: (width: number, height: number): THREE.WebGLRenderTarget => {
    return new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding
    });
  },

  /**
   * Capturar screenshot
   */
  captureScreenshot: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): string => {
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  }
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default {
  createGeometry,
  createMaterial,
  transform,
  optimization,
  physics,
  animation,
  assetLoader,
  rendering
}; 