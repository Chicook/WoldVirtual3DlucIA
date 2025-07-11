// Ejemplo: Cargando una textura
const textureLoader = new THREE.TextureLoader();
textureLoader.load('skin_texture.jpg', function(texture) {
  const material = new THREE.MeshBasicMaterial({ map: texture });
  // ... aplicar el material a la geometría
});