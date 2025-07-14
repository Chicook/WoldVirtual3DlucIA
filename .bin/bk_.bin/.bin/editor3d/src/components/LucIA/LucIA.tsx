// LucIA comentado temporalmente

import React from 'react';

interface LucIAProps {
  position: [number, number, number];
  scale: number;
  onInteraction: (action: string, data: any) => void;
}

export const LucIA: React.FC<LucIAProps> = ({ position, scale, onInteraction }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '10px',
      border: '2px solid #ff69b4',
      color: '#fff',
      textAlign: 'center',
      zIndex: 1000
    }}>
      <h2>🤖 LucIA - Asistente de IA</h2>
      <p>Componente en desarrollo...</p>
      <button 
        onClick={() => onInteraction('test', { message: 'LucIA temporal' })}
        style={{
          padding: '10px 20px',
          background: '#ff69b4',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test LucIA
      </button>
    </div>
  );
};
