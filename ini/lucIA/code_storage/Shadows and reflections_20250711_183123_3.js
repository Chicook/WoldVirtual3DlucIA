const geometry = new THREE.PlaneGeometry( 100, 100 );
const groundMirror = new Reflector( geometry, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: 0x777777,
  recursion: 1
} );
groundMirror.position.y = -50;
groundMirror.rotateX( - Math.PI / 2 );
scene.add( groundMirror );