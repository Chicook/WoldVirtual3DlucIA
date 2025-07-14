import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

const geometries = [
  new BoxBufferGeometry(),
  new SphereBufferGeometry(),
  new CylinderBufferGeometry(),
];
const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
const mesh = new Mesh(mergedGeometry, material);