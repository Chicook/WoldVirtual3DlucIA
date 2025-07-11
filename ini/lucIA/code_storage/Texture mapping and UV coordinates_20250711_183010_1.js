// ... (código anterior) ...

// Acceder a la geometría del cubo y sus atributos UV
const uvAttribute = geometry.attributes.uv;

// Modificar las coordenadas UV de la primera cara (dos triángulos)
// Ejemplo: Mapear solo una porción de la textura a la cara frontal
uvAttribute.setXY( 0, 0, 0 ); // Esquina inferior izquierda
uvAttribute.setXY( 1, 0.5, 0 ); // Centro inferior
uvAttribute.setXY( 2, 0, 0.5 ); // Esquina superior izquierda

uvAttribute.setXY( 3, 0.5, 0 ); // Centro inferior
uvAttribute.setXY( 4, 0.5, 0.5 ); // Centro
uvAttribute.setXY( 5, 0, 0.5 ); // Esquina superior izquierda

// Indicar que los atributos UV han sido modificados
uvAttribute.needsUpdate = true;


// ... (resto del código) ...
