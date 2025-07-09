import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Stats from 'stats.js';

// Clase principal del Editor 3D
class Editor3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.transformControls = null;
        this.stats = null;
        this.selectedObject = null;
        this.objects = new Map();
        this.objectCounter = 0;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);

        // Crear renderer
        const canvas = document.getElementById('scene-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Crear controles de órbita
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Crear controles de transformación
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.controls.enabled = !event.value;
        });
        this.scene.add(this.transformControls);

        // Configurar iluminación básica
        this.setupLighting();

        // Configurar grid y ejes
        this.setupGrid();

        // Configurar stats
        this.setupStats();

        // Manejar redimensionamiento
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz direccional secundaria (fill light)
        const fillLight = new THREE.DirectionalLight(0x404040, 0.3);
        fillLight.position.set(-10, 5, -5);
        this.scene.add(fillLight);
    }

    setupGrid() {
        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    setupStats() {
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.top = '0px';
        this.stats.dom.style.left = '0px';
        document.getElementById('scene-container').appendChild(this.stats.dom);
    }

    setupEventListeners() {
        // Herramientas de transformación
        document.getElementById('select-tool').addEventListener('click', () => this.setTool('select'));
        document.getElementById('move-tool').addEventListener('click', () => this.setTool('translate'));
        document.getElementById('rotate-tool').addEventListener('click', () => this.setTool('rotate'));
        document.getElementById('scale-tool').addEventListener('click', () => this.setTool('scale'));

        // Botones de geometría
        document.querySelectorAll('.geometry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const geometryType = btn.dataset.geometry;
                this.createGeometry(geometryType);
            });
        });

        // Botones de luz
        document.querySelectorAll('.light-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lightType = btn.dataset.light;
                this.createLight(lightType);
            });
        });

        // Selector de material
        document.getElementById('material-color').addEventListener('change', (e) => {
            this.updateMaterialColor(e.target.value);
        });

        document.getElementById('material-type').addEventListener('change', (e) => {
            this.updateMaterialType(e.target.value);
        });

        // Eventos de ratón para selección
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));

        // Eventos de propiedades
        this.setupPropertyListeners();
    }

    setupPropertyListeners() {
        const properties = ['pos-x', 'pos-y', 'pos-z', 'rot-x', 'rot-y', 'rot-z', 'scale-x', 'scale-y', 'scale-z'];
        
        properties.forEach(prop => {
            const input = document.getElementById(prop);
            if (input) {
                input.addEventListener('change', () => this.updateObjectProperties());
            }
        });
    }

    setTool(tool) {
        // Actualizar botones activos
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Configurar controles de transformación
        this.transformControls.setMode(tool);
        
        if (this.selectedObject) {
            this.transformControls.attach(this.selectedObject);
        }
    }

    createGeometry(type) {
        let geometry, material, mesh;
        const color = document.getElementById('material-color').value;
        const materialType = document.getElementById('material-type').value;

        // Crear geometría según el tipo
        switch (type) {
            case 'box':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 32, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(2, 2);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(0.5, 1, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
                break;
            default:
                return;
        }

        // Crear material según el tipo seleccionado
        switch (materialType) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({ color: color });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({ color: color });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({ color: color });
                break;
            case 'standard':
                material = new THREE.MeshStandardMaterial({ color: color });
                break;
            default:
                material = new THREE.MeshBasicMaterial({ color: color });
        }

        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Posicionar en el centro de la escena
        mesh.position.set(0, 0, 0);

        // Agregar a la escena
        this.scene.add(mesh);

        // Guardar referencia
        const objectId = `object_${++this.objectCounter}`;
        this.objects.set(objectId, {
            mesh: mesh,
            type: 'geometry',
            geometryType: type,
            materialType: materialType,
            color: color
        });

        // Agregar al outliner
        this.addToOutliner(objectId, `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.objectCounter}`);

        // Seleccionar el objeto creado
        this.selectObject(mesh, objectId);

        this.updateSceneInfo();
    }

    createLight(type) {
        let light;
        const color = document.getElementById('material-color').value;

        switch (type) {
            case 'ambient':
                light = new THREE.AmbientLight(color, 0.4);
                break;
            case 'directional':
                light = new THREE.DirectionalLight(color, 0.8);
                light.position.set(5, 5, 5);
                light.castShadow = true;
                break;
            case 'point':
                light = new THREE.PointLight(color, 1, 100);
                light.position.set(0, 5, 0);
                break;
            case 'spot':
                light = new THREE.SpotLight(color, 1);
                light.position.set(0, 5, 0);
                light.angle = Math.PI / 4;
                light.penumbra = 0.1;
                light.decay = 2;
                light.distance = 200;
                break;
            default:
                return;
        }

        this.scene.add(light);

        const objectId = `light_${++this.objectCounter}`;
        this.objects.set(objectId, {
            mesh: light,
            type: 'light',
            lightType: type,
            color: color
        });

        this.addToOutliner(objectId, `${type.charAt(0).toUpperCase() + type.slice(1)} Light ${this.objectCounter}`);
        this.selectObject(light, objectId);
        this.updateSceneInfo();
    }

    onMouseClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object !== this.scene && object.type === 'Mesh') {
                // Encontrar el ID del objeto
                for (const [id, obj] of this.objects) {
                    if (obj.mesh === object) {
                        this.selectObject(object, id);
                        break;
                    }
                }
            }
        } else {
            this.deselectObject();
        }
    }

    selectObject(object, objectId) {
        this.selectedObject = object;
        this.transformControls.attach(object);
        
        // Actualizar outliner
        document.querySelectorAll('.scene-item').forEach(item => item.classList.remove('selected'));
        const outlinerItem = document.querySelector(`[data-id="${objectId}"]`);
        if (outlinerItem) {
            outlinerItem.classList.add('selected');
        }

        // Actualizar propiedades
        this.updatePropertyInputs();
    }

    deselectObject() {
        this.selectedObject = null;
        this.transformControls.detach();
        
        document.querySelectorAll('.scene-item').forEach(item => item.classList.remove('selected'));
        this.clearPropertyInputs();
    }

    updatePropertyInputs() {
        if (!this.selectedObject) return;

        const pos = this.selectedObject.position;
        const rot = this.selectedObject.rotation;
        const scale = this.selectedObject.scale;

        document.getElementById('pos-x').value = pos.x.toFixed(2);
        document.getElementById('pos-y').value = pos.y.toFixed(2);
        document.getElementById('pos-z').value = pos.z.toFixed(2);
        document.getElementById('rot-x').value = (rot.x * 180 / Math.PI).toFixed(2);
        document.getElementById('rot-y').value = (rot.y * 180 / Math.PI).toFixed(2);
        document.getElementById('rot-z').value = (rot.z * 180 / Math.PI).toFixed(2);
        document.getElementById('scale-x').value = scale.x.toFixed(2);
        document.getElementById('scale-y').value = scale.y.toFixed(2);
        document.getElementById('scale-z').value = scale.z.toFixed(2);
    }

    clearPropertyInputs() {
        const inputs = ['pos-x', 'pos-y', 'pos-z', 'rot-x', 'rot-y', 'rot-z', 'scale-x', 'scale-y', 'scale-z'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }

    updateObjectProperties() {
        if (!this.selectedObject) return;

        const posX = parseFloat(document.getElementById('pos-x').value) || 0;
        const posY = parseFloat(document.getElementById('pos-y').value) || 0;
        const posZ = parseFloat(document.getElementById('pos-z').value) || 0;
        const rotX = (parseFloat(document.getElementById('rot-x').value) || 0) * Math.PI / 180;
        const rotY = (parseFloat(document.getElementById('rot-y').value) || 0) * Math.PI / 180;
        const rotZ = (parseFloat(document.getElementById('rot-z').value) || 0) * Math.PI / 180;
        const scaleX = parseFloat(document.getElementById('scale-x').value) || 1;
        const scaleY = parseFloat(document.getElementById('scale-y').value) || 1;
        const scaleZ = parseFloat(document.getElementById('scale-z').value) || 1;

        this.selectedObject.position.set(posX, posY, posZ);
        this.selectedObject.rotation.set(rotX, rotY, rotZ);
        this.selectedObject.scale.set(scaleX, scaleY, scaleZ);
    }

    updateMaterialColor(color) {
        if (this.selectedObject && this.selectedObject.material) {
            this.selectedObject.material.color.setHex(color.replace('#', '0x'));
        }
    }

    updateMaterialType(type) {
        if (!this.selectedObject || !this.selectedObject.material) return;

        const color = this.selectedObject.material.color;
        let newMaterial;

        switch (type) {
            case 'basic':
                newMaterial = new THREE.MeshBasicMaterial({ color: color });
                break;
            case 'phong':
                newMaterial = new THREE.MeshPhongMaterial({ color: color });
                break;
            case 'lambert':
                newMaterial = new THREE.MeshLambertMaterial({ color: color });
                break;
            case 'standard':
                newMaterial = new THREE.MeshStandardMaterial({ color: color });
                break;
            default:
                return;
        }

        this.selectedObject.material = newMaterial;
    }

    addToOutliner(objectId, name) {
        const sceneTree = document.getElementById('scene-tree');
        const li = document.createElement('li');
        li.className = 'scene-item';
        li.dataset.id = objectId;
        
        const icon = document.createElement('span');
        icon.className = 'item-icon';
        icon.textContent = this.getObjectIcon(objectId);
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = name;
        
        li.appendChild(icon);
        li.appendChild(nameSpan);
        sceneTree.appendChild(li);

        // Evento de clic para seleccionar desde el outliner
        li.addEventListener('click', () => {
            const obj = this.objects.get(objectId);
            if (obj) {
                this.selectObject(obj.mesh, objectId);
            }
        });
    }

    getObjectIcon(objectId) {
        const obj = this.objects.get(objectId);
        if (!obj) return '❓';
        
        if (obj.type === 'light') {
            switch (obj.lightType) {
                case 'ambient': return '💡';
                case 'directional': return '☀️';
                case 'point': return '🔆';
                case 'spot': return '🎯';
                default: return '💡';
            }
        } else {
            switch (obj.geometryType) {
                case 'box': return '📦';
                case 'sphere': return '⚪';
                case 'cylinder': return '🥫';
                case 'plane': return '📄';
                case 'cone': return '🔺';
                case 'torus': return '🍩';
                default: return '📦';
            }
        }
    }

    updateSceneInfo() {
        let objectCount = 0;
        let polygonCount = 0;

        this.objects.forEach(obj => {
            if (obj.type === 'geometry') {
                objectCount++;
                if (obj.mesh.geometry) {
                    polygonCount += obj.mesh.geometry.attributes.position.count / 3;
                }
            }
        });

        document.getElementById('object-count').textContent = `Objetos: ${objectCount}`;
        document.getElementById('polygon-count').textContent = `Polígonos: ${Math.round(polygonCount)}`;
    }

    onWindowResize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        
        if (this.stats) {
            this.stats.update();
        }

        // Actualizar FPS
        document.getElementById('fps-counter').textContent = `FPS: ${Math.round(this.stats.getFPS())}`;
    }
}

// Inicializar el editor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Editor3D();
});

// Exportar para uso global
window.Editor3D = Editor3D; 