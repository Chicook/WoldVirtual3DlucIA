import React, { useState, useEffect } from 'react';
import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator';

interface AvatarCreatorRealProps {
  subdomain: string;
  isOpen: boolean;
  onClose: () => void;
  onAvatarExported: (url: string) => void;
}

const config: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'es'
};

const style = { 
  width: '100%', 
  height: '80vh', 
  border: 'none',
  borderRadius: '12px',
  backgroundColor: '#1a1a2e'
};

const AvatarCreatorReal: React.FC<AvatarCreatorRealProps> = ({
  subdomain,
  isOpen,
  onClose,
  onAvatarExported,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setIsReady(false);
      
      // Simular tiempo de carga
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsReady(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAvatarExported = (event: AvatarExportedEvent) => {
    try {
      if (event?.data?.url) {
        // Extraer el ID del avatar de la URL de imagen
        const url = event.data.url;
        const match = url.match(/\/([a-zA-Z0-9_-]+)\.(png|jpg|jpeg)$/);
        let glbUrl = '';
        if (match && match[1]) {
          // Construir la URL GLB
          glbUrl = url.replace(/\.(png|jpg|jpeg)$/, '.glb');
          console.log('Avatar GLB URL construida:', glbUrl);
        } else {
          // Si no se puede extraer, usar la URL original (fallback)
          glbUrl = url;
          console.warn('No se pudo extraer el ID del avatar, usando la URL original:', url);
        }
        onAvatarExported(glbUrl);
        onClose();
      } else {
        throw new Error('No URL received from avatar export');
      }
    } catch (err) {
      console.error('Error in avatar export:', err);
      setError('Error al exportar el avatar. Inténtalo de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎭 Creador de Avatar</h2>
            <p className="text-gray-600 mt-1">Personaliza tu avatar para el metaverso</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando creador de avatares...</p>
            </div>
          </div>
        )}

        {/* Avatar Creator */}
        {isReady && !error && (
          <div className="relative">
            <AvatarCreator
              subdomain={subdomain}
              config={config}
              style={style}
              onAvatarExported={handleAvatarExported}
            />
            
            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Instrucciones:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Usa el mouse para rotar y hacer zoom en tu avatar</li>
                <li>• Haz clic en las opciones para personalizar</li>
                <li>• Cuando estés listo, haz clic en "Exportar"</li>
                <li>• Tu avatar se guardará automáticamente</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Powered by <a href="https://readyplayer.me" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Ready Player Me</a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCreatorReal; 