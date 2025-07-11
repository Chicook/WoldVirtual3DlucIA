import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load( 'modelo_cara.glb', function ( gltf ) {

  const model = gltf.scene;
  scene.add( model );

  // Acceder a los morph targets (asumiendo que el modelo los tiene)
  const mesh = model.getObjectByName('Cara'); // Reemplaza 'Cara' con el nombre de tu mesh

  if (mesh.morphTargetInfluences) {

    // Ejemplo: activar la sonrisa (asumiendo que el morph target 0 es la sonrisa)
    mesh.morphTargetInfluences[ 0 ] = 1;

    // Ejemplo: combinar sonrisa (50%) y ceño fruncido (25%) (asumiendo que el morph target 1 es el ceño fruncido)
    mesh.morphTargetInfluences[ 0 ] = 0.5;
    mesh.morphTargetInfluences[ 1 ] = 0.25;

  }

}, undefined, function ( error ) {

  console.error( error );

} );