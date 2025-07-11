// Carga del modelo 3D
const loader = new THREE.GLTFLoader();
loader.load('human_model.gltf', (gltf) => {
  const model = gltf.scene.children[0];

  // Aplicar modificadores y deformadores
  const lattice = new THREE.LatticeModifier().modify(model, 2);
  const skin = new THREE.SkinModifier().modify(model);

  // Crear shaders personalizados
  const material = new THREE.ShaderMaterial({
    uniforms: {
      // Definir uniforms personalizados
    },
    vertexShader: vertexShaderCode,
    fragmentShader: fragmentShaderCode
  });
  model.material = material;

  // Configurar animaciones
  const mixer = new THREE.AnimationMixer(model);
  const clips = gltf.animations;
  clips.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
  });

  // Actualizar la escena
  scene.add(model);
  animate();

  function animate() {
    requestAnimationFrame(animate);
    mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  }
});