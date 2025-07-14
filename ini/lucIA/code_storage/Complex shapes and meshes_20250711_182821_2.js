import * as THREE from 'three';
import { LatheGeometry } from 'three';


const points = [];
for (let i = 0; i < 10; i++) {
  points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
}

const geometry = new LatheGeometry(points);
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);