const loader = new THREE.GLTFLoader();
loader.load('path/to/model.gltf', (gltf) => {
  const model = gltf.scene;
  // Manipular el modelo importado
  scene.add(model);
});