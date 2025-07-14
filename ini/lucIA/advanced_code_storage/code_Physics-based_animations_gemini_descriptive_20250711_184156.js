// Código extraído de: Physics-based animations
// API: Gemini
// Fecha: 2025-07-11 18:41:37

// Ejemplo 1
<script src="https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.min.js"></script>

// Ejemplo 2
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Gravedad terrestre

// Ejemplo 3
const sphereShape = new CANNON.Sphere(1); // Radio de 1 metro
const sphereBody = new CANNON.Body({ mass: 5, shape: sphereShape });
sphereBody.position.set(0, 10, 0);
world.addBody(sphereBody);

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, shape: groundShape }); // Masa 0 para estático
world.addBody(groundBody);

// Ejemplo 4
const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial());
scene.add(sphereMesh);

function animate() {
  requestAnimationFrame(animate);

  world.step(1/60); // Actualizar la simulación física (60fps)

  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);

  renderer.render(scene, camera);
}

animate();

