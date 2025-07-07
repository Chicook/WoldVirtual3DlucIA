# TODO - Editor 3D Web Metaverso

## Tareas prioritarias

1. **Inicializar proyecto React + Three.js (Vite recomendado)**
   - Estructura base: `/public`, `/src`, `/components`, `/hooks`, `/utils`, `/styles`, `/types`
   - Configurar `package.json` y `tsconfig.json`

2. **Implementar componentes base**
   - `App.tsx` y `index.tsx`
   - `SceneEditor`: lógica principal de edición
   - `Viewport`: canvas 3D interactivo (Three.js)
   - `Toolbar`: herramientas de edición (mover, rotar, escalar, añadir, eliminar)
   - `ObjectPanel`: lista jerárquica de objetos
   - `Inspector`: propiedades del objeto seleccionado
   - `AssetLibrary`: galería de assets/modelos 3D

3. **Gestión de escenas**
   - Guardar/cargar escenas en localStorage o backend
   - Exportar/importar escenas (JSON, GLTF, etc.)

4. **Integración con blockchain (BSC Testnet)**
   - Conectar wallet (Metamask)
   - Mostrar saldo WCV demo
   - Flujo de publicación: cobrar 0.001 WCV por publicar una isla/juego
   - Guardar hash/ID de publicación en blockchain

5. **Panel de usuario**
   - Ver, editar y eliminar creaciones propias
   - Historial de transacciones y publicaciones

6. **Documentación y UX**
   - Documentar arquitectura y puntos de extensión
   - Tutoriales y ayuda para usuarios

## Mejoras futuras
- Plugins/extensiones para físicas, scripting, multijugador, etc.
- Marketplace de assets y modelos 3D
- Colaboración en tiempo real
- Moderación y validación de contenidos
- Integración con IPFS para almacenamiento descentralizado

---

> **Este archivo sirve como recordatorio y hoja de ruta para el desarrollo del editor 3D web en `.bin/editor3d`. Actualizar y priorizar según avance el proyecto.** 