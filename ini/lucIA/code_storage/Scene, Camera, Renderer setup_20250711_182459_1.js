     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     camera.position.z = 5; // Posicionar la cámara en el eje Z
     camera.lookAt(scene.position); // Hacer que la cámara mire hacia el centro de la escena