/**
 * Scene Node - Enterprise 3D Scene Graph System
 * 
 * Hierarchical scene graph node with advanced transformations,
 * component system, and performance optimizations.
 */

import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { Vector3, Quaternion, Matrix4, Euler } from './math';
import { Component, ComponentType } from './components/Component';
import { BoundingBox, BoundingSphere } from './geometry/BoundingVolume';

// Event types for scene nodes
export interface SceneNodeEvents {
  'transform:changed': { node: SceneNode; worldMatrix: Matrix4 };
  'child:added': { parent: SceneNode; child: SceneNode };
  'child:removed': { parent: SceneNode; child: SceneNode };
  'component:added': { node: SceneNode; component: Component };
  'component:removed': { node: SceneNode; component: Component };
  'visibility:changed': { node: SceneNode; visible: boolean };
  'selected:changed': { node: SceneNode; selected: boolean };
}

/**
 * Scene Node - Core entity in the scene graph
 */
export class SceneNode {
  // Basic properties
  public readonly id: string;
  public name: string;
  public readonly eventEmitter: EventEmitter<SceneNodeEvents>;
  public readonly logger: Logger;

  // Hierarchy
  private _parent: SceneNode | null = null;
  private _children: SceneNode[] = [];
  private _depth: number = 0;

  // Transformations
  private _position: Vector3 = new Vector3(0, 0, 0);
  private _rotation: Quaternion = new Quaternion();
  private _scale: Vector3 = new Vector3(1, 1, 1);
  private _localMatrix: Matrix4 = new Matrix4();
  private _worldMatrix: Matrix4 = new Matrix4();
  private _worldMatrixInverse: Matrix4 = new Matrix4();
  private _matrixDirty: boolean = true;
  private _worldMatrixDirty: boolean = true;

  // Components
  private _components: Map<ComponentType, Component> = new Map();
  private _componentArray: Component[] = [];

  // Rendering and visibility
  private _visible: boolean = true;
  private _selected: boolean = false;
  private _culled: boolean = false;
  private _boundingBox: BoundingBox | null = null;
  private _boundingSphere: BoundingSphere | null = null;
  private _boundingVolumeDirty: boolean = true;

  // Performance optimizations
  private _static: boolean = false;
  private _frustumCulled: boolean = true;
  private _occlusionCulled: boolean = true;
  private _lastFrameVisible: number = -1;
  private _renderPriority: number = 0;

  // Metadata
  private _tags: Set<string> = new Set();
  private _userData: Map<string, any> = new Map();
  private _layer: number = 0;

  constructor(
    id: string,
    name: string = '',
    eventEmitter?: EventEmitter<SceneNodeEvents>,
    logger?: Logger
  ) {
    this.id = id;
    this.name = name || id;
    this.eventEmitter = eventEmitter || new EventEmitter<SceneNodeEvents>();
    this.logger = logger || new Logger('SceneNode');
    
    this.updateLocalMatrix();
  }

  // ===== HIERARCHY MANAGEMENT =====

  /**
   * Gets the parent node
   */
  get parent(): SceneNode | null {
    return this._parent;
  }

  /**
   * Gets all children
   */
  get children(): readonly SceneNode[] {
    return this._children;
  }

  /**
   * Gets the depth in the scene graph
   */
  get depth(): number {
    return this._depth;
  }

  /**
   * Adds a child node
   */
  addChild(child: SceneNode): void {
    if (child === this) {
      throw new Error('Cannot add node as its own child');
    }

    if (child._parent === this) {
      return; // Already a child
    }

    // Remove from previous parent
    if (child._parent) {
      child._parent.removeChild(child);
    }

    // Add to this node
    this._children.push(child);
    child._parent = this;
    child._depth = this._depth + 1;
    child.markWorldMatrixDirty();

    // Update child's depth recursively
    child.updateDepthRecursive();

    this.eventEmitter.emit('child:added', { parent: this, child });
    this.logger.debug(`Added child '${child.name}' to '${this.name}'`);
  }

  /**
   * Removes a child node
   */
  removeChild(child: SceneNode): boolean {
    const index = this._children.indexOf(child);
    if (index === -1) {
      return false;
    }

    this._children.splice(index, 1);
    child._parent = null;
    child._depth = 0;
    child.markWorldMatrixDirty();

    // Update child's depth recursively
    child.updateDepthRecursive();

    this.eventEmitter.emit('child:removed', { parent: this, child });
    this.logger.debug(`Removed child '${child.name}' from '${this.name}'`);
    return true;
  }

  /**
   * Removes all children
   */
  removeAllChildren(): void {
    const children = [...this._children];
    for (const child of children) {
      this.removeChild(child);
    }
  }

  /**
   * Updates depth recursively for all children
   */
  private updateDepthRecursive(): void {
    const newDepth = this._parent ? this._parent._depth + 1 : 0;
    if (this._depth !== newDepth) {
      this._depth = newDepth;
      for (const child of this._children) {
        child.updateDepthRecursive();
      }
    }
  }

  // ===== TRANSFORMATION MANAGEMENT =====

  /**
   * Gets the local position
   */
  get position(): Vector3 {
    return this._position.clone();
  }

  /**
   * Sets the local position
   */
  set position(value: Vector3) {
    this._position.copy(value);
    this.markMatrixDirty();
  }

  /**
   * Gets the local rotation
   */
  get rotation(): Quaternion {
    return this._rotation.clone();
  }

  /**
   * Sets the local rotation
   */
  set rotation(value: Quaternion) {
    this._rotation.copy(value);
    this.markMatrixDirty();
  }

  /**
   * Gets the local scale
   */
  get scale(): Vector3 {
    return this._scale.clone();
  }

  /**
   * Sets the local scale
   */
  set scale(value: Vector3) {
    this._scale.copy(value);
    this.markMatrixDirty();
  }

  /**
   * Gets the world position
   */
  get worldPosition(): Vector3 {
    this.updateWorldMatrix();
    return this._worldMatrix.getTranslation();
  }

  /**
   * Sets the world position
   */
  set worldPosition(value: Vector3) {
    if (this._parent) {
      const parentWorldMatrixInverse = this._parent.worldMatrixInverse;
      const localPosition = parentWorldMatrixInverse.transformPoint(value);
      this._position.copy(localPosition);
    } else {
      this._position.copy(value);
    }
    this.markMatrixDirty();
  }

  /**
   * Gets the world rotation
   */
  get worldRotation(): Quaternion {
    this.updateWorldMatrix();
    return this._worldMatrix.getRotation();
  }

  /**
   * Sets the world rotation
   */
  set worldRotation(value: Quaternion) {
    if (this._parent) {
      const parentWorldRotationInverse = this._parent.worldRotation.clone().invert();
      this._rotation.copy(parentWorldRotationInverse.multiply(value));
    } else {
      this._rotation.copy(value);
    }
    this.markMatrixDirty();
  }

  /**
   * Gets the world scale
   */
  get worldScale(): Vector3 {
    this.updateWorldMatrix();
    return this._worldMatrix.getScale();
  }

  /**
   * Gets the local transformation matrix
   */
  get localMatrix(): Matrix4 {
    this.updateLocalMatrix();
    return this._localMatrix.clone();
  }

  /**
   * Gets the world transformation matrix
   */
  get worldMatrix(): Matrix4 {
    this.updateWorldMatrix();
    return this._worldMatrix.clone();
  }

  /**
   * Gets the inverse world transformation matrix
   */
  get worldMatrixInverse(): Matrix4 {
    this.updateWorldMatrix();
    return this._worldMatrixInverse.clone();
  }

  /**
   * Gets the world rotation inverse
   */
  get worldRotationInverse(): Quaternion {
    return this.worldRotation.clone().invert();
  }

  /**
   * Marks the local matrix as dirty
   */
  private markMatrixDirty(): void {
    this._matrixDirty = true;
    this.markWorldMatrixDirty();
  }

  /**
   * Marks the world matrix as dirty
   */
  private markWorldMatrixDirty(): void {
    this._worldMatrixDirty = true;
    this._boundingVolumeDirty = true;
    
    // Mark all children as dirty
    for (const child of this._children) {
      child.markWorldMatrixDirty();
    }

    this.eventEmitter.emit('transform:changed', { 
      node: this, 
      worldMatrix: this._worldMatrix 
    });
  }

  /**
   * Updates the local transformation matrix
   */
  private updateLocalMatrix(): void {
    if (!this._matrixDirty) return;

    this._localMatrix.compose(this._position, this._rotation, this._scale);
    this._matrixDirty = false;
  }

  /**
   * Updates the world transformation matrix
   */
  private updateWorldMatrix(): void {
    if (!this._worldMatrixDirty) return;

    this.updateLocalMatrix();

    if (this._parent) {
      this._parent.updateWorldMatrix();
      this._worldMatrix.copy(this._parent._worldMatrix).multiply(this._localMatrix);
    } else {
      this._worldMatrix.copy(this._localMatrix);
    }

    this._worldMatrixInverse.copy(this._worldMatrix).invert();
    this._worldMatrixDirty = false;
  }

  // ===== COMPONENT SYSTEM =====

  /**
   * Adds a component to this node
   */
  addComponent(component: Component): void {
    const type = component.type;
    
    if (this._components.has(type)) {
      this.logger.warn(`Component of type '${type}' already exists on node '${this.name}'`);
      return;
    }

    this._components.set(type, component);
    this._componentArray.push(component);
    component.node = this;

    this.eventEmitter.emit('component:added', { node: this, component });
    this.logger.debug(`Added component '${type}' to node '${this.name}'`);
  }

  /**
   * Removes a component from this node
   */
  removeComponent(type: ComponentType): boolean {
    const component = this._components.get(type);
    if (!component) {
      return false;
    }

    this._components.delete(type);
    const index = this._componentArray.indexOf(component);
    if (index !== -1) {
      this._componentArray.splice(index, 1);
    }

    component.node = null;

    this.eventEmitter.emit('component:removed', { node: this, component });
    this.logger.debug(`Removed component '${type}' from node '${this.name}'`);
    return true;
  }

  /**
   * Gets a component by type
   */
  getComponent<T extends Component>(type: ComponentType): T | null {
    return (this._components.get(type) as T) || null;
  }

  /**
   * Gets all components
   */
  getComponents(): readonly Component[] {
    return this._componentArray;
  }

  /**
   * Checks if this node has a component of the given type
   */
  hasComponent(type: ComponentType): boolean {
    return this._components.has(type);
  }

  // ===== VISIBILITY AND RENDERING =====

  /**
   * Gets the visibility state
   */
  get visible(): boolean {
    return this._visible;
  }

  /**
   * Sets the visibility state
   */
  set visible(value: boolean) {
    if (this._visible !== value) {
      this._visible = value;
      this.eventEmitter.emit('visibility:changed', { node: this, visible: value });
      this.logger.debug(`Node '${this.name}' visibility changed to ${value}`);
    }
  }

  /**
   * Gets the selection state
   */
  get selected(): boolean {
    return this._selected;
  }

  /**
   * Sets the selection state
   */
  set selected(value: boolean) {
    if (this._selected !== value) {
      this._selected = value;
      this.eventEmitter.emit('selected:changed', { node: this, selected: value });
    }
  }

  /**
   * Gets the culling state
   */
  get culled(): boolean {
    return this._culled;
  }

  /**
   * Sets the culling state
   */
  set culled(value: boolean) {
    this._culled = value;
  }

  /**
   * Gets the bounding box
   */
  get boundingBox(): BoundingBox | null {
    this.updateBoundingVolume();
    return this._boundingBox;
  }

  /**
   * Gets the bounding sphere
   */
  get boundingSphere(): BoundingSphere | null {
    this.updateBoundingVolume();
    return this._boundingSphere;
  }

  /**
   * Updates bounding volumes
   */
  private updateBoundingVolume(): void {
    if (!this._boundingVolumeDirty) return;

    // Calculate bounding volume from components
    let min = new Vector3(Infinity, Infinity, Infinity);
    let max = new Vector3(-Infinity, -Infinity, -Infinity);
    let hasGeometry = false;

    for (const component of this._componentArray) {
      if (component.boundingBox) {
        const box = component.boundingBox;
        min.min(box.min);
        max.max(box.max);
        hasGeometry = true;
      }
    }

    if (hasGeometry) {
      this._boundingBox = new BoundingBox(min, max);
      this._boundingSphere = BoundingSphere.fromBoundingBox(this._boundingBox);
    } else {
      this._boundingBox = null;
      this._boundingSphere = null;
    }

    this._boundingVolumeDirty = false;
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====

  /**
   * Gets the static flag
   */
  get static(): boolean {
    return this._static;
  }

  /**
   * Sets the static flag
   */
  set static(value: boolean) {
    this._static = value;
  }

  /**
   * Gets the frustum culling flag
   */
  get frustumCulled(): boolean {
    return this._frustumCulled;
  }

  /**
   * Sets the frustum culling flag
   */
  set frustumCulled(value: boolean) {
    this._frustumCulled = value;
  }

  /**
   * Gets the occlusion culling flag
   */
  get occlusionCulled(): boolean {
    return this._occlusionCulled;
  }

  /**
   * Sets the occlusion culling flag
   */
  set occlusionCulled(value: boolean) {
    this._occlusionCulled = value;
  }

  /**
   * Gets the render priority
   */
  get renderPriority(): number {
    return this._renderPriority;
  }

  /**
   * Sets the render priority
   */
  set renderPriority(value: number) {
    this._renderPriority = value;
  }

  /**
   * Gets the last frame this node was visible
   */
  get lastFrameVisible(): number {
    return this._lastFrameVisible;
  }

  /**
   * Sets the last frame this node was visible
   */
  set lastFrameVisible(value: number) {
    this._lastFrameVisible = value;
  }

  // ===== METADATA AND TAGS =====

  /**
   * Adds a tag to this node
   */
  addTag(tag: string): void {
    this._tags.add(tag);
  }

  /**
   * Removes a tag from this node
   */
  removeTag(tag: string): boolean {
    return this._tags.delete(tag);
  }

  /**
   * Checks if this node has a specific tag
   */
  hasTag(tag: string): boolean {
    return this._tags.has(tag);
  }

  /**
   * Gets all tags
   */
  get tags(): readonly string[] {
    return Array.from(this._tags);
  }

  /**
   * Sets user data
   */
  setUserData(key: string, value: any): void {
    this._userData.set(key, value);
  }

  /**
   * Gets user data
   */
  getUserData(key: string): any {
    return this._userData.get(key);
  }

  /**
   * Gets the layer
   */
  get layer(): number {
    return this._layer;
  }

  /**
   * Sets the layer
   */
  set layer(value: number) {
    this._layer = value;
  }

  // ===== UTILITY METHODS =====

  /**
   * Traverses the scene graph
   */
  traverse(callback: (node: SceneNode) => void): void {
    callback(this);
    for (const child of this._children) {
      child.traverse(callback);
    }
  }

  /**
   * Finds a node by name
   */
  findByName(name: string): SceneNode | null {
    if (this.name === name) {
      return this;
    }

    for (const child of this._children) {
      const found = child.findByName(name);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Finds a node by ID
   */
  findById(id: string): SceneNode | null {
    if (this.id === id) {
      return this;
    }

    for (const child of this._children) {
      const found = child.findById(id);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Finds nodes by tag
   */
  findByTag(tag: string): SceneNode[] {
    const result: SceneNode[] = [];
    
    if (this.hasTag(tag)) {
      result.push(this);
    }

    for (const child of this._children) {
      result.push(...child.findByTag(tag));
    }

    return result;
  }

  /**
   * Clones this node
   */
  clone(): SceneNode {
    const cloned = new SceneNode(
      `${this.id}_clone`,
      `${this.name}_clone`,
      this.eventEmitter,
      this.logger
    );

    // Copy transformations
    cloned._position.copy(this._position);
    cloned._rotation.copy(this._rotation);
    cloned._scale.copy(this._scale);

    // Copy properties
    cloned._visible = this._visible;
    cloned._static = this._static;
    cloned._frustumCulled = this._frustumCulled;
    cloned._occlusionCulled = this._occlusionCulled;
    cloned._renderPriority = this._renderPriority;
    cloned._layer = this._layer;

    // Copy tags
    for (const tag of this._tags) {
      cloned._tags.add(tag);
    }

    // Copy user data
    for (const [key, value] of this._userData) {
      cloned._userData.set(key, value);
    }

    // Clone components
    for (const component of this._componentArray) {
      const clonedComponent = component.clone();
      cloned.addComponent(clonedComponent);
    }

    // Clone children
    for (const child of this._children) {
      const clonedChild = child.clone();
      cloned.addChild(clonedChild);
    }

    return cloned;
  }

  /**
   * Disposes this node and all its children
   */
  dispose(): void {
    // Dispose components
    for (const component of this._componentArray) {
      component.dispose();
    }
    this._components.clear();
    this._componentArray.length = 0;

    // Dispose children
    for (const child of this._children) {
      child.dispose();
    }
    this._children.length = 0;

    // Remove from parent
    if (this._parent) {
      this._parent.removeChild(this);
    }

    this.logger.debug(`Disposed node '${this.name}'`);
  }

  /**
   * Gets a string representation of this node
   */
  toString(): string {
    return `SceneNode(${this.name}, id: ${this.id}, children: ${this._children.length})`;
  }
} 