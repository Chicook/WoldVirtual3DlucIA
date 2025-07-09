# Editor 3D WoldVirtual

Un editor 3D moderno y potente construido con Three.js para el proyecto WoldVirtual3DlucIA.

## 🚀 Características

- **Interfaz moderna**: Diseño oscuro y profesional
- **Herramientas de transformación**: Mover, rotar y escalar objetos
- **Geometrías básicas**: Cubo, esfera, cilindro, plano, cono, toro
- **Sistema de iluminación**: Luces ambiental, direccional, puntual y spot
- **Materiales**: Básico, Phong, Lambert y Standard
- **Outliner de escena**: Vista jerárquica de todos los objetos
- **Panel de propiedades**: Edición precisa de transformaciones
- **Estadísticas en tiempo real**: FPS, conteo de objetos y polígonos
- **Controles de cámara**: OrbitControls para navegación intuitiva

## 📦 Instalación

1. **Clonar el repositorio** (si no está ya en el proyecto):
```bash
cd .bin/editor3d/Editor3Dwoldvirtual
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Ejecutar en modo desarrollo**:
```bash
npm run dev
```

4. **Abrir en el navegador**:
El editor se abrirá automáticamente en `http://localhost:3000`

## 🛠️ Uso

### Herramientas de Transformación

- **Seleccionar** (🔍): Selecciona objetos en la escena
- **Mover** (↔️): Mueve objetos en el espacio 3D
- **Rotar** (🔄): Rota objetos alrededor de sus ejes
- **Escalar** (📏): Cambia el tamaño de los objetos

### Crear Objetos

#### Geometrías Básicas
- **Cubo**: Geometría cúbica básica
- **Esfera**: Esfera con resolución configurable
- **Cilindro**: Cilindro con radio y altura
- **Plano**: Superficie plana 2D
- **Cono**: Cono con radio base y altura
- **Toro**: Forma de dona

#### Luces
- **Ambiental**: Iluminación general de la escena
- **Direccional**: Luz direccional como el sol
- **Puntual**: Luz que emana de un punto
- **Spot**: Luz direccional con ángulo limitado

### Materiales

- **Básico**: Material simple sin iluminación
- **Phong**: Material con reflexiones especulares
- **Lambert**: Material mate difuso
- **Standard**: Material físico basado en PBR

### Panel de Propiedades

Edita las propiedades de los objetos seleccionados:
- **Posición**: Coordenadas X, Y, Z
- **Rotación**: Ángulos en grados
- **Escala**: Factores de escala en cada eje

### Outliner

- Vista jerárquica de todos los objetos en la escena
- Selecciona objetos haciendo clic en la lista
- Iconos diferenciados por tipo de objeto

## 🎮 Controles de Cámara

- **Clic izquierdo + arrastrar**: Rotar cámara
- **Clic derecho + arrastrar**: Pan de cámara
- **Scroll**: Zoom in/out
- **Clic medio + arrastrar**: Pan de cámara

## 📁 Estructura del Proyecto

```
Editor3Dwoldvirtual/
├── index.html              # Página principal
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
├── README.md              # Este archivo
└── src/
    ├── main.js            # Lógica principal del editor
    └── styles/
        └── main.css       # Estilos de la interfaz
```

## 🔧 Scripts Disponibles

- `npm run dev`: Ejecuta el servidor de desarrollo
- `npm run build`: Construye la versión de producción
- `npm run preview`: Previsualiza la versión de producción
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código

## 🎨 Personalización

### Temas de Color

Los colores se pueden personalizar editando las variables CSS en `src/styles/main.css`:

```css
:root {
    --primary-color: #2563eb;
    --bg-primary: #0f172a;
    --text-primary: #f8fafc;
    /* ... más variables */
}
```

### Agregar Nuevas Geometrías

Para agregar nuevas geometrías, modifica el método `createGeometry()` en `src/main.js`:

```javascript
case 'nueva-geometria':
    geometry = new THREE.NuevaGeometria(parametros);
    break;
```

### Agregar Nuevos Materiales

Para agregar nuevos materiales, modifica el método `updateMaterialType()`:

```javascript
case 'nuevo-material':
    newMaterial = new THREE.NuevoMaterial({ color: color });
    break;
```

## 🚀 Próximas Características

- [ ] Importación/exportación de modelos 3D (GLTF, OBJ, FBX)
- [ ] Sistema de texturas y mapas
- [ ] Animaciones y keyframes
- [ ] Sistema de partículas
- [ ] Renderizado en tiempo real
- [ ] Colaboración en tiempo real
- [ ] Integración con blockchain para NFTs
- [ ] Exportación a metaverso

## 🐛 Solución de Problemas

### Error de CORS
Si encuentras errores de CORS, asegúrate de que el servidor esté ejecutándose con:
```bash
npm run dev
```

### Problemas de Rendimiento
- Reduce la resolución de las sombras
- Usa menos polígonos en las geometrías
- Desactiva el antialiasing si es necesario

### Problemas de Controles
- Asegúrate de que el canvas tenga el foco
- Verifica que no haya otros elementos interfiriendo

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo de WoldVirtual3DlucIA

---

**Desarrollado con ❤️ para WoldVirtual3DlucIA** 