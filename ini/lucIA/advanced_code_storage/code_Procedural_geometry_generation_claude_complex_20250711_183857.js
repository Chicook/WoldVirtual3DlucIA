// Código extraído de: Procedural geometry generation
// API: Claude
// Fecha: 2025-07-11 18:38:37

// Ejemplo 1
class ProceduralGeometryGenerator {
    constructor() {
        // Configuración base
        this.parameters = {
            resolution: 32,
            amplitude: 1.0,
            frequency: 0.5,
            persistence: 0.5
        };
    }

    generateTerrain(width, height) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const uvs = [];
        const indices = [];

        // Generación de vértices usando Simplex Noise
        for(let i = 0; i < this.parameters.resolution; i++) {
            for(let j = 0; j < this.parameters.resolution; j++) {
                const x = (i / this.parameters.resolution - 0.5) * width;
                const z = (j / this.parameters.resolution - 0.5) * height;
                
                // Implementación de múltiples octavas de ruido
                let y = 0;
                let amplitude = this.parameters.amplitude;
                let frequency = this.parameters.frequency;
                
                for(let octave = 0; octave < 4; octave++) {
                    y += amplitude * this.noise(x * frequency, z * frequency);
                    amplitude *= this.parameters.persistence;
                    frequency *= 2;
                }

                vertices.push(x, y, z);
                uvs.push(i / this.parameters.resolution, j / this.parameters.resolution);
            }
        }

        // Generación de índices para triangulación
        this.generateIndices(indices);

        // Configuración de atributos
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        
        // Cálculo de normales para iluminación
        geometry.computeVertexNormals();

        return geometry;
    }

    // Método de optimización para geometrías dinámicas
    updateGeometry(geometry, time) {
        const positions = geometry.attributes.position.array;
        
        // Actualización eficiente usando TypedArrays
        for(let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.01;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
}

// Ejemplo 2
const generator = new ProceduralGeometryGenerator();
const terrain = generator.generateTerrain(100, 100);
const material = new THREE.MeshPhongMaterial({ 
    wireframe: false,
    vertexColors: true 
});
const mesh = new THREE.Mesh(terrain, material);

// Ejemplo 3
function animate(time) {
    generator.updateGeometry(terrain, time);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Ejemplo 4
try {
    if (this.parameters.resolution > 256) {
        throw new Error('Resolution too high - performance impact');
    }
    // Validación de parámetros
} catch (error) {
    console.error('Procedural Generation Error:', error);
    // Fallback a geometría básica
}

