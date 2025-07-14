import { useState, useEffect } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';
import { centralCoordinator } from '../core/CentralModuleCoordinator';

interface MainAppProps {
  userId?: string;
}

const MainAppComponent = ({ userId }: MainAppProps) => {
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [moduleStatus, setModuleStatus] = useState<Record<string, any>>({});
  const [currentView, setCurrentView] = useState<string>('dashboard');

  useEffect(() => {
    // Cargar módulos iniciales
    loadInitialModules();
    
    // Suscribirse a eventos de módulos
    messageBus.subscribe('module-status-update', (status: any) => {
      setModuleStatus(prev => ({ ...prev, ...status }));
    });
    
    // Actualizar módulos activos
    if (userId) {
      const userModules = centralCoordinator.getUserActiveModules(userId);
      setActiveModules(userModules);
    }
  }, [userId]);

  const loadInitialModules = async () => {
    if (!userId) return;
    
    try {
      // Cargar módulos core
      await centralCoordinator.loadModuleGroup('CORE', userId);
      
      // Cargar módulos frontend
      await centralCoordinator.loadModuleGroup('FRONTEND', userId);
      
      // Actualizar estado
      const status = centralCoordinator.getAllModulesStatus();
      setModuleStatus(status);
      
    } catch (error) {
      console.error('Error cargando módulos iniciales:', error);
    }
  };

  const loadModuleGroup = async (groupName: string) => {
    if (!userId) return;
    
    try {
      await centralCoordinator.loadModuleGroup(groupName as any, userId);
      const userModules = centralCoordinator.getUserActiveModules(userId);
      setActiveModules(userModules);
    } catch (error) {
      console.error(`Error cargando grupo ${groupName}:`, error);
    }
  };

  const loadComponent = (componentName: string, targetId: string) => {
    messageBus.publish('load-component', {
      componentName,
      props: { userId },
      targetId
    });
  };

  return (
    <div className="main-app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>WoldVirtual3DlucIA</h1>
          <div className="user-info">
            <span>Usuario: {userId || 'Anónimo'}</span>
            <span>Módulos activos: {activeModules.length}</span>
          </div>
        </div>
        
        <nav className="main-navigation">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={currentView === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('modules')}
            className={currentView === 'modules' ? 'active' : ''}
          >
            Módulos
          </button>
          <button 
            onClick={() => setCurrentView('editor')}
            className={currentView === 'editor' ? 'active' : ''}
          >
            Editor 3D
          </button>
          <button 
            onClick={() => setCurrentView('blockchain')}
            className={currentView === 'blockchain' ? 'active' : ''}
          >
            Blockchain
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <div className="dashboard-view">
            <h2>Dashboard del Sistema</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Módulos Activos</h3>
                <div className="module-list">
                  {activeModules.map(module => (
                    <div key={module} className="module-item">
                      <span className="module-name">{module}</span>
                      <span className={`module-status ${moduleStatus[module]?.status || 'unknown'}`}>
                        {moduleStatus[module]?.status || 'unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>Cargar Módulos</h3>
                <div className="module-groups">
                  <button onClick={() => loadModuleGroup('BLOCKCHAIN')}>
                    Cargar Blockchain
                  </button>
                  <button onClick={() => loadModuleGroup('AI')}>
                    Cargar IA
                  </button>
                  <button onClick={() => loadModuleGroup('UTILITIES')}>
                    Cargar Utilidades
                  </button>
                  <button onClick={() => loadModuleGroup('MEDIA')}>
                    Cargar Media
                  </button>
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>Componentes Rápidos</h3>
                <div className="quick-components">
                  <button onClick={() => loadComponent('Editor3D', 'dynamic-content')}>
                    Editor 3D
                  </button>
                  <button onClick={() => loadComponent('EngineBridge', 'dynamic-content')}>
                    Engine Bridge
                  </button>
                  <button onClick={() => loadComponent('BinaryTools', 'dynamic-content')}>
                    Herramientas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'modules' && (
          <div className="modules-view">
            <h2>Gestión de Módulos</h2>
            <div className="modules-grid">
              {Object.entries(moduleStatus).map(([moduleName, status]) => (
                <div key={moduleName} className="module-card">
                  <h3>{moduleName}</h3>
                  <div className="module-details">
                    <span className={`status ${status.status}`}>{status.status}</span>
                    <span className="last-activity">
                      {new Date(status.lastActivity).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'editor' && (
          <div className="editor-view">
            <h2>Editor 3D</h2>
            <div id="dynamic-content">
              <p>Cargando editor...</p>
            </div>
          </div>
        )}

        {currentView === 'blockchain' && (
          <div className="blockchain-view">
            <h2>Blockchain</h2>
            <div id="dynamic-content">
              <p>Cargando blockchain...</p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>WoldVirtual3DlucIA - Sistema Modular</span>
          <span>Módulos: {activeModules.length}</span>
          <span>Estado: Operativo</span>
        </div>
      </footer>
    </div>
  );
};

export default MainAppComponent; 