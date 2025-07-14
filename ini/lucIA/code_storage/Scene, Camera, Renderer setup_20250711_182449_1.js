// PerspectiveCamera (fov, aspect ratio, near, far)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Posicionar la cámara (inicialmente en el origen 0,0,0)
camera.position.z = 5; // Mover la cámara 5 unidades en el eje Z