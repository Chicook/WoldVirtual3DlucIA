import React from 'react';
import ReactDOM from 'react-dom';
import { centralCoordinator } from './core/CentralModuleCoordinator';
import { messageBus } from './core/InterModuleMessageBus';
import MainAppComponent from './components/MainAppComponent';

// Generar ID de usuario temporal
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Función de inicialización principal
const initializeApp = async () => {
  try {
    console.log('[App] Inicializando WoldVirtual3DlucIA...');
    
    const userId = generateUserId();
    console.log(`[App] Usuario asignado: ${userId}`);
    
    // Cargar módulo web principal
    const webModule = await centralCoordinator.loadModule('web', userId);
    
    if (!webModule) {
      throw new Error('No se pudo cargar el módulo web');
    }
    
    // Renderizar aplicación principal
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Elemento root no encontrado');
    }
    
    ReactDOM.render(
      React.createElement(MainAppComponent, { userId }),
      rootElement
    );
    
    console.log('[App] Aplicación inicializada correctamente');
    
    // Publicar evento de inicialización completa
    messageBus.publish('app-initialized', { userId });
    
  } catch (error) {
    console.error('[App] Error inicializando aplicación:', error);
    
    // Mostrar pantalla de error
    const rootElement = document.getElementById('root');
    if (rootElement) {
      ReactDOM.render(
        React.createElement('div', { className: 'error-screen' },
          React.createElement('h1', null, 'Error de Inicialización'),
          React.createElement('p', null, 'No se pudo inicializar la aplicación'),
          React.createElement('button', { 
            onClick: () => window.location.reload() 
          }, 'Reintentar')
        ),
        rootElement
      );
    }
  }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Exportar para uso global
(window as any).WoldVirtualApp = {
  centralCoordinator,
  messageBus,
  initializeApp
}; 