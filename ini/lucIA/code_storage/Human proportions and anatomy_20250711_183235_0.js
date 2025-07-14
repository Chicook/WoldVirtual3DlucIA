import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Unidad base (tamaño de la cabeza)
const headSize = 1;

// Cabeza
const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize);
const headMaterial = new THREE.MeshBasicMaterial( { color: 0xffcc99 } );
const head = new THREE.Mesh( headGeometry, headMaterial );
scene.add( head );

// Torso
const torsoGeometry = new THREE.BoxGeometry(headSize * 1.5, headSize * 3, headSize * 0.75);
const torsoMaterial = new THREE.MeshBasicMaterial( { color: 0x336699 } );
const torso = new THREE.Mesh( torsoGeometry, torsoMaterial );
torso.position.y = -headSize * 1.5; // Ajustar posición debajo de la cabeza
scene.add( torso );

// ... (Brazos y piernas se añadirían de forma similar)

camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();