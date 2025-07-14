// Ejemplo de MeshLambertMaterial
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x7833aa }); // Violeta
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Necesitas una luz para ver el efecto del material
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);