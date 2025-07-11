// Crear una luz con capacidad de proyectar sombras
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(2, 2, 2);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 10;
scene.add(spotLight);

// Crear un objeto que proyecte sombras
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cube.position.set(0, 1, 0);
cube.castShadow = true;
scene.add(cube);

// Crear un plano que reciba sombras
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);