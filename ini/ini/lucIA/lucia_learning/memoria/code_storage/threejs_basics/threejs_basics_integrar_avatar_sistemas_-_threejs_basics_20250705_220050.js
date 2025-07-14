/*
 * integrar avatar sistemas - Threejs Basics
 * Pregunta: ¿Cómo integrar el avatar con sistemas de física para movimientos realistas?
 * 
 * ID: threejs_basics_integrar_avatar_sistemas_-_threejs_basics_20250705_220050
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T22:00:50.526439
 * Actualizado: 2025-07-05T22:00:50.526439
 * 
 * Tags: scene, groundBody, groundMesh, camera, world, groundGeometry, groundMaterial, geometry, material, animation, mesh, three.js, threejs_basics, avatarBody, updateAvatarPosition, jump, animate, avatar
 * Dependencias: cannon-es, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Inicialización de Three.js (escena, cámara, renderizador, etc.)
// ...

// Inicialización de Cannon.js
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Gravedad

// Cuerpo físico del avatar
const avatarBody = new CANNON.Body({
    mass: 50, // Masa del avatar
    shape: new CANNON.Capsule(1, 0.5), // Forma simplificada (cápsula)
    position: new CANNON.Vec3(0, 2, 0), // Posición inicial
});
world.addBody(avatarBody);


// Función para actualizar la posición del avatar en Three.js con la del cuerpo físico
function updateAvatarPosition() {
    avatar.position.copy(avatarBody.position);
    avatar.quaternion.copy(avatarBody.quaternion);
}


// Bucle de animación
function animate() {
    requestAnimationFrame(animate);

    // Paso de simulación del motor de física
    world.fixedStep(); 

    // Actualizar la posición del avatar en Three.js
    updateAvatarPosition();

    renderer.render(scene, camera);
}

animate();


// Ejemplo: Aplicar una fuerza al avatar (para saltar)
function jump() {
    avatarBody.applyImpulse(new CANNON.Vec3(0, 150, 0), avatarBody.position);
}

// Detectar colisiones (ejemplo simplificado)
avatarBody.addEventListener("collide", (event) => {
    console.log("Colisión detectada con:", event.body);
    // Aquí puedes implementar la lógica de la colisión (ej: rebote, daño, etc.)
});

// Agregar un suelo
const groundBody = new CANNON.Body({
    mass: 0, // Masa infinita para que sea estático
    shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotar para que sea horizontal
world.addBody(groundBody);

// Representación visual del suelo en Three.js (opcional)
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);