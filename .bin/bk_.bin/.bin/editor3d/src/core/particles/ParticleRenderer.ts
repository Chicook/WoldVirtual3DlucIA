import { Particle, ParticleType } from './Particle';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3 } from '../scene/math/Vector3';
import { Matrix4 } from '../scene/math/Matrix4';

/**
 * Tipos de renderizado de partículas
 */
export enum RenderMode {
  BILLBOARD = 'billboard',
  STRETCHED_BILLBOARD = 'stretched_billboard',
  HORIZONTAL_BILLBOARD = 'horizontal_billboard',
  VERTICAL_BILLBOARD = 'vertical_billboard',
  GEOMETRY = 'geometry',
  TRAIL = 'trail',
  RIBBON = 'ribbon'
}

/**
 * Configuración de renderizado
 */
export interface RenderConfig {
  mode: RenderMode;
  enableBlending: boolean;
  enableDepthWrite: boolean;
  enableDepthTest: boolean;
  blendSrc: number;
  blendDst: number;
  cullFace: 'front' | 'back' | 'none';
  textureAtlas: boolean;
  atlasColumns: number;
  atlasRows: number;
  enableInstancing: boolean;
  maxInstances: number;
}

/**
 * Renderizador de partículas enterprise
 */
export class ParticleRenderer extends EventEmitter {
  private static readonly logger = new Logger('ParticleRenderer');
  
  // Configuración
  public config: RenderConfig = {
    mode: RenderMode.BILLBOARD,
    enableBlending: true,
    enableDepthWrite: false,
    enableDepthTest: true,
    blendSrc: 0x0302, // SRC_ALPHA
    blendDst: 0x0303, // ONE_MINUS_SRC_ALPHA
    cullFace: 'back',
    textureAtlas: false,
    atlasColumns: 1,
    atlasRows: 1,
    enableInstancing: true,
    maxInstances: 1000
  };
  
  // WebGL context y recursos
  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  
  // Shaders
  private billboardShader: WebGLProgram | null = null;
  private geometryShader: WebGLProgram | null = null;
  private trailShader: WebGLProgram | null = null;
  
  // Buffers
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private instanceBuffer: WebGLBuffer | null = null;
  private particleBuffer: WebGLBuffer | null = null;
  
  // Texturas
  private particleTexture: WebGLTexture | null = null;
  private noiseTexture: WebGLTexture | null = null;
  
  // Estados
  private _initialized: boolean = false;
  private _particleCount: number = 0;
  
  constructor() {
    super();
  }
  
  /**
   * Inicializa el renderizador
   */
  public initialize(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): boolean {
    try {
      this.gl = gl;
      this.canvas = canvas;
      
      // Crear shaders
      this.createShaders();
      
      // Crear buffers
      this.createBuffers();
      
      // Crear texturas
      this.createTextures();
      
      this._initialized = true;
      ParticleRenderer.logger.info('Renderizador de partículas inicializado');
      
      return true;
      
    } catch (error) {
      ParticleRenderer.logger.error('Error inicializando renderizador:', error);
      return false;
    }
  }
  
  /**
   * Crea los shaders de renderizado
   */
  private createShaders(): void {
    if (!this.gl) return;
    
    this.billboardShader = this.createShader(
      this.getBillboardVertexShader(),
      this.getBillboardFragmentShader()
    );
    
    this.geometryShader = this.createShader(
      this.getGeometryVertexShader(),
      this.getGeometryFragmentShader()
    );
    
    this.trailShader = this.createShader(
      this.getTrailVertexShader(),
      this.getTrailFragmentShader()
    );
  }
  
  /**
   * Crea un shader compilado
   */
  private createShader(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null;
    
    try {
      const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vertexShader, vertexSource);
      this.gl.compileShader(vertexShader);
      
      if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
        const error = this.gl.getShaderInfoLog(vertexShader);
        ParticleRenderer.logger.error('Error compilando vertex shader:', error);
        return null;
      }
      
      const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fragmentShader, fragmentSource);
      this.gl.compileShader(fragmentShader);
      
      if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
        const error = this.gl.getShaderInfoLog(fragmentShader);
        ParticleRenderer.logger.error('Error compilando fragment shader:', error);
        return null;
      }
      
      const program = this.gl.createProgram();
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);
      
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        const error = this.gl.getProgramInfoLog(program);
        ParticleRenderer.logger.error('Error linkeando shader:', error);
        return null;
      }
      
      this.gl.deleteShader(vertexShader);
      this.gl.deleteShader(fragmentShader);
      
      return program;
      
    } catch (error) {
      ParticleRenderer.logger.error('Error creando shader:', error);
      return null;
    }
  }
  
  /**
   * Crea los buffers de renderizado
   */
  private createBuffers(): void {
    if (!this.gl) return;
    
    // Buffer de vértices para billboard
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    
    const vertices = new Float32Array([
      -0.5, -0.5, 0.0, 0.0, 0.0,
       0.5, -0.5, 0.0, 1.0, 0.0,
       0.5,  0.5, 0.0, 1.0, 1.0,
      -0.5,  0.5, 0.0, 0.0, 1.0
    ]);
    
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    // Buffer de índices
    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    
    // Buffer de instancias
    this.instanceBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, 0, this.gl.DYNAMIC_DRAW);
    
    // Buffer de partículas
    this.particleBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, 0, this.gl.DYNAMIC_DRAW);
  }
  
  /**
   * Crea las texturas de renderizado
   */
  private createTextures(): void {
    if (!this.gl) return;
    
    // Textura de partículas (placeholder)
    this.particleTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleTexture);
    
    // Crear textura de 1x1 píxel blanco
    const pixelData = new Uint8Array([255, 255, 255, 255]);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixelData);
    
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    
    // Textura de ruido (placeholder)
    this.noiseTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTexture);
    
    // Crear textura de ruido 64x64
    const noiseData = new Uint8Array(64 * 64 * 4);
    for (let i = 0; i < noiseData.length; i += 4) {
      const value = Math.random() * 255;
      noiseData[i] = value;
      noiseData[i + 1] = value;
      noiseData[i + 2] = value;
      noiseData[i + 3] = 255;
    }
    
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 64, 64, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, noiseData);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
  }
  
  /**
   * Renderiza las partículas
   */
  public render(particles: Particle[], camera: any, viewMatrix: Matrix4, projectionMatrix: Matrix4): void {
    if (!this.gl || !this._initialized || particles.length === 0) {
      return;
    }
    
    const startTime = performance.now();
    
    // Configurar estado de renderizado
    this.setupRenderState();
    
    // Preparar datos de partículas
    const particleData = this.prepareParticleData(particles);
    
    // Actualizar buffer de partículas
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, particleData, this.gl.DYNAMIC_DRAW);
    
    // Renderizar según el modo
    switch (this.config.mode) {
      case RenderMode.BILLBOARD:
      case RenderMode.STRETCHED_BILLBOARD:
      case RenderMode.HORIZONTAL_BILLBOARD:
      case RenderMode.VERTICAL_BILLBOARD:
        this.renderBillboards(particles, viewMatrix, projectionMatrix);
        break;
        
      case RenderMode.GEOMETRY:
        this.renderGeometry(particles, viewMatrix, projectionMatrix);
        break;
        
      case RenderMode.TRAIL:
        this.renderTrails(particles, viewMatrix, projectionMatrix);
        break;
        
      case RenderMode.RIBBON:
        this.renderRibbons(particles, viewMatrix, projectionMatrix);
        break;
    }
    
    // Restaurar estado
    this.restoreRenderState();
    
    const endTime = performance.now();
    this.emit('rendered', { 
      renderer: this, 
      particleCount: particles.length, 
      renderTime: endTime - startTime 
    });
  }
  
  /**
   * Configura el estado de renderizado
   */
  private setupRenderState(): void {
    if (!this.gl) return;
    
    // Configurar blending
    if (this.config.enableBlending) {
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.config.blendSrc, this.config.blendDst);
    } else {
      this.gl.disable(this.gl.BLEND);
    }
    
    // Configurar depth testing
    if (this.config.enableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
    } else {
      this.gl.disable(this.gl.DEPTH_TEST);
    }
    
    // Configurar depth writing
    this.gl.depthMask(this.config.enableDepthWrite);
    
    // Configurar culling
    switch (this.config.cullFace) {
      case 'front':
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.FRONT);
        break;
      case 'back':
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        break;
      case 'none':
        this.gl.disable(this.gl.CULL_FACE);
        break;
    }
  }
  
  /**
   * Restaura el estado de renderizado
   */
  private restoreRenderState(): void {
    if (!this.gl) return;
    
    this.gl.disable(this.gl.BLEND);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.depthMask(true);
  }
  
  /**
   * Prepara los datos de partículas para el GPU
   */
  private prepareParticleData(particles: Particle[]): Float32Array {
    const data = new Float32Array(particles.length * 30); // 30 floats por partícula
    
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const gpuData = particle.getGPUData();
      data.set(gpuData, i * 30);
    }
    
    return data;
  }
  
  /**
   * Renderiza partículas como billboards
   */
  private renderBillboards(particles: Particle[], viewMatrix: Matrix4, projectionMatrix: Matrix4): void {
    if (!this.gl || !this.billboardShader) return;
    
    this.gl.useProgram(this.billboardShader);
    
    // Configurar matrices
    const viewProjectionMatrix = projectionMatrix.clone().multiply(viewMatrix);
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.billboardShader, 'u_viewProjectionMatrix'),
      false,
      viewProjectionMatrix.elements
    );
    
    // Configurar texturas
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleTexture);
    this.gl.uniform1i(this.gl.getUniformLocation(this.billboardShader, 'u_particleTexture'), 0);
    
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTexture);
    this.gl.uniform1i(this.gl.getUniformLocation(this.billboardShader, 'u_noiseTexture'), 1);
    
    // Configurar atributos
    this.setupBillboardAttributes();
    
    // Renderizar
    this.gl.drawElementsInstanced(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0, particles.length);
  }
  
  /**
   * Configura los atributos para billboards
   */
  private setupBillboardAttributes(): void {
    if (!this.gl) return;
    
    // Vértices
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 20, 0);
    
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 20, 12);
    
    // Datos de partículas
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleBuffer);
    
    // Posición
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 120, 0);
    this.gl.vertexAttribDivisor(2, 1);
    
    // Rotación
    this.gl.enableVertexAttribArray(3);
    this.gl.vertexAttribPointer(3, 3, this.gl.FLOAT, false, 120, 12);
    this.gl.vertexAttribDivisor(3, 1);
    
    // Escala
    this.gl.enableVertexAttribArray(4);
    this.gl.vertexAttribPointer(4, 3, this.gl.FLOAT, false, 120, 24);
    this.gl.vertexAttribDivisor(4, 1);
    
    // Color
    this.gl.enableVertexAttribArray(5);
    this.gl.vertexAttribPointer(5, 4, this.gl.FLOAT, false, 120, 36);
    this.gl.vertexAttribDivisor(5, 1);
    
    // Propiedades de renderizado
    this.gl.enableVertexAttribArray(6);
    this.gl.vertexAttribPointer(6, 4, this.gl.FLOAT, false, 120, 52);
    this.gl.vertexAttribDivisor(6, 1);
    
    // Propiedades de vida
    this.gl.enableVertexAttribArray(7);
    this.gl.vertexAttribPointer(7, 3, this.gl.FLOAT, false, 120, 68);
    this.gl.vertexAttribDivisor(7, 1);
    
    // Propiedades físicas
    this.gl.enableVertexAttribArray(8);
    this.gl.vertexAttribPointer(8, 4, this.gl.FLOAT, false, 120, 80);
    this.gl.vertexAttribDivisor(8, 1);
  }
  
  /**
   * Renderiza partículas como geometría
   */
  private renderGeometry(particles: Particle[], viewMatrix: Matrix4, projectionMatrix: Matrix4): void {
    if (!this.gl || !this.geometryShader) return;
    
    // Implementación básica - similar a billboards pero con geometría personalizada
    this.renderBillboards(particles, viewMatrix, projectionMatrix);
  }
  
  /**
   * Renderiza partículas como trails
   */
  private renderTrails(particles: Particle[], viewMatrix: Matrix4, projectionMatrix: Matrix4): void {
    if (!this.gl || !this.trailShader) return;
    
    // Implementación básica - similar a billboards pero con trails
    this.renderBillboards(particles, viewMatrix, projectionMatrix);
  }
  
  /**
   * Renderiza partículas como ribbons
   */
  private renderRibbons(particles: Particle[], viewMatrix: Matrix4, projectionMatrix: Matrix4): void {
    if (!this.gl) return;
    
    // Implementación básica - similar a billboards pero con ribbons
    this.renderBillboards(particles, viewMatrix, projectionMatrix);
  }
  
  // Shaders
  private getBillboardVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_particlePosition;
    layout(location = 3) in vec3 a_particleRotation;
    layout(location = 4) in vec3 a_particleScale;
    layout(location = 5) in vec4 a_particleColor;
    layout(location = 6) in vec4 a_renderProps;
    layout(location = 7) in vec3 a_lifeProps;
    layout(location = 8) in vec4 a_physicsProps;
    
    uniform mat4 u_viewProjectionMatrix;
    uniform sampler2D u_particleTexture;
    uniform sampler2D u_noiseTexture;
    
    out vec2 v_uv;
    out vec4 v_color;
    out float v_alpha;
    out float v_lifeProgress;
    
    void main() {
        v_uv = a_uv;
        v_color = a_particleColor;
        v_alpha = a_renderProps.w;
        v_lifeProgress = a_lifeProps.z;
        
        // Calcular posición del billboard
        vec3 position = a_particlePosition;
        vec3 scale = a_particleScale * a_renderProps.x; // size
        
        // Aplicar rotación del billboard
        float rotation = a_renderProps.y;
        mat2 rotationMatrix = mat2(
            cos(rotation), -sin(rotation),
            sin(rotation), cos(rotation)
        );
        
        vec2 rotatedPosition = rotationMatrix * a_position.xy;
        position += vec3(rotatedPosition * scale.xy, 0.0);
        
        gl_Position = u_viewProjectionMatrix * vec4(position, 1.0);
    }`;
  }
  
  private getBillboardFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    in vec4 v_color;
    in float v_alpha;
    in float v_lifeProgress;
    
    uniform sampler2D u_particleTexture;
    uniform sampler2D u_noiseTexture;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        vec4 texColor = texture(u_particleTexture, v_uv);
        vec4 noiseColor = texture(u_noiseTexture, v_uv * 4.0);
        
        vec4 finalColor = v_color * texColor;
        finalColor.rgb += noiseColor.rgb * 0.1;
        
        // Aplicar alpha basado en la vida
        float alpha = finalColor.a * v_alpha;
        
        // Fade out al final de la vida
        if (v_lifeProgress > 0.8) {
            alpha *= (1.0 - v_lifeProgress) / 0.2;
        }
        
        fragColor = vec4(finalColor.rgb, alpha);
        
        // Descartar píxeles transparentes
        if (alpha < 0.01) {
            discard;
        }
    }`;
  }
  
  private getGeometryVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_particlePosition;
    layout(location = 3) in vec3 a_particleRotation;
    layout(location = 4) in vec3 a_particleScale;
    layout(location = 5) in vec4 a_particleColor;
    layout(location = 6) in vec4 a_renderProps;
    layout(location = 7) in vec3 a_lifeProps;
    layout(location = 8) in vec4 a_physicsProps;
    
    uniform mat4 u_viewProjectionMatrix;
    
    out vec2 v_uv;
    out vec4 v_color;
    out float v_alpha;
    
    void main() {
        v_uv = a_uv;
        v_color = a_particleColor;
        v_alpha = a_renderProps.w;
        
        // Transformar geometría
        vec3 position = a_position * a_particleScale + a_particlePosition;
        
        gl_Position = u_viewProjectionMatrix * vec4(position, 1.0);
    }`;
  }
  
  private getGeometryFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    in vec4 v_color;
    in float v_alpha;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        fragColor = vec4(v_color.rgb, v_color.a * v_alpha);
        
        if (fragColor.a < 0.01) {
            discard;
        }
    }`;
  }
  
  private getTrailVertexShader(): string {
    return `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_particlePosition;
    layout(location = 3) in vec3 a_particleRotation;
    layout(location = 4) in vec3 a_particleScale;
    layout(location = 5) in vec4 a_particleColor;
    layout(location = 6) in vec4 a_renderProps;
    layout(location = 7) in vec3 a_lifeProps;
    layout(location = 8) in vec4 a_physicsProps;
    
    uniform mat4 u_viewProjectionMatrix;
    
    out vec2 v_uv;
    out vec4 v_color;
    out float v_alpha;
    
    void main() {
        v_uv = a_uv;
        v_color = a_particleColor;
        v_alpha = a_renderProps.w;
        
        // Renderizar como trail
        vec3 position = a_particlePosition;
        
        gl_Position = u_viewProjectionMatrix * vec4(position, 1.0);
    }`;
  }
  
  private getTrailFragmentShader(): string {
    return `#version 300 es
    precision highp float;
    
    in vec2 v_uv;
    in vec4 v_color;
    in float v_alpha;
    
    layout(location = 0) out vec4 fragColor;
    
    void main() {
        fragColor = vec4(v_color.rgb, v_color.a * v_alpha);
        
        if (fragColor.a < 0.01) {
            discard;
        }
    }`;
  }
  
  /**
   * Limpia recursos del renderizador
   */
  public dispose(): void {
    if (!this.gl) return;
    
    // Limpiar shaders
    if (this.billboardShader) this.gl.deleteProgram(this.billboardShader);
    if (this.geometryShader) this.gl.deleteProgram(this.geometryShader);
    if (this.trailShader) this.gl.deleteProgram(this.trailShader);
    
    // Limpiar buffers
    if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
    if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);
    if (this.instanceBuffer) this.gl.deleteBuffer(this.instanceBuffer);
    if (this.particleBuffer) this.gl.deleteBuffer(this.particleBuffer);
    
    // Limpiar texturas
    if (this.particleTexture) this.gl.deleteTexture(this.particleTexture);
    if (this.noiseTexture) this.gl.deleteTexture(this.noiseTexture);
    
    this._initialized = false;
    ParticleRenderer.logger.info('Renderizador de partículas eliminado');
  }
} 