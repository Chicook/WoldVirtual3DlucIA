// Código extraído de: Advanced BufferGeometry techniques
// API: Claude
// Fecha: 2025-07-11 18:39:59

// Ejemplo 1
// Creación de BufferGeometry optimizada
const geometry = new THREE.BufferGeometry();

// Arrays tipados para mejor rendimiento
const vertices = new Float32Array([
    -1.0, -1.0, 0.0,  // v0
     1.0, -1.0, 0.0,  // v1
     1.0,  1.0, 0.0   // v2
]);

// Atributos personalizados
const colors = new Float32Array([
    1.0, 0.0, 0.0,  // r,g,b
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
]);

// Índices para optimización
const indices = new Uint16Array([0, 1, 2]);

// Ejemplo 2
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

// Ejemplo 3
geometry.computeVertexNormals();
geometry.computeBoundingSphere();
geometry.computeBoundingBox();

// Ejemplo 4
const positions = geometry.attributes.position;
positions.needsUpdate = true;

function updateGeometry() {
    for(let i = 0; i < positions.count; i++) {
        positions.setXYZ(i, 
            positions.getX(i) + Math.random() * 0.01,
            positions.getY(i) + Math.random() * 0.01,
            positions.getZ(i) + Math.random() * 0.01
        );
    }
}

// Ejemplo 5
try {
    if (vertices.length % 3 !== 0) {
        throw new Error('Vertex data must be in sets of 3');
    }
    
    if (!geometry.attributes.position) {
        console.warn('Missing position attribute');
    }
} catch (error) {
    console.error('BufferGeometry error:', error);
    // Fallback a geometría básica
    return new THREE.BoxGeometry();
}

// Ejemplo 6
// Sistema de instancing para múltiples objetos
const instancedGeometry = new THREE.InstancedBufferGeometry();
instancedGeometry.copy(geometry);

const instanceCount = 1000;
const instanceMatrix = new Float32Array(instanceCount * 16);
// Configuración de matrices de transformación...

