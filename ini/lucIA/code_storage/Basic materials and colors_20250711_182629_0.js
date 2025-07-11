import * as THREE from 'three';

// Creamos una escena, una cámara y un renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Creamos una geometría (una caja en este caso)
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// Creamos un material básico con color rojo
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

// Creamos una malla combinando la geometría y el material
const cube = new THREE.Mesh( geometry, material );

// Añadimos la malla a la escena
scene.add( cube );

// Posicionamos la cámara para ver el cubo
camera.position.z = 5;

// Función de animación para renderizar la escena
function animate() {
	requestAnimationFrame( animate );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}

animate();