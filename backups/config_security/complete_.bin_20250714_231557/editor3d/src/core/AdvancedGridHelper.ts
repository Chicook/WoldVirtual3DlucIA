import * as THREE from 'three';

export interface AdvancedGridConfig {
  size: number; // Tamaño total de la cuadrícula
  divisions: number; // Número de divisiones principales
  subdivisions: number; // Subdivisiones entre líneas principales
  colorMain: THREE.Color; // Color de líneas principales
  colorSub: THREE.Color; // Color de líneas secundarias
  colorX: THREE.Color; // Color eje X
  colorY: THREE.Color; // Color eje Y
  colorZ: THREE.Color; // Color eje Z
  opacity: number; // Opacidad general
  showLabels: boolean; // Mostrar etiquetas de coordenadas
  fontSize: number; // Tamaño de fuente de etiquetas
}

export class AdvancedGridHelper extends THREE.Group {
  private config: AdvancedGridConfig;
  private gridLines: THREE.LineSegments;
  private axisLines: THREE.LineSegments;
  private labels: THREE.Group;

  constructor(config: Partial<AdvancedGridConfig> = {}) {
    super();
    this.config = {
      size: 20,
      divisions: 10,
      subdivisions: 5,
      colorMain: new THREE.Color(0x888888),
      colorSub: new THREE.Color(0x444444),
      colorX: new THREE.Color(0xff4444),
      colorY: new THREE.Color(0x44ff44),
      colorZ: new THREE.Color(0x4488ff),
      opacity: 0.7,
      showLabels: true,
      fontSize: 32,
      ...config
    };
    this.gridLines = this.createGridLines();
    this.axisLines = this.createAxisLines();
    this.labels = this.createLabels();
    this.add(this.gridLines);
    this.add(this.axisLines);
    if (this.config.showLabels) this.add(this.labels);
  }

  private createGridLines(): THREE.LineSegments {
    const { size, divisions, subdivisions, colorMain, colorSub, opacity } = this.config;
    const step = size / divisions;
    const subStep = step / subdivisions;
    const halfSize = size / 2;
    const vertices: number[] = [];
    const colors: number[] = [];

    // Líneas principales
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const pos = i * step;
      // Paralelas a X
      vertices.push(-halfSize, 0, pos, halfSize, 0, pos);
      // Paralelas a Z
      vertices.push(pos, 0, -halfSize, pos, 0, halfSize);
      for (let j = 0; j < 2; j++) {
        const color = (i === 0) ? colorMain : colorMain;
        colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
      }
    }
    // Líneas secundarias
    for (let i = -divisions / 2; i < divisions / 2; i++) {
      for (let s = 1; s < subdivisions; s++) {
        const pos = i * step + s * subStep;
        // Paralelas a X
        vertices.push(-halfSize, 0, pos, halfSize, 0, pos);
        // Paralelas a Z
        vertices.push(pos, 0, -halfSize, pos, 0, halfSize);
        for (let j = 0; j < 2; j++) {
          colors.push(colorSub.r, colorSub.g, colorSub.b, colorSub.r, colorSub.g, colorSub.b);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity });
    return new THREE.LineSegments(geometry, material);
  }

  private createAxisLines(): THREE.LineSegments {
    const { size, colorX, colorY, colorZ, opacity } = this.config;
    const halfSize = size / 2;
    const vertices = [
      // Eje X
      -halfSize, 0, 0, halfSize, 0, 0,
      // Eje Y
      0, -halfSize, 0, 0, halfSize, 0,
      // Eje Z
      0, 0, -halfSize, 0, 0, halfSize
    ];
    const colors = [
      // X (rojo)
      colorX.r, colorX.g, colorX.b, colorX.r, colorX.g, colorX.b,
      // Y (verde)
      colorY.r, colorY.g, colorY.b, colorY.r, colorY.g, colorY.b,
      // Z (azul)
      colorZ.r, colorZ.g, colorZ.b, colorZ.r, colorZ.g, colorZ.b
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2, transparent: true, opacity });
    return new THREE.LineSegments(geometry, material);
  }

  private createLabels(): THREE.Group {
    const { size, divisions, fontSize } = this.config;
    const step = size / divisions;
    const halfSize = size / 2;
    const group = new THREE.Group();
    // Solo etiquetas en los ejes principales
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      if (i === 0) continue;
      // Eje X
      group.add(this.createTextSprite(`${i * step}`, i * step, 0, 0, fontSize, '#ff4444'));
      // Eje Z
      group.add(this.createTextSprite(`${i * step}`, 0, 0, i * step, fontSize, '#4488ff'));
    }
    // Etiquetas de origen
    group.add(this.createTextSprite('0', 0, 0, 0, fontSize, '#ffffff'));
    return group;
  }

  private createTextSprite(text: string, x: number, y: number, z: number, fontSize: number, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y + 0.01, z);
    sprite.scale.set(1, 0.25, 1);
    return sprite;
  }

  public updateConfig(config: Partial<AdvancedGridConfig>) {
    // Eliminar elementos antiguos
    this.remove(this.gridLines);
    this.remove(this.axisLines);
    this.remove(this.labels);
    // Actualizar config
    this.config = { ...this.config, ...config };
    // Crear y añadir nuevos elementos
    this.gridLines = this.createGridLines();
    this.axisLines = this.createAxisLines();
    this.labels = this.createLabels();
    this.add(this.gridLines);
    this.add(this.axisLines);
    if (this.config.showLabels) this.add(this.labels);
  }
} 