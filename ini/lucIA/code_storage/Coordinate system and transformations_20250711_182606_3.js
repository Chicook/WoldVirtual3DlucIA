// Crear una matriz de transformación
const matrix = new THREE.Matrix4();
matrix.makeRotationX(THREE.MathUtils.degToRad(45));
matrix.scale(new THREE.Vector3(2, 2, 2));
matrix.setPosition(x, y, z);

// Aplicar la matriz de transformación al objeto
object.applyMatrix4(matrix);