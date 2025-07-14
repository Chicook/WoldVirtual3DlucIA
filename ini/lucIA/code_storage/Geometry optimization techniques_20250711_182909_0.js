import { BufferGeometry, BufferAttribute, Mesh } from 'three';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier';

const simplifyModifier = new SimplifyModifier();
const geometry = new BufferGeometry();
// Configura tu geometría original aquí

const simplifiedGeometry = geometry.clone();
simplifiedGeometry.attributes.position = new BufferAttribute(
  simplifyModifier.modify(simplifiedGeometry.attributes.position.array, 0.5), // Reduce el 50% de los vértices
  3
);
simplifiedGeometry.computeVertexNormals();

const simplifiedMesh = new Mesh(simplifiedGeometry, material);