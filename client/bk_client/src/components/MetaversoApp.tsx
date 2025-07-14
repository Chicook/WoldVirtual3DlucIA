import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// HomePage import removed - not used in current implementation
import AvatarSelector from './AvatarSelector';
import MetaversoWorld3D from './MetaversoWorld3D';
import { useWeb3 } from '../hooks/useWeb3';
import { useMetaverso } from '../contexts/MetaversoContext';
import { MetaversoProvider } from '../contexts/MetaversoContext';
import { Web3Provider } from '../contexts/Web3Context';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ui/ErrorFallback';
import { Toaster, toast } from 'react-hot-toast';

// Tipos avanzados para el componente
interface MetaversoAppState {
  isInitialized: boolean;
  currentStep: 'loading' | 'wallet' | 'avatar' | 'world';
  error: string | null;
}

// Componente principal avanzado con manejo de estados complejos
const MetaversoAppContent: React.FC = () => {
  const { isConnected, connect, account } = useWeb3();
  const { 
    // metaversoState removed - not used in current implementation
    isInitialized,
    isLoading,
    error,
    userAvatar,
    // currentWorld removed - not used in current implementation
    initializeMetaverso,
    // joinWorld removed - not used in current implementation
  } = useMetaverso();

  // Estado local avanzado con máquina de estados
  const [appState, setAppState] = useState<MetaversoAppState>({
    isInitialized: false,
    currentStep: 'loading',
    error: null
  });

  // Memoización de estados computados
  const canProceedToAvatar = useMemo(() => 
    isConnected && account && !isLoading, 
    [isConnected, account, isLoading]
  );

  const canProceedToWorld = useMemo(() => 
    canProceedToAvatar && userAvatar && isInitialized, 
    [canProceedToAvatar, userAvatar, isInitialized]
  );

  // Función avanzada de inicialización con manejo de errores
  const handleInitialization = useCallback(async (): Promise<void> => {
    try {
      setAppState(prev => ({ ...prev, currentStep: 'loading', error: null }));
      
      await initializeMetaverso();
      
      setAppState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        currentStep: 'wallet' 
      }));
      
      toast.success('Metaverso inicializado correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de inicialización';
      setAppState(prev => ({ 
        ...prev, 
        error: errorMessage,
        currentStep: 'loading' 
      }));
      toast.error(errorMessage);
    }
  }, [initializeMetaverso]);

  // Función avanzada de conexión de wallet
  const handleWalletConnection = useCallback(async (): Promise<void> => {
    try {
      setAppState(prev => ({ ...prev, error: null }));
      
      await connect();
      
      setAppState(prev => ({ 
        ...prev, 
        currentStep: 'avatar' 
      }));
      
      toast.success('Wallet conectada correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al conectar wallet';
      setAppState(prev => ({ 
        ...prev, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, [connect]);

  // Función avanzada de selección de avatar
  const handleAvatarSelected = useCallback(async (): Promise<void> => {
    try {
      setAppState(prev => ({ ...prev, error: null }));
      
      // Simulación de procesamiento de avatar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAppState(prev => ({ 
        ...prev, 
        currentStep: 'world' 
      }));
      
      toast.success('Avatar configurado correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al configurar avatar';
      setAppState(prev => ({ 
        ...prev, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, []);

  // handleWorldEntry function removed - not used in current implementation

  // Efecto de inicialización automática
  useEffect(() => {
    if (!appState.isInitialized) {
      handleInitialization();
    }
  }, [appState.isInitialized, handleInitialization]);

  // Efecto de manejo de errores globales
  useEffect(() => {
    if (error) {
      setAppState(prev => ({ ...prev, error }));
      toast.error(error);
    }
  }, [error]);

  // Renderizado condicional avanzado con estados
  const renderCurrentStep = (): React.ReactNode => {
    switch (appState.currentStep) {
      case 'loading':
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-white"></div>
            <p className="ml-4 text-lg text-white">Inicializando Metaverso...</p>
          </div>
        );

      case 'wallet':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Bienvenido al Metaverso</h1>
            {!isConnected ? (
              <button
                onClick={handleWalletConnection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Conectando...' : 'Conectar Wallet'}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-green-600 mb-4">✅ Wallet conectada</p>
                <p className="text-sm text-gray-600">Cuenta: {account}</p>
              </div>
            )}
          </div>
        );

      case 'avatar':
        return (
          <AvatarSelector 
            onAvatarSelected={handleAvatarSelected}
          />
        );

      case 'world':
        return (
          <MetaversoWorld3D 
            avatarUrl={userAvatar?.model || ''}
            walletAddress={account || ''}
            onOpenSceneManager={() => {}}
          />
        );

      default:
        return <Navigate to="/" replace />;
    }
  };

  // Manejo de errores
  if (appState.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{appState.error}</p>
          <button
            onClick={() => setAppState(prev => ({ ...prev, error: null, currentStep: 'loading' }))}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Routes>
          <Route path="/" element={renderCurrentStep()} />
          <Route path="/world" element={
            canProceedToWorld ? (
              <MetaversoWorld3D 
                avatarUrl={userAvatar?.model || ''}
                walletAddress={account || ''}
                onOpenSceneManager={() => {}}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
};

// Componente principal con providers
const MetaversoApp: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Web3Provider>
        <MetaversoProvider>
          <MetaversoAppContent />
        </MetaversoProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
};

export default MetaversoApp; 