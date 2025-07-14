import React, { useState, useEffect } from 'react';
import { versionApi } from '../api/versionApi';

const WorkflowList = ({ onWorkflowSelect, selectedWorkflow }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await versionApi.getWorkflows();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar workflows: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowClick = (workflow) => {
    onWorkflowSelect(workflow);
  };

  if (loading) {
    return (
      <div className="workflow-list">
        <div className="workflow-list-header">
          <h3>Workflows</h3>
        </div>
        <div className="loading">Cargando workflows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-list">
        <div className="workflow-list-header">
          <h3>Workflows</h3>
          <button onClick={loadWorkflows} className="refresh-btn">🔄</button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="workflow-list">
      <div className="workflow-list-header">
        <h3>Workflows</h3>
        <button onClick={loadWorkflows} className="refresh-btn" title="Actualizar">🔄</button>
      </div>
      
      <div className="workflow-items">
        {workflows.map((workflow) => (
          <div
            key={workflow.name}
            className={`workflow-item ${selectedWorkflow?.name === workflow.name ? 'selected' : ''}`}
            onClick={() => handleWorkflowClick(workflow)}
          >
            <div className="workflow-name">{workflow.name}</div>
            <div className="workflow-description">{workflow.description}</div>
            <div className="workflow-meta">
              <span className="version-count">{workflow.versionCount} versiones</span>
            </div>
          </div>
        ))}
      </div>
      
      {workflows.length === 0 && (
        <div className="empty-state">
          <p>No hay workflows disponibles</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowList; 