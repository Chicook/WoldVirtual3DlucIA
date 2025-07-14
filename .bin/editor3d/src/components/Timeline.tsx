import React, { useState } from 'react';

const Timeline: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [totalFrames, setTotalFrames] = useState(250);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ 
      height: '100%',
      background: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Timeline Header */}
      <div style={{ 
        height: '30px', 
        background: '#252525',
        borderBottom: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: '11px'
      }}>
        <span style={{ color: '#ccc', marginRight: '8px' }}>Timeline</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
          <button 
            style={{
              padding: '2px 6px',
              background: '#333',
              color: '#ccc',
              border: '1px solid #555',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            ⏮
          </button>
          <button 
            style={{
              padding: '2px 6px',
              background: '#333',
              color: '#ccc',
              border: '1px solid #555',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            ⏭
          </button>
        </div>
        
        <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ccc' }}>Frame:</span>
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
          <span style={{ color: '#666' }}>/ {totalFrames}</span>
        </div>
        
        <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ccc' }}>FPS:</span>
          <input
            type="number"
            defaultValue={24}
            style={{
              width: '40px',
              padding: '2px 4px',
              background: '#333',
              border: '1px solid #555',
              color: '#ccc',
              fontSize: '10px'
            }}
          />
        </div>
      </div>
      
      {/* Timeline Content */}
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
          left: `${(currentFrame / totalFrames) * 100}%`,
          width: '2px',
          background: '#ff6b6b',
          zIndex: 10
        }} />
        
        {/* Keyframes (example) */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50px',
          width: '8px',
          height: '8px',
          background: '#ffd93d',
          borderRadius: '50%',
          border: '1px solid #fff'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '120px',
          width: '8px',
          height: '8px',
          background: '#ffd93d',
          borderRadius: '50%',
          border: '1px solid #fff'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '200px',
          width: '8px',
          height: '8px',
          background: '#ffd93d',
          borderRadius: '50%',
          border: '1px solid #fff'
        }} />
      </div>
      
      {/* Timeline Footer */}
      <div style={{ 
        height: '20px', 
        background: '#252525',
        borderTop: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: '10px',
        color: '#666'
      }}>
        <span>Selected: Cube</span>
        <div style={{ flex: 1 }} />
        <span>Duration: 10.4s</span>
      </div>
    </div>
  );
};

export default Timeline; 