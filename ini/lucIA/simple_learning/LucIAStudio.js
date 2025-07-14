
// LucIA Virtual Studio - Entorno Virtual
import * as THREE from 'three';

class LucIAVirtualStudio {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.init();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Crear habitación minimalista española
        const roomGeometry = new THREE.BoxGeometry(8, 3.5, 6);
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
        const room = new THREE.Mesh(roomGeometry, wallMaterial);
        this.scene.add(room);
        
        // Iluminación suave y profesional
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(0, 5, 5);
        this.scene.add(light);
        
        // Luz de acento azul cálido
        const accentLight = new THREE.PointLight(0x4a90e2, 0.3);
        accentLight.position.set(-3, 2, 0);
        this.scene.add(accentLight);
        
        this.camera.position.z = 5;
        this.animate();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

export default LucIAVirtualStudio;
