/**
 * Tests para Skeleton
 */

import { Skeleton, Bone, SkeletonConfig, Transform, ConstraintType } from '../Skeleton';
import { Vector3 } from '../../scene/math/Vector3';
import { Quaternion } from '../../scene/math/Quaternion';

describe('Skeleton', () => {
  let skeleton: Skeleton;
  let config: SkeletonConfig;

  beforeEach(() => {
    config = {
      id: 'test-skeleton',
      name: 'Test Skeleton',
      description: 'Test skeleton for unit tests',
      version: '1.0.0',
      author: 'Test Author',
      metadata: {
        category: 'humanoid',
        boneCount: 0,
        height: 1.8,
        scale: 1.0,
        units: 'meters',
        optimized: false
      }
    };

    skeleton = new Skeleton(config);
  });

  describe('Constructor', () => {
    it('should create Skeleton instance', () => {
      expect(skeleton).toBeInstanceOf(Skeleton);
      expect(skeleton.id).toBe('test-skeleton');
      expect(skeleton.name).toBe('Test Skeleton');
      expect(skeleton.description).toBe('Test skeleton for unit tests');
      expect(skeleton.version).toBe('1.0.0');
      expect(skeleton.author).toBe('Test Author');
      expect(skeleton.boneCount).toBe(0);
      expect(skeleton.enabled).toBe(true);
    });
  });

  describe('Bone Management', () => {
    it('should add bone', () => {
      const boneConfig = {
        id: 'root-bone',
        name: 'Root Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const bone = new Bone(boneConfig);
      skeleton.addBone(bone);

      expect(skeleton.boneCount).toBe(1);
      expect(skeleton.getBone('root-bone')).toBe(bone);
      expect(skeleton.getBoneByName('Root Bone')).toBe(bone);
      expect(skeleton.rootBones).toContain('root-bone');
    });

    it('should remove bone', () => {
      const boneConfig = {
        id: 'root-bone',
        name: 'Root Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const bone = new Bone(boneConfig);
      skeleton.addBone(bone);
      skeleton.removeBone('root-bone');

      expect(skeleton.boneCount).toBe(0);
      expect(skeleton.getBone('root-bone')).toBeNull();
      expect(skeleton.rootBones).not.toContain('root-bone');
    });

    it('should handle bone hierarchy', () => {
      const rootBoneConfig = {
        id: 'root-bone',
        name: 'Root Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const childBoneConfig = {
        id: 'child-bone',
        name: 'Child Bone',
        parent: 'root-bone',
        transform: {
          position: new Vector3(0, 1, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 1, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 0.5,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const rootBone = new Bone(rootBoneConfig);
      const childBone = new Bone(childBoneConfig);

      skeleton.addBone(rootBone);
      skeleton.addBone(childBone);

      expect(skeleton.boneCount).toBe(2);
      expect(skeleton.rootBones).toContain('root-bone');
      expect(skeleton.rootBones).not.toContain('child-bone');
      expect(rootBone.children).toContain('child-bone');
      expect(childBone.parent).toBe('root-bone');
    });
  });

  describe('Bone Transformations', () => {
    let bone: Bone;

    beforeEach(() => {
      const boneConfig = {
        id: 'test-bone',
        name: 'Test Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      bone = new Bone(boneConfig);
      skeleton.addBone(bone);
    });

    it('should update bone transform', () => {
      const newTransform: Transform = {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
        scale: new Vector3(2, 2, 2)
      };

      skeleton.updateBone('test-bone', newTransform);

      expect(bone.transform.position.equals(newTransform.position)).toBe(true);
      expect(bone.transform.rotation.equals(newTransform.rotation)).toBe(true);
      expect(bone.transform.scale.equals(newTransform.scale)).toBe(true);
    });

    it('should reset bone to bind pose', () => {
      const newTransform: Transform = {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
        scale: new Vector3(2, 2, 2)
      };

      skeleton.updateBone('test-bone', newTransform);
      bone.resetToBindPose();

      expect(bone.transform.position.equals(bone.bindPose.position)).toBe(true);
      expect(bone.transform.rotation.equals(bone.bindPose.rotation)).toBe(true);
      expect(bone.transform.scale.equals(bone.bindPose.scale)).toBe(true);
    });

    it('should update world matrices', () => {
      skeleton.updateWorldMatrices();

      expect(skeleton.worldMatrices.has('test-bone')).toBe(true);
      expect(skeleton.worldMatrices.get('test-bone')).toBeInstanceOf(Matrix4);
    });
  });

  describe('Pose Management', () => {
    let bone: Bone;

    beforeEach(() => {
      const boneConfig = {
        id: 'test-bone',
        name: 'Test Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      bone = new Bone(boneConfig);
      skeleton.addBone(bone);
    });

    it('should save pose', () => {
      const pose = skeleton.savePose('test-pose');

      expect(pose.name).toBe('test-pose');
      expect(pose.transforms.has('test-bone')).toBe(true);
      expect(skeleton.poses.has(pose.id)).toBe(true);
    });

    it('should apply pose', () => {
      const newTransform: Transform = {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
        scale: new Vector3(2, 2, 2)
      };

      skeleton.updateBone('test-bone', newTransform);
      const pose = skeleton.savePose('test-pose');

      // Reset bone
      bone.resetToBindPose();

      // Apply pose
      skeleton.applyPose(pose);

      expect(bone.transform.position.equals(newTransform.position)).toBe(true);
      expect(bone.transform.rotation.equals(newTransform.rotation)).toBe(true);
      expect(bone.transform.scale.equals(newTransform.scale)).toBe(true);
    });

    it('should reset to bind pose', () => {
      const newTransform: Transform = {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
        scale: new Vector3(2, 2, 2)
      };

      skeleton.updateBone('test-bone', newTransform);
      skeleton.resetToBindPose();

      expect(bone.transform.position.equals(bone.bindPose.position)).toBe(true);
      expect(bone.transform.rotation.equals(bone.bindPose.rotation)).toBe(true);
      expect(bone.transform.scale.equals(bone.bindPose.scale)).toBe(true);
    });
  });

  describe('IK System', () => {
    let rootBone: Bone;
    let middleBone: Bone;
    let endBone: Bone;

    beforeEach(() => {
      const rootBoneConfig = {
        id: 'root-bone',
        name: 'Root Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const middleBoneConfig = {
        id: 'middle-bone',
        name: 'Middle Bone',
        parent: 'root-bone',
        transform: {
          position: new Vector3(0, 1, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 1, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const endBoneConfig = {
        id: 'end-bone',
        name: 'End Bone',
        parent: 'middle-bone',
        transform: {
          position: new Vector3(0, 2, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 2, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 0.5,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      rootBone = new Bone(rootBoneConfig);
      middleBone = new Bone(middleBoneConfig);
      endBone = new Bone(endBoneConfig);

      skeleton.addBone(rootBone);
      skeleton.addBone(middleBone);
      skeleton.addBone(endBone);
    });

    it('should apply IK chain', () => {
      const ikChain = {
        id: 'test-ik',
        name: 'Test IK',
        bones: ['root-bone', 'middle-bone', 'end-bone'],
        target: new Vector3(2, 0, 0),
        iterations: 10,
        tolerance: 0.01,
        enabled: true
      };

      skeleton.addIKChain(ikChain);
      skeleton.applyIK(ikChain);

      // Verify that bones have been moved
      expect(rootBone.transform.position.x).not.toBe(0);
      expect(middleBone.transform.position.x).not.toBe(0);
      expect(endBone.transform.position.x).toBeCloseTo(2, 1);
    });
  });

  describe('Constraints', () => {
    let bone1: Bone;
    let bone2: Bone;

    beforeEach(() => {
      const bone1Config = {
        id: 'bone1',
        name: 'Bone 1',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const bone2Config = {
        id: 'bone2',
        name: 'Bone 2',
        parent: null,
        transform: {
          position: new Vector3(1, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(1, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      bone1 = new Bone(bone1Config);
      bone2 = new Bone(bone2Config);

      skeleton.addBone(bone1);
      skeleton.addBone(bone2);
    });

    it('should add constraint', () => {
      const constraint = {
        id: 'test-constraint',
        name: 'Test Constraint',
        type: ConstraintType.LOOK_AT,
        boneId: 'bone1',
        targetId: 'bone2',
        parameters: {},
        enabled: true
      };

      skeleton.addConstraint(constraint);

      expect(skeleton.constraints.has('test-constraint')).toBe(true);
      expect(skeleton.constraints.get('test-constraint')).toBe(constraint);
    });

    it('should apply constraints', () => {
      const constraint = {
        id: 'test-constraint',
        name: 'Test Constraint',
        type: ConstraintType.LOOK_AT,
        boneId: 'bone1',
        targetId: 'bone2',
        parameters: {},
        enabled: true
      };

      skeleton.addConstraint(constraint);
      skeleton.applyConstraints();

      // Verify that bone1 is looking at bone2
      const direction = bone2.transform.position.clone().sub(bone1.transform.position).normalize();
      const bone1Direction = bone1.getDirection();
      
      expect(bone1Direction.dot(direction)).toBeGreaterThan(0.9);
    });

    it('should remove constraint', () => {
      const constraint = {
        id: 'test-constraint',
        name: 'Test Constraint',
        type: ConstraintType.LOOK_AT,
        boneId: 'bone1',
        targetId: 'bone2',
        parameters: {},
        enabled: true
      };

      skeleton.addConstraint(constraint);
      skeleton.removeConstraint('test-constraint');

      expect(skeleton.constraints.has('test-constraint')).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize skeleton', () => {
      const boneConfig = {
        id: 'test-bone',
        name: 'Test Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const bone = new Bone(boneConfig);
      skeleton.addBone(bone);

      const serialized = skeleton.serialize();

      expect(serialized).toHaveProperty('id', 'test-skeleton');
      expect(serialized).toHaveProperty('name', 'Test Skeleton');
      expect(serialized).toHaveProperty('bones');
      expect(serialized.bones).toHaveLength(1);
      expect(serialized.bones[0].id).toBe('test-bone');
    });

    it('should deserialize skeleton', () => {
      const boneConfig = {
        id: 'test-bone',
        name: 'Test Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const bone = new Bone(boneConfig);
      skeleton.addBone(bone);

      const serialized = skeleton.serialize();
      const deserialized = Skeleton.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(Skeleton);
      expect(deserialized.id).toBe('test-skeleton');
      expect(deserialized.name).toBe('Test Skeleton');
      expect(deserialized.boneCount).toBe(1);
      expect(deserialized.getBone('test-bone')).toBeDefined();
    });
  });
});

describe('Bone', () => {
  describe('Constructor', () => {
    it('should create Bone instance', () => {
      const config = {
        id: 'test-bone',
        name: 'Test Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      const bone = new Bone(config);

      expect(bone).toBeInstanceOf(Bone);
      expect(bone.id).toBe('test-bone');
      expect(bone.name).toBe('Test Bone');
      expect(bone.parent).toBe(null);
      expect(bone.length).toBe(1.0);
      expect(bone.enabled).toBe(true);
      expect(bone.visible).toBe(true);
      expect(bone.color).toBe('#ffffff');
    });
  });

  describe('Bone Transformations', () => {
    let bone: Bone;

    beforeEach(() => {
      const config = {
        id: 'test-bone',
        name: 'Test Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      };

      bone = new Bone(config);
    });

    it('should update matrices', () => {
      bone.updateMatrices();

      expect(bone.localMatrix).toBeInstanceOf(Matrix4);
      expect(bone.inverseBindMatrix).toBeInstanceOf(Matrix4);
    });

    it('should update world matrix', () => {
      const parentMatrix = new Matrix4().makeTranslation(1, 0, 0);
      bone.updateWorldMatrix(parentMatrix);

      expect(bone.worldMatrix).toBeInstanceOf(Matrix4);
    });

    it('should get world transform', () => {
      const worldTransform = bone.getWorldTransform();

      expect(worldTransform).toHaveProperty('position');
      expect(worldTransform).toHaveProperty('rotation');
      expect(worldTransform).toHaveProperty('scale');
      expect(worldTransform.position).toBeInstanceOf(Vector3);
      expect(worldTransform.rotation).toBeInstanceOf(Quaternion);
      expect(worldTransform.scale).toBeInstanceOf(Vector3);
    });

    it('should apply transform', () => {
      const newTransform = {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
        scale: new Vector3(2, 2, 2)
      };

      bone.applyTransform(newTransform);

      expect(bone.transform.position.equals(newTransform.position)).toBe(true);
      expect(bone.transform.rotation.equals(newTransform.rotation)).toBe(true);
      expect(bone.transform.scale.equals(newTransform.scale)).toBe(true);
    });

    it('should get direction', () => {
      const direction = bone.getDirection();

      expect(direction).toBeInstanceOf(Vector3);
      expect(direction.length()).toBeCloseTo(1, 5);
    });

    it('should get end point', () => {
      const endPoint = bone.getEndPoint();

      expect(endPoint).toBeInstanceOf(Vector3);
      expect(endPoint.y).toBe(1.0); // Bone points up by default
    });

    it('should calculate distance to other bone', () => {
      const otherBone = new Bone({
        id: 'other-bone',
        name: 'Other Bone',
        parent: null,
        transform: {
          position: new Vector3(1, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(1, 0, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      });

      const distance = bone.distanceTo(otherBone);

      expect(distance).toBe(1.0);
    });

    it('should calculate angle to other bone', () => {
      const otherBone = new Bone({
        id: 'other-bone',
        name: 'Other Bone',
        parent: null,
        transform: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2),
          scale: new Vector3(1, 1, 1)
        },
        bindPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2),
          scale: new Vector3(1, 1, 1)
        },
        length: 1.0,
        enabled: true,
        visible: true,
        color: '#ffffff'
      });

      const angle = bone.angleTo(otherBone);

      expect(angle).toBeCloseTo(Math.PI / 2, 2);
    });
  });
}); 