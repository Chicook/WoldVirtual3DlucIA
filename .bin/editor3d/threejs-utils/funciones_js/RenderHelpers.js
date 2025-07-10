/**
 * Render Helpers - Utilidades de renderizado y post-procesamiento para el editor 3D
 * Maneja configuración de renderer, efectos visuales, anti-aliasing y optimización de rendimiento
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class RenderHelpers {
  constructor() {
    this.renderer = null;
    this.composer = null;
    this.scene = null;
    this.camera = null;
    this.renderPass = null;
    this.effects = new Map();
    this.renderMode = 'standard'; // standard, wireframe, shaded, textured
    this.antiAliasing = true;
    this.shadows = true;
    this.postProcessing = true;
    this.performanceMode = false;
    this.renderStats = {
      fps: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
  }

  /**
   * Inicializa el renderer con configuración optimizada
   */
  initializeRenderer(container, options = {}) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: options.antialias !== undefined ? options.antialias : this.antiAliasing,
      alpha: options.alpha !== undefined ? options.alpha : false,
      preserveDrawingBuffer: options.preserveDrawingBuffer !== undefined ? options.preserveDrawingBuffer : false,
      powerPreference: options.powerPreference || 'high-performance',
      stencil: options.stencil !== undefined ? options.stencil : false,
      depth: options.depth !== undefined ? options.depth : true
    });

    // Configuración básica
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = this.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Configurar color de fondo
    this.renderer.setClearColor(0x23272e, 1);

    return this.renderer;
  }

  /**
   * Configura el post-procesamiento
   */
  setupPostProcessing(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.composer = new EffectComposer(this.renderer);
    
    // Render pass principal
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // Anti-aliasing FXAA
    if (this.antiAliasing) {
      this.addFXAA();
    }

    return this.composer;
  }

  /**
   * Añade efecto FXAA para anti-aliasing
   */
  addFXAA() {
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.renderer.domElement.width * this.renderer.getPixelRatio());
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.renderer.domElement.height * this.renderer.getPixelRatio());
    
    this.composer.addPass(fxaaPass);
    this.effects.set('fxaa', fxaaPass);
  }

  /**
   * Cambia el modo de renderizado
   */
  setRenderMode(mode) {
    this.renderMode = mode;
    
    if (!this.scene) return;

    this.scene.traverse((object) => {
      if (object.type === 'Mesh' && object.material) {
        switch (mode) {
          case 'wireframe':
            this.setWireframeMode(object, true);
            break;
          case 'shaded':
            this.setWireframeMode(object, false);
            this.setShadedMode(object, true);
            break;
          case 'textured':
            this.setWireframeMode(object, false);
            this.setShadedMode(object, false);
            break;
          default:
            this.setWireframeMode(object, false);
            this.setShadedMode(object, false);
        }
      }
    });
  }

  /**
   * Configura modo wireframe
   */
  setWireframeMode(object, enabled) {
    if (Array.isArray(object.material)) {
      object.material.forEach(mat => {
        mat.wireframe = enabled;
      });
    } else {
      object.material.wireframe = enabled;
    }
  }

  /**
   * Configura modo sombreado
   */
  setShadedMode(object, enabled) {
    if (Array.isArray(object.material)) {
      object.material.forEach(mat => {
        if (enabled) {
          mat.transparent = false;
          mat.opacity = 1.0;
        }
      });
    } else {
      if (enabled) {
        object.material.transparent = false;
        object.material.opacity = 1.0;
      }
    }
  }

  /**
   * Renderiza la escena
   */
  render() {
    if (this.postProcessing && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // Actualizar estadísticas
    this.updateRenderStats();
  }

  /**
   * Actualiza estadísticas de renderizado
   */
  updateRenderStats() {
    const info = this.renderer.info;
    this.renderStats.drawCalls = info.render.calls;
    this.renderStats.triangles = info.render.triangles;
    this.renderStats.points = info.render.points;
    this.renderStats.lines = info.render.lines;
  }

  /**
   * Configura modo de rendimiento
   */
  setPerformanceMode(enabled) {
    this.performanceMode = enabled;
    
    if (enabled) {
      // Reducir calidad para mejor rendimiento
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
      this.postProcessing = false;
      this.antiAliasing = false;
    } else {
      // Restaurar calidad normal
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = this.shadows;
      this.postProcessing = true;
      this.antiAliasing = true;
    }
  }

  /**
   * Captura una imagen de la escena
   */
  captureScreenshot(format = 'png', quality = 0.9) {
    this.render();
    
    const canvas = this.renderer.domElement;
    const dataURL = canvas.toDataURL(`image/${format}`, quality);
    
    return dataURL;
  }

  /**
   * Descarga la captura de pantalla
   */
  downloadScreenshot(filename = 'screenshot.png') {
    const dataURL = this.captureScreenshot();
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  }

  /**
   * Configura el tamaño del renderer
   */
  setSize(width, height) {
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }

    // Actualizar efectos si existen
    this.effects.forEach((effect, name) => {
      if (name === 'fxaa') {
        effect.material.uniforms['resolution'].value.x = 1 / (width * this.renderer.getPixelRatio());
        effect.material.uniforms['resolution'].value.y = 1 / (height * this.renderer.getPixelRatio());
      }
    });
  }

  /**
   * Limpia recursos del renderer
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.composer) {
      this.composer.dispose();
    }

    this.effects.forEach(effect => {
      if (effect.dispose) {
        effect.dispose();
      }
    });

    this.effects.clear();
  }

  /**
   * Obtiene información del renderer
   */
  getRendererInfo() {
    const info = this.renderer.info;
    return {
      memory: {
        geometries: info.memory.geometries,
        textures: info.memory.textures
      },
      render: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines
      },
      programs: info.programs?.length || 0
    };
  }

  /**
   * Configura efectos de iluminación
   */
  setupLightingEffects() {
    // Configurar sombras
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
  }

  /**
   * Optimiza el renderer para dispositivos móviles
   */
  optimizeForMobile() {
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = false;
    this.postProcessing = false;
    this.antiAliasing = false;
    this.performanceMode = true;
  }
}

export default RenderHelpers; 