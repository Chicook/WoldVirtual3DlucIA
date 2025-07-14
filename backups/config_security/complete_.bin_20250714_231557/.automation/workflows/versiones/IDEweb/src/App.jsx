import React, { useState } from 'react';
import Editor from './components/Editor';
import WorkflowList from './components/WorkflowList';
import VersionList from './components/VersionList';
import VersionDiff from './components/VersionDiff';
import RestoreButton from './components/RestoreButton';
import DevelopmentPanel from './components/DevelopmentPanel';
import './styles.css';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [showDevelopmentPanel, setShowDevelopmentPanel] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
  };

  const handleWorkflowSelect = (workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedVersion(null);
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
  };

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      <header className="app-header">
        <h1>IDEweb Metaverso Workflows</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowDevelopmentPanel(!showDevelopmentPanel)}
            style={{ 
              background: showDevelopmentPanel ? '#4CAF50' : '#2196F3',
              padding: '8px 16px',
              fontSize: '14px'
            }}
          >
            {showDevelopmentPanel ? 'Ocultar' : 'Mostrar'} Panel de Desarrollo
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {showDevelopmentPanel && (
        <DevelopmentPanel />
      )}

      <main className="app-main">
        <aside className="sidebar">
          <WorkflowList 
            onWorkflowSelect={setSelectedWorkflow}
            selectedWorkflow={selectedWorkflow}
          />
          {selectedWorkflow && (
            <VersionList 
              workflowName={selectedWorkflow}
              onVersionSelect={setSelectedVersion}
              selectedVersion={selectedVersion}
            />
          )}
        </aside>

        <div className="editor-container">
          {selectedWorkflow && selectedVersion ? (
            <>
              <div className="editor-header">
                <h3>Editor: {selectedWorkflow} - {selectedVersion}</h3>
                <div className="editor-actions">
                  <button 
                    className="diff-toggle"
                    onClick={() => setShowDiff(!showDiff)}
                  >
                    {showDiff ? 'Ocultar' : 'Mostrar'} Diferencias
                  </button>
                  <RestoreButton 
                    workflowName={selectedWorkflow}
                    versionName={selectedVersion}
                  />
                </div>
              </div>
              {showDiff ? (
                <VersionDiff 
                  workflowName={selectedWorkflow}
                  versionName={selectedVersion}
                />
              ) : (
                <Editor 
                  workflowName={selectedWorkflow}
                  versionName={selectedVersion}
                />
              )}
            </>
          ) : (
            <div className="welcome-message">
              <h2>Bienvenido a IDEweb</h2>
              <p>Selecciona un workflow y una versión para comenzar a editar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 