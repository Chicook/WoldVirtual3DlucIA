     const renderer = new THREE.WebGLRenderer({ antialias: true });
     renderer.setSize(window.innerWidth, window.innerHeight);
     renderer.setClearColor(0x101010);
     renderer.physicallyCorrectLights = true;
     renderer.logarithmicDepthBuffer = true;
     document.body.appendChild(renderer.domElement);