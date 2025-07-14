import * as THREE from 'three';

// Crear una nueva geometría de buffer
const geometry = new THREE.BufferGeometry();

// Número de segmentos en X y Z
const segmentsX = 20;
const segmentsZ = 20;

// Crear arrays para las posiciones, UVs e índices
const vertices = [];
const uvs = [];
const indices = [];

// Generar vértices, UVs e índices
for (let z = 0; z <= segmentsZ; z++) {
  for (let x = 0; x <= segmentsX; x++) {
    const u = x / segmentsX;
    const v = z / segmentsZ;

    // Calcular la posición del vértice con la onda sinusoidal
    const y = Math.sin(u * Math.PI * 2);
    vertices.push(x, y, z);

    // Calcular las coordenadas UV
    uvs.push(u, v);
  }
}

// Generar los índices para las caras
for (let z = 0; z < segmentsZ; z++) {
  for (let x = 0; x < segmentsX; x++) {
    const a = x + (z * (segmentsX + 1));
    const b = x + ((z + 1) * (segmentsX + 1));
    const c = x + 1 + ((z + 1) * (segmentsX + 1));
    const d = x + 1 + (z * (segmentsX + 1));

    // Definir las caras (triángulos)
    indices.push(a, b, d);
    indices.push(b, c, d);
  }
}

// Crear TypedArrays a partir de los arrays de JavaScript
const positionAttribute = new THREE.Float32BufferAttribute(new Float32Array(vertices), 3);
const uvAttribute = new THREE.Float32BufferAttribute(new Float32Array(uvs), 2);
const indexAttribute = new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1);

// Asignar los atributos a la geometría
geometry.setAttribute('position', positionAttribute);
geometry.setAttribute('uv', uvAttribute);
geometry.setIndex(indexAttribute);

// Calcular las normales de las caras para la iluminación
geometry.computeVertexNormals();

// Crear un material y una malla
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // wireframe para visualizar la geometría
const mesh = new THREE.Mesh(geometry, material);

// Añadir la malla a la escena
scene.add(mesh);