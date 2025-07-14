import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3 } from '../scene/math/Vector3';

/**
 * Tipos de efectos de post-procesado
 */
export enum PostEffectType {
  BLOOM = 'bloom',
  SSAO = 'ssao',
  DOF = 'dof',
  MOTION_BLUR = 'motionBlur',
  CHROMATIC_ABERRATION = 'chromaticAberration',
  VIGNETTE = 'vignette',
  TONEMAPPING = 'tonemapping',
  FXAA = 'fxaa',
  SMAA = 'smaa'
}

/**
 * Configuración de Bloom
 */
export interface BloomConfig {
  enabled: boolean;
  threshold: number;
  intensity: number;
  radius: number;
  iterations: number;
}

/**
 * Configuración de SSAO
 */
export interface SSAOConfig {
  enabled: boolean;
  radius: number;
  bias: number;
  intensity: number;
  samples: number;
}

/**
 * Configuración de Depth of Field
 */
export interface DOFConfig {
  enabled: boolean;
  focusDistance: number;
  focusRange: number;
  bokehScale: number;
  maxBlur: number;
}

/**
 * Configuración de Motion Blur
 */
export interface MotionBlurConfig {
  enabled: boolean;
  samples: number;
  intensity: number;
}

/**
 * Configuración de Chromatic Aberration
 */
export interface ChromaticAberrationConfig {
  enabled: boolean;
  offset: Vector3;
  intensity: number;
}

/**
 * Configuración de Vignette
 */
export interface VignetteConfig {
  enabled: boolean;
  offset: number;
  darkness: number;
  roundness: number;
}

/**
 * Configuración de Tonemapping
 */
export interface TonemappingConfig {
  enabled: boolean;
  type: 'reinhard' | 'aces' | 'filmic' | 'uncharted2';
  exposure: number;
  gamma: number;
}

/**
 * Sistema de post-procesado enterprise
 */
export class PostProcessor extends EventEmitter {
  private static readonly logger = new Logger('PostProcessor');
  
  // Configuraciones de efectos
  public bloom: BloomConfig = {
    enabled: true,
    threshold: 0.8,
    intensity: 1.0,
    radius: 0.5,
    iterations: 4
  };
  
  public ssao: SSAOConfig = {
    enabled: true,
    radius: 0.5,
    bias: 0.025,
    intensity: 1.0,
    samples: 16
  };
  
  public dof: DOFConfig = {
    enabled: false,
    focusDistance: 10.0,
    focusRange: 5.0,
    bokehScale: 2.0,
    maxBlur: 1.0
  };
  
  public motionBlur: MotionBlurConfig = {
    enabled: false,
    samples: 8,
    intensity: 1.0
  };
  
  public chromaticAberration: ChromaticAberrationConfig = {
    enabled: false,
    offset: new Vector3(0.001, 0.001, 0.001),
    intensity: 1.0
  };
  
  public vignette: VignetteConfig = {
    enabled: false,
    offset: 1.0,
    darkness: 0.5,
    roundness: 0.5
  };
  
  public tonemapping: TonemappingConfig = {
    enabled: true,
    type: 'aces',
    exposure: 1.0,
    gamma: 2.2
  };
  
  // Buffers y texturas
  private _mainFramebuffer: WebGLFramebuffer | null = null;
  private _mainTexture: WebGLTexture | null = null;
  private _depthTexture: WebGLTexture | null = null;
  private _normalTexture: WebGLTexture | null = null;
  private _velocityTexture: WebGLTexture | null = null;
  
  // Buffers de efectos
  private _bloomFramebuffers: WebGLFramebuffer[] = [];
  private _bloomTextures: WebGLTexture[] = [];
  private _ssaoFramebuffer: WebGLFramebuffer | null = null;
  private _ssaoTexture: WebGLTexture | null = null;
  private _dofFramebuffer: WebGLFramebuffer | null = null;
  private _dofTexture: WebGLTexture | null = null;
  
  // Shaders
  private _bloomShader: WebGLProgram | null = null;
  private _ssaoShader: WebGLProgram | null = null;
  private _dofShader: WebGLProgram | null = null;
  private _motionBlurShader: WebGLProgram | null = null;
  private _chromaticAberrationShader: WebGLProgram | null = null;
  private _vignetteShader: WebGLProgram | null = null;
  private _tonemappingShader: WebGLProgram | null = null;
  private _fxaaShader: WebGLProgram | null = null;
  
  // Estados
  private _initialized: boolean = false;
  private _width: number = 0;
  private _height: number = 0;
  
  constructor() {
    super();
  }
  
  /**
   * Inicializa el sistema de post-procesado
   */
  public initialize(gl: WebGL2RenderingContext, width: number, height: number): boolean {
    try {
      this._width = width;
      this._height = height;
      
      // Crear framebuffer principal
      this.createMainFramebuffer(gl);
      
      // Crear shaders
      this.createShaders(gl);
      
      // Crear buffers de efectos
      if (this.bloom.enabled) this.createBloomBuffers(gl);
      if (this.ssao.enabled) this.createSSAOBuffers(gl);
      if (this.dof.enabled) this.createDOFBuffers(gl);
      
      this._initialized = true;
      PostProcessor.logger.info('Sistema de post-procesado inicializado');
      
      return true;
      
    } catch (error) {
      PostProcessor.logger.error('Error inicializando post-procesado:', error);
      return false;
    }
  }
  
  /**
   * Crea el framebuffer principal
   */
  private createMainFramebuffer(gl: WebGL2RenderingContext): void {
    // Crear textura principal
    this._mainTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._mainTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this._width, this._height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // Crear textura de profundidad
    this._depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, this._width, this._height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // Crear framebuffer
    this._mainFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._mainFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._mainTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthTexture, 0);
    
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer principal incompleto: ${status}`);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  /**
   * Crea shaders de post-procesado
   */
  private createShaders(gl: WebGL2RenderingContext): void {
    this._bloomShader = this.createShader(gl, this.getBloomVertexShader(), this.getBloomFragmentShader());
    this._ssaoShader = this.createShader(gl, this.getSSAOVertexShader(), this.getSSAOFragmentShader());
    this._dofShader = this.createShader(gl, this.getDOFVertexShader(), this.getDOFFragmentShader());
    this._motionBlurShader = this.createShader(gl, this.getMotionBlurVertexShader(), this.getMotionBlurFragmentShader());
    this._chromaticAberrationShader = this.createShader(gl, this.getChromaticAberrationVertexShader(), this.getChromaticAberrationFragmentShader());
    this._vignetteShader = this.createShader(gl, this.getVignetteVertexShader(), this.getVignetteFragmentShader());
    this._tonemappingShader = this.createShader(gl, this.getTonemappingVertexShader(), this.getTonemappingFragmentShader());
    this._fxaaShader = this.createShader(gl, this.getFXAAVertexShader(), this.getFXAAFragmentShader());
  }
  
  /**
   * Crea un shader compilado
   */
  private createShader(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
    try {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexSource);
      gl.compileShader(vertexShader);
      
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        PostProcessor.logger.error('Error compilando vertex shader:', error);
        return null;
      }
      
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(fragmentShader);
      
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        PostProcessor.logger.error('Error compilando fragment shader:', error);
        return null;
      }
      
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        PostProcessor.logger.error('Error linkeando shader:', error);
        return null;
      }
      
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      
      return program;
      
    } catch (error) {
      PostProcessor.logger.error('Error creando shader:', error);
      return null;
    }
  }
  
  /**
   * Crea buffers para Bloom
   */
  private createBloomBuffers(gl: WebGL2RenderingContext): void {
    this._bloomFramebuffers = [];
    this._bloomTextures = [];
    
    for (let i = 0; i < this.bloom.iterations; i++) {
      const scale = Math.pow(2, i);
      const width = Math.floor(this._width / scale);
      const height = Math.floor(this._height / scale);
      
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      
      this._bloomTextures.push(texture);
      this._bloomFramebuffers.push(framebuffer);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  /**
   * Crea buffers para SSAO
   */
  private createSSAOBuffers(gl: WebGL2RenderingContext): void {
    this._ssaoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._ssaoTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, this._width, this._height, 0, gl.RED, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    this._ssaoFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._ssaoFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._ssaoTexture, 0);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  /**
   * Crea buffers para Depth of Field
   */
  private createDOFBuffers(gl: WebGL2RenderingContext): void {
    this._dofTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._dofTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this._width, this._height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    this._dofFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._dofFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._dofTexture, 0);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  /**
   * Procesa la escena con efectos de post-procesado
   */
  public process(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._initialized) {
      return inputTexture;
    }
    
    let currentTexture = inputTexture;
    
    // Aplicar efectos en orden
    if (this.bloom.enabled) {
      currentTexture = this.applyBloom(gl, currentTexture);
    }
    
    if (this.ssao.enabled) {
      currentTexture = this.applySSAO(gl, currentTexture);
    }
    
    if (this.dof.enabled) {
      currentTexture = this.applyDOF(gl, currentTexture);
    }
    
    if (this.motionBlur.enabled) {
      currentTexture = this.applyMotionBlur(gl, currentTexture);
    }
    
    if (this.chromaticAberration.enabled) {
      currentTexture = this.applyChromaticAberration(gl, currentTexture);
    }
    
    if (this.vignette.enabled) {
      currentTexture = this.applyVignette(gl, currentTexture);
    }
    
    if (this.tonemapping.enabled) {
      currentTexture = this.applyTonemapping(gl, currentTexture);
    }
    
    return currentTexture;
  }
  
  /**
   * Aplica efecto Bloom
   */
  private applyBloom(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._bloomShader) return inputTexture;
    
    // Extraer luces brillantes
    gl.useProgram(this._bloomShader);
    gl.uniform1f(gl.getUniformLocation(this._bloomShader, 'u_threshold'), this.bloom.threshold);
    
    // Downsample y blur
    for (let i = 0; i < this.bloom.iterations; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._bloomFramebuffers[i]);
      gl.viewport(0, 0, this._bloomTextures[i].width, this._bloomTextures[i].height);
      
      // Renderizar quad con shader de bloom
      this.renderQuad(gl);
    }
    
    // Upsample y combinar
    for (let i = this.bloom.iterations - 1; i >= 0; i--) {
      // Combinar con la iteración anterior
    }
    
    return inputTexture; // Temporal
  }
  
  /**
   * Aplica efecto SSAO
   */
  private applySSAO(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._ssaoShader) return inputTexture;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._ssaoFramebuffer);
    gl.useProgram(this._ssaoShader);
    
    // Configurar uniforms
    gl.uniform1f(gl.getUniformLocation(this._ssaoShader, 'u_radius'), this.ssao.radius);
    gl.uniform1f(gl.getUniformLocation(this._ssaoShader, 'u_bias'), this.ssao.bias);
    gl.uniform1f(gl.getUniformLocation(this._ssaoShader, 'u_intensity'), this.ssao.intensity);
    gl.uniform1i(gl.getUniformLocation(this._ssaoShader, 'u_samples'), this.ssao.samples);
    
    // Bind texturas
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(gl.getUniformLocation(this._ssaoShader, 'u_colorTexture'), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
    gl.uniform1i(gl.getUniformLocation(this._ssaoShader, 'u_depthTexture'), 1);
    
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this._normalTexture);
    gl.uniform1i(gl.getUniformLocation(this._ssaoShader, 'u_normalTexture'), 2);
    
    this.renderQuad(gl);
    
    return this._ssaoTexture;
  }
  
  /**
   * Aplica efecto Depth of Field
   */
  private applyDOF(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._dofShader) return inputTexture;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._dofFramebuffer);
    gl.useProgram(this._dofShader);
    
    // Configurar uniforms
    gl.uniform1f(gl.getUniformLocation(this._dofShader, 'u_focusDistance'), this.dof.focusDistance);
    gl.uniform1f(gl.getUniformLocation(this._dofShader, 'u_focusRange'), this.dof.focusRange);
    gl.uniform1f(gl.getUniformLocation(this._dofShader, 'u_bokehScale'), this.dof.bokehScale);
    gl.uniform1f(gl.getUniformLocation(this._dofShader, 'u_maxBlur'), this.dof.maxBlur);
    
    // Bind texturas
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(gl.getUniformLocation(this._dofShader, 'u_colorTexture'), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
    gl.uniform1i(gl.getUniformLocation(this._dofShader, 'u_depthTexture'), 1);
    
    this.renderQuad(gl);
    
    return this._dofTexture;
  }
  
  /**
   * Aplica efecto Motion Blur
   */
  private applyMotionBlur(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._motionBlurShader) return inputTexture;
    
    gl.useProgram(this._motionBlurShader);
    
    // Configurar uniforms
    gl.uniform1i(gl.getUniformLocation(this._motionBlurShader, 'u_samples'), this.motionBlur.samples);
    gl.uniform1f(gl.getUniformLocation(this._motionBlurShader, 'u_intensity'), this.motionBlur.intensity);
    
    // Bind texturas
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(gl.getUniformLocation(this._motionBlurShader, 'u_colorTexture'), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._velocityTexture);
    gl.uniform1i(gl.getUniformLocation(this._motionBlurShader, 'u_velocityTexture'), 1);
    
    this.renderQuad(gl);
    
    return inputTexture; // Temporal
  }
  
  /**
   * Aplica efecto Chromatic Aberration
   */
  private applyChromaticAberration(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._chromaticAberrationShader) return inputTexture;
    
    gl.useProgram(this._chromaticAberrationShader);
    
    // Configurar uniforms
    gl.uniform3f(gl.getUniformLocation(this._chromaticAberrationShader, 'u_offset'), 
      this.chromaticAberration.offset.x, 
      this.chromaticAberration.offset.y, 
      this.chromaticAberration.offset.z);
    gl.uniform1f(gl.getUniformLocation(this._chromaticAberrationShader, 'u_intensity'), this.chromaticAberration.intensity);
    
    // Bind textura
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(gl.getUniformLocation(this._chromaticAberrationShader, 'u_colorTexture'), 0);
    
    this.renderQuad(gl);
    
    return inputTexture; // Temporal
  }
  
  /**
   * Aplica efecto Vignette
   */
  private applyVignette(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._vignetteShader) return inputTexture;
    
    gl.useProgram(this._vignetteShader);
    
    // Configurar uniforms
    gl.uniform1f(gl.getUniformLocation(this._vignetteShader, 'u_offset'), this.vignette.offset);
    gl.uniform1f(gl.getUniformLocation(this._vignetteShader, 'u_darkness'), this.vignette.darkness);
    gl.uniform1f(gl.getUniformLocation(this._vignetteShader, 'u_roundness'), this.vignette.roundness);
    
    // Bind textura
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(gl.getUniformLocation(this._vignetteShader, 'u_colorTexture'), 0);
    
    this.renderQuad(gl);
    
    return inputTexture; // Temporal
  }
  
  /**
   * Aplica efecto Tonemapping
   */
  private applyTonemapping(gl: WebGL2RenderingContext, inputTexture: WebGLTexture): WebGLTexture {
    if (!this._tonemappingShader) return inputTexture;
    
    gl.useProgram(this._tonemappingShader);
    
    // Configurar uniforms
    gl.uniform1i(gl.getUniformLocation(this._tonemappingShader, 'u_type'), this.getTonemappingType());
    gl.uniform1f(gl.getUniformLocation(this._tonemappingShader, 'u_exposure'), this.tonemapping.exposure);
    gl.uniform1f(gl.getUniformLocation(this._tonemappingShader, 'u_gamma'), this.tonemapping.gamma);
    
    // Bind textura
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(gl.getUniformLocation(this._tonemappingShader, 'u_colorTexture'), 0);
    
    this.renderQuad(gl);
    
    return inputTexture; // Temporal
  }
  
  /**
   * Renderiza un quad para efectos de post-procesado
   */
  private renderQuad(gl: WebGL2RenderingContext): void {
    // Implementar renderizado de quad
    // Por ahora es un placeholder
  }
  
  /**
   * Obtiene el valor numérico del tipo de tonemapping
   */
  private getTonemappingType(): number {
    switch (this.tonemapping.type) {
      case 'reinhard': return 0;
      case 'aces': return 1;
      case 'filmic': return 2;
      case 'uncharted2': return 3;
      default: return 1;
    }
  }
  
  // Shaders (implementaciones básicas)
  private getBloomVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getBloomFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform float u_threshold;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec4 color = texture(u_colorTexture, v_uv);
        float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        
        if (brightness > u_threshold) {
            fragColor = color;
        } else {
            fragColor = vec4(0.0);
        }
    }`;
  }
  
  private getSSAOVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getSSAOFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform sampler2D u_depthTexture;
    uniform sampler2D u_normalTexture;
    uniform float u_radius;
    uniform float u_bias;
    uniform float u_intensity;
    uniform int u_samples;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        float depth = texture(u_depthTexture, v_uv).r;
        vec3 normal = texture(u_normalTexture, v_uv).rgb * 2.0 - 1.0;
        
        float occlusion = 0.0;
        
        for (int i = 0; i < u_samples; i++) {
            // Implementar SSAO
            occlusion += 1.0;
        }
        
        occlusion = 1.0 - (occlusion / float(u_samples));
        fragColor = vec4(vec3(occlusion), 1.0);
    }`;
  }
  
  private getDOFVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getDOFFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform sampler2D u_depthTexture;
    uniform float u_focusDistance;
    uniform float u_focusRange;
    uniform float u_bokehScale;
    uniform float u_maxBlur;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec4 color = texture(u_colorTexture, v_uv);
        float depth = texture(u_depthTexture, v_uv).r;
        
        float blur = abs(depth - u_focusDistance) / u_focusRange;
        blur = min(blur, u_maxBlur);
        
        fragColor = color;
    }`;
  }
  
  private getMotionBlurVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getMotionBlurFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform sampler2D u_velocityTexture;
    uniform int u_samples;
    uniform float u_intensity;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec2 velocity = texture(u_velocityTexture, v_uv).rg;
        vec4 color = texture(u_colorTexture, v_uv);
        
        fragColor = color;
    }`;
  }
  
  private getChromaticAberrationVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getChromaticAberrationFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform vec3 u_offset;
    uniform float u_intensity;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec2 center = vec2(0.5, 0.5);
        vec2 direction = normalize(v_uv - center);
        
        float r = texture(u_colorTexture, v_uv + direction * u_offset.x * u_intensity).r;
        float g = texture(u_colorTexture, v_uv + direction * u_offset.y * u_intensity).g;
        float b = texture(u_colorTexture, v_uv + direction * u_offset.z * u_intensity).b;
        
        fragColor = vec4(r, g, b, 1.0);
    }`;
  }
  
  private getVignetteVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getVignetteFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform float u_offset;
    uniform float u_darkness;
    uniform float u_roundness;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec4 color = texture(u_colorTexture, v_uv);
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_uv, center);
        
        float vignette = 1.0 - smoothstep(u_offset, u_offset + u_roundness, dist);
        vignette = mix(1.0, u_darkness, 1.0 - vignette);
        
        fragColor = color * vignette;
    }`;
  }
  
  private getTonemappingVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getTonemappingFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    uniform int u_type;
    uniform float u_exposure;
    uniform float u_gamma;
    
    layout(location = 0) out vec4 fragColor;
    
    vec3 reinhardTonemap(vec3 color) {
        return color / (1.0 + color);
    }
    
    vec3 acesTonemap(vec3 color) {
        const float a = 2.51;
        const float b = 0.03;
        const float c = 2.43;
        const float d = 0.59;
        const float e = 0.14;
        return (color * (a * color + b)) / (color * (c * color + d) + e);
    }
    
    void main() {
        vec3 color = texture(u_colorTexture, v_uv).rgb;
        color *= u_exposure;
        
        if (u_type == 0) {
            color = reinhardTonemap(color);
        } else if (u_type == 1) {
            color = acesTonemap(color);
        }
        
        color = pow(color, vec3(1.0 / u_gamma));
        
        fragColor = vec4(color, 1.0);
    }`;
  }
  
  private getFXAAVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    
    out vec2 v_uv;
    
    void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 1.0);
    }`;
  }
  
  private getFXAAFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    
    uniform sampler2D u_colorTexture;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec4 color = texture(u_colorTexture, v_uv);
        fragColor = color;
    }`;
  }
  
  /**
   * Limpia recursos del sistema
   */
  public dispose(gl: WebGL2RenderingContext): void {
    // Limpiar framebuffers
    if (this._mainFramebuffer) gl.deleteFramebuffer(this._mainFramebuffer);
    if (this._ssaoFramebuffer) gl.deleteFramebuffer(this._ssaoFramebuffer);
    if (this._dofFramebuffer) gl.deleteFramebuffer(this._dofFramebuffer);
    
    // Limpiar texturas
    if (this._mainTexture) gl.deleteTexture(this._mainTexture);
    if (this._depthTexture) gl.deleteTexture(this._depthTexture);
    if (this._normalTexture) gl.deleteTexture(this._normalTexture);
    if (this._velocityTexture) gl.deleteTexture(this._velocityTexture);
    if (this._ssaoTexture) gl.deleteTexture(this._ssaoTexture);
    if (this._dofTexture) gl.deleteTexture(this._dofTexture);
    
    // Limpiar buffers de bloom
    for (const framebuffer of this._bloomFramebuffers) {
      gl.deleteFramebuffer(framebuffer);
    }
    for (const texture of this._bloomTextures) {
      gl.deleteTexture(texture);
    }
    
    // Limpiar shaders
    if (this._bloomShader) gl.deleteProgram(this._bloomShader);
    if (this._ssaoShader) gl.deleteProgram(this._ssaoShader);
    if (this._dofShader) gl.deleteProgram(this._dofShader);
    if (this._motionBlurShader) gl.deleteProgram(this._motionBlurShader);
    if (this._chromaticAberrationShader) gl.deleteProgram(this._chromaticAberrationShader);
    if (this._vignetteShader) gl.deleteProgram(this._vignetteShader);
    if (this._tonemappingShader) gl.deleteProgram(this._tonemappingShader);
    if (this._fxaaShader) gl.deleteProgram(this._fxaaShader);
    
    PostProcessor.logger.info('Sistema de post-procesado eliminado');
  }
} 