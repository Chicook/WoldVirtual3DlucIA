import * as THREE from 'three';

// Geometría sin indexar (Ejemplo: un cubo simple)
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1, // front
  -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1, -1, // back
  // ... (resto de vértices)
]);
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );


// Geometría indexada (Mismo cubo)
const indexedGeometry = new THREE.BufferGeometry();
const indexedVertices = new Float32Array([
  -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1, // Solo 8 vértices únicos
]);
const indices = new Uint16Array([
  0, 1, 2,  0, 2, 3, // front
  4, 5, 6,  4, 6, 7, // back
  // ... (resto de índices)
]);
indexedGeometry.setAttribute( 'position', new THREE.BufferAttribute( indexedVertices, 3 ) );
indexedGeometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );

// El material y la creación del mesh serían iguales para ambas geometrías
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const mesh = new THREE.Mesh( indexedGeometry, material );
scene.add( mesh );