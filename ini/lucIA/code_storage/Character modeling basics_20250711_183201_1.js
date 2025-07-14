// Ejemplo: Creando una cara simple con BufferGeometry
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1.0, -1.0,  0.0,
   1.0, -1.0,  0.0,
   0.0,  1.0,  0.0,
]);
// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const face = new THREE.Mesh( geometry, material );
scene.add( face );
