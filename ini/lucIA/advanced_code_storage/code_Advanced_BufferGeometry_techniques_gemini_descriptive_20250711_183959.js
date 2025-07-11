// Código extraído de: Advanced BufferGeometry techniques
// API: Gemini
// Fecha: 2025-07-11 18:39:40

// Ejemplo 1
import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();

// Crear un array tipado para las posiciones de los vértices (x, y, z)
const positions = new Float32Array([
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0,
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
]);

// Crear un BufferAttribute para las posiciones
const positionAttribute = new THREE.BufferAttribute(positions, 3); // 3 componentes por vértice (x, y, z)

// Asignar el atributo a la geometría
geometry.setAttribute('position', positionAttribute);

// Índices para definir las caras (triángulos en este caso)
const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3,
]);

geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // 1 valor por índice

// Normales (opcional, pero recomendado para la iluminación)
const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
]);
geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

// ... otros atributos como color, UVs, etc.

const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

// Ejemplo 2
const widthSegments = 32;
const heightSegments = 16;
const radius = 1;

const positions = [];
const indices = [];
const uvs = [];

for (let y = 0; y <= heightSegments; y++) {
  const v = y / heightSegments;
  for (let x = 0; x <= widthSegments; x++) {
    const u = x / widthSegments;

    const theta = u * Math.PI * 2;
    const phi = v * Math.PI;

    const px = radius * Math.sin(phi) * Math.cos(theta);
    const py = radius * Math.cos(phi);
    const pz = radius * Math.sin(phi) * Math.sin(theta);

    positions.push(px, py, pz);
    uvs.push(u, v);
  }
}

// ... Calcular los índices para los triángulos ...

// Convertir arrays a Typed Arrays y crear BufferAttributes
// ...

