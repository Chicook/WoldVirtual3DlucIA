import React from 'react';

const ProgressBar = ({ percentage, status, versionName }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completado':
        return '#4CAF50';
      case 'en_desarrollo':
        return '#2196F3';
      case 'pendiente':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_desarrollo':
        return 'En Desarrollo';
      case 'pendiente':
        return 'Pendiente';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="version-name">{versionName}</span>
        <span className="percentage">{percentage}%</span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getStatusColor(status)
          }}
        />
      </div>
      <div className="progress-status">
        <span className={`status-badge status-${status}`}>
          {getStatusText(status)}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar; 