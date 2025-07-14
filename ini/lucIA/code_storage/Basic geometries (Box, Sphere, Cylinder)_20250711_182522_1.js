// ... (configuración básica de escena, cámara y renderizador - igual que el ejemplo anterior)

// SphereGeometry (radio, segmentos de ancho, segmentos de alto)
const geometry = new THREE.SphereGeometry( 1, 32, 32 ); // Esfera de radio 1

const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); // Rojo
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

// ... (resto del código - igual que el ejemplo anterior)