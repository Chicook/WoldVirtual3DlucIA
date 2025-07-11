     import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

     const geometry = new THREE.BufferGeometry();
     // Definir los vértices y otros atributos...

     // Simplificar la geometría
     geometry.index = BufferGeometryUtils.mergeVertices(geometry);