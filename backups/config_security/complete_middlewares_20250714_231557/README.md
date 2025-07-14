# Sistema de Avatares Humanos 3D para Metaverso

## 📋 Descripción

Sistema modular completo para generar, personalizar y animar avatares humanos 3D en tiempo real para el metaverso descentralizado. Integra generación procedural, personalización avanzada, animaciones complejas y física realista.

## 🏗️ Arquitectura Modular

### **Módulos Principales:**

1. **`avatar-generator.js`** - Generador base de avatares 3D
2. **`avatar-customization.js`** - Sistema de personalización avanzada
3. **`avatar-animations.js`** - Animaciones y expresiones faciales
4. **`avatar-physics.js`** - Física realista para avatares
5. **`avatar-controller.js`** - Controlador unificado

## 🚀 Características Principales

### **Generación de Avatares**
- ✅ Geometrías procedurales (cabeza, cuerpo, extremidades)
- ✅ Sistema de esqueleto jerárquico
- ✅ Materiales y texturas dinámicas
- ✅ Diferentes tipos de cuerpo (delgado, promedio, atlético, robusto)
- ✅ Géneros masculino y femenino

### **Personalización Avanzada**
- ✅ Interfaz de usuario intuitiva
- ✅ Presets predefinidos (atleta, ejecutivo, casual, gamer)
- ✅ Personalización de altura, complexión, tono de piel
- ✅ Estilos de cabello (corto, largo, rizado, calvo)
- ✅ Colores de cabello y ojos
- ✅ Ropa (casual, formal, deportivo)
- ✅ Accesorios (gafas, sombrero, reloj, collar)

### **Animaciones Complejas**
- ✅ Animaciones básicas (caminar, correr, saltar)
- ✅ Expresiones faciales (feliz, triste, enojado, sorprendido)
- ✅ Gestos (señalar, pulgar arriba, paz, puño)
- ✅ Animaciones de interacción (saludar, aplaudir, bailar)
- ✅ Sistema de mezclado de animaciones
- ✅ Animaciones de reposo y respiración

### **Física Realista**
- ✅ Gravedad y colisiones
- ✅ Movimiento suave y natural
- ✅ Detección de suelo
- ✅ Fricción y restitución
- ✅ Límites de velocidad
- ✅ Sistema de fuerzas e impulsos
- ✅ Obstáculos dinámicos

## 📦 Instalación y Uso

### **Uso Básico**

```javascript
// Crear controlador de avatar
const controller = new AvatarController(container, {
    enablePhysics: true,
    enableAnimations: true,
    enableCustomization: true,
    autoRender: true
});

// Crear avatar personalizado
controller.createAvatar({
    gender: 'male',
    height: 1.8,
    build: 'athletic',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'brown',
    eyeColor: 'blue',
    clothing: 'sport',
    accessories: ['watch']
});
```

### **Uso Avanzado**

```javascript
// Personalizar avatar
controller.customize({
    hairStyle: 'long',
    hairColor: 'blonde',
    accessories: ['glasses', 'necklace']
});

// Reproducir animaciones
controller.playAnimation('walk', true);
controller.playExpression('happy');
controller.playGesture('wave');

// Controlar movimiento
controller.move({ x: 1, z: 0 }, 2.0);
controller.jump();
controller.run();

// Aplicar física
controller.applyForce(new THREE.Vector3(0, 10, 0));
controller.addObstacle(new THREE.Vector3(5, 0, 0), 1.0);
```

## 🎮 Controles de Movimiento

### **Teclado (WASD)**
- **W** - Mover hacia adelante
- **S** - Mover hacia atrás
- **A** - Mover hacia la izquierda
- **D** - Mover hacia la derecha
- **Espacio** - Saltar
- **Shift** - Correr

### **Mouse**
- **Click izquierdo + arrastrar** - Rotar cámara
- **Scroll** - Zoom in/out
- **Click derecho + arrastrar** - Pan

## 🎨 Personalización

### **Presets Disponibles**
- **Default** - Avatar básico
- **Athlete** - Atleta deportivo
- **Business** - Ejecutivo formal
- **Casual Female** - Mujer casual
- **Gamer** - Jugador casual

### **Opciones de Personalización**
- **Género**: Masculino, Femenino
- **Altura**: 1.5m - 2.0m
- **Complexión**: Delgado, Promedio, Atlético, Robusto
- **Tono de Piel**: Claro, Medio, Oscuro, Muy Oscuro
- **Color de Ojos**: Marrón, Azul, Verde, Avellana
- **Estilo de Cabello**: Corto, Largo, Rizado, Calvo
- **Color de Cabello**: Negro, Marrón, Rubio, Rojo, Gris, Blanco
- **Ropa**: Casual, Formal, Deportivo
- **Accesorios**: Gafas, Sombrero, Reloj, Collar

## 🎭 Animaciones

### **Animaciones Básicas**
- `walk` - Caminar
- `run` - Correr
- `jump` - Saltar
- `sit` - Sentarse
- `stand` - Levantarse
- `dance` - Bailar

### **Expresiones Faciales**
- `happy` - Feliz
- `sad` - Triste
- `angry` - Enojado
- `surprised` - Sorprendido
- `neutral` - Neutral

### **Gestos**
- `wave` - Saludar
- `clap` - Aplaudir
- `point` - Señalar
- `thumbsUp` - Pulgar arriba
- `peace` - Paz
- `fist` - Puño

## ⚙️ Configuración

### **Configuración del Controlador**
```javascript
const config = {
    enablePhysics: true,        // Habilitar física
    enableAnimations: true,     // Habilitar animaciones
    enableCustomization: true,  // Habilitar personalización
    enableNetworking: false,    // Habilitar networking
    autoRender: true           // Renderizado automático
};
```

### **Configuración de Física**
```javascript
const physicsConfig = {
    mass: 70.0,           // Masa en kg
    height: 1.8,          // Altura en metros
    gravity: -9.81,       // Gravedad en m/s²
    friction: 0.7,        // Coeficiente de fricción
    restitution: 0.3,     // Coeficiente de restitución
    maxSpeed: 5.0,        // Velocidad máxima en m/s
    jumpForce: 8.0        // Fuerza de salto en m/s
};
```

## 🔧 API Completa

### **AvatarController**

#### **Métodos Principales**
- `createAvatar(config)` - Crear avatar con configuración
- `customize(config)` - Personalizar avatar existente
- `playAnimation(name, loop)` - Reproducir animación
- `playExpression(name)` - Reproducir expresión
- `playGesture(name)` - Reproducir gesto
- `move(direction, speed)` - Mover avatar
- `jump()` - Saltar
- `run()` - Correr
- `walk()` - Caminar
- `stop()` - Detener movimiento

#### **Métodos de Física**
- `applyForce(force)` - Aplicar fuerza
- `applyImpulse(impulse)` - Aplicar impulso
- `addObstacle(position, radius)` - Añadir obstáculo
- `getPosition()` - Obtener posición
- `setPosition(position)` - Establecer posición
- `getVelocity()` - Obtener velocidad
- `getState()` - Obtener estado

#### **Métodos de Configuración**
- `setPhysicsEnabled(enabled)` - Habilitar/deshabilitar física
- `setAnimationsEnabled(enabled)` - Habilitar/deshabilitar animaciones
- `setCustomizationEnabled(enabled)` - Habilitar/deshabilitar personalización
- `getConfig()` - Obtener configuración
- `getStats()` - Obtener estadísticas

#### **Métodos de Exportación/Importación**
- `exportAvatar()` - Exportar avatar como JSON
- `importAvatar(data)` - Importar avatar desde JSON

## 🌐 Integración con Metaverso

### **Integración con ECS**
```javascript
// Crear entidad de avatar en el ECS
const avatarEntity = ecsManager.createEntity();
ecsManager.addComponent(avatarEntity, 'Transform', {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
});
ecsManager.addComponent(avatarEntity, 'Player', {
    playerId: 'user123',
    username: 'Player1'
});
```

### **Integración con Networking**
```javascript
// Sincronizar posición del avatar
networkManager.sendPlayerPosition(
    avatarController.getPosition(),
    avatarController.getVelocity()
);
```

### **Integración con Blockchain**
```javascript
// Guardar avatar como NFT
const avatarData = avatarController.exportAvatar();
blockchainManager.mintAvatarNFT(avatarData, playerWallet);
```

## 🎯 Ejemplos de Uso

### **Ejemplo 1: Avatar Básico**
```javascript
const container = document.getElementById('avatar-container');
const controller = new AvatarController(container);

controller.createAvatar({
    gender: 'male',
    height: 1.75,
    build: 'average',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'black',
    eyeColor: 'brown',
    clothing: 'casual'
});
```

### **Ejemplo 2: Avatar Deportivo**
```javascript
controller.createAvatar({
    gender: 'female',
    height: 1.65,
    build: 'athletic',
    skinTone: 'medium',
    hairStyle: 'long',
    hairColor: 'blonde',
    eyeColor: 'blue',
    clothing: 'sport',
    accessories: ['watch']
});

controller.playAnimation('run', true);
```

### **Ejemplo 3: Avatar Interactivo**
```javascript
// Configurar controles de teclado
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w':
            controller.move({ x: 0, z: -1 }, 2.0);
            break;
        case 's':
            controller.move({ x: 0, z: 1 }, 2.0);
            break;
        case 'a':
            controller.move({ x: -1, z: 0 }, 2.0);
            break;
        case 'd':
            controller.move({ x: 1, z: 0 }, 2.0);
            break;
        case ' ':
            controller.jump();
            break;
        case 'Shift':
            controller.run();
            break;
    }
});
```

## 🔮 Características Futuras

### **Próximas Implementaciones**
- [ ] Sistema de ropa dinámica
- [ ] Animaciones de combate
- [ ] Expresiones faciales avanzadas
- [ ] Sistema de emociones
- [ ] Integración con IA para comportamiento
- [ ] Animaciones de grupo
- [ ] Sistema de partículas para efectos
- [ ] Integración con VR/AR

### **Optimizaciones Planificadas**
- [ ] LOD (Level of Detail) dinámico
- [ ] Culling de animaciones
- [ ] Compresión de datos de avatar
- [ ] Streaming de texturas
- [ ] Cache inteligente

## 📊 Rendimiento

### **Métricas Típicas**
- **FPS**: 60+ en dispositivos modernos
- **Memoria**: ~50MB por avatar
- **Polígonos**: ~2,000 por avatar
- **Texturas**: ~10MB por avatar
- **Animaciones**: ~20 animaciones simultáneas

### **Optimizaciones Implementadas**
- ✅ Geometrías optimizadas
- ✅ Materiales compartidos
- ✅ Animaciones con keyframes optimizados
- ✅ Física simplificada pero realista
- ✅ Renderizado eficiente

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork del repositorio
2. Crear rama de feature
3. Implementar cambios
4. Añadir tests
5. Crear Pull Request

### **Estándares de Código**
- ES6+ JavaScript
- JSDoc para documentación
- ESLint para linting
- Prettier para formateo
- Tests unitarios con Jest

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

### **Problemas Comunes**
1. **Avatar no se renderiza**: Verificar que Three.js esté cargado
2. **Animaciones no funcionan**: Verificar que el sistema de animaciones esté habilitado
3. **Física no responde**: Verificar que el sistema de física esté habilitado
4. **Personalización no aparece**: Verificar que el contenedor tenga dimensiones

### **Contacto**
- **Issues**: GitHub Issues
- **Discord**: Canal #avatars
- **Email**: avatars@metaverso.com

---

**Desarrollado para el Metaverso Crypto World Virtual 3D** 🚀 