# threejs-utils

Esta carpeta contiene **scripts utilitarios JavaScript/TypeScript** para el editor 3D basado en Three.js.

## Propósito
- Centralizar helpers, utilidades matemáticas, loaders, generadores de geometría, materiales, etc.
- Todo lo necesario para extender y facilitar el desarrollo del editor 3D.
- Inspirado en la filosofía modular de Blender y Godot.

## Ejemplos de utilidades a incluir
- Generadores de geometría (cubos, esferas, cilindros, planos, etc.)
- Utilidades de selección y raycasting
- Helpers para manipulación de matrices y vectores
- Cargadores de texturas y modelos
- Utilidades de animación y timeline
- Funciones para serializar/deserializar escenas

## Reglas
- Cada archivo debe tener entre 200 y 300 líneas de código.
- Modularidad estricta: un archivo por responsabilidad.
- Si una utilidad crece demasiado, dividir en varios archivos.

---

**Ubicación:** `.bin/editor3d/src/threejs-utils/` 