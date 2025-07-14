/**
 * Transform Tools - Funciones JavaScript para herramientas de transformación
 * Maneja operaciones de edición como mover, rotar, escalar, duplicar, etc.
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class TransformTools {
  constructor() {
    this.transformMode = 'translate'; // translate, rotate, scale
    this.snapEnabled = false;
    this.snapValue = 1.0;
    this.pivotPoint = new THREE.Vector3(0, 0, 0);
    this.transformControls = null;
    this.isActive = false;
  }

  /**
   * Configura los controles de transformación
   */
  setupTransformControls(camera, renderer) {
    if (this.transformControls) {
      this.transformControls.dispose();
    }

    this.transformControls = new TransformControls(camera, renderer.domElement);
    this.transformControls.setMode(this.transformMode);
    // this.transformControls.setSnap(this.snapEnabled ? this.snapValue : null); // Función no disponible en esta versión
    // this.transformControls.setPivotPoint(this.pivotPoint); // Función no disponible en esta versión

    return this.transformControls;
  }

  /**
   * Cambia el modo de transformación
   */
  setTransformMode(mode) {
    this.transformMode = mode;
    if (this.transformControls) {
      this.transformControls.setMode(mode);
    }
  }

  /**
   * Establece el modo de transformación (alias para setTransformMode)
   */
  setMode(mode) {
    this.setTransformMode(mode);
  }

  /**
   * Establece el objeto objetivo para las transformaciones
   */
  setTarget(object) {
    if (this.transformControls) {
      if (object) {
        this.transformControls.attach(object);
        this.isActive = true;
      } else {
        this.transformControls.detach();
        this.isActive = false;
      }
    }
  }

  /**
   * Activa/desactiva el snap
   */
  setSnap(enabled, value = 1.0) {
    this.snapEnabled = enabled;
    this.snapValue = value;
    // if (this.transformControls) {
    //   this.transformControls.setSnap(enabled ? value : null); // Función no disponible en esta versión
    // }
  }

  /**
   * Mueve un objeto a una posición específica
   */
  moveObject(object, position, snap = false) {
    if (!object) return false;

    const newPosition = position.clone();
    
    if (snap && this.snapEnabled) {
      newPosition.x = Math.round(newPosition.x / this.snapValue) * this.snapValue;
      newPosition.y = Math.round(newPosition.y / this.snapValue) * this.snapValue;
      newPosition.z = Math.round(newPosition.z / this.snapValue) * this.snapValue;
    }

    object.position.copy(newPosition);
    return true;
  }

  /**
   * Rota un objeto a una rotación específica
   */
  rotateObject(object, rotation, snap = false) {
    if (!object) return false;

    const newRotation = rotation.clone();
    
    if (snap && this.snapEnabled) {
      const snapAngle = (Math.PI / 180) * this.snapValue;
      newRotation.x = Math.round(newRotation.x / snapAngle) * snapAngle;
      newRotation.y = Math.round(newRotation.y / snapAngle) * snapAngle;
      newRotation.z = Math.round(newRotation.z / snapAngle) * snapAngle;
    }

    object.rotation.copy(newRotation);
    return true;
  }

  /**
   * Escala un objeto a un tamaño específico
   */
  scaleObject(object, scale, snap = false) {
    if (!object) return false;

    const newScale = scale.clone();
    
    if (snap && this.snapEnabled) {
      newScale.x = Math.round(newScale.x / this.snapValue) * this.snapValue;
      newScale.y = Math.round(newScale.y / this.snapValue) * this.snapValue;
      newScale.z = Math.round(newScale.z / this.snapValue) * this.snapValue;
    }

    object.scale.copy(newScale);
    return true;
  }

  /**
   * Duplica un objeto
   */
  duplicateObject(object) {
    if (!object) return null;

    let duplicatedObject;

    if (object.type === 'Mesh') {
      // Duplicar geometría y material
      const geometry = object.geometry.clone();
      const material = object.material.clone();
      duplicatedObject = new THREE.Mesh(geometry, material);
      
      // Copiar propiedades
      duplicatedObject.position.copy(object.position);
      duplicatedObject.rotation.copy(object.rotation);
      duplicatedObject.scale.copy(object.scale);
      duplicatedObject.userData = JSON.parse(JSON.stringify(object.userData));
      duplicatedObject.userData.id = `obj_${Date.now()}_${Math.random()}`;
      duplicatedObject.userData.name = `${object.userData.name || 'Object'}_copy`;
      
    } else if (object.type === 'Group') {
      duplicatedObject = object.clone();
      duplicatedObject.userData = JSON.parse(JSON.stringify(object.userData));
      duplicatedObject.userData.id = `group_${Date.now()}_${Math.random()}`;
      duplicatedObject.userData.name = `${object.userData.name || 'Group'}_copy`;
      
    } else {
      duplicatedObject = object.clone();
    }

    return duplicatedObject;
  }

  /**
   * Duplica múltiples objetos seleccionados
   */
  duplicateSelectedObjects(selectedObjects) {
    const duplicatedObjects = [];
    
    selectedObjects.forEach(obj => {
      const duplicated = this.duplicateObject(obj);
      if (duplicated) {
        duplicatedObjects.push(duplicated);
      }
    });

    return duplicatedObjects;
  }

  /**
   * Elimina objetos seleccionados
   */
  deleteObjects(objects, scene) {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    objects.forEach(obj => {
      if (obj && scene) {
        scene.remove(obj);
        
        // Limpiar recursos
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Agrupa objetos seleccionados
   */
  groupObjects(objects, groupName = 'Group') {
    if (!Array.isArray(objects) || objects.length === 0) return null;

    const group = new THREE.Group();
    group.name = groupName;
    group.userData = {
      type: 'group',
      name: groupName,
      createdAt: Date.now()
    };

    objects.forEach(obj => {
      if (obj && obj.parent) {
        obj.parent.remove(obj);
        group.add(obj);
      }
    });

    return group;
  }

  /**
   * Desagrupa objetos
   */
  ungroupObjects(groups, parentScene) {
    if (!Array.isArray(groups)) {
      groups = [groups];
    }

    const ungroupedObjects = [];

    groups.forEach(group => {
      if (group && group.type === 'Group') {
        const children = [...group.children];
        children.forEach(child => {
          group.remove(child);
          if (parentScene) {
            parentScene.add(child);
          }
          ungroupedObjects.push(child);
        });
        
        // Eliminar el grupo vacío
        if (group.parent) {
          group.parent.remove(group);
        }
      }
    });

    return ungroupedObjects;
  }

  /**
   * Alinea objetos a una posición específica
   */
  alignObjects(objects, alignment = 'center', axis = 'all') {
    if (!Array.isArray(objects) || objects.length === 0) return;

    const positions = objects.map(obj => obj.position.clone());
    let targetPosition = new THREE.Vector3();

    switch (alignment) {
      case 'center':
        targetPosition = positions.reduce((sum, pos) => sum.add(pos), new THREE.Vector3())
          .divideScalar(positions.length);
        break;
      case 'min':
        targetPosition = new THREE.Vector3(
          Math.min(...positions.map(p => p.x)),
          Math.min(...positions.map(p => p.y)),
          Math.min(...positions.map(p => p.z))
        );
        break;
      case 'max':
        targetPosition = new THREE.Vector3(
          Math.max(...positions.map(p => p.x)),
          Math.max(...positions.map(p => p.y)),
          Math.max(...positions.map(p => p.z))
        );
        break;
    }

    objects.forEach(obj => {
      const newPosition = obj.position.clone();
      
      if (axis === 'all' || axis === 'x') {
        newPosition.x = targetPosition.x;
      }
      if (axis === 'all' || axis === 'y') {
        newPosition.y = targetPosition.y;
      }
      if (axis === 'all' || axis === 'z') {
        newPosition.z = targetPosition.z;
      }
      
      obj.position.copy(newPosition);
    });
  }

  /**
   * Distribuye objetos uniformemente
   */
  distributeObjects(objects, axis = 'x') {
    if (!Array.isArray(objects) || objects.length < 3) return;

    const positions = objects.map(obj => obj.position.clone());
    const values = positions.map(pos => pos[axis]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / (objects.length - 1);

    objects.forEach((obj, index) => {
      const newPosition = obj.position.clone();
      newPosition[axis] = min + (step * index);
      obj.position.copy(newPosition);
    });
  }

  /**
   * Aplica transformaciones a múltiples objetos
   */
  applyTransformToObjects(objects, transformType, value) {
    if (!Array.isArray(objects)) return;

    objects.forEach(obj => {
      switch (transformType) {
        case 'position':
          this.moveObject(obj, value);
          break;
        case 'rotation':
          this.rotateObject(obj, value);
          break;
        case 'scale':
          this.scaleObject(obj, value);
          break;
      }
    });
  }

  /**
   * Limpia los controles de transformación
   */
  dispose() {
    if (this.transformControls) {
      this.transformControls.dispose();
      this.transformControls = null;
    }
    this.isActive = false;
  }
} 