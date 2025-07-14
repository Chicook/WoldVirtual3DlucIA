// Código extraído de: Procedural geometry generation
// API: Gemini
// Fecha: 2025-07-11 21:36:22

// Ejemplo 1
import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const perlin = new ImprovedNoise();
const geometry = new THREE.BufferGeometry();
const vertices = [];
const indices = [];

const size = 10;
const segments = 100;

for (let i = 0; i <= segments; i++) {
  for (let j = 0; j <= segments; j++) {
    const x = (i / segments - 0.5) * size;
    const z = (j / segments - 0.5) * size;
    const y = perlin.noise(x / 2, z / 2, 0) * 2; // Ajusta la amplitud de las ondulaciones

    vertices.push(x, y, z);

    if (i < segments && j < segments) {
      const a = i * (segments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (segments + 1) + j;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals(); // Importante para la iluminación

const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
const plane = new THREE.Mesh(geometry, material);

scene.add(plane);

