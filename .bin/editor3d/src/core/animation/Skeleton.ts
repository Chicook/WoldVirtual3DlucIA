/**
 * Skeleton - Sistema de Esqueletos para Animación 3D
 * 
 * Gestión de esqueletos, huesos, transformaciones y animación de esqueletos
 * para el editor 3D del metaverso.
 */

import { Vector3 } from '../scene/math/Vector3';
import { Quaternion } from '../scene/math/Quaternion';
import { Matrix4 } from '../scene/math/Matrix4';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

export interface SkeletonEvents {
  'bone:added': { skeleton: Skeleton; bone: Bone };
  'bone:removed': { skeleton: Skeleton; boneId: string };
  'bone:updated': { skeleton: Skeleton; bone: Bone; transform: Transform };
  'pose:applied': { skeleton: Skeleton; pose: Pose };
  'ik:applied': { skeleton: Skeleton; chain: IKChain; target: Vector3 };
  'constraint:applied': { skeleton: Skeleton; constraint: Constraint };
}

export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

export interface Bone {
  readonly id: string;
  readonly name: string;
  parent: string | null;
  children: string[];
  transform: Transform;
  bindPose: Transform;
  length: number;
  enabled: boolean;
  visible: boolean;
  color: string;
  metadata: BoneMetadata | null;
}

export interface BoneMetadata {
  type: 'root' | 'spine' | 'limb' | 'hand' | 'foot' | 'head' | 'custom';
  side: 'left' | 'right' | 'center';
  importance: number;
  constraints: Constraint[];
  ikChains: IKChain[];
}

export interface Pose {
  id: string;
  name: string;
  transforms: Map<string, Transform>;
  metadata?: PoseMetadata;
}

export interface PoseMetadata {
  category: string;
  tags: string[];
  difficulty: number;
  description: string;
}

export interface IKChain {
  id: string;
  name: string;
  bones: string[];
  target: Vector3;
  poleTarget?: Vector3;
  iterations: number;
  tolerance: number;
  enabled: boolean;
}

export interface Constraint {
  id: string;
  name: string;
  type: ConstraintType;
  boneId: string;
  targetId?: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export enum ConstraintType {
  LOOK_AT = 'lookAt',
  POINT = 'point',
  ORIENT = 'orient',
  POSITION = 'position',
  SCALE = 'scale',
  ROTATION_LIMIT = 'rotationLimit',
  POSITION_LIMIT = 'positionLimit',
  SCALE_LIMIT = 'scaleLimit'
}

export interface SkeletonConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  author: string;
  metadata?: SkeletonMetadata;
}

export interface SkeletonMetadata {
  category: 'humanoid' | 'quadruped' | 'flying' | 'custom';
  boneCount: number;
  height: number;
  scale: number;
  units: 'meters' | 'centimeters' | 'inches';
  optimized: boolean;
}

/**
 * Clase de Hueso
 */
export class Bone {
  public readonly id: string;
  public readonly name: string;
  public parent: string | null;
  public children: string[];
  public transform: Transform;
  public bindPose: Transform;
  public length: number;
  public enabled: boolean;
  public visible: boolean;
  public color: string;
  public metadata: BoneMetadata | null;

  private _worldMatrix: Matrix4;
  private _localMatrix: Matrix4;
  private _inverseBindMatrix: Matrix4;

  constructor(config: Omit<Bone, 'children' | 'worldMatrix' | 'localMatrix' | 'inverseBindMatrix'>) {
    this.id = config.id;
    this.name = config.name;
    this.parent = config.parent;
    this.children = [];
    this.transform = { ...config.transform };
    this.bindPose = { ...config.bindPose };
    this.length = config.length;
    this.enabled = config.enabled;
    this.visible = config.visible;
    this.color = config.color;
    this.metadata = config.metadata;

    this._worldMatrix = new Matrix4();
    this._localMatrix = new Matrix4();
    this._inverseBindMatrix = new Matrix4();

    this.updateMatrices();
  }

  /**
   * Actualiza las matrices de transformación
   */
  updateMatrices(): void {
    // Matriz local
    this._localMatrix.compose(
      this.transform.position,
      this.transform.rotation,
      this.transform.scale
    );

    // Matriz inversa del bind pose
    const bindMatrix = new Matrix4().compose(
      this.bindPose.position,
      this.bindPose.rotation,
      this.bindPose.scale
    );
    this._inverseBindMatrix.copy(bindMatrix).invert();
  }

  /**
   * Actualiza la matriz mundial
   */
  updateWorldMatrix(parentMatrix?: Matrix4): void {
    if (parentMatrix) {
      this._worldMatrix.copy(parentMatrix).multiply(this._localMatrix);
    } else {
      this._worldMatrix.copy(this._localMatrix);
    }
  }

  /**
   * Obtiene la transformación mundial
   */
  getWorldTransform(): Transform {
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();

    this._worldMatrix.decompose(position, rotation, scale);

    return { position, rotation, scale };
  }

  /**
   * Aplica una transformación relativa
   */
  applyTransform(transform: Partial<Transform>): void {
    if (transform.position) {
      this.transform.position.copy(transform.position);
    }
    if (transform.rotation) {
      this.transform.rotation.copy(transform.rotation);
    }
    if (transform.scale) {
      this.transform.scale.copy(transform.scale);
    }

    this.updateMatrices();
  }

  /**
   * Resetea a la pose de bind
   */
  resetToBindPose(): void {
    this.transform = { ...this.bindPose };
    this.updateMatrices();
  }

  /**
   * Obtiene la dirección del hueso
   */
  getDirection(): Vector3 {
    const direction = new Vector3(0, 1, 0);
    // Aplicar rotación manualmente ya que Vector3 no tiene applyQuaternion
    const rotatedDirection = direction.clone();
    const rotationMatrix = new Matrix4().makeRotationFromQuaternion(this.transform.rotation);
    rotatedDirection.applyMatrix4(rotationMatrix);
    return rotatedDirection;
  }

  /**
   * Obtiene el punto final del hueso
   */
  getEndPoint(): Vector3 {
    const direction = this.getDirection();
    return this.transform.position.clone().add(direction.multiplyScalar(this.length));
  }

  /**
   * Calcula la distancia a otro hueso
   */
  distanceTo(other: Bone): number {
    return this.transform.position.distanceTo(other.transform.position);
  }

  /**
   * Obtiene el ángulo con otro hueso
   */
  angleTo(other: Bone): number {
    const thisDirection = this.getDirection();
    const otherDirection = other.getDirection();
    return thisDirection.angleTo(otherDirection);
  }

  // Getters
  get worldMatrix(): Matrix4 { return this._worldMatrix; }
  get localMatrix(): Matrix4 { return this._localMatrix; }
  get inverseBindMatrix(): Matrix4 { return this._inverseBindMatrix; }
}

/**
 * Clase de Esqueleto
 */
export class Skeleton extends EventEmitter<SkeletonEvents> {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: string;
  public readonly author: string;
  public readonly metadata: SkeletonMetadata | null;

  public bones: Map<string, Bone>;
  public rootBones: string[];
  public bindPose: Map<string, Transform>;
  public enabled: boolean;

  private _worldMatrices: Map<string, Matrix4>;
  private _boneNames: Map<string, string>;
  private _boneHierarchy: Map<string, string[]>;
  private _constraints: Map<string, Constraint>;
  private _ikChains: Map<string, IKChain>;
  private _poses: Map<string, Pose>;

  constructor(config: SkeletonConfig) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
    this.version = config.version;
    this.author = config.author;
    this.metadata = config.metadata || null;

    this.bones = new Map();
    this.rootBones = [];
    this.bindPose = new Map();
    this.enabled = true;

    this._worldMatrices = new Map();
    this._boneNames = new Map();
    this._boneHierarchy = new Map();
    this._constraints = new Map();
    this._ikChains = new Map();
    this._poses = new Map();
  }

  /**
   * Agrega un hueso al esqueleto
   */
  addBone(bone: Bone): void {
    this.bones.set(bone.id, bone);
    this._boneNames.set(bone.name, bone.id);
    this.bindPose.set(bone.id, { ...bone.bindPose });

    if (!bone.parent) {
      this.rootBones.push(bone.id);
    } else {
      const parentBone = this.bones.get(bone.parent);
      if (parentBone) {
        parentBone.children.push(bone.id);
      }
    }

    this._updateHierarchy();
    this.emit('bone:added', { skeleton: this, bone });
  }

  /**
   * Remueve un hueso del esqueleto
   */
  removeBone(boneId: string): void {
    const bone = this.bones.get(boneId);
    if (!bone) return;

    // Remover de la lista de root bones si es necesario
    const rootIndex = this.rootBones.indexOf(boneId);
    if (rootIndex !== -1) {
      this.rootBones.splice(rootIndex, 1);
    }

    // Remover de los hijos del padre
    if (bone.parent) {
      const parentBone = this.bones.get(bone.parent);
      if (parentBone) {
        const childIndex = parentBone.children.indexOf(boneId);
        if (childIndex !== -1) {
          parentBone.children.splice(childIndex, 1);
        }
      }
    }

    // Mover hijos a root bones
    bone.children.forEach(childId => {
      const childBone = this.bones.get(childId);
      if (childBone) {
        childBone.parent = null;
        this.rootBones.push(childId);
      }
    });

    this.bones.delete(boneId);
    this._boneNames.delete(bone.name);
    this.bindPose.delete(boneId);
    this._worldMatrices.delete(boneId);

    this._updateHierarchy();
    this.emit('bone:removed', { skeleton: this, boneId });
  }

  /**
   * Obtiene un hueso por ID
   */
  getBone(boneId: string): Bone | null {
    return this.bones.get(boneId) || null;
  }

  /**
   * Obtiene un hueso por nombre
   */
  getBoneByName(name: string): Bone | null {
    const boneId = this._boneNames.get(name);
    return boneId ? this.bones.get(boneId) || null : null;
  }

  /**
   * Actualiza un hueso
   */
  updateBone(boneId: string, transform: Transform): void {
    const bone = this.bones.get(boneId);
    if (!bone) return;

    bone.applyTransform(transform);
    this.emit('bone:updated', { skeleton: this, bone, transform });
  }

  /**
   * Actualiza todas las matrices mundiales
   */
  updateWorldMatrices(): void {
    this.rootBones.forEach(rootId => {
      this._updateBoneWorldMatrix(rootId);
    });
  }

  /**
   * Actualiza la matriz mundial de un hueso y sus hijos
   */
  private _updateBoneWorldMatrix(boneId: string, parentMatrix?: Matrix4): void {
    const bone = this.bones.get(boneId);
    if (!bone) return;

    bone.updateWorldMatrix(parentMatrix);
    this._worldMatrices.set(boneId, bone.worldMatrix);

    bone.children.forEach(childId => {
      this._updateBoneWorldMatrix(childId, bone.worldMatrix);
    });
  }

  /**
   * Actualiza la jerarquía de huesos
   */
  private _updateHierarchy(): void {
    this._boneHierarchy.clear();
    
    this.bones.forEach(bone => {
      this._boneHierarchy.set(bone.id, [...bone.children]);
    });
  }

  /**
   * Aplica una pose al esqueleto
   */
  applyPose(pose: Pose): void {
    pose.transforms.forEach((transform, boneId) => {
      const bone = this.bones.get(boneId);
      if (bone) {
        bone.applyTransform(transform);
      }
    });

    this.updateWorldMatrices();
    this.emit('pose:applied', { skeleton: this, pose });
  }

  /**
   * Resetea a la pose de bind
   */
  resetToBindPose(): void {
    this.bones.forEach(bone => {
      bone.resetToBindPose();
    });

    this.updateWorldMatrices();
  }

  /**
   * Aplica IK a una cadena de huesos
   */
  applyIK(chain: IKChain): void {
    if (!chain.enabled) return;

    const bones = chain.bones.map(id => this.bones.get(id)).filter(Boolean) as Bone[];
    if (bones.length === 0) return;

    // Implementación de FABRIK (Forward And Backward Reaching Inverse Kinematics)
    this._applyFABRIK(bones, chain.target, chain.iterations, chain.tolerance);

    this.updateWorldMatrices();
    this.emit('ik:applied', { skeleton: this, chain, target: chain.target });
  }

  /**
   * Aplica algoritmo FABRIK
   */
  private _applyFABRIK(bones: Bone[], target: Vector3, iterations: number, tolerance: number): void {
    const positions: Vector3[] = bones.map(bone => bone.transform.position.clone());
    const lengths: number[] = bones.map(bone => bone.length);

    for (let i = 0; i < iterations; i++) {
      // Forward reaching
      positions[positions.length - 1] = target.clone();
      
      for (let j = positions.length - 2; j >= 0; j--) {
        const direction = positions[j + 1].clone().sub(positions[j]).normalize();
        positions[j] = positions[j + 1].clone().sub(direction.multiplyScalar(lengths[j]));
      }

      // Backward reaching
      positions[0] = bones[0].transform.position.clone();
      
      for (let j = 1; j < positions.length; j++) {
        const direction = positions[j].clone().sub(positions[j - 1]).normalize();
        positions[j] = positions[j - 1].clone().add(direction.multiplyScalar(lengths[j - 1]));
      }

      // Verificar convergencia
      const distance = positions[positions.length - 1].distanceTo(target);
      if (distance < tolerance) break;
    }

    // Aplicar posiciones a los huesos
    bones.forEach((bone, index) => {
      if (index < positions.length) {
        const newPosition = positions[index];
        const direction = newPosition.clone().sub(bone.transform.position).normalize();
        
        // Calcular rotación basada en la dirección
        const up = new Vector3(0, 1, 0);
        const rotation = new Quaternion().setFromUnitVectors(up, direction);
        
        bone.applyTransform({
          position: newPosition,
          rotation: rotation
        });
      }
    });
  }

  /**
   * Aplica restricciones
   */
  applyConstraints(): void {
    this._constraints.forEach(constraint => {
      if (!constraint.enabled) return;

      const bone = this.bones.get(constraint.boneId);
      if (!bone) return;

      switch (constraint.type) {
        case ConstraintType.LOOK_AT:
          this._applyLookAtConstraint(bone, constraint);
          break;
        case ConstraintType.POINT:
          this._applyPointConstraint(bone, constraint);
          break;
        case ConstraintType.ORIENT:
          this._applyOrientConstraint(bone, constraint);
          break;
        case ConstraintType.POSITION:
          this._applyPositionConstraint(bone, constraint);
          break;
        case ConstraintType.SCALE:
          this._applyScaleConstraint(bone, constraint);
          break;
        case ConstraintType.ROTATION_LIMIT:
          this._applyRotationLimitConstraint(bone, constraint);
          break;
        case ConstraintType.POSITION_LIMIT:
          this._applyPositionLimitConstraint(bone, constraint);
          break;
        case ConstraintType.SCALE_LIMIT:
          this._applyScaleLimitConstraint(bone, constraint);
          break;
      }
    });
  }

  /**
   * Aplica restricción Look At
   */
  private _applyLookAtConstraint(bone: Bone, constraint: Constraint): void {
    const targetId = constraint.parameters.targetId;
    if (!targetId) return;

    const targetBone = this.bones.get(targetId);
    if (!targetBone) return;

    const direction = targetBone.transform.position.clone().sub(bone.transform.position).normalize();
    const up = new Vector3(0, 1, 0);
    const rotation = new Quaternion().setFromUnitVectors(up, direction);

    bone.applyTransform({ rotation });
  }

  /**
   * Aplica restricción Point
   */
  private _applyPointConstraint(bone: Bone, constraint: Constraint): void {
    const targetId = constraint.parameters.targetId;
    if (!targetId) return;

    const targetBone = this.bones.get(targetId);
    if (!targetBone) return;

    const weight = constraint.parameters.weight || 1.0;
    const newPosition = bone.transform.position.clone().lerp(targetBone.transform.position, weight);

    bone.applyTransform({ position: newPosition });
  }

  /**
   * Aplica restricción Orient
   */
  private _applyOrientConstraint(bone: Bone, constraint: Constraint): void {
    const targetId = constraint.parameters.targetId;
    if (!targetId) return;

    const targetBone = this.bones.get(targetId);
    if (!targetBone) return;

    const weight = constraint.parameters.weight || 1.0;
    const newRotation = bone.transform.rotation.clone().slerp(targetBone.transform.rotation, weight);

    bone.applyTransform({ rotation: newRotation });
  }

  /**
   * Aplica restricción Position
   */
  private _applyPositionConstraint(bone: Bone, constraint: Constraint): void {
    const target = constraint.parameters.target;
    if (!target) return;

    const weight = constraint.parameters.weight || 1.0;
    const newPosition = bone.transform.position.clone().lerp(target, weight);

    bone.applyTransform({ position: newPosition });
  }

  /**
   * Aplica restricción Scale
   */
  private _applyScaleConstraint(bone: Bone, constraint: Constraint): void {
    const target = constraint.parameters.target;
    if (!target) return;

    const weight = constraint.parameters.weight || 1.0;
    const newScale = bone.transform.scale.clone().lerp(target, weight);

    bone.applyTransform({ scale: newScale });
  }

  /**
   * Aplica restricción de límite de rotación
   */
  private _applyRotationLimitConstraint(bone: Bone, constraint: Constraint): void {
    const min = constraint.parameters.min;
    const max = constraint.parameters.max;
    
    if (!min || !max) return;

    // Convertir quaternion a euler manualmente
    const rotation = bone.transform.rotation;
    const euler = new Vector3();
    
    // Extraer euler angles del quaternion
    const x = rotation.x;
    const y = rotation.y;
    const z = rotation.z;
    const w = rotation.w;
    
    euler.x = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
    euler.y = Math.asin(2 * (w * y - z * x));
    euler.z = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));

    euler.x = Math.max(min.x, Math.min(max.x, euler.x));
    euler.y = Math.max(min.y, Math.min(max.y, euler.y));
    euler.z = Math.max(min.z, Math.min(max.z, euler.z));

    const newRotation = new Quaternion().setFromEuler(euler);
    bone.applyTransform({ rotation: newRotation });
  }

  /**
   * Aplica restricción de límite de posición
   */
  private _applyPositionLimitConstraint(bone: Bone, constraint: Constraint): void {
    const min = constraint.parameters.min;
    const max = constraint.parameters.max;
    
    if (!min || !max) return;

    const newPosition = bone.transform.position.clone();
    newPosition.x = Math.max(min.x, Math.min(max.x, newPosition.x));
    newPosition.y = Math.max(min.y, Math.min(max.y, newPosition.y));
    newPosition.z = Math.max(min.z, Math.min(max.z, newPosition.z));

    bone.applyTransform({ position: newPosition });
  }

  /**
   * Aplica restricción de límite de escala
   */
  private _applyScaleLimitConstraint(bone: Bone, constraint: Constraint): void {
    const min = constraint.parameters.min;
    const max = constraint.parameters.max;
    
    if (!min || !max) return;

    const newScale = bone.transform.scale.clone();
    newScale.x = Math.max(min.x, Math.min(max.x, newScale.x));
    newScale.y = Math.max(min.y, Math.min(max.y, newScale.y));
    newScale.z = Math.max(min.z, Math.min(max.z, newScale.z));

    bone.applyTransform({ scale: newScale });
  }

  /**
   * Agrega una restricción
   */
  addConstraint(constraint: Constraint): void {
    this._constraints.set(constraint.id, constraint);
    this.emit('constraint:applied', { skeleton: this, constraint });
  }

  /**
   * Remueve una restricción
   */
  removeConstraint(constraintId: string): void {
    this._constraints.delete(constraintId);
  }

  /**
   * Agrega una cadena IK
   */
  addIKChain(chain: IKChain): void {
    this._ikChains.set(chain.id, chain);
  }

  /**
   * Remueve una cadena IK
   */
  removeIKChain(chainId: string): void {
    this._ikChains.delete(chainId);
  }

  /**
   * Guarda una pose
   */
  savePose(name: string): Pose {
    const transforms = new Map<string, Transform>();
    
    this.bones.forEach(bone => {
      transforms.set(bone.id, { ...bone.transform });
    });

    const pose: Pose = {
      id: `pose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      transforms
    };

    this._poses.set(pose.id, pose);
    return pose;
  }

  /**
   * Obtiene una pose por nombre
   */
  getPose(name: string): Pose | null {
    for (const pose of this._poses.values()) {
      if (pose.name === name) return pose;
    }
    return null;
  }

  /**
   * Serializa el esqueleto
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      metadata: this.metadata,
      bones: Array.from(this.bones.values()).map(bone => ({
        id: bone.id,
        name: bone.name,
        parent: bone.parent,
        children: bone.children,
        transform: bone.transform,
        bindPose: bone.bindPose,
        length: bone.length,
        enabled: bone.enabled,
        visible: bone.visible,
        color: bone.color,
        metadata: bone.metadata
      })),
      rootBones: this.rootBones,
      constraints: Array.from(this._constraints.values()),
      ikChains: Array.from(this._ikChains.values()),
      poses: Array.from(this._poses.values())
    };
  }

  /**
   * Deserializa un esqueleto
   */
  static deserialize(data: any): Skeleton {
    const skeleton = new Skeleton({
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      author: data.author,
      metadata: data.metadata
    });

    // Agregar huesos
    data.bones.forEach((boneData: any) => {
      const bone = new Bone(boneData);
      skeleton.addBone(bone);
    });

    // Agregar restricciones
    data.constraints?.forEach((constraintData: any) => {
      skeleton.addConstraint(constraintData);
    });

    // Agregar cadenas IK
    data.ikChains?.forEach((chainData: any) => {
      skeleton.addIKChain(chainData);
    });

    // Agregar poses
    data.poses?.forEach((poseData: any) => {
      skeleton._poses.set(poseData.id, poseData);
    });

    return skeleton;
  }

  // Getters
  get boneCount(): number { return this.bones.size; }
  get rootBoneCount(): number { return this.rootBones.length; }
  get constraints(): Map<string, Constraint> { return this._constraints; }
  get ikChains(): Map<string, IKChain> { return this._ikChains; }
  get poses(): Map<string, Pose> { return this._poses; }
  get worldMatrices(): Map<string, Matrix4> { return this._worldMatrices; }
}
