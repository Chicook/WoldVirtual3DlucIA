// Código extraído de: Physics-based animations
// API: Claude
// Fecha: 2025-07-11 18:41:56

// Ejemplo 1
// Configuración inicial
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Sincronización Three.js - CANNON.js
function syncMeshWithBody(mesh, body) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
}

// Ejemplo 2
// 1. Crear objeto físico
const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
    mass: 5,
    shape: sphereShape,
    material: new CANNON.Material()
});

// 2. Crear mesh Three.js correspondiente
const sphereGeometry = new THREE.SphereGeometry(1);
const sphereMesh = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshStandardMaterial()
);

// 3. Sistema de actualización
function animate() {
    world.step(1/60);
    syncMeshWithBody(sphereMesh, sphereBody);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Ejemplo 3
// Optimización con Web Workers
const physicsWorker = new Worker('physics.worker.js');
physicsWorker.onmessage = (e) => {
    updatePhysicsState(e.data);
};

// Ejemplo 4
// Control de velocidades máximas
body.velocity.set(
    Math.clamp(body.velocity.x, -maxVel, maxVel),
    Math.clamp(body.velocity.y, -maxVel, maxVel),
    Math.clamp(body.velocity.z, -maxVel, maxVel)
);

// Detección de tunneling
world.addEventListener('postStep', () => {
    checkTunneling(bodies);
});

// Ejemplo 5
// Sistema de eventos
const eventBus = new THREE.EventDispatcher();

// Integración con sistema de animación
class PhysicsAnimationSystem extends THREE.AnimationSystem {
    update(delta) {
        world.step(delta);
        this.updatePhysicsBodies();
    }
}

