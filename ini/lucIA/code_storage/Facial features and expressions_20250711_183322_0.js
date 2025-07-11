// Creación de un sistema de animación facial
const faceControls = {
  eyeBrowRaise: 0,
  eyeBrowFrown: 0,
  eyeBrowAngle: 0,
  eyeLidOpen: 1,
  mouthOpen: 0,
  mouthSmile: 0
};

// Acceso a los vértices de la malla del rostro
const faceGeometry = avatar.getObjectByName('Face').geometry;
const faceVertices = faceGeometry.vertices;

// Función de actualización de las expresiones faciales
function updateFaceExpression() {
  // Aplicar deformaciones a los vértices del rostro
  faceVertices.forEach((vertex, index) => {
    vertex.x += Math.sin(faceControls.eyeBrowRaise * Math.PI) * 0.1;
    vertex.y += Math.sin(faceControls.eyeBrowFrown * Math.PI) * 0.1;
    vertex.z += Math.sin(faceControls.eyeBrowAngle * Math.PI) * 0.1;
    vertex.y += Math.sin(faceControls.eyeLidOpen * Math.PI) * 0.05;
    vertex.z += Math.sin(faceControls.mouthOpen * Math.PI) * 0.1;
    vertex.x += Math.sin(faceControls.mouthSmile * Math.PI) * 0.05;
  });

  faceGeometry.verticesNeedUpdate = true;
}

// Actualizar las expresiones faciales en cada cuadro
function animate() {
  requestAnimationFrame(animate);
  updateFaceExpression();
  renderer.render(scene, camera);
}
animate();