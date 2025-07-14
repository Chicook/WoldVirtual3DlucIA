// Reducir la cantidad de vértices
const simplifiedGeometry = new THREE.BufferGeometry().copyAttributes(geometry);
simplifiedGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

// Utilizar mapas de normales y desplazamiento
const material = new THREE.MeshStandardMaterial({
  normalMap: normalTexture,
  displacementMap: displacementTexture,
  displacementScale: 0.1
});