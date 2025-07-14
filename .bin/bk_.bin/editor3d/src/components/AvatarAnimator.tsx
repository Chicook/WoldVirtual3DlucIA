import React, { useState } from 'react';

interface AvatarAnimation {
  id: string;
  name: string;
  duration: number;
  keyframes: Keyframe[];
}

interface Keyframe {
  id: string;
  frame: number;
  boneName: string;
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

const AvatarAnimator: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('user-avatar-1');
  const [currentAnimation, setCurrentAnimation] = useState<AvatarAnimation | null>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBone, setSelectedBone] = useState<string>('');

  const avatars = [
    { id: 'user-avatar-1', name: 'Avatar Usuario 1', type: 'ready-player-me' },
    { id: 'user-avatar-2', name: 'Avatar Usuario 2', type: 'ready-player-me' },
    { id: 'user-avatar-3', name: 'Avatar Usuario 3', type: 'ready-player-me' }
  ];

  const bones = [
    { name: 'Hips', parent: null },
    { name: 'Spine', parent: 'Hips' },
    { name: 'Chest', parent: 'Spine' },
    { name: 'Neck', parent: 'Chest' },
    { name: 'Head', parent: 'Neck' },
    { name: 'LeftShoulder', parent: 'Chest' },
    { name: 'LeftArm', parent: 'LeftShoulder' },
    { name: 'LeftForeArm', parent: 'LeftArm' },
    { name: 'LeftHand', parent: 'LeftForeArm' },
    { name: 'RightShoulder', parent: 'Chest' },
    { name: 'RightArm', parent: 'RightShoulder' },
    { name: 'RightForeArm', parent: 'RightArm' },
    { name: 'RightHand', parent: 'RightForeArm' },
    { name: 'LeftUpLeg', parent: 'Hips' },
    { name: 'LeftLeg', parent: 'LeftUpLeg' },
    { name: 'LeftFoot', parent: 'LeftLeg' },
    { name: 'RightUpLeg', parent: 'Hips' },
    { name: 'RightLeg', parent: 'RightUpLeg' },
    { name: 'RightFoot', parent: 'RightLeg' }
  ];

  const createNewAnimation = () => {
    const newAnimation: AvatarAnimation = {
      id: `anim_${Date.now()}`,
      name: 'Nueva Animación',
      duration: 60,
      keyframes: []
    };
    setCurrentAnimation(newAnimation);
  };

  const addKeyframe = () => {
    if (!currentAnimation || !selectedBone) return;

    const newKeyframe: Keyframe = {
      id: `key_${Date.now()}`,
      frame: currentFrame,
      boneName: selectedBone,
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };

    setCurrentAnimation({
      ...currentAnimation,
      keyframes: [...currentAnimation.keyframes, newKeyframe]
    });
  };

  const saveAnimation = () => {
    if (!currentAnimation) return;
    
    // TODO: Guardar animación en el sistema
    console.log('Guardando animación:', currentAnimation);
    alert('Animación guardada. Se aplicará al avatar en el metaverso.');
  };

  return (
    <div style={{ 
      height: '100%',
      background: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        height: '30px', 
        background: '#252525',
        borderBottom: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: '11px'
      }}>
        <span style={{ color: '#ccc', marginRight: '8px' }}>Avatar Animator</span>
        
        <select
          value={selectedAvatar}
          onChange={(e) => setSelectedAvatar(e.target.value)}
          style={{
            padding: '2px 6px',
            background: '#333',
            border: '1px solid #555',
            color: '#ccc',
            fontSize: '10px',
            marginRight: '8px'
          }}
        >
          {avatars.map(avatar => (
            <option key={avatar.id} value={avatar.id}>
              {avatar.name}
            </option>
          ))}
        </select>

        <button 
          onClick={createNewAnimation}
          style={{
            padding: '2px 8px',
            background: '#28a745',
            color: '#fff',
            border: '1px solid #1e7e34',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px',
            marginRight: '8px'
          }}
        >
          + Nueva Animación
        </button>

        <button 
          onClick={saveAnimation}
          style={{
            padding: '2px 8px',
            background: '#17a2b8',
            color: '#fff',
            border: '1px solid #138496',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          💾 Guardar
        </button>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Bones */}
        <div style={{ 
          width: '200px', 
          background: '#252525',
          borderRight: '1px solid #404040',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '8px',
            borderBottom: '1px solid #404040',
            fontSize: '11px',
            color: '#ccc'
          }}>
            Bones
          </div>
          
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '4px'
          }}>
            {bones.map(bone => (
              <div
                key={bone.name}
                onClick={() => setSelectedBone(bone.name)}
                style={{
                  padding: '4px 8px',
                  background: selectedBone === bone.name ? '#007acc' : 'transparent',
                  color: selectedBone === bone.name ? '#fff' : '#ccc',
                  cursor: 'pointer',
                  fontSize: '10px',
                  borderBottom: '1px solid #333'
                }}
              >
                {bone.name}
              </div>
            ))}
          </div>
        </div>

        {/* Center - Timeline */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: '#2b2b2b'
        }}>
          {/* Timeline Controls */}
          <div style={{ 
            height: '30px', 
            background: '#252525',
            borderBottom: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: '8px'
          }}>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: '2px 6px',
                background: '#333',
                color: '#ccc',
                border: '1px solid #555',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            
            <span style={{ color: '#ccc', fontSize: '10px' }}>Frame:</span>
            <input
              type="number"
              value={currentFrame}
              onChange={(e) => setCurrentFrame(parseInt(e.target.value) || 1)}
              style={{
                width: '50px',
                padding: '2px 4px',
                background: '#333',
                border: '1px solid #555',
                color: '#ccc',
                fontSize: '10px'
              }}
            />
            
            <button 
              onClick={addKeyframe}
              style={{
                padding: '2px 6px',
                background: '#ffc107',
                color: '#000',
                border: '1px solid #e0a800',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              + Keyframe
            </button>
          </div>

          {/* Timeline */}
          <div style={{ 
            flex: 1,
            background: '#2b2b2b',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Timeline Grid */}
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(90deg, #333 1px, transparent 1px),
                linear-gradient(#333 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
            
            {/* Current Frame Indicator */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(currentFrame / 60) * 100}%`,
              width: '2px',
              background: '#ff6b6b',
              zIndex: 10
            }} />
            
            {/* Keyframes */}
            {currentAnimation?.keyframes.map(keyframe => (
              <div
                key={keyframe.id}
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: `${(keyframe.frame / 60) * 100}%`,
                  width: '8px',
                  height: '8px',
                  background: '#ffd93d',
                  borderRadius: '50%',
                  border: '1px solid #fff',
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div style={{ 
          width: '250px', 
          background: '#252525',
          borderLeft: '1px solid #404040',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '8px',
            borderBottom: '1px solid #404040',
            fontSize: '11px',
            color: '#ccc'
          }}>
            Properties
          </div>
          
          <div style={{ 
            flex: 1,
            padding: '8px',
            fontSize: '10px'
          }}>
            {selectedBone && (
              <div>
                <div style={{ color: '#ccc', marginBottom: '8px' }}>
                  Bone: {selectedBone}
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>
                    Rotation X
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    defaultValue="0"
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>
                    Rotation Y
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    defaultValue="0"
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>
                    Rotation Z
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    defaultValue="0"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarAnimator; 