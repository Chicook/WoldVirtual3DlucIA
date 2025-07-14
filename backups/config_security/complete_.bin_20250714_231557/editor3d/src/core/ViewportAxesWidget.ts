import * as THREE from 'three';

export class ViewportAxesWidget extends THREE.Group {
  private size: number;
  private axes: { x: THREE.Mesh; y: THREE.Mesh; z: THREE.Mesh };
  private spheres: { x: THREE.Mesh; y: THREE.Mesh; z: THREE.Mesh };

  constructor(size: number = 1.2) {
    super();
    this.size = size;
    this.axes = {
      x: this.createAxis(new THREE.Color(0xff4444), new THREE.Vector3(1, 0, 0)),
      y: this.createAxis(new THREE.Color(0x44ff44), new THREE.Vector3(0, 1, 0)),
      z: this.createAxis(new THREE.Color(0x4488ff), new THREE.Vector3(0, 0, 1)),
    };
    this.spheres = {
      x: this.createSphere(new THREE.Color(0xff4444), new THREE.Vector3(this.size, 0, 0)),
      y: this.createSphere(new THREE.Color(0x44ff44), new THREE.Vector3(0, this.size, 0)),
      z: this.createSphere(new THREE.Color(0x4488ff), new THREE.Vector3(0, 0, this.size)),
    };
    this.add(this.axes.x, this.axes.y, this.axes.z);
    this.add(this.spheres.x, this.spheres.y, this.spheres.z);
    // Opcional: añadir etiquetas X, Y, Z
    this.add(this.createLabel('X', this.size + 0.25, 0, 0, '#ff4444'));
    this.add(this.createLabel('Y', 0, this.size + 0.25, 0, '#44ff44'));
    this.add(this.createLabel('Z', 0, 0, this.size + 0.25, '#4488ff'));
  }

  private createAxis(color: THREE.Color, dir: THREE.Vector3): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.04, 0.04, this.size, 12);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(dir.clone().multiplyScalar(this.size / 2));
    if (dir.x) mesh.rotation.z = Math.PI / 2;
    if (dir.z) mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  private createSphere(color: THREE.Color, pos: THREE.Vector3): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.09, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    return mesh;
  }

  private createLabel(text: string, x: number, y: number, z: number, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 36px Segoe UI, Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(0.35, 0.35, 0.35);
    return sprite;
  }

  /**
   * Actualiza la orientación del widget para que coincida con la cámara principal
   */
  public updateFromCamera(camera: THREE.Camera) {
    // El widget debe rotar igual que la cámara, pero no trasladarse
    this.quaternion.copy(camera.quaternion);
  }
} 