const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'posx.jpg',
  'negx.jpg',
  'posy.jpg',
  'negy.jpg',
  'posz.jpg',
  'negz.jpg',
]);

scene.background = texture; // Usar como fondo de la escena

const material = new THREE.MeshStandardMaterial({
  envMap: texture // Usar como reflejo en el material
});