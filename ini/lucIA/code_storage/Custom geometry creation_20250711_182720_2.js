     const shape = new THREE.Shape([
       new THREE.Vector2(-1, -1),
       new THREE.Vector2(1, -1),
       new THREE.Vector2(1, 1),
       new THREE.Vector2(-1, 1)
     ]);

     const extrudeSettings = {
       depth: 1,
       bevelEnabled: true,
       bevelSegments: 2,
       steps: 2,
       bevelSize: 1,
       bevelThickness: 1
     };

     const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);