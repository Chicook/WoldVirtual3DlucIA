// Crear un renderizador WebGL
const renderer = new THREE.WebGLRenderer();

// Establecer el tamaño del renderizador al tamaño de la ventana
renderer.setSize(window.innerWidth, window.innerHeight);

// Agregar el elemento canvas del renderizador al documento HTML
document.body.appendChild(renderer.domElement);