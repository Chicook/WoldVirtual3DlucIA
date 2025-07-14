import * as THREE from 'three';
// ... (geometrías low, mid, high)

const lod = new THREE.LOD();

lod.addLevel( meshLow, 20 );
lod.addLevel( meshMid, 10 );
lod.addLevel( meshHigh, 5 );

scene.add( lod );