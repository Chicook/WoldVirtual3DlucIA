import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

const DevelopmentPanel = () => {
  const [developmentData, setDevelopmentData] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');

  // Simulación de datos de desarrollo
  useEffect(() => {
    const mockDevelopmentData = [
      {
        workflowName: 'deployment-workflow',
        versions: [
          { name: 'v1.0.0', percentage: 100, status: 'completado' },
          { name: 'v1.1.0', percentage: 85, status: 'en_desarrollo' },
          { name: 'v1.2.0', percentage: 30, status: 'en_desarrollo' },
          { name: 'v2.0.0', percentage: 0, status: 'pendiente' }
        ]
      },
      {
        workflowName: 'security-audit-workflow',
        versions: [
          { name: 'v1.0.0', percentage: 100, status: 'completado' },
          { name: 'v1.5.0', percentage: 60, status: 'en_desarrollo' },
          { name: 'v2.0.0', percentage: 15, status: 'en_desarrollo' }
        ]
      },
      {
        workflowName: 'performance-monitoring-workflow',
        versions: [
          { name: 'v1.0.0', percentage: 100, status: 'completado' },
          { name: 'v1.2.0', percentage: 75, status: 'en_desarrollo' },
          { name: 'v1.3.0', percentage: 45, status: 'en_desarrollo' },
          { name: 'v1.4.0', percentage: 0, status: 'pendiente' }
        ]
      }
    ];

    setDevelopmentData(mockDevelopmentData);
    if (mockDevelopmentData.length > 0) {
      setSelectedWorkflow(mockDevelopmentData[0].workflowName);
    }
  }, []);

  const getOverallProgress = (versions) => {
    if (versions.length === 0) return 0;
    const total = versions.reduce((sum, version) => sum + version.percentage, 0);
    return Math.round(total / versions.length);
  };

  const getWorkflowStatus = (versions) => {
    const hasError = versions.some(v => v.status === 'error');
    const hasInProgress = versions.some(v => v.status === 'en_desarrollo');
    
    if (hasError) return 'error';
    if (hasInProgress) return 'en_desarrollo';
    return 'completado';
  };

  const selectedWorkflowData = developmentData.find(w => w.workflowName === selectedWorkflow);

  return (
    <div className="development-panel">
      <div className="development-header">
        <h3>Panel de Desarrollo de Versiones</h3>
        <div className="workflow-selector">
          <label htmlFor="workflow-select">Workflow:</label>
          <select 
            id="workflow-select"
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
          >
            {developmentData.map(workflow => (
              <option key={workflow.workflowName} value={workflow.workflowName}>
                {workflow.workflowName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedWorkflowData && (
        <div className="development-content">
          <div className="overall-progress">
            <h4>Progreso General del Workflow</h4>
            <ProgressBar 
              percentage={getOverallProgress(selectedWorkflowData.versions)}
              status={getWorkflowStatus(selectedWorkflowData.versions)}
              versionName="Progreso Total"
            />
          </div>

          <div className="versions-progress">
            <h4>Progreso por Versión</h4>
            <div className="versions-list">
              {selectedWorkflowData.versions.map((version, index) => (
                <div key={index} className="version-progress-item">
                  <ProgressBar 
                    percentage={version.percentage}
                    status={version.status}
                    versionName={version.name}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="development-stats">
            <h4>Estadísticas de Desarrollo</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Versiones Completadas:</span>
                <span className="stat-value">
                  {selectedWorkflowData.versions.filter(v => v.status === 'completado').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">En Desarrollo:</span>
                <span className="stat-value">
                  {selectedWorkflowData.versions.filter(v => v.status === 'en_desarrollo').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pendientes:</span>
                <span className="stat-value">
                  {selectedWorkflowData.versions.filter(v => v.status === 'pendiente').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total de Versiones:</span>
                <span className="stat-value">{selectedWorkflowData.versions.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentPanel; 