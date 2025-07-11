import * as THREE from 'three';

// Escena, cámara y renderizador (configuración básica)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Cargar la textura
const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load( 'wood.jpg' ); // Reemplaza 'wood.jpg' con la ruta a tu imagen

// Geometría del cubo
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// Material con la textura
const material = new THREE.MeshBasicMaterial( { map: woodTexture } );

// Crear el cubo y añadirlo a la escena
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Posicionar la cámara
camera.position.z = 5;

// Renderizar la escena
function animate() {
	requestAnimationFrame( animate );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();
