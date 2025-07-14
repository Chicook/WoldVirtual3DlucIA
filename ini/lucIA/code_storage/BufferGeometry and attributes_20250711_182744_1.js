// ... código anterior ...

// Definimos los colores de los vértices (RGB)
const colors = new Float32Array( [
    1, 0, 0, // Rojo
    0, 1, 0, // Verde
    0, 0, 1  // Azul
] );

const colorAttribute = new THREE.BufferAttribute( colors, 3 );
geometry.setAttribute( 'color', colorAttribute );

// Usamos un material que soporte atributos de color
const material = new THREE.MeshBasicMaterial( { vertexColors: true } );

// ... resto del código ...