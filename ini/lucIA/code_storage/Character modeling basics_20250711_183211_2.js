const texture = new THREE.TextureLoader().load('path/to/texture.jpg');
const material = new THREE.MeshStandardMaterial({
  map: texture,
  normalMap: normalTexture,
  roughnessMap: roughnessTexture,
  metalnessMap: metalnessTexture
});