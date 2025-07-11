// Crear un objeto reflectante
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.2
  })
);
sphere.position.set(0, 1, 0);
scene.add(sphere);

// Crear un reflector
const reflector = new THREE.Reflector(
  new THREE.PlaneGeometry(10, 10),
  {
    clipBias: 0.003,
    textureWidth: 1024 * 2,
    textureHeight: 1024 * 2,
    color: 0x889999,
    recursion: 1
  }
);
reflector.position.set(0, 0, 0);
reflector.rotation.x = -Math.PI / 2;
scene.add(reflector);