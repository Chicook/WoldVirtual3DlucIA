/**
 * Geometry - WebGL Geometry Management
 * 
 * High-performance geometry management with WebGL buffers,
 * vertex attributes, and optimization features.
 */

import { Vector3, Vector2 } from '../scene/math';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

// Geometry events
export interface GeometryEvents {
  'buffer:created': { geometry: Geometry; bufferType: string };
  'attribute:added': { geometry: Geometry; attribute: string };
  'disposed': { geometry: Geometry };
}

// Vertex attribute types
export type AttributeType = 'position' | 'normal' | 'uv' | 'tangent' | 'color' | 'custom';

// Draw modes
export type DrawMode = 'points' | 'lines' | 'line-strip' | 'line-loop' | 'triangles' | 'triangle-strip' | 'triangle-fan';

/**
 * Vertex attribute definition
 */
export interface VertexAttribute {
  name: string;
  type: AttributeType;
  size: number; // Number of components (1, 2, 3, 4)
  normalized: boolean;
  offset: number;
  stride: number;
}

/**
 * WebGL Geometry with advanced features
 */
export class Geometry {
  // Basic properties
  public readonly id: string;
  public name: string;
  public readonly eventEmitter: EventEmitter<GeometryEvents>;
  public readonly logger: Logger;

  // WebGL objects
  public vao: WebGLVertexArrayObject | null = null;
  private vbo: WebGLBuffer | null = null;
  private ibo: WebGLBuffer | null = null;
  private gl: WebGL2RenderingContext | null = null;

  // Geometry data
  public vertices: Float32Array | null = null;
  public indices: Uint32Array | null = null;
  public normals: Float32Array | null = null;
  public uvs: Float32Array | null = null;
  public tangents: Float32Array | null = null;
  public colors: Float32Array | null = null;

  // Geometry properties
  public vertexCount: number = 0;
  public indexCount: number = 0;
  public triangleCount: number = 0;
  public drawMode: number = 4; // GL_TRIANGLES

  // Attributes
  public attributes: Map<string, VertexAttribute> = new Map();
  public vertexSize: number = 0;
  public vertexStride: number = 0;

  // Bounding volumes
  public boundingBox: any = null;
  public boundingSphere: any = null;

  // Performance
  public static: boolean = false;
  public uploaded: boolean = false;
  public dirty: boolean = true;

  // Metadata
  public tags: Set<string> = new Set();
  public userData: Map<string, any> = new Map();

  constructor(
    id: string,
    name: string = '',
    eventEmitter?: EventEmitter<GeometryEvents>,
    logger?: Logger
  ) {
    this.id = id;
    this.name = name || `Geometry_${id}`;
    this.eventEmitter = eventEmitter || new EventEmitter<GeometryEvents>();
    this.logger = logger || new Logger('Geometry');
  }

  // ===== DATA SETUP =====

  /**
   * Sets vertex positions
   */
  setVertices(vertices: number[] | Float32Array): this {
    this.vertices = new Float32Array(vertices);
    this.vertexCount = this.vertices.length / 3;
    this.dirty = true;
    this.updateBoundingVolumes();
    return this;
  }

  /**
   * Sets indices
   */
  setIndices(indices: number[] | Uint32Array): this {
    this.indices = new Uint32Array(indices);
    this.indexCount = this.indices.length;
    this.triangleCount = this.indexCount / 3;
    this.dirty = true;
    return this;
  }

  /**
   * Sets normals
   */
  setNormals(normals: number[] | Float32Array): this {
    this.normals = new Float32Array(normals);
    this.dirty = true;
    return this;
  }

  /**
   * Sets UV coordinates
   */
  setUVs(uvs: number[] | Float32Array): this {
    this.uvs = new Float32Array(uvs);
    this.dirty = true;
    return this;
  }

  /**
   * Sets tangents
   */
  setTangents(tangents: number[] | Float32Array): this {
    this.tangents = new Float32Array(tangents);
    this.dirty = true;
    return this;
  }

  /**
   * Sets colors
   */
  setColors(colors: number[] | Float32Array): this {
    this.colors = new Float32Array(colors);
    this.dirty = true;
    return this;
  }

  /**
   * Sets draw mode
   */
  setDrawMode(mode: DrawMode): this {
    const gl = this.gl;
    if (!gl) return this;

    switch (mode) {
      case 'points': this.drawMode = gl.POINTS; break;
      case 'lines': this.drawMode = gl.LINES; break;
      case 'line-strip': this.drawMode = gl.LINE_STRIP; break;
      case 'line-loop': this.drawMode = gl.LINE_LOOP; break;
      case 'triangles': this.drawMode = gl.TRIANGLES; break;
      case 'triangle-strip': this.drawMode = gl.TRIANGLE_STRIP; break;
      case 'triangle-fan': this.drawMode = gl.TRIANGLE_FAN; break;
    }

    return this;
  }

  // ===== WEBGL UPLOAD =====

  /**
   * Uploads geometry data to GPU
   */
  upload(gl: WebGL2RenderingContext): this {
    if (!this.dirty && this.uploaded) return this;

    this.gl = gl;
    this.createBuffers();
    this.uploadBuffers();
    this.setupAttributes();
    this.uploaded = true;
    this.dirty = false;

    this.logger.debug(`Geometry '${this.name}' uploaded to GPU`);
    return this;
  }

  /**
   * Creates WebGL buffers
   */
  private createBuffers(): void {
    if (!this.gl) return;

    // Create vertex array object
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    // Create vertex buffer
    this.vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

    // Create index buffer if needed
    if (this.indices) {
      this.ibo = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    }

    this.gl.bindVertexArray(null);
  }

  /**
   * Uploads buffer data to GPU
   */
  private uploadBuffers(): void {
    if (!this.gl) return;

    this.gl.bindVertexArray(this.vao);

    // Upload vertex data
    if (this.vertices) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.static ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW);
    }

    // Upload index data
    if (this.indices && this.ibo) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.static ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW);
    }

    this.gl.bindVertexArray(null);
  }

  /**
   * Sets up vertex attributes
   */
  private setupAttributes(): void {
    if (!this.gl || !this.vao) return;

    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

    let offset = 0;
    const stride = this.calculateStride();

    // Position attribute
    if (this.vertices) {
      this.setupAttribute('position', 3, offset, stride);
      offset += 3 * 4; // 3 floats * 4 bytes
    }

    // Normal attribute
    if (this.normals) {
      this.setupAttribute('normal', 3, offset, stride);
      offset += 3 * 4;
    }

    // UV attribute
    if (this.uvs) {
      this.setupAttribute('uv', 2, offset, stride);
      offset += 2 * 4;
    }

    // Tangent attribute
    if (this.tangents) {
      this.setupAttribute('tangent', 3, offset, stride);
      offset += 3 * 4;
    }

    // Color attribute
    if (this.colors) {
      this.setupAttribute('color', 3, offset, stride);
      offset += 3 * 4;
    }

    this.gl.bindVertexArray(null);
  }

  /**
   * Sets up a single vertex attribute
   */
  private setupAttribute(name: string, size: number, offset: number, stride: number): void {
    if (!this.gl) return;

    const location = this.getAttributeLocation(name);
    if (location === -1) return;

    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, stride, offset);

    this.attributes.set(name, {
      name,
      type: name as AttributeType,
      size,
      normalized: false,
      offset,
      stride
    });

    this.eventEmitter.emit('attribute:added', { geometry: this, attribute: name });
  }

  /**
   * Gets attribute location from shader
   */
  private getAttributeLocation(name: string): number {
    // This would typically get the location from the current shader
    // For now, we'll use a simple mapping
    const locationMap: { [key: string]: number } = {
      'position': 0,
      'normal': 1,
      'uv': 2,
      'tangent': 3,
      'color': 4
    };

    return locationMap[name] || -1;
  }

  /**
   * Calculates vertex stride
   */
  private calculateStride(): number {
    let stride = 0;

    if (this.vertices) stride += 3 * 4; // position
    if (this.normals) stride += 3 * 4;  // normal
    if (this.uvs) stride += 2 * 4;      // uv
    if (this.tangents) stride += 3 * 4; // tangent
    if (this.colors) stride += 3 * 4;   // color

    return stride;
  }

  // ===== BOUNDING VOLUMES =====

  /**
   * Updates bounding volumes
   */
  private updateBoundingVolumes(): void {
    if (!this.vertices) return;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < this.vertices.length; i += 3) {
      const x = this.vertices[i];
      const y = this.vertices[i + 1];
      const z = this.vertices[i + 2];

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }

    // Create bounding box and sphere
    // Note: This would require the BoundingBox and BoundingSphere classes
    // For now, we'll just store the min/max values
    this.boundingBox = { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
  }

  // ===== UTILITY METHODS =====

  /**
   * Checks if geometry is uploaded
   */
  isUploaded(): boolean {
    return this.uploaded && !this.dirty;
  }

  /**
   * Marks geometry as dirty
   */
  markDirty(): this {
    this.dirty = true;
    return this;
  }

  /**
   * Sets static flag
   */
  setStatic(isStatic: boolean): this {
    this.static = isStatic;
    return this;
  }

  /**
   * Adds a tag
   */
  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  /**
   * Removes a tag
   */
  removeTag(tag: string): boolean {
    return this.tags.delete(tag);
  }

  /**
   * Checks if geometry has a tag
   */
  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Sets user data
   */
  setUserData(key: string, value: any): this {
    this.userData.set(key, value);
    return this;
  }

  /**
   * Gets user data
   */
  getUserData(key: string): any {
    return this.userData.get(key);
  }

  // ===== SERIALIZATION =====

  /**
   * Serializes geometry to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      vertexCount: this.vertexCount,
      indexCount: this.indexCount,
      triangleCount: this.triangleCount,
      drawMode: this.drawMode,
      
      // Data (only include if not too large)
      vertices: this.vertices ? Array.from(this.vertices) : null,
      indices: this.indices ? Array.from(this.indices) : null,
      normals: this.normals ? Array.from(this.normals) : null,
      uvs: this.uvs ? Array.from(this.uvs) : null,
      tangents: this.tangents ? Array.from(this.tangents) : null,
      colors: this.colors ? Array.from(this.colors) : null,
      
      // Properties
      static: this.static,
      uploaded: this.uploaded,
      
      // Metadata
      tags: Array.from(this.tags),
      userData: Object.fromEntries(this.userData)
    };
  }

  /**
   * Deserializes geometry from JSON
   */
  fromJSON(json: any): this {
    this.name = json.name || this.name;
    this.vertexCount = json.vertexCount || 0;
    this.indexCount = json.indexCount || 0;
    this.triangleCount = json.triangleCount || 0;
    this.drawMode = json.drawMode || 4;
    
    // Restore data
    if (json.vertices) this.vertices = new Float32Array(json.vertices);
    if (json.indices) this.indices = new Uint32Array(json.indices);
    if (json.normals) this.normals = new Float32Array(json.normals);
    if (json.uvs) this.uvs = new Float32Array(json.uvs);
    if (json.tangents) this.tangents = new Float32Array(json.tangents);
    if (json.colors) this.colors = new Float32Array(json.colors);
    
    // Properties
    this.static = json.static || false;
    this.uploaded = json.uploaded || false;
    this.dirty = true;
    
    // Metadata
    this.tags.clear();
    if (json.tags && Array.isArray(json.tags)) {
      for (const tag of json.tags) {
        this.tags.add(tag);
      }
    }
    
    this.userData.clear();
    if (json.userData && typeof json.userData === 'object') {
      for (const [key, value] of Object.entries(json.userData)) {
        this.userData.set(key, value);
      }
    }
    
    this.updateBoundingVolumes();
    
    return this;
  }

  /**
   * Clones the geometry
   */
  clone(): Geometry {
    const cloned = new Geometry(this.id, this.name, this.eventEmitter, this.logger);
    
    // Copy data
    if (this.vertices) cloned.vertices = new Float32Array(this.vertices);
    if (this.indices) cloned.indices = new Uint32Array(this.indices);
    if (this.normals) cloned.normals = new Float32Array(this.normals);
    if (this.uvs) cloned.uvs = new Float32Array(this.uvs);
    if (this.tangents) cloned.tangents = new Float32Array(this.tangents);
    if (this.colors) cloned.colors = new Float32Array(this.colors);
    
    // Copy properties
    cloned.vertexCount = this.vertexCount;
    cloned.indexCount = this.indexCount;
    cloned.triangleCount = this.triangleCount;
    cloned.drawMode = this.drawMode;
    cloned.static = this.static;
    cloned.dirty = true;
    
    // Copy attributes
    for (const [key, attribute] of this.attributes) {
      cloned.attributes.set(key, { ...attribute });
    }
    
    // Copy tags
    for (const tag of this.tags) {
      cloned.tags.add(tag);
    }
    
    // Copy user data
    for (const [key, value] of this.userData) {
      cloned.userData.set(key, value);
    }
    
    cloned.updateBoundingVolumes();
    
    return cloned;
  }

  /**
   * Disposes the geometry
   */
  dispose(): void {
    if (this.gl) {
      if (this.vao) this.gl.deleteVertexArray(this.vao);
      if (this.vbo) this.gl.deleteBuffer(this.vbo);
      if (this.ibo) this.gl.deleteBuffer(this.ibo);
    }

    this.vao = null;
    this.vbo = null;
    this.ibo = null;
    this.gl = null;
    this.uploaded = false;

    this.eventEmitter.emit('disposed', { geometry: this });
    this.logger.debug(`Geometry '${this.name}' disposed`);
  }

  /**
   * Gets a string representation of the geometry
   */
  toString(): string {
    return `Geometry(${this.name}, vertices: ${this.vertexCount}, triangles: ${this.triangleCount})`;
  }
} 