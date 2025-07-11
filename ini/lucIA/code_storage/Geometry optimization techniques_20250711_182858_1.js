import * as THREE from 'three';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

const combinedGeometry = new THREE.BufferGeometry();
const meshes = [];
for ( let i = 0; i < 100; i ++ ) {
  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( Math.random() * 10, Math.random() * 10, Math.random() * 10 );
  meshes.push( mesh );
}

// Combinar las geometrías
meshes.forEach(mesh => combinedGeometry.merge(mesh.geometry, mesh.matrix));


const combinedMesh = new THREE.Mesh(combinedGeometry, material);
scene.add(combinedMesh);