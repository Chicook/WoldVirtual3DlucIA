// Código extraído de: Procedural geometry generation
// API: Claude
// Fecha: 2025-07-11 21:36:40

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

  generateTerrain(width, height) {
    const positions = [];
    const normals = [];
    const uvs = [];

    // Implementación de Simplex Noise para variación natural
    const simplex = new SimplexNoise();
    
    for(let i = 0; i < width; i++) {
      for(let j = 0; j < height; j++) {
        // Generación de vértices con ruido
        const x = i / width - 0.5;
        const z = j / height - 0.5;
        const y = simplex.noise2D(x * 5, z * 5) * this.parameters.noise;
        
        positions.push(x, y, z);
        
        // Cálculo de normales para iluminación
        const normal = this.calculateNormal(x, y, z);
        normals.push(...normal);
        
        uvs.push(i/width, j/height);
      }
    }

    this.geometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('normal', 
      new THREE.Float32BufferAttribute(normals, 3));
    this.geometry.setAttribute('uv', 
      new THREE.Float32BufferAttribute(uvs, 2));
  }
}

// Ejemplo 2
const generator = new ProceduralGeometryGenerator();
const terrain = generator.generateTerrain(128, 128);

// Ejemplo 3
const material = new THREE.MeshStandardMaterial({
  roughness: 0.8,
  metalness: 0.2,
  vertexColors: true
});

// Ejemplo 4
const mesh = new THREE.Mesh(generator.geometry, material);
scene.add(mesh);

// Ejemplo 5
handleEdgeCases() {
  // Validación de parámetros
  if (this.parameters.segments < 1) {
    throw new Error('Segments must be >= 1');
  }
  
  // Límites de memoria
  const vertexCount = this.parameters.segments ** 2;
  if (vertexCount > 1000000) {
    console.warn('High vertex count may impact performance');
  }
  
  // Suavizado de bordes
  this.smoothEdges();
}

// Ejemplo 6
class TerrainSystem {
  constructor(proceduralGenerator) {
    this.generator = proceduralGenerator;
    this.physics = new AmmoPhysics();
    this.vegetation = new VegetationSystem();
  }

  integrate() {
    // Integración con física
    this.physics.addTerrain(this.generator.geometry);
    
    // Sistema de vegetación
    this.vegetation.populate(this.generator.geometry);
  }
}

