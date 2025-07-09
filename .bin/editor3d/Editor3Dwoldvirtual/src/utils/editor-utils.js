/**
 * Utilidades para el Editor 3D WoldVirtual
 * Funciones auxiliares para el manejo de la escena, objetos y transformaciones
 */

import * as THREE from 'three';

export class EditorUtils {
    /**
     * Genera un ID único para objetos
     * @param {string} prefix - Prefijo para el ID
     * @returns {string} ID único
     */
    static generateId(prefix = 'object') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Convierte grados a radianes
     * @param {number} degrees - Ángulo en grados
     * @returns {number} Ángulo en radianes
     */
    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convierte radianes a grados
     * @param {number} radians - Ángulo en radianes
     * @returns {number} Ángulo en grados
     */
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Crea un material con propiedades básicas
     * @param {string} type - Tipo de material
     * @param {string} color - Color en formato hexadecimal
     * @param {Object} options - Opciones adicionales
     * @returns {THREE.Material} Material creado
     */
    static createMaterial(type, color = '#ffffff', options = {}) {
        const colorHex = color.startsWith('#') ? color : `#${color}`;
        const materialOptions = { color: colorHex, ...options };

        switch (type.toLowerCase()) {
            case 'basic':
                return new THREE.MeshBasicMaterial(materialOptions);
            case 'phong':
                return new THREE.MeshPhongMaterial(materialOptions);
            case 'lambert':
                return new THREE.MeshLambertMaterial(materialOptions);
            case 'standard':
                return new THREE.MeshStandardMaterial(materialOptions);
            case 'physical':
                return new THREE.MeshPhysicalMaterial(materialOptions);
            default:
                return new THREE.MeshBasicMaterial(materialOptions);
        }
    }

    /**
     * Crea una geometría básica
     * @param {string} type - Tipo de geometría
     * @param {Object} params - Parámetros de la geometría
     * @returns {THREE.BufferGeometry} Geometría creada
     */
    static createGeometry(type, params = {}) {
        const defaultParams = {
            box: { width: 1, height: 1, depth: 1 },
            sphere: { radius: 0.5, segments: 32 },
            cylinder: { radius: 0.5, height: 1, segments: 32 },
            plane: { width: 2, height: 2 },
            cone: { radius: 0.5, height: 1, segments: 32 },
            torus: { radius: 0.5, tube: 0.2, segments: 16, tubularSegments: 100 }
        };

        const geometryParams = { ...defaultParams[type], ...params };

        switch (type.toLowerCase()) {
            case 'box':
                return new THREE.BoxGeometry(
                    geometryParams.width,
                    geometryParams.height,
                    geometryParams.depth
                );
            case 'sphere':
                return new THREE.SphereGeometry(
                    geometryParams.radius,
                    geometryParams.segments,
                    geometryParams.segments
                );
            case 'cylinder':
                return new THREE.CylinderGeometry(
                    geometryParams.radius,
                    geometryParams.radius,
                    geometryParams.height,
                    geometryParams.segments
                );
            case 'plane':
                return new THREE.PlaneGeometry(
                    geometryParams.width,
                    geometryParams.height
                );
            case 'cone':
                return new THREE.ConeGeometry(
                    geometryParams.radius,
                    geometryParams.height,
                    geometryParams.segments
                );
            case 'torus':
                return new THREE.TorusGeometry(
                    geometryParams.radius,
                    geometryParams.tube,
                    geometryParams.segments,
                    geometryParams.tubularSegments
                );
            default:
                throw new Error(`Geometría no soportada: ${type}`);
        }
    }

    /**
     * Crea una luz
     * @param {string} type - Tipo de luz
     * @param {Object} params - Parámetros de la luz
     * @returns {THREE.Light} Luz creada
     */
    static createLight(type, params = {}) {
        const defaultParams = {
            ambient: { color: 0x404040, intensity: 0.4 },
            directional: { color: 0xffffff, intensity: 0.8 },
            point: { color: 0xffffff, intensity: 1, distance: 100 },
            spot: { color: 0xffffff, intensity: 1, distance: 200, angle: Math.PI / 4 }
        };

        const lightParams = { ...defaultParams[type], ...params };

        switch (type.toLowerCase()) {
            case 'ambient':
                return new THREE.AmbientLight(lightParams.color, lightParams.intensity);
            case 'directional':
                const directionalLight = new THREE.DirectionalLight(lightParams.color, lightParams.intensity);
                directionalLight.castShadow = true;
                return directionalLight;
            case 'point':
                return new THREE.PointLight(lightParams.color, lightParams.intensity, lightParams.distance);
            case 'spot':
                const spotLight = new THREE.SpotLight(lightParams.color, lightParams.intensity, lightParams.distance);
                spotLight.angle = lightParams.angle;
                spotLight.castShadow = true;
                return spotLight;
            default:
                throw new Error(`Tipo de luz no soportado: ${type}`);
        }
    }

    /**
     * Calcula el centro de un objeto o grupo de objetos
     * @param {THREE.Object3D|Array} objects - Objeto(s) a analizar
     * @returns {THREE.Vector3} Centro calculado
     */
    static calculateCenter(objects) {
        const objectArray = Array.isArray(objects) ? objects : [objects];
        const center = new THREE.Vector3();
        let count = 0;

        objectArray.forEach(obj => {
            if (obj.geometry) {
                obj.geometry.computeBoundingBox();
                const box = obj.geometry.boundingBox;
                center.add(box.getCenter(new THREE.Vector3()).multiplyScalar(obj.scale.x));
                count++;
            }
        });

        return count > 0 ? center.divideScalar(count) : new THREE.Vector3();
    }

    /**
     * Calcula el bounding box de un objeto
     * @param {THREE.Object3D} object - Objeto a analizar
     * @returns {THREE.Box3} Bounding box
     */
    static calculateBoundingBox(object) {
        const box = new THREE.Box3();
        box.setFromObject(object);
        return box;
    }

    /**
     * Duplica un objeto
     * @param {THREE.Object3D} object - Objeto a duplicar
     * @returns {THREE.Object3D} Objeto duplicado
     */
    static duplicateObject(object) {
        if (object.type === 'Mesh') {
            const geometry = object.geometry.clone();
            const material = object.material.clone();
            const mesh = new THREE.Mesh(geometry, material);
            
            // Copiar propiedades
            mesh.position.copy(object.position);
            mesh.rotation.copy(object.rotation);
            mesh.scale.copy(object.scale);
            mesh.castShadow = object.castShadow;
            mesh.receiveShadow = object.receiveShadow;
            
            return mesh;
        }
        return object.clone();
    }

    /**
     * Exporta la escena a JSON
     * @param {THREE.Scene} scene - Escena a exportar
     * @returns {Object} Datos de la escena en formato JSON
     */
    static exportSceneToJSON(scene) {
        const sceneData = {
            metadata: {
                version: '1.0.0',
                type: 'WoldVirtual3D Scene',
                generator: 'Editor3D WoldVirtual'
            },
            objects: [],
            lights: [],
            camera: {
                position: scene.camera ? scene.camera.position.toArray() : [0, 0, 0],
                rotation: scene.camera ? scene.camera.rotation.toArray() : [0, 0, 0]
            }
        };

        scene.traverse((object) => {
            if (object.type === 'Mesh') {
                const objectData = {
                    id: object.id,
                    type: 'mesh',
                    geometry: {
                        type: object.geometry.type,
                        parameters: this.getGeometryParameters(object.geometry)
                    },
                    material: {
                        type: object.material.type,
                        color: object.material.color.getHexString(),
                        transparent: object.material.transparent,
                        opacity: object.material.opacity
                    },
                    position: object.position.toArray(),
                    rotation: object.rotation.toArray(),
                    scale: object.scale.toArray(),
                    castShadow: object.castShadow,
                    receiveShadow: object.receiveShadow
                };
                sceneData.objects.push(objectData);
            } else if (object.type.includes('Light')) {
                const lightData = {
                    id: object.id,
                    type: object.type,
                    color: object.color.getHexString(),
                    intensity: object.intensity,
                    position: object.position.toArray(),
                    castShadow: object.castShadow
                };
                sceneData.lights.push(lightData);
            }
        });

        return sceneData;
    }

    /**
     * Obtiene los parámetros de una geometría
     * @param {THREE.BufferGeometry} geometry - Geometría a analizar
     * @returns {Object} Parámetros de la geometría
     */
    static getGeometryParameters(geometry) {
        const parameters = {};
        
        if (geometry.parameters) {
            Object.assign(parameters, geometry.parameters);
        }
        
        // Agregar información adicional
        parameters.vertexCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
        parameters.faceCount = geometry.index ? geometry.index.count / 3 : 0;
        
        return parameters;
    }

    /**
     * Valida si un objeto es válido para el editor
     * @param {THREE.Object3D} object - Objeto a validar
     * @returns {boolean} True si es válido
     */
    static isValidObject(object) {
        return object && 
               (object.type === 'Mesh' || 
                object.type.includes('Light') || 
                object.type === 'Group' ||
                object.type === 'Scene');
    }

    /**
     * Formatea un número para mostrar en la interfaz
     * @param {number} value - Valor a formatear
     * @param {number} decimals - Número de decimales
     * @returns {string} Valor formateado
     */
    static formatNumber(value, decimals = 2) {
        return Number(value).toFixed(decimals);
    }

    /**
     * Convierte un color hexadecimal a RGB
     * @param {string} hex - Color en formato hexadecimal
     * @returns {Object} Objeto con valores RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convierte valores RGB a hexadecimal
     * @param {number} r - Componente rojo (0-255)
     * @param {number} g - Componente verde (0-255)
     * @param {number} b - Componente azul (0-255)
     * @returns {string} Color en formato hexadecimal
     */
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Crea un nombre único para un objeto
     * @param {string} baseName - Nombre base
     * @param {Array} existingNames - Nombres existentes
     * @returns {string} Nombre único
     */
    static generateUniqueName(baseName, existingNames = []) {
        let name = baseName;
        let counter = 1;
        
        while (existingNames.includes(name)) {
            name = `${baseName} ${counter}`;
            counter++;
        }
        
        return name;
    }

    /**
     * Calcula la distancia entre dos puntos 3D
     * @param {THREE.Vector3} point1 - Primer punto
     * @param {THREE.Vector3} point2 - Segundo punto
     * @returns {number} Distancia
     */
    static calculateDistance(point1, point2) {
        return point1.distanceTo(point2);
    }

    /**
     * Interpola linealmente entre dos valores
     * @param {number} start - Valor inicial
     * @param {number} end - Valor final
     * @param {number} factor - Factor de interpolación (0-1)
     * @returns {number} Valor interpolado
     */
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * Clampa un valor entre un mínimo y máximo
     * @param {number} value - Valor a clamar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} Valor clampeado
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

// Exportar funciones individuales para uso directo
export const {
    generateId,
    degreesToRadians,
    radiansToDegrees,
    createMaterial,
    createGeometry,
    createLight,
    calculateCenter,
    calculateBoundingBox,
    duplicateObject,
    exportSceneToJSON,
    isValidObject,
    formatNumber,
    hexToRgb,
    rgbToHex,
    generateUniqueName,
    calculateDistance,
    lerp,
    clamp
} = EditorUtils; 