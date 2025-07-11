// Crear una luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true; // Habilitar sombras

// Ajustar el mapa de sombras para mejor calidad (opcional)
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

// Crear un plano que reciba la sombra
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true; // Habilitar recepción de sombras
plane.rotation.x = -Math.PI * 0.5;

// Crear un cubo que proyecte sombra
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true; // Habilitar proyección de sombras
cube.position.y = 1;

// Habilitar sombras en el renderizador
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Mejor calidad de sombras (más costoso)


// Añadir los objetos a la escena
scene.add(directionalLight, plane, cube);