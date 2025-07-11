// Código extraído de: Procedural geometry generation
// API: Gemini
// Fecha: 2025-07-11 18:38:19

// Ejemplo 1
import * as THREE from 'three';

// Crear la escena, cámara y renderizador (asumo que ya tienes esto configurado)

const geometry = new THREE.BufferGeometry();
const width = 100;
const height = 100;
const segments = 100;

const vertices = [];
const indices = [];
const uvs = [];

for (let i = 0; i <= segments; i++) {
  for (let j = 0; j <= segments; j++) {
    const x = (i / segments) * width - width / 2;
    const y = (j / segments) * height - height / 2;
    const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5; // Altura procedural

    vertices.push(x, z, y); // Notar el orden z, y para Three.js
    uvs.push(i / segments, j / segments);

    if (i < segments && j < segments) {
      const a = i * (segments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (segments + 1) + j;
      const d = c + 1;

      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
geometry.setIndex(indices);
geometry.computeVertexNormals(); // Importante para la iluminación

const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

