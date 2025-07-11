// Código extraído de: Procedural geometry generation
// API: Gemini
// Fecha: 2025-07-11 21:38:49

// Ejemplo 1
import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();
const width = 10;
const height = 10;
const segments = 100;

const vertices = [];
const indices = [];
const uvs = [];

for (let y = 0; y <= segments; y++) {
  const v = y / segments;
  for (let x = 0; x <= segments; x++) {
    const u = x / segments;
    const xPos = width * u - width / 2;
    const yPos = height * v - height / 2;
    const zPos = Math.sin(u * Math.PI * 2) * Math.cos(v * Math.PI * 2); // Ondulación

    vertices.push(xPos, yPos, zPos);
    uvs.push(u, v);
  }
}

for (let y = 0; y < segments; y++) {
  for (let x = 0; x < segments; x++) {
    const a = x + (y * (segments + 1));
    const b = x + ((y + 1) * (segments + 1));
    const c = (x + 1) + ((y + 1) * (segments + 1));
    const d = (x + 1) + (y * (segments + 1));

    indices.push(a, b, d);
    indices.push(b, c, d);
  }
}

geometry.setIndex(indices);
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
geometry.computeVertexNormals();

const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

