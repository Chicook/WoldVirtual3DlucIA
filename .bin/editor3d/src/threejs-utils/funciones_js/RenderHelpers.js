/**
 * Render Helpers - Utilidades de renderizado y efectos visuales para el editor 3D
 * Maneja configuración de renderer, post-procesamiento, captura de pantalla y optimización
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class RenderHelpers {
  constructor() {
    this.renderer = null;
    this.composer = null;
    this.scene = null;
    this.camera = null;
    this.qualitySettings = {
      antialiasing: true,
      shadows: true,
      postProcessing: true,
      bloom: false,
      fxaa: true,
      pixelRatio: window.devicePixelRatio || 1
    };
    this.performanceStats = {
      fps: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
    this.renderTarget = null;
    this.isInitialized = false;
  }

  /**
   * Configura el renderer principal
   */
  setupRenderer(container, options = {}) {
    const settings = { ...this.qualitySettings, ...options };

    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: settings.antialiasing,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });

    // Configurar propiedades básicas
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(settings.pixelRatio);
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Añadir al contenedor
    container.appendChild(this.renderer.domElement);

    // Configurar eventos de redimensionamiento
    this.setupResizeHandler(container);

    console.log('✅ Renderer configurado');
    return this.renderer;
  }

  /**
   * Configura el post-procesamiento
   */
  setupPostProcessing(scene, camera) {
    if (!this.renderer || !this.qualitySettings.postProcessing) {
      return;
    }

    this.scene = scene;
    this.camera = camera;

    // Crear composer
    this.composer = new EffectComposer(this.renderer);

    // Render pass principal
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // FXAA (Anti-aliasing)
    if (this.qualitySettings.fxaa) {
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
      this.composer.addPass(fxaaPass);
    }

    // Bloom effect
    if (this.qualitySettings.bloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,  // strength
        0.4,  // radius
        0.85  // threshold
      );
      this.composer.addPass(bloomPass);
    }

    console.log('✅ Post-procesamiento configurado');
  }

  /**
   * Renderiza la escena
   */
  render() {
    if (!this.isInitialized) {
      console.warn('⚠️ Renderer no inicializado');
      return;
    }

    // Actualizar estadísticas de rendimiento
    this.updatePerformanceStats();

    // Renderizar con post-procesamiento o sin él
    if (this.composer && this.qualitySettings.postProcessing) {
      this.composer.render();
    } else if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Actualiza las estadísticas de rendimiento
   */
  updatePerformanceStats() {
    if (!this.renderer) return;

    const info = this.renderer.info;
    this.performanceStats.drawCalls = info.render.calls;
    this.performanceStats.triangles = info.render.triangles;
    this.performanceStats.points = info.render.points;
    this.performanceStats.lines = info.render.lines;

    // Calcular FPS (simplificado)
    const now = performance.now();
    if (!this.lastFrameTime) {
      this.lastFrameTime = now;
    }
    const deltaTime = now - this.lastFrameTime;
    this.performanceStats.fps = Math.round(1000 / deltaTime);
    this.lastFrameTime = now;
  }

  /**
   * Obtiene las estadísticas de rendimiento
   */
  getPerformanceStats() {
    return { ...this.performanceStats };
  }

  /**
   * Establece el nivel de calidad
   */
  setQualityLevel(level) {
    const qualityPresets = {
      low: {
        antialiasing: false,
        shadows: false,
        postProcessing: false,
        bloom: false,
        fxaa: false,
        pixelRatio: 1
      },
      medium: {
        antialiasing: true,
        shadows: true,
        postProcessing: false,
        bloom: false,
        fxaa: true,
        pixelRatio: 1
      },
      high: {
        antialiasing: true,
        shadows: true,
        postProcessing: true,
        bloom: false,
        fxaa: true,
        pixelRatio: window.devicePixelRatio || 1
      },
      ultra: {
        antialiasing: true,
        shadows: true,
        postProcessing: true,
        bloom: true,
        fxaa: true,
        pixelRatio: window.devicePixelRatio || 1
      }
    };

    const preset = qualityPresets[level];
    if (!preset) {
      console.warn(`⚠️ Nivel de calidad no válido: ${level}`);
      return;
    }

    this.qualitySettings = { ...this.qualitySettings, ...preset };
    this.applyQualitySettings();

    console.log(`✅ Calidad establecida en: ${level}`);
  }

  /**
   * Aplica la configuración de calidad actual
   */
  applyQualitySettings() {
    if (!this.renderer) return;

    // Aplicar configuración al renderer
    this.renderer.shadowMap.enabled = this.qualitySettings.shadows;
    this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);

    // Reconfigurar post-procesamiento si es necesario
    if (this.scene && this.camera) {
      this.setupPostProcessing(this.scene, this.camera);
    }
  }

  /**
   * Captura una screenshot de la escena
   */
  captureScreenshot(format = 'png', quality = 0.9) {
    if (!this.renderer) {
      console.error('❌ Renderer no disponible');
      return null;
    }

    // Renderizar la escena actual
    this.render();

    // Capturar el canvas
    const canvas = this.renderer.domElement;
    const dataURL = canvas.toDataURL(`image/${format}`, quality);

    return dataURL;
  }

  /**
   * Descarga la screenshot
   */
  downloadScreenshot(filename = 'screenshot.png') {
    const dataURL = this.captureScreenshot();
    if (!dataURL) return;

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  }

  /**
   * Configura el manejo de redimensionamiento
   */
  setupResizeHandler(container) {
    const resizeObserver = new ResizeObserver(() => {
      this.resize(container.clientWidth, container.clientHeight);
    });

    resizeObserver.observe(container);
  }

  /**
   * Redimensiona el renderer
   */
  resize(width, height) {
    if (!this.renderer) return;

    this.renderer.setSize(width, height);

    if (this.camera && this.camera.isPerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    if (this.composer) {
      this.composer.setSize(width, height);
    }

    // Actualizar FXAA si está activo
    if (this.composer && this.qualitySettings.fxaa) {
      const fxaaPass = this.composer.passes.find(pass => pass.material && pass.material.uniforms && pass.material.uniforms.resolution);
      if (fxaaPass) {
        fxaaPass.material.uniforms.resolution.value.x = 1 / (width * this.renderer.getPixelRatio());
        fxaaPass.material.uniforms.resolution.value.y = 1 / (height * this.renderer.getPixelRatio());
      }
    }

    console.log(`📐 Renderer redimensionado: ${width}x${height}`);
  }

  /**
   * Crea un render target para efectos especiales
   */
  createRenderTarget(width, height, options = {}) {
    const settings = {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      ...options
    };

    this.renderTarget = new THREE.WebGLRenderTarget(width, height, settings);
    return this.renderTarget;
  }

  /**
   * Limpia el render target
   */
  disposeRenderTarget() {
    if (this.renderTarget) {
      this.renderTarget.dispose();
      this.renderTarget = null;
    }
  }

  /**
   * Obtiene información del sistema de renderizado
   */
  getRendererInfo() {
    if (!this.renderer) return null;

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
   * Marca como inicializado
   */
  markAsInitialized() {
    this.isInitialized = true;
  }

  /**
   * Limpia todos los recursos
   */
  dispose() {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }

    if (this.renderTarget) {
      this.disposeRenderTarget();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.isInitialized = false;

    console.log('🧹 Render Helpers limpiado');
  }
}

export { RenderHelpers }; 