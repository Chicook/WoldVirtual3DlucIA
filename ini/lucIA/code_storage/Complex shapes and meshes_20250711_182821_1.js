import * as THREE from 'three';
import { Shape, ExtrudeGeometry } from 'three';

const shape = new Shape();
shape.moveTo(0, 0);
shape.lineTo(0, 1);
shape.lineTo(1, 1);
shape.lineTo(1, 0);
shape.lineTo(0, 0);

const extrudeSettings = {
  steps: 2,
  depth: 2,
  bevelEnabled: true,
  bevelThickness: 0.1,
  bevelSize: 0.2,
  bevelOffset: 0,
  bevelSegments: 1
};

const geometry = new ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);
