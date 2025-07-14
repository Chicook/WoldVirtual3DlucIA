/**
 * Scene System Tests
 * 
 * Comprehensive tests for the scene graph system including nodes,
 * mathematical operations, and component system.
 */

import { SceneNode } from '../scene/SceneNode';
import { Vector3, Quaternion, Matrix4, Euler } from '../scene/math';
import { BoundingBox, BoundingSphere } from '../scene/geometry';
import { Component, ComponentFactory, ComponentType } from '../scene/components';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

// Test component for testing
class TestComponent extends Component {
  public testValue: number = 0;

  constructor(id: string, name: string = '') {
    super(id, 'Custom' as ComponentType, name);
  }

  protected onUpdate(deltaTime: number): void {
    this.testValue += deltaTime;
  }

  protected createClone(): Component {
    const cloned = new TestComponent(this.id, this.name);
    cloned.testValue = this.testValue;
    return cloned;
  }

  protected serializeData(): any {
    return { testValue: this.testValue };
  }

  protected deserializeData(data: any): void {
    this.testValue = data.testValue || 0;
  }
}

describe('Scene System', () => {
  let eventEmitter: EventEmitter<any>;
  let logger: Logger;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    logger = new Logger('Test');
  });

  describe('SceneNode', () => {
    let node: SceneNode;
    let childNode: SceneNode;
    let grandChildNode: SceneNode;

    beforeEach(() => {
      node = new SceneNode('test-node', 'Test Node', eventEmitter, logger);
      childNode = new SceneNode('child-node', 'Child Node', eventEmitter, logger);
      grandChildNode = new SceneNode('grandchild-node', 'Grandchild Node', eventEmitter, logger);
    });

    describe('Basic Properties', () => {
      it('should create a node with correct properties', () => {
        expect(node.id).toBe('test-node');
        expect(node.name).toBe('Test Node');
        expect(node.parent).toBeNull();
        expect(node.children).toHaveLength(0);
        expect(node.depth).toBe(0);
      });

      it('should have correct initial transformations', () => {
        expect(node.position).toEqual(new Vector3(0, 0, 0));
        expect(node.rotation).toEqual(new Quaternion(0, 0, 0, 1));
        expect(node.scale).toEqual(new Vector3(1, 1, 1));
      });

      it('should have correct initial visibility and selection', () => {
        expect(node.visible).toBe(true);
        expect(node.selected).toBe(false);
        expect(node.culled).toBe(false);
      });
    });

    describe('Hierarchy Management', () => {
      it('should add a child node correctly', () => {
        node.addChild(childNode);
        
        expect(node.children).toHaveLength(1);
        expect(node.children[0]).toBe(childNode);
        expect(childNode.parent).toBe(node);
        expect(childNode.depth).toBe(1);
      });

      it('should remove a child node correctly', () => {
        node.addChild(childNode);
        const removed = node.removeChild(childNode);
        
        expect(removed).toBe(true);
        expect(node.children).toHaveLength(0);
        expect(childNode.parent).toBeNull();
        expect(childNode.depth).toBe(0);
      });

      it('should handle nested hierarchy correctly', () => {
        node.addChild(childNode);
        childNode.addChild(grandChildNode);
        
        expect(node.children).toHaveLength(1);
        expect(childNode.children).toHaveLength(1);
        expect(grandChildNode.parent).toBe(childNode);
        expect(grandChildNode.depth).toBe(2);
      });

      it('should prevent adding node as its own child', () => {
        expect(() => node.addChild(node)).toThrow('Cannot add node as its own child');
      });

      it('should remove all children correctly', () => {
        node.addChild(childNode);
        node.addChild(grandChildNode);
        node.removeAllChildren();
        
        expect(node.children).toHaveLength(0);
        expect(childNode.parent).toBeNull();
        expect(grandChildNode.parent).toBeNull();
      });
    });

    describe('Transformations', () => {
      it('should update local position correctly', () => {
        const newPos = new Vector3(1, 2, 3);
        node.position = newPos;
        
        expect(node.position).toEqual(newPos);
        expect(node.localMatrix).not.toEqual(new Matrix4());
      });

      it('should update local rotation correctly', () => {
        const newRot = new Quaternion(0, 0, 0.707, 0.707); // 90 degrees around Z
        node.rotation = newRot;
        
        expect(node.rotation).toEqual(newRot);
      });

      it('should update local scale correctly', () => {
        const newScale = new Vector3(2, 3, 4);
        node.scale = newScale;
        
        expect(node.scale).toEqual(newScale);
      });

      it('should calculate world transformations correctly', () => {
        node.position = new Vector3(1, 2, 3);
        node.addChild(childNode);
        childNode.position = new Vector3(4, 5, 6);
        
        const worldPos = childNode.worldPosition;
        expect(worldPos.x).toBeCloseTo(5, 5);
        expect(worldPos.y).toBeCloseTo(7, 5);
        expect(worldPos.z).toBeCloseTo(9, 5);
      });

      it('should emit transform changed events', () => {
        const listener = jest.fn();
        node.eventEmitter.on('transform:changed', listener);
        
        node.position = new Vector3(1, 2, 3);
        
        expect(listener).toHaveBeenCalledWith({
          node,
          worldMatrix: expect.any(Matrix4)
        });
      });
    });

    describe('Component System', () => {
      let component: TestComponent;

      beforeEach(() => {
        component = new TestComponent('test-component', 'Test Component');
      });

      it('should add a component correctly', () => {
        node.addComponent(component);
        
        expect(node.getComponents()).toHaveLength(1);
        expect(node.getComponent('Custom')).toBe(component);
        expect(component.node).toBe(node);
      });

      it('should remove a component correctly', () => {
        node.addComponent(component);
        const removed = node.removeComponent('Custom');
        
        expect(removed).toBe(true);
        expect(node.getComponents()).toHaveLength(0);
        expect(node.getComponent('Custom')).toBeNull();
        expect(component.node).toBeNull();
      });

      it('should check if component exists', () => {
        expect(node.hasComponent('Custom')).toBe(false);
        
        node.addComponent(component);
        expect(node.hasComponent('Custom')).toBe(true);
      });

      it('should emit component events', () => {
        const addedListener = jest.fn();
        const removedListener = jest.fn();
        
        node.eventEmitter.on('component:added', addedListener);
        node.eventEmitter.on('component:removed', removedListener);
        
        node.addComponent(component);
        expect(addedListener).toHaveBeenCalledWith({
          node,
          component
        });
        
        node.removeComponent('Custom');
        expect(removedListener).toHaveBeenCalledWith({
          node,
          component
        });
      });
    });

    describe('Visibility and Selection', () => {
      it('should handle visibility changes', () => {
        const listener = jest.fn();
        node.eventEmitter.on('visibility:changed', listener);
        
        node.visible = false;
        expect(node.visible).toBe(false);
        expect(listener).toHaveBeenCalledWith({
          node,
          visible: false
        });
      });

      it('should handle selection changes', () => {
        const listener = jest.fn();
        node.eventEmitter.on('selected:changed', listener);
        
        node.selected = true;
        expect(node.selected).toBe(true);
        expect(listener).toHaveBeenCalledWith({
          node,
          selected: true
        });
      });
    });

    describe('Performance Optimizations', () => {
      it('should handle static flag', () => {
        expect(node.static).toBe(false);
        node.static = true;
        expect(node.static).toBe(true);
      });

      it('should handle culling flags', () => {
        expect(node.frustumCulled).toBe(true);
        expect(node.occlusionCulled).toBe(true);
        
        node.frustumCulled = false;
        node.occlusionCulled = false;
        
        expect(node.frustumCulled).toBe(false);
        expect(node.occlusionCulled).toBe(false);
      });

      it('should handle render priority', () => {
        expect(node.renderPriority).toBe(0);
        node.renderPriority = 5;
        expect(node.renderPriority).toBe(5);
      });
    });

    describe('Utility Methods', () => {
      beforeEach(() => {
        node.addChild(childNode);
        childNode.addChild(grandChildNode);
      });

      it('should find node by name', () => {
        expect(node.findByName('Child Node')).toBe(childNode);
        expect(node.findByName('Grandchild Node')).toBe(grandChildNode);
        expect(node.findByName('NonExistent')).toBeNull();
      });

      it('should find node by ID', () => {
        expect(node.findById('child-node')).toBe(childNode);
        expect(node.findById('grandchild-node')).toBe(grandChildNode);
        expect(node.findById('non-existent')).toBeNull();
      });

      it('should traverse all nodes', () => {
        const visited: string[] = [];
        node.traverse((n) => visited.push(n.name));
        
        expect(visited).toEqual(['Test Node', 'Child Node', 'Grandchild Node']);
      });

      it('should handle tags', () => {
        node.addTag('test-tag');
        node.addTag('another-tag');
        
        expect(node.hasTag('test-tag')).toBe(true);
        expect(node.hasTag('another-tag')).toBe(true);
        expect(node.hasTag('non-existent')).toBe(false);
        expect(node.tags).toEqual(['test-tag', 'another-tag']);
        
        node.removeTag('test-tag');
        expect(node.hasTag('test-tag')).toBe(false);
      });

      it('should handle user data', () => {
        node.setUserData('test-key', 'test-value');
        node.setUserData('number-key', 42);
        
        expect(node.getUserData('test-key')).toBe('test-value');
        expect(node.getUserData('number-key')).toBe(42);
        expect(node.getUserData('non-existent')).toBeUndefined();
      });
    });

    describe('Cloning', () => {
      beforeEach(() => {
        node.position = new Vector3(1, 2, 3);
        node.rotation = new Quaternion(0, 0, 0.707, 0.707);
        node.scale = new Vector3(2, 3, 4);
        node.addTag('test-tag');
        node.setUserData('test-key', 'test-value');
        
        const component = new TestComponent('test-comp');
        component.testValue = 42;
        node.addComponent(component);
        
        node.addChild(childNode);
      });

      it('should clone node correctly', () => {
        const cloned = node.clone();
        
        expect(cloned.id).toBe('test-node_clone');
        expect(cloned.name).toBe('Test Node_clone');
        expect(cloned.position).toEqual(node.position);
        expect(cloned.rotation).toEqual(node.rotation);
        expect(cloned.scale).toEqual(node.scale);
        expect(cloned.tags).toEqual(node.tags);
        expect(cloned.getUserData('test-key')).toBe('test-value');
        expect(cloned.children).toHaveLength(1);
        expect(cloned.getComponents()).toHaveLength(1);
      });

      it('should clone components correctly', () => {
        const cloned = node.clone();
        const clonedComponent = cloned.getComponent('Custom') as TestComponent;
        
        expect(clonedComponent).toBeDefined();
        expect(clonedComponent.testValue).toBe(42);
      });
    });

    describe('Disposal', () => {
      it('should dispose node and all children', () => {
        node.addChild(childNode);
        const component = new TestComponent('test-comp');
        node.addComponent(component);
        
        const disposeSpy = jest.spyOn(component, 'dispose');
        
        node.dispose();
        
        expect(disposeSpy).toHaveBeenCalled();
        expect(node.children).toHaveLength(0);
        expect(childNode.parent).toBeNull();
      });
    });
  });

  describe('Mathematical Operations', () => {
    describe('Vector3', () => {
      it('should perform basic operations correctly', () => {
        const v1 = new Vector3(1, 2, 3);
        const v2 = new Vector3(4, 5, 6);
        
        expect(v1.add(v2)).toEqual(new Vector3(5, 7, 9));
        expect(v1.sub(v2)).toEqual(new Vector3(-3, -3, -3));
        expect(v1.multiplyScalar(2)).toEqual(new Vector3(2, 4, 6));
      });

      it('should calculate dot and cross products correctly', () => {
        const v1 = new Vector3(1, 0, 0);
        const v2 = new Vector3(0, 1, 0);
        
        expect(v1.dot(v2)).toBe(0);
        expect(v1.cross(v2)).toEqual(new Vector3(0, 0, 1));
      });

      it('should normalize correctly', () => {
        const v = new Vector3(3, 4, 0);
        const normalized = v.clone().normalize();
        
        expect(normalized.length()).toBeCloseTo(1, 5);
      });
    });

    describe('Quaternion', () => {
      it('should perform basic operations correctly', () => {
        const q1 = new Quaternion(0, 0, 0, 1);
        const q2 = new Quaternion(0, 0, 0.707, 0.707);
        
        expect(q1.multiply(q2)).toEqual(q2);
        expect(q1.length()).toBe(1);
      });

      it('should set from axis-angle correctly', () => {
        const axis = new Vector3(0, 0, 1);
        const quat = new Quaternion().setFromAxisAngle(axis, Math.PI / 2);
        
        expect(quat.length()).toBeCloseTo(1, 5);
      });
    });

    describe('Matrix4', () => {
      it('should perform basic operations correctly', () => {
        const m1 = new Matrix4();
        const m2 = new Matrix4().makeTranslation(1, 2, 3);
        
        expect(m1.multiply(m2)).toEqual(m2);
        expect(m1.determinant()).toBe(1);
      });

      it('should transform points correctly', () => {
        const matrix = new Matrix4().makeTranslation(1, 2, 3);
        const point = new Vector3(0, 0, 0);
        const transformed = matrix.transformPoint(point);
        
        expect(transformed).toEqual(new Vector3(1, 2, 3));
      });
    });

    describe('Euler', () => {
      it('should perform basic operations correctly', () => {
        const e1 = new Euler(0, 0, 0);
        const e2 = new Euler(Math.PI / 2, 0, 0);
        
        expect(e1.add(e2)).toEqual(e2);
        expect(e1.multiplyScalar(2)).toEqual(new Euler(0, 0, 0));
      });
    });
  });

  describe('Bounding Volumes', () => {
    describe('BoundingBox', () => {
      it('should create from points correctly', () => {
        const points = [
          new Vector3(0, 0, 0),
          new Vector3(1, 2, 3),
          new Vector3(-1, -2, -3)
        ];
        
        const box = BoundingBox.fromPoints(points);
        
        expect(box.min).toEqual(new Vector3(-1, -2, -3));
        expect(box.max).toEqual(new Vector3(1, 2, 3));
      });

      it('should check intersections correctly', () => {
        const box1 = new BoundingBox(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
        const box2 = new BoundingBox(new Vector3(0.5, 0.5, 0.5), new Vector3(1.5, 1.5, 1.5));
        
        expect(box1.intersectsBox(box2)).toBe(true);
      });

      it('should contain points correctly', () => {
        const box = new BoundingBox(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
        const point = new Vector3(0.5, 0.5, 0.5);
        
        expect(box.containsPoint(point)).toBe(true);
      });
    });

    describe('BoundingSphere', () => {
      it('should create from points correctly', () => {
        const points = [
          new Vector3(0, 0, 0),
          new Vector3(1, 0, 0),
          new Vector3(0, 1, 0)
        ];
        
        const sphere = BoundingSphere.fromPoints(points);
        
        expect(sphere.radius).toBeGreaterThan(0);
      });

      it('should check intersections correctly', () => {
        const sphere1 = new BoundingSphere(new Vector3(0, 0, 0), 1);
        const sphere2 = new BoundingSphere(new Vector3(1, 0, 0), 1);
        
        expect(sphere1.intersectsSphere(sphere2)).toBe(true);
      });

      it('should contain points correctly', () => {
        const sphere = new BoundingSphere(new Vector3(0, 0, 0), 1);
        const point = new Vector3(0.5, 0, 0);
        
        expect(sphere.containsPoint(point)).toBe(true);
      });
    });
  });

  describe('Component System', () => {
    describe('Component', () => {
      let component: TestComponent;

      beforeEach(() => {
        component = new TestComponent('test-component', 'Test Component');
      });

      it('should have correct initial properties', () => {
        expect(component.id).toBe('test-component');
        expect(component.type).toBe('Custom');
        expect(component.name).toBe('Test Component');
        expect(component.enabled).toBe(true);
        expect(component.node).toBeNull();
      });

      it('should handle lifecycle methods correctly', () => {
        const node = new SceneNode('test-node');
        
        component.onAttach(node);
        expect(component.node).toBe(node);
        
        component.onDetach();
        expect(component.node).toBeNull();
      });

      it('should handle enable/disable correctly', () => {
        const listener = jest.fn();
        component.eventEmitter.on('enabled:changed', listener);
        
        component.onDisable();
        expect(component.enabled).toBe(false);
        expect(listener).toHaveBeenCalledWith({
          component,
          enabled: false
        });
        
        component.onEnable();
        expect(component.enabled).toBe(true);
        expect(listener).toHaveBeenCalledWith({
          component,
          enabled: true
        });
      });

      it('should update correctly', () => {
        component.testValue = 0;
        component.update(1.0);
        
        expect(component.testValue).toBe(1.0);
      });

      it('should handle tags and user data', () => {
        component.addTag('test-tag');
        component.setUserData('test-key', 'test-value');
        
        expect(component.hasTag('test-tag')).toBe(true);
        expect(component.getUserData('test-key')).toBe('test-value');
      });

      it('should serialize and deserialize correctly', () => {
        component.testValue = 42;
        const json = component.toJSON();
        
        const newComponent = new TestComponent('new-component');
        newComponent.fromJSON(json);
        
        expect(newComponent.testValue).toBe(42);
      });

      it('should clone correctly', () => {
        component.testValue = 42;
        component.addTag('test-tag');
        
        const cloned = component.clone() as TestComponent;
        
        expect(cloned.testValue).toBe(42);
        expect(cloned.hasTag('test-tag')).toBe(true);
        expect(cloned.id).toBe(component.id);
        expect(cloned.name).toBe(`${component.name}_clone`);
      });
    });

    describe('ComponentFactory', () => {
      it('should register and create components correctly', () => {
        ComponentFactory.register('Custom' as ComponentType, TestComponent);
        
        const component = ComponentFactory.create('Custom' as ComponentType, 'test-id', 'Test');
        
        expect(component).toBeInstanceOf(TestComponent);
        expect(component.id).toBe('test-id');
        expect(component.name).toBe('Test');
      });

      it('should create from JSON correctly', () => {
        ComponentFactory.register('Custom' as ComponentType, TestComponent);
        
        const json = {
          id: 'test-id',
          type: 'Custom',
          name: 'Test Component',
          enabled: true,
          data: { testValue: 42 }
        };
        
        const component = ComponentFactory.createFromJSON(json) as TestComponent;
        
        expect(component).toBeInstanceOf(TestComponent);
        expect(component.testValue).toBe(42);
      });

      it('should throw error for unregistered type', () => {
        expect(() => {
          ComponentFactory.create('Unregistered' as ComponentType, 'test-id');
        }).toThrow('Component type \'Unregistered\' not registered');
      });
    });
  });
}); 