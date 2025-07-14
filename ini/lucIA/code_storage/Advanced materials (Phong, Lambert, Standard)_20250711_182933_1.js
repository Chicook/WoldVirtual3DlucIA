// Ejemplo de MeshPhongMaterial
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshPhongMaterial({
  color: 0xffd700, // Dorado
  specular: 0xffffff, // Color del brillo especular
  shininess: 30 // Intensidad del brillo
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Luz direccional para observar el brillo
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);