     const geometry = new THREE.BufferGeometry();

     // Definir los vértices
     const vertices = new Float32Array([
       -1.0, -1.0, 1.0,
       1.0, -1.0, 1.0,
       1.0, 1.0, 1.0,
       -1.0, 1.0, 1.0
     ]);

     // Definir los índices
     const indices = new Uint16Array([
       0, 1, 2, 2, 3, 0
     ]);

     // Crear los búferes
     const vertexBuffer = new THREE.BufferAttribute(vertices, 3);
     const indexBuffer = new THREE.BufferAttribute(indices, 1);

     // Asignar los búferes a la geometría
     geometry.setAttribute('position', vertexBuffer);
     geometry.setIndex(indexBuffer);