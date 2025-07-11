// Ejemplo de MeshStandardMaterial
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 16);
const material = new THREE.MeshStandardMaterial({
  color: 0x0055aa, // Azul oscuro
  roughness: 0.4, // Rugosidad de la superficie
  metalness: 0.8 // Metalicidad de la superficie
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

//  Para apreciar el PBR se recomienda una luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

//  Y una luz direccional o puntual
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);