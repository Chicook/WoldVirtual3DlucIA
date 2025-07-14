/**
 * Component System - Enterprise 3D Scene Components
 * 
 * Base component system for scene graph nodes with lifecycle management,
 * serialization, and performance optimizations.
 */

import { SceneNode } from '../SceneNode';
import { EventEmitter } from '../../events/EventEmitter';
import { Logger } from '../../logging/Logger';

// Component type definitions
export type ComponentType = 
  | 'Transform'
  | 'Geometry'
  | 'Material'
  | 'Light'
  | 'Camera'
  | 'Audio'
  | 'Physics'
  | 'Animation'
  | 'Particle'
  | 'UI'
  | 'Script'
  | 'Custom';

// Component events
export interface ComponentEvents {
  'enabled:changed': { component: Component; enabled: boolean };
  'data:changed': { component: Component; data: any };
  'disposed': { component: Component };
}

/**
 * Base Component Class
 */
export abstract class Component {
  // Basic properties
  public readonly id: string;
  public readonly type: ComponentType;
  public name: string;
  public enabled: boolean = true;
  public readonly eventEmitter: EventEmitter<ComponentEvents>;
  public readonly logger: Logger;

  // Node reference
  public node: SceneNode | null = null;

  // Performance and optimization
  public priority: number = 0;
  public static: boolean = false;
  public culled: boolean = false;
  public lastUpdate: number = 0;
  public updateInterval: number = 0; // 0 = every frame

  // Metadata
  public tags: Set<string> = new Set();
  public userData: Map<string, any> = new Map();
  public visible: boolean = true;

  // Serialization
  public serializable: boolean = true;
  public version: number = 1;

  constructor(
    id: string,
    type: ComponentType,
    name: string = '',
    eventEmitter?: EventEmitter<ComponentEvents>,
    logger?: Logger
  ) {
    this.id = id;
    this.type = type;
    this.name = name || `${type}_${id}`;
    this.eventEmitter = eventEmitter || new EventEmitter<ComponentEvents>();
    this.logger = logger || new Logger(`Component:${type}`);
  }

  // ===== LIFECYCLE METHODS =====

  /**
   * Called when the component is added to a node
   */
  onAttach(node: SceneNode): void {
    this.node = node;
    this.logger.debug(`Component '${this.name}' attached to node '${node.name}'`);
  }

  /**
   * Called when the component is removed from a node
   */
  onDetach(): void {
    this.node = null;
    this.logger.debug(`Component '${this.name}' detached from node`);
  }

  /**
   * Called when the component is enabled
   */
  onEnable(): void {
    this.enabled = true;
    this.eventEmitter.emit('enabled:changed', { component: this, enabled: true });
    this.logger.debug(`Component '${this.name}' enabled`);
  }

  /**
   * Called when the component is disabled
   */
  onDisable(): void {
    this.enabled = false;
    this.eventEmitter.emit('enabled:changed', { component: this, enabled: false });
    this.logger.debug(`Component '${this.name}' disabled`);
  }

  /**
   * Called every frame for active components
   */
  update(deltaTime: number): void {
    if (!this.enabled || !this.node) return;
    
    const now = performance.now();
    if (this.updateInterval > 0 && now - this.lastUpdate < this.updateInterval) {
      return;
    }

    this.lastUpdate = now;
    this.onUpdate(deltaTime);
  }

  /**
   * Called when the component should be updated
   */
  protected abstract onUpdate(deltaTime: number): void;

  /**
   * Called before rendering
   */
  preRender(): void {
    if (!this.enabled || !this.node) return;
    this.onPreRender();
  }

  /**
   * Called before rendering (override in subclasses)
   */
  protected onPreRender(): void {
    // Override in subclasses
  }

  /**
   * Called after rendering
   */
  postRender(): void {
    if (!this.enabled || !this.node) return;
    this.onPostRender();
  }

  /**
   * Called after rendering (override in subclasses)
   */
  protected onPostRender(): void {
    // Override in subclasses
  }

  /**
   * Called when the component is disposed
   */
  dispose(): void {
    this.enabled = false;
    this.onDetach();
    this.eventEmitter.emit('disposed', { component: this });
    this.logger.debug(`Component '${this.name}' disposed`);
  }

  // ===== UTILITY METHODS =====

  /**
   * Gets the world position of the node
   */
  getWorldPosition(): any {
    return this.node?.worldPosition || null;
  }

  /**
   * Gets the world rotation of the node
   */
  getWorldRotation(): any {
    return this.node?.worldRotation || null;
  }

  /**
   * Gets the world scale of the node
   */
  getWorldScale(): any {
    return this.node?.worldScale || null;
  }

  /**
   * Gets the world transformation matrix
   */
  getWorldMatrix(): any {
    return this.node?.worldMatrix || null;
  }

  /**
   * Adds a tag to this component
   */
  addTag(tag: string): void {
    this.tags.add(tag);
  }

  /**
   * Removes a tag from this component
   */
  removeTag(tag: string): boolean {
    return this.tags.delete(tag);
  }

  /**
   * Checks if this component has a specific tag
   */
  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Sets user data
   */
  setUserData(key: string, value: any): void {
    this.userData.set(key, value);
  }

  /**
   * Gets user data
   */
  getUserData(key: string): any {
    return this.userData.get(key);
  }

  /**
   * Gets the bounding box of this component
   */
  get boundingBox(): any {
    return null; // Override in subclasses
  }

  /**
   * Gets the bounding sphere of this component
   */
  get boundingSphere(): any {
    return null; // Override in subclasses
  }

  // ===== SERIALIZATION =====

  /**
   * Serializes the component to JSON
   */
  toJSON(): any {
    if (!this.serializable) {
      return null;
    }

    return {
      id: this.id,
      type: this.type,
      name: this.name,
      enabled: this.enabled,
      priority: this.priority,
      static: this.static,
      updateInterval: this.updateInterval,
      visible: this.visible,
      version: this.version,
      tags: Array.from(this.tags),
      userData: Object.fromEntries(this.userData),
      data: this.serializeData()
    };
  }

  /**
   * Deserializes the component from JSON
   */
  fromJSON(json: any): void {
    if (!json || !this.serializable) return;

    this.name = json.name || this.name;
    this.enabled = json.enabled !== undefined ? json.enabled : this.enabled;
    this.priority = json.priority || this.priority;
    this.static = json.static || this.static;
    this.updateInterval = json.updateInterval || this.updateInterval;
    this.visible = json.visible !== undefined ? json.visible : this.visible;

    // Restore tags
    this.tags.clear();
    if (json.tags && Array.isArray(json.tags)) {
      for (const tag of json.tags) {
        this.tags.add(tag);
      }
    }

    // Restore user data
    this.userData.clear();
    if (json.userData && typeof json.userData === 'object') {
      for (const [key, value] of Object.entries(json.userData)) {
        this.userData.set(key, value);
      }
    }

    // Restore component-specific data
    if (json.data) {
      this.deserializeData(json.data);
    }
  }

  /**
   * Serializes component-specific data (override in subclasses)
   */
  protected serializeData(): any {
    return {};
  }

  /**
   * Deserializes component-specific data (override in subclasses)
   */
  protected deserializeData(data: any): void {
    // Override in subclasses
  }

  /**
   * Creates a clone of this component
   */
  clone(): Component {
    const cloned = this.createClone();
    cloned.name = `${this.name}_clone`;
    cloned.enabled = this.enabled;
    cloned.priority = this.priority;
    cloned.static = this.static;
    cloned.updateInterval = this.updateInterval;
    cloned.visible = this.visible;

    // Clone tags
    for (const tag of this.tags) {
      cloned.tags.add(tag);
    }

    // Clone user data
    for (const [key, value] of this.userData) {
      cloned.userData.set(key, value);
    }

    return cloned;
  }

  /**
   * Creates a clone of this component (override in subclasses)
   */
  protected abstract createClone(): Component;

  // ===== VALIDATION =====

  /**
   * Validates the component data
   */
  validate(): boolean {
    return this.onValidate();
  }

  /**
   * Validates the component data (override in subclasses)
   */
  protected onValidate(): boolean {
    return true;
  }

  // ===== DEBUGGING =====

  /**
   * Gets debug information about this component
   */
  getDebugInfo(): any {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      enabled: this.enabled,
      node: this.node?.name || null,
      priority: this.priority,
      static: this.static,
      culled: this.culled,
      visible: this.visible,
      tags: Array.from(this.tags),
      userDataKeys: Array.from(this.userData.keys()),
      lastUpdate: this.lastUpdate,
      updateInterval: this.updateInterval
    };
  }

  // ===== STRING REPRESENTATION =====

  /**
   * Gets a string representation of this component
   */
  toString(): string {
    return `Component(${this.type}, ${this.name}, enabled: ${this.enabled})`;
  }
}

/**
 * Component Factory for creating components by type
 */
export class ComponentFactory {
  private static registry = new Map<ComponentType, new (id: string, name?: string) => Component>();

  /**
   * Registers a component class
   */
  static register(type: ComponentType, constructor: new (id: string, name?: string) => Component): void {
    this.registry.set(type, constructor);
  }

  /**
   * Creates a component by type
   */
  static create(type: ComponentType, id: string, name?: string): Component | null {
    const constructor = this.registry.get(type);
    if (!constructor) {
      throw new Error(`Component type '${type}' not registered`);
    }
    return new constructor(id, name);
  }

  /**
   * Creates a component from JSON
   */
  static createFromJSON(json: any): Component | null {
    if (!json || !json.type || !json.id) {
      return null;
    }

    const component = this.create(json.type, json.id, json.name);
    if (component) {
      component.fromJSON(json);
    }
    return component;
  }

  /**
   * Gets all registered component types
   */
  static getRegisteredTypes(): ComponentType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Checks if a component type is registered
   */
  static isRegistered(type: ComponentType): boolean {
    return this.registry.has(type);
  }
} 