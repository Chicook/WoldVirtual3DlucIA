import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import BinApp from './components/BinApp';
import { BinProvider } from './context/BinContext';
import { binSystem } from './core/BinSystem';

// Inicializar el sistema .bin
async function initializeBinSystem() {
  try {
    console.log('[App] Inicializando sistema .bin...');
    await binSystem.initialize();
    console.log('[App] Sistema .bin inicializado exitosamente');
  } catch (error) {
    console.error('[App] Error inicializando sistema .bin:', error);
    // Continuar con la aplicación aunque falle la inicialización
  }
}

// Función principal de inicialización
async function initializeApp() {
  // Inicializar sistema .bin
  await initializeBinSystem();

  // Renderizar la aplicación React
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <BinProvider>
        <BinApp />
      </BinProvider>
    </React.StrictMode>
  );
}

// Iniciar la aplicación
initializeApp().catch(error => {
  console.error('[App] Error crítico durante la inicialización:', error);
  
  // Mostrar mensaje de error en la página
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <h1>🚨 Error de Inicialización</h1>
        <p>El sistema .bin no pudo inicializarse correctamente.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <button 
          onclick="location.reload()" 
          style="
            margin-top: 20px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          Reintentar
        </button>
        <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
          <p>Consulte la consola del navegador para más detalles.</p>
        </div>
      </div>
    `;
  }
});

// Manejar cierre de la aplicación
window.addEventListener('beforeunload', async () => {
  try {
    await binSystem.shutdown();
  } catch (error) {
    console.error('[App] Error durante el cierre:', error);
  }
});

// Exportar para uso externo
export { binSystem }; 