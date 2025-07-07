import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { metaversoAPI, MetaversoScene } from '../services/MetaversoAPI';
import { useNotification } from '../contexts/NotificationContext';

const PublishPanel: React.FC = () => {
  const { state } = useEditor();
  const { showNotification } = useNotification();
  const [isPublishing, setIsPublishing] = useState(false);
  const [sceneName, setSceneName] = useState('Mi Escena del Metaverso');
  const [sceneDescription, setSceneDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePublish = async () => {
    if (state.sceneObjects.length === 0) {
      showNotification('No hay objetos en la escena para publicar', 'warning');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Convertir escena al formato del metaverso
      const metaversoScene = metaversoAPI.convertToMetaversoFormat(
        state.sceneObjects,
        sceneName,
        sceneDescription
      );

      // Publicar escena
      const response = await metaversoAPI.publishScene(metaversoScene);
      
      if (response.success) {
        showNotification(
          `¡Escena publicada! ID: ${response.sceneId}`, 
          'success'
        );
        
        // Mostrar información adicional
        console.log('Escena publicada:', {
          sceneId: response.sceneId,
          url: response.url,
          objectCount: state.sceneObjects.length
        });
        
        // Opcional: abrir en nueva pestaña
        if (response.url) {
          window.open(response.url, '_blank');
        }
      } else {
        showNotification(response.message, 'error');
      }
    } catch (error) {
      console.error('Error al publicar:', error);
      showNotification('Error inesperado al publicar la escena', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExport = () => {
    if (state.sceneObjects.length === 0) {
      showNotification('No hay objetos en la escena para exportar', 'warning');
      return;
    }

    try {
      const metaversoScene = metaversoAPI.convertToMetaversoFormat(
        state.sceneObjects,
        sceneName,
        sceneDescription
      );
      
      const sceneJson = metaversoAPI.exportScene(metaversoScene);
      const blob = new Blob([sceneJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sceneName.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('Escena exportada correctamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      showNotification('Error al exportar la escena', 'error');
    }
  };

  const handleTestConnection = async () => {
    try {
      const info = await metaversoAPI.getMetaversoInfo();
      if (info) {
        showNotification(
          `Metaverso conectado - Versión: ${info.version}`, 
          'success'
        );
      } else {
        showNotification('No se pudo conectar con el metaverso', 'warning');
      }
    } catch (error) {
      showNotification('Error al conectar con el metaverso', 'error');
    }
  };

  return (
    <div style={{ 
      flex: 1,
      background: '#1a1a1a',
      borderTop: '1px solid #333',
      padding: '16px'
    }}>
      <div style={{ 
        padding: '12px', 
        borderBottom: '1px solid #333',
        background: '#252525',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#fff',
          fontWeight: 'bold'
        }}>
          Publicar en Metaverso
        </h3>
        <div style={{ 
          fontSize: '11px', 
          color: '#666',
          marginTop: '4px'
        }}>
          Conecta tu escena con el mundo virtual
        </div>
      </div>

      {/* Información de la escena */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#ccc',
          marginBottom: '8px'
        }}>
          Información de la Escena
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: '#ccc',
            display: 'block',
            marginBottom: '4px'
          }}>
            Nombre de la Escena
          </label>
          <input
            type="text"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#333',
              border: '1px solid #555',
              color: '#fff',
              fontSize: '11px',
              borderRadius: '4px'
            }}
            placeholder="Nombre de tu escena"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ 
            fontSize: '11px', 
            color: '#ccc',
            display: 'block',
            marginBottom: '4px'
          }}>
            Descripción (opcional)
          </label>
          <textarea
            value={sceneDescription}
            onChange={(e) => setSceneDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#333',
              border: '1px solid #555',
              color: '#fff',
              fontSize: '11px',
              borderRadius: '4px',
              minHeight: '60px',
              resize: 'vertical'
            }}
            placeholder="Describe tu escena..."
          />
        </div>

        <div style={{ 
          fontSize: '10px', 
          color: '#666',
          marginTop: '8px'
        }}>
          Objetos en la escena: {state.sceneObjects.length}
        </div>
      </div>

      {/* Controles de publicación */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={handlePublish}
            disabled={isPublishing || state.sceneObjects.length === 0}
            style={{
              flex: 1,
              padding: '10px',
              background: isPublishing || state.sceneObjects.length === 0 ? '#666' : '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isPublishing || state.sceneObjects.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {isPublishing ? 'Publicando...' : '🚀 Publicar en Metaverso'}
          </button>
          
          <button
            onClick={handleExport}
            disabled={state.sceneObjects.length === 0}
            style={{
              padding: '10px 16px',
              background: state.sceneObjects.length === 0 ? '#666' : '#17a2b8',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: state.sceneObjects.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            📁 Exportar
          </button>
        </div>

        <button
          onClick={handleTestConnection}
          style={{
            width: '100%',
            padding: '6px',
            background: '#333',
            color: '#ccc',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔗 Probar Conexión
        </button>
      </div>

      {/* Configuración avanzada */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#333',
            color: '#ccc',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Configuración Avanzada</span>
          <span>{showAdvanced ? '▼' : '▶'}</span>
        </button>

        {showAdvanced && (
          <div style={{ 
            marginTop: '8px',
            padding: '8px',
            background: '#252525',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ccc'
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Punto de Spawn:</strong> (0, 1, 0)
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Skybox:</strong> Default
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Iluminación:</strong> Ambient + Directional
            </div>
            <div>
              <strong>Formato:</strong> Metaverso Scene v1.0
            </div>
          </div>
        )}
      </div>

      {/* Estado de conexión */}
      <div style={{ 
        padding: '8px',
        background: '#252525',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Editor:</strong> Conectado (Puerto 5173)
        </div>
        <div>
          <strong>Metaverso:</strong> Conectado (Puerto 3000)
        </div>
      </div>
    </div>
  );
};

export default PublishPanel; 