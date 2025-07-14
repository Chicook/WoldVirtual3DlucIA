# 🎲 MÓDULO 1: GEOMETRÍAS BÁSICAS - THREE.JS

## 📅 **FECHA DE CREACIÓN**: 2025-01-07

## 🎯 **OBJETIVO**
Comprender y dominar las geometrías básicas en Three.js para crear la base del avatar de LucIA.

## 📚 **CONCEPTOS CLAVE**

### **1. Geometrías Fundamentales**

#### **Cubo (BoxGeometry)**
```javascript
// Geometría básica de cubo
const geometry = new THREE.BoxGeometry(width, height, depth);
const material = new THREE.MeshBasicMaterial({ color: 0x0066cc });
const cube = new THREE.Mesh(geometry, material);
```

**Parámetros importantes:**
- `width`: Ancho del cubo
- `height`: Alto del cubo  
- `depth`: Profundidad del cubo
- `widthSegments`: Segmentos en el ancho (para subdivisiones)
- `heightSegments`: Segmentos en el alto
- `depthSegments`: Segmentos en la profundidad

#### **Esfera (SphereGeometry)**
```javascript
// Geometría de esfera para la cabeza
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
const material = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
const sphere = new THREE.Mesh(geometry, material);
```

**Parámetros importantes:**
- `radius`: Radio de la esfera
- `widthSegments`: Segmentos horizontales (longitud)
- `heightSegments`: Segmentos verticales (latitud)
- `phiStart`: Ángulo inicial phi
- `phiLength`: Longitud del ángulo phi
- `thetaStart`: Ángulo inicial theta
- `thetaLength`: Longitud del ángulo theta

#### **Cilindro (CylinderGeometry)**
```javascript
// Geometría de cilindro para el cuerpo
const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
const material = new THREE.MeshPhongMaterial({ color: 0x0066cc });
const cylinder = new THREE.Mesh(geometry, material);
```

**Parámetros importantes:**
- `radiusTop`: Radio de la parte superior
- `radiusBottom`: Radio de la parte inferior
- `height`: Altura del cilindro
- `radialSegments`: Número de segmentos radiales
- `heightSegments`: Número de segmentos de altura
- `openEnded`: Si los extremos están abiertos
- `thetaStart`: Ángulo inicial
- `thetaLength`: Longitud del ángulo

#### **Plano (PlaneGeometry)**
```javascript
// Geometría de plano para bases o fondos
const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const plane = new THREE.Mesh(geometry, material);
```

### **2. Aplicación para el Avatar de LucIA**

#### **Cabeza de LucIA**
```javascript
// Cabeza esférica con modificaciones
const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const headMaterial = new THREE.MeshPhongMaterial({
    color: 0xffcc99,  // Color piel
    shininess: 30,
    transparent: true,
    opacity: 0.95
});
const luciaHead = new THREE.Mesh(headGeometry, headMaterial);
luciaHead.position.y = 0.8;  // Posición en el eje Y
```

#### **Cuerpo de LucIA**
```javascript
// Cuerpo cilíndrico elegante
const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 8);
const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x0066cc,  // Azul característico
    shininess: 100,
    transparent: true,
    opacity: 0.9
});
const luciaBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
luciaBody.position.y = 0.2;
```

#### **Extremidades**
```javascript
// Brazos cilíndricos
const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
const armMaterial = new THREE.MeshPhongMaterial({
    color: 0x0066cc,
    shininess: 80
});

// Brazo izquierdo
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.3, 0.3, 0);
leftArm.rotation.z = Math.PI / 4;

// Brazo derecho
const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.3, 0.3, 0);
rightArm.rotation.z = -Math.PI / 4;
```

## 🧠 **COMPRENSIÓN DE LUCIA**

LucIA entiende que las geometrías básicas son los **bloques de construcción fundamentales** de su representación 3D. Cada geometría tiene propiedades específicas que determinan su forma, tamaño y apariencia.

### **Relaciones entre geometrías:**
- **Cabeza**: Esfera modificada para simular forma humana
- **Cuerpo**: Cilindro con proporciones elegantes
- **Extremidades**: Cilindros delgados y articulados
- **Accesorios**: Combinación de geometrías básicas

### **Optimización de rendimiento:**
- Usar el mínimo de segmentos necesarios
- Reutilizar geometrías cuando sea posible
- Considerar LOD (Level of Detail) para distancias

## 🔗 **RELACIONES**

### **Conceptos relacionados:**
- **Materiales**: Cada geometría necesita un material
- **Transformaciones**: Posición, rotación, escalado
- **Iluminación**: Cómo las luces afectan las geometrías
- **Animaciones**: Modificar geometrías en tiempo real

### **Próximos pasos:**
- Aprender sobre materiales y texturas
- Implementar iluminación básica
- Crear animaciones simples

## 📈 **NIVEL DE DOMINIO**
**7/10** - LucIA comprende las geometrías básicas y puede aplicarlas para crear su avatar básico.

## 💻 **CÓDIGO COMPLETO DEL AVATAR BÁSICO**

```javascript
// Creación del avatar básico de LucIA
function createLuciaAvatar() {
    const avatarGroup = new THREE.Group();
    
    // Cabeza
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({
        color: 0xffcc99,
        shininess: 30,
        transparent: true,
        opacity: 0.95
    });
    const luciaHead = new THREE.Mesh(headGeometry, headMaterial);
    luciaHead.position.y = 0.8;
    avatarGroup.add(luciaHead);
    
    // Cuerpo
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066cc,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    const luciaBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    luciaBody.position.y = 0.2;
    avatarGroup.add(luciaBody);
    
    // Brazos
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
    const armMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066cc,
        shininess: 80
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.3, 0.3, 0);
    leftArm.rotation.z = Math.PI / 4;
    avatarGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.3, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 4;
    avatarGroup.add(rightArm);
    
    // Piernas
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6);
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066cc,
        shininess: 80
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.1, -0.4, 0);
    avatarGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.1, -0.4, 0);
    avatarGroup.add(rightLeg);
    
    return avatarGroup;
}

// Uso del avatar
const luciaAvatar = createLuciaAvatar();
scene.add(luciaAvatar);
```

## ✅ **EJERCICIOS PRÁCTICOS**

### **Ejercicio 1: Modificar proporciones**
Cambia los parámetros de las geometrías para crear diferentes versiones del avatar.

### **Ejercicio 2: Agregar detalles**
Añade geometrías adicionales para crear accesorios como collar o guantes.

### **Ejercicio 3: Optimización**
Reduce el número de segmentos manteniendo la calidad visual.

---

**🎯 LucIA ha completado el módulo de geometrías básicas y está lista para continuar con materiales y texturas.** 