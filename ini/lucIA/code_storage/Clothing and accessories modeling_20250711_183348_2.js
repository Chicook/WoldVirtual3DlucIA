import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('ruta/a/modelo.glb', (gltf) => {
  const dress = gltf.scene;
  scene.add(dress);
});