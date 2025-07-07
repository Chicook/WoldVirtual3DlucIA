<<<<<<< HEAD


import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { MetaversoProvider } from './contexts/MetaversoContext';
import { Web3Provider } from './contexts/Web3Context';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorFallback } from './components/ui/ErrorFallback';

// Lazy loading de componentes principales
const MetaversoApp = lazy(() => import('./components/MetaversoApp'));
// AvatarCreator import removed - not used in current implementation

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Web3Provider>
        <MetaversoProvider>
          <div className="metaverso-app">
            <Suspense fallback={<LoadingScreen />}>
              <MetaversoApp />
            </Suspense>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid #3b82f6'
=======
<<<<<<< HEAD
import React, { useState } from 'react';
import GlobalLayout from './layouts/GlobalLayout';
import AvatarCreatorReal from './components/avatar/AvatarCreatorReal';
import MetamaskValidator from './components/MetamaskValidator';
import MetaversoWorld3D from './components/MetaversoWorld3D';
import IslandSelection3D from './components/IslandSelection3D';
import SceneManager from './components/SceneManager';
import './styles/metaverso.css';

const SUBDOMAIN = import.meta.env.VITE_RPM_SUBDOMAIN || 'demo';

type AppStep = 'avatar-creator' | 'metamask-validation' | 'island-selection' | 'metaverso' | 'scene-manager';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('avatar-creator');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleAvatarExported = (url: string) => {
    setAvatarUrl(url);
    setCurrentStep('metamask-validation');
  };

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    setCurrentStep('island-selection');
  };

  const handleBackToAvatar = () => {
    setCurrentStep('avatar-creator');
  };

  const handleEnterIsland = () => {
    setCurrentStep('metaverso');
  };

  const handleOpenSceneManager = () => {
    setCurrentStep('scene-manager');
  };

  const handleBackToMetaverso = () => {
    setCurrentStep('metaverso');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'avatar-creator':
        return (
          <AvatarCreatorReal
            subdomain={SUBDOMAIN}
            isOpen={true}
            onClose={() => {}}
            onAvatarExported={handleAvatarExported}
          />
        );
      case 'metamask-validation':
        return (
          <MetamaskValidator
            onWalletConnected={handleWalletConnected}
            onBack={handleBackToAvatar}
          />
        );
      case 'island-selection':
        return (
          <IslandSelection3D onSelectIsland={handleEnterIsland} />
        );
      case 'scene-manager':
        return (
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleBackToMetaverso}
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: '#333',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ← Volver al Metaverso
            </button>
            <SceneManager 
              onSceneSelect={(scene) => {
                console.log('Escena seleccionada:', scene);
              }}
              onLoadScene={(sceneId) => {
                console.log('Cargando escena:', sceneId);
                // Cargar escena en el metaverso
                if ((window as any).loadSceneInMetaverso) {
                  (window as any).loadSceneInMetaverso(sceneId);
                  handleBackToMetaverso(); // Volver al metaverso después de cargar
>>>>>>> ReactVite
                }
              }}
            />
          </div>
<<<<<<< HEAD
        </MetaversoProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
};

export default App;

=======
        );
      case 'metaverso':
        if (!avatarUrl || !walletAddress) {
          return (
            <div className="metaverso-loading">
              <h2>Error de carga</h2>
              <p>Faltan datos necesarios para cargar el metaverso.</p>
              <button 
                onClick={() => setCurrentStep('avatar-creator')}
                className="btn btn-primary"
              >
                Volver al inicio
              </button>
            </div>
          );
        }
        return (
          <MetaversoWorld3D
            avatarUrl={avatarUrl}
            walletAddress={walletAddress}
            onOpenSceneManager={handleOpenSceneManager}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GlobalLayout>
      {renderCurrentStep()}
    </GlobalLayout>
  );
};

export default App; 
=======
>>>>>>> ReactVite
import { useEffect, useState } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { useMetaverso } from '@/contexts/MetaversoContext'
import PlantillaMetaverso from '@/components/PlantillaMetaverso'
import MetaversoWorld from '@/components/MetaversoWorld'
import WalletSelectModal from '@/components/WalletSelectModal'
import AvatarSelection from '@/components/AvatarSelection'
import HomePage from '@/components/HomePage'

function App() {
  const { isConnected, connect, isConnecting, error, disconnect, signMessage } = useWeb3()
  const { isInitialized, initializeMetaverso, joinWorld } = useMetaverso()
  const [pantalla, setPantalla] = useState<'inicio' | 'login' | 'avatar-selection' | 'metaverso'>('inicio')
  const [localError, setLocalError] = useState<string | null>(null)
  const [avisoManual, setAvisoManual] = useState<string | null>(null)
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [selectedAvatarData, setSelectedAvatarData] = useState<any>(null)

  useEffect(() => {
    if (isConnected && pantalla === 'login') {
      setPantalla('avatar-selection')
    }
    if (isConnected && selectedAvatarData && !isInitialized) {
      initializeMetaverso()
    }
    if (pantalla === 'metaverso' && !isConnected) {
      setPantalla('inicio')
      setAvisoManual('Has desconectado o cambiado de cuenta desde MetaMask. Vuelve a conectar tu wallet para continuar.')
    }
  }, [isConnected, isInitialized, initializeMetaverso, pantalla, selectedAvatarData])

  // Limpieza total de storage al cerrar sesión
  const handleLogout = () => {
    disconnect()
    setPantalla('inicio')
    setSelectedAvatarData(null)
    localStorage.clear()
    sessionStorage.clear()
  }

  // Lógica para conectar y pedir firma
  const handleMetaMaskConnect = async () => {
    setLocalError(null)
    setAvisoManual(null)
    setShowWalletMenu(false)
    try {
      await connect()
      setIsSigning(true)
      // Pedir siempre la firma, aunque ya esté conectada
      await signMessage('Confirma tu sesión en el Metaverso')
      setIsSigning(false)
    } catch (err: any) {
      setLocalError(err?.message || 'Error al conectar o firmar con MetaMask')
      setIsSigning(false)
    }
  }

  // Manejar selección de avatar
  const handleAvatarSelected = async (_avatarType: 'male' | 'female', avatarData: any) => {
    setSelectedAvatarData(avatarData)
    // 1. Inicializar metaverso
    await initializeMetaverso()
    // 2. Unirse al mundo por defecto
    await joinWorld('default-world')
    // 3. Mostrar el entorno 3D
    setPantalla('metaverso')
    // 4. Guardar datos del avatar
    localStorage.setItem('selectedAvatar', JSON.stringify(avatarData))
  }

  // Manejar inicio de aventura desde HomePage
  const handleStartJourney = () => {
    setPantalla('login')
  }

  // Renderiza el contenido dentro del marco blanco
  const renderContenido = () => {
    if (pantalla === 'inicio') {
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <HomePage onStartJourney={handleStartJourney} />
        </div>
      )
    }
    
    if (pantalla === 'login') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 24, marginBottom: 24, fontWeight: 700 }}>Conecta tu wallet</h2>
          <button
            style={{ fontSize: 20, padding: '1rem 2.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}
            onClick={() => setShowWalletMenu(true)}
            disabled={isConnecting || isSigning}
          >
            {isConnecting || isSigning ? (isSigning ? 'Firmando...' : 'Conectando...') : 'Conectar wallet'}
          </button>
          <div style={{ color: '#64748b', marginTop: 18, fontSize: 15, textAlign: 'center', maxWidth: 340 }}>
            Si MetaMask no te pide seleccionar cuenta, desconéctalo manualmente desde la extensión (icono de MetaMask en tu navegador).
          </div>
          {(error || localError) && (
            <div style={{ color: '#ef4444', marginTop: 20, fontWeight: 500, background: '#fee2e2', borderRadius: 8, padding: '0.75rem 1.5rem' }}>
              {error || localError}
            </div>
          )}
          {avisoManual && (
            <div style={{ color: '#f59e42', marginTop: 18, fontWeight: 600, background: '#fff7ed', borderRadius: 8, padding: '0.75rem 1.5rem', border: '1px solid #fbbf24' }}>
              {avisoManual}
            </div>
          )}
          <WalletSelectModal
            open={showWalletMenu}
            onClose={() => setShowWalletMenu(false)}
            onSelectMetaMask={handleMetaMaskConnect}
          />
        </div>
      )
    }

    if (pantalla === 'avatar-selection' && isConnected) {
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <AvatarSelection onAvatarSelected={handleAvatarSelected} />
        </div>
      )
    }
    
    if (pantalla === 'metaverso' && isConnected && selectedAvatarData) {
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <MetaversoWorld selectedAvatar={selectedAvatarData} />
        </div>
      )
    }
    
    // fallback
    return null
  }

  return (
    <PlantillaMetaverso
      onRedBlockchain={() => setPantalla('login')}
      onLogout={pantalla === 'metaverso' && isConnected ? handleLogout : undefined}
      showLogout={pantalla === 'metaverso' && isConnected}
    >
      {renderContenido()}
    </PlantillaMetaverso>
  )
}

export default App 
<<<<<<< HEAD

import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { MetaversoProvider } from './contexts/MetaversoContext';
import { Web3Provider } from './contexts/Web3Context';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorFallback } from './components/ui/ErrorFallback';

// Lazy loading de componentes principales
const MetaversoApp = lazy(() => import('./components/MetaversoApp'));
// AvatarCreator import removed - not used in current implementation

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Web3Provider>
        <MetaversoProvider>
          <div className="metaverso-app">
            <Suspense fallback={<LoadingScreen />}>
              <MetaversoApp />
            </Suspense>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid #3b82f6'
                }
              }}
            />
          </div>
        </MetaversoProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
};

export default App;

=======
>>>>>>> MetaversoCryptoWoldVirtual
>>>>>>> ReactVite
