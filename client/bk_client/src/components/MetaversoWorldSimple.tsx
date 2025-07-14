import React, { useState, useEffect, useRef } from 'react';
import MetaversoControls from './MetaversoControls';
// AvatarType import removed - not used in current implementation

interface MetaversoWorldSimpleProps {
  avatarUrl: string;
  walletAddress: string;
}

// Componente de avatar simple sin Three.js
const SimpleAvatar: React.FC<{ url: string | null; position: [number, number]; moving: boolean }> = ({ 
  url, 
  position, 
  moving 
}) => {
  const [imageError, setImageError] = useState(false);

  // Si no hay url o hay error, mostrar fallback
  if (!url || imageError) {
    return (
      <div 
        className="simple-avatar-fallback"
        style={{
          position: 'absolute',
          left: position[0],
          top: position[1],
          width: '60px',
          height: '60px',
          backgroundColor: '#667eea',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: moving ? 'bounce 0.5s infinite alternate' : 'none',
          zIndex: 10
        }}
      >
        👤
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Avatar"
      onError={() => setImageError(true)}
      style={{
        position: 'absolute',
        left: position[0],
        top: position[1],
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #667eea',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: moving ? 'bounce 0.5s infinite alternate' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 10
      }}
    />
  );
};

// Componente principal del metaverso simplificado
export const MetaversoWorldSimple: React.FC<MetaversoWorldSimpleProps> = ({ 
  avatarUrl, 
  walletAddress 
}) => {
  // Log para depuración
  console.log('MetaversoWorldSimple avatarUrl:', avatarUrl, 'walletAddress:', walletAddress);

  const [position, setPosition] = useState<[number, number]>([50, 80]);
  const [moving, setMoving] = useState(false);
  const [currentAvatarType, setCurrentAvatarType] = useState<string>('custom');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generar partículas flotantes
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));
    setParticles(newParticles);
  }, []);

  // Animación de partículas
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.x <= 0 || particle.x >= window.innerWidth ? -particle.vx : particle.vx,
        vy: particle.y <= 0 || particle.y >= window.innerHeight ? -particle.vy : particle.vy
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Sistema de movimiento
  useEffect(() => {
    const keys = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      setMoving(true);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
      if (keys.size === 0) {
        setMoving(false);
      }
    };

    const movePlayer = () => {
      const speed = 5;
      let newX = position[0];
      let newY = position[1];

      if (keys.has('w') || keys.has('arrowup')) newY -= speed;
      if (keys.has('s') || keys.has('arrowdown')) newY += speed;
      if (keys.has('a') || keys.has('arrowleft')) newX -= speed;
      if (keys.has('d') || keys.has('arrowright')) newX += speed;

      // Límites del mundo
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));

      setPosition([newX, newY]);
    };

    const gameLoop = setInterval(movePlayer, 16);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position]);

  const handleAvatarTypeChange = (type: string) => {
    setCurrentAvatarType(type);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  // Si no hay avatarUrl, mostrar mensaje de error visible
  const showAvatarError = !avatarUrl || avatarUrl.trim() === '';

  return (
    <div 
      ref={containerRef}
      className="metaverso-container-simple"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Terreno simulado */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '200px',
          background: 'linear-gradient(to top, #4ade80, transparent)',
          opacity: 0.3,
          zIndex: 1
        }}
      />

      {/* Agua simulado */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '100px',
          background: 'linear-gradient(to top, #38bdf8, transparent)',
          opacity: 0.4,
          animation: 'wave 3s ease-in-out infinite',
          zIndex: 2
        }}
      />

      {/* Partículas flotantes */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: '4px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />
      ))}

      {/* Avatar */}
      <SimpleAvatar
        url={avatarUrl}
        position={position}
        moving={moving}
      />

      {/* Mensaje de error si no hay avatar */}
      {showAvatarError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '2rem',
            borderRadius: '1rem',
            zIndex: 100,
            fontSize: '1.2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <strong>⚠️ No se pudo cargar el avatar.</strong>
          <br />
          Por favor, vuelve a crear tu avatar o revisa tu conexión.
        </div>
      )}

      {/* Información del mundo */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '200px',
          zIndex: 20
        }}
      >
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: '#667eea' }}>
          🌍 Metaverso Web3
        </h3>
        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', opacity: 0.9 }}>
          📍 Posición: {Math.round(position[0])}, {Math.round(position[1])}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', opacity: 0.9 }}>
          🎮 Movimiento: {moving ? 'Activo' : 'Inactivo'}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', opacity: 0.9 }}>
          🎭 Avatar: {currentAvatarType}
        </p>
      </div>

      {/* Instrucciones */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '300px',
          zIndex: 20
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
          🎮 Controles
        </h4>
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
          <div>• WASD o Flechas: Mover</div>
          <div>• Configuración: Botón superior izquierdo</div>
        </div>
      </div>

      {/* Controles de interfaz */}
      <MetaversoControls
        onAvatarTypeChange={handleAvatarTypeChange}
        currentAvatarType={currentAvatarType}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleSound={handleToggleSound}
        isFullscreen={isFullscreen}
        isSoundEnabled={isSoundEnabled}
      />

      {/* Estilos CSS inline para animaciones */}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0px); }
          to { transform: translateY(-10px); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .metaverso-container-simple {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
    </div>
  );
};

export default MetaversoWorldSimple; 