import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();

loader.load('ruta/a/tu/avatar.glb', function(gltf) {
  scene.add(gltf.scene);
}, undefined, function(error) {
  console.error(error);
});