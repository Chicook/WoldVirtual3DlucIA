import React, { useState, useEffect } from 'react';
import { editorCommunication, EditorMessage, MetaversoScene } from '../services/EditorCommunication';
// sceneLoader import removed - not used in current implementation

interface SceneManagerProps {
  onSceneSelect?: (scene: MetaversoScene) => void;
  onLoadScene?: (sceneId: string) => void;
}

const SceneManager: React.FC<SceneManagerProps> = ({ onSceneSelect, onLoadScene }) => {
  const [scenes, setScenes] = useState<{ id: string; name: string; created: string }[]>([]);
  const [selectedScene, setSelectedScene] = useState<MetaversoScene | null>(null);
  const [isEditorConnected, setIsEditorConnected] = useState(false);

  useEffect(() => {
    loadScenes();
    
    const cleanup = editorCommunication.listenForEditorMessages((message: EditorMessage) => {
      if (message.type === 'scene-published' && message.scene) {
        loadScenes();
        editorCommunication.sendResponseToEditor({
          type: 'scene-received',
          success: true,
          message: 'Escena recibida correctamente'
        });
      } else if (message.type === 'connection-test') {
        editorCommunication.sendResponseToEditor({
          type: 'connection-test-response',
          success: true,
          message: 'Cliente del metaverso conectado'
        });
      }
    });

    const checkConnection = () => {
      setIsEditorConnected(editorCommunication.isEditorConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const loadScenes = () => {
    setScenes(editorCommunication.listScenes());
  };

  const handleSceneSelect = (sceneId: string) => {
    const scene = editorCommunication.getScene(sceneId);
    if (scene) {
      setSelectedScene(scene);
      onSceneSelect?.(scene);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff' }}>
      <h2>Gestor de Escenas del Editor</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <span>Editor: {isEditorConnected ? '🟢 Conectado' : '🔴 Desconectado'}</span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Escenas Disponibles ({scenes.length})</h3>
        {scenes.length === 0 ? (
          <p>No hay escenas disponibles. Publica una desde el editor.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scenes.map(scene => (
              <div 
                key={scene.id} 
                onClick={() => handleSceneSelect(scene.id)}
                style={{
                  background: selectedScene?.id === scene.id ? '#007acc' : '#252525',
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{scene.name}</div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>
                  {new Date(scene.created).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedScene && (
        <div style={{ background: '#252525', padding: '15px', borderRadius: '8px' }}>
          <h4>Detalles: {selectedScene.name}</h4>
          <p><strong>Objetos:</strong> {selectedScene.objects.length}</p>
          <p><strong>Autor:</strong> {selectedScene.metadata.author || 'Anónimo'}</p>
          <p><strong>Versión:</strong> {selectedScene.metadata.version}</p>
          <button
            onClick={() => {
              if (selectedScene && onLoadScene) {
                onLoadScene(selectedScene.id || '');
              } else {
                alert('Cargando escena en el metaverso...');
              }
            }}
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🚀 Cargar en Metaverso
          </button>
        </div>
      )}
    </div>
  );
};

export default SceneManager; 