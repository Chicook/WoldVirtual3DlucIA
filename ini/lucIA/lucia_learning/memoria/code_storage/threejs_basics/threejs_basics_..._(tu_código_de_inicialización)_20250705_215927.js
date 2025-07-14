/*
 * ... (Tu código de inicialización)
 * Pregunta: ¿Cómo implementar controles de cámara para ver el avatar desde diferentes ángulos?
 * 
 * ID: threejs_basics_..._(tu_código_de_inicialización)_20250705_215927
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:59:27.682235
 * Actualizado: 2025-07-05T21:59:27.682235
 * 
 * Tags: scene, camera, animation, theta, phi, threejs_basics, updateCameraPosition, animate, avatar, speed, radius
 * Dependencias: 
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

// ... (Tu código de inicialización)

let theta = 0; // Ángulo horizontal
let phi = Math.PI / 2; // Ángulo vertical
const radius = 5; // Distancia de la cámara al objetivo

function updateCameraPosition() {
  camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
  camera.position.y = radius * Math.cos(phi);
  camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
  camera.lookAt(0, 1, 0); // Mira al objetivo (ej. la posición del avatar)
}

function animate() {
  requestAnimationFrame(animate);

  // Ejemplo de control con teclado (puedes adaptarlo a tus necesidades)
  const speed = 0.1;
  if (keyboard.pressed("left")) {
    theta -= speed;
  }
  if (keyboard.pressed("right")) {
    theta += speed;
  }
  if (keyboard.pressed("up")) {
    phi -= speed;
    phi = Math.max(0.1, phi); // Limita el ángulo vertical
  }
  if (keyboard.pressed("down")) {
    phi += speed;
    phi = Math.min(Math.PI - 0.1, phi); // Limita el ángulo vertical
  }

  updateCameraPosition();
  renderer.render(scene, camera);
}

animate();