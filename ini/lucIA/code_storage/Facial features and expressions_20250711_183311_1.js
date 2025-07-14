function animate() {
  requestAnimationFrame( animate );

  // Ejemplo: animación simple de la sonrisa
  const time = Date.now() * 0.001;
  mesh.morphTargetInfluences[ 0 ] = Math.sin( time ) * 0.5 + 0.5; // Valor entre 0 y 1

  renderer.render( scene, camera );
}

animate();