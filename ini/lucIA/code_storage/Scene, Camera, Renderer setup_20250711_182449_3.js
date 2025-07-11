// Función de animación
function animate() {
    requestAnimationFrame(animate); // Bucle recursivo

    // Ejemplo de animación: rotar un cubo (si existiera en la escena)
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera); // Renderizar la escena desde la perspectiva de la cámara
}

animate(); // Iniciar el bucle de renderizado