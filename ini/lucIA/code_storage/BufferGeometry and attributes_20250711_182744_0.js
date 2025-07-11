import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Creamos una BufferGeometry
const geometry = new THREE.BufferGeometry();

// Definimos las posiciones de los vértices
const vertices = new Float32Array( [
    0, 1, 0, // Vértice 1
    -1, -1, 0, // Vértice 2
    1, -1, 0  // Vértice 3
] );

// Creamos un BufferAttribute para la posición
const positionAttribute = new THREE.BufferAttribute( vertices, 3 ); // 3 componentes por vértice (x, y, z)

// Añadimos el atributo a la geometría
geometry.setAttribute( 'position', positionAttribute );

// Creamos el material
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

// Creamos la malla
const mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();