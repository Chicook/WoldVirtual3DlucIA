import React, { useState } from 'react';
import { versionApi } from '../api/versionApi';

const RestoreButton = ({ workflow, version }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRestore = async () => {
    if (!workflow || !version) {
      setMessage('Error: Workflow y versión son requeridos');
      return;
    }

    const confirmRestore = window.confirm(
      `¿Estás seguro de que quieres restaurar la versión ${version} del workflow ${workflow}?\n\n` +
      'Esto sobrescribirá la versión actual y se creará un backup automático.'
    );

    if (!confirmRestore) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const result = await versionApi.restoreVersion(workflow, version);
      
      if (result.success) {
        setMessage('✅ ' + result.message);
        // Opcional: recargar la página o actualizar el estado
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('❌ Error al restaurar: ' + result.message);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restore-button-container">
      <button
        onClick={handleRestore}
        disabled={loading || !workflow || !version}
        className="restore-btn"
        title={`Restaurar versión ${version}`}
      >
        {loading ? '🔄 Restaurando...' : '🔄 Restaurar'}
      </button>
      
      {message && (
        <div className={`restore-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default RestoreButton; 