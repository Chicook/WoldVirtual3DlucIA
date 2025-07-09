import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { EditorProvider } from './contexts/EditorContext';
import { EngineProvider } from './contexts/EngineContext';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Viewport from './components/Viewport';
import ObjectPanel from './components/ObjectPanel';
import Inspector from './components/Inspector';
import AssetLibrary from './components/AssetLibrary';
import AvatarAnimator from './components/AvatarAnimator';
import PublishPanel from './components/PublishPanel';
import AdvancedToolsPanel from './components/AdvancedToolsPanel';
import AvatarRegistryComponent from './components/AvatarRegistry';
import MaterialPanel from './components/MaterialPanel';
import EngineStatus from './components/EngineStatus';
import EngineControls from './components/EngineControls';
import { LucIA } from './components/LucIA/LucIA';
import { BlockchainManager } from './core/blockchain/BlockchainManager';
import { BlockchainConfig } from './core/blockchain/types';
import './styles/EditorLayout.css';
import BinApp from '../../src/components/BinApp';
import './components/EditorUI.css';

const App: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [activeViewport, setActiveViewport] = useState<string>('3D');
  const [activeRightPanel, setActiveRightPanel] = useState<string>('inspector');
  const [showLucIA, setShowLucIA] = useState<boolean>(false);
  const [blockchainManager, setBlockchainManager] = useState<BlockchainManager | null>(null);
  const [isBlockchainReady, setIsBlockchainReady] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [engineStatusExpanded, setEngineStatusExpanded] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState(false);

  // Configuración blockchain
  const blockchainConfig: BlockchainConfig = {
    ethereum: {
      rpcUrl: 'https://mainnet.infura.io/v3/test',
      chainId: 1,
      networkName: 'Ethereum Mainnet',
      blockExplorer: 'https://etherscan.io',
      gasLimit: 21000,
      gasPrice: '20000000000',
      confirmations: 12
    },
    nft: {
      marketplaceAddress: '0x1234567890123456789012345678901234567890',
      royaltyPercentage: 2.5,
      maxSupply: 10000,
      mintPrice: '0.01',
      metadataBaseURI: 'ipfs://'
    },
    defi: {
      protocols: [],
      liquidityPools: [],
      yieldFarming: {
        farms: [],
        rewards: [],
        lockPeriod: 30,
        minStake: '100'
      },
      staking: {
        minStake: '100',
        lockPeriod: 30,
        earlyWithdrawalFee: 5,
        rewards: []
      }
    },
    governance: {
      tokenAddress: '0x1234567890123456789012345678901234567890',
      timelockAddress: '0x1234567890123456789012345678901234567890',
      governorAddress: '0x1234567890123456789012345678901234567890',
      proposalThreshold: '1000',
      votingPeriod: 45818,
      quorumVotes: '4000',
      executionDelay: 172800
    },
    bridges: {
      bridges: [],
      supportedChains: [],
      fees: []
    }
  };

  // Inicializar blockchain manager
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const manager = new BlockchainManager(blockchainConfig);
        await manager.initialize();
        setBlockchainManager(manager);
        setIsBlockchainReady(true);
        console.log('✅ Blockchain Manager inicializado en App');
      } catch (error) {
        console.error('❌ Error inicializando Blockchain Manager:', error);
      }
    };

    initBlockchain();
  }, []);

  const handleLucIAInteraction = (action: string, data: any) => {
    console.log('🤖 Interacción con LucIA:', action, data);
    
    // Integrar con blockchain si es necesario
    if (blockchainManager && action === 'nft_created') {
      console.log('🎨 NFT creado por LucIA, integrando con blockchain...');
    }
  };

  const handlePublish = async () => {
    setActiveRightPanel('publish');
    setIsPublishing(true);
    try {
      // Lógica de publicación aquí
      console.log('🚀 Iniciando publicación de escena...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación
      console.log('✅ Escena publicada exitosamente');
    } catch (error) {
      console.error('❌ Error en publicación:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <NotificationProvider>
      <EditorProvider>
        <EngineProvider>
          <div className="editor-container">
            {/* Nuevo Header modular */}
            <Header onPublish={handlePublish} isPublishing={isPublishing} />
            {/* Nueva Toolbar modular */}
            <Toolbar />
            {/* Main Content Area */}
            <main className="editor-main">
              {/* Left Panel - Scene Hierarchy */}
              <aside className="left-panel">
                <div className="panel-header">
                  <h3>Jerarquía de Escena</h3>
                  <div className="panel-actions">
                    <button className="panel-action-btn" title="Añadir objeto">+</button>
                    <button className="panel-action-btn" title="Eliminar objeto">-</button>
                  </div>
                </div>
                <div className="panel-content">
                  <ObjectPanel />
                </div>
              </aside>
              
              {/* Center - Viewport Area */}
              <section className="viewport-section">
                {/* Viewport Navigation */}
                <nav className="viewport-nav">
                  <div className="viewport-tabs">
                    <button 
                      className={`viewport-tab ${activeViewport === '3D' ? 'active' : ''}`}
                      onClick={() => setActiveViewport('3D')}
                    >
                      <span className="tab-icon">🎯</span>
                      Vista 3D
                    </button>
                    <button 
                      className={`viewport-tab ${activeViewport === 'UV' ? 'active' : ''}`}
                      onClick={() => setActiveViewport('UV')}
                    >
                      <span className="tab-icon">📐</span>
                      Editor UV
                    </button>
                    <button 
                      className={`viewport-tab ${activeViewport === 'Shader' ? 'active' : ''}`}
                      onClick={() => setActiveViewport('Shader')}
                    >
                      <span className="tab-icon">✨</span>
                      Editor Shader
                    </button>
                  </div>
                  
                  <div className="viewport-controls">
                    <button className="viewport-control-btn" title="Perspectiva">
                      <span className="control-icon">👁️</span>
                    </button>
                    <button className="viewport-control-btn" title="Ortográfica">
                      <span className="control-icon">📐</span>
                    </button>
                    <button className="viewport-control-btn" title="Frame seleccionado">
                      <span className="control-icon">🎯</span>
                    </button>
                    <button className="viewport-control-btn" title="Frame todo">
                      <span className="control-icon">🌍</span>
                    </button>
                  </div>
                </nav>

                {/* Viewport Content */}
                <div className="viewport-content">
                  <Viewport viewportType={activeViewport} />
                  
                  {/* Engine Status Overlay */}
                  <div className="engine-status-overlay">
                    <EngineStatus 
                      expanded={engineStatusExpanded}
                      onToggleExpanded={setEngineStatusExpanded}
                    />
                  </div>
                  
                  {/* Engine Controls Overlay */}
                  <div className="engine-controls-overlay">
                    <EngineControls />
                  </div>
                </div>
              </section>
              
              {/* Right Panel - Inspector/Properties */}
              <aside className="right-panel">
                <div className="panel-header">
                  <div className="panel-tabs">
                    <button 
                      className={`panel-tab ${activeRightPanel === 'inspector' ? 'active' : ''}`}
                      onClick={() => setActiveRightPanel('inspector')}
                    >
                      <span className="tab-icon">🔍</span>
                      Inspector
                    </button>
                    <button 
                      className={`panel-tab ${activeRightPanel === 'materials' ? 'active' : ''}`}
                      onClick={() => setActiveRightPanel('materials')}
                    >
                      <span className="tab-icon">🎨</span>
                      Materiales
                    </button>
                    <button 
                      className={`panel-tab ${activeRightPanel === 'assets' ? 'active' : ''}`}
                      onClick={() => setActiveRightPanel('assets')}
                    >
                      <span className="tab-icon">📁</span>
                      Assets
                    </button>
                    <button 
                      className={`panel-tab ${activeRightPanel === 'avatars' ? 'active' : ''}`}
                      onClick={() => setActiveRightPanel('avatars')}
                    >
                      <span className="tab-icon">👤</span>
                      Avatares
                    </button>
                    <button 
                      className={`panel-tab ${activeRightPanel === 'tools' ? 'active' : ''}`}
                      onClick={() => setActiveRightPanel('tools')}
                    >
                      <span className="tab-icon">🛠️</span>
                      Herramientas
                    </button>
                    <button 
                      className={`panel-tab ${activeRightPanel === 'publish' ? 'active' : ''}`}
                      onClick={() => setActiveRightPanel('publish')}
                    >
                      <span className="tab-icon">🚀</span>
                      Publicar
                    </button>
                  </div>
                </div>
                
                <div className="panel-content">
                  {activeRightPanel === 'inspector' && (
                    <Inspector />
                  )}
                  {activeRightPanel === 'materials' && (
                    <MaterialPanel />
                  )}
                  {activeRightPanel === 'assets' && (
                    <AssetLibrary />
                  )}
                  {activeRightPanel === 'avatars' && (
                    <div className="avatar-panel">
                      <AvatarAnimator />
                      <AvatarRegistryComponent />
                    </div>
                  )}
                  {activeRightPanel === 'tools' && (
                    <AdvancedToolsPanel />
                  )}
                  {activeRightPanel === 'publish' && (
                    <PublishPanel />
                  )}
                </div>
              </aside>
            </main>

            {/* Bottom Panel - Timeline/Animation */}
            <footer className="editor-footer">
              <div className="footer-header">
                <h3>Timeline & Animación</h3>
                <div className="footer-controls">
                  <button className="footer-control-btn" title="Play">
                    <span className="control-icon">▶️</span>
                  </button>
                  <button className="footer-control-btn" title="Pause">
                    <span className="control-icon">⏸️</span>
                  </button>
                  <button className="footer-control-btn" title="Stop">
                    <span className="control-icon">⏹️</span>
                  </button>
                  <button className="footer-control-btn" title="Record">
                    <span className="control-icon">🔴</span>
                  </button>
                </div>
              </div>
              <div className="footer-content">
                {/* Timeline content */}
                <div className="timeline-container">
                  <div className="timeline-ruler">
                    {/* Timeline ruler content */}
                  </div>
                  <div className="timeline-tracks">
                    {/* Timeline tracks content */}
                  </div>
                </div>
              </div>
            </footer>

            {/* LucIA Assistant */}
            {showLucIA && (
              <div className="lucia-overlay">
                <LucIA 
                  position={[0,0,0]}
                  scale={1}
                  onInteraction={handleLucIAInteraction}
                />
              </div>
            )}

            {/* LucIA Toggle Button */}
            <button 
              className="lucia-toggle-btn"
              onClick={() => setShowLucIA(!showLucIA)}
              title="LucIA Assistant"
            >
              <span className="lucia-icon">🤖</span>
            </button>

            {/* Eliminar el botón flotante y el overlay/modal del menú del sistema .bin */}
            {/*
            <button 
              className="bin-menu-btn"
              onClick={() => setShowMenu(true)}
              title="Abrir menú del sistema"
              style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 2000,
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                boxShadow: '0 2px 8px #0003',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                cursor: 'pointer',
              }}
            >
              <span role="img" aria-label="menu">🛠️</span>
            </button>

            {showMenu && (
              <div 
                className="bin-menu-overlay"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 2100,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
                onClick={() => setShowMenu(false)}
              >
                <div 
                  className="bin-menu-panel"
                  style={{
                    marginTop: 40,
                    background: '#23243a',
                    borderRadius: 16,
                    boxShadow: '0 4px 32px #0008',
                    padding: 32,
                    minWidth: 420,
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowMenu(false)}
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 24,
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: 28,
                      cursor: 'pointer',
                    }}
                    title="Cerrar menú"
                  >✖️</button>
                  <BinApp />
                </div>
              </div>
            )}
            */}
          </div>
        </EngineProvider>
      </EditorProvider>
    </NotificationProvider>
  );
};

export default App;
