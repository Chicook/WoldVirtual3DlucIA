import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();

// Vértices (posiciones x, y, z)
const vertices = new Float32Array([
  -1.0, -1.0,  0.0,
   1.0, -1.0,  0.0,
   1.0,  1.0,  0.0,
  -1.0,  1.0,  0.0,
]);

// Índices (definen las caras triangulares)
const indices = new Uint16Array([
  0, 1, 2,
  2, 3, 0,
]);

// UVs (coordenadas de textura)
const uvs = new Float32Array([
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
]);


geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

// Calcular las normales (importante para la iluminación)
geometry.computeVertexNormals();

const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);