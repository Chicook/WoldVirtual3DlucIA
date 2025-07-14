// Código extraído de: Procedural geometry generation
// API: Claude
// Fecha: 2025-07-11 21:39:08

// Ejemplo 1
class ProceduralGeometryGenerator {
  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.parameters = {
      segments: 64,
      radius: 1,
      noise: 0.2
    };
  }

  generateTerrain() {
    const positions = [];
    const normals = [];
    const uvs = [];
    
    // Algoritmo de generación usando Simplex Noise
    for(let i = 0; i <= this.parameters.segments; i++) {
      for(let j = 0; j <= this.parameters.segments; j++) {
        const x = (i / this.parameters.segments - 0.5) * 2;
        const z = (j / this.parameters.segments - 0.5) * 2;
        
        // Aplicamos ruido para altura
        const noise = this.simplexNoise.noise2D(x * 5, z * 5);
        const y = noise * this.parameters.noise;
        
        positions.push(x, y, z);
        
        // Calculamos normales
        const normal = new THREE.Vector3(x, y, z).normalize();
        normals.push(normal.x, normal.y, normal.z);
        
        uvs.push(i / this.parameters.segments, j / this.parameters.segments);
      }
    }

    this.geometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('normal',
      new THREE.Float32BufferAttribute(normals, 3));
    this.geometry.setAttribute('uv',
      new THREE.Float32BufferAttribute(uvs, 2));
      
    this.geometry.computeVertexNormals();
    
    return this.geometry;
  }
}

// Ejemplo 2
const generator = new ProceduralGeometryGenerator();
const geometry = generator.generateTerrain();
const material = new THREE.MeshStandardMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Ejemplo 3
class LODManager {
  updateLOD(camera) {
    const distance = camera.position.distanceTo(mesh.position);
    this.parameters.segments = Math.floor(64 * (1 / distance));
    this.regenerateGeometry();
  }
}

// Ejemplo 4
try {
  if (this.parameters.segments > 256) {
    throw new Error('Segment count exceeds maximum allowed');
  }
  // Verificación de memoria disponible
  const estimatedVertices = this.parameters.segments * this.parameters.segments;
  if (estimatedVertices > 1000000) {
    console.warn('High vertex count may impact performance');
  }
} catch (error) {
  console.error('Geometry generation failed:', error);
  // Fallback a geometría simple
  return new THREE.PlaneGeometry(1, 1);
}

// Ejemplo 5
// Sistema de eventos para actualización
this.addEventListener('parameterChanged', () => {
  this.regenerateGeometry();
  this.dispatchEvent({ type: 'geometryUpdated' });
});

// Integración con sistemas de física
this.geometry.computeBoundingBox();
const collider = new CANNON.Trimesh(
  positions,
  indices
);

