// Importa la librería de simulación de telas
import { Cloth } from 'three/examples/jsm/physics/Cloth';

// Crea una malla de tela
const clothGeometry = new THREE.PlaneGeometry(10, 10, 20, 20);
const clothMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
scene.add(cloth);

// Crea la simulación de telas
const cloth = new Cloth(clothGeometry, {
  mass: 0.1,
  restDistance: 0.5,
  damping: 0.5,
  friction: 0.5,
  gravity: new THREE.Vector3(0, -9.8, 0)
});

// Actualiza la posición de la tela en cada frame
function animate() {
  requestAnimationFrame(animate);
  cloth.update(clock.getDelta());
  renderer.render(scene, camera);
}
animate();