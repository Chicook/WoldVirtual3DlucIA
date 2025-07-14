import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Eliminado
// import AvatarSelector, { AvatarType } from './avatar/AvatarSelector'; // Eliminado

interface MetaversoControlsProps {
  onAvatarTypeChange: (type: string) => void; // Ahora string
  currentAvatarType: string; // Ahora string
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  isFullscreen: boolean;
  isSoundEnabled: boolean;
}

const MetaversoControls: React.FC<MetaversoControlsProps> = ({
  // onAvatarTypeChange and currentAvatarType removed - not used in current implementation
  onToggleFullscreen,
  onToggleSound,
  isFullscreen,
  isSoundEnabled
}) => {
  const [showControls, setShowControls] = useState(true);

  return (
    <>
      {/* Botón de toggle de controles */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed top-4 left-4 z-40 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Panel de controles */}
      {showControls && (
        <div
          className="fixed top-4 left-16 z-30 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-4 min-w-64"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎮 Controles</h3>
          {/* Avatar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar Actual
            </label>
            <div className="w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  🎭 Personalizado
                </span>
              </div>
            </div>
          </div>

          {/* Controles de audio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio
            </label>
            <button
              onClick={onToggleSound}
              className={`w-full p-3 rounded-lg border transition-colors ${
                isSoundEnabled
                  ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                  : 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {isSoundEnabled ? '🔊 Sonido Activado' : '🔇 Sonido Desactivado'}
                </span>
              </div>
            </button>
          </div>

          {/* Controles de pantalla */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pantalla
            </label>
            <button
              onClick={onToggleFullscreen}
              className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {isFullscreen ? '⛶ Salir Pantalla Completa' : '⛶ Pantalla Completa'}
                </span>
              </div>
            </button>
          </div>

          {/* Instrucciones de movimiento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movimiento
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <div>• <strong>WASD</strong> o <strong>Flechas</strong>: Mover</div>
              <div>• <strong>Mouse</strong>: Rotar cámara</div>
              <div>• <strong>Scroll</strong>: Zoom</div>
            </div>
          </div>

          {/* Información del mundo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mundo
            </label>
            <div className="bg-purple-50 rounded-lg p-3 text-xs text-purple-800">
              <div>🌍 <strong>Metaverso Web3</strong></div>
              <div>📍 Isla Virtual</div>
              <div>🎮 Modo: Personalizado</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetaversoControls; 