import * as THREE from 'three';

// Escena, cámara y renderizador (configuración básica)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Crear un cubo
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Traslación: Mover el cubo 2 unidades a la derecha en el eje X
cube.position.x = 2;

// Rotación: Rotar el cubo 45 grados en el eje Y
cube.rotation.y = THREE.MathUtils.degToRad(45);

// Escalado: Duplicar el tamaño del cubo en todas las direcciones
cube.scale.set(2, 2, 2);


// Posicionar la cámara para ver el cubo
camera.position.z = 5;

// Renderizar la escena
function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();